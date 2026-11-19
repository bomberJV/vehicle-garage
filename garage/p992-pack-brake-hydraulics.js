// 992 study pack: brake-hydraulics.
// Scope: Brake master cylinder, brake booster, fluid reservoir, PSM/ABS hydraulic unit and its brackets, wheel-speed sensors, brake pedal.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-brake-hydraulics-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// The car is a US (left-hand drive) 2023 Carrera S Cabriolet, so right-hand-drive
// rows are left out. Where the catalogue splits a part by option (the hydraulic
// unit by driver-assistance equipment) each current option keeps its own row.
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {metal,steel,dark,cyl,sleeve,turn,x,z} from './mechanism-shapes.js';

export const hooks=["service-porsche992scab-brakes-master.barrel", "service-porsche992scab-brakes-master.pistons", "service-porsche992scab-brakes-master.spring", "service-porsche992scab-brakes-master.reservoir", "service-porsche992scab-brakes-abs.block", "service-porsche992scab-brakes-abs.valves", "service-porsche992scab-brakes-abs.pump", "service-porsche992scab-brakes-abs.connector"];

const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const plastic='#d9d6cc',alloy='#9aa5a8';
const box=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);

// Translucent reservoir body with its filler neck.
const reservoir=(r,c)=>{box(r,c,[.14,.07,.07],plastic);cyl(r,plus(c,[-.03,0,.035]),z,0,.03,.022,plastic,14);};
// Round vacuum servo: a short drum with the push-rod stub behind it.
const servo=(r,c)=>{cyl(r,plus(c,[-.04,0,0]),x,0,.08,.1,dark,28);cyl(r,plus(c,[-.07,0,0]),x,0,.03,.012,steel,10);};
// Tandem master cylinder: bore body, mounting flange and two reservoir ports.
const master=(r,c)=>{cyl(r,plus(c,[-.1,0,0]),x,0,.2,.024,alloy,16);sleeve(r,plus(c,[-.1,0,0]),x,0,.012,.05,.024,alloy,16);for(const s of [-.02,.05])cyl(r,plus(c,[s,0,.02]),z,0,.025,.012,alloy,10);};
// Hydraulic unit: valve block with the pump motor and the control-unit connector.
const hcu=(r,c)=>{box(r,c,[.13,.09,.1],alloy);cyl(r,plus(c,[0,0,.05]),z,0,.04,.03,dark,16);box(r,plus(c,[.08,0,-.02]),[.03,.06,.04],dark);};
// Bottle of brake fluid.
const fluid=(r,c)=>turn(r,plus(c,[0,0,-.06]),z,[[0,0],[0,.035],[.09,.035],[.11,.015],[.12,.015],[.12,0]],metal,{n:16});

const master604={id:'master-cylinder',code:'604-000',title:'Brake master cylinder and brake servo',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/604-000/BRAKE_MASTER_CYLINDER',
  rows:[
    ['1','992616123Y','Brake fluid reservoir',reservoir],
    ['2','5Q0611349B','Cap for brake fluid reservoir'],
    ['3','992698181C','Repair set, ref. 3'],
    ['4','992614105AK','Brake servo, left-hand drive',servo],
    ['5','992614019','Brake master cylinder',master],
    ['6','992698181A','Repair set, ref. 6'],
    ['7','992698181D','Repair set distance piece, left-hand drive'],
    ['8','992612161','Seal'],
    ['9','N 02300314','Self-locking hexagon nut M8, brake pedal attachment'],
    ['10','00004321086','Brake fluid, 30 l',fluid],
  ]};

const abs605={id:'hydraulic-unit',code:'605-000',title:'Hydraulic unit, anti-lock brake system',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/605-000/HYDRAULIC_UNIT',
  rows:[
    ['1','992698517AM','ABS hydraulic unit, without lane change assist, from 09.01.2023',hcu],
    ['1','992698517AE','ABS hydraulic unit, with lane change assist, from 09.01.2023',hcu],
    ['1','992698517AN','ABS hydraulic unit, with adaptive cruise control, from 09.01.2023',hcu],
    ['2','992614513','Retainer, upper part of hydraulic unit'],
    ['3','N 90691601','Socket head combination bolt M10x1x17'],
    ['4','992614335','Bracket, lower part of hydraulic unit'],
    ['5','95835517710','Stop buffer, included with the lower bracket'],
    ['6','9A700843300','Bolt with washer M8x30'],
  ]};

const prefix='p992-brake-hydraulics-';
export const studies=[catalogueStudy(master604,prefix),catalogueStudy(abs605,prefix)];
export const views=new Map([
  [hooks[0],studies[0]],
  [hooks[4],studies[1]],
]);
