// G500 study pack: cooling.
// Cooling and climate: radiator, fan, hoses, thermostat, coolant pumps and tank fittings, A/C lines, compressor, climate sensors and controls.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
//
// Parts the register already models, even generically, are left out: the radiator core, the
// fan blade, viscous clutch and shroud, the radiator, bypass and heater hoses, the expansion
// tank body, the thermostat and its seal, the coolant and heater pumps, the water-pump gasket
// and pulley, the condenser, receiver-drier, compressor, expansion valve, the refrigerant
// lines, the transmission cooler and its pipes, and the climate control head.
import {metal,steel,dark,gold,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const radiatorPlate={label:'MB Parts Giant · 2007 G500 radiator and components diagram (coolant pipe listing)',url:'https://mbpartsgiant.com/oem-2007-mercedes_benz-g500-coolant_pipe'};
const insulatorPlate={label:'MB Parts Giant · G500 coolant reservoir hose listing, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-coolant_reservoir_hose'};
const bracketPlate={label:'MB Parts Giant · G500 cooling fan bracket listing, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-cooling_fan_bracket'};
const supportPlate={label:'MB Parts Giant · 2005 G500 radiator support diagram',url:'https://www.mbpartsgiant.com/parts-list/2005-mercedes_benz-g500/body-hardware/radiator-support'};
const acPlate={label:'MB Parts Giant · 2004 G500 A/C condenser, compressor and lines diagram (switches and sensors page)',url:'https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/a-c-heating/switches-sensors'};
const cutOutPlate={label:'MB Parts Giant · G500 A/C compressor cut-out switch listing, G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_compressor_cut_out_switches'};
const serviceCapPlate={label:'MB Parts Giant · G500 A/C service cap listing, G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_service_cap'};
const controls2002={label:'MB Parts Giant · 2002 G500 automatic temperature controls page',url:'https://mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/a-c-heating/automatic-temperature-controls'};
const controls2008={label:'MB Parts Giant · 2008 G500 automatic temperature controls page',url:'https://mbpartsgiant.com/parts-list/2008-mercedes_benz-g500/a-c-heating/automatic-temperature-controls'};
const ecsClimate={label:'ECS Tuning · 2004 G500 (463.249) climate control parts',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Climate_Control/2'};
const ecsAirCon={label:'ECS Tuning · 2004 G500 (463.249) air-conditioning parts',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Climate_Control/Air_Conditioning/2'};
export const coolingPackSources={radiatorPlate,insulatorPlate,bracketPlate,supportPlate,acPlate,cutOutPlate,serviceCapPlate,controls2002,controls2008,ecsClimate,ecsAirCon};

const rubber='#26292b',foam='#55524a',plastic='#3a3f42',brass='#b99a5b',white='#c9cdc8';
const src=(p,source)=>({...p,source});
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]);cyl(r,a,d,0,Math.hypot(...d),rad,color,n);};
const hex=(r,c,a,start,end,rad,color)=>turn(r,c,a,[[start,0],[start,rad],[end,rad],[end,0]],color,{n:6});

