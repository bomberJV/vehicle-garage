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
// Round 1 left out parts the register models generically. Round 2 adds their Mercedes numbers
// in studies opened from those generic parts: the radiator core, fan, viscous clutch and shroud,
// radiator and bypass hoses, expansion tank, thermostat, coolant and circulation pumps, pump
// gasket and pulley, condenser, receiver-drier, compressor and clutch, expansion valve, the
// refrigerant lines, the transmission cooler and its pipes, the condenser fans, the A/C and
// heater case with its cores and blower, and the climate control head.
import {metal,steel,dark,gold,copper,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

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
// Round 2 sources. Diagram pages first, then the G500 part listings that give 2002–2008 fitment.
const ref=(label,url)=>({label,url});
const waterPump2004=ref('MB Parts Giant · 2004 G500 water pump and cooling system diagrams','https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/belts-cooling/water-pump');
const radiator2004=ref('MB Parts Giant · 2004 G500 radiator and components diagrams','https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/belts-cooling/radiator-components');
const coolingFan2007=ref('MB Parts Giant · 2007 G500 cooling fan diagram','https://www.mbpartsgiant.com/parts-list/2007-mercedes_benz-g500/belts-cooling/cooling-fan');
const transCooler2004=ref('MB Parts Giant · 2004 G500 transmission oil cooler diagram','https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/belts-cooling/trans-oil-cooler');
const transCooler2007=ref('MB Parts Giant · 2007 G500 transmission oil cooler diagram','https://www.mbpartsgiant.com/parts-list/2007-mercedes_benz-g500/belts-cooling/trans-oil-cooler');
const airCon2002=ref('MB Parts Giant · 2002 G500 air conditioner page (condenser, compressor and lines; evaporator and heater components)','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/a-c-heating/air-conditioner');
const blower2002=ref('MB Parts Giant · 2002 G500 evaporator and heater components (blower motor listing)','https://www.mbpartsgiant.com/oem-2002-mercedes_benz-g500-blower_motor');
const condenserFan2004=ref('MB Parts Giant · 2004 G500 A/C condenser fan diagram','https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/a-c-heating/a-c-condenser-fan');
const controlUnits2002=ref('MB Parts Giant · 2002 G500 A/C and heater control units page','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/a-c-heating/a-c-heater-control-units');
const radiatorListing=ref('MB Parts Giant · G500 radiator listing, G500 fitment by year','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-radiator');
const coolantPipeListing=ref('MB Parts Giant · G500 coolant pipe listing, G500 fitment by year','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-coolant_pipe');
const reservoirListing=ref('MB Parts Giant · G500 coolant reservoir listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-coolant_reservoir');
const fanBladeListing=ref('MB Parts Giant · G500 radiator fan listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-radiator_fan');
const fanClutchListing=ref('MB Parts Giant · G500 fan clutch listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-fan_clutch');
const fanShroudListing=ref('MB Parts Giant · G500 fan shroud listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-fan_shroud');
const waterPumpListing=ref('MB Parts Giant · G500 water pump listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-water_pump');
const pulleyListing=ref('MB Parts Giant · G500 water pump pulley listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-water_pump_pulley');
const thermostatListing=ref('MB Parts Giant · G500 thermostat listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-thermostat');
const thermostatGasketListing=ref('MB Parts Giant · G500 thermostat gasket listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-thermostat_gasket');
const acHoseListing=ref('MB Parts Giant · G500 A/C hose listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_hose');
const compressorListing=ref('MB Parts Giant · G500 A/C compressor listing, G500 fitment by year','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_compressor');
const clutchListing=ref('MB Parts Giant · G500 A/C compressor clutch listing, 2002–2003 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_compressor_clutch');
const condenserListing=ref('MB Parts Giant · G500 A/C condenser listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_condenser');
const expansionValveListing=ref('MB Parts Giant · G500 A/C expansion valve listing, G500 fitment by year','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-a_c_expansion_valve');
const evaporatorListing=ref('MB Parts Giant · G500 evaporator listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-evaporator');
const heaterCoreListing=ref('MB Parts Giant · G500 heater core listing, 2002–2008 G500 fitment','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-heater_core');
export const coolingPackSources={radiatorPlate,insulatorPlate,bracketPlate,supportPlate,acPlate,cutOutPlate,serviceCapPlate,controls2002,controls2008,ecsClimate,ecsAirCon,
  waterPump2004,radiator2004,coolingFan2007,transCooler2004,transCooler2007,airCon2002,blower2002,condenserFan2004,controlUnits2002,
  radiatorListing,coolantPipeListing,reservoirListing,fanBladeListing,fanClutchListing,fanShroudListing,waterPumpListing,pulleyListing,thermostatListing,thermostatGasketListing,
  acHoseListing,compressorListing,clutchListing,condenserListing,expansionValveListing,evaporatorListing,heaterCoreListing};

const rubber='#26292b',foam='#55524a',plastic='#3a3f42',brass='#b99a5b',white='#c9cdc8',alloy='#a9b3b0',hose='#2f3335',fanPlastic='#4a4537';
const src=(p,source)=>({...p,source});
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]);cyl(r,a,d,0,Math.hypot(...d),rad,color,n);};
const hex=(r,c,a,start,end,rad,color)=>turn(r,c,a,[[start,0],[start,rad],[end,rad],[end,0]],color,{n:6});
const run=(r,pts,rad,color,n=10)=>{for(let i=1;i<pts.length;i++){tube(r,pts[i-1],pts[i],rad,color,n);if(i<pts.length-1)cyl(r,pts[i],[0,0,1],-rad,rad,rad*1.02,color,n);}};
const face=(r,pts,color)=>{r.polygon(pts,color,false);r.polygon([...pts].reverse(),color,false);};

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
  }),supportPlate),
  src(part('radiator','Radiator · 463-500-11-00 (2002–2003 also 463-500-12-00)','The crossflow radiator core with its two side tanks, standing on the lower insulators between the tie bars.',[0,-.12,0],r=>{
    block(r,[0,0,0],[1.24,.07,1.0],alloy);for(const s of sides)block(r,[s*.66,0,0],[.08,.1,1.06],plastic);
    for(const s of sides)cyl(r,[s*.66,0,s*.38],[s,0,0],.04,.14,.045,plastic,12);
  }),radiatorListing)
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
  }),
  src(part('tank','Coolant expansion tank · 220-500-00-49','The translucent plastic tank that takes up coolant expansion. The cap screws onto its neck and the level sensor plugs into its base.',[0,.35,0],r=>{
    block(r,[0,0,-.06],[.62,.34,.32],white);cyl(r,[0,0,.1],z,0,.1,.075,white,18);
    cyl(r,[.31,0,-.16],x,0,.1,.025,white,10);cyl(r,[-.31,.08,.04],x,-.08,0,.02,white,10);
  }),reservoirListing),
  part('vent-hose','Expansion tank vent hose · 463-501-17-82','Small hose from the vent nipple on the tank back to the radiator, so air bleeds out of the circuit.',[-.45,0,.15],r=>{
    run(r,[[-.39,.08,.04],[-.55,.08,.04],[-.62,.0,-.1],[-.62,-.2,-.35]],.018,hose,8);
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
  }),ecsClimate),
  src(part('circulation-pump','Auxiliary circulation pump · 001-835-13-64 (now 001-835-11-64)','The small electric pump that keeps coolant moving through the heater core. It sits in the rubber-lined bracket.',[-.35,-.35,.25],r=>{
    cyl(r,[-.35,0,-.24],z,0,.46,.13,dark,20);turn(r,[-.35,0,.22],z,[[0,0],[0,.13],[.04,.1],[.06,0]],dark,{n:20});
    cyl(r,[-.35,0,-.24],z,-.12,0,.035,dark,12);cyl(r,[-.35,0,-.16],x,.13,.25,.035,dark,12);block(r,[-.35,-.15,.12],[.08,.06,.07],plastic);
  }),waterPumpListing)
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
  }),controls2008),
  src(part('control-head','Climate control head · 209-830-04-85','The automatic climate control unit in the centre dash: temperature and fan controls, mode buttons and the electronics that read the sensors.',[0,-.35,.45],r=>{
    block(r,[0,0,.5],[.7,.1,.2],plastic);block(r,[0,-.055,.5],[.66,.012,.16],dark);
    for(const s of sides)cyl(r,[s*.24,-.06,.5],y,-.05,0,.05,dark,16);
    for(let i=0;i<4;i++)block(r,[-.1+i*.067,-.07,.5],[.045,.02,.035],white);
  }),controlUnits2002)
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

