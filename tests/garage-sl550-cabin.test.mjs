import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {slCabinGroups, slCabinStudies, drawSLCabin} from '../garage/sl550-cabin.js';

function mesh(draw) {
  const renderer = Object.assign(Object.create(GarageRenderer.prototype), {faces: []});
  draw(renderer);
  return renderer.faces;
}

const installed = mesh(drawSLCabin);
const instances = id => new Set(installed.filter(f => f.part === id).map(f => f.instance));

test('SL 550 cabin registers each documented component in both the stock mesh and sidebar', () => {
  const parts = slCabinGroups.flatMap(group => group.parts);
  assert.deepEqual(new Set(installed.map(f => f.part)), new Set(parts.map(p => p.id)));
  assert(installed.every(f => f.points.flat().every(Number.isFinite)));
  assert(parts.every(part => part.source.url.startsWith('https://')));
  for (const [parent, study] of Object.entries(slCabinStudies)) {
    assert(parts.some(p => p.id === parent), parent);
    const faces = mesh(r => study.draw(r, .23));
    assert.deepEqual(new Set(faces.map(f => f.part)), new Set(study.groups.flatMap(g => g.parts).map(p => p.id)));
    assert(faces.every(f => f.points.flat().every(Number.isFinite)), parent);
  }
});

test('the SL-specific BeoSound package fits twelve separately identified drivers and two amps', () => {
  for (const part of ['audio.bass','audio.lenses']) assert.deepEqual(instances(part), new Set(['left','right']));
  assert.deepEqual(instances('audio.mids'), new Set(['driver-door','passenger-door','driver-quarter','passenger-quarter']));
  assert.deepEqual(instances('audio.centers'), new Set(['front-center-midrange','front-center-tweeter','rear-center-midrange','rear-center-tweeter']));
  assert.deepEqual(instances('audio.amplifiers'), new Set(['dsp','icepower']));
  for (const side of ['left','right']) {
    const y = installed.filter(f => f.part === 'audio.bass' && f.instance === side).flatMap(f => f.points.map(p => p[1]));
    assert(Math.abs(Math.max(...y) - Math.min(...y) - .220) < .004);
  }
});

test('the blower, woofer and steering column move relative to their fixed mounting hardware', () => {
  for (const [parent, moving, fixed] of [['climate.blower', 'drum', 'inlet'], ['audio.bass', 'coil', 'basket'], ['cabin.column', 'shaft', 'carrier']]) {
    const study = slCabinStudies[parent];
    const first = mesh(r => study.draw(r, 0)), second = mesh(r => study.draw(r, .21));
    const points = (scene, part) => scene.filter(f => f.part === `${study.id}.${part}`).map(f => f.points);
    assert(study.animated);
    assert.notDeepEqual(points(first, moving), points(second, moving));
    assert.deepEqual(points(first, fixed), points(second, fixed));
  }
});

function surfaceHeight(x,y,faces) {
  const heights=[];
  for(const {points} of faces)for(let i=1;i<points.length-1;i++){
    const [a,b,c]=[points[0],points[i],points[i+1]];
    const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
    if(Math.abs(det)<1e-9)continue;
    const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det;
    const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det;
    if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)heights.push(a[2]*u+b[2]*v+c[2]*(1-u-v));
  }
  return Math.max(...heights);
}

test('both parked blade lips follow the actual windshield mesh and keep clear of the glass and hood', async()=>{
  const {drawSLRoof}=await import('../garage/sl550-roof.js');
  const {drawSLExterior}=await import('../garage/sl550-exterior.js');
  const glass=mesh(r=>drawSLRoof(r,'#ababab',1)).filter(f=>f.part==='roof.windshield');
  const hood=mesh(r=>drawSLExterior(r,'#ababab','#9f9f9f',1)).filter(f=>f.part==='shell.hood');
  assert(glass.length&&hood.length);
  for(const id of ['visibility.left-blade','visibility.right-blade']){
    const points=installed.filter(f=>f.part===id).flatMap(f=>f.points);
    const clearance=points.map(([x,y,z])=>z-surfaceHeight(x,y,glass));
    assert(Math.min(...clearance)>-.0005&&Math.min(...clearance)<.006,id+' contact lip');
    assert(Math.max(...clearance)<.025,id+' conforms to screen');
    for(const [x,y,z] of points)assert(z>surfaceHeight(x,y,hood),id+' hood clearance');
  }
});

