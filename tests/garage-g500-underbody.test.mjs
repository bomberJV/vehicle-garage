import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {drawG500Rotor,g500HalfWheelbase,g500HubZ,g500SuspensionParts,g500RotorCenter} from '../garage/g500-underbody.js';
import {applySuspensionLift} from '../garage/lift-geometry.js';

function view(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{
  build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver'},inspection,isolate,
  progress:0,lights:true,schematic:true,partPositions:new Map()
 });
 r.buildMesh();return r;
}
function pts(faces,id,instance){
 const p=faces.filter(f=>f.part===id&&(!instance||f.instance===instance)).flatMap(f=>f.points);assert(p.length,id);return p;
}
const near=(a,b,e=1e-9)=>assert(Math.abs(a-b)<e,a+' vs '+b);
function ends(points,index){const v=points.map(p=>p[index]);return [Math.min(...v),Math.max(...v)];}

test('the G500 rear axle belongs at the rear hubs and has two forward-reaching trailing arms and one transverse track rod',()=>{
 const r=view(),f=r.faces,susp=getAssembly('g500','suspension');
 assert.deepEqual(g500SuspensionParts.map(p=>p.id),susp.parts.slice(-5).map(p=>p.id));
 for(const source of g500SuspensionParts)assert.match(source.source.url,/2002-mercedes_benz-g500/);
 const rails=pts(f,'suspension.frame');
 for(const x of [-1.425,1.425]){
  const upper=rails.filter(p=>Math.abs(p[0]-x)<.13);
  assert(upper.some(p=>p[2]>.85),'frame supports the upper spring and damper seats');
 }
 assert(rails.filter(p=>Math.abs(p[0])<.50).every(p=>p[2]<.53),'low center between raised axle sections');
 const front=pts(f,'steering.axle'),rear=pts(f,'suspension.rear-axle');
 assert(ends(front,0)[1]<-1.3);assert(ends(rear,0)[0]>1.3);
 for(const [id,axle,sign] of [['radius-arms','front',-1],['trailing-arms','rear',1]]){
  for(const side of ['left','right']){
   const p=pts(f,'suspension.'+id,axle+'-'+side),range=ends(p,0).map(x=>x*sign).sort((a,b)=>a-b);
   assert(range[0]<.60&&range[1]>g500HalfWheelbase);assert(ends(p,1).every(y=>side==='left'?y<0:y>0));
  }
  const rod=pts(f,'suspension.'+axle+'-track-bar'),[left,right]=ends(rod,1);
  assert(ends(rod,0).every(x=>sign*x>1.45));assert(left<-.4&&right>.4);
 }
 const lifted=applySuspensionLift(f,{vehicle:'g500',lift:{mode:'g500-orc-40'}});
 assert.deepEqual(pts(lifted,'suspension.rear-axle'),rear);
 for(const id of ['radius-arms','trailing-arms','front-track-bar','rear-track-bar']){
  const fixed=pts(f,'suspension.'+id),raised=pts(lifted,'suspension.'+id);
  const dz=raised.map((p,i)=>p[2]-fixed[i][2]);near(Math.min(...dz),0);near(Math.max(...dz),.04);
 }
});
test('both pairs of links open into independently selectable eyes, bushings and cushions',()=>{
 for(const row of g500SuspensionParts){
  const detail=getDetail('g500',row.id);
  assert(detail?.componentIndex.size>=3,row.id);
  const r=view({detailView:detail});
  for(const [id] of detail.componentIndex)assert(r.meshCache.faces.some(f=>f.part===id),id);
  if(row.id.endsWith('arms'))assert.equal(detail.componentIndex.size,5);
  if(row.id.endsWith('track-bar'))assert.equal(detail.componentIndex.size,3);
 }
});
test('the wheel and service routes draw the same hub-centered vented front and solid rear rotors',()=>{
 const top=view().meshCache.faces,brakes=view({assembly:'brakes'}).meshCache.faces;
 for(const rear of [false,true]){
  const axle=rear?'rear':'front',tag='brakes.'+axle,sign=rear?1:-1;
  const expected=view();expected.faces=[];
  const center=g500RotorCenter(rear,1);near(center[0],sign*g500HalfWheelbase);
  drawG500Rotor(expected,center,rear);
  const ref=expected.faces.flatMap(f=>f.points),x=ends(ref,0),y=ends(ref,1),z=ends(ref,2);
  near(x[1]-x[0],rear?.272:.315);near(y[1]-y[0],rear?.016:.030);near((z[0]+z[1])/2,g500HubZ);
  const wheel=pts(top,'wheels.disc',axle+'-right'),service=pts(brakes,tag);
  const totalHeight=rear?.097:.083;
  near(.8005-y[0],totalHeight);
  const key=p=>p.map(v=>v.toFixed(8)).join('/');
  for(const actual of [wheel,service]){
   const vertices=new Set(actual.map(key));for(const p of ref)assert(vertices.has(key(p)),tag);
  }
  // At the outer radius the vent gap remains open on the front rotor.
  const atOuter=ref.filter(p=>Math.hypot(p[0]-center[0],p[2]-center[2])>(rear?.135:.157));
  assert.equal(new Set(atOuter.map(p=>p[1].toFixed(8))).size,rear?2:4);
 }
});
test('differential and drivetrain routes preserve the same installed casings, shafts and rear wheel-end positions',()=>{
 const assembled=view({assembly:'differentials'}).meshCache.faces,drive=view({assembly:'drivetrain'}).meshCache.faces;
 for(const [id,alias] of [['front','front-differential'],['center','transfer'],['front-shaft','front-shaft'],['rear-shaft','propshaft']]){
  assert.deepEqual(pts(assembled,'differentials.'+id),pts(drive,'drivetrain.'+alias));
 }
 const rear=pts(assembled,'differentials.rear'),all=pts(drive,'drivetrain.rear-differential').concat(pts(drive,'drivetrain.halfshafts'));
 const coord=p=>p.map(v=>v.toFixed(7)).join(',');
 assert.deepEqual(new Set(rear.map(coord)),new Set(all.map(coord)));
 const half=pts(drive,'drivetrain.halfshafts'),[low,high]=ends(half,2);near((low+high)/2,g500HubZ);
 const transfer=getAssembly('g500','differentials');
 assert.match(transfer.description,/permanent four-wheel drive/i);
 assert.match(transfer.parts.find(p=>p.id==='differentials.center').description,/motor selects high or low.*vacuum-operated/i);
});

