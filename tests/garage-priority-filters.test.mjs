import assert from 'node:assert/strict';
import test from 'node:test';
import {readFilters,writeFilters,inScope,savedAssignment} from '../garage/priority-filters.js';
import {trackingDefaults} from '../garage/priority-tracking.js';
const read=query=>readFilters(new URLSearchParams(query));
const shown=(kind,id,query)=>inScope(trackingDefaults(kind,id),read(query));

test('hide Ships excludes ships, hide Sea excludes all vessels, mixed-domain requests retain visible work',()=>{
  assert.equal(shown('vehicle','seawisegiant','hide=Ships'),false);
  assert.equal(shown('vehicle','azzam','hide=Ships'),true);
  assert.equal(shown('request','maritime','hide=Sea'),false);
  assert.equal(shown('vehicle','azzam','hide=Sea'),false);
  assert.equal(shown('request','dark-matter','hide=Sea'),true);
  assert.equal(shown('request','medical','domain=Sea'),false);
  assert.equal(shown('request','space','domain=Land&hide=Rovers'),false);
  assert.equal(shown('request','space','hide=Rovers&type=Space'),true);
  assert.equal(shown('vehicle','g500','priority=P1&status=parked&hide=Ships'),false);
  assert.equal(shown('vehicle','g500','priority=P1&status=todo'),true);
});

test('URLs round-trip combined filters, normalize older status links and reject unrelated overrides',()=>{
  for(const q of ['q=all','q=1998+911&priority=P1&status=done&domain=Land&type=Cars&hide=Ships&hide=Helicopters']){
    const filters=read(q);
    assert.deepEqual(read(writeFilters(filters)),filters);
  }
  assert.equal(read('status=shipped').workflow,'done');
  assert.equal(read('priority=__proto__&type=Trucks&domain=Air').type,'all');
  assert.deepEqual(read('hide=Ships&hide=Ships&hide=garbage').hide,['Ships']);
  assert.deepEqual(savedAssignment({workflow:'parked',level:'P0',name:'edit'}),{level:'P0',workflow:'parked'});
  assert.deepEqual(savedAssignment({level:'unknown',workflow:'constructor'}),{});
});
