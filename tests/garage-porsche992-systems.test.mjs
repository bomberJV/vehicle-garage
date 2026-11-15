import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {groups} from '../garage/porsche992-additions.js';

const car='porsche992scab';
function renderer(){return Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle:car,roofPosition:'up'}),inspection:{},faces:[],schematic:true,partPositions:new Map()});}
const tagged=(fs,id)=>fs.filter(f=>f.part===id).map(f=>f.points);
const vertices=(fs,id)=>tagged(fs,id).flat();
function bounds(pts,k){return pts.reduce(([lo,hi],p)=>[Math.min(lo,p[k]),Math.max(hi,p[k])],[Infinity,-Infinity]);}
function nearest(pts,point){return Math.min(...pts.map(p=>Math.hypot(...p.map((n,i)=>n-point[i]))));}

test('992.1 assemblies consist of installed and individually pickable surfaces at the same coordinates as their isolated views',()=>{
 const r=renderer();r.buildMesh();const whole=r.faces;
 assert(whole.length<22000);
 assert.equal(groups.length,9);
 const ids=groups.flatMap(g=>g.parts.map(p=>p.id));assert.equal(ids.length,new Set(ids).size);assert.equal(ids.length,63);
 for(const g of groups){
  const menu=getAssembly(car,g.id);assert.deepEqual(menu.parts.map(p=>p.id),g.parts.map(p=>p.id));
  r.inspection={assembly:g.id};r.isolate=true;r.buildMesh();
  for(const p of g.parts){
   const full=tagged(whole,p.id);assert(full.length,p.id+' missing from full vehicle');assert.deepEqual(tagged(r.faces,p.id),full,p.id);
   assert(p.source?.url.startsWith('https://'),p.id);assert(full.flat(2).every(Number.isFinite));
  }
  const selected=g.parts[0].id;
  r.inspection={assembly:g.id,part:selected,onlyPart:true};r.buildMesh();
  assert(r.faces.length&&r.faces.every(f=>f.part===selected));
 }
});
test('both rear intake ducts meet real compressor inlets and the two coolant and refrigerant circuits have separate front cores',()=>{
 const r=renderer();r.buildMesh();const pts=id=>vertices(r.faces,id);
 for(const [s,side] of [[-1,'left'],[1,'right']]){
  const inlet=[1.699,s*.426,.378];assert(nearest(pts('p992-intake.inlet-'+side),inlet)<.04);
  assert(nearest(pts('engine.turbos'),inlet)<.04);
  const cond=pts('p992-hvac.condenser-'+side),radiator=pts('engine.cooling').filter(p=>Math.sign(p[1])===s);
  assert(bounds(cond,0)[1]<bounds(radiator,0)[0]);
  assert(nearest(pts('p992-hvac.bridge'),[-1.910,s*.735,.470])<.011);
  assert(nearest(pts('p992-coolant.feed'),[-1.843,s*.69,.478])<.024);
  assert(nearest(pts('p992-coolant.return'),[-1.843,s*.53,.351])<.024);
  const marker=pts('p992-markers.'+side);assert(marker.every(p=>Math.sign(p[1])===s));
  // The thin marker ends at the front wheel arch in the factory side view.
  const [nose,arch]=bounds(marker,0);assert(Math.abs(nose+1.687)<.008&&Math.abs(arch+1.46)<.010);
  for(const key of ['upper-front','upper-rear','lower','longitudinal','toe']){
   const ys=bounds(pts('p992-suspension.'+key+'-'+side).map(p=>[0,s*p[1],0]),1);assert(ys[0]<.50&&ys[1]>.69);
  }
 }
 assert(bounds(pts('p992-hvac.suction'),0)[1]-bounds(pts('p992-hvac.suction'),0)[0]>2.4);
 assert(nearest(pts('p992-clutch.line'),[1.068,-.132,.553])<.007);assert(nearest(pts('p992-clutch.slave'),[1.068,-.132,.553])<.024);
 const brackets=pts('p992-steering.column');assert(nearest(brackets,[-.337,-.327,.795])<.022);
});
test('nested studies connect through the actual registry, animate individual components and keep their fixed parts still',()=>{
 const snapshots=(d,t)=>{const r=renderer();d.draw(r,t);return r.faces;};
 const pair=getDetail(car,'engine.turbos');assert.equal(pair.id,'p992-turbo-pair');
 for(const [parent,moving,fixed] of [
  ['p992-turbo-pair.left','compressor','housing'],['p992-turbo-pair.right','compressor','cover'],
  ['p992-intake.actuator-left','flap','motor'],['p992-intake.actuator-right','lever','motor'],
  ['p992-clutch.master','piston','housing'],['p992-hvac.blower','wheel','case'],
  ['p992-suspension.front-strut-right','rod','tube'],['p992-steering.servo','slider','housing']
 ]){
  const d=getDetail(car,parent),a=snapshots(d,0),b=snapshots(d,.23);
  assert(d.animated,parent);assert.deepEqual(new Set(a.map(f=>f.part)),new Set(d.componentIndex.keys()));
  assert.notDeepEqual(tagged(a,d.id+'.'+moving),tagged(b,d.id+'.'+moving));assert.deepEqual(tagged(a,d.id+'.'+fixed),tagged(b,d.id+'.'+fixed));
 }
 for(const [id,child] of [['p992-intake.filter-right','seal'],['p992-seats.cushion-left','trace'],['p992-seats.backrest-right','foam'],['p992-hvac.drier','charge'],['p992-coolant.pump','fan'],['p992-doors.regulator-left','motor']]){
  const d=getDetail(car,id);assert(d?.componentIndex.has(d.id+'.'+child),id);
 }
 assert.equal(getDetail(car,'p992-doors.lock-left').id,getDetail(car,'p992-doors.striker-left').id);
 assert.equal(getDetail('porsche993cab','p992-intake.filter-right'),null);
});
