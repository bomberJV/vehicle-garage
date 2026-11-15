import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {drawSLMovingAccess,trunkLockStudy} from '../garage/sl550-access.js';
import {drawSLRearCamera} from '../garage/sl550-assist.js';
import {slDeckCameraMount} from '../garage/sl550-exterior.js';
import {slDeckPoint} from '../garage/sl550-roof.js';

function faces(draw){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
 draw(r);
 return r.faces;
}
test('the trunk latch and the exterior release travel rigidly with the deck during the roof cycle',()=>{
 const closed=faces(r=>drawSLMovingAccess(r,0));
 const open=faces(r=>drawSLMovingAccess(r,.55));
 assert.deepEqual(new Set(open.map(f=>f.part)),new Set(['access.trunk','access.handle']));
 assert.deepEqual(open.map(f=>f.points),closed.map(f=>f.points.map(p=>slDeckPoint(p,.55))));
 assert.notDeepEqual(open.map(f=>f.points),closed.map(f=>f.points));
});
test('the rearview lens has an open sightline past the release handle',()=>{
 const camera=faces(r=>drawSLRearCamera(r,0));
 const handle=faces(r=>drawSLMovingAccess(r,0)).filter(f=>f.part==='access.handle');
 const [cx,,cz]=slDeckCameraMount(),axisLength=Math.hypot(.91,.415);
 const lens=camera.flatMap(f=>f.points).filter(([x,y,z])=>{
  const along=(.91*(x-cx)-.415*(z-cz))/axisLength;
  const across=Math.hypot(y,(.415*(x-cx)+.91*(z-cz))/axisLength);
  return Math.abs(along-.012)<1e-8&&across<.0065;
 });
 assert(lens.length>0);
 for(const [x,y,z] of lens){
  const hits=handle.filter(f=>f.points.some(p=>p[0]>=x)&&
    Math.min(...f.points.map(p=>p[1]))<=y&&Math.max(...f.points.map(p=>p[1]))>=y&&
    Math.min(...f.points.map(p=>p[2]))<=z&&Math.max(...f.points.map(p=>p[2]))>=z);
  assert.equal(hits.length,0);
 }
});
test('the latch cycles back to its installed position while the striker and housing stand still',()=>{
 const render=t=>faces(r=>trunkLockStudy.draw(r,t));
 const start=render(0),middle=render(.5);
 assert.deepEqual(start,render(1));
 assert.deepEqual(start.filter(f=>!f.part.endsWith('.jaw')),middle.filter(f=>!f.part.endsWith('.jaw')));
 assert.notDeepEqual(start.filter(f=>f.part.endsWith('.jaw')),middle.filter(f=>f.part.endsWith('.jaw')));
});
