import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {installedFocus} from '../garage/selection-camera.js';
import {seeThroughCars} from '../garage/body-visibility.js';

const ctx={save(){},restore(){},translate(){},scale(){},setTransform(){},clearRect(){},fillRect(){},fillText(){},
  beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},createRadialGradient:()=>({addColorStop(){}})};
function scene(vehicle){
  return Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle}),inspection:{},
    canvas:{width:320,height:236,clientWidth:320,dataset:{},getBoundingClientRect:()=>({width:320,height:236,left:0,top:0})},
    ctx,depthRender(){},angle:-.58,elevation:.24,zoom:1,partPositions:new Map(),reducedMotion:{matches:true}});
}

test('the road-car engines are installed in the complete car before a part or view is selected',()=>{
  for(const vehicle of seeThroughCars){
    const r=scene(vehicle);r.buildMesh();
    const points=r.faces.map(f=>f.points),porsche=vehicle.startsWith('porsche');
    for(const id of vehicle==='sl550'?['sl-m278.block','sl-m278.heads','sl-m278.sump','sl-drive.auto','sl-drive.final','seats.driver']:porsche?['engine.case','engine.crankshaft','engine.heads','engine.intake','drivetrain.halfshafts','cabin.seats','floor.pan']:
      ['powertrain.block','powertrain.crankshaft','powertrain.pistons','powertrain.valve-cover','drivetrain.gearbox','floor.pan']){
      assert(r.faces.some(f=>f.part===id),vehicle+' '+id);
    }
    r.seeThroughBody=true;r.buildMesh();
    assert(r.faces.some(f=>f.pickThrough&&f.opacity<.2));
    assert(r.faces.every((f,i)=>f.points===points[i]),'material change reuses world geometry');
    assert(r.faces.filter(f=>/^(engine|powertrain|sl-m278)\./.test(f.part)).every(f=>!f.pickThrough));
    r.seeThroughBody=false;r.buildMesh();assert(!r.faces.some(f=>f.pickThrough));
  }
  const r=scene('f350');r.buildMesh();
  for(const id of ['powertrain.lifters','drivetrain.rear-differential','drivetrain.hubs','steering.axle'])assert(r.faces.some(f=>f.part===id),'F-350 '+id);
});
test('the transparent BMW bonnet exposes a pickable installed engine at the same world position',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    const r=scene('bmw325ci');r.setView('top');
    const solid=r.hitFaces,projection=r.lastCamera;
    r.seeThroughBody=true;r.draw();
    const ghost=r.hitFaces;let behind=null;
    for(const f of ghost.filter(f=>f.part==='powertrain.valve-cover')){
      const x=f.projected.reduce((a,p)=>a+p.x,0)/f.projected.length,y=f.projected.reduce((a,p)=>a+p.y,0)/f.projected.length;
      r.hitFaces=solid;const before=r.hitTest(x,y);
      r.hitFaces=ghost;const after=r.hitTest(x,y);
      if(before?.part==='body.hood'&&after?.assembly==='powertrain'){behind={x,y};break;}
    }
    assert(behind);assert.deepEqual(r.lastCamera,projection);
    r.seeThroughBody=false;r.draw();assert.equal(r.hitTest(behind.x,behind.y).part,'body.hood');
  }finally{delete globalThis.window;}
});
test('engine selection smoothly approaches the 992 rear crankcase, retains surrounding geometry and restores the view',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    const r=scene('porsche992scab');r.draw();
    const start=r.lastCamera,outer=r.faces.length,original=[r.angle,r.elevation,r.zoom];
    const before=installedFocus(r.faces,'engine'),radiators=installedFocus(r.faces,'engine.cooling');
    assert(before.center[0]>1.1&&radiators.center[0]<0);
    r.reducedMotion.matches=false;
    assert(r.focusSelection('engine'));assert(r.focusPan);
    r.focusPan.start=performance.now()-400;r.draw();
    const target=r.project(before.center),area=r.placementArea;
    assert(Math.abs(target.x-(area.left+area.right)/2)<55);
    assert.deepEqual([r.angle,r.elevation,r.zoom],original);assert.equal(r.faces.length,outer);assert.equal(r.inspection.assembly,undefined);
    assert.equal(r.selectionFocus.id,'engine');assert(r.lastCamera.ratio>start.ratio);
    const size=r.pixelScale;r.zoom=1.2;r.angle+=.1;r.draw();assert(r.pixelScale>size);
    r.reducedMotion.matches=true;r.angle=original[0];r.zoom=original[2];r.focusSelection(null);
    assert.deepEqual(r.lastCamera,start);assert.equal(r.selectionFocus,null);
  }finally{delete globalThis.window;}
});

