import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getAssembly,getComponent} from '../garage/assemblies.js';
import {getEngineDefinition,getEngineComponent} from '../garage/engine-data.js';
import {enginePartOffset} from '../garage/engine-geometry.js';
import {getRoadDetail} from '../garage/road-mechanisms.js';
import {VEHICLES} from '../garage/catalog.js';
import {vehicleDecisions} from '../garage/vehicle-decisions.js';

function scene(inspection={},options={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle:'f350'}),inspection,
    partPositions:new Map(),lights:true,schematic:true,progress:0,...options});
  r.buildMesh();
  return r;
}
const center=faces=>{const p=faces.flatMap(f=>f.points);return [0,1,2].map(i=>p.reduce((a,q)=>a+q[i],0)/p.length);};

test('the decided 7.5-litre V8, E4OD and Sterling 10.25 replace the unselected F-350 placeholders',()=>{
  const engine=getEngineDefinition('f350');
  assert.equal(engine.name,'7.5L (460) EFI V8');assert.equal(engine.cylinders,8);assert.equal(engine.camCount,1);
  assert.match(engine.summary,/7\.5-litre \(460 cu in\).*multiport fuel injection/);
  assert.match(engine.summary,/estimated/);
  const decision=vehicleDecisions.find(d=>d.id==='f350-powertrain');
  assert.equal(engine.source.url,decision.sources[0].url,'the engine cites the brochure already recorded for the decision');
  const powertrain=getAssembly('f350','powertrain');
  assert.equal(powertrain.definition.id,'ford-460');assert.equal(powertrain.description,engine.summary);
  const ids=powertrain.parts.map(p=>p.id);
  for(const id of ['block','crankshaft','pistons','connecting-rods','head','intake','camshafts','lifters','pushrods','rocker-arms','valves','spark-plugs','distributor','coils','belt','alternator','transmission'])
    assert(ids.includes('powertrain.'+id),id);
  assert.equal(getComponent('f350','powertrain.pushrods').quantity,16);
  assert.equal(getEngineComponent('f350','powertrain.pushrods').parentId,'powertrain.head-system');
  const drive=getAssembly('f350','drivetrain');
  assert.match(drive.description,/E4OD.*Sterling 10\.25 full-floating/);
  assert.deepEqual(drive.parts.map(p=>p.id),['gearbox','torque-converter','propshaft','rear-differential','axle-housing','axle-shafts','hubs'].map(id=>'drivetrain.'+id));
  for(const id of ['rear-differential','axle-housing','axle-shafts','hubs'])assert.equal(drive.parts.find(p=>p.id==='drivetrain.'+id).source.url,decision.sources[1].url);
  assert.equal(getRoadDetail('f350','drivetrain.torque-converter').id,'converter');
  assert.match(getAssembly('f350','steering').name,/Twin I-Beam/);
  // User-facing text no longer describes the engine or axles as unselected.
  const text=[VEHICLES.f350.detail,VEHICLES.f350.note,...['powertrain','steering','suspension','drivetrain'].flatMap(id=>{const a=getAssembly('f350',id);return [a.name,a.description,...a.parts.flatMap(p=>[p.name,p.description])];})].join(' ');
  assert.doesNotMatch(text,/unselected|configuration open|not selected|must be confirmed|placeholder/i);
});

