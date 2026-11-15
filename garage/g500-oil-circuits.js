import {m113Stations,m113CrankZ,m113PanRail,m113PanOutline} from './g500-m113-geometry.js';
import {cyl,sleeve,x,y,z} from './mechanism-shapes.js';
import {engineShapes} from './engine-shapes.js';
import {g500FluidAccess} from './g500-engine-bay.js';
import {box,path,plus,metal,alloy,iron,rubber} from './road-service-geometry.js';
import {slab} from './section-primitives.js';
import {fluidRefs as ref} from './g500-fluid-refs.js';

const oilColor='#9c884c';
const local=([x,y,z])=>[-1.235+x,y,.57+z];
const crankPoint=([x,y,z])=>[-1.235+x,y,m113CrankZ+z];

function drawM113Pan(t){
 // WIS AR01.45-P-7555VA places the detachable lower bowl at the pulley
 // end. The rear casting is shallow and its right side bridges the carrier.
 // The silhouettes and installed clearances are fitted, in metres.
 const upper=height=>m113PanOutline.map(([x,y])=>[x,y,height]);
 const bowl=[[-.373,-.111],[-.338,-.167],[-.106,-.167],[-.065,-.121],
  [-.065,-.003],[-.114,.061],[-.312,.061],[-.373,.021]];
 const bowlRing=(scale,height)=>bowl.map(([x,y])=>[-.223+(x+.223)*scale,-.054+(y+.054)*scale,height]);
 const join=(a,b,color)=>{
  for(let i=0;i<a.length;i++){
   const j=(i+1)%a.length;
   t.poly([a[i],a[j],b[j]],color);t.poly([a[i],b[j],b[i]],color);
  }
 };
 const rim=upper(m113PanRail),lip=upper(m113PanRail-.008);
 const shoulder=m113PanOutline.map(([x,y])=>[x*.966,y*.95,y>0?-.053:-.074]);
 const seat=bowlRing(1,-.086),seam=bowlRing(1,-.092);
 const floor=bowlRing(.89,-.123);
 join(rim,lip,metal);join(lip,shoulder,alloy);join(shoulder,seat,alloy);
 join(seat,seam,metal);join(seam,floor,iron);t.poly(floor,iron);
 // The drain is in the forward bowl. Two low cast webs run along the
 // shallow tail, ending short of the detachable pan flange.
 const plug=[-.289,-.113,-.123];
 t.cyl(plug,[plug[0],plug[1],-.129],.011,metal,6);
 for(const i of [3,4]){
  const [x,y,z]=shoulder[i],nose=seat[i];
  t.poly([[x,y-.004,z],[x,y,z-.005],nose],metal);
  t.poly([[x,y,z-.005],[x,y+.004,z],nose],alloy);
 }
}
// These four physical parts also appear in the M113 engine tree. Keep the same
// geometry and dimensions when switching the assembly that owns the instance.
export function drawG500EngineOilPart(r,key){
 const t=engineShapes(r,key==='oil-filter'?local:crankPoint);
 if(key==='sump'){
  drawM113Pan(t);
 }else if(key==='oil-pump'){
  t.cyl([-.425,0,-.085],[-.340,0,-.085],.065,iron,12);
  t.tube([-.430,0,-.085],[-.424,0,-.085],.058,.025,metal,12);
 }else if(key==='oil-pickup'){
  t.route([[-.35,0,-.085],[-.301,-.024,-.077],[-.234,-.066,-.094]],.011,oilColor);
  t.cyl([-.234,-.066,-.111],[-.234,-.066,-.093],.039,iron,16);
  for(const yy of [-.022,0,.022])t.box(-.261,-.067+yy,-.112,-.207,-.065+yy,-.111,metal);
 }else if(key==='oil-filter')g500FluidAccess((k,fn)=>{if(k===key)fn();},t);
}
const oilParts=[
 ['sump','Upper and lower oil pan','The M113.962 carries its lower oil pan at the pulley end. The shallow rear casting passes above the front axle, with clearance for the differential on the passenger side. The installed contours are estimated.',[.13,.10,-.32],ref.pan],
 ['oil-pickup','Suction pipe and strainer','The screened inlet sits inside the forward bowl. A short pipe connects it to the suction side of the oil pump.',[.12,-.25,-.15],ref.oil],
 ['oil-pump','Engine oil pump','The front-mounted pump draws oil from the strainer and supplies the filter housing and pressure circuit.',[-.27,-.10,-.12],ref.oil],
 ['oil-filter','Oil-filter housing and cartridge','A removable cap holds a pleated cartridge above the pump. Open the housing to inspect the cap stem, element, bore and seals.',[-.12,-.25,.22],ref.filter]
];
export const oilRows=[
 ...oilParts.map(row=>[...row,r=>drawG500EngineOilPart(r,row[0])]),
 ['cooler','Engine oil-to-coolant heat exchanger','The exchanger bolts beside the oil-filter housing. Oil and coolant use separate passages across the plate stack.',[-.18,.15,.20],ref.filter,r=>{
  const c=local([-.406,-.184,.325]);
  for(let j=0;j<7;j++)slab(r,c[0],c[1],c[2]+j*.006,.100,.099,.0045,metal,.014);
  for(const yy of [-.023,.023])cyl(r,plus(c,[.027,yy,.041]),x,.002,.026,.012,alloy,10);
 }],
 ['pressure-feed','Pressure galleries and bearing feeds','These paths mark oil passages inside the casting. Filtered oil feeds the crankshaft bearings and both cylinder heads. The paths show the connections schematically.',[.17,.20,.11],ref.jets,r=>{
  const branch=crankPoint([-.408,-.104,.075]);
  path(r,[local([-.411,-.258,.308]),branch],.006,oilColor);
  for(const s of [-1,1]){
   const gallery=side=>crankPoint([side,s*.106,.040]);
   path(r,[branch,gallery(-.370),gallery(.346)],.006,oilColor);
   for(let i=0;i<5;i++){
    const station=-.212+i*.106;
    path(r,[gallery(station),crankPoint([station,s*.069,.015]),crankPoint([station,s*.030,0])],.0045,oilColor);
   }
   path(r,[gallery(.318),crankPoint([.318,s*.180,.163]),local([.318,s*.302,.369]),local([.318,s*.35,.465]),local([-.270,s*.35,.465])],.005,oilColor);
  }
 }],
 ['jets','Piston-cooling oil nozzles','Bent nozzle tips aim oil at the undersides of the pistons. Each cylinder has its own tip inside the crankcase.',[.06,-.19,.19],ref.jets,r=>{
  for(const s of [-1,1])for(let i=0;i<4;i++){
   const xx=m113Stations[i]+s*.009,root=crankPoint([xx-.025,s*.106,.04]);
   cyl(r,root,z,-.003,.009,.010,metal,6);
   path(r,[root,crankPoint([xx-.025,s*.113,.055]),crankPoint([xx,s*.132,.078]),crankPoint([xx+.004,s*.144,.095])],.0035,alloy);
  }
 }]
];
export const sharedOilKeys=new Set(oilParts.map(row=>row[0]));

