import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {coupeShape} from '../garage/porsche-coachwork.js';
import {sanitizeBuild,importBuild,exportText} from '../garage/model.js';

for(const [index,vehicle] of ['porsche993cab','porsche992scab'].entries()){
  test(vehicle+' roof switches between a stowed top and a glazed, closed top and survives build export',()=>{
    const legacy={version:1,vehicle,parts:[]},build=importBuild(JSON.stringify(legacy));
    assert.equal(build.roofPosition,'down');
    assert.equal(sanitizeBuild({...build,roofPosition:'other'}).roofPosition,'down');
    const r=Object.assign(Object.create(GarageRenderer.prototype),{build,faces:[],inspection:{},partPositions:new Map()});
    const faces=part=>r.meshCache.faces.filter(face=>face.part===part);
    r.buildMesh();
    const stowed=faces('roof.fabric'),windscreen=faces('cabin.windshield');
    r.build=importBuild(JSON.stringify({...build,roofPosition:'up'}));
    assert.equal(r.build.roofPosition,'up');assert.match(exportText(r.build),/Convertible top: up/);
    r.buildMesh();
    assert.deepEqual(faces('cabin.windshield').filter(f=>!f.roofServicePart),windscreen);
    const top=faces('roof.fabric'),points=top.flatMap(f=>f.points);
    const shelf=faces('cabin.carpet').find(f=>f.color==='#49494a'&&f.triangles?.length);
    assert(shelf&&Math.min(...shelf.points.map(p=>p[0]))<coupeShape[index].cockpit[1]);
    for(const side of [-1,1])assert(top.some(f=>!f.opacity&&f.points.every(p=>side*p[1]>.5)&&
      Math.min(...f.points.map(p=>p[2]))<.92&&Math.max(...f.points.map(p=>p[2]))>1.04),'fabric sail closes the quarter light down to the beltline');
    const [,headerX,height]=coupeShape[index].screen;
    assert(points.some(p=>Math.abs(p[0]-headerX)<.001&&Math.abs(p[1])<.001&&Math.abs(p[2]-height)<.01),'front bow meets stationary windshield header');
    assert(faces('roof.rear-window').some(f=>f.opacity<1&&f.points.every(p=>p[0]>.65)),'transparent rear window');
    for(const side of [-1,1])assert(faces('cabin.windshield').some(f=>f.opacity<1&&f.points.every(p=>side*p[1]>.5)),'raised window on each side');
    assert(Math.max(...points.map(p=>p[2]))>Math.max(...stowed.flatMap(f=>f.points.map(p=>p[2])))+.20);
    r.inspection={assembly:'shell'};r.mechanismPhase=.32;r.buildMesh();
    const movingTop=faces('roof.fabric');assert.deepEqual(movingTop,top);
    r.build=build;r.buildMesh();assert.deepEqual(faces('roof.fabric'),stowed);
  });
}
test('a roof field from an imported road build is ignored on a fixed-roof vehicle',()=>{
  assert(!Object.hasOwn(sanitizeBuild({vehicle:'g500',roofPosition:'up'}),'roofPosition'));
});
