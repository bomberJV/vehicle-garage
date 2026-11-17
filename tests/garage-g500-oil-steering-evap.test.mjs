import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {groups,detailFor} from '../garage/g500-additions.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {installedPartId} from '../garage/installed-part.js';

function viewer(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver'},faces:[],inspection,isolate,schematic:true,partPositions:new Map()});
 r.buildMesh();return r;
}
const shape=(mesh,id)=>mesh.faces.filter(f=>f.part===id).map(f=>f.points);
function minimumDistance(mesh,id,point){
 return Math.min(...shape(mesh,id).flat().map(p=>Math.hypot(...p.map((v,i)=>v-point[i]))));
}
test('four G500 circuits expose installed geometry under the same ownership in the assembly inspector and Whole',()=>{
 const whole=viewer(),wholeParts=new Set(whole.faces.map(f=>f.part));
 for(const group of groups){
  const assembly=getAssembly('g500',group.id),isolated=viewer({assembly:group.id},true);
  assert.equal(assembly.parts.length,group.parts.length);
  assert.deepEqual(new Set(isolated.faces.map(f=>f.part)),new Set(group.parts.map(p=>p.id)));
  for(const p of group.parts){
   const physical=installedPartId('g500',p.id);
   assert(wholeParts.has(physical),p.id);
   if(physical!==p.id)assert(!wholeParts.has(p.id),p.id);
   assert.deepEqual(shape(whole,physical),shape(isolated,p.id),p.id);
   assert(p.source?.url.startsWith('https://'));
   assert(shape(isolated,p.id).flat().every(point=>point.every(Number.isFinite)),p.id);
  }
 }
});
test('every component of each G500 bench study draws, and the steering and purge controls actually move',()=>{
 const found=new Set();
 for(const g of groups)for(const p of g.parts){
  const study=detailFor(p.id);if(!study||found.has(study.id))continue;found.add(study.id);
  const d=getDetail('g500',p.id);assert.equal(d?.id,study.id);
  const r=viewer({detailView:d},true);assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(d.componentIndex.keys()));
  if(d.animated){
   const movingId=d.id+(p.id.startsWith('evap.')?'.poppet':'.arm'),before=shape(r,movingId);
   r.mechanismPhase=.25;r.buildMesh();assert(before.length>0);assert.notDeepEqual(shape(r,movingId),before);
  }
 }
 assert.equal(found.size,7);
 assert.equal(getDetail('g500','powertrain.oil-filter').id,getDetail('g500','engine-oil.oil-filter').id);
});
test('installed control and fluid paths reach their fittings, gearbox and wheel end',()=>{
 const mesh=viewer();
 for(const [port,keys,radius] of [
  [[-1.625,-.530,.440],['steering-assist.pitman','steering.linkage'],.030],
  [[-1.612,.622,.380],['steering.linkage'],.030],
  [[-.625,-.410,1.109],['column-adjustment.shaft','steering-assist.shaft'],.018],
  [[-1.997,-.566,.577],['steering-assist.cooler','steering-assist.return-lines'],.015],
  [[-2.060,-.407,.687],['transmission-fluid.cooler','transmission-fluid.left-line'],.020],
  [[-2.060,.407,.737],['transmission-fluid.cooler','transmission-fluid.right-line'],.020],
  [[2.055,.739,.880],['evap.canister','evap.purge-line'],.018],
  [[-1.152,-.612,.940],['evap.purge-valve','evap.purge-line'],.012],
  [[-1.219,-.612,.940],['evap.purge-valve','evap.manifold-line'],.012]
 ])for(const key of keys)assert(minimumDistance(mesh,key,port)<radius,key);
 const jets=shape(mesh,'engine-oil.jets').flat();
 const stations=[...new Set(jets.map(p=>Math.round(p[0]*100)))];
 assert(stations.length>8);assert(jets.some(p=>p[1]<-.10)&&jets.some(p=>p[1]>.10));
});
test('the 40 mm lift keeps the drag link attached to the rising pitman arm and the axle-mounted wheel end',()=>{
 const r=viewer(),link=()=>r.faces.filter(f=>f.part==='steering.linkage'&&f.instance==='drag-link').flatMap(f=>f.points);
 const reference=link();assert(reference.length>20);
 r.build={...r.build,lift:{mode:'g500-orc-40',mm:40}};r.buildMesh();
 const raised=link(),average=(items)=>items.reduce((s,n)=>s+n,0)/items.length;
 const delta=(at)=>reference.flatMap((pt,i)=>at(pt)?[raised[i][2]-pt[2]]:[]);
 const pitman=delta(p=>p[1]<-.505),wheel=delta(p=>p[1]>.590);
 assert(pitman.length>10&&wheel.length>10);
 assert(Math.abs(average(pitman)-.040)<.001);assert(Math.abs(average(wheel))<.001);
});