// Radiator mounting. The core itself is the installed radiator; this study shows what holds and
// seals it: rubber insulators top and bottom, the upper brackets, the foam side seals, the drain
// valve and the two tie bars of the radiator support across the front of the frame.
const sides=[-1,1];
const radiatorMounts=study('g500-radiator-mounts','Radiator mounts, seals and drain','The radiator stands on two rubber insulators and is held at the top by brackets with rubber bushes. Foam side seals close the gaps beside the core, a drain valve sits low on the tank, and two tie bars span the radiator support.',radiatorPlate,[
  src(part('upper-insulator','Radiator upper insulator · 463-504-00-12','Rubber bushes at the top corners that isolate the radiator from its upper brackets.',[0,0,.3],r=>{
    for(const s of sides)sleeve(r,[s*.55,0,.47],z,0,.08,.06,.025,rubber,16);
  }),insulatorPlate),
  src(part('lower-insulator','Radiator lower insulator · 463-997-11-81','Rubber grommets under the radiator feet that carry its weight on the lower crossmember.',[0,0,-.3],r=>{
    for(const s of sides)turn(r,[s*.55,0,-.58],z,[[0,0],[0,.07],[.03,.07],[.04,.045],[.09,.045],[.09,0]],rubber,{n:16});
  }),insulatorPlate),
  src(part('upper-bracket','Radiator upper bracket · 463-504-14-40','Steel brackets that clamp the top of the radiator through the upper insulators.',[0,.25,.45],r=>{
    for(const s of sides){block(r,[s*.55,.04,.585],[.22,.12,.03],steel);block(r,[s*.55,.1,.5],[.22,.025,.18],steel);}
  }),bracketPlate),
  part('mount-washer','Radiator mount washer · 186-053-02-53','Washers under the nuts that hold the radiator to its upper brackets.',[0,-.2,.55],r=>{
    for(const s of sides)sleeve(r,[s*.55,0,.61],z,0,.012,.045,.018,metal,16);
  }),
  part('side-seal-left','Radiator side seal, driver side · 463-987-11-51','Foam strip that closes the gap between the left radiator tank and the support.',[-.35,0,0],r=>block(r,[-.78,0,0],[.06,.14,.9],foam)),
  part('side-seal-right','Radiator side seal, passenger side · 463-987-12-51','Foam strip that closes the gap between the right radiator tank and the support.',[.35,0,0],r=>block(r,[.78,0,0],[.06,.14,.9],foam)),
  part('drain-valve','Radiator drain valve · 000-500-01-85','Plastic drain plug screwed into the bottom of the radiator tank.',[.3,-.3,-.2],r=>{
    cyl(r,[.66,-.08,-.42],y,-.12,0,.03,plastic,14);turn(r,[.66,-.2,-.42],y,[[0,0],[0,.05],[.04,.05],[.04,0]],plastic,{n:8});block(r,[.66,-.25,-.42],[.09,.03,.02],plastic);
  }),
  part('drain-washer','Drain valve washer · 000-501-01-76','Sealing ring between the drain valve and the radiator tank.',[.3,-.45,-.05],r=>sleeve(r,[.66,-.08,-.42],y,0,.01,.045,.03,rubber,16)),
  src(part('upper-tie-bar','Upper tie bar · 463-620-00-86','The cross member of the radiator support above the radiator.',[0,0,.75],r=>{
    block(r,[0,.12,.78],[1.8,.1,.06],steel);for(const s of sides)block(r,[s*.88,.12,.7],[.06,.1,.16],steel);
  }),supportPlate),
  src(part('lower-tie-bar','Lower tie bar · 463-620-14-86','The cross member of the radiator support below the radiator.',[0,0,-.75],r=>{
    block(r,[0,.12,-.72],[1.8,.1,.06],steel);for(const s of sides)block(r,[s*.88,.12,-.64],[.06,.1,.16],steel);
  }),supportPlate)
]);
radiatorMounts.viewAngle=[-.55,.3];

// Expansion tank fittings.
const coolantTank=study('g500-coolant-tank','Expansion tank cap and level sensor','The pressure cap on the coolant expansion tank and the float-type level sensor in its base.',radiatorPlate,[
  part('cap','Expansion tank cap · 210-501-06-15','The pressure cap on the expansion tank. Its valves hold system pressure and let coolant return as the engine cools.',[0,0,.35],r=>{
    turn(r,[0,0,.2],z,[[0,0],[0,.16],[.05,.16],[.07,.14],[.1,.1],[.1,0]],dark,{n:24});
    for(let i=0;i<8;i++){const t=i*Math.PI/4;block(r,[Math.cos(t)*.155,Math.sin(t)*.155,.23],[.035,.035,.05],dark);}
    sleeve(r,[0,0,.1],z,0,.1,.06,.05,metal,16);cyl(r,[0,0,.08],z,0,.02,.055,rubber,16);
  }),
  part('level-sensor','Coolant level sensor · 220-545-00-24','Plugs into the bottom of the expansion tank and warns the cluster when the coolant level drops.',[0,0,-.35],r=>{
    cyl(r,[0,0,-.25],z,0,.3,.025,white,14);turn(r,[0,0,-.3],z,[[0,0],[0,.06],[.05,.06],[.05,0]],plastic,{n:16});
    block(r,[0,0,-.36],[.1,.07,.07],plastic);block(r,[.07,0,-.36],[.05,.05,.04],dark);
  })
]);
coolantTank.viewAngle=[-.6,.35];

