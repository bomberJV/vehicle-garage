import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {drawSLPower,slPowerStudies} from '../garage/sl550-power.js';

function points(draw){
  const renderer=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  draw(renderer);const groups=new Map();
  for(const {part,points} of renderer.faces){
    if(!groups.has(part))groups.set(part,[]);
    groups.get(part).push(...points);
  }
  return groups;
}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const reaches=(points,at,tolerance)=>points.some(p=>distance(p,at)<tolerance);

test('ABC hydraulic circuit reaches the pump, both valve blocks, strut ports and return cooler',()=>{
  const mesh=points(drawSLPower),get=key=>mesh.get('sl-abc.'+key);
  for(const axle of [-1.2925,1.2925]){
    for(const s of [-1,1]){
      const port=[axle+.014,s*.658,.566];
      assert(reaches(get('struts'),port,.011));
      assert(reaches(get('valves'),port,.008));
    }
    assert(reaches(get('feed'),[axle-.043,-.484,.334],.015));
    assert(reaches(get('return'),[axle-.046,-.5,.356],.015));
  }
  // The return and feed pass under the carpet, whose lowest skin is at z=.252.
  for(const id of ['feed','return']){
    const underFloor=get(id).filter(p=>Math.abs(p[0])<.75);
    assert(underFloor.length>0);
    assert(Math.max(...underFloor.map(p=>p[2]))<.238);
  }
  const pump=[-1.412,.186,.442];
  assert(reaches(get('feed'),pump,.01));
  assert(reaches(get('supply'),pump,.042));
  assert(reaches(get('front-cell'),[-1.2925,-.500,.378],.011));
  assert(reaches(get('rear-cell'),[1.3395,-.497,.351],.011));
  for(const port of [[-1.941,-.393,.489],[-1.940,-.393,.513]]){
    assert(reaches(get('return'),port,.012));
    assert(reaches(get('cooler'),port,.008));
  }
  const cond=mesh.get('sl-air.radiator');
  assert(Math.max(...get('cooler').map(p=>p[0]))<Math.min(...cond.map(p=>p[0])));
});
test('R231 reservoir study keeps the dipstick in its own opening beside the filter',()=>{
  const study=slPowerStudies['sl-abc.supply'];assert.match(study.source.url,/oil-tank-and-valves/);
  const group=points(study.draw),filter=group.get('sl-abc-reservoir.filter'),gauge=group.get('sl-abc-reservoir.dipstick');
  assert(Math.max(...filter.map(p=>p[0]))<Math.min(...gauge.map(p=>p[0])));
  assert(Math.max(...filter.map(p=>p[2]))<Math.min(...group.get('sl-abc-reservoir.cap').map(p=>p[2])));
  assert(slPowerStudies['sl-abc.struts'].groups[0].parts.some(p=>p.id.endsWith('.boot')));
});