test('every F-350 engine and driveline component draws selectable geometry and explodes with the shared offsets',()=>{
  const closed=scene({assembly:'powertrain'});
  const tags=new Set(closed.faces.map(f=>f.part));
  for(const p of getEngineDefinition('f350').components){
    assert(tags.has(p.id),p.id);
    const offset=enginePartOffset(p.id,'f350');
    assert(offset.every(Number.isFinite),p.id);
  }
  assert(enginePartOffset('powertrain.valve-cover','f350')[2]>enginePartOffset('powertrain.head','f350')[2]);
  assert(enginePartOffset('powertrain.sump','f350')[2]<0);
  assert(enginePartOffset('powertrain.camshafts','f350')[0]<0,'the in-block camshaft leaves through the front of the block');
  const open=scene({assembly:'powertrain',expanded:true},{progress:1});
  for(const id of ['powertrain.pushrods','powertrain.rocker-arms','powertrain.camshafts','powertrain.distributor']){
    const a=center(closed.faces.filter(f=>f.part===id)),b=center(open.faces.filter(f=>f.part===id));
    assert(Math.hypot(...a.map((v,i)=>v-b[i]))>.05,id+' moves when the bay is expanded');
  }
  const picked=scene({assembly:'powertrain',part:'powertrain.distributor'});
  assert(picked.faces.some(f=>f.part==='powertrain.distributor'&&f.highlighted));
  const drive=scene({assembly:'drivetrain'},{isolate:true});
  assert.deepEqual(new Set(drive.faces.map(f=>f.part)),new Set(getAssembly('f350','drivetrain').parts.map(p=>p.id)));
  const exploded=scene({assembly:'drivetrain',expanded:true},{isolate:true,progress:1});
  const hubs=id=>center((id?exploded:drive).faces.filter(f=>f.part==='drivetrain.hubs'));
  assert(Math.hypot(...hubs(1).map((v,i)=>v-hubs()[i]))>.05);
});

// Exact triangle-triangle tests between the installed engine/driveline and the
// truck around them. Shared joints (the battery and starter cables, the steering
// arms meeting the knuckles) are connections rather than interference.
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function crosses(p,q,[a,b,c]){
  const e1=sub(b,a),e2=sub(c,a),d=sub(q,p),h=cross(d,e2),det=dot(e1,h),eps=1e-7;
  if(Math.abs(det)<1e-12)return false;
  const f=1/det,s=sub(p,a),u=f*dot(s,h);if(u<eps||u>1-eps)return false;
  const w=cross(s,e1),v=f*dot(d,w);if(v<eps||u+v>1-eps)return false;
  const t=f*dot(e2,w);return t>eps&&t<1-eps;
}
const intersect=(A,B)=>[0,1,2].some(i=>crosses(A[i],A[(i+1)%3],B)||crosses(B[i],B[(i+1)%3],A));
function triangles(faces,keep){
  const out=[];
  for(const f of faces)if(keep(f.part))for(let i=0;i<f.triangles.length;i+=3){
    const t=[0,1,2].map(k=>f.points[f.triangles[i+k]]);
    out.push({t,part:f.part,lo:[0,1,2].map(k=>Math.min(...t.map(p=>p[k]))),hi:[0,1,2].map(k=>Math.max(...t.map(p=>p[k])))});
  }
  return out;
}
function clashes(faces,mine,others,allowed=()=>false){
  const A=triangles(faces,mine),B=triangles(faces,others),cell=.1,grid=new Map(),found=new Map();
  for(const [n,t] of B.entries())for(let i=Math.floor(t.lo[0]/cell);i<=Math.floor(t.hi[0]/cell);i++)for(let j=Math.floor(t.lo[1]/cell);j<=Math.floor(t.hi[1]/cell);j++)for(let k=Math.floor(t.lo[2]/cell);k<=Math.floor(t.hi[2]/cell);k++){
    const key=i+','+j+','+k;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(n);
  }
  for(const a of A){
    const tested=new Set();
    for(let i=Math.floor(a.lo[0]/cell);i<=Math.floor(a.hi[0]/cell);i++)for(let j=Math.floor(a.lo[1]/cell);j<=Math.floor(a.hi[1]/cell);j++)for(let k=Math.floor(a.lo[2]/cell);k<=Math.floor(a.hi[2]/cell);k++){
      for(const n of grid.get(i+','+j+','+k)||[]){
        if(tested.has(n))continue;tested.add(n);const b=B[n];
        if(b.part===a.part||allowed(a.part,b.part))continue;
        if(a.hi.some((v,m)=>v<b.lo[m])||b.hi.some((v,m)=>v<a.lo[m]))continue;
        if(intersect(a.t,b.t))found.set(a.part+' × '+b.part,(found.get(a.part+' × '+b.part)||0)+1);
      }
    }
  }
  return [...found.keys()];
}

