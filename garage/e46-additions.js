// 2003 U.S. 325Ci coupé, M54B25. OEM drawings identify parts and their
// connections. The body, hose bends, wire routing and sections are redrawn.
import {m54InstalledPoint as engine} from './bmw-m54-installation.js';
import {getServiceStudy} from './road-service-studies.js';
import {roadSystems} from './road-service-data.js';
import {getEngineDefinition} from './engine-data.js';
import {getM54DisaDetail} from './bmw-disa-study.js';
import {cyl,sleeve,x,y,z} from './mechanism-shapes.js';
import {box,path,plus,metal,alloy,iron,rubber} from './road-service-geometry.js';
import {instrument,heatExchanger,muffler,idleValve,blower,seatPad,fluidValve,dryer,controller,steeringPump} from './e46-system-sections.js';

const catalog='https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/';
const ref=(label,url)=>({label,url});
const plate=(label,group,file)=>ref('BMW · 2003 M54 325Ci coupé · '+label,catalog+group+'/'+file+'.html');
const climate=(label,file)=>plate(label,'heater_and_air_conditioning',file);
const src={
 intake:plate('intake manifold and idle valve','engine','intake_manifold_system'),
 secondary:plate('secondary air pump and hoses','engine','emission_control_air_pump'),
 manifold:ref('BMW · 325Ci catalyzed manifold, cylinders 1–3 and 4–6','https://www.bmwpartsdeal.com/oem-2003-bmw-325ci-exhaust_manifold.html'),
 front:plate('front silencer and clamp','cooling_exhaust_system','catalytic_converter_front_silencer'),
 rear:plate('center and rear silencers, bushes and hangers','cooling_exhaust_system','centre_and_rear_silencer'),
 coolant:plate('water hoses, water pipe and heater inlet pipe','cooling_exhaust_system','cooling_system_water_hoses'),
 evaporator:climate('evaporator and expansion valve','evaporator_expansion_valve'),
 condenser:climate('condenser','condenser_air_conditioning'),
 dryer:climate('receiver-drier and pressure sensor','drying_container'),
 waterValve:climate('heater hoses and water valve','water_hoses_water_valve'),
 matrix:climate('heater matrix and water pipes','heater_radiator_air_conditioning'),
 blower:climate('blower, final stage and flap drives','electric_parts_for_ac_unit'),
 filter:climate('cowl microfilter','microfilter_activated_carbon_container'),
 ducts:climate('dashboard and footwell ducts','air_ducts'),
 pipes:climate('refrigerant lines and connections','coolant_lines'),
 pads:plate('front seat cushion and heating option','seats','seat_front_cushion_cover'),
 steeringPump:plate('power steering pump and pulley','steering_drive_shaft','power_steering_pump'),
 steeringLines:plate('steering supply, pressure and return pipes','steering_drive_shaft','hydro_steering_oil_pipes'),
 rack:plate('hydraulic steering gear','steering_drive_shaft','power_steering'),
 column:ref('BMW · 2003 325Ci/330Ci coupé owner’s manual, steering wheel adjustment, p. 50','https://bmw330ci.net/the330ci/2003Manual-3SeriesCoupe.pdf#page=50'),
 climate:climate('automatic climate control panel','automatic_air_conditioning_control'),
 bus:ref('BMW Technical Training · E46 power supply and bus systems','https://ia801005.us.archive.org/11/items/BMWTechnicalTrainingDocuments/ST052%20Body%20Electronics%20II/03a_E46%20Power%20Supply%20and%20Bus%20Systems.pdf'),
 switch:ref('BMW Technical Training · E46 central body electronics, GM V and seat-heater switch center','https://www.shiftbmw.com/wp-content/uploads/2022/11/4-Central-Body-Electronics-Internet.pdf')
};
const up=[0,0,.46],down=[0,0,-.42],left=[0,-.44,.04],right=[0,.44,.04],fore=[-.40,0,.04],aft=[.40,0,.04];
const engineRows=new Map(getEngineDefinition('bmw325ci').components.map(p=>[p.id,p]));
function alias(key,source,offset){
 const original='powertrain.'+key,p=engineRows.get(original);
 return {key,name:p.name,description:p.description,source:source||p.source,offset,original,detail:getM54DisaDetail('bmw325ci',original)};
}
function row(key,name,description,source,offset,draw){return {key,name,description,source,offset,draw};}
function section(key,name,description,source,offset,center,features,options){
 return {key,name,description,source,offset,...instrument(key,name,description,source,center,features,options)};
}
function group(key,name,description,source,rows){
 const id='e46-'+key;
 return {id,name,description,source,category:'service',view:'hero',internal:true,parts:rows.map(p=>({...p,id:id+'.'+p.key}))};
}
function hose(points,radius){
 return r=>{
  path(r,points,radius,rubber);
  for(const [end,near] of [[points[0],points[1]],[points.at(-1),points.at(-2)]]){
   const direction=near.map((n,i)=>n-end[i]),length=Math.hypot(...direction);
   sleeve(r,end,direction,.002,Math.min(.012,length*.85),radius+.002,radius*.93,iron,10);
  }
 };
}
const bypass=engine([.066,-.315,.375]);
const intake=group('intake','Induction and crankcase ventilation','Trace the air from the kidney-grille snorkel through the hot-film meter and throttle. The idle valve bypasses the throttle. The oil separator returns vapor to the manifold and liquid oil to the dipstick tube.',src.intake,[
 ...['airbox','maf','intake-duct','throttle','intake','disa','ccv','dipstick-guide'].map((k,i)=>alias(k,null,[left,fore,down,right,up,aft,left,down][i])),
 section('idle-valve','Rotary idle-control valve','The T-shaped valve below the manifold meters bypass air around the throttle. Open the housing to see the rotary shutter.',src.intake,up,bypass,idleValve(),{scale:8,motion:'Watch the shutter uncover the side passage.'}),
 row('bypass','Idle-valve elbow and manifold connection','Air branches from the small outlet on the intake boot, passes through the idle valve and enters the manifold.',src.intake,left,r=>{
  hose([engine([.045,-.355,.375]),plus(bypass,[.019,-.038,0])],.012)(r);
  hose([plus(bypass,[.042,0,0]),engine([.157,-.295,.366]),engine([.160,-.275,.371])],.012)(r);
 })
]);

