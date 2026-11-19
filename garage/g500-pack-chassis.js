// G500 study pack: chassis.
// Chassis, steering and brakes: springs, dampers, bushings, arms, steering linkage and box, brake lines, calipers, parking brake.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
//
// Round 1 left out the parts the register models generically (coil springs, dampers, bump stops,
// arms and rods, rotors, calipers, pads, the front hose, the steering box and its linkage, and the
// pump, reservoir, pressure hose and cooler) and added the numbered pieces around them. Round 2
// gives those generic parts their catalog numbers, in studies that open from the generic parts
// themselves, so no component is modeled twice. ABS sensors and rings are still left out.
import {metal,steel,dark,gold,turn,cyl,sleeve,bead,part,study,x,y,z} from './mechanism-shapes.js';

const mbpg='https://www.mbpartsgiant.com/parts-list/';
const plate=(label,path)=>({label:'MB Parts Giant · '+label,url:mbpg+path});
const framePlate=plate('2004 G500 frame and components diagram','2004-mercedes_benz-g500/body-hardware/frame-components');
const stabilizerPlate=plate('2005 G500 stabilizer bar and front suspension diagram','2005-mercedes_benz-g500/suspension/stabilizer-bar-components');
const rearSuspensionPlate=plate('2005 G500 rear suspension components diagram','2005-mercedes_benz-g500/suspension/rear-suspension-components');
const linkagePlate=plate('2004 G500 steering gear and linkage diagram','2004-mercedes_benz-g500/steering/steering-gear-linkage');
const pumpPlate=plate('2004 G500 power-steering pump and hoses diagram','2004-mercedes_benz-g500/steering/p-s-pump-hoses');
const columnPlate=plate('2005 G500 steering column assembly diagram','2005-mercedes_benz-g500/steering/steering-column-assembly');
const frontBrakePlate=plate('2004 G500 front brakes diagram','2004-mercedes_benz-g500/brakes/front-brakes');
const lateFrontBrakePlate=plate('2008 G500 front brakes diagram','2008-mercedes_benz-g500/brakes/front-brakes');
const rearBrakePlate=plate('2004 G500 rear brakes diagram','2004-mercedes_benz-g500/brakes/rear-brakes');
const lateRearBrakePlate=plate('2008 G500 rear brakes diagram','2008-mercedes_benz-g500/brakes/rear-brakes');
const parkingPlate=plate('2004 G500 parking brake diagram','2004-mercedes_benz-g500/brakes/parking-brake');
// Round 2 sources. MB Parts Giant diagram pages for 2002 and 2006, two of its part listings
// that give year ranges, and two ECS Tuning pages for the 2002–2003 G500 (463.249) that list
// genuine Mercedes numbers the diagram pages leave out.
const mbList=(label,slug)=>({label:'MB Parts Giant · '+label,url:'https://www.mbpartsgiant.com/'+slug});
const earlyFrontBrakePlate=plate('2002 G500 front brakes diagram','2002-mercedes_benz-g500/brakes/front-brakes');
const earlyBrakePartsPlate=plate('2002 G500 brake components diagram','2002-mercedes_benz-g500/brakes/brake-components');
const earlyParkingPlate=plate('2002 G500 parking brake diagram','2002-mercedes_benz-g500/brakes/parking-brake');
const midRearBrakePlate=plate('2006 G500 rear brakes diagram','2006-mercedes_benz-g500/brakes/rear-brakes');
const lateBrakePartsPlate=plate('2008 G500 brake components diagram','2008-mercedes_benz-g500/brakes/brake-components');
const caliperListing=mbList('G500 brake caliper listing','oem-mercedes_benz-g500-brake_caliper');
const ecsLinesPage={label:'ECS Tuning · 2003 G500 (463.249) brake lines',url:'https://www.ecstuning.com/Mercedes_Benz-2003-G500-463.249-Base-Sport_Utility-V8_5.0L/Braking/Lines/'};
const earlyColumnPlate=plate('2002 G500 steering column diagram','2002-mercedes_benz-g500/steering/steering-column');
const midColumnPlate=plate('2006 G500 steering column diagram','2006-mercedes_benz-g500/steering/steering-column');
const earlyColumnAssemblyPlate=plate('2002 G500 steering column assembly diagram','2002-mercedes_benz-g500/steering/steering-column-assembly');
const earlyLinkagePlate=plate('2002 G500 steering gear and linkage diagram','2002-mercedes_benz-g500/steering/steering-gear-linkage');
const earlyPumpPlate=plate('2002 G500 power-steering pump and hoses diagram','2002-mercedes_benz-g500/steering/p-s-pump-hoses');
const pumpListing=mbList('G500 power steering pump listing','oem-mercedes_benz-g500-power_steering_pump');
const steeringHoseListing=mbList('G500 power steering hose listing','oem-mercedes_benz-g500-power_steering_hose');
const earlyWheelPlate=plate('2002 G500 wheels diagram','2002-mercedes_benz-g500/suspension/wheels');
const earlyFrontSuspensionPlate=plate('2002 G500 stabilizer bar and front suspension diagram','2002-mercedes_benz-g500/suspension/stabilizer-bar-components');
const midFrontSuspensionPlate=plate('2006 G500 front suspension components diagram','2006-mercedes_benz-g500/suspension/front-suspension-components');
const earlyRearSuspensionPlate=plate('2002 G500 rear suspension components diagram','2002-mercedes_benz-g500/suspension/rear-suspension-components');
const spareCarrierPlate=plate('2006 G500 spare tire carrier diagram','2006-mercedes_benz-g500/body-hardware/carrier-components-spare-tire');
const spacerPage=mbList('spare carrier spacer 463-991-28-40 fitment','genuine/mercedes-benz~carrier-assembly-bushing~4639912840');
export const chassisPackSources={framePlate,stabilizerPlate,rearSuspensionPlate,linkagePlate,pumpPlate,columnPlate,frontBrakePlate,lateFrontBrakePlate,rearBrakePlate,lateRearBrakePlate,parkingPlate,
  earlyFrontBrakePlate,earlyBrakePartsPlate,earlyParkingPlate,midRearBrakePlate,lateBrakePartsPlate,caliperListing,ecsLinesPage,earlyColumnPlate,midColumnPlate,earlyColumnAssemblyPlate,
  earlyLinkagePlate,earlyPumpPlate,pumpListing,steeringHoseListing,earlyWheelPlate,earlyFrontSuspensionPlate,midFrontSuspensionPlate,earlyRearSuspensionPlate,spareCarrierPlate,spacerPage};

const rubber='#26292b',zinc='#a9b2ad',paint='#3d4548',hose='#2f3335';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,n);};
const path=(r,pts,rad,color,n=8)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,n);};
const sourced=(source,p)=>({...p,source});
// A pressed bracket: a base plate with an upright web.
const bracket=(r,c,w,d,h,color=steel)=>{block(r,[c[0],c[1],c[2]],[w,d,.025],color);block(r,[c[0],c[1]+d/2-.0125,c[2]+h/2],[w,.025,h],color);};
// A hose with crimped ends.
const flexHose=(r,pts,rad=.022)=>{path(r,pts,rad,hose);for(const p of [pts[0],pts.at(-1)])cyl(r,p,z,-.03,.03,rad*1.5,metal,10);};
const claim=(ids,fact,need,source)=>({ids,kind:'diagram',fact,need,source});
const idsFrom=(s,source)=>s.groups[0].parts.filter(p=>(p.source||s.source)===source).map(p=>p.id);
// A coil spring as a helix of short tubes, standing on z.
const coil=(r,c,R,h,turns,rad,color)=>{const pts=[],n=Math.round(turns*8);for(let i=0;i<=n;i++){const a=i/n*turns*Math.PI*2;pts.push([c[0]+R*Math.cos(a),c[1]+R*Math.sin(a),c[2]+h*i/n]);}path(r,pts,rad,color,6);};
// A hex nut or bolt head on an axis.
const hex=(r,c,a,h,rad,color=metal)=>turn(r,c,a,[[0,0],[0,rad],[h,rad],[h,0]],color,{n:6});