test('the installed F-350 engine, E4OD and rear axle do not intersect the body, frame, cab or chassis',()=>{
  for(const seeThroughBody of [false,true]){
    const {faces}=scene({},{seeThroughBody});
    const powertrain=p=>/^(powertrain|drivetrain)\./.test(p);
    const surroundings=p=>!powertrain(p)&&p!=='electrical.cables';
    assert(faces.some(f=>f.part==='body.hood')&&faces.some(f=>f.part==='suspension.frame')&&faces.some(f=>f.part==='floor.pan'));
    assert.deepEqual(clashes(faces,powertrain,surroundings),[]);
    // The engine and its gearbox meet at the bellhousing without overlapping.
    assert.deepEqual(clashes(faces,p=>p.startsWith('powertrain.'),p=>p.startsWith('drivetrain.')),[]);
    // The Twin I-Beam axles, linkage, coil springs, radius arms and leaf springs clear the frame, body and wheels.
    const chassis=p=>['steering.axle','steering.linkage','suspension.spring','suspension.front-springs','suspension.radius-arms'].includes(p);
    assert.deepEqual(clashes(faces,chassis,p=>!chassis(p)&&!powertrain(p),(a,b)=>[a,b].includes('steering.axle')&&[a,b].includes('steering.linkage')),[]);
  }
});

// Lowest vertical gap between two installed parts wherever they overlap in plan.
const area=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function heightAt([a,b,c],p){
  const det=area(a,b,c);if(Math.abs(det)<1e-12)return;
  const w=[area(b,c,p),area(c,a,p),area(a,b,p)].map(v=>v/det);
  if(w.some(v=>v<-1e-9))return;
  return w[0]*a[2]+w[1]*b[2]+w[2]*c[2];
}
function verticalGap(faces,upperId,lowerId){
  const upper=triangles(faces,p=>p===upperId),lower=triangles(faces,p=>p===lowerId);
  assert(upper.length&&lower.length,upperId+' / '+lowerId);
  let gap=Infinity;
  for(const u of upper)for(const l of lower){
    if(u.hi[0]<l.lo[0]||l.hi[0]<u.lo[0]||u.hi[1]<l.lo[1]||l.hi[1]<u.lo[1])continue;
    for(const p of [...u.t,...l.t]){
      const top=heightAt(u.t,p),bottom=heightAt(l.t,p);
      if(top!==undefined&&bottom!==undefined)gap=Math.min(gap,top-bottom);
    }
  }
  return gap;
}

test('the F-350 engine fits under the closed hood, over the I-beams and ahead of the raised floor',()=>{
  const {faces}=scene();
  assert(verticalGap(faces,'body.hood','powertrain.intake-duct')>.02);
  assert(verticalGap(faces,'body.hood','powertrain.throttle')>.02);
  assert(verticalGap(faces,'body.hood','powertrain.valve-cover')>.02);
  for(const below of ['suspension.frame','steering.axle'])assert(verticalGap(faces,'powertrain.sump',below)>.005,'sump over '+below);
  // The axle housing passes beneath the raised rails; the driveline stays under the cab floor.
  assert(verticalGap(faces,'suspension.frame','drivetrain.axle-housing')>.02);
  assert(verticalGap(faces,'suspension.frame','drivetrain.rear-differential')>.01);
  for(const id of ['drivetrain.gearbox','drivetrain.propshaft'])assert(verticalGap(faces,'floor.pan',id)>.01,id);
  const block=faces.filter(f=>f.part==='powertrain.block').flatMap(f=>f.points),pan=faces.filter(f=>f.part==='floor.pan').flatMap(f=>f.points);
  assert(Math.max(...block.map(p=>p[0]))<Math.min(...pan.map(p=>p[0])),'the block ends ahead of the toe board');
});
