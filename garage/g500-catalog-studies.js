// Studies built straight from G500 catalog diagrams. Each part is one Mercedes
// number from the cited diagram; parts the register already models elsewhere
// (evaporator, heater core, blower motor, expansion valve, gears, carrier
// bearings, lock cylinder) are left out.
import {TAU,metal,steel,dark,gold,copper,turn,cyl,sleeve,gear,part,study,x,y,z} from './mechanism-shapes.js';
import {getRoadDetail} from './road-mechanisms.js';

const hvacPlate={label:'MB Parts Giant · 2004 G500 evaporator and heater components diagram',url:'https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/a-c-heating/blower-motor-fan-air-condition'};
const frontAxlePlate={label:'MB Parts Giant · 2003 G500 front axle shafts and differential diagram',url:'https://www.mbpartsgiant.com/parts-list/2003-mercedes_benz-g500/driveline-axles/front-axle-shafts-differential'};
const transmissionPlate={label:'MB Parts Giant · 2004 G500 automatic transmission diagram',url:'https://mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/transmission/automatic-transmission-transmission'};
const controlPlate={label:'MB Parts Giant · 2004 G500 electrical components diagram',url:'https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/electrical/electrical-components'};
const brakePlate={label:'MB Parts Giant · 2005 G500 brake hydraulic system diagram',url:'https://mbpartsgiant.com/parts-list/2005-mercedes_benz-g500/brakes/hydraulic-system'};
const absPlate={label:'MB Parts Giant · 2003 G500 ABS components diagram',url:'https://www.mbpartsgiant.com/parts-list/2003-mercedes_benz-g500/electrical/abs-components-electrical'};
export const catalogStudySources={hvacPlate,frontAxlePlate,transmissionPlate,controlPlate,brakePlate,absPlate};

const plastic='#3a3f42',foam='#55524a',rubber='#26292b',grey='#8f9a9c';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const frame=(r,c,s,t,color)=>{const [w,,h]=s;
  block(r,[c[0],c[1],c[2]+h/2],[w,s[1],t],color);block(r,[c[0],c[1],c[2]-h/2],[w,s[1],t],color);
  block(r,[c[0]-w/2,c[1],c[2]],[t,s[1],h],color);block(r,[c[0]+w/2,c[1],c[2]],[t,s[1],h],color);};
const tube=(r,a,b,rad,color)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,10);};

