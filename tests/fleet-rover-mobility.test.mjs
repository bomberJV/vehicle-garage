import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {rockerPose} from '../garage/perseverance-mobility.js';

function mesh(study,phase){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null});
  study.draw(r,phase);return r.faces;
}
function follow(vehicle,initial,...path){
  let view=getDetail(vehicle,initial);
  for(const id of path){
    assert.ok(view.groups.flatMap(g=>g.parts).some(p=>p.id===id),view.id+' exposes '+id);
    view=getDetail(vehicle,id);assert.ok(view?.groups,id+' opens a study');
  }
  return view;
}
const points=(faces,tag)=>faces.filter(f=>f.part===tag).flatMap(f=>f.points);
function valid(study){
  const f=mesh(study,0),parts=study.groups.flatMap(g=>g.parts);
  assert.deepEqual(new Set(f.map(x=>x.part)),new Set(parts.map(x=>x.id)));
  for(const face of f)assert.ok(face.points.every(p=>p.every(Number.isFinite)));
  assert.ok(study.source.url.startsWith('https:'));
}
test('Apollo wheels expose independent motor and harmonic reduction animations through the actual detail catalog',()=>{
  const wheel=getDetail('apollo-lrv','wheels.wheel1'),root=['apollo-lrv','wheels.wheel1','lrv-wheel.drive'];
  const drive=follow(...root),motor=follow(...root,'lrv-traction.motor'),gear=follow(...root,'lrv-traction.reduction');
  assert.equal(drive.id,follow('apollo-lrv','wheels.wheel4','lrv-wheel.hub').id);
  for(const d of [wheel,drive,motor,gear])valid(d);
  for(const [d,fixed,moving] of [[wheel,'drive','mesh'],[motor,'brushes','commutator'],[gear,'rigid','flex']]){
    assert.ok(d.animated);
    const still=mesh(d,0),turn=mesh(d,.21);
    assert.deepEqual(points(still,d.id+'.'+fixed),points(turn,d.id+'.'+fixed));
    assert.notDeepEqual(points(still,d.id+'.'+moving),points(turn,d.id+'.'+moving));
  }
});
test('Mars stack opens to six wheels, two wheel types, a separate rocker-bogie and a wheel actuator',()=>{
  const base=['atlas-v-541','upper.payload','mars.rover'],vehicle=follow(...base);
  const corner=follow(...base,'percy-rover.fl'),center=follow(...base,'percy-rover.ml');
  const linkage=follow(...base,'percy-rover.right-rocker'),drive=follow(...base,'percy-rover.mr','percy-center.drive');
  for(const d of [vehicle,corner,center,linkage,drive])valid(d);
  for(const key of ['fl','fr','rr','rl','ml','mr']){
    assert.equal(follow(...base,'percy-rover.'+key).id,key[0]==='m'?center.id:corner.id);
  }
  assert.ok(corner.groups[0].parts.some(p=>p.id.endsWith('.steer')));
  assert.ok(center.groups[0].parts.some(p=>p.id.endsWith('.knuckle')));
  assert.equal(follow(...base,'percy-rover.left-bogie','percy-linkage.ml').id,center.id);
  assert.equal(mesh(corner,0).filter(f=>f.part.endsWith('.tread')).length,48*3*2);
  const before=mesh(center,0),during=mesh(center,.19);
  assert.deepEqual(points(before,'percy-center.drive'),points(during,'percy-center.drive'));
  assert.notDeepEqual(points(before,'percy-center.spokes'),points(during,'percy-center.spokes'));
});
test('rocker and bogie maintain rigid lengths through articulation and the body follows both rockers',()=>{
  const len=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
  const pairs=[['pivot','front'],['pivot','frontKnee'],['pivot','joint'],['joint','middle'],['joint','rear'],['middle','rear']];
  for(let j=0;j<=16;j++){
    const t=j/16,left=rockerPose(1,t),right=rockerPose(-1,t);
    assert.ok(Math.abs(left.bodyAngle-(left.rockAngle+right.rockAngle)/2)<1e-10);
    for(const [side,pose] of [[1,left],[-1,right]]){
      const initial=rockerPose(side,0);
      for(const [a,b] of pairs)assert.ok(Math.abs(len(initial[a],initial[b])-len(pose[a],pose[b]))<1e-10);
    }
  }
  assert.ok(rockerPose(1,.5).front[2]>rockerPose(1,0).front[2]+.15);
});
