import test from 'node:test';
import assert from 'node:assert/strict';
import {modelFilters,vehicleFamilies} from '../garage/collection-filter.js';
import {VEHICLES} from '../garage/catalog.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {sliderCrank} from '../garage/piston-study.js';

test('All is independent of the selected model, domain and type',()=>{
  const ids=Object.keys(VEHICLES);
  assert.deepEqual(modelFilters(ids).models,ids);
  const allAir=modelFilters(ids,'Air');
  assert.deepEqual(allAir.types,['All','Planes','Helicopters','Space']);
  assert.equal(allAir.models.length,17);
  const cars=modelFilters(ids,'All','Cars').models;
  assert(cars.includes('bmw325ci')&&cars.includes('porsche993cab')&&!cars.includes('g500'));
  assert.deepEqual(modelFilters(ids,'Sea','Submarines').models,['alvin']);
});
test('model families keep individual saved-build IDs under one year and trim selector',()=>{
  const ids=Object.keys(VEHICLES),groups=vehicleFamilies(ids);
  assert.deepEqual(groups.flatMap(g=>g.variants.map(v=>v.id)).sort(),[...ids].sort());
  assert.deepEqual(groups.filter(g=>g.variants.length>1).map(g=>g.name),['Honda HR-V','Porsche 911']);
  assert.deepEqual(groups.find(g=>g.id==='honda-hrv').variants.map(v=>v.id),['hrv','hrvlx']);
  assert.deepEqual(groups.find(g=>g.id==='porsche-911').variants.map(v=>v.id),['porsche993cab','porsche996cab','porsche992scab']);
  assert.equal(vehicleFamilies(modelFilters(ids,'Sea').models).some(g=>g.id==='porsche-911'),false);
});
test('every model has at least one reachable authored detail and all its subparts have outward moves',()=>{
  for(const id of Object.keys(VEHICLES)){
    const parts=getAssemblies(id).flatMap(g=>g.parts);
    const work=parts.map(p=>getDetail(id,p.id)).filter(Boolean);
    assert(work.length,'missing authored detail for '+id);
    const seen=new Set();
    for(let i=0;i<work.length;i++){
      const d=work[i];
      if(seen.has(d.id))continue;
      seen.add(d.id);
      assert(d.name&&d.description&&d.source?.url&&typeof d.draw==='function',id+' '+d.id);
      assert(d.componentIndex.size>=2,id+' '+d.id);
      for(const item of d.componentIndex.values()){
        assert.equal(item.offset?.length,3,item.id);
        assert(item.offset.every(Number.isFinite),item.id);
        const next=getDetail(id,item.id);if(next&&!seen.has(next.id))work.push(next);
      }
    }
  }
});
test('piston study preserves rod length and makes its ring pack independently accessible',()=>{
  for(let i=0;i<=20;i++){
    const {x,z,pin}=sliderCrank(i/20);
    assert(Math.abs(Math.hypot(x,pin-z)-1.13)<1e-9);
  }
  assert(getDetail('g500','powertrain.pistons').animated);
  assert.equal(getDetail('g500','slider.rings').componentIndex.size,3);
});