// Heater circuit fittings: the auxiliary pump bracket and the heater core line seals.
const heaterFittings=study('g500-heater-fittings','Heater circuit fittings','The bracket that holds the electric circulation pump and the O-rings that seal the coolant lines at the heater core.',radiatorPlate,[
  part('pump-bracket','Circulation pump bracket · 210-830-01-14','Rubber-lined clamp that holds the electric heater circulation pump to the body.',[-.3,0,0],r=>{
    sleeve(r,[-.35,0,-.2],z,0,.4,.17,.15,steel,22);sleeve(r,[-.35,0,-.18],z,0,.36,.15,.135,rubber,22);
    block(r,[-.35,.22,0],[.12,.1,.3],steel);block(r,[-.35,.3,0],[.2,.03,.3],steel);
  }),
  src(part('core-line-seal','Heater core line O-ring · 000-835-37-98','O-rings that seal the supply and return lines where they plug into the heater core.',[.35,0,0],r=>{
    for(const dz of [-.12,.12]){sleeve(r,[.4,0,dz],x,-.012,.012,.08,.06,rubber,20);cyl(r,[.4,0,dz],x,-.2,-.03,.055,metal,14);}
  }),ecsClimate)
]);
heaterFittings.viewAngle=[-.6,.3];

// A/C service fittings around the condenser and receiver-drier.
const acService=study('g500-ac-service','A/C valves, seals and sensor','The charging valve on the condenser side, the valve and seal on the receiver-drier, the service cap, the line clip and the refrigerant temperature switch.',acPlate,[
  src(part('condenser-valve','Condenser service valve · 002-830-54-84','Schrader-type charging valve on the condenser and discharge side of the circuit.',[-.4,0,0],r=>{
    hex(r,[-.45,0,-.15],z,0,.08,.07,brass);cyl(r,[-.45,0,-.07],z,0,.14,.04,brass,14);cyl(r,[-.45,0,.07],z,0,.03,.018,metal,10);
  }),cutOutPlate),
  src(part('service-cap','Condenser service cap · 140-988-00-35','Screw cap that keeps dirt and moisture off the condenser-side charging valve.',[-.45,0,.35],r=>{
    turn(r,[-.45,0,.12],z,[[0,0],[0,.055],[.08,.055],[.1,.04],[.1,0]],dark,{n:16});
  }),serviceCapPlate),
  part('drier-valve','Receiver-drier valve · 001-830-26-84','Valve fitted in the head of the receiver-drier.',[.4,0,.05],r=>{
    hex(r,[.45,0,-.05],z,0,.07,.06,brass);cyl(r,[.45,0,.02],z,0,.12,.035,brass,14);cyl(r,[.45,0,.14],z,0,.03,.016,metal,10);
  }),
  part('drier-seal','Receiver-drier seal · 140-997-11-45','Sealing ring between the receiver-drier and its line connections.',[.45,0,-.3],r=>sleeve(r,[.45,0,-.1],z,0,.015,.065,.045,rubber,20)),
  part('line-clip','A/C line clip · 005-988-91-78','Plastic clip that holds two refrigerant lines together and off the body.',[0,-.4,-.25],r=>{
    for(const s of sides)sleeve(r,[s*.06,0,-.3],y,-.04,.04,.05,.035,plastic,16);block(r,[0,0,-.3],[.06,.08,.03],plastic);
  }),
  part('temperature-switch','Refrigerant temperature switch · 203-830-04-72','Sensor in the refrigerant line that reports temperature so the climate control can cut out the compressor.',[0,.3,.35],r=>{
    hex(r,[0,0,.1],z,0,.06,.06,brass);cyl(r,[0,0,.02],z,0,.08,.025,brass,12);cyl(r,[0,0,.16],z,0,.1,.045,plastic,14);block(r,[0,0,.3],[.08,.06,.06],dark);
  })
]);
acService.viewAngle=[-.6,.3];

