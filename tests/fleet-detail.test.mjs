import test from 'node:test';
import assert from 'node:assert/strict';
import {airModels} from '../garage/fleet-air.js';
import {seaModels} from '../garage/fleet-sea.js';
import {trackedModels} from '../garage/fleet-tracked.js';
import {getFleetDetail} from '../garage/fleet-detail.js';
import {GarageRenderer} from '../garage/render.js';
import {windowedLoft,skin} from '../garage/air-mesh.js';

function mesh(study){
  const r=Object.create(GarageRenderer.prototype);
  r.faces=[];study.draw(r);return r.faces;
}
test('each aircraft, ship, sub and historical tank opens a referenced, finite exhibit with independently tagged pieces',()=>{
  const vehicles=[...airModels,...seaModels,...trackedModels];
  assert.equal(vehicles.length,21);
  const done=new Set();
  function validate(vehicle,parts){
    let routes=0;
    for(const part of parts){
      const study=getFleetDetail(vehicle,part.id);
      if(!study)continue;
      routes++;
      if(done.has(study.id))continue;
      done.add(study.id);
      const leaves=study.groups.flatMap(g=>g.parts);
      assert.ok(leaves.length>=2,study.id);
      assert.ok(study.source.label&&new URL(study.source.url).protocol==='https:',study.id);
      assert.ok(leaves.every(p=>p.description&&p.id.split('.').length===2&&p.offset.length===3&&p.offset.every(Number.isFinite)),study.id);
      const ids=new Set(leaves.map(p=>p.id));
      assert.equal(ids.size,leaves.length,study.id);
      const geometry=mesh(study);
      assert.deepEqual(new Set(geometry.map(f=>f.part)),ids,study.id);
      assert.ok(geometry.every(f=>/^#[0-9a-f]{6}$/i.test(f.color)&&f.points.length>=3&&f.points.every(v=>v.length===3&&v.every(Number.isFinite))),study.id);
      validate(vehicle,leaves);
    }
    return routes;
  }
  for(const vehicle of vehicles)assert.ok(validate(vehicle.id,vehicle.groups.flatMap(g=>g.parts))>0,vehicle.id);
  assert.ok(done.size>=29);
  assert.equal(getFleetDetail('toString','constructor'),null);
  assert.equal(getFleetDetail('alvin','crew.missing'),null);
});
test('container hold and Alvin sphere open a second level linked to the correct parent',()=>{
  const sphere=getFleetDetail('alvin','crew.sphere');
  const ports=sphere.groups[0].parts.filter(p=>p.id.includes('.viewport-'));
  assert.equal(ports.length,5);
  const forward=getFleetDetail('alvin',ports[0].id),side=getFleetDetail('alvin',ports.at(-1).id);
  assert.notEqual(forward.id,side.id);
  for(const model of [forward,side])assert(mesh(model).some(face=>face.opacity<1));
  const container=getFleetDetail('ooclspain','container_bay.stack-3');
  assert.equal(container.groups[0].parts.filter(p=>p.id.endsWith('door')).length,2);
  assert(getFleetDetail('boeing747','fuselage.cockpit').id!==getFleetDetail('boeing747','fuselage.cabin').id);
  assert.equal(getFleetDetail('gulfstreamg800','fuselage.cockpit').groups[0].parts.length,7);
});
test('a civilian window cuts a hole through the opaque skin on both sides',()=>{
  const stations=[[-1,.5,.70,.45],[1,.5,.70,.45]],pane=[[-.4,-.3],[.4,-.3],[.4,.3],[-.4,.3]];
  const shell=mesh({draw:r=>windowedLoft(r,stations,'#9ba5aa',[pane])});
  // Count intersections of a ray through x=0,z=.7 with the cabin shell.
  const crossed=shell.filter(f=>{
    const xs=f.points.map(p=>p[0]),altitudes=f.points.map(p=>p[2]);
    return Math.min(...xs)<0&&Math.max(...xs)>0&&Math.min(...altitudes)<=.7&&Math.max(...altitudes)>=.7;
  });
  assert.equal(crossed.length,0);
  const glazing=mesh({draw:r=>{for(const side of [-1,1])skin(r,stations,side,pane,'#93b3bb',.34);}});
  assert.deepEqual(new Set(glazing.map(f=>Math.sign(f.points[0][1]))),new Set([-1,1]));
  assert(glazing.every(f=>f.opacity===.34));
  for(const id of ['boeing747','gulfstreamg800','cessna172','piperj5']){
    assert(mesh(airModels.find(m=>m.id===id)).some(f=>f.opacity<1),id);
  }
  for(const id of ['pioneeringspirit','azzam','octopussy','ooclspain']){
    assert(mesh(seaModels.find(m=>m.id===id)).some(f=>f.opacity<1),id);
  }
});
