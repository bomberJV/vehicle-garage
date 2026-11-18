import test from 'node:test';
import assert from 'node:assert/strict';
import {VEHICLES} from '../garage/catalog.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {systemsFor} from '../garage/system-index.js';

test('every directory opens assemblies on that vehicle and follows valid parents to each study',()=>{
  assert.equal(Object.keys(VEHICLES).length,40);
  for(const v of Object.keys(VEHICLES)){
    const {assemblies,featured,remaining}=systemsFor(v),groups=getAssemblies(v);
    assert.deepEqual(assemblies.map(a=>a.assembly).sort(),groups.map(g=>g.id).sort());
    const links=[...featured,...remaining];
    assert.ok(links.length,v);
    assert.equal(new Set(links.map(i=>i.id)).size,links.length);
    for(const row of links){
      let parts=groups.find(g=>g.id===row.assembly).parts;
      for(const id of [...row.path,row.part]){
        assert.ok(parts.some(p=>p.id===id),v+'/'+id);
        parts=[...getDetail(v,id).componentIndex.values()];
      }
      assert.equal(getDetail(v,row.part).id,row.id);
    }
  }
});

test('requested G500 and 911 components and all four civilian aircraft can be reached from Systems',()=>{
  const {assemblies,featured}=systemsFor('g500');
  assert.deepEqual(assemblies.slice(0,4).map(a=>a.assembly),['exhaust','intake','cooling','electrical']);
  assert.ok(featured.some(s=>s.id==='g500-center-diff'));
  for(const [v,id] of Object.entries({porsche993cab:'993barecrank',porsche992scab:'992barecrank',boeing747:'jumbo-wheel-brake',cessna172:'skyhawk-dc',piperj5:'cub-expander-brake',gulfstreamg800:'g800-fuel-supply'})){
    assert.ok(systemsFor(v).featured.some(study=>study.id===id),v);
  }
});
