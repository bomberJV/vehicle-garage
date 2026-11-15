import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {seaModels} from '../garage/fleet-sea.js';

function inspect(model) {
  const renderer=Object.create(GarageRenderer.prototype);
  renderer.faces=[];
  model.draw(renderer);
  return renderer.faces;
}
const find=id=>seaModels.find(m=>m.id===id);
const limits=(faces,id,axis)=>{const values=faces.filter(f=>f.part===id).flatMap(f=>f.points.map(p=>p[axis]));return [Math.min(...values),Math.max(...values)];};
for(const model of seaModels){
  test(model.name+' has finite, tagged, independently inspectable parts',()=>{
    const faces=inspect(model),tags=new Set(faces.map(f=>f.part));
    const declared=model.groups.flatMap(g=>g.parts.map(p=>p.id));
    assert.deepEqual([...tags].sort(),declared.sort());
    for(const group of model.groups)for(const p of group.parts){assert(p.id.startsWith(group.id+'.'));assert.equal(p.offset.length,3);assert(p.offset.every(Number.isFinite));}
    assert(faces.length>150&&faces.length<13000);
    assert(faces.every(f=>/^#[0-9a-f]{6}$/i.test(f.color)&&f.points.every(p=>p.length===3&&p.every(Number.isFinite))));
    for(const f of faces)for(const p of f.points)for(const n of p)assert(Math.abs(n)<3);
    assert(model.source.url.startsWith('https://'));assert(model.specs.length>=3);
  });
}
test('Pioneering Spirit leaves the full central bow slot open to receive a platform',()=>{
  const faces=inspect(find('pioneeringspirit'));
  const slotFaces=faces.filter(f=>f.part.startsWith('hull.')&&f.points.every(p=>p[0]<-.91));
  assert(slotFaces.length>0);
  for(const f of slotFaces)assert(f.points.every(p=>p[1]<-.37)||f.points.every(p=>p[1]>.37));
  assert(limits(faces,'hull.crossdeck',0)[0]>-.91);
});
test('Containers and cargo piping occupy different deck arrangements',()=>{
  const boxship=inspect(find('ooclspain')),tanker=inspect(find('seawisegiant'));
  assert(limits(boxship,'bridge.bridge',0)[1]<limits(boxship,'bridge.funnel',0)[0]);
  assert(limits(tanker,'cargo.catwalk',0)[1]<limits(tanker,'bridge.quarters',0)[1]);
  assert(limits(boxship,'cargo.fore',0)[1]<limits(boxship,'cargo.mid',0)[0]);
});
test('Fishing gear and sampling gear occupy their proper ends of the vessels',()=>{
  const trawler=inspect(find('araho')),sub=inspect(find('alvin'));
  assert(limits(trawler,'fishing.gantry',0)[0]>limits(trawler,'house.bridge',0)[1]);
  assert(limits(sub,'science.basket',0)[1]<limits(sub,'crew.sphere',0)[1]);
  assert(limits(sub,'vehicle.thrusters',0)[0]>limits(sub,'crew.sphere',0)[1]);
  assert(limits(sub,'science.ptarm',1)[1]<0&&limits(sub,'science.starm',1)[0]>0);
});
