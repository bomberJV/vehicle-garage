// The 2014 SL550's accessories: real R231 parts pinned to their sources, and
// fitted previews placed from the car's own lid, plate recess and footwells.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {accessoriesFor,FIELD_ACCESSORIES} from '../garage/accessory-catalog.js';
import {sl550AccessoryAudit} from '../garage/sl550-accessories.js';
import {slPlatePlane,slSpoilerSection,slSpoilerSpan,slMatBounds,slPlateFrameFront} from '../garage/sl550-accessory-geometry.js';
import {slDeckCameraMount,slDeckCrown} from '../garage/sl550-exterior.js';
import {slDeckPoint} from '../garage/sl550-roof.js';
import {drawAccessories} from '../garage/accessory-geometry.js';
import {getAssembly,getComponent} from '../garage/assemblies.js';
import {accounting,importBuild,sanitizeBuild,togglePart} from '../garage/model.js';
import {GarageRenderer} from '../garage/render.js';
import {voiceKey} from '../shared/narration-voice.js';

const vehicle='sl550',listed=accessoriesFor(vehicle);
const audit=new Map(sl550AccessoryAudit.map(a=>[a.id,a]));
const ids=listed.map(a=>a.id);
function faces(parts,extra={}){
  const build=sanitizeBuild({vehicle,parts});
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],inspection:{},schematic:false,lights:true,build,...extra});
  drawAccessories(r,build,'#a1a6a7');
  return r.faces;
}
const points=(list,part)=>list.filter(f=>f.part===part).flatMap(f=>f.points);

