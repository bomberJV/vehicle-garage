// 2008 BMW 328xi (E90) xDrive driveline: six-speed gearbox, the ATC 300 transfer
// case with its servo-clamped multi-plate clutch and gear drive to the front
// output, the front propeller shaft beside the engine, the front final drive on
// the side of the sump with one output shaft passing through it, and the rear
// propeller shaft, final drive and half-shafts. BMW's xDrive SBT gives the
// transfer-case construction; the left-hand placement of the front driveline is
// taken from the earlier E46 xi layout and the N52's right-hand exhaust, and is
// an estimate.
//
// Layout follows BMW's xDrive training description and the 2008 328xi parts
// plates listed below; positions and sizes are estimates around the measured
// axle centres, tracks and wheel offsets.
import {E90_WHEEL_DIMENSIONS as wheels,e90Style156} from './e90-wheel-specs.js';
import {cyl,sleeve,turn,steel,metal,dark,x,y} from './mechanism-shapes.js';

const catalog='https://www.bmwpartsdeal.com/oem-2008-bmw-328xi-';
export const e90Sources={
 xdrive:{label:'BMW · SBT xDrive E60/E61/E90/E91/E92, ATC 300 transfer case (08/2007)',url:'https://5series.net/forums/attachments/diy-do-yourself-14/44011d1202394269-e60-technical-information-topic-xdrive.pdf'},
 transfer:{label:'BMW · 2008 328xi transfer case (parts catalog)',url:catalog+'transfer_case.html'},
 front:{label:'BMW · 2008 328xi front differential (parts catalog)',url:catalog+'differential.html'},
 shafts:{label:'BMW · 2008 328xi drive shafts (parts catalog)',url:catalog+'drive_shaft.html'},
 brakes:{label:'BMW · 2008 328xi brake discs (parts catalog)',url:catalog+'brake_disc.html'}
};
const axle=wheels.wheelbase/2,front=-axle,rear=axle,hubZ=wheels.wheelRadius+.04;
const cast='#6f7a7d',housing='#5c676a',rubber='#2f363a';
const mount=isRear=>(isRear?wheels.trackRear:wheels.trackFront)/2+e90Style156.offset;
const corner=(isRear,s)=>(isRear?'rear-':'front-')+(s<0?'left':'right');

// Key points of the installed driveline.
export const E90_DRIVELINE={
 gearbox:[-.52,0,.45],transfer:[-.12,0,.43],frontOut:[-.20,-.115,.33],
 frontDiff:[front+.01,-.145,.32],rearDiff:[rear-.005,0,.37],centre:[.56,0,.40]
};
const P=E90_DRIVELINE;