// Frame brackets. The ladder frame itself is the hooked part; these are the numbered
// brackets and supports the frame plate lists on it. Rails run along x at y = ±.4.
const frame=study('g500-frame-brackets','Frame brackets and supports','The body-mount brackets, suspension arm brackets, axle supports and line brackets the G500 frame plate lists on the ladder frame.',framePlate,[
  part('cab-1-right','Body mount bracket No. 1, right · 463-310-12-63','The outrigger on the right rail that carries the front body mount.',[-.15,.25,.2],r=>{bracket(r,[-.7,.5,.05],.12,.14,.08);cyl(r,[-.7,.52,.065],z,0,.03,.035,steel,12);}),
  part('cab-1-left','Body mount bracket No. 1, left · 463-310-13-63','The matching outrigger on the left rail for the front body mount.',[-.15,-.25,.2],r=>{bracket(r,[-.7,-.5,.05],.12,.14,.08);cyl(r,[-.7,-.52,.065],z,0,.03,.035,steel,12);}),
  part('cab-2-right','Body mount bracket No. 2, right · 463-310-01-67','The second body-mount bracket on the right rail, under the front doors.',[0,.3,.25],r=>bracket(r,[-.15,.5,.04],.1,.12,.07)),
  part('cab-2-left','Body mount bracket No. 2, left · 463-310-05-67','The second body-mount bracket on the left rail.',[0,-.3,.25],r=>bracket(r,[-.15,-.5,.04],.1,.12,.07)),
  part('cab-3','Body mount brackets No. 3 · 461-310-26-63','The third body-mount brackets, one on each rail under the rear doors.',[.1,0,.3],r=>{for(const s of [-1,1])bracket(r,[.35,s*.5,.04],.1,.12,.07);}),
  part('front-arm-left','Front radius-arm bracket, left · 460-330-03-74','The frame bracket that takes the rear end of the left front radius arm.',[-.25,-.2,-.25],r=>{block(r,[-.35,-.4,-.08],[.14,.06,.16],paint);sleeve(r,[-.35,-.43,-.12],y,0,.06,.04,.02,steel,12);}),
  part('front-arm-right','Front radius-arm bracket, right · 460-330-04-74','The frame bracket for the right front radius arm.',[-.25,.2,-.25],r=>{block(r,[-.35,.4,-.08],[.14,.06,.16],paint);sleeve(r,[-.35,.37,-.12],y,0,.06,.04,.02,steel,12);}),
  part('rear-arm-left','Rear trailing-arm bracket, left · 460-350-50-38','The frame bracket that takes the front end of the left rear trailing arm.',[.25,-.2,-.25],r=>{block(r,[.6,-.4,-.08],[.14,.06,.16],paint);sleeve(r,[.6,-.43,-.12],y,0,.06,.04,.02,steel,12);}),
  part('rear-arm-right','Rear trailing-arm bracket, right · 460-350-51-38','The frame bracket for the right rear trailing arm.',[.25,.2,-.25],r=>{block(r,[.6,.4,-.08],[.14,.06,.16],paint);sleeve(r,[.6,.37,-.12],y,0,.06,.04,.02,steel,12);}),
  part('front-axle-bracket','Front axle mount bracket · 460-330-00-43','The bracket the frame plate lists for the front axle, at the front of the frame.',[-.45,0,-.15],r=>{block(r,[-.9,.25,-.05],[.1,.08,.14],paint);block(r,[-.9,.25,.03],[.16,.12,.02],paint);}),
  part('abs-bracket','ABS sensor lead bracket · 463-428-08-40','A small bracket on the frame that holds an ABS sensor lead.',[.35,.35,.05],r=>{block(r,[.9,.42,.0],[.06,.02,.06],zinc);block(r,[.9,.45,.03],[.06,.04,.01],zinc);}),
  part('hose-bracket','Brake hose bracket · 463-428-18-40','The frame bracket where a steel brake line meets a flexible hose.',[.4,-.35,.05],r=>{block(r,[.95,-.42,.0],[.07,.02,.07],zinc);cyl(r,[.95,-.45,.01],y,-.02,.02,.018,metal,10);}),
  part('rear-axle-support','Rear axle support · 460-350-01-32','The support the frame plate lists for the rear axle.',[.45,0,-.3],r=>{block(r,[.85,0,-.1],[.08,.5,.06],paint);for(const s of [-1,1])block(r,[.85,s*.25,-.04],[.08,.04,.08],paint);}),
  part('stiffeners','Frame stiffeners · 460-322-51-41','A stiffening plate on each rail.',[0,0,-.4],r=>{for(const s of [-1,1])block(r,[-.55,s*.4,-.02],[.24,.02,.08],steel);})
]);
frame.viewAngle=[-.6,.45];

// One body-mount stack, exploded upward: the frame bracket below, then the lower plate,
// lower insulator, spacer tube, body flange, upper insulator and upper plate.
const ring=(r,zz,h,outer,inner,color,cx=0)=>sleeve(r,[cx,0,zz],z,0,h,outer,inner,color,20);
const mounts=study('g500-body-mount-stack','Body mount insulators','Each body mount clamps the body flange between rubber insulators over a frame bracket. The frame plate numbers the insulators, plates and spacer tubes for mounts No. 1 and No. 3.',framePlate,[
  part('upper-1','Upper insulator, mount No. 1 · 460-317-01-12','The rubber that sits on top of the body flange at the front mount.',[-.3,0,.35],r=>ring(r,.12,.07,.12,.03,rubber,-.3)),
  part('upper-3','Upper insulator, mount No. 3 · 460-317-05-12-64','The upper rubber of the rear body mounts.',[.3,0,.35],r=>ring(r,.12,.06,.11,.03,rubber,.3)),
  part('upper-plate-1','Upper insulator plate, mount No. 1 · 460-317-00-35-64','The steel washer plate that spreads the bolt load on the upper rubber.',[-.3,0,.6],r=>ring(r,.2,.015,.13,.025,steel,-.3)),
  part('lower','Lower insulators, mounts No. 1 and No. 3 · 460-317-06-12-64','The rubber under the body flange, between it and the frame bracket. One number serves both mounts.',[0,0,-.25],r=>{for(const cx of [-.3,.3])ring(r,-.05,.06,.12,.03,'#33383a',cx);}),
  part('lower-plate-1','Lower insulator plate, mount No. 1 · 460-317-04-35','The steel plate below the front mount’s lower rubber.',[-.3,0,-.5],r=>ring(r,-.08,.015,.13,.025,steel,-.3)),
  part('spacer-1','Spacer tube, mount No. 1 · 460-317-02-53-64','The steel sleeve through the front mount that sets how far the rubbers are squeezed.',[-.55,0,0],r=>sleeve(r,[-.3,0,-.06],z,0,.25,.025,.017,metal,12)),
  part('spacer-3','Spacer tube, mount No. 3 · 463-317-00-53','The spacer sleeve through the rear mounts.',[.55,0,0],r=>sleeve(r,[.3,0,-.06],z,0,.23,.025,.017,metal,12))
]);
mounts.viewAngle=[-.5,.25];

// Spring seats and the frame-side damper mounts.
const coilPad=(r,c,outer,color)=>turn(r,c,z,[[0,outer-.05],[0,outer],[.025,outer],[.04,outer-.05],[0,outer-.05]],color,{n:22});
const shockMount=(r,c,s)=>{block(r,[c[0],c[1],c[2]],[.12,.03,.18],paint);block(r,[c[0],c[1]-s*.05,c[2]+.08],[.12,.1,.025],paint);cyl(r,[c[0],c[1]-s*.06,c[2]-.05],y,-.03,.03,.02,metal,10);};
const springs=study('g500-spring-damper-mounts','Springs, dampers and their mounts','The coil springs, dampers and bump stops at each axle, with the rubber spring seats and the frame brackets that carry the upper damper eyes.',stabilizerPlate,[
  part('front-seat','Front spring insulator · 460-322-01-67','The rubber pad between the front coil spring and its seat.',[-.25,0,-.3],r=>coilPad(r,[-.45,0,-.2],.17,rubber)),
  sourced(rearSuspensionPlate,part('rear-seat','Rear spring seat · 460-325-09-15','The rubber spring seat at each rear coil spring.',[.25,0,-.3],r=>coilPad(r,[.45,0,-.2],.16,'#33383a'))),
  sourced(framePlate,part('front-shock-mount','Front damper mounts · 463-320-00-78','The frame brackets that hold the top of each front damper.',[-.25,0,.35],r=>{for(const s of [-1,1])shockMount(r,[-.45,s*.35,.15],s);})),
  sourced(framePlate,part('rear-shock-mount-left','Rear damper mount, left · 460-320-16-78','The frame bracket for the top of the left rear damper.',[.25,-.25,.35],r=>shockMount(r,[.45,-.35,.15],-1))),
  sourced(framePlate,part('rear-shock-mount-right','Rear damper mount, right · 460-320-17-78','The frame bracket for the top of the right rear damper.',[.25,.25,.35],r=>shockMount(r,[.45,.35,.15],1))),
  sourced(earlyFrontSuspensionPlate,part('front-coil','Front coil spring · 463-321-03-04-62','The front coil spring the 2002 plate lists for the G500. It stands on the insulator over each end of the front axle.',[-.6,0,.05],r=>coil(r,[-.45,0,-.17],.14,.32,4,.018,'#556a70'))),
  sourced(earlyRearSuspensionPlate,part('rear-coil','Rear coil spring · 460-324-07-04-52','The rear coil spring the 2002 rear plate lists for the G500, over each end of the rear axle.',[.6,0,.05],r=>coil(r,[.45,0,-.17],.13,.32,4.5,.017,'#556a70'))),
  sourced(earlyFrontSuspensionPlate,part('front-damper','Front dampers, 2002 listing · WA-005-323-01-00','The front shock absorbers the 2002 plate lists for the G500, from the axle up to the frame mounts.',[-.35,0,-.45],r=>{for(const s of [-1,1]){cyl(r,[-.45,s*.35,-.32],z,0,.24,.032,dark,12);cyl(r,[-.45,s*.35,-.08],z,0,.2,.01,metal,8);}})),
  sourced(midFrontSuspensionPlate,part('front-damper-late','Front dampers, 2006 listing · 463-323-01-00','The front shock absorber number the 2006 front suspension plate lists for the G500.',[-.35,0,-.7],r=>{for(const s of [-1,1])sleeve(r,[-.45,s*.35,-.3],z,0,.05,.04,.032,'#596266',12);})),
  sourced(earlyRearSuspensionPlate,part('rear-damper','Rear dampers · WA-004-326-01-00','The rear shock absorbers the 2002 rear plate lists for the G500.',[.35,0,-.45],r=>{for(const s of [-1,1]){cyl(r,[.45,s*.35,-.32],z,0,.24,.032,dark,12);cyl(r,[.45,s*.35,-.08],z,0,.2,.01,metal,8);}})),
  sourced(earlyFrontSuspensionPlate,part('front-stop','Front bump stops · 463-321-00-06-64','The rubber stops inside the front springs that cushion full axle travel.',[-.45,0,.6],r=>turn(r,[-.45,0,.08],z,[[0,0],[0,.03],[.04,.045],[.1,.05],[.1,0]],rubber,{n:14}))),
  sourced(earlyRearSuspensionPlate,part('rear-stop','Rear bump stops · 460-320-02-44-64','The rubber stops for the rear axle, left and right.',[.45,0,.6],r=>turn(r,[.45,0,.08],z,[[0,0],[0,.03],[.04,.045],[.1,.05],[.1,0]],rubber,{n:14})))
]);
springs.viewAngle=[-.55,.3];

