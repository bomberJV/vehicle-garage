import assert from 'node:assert/strict';
import test from 'node:test';
import {g45RescueSheet,g45MmPerPx,g45SidePoint,g45PlanHalfWidth,g45TracedSpans} from '../garage/g45-rescue-outline.js';

// Published figures for the US 2025 X3 30 xDrive (see garage/bmw-x3-g45-plan.md).
const published={length:4755,frontOverhang:880,rearOverhang:1010,height:1660,width:1920,widthWithMirrors:2132,groundClearance:216,tyreRadius:363.8};

test('the X3 rescue-sheet trace is registered at level wheel centres one wheelbase apart',()=>{
  const {front,rear}=g45RescueSheet;
  assert.equal(front[1],rear[1]);
  assert.equal(rear[0]-front[0],1235);
  assert(Math.abs(g45MmPerPx-2.3198)<1e-4);
  const [fx,fz]=g45SidePoint(front),[rx,rz]=g45SidePoint(rear);
  assert(Math.abs(fx+1.4325)<1e-9&&Math.abs(rx-1.4325)<1e-9);
  assert(Math.abs(fz-rz)<1e-12);
  assert(Math.abs(fz-(0.040+g45RescueSheet.tyreRadiusPx*g45MmPerPx/1000))<1e-9);
});

test('the traced X3 outline agrees with BMW’s published spans',()=>{
  const t=g45TracedSpans();
  // One drawing pixel is 2.3 mm and the outline is drawn 2–3 px wide.
  const within=(key,limit,why)=>assert(Math.abs(t[key]-published[key])<=limit,`${key}: traced ${t[key].toFixed(1)} mm against ${published[key]} (${why})`);
  within('length',15,'nose and tail line ends');
  within('frontOverhang',15,'the published overhang is a secondary figure');
  within('rearOverhang',10,'line width');
  within('height',10,'the sheet draws roof rails');
  within('width',15,'the plan line sits outside the body');
  within('widthWithMirrors',5,'mirror tip');
  within('tyreRadius',3,'245/50 R19');
  // The sill sits above the car’s lowest point, which sets the ground clearance.
  assert(t.sillClearance>=published.groundClearance&&t.sillClearance<=published.groundClearance+15,`sill ${t.sillClearance.toFixed(1)} mm`);
});

test('the X3 trace arrays cover the whole car without gaps',()=>{
  const {columns,rows}=g45RescueSheet;
  const n=columns.sideTop.length;
  assert.equal(n,341);
  for(const key of ['sideBottom','planTop'])assert.equal(columns[key].length,n,key);
  for(const key of ['sideTop','sideBottom','planTop'])assert(columns[key].every(v=>v>=0),key);
  assert.equal(rows.nose.length,rows.tail.length);
  for(let i=1;i<n;i++)assert(Math.abs(columns.sideTop[i]-columns.sideTop[i-1])<=110,'skyline step at '+i);
  // The plan half-width never exceeds the mirror tip.
  const max=Math.max(...columns.planTop.map(g45PlanHalfWidth));
  assert(Math.abs(max*2000-published.widthWithMirrors)<=5);
});
