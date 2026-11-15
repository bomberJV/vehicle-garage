import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {drawG500InputShaft,drawG500Gearbox,transferInput,gearboxOutput} from '../garage/g500-propeller-shafts.js';
import {drawG500PickupFilter} from '../garage/g500-oil-circuits.js';
import {drawPortSeal} from '../garage/g500-exhaust-seal.js';
import {getG500Differentials} from '../garage/g500-differentials.js';
import {g500HalfWheelbase,g500HubZ} from '../garage/g500-underbody.js';

const mesh=fn=>{const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],inspection:{}});fn(r);return r.faces;};
const vertices=faces=>faces.flatMap(f=>f.points);
const extent=(ps,i)=>Math.max(...ps.map(p=>p[i]))-Math.min(...ps.map(p=>p[i]));
const eq=(a,b)=>assert(Math.abs(a-b)<1e-8,a+' vs '+b);
const area=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const covered=(faces,p)=>faces.some(face=>{
 const pts=face.points.map(q=>q.slice(1));
 for(let i=1;i+1<pts.length;i++){
  const a=pts[0],b=pts[i],c=pts[i+1],signed=area(a,b,c);
  if(Math.abs(signed)<1e-13)continue;
  if([area(a,b,p),area(b,c,p),area(c,a,p)].every(n=>n*Math.sign(signed)>=-1e-13))return true;
 }
 return false;
});

test('G500 intermediate shaft occupies the same 325 mm span and has six through-bores on both 108 mm faces',()=>{
 const installed=mesh(drawG500InputShaft),view=getDetail('g500','drivetrain.input-shaft');
 assert.equal(view.id,'g500-input-shaft');assert.equal(view.componentIndex.size,5);
 assert(view.animated);
 const detail=mesh(r=>view.draw(r)),points=vertices(installed),ref=vertices(detail);
 eq(extent(points,0),.325);eq(extent(points,1),.108);eq(extent(points,2),.108);
 assert.equal(points.length,ref.length);
 assert.notDeepEqual(vertices(mesh(r=>view.draw(r,.13))).slice(-20),ref.slice(-20));
 const center=gearboxOutput.map((n,i)=>(n+transferInput[i])/2);
 for(let i=0;i<points.length;i++)for(let j=0;j<3;j++)eq(ref[i][j]+center[j],points[i][j]);
 for(const face of [gearboxOutput,transferInput]){
  const end=installed.filter(f=>f.points.every(p=>Math.abs(p[0]-face[0])<1e-9));
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3,b=a+Math.PI/6;
   const root=[face[1]-.046*Math.cos(a),face[2]-.046*Math.sin(a)];
   assert(!covered(end,root));assert(covered(end,[face[1]-.046*Math.cos(b),face[2]-.046*Math.sin(b)]));
   const onBore=vertices(end).filter(p=>Math.abs(Math.hypot(p[1]-root[0],p[2]-root[1])-.005)<1e-9);
   assert(onBore.length>=12,'10 mm hole at '+a);
  }
 }
 const output=vertices(mesh(drawG500Gearbox));
 eq(Math.max(...output.map(p=>p[0])),gearboxOutput[0]);
 const transfer=vertices(mesh(getG500Differentials('g500').parts.find(p=>p.id==='differentials.center').draw));
 assert(transfer.some(p=>Math.abs(p[0]-transferInput[0])<1e-9&&Math.abs(Math.hypot(p[1]-transferInput[1],p[2]-transferInput[2])-.030)<1e-9));
});

test('front and rear propellers have separate cross joints, their own nominal spans and consistent aliases',()=>{
 for(const [side,route,length] of [['front','front-shaft',.950],['rear','propshaft',.990]]){
  const v=getDetail('g500','differentials.'+side+'-shaft');
  assert.equal(v.id,getDetail('g500','drivetrain.'+route).id);
  const f=mesh(r=>v.draw(r));eq(extent(vertices(f),0),length);
  assert.equal(new Set(f.map(g=>g.part)).size,8);
  for(const end of ['transfer','axle'])for(const id of ['cross','yokes','flange'])assert(v.componentIndex.has(v.id+'.'+end+'-'+id));
 }
});

test('the installed axle propellers meet the flat transfer and pinion faces at both ends',()=>{
 const parts=getG500Differentials('g500').parts;
 const shape=id=>mesh(parts.find(p=>p.id==='differentials.'+id).draw);
 const center=shape('center');
 for(const side of ['front','rear']){
  const front=side==='front',shaft=shape(side+'-shaft'),axle=shape(side);
  const sign=front?-1:1;
  const contacts=[
   [center,[.095+sign*.21,.120,.520],.065],
   [axle,[sign*(g500HalfWheelbase-.270),front?.1905:0,g500HubZ],.081]
  ];
  for(const [host,anchor,radius] of contacts){
   const onFace=faces=>vertices(faces.filter(f=>f.points.every(p=>Math.abs(p[0]-anchor[0])<1e-8)));
   const ring=(verts,r)=>verts.filter(p=>Math.abs(Math.hypot(p[1]-anchor[1],p[2]-anchor[2])-r)<1e-8);
   const receiver=ring(onFace(host),radius),flange=ring(onFace(shaft),.05);
   assert(receiver.length>=12,side+' receiver end face');
   assert(flange.length>=32,side+' matching, coaxial flange face');
  }
 }
});

test('ATF filter matches supplier drawing and the manifold seal has independent port and bolt openings',()=>{
 const f=vertices(mesh(r=>drawG500PickupFilter(r,[0,0,0])));
 eq(extent(f,1),.111);
 const neck=f.filter(p=>Math.abs(p[2]-.037)<1e-8);eq(extent(neck,0),.028);eq(extent(neck,1),.028);
 assert(f.some(p=>Math.abs(p[2]-.018)<1e-8&&Math.abs(p[0])>.09));
 const seal=mesh(r=>drawPortSeal(r,[0,0,0],1));
 const face=seal.filter(f=>f.points.every(p=>Math.abs(p[1])<1e-9)).map(f=>({points:f.points.map(p=>[p[1],p[0],p[2]])}));
 for(const [u,v] of [[0,0],[-138/87,-1/67],[137/87,6/67]])assert(!covered(face,[u*.022,v*.022]));
 assert(covered(face,[0,1.3*.022]));
 for(const side of ['left','right']){
  const key='g500-exhaust-manifold-'+side+'.gaskets';
  assert(getDetail('g500','exhaust.manifold-'+side).componentIndex.has(key));
  assert.equal(getDetail('g500',key).componentIndex.size,4);
 }
 assert.equal(getDetail('g500','exhaust.oxygen-sensors').componentIndex.size,4);
});
