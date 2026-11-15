import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getEngineDefinition} from '../garage/engine-data.js';
import {buildEngineBay} from '../garage/engine-geometry.js';
import {findInVehicle} from '../garage/inspection-search.js';

const vehicle='bmw325ci';
const fixture=()=>Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[]},faces:[],partPositions:new Map()});
const shapes=(faces,id)=>faces.filter(f=>f.part===id).map(f=>f.points);
const range=(faces,i)=>{const vals=faces.flat().map(p=>p[i]);return [Math.min(...vals),Math.max(...vals)];};
test('325Ci installs its M54 throttle below the DISA, retains two cam adjusters, and drains the separator into the dipstick guide',()=>{
 const r=fixture();buildEngineBay(r);
 const part=name=>shapes(r.faces,'powertrain.'+name);
 const [x0,x1]=range(part('intake'),0),throttle=range(part('throttle'),0);
 assert(throttle[0]>x0&&throttle[1]<x1,'throttle on side of casting');
 assert(range(part('throttle'),2)[1]<range(part('disa'),2)[1]-.043);
 assert(range(part('airbox'),0)[0]<range(part('maf'),0)[0]);
 assert(range(part('maf'),0)[0]<throttle[0]);
 assert(range(part('coolant-reservoir'),1)[1]<-.40,'coolant tank next to left half of radiator');
 assert(range(part('vanos'),0)[0]<range(part('camshafts'),0)[0]);
 const vanos=part('vanos').flat();
 assert(vanos.some(p=>p[1]>.18)&&vanos.some(p=>p[1]<-.18),'two external solenoid bodies');
 const guide=part('dipstick-guide').flat(),ccv=part('ccv').flat();
 assert(guide.some(p=>ccv.some(q=>Math.hypot(...p.map((v,i)=>v-q[i]))<.006)),'drain and guide meet');
 const definition=getEngineDefinition(vehicle),component=id=>definition.components.find(p=>p.id==='powertrain.'+id);
 assert.equal(component('ccv').connections.find(c=>c.id==='powertrain.dipstick-guide').kind,'oil');
 assert.equal(component('ccv').connections.find(c=>c.id==='powertrain.intake').kind,'crankcase gas');
 assert.match(component('disa').source.url,/#page=42/);
 assert(r.faces.length<10000);
});
test('M54 resonance flap pivots about its shaft; the vacuum rod and diaphragm follow the same cycle',()=>{
 const detail=getDetail(vehicle,'powertrain.disa');assert.equal(detail.id,'m54disa');assert(detail.animated);
 assert.equal(getDetail('hrv','powertrain.disa'),null);
 const frame=t=>{const r=fixture();detail.draw(r,t);return r.faces;};
 const closed=frame(0),open=frame(.5);
 assert.deepEqual(new Set(open.map(f=>f.part)),new Set(detail.componentIndex.keys()));
 const window=(faces,i)=>range(shapes(faces,'m54disa.flap'),i);
 assert(window(closed,2)[1]>.20&&window(closed,0)[1]<.013);
 assert(window(open,0)[1]>.20&&window(open,2)[1]<.013);
 for(const p of ['frame','capsule','solenoid','shaft'])assert.deepEqual(shapes(closed,'m54disa.'+p),shapes(open,'m54disa.'+p));
 for(const p of ['linkage','diaphragm'])assert.notDeepEqual(shapes(closed,'m54disa.'+p),shapes(open,'m54disa.'+p));
 assert.deepEqual(shapes(closed,'m54disa.linkage'),shapes(frame(1),'m54disa.linkage'));
 assert(findInVehicle(vehicle,'resonance flap',20).some(link=>link.part==='powertrain.disa'||link.path.includes('powertrain.disa')));
});

test('all installed BMW fuel and engine views draw one identical rail and one set of six injectors',()=>{
 const r=fixture(),snapshot=()=>r.meshCache.faces;
 const vertices=faces=>faces.map(f=>f.points);
 const railParts=faces=>faces.filter(f=>f.part==='powertrain.fuel-rail'||f.part==='powertrain.injectors');
 r.inspection={};r.buildMesh();
 const service=snapshot().filter(f=>f.part==='fuel.rail');
 assert(service.length>0);assert.equal(railParts(snapshot()).length,0);
 assert.equal(new Set(service.filter(f=>f.instance!=='bank-0').map(f=>f.instance)).size,6);
 for(const [assembly,clipped] of [['powertrain',false],['body',true],[null,true],['fuel',false],['fuel',true]]){
  r.sectionPlane=clipped?{axis:2,percent:100}:null;
  r.inspection={assembly};r.isolate=assembly==='powertrain'||assembly==='fuel';r.buildMesh();
  if(assembly==='fuel'){
   assert.equal(railParts(snapshot()).length,0);
   assert.deepEqual(vertices(snapshot().filter(f=>f.part==='fuel.rail')),vertices(service));
   assert(r.faces.some(f=>f.part==='fuel.rail'));
  }else{
   assert.equal(snapshot().filter(f=>f.part==='fuel.rail').length,0);
   assert.deepEqual(vertices(railParts(snapshot())),vertices(service));
  }
 }
 const rail=service.filter(f=>f.instance==='bank-0'),n=rail.length;
 // End ring of the fuel supply meets the rail tail's end ring. The two rings
 // have different radii; their center points are the shared hose connection.
 const tail=rail.slice(n-8),supply=snapshot().filter(f=>f.part==='fuel.supply').slice(-8);
 const centre=faces=>faces.reduce((a,f)=>a.map((v,i)=>v+f.points[1][i]/faces.length),[0,0,0]);
 assert(Math.hypot(...centre(tail).map((v,i)=>v-centre(supply)[i]))<1e-10);
});

test('the installed M54 engine, rail and all six injectors clear the actual closed bonnet skin',()=>{
 const r=fixture();r.inspection={};r.buildMesh();const whole=r.meshCache.faces,triangles=[];
 for(const f of whole.filter(f=>f.part==='body.hood')){
  for(let i=0;i<f.triangles.length;i+=3)triangles.push(f.triangles.slice(i,i+3).map(k=>f.points[k]));
 }
 function hoodHeight([x,y]){
  let z=-Infinity;
  for(const [a,b,c] of triangles){
   const d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
   if(Math.abs(d)<1e-12)continue;
   const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/d,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/d;
   if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)z=Math.max(z,u*a[2]+v*b[2]+(1-u-v)*c[2]);
  }
  return z;
 }
 const installed=whole.filter(f=>f.part==='fuel.rail').flatMap(f=>f.points);
 const railClearances=installed.map(p=>hoodHeight(p)-p[2]).filter(Number.isFinite);
 assert(railClearances.length>150);assert(Math.min(...railClearances)>.06,'shared rail and injectors lie beneath the closed bonnet');
 r.inspection={assembly:'powertrain'};r.isolate=true;r.buildMesh();
 for(const id of ['valve-cover','intake','coils','vanos','radiator','fuel-rail','injectors','sump']){
  const points=shapes(r.faces,'powertrain.'+id).flat(),clearance=points.map(p=>hoodHeight(p)-p[2]).filter(Number.isFinite);
  assert(clearance.length>10&&Math.min(...clearance)>.008,id+' clears the closed bonnet');
 }
});