// Heater and A/C module, laid out left to right as it sits behind the dash,
// with the fresh-air box from the cowl above it.
const hvacRows=[
  ['air-distributor','Air distributor · 203-830-01-03','The upper housing that splits air between the defrost, face and footwell outlets.',[0,0,.45],r=>{block(r,[0,0,.42],[.9,.42,.22],grey);for(const dx of [-.3,0,.3])block(r,[dx,0,.56],[.16,.2,.06],grey);}],
  ['distributor-seal','Air distributor seal · 203-835-06-98','Foam seal between the distributor and the heater housing.',[0,0,.25],r=>frame(r,[0,0,.3],[.9,.42,0],.03,foam)],
  ['lower-duct-right','Lower air duct, passenger side · 203-830-08-40','Feeds the passenger footwell outlet.',[.35,-.2,-.2],r=>{block(r,[.55,-.05,-.12],[.22,.18,.32],plastic);block(r,[.7,-.05,-.3],[.18,.18,.08],plastic);}],
  ['lower-duct-left','Lower air duct, driver side · 203-830-07-40','Feeds the driver footwell outlet.',[-.35,-.2,-.2],r=>{block(r,[-.55,-.05,-.12],[.22,.18,.32],plastic);block(r,[-.7,-.05,-.3],[.18,.18,.08],plastic);}],
  ['actuator-right','Flap actuator, passenger side · 203-830-01-40','Drives the passenger-side air-mix flap.',[.3,-.35,.1],r=>{block(r,[.5,-.25,.15],[.1,.06,.1],dark);cyl(r,[.5,-.22,.15],y,0,.04,.025,metal,10);}],
  ['actuator-left','Flap actuator, driver side · 203-830-02-40','Drives the driver-side air-mix flap.',[-.3,-.35,.1],r=>{block(r,[-.5,-.25,.15],[.1,.06,.1],dark);cyl(r,[-.5,-.22,.15],y,0,.04,.025,metal,10);}],
  ['rear-seal','Rear housing seal · 203-835-14-98','Seals the back of the housing against the firewall.',[0,.35,0],r=>frame(r,[0,.23,.05],[.8,0,.42],.03,foam)],
  ['inner-bracket','Inner housing bracket · 463-830-03-14','Holds the inboard end of the module to the dash crossmember.',[-.2,.3,.25],r=>{block(r,[-.25,.15,.3],[.04,.2,.12],steel);block(r,[-.25,.25,.38],[.12,.04,.04],steel);}],
  ['outer-bracket','Outer housing bracket · 463-830-07-14','Holds the outboard end of the module.',[.25,.3,.25],r=>{block(r,[.4,.15,.3],[.04,.2,.12],steel);block(r,[.4,.25,.38],[.12,.04,.04],steel);}],
  ['stay','Module stay · 463-689-03-42','A strut from the housing to the dash support.',[.1,.4,-.2],r=>tube(r,[.1,.2,-.15],[.35,.32,.25],.018,steel)],
  ['core-seal','Heater core seal · 203-835-03-98','Seals the heater core in its housing slot.',[.15,-.35,-.25],r=>frame(r,[.15,-.12,-.05],[.36,0,.3],.025,foam)],
  ['temperature-sensor','Evaporator temperature sensor · 220-830-07-72','Measures the evaporator outlet air so the compressor can avoid icing.',[-.15,-.4,-.05],r=>{cyl(r,[-.15,-.13,.02],y,-.08,0,.012,dark,8);block(r,[-.15,-.06,.02],[.04,.04,.04],plastic);}],
  ['blower-cover','Blower cover · 203-830-26-03','Closes the blower opening under the dash.',[-.35,0,-.45],r=>turn(r,[-.35,0,-.32],z,[[0,0],[0,.16],[.03,.16],[.04,.12],[.04,0]],plastic,{n:20})],
  ['switch','Climate switch · 230-821-64-51','The switch listed with the module wiring.',[.2,-.45,.35],r=>block(r,[.15,-.2,.3],[.06,.03,.04],dark)],
  ['drain-right','Condensate drain hose, passenger side · 463-832-03-90','Carries water from the evaporator tray through the floor.',[.2,0,-.45],r=>tube(r,[.2,.05,-.2],[.25,.1,-.5],.015,rubber)],
  ['drain-left','Condensate drain hose, driver side · 463-832-08-90','The driver-side evaporator drain.',[-.15,0,-.45],r=>tube(r,[-.1,.05,-.2],[-.15,.1,-.5],.015,rubber)],
  ['intake-right','Fresh-air intake tube, passenger side · 463-832-07-90','Brings fresh air from the cowl box down to the module.',[.35,.3,.4],r=>tube(r,[.3,.1,.55],[.3,.1,.9],.06,plastic)],
  ['intake-left','Fresh-air intake tube, driver side · 463-832-04-90','The driver-side fresh-air tube.',[-.35,.3,.4],r=>tube(r,[-.3,.1,.55],[-.3,.1,.9],.06,plastic)],
  ['air-box','Fresh-air box · 463-830-00-23','The cowl plenum that collects outside air under the windshield.',[0,.2,.75],r=>block(r,[0,.1,1.0],[.9,.3,.14],plastic)],
  ['air-box-upper-seal','Air box upper seal · 463-837-01-98','Seals the top of the air box against the cowl panel.',[0,.15,1.0],r=>frame(r,[0,.1,1.075],[.9,.3,0],.02,foam)],
  ['air-box-lower-seal','Air box lower seal · 463-837-02-98','Seals the air box to the module intakes.',[0,.15,.55],r=>frame(r,[0,.1,.925],[.9,.3,0],.02,foam)],
  ['air-box-insulator','Air box insulator · 201-504-01-12','Damping pad on the air box.',[0,.5,.85],r=>block(r,[0,.27,1.0],[.7,.03,.1],foam)],
  ['grille','Air intake grille · 463-830-00-18','The grille over the fresh-air inlet in the cowl.',[0,.1,1.25],r=>{for(let i=0;i<9;i++)block(r,[-.36+i*.09,.1,1.12],[.02,.26,.02],dark);}],
  ['cover','Air intake cover · 463-831-00-38','Cover over the intake opening.',[0,-.2,1.3],r=>block(r,[0,-.08,1.12],[.8,.06,.02],plastic)]
];
const hvacModule=study('g500-hvac-module','Heater and A/C module','The module behind the dash: distributor, footwell ducts, actuators, seals and brackets, with the cowl fresh-air box above it.',hvacPlate,
  hvacRows.map(([id,name,desc,offset,draw])=>part(id,name,desc,offset,draw)));