test('every SL550 accessory is a sourced R231 part recorded in the audit',()=>{
  assert(listed.length>=4&&listed.length<=6,'a range of four to six');
  assert.deepEqual([...ids].sort(),[...audit.keys()].sort());
  for(const a of listed){
    const row=audit.get(a.id);
    assert.equal(a.sku,row.sku,a.id);assert.equal(a.source.url,row.source,a.id);
    assert(row.states.includes(a.sku.replace(/ /g,''))||row.states.includes(a.sku),`${a.id}: the source text names ${a.sku}`);
    assert.match(a.url,/^https:\/\//);assert.match(a.source.url,/^https:\/\//);
    if(row.approximate)assert(/approximation/.test(a.description),`${a.id} says what is approximate`);
    assert(FIELD_ACCESSORIES.includes(a)&&a.fieldKind,a.id);
  }
  // No roof racks or brush guards for a folding-hardtop roadster, and the
  // standard power windblocker is not sold again as an accessory.
  for(const a of listed)assert(!/roof rack|brush guard|guard|wind deflector|draught/i.test(a.kind+' '+a.name),a.id);
  assert(listed.filter(a=>a.category==='exterior').length>=3);
});

test('the plate frames replace each other; the handle and spoiler stay independent',()=>{
  const both=togglePart(togglePart({vehicle},'sl550-plate-frame'),'sl550-plate-frame-slim');
  assert.deepEqual(both.parts,['sl550-plate-frame-slim']);
  const all=['sl550-rear-spoiler','sl550-trunk-handle','sl550-plate-frame','sl550-all-season-mats'].reduce((b,id)=>togglePart(b,id),sanitizeBuild({vehicle}));
  assert.equal(all.parts.length,4);
  assert.deepEqual(importBuild(JSON.stringify(all)),all);
  assert.equal(accounting(all).lines.length,4);
  assert.equal(getAssembly(vehicle,'accessories',all.parts).parts.length,4);
  for(const a of listed.filter(a=>all.parts.includes(a.id)))assert.equal(getComponent(vehicle,'accessories.'+a.fieldKind,all.parts).name,a.name);
  for(const id of ids)assert.deepEqual(togglePart({vehicle:'c63'},id).parts,[],id);
});

test('each preview draws only its own mesh',()=>{
  for(const a of listed){
    const list=faces([a.id]);
    assert(list.length>0,a.id);
    assert.deepEqual([...new Set(list.map(f=>f.part))],['accessories.'+a.fieldKind]);
  }
});

test('the spoiler sits on the trunk-lid crown above the center brake light',()=>{
  for(let i=0;i<=20;i++){
    const k=-slSpoilerSpan+2*slSpoilerSpan*i/20,{base,top}=slSpoilerSection(k);
    base.forEach((p,j)=>{
      const lid=slDeckCrown([2.150,2.200,2.245,2.285,2.32214][j],k);
      assert(p[2]-lid[2]>0&&p[2]-lid[2]<.003,'base rests on the lid');
      assert(top[j][2]>=p[2]);
    });
    assert(top.at(-1)[2]-base.at(-1)[2]>.008,'a raised lip at the trailing edge');
  }
  const lip=points(faces(['sl550-rear-spoiler']),'accessories.slSpoiler');
  assert(lip.filter(p=>Math.abs(p[1])<.30).every(p=>p[2]>.934),'clear of the brake light (z .925–.934)');
  assert(Math.max(...lip.map(p=>Math.abs(p[1])))<.60,'inside the lid width');
  assert(Math.max(...lip.map(p=>p[0]))<2.23);
});

test('frames and handle sit on the US plate, proud of the recess and below the camera',()=>{
  const list=faces(['sl550-plate-frame','sl550-trunk-handle']);
  for(const part of ['accessories.slPlateFrame','accessories.slTrunkHandle']){
    const pts=points(list,part).filter(p=>p[2]>.62&&p[2]<.82);
    assert(pts.length>40,part);
    for(const p of pts){
      const gap=p[0]-slDeckCameraMount(p[1],p[2])[0];
      assert(gap>.004&&gap<.03,`${part} at ${p.map(v=>v.toFixed(3))}: ${gap.toFixed(4)} m from the lid face`);
    }
  }
  const frame=points(list,'accessories.slPlateFrame');
  assert(Math.max(...frame.map(p=>Math.abs(p[1])))<.161,'within the plate backing');
  assert(Math.min(...frame.map(p=>p[2]))>=.645,'clear of the recess floor');
  const handle=points(list,'accessories.slTrunkHandle');
  assert(Math.max(...handle.map(p=>p[2]))<.817,'below the rear-view camera');
  assert(Math.min(...handle.map(p=>p[2]))>.79);
  // The plate itself is at 8 mm; the frame lies in front of it.
  const plate=slPlatePlane(0,.73,.008)[0];
  assert(frame.every(p=>p[0]-slPlatePlane(p[1],p[2])[0]>.008-1e-9));
  assert(slPlatePlane(0,.73,slPlateFrameFront)[0]>plate);
});

test('lid pieces travel with the reverse-opening lid while the hardtop folds',()=>{
  const parts=['sl550-rear-spoiler','sl550-trunk-handle','sl550-plate-frame'];
  const closed=faces(parts),moving=faces(parts,{slRoofFraction:.2});
  assert.equal(closed.length,moving.length);
  let moved=0;
  closed.forEach((f,i)=>f.points.forEach((p,j)=>{
    // Badge rods are built around posed end points, hence the small tolerance.
    const q=moving[i].points[j],expected=slDeckPoint(p,.2);
    for(let k=0;k<3;k++)assert(Math.abs(q[k]-expected[k])<.0015);
    moved=Math.max(moved,Math.hypot(...q.map((v,k)=>v-p[k])));
  }));
  assert(moved>.05,'the lid swings open');
  const down=faces(parts,{build:sanitizeBuild({vehicle,parts,roofPosition:'down'})});
  closed.forEach((f,i)=>assert.deepEqual(down[i].points,f.points),'the closed lid pose is the same with the roof up or down');
});

test('the all-season mats rest on the footwell floor ahead of the seats',()=>{
  const mat=points(faces(['sl550-all-season-mats']),'accessories.slMats');
  const floor=x=>x<=-.365?.254+(-.365-x)*(.046/.095):x<-.355?.254+(x+.365):.264;
  for(const p of mat){
    const lift=p[2]-floor(p[0]);
    assert(lift>-.0005&&lift<.020,`mat at ${p.map(v=>v.toFixed(3))} is ${lift.toFixed(4)} m off the floor`);
  }
  assert(Math.max(...mat.map(p=>p[0]))<0,'ahead of the seat rails');
  assert(mat.every(p=>Math.abs(p[1])>=slMatBounds.inner-1e-9&&Math.abs(p[1])<=slMatBounds.outer+1e-9),'between the console and the sills');
});

test('every new SL550 accessory string has a narration voice entry',()=>{
  const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url),'utf8'));
  for(const a of listed)for(const text of [a.name,a.description,a.fit,a.kind,a.source.label])assert(bank[voiceKey(text)],text);
});
