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
import {cyl,turn,metal,steel,dark,x,y} from './mechanism-shapes.js';

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

export const studies=[starterDiagram,harnessDiagram].map(d=>catalogueStudy(d,'p992-electrics-'));
const [starterStudy,harnessStudy]=studies;
export const views=new Map([
  ['service-porsche992scab-electrical-starter.case',starterStudy],
  ['service-porsche992scab-electrical-generator.case',starterStudy],
  ['electrical.cables',harnessStudy],
]);
