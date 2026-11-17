import assert from 'node:assert/strict';
import test from 'node:test';
import {requestSections} from '../garage/priority-requests.js';
import {vehiclePriorities} from '../garage/priority-vehicles.js';
import {trackingDefaults,priorityLevels,workflowStatuses} from '../garage/priority-tracking.js';

const requests=requestSections.flatMap(s=>s.items);
const vehicleMap=new Map(vehiclePriorities.map(v=>[v.id,v]));

test('every registered vehicle and request has explicitly assigned priority, workflow, rationale and real category memberships',()=>{
  const levels=priorityLevels.map(row=>row.id),workflows=workflowStatuses.map(row=>row.id);
  assert.deepEqual(levels,['P0','P1','P2','P3']);
  assert.deepEqual(workflows,['todo','in-progress','done','parked']);
  assert.deepEqual(workflowStatuses.map(row=>row.label),['To do','In progress','Done','Parked']);
  const seenLevels=new Set(),seenWorkflows=new Set();
  assert.equal(vehicleMap.size,38);
  for(const [kind,records] of [['request',requests],['vehicle',vehiclePriorities]]){
    for(const row of records){
      const defaults=trackingDefaults(kind,row.id);
      assert.ok(defaults,kind+' '+row.id);
      const {level,workflow,reason,vehicleIds,categories,domains,types}=defaults;
      assert.ok(levels.includes(level));assert.ok(workflows.includes(workflow));
      seenLevels.add(level);seenWorkflows.add(workflow);
      assert.ok(reason.trim(),row.id);
      const members=vehicleIds.map(id=>vehicleMap.get(id));
      assert.ok(members.every(Boolean));
      assert.deepEqual(new Set(categories.map(c=>c.domain+'/'+c.type)),new Set(members.map(m=>m.domain+'/'+m.type)));
      assert.deepEqual(new Set(domains),new Set(members.map(m=>m.domain)));
      assert.deepEqual(new Set(types),new Set(members.map(m=>m.type)));
      if(kind==='vehicle'){
        assert.deepEqual(vehicleIds,[row.id]);
        assert.deepEqual(categories,[{domain:row.domain,type:row.type}]);
        assert.notEqual(workflow,'done','Every registered vehicle has a remaining next check');
      }
    }
  }
  assert.deepEqual(seenLevels,new Set(levels));assert(seenWorkflows.has('done')&&seenWorkflows.has('todo')&&!seenWorkflows.has('parked'));
});
test('cross-domain requests include the proper domain/subtype pairs, including workbench features across all exhibits',()=>{
  const membership=id=>new Set(trackingDefaults('request',id).categories.map(c=>c.domain+'/'+c.type));
  assert.deepEqual(membership('space'),new Set(['Air/Space','Land/Rovers']));
  assert.deepEqual(membership('heritage'),new Set(['Land/Tanks','Air/Planes','Air/Helicopters']));
  assert.deepEqual(membership('rear-ladders'),new Set(['Land/SUVs','Land/Cars']));
  assert.deepEqual(membership('maritime'),new Set(['Sea/Ships','Sea/Yachts','Sea/Fishing boats','Sea/Submarines']));
  for(const id of ['compact-explosion','model-validation','occlusion-report','references','narration','all-vehicles']){
    assert.deepEqual(new Set(trackingDefaults('request',id).vehicleIds),new Set(vehicleMap.keys()));
  }
  for(const id of ['dark-matter','medical','portfolio-writing','pantry'])assert.deepEqual([...membership(id)],[]);
});
test('the repaired rendering issue retains P0 while pending visual checks and missing references retain their own states',()=>{
  const request=id=>trackingDefaults('request',id);
  assert.equal(requests.find(r=>r.id==='occlusion-report').status,'shipped');
  assert.equal(request('occlusion-report').level,'P0');
  assert.equal(request('occlusion-report').workflow,'done');
  assert.equal(request('model-validation').workflow,'todo');
  assert.equal(trackingDefaults('vehicle','f350').workflow,'todo');
  assert.match(trackingDefaults('vehicle','f350').reason,/1993.*engine and axle/);
  assert.equal(request('compact-explosion').workflow,'done');
  assert.equal(request('surface-order').workflow,'todo');
  for(const [kind,id] of [['request','constructor'],['vehicle','__proto__'],['other','g500']])assert.equal(trackingDefaults(kind,id),null);
  const changed=request('space');changed.vehicleIds.pop();changed.categories[0].type='mutation';
  assert.equal(request('space').vehicleIds.length,7);assert.ok(request('space').types.includes('Space'));
});
