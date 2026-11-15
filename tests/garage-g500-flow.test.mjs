import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {g500HeaterPorts} from '../garage/g500-comfort-parts.js';

function mesh(inspection={},isolate=false,vehicle='g500'){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{
  build:{vehicle,parts:[],finish:'silver',paint:'olive'},inspection,faces:[],isolate,schematic:true,partPositions:new Map()
 });
 r.buildMesh();return r;
}
const shape=(r,part)=>r.faces.filter(f=>f.part===part).map(f=>f.points);
const parts=r=>new Set(r.faces.map(f=>f.part));
const routes={intake:['airbox','intake-duct','air-filters','maf','throttle','intake'],cooling:['radiator','fan','water-pump','thermostat','upper-hose','lower-hose','coolant-reservoir']};
test('complete and isolated G500 share a single installed intake and cooling circuit; powertrain links retain the same individual meshes',()=>{
 const whole=mesh(),motor=mesh({assembly:'powertrain'},true);
 for(const [assembly,shared] of Object.entries(routes)){
  const g=getAssembly('g500',assembly),isolated=mesh({assembly},true),exploded=mesh({assembly,expanded:true},true);
  assert.deepEqual(parts(isolated),new Set(g.parts.map(p=>p.id)));
  assert.deepEqual(parts(exploded),parts(isolated));
  for(const p of g.parts){assert(p.source?.url.startsWith('https://'));assert(exploded.faces.some(f=>f.part===p.id&&f.motionKey),p.id);}
  for(const k of shared){
   const id=assembly+'.'+k;
   assert.deepEqual(shape(whole,id),shape(isolated,id),id);
   assert.deepEqual(shape(motor,'powertrain.'+k),shape(whole,id),id);
   assert(!parts(whole).has('powertrain.'+k));assert(!parts(motor).has(id));
  }
 }
 const circuit=mesh({assembly:'cooling'},true),hvac=mesh({assembly:'hvac'},true);
 assert(!parts(whole).has('cooling.heater-core'));assert(parts(whole).has('hvac.heater-core'));
 assert.deepEqual(shape(circuit,'cooling.heater-core'),shape(hvac,'hvac.heater-core'));
 for(const [i,id] of ['cooling.heater-feed','cooling.heater-return'].entries()){
  const near=component=>Math.min(...shape(circuit,component).flat().map(p=>Math.hypot(...p.map((v,k)=>v-g500HeaterPorts[i][k]))));
  assert(near(id)<.018,id);assert(near('cooling.heater-core')<.018);
 }
 for(const id of ['intake','cooling','exhaust'])assert.equal(getAssembly('bmw325ci',id),null);
});
function hoodZ([px,py],tris){
 let top=-Infinity;
 for(const [a,b,c] of tris){
  const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-10)continue;
  const u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den,v=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den;
  if(u>=0&&v>=0&&u+v<=1)top=Math.max(top,u*a[2]+v*b[2]+(1-u-v)*c[2]);
 }
 return top;
}
test('the installed M113 intake clears the actual closed hood triangles across both filters, their cover and the rear meter',()=>{
 const r=mesh(),tris=r.faces.filter(f=>f.part==='body.hood').flatMap(f=>Array.from({length:f.triangles.length/3},(_,i)=>f.triangles.slice(i*3,i*3+3).map(k=>f.points[k])));
 assert(tris.length>10);
 for(const key of routes.intake){
  const gaps=shape(r,'intake.'+key).flat().map(p=>hoodZ(p,tris)-p[2]).filter(Number.isFinite);
  assert(gaps.length>30,key);assert(Math.min(...gaps)>.008,key+' contacts the bonnet');
 }
});
test('G500 flow parts open matched engine and service bench sections and expose each pickable feature with physical motion',()=>{
 const checks=[['intake.throttle','powertrain.throttle','g500-throttle.blade'],['intake.intake','powertrain.intake','g500-variable-intake.flap'],['cooling.thermostat','powertrain.thermostat','g500-coolant-thermostat.element'],['cooling.water-pump','powertrain.water-pump','g500-engine-pump.impeller']];
 for(const [part,alias,moving] of checks){
  const d=getDetail('g500',part);assert.equal(d.id,getDetail('g500',alias).id);
  const r=mesh({detailView:d},true);assert.deepEqual(parts(r),new Set(d.componentIndex.keys()));const initial=shape(r,moving);
  r.mechanismPhase=.5;r.buildMesh();assert.notDeepEqual(shape(r,moving),initial,moving);
 }
 for(const id of ['intake.air-filters','cooling.radiator','cooling.heater-pump','cooling.heater-core']){
  const d=getDetail('g500',id);assert(d&&d.componentIndex.size>=3,id);
 }
});
