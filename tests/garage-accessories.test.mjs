import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS} from '../garage/catalog.js';
import {sanitizeBuild,togglePart} from '../garage/model.js';
import {accessoriesFor} from '../garage/accessory-catalog.js';
import {drawPorscheSpoilerMotion} from '../garage/porsche-coachwork.js';
import {motionEnvelope} from '../garage/motion-envelope.js';
import {drawAccessories} from '../garage/accessory-geometry.js';
import {drawGutterRack} from '../garage/accessory-racks.js';
import {GarageRenderer} from '../garage/render.js';
import {spoilerPoint} from '../garage/porsche-spoilers.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

const paint='#d0a842';
const vehicles=['g500','hrv','f350','bmw325ci','c63','porsche993cab','porsche992scab','bmws1000rr'];
function renderer(vehicle,parts=[]){
  return Object.assign(Object.create(GarageRenderer.prototype),{
    faces:[], lights:true, inspection:{}, build:{vehicle,parts,paint,finish:'silver'}
  });
}
function drawOption(vehicle,id,phase=0){
  const r=renderer(vehicle,[id]);
  if(vehicle==='g500')drawGutterRack(r,accessoriesFor(vehicle).filter(p=>p.id===id));
  drawAccessories(r,r.build,paint,phase);
  return r.faces;
}

test('fitted products retain exact vehicle, order and reference links in the shopping list',()=>{
  for(const vehicle of vehicles){
    const options=accessoriesFor(vehicle);
    assert.ok(options.length,vehicle);
    for(const option of options){
      assert.equal(PARTS.filter(p=>p.id===option.id).length,1);
      assert.deepEqual(option.vehicles,[vehicle]);
      assert.match(option.source.url,/^https:/);
      if(option.mockup){assert.equal(option.url,null);assert.equal(option.seller,null);}
      else assert.match(option.url,/^https:/);
      assert.ok(togglePart({vehicle},option.id).parts.includes(option.id));
      const wrong=vehicles.find(v=>v!==vehicle);
      assert.ok(!sanitizeBuild({vehicle:wrong,parts:[option.id]}).parts.includes(option.id));
    }
  }
  for(const [vehicle,first,second] of [['g500','g-rack','g-rack-short'],['porsche992scab','992-spoiler-lip','992-aero-kit'],['f350','f-bed','f-deezee-bedmat']]){
    const changed=togglePart({vehicle,parts:[first],quotes:{[first]:130}},second);
    assert.deepEqual(changed.parts,[second]);assert.deepEqual(changed.quotes,{});
    assert.deepEqual(sanitizeBuild({vehicle,parts:[first,second]}).parts,[first]);
  }
  assert.deepEqual(accessoriesFor('boeing747'),[]);
});

test('both G500 trays use their published envelope, gutter clamp count and rigid roof travel',()=>{
  for(const [id,length,count] of [['g-rack',2.166,8],['g-rack-short',1.964,6]]){
    const faces=drawOption('g500',id),points=faces.flatMap(face=>face.points);
    const tray=points.filter(p=>p[2]>2.133);
    const extent=axis=>Math.max(...tray.map(p=>p[axis]))-Math.min(...tray.map(p=>p[axis]));
    assert.ok(Math.abs(extent(0)-length)<1e-9);assert.ok(Math.abs(extent(1)-1.475)<1e-9);
    const clamps=new Set(points.filter(p=>Math.abs(p[2]-1.915)<1e-9).map(p=>p[0].toFixed(4)));
    assert.equal(clamps.size,count); // two edges per leg on one of two identical sides
    const r=renderer('g500',[id]);r.buildMesh();
    const installed=r.faces.filter(f=>f.points.every(p=>p[2]>2.1));
    assert.ok(installed.length>40);
    assert.ok(installed.every(f=>f.part==='body.roof'&&f.rigid?.name==='roof'));
  }
});

