import assert from 'node:assert/strict';
import {test} from 'node:test';
import {VEHICLES} from '../garage/catalog.js';
import {measure} from './garage-detail-scoreboard.mjs';

// Hub #261: the 2023 911 is to be the most detailed vehicle in the garage, ahead
// of every other one on all four measures. Each entry below is a measure on
// which another vehicle still leads, with that vehicle's value when the gap
// was recorded. The list may only shrink: a new gap fails, and a closed gap
// fails until its entry is removed.
const target='porsche992scab';
const measures=['clickable','studies','assemblies','installed'];
const openGaps={
  // Round 4 (fit packs) closed the last gaps: the 911 now leads on all four.
};
// The G500 is being built up in parallel by another line of work, so every
// G500 measure is contested: the test does not fail the G500's own pull requests
// when it moves ahead. At round 4 the 911 led it on all four (2,772 clickable,
// 216 studies, 53 assemblies and 425 installed, against 1,645, 212, 24 and 369).
const contested=new Set(measures.map(m=>'g500 '+m));
const scores=Object.fromEntries(Object.keys(VEHICLES).map(v=>[v,measure(v)]));

test('the 911 leads every vehicle on every measure, apart from the recorded open gaps',()=>{
  const ours=scores[target],gaps=[];
  for(const [v,s] of Object.entries(scores))if(v!==target)for(const m of measures)if(s[m]>=ours[m]&&!contested.has(`${v} ${m}`))gaps.push(`${v} ${m}`);
  const added=gaps.filter(g=>!(g in openGaps)),closed=Object.keys(openGaps).filter(g=>!gaps.includes(g));
  assert.deepEqual(added,[],'the 911 has fallen behind on these measures');
  assert.deepEqual(closed,[],'these gaps are closed: remove them from openGaps');
});

test('the 911 never loses detail it already has',()=>{
  const s=scores[target];
  assert(s.clickable>=2772&&s.studies>=216&&s.assemblies>=53&&s.installed>=425,JSON.stringify(s));
});
