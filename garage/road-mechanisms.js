import {drawG500InputShaft,drawG500Gearbox,g500InputShaftStudy,g500AxleShaftStudy,shaftRefs} from './g500-propeller-shafts.js';
import {TAU,steel,metal,dark,gold,cyl,sleeve,turn,gear,bead,part,study,x,y,z,origin} from './mechanism-shapes.js';
import {vehicleServiceDetail} from './vehicle-service.js';
import {e46Drivetrain,getE46RunningDetail} from './e46-running-gear.js';
import {e90Drivetrain,e90Sources} from './e90-xdrive.js';
import {getG500SuspensionDetail} from './g500-underbody.js';
import {getG500DiffDetail,getG500Differentials,drawG500RearShafts} from './g500-differentials.js';
import {isFleetPlug} from './fleet-ignition.js';
import {spark,electrode} from './mechanism-plug.js';
import {cvt,pushbelt} from './mechanism-cvt.js';
import {planetary} from './mechanism-planetary.js';
import {diff,transaxleDiff} from './mechanism-differential.js';
import {manual,clutch,cvJoint,multiClutch,finalChain} from './mechanism-shaft.js';
import {hrvAwdRows,getHrvAwdDetail} from './hrv-awd.js';
import {drawE4OD,drawE4ODConverter,drawF350Propshaft,drawSterlingCarrier,drawSterlingHousing,drawSterlingShafts,drawFullFloatingHubs} from './f350-powertrain.js';

const references={
 hrv:{label:'Honda · 2026 HR-V transmission and drivetrain specifications',url:'https://hondanews.com/en-US/releases/release-6f8b202ddb1c7f26ecd92774bb014b0c-2026-honda-hr-v-specifications-and-features'},
 g500:{label:'Mercedes-Benz USA · VG150E, exploded assembly and flanges, pp. 5–7',url:'https://mbmanuals.com/pdf/mb463g500-vg150-transfer-case.pdf#page=5'},
 c63:{label:'Mercedes-Benz · 2014 C-Class brochure',url:'https://s3.amazonaws.com/cdn.autoipacket.com/brochures/mercedes-benz/2014/2014-cclass.pdf'},
 porsche993cab:{label:'Porsche · type 993 history',url:'https://newsroom.porsche.com/en/history/porsche-911-seven-generations-part-4-type-993-16486.html'},
 porsche992scab:{label:'Porsche · Carrera S seven-speed manual',url:'https://newsroom.porsche.com/en_US/products/manual-transmission-2020-911-carrera-s-carrera-4s-coupe-cabriolet-19154.html'},
 bmws1000rr:{label:'BMW Motorrad · S 1000 RR technical data',url:'https://www.bmw-motorrad.co.uk/en/models/sport/s1000rr-2023/technicaldata.html'},
 f350:{label:'Ford · 1993 commercial pickups and chassis',url:'https://xr793.com/wp-content/uploads/2022/11/1993-Ford-Commercial-Trucks-Pickups-Chassis.pdf'},
};
const sterlingSource={label:'Diesel Hub · Sterling 10.25 applications',url:'https://dieselhub.com/maintenance/sterling-axle-fluid.html'};