// Round 2.

// Engine-driven fan. The fan axis runs fore and aft (y); the radiator would sit at +y.
const fanBlades=(r,yc,inner,outer,count,color,cx=0)=>{
  for(let i=0;i<count;i++){
    const t=i*2*Math.PI/count,p=(rad,a,dy)=>[cx+Math.cos(t+a)*rad,yc+dy,Math.sin(t+a)*rad];
    face(r,[p(inner,-.16,.03),p(inner,.16,-.03),p(outer,.2,-.045),p(outer,-.2,.045)],color);
  }
};
const fanDrive=study('g500-fan-drive','Engine fan, viscous clutch and shroud','The plastic fan bolts to a viscous clutch on the water-pump shaft. The clutch slips when the air behind the radiator is cool and locks up as it heats. The shroud round the fan pulls air through the whole radiator core.',coolingFan2007,[
  src(part('fan-blade','Engine fan · 112-200-01-23','The multi-blade plastic fan, bolted to the front of the viscous clutch.',[0,.3,0],r=>{
    sleeve(r,[0,.1,0],y,-.03,.03,.17,.05,fanPlastic,24);fanBlades(r,.1,.16,.68,9,fanPlastic);
  }),fanBladeListing),
  src(part('fan-clutch','Viscous fan clutch · 113-200-01-22','The silicone-fluid coupling between the pump shaft and the fan, with a bimetal coil on its face that senses air temperature.',[0,-.05,0],r=>{
    turn(r,[0,-.12,0],y,[[0,0],[0,.06],[.02,.14],[.17,.14],[.2,.06],[.22,0]],metal,{n:28});
    for(let i=0;i<12;i++){const t=i*Math.PI/6;block(r,[Math.cos(t)*.1,-.04,Math.sin(t)*.1],[.025,.1,.025],steel);}
    cyl(r,[0,.08,0],y,0,.03,.045,brass,14);cyl(r,[0,-.12,0],y,-.12,0,.03,steel,12);
  }),fanClutchListing),
  src(part('shroud','Fan shroud · 463-505-15-55','The plastic shroud that ducts air from the radiator core to the fan ring.',[0,.55,0],r=>{
    sleeve(r,[0,.2,0],y,0,.14,.76,.72,plastic,40);
    block(r,[0,.36,.78],[1.6,.04,.06],plastic);block(r,[0,.36,-.78],[1.6,.04,.06],plastic);
    for(const s of sides)block(r,[s*.78,.36,0],[.06,.04,1.62],plastic);
    for(const s of sides)face(r,[[s*.72,.2,.2],[s*.72,.2,-.2],[s*.78,.36,-.6],[s*.78,.36,.6]],plastic);
  }),fanShroudListing),
  part('shroud-nut','Fan shroud nut · 123-504-02-46','Plastic expanding nuts that hold the fan shroud to the radiator brackets.',[0,.75,.25],r=>{
    for(const s of sides)for(const t of sides){hex(r,[s*.7,.38,t*.7],y,0,.03,.035,dark);cyl(r,[s*.7,.38,t*.7],y,.03,.07,.018,dark,10);}
  })
]);
fanDrive.viewAngle=[-.5,.35];

