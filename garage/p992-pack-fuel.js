// 992 study pack: fuel.
// Scope: Fuel system: tank and its fittings, filler, fuel pump and sender, fuel lines, high-pressure pump, injectors and rails, evaporative emission canister.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-fuel-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["fuel.filler", "fuel.supply", "service-porsche992scab-fuel-tank.shell", "service-porsche992scab-fuel-tank.neck", "service-porsche992scab-fuel-tank.mount", "service-porsche992scab-fuel-sender.flange", "service-porsche992scab-fuel-sender.arm", "service-porsche992scab-fuel-sender.float", "service-porsche992scab-fuel-pump.case", "service-porsche992scab-fuel-pump.armature", "service-porsche992scab-fuel-pump.stage", "service-porsche992scab-fuel-pump.outlet", "service-porsche992scab-fuel-rail.rail", "service-porsche992scab-fuel-rail.body", "service-porsche992scab-fuel-rail.tips", "service-porsche992scab-fuel-rail.seals"];
import {catalogueStudy} from './porsche992-catalog-studies.js';

const tank={id:'fuel-tank',code:'201-000',title:'Fuel tank and filler neck',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/201-000/FUEL_TANK',
  rows:[
    ['1','992201075E','Fuel tank, 64 litre, left-hand drive, rear-wheel drive'],
    ['1','992201075K','Fuel tank, 90 litre, left-hand drive'],
    ['2','N 91159101','Hexagon head bolt (combi), M8x40'],
    ['3','9P1864714','Foam pad'],
    ['4','992201531','Distance piece, rear-wheel drive'],
    ['5','992201975A','Tank underside protection, left-hand drive, rear-wheel drive'],
    ['6','992201392','Tank tensioning strap, rear-wheel drive'],
    ['8','PAF108050','Hexagon head bolt (combi), M8x35, rear-wheel drive'],
    ['10','992201550G','Fuel tank cap with retaining strap'],
    ['11','992201106D','Fuel filler neck'],
    ['12','992201543A','Filler neck hose'],
    ['13','992201139','Spring band clamp, 43x12'],
    ['14','N 91096702','Oval hexagon socket head bolt, M6x16'],
    ['15','00004320902','Multi-purpose fuel additive for petrol engines, 100 ml'],
  ]};

const pump={id:'fuel-pump',code:'201-050',title:'Fuel pump and fuel gauge sender',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/201-050/FUEL_PUMP',
  rows:[
    ['1','992919087','Fuel pump module, 64 and 90 litre tank, rear-wheel drive'],
    ['2','992919679','Pump mounting flange'],
    ['3','992201455','Seal ring, pump opening'],
    ['4','992201768','Lock ring, pump opening'],
    ['5','992919673D','Sender for fuel gauge'],
  ]};

const injection={id:'injection',code:'107-000',title:'Injection system, high-pressure pump and injectors',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/107-000/INJECTION_SYSTEM',
  rows:[
    ['1','0PB128373F','Fuel collection pipe, cylinders 1-3, with three high-pressure injectors'],
    ['2','0PB128374F','Fuel collection pipe, cylinders 4-6, with three high-pressure injectors'],
    ['3','0PB127025A','High-pressure fuel pump'],
    ['4','PAF008126','Hexagon head bolt, M6x20'],
    ['5','0PB128615B','High-pressure injector'],
    ['6','N 91073402','Hex collared bolt, M8x75'],
    ['7','0PB127501F','High-pressure fuel line, cylinders 1-3, with pressure sensor'],
    ['8','0PB127509H','High-pressure fuel line, cylinders 4-6, with pressure sensor'],
    ['9','0PB127503B','Low-pressure fuel line with pressure sensor'],
    ['10','0PB127411A','Retainer for fuel line'],
    ['11','N 10756001','Flat head bolt with hexagon socket, M6x14, thread forming'],
    ['13','PAF008320','Sealing plug, M12x1.5x15'],
    ['14','992906051','Fuel pressure sensor, high-pressure line'],
    ['15','PAB906054B','Fuel pressure sensor, low-pressure side'],
    ['16','0PB127505A','Low-pressure fuel line'],
    ['17','0PB128626','Injector retaining clip'],
    ['18','0PB127219','Injector spacer ring'],
    ['19','PAF006121','Injector O-ring'],
    ['20','0PB127291','Injector retaining ring'],
    ['21','0PB128071','Injector thrust ring'],
    ['22','0PB127199','Injector securing ring'],
    ['23','0PB825411','Injector seal'],
    ['24','0PB127269','Injector combustion seal'],
    ['25','0PB127404','Seal ring'],
    ['26','PAF008476','O-ring, 31x2, high-pressure pump'],
    ['27','00004320935','Special lubricant for fuel line fittings'],
  ]};