test('both Porsche kits and the other new accessories create drawable mounted surfaces',()=>{
  for(const vehicle of vehicles)for(const option of accessoriesFor(vehicle).filter(o=>o.id!=='f-bed')){
    const faces=drawOption(vehicle,option.id);
    assert.ok(faces.length>35,option.id);
    for(const f of faces){
      assert.match(f.color,/^#[0-9a-f]{6}$/i,option.id);
      assert.ok(f.points.flat().every(Number.isFinite),option.id);
      assert.ok(faceTriangles(f.points).length>=3,option.id+' has a zero area face');
    }
  }
  const rs=drawOption('porsche993cab','993-rs-lips');
  for(const face of rs){
    assert.equal(face.part,'shell.bumpers');
    assert.ok(face.points.every(p=>Math.abs(p[1])>.25));
    assert.ok(face.points.every(p=>p[0]<-1.50));
  }
  const mat=drawOption('f350','f-deezee-bedmat');
  assert.ok(mat.every(f=>f.points.every(p=>p[2]<.89)));
  assert.ok(mat.every(f=>!f.points.some(p=>p[0]>1.242&&p[0]<2.158&&Math.abs(p[1])>.620)));
});

test('the active accessory lip follows the same transform as the blade through stationary-mesh caching',()=>{
  const vehicle='porsche992scab',id='992-aero-kit';
  const parked=drawOption(vehicle,id), lifted=drawOption(vehicle,id,.5);
  const r=renderer(vehicle,[id]),plain=renderer(vehicle);
  for(const phase of [0,.25,.5,.75,0]){
    r.mechanismPhase=phase;r.buildMesh();
    plain.mechanismPhase=phase;plain.buildMesh();
    assert.equal(r.faces.length-plain.faces.length,parked.length);
  }
  assert.deepEqual(new Set(parked.map(f=>f.part)),new Set(['shell.bumpers','shell.fenders','shell.spoiler']));
  for(const [i,face] of parked.entries()){
    const expected=face.part==='shell.spoiler'?face.points.map(p=>spoilerPoint(true,p,.5)):face.points;
    for(const [j,p] of expected.entries())for(const axis of [0,1,2])assert.ok(Math.abs(p[axis]-lifted[i].points[j][axis])<1e-8);
  }
  assert.deepEqual(drawOption(vehicle,'992-spoiler-lip'),parked.filter(f=>f.part==='shell.spoiler'));
});

test('the S 1000 RR cowl replaces the pillion pad and stays with the saddle on separation',()=>{
  const r=renderer('bmws1000rr');
  r.buildMesh();
  const hasPadCorner=f=>f.part==='body.seat'&&f.k67Seat==='pillion';
  const cushion=r.faces.filter(hasPadCorner);
  assert.ok(cushion.length>0);
  const stockCount=r.faces.length,partId='s1k-puig-cowl';
  const extra=drawOption('bmws1000rr',partId);
  r.build.parts=[partId];r.buildMesh();
  assert.ok(r.faces.length>stockCount);
  assert.ok(r.faces.length<stockCount+extra.length);
  assert.ok(!r.faces.some(hasPadCorner));
  assert.ok(extra.every(f=>f.part==='body.seat'&&f.points.every(([x,y,z])=>x>=.53&&x<.85&&z>.89&&z<1.11)));
  r.inspection={assembly:'body',expanded:true};r.buildMesh();
  const seatGroups=new Set(r.activeLayout.entries.filter(e=>e.face.part==='body.seat').map(e=>e.group.key));
  assert.equal(seatGroups.size,1);
  r.inspection={};r.build.parts=[];r.buildMesh();
  assert.equal(r.faces.length,stockCount);
});

test('the exploded 992 workbench reserves the full sweep of the optional lip and refreshes after removal',()=>{
  const r=renderer('porsche992scab',['992-aero-kit']);
  r.inspection={assembly:'shell',expanded:true};
  let firstBounds;
  for(const phase of [0,.25,.5,.75]){
    r.mechanismPhase=phase;r.buildMesh();
    const bounds=r.activeLayout.groups.get('shell.spoiler').bounds;
    firstBounds??=bounds;assert.deepEqual(bounds,firstBounds);
    const lip=drawOption('porsche992scab','992-spoiler-lip',phase);
    for(const face of lip)for(const p of face.points)for(let k=0;k<3;k++){
      assert.ok(p[k]>=bounds.min[k]&&p[k]<=bounds.max[k]);
    }
  }
  const withLip=r.topStudy;
  r.build={...r.build,parts:[]};r.buildMesh();
  assert.notEqual(r.topStudy,withLip);
  assert.equal(r.topStudy.withLip,false);
  const stock={draw:(sampler,phase)=>drawPorscheSpoilerMotion(sampler,true,paint,phase)};
  assert.deepEqual(r.activeLayout.groups.get('shell.spoiler').bounds,motionEnvelope(stock,r).get('shell.spoiler'));
  // The trailing-edge lip can sit below the leading edge even at maximum lift.
  // Compare its actual mesh before and after removal, independently of the bounds.
  const spoiler=faces=>faces.filter(f=>f.part==='shell.spoiler').map(f=>f.points);
  const naked=renderer('porsche992scab');drawPorscheSpoilerMotion(naked,true,paint,r.mechanismPhase);
  assert.deepEqual(spoiler(r.meshCache.faces),spoiler(naked.faces));
});
