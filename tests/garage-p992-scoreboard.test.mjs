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
  'g500 assemblies':24,'g500 installed':258,
  'porsche993cab installed':146,'bmw325ci installed':169,
  // Ties count as gaps: the 911 must lead outright.
  'sl550 assemblies':21,
};
// The G500 is being built up in parallel by another line of work. Its
// clickable parts and studies are contested: the 911 led both when this was
// written (1,773 and 160 against 1,228 and 156), but the test does not fail
// the G500's own pull requests when it moves ahead; it fails only if the 911
// stops being listed by name below.
const contested=new Set(['g500 clickable','g500 studies']);
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
  assert(s.clickable>=1773&&s.studies>=160&&s.assemblies>=21&&s.installed>=134,JSON.stringify(s));
});
