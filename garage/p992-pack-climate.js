// 992 study pack: climate.
// Scope: Air conditioning and heating: A/C compressor, condensers, refrigerant lines, receiver-drier, expansion valve, evaporator, heater core, blower, air distribution box, climate control unit, cabin filter.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-climate-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy,catalogueShapes} from './porsche992-catalog-studies.js';
import {cyl,z} from './mechanism-shapes.js';

export const hooks=["p992-hvac.compressor", "p992-hvac.discharge", "p992-hvac.condenser-left", "p992-hvac.condenser-right", "p992-hvac.bridge", "p992-hvac.metering", "p992-hvac.evaporator", "p992-hvac.suction", "p992-hvac.heater", "p992-cabin-blower.wheel", "p992-cabin-blower.motor", "p992-cabin-blower.case", "p992-receiver.shell", "p992-receiver.charge", "p992-receiver.head"];

const housing=(r,c)=>catalogueShapes.housing(r,c);
const core=(r,c)=>catalogueShapes.core(r,c);
const canister=(r,c)=>{cyl(r,[c[0],c[1],c[2]-.08],z,0,.15,.03,'#9aa5a8',16);cyl(r,[c[0],c[1],c[2]+.07],z,0,.02,.018,'#3a3f42',10);};

// The 2019 and 2020 (992-1) pages are Carrera catalogue pages. The two pages
// under /Porsche/992-1/2020/ name only the year; their cabin parts are listed
// here with the page year alone.
const diagrams=[
{id:'compressor',code:'814-200',title:'A/C compressor and engine refrigerant lines',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/814-200/AIR_CONDITIONER_COMPRESSOR',
 rows:[['1','992260601BX','A/C compressor',housing],['2','PAF008143','Hexagon head bolt M8x170'],['3','PAF008155','Hexagon head bolt BM8x90'],['4','N 10414402','Socket head bolt M8x28'],
  ['5','992260350A','Suction line, engine (from 22.03.2019)'],['6','992260336','Pressure line, engine'],['7','9A757390010','A/C compressor oil, 250 ml'],['8','95557374903','O-ring 23.8x2.4'],['9','95557374901','O-ring 11x2.5']]},
{id:'condenser',code:'814-300',title:'A/C condenser and air guide housing',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/814-300/AIR_CONDTIONER_CONDENSER',
 rows:[['1','992820411','A/C condenser',core],['2','992820860','Sealing frame, A/C condenser'],['3','992815217A','Air guide, centre'],['5','992815216C','Air guide, right'],['6','992815215C','Air guide, left'],
  ['7','PAF008437','Hexagon bolt M6x20'],['8','9A7820535','Outside temperature sensor']]},
{id:'front-lines',code:'814-800',title:'Front refrigerant lines in the wheel housing',year:'2020 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/814-800/AIR_CONDITIONER',
 rows:[['1','992816528C','Refrigerant line, front wheel housing'],['2','992816530','Refrigerant line to condenser'],['3','992820761A','Bracket for refrigerant pipe'],['4','971260197','Bracket for refrigerant pipe'],
  ['5','9P1816765','Bracket for refrigerant pipe, D10/D12'],['6','PAF108488','Combination holder'],['7','N 10742702','Oval-head socket bolt M8x25, aluminium'],['8','95557374901','O-ring'],['9','N 10414402','Socket head bolt M8x28']]},
// The refrigerant lines and the row marked rhd on this page are left out.
{id:'drier',code:'814-701',title:'Receiver-drier, line brackets and A/C pressure sensor',year:'2019 (992-1)',
 url:'https://eurospares.co.uk/Porsche/992-1/2019/PartDiagrams/814-701/AIR_CONDITIONER',
 rows:[['4','992820077 Y','Receiver-drier',canister],['5','992820770','Bracket for drier'],['6','992820787','Bracket for coolant line'],['7','992820195','Bracket for coolant line'],['8','992820761','Bracket for refrigerant pipe'],
  ['9','PAF108488','Combination holder'],['10','9P1819827','Bracket for refrigerant line'],['11','N 10742702','Oval-head socket bolt M8x25, aluminium'],['12','N 91096702','Oval-head socket bolt M6x16'],
  ['13','N 10700201','Hexagon socket head bolt M6x22'],['14','N 90969901','Hexagon socket locating bolt M6x25'],['15','N 01508210','Shouldered hexagon nut M6'],['16','9A700738000','Speed nut ST4.8x22x18'],
  ['17','N 0245226','Clamp 60-80x9x0.5'],['18','95557374902','O-ring'],['19','99970765240','O-ring 7.5x2.1'],['20','95557374901','O-ring'],['21','PAB959126','A/C pressure sensor'],
  ['22','PAB820581','Protective cap'],['23','PAB820581A','Protective cap']]},
// Rows marked rhd on this page (distribution housing, blower housing, blower motor, harness) are left out.
{id:'hvac-unit',code:'814-001',title:'Air conditioner unit: cabin filter, expansion valve and sensors',year:'2020',
 url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/814-001/AIR_CONDITIONER',
 rows:[['4','9P1819631','Odour and allergen filter'],['5','992820955','Cover, filter housing'],['6','992820651','Gasket, blower housing'],['7','992820513','Gasket, air distribution housing'],
  ['8','992816597','Expansion valve'],['9','8K0820261','Gasket set'],['11','PAB82051101','Flap adjustment motor',housing],['12','97065325300','Temperature sensor'],['13','992820539','Temperature sensor for evaporator'],
  ['14','92857042300','Retaining clip for blower housing'],['15','8K0898540','Set of securing bolts'],['16','992820667','Grommet, air conditioner'],['17','992820124C','Water drain hose'],
  ['18','992819473','Heater bracket'],['19','992819474','Heater bracket'],['20','992820098','Grommet, firewall, expansion valve'],['21','992820668','Gasket, firewall'],
  ['22','N 01508210','Shouldered hexagon nut M6'],['23','PAF008496','Hose clamp 22.7-24.7'],['24','N 90536901','Rivet 5x11']]},
{id:'air-ducts',code:'814-100',title:'Dashboard air ducts and footwell vents',year:'2020',
 url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/814-100/AIR_CONDITIONER',
 rows:[['1','992820715A','Air duct, centre'],['2','992820157','Air duct, left side'],['3','992820158','Air duct, right side'],['4','992819151','Footwell vent, left'],['5','992819152','Footwell vent, right'],
  ['6','1H0819943','Round-head screw'],['7','N 10583501','Rivet'],['8','95857230400','Temperature sensor']]},
];

export const studies=diagrams.map(d=>catalogueStudy(d,'p992-climate-'));
const by=id=>studies.find(s=>s.id==='p992-climate-'+id);
export const views=new Map([
 ['p992-hvac.compressor',by('compressor')],
 ['p992-hvac.discharge',by('compressor')],
 ['p992-hvac.suction',by('compressor')],
 ['p992-hvac.condenser-left',by('condenser')],
 ['p992-hvac.condenser-right',by('condenser')],
 ['p992-hvac.bridge',by('front-lines')],
 ['p992-receiver.shell',by('drier')],
 ['p992-hvac.metering',by('hvac-unit')],
 ['p992-hvac.evaporator',by('hvac-unit')],
 ['p992-cabin-blower.case',by('hvac-unit')],
 ['p992-hvac.heater',by('air-ducts')],
]);
