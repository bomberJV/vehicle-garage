import test from 'node:test';
import assert from 'node:assert/strict';
import {getDoorDetail,doorForGlazing} from '../garage/door-detail.js';
import {getAssemblies} from '../garage/assemblies.js';
import {GarageRenderer} from '../garage/render.js';
import {fittedWindow} from '../garage/exterior-trim.js';
import {buildBmwExterior} from '../garage/exterior-bmw.js';
import {buildG500Exterior,buildFordExterior} from '../garage/exterior-utility.js';
import {buildHrvExterior,buildC63Exterior} from '../garage/exterior-modern.js';
const byCar={g500:4,f350:2,hrv:4,c63:4,bmw325ci:2,porsche993cab:2,porsche992scab:2};
function mesh(draw){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null,lights:false});
  draw(r);return r.faces;
}
const points=(faces,id)=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
function bounds(points,axis){
  const values=points.map(p=>p[axis]);
  return [Math.min(...values),Math.max(...values)];
}
const middle=([lo,hi])=>(lo+hi)/2;
test('each physical passenger door opens its own sourced study with glass, trim, latch, hinges and lift',()=>{
  let count=0;
  for(const [vehicle,expected] of Object.entries(byCar)){
    const panels=getAssemblies(vehicle).find(a=>['body','shell'].includes(a.id));
    const doors=panels.parts.map(p=>getDoorDetail(vehicle,p.id)).filter(d=>d?.id.startsWith('door-'));
    assert.equal(doors.length,expected,vehicle);assert.equal(new Set(doors.map(d=>d.id)).size,expected);
    for(const d of doors){
      const poses=mesh(r=>d.draw(r)),tagSet=new Set(poses.map(f=>f.part));
      const parts=d.groups.flatMap(g=>g.parts);
      assert.deepEqual(new Set(parts.map(p=>p.id)),tagSet);
      assert.ok(poses.every(f=>f.points.every(p=>p.every(Number.isFinite))),d.name);
      assert.ok(poses.some(f=>f.opacity>0&&f.opacity<1&&f.part===d.id+'.glass'));
      assert.ok(d.source.url.startsWith('https://'));
      for(const piece of ['regulator','latch','hinge','trim']){
        const next=getDoorDetail(vehicle,d.id+'.'+piece);
        assert.ok(next.groups[0].parts.length>=4,piece);
        assert.equal(next.animated,piece!=='trim');
      }
      for(const piece of ['check','glass','frame','skin','seals','outer-handle','inner-handle','speaker'])assert.ok(tagSet.has(d.id+'.'+piece));
      const latchX=middle(bounds(points(poses,d.id+'.latch'),0)),hingeX=middle(bounds(points(poses,d.id+'.hinge'),0));
      assert.equal(Math.sign(latchX-hingeX),d.id.endsWith('-left')?1:-1);
      count++;
    }
  }
  assert.equal(count,20);
});
test('a picked door pane opens its own supporting panel; fixed windshield glass still opens the glass study',()=>{
  for(const [vehicle,builder] of [['g500',buildG500Exterior],['hrv',buildHrvExterior],['c63',buildC63Exterior],['bmw325ci',buildBmwExterior],['f350',buildFordExterior]]){
    const faces=mesh(r=>builder(r,'#697e78',[]));
    const panes=new Set(faces.filter(f=>f.part==='body.glass').map(f=>f.rigid?.name).filter(Boolean));
    const ids=Array.from(panes,mount=>doorForGlazing('body.glass',mount));
    assert.ok(ids.includes('body.door')&&ids.includes('body.front-right'),vehicle);
    for(const id of ids.filter(id=>id!=='body.glass'))assert.ok(getDoorDetail(vehicle,id));
  }
  assert.equal(doorForGlazing('body.glass','windshield'),'body.glass');
});
test('cargo door support and glazing follow actual closure type',()=>{
  const keys={f350:'body.deck',hrv:'body.deck',g500:'body.tailgate',bmw325ci:'body.deck',c63:'body.deck'};
  for(const [vehicle,id] of Object.entries(keys)){
    const d=getDoorDetail(vehicle,id),faces=mesh(r=>d.draw(r));
    assert.equal(new Set(faces.map(f=>f.part)).size,d.groups[0].parts.length);
    assert.equal(faces.some(f=>f.part===d.id+'.glass'),['g500','hrv'].includes(vehicle));
    assert.equal(faces.some(f=>f.part===d.id+'.supports'),['hrv','f350'].includes(vehicle));
    assert.equal(faces.some(f=>f.part===d.id+'.carrier'),vehicle==='g500');
  }
});
test('993 cross arm keeps a body-fixed pivot and a constant arm length; HR-V and E46 glass carriers move on distinct rail layouts',()=>{
  for(const [vehicle,count] of [['hrv',1],['bmw325ci',2]]){
    const id='regulator-'+vehicle;
    const lift=getDoorDetail(vehicle,'door-'+vehicle+'-front-left.regulator');
    const low=mesh(r=>lift.draw(r,0)),high=mesh(r=>lift.draw(r,.5));
    const track=points(low,id+'.track');
    assert.deepEqual(track,points(high,id+'.track'));
    assert.equal(new Set(track.map(p=>p[0])).size,count*3);
    for(const tag of ['glass','carriage']){
      const a=bounds(points(low,id+'.'+tag),2),b=bounds(points(high,id+'.'+tag),2);
      assert.ok(Math.abs((b[0]-a[0])-.41)<1e-8);
    }
  }
  const d=getDoorDetail('porsche993cab','door-porsche993cab-front-left.regulator');
  for(const t of [0,.12,.46,.81]){
    const f=mesh(r=>d.draw(r,t)).find(face=>face.part===d.id+'.arm');
    // Profile's long edges bracket the two arm endpoints.
    const p=f.points,mid=(a,b)=>a.map((v,i)=>(v+b[i])/2);
    const a=mid(p[0],p[3]),b=mid(p[1],p[2]);
    assert.ok(Math.abs(a[0]+.34)<1e-8&&Math.abs(a[2]-.14)<1e-8);
    assert.ok(Math.abs(Math.hypot(b[0]-a[0],b[2]-a[2])-.78)<1e-8);
  }
});
test('the moving hinge knuckle remains concentric with its pin and the striker enters the latch slot before capture',()=>{
  const h=getDoorDetail('g500','door-g500-front-left.hinge');
  const h0=mesh(r=>h.draw(r,0)),h1=mesh(r=>h.draw(r,.45));
  assert.equal(JSON.stringify(points(h0,'door-hinge.pin')),JSON.stringify(points(h1,'door-hinge.pin')));
  assert.notDeepEqual(points(h0,'door-hinge.door'),points(h1,'door-hinge.door'));
  assert.deepEqual(points(h0,'door-hinge.pillar'),points(h1,'door-hinge.pillar'));
  const latch=getDoorDetail('g500','door-g500-front-left.latch');
  const opened=mesh(r=>latch.draw(r,0)),entered=mesh(r=>latch.draw(r,.06)),closed=mesh(r=>latch.draw(r,.42));
  assert.deepEqual(points(opened,'door-latch.fork'),points(entered,'door-latch.fork'));
  assert.ok(middle(bounds(points(opened,'door-latch.striker'),2))>middle(bounds(points(entered,'door-latch.striker'),2))+.45);
  assert.notDeepEqual(points(entered,'door-latch.fork'),points(closed,'door-latch.fork'));
});
test('the 993 map pocket opens into a lined bin; the truck vent is a separate selectable pane',()=>{
  const d=getDoorDetail('porsche993cab','door-porsche993cab-front-left.carpet');
  const f=mesh(r=>d.draw(r));
  assert.ok(f.some(face=>face.part===d.id+'.textile')&&f.some(face=>face.part===d.id+'.bin'));
  const ford=getDoorDetail('f350','body.door');
  assert.ok(ford.groups[0].parts.some(p=>p.id===ford.id+'.vent'));
});
test('depth remains behind clear optics on the three updated front ends',()=>{
  const g=mesh(r=>buildG500Exterior(r,'#80938a',[]));
  const optic=g.filter(f=>f.part==='lighting.headlamp'&&f.opacity<1&&f.points.every(p=>p[1]>0));
  const reflect=g.filter(f=>f.part==='lighting.reflector'&&f.points.every(p=>p[1]>0));
  assert.ok(optic.length>100);assert.ok(reflect.length>50);
  assert.ok(Math.max(...optic.flatMap(f=>f.points.map(p=>p[0])))<Math.min(...reflect.flatMap(f=>f.points.map(p=>p[0]))));
  for(const draw of [buildBmwExterior,buildHrvExterior]){
    const f=mesh(r=>draw(r,'#7d8989',[]));assert.ok(f.some(q=>q.part==='lighting.headlamp'&&q.opacity>0&&q.opacity<1));
  }
});

test('curved side glass meets the gasket and the E46 front door has a free top edge',()=>{
  const square=[[-1,0,0],[-.6,0,1],[.8,0,1],[1,0,0]];
  const flat=mesh(r=>fittedWindow(r,square));
  const bowed=mesh(r=>fittedWindow(r,square,{sideCrown:-.01,frameless:true}));
  assert.deepEqual(bounds(flat.flatMap(f=>f.points),1),[0,0]);
  assert.deepEqual(bounds(bowed.filter(f=>f.opacity<1).flatMap(f=>f.points),1),[-.01,0]);
  assert.ok(bowed.some(f=>f.color==='#829a96'&&f.points.every(p=>p[2]>.9)));
  const actual=mesh(r=>buildBmwExterior(r,'#69817e'));
  for(const side of ['left','right']){
    const pane=actual.filter(f=>f.rigid?.name==='front-door-'+side&&f.part==='body.glass');
    assert.ok(pane.some(f=>f.color==='#829a96'));
    assert.ok(pane.every(f=>f.points.every(p=>side==='left'?p[1]<0:p[1]>0)));
  }
});
