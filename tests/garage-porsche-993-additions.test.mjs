import test from 'node:test';
import assert from 'node:assert/strict';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {vehicleServiceAssemblies} from '../garage/vehicle-service.js';
import {groups} from '../garage/porsche993-additions.js';

const classic='porsche993cab',modern='porsche992scab';
const shape=(faces,id)=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
const span=(points,axis)=>[Math.min(...points.map(p=>p[axis])),Math.max(...points.map(p=>p[axis]))];
function build(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle:classic,roofPosition:'up',paint:'silver',parts:[]},inspection,isolate,partPositions:new Map(),schematic:true});
 r.buildMesh();return r.faces;
}
test('the stock narrow-body Cabriolet meets its closed-roof silhouette and keeps the separate US fog lamps',()=>{
 const faces=build(),ys=shape(faces,'shell.fenders'),y=span(ys,1);
 const x=[Infinity,-Infinity];
 for(const face of faces)for(const p of face.points){x[0]=Math.min(x[0],p[0]);x[1]=Math.max(x[1],p[0]);}
 const roof=span(shape(faces,'roof.fabric'),2)[1],ground=span(shape(faces,'running.tires'),2)[0];
 for(const [value,target] of [[x[1]-x[0],4.260],[y[1]-y[0],1.735],[roof-ground,1.315]])assert(Math.abs(value-target)<.0003);
 for(const [side,s] of [['left',-1],['right',1]]){
  const points=shape(faces,'lights.fog-'+side);assert(points.length);
  assert(points.every(p=>p[0]<-1.985&&p[1]*s>.3),'receiver sits in the nose');
  const surfaceAt=(id,qy,qz)=>{
   let nearest=Infinity;
   for(const f of faces.filter(f=>f.part===id)){
    const triangles=f.triangles||faceTriangles(f.points);
    for(let i=0;i<triangles.length;i+=3){
     const [a,b,c]=triangles.slice(i,i+3).map(k=>f.points[k]);
     const det=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]);
     if(Math.abs(det)<1e-12)continue;
     const y=qy-a[1],z=qz-a[2];
     const u=(y*(c[2]-a[2])-z*(c[1]-a[1]))/det,v=((b[1]-a[1])*z-(b[2]-a[2])*y)/det;
     if(u>=0&&v>=0&&u+v<=1)nearest=Math.min(nearest,a[0]+u*(b[0]-a[0])+v*(c[0]-a[0]));
    }
   }
   return nearest;
  };
  for(const [id,y] of [['lights.fog-'+side,.390],['lights.indicators',.603]]){
   const lens=surfaceAt(id,s*y,.428),housing=surfaceAt('shell.bumpers',s*y,.428);
   assert(lens<(id.startsWith('lights.fog')?-2:-1.96)&&housing-lens>.030&&housing-lens<.052,id+' is visible through a shaped bumper aperture '+[lens,housing]);
  }
  assert(getDetail(classic,'lights.fog-'+side).componentIndex.has('993foglamp.h3'));
  assert.equal(getDetail(modern,'lights.fog-'+side),null);
 }
});
test('every catalogued oil and climate part has the same installed and isolated geometry',()=>{
 const whole=build();
 const classicGroups=vehicleServiceAssemblies(classic),modernGroups=vehicleServiceAssemblies(modern);
 for(const g of groups){
  assert(classicGroups.includes(g));assert(!modernGroups.some(other=>other.id===g.id));
  const isolated=build({assembly:g.id},true);
  assert.deepEqual(new Set(isolated.map(f=>f.part)),new Set(g.parts.map(p=>p.id)));
  for(const p of g.parts){const installed=shape(whole,p.id);
   assert(installed.length,p.id);assert.deepEqual(shape(isolated,p.id),installed);
   assert(installed.every(v=>v.every(Number.isFinite)));assert(p.source?.url.startsWith('https://'));
  }
 }
 const rightCooler=shape(whole,'993-lubrication.cooler'),leftCondenser=shape(whole,'993-climate.condenser');
 assert(rightCooler.every(p=>p[0]<-1.55&&p[1]>.36));assert(leftCondenser.every(p=>p[0]<-1.55&&p[1]<-.36));
 for(const key of ['outbound','return']){
  const line=shape(whole,'993-lubrication.'+key),[nose,rear]=span(line,0);
  // The thermostat end sits ahead of the right rear wheelhouse tub (x .595).
  // At the front bulkhead they pass under the warm-air duct at y .43, still
  // clear of the fuel tank's right side (y .40).
  assert(nose< -1.7&&rear>.58);assert(line.every(p=>p[1]>.41));
 }
 assert(shape(whole,'993-lubrication.tank').every(p=>p[0]<1.112-.30&&p[1]>.5));
 assert(shape(whole,'993-climate.compressor').some(p=>p[1]>.3));
 assert(shape(whole,'993-climate.rear-blower').every(p=>p[1]<-.36));
});
test('the 993 component studies are reachable through their installed parts and animate their moving components',()=>{
 const rows=[
  ['engine.intake','left','casting'],['993-lubrication.thermostat','insert','body'],
  ['993-lubrication.pump','pressure','case'],['993-climate.compressor','armature','body'],
  ['993-climate.blowers','wheel','housing'],['993-climate.exchanger-left',null,'jacket'],
  ['lights.fog-right',null,'reflector']
 ];
 for(const [id,moving,stationary] of rows){
  const v=getDetail(classic,id);assert(v?.componentIndex.size>=4,id);
  const render=t=>{const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});v.draw(r,t);return r.faces;};
  const a=render(0),b=render(.45);
  assert.deepEqual(new Set(a.map(f=>f.part)),new Set(v.componentIndex.keys()));
  assert.deepEqual(shape(a,v.id+'.'+stationary),shape(b,v.id+'.'+stationary));
  if(moving){assert(v.animated);assert.notDeepEqual(shape(a,v.id+'.'+moving),shape(b,v.id+'.'+moving));}
 }
 const cap=getDetail(classic,'993oilreg.cap');assert(cap.componentIndex.has('993oilregcap.retainer'));
 assert.equal(getDetail(classic,'993-climate.exchanger-left').id,getDetail(classic,'993-climate.exchanger-right').id);
});
