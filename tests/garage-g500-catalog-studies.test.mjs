import test from 'node:test';
import assert from 'node:assert/strict';
import {getDetail} from '../garage/detail-catalog.js';
import {g500CatalogStudies} from '../garage/g500-catalog-studies.js';
import {g500Geometry} from '../garage/g500-geometry-register.js';

const opens={'hvac.case':'g500-hvac-module','g500-front-diff.pinion':'g500-front-pinion','g500-front-diff.carrier':'g500-front-housing'};

test('catalog studies open from their installed or nested parts',()=>{
  for(const [part,id] of Object.entries(opens))assert.equal(getDetail('g500',part)?.id,id,part);
});

test('every catalog-study part is numbered, sourced, drawn and registered with a claim',()=>{
  const g=g500Geometry();let total=0;
  for(const s of g500CatalogStudies){
    const faces={};let cur=null;
    s.draw({tag(id,f){cur=id;f();cur=null;},polygon(){faces[cur]=(faces[cur]||0)+1;},box(){faces[cur]=(faces[cur]||0)+6;}},0);
    for(const p of s.groups[0].parts){
      total++;
      assert.match(p.name,/\d{3}-\d{3}-\d{2}-\d{2}/,p.id);
      assert(faces[p.id]>0,p.id+' draws nothing');
      const row=g.parts.get(p.id);assert(row&&row.claims.length,p.id);
      assert.match(row.source.url,/mbpartsgiant\.com\/parts-list\/200[34]-mercedes_benz-g500\//,p.id);
    }
  }
  assert(total>=39);
});

test('catalog studies skip parts the register already models',()=>{
  const names=g500CatalogStudies.flatMap(s=>s.groups[0].parts.map(p=>p.name)).join(' ');
  for(const dup of ['209-830-01-62','203-830-01-61','203-820-25-14','230-830-01-84','000-980-19-02','463-330-00-54'])assert(!names.includes(dup),dup);
});
