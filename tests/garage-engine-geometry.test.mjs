import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildEngineBay,enginePartOffset,ENGINE_LAYOUTS} from '../garage/engine-geometry.js';
import {getEngineDefinition} from '../garage/engine-data.js';
const vehicles=['g500','bmw325ci','c63','hrv','f350'];
function mesh(vehicle,detail=true){const r=Object.create(GarageRenderer.prototype);Object.assign(r,{build:{vehicle},faces:[],currentPart:null});buildEngineBay(r,getEngineDefinition(vehicle),{detail});return r.faces;}
const facesFor=(faces,id)=>faces.filter(f=>f.part===`powertrain.${id}`);
const bounds=faces=>{const pts=faces.flatMap(f=>f.points);return [0,1,2].map(i=>[Math.min(...pts.map(p=>p[i])),Math.max(...pts.map(p=>p[i]))]);};
test('every engine leaf has finite tagged geometry and remains within the detail face budget',()=>{
 for(const vehicle of vehicles){const faces=mesh(vehicle),tags=new Set(faces.map(f=>f.part)),d=getEngineDefinition(vehicle);assert(faces.length<10000,`${vehicle}: ${faces.length} faces`);for(const p of d.components)assert(tags.has(p.id),`${vehicle} missing ${p.id}`);for(const f of faces){assert(f.points.length>=3);assert.match(f.color,/^#[0-9a-f]{6}$/i);for(const p of f.points)assert(p.every(Number.isFinite));}}
});
test('closed hoods do not get pierced by a coarse engine proxy',()=>{for(const v of vehicles)assert.equal(mesh(v,false).length,0);});
test('physical piston and plug meshes retain each engine cylinder and ignition architecture',()=>{
 for(const vehicle of vehicles.filter(v=>v!=='f350')){const faces=mesh(vehicle),d=getEngineDefinition(vehicle);const pistonCaps=facesFor(faces,'pistons').filter(f=>f.points.length===14);assert.equal(pistonCaps.length,2*d.cylinders,`${vehicle} piston solids`);const plugCaps=facesFor(faces,'spark-plugs').filter(f=>f.points.length===8);assert.equal(plugCaps.length,2*d.cylinders*d.plugsPerCylinder,`${vehicle} ceramic plug bodies`);}
});
test('the HR-V cylinder row is transverse and the M54 cylinder row longitudinal',()=>{
 const h=bounds(facesFor(mesh('hrv'),'pistons')),b=bounds(facesFor(mesh('bmw325ci'),'pistons'));assert(h[1][1]-h[1][0]>(h[0][1]-h[0][0])*2);assert(b[0][1]-b[0][0]>(b[1][1]-b[1][0])*2);
});
test('the E46 and G500 engine bays show a remote power interface instead of an underhood battery box',()=>{
 for(const vehicle of ['g500','bmw325ci']){const b=bounds(facesFor(mesh(vehicle),'battery'));assert(b[0][1]-b[0][0]<.20);assert(b[2][1]-b[2][0]<.30);}
});
test('engine expansion opens the head and cover while retaining finite rigid offsets',()=>{
 for(const vehicle of vehicles.filter(v=>v!=='f350')){const d=getEngineDefinition(vehicle);for(const p of d.components)assert(enginePartOffset(p.id,vehicle).every(Number.isFinite));assert(enginePartOffset('powertrain.valve-cover',vehicle)[2]>enginePartOffset('powertrain.head',vehicle)[2]);assert(enginePartOffset('powertrain.head',vehicle)[2]>enginePartOffset('powertrain.block',vehicle)[2]);assert(enginePartOffset('powertrain.sump',vehicle)[2]<0);}
});

test('M113.962 air, ignition and service-fluid placements match the G500 layout',()=>{
 const faces=mesh('g500'),part=id=>facesFor(faces,id),span=id=>bounds(part(id));
 const center=(id,axis)=>{const range=span(id)[axis];return (range[0]+range[1])/2;};
 assert(center('fan',0)<center('block',0));assert(center('transmission',0)>center('block',0));
 assert(center('maf',0)>span('airbox')[0][1]-.01);assert(center('throttle',0)>center('maf',0));
 for(const side of [-1,1]){
   assert(part('intake-duct').some(f=>f.points.every(p=>p[0]<span('airbox')[0][0]-.12&&p[1]*side>.4)));
 }
 assert(center('oil-dipstick',1)>.20);assert(center('oil-fill',1)<-.25);assert(center('oil-filter',0)<center('oil-fill',0));
 assert(center('coolant-reservoir',1)>.5);assert(center('brake-reservoir',1)<-.50);
 assert(center('brake-reservoir',0)>center('oil-fill',0));
 const coils=part('coils'),plugs=part('spark-plugs');
 for(const side of [-1,1])for(let i=0;i<4;i++)for(const which of [0,1]){
   const coil=coils.filter(f=>f.instance===side+'-'+i);
   const ceramic=plugs.filter(f=>f.instance===side+'-'+i+'-'+which&&f.points.length===8&&f.color==='#d5d8cb');
   assert.equal(ceramic.length,2);
   const terminal=ceramic.at(-1).points.reduce((a,p)=>a.map((n,k)=>n+p[k]/8),[0,0,0]);
   assert(coil.some(f=>f.points.some(p=>Math.hypot(...p.map((v,k)=>v-terminal[k]))<.0121)),'boot meets plug '+side+'/'+i+'/'+which);
 }
});
test('the sectioned G500, installed engine and isolated powertrain reuse the same M113 induction and service placements',()=>{
 const car=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',parts:[],paint:'black',finish:'silver'},faces:[],
   schematic:true,isolate:false,inspection:{assembly:'powertrain'},partPositions:new Map()});
 car.buildMesh();
 const shape=(r,id)=>facesFor(r.faces,id).map(f=>f.points);
 const installed=shape(car,'airbox'),filters=shape(car,'air-filters');assert(installed.length>70);assert(filters.length>100);
 car.inspection={assembly:'body'};car.sectionPlane={axis:2,percent:100};
 car.buildMesh();assert.deepEqual(car.meshCache.faces.filter(f=>f.part==='intake.airbox').map(f=>f.points),installed);
 car.inspection={assembly:'powertrain'};car.sectionPlane=null;
 car.isolate=true;car.buildMesh();assert.deepEqual(shape(car,'airbox'),installed);
 car.inspection={assembly:'powertrain',system:'powertrain.lubrication',part:'powertrain.oil-fill',onlyPart:true};car.buildMesh();
 assert(car.faces.length&&car.faces.every(f=>f.part==='powertrain.oil-fill'));
});
