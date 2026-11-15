import test from 'node:test';
import assert from 'node:assert/strict';
import {getEngineDefinition} from '../garage/engine-data.js';
import {buildEngineBay} from '../garage/engine-geometry.js';
import {GarageRenderer} from '../garage/render.js';
const vehicles=['g500','bmw325ci','c63','hrv'];
const mesh=vehicle=>{const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null,build:{vehicle},lights:true});buildEngineBay(r,getEngineDefinition(vehicle),{detail:true});return r.faces;};

test('engine hierarchy covers every component once and connection targets resolve',()=>{
 for(const vehicle of vehicles){
  const d=getEngineDefinition(vehicle),ids=d.components.map(p=>p.id),set=new Set(ids);
  assert.equal(ids.length,set.size,`${vehicle}: duplicate component IDs`);assert.ok(ids.length>=40,`${vehicle}: deep component inventory`);
  const children=d.systems.flatMap(s=>s.children);assert.deepEqual([...children].sort(),[...ids].sort());
  for(const s of d.systems)for(const id of s.children)assert.equal(d.components.find(p=>p.id===id).parentId,s.id);
  for(const p of d.components){assert.ok(p.description.length>25,p.id);assert.ok(p.location.length>5,p.id);assert.match(p.source.url,/^https:\/\//);for(const id of p.connectsTo)assert.ok(set.has(id),`${vehicle}: ${p.id} references missing ${id}`);for(const c of p.connections)assert.ok(set.has(c.id));}
  assert.deepEqual(d.components.find(p=>p.id==='powertrain.brake-reservoir').connectsTo,[],`${vehicle}: brake fluid is a separate circuit`);
 }
});

test('engine-specific cylinder, cam, valve and ignition counts remain distinct',()=>{
 const expected={g500:[8,2,24,16,'longitudinal'],bmw325ci:[6,2,24,6,'longitudinal'],c63:[8,4,32,8,'longitudinal'],hrv:[4,2,16,4,'transverse']};
 for(const [vehicle,[cylinders,cams,valves,plugs,orientation]]of Object.entries(expected)){
  const d=getEngineDefinition(vehicle),q=id=>d.components.find(p=>p.id==='powertrain.'+id).quantity;
  assert.equal(d.cylinders,cylinders);assert.equal(q('pistons'),cylinders);assert.equal(q('connecting-rods'),cylinders);assert.equal(q('camshafts'),cams);assert.equal(q('valves'),valves);assert.equal(q('spark-plugs'),plugs);assert.equal(d.orientation,orientation);
 }
 assert.match(getEngineDefinition('bmw325ci').components.find(p=>p.id==='powertrain.battery').description,/luggage compartment/);
});

test('every listed engine component has finite, selectable geometry within a bounded mesh',()=>{
 for(const vehicle of vehicles){const faces=mesh(vehicle),tags=new Set(faces.map(f=>f.part));assert.ok(faces.length>4000);assert.ok(faces.length<15000,`${vehicle}: excessive inspection mesh size`);
  for(const p of getEngineDefinition(vehicle).components)assert.ok(tags.has(p.id),`${vehicle}: ${p.id} has no selectable geometry`);
  for(const f of faces){assert.match(f.color,/^#[0-9a-f]{6}$/i);assert.ok(f.points.length>=3);for(const p of f.points)assert.ok(p.length===3&&p.every(Number.isFinite));}
 }
});

test('unselected Ford engine stays neutral instead of inheriting a different engine',()=>{
 const d=getEngineDefinition('f350');assert.equal(d.cylinders,0);assert.deepEqual(d.components.map(p=>p.id),['powertrain.configuration']);const tags=new Set(mesh('f350').map(f=>f.part));assert.deepEqual([...tags],['powertrain.configuration']);
});

test('connection labels distinguish physical air paths, mounting and electrical signals',()=>{
 const expected=[['maf','airbox','air'],['maf','intake-duct','air'],['maf','ecu','electrical'],['alternator','belt','mechanical'],['alternator','battery','electrical'],['starter','crankshaft','mechanical'],['starter','battery','electrical'],['spark-plugs','head','mechanical'],['spark-plugs','coils','electrical'],['throttle','ecu','electrical'],['throttle','intake','air'],['water-pump','block','coolant'],['oil-pump','main-bearings','oil'],['ecu','injectors','electrical'],['injectors','head','mechanical'],['fuel-rail','injectors','fuel']];
 for(const vehicle of vehicles){const d=getEngineDefinition(vehicle);for(const [a,b,kind]of expected){const p=d.components.find(p=>p.id==='powertrain.'+a),edge=p.connections.find(c=>c.id==='powertrain.'+b);assert.equal(edge?.kind,kind,`${vehicle}: ${a} → ${b}`);}}
});
