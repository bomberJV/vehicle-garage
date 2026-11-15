import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssembly} from '../garage/assemblies.js';

const tags=['body.front-seats','body.rear-bench','body.dashboard','body.rearview-mirror'];
function scene(inspection={}){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{
  build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver'},progress:0,inspection,
  partPositions:new Map(),lights:true,schematic:true
 });r.buildMesh();return r;
}
test('five head restraints rise into the greenhouse on two front buckets and the split rear bench',()=>{
 const r=scene(),parts=getAssembly('g500','body').parts;
 for(const id of tags){
  assert(parts.find(p=>p.id===id)?.source.url.includes('/auctions/az23/'),id);
  const faces=r.faces.filter(f=>f.part===id);assert(faces.length>0);assert(faces.every(f=>f.rigid.name==='body-shell'));
 }
 const front=r.faces.filter(f=>f.part==='body.front-seats');
 assert.deepEqual(new Set(front.map(f=>f.instance)),new Set(['front-left','front-right']));
 for(const [id,heads] of [['body.front-seats',[-.418,.418]],['body.rear-bench',[-.451,0,.451]]]){
  const points=r.faces.filter(f=>f.part===id).flatMap(f=>f.points);
  const crown=points.filter(p=>p[2]>1.52);
  for(const y of heads)assert(crown.some(p=>Math.abs(y-p[1])<.04));
  assert(crown.every(p=>heads.some(y=>Math.abs(y-p[1])<.15)),id);
  assert(Math.max(...points.map(p=>p[2]))<1.65);
 }
 const rear=r.faces.filter(f=>f.part==='body.rear-bench');
 const base=rear.filter(f=>f.points.every(p=>p[2]<.79)&&Math.min(...f.points.map(p=>p[0]))>.49);
 assert(base.length);assert(base.every(f=>f.points.every(p=>p[1]<=.2160001)||f.points.every(p=>p[1]>=.2239999)));
 const mirror=r.faces.filter(f=>f.part==='body.rearview-mirror').flatMap(f=>f.points);
 assert(mirror.every(p=>Math.abs(p[1])<.12&&p[2]>1.76&&p[2]<1.90));
});
test('the two front seats isolate individually while the seat and dashboard stay fixed during body separation',()=>{
 for(const instance of ['front-left','front-right']){
  const r=scene({assembly:'body',part:'body.front-seats',instance,onlyPart:true});
  assert(r.faces.length>0);assert(r.faces.every(f=>f.part==='body.front-seats'));
  assert(r.faces.every(f=>f.points.every(p=>instance==='front-left'?p[1]<0:p[1]>0)));
 }
 const r=scene({assembly:'body',expanded:true});
 for(const [id,mount] of [['body.door','left-front'],['body.front-right','right-front'],['body.rear-left','left-rear'],['body.rear-right','right-rear']]){
  const inner=r.meshCache.faces.filter(f=>f.part===id&&f.points.every(p=>Math.abs(p[1])<.847&&p[2]>.95&&p[2]<1.189));assert(inner.length>25,id);
  assert(inner.every(f=>f.rigid.name===mount));
 }
 assert(r.meshCache.faces.filter(f=>tags.includes(f.part)).every(f=>f.rigid.offset.every(n=>n===0)));
});
