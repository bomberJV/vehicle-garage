import test from 'node:test';
import assert from 'node:assert/strict';
import {getAssemblies,getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {FIELD_ACCESSORIES} from '../garage/accessory-catalog.js';
import {basisLabels,g500Geometry,geometryWorkshopLink,geometryBoardLink} from '../garage/g500-geometry-register.js';

const optional=FIELD_ACCESSORIES.filter(a=>a.vehicles.includes('g500')).map(a=>a.id);
const records=g500Geometry();
test('every installed and nested G500 part is represented exactly once in the priority register',()=>{
  const ids=new Set(),studies=new Set();
  function collect(part){
    ids.add(part.id);const study=getDetail('g500',part.id);
    if(!study||studies.has(study.id))return;
    studies.add(study.id);
    for(const group of study.groups)for(const p of group.parts)collect(p);
  }
  for(const group of getAssemblies('g500',optional))for(const p of group.parts)collect(p);
  assert.deepEqual(new Set(records.parts.keys()),ids);
  assert.equal(studies.size,records.studies);
  assert.equal(new Set(records.rows.map(r=>r.id)).size,records.rows.length);
  for(const r of records.rows){
    assert.ok(basisLabels[r.kind]&&r.title&&r.level&&r.workflow);
    if(r.kind!=='missing')assert.ok(r.need,r.id);
    if(r.kind==='missing'||r.kind==='plate')assert.equal(geometryWorkshopLink(r),null);
  }
});
test('G500 priority links resolve to the corresponding installed part or child study',()=>{
  const base='https://offline.example/garage/';
  const installed=new Map(getAssemblies('g500',optional).flatMap(g=>g.parts.map(p=>[p.id,p])));
  for(const p of records.parts.values()){
    const href=new URL(geometryWorkshopLink(p),base),board=new URL(geometryBoardLink(p.id),base);
    assert.equal(board.searchParams.get('q'),p.id);
    if(p.group==='accessories'){assert.equal(href.searchParams.get('tool'),'customize');continue;}
    const params=href.searchParams,parents=params.getAll('open');
    assert.equal(params.get('part'),p.id);
    let context=installed;
    if(parents.length){
      const group=getAssembly('g500',params.get('assembly'),optional);
      context=new Map(group.parts.map(x=>[x.id,x]));
      for(const id of parents){assert.ok(context.has(id),p.id+' / '+id);context=getDetail('g500',id).componentIndex;}
    }
    assert.ok(context.has(p.id));
  }
});
test('each explicit source claim references a selectable part, a scoped fact and a remaining check',async()=>{
  let total=0;
  for(const category of ['body','cabin','chassis','drive','electrical','engine','installed']){
    const {default:claims}=await import('../garage/g500-evidence-'+category+'.js');
    for(const claim of claims){
      assert.ok(basisLabels[claim.kind]&&claim.fact&&claim.need&&claim.source.label);
      assert.equal(new URL(claim.source.url).protocol,'https:');
      for(const id of claim.ids){assert.ok(records.parts.has(id),category+' / '+id);assert.ok(records.parts.get(id).claims.includes(claim));total++;}
    }
  }
  assert.ok(total>=records.checked&&records.checked>0);
});

test('the 2002 US catalog groups retain distinct family-specific URLs and open callout tasks',async()=>{
  const {catalogPlates,catalogIndexUrl}=await import('../garage/g500-catalog-plates.js');
  const tasks=records.rows.filter(r=>r.kind==='plate');
  assert.equal(catalogPlates.length,361);
  assert.equal(new Set(catalogPlates.map(p=>p.family)).size,28);
  assert.equal(new Set(tasks.map(p=>p.source.url)).size,catalogPlates.length);
  assert.ok(tasks.every(p=>p.source.url.startsWith(catalogIndexUrl+'/')&&p.workflow==='todo'));
  assert.ok(tasks.some(p=>p.related.length>0));
  assert.equal(records.modeled+records.coverageGaps+records.plates,records.rows.length);
});
