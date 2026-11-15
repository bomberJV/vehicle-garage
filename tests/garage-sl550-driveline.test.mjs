import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {slPowerStudies,slPowerSources} from '../garage/sl550-power.js';

function parts(id,phase=0){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  slPowerStudies['sl-drive.'+id].draw(r,phase);
  const tags=Object.groupBy(r.faces,f=>f.part.split('.').at(-1));
  return Object.fromEntries(Object.entries(tags).map(([key,faces])=>[key,faces.flatMap(f=>f.points)]));
}
const near=(points,spot,radius)=>points.some(pt=>Math.hypot(...pt.map((v,i)=>v-spot[i]))<radius);
test('the shaft flex discs follow their mating axes and the isolator stays fixed under rotation',()=>{
  const rest=parts('shaft'),turned=parts('shaft',.13);
  for(const [key,xx,zz] of [['gear-disc',-.186,.395],['axle-disc',1.060,.376]]){
    assert.notDeepEqual(rest[key],turned[key]);
    for(let i=0;i<6;i++){
      const angle=2*Math.PI*i/6;
      assert(near(rest[key],[xx,.043*Math.cos(angle),zz+.043*Math.sin(angle)],.022));
    }
    const z=rest[key].map(p=>p[2]);
    assert(Math.abs((Math.max(...z)+Math.min(...z))/2-zz)<.001);
  }
  assert.deepEqual(turned.bearing,rest.bearing);
  for(const side of [-1,1])assert(near(rest.bearing,[.473,side*.097,.414],.017));
});
test('each SL550 exhaust bank connects through its front chamber and own rear silencer',()=>{
  const p=parts('exhaust');
  for(const s of [-1,1]){
    const rear=p[s<0?'left':'right'];
    for(const [a,b,station] of [[p.front,p.cats,[-.935,s*.369,.374]],[p.cats,p.middle,[.169,s*.08,.195]],[p.middle,rear,[.573,s*.204,.184]]]){
      assert(near(a,station,.075)&&near(b,station,.075),'adjacent sections share their pipe connection');
    }
    const crossSections=p.middle.filter(([xx])=>xx>.35&&xx<.54);
    assert(crossSections.some(p=>p[1]*s>.25));
    assert(near(rear,[2.13,s*.657,.35],.04));
  }
  const underSeats=[...p.middle,...p.hangers].filter(([xx])=>xx>.32&&xx<.56);
  assert(Math.max(...underSeats.map(v=>v[2]))<.247,'the front muffler and mounts clear the lowest 252 mm carpet surface');
  assert.match(slPowerSources.transmission.url,/page=49$/);
  assert(parts('auto')['aux-pump'].length>0);
  assert(parts('final').cover.length>0);
});
