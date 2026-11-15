import test from 'node:test';
import assert from 'node:assert/strict';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {GarageRenderer} from '../garage/render.js';
import {getRoadServiceAssemblies} from '../garage/road-service-systems.js';
import {intersects} from '../garage/exploded-layout.js';
const ids=['hrv','bmw325ci','c63','f350','porsche993cab','porsche992scab','bmws1000rr'];
function viewer(vehicle,inspection){return Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'silver',finish:'silver'},inspection,faces:[],isolate:true,schematic:true,lights:false,mechanismPhase:.27});}
test('all seven road platforms register and draw every service component through the collection viewer',()=>{
 for(const v of ids){const g=getRoadServiceAssemblies(v),all=getAssemblies(v);
   assert.deepEqual(g.map(a=>a.id),['brakes','fuel','electrical',...(['f350','bmws1000rr'].includes(v)?[]:['roof'])]);
   for(const a of g){assert.equal(all.filter(q=>q.id===a.id).length,1);
    const r=viewer(v,{assembly:a.id,expanded:false});r.buildMesh();
    const labels=new Set(r.faces.map(f=>f.part));assert.deepEqual(labels,new Set(a.parts.map(p=>p.id)),v+': '+a.id);
    for(const f of r.faces){assert.ok(f.points.every(pt=>pt.every(Number.isFinite)),f.part);assert.match(f.color,/^#[0-9a-f]{6}$/i);}
    for(const p of a.parts){assert.match(p.source.url,/^https:\/\//);const d=getDetail(v,p.id);if(!d)continue;
     const t=viewer(v,{});d.draw(t,.42);assert.deepEqual(new Set(t.faces.map(f=>f.part)),new Set(d.componentIndex.keys()),d.id);
     assert.ok(t.faces.every(f=>f.points.every(pt=>pt.every(Number.isFinite))),d.id);
    }
   }
 }
});
test('bike front discs flank the hub and the rear disc occurs once; the Ford rear drums expose the correct hardware',()=>{
 const r=viewer('bmws1000rr',{assembly:'brakes'});r.buildMesh();
 const lateral=id=>new Set(r.faces.filter(f=>f.part===id).map(f=>Math.sign(f.points[0][1])));
 assert.deepEqual(lateral('brakes.front-disc'),new Set([-1,1]));assert.deepEqual(lateral('brakes.rear-disc'),new Set([1]));
 const ford=getDetail('f350','brakes.rear-drum');assert.ok(ford.groups[0].parts.some(p=>p.id.endsWith('.cylinder')));
 assert.ok(!getRoadServiceAssemblies('f350').find(a=>a.id==='fuel').parts.some(p=>p.id==='fuel.rail'||p.id==='fuel.pump'));
 assert.equal(getDetail('bmw325ci','brakes.rear-drum'),null);assert.equal(getDetail('porsche993cab','brakes.rear-caliper').groups[0].parts.find(p=>p.id.endsWith('.pistons')).name,'4 opposed pistons');
});
test('the two cabriolets expose different roof drives and their parked components clear one another',()=>{
 for(const [v,label] of [['porsche993cab','Electric'],['porsche992scab','hydraulic']]){
  const g=getRoadServiceAssemblies(v).find(a=>a.id==='roof');assert.match(g.name,/folding roof/);assert.ok(!g.parts.some(p=>p.id==='roof.glass'));
  assert.ok(g.parts.find(p=>p.id==='roof.drive').name.includes(label));
  const d=getDetail(v,'roof.drive'),r=viewer(v,{assembly:'roof',detailView:d,expanded:true});r.buildMesh();
  const groups=[...r.activeLayout.groups.values()];for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)assert.ok(!intersects(groups[i].parked,groups[j].parked));
 }
 assert.match(getRoadServiceAssemblies('hrv').find(a=>a.id==='roof').name,/EX-L/);
});
