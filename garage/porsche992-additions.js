// US 992.1 Carrera S Cabriolet, 7-speed manual, with heated front seats (4A3).
// Catalogue plates establish component relationships. Routing between mounting
// points and the internal sections are original, illustrative geometry.
import {barrel,pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {part,study,x,y,z,cyl,sleeve,TAU} from './mechanism-shapes.js';
import {draw992SideMarker} from './porsche992-exterior-trim.js';
import {coupeShape,porscheSidePoint} from './porsche-coachwork.js';
import {suspensionGroup,damperSection} from './porsche992-suspension.js';
import {hardwareGroups,hardwareDetail} from './porsche992-closures.js';
import {sources,sectionFor,turbos} from './porsche992-sections.js';
import {frontCoolantStudy} from './porsche-coolant.js';

const alloy='#9eacab',iron='#647479',rubber='#364248',plastic='#485457',copper='#ad8062';
const left=[0,-.43,.09],right=[0,.43,.09],up=[0,0,.44],down=[0,0,-.33],rear=[.39,0,.16],front=[-.39,0,.12];
const route=(r,pts,rad,col=alloy)=>pipe(r,pts,rad,col,6);
const peg=(r,c,axis,a,b,rad,col)=>cyl(r,c,axis,a,b,rad,col,9);
const component=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
function group(id,name,description,source,parts,internal=true){
 return {id,name,description,source,view:'hero',internal,category:'service',parts:parts.map(p=>({...p,id:id+'.'+p.id}))};
}
const sides=[[-1,'left'],[1,'right']];
const title=side=>side<0?'Left':'Right';
const offset=side=>side<0?left:right;
const turboInlet=s=>[1.699,s*.426,.378]; // Compressor end of the installed common shaft.
function airbox(r,s){
 const c=[1.54,s*.570,.625];
 box(r,c,[.25,.128,.084],rubber);box(r,plus(c,[0,0,.047]),[.257,.139,.014],plastic);
 for(const xx of [-.096,-.050,-.004,.043,.090])box(r,plus(c,[xx,0,.058]),[.008,.113,.011],iron);
}
const induction=group('p992-intake','Engine air supply and boost control',
 'Each rear side airbox feeds one turbocharger. The electric wastegates regulate turbine drive. Compressed air continues through the two charge-air coolers above the engine.',sources.induction,sides.flatMap(([s,hand])=>[
 component('filter-'+hand,title(s)+' airbox and filter','Open the airbox to separate the pleated element, peripheral seal and lower housing.',offset(s),sources.filter,r=>airbox(r,s)),
 component('inlet-'+hand,title(s)+' compressor intake duct','Clean air leaves the filter housing and enters its compressor along the turbo shaft.',rear,sources.induction,r=>{
  const path=[[1.665,s*.57,.61],[1.731,s*.567,.577],[1.759,s*.531,.432],[1.752,s*.451,.378],turboInlet(s)];route(r,path,.031,rubber);
  for(const p of [path[0],path.at(-1)])barrel(r,p,plus(p,[.009,0,0]),.036,alloy,8);
 }),
 component('actuator-'+hand,title(s)+' electric wastegate','A motor and a short rod set the turbine bypass flap. Open the linkage to follow its movement.',offset(s),sources.induction,r=>{
  const c=[1.557,s*.477,.438];box(r,c,[.079,.054,.047],iron);box(r,plus(c,[-.032,s*.013,.023]),[.027,.027,.023],rubber);
  route(r,[plus(c,[.038,0,-.006]),[1.626,s*.472,.405],[1.618,s*.463,.395]],.006,alloy);
 })
]));

const hot=[1.43,.225,.532],cold=[1.48,-.208,.509];
const hotTee=[-1.59,.255,.268],coldTee=[-1.56,-.27,.246];
const radIn=s=>[-1.843,s*.69,.478],radOut=s=>[-1.843,s*.53,.351];
const heaterIn=[-.745,.065,.626],heaterOut=[-.745,.102,.621];
const radiator=group('p992-coolant','Engine coolant and heater circuit',
 'Follow hot coolant from the rear flat-six beneath the floor to the two front corner radiators. The return takes cooled liquid back to the engine pump. A separate pair of hoses serves the heater matrix.',sources.coolant,[
 component('distributor','Rear coolant distributor','The engine-side distributor connects the jacket to the forward cooling circuit.',rear,sources.pump,r=>{
  box(r,hot,[.095,.070,.060],plastic);for(const s of [-1,1])route(r,[hot,[1.418,s*.25,.572],[1.418,s*.335,.541]],.018,rubber);
 }),
 component('pump','Engine coolant pump','The return line meets the pump at the engine. Open the circuit section to see the pump, thermostat and front radiator fan.',down,sources.pump,r=>{
  peg(r,cold,x,-.045,.034,.052,iron);peg(r,cold,x,.034,.048,.041,plastic);route(r,[cold,[1.51,-.235,.539],[1.53,-.294,.548]],.021,rubber);
 }),
 component('feed','Longitudinal feed pipe','This pipe carries heated coolant forward. Its branch supplies the upper connections on the front corner radiators.',right,sources.coolant,r=>{
  route(r,[hot,[1.28,.27,.468],[.910,.258,.265],[-1.34,.258,.265],hotTee],.019,alloy);
  for(const s of [-1,1])route(r,[hotTee,[-1.64,s*.43,.274],[-1.77,s*.69,.376],radIn(s)],.018,rubber);
 }),
 component('return','Radiator return pipe','Coolant flows away from the two radiator outlets, joins the return pipe and travels aft to the pump.',left,sources.coolant,r=>{
  for(const s of [-1,1])route(r,[radOut(s),[-1.77,s*.52,.295],[-1.69,s*.42,.246],coldTee],.018,rubber);
  route(r,[coldTee,[-1.35,-.270,.246],[.93,-.270,.246],[1.25,-.267,.440],cold],.020,alloy);
 }),
 component('heater-feed','Heater supply and return','Two smaller lines carry engine heat to the heater matrix inside the dash.',down,sources.pump,r=>{
  for(const [i,end] of [heaterIn,heaterOut].entries()){
   const yy=.315+.035*i;route(r,[i?cold:hot,[1.23,yy,.411],[.96,yy,.275],[-.635,yy,.275],[-.720,yy,.567],end],.010,rubber);
  }
 })
]);

const compressor=[1.685,.297,.610],drier=[-1.55,.508,.511],valve=[-.797,.166,.646];
const condenser=s=>[-1.910,s*.61,.413];
function core(r,c,width,height,metal){
 box(r,c,[.021,width,height],metal);for(const sign of [-1,1])box(r,plus(c,[0,sign*(width/2+.006),0]),[.032,.013,height+.013],iron);
 for(let i=1;i<=7;i++){
  const h=c[2]-height/2+height*i/8;
  r.polygon([[c[0]-.011,c[1]-width/2,h],[c[0]-.011,c[1]+width/2,h],[c[0]-.011,c[1]+width/2,h+.003],[c[0]-.011,c[1]-width/2,h+.003]],alloy,false);
 }
}
const condPort=(s,upper)=>plus(condenser(s),[0,s*(upper?.125:-.125),upper?.057:-.057]);
const climate=group('p992-hvac','Air conditioning and cabin heat',
 'The engine drives a compressor at the rear. Its refrigerant circuit reaches both front condensers and the evaporator at the dash. The heater uses engine coolant in a separate matrix.',sources.climate,[
 component('compressor','Engine-driven A/C compressor','The compressor raises the pressure of refrigerant vapour returning from the evaporator.',rear,sources.acLines,r=>{
  peg(r,compressor,x,-.059,.066,.053,iron);peg(r,compressor,x,.065,.082,.051,rubber);box(r,plus(compressor,[0,0,.049]),[.065,.057,.036],alloy);
 }),
 component('discharge','Compressor discharge line','The high-pressure line runs forward from the compressor to the front condenser circuit.',right,sources.acLines,r=>{
  route(r,[plus(compressor,[-.023,0,.059]),[1.38,.422,.608],[.97,.457,.333],[-1.38,.457,.312],[-1.64,.493,.406],condPort(1,false)],.010,alloy);
 }),
 ...sides.map(([s,hand])=>component('condenser-'+hand,title(s)+' air-conditioning condenser','This finned refrigerant core sits ahead of the engine coolant radiator in the same bumper opening.',offset(s),sources.climate,r=>core(r,condenser(s),.244,.155,'#77848a'))),
 component('bridge','Front condenser crossover tube','Porsche lists a connector tube between the two front condensers. Each end seals to a separate core.',front,sources.climate,r=>{
  route(r,[condPort(-1,true),[-1.94,-.744,.468],[-1.966,-.50,.429],[-1.966,.50,.429],[-1.94,.744,.468],condPort(1,true)],.008,alloy);
 }),
 component('drier','Receiver-drier and bracket','The receiver collects liquid refrigerant downstream of the condenser circuit. Open it to see the desiccant and fittings.',up,sources.climate,r=>{
  peg(r,drier,z,-.073,.074,.025,alloy);peg(r,drier,z,-.018,-.005,.027,iron);peg(r,drier,z,.074,.082,.021,iron);
  route(r,[condPort(-1,false),[-1.82,-.47,.342],[-1.67,-.31,.353],[-1.67,.39,.353],plus(drier,[0,0,.080])],.008,alloy);
 }),
 component('metering','Expansion valve and liquid line','Liquid refrigerant reaches the expansion valve before entering the evaporator.',up,sources.acLines,r=>{
  route(r,[plus(drier,[.014,0,.078]),[-1.25,.502,.606],[-1.014,.405,.621],valve],.007,alloy);box(r,valve,[.050,.034,.036],alloy);
 }),
 component('evaporator','Dashboard evaporator','Refrigerant evaporates in this core, removing heat from the air entering the cabin.',left,sources.airBox,r=>{
  core(r,[-.779,.183,.599],.178,.095,'#778c92');route(r,[valve,[-.776,.198,.640]],.008,alloy);
 }),
 component('suction','Compressor suction line','The larger low-pressure line carries refrigerant vapour from the air-handling unit back to the compressor.',down,sources.acLines,r=>{
  route(r,[plus(valve,[0,-.012,-.012]),[-.925,.425,.586],[-.866,.485,.302],[.98,.485,.302],[1.428,.458,.604],plus(compressor,[.024,0,.059])],.014,plastic);
 }),
 component('blower','Cabin blower and motor','The electric centrifugal blower pushes air through the climate unit. Open it to turn the wheel inside its case.',right,sources.airBox,r=>{
  const c=[-.750,.335,.624];sleeve(r,c,z,-.049,.045,.073,.056,iron,14);peg(r,c,z,-.075,-.047,.038,plastic);box(r,plus(c,[.012,-.064,-.008]),[.088,.042,.062],rubber);
 }),
 component('heater','Heater matrix','Supply and return hoses connect the hot-water matrix to the rear engine cooling circuit.',front,sources.airBox,r=>{
  core(r,[-.716,.061,.608],.145,.078,'#788383');for(const port of [heaterIn,heaterOut])route(r,[port,[port[0]+.030,port[1],port[2]]],.009,iron);
 })
]);

const master=[-.866,-.462,.615],slave=[1.096,-.132,.553];
const clutch=group('p992-clutch','Seven-speed clutch hydraulics',
 'On the rear-wheel-drive manual, pedal travel becomes hydraulic pressure. A line runs to the transaxle-mounted slave cylinder, whose pushrod operates the clutch release mechanism.',sources.clutch,[
 component('pedal','Clutch pedal and pushrod','The left pedal pivots at the top and drives the master-cylinder pushrod.',left,sources.clutch,r=>{
  peg(r,[-.73,-.462,.662],y,-.027,.027,.014,iron);route(r,[[-.73,-.462,.662],[-.693,-.462,.556],[-.628,-.462,.432]],.012,iron);
  box(r,[-.621,-.462,.427],[.039,.058,.020],rubber);route(r,[[-.703,-.462,.601],plus(master,[.057,0,0])],.006,alloy);
 }),
 component('master','Clutch master cylinder','The pushrod acts on a sealed piston. Open the cylinder to follow its stroke.',front,sources.clutch,r=>{
  peg(r,master,x,-.042,.043,.021,iron);peg(r,master,x,.044,.057,.018,rubber);route(r,[plus(master,[-.014,0,.020]),[-.95,-.455,.680],[-1.036,-.379,.689]],.006,rubber);
 }),
 component('line','Clutch pressure line','Rigid pipe and flexible end sections carry pressure from the pedal assembly to the gearbox.',down,sources.clutch,r=>{
  route(r,[plus(master,[-.042,0,0]),[-.934,-.449,.586],[-.815,-.4,.362],[-.60,-.390,.309],[.774,-.390,.309],[.954,-.224,.496],plus(slave,[-.028,0,0])],.005,alloy);
 }),
 component('slave','Slave cylinder, boot and pushrod','Fluid pressure moves the piston. A rubber bellows covers the projecting rod beside the bellhousing.',rear,sources.clutch,r=>{
  peg(r,slave,x,-.030,.035,.021,rubber);box(r,plus(slave,[.020,0,0]),[.012,.064,.041],iron);
  for(let i=0;i<4;i++)peg(r,slave,x,.035+i*.006,.039+i*.006,.017-i*.0016,rubber);peg(r,slave,x,.058,.083,.005,alloy);
 })
]);

function mat(r,s,backrest){
 const cy=s*.356;
 const rows=backrest?[[.184,.128,.583],[.191,.139,.672],[.212,.133,.765],[.227,.102,.846]]:[[-.189,.115,.515],[-.095,.133,.532],[.032,.141,.508],[.138,.118,.507]];
 const point=([xx,w,h],v)=>[xx,cy+w*v,h];
 for(let j=1;j<rows.length;j++)for(const [l,h] of [[-1,0],[0,1]])r.polygon([point(rows[j-1],l),point(rows[j-1],h),point(rows[j],h),point(rows[j],l)],'#9d9787',false);
}
const seats=group('p992-seats','Heated front seats · option 4A3',
 'Each front seat has a cushion mat and a separate backrest mat. They sit beneath the upholstery and connect to leads beneath the seat.',sources.seat,[
 ...sides.flatMap(([s,hand])=>[
  component('cushion-'+hand,title(s)+' cushion heating element','A thin mat warms the center of the seat base.',offset(s),sources.seat,r=>mat(r,s,false)),
  component('backrest-'+hand,title(s)+' backrest heating element','The backrest has its own mat under the trim.',up,sources.seat,r=>mat(r,s,true))
 ]),
 component('leads','Heating mat leads','Flexible leads leave the cushion and backrest and meet the harness under each seat.',down,sources.seat,r=>{
  for(const [s] of sides){const yy=s*.356,c=[.084,yy+s*.090,.450];box(r,c,[.031,.020,.017],rubber);route(r,[[.11,yy,.508],[.143,yy+s*.068,.485],c],.003,copper);route(r,[[.184,yy,.583],[.203,yy+s*.06,.481],c],.003,rubber);}
 })
]);
const lamps=group('p992-markers','US front side marker lamps','Amber side markers sit on the bumper ahead of each front wheel arch. The long white light strips across the bumper face are separate units.',sources.lamps,sides.map(([s,hand])=>component(hand,title(s)+' amber side marker','The lens curves around the side of the bumper. Porsche lists a separate left and right lamp for equipment code 8F5.',offset(s),sources.lamps,r=>{
 draw992SideMarker(r,coupeShape[1],s,porscheSidePoint);
})),false);

const turboPair=study('p992-turbo-pair','Opposed Carrera S turbochargers',
 'One turbocharger serves each cylinder bank. Porsche mirrors the turbine and compressor wheels. Open either cartridge to watch the shaft and both wheels turn.',sources.induction,sides.map(([s,hand])=>part(hand,title(s)+' turbocharger','Open this unit to inspect its rotating assembly and housings.',offset(s),r=>{
 const c=[0,s*.19,0];peg(r,c,x,-.10,-.018,.10,'#947e6c');peg(r,c,x,-.019,.046,.053,iron);peg(r,c,x,.047,.111,.107,alloy);sleeve(r,c,x,.110,.157,.057,.041,plastic,14);
})));
export const groups=[induction,radiator,climate,clutch,seats,lamps,...hardwareGroups,suspensionGroup];
export function drawGroup(r,id,paint){
 const g=groups.find(g=>g.id===id);
 for(const p of g?.parts||[])r.tag(p.id,()=>p.draw(r));
}
export function detailFor(partId){
 if(!partId)return null;
 if(partId.startsWith('p992-suspension.front-strut')||partId.startsWith('p992-suspension.rear-damper'))return damperSection;
 if(partId==='engine.turbos')return turboPair;
 if(partId==='p992-turbo-pair.left')return turbos[0];
 if(partId==='p992-turbo-pair.right')return turbos[1];
 if(partId==='p992-coolant.pump')return frontCoolantStudy;
 return sectionFor(partId)||hardwareDetail(partId);
}
