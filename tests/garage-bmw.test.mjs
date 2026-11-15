import test from 'node:test';
import assert from 'node:assert/strict';
import {VEHICLES,PARTS} from '../garage/catalog.js';
import {sanitizeBuild,importBuild,presetBuild,accounting} from '../garage/model.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getAssembly} from '../garage/assemblies.js';
import {GarageRenderer} from '../garage/render.js';
import {buildBmwExterior} from '../garage/exterior-bmw.js';
test('legacy E90 build migration cannot carry old fitment or prices into E46',()=>{
 const old={version:1,vehicle:'bmw328i',paint:'blue',finish:'bronze',parts:['b-filter','b-tires','charger'],quotes:{'b-filter':99,'b-tires':1200,charger:1},budget:9000,labor:800,paintAllowance:700,notes:'My notes'};
 const b=sanitizeBuild(old);assert.equal(b.vehicle,'bmw325ci');assert.equal(b.paint,'blue');assert.equal(b.finish,'bronze');assert.equal(b.budget,9000);assert.equal(b.notes,'My notes');assert.deepEqual(b.parts,[]);assert.deepEqual(b.quotes,{});assert.equal(b.labor,0);assert.equal(b.paintAllowance,0);assert.deepEqual(importBuild(JSON.stringify(old)),b);assert.equal(accounting(b).total,0);
});
test('E46 presets and parts use 2003 coupe identity without N52 product contamination',()=>{
 const v=VEHICLES.bmw325ci;assert.equal(v.year,2003);assert.equal(v.body,'coupe');assert.equal(v.wheelbase,2.725);assert.match(v.detail,/M54B25/);assert.equal(VEHICLES.bmw328i,undefined);
 const available=PARTS.filter(x=>x.vehicles.includes('bmw325ci'));assert.ok(available.some(p=>p.id==='b46-filter'));assert.ok(!available.some(p=>p.id==='b-filter'||/N52|N51|E90/.test(p.name+p.sku)));
 for(let i=0;i<3;i++){const b=presetBuild('bmw325ci',i);assert.equal(b.vehicle,'bmw325ci');assert.ok(b.parts.every(id=>available.some(p=>p.id===id)));}
});
test('E46 coupe exterior supplies finite tagged geometry within its stated silhouette',()=>{
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null,lights:true});buildBmwExterior(r,'#58634d',[]);
 assert.ok(r.faces.length>500);const tags=new Set(r.faces.map(f=>f.part));for(const tag of ['body.hood','body.door','body.glass','lighting.headlamp','lighting.indicator'])assert.ok(tags.has(tag),tag);
 for(const f of r.faces){assert.ok(/^#[0-9a-f]{6}$/i.test(f.color));for(const p of f.points){assert.equal(p.length,3);assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(p[0])<2.4);assert.ok(Math.abs(p[1])<1.1);assert.ok(p[2]>=.15&&p[2]<=1.410);}}
});

test('early coupe bumpers span the 4,488-mm shell and split rear lenses follow the correct panel',()=>{
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],lights:true});buildBmwExterior(r,'#58634d',[]);
 const tagged=id=>r.faces.filter(f=>f.part===id),coordinate=(faces,index)=>faces.flatMap(f=>f.points.map(p=>p[index]));
 const nose=Math.min(...coordinate(tagged('body.front-bumper'),0)),tail=Math.max(...coordinate(tagged('body.rear-bumper'),0));
 assert(Math.abs(tail-nose-4.488)<1e-8);assert(tail-2.725/2>-nose-2.725/2);
 for(const id of ['lighting.tail','lighting.reverse']){
  const faces=tagged(id),z=coordinate(faces,2);assert(faces.length>90);assert(Math.min(...z)>.74&&Math.max(...z)<.94);
  assert.equal(new Set(faces.map(f=>f.instance)).size,2);
  assert(faces.every(f=>id==='lighting.reverse'?f.rigid?.name==='trunk-lid':f.rigid?.name!=='trunk-lid'));
 }
 assert(tagged('lighting.headlamp').every(f=>f.points.every(p=>p[0]<-2.04&&p[2]<.83)));
 const assembled=GarageRenderer.assembledFaces({vehicle:'bmw325ci',paint:'silver',finish:'silver',parts:[]});
 const tips=assembled.filter(f=>f.part==='e46-exhaust.outlets'&&f.points.every(p=>p[0]>2.29));
 assert(tips.length>30);assert(tips.every(f=>f.points.every(p=>p[1]<0&&p[2]<.30)));
 assert(!tagged('body.structure').some(f=>f.color==='#20272a'&&f.points.every(p=>p[0]>2.3)));
});

test('all early US exterior lamp studies open from the installed car with matched illustrated parts plates',()=>{
 const ids=['headlamp','indicator','fog','repeater','tail','reverse'].map(id=>'lighting.'+id);
 const lights=getAssembly('bmw325ci','lighting');
 assert.deepEqual(new Set(lights.parts.map(p=>p.id)),new Set(ids));
 const available=GarageRenderer.assembledFaces({vehicle:'bmw325ci',paint:'silver',finish:'silver',parts:[]});
 for(const id of ids)assert(available.some(f=>f.part===id),id);
 for(const id of [...ids,'e46-halogen-headlamp.bulbs']){
  const detail=getDetail('bmw325ci',id);assert(detail&&detail.source.url.includes('325ci-coupe_m54_engine_e46/lighting/'),id);
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});detail.draw(r);
  for(const c of detail.groups[0].parts){
   const mesh=r.faces.filter(f=>f.part===c.id);assert(mesh.length,c.id);assert(mesh.every(f=>f.points.every(p=>p.every(Number.isFinite))),c.id);
  }
 }
 const head=getDetail('bmw325ci','lighting.headlamp');
 for(const tag of ['weather-lens','high','low','bulbs','caps','pilot','housing','gasket'])assert(head.componentIndex.has(head.id+'.'+tag));
 const bulb=getDetail('bmw325ci','e46-halogen-headlamp.bulbs');assert(bulb.componentIndex.has('e46-h7.filament'));
});

test('the bonnet pressing closes the wedges between the kidney grilles and bumper',()=>{
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],lights:false});
 buildBmwExterior(r,'#78816e',[]);
 const surfaces=r.faces.filter(f=>f.part==='body.hood'||f.part==='body.kidneys'||f.part==='body.structure');
 // Orthographic front view. The missing wedges previously gave direct lines
 // of sight to the starter, alternator and transmission between the grilles.
 const covered=(y,z)=>surfaces.some(({points})=>{
  if(points.some(p=>p[0]>-2.02))return false;
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
   const a=points[i],b=points[j];
   if((a[2]>z)!==(b[2]>z)&&y<(b[1]-a[1])*(z-a[2])/(b[2]-a[2])+a[1])inside=!inside;
  }
  return inside;
 });
 for(const y of [-.285,-.040,-.035,.035,.040,.285])for(const z of [.6505,.657,.669,.684])assert(covered(y,z),'unsealed nose at '+[y,z]);
});
