import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {bmwVentPoint,bmwVentLinkage,bmwCabinParts,drawBmwCabin} from '../garage/bmw-cabin-closures.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getComponent} from '../garage/assemblies.js';
import {getRoadServiceAssemblies,drawRoadServiceAssembly} from '../garage/road-service-systems.js';

const renderer=()=>Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const positive=[[.585,.7992,.986],[.734,.6576,1.328],[.923,.6527,1.313],[1.081,.6557,1.272],[1.250,.6990,1.185],[1.332,.7395,1.114],[1.373,.7643,1.063],[1.337,.7864,1.011],[1.245,.7924,.996]];
function bounds(fs,id){const p=fs.filter(f=>f.part===id).flatMap(f=>f.points);assert(p.length,id);return [0,1,2].map(i=>[Math.min(...p.map(q=>q[i])),Math.max(...p.map(q=>q[i]))]);}

test('the rear vent glass opens outward about a fixed forward edge and keeps its shape',()=>{
 for(const side of [-1,1]){
  const outline=positive.map(([x,y,z])=>[x,side*y,z]);
  for(const amount of [0,.25,.5,.75,1]){
   const moved=outline.map(p=>bmwVentPoint(p,outline,side,amount));
   for(const i of [0,1])moved[i].forEach((v,k)=>near(v,outline[i][k]));
   for(let i=0;i<outline.length;i++)for(let j=i+1;j<outline.length;j++)near(distance(outline[i],outline[j]),distance(moved[i],moved[j]));
   const linkage=bmwVentLinkage(outline,side,amount);
   near(distance(linkage.base,linkage.knee),linkage.length);near(distance(linkage.knee,linkage.tip),linkage.length);
  }
  assert(side*(bmwVentPoint(outline[6],outline,side,1)[1]-outline[6][1])>.04);
 }
});

test('the whole-car vent selector rebuilds glazing and keeps both handed panes selectable',()=>{
 const r=Object.assign(renderer(),{build:{vehicle:'bmw325ci',paint:'blue',finish:'silver',wheelDesign:'factory',parts:[],bmwVentPosition:'closed'},inspection:{},isolate:false,schematic:true,lights:true});
 r.buildMesh();const closed=bounds(r.faces,'body.quarter-right'),key=r.meshCache.key;
 r.build={...r.build,bmwVentPosition:'open'};r.buildMesh();
 assert.notEqual(r.meshCache.key,key);assert(bounds(r.faces,'body.quarter-right')[1][1]>closed[1][1]+.03);
 for(const side of ['left','right'])assert(getComponent('bmw325ci','body.quarter-'+side));
});

test('each handed vent study keeps fixed mounts still and exposes separate drive hardware',()=>{
 for(const side of ['left','right']){
  const v=getDetail('bmw325ci','body.quarter-'+side);assert(v?.animated);
  const expected=new Set(v.componentIndex.keys());
  for(const id of ['glass','hinges','seal','motor','arm','glass-fitting','sealing-rings','caps','connector'])assert(expected.has(v.id+'.'+id),id);
  const poses=[];
  for(const t of [0,.125,.25,.5,.75,1]){
   const r=renderer();v.draw(r,t);poses.push(r.faces);
   assert.deepEqual(new Set(r.faces.map(f=>f.part)),expected);
   for(const f of r.faces)assert(f.points.every(p=>p.every(Number.isFinite)));
   assert(r.faces.some(f=>f.part===v.id+'.glass'&&f.opacity<1));
  }
  const fixed=fs=>fs.filter(f=>[v.id+'.hinges',v.id+'.motor',v.id+'.seal'].includes(f.part)).map(f=>f.points);
  assert.deepEqual(fixed(poses[0]),fixed(poses[3]));
 }
});

test('the dedicated coupé interior has separate shaped seats, controls and rear shelf',()=>{
 const r=renderer();drawBmwCabin(r);
 const expected=[...bmwCabinParts.filter(p=>!p.id.includes('quarter')).map(p=>p.id),'body.door','body.front-right','body.structure'];
 assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(expected));
 const front=bounds(r.faces,'body.front-seats'),rear=bounds(r.faces,'body.rear-bench'),trim=bounds(r.faces,'body.cabin-trim');
 assert(front[2][1]<1.28&&rear[2][1]<1.22);
 assert(rear[2][0]>.550,'rear seat pan must clear the raised tank compartment');
 assert(trim[0][1]>=1.80,'shelf must extend to the backlight foot');
 for(const p of r.faces.filter(f=>f.part==='body.console').flatMap(f=>f.points).filter(p=>p[0]>.280))assert(p[2]>=.501+.073*Math.max(0,Math.min(1,(p[0]-.280)/.125))-1e-10,'console must sit above the rear tunnel step');
 for(const s of ['front-left','front-right'])assert(r.faces.some(f=>f.part==='body.front-seats'&&f.instance===s));
 // A formed tunnel leaves the propshaft corridor open under the centre of the cabin.
 for(const f of r.faces.filter(f=>f.part==='body.cabin-trim'&&Math.min(...f.points.map(p=>p[1]))<0&&Math.max(...f.points.map(p=>p[1]))>0))assert(Math.min(...f.points.map(p=>p[2]))>.45);
 for(const f of r.faces)assert(f.points.every(p=>p.every(Number.isFinite)));
});

test('BMW service geometry keeps the pump right, sender left and filler behind the axle',()=>{
 const r=renderer();drawRoadServiceAssembly(r,'bmw325ci','fuel');drawRoadServiceAssembly(r,'bmw325ci','electrical');
 const pump=bounds(r.faces,'fuel.pump'),sender=bounds(r.faces,'fuel.left-sender'),filler=bounds(r.faces,'fuel.filler');
 assert(pump[1][0]>0&&sender[1][1]<0);
 assert(pump[2][0]>.304,'pump and strainer must remain above the tank floor');
 const cabin=renderer();drawBmwCabin(cabin);
 const rearUnderside=cabin.faces.filter(f=>{
  const cy=Math.abs(f.points.reduce((s,p)=>s+p[1],0)/f.points.length);
  return f.part==='body.cabin-trim'&&cy>.10&&cy<.60&&f.points.every(p=>p[0]>=.405&&p[0]<=1.12&&p[2]<.56);
 });
 const tankTop=bounds(r.faces,'fuel.sender')[2][1];
 assert(rearUnderside.length&&rearUnderside.every(f=>f.points.every(p=>p[2]>tankTop)),'rear floor underside must clear tank and flange');
 assert(filler[0][1]>1.60&&filler[1][1]>.80,'filler must reach the actual rear-quarter flap');
 assert(bounds(r.faces,'electrical.fuses')[0][1]<-.55,'fuses belong behind the glovebox');
 const battery=bounds(r.faces,'electrical.battery');assert(battery[0][0]>1.36&&battery[1][0]>0);
 assert(getRoadServiceAssemblies('bmw325ci').find(g=>g.id==='fuel').parts.some(p=>p.id==='fuel.transfer'));
 const v=getDetail('bmw325ci','fuel.tank');assert.equal(v.id,'bmw-m54-saddle-tank');
 for(const id of ['right-unit','left-sender','pump','transfer','seals','neck'])assert(v.componentIndex.has(v.id+'.'+id));
});
