import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {measureStockMesh} from '../garage/factory-dimensions.js';

const vehicle='porsche993cab',up=GarageRenderer.assembledFaces({vehicle,roofPosition:'up',parts:[]});
const wheels=measureStockMesh(vehicle,up).wheels;
const points=(faces,id)=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
const near=(a,b,tolerance=.0001)=>assert(Math.abs(a-b)<tolerance,`${a} versus ${b}`);

test('1998 Carrera 16-inch Cup Design ’93 has the 7J and 9J barrels, five nuts and a 130 mm bolt circle',()=>{
  for(const [instance,c] of Object.entries(wheels)){
    const faces=up.filter(f=>f.part==='running.rims'&&f.instance===instance),vertices=faces.flatMap(f=>f.points);
    const nuts=faces.filter(f=>f.points.length===6&&f.color==='#44494c');assert.equal(nuts.length,5);
    for(const nut of nuts){const center=[0,2].map(k=>nut.points.reduce((v,p)=>v+p[k]/6,0));near(Math.hypot(center[0]-c[0],center[1]-c[2]),.065);}
    const lateral=vertices.map(p=>p[1]);near(Math.max(...lateral)-Math.min(...lateral),(instance.startsWith('rear')?9:7)*.0254+.013);
  }
});

test('993 side glass meets the cloth sail, and the additional stop lamp stays fixed in both roof positions',()=>{
  const down=GarageRenderer.assembledFaces({vehicle,roofPosition:'down',parts:[]});
  const window=up.filter(f=>f.part==='cabin.windshield'&&f.roofServicePart&&f.opacity);
  assert(window.length>=6);assert(Math.max(...window.flatMap(f=>f.points.map(p=>p[0])))<.57);
  const hem=up.filter(f=>f.part==='roof.rear-window'&&f.opacity).flatMap(f=>f.points);
  assert(Math.max(...hem.map(p=>p[0]))>1.19);assert(Math.min(...hem.map(p=>p[0]))>.74);
  const bridge=points(up,'lights.high-stop');assert(bridge.length);assert.deepEqual(points(down,'lights.high-stop'),bridge);
  const leading=Math.min(...points(up,'shell.spoiler').map(p=>p[0]));
  assert(Math.max(...bridge.map(p=>p[0]))<leading);
  const detail=getDetail(vehicle,'lights.high-stop');assert.equal(detail.componentIndex.size,4);
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});detail.draw(r);
  const bulbs=r.faces.filter(f=>f.part==='993highstop.bulbs');assert.equal(new Set(bulbs.map(f=>f.instance)).size,24);
  assert.equal(getDetail('porsche992scab','lights.high-stop'),null);
});
