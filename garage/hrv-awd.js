// 2026 US HR-V EX-L with Real Time AWD. Honda's specification release establishes
// the AWD configuration; no dimensioned driveline drawing is cited in this repository,
// so every shape, length, joint type and clearance below is estimated. Coordinates are
// metres in the shared road model (x rearward, y toward the passenger side, z up).
import {TAU,metal,steel,dark,gold,copper,add,unit,turn,cyl,sleeve,gear,part,study,x,y,z,origin} from './mechanism-shapes.js';
import {drawG500AxleShaft} from './g500-propeller-shafts.js';
import {multiClutch} from './mechanism-shaft.js';

export const hrvDriveSource={label:'Honda · 2026 HR-V transmission and drivetrain specifications',url:'https://hondanews.com/en-US/releases/release-6f8b202ddb1c7f26ecd92774bb014b0c-2026-honda-hr-v-specifications-and-features'};
const rubber='#394248';
const halfWheelbase=1.327;
// The body floor sits at about z .435 above the whole underbody, so the rear
// differential is carried low in the subframe opening. The rear half-shafts rise
// from it to the wheel centers at the front half-shaft height (all estimated).
export const hrvRearDriveZ=.32,hrvRearHubZ=.37,hrvFloorZ=.435;
// The transfer surrounds the left front half-shaft outboard of the engine block.
// Its output runs rearward beside the block, above the front cradle.
export const hrvTransfer={case:[-1.300,-.405,.375],caseRadius:.058,caseHalf:.055,output:[-.92,-.405,.37],noseStart:-1.29,noseRadius:.036};
export const hrvPropshaft={front:hrvTransfer.output,rear:[1.06,0,hrvRearDriveZ],centerX:.10,supportBack:.16};
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const span=hrvPropshaft.rear[0]-hrvPropshaft.front[0];
export const hrvCenterJoint=lerp(hrvPropshaft.front,hrvPropshaft.rear,(hrvPropshaft.centerX-hrvPropshaft.front[0])/span);
const shaftDirection=unit(hrvPropshaft.rear.map((v,i)=>v-hrvPropshaft.front[i]));
export const hrvCenterSupport=add(hrvCenterJoint,shaftDirection,-hrvPropshaft.supportBack);
export const hrvDiffCenter=[halfWheelbase,0,hrvRearDriveZ];
// The rear half-shafts end at the knuckle face; the hub bearing is part of the wheel end.
export const hrvRearShaftEnd=.733;

