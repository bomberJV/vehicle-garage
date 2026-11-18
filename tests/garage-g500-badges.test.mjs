import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildG500Exterior} from '../garage/exterior-g500.js';
import {g500SpareStar} from '../garage/g500-body-closures.js';
import {drawLettering,letteringWidth} from '../garage/badge-lettering.js';

const exterior=()=>{const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null,lights:true});buildG500Exterior(r,'#58634d');return r.faces;};

test('a chrome V8 script sits on each front wing, below the rub strip and ahead of the door',()=>{
  const faces=exterior();
  for(const side of [-1,1]){
    const v8=faces.filter(f=>f.part==='body.v8-badges'&&f.points.every(([x,y,z])=>x>-.85&&x<-.75&&z>.88&&z<.92&&side*y>.889&&side*y<.897));
    assert(v8.length>40,`side ${side}: ${v8.length} lettering faces`);
    const pts=v8.flatMap(f=>f.points);
    assert(Math.max(...pts.map(p=>p[2]))<.975,'below the rub strip');
    assert(Math.max(...pts.map(p=>p[0]))<-.747,'ahead of the front door');
  }
});

test('the stainless spare face carries the star left of a Mercedes-Benz wordmark',()=>{
  const spare=exterior().filter(f=>f.part==='body.spare-emblem');
  const word=spare.filter(f=>f.points.every(([x,y,z])=>x>2.44&&y>g500SpareStar.center[0]+g500SpareStar.radius&&Math.abs(z-1.056)<.03));
  assert(word.length>100,`${word.length} wordmark faces`);
  const ys=word.flatMap(f=>f.points.map(p=>p[1]));
  // The lettering alone now carries this part, so its span is the wordmark width.
  assert(Math.abs(Math.max(...ys)-Math.min(...ys)-letteringWidth('Mercedes-Benz',.036))<.01,'wordmark spans its lettering width');
  assert(Math.max(...ys)<-.115+.335&&g500SpareStar.center[0]-g500SpareStar.radius>-.115-.335,'badge stays on the face');
});

test('badge lettering refuses glyphs it cannot draw',()=>{
  assert.throws(()=>drawLettering({rod(){}},'Q',.03,(u,v)=>[u,0,v]));
  assert(letteringWidth('V8',.03)>.03);
});