// Main coolant hoses between engine and radiator, and the short bypass at the thermostat.
const coolantHoses=study('g500-coolant-hoses','Radiator and bypass hoses','The two molded radiator hoses, one on each side of the engine bay, and the short bypass hose that returns coolant to the pump while the thermostat is shut.',waterPump2004,[
  src(part('upper-hose','Radiator hose, driver side · 463-501-06-84','Molded upper hose from the thermostat housing outlet to the radiator inlet tank.',[-.2,0,.3],r=>{
    run(r,[[-.15,-.55,.35],[-.15,-.3,.42],[-.45,0,.45],[-.62,.4,.4],[-.66,.55,.38]],.055,hose,12);
  }),coolantPipeListing),
  src(part('lower-hose','Radiator hose, passenger side · 463-501-65-82','Molded lower hose from the radiator outlet tank back to the coolant pump inlet.',[.2,0,-.3],r=>{
    run(r,[[.66,.55,-.38],[.6,.35,-.4],[.35,0,-.42],[.12,-.35,-.3],[.08,-.55,-.2]],.055,hose,12);
  }),coolantPipeListing),
  src(part('bypass-hose','Bypass hose · 112-203-03-82','Short hose between the thermostat housing and the pump that carries coolant round the engine before the thermostat opens.',[0,-.35,0],r=>{
    run(r,[[-.12,-.6,.28],[-.05,-.68,.1],[.05,-.66,-.05],[.08,-.58,-.15]],.035,hose,10);
  }),coolantPipeListing)
]);
coolantHoses.viewAngle=[-.6,.3];

// Coolant pump parts. Pump axis along y; the engine timing cover is at -y.
const pumpParts=study('g500-coolant-pump-parts','Coolant pump, gasket and pulley','The belt-driven coolant pump on the front of the timing cover, its paper gasket and the pulley the poly-V belt turns.',waterPump2004,[
  src(part('pump','Coolant pump · 112-200-14-01 (without oil-cooler fitting: 112-200-15-01)','Cast pump body with the impeller, bearing and shaft. The two versions differ by the fitting for the engine oil cooler.',[0,0,0],r=>{
    turn(r,[0,-.12,0],y,[[0,0],[0,.5],[.12,.5],[.14,.3],[.22,.12],[.42,.08],[.42,0]],alloy,{n:28});
    for(const t of [.4,2.1,3.6,5.1])cyl(r,[Math.cos(t)*.5,-.06,Math.sin(t)*.5],y,-.06,.06,.06,alloy,12);
    cyl(r,[.42,-.06,-.2],x,0,.18,.06,alloy,14);cyl(r,[-.2,-.06,.44],z,0,.14,.04,alloy,12);
  }),waterPumpListing),
  part('gasket','Coolant pump gasket · 112-201-00-80','Flat gasket between the pump body and the timing cover.',[0,-.35,0],r=>{
    sleeve(r,[0,-.13,0],y,-.008,.008,.52,.38,brass,32);
  }),
  src(part('pulley','Coolant pump pulley · 112-202-01-10','Grooved pulley bolted to the pump hub. The poly-V belt drives it, and the fan clutch threads onto the shaft in front of it.',[0,.35,0],r=>{
    turn(r,[0,.32,0],y,[[0,0],[0,.08],[.02,.12],[.02,.3],[.0,.3],[.0,.34],[.14,.34],[.14,.3],[.12,.3],[.12,.12],[.14,.08],[.14,0]],steel,{n:32});
    for(let i=1;i<6;i++)sleeve(r,[0,.32,0],y,i*.02,i*.02+.008,.345,.33,dark,32);
  }),pulleyListing)
]);
pumpParts.viewAngle=[-.6,.3];

// Thermostat. The M113 uses a thermostat built into its own housing cover.
const thermostatParts=study('g500-thermostat-parts','Thermostat housing and gasket','The M113 thermostat comes as one part with its housing cover. A gasket seals it to the coolant pump housing.',waterPump2004,[
  src(part('thermostat','Thermostat with housing · 112-203-02-75','Housing cover with the wax-element thermostat inside and the outlet neck for the radiator hose.',[0,.3,0],r=>{
    turn(r,[0,0,0],y,[[0,0],[0,.3],[.06,.3],[.1,.24],[.24,.22],[.3,.12],[.3,0]],alloy,{n:28});
    cyl(r,[0,.18,0],z,.1,.5,.09,alloy,18);sleeve(r,[0,.18,0],z,.44,.5,.11,.08,alloy,18);
    for(const t of [.8,2.4,3.9,5.5])cyl(r,[Math.cos(t)*.33,0,Math.sin(t)*.33],y,0,.05,.05,alloy,10);
    cyl(r,[0,-.02,0],y,-.18,0,.18,brass,20);
  }),thermostatListing),
  src(part('gasket','Thermostat gasket · 112-203-00-76','Rubber-coated gasket between the thermostat housing and its seat on the pump housing.',[0,-.3,0],r=>{
    sleeve(r,[0,-.03,0],y,-.01,.01,.32,.22,rubber,32);
  }),thermostatGasketListing)
]);
thermostatParts.viewAngle=[-.6,.35];

