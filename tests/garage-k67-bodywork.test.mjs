import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getAssembly} from '../garage/assemblies.js';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {drawK67Bodywork} from '../garage/k67-fairings.js';

function bodywork(paint='#d13430'){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  drawK67Bodywork(r,paint);
  return r.faces;
}

// Original 1200 x 800 Racing Red side photograph is linked in k67-fairings.js.
// These observations use its pixel frame, independently of mesh tessellation.
const photoPoint=([x,,z])=>[1013-(x+.728)*819/1.457,596-(z-.30)*819/1.457];
const selected=(faces,part)=>faces.filter(face=>face.part===part);

test('stock S 1000 RR exterior registers to independent landmarks on the native 2023 right-side photo',()=>{
  const faces=bodywork();
  for(const [id,u,v,tolerance] of [
    ['body.fairing',1078,379,3],['body.fairing',949,376,2],['body.fairing',846,677,5],
    ['body.fairing',679,438,3],['body.fender',1089,436,3],['cabin.screen',882,88,2],
    ['body.lamps',1059,367,2],['body.lamps',987,315,4]
  ]){
    const projected=selected(faces,id).flatMap(f=>f.points.map(photoPoint));
    assert(projected.some(([x,y])=>Math.hypot(x-u,y-v)<=tolerance),id+' near '+u+','+v);
  }
  assert.equal(new Set(faces.map(f=>f.part)).size,5);
  for(const id of ['body.fairing','body.lamps','body.fender','body.winglets','cabin.screen']){
    const part=getAssembly('bmws1000rr',id.split('.')[0]).parts.find(p=>p.id===id);
    assert.match(part.source.url,/vid=63032&diagram=\d\d_\d{4}$/);
  }
});

function visibleAt(faces,y,z){
  // Orthographic ray along +X. A wing loop should present a physical opening
  // from the front, bound by airfoils above and below and the outboard return.
  return faces.some(face=>{
    const tris=faceTriangles(face.points);
    for(let i=0;i<tris.length;i+=3){
      const [a,b,c]=tris.slice(i,i+3).map(j=>face.points[j]);
      const cross=(p,q)=>(q[1]-p[1])*(z-p[2])-(q[2]-p[2])*(y-p[1]);
      const signed=[cross(a,b),cross(b,c),cross(c,a)];
      if(Math.max(...signed)-Math.min(...signed)<1e-12)continue;
      if(signed.every(d=>d>=0)||signed.every(d=>d<=0))return true;
    }
    return false;
  });
}

test('both 2023 winglets have a physical through-opening and closed outboard ends',()=>{
  const wings=selected(bodywork(),'body.winglets');
  for(const sign of [-1,1]){
    assert(!visibleAt(wings,.264*sign,.665),'open passage');
    assert(visibleAt(wings,.264*sign,.680),'upper blade');
    assert(visibleAt(wings,.264*sign,.648),'lower blade');
    assert(visibleAt(wings,.324*sign,.669),'outer return');
  }
});

test('paint changes preserve the black lower spoiler, roundels, reflector housings and separate lens glazing',()=>{
  const original=bodywork(),repainted=bodywork('#3d65c0');
  assert.equal(original.length,repainted.length);
  assert.equal(repainted.filter(f=>f.part==='body.lamps'&&f.opacity).length,10);
  for(let i=0;i<original.length;i++)assert.deepEqual(repainted[i].points,original[i].points);
  assert(original.some((f,i)=>f.part==='body.fairing'&&f.color!==repainted[i].color));
  assert(original.some((f,i)=>f.part==='body.fairing'&&f.color==='#569bc3'&&f.color===repainted[i].color));
  assert(selected(repainted,'body.fairing').some(f=>f.color==='#25282a'));
});


test('opening the nose fairing exposes independently movable panels identical to the fitted bodywork',()=>{
  const study=getDetail('bmws1000rr','body.fairing');
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  study.draw(r,0,'#d13430');
  const registered=study.groups[0].parts;
  assert.equal(registered.length,7);
  assert(registered.every(p=>p.source.url.includes('diagram=')&&Math.hypot(...p.offset)>0));
  for(const [id,sign] of [['left-trim',-1],['right-trim',1]]){
    const panels=selected(r.faces,'k67-fairing.'+id);
    assert(panels.length>0);
    assert(panels.every(f=>f.points.every(p=>p[1]*sign>0)));
  }
  const geometry=faces=>faces.map(f=>JSON.stringify([f.color,f.points])).sort();
  assert.deepEqual(geometry(r.faces),geometry(selected(bodywork(),'body.fairing')));
});
