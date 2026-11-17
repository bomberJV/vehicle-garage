import {m113Stations} from './g500-m113-geometry.js';
import {drawG500PanelFilter,drawG500FilterTray,g500FilterSeat,g500FilterSources} from './g500-filter-geometry.js';
import {engineShapes} from './engine-shapes.js';
import {g500Induction,g500ExpansionTank} from './g500-engine-bay.js';
import {box,path,plus,iron,metal,alloy,rubber} from './road-service-geometry.js';
import {cyl,sleeve,turn,x} from './mechanism-shapes.js';
import {drawG500HeaterMatrix,g500HeaterPorts} from './g500-comfort-parts.js';

const catalog='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/';
const source=(label,url)=>({label,url});
export const g500FlowRefs={
 air:source('2002 G500 air-cleaner and throttle plate',catalog+'air-fuel-delivery/air-intake'),
 manifold:source('Mercedes-Benz WIS · M112/M113 variable intake manifold, GF09.20-P-3102-02A','https://www.carmanualsonline.info/amp/mercedes-benz-ml500-1997-complete-repair-manual/116'),
 coreSize:source('Nissens 62599A · replacement core dimensions, distributor catalog','https://www.partcatalog.com/products/nissens-62599a-radiator'),
 radiator:source('2002 G500 radiator and hose plate',catalog+'belts-cooling/radiator-components'),
 pump:source('2002 G500 coolant pump and thermostat plate',catalog+'belts-cooling/water-pump'),
 fan:source('2002 G500 fan and fan clutch plate',catalog+'belts-cooling/cooling-fan'),
 heater:source('Mercedes-Benz USA · G500 heater circulation pump and return piping','https://mbparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/cooling-auxiliary-heating--high-temperature-cooling-circuit'),
 core:source('Mercedes-Benz Classic USA · 2002 G500 heater core','https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/hvac--heater'),
 bay:source('2002 US G500 · engine compartment, RM Sotheby’s','https://cdn.rmsothebys.com/c/7/9/b/7/3/c79b7359c5a3a4254fff352a54accb606f862a23.webp')
};
const enginePoint=([x,y,z])=>[-1.235+x,y,.57+z];
// Preserve the head-port datum and fit the raised crown into the closed bonnet.
export const fitG500Intake=([x,y,z])=>[x>.218?.218+(x-.218)*.70:x,y,z<=.375?z:.375+(z-.375)*.79];
const intakePoint=p=>enginePoint(fitG500Intake(p));
const radiatorX=-1.999,pump=[-1.741,0,.780],stat=[-1.736,-.133,.831];
// 62599A nominal core as listed by Nissens distributors for OE 463 500 11 00.
export const g500RadiatorCore={width:.537,height:.569,depth:.040};
const upperNeck=[radiatorX+.033,-.284,1.034],lowerNeck=[radiatorX+.033,.284,.592];
const hotPort=[-.849,.236,.974],pumpIn=plus(pump,[.018,.104,-.040]);
const heaterPump=[-1.840,.574,.777];
const returnTube=[[-.782,.422,.971],[-.834,.523,.903],[-1.37,.522,.855],[-1.658,.520,.804]];
// Both heater hoses pass under the rear throttle body to the tubes at its left.
const supplyTube=[hotPort,[-.787,.236,.986],[-.790,.100,1.010],[-.790,-.120,1.015]];
const hose=(r,points,radius)=>{
 path(r,points,radius,rubber);
 for(const [a,b] of [[points[0],points[1]],[points.at(-1),points.at(-2)]]){
  const delta=b.map((v,i)=>v-a[i]),len=Math.hypot(...delta);
  const at=s=>a.map((v,i)=>v+delta[i]*s/len);
  r.rod(at(.009),at(.015),radius+.0018,'#a3a499',10);
 }
};
function intakeManifold(t){
 // Eight curved branches terminate in the inboard port mouths on the heads.
 t.box(-.370,-.092,.492,.421,.092,.572,'#858d8c');
 t.tube([.395,0,.551],[.427,0,.551],.055,.044,alloy,16);
 for(const side of [-1,1])for(const x of m113Stations){
  const runner=[[x,.061*side,.535],[x-.021,.104*side,.564],[x-.032,.157*side,.552],[x-.021,.189*side,.489],[x,.20*side,.375]];
  for(let i=1;i<runner.length;i++)t.cyl(runner[i-1],runner[i],.032,'#8a918e',8,false);
  t.cyl([x,.199*side,.375],[x,.227*side,.375],.038,'#949b97',8);
 }
}
const inductionParts=[
 ['intake-duct','Twin inlet ducts','Each front inlet feeds its own filter pocket. The clean-side passages meet at the back of the cleaner.',[-.43,0,.20],g500FlowRefs.air],
 ['airbox','Air-cleaner housing','The housing straddles both banks. The left pod leaves room for the engine-oil filler.',[.03,0,.49],g500FlowRefs.bay],
 ['air-filters','Two air-filter elements','Each side pod takes a 355 × 135 × 50 mm replacement element. The orange sealing rim surrounds the pleated media.',[0,.43,.32],g500FilterSources.air],
 ['maf','Hot-film air-mass meter','The two filtered streams pass this one meter before the throttle.',[.35,-.32,.28],g500FlowRefs.air],
 ['throttle','Electronic throttle body','The elbow turns air down to the butterfly at the rear of the intake manifold.',[.42,.27,.04],g500FlowRefs.air],
 ['intake','Variable intake manifold','Four runners on each side deliver air to the inboard cylinder-head ports. Open the section to operate the short-path flap.',[.08,-.32,-.22],g500FlowRefs.manifold]
];
const coolingParts=[
 ['radiator','Radiator and side tanks','Coolant passes through the transverse tubes between the end tanks. The radiator stands behind the A/C condenser.',[-.48,0,.16],g500FlowRefs.radiator,r=>{
  const cx=radiatorX;
  const {width,height,depth}=g500RadiatorCore;
  for(const side of [-1,1])box(r,[cx,side*(width/2+.020),.834],[.061,.040,height+.012],rubber);
  box(r,[cx,0,.834],[depth,width,height],'#4d5857');
  for(const side of [-1,1])for(let i=0;i<21;i++){
   const a=.834-height/2+.012+i*.026;
   r.polygon([[cx+side*(depth/2+.0005),-width/2,a],[cx+side*(depth/2+.0005),width/2,a],[cx+side*(depth/2+.0005),width/2,a+.003],[cx+side*(depth/2+.0005),-width/2,a+.003]],'#87918c',false);
  }
  for(const v of [upperNeck,lowerNeck])cyl(r,v,x,-.022,.012,.0185,iron,12);
 }],
 ['fan','Mechanical fan and viscous clutch','The belt turns the coolant-pump pulley. The clutch couples its shaft to the fan behind the radiator.',[-.32,-.15,.35],g500FlowRefs.fan,r=>{
  const center=[-1.944,0,pump[2]],fanRadius=.218;
  cyl(r,center,x,-.002,.155,.022,iron,14);
  cyl(r,center,x,-.022,.046,.052,metal,16);
  // The lip follows the blade sweep. The annular lip leaves an unobstructed fan opening.
  sleeve(r,center,x,-.012,.019,fanRadius+.022,fanRadius+.006,rubber,24);
  for(let i=0;i<8;i++){
   const a=2*Math.PI*i/8,at=(rad,turn,d)=>[center[0]+d,Math.cos(a+turn)*rad,center[2]+Math.sin(a+turn)*rad];
   r.polygon([at(.044,0,.018),at(.198,.16,.004),at(fanRadius,.30,-.005),at(.214,.49,-.011),at(.073,.45,.010)],'#64625a',false);
  }
 }],
 ['water-pump','Belt-driven coolant pump','The pulley and shaft turn the impeller inside the timing-cover-mounted housing. The catalogue lists pumps with and without an oil-cooler fitting.',[-.37,.27,-.08],g500FlowRefs.pump,r=>{
  turn(r,pump,x,[[-.041,.054],[-.016,.073],[.035,.075],[.069,.052],[.071,.018]],metal,{n:16});
  cyl(r,pump,x,-.067,-.042,.068,rubber,16);
  path(r,[pump,plus(pump,[.006,.067,-.013]),pumpIn],.034,metal);
 }],
 ['thermostat','Thermostat and outlet housing','A wax element moves the valve against its spring as coolant warms. Open the cutaway to see the valve lift off its seat.',[-.26,-.33,.16],g500FlowRefs.pump,r=>{
  cyl(r,stat,x,-.043,.055,.047,metal,15);
  path(r,[stat,plus(stat,[-.019,-.038,.031])],.029,metal);
  for(const dy of [-.052,.052])cyl(r,plus(stat,[.027,dy,0]),x,-.012,.018,.012,iron,7);
 }],
 ['upper-hose','Upper radiator hose','The upper hose meets the thermostat housing at the front of the engine.',[-.26,-.24,.37],g500FlowRefs.pump,r=>hose(r,[upperNeck,[-1.882,-.293,1.039],[-1.809,-.261,1.012],[-1.768,-.248,.902],plus(stat,[-.019,-.038,.031])],.026)],
 ['lower-hose','Lower radiator hose','The other large hose joins the lower radiator tank to the engine pump inlet.',[-.23,.32,-.19],g500FlowRefs.pump,r=>hose(r,[lowerNeck,[-1.863,.298,.614],[-1.794,.248,.635],[-1.751,.170,.692],pumpIn],.028)],
 ['bypass','Short bypass hose','This short engine-side connection supplies a return path as the thermostat restricts the radiator circuit.',[.10,-.31,-.13],g500FlowRefs.pump,r=>hose(r,[plus(stat,[.023,.027,-.017]),[-1.680,-.087,.793],plus(pump,[.032,-.029,0])],.018)],
 ['coolant-reservoir','Expansion tank and vent line','The capped tank sits on the right inner fender. Its small vent line runs forward to the radiator.',[.11,.41,.29],g500FlowRefs.bay,r=>{
  g500ExpansionTank(engineShapes(r,enginePoint));
  hose(r,[enginePoint([.12,.632,.406]),[-1.258,.653,.932],[-1.578,.635,.894],[-1.844,.627,.961],[radiatorX+.030,.286,1.066]],.008);
  hose(r,[enginePoint([.14,.632,.330]),[-1.273,.632,.843],[-1.543,.548,.736],[-1.863,.298,.614]],.012);
 }],
 ['heater-feed','Heater supply and bulkhead coupling','Warm coolant reaches the cabin heat exchanger through this branch. The two bulkhead connections meet the tubes in the HVAC view.',[.22,-.17,.30],g500FlowRefs.heater,r=>hose(r,[...supplyTube,g500HeaterPorts[0]],.014)],
 ['heater-return','Heater return tube and molded hoses','The return passes through the second coupling and along the engine bay. Hose bends and clip stations are approximate.',[.30,.31,-.05],g500FlowRefs.heater,r=>{
  hose(r,[g500HeaterPorts[1],[-.790,-.170,1.040],[-.800,-.170,.975],[-.805,.100,.975],[-.800,.338,.990],returnTube[0]],.014);
  path(r,returnTube,.014,'#8b928e');
  hose(r,[returnTube.at(-1),[-1.765,.523,.792],plus(heaterPump,[.035,-.015,.015])],.014);
  hose(r,[plus(heaterPump,[-.033,.002,.003]),[-1.899,.471,.730],[-1.840,.283,.696],pumpIn],.014);
 }],
 ['heater-pump','Electric heater circulation pump','A separate electric pump circulates coolant through the heater circuit. Its mounting bracket and hose bends are represented schematically.',[-.14,.42,-.04],g500FlowRefs.heater,r=>{
  cyl(r,heaterPump,x,-.035,.051,.030,rubber,12);
  cyl(r,heaterPump,x,-.046,-.026,.036,iron,12);
  box(r,plus(heaterPump,[.025,0,.031]),[.024,.024,.016],rubber);
 }],
 ['heater-core','Cabin heater core','Coolant passes through the matrix behind the dashboard. Air blown across the fins carries its heat into the cabin.',[.40,.09,.20],g500FlowRefs.core,drawG500HeaterMatrix]
];
const group=(id,name,description,source,rows)=>({id,name,description,source,view:'hero',category:'service',internal:true,parts:rows.map(([key,name,description,offset,source,draw])=>({id:id+'.'+key,name,description,offset,source,draw}))});
export const g500FlowGroups=[
 group('intake','Air intake','Follow the two front ducts into the paired filter elements, through the single rear meter and throttle, then out to eight head ports.',g500FlowRefs.air,inductionParts),
 group('cooling','Engine and heater coolant','Trace the radiator circuit and its bypass, then follow the separate heater supply and return through the bulkhead.',g500FlowRefs.pump,coolingParts)
];
// The air cleaner, its ducts and the meter stand 25 mm higher, clear of the valve covers.
// The throttle bore stays on the manifold; only the bend above it follows.
export const g500CleanerLift=.025;
export function drawG500InductionCircuit(r,prefix='intake'){
 const tag=(key,fn)=>r.tag(prefix+'.'+key,fn);
 let raise=()=>0;
 const t=engineShapes(r,p=>{const q=intakePoint(p);return [q[0],q[1],q[2]+raise(p)];});
 const fixed=engineShapes(r,intakePoint);
 const metric=engineShapes(r,p=>{const q=enginePoint(p);return [q[0],q[1],q[2]+g500CleanerLift];});
 const lifted=new Set(['airbox','intake-duct','maf']);
 g500Induction((key,draw)=>tag(key,()=>{
  raise=lifted.has(key)?()=>g500CleanerLift:key==='throttle'?p=>p[2]>=.60?g500CleanerLift:0:()=>0;
  draw();
  raise=()=>0;
  if(key==='airbox')for(const s of [-1,1])drawG500FilterTray(metric,g500FilterSeat(s));
 }),t);
 tag('air-filters',()=>{
  for(const s of [-1,1])drawG500PanelFilter(metric,g500FilterSeat(s));
 });
 tag('intake',()=>intakeManifold(fixed));
}
export function drawG500CoolingCircuit(r,prefix='cooling'){
 for(const [key,,,,,draw] of coolingParts){
  if(key==='heater-core'&&r.inspection?.assembly!=='cooling')continue;
  if(prefix==='powertrain'&&!engineCooling.has(key))continue;
  if(prefix==='cooling'&&r.inspection?.assembly==='powertrain'&&engineCooling.has(key))continue;
  r.tag(prefix+'.'+key,()=>draw(r));
 }
}
const engineCooling=new Set(['radiator','fan','water-pump','thermostat','upper-hose','lower-hose','coolant-reservoir']);
