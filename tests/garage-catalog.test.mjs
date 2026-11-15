import test from 'node:test';
import assert from 'node:assert/strict';
import {VEHICLES} from '../garage/catalog.js';
import {presetBuild,availableParts,importBuild,accounting} from '../garage/model.js';
test('new vehicles retain distinct identity and compatible saved presets',()=>{
 assert.equal(VEHICLES.hrv.year,2026);assert.equal(VEHICLES.hrv.body,'crossover');assert.equal(VEHICLES.bmw325ci.year,2003);
 for(const id of ['hrv','bmw325ci'])for(let i=0;i<2;i++){const b=presetBuild(id,i);assert.equal(b.vehicle,id);assert.ok(b.parts.length);assert.deepEqual(importBuild(JSON.stringify(b)),b);assert.ok(b.parts.every(p=>availableParts(id).some(x=>x.id===p)));}
});
test('new unpriced parts remain quote-needed and never inherit another model costs',()=>{
 const h=accounting(presetBuild('hrv',0));assert.deepEqual(h.unknown,['h-mats']);assert.equal(h.total,0);assert.equal(h.complete,false);
 const b=accounting(presetBuild('bmw325ci',1));assert.deepEqual(b.unknown,['b46-tires']);assert.equal(b.sourced,30.74);
});
