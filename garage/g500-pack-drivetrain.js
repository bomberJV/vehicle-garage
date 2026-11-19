// G500 study pack: drivetrain.
// Drivetrain: transfer case, propeller shafts, rear axle, hubs, axle shafts, transmission cooler lines and service parts.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
import {TAU,metal,steel,dark,gold,copper,turn,cyl,sleeve,gear,part,study,x,y,z} from './mechanism-shapes.js';

const ref=(label,url)=>({label,url});
const vg150e=ref('awd.tech · VG150 E transfer case parts list, G-Class (cases 463-280-17-00 and 463-280-20-00)','https://awd.tech/apps/catalog/transmission/vg150%20e-mercedes-benz');
const g500Transfer=ref('MB Parts Giant · 2006 G500 transfer case page: motor 463-540-00-88, output shaft seal 015-997-08-47-64, case 463-280-20-00; a later-year plate: the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed','https://www.mbpartsgiant.com/parts-list/2006-mercedes_benz-g500/transmission/transfer-case');
const g500Actuator=ref('MB Parts Giant · G500 4WD actuator 463-540-00-88, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-4wd_actuator');
const outputSeal=ref('MB Parts Giant · sealing ring 015-997-08-47-64, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-transfer_case_pinion_shaft_seals');
const gWagenTransfer=ref('Expedition Imports · W463 transmission and transfer-case parts','https://expedition-imports.com/g-wagon-parts/w463-g-class/transmission-and-transfer-case');
const axleShafts=ref('MB Parts Giant · G500 axle shafts, 2002–2008 G500 fitment','https://mbpartsgiant.com/oem-mercedes_benz-g500-axle_shaft');
const axleNuts=ref('MB Parts Giant · G500 grooved axle nuts, 2002–2008 G500 fitment','https://mbpartsgiant.com/oem-mercedes_benz-g500-spindle_nut');
const frontAxle=ref('MB Parts Giant · 2002 G500 front axle shafts and differential diagram','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/driveline-axles/front-axle-shafts-differential');
const fcpAxle=ref('FCP Euro · G500 axle parts, Genuine Mercedes','https://www.fcpeuro.com/Mercedes~Benz-parts/G500/Axle/');
const fcpTransmission=ref('FCP Euro · G500 automatic transmission parts','https://www.fcpeuro.com/Mercedes~Benz-parts/G500/Automatic-Transmission/');
export const drivetrainPackSources={vg150e,g500Transfer,g500Actuator,outputSeal,gWagenTransfer,axleShafts,axleNuts,frontAxle,fcpAxle,fcpTransmission};

const rubber='#2b2f31',iron='#6f7b7e',zinc='#b3b9b1';
const src=(p,source)=>({...p,source});
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]);cyl(r,a,d,0,Math.hypot(...d),rad,color,n);};
const path=(r,pts,rad,color)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,8);};
// Tapered roller bearing: cone, a ring of rollers and a cup, along an axis.
function taper(r,c,a,inner,outer,width,color=metal,n=10){
  sleeve(r,c,a,0,width,inner+.018,inner,steel,n);
  turn(r,c,a,[[0,inner+.02],[0,outer-.025],[width,outer-.012],[width,inner+.02],[0,inner+.02]],gold,{n});
  turn(r,c,a,[[0,outer-.022],[0,outer],[width,outer],[width,outer-.01],[0,outer-.022]],color,{n});
}
// Ball or needle bearing: two races with a filled band between.
function ring(r,c,a,inner,outer,width,color=metal,n=10){
  sleeve(r,c,a,0,width,inner+.015,inner,color,n);
  sleeve(r,c,a,width*.15,width*.85,outer-.012,inner+.015,gold,n);
  sleeve(r,c,a,0,width,outer,outer-.012,color,n);
}
const at=(px,c)=>[c[0]+px,c[1],c[2]];

// VG150 E transfer case, study 1: the range gear set on the main shaft.
// The main shaft runs along x through the origin.
const MS=[0,0,0];
const rangeRows=[
  part('front-bearing','Main-shaft front taper bearing · 004-981-36-05','The tapered roller bearing at the front of the main shaft.',[-.45,0,0],r=>taper(r,at(-.8,MS),x,.05,.11,.07)),
  part('front-washer','Front gear thrust washer · 463-282-00-62','The thrust washer between the front bearing and the front gear.',[-.2,0,.35],r=>sleeve(r,at(-.71,MS),x,0,.014,.13,.055,zinc,14)),
  part('front-gear','Front gear on the main shaft · 463-282-03-11','The front gear of the range set, turning on its own roller bearing around the main shaft.',[0,0,.5],r=>gear(r,at(-.68,MS),x,0,.1,.2,.2,16,steel,0,.32)),
  part('front-gear-bearing','Front gear roller bearing · 463-284-05-36','The roller bearing that lets the front gear turn on the main shaft.',[0,-.4,0],r=>ring(r,at(-.67,MS),x,.05,.075,.08)),
  part('synchro-cones','Synchronizer cones · 417-262-05-37','Two cones, one at each side of the sliding collar, that match speeds before the collar engages a gear.',[0,.45,0],r=>{
    for(const px of [-.56,-.31])turn(r,at(px,MS),x,[[0,.07],[0,.11],[.04,.125],[.05,.125],[.05,.07],[0,.07]],copper,{n:10});}),
  part('synchro-springs','Synchronizer circular springs · 441-262-00-93','Two wire springs that load the synchronizer parts.',[0,0,.55],r=>{
    for(const px of [-.5,-.32])sleeve(r,at(px,MS),x,0,.008,.13,.118,'#5e7f8a',10);}),
  part('main-shaft','Main shaft · 463-280-08-21','The through shaft that carries the range gears and leads to the rear of the case.',[0,0,-.5],r=>{
    cyl(r,at(-.9,MS),x,0,1.75,.05,steel,14);for(let i=0;i<8;i++)block(r,at(-.47+i*.012,MS),[.006,.104,.104],dark);}),
  part('sliding-collar','Range sliding collar · 463-282-04-23','The splined collar between the two gears; the shift fork moves it to select a range.',[0,-.45,0],r=>{
    turn(r,at(-.5,MS),x,[[0,.055],[0,.15],[.04,.15],[.04,.12],[.08,.12],[.08,.15],[.12,.15],[.12,.055],[0,.055]],metal,{n:16});}),
  part('synchro-ring','Synchronizer ring · 463-282-01-34','The toothed ring that sits between a cone and the sliding collar.',[0,-.3,.45],r=>sleeve(r,at(-.37,MS),x,0,.025,.145,.11,gold,14)),
  part('rear-gear-bearing','Rear gear needle bearing · 013-981-98-10','The needle bearing under the rear gear.',[0,.4,0],r=>ring(r,at(-.28,MS),x,.05,.075,.08)),
  part('rear-gear','Rear gear on the main shaft · 463-282-04-11','The rear gear of the range set.',[0,0,.5],r=>gear(r,at(-.29,MS),x,0,.1,.24,.24,18,steel,.1,.28)),
  part('rear-washer','Rear gear thrust washer · 463-282-10-62','The thrust washer behind the rear gear.',[0,-.35,0],r=>sleeve(r,at(-.17,MS),x,0,.014,.14,.055,zinc,14)),
  part('rear-bearing','Main-shaft taper bearing · 009-981-51-05','The tapered roller bearing behind the rear gear.',[0,.35,0],r=>taper(r,at(-.14,MS),x,.05,.11,.07)),
  part('spacer-tube','Spacer tube · 463-282-00-53','The tube that spaces the bearings along the main shaft.',[0,-.35,.2],r=>sleeve(r,at(-.05,MS),x,0,.3,.07,.052,zinc,14)),
  part('rear-ball-bearing','Rear main-shaft ball bearing · 002-981-30-25','The ball bearing that carries the rear main shaft in the rear cover.',[.4,0,0],r=>ring(r,at(.6,MS),x,.05,.12,.06)),
  part('spacer-disc','Spacer disc · 463-284-00-76','A spacer disc behind the rear ball bearing.',[.5,0,.25],r=>sleeve(r,at(.68,MS),x,0,.012,.12,.055,zinc,14))
];
const rangeSet=study('g500-vg150-range-set','VG150 E transfer case range gears on the main shaft','The two-speed VG150 E case used with the electric range motor. The main shaft carries a front and a rear gear, each on its own bearing, with a synchronized sliding collar between them that selects the range.',vg150e,rangeRows);
rangeSet.viewAngle=[-.6,.3];