// Front stabilizer bar across the front of the chassis.
const bar=[[-.05,-.6,0],[.05,-.55,0],[.12,-.4,0],[.12,.4,0],[.05,.55,0],[-.05,.6,0]];
const stabilizer=study('g500-front-stabilizer','Front stabilizer bar','The torsion bar across the front of the chassis, with its rubber mounts, clamp brackets, U-bolts and drop links.',stabilizerPlate,[
  part('bar','Front stabilizer bar · 463-323-04-65-65','The bent torsion bar that resists body roll. Its arms reach back to the drop links.',[0,0,.35],r=>{path(r,[[.12,-.4,0],[.12,.4,0]],.022,dark,12);for(const s of [-1,1])path(r,[[.12,s*.4,0],[.05,s*.55,0],[-.35,s*.6,-.02]],.022,dark,12);}),
  part('bushings','Stabilizer bar bushings · 463-323-02-85, 463-323-04-85','The split rubber mounts that hold the bar. The first number is listed for 2002–2005 and the second for 2006–2008.',[0,0,-.2],r=>{for(const s of [-1,1])sleeve(r,[.12,s*.3,0],y,-.04,.04,.045,.024,rubber,16);}),
  part('second-bushings','Stabilizer bushings, second position · 463-323-03-85','The second rubber mount the stabilizer diagram lists, near the outer bends of the bar.',[-.1,0,-.35],r=>{for(const s of [-1,1])sleeve(r,[.08,s*.5,0],[-.3,s*.5,0],-.03,.03,.04,.024,'#33383a',14);}),
  part('brackets','Stabilizer bushing brackets · 460-323-01-40','The clamp brackets over the bar bushings, one per side.',[0,0,.15],r=>{for(const s of [-1,1]){turn(r,[.12,s*.3,0],y,[[-.045,.05],[-.045,.065],[.045,.065],[.045,.05],[-.045,.05]],steel,{n:12,start:-Math.PI/2,sweep:Math.PI});block(r,[.12,s*.3,-.065],[.18,.09,.012],steel);}}),
  part('u-bolts','Stabilizer mount U-bolts · 460-323-50-26','The U-bolts listed with the bushing brackets, one per side.',[.3,0,-.15],r=>{for(const s of [-1,1]){for(const dx of [-.07,.07])cyl(r,[.12+dx,s*.3,-.07],z,-.12,0,.009,metal,8);turn(r,[.12,s*.3,-.19],y,[[-.009,.07],[-.009,.088],[.009,.088],[.009,.07],[-.009,.07]],metal,{n:10,start:0,sweep:Math.PI});}}),
  part('links','Stabilizer drop links · 463-320-01-32','The short links from each bar end down to the axle, left and right.',[-.3,0,-.1],r=>{for(const s of [-1,1]){tube(r,[-.35,s*.6,-.02],[-.35,s*.6,-.3],.016,steel);for(const zz of [-.02,-.3])sleeve(r,[-.35,s*.6,zz],y,-.025,.025,.035,.016,steel,12);}}),
  part('link-bushings','Drop link bushings · 309-320-00-73-64','The rubber bushings in the eyes of the drop links.',[-.5,0,-.35],r=>{for(const s of [-1,1])for(const zz of [-.02,-.3])sleeve(r,[-.35,s*.6,zz],y,-.024,.024,.03,.012,rubber,12);})
]);
stabilizer.viewAngle=[-.5,.4];

// The steering knuckles on the ends of the axle, with the steering arms bolted to them.
const knuckle=(r,s)=>{
  const c=[0,s*.5,0];
  turn(r,c,z,[[-.25,0],[-.25,.11],[-.2,.15],[.2,.15],[.25,.11],[.25,0]],'#8f9a9c',{n:20});
  sleeve(r,[0,s*.5,0],y,0,s*.22,.13,.08,'#8f9a9c',20);
  for(const zz of [-.27,.25])cyl(r,[0,s*.5,zz],z,0,.03,.06,steel,12);
};
const knuckles=study('g500-front-knuckles','Front steering knuckles and steering arms','Each front wheel turns on a knuckle that swivels on kingpins at the end of the axle. A steering arm on each knuckle takes the tie rod.',frontBrakePlate,[
  part('knuckle-left','Steering knuckle, left · 460-337-13-06','The driver-side knuckle housing. It carries the wheel bearings, brake caliper and kingpin caps.',[0,-.3,0],r=>knuckle(r,-1)),
  part('knuckle-right','Steering knuckle, right · 460-337-14-06','The passenger-side knuckle housing.',[0,.3,0],r=>knuckle(r,1)),
  sourced(linkagePlate,part('arm-left','Steering arm, left · 461-330-00-46','The arm bolted to the left knuckle that the tie rod and drag link act on.',[-.35,-.25,.3],r=>{block(r,[-.2,-.5,.2],[.3,.08,.04],steel);sleeve(r,[-.35,-.5,.2],z,-.03,.03,.04,.018,steel,12);})),
  sourced(linkagePlate,part('arm-right','Steering arm, right · 463-330-03-46','The arm bolted to the right knuckle that the tie rod acts on.',[-.35,.25,.3],r=>{block(r,[-.2,.5,.2],[.3,.08,.04],steel);sleeve(r,[-.35,.5,.2],z,-.03,.03,.04,.018,steel,12);})),
  sourced(earlyFrontSuspensionPlate,part('king-pin','King pin ball joints · 460-332-02-06','The ball-joint king pins the knuckle swivels on, one pair per side. The 2002 plates list the same number as king pin and ball joint.',[.3,0,-.4],r=>{for(const s of [-1,1])for(const zz of [-.2,.18]){bead(r,[.08,s*.5,zz],.035,metal);cyl(r,[.08,s*.5,zz],z,zz<0?-.07:0,zz<0?0:.07,.014,metal,8);}})),
  sourced(earlyFrontBrakePlate,part('knuckle-seal','Knuckle seals · 463-337-01-19','The ring seal where each knuckle swivels around the axle-tube ball end.',[0,0,.45],r=>{for(const s of [-1,1])sleeve(r,[0,s*.33,0],y,-.015,.015,.17,.13,rubber,22);}))
]);
knuckles.viewAngle=[-.45,.3];

// Joints and clamps on the drag link and tie rod, and the damper bracket on the axle.
const balljoint=(r,c,dir)=>{
  turn(r,c,z,[[-.05,0],[-.05,.045],[.02,.05],[.04,.04],[.04,0]],steel,{n:14});
  tube(r,c,[c[0]+dir[0],c[1]+dir[1],c[2]+dir[2]],.02,steel);
  turn(r,[c[0],c[1],c[2]-.05],z,[[0,0],[0,.02],[-.07,.016],[-.07,0]],metal,{n:10});
};
const joints=study('g500-steering-joints','Steering linkage joints and damper bracket','The ball-joint ends on the drag link and tie rod, the clamps that set their length and the axle bracket for the steering damper.',linkagePlate,[
  part('drag-end-right','Drag link end, passenger side · 002-460-16-48','The ball-joint end of the drag link on the passenger side.',[.3,.3,.25],r=>balljoint(r,[.1,.45,0],[0,-.22,0])),
  part('drag-end-left','Drag link end, driver side · 002-460-19-48','The ball-joint end of the drag link on the driver side, at the pitman arm.',[.3,-.3,.25],r=>balljoint(r,[.1,-.45,0],[0,.22,0])),
  part('tie-rod-ends','Tie rod ends · 602-330-02-35','The ball-joint ends of the tie rod at the steering arms, driver and passenger side.',[-.3,0,.25],r=>{for(const s of [-1,1])balljoint(r,[-.25,s*.55,0],[0,-s*.22,0]);}),
  part('clamps','Tie rod adjuster clamps · 000-463-06-17','The split clamps that lock each threaded end once toe is set.',[-.3,0,-.15],r=>{for(const s of [-1,1])sleeve(r,[-.25,s*.25,0],y,-.03,.03,.032,.021,zinc,14);}),
  part('damper-bracket','Steering damper bracket · 460-463-13-40','The bracket on the axle that anchors the body of the steering damper.',[0,0,-.35],r=>{block(r,[.3,-.1,-.2],[.12,.1,.02],steel);block(r,[.3,-.06,-.14],[.12,.02,.12],steel);sleeve(r,[.3,-.04,-.1],y,0,.04,.025,.012,steel,10);}),
  sourced(earlyLinkagePlate,part('damper','Steering damper · 463-463-00-32','The hydraulic damper between the axle bracket and the tie rod. The 2002 plate notes it is replaced by 463-463-01-32-64.',[.35,0,-.1],r=>{cyl(r,[.3,0,-.1],y,0,.4,.032,dark,14);cyl(r,[.3,0,-.1],y,.4,.7,.011,metal,8);sleeve(r,[.3,.72,-.1],z,-.02,.02,.025,.012,steel,10);}))
]);
joints.viewAngle=[-.55,.4];

// Bearings and seals inside the steering box, around its sector shaft.
const boxSeals=study('g500-steering-box-seals','Steering box bearings and seals','The bearings and seal the linkage plate lists for the sector shaft, and the seal kit for the box.',linkagePlate,[
  part('bearings','Sector shaft bearings · 005-981-04-10','The needle bearings that carry the sector shaft in the steering-box casting.',[0,0,.3],r=>{for(const zz of [-.15,.1]){sleeve(r,[0,0,zz],z,0,.1,.1,.08,metal,18);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;cyl(r,[Math.cos(a)*.075,Math.sin(a)*.075,zz+.01],z,0,.08,.008,steel,6);}}}),
  part('seal','Sector shaft seal · 016-997-13-47','The radial seal where the sector shaft leaves the box for the pitman arm.',[0,0,-.35],r=>turn(r,[0,0,-.25],z,[[0,.06],[0,.12],[.04,.12],[.04,.1],[.015,.07],[.015,.06],[0,.06]],rubber,{n:22})),
  part('seal-kit','Steering gear seal kit · 310-460-01-61','The kit of O-rings and seals for the steering box, listed for 2002–2006.',[.4,0,0],r=>{for(const [rad,zz] of [[.16,.3],[.13,.36],[.1,.42]])sleeve(r,[.35,0,zz],z,0,.015,rad,rad-.018,'#4d3b33',22);})
]);
boxSeals.viewAngle=[-.5,.35];

