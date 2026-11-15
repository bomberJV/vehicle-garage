import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {intersects,allowedTravel,sampleMotion} from '../garage/exploded-layout.js';
import {bindViewerInput} from '../garage/viewer-input.js';

function renderer(vehicle,inspection,options={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle,paint:'olive',finish:'silver',parts:[]},inspection,
    faces:[],lights:true,schematic:true,...options,
  });
  r.buildMesh();return r;
}
function verifyClear(layout){
  const list=[...layout.groups.values()];
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
    const a=list[i],b=list[j];
    if(!a.movable&&!b.movable)continue;
    assert.ok(!intersects(a.parked||a.bounds,b.parked||b.bounds),a.key+' intersects '+b.key);
  }
}

test('expanded G500 rigid closures and a full V8 ignition set clear the contextual mesh',()=>{
  for(const i of [{assembly:'body',expanded:true},{assembly:'powertrain',expanded:true}]){
    const r=renderer('g500',i);
    verifyClear(r.activeLayout);
    if(i.assembly==='powertrain'){
      const plugs=r.faces.filter(f=>f.part==='powertrain.spark-plugs');
      assert.equal(new Set(plugs.map(f=>f.instance)).size,16);
      const first=plugs[0];
      r.inspection={...i,part:first.part,instance:first.instance,onlyPart:true};r.buildMesh();
      assert.ok(r.faces.length>5 && r.faces.length<100);assert.ok(r.faces.every(f=>f.instance===first.instance));
    }
  }
});
test('one wheel component can be moved independently and reset without accumulating geometry changes',()=>{
  const i={assembly:'wheels',expanded:true,part:'wheels.rim',instance:'front-left'};
  const r=renderer('g500',i,{angle:0,elevation:0,pixelScale:100,project:p=>p});
  const original=r.faces.find(f=>f.part===i.part && f.instance===i.instance).points[0];
  const untouched=r.faces.find(f=>f.part===i.part && f.instance==='rear-left').points[0];
  r.draw=()=>r.buildMesh();
  assert(r.moveSelected(15,-30));
  assert.notDeepEqual(r.faces.find(f=>f.part===i.part && f.instance===i.instance).points[0],original);
  assert.deepEqual(r.faces.find(f=>f.part===i.part && f.instance==='rear-left').points[0],untouched);
  r.resetPartPositions();
  const animation=r.returnMotion;
  assert.ok(animation);
  r.advancePartReturn(animation.start+animation.duration/2);r.draw();
  assert.notDeepEqual(r.faces.find(f=>f.part===i.part && f.instance===i.instance).points[0],original);
  r.advancePartReturn(animation.start+animation.duration);r.draw();
  assert.deepEqual(r.faces.find(f=>f.part===i.part && f.instance===i.instance).points[0],original);
});
test('double tap uses the first part even when its selection changes the camera',()=>{
  const handlers=new Map(),canvas={addEventListener(k,f){handlers.set(k,f);},focus(){},setPointerCapture(){}};
  const initial={assembly:'powertrain',part:'powertrain.spark-plugs',instance:'1-0-0'};
  let hit=initial,opened;
  const r={canvas,build:{vehicle:'g500'},inspection:{},hitTest:()=>hit,onSelect:()=>{hit=null;},onOpenPart:h=>{opened=h;}};
  bindViewerInput(r);
  for(const timeStamp of [1000,1250])for(const event of ['pointerdown','pointerup']){
    handlers.get(event)({pointerId:1,button:0,pointerType:'touch',clientX:160,clientY:120,timeStamp});
  }
  assert.deepEqual(opened,initial);
});
test('fractional explosion is reversible, and a drag cannot tunnel through a thin part',()=>{
  const rise={from:0,to:1,start:0,duration:500};
  const halfway=sampleMotion(rise,250);
  assert.equal(halfway,.5);
  const reverse={from:halfway,to:0,start:250,duration:250};
  assert.equal(sampleMotion(reverse,250),halfway);assert.equal(sampleMotion(reverse,500),0);
  const box={min:[0,0,0],max:[1,1,1]}, obstacle={min:[2,0,0],max:[2.001,1,1]};
  const moved=allowedTravel(box,[200,0,0],[obstacle],.02);
  assert.ok(moved[0]>.95 && moved[0]<.981);
});
test('detail geometry renders alone, animates at the requested phase and isolates individual child parts',()=>{
  let seen=0;
  const parts=[{id:'plug.shell',offset:[.3,0,0]},{id:'plug.core',offset:[-.3,0,0]}];
  const d={id:'sample',groups:[{id:'plug',parts}],draw(r,phase){seen=phase;for(const p of parts)r.tag(p.id,()=>r.box(-.2,-.2,0,.2,.2,1,'#456789'));}};
  const r=renderer('g500',{detailView:d,expanded:true});
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(parts.map(p=>p.id)));
  verifyClear(r.activeLayout);r.mechanismPhase=.56;r.buildMesh();assert.equal(seen,.56);
  r.inspection={detailView:d,expanded:false,detailPart:'plug.core',onlyPart:true};r.buildMesh();
  assert(r.faces.length&&r.faces.every(f=>f.part==='plug.core'));
});

