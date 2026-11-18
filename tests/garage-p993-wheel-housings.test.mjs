// 993 wheel housings and the springs seen through them (hub #265).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {classicWheelOpening,coupeShape} from '../garage/porsche-coachwork.js';
import {chassisRefs} from '../garage/porsche993-chassis.js';
import {baseline} from './p993-overlap-survey.mjs';

const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle:'porsche993cab',paint:'silver',parts:[]},inspection:{},isolate:false,partPositions:new Map(),schematic:true});
r.buildMesh();
const car=coupeShape.find(c=>!c.modern);
const axles=[[car.front,car.frontRadius],[car.rear,car.rearRadius]];
const inside=(poly,[px,pz])=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if((zi>pz)!==(zj>pz)&&px<(xj-xi)*(pz-zi)/(zj-zi)+xi)c=!c;}return c;};
// Faces of the inner wheel-housing wall: every point in the plane |y| = .535.
// Packed meshes carry an index list; split every face into its triangles.
const tris=f=>{if(!f.triangles){const t=[];for(let k=1;k<f.points.length-1;k++)t.push([f.points[0],f.points[k],f.points[k+1]]);return t;}const t=[];for(let k=0;k<f.triangles.length;k+=3)t.push([0,1,2].map(i=>f.points[f.triangles[k+i]]));return t;};
const wall=r.faces.filter(f=>f.part==='shell.fenders').flatMap(tris).filter(t=>t.every(p=>Math.abs(Math.abs(p[1])-.535)<1e-6)).map(points=>({points}));
const centroid=f=>f.points.reduce((a,p)=>[a[0]+p[0]/f.points.length,a[1]+p[2]/f.points.length],[0,0]);
const lum=hex=>{const n=parseInt(hex.slice(1),16);return .2126*(n>>16)+.7152*(n>>8&255)+.0722*(n&255);};

test('the inner wall is open behind each tire and the opening stays inside the tire outline',()=>{
  for(const [axle,rad] of axles){
    const hole=classicWheelOpening.map(([dx,z])=>[axle+dx,z]);
    assert(!wall.some(f=>inside(hole,centroid(f))),`wall face inside the opening at axle ${axle}`);
    // Every corner of the opening is behind the tire seen side-on (wheel centre at z = radius).
    for(const [x,z] of hole)assert(Math.hypot(x-axle,z-rad-.006)<rad-.02,`opening corner ${x.toFixed(3)},${z} shows past the tire`);
  }
});

test('the wall still closes the housing ahead of and behind the tire, down to the floor line',()=>{
  for(const [axle] of axles)for(const sign of [-1,1]){
    const outer=wall.filter(f=>f.points.some(p=>sign*(p[0]-axle)>.30&&p[2]<.13));
    assert(outer.length>=2,`closure ${sign>0?'behind':'ahead of'} the wheel at axle ${axle}`);
  }
});

test('only the front struts cross the wheel-housing wall; links, shafts and leads pass through the opening',()=>{
  const through=Object.keys(baseline()).filter(k=>k.includes('shell.fenders')&&/993-(suspension|steering|electrics)|drivetrain|brakes\.lines/.test(k));
  assert.deepEqual(through.sort(),['993-suspension.front-strut-left + shell.fenders','993-suspension.front-strut-right + shell.fenders'].sort());
});

test('springs are black; the standard front springs carry three blue paint dots',()=>{
  assert(chassisRefs.springPaint.url.startsWith('https://'));
  for(const [key,dots] of [['front-strut',3],['rear-strut',0]])for(const hand of ['left','right']){
    const faces=r.faces.filter(f=>f.part===`993-suspension.${key}-${hand}`);
    const blue=faces.filter(f=>{const n=parseInt(f.color.slice(1),16);return (n&255)>(n>>16)+60;});
    assert.equal(blue.length,dots,`${key}-${hand} paint dots`);
    const coil=faces.filter(f=>f.points.length===4&&!blue.includes(f)&&lum(f.color)<60);
    assert(coil.length>=30,`${key}-${hand} black coil faces: ${coil.length}`);
  }
});