// Study 2: the countershaft, oil feed, range shift and the parts that close
// and carry the case, around a case drawn only by its fittings.
const CS=[0,0,-.3];
const fittingRows=[
  part('countershaft','Countershaft · 463-283-07-02','The lower shaft with two fixed gears that mesh with the main-shaft gears.',[0,-.5,-.15],r=>{
    cyl(r,at(-.6,CS),x,0,1.05,.045,steel,12);gear(r,at(-.5,CS),x,0,.1,.24,.24,18,iron,.2,.2);gear(r,at(-.15,CS),x,0,.1,.2,.2,16,iron,0,.24);}),
  part('countershaft-bearing','Countershaft groove ball bearing · 005-981-14-25','A groove ball bearing at the rear of the countershaft.',[.25,-.3,-.2],r=>ring(r,at(.47,CS),x,.045,.1,.05)),
  part('retaining-ring','Bearing retaining ring · 463-994-00-41','The snap ring that holds the groove ball bearing in place.',[.35,-.2,-.35],r=>{
    turn(r,at(.53,CS),x,[[0,.09],[0,.11],[.008,.11],[.008,.09],[0,.09]],dark,{n:14,start:.3,sweep:5.6});}),
  part('oil-baffles','Oil baffles · 463-282-02-65, 463-282-01-65','Two sheet baffles in the case that guide oil around the gears.',[0,-.3,-.45],r=>{
    for(const px of [-.5,-.1])block(r,[px,-.3,-.5],[.22,.02,.16],zinc);block(r,[-.3,-.22,-.6],[.5,.14,.015],zinc);}),
  part('oil-tube','Oil tube · 463-281-02-63','The small tube that carries oil to the shafts.',[0,-.55,.15],r=>path(r,[[-.6,-.4,-.05],[-.2,-.4,-.05],[.2,-.38,.05],[.45,-.3,.15]],.012,copper)),
  part('front-shift-rod','Front shifting rod · 463-284-08-20','A shift rod in the front-cover group of the case, beside the vacuum lock cylinder.',[-.2,.45,0],r=>cyl(r,[-.6,.42,0],x,0,.55,.022,steel,10)),
  part('front-shift-fork','Front shift fork · 463-284-07-01','The fork mounted on the front shifting rod.',[0,.35,-.25],r=>{
    block(r,[-.35,.42,0],[.05,.06,.08],metal);block(r,[-.35,.29,-.04],[.03,.22,.04],metal);block(r,[-.35,.18,-.1],[.03,.03,.12],metal);}),
  part('rod-bushings','Front-cover bushings · 389-268-10-50','Two bushings listed with the front-cover group.',[-.35,.4,.1],r=>{for(const px of [-.58,-.48])sleeve(r,[px,.42,0],x,0,.04,.035,.022,gold,8);}),
  part('range-rod','Range shifting rod · 463-284-10-20','The shift rod for the range fork in the rear-cover group.',[.1,.5,.25],r=>cyl(r,[-.4,.38,.42],x,0,.75,.022,steel,10)),
  part('range-fork','Range shift fork assembly · 463-280-01-31','The fork assembly on the range rod. It reaches down to the sliding collar between the two gears on the main shaft.',[-.15,.35,.35],r=>{
    block(r,[-.2,.38,.42],[.06,.06,.08],metal);block(r,[-.2,.27,.35],[.03,.2,.04],metal);
    turn(r,[-.215,0,.2],x,[[0,.155],[0,.175],[.03,.175],[.03,.155],[0,.155]],metal,{n:12,start:-.3,sweep:3.74});}),
  part('fork-bearings','Shift fork bearings · 463-284-02-36','Two small bearings carried by the range fork assembly.',[-.1,-.2,.45],r=>{for(const s of [-1,1])cyl(r,[-.215,s*.17,.2],x,0,.03,.018,gold,8);}),
  part('shifter-shaft','Shifter shaft · 463-280-02-57','The shifter shaft in the rear-cover group, between the actuator motor and the range rod.',[.3,.25,.3],r=>{
    cyl(r,[.2,.38,.42],z,0,.3,.025,steel,10);block(r,[.2,.38,.44],[.05,.06,.05],metal);}),
  src(part('actuator-motor','Range actuator motor · 463-540-00-88','The electric motor on the case that shifts between high and low range on command from the transfer-case controller.',[.25,.2,.55],r=>{
    cyl(r,[.2,.38,.72],z,0,.18,.1,dark,16);cyl(r,[.2,.38,.9],z,0,.04,.07,steel,12);block(r,[.2,.52,.82],[.08,.06,.06],'#3a3f42');}),g500Actuator),
  part('motor-bracket','Bracket · 461-281-01-40','A bracket on the outside of the case, drawn here beside the actuator.',[.5,.3,.35],r=>{block(r,[.4,.38,.71],[.18,.12,.015],zinc);block(r,[.48,.38,.65],[.015,.12,.12],zinc);}),
  part('earthing-strap','Earthing strap · 123-540-03-41','A short ground strap that bonds the case to the vehicle ground, drawn near the actuator.',[.55,.45,.15],r=>path(r,[[.3,.48,.78],[.45,.5,.62],[.55,.45,.45]],.01,copper)),
  part('input-flange','Main-shaft flange · 463-282-04-45, assembly 463-270-84-00','The flange on the front of the main shaft, held by the main-shaft nut. The parts list gives the flange assembly for case 463-280-20-00, the G500 case.',[-.45,0,0],r=>{
    turn(r,[-.85,0,.2],x,[[0,.04],[0,.17],[.03,.17],[.03,.07],[.12,.07],[.12,.04],[0,.04]],metal,{n:24});for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;cyl(r,[-.86,.13*Math.cos(a),.2+.13*Math.sin(a)],x,0,.04,.014,steel,8);}}),
  part('flange-nut','Main-shaft nut · 463-990-00-51','The collar nut that holds the main-shaft flange and sets the bearing stack.',[-.6,.2,.1],r=>turn(r,[-.93,0,.2],x,[[0,.035],[0,.06],[.04,.06],[.04,.035],[0,.035]],steel,{n:6,start:Math.PI/6})),
  src(part('flange-seals','Output shaft sealing rings · 015-997-08-47-64','Radial seals behind the flanges where the shafts leave the case.',[-.25,-.35,0],r=>{
    for(const c of [[-.72,0,.2],[.72,0,.2],[-.72,0,-.25]])sleeve(r,c,x,0,.025,.1,.065,rubber,20);}),outputSeal),
  part('twist-seals','Twist-lip sealing rings · 029-997-35-45 right, 029-997-36-45 left','Directional-lip seal rings that the parts list gives for case 463-280-20-00 in the same three positions.',[-.25,.35,0],r=>{
    for(const c of [[-.7,0,.2],[.7,0,.2],[-.7,0,-.25]])turn(r,c,x,[[0,.065],[0,.1],[.018,.1],[.025,.085],[.025,.065],[0,.065]],'#3d3426',{n:20});}),
  part('deflector','Deflector · 016-997-61-47','A sheet deflector ring at a shaft exit, outside the seal.',[-.4,-.45,-.3],r=>turn(r,[-.78,0,-.25],x,[[0,.07],[0,.14],[.01,.14],[.03,.12],[.03,.07],[0,.07]],zinc,{n:22})),
  part('cover-o-ring','Front cover O-ring · 011-997-74-45','The O-ring that seals the front cover to the case.',[-.3,0,.45],r=>turn(r,[-.66,0,-.02],x,[[0,.36],[0,.38],[.012,.38],[.012,.36],[0,.36]],rubber,{n:32})),
  part('screw-plugs','Oil screw plugs · 115-997-00-32, 124-997-01-32','The two plugs that close the oil ports in the case.',[0,-.5,-.25],r=>{
    for(const [px,pz] of [[-.1,-.48],[.25,-.1]]){cyl(r,[px,-.36,pz],y,-.04,0,.035,steel,6);cyl(r,[px,-.36,pz],y,0,.012,.045,steel,6);}}),
  src(part('flange-bolts','Propeller shaft flange bolts · 319-990-06-01','Sixteen bolts fasten the propeller shafts to the two output flanges; one set of eight is drawn.',[.4,0,0],r=>{
    for(const c of [[.8,0,.2]])for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(r,[c[0],.14*Math.cos(a),c[2]+.14*Math.sin(a)],x,0,.06,.011,steel,6);}}),gWagenTransfer),
  src(part('front-mount','Transfer case mount, front · 463-280-03-86','The rubber mount that carries the front of the case.',[-.2,0,-.45],r=>{
    block(r,[-.45,0,-.62],[.16,.16,.03],steel);cyl(r,[-.45,0,-.6],z,0,.08,.07,rubber,16);block(r,[-.45,0,-.5],[.12,.12,.025],steel);}),gWagenTransfer),
  src(part('left-rear-mount','Transfer case mount, left rear · 463-280-01-86-64','The rubber mount under the left rear of the case.',[.3,-.4,-.4],r=>{
    block(r,[.45,-.28,-.62],[.14,.14,.03],steel);cyl(r,[.45,-.28,-.6],z,0,.08,.06,rubber,16);block(r,[.45,-.28,-.5],[.1,.1,.025],steel);}),gWagenTransfer),
  src(part('right-rear-mount','Transfer case mount, right rear · 463-280-02-86','The rubber mount under the right rear of the case.',[.3,.4,-.4],r=>{
    block(r,[.45,.28,-.62],[.14,.14,.03],steel);cyl(r,[.45,.28,-.6],z,0,.08,.06,rubber,16);block(r,[.45,.28,-.5],[.1,.1,.025],steel);}),gWagenTransfer)
];
const caseFittings=study('g500-vg150-case-fittings','VG150 E transfer case countershaft, range shift, seals and mounts','The rest of the case around the main shaft: the countershaft and its oil feed, the electric range shift, the main-shaft flange and nut, the shaft seals, the oil plugs, the propeller-shaft flange bolts and three rubber mounts.',vg150e,fittingRows);
caseFittings.viewAngle=[-.55,.3];

