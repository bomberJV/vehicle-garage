import test from 'node:test';
import {COMPACT_SPREAD} from '../garage/compact-explosion.js';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {bindViewerInput} from '../garage/viewer-input.js';
import {displaced,intersects} from '../garage/exploded-layout.js';
import {advanceReturn,returningPath} from '../garage/part-return.js';

function renderer(inspection,options={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'g500',paint:'olive',finish:'silver',parts:[]},
    inspection:{},progress:0,partPositions:new Map(),reducedMotion:{matches:false},
    angle:0,elevation:0,pixelScale:100,project:p=>p,lights:true,faces:[],schematic:true,...options
  });
  r.draw=()=>r.buildMesh();r.setInspection(inspection);return r;
}

test('a drag on a parked mesh moves the selected physical part while dragging the backdrop or shift-dragging orbits',()=>{
  const handlers=new Map();
  const canvas={addEventListener(k,f){handlers.set(k,f);},focus(){},setPointerCapture(){},getBoundingClientRect:()=>({width:900,height:500})};
  const r=renderer({assembly:'wheels',expanded:false,part:'wheels.rim',instance:'front-left'},{canvas});
  const f=r.faces.find(f=>f.part==='wheels.rim'&&f.instance==='front-left');
  const untouched=r.faces.find(f=>f.part==='wheels.rim'&&f.instance==='rear-left').points[0];
  r.hitTest=()=>({assembly:'wheels',part:f.part,instance:f.instance,motionKey:f.motionKey});bindViewerInput(r);
  const event=(type,x,y,shiftKey=false)=>handlers.get(type)({clientX:x,clientY:y,pointerId:1,button:0,isPrimary:true,pointerType:'mouse',shiftKey});
  event('pointerdown',200,200);event('pointermove',225,165);event('pointerup',225,165);
  assert.equal(r.progress,0);assert.equal(r.inspection.expanded,false);assert(r.partPositions.has(f.motionKey));
  assert.notDeepEqual(r.faces.find(p=>p.motionKey===f.motionKey).points[0],f.points[0]);
  assert.deepEqual(r.faces.find(f=>f.part==='wheels.rim'&&f.instance==='rear-left').points[0],untouched);
  const pose=r.partPositions.get(f.motionKey);
  event('pointerdown',200,200,true);event('pointermove',225,210,true);event('pointerup',225,210,true);
  assert.notEqual(r.angle,0);assert.deepEqual(r.partPositions.get(f.motionKey),pose);
});

test('individual returns interpolate and leave other manually moved groups alone',()=>{
  const parts=[{id:'a.one',offset:[-.2,0,0]},{id:'a.two',offset:[.2,0,0]}];
  const detail={id:'d',groups:[{id:'a',parts}],draw(r){for(const [i,p] of parts.entries())r.tag(p.id,()=>r.box(i,-.05,0,i+.07,.05,.1,'#505050'));}};
  const r=renderer({detailView:detail,detailPart:'a.one'});
  r.movePart('a.one',-40,-10);r.movePart('a.two',20,-25);
  const start=r.partPositions.get('a.one'),untouched=r.partPositions.get('a.two');
  r.resetPartPositions('a.one');const anim=r.returnMotion;
  r.advancePartReturn(anim.start+anim.duration/2);
  assert.ok(Math.abs(r.partPositions.get('a.one')[0]-start[0]*.5)<1e-8);
  r.advancePartReturn(anim.start+anim.duration);
  assert.equal(r.partPositions.has('a.one'),false);assert.deepEqual(r.partPositions.get('a.two'),untouched);
  r.reducedMotion.matches=true;r.resetPartPositions();assert.equal(r.returnMotion,null);assert.equal(r.partPositions.size,0);
});

test('a manual reset follows a bent, interleaved path before moving travel continues',()=>{
  const start=[0,0,0],side=[.2,0,0],up=[.2,0,.1],other=[0,.1,0];
  const history=[{key:'a',from:start,to:side},{key:'b',from:start,to:other},{key:'a',from:side,to:up}];
  const positions=new Map([['a',up],['b',other]]),path=returningPath(positions,history);
  advanceReturn(path,positions,.25);assert.deepEqual(positions.get('a'),side);assert.deepEqual(positions.get('b'),other);
  advanceReturn(path,positions,.5);assert.deepEqual(positions.get('a'),side);assert.deepEqual(positions.get('b'),start);
  advanceReturn(path,positions,1);assert.equal(positions.size,0);

  const r=renderer({assembly:'wheels',part:'wheels.rim',instance:'front-left'});
  assert.ok(r.moveSelected(10,-12));
  r.setInspection({...r.inspection,expanded:true});
  assert.equal(r.progress,0);assert.ok(r.returnMotion);assert.equal(r.motion,null);
  const end=r.returnMotion.start+r.returnMotion.duration;r.advancePartReturn(end);
  assert.equal(r.partPositions.size,0);assert.equal(r.motion.to,COMPACT_SPREAD/100);
});

test('only real multi-part layouts offer expansion, and tight contextual routes require isolation',()=>{
  const r=renderer({assembly:'wheels'});assert.ok(r.canExpand());assert.equal(r.hasBlockedTransit(),false);
  r.setInspection({assembly:'wheels',part:'wheels.rim',instance:'rear-right',onlyPart:true});assert.equal(r.canExpand(),false);
  r.setInspection({assembly:'powertrain'});assert.equal(r.hasBlockedTransit(),true);
  r.isolate=true;r.draw();assert.ok(r.canExpand());assert.equal(r.hasBlockedTransit(),false);
  const detail={id:'one',groups:[{id:'pin',parts:[{id:'pin.a',offset:[4,0,0]}]}],draw(r){r.tag('pin.a',()=>r.box(0,0,0,.1,.1,.1,'#778899'));}};
  r.setInspection({detailView:detail});assert.equal(r.canExpand(),false);
});

test('spark-plug and split-crankcase studies use close, distinct parked positions',()=>{
  for(const [vehicle,id] of [['g500','powertrain.spark-plugs'],['porsche993cab','engine.case']]){
    const r=renderer({detailView:getDetail(vehicle,id),expanded:true},{build:{vehicle,parts:[]},reducedMotion:{matches:true}});
    const groups=[...r.activeLayout.groups.values()];
    const size=boxes=>Math.hypot(...[0,1,2].map(i=>Math.max(...boxes.map(b=>b.max[i]))-Math.min(...boxes.map(b=>b.min[i]))));
    const parked=groups.map(g=>displaced(g.bounds,g.offset));
    assert.ok(size(parked)/size(groups.map(g=>g.bounds))<1.55,id);
    for(let i=0;i<groups.length;i++)for(let j=0;j<i;j++){
      if(groups[i].movable||groups[j].movable)assert.ok(!intersects(parked[i],parked[j]),groups[i].key+' '+groups[j].key);
    }
  }
});

test('the forged Porsche crankshaft moves as one piece while each machined surface stays selectable',()=>{
  for(const [vehicle,prefix] of [['porsche993cab','993'],['porsche992scab','992']]){
    const crank=getDetail(vehicle,prefix+'crankdrive.shaft');
    const r=renderer({detailView:crank},{build:{vehicle,parts:[]}});
    assert.equal(r.canExpand(),false);
    assert.equal(r.activeLayout.groups.size,1);
    assert.equal(new Set(r.faces.map(f=>f.part)).size,4);
    assert.ok(r.faces.every(f=>f.motionKey===crank.id));
  }
});
