import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {measureStockMesh} from '../garage/factory-dimensions.js';
import {DEFAULT_BUILD} from '../garage/model.js';

test('stock G500 rendered extrema reproduce the six measurements on p.360 of the 2002 US manual',()=>{
  const faces=GarageRenderer.assembledFaces(DEFAULT_BUILD);
  const {mm,min,max}=measureStockMesh('g500',faces);
  assert.deepEqual(mm,{length:4715,width:2007,height:1977,wheelbase:2850,frontTrack:1515,rearTrack:1515});
  function reaches(part,axis,value){
    return faces.some(f=>f.part===part && f.points.some(p=>Math.abs(p[axis]-value)<1e-9));
  }
  assert(reaches('body.spare',0,max[0]));
  assert(reaches('body.door',1,min[1]));
  assert(reaches('body.front-right',1,max[1]));
  assert(reaches('wheels.tire',2,min[2]));
});