// ---------------------------------------------------------------------------
// Rear axle shafts and their grooved bearing nuts, drawn along y.
const shaft=(r,s,color)=>{
  cyl(r,[0,s*.12,0],y,s<0?-.78:0,s<0?0:.78,.035,color,14);
  turn(r,[0,s*.9,0],y,s<0?[[0,0],[0,.22],[.03,.22],[.05,.06],[.12,.045],[.12,0]]:[[0,0],[0,.22],[-.03,.22],[-.05,.06],[-.12,.045],[-.12,0]],color,{n:24});
  for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl(r,[.16*Math.cos(a),s*.9,.16*Math.sin(a)],y,s<0?-.05:0,s<0?0:.05,.012,steel,6);}
  for(let i=0;i<10;i++)block(r,[0,s*(.14+i*.012),0],[.075,.005,.075],dark);
};
const grooved=(r,s)=>turn(r,[0,s*.74,0],y,[[0,.045],[0,.075],[s*.035,.075],[s*.035,.045],[0,.045]],metal,{n:8});
const rearRows=[
  src(part('left-shaft','Rear axle shaft, left · 902-357-08-01 (2002–2003), 902-357-13-01','The driver-side rear shaft: splined into the differential at its inner end, flanged to the wheel hub at its outer end.',[0,-.25,.15],r=>shaft(r,-1,steel)),axleShafts),
  src(part('right-shaft','Rear axle shaft, right · 463-357-10-01 (2002–2003), 463-357-17-01','The passenger-side rear shaft.',[0,.25,.15],r=>shaft(r,1,'#6c8189')),axleShafts),
  src(part('left-nut','Grooved axle nut, left · 902-357-01-26','The slotted nut that holds the bearing on the left rear shaft.',[0,-.2,-.3],r=>grooved(r,-1)),axleNuts),
  src(part('right-nut','Grooved axle nut, right · 902-357-02-26','The slotted nut that holds the bearing on the right rear shaft.',[0,.2,-.3],r=>grooved(r,1)),axleNuts)
];
const rearShafts=study('g500-rear-axle-shafts','Rear axle shafts and bearing nuts','Each rear wheel is driven by its own shaft from the differential. A grooved nut at each outer end holds the wheel bearing on the shaft.',axleShafts,rearRows);
rearShafts.viewAngle=[-.35,.25];

// Front pinion: companion flange and collar nut on the pinion nose.
const pinionRows=[
  part('companion-flange','Front pinion companion flange · 460-350-05-45 (replaced by 464-350-32-00)','The flange on the front pinion that the front propeller shaft bolts to.',[-.35,0,0],r=>{
    turn(r,[-.2,0,0],x,[[0,.08],[0,.3],[.05,.3],[.05,.12],[.35,.1],[.35,.06],[0,.06]],metal,{n:28});
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;cyl(r,[-.21,.23*Math.cos(a),.23*Math.sin(a)],x,0,.07,.025,dark,10);}}),
  part('pinion-nut','Front pinion collar nut · 601-351-01-72','The collar nut that clamps the companion flange onto the pinion splines.',[-.6,0,0],r=>turn(r,[-.32,0,0],x,[[0,.03],[0,.085],[.08,.085],[.08,.03],[0,.03]],steel,{n:6,start:Math.PI/6}))
];


// Front axle shaft support bearings, drawn beside the pinion flange.
const frontBearingRows=[
  src(part('shaft-bearing','Front axle shaft bearing · 463-337-00-49','The bearing listed for each front axle shaft, shown here near the outer end of the shaft.',[0,0,.3],r=>{
    for(const s of [-1,1]){ring(r,[0,s*.55,0],y,.06,.13,.12);cyl(r,[0,s*.4,0],y,s<0?-.3:0,s<0?0:.3,.055,'#8b999c',14);}}),fcpAxle)
];
const frontAxleParts=study('g500-front-axle-parts','Front pinion flange, collar nut and axle shaft bearings','The front axle pinion ends in a companion flange held by a collar nut; the front propeller shaft bolts to this flange. Each front axle shaft also has its own support bearing toward the wheel end.',frontAxle,[...pinionRows,...frontBearingRows]);
frontAxleParts.viewAngle=[-.55,.3];

// ---------------------------------------------------------------------------
// 722.6 service and selector parts, spread across y so they do not overlap.
const moved=(d,draw)=>(r,...a)=>draw({...r,tag:r.tag?.bind(r),polygon:(pts,...o)=>r.polygon(pts.map(q=>q.map((v,i)=>v+d[i])),...o),box:(x0,y0,z0,x1,y1,z1,...o)=>r.box(x0+d[0],y0+d[1],z0+d[2],x1+d[0],y1+d[1],z1+d[2],...o)},...a);
const bushingRows=[
  src(part('shift-rod-bushing','Selector rod bushing · 202-992-00-10','The bushing where the selector rod joins the lever on the transmission.',[0,0,.25],r=>{
    turn(r,[0,0,-.12],z,[[0,.06],[0,.14],[.03,.14],[.03,.1],[.21,.1],[.24,.13],[.27,.13],[.27,.06],[0,.06]],'#d6d0c2',{n:22});
    cyl(r,[-.6,0,.08],x,0,.55,.03,steel,10);}),gWagenTransfer)
];