const converter=study('converter','Torque converter section','The engine-driven impeller accelerates oil into the turbine. The turbine turns the transmission input shaft. The stator redirects the returning flow when the converter is multiplying torque.',{label:'Schaeffler · hydrodynamic torque converters',url:'https://www.schaeffler.com/remotemedien/media/_shared_media/08_media_library/01_publications/schaeffler_2/symposia_1/downloads_11/Schaeffler_Kolloquium_2014_20_en.pdf'},[
 ...[['pump','Impeller',-.36,1],['turbine','Turbine',.12,-1],['stator','Stator',-.055,1]].map(([key,name,start,direction],i)=>part(key,name,
  ['The pump wheel rotates with the engine and directs oil outward into the turbine.','The turbine receives momentum from the moving oil and drives the gearbox input.','The inner stator redirects returning oil toward the impeller. Its one-way support permits overrunning.'][i],[[0,-.82,.04],[0,.94,.08],[.12,0,.68]][i],
  r=>{const v=i===2?.41:.81,hub=i===2?.17:.37; sleeve(r,origin,y,start,start+.05,v,hub,steel,32);
    for(let n=0;n<18;n++){const t=TAU*n/18,pts=[[hub,t,0],[v,t+.15*direction,0],[v*.93,t+.28*direction,.085],[hub,t+.11*direction,.09]];
      r.polygon(pts.map(([rad,a,d])=>[rad*Math.cos(a),start+d,rad*Math.sin(a)]),i===2?gold:metal,false);}
  })),
]);
const shaftInfo={label:'GKN · wheel and transmission-side CV joints',url:'https://www.gknautomotive.com/en/aftermarket/portfolio/sideshafts/'};
const axleStudy=study('shaft','Half-shaft assembly','The half-shaft links a differential output to a wheel hub. Its joints accommodate the change of angle as the suspension moves. This example shows a car with independently suspended driven wheels.',shaftInfo,[
 part('bar','Intermediate shaft','The steel bar carries torque between the inboard and outboard joints.',[0,0,.41],r=>cyl(r,origin,y,-.59,.59,.08,metal)),
 part('outer','Wheel-side CV joint','The fixed joint articulates through the steering and suspension angles. Open it to see the tracks, cage and balls.',[0,.91,.05],r=>{turn(r,origin,y,[[.48,.08],[.54,.10],[.58,.22],[.81,.23],[.85,.14],[.92,.095],[1.11,.095]],steel);}),
 part('inner','Inboard joint','A plunging joint takes up changes in shaft length as the suspension rises and falls.',[0,-.91,0],r=>{turn(r,origin,y,[[-1.12,.082],[-.91,.082],[-.88,.21],[-.56,.22],[-.48,.084]],dark);}),
 part('boots','Bellows boots','Flexible boots retain grease around each joint. Their folds allow the shaft to articulate.',[.44,0,.52],r=>{for(const s of [-1,1]){const p=[];for(let i=0;i<4;i++){const d=.36+i*.047;p.push([s*d,.10+i*.022],[s*(d+.022),.123+i*.022]);}turn(r,origin,y,p,dark);}}),
]);