test('the installed C63 induction, coils and cooling system fit below its closed hood',()=>{
  const r=scene('c63');r.buildMesh();
  const hood=r.faces.filter(f=>f.part==='body.hood'),components=new Set();
  let closest=Infinity;
  for(const f of r.faces.filter(f=>f.part.startsWith('powertrain.'))){
    for(const [x,y,z] of f.points){
      let top=-Infinity;
      for(const triangle of hood){
        const ix=triangle.triangles;
        for(let i=0;i<ix.length;i+=3){
          const [a,b,c]=[triangle.points[ix[i]],triangle.points[ix[i+1]],triangle.points[ix[i+2]]];
          const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-9)continue;
          const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den;
          const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den,t=1-u-v;
          if(Math.min(u,v,t)>=0)top=Math.max(top,u*a[2]+v*b[2]+t*c[2]);
        }
      }
      if(Number.isFinite(top)){closest=Math.min(closest,top-z);components.add(f.part);}
    }
  }
  for(const id of ['powertrain.airbox','powertrain.coils','powertrain.radiator'])assert(components.has(id));
  assert(closest>.02,'at least 20 mm of mesh clearance at the nearest fitted surface');
});

test('a stationary cutaway reuses its rendered pixels for hover and animation without rebuilding the car',()=>{
  globalThis.window={devicePixelRatio:1};globalThis.document={hidden:false,createElement:()=>({getContext:()=>({drawImage(){}})})};
  globalThis.requestAnimationFrame=()=>{};
  try{
    const r=scene('g500'),{width,height}=r.canvas;
    r.cacheDraws=true;r.seeThroughBody=true;r.canvas.getContext=()=>ctx;r.ctx={...ctx,drawImage(){}};
    r.cpuWidth=width;r.cpuHeight=height;r.cpuPixels={data:new Uint8ClampedArray(4*width*height)};
    r.cpuDepth=new Float64Array(width*height);r.cpuSurface={width,height,getContext:()=>({putImageData(){}})};
    let draws=0;r.depthRender=()=>{draws++;r.softwareRender(width,height,r.project);};
    r.draw();const base=r.cpuPixels.data.slice();assert.equal(draws,1);
    r.draw();assert.equal(draws,1);
    r.hoverHit={part:'wheels.rim',instance:'front-left'};r.draw();
    assert.equal(draws,1);assert(r.cpuPixels.data.some((v,i)=>v!==base[i]));
    r.hoverHit=null;r.draw();assert.deepEqual(r.cpuPixels.data,base);assert.equal(draws,1);
    r.reducedMotion.matches=false;r.focusSelection('powertrain');assert.equal(draws,2);
    r.frame(r.focusPan.start+150);assert.equal(draws,2);assert(r.panPick.scale>1);
    r.focusPan.start-=500;r.draw();assert.equal(draws,3);assert.equal(r.focusPan,null);
  }finally{delete globalThis.window;delete globalThis.document;delete globalThis.requestAnimationFrame;}
});

test('installed brake and sliding-roof hardware has one owner and the glazed roof replaces the painted opening',()=>{
  for(const id of ['g500','bmw325ci','c63','hrv']){
    const r=scene(id);r.buildMesh();
    const shape=(part)=>r.faces.filter(f=>f.part===part).map(f=>f.points);
    const master=shape(id==='g500'?'brakes.hydraulics':'brakes.master');
    assert(master.length>60);assert(!shape('powertrain.brake-reservoir').length);
    if(id!=='g500'){
      for(const name of ['brakes.abs','brakes.lines','brakes.parking','roof.glass','roof.cassette','roof.slides','roof.drive','roof.shade'])assert(shape(name).length,id+' '+name);
      r.canvas={getBoundingClientRect:()=>({left:0,top:0})};r.project=([x,y,z])=>({x,y,depth:z});
      const center={bmw325ci:.14,c63:.06,hrv:.08}[id];
      assert.equal(r.hitTest(center,.10).part,'roof.glass');
      assert.equal(r.hitTest(center,.57).part,'body.structure');
    }
    r.isolate=true;r.inspection={assembly:'powertrain'};r.buildMesh();
    assert.deepEqual(shape('powertrain.brake-reservoir'),master);
  }
});

test('browsing the G500 powertrain, steering and suspension keeps the installed body in solid context',()=>{
  const r=scene('g500');r.schematic=true;r.buildMesh();
  const exterior=r.faces.filter(f=>['body.hood','body.door','lighting.headlamp'].includes(f.part));
  assert(exterior.length>0);
  for(const assembly of ['powertrain','steering','suspension']){
    r.inspection={assembly};r.buildMesh();
    assert.equal(r.faces.filter(f=>['body.hood','body.door','lighting.headlamp'].includes(f.part)).length,exterior.length,assembly);
  }
});

test('hover keeps a WebGL cutaway and its picks at the backing buffer resolution',()=>{
  globalThis.window={devicePixelRatio:2};
  globalThis.document={createElement:()=>({getContext:()=>({drawImage(){}})})};
  try{
    const r=scene('g500');r.cacheDraws=true;r.seeThroughBody=true;
    r.canvas.getContext=()=>ctx;r.ctx={...ctx,drawImage(){}};
    let draws=0;r.depthRender=()=>{draws++;r.canvas.dataset.renderer='webgl-depth';};
    r.softwareRender=()=>assert.fail('hover switched to a CSS-resolution image');
    r.draw();r.hoverHit={part:'wheels.rim',instance:'front-left'};r.draw();
    assert.equal(draws,2);assert.equal(r.canvas.width,640);
  }finally{delete globalThis.window;delete globalThis.document;}
});
