// 992 study pack: electrics.
// Scope: Electrical power and control: battery and its tray, starter, alternator, main cables and earth straps, fuse and relay carriers, control units (engine, gateway, body), wiring harnesses.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-electrics-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {cyl,turn,metal,steel,dark,gold,x,y,z} from './mechanism-shapes.js';

export const hooks=["electrical.battery", "electrical.cables", "service-porsche992scab-electrical-starter.case", "service-porsche992scab-electrical-starter.rotor", "service-porsche992scab-electrical-starter.stator", "service-porsche992scab-electrical-starter.drive", "service-porsche992scab-electrical-generator.case", "service-porsche992scab-electrical-generator.rotor", "service-porsche992scab-electrical-generator.stator", "service-porsche992scab-electrical-generator.drive", "service-porsche992scab-electrical-fuses.carrier", "service-porsche992scab-electrical-fuses.links", "service-porsche992scab-electrical-fuses.feed"];

const plus=(a,b)=>a.map((v,i)=>v+b[i]);
// Starter: motor can with the solenoid on top and the pinion nose.
const starter=(r,c)=>{
  cyl(r,plus(c,[-.09,0,0]),x,0,.13,.035,dark,16);
  cyl(r,plus(c,[-.07,0,.05]),x,0,.08,.018,metal,12);
  cyl(r,plus(c,[.04,0,0]),x,0,.05,.014,steel,12);
};
// Alternator: finned body with the drive pulley on the front.
const alternator=(r,c)=>{
  cyl(r,plus(c,[0,-.03,0]),y,0,.07,.05,metal,18);
  turn(r,plus(c,[0,-.05,0]),y,[[0,0],[0,.026],[.02,.026],[.02,0]],steel,{n:16});
};

// Porsche catalogue diagram 902-050 (992, 2019 catalogue).
const starterDiagram={id:'starter-alternator',code:'902-050',title:'Starter and alternator',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/992_(2019)/PartDiagrams/902-050/STARTER',
  rows:[
    ['1','0PB911021','Starter',starter],
    ['2','9A700815900','Torx screw M10x35'],
    ['3','N 10609207','Shouldered hex nut M8, lock nut'],
    ['4','N 01508210','Shouldered hex nut M6'],
    ['5','0PB903018','Alternator (PR D5S)',alternator],
    ['6','0PB903021','Alternator (PR DW1)',alternator],
    ['7','PAA971537','Ground strap, alternator'],
    ['8','PAF008145','Hexagon head bolt M8'],
    ['9','PAA971793','Wiring harness for battery positive, starter and alternator (PR DW1)'],
    ['9','PAA971793A','Wiring harness for battery positive, starter and alternator (PR D5S, DW2)'],
    ['10','PAA971883','Cap for starter'],
    ['13','992974524A','Wiring conduit for the battery positive, starter and alternator harness'],
    ['14','PAF008227','Cheese head screw M10x20'],
    ['15','9A700812500','Torx screw M6x16'],
  ]};

// Porsche catalogue diagram 902-100 (992-1, 2020 catalogue).
const harnessDiagram={id:'harnesses',code:'902-100',title:'Wiring harnesses',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/902-100/HARNESS',
  rows:[
    ['1','PAA992001','Wiring harness, passenger compartment (ordered with the full VIN)'],
    ['2','PAA992003','Dashboard wiring harness (ordered with the full VIN)'],
    ['3','992972155C','Bumper wiring harness, left front (PR 2D0, 7X2, 7X5)'],
    ['3','992972155J','Bumper wiring harness, left front (PR 2D0, 7X0, 7X1)'],
    ['3','992972155T','Bumper wiring harness, left front (PR 2D1, 2D4, 2D5, VM2, VM3, 7X2, 7X5)'],
    ['3','992972155AF','Bumper wiring harness, left front (PR 2D1, 2D4, 2D5, VM2, VM3, 7X0, 7X1)'],
    ['4','992972156A','Bumper wiring harness, right front (PR 2D0, 7X2, 7X5)'],
    ['4','992972156M','Bumper wiring harness, right front (PR 2D0, 7X0, 7X1)'],
    ['4','992972156S','Bumper wiring harness, right front (PR 2D1, 2D4, 2D5, VM2, VM3, 7X2, 7X5)'],
    ['4','992972156AK','Bumper wiring harness, right front (PR 2D1, 2D4, 2D5, VM2, VM3, 7X0, 7X1)'],
    ['5','992970248 Y','Sectional wiring harness, left front, lighting'],
    ['5','992970242 Y','Sectional wiring harness, right front, lighting'],
    ['6','992970042 Y','Sectional wiring harness, front end, left'],
    ['6','992970270 Y','Sectional wiring harness, front end, right'],
    ['7','992970289 Y','Sectional wiring harness, front end, left'],
    ['7','992970117 Y','Sectional wiring harness, front end, right'],
    ['8','992970101 Y','Sectional wiring harness, fuel system'],
    ['9','992971279','ABS wiring harness, front axle, left and right'],
  ]};

