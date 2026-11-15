import assert from 'node:assert/strict';
import test from 'node:test';
import {studioPaintReflection,studioSurfaceFinish} from '../garage/studio-finish.js';

test('a fixed R231 panel reflects a changing eye angle and keeps the selected paint hue',()=>{
  const blue=[30,65,119],normal=[0,.8,.6];
  const across=studioPaintReflection(blue,normal,[0,1,0]);
  const low=studioPaintReflection(blue,normal,[.8,.6,0]);
  assert.notDeepEqual(across,low);
  for(const sample of [across,low])assert(sample[2]>sample[1]&&sample[1]>sample[0]);
});
test('the R231 glass brightens at grazing angles without changing the selected tint or panel opacity',()=>{
  const face={part:'roof.sky-glass',points:[[0,0,0],[1,0,0],[0,1,0]],opacity:.63};
  const tint=[25,31,46],overhead=studioSurfaceFinish(face,tint,[0,0,1]),edge=studioSurfaceFinish(face,tint,[0,1,0]);
  assert(edge.every((x,i)=>x>overhead[i]));
  assert.equal(face.opacity,.63);
  assert.equal(studioSurfaceFinish({...face,part:'roof.hydraulics'},tint,[0,1,0]),tint);
});
