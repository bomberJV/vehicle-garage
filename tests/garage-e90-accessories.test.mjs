// Genuine BMW accessories for the 2008 328xi sedan, each with a fitted preview
// seated on the E90 shell (hub #306).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {accessoriesFor} from '../garage/accessory-catalog.js';
import {e90AccessoryAudit} from '../garage/e90-accessory-options.js';
import {E90_BAR_X} from '../garage/e90-accessory-geometry.js';
import {drawAccessories} from '../garage/accessory-geometry.js';
import {getComponent} from '../garage/assemblies.js';
import {accounting,importBuild,sanitizeBuild,togglePart} from '../garage/model.js';
import {GarageRenderer} from '../garage/render.js';
import {e90RoofHeight,e90RoofHalf,e90DeckHeight} from '../garage/e90-sedan-shell.js';
import {cabinFloorTop} from '../garage/floor-trim.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

const vehicle='bmw328xi',paint='#58634d';
const listed=accessoriesFor(vehicle);
const roofIds=['b90-roof-rack','b90-ski-holder','b90-bike-holder','b90-roof-box'];
function draw(id){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],lights:true,inspection:{},build:{vehicle,parts:[id],paint}});
  drawAccessories(r,r.build,paint);
  return r.faces;
}
const points=faces=>faces.flatMap(f=>f.points);

test('every 328xi accessory has a part number, an https source and an E90 fit, matched to its audit row',()=>{
  assert.deepEqual(listed.map(a=>a.id).sort(),e90AccessoryAudit.map(a=>a.id).sort());
  assert(listed.length>=4&&listed.length<=6);
  for(const a of listed){
    const row=e90AccessoryAudit.find(x=>x.id===a.id);
    assert.match(a.sku,/\d\d \d\d \d \d{3} \d{3}/,a.id);
    assert(a.sku.endsWith(row.sku),a.id);
    assert(row.states.includes(row.sku)||row.states.includes(row.sku.replaceAll(' ','')),`${a.id}: the source text names ${row.sku}`);
    for(const url of [a.url,a.source.url,row.source,...(row.also||[])])assert.match(url,/^https:\/\//,a.id);
    assert.equal(a.source.url,row.source,a.id);
    assert(/E90|328xi/.test(a.fit)||/E90/.test(row.states),a.id);
    assert(/approximation/.test(a.description),`${a.id} says what is approximate`);
    assert.equal(a.price,null);
  }
  // Brandon's standard: things a sedan owner fits, no off-road kit.
  assert(!listed.some(a=>/ladder|brush guard|snorkel|bull bar/i.test(a.name)));
});

test('each accessory draws its own inspectable faces when fitted',()=>{
  for(const a of listed){
    const build=togglePart(sanitizeBuild({vehicle}),a.id),faces=draw(a.id);
    assert(faces.length>60,a.id);
    assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(['accessories.'+a.fieldKind]));
    for(const f of faces){
      assert.match(f.color,/^#[0-9a-f]{6}$/i,a.id);
      assert(f.points.flat().every(Number.isFinite),a.id);
      assert(faceTriangles(f.points).length>=3,a.id+' has a zero-area face');
    }
    assert.equal(getComponent(vehicle,'accessories.'+a.fieldKind,build.parts).name,a.name);
    assert.deepEqual(accounting(build).unknown,[a.id]);
    assert.deepEqual(importBuild(JSON.stringify(build)),build);
    assert.equal(draw('nothing').length,0);
  }
});

test('the roof setups stand on the roof inside the body width and replace each other',()=>{
  for(const id of roofIds){
    const ps=points(draw(id));
    for(const [x,y,z] of ps){
      assert(x>-.50&&x<1.50&&Math.abs(y)<.9085&&z<2.50,`${id} stays above the roof: ${[x,y,z]}`);
      if(x>-.12&&x<1.12&&Math.abs(y)<e90RoofHalf(x))assert(z>=e90RoofHeight(x,y)-.001,`${id} does not sink into the roof at ${[x,y,z]}`);
    }
    // The feet reach the roof beside the drip strips at both crossbars.
    for(const bar of E90_BAR_X)for(const side of [-1,1]){
      const feet=ps.filter(([x,y])=>Math.abs(x-bar)<.04&&side*y>.55);
      assert(feet.length,id);
      assert(Math.min(...feet.map(([x,y,z])=>z-e90RoofHeight(x,Math.min(Math.abs(y),e90RoofHalf(x)))))<.004,`${id} foot rests on the roof`);
    }
  }
  const box=points(draw('b90-roof-box')),extent=k=>Math.max(...box.map(p=>p[k]))-Math.min(...box.map(p=>p[k]));
  const shell=box.filter(p=>p[2]>1.545&&Math.abs(p[1])<.4);
  assert(Math.abs(Math.max(...shell.map(p=>p[0]))-Math.min(...shell.map(p=>p[0]))-1.91)<.005);
  assert(Math.abs(2*Math.max(...shell.map(p=>Math.abs(p[1])))-.64)<.01);
  assert(extent(2)<.62);
  let build=sanitizeBuild({vehicle});
  for(const id of roofIds){build=togglePart(build,id);assert.deepEqual(build.parts,[id]);}
  build=togglePart(build,'b90-rear-spoiler');
  assert.deepEqual(build.parts,['b90-roof-box','b90-rear-spoiler']);
  assert.deepEqual(sanitizeBuild({vehicle,parts:['b90-ski-holder','b90-bike-holder']}).parts,['b90-ski-holder']);
});

test('the spoiler sits on the lid trailing edge and the mats lie on the front floor',()=>{
  const lip=points(draw('b90-rear-spoiler'));
  for(const [x,y,z] of lip){
    const deck=e90DeckHeight(x,y);
    assert(deck!=null,`spoiler point over the lid: ${[x,y,z]}`);
    assert(z>=deck-.0005&&z<deck+.03,`spoiler hugs the lid at ${[x,y,z]}`);
  }
  assert(Math.min(...lip.map(p=>p[0]))>2.1&&Math.max(...lip.map(p=>Math.abs(p[1])))<.6);
  const mats=draw('b90-rubber-mats');
  for(const f of mats){
    const c=[0,1,2].map(k=>f.points.reduce((s,p)=>s+p[k],0)/f.points.length);
    const floor=cabinFloorTop(vehicle,c[0],c[1]);
    assert(floor!=null&&c[2]>floor-.002&&c[2]<floor+.045,`mat face on the floor at ${c}`);
  }
  const ps=points(mats);
  assert(ps.some(p=>p[1]<-.4)&&ps.some(p=>p[1]>.4)&&ps.every(p=>p[0]<0&&p[0]>-.8));
});