// Mounting parts of the steering column under the dash and at the firewall.
const column=study('g500-column-mounting','Steering column mounting','The stay, clamp and lower bracket that hold the column jacket, the lock ring on the column, and the boot where the shaft passes through the firewall.',columnPlate,[
  part('stay','Steering column stay · 203-460-01-22','A strut from the column to the dash structure.',[0,-.3,.3],r=>tube(r,[-.2,-.1,.15],[.3,-.35,.45],.02,steel)),
  part('clamp','Steering column clamp · 463-460-00-58','The clamp that holds the column jacket.',[0,.3,.3],r=>{sleeve(r,[0,0,0],x,-.05,.05,.09,.07,steel,18);block(r,[0,.0,.1],[.1,.04,.04],steel);}),
  part('lower-bracket','Steering column lower bracket · 463-460-08-35','The bracket at the lower end of the column.',[.35,0,-.3],r=>{block(r,[.45,0,-.12],[.04,.24,.18],steel);block(r,[.5,0,-.2],[.1,.24,.02],steel);}),
  part('boot','Steering column lower boot · 463-462-00-96','The rubber boot that seals the firewall opening around the lower steering shaft.',[.7,0,-.2],r=>turn(r,[.65,0,-.25],x,[[0,.1],[0,.12],[.03,.12],[.05,.09],[.08,.1],[.1,.07],[.13,.075],[.15,.05],[.15,.04]],rubber,{n:20})),
  part('lock-ring','Column lock ring · 220-460-02-73','A retaining ring on the column.',[-.4,0,0],r=>sleeve(r,[-.3,0,0],x,0,.012,.07,.055,metal,18))
]);
column.viewAngle=[-.6,.3];

// Front brake hardware around the caliper.
const frontBrake=study('g500-front-brake-hardware','Front brake hardware','The pad wear sensor, hose brackets, rotor screw and caliper pin and spring that the G500 front-brake plates list around the caliper.',frontBrakePlate,[
  part('wear-sensor','Front pad wear sensor · 202-540-07-17','A contact clipped into the pad backing. It closes a warning circuit when the lining is worn down.',[0,-.35,.35],r=>{block(r,[0,-.1,.25],[.04,.03,.05],dark);path(r,[[0,-.1,.28],[0,-.2,.4],[.1,-.3,.45]],.007,dark,6);}),
  part('hose-bracket-left','Front brake hose bracket, left · 463-420-00-86','The bracket on the left knuckle that holds the end of the flexible hose.',[-.35,-.3,.1],r=>{block(r,[-.3,-.25,.2],[.08,.02,.1],zinc);block(r,[-.3,-.21,.25],[.08,.06,.015],zinc);}),
  part('hose-bracket-right','Front brake hose bracket, right · 463-420-01-86','The matching bracket on the right knuckle.',[-.35,.3,.1],r=>{block(r,[-.3,.25,.2],[.08,.02,.1],zinc);block(r,[-.3,.21,.25],[.08,.06,.015],zinc);}),
  sourced(lateFrontBrakePlate,part('guide-pin','Caliper guide pin · WA-463-991-00-60-64','The pin the 2006–2008 front caliper slides on.',[.35,0,.35],r=>{cyl(r,[.2,0,.2],x,0,.18,.014,metal,10);cyl(r,[.2,0,.2],x,-.02,0,.024,metal,6);})),
  sourced(lateFrontBrakePlate,part('pad-spring','Caliper pad spring · WA-463-421-00-91-64','The spring that keeps the pads from rattling in the 2006–2008 front caliper.',[.35,0,-.1],r=>{path(r,[[.12,-.12,.05],[.2,-.08,.1],[.28,0,.11],[.36,.08,.1],[.44,.12,.05]],.008,'#c9cfd1',6);})),
  sourced(lateFrontBrakePlate,part('rotor-screw','Rotor retaining screw · 001-990-09-14','The countersunk screw that holds the rotor on the hub while the wheel is off. The 2008 plates list it front and rear.',[0,.35,-.3],r=>turn(r,[0,.1,-.15],y,[[0,0],[0,.035],[.02,.012],[.07,.012],[.07,0]],metal,{n:14})))
]);
frontBrake.viewAngle=[-.55,.35];

// Rear hoses, wear sensor and caliper support.
const rearBrake=study('g500-rear-brake-hardware','Rear brake hoses and hardware','The flexible hoses from the frame to the rear axle and calipers, the rear pad wear sensor and the 2006–2008 caliper support.',rearBrakePlate,[
  part('frame-hose','Frame-mounted rear brake hose · 463-428-06-35-64','The flexible hose from the frame line to the rear axle, which lets the axle move.',[0,0,.4],r=>flexHose(r,[[0,0,.45],[.03,0,.3],[0,0,.15]],.026)),
  part('axle-hose','Rear brake hose at the wheel · 000-428-93-35-65','The short flexible hose at the rear wheel, from the axle line to the caliper.',[.3,-.3,.15],r=>flexHose(r,[[.25,-.25,.1],[.35,-.35,.05],[.45,-.4,-.05]])),
  part('caliper-hose-left','Rear caliper hose, left · 123-420-50-28-64','The flexible hose on the left rear caliper, listed for 2004–2005.',[-.35,-.35,0],r=>flexHose(r,[[-.25,-.25,.05],[-.35,-.35,0],[-.45,-.42,-.08]])),
  part('caliper-hose-right','Rear caliper hose, right · 123-420-65-28-64','The flexible hose on the right rear caliper, listed for 2004–2005.',[-.35,.35,0],r=>flexHose(r,[[-.25,.25,.05],[-.35,.35,0],[-.45,.42,-.08]])),
  part('wear-sensor','Rear pad wear sensor · 901-540-01-17','The wear contact in the rear pad backing.',[.3,.35,.3],r=>{block(r,[.25,.2,.2],[.04,.03,.05],dark);path(r,[[.25,.2,.23],[.3,.3,.32],[.4,.35,.35]],.007,dark,6);}),
  sourced(lateRearBrakePlate,part('caliper-support','Rear caliper support · 000-421-17-06','The anchor bracket that carries the 2006–2008 rear caliper on the axle.',[0,0,-.4],r=>{block(r,[0,0,-.2],[.3,.05,.06],paint);for(const s of [-1,1])block(r,[s*.13,0,-.1],[.05,.05,.16],paint);})),
  sourced(lateBrakePartsPlate,part('late-caliper-hose','Rear caliper hose, 2006–2008 · 123-420-55-28-64','The flexible caliper hose the 2008 plate lists for both rear wheels. Its listing gives 2006–2008 G500 fitment.',[-.6,0,-.2],r=>{for(const s of [-1,1])flexHose(r,[[-.25,s*.12,-.05],[-.38,s*.16,-.1],[-.5,s*.2,-.18]]);}))
]);
rearBrake.viewAngle=[-.55,.35];

// The hand lever and the two rear cables it pulls.
const parking=study('g500-parking-brake-control','Parking brake lever and cables','The hand lever between the front seats and the two cables that run to the rear brakes.',parkingPlate,[
  part('lever','Parking brake lever · 463-420-06-84-9045','The ratchet lever assembly between the front seats.',[-.3,0,.35],r=>{block(r,[-.55,0,-.02],[.3,.1,.04],paint);tube(r,[-.65,0,0],[-.25,0,.25],.03,dark,12);sleeve(r,[-.62,0,0],y,-.06,.06,.05,.02,steel,12);}),
  part('cable-right','Parking brake cable, right · 463-420-50-85-64','The cable from the equalizer to the right rear brake.',[.2,.3,0],r=>path(r,[[-.35,.05,-.05],[0,.15,-.1],[.4,.35,-.1],[.75,.45,-.05]],.012,rubber)),
  part('cable-left','Parking brake cable, left · 463-420-51-85-64','The cable from the equalizer to the left rear brake.',[.2,-.3,0],r=>path(r,[[-.35,-.05,-.05],[0,-.15,-.1],[.4,-.35,-.1],[.75,-.45,-.05]],.012,rubber))
]);
parking.viewAngle=[-.6,.4];

// The two low-pressure steering hoses.
const returnHoses=study('g500-steering-return-hoses','Steering return and reservoir hoses','The two low-pressure hoses of the power-steering circuit.',pumpPlate,[
  part('return','Steering return hose · 463-466-02-81','The low-pressure hose the pump-and-hose plate lists as the return hose.',[0,-.3,.2],r=>path(r,[[-.4,-.1,-.2],[-.1,-.15,.0],[.2,-.12,.15],[.45,-.05,.3]],.025,hose,10)),
  part('reservoir','Steering reservoir hose · 463-466-01-81','The hose the plate lists at the remote reservoir.',[0,.3,.2],r=>path(r,[[.45,.05,.3],[.3,.15,.1],[0,.12,-.05],[-.3,.08,-.1]],.028,hose,10))
]);
returnHoses.viewAngle=[-.5,.3];

// ---- Round 2 ----