// External transmission oil cooler and its pipes. The cooler sits ahead of the radiator (+y);
// the pipes run back along the right and left of the engine to the 722.6 at -y.
const transCooler=study('g500-transmission-cooler','Transmission oil cooler, brackets and pipes','The separate oil cooler for the automatic transmission, on rubber bushes between two brackets, with the steel feed and return pipes that run back to the transmission.',transCooler2004,[
  part('cooler','Transmission oil cooler · 463-500-14-00','Tube-and-fin cooler for transmission fluid, mounted in front of the radiator.',[0,.3,.2],r=>{
    block(r,[0,.7,.55],[1.1,.06,.22],alloy);for(const s of sides)block(r,[s*.57,.7,.55],[.06,.09,.26],metal);
    for(const s of sides)cyl(r,[s*.57,.7,.48],[0,-1,0],.04,.12,.025,metal,10);
  }),
  part('bracket-right','Transmission cooler bracket, passenger side · 463-504-33-40','Steel bracket that carries the right end of the cooler.',[.35,.3,.35],r=>{
    block(r,[.66,.7,.55],[.04,.1,.3],steel);block(r,[.66,.76,.38],[.12,.04,.06],steel);
  }),
  part('bracket-left','Transmission cooler bracket, driver side · 463-504-32-40','Steel bracket that carries the left end of the cooler.',[-.35,.3,.35],r=>{
    block(r,[-.66,.7,.55],[.04,.1,.3],steel);block(r,[-.66,.76,.38],[.12,.04,.06],steel);
  }),
  part('bushing','Transmission cooler bushing · 126-504-02-12','Rubber bushes at both ends that isolate the cooler from its brackets.',[0,.55,.5],r=>{
    for(const s of sides)sleeve(r,[s*.62,.7,.55],x,-.02,.02,.045,.02,rubber,14);
  }),
  part('pipe-left','Transmission cooler pipe, driver side · 463-500-26-72','Steel pipe from the left end of the cooler back along the engine.',[-.3,0,0],r=>{
    run(r,[[-.57,.6,.48],[-.57,.4,.3],[-.5,0,.1],[-.45,-.35,0]],.02,metal,8);
  }),
  part('pipe-right-front','Transmission cooler pipe, right front · 463-270-03-96','Front section of the right-hand cooler pipe.',[.3,.15,0],r=>{
    run(r,[[.57,.6,.48],[.57,.4,.3],[.5,.1,.12]],.02,metal,8);
  }),
  part('pipe-right-rear','Transmission cooler pipe, right rear · 220-270-03-96','Rear section of the right-hand cooler pipe, to the transmission.',[.35,-.15,-.15],r=>{
    run(r,[[.5,.1,.12],[.45,-.35,0],[.25,-.7,-.2]],.02,metal,8);
  }),
  src(part('return-front','Transmission cooler return line, front · 463-270-02-96','Front section of the return line listed on the 2007 diagram.',[-.15,.2,-.3],r=>{
    run(r,[[-.45,-.35,0],[-.4,-.45,-.1]],.02,steel,8);run(r,[[-.4,-.45,-.1],[-.3,-.55,-.2]],.021,steel,8);
  }),transCooler2007),
  src(part('return-rear','Transmission cooler return line, rear · 220-270-02-96','Rear section of the return line, into the transmission case.',[-.1,-.2,-.4],r=>{
    run(r,[[-.3,-.55,-.2],[-.2,-.7,-.25],[-.15,-.85,-.25]],.02,steel,8);
  }),transCooler2007),
  src(part('cooler-line-right','Transmission cooler line, passenger side · 463-270-00-96','Passenger-side cooler line listed on the 2007 diagram.',[.15,-.3,-.45],r=>{
    run(r,[[.25,-.7,-.2],[.2,-.85,-.25],[.15,-.9,-.25]],.022,steel,8);
  }),transCooler2007),
  part('pipe-clamp','Transmission cooler pipe clamp · 000-995-92-42','Clamps that hold the left and right cooler pipes to the engine and body.',[0,-.1,.3],r=>{
    for(const p of [[-.5,0,.1],[.5,.1,.12]]){sleeve(r,p,y,-.02,.02,.04,.022,rubber,12);block(r,[p[0],p[1],p[2]+.06],[.03,.03,.07],steel);}
  })
]);
transCooler.viewAngle=[-.55,.35];

// Refrigerant lines between compressor, condenser, receiver-drier and evaporator.
const C={comp:[.3,0,-.35],cond:[.55,.75,.1],condLow:[.5,.75,-.25],drier:[-.6,.65,.1],evap:[-.2,-.8,.35]};
const refrigerantLines=study('g500-refrigerant-lines','A/C refrigerant lines and hose','The rigid and flexible lines of the refrigerant circuit: compressor to condenser, condenser to receiver-drier, drier to evaporator and the suction line back to the compressor.',airCon2002,[
  src(part('discharge','A/C discharge line · 112-230-05-56','High-pressure line from the compressor outlet to the condenser.',[.3,.2,0],r=>{
    run(r,[[C.comp[0]+.1,C.comp[1]+.1,C.comp[2]+.1],[.45,.2,-.15],[.55,.55,0],C.cond],.025,hose,10);
  }),acHoseListing),
  src(part('condenser-drier','A/C hose, condenser to drier · 463-500-92-72','Flexible hose from the condenser outlet toward the receiver-drier.',[0,.4,-.3],r=>{
    run(r,[C.condLow,[.2,.8,-.3],[-.2,.8,-.25]],.022,hose,10);
  }),acHoseListing),
  src(part('drier-condenser','A/C line, drier to condenser · 463-500-77-72','Rigid line that completes the run between the condenser and the receiver-drier.',[-.3,.4,-.15],r=>{
    run(r,[[-.2,.8,-.25],[-.5,.75,-.2],[-.6,.65,0]],.02,metal,10);
  }),acHoseListing),
  src(part('liquid','A/C liquid line · 463-500-79-72','Liquid line from the receiver-drier to the expansion valve at the evaporator.',[-.35,0,.25],r=>{
    run(r,[C.drier,[-.6,.3,.3],[-.4,-.4,.4],[-.25,-.7,.38],C.evap],.018,metal,10);
  }),acHoseListing),
  src(part('suction','A/C suction line · 113-230-19-56','Large low-pressure line from the evaporator back to the compressor inlet.',[0,-.3,-.25],r=>{
    run(r,[[C.evap[0]+.08,C.evap[1],C.evap[2]-.1],[-.05,-.6,.1],[.15,-.3,-.2],[C.comp[0]-.05,C.comp[1]-.1,C.comp[2]+.1]],.035,hose,12);
  }),acHoseListing)
]);
refrigerantLines.viewAngle=[-.55,.35];

