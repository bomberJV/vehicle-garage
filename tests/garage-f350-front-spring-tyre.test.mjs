import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getAssembly,getComponent} from '../garage/assemblies.js';
import {VEHICLES,PARTS} from '../garage/catalog.js';

function scene(inspection={},options={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle:'f350'}),inspection,
    partPositions:new Map(),lights:true,schematic:true,progress:0,...options});
  r.buildMesh();
  return r;
}
const center=faces=>{const p=faces.flatMap(f=>f.points);return [0,1,2].map(i=>p.reduce((a,q)=>a+q[i],0)/p.length);};
// LT235/85R16: 16-inch rim plus two 85 % sidewalls of a 235 mm section.
const LT235_85R16_RADIUS=(16*25.4+2*.85*235)/2000;

test('the F-350 names the LT235/85R16E standard tyre and still points to the door placard',()=>{
  assert.match(VEHICLES.f350.tire,/^LT235\/85R16E\b/);
  assert.match(VEHICLES.f350.tire,/placard/i);
  const tires=PARTS.find(p=>p.id==='f-tires');
  assert.deepEqual(tires.vehicles,['f350']);
  assert.match(tires.sku,/LT235\/85R16E/);
  assert.match(tires.fit,/LT235\/85R16 load range E/);
  assert.match(tires.fit,/placard/i);
  assert.doesNotMatch(tires.description+tires.fit,/no default tire size/i);
});

test('the drawn F-350 tyre is within 5 mm of the LT235/85R16 radius',()=>{
  const {faces}=scene();
  const tread=faces.filter(f=>f.part==='wheels.tire').flatMap(f=>f.points).filter(p=>p[0]<0&&p[1]>0);
  const radii=new Map();
  for(const p of tread){const d=Math.round(Math.hypot(p[0]+1.6891,p[2]-.445)*1000);radii.set(d,(radii.get(d)||0)+1);}
  const treadRadius=[...radii].sort((a,b)=>b[1]-a[1])[0][0]/1000;
  assert(Math.abs(treadRadius-LT235_85R16_RADIUS)<=.005,`drawn ${treadRadius} m vs ${LT235_85R16_RADIUS.toFixed(4)} m`);
});

test('the Twin I-Beam front is described and drawn with coil springs and radius arms',()=>{
  const steering=getAssembly('f350','steering'),suspension=getAssembly('f350','suspension');
  const text=[steering.description,suspension.description,...[...steering.parts,...suspension.parts].flatMap(p=>[p.name,p.description])].join(' ');
  assert.doesNotMatch(text,/not confirmed|front spring type|only seats are drawn/i);
  assert.match(getComponent('f350','steering.axle').description,/coil spring sits on each beam.*radius arm/);
  assert.match(suspension.description,/coil springs and radius arms/);
  assert.equal(getComponent('f350','suspension.spring').name,'Rear leaf springs');
  const ids=suspension.parts.map(p=>p.id);
  for(const id of ['suspension.front-springs','suspension.radius-arms']){
    assert(ids.includes(id),id);
    assert.match(getComponent('f350',id).source.url,/^https:\/\/www\.fordpartsgiant\.com\//);
  }
  assert.match(getComponent('f350','suspension.front-springs').description,/estimated/);
  assert.match(getComponent('f350','suspension.radius-arms').description,/estimated/);
  // Other vehicles do not gain the F-350 parts.
  assert(!getAssembly('g500','suspension').parts.some(p=>p.id==='suspension.front-springs'));

  const {faces}=scene();
  for(const id of ['suspension.front-springs','suspension.radius-arms'])for(const side of [-1,1]){
    const own=faces.filter(f=>f.part===id&&f.points.every(p=>Math.sign(p[1])===side));
    assert(own.length>20,`${id} drawn on side ${side}`);
    const [cx]=center(own);
    assert(cx<-.8&&cx>-1.8,`${id} sits at the front axle`);
  }
  // The coils stand on the beams: between the beam top and the frame-rail top.
  const coil=faces.filter(f=>f.part==='suspension.front-springs').flatMap(f=>f.points);
  assert(Math.min(...coil.map(p=>p[2]))>.30&&Math.max(...coil.map(p=>p[2]))<.60);
  // The front seats no longer belong to the rear leaf-spring part.
  assert(faces.filter(f=>f.part==='suspension.spring').every(f=>f.points.every(p=>p[0]>0)));
});

test('the F-350 coil springs and radius arms separate when the suspension is expanded',()=>{
  const closed=scene({assembly:'suspension'}),open=scene({assembly:'suspension',expanded:true},{progress:1});
  for(const id of ['suspension.front-springs','suspension.radius-arms']){
    const a=center(closed.faces.filter(f=>f.part===id)),b=center(open.faces.filter(f=>f.part===id&&f.points[0][1]>0));
    const c=center(closed.faces.filter(f=>f.part===id&&f.points[0][1]>0));
    assert(Number.isFinite(a[0]));
    assert(Math.hypot(...b.map((v,i)=>v-c[i]))>.05,id+' moves when expanded');
  }
});
