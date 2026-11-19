import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {VEHICLES} from '../garage/catalog.js';
import {roadSystems} from '../garage/road-service-data.js';
import {getRoadDrivetrain} from '../garage/road-mechanisms.js';
import {c63Body} from '../garage/c63-exterior.js';

// Mercedes-Benz USA technical data, C63 AMG sedan: 108.9 in (2,766 mm) wheelbase.
// The front axle stays where the front end is registered; the rear axle carries the change.
const WHEELBASE=2.766,FRONT_AXLE=-1.38;
const faces=GarageRenderer.assembledFaces({vehicle:'c63',parts:[],roofPosition:'up',paint:'silver'});
const box=pts=>[0,1,2].map(i=>(Math.min(...pts.map(p=>p[i]))+Math.max(...pts.map(p=>p[i])))/2);

function tyreCentre(corner){
 const ySpan=f=>Math.max(...f.points.map(p=>p[1]))-Math.min(...f.points.map(p=>p[1]));
 const pts=faces.filter(f=>f.part==='wheels.tire'&&f.instance===corner&&ySpan(f)>.2).flatMap(f=>f.points);
 assert(pts.length>0,corner+' has no tread faces');
 return box(pts);
}
const tyres=Object.fromEntries(['front-left','front-right','rear-left','rear-right'].map(c=>[c,tyreCentre(c)]));

test('C63 wheelbase between the drawn tyre centres is the published 2,766 mm',()=>{
 for(const side of ['left','right']){
  const wb=tyres['rear-'+side][0]-tyres['front-'+side][0];
  assert(Math.abs(wb-WHEELBASE)<=.002,`${side} wheelbase ${wb.toFixed(4)} m`);
  assert(Math.abs(tyres['front-'+side][0]-FRONT_AXLE)<1e-9,`${side} front axle moved to ${tyres['front-'+side][0]}`);
 }
 assert(Math.abs(VEHICLES.c63.wheelbase-WHEELBASE)<1e-9);
 // The service layout and the body's wheel arches use the same axle stations as the tyres.
 assert.deepEqual([...roadSystems.c63.axles],[tyres['front-left'][0],tyres['rear-left'][0]]);
 assert.deepEqual([...c63Body.axles],[tyres['front-left'][0],tyres['rear-left'][0]]);
});

test('C63 rear wheel arch is centred over the drawn rear tyre',()=>{
 // Behind each axle the opening's edge is the arch circle round the tyre centre.
 for(const end of ['front','rear']){
  const cx=tyres[end+'-left'][0];let nearest=1;
  for(const f of faces){
   if(!f.part.startsWith('body.')||f.color==='#0f1213')continue;
   for(const p of f.points){
    if(Math.abs(p[1])<.80||p[0]<cx||p[0]-cx>.40||p[2]<c63Body.axleZ||p[2]>.75)continue;
    nearest=Math.min(nearest,Math.hypot(p[0]-cx,p[2]-c63Body.axleZ));
   }
  }
  assert(Math.abs(nearest-c63Body.arch)<=.001,`${end} arch edge ${nearest.toFixed(4)} m from the tyre centre, arch radius ${c63Body.arch}`);
 }
});

test('C63 rear half-shafts run from the final drive outputs to the rear hub centres',()=>{
 const shafts=faces.filter(f=>f.part==='drivetrain.halfshafts'),diff=faces.filter(f=>f.part==='drivetrain.rear-differential');
 assert(shafts.length>0&&diff.length>0);
 // The carrier's side bearings, outboard of the pinion housing, mark the output axis.
 const output=box(diff.flatMap(f=>f.points).filter(p=>Math.abs(p[1])>.15));
 for(const [side,s] of [['left',-1],['right',1]]){
  const hub=tyres['rear-'+side];
  const ring=(lo,hi)=>box(shafts.filter(f=>f.points.every(p=>s*p[1]>lo&&s*p[1]<hi)).flatMap(f=>f.points));
  const outer=ring(.60,.70),inner=ring(.20,.32);
  const offAxis=Math.hypot(outer[0]-hub[0],outer[2]-hub[2]);
  assert(offAxis<=.003,`${side} outer joint ${(offAxis*1000).toFixed(1)} mm off the hub axis`);
  // The outer joint sits just inboard of the wheel, inside the hub carrier.
  assert(s*hub[1]-s*outer[1]>0&&s*hub[1]-s*outer[1]<.15,`${side} outer joint at y ${outer[1]}`);
  const atOutput=Math.hypot(inner[0]-output[0],inner[2]-output[2]);
  assert(atOutput<=.003,`${side} inner joint ${(atOutput*1000).toFixed(1)} mm off the final-drive output`);
  const angle=Math.atan2(Math.hypot(outer[0]-inner[0],outer[2]-inner[2]),Math.abs(outer[1]-inner[1]))*180/Math.PI;
  assert(angle<=3,`${side} shaft angle ${angle.toFixed(2)} degrees`);
 }
});

test('the rear-drive C63 has no front half-shafts',()=>{
 const ids=getRoadDrivetrain('c63').parts.map(p=>p.id);
 assert(!ids.some(id=>/front/.test(id)),ids.join(' '));
 const rearX=tyres['rear-left'][0];
 for(const f of faces.filter(f=>f.part==='drivetrain.halfshafts'))
  for(const p of f.points)assert(Math.abs(p[0]-rearX)<.1,`half-shaft point at x ${p[0]}`);
});
