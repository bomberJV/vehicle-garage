import assert from 'node:assert/strict';
import test from 'node:test';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getG500ServiceAssemblies} from '../garage/g500-service-systems.js';
import {GarageRenderer} from '../garage/render.js';

function mesh(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{
   build:{vehicle:'g500',paint:'olive',finish:'silver',parts:[]},inspection,isolate,faces:[],lights:true,schematic:true
 });
 r.buildMesh();return r;
}
function location(faces,part){
 const pts=faces.filter(f=>f.part===part).flatMap(f=>f.points);
 return [0,1,2].map(i=>pts.reduce((s,p)=>s+p[i],0)/pts.length);
}
test('four G500 service systems open from the assembly map with independently pickable components',()=>{
 const groups=getG500ServiceAssemblies('g500');
 assert.deepEqual(groups.map(g=>g.id),['roof','brakes','fuel','electrical']);
 for(const g of groups){
  assert.equal(getAssembly('g500',g.id),g);
  const r=mesh({assembly:g.id},true);
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(g.parts.map(p=>p.id)));
  for(const p of g.parts)assert(/^https:/.test(p.source.url));
 }
 const assembled=mesh(),normal=assembled.faces,brakes=mesh({assembly:'brakes'}).faces;
 assembled.canvas={getBoundingClientRect:()=>({left:0,top:0})};
 assembled.project=([x,y,z])=>({x,y,depth:z});
 // The fitted opening spans x=-.215 to .655, y=±.493. Probe both sides
 // of the leading, trailing and lateral edges, clear of the narrow seal.
 for(const [x,y] of [[-.18,.08],[.12,.08],[.62,.08],[.12,-.46],[.12,.46]]){
  assert.equal(assembled.hitTest(x,y)?.part,'roof.panel');
 }
 for(const [x,y] of [[-.25,.08],[.69,.08],[.12,-.53],[.12,.53]]){
  assert.equal(assembled.hitTest(x,y)?.part,'body.roof');
 }
 for(const name of ['roof.panel','roof.drive','fuel.tank','fuel.delivery','electrical.footwell','electrical.tunnel'])assert(normal.some(f=>f.part===name),name);
 assert(!brakes.some(f=>['wheels.disc','wheels.caliper'].includes(f.part)));
 assert(normal.some(f=>f.part==='wheels.disc'));
 // Reuse a real wheel-end face to verify the whole-vehicle click resolves the correct axle.
 assembled.project=([x,y,z])=>({x,y:z,depth:y});
 for(const id of ['front','rear']){
  const face=normal.find(f=>f.part==='wheels.disc'&&(f.points[0][0]<0)===(id==='front')&&f.points.some(p=>p[2]!==f.points[0][2]));
  assembled.hitFaces=[face];
  const ps=face.points,point=[0,2].map(k=>ps.reduce((sum,p)=>sum+p[k],0)/ps.length);
  assert.equal(assembled.hitTest(...point)?.part,'brakes.'+id);
 }
 const roof=location(normal,'roof.panel'),motor=location(normal,'roof.drive');
 assert(motor[0]>1.4&&motor[1]<-.65&&motor[2]<roof[2]-.45);
 assert(location(normal,'fuel.tank')[0]>1.425);
 assert(location(normal,'fuel.delivery')[2]<location(normal,'fuel.tank')[2]);
 assert(location(normal,'electrical.footwell')[1]>0);
 for(const f of normal.filter(f=>f.part==='roof.panel'||f.part==='roof.cassette'))assert.equal(f.rigid?.name,'roof');
});
test('listed nested parts are drawn at both motion limits and independently selectable',()=>{
 const ids=['roof.cassette','roof.drive','brakes.front','brakes.rear','brakes.hydraulics','fuel.tank','fuel.delivery','fuel.filler','electrical.footwell','g500-fuse-panel.fuses','g500-fuse-panel.relays'];
 const visited=new Set();
 for(const id of ids){
  const v=getDetail('g500',id);assert(v,id);assert(v.source.url.startsWith('https://'));
  assert(!visited.has(v.id));visited.add(v.id);
  const expected=new Set(v.componentIndex.keys());
  for(const t of [0,.5,1]){
   const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});v.draw(r,t);
   assert.deepEqual(new Set(r.faces.map(f=>f.part)),expected,id);
   for(const f of r.faces)assert(f.points.length>=3&&f.points.every(p=>p.every(Number.isFinite)));
  }
  const selected=v.groups[0].parts.at(-1).id,r=mesh({detailView:v,onlyPart:true,detailPart:selected});
  assert(r.faces.length&&r.faces.every(f=>f.part===selected),selected);
 }
 assert.equal(getDetail('g500','body.roof').id,getDetail('g500','roof.cassette').id);
 assert.equal(getDetail('g500','powertrain.brake-reservoir').id,getDetail('g500','brakes.hydraulics').id);
});

test('the 20 A fuse matches the supplier envelope, blade span and terminal thickness',async()=>{
 const {drawBladeFuse,fuseSections}=await import('../garage/g500-blade-fuse.js');
 const faces=[];const r=Object.assign(Object.create(GarageRenderer.prototype),{faces});
 for(const key of fuseSections)r.tag(key,()=>drawBladeFuse(r,(u,v,z)=>[u,v,z],key,undefined,true));
 const points=faces.flatMap(f=>f.points);
 const extent=(p,n)=>Math.max(...p.map(x=>x[n]))-Math.min(...p.map(x=>x[n]));
 for(const [k,d] of [19.1,5.2,19.3].entries())assert(Math.abs(extent(points,k)-d)<1e-8);
 const blades=faces.filter(f=>f.part.startsWith('blade')).flatMap(f=>f.points);
 assert(Math.abs(extent(blades,0)-14.2)<1e-8);assert.equal(extent(blades,1),.64);
 assert.match(getDetail('g500','g500-fuse-panel.fuses').source.url,/restagraf/);
});
