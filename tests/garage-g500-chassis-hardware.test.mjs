import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {addedServiceGroups} from '../garage/vehicle-service.js';
import {chassisRows,railTop,chassisLiftWeight} from '../garage/g500-chassis-hardware.js';
import {g500Geometry} from '../garage/g500-geometry-register.js';
import {gaps} from '../garage/g500-evidence-chassis.js';

const faces=GarageRenderer.assembledFaces(sanitizeBuild({vehicle:'g500'}));
const group=addedServiceGroups('g500').find(g=>g.id==='chassis');

test('the G500 chassis hardware group draws every row on the installed vehicle',()=>{
  assert.ok(group);
  assert.deepEqual(group.parts.map(p=>p.id),chassisRows.map(r=>'chassis.'+r[0]));
  for(const p of group.parts){
    const own=faces.filter(f=>f.part===p.id);
    assert.ok(own.length>0,p.id);
    assert.equal(new URL(p.source.url).protocol,'https:');
  }
  // The hardware adds detail without blowing the vehicle's face budget.
  assert.ok(faces.filter(f=>f.part.startsWith('chassis.')).length<6000);
});

test('body mounts sit between the rail top and the floor sill',()=>{
  const mounts=faces.filter(f=>f.part==='chassis.body-mounts').flatMap(f=>f.points);
  for(const [x,y,z] of mounts){
    if(Math.abs(y)<.465||Math.abs(y)>.53)continue;
    assert.ok(z<=.7046,`${x},${y},${z}`);
    if(x<1)assert.ok(z<.575,`${x},${y},${z}`);
  }
  assert.ok(Math.abs(railTop(-.52)-.499)<1e-9&&Math.abs(railTop(.46)-.501)<1e-9);
});

test('axle-carried hardware stays with the axle under a lift and the cables blend',()=>{
  for(const key of ['abs-rings','abs-sensors','steering-damper','front-swivels','front-hub-ends','rear-bearings'])assert.equal(chassisLiftWeight(key,[0,0,.5]),0);
  for(const key of ['body-mounts','bump-stops'])assert.equal(chassisLiftWeight(key,[0,0,.5]),1);
  assert.equal(chassisLiftWeight('parking-cables',[.96,0,.52]),1);
  assert.equal(chassisLiftWeight('parking-cables',[1.46,.6,.32]),0);
  assert.equal(chassisLiftWeight('abs-leads',[-1.47,.6,.47]),0);
  assert.equal(chassisLiftWeight('abs-leads',[-1.2,.55,.64]),1);
});

test('the register counts the series as modeled and keeps the open chassis gaps',()=>{
  const records=g500Geometry();
  const rows=records.rows.filter(r=>r.id.startsWith('chassis.'));
  assert.equal(rows.length,chassisRows.length);
  for(const r of rows)assert.equal(r.kind,'diagram',r.id);
  assert.equal(gaps.length,5);
  assert.ok(!gaps.some(g=>/ABS wheel-speed|Steering damper|Rear wheel-bearing/.test(g.title)));
});
