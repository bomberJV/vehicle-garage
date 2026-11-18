import assert from 'node:assert/strict';
import {test} from 'node:test';
import {survey,baseline,record,mounts,errors,errorClasses} from './p993-overlap-survey.mjs';

const pairs=survey(),found=record(pairs),kept=baseline();
const wrong=pairs.filter(p=>errorClasses.includes(p.class));
const count=c=>pairs.filter(p=>p.class===c).length;
// The engine compartment and driveline are rebuilt in the next round (hub #232):
// the flat-six is drawn about 0.12 m too long (178 mm cylinder pitch against the
// real 118 mm) and starts ahead of the rear axle. Every other error is cleared.
const engineBay=id=>/^(engine|drivetrain|electrical\.generator|shell\.spoiler-drive|993-climate\.(exchanger|compressor|rear-blower|supply|control|lines)|993-lubrication\.(pump|connections)|fuel\.(rail|supply))/.test(id);

test('every crossing pair of installed 993 parts is in the reviewed baseline, with the same class',()=>{
  const added=Object.keys(found).filter(k=>!(k in kept)),gone=Object.keys(kept).filter(k=>!(k in found));
  const moved=Object.keys(found).filter(k=>k in kept&&kept[k]!==found[k]).map(k=>`${k}: ${kept[k]} → ${found[k]}`);
  const fix=' Review them, then run node tests/p993-overlap-survey.mjs --write.';
  assert.deepEqual(added,[],`${added.length} new crossing pairs.`+fix);
  assert.deepEqual(gone,[],`${gone.length} pairs no longer cross.`+fix);
  assert.deepEqual(moved,[],`${moved.length} pairs changed class.`+fix);
});

test('the survey totals: 153 errors at the first survey, 48 left, all in the engine compartment and driveline',()=>{
  assert.equal(pairs.length,169);
  assert.deepEqual(['assembly','mount','terminal','through','overlap'].map(count),[82,22,17,12,36]);
  assert.equal(wrong.length,48);
  assert.deepEqual(wrong.filter(p=>!engineBay(p.a)&&!engineBay(p.b)).map(p=>p.a+' + '+p.b),[]);
});

test('the cabin, floor, front compartment, sills and wheel arches have no errors',()=>{
  const clear=p=>/^(floor|cabin|fuel\.(tank|filler|pump|sender)|brakes|electrical\.(battery|fuses|cables|starter)|993-climate\.(evaporator|blowers|mix|outlets|dryer|condenser)|993-lubrication\.(tank|thermostat|filter|outbound|return|cooler|fan)|lights|roof|running)/.test(p);
  assert.deepEqual(wrong.filter(p=>(clear(p.a)||clear(p.b))&&!(p.a.startsWith('drivetrain.gearbox')||p.b.startsWith('drivetrain.gearbox'))).map(p=>p.a+' + '+p.b),[]);
});

test('every reviewed mount and reviewed error names a pair that crosses, with a reason',()=>{
  const within=(pattern,id)=>id===pattern||id.split('.')[0]===pattern;
  for(const [u,v,reason] of [...mounts,...errors]){
    assert(reason&&reason.length>10,`${u} + ${v} needs a reason`);
    assert(pairs.some(p=>(within(u,p.a)&&within(v,p.b))||(within(u,p.b)&&within(v,p.a))),`${u} + ${v} no longer crosses; remove it from the list`);
  }
});