// Climate sensors read by the automatic climate control.
const climateSensors=study('g500-climate-sensors','Climate sensors','The in-car temperature sensor in the dash and the outside air temperature sensor behind the grille, with the clip that holds it.',controls2002,[
  part('in-car-sensor','In-car temperature sensor · 210-830-07-72 (2006 on: 211-830-05-72)','Aspirated sensor behind a small grille in the dash. A fan draws cabin air past its thermistor.',[-.4,0,.1],r=>{
    block(r,[-.4,0,0],[.22,.1,.12],plastic);for(let i=0;i<4;i++)block(r,[-.48+i*.055,-.055,0],[.02,.012,.09],dark);
    cyl(r,[-.4,.05,0],y,0,.16,.025,plastic,12);block(r,[-.27,0,0],[.05,.07,.06],dark);
  }),
  part('outside-sensor','Outside air temperature sensor · 007-542-13-18','Small thermistor probe behind the front grille that measures outside air for the climate control and display.',[.4,0,.1],r=>{
    cyl(r,[.4,0,-.1],z,0,.12,.022,dark,12);cyl(r,[.4,0,.02],z,0,.08,.035,plastic,14);block(r,[.4,0,.13],[.07,.05,.06],plastic);
  }),
  src(part('sensor-clamp','Outside temperature sensor clamp · 005-988-35-78','Clip that holds the outside air temperature sensor on the radiator support.',[.45,-.3,-.15],r=>{
    sleeve(r,[.4,0,-.03],z,0,.05,.05,.036,plastic,16);block(r,[.4,-.08,-.005],[.06,.08,.04],plastic);
  }),controls2008)
]);
climateSensors.viewAngle=[-.6,.3];

// Footwell flap linkage in the heater housing.
const footwellLinkage=study('g500-footwell-linkage','Footwell flap levers and linkage','The levers and link parts that move the left and right footwell flaps in the heater housing.',ecsClimate,[
  part('lever-kit','Footwell flap lever kit · 203-830-00-33','The pair of control levers for the left and right footwell flaps.',[0,0,.3],r=>{
    for(const s of sides){block(r,[s*.35,0,.1],[.24,.03,.05],plastic);cyl(r,[s*.24,0,.1],y,-.03,.03,.035,dark,12);cyl(r,[s*.46,0,.1],y,-.03,.03,.02,metal,10);}
  }),
  src(part('linkage-kit','Footwell flap linkage parts kit · 203-830-00-32','Rods and ball sockets that join the footwell flaps to their levers.',[0,0,-.3],r=>{
    for(const s of sides){tube(r,[s*.46,0,.05],[s*.3,0,-.25],.012,metal);turn(r,[s*.3,0,-.27],z,[[0,0],[0,.03],[.04,.03],[.04,0]],plastic,{n:10});turn(r,[s*.46,0,.05],z,[[0,0],[0,.028],[.035,.028],[.035,0]],plastic,{n:10});}
  }),ecsAirCon)
]);
footwellLinkage.viewAngle=[-.6,.3];

export const studies=[radiatorMounts,coolantTank,heaterFittings,acService,climateSensors,footwellLinkage];
export const views=new Map([
  ['g500-radiator.tanks',radiatorMounts],
  ['cooling.coolant-reservoir',coolantTank],
  ['cooling.heater-feed',heaterFittings],
  ['hvac.refrigerant-lines',acService],
  ['hvac.panel',climateSensors],
  ['g500-air-flaps.link',footwellLinkage]
]);