// The manifold collectors use the exact stations in bmw-m54-bay.js.
const outlets=[-1,1].map(s=>engine([s*.20+.127,.274,.097]));
const frontCenter=[-.12,-.125,.20],middleCenter=[.74,-.232,.218],rearCenter=[1.91,-.5315,.263];
const tipY=[-.570,-.493];
function pairJoin(r,a,b,via=[]){
 for(const s of [-1,1]){
  const at=(p,gap)=>plus(p,[0,s*gap,0]);
  path(r,[at(a,.038),...via.map(p=>at(p,.038)),at(b,.038)],.0235,'#827f74');
 }
}
const exhaust=group('exhaust','Exhaust and emissions','Follow the two three-cylinder manifolds down the passenger side, then the twin pipes and three silencers to the left rear outlets. BMW’s service plates separate the front silencer, center muffler and rear silencer.',src.rear,[
 alias('exhaust-manifold',src.manifold,up),
 ...outlets.map((out,i)=>row('downpipe-'+(i+1),'Front pipe · cylinders '+(i?'4–6':'1–3'),'A separate front pipe drops from the outlet of each manifold-mounted catalyst. Both reach the front silencer.',src.front,i?right:left,r=>{
  const end=plus(frontCenter,[-.17,(i?1:-1)*.038,0]);
  const drop=plus(out,[.036,i*.074,-.094]);
  path(r,[out,drop,[out[0]+.16,.267+i*.075,.223],[-.69,.114+i*.068,.195],end],.0235,'#887f73');
  sleeve(r,drop,[.055,.004,-.056],-.004,.008,.035,.023,iron,8);
 })),
 row('oxygen','Oxygen sensors and leads','Two sensors upstream and two downstream allow the engine controller to compare the exhaust before and after each catalyst. The lead paths are schematic.',src.manifold,up,r=>{
  for(const s of [-1,1])for(const after of [false,true]){
   const p=engine(after?[s*.20+.115,.287,.115]:[s*.20+.019,.275,.265]);
   cyl(r,p,y,0,.013,.010,iron,6);cyl(r,p,y,.013,.039,.006,'#bbb7a1',9);
   path(r,[plus(p,[0,.038,0]),plus(p,[.032,.069,.022]),plus(p,[-.008,.086,.083])],.0027,rubber);
  }
 }),
 section('front-silencer','Front silencer','BMW lists the front silencer separately from the two manifold-mounted converters. Open the housing to inspect a schematic silencer section.',src.front,down,frontCenter,muffler(.34,.205,.087),{scale:3.1}),
 row('intermediate-pipes','Pipes to center muffler','Twin pipes leave the front silencer and run beside the transmission tunnel.',src.rear,down,r=>pairJoin(r,plus(frontCenter,[.17,0,0]),plus(middleCenter,[-.185,0,0]),[[.385,-.198,.20]])),
 section('center-silencer','Center muffler','The center silencer fits between the front and rear sections. Service clamps join replacement sections.',src.rear,left,middleCenter,muffler(.37,.202,.101),{scale:3}),
 row('axle-pipes','Rear axle overpass pipes','Both pipes bend toward the left rear muffler, inboard of the left wheel. The axle clearance bend is reconstructed.',src.rear,right,r=>pairJoin(r,plus(middleCenter,[.185,0,0]),plus(rearCenter,[-.22,0,0]),[[1.12,-.366,.25],[1.35,-.437,.36],[1.55,-.477,.33]])),
 section('rear-silencer','Rear silencer','The stock rear silencer sits on the driver’s side. Its two tailpipes are visible below the bumper. The internal chamber model illustrates silencing principles.',src.rear,down,rearCenter,muffler(.44,.27,.145),{scale:2.8}),
 row('outlets','Twin tailpipes','The two closely spaced outlets emerge together at the left side of the rear bumper.',src.rear,aft,r=>{
  for(const yy of tipY){sleeve(r,[0,yy,.263],x,2.119,2.311,.0355,.029,metal,18);sleeve(r,[0,yy,.263],x,2.292,2.312,.036,.029,alloy,20);}
 }),
 row('mounts','Rubber hangers and service clamps','Rubber mounts support the exhaust while allowing movement. The sleeved clamps join the service sections.',src.rear,up,r=>{
  for(const yy of [-.646,-.415]){
   sleeve(r,[1.95,yy,.337],x,-.014,.014,.028,.013,rubber,12);
   path(r,[[1.96,yy,.337],[1.91,yy,.337],[1.88,yy,.310]],.0055,iron);
  }
  for(const p of [[.37,-.194,.20],[1.12,-.366,.25]])for(const s of [-1,1])sleeve(r,plus(p,[0,s*.038,0]),x,-.018,.018,.027,.023,iron,12);
 }),
 row('air-injection','Secondary-air pump and pressure hose','At a cold start an electric pump supplies fresh air to the exhaust ports through a check valve. This helps bring the catalysts up to operating temperature.',src.secondary,right,r=>{
  const pump=[-1.49,.568,.602],valve=engine([-.41,.176,.407]);
  cyl(r,pump,z,-.063,.064,.065,rubber,15);cyl(r,pump,z,.055,.074,.055,iron,12);
  hose([plus(pump,[0,0,.073]),[-1.575,.489,.678],[-1.65,.402,.739],valve],.013)(r);
  cyl(r,valve,z,-.014,.015,.028,alloy,12);
 })
]);

