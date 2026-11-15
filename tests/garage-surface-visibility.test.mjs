import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {softwareDepthRender,gpuDepthRender} from '../garage/surface-materials.js';

const width=80,height=80;
function draw(faces,{angle=0,elevation=0,blueprint=false,gpu=false}={}){
 const ca=Math.cos(angle),sa=Math.sin(angle),ce=Math.cos(elevation),se=Math.sin(elevation);
 const project=([x,y,z])=>({x:40+(x*ca-y*sa)*20,y:40+((x*sa+y*ca)*se-z*ce)*20,depth:(x*sa+y*ca)*ce+z*se});
 const r=Object.assign(Object.create(GarageRenderer.prototype),{canvas:{dataset:{},getBoundingClientRect:()=>({left:0,top:0})},faces,ctx:{drawImage(){}},cpuWidth:width,cpuHeight:height,
  cpuPixels:{data:new Uint8ClampedArray(width*height*4)},cpuDepth:new Float64Array(width*height),cpuSurface:{width,height,getContext:()=>({putImageData(){}})},project,blueprint});
 if(gpu){
   // Inspect the submitted triangles and depth state independently of the software color buffer.
   let buf,opaque=true,less=false;const fragments=[];
   r.surface={width,height};r.gl={LESS:513,DEPTH_TEST:2929,TRIANGLES:4,BLEND:3042,
     isContextLost:()=>false,viewport(){},clearColor(){},clearDepth(){},clear(){},useProgram(){},
     depthFunc(mode){less=mode===this.LESS;},enable(){},disable(){},depthMask(value){opaque=value;},
     bindBuffer(){},bufferData(target,data){buf=data;},getAttribLocation(){return 0;},enableVertexAttribArray(){},vertexAttribPointer(){},blendFuncSeparate(){},
     drawArrays(mode,start,count){assert.equal(less,true);for(let k=start;k<start+count;k+=3){
       const at=i=>buf.subarray(i*7,i*7+7),points=[at(k),at(k+1),at(k+2)].map(v=>[width*(v[0]+1)/2,height*(1-v[1])/2,-v[2]]);
       const rgb=n=>'#'+Array.from(at(n).slice(3,6),x=>Math.round(255*x).toString(16).padStart(2,'0')).join('');
       const opacity=at(k)[6];assert(opaque?opacity===1:opacity<1);assert(points.every(p=>Math.abs(p[2])<1));
       fragments.push({points,color:rgb(k),vertexColors:[rgb(k),rgb(k+1),rgb(k+2)],opacity});
     }}
   };
   gpuDepthRender(r,width,height,1,project);
   return {fragments,project,r};
 }
 softwareDepthRender(r,width,height,project);
 const pixel=(x,y)=>Array.from(r.cpuPixels.data.slice((y*width+x)*4,(y*width+x+1)*4));
 return {r,pixel,project};
}
const front=(xz,y)=>xz.map(([x,z])=>[x,y,z]);
const nearPane={part:'lens.near',color:'#ff0000',opacity:.5,points:[[-1,-.6,1],[1,.6,1],[1,.6,-1],[-1,-.6,-1]]};
const farPane={part:'lens.far',color:'#0000ff',opacity:.5,points:[[-1,.6,1],[1,-.6,1],[1,-.6,-1],[-1,.6,-1]]};
const frame={part:'door.frame',color:'#24ae8c',points:front([[-.16,.9],[.16,.9],[.16,-.9],[-.16,-.9]],.64)};
function triDepth(points,x,y){
 const [a,b,c]=points,det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
 const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det;
 const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;
 if(!Number.isFinite(u)||u<=0||v<=0||u+v>=1)return null;
 return u*a[2]+v*b[2]+(1-u-v)*c[2];
}
test('crossing panes composite in pixel-depth order on each side of the intersection',()=>{
 for(const order of [[frame,nearPane,farPane],[farPane,nearPane,frame]]){
   const {pixel,r}=draw(order);
   assert.deepEqual(pixel(30,38),[85,0,170,192]);
   assert.deepEqual(pixel(50,38),[170,0,85,192]);
   assert.deepEqual(pixel(40,38),[36,174,140,255]);
   assert.equal(r.hitTest(30.5,38.5)?.part,'lens.far');assert.equal(r.hitTest(50.5,38.5)?.part,'lens.near');
   const {fragments}=draw(order,{gpu:true});
   for(const x of [30.5,50.5]){
     const layers=fragments.filter(f=>f.opacity<1).map(f=>({depth:triDepth(f.points,x,38.5),color:f.color})).filter(v=>v.depth!==null);
     assert.equal(layers.length,2);assert(layers[0].depth<layers[1].depth);
     assert.equal(layers[1].color,x<40?'#0000ff':'#ff0000');
   }
 }
});
test('opaque door hides the ribbon behind it, including when blueprint and hover colors change',()=>{
 const panel={part:'door.shell',color:'#6ea868',points:front([[-1.25,1],[1.25,1],[1.25,-1],[-1.25,-1]],0)};
 const ribbon={part:'wiring.ribbon',highlighted:true,color:'#f0d030',points:[[-1.2,-.7,.25],[1.2,.7,.25],[1.2,.7,-.25],[-1.2,-.7,-.25]]};
 for(const angle of [0,.65,Math.PI,Math.PI+.65])for(const blueprint of [false,true]){
   const {pixel,project,r}=draw([ribbon,panel],{angle,elevation:.08,blueprint});
   for(const x of [-.65,.65]){
     const location=[x,x*.7/1.2,0],q=project(location),onNearSide=location[1]*Math.cos(angle)>0;
     const ix=Math.floor(q.x),iy=Math.floor(q.y);
     assert.equal(r.hitTest(ix+.5,iy+.5)?.part,onNearSide?'wiring.ribbon':'door.shell');
     assert.equal(pixel(ix,iy).slice(0,3).join(),onNearSide?'240,208,48':blueprint?'58,106,110':'110,168,104');
   }
 }
});
test('concave body outlines leave their notch open for drawing and selecting, in either winding',()=>{
 const loop=front([[-1,-1],[1,-1],[1,1],[.4,1],[.4,-.4],[-.4,-.4],[-.4,1],[-1,1]],.5);
 const behind={part:'cabin.floor',color:'#235abc',points:front([[-1,1],[1,1],[1,-1],[-1,-1]],-.4)};
 for(const vertices of [loop,[...loop].reverse()]){
   const panel={part:'body.shell',color:'#4f6b43',points:vertices};
   const {r,pixel}=draw([panel,behind]);
   assert.equal(r.hitTest(40,29)?.part,behind.part);assert.deepEqual(pixel(40,29),[35,90,188,255]);
   assert.equal(r.hitTest(54,29)?.part,panel.part);assert.deepEqual(pixel(54,29),[79,107,67,255]);
   const tri=faceTriangles(vertices);assert.equal(tri.length,18);
 }
});
test('an unselectable solid occludes picking and a fully transparent surface does not intercept it',()=>{
 const points=front([[-1,1],[1,1],[1,-1],[-1,-1]],0);
 const panel={part:'body.shell',color:'#3366aa',points};
 const cover={color:'#adaeac',points:points.map(p=>[p[0],.2,p[2]])};
 assert.equal(draw([panel,cover]).r.hitTest(41.5,36.5),null);
 assert.equal(draw([panel,{...cover,part:'film.clear',opacity:0}]).r.hitTest(41.5,36.5)?.part,'body.shell');
});
test('paint vertex shading interpolates across a triangle and is replaced by selection coloring',()=>{
 const points=front([[-1,1],[1,1],[-1,-1]],0),color='#b8cc68',face={points,color,part:'body.paint',vertexColors:['#ff0000','#00ff00','#0000ff']};
 assert.deepEqual(draw([face]).pixel(30,30),[121,67,67,255]);
 assert.deepEqual(draw([{...face,highlighted:true}]).pixel(30,30),[184,204,104,255]);
});