function transferCase(r){
 const {case:c,caseRadius:R,caseHalf:h,output:o,noseStart,noseRadius:n}=hrvTransfer;
 turn(r,c,y,[[-h,0],[-h,R*.86],[-h*.78,R],[h*.78,R],[h,R*.86],[h,0]],steel,{n:18});
 const length=o[0]-.01-noseStart,mid=[noseStart+length/2,o[1],o[2]];
 turn(r,mid,x,[[-length/2,0],[-length/2,n],[length*.30,n],[length*.38,n*.86],[length/2,n*.86],[length/2,0]],dark,{n:16});
 sleeve(r,[o[0]-.005,o[1],o[2]],x,-.005,.005,.050,.012,metal,18);
}
// Two sections meet at flanges ahead of the tank; each has a cross joint at both ends.
// The cited sources do not identify the joint types, so the existing cross-joint helper is used.
const sectionKeys={
 'front-flange':[[0,'transfer-flange']],'front-joint':[[0,'transfer-yokes'],[0,'transfer-cross']],'front-tube':[[0,'tube'],[0,'slip']],
 'center-joint':[[0,'axle-yokes'],[0,'axle-cross'],[0,'axle-flange'],[1,'transfer-flange'],[1,'transfer-yokes'],[1,'transfer-cross']],
 'rear-tube':[[1,'tube'],[1,'slip']],'rear-joint':[[1,'axle-yokes'],[1,'axle-cross']],'rear-flange':[[1,'axle-flange']]
};
export function drawHrvPropshaftPiece(r,key,front=hrvPropshaft.front,center=hrvCenterJoint,rear=hrvPropshaft.rear){
 if(key==='center-support')return centerSupport(r,add(center,unit(rear.map((v,i)=>v-front[i])),-hrvPropshaft.supportBack),unit(rear.map((v,i)=>v-front[i])));
 const sections=[[front,center],[center,rear]];
 for(const [index,only] of sectionKeys[key])drawG500AxleShaft(r,...sections[index],only);
}
function centerSupport(r,c,axis,mount=true){
 const lift=hrvFloorZ-.005-c[2];
 sleeve(r,c,axis,-.014,.014,.036,.031,metal,18);
 sleeve(r,c,axis,-.017,.017,.047,.036,rubber,20);
 sleeve(r,c,axis,-.012,.012,.052,.047,steel,20);
 if(!mount)return;
 // The bracket feet stop just below the floor pan. Fastener positions are estimated.
 for(const s of [-1,1]){
  const side=[-axis[1]*s,axis[0]*s,0],foot=add(add(c,side,.084),z,lift-.005);
  r.rod(add(add(c,side,.046),z,.018),foot,.007,steel,8);
  r.box(foot[0]-.016,foot[1]-.016,foot[2],foot[0]+.016,foot[1]+.016,foot[2]+.005,steel);
 }
}
function drawPropshaft(r){for(const key of Object.keys(sectionKeys))drawHrvPropshaftPiece(r,key);}
function rearCoupling(r){
 const c=[hrvPropshaft.rear[0],0,hrvRearDriveZ];
 sleeve(r,c,x,0,.010,.050,.012,metal,18);
 turn(r,c,x,[[.010,0],[.010,.054],[.028,.064],[.140,.064],[.155,.058],[.175,.058],[.175,0]],dark,{n:18});
 for(const p of [.05,.09])sleeve(r,c,x,p,p+.008,.068,.062,steel,18);
 // Electronic actuator and connector on top of the coupling (position estimated).
 r.box(c[0]+.045,-.030,c[2]+.060,c[0]+.110,.030,c[2]+.082,'#4a5559');
 cyl(r,[c[0]+.095,.030,c[2]+.071],y,0,.016,.008,rubber,10);
}
function rearDifferential(r){
 const c=hrvDiffCenter;
 turn(r,c,y,[[-.13,0],[-.13,.05],[-.09,.085],[-.045,.105],[.045,.105],[.09,.085],[.13,.05],[.13,0]],steel,{n:20});
 for(const s of [-1,1])cyl(r,c,y,s*.13,s*.165,.042,metal,16);
 cyl(r,c,x,.098,.108,.072,dark,18);
}
// Each shaft rises from the differential output to its wheel center.
function rearShaftFrame(s){
 const inner=[halfWheelbase,s*.165,hrvRearDriveZ],outer=[halfWheelbase,s*hrvRearShaftEnd,hrvRearHubZ];
 const v=outer.map((q,i)=>q-inner[i]);return {inner,axis:unit(v),length:Math.hypot(...v)};
}
function rearShafts(r){
 for(const s of [-1,1]){
  const {inner:c,axis,length:L}=rearShaftFrame(s);
  cyl(r,c,axis,0,L-.05,.021,metal,14);
  // Plunging inboard joint and fixed outboard joint, each behind a grease boot.
  turn(r,c,axis,[[0,0],[0,.044],[.020,.046],[.060,.044],[.070,.030],[.070,0]],dark,{n:14});
  for(const [start,direction] of [[.070,1],[L-.066,-1]]){
   const profile=[[0,.026]];
   for(let i=0;i<4;i++)profile.push([.008+i*.009,.040-i*.003],[.0125+i*.009,.030-i*.002]);
   profile.push([.044,.023],[.044,0]);
   turn(r,c,axis,profile.map(([d,rad])=>[start+direction*d,rad]),rubber,{n:14});
  }
  turn(r,c,axis,[[L-.066,0],[L-.066,.032],[L-.050,.046],[L-.020,.048],[L,.040],[L,0]],steel,{n:14});
 }
}
const row=(key,name,description,offset,draw)=>[key,name,description,offset,draw,hrvDriveSource];
export const hrvAwdRows=[
 row('transfer','Front transfer unit','Honda’s Real Time AWD takes drive for the rear wheels from the front differential. This power take-off surrounds the left front half-shaft and turns the drive rearward at right angles. Its case outline and output position are estimated.',[-.18,-.42,.12],transferCase),
 row('propshaft','Two-piece propeller shaft','The shaft runs from the transfer output beside the engine to the rear coupling, passing through a recess in the fuel tank. Its sections meet at flanges ahead of the tank. Routing, lengths and joint types are estimated.',[0,-.46,-.22],drawPropshaft),
 row('center-support','Center support bearing','A rubber-mounted bearing carries the front section just ahead of the center flanges. Its bracket is drawn below the floor pan; the fasteners are not modeled.',[.06,-.32,-.42],r=>drawHrvPropshaftPiece(r,'center-support')),
 row('rear-coupling','Electronically controlled rear coupling','A clutch pack between the propeller shaft and the rear differential sets how much torque the rear wheels receive. The vehicle’s control unit commands its actuator. Open it to see the plate stack; the housing and actuator are estimated.',[-.12,-.30,.28],rearCoupling),
 row('rear-differential','Rear differential','The rear final drive turns the coupling output through a right angle and divides it between the rear half-shafts. It sits in the opening of the rear subframe. Its housing is estimated.',[.42,0,.40],rearDifferential),
 row('rear-halfshafts','Rear half-shafts','A plunging inboard joint and a fixed outboard joint let each shaft follow the multi-link rear suspension. The shafts pass beneath the rear coil springs.',[.12,.38,-.30],rearShafts),
];