// Main refrigerant components.
const acComponents=study('g500-ac-components','A/C compressor, clutch, condenser and receiver-drier','The belt-driven compressor and its magnetic clutch pulley, the condenser in front of the radiator and the receiver-drier that stores liquid refrigerant and traps moisture.',airCon2002,[
  src(part('compressor','A/C compressor · 000-230-86-11 (2003 on: 001-230-28-11)','Swash-plate compressor on the engine, driven by the poly-V belt through its clutch.',[0,-.2,-.25],r=>{
    cyl(r,[.2,-.35,-.4],y,0,.5,.17,alloy,24);turn(r,[.2,-.35,-.4],y,[[0,0],[0,.17],[-.06,.14],[-.06,0]],alloy,{n:24});
    for(const s of sides)block(r,[.2+s*.2,-.1,-.4],[.08,.1,.08],alloy);
    cyl(r,[.2,-.05,-.4],z,.15,.26,.04,alloy,12);cyl(r,[.2,-.25,-.4],z,.15,.26,.05,alloy,12);
  }),compressorListing),
  src(part('clutch','A/C compressor clutch and pulley · 000-230-35-28','Electromagnetic clutch: the belt pulley, the coil behind it and the armature plate that locks it to the compressor shaft.',[0,.15,-.3],r=>{
    turn(r,[.2,.15,-.4],y,[[0,.07],[0,.2],[.1,.2],[.1,.07]],steel,{n:28});for(let i=1;i<5;i++)sleeve(r,[.2,.15,-.4],y,i*.02,i*.02+.008,.205,.19,dark,28);
    cyl(r,[.2,.25,-.4],y,0,.02,.17,metal,24);cyl(r,[.2,.27,-.4],y,0,.02,.04,dark,12);
  }),clutchListing),
  src(part('condenser','A/C condenser · 463-500-04-54','Fin-and-tube condenser ahead of the radiator, where the hot refrigerant gives up its heat and turns liquid.',[0,.35,.2],r=>{
    block(r,[0,.75,.2],[1.3,.05,.8],metal);for(const s of sides)block(r,[s*.67,.75,.2],[.05,.08,.84],steel);
  }),condenserListing),
  part('drier','Receiver-drier · 463-500-02-49','Upright canister with desiccant that holds a liquid reserve and removes moisture from the refrigerant.',[-.35,.2,.3],r=>{
    cyl(r,[-.85,.6,-.05],z,0,.45,.07,steel,18);turn(r,[-.85,.6,.4],z,[[0,0],[0,.07],[.04,.05],[.06,0]],steel,{n:18});
    block(r,[-.85,.6,.47],[.12,.1,.05],alloy);
  })
]);
acComponents.viewAngle=[-.55,.3];

// Electric condenser fans in front of the condenser, with shroud, baffles and air guide.
const condenserFans=study('g500-condenser-fans','Condenser fans, shroud and air baffles','Two electric fans in a common shroud pull air through the condenser when the A/C runs or the engine runs hot. Side baffles and an air guide close the gaps so the air goes through the cores.',condenserFan2004,[
  part('fan-motor','Condenser fan and motor · 001-500-15-93','Electric fan and motor, one for each side; the same part fits left and right.',[0,.35,0],r=>{
    for(const s of sides){cyl(r,[s*.38,.1,0],y,0,.14,.09,dark,18);fanBlades(r,.22,.07,.3,5,plastic,s*.38);}
  }),
  part('grommet','Condenser fan motor grommet · 000-997-31-81','Rubber grommets that mount the fan motors to the shroud.',[0,.55,-.35],r=>{
    for(const s of sides)for(const t of [0,2.1,4.2])sleeve(r,[s*.38+Math.cos(t)*.13,.06,Math.sin(t)*.13],y,-.02,.02,.03,.012,rubber,12);
  }),
  part('shroud','Condenser fan shroud · 463-500-01-55','Plastic shroud that holds both fans in front of the condenser.',[0,-.05,0],r=>{
    for(const s of sides)sleeve(r,[s*.38,.0,0],y,0,.1,.34,.32,plastic,30);
    block(r,[0,-.01,.37],[1.5,.03,.06],plastic);block(r,[0,-.01,-.37],[1.5,.03,.06],plastic);block(r,[0,-.01,0],[.08,.03,.7],plastic);
  }),
  part('shroud-insulator','Condenser fan shroud insulator · 117-988-01-11','Rubber insulators that hold the shroud off the condenser frame; the same part is used for the air baffles.',[0,-.3,.4],r=>{
    for(const s of sides)for(const t of sides)sleeve(r,[s*.72,-.04,t*.37],y,-.025,.025,.035,.012,rubber,12);
  }),
  part('baffle-right','Air baffle, passenger side · 463-500-00-62','Plastic baffle that closes the gap at the right of the condenser and radiator.',[.4,0,0],r=>block(r,[.82,-.25,0],[.03,.5,.8],plastic)),
  part('baffle-left','Air baffle, driver side · 463-500-01-62','Plastic baffle that closes the gap at the left of the condenser and radiator.',[-.4,0,0],r=>block(r,[-.82,-.25,0],[.03,.5,.8],plastic)),
  part('baffle-seal','Air baffle seal · 003-987-17-51','Foam strips along the baffle edges, left and right.',[0,-.45,-.1],r=>{
    for(const s of sides)block(r,[s*.85,-.5,0],[.03,.04,.8],foam);
  }),
  part('air-guide','Air guide · 463-505-00-30','Top panel that guides air from the grille down onto the condenser and radiator.',[0,0,.4],r=>{
    block(r,[0,-.25,.45],[1.62,.5,.03],plastic);block(r,[0,.0,.47],[1.62,.04,.06],plastic);
  })
]);
condenserFans.viewAngle=[-.5,.35];

