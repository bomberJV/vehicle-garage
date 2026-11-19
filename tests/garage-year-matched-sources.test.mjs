import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,readdirSync} from 'node:fs';
import {catalogStudySources} from '../garage/g500-catalog-studies.js';
import {cvt} from '../garage/mechanism-cvt.js';
import {chassisRefs} from '../garage/porsche993-chassis.js';
import {VEHICLES} from '../garage/catalog.js';

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
