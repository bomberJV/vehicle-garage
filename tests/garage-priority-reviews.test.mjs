import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {VEHICLES} from '../garage/catalog.js';
import {getDetail} from '../garage/detail-catalog.js';
import {vehicleReviewTracks,vehicleReviewTasks,reviewProgress} from '../garage/priority-review-tracks.js';
import {trackingDefaults} from '../garage/priority-tracking.js';
import {readFilters,writeFilters,inScope,savedAssignment} from '../garage/priority-filters.js';
import {matches} from '../garage/priority-board.js';
import {voiceKey} from '../shared/narration-voice.js';

const base='https://offline.example/extracted/garage/priorities.html';
test('the detail review automatically covers the actual collection with independent actionable tasks',()=>{
 assert.deepEqual(vehicleReviewTracks.map(v=>v.id).sort(),Object.keys(VEHICLES).sort());
 assert.equal(vehicleReviewTasks.length,Object.keys(VEHICLES).length*3);
 assert.equal(new Set(vehicleReviewTasks.map(v=>v.id)).size,vehicleReviewTasks.length);
 assert.equal(new Set(vehicleReviewTasks.map(v=>v.description)).size,vehicleReviewTasks.length);
 for(const track of vehicleReviewTracks){
  assert.equal(track.name,VEHICLES[track.id].name);assert(track.recorded.trim());
  assert.deepEqual(track.steps.map(t=>t.title),['Source and geometry comparison','Component detail pass','Render and interaction QA']);
  for(const task of track.steps){
   assert(task.description.length>35&&task.description.length<300);
   const defaults=trackingDefaults('review',task.id);assert.deepEqual(defaults.vehicleIds,[track.id]);
   assert.deepEqual(defaults.categories,[{domain:track.domain,type:track.type}]);
   const url=new URL(task.links[0].url,base);assert.equal(url.pathname,'/extracted/garage/index.html');
   assert.equal(url.searchParams.get('vehicle'),track.id);assert.equal(url.hash,'#workbench');
   if(url.searchParams.has('open'))assert(getDetail(track.id,url.searchParams.get('open')),task.id);
  }
 }
});
test('G500 is the depth baseline, BMW remains partial, and done means the three review tasks are done',()=>{
 const g=vehicleReviewTracks.find(v=>v.id==='g500'),b=vehicleReviewTracks.find(v=>v.id==='bmw325ci');
 assert.equal(reviewProgress(g).label,'Reference baseline');assert.equal(reviewProgress(g).done,1);
 assert.equal(reviewProgress(b).label,'Partly reviewed');
 assert(!vehicleReviewTracks.some(v=>reviewProgress(v).label==='Review complete'));
 assert.equal(reviewProgress(b,['done','done','done']).label,'Review complete');
 assert.equal(trackingDefaults('vehicle','g500').workflow,'todo');
 assert.equal(trackingDefaults('vehicle','bmw325ci').workflow,'todo');
 assert.equal(trackingDefaults('request','occlusion-report').workflow,'done');
 assert.equal(trackingDefaults('request','project-priorities').workflow,'done');
 assert.equal(trackingDefaults('review','__proto__'),null);
 const changed=trackingDefaults('review',g.steps[0].id);changed.vehicleIds.pop();
 assert.deepEqual(trackingDefaults('review',g.steps[0].id).vehicleIds,['g500']);
});
test('vehicle, status and category filters apply to review tasks and keep existing assignments valid',()=>{
 const filters=readFilters(new URLSearchParams('vehicle=bmw325ci&status=in-progress&priority=P1&domain=Land&type=Cars&hide=Ships'));
 assert.deepEqual(readFilters(writeFilters(filters)),filters);
 const shown=vehicleReviewTasks.filter(t=>inScope(trackingDefaults('review',t.id),filters));
 assert.deepEqual(shown.map(t=>t.id),['bmw325ci--geometry','bmw325ci--detail']);
 assert(matches(shown[1],'BMW M54 saddle','all'));
 assert.equal(inScope(trackingDefaults('vehicle','bmw325ci'),filters),false);
 assert.equal(readFilters(new URLSearchParams('vehicle=constructor')).vehicle,'all');
 assert.deepEqual(savedAssignment({workflow:'done',level:'P0',description:'untrusted'}),{workflow:'done',level:'P0'});
});
test('military tracks are limited to public exterior comparisons',()=>{
 for(const id of ['little-willie','sherman-e8','f16','f22','f35','b52','uh60','mh6','ch47']){
  const track=vehicleReviewTracks.find(v=>v.id===id);assert.match(track.scope,/Public exterior geometry only/);
  for(const step of track.steps)assert.doesNotMatch(step.description,/weapon|guidance|targeting|fire control|combat|ballistic/i);
 }
});
test('the board exposes the new track without replacing saved record namespaces',()=>{
 const dir=new URL('../garage/',import.meta.url);
 const html=readFileSync(new URL('priorities.html',dir),'utf8'),script=readFileSync(new URL('priority-board.js',dir),'utf8');
 for(const id of ['reviews','review-sections','vehicle-filter','detail-benchmark'])assert(html.includes('id="'+id+'"'));
 assert(html.includes('for="vehicle-filter"'));assert(script.includes("garage.priority-board.record.v1."));
 assert(script.includes("entry('request',item)"));assert(script.includes("entry('vehicle',item)"));assert(script.includes("entry('review',task)"));
});
test('all review explanations have real published offline recordings',()=>{
 const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url)));
 for(const track of vehicleReviewTracks){
  assert(bank[voiceKey('Recorded work. '+track.recorded)],track.id);
  for(const step of track.steps){assert(bank[voiceKey(step.description)],step.id);assert(bank[voiceKey(step.reason)],step.id);}
 }
});
