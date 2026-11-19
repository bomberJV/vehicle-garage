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
  'g500 clickable':1009,'g500 studies':138,'g500 assemblies':24,'g500 installed':258,
  'porsche993cab clickable':456,'porsche993cab installed':146,
  'bmw325ci clickable':472,'bmw325ci installed':169,
  // Ties count as gaps: the 911 must lead outright.
  'porsche993cab studies':63,'bmw325ci studies':63,'sl550 assemblies':21,
};
const scores=Object.fromEntries(Object.keys(VEHICLES).map(v=>[v,measure(v)]));

test('the 911 leads every vehicle on every measure, apart from the recorded open gaps',()=>{
  const ours=scores[target],gaps=[];
  for(const [v,s] of Object.entries(scores))if(v!==target)for(const m of measures)if(s[m]>=ours[m])gaps.push(`${v} ${m}`);
  const added=gaps.filter(g=>!(g in openGaps)),closed=Object.keys(openGaps).filter(g=>!gaps.includes(g));
  assert.deepEqual(added,[],'the 911 has fallen behind on these measures');
  assert.deepEqual(closed,[],'these gaps are closed: remove them from openGaps');
});

test('the 911 never loses detail it already has',()=>{
  const s=scores[target];
  assert(s.clickable>=428&&s.studies>=63&&s.assemblies>=21&&s.installed>=134,JSON.stringify(s));
});
