import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getDetail} from '../garage/detail-catalog.js';

const width=760,height=470;
const ctx={setTransform(){},clearRect(){},fillRect(){},fillText(){},createRadialGradient:()=>({addColorStop(){}}),
  save(){},restore(){},translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){}};
function scene(vehicle='g500'){
 const canvas={width,height,clientWidth:width,getBoundingClientRect:()=>({left:0,top:0,width,height}),dataset:{}};
 return Object.assign(Object.create(GarageRenderer.prototype),{canvas,ctx,build:sanitizeBuild({vehicle}),faces:[],inspection:{},
   angle:-.58,elevation:.24,zoom:1,schematic:true,partPositions:new Map(),depthRender(){}});
}
function mid(r,part,axis){
 const points=r.hitFaces.filter(f=>f.part===part).flatMap(f=>f.projected.map(p=>p[axis]));assert(points.length,part);
 return (Math.min(...points)+Math.max(...points))/2;
}
function pickArea(r,part){
 const points=r.hitFaces.filter(f=>f.part===part).flatMap(f=>f.projected);
 const x0=Math.floor(Math.min(...points.map(p=>p.x))),x1=Math.ceil(Math.max(...points.map(p=>p.x)));
 const y0=Math.floor(Math.min(...points.map(p=>p.y))),y1=Math.ceil(Math.max(...points.map(p=>p.y)));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(r.hitTest(x,y)?.part===part)return true;
 return false;
}
test('G500 vehicle-side landmarks appear and pick on the photographed sides in front, rear and driver-side views',()=>{
 globalThis.window={devicePixelRatio:1};
 try{
  const r=scene();r.setView('front');
  const driver=[0,-.65,1],passenger=[0,.65,1];
  assert(r.project(driver).x>r.project(passenger).x);
  assert(mid(r,'lighting.fog-left','x')>mid(r,'lighting.fog-right','x'));
  r.setView('rear');assert(mid(r,'lighting.rear-fog','x')<mid(r,'lighting.reverse','x'));
  assert(pickArea(r,'lighting.rear-fog'));assert(pickArea(r,'lighting.reverse'));
  for(const view of ['side','hero']){
   r.setView(view);
   assert(r.project(driver).depth>r.project(passenger).depth,'visible side is the driver side');
   assert(r.project([-1.4,0,.4]).x<r.project([1.4,0,.4]).x,'nose faces left');
  }
  r.inspection={assembly:'powertrain'};r.isolate=true;r.setView('front');
  assert(mid(r,'powertrain.brake-reservoir','x')>mid(r,'powertrain.coolant-reservoir','x'));
 }finally{delete globalThis.window;}
});
test('G500 drag inverts its projected axes, and detached bench studies retain their authored local view',()=>{
 globalThis.window={devicePixelRatio:1};
 try{
  const r=scene();r.setView('hero');r.draw=()=>{};
  const original=[.2,-.35,.64];
  for(const azimuth of [-Math.PI/2,-.62,0,Math.PI/2]){
   for(const elevation of [-.3,.21,1.1]){
    r.angle=azimuth;r.elevation=elevation;GarageRenderer.prototype.draw.call(r);
    const a=r.project(original);r.partPositions.clear();r.placementFrame=null;
    r.activeLayout={groups:new Map([['part',{draggable:true}]])};r.clipMove=(_key,from,delta)=>from.map((v,i)=>v+delta[i]);
    assert(r.movePart('part',15,-11));const delta=r.partPositions.get('part');
    const b=r.project(original.map((v,i)=>v+delta[i]));
    assert(Math.abs(b.x-a.x-15)<1e-8&&Math.abs(b.y-a.y+11)<1e-8);
    assert(Math.abs(b.depth-a.depth)<1e-10);
   }
  }
  r.placementFrame=null;r.partPositions.clear();r.angle=-Math.PI/2;r.elevation=.2;
  r.inspection={detailView:getDetail('g500','lighting.fog-left')};GarageRenderer.prototype.draw.call(r);
  assert(r.project([0,-1,0]).x<r.project([0,1,0]).x,'detached lamp uses authored fixture axes');
  r.inspection={};r.build=sanitizeBuild({vehicle:'porsche992scab'});GarageRenderer.prototype.draw.call(r);
  assert(r.project([0,-1,0]).x<r.project([0,1,0]).x,'other whole models keep their existing camera basis');
 }finally{delete globalThis.window;}
});

test('BMW left and right stay consistent between front, rear and driver-side views',()=>{
 globalThis.window={devicePixelRatio:1};
 try{
  const r=scene('bmw325ci'),left='body.mirror-left',right='body.mirror-right';
  r.setView('front');assert(mid(r,left,'x')>mid(r,right,'x'));
  r.setView('rear');assert(mid(r,left,'x')<mid(r,right,'x'));
  for(const view of ['side','hero']){
   r.setView(view);
   assert(r.project([0,-.68,1]).depth>r.project([0,.68,1]).depth);
   assert(r.project([-1,0,.6]).x<r.project([1,0,.6]).x);
  }
 }finally{delete globalThis.window;}
});
