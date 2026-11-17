import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {VEHICLES} from '../garage/catalog.js';
import {additionalRequestSections,backlogSources,proposedVariants} from '../garage/priority-backlog.js';
import {requestSections} from '../garage/priority-requests.js';
import {vehicleReviewTracks} from '../garage/priority-review-tracks.js';
import {trackingDefaults} from '../garage/priority-tracking.js';
import {inScope,readFilters} from '../garage/priority-filters.js';
import {voiceKey} from '../shared/narration-voice.js';

const requests=additionalRequestSections.flatMap(section=>section.items);
const request=id=>requests.find(item=>item.id===id);
const assignment=id=>trackingDefaults('request',id);
const filters=query=>readFilters(new URLSearchParams(query));

test('the new implementation passes cover all 39 vehicles and route the applicable work through vehicle filters',()=>{
  assert.equal(vehicleReviewTracks.length,39);
  assert.equal(vehicleReviewTracks.flatMap(track=>track.steps).length,117);
  for(const id of ['installed-complete','body-translucency','focus-installed-core','model-variant-selector','copy-voice-next-pass']){
    assert.deepEqual(new Set(assignment(id).vehicleIds),new Set(Object.keys(VEHICLES)),id);
    for(const vehicle of Object.keys(VEHICLES))assert(inScope(assignment(id),filters('vehicle='+vehicle)),id+' / '+vehicle);
  }
  const road=assignment('road-applicable-systems');
  for(const id of ['g500','bmw325ci','porsche993cab','porsche992scab','bmws1000rr'])assert(inScope(road,filters('vehicle='+id)));
  for(const id of ['boeing747','sherman-e8','apollo-falcon'])assert(!inScope(road,filters('vehicle='+id)));
  for(const [id,vehicle] of [['747400-cabin-safety','boeing747'],['172s-cabin-safety','cessna172'],['j5a-cabin-safety','piperj5'],['g800-cabin-safety','gulfstreamg800']]){
    assert.deepEqual(assignment(id).vehicleIds,[vehicle]);
    assert(inScope(assignment(id),filters('vehicle='+vehicle+'&status=todo')));
    assert(request(id).links.some(link=>new URL(link.url,'https://offline.example/garage/priorities.html').searchParams.get('vehicle')===vehicle));
  }
  const military=assignment('military-public-safety');
  assert.equal(military.vehicleIds.length,9);
  assert(!military.vehicleIds.some(id=>assignment('civil-cabin-safety-coverage').vehicleIds.includes(id)));
  assert.match(request('military-public-safety').description,/public.*general crew|general crew.*public/);
  assert.match(request('military-public-safety').description,/Exclude weapon internals, mission systems/);
  for(const id of military.vehicleIds)assert(!assignment('civil-other-system-depth').vehicleIds.includes(id));
});

test('verified partial work and genuinely planned aircraft or SL work have distinct honest workflow states',()=>{
  for(const id of ['installed-complete','body-translucency','focus-installed-core','g500-full-exhaust','g500-electrical-network','g500-cabin-climate-column','g500-cooling-intake','road-applicable-systems','model-variant-selector','copy-voice-next-pass']){
    assert.equal(request(id).status,'partial',id);
    assert.equal(assignment(id).workflow,'in-progress',id);
  }
  for(const id of ['civil-other-system-depth','civil-cabin-safety-coverage','747400-cabin-safety','172s-cabin-safety','j5a-cabin-safety','g800-cabin-safety','military-public-safety','evaluate-r231-sl63']){
    assert.equal(request(id).status,'open',id);
    assert.equal(assignment(id).workflow,'todo',id);
  }
  assert.equal(assignment('installed-complete').level,'P0');
  assert.equal(assignment('focus-installed-core').level,'P0');
  assert.equal(trackingDefaults('request','inspection-motion').workflow,'done');
  assert.equal(trackingDefaults('vehicle','bmw325ci').workflow,'todo');
  for(const row of requests){
    assert(['P0','P1','P2'].includes(assignment(row.id).level));
    assert(requestSections.some(section=>section.items.some(item=>item.id===row.id)));
    assert(!/\b(?:today|yesterday|as of|this week)\b/i.test(row.description+' '+assignment(row.id).reason));
  }
});

test('the US 2014 SL550 is available and the SL63 proposal retains its factory references',()=>{
  assert.deepEqual(proposedVariants.map(v=>[v.year,v.market,v.generation,v.trim]),[[2014,'US','R231','SL63 AMG']]);
  assert(Object.hasOwn(VEHICLES,'sl550'));
  assert.equal(assignment('evaluate-r231-sl550').workflow,'done');
  assert.deepEqual(assignment('evaluate-r231-sl550').vehicleIds,['sl550']);
  for(const proposal of proposedVariants){
    assert(!Object.hasOwn(VEHICLES,proposal.id));
    assert(!vehicleReviewTracks.some(track=>track.id===proposal.id));
    assert(request(proposal.requestId));
    assert.deepEqual(assignment(proposal.requestId).vehicleIds,[]);
    const links=request(proposal.requestId).links;
    assert(links.some(link=>link.url===backlogSources.slManual));
    assert(links.some(link=>link.url.startsWith(backlogSources.slBrochure)));
  }
  for(const [id,source] of [['747400-cabin-safety','boeing400'],['172s-cabin-safety','cessnaEarlyS'],['j5a-cabin-safety','piperOwner'],['g800-cabin-safety','gulfstream']]){
    const row=request(id);
    assert(row.links.some(link=>link.url===backlogSources[source]));
    assert(row.links.some(link=>['www.faa.gov','www.faasafety.gov'].includes(new URL(link.url,'https://offline.example').hostname)));
  }
  for(const url of Object.values(backlogSources))assert.equal(new URL(url).protocol,'https:');
});

test('the published offline bank contains every new backlog explanation, rationale and link label',()=>{
  const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url)));
  const phrases=[];
  for(const section of additionalRequestSections){
    phrases.push(section.name);
    for(const row of section.items)phrases.push(row.title,row.description,assignment(row.id).reason,...row.links.map(link=>link.label));
  }
  for(const phrase of phrases)assert(bank[voiceKey(phrase)],phrase);
});