// Heater and A/C module internals: case, cores, expansion valve and blower.
const climateModule=study('g500-climate-module','A/C and heater case, cores, expansion valve and blower','The case behind the dash with the evaporator core, the heater core, the expansion valve on the evaporator lines and the blower motor in its case.',airCon2002,[
  src(part('case','A/C and heater case assembly · 209-830-01-62','The complete housing behind the dash that holds the cores and flaps.',[0,0,0],r=>{
    block(r,[0,.1,0],[1.1,.5,.7],plastic);block(r,[0,.1,.4],[.8,.3,.1],plastic);
  }),evaporatorListing),
  src(part('evaporator','Evaporator core · 209-830-03-58','Plate-fin core where the refrigerant evaporates and chills the incoming air.',[0,.45,0],r=>{
    block(r,[-.15,.45,0],[.6,.06,.5],metal);for(const s of sides)block(r,[-.15+s*.31,.45,0],[.03,.08,.52],alloy);
  }),evaporatorListing),
  src(part('heater-core','Heater core · 203-830-01-61','Coolant-fed core downstream of the evaporator that reheats the air for the cabin.',[.45,.25,.1],r=>{
    block(r,[.3,-.05,0],[.35,.05,.4],copper);for(const dz of [-.08,.08])cyl(r,[.3,-.05,dz],[0,-1,0],.03,.22,.025,metal,12);
  }),heaterCoreListing),
  src(part('expansion-valve','A/C expansion valve · 220-830-03-84 (2003 on: 230-830-01-84)','Block valve on the evaporator inlet that meters liquid refrigerant into the core.',[-.4,.5,.35],r=>{
    block(r,[-.55,.55,.3],[.1,.12,.16],alloy);cyl(r,[-.55,.61,.35],y,0,.12,.02,metal,10);cyl(r,[-.55,.61,.25],y,0,.12,.028,metal,10);
    cyl(r,[-.55,.55,.38],z,0,.06,.035,dark,12);
  }),expansionValveListing),
  src(part('blower-motor','Blower motor · 203-820-25-14','The fan motor and its squirrel-cage wheel that push air through the case.',[-.3,-.3,-.35],r=>{
    cyl(r,[-.6,-.05,-.3],x,-.1,.1,.18,dark,22);cyl(r,[-.6,-.05,-.3],x,-.25,-.1,.07,metal,14);
  }),blower2002),
  src(part('blower-case','Blower case · 203-830-05-03','The scroll housing round the blower wheel at the inlet side of the module.',[-.5,-.15,-.15],r=>{
    sleeve(r,[-.6,-.05,-.3],x,-.12,.12,.24,.21,plastic,26);block(r,[-.6,.2,-.2],[.24,.16,.16],plastic);
  }),blower2002)
]);
climateModule.viewAngle=[-.55,.3];

export const studies=[radiatorMounts,coolantTank,heaterFittings,acService,climateSensors,footwellLinkage,
  fanDrive,coolantHoses,pumpParts,thermostatParts,transCooler,refrigerantLines,acComponents,condenserFans,climateModule];