// Cross-section of the shallow stamped transmission pan and its rolled sealing lip.
const pan=[-.558,0,.356],panOutline=[[-.188,-.111],[-.152,-.139],[.132,-.139],[.185,-.094],[.177,.117],[.145,.135],[-.159,.135],[-.188,.093]];
export function panShell(r,c,scale=1){
 const ring=(factor,h)=>panOutline.map(([u,v])=>plus(c,[u*factor*scale,v*factor*scale,h*scale]));
 const bottom=ring(.92,-.060),top=ring(1,0),inside=ring(.90,-.048),lip=ring(.95,0);
 r.polygon(bottom,iron,false);r.polygon(inside,metal,false);
 for(let i=0;i<top.length;i++){
  const j=(i+1)%top.length;
  r.polygon([bottom[i],bottom[j],top[j],top[i]],iron,false);
  r.polygon([top[i],top[j],lip[j],lip[i]],metal,false);
  r.polygon([lip[i],lip[j],inside[j],inside[i]],alloy,false);
 }
}
export function panSeal(r,c,scale=1){
 const loop=panOutline.map(([u,v])=>plus(c,[u*.968*scale,v*.968*scale,.002*scale]));path(r,[...loop,loop[0]],.004*scale,rubber);
}
// MANN H 182 KIT section A / D / H. The remaining outline is fitted to
// MANN's product photograph rather than a dimensioned plan of the OE filter.
export function drawG500PickupFilter(r,c,scale=1){
 const edge=[[-.106,-.020],[-.099,-.036],[-.075,-.047],[-.041,-.047],[-.029,-.0555],[.074,-.0555],[.092,-.050],[.104,-.035],[.108,.024],[.103,.043],[.088,.0555],[-.004,.0555],[-.025,.045],[-.071,.043],[-.094,.032],[-.104,.019]];
 const ring=(f,h)=>edge.map(([x,y])=>plus(c,[f*x*scale,f*y*scale,h*scale]));
 const bottom=ring(.94,0),flange=ring(1,.014),lid=ring(.97,.018);
 r.polygon(bottom,iron,false);r.polygon(lid,metal,false);
 for(let i=0;i<edge.length;i++){
  const j=(i+1)%edge.length;
  r.polygon([bottom[i],bottom[j],flange[j],flange[i]],rubber,false);
  r.polygon([flange[i],flange[j],lid[j],lid[i]],alloy,false);
 }
 const position=(u,v,h)=>plus(c,[u*scale,v*scale,h*scale]);
 const neck=position(-.068,.003,.018);
 sleeve(r,neck,z,0,.019*scale,.014*scale,.009*scale,alloy,24);
 sleeve(r,neck,z,.015*scale,.0185*scale,.014*scale,.012*scale,rubber,24);
 for(const [u,v] of [[-.078,-.018],[-.070,.022],[-.044,-.021],[.013,-.033],[.026,.015],[.053,-.022]])cyl(r,position(u,v,.018),z,0,.0017*scale,.003*scale,iron,9);
}
const cooler=[-2.066,0,.712];
const coolerPorts=[[-2.060,-.407,.687],[-2.060,.407,.737]];
const union=s=>[-.644,s*.155,.426];
export const atfRows=[
 ['pan','Transmission oil pan','The shallow stamped pan holds the fluid beneath the five-speed automatic. Its rim and the case clamp the perimeter gasket.',[.14,-.10,-.27],ref.atfPan,r=>panShell(r,pan)],
 ['pan-seal','Pan gasket and drain plug','A molded gasket follows the irregular pan rim. A separate sealing washer sits underneath the drain plug.',[.12,.22,-.15],ref.atfPan,r=>{
  panSeal(r,pan);const c=plus(pan,[.097,-.053,-.061]);
  cyl(r,c,z,-.001,.002,.013,alloy,10);cyl(r,c,z,-.009,-.001,.009,iron,6);
 }],
 ['filter','Transmission suction filter','The MANN replacement measures 111 mm across its body. The 28 mm outlet neck seals into the valve body above.',[-.10,-.23,-.15],ref.atfFilter,r=>drawG500PickupFilter(r,plus(pan,[.006,-.005,-.031]))],
 ['valve-body','Hydraulic valve body','The casting carries fluid between the control valves. The plate above it carries the electrical contacts and speed sensors.',[.13,.25,.08],ref.shift,r=>{
  slab(r,pan[0],0,pan[2]+.009,.324,.209,.035,alloy,.018);
  for(const yy of [-.054,-.013,.028,.069])box(r,plus(pan,[.013,yy,.007]),[.253,.010,.007],iron);
 }],
 ['conductor-plate','Conductor plate and six solenoids','The 722.6 conductor plate connects three shift solenoids, two pressure-control solenoids and the converter-clutch solenoid to the transmission controller.',[-.11,.18,.18],ref.shift,r=>{
  slab(r,pan[0]+.006,0,pan[2]+.045,.307,.190,.009,rubber,.018);
  for(const s of [-1,1])for(let i=0;i<3;i++)cyl(r,plus(pan,[-.101+i*.097,s*.066,.051]),z,0,.032,.014,iron,10);
  cyl(r,plus(pan,[.112,.094,.055]),y,-.005,.032,.016,rubber,12);
 }],
 ['cooler','External transmission oil cooler','Flat tubes span the two headers. Front airflow removes heat from the fluid while two separate brackets support the core.',[-.33,0,.12],ref.atfCooler,r=>{
  for(const s of [-1,1])box(r,plus(cooler,[0,s*.396,0]),[.024,.020,.099],iron);
  for(let i=0;i<7;i++)box(r,plus(cooler,[0,0,-.041+i*.0135]),[.023,.770,.005],metal);
  for(let i=0;i<33;i++)box(r,plus(cooler,[0,-.372+i*.023,0]),[.015,.002,.085],iron);
  for(const [i,s] of [-1,1].entries())sleeve(r,coolerPorts[i],y,-.013,.013,.011,.007,alloy,8);
 }],
 ['brackets','Right and left cooler brackets','A bracket at either end locates the core. A rubber bushing sits between the support and its attachment.',[-.12,.24,-.14],ref.atfCooler,r=>{
  for(const s of [-1,1]){
   const c=plus(cooler,[.012,s*.401,-.062]);
   box(r,c,[.043,.028,.014],iron);box(r,plus(c,[.017,0,.033]),[.009,.028,.072],iron);
   sleeve(r,c,z,-.010,.008,.011,.005,rubber,10);
  }
 }],
 ...[-1,1].map((s,i)=>[s<0?'left-line':'right-line',s<0?'Driver-side cooler pipe':'Passenger-side cooler pipe','The bent steel pipe runs forward from a transmission-case union. The short front connection joins the pipe to its cooler header.',[-.03,s*.29,-.09],ref.atfCooler,r=>{
  const c=union(s),front=[-1.888,s*.433,.487];
  cyl(r,c,y,-.014,.014,.014,alloy,6);
  path(r,[c,[-.788,s*.208,.435],[-.981,s*.228,.420],[-1.468,s*.236,.405],[-1.717,s*.321,.430],front],.008,metal);
  path(r,[front,[-1.970,s*.516,.514],[-2.042,s*.523,.558],[-2.060,s*.488,coolerPorts[i][2]],coolerPorts[i]],.009,rubber);
 }])
];