const hoseRows=[
  src(part('lower-hose','Lower transmission cooler hose · 019-997-72-82','The flexible hose section in the lower cooler line between the transmission and the cooler.',[0,0,.3],r=>{
    path(r,[[-.7,0,-.3],[-.4,0,-.25],[-.1,.1,0],[.2,.15,.25],[.55,.1,.35]],.04,rubber);
    for(const c of [[-.75,0,-.3],[.6,.1,.35]])cyl(r,c,x,-.06,.06,.05,zinc,12);}),gWagenTransfer)
];

const connectorRows=[
  src(part('case-connector','Transmission case connector · 203-540-02-53','The plug socket in the side of the 722.6 case that carries the conductor-plate circuits to the outside harness.',[0,0,.3],r=>{
    cyl(r,[0,0,-.2],y,-.2,.2,.11,'#3a3f42',18);turn(r,[0,0,-.2],y,[[.2,.11],[.2,.14],[.24,.14],[.24,.11],[.2,.11]],rubber,{n:18});
    for(let i=0;i<7;i++){const a=i*2*Math.PI/7;cyl(r,[.06*Math.cos(a),0,-.2+.06*Math.sin(a)],y,.2,.28,.008,gold,6);}}),fcpTransmission)
];

const shiftRows=(rows,d)=>rows.map(p=>({...p,draw:moved(d,p.draw)}));
const transmissionRows=[...shiftRows(connectorRows,[0,.55,0]),...shiftRows(bushingRows,[0,-.55,0]),...hoseRows];
const transmissionParts=study('g500-722-attachments','722.6 case connector, selector rod bushing and cooler hose','Three G500 parts attached to the outside of the five-speed automatic: the round case connector to the conductor plate inside, the bushing where the selector rod meets the transmission lever, and the flexible lower hose in the cooler line.',fcpTransmission,transmissionRows);
transmissionParts.viewAngle=[-.55,.3];

// ===========================================================================
// Round 2: rear axle, differential gear sets, axle locks, hub ends, propeller
// shafts and the VG150 E center differential and lock actuator.
const mbpg=(label,path)=>ref('MB Parts Giant · '+label,'https://www.mbpartsgiant.com/'+path);
const rearAxle02=mbpg('2002 G500 rear axle diagram','parts-list/2002-mercedes_benz-g500/driveline-axles/rear-axle');
const rearAxle08=mbpg('2008 G500 rear axle diagram, a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed for pinion spacers 108-353-00-42 and 639-353-00-53','parts-list/2008-mercedes_benz-g500/driveline-axles/rear-axle');
const rearHousing02=mbpg('2002 G500 rear axle housing diagram','parts-list/2002-mercedes_benz-g500/suspension/axle-housing-rear');
const frontAxle02=mbpg('2002 G500 front axle diagram','parts-list/2002-mercedes_benz-g500/driveline-axles/front-axle');
const frontCarrier02=mbpg('2002 G500 front axle carrier diagram','parts-list/2002-mercedes_benz-g500/suspension/front-axle-carrier');
const frontHub02=mbpg('2002 G500 stabilizer bar and components diagram (front hub, bearings, knuckle)','parts-list/2002-mercedes_benz-g500/suspension/stabilizer-bar-components');
const rearProp02=mbpg('2002 G500 rear propeller shaft diagram','parts-list/2002-mercedes_benz-g500/driveline-axles/rear-propeller-shaft');
const frontShaft06=mbpg('2006 G500 drive shaft, front diagram, a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed for drive shaft plate 463-413-01-84','parts-list/2006-mercedes_benz-g500/suspension/drive-shaft-front');
const driveShafts=mbpg('G500 drive shafts, 2002–2008 G500 fitment','oem-mercedes_benz-g500-drive_shaft');
const sensorRings=mbpg('G500 ABS sensor rings, 2002–2008 G500 fitment','oem-mercedes_benz-g500-abs_reluctor_ring');
const hubSeal=mbpg('G500 wheel (hub) seal, 2002–2008 G500 fitment','oem-mercedes_benz-g500-wheel_seal');
const pinionBearings=mbpg('G500 pinion bearings, 2002–2008 G500 fitment','oem-mercedes_benz-g500-pinion_bearing');
const ringPinion=mbpg('G500 ring and pinion sets, 2002–2008 G500 fitment','oem-mercedes_benz-g500-ring_and_pinion');
const transfer08=mbpg('2008 G500 transfer case page: motor 463-540-00-88, seal 015-997-08-47-64, case 463-280-20-00; a later-year plate: the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed','parts-list/2008-mercedes_benz-g500/transmission/transfer-case');
Object.assign(drivetrainPackSources,{rearAxle02,rearAxle08,rearHousing02,frontAxle02,frontCarrier02,frontHub02,rearProp02,frontShaft06,driveShafts,sensorRings,hubSeal,pinionBearings,ringPinion,transfer08});

const hex=(r,c,a,inner,outer,width,color=steel)=>turn(r,c,a,[[0,inner],[0,outer],[width,outer],[width,inner],[0,inner]],color,{n:6,start:Math.PI/6});
const mirror=a=>a.map(v=>-v);
// Bevel gear facing along a: the teeth narrow toward the face.
const bevel=(r,c,a,outer,width,teeth,color=steel)=>gear(r,c,a,0,width,outer,outer*.72,teeth,color,0,.3);
// Ring of small teeth (an ABS tone ring) along a.
const toneRing=(r,c,a,outer,inner,width,teeth)=>{sleeve(r,c,a,0,width,outer-.012,inner,iron,teeth);gear(r,c,a,0,width,outer,outer,teeth,iron,0,(outer-.014)/outer);};

// Rear axle housing with its pinion bearing, pinion seal, spacer and side bearings.
// Axle along y, pinion nose along -x.
const housingRows=[
  part('housing','Rear axle housing · 463-350-02-03','The rigid rear axle casing: the center bowl that holds the differential and the two tubes out to the wheel ends.',[0,0,-.45],r=>{
    turn(r,[0,-.3,0],y,[[0,.12],[.06,.3],[.18,.38],[.44,.38],[.56,.3],[.6,.12]],iron,{n:20});
    for(const s of [-1,1])cyl(r,[0,s*.3,0],[0,s,0],0,.62,.085,iron,14);
    sleeve(r,[-.3,0,0],[-1,0,0],0,.32,.14,.1,iron,18);}),
  src(part('side-bearings','Carrier side bearings · 000-980-19-02','The two tapered roller bearings that carry the differential case in the housing, one at each side of the bowl. Both axles use this number.',[0,0,.45],r=>{
    for(const s of [-1,1])taper(r,[0,s*.24,0],[0,s,0],.1,.17,.06);}),pinionBearings),
  src(part('outer-pinion-bearing','Rear outer pinion bearing · 007-981-53-05','The tapered roller bearing at the flange end of the rear drive pinion, in the nose of the housing.',[-.35,0,.25],r=>taper(r,[-.52,0,0],[-1,0,0],.04,.1,.05)),pinionBearings),
  part('pinion-seal','Rear pinion seal · 013-997-18-47','The radial seal in the end of the pinion nose, under the companion flange.',[-.55,0,0],r=>sleeve(r,[-.62,0,0],x,0,.03,.11,.05,rubber,18)),
  src(part('pinion-spacer','Pinion spacer, 34 × 21 mm · 639-353-00-53','The larger of the two pinion spacers the diagram gives between the inner and outer pinion bearings; it sets the bearing preload.',[-.2,-.35,0],r=>sleeve(r,[-.48,0,0],x,0,.13,.058,.045,zinc,14)),rearAxle08)
];
const rearHousing=study('g500-rear-housing-pinion','Rear axle housing, pinion bearing, seal and side bearings','The rear axle housing carries the differential on two side bearings. The drive pinion runs in two tapered bearings in the nose, held apart by a spacer and sealed under the companion flange.',rearAxle02,housingRows);
rearHousing.viewAngle=[-.55,.3];

