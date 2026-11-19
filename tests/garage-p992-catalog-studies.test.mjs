import test from 'node:test';
import assert from 'node:assert/strict';
import {getDetail} from '../garage/detail-catalog.js';
import {p992CatalogStudies} from '../garage/porsche992-catalog-studies.js';
import {p992Diagrams} from '../garage/porsche992-catalog-data.js';

const v='porsche992scab';

test('each 992 catalogue study opens from its installed or nested part, and only on the 992',()=>{
  for(const d of p992Diagrams){
    assert.equal(getDetail(v,d.attach)?.id,'p992-cat-'+d.id,d.attach);
    assert.notEqual(getDetail('porsche993cab',d.attach)?.id,'p992-cat-'+d.id);
  }
  // Nested attachments point at real parts of another catalogue study.
  const ids=new Set(p992CatalogStudies.flatMap(s=>s.groups[0].parts.map(p=>p.id)));
  for(const d of p992Diagrams.filter(d=>d.attach.startsWith('p992-cat-')))assert(ids.has(d.attach),d.attach);
});

test('every catalogue part carries its Porsche number, its diagram source and a drawing',()=>{
  let total=0;const seen=new Set();
  for(const [i,s] of p992CatalogStudies.entries()){
    const d=p992Diagrams[i],faces={};let cur=null;
    s.draw({tag(id,f){cur=id;f();cur=null;},polygon(){faces[cur]=(faces[cur]||0)+1;},box(){faces[cur]=(faces[cur]||0)+6;}},0);
    assert.match(s.source.url,/^https:\/\/www\.eurospares\.co\.uk\/Porsche\/992\/20(19|2[0-4])(_\(992-1\))?\/PartDiagrams\//,s.id);
    assert.equal(s.groups[0].parts.length,d.rows.length,s.id);
    for(const [k,p] of s.groups[0].parts.entries()){
      total++;
      assert(!seen.has(p.id),'duplicate '+p.id);seen.add(p.id);
      assert(p.name.endsWith(' · '+d.rows[k][1]),p.id);
      assert.match(d.rows[k][1],/^[0-9A-Z][0-9A-Z ]{5,}$/,p.id);
      assert(faces[p.id]>0,p.id+' draws nothing');
    }
  }
  assert(total>=352,String(total));
});
