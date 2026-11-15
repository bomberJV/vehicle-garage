import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {saturn} from '../garage/saturn-stack.js';
import {getSaturnDetail} from '../garage/saturn-detail.js';

function mesh(view) {
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null});
  view.draw(r);
  return r.faces;
}
function follow(...path) {
  return path.reduce((parent,id)=>{
    assert.ok(parent.groups.some(g=>g.parts.some(p=>p.id===id)),id+' must be exposed by its parent');
    const result=getSaturnDetail('saturn-v',id);
    assert.ok(result?.source?.url.startsWith('https://'),id+' must have a reference');
    return result;
  },saturn);
}

test('flight stack places five lower, five middle and one upper engine bell below their stages',()=>{
  const f=mesh(saturn);
  for(const [tag,base,expected] of [['first.bells',.012,5],['upper.second-bells',2.024,5],['upper.third-bell',3.088,1]]){
    const rims=f.filter(p=>p.part===tag&&p.points.every(q=>Math.abs(q[2]-base)<1e-7));
    assert.equal(rims.length,expected*24,tag);
  }
  const range=id=>f.filter(p=>p.part===id).flatMap(p=>p.points.map(v=>v[2]));
  for(const [lower,upper] of [['upper.third','upper.instrument'],['upper.instrument','apollo.adapter'],['apollo.service','apollo.csm']]){
    assert.ok(Math.max(...range(lower))<Math.min(...range(upper))+.004);
  }
});

test('Saturn study paths expose only selectable, bounded, individually drawn components',()=>{
  const seen=new Set();
  function walk(parent){
    for(const p of parent.groups.flatMap(g=>g.parts)){
      const detail=getSaturnDetail('saturn-v',p.id);
      if(!detail||seen.has(detail.id))continue;
      seen.add(detail.id);
      const faces=mesh(detail),parts=detail.groups.flatMap(g=>g.parts);
      assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(parts.map(q=>q.id)),detail.id);
      assert.ok(parts.length>=3);
      for(const q of parts){assert.ok(q.description&&q.offset.every(Number.isFinite)&&Math.hypot(...q.offset)>0);}
      for(const f of faces){assert.ok(f.points.length>=3&&f.points.flat().every(Number.isFinite));assert.match(f.color,/^#[a-f0-9]{6}$/i);}
      walk(detail);
    }
  }
  walk(saturn);assert.equal(seen.size,17);
  assert.equal(getSaturnDetail('crew-dragon','apollo.csm'),null);
  assert.equal(follow('first.barrel','sic.intertank').id,'saturn-joint');
  assert.equal(follow('upper.second','sii.bulkhead').id,follow('upper.third','sivb.bulkhead').id);
  assert.equal(follow('apollo.service','saturn-sm.bay','saturn-sim.mapping').id,'saturn-mapper');
});

test('Endeavour distinguishes outboard and center couches and exposes a real hatch window opening',()=>{
  const cabin=follow('apollo.csm'),parts=cabin.groups[0].parts;
  assert.ok(['commander','pilot','lmp','shell','deck','beams','hatch','console','lockers','tunnel'].every(p=>parts.some(q=>q.id==='endeavour-cabin.'+p)));
  const counts=id=>mesh(follow('apollo.csm','endeavour-cabin.'+id)).filter(f=>f.part.endsWith('.frame')).length;
  assert.ok(counts('commander')>counts('pilot'));
  const hatch=mesh(follow('apollo.csm','endeavour-cabin.hatch')),glass=hatch.filter(f=>f.opacity<1);
  assert.equal(glass.length,1);
  // The latch leaf is an annulus. No leaf triangle spans the center of the glazing.
  const point=[0,.85];
  function inside(a,b,c){
    const cross=(p,q)=>(q[0]-p[0])*(point[1]-p[2])-(q[2]-p[2])*(point[0]-p[0]);
    const d=[cross(a,b),cross(b,c),cross(c,a)];return Math.min(...d)>1e-8||Math.max(...d)<-1e-8;
  }
  for(const f of hatch.filter(f=>f.part.endsWith('.leaf')))for(let i=2;i<f.points.length;i++){
    assert.ok(!inside(f.points[0],f.points[i-1],f.points[i]),'opaque leaf covers the hatch window');
  }
});

test('crew-gas tracers follow model-specific conditioning sequences and liquid stays on its own circuit',()=>{
  for(const [vehicle,key] of [['saturn-v','endeavour-cabin.ecs'],['apollo-falcon','lm-room.ecs']]){
    const d=getSaturnDetail(vehicle,key),base=d.id;
    assert.ok(d.animated&&d.motionDescription);
    const drawAt=t=>{
      const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null});d.draw(r,t);return r.faces;
    };
    const f=drawAt(0),moved=drawAt(.12),looped=drawAt(1);
    const points=(faces,part,color)=>faces.filter(face=>face.part===base+'.'+part && (!color||face.color===color)).flatMap(face=>face.points);
    const avgX=pts=>pts.reduce((s,p)=>s+p[0],0)/pts.length;
    const ordering=avgX(points(f,'blower'))-avgX(points(f,'absorber'));
    assert.ok(vehicle==='saturn-v'?ordering<0:ordering>0,'correct flow order for this vehicle');
    const differ=(p,color)=>assert.notDeepEqual(points(f,p,color),points(moved,p,color),base+'.'+p);
    differ('blower');differ('circuit');differ('coolant');
    assert.deepEqual(points(f,'rack'),points(moved,'rack'));
    assert.ok(getSaturnDetail(vehicle,base+'.absorber').name.startsWith(vehicle==='saturn-v'?'Rectangular':'Round'));
    assert.ok(getSaturnDetail(vehicle,base+'.exchange').groups[0].parts.some(p=>p.id.endsWith('.coolant')));
    const start=points(f,'circuit'),end=points(looped,'circuit');
    assert.ok(start.every((p,i)=>p.every((n,j)=>Math.abs(n-end[i][j])<1e-7)),'gas tracers wrap continuously');
  }
});