const box=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
// Battery: a dark case with two terminal posts on top.
const battery=(r,c)=>{
  box(r,c,[.17,.09,.1],dark);
  for(const s of [-1,1])cyl(r,plus(c,[s*.055,0,.05]),z,0,.018,.01,s<0?gold:metal,10);
};
// Blade fuse: a coloured body with two blades below.
const fuse=color=>(r,c)=>{
  box(r,plus(c,[0,0,.015]),[.04,.012,.03],color);
  for(const s of [-1,1])box(r,plus(c,[s*.011,0,-.015]),[.006,.004,.03],metal);
};
const mini=fuse('#c9a640'),maxi=fuse('#5b8fc9'),plugin=fuse('#c95b4f');

// Porsche catalogue diagram 902-000 (992-1, 2020 catalogue).
const fuseDiagram={id:'fuse-box',code:'902-000',title:'Fuse box and relay plate',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/902-000/FUSE_BOX_RELAY_PLATE',
  rows:[
    ['1','992937615','Fuse holder, left'],
    ['2','992937503','Relay plate, fuse holder'],
    ['3','9P1971457','Bracket for connector housing, passenger compartment connection point'],
    ['4','992971458','Bracket, connection point'],
    ['5','N 91018901','Hexagon plastic collar nut C6'],
    ['6','992937552','Bracket, socket'],
    ['7','992937619B','Main fuse socket, lower part'],
    ['8','992927203','Relay plate, main fuse socket'],
    ['9','992937132A','Main fuse socket cover'],
    ['10','992971457','Bracket, connection point, centre console'],
    ['11','992937617','Fuse holder, right'],
    ['12','992937507','Fuse holder, rear'],
    ['13','PAA102615','Flat fuse 10/2x2.8, 5 A',mini],
    ['13','PAA102615A','Flat fuse 10/2x2.8, 7.5 A',mini],
    ['13','PAA102615B','Flat fuse 10/2x2.8, 10 A',mini],
    ['13','PAA102615C','Flat fuse 10/2x2.8, 15 A',mini],
    ['14','N 01713111','Flat fuse 19/2x5, 10 A',maxi],
    ['14','N 01713112','Flat fuse 19/2x5, 15 A',maxi],
    ['14','N 01713113','Flat fuse 19/2x5, 20 A',maxi],
    ['14','N 01713114','Flat fuse 19/2x5, 25 A',maxi],
    ['14','N 01713115','Flat fuse 19/2x5, 30 A',maxi],
    ['14','N 01713122','Flat fuse 19/2x5, 35 A',maxi],
    ['15','PAA911863','Plug-in fuse, 30 A',plugin],
    ['15','PAF911863','Plug-in fuse, 40 A',plugin],
    ['15','N 91186305','Plug-in fuse, 50 A',plugin],
    ['15','PAA911863A','Plug-in fuse, 60 A',plugin],
    ['16','4H0951253C','Relay, location /646'],
    ['17','95861502900','Relay, location /645'],
    ['18','95861500801','Relay, location /644'],
    ['19','2GC951253','Relay (PR I8L premium radio, I8Z top infotainment)'],
    ['20','9P1915638','Contact piece'],
  ]};

