import assert from 'node:assert/strict';
import {test} from 'node:test';
import {additionalRequestSections} from '../garage/priority-backlog.js';
import {survey,baseline,record,mounts,errors,areas,area,errorClasses} from './g500-overlap-survey.mjs';

const pairs=survey(),found=record(pairs),kept=baseline();
const rows=additionalRequestSections.flatMap(s=>s.items),row=id=>rows.find(item=>item.id===id);
const wrong=pairs.filter(p=>errorClasses.includes(p.class));
const count=c=>pairs.filter(p=>p.class===c).length;

test('every crossing pair of installed G500 parts is in the reviewed baseline, with the same class',()=>{
  const added=Object.keys(found).filter(k=>!(k in kept)),gone=Object.keys(kept).filter(k=>!(k in found));
  const moved=Object.keys(found).filter(k=>k in kept&&kept[k]!==found[k]).map(k=>`${k}: ${kept[k]} → ${found[k]}`);
  const fix=' Review them, then run node tests/g500-overlap-survey.mjs --write.';
  assert.deepEqual(added,[],`${added.length} new crossing pairs.`+fix);
  assert.deepEqual(gone,[],`${gone.length} pairs no longer cross.`+fix);
  assert.deepEqual(moved,[],`${moved.length} pairs changed class.`+fix);
});

test('the board states the survey totals and the size of each set of errors',()=>{
  assert.equal(pairs.length,498);
  assert.deepEqual(['assembly','mount','terminal','through','overlap'].map(count),[254,145,99,0,0]);
  const done=row('g500-installed-overlap-survey');
  assert.equal(done.status,'shipped');
  for(const n of [498,254,145,99,231])assert(done.description.includes(String(n)),`the survey row states ${n}`);
  const sets={wiring:['g500-wiring-routes',0],lines:['g500-hose-pipe-routes',0],cabin:['g500-cabin-packaging',0],
    underbody:['g500-underbody-overlaps',0],chassis:['g500-chassis-overlaps',0]};
  assert.deepEqual(Object.keys(sets),Object.keys(areas));
  for(const [key,[id,n]] of Object.entries(sets)){
    assert.equal(wrong.filter(p=>area(p)===key).length,n,key);
    // A cleared set is marked done; an open set states how many pairs remain.
    if(n){assert(row(id).description.startsWith(n+' pairs. '),`${id} states ${n} pairs`);assert.equal(row(id).status,'open');}
    else assert.equal(row(id).status,'shipped',id);
  }
  assert.equal(Object.values(sets).reduce((sum,[,n])=>sum+n,0),wrong.length);
});

test('the parts cleared around the oil pan and the gearbox have no errors left',()=>{
  for(const id of ['powertrain.sump','powertrain.oil-pump','powertrain.oil-pickup','drivetrain.gearbox','powertrain.engine-mounts','electrical.starter'])
    assert.deepEqual(wrong.filter(p=>p.a===id||p.b===id).map(p=>p.a+' + '+p.b),[],id);
  // Each is still joined to its neighbours where it should be.
  assert.equal(found['drivetrain.gearbox + electrical.chassis-control-harness'],'terminal');
  assert.equal(found['electrical.primary-power + electrical.starter'],'terminal');
  assert.equal(found['powertrain.block + powertrain.engine-mounts'],'assembly');
});

test('every reviewed mount and reviewed error still names a pair that crosses',()=>{
  const within=(pattern,id)=>id===pattern||id.split('.')[0]===pattern;
  for(const [u,v,reason] of [...mounts,...errors]){
    assert(reason&&reason.length>10,`${u} + ${v} needs a reason`);
    assert(pairs.some(p=>(within(u,p.a)&&within(v,p.b))||(within(u,p.b)&&within(v,p.a))),`${u} + ${v} no longer crosses; remove it from the list`);
  }
});
