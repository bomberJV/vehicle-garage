import assert from 'node:assert/strict';
import {test} from 'node:test';
import {survey,baseline,record,mounts,errors,errorClasses} from './p993-overlap-survey.mjs';

const pairs=survey(),found=record(pairs),kept=baseline();
const wrong=pairs.filter(p=>errorClasses.includes(p.class));
const count=c=>pairs.filter(p=>p.class===c).length;
// Round 1 cleared the cabin, floor, front compartment and sills (153 errors to
// 48). Round 2 rebuilt the flat-six at its real 118 mm pitch behind the rear
// axle and re-placed the parts around it (hub #232): no errors remain.
test('every crossing pair of installed 993 parts is in the reviewed baseline, with the same class',()=>{
  const added=Object.keys(found).filter(k=>!(k in kept)),gone=Object.keys(kept).filter(k=>!(k in found));
  const moved=Object.keys(found).filter(k=>k in kept&&kept[k]!==found[k]).map(k=>`${k}: ${kept[k]} → ${found[k]}`);
  const fix=' Review them, then run node tests/p993-overlap-survey.mjs --write.';
  assert.deepEqual(added,[],`${added.length} new crossing pairs.`+fix);
  assert.deepEqual(gone,[],`${gone.length} pairs no longer cross.`+fix);
  assert.deepEqual(moved,[],`${moved.length} pairs changed class.`+fix);
});

test('the survey totals: 153 errors at the first survey, none left',()=>{
  assert.equal(pairs.length,122);
  assert.deepEqual(['assembly','mount','terminal','through','overlap'].map(count),[77,26,19,0,0]);
  assert.deepEqual(wrong.map(p=>p.a+' + '+p.b),[]);
});

test('every reviewed mount and reviewed error names a pair that crosses, with a reason',()=>{
  const within=(pattern,id)=>id===pattern||id.split('.')[0]===pattern;
  for(const [u,v,reason] of [...mounts,...errors]){
    assert(reason&&reason.length>10,`${u} + ${v} needs a reason`);
    assert(pairs.some(p=>(within(u,p.a)&&within(v,p.b))||(within(u,p.b)&&within(v,p.a))),`${u} + ${v} no longer crosses; remove it from the list`);
  }
});
