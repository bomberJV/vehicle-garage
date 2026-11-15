import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildC63Exterior,buildHrvExterior} from '../garage/exterior-modern.js';
function mesh(fn){const r=Object.create(GarageRenderer.prototype);r.faces=[];r.currentPart=null;r.lights=true;fn(r,'#58634d');return r.faces;}
function coversXZ(face,x,z){const ps=face.points;for(let i=1;i<ps.length-1;i++){const [a,b,c]=[ps[0],ps[i],ps[i+1]],d=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(d)<1e-9)continue;const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/d,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/d;if(u>=0&&v>=0&&u+v<=1)return true;}return false;}
for(const [name,fn,wb] of [['c63',buildC63Exterior,2.76],['hrv',buildHrvExterior,2.654]]){
 test(`${name} exterior has finite separate inspectable surfaces and bounded scale`,()=>{
  const faces=mesh(fn),pts=faces.flatMap(f=>f.points),tags=new Set(faces.map(f=>f.part));
  assert(pts.every(p=>p.length===3&&p.every(Number.isFinite)));for(const id of ['body.hood','body.door','body.glass','lighting.headlamp','lighting.indicator'])assert(tags.has(id));
  const width=Math.max(...pts.map(p=>p[1]))-Math.min(...pts.map(p=>p[1]));assert(width>1.8&&width<2.1);
  const length=Math.max(...pts.map(p=>p[0]))-Math.min(...pts.map(p=>p[0]));assert(length>4.4&&length<4.8);
  const top=Math.max(...pts.map(p=>p[2]));assert(name==='c63'?top>1.4&&top<1.48:top>1.58&&top<1.66);
 });
 test(`${name} front and rear upper wheel openings are not filled by body-side polygons`,()=>{
  const side=mesh(fn).filter(f=>f.part==='body.door'&&f.points.every(p=>p[1]<-.75)&&Math.max(...f.points.map(p=>p[1]))-Math.min(...f.points.map(p=>p[1]))<.13);
  for(const axle of [-wb/2,wb/2])assert(!side.some(f=>coversXZ(f,axle,.60)),`${name} body closes wheel opening at axle ${axle}`);
 });
}

import {buildBmwExterior} from '../garage/exterior-bmw.js';
import {roadWheelSpokes} from '../garage/exterior-alloys.js';

for(const [name,make,expected] of [['E46',buildBmwExterior,2],['W204',buildC63Exterior,4],['HR-V',buildHrvExterior,4]]){
 test(name+' keeps the open shell, window and trim of each door on a single rigid transform',()=>{
  const faces=mesh(make),doors=new Map();
  for(const f of faces){
   if(!f.rigid?.name.includes('door-'))continue;
   if(!doors.has(f.rigid.name))doors.set(f.rigid.name,[]);
   doors.get(f.rigid.name).push(f);
  }
  assert.equal(doors.size,expected);
  for(const [name,group] of doors){
   assert(group.some(f=>f.part==='body.glass'),name+' missing pane');
   const expectedSkin={'front-door-left':'body.door','front-door-right':'body.front-right','rear-door-left':'body.rear-door','rear-door-right':'body.rear-right'}[name];
   assert(group.some(f=>f.part===expectedSkin),name+' missing skin');
   assert(group.some(f=>f.color==='#494d49'),name+' missing inner card');
   assert(group.every(f=>JSON.stringify(f.rigid.offset)===JSON.stringify(group[0].rigid.offset)));
   assert.equal(Math.sign(group[0].rigid.offset[1]),name.endsWith('left')?-1:1);
  }
  assert(faces.some(f=>f.part==='body.structure'&&f.points.every(p=>p[2]>1.23)));
  assert(faces.some(f=>f.part==='body.deck'&&f.rigid?.offset[2]>.4));
  assert(faces.filter(f=>f.part==='body.hood').every(f=>f.rigid?.name==='bonnet'));
 });
}
test('facelift C63 and US HR-V rear lenses wrap with single-valued positive lens thickness',()=>{
 for(const make of [buildC63Exterior,buildHrvExterior]){
  const tail=mesh(make).filter(f=>f.part==='lighting.indicator'&&f.points.every(p=>p[0]>1.95&&p[2]>.75));
  assert(tail.length>=32);
  for(const face of tail){
   const [a,b,c,d]=face.points;assert.equal(a[0],d[0]);assert.equal(a[1],d[1]);
   assert.equal(b[0],c[0]);assert.equal(b[1],c[1]);assert(c[2]>b[2]);assert(d[2]>a[2]);
  }
 }
});
test('model-specific alloy wheel faces are distinct and leave depth between the spokes and rim lip',()=>{
 const signatures=new Set();
 for(const vehicle of ['bmw325ci','c63','hrv']){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:'wheels.rim'});
  roadWheelSpokes(r,{vehicle,x:0,y:0,z:0,side:1,rim:.22,finish:'#a7b3b4'});
  const holes=r.faces.filter(f=>f.color==='#323b3f');assert.equal(holes.length,5*12);
  const points=r.faces.flatMap(f=>f.points);
  assert(Math.min(...points.map(p=>p[1]))<0);assert(Math.max(...points.map(p=>p[1]))<.020);
  assert(points.every(p=>p.every(Number.isFinite)));
  signatures.add(JSON.stringify(r.faces.slice(0,12).map(f=>f.points)));
 }
 assert.equal(signatures.size,3);
});
