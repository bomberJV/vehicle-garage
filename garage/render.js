import {drawStudioContactShadow,hasStudioFinish} from './studio-finish.js';
import {drawG500SteeringLinkage} from './g500-steering-gear.js';
import {shellFragmentShader} from './shell-depth.js';
import {isWorkbenchPorsche,drawPorscheInstalledServices} from './porsche-installed-services.js';
import {drawE46WheelAndTire} from './e46-wheels.js';
import {drawG500InstalledCaliper} from './g500-rotors.js';
import {drawFrontBearingAtWheel} from './g500-wheel-bearings.js';
import {turn as turnWheelHub,steel as hubSteel,y as lateralAxis} from './mechanism-shapes.js';
import {drawG500WheelAndTire} from './g500-wheels.js';
import {drawE46Suspension,drawE46Rotor,drawE46Caliper,e46SuspensionParts} from './e46-running-gear.js';
import {g500SuspensionParts,drawG500AxleLocation,drawG500InstalledRotor,g500RotorCenter,drawG500Frame} from './g500-underbody.js';
import {installedAccessories} from './installed-accessories.js';
import {travelFrame} from './exploded-framing.js';
import {spreadTarget,routePhase} from './compact-explosion.js';
import {rememberMove,returningPath,advanceReturn} from './part-return.js';
import {freezeScene,transitionLayers,focusFrameLayer,projectedBounds,partMatch} from './focus-transition.js';
import {installedFocus,componentProjection,focusBlend} from './selection-camera.js';
import {seeThroughCars,bodyVisibility} from './body-visibility.js';
import {applySuspensionLift,wheelContactPlane} from './lift-geometry.js';
import {paintChoice} from './paint-colors.js';
import {drawAccessories,drawActiveLip,hasActiveLip} from './accessory-geometry.js';
import {motionEnvelope} from './motion-envelope.js';
import {sectionFaces} from './section-plane.js';
import {faceTriangles} from './mesh-triangles.js';
import {getCabinFloor,drawCabinFloor} from './floor-trim.js';
import {softwareDepthRender,gpuDepthRender,recolorHover} from './surface-materials.js';
import {origin, planSeparation, displaced, intersects, allowedTravel, sampleMotion} from './exploded-layout.js';
import {planTravel,offsetAt} from './explosion-travel.js';
import {bindViewerInput,refreshPointerHover} from './viewer-input.js';
import {vehicleServiceAssemblies,drawVehicleService} from './vehicle-service.js';
import {getG500Differentials,drawG500Differentials} from './g500-differentials.js';
import {getRoadDrivetrain, drawRoadDrivetrain} from './road-mechanisms.js';
import {FLEET} from './fleet.js';
import {VEHICLES,PAINTS,FINISHES,PARTS} from './catalog.js';
import {buildBmwExterior} from './exterior-bmw.js';
import {buildG500Exterior,buildFordExterior,utilityWheelSpokes} from './exterior-utility.js';
import {roadWheelSpokes} from './exterior-alloys.js';
import {wheelDesign} from './wheel-designs.js';
import {drawWheelFace} from './wheel-faces.js';
import {buildC63Exterior,buildHrvExterior} from './exterior-modern.js';
import {buildEngineBay,enginePartOffset} from './engine-geometry.js';
import {drawF350Frame,drawTwinIBeams,drawTwinIBeamLinkage,drawTwinIBeamSpringSeats,drawF350RearLeafSprings} from './f350-powertrain.js';
import {getEngineDefinition} from './engine-data.js';
const shade=(hex,f)=>{const h=hex.replace('#','');return '#'+[0,2,4].map(i=>Math.min(255,Math.max(0,Math.round(parseInt(h.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');};
function physicalInstance(face){
  if(face.instance)return face.instance;
  const id=face.part;
  if(id?.startsWith('body.') && face.rigid)return face.rigid.name;
  if(id?.startsWith('lighting.') || id==='suspension.spring' || id==='suspension.damper'){
    const point=face.points[0];
    return (point[0]<0?'front':'rear')+'-'+(point[1]<0?'left':'right');
  }
  return null;
}
function overviewPart(face,vehicle){
  if(vehicle==='g500'&&(face.part==='wheels.disc'||face.part==='wheels.caliper')){
    const front=face.instance?face.instance.startsWith('front'):face.points[0][0]<0;
    return front?'brakes.front':'brakes.rear';
  }
  return face.part;
}
function installedGroup(face,id){
  const instance=physicalInstance(face);
  const key=face.rigid?'mount:'+face.rigid.name:instance?id+':'+instance:id;
  return {key,instance,offset:origin,movable:false,draggable:Boolean(id)};
}
// Keep a fitting part inside the bench. A zoomed part larger than the bench can
// pan until the opposite edge comes into view. A previously cropped part can
// always travel inward, without snapping when a gesture begins.
function boundedShift(delta,near,far,start,end){
  const a=start-near,b=end-far;
  return Math.max(Math.min(0,a,b),Math.min(Math.max(0,a,b),delta));
}
// The G500, E46 and R231 vehicle coordinates use -X toward the grille and -Y toward the US
// driver's seat. Mirror the lateral axis in the camera basis, including depth,
// so a front-facing observer sees the driver on their right. Nested part
// studies have their own authored workbench axes, independent of the chassis.
function cameraBasis(vehicle,detail,azimuth,elevation){
  const lateral=(vehicle==='g500'||vehicle==='bmw325ci'||vehicle==='sl550')&&!detail?-1:1;
  const ca=Math.cos(azimuth),sa=Math.sin(azimuth),ce=Math.cos(elevation),se=Math.sin(elevation);
  return {
    right:[ca,-lateral*sa,0],
    down:[sa*se,lateral*ca*se,-ce],
    near:[sa*ce,lateral*ca*ce,se]
  };
}
export class GarageRenderer{
 // A drawing or numerical inspection can request the installed model without a second interactive canvas.
 static assembledFaces(build){
   const model=Object.assign(Object.create(this.prototype),{build,inspection:{},lights:false,schematic:true});
   model.buildMesh();
   return model.faces;
 }
 constructor(canvas,onHotspot){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.initDepthRenderer();this.onHotspot=onHotspot;this.angle=-.58;this.elevation=.24;this.zoom=1;this.blueprint=false;this.spin=false;this.lights=true;this.hotspots=true;this.dirty=true;this.points=[];this.faces=[];this.build=null;this.last=0;this.drag=null;this.inspection={assembly:null,part:null,expanded:false};this.schematic=true;this.isolate=false;this.currentPart=null;this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);this.partPositions=new Map();this.mechanismPhase=0;
 this.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 this.cacheDraws=true;bindViewerInput(this);requestAnimationFrame(t=>this.frame(t));}
 initDepthRenderer(){
 this.surface=document.createElement('canvas');const gl=this.surface.getContext('webgl',{alpha:true,depth:true,antialias:true,premultipliedAlpha:true});this.gl=gl;if(!gl)return;
 const shader=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);return sh;};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 position;attribute vec4 color;varying mediump vec4 tint;void main(){gl_Position=vec4(position,1.0);tint=color;}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,shellFragmentShader));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){this.gl=null;return;}this.program=program;this.buffer=gl.createBuffer();
 }
 softwareRender(w,h,project){return softwareDepthRender(this,w,h,project);}
 depthRender(w,h,dpr,project){return gpuDepthRender(this,w,h,dpr,project);}
 frame(t){
   const dt=Math.max(0,Math.min(60,t-this.last));this.last=t;
   let redraw=false;
   if(!document.hidden){
     if(this.focusPan&&!this.drag){
       if(this.focusPan.image&&t-this.focusPan.start<350){
         this.paintPan(t);requestAnimationFrame(x=>this.frame(x));return;
       }
       redraw=true;
     }
     if(this.slRoofMotion){
       const {from,to,start,duration}=this.slRoofMotion;
       const k=Math.min(1,Math.max(0,(t-start)/duration));
       this.slRoofFraction=from+(to-from)*k*k*(3-2*k);redraw=true;
       if(k===1){this.slRoofMotion=null;this.slRoofFraction=null;}
     }
     if(this.returnMotion){this.advancePartReturn(t);redraw=true;}
     if(this.motion){
       this.progress=sampleMotion(this.motion,t);redraw=true;
       if(this.reducedMotion?.matches||t>=this.motion.start+this.motion.duration){
         this.progress=this.motion.to;this.motion=null;this.onPositionsChange?.();
       }
     }
     if(this.mechanismPlaying && !this.drag){
       this.mechanismPhase=((this.mechanismPhase||0)+dt/4800)%1;this.onMechanismPhase?.(this.mechanismPhase);redraw=true;
     }
     if(this.spin&&!this.drag){this.angle+=dt*.0002;redraw=true;}
   }
   if(redraw){this.draw();refreshPointerHover(this);}
   else if(this.focusTransition && !document.hidden)this.paintFocusFrame(t);
   requestAnimationFrame(x=>this.frame(x));
 }
 setBuild(b){
   if(this.build?.vehicle==='sl550'&&b.vehicle==='sl550'&&this.build.roofPosition!==b.roofPosition&&!this.reducedMotion?.matches){
     const from=this.slRoofFraction??(this.build.roofPosition==='up'?0:1),to=b.roofPosition==='up'?0:1;
     this.slRoofFraction=from;this.slRoofMotion={from,to,start:performance.now(),duration:Math.max(150,2200*Math.abs(to-from))};
   }
   if(b.vehicle!=='sl550'){this.slRoofMotion=null;this.slRoofFraction=null;}
   if(this.build?.vehicle!==b.vehicle){this.focusTransition=null;this.focusPan=null;this.selectionFocus=null;}this.hoverHit=null;this.build=b;this.draw();}
 focusSelection(id,instance=null){
   if(!id&&!this.selectionFocus)return false;
   const target=id&&installedFocus(this.faces||[],id,instance);
   if(id&&!target)return false;
   const previous=this.lastCamera;
   this.selectionFocus=target?{id,instance,...target}:null;
   this.focusPan=previous&&!this.reducedMotion?.matches?{from:previous}:null;
   this.placementFrame=null;this.draw();return true;
 }
 paintPan(now){
   const p=this.focusPan,rect=this.canvas.getBoundingClientRect(),w=rect.width,h=rect.height;
   const camera=focusBlend(p.from,p.to,(now-p.start)/350);
   const scale=camera.ratio/p.from.ratio;
   const dx=w/2*(1-scale)+(p.from.cx-camera.cx)*camera.ratio;
   const dy=p.screenY*(1-scale)+(p.from.cy-camera.cy)*camera.ratio;
   const ctx=this.ctx;
   ctx.save();ctx.setTransform(this.canvas.width/w,0,0,this.canvas.height/h,0,0);
   ctx.fillStyle=this.blueprint?'#142629':'#171b1e';ctx.fillRect(0,0,w,h);
   ctx.drawImage(p.image,dx,dy,w*scale,h*scale);ctx.restore();
   this.panPick={dx,dy,scale};this.lastCamera=camera;
 }
 beginFocus(options){
   this.focusTransition=freezeScene(this,options);
 }
 saveFocusDestination(){
   const state=this.focusTransition;if(!state)return;
   const c=state.destination??=document.createElement('canvas');
   if(c.width!==this.canvas.width)c.width=this.canvas.width;if(c.height!==this.canvas.height)c.height=this.canvas.height;
   const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(this.canvas,0,0);
   state.bounds=projectedBounds(this.hitFaces,state.direction==='out'?partMatch(state.part,state.instance):()=>true);
   state.start??=performance.now();this.paintFocusFrame(performance.now());
 }
 paintFocusFrame(now){
   const state=this.focusTransition;
   if(!state?.destination)return;
   const c=this.canvas,ctx=this.ctx,rect=c.getBoundingClientRect(),w=rect.width,h=rect.height;
   if(!w||!h)return;
   const f=transitionLayers(state,state.bounds,w,h,now);ctx.save();
   ctx.setTransform(c.width/w,0,0,c.height/h,0,0);ctx.globalAlpha=1;
   if(f.done||this.reducedMotion?.matches){
     ctx.clearRect(0,0,w,h);ctx.drawImage(state.destination,0,0,w,h);this.focusTransition=null;
   }else{
     const bg=ctx.createRadialGradient(w*.52,h*.47,10,w*.52,h*.47,w*.6);
     bg.addColorStop(0,this.blueprint?'#1d383a':'#34383b');bg.addColorStop(1,this.blueprint?'#142629':'#171b1e');
     ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
     const layer=focusFrameLayer(f);
     const {scale,dx,dy}=layer.transform;
     ctx.globalAlpha=layer.opacity;
     if(layer.opacity>0)ctx.drawImage(state[layer.source],dx,dy,w*scale,h*scale);
     state.acceptsDestinationPick=layer.source==='destination'&&layer.opacity>0;
     state.hitTransform=f.incoming;
   }
   ctx.restore();
 }
 getMechanism(inspection=this.inspection){
   const detail=inspection?.detailView;
   if(detail)return detail.animated?{name:detail.name,description:detail.motionDescription||''}:null;
   const exhibit=FLEET[this.build?.vehicle],groupId=inspection?.assembly;
   const motion=exhibit?.motion;
   if(motion && (!groupId || groupId===motion.assembly))return motion;
   const group=groupId&&exhibit?.groups.find(group=>group.id===groupId);
   return group?.animated?{name:group.name,description:group.motionDescription||''}:null;
 }
 setMechanismPlaying(value){
   this.mechanismPlaying=Boolean(this.getMechanism() && value);
   if(this.mechanismPlaying && this.mechanismPhase>=1)this.mechanismPhase=0;
   this.draw();
 }
 setMechanismPhase(fraction){
   if(!this.getMechanism()||!Number.isFinite(fraction))return;
   this.mechanismPlaying=false;this.mechanismPhase=Math.max(0,Math.min(1,fraction));this.onMechanismPhase?.(this.mechanismPhase);this.draw();
 }
 hasBlockedTransit(){
   // draw() can legitimately defer while the workbench has zero layout width.
   // Materialize the requested scope before evaluating a newly selected assembly.
   if(this.builtInspection!==this.inspection || this.builtIsolation!==this.isolate)this.buildMesh();
   const layout=this.activeLayout;if(!layout)return false;
   planTravel(layout);return layout.blockedTransit;
 }
 canExpand(){
   if(this.inspection?.onlyPart || (!this.inspection?.assembly&&!this.inspection?.detailView))return false;
   if(this.builtInspection!==this.inspection||this.builtIsolation!==this.isolate)this.buildMesh();
   return Boolean(this.activeLayout?.canExpand);
 }
 selectedMoveKey(){
   const i=this.inspection||{}, part=i.detailView?i.detailPart:i.part;
   if(!part)return null;
   return this.faces?.find(f=>(f.part===part||f.pickPart===part) && f.motionKey && (!i.instance||physicalInstance(f)===i.instance))?.motionKey||null;
 }
 beginPartDrag(hit){
   this.focusPan=null;
   // A cutaway may have restored a previously selected component. Keep that
   // geometry and framing until the next deliberate inspection change.
   this.dragContext??={part:this.inspection?.part};
   this.selectedHit=hit;
   if(this.onDragSelect)this.onDragSelect(hit);
   else this.setInspection({...this.inspection,[this.inspection?.detailView?'detailPart':'part']:hit.part,instance:hit.instance||null});
   if(!this.activeLayout)this.draw();
   return hit.motionKey||this.selectedMoveKey();
 }
 startSpread(target,now=performance.now()){
   const from=this.motion?sampleMotion(this.motion,now):this.progress||0;
   if(this.reducedMotion?.matches || Math.abs(from-target)<.001){
     this.progress=target;this.motion=null;
   }else{
     this.progress=from;this.motion={from,to:target,start:now,duration:Math.max(180,540*Math.abs(target-from))};
   }
 }
 resetPartPositions(key=null){
   if(!this.partPositions?.size || (key!==null&&!this.partPositions.has(key)))return false;
   const path=returningPath(this.partPositions,this.moveHistory||[],key);
   this.returnMotion={...path,single:key!==null,start:performance.now(),duration:Math.min(650,300+path.length*85)};
   if(this.reducedMotion?.matches)this.advancePartReturn(this.returnMotion.start+this.returnMotion.duration);
   this.onPositionsChange?.();this.draw();return true;
 }
 advancePartReturn(now){
   const motion=this.returnMotion;
   if(!motion)return;
   const t=sampleMotion({...motion,from:0,to:1},now);
   const check=motion.single?(key,from,to)=>this.clipMove(key,from,to.map((v,i)=>v-from[i]),true):null;
   const result=advanceReturn(motion,this.partPositions,t,check);
   if(result==='running')return;
   this.returnMotion=null;
   if(result==='done')this.moveHistory=(this.moveHistory||[]).filter(m=>!motion.keys.has(m.key));
   else this.onReturnBlocked?.();
   if(this.pendingSpread!=null){
     const target=this.pendingSpread;this.pendingSpread=null;this.startSpread(target,now);
   }
   this.onPositionsChange?.();
 }
 clipMove(key,from,delta,returning=false){
   const layout=this.activeLayout,group=layout?.groups.get(key);
   if(!group)return from;
   const phase=routePhase(layout,this.progress??spreadTarget(this.inspection));
   const box=(g,manual)=>{
     const shift=offsetAt(g,phase);
     return displaced(g.bounds,shift.map((v,i)=>v+manual[i]));
   };
   const obstacles=[];
   const home=returning?box(group,origin):null;
   for(const other of layout.groups.values()){
     if(other===group)continue;
     const manual=this.partPositions?.get(other.key),solid=box(other,manual||origin);
     if(home&&!manual&&intersects(home,solid,layout.gap*.45))continue;
     obstacles.push(solid);
   }
   const applied=allowedTravel(box(group,from),delta,obstacles,layout.gap*.45);
   return from.map((v,i)=>v+applied[i]);
 }
 nudgeAnchor(key){
   const bounds=this.partFrames?.get(key),area=this.placementArea;
   if(!bounds||!area||!this.hitFaces?.[0]?.projected)return null;
   const left=Math.max(bounds.left,area.left),top=Math.max(bounds.top,area.top);
   const right=Math.min(bounds.right,area.right),bottom=Math.min(bounds.bottom,area.bottom);
   if(left>right||top>bottom)return null;
   const sample=(x,y,faces)=>{
     if(x<left||x>right||y<top||y>bottom)return null;
     const surface=this.surfaceAt(x,y,{faces});
     return surface?.face.motionKey===key?{key,anchor:{x,y},surfaceDepth:surface.depth}:null;
   };
   const last=this.lastNudge;
   if(last?.key===key){
     const valid=sample(last.anchor.x,last.anchor.y);
     if(valid)return valid;
   }
   const middle=sample((left+right)/2,(top+bottom)/2);
   if(middle)return middle;
   // A rim's center can be empty and a folded panel can expose only one
   // edge. Search across the projected material before testing its visible
   // raster samples. The exact fallback runs only for ambiguous silhouettes.
   const faces=this.hitFaces.filter(f=>f.motionKey===key&&f.opacity!==0);
   const stride=Math.max(1,Math.ceil(faces.length/12));
   for(let i=0;i<faces.length;i+=stride){
     const ps=faces[i].projected;
     const point=sample(ps.reduce((v,p)=>v+p.x,0)/ps.length,ps.reduce((v,p)=>v+p.y,0)/ps.length);
     if(point)return point;
   }
   const rect=this.canvas.getBoundingClientRect(),software=this.canvas.dataset?.renderer==='software-depth';
   const sx=(software?Math.ceil(rect.width):this.canvas.width)/rect.width;
   const sy=(software?Math.ceil(rect.height):this.canvas.height)/rect.height;
   const firstX=Math.ceil(left*sx-.5),lastX=Math.floor(right*sx-.5);
   const firstY=Math.ceil(top*sy-.5),lastY=Math.floor(bottom*sy-.5);
   const tiles=new Map();
   // Index just the neighborhood of this part. An obscured part selected from
   // the list should not require a full-scene raycast per covered pixel.
   for(const f of this.hitFaces){
     if(f.opacity<=0)continue;
     let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
     for(const p of f.projected){
       x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);
     }
     x0=Math.max(firstX,Math.ceil(x0*sx-.5));x1=Math.min(lastX,Math.floor(x1*sx-.5));
     y0=Math.max(firstY,Math.ceil(y0*sy-.5));y1=Math.min(lastY,Math.floor(y1*sy-.5));
     if(x0>x1||y0>y1)continue;
     for(let row=y0>>3;row<=y1>>3;row++)for(let col=x0>>3;col<=x1>>3;col++){
       const index=row*(1+(lastX>>3))+col;
       let tile=tiles.get(index);
       if(!tile){tile={row,col,faces:[],selected:false};tiles.set(index,tile);}
       tile.faces.push(f);if(f.motionKey===key)tile.selected=true;
     }
   }
   for(const tile of tiles.values()){
     if(!tile.selected)continue;
     const x0=tile.col*8,y0=tile.row*8;
     for(let y=Math.max(firstY,y0);y<=Math.min(lastY,y0+7);y++)for(let x=Math.max(firstX,x0);x<=Math.min(lastX,x0+7);x++){
       const point=sample((x+.5)/sx,(y+.5)/sy,tile.faces);
       if(point)return point;
     }
   }
   return null;
 }
 visibleDragFraction(key,dx,dy,drag=this.drag){
   if(!drag?.anchor||!this.partFrames?.has(key)||!this.hitFaces?.[0]?.projected)return 1;
   // Screen-plane movement preserves depth. Track the material patch under the
   // pointer so an extracted part cannot disappear behind the surrounding shell.
   if(drag.surfaceDepth===undefined)drag.surfaceDepth=this.surfaceAt(drag.anchor.x,drag.anchor.y,{only:key})?.depth??null;
   if(drag.surfaceDepth===null)return 1;
   const visible=t=>{
     const surface=this.surfaceAt(drag.anchor.x+dx*t,drag.anchor.y+dy*t,{except:key});
     return !surface||surface.depth<=drag.surfaceDepth+1e-8;
   };
   if(visible(1))return 1;
   let low=0,high=1;
   for(let i=0;i<8;i++){
     const mid=(low+high)/2;
     if(visible(mid))low=mid;else high=mid;
   }
   return low;
 }
 setInspection(value={}){
   const dragging=Boolean(this.drag?.move);
   this.hoverHit=null;
   const previous=this.inspection||{};
   const next={assembly:null,part:null,expanded:false,...value};
   const scope=JSON.stringify([this.build?.vehicle,next.assembly,next.system,next.detailView?.id]);
   const changed=scope!==this.motionScope;
   if(!dragging&&(changed||previous.part!==next.part||previous.onlyPart!==next.onlyPart||previous.engineCutaway!==next.engineCutaway))this.dragContext=null;
   const target=spreadTarget(next);
   if(changed){
     this.focusPan=null;this.selectionFocus=null;
     this.partPositions?.clear();this.placementFrame=null;this.progress=0;this.motion=null;
     this.motionScope=scope;this.selectedHit=null;this.returnMotion=null;this.moveHistory=[];this.pendingSpread=null;
     const detailChanged=previous.detailView?.id!==next.detailView?.id;
     if(detailChanged || previous.vehicle!==next.vehicle || previous.assembly!==next.assembly){
       this.mechanismPlaying=false;this.mechanismPhase=0;
       if(detailChanged)this.lastTap=null;
     }
   }
   if(changed || spreadTarget(previous)!==target){
     if(!changed&&this.partPositions?.size){
       this.pendingSpread=target;if(!this.returnMotion||this.returnMotion.single)this.resetPartPositions();
     }else this.startSpread(target);
   }
   const part=next.detailView?next.detailPart:next.part;
   if(part){this.selectedHit={assembly:part.split('.')[0],part,instance:next.instance||null};}
   else this.selectedHit=null;
   this.inspection=next;this.draw();
 }
 moveSelected(dx,dy){
   const key=this.selectedMoveKey();
   if(!key)return false;
   this.lastNudge=this.nudgeAnchor(key);
   return this.movePart(key,dx,dy,this.lastNudge);
 }
 movePart(key,dx,dy,placement=this.drag){
   const group=this.activeLayout?.groups.get(key);
   if(!group?.draggable || !this.pixelScale || !this.project || this.motion || this.returnMotion)return false;
   const screenBounds=this.partFrames?.get(key);
   if(screenBounds && this.placementArea){
     const area=this.placementArea,b=screenBounds;
     dx=boundedShift(dx,b.left,b.right,area.left,area.right);
     dy=boundedShift(dy,b.top,b.bottom,area.top,area.bottom);
     const anchor=placement?.anchor;
     if(anchor){
       dx=boundedShift(dx,anchor.x,anchor.x,area.left,area.right);
       dy=boundedShift(dy,anchor.y,anchor.y,area.top,area.bottom);
     }
   }
   const {right,down}=cameraBasis(this.build?.vehicle,this.inspection?.detailView,this.angle,this.elevation);
   const delta=right.map((axis,i)=>(axis*dx+down[i]*dy)/this.pixelScale);
   const positions=this.partPositions??=new Map();
   const manual=positions.get(key)||origin;
   let to=this.clipMove(key,manual,delta);
   const shift=to.map((v,i)=>v-manual[i]);
   const screenX=shift.reduce((sum,v,i)=>sum+v*right[i],0)*this.pixelScale;
   const screenY=shift.reduce((sum,v,i)=>sum+v*down[i],0)*this.pixelScale;
   const visible=this.visibleDragFraction(key,screenX,screenY,placement);
   if(visible<1)to=manual.map((v,i)=>v+shift[i]*visible);
   if(to.every((v,i)=>Math.abs(v-manual[i])<1e-8))return false;
   // Keep an isolated piece from being automatically re-centred by camera fit
   // while the user is positioning it. Orbit, zoom or resizing gets a fresh fit.
   if(!this.placementFrame&&this.lastCamera&&this.canvas){
     const rect=this.canvas.getBoundingClientRect();
     this.placementFrame={fit:this.lastCamera,angle:this.angle,elevation:this.elevation,zoom:this.zoom,width:rect.width,height:rect.height};
   }
   rememberMove(this.moveHistory??=[],key,manual,to);
   if(this.mechanismPlaying){this.mechanismPlaying=false;this.onMechanismPause?.();}
   const wasMoved=positions.has(key);
   if(to.every(v=>Math.abs(v)<1e-8))positions.delete(key);
   else positions.set(key,to);
   if(placement?.anchor){
     placement.anchor.x+=screenX*visible;
     placement.anchor.y+=screenY*visible;
   }
   this.draw();
   if(wasMoved!==positions.has(key))this.onPositionsChange?.();
   return true;
 }
 hitTest(clientX,clientY){
   if(this.focusTransition?.acceptsDestinationPick===false)return null;
   const rect=this.canvas.getBoundingClientRect(),tr=this.focusTransition?.hitTransform||this.panPick;
   const localX=(clientX-rect.left-(tr?.dx||0))/(tr?.scale||1),localY=(clientY-rect.top-(tr?.dy||0))/(tr?.scale||1);
   if((rect.width>0&&(localX<0||localX>=rect.width))||(rect.height>0&&(localY<0||localY>=rect.height)))return null;
   // The software scene is rendered at CSS resolution; WebGL rasterizes at
   // backing-buffer resolution on Retina displays. A pointer addresses the
   // center of the visible sample in the corresponding source pixel.
   const software=this.canvas.dataset?.renderer==='software-depth';
   const sx=rect.width>0?(software?Math.ceil(rect.width):this.canvas.width)/rect.width:0;
   const sy=rect.height>0?(software?Math.ceil(rect.height):this.canvas.height)/rect.height:0;
   // Incomplete canvas metadata is also supported for model-coordinate queries.
   const x=sx>0?(Math.floor(localX*sx)+.5)/sx:localX;
   const y=sy>0?(Math.floor(localY*sy)+.5)/sy:localY;
   const visible=this.surfaceAt(x,y)?.face;
   if(!visible?.part)return null;
   const whole=this.build&&!this.inspection?.assembly&&!this.inspection?.detailView;
   const part=whole?overviewPart(visible,this.build.vehicle):visible.part;
   const hit={assembly:part.split('.')[0],part};
   const instance=physicalInstance(visible);
   if(instance)hit.instance=instance;
   if(visible.motionKey)hit.motionKey=visible.motionKey;
   else if(whole)hit.motionKey=installedGroup(visible,part).key;
   return hit;
 }
 surfaceAt(x,y,{except,only,faces}={}){
   const software=this.canvas.dataset?.renderer==='software-depth';
   let best=-Infinity,visible=null;
   for(const face of faces||this.hitFaces||this.faces){
     if(face.pickThrough||face.opacity<=0||(except&&face.motionKey===except)||(only&&face.motionKey!==only))continue;
     const ps=face.projected || face.points.map(this.project),triangles=face.triangles || faceTriangles(face.points);
     for(let i=0;i<triangles.length;i+=3){
       const a=ps[triangles[i]],b=ps[triangles[i+1]],c=ps[triangles[i+2]];
       const det=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
       if(Math.abs(det)<(software ? .001 : 1e-8))continue;
       const u=((b.y-c.y)*(x-c.x)+(c.x-b.x)*(y-c.y))/det;
       const v=((c.y-a.y)*(x-c.x)+(a.x-c.x)*(y-c.y))/det,t=1-u-v;
       if(u< -1e-10||v< -1e-10||t< -1e-10)continue;
       if(face.opacity<1&&(u<1e-10||v<1e-10||t<1e-10)){
         const ownsEdge=(p,q)=>det>0?(p.y<q.y||p.y===q.y&&p.x>q.x):(p.y>q.y||p.y===q.y&&p.x<q.x);
         if((u<1e-10&&!ownsEdge(b,c))||(v<1e-10&&!ownsEdge(c,a))||(t<1e-10&&!ownsEdge(a,b)))continue;
       }
       const z=u*a.depth+v*b.depth+t*c.depth;
       // Opaque geometry is drawn first, and a glass fragment at the same
       // depth fails the depth test regardless of the authored face order.
       if(z>best || (z===best && visible?.opacity<1 && (face.opacity??1)===1)){best=z;visible=face;}
     }
   }
   return visible?{face:visible,depth:best}:null;
 }
 tag(part,fn){const prior=this.currentPart;this.currentPart=part;fn();this.currentPart=prior;}
 instance(name,fn){
   const previous=this.currentInstance;this.currentInstance=name;
   try{fn();}finally{this.currentInstance=previous;}
 }
 // Keep the motion of a physical assembly independent of which material or detail was picked.
 rigid(name,offset,draw){
  const previous=this.currentRigid;
  this.currentRigid={name,offset};
  try{draw();}finally{this.currentRigid=previous;}
 }

 setView(view,detail=this.inspection?.detailView){
 this.focusTransition=null;this.focusPan=null;this.selectionFocus=null;
 const exhibit=FLEET[this.build?.vehicle];
 const vehicleHero=hasStudioFinish(this.build?.vehicle)?[-.86,.155]:exhibit?.type==='Planes'?[-.67,.49]:exhibit?.domain==='Sea'?[-.65,.36]:[-.58,.24];
 const studyAngle=detail?.viewAngle;
 const hero=Array.isArray(studyAngle) && studyAngle.length===2 && studyAngle.every(Number.isFinite)
   ?studyAngle:Number.isFinite(studyAngle)?[studyAngle,detail.viewElevation??.24]:detail?[-.58,.24]:vehicleHero;
 const views={hero,side:[0,.12],front:[-Math.PI/2,.18],rear:[Math.PI/2,.25],top:[-.02,1.28]};[this.angle,this.elevation]=views[view]||views.hero;this.zoom=1;this.draw();}
 polygon(points,color,stroke=true){this.faces.push({points,color,stroke,instance:this.currentInstance,rigid:this.currentRigid,part:this.currentPart||(color==='#344d50'?'body.glass':['#ebe7ca','#7a8980','#ece9d7','#788581','#e6e8dc','#59696b','#ffffff','#879394','#f2f3e9','#778388'].includes(color)?'lighting.headlamp':['#ab483b','#a73930'].includes(color)?'lighting.indicator':'body.door')});}
 box(x0,y0,z0,x1,y1,z1,color){const p=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];[[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5],[4,5,6,7],[0,3,2,1]].forEach((f,i)=>this.polygon(f.map(n=>p[n]),shade(color,[.84,1,.76,.7,1.19,.5][i])));}
 profile(points,y0,y1,color){this.polygon(points.map(([x,z])=>[x,y0,z]),shade(color,.82));this.polygon(points.map(([x,z])=>[x,y1,z]),color);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];this.polygon([[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],shade(color,a[1]>1.1&&b[1]>1.1?1.15:.7));}}
 // Annular surfaces have real holes; concentric filled discs never share a plane.
 ringY(x,y,z,outer,inner,color,N=48){for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2,p=(t,r)=>[x+Math.cos(t)*r,y,z+Math.sin(t)*r];this.polygon([p(a,inner),p(a,outer),p(b,outer),p(b,inner)],color,false);}}
 tubeY(x,y0,y1,z,r,color,N=48){for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2,p=(t,y)=>[x+Math.cos(t)*r,y,z+Math.sin(t)*r];this.polygon([p(a,y0),p(a,y1),p(b,y1),p(b,y0)],shade(color,.78+.20*Math.sin(a)),false);}}
 discX(x,y,z,r,color,N=48){this.polygon(Array.from({length:N},(_,i)=>[x,y+Math.cos(i/N*Math.PI*2)*r,z+Math.sin(i/N*Math.PI*2)*r]),color,false);}
 rod(a,b,r,color,N=12){const v=b.map((q,i)=>q-a[i]),len=Math.hypot(...v);if(!len)return;const n=v.map(q=>q/len),ref=Math.abs(n[2])<.85?[0,0,1]:[0,1,0],u=[n[1]*ref[2]-n[2]*ref[1],n[2]*ref[0]-n[0]*ref[2],n[0]*ref[1]-n[1]*ref[0]],ul=Math.hypot(...u);for(let j=0;j<3;j++)u[j]/=ul;const w=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]],p=(o,t)=>o.map((q,j)=>q+r*(Math.cos(t)*u[j]+Math.sin(t)*w[j]));for(let i=0;i<N;i++)this.polygon([p(a,i/N*Math.PI*2),p(b,i/N*Math.PI*2),p(b,(i+1)/N*Math.PI*2),p(a,(i+1)/N*Math.PI*2)],shade(color,.8+.2*Math.sin(i/N*Math.PI*2)),false);}
 wheel(x,y,r,finish,side=1){
 const vehicle=this.build?.vehicle,design=wheelDesign(vehicle,this.build?.wheelDesign);
 const N=48,z=r+.04;
 const stockRadius=VEHICLES[vehicle]?.rimRadius||({f350:.2032,c63:.2286,hrv:.2159}[vehicle]??r*.64);
 if(vehicle==='g500'){
   drawG500WheelAndTire(this,{x,y,z,side,finish,design});
   if(x<0)for(const kind of ['inner','outer'])this.tag('wheels.'+kind+'-bearing',()=>drawFrontBearingAtWheel(this,kind,x,y,z,side));
 }else if(vehicle==='bmw325ci'){
   drawE46WheelAndTire(this,{x,y,z,side,finish,design});
 }else{
   const depth=.25,outer=y+side*depth/2,inner=y-side*depth/2;
   const alternative=design&&design.id!=='stock';
   const rim=alternative?(x>0?design.rearDiameter:design.frontDiameter)*.0127:stockRadius;
   this.tag('wheels.tire',()=>{
     this.tubeY(x,inner,outer,z,r,'#252b2d',N);
     for(const yy of [y-depth/2,y+depth/2])this.ringY(x,yy,z,r,rim,'#1e2426',N);
     // Two shoulder ribs make the tire volume readable without coplanar overlays.
     for(const yy of [y-depth*.43,y+depth*.43])this.tubeY(x,yy-.006,yy+.006,z,r+.003,'#343b3d',N);
   });
   this.tag('wheels.rim',()=>{
     const lip=outer+side*.006,spoke=outer-side*.027,back=inner+side*.014;
     this.ringY(x,lip,z,rim,rim-.019,finish,N);this.tubeY(x,back,lip,z,rim-.019,shade(finish,.72),N);this.ringY(x,back,z,rim-.006,rim-.021,shade(finish,.7),N);
     if(alternative){drawWheelFace(this,design,{x,y:spoke,z,side,rim,finish});return;}
     const makeSpokes=vehicle==='f350'?utilityWheelSpokes:roadWheelSpokes;
     makeSpokes(this,{vehicle,x,y:spoke,z,side,rim,finish});
   });
 }
 if(vehicle==='bmw325ci'){
   this.tag('wheels.disc',()=>drawE46Rotor(this,x>0,side));
   this.tag('wheels.caliper',()=>drawE46Caliper(this,x>0,side));
   this.tag('wheels.hub',()=>{this.tubeY(x,y-side*.065,y+side*.041,z,.039,'#717b7d',24);this.ringY(x,y+side*.042,z,.039,0,'#a2acaf',24);});
   return;
 }
 const disc=vehicle==='g500'?(x<0?.1575:.136):stockRadius*.81;
 this.tag('wheels.disc',()=>{const plane=y-side*.025;if(vehicle==='g500'){drawG500InstalledRotor(this,x>0,side);return;}this.ringY(x,plane,z,disc,.045,'#717b80',N);this.ringY(x,plane-side*.018,z,disc,.045,'#525b60',N);this.tubeY(x,plane-side*.018,plane,z,disc,'#899395',N);});
 this.tag('wheels.hub',()=>{
  if(vehicle==='g500'&&x<0){
   const profile=[[-.070,.021],[-.070,.025],[-.045,.025],[-.041,.0275],[.020,.0275],[.024,.039],[.040,.039],[.040,.0424],[.050,.0424],[.050,.021],[-.070,.021]];
   turnWheelHub(this,[x,y,z],lateralAxis,profile.map(([station,rad])=>[side*station,rad]),hubSteel,{n:36});return;
  }
  this.tubeY(x,y-side*.065,y+side*.047,z,.048,'#777f82',24);this.ringY(x,y+side*.05,z,.048,0,'#a5adb0',24);});
 this.tag('wheels.caliper',()=>{if(vehicle==='g500'){drawG500InstalledCaliper(this,g500RotorCenter(x>0,side),x>0,side);return;}this.box(x+disc*.65,y-side*.07,z-disc*.35,x+disc*1.04,y+side*.023,z+disc*.35,'#545d62');});
 }
 mechanicalMesh(){
 if(this.build.vehicle==='bmw325ci'){drawE46Suspension(this);return;}
 const v=VEHICLES[this.build.vehicle],g=this.build.vehicle==='g500',truck=v.body==='truck',w=v.width/2,wb=v.wheelbase,front=-wb/2,rear=wb/2,tag=(id,fn)=>this.tag(id,fn),box=(...a)=>this.box(...a),rod=(...a)=>this.rod(...a),metal='#69757c',dark='#353e43';
 if(this.build.vehicle==='f350'){drawF350Chassis(this,tag);return;}
 tag('suspension.frame',()=>{if(g){drawG500Frame(this);return;}if(truck){for(const y of [-.48,.48])box(-wb/2-.43,y-.055,.35,wb/2+.40,y+.055,.49,dark);for(const x of [-wb/2,-.25,.63,wb/2])box(x-.045,-.52,.35,x+.045,.52,.46,dark);}else{box(front-.30,-.55,.27,front+.32,.55,.35,dark);box(rear-.25,-.50,.27,rear+.25,.50,.34,dark);}});
 if(g)drawG500AxleLocation(this);
 else tag('steering.axle',()=>{for(const x of [front,rear])for(const side of [-1,1]){box(x-.075,side*(w-.14)-.04,.30,x+.075,side*(w-.14)+.04,.53,metal);rod([x-.20,side*.35,.31],[x,side*(w-.14),.39],.026,metal);}});
 tag('steering.linkage',()=>{if(g){drawG500SteeringLinkage(this);}else{rod([front-.09,-.66,.38],[front-.09,.66,.38],.023,metal);}});
 tag('suspension.spring',()=>{for(const x of [front,rear])for(const side of [-1,1]){const y=side*(g?.48:.57);if(truck){for(let layer=0;layer<4;layer++)this.profile([[x-.52+layer*.065,.39+layer*.013],[x,.34+layer*.013],[x+.52-layer*.065,.39+layer*.013],[x+.52-layer*.065,.402+layer*.013],[x,.352+layer*.013],[x-.52+layer*.065,.402+layer*.013]],y-.035,y+.035,'#76818a');continue;}const base=g?.47:.44,height=g?.39:.48;let prior=null;for(let i=0;i<=84;i++){const t=i/84,a=t*Math.PI*12,p=[x+Math.cos(a)*.073,y+Math.sin(a)*.073,base+t*height];if(prior)rod(prior,p,.011,'#b0b5a4',6);prior=p;}}});
 tag('suspension.damper',()=>{for(const x of [front,rear])for(const side of [-1,1]){rod([x-.14,side*.59,.43],[x+.06,side*.62,.90],.026,'#98a4ac');rod([x-.14,side*.59,.43],[x-.03,side*.605,.68],.039,'#414c53');}});

 }
 applyInspection(){this.prepareInspection(null);}
 prepareInspection(exhibit){
   const i=this.inspection||{}, assembly=i.assembly, detail=i.detailView;
   const selected=detail?i.detailPart:i.part, focus=this.hoverHit?.part||selected;
   const whole=!assembly&&!detail;
   const pickId=f=>whole?overviewPart(f,this.build.vehicle):f.part;
   const source=this.faces, progress=this.progress??spreadTarget(i);
   const inMotion=Boolean(i.expanded || progress>0 || this.motion);
   const reserveTravel=Boolean(detail&&!i.onlyPart&&!detail.singlePiece);
   if(whole&&!focus&&!inMotion&&!this.partPositions?.size&&!this.drag?.move){this.activeLayout=null;return;}
   const model=detail||exhibit;
   const addedGroup=assembly==='accessories'?installedAccessories(this.build.vehicle,this.build.parts):assembly==='drivetrain'?getRoadDrivetrain(this.build.vehicle):
     assembly==='differentials'?getG500Differentials(this.build.vehicle):
     assembly==='floor'?getCabinFloor(this.build.vehicle):vehicleServiceAssemblies(this.build.vehicle).find(g=>g.id===assembly);
   const engine=!detail && assembly==='powertrain'?getEngineDefinition(this.build.vehicle):null;
   const components=model?.componentIndex || new Map((addedGroup?.parts||model?.groups?.flatMap(g=>g.parts)||[]).map(p=>[p.id,p]));
   const members=new Set(engine?.components.filter(p=>!i.system||p.parentId===i.system).map(p=>p.id)||[]);
   const links=new Set(engine?.components.find(p=>p.id===focus)?.connectsTo||[]);
   const isMember=f=>Boolean(detail || (assembly && f.part.startsWith(assembly+'.')));
   const direct=Boolean(i.onlyPart && selected);
   const cutaway=i.engineCutaway&&!detail&&this.isolate&&!inMotion&&!direct&&exhibit?.inspectionSections?.[assembly];
   const cutPart=this.dragContext?this.dragContext.part:selected;
   const key=JSON.stringify([this.meshCache?.key,assembly,i.system,this.schematic,this.isolate,inMotion||reserveTravel,direct,Boolean(cutaway),cutaway?cutPart:null,
     direct?selected:null,direct?i.instance:null,detail?.id]);
   let layout=this.layoutCache?.key===key && this.layoutCache?.source===source ? this.layoutCache.layout:null;
   if(!layout){
     const allCandidates=source.filter(f=>{
       if(cutaway&&!cutaway(f,cutPart))return false;
       if(!detail && this.isolate && assembly){
         if(!isMember(f))return false;
         if(assembly==='powertrain' && i.system && !members.has(f.part))return false;
       }
       return true;
     });
     const representative=direct && !i.instance?allCandidates.find(f=>pickId(f)===selected):null;
     const requestedInstance=i.instance||(representative?physicalInstance(representative):null);
     const visible=allCandidates.filter(f=>!direct || (pickId(f)===selected &&
       (!requestedInstance || physicalInstance(f)===requestedInstance)));
     let envelope=null;
     if((inMotion||reserveTravel) && detail?.animated)envelope=motionEnvelope(detail,this);
     const mechanism=exhibit?.motion;
     if(inMotion && !detail && mechanism?.assembly===assembly && mechanism?.drawMoving){
       const build=this.build,withLip=hasActiveLip(build);
       if(this.topStudy?.exhibit!==exhibit || this.topStudy.withLip!==withLip){
         const paint=PAINTS[0].hex,finish=FINISHES[0].hex;
         this.topStudy={exhibit,withLip,draw:(sampler,phase)=>{
           mechanism.drawMoving(sampler,paint,finish,phase);
           drawActiveLip(sampler,build,paint,phase);
         }};
       }
       envelope=motionEnvelope(this.topStudy,this);
     }
     layout=planSeparation(visible,face=>{
       const id=face.part, side=face.points[0][1]<0?-1:1;
       if(whole)return installedGroup(face,pickId(face));
       const center=face.points[0];
       let offset=origin, instance=face.instance, movable=false, key=id;
       if(detail || exhibit || addedGroup){
         if(isMember(face)){
           const authored=components.get(id)?.offset||addedGroup?.parts.find(p=>p.id===id)?.offset;
           offset=authored||origin;movable=Boolean(authored?.some(Boolean));
         }
       }else if(assembly==='body' && face.rigid){
         instance=face.rigid.name;offset=face.rigid.offset;
         movable=offset.some(Boolean);key='mount';
       }else if(assembly==='body' && id==='body.hood'){movable=true;offset=[0,0,.9];}
       else if(assembly==='body' && id==='body.glass'){movable=true;offset=[0,0,.4];}
       else if(assembly==='powertrain' && isMember(face)){
         offset=enginePartOffset(id,this.build.vehicle);movable=offset.some(Boolean);
       }else if((assembly==='wheels'||assembly==='steering'||assembly==='suspension') && id.startsWith('wheels.')){
         const d={'wheels.tire':1.08,'wheels.rim':.71,'wheels.disc':.36,'wheels.hub':.13,'wheels.caliper':this.build.vehicle==='g500'?.46:.20,'wheels.inner-bearing':.10,'wheels.outer-bearing':.26};
         offset=[0,side*(assembly==='wheels'?(d[id]||.2):.55),0];movable=true;
         if(assembly!=='wheels')key='wheel';
       }else if(assembly==='lighting'&&isMember(face)){
         instance=physicalInstance(face);
         const sideFacing=id.includes('-marker-')||id.startsWith('lighting.repeater-');
         offset=sideFacing?[0,side*.62,.025]:id==='lighting.indicator'?[0,side*.15,.42]:[center[0]<0?-.70:.70,0,0];movable=true;
       }else if(assembly==='suspension' && ['suspension.spring','suspension.damper'].includes(id)){
         instance=physicalInstance(face);
         offset=id.endsWith('spring')?[0,side*.32,.6]:[0,side*.66,.24];movable=true;
       }else if(assembly==='suspension'&&this.build.vehicle==='bmw325ci'&&e46SuspensionParts.some(p=>p.id===id)){
         instance=face.instance;
         offset=[id.endsWith('trailing-arms')?.35:0,side*.49,id.endsWith('upper-arms')?.28:-.25];movable=true;
       }else if(assembly==='suspension'&&this.build.vehicle==='g500'&&g500SuspensionParts.some(p=>p.id===id)){
         instance=face.instance;
         offset=id==='suspension.rear-axle'?[.32,0,-.40]:id.endsWith('track-bar')?[0,-.43,-.19]:[0,side*.45,-.22];movable=true;
       }else if(assembly==='steering' && id==='steering.linkage'){offset=[-.48,0,.18];movable=true;}
       if(!detail&&!isMember(face)&&!movable)return installedGroup(face,id);
       if(detail?.singlePiece && isMember(face))return {key:detail.id,offset:origin,movable:false,draggable:true,instance:null};
       if(instance)key+=':'+instance;
       return {key,offset,movable,draggable:movable||isMember(face),instance};
     },envelope);
     const membersInView=new Set(layout.entries.filter(e=>isMember(e.face)).map(e=>e.group));
     layout.canExpand=membersInView.size>1 && [...layout.groups.values()].some(g=>g.movable);
     this.layoutCache={key,source,layout};
   }
   this.activeLayout=layout;
   if(inMotion||reserveTravel)planTravel(layout);
   const phase=inMotion?routePhase(layout,progress):0;
   for(const g of layout.groups.values()){
     // Clip the authored assembly pose first. A user carrying a sectioned
     // part moves its visible fragments, without recutting nearby components.
     const manual=(!this.sectionPlane&&this.partPositions?.get(g.key))||origin;
     const separation=g.draggable && phase>0?offsetAt(g,phase):origin;
     g.frameOffset=manual===origin?separation:separation.map((v,n)=>v+manual[n]);
   }
   const highlightedInstance=this.hoverHit?.instance || (!this.hoverHit && i.instance);
   this.faces=layout.entries.map(({face,group})=>{
     const delta=group.frameOffset;
     const points=delta===origin?face.points:face.points.map(p=>[p[0]+delta[0],p[1]+delta[1],p[2]+delta[2]]);
     const instance=physicalInstance(face)||group.instance;
     const pickPart=pickId(face);
     const hi=focus ? pickPart===focus && (!highlightedInstance || instance===highlightedInstance)
       : i.previewGroup && isMember(face);
     const color=hi?shade('#b8cc68',.65+.4*parseInt(face.color.slice(1,3),16)/255):
       links.has(face.part)?shade('#75a7b2',.65+.38*parseInt(face.color.slice(1,3),16)/255):face.color;
     return {...face,points,color,highlighted:hi||links.has(face.part),instance,pickPart,motionKey:group.draggable ? group.key:null};
   });
 }
 buildMesh(){
 const b=this.build, exhibit=FLEET[b.vehicle], focusView=this.inspection?.detailView;
 const assembly=this.inspection?.assembly;
 const services=vehicleServiceAssemblies(b.vehicle);
 const activeService=services.find(g=>g.id===assembly);
 const showDrive=assembly==='drivetrain'&&Boolean(getRoadDrivetrain(b.vehicle)),showFloor=assembly==='floor'&&Boolean(getCabinFloor(b.vehicle));
 const topMotion=!focusView&&exhibit&&this.getMechanism();
 const progress=this.progress??spreadTarget(this.inspection);
 const liftedHood=this.inspection?.assembly==='body' && (this.inspection.expanded||progress>.001) && !this.isolate && !this.inspection.onlyPart;
 const engineView=assembly==='powertrain'||liftedHood||Boolean(this.sectionPlane);
 const engineOwnsM54Rail=b.vehicle==='bmw325ci'&&engineView&&activeService?.id!=='fuel';
 const ownGearbox=assembly==='powertrain';
 const porsche=isWorkbenchPorsche(b.vehicle),porscheLegacy=porsche&&['drive','running','cabin'].includes(assembly)?assembly:null;
 const phase=(focusView || topMotion)?this.mechanismPhase||0:0;
 const movingAssembly=topMotion&&phase?(topMotion.assembly||assembly):null;
 const bikeLegacyGroup=b.vehicle==='bmws1000rr'&&['engine','drive'].includes(assembly)?assembly:null;
 const isolatedPorscheEngine=Boolean(exhibit?.inspectionSections?.engine && assembly==='engine' && this.isolate && !focusView);
 const bodyModules=assembly==='body'&&['bmw325ci','c63','hrv'].includes(b.vehicle);
 const sourceKey=JSON.stringify([isolatedPorscheEngine,bikeLegacyGroup,bodyModules,b.vehicle,b.paint,b.finish,b.wheelDesign,b.roofPosition,b.slGlass,b.slWindstop,b.slComfort,this.inspection?.studySeat,this.slRoofFraction,b.bmwVentPosition,Boolean(this.inspection?.engineCutaway),b.parts,this.lights,!exhibit,engineOwnsM54Rail,ownGearbox,porscheLegacy,showDrive,showFloor,activeService?.id,focusView?.id,movingAssembly,phase]);
 const lift=!focusView&&b.lift?.mm?b.lift:null;
 const key=lift?sourceKey+JSON.stringify(lift):sourceKey;
 if(this.assembledMesh?.key===key)this.meshCache=this.assembledMesh;
 // The height slider reposes an immutable, already-triangulated vehicle.
 if(this.meshCache?.key!==key && this.suspensionBase?.key===sourceKey){
   const base=this.suspensionBase;
   this.meshCache={key,groundZ:base.groundZ,faces:lift?applySuspensionLift(base.faces,b):base.faces};
 }
 if(this.meshCache?.key!==key){
   this.faces=[];
   const paint=paintChoice(b.paint).hex;
   const finish=FINISHES.find(p=>p.id===b.finish)?.hex || FINISHES[0].hex;
   if(focusView)focusView.draw(this,this.mechanismPhase||0,paint);
   else if(exhibit){
     if(b.vehicle==='sl550'&&this.slRoofFraction!=null){
       const key=JSON.stringify([b.vehicle,b.paint,b.finish,b.slGlass,b.slWindstop,b.slComfort]);
       if(this.slStationary?.key!==key){
         exhibit.draw(this,paint,finish);
         this.slStationary={key,faces:this.faces.filter(f=>!exhibit.movingRoofParts.has(f.part))};
       }
       this.faces=[];exhibit.drawMovingRoof(this,paint);
       this.faces=this.slStationary.faces.concat(this.faces);
     }else if(movingAssembly && topMotion?.drawMoving && topMotion.parts?.length){
       const staticKey=JSON.stringify([b.vehicle,b.paint,b.finish,b.wheelDesign,b.roofPosition,b.bmwVentPosition,Boolean(this.inspection?.engineCutaway),b.parts,this.lights,topMotion.assembly]);
       if(this.stationaryMesh?.key!==staticKey){
         exhibit.draw(this,paint,finish,0,topMotion.assembly);
         const moving=new Set(topMotion.parts);
         this.stationaryMesh={key:staticKey,faces:this.faces.filter(face=>!moving.has(face.part))};
       }
       this.faces=[];
       topMotion.drawMoving(this,paint,finish,this.mechanismPhase||0);
       this.faces=this.stationaryMesh.faces.concat(this.faces);
     }else exhibit.draw(this,paint,finish,phase,movingAssembly);
   }
   else {
     const v=VEHICLES[b.vehicle], selected=b.parts.map(id=>PARTS.find(p=>p.id===id)).filter(Boolean);
     const exterior={g500:buildG500Exterior,f350:buildFordExterior,c63:buildC63Exterior,hrv:buildHrvExterior,bmw325ci:buildBmwExterior}[b.vehicle];
     exterior(this,paint,selected);
     this.mechanicalMesh();
     if(b.vehicle==='g500'&&!showDrive)drawG500Differentials(this);
     buildEngineBay(this,getEngineDefinition(b.vehicle),{fuelSystemOwnsRail:b.vehicle==='bmw325ci'&&!engineOwnsM54Rail,
       g500ServiceOwnsFlow:b.vehicle==='g500'&&!ownGearbox});
     if(!ownGearbox&&getRoadDrivetrain(b.vehicle))this.faces=this.faces.filter(f=>f.part!=='powertrain.transmission');
     const radius=v.wheelRadius||(['sedan','coupe'].includes(v.body)?.33:v.body==='crossover'?.36:.405);
     for(const x of [-v.wheelbase/2,v.wheelbase/2])for(const side of [-1,1]){
       const track=x<0?v.trackFront:v.trackRear;
       this.instance((x<0?'front':'rear')+'-'+(side<0?'left':'right'),()=>this.wheel(x,side*(track?track/2:v.width/2-.08),radius,finish,side));
     }
   }
   if(porsche&&!focusView&&!isolatedPorscheEngine)drawPorscheInstalledServices(this,b.vehicle,assembly);
   if(!focusView&&services.length){
     const passenger=!exhibit&&seeThroughCars.has(b.vehicle);
     if(passenger&&!ownGearbox)this.faces=this.faces.filter(f=>f.part!=='powertrain.brake-reservoir');
     if(!porsche&&activeService?.id==='brakes'){
       const originalBrakeParts=new Set(['wheels.disc','wheels.caliper','running.brakes','running.discs','powertrain.brake-reservoir']);
       this.faces=this.faces.filter(f=>!originalBrakeParts.has(f.part));
     }
     for(const g of services){
       if(porsche&&(g.id==='brakes'||g.id==='roof'))continue;
       // The imported road shells already carry their brake geometry and roof surfaces.
       if(g.id==='brakes'&&activeService!==g){
         if(passenger||b.vehicle==='bmws1000rr')for(const part of g.parts){
           const master=part.id==='brakes.hydraulics'||part.id==='brakes.master';
           if((master&&!ownGearbox)||['brakes.abs','brakes.lines','brakes.parking'].includes(part.id)){
             this.tag(part.id,()=>part.draw(this));
           }
         }
         continue;
       }
       if(g.id==='roof'&&passenger&&b.vehicle!=='g500'){
         const draw=()=>{for(const part of g.parts)if(part.id!=='roof.glass')this.tag(part.id,()=>part.draw(this));};
         if(assembly==='body')this.rigid('sliding-roof',[0,0,.55],draw);else draw();
         continue;
       }
       if(g.id==='roof'&&b.vehicle!=='g500'&&activeService!==g){
         continue;
       }
       drawVehicleService(this,b.vehicle,g.id,paint,engineOwnsM54Rail);
     }
   }
   if(!focusView)drawAccessories(this,b,paint,phase);
   if(!focusView&&!porsche&&(showDrive||!exhibit)){
     drawRoadDrivetrain(this,b.vehicle,{skipGearbox:ownGearbox,installedG500:b.vehicle==='g500'&&!showDrive});
   }
   if(!focusView&&!porsche&&(showFloor||!exhibit)){
     const draw=()=>drawCabinFloor(this,b.vehicle);
     if(assembly==='body'&&b.vehicle==='bmw325ci')this.rigid('floor-assembly',[0,0,-.48],draw);
     else draw();
   }
   for(const face of this.faces)face.triangles??=faceTriangles(face.points);
   const groundZ=focusView?0:wheelContactPlane(b.vehicle,this.faces);
   this.suspensionBase=!focusView&&!movingAssembly&&b.lift?{key:sourceKey,faces:this.faces,groundZ}:null;
   if(lift)this.faces=applySuspensionLift(this.faces,b);
   this.meshCache={key,faces:this.faces,groundZ};
   if(!focusView&&!isolatedPorscheEngine&&!bikeLegacyGroup&&!porscheLegacy&&!showFloor&&!showDrive&&!activeService&&!engineView&&!bodyModules&&!phase)this.assembledMesh=this.meshCache;
 }
 this.faces=this.meshCache.faces;
 this.prepareInspection(exhibit);
 if(this.sectionPlane){
   this.cameraFrameFaces=this.faces;
   this.faces=sectionFaces(this.faces,this.sectionPlane);
   if(this.partPositions?.size)this.faces=this.faces.map(face=>{
     const delta=this.partPositions.get(face.motionKey);
     return delta?{...face,points:face.points.map(p=>p.map((v,i)=>v+delta[i]))}:face;
   });
 }else this.cameraFrameFaces=null;
 if(this.seeThroughBody&&seeThroughCars.has(b.vehicle)&&!focusView&&!this.inspection?.onlyPart&&!(assembly&&this.isolate)){
   this.faces=bodyVisibility(this.faces,this.inspection?.part);
 }
 this.hitFaces=this.faces;this.builtInspection=this.inspection;this.builtIsolation=this.isolate;
 }
 draw(){if(!this.build)return;const c=this.canvas,ctx=this.ctx,rect=c.getBoundingClientRect();if(!rect.width)return;this.panPick=null;const w=rect.width,h=rect.height,dpr=Math.min(window.devicePixelRatio||1,2);
 const i=this.inspection||{};
 let geometryKey=null;
 if(this.cacheDraws){
   const sceneKey=JSON.stringify([this.build,i.vehicle,i.assembly,i.part,i.instance,i.studySeat,i.system,i.detailView?.id,i.detailPart,i.expanded,i.separation,i.previewGroup,
     i.onlyPart,i.frameEngine,i.engineCutaway,this.progress,this.isolate,this.schematic,
     this.sectionPlane,this.seeThroughBody,this.lights,this.mechanismPhase,this.slRoofFraction,this.dragContext?.part,this.partPositions?.size?[...this.partPositions]:null]);
   geometryKey=sceneKey+JSON.stringify([this.hoverHit?.part,this.hoverHit?.instance]);
   const baseFrame=JSON.stringify([sceneKey,w,h,dpr,this.angle,this.elevation,this.zoom,this.blueprint,this.keepAssemblyFrame,
     this.selectionFocus?.id,this.selectionFocus?.instance,this.drag?.move,this.drag?.moved,this.focusPan?.start]);
   const frameKey=baseFrame+geometryKey;
   if(!this.focusPan&&!this.focusTransition&&this.completedFrame===frameKey)return;
   const fastHover=this.hoverRaster?.baseFrame===baseFrame&&!this.focusPan&&!this.focusTransition;
   if(fastHover&&this.hoverBackdrop){
     ctx.drawImage(this.hoverBackdrop,0,0,w,h);
     if(recolorHover(this,this.hoverHit,w,h)){this.frameLabels(w,h);this.completedFrame=frameKey;return;}
   }
   this.captureHover=!this.hoverHit&&!this.focusPan&&!this.focusTransition&&!this.drag&&!i.assembly&&!i.part&&!i.detailView&&this.seeThroughBody;
   this.hoverBaseFrame=baseFrame;
   this.completedFrame=frameKey;
 }
 if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const v=VEHICLES[this.build.vehicle];const scale=Math.min(w/(v.length+2.15),h/4.3)*this.zoom;this.pixelScale=scale;const {right,down,near}=cameraBasis(this.build.vehicle,this.inspection?.detailView,this.angle,this.elevation);
 let project=([x,y,z])=>({
   x:w/2+(right[0]*x+right[1]*y)*scale,
   y:h*.65+(down[0]*x+down[1]*y+down[2]*z)*scale,
   depth:near[0]*x+near[1]*y+near[2]*z
 });this.project=project;
 const bg=ctx.createRadialGradient(w*.52,h*.47,10,w*.52,h*.47,w*.6);
 bg.addColorStop(0,this.blueprint?'#1d383a':'#34383b');bg.addColorStop(1,this.blueprint?'#142629':'#171b1e');
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 if(!geometryKey||this.drawGeometryKey!==geometryKey||this.drawnFaces!==this.faces){this.buildMesh();this.drawGeometryKey=geometryKey;this.drawnFaces=this.faces;}
 this.partFrames=new Map();
 const projectKey=JSON.stringify([w,h,this.angle,this.elevation,this.zoom,this.inspection?.detailView?.id]);
 if(this.pointProjectionKey!==projectKey){this.pointProjectionKey=projectKey;this.projectedWorld=new WeakMap();this.alignedWorld=new WeakMap();this.alignmentKey=null;}
 this.hitFaces=this.faces.map(f=>{
   let projected=this.projectedWorld.get(f.points);
   if(!projected){projected=f.points.map(project);this.projectedWorld.set(f.points,projected);}
   return {...f,projected};
 });
 const state=this.inspection||{};
 if(!state.assembly&&!state.detailView&&!state.onlyPart&&!state.previewGroup){
   this.overviewFrame={vehicle:this.build.vehicle,faces:this.cameraFrameFaces||this.faces};
 }
 if(this.hitFaces.length || this.cameraFrameFaces?.length){
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   const include=q=>{
     minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);
   };
   // Keep the camera anchored to the uncut shape as the plane moves.
   const preserve=this.keepAssemblyFrame&&state.assembly&&!state.detailView&&!state.onlyPart
     &&this.overviewFrame?.vehicle===this.build.vehicle;
   // Reserve the entire bench route on entry. Intermediate detours can reach
   // farther than the parked pose. Whole-vehicle and pinned-part views keep
   // their existing framing and camera controls.
   const spreadActive=(state.expanded||this.motion)&&this.activeLayout;
   const framePart=this.dragContext?this.dragContext.part:state.part;
   const engineFocus=state.frameEngine&&this.isolate&&!state.onlyPart&&!state.detailView&&framePart!=='engine.cooling';
   // A linked rear engine study opens on the installed engine. The remote
   // 992 nose radiators still render and regain normal framing when selected.
   const inFrame=face=>!engineFocus||face.part!=='engine.cooling'||face.points[0][0]>0;
   const frameFaces=preserve?this.overviewFrame.faces:spreadActive?null:this.cameraFrameFaces;
   if(state.detailView&&!state.onlyPart&&this.activeLayout?.canExpand){
     const ext=travelFrame(this.activeLayout,{right,down},Boolean(state.detailView.animated),this.partPositions);
     include({x:w/2+ext.left*scale,y:h*.65+ext.top*scale});
     include({x:w/2+ext.right*scale,y:h*.65+ext.bottom*scale});
   }else if(spreadActive&&!preserve){
     for(const entry of spreadActive.entries)if(inFrame(entry.face))for(const p of entry.face.points)include(project(p));
   }else if(frameFaces && frameFaces!==this.faces){
     for(const f of frameFaces)if(inFrame(f))for(const p of f.points)include(project(p));
   }else for(const f of this.hitFaces)if(inFrame(f))for(const q of f.projected)include(q);
   const top=this.canvas.clientWidth>0 && rect.height>=360?68:13, bottom=35, usable=Math.max(1,h-top-bottom);
   this.placementArea={left:6,right:w-6,top:top+2,bottom:h-bottom-2};
   const ratio=Math.min(w*.86/Math.max(1,maxX-minX),usable*.90/Math.max(1,maxY-minY))*this.zoom;
   const baseProject=project;
   const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
   let projection=componentProjection({ratio,cx,cy},this.selectionFocus,{right,down},scale,w,h,usable);
   if(this.focusPan){
     const pan=this.focusPan;
     pan.start??=performance.now();
     const t=(performance.now()-pan.start)/350;
     if(t>=1)this.focusPan=null;
     else{
       pan.to=projection;pan.screenY=top+usable/2;
       projection=focusBlend(pan.from,projection,t);
     }
   }
   const hold=this.placementFrame;
   const keepPlaced=hold && this.partPositions?.size && hold.angle===this.angle && hold.elevation===this.elevation &&
     hold.zoom===this.zoom && hold.width===w && hold.height===h;
   if(hold&&!keepPlaced)this.placementFrame=null;
   const pinned=keepPlaced?hold.fit:(this.drag?.moved && this.drag.move)?(this.drag.camera??=this.lastCamera||projection):projection;
   this.lastCamera=pinned;this.pixelScale=scale*pinned.ratio;
   const align=q=>{
     return {x:(q.x-pinned.cx)*pinned.ratio+w/2,y:(q.y-pinned.cy)*pinned.ratio+top+usable/2,depth:q.depth};
   };
   const alignKey=JSON.stringify([pinned.cx,pinned.cy,pinned.ratio,top,usable]);
   if(this.alignmentKey!==alignKey){this.alignmentKey=alignKey;this.alignedWorld=new WeakMap();}
   for(const face of this.hitFaces){
     let projected=this.alignedWorld.get(face.points);
     if(!projected){projected=face.projected.map(align);this.alignedWorld.set(face.points,projected);}
     face.projected=projected;
     let bounds=this.partFrames.get(face.motionKey);
     if(face.motionKey && !bounds){
       bounds={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};this.partFrames.set(face.motionKey,bounds);
     }
     for(const point of face.projected){
       if(bounds){
         bounds.left=Math.min(bounds.left,point.x);bounds.right=Math.max(bounds.right,point.x);
         bounds.top=Math.min(bounds.top,point.y);bounds.bottom=Math.max(bounds.bottom,point.y);
       }
     }
   }
   project=p=>align(baseProject(p));this.project=project;
 }
 const focused=Boolean(this.inspection?.detailView||this.inspection?.onlyPart||(this.isolate&&this.inspection?.assembly));
 if(!focused){
   ctx.strokeStyle=this.blueprint?'#5d97933b':'#7b858d20';ctx.lineWidth=1;
   const floor=this.meshCache?.groundZ||0;
   for(let n=-8;n<=8;n++){
     for(const line of [[[n,-8,floor],[n,8,floor]],[[-8,n,floor],[8,n,floor]]]){
       const [a,b]=line.map(project);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
     }
   }
   if(hasStudioFinish(this.build.vehicle)&&!this.blueprint&&!this.inspection?.expanded&&!this.partPositions?.size&&ctx.transform){
     drawStudioContactShadow(ctx,project,floor,this.build.vehicle);
   }else{
     const center=project([0,0,floor]),edge=project([1,0,floor]),radius=Math.max(1,Math.hypot(edge.x-center.x,edge.y-center.y)*v.length*.46);
     ctx.save();ctx.translate(center.x,center.y);ctx.scale(1,.23);
     const shadow=ctx.createRadialGradient(0,0,0,0,0,radius);shadow.addColorStop(0,'#0008');shadow.addColorStop(1,'#0000');
     ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.restore();
   }
 }
 if(this.captureHover&&typeof document!=='undefined'&&this.canvas.getContext){
   const back=this.hoverBackdrop??=document.createElement('canvas');
   if(back.width!==c.width||back.height!==c.height){back.width=c.width;back.height=c.height;}
   back.getContext('2d').drawImage(c,0,0);
 }
 this.depthRender(w,h,dpr,project);
 if(this.hoverRaster&&this.captureHover)this.hoverRaster.baseFrame=this.hoverBaseFrame;
 this.points=[];
 this.frameLabels(w,h);
 this.saveFocusDestination();
 if(this.focusPan&&typeof document!=='undefined'&&this.canvas.getContext&&!this.focusTransition){
   const pan=this.focusPan,image=document.createElement('canvas');image.width=c.width;image.height=c.height;
   image.getContext('2d').drawImage(c,0,0);pan.image=image;pan.from=this.lastCamera;pan.start=performance.now();
 }
 }
 frameLabels(w,h){
   const ctx=this.ctx;ctx.fillStyle='#91a58a';ctx.textAlign='left';ctx.font='9px monospace';
   ctx.fillText(this.inspection?.detailView?'COMPONENT STUDY':this.inspection?.assembly?'ASSEMBLY SCHEMATIC':'VEHICLE OVERVIEW',18,h-20);
   ctx.textAlign='right';ctx.fillText('REFERENCE GEOMETRY · NOT SERVICE CAD',w-18,h-20);
 }
 snapshot(){
   // A saved image represents the current selection and orbit, even if a focus
   // animation is still fading the old scene out on the visible canvas.
   this.draw();
   return (this.focusTransition?.destination||this.canvas).toDataURL('image/png');
 }
}
// 1993 F-350 2WD chassis: frame rails that rise over the Sterling axle, Twin
// I-Beam front axle, rear leaf springs and the shared shock absorbers.
function drawF350Chassis(r,tag){
 const front=-1.6891,rear=1.6891;
 tag('suspension.frame',()=>drawF350Frame(r,'#353e43'));
 tag('steering.axle',()=>drawTwinIBeams(r));
 tag('steering.linkage',()=>drawTwinIBeamLinkage(r));
 tag('suspension.spring',()=>{drawTwinIBeamSpringSeats(r);drawF350RearLeafSprings(r);});
 // Front shocks mount behind the beams; rear shocks outboard of the spring seats.
 tag('suspension.damper',()=>{for(const side of [-1,1])for(const [a,b] of [[[front+.10,side*.68,.44],[front+.04,side*.66,.88]],[[rear-.14,side*.64,.43],[rear+.01,side*.66,.80]]]){const m=a.map((v,i)=>v+(b[i]-v)*.5);r.rod(a,b,.026,'#98a4ac');r.rod(a,m,.039,'#414c53');}});
}