const matrix=[-.51,-.004,.694],evap=[-.596,-.005,.721],condenser=[-2.055,0,.612],drier=[-1.851,.59,.493];
const feed=plus(matrix,[-.046,-.117,-.048]),returnPort=plus(matrix,[-.046,.117,.048]);
const heatValve=[-.869,-.525,.681],heaterPort=engine([.354,-.183,.159]);
const cooling=group('cooling','Cooling and heater circulation','Start at the water pump and thermostat, then follow the radiator loop and the smaller pipes beneath the intake manifold. The heater branch crosses the firewall to the dashboard matrix.',src.coolant,[
 ...['radiator','fan','upper-hose','lower-hose','water-pump','thermostat','coolant-reservoir'].map((k,i)=>alias(k,src.coolant,[fore,up,left,right,down,aft,left][i])),
 row('inlet-pipe','Heater inlet pipe','The molded pipe runs beneath the manifold. The parts plate identifies it as 11 53 1 705 210 and shows the sealing rings separately.',src.coolant,left,r=>{
  const points=[engine([-.426,-.137,.132]),engine([-.36,-.182,.129]),engine([.256,-.186,.129]),heaterPort];
  path(r,points,.015,rubber);for(const p of [points[0],heaterPort])sleeve(r,p,x,-.005,.006,.018,.014,iron,9);
 }),
 row('water-pipe','Coolant return pipe','The second molded water pipe follows the block under the inlet manifold. Its body, O-ring ends and a retaining tab are shown.',src.coolant,down,r=>{
  const pts=[engine([-.492,-.118,.104]),engine([-.359,-.161,.073]),engine([.280,-.161,.073]),engine([.40,-.198,.102])];
  path(r,pts,.019,rubber);box(r,plus(pts[1],[0,0,.016]),[.038,.020,.023],rubber);
 }),
 section('heater-valve','Heater control valve','The solenoid regulates hot coolant to the heater matrix. Open the valve to follow the plunger and seat.',src.waterValve,left,heatValve,fluidValve(),{scale:9,motion:'Follow the solenoid plunger as it opens and closes the water passage.'}),
 row('heater-feed','Heater supply hoses','Coolant leaves the engine-side inlet pipe, passes through the heater valve and reaches the heater core through the firewall.',src.coolant,up,r=>{
  hose([heaterPort,[-.739,-.335,.611],plus(heatValve,[0,.042,-.031])],.012)(r);
  hose([plus(heatValve,[0,-.042,-.031]),[-.724,-.545,.711],[-.657,-.194,.713],feed],.012)(r);
 }),
 row('heater-return','Matrix return hose','The second firewall connection carries coolant back to the engine-side water pipe.',src.coolant,right,hose([returnPort,[-.666,.131,.754],[-.734,.112,.731],[-.798,-.078,.614],engine([.40,-.198,.102])],.013))
]);

