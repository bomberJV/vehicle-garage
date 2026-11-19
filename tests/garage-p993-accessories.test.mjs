// Every 993 Cabriolet accessory is a real item for this car, checked against a source (hub #272).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {accessoriesFor} from '../garage/accessory-catalog.js';
import {p993AccessoryAudit} from '../garage/p993-accessory-audit.js';

const listed=accessoriesFor('porsche993cab');
const audit=new Map(p993AccessoryAudit.map(a=>[a.id,a]));

test('every 993 accessory is in the audit with the same part number and source',()=>{
  assert.deepEqual(listed.map(a=>a.id).sort(),[...audit.keys()].sort());
  for(const a of listed){
    const row=audit.get(a.id);
    assert.equal(a.sku,row.sku,a.id);
    assert.equal(a.source.url,row.source,a.id);
    assert(row.states.includes(row.sku),`${a.id}: the recorded source text names the part number`);
  }
});

test('the audit records what each source states, and the descriptions say what is approximate',()=>{
  for(const row of p993AccessoryAudit){
    assert(row.source.startsWith('https://')&&row.states.length>60,row.id);
    const a=listed.find(x=>x.id===row.id);
    if(row.approximate)assert(/approximation/.test(a.description),`${row.id} should say its geometry is approximate`);
  }
  const carrier=listed.find(a=>a.id==='993-cabrio-load-carrier');
  assert(/35 kg/.test(carrier.fit)&&/Cabriolet/.test(carrier.fit));
});