test('a clipped exterior exposes the real interior to both the depth buffer and picker',async()=>{
 const {sectionFaces}=await import('../garage/section-plane.js');
 const loop=[[-1,1],[1,1],[1,-1],[-1,-1]];
 const hood={points:front(loop,.5),part:'body.hood',color:'#44aa33'};
 const engine={points:front(loop,-.3),part:'engine.block',color:'#666688'};
 assert.equal(draw([hood,engine]).r.hitTest(40,40)?.part,'body.hood');
 const cut=sectionFaces([hood,engine],{axis:1,percent:60,reverse:false}),{r,pixel}=draw(cut);
 assert.equal(r.hitTest(40,40)?.part,'engine.block');assert.deepEqual(pixel(40,40),[102,102,136,255]);
});

test('the 747 fin picks inside its actual reference outline at every sampled point',async()=>{
 const {FLEET}=await import('../garage/fleet.js');
 const model=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle:'boeing747'}});
 FLEET.boeing747.draw(model,'#769078','#aab5b4');
 const fin=model.faces.filter(f=>f.part==='tail.fin'&&f.points.length>4);
 assert(fin.length>=2);
 for(const face of fin){
   const loop=face.points;
   const xs=loop.map(p=>p[0]),zs=loop.map(p=>p[2]),left=Math.min(...xs),bottom=Math.min(...zs);
   const dx=Math.max(...xs)-left,dz=Math.max(...zs)-bottom;
   const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[face],canvas:{getBoundingClientRect:()=>({left:0,top:0})},
     project:p=>({x:p[0],y:p[2],depth:p[1]})});
   for(let u=.009;u<1;u+=.052)for(let v=.017;v<1;v+=.038){
     const x=left+dx*u,z=bottom+dz*v;let inside=false;
     for(let i=0,j=loop.length-1;i<loop.length;j=i++){
       const a=loop[i],b=loop[j];
       if((a[2]>z)!==(b[2]>z) && x<(b[0]-a[0])*(z-a[2])/(b[2]-a[2])+a[0])inside=!inside;
     }
     assert.equal(Boolean(r.hitTest(x,z)),inside);
   }
 }
});

