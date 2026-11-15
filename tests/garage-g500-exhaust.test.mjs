import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {drawG500Exhaust,drawG500ExhaustManifold,getG500ExhaustDetail,g500ExhaustGroup} from '../garage/g500-exhaust.js';
import {g500HubZ,g500HalfWheelbase} from '../garage/g500-underbody.js';

const renderer=inspection=>Object.assign(Object.create(GarageRenderer.prototype),{faces:[],inspection});
const points=(r,id)=>r.faces.filter(f=>f.part===id).flatMap(f=>f.points);
const near=(points,loc,rad)=>points.some(p=>Math.hypot(...p.map((v,i)=>v-loc[i]))<rad);

test('both four-port manifolds use the head positions in the engine and exhaust views',()=>{
 const r=renderer({});drawG500Exhaust(r);
 const inEngine=renderer({assembly:'powertrain'});drawG500Exhaust(inEngine);
 assert(!inEngine.faces.some(f=>f.part.startsWith('exhaust.manifold-')));
 inEngine.faces=[];drawG500ExhaustManifold(inEngine);
 assert.deepEqual(r.faces.filter(f=>f.part.startsWith('exhaust.manifold-')).map(f=>f.points),inEngine.faces.map(f=>f.points));
 for(const [side,name] of [[-1,'left'],[1,'right']]){
   const pp=points(r,'exhaust.manifold-'+name);
   for(const along of [-.159,-.053,.053,.159])assert(near(pp,[-1.235+along+side*.009,side*.50,.945],.027));
   assert(near(pp,[-.885,.53*side,.733],.035));
   assert(near(points(r,'exhaust.converter-'+name),[-.885,.53*side,.733],.030));
 }
});

test('WIS exhaust path runs outboard of the frame, merges below the rear shaft and ends before the left tire',()=>{
 const r=renderer({});drawG500Exhaust(r);
 assert.equal(new Set(r.faces.map(f=>f.part)).size,g500ExhaustGroup.parts.length);
 assert(r.faces.every(f=>f.points.every(p=>p.every(Number.isFinite))));
 for(const [s,name] of [[-1,'left'],[1,'right']]){
   const f=points(r,'exhaust.front-muffler-'+name);
   assert(f.every(p=>s*p[1]>.535));
   const cats=points(r,'exhaust.converter-'+name);
   for(const center of [-.553,-.286])assert(cats.some(p=>Math.abs(p[0]-center)<.07&&p[2]>.513));
   const m=points(r,'exhaust.main-muffler');
   assert(near(m,[.47,s*.694,.457],.030));
   const catEnd=near(cats,[-.115,s*.694,.457],.030);assert(catEnd&&near(f,[-.115,s*.694,.457],.030));
 }
 for(const id of ['exhaust.main-muffler','exhaust.heat-shields']){
   const underShaft=points(r,id).filter(p=>Math.abs(p[1])<.22&&p[0]>.68);
   assert(underShaft.length>0);
   for(const [xx,,zz] of underShaft){
     const t=(xx-.22)/(g500HalfWheelbase-.257-.22),shaftZ=.52+t*(g500HubZ-.52);
     assert(zz<shaftZ-.031-.005,'shaft clearance under '+id);
   }
 }
 const tail=points(r,'exhaust.tailpipe');assert(tail.every(p=>p[1]<-.16&&p[0]<1.00));
 assert(near(tail,[.715,-.877,.359],.035));
 assert(Math.max(...r.faces.flatMap(f=>f.points.map(p=>p[0])))<g500HalfWheelbase-.39);
});

test('the two monoliths, their sectioned cases and three main muffler connections expand as individual tagged parts',()=>{
 for(const id of ['exhaust.converter-left','exhaust.converter-right','exhaust.main-muffler','powertrain.exhaust-manifold']){
   const detail=getG500ExhaustDetail(id),r=renderer({});assert(detail);
   detail.draw(r);
   for(const p of detail.groups[0].parts){
     assert(points(r,p.id).length);
     assert(p.offset.some(Boolean));
   }
   assert(detail.source.url.startsWith('https://'));
   if(id.includes('converter-'))assert.equal(detail.groups[0].parts.filter(p=>p.name.includes('monolith')).length,2);
 }
});

test('installed and isolated exhaust keep the same casting and one set of service paths',()=>{
 const mesh=(inspection,isolate=false)=>{
   const r=Object.assign(renderer(inspection),{build:{vehicle:'g500',paint:'olive',finish:'silver',parts:[]},schematic:true,isolate,partPositions:new Map()});
   r.buildMesh();return r;
 };
 const whole=mesh({}),exhaust=mesh({assembly:'exhaust'},true),powertrain=mesh({assembly:'powertrain'},true);
 for(const p of g500ExhaustGroup.parts){
   const installed=points(whole,p.id);
   assert(installed.length,p.id);
   assert.deepEqual(points(exhaust,p.id),installed);
 }
 assert.equal(points(whole,'powertrain.exhaust-manifold').length,0);
 assert.deepEqual(points(powertrain,'powertrain.exhaust-manifold'),[...points(whole,'exhaust.manifold-left'),...points(whole,'exhaust.manifold-right')]);
});
