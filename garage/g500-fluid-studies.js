import {drawG500OilElement,g500FilterSources} from './g500-filter-geometry.js';
import {engineShapes} from './engine-shapes.js';
import {study,part,turn,cyl,sleeve,bead,x,y,z,TAU} from './mechanism-shapes.js';
import {box,path,plus,iron,metal,alloy,rubber,copper} from './road-service-geometry.js';
import {slab} from './section-primitives.js';
import {panShell,panSeal,drawG500PickupFilter} from './g500-oil-circuits.js';
import {fluidRefs as ref} from './g500-fluid-refs.js';

const O=[0,0,.35],up=[.04,.05,.39],down=[-.06,0,-.35],forward=[-.34,-.08,.03],back=[.34,.07,.07],left=[.05,-.34,.05],right=[.04,.34,.08];
const travel=t=>Math.sin(t*TAU),lift=t=>(1-Math.cos(t*TAU))*.5;
function cutShell(r,c,axis,low,high,outer,inner,color,start=.45,sweep=Math.PI*1.37){
 turn(r,c,axis,[[low,inner],[low,outer],[high,outer],[high,inner],[low,inner]],color,{n:18,start,sweep});
}
const filter=study('g500-oil-cartridge','M113 cartridge oil filter','The cap lifts the element from its housing. The replacement cartridge measures 115 mm end to end. The cap, casting and seal positions are shown to illustrate how the element fits.',g500FilterSources.oil,[
 part('housing','Filter housing','The cut side exposes the space around the cartridge. Its base joins the engine lubrication circuit.',[.04,.05,.006],r=>cutShell(r,O,z,-.078,.075,.051,.040,metal)),
 part('element','Pleated filter element','The 64 mm cartridge has a 31 mm opening at each end for the center stem. Pleat count and end-cap thickness are illustrative.',[-.035,-.055,.014],r=>drawG500OilElement(engineShapes(r),O,z)),
 part('cap','Cap and center stem','The stem passes through the center of the cartridge. The cap seals the open end of the casting.',[0,0,.074],r=>{
  turn(r,O,z,[[-.085,0],[-.085,.006],[-.050,.008],[-.045,.012],[.057,.012],[.066,.042],[.075,.051],[.096,.051],[.096,.03]],rubber,{n:18});
  cyl(r,O,z,.096,.105,.029,iron,12);
 }),
 part('seals','Cap and stem O-rings','One ring seals the circumference of the cap. Smaller rings fit the stem.',[.015,0,-.050],r=>{
  for(const [h,rad] of [[.068,.043],[-.048,.009],[-.066,.0075],[-.080,.0065]])sleeve(r,O,z,h,h+.002,rad+.001,rad-.001,'#5d6758',18);
 })
]);
const heatExchanger=study('g500-oil-exchanger','Engine oil heat exchanger','A cut through the stack shows the two fluids on opposite sides of each plate. Plate spacing and port passages are enlarged to make the flow paths visible.',ref.filter,[
 part('stack','Stacked exchanger plates','Alternating layers carry oil and coolant. The metal transmits heat while the two fluids stay separate.',right,r=>{
  for(let j=0;j<8;j++)slab(r,0,0,.240+j*.022,.327,.257,.007,alloy,.032);
 }),
 part('oil','Oil ports at the filter housing','A pair of openings links the exchanger to the filter casting. Oil enters one opening and returns through the other.',down,r=>{
  for(const xx of [-.089,.089]){sleeve(r,[xx,-.055,.22],z,-.025,.018,.024,.014,copper,14);sleeve(r,[xx,-.055,.22],z,.014,.020,.030,.022,rubber,16);}
 }),
 part('coolant','Coolant necks and end cap','Coolant enters and leaves the other side of the exchanger. The upper cover closes the stacked plates.',up,r=>{
  slab(r,0,0,.404,.338,.264,.014,metal,.033);
  for(const xx of [-.088,.088]){sleeve(r,[xx,.061,.417],z,0,.038,.020,.015,alloy,14);sleeve(r,[xx,.061,.417],z,.031,.040,.023,.019,metal,14);}
 })
]);
const pan=study('g500-atf-pan','722.6 oil pan and suction filter','The filter sits inside the pan. Its outlet neck seals into the hydraulic assembly above, while the gasket seals the outer pan rim.',ref.atfPan,[
 part('pan','Stamped oil pan','The stamped sides and rolled lip form a reservoir below the hydraulic assembly.',down,r=>panShell(r,O,1.58)),
 part('gasket','Perimeter gasket','The gasket follows the complete pan rim, including its cut corners.',left,r=>panSeal(r,O,1.58)),
 part('filter','Flat suction filter','The replacement drawing gives a 111 mm body width, 18 mm body height and 28 mm outlet diameter. Its neck seals upward into the hydraulic assembly.',up,r=>drawG500PickupFilter(r,[.010,-.008,.302],1.58)),
 part('plug','Drain plug and sealing washer','The washer seals the drain plug against the stamped pan.',forward,r=>{
  const c=plus(O,[.153,-.084,-.096]);sleeve(r,c,z,-.002,.003,.023,.013,copper,14);
  cyl(r,c,z,-.015,-.002,.016,iron,6);cyl(r,c,z,-.002,.021,.012,metal,12);
 })
]);
const solenoidSites=[[-.137,-.101],[-.012,-.101],[.127,-.101],[-.137,.101],[-.012,.101],[.127,.101]];
const valve=study('g500-atf-control','722.6 electrohydraulic control unit','The hydraulic plate directs fluid. The conductor plate links the three shift valves, two pressure regulators and converter-clutch valve to an external control module.',ref.shift,[
 part('casting','Hydraulic valve body','The cast body contains the valve bores and oil passages. The visible channels illustrate the two-layer construction.',down,r=>{
  slab(r,0,0,.242,.424,.294,.044,metal,.022);
  for(const xx of [-.17,-.11,-.05,.01,.07,.13])box(r,[xx,0,.294],[.010,.229,.016],iron);
  for(const yy of [-.115,-.061,.026,.106])box(r,[0,yy,.294],[.353,.009,.016],iron);
 }),
 part('plate','Conductor plate','The insulating plate carries electrical contacts and the two transmission speed sensors.',right,r=>{
  slab(r,0,0,.308,.404,.284,.021,rubber,.023);
  for(const xx of [-.072,.069])cyl(r,[xx,0,.329],z,0,.045,.017,rubber,12);
 }),
 part('solenoids','Six electrohydraulic solenoids','Three valves manage the shifts. The other three control modulating pressure, shift pressure and converter-clutch pressure.',up,r=>{
  for(const [xx,yy] of solenoidSites){cyl(r,[xx,yy,.326],z,0,.061,.026,metal,14);cyl(r,[xx,yy,.387],z,0,.011,.020,rubber,12);box(r,[xx,yy*.76,.371],[.017,.032,.010],copper);}
 }),
 part('connector','Vehicle-harness connector','The case connector carries power and signals between the conductor plate and the external controller.',left,r=>{
  const c=[.119,.151,.332];sleeve(r,c,y,-.022,.069,.039,.030,rubber,18);
  for(let i=0;i<13;i++){const a=i*TAU/(i<8?8:5),rad=i<8?.023:.012;cyl(r,plus(c,[Math.cos(a)*rad,0,Math.sin(a)*rad]),y,.029,.058,.0028,copper,6);}
 })
]);
const purge=study('g500-purge-solenoid','Purge valve · Y58/1','With the outlet under manifold vacuum, the valve meters vapor as the control unit pulses its coil. The cutaway shows an illustrative solenoid, spring and seat.',ref.evapControls,[
 part('body','Inlet, seat and outlet','The hose from the canister reaches one side of the valve seat; the other port leads to the intake manifold.',forward,r=>{
  cutShell(r,O,z,-.08,.017,.112,.096,rubber);
  sleeve(r,O,z,-.044,-.032,.075,.025,alloy,18);
  for(const s of [-1,1])sleeve(r,plus(O,[s*.114,0,s*.018-.040]),x,-.051,.051,.031,.021,rubber,14);
 }),
 part('coil','Magnetic coil','Current in the fixed winding produces the magnetic field that lifts the armature.',right,r=>{
  for(let j=0;j<7;j++)sleeve(r,O,z,.023+.010*j,.031+.010*j,.077,.043,copper,16);
  box(r,plus(O,[.087,0,.062]),[.040,.039,.030],rubber);
 }),
 part('poppet','Armature and sealing face','The armature lifts the sealing face off the seat while the coil is energized.',up,(r,t)=>{
  const c=plus(O,[0,0,lift(t)*.034]);cyl(r,c,z,-.029,.055,.019,metal,12);cyl(r,c,z,-.032,-.024,.032,rubber,16);
 }),
 part('spring','Return spring','The return spring brings the poppet back to its seat when the coil releases.',back,(r,t)=>{
  const p=[];for(let i=0;i<=32;i++){const u=i/32,a=u*TAU*4;p.push(plus(O,[.024*Math.cos(a),.024*Math.sin(a),.056+.034*lift(t)+u*(.065-.034*lift(t))]));}path(r,p,.0035,alloy);
 })
],'The armature opens and closes one vapor passage. Travel is enlarged so the sealing face can be seen against the seat.');
const canister=study('g500-carbon-bed','Fuel-vapor canister','Fuel vapor adheres to the activated carbon. During purge, incoming air carries stored hydrocarbons toward the intake. The cutaway enlarges representative carbon grains.',ref.evapCase,[
 part('shell','Canister shell','The molded shell keeps the vapor path enclosed. A side is cut away so the carbon bed stays visible.',left,r=>{
  box(r,[0,-.106,.349],[.318,.012,.148],rubber);box(r,[0,.106,.278],[.318,.012,.018],iron);
  box(r,[0,0,.276],[.318,.201,.011],iron);box(r,[-.150,0,.349],[.015,.202,.138],iron);
 }),
 part('media','Activated-carbon bed','The porous carbon stores hydrocarbons between purge events. The grains are enlarged to show the material.',up,r=>{
  for(let i=0;i<7;i++)for(let j=0;j<4;j++)for(let k=0;k<3;k++){
   const c=[-.111+i*.035+(j%2)*.007,-.067+j*.043,.302+k*.034];cyl(r,c,[.35,1,.19],-.012,.012,.015,(i+j+k)%2?'#424b46':'#5b6257',6);
  }
 }),
 part('screens','Media-retaining screens','The retainers hold the carbon in the enclosure while allowing air and vapor to pass.',right,r=>{
  for(const xx of [-.137,.136])for(let i=0;i<8;i++)box(r,[xx,-.078+i*.022,.349],[.007,.006,.127],alloy);
 }),
 part('ports','Tank, purge and fresh-air connections','The vapor and purge connections serve the carbon bed. The fresh-air passage connects with the shutoff valve.',back,r=>{
  for(const yy of [-.050,.048])sleeve(r,[.153,yy,.374],x,-.007,.058,.021,.014,rubber,14);
  sleeve(r,[.049,.105,.371],y,0,.058,.020,.013,rubber,14);
 })
]);
// Axial travel of the ball nut and the angle of the sector are coupled by the
// effective pitch radius. This is an explanatory section, not a steering ratio.
const worm=[0,0,.425],sector=[0,.132,.423],pitchRadius=.084;
const twist=t=>travel(t)*1.08,dx=t=>twist(t)*.030,angle=t=>-dx(t)/pitchRadius;
function sectorPoint(a,r,h){return plus(sector,[Math.sin(a)*r,-Math.cos(a)*r,h]);}
const steering=study('g500-ball-steering','Recirculating-ball steering gear','The worm moves a ball-supported rack piston. Its teeth rotate a sector shaft that swings the pitman arm. Hydraulic pressure assists the piston inside the steering box.',ref.ballGear,[
 part('case','Steering-box casting','The cylinder guides the power piston. The output shaft leaves the casing below the sector.',back,r=>{
  cutShell(r,worm,x,-.226,.208,.093,.081,iron,5.45,2.82);
  cutShell(r,sector,z,-.132,.070,.074,.058,iron,5.45,2.75);
 }),
 part('worm','Input worm and shaft','Turning the steering shaft rotates the worm. Balls carry the load between its helical track and the ball nut.',forward,(r,t)=>{
  const a=twist(t);cyl(r,worm,x,-.286,.220,.024,metal,16);
  const points=[];for(let i=0;i<=60;i++){const u=i/60,theta=u*TAU*4+a;points.push(plus(worm,[-.173+u*.35,.026*Math.cos(theta),.026*Math.sin(theta)]));}path(r,points,.004,iron);
  box(r,plus(worm,[-.256,.017*Math.cos(a),.017*Math.sin(a)]),[.037,.012,.012],rubber);
 }),
 part('piston','Ball nut and rack piston','The nut advances along the worm. Rack teeth on the piston engage the sector. A cut in the wall exposes the balls.',left,(r,t)=>{
  const c=plus(worm,[dx(t),0,0]);cutShell(r,c,x,-.091,.091,.077,.035,metal,5.2,3.1);
  for(let j=-2;j<=2;j++)box(r,plus(c,[j*.031,.065,0]),[.017,.022,.049],alloy);
 }),
 part('balls','Ball circuit and return passage','Balls roll through the loaded helical track and return through a passage in the nut. Ball size and count in this section are illustrative.',up,(r,t)=>{
  const c=plus(worm,[dx(t),0,0]);
  for(let i=0;i<17;i++){const f=i/16,a=TAU*2*f+twist(t);bead(r,plus(c,[-.071+.142*f,.033*Math.cos(a),.033*Math.sin(a)]),.006,alloy,7);}
  path(r,[plus(c,[-.072,0,.034]),plus(c,[-.064,0,.084]),plus(c,[.064,0,.084]),plus(c,[.072,0,.034])],.009,iron);
 }),
 part('sector','Toothed sector and output shaft','The rack piston pushes the sector around its vertical shaft. Only an arc of teeth is needed for this travel.',right,(r,t)=>{
  const a=angle(t);cyl(r,sector,z,-.191,.067,.024,metal,14);
  turn(r,sector,z,[[-.030,.017],[-.030,pitchRadius-.010],[.030,pitchRadius-.010],[.030,.017]],iron,{n:16,start:Math.PI*.5-.73+a,sweep:1.46});
  for(let i=-2;i<=2;i++){
   const theta=i*.265+a,ends=[-.026,.026].map(h=>[[-.14,.072],[-.08,.088],[.08,.088],[.14,.072]].map(([u,rad])=>sectorPoint(theta+u,rad,h)));
   r.polygon(ends[0],alloy,false);r.polygon(ends[1],alloy,false);
   for(let j=0;j<3;j++)r.polygon([ends[0][j],ends[0][j+1],ends[1][j+1],ends[1][j]],metal,false);
  }
 }),
 part('arm','Pitman arm','The splined sector shaft turns the pitman arm. The ball joint at its end acts on the drag link.',down,(r,t)=>{
  const a=angle(t),c=plus(sector,[0,0,-.185]),end=plus(c,[.180*Math.cos(a),.180*Math.sin(a),-.018]);
  sleeve(r,c,z,-.015,.010,.039,.022,iron,16);r.rod(c,end,.018,iron,10);cyl(r,end,z,-.016,.028,.022,metal,12);
 })
],'Turn the input shaft and follow the nut, sector and pitman arm through a short sweep.');
steering.viewAngle=[.70,.49];
canister.viewAngle=[-.68,.52];
valve.viewAngle=[-.71,.69];
const detailMap=new Map();
for(const [model,keys] of [
 [steering,['steering-assist.steering-box','steering-assist.pitman','steering.linkage']],
 [filter,['engine-oil.oil-filter','powertrain.oil-filter']],
 [heatExchanger,['engine-oil.cooler']],
 [pan,['transmission-fluid.pan','transmission-fluid.pan-seal','transmission-fluid.filter']],
 [valve,['transmission-fluid.valve-body','transmission-fluid.conductor-plate']],
 [canister,['evap.canister']],
 [purge,['evap.purge-valve']]
])for(const key of keys)detailMap.set(key,model);
export function fluidDetail(key){return detailMap.get(key)||null;}