// Porsche catalogue diagram 902-060 (992-1, 2021 catalogue). The right-hand-drive rail is left out.
const batteryDiagram={id:'battery',code:'902-060',title:'Battery',year:'2021 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2021_(992-1)/PartDiagrams/902-060/Battery',
  rows:[
    ['1','9Y0915107RY','Battery, LiFePO4 580 A (60 Ah) (PR J2A)',battery],
    ['2','992915319A','Battery retainer'],
    ['3','PAF107511','Oval-head hexagon socket bolt M6x20'],
    ['4','9P3915345','Battery rail (left-hand drive)'],
    ['5','N 10653101','Hexagon flange bolt M8x20'],
    ['6','V04015800BA','Transport container'],
  ]};

// Porsche catalogue diagram 901-030 (992-1, 2024 catalogue). The coupe cover and the PDK control unit, retainer and bolt are left out.
const controlDiagram={id:'control-units',code:'901-030',title:'Control units: engine, gateway and chassis',year:'2024 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/901-030/Control_units',
  rows:[
    ['1','992907051','Engine control unit, without software (PR A8C, A8F)'],
    ['2','PAF008922','Hexalobular flange screw M6x16'],
    ['3','992907645B','Retainer for the engine control unit'],
    ['4','PAF008497','Spacer bush 10x25x9.5'],
    ['5','PAF008573','Hexagon nut M6'],
    ['10','992906093C','Control unit for the fuel pump'],
    ['11','N 10015101','Hexagon nut A5'],
    ['12','PAB907468U','Gateway control unit (from 07.06.2023)'],
    ['13','N 01508210','Hexagon collar nut M6'],
    ['14','992959411A','Control unit, axle lift (from 02.12.2020; PR 2UH)'],
    ['15','N 91158501','Spreader rivet (PR 2UH)'],
    ['16','992907156AF','PDCC control unit (from 11.02.2023; PR 1P7)'],
    ['17','992910376AF','Chassis control unit (PR 1P0, standard suspension)'],
    ['18','992907113A','Retainer for the chassis control unit (from 28.11.2019)'],
    ['19','N 10669501','Fillister head bolt M5x12, multi-point socket'],
    ['21','992907145H','Control unit for the electro-hydraulic engine mounts (PR JQ3)'],
    ['22','992907479S','Rear spoiler control unit (PR AV0, AV1)'],
    ['22','PAA907483','Rear spoiler adjustment control unit (PR AV2, North America)'],
  ]};

// Porsche catalogue diagram 901-040 (992-1, 2020 catalogue). The right-hand-drive retainer is left out.
const bodyDiagram={id:'body-control-units',code:'901-040',title:'Control units: body (BCM) and driver assistance',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/901-040/CONTROL_UNITS',
  rows:[
    ['1','PAD907063','Body control module (BCM) for convenience system and on-board power supply (from 07.06.2023)'],
    ['2','992907114B','Retainer for the body control module (left-hand drive)'],
    ['3','992907461A','Retainer for the body control module'],
    ['4','992907064BT','Rear body control module (BCM) for convenience system and on-board power supply (from model year 2021)'],
    ['5','N 91018901','Hexagon plastic collar nut 6'],
    ['6','PAB907117B','Driver assistance control unit (from model year 2023; PR KA6)'],
    ['7','992907682C','Retainer for control unit (PR KA0, KA2)'],
    ['8','N 90737107','Oval-head hexagon socket bolt M6x12'],
    ['9','PAB907410','Garage door opener control unit (PR VC2)'],
    ['10','992907681B','Retainer for the garage door opener control unit (PR VC2)'],
    ['11','992907483R','Rear spoiler adjustment control unit (from 21.06.2021)'],
  ]};

