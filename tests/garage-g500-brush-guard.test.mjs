import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildG500Exterior} from '../garage/exterior-g500.js';
import {drawAccessories} from '../garage/accessory-geometry.js';
import {G500_FRONT} from '../garage/g500-lamps.js';
import {sanitizeBuild} from '../garage/model.js';

test('the 2002 guard encloses both lamp bays and keeps the star, lenses, fog lights and plate visible',()=>{
  const build=sanitizeBuild({vehicle:'g500',parts:['g500-field-guard']});
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    build,faces:[],inspection:{},lights:true,schematic:false,
    canvas:{getBoundingClientRect:()=>({left:0,top:0})},
    project:([x,y,z])=>({x:y,y:z,depth:-x})
  });
  const frontHit=([y,z])=>r.surfaceAt(y,z)?.face.part;
  buildG500Exterior(r,'#758076');
  const openings=[[0,1.007],[0,1.133],[0,.881],[0,.606]];
  for(const side of [-1,1]){
    for(const [y,z] of [[.674,1.001],[.674,1.128],[.674,.874],[.550,1.001],[.795,1.001],[.598,.553]]){
      openings.push([side*y,z]);
    }
  }
  const stock=openings.map(frontHit);
  assert(stock.every(Boolean));
  const stockFaceCount=r.faces.length;
  drawAccessories(r,build,'#758076');
  assert.deepEqual(openings.map(frontHit),stock);
  for(const z of [.820,1.175]){
    for(const y of [-.79,-.66,-.23,0,.23,.66,.79])assert.equal(frontHit([y,z]),'accessories.guard');
  }
  assert.equal(frontHit([0,.488]),'accessories.guard');
  const guard=r.faces.slice(stockFaceCount);
  assert(guard.every(f=>f.part==='accessories.guard'&&f.points.every(p=>p.every(Number.isFinite))));
  const bumperFace=G500_FRONT-.116;
  for(const side of [-1,1]){
    // Both fork cheeks cross the flat bumper wall inboard of the fog opening.
    const mount=guard.filter(f=>f.points.every(([,y,z])=>y*side>.38&&y*side<.4835&&z<.65));
    const joined=mount.filter(f=>f.points.some(([x])=>x>bumperFace)&&f.points.some(([x])=>x<bumperFace));
    assert(new Set(joined.flatMap(f=>f.points.map(p=>p[1]))).size>=4);
  }
});
