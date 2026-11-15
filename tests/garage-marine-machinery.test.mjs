import test from 'node:test';
import assert from 'node:assert/strict';
import {getMarinePropulsionDetail as get,getMarinePropulsionGroup as group} from '../garage/marine-propulsion.js';
import {seaModels} from '../garage/fleet-sea.js';
import {GarageRenderer} from '../garage/render.js';

function faces(study,phase=0){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  study.draw(r,phase);return r.faces;
}
const all=study=>study.groups.flatMap(g=>g.parts);
test('all eight vessels carry selectable machinery, an explodable engine room, and deeper working parts',()=>{
  let studyCount=0;
  for(const v of seaModels){
    const g=group(v.id);assert.equal(g.internal,true);assert.equal(v.groups.at(-1),g);
    const seen=new Set();
    function traverse(parts){
      for(const p of parts){
        const s=get(v.id,p.id);if(!s||seen.has(s.id))continue;seen.add(s.id);
        const leaves=all(s),geometry=faces(s,.19);
        assert(s.source?.url.startsWith('https://'));assert(leaves.length>=2);
        assert.deepEqual(new Set(geometry.map(f=>f.part)),new Set(leaves.map(p=>p.id)),s.id);
        assert(leaves.every(p=>p.offset.some(x=>x!==0)&&p.offset.every(Number.isFinite)));
        assert(geometry.every(f=>/^#[0-9a-f]{6}$/i.test(f.color)&&f.points.every(v=>v.every(Number.isFinite))),s.id);
        traverse(leaves);
      }
    }
    traverse(g.parts);assert(seen.size>=4,v.id);studyCount+=seen.size;
  }
  assert(studyCount>=54);assert.equal(get('toString','constructor'),null);assert.equal(get('ooclspain','marine-x92.cylinder-40'),null);
});
test('generator, jet, steam and battery installations retain their actual layouts',()=>{
  const ids=v=>group(v).parts.map(p=>p.id);
  assert.equal(ids('pioneeringspirit').filter(id=>id.startsWith('propulsion.thruster')).length,12);
  assert.equal(ids('pioneeringspirit').filter(id=>id.includes('alternator')).length,9);
  assert.equal(ids('octopussy').filter(id=>id.includes('diesel-')).length,3);
  assert.equal(ids('azzam').filter(id=>id.includes('turbine-')).length,2);
  assert.equal(ids('azzam').filter(id=>id.includes('diesel-')).length,2);
  assert.equal(ids('seawisegiant').filter(id=>id.includes('boiler-')).length,2);
  assert.equal(group('alvin').parts.filter(p=>p.name.endsWith('thruster')).length,7);
  assert.equal(ids('alvin').filter(id=>id.includes('battery')).length,2);
  assert.equal(get('azzam','propulsion.jet-1').id,'marine-boosterjet');
  assert.equal(get('azzam','propulsion.jet-0').id,'marine-steerjet');
  assert.equal(get('araho','marine-shaft.screw').id,'marine-cpp');
  assert.equal(get('ooclspain','marine-shaft.screw').id,'marine-fixedprop');
  assert.equal(get('ooclspain','propulsion.gear'),null);
});
test('the twelve OOCL cylinders each open and the crosshead guides stay vertical through the stroke',()=>{
  const engine=get('ooclspain','propulsion.main-engine');
  assert.equal(all(engine).filter(p=>p.id.includes('.cylinder-')).length,12);
  for(let i=1;i<=12;i++)assert.equal(get('ooclspain','marine-x92.cylinder-'+i).id,'marine-x92-unit');
  const unit=get('ooclspain','marine-x92.cylinder-4'),pack=get('ooclspain',unit.id+'.piston');
  assert.equal(all(pack).filter(p=>p.id.includes('.ring-')).length,3);
  const crown=f=>f.filter(p=>p.part.endsWith('.piston')).flatMap(p=>p.points);
  const bottom=crown(faces(unit,.5)),top=crown(faces(unit,0));
  const extent=(points,axis)=>points.reduce((n,v)=>Math.max(v[axis],n),-Infinity);
  assert(Math.abs(extent(top,2)-extent(bottom,2)-.510)<1e-6);
  assert.equal(extent(top,0),extent(bottom,0));assert.equal(extent(top,1),extent(bottom,1));
  assert(extent(top,2)<1.247+.50);
});
test('moving impeller and CPP blades move independently of their stationary parts',()=>{
  for(const [v,id,fixed,moving] of [['azzam','propulsion.jet-0','stator','impeller'],['pioneeringspirit','propulsion.thruster-p1','mount','screw'],['alvin','propulsion.forward-cross','stator','rotor'],['araho','marine-shaft.screw','boss','blade-1'],['ooclspain','propulsion.shaft','bearing','shaft'],['ooclspain','propulsion.shaft','bearing','flange']]){
    const study=get(v,id),a=faces(study,0),b=faces(study,.25);assert.equal(study.animated,true);
    const vertices=(triangles,key)=>triangles.filter(f=>f.part===study.id+'.'+key).flatMap(f=>f.points);
    assert.deepEqual(vertices(a,fixed),vertices(b,fixed),study.id);
    assert.notDeepEqual(vertices(a,moving),vertices(b,moving),study.id);
  }
});
