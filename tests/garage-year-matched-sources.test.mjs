import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,readdirSync} from 'node:fs';
import {catalogStudySources} from '../garage/g500-catalog-studies.js';
import {cvt} from '../garage/mechanism-cvt.js';
import {chassisRefs} from '../garage/porsche993-chassis.js';
import {VEHICLES} from '../garage/catalog.js';
import {ENGINE_SOURCES} from '../garage/engine-data.js';
import {fluidRefs} from '../garage/g500-fluid-refs.js';
import {references as doorReferences} from '../garage/door-profiles.js';
import {roadSystems} from '../garage/road-service-data.js';
import {refs996} from '../garage/porsche996-sources.js';

const dir=new URL('../garage/',import.meta.url);
// The G500 study packs (g500-pack-*.js) are built by a separate line of work
// with its own source review, so they are outside this check.
const files=readdirSync(dir).filter(f=>f.endsWith('.js')&&!/^g500-packs?(-|\.js$)/.test(f));
const plateYear=/(\d{4})-mercedes[_-]benz-g500/;

test('every G500 parts-plate link is the 2002 plate unless its label explains the other year',()=>{
  const labelled=/(['"])((?:(?!\1)[^\\]|\\.)*)\1\s*,\s*(?:url\s*:\s*)?(['"])(https?:\/\/[^'"]*?(\d{4})-mercedes[_-]benz-g500[^'"]*)\3/g;
  let seen=0,matched=0;
  const wrong=[];
  for(const f of files){
    const text=readFileSync(new URL(f,dir),'utf8');
    seen+=[...text.matchAll(new RegExp(plateYear.source,'g'))].filter(m=>m[1]!=='2002').length;
    for(const m of text.matchAll(labelled)){
      const [,,label,,url,year]=m;
      if(year==='2002')continue;
      matched++;
      if(!(label.includes(year)&&label.includes('2002')))wrong.push(f+': '+label+' -> '+url);
    }
  }
  assert.deepEqual(wrong,[]);
  assert.equal(matched,seen,'every other-year G500 plate URL in garage/*.js has a label beside it');
  for(const [key,source] of Object.entries(catalogStudySources)){
    if(key==='enginePlate')continue;
    assert.equal(source.url.match(plateYear)[1],'2002',key);
    assert.match(source.label,/2002 G500/,key);
  }
  assert.match(catalogStudySources.enginePlate.label,/^MB Parts Giant · 2008 G500 .*2002–2008 G500/);
});

test('the HR-V CVT cites the second-generation HR-V, not the 2016 release',()=>{
  const urls=JSON.stringify(cvt,(k,v)=>typeof v==='function'?undefined:v).match(/https:\/\/hondanews\.com[^"]*/g);
  assert(urls.length>0);
  for(const url of urls){
    assert.doesNotMatch(url,/2016-honda-hr-v/);
    assert.match(url,/2023-honda-hr-v-press-kit/);
  }
});

test('the 1998 993 front strut cites the Carrera 1994–98 range, not the RS page',()=>{
  assert.doesNotMatch(chassisRefs.strut.url,/993--911--rs-/);
  assert.match(chassisRefs.strut.url,/993--911--1994-98\//);
  assert.match(chassisRefs.strut.label,/993 Carrera 1994–98/);
});

test('the 328xi photo reference names a 2008 328xi sedan',()=>{
  const ref=VEHICLES.bmw328xi.photoReference;
  assert.match(ref.label,/2008 US 328xi sedan/);
  assert.doesNotMatch(ref.label+ref.url,/325i/);
});

const read=f=>readFileSync(new URL(f,dir),'utf8');
const g500Mirror=/https:\/\/(?:charm\.li|lemon-manuals\.la)\/Mercedes%20Benz\/(\d{4})\/G%20500%20%28463\.249%29[^'")\s]*/g;

test('G500 service-manual mirror links cite the 2002 G 500 (463.249) pages',()=>{
  const wrong=[];
  let seen=0;
  for(const f of [...files,'SOURCES.md'])for(const m of read(f).matchAll(g500Mirror)){
    seen++;
    if(m[1]!=='2002')wrong.push(f+': '+m[0]);
  }
  assert.deepEqual(wrong,[]);
  assert(seen>=8,'found the G500 mirror links');
  assert.match(read('g500-evidence-engine.js'),/lemon-manuals\.la\/Mercedes%20Benz\/2002\/[^']*Ignition%20System\/Firing%20Order\//);
  const exhaust='https://charm.li/Mercedes%20Benz/2002/G%20500%20%28463.249%29%20V8-5.0L%20%28113.962%29/Repair%20and%20Diagnosis/Engine%2C%20Cooling%20and%20Exhaust/Exhaust%20System/Description%20and%20Operation/';
  for(const f of ['reference-ledger.js','SOURCES.md'])assert(read(f).includes(exhaust),f);
  assert.match(ENGINE_SOURCES.m113.url,/\/2002\/G%20500[^']*GF01\.00-P-9611F%20General%20Information%20on%20Complete%20Engine\/$/);
  assert.match(fluidRefs.jets.url,/\/2002\/G%20500[^']*GF01\.00-P-9611-01G%20General%20Information%20on%20Repair%20Notes\/$/);
});

test('HR-V catalog plates from another trim say why they apply to the EX-L AWD',()=>{
  const {hrv,hrvlx,hondaGate}=doorReferences;
  assert.match(hrv.url,/5_door_lx_2wd-cvt\/body_air_conditioning\/front_door_glass_regulator/);
  assert.match(hrv.label,/LX 2WD .*EX-L AWD .*73300\/73350-3W0-306.*72210-3W0-A01/);
  assert.match(hrvlx.url,/5_door_lx_awd-cvt\/body_air_conditioning\/front_door_glass_regulator/);
  assert.match(hrvlx.label,/LX AWD/);
  assert.match(hondaGate.label,/LX 2WD tailgate; tailgate 68100-3W0-A00ZZ fits every 2026 trim \(LX, Sport and EX-L, 2WD and AWD\)/);
  assert.match(ENGINE_SOURCES.hondaParts.url,/5_door_sport_2wd-cvt\/electrical_exhaust_heater_fuel\/air_cleaner/);
  assert.match(ENGINE_SOURCES.hondaParts.label,/Sport 2WD .*17201-6CT-A01.*17220-5BA-A00 fit every 2026 trim \(LX, Sport and EX-L, 2WD and AWD\)/);
  const hr=roadSystems.hrv;
  assert.match(hr.refs.fuel.url,/5_door_sport_2wd-cvt\/electrical_exhaust_heater_fuel\/fuel_tank/);
  assert.match(hr.refs.fuel.label,/Sport 2WD .*17044-3W0-A01.*17045-TLA-A02 also fit the AWD/);
  assert.match(hr.fuel,/tank \(17044-3W0-A01\) and pump set \(17045-TLA-A02\) also fit the AWD, which has its own front band \(17521-3W1-A00\)/);
  assert.equal(roadSystems.hrvlx.refs.fuel,hr.refs.fuel);
});

test('the 1999 996 Cabriolet spoiler and crankshaft cite 1999 Carrera 2 Cabriolet catalogue pages',()=>{
  const p1999=/^https:\/\/www\.rosepassion\.com\/en\/diagrams-porsche-996-1999-eu-996-carrera-2-cabrio-manual-gearbox-6-speed\//;
  for(const key of ['spoiler','crankshaft']){
    assert.match(refs996[key].url,p1999,key);
    assert.match(refs996[key].label,/1999 996 Carrera 2 Cabriolet/,key);
  }
  assert.match(refs996.spoiler.url,/rear-spoiler-1536$/);
  assert.match(refs996.crankshaft.url,/crankshaft-twin-weight-engine-flywheel-crankshaft-crankcase-belt-2402$/);
  for(const f of ['porsche996-sources.js','porsche-spoilers.js','reference-ledger.js'])
    assert.doesNotMatch(read(f),/eurospares\.co\.uk\/Porsche\/996\/996_\(200[01]\)/,f);
  assert(read('porsche-spoilers.js').includes(refs996.spoiler.url));
  assert(read('reference-ledger.js').includes(refs996.spoiler.url));
});

test('the 2014 C63 floor cites the 2014 C63 floor plate',()=>{
  const text=read('floor-trim.js');
  assert.doesNotMatch(text,/v-2013-mercedes-benz-c63/);
  assert.match(text,/source\('MB Parts Giant · 2014 C63 AMG sedan floor pans, tunnel stiffener and seat supports','https:\/\/www\.mbpartsgiant\.com\/parts-list\/2014-mercedes_benz-c63_amg\/body-hardware\/floor'\)/);
});