// The column and the jointed lower shaft that carries steering input down to the box.
// The column runs from the wheel (upper left) down toward the firewall; the shaft continues to the box.
const ujoint=(r,c)=>{sleeve(r,c,[1,0,-.66],-.03,.03,.03,.016,steel,12);block(r,c,[.02,.09,.02],metal);block(r,c,[.02,.02,.09],metal);};
const shaft=study('g500-steering-shaft','Steering column and lower shaft','The column assembly under the dash, its bracket, and the lower shaft with two universal joints that runs through the firewall to the steering box.',earlyColumnPlate,[
  part('lower-shaft','Lower steering shaft · 463-460-13-09','The jointed shaft from the bottom of the column, through the firewall boot, to the steering-box input. One number covers 2002–2008.',[.3,0,-.3],r=>{tube(r,[.12,0,-.08],[.68,0,-.45],.018,steel,10);for(const c of [[.12,0,-.08],[.68,0,-.45]])ujoint(r,c);}),
  part('column','Steering column, 2002 listing · 463-460-32-16','The column assembly the 2002 plates list for the G500: the jacket with the upper shaft and its bearings.',[-.25,0,.3],r=>{tube(r,[-.75,0,.5],[0,0,0],.055,dark,16);tube(r,[-.85,0,.57],[-.75,0,.5],.02,metal,10);}),
  sourced(midColumnPlate,part('column-late','Steering column, 2006 listing · 463-460-33-16','The column assembly number the 2006 plate lists for the G500 in the same position.',[-.25,.45,.3],r=>{tube(r,[-.75,.35,.5],[0,.35,0],.05,'#4b5a60',14);})),
  sourced(earlyColumnAssemblyPlate,part('bracket','Steering column bracket · 463-460-04-35','The bracket that carries the column jacket on the dash structure.',[-.2,-.35,.35],r=>{block(r,[-.38,0,.32],[.16,.2,.025],steel);for(const s of [-1,1])block(r,[-.38,s*.1,.27],[.16,.02,.1],steel);}))
]);
shaft.viewAngle=[-.5,.3];

// The steering gear with its sector shaft and Pitman arm, and the two rods across the axle.
const gearSet=study('g500-steering-gear-set','Steering gear, sector shaft and rods','The recirculating-ball gear on the frame, the sector shaft that leaves it, the Pitman arm on that shaft, and the rods the 2002 plate lists across the front axle.',earlyLinkagePlate,[
  part('gear','Steering gear · 463-460-69-00','The complete recirculating-ball steering gear the plate lists for the G500, bolted to the left frame rail.',[.35,0,.35],r=>{block(r,[.1,-.35,.15],[.3,.22,.24],'#56666b');cyl(r,[-.05,-.35,.18],x,-.2,0,.03,metal,12);}),
  part('sector','Sector shaft · 461-460-03-11','The output shaft inside the gear. Its toothed sector meshes with the ball nut and its splined end carries the Pitman arm.',[.55,0,0],r=>{cyl(r,[.15,-.35,.1],z,-.28,.05,.035,metal,14);turn(r,[.15,-.35,.12],z,[[-.05,0],[-.05,.1],[.05,.1],[.05,0]],steel,{n:6,start:-.6,sweep:1.2});}),
  part('pitman','Pitman arm · 461-463-01-01','The arm on the sector shaft that swings the drag link. The G500 listing also calls it the idler arm and notes it replaces 460-463-02-01.',[.55,-.2,-.35],r=>{tube(r,[.15,-.35,-.2],[.15,-.05,-.32],.03,steel,12);sleeve(r,[.15,-.35,-.2],z,-.04,.04,.055,.035,steel,14);sleeve(r,[.15,-.05,-.32],z,-.03,.03,.04,.016,steel,12);}),
  part('tie-rod','Tie rod assembly · 463-463-11-15','The long rod between the two steering arms. The plates list the number as the tie rod assembly and as the drag link.',[-.35,0,-.3],r=>{tube(r,[-.4,-.7,-.3],[-.4,.7,-.3],.022,steel,12);for(const s of [-1,1])sleeve(r,[-.4,s*.7,-.3],z,-.03,.03,.04,.018,steel,12);}),
  part('center-link','Center link · 463-330-07-03','The rod the plates list as the center link and outer tie rod, from the Pitman arm across to the right steering arm.',[-.1,.35,-.45],r=>{tube(r,[.15,-.05,-.36],[-.2,.65,-.36],.02,'#6d8087',12);sleeve(r,[-.2,.65,-.36],z,-.03,.03,.038,.018,steel,12);})
]);
gearSet.viewAngle=[-.55,.4];

// The pump on the engine, the remote reservoir, the high-pressure hose to the box and the cooler loop.
const pumpBody=(r,c,color)=>{cyl(r,c,y,-.1,.1,.1,color,18);turn(r,[c[0],c[1]-.1,c[2]],y,[[0,0],[0,.13],[-.02,.13],[-.04,.11],[-.04,0]],metal,{n:20});};
const supply=study('g500-steering-supply','Power-steering pump, reservoir, pressure hose and cooler','The pressure side of the power-steering circuit: the belt-driven pump, the reservoir that feeds it, the high-pressure hose to the steering gear and the oil cooler in front of the radiator.',earlyPumpPlate,[
  sourced(pumpListing,part('pump-early','Power-steering pump, 2002–2003 · 463-466-04-01-80','The remanufactured pump number the G500 pump listing gives for 2002–2003.',[-.3,-.35,.2],r=>pumpBody(r,[-.45,-.3,.1],'#5c6a70'))),
  part('pump','Power-steering pump · 003-466-54-01-80','The remanufactured pump the 2002 plate lists; the listing gives 2002–2008 fitment and notes it is replaced by 003-466-54-01.',[-.3,.35,.2],r=>pumpBody(r,[-.45,.3,.1],'#4f5d63')),
  part('reservoir','Power-steering reservoir · 000-460-01-83','The fluid reservoir that feeds the pump and takes the return flow.',[0,0,.45],r=>{cyl(r,[.15,0,.3],z,0,.18,.08,'#2e3436',16);cyl(r,[.15,0,.48],z,0,.03,.05,dark,12);}),
  sourced(steeringHoseListing,part('pressure-early','Pressure hose, 2002–2003 · 463-997-23-82','The high-pressure hose from the pump to the steering gear, listed for 2002–2003.',[.2,-.3,-.3],r=>path(r,[[-.45,-.3,0],[-.2,-.35,-.25],[.25,-.3,-.4],[.65,-.2,-.35]],.022,hose,10))),
  sourced(steeringHoseListing,part('pressure','Pressure hose, 2004–2008 · 463-997-38-82','The high-pressure hose number the listing gives for 2004–2008.',[.2,.3,-.3],r=>path(r,[[-.45,.3,0],[-.2,.35,-.25],[.25,.3,-.4],[.65,.2,-.35]],.022,'#3a3f41',10))),
  part('cooler','Power-steering cooler · 463-460-12-24','The finned loop of tube in front of the radiator that cools the steering oil.',[.4,0,.3],r=>{const pts=[];for(let i=0;i<6;i++){pts.push([.8,-.3+i*.12,.35],[.8,-.3+i*.12+.06,-.05]);}path(r,pts,.012,metal,6);})
]);
supply.viewAngle=[-.5,.3];

// One front wheel end, with its hub, seal and installation kit, the wheel bolts and the valve.
const hubShape=(r,c,scale,color)=>turn(r,c,y,[[0,.06*scale],[0,.3*scale],[.04*scale,.3*scale],[.04*scale,.13*scale],[.26*scale,.12*scale],[.26*scale,.06*scale],[0,.06*scale]],color,{n:24});
const wheelEnd=study('g500-wheel-end','Front hub, wheel bolts and valve','The front wheel hub with its seal and installation kit, the bolts that hold the wheel to it and the tyre valve.',earlyFrontSuspensionPlate,[
  part('hub','Front hub · 463-330-01-25','The front wheel hub the 2002 plates list for both sides. It turns on the two tapered bearings and carries the rotor and wheel.',[0,-.3,0],r=>hubShape(r,[0,0,0],1,'#8f9a9c')),
  sourced(midFrontSuspensionPlate,part('hub-late','Front hub, 2006 listing · 463-330-04-25','The front hub number the 2006 front suspension plate lists in the same position.',[-.7,-.3,.3],r=>hubShape(r,[-.55,0,.45],.55,'#7f8a8c'))),
  part('seal','Front hub seal · 015-997-79-47','The radial seal at the inboard end of the hub, against the knuckle spindle.',[0,.45,-.3],r=>sleeve(r,[0,.27,0],y,0,.02,.12,.07,rubber,22)),
  part('kit','Front hub installation kit · 463-331-00-44','The kit the plate lists with the hub and bearings for fitting the hub to the spindle.',[0,.6,0],r=>{sleeve(r,[0,.3,0],y,0,.03,.07,.035,metal,6);sleeve(r,[0,.34,0],y,0,.006,.075,.035,steel,18);}),
  sourced(earlyWheelPlate,part('wheel-bolts','Wheel bolts · 000-990-53-07','The bolts the 2002 wheel plate lists for fastening the wheel to the hub, five per wheel.',[0,-.65,0],r=>{for(let i=0;i<5;i++){const a=i/5*Math.PI*2,c=[Math.cos(a)*.22,-.02,Math.sin(a)*.22];cyl(r,c,y,0,.12,.013,metal,8);hex(r,c,[0,-1,0],.025,.025);}})),
  sourced(earlyWheelPlate,part('valve','Tyre valve · 000-400-02-13','The valve stem the wheel plate lists, through the rim near its outer edge.',[.4,-.4,.4],r=>{cyl(r,[.0,-.1,.55],[0,-.5,.85],0,.06,.012,rubber,8);cyl(r,[.0,-.1,.55],[0,-.5,.85],.06,.09,.009,metal,8);}))
]);
wheelEnd.viewAngle=[-.4,.35];

