import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssemblies} from '../garage/assemblies.js';
import {VEHICLES} from '../garage/catalog.js';

function mesh(vehicle='g500',inspection={}) {
 const renderer=Object.create(GarageRenderer.prototype);
 Object.assign(renderer,{build:{vehicle,paint:'olive',finish:'silver',parts:[]},inspection:{assembly:null,part:null,expanded:false,...inspection},schematic:true,faces:[],currentPart:null,lights:true});
 renderer.buildMesh();return renderer;
}

test('every selectable component has actual geometry for its vehicle',()=>{
 for(const vehicle of Object.keys(VEHICLES)){
  for(const assembly of getAssemblies(vehicle)){
   const tags=new Set(mesh(vehicle,{assembly:assembly.id}).faces.map(f=>f.part));
   for(const part of assembly.parts)assert(tags.has(part.id),`${vehicle} lacks ${part.id}`);
  }
 }
});

test('wheel expansion separates tire, rim and brake on both sides without deforming them',()=>{
 const a=mesh(),b=mesh('g500',{assembly:'wheels',expanded:true});
 assert.equal(a.faces.length,b.faces.length);
 const shifts=new Map();
 for(let i=0;i<a.faces.length;i++){
  const f=a.faces[i],g=b.faces[i];if(!f.part.startsWith('wheels.'))continue;
  const delta=g.points[0].map((v,k)=>v-f.points[0][k]);
  for(let j=0;j<f.points.length;j++)for(let k=0;k<3;k++)assert(Math.abs(g.points[j][k]-f.points[j][k]-delta[k])<1e-9,'part must translate rigidly');
  assert.equal(delta[0],0);assert.equal(delta[2],0);assert(Math.abs(delta[1])>.05);
  const sign=f.points.reduce((sum,p)=>sum+p[1],0)<0?-1:1;assert.equal(Math.sign(delta[1]),sign,'left and right parts must move outward');
  shifts.set(f.part,Math.abs(delta[1]));
 }
 assert(shifts.get('wheels.tire')>shifts.get('wheels.rim'));
 assert(shifts.get('wheels.rim')>shifts.get('wheels.disc'));
});

test('component picking chooses the visible nearest face and misses outside geometry',()=>{
 const renderer=Object.create(GarageRenderer.prototype);
 renderer.canvas={getBoundingClientRect:()=>({left:100,top:50})};renderer.project=([x,y,depth])=>({x,y,depth});
 const points=z=>[[0,0,z],[30,0,z],[0,30,z]];
 const far={part:'wheels.disc',points:points(0)},near={part:'body.door',points:points(1)};
 for(const faces of [[far,near],[near,far]]){renderer.faces=faces;assert.deepEqual(renderer.hitTest(105,55),{assembly:'body',part:'body.door'});assert.equal(renderer.hitTest(140,90),null);}
});

test('assembled G500 rim remains depth-order independent across orbit angles',()=>{
 const renderer=Object.create(GarageRenderer.prototype);
 Object.assign(renderer,{build:{vehicle:'g500'},faces:[],currentPart:null});renderer.wheel(0,0,.3876,'#bfc4c2',1);
 const faces=renderer.faces,prior=globalThis.ImageData;
 globalThis.ImageData=class{constructor(w,h){this.data=new Uint8ClampedArray(w*h*4);}};
 try {
  for(const angle of [-1.4,-.7,0,.7,1.4]){
   const ca=Math.cos(angle),sa=Math.sin(angle),ce=Math.cos(.24),se=Math.sin(.24);
   const project=([x,y,z])=>({x:50+(x*ca-y*sa)*90,y:55+(-(z-.43)*ce+(x*sa+y*ca)*se)*90,depth:x*sa+y*ca+z*Math.tan(.24)});
   const draw=geometry=>{let output;const instance={faces:geometry,canvas:{dataset:{}},cpuSurface:{getContext:()=>({putImageData:p=>output=p.data.slice()})},ctx:{drawImage(){}}};GarageRenderer.prototype.softwareRender.call(instance,100,100,project);return output;};
   assert.deepEqual(draw(faces),draw([...faces].reverse()),`orbit ${angle} must not depend on face insertion order`);
  }
 }finally{globalThis.ImageData=prior;}
});

test('engine systems isolate only member components and an individual part can be inspected alone',()=>{
 const a=getAssemblies('bmw325ci').find(x=>x.id==='powertrain');const system=a.systems.find(x=>x.key==='shortblock');
 const r=mesh('bmw325ci',{assembly:'powertrain',system:system.id,expanded:true});r.isolate=true;r.buildMesh();
 const members=new Set(system.children);assert(r.faces.length>0);assert(r.faces.every(f=>members.has(f.part)));
 r.inspection.part='powertrain.pistons';r.inspection.onlyPart=true;r.buildMesh();assert(r.faces.length>0);assert(r.faces.every(f=>f.part==='powertrain.pistons'));
});

test('repeated inspection transforms do not accumulate and appearance invalidates cached source geometry',()=>{
 const r=mesh('bmw325ci',{assembly:'powertrain',expanded:false});const baseline=JSON.stringify(r.faces.map(f=>f.points));
 r.inspection.expanded=true;r.buildMesh();assert.notEqual(JSON.stringify(r.faces.map(f=>f.points)),baseline);
 r.inspection.expanded=false;r.buildMesh();assert.equal(JSON.stringify(r.faces.map(f=>f.points)),baseline);
 r.build.paint='burgundy';const old=r.meshCache;r.buildMesh();assert.notEqual(r.meshCache,old);
});