const ids=(s,keys)=>keys.map(k=>s.id+'.'+k);
export const claims=[
  {ids:ids(radiatorMounts,['upper-insulator','lower-insulator','upper-bracket','mount-washer','side-seal-left','side-seal-right','drain-valve','drain-washer']),kind:'diagram',
    fact:'The 2007 G500 radiator and components diagram lists the upper insulator 463-504-00-12, lower insulator 463-997-11-81, upper bracket 463-504-14-40, radiator washer 186-053-02-53, side seals 463-987-11-51 (driver) and 463-987-12-51 (passenger), drain valve 000-500-01-85 and drain valve washer 000-501-01-76. The G500 listings give 2002–2008 fitment for the insulators and the upper bracket.',
    need:'Fitment of the side seals, washer, drain valve and drain washer is read from the 2007 diagram; confirm them on a 2002 car by VIN. Bush, seal and bracket dimensions are unmeasured; positions are schematic.',source:radiatorPlate},
  {ids:ids(radiatorMounts,['upper-tie-bar','lower-tie-bar']),kind:'diagram',
    fact:'The 2005 G500 radiator support diagram lists the upper tie bar 463-620-00-86 and lower tie bar 463-620-14-86. The 2008 G500 page lists the same two numbers.',
    need:'Confirm the 2002 tie bars by VIN. Section, length and fixing points are unmeasured.',source:supportPlate},
  {ids:ids(coolantTank,['cap','level-sensor']),kind:'diagram',
    fact:'The 2007 G500 radiator diagram lists the reservoir cap 210-501-06-15-64 (G500, G55 AMG) and level sensor 220-545-00-24 (5.0L). The G500 reservoir hose listing gives the cap 2002–2008 G500 fitment.',
    need:'Confirm the 2002 level sensor by VIN. Cap opening pressure and sensor length are not given on the page.',source:radiatorPlate},
  {ids:ids(heaterFittings,['pump-bracket']),kind:'diagram',
    fact:'The 2007 G500 radiator diagram lists the recirc pump bracket 210-830-01-14 (5.0L) with the auxiliary circulation pump.',
    need:'Confirm the bracket on a 2002 car by VIN. Its shape and mounting point are drawn schematically.',source:radiatorPlate},
  {ids:ids(heaterFittings,['core-line-seal']),kind:'diagram',
    fact:'ECS Tuning lists the genuine Mercedes heater core line O-ring 000-835-37-98 for the 2003 and 2004 G500 (463.249), for the supply and return lines at the heater core.',
    need:'This is a retailer listing filtered by vehicle, not a Mercedes diagram. Confirm the O-ring against the heater core diagram or by VIN.',source:ecsClimate},
  {ids:ids(acService,['drier-valve','drier-seal','line-clip','temperature-switch']),kind:'diagram',
    fact:'The 2004 G500 condenser, compressor and lines diagram lists the dehydrator valve 001-830-26-84, dehydrator seal 140-997-11-45-64, A/C line clip 005-988-91-78 and temperature sensor 203-830-04-72. The G500 cut-out switch listing gives the valve and the refrigerant temperature sensor 2002–2008 G500 fitment.',
    need:'The diagram does not show where the clip sits along the lines or where the temperature switch is fitted. Positions are schematic.',source:acPlate},
  {ids:ids(acService,['condenser-valve']),kind:'diagram',
    fact:'The G500 cut-out switch listing gives the condenser valve 002-830-54-84 (other name: discharge line valve) G500 fitment for 2002–2003 and 2006–2008. It replaces 001-830-27-84.',
    need:'The listing skips 2004–2005, and the page does not show where the valve sits. Confirm the valve on a 2002 car by VIN.',source:cutOutPlate},
  {ids:ids(acService,['service-cap']),kind:'diagram',
    fact:'The G500 A/C service cap listing gives the condenser cap 140-988-00-35 G500 fitment for 2002–2003 and 2006–2008.',
    need:'Confirm the cap on a 2002 car by VIN. The thread size is not given.',source:serviceCapPlate},
  {ids:ids(climateSensors,['in-car-sensor','outside-sensor']),kind:'diagram',
    fact:'The 2002 G500 automatic temperature controls page lists the in-car sensor 210-830-07-72 (G500, G55 AMG) and temperature sensor 007-542-13-18. The 2008 page lists the in-car sensor as 211-830-05-72 and 007-542-13-18 as the air temperature sensor in the radiator support diagram.',
    need:'The pages do not say which model year the in-car sensor changed. Sensor positions in the dash and behind the grille are schematic.',source:controls2002},
  {ids:ids(climateSensors,['sensor-clamp']),kind:'diagram',
    fact:'The 2008 G500 radiator support diagram lists the air temperature sensor clamp 005-988-35-78 (2006–15) with the air temperature sensor 007-542-13-18.',
    need:'The clamp is listed from 2006. Confirm whether a 2002 car uses it.',source:controls2008},
  {ids:ids(footwellLinkage,['lever-kit']),kind:'diagram',
    fact:'ECS Tuning lists the genuine Mercedes HVAC control lever kit 203-830-00-33 for the 2003 and 2004 G500 (463.249), for the left and right footwell flaps.',
    need:'This is a retailer listing filtered by vehicle, not a Mercedes diagram. Confirm against the heater housing diagram or by VIN. Lever shapes are schematic.',source:ecsClimate},
  {ids:ids(footwellLinkage,['linkage-kit']),kind:'diagram',
    fact:'ECS Tuning lists the genuine Mercedes linkage parts kit 203-830-00-32 for the 2004 G500 (463.249), for the footwell flaps, without the operating lever.',
    need:'This is a retailer listing filtered by vehicle, not a Mercedes diagram. Confirm the kit contents and fitment by VIN.',source:ecsAirCon}
];
