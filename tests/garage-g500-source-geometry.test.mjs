import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {drawG500InductionCircuit,drawG500CoolingCircuit} from '../garage/g500-flow.js';
import {drawG500EngineOilPart} from '../garage/g500-oil-circuits.js';
import {drawG500ServiceAssembly} from '../garage/g500-service-systems.js';
import {fuelFilterCenter,oilAxis} from '../garage/g500-filter-geometry.js';
import {m113Cell,m113Pin,m113Stations} from '../garage/g500-m113-geometry.js';
const render=draw=>{const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});draw(r);return r.faces;};
const study=id=>getDetail('g500',id);
const selected=(faces,id)=>faces.filter(f=>f.part===id);
const vertices=faces=>faces.flatMap(f=>f.points);
const dimensions=points=>[0,1,2].map(i=>Math.max(...points.map(p=>p[i]))-Math.min(...points.map(p=>p[i])));
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const closeVector=(a,b)=>a.forEach((x,i)=>near(x,b[i]));
const normalized=p=>p.map(v=>v/Math.hypot(...p));
const dot=(a,b)=>a.reduce((sum,n,i)=>sum+n*b[i],0);

test('each side of the intake uses the same measured replacement envelope under the hood and in the opened cleaner',()=>{
 const mounted=vertices(selected(render(r=>drawG500InductionCircuit(r)),'intake.air-filters'));
 const opened=render(r=>study('intake.air-filters').draw(r));
 for(const [side,id] of [[-1,'left-filter'],[1,'right-filter']]){
  const installed=mounted.filter(p=>p[1]*side>0);
  const element=vertices(selected(opened,'g500-air-cleaner.'+id));
  closeVector(dimensions(installed),[.355,.135,.050]);
  closeVector(dimensions(element),dimensions(installed));
 }
});

test('the oil element keeps its 115 mm axial length and both 31 mm bores inside the installed housing and in the open section',()=>{
 const fitted=render(r=>drawG500EngineOilPart(r,'oil-filter'));
 const opened=selected(render(r=>study('engine-oil.oil-filter').draw(r)),'g500-oil-cartridge.element');
 const measure=(points,c,axis)=>{
  const n=normalized(axis),offsets=points.map(p=>p.map((v,i)=>v-c[i]));
  const axial=offsets.map(p=>dot(p,n));
  const radial=offsets.map((p,j)=>Math.hypot(...p.map((v,i)=>v-axial[j]*n[i])));
  near(Math.max(...axial)-Math.min(...axial),.115);near(Math.max(...radial),.032);
  for(const station of [-.0575,.0575]){
   const edge=radial.filter((_,i)=>Math.abs(axial[i]-station)<1e-7);
   near(Math.min(...edge),.0155);
  }
 };
 // Cap and pleat material identifies the nested component inside the casting.
 const count=opened.length;
 measure(vertices(fitted.slice(0,count)),[-1.650,-.266,.948],oilAxis);
 measure(vertices(opened),[0,0,.35],[0,0,1]);
});

test('the regulator filter at its tank mounting uses the same envelope and faces as the exploded filter',()=>{
 const opened=vertices(selected(render(r=>study('fuel.delivery').draw(r)),'g500-fuel-delivery.filter'));
 closeVector(dimensions(opened),[.160,.075,.075]);
 const fitted=vertices(selected(render(r=>drawG500ServiceAssembly(r,'g500','fuel')),'fuel.delivery'));
 const pointKey=p=>p.map(v=>v.toFixed(6)).join(',');
 const installed=new Set(fitted.map(pointKey));
 for(const p of opened)assert(installed.has(pointKey(p.map((v,i)=>v+fuelFilterCenter[i]))));
});

test('the G500 rotating assembly has four 42 mm throws, 106 mm cylinder spacing, 148.5 mm rods and 84 mm piston travel',()=>{
 near(dot(m113Cell(0,1).n,m113Cell(0,-1).n),0);
 for(let i=0;i<4;i++){
  const [,y,z]=m113Pin(i);near(Math.hypot(y,z),.042);
  if(i)near(m113Stations[i]-m113Stations[i-1],.106);
  for(const s of [-1,1]){
   const positions=[];
   for(let step=0;step<16;step++){
    const c=m113Cell(i,s,step/16);
    near(Math.hypot(...c.big.map((v,j)=>v-c.pin[j])),.1485);
    positions.push(dot(c.pin,c.n));
   }
   near(Math.max(...positions)-Math.min(...positions),.084);
  }
 }
 const detail=study('powertrain.crankshaft');
 assert.equal(detail.id,'g500-m113-motion');
 assert.deepEqual(study('powertrain.pistons').id,detail.id);
 assert.equal(selected(render(r=>detail.draw(r,.125)),'slider.crank').length,selected(render(r=>detail.draw(r,0)),'slider.crank').length);
});

test('the installed radiator core spans the same nominal width, height and depth as its opened tube stack',()=>{
 const mounted=selected(render(r=>drawG500CoolingCircuit(r)),'cooling.radiator').filter(f=>f.color==='#4d5857'||f.color==='#87918c');
 // The core box is shaded by face. Its tube strips remain identifiable at both faces.
 const stripDimensions=dimensions(vertices(mounted.filter(f=>f.color==='#87918c')));
 near(stripDimensions[1],.537);near(stripDimensions[0],.041);
 const opened=selected(render(r=>study('cooling.radiator').draw(r)),'g500-radiator.tubes');
 closeVector(dimensions(vertices(opened)),[.040,.537,.569]);
});
