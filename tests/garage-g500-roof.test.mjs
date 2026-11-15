import assert from 'node:assert/strict';
import test from 'node:test';
import {getDetail} from '../garage/detail-catalog.js';
import {drawG500ServiceAssembly,g500InstalledRoofTop,g500RoofPose,getG500ServiceAssemblies} from '../garage/g500-service-systems.js';
import {GarageRenderer} from '../garage/render.js';

const renderer=()=>Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
function vertices(view,t,id){const r=renderer();view.draw(r,t);return r.faces.filter(f=>f.part===view.id+'.'+id).flatMap(f=>f.points);}
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);

test('the sliding roof releases its seal before entering the cassette and closes flush',()=>{
 const closed=g500RoofPose(0),release=g500RoofPose(.08),open=g500RoofPose(.5);
 near(closed.slide,0);near(closed.drop,0);
 assert.equal(release.slide,0);assert(release.drop<0);
 assert(open.slide>.7&&open.drop<release.drop);
 const view=getDetail('g500','roof.cassette');
 const a=vertices(view,0,'panel'),b=vertices(view,.5,'panel');
 assert.equal(a.length,b.length);
 a.forEach((p,i)=>{near(b[i][0]-p[0],open.slide);near(b[i][1],p[1]);near(b[i][2]-p[2],open.drop);});
 const c=vertices(view,1,'panel');a.forEach((p,i)=>p.forEach((v,k)=>near(c[i][k],v)));
 const installed=renderer();drawG500ServiceAssembly(installed,'g500','roof','#697468');
 const panel=installed.faces.filter(f=>f.part==='roof.panel');
 near(Math.max(...panel.flatMap(f=>f.points.map(p=>p[2]))),g500InstalledRoofTop);
 near(g500InstalledRoofTop-.040,1.977);
 const parts=getG500ServiceAssemblies('g500').find(g=>g.id==='roof').parts;
 assert.deepEqual(new Set(installed.faces.map(f=>f.part)),new Set(parts.map(p=>p.id)));
 for(const face of installed.faces.filter(f=>!['roof.drive','roof.cable'].includes(f.part)))assert.equal(face.rigid.name,'roof');
});

test('the rear-lift view keeps its front pivot and rigid panel dimensions',()=>{
 const view=getDetail('g500','roof.lift');assert(view?.animated);
 assert.equal(getDetail('g500','g500-roof-cassette.lifters').id,view.id);
 const a=vertices(view,0,'seal'),b=vertices(view,.5,'seal');
 const pivot=a.findIndex(p=>Math.abs(p[0]+.574)<1e-12&&Math.abs(p[2]-.259)<1e-12);
 assert(pivot>=0);a[pivot].forEach((v,k)=>near(b[pivot][k],v));
 const rear=a.findIndex(p=>Math.abs(p[0]-.347)<1e-12&&Math.abs(p[2]-.259)<1e-12);
 assert(b[rear][2]>a[rear][2]+.07);
 const distance=(p,q)=>Math.hypot(...p.map((v,k)=>v-q[k]));
 for(let i=0;i<a.length;i++)near(distance(a[i],a[pivot]),distance(b[i],b[pivot]));
 assert.equal(g500RoofPose(.5,'tilt').slide,0);
});

test('roof guides, shade and drainage remain separately pickable throughout both modes',()=>{
 for(const id of ['roof.cassette','roof.lift']){
  const view=getDetail('g500',id),expected=new Set(view.componentIndex.keys());
  for(const t of [0,.08,.25,.5,.75,1]){
   const r=renderer();view.draw(r,t);
   assert.deepEqual(new Set(r.faces.map(f=>f.part)),expected);
   for(const face of r.faces)assert(face.points.length>=3&&face.points.every(p=>p.every(Number.isFinite)));
  }
 }
 const view=getDetail('g500','roof.cassette');
 for(const id of ['sliders','lifters','seal','drip-rail','sunshade','drains','deflector-levers','deflector-springs'])assert(view.componentIndex.has(view.id+'.'+id),id);
 // The wind-deflector arms rotate at their hinges instead of stretching as the blade rises.
 const armLength=t=>{
  const r=renderer();view.draw(r,t);
  const p=r.faces.find(f=>f.part===view.id+'.deflector-levers').points;
  return Math.hypot(...p[0].map((v,k)=>v-p[1][k]));
 };
 near(armLength(0),armLength(.25));near(armLength(0),armLength(.5));
 for(const id of ['roof.sunshade','roof.drainage'])assert.equal(getDetail('g500',id).id,view.id);
});
