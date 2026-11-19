// The 993's compact road-model half-shafts (drive.axles in fleet-porsche.js)
// run from the transaxle's final-drive outputs to the rear hub centres. The
// 992 and 996 keep their level shafts at z .345.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {drawPorsche} from '../garage/fleet-porsche.js';
import {porscheShape} from '../garage/porsche-coachwork.js';
import {rear} from '../garage/porsche993-chassis.js';
import {roadSystems} from '../garage/road-service-data.js';

function caps(vehicle,modern){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[]},inspection:{},faces:[],points:[],partPositions:new Map()});
  drawPorsche(r,modern);
  // Each barrel closes with a 14-sided cap ring: its centre lies on the barrel axis.
  return r.faces.filter(f=>f.part==='drive.axles'&&f.points.length===14).map(f=>{
    const c=f.points.reduce((a,p)=>a.map((v,k)=>v+p[k]/14),[0,0,0]);
    return {c,radius:Math.hypot(...f.points[0].map((v,k)=>v-c[k]))};
  });
}
const range=(faces,id)=>{const zs=faces.filter(f=>f.part===id).flatMap(f=>f.points.map(p=>p[2]));return [Math.min(...zs),Math.max(...zs)];};

test('the 993 outer CV joints sit on the rear hub centre',()=>{
  const car=porscheShape(false),hubZ=car.rearRadius+.006;
  // One hub height in the body, the chassis and the service data.
  assert(Math.abs(hubZ-rear.wheelZ)<1e-9&&Math.abs(hubZ-roadSystems.porsche993cab.wheel[1])<1e-9);
  const joints=caps('porsche993cab',false).filter(k=>Math.abs(k.radius-.046)<1e-3);
  assert.equal(joints.length,4);
  for(const s of [-1,1]){
    const side=joints.filter(k=>Math.sign(k.c[1])===s);
    const centre=side.reduce((a,k)=>a.map((v,i)=>v+k.c[i]/side.length),[0,0,0]);
    assert(Math.abs(centre[2]-hubZ)<.003,`side ${s}: joint z ${centre[2].toFixed(4)}, hub ${hubZ}`);
    assert(Math.abs(centre[0]-rear.axle)<.003,`side ${s}: joint x ${centre[0].toFixed(4)}`);
  }
});

test('the 993 inner shaft ends sit at the final-drive output height of the installed transaxle',()=>{
  // The installed final drive is turned about the output axis; its height is
  // the middle of its vertical extent.
  const faces=GarageRenderer.assembledFaces({vehicle:'porsche993cab',parts:[],roofPosition:'up',paint:'silver'});
  const [lo,hi]=range(faces,'drivetrain.rear-differential'),outputZ=(lo+hi)/2;
  const shafts=caps('porsche993cab',false).filter(k=>Math.abs(k.radius-.025)<1e-3);
  assert.equal(shafts.length,4);
  for(const s of [-1,1]){
    const side=shafts.filter(k=>Math.sign(k.c[1])===s).sort((a,b)=>Math.abs(a.c[1])-Math.abs(b.c[1]));
    const [inner,outer]=side;
    assert(Math.abs(inner.c[2]-outputZ)<.003,`side ${s}: inner end z ${inner.c[2].toFixed(4)}, output ${outputZ.toFixed(4)}`);
    assert(Math.abs(outer.c[2]-porscheShape(false).rearRadius-.006)<.003,`side ${s}: outer end z ${outer.c[2].toFixed(4)}`);
    // Near level: under 1° from the inner joint to the hub.
    assert(Math.abs(Math.atan2(outer.c[2]-inner.c[2],Math.abs(outer.c[1]-inner.c[1])))<Math.PI/180);
  }
});

test('the 992 and 996 compact half-shafts keep their level line at z .345',()=>{
  for(const [vehicle,modern] of [['porsche992scab',true],['porsche996cab','996']]){
    const all=caps(vehicle,modern);
    assert.equal(all.length,8,vehicle);
    for(const k of all)assert(Math.abs(k.c[2]-.345)<1e-9,`${vehicle} z ${k.c[2]}`);
    assert.deepEqual([...new Set(all.filter(k=>k.radius<.03).map(k=>Math.abs(k.c[1]).toFixed(3)))].sort(),['0.109','0.663']);
  }
});
