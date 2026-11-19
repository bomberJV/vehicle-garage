import test from 'node:test';
import assert from 'node:assert/strict';
import {getDetail} from '../garage/detail-catalog.js';
import {m113InternalStudies} from '../garage/g500-m113-internals.js';
import {g500Geometry} from '../garage/g500-geometry-register.js';

const opens={'powertrain.valves':'g500-m113-valves','powertrain.rocker-arms':'g500-m113-rockers','powertrain.camshafts':'g500-m113-camshafts',
  'powertrain.timing-drive':'g500-m113-timing','powertrain.main-bearings':'g500-m113-bearings','powertrain.oil-pump':'g500-m113-oil-drive'};

test('each installed M113 part opens its internals study, on the G500 only',()=>{
  for(const [part,id] of Object.entries(opens)){
    assert.equal(getDetail('g500',part)?.id,id,part);
    assert.notEqual(getDetail('c63',part)?.id,id,part);
  }
});

test('every internal part names a Mercedes number, cites a catalog page and draws faces',()=>{
  let total=0;
  for(const s of m113InternalStudies){
    const faces={};let cur=null;
    const r={tag(id,f){cur=id;f();cur=null;},polygon(){faces[cur]=(faces[cur]||0)+1;},box(){faces[cur]=(faces[cur]||0)+6;}};
    s.draw(r,0);
    for(const p of s.groups[0].parts){
      total++;
      assert.match(p.name,/\d{3}-\d{3}-\d{2}-\d{2}/,p.id);
      assert.match((p.source||s.source).url,/^https:\/\/(www\.)?(mbpartsgiant\.com|classicparts\.mbusa\.com)\//,p.id);
      assert(faces[p.id]>0,p.id+' draws nothing');
    }
  }
  assert(total>=37);
});

test('the register counts every internal part with a catalog claim',()=>{
  const g=g500Geometry();
  for(const s of m113InternalStudies)for(const p of s.groups[0].parts){
    const row=g.parts.get(p.id);
    assert(row,p.id);assert(row.claims.length>0,p.id);
  }
});