// Detail studies. Tooth counts, plate counts and proportions are illustrative.
const T=[0,0,.90],pinionAxis=[0,.46,1.0];
const ringAngle=t=>TAU*t,pinionAngle=t=>-3*TAU*t;
export const hrvTransferStudy=study('hrv-transfer','Front transfer unit','A hollow input shaft is splined to the front differential carrier and turns around the left half-shaft. A bevel ring gear on that shaft drives a pinion at right angles, and the pinion turns the output flange for the propeller shaft. The cited specifications do not give its gearing; tooth counts and proportions are illustrative.',hrvDriveSource,[
 part('case','Cutaway transfer case','A window is cut into the case so the gear mesh stays visible. Bearings and seals are reduced to their positions.',[0,-.10,.62],r=>{
   turn(r,T,y,[[-.45,.30],[-.45,.74],[.66,.74],[.66,.67],[-.38,.67],[-.38,.30],[-.45,.30]],steel,{start:.5,sweep:4.0,n:28});
   turn(r,pinionAxis,x,[[.62,.20],[.62,.26],[1.40,.26],[1.40,.20],[.62,.20]],steel,{start:5.6,sweep:4.5,n:20});
 }),
 part('input','Hollow input shaft','Splines at the inboard end engage the differential carrier. The half-shaft passes through the bore without touching it.',[0,-.85,-.10],(r,t)=>{
   sleeve(r,T,y,-.95,.36,.16,.10,metal,24);gear(r,T,y,-.95,-.80,.18,.18,18,steel,ringAngle(t),.56);
 }),
 part('ring','Bevel ring gear','The ring gear turns with the input shaft. Its angled teeth drive the pinion through a right angle.',[-.55,.05,.30],(r,t)=>{
   gear(r,T,y,.18,.32,.58,.46,36,gold,ringAngle(t),.30);sleeve(r,T,y,.10,.20,.30,.16,steel,24);
 }),
 part('pinion','Output pinion','The smaller pinion makes three turns for each turn of the ring gear in this illustration. Its axis lies slightly above the ring gear center.',[.10,.35,.45],(r,t)=>{
   gear(r,pinionAxis,x,.64,.42,.15,.105,12,copper,pinionAngle(t),.3);
 }),
 part('output','Output shaft and bearings','Two bearings support the pinion shaft in the case nose.',[.30,.55,-.20],r=>{
   cyl(r,pinionAxis,x,.64,1.50,.07,steel,18);
   for(const p of [.72,1.25])sleeve(r,pinionAxis,x,p,p+.08,.15,.07,metal,20);
 }),
 part('flange','Output flange','The flange bolts to the front joint of the propeller shaft.',[.75,0,0],(r,t)=>{
   sleeve(r,pinionAxis,x,1.50,1.56,.24,.07,metal,24);
   for(let i=0;i<4;i++){const a=pinionAngle(t)+i*TAU/4;cyl(r,[0,pinionAxis[1]+.17*Math.cos(a),pinionAxis[2]+.17*Math.sin(a)],x,1.56,1.60,.022,dark,10);}
 }),
],'The input shaft and ring gear turn with the front differential. The pinion and output flange turn at right angles, three times for each ring-gear turn in this illustration.');
hrvTransferStudy.viewAngle=[-.75,.48];

