import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {PARTS} from '../garage/catalog.js';
import {availableParts,togglePart,accounting,DEFAULT_BUILD} from '../garage/model.js';
import {voiceKey} from '../shared/narration-voice.js';

const shelf={
  bmw328xi:{tires:'b90-tires',sizes:[/205\/55R16/],filter:'b90-filter',number:/11427566327|11427953129/},
  porsche996cab:{tires:'p96-tires',sizes:[/205\/50ZR17 front/,/255\/40ZR17 rear/],filter:'p96-filter',number:/99610722553/},
  sl550:{tires:'sl-tires',sizes:[/255\/35R19 front/,/285\/30R19 rear/],filter:'sl-filter',number:/2781800009/},
};
const added=['b90-tires','b90-filter','b90-air-filter','p96-tires','p96-filter','sl-tires','sl-filter'];

test('the 328xi, 996 and SL550 each have a sized tire set, a numbered oil filter and the care items',()=>{
  for(const [vehicle,want] of Object.entries(shelf)){
    const parts=availableParts(vehicle),ids=parts.map(p=>p.id);
    const tires=PARTS.find(p=>p.id===want.tires);
    assert.deepEqual(tires.vehicles,[vehicle]);
    assert.equal(tires.category,'wheels');assert.equal(tires.visual,'tires');assert.equal(tires.exclusive,'tires');
    for(const size of want.sizes)assert.match(tires.sku,size,vehicle);
    if(want.sizes.length>1)assert.match(tires.fit,/do not mix front\/rear/);
    const filter=PARTS.find(p=>p.id===want.filter);
    assert.deepEqual(filter.vehicles,[vehicle]);assert.equal(filter.category,'service');assert.equal(filter.type,'product');
    assert.match(filter.sku,want.number);
    if(filter.price!==null)assert.match(filter.description,/price observed November 19, 2026/);
    for(const id of [want.tires,want.filter,'charger','wax','wheel-finish'])assert.ok(ids.includes(id),vehicle+' '+id);
  }
  assert.match(PARTS.find(p=>p.id==='b90-tires').fit,/run-flat/);
});

test('the care lists keep their original order with the new cars appended',()=>{
  for(const id of ['charger','wax','wheel-finish'])
    assert.deepEqual(PARTS.find(p=>p.id===id).vehicles,['g500','c63','f350','hrv','hrvlx','bmw325ci','bmw328xi','porsche996cab','sl550']);
});

test('every new shelf entry has a seller, an https link and recorded narration',()=>{
  const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url)));
  for(const id of added){
    const part=PARTS.find(p=>p.id===id);
    assert.ok(part,id);assert.ok(part.seller,id);
    assert.equal(new URL(part.url).protocol,'https:',id);
    for(const text of [part.name,part.fit,part.description,part.seller])assert.ok(bank[voiceKey(text)],text);
  }
});

test('choosing the 996 tire set and filter leaves the tires to quote',()=>{
  let build=togglePart({...DEFAULT_BUILD,vehicle:'porsche996cab'},'p96-tires');
  build=togglePart(build,'p96-filter');
  const totals=accounting(build);
  assert.deepEqual(totals.unknown,['p96-tires']);
  assert.equal(totals.sourced,17.06);
});

test('the 328xi service presets load its own parts',async()=>{
  const {presetBuild}=await import('../garage/model.js');
  const {VEHICLES:V}=await import('../garage/catalog.js');
  assert.deepEqual(V.bmw328xi.presets.slice(0,2),['Service first','Wheels & upkeep']);
  assert.deepEqual(presetBuild('bmw328xi',0).parts.sort(),['b90-air-filter','b90-filter','charger']);
  assert.deepEqual(presetBuild('bmw328xi',1).parts.sort(),['b90-filter','b90-tires','wax']);
});
