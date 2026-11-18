import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {dimensionStudies,measureStockMesh} from '../garage/factory-dimensions.js';
import {sanitizeBuild} from '../garage/model.js';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {sl550} from '../garage/sl550.js';
import {slDeckPoint} from '../garage/sl550-roof.js';

const vehicle='sl550';
const build=raw=>sanitizeBuild({vehicle,roofPosition:'up',paint:'silver',...raw});
const renderer=raw=>Object.assign(Object.create(GarageRenderer.prototype),{
  build:build(raw),inspection:{},faces:[],lights:false,schematic:true,
  canvas:{dataset:{},getBoundingClientRect:()=>({width:0,height:0,left:0,top:0})},
  project:([x,y,z])=>({x:200*x-75*y,y:180*z+60*y,depth:15*x+200*y+70*z})
});

test('the stock SL550 with the top raised matches the four US brochure measurements',()=>{
  const measured=measureStockMesh(vehicle,GarageRenderer.assembledFaces(build()));
  const rows=dimensionStudies[vehicle].rows;
  assert.deepEqual(rows.map(([id,,inches])=>[id,inches]),[
    ['length',181.6],['width',82.6],['height',51.8],['wheelbase',101.8]
  ]);
  for(const [id,,inches] of rows)assert.equal((measured.meters[id]/.0254).toFixed(1),inches.toFixed(1),id);
  assert.deepEqual(Object.keys(measured.wheels).sort(),['front-left','front-right','rear-left','rear-right']);
});

function grouped(faces) {
  const parts=new Map();
  for(const face of faces){
    if(!parts.has(face.part))parts.set(face.part,[]);
    parts.get(face.part).push(face);
  }
  return parts;
}

// Shoot through the interior of an actual surface triangle. Interior parts are
// independently accessible through isolation even when the installed shell covers them.
function pickPart(r,faces,id){
  r.hitFaces=faces;
  for(const face of faces){
    if(face.pickThrough||face.opacity<=0)continue;
    const indices=face.triangles??faceTriangles(face.points);
    for(let i=0;i<indices.length;i+=3){
      const [a,b,c]=indices.slice(i,i+3).map(k=>r.project(face.points[k]));
      const area=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
      if(!Number.isFinite(area)||Math.abs(area)<.01)continue;
      const hit=r.hitTest((a.x+b.x+c.x)/3,(a.y+b.y+c.y)/3);
      assert.equal(hit?.part,id,id);
      return;
    }
  }
  assert.fail('No pickable triangle on '+id);
}

test('all SL550 sidebar parts and nested components have matching, pickable mesh geometry',()=>{
  const r=renderer(),list=getAssemblies(vehicle),queue=list.flatMap(g=>g.parts.map(p=>p.id));
  assert.equal(new Set(list.map(g=>g.id)).size,list.length,'unique sidebar groups');
  assert.equal(new Set(queue).size,queue.length,'unambiguous installed parts');
  r.buildMesh();
  const displayed=grouped(r.faces);
  assert.deepEqual(new Set(displayed.keys()),new Set(queue),'assembled faces and sidebar agree');
  for(const id of queue)pickPart(r,displayed.get(id),id);

  const verified=new Set();
  for(const id of queue){
    const detail=getDetail(vehicle,id);
    if(!detail||verified.has(detail.id))continue;
    verified.add(detail.id);
    r.faces=[];
    r.inspection={detailView:detail};
    detail.draw(r,0,'#a8aaa5');
    const children=detail.groups.flatMap(g=>g.parts.map(p=>p.id));
    assert.equal(new Set(children).size,children.length,'unique subparts of '+detail.id);
    const pieces=grouped(r.faces);
    assert.deepEqual(new Set(pieces.keys()),new Set(children),detail.name);
    for(const child of children)pickPart(r,pieces.get(child),child);
    queue.push(...children);
  }
  for(const path of ['seats.airscarf','seats.massage','roof.panel','roof.sky-glass']){
    assert(verified.has(getDetail(vehicle,path)?.id),path);
  }
});

