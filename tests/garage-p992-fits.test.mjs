import assert from 'node:assert/strict';
import {test} from 'node:test';
import {p992Fits,fitGroups,fitLines,fitMounts,numberOf,fitDetail} from '../garage/p992-fits.js';
import {catalogueRows} from './p992-catalogue-rows.mjs';
import {installedParts} from './garage-detail-scoreboard.mjs';

// Hub #261: fit packs add installed parts to the 2023 911. Each is a real
// component with its own Porsche number, copied from the catalogue page it cites.
const rows=catalogueRows();
const installed=new Set(installedParts('porsche992scab'));
const parts=fitGroups.flatMap(g=>g.parts);

test('each fit pack names its groups after itself',()=>{
  for(const [key,pack] of Object.entries(p992Fits))for(const g of pack.groups){
    assert(g.id==='p992-fit-'+key||g.id.startsWith('p992-fit-'+key+'-'),`${g.id} in pack ${key}`);
    assert(g.name&&g.description&&g.parts.length,`${g.id} needs a name, a description and parts`);
    for(const p of g.parts)assert(p.id.startsWith(g.id+'.'),`${p.id} belongs to ${g.id}`);
  }
});

test('fit part ids are unique',()=>{
  const ids=parts.map(p=>p.id);
  assert.deepEqual(ids.filter((id,i)=>ids.indexOf(id)!==i),[]);
});

test('every fit part carries a Porsche number listed on the catalogue page it cites',()=>{
  const bad=[];
  for(const p of parts){
    const n=numberOf(p.name);
    if(!p.name.includes(' · ')||!p.source?.url?.startsWith('https://'))bad.push(p.id+': needs a name ending " · <number>" and a source url');
    else if(!rows.some(r=>r.url===p.source.url&&r.number===n))bad.push(`${p.id}: ${n} is not on ${p.source.url}`);
  }
  assert.deepEqual(bad,[]);
});

test('one fitted part per Porsche number and side',()=>{
  const seen=new Map(),dup=[];
  for(const p of parts){const k=numberOf(p.name);if(seen.has(k))dup.push(`${p.id} repeats ${k} from ${seen.get(k)}`);seen.set(k,p.id);}
  assert.deepEqual(dup,[]);
});

test('every fit part is drawn on the car and opens its catalogue diagram',()=>{
  for(const p of parts){
    assert(installed.has(p.id),`${p.id} draws no faces`);
    assert(fitDetail(p.id),`${p.id} opens no study`);
  }
});

test('fit lines and mounts name fitted parts, with reasons',()=>{
  const ids=new Set(parts.map(p=>p.id));
  for(const l of fitLines)assert(ids.has(l),`${l} is not a fit part`);
  for(const [a,b,reason] of fitMounts){
    assert(reason&&reason.length>10,`${a} + ${b} needs a reason`);
    assert([a,b].some(x=>[...ids].some(id=>id===x||id.startsWith(x+'.'))||fitGroups.some(g=>g.id===x)),`${a} + ${b} names no fit part`);
  }
});
