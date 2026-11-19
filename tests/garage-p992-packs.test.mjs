import test from 'node:test';
import assert from 'node:assert/strict';
import {getDetail} from '../garage/detail-catalog.js';
import {p992Packs} from '../garage/p992-packs.js';
import {p992Diagrams} from '../garage/porsche992-catalog-data.js';

const v='porsche992scab';
// A Porsche number as the catalogue prints it, e.g. 992121251A, 0PB103148,
// PAF008127, N 90627102, 9A700863400, WHT001703 or 00004330556 (colour or
// version suffixes after a space are allowed).
const porscheNumber=/ · ((?:N )?[0-9A-Z]{6,14}(?: [0-9A-Z]{1,6})?)$/;
const faces=study=>{
  const count={};let cur=null;
  study.draw({tag(id,f){cur=id;f();cur=null;},polygon(){count[cur]=(count[cur]||0)+1;},box(){count[cur]=(count[cur]||0)+6;}},0);
  return count;
};
const own=pack=>new Set(pack.studies.flatMap(s=>s.groups[0].parts.map(p=>p.id)));

for(const [name,pack] of Object.entries(p992Packs)){
  test(`992 pack ${name}: hooks open its own studies on the 992 only`,()=>{
    const ids=own(pack);
    for(const [id,study] of pack.views){
      assert(pack.hooks.includes(id)||ids.has(id),id+' is neither a hook of this pack nor a part of its studies');
      assert(pack.studies.includes(study),id+' opens a study the pack does not list');
      assert.equal(getDetail(v,id)?.id,study.id,id+' is already hooked elsewhere');
    }
    for(const study of pack.studies){
      assert(study.id.startsWith(`p992-${name}-`),study.id+' needs the pack prefix');
      assert([...pack.views.values()].includes(study),study.id+' is never opened');
    }
  });
  test(`992 pack ${name}: every part is numbered, sourced and drawn`,()=>{
    for(const study of pack.studies){
      const drawn=faces(study);
      assert.match(study.source.url,/^https:\/\//,study.id);
      for(const p of study.groups[0].parts){
        assert.match(p.name,porscheNumber,p.id+' needs a Porsche number at the end of its name');
        assert.match((p.source||study.source).url,/^https:\/\//,p.id);
        assert(drawn[p.id]>0,p.id+' draws nothing');
      }
    }
  });
}

test('no catalogue diagram is built twice across the round-2 catalogue and the packs',()=>{
  const seen=new Map(p992Diagrams.map(d=>[d.code+' '+d.title.toLowerCase(),'catalogue']));
  for(const [name,pack] of Object.entries(p992Packs))for(const s of pack.studies){
    if(!s.catalogue)continue;
    const key=s.catalogue.code+' '+String(s.catalogue.title||s.name).toLowerCase();
    assert(!seen.has(key),key+' is in both '+seen.get(key)+' and '+name);
    seen.set(key,name);
  }
});

test('pack hooks do not overlap',()=>{
  const seen=new Map();
  for(const [name,pack] of Object.entries(p992Packs))for(const id of pack.hooks){
    assert(!seen.has(id),id+' is a hook of '+seen.get(id)+' and '+name);seen.set(id,name);
    assert.equal(getDetail(v,id)&&![...pack.views.keys()].includes(id)?getDetail(v,id).id:null,null,id+' already opens a study outside the pack');
  }
});