test('the MAGIC VISION washer reverses its active outlet bank between strokes',()=>{
  const study=slCabinStudies['visibility.left-blade'];
  assert.equal(study,slCabinStudies['visibility.right-blade']);
  const faces=t=>mesh(r=>study.draw(r,t));
  const up=faces(.23),down=faces(.75);
  for(const f of up.filter(f=>f.part==='slwasher.wash'))assert(f.points.every(([x])=>x>0));
  for(const f of down.filter(f=>f.part==='slwasher.wash'))assert(f.points.every(([x])=>x<0));
  assert.deepEqual(up.filter(f=>f.part!=='slwasher.wash'),down.filter(f=>f.part!=='slwasher.wash'));
});

test('both acoustic lens skirts contact the curved dashboard and the upper cap clears its trim',()=>{
  const dash=installed.filter(f=>f.part==='cabin.dash');
  for(const side of ['left','right']){
    const faces=installed.filter(f=>f.part==='audio.lenses'&&f.instance===side);
    const skirt=faces.filter(f=>f.color==='#686e70');
    assert.equal(skirt.length,24);
    for(const face of skirt){
      for(const [i,[x,y,z]] of face.points.entries()){
        const gap=z-surfaceHeight(x,y,dash);
        if(i<2)assert(gap<.0005&&gap>-.0012,side+' lower lip');
        else assert(gap>.0005,side+' upper lip');
      }
    }
  }
  const detail=slCabinStudies['audio.lenses'];
  const faces=mesh(r=>detail.draw(r,0));
  const of=id=>faces.filter(f=>f.part==='slacousticlens.'+id).flatMap(f=>f.points);
  const highest=id=>Math.max(...of(id).map(p=>p[2]));
  const lowest=id=>Math.min(...of(id).map(p=>p[2]));
  assert(lowest('cap')>=highest('reflector')-.000001);
  assert(highest('driver')<.013);
  assert.equal(detail.groups[0].parts.length,5);
});

test('both parked arms clear the hood and stay close to the windshield at the cowl',async()=>{
  const {drawSLExterior}=await import('../garage/sl550-exterior.js');
  const {drawSLRoof}=await import('../garage/sl550-roof.js');
  const hood=mesh(r=>drawSLExterior(r,'#ababab','#9f9f9f',1)).filter(f=>f.part==='shell.hood');
  const glass=mesh(r=>drawSLRoof(r,'#ababab',1)).filter(f=>f.part==='roof.windshield');
  const arms=installed.filter(f=>f.part==='visibility.arms');
  assert.deepEqual(new Set(arms.map(f=>f.instance)),new Set(['left','right']));
  for(const {points} of arms)for(const [x,y,z] of points){
    assert(z>=surfaceHeight(x,y,hood)-.0001,'stamped arm passes through hood');
    assert(z>=surfaceHeight(x,y,glass)-.0001,'stamped arm passes through glass');
  }
  // Section through the lower windshield at station 377 in drawing P00.10-5105-00.
  const station=-.65675,heights=[];
  for(const {points} of arms)for(let j=0;j<points.length;j++){
    const a=points[j],b=points[(j+1)%points.length];
    const t=(station-a[0])/(b[0]-a[0]);
    if(t>=0&&t<=1)heights.push(a[2]+(b[2]-a[2])*t);
  }
  assert(heights.length&&Math.max(...heights)<.954,'cowl arm should stay below 12 mm over the drawing');
});

test('the cowl drive opens into the same motor, carrier, rods and three shafts installed on the car',()=>{
  const study=slCabinStudies['visibility.linkage'],faces=mesh(r=>study.draw(r,0));
  const ids=new Set(faces.map(f=>f.part));
  assert.deepEqual(ids,new Set(['slwiperdrive.motor','slwiperdrive.carrier','slwiperdrive.rods','slwiperdrive.shafts']));
  assert.deepEqual(faces.map(f=>f.points),installed.filter(f=>f.part==='visibility.linkage').map(f=>f.points));
});
