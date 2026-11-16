import assert from 'node:assert/strict';
import test from 'node:test';
import {VEHICLES} from '../garage/catalog.js';
import {vehicleDecisions} from '../garage/vehicle-decisions.js';
import {vehicleReviewTracks} from '../garage/priority-review-tracks.js';
import {requestSections} from '../garage/priority-requests.js';
import {trackingDefaults} from '../garage/priority-tracking.js';

const requests=requestSections.flatMap(s=>s.items);

test('every configuration decision names real vehicles, sources and board entries',()=>{
  assert.equal(new Set(vehicleDecisions.map(d=>d.id)).size,vehicleDecisions.length);
  for(const d of vehicleDecisions){
    assert(d.title&&d.decision&&d.basis,d.id);
    for(const id of d.vehicleIds)assert(Object.hasOwn(VEHICLES,id),d.id+' '+id);
    assert(d.sources.length);
    for(const s of d.sources)assert.equal(new URL(s.url).protocol,'https:',d.id);
    assert(d.unblocks.length);
    for(const ref of d.unblocks){
      const [kind,id]=ref.split(':');
      assert(trackingDefaults(kind,id),d.id+' → '+ref);
    }
  }
});

test('no review task waits on a choice that has been decided',()=>{
  for(const track of vehicleReviewTracks)for(const step of track.steps)assert.equal(step.reason,step.description,step.id);
});

test('a vehicle has one priority across its register entry and review tasks',()=>{
  for(const track of vehicleReviewTracks){
    const level=trackingDefaults('vehicle',track.id).level;
    for(const step of track.steps)assert.equal(trackingDefaults('review',step.id).level,level,step.id);
  }
});

test('the five November 15 note entries are To do with their priority and the note’s task',()=>{
  const expected={'porsche-equipment-fit':['P1',/Keep the ladder only if a real one fits/],'g500-2002-guard':['P1',/hoop profile, crossbars/],
    'g500-sump-diff-clearance':['P0',/meshes intersect or the renderer shows a hidden surface/],'sl550-engine-detail':['P1',/valve covers, intake and charge plumbing/],
    's1000rr-engine-detail':['P1',/fairings hidden so the shapes and connection points/]};
  for(const [id,[level,text]] of Object.entries(expected)){
    const t=trackingDefaults('request',id);
    assert.equal(t.workflow,'todo',id);assert.equal(t.level,level,id);assert.match(t.reason,text,id);
    assert(requests.some(r=>r.id===id));
  }
  for(const id of ['porsche-equipment-fit','g500-2002-guard','g500-sump-diff-clearance'])assert.equal(requests.find(r=>r.id===id).status,'partial');
});