test('exploded moving components retain the same separation offsets for a full operating cycle',async()=>{
 const {getDetail}=await import('../garage/detail-catalog.js');
 const d=getDetail('hrv','powertrain.transmission');
 const r=Object.assign(Object.create(GarageRenderer.prototype),{
   build:{vehicle:'hrv',paint:'olive',finish:'silver',parts:[]},inspection:{vehicle:'hrv',detailView:d,expanded:true},
   progress:1,lights:true,schematic:true,faces:[],draw(){this.buildMesh();}
 });
 const offsets=()=>[...r.activeLayout.groups].map(([id,g])=>[id,...g.offset]);
 r.buildMesh();const baseline=offsets();let reported=null;r.onMechanismPhase=v=>{reported=v;};
 for(const phase of [.165,.38,.62,.83,1]){
   r.setMechanismPhase(phase);assert.equal(reported,phase);assert.equal(r.mechanismPlaying,false);
   assert.deepEqual(offsets(),baseline);
 }
 r.setMechanismPlaying(true);assert.equal(r.mechanismPhase,0);assert.equal(r.mechanismPlaying,true);
});

test('dense engines preserve initial clearance while opening, and flag obstructing vehicle context',async()=>{
 const {planTravel,offsetAt}=await import('../garage/explosion-travel.js');
 const {intersects,displaced}=await import('../garage/exploded-layout.js');
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',paint:'olive',finish:'silver',parts:[]},
   inspection:{assembly:'powertrain',expanded:true},progress:1,schematic:true,faces:[],lights:true});
 r.buildMesh();assert.equal(r.activeLayout.blockedTransit,true);
 const rims=r.activeLayout.entries.filter(entry=>entry.face.part==='wheels.rim');
 assert(rims.length && rims.every(entry=>!entry.group.movable));
 r.isolate=true;r.buildMesh();const layout=r.activeLayout;planTravel(layout);
 assert.equal(layout.blockedTransit,false);
 const groups=[...layout.groups.values()];
 for(let step=1;step<=16;step++){
   const positions=groups.map(g=>displaced(g.bounds,offsetAt(g,step/16)));
   for(let i=0;i<groups.length;i++)for(let j=0;j<i;j++){
     if((!groups[i].movable&&!groups[j].movable)||intersects(groups[i].bounds,groups[j].bounds))continue;
     assert(!intersects(positions[i],positions[j]),groups[i].key+' and '+groups[j].key);
   }
 }
});
