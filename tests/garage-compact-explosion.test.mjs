import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {COMPACT_SPREAD,spreadPercent,routePhase,bindSpreadControls} from '../garage/compact-explosion.js';
import {displaced,intersects} from '../garage/exploded-layout.js';

const cases=[
  ['g500','body'],['g500','wheels'],['g500','powertrain.spark-plugs'],['g500','differentials.front'],
  ['bmw325ci','wheels'],['porsche993cab','engine.case'],['porsche992scab','drive.gearbox'],['bmws1000rr','body'],
  ['boeing747','fuselage'],['alvin','crew'],['viking90','hull'],['saturn-v','first.bells'],['falcon-9','core']
];
function fixture(vehicle){
  return Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle,parts:[]},faces:[],inspection:{},isolate:true,schematic:true,
    partPositions:new Map(),reducedMotion:{matches:true},draw(){this.buildMesh();}
  });
}
test('compact travel is measured on rendered parts and introduces no overlap across car, ship, aircraft and spacecraft studies',()=>{
  for(const [vehicle,id] of cases){
    const r=fixture(vehicle),detail=getDetail(vehicle,id);
    const scope=detail?{detailView:detail}:{assembly:id};
    r.setInspection(scope);
    assert(r.canExpand(),vehicle+' '+id);assert.equal(r.hasBlockedTransit(),false,vehicle+' '+id);
    const before=r.faces.map(f=>f.points[0]);
    for(const amount of [18,5,41,100,18]){
      r.setInspection({...scope,expanded:true,...(amount===18?{}:{separation:amount})});
      const groups=[...r.activeLayout.groups.values()];
      const full=Math.max(...groups.map(g=>Math.hypot(...g.offset)));
      const furthest=Math.max(...groups.map(g=>Math.hypot(...g.frameOffset)));
      assert(full>0&&Math.abs(furthest/full-amount/100)<1e-6,vehicle+' '+id+' at '+amount);
      const moved=r.faces.map((f,i)=>Math.hypot(...f.points[0].map((v,axis)=>v-before[i][axis])));
      assert(Math.abs(Math.max(...moved)-furthest)<1e-6);
      const posed=groups.map(g=>displaced(g.bounds,g.frameOffset));
      for(let i=0;i<groups.length;i++)for(let j=0;j<i;j++){
        if(!intersects(groups[i].bounds,groups[j].bounds))assert(!intersects(posed[i],posed[j]),vehicle+' '+id+' '+groups[i].key+' / '+groups[j].key);
      }
    }
    r.setInspection(scope);
    assert.deepEqual(r.faces.map(f=>f.points[0]),before);
  }
});
test('a detour preserves its checked route with a continuous final return leg',()=>{
  const group={movable:true,offset:[1,0,0],path:[[0,0,0],[0,2,0],[1,2,0],[1,1,0],[1,0,0]]};
  const layout={routesPlanned:true,groups:new Map([['part',group]])};
  assert(Math.abs(routePhase(layout,.18)*4*2-.18)<1e-10);
  let previous=0;
  for(let i=1;i<=100;i++){
    const current=routePhase(layout,i/100);assert(current>=previous);assert(current-previous<.04);previous=current;
  }
  assert.equal(previous,1);
});
test('reduced motion, invalid saved percentages and rapid slider reversal end at the requested physical stop',()=>{
  assert.equal(spreadPercent('bogus'),COMPACT_SPREAD);assert.equal(spreadPercent(null),18);
  assert.equal(spreadPercent('2'),5);assert.equal(spreadPercent(314),100);
  const r=fixture('g500');const scope={assembly:'wheels',expanded:true,part:'wheels.rim',instance:'front-left'};
  r.setInspection(scope);assert.equal(r.progress,.18);assert.equal(r.motion,null);
  r.reducedMotion.matches=false;r.setInspection({...scope,separation:100});assert.equal(r.motion.to,1);
  r.setInspection({...scope,separation:32});assert.equal(r.motion.to,.32);assert.equal(r.inspection.instance,'front-left');
  r.reducedMotion.matches=true;r.setInspection({...scope,separation:5});assert.equal(r.progress,.05);
  r.setInspection({...scope,expanded:false});assert.equal(r.progress,0);
});

test('the native range and presets operate the renderer and report the same selected distance',()=>{
  const control=(amount)=>{
    const e=new EventTarget();e.dataset={spread:amount};e.attrs={};e.setAttribute=(name,value)=>e.attrs[name]=value;return e;
  };
  const presets=[control('18'),control('100')],container={querySelectorAll:()=>presets};
  const input=control(),output=control(),r=fixture('bmws1000rr');
  const scope={assembly:'body',expanded:true};
  const show=bindSpreadControls(container,input,output,value=>{r.setInspection({...scope,separation:value});show(true,value);});
  show(true,undefined);assert.equal(output.textContent,'Compact · 18%');
  presets[1].dispatchEvent(new Event('click'));assert.equal(r.progress,1);assert.equal(presets[1].attrs['aria-pressed'],'true');
  input.value='27';input.dispatchEvent(new Event('input'));assert.equal(r.progress,.27);assert.equal(input.attrs['aria-valuetext'],'27 percent');
  presets[0].dispatchEvent(new Event('click'));assert.equal(r.progress,.18);assert.equal(presets[0].attrs['aria-pressed'],'true');
  show(false,18);assert.equal(container.hidden,true);
});
test('separation never changes the world projection or zoom, including with a cut open',()=>{
  const r=fixture('g500'),canvas={width:600,height:400,clientWidth:600,dataset:{},getBoundingClientRect:()=>({width:600,height:400,left:0,top:0})};
  const ctx={setTransform(){},clearRect(){},fillRect(){},fillText(){},createRadialGradient(){return {addColorStop(){}}}};
  Object.assign(r,{angle:.42,elevation:.22,zoom:1.14,canvas,ctx,draw:GarageRenderer.prototype.draw,depthRender(){}});
  globalThis.window={devicePixelRatio:1};
  try{
    const view=getDetail('g500','powertrain.spark-plugs'),base={detailView:view,detailPart:view.groups[0].parts[0].id};
    r.sectionPlane={axis:0,percent:71,reverse:true};r.setInspection(base);
    const before=[...Object.values(r.project([.03,-.02,.1]))];
    const sameView=()=>assert.deepEqual([...Object.values(r.project([.03,-.02,.1]))],before);
    for(const amount of [18,63,100,7]){
      r.setInspection({...base,expanded:true,separation:amount});sameView();
      assert.equal(r.sectionPlane.percent,71);assert.equal(r.inspection.detailPart,base.detailPart);
      assert(r.hitFaces.some(f=>f.projected.length>=3&&f.part===base.detailPart));
    }
    r.setInspection(base);sameView();
  }finally{delete globalThis.window;}
});