hvacModule.viewAngle=[-.55,.3];

// Front pinion: the bearings, spacer and seal that set pinion preload.
const taper=(r,c,a,inner,outer,width,color)=>{
  sleeve(r,c,a,0,width,inner+.02,inner,metal,18);
  turn(r,c,a,[[0,outer-.02],[0,outer],[width,outer],[width,outer-.035],[0,outer-.02]],color,{n:18});
  for(let i=0;i<12;i++){const t=TAU*i/12,p=[c[0],c[1]+Math.cos(t)*(inner+outer)/2,c[2]+Math.sin(t)*(inner+outer)/2];cyl(r,p,a,.005,width-.005,.013,steel,6);}
};
const pinionRows=[
  part('inner-bearing','Inner pinion bearing · 001-980-69-02','The larger tapered bearing behind the pinion head.',[.25,0,.3],r=>taper(r,[.2,0,0],x,.08,.17,.07,gold)),
  part('outer-bearing','Outer pinion bearing · 002-980-11-02','The smaller tapered bearing near the flange.',[-.25,0,.3],r=>taper(r,[-.3,0,0],x,.06,.13,.06,gold)),
  part('spacer','Pinion spacer · 108-353-00-42','The spacer between the two bearings sets their preload.',[0,0,.45],r=>sleeve(r,[-.22,0,0],x,0,.4,.075,.062,copper,18)),
  part('seal','Pinion seal · 017-997-55-47','The radial seal where the pinion leaves the housing.',[-.45,0,-.2],r=>sleeve(r,[-.4,0,0],x,0,.03,.12,.07,dark,20)),
  part('thrust-washer','Pinion thrust washer · 140-353-01-24','A hardened washer at the pinion shoulder.',[.45,0,-.25],r=>sleeve(r,[.29,0,0],x,0,.012,.12,.08,metal,20))
];
const frontPinion=study('g500-front-pinion','Front pinion bearings and seal','Two tapered roller bearings carry the front pinion. A spacer between them sets the preload and a seal closes the nose.',frontAxlePlate,pinionRows);
frontPinion.viewAngle=[-.6,.3];

