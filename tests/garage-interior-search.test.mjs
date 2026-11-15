import test from 'node:test';
import assert from 'node:assert/strict';
import {findInVehicle} from '../garage/inspection-search.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getCabinFloor,drawCabinFloor} from '../garage/floor-trim.js';
import {GarageRenderer} from '../garage/render.js';

test('each road cabin floor can be inspected, including its carpet edge and seat runner',()=>{
 for(const vehicle of ['g500','f350','c63','hrv','bmw325ci','porsche993cab','porsche992scab']){
  const r=Object.create(GarageRenderer.prototype);r.faces=[];
  drawCabinFloor(r,vehicle);
  const seen=new Set(r.faces.map(f=>f.part));
  for(const part of getCabinFloor(vehicle).parts)assert(seen.has(part.id),vehicle+' '+part.id);
  assert(r.faces.every(f=>f.points.every(p=>p.length===3&&p.every(Number.isFinite))));
  assert.equal(seen.has('floor.rear-lining'),vehicle!=='f350');
  assert(getDetail(vehicle,'floor.tracks').animated);
  assert(getDetail(vehicle,'floor.carpet').componentIndex.size>=3);
 }
 assert.equal(getCabinFloor('bmws1000rr'),null);
});
test('a search result resolves through the real assembly and each nested level',()=>{
 const rows=findInVehicle('g500','seat mounting brackets');
 const r=rows.find(row=>row.title==='Seat mounting brackets');assert(r);
 const group=getAssemblies('g500').find(a=>a.id===r.assembly);
 let parts=group.parts;
 for(const id of r.path){assert(parts.some(p=>p.id===id));parts=[...getDetail('g500',id).componentIndex.values()];}
 assert(parts.some(p=>p.id===r.part));
 assert.deepEqual(findInVehicle('hrv','zzzzz'),[]);
});
