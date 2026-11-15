import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getDetail} from '../garage/detail-catalog.js';
import {travelFrame} from '../garage/exploded-framing.js';

const ctx={setTransform(){},clearRect(){},fillRect(){},fillText(){},createRadialGradient:()=>({addColorStop(){}})};
function scene(vehicle,id,width,height){
 const detail=getDetail(vehicle,id),[angle,elevation]=detail.viewAngle||[-.58,.24];
 return Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle}),angle,elevation,zoom:1,
  inspection:{detailView:detail},progress:0,canvas:{width,height,clientWidth:width,getBoundingClientRect:()=>({width,height,left:0,top:0})},
  ctx,partPositions:new Map(),depthRender(){},isolate:true});
}
function onBench(r){
 const {width,height}=r.canvas,top=height>=360?68:13,bottom=35,parts=new Set();
 for(const face of r.hitFaces){parts.add(face.part);for(const p of face.projected){
  if(p.x<0||p.x>width||p.y<top||p.y>height-bottom)assert.fail(face.part+' clipped at '+[p.x,p.y]);
 }}
 return parts;
}
test('the H7 lamps, G500 fog and animated Honda CVT stay in the workbench at every sampled separation',()=>{
 globalThis.window={devicePixelRatio:1};
 try{
  for(const [vehicle,id,width,height] of [['bmw325ci','lighting.headlamp',700,430],['bmw325ci','e46-halogen-headlamp.bulbs',345,295],['g500','lighting.fog-left',345,490],['hrv','drivetrain.gearbox',640,370]]){
   const r=scene(vehicle,id,width,height);r.draw();
   const frame=r.lastCamera,visible=onBench(r);
   assert.deepEqual(visible,new Set(r.inspection.detailView.componentIndex.keys()));
   const phases=vehicle==='hrv'?[0,.27,.59]:[0];
   for(const mechanism of phases){
    r.mechanismPhase=mechanism;
    for(const f of [0,.1,.25,.44,.51,.75,.92,1,.17,0]){
     r.progress=f;r.inspection.expanded=f>0;r.draw();
     assert.deepEqual(onBench(r),visible);
     assert.deepEqual(r.lastCamera,frame,'travel and mechanism playback keep the same projection');
    }
   }
  }
 }finally{delete globalThis.window;}
});
test('manual zoom, orbit and a positioned part keep their expected screen projection',()=>{
 globalThis.window={devicePixelRatio:1};
 try{
  const r=scene('bmw325ci','lighting.headlamp',640,410);
  r.progress=1;r.inspection.expanded=true;r.draw();
  const scale=r.pixelScale;r.zoom=1.26;r.draw();assert(Math.abs(r.pixelScale/scale-1.26)<1e-9);
  r.angle+=.23;r.elevation-=.09;r.draw();const {angle,elevation,zoom}=r;
  const selected=r.hitFaces.find(f=>f.part.endsWith('.weather-lens'));
  const key=selected.motionKey,projection=r.lastCamera,initial=selected.projected[0];
  r.clipMove=(_key,from,d)=>from.map((v,i)=>v+d[i]);assert(r.movePart(key,5,-4));
  const after=r.hitFaces.find(f=>f.part===selected.part).projected[0];
  assert.deepEqual(r.lastCamera,projection);assert(Math.abs(after.x-initial.x-5)<1e-7&&Math.abs(after.y-initial.y+4)<1e-7);
  assert.deepEqual([r.angle,r.elevation,r.zoom],[angle,elevation,zoom]);
 }finally{delete globalThis.window;}
});
test('intermediate route excursions contribute to the bounds even when a part parks close to home',()=>{
 const group={key:'bent-route',path:[[0,0,0],[0,3,0],[-2,1,0],[.3,.4,0],[.3,0,0]]};
 const layout={groups:new Map([[group.key,group]]),entries:[{face:{points:[[0,0,0],[1,.5,.3],[-.2,1,.1]]},group}]};
 const basis={right:[1,0,0],down:[0,1,0]};
 assert.deepEqual(travelFrame(layout,basis,false),{left:-2.2,right:1.3,top:0,bottom:4});
 const manual=new Map([[group.key,[.5,-1,0]]]);
 const shifted=travelFrame(layout,basis,false,manual);
 assert(Math.abs(shifted.left+1.7)<1e-10);assert.deepEqual([shifted.right,shifted.top,shifted.bottom],[1.8,-1,3]);
});
