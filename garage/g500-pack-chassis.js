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
// Parts the register already models on their own (coil springs, dampers, bump stops, radius and
// trailing arms with their bushings, Panhard rods, rotors, calipers, pads, the front hose, ABS
// sensors and rings, the steering box, pitman arm, drag link, tie rod, damper, pump, reservoir,
// pressure hose and cooler) are left out. These studies open from those parts and add the
// numbered pieces around them.
import {metal,steel,dark,gold,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

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
export const chassisPackSources={framePlate,stabilizerPlate,rearSuspensionPlate,linkagePlate,pumpPlate,columnPlate,frontBrakePlate,lateFrontBrakePlate,rearBrakePlate,lateRearBrakePlate,parkingPlate};

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
const springs=study('g500-spring-damper-mounts','Spring seats and damper mounts','The rubber seats under the coil springs and the frame brackets that carry the upper damper eyes.',stabilizerPlate,[
  part('front-seat','Front spring insulator · 460-322-01-67','The rubber pad between the front coil spring and its seat.',[-.25,0,-.3],r=>coilPad(r,[-.45,0,-.2],.17,rubber)),
  sourced(rearSuspensionPlate,part('rear-seat','Rear spring seat · 460-325-09-15','The rubber spring seat at each rear coil spring.',[.25,0,-.3],r=>coilPad(r,[.45,0,-.2],.16,'#33383a'))),
  sourced(framePlate,part('front-shock-mount','Front damper mounts · 463-320-00-78','The frame brackets that hold the top of each front damper.',[-.25,0,.35],r=>{for(const s of [-1,1])shockMount(r,[-.45,s*.35,.15],s);})),
  sourced(framePlate,part('rear-shock-mount-left','Rear damper mount, left · 460-320-16-78','The frame bracket for the top of the left rear damper.',[.25,-.25,.35],r=>shockMount(r,[.45,-.35,.15],-1))),
  sourced(framePlate,part('rear-shock-mount-right','Rear damper mount, right · 460-320-17-78','The frame bracket for the top of the right rear damper.',[.25,.25,.35],r=>shockMount(r,[.45,.35,.15],1)))
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
  sourced(linkagePlate,part('arm-right','Steering arm, right · 463-330-03-46','The arm bolted to the right knuckle that the tie rod acts on.',[-.35,.25,.3],r=>{block(r,[-.2,.5,.2],[.3,.08,.04],steel);sleeve(r,[-.35,.5,.2],z,-.03,.03,.04,.018,steel,12);}))
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
  part('damper-bracket','Steering damper bracket · 460-463-13-40','The bracket on the axle that anchors the body of the steering damper.',[0,0,-.35],r=>{block(r,[.3,-.1,-.2],[.12,.1,.02],steel);block(r,[.3,-.06,-.14],[.12,.02,.12],steel);sleeve(r,[.3,-.04,-.1],y,0,.04,.025,.012,steel,10);})
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
  sourced(lateRearBrakePlate,part('caliper-support','Rear caliper support · 000-421-17-06','The anchor bracket that carries the 2006–2008 rear caliper on the axle.',[0,0,-.4],r=>{block(r,[0,0,-.2],[.3,.05,.06],paint);for(const s of [-1,1])block(r,[s*.13,0,-.1],[.05,.05,.16],paint);}))
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

export const studies=[frame,mounts,springs,stabilizer,knuckles,joints,boxSeals,column,frontBrake,rearBrake,parking,returnHoses];
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
  ['steering-assist.return-lines',returnHoses]
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
  claim(idsFrom(returnHoses,pumpPlate),'The 2004 G500 pump and hose plate lists a return hose and a reservoir hose beside the pump, reservoir, pressure hose and cooler.','Trace where each hose connects at the box, cooler, reservoir and pump. '+vin,pumpPlate)
];