test('five wheel bolt axes and the center pilot pass through both rotor hats at the wheel mounting plane',async()=>{
 const {drawG500Disc,g500BoltPattern,g500DiscSpecs}=await import('../garage/g500-rotors.js');
 const {count,radius,phase}=g500BoltPattern;
 function contains(poly,x,z){
  let inside=false;
  for(let i=0,k=poly.length-1;i<poly.length;k=i++){
   const [a,,b]=poly[i],[c,,d]=poly[k];
   if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside;
  }
  return inside;
 }
 for(const rear of [false,true])for(const side of [-1,1]){
  const faces=[],mesh={polygon:points=>faces.push(points)};
  drawG500Disc(mesh,[0,0,0],rear,side);
  const spec=g500DiscSpecs[rear?'rear':'front'],mount=side*(spec.height-spec.thickness/2);
  const facePlanes=[mount,mount-side*.005];
  for(const position of facePlanes){
   const web=faces.filter(poly=>poly.every(p=>Math.abs(p[1]-position)<1e-10));
   assert(web.length>40);
   const covered=(a,rad)=>web.some(p=>contains(p,rad*Math.cos(a),rad*Math.sin(a)));
   assert.equal(covered(0,.039),false,'open pilot');
   assert.equal(covered(.012,.05),true,'mounting face around the pilot');
   for(let i=0;i<count;i++){
    const a=phase+i*Math.PI*2/count;
    assert.equal(covered(a,radius),false);assert.equal(covered(a,radius+.006),false);
    assert.equal(covered(a,radius+.009),true,'material beside each bore');
   }
  }
 }
});
test('front hub details retain the supplier bore, width, cup diameter and 23 rollers at installed and display scale',async()=>{
 const {drawG500Bearing}=await import('../garage/g500-wheel-bearings.js');
 const {getAssembly}=await import('../garage/assemblies.js');
 const wheelGroup=getAssembly('g500','wheels'),installed=view().meshCache.faces;
 for(const [kind,d,D,B,C] of [['inner',50,80,20,15.5],['outer',55,90,23,17.5]]){
  const id='wheels.'+kind+'-bearing',detail=getDetail('g500',id);
  assert(wheelGroup.parts.some(p=>p.id===id));assert.equal(detail.componentIndex.size,4);
  assert.equal(detail.sources.filter(s=>s.url.includes('cadpublisher')).length,2);
  for(const side of [-1,1]){
   const all=pts(installed,id,side<0?'front-left':'front-right'),data=[];
   const center=[-g500HalfWheelbase,side*(.7575+(kind==='inner'?-.047:-.003)),g500HubZ];
   drawG500Bearing({polygon:p=>data.push(...p)},kind,center,side*(kind==='inner'?-1:1));
   assert.deepEqual(all,data);
  }
  for(const scale of [.001,.014]){
   const shape=element=>{const points=[];drawG500Bearing({polygon:p=>points.push(...p)},kind,[0,0,0],1,scale,element);return points;};
   const cone=shape('cone'),cup=shape('cup'),radii=p=>p.map(([x,,z])=>Math.hypot(x,z));
   near(Math.min(...radii(cone))*2,d*scale);near(Math.max(...radii(cup))*2,D*scale);
   near(ends(cone,1)[1]-ends(cone,1)[0],B*scale);near(ends(cup,1)[1]-ends(cup,1)[0],C*scale);
   // Each eight-sided roller has eight caps at each end plus eight taper facets.
   const mesh=[];drawG500Bearing({polygon:p=>mesh.push(p)},kind,[0,0,0],1,scale,'rollers');
   assert.equal(mesh.filter(f=>f.length===4).length,23*8);
  }
 }
});
test('rear parking-shoe linings are 40 mm wide and meet, but do not cross, the 160 mm drum at full engagement',async()=>{
 const {drawG500ParkingShoe}=await import('../garage/g500-rotors.js');
 for(const side of [-1,1])for(const shoe of [-1,1])for(const engagement of [0,.5,1]){
  const points=[];drawG500ParkingShoe({polygon:p=>points.push(...p)},[0,0,0],side,shoe,1,engagement);
  near(ends(points,1)[1]-ends(points,1)[0],.040);
  const edge=Math.max(...points.map(([x,,z])=>Math.hypot(x,z)));
  assert(edge<=.08+1e-9);if(engagement===1)near(edge,.08);
 }
});