const lineFront={id:'fuel-line-front',code:'201-100',title:'Fuel line, front',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/201-100/FUEL_LINE',
  rows:[
    ['1','992201080A','Fuel line, front, complete'],
    ['2','992201171','Line holder, 1-point'],
    ['3','992201171E','Line holder, 1-point'],
    ['4','992201171A','Line holder, 5-point'],
    ['5','992201171B','Line holder, 3-point'],
    ['6','992201171F','Line holder, 2-point'],
  ]};

const lineRear={id:'fuel-line-rear',code:'201-150',title:'Fuel line, rear',year:'2024 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/201-150/Fuel_line_rear',
  rows:[
    ['1','992201082A','Fuel line, rear, complete'],
    ['2','992201171C','Line holder, 5-point'],
    ['3','992201171G','Line holder, 2-point'],
    ['4','992201171F','Line holder, 2-point'],
  ]};

const vent={id:'tank-ventilation',code:'107-300',title:'Breather line, tank ventilation',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/107-300/BREATHER_LINE',
  rows:[
    ['1','992201123','Tank breather line, left-hand drive, with unleaded filler insert'],
    ['3','992201123B','Tank breather line, left-hand drive'],
    ['4','992201171H','Line holder'],
    ['5','0PB133352B','Breather line, activated carbon filter to turbocharger intake'],
    ['6','PAF009329','O-ring, 6.7x1.8'],
    ['7','PAF009329A','O-ring, 6.7x1.8'],
    ['8','7P5906051','Pressure sensor, tank ventilation'],
  ]};

const canister={id:'charcoal-canister',code:'201-200',title:'Activated charcoal container',year:'2024 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/201-200/Activated_charcoal_container',
  rows:[
    ['1','992201801','Activated charcoal canister'],
    ['2','992201801P','Activated charcoal canister, complete assembly'],
    ['3','992201164','Canister cover'],
    ['4','9P1201370','Canister filter element'],
    ['5','992201581','Canister housing'],
    ['6','9P1201180','Activated carbon filter grommet'],
    ['7','958906243A','Fuel system diagnosis pump, North America'],
    ['8','992898810','Diagnosis pump repair set'],
    ['9','N 10405604','Oval hexagon socket head bolt, M6x14'],
    ['10','992201390A','Canister breather line, USA'],
  ]};

const P='p992-fuel-';
export const studies=[tank,pump,injection,lineFront,lineRear,vent,canister].map(d=>catalogueStudy(d,P));
const [tankS,pumpS,injS,frontS,rearS,ventS,canS]=studies;
const h='service-porsche992scab-';
export const views=new Map([
  [h+'fuel-tank.shell',tankS],[h+'fuel-tank.mount',tankS],['fuel.filler',tankS],
  [h+'fuel-tank.neck',ventS],
  [h+'fuel-sender.flange',pumpS],[h+'fuel-sender.arm',pumpS],[h+'fuel-sender.float',pumpS],
  [h+'fuel-pump.case',pumpS],[h+'fuel-pump.armature',pumpS],[h+'fuel-pump.stage',pumpS],
  ['fuel.supply',frontS],[h+'fuel-pump.outlet',rearS],
  [h+'fuel-rail.rail',injS],[h+'fuel-rail.body',injS],[h+'fuel-rail.tips',injS],[h+'fuel-rail.seals',injS],
  // The carbon-filter breather line in the tank-ventilation study opens the canister itself.
  [P+'tank-ventilation.r5-0pb133352b',canS],
]);
