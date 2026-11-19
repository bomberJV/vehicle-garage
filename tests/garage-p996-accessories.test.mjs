// Every 1999 996 Cabriolet accessory is a real item for this car, checked against a source (hub #306).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {accessoriesFor,FIELD_ACCESSORIES} from '../garage/accessory-catalog.js';
import {p996AccessoryAudit} from '../garage/p996-accessory-audit.js';
import {drawAccessories} from '../garage/accessory-geometry.js';
import {defaultAccessoryOffset} from '../garage/field-accessory-geometry.js';
import {getComponent} from '../garage/assemblies.js';
import {accounting,importBuild,sanitizeBuild,togglePart} from '../garage/model.js';
import {hasHardtop,hasRoofCarrier} from '../garage/porsche-roof-state.js';
import {GarageRenderer} from '../garage/render.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

const vehicle='porsche996cab',hardtop='996-aluminum-hardtop',carrier='996-cabrio-roof-transport';
const listed=accessoriesFor(vehicle);
const audit=new Map(p996AccessoryAudit.map(a=>[a.id,a]));
function draw(parts){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],inspection:{},lights:true,build:{vehicle,parts,paint:'#d0a842',finish:'silver'}});
  drawAccessories(r,r.build,'#d0a842');
  return r.faces;
}

test('every 996 accessory is in the audit with the same part number and source',()=>{
  assert.deepEqual(listed.map(a=>a.id).sort(),[...audit.keys()].sort());
  for(const a of listed){
    const row=audit.get(a.id);
    assert.equal(a.sku,row.sku,a.id);
    assert.equal(a.source.url,row.source,a.id);
    assert.equal(a.price,null,a.id);
    for(const sku of row.sku.split(' + '))assert(row.states.includes(sku),`${a.id}: the recorded source text names ${sku}`);
  }
});

test('the audit records what each source states, and the descriptions say what is approximate',()=>{
  for(const row of p996AccessoryAudit){
    for(const s of [{url:row.source,states:row.states},...row.also||[]])assert(s.url.startsWith('https://')&&s.states.length>60,row.id);
    const a=listed.find(x=>x.id===row.id);
    if(row.approximate)assert(/approximation/.test(a.description),`${row.id} should say its geometry is approximate`);
  }
  // The 1999 US Cabriolet came with the hardtop; the Tequipment items are for Carreras up to 07/01.
  assert(audit.get(hardtop).also.some(s=>/aluminum hard top is standard/.test(s.states)));
  for(const id of ['996-aerokit-carrera','996-sports-tailpipes'])assert(/up to 07\/01/.test(audit.get(id).states),id);
  assert(/Cabriolet/.test(audit.get(carrier).states)&&/Cabriolet/.test(audit.get('996-aerokit-carrera').states));
});

test('the 996 offers a range that suits the car and nothing off-road',()=>{
  const kinds=new Set(listed.map(a=>a.kind));
  for(const k of ['Hardtop','Roof racks','Body kits & aero','Interior','Exhaust'])assert(kinds.has(k),k);
  assert(listed.length>=4&&listed.length<=6);
  for(const a of listed)assert(!/\bladder|bull bar|brush guard|grille guard|snorkel/i.test(a.name+' '+a.description),a.id);
});

test('each item draws its own inspectable mesh and has an exploded-view offset',()=>{
  for(const a of listed){
    const faces=draw([a.id]);
    assert(faces.length>35,a.id);
    assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(['accessories.'+a.fieldKind]),a.id);
    for(const f of faces){
      assert.match(f.color,/^#[0-9a-f]{6}$/i,a.id);
      assert(f.points.flat().every(Number.isFinite),a.id);
      // Ribbon strips carry their own triangle list.
      assert((f.triangles?.length||faceTriangles(f.points).length)>=3,a.id+' has a zero area face');
    }
    assert.equal(defaultAccessoryOffset(a.fieldKind)?.length,3,a.id);
    const fitted=togglePart(sanitizeBuild({vehicle}),a.id);
    assert.equal(getComponent(vehicle,'accessories.'+a.fieldKind,fitted.parts).name,a.name);
    assert.deepEqual(importBuild(JSON.stringify(fitted)),fitted);
    assert.deepEqual(accounting(fitted).unknown,[a.id]);
  }
  // The rear wing sits over the engine lid; the sports tailpipes are under the rear corners.
  const wing=draw(['996-aerokit-carrera']).flatMap(f=>f.points).filter(p=>p[0]>1.8);
  assert(wing.length&&wing.every(p=>p[2]>.8&&p[2]<1.0&&Math.abs(p[1])<=.503));
  const pipes=draw(['996-sports-tailpipes']).flatMap(f=>f.points);
  assert(pipes.every(p=>p[0]>2.07&&p[0]<2.14&&p[2]<.37&&Math.abs(Math.abs(p[1])-.5)<.09));
});

test('the hardtop closes the car over the folded top, and the carrier rides on whichever roof is closed',()=>{
  const stock=sanitizeBuild({vehicle,roofPosition:'up'});
  assert.equal(stock.roofPosition,'up');
  const topped=togglePart(stock,hardtop);
  assert(hasHardtop(topped));assert.equal(topped.roofPosition,'down');
  assert.equal(sanitizeBuild({...topped,roofPosition:'up'}).roofPosition,'down');
  const racked=togglePart(sanitizeBuild({vehicle}),carrier);
  assert(hasRoofCarrier(racked));assert.equal(racked.roofPosition,'up');
  assert.equal(sanitizeBuild({...racked,roofPosition:'down'}).roofPosition,'up');
  const both=togglePart(racked,hardtop);
  assert.deepEqual(both.parts,[carrier,hardtop]);
  assert.equal(both.roofPosition,'down');assert(!hasRoofCarrier(both));
  assert.equal(togglePart(both,hardtop).roofPosition,'up');
  // The bars sit the hardtop's thickness higher when it is fitted, never inside it.
  const low=Math.min(...draw([carrier]).flatMap(f=>f.points).map(p=>p[2]));
  const high=Math.min(...draw([carrier,hardtop]).filter(f=>f.part==='accessories.roofTransport').flatMap(f=>f.points).map(p=>p[2]));
  assert(Math.abs(high-low-.004)<1e-9);
  // The other Cabriolets keep their behaviour.
  for(const other of ['porsche993cab','porsche992scab']){
    assert(!hasHardtop({vehicle:other,parts:[hardtop]}));
    assert.equal(sanitizeBuild({vehicle:other,parts:[hardtop,carrier],roofPosition:'up'}).roofPosition,'up');
    assert.deepEqual(sanitizeBuild({vehicle:other,parts:[hardtop,carrier]}).parts,[]);
  }
  assert.equal(togglePart(sanitizeBuild({vehicle:'porsche993cab'}),'993-cabrio-load-carrier').roofPosition,'up');
});

test('the 996 items are field accessories of the 996 only',()=>{
  const rows=FIELD_ACCESSORIES.filter(p=>p.vehicles.includes(vehicle));
  assert.deepEqual(rows.map(p=>p.id).sort(),listed.map(p=>p.id).sort());
  for(const row of rows)assert.deepEqual(row.vehicles,[vehicle]);
});