test('reusing the stationary mesh during roof travel matches a fresh draw at both stops and mid-stroke',()=>{
  const r=renderer({slWindstop:true,slGlass:'clear'});
  let stationary,parkedCamera;
  for(const fraction of [0,.58,1]){
    r.slRoofFraction=fraction;
    r.buildMesh();
    const cached=grouped(r.faces);
    const camera=cached.get('sl-assist.rearview').map(f=>f.points);
    if(fraction===0)parkedCamera=camera;
    if(fraction===.58){
      assert.notDeepEqual(camera,parkedCamera,'the camera travels with the open deck');
      const transformed=parkedCamera.map(face=>face.map(point=>slDeckPoint(point,fraction)));
      for(let i=0;i<camera.length;i++)for(let j=0;j<camera[i].length;j++){
        for(let axis=0;axis<3;axis++)assert(Math.abs(camera[i][j][axis]-transformed[i][j][axis])<1e-9);
      }
    }
    if(stationary)assert.equal(r.slStationary.faces,stationary,'fixed mesh survives successive poses');
    stationary=r.slStationary.faces;
    const fresh=renderer({slWindstop:true,slGlass:'clear'});
    fresh.slRoofFraction=fraction;
    sl550.draw(fresh,'#a8aaa5','#bfc4c2');
    const direct=grouped(fresh.faces);
    // The shared brake, fuel and electrical systems are drawn by the renderer
    // around the exhibit's own mesh; compare the exhibit's parts.
    const own=new Set(sl550.groups.flatMap(g=>g.parts.map(p=>p.id)));
    for(const id of [...cached.keys()])if(!own.has(id))cached.delete(id);
    assert.deepEqual(new Set(cached.keys()),new Set(direct.keys()));
    for(const [id,faces] of direct){
      const actual=cached.get(id);
      assert.equal(actual.length,faces.length,id);
      for(let i=0;i<faces.length;i++){
        assert.deepEqual(actual[i].points,faces[i].points,id+' position');
        assert.equal(actual[i].color,faces[i].color,id+' material');
        assert.equal(actual[i].opacity,faces[i].opacity,id+' opacity');
      }
    }
  }
});

test('seat settings, windblocker, glass and top position survive JSON build round trips per occupant',()=>{
  const comfort={
    driver:{heat:2,vent:0,massage:'slow-gentle',airscarf:3},
    passenger:{heat:0,vent:3,massage:'fast-vigorous',airscarf:1}
  };
  const loaded=build({slComfort:comfort,slGlass:'clear',slWindstop:true,roofPosition:'down'});
  const restored=sanitizeBuild(JSON.parse(JSON.stringify(loaded)));
  assert.deepEqual(restored,loaded);
  assert.deepEqual(restored.slComfort,comfort);
  assert.equal(restored.slGlass,'clear');assert.equal(restored.slWindstop,true);assert.equal(restored.roofPosition,'down');
  assert(!Object.hasOwn(sanitizeBuild({...restored,vehicle:'g500'}),'slComfort'));
});

test('the front and rear presets preserve the physical left and right seats of a US SL550',()=>{
  const width=640,height=360,r=renderer();
  const ctx={setTransform(){},clearRect(){},fillRect(){},fillText(){},save(){},restore(){},
    translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},
    createRadialGradient:()=>({addColorStop(){}})};
  Object.assign(r,{ctx,canvas:{width,height,dataset:{},getBoundingClientRect:()=>({width,height,left:0,top:0})},
    zoom:1,partPositions:new Map(),depthRender(){}});
  const projectedCenter=id=>{
    let min=Infinity,max=-Infinity;
    for(const f of r.hitFaces)if(f.part===id)for(const p of f.projected){min=Math.min(min,p.x);max=Math.max(max,p.x);}
    assert(Number.isFinite(min)&&Number.isFinite(max),id);return (min+max)/2;
  };
  globalThis.window={devicePixelRatio:1};
  try{
    r.setView('front');
    assert(projectedCenter('seats.driver')>projectedCenter('seats.passenger'));
    assert(projectedCenter('cabin.wheel')>projectedCenter('seats.passenger'));
    r.setView('rear');
    assert(projectedCenter('seats.driver')<projectedCenter('seats.passenger'));
    assert(projectedCenter('cabin.wheel')<projectedCenter('seats.passenger'));
  }finally{delete globalThis.window;}
});

test('the closed bonnet and cockpit floor occlude the engine, exhaust and hydraulic lines from above',()=>{
  const width=780,height=260,scale=210;
  const r=renderer({roofPosition:'down'});
  const buried=id=>id.startsWith('sl-m278.')||id.startsWith('sl-drive.')||
    id==='sl-abc.feed'||id==='sl-abc.return';
  const opaque=GarageRenderer.assembledFaces(r.build).filter(face=>(face.opacity??1)===1);
  r.faces=opaque.map(face=>({...face,vertexColors:null,color:buried(face.part)?'#ff0000':'#202020'}));
  Object.assign(r,{build:{},cpuWidth:width,cpuHeight:height,
    cpuPixels:{data:new Uint8ClampedArray(width*height*4)},cpuDepth:new Float64Array(width*height),
    cpuSurface:{width,height,getContext:()=>({putImageData(){}})},ctx:{drawImage(){}}});
  // Crop the ray field to the bonnet and both footwells. An exhaust tip
  // beyond the rear bumper or a tire outside the cabin is allowed to show.
  const project=([x,y,z])=>({x:(x+2.14)*scale,y:height/2+y*scale,depth:z});
  r.softwareRender(width,height,project);
  let intrusion=0,covered=0;
  for(let i=0;i<r.cpuPixels.data.length;i+=4){
    if(r.cpuPixels.data[i]===255)intrusion++;
    if(r.cpuPixels.data[i+3])covered++;
  }
  assert(covered>width*height*.94,'expected a filled body and cockpit in the sampled area');
  assert.equal(intrusion,0,'underhood or underfloor hardware projected through the opaque body');
});
