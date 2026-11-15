import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {groups,installedAlias} from '../garage/e46-additions.js';

const vehicle='bmw325ci';
function renderer(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'silver',finish:'silver'},inspection,isolate,schematic:true,partPositions:new Map()});
 r.buildMesh();return r;
}
const shapes=(faces,id)=>faces.filter(f=>f.part===id).map(f=>f.points);
test('the E46 uses the same installed meshes in its service views and its complete vehicle',()=>{
 const whole=renderer().faces;
 const charging=renderer({assembly:'electrical'},true);
 for(const [key,engineKey] of [['starter','starter'],['generator','alternator']]){
  const id='electrical.'+key,original='powertrain.'+engineKey;
  assert.equal(shapes(whole,id).length,0);assert.deepEqual(shapes(charging.faces,id),shapes(whole,original));
  assert.equal(getDetail(vehicle,original).id,getDetail(vehicle,id).id);
 }
 for(const g of groups){
  assert.equal(getAssembly(vehicle,g.id),g);
  const r=renderer({assembly:g.id},true);
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(g.parts.map(p=>p.id)));
  for(const p of g.parts){
   const owner=installedAlias(p.id)||p.id;
   const installed=shapes(whole,owner),scoped=shapes(r.faces,p.id);
   assert(installed.length>0,p.id);assert.deepEqual(scoped,installed,p.id);
   if(owner!==p.id){
    assert.equal(shapes(whole,p.id).length,0,p.id);
    assert.equal(shapes(r.meshCache.faces,owner).length,0,owner);
   }
   assert(p.source.url.startsWith('https://'),p.id);
  }
 }
});
test('each E46 section draws its individually registered components and its controls move the intended piece',()=>{
 for(const g of groups)for(const p of g.parts.filter(e=>e.detail)){
  const d=getDetail(vehicle,p.id);
  assert(d,p.id);
  const r=renderer({detailView:d},true);
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(d.componentIndex.keys()),p.id);
  for(const f of r.faces)assert(f.points.every(v=>v.every(Number.isFinite)),f.part);
 }
 for(const [id,suffix] of [['e46-hvac.blower','left-wheel'],['e46-intake.idle-valve','rotor'],['e46-cooling.heater-valve','plunger'],['e46-steering.pump','rotor']]){
  const d=getDetail(vehicle,id),r=renderer({detailView:d},true);
  const before=shapes(r.meshCache.faces,d.id+'.'+suffix);
  r.mechanismPhase=.35;r.buildMesh();assert.notDeepEqual(before,shapes(r.meshCache.faces,d.id+'.'+suffix));
 }
});
test('the seat pads follow the E46 seats, the exhaust reaches both bumper outlets, and both heater hoses meet the matrix',()=>{
 const r=renderer(),pts=id=>shapes(r.faces,id).flat();
 for(const side of ['left','right'])for(const pad of ['cushion','back']){
  const id='e46-seat-heat.'+side+'-'+pad;
  assert(r.faces.filter(f=>f.part===id).every(f=>f.rigid?.name==='front-seat-'+side));
 }
 const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 const near=(a,b)=>Math.min(...a.map(u=>Math.min(...b.map(v=>dist(u,v)))));
 for(const hose of ['heater-feed','heater-return'])assert(near(pts('e46-cooling.'+hose),pts('e46-hvac.heater-core'))<.014,hose);
 for(const id of ['downpipe-1','downpipe-2'])assert(near(pts('e46-exhaust.'+id),pts('powertrain.exhaust-manifold'))<.03,id);
 assert(near(pts('e46-exhaust.rear-silencer'),pts('e46-exhaust.outlets'))<.02);
 const tips=pts('e46-exhaust.outlets');
 assert(tips.every(p=>p[1]<-.44&&p[0]>2.1));assert(Math.max(...tips.map(p=>p[0]))>2.31);
});
