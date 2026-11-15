import test from 'node:test';
import assert from 'node:assert/strict';
import {sectionFaces} from '../garage/section-plane.js';

test('section slider removes the nearer half, preserves pick identities, and accepts either side',()=>{
 const f={part:'floor.carpet',instance:'left',color:'#888888',motionKey:'carpet:left',
  points:[[-2,-1,0],[2,-1,0],[2,1,0],[-2,1,0]],vertexColors:['#000000','#ffffff','#ffffff','#000000']};
 for(const reverse of [true,false]){
  const clipped=sectionFaces([f],{axis:0,reverse,percent:50});
  assert(clipped.length>0);assert(clipped.every(t=>t.part===f.part&&t.instance===f.instance&&t.motionKey===f.motionKey));
  for(const t of clipped)t.points.forEach((p,i)=>{assert(reverse?p[0]>=0:p[0]<=0);if(p[0]===0)assert.equal(t.vertexColors[i],'#808080');});
 }
 assert.deepEqual(sectionFaces([f],{axis:1,reverse:true,percent:100}),[f]);
});