// Rear differential gear set: crown wheel, pinion, case, cross shaft, pinions and washers.
const pinionHead=(r,s)=>{bevel(r,[s*.46,0,0],[-s,0,0],.11,.12,11,metal);cyl(r,[s*.46,0,0],[s,0,0],0,.45,.04,steel,12);};
const crownWheel=(r,s)=>{bevel(r,[0,.08,0],y,.4,.08,31,steel);sleeve(r,[0,.07,0],y,0,.02,.32,.2,steel,24);};
const diffCase=(r,color)=>turn(r,[0,-.24,0],y,[[0,.05],[0,.09],[.08,.12],[.12,.2],[.3,.21],[.32,.3],[.34,.3],[.34,.05]],color,{n:20});
const rearGearRows=[
  src(part('ring-pinion','Rear ring and pinion · 904-350-00-39','The matched crown wheel and drive pinion of the rear axle. The crown wheel bolts to the differential case; the pinion comes in from the propeller shaft.',[-.25,0,.35],r=>{crownWheel(r);pinionHead(r,-1);}),ringPinion),
  part('case','Rear differential case · 901-350-00-23','The case that the crown wheel bolts to. It turns in the two side bearings and carries the cross shaft and differential pinions.',[0,-.4,0],r=>diffCase(r,dark)),
  src(part('cross-shaft','Differential pinion shaft · 601-350-05-26','The cross shaft through the case that the two differential pinions turn on. The front axle uses the same number.',[0,0,.55],r=>cyl(r,[0,0,-.19],z,0,.38,.024,metal,10)),ringPinion),
  src(part('pinion-gears','Differential pinion gears · 107-353-00-14','The two small bevel gears on the cross shaft that mesh with the side gears and let the wheels turn at different speeds.',[.3,0,.35],r=>{for(const s of [-1,1])bevel(r,[0,0,s*.14],[0,0,-s],.075,.06,10,metal);}),ringPinion),
  part('thrust-washers','Spherical thrust washers · 668-353-00-24','Domed washers behind the differential pinions, between each pinion and the case.',[.3,0,-.35],r=>{
    for(const s of [-1,1])turn(r,[0,0,s*.15],[0,0,s],[[0,.03],[0,.085],[.018,.075],[.018,.03],[0,.03]],gold,{n:14});})
];
const rearGears=study('g500-rear-diff-gears','Rear differential gear set','The rear crown wheel and pinion, the differential case, its cross shaft, the two differential pinions and their domed thrust washers.',rearAxle02,rearGearRows);
rearGears.viewAngle=[-.6,.35];

// Front differential gear set from the 2002 front axle page.
const frontGearRows=[
  src(part('ring-pinion','Front ring and pinion · 461-330-03-39','The matched crown wheel and drive pinion of the front axle. The pinion points back toward the transfer case.',[.25,0,.35],r=>{crownWheel(r);pinionHead(r,1);}),ringPinion),
  part('case','Front differential case · 463-330-07-23','The front differential case that the crown wheel bolts to, turning in the side bearings.',[0,-.4,0],r=>diffCase(r,'#5b6b70')),
  part('gear-kit','Front differential gear kit · 668-350-00-26','The kit of differential bevel gears: two side gears splined to the axle shafts and two pinions on the cross shaft.',[0,0,.5],r=>{
    for(const s of [-1,1]){bevel(r,[0,s*.17,0],[0,-s,0],.11,.06,14,metal);bevel(r,[0,0,s*.14],[0,0,-s],.075,.06,10,metal);}
    cyl(r,[0,0,-.19],z,0,.38,.022,steel,8);})
];
const frontGears=study('g500-front-diff-gears','Front differential gear set','The front crown wheel and pinion, the differential case, and the kit of side gears and pinions inside it.',frontAxle02,frontGearRows);
frontGears.viewAngle=[-.6,.35];

// Axle lock parts common to both G500 axle pages.
const lockRows=[
  part('cylinder','Axle lock cylinder · 463-330-00-54','The shift cylinder on the axle housing that engages the differential lock; both G500 axle pages list it.',[0,0,-.35],r=>{
    cyl(r,[-.3,0,0],x,0,.55,.17,'#59666a',18);cyl(r,[-.35,0,0],x,0,.05,.2,steel,18);cyl(r,[.25,0,0],x,0,.25,.035,metal,10);
    cyl(r,[-.1,0,.17],z,0,.08,.035,steel,10);}),
  part('switch','Lock engagement switch · 000-545-05-64-64','The switch that reports when a differential lock is engaged. The axle pages list it with each axle lock, and the VG150 E list gives the same switch on the transfer case.',[0,0,.45],r=>{
    cyl(r,[.1,0,.17],z,0,.1,.045,dark,12);hex(r,[.1,0,.27],z,0,.06,.04);cyl(r,[.1,0,.31],z,0,.08,.03,'#2f3436',10);}),
  part('repair-package','Lock repair package · 460-350-07-84','A repair package listed in the lock group between the lock shaft and the lock flange; the page does not list its contents, so it is drawn as two seal rings on the shaft.',[.45,0,0],r=>{
    for(const px of [.32,.4])sleeve(r,[px,0,0],x,0,.03,.065,.035,rubber,14);})
];
const lockParts=study('g500-axle-lock-parts','Axle lock cylinder, switch and repair package','The numbered parts of each axle differential lock: the shift cylinder, its engagement switch and the repair package.',rearAxle02,lockRows);
lockParts.viewAngle=[-.5,.3];

// Rear wheel ends: bearing, seal, retainers, lock, gasket, sensor ring, repair kit.
// Both ends drawn along y; left end at -y.
const endRows=[
  src(part('bearings','Rear axle shaft bearings · 017-981-46-05','The bearing at each outer end of the rear axle, on the shaft inside the end of the axle tube.',[0,0,.35],r=>{
    for(const s of [-1,1])ring(r,[0,s*.5,0],[0,s,0],.06,.15,.1);}),fcpAxle),
  src(part('seals','Rear axle shaft seals · 902-997-02-46','The shaft seal at each tube end, outboard of the bearing.',[0,0,-.35],r=>{
    for(const s of [-1,1])sleeve(r,[0,s*.62,0],[0,s,0],0,.03,.1,.055,rubber,18);}),fcpAxle),
  part('retainer-left','Rear bearing retainer, left · 463-357-01-19','The bearing cover that bolts over the left tube end and holds the bearing.',[0,-.3,.15],r=>{
    turn(r,[0,-.46,0],[0,-1,0],[[0,.1],[0,.24],[.025,.24],[.025,.16],[.2,.16],[.2,.13],[.025,.12],[.025,.1],[0,.1]],metal,{n:20});}),
  part('retainer-right','Rear bearing retainer, right · 463-357-02-19','The bearing cover that bolts over the right tube end and holds the bearing.',[0,.3,.15],r=>{
    turn(r,[0,.46,0],y,[[0,.1],[0,.24],[.025,.24],[.025,.16],[.2,.16],[.2,.13],[.025,.12],[.025,.1],[0,.1]],metal,{n:20});}),
  part('lock','Grooved-nut lock · 902-357-00-73','The lock plate that keeps the grooved nut on each rear shaft from turning.',[.35,0,0],r=>{
    for(const s of [-1,1]){sleeve(r,[0,s*.7,0],[0,s,0],0,.012,.085,.045,zinc,14);block(r,[0,s*.706,.095],[.03,.012,.03],zinc);}}),
  part('gasket','Tube-end gasket · 902-357-01-80','The gasket between each bearing retainer and the axle tube flange.',[-.35,0,0],r=>{
    for(const s of [-1,1])sleeve(r,[0,s*.445,0],[0,s,0],0,.008,.24,.1,'#7a6a4f',20);}),
  src(part('sensor-ring','Rear ABS sensor ring · 463-357-03-51','A toothed sensor ring listed for the G500 with 2002–2008 fitment; the listing does not give its position, and it is drawn on each rear shaft inboard of the bearing.',[0,0,.55],r=>{
    for(const s of [-1,1])toneRing(r,[0,s*.38,0],[0,s,0],.1,.065,.025,24);}),sensorRings),
  src(part('repair-kit','Rear axle repair kit · 902-350-14-10','A repair kit the rear axle housing page lists for both sides, after the shaft, bearing cover and grooved nut. Its contents are not listed; it is drawn as a ring outboard of the nut.',[0,0,-.55],r=>{
    for(const s of [-1,1])sleeve(r,[0,s*.8,0],[0,s,0],0,.04,.07,.04,'#8b999c',12);}),rearHousing02)
];
const shaftEnds=study('g500-rear-shaft-ends','Rear axle bearings, seals, retainers and sensor rings','At each end of the rear axle the shaft runs in a bearing inside the tube. A retainer over a gasket closes the tube end, a seal keeps the oil in, and a lock holds the grooved nut.',rearAxle02,endRows);
shaftEnds.viewAngle=[-.3,.25];

