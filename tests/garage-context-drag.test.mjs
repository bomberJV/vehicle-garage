import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {bindViewerInput} from '../garage/viewer-input.js';
import {sanitizeBuild} from '../garage/model.js';

const ctx={save(){},restore(){},translate(){},scale(){},setTransform(){},clearRect(){},fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},
  createRadialGradient:()=>({addColorStop(){}})};
function scene(width=400,height=320){
  const rect={width,height,left:17,top:21},handlers=new Map();
  const canvas={width,height,clientWidth:width,dataset:{},getBoundingClientRect:()=>rect,focus(){},setPointerCapture(){},
    addEventListener(type,handle){handlers.set(type,handle);}};
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle:'bmw325ci'}),canvas,ctx,inspection:{},
    angle:-.58,elevation:.24,zoom:1,partPositions:new Map(),depthRender(){},reducedMotion:{matches:true}});
  r.setInspection({assembly:null});bindViewerInput(r);
  function pointer(type,x,y,timeStamp,extra={}){
    handlers.get('pointer'+type)({pointerId:1,button:0,pointerType:'touch',clientX:rect.left+x,clientY:rect.top+y,timeStamp,...extra});
  }
  function keydown(key){handlers.get('keydown')({key,shiftKey:true,preventDefault(){}});}
  return {r,rect,pointer,keydown};
}
function visiblePoint(r,part,instance){
  const rect=r.canvas.getBoundingClientRect();
  for(const f of r.hitFaces){
    if(f.part!==part||(instance&&f.instance!==instance))continue;
    const x=f.projected.reduce((a,p)=>a+p.x,0)/f.projected.length;
    const y=f.projected.reduce((a,p)=>a+p.y,0)/f.projected.length;
    const hit=r.hitTest(rect.left+x,rect.top+y);
    if(hit?.part===part&&(!instance||hit.instance===instance))return {x,y,hit};
  }
  assert.fail('No visible point on '+part);
}
function geometry(r,except){return r.faces.filter(f=>f.motionKey!==except).map(f=>f.points);}
function inView(r,key){
  const b=r.partFrames.get(key),a=r.placementArea;
  const eps=.00001;
  assert.ok(b.right>=a.left-eps&&b.left<=a.right+eps&&b.top<=a.bottom+eps&&b.bottom>=a.top-eps,'a visible portion remains');
  if(b.right-b.left<a.right-a.left)assert.ok(b.left>=a.left-eps&&b.right<=a.right+eps,'left/right edges inside');
  if(b.bottom-b.top<a.bottom-a.top)assert.ok(b.top>=a.top-eps&&b.bottom<=a.bottom+eps,'top/bottom edges inside');
}
test('a touch drag, release and empty tap retain the vehicle, physical selection and parked neighbors',()=>{
  globalThis.window={devicePixelRatio:2};
  try{
    const {r,pointer}=scene();
    const id='body.hood',point=visiblePoint(r,id),total=r.faces.length,homeCamera={...r.lastCamera};
    let tapped=0,opened=0,dragged=0,deselected=0;
    r.onSelect=()=>tapped++;
    r.onOpenPart=()=>opened++;
    r.onDragSelect=hit=>{dragged++;r.setInspection({...r.inspection,part:hit.part,instance:hit.instance});};
    r.onDeselect=()=>{deselected++;r.setInspection({...r.inspection,part:null,instance:null});};
    pointer('down',point.x,point.y,100);pointer('move',point.x,point.y-37,150);pointer('up',point.x,point.y-37,180);
    assert.deepEqual([tapped,opened,dragged],[0,0,1]);assert.equal(r.inspection.assembly,null);
    assert.equal(r.faces.length,total);assert.equal(r.inspection.part,id);assert.equal(r.inspection.onlyPart,undefined);
    assert.equal(r.selectedMoveKey(),point.hit.motionKey);assert.ok(r.partPositions.has(point.hit.motionKey));
    assert.deepEqual(r.lastCamera,homeCamera);
    const parked=r.faces.find(f=>f.motionKey===point.hit.motionKey).points;
    pointer('down',1,1,300);pointer('up',1,1,340);
    assert.equal(deselected,1);assert.equal(r.inspection.part,null);assert.equal(r.faces.length,total);
    assert.deepEqual(r.faces.find(f=>f.motionKey===point.hit.motionKey).points,parked);
    assert.ok(r.resetPartPositions(point.hit.motionKey));assert.equal(r.partPositions.size,0);
  }finally{delete globalThis.window;}
});
test('a contextual neighboring part stays draggable and selecting a wheel keeps the other three corners',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    const {r}=scene();r.setInspection({assembly:'lighting'});
    const point=visiblePoint(r,'body.hood'),original=geometry(r,point.hit.motionKey),count=r.faces.length;
    assert(r.beginPartDrag(point.hit));assert(r.movePart(point.hit.motionKey,0,-35));
    assert.equal(r.inspection.assembly,'lighting');assert.equal(r.faces.length,count);
    assert.deepEqual(geometry(r,point.hit.motionKey),original);
    r.isolate=true;r.setInspection({assembly:'wheels',part:'wheels.rim',instance:'rear-left'});
    const wheels=r.faces.filter(f=>f.part==='wheels.rim');
    assert.equal(new Set(wheels.map(f=>f.instance)).size,4);
    assert(wheels.every(f=>f.highlighted===(f.instance==='rear-left')));
    r.setInspection({assembly:null,part:'wheels.rim',instance:'rear-right',onlyPart:true});
    assert(r.faces.length);assert(r.faces.every(f=>f.part==='wheels.rim'&&f.instance==='rear-right'));
    assert(r.selectedMoveKey());
  }finally{delete globalThis.window;}
});
test('manual placement stays within the available desktop and mobile bench after zoom, orbit and resize',()=>{
  globalThis.window={devicePixelRatio:2};
  try{
    const {r,rect}=scene(350,295);
    r.setInspection({assembly:null,part:'body.hood',onlyPart:true});
    const key=r.selectedMoveKey();
    for(const [width,height,zoom] of [[350,295,1],[720,510,.8],[315,410,2.2]]){
      rect.width=width;rect.height=height;r.canvas.clientWidth=width;r.zoom=zoom;r.angle+=.25;r.elevation+=.08;r.draw();
      const current=r.lastCamera;
      for(const [dx,dy] of [[5000,3000],[-4000,-2300]]){
        r.moveSelected(dx,dy);inView(r,key);assert.deepEqual(r.lastCamera,current);
      }
      r.resetPartPositions();
    }
  }finally{delete globalThis.window;}
});
test('a pre-existing cross-section carries its clipped fragments and leaves adjacent cut faces unchanged',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    const {r}=scene();
    r.sectionPlane={axis:1,percent:55,reverse:false};r.setInspection({assembly:null,part:'body.hood'});
    const key=r.selectedMoveKey(),other=geometry(r,key);
    const part=r.faces.filter(f=>f.motionKey===key).map(f=>f.points);
    assert(r.moveSelected(0,-34));const delta=r.partPositions.get(key);
    assert.deepEqual(geometry(r,key),other);
    assert.deepEqual(r.faces.filter(f=>f.motionKey===key).map(f=>f.points),part.map(ps=>ps.map(p=>p.map((v,i)=>v+delta[i]))));
  }finally{delete globalThis.window;}
});
test('a grabbed BMW surface stops in front of a foreground panel instead of vanishing behind it',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    const {r}=scene(440,320);
    const p=visiblePoint(r,'body.hood'),key=p.hit.motionKey;
    r.setInspection({assembly:null,part:p.hit.part,instance:p.hit.instance});
    r.drag={move:true,key,anchor:{x:p.x,y:p.y}};
    const depth=r.surfaceAt(p.x,p.y,{only:key}).depth;
    const q=r.hitFaces.filter(f=>f.motionKey!==key).flatMap(f=>f.projected)
      .find(q=>q.depth>depth+.02&&r.surfaceAt(q.x,q.y,{except:key})?.depth>depth+.02);
    assert(q);
    const dx=q.x-p.x,dy=q.y-p.y,allowed=r.visibleDragFraction(key,dx,dy);
    assert(allowed>=0&&allowed<1);
    assert((r.surfaceAt(p.x+dx*allowed,p.y+dy*allowed,{except:key})?.depth??-Infinity)<=depth+1e-8);
  }finally{delete globalThis.window;}
});
test('button and keyboard nudges keep a partly occluded pin visible beside its cover after orbit or zoom',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    const {r,keydown}=scene(480,340);
    const detail={id:'nudge-fixture',groups:[{id:'bench',parts:[{id:'bench.pin'},{id:'bench.cover'},{id:'bench.base'}]}],
      draw(r){
        r.tag('bench.pin',()=>r.box(-.24,-.10,.40,.04,-.08,.44,'#c06044'));
        r.tag('bench.cover',()=>r.box(0,.18,.24,.65,.21,.61,'#67798a'));
        r.tag('bench.base',()=>r.box(-.7,-.30,-.10,.70,-.26,.02,'#697986'));
      }};
    r.angle=0;r.elevation=0;r.setInspection({detailView:detail,detailPart:'bench.pin'});
    for(const [azimuth,zoom] of [[0,1],[.16,1.35]]){
      r.angle=azimuth;r.zoom=zoom;r.draw();
      const key=r.selectedMoveKey(),others=geometry(r,key),home=r.partFrames.get(key).left,frame=r.lastCamera;
      keydown('ArrowRight');assert(r.partFrames.get(key).left>home,'shift-arrow moved the pin');
      assert(r.moveSelected(18,0),'button moved the pin');
      for(let j=0;j<8;j++)r.moveSelected(18,0);
      const {x,y}=r.lastNudge.anchor;
      assert.equal(r.surfaceAt(x,y)?.face.motionKey,key);
      assert.equal(r.moveSelected(80,0),false,'the cover now obstructs this direction');
      assert.deepEqual(geometry(r,key),others);
      assert.deepEqual(r.lastCamera,frame);
      assert(r.resetPartPositions(key));assert(Math.abs(r.partFrames.get(key).left-home)<1e-7);
    }
  }finally{delete globalThis.window;}
});
