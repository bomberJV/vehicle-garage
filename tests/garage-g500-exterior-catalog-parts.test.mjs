import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {G500_BODY_PARTS} from '../garage/exterior-g500.js';

const faces=GarageRenderer.assembledFaces(sanitizeBuild({vehicle:'g500'}));
const drawn=new Set(faces.map(f=>f.part));

test('every exterior part split from the body shell is drawn and sourced',()=>{
  const split=['rub-strips','wheelhouses','wheel-flares','wing-intakes','v8-badges','running-boards','cowl','wipers','rear-plate-panel','licence-lamps'];
  for(const key of split){
    const part=G500_BODY_PARTS.find(p=>p.id==='body.'+key);
    assert.ok(part,key);assert.ok(drawn.has(part.id),key);
    assert.match(part.source.url,/^https:\/\/classicparts\.mbusa\.com\/v-2002-mercedes-benz-g500/);
  }
});

test('catalog-numbered exterior parts carry their Mercedes part number and diagram',()=>{
  const numbered=G500_BODY_PARTS.filter(p=>/ · \d{3}-\d{3}-\d{2}-\d{2}/.test(p.name));
  assert.ok(numbered.length>=45,`${numbered.length} numbered parts`);
  const numbers=new Set();
  for(const p of numbered){
    assert.ok(drawn.has(p.id),p.id);
    assert.match(p.source.url,/^https:\/\/www\.mbpartsgiant\.com\/parts-list\/2002-mercedes_benz-g500\//,p.id);
    const pn=p.name.match(/(\d{3}-\d{3}-\d{2}-\d{2})/)[1];
    assert.ok(!numbers.has(pn),`${pn} is used once`);numbers.add(pn);
  }
});

test('left and right catalog parts sit on their own side of the car',()=>{
  for(const p of G500_BODY_PARTS.filter(p=>/-(left|right)$/.test(p.id))){
    const sign=p.id.endsWith('left')?-1:1;
    const ys=faces.filter(f=>f.part===p.id).flatMap(f=>f.points.map(q=>q[1]));
    // The fender halves meet the nose panel on the centerline, so test the bulk of each part.
    assert.ok(ys.length&&ys.filter(y=>sign*y>0).length/ys.length>.9&&ys.every(y=>sign*y>=-1e-9),p.id);
  }
});