export const views=new Map([
  ['g500-radiator.tanks',radiatorMounts],
  ['cooling.coolant-reservoir',coolantTank],
  ['cooling.heater-feed',heaterFittings],
  ['hvac.refrigerant-lines',acService],
  ['hvac.panel',climateSensors],
  ['g500-air-flaps.link',footwellLinkage],
  ['cooling.fan',fanDrive],
  ['cooling.upper-hose',coolantHoses],
  ['g500-engine-pump.body',pumpParts],
  ['g500-coolant-thermostat.housing',thermostatParts],
  ['transmission-fluid.cooler',transCooler],
  ['g500-condenser-matrix.ports',refrigerantLines],
  ['g500-ac-compressor.hub',acComponents],
  ['g500-auxiliary-ac-fan.shroud',condenserFans],
  ['hvac.expansion-valve',climateModule]
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
    need:'This is a retailer listing filtered by vehicle, not a Mercedes diagram. Confirm the kit contents and fitment by VIN.',source:ecsAirCon},
  // Round 2.
  {ids:ids(radiatorMounts,['radiator']),kind:'diagram',
    fact:'The 2004 G500 radiator and components diagram lists the radiator 463-500-11-00 (G500, G55 AMG). The G500 radiator listing gives 463-500-11-00 2002–2008 G500 fitment and a second radiator, 463-500-12-00, 2002–2003 G500 fitment.',
    need:'The listing does not say how the two 2002–2003 radiators differ; confirm which one a given 2002 car carries by VIN. Core size and tank shape are schematic.',source:radiatorListing},
  {ids:ids(coolantTank,['tank']),kind:'diagram',
    fact:'The 2004 G500 radiator and components diagram lists the expansion tank 220-500-00-49 with the cap 210-501-06-15 and level sensor 220-545-00-24. The G500 coolant reservoir listing gives it 2002–2008 G500 fitment.',
    need:'Tank dimensions and hose nipple positions are unmeasured; the shape is schematic.',source:reservoirListing},
  {ids:ids(coolantTank,['vent-hose']),kind:'diagram',
    fact:'The G500 coolant pipe and water hose listings show the vent hose (breather tube, overflow hose) now sold as 000000-000734-64 for the 2006–2008 G500, and list 463-501-17-82 among the numbers it replaces. The 2007 G500 radiator diagram lists the vent hose for the 5.0L.',
    need:'463-501-17-82 is a superseded number read from the replacement list, not from a 2002 diagram. Confirm it is the vent hose fitted to a 2002 car by VIN. Its route is schematic.',source:coolantPipeListing},
  {ids:ids(heaterFittings,['circulation-pump']),kind:'diagram',
    fact:'The 2004 G500 radiator and components diagram lists the recirc pump 001-835-13-64, replaced by 001-835-11-64, with its bracket 210-830-01-14. The G500 water pump listing calls it the auxiliary pump and gives 2002–2008 G500 fitment.',
    need:'Pump size and port directions are unmeasured; the pump is drawn schematically in its bracket.',source:waterPumpListing},
  {ids:ids(climateSensors,['control-head']),kind:'diagram',
    fact:'The 2002 G500 A/C and heater control units page lists the heater control 209-830-04-85 on the instrument panel diagram. The 2004 G500 page lists the same number.',
    need:'Later years may use a different head; the 2005–2008 number was not confirmed. Panel layout and button count are schematic.',source:controlUnits2002},
  {ids:ids(fanDrive,['fan-blade','fan-clutch','shroud']),kind:'diagram',
    fact:'The 2007 G500 cooling fan diagram lists the fan blade 112-200-01-23 (replaced by 112-200-01-23-64), fan clutch 113-200-01-22 and fan shroud 463-505-15-55. The 2004 G500 water pump page lists the same three. The G500 radiator fan, fan clutch and fan shroud listings give each 2002–2008 G500 fitment.',
    need:'Fan diameter, blade count, clutch size and shroud depth are unmeasured. The nine-blade fan and the shroud shape are schematic.',source:coolingFan2007},
  {ids:ids(fanDrive,['shroud-nut']),kind:'diagram',
    fact:'The 2007 G500 cooling fan diagram lists the fan shroud nut 123-504-02-46 (5.0L) with the shroud 463-505-15-55.',
    need:'Read from the 2007 diagram; confirm on a 2002 car by VIN. The number of nuts and their positions on the shroud are not given.',source:coolingFan2007},
  {ids:ids(coolantHoses,['upper-hose','lower-hose']),kind:'diagram',
    fact:'The 2004 G500 water pump and cooling system diagrams list the upper hose 463-501-06-84 and lower hose 463-501-65-82. The G500 coolant pipe listing names them radiator hoses, driver side and passenger side, with 2002–2008 G500 fitment.',
    need:'Hose routes, lengths and bore are unmeasured; the bends are schematic.',source:coolantPipeListing},
  {ids:ids(coolantHoses,['bypass-hose']),kind:'diagram',
    fact:'The 2004 G500 water pump diagram lists the by-pass hose 112-203-03-82. The G500 coolant pipe listing gives it 2002–2005 G500 fitment.',
    need:'Its exact ends at the thermostat and pump housing are not shown on the page; the route is schematic.',source:coolantPipeListing},
  {ids:ids(pumpParts,['pump']),kind:'diagram',
    fact:'The 2004 G500 water pump page lists the water pump 112-200-14-01-80 (with oil cooler fitting, replaced by 112-200-14-01) and 112-200-15-01 (without oil cooler fitting); its first diagram labels them Federal and California. The G500 water pump listing gives both 2002–2008 G500 fitment.',
    need:'Which version a car carries depends on its oil-cooler fitting or emissions market; confirm by VIN. Body shape and port positions are schematic.',source:waterPumpListing},
  {ids:ids(pumpParts,['gasket']),kind:'diagram',
    fact:'The 2004 G500 water pump page lists the water pump gasket 112-201-00-80 (G500, G55 AMG).',
    need:'Gasket outline is drawn as a plain ring; the real outline follows the pump flange.',source:waterPump2004},
  {ids:ids(pumpParts,['pulley']),kind:'diagram',
    fact:'The 2004 G500 water pump page lists the pulley 112-202-01-10. The G500 water pump pulley listing gives it 2002–2008 G500 fitment.',
    need:'Pulley diameter and groove count are unmeasured.',source:pulleyListing},
  {ids:ids(thermostatParts,['thermostat']),kind:'diagram',
    fact:'The 2004 G500 water pump page lists the thermostat 112-203-02-75. The G500 thermostat listing calls it the thermostat housing (engine coolant thermostat, thermostat element), with 2002–2008 G500 fitment; it replaces 112-200-00-15.',
    need:'Opening temperature and housing dimensions are not given on the page. The housing shape is schematic.',source:thermostatListing},
  {ids:ids(thermostatParts,['gasket']),kind:'diagram',
    fact:'The 2004 G500 water pump page lists the thermostat gasket 112-203-00-76. The G500 thermostat gasket listing names it the thermostat unit gasket, with 2002–2008 G500 fitment.',
    need:'The gasket outline is drawn as a ring.',source:thermostatGasketListing},
  {ids:ids(transCooler,['cooler','bracket-right','bracket-left','bushing','pipe-left','pipe-right-front','pipe-right-rear','pipe-clamp']),kind:'diagram',
    fact:'The 2004 G500 transmission oil cooler diagram lists the transmission cooler 463-500-14-00, brackets 463-504-33-40 (passenger side) and 463-504-32-40 (driver side), bushing 126-504-02-12 (both sides), cooling pipes 463-270-03-96 (right side, front), 220-270-03-96 (right side, rear) and 463-500-26-72-64 (left side), and the cooling pipe clamp 000-995-92-42-64 (both sides). The 2007 diagram lists the same cooler, brackets, insulator and pipes.',
    need:'Read from the 2004 and 2007 diagrams; confirm on a 2002 car by VIN. Pipe routes, cooler size and clamp positions are schematic.',source:transCooler2004},
  {ids:ids(transCooler,['return-front','return-rear','cooler-line-right']),kind:'diagram',
    fact:'The 2007 G500 transmission oil cooler diagram lists the return lines 463-270-02-96 (front) and 220-270-02-96 (rear) and the cooler line 463-270-00-96 (passenger side). The 2004 diagram does not list these three.',
    need:'These come from the 2007 diagram only; confirm whether a 2002 car uses them by VIN. Where they join the other pipes is schematic.',source:transCooler2007},
  {ids:ids(refrigerantLines,['discharge','condenser-drier','drier-condenser','liquid','suction']),kind:'diagram',
    fact:'The 2002 G500 condenser, compressor and lines diagram lists the A/C lines 112-230-05-56 (compressor to condenser), 463-500-79-72-64 (drier to evaporator), 463-500-77-72-64 (drier to condenser) and 113-230-19-56-64 (compressor to evaporator), and the A/C hose 463-500-92-72-64 (condenser to drier; G500, G55 AMG). The G500 A/C hose listing gives all five 2002–2008 G500 fitment.',
    need:'The diagram does not show how 463-500-92-72 and 463-500-77-72 share the condenser-to-drier run. Line routes are schematic.',source:airCon2002},
  {ids:ids(acComponents,['compressor']),kind:'diagram',
    fact:'The 2002 G500 condenser, compressor and lines diagram lists the compressor 000-230-86-11-87; the 2004 diagram lists 001-230-28-11-88. The G500 A/C compressor listing gives 000-230-86-11-87 2002–2003 fitment and 001-230-28-11-88 2003–2008 fitment.',
    need:'The 2003 changeover point is not given. Compressor size and mounting ears are schematic.',source:compressorListing},
  {ids:ids(acComponents,['clutch']),kind:'diagram',
    fact:'The 2002 G500 condenser, compressor and lines diagram lists the clutch and pulley 000-230-35-28. The G500 A/C compressor clutch listing gives it 2002–2003 G500 fitment; it replaces 000-230-21-28.',
    need:'The 2004 diagram lists no separate clutch for the later compressor. Pulley diameter and groove count are unmeasured.',source:clutchListing},
  {ids:ids(acComponents,['condenser','drier']),kind:'diagram',
    fact:'The 2002 G500 condenser, compressor and lines diagram lists the condenser assembly 463-500-04-54 and the dehydrator 463-500-02-49. The G500 A/C condenser listing gives the condenser 2002–2008 G500 fitment, and the 2004 diagram lists the same two numbers.',
    need:'Core size and drier height are unmeasured; both are drawn schematically.',source:airCon2002},
  {ids:ids(condenserFans,['fan-motor','grommet','shroud','shroud-insulator','baffle-right','baffle-left','baffle-seal','air-guide']),kind:'diagram',
    fact:'The 2004 G500 condenser fan diagram lists the fan and motor 001-500-15-93 (driver and passenger side), fan and motor grommet 000-997-31-81, fan shroud 463-500-01-55, fan shroud insulator 117-988-01-11 (also the air baffle insulator), air baffles 463-500-00-62 (passenger side) and 463-500-01-62 (driver side), air baffle seal 003-987-17-51 and air guide 463-505-00-30.',
    need:'Read from the 2004 diagram because the 2002 page would not load; confirm on a 2002 car by VIN. Fan diameter, shroud outline and baffle shapes are schematic.',source:condenserFan2004},
  {ids:ids(climateModule,['case','evaporator']),kind:'diagram',
    fact:'The 2002 G500 evaporator and heater components diagram lists the evaporator assembly 209-830-01-62 and evaporator core 209-830-03-58. The G500 evaporator listing names 209-830-01-62 the A/C and heater assembly (case assembly) and gives both 2002–2008 G500 fitment.',
    need:'Case and core dimensions are unmeasured; both are drawn as boxes.',source:evaporatorListing},
  {ids:ids(climateModule,['heater-core']),kind:'diagram',
    fact:'The 2002 G500 evaporator and heater components diagram lists the heater core 203-830-01-61 (replaced by 203-830-01-61-64). The G500 heater core listing gives it 2002–2008 G500 fitment.',
    need:'Core size and tube positions are unmeasured.',source:heaterCoreListing},
  {ids:ids(climateModule,['expansion-valve']),kind:'diagram',
    fact:'The 2002 G500 evaporator and heater components diagram lists the expansion valve 220-830-03-84; the 2004 diagram lists 230-830-01-84. The G500 A/C expansion valve listing gives 220-830-03-84 2002–2003 fitment and 230-830-01-84 2003–2008 fitment.',
    need:'The 2003 changeover point is not given. Valve block size is unmeasured.',source:expansionValveListing},
  {ids:ids(climateModule,['blower-motor','blower-case']),kind:'diagram',
    fact:'The 2002 G500 evaporator and heater components diagram lists the blower motor 203-820-25-14-64 and blower case 203-830-05-03.',
    need:'Motor and scroll dimensions are unmeasured; their position on the case is schematic.',source:blower2002}
];