// Front axle housing, cover and lock linkage.
const housingRows=[
  part('housing','Front axle housing · 463-330-42-05','The rigid housing that carries the differential and both axle shafts.',[0,0,-.35],r=>{
    turn(r,[0,0,0],y,[[-.22,0],[-.22,.2],[-.12,.3],[.12,.3],[.22,.2],[.22,0]],grey,{n:22});
    for(const s of [-1,1])cyl(r,[s*.2,0,0],x,0,s*.75,.09,grey,14);
  }),
  part('cover','Axle housing cover · 463-330-00-21-40','The cover that closes the back of the differential housing.',[0,.45,0],r=>turn(r,[0,.23,0],y,[[0,0],[0,.27],[.03,.27],[.07,.2],[.08,0]],grey,{n:22})),
  part('cover-gasket','Cover gasket · 601-351-00-80','Seals the cover to the housing.',[0,.3,.2],r=>sleeve(r,[0,.22,0],y,0,.01,.27,.22,foam,22)),
  part('shaft-seals','Axle shaft seals · 009-997-28-47','One radial seal at each end of the housing where the shafts leave it.',[0,-.3,.3],r=>{for(const s of [-1,1])sleeve(r,[s*.95,0,0],x,0,.03,.1,.06,dark,16);}),
  part('bearing-spacer','Side-bearing spacer · 601-353-61-52','Sets the side-bearing position in the housing.',[.3,-.3,.2],r=>sleeve(r,[.26,0,0],x,0,.02,.14,.1,metal,18)),
  part('shafts','Front axle shafts, left and right · 463-330-28-01, 463-330-29-01','The shafts run from the side gears out to the steering knuckles.',[0,0,.45],r=>{for(const s of [-1,1]){cyl(r,[s*.12,0,0],x,0,s*1.05,.035,steel,10);turn(r,[s*1.1,0,0],x,[[0,0],[0,.08],[s*.08,.08],[s*.08,0]],steel,{n:14});}}),
  part('boots','Axle shaft boots · 460-337-04-85-64','Boots over the outer joints at the knuckles.',[0,0,.65],r=>{for(const s of [-1,1])turn(r,[s*.98,0,0],x,[[0,.04],[0,.07],[s*.04,.1],[s*.08,.07],[s*.12,.1],[s*.14,.06],[s*.14,.04]],rubber,{n:14});}),
  part('lock-lever','Front axle lock lever · 461-335-00-32','Transfers the lock cylinder’s stroke to the shift shaft.',[-.25,-.4,.35],r=>block(r,[-.15,-.18,.2],[.04,.04,.18],steel)),
  part('lock-shaft','Front axle lock shift shaft · 460-353-01-35','Moves the lock sleeve in and out of engagement.',[-.4,-.35,.15],r=>cyl(r,[-.15,-.18,.12],x,0,-.4,.015,metal,8)),
  part('lock-flange','Front axle lock flange · 460-353-06-45-64','The flange the lock sleeve engages beside the carrier.',[-.45,0,-.3],r=>sleeve(r,[-.3,0,0],x,0,.03,.12,.05,steel,18))
];
const frontHousing=study('g500-front-housing','Front axle housing, shafts and lock linkage','The housing, cover and seals around the front differential, the two axle shafts and the levers that work the lock.',frontAxlePlate,housingRows);
frontHousing.viewAngle=[-.55,.3];


// The 722.6 with the parts the G500 diagram lists around it. The gear sets
// open into the shared planetary study.
const transRows=[
  {...part('gearsets','Planetary gear sets, inside transmission 463-270-41-01-80','Three planetary sets inside the case give the five forward ratios. Open them to see how a planetary set works.',[0,0,.45],r=>{
    for(const [px,rad] of [[-.1,.2],[.15,.21],[.4,.2]]){sleeve(r,[px,0,0],x,0,.12,rad,rad-.05,steel,22);cyl(r,[px+.02,0,0],x,0,.08,.06,gold,14);}
  }),source:transmissionPlate},
  {...part('converter','Torque converter · 140-250-06-02-80','The fluid coupling between the engine and the transmission input, with a lock-up clutch.',[-.45,0,0],r=>
    turn(r,[-.6,0,0],x,[[0,.05],[0,.26],[.04,.33],[.14,.34],[.24,.3],[.28,.18],[.28,.05],[0,.05]],'#9aa7a9',{n:26})),source:transmissionPlate},
  {...part('drive-plate','Drive plate · 628-030-00-12','The flexible plate bolts to the crankshaft and carries the converter and starter ring gear.',[-.75,0,0],r=>{
    sleeve(r,[-.68,0,0],x,0,.012,.3,.05,metal,26);gear(r,[-.68,0,0],x,0,.014,.34,.34,48,dark,0,.88);}),source:transmissionPlate},
  {...part('extension-seal','Extension housing seal · 015-997-12-46','The radial seal where the output shaft leaves the tail of the case.',[.45,0,0],r=>sleeve(r,[.62,0,0],x,0,.03,.08,.045,dark,18)),source:transmissionPlate},
  {...part('shift-cable','Shift control cable · 210-267-04-64','Links the steering lock to the shifter so the key cannot come out unless the selector is in Park.',[0,-.45,.2],r=>{
    const pts=[[.1,-.25,.25],[0,-.3,.4],[-.2,-.3,.55],[-.45,-.25,.65]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=b.map((v,k)=>v-a[k]);cyl(r,a,d,0,Math.hypot(...d),.012,'#26292b',8);}}),source:transmissionPlate},
  {...part('control-upper-bracket','Transmission control module upper bracket · 463-545-28-47','Holds the top of the transmission control module.',[.2,.45,.3],r=>{r.box(.05,.3,.3,.25,.32,.36,steel);r.box(.05,.3,.36,.08,.36,.4,steel);}),source:controlPlate},
  {...part('control-lower-bracket','Transmission control module lower bracket · 463-540-51-73','The tray bracket under the transmission control module.',[.2,.45,-.1],r=>{r.box(.0,.28,.12,.3,.38,.14,steel);r.box(.0,.36,.12,.3,.38,.24,steel);}),source:controlPlate}
];
const transmission=study('g500-transmission','722.6 automatic transmission and attached parts','The five-speed automatic with the parts the G500 diagram lists around it: torque converter, drive plate, tail seal, shift-lock cable and control-module brackets.',transmissionPlate,transRows);
transmission.viewAngle=[-.6,.3];