// Front hub along y, wheel flange outboard at +y.
const hubRows=[
  part('hub','Front wheel hub · 463-330-01-25','The front hub that turns on the two tapered wheel bearings on the steering knuckle and carries the brake disc and wheel.',[0,.35,0],r=>{
    turn(r,[0,0,0],y,[[0,.12],[0,.2],[.3,.2],[.3,.38],[.36,.38],[.36,.14],[.46,.12],[.46,.09]],'#8b999c',{n:24});
    for(let i=0;i<5;i++){const a=i*TAU5;cyl(r,[.28*Math.cos(a),.36,.28*Math.sin(a)],y,0,.1,.018,steel,6);}}),
  src(part('hub-seal','Front hub seal · 015-997-79-47','The seal at the inner end of each front hub, between the hub and the knuckle journal.',[0,-.35,0],r=>sleeve(r,[0,-.04,0],y,0,.04,.19,.12,rubber,20)),hubSeal),
  part('installation-kit','Wheel-bearing installation kit · 463-331-00-44','A kit listed at the wheel-bearing callout of the front hub diagram. Its contents are not listed; it is drawn as a nut and washer at the outer bearing.',[0,.6,.2],r=>{
    sleeve(r,[0,.47,0],y,0,.01,.085,.05,zinc,14);hex(r,[0,.48,0],y,.05,.08,.04);}),
  src(part('abs-ring','Front ABS sensor ring · 463-334-00-15','The toothed sensor ring the front axle carrier diagram lists on each front axle shaft, drawn here inboard of the hub.',[0,-.5,.2],r=>toneRing(r,[0,-.16,0],y,.13,.08,.03,30)),frontCarrier02)
];
const TAU5=2*Math.PI/5;

// Propeller shafts, laid out along x with the transfer case at the origin.
function propShaft(r,a,b,rad,color){
  const d=b[0]-a[0],s=Math.sign(d),len=Math.abs(d),c=a;
  for(const [px,dir] of [[a[0],[s,0,0]],[b[0],[-s,0,0]]]){
    const p=[px,a[1],a[2]];
    turn(r,p,dir,[[0,0],[0,.1],[.02,.1],[.02,.04],[.05,.04],[.05,0]],steel,{n:16});
    block(r,[px+(dir[0])*.08,a[1],a[2]],[.04,.1,.03],metal);block(r,[px+(dir[0])*.08,a[1],a[2]],[.04,.03,.1],metal);
  }
  cyl(r,[c[0]+s*.13,c[1],c[2]],[s,0,0],0,len-.26,rad,color,14);
  sleeve(r,[c[0]+s*.15,c[1],c[2]],[s,0,0],0,.16,rad+.02,rad,dark,14);
}
const propRows=[
  src(part('front-shaft','Front propeller shaft · 463-410-13-02','The shaft from the transfer case forward to the front axle pinion. It replaces 460-410-22-18.',[0,-.35,0],r=>propShaft(r,[-.08,-.2,-.05],[-1,-.2,-.05],.035,'#6c8189')),driveShafts),
  src(part('rear-shaft','Rear propeller shaft · 463-410-11-02','The shaft from the transfer case back to the rear axle pinion. It replaces 460-410-21-18.',[0,.35,0],r=>propShaft(r,[.08,0,0],[1,0,0],.04,steel)),rearProp02),
  src(part('center-shaft','Transmission-to-transfer-case shaft · 463-410-07-02','The short shaft between the transmission output and the transfer-case input.',[0,0,.4],r=>propShaft(r,[-.08,.15,.3],[-.62,.15,.3],.035,metal)),rearProp02),
  src(part('shaft-plate','Drive shaft plate · 463-413-01-84','A plate listed on the 2006 G500 front drive shaft diagram with the shaft bolts and nuts, drawn at the front shaft’s transfer-case flange.',[.2,-.45,-.2],r=>{
    turn(r,[-.05,-.2,-.05],[-1,0,0],[[0,.03],[0,.12],[.012,.12],[.012,.03],[0,.03]],zinc,{n:6,start:Math.PI/6});}),frontShaft06)
];
const propShafts=study('g500-propeller-shafts','Propeller shafts','Three shafts carry drive on the G500: a short one from the five-speed automatic to the transfer case, and one each from the transfer case to the front and rear axles.',rearProp02,propRows);
propShafts.viewAngle=[-.5,.35];

// VG150 E center differential along x: front output toward -x, rear toward +x.
const centerRows=[
  part('pins','Center differential pins · 668-353-00-21','The two cross pins in the differential housing that carry the four bevel gears.',[0,0,.5],r=>{cyl(r,[0,-.2,0],y,0,.4,.022,metal,10);cyl(r,[0,0,-.2],z,0,.4,.022,metal,10);}),
  part('bevel-gears','Center differential bevel gears · 667-353-02-14','The four bevel gears on the cross pins that split torque between the front and rear outputs.',[0,.45,0],r=>{
    for(const d of [y,mirror(y),z,mirror(z)])bevel(r,d.map(v=>v*.15),mirror(d),.07,.05,10,metal);}),
  part('drive-shaft','Transfer-case drive shaft · 463-283-05-05','The shaft the parts list calls the drive shaft in the center differential group, drawn here as the front output side.',[-.4,0,0],r=>{
    cyl(r,[-.12,0,0],[-1,0,0],0,.7,.045,steel,14);bevel(r,[-.16,0,0],x,.12,.05,14,steel);}),
  part('rear-main-shaft','Rear main shaft · 463-283-06-05','The rear main shaft that leads out of the center differential to the rear output flange.',[.4,0,0],r=>{
    cyl(r,[.12,0,0],x,0,.7,.045,steel,14);bevel(r,[.16,0,0],mirror(x),.12,.05,14,steel);}),
  part('front-taper','Center differential taper bearing · 009-981-59-05','A tapered roller bearing in the center differential group, next to the shift collar.',[-.3,-.3,0],r=>taper(r,[-.3,0,0],[-1,0,0],.045,.11,.06)),
  part('rear-taper','Center differential taper bearing · 007-981-14-05','The second tapered roller bearing of the center differential group.',[.3,-.3,0],r=>taper(r,[.3,0,0],x,.045,.11,.06)),
  part('output-flanges','Output flanges · 463-282-01-45','The two flanges, front and rear, that the propeller shafts bolt to.',[0,0,-.45],r=>{
    for(const s of [-1,1])turn(r,[s*.85,0,0],[s,0,0],[[0,.04],[0,.17],[.03,.17],[.03,.07],[.1,.07],[.1,.04],[0,.04]],metal,{n:20});})
];
const centerDiff=study('g500-vg150-center-diff','VG150 E center differential, shafts and output flanges','The center differential of the VG150 E case: four bevel gears on two cross pins between the front and rear shafts, two tapered bearings, and the two output flanges.',vg150e,centerRows);
centerDiff.viewAngle=[-.55,.35];

