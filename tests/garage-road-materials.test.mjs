import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {utilityWheelSpokes} from '../garage/exterior-utility.js';
import {buildG500Exterior} from '../garage/exterior-g500.js';
import {g500SpareStar} from '../garage/g500-body-closures.js';
import {buildBmwExterior} from '../garage/exterior-bmw.js';
import {VEHICLES} from '../garage/catalog.js';
import {softwareDepthRender} from '../garage/surface-materials.js';

function raster(faces) {
  const width=10,height=10;
  const r={faces,canvas:{dataset:{}},ctx:{drawImage(){}},cpuWidth:width,cpuHeight:height,
    cpuPixels:{data:new Uint8ClampedArray(width*height*4)},cpuDepth:new Float64Array(width*height),
    cpuSurface:{width,height,getContext:()=>({putImageData(){}})}};
  softwareDepthRender(r,width,height,p=>({x:p[0],y:p[1],depth:p[2]}));
  return (x,y)=>[...r.cpuPixels.data.slice((x+width*y)*4,(x+width*y+1)*4)];
}
const rectangle=(x0,y0,x1,y1,z,color,opacity)=>({color,opacity,points:[[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]]});

test('clear panels transmit enclosed colors and do not paint over closer solid panels',()=>{
  const rear=rectangle(0,0,7,10,-52,'#c80000',1);
  const glass=rectangle(0,0,10,10,63,'#006400',.5);
  const post=rectangle(0,0,2,10,79,'#202020',1);
  for(const order of [[rear,glass,post],[post,glass,rear],[glass,post,rear]]){
    const at=raster(order);
    assert.deepEqual(at(1,5),[32,32,32,255]);
    assert.deepEqual(at(4,2),[100,50,0,255]);
    assert.deepEqual(at(4,4),[100,50,0,255],'diagonal must receive exactly one transparent fragment');
    assert.deepEqual(at(8,5),[0,100,0,128]);
  }
});
test('G500 grille, spare-cover star and wheel centers carry one vertical upper blade',()=>{
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null,lights:true});
  buildG500Exterior(r,'#58634d');
  for(const [part,center,radius] of [['body.grille-star',[0,1.007],.132],['body.spare-emblem',g500SpareStar.center,g500SpareStar.radius]]){
    const fins=r.faces.filter(f=>f.part===part&&f.color==='#e2e4df');
    assert.equal(fins.length,3);
    const extremes=fins.map(f=>f.points.reduce((a,b)=>Math.hypot(b[1]-center[0],b[2]-center[1])>Math.hypot(a[1]-center[0],a[2]-center[1])?b:a));
    const top=extremes.filter(p=>p[2]>center[1]);assert.equal(top.length,1);assert.equal(top[0][1],center[0]);
    const lower=extremes.filter(p=>p[2]<center[1]);assert.equal(lower.length,2);
    assert(Math.abs(lower[0][2]-lower[1][2])<1e-12);assert(Math.abs(lower[0][1]+lower[1][1]-2*center[0])<1e-12);
    assert(Math.abs(top[0][2]-center[1]-.946*radius)<1e-10);
  }
  for(const side of [-1,1]){
    r.faces=[];utilityWheelSpokes(r,{vehicle:'g500',x:0,y:0,z:0,side,rim:.2286,finish:'#adb7b6'});
    const highlights=r.faces.filter(f=>f.color==='#e2e4df');
    assert.equal(highlights.length,3);
    const up=highlights.flatMap(f=>f.points).filter(p=>p[2]>.026);
    assert.equal(up.length,1);assert.equal(up[0][0],0);
  }
});
test('the 2003 E46 windshield curves in plan and shares the roof crown',()=>{
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null,lights:false});
  buildBmwExterior(r,'#58634d');
  const glass=r.faces.filter(f=>f.rigid?.name==='windshield'&&f.opacity<1);
  assert(glass.length>=32);
  const verts=glass.flatMap(f=>f.points),center=verts.filter(p=>Math.abs(p[1])<1e-6),outer=verts.filter(p=>Math.abs(p[1])>.60);
  assert(Math.max(...center.map(p=>p[2]))-Math.max(...outer.map(p=>p[2]))>.038);
  assert(Math.min(...outer.map(p=>p[0]))-Math.min(...center.map(p=>p[0]))>.03);
  // A loop rather than a spread: the detailed shell has more vertices than the
  // engine accepts as call arguments.
  let roofTop=-Infinity;for(const f of r.faces)for(const p of f.points)roofTop=Math.max(roofTop,p[2]);
  assert(Math.abs(roofTop-.040-1.369)<.001);
});
test('exterior photo references and real transparent surfaces are available for every road model',()=>{
  for(const vehicle of ['g500','bmw325ci','c63','hrv','f350','porsche993cab','porsche992scab','bmws1000rr']){
    assert.match(VEHICLES[vehicle].photoReference.url,/^https:\/\//);
    const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,paint:'silver',finish:'silver',parts:[]},faces:[],lights:false,inspection:{assembly:null},schematic:true});
    r.buildMesh();const glass=r.faces.filter(f=>f.opacity>0&&f.opacity<1);
    assert(glass.length>8,vehicle);
    assert(glass.every(f=>/glass|windshield|screen|headlamp/.test(f.part) ||
      (vehicle.startsWith('porsche')&&f.part==='roof.rear-window') ||
      (vehicle==='bmws1000rr'&&f.part==='body.lamps') ||
      (vehicle==='bmw325ci' && /^(lighting\.(indicator|fog)|body\.quarter-(left|right))$/.test(f.part)) ||
      (vehicle==='g500' && /^lighting\.h4-(left|right)$/.test(f.part) && f.color==='#c3d2d0') ||
      (vehicle==='g500' && /^(lighting\.(fog-|tail-|repeater-)(left|right)|lighting\.indicator)$/.test(f.part))),vehicle);
  }
});
