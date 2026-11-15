import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';

const cars=['porsche993cab','porsche992scab'];
function model(vehicle){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle,paint:'yellow'}),inspection:{},faces:[],schematic:true,partPositions:new Map()});
 r.buildMesh();return r;
}
const vertices=(faces,id)=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
const range=(pts,k)=>[Math.min(...pts.map(p=>p[k])),Math.max(...pts.map(p=>p[k]))];
test('both stock Cabriolets install every existing service group at its complete-vehicle coordinates, with one physical owner',()=>{
 for(const vehicle of cars){
  const r=model(vehicle),whole=r.faces,ids=new Set(whole.map(f=>f.part));
  assert(whole.length<22000,vehicle+' overview budget');
  const cache=r.meshCache;r.buildMesh();assert.equal(r.meshCache,cache,vehicle+' reuses its installed mesh');
  assert.deepEqual(new Set(GarageRenderer.assembledFaces(r.build).map(f=>f.part)),ids);
  for(const legacy of ['running.brakes','drive.gearbox','drive.axles'])assert(!ids.has(legacy),vehicle+' duplicate '+legacy);
  for(const group of ['floor','drivetrain','brakes','roof']){
   r.inspection={assembly:group};r.isolate=true;r.buildMesh();
   for(const part of getAssembly(vehicle,group).parts){
    assert(ids.has(part.id),vehicle+' missing '+part.id);
    assert.deepEqual(vertices(r.faces,part.id),vertices(whole,part.id),vehicle+'/'+part.id);
   }
  }
  // These earlier URLs still expose the installed meshes in their local tree.
  for(const [group,legacy,canonical] of [['drive','drive.axles','drivetrain.halfshafts'],['running','running.brakes','brakes.front-disc'],['cabin','cabin.carpet','floor.tracks']]){
   r.inspection={assembly:group,part:legacy,onlyPart:true};r.buildMesh();
   assert(r.faces.every(f=>f.part===legacy)&&r.faces.length>0);
   const first=vertices(whole,canonical)[0];assert(vertices(r.faces,legacy).some(p=>p.every((v,i)=>Math.abs(v-first[i])<1e-8)),legacy);
  }
  r.isolate=false;r.inspection={};r.buildMesh();assert(whole===r.meshCache.faces||whole.length===r.faces.length);
 }
});
test('the seat tracks reach the seat bases, and the clutch mates with the actual boxer crank flange and transaxle',()=>{
 for(const vehicle of cars){
  const whole=model(vehicle).faces,modern=vehicle===cars[1],rear=modern?1.25:1.112;
  const pts=id=>vertices(whole,id),rail=pts('floor.tracks'),seat=pts('cabin.seats'),carpet=pts('floor.carpet');
  const seatLow=range(seat,2)[0],railTop=range(rail,2)[1];assert(Math.abs(railTop-seatLow)<.007);
  assert(rail.every(p=>Math.abs(p[1])>(modern?.19:.17)&&Math.abs(p[1])<(modern?.52:.50)));
  assert(Math.min(...carpet.map(p=>p[2]))<railTop);
  const flange=rear+.285-.0065-.607*.55625;
  const clutch=pts('drivetrain.clutch'),gearbox=pts('drivetrain.gearbox');
  assert(Math.abs(range(clutch,0)[1]-flange)<1e-8);
  assert(Math.abs(range(gearbox,0)[1]-range(clutch,0)[0])<1e-8);
  const hub=pts('drivetrain.halfshafts'),rearRim=whole.filter(f=>f.part==='running.rims'&&f.instance?.startsWith('rear')).flatMap(f=>f.points);
  assert(Math.abs(range(hub,0).reduce((a,b)=>a+b)/2-rear)<.00001);assert(Math.abs(range(hub,2).reduce((a,b)=>a+b)/2-range(rearRim,2).reduce((a,b)=>a+b)/2)<.004);
  for(const axle of ['front','rear']){
   const instances=new Set(whole.filter(f=>f.part==='brakes.'+axle+'-disc').map(f=>f.instance));
   assert.deepEqual(instances,new Set([axle+'-left',axle+'-right']));
  }
  assert(getAssembly(vehicle,'drivetrain').parts[0].name.includes(modern?'Seven':'Six'));
  assert.equal(getDetail(vehicle,'drive.gearbox').id,getDetail(vehicle,'drivetrain.gearbox').id);
 }
});