const compressorPipe=engine([-.36,.38,.15]);
const evapPorts=[plus(evap,[-.045,-.124,-.051]),plus(evap,[-.045,.124,.051])];
const tx=[-.667,.144,.747],dryerA=plus(drier,[0,-.012,.106]),dryerB=plus(drier,[0,.012,.106]);
const blowerCenter=[-.684,0,.813];
const hvac=group('hvac','Air conditioning and cabin air','The refrigerant loop runs from the belt-driven compressor to the condenser, receiver-drier, expansion valve and evaporator. Cabin air enters through the cowl filter and blower. A separate heater core carries engine coolant.',src.evaporator,[
 alias('ac-compressor',src.pipes,right),
 section('condenser','Front condenser','The condenser sits ahead of the engine radiator. Air passes through its fins as hot refrigerant rejects heat.',src.condenser,fore,condenser,heatExchanger(.756,.278,.025),{scale:1.8}),
 section('drier','Receiver-drier','Liquid refrigerant from the condenser passes through a desiccant pack and screen before the expansion valve.',src.dryer,right,drier,dryer(),{scale:5}),
 row('valve','Expansion valve','The metering block at the evaporator throttles the incoming liquid. Both refrigerant lines meet it at the bulkhead.',src.evaporator,left,r=>{
  box(r,tx,[.035,.058,.047],alloy);cyl(r,plus(tx,[0,0,.019]),z,-.002,.014,.019,iron,12);
  for(const i of [0,1])path(r,[plus(tx,[.011,(i-.5)*.031,-.007]),[tx[0]+.02,evapPorts[i][1],evapPorts[i][2]],evapPorts[i]],.008,alloy);
 }),
 section('evaporator','Evaporator','The low-pressure core cools and dehumidifies the air crossing the HVAC housing.',src.evaporator,fore,evap,heatExchanger(.26,.134,.040),{scale:4}),
 section('heater-core','Heater matrix','Engine coolant circulates through a separate matrix downstream of the evaporator. The supply and return connections lead back through the firewall.',src.matrix,aft,matrix,heatExchanger(.246,.128,.042),{scale:4}),
 row('high-side','Discharge and liquid lines','The narrow lines connect compressor discharge, condenser, receiver and metering block in sequence.',src.pipes,right,r=>{
  const c1=plus(condenser,[-.0375,.372,.123]),c2=plus(condenser,[-.0375,-.372,-.123]);
  path(r,[compressorPipe,[-1.796,.466,.494],[-1.978,.46,.587],c1],.0085,alloy);
  path(r,[c2,[-2.112,-.367,.449],[-2.11,.412,.449],[-2.012,.554,.499],dryerA],.0065,alloy);
  path(r,[dryerB,[-1.68,.602,.654],[-.895,.580,.698],[-.738,.448,.744],plus(tx,[-.020,.012,0])],.0065,alloy);
 }),
 row('suction','Compressor suction hose','The larger low-pressure return line carries refrigerant vapor from the evaporator back to the belt-driven compressor.',src.pipes,down,hose([plus(tx,[-.021,-.011,-.010]),[-.762,.210,.708],[-.889,.441,.618],[-1.401,.418,.515],engine([-.474,.298,-.014])],.014)),
 section('blower','Twin-wheel cabin blower','An electric motor below the cowl filter drives two blower wheels on one shaft. Open the motor to see both wheels turn.',src.blower,up,blowerCenter,blower(),{scale:4,motion:'The central motor drives both wheels at the same speed.'}),
 row('final-stage','Blower final-stage unit','The control panel requests a fan speed. A finned power stage varies the blower drive and sheds heat into the airstream.',src.blower,right,r=>{
  const c=[-.596,.173,.683];box(r,c,[.058,.044,.032],rubber);
  for(let j=0;j<5;j++)for(let k=0;k<3;k++)cyl(r,plus(c,[(j-2)*.011,(k-1)*.011,0]),z,.016,.039+.005*(j%2),.003,alloy,6);
 }),
 row('cowl-filter','Cowl microfilter and tray','The long filter sits across the base of the windshield, upstream of the blower.',src.filter,up,r=>{
  const c=[-.771,0,.863];box(r,c,[.107,.622,.018],rubber);
  for(let j=0;j<30;j++)box(r,plus(c,[0,(j-14.5)*.019,.013]),[.085,.009,.011],'#b1aa90');
 }),
 row('ducts','Defroster and footwell ducts','Upper branches direct air to the windshield and face outlets. The lower outlets supply the footwells.',src.ducts,up,r=>{
  for(const s of [-1,1]){
   const ports=[[[-.53,s*.102,.803],[-.585,s*.23,.929],[-.650,s*.395,.951]],
    [[-.51,s*.110,.727],[-.466,s*.188,.663],[-.421,s*.241,.622]],
    [[-.525,s*.110,.84],[-.532,s*.275,.919],[-.467,s*.58,.933]]];
   for(const points of ports)duct(r,points,.041,.019);
  }
 }),
 row('panel','IHKA climate control panel','Temperature and fan settings are entered on the center stack. The controller commands blower output and the flap actuators.',src.climate,aft,r=>{
  box(r,[-.489,0,.858],[.042,.170,.053],rubber);box(r,[-.466,0,.861],[.003,.061,.020],'#84988d');
  for(const s of [-1,1])for(let j=0;j<3;j++)box(r,[-.465,s*(.047+j*.014),.849],[.004,.010,.008],iron);
 })
]);
function duct(r,points,w,h){
 const ring=p=>[[-w,-h],[w,-h],[w,h],[-w,h]].map(([u,v])=>plus(p,[0,u,v]));
 for(let i=1;i<points.length;i++){
  const a=ring(points[i-1]),b=ring(points[i]);
  for(let j=0;j<4;j++)r.polygon([a[j],b[j],b[(j+1)%4],a[(j+1)%4]],j%2?'#42484a':'#343a3b',false);
 }
}

