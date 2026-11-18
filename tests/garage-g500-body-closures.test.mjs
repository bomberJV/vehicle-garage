import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildG500Exterior} from '../garage/exterior-g500.js';
import {cargoSection} from '../garage/door-closures.js';
import {formedRoof,gateHinges} from '../garage/g500-body-closures.js';

function makeRenderer(){
  return Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500'},faces:[],schematic:true,inspection:{},canvas:{getBoundingClientRect:()=>({left:0,top:0})}});
}
function bounds(faces){
  const pts=faces.flatMap(f=>f.points);
  return Array.from({length:3},(_,i)=>[Math.min(...pts.map(p=>p[i])),Math.max(...pts.map(p=>p[i]))]);
}
test('W463 rear cargo opening has fixed wings, near-side picks and distinct hinge leaves',()=>{
  const r=makeRenderer();
  buildG500Exterior(r,'#747f75'); const faces=r.faces;
  r.project=([x,y,z])=>({x:y,y:z,depth:x});
  for(const x of [-.63,.63])assert.equal(r.hitTest(x,1.45)?.part,'body.structure');
  assert.equal(r.hitTest(.29,1.51)?.part,'body.glass');
  assert.equal(r.hitTest(.34,1.0)?.part,'body.tailgate');
  assert.match(r.hitTest(-.115,1.03)?.part,/^body\.spare-(cap|emblem)$/);
  const carrier=faces.filter(f=>f.part.startsWith('body.spare'));
  assert(carrier.every(f=>f.rigid.name==='cargo-door'));
  const [left,right]=bounds(carrier)[1];
  assert.equal(Math.round(1000*(left+right)/2),-115);
  r.faces=faces.filter(f=>f.rigid.name==='body-shell'&&f.points.every(p=>p[0]>1.95));
  assert.equal(r.hitTest(0,1.45),null);
  assert.equal(r.hitTest(.63,1.45)?.part,'body.structure');
  for(const moving of [true,false]){
    const h=makeRenderer();gateHinges(h,'#747f75',moving);
    assert(bounds(h.faces)[1][1]<-.44);
  }
  const study=makeRenderer();cargoSection('g500').draw(study);
  for(const [suffix,dir] of [['.hinge',-1],['.latch',1],['.handle',1]]){
    const p=study.faces.filter(f=>f.part.endsWith(suffix));
    assert(p.length&&p.every(f=>f.points.every(pt=>pt[0]*dir>0)));
  }
});
test('W463 roof has six pressed channels and a through-opening at the moving panel',()=>{
  const r=makeRenderer();formedRoof(r,'#747f75');
  r.project=([x,y,z])=>({x,y,depth:z});
  assert.equal(r.hitTest(-.1,0),null);
  for(const y of [-.564,-.356,-.143,.143,.356,.564]){
    const at=(dy)=>Math.max(...r.faces.flatMap(f=>f.points).filter(p=>Math.abs(p[0]-.745)<.0001&&Math.abs(p[1]-(y+dy))<.0001).map(p=>p[2]));
    assert(at(.014)-at(.007)>.004,'channel disappears at '+y);
  }
  assert.equal(bounds(r.faces)[2][1],2.017);
});
test('the diagonal hem leaves the rear wheel flare on the fixed quarter',()=>{
  const r=makeRenderer();
  buildG500Exterior(r,'#747f75');
  r.project=([x,y,z])=>({x,y:z,depth:-y});
  assert.equal(r.hitTest(.86,.73)?.part,'body.rear-left');
  assert.equal(r.hitTest(1.05,.71)?.part,'body.wheel-flares');
  assert.equal(r.hitTest(1.075,1.08)?.part,'body.rear-left');
  const arch=r.faces.filter(f=>f.rigid.name==='body-shell'&&f.color==='#353a3a');
  for(const axle of [-1.425,1.425])for(const side of [-1,1]){
    assert(arch.some(f=>f.points.every(p=>Math.abs(p[1]-.610*side)<.001&&Math.abs(p[0]-axle)<.46)));
  }
});

test('the G500 cargo door swings outward around its two fixed pins and closes without drift',async()=>{
  const {getDetail}=await import('../garage/detail-catalog.js');
  const view=getDetail('g500','body.tailgate');
  assert.equal(getDetail('g500','body.spare').id,view.id);
  assert.match(view.motionDescription,/80°/);
  const pose=phase=>{
    const r=makeRenderer();r.inspection={assembly:'body',detailView:view};r.mechanismPhase=phase;r.build.parts=[];
    assert(r.getMechanism());r.buildMesh();return r.faces;
  };
  const closed=pose(0),pivot=-.52;
  function comparePoint(a,b){for(let k=0;k<3;k++)assert(Math.abs(a[k]-b[k])<1e-9);}
  for(const [phase,degrees] of [[.125,80*(1-Math.cos(Math.PI/4))/2],[.25,40],[.5,80],[.75,40],[1,0]]){
    const open=pose(phase),a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    assert.equal(open.length,closed.length);
    for(let i=0;i<closed.length;i++){
      const face=closed[i],moved=open[i];
      assert.equal(face.part,moved.part);
      const fixed=['closure-g500.jamb','closure-g500.pins','closure-g500.striker'].includes(face.part);
      for(let j=0;j<face.points.length;j++){
        const [x,y,z]=face.points[j];
        comparePoint(moved.points[j],fixed?[x,y,z]:[pivot+(x-pivot)*c-y*s,(x-pivot)*s+y*c,z]);
      }
    }
  }
  const open=pose(.5),latch=open.filter(f=>f.part==='closure-g500.latch');
  assert(bounds(latch)[1][0]>.95,'the latch must swing outward from the jamb');
  assert(closed.some(f=>f.part==='closure-g500.glass'&&f.opacity<1));
  const r=makeRenderer();r.build.parts=[];r.mechanismPhase=.31;r.inspection={assembly:'body',detailView:view,expanded:true,separation:25};r.buildMesh();
  for(const id of ['closure-g500.spare','closure-g500.hinge','closure-g500.glass','closure-g500.wiper']){
    const face=r.faces.find(f=>f.part===id);
    assert(face.motionKey&&r.activeLayout.groups.get(face.motionKey).draggable);
  }
});
