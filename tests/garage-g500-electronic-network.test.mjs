import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {getAssemblies,getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {g500ElectronicNetworkRows,g500ElectronicAnchors as A,g500ElectronicPorts as P,g500CanBMembership,g500CanCMembership} from '../garage/g500-electronic-network.js';

function scene(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver'},inspection,isolate,schematic:true,lights:true,progress:0,partPositions:new Map()});
 r.buildMesh();return r;
}
const whole=scene(),electrical=scene({assembly:'electrical'},true),engine=scene({assembly:'powertrain'},true);
const points=(faces,id)=>faces.filter(face=>face.part===id).flatMap(face=>face.points);
const bounds=(pp,axis)=>[Math.min(...pp.map(p=>p[axis])),Math.max(...pp.map(p=>p[axis]))];
const near=(pp,p,epsilon=.016)=>pp.some(v=>Math.hypot(...v.map((n,i)=>n-p[i]))<epsilon);
const group=getAssembly('g500','electrical');
const rows=g500ElectronicNetworkRows.map(row=>group.parts.find(p=>p.id==='electrical.'+row[0]));

test('every new electronic item has original installed geometry, an identical focused copy, a public nested study and reachable circuit links',()=>{
 const allParts=new Set(getAssemblies('g500').flatMap(a=>a.parts.map(p=>p.id)));
 assert.equal(rows.length,41);
 assert.equal(new Set(rows.map(p=>p.id)).size,rows.length);
 for(const p of rows){
  const installed=points(whole.meshCache.faces,p.id);assert(installed.length,p.id);
  assert(installed.every(v=>v.length===3&&v.every(Number.isFinite)),p.id);
  assert.deepEqual(points(electrical.faces,p.id),installed,p.id);
  assert(getDetail('g500',p.id)?.componentIndex.size>=4,p.id);
  for(const target of p.connectsTo)assert(allParts.has(target),p.id+' → '+target);
  assert(p.source.url.startsWith('https://'));
 }
 assert(new Set(group.sources.map(ref=>ref.url)).size>=4);
 assert.match(group.description,/Differential-lock.*separate hardwired/);
});

test('engine and electrical aliases have exactly one shared ECU, alternator and starter without doubled installed surfaces',()=>{
 for(const key of ['ecu','alternator','starter']){
  const canonical=points(whole.meshCache.faces,'electrical.'+key);
  assert(canonical.length);
  assert.equal(points(whole.meshCache.faces,'powertrain.'+key).length,0);
  assert.deepEqual(points(engine.faces,'powertrain.'+key),canonical,key);
  assert.equal(points(engine.meshCache.faces,'electrical.'+key).length,0);
  assert.equal(getDetail('g500','electrical.'+key).id,getDetail('g500','powertrain.'+key).id);
 }
 const ecu=points(whole.meshCache.faces,'electrical.ecu');
 assert(bounds(ecu,1)[0]>.68&&bounds(ecu,0)[0]>-.77);
 assert(bounds(ecu,2)[1]<1.20,'ECU belongs under the right dashboard, not above the hood');
 const rearSam=points(whole.meshCache.faces,'electrical.sam-rear'),transfer=points(whole.meshCache.faces,'electrical.transfer');
 assert(bounds(rearSam,0)[1]<.40&&bounds(transfer,2)[1]<bounds(rearSam,2)[0]);
 assert(bounds(points(whole.meshCache.faces,'electrical.rear-seat-heat'),0)[0]>1.7);
});

test('the early CAN topology keeps the proper physical connector groups and excludes hardwired lock and rear heater controls',()=>{
 assert.deepEqual(g500CanBMembership.canB6,['eis','cluster','steering-column','door-front-left']);
 assert(g500CanBMembership.canB4.includes('door-front-right')&&g500CanBMembership.canB7.includes('door-rear-left'));
 assert.deepEqual(new Set(g500CanCMembership),new Set(['ecu','tcm','esm','transfer','esp','eis','cluster','steering-column']));
 const nodes=[...Object.values(g500CanBMembership).flat(),...g500CanCMembership];
 assert(!nodes.includes('diff-lock-control')&&!nodes.includes('rear-seat-heat'));
 for(const key of ['canB6','canB4','canB7'])assert(near(points(whole.meshCache.faces,'electrical.can-b-connectors'),A[key]));
 assert(near(points(whole.meshCache.faces,'electrical.can-c-connector'),A.canC));
 for(const id of g500CanCMembership)assert(near(points(whole.meshCache.faces,'electrical.can-c'),P[id]),id);
 const body=points(whole.meshCache.faces,'electrical.can-b');
 for(const id of Object.values(g500CanBMembership).flat())if(P[id])assert(near(body,P[id]),id);
});

test('power, engine, range, stability and roof circuits reach their actual shared model endpoints',()=>{
 const power=points(whole.meshCache.faces,'electrical.primary-power');
 for(const id of ['prefuse','jump','alternator','starter'])assert(near(power,A[id],.012),id);
 const loom=points(whole.meshCache.faces,'electrical.engine-harness');
 for(const p of [P.ecu,A.maf,A.throttle])assert(near(loom,p,.012));
 for(const side of [-1,1])for(const xx of [-1.475,-1.315,-1.155,-.995])assert(near(loom,[xx,side*.429,1.166],.008));
 const control=points(whole.meshCache.faces,'electrical.chassis-control-harness');
 for(const p of [P.tcm,P.transfer,P.esp,P['yaw-sensor'],A.transferActuator,A.transmissionPlug])assert(near(control,p,.012));
 assert(near(points(whole.meshCache.faces,'electrical.roof-circuit'),A.roofMotor,.010));
 assert(near(points(whole.meshCache.faces,'roof.drive'),A.roofMotor,.060));
});

test('door electronics remain attached to their own doors and new equipment stays within the established vehicle envelope',()=>{
 for(const [id,mount] of [['front-left','left-front'],['front-right','right-front'],['rear-left','left-rear'],['rear-right','right-rear']]){
  const faces=whole.meshCache.faces.filter(f=>f.part==='electrical.door-'+id);assert(faces.length);
  assert(faces.every(face=>face.rigid?.name===mount));
 }
 const allNew=rows.flatMap(p=>points(whole.meshCache.faces,p.id));
 assert(allNew.every(([xx,yy,zz])=>xx>-2.119&&xx<2.225&&Math.abs(yy)<.95&&zz>.040&&zz<2.017));
 // The existing cabin battery and prefuse are retained in their original rows.
 assert.equal(group.parts.filter(p=>p.id==='electrical.battery').length,1);
 assert.equal(group.parts.filter(p=>p.id==='electrical.battery-box').length,1);
});

test('specialist cutaways separate the relevant mechanisms instead of inventing a common factory circuit board',()=>{
 const expected={
  'electrical.cluster':['dials','pointers','display','rear-board'],
  'electrical.diff-lock-control':['buttons','contacts','indicators'],
  'electrical.abs-unit':['block','pump','fittings','plug'],
  'electrical.lock-valves':['body','coil','core','connector'],
  'electrical.alternator':['rotor','windings','output','drive'],
  'electrical.starter':['rotor','windings','output','drive']
 };
 for(const [id,children] of Object.entries(expected)){
  const detail=getDetail('g500',id),nested=scene({detailView:detail,expanded:true,separation:100},true);
  for(const suffix of children){
   const child=detail.groups[0].parts.find(p=>p.id.endsWith('.'+suffix));assert(child,id+' / '+suffix);
   assert(points(nested.faces,child.id).length,child.id);
  }
  assert(nested.faces.every(f=>f.points.every(p=>p.every(Number.isFinite))));
  assert(nested.activeLayout.canExpand);
 }
 assert.match(getDetail('g500','electrical.ecu').description,/without claiming an exact internal board layout/);
});

test('the installed diagnostic connector uses the same 4 mm pitch, 8.6 mm row spacing and 37.05 mm face as its cutaway',()=>{
 const view=getDetail('g500','electrical.diagnostic'),r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});view.draw(r);
 const installed=points(whole.meshCache.faces,'electrical.diagnostic');
 const detailed=r.faces.filter(f=>f.part.endsWith('.carrier')).flatMap(f=>f.points)
   .map(([x,y,z])=>[x/.022,y/.022,z/.022-10]);
 const native=installed.map(p=>[(p[0]-A.diagnostic[0])*1000,(p[1]-A.diagnostic[1])*1000,(A.diagnostic[2]-p[2])*1000]);
 for(const mesh of [detailed,native]){
   const front=mesh.filter(p=>Math.abs(p[2])<1e-8),[a,b]=bounds(front,0);
   assert(Math.abs(b-a-37.05)<1e-8);
   for(let i=0;i<8;i++)for(const row of [-4.3,4.3]){
     const x=(i-3.5)*4;assert(near(front,[x+1.1,row+1.59,0],1e-7));
     assert(near(mesh,[x+.65,row+1.06,-6.5],1e-7),'open cavity extends behind face');
   }
 }
});

test('the overhead electronics and its CAN branch stay aft of the windscreen plane in the pillar and roof brow',()=>{
 const consoleMesh=points(whole.meshCache.faces,'electrical.overhead-panel');
 assert(bounds(consoleMesh,0)[0]>-.432&&bounds(consoleMesh,2)[1]<=1.929);
 const overhead=points(whole.meshCache.faces,'electrical.can-b').filter(([, ,z])=>z>1.36);
 assert(overhead.length>0);
 for(const [x,y,z] of overhead){
   if(z<1.895){assert(y>.795&&y<.85);assert(x>-.793+(z-1.264)*(.325/.663));}
   if(Math.abs(y)<.70)assert(x>-.432&&z<1.929);
 }
 assert(near(overhead,P['overhead-panel'],.010));
});
