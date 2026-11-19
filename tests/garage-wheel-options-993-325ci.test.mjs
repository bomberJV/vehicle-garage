import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {GarageRenderer} from '../garage/render.js';
import {wheelOptions,wheelDesign} from '../garage/wheel-designs.js';
import {voiceKey} from '../shared/narration-voice.js';

const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url)));
function faces(vehicle,wheelDesign){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,paint:'silver',finish:'silver',parts:[],wheelDesign},faces:[],lights:false,inspection:{assembly:null},schematic:true});
  r.buildMesh();return r.faces;
}
const rimFaces=list=>list.filter(f=>['wheels.rim','running.rims'].includes(f.part));
const tyreRadius=(list,corner)=>{
  const pts=list.filter(f=>f.instance===corner&&/tire|tyre/.test(f.part)).flatMap(f=>f.points);
  return (Math.max(...pts.map(p=>p[2]))-Math.min(...pts.map(p=>p[2])))/2;
};

test('the stock wheels stay the default; the period 17-inch wheels are options',()=>{
  const p993=wheelOptions('porsche993cab'),e46=wheelOptions('bmw325ci');
  assert.equal(p993[0].id,'stock');assert.equal(p993[0].frontDiameter,16);
  assert.equal(e46[0].id,'stock');assert.equal(e46[0].name,'Star Spoke 43');assert.equal(e46[0].frontDiameter,16);
  assert.equal(wheelDesign('porsche993cab','old').id,'stock');assert.equal(wheelDesign('bmw325ci','old').id,'stock');
});

test('the 17-inch Cup Design ’93 option carries its Porsche numbers and tyre sizes',()=>{
  const cup=wheelDesign('porsche993cab','cupii');
  assert.match(cup.name,/Cup Design ’93/);
  assert.equal(cup.partNumber,'993.362.124.00 front / 993.362.128.00 rear');
  assert.match(cup.fitment,/205\/50 ZR17/);assert.match(cup.fitment,/255\/40 ZR17/);
  assert.doesNotMatch(cup.fitment,/Option 398/);
  assert.match(wheelDesign('porsche993cab','sportclassic').fitment,/255\/40 ZR17/);
});

test('the 325Ci Sport Package Star Spoke 44 option is a square 8J × 17 seven-spoke wheel',()=>{
  const s44=wheelDesign('bmw325ci','style44');
  assert.equal(s44.partNumber,'36 11 1 094 506');
  assert.equal(s44.frontDiameter,17);assert.equal(s44.rearDiameter,17);
  assert.match(s44.fitment,/8J × 17 ET47/);assert.match(s44.fitment,/225\/45 R17/);
  assert.match(wheelDesign('bmw325ci','style68').fitment,/330Ci Sport Package/);
  const stock=faces('bmw325ci','stock'),chosen=faces('bmw325ci','style44');
  const corners=['front-left','front-right','rear-left','rear-right'];
  assert.deepEqual([...new Set(rimFaces(chosen).map(f=>f.instance))].sort(),corners);
  assert.notDeepEqual(rimFaces(chosen).map(f=>f.points),rimFaces(stock).map(f=>f.points));
  // 225/45 R17 is 316.6 mm in radius; the stock 205/55 R16 is 315.9 mm.
  for(const corner of corners){const r=tyreRadius(chosen,corner);if(Number.isFinite(r))assert(Math.abs(r-.3166)<.006,corner+' '+r);}
});

test('the 993 draws every option on all four corners',()=>{
  for(const option of wheelOptions('porsche993cab')){
    const rims=rimFaces(faces('porsche993cab',option.id));
    assert.equal(new Set(rims.map(f=>f.instance)).size,4,option.id);
    assert(rims.every(f=>f.points.every(p=>p.every(Number.isFinite))),option.id);
  }
});

test('new wheel names and fitment lines are narrated',()=>{
  for(const [vehicle,id] of [['bmw325ci','style44'],['bmw325ci','style68'],['porsche993cab','cupii'],['porsche993cab','sportclassic']]){
    const w=wheelDesign(vehicle,id);
    for(const line of [w.name,w.description,w.fitment])assert(bank[voiceKey(line)],line);
  }
});