// The carrier on the cargo door that holds the spare wheel, with its mounting pieces.
const spare=study('g500-spare-carrier','Spare-wheel carrier','The carrier plate on the side-hinged cargo door that the spare wheel bolts to, with the grommets, spacers and nuts that mount it and the stop on the trim ring.',spareCarrierPlate,[
  part('carrier','Spare carrier · 463-890-13-44-64','The pressed carrier plate on the outside of the cargo door, with the studs for the spare wheel.',[-.3,0,0],r=>{block(r,[0,0,0],[.04,.55,.45],paint);block(r,[-.05,0,0],[.08,.25,.25],paint);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;cyl(r,[-.09,Math.cos(a)*.08,Math.sin(a)*.08],x,-.12,0,.009,metal,8);}}),
  part('grommets','Spare carrier grommets · 460-997-14-81','The rubber grommets where the carrier mounting bolts pass through the door skin.',[.45,0,0],r=>{for(const [yy,zz] of [[-.2,-.16],[.2,-.16],[-.2,.16],[.2,.16]])sleeve(r,[.04,yy,zz],x,0,.025,.035,.014,rubber,14);}),
  sourced(spacerPage,part('spacers','Spare carrier spacers · 463-991-28-40','The spacer tubes between carrier and door that keep the clamp load off the door skin. The listing gives 2004–2008 G500 fitment.',[.25,0,-.4],r=>{for(const [yy,zz] of [[-.2,-.16],[.2,-.16],[-.2,.16],[.2,.16]])sleeve(r,[.06,yy,zz],x,0,.1,.018,.011,metal,12);})),
  part('nuts','Spare carrier nuts · 460-990-50-50','The nuts the carrier diagram lists for the carrier mounting, inside the door.',[.65,0,.3],r=>{for(const [yy,zz] of [[-.2,-.16],[.2,-.16],[-.2,.16],[.2,.16]])hex(r,[.17,yy,zz],x,.025,.026);}),
  part('trim-stop','Trim ring stop · 463-898-00-33','The stop the carrier diagram lists on the spare-wheel trim ring.',[-.3,0,.5],r=>{block(r,[-.12,0,.3],[.06,.1,.04],dark);block(r,[-.12,0,.34],[.03,.05,.03],dark);})
]);
spare.viewAngle=[-.9,.25];

// A rear backing plate with the drum-in-hat parking shoes it carries.
const backing=(r,s,color,rad=.32)=>{turn(r,[0,s*.4,0],y,[[0,.05],[0,rad],[-.015,rad],[-.015,.05]],color,{n:24});};
const parkingShoes=study('g500-rear-parking-shoes','Rear backing plates and parking-brake shoes','The backing plates behind the rear discs and the shoes inside the disc hats that the parking brake spreads.',midRearBrakePlate,[
  part('plate-left','Rear backing plate, left · 463-420-01-44','The left rear backing plate the 2006 rear-brake plate lists, which carries the parking-brake shoes.',[0,-.3,0],r=>backing(r,-1,'#4f5a5e')),
  part('plate-right','Rear backing plate, right · 463-420-02-44','The right rear backing plate the 2006 rear-brake plate lists.',[0,.3,0],r=>backing(r,1,'#4f5a5e')),
  part('plates-early','Rear backing plates, earlier numbers · 461-423-01-20, 461-423-02-20','A left and a right backing plate number the 2006 rear-brake page also lists for the G500 and G55 AMG, without a reference number.',[0,0,-.55],r=>{for(const s of [-1,1])turn(r,[0,s*.6,0],y,[[0,.05],[0,.24],[-.01,.24],[-.01,.05]],'#5f6b6f',{n:20});}),
  sourced(earlyParkingPlate,part('shoes','Parking-brake shoes · 003-420-34-20','The shoe set inside the rear disc hats that the parking-brake cables spread. The 2002 parking-brake plate lists it for the G500.',[.35,0,.35],r=>{for(const s of [-1,1])for(const a of [.25,Math.PI+.25])turn(r,[0,s*.4,0],y,[[.02,.17],[.02,.2],[.06,.2],[.06,.17],[.02,.17]],'#7a6a58',{n:8,start:a,sweep:2.6});}))
]);
parkingShoes.viewAngle=[-.6,.35];

// Front hoses and the spring that seats a hose in its bracket.
const frontHoses=study('g500-front-brake-hoses','Front brake hoses','The flexible hoses that feed the front calipers and the spring that holds a hose end in its bracket.',earlyFrontBrakePlate,[
  part('caliper-hose','Front caliper hose · 461-420-09-48-64','The flexible hose the 2002 front-brake plate lists for both front calipers, from the knuckle bracket to the caliper.',[-.3,0,.3],r=>{for(const s of [-1,1])flexHose(r,[[-.2,s*.45,.25],[-.3,s*.5,.1],[-.25,s*.55,-.05]]);}),
  sourced(ecsLinesPage,part('axle-hose','Front axle brake hose · 460-428-51-35-64','A genuine front hose ECS Tuning lists for the 2003 G500 as fitting the front axle, left and right, two per vehicle.',[.3,0,.3],r=>{for(const s of [-1,1])flexHose(r,[[.25,s*.25,.4],[.3,s*.3,.2],[.25,s*.35,0]],.024);})),
  sourced(ecsLinesPage,part('retaining-spring','Brake line retaining spring · 000-428-06-73','The spring clip ECS Tuning lists for the 2003 G500, between the steel line and the hose, that holds the hose end in its bracket.',[0,0,-.4],r=>{for(const s of [-1,1]){sleeve(r,[.25,s*.25,.42],z,0,.012,.035,.024,metal,14);block(r,[.25,s*.25+s*.035,.426],[.03,.03,.012],metal);}}))
]);
frontHoses.viewAngle=[-.55,.35];

// Discs, calipers and pads at all four wheels. Front axle on the left (x < 0), rear on the right.
const disc=(r,c,rad,color)=>turn(r,c,y,[[0,.08],[0,rad],[.03,rad],[.03,.08],[0,.08]],color,{n:28});
const caliperBody=(r,c,color)=>{block(r,c,[.16,.1,.1],color);};
const friction=study('g500-brake-friction','Brake discs, calipers and pads','The discs, calipers and pads at the four wheels, with the front pair on the left of the view and the rear pair on the right.',earlyFrontBrakePlate,[
  part('front-disc','Front brake discs · 463-421-00-12','The front disc the 2002 plates list for both sides.',[-.3,0,-.4],r=>{for(const s of [-1,1])disc(r,[-.5,s*.45,0],.25,'#8f9698');}),
  sourced(earlyBrakePartsPlate,part('rear-disc','Rear brake discs · 902-423-07-12-07','The rear disc with the parking-brake drum in its hat. The 2002 brake components plate lists it for both sides; the 2006 rear-brake page lists 902-423-06-12-07.',[.3,0,-.4],r=>{for(const s of [-1,1]){disc(r,[.5,s*.45,0],.23,'#8f9698');sleeve(r,[.5,s*.45,0],y,-.07,0,.13,.11,'#8f9698',20);}})),
  sourced(caliperListing,part('front-caliper-left','Front caliper, left · 004-420-69-83','The driver-side front caliper. The G500 caliper listing gives 2002–2008 fitment and says it replaces 463-420-09-01.',[-.35,-.35,.35],r=>caliperBody(r,[-.5,-.45,.22],'#a3412f'))),
  sourced(caliperListing,part('front-caliper-right','Front caliper, right · 004-420-70-83','The passenger-side front caliper; it replaces 463-420-08-01 and 463-420-08-02.',[-.35,.35,.35],r=>caliperBody(r,[-.5,.45,.22],'#a3412f'))),
  sourced(midRearBrakePlate,part('rear-caliper-left','Rear caliper, left · 001-420-01-01','The driver-side rear caliper the 2006 rear-brake page lists for the G500, replaced by 000-420-09-79-64.',[.35,-.35,.35],r=>caliperBody(r,[.5,-.45,.2],'#8c3b2d'))),
  sourced(midRearBrakePlate,part('rear-caliper-right','Rear caliper, right · 001-420-02-01','The passenger-side rear caliper, replaced by 000-420-10-79.',[.35,.35,.35],r=>caliperBody(r,[.5,.45,.2],'#8c3b2d'))),
  part('front-pads','Front brake pads · 900-420-02-00','The front pad set, an inboard and outboard pad at each front disc.',[-.6,0,0],r=>{for(const s of [-1,1])for(const d of [-.03,.06])block(r,[-.5,s*.45+d,.2],[.12,.015,.06],'#3b3b38');}),
  sourced(lateBrakePartsPlate,part('rear-pads','Rear brake pads · 003-420-24-20','The rear pad set the 2008 plate lists for the G500 and G55 AMG, replaced by 008-420-44-20.',[.6,0,0],r=>{for(const s of [-1,1])for(const d of [-.03,.06])block(r,[.5,s*.45+d,.18],[.11,.015,.055],'#3b3b38');}))
]);
friction.viewAngle=[-.55,.35];

