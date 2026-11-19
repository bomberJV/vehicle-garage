import test from 'node:test';
import assert from 'node:assert/strict';
import {getDetail} from '../garage/detail-catalog.js';
import {g500Packs} from '../garage/g500-packs.js';
import {g500Geometry} from '../garage/g500-geometry-register.js';

const number=/\d{3}-\d{3}-\d{2}-\d{2}/g;
const faces=study=>{
  const count={};let cur=null;
  study.draw({tag(id,f){cur=id;f();cur=null;},polygon(){count[cur]=(count[cur]||0)+1;},box(){count[cur]=(count[cur]||0)+6;}},0);
  return count;
};

for(const [name,pack] of Object.entries(g500Packs)){
  test(`pack ${name}: hooks open its own studies on the G500 only`,()=>{
    for(const [id,study] of pack.views){
      assert(pack.studies.includes(study),id+' opens a study the pack does not list');
      assert.equal(getDetail('g500',id)?.id,study.id,id+' is already hooked elsewhere');
    }
    for(const study of pack.studies)assert([...pack.views.values()].includes(study)||pack.studies.some(s=>s.groups[0].parts.some(p=>pack.views.get(p.id)===study)),study.id+' is never opened');
  });
  test(`pack ${name}: every part is numbered, sourced, drawn and claimed`,()=>{
    const g=g500Geometry();
    for(const study of pack.studies){
      const drawn=faces(study);
      for(const p of study.groups[0].parts){
        assert.match(p.name,/\d{3}-\d{3}-\d{2}-\d{2}/,p.id+' needs a Mercedes number in its name');
        assert.match((p.source||study.source).url,/^https:\/\//,p.id);
        assert(drawn[p.id]>0,p.id+' draws nothing');
        const row=g.parts.get(p.id);
        assert(row,p.id+' is not in the register');
        assert(row.claims.length>0,p.id+' has no claim');
      }
    }
  });
}

test('no Mercedes number appears on two different register parts through a pack',()=>{
  const g=g500Geometry(),seen=new Map();
  const packIds=new Set(Object.values(g500Packs).flatMap(p=>p.studies.flatMap(s=>s.groups[0].parts.map(q=>q.id))));
  for(const row of g.parts.values())for(const n of row.title.match(number)||[]){
    if(!seen.has(n))seen.set(n,[]);
    seen.get(n).push(row.id);
  }
  for(const [n,ids] of seen)if(ids.length>1&&ids.some(id=>packIds.has(id)))assert.fail(n+' is on '+ids.join(', '));
});
