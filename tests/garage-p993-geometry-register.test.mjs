// The 993 parts register (hub #232): every installed and nested part has a
// row, and its sourced share is above the G500's.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {basisLabels,p993Geometry,testedClaims} from '../garage/p993-geometry-register.js';

const reg=p993Geometry();

test('every installed and nested 993 part is in the register exactly once',()=>{
  const ids=new Set(),studies=new Set();
  const walk=p=>{ids.add(p.id);const d=getDetail('porsche993cab',p.id);if(!d||studies.has(d.id))return;studies.add(d.id);for(const c of d.componentIndex.values())walk(c);};
  for(const g of getAssemblies('porsche993cab',[]))for(const p of g.parts)walk(p);
  assert.deepEqual(new Set(reg.byId.keys()),ids);
  assert.equal(reg.rows.length,ids.size);assert.equal(reg.studies,studies.size);
});

test('every claim names a basis and a linked source; tested claims point at registered parts',()=>{
  for(const r of reg.rows){
    assert(basisLabels[r.kind],r.id);
    for(const c of r.claims){assert(basisLabels[c.kind]&&c.source?.url?.startsWith('https://')&&c.source.label,r.id);assert(c.fact,r.id);}
    if(!r.claims.length)assert.equal(r.kind,'estimate');
  }
  for(const c of testedClaims)for(const id of c.ids)assert(reg.byId.has(id),id);
});

test('the sourced share holds above half, counting diagrams and tested dimensions alone',()=>{
  // This compared against the G500 register's share until the G500 study packs
  // (Nov 2026) raised that to about 55%. The 993 floor now stands on its own.
  const strict=reg.rows.filter(r=>r.claims.some(c=>c.kind==='diagram'||c.kind==='dimensioned')).length/reg.rows.length;
  assert(strict>.5,`993 ${(strict*100).toFixed(1)}%`);
  assert(reg.share>=strict);
  // Pinned so that a lost source shows up here.
  assert.deepEqual([reg.rows.length,reg.sourced],[453,278]);
});