// Center lock actuator: piston, diaphragm, spring and shift collar along x.
const lockActRows=[
  part('piston','Lock actuator piston · 463-284-00-12','The piston of the vacuum lock actuator in the front-cover group of the case.',[0,0,.4],r=>{sleeve(r,[-.2,0,0],x,0,.04,.26,.05,metal,22);cyl(r,[-.2,0,0],x,-.1,.3,.03,steel,10);}),
  src(part('diaphragm','Lock actuator diaphragm · 463-284-00-94','The flexible partition the vacuum pulls on to move the lock piston. The W463 listing sells it as the transfer-case diaphragm.',[-.35,0,0],r=>sleeve(r,[-.24,0,0],x,0,.012,.32,.05,rubber,24)),gWagenTransfer),
  part('spring','Lock pressure spring · 463-993-02-01','The coil spring that returns the lock piston when the vacuum is released.',[0,.4,0],r=>{
    const pts=[];for(let i=0;i<=48;i++){const a=i*TAU/12;pts.push([-.15+i*.006,.14*Math.cos(a),.14*Math.sin(a)]);}path(r,pts,.01,'#5e7f8a');}),
  part('shift-collar','Center lock shift collar · 463-283-04-23','The splined collar in the center differential group that the lock moves to tie the differential together.',[.4,0,0],r=>{
    turn(r,[.25,0,0],x,[[0,.06],[0,.16],[.03,.16],[.03,.13],[.08,.13],[.08,.16],[.11,.16],[.11,.06],[0,.06]],metal,{n:18});})
];
const lockActuator=study('g500-vg150-lock-actuator','VG150 E lock actuator piston, diaphragm, spring and shift collar','The vacuum actuator for the transfer-case lock: a diaphragm and piston, a return spring, and the splined shift collar in the center differential group.',vg150e,lockActRows);
lockActuator.viewAngle=[-.55,.3];

export const studies=[rangeSet,caseFittings,rearShafts,frontAxleParts,transmissionParts,rearHousing,rearGears,frontGears,lockParts,shaftEnds,propShafts,centerDiff,lockActuator];
export const views=new Map([
  ['g500-center-diff.housing',rangeSet],
  ['g500-center-diff.rear-output',caseFittings],
  ['drivetrain.halfshafts',rearShafts],
  ['g500-front-housing.shafts',frontAxleParts],
  ['g500-transmission.shift-cable',transmissionParts],
  ['g500-rear-diff.carrier',rearHousing],
  ['g500-rear-diff.crown',rearGears],
  ['g500-front-diff.crown',frontGears],
  ['g500-axle-lock.casting',lockParts],
  ['chassis.rear-bearings',shaftEnds],
  ['g500-rear-propeller.tube',propShafts],
  ['g500-front-propeller.tube',propShafts],
  ['g500-input-shaft.spindle',propShafts],
  ['g500-center-diff.spider',centerDiff],
  ['g500-center-lock.housing',lockActuator]
]);