// Service parts around the master cylinder and the ABS unit.
const brakeRows=[
  part('reservoir-cap','Brake reservoir cap · 202-430-00-14-64','The vented screw cap with the fluid-level contact.',[0,0,.4],r=>turn(r,[0,0,.25],z,[[0,0],[0,.09],[.06,.09],[.08,.07],[.08,0]],dark,{n:20})),
  part('strainer','Reservoir strainer · 000-431-43-34-64','A mesh basket in the filler neck that catches debris when the reservoir is topped up.',[0,0,.15],r=>{sleeve(r,[0,0,.05],z,0,.16,.065,.058,'#8f9a9c',16);cyl(r,[0,0,.04],z,0,.012,.065,'#8f9a9c',16);}),
  part('booster-gasket','Brake booster gasket · 000-431-23-80','Seals the booster to the firewall.',[-.35,0,0],r=>sleeve(r,[-.3,0,-.2],x,0,.012,.2,.12,rubber,24))
];
const brakeService=study('g500-brake-service','Master cylinder service parts','The cap, strainer and booster gasket the G500 brake diagram lists with the master cylinder and booster.',brakePlate,brakeRows);
brakeService.viewAngle=[-.6,.3];
const absRows=[
  part('pump-bracket','ABS hydraulic unit bracket · 210-431-01-40','The bracket that carries the hydraulic unit on the body.',[0,0,-.35],r=>{r.box(-.25,-.15,-.2,.25,.15,-.18,steel);r.box(-.25,.13,-.2,.25,.15,.05,steel);}),
  part('pump-buffers','Hydraulic unit rubber buffers · 604-094-00-85','Rubber isolators between the hydraulic unit and its bracket.',[0,-.35,-.1],r=>{for(const [bx,by] of [[-.15,-.08],[.15,-.08],[0,.08]])cyl(r,[bx,by,-.18],z,0,.05,.03,rubber,12);}),
  part('module-bracket','ABS control module bracket · 463-540-55-73','The bracket that holds the ABS control module.',[.4,0,.2],r=>{r.box(.3,-.12,0,.32,.12,.2,steel);r.box(.3,-.12,0,.45,.12,.02,steel);})
];
const absMount=study('g500-abs-mounting','ABS unit mounting','The bracket, rubber buffers and control-module bracket that the G500 ABS diagram lists with the hydraulic unit.',absPlate,absRows);
absMount.viewAngle=[-.6,.3];

const views=new Map([['g500-brake-hydraulics.cylinder',brakeService],['g500-abs-electrical.block',absMount],['powertrain.transmission',transmission],['drivetrain.gearbox',transmission],['hvac.case',hvacModule],['g500-front-diff.pinion',frontPinion],['g500-front-diff.carrier',frontHousing]]);
export const g500CatalogStudies=[hvacModule,frontPinion,frontHousing,transmission,brakeService,absMount];
export function getG500CatalogStudy(vehicle,id){
  if(vehicle!=='g500')return null;
  if(id==='g500-transmission.gearsets')return getRoadDetail('f350','drivetrain.gearbox');
  return views.get(id)||null;
}