function housing(r,c,axis,radius,length){
 turn(r,c,axis,[[-length/2,0],[-length/2,radius*.77],[-length*.39,radius],[-length*.25,radius*1.02],[0,radius*.92],[length*.32,radius*.62],[length/2,radius*.46],[length/2,0]],steel,{n:16});
 for(const h of [-.35,-.22,.06,.24])sleeve(r,c,axis,h*length,(h+.03)*length,radius*(h<0?1.04:h<.1?.9:.74),radius*.46,metal,16);
}
function finalDrive(r,c,front=false){
 turn(r,c,y,[[-.18,.065],[-.14,.11],[-.09,.15],[.075,.155],[.13,.125],[.18,.063],[.18,0]],dark);
 if(!front)housing(r,[c[0]-.13,c[1],c[2]],x,.09,.18);
}
function shaft(r,axle,height,solid=false,hubY=.72){
 for(const s of [-1,1]){
  const c=[axle,0,height];cyl(r,c,y,s*.14,s*hubY,.025,metal,15);
  if(!solid)for(const p of [.24,hubY-.10]){const ring=[];for(let i=0;i<4;i++){const d=p+i*.016;ring.push([s*d,.045+i*.003],[s*(d+.008),.052+i*.003]);}turn(r,c,y,ring,dark,{n:14});}
  else sleeve(r,c,y,s*.55,s*.70,.042,.024,steel,14);
 }
}
function gearbox(r,c,axis,rad=.18,len=.55){housing(r,c,axis,rad,len);}
// HR-V transaxle (Honda layout): the CVT bolts to the left end of the engine.
// The crank line is x -1.46, z .56 (see engine-geometry.js). The converter
// sits inside the engine's bellhousing; the CVT case continues outboard ahead
// of the strut; the final drive sits below and behind, at the axle line, so the
// right half-shaft passes behind the oil pan.
const hrvCrank=[-1.46,0,.56],hrvAxle=[-1.327,0,.37];
function hrvCvtCase(r){
 // The outboard cover stops short of the strut's lower mount.
 const c=[-1.52,-.488,.58];
 turn(r,c,y,[[-.056,0],[-.056,.074],[-.046,.096],[-.02,.105],[.04,.105],[.056,.098],[.056,0]],steel,{n:18});
 for(const t of [-.03,.01])sleeve(r,c,y,t,t+.008,.110,.08,metal,18);
 // Pulley-shaft bosses on the end cover.
 turn(r,[c[0]-.035,-.544,c[2]+.02],y,[[-.012,0],[-.012,.045],[.0,.05],[.0,0]],dark,{n:14});
 turn(r,[c[0]+.040,-.544,c[2]-.03],y,[[-.012,0],[-.012,.035],[.0,.04],[.0,0]],dark,{n:14});
}
function hrvConverter(r){turn(r,[hrvCrank[0],-.39,hrvCrank[2]],y,[[-.028,0],[-.028,.07],[-.012,.09],[.012,.09],[.028,.075],[.028,0]],steel,{n:16});}
function hrvFinalDrive(r){
 const c=[hrvAxle[0],-.30,hrvAxle[2]];
 turn(r,c,y,[[-.038,0],[-.038,.045],[-.02,.065],[.02,.065],[.038,.05],[.038,0]],dark,{n:16});
}
function hrvShafts(r){
 const c=hrvAxle;
 cyl(r,c,y,-.345,-.72,.025,metal,15);
 cyl(r,c,y,-.255,.72,.025,metal,15);
 for(const [s,p] of [[-1,.62],[1,.62],[1,.17]]){const ring=[];for(let i=0;i<4;i++){const d=p+i*.016;ring.push([s*d,.045+i*.003],[s*(d+.008),.052+i*.003]);}turn(r,c,y,ring,dark,{n:14});}
}
const g500FrontProp=g500AxleShaftStudy(true),g500RearProp=g500AxleShaftStudy(false);
const layouts={
 g500:{wheelbase:2.85,box:'Five-speed automatic',desc:'The longitudinal five-speed drives a separate two-speed VG150E. A center differential feeds both solid axles in normal driving. Selecting low range and locking the center differential operate separate mechanisms.'},
 c63:{wheelbase:2.76,box:'Seven-speed AMG MCT',desc:'A wet start-up clutch couples the V8 to the seven-speed MCT. The propeller shaft carries drive rearward to the final drive and independently suspended rear wheels.'},
 hrv:{wheelbase:2.654,box:'Continuously variable transmission',desc:'This 2026 US HR-V EX-L has Real Time AWD. The CVT, reduction gears and front differential share a transaxle beside the engine. A transfer unit at the front differential drives a two-piece propeller shaft, and an electronically controlled coupling at the rear differential sets how much torque reaches the rear wheels. The rear driveline shapes and routing are estimated. Open the CVT to watch the belt move.'},
 porsche993cab:{rear:1.112,box:'Six-speed manual transaxle',desc:'On the 993 Carrera, the engine sits behind the rear axle. A clutch and six-speed transaxle ahead of the engine feed both rear wheels through half-shafts.'},
 porsche992scab:{rear:1.25,box:'Seven-speed manual transaxle',desc:'The Carrera S manual combines its gearbox and rear final drive in one transaxle ahead of the flat-six. The differential cutaway illustrates the underlying bevel gear action. Limited-slip functions are outside that mechanism model.'},
 f350:{box:'E4OD four-speed automatic',desc:'The E4OD four-speed automatic with overdrive sits behind the 7.5-litre V8. A propeller shaft drives the second-generation Sterling 10.25 full-floating rear axle on this two-wheel-drive truck. Lengths, diameters and offsets are estimated.'},
 bmws1000rr:{box:'Six-speed motorcycle gearbox',desc:'A wet multi-plate clutch feeds the six-speed gearbox. A chain connects its small output sprocket to the larger sprocket fixed to the rear wheel.'},
};
function register(id,rows){
 const spec=layouts[id],parts=rows.map(([key,name,description,offset,draw,source])=>({id:'drivetrain.'+key,name,description,offset,category:'service',draw,...(source?{source}:{})}));
 return {id:'drivetrain',name:'Transmission & final drive',description:spec.desc,source:references[id],parts,view:'hero',internal:true,category:'service'};
}
function inputComponent(id,spec,draw){
 return ['gearbox',spec.box,id==='hrv'?'Open the variator to see both pulley pairs, their shafts and the steel pushbelt.':id==='c63'?'The MCT uses a wet launch clutch ahead of the automatic gearsets.':'This housing transmits drive from the engine toward the final drive.',[-.18,0,.51],draw];
}
function sedan(id){
 const spec=layouts[id],ax=spec.wheelbase/2,front=-ax,z0=.39;
 const transverse=id==='hrv',g=id==='g500',c=transverse?[front+.16,.39,.50]:[front+.82,0,.49];
 const arr=[inputComponent(id,spec,g?drawG500Gearbox:transverse?hrvCvtCase:r=>gearbox(r,c,x,.174,.58))];
 if(transverse){
  arr.push(['torque-converter','Torque converter','Engine torque enters the transaxle through the fluid coupling.',[-.17,-.33,.32],hrvConverter],
  ['front-differential','Front differential','The final reduction turns the differential carrier. The side gears drive the front wheels.',[-.25,.40,-.13],hrvFinalDrive],
  ['halfshafts','Front half-shafts','An inboard and outboard joint on each side allow steering and suspension motion.',[0,.24,-.31],hrvShafts]);
  if(id==='hrv')arr.push(...hrvAwdRows);
 }else {
  const tail=c[0]+.29,center=.02;
  if(g){
   const assembly=getG500Differentials(id);
   const installed=(alias,physicalId,offset)=>{
     const component=assembly.parts.find(p=>p.id==='differentials.'+physicalId);
     return [alias,component.name,component.description,offset,component.draw,component.source];
   };
   arr.push(
    ['input-shaft','Transfer-case input shaft','Two CV joints link the transmission output to the upper transfer-case flange. Open the shaft to inspect the mounting faces, bellows and spindle.',[-.24,.32,-.13],drawG500InputShaft,shaftRefs.intermediate],
    installed('transfer','center',[.12,0,.57]),
    installed('front-shaft','front-shaft',[-.15,-.42,.12]),
    installed('front-differential','front',[-.44,0,-.17]),
    installed('propshaft','rear-shaft',[0,-.45,0]),
    installed('rear-differential','rear',[.37,0,.42]),
    ['halfshafts','Rear axle shafts','Flanged shafts run through the rigid rear housing from the differential to the wheel hubs.',[0,.32,-.31],drawG500RearShafts]
   );
   return register(id,arr);
  }
  if(id==='c63')arr.push(['launch-clutch','Wet start-up clutch','An oil-cooled stack connects the crankshaft to the transmission at launch.',[-.45,0,.32],r=>housing(r,[c[0]-.34,0,.49],x,.185,.11)]);
  arr.push(['propshaft','Propeller shaft','The tubular shaft transmits torque longitudinally to the final drive.',[0,-.45,0],r=>{
   const start=tail;
   r.rod([start,0,z0],[ax-.20,0,z0],.047,steel,16);
   for(const p of [start,ax-.21])cyl(r,[p,0,z0],x,-.04,.04,.074,metal,14);
   sleeve(r,[center+.28,0,z0],x,-.042,.042,.075,.045,dark);
  }],
  ['rear-differential','Rear axle differential','The axle final drive turns the carrier. Open the gearset to follow each wheel’s output.',[.37,0,.42],r=>finalDrive(r,[ax,0,z0])],
  ['halfshafts','Rear half-shafts','The left and right shafts join the final drive to the rear wheel hubs.',[0,.32,-.31],r=>shaft(r,ax,z0)]);
 }
 return register(id,arr);
}
function carrera(id){
 const spec=layouts[id],rear=spec.rear,modern=id==='porsche992scab';
 // The crankshaft flange is the forward end of the installed flat-six. The
 // gearbox input shares its axis; the differential outputs sit at hub height.
 const flange=rear+.285-.0065-.607*.55625,clutchDepth=.068,caseDepth=.48;
 const back=flange-clutchDepth,axleZ=modern?.358:.320,hubY=modern?.778:.722;
 return register(id,[
  inputComponent(id,spec,r=>gearbox(r,[back-caseDepth/2,0,.502],[-1,0,0],.145,caseDepth)),
  ['clutch','Clutch and flywheel','The flywheel and clutch meet at the interface between the rear-mounted flat-six and the gearbox.',[.33,0,.36],r=>{
    const c=[flange,0,.502];
    cyl(r,c,x,-.016,0,.150,steel,20);
    cyl(r,c,x,-.028,-.016,.139,dark,20);
    turn(r,c,x,[[-clutchDepth,.050],[-.047,.109],[-.037,.145],[-.028,.145]],metal,{n:20});
  }],
  ['rear-differential','Rear final drive','The differential sits in the transaxle at rear axle height. Each side gear drives its own output.',[0,-.30,.34],r=>finalDrive(r,[rear,0,axleZ])],
  ['halfshafts','Rear half-shafts','Two jointed shafts carry drive outward to the independently suspended rear wheels.',[0,.34,-.24],r=>shaft(r,rear,axleZ,false,hubY)]
 ]);
}
function truck(){
 const id='f350';
 return register(id,[
  ['gearbox',layouts[id].box,'The electronically controlled four-speed automatic adds an overdrive top gear. Its planetary gearsets sit in the main case behind the bellhousing. Open the gearbox to follow one planetary set; case dimensions are estimated.',[0,0,.44],drawE4OD],
  ['torque-converter','Torque converter','Engine torque enters the E4OD through the fluid coupling inside the bellhousing.',[-.30,0,.30],drawE4ODConverter],
  ['propshaft','Propeller shaft','A tubular shaft with a universal joint at each end carries drive from the E4OD output to the axle pinion. It is drawn as one tube; whether this wheelbase uses a two-piece shaft with a center bearing is not confirmed here.',[0,-.45,0],drawF350Propshaft],
  ['rear-differential','Sterling 10.25 differential','The 10.25-inch ring gear and the differential carrier sit in the center section, with the pinion entering from the front. This is the second-generation 1993–97 axle. Open it to follow the differential gears; housing and cover shapes are estimated.',[0,0,.42],drawSterlingCarrier,sterlingSource],
  ['axle-housing','Axle housing & tubes','Steel tubes extend from the center section to the stationary wheel spindles. A leaf-spring seat sits under each tube. Tube diameter and seat positions are estimated.',[.30,0,-.22],drawSterlingHousing,sterlingSource],
  ['axle-shafts','Full-floating axle shafts','Each shaft is splined into a differential side gear and bolted to its hub flange. The shafts carry drive torque; the hubs and spindles carry the truck’s weight.',[0,.34,-.30],drawSterlingShafts,sterlingSource],
  ['hubs','Full-floating hubs & bearings','Each hub turns on two wheel bearings on the stationary spindle, and the drum and wheel mount to the hub. An axle shaft can be withdrawn without the wheel coming off. Bearing and hub dimensions are estimated.',[-.25,.52,.10],drawFullFloatingHubs,sterlingSource],
 ]);
}
function motorcycle(){
 const id='bmws1000rr', rear=.729, small=.122, left=-.13;
 return register(id,[
  inputComponent(id,layouts[id],r=>gearbox(r,[.035,0,.44],y,.085,.25)),
  ['clutch','Wet multi-plate clutch','Alternating friction and steel plates transmit load between the clutch basket and input hub.',[-.18,.29,.10],r=>housing(r,[-.045,.15,.48],y,.105,.09)],
  ['countershaft','Output sprocket','The smaller front sprocket is fixed to the transmission output shaft.',[-.16,-.26,.1],r=>gear(r,[small,left,.43],y,-.012,.012,.045,.045,17,metal)],
  ['rear-sprocket','Rear sprocket','The rear sprocket is bolted to the wheel carrier. The US 2023 final drive uses a larger 46-tooth rear sprocket.',[.10,-.25,.13],r=>gear(r,[rear,left,.315],y,-.012,.012,.113,.113,46,steel)],
  ['chain','Drive chain','A continuous chain connects the sprockets. Open one link to inspect its plates, pins and rollers.',[0,-.30,-.13],r=>{
   for(const s of [-1,1])r.rod([small,left,.43+s*.044],[rear,left,.315+s*.11],.009,dark,7);
   for(const [cx,cz,rad,angle] of [[small,.43,.045,Math.PI/2],[rear,.315,.113,-Math.PI/2]]){
    for(let i=0;i<16;i++){const a=angle+i*Math.PI/16,b=a+Math.PI/16;r.rod([cx+rad*Math.cos(a),left,cz+rad*Math.sin(a)],[cx+rad*Math.cos(b),left,cz+rad*Math.sin(b)],.010,dark,6);}
   }
  }]
 ]);
}
const fleetSpark={...spark,description:spark.description+' The enlarged section uses a representative single-strap electrode. The fitted plug’s tip and seat depend on its part number.'};
const launchClutch={...multiClutch,id:'launch-clutch',name:'Wet start-up clutch',source:references.c63,description:'The C63 uses an oil-cooled clutch stack for launch. This representative section shows how alternating plates couple the basket to the hub. The plate count is illustrative.'};
const map=Object.fromEntries(Object.keys(layouts).map(id=>[id,id==='bmws1000rr'?motorcycle():id==='f350'?truck():id.startsWith('porsche')?carrera(id):sedan(id)]));
export function getRoadDrivetrain(id){return id==='bmw325ci'?e46Drivetrain:id==='bmw328xi'?e90Drivetrain:Object.hasOwn(map,id)?map[id]:null;}
const xdriveClutch={...multiClutch,id:'e90-transfer-clutch',name:'xDrive transfer-case clutch',source:e90Sources.xdrive,description:'In the ATC 300, a servo motor and control cam clamp a pack of alternating plates. Open, the clutch leaves all drive at the rear axle; as it closes, more torque reaches the gears to the front output. This representative section shows the plate pack, not the case’s exact plate count.'};
export function drawRoadDrivetrain(r,id,{skipGearbox=false,installedG500=false}={}){
 for(const p of getRoadDrivetrain(id)?.parts||[]){
  if(skipGearbox&&p.id==='drivetrain.gearbox')continue;
  if(installedG500&&!['drivetrain.gearbox','drivetrain.input-shaft'].includes(p.id))continue;
  r.tag(p.id,()=>{if(id==='bmw325ci'&&p.id!=='drivetrain.halfshafts')r.instance(p.id,()=>p.draw(r));else p.draw(r);});
 }
}
export function getRoadDetail(vehicleId,partId){
 const service=vehicleServiceDetail(vehicleId,partId);
 if(service)return service;
 if(!getRoadDrivetrain(vehicleId))return null;
 if(vehicleId==='bmw325ci'){const study=getE46RunningDetail(partId);if(study)return study;}
 if(vehicleId==='bmw328xi'){
   if(['powertrain.transmission','drivetrain.gearbox'].includes(partId))return manual;
   if(partId==='drivetrain.transfer')return xdriveClutch;
   if(partId==='drivetrain.front-halfshafts')return axleStudy;
 }
 if(vehicleId==='g500'){
   const suspension=getG500SuspensionDetail(partId);
   if(suspension)return suspension;
   if(partId==='suspension.rear-axle')return getG500DiffDetail(vehicleId,'differentials.rear');
   const differential=getG500DiffDetail(vehicleId,partId);
   if(differential)return differential;
   if(partId==='drivetrain.input-shaft')return g500InputShaftStudy;
   if(['differentials.front-shaft','drivetrain.front-shaft'].includes(partId))return g500FrontProp;
   if(['differentials.rear-shaft','drivetrain.propshaft'].includes(partId))return g500RearProp;
 }
 if(isFleetPlug(vehicleId,partId))return fleetSpark;
 if(partId==='powertrain.spark-plugs')return spark;
 if(partId==='spark.center')return electrode;
 if(vehicleId==='hrv'){
   if(['powertrain.transmission','drivetrain.gearbox'].includes(partId))return cvt;
   if(partId==='cvt.belt')return pushbelt;
   if(partId==='drivetrain.front-differential')return transaxleDiff;
   const awd=getHrvAwdDetail(partId);
   if(awd)return awd;
 }
 if(['g500','c63','f350'].includes(vehicleId)&&['powertrain.transmission','drivetrain.gearbox'].includes(partId))return planetary;
 if(vehicleId==='c63'&&partId==='drivetrain.launch-clutch')return launchClutch;
 if(partId==='drivetrain.torque-converter')return converter;
 if(partId==='drivetrain.halfshafts'||partId==='drive.axles'||vehicleId==='hrv'&&partId==='drivetrain.rear-halfshafts')return vehicleId==='g500'?null:axleStudy;
 if(partId==='shaft.outer')return cvJoint;
 if(['drivetrain.rear-differential','drivetrain.front-differential'].includes(partId))return diff;
 if(vehicleId.startsWith('porsche')){
   if(partId==='drive.gearbox'||partId==='drivetrain.gearbox')return manual;
   if(partId==='drivetrain.clutch')return clutch;
 }
 if(vehicleId==='bmws1000rr'){
   if(partId==='drivetrain.clutch')return multiClutch;
   if(partId==='drive.chain'||partId==='drivetrain.chain')return finalChain;
 }
 return null;
}