const ids=(s,keys)=>keys.map(k=>s.id+'.'+k);
const vgNeed='The list is a transfer-case specialist’s parts table for the VG150 E family, not a G500 VIN lookup. Confirm each number against the case number on the housing (463-280-20-00 on the G500) or a VIN-based EPC. Shaft, gear and bearing sizes are unmeasured; the geometry is schematic.';
export const claims=[
  {ids:ids(rangeSet,rangeRows.map(p=>p.id)),kind:'diagram',
   fact:'The VG150 E parts list gives these numbers for the main shaft, the front and rear range gears and their bearings, the synchronizer cones, springs and ring, the sliding collar, washers, spacers and main-shaft bearings.',need:vgNeed,source:vg150e},
  {ids:ids(caseFittings,['countershaft','countershaft-bearing','retaining-ring','oil-baffles','oil-tube','front-shift-rod','front-shift-fork','rod-bushings','range-rod','range-fork','fork-bearings','shifter-shaft','motor-bracket','earthing-strap']),kind:'diagram',
   fact:'The VG150 E parts list gives these numbers for the countershaft and its bearing and retaining ring, the oil baffles and tube, the two shift rods and forks, the fork bearings, the shifter shaft, a case bracket and the earthing strap.',need:vgNeed+' Which fork is the range fork and which serves the lock is read from the diagram grouping and is unconfirmed.',source:vg150e},
  {ids:ids(caseFittings,['actuator-motor']),kind:'diagram',
   fact:'The G500 4WD actuator listing gives motor 463-540-00-88 for 2002–2008 G500. The 2006 G500 transfer-case page and the VG150 E list give the same motor.',need:'Measure the motor body, its flange and the connector position on the fitted case.',source:g500Actuator},
  {ids:ids(caseFittings,['input-flange','flange-nut','twist-seals','deflector','cover-o-ring','screw-plugs']),kind:'diagram',
   fact:'The VG150 E parts list gives the main-shaft flange and nut, the twist-lip seals for case 463-280-20-00, the deflector, the front-cover O-ring and the two plugs.',need:vgNeed,source:vg150e},
  {ids:ids(caseFittings,['flange-seals']),kind:'diagram',
   fact:'The listing gives sealing ring 015-997-08-47-64 (replacing 015-997-08-47) as the output shaft seal for 2002–2008 G500. The VG150 E list shows the same ring in three positions.',need:'Check which seal (this ring or the twist-lip pair) the fitted case uses, and measure the seal bore.',source:outputSeal},
  {ids:ids(caseFittings,['flange-bolts','front-mount','left-rear-mount','right-rear-mount']),kind:'diagram',
   fact:'The W463 transmission and transfer-case listing gives the propeller-shaft flange bolt and the front, left rear and right rear transfer-case mounts for the 463.',need:'Confirm the mounts against the G500 VIN and measure the rubber height and bolt pattern on the crossmember.',source:gWagenTransfer},
  {ids:ids(rearShafts,['left-shaft','right-shaft']),kind:'diagram',
   fact:'The G500 axle-shaft listing gives rear shafts 902-357-08-01 left and 463-357-10-01 right for 2002–2003, and 902-357-13-01 left and 463-357-17-01 right for 2002–2008.',need:'Check which pair the vehicle carries and measure the shaft length, spline count and flange diameter.',source:axleShafts},
  {ids:ids(rearShafts,['left-nut','right-nut']),kind:'diagram',
   fact:'The G500 spindle-nut listing gives grooved nuts 902-357-01-26 driver side and 902-357-02-26 passenger side for 2002–2008 G500.',need:'Measure the nut across-flats and slot count; the thread hand per side is unconfirmed.',source:axleNuts},
  {ids:ids(frontAxleParts,['companion-flange','pinion-nut']),kind:'diagram',
   fact:'The 2002 G500 front axle diagram lists companion flange 460-350-05-45 at callout 18 and nut 601-351-01-72 at callout 19. The 2002 page gives 464-350-32-00 as the flange replacement.',need:'Measure the flange diameter, bolt circle and nut across-flats on the fitted axle.',source:frontAxle},
  {ids:ids(frontAxleParts,['shaft-bearing']),kind:'diagram',
   fact:'The G500 axle parts listing gives Genuine Mercedes axle shaft bearing 463-337-00-49 for the front axle of the G500 and G55 AMG.',need:'Confirm the bearing position in the knuckle against a G500 diagram and measure its bore and width.',source:fcpAxle},
  {ids:ids(transmissionParts,['shift-rod-bushing']),kind:'diagram',
   fact:'The W463 transmission listing gives shift rod bushing 202-992-00-10 for the G500.',need:'Confirm where the bushing sits on the G500 selector linkage and measure its bore.',source:gWagenTransfer},
  {ids:ids(transmissionParts,['lower-hose']),kind:'diagram',
   fact:'The W463 transmission listing gives lower transmission cooler hose 019-997-72-82 for the G500.',need:'Confirm the hose position in the cooler line and measure its length and end fittings.',source:gWagenTransfer},
  {ids:ids(transmissionParts,['case-connector']),kind:'diagram',
   fact:'The G500 automatic transmission parts category lists transmission connector 203-540-02-53, the 722.6 case plug.',need:'The listing names other 722.6 cars and does not show G500 fitment; confirm the number by VIN and measure the connector body and pin layout.',source:fcpTransmission},
  // Round 2
  {ids:ids(rearHousing,['housing','pinion-seal']),kind:'diagram',
   fact:'The 2002 G500 rear axle diagram lists axle housing 463-350-02-03 at callout 1 and pinion seal 013-997-18-47 at callout 22, both for the G500 and G55 AMG.',need:'Measure the bowl, tube length and pinion-nose bore on the fitted axle; the geometry is schematic.',source:rearAxle02},
  {ids:ids(rearHousing,['side-bearings','outer-pinion-bearing']),kind:'diagram',
   fact:'The G500 pinion bearing listing gives side bearing 000-980-19-02 and outer pinion bearing 007-981-53-05 for 2002–2008 G500. The 2002 rear axle diagram lists them at callouts 12 and 21; the front axle diagram lists the same side bearing.',need:'Measure bearing bore, outside diameter and width; the outer bearing position at the flange end follows the diagram callout order.',source:pinionBearings},
  {ids:ids(rearHousing,['pinion-spacer']),kind:'diagram',
   fact:'The 2008 G500 rear axle diagram gives two pinion spacers at callout 20: 108-353-00-42 (32 × 16 mm) and 639-353-00-53 (34 × 21 mm).',need:'Which spacer a given axle carries depends on its pinion; confirm by axle number. The 2002 page lists only the smaller spacer.',source:rearAxle08},
  {ids:ids(rearGears,['ring-pinion','cross-shaft','pinion-gears']),kind:'diagram',
   fact:'The G500 ring and pinion listing gives ring and pinion 904-350-00-39, pinion shaft 601-350-05-26 and pinion gear 107-353-00-14 for 2002–2008 G500. The 2002 rear axle diagram lists them at callouts 18, 14 and 16.',need:'Confirm the ratio and tooth counts on the fitted axle; tooth counts drawn here are schematic.',source:ringPinion},
  {ids:ids(rearGears,['case','thrust-washers']),kind:'diagram',
   fact:'The 2002 G500 rear axle diagram lists differential case 901-350-00-23 at callout 11 and thrust washer 668-353-00-24 at callout 17. The VG150 E list gives the same washer as the rounded washer of the center differential.',need:'Measure the case and washer radius; the case outline is schematic.',source:rearAxle02},
  {ids:ids(frontGears,['ring-pinion']),kind:'diagram',
   fact:'The G500 ring and pinion listing gives ring and pinion 461-330-03-39 (replacing 461-330-01-39) for 2002–2008 G500, and the 2002 front axle diagram lists it at callout 13.',need:'Confirm the ratio and tooth counts on the fitted front axle.',source:ringPinion},
  {ids:ids(frontGears,['case','gear-kit']),kind:'diagram',
   fact:'The 2002 G500 front axle diagram lists differential case 463-330-07-23 at callout 7 and gear kit 668-350-00-26 at callout 12.',need:'The kit contents are inferred from its callout among the differential gears; confirm what the kit holds and measure the case.',source:frontAxle02},
  {ids:ids(lockParts,['cylinder','switch','repair-package']),kind:'diagram',
   fact:'The 2002 G500 rear axle diagram lists the differential-lock switch 000-545-05-64-64 and cylinder 463-330-00-54 at callouts 25 and 26 and repair package 460-350-07-84 at callout 29; the front axle diagram lists the same three at callouts 20, 21 and 24. The VG150 E list gives pressure switch 000-545-05-64.',need:'The repair package contents are not listed. Measure the cylinder body and switch thread on the fitted axle.',source:rearAxle02},
  {ids:ids(shaftEnds,['bearings','seals']),kind:'diagram',
   fact:'The G500 axle parts listing gives Genuine Mercedes rear axle shaft bearing 017-981-46-05 and rear shaft seal 902-997-02-46. The 2002 G500 rear axle diagram lists them at callouts 7 and 6.',need:'Measure bearing bore, outside diameter and width and the seal section at the tube end.',source:fcpAxle},
  {ids:ids(shaftEnds,['retainer-left','retainer-right','lock','gasket']),kind:'diagram',
   fact:'The 2002 G500 rear axle diagram lists bearing retainers 463-357-01-19 left and 463-357-02-19 right at callout 5, lock 902-357-00-73 at callout 8 and gasket 902-357-01-80 at callout 10.',need:'Measure the retainer flange, bolt circle and gasket on the fitted tube ends.',source:rearAxle02},
  {ids:ids(shaftEnds,['sensor-ring']),kind:'diagram',
   fact:'The G500 ABS sensor ring listing gives sensor (spacer) ring 463-357-03-51 for 2002–2008 G500, beside front ring 463-334-00-15.',need:'The listing gives no position; that it is the rear ring is inferred from its 463-357 rear-axle-shaft group. Confirm its seat and tooth count.',source:sensorRings},
  {ids:ids(shaftEnds,['repair-kit']),kind:'diagram',
   fact:'The 2002 G500 rear axle housing diagram lists repair kit 902-350-14-10 at callout 9 for both sides.',need:'The kit contents are not listed; confirm what it holds before drawing it as anything more than a placeholder ring.',source:rearHousing02},
  {ids:ids(propShafts,['front-shaft']),kind:'diagram',
   fact:'The G500 drive shaft listing gives 463-410-13-02 (replacing 460-410-22-18) for 2002–2008 G500, and the 2006 front drive shaft diagram lists it as the shaft to the front axle.',need:'Measure the shaft length, tube diameter and joint sizes; the joints are drawn schematically.',source:driveShafts},
  {ids:ids(propShafts,['rear-shaft','center-shaft']),kind:'diagram',
   fact:'The 2002 G500 rear propeller shaft page lists drive shaft 463-410-11-02 "Transfer Case To Axle" and 463-410-07-02 "Transmission To Transfer Case".',need:'Measure both shafts and their joints on the vehicle.',source:rearProp02},
  {ids:ids(propShafts,['shaft-plate']),kind:'diagram',
   fact:'The 2006 G500 front drive shaft diagram lists drive shaft plate 463-413-01-84 at callout 4, between the shaft bolt and nut callouts.',need:'The page gives no notes for the plate; confirm where it sits on the 2002 vehicle and measure it.',source:frontShaft06},
  {ids:ids(centerDiff,centerRows.map(p=>p.id)),kind:'diagram',
   fact:'The VG150 E parts list gives differential pins 668-353-00-21, bevel gears 667-353-02-14 (four), drive shaft 463-283-05-05, rear main shaft 463-283-06-05, taper bearings 009-981-59-05 and 007-981-14-05 and two flanges 463-282-01-45 in its center differential and output groups.',need:vgNeed+' The G500 transfer-case pages list only the motor, output seal and case 463-280-20-00. Which shaft carries the front output and where each bearing sits are read from the callout order and are unconfirmed.',source:vg150e},
  {ids:ids(lockActuator,['piston','spring','shift-collar']),kind:'diagram',
   fact:'The VG150 E parts list gives piston 463-284-00-12 and pressure spring 463-993-02-01 in the front-cover actuator group and shift collar 463-283-04-23 in the center differential group.',need:vgNeed+' That these parts form the vacuum lock actuator is read from the diagram grouping.',source:vg150e},
  {ids:ids(lockActuator,['diaphragm']),kind:'diagram',
   fact:'The W463 transmission and transfer-case listing sells 463-284-00-94 as the transfer case diaphragm; the VG150 E list gives the same number as the partition in the actuator group.',need:'Confirm against the G500 VIN and measure the diaphragm diameter.',source:gWagenTransfer}
];