function line(r,a,b,radius,color,n=14){r.rod(a,b,radius,color,n);}
function joint(r,c,radius=.042){
  // Rubber boot over a constant-velocity joint.
  const profile=[[-.035,.020],[-.025,radius*.9],[-.010,radius],[.010,radius*.8],[.022,radius],[.035,.020]];
  turn(r,c,y,profile,rubber,{n:12});
}
function gearbox(r){
  // Six-speed manual case, tapering from the bellhousing to the tail.
  const profile=[[-.30,.172],[-.24,.165],[-.12,.130],[0,.118],[.14,.108],[.24,.092],[.28,.060]];
  turn(r,P.gearbox,x,profile,cast,{n:20});
  sleeve(r,P.gearbox,x,-.31,-.29,.178,.10,housing,20);
}
function transfer(r){
  // ATC 300 transfer case: the main housing on the gearbox tail and the gear
  // case dropping to the left-hand front output.
  turn(r,P.transfer,x,[[-.12,.085],[-.08,.095],[.06,.092],[.10,.070],[.12,.045]],housing,{n:18});
  const c=P.transfer,o=P.frontOut;
  for(let i=0;i<=6;i++){
    const t=i/6,p=[c[0]-.06,c[1]+(o[1]-c[1])*t,c[2]+(o[2]-c[2])*t];
    cyl(r,p,x,-.055,.055,.072-.012*t,cast,14);
  }
  cyl(r,[o[0],o[1],o[2]],x,-.10,.02,.045,dark,12);
  // Clutch servo motor on the right side of the case.
  cyl(r,[c[0]+.02,.10,c[2]+.03],y,-.035,.035,.034,dark,12);
}
function frontShaft(r){
  const a=[P.frontOut[0]-.10,P.frontOut[1],P.frontOut[2]],b=[P.frontDiff[0]+.11,P.frontDiff[1]+.02,P.frontDiff[2]];
  line(r,a,b,.024,steel,14);
  for(const p of [a,b])joint(r,p,.038);
}
function frontDiff(r){
  // Front final drive bolted to the left side of the oil sump.
  const c=P.frontDiff;
  turn(r,c,x,[[-.07,.040],[-.05,.080],[.02,.090],[.07,.070],[.10,.040]],housing,{n:18});
  cyl(r,c,y,-.10,.07,.060,cast,16);
  // The tube that carries the right output shaft through the sump.
  cyl(r,[c[0],c[1]+.17,c[2]],y,-.07,.12,.030,cast,12);
}
function frontShafts(r){
  for(const s of [-1,1])r.instance(corner(false,s),()=>{
    const inner=[P.frontDiff[0],s<0?P.frontDiff[1]-.08:P.frontDiff[1]+.30,P.frontDiff[2]];
    const outer=[front,s*(mount(false)-.06),hubZ];
    line(r,inner,outer,.017,steel,12);joint(r,inner);joint(r,[outer[0],outer[1]-s*.02,outer[2]],.048);
  });
}
function rearShaft(r){
  const a=[P.transfer[0]+.12,0,P.transfer[2]],b=[P.rearDiff[0]-.16,0,P.rearDiff[2]+.02];
  line(r,a,P.centre,.036,steel,16);line(r,P.centre,b,.034,steel,16);
  sleeve(r,P.centre,x,-.03,.03,.060,.036,rubber,16);
  for(const p of [a,b])sleeve(r,p,x,-.02,.02,.055,.020,rubber,14);
}
function rearDiff(r){
  const c=P.rearDiff;
  turn(r,c,x,[[-.17,.045],[-.12,.070],[-.05,.112],[.04,.118],[.09,.100],[.11,.060]],housing,{n:20});
  cyl(r,c,y,-.12,.12,.070,cast,16);
}
function rearShafts(r){
  for(const s of [-1,1])r.instance(corner(true,s),()=>{
    const inner=[P.rearDiff[0],s*.13,P.rearDiff[2]],outer=[rear,s*(mount(true)-.06),hubZ];
    line(r,inner,outer,.018,steel,12);joint(r,inner);joint(r,[outer[0],outer[1]-s*.02,outer[2]],.046);
  });
}
const row=(id,name,description,offset,draw,source)=>({id:'drivetrain.'+id,name,description,offset,draw,source});
export const e90Drivetrain={
 id:'drivetrain',name:'Transmission & xDrive',
 description:'The rear axle is always driven. Behind the six-speed gearbox, the ATC 300 transfer case closes an electronically controlled multi-plate clutch to send part of the torque through gears to the front propeller shaft. The front final drive is bolted to the side of the oil sump.',
 source:e90Sources.xdrive,internal:true,category:'service',view:'hero',
 parts:[
  row('gearbox','Six-speed manual gearbox','The gearbox bolts to the N52 at the bellhousing. Its output shaft continues into the transfer case behind it. The six-speed automatic was the alternative.',[-.20,0,.45],gearbox,e90Sources.transfer),
  row('transfer','ATC transfer case','A servo motor turns a control cam that moves the lever clamping the multi-plate clutch. With the clutch open, all the torque goes to the rear axle; closing it sends torque through gears to the front output. Open the clutch to see the plates.',[.06,.30,.32],transfer,e90Sources.transfer),
  row('front-shaft','Front propeller shaft','A short shaft runs forward beside the engine from the transfer case to the front final drive.',[-.16,.40,.06],frontShaft,e90Sources.shafts),
  row('front-differential','Front final drive','The front differential is bolted to the side of the sump. One of its output shafts runs through the sump to the far wheel.',[-.44,.28,-.16],frontDiff,e90Sources.front),
  row('front-halfshafts','Front half-shafts','Each front shaft has an inboard joint and an outboard joint inside the steering knuckle.',[-.10,0,-.30],frontShafts,e90Sources.shafts),
  row('propshaft','Rear propeller shaft','Two tubes meet at a rubber-mounted centre bearing under the tunnel and run to the rear final drive.',[0,-.50,.10],rearShaft,e90Sources.shafts),
  row('rear-differential','Rear final drive','The rear differential sits in the rear axle carrier. Its side flanges drive the two rear half-shafts.',[.40,.02,.34],rearDiff,e90Sources.shafts),
  row('halfshafts','Rear half-shafts','Each rear wheel is driven through an inboard and an outboard constant-velocity joint under rubber boots.',[0,.42,-.27],rearShafts,e90Sources.shafts)
 ]
};
