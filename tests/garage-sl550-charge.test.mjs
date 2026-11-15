import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {slPowerStudies,drawSLPower} from '../garage/sl550-power.js';

function capture(draw){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  draw(r);
  return r.faces;
}
const geometry=faces=>faces.map(f=>f.points);
test('installed charge hardware matches the nested study at rest',()=>{
  const installed=capture(drawSLPower);
  for(const id of ['sl-air.core','sl-air.low-temp']){
    const nested=capture(r=>slPowerStudies[id].draw(r,0));
    // The standalone circuit repeats the cooler to show the hose endpoints.
    const fittings=nested.filter(f=>f.part!=='sl-charge-cooling.engine-cooler');
    assert.deepEqual(geometry(installed.filter(f=>f.part===id)),geometry(fittings));
  }
});
test('opening the butterfly leaves its spindle and the housing fixed',()=>{
  const component=slPowerStudies['sl-air.core'];
  const captureAt=t=>capture(r=>component.draw(r,t));
  const rest=captureAt(0),open=captureAt(.5);
  const moved=rest.flatMap((f,i)=>JSON.stringify(f.points)!==JSON.stringify(open[i].points)?[f.part]:[]);
  assert.deepEqual(moved,['sl-charge.butterfly']);
  const boreAxis=-1.007;
  const span=f=>Math.max(...f.points.map(([xx])=>Math.abs(xx-boreAxis)));
  const plate=f=>f.part==='sl-charge.butterfly';
  assert(span(rest.find(plate))<.007);
  assert(span(open.find(plate))>.040);
});
test('charge circuit hose ends meet their fittings with distinct pump and cooler ports',()=>{
  const study=slPowerStudies['sl-air.low-temp'],faces=capture(r=>study.draw(r));
  const vertices=id=>faces.filter(f=>f.part==='sl-charge-cooling.'+id).flatMap(f=>f.points);
  const near=(points,p,dist)=>points.some(v=>Math.hypot(...v.map((c,i)=>c-p[i]))<dist);
  for(const [a,b,p] of [
    ['pump','cold',[-1.695,.369,.275]],['pump','cold',[-1.666,.369,.309]],
    ['engine-cooler','cold',[-1.344,.119,.684]],['engine-cooler','hot',[-1.309,.119,.719]],
    ['exchanger','hot',[-1.901,-.351,.508]],['exchanger','cold',[-1.901,.351,.262]],
    ['cold','tank',[-1.765,.373,.267]],['tank','vent',[-1.438,.414,.662]],
    ['engine-cooler','vent',[-1.318,.087,.757]]
  ])for(const id of [a,b])assert(near(vertices(id),p,.022),id+' misses '+p);
});
