import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {drawG500ServiceAssembly,getG500ServiceAssemblies} from '../garage/g500-service-systems.js';

function mesh(id){const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});drawG500ServiceAssembly(r,'g500',id);return r.faces;}
function bounds(faces,id){const p=faces.filter(f=>f.part===id).flatMap(f=>f.points);assert(p.length,id);return [0,1,2].map(i=>[Math.min(...p.map(q=>q[i])),Math.max(...p.map(q=>q[i]))]);}

test('the post-2000 cabin battery and nearby fuse block occupy separate volumes',()=>{
 const fs=mesh('electrical'),[bx,by,bz]=bounds(fs,'electrical.battery'),[fx,,fz]=bounds(fs,'electrical.battery-box');
 // Leads extend outside the case, but the whole assembly stays centrally ahead of the rear seat.
 assert(bx[0]>.35&&bx[1]<1.05);assert(by[0]>-.25&&by[1]<.30);assert(bz[0]>.45&&bz[1]<.80);
 // The distribution block is in front of the battery case, not occupying its body.
 assert(fx[1]<.537);assert(fz[1]<.80);
 assert(fs.some(f=>f.part==='electrical.battery'&&f.points.some(p=>Math.abs(p[0]-.482)<.015&&Math.abs(p[1]+.074)<.015&&Math.abs(p[2]-.754)<.015)));
});

test('the fuse carriers remain on the correct side and inside the passenger body',()=>{
 const fs=mesh('electrical'),dashboard=bounds(fs,'electrical.dashboard'),footwell=bounds(fs,'electrical.footwell'),tunnel=bounds(fs,'electrical.tunnel');
 assert(dashboard[1][0]>-.855&&dashboard[1][1]<-.60,'driver dashboard carrier must not protrude through the door');
 assert(footwell[0][1]<0&&footwell[1][0]>0&&footwell[2][0]>.64,'front passenger footwell');
 assert(tunnel[0][0]>0&&tunnel[1][0]>0&&tunnel[1][1]<.25,'passenger side of middle tunnel');
});

test('tank, pump and filter fit behind the axle and above the separate shield',()=>{
 const fs=mesh('fuel'),tank=bounds(fs,'fuel.tank'),guard=bounds(fs,'fuel.shield'),delivery=bounds(fs,'fuel.delivery'),lines=bounds(fs,'fuel.lines'),filler=bounds(fs,'fuel.filler');
 assert(tank[0][0]>1.425&&tank[1][0]>=-.60&&tank[1][1]<=.60);
 assert(delivery[2][0]>guard[2][0]&&delivery[2][1]<tank[2][1]);
 assert(lines[2][1]>.418,'tank outlet must reach through tank floor');
 assert(filler[1][0]>0&&filler[1][1]<.88,'right rear filler');
 const groups=getG500ServiceAssemblies('g500');
 for(const id of ['fuel','electrical']){
  const actual=mesh(id),parts=groups.find(g=>g.id===id).parts;
  assert.deepEqual(new Set(actual.map(f=>f.part)),new Set(parts.map(p=>p.id)));
  for(const f of actual)assert(f.points.every(p=>p.every(Number.isFinite)));
 }
});