const studyFront=[-1.04,0,0],studyCenter=[0,0,0],studyRear=[.98,0,0];
const shaftRows=[
 ['front-flange','Transfer flange','The front flange bolts to the transfer output flange.',[-.20,0,.04]],
 ['front-joint','Front cross joint','The cross lets the shaft run at an angle to the transfer output.',[-.10,.13,0]],
 ['front-tube','Front tube and slip sleeve','The sliding section takes up small length changes as the drivetrain moves on its mounts.',[0,-.16,0]],
 ['center-support','Center support bearing','The bearing runs on the front section inside a rubber cushion and steel carrier. The rubber limits the vibration passed into the floor.',[-.06,0,.17]],
 ['center-joint','Center flanges and joints','The two sections bolt together here. A cross joint on each side of the flanges takes up the change of angle.',[.02,.15,0]],
 ['rear-tube','Rear tube and slip sleeve','The rear section passes through the tunnel recess in the fuel tank.',[.04,-.16,.02]],
 ['rear-joint','Rear cross joint','The rear cross joint meets the coupling input square to the differential axis.',[.10,.13,0]],
 ['rear-flange','Coupling flange','The rear flange bolts to the input flange of the electronically controlled coupling.',[.20,0,.04]],
];
export const hrvPropshaftStudy=study('hrv-propshaft','Two-piece propeller shaft','The shaft carries drive from the front transfer unit to the rear coupling. It is shown straight here; on the vehicle the sections run at a small angle beside the engine and through the fuel-tank recess. Lengths, joint types and the support position are estimated.',hrvDriveSource,
 shaftRows.map(([key,name,description,offset])=>part(key,name,description,offset,r=>key==='center-support'?centerSupport(r,add(studyCenter,x,-hrvPropshaft.supportBack),x,false):drawHrvPropshaftPiece(r,key,studyFront,studyCenter,studyRear))));
hrvPropshaftStudy.viewAngle=[-.55,.42];

const plateNote={'wetclutch.pressure':'The actuator presses the stack through this plate. Three plate pairs are drawn so the alternating engagement is easy to see; the fitted plate count is not given in the cited sources.'};
export const hrvCouplingStudy={...multiClutch,id:'hrv-coupling',name:'Rear coupling clutch pack',source:hrvDriveSource,
 description:'Alternating friction plates and steel discs connect the propeller shaft to the rear differential pinion. One member turns with each shaft. The more firmly the electronically controlled actuator clamps the stack, the more torque reaches the rear wheels; released, the HR-V drives mainly through the front wheels. This section is illustrative.',
 groups:multiClutch.groups.map(g=>({...g,parts:g.parts.map(p=>plateNote[p.id]?{...p,description:plateNote[p.id]}:p)}))};

export function getHrvAwdDetail(partId){
 if(partId==='drivetrain.transfer')return hrvTransferStudy;
 if(['drivetrain.propshaft','drivetrain.center-support'].includes(partId))return hrvPropshaftStudy;
 if(partId==='drivetrain.rear-coupling')return hrvCouplingStudy;
 return null;
}
