import test from 'node:test';
import assert from 'node:assert/strict';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {GarageRenderer} from '../garage/render.js';
import {findInVehicle} from '../garage/inspection-search.js';

const roots=[['crew-dragon','crewdeck','crewdeck.air'],['falcon-9','upper','upper.air'],['falcon-heavy','upper','upper.air'],['atlas-v-541','upper','upper.air']];
function faces(view,phase){
  const r=Object.create(GarageRenderer.prototype);r.faces=[];view.draw(r,phase);return r.faces;
}
test('ground payload conditioning and crew cabin life support have separate searchable diagrams',()=>{
  for(const [vehicle,id,key] of roots){
    assert(getAssemblies(vehicle).find(a=>a.id===id)?.parts.some(p=>p.id===key));
    const detail=getDetail(vehicle,key);assert(detail.animated);
    const a=faces(detail,0),b=faces(detail,.27);
    assert.deepEqual(new Set(a.map(f=>f.part)),new Set(detail.componentIndex.keys()));
    assert.deepEqual(a.map(f=>f.part),b.map(f=>f.part));
    assert.notDeepEqual(a.map(f=>f.points),b.map(f=>f.points));
    assert(a.every(f=>f.points.every(pt=>pt.every(Number.isFinite))));
  }
  const fan=findInVehicle('crew-dragon','fan rotor and blades')[0];
  assert(fan.path.includes('dragon_air.fan'));
  const drive=getDetail('crew-dragon','dragon_air.fan');
  const phases=[0,.34].map(t=>faces(drive,t));
  const points=(i,id)=>phases[i].filter(f=>f.part===id).map(f=>f.points);
  assert.deepEqual(points(0,'dragon_fan.housing'),points(1,'dragon_fan.housing'));
  assert.notDeepEqual(points(0,'dragon_fan.blades'),points(1,'dragon_fan.blades'));
  assert.equal(getDetail('atlas-v-541','crewdeck.air'),null);
});
test('a search can distinguish the pins in two handed doors',()=>{
  const results=findInVehicle('porsche993cab','hinge pin');
  for(const side of ['left','right']){
    assert(results.some(r=>r.title==='Hinge pin'&&r.path.includes('shell.'+side+'-door')));
  }
});
