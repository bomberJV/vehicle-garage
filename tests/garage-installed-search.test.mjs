import test from 'node:test';
import assert from 'node:assert/strict';
import {installedPartId} from '../garage/installed-part.js';
import {findInVehicle} from '../garage/inspection-search.js';
import {GarageRenderer} from '../garage/render.js';
import {DEFAULT_BUILD,sanitizeBuild} from '../garage/model.js';

test('G500 whole-vehicle searches focus the installed system even when an engine-bay name ranks first',()=>{
  const actual=new Set(GarageRenderer.assembledFaces(sanitizeBuild({...DEFAULT_BUILD,vehicle:'g500'})).map(face=>face.part));
  const cases=[
    ['air conditioner','hvac.compressor'],['A/C compressor','hvac.compressor'],
    ['steering wheel adjustment','column-adjustment.reach-motor'],['driver seat heater','seat-heating.front-left-cushion']
  ];
  for(const [query,expected] of cases){
    const [hit]=findInVehicle('g500',query);
    assert.equal(hit.path.length,0,query);
    assert.equal(installedPartId('g500',hit.part),expected,query);
    assert(actual.has(expected),expected);
  }
});
