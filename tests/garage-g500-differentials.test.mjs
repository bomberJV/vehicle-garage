import test from 'node:test';
import assert from 'node:assert/strict';
import {getAssemblies} from '../garage/assemblies.js';
import {findInVehicle} from '../garage/inspection-search.js';
import {getDetail} from '../garage/detail-catalog.js';
import {g500LockState} from '../garage/g500-differentials.js';
import {GarageRenderer} from '../garage/render.js';
import {offsetAt,planTravel} from '../garage/explosion-travel.js';
import {displaced,intersects} from '../garage/exploded-layout.js';

const root='differentials';
const aliases={front:'drivetrain.front-differential',center:'drivetrain.transfer',rear:'drivetrain.rear-differential'};
function render(inspection,isolate=false,t=0){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'g500',paint:'olive',finish:'silver',parts:[]},inspection,isolate,
    faces:[],schematic:true,lights:true,mechanismPhase:t
  });
  r.buildMesh();return r;
}
test('all three G500 differentials are visible from the vehicle and from their own assembly',()=>{
  const assembly=getAssemblies('g500').find(g=>g.id===root);
  const ids=assembly.parts.map(p=>p.id);
  assert.deepEqual(ids.slice(0,3),['differentials.front','differentials.center','differentials.rear']);
  for(const vehicle of ['hrv','c63','porsche993cab'])assert(!getAssemblies(vehicle).some(g=>g.id===root));
  const installed=render({}).faces.filter(f=>ids.includes(f.part));
  const isolated=render({assembly:root},true).faces;
  assert.deepEqual(installed.map(f=>f.part),isolated.map(f=>f.part));
  assert.deepEqual(new Set(isolated.map(f=>f.part)),new Set(ids));
  const xPositions=ids.slice(0,3).map(id=>{
    const points=isolated.filter(f=>f.part===id).flatMap(f=>f.points.map(p=>p[0]));
    return (Math.min(...points)+Math.max(...points))/2;
  });
  assert(xPositions[0]<-1&&Math.abs(xPositions[1])<.2&&xPositions[2]>1);
  for(const p of assembly.parts)assert(getDetail('g500',p.id),p.id);
});
test('search finds the dedicated assembly for common differential abbreviations',()=>{
  for(const needle of ['diff','diffs','differentials']){
    const hits=findInVehicle('g500',needle);
    for(const key of Object.keys(aliases)){
      assert(hits.some(hit=>hit.part==='differentials.'+key&&hit.assembly===root),needle+' '+key);
    }
  }
});

test('legacy drivetrain routes and new shortcuts open three distinct OEM-referenced cutaways and the correct locks',()=>{
  for(const [name,oldRoute] of Object.entries(aliases)){
    const detail=getDetail('g500',root+'.'+name);
    assert.equal(detail.id,'g500-'+name+'-diff');
    assert.equal(detail.id,getDetail('g500',oldRoute).id);
    assert.equal(detail.source.url.includes(name==='center'?'vg150-transfer-case':'--differential'),true);
    const lockId=detail.id+'.lock',lock=getDetail('g500',lockId);
    assert(lock && detail.componentIndex.has(lockId));
    assert.equal(lock.id,name==='center'?'g500-center-lock':'g500-axle-lock');
    assert(lock.componentIndex.has(lock.id+(name==='center'?'.diaphragm':'.tube')));
    assert(lock.componentIndex.has(lock.id+'.switch'));
  }
  const center=getDetail('g500','differentials.center');
  assert.equal([...center.componentIndex.keys()].filter(key=>/\.bevel-\d$/.test(key)).length,4);
  const ids=[...center.componentIndex.keys()].join(' ');
  for(const term of ['front-bearing','rear-bearing','spherical-washers','front-washer','rear-washer','shim'])assert(ids.includes(term));
});
test('the two outputs permit differential motion when open, and turn together while the sleeve is engaged',()=>{
  let diverged=false;
  for(let i=0;i<60;i++){
    const t=i/60,delta=.00001,a=g500LockState(t),b=g500LockState(t+delta);
    assert(Math.abs((a.first+a.second)/2-a.carrier)<1e-9);
    if(a.engagement===1){assert.equal(a.first,a.second);assert.equal(b.first,b.second);assert.equal(a.spin,0);}
    if(a.engagement===0&&Math.abs(a.first-a.second)>.1)diverged=true;
  }
  assert(diverged);
});
test('exploded housings and locks have selectable parts with clear travel and parked positions',()=>{
  const ids=['differentials.front','differentials.center','differentials.rear','g500-front-diff.lock','g500-center-diff.lock'];
  for(const id of ids){
    const view=getDetail('g500',id),r=render({assembly:root,detailView:view,expanded:true},true,.20);
    assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(view.componentIndex.keys()));
    const groups=[...r.activeLayout.groups.values()];
    planTravel(r.activeLayout);
    for(let i=0;i<groups.length;i++)for(const b of groups.slice(i+1)){
      const a=groups[i];
      if(a.movable||b.movable)assert(!intersects(a.parked||a.bounds,b.parked||b.bounds),a.key+' / '+b.key);
      if(intersects(a.bounds,b.bounds))continue;
      for(let step=1;step<24;step++){
        const phase=step/24;
        assert(!intersects(displaced(a.bounds,offsetAt(a,phase)),displaced(b.bounds,offsetAt(b,phase))),a.key+' crosses '+b.key);
      }
    }
    const pin=[...view.componentIndex.keys()].at(-1);
    r.inspection={assembly:root,detailView:view,detailPart:pin,onlyPart:true};
    r.buildMesh();assert(r.faces.length>0&&r.faces.every(f=>f.part===pin));
  }
});