// The arms and rods that locate both axles under the frame.
// Front axle at x = -.85, rear axle at x = .85; the frame ends of the arms point toward the middle.
const eye=(r,c,color,outer=.045,inner=.02)=>sleeve(r,c,y,-.04,.04,outer,inner,color,14);
const locating=study('g500-axle-locating-arms','Radius arms, trailing arms and track bars','The longitudinal arms and lateral rods that locate the two rigid axles, with the bushings, insulators and washers listed with them.',earlyFrontSuspensionPlate,[
  part('radius-arm','Front radius arms · 460-330-01-11','The forged arm on each side from two eyes on the front axle back to a frame bracket.',[-.25,0,.35],r=>{for(const s of [-1,1]){tube(r,[-.85,s*.4,.1],[-.25,s*.4,0],.03,dark,12);tube(r,[-.85,s*.4,-.1],[-.25,s*.4,0],.03,dark,12);cyl(r,[-.25,s*.4,0],x,0,.14,.015,metal,8);}}),
  part('radius-front-bushing','Radius arm axle bushings · 460-333-03-14','The bushings in the axle-end eyes of the front radius arms.',[-.6,0,-.3],r=>{for(const s of [-1,1])for(const zz of [.1,-.1])eye(r,[-.85,s*.4,zz],rubber);}),
  part('arm-insulator','Arm frame insulators · 460-352-04-65-65','The rubber insulators each side of the frame bracket at the frame end of the arms. The plates list the same number for the front radius arms and the front of the rear trailing arms.',[0,0,-.35],r=>{for(const s of [-1,1]){for(const xx of [-.21,-.13])sleeve(r,[xx,s*.4,0],x,-.02,.02,.06,.016,rubber,16);for(const xx of [.21,.13])sleeve(r,[xx,s*.4,0],x,-.02,.02,.06,.016,rubber,16);}}),
  sourced(midFrontSuspensionPlate,part('washer-front','Radius arm washers, front · 460-352-02-76','The large washers the 2006 plate lists ahead of the radius-arm insulators.',[-.1,0,.55],r=>{for(const s of [-1,1])sleeve(r,[-.24,s*.4,0],x,-.005,.005,.065,.016,steel,18);})),
  sourced(midFrontSuspensionPlate,part('washer-rear','Radius arm washers, rear · 460-352-04-76','The washers the 2006 plate lists behind the radius-arm insulators.',[.1,0,.55],r=>{for(const s of [-1,1])sleeve(r,[-.1,s*.4,0],x,-.005,.005,.065,.016,steel,18);})),
  part('front-lateral-link','Front lateral link · 463-330-07-07','The Panhard rod across the front axle, from the axle to the frame.',[-.4,0,.6],r=>{tube(r,[-.85,-.5,.2],[-.85,.5,.25],.025,dark,12);for(const s of [-1,1])eye(r,[-.85,s*.5,.2+(s+1)*.025],steel,.05,.03);}),
  part('link-bushings','Lateral link bushings · 460-352-05-65','The bushings in the eyes of the front lateral link and the rear track bar.',[0,.6,0],r=>{for(const xx of [-.85,.85])for(const s of [-1,1])eye(r,[xx,s*.5,.2+(s+1)*.025],rubber,.03,.015);}),
  sourced(earlyRearSuspensionPlate,part('trailing-arm','Rear trailing arms · 461-350-00-06','The arm on each side from the rear axle forward to a frame bracket.',[.25,0,.35],r=>{for(const s of [-1,1]){tube(r,[.85,s*.4,.1],[.25,s*.4,0],.03,dark,12);tube(r,[.85,s*.4,-.1],[.25,s*.4,0],.03,dark,12);cyl(r,[.25,s*.4,0],x,-.14,0,.015,metal,8);}})),
  sourced(earlyRearSuspensionPlate,part('trailing-bushing','Trailing arm axle bushings · 460-352-06-65','The bushings at the axle end of the rear trailing arms.',[.6,0,-.3],r=>{for(const s of [-1,1])for(const zz of [.1,-.1])eye(r,[.85,s*.4,zz],rubber);})),
  sourced(earlyRearSuspensionPlate,part('rear-track-bar','Rear track bar · 461-350-03-06','The Panhard rod across the rear axle. The plates note it is replaced by 464-350-23-00.',[.4,0,.6],r=>{tube(r,[.85,-.5,.2],[.85,.5,.25],.025,dark,12);for(const s of [-1,1])eye(r,[.85,s*.5,.2+(s+1)*.025],steel,.05,.03);}))
]);
locating.viewAngle=[-.6,.5];

export const studies=[frame,mounts,springs,stabilizer,knuckles,joints,boxSeals,column,frontBrake,rearBrake,parking,returnHoses,
  shaft,gearSet,supply,wheelEnd,spare,parkingShoes,frontHoses,friction,locating];
export const views=new Map([
  ['suspension.frame',frame],
  ['chassis.body-mounts',mounts],
  ['suspension.spring',springs],
  ['suspension.damper',springs],
  ['steering.axle',stabilizer],
  ['chassis.front-swivels',knuckles],
  ['chassis.steering-damper',joints],
  ['g500-ball-steering.case',boxSeals],
  ['column-adjustment.jacket',column],
  ['g500-front-brake.caliper',frontBrake],
  ['g500-rear-brake.caliper',rearBrake],
  ['chassis.parking-cables',parking],
  ['steering-assist.return-lines',returnHoses],
  ['chassis.bump-stops',springs],
  ['steering-assist.shaft',shaft],
  ['column-adjustment.shaft',shaft],
  ['column-adjustment.bracket',shaft],
  ['g500-ball-steering.sector',gearSet],
  ['g500-ball-steering.arm',gearSet],
  ['steering-assist.pump',supply],
  ['steering-assist.reservoir',supply],
  ['steering-assist.pressure-line',supply],
  ['steering-assist.cooler',supply],
  ['wheels.hub',wheelEnd],
  ['wheels.rim',wheelEnd],
  ['chassis.front-hub-ends',wheelEnd],
  ['closure-g500.carrier',spare],
  ['g500-rear-brake.backplate',parkingShoes],
  ['g500-rear-brake.shoe-a',parkingShoes],
  ['g500-rear-brake.shoe-b',parkingShoes],
  ['g500-front-brake.hose',frontHoses],
  ['wheels.disc',friction],
  ['wheels.caliper',friction],
  ['g500-front-brake.rotor',friction],
  ['g500-rear-brake.rotor',friction],
  ['g500-front-brake.inner-pad',friction],
  ['g500-front-brake.outer-pad',friction],
  ['g500-rear-brake.inner-pad',friction],
  ['g500-rear-brake.outer-pad',friction],
  ['g500-front-arm.arm',locating],
  ['g500-front-panhard.bar',locating],
  ['g500-rear-arm.arm',locating],
  ['g500-rear-panhard.bar',locating]
]);