// Porsche catalogue diagram 902-080 (992-1, 2020 catalogue).
const engineHarnessDiagram={id:'engine-harness',code:'902-080',title:'Engine wiring harness',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/902-080/HARNESS',
  rows:[
    ['1','0PB971595R','Engine wiring harness, for electronic roll stabilisation (PR DW1, D5S, 1P7)'],
    ['1','0PB971595S','Engine wiring harness, for standard chassis (PR DW1, D5S, 1P0)'],
    ['2','PAF008124','Hexagon head bolt BM6x12'],
  ]};

// Porsche catalogue diagram 902-200 (992-1, 2019 catalogue). The PDK gearbox harness is left out.
const rearHarnessDiagram={id:'rear-harnesses',code:'902-200',title:'Rear wiring harnesses',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/902-200/HARNESS',
  rows:[
    ['1','992971174H','Wiring set for the rear bumper'],
    ['2','992970218 Y','Sectional wiring set, engine compartment'],
    ['3','992970081 Y','Sectional wiring harness, rear axle, left'],
    ['3','992970071 Y','Sectional wiring harness, rear axle, right'],
    ['4','992970094 Y','Sectional wiring harness, rear wheel housing, left'],
    ['4','992970064 Y','Sectional wiring harness, rear wheel housing, right'],
    ['5','992970068 Y','Sectional wiring harness, rear lighting, left'],
    ['5','992970211 Y','Sectional wiring harness, rear lighting, right'],
    ['6','992971286','ABS wiring harness, rear axle, left and right'],
    ['7','992971182C','Wire set, engine compartment lid and rear spoiler'],
    ['8','992971878A','Cable support sleeve'],
    ['10','9P1971792','Cover, rear axle wire set connection point'],
    ['11','992971043B','Wire set for the left and right exhaust flap servomotors'],
    ['12','992907101','Wiring harness holder, rear wheel housing, left (PR 0N5)'],
    ['12','992907102','Wiring harness holder, rear wheel housing, right (PR 0N5)'],
  ]};

// Porsche catalogue diagram 902-150 (992-1, 2020 catalogue).
const doorDiagram={id:'door-electrics',code:'902-150',title:'Door control units and wiring',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/902-150/DOORS',
  rows:[
    ['1','PAD959792','Door control unit, passenger side'],
    ['1','PAD959793','Door control unit, driver side'],
    ['2','V04015358C','Door trim panel wiring harness, driver side (PR QQ2; ordered with the full VIN)'],
    ['3','V04015067C','Door trim panel wiring harness, passenger side (PR QQ2; ordered with the full VIN)'],
    ['4','V04015118B','Inner door panel wiring harness, left, Cabriolet (ordered with the full VIN)'],
    ['5','V04015031B','Inner door panel wiring harness, right, Cabriolet (ordered with the full VIN)'],
  ]};

export const studies=[starterDiagram,harnessDiagram,fuseDiagram,batteryDiagram,controlDiagram,bodyDiagram,engineHarnessDiagram,rearHarnessDiagram,doorDiagram].map(d=>catalogueStudy(d,'p992-electrics-'));
const [starterStudy,harnessStudy,fuseStudy,batteryStudy,controlStudy,bodyStudy,engineHarnessStudy,rearHarnessStudy,doorStudy]=studies;
export const views=new Map([
  ['service-porsche992scab-electrical-starter.case',starterStudy],
  ['service-porsche992scab-electrical-generator.case',starterStudy],
  ['electrical.cables',harnessStudy],
  ['electrical.battery',batteryStudy],
  ['service-porsche992scab-electrical-fuses.carrier',fuseStudy],
  ['service-porsche992scab-electrical-fuses.feed',controlStudy],
  // Nested: body control units under the gateway, the engine harness under the
  // battery-positive starter harness, door wiring under the passenger compartment
  // harness and the rear harnesses under the front-axle ABS harness.
  ['p992-electrics-control-units.r12-pab907468u',bodyStudy],
  ['p992-electrics-starter-alternator.r9-paa971793a',engineHarnessStudy],
  ['p992-electrics-harnesses.r1-paa992001',doorStudy],
  ['p992-electrics-harnesses.r9-992971279',rearHarnessStudy],
]);
