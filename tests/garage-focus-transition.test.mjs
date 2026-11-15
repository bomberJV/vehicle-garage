import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {partMatch,projectedBounds,transitionLayers} from '../garage/focus-transition.js';

const identity={scale:1,dx:0,dy:0};
function rect(x,y,width,height){return {x,y,width,height};}
function fixture(){
  const c={width:600,height:400,clientWidth:600,dataset:{},getBoundingClientRect:()=>({left:0,top:0,width:600,height:400})};
  const ctx={setTransform(){},clearRect(){},save(){},restore(){},translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillText(){},fillRect(){},arc(){},fill(){},drawImage(){},createRadialGradient(){return {addColorStop(){}}}};
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500'},angle:.71,elevation:.29,zoom:1.21,ctx,canvas:c,inspection:{vehicle:'g500'},depthRender(){},reducedMotion:{matches:false}});
  const square=(part,x,y,z,size)=>({part,points:[[x-size,y,z-size],[x+size,y,z-size],[x+size,y,z+size],[x-size,y,z+size]]});
  const component=square('engine.case',1,.4,.6,.14),shell=square('body.door',0,0,.9,2);
  r.buildMesh=()=>{
    if(r.inspection.detailView)r.faces=[square('case.left',0,0,0,.4)];
    else if(r.isolate)r.faces=[component];
    else r.faces=[shell,component];
    r.cameraFrameFaces=null;
  };
  return {r,ctx};
}
test('focus and return meet the same projected part center, even at an oblique orbit',()=>{
  const selected=rect(320,190,45,34),study=rect(280,205,255,200);
  let state={direction:'in',start:0,duration:400,anchor:selected};
  const a=transitionLayers(state,study,600,400,0),half=transitionLayers(state,study,600,400,200),b=transitionLayers(state,study,600,400,400);
  assert.equal(a.incoming.dx+a.incoming.scale*study.x,selected.x);assert.equal(a.incoming.dy+a.incoming.scale*study.y,selected.y);
  assert(half.incoming.scale>a.incoming.scale&&half.incoming.scale<1);assert.equal(half.opacity,.5);
  assert.deepEqual(b.incoming,identity);assert(b.done);
  state={...state,direction:'out',anchor:study};
  assert.deepEqual(transitionLayers(state,selected,600,400,0).outgoing,identity);
  assert.deepEqual(transitionLayers(state,selected,600,400,400).outgoing,a.incoming);
  assert.deepEqual(transitionLayers({...state,anchor:null,direction:'in'},null,600,400,0).incoming,identity);
});
test('the active pick instance and clipped faces define the focus origin',()=>{
  const face=(instance,points)=>({part:'wheels.rim',instance,projected:points.map(([x,y])=>({x,y}))});
  const visible=[face('left',[[10,20],[60,70]]),face('right',[[220,90],[240,120]])];
  assert.deepEqual(projectedBounds(visible,partMatch('wheels.rim','right')),rect(230,105,20,30));
  assert.equal(projectedBounds(visible,partMatch('wheels.rim','rear')),null);
});
test('changing assemblies preserves world framing, and reduced motion reaches a part immediately',()=>{
  const {r,ctx}=fixture();globalThis.window={devicePixelRatio:1};
  globalThis.document={createElement(){return {getContext:()=>ctx};}};
  try{
    r.draw();const original=r.lastCamera,worldPoint=r.project([1,.4,.6]);
    r.keepAssemblyFrame=true;r.isolate=true;r.setInspection({assembly:'engine',vehicle:'g500',expanded:false});
    assert.deepEqual(r.lastCamera,original);assert.deepEqual(r.project([1,.4,.6]),worldPoint);
    assert.deepEqual([r.angle,r.elevation,r.zoom],[.71,.29,1.21]);
    r.sectionPlane={axis:1,percent:60,reverse:false};
    r.beginFocus({direction:'in',part:'engine.case'});r.setInspection({detailView:{id:'case'},vehicle:'g500'});
    const transition=r.focusTransition;assert(transition.destination&&transition.anchor);
    r.paintFocusFrame(transition.start+190);assert(transition.hitTransform.scale<1);
    r.paintFocusFrame(transition.start+401);assert.equal(r.focusTransition,null);assert.equal(r.sectionPlane.percent,60);
    r.reducedMotion.matches=true;r.beginFocus({direction:'out',part:'engine.case'});
    assert.equal(r.focusTransition,null);
  }finally{delete globalThis.window;delete globalThis.document;}
});

test('an isolated G500 engine never blends through its opaque bonnet during a focus change',()=>{
  const {r,ctx}=fixture(),w=600,h=400;
  r.build={vehicle:'g500',paint:'olive',finish:'silver',parts:[]};
  r.buildMesh=GarageRenderer.prototype.buildMesh;
  const painted=[];
  ctx.drawImage=(image)=>painted.push({image,opacity:ctx.globalAlpha});
  globalThis.window={devicePixelRatio:1};
  try{
    r.draw();
    const whole=r.hitFaces;
    const engine={assembly:'powertrain',vehicle:'g500'};
    r.inspection=engine;r.isolate=true;r.keepAssemblyFrame=true;r.draw();
    const parts=r.hitFaces,bodySamples=whole.filter(f=>f.part==='body.hood'&&f.projected.length>2);
    let common=null;
    // Choose a real projected point inside the installed bonnet at which the
    // engine bay becomes visible once the external skin has been removed.
    for(const f of bodySamples){
      const x=f.projected.reduce((sum,p)=>sum+p.x/f.projected.length,0);
      const y=f.projected.reduce((sum,p)=>sum+p.y/f.projected.length,0);
      r.hitFaces=whole;
      if(r.hitTest(x,y)?.part!=='body.hood')continue;
      r.hitFaces=parts;
      const hit=r.hitTest(x,y);
      if(hit?.assembly==='powertrain'){common={x,y,hit};break;}
    }
    assert(common,'a powertrain component sits behind opaque body.hood in this view');
    const source={tag:'whole G500'},destination={tag:'isolated engine'};
    r.focusTransition={canvas:source,destination,start:0,duration:400,direction:'fade'};
    for(const time of [20,75,150,200,225,290,360]){
      painted.length=0;r.paintFocusFrame(time);
      assert(painted.length<=1,'distinct depth-tested views cannot share an animation frame');
      if(painted.length)assert.equal(painted[0].image,time<200?source:destination);
      assert.equal(r.focusTransition.acceptsDestinationPick,time>200);
    }
    r.focusTransition.destination.toDataURL=()=> 'data:image/png,settled-engine';
    r.canvas.toDataURL=()=> 'data:image/png,intermediate-frame';
    r.draw=()=>{};
    assert.equal(r.snapshot(),'data:image/png,settled-engine');
  }finally{delete globalThis.window;}
});
