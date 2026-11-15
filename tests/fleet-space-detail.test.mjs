import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {spaceModels} from '../garage/fleet-space.js';
import {getSpaceDetail} from '../garage/space-detail.js';

const models=new Map(spaceModels.map(x=>[x.id,x]));
function mesh(model,phase=0) {
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null});
  model.draw(r,phase);
  return r.faces;
}
const spacePaths=[
  ['apollo-falcon','cabin.shell','lm-interior'],
  ['apollo-falcon','cabin.hatch','lm-forward-hatch'],
  ['apollo-falcon','cabin.windows','lm-glazing'],
  ['apollo-falcon','lm-room.dsky','lm-dsky'],
  ['apollo-lrv','wheels.wheel1','lrv-wheel'],
  ['atlas-v-541','upper.payload','mars2020-stack'],
  ['saturn-v','apollo.adapter','sla-panels'],
  ['falcon-9','upper.left','satellite-fairing'],
  ['falcon-heavy','upper.right','satellite-fairing'],
  ['crew-dragon','capsule.shell','dragon-cabin']
];
test('all seven space exhibits have reachable, source-linked detail meshes',()=>{
  const seen=new Set();
  for(const [vehicle,part,id] of spacePaths){
    const room=getSpaceDetail(vehicle,part);
    const parent=part.startsWith('lm-room.')?getSpaceDetail(vehicle,'cabin.shell'):models.get(vehicle);
    assert.ok(parent.groups.flatMap(g=>g.parts).some(p=>p.id===part),vehicle+' '+part);
    assert.equal(room.id,id);
    if(seen.has(id))continue;
    seen.add(id);
    const faces=mesh(room),declared=room.groups.flatMap(g=>g.parts);
    assert.match(room.source.url,/^https:/);
    assert.deepEqual(new Set(declared.map(p=>p.id)),new Set(faces.map(f=>f.part)));
    for(const p of declared){
      assert.ok(p.name&&p.description&&p.offset.every(Number.isFinite)&&Math.hypot(...p.offset)>0);
    }
    for(const f of faces)assert.ok(f.points.length>=3&&f.points.flat().every(Number.isFinite));
  }
  assert.equal(getSpaceDetail('apollo-lrv','wheels.wheel5'),null);
});
test('Apollo 15 has a connected, open-sided forward standing compartment',()=>{
  const lm=models.get('apollo-falcon'),interior=lm.groups.find(g=>g.id==='interior');
  assert.equal(interior.internal,true);
  const crewroom=getSpaceDetail(lm.id,'cabin.shell');
  const roomMesh=mesh(crewroom),azimuth=crewroom.viewAngle[0];
  const centerOnScreen=key=>{
    const pts=roomMesh.filter(f=>f.part==='lm-room.'+key).flatMap(f=>f.points);
    return pts.reduce((sum,[x,y])=>sum+x*Math.cos(azimuth)-y*Math.sin(azimuth),0)/pts.length;
  };
  assert.ok(centerOnScreen('commander')<centerOnScreen('pilot'));
  const tags=new Set(crewroom.groups[0].parts.map(p=>p.id));
  for(const key of ['lining','floor','commander','pilot','dsky','stowage','docking','telescope'])assert.ok(tags.has('lm-room.'+key),key);
  assert.equal(getSpaceDetail(lm.id,'interior.dsky'),getSpaceDetail(lm.id,'lm-room.dsky'));
  const faces=mesh(lm),glass=faces.filter(f=>f.part==='cabin.windows'&&f.opacity<1);
  assert.equal(glass.length,3);
  const skin=faces.filter(f=>f.part==='cabin.shell'&&f.points.every(p=>p[0]===-.99));
  const onFace=(y,z,pts)=>{
    let inside=false;
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){
      const [,a,b]=pts[i],[,c,d]=pts[j];
      if((b>z)!==(d>z) && y<(c-a)*(z-b)/(d-b)+a)inside=!inside;
    }
    return inside;
  };
  for(const [y,z] of [[-.34,2.56],[.34,2.56],[0,2.05]]){
    assert.ok(!skin.some(f=>onFace(y,z,f.points)),'window/hatch must open through forward bulkhead');
  }
  const deck=faces.filter(f=>f.part==='interior.lining');
  const minX=Math.min(...deck.flatMap(f=>f.points.map(p=>p[0])));
  const maxZ=Math.max(...deck.flatMap(f=>f.points.map(p=>p[2])));
  assert.ok(minX<-.92&&maxZ>2.96,'floor, window supports and crown lining must span the compartment');
});
test('the forward hatch swings inboard on the pilot’s side and the sill stays fixed',()=>{
  const hatch=getSpaceDetail('apollo-falcon','cabin.hatch'),closed=mesh(hatch),open=mesh(hatch,.5);
  const points=(faces,part)=>faces.filter(f=>f.part==='lm-hatch.'+part).flatMap(f=>f.points);
  assert.deepEqual(points(closed,'jamb'),points(open,'jamb'));
  const before=points(closed,'door'),after=points(open,'door');
  assert.ok(Math.max(...before.map(p=>p[0]))<.16);
  assert.ok(Math.max(...after.map(p=>p[0]))>1.20&&Math.min(...after.map(p=>p[1]))>.45);
});
test('Dragon has a four-seat crew deck and separate forward-hatch glazing',()=>{
  const dragon=models.get('crew-dragon'),room=dragon.groups.find(g=>g.id==='crewdeck');
  assert.ok(room.internal);
  assert.equal(room.parts.filter(p=>/crewdeck\.seat/.test(p.id)).length,4);
  const glass=mesh(dragon).filter(f=>f.part==='capsule.windows'&&f.opacity<1);
  assert.ok(glass.some(f=>f.points.every(p=>p[2]>4.30)));
  assert.ok(glass.some(f=>f.points.every(p=>p[2]<3.74)));
});
