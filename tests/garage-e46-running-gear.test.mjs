import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {e46HubZ,e46Rotors,e46RotorSite} from '../garage/e46-running-gear.js';

function view(inspection={},isolate=false,wheelDesign='stock'){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{
  build:{vehicle:'bmw325ci',parts:[],paint:'silver',finish:'silver',wheelDesign},
  inspection,isolate,schematic:true,lights:true,progress:0,partPositions:new Map()
 });
 r.buildMesh();return r;
}
function points(faces,id,instance){const p=faces.filter(f=>f.part===id&&(!instance||f.instance===instance)).flatMap(f=>f.points);assert(p.length,id);return p;}
const range=(p,i)=>{const v=p.map(p=>p[i]);return [Math.min(...v),Math.max(...v)];};
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' vs '+b);
const regular=view().meshCache.faces;

test('325Ci independent suspension has front-only steering and separate rear spring and shock at each wheel',()=>{
 const front=points(regular,'steering.axle');assert(range(front,0)[1]<-1.22);
 const upper=points(regular,'suspension.upper-arms','rear-left'),lower=points(regular,'suspension.lower-arms','rear-left');
 const trailing=points(regular,'suspension.trailing-arms','rear-left');
 assert(range(trailing,0)[0]<.92&&range(trailing,0)[1]>1.39);
 assert(range(upper,1)[1]>-.20&&range(lower,1)[1]>-.20);
 assert(range(upper,2)[1]>range(lower,2)[1]+.07);
 const springs=points(regular,'suspension.spring','rear-left'),shocks=points(regular,'suspension.damper','rear-left');
 assert(range(springs,1)[0]>-.59&&range(shocks,1)[0]<-.65);
 assert(range(springs,2)[1]<.67&&range(shocks,2)[1]>.78);
 let local=upper.filter(p=>Math.abs(p[1]+.496)<.095);assert(Math.abs(range(local,2)[1]-range(springs,2)[0])<.024);
 const susp=getAssembly('bmw325ci','suspension');
 for(const id of ['suspension.wishbones','suspension.trailing-arms','suspension.upper-arms','suspension.lower-arms']){
  const row=susp.parts.find(p=>p.id===id);assert.match(row.source.url,/2003-bmw-325ci-coupe_m54_engine_e46/);
  assert(view({assembly:'suspension',part:id,onlyPart:true},true).faces.every(f=>f.part===id));
 }
});
test('the 325Ci uses identical measured brake envelopes in the wheel and brake views with either wheel',()=>{
 const changed=view({},false,'style68').meshCache.faces;
 const service=view({assembly:'brakes'},true).faces;
 for(const rear of [false,true])for(const side of [-1,1]){
  const id=rear?'rear':'front',corner=id+'-'+(side<0?'left':'right'),ax=e46RotorSite(rear,side);
  for(const tag of ['disc','caliper']){
   const installed=points(regular,'wheels.'+tag,corner),focused=points(service,'brakes.'+id+'-'+tag,corner);
   assert.deepEqual(focused,installed);assert.deepEqual(installed,points(changed,'wheels.'+tag,corner));
  }
  const rotor=points(regular,'wheels.disc',corner),d=e46Rotors[Number(rear)];
  near(range(rotor,2)[1]-range(rotor,2)[0],2*d.radius);
  const outerBand=rotor.filter(p=>Math.abs(Math.hypot(p[0]-ax[0],p[2]-ax[2])-d.radius)<1e-8);
  near(range(outerBand,1)[1]-range(outerBand,1)[0],d.thickness);
  const [lo,hi]=range(rotor,1);near(hi-lo,d.height);near(Math.max(Math.abs(lo),Math.abs(hi)),rear?.7885:.77725);
  near((range(rotor,2)[0]+range(rotor,2)[1])*.5,e46HubZ);
 }
});
test('the M54 shaft, center support, bearing and rolling-element views can be opened through the public catalog',()=>{
 const drivetrain=getAssembly('bmw325ci','drivetrain');
 assert(!drivetrain.parts.some(p=>p.id.includes('front-differential')));
 const focused=view({assembly:'drivetrain'},true).faces;
 for(const p of drivetrain.parts){
  assert.match(p.source.url,/2003-bmw-325ci-coupe_m54_engine_e46/);
  assert.deepEqual(points(focused,p.id),points(regular,p.id));
 }
 const powertrain=view({assembly:'powertrain'},true);
 assert.deepEqual(points(powertrain.faces,'powertrain.transmission'),points(focused,'drivetrain.gearbox'));
 assert(!powertrain.meshCache.faces.some(f=>f.part==='drivetrain.gearbox'));
 const mount=getDetail('bmw325ci','drivetrain.center-support'),bearing=getDetail('bmw325ci','e46shaftmount.bearing');
 assert.equal(getDetail('bmw325ci','drivetrain.propshaft').id,mount.id);
 assert.equal(mount.componentIndex.size,5);assert.equal(bearing.componentIndex.size,3);
 for(const d of [mount,bearing]){
  const r=view({detailView:d,expanded:true},true);
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(d.componentIndex.keys()));assert(r.activeLayout.canExpand);
 }
 assert.equal(getDetail('bmw325ci','drivetrain.gearbox'),null);
});

test('the formed cabin tunnel clears the installed gearbox, flex disc and propeller shaft',()=>{
 const tunnel=regular.filter(f=>f.part==='body.cabin-trim'&&f.points.every(p=>Math.abs(p[1])<.24)&&Math.min(...f.points.map(p=>p[0]))<1.37);
 function heightAt(t,x,y){
  const [a,b,c]=t,dx=b[0]-a[0],dy=b[1]-a[1],ex=c[0]-a[0],ey=c[1]-a[1],det=dx*ey-dy*ex;
  if(Math.abs(det)<1e-10)return Infinity;
  const u=((x-a[0])*ey-(y-a[1])*ex)/det,v=(dx*(y-a[1])-dy*(x-a[0]))/det;
  return u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8?a[2]+u*(b[2]-a[2])+v*(c[2]-a[2]):Infinity;
 }
 const tris=tunnel.flatMap(f=>f.points.slice(2).map((p,i)=>[f.points[0],f.points[i+1],p]));
 for(const id of ['drivetrain.gearbox','drivetrain.flex-disc','drivetrain.propshaft']){
  const samples=points(regular,id).filter(([x,y])=>x>=-.80&&x<=1.37&&Math.abs(y)<.14);
  const unique=new Map(samples.map(p=>[p.join(','),p]));
  for(const [x,y,z] of unique.values()){
   const underside=Math.min(...tris.map(t=>heightAt(t,x,y)));
   assert(Number.isFinite(underside)&&underside-z>.003,id+' intersects carpet at '+[x,y,z].join(', '));
  }
 }
});