const vin='Confirm the number against the vehicle identification number; the catalog lists year and option variants.';
export const claims=[
  claim(idsFrom(frame,framePlate),'The 2004 G500 frame plate lists these brackets and supports under Frame & Brackets and Body Mounts, with their sides.','Measure each bracket’s station along the rail and its bolt pattern. '+vin,framePlate),
  claim(idsFrom(mounts,framePlate),'The 2004 G500 frame plate lists the upper and lower insulators, insulator plates and spacer tubes for body mounts No. 1 and No. 3.','Measure rubber heights, outer diameters and spacer lengths, and find the parts for mount No. 2. '+vin,framePlate),
  claim(idsFrom(springs,stabilizerPlate),'The 2005 G500 front suspension plate lists the spring insulator with the front coil spring.','Measure the insulator section and confirm it sits at the lower seat. '+vin,stabilizerPlate),
  claim(idsFrom(springs,rearSuspensionPlate),'The 2005 G500 rear suspension plate lists the spring insulator for both rear coil springs.','Measure the seat and confirm whether it sits at the top or bottom of the coil. '+vin,rearSuspensionPlate),
  claim(idsFrom(springs,framePlate),'The 2004 G500 frame plate lists front and rear shock mounts on the frame, with left and right rear numbers.','Measure the mount heights and the damper eye bolt positions. '+vin,framePlate),
  claim(idsFrom(stabilizer,stabilizerPlate),'The 2005 G500 stabilizer plate lists the bar, bushings, bushing brackets, U-bolts, links and link bushings. The bushing listing gives 2002–2005 and 2006–2008 numbers.','Trace the bar shape, the bushing stations and where the links meet the axle. '+vin,stabilizerPlate),
  claim(idsFrom(knuckles,frontBrakePlate),'The 2004 G500 front-brake plate lists a left and a right steering knuckle.','Measure the kingpin spacing, bearing bores and caliper lug positions. '+vin,frontBrakePlate),
  claim(idsFrom(knuckles,linkagePlate),'The 2004 G500 steering gear and linkage plate lists a left and a right steering arm.','Measure arm length and the taper bore positions for the tie rod and drag link. '+vin,linkagePlate),
  claim(idsFrom(joints,linkagePlate),'The 2004 G500 steering gear and linkage plate lists the drag link ends, tie rod ends, adjuster clamps and the steering damper bracket.','Measure joint centers, thread lengths and the bracket offset on the axle. '+vin,linkagePlate),
  claim(idsFrom(boxSeals,linkagePlate),'The 2004 G500 steering gear and linkage plate lists the sector shaft bearings, the sector shaft seal and a seal kit for the steering gear.','Confirm the seal kit contents; the catalog also calls it a pump gasket set. '+vin,linkagePlate),
  claim(idsFrom(column,columnPlate),'The 2005 G500 steering column assembly plate lists the column stay, clamp, lower bracket, lower boot and lock ring.','Measure the column mounting points and the boot’s firewall flange. '+vin,columnPlate),
  claim(idsFrom(frontBrake,frontBrakePlate),'The 2004 G500 front-brake plate lists the front wear indicator and the left and right brake hose brackets.','Measure the bracket positions on the knuckles and the sensor lead routing. '+vin,frontBrakePlate),
  claim(idsFrom(frontBrake,lateFrontBrakePlate),'The 2008 G500 front-brake plate lists the guide pin, the pad spring and the rotor screw.','Confirm which caliper the pin and spring fit and when the change was made. '+vin,lateFrontBrakePlate),
  claim(idsFrom(rearBrake,rearBrakePlate),'The 2004 G500 rear-brake plate lists the left and right caliper hoses, the rear wear indicator, a flex hose at the wheel and a frame-mounted flex hose.','Trace the rear line from the frame to each caliper and measure hose lengths. '+vin,rearBrakePlate),
  claim(idsFrom(rearBrake,lateRearBrakePlate),'The 2008 G500 rear-brake plate lists the caliper support for both sides.','Confirm which caliper it carries and its bolt pattern on the axle. '+vin,lateRearBrakePlate),
  claim(idsFrom(parking,parkingPlate),'The 2004 G500 parking brake plate lists the parking brake control and a right and a left cable, noted for the G500.','Trace the cable route from the lever to each backing plate and find the equalizer number. '+vin,parkingPlate),
  claim(idsFrom(returnHoses,pumpPlate),'The 2004 G500 pump and hose plate lists a return hose and a reservoir hose beside the pump, reservoir, pressure hose and cooler.','Trace where each hose connects at the box, cooler, reservoir and pump. '+vin,pumpPlate),
  // Round 2.
  claim(idsFrom(springs,earlyFrontSuspensionPlate),'The 2002 G500 stabilizer bar and front suspension plate lists the front coil spring 463-321-03-04-62, the shock absorber WA-005-323-01-00 and the stopper 463-321-00-06-64, each noted for the G500.','Measure free length, wire and coil diameter, damper stroke and the stop height. '+vin,earlyFrontSuspensionPlate),
  claim(idsFrom(springs,midFrontSuspensionPlate),'The 2006 G500 front suspension components plate lists shock absorber 463-323-01-00 for the G500.','Confirm which years use this number in place of WA-005-323-01-00. '+vin,midFrontSuspensionPlate),
  claim(idsFrom(springs,earlyRearSuspensionPlate),'The 2002 G500 rear suspension components plate lists the rear coil spring 460-324-07-04-52, the shock absorber WA-004-326-01-00 and the stopper 460-320-02-44-64.','Measure the rear spring, damper stroke and the stop position on the frame or axle. '+vin,earlyRearSuspensionPlate),
  claim(idsFrom(knuckles,earlyFrontSuspensionPlate),'The 2002 G500 front suspension plate lists 460-332-02-06 as the king pin; the 2002 front-brake plate lists the same number as a ball joint.','Confirm the upper and lower pin positions and how many each knuckle uses. '+vin,earlyFrontSuspensionPlate),
  claim(idsFrom(knuckles,earlyFrontBrakePlate),'The 2002 G500 front-brake plate lists knuckle seal 463-337-01-19 for both sides.','Measure the seal diameter on the axle-tube ball end. '+vin,earlyFrontBrakePlate),
  claim(idsFrom(joints,earlyLinkagePlate),'The 2002 G500 steering gear and linkage plate lists steering damper 463-463-00-32 for the G500 and G55 AMG, replaced by 463-463-01-32-64.','Measure the damper’s length and stroke and its mounting eyes. '+vin,earlyLinkagePlate),
  claim(idsFrom(rearBrake,lateBrakePartsPlate),'The 2008 G500 brake components plate lists brake hose 123-420-55-28-64 for both sides; its part page gives 2006–2008 G500 fitment and says it replaces 123-420-55-28 and 126-420-65-28.','Confirm it is the caliper hose that follows 123-420-50-28-64 and 123-420-65-28-64 on the 2006–2008 axle. '+vin,lateBrakePartsPlate),
  claim(idsFrom(shaft,earlyColumnPlate),'The 2002 G500 steering column plate lists the steering column 463-460-32-16 and the lower shaft 463-460-13-09. The G500 steering shaft listing gives the lower shaft 2002–2008 fitment.','Measure the shaft length, joint angles and the column’s mounting points. '+vin,earlyColumnPlate),
  claim(idsFrom(shaft,midColumnPlate),'The 2006 G500 steering column plate lists the steering column 463-460-33-16 in the same position.','Find the year the column number changed. '+vin,midColumnPlate),
  claim(idsFrom(shaft,earlyColumnAssemblyPlate),'The 2002 G500 steering column assembly plate lists steering column bracket 463-460-04-35.','Measure the bracket and its bolt pattern on the dash structure. '+vin,earlyColumnAssemblyPlate),
  claim(idsFrom(gearSet,earlyLinkagePlate),'The 2002 G500 steering gear and linkage plate lists the steering gear 463-460-69-00, sector shaft 461-460-03-11, Pitman arm 461-463-01-01, tie rod assembly 463-463-11-15 and center link 463-330-07-03. It gives the last two more than one name.','Confirm which rod is the tie rod and which the drag link on the G500, and measure their lengths. '+vin,earlyLinkagePlate),
  claim(idsFrom(supply,earlyPumpPlate),'The 2002 G500 pump and hose plate lists pump 003-466-54-01-80, reservoir 000-460-01-83 and power-steering cooler 463-460-12-24. The G500 pump listing gives the pump 2002–2008 fitment.','Measure the pump pulley, the reservoir mounting and the cooler loop. The pump bracket and pulley numbers are still unsourced. '+vin,earlyPumpPlate),
  claim(idsFrom(supply,pumpListing),'The G500 power steering pump listing gives remanufactured pump 463-466-04-01-80 for 2002–2003 G500s.','Confirm which pump a given car carries. '+vin,pumpListing),
  claim(idsFrom(supply,steeringHoseListing),'The G500 power steering hose listing gives pressure hose 463-997-23-82 for 2002–2003 and 463-997-38-82 for 2004–2008.','Trace the pressure hose route from the pump to the steering gear. '+vin,steeringHoseListing),
  claim(idsFrom(wheelEnd,earlyFrontSuspensionPlate),'The 2002 G500 stabilizer bar and front suspension plate lists the front hub 463-330-01-25, installation kit 463-331-00-44 and hub seals 015-997-79-47.','List the installation kit’s contents and measure the seal. '+vin,earlyFrontSuspensionPlate),
  claim(idsFrom(wheelEnd,midFrontSuspensionPlate),'The 2006 G500 front suspension components plate lists front hub 463-330-04-25 for the G500 and G55 AMG.','Find the year the hub number changed. '+vin,midFrontSuspensionPlate),
  claim(idsFrom(wheelEnd,earlyWheelPlate),'The 2002 G500 wheels plate lists wheel bolt 000-990-53-07 and valve stem 000-400-02-13.','Confirm the bolt count, thread and seat for each wheel option. '+vin,earlyWheelPlate),
  claim(idsFrom(spare,spareCarrierPlate),'The 2006 G500 spare tire carrier plate lists the spare carrier 463-890-13-44-64, grommet 460-997-14-81, nut 460-990-50-50 and trim ring stop 463-898-00-33.','Confirm the carrier number for 2002–2005 cars and measure the stud pattern. '+vin,spareCarrierPlate),
  claim(idsFrom(spare,spacerPage),'The part page for spare carrier spacer 463-991-28-40 gives 2004–2008 G500 fitment and calls it a spacer tube; it is replaced by 463-991-28-40-64.','Find the 2002–2003 spacer and measure its length. '+vin,spacerPage),
  claim(idsFrom(parkingShoes,midRearBrakePlate),'The 2006 G500 rear-brake page lists backing plates 463-420-01-44 and 463-420-02-44 at reference 5, and 461-423-01-20 and 461-423-02-20 without a reference number, for left and right.','The page mixes diagrams. Confirm both pairs are rear plates and which years use each. '+vin,midRearBrakePlate),
  claim(idsFrom(parkingShoes,earlyParkingPlate),'The 2002 G500 parking brake plate lists shoes 003-420-34-20 for the G500 and G55 AMG.','Measure the shoe diameter and width inside the disc hat. '+vin,earlyParkingPlate),
  claim(idsFrom(frontHoses,earlyFrontBrakePlate),'The 2002 G500 front-brake plate lists brake hose 461-420-09-48-64 for both sides at reference 8, beside the hose brackets.','Measure the hose length and confirm it runs from the knuckle bracket to the caliper. '+vin,earlyFrontBrakePlate),
  claim(idsFrom(frontHoses,ecsLinesPage),'ECS Tuning lists genuine hose 460-428-51-35-64 for the 2003 G500 (463.249) as fitting the front axle, left and right, and genuine retaining spring 000-428-06-73 as sitting between the metal brake line and the brake hose.','These come from a retailer page, not a Mercedes diagram. Confirm where 460-428-51-35-64 sits relative to 461-420-09-48-64, and find the steel lines and junctions. '+vin,ecsLinesPage),
  claim(idsFrom(friction,earlyFrontBrakePlate),'The 2002 G500 front-brake plate lists rotor 463-421-00-12 and brake pads 900-420-02-00; the 2008 brake components page names 900-420-02-00 the front pads for the G500.','Measure disc diameter and thickness. '+vin,earlyFrontBrakePlate),
  claim(idsFrom(friction,earlyBrakePartsPlate),'The 2002 G500 brake components plate lists rotor 902-423-07-12-07 for both sides; the 2006 rear-brake page lists 902-423-06-12-07 for the G500 and G55 AMG.','Confirm which years use each rear disc and measure the hat. '+vin,earlyBrakePartsPlate),
  claim(idsFrom(friction,caliperListing),'The G500 brake caliper listing gives front calipers 004-420-69-83 (driver side) and 004-420-70-83 (passenger side) 2002–2008 fitment and lists the numbers they replace.','Confirm piston count and mounting bolt spacing. '+vin,caliperListing),
  claim(idsFrom(friction,midRearBrakePlate),'The 2006 G500 rear-brake page lists rear calipers 001-420-01-01 (left) and 001-420-02-01 (right), replaced by 000-420-09-79-64 and 000-420-10-79.','Confirm the caliper change between the early and 2006–2008 axles. '+vin,midRearBrakePlate),
  claim(idsFrom(friction,lateBrakePartsPlate),'The 2008 G500 brake components page lists 003-420-24-20 as the rear pads for the G500 and G55 AMG, replaced by 008-420-44-20.','Confirm which rear caliper these pads fit. '+vin,lateBrakePartsPlate),
  claim(idsFrom(locating,earlyFrontSuspensionPlate),'The 2002 G500 front suspension plate lists the radius arm 460-330-01-11, its front bushings 460-333-03-14 and rear bushings 460-352-04-65-65, the lateral link 463-330-07-07 and the link bushing 460-352-05-65.','Measure the arm length, eye spacing and the lateral link’s mounting points. '+vin,earlyFrontSuspensionPlate),
  claim(idsFrom(locating,midFrontSuspensionPlate),'The 2006 G500 front suspension components plate lists radius arm washers 460-352-02-76 (front) and 460-352-04-76 (rear) for both sides.','Measure washer diameters and confirm their order on the frame stud. '+vin,midFrontSuspensionPlate),
  claim(idsFrom(locating,earlyRearSuspensionPlate),'The 2002 G500 rear suspension plate lists the trailing arm 461-350-00-06, trailing arm bushing 460-352-06-65 and track bar 461-350-03-06, replaced by 464-350-23-00; the G500 track bar listing gives it 2002–2008 fitment.','Measure the trailing arm and track bar lengths and the frame bracket positions. The Panhard frame brackets are still unsourced. '+vin,earlyRearSuspensionPlate)
];
