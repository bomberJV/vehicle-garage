import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {coupeShape} from '../garage/porsche-coachwork.js';
import {drawCabrioletCabin} from '../garage/porsche-cabin.js';
import {drawPorscheInstalledRoof} from '../garage/porsche-installed-roof.js';
const vehicles=['porsche993cab','porsche992scab'];
const parts=['fabric','header','bows','rear-window','links','drive'];
function render(vehicle,roofPosition,cabin=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle,roofPosition},inspection:cabin?{assembly:'cabin'}:{}});
 drawCabrioletCabin(r,coupeShape[vehicles.indexOf(vehicle)],'#d3b63a');
 const authored=r.faces.filter(f=>f.part==='cabin.top').slice();
 drawPorscheInstalledRoof(r,vehicle);
 return {r,authored,points:id=>r.faces.filter(f=>f.part==='roof.'+id).flatMap(f=>f.points)};
}
const extremes=(pts,axis)=>[Math.min(...pts.map(p=>p[axis])),Math.max(...pts.map(p=>p[axis]))];
for(const [index,vehicle] of vehicles.entries()){
 test(vehicle+' uses its actual top/trim once, including after folding the bows and screen',()=>{
  const up=render(vehicle,'up'),down=render(vehicle,'down'),car=coupeShape[index];
  for(const p of parts)for(const frame of [up,down])assert(frame.points(p).length,p+' in both states');
  for(const frame of [up,down]){
   for(const f of frame.authored)assert.equal(frame.r.faces.filter(v=>v===f).length,1);
   assert(!frame.r.faces.some(f=>f.part==='cabin.top'));
  }
  // The 992's fabric front bow lies flush on the body as the compartment cover
  // when the top is down (photographs); only the folded frame stays low.
  const stowed=down.r.faces.filter(f=>f.part.startsWith('roof.')&&!f.stowedCover).flatMap(f=>f.points);
  if(index===1)assert(down.r.faces.some(f=>f.stowedCover&&f.part==='roof.fabric'),'flush fabric cover over the stowed top');
  assert(extremes(stowed,2)[1]<car.belt+.17);
  assert(extremes(down.points('rear-window'),0)[0]>.75);
  assert(extremes(down.points('header'),0)[0]>.70);
  assert(extremes(up.points('header'),0)[0]<-.12);
  const cabin=render(vehicle,'up',true);
  assert(cabin.r.faces.some(f=>f.part==='cabin.top'&&f.opacity<.5&&f.points.every(p=>p[0]>.72)));
  assert(!cabin.r.faces.some(f=>f.part.startsWith('roof.')),'one legacy roof in the cabin group');
  // Unchanged bearing eyes anchor the side mechanism behind the seat as the frame folds.
  const positions=points=>new Set(points.map(p=>p.join(',')));
  const downLinks=positions(down.points('links'));
  const stationary=up.points('links').filter(p=>downLinks.has(p.join(',')));
  for(const s of [-1,1])assert(stationary.some(([xx,yy,zz])=>xx>.65&&xx<.81&&s*yy>.55&&zz>.74&&zz<.79));
  if(index===0)assert.deepEqual(up.points('drive'),down.points('drive'),'fixed late-993 motor and transmissions');
  else{
   const lids=(frame)=>frame.r.faces.filter(f=>f.part==='roof.compartment-lid');
   const downLid=lids(down),upLid=lids(up);
   assert.equal(upLid.length,downLid.length,'exactly one shut lid in each end position');
   assert(downLid.some(f=>f.roofServicePart==='roof.compartment-lid'));
   assert.deepEqual(upLid.map(f=>f.points),downLid.map(f=>f.points));
   assert.notDeepEqual(up.points('drive'),down.points('drive'));
   const rear=extremes(down.points('rear-window'),0);
   assert(rear[1]-rear[0]<.40,'glass stays flat inside the Z-fold');
  }
 });
}
