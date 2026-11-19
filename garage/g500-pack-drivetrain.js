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
import {metal,steel,dark,gold,copper,turn,cyl,sleeve,gear,part,study,x,y,z} from './mechanism-shapes.js';

const ref=(label,url)=>({label,url});
const vg150e=ref('awd.tech · VG150 E transfer case parts list, G-Class (cases 463-280-17-00 and 463-280-20-00)','https://awd.tech/apps/catalog/transmission/vg150%20e-mercedes-benz');
const g500Transfer=ref('MB Parts Giant · 2006 G500 transfer case page: motor 463-540-00-88, output shaft seal 015-997-08-47-64, case 463-280-20-00','https://www.mbpartsgiant.com/parts-list/2006-mercedes_benz-g500/transmission/transfer-case');
const g500Actuator=ref('MB Parts Giant · G500 4WD actuator 463-540-00-88, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-4wd_actuator');
const outputSeal=ref('MB Parts Giant · sealing ring 015-997-08-47-64, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-transfer_case_pinion_shaft_seals');
const gWagenTransfer=ref('Expedition Imports · W463 transmission and transfer-case parts','https://expedition-imports.com/g-wagon-parts/w463-g-class/transmission-and-transfer-case');
const axleShafts=ref('MB Parts Giant · G500 axle shafts, 2002–2008 G500 fitment','https://mbpartsgiant.com/oem-mercedes_benz-g500-axle_shaft');
const axleNuts=ref('MB Parts Giant · G500 grooved axle nuts, 2002–2008 G500 fitment','https://mbpartsgiant.com/oem-mercedes_benz-g500-spindle_nut');
const frontAxle=ref('MB Parts Giant · 2006 G500 front axle shafts and differential diagram','https://mbpartsgiant.com/parts-list/2006-mercedes_benz-g500/driveline-axles/front-axle-shafts-differential');
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

export const studies=[rangeSet,caseFittings,rearShafts,frontAxleParts,transmissionParts];
export const views=new Map([
  ['g500-center-diff.housing',rangeSet],
  ['g500-center-diff.rear-output',caseFittings],
  ['drivetrain.halfshafts',rearShafts],
  ['g500-front-housing.shafts',frontAxleParts],
  ['g500-transmission.shift-cable',transmissionParts]
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
   fact:'The 2006 G500 front axle diagram lists companion flange 460-350-05-45 at callout 18 and nut 601-351-01-72 at callout 19. The 2002 page gives 464-350-32-00 as the flange replacement.',need:'Measure the flange diameter, bolt circle and nut across-flats on the fitted axle.',source:frontAxle},
  {ids:ids(frontAxleParts,['shaft-bearing']),kind:'diagram',
   fact:'The G500 axle parts listing gives Genuine Mercedes axle shaft bearing 463-337-00-49 for the front axle of the G500 and G55 AMG.',need:'Confirm the bearing position in the knuckle against a G500 diagram and measure its bore and width.',source:fcpAxle},
  {ids:ids(transmissionParts,['shift-rod-bushing']),kind:'diagram',
   fact:'The W463 transmission listing gives shift rod bushing 202-992-00-10 for the G500.',need:'Confirm where the bushing sits on the G500 selector linkage and measure its bore.',source:gWagenTransfer},
  {ids:ids(transmissionParts,['lower-hose']),kind:'diagram',
   fact:'The W463 transmission listing gives lower transmission cooler hose 019-997-72-82 for the G500.',need:'Confirm the hose position in the cooler line and measure its length and end fittings.',source:gWagenTransfer},
  {ids:ids(transmissionParts,['case-connector']),kind:'diagram',
   fact:'The G500 automatic transmission parts category lists transmission connector 203-540-02-53, the 722.6 case plug.',need:'The listing names other 722.6 cars and does not show G500 fitment; confirm the number by VIN and measure the connector body and pin layout.',source:fcpTransmission}
];