const seats=group('seat-heat','Front seat heating · optional','The optional front seat heaters have separate driver and passenger controls. Each switch cycles through three levels. The switch center uses temperature feedback from each cushion.',src.switch,[
 ...[-1,1].flatMap(s=>{
  const side=s<0?'left':'right',occupant=s<0?'Driver':'Passenger',cy=s*.362,rigid={name:'front-seat-'+side,offset:[0,s*.55,.04]};
  const backRotate=([u,v,w])=>[.215*u-w,v,.977*u+.215*w];
  return [
   section(side+'-cushion',occupant+' cushion element','The flexible element lies just under the center pad of the front seat. Open it to separate the textile, wire and lead.',src.pads,down,[-.065,cy,.545],seatPad(.301,.254),{scale:3,rigid}),
   section(side+'-back',occupant+' backrest element','A second flexible heater follows the seatback angle. It connects to the seat wiring below.',src.switch,aft,[.161,cy,.820],seatPad(.368,.257),{scale:3,place:backRotate,rigid}),
   row(side+'-sensor',occupant+' cushion temperature sensor','A temperature-sensitive resistor in the cushion feeds the switching center so it can regulate heat.',src.switch,up,r=>r.rigid(rigid.name,rigid.offset,()=>{
    const c=[-.036,cy+.051,.542];box(r,c,[.015,.009,.004],'#b29b68');path(r,[c,[.072,cy+.079,.519],[.089,cy+.085,.455]],.0028,rubber);
   })),
   row(side+'-harness',occupant+' seat heater harness','The under-seat connector branches to the cushion and backrest. A flexible loop permits seat movement.',src.switch,s<0?left:right,r=>r.rigid(rigid.name,rigid.offset,()=>{
    const c=[.080,cy+.077,.441];box(r,c,[.051,.044,.022],'#bc9e55');
    path(r,[c,[.111,cy-.025,.480],[.098,cy-.074,.529]],.004,rubber);
    path(r,[c,[.153,cy+.127,.49],[.178,cy+.119,.615],[.201,cy+.065,.677]],.004,rubber);
   }))
  ];
 }),
 row('switch-center','Center-console heater switches','One switch per front seat selects three heat settings. Three indicators beside each switch show the selected level.',src.switch,fore,r=>{
  const c=[-.378,0,.648];box(r,c,[.030,.194,.031],rubber);
  for(const s of [-1,1]){box(r,plus(c,[.017,s*.07,0]),[.005,.035,.016],iron);for(let j=0;j<3;j++)box(r,plus(c,[.020,s*.07+(j-1)*.008,.012]),[.003,.005,.002],'#8ca281');}
 })
]);
const glove=[-.603,.334,.759],lightSwitch=[-.475,-.623,.916],cluster=[-.474,-.382,.961];
const controls=group('electrics','Body electronics and distribution','The battery and front fuse carrier supply the body electronics. GM V operates body conveniences, the light switch center manages exterior lighting and the cluster exchanges information between the K-bus and drivetrain CAN.',src.bus,[
 alias('ecu',src.bus,left),
 section('general-module','GM V body control module','The general module sits on the electronics carrier behind the glove compartment. Its board and plug layout illustrate the controller and its harness connections.',src.switch,right,glove,controller(3),{scale:5}),
 row('rear-fuse','Rear main distribution fuse','A high-current fuse near the trunk battery supplies the front distribution box. The starter feed and fused body feed serve different loads.',src.bus,aft,r=>{
  const p=[1.509,.628,.498];box(r,p,[.076,.047,.020],rubber);box(r,plus(p,[0,0,.012]),[.052,.016,.006],'#b29866');
  path(r,[[1.639,.476,.585],[1.615,.603,.548],plus(p,[.025,0,.012])],.007,'#995f4d');
 }),
 row('battery-terminal','Battery safety terminal','The safety terminal at the positive battery post separates the starter/alternator feed when triggered. The fused distribution branch is shown separately.',src.bus,right,r=>{
  const p=[1.634,.477,.582];cyl(r,p,z,-.012,.004,.015,iron,12);box(r,plus(p,[.025,.003,0]),[.043,.035,.024],'#94594d');
  path(r,[plus(p,[.042,0,0]),[1.612,.565,.513],[1.63,.569,.474]],.008,'#915849');
 }),
 row('glove-relays','Glovebox relay carrier','The carrier behind the glovebox locates plug-in relays above the body controller. The relay arrangement is schematic.',src.switch,up,r=>{
  const c=[-.61,.419,.786];box(r,c,[.090,.208,.018],rubber);for(let i=0;i<4;i++)box(r,plus(c,[0,(i-1.5)*.045,.028]),[.040,.034,.038],['#779183','#9e8b75','#788992','#8b8781'][i]);
 }),
 section('light-center','Light switch center','The LSZ combines the driver’s lighting controls with the electronics that switch and monitor exterior lighting.',src.bus,left,lightSwitch,controller(1),{scale:5,place:([a,b,c])=>[c,b,a]}),
 row('cluster-bus','Instrument cluster connections','The cluster receives drivetrain information on CAN and exchanges body information over K-bus. These plugs sit behind the E46 instrument binnacle.',src.bus,up,r=>{
  for(const s of [-1,1])box(r,plus(cluster,[-.033,s*.060,-.018]),[.024,.039,.021],s<0?rubber:'#aaa893');
 }),
 row('k-bus','Body bus and junction','The single-wire K-bus connects body modules. The junction under the dashboard branches to the general module, light switch center and instrument cluster.',src.bus,down,r=>{
  const junction=[-.59,.281,.811];box(r,junction,[.028,.043,.018],rubber);
  for(const end of [glove,lightSwitch,cluster])path(r,[junction,[-.587,end[1],.817],plus(end,[-.021,0,0])],.003,'#aba28e');
 }),
 row('drivetrain-can','Drivetrain CAN pair','The twisted CAN pair carries drivetrain messages to the instrument cluster. Its path follows the bulkhead schematically.',src.bus,left,r=>{
  for(const s of [-1,1])path(r,[[-.662,-.465+s*.004,.754],[-.696,-.360+s*.004,.746],[-.641,-.331+s*.004,.828],[-.535,-.322+s*.004,.923],plus(cluster,[-.035,.058+s*.004,-.018])],.0025,s<0?'#9a814f':'#a08f63');
 })
]);
const pumpCenter=engine([-.555,-.223,-.098]),reservoir=[-1.48,-.42,.639];
const rackPort=[-1.4675,-.246,.334];
const steering=group('steering','Steering hydraulics and column','The belt drives a hydraulic pump that supplies the front rack. Inside the cabin, a hand lever releases the steering column so the driver can set its height and reach.',src.steeringLines,[
 {key:'rack',name:'Hydraulic rack and tie rods',description:'The transverse rack is mounted ahead of the front axle. Its tie rods run out to the steering arms on the front wheel carriers.',source:src.rack,offset:down,original:'steering.linkage'},
 section('pump','Belt-driven steering pump','The pump draws oil from the reservoir and delivers it to the rack. Its section illustrates the changing spaces between the vanes and cam ring.',src.steeringPump,fore,pumpCenter,steeringPump(),{scale:7,motion:'Turn the pulley to follow the vanes around the eccentric ring.'}),
 row('reservoir','Power-steering fluid reservoir','The reservoir above the pump provides a low-pressure supply and receives returning fluid.',src.steeringLines,up,r=>{
  cyl(r,reservoir,z,-.047,.041,.049,rubber,14);sleeve(r,reservoir,z,.027,.034,.053,.047,iron,12);
  cyl(r,reservoir,z,.041,.057,.042,rubber,14);box(r,plus(reservoir,[0,0,.058]),[.058,.012,.005],iron);
 }),
 row('supply','Reservoir supply hose','The larger low-pressure hose connects the reservoir outlet to the pump inlet.',src.steeringLines,left,hose([plus(reservoir,[0,0,-.047]),[-1.546,-.434,.499],[-1.626,-.320,.408],plus(pumpCenter,[.018,-.058,0])],.011)),
 row('pressure','Pump-to-rack pressure line','A crimped pressure hose carries hydraulic fluid to a banjo connection at the steering gear.',src.steeringLines,right,r=>{
  const p=plus(pumpCenter,[.011,0,.055]);
  hose([p,[-1.645,-.326,.397],[-1.563,-.354,.347],rackPort],.008)(r);
  cyl(r,rackPort,z,-.008,.008,.010,alloy,6);
 }),
 row('return','Rack return pipe and reservoir hose','The low-pressure return bends across the front support and returns to the reservoir. The route illustrates the cataloged pipe and hose connections.',src.steeringLines,down,r=>{
  path(r,[plus(rackPort,[.011,.029,0]),[-1.696,-.177,.322],[-1.872,-.298,.327],[-1.961,-.387,.346],[-1.962,.254,.347],[-1.926,.254,.364],[-1.925,-.363,.365]],.007,alloy);
  hose([[-1.925,-.363,.365],[-1.707,-.442,.410],[-1.554,-.455,.522],plus(reservoir,[0,-.024,-.04])],.008)(r);
 }),
 row('column','Intermediate steering shaft and joints','The lower shaft carries steering input from the driver’s column through the bulkhead to the pinion on the rack.',src.rack,left,r=>{
  const pts=[[-.464,-.374,.849],[-.656,-.372,.72],[-.821,-.36,.574],[-1.254,-.30,.427],plus(rackPort,[-.005,-.018,0])];
  path(r,pts,.012,iron);for(const p of [pts[1],pts[3]]){cyl(r,p,y,-.022,.022,.011,alloy,10);cyl(r,p,z,-.014,.014,.009,iron,9);}
 }),
 row('manual-clamp','Manual reach and height clamp','Pulling down the lever releases the column. Moving the wheel sets reach and height, and raising the lever clamps it in position.',src.column,aft,r=>{
  const c=[-.416,-.375,.875];sleeve(r,c,y,-.039,.040,.021,.010,iron,12);
  path(r,[plus(c,[0,-.037,0]),[-.393,-.420,.854],[-.359,-.422,.847]],.006,iron);
  box(r,[-.354,-.421,.846],[.039,.017,.012],rubber);
 })
]);
export const groups=[intake,cooling,exhaust,hvac,seats,controls,steering];
const byId=new Map(groups.map(g=>[g.id,g]));
const originalTags=new Map(groups.flatMap(g=>g.parts.filter(p=>p.original).map(p=>[p.id,p.original])));
originalTags.set('electrical.starter','powertrain.starter');
originalTags.set('electrical.generator','powertrain.alternator');
export const installedAlias=id=>originalTags.get(id)||null;
const studies=new Map(groups.flatMap(g=>g.parts.filter(p=>p.detail).map(p=>[p.id,p.detail])));
for(const [partId,engineId] of [['electrical.starter','powertrain.starter'],['electrical.generator','powertrain.alternator']]){
 studies.set(engineId,getServiceStudy('bmw325ci',roadSystems.bmw325ci,partId));
}
export const detailFor=id=>studies.get(id)||null;
export function drawGroup(r,id){
 const g=byId.get(id);
 if(!g)return false;
 // Engine aliases reuse the tags already drawn earlier in the same mesh build.
 // In the whole vehicle the engine owns these surfaces, preserving its pick IDs.
 if(r.inspection?.assembly===id){
  const rename=new Map(g.parts.filter(p=>p.original).map(p=>[p.original,p.id]));
  if(rename.size)for(const f of r.faces){const target=rename.get(f.part);if(target)f.part=target;}
 }
 // The floor and its mounted underbody exhaust drop as a unit in the body
 // view. Engine-side manifolds, probes and secondary-air hardware stay put.
 const dropExhaust=g===exhaust&&r.inspection?.assembly==='body';
 for(const p of g.parts)if(p.draw){
  const draw=()=>r.tag(p.id,()=>p.draw(r));
  if(dropExhaust&&p.key!=='air-injection'&&p.key!=='oxygen')r.rigid('floor-assembly',[0,0,-.48],draw);
  else draw();
 }
 return true;
}