test('a pinned headlamp, spring and rear wheel each isolate the clicked physical instance',()=>{
  for(const [assembly,part,instance] of [
    ['lighting','lighting.headlamp','front-right'],
    ['suspension','suspension.spring','rear-left'],
    ['wheels','wheels.rim','rear-right'],
  ]){
    const r=renderer('g500',{assembly,part,instance,onlyPart:true,expanded:false},{isolate:true});
    assert(r.faces.length>5,part);
    assert(r.faces.every(f=>f.part===part && f.instance===instance));
  }
});

test('the structural anchor of a detailed study can be dragged independently',()=>{
  const parts=[{id:'sample.anchor',offset:[0,0,0]},{id:'sample.cover',offset:[.6,0,0]}];
  const view={id:'sample',groups:[{id:'sample',parts}],draw(r){
    for(const p of parts)r.tag(p.id,()=>r.box(-.1,-.1,0,.1,.1,.25,'#456789'));
  }};
  const r=renderer('g500',{detailView:view,detailPart:'sample.anchor',expanded:true},
    {angle:0,elevation:0,pixelScale:100,project:p=>p});
  const origin=r.faces[0].points[0];
  r.draw=()=>r.buildMesh();
  assert.ok(r.moveSelected(-25,0));
  assert.equal(r.faces[0].points[0][0],origin[0]-.25);
});

test('separately mounted closures and detailed studies follow clear opening paths',async()=>{
  const {getDetail}=await import('../garage/detail-catalog.js');
  const {offsetAt,planTravel}=await import('../garage/explosion-travel.js');
  const {displaced}=await import('../garage/exploded-layout.js');
  for(const [vehicle,assembly,part] of [
    ['g500','body'],['g500','body','body.hood'],['bmw325ci','body'],['g500','powertrain','powertrain.spark-plugs'],
    ['hrv','drivetrain','drivetrain.gearbox'],['apollo-falcon','cabin','cabin.shell'],
  ]){
    const detailView=part?getDetail(vehicle,part):null;
    if(part)assert.ok(detailView,part);
    const r=renderer(vehicle,{assembly:detailView?null:assembly,detailView,expanded:true});
    const groups=[...r.activeLayout.groups.values()];
    planTravel(r.activeLayout);
    for(let step=1;step<=24;step++){
      const boxes=groups.map(g=>displaced(g.bounds,offsetAt(g,step/24)));
      for(let i=0;i<groups.length;i++)for(let j=0;j<i;j++){
        const a=groups[i],b=groups[j];
        if((!a.movable&&!b.movable)||intersects(a.bounds,b.bounds))continue;
        assert.ok(!intersects(boxes[i],boxes[j]),vehicle+' '+a.key+' intersects '+b.key);
      }
    }
  }
});

test('Hero uses a detail study’s authored camera on entry and subsequent resets',()=>{
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'apollo-falcon'},draw(){}});
  const view={id:'cabin',viewAngle:[-1.55,.62]};
  r.setView('hero',view);
  assert.deepEqual([r.angle,r.elevation],view.viewAngle);
  r.inspection={detailView:view};r.setView('side');r.setView('hero');
  assert.deepEqual([r.angle,r.elevation],view.viewAngle);
});
