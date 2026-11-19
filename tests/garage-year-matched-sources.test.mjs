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

test('the G500 exhaust pack cites the 2002 emission plate and says why the later plates stay',async()=>{
  const {exhaustPackSources:x,studies,claims}=await import('../garage/g500-pack-exhaust.js');
  const text=read('g500-pack-exhaust.js');
  const labelled=/(['"])((?:(?!\1)[^\\]|\\.)*)\1\s*,\s*(?:url\s*:\s*)?(['"])(https?:\/\/[^'"]*?(\d{4})-mercedes[_-]benz-g500[^'"]*)\3/g;
  const seen=[...text.matchAll(new RegExp(plateYear.source,'g'))].filter(m=>m[1]!=='2002').length;
  const other=[...text.matchAll(labelled)].filter(m=>m[5]!=='2002');
  assert.equal(other.length,seen);
  for(const m of other)assert(m[2].includes(m[5])&&m[2].includes('2002')&&/later-year plate/.test(m[2]),m[2]);
  assert.match(x.exhaustPlate2004.label,/463-492-63-41 where the 2002 G500 plate and the hanger listing give 463-492-35-41/);
  assert.match(x.emissionPlate2008.label,/the 2002 G500 plate lists the same part numbers/);
  const parts=new Map(studies.flatMap(s=>s.groups.flatMap(g=>g.parts)).map(p=>[p.id.split('.').pop(),p]));
  for(const key of ['egr-valve','egr-gasket','canister-bracket'])assert.equal(parts.get(key).source.url,x.emissionPlate.url,key);
  assert.equal(parts.get('shutoff-gaskets').source.url,x.emissionPlate2008.url);
  assert(claims.some(c=>c.source===x.emissionPlate2008));
});

test('the HR-V roof and floor sources say how they apply to the EX-L AWD',async()=>{
  const {getCabinFloor}=await import('../garage/floor-trim.js');
  const roof=roadSystems.hrv.refs.roof;
  assert.match(roof.url,/5_door_ex_l_2wd-cvt\/interior_bumper\/roof_slide_components/);
  assert.match(roof.label,/EX-L 2WD .*70200-TLA-A03.*70300-TLA-A03.*70305-TLA-A03.*70450-3W0-A01 are listed for the EX-L AWD too/);
  const floor=getCabinFloor('hrv').source;
  assert.match(floor.url,/5_door_lx_awd-cvt\/interior_bumper\/floor_mat/);
  assert.match(floor.label,/LX AWD .*AWD floor layout.*EX-L has its own carpet, 83301-3W0-A11ZA, listed for the EX-L 2WD and AWD only/);
  const lx=getCabinFloor('hrvlx').source;
  assert.equal(lx.url,floor.url);
  assert.equal(lx.label,'Honda parts diagram · 2026 HR-V LX AWD floor carpet and mat holders');
});

test('the engine reference notes cite the 2002 M113 document and explain the HR-V air-cleaner trim',()=>{
  const md=read('engine-references.md');
  assert.doesNotMatch(md,/lemon-manuals\.la\/Mercedes%20Benz\/2004\//);
  assert(md.includes(ENGINE_SOURCES.m113.url));
  assert.doesNotMatch(md,/later service-document revision/);
  assert.match(md,/Sport AWD air-cleaner diagram[^\n]*case set 17201-6CT-A01 and element 17220-5BA-A00 fit every 2026 trim \(LX, Sport and EX-L, 2WD and AWD\)/);
});

test('the 1998 993 front axle and carrier labels say why the 1997 and 1994 pages apply',()=>{
  assert.match(chassisRefs.frontAxle.url,/993_\(1997\)\/PartDiagrams\/401-000\//);
  assert.match(chassisRefs.frontAxle.label,/1997 catalogue page; cross member 993 341 101 05 from model year 1995 .*apply to the 1998 car/);
  assert.match(chassisRefs.frontCarrier.url,/993_\(1994\)\/PartDiagrams\/401-005\//);
  assert.match(chassisRefs.frontCarrier.label,/1994 catalogue page; the 1998 car takes .*993 341 157 03 and 158 03 .*993 341 065 01 from model year 1995/);
});
