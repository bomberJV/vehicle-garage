// 992 study pack: cooling.
// Scope: Engine cooling: coolant pumps, thermostats, coolant pipes and hoses, expansion tank, coolant valves (radiators 105-200 are already done).
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-cooling-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy} from './porsche992-catalog-studies.js';

export const hooks=["p992-coolant.distributor", "p992-coolant.feed", "p992-coolant.return", "p992-coolant.heater-feed", "992frontcoolant.inlet", "992frontcoolant.outlet", "992frontcoolant.shroud", "992frontcoolant.fan", "992frontcoolant.feed", "992frontcoolant.return", "992frontcoolant.pump", "992frontcoolant.thermostat", "992frontcoolant.jacket"];

const P='p992-cooling-';

const pump={id:'coolant-pump',code:'105-000',title:'Coolant pump, thermostat and thermostat housing',year:'2020 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/105-000/WATER_PUMP',
 rows:[['1','0PB121010D','Coolant pump (complete) with pulley'],['2','0PB121005C','Coolant pump with pulley'],['3','0PB121031','Coolant pump pulley'],['4','0PB121079','Bracket'],
  ['5','PAF008836','Hexagon socket flat head bolt M8x12'],['6','0PB121437','Coolant pump seal'],['7','PAF008127','Hexagon head bolt M6x25'],['8','0PB121115','Water guide housing with thermostat'],
  ['9','0PB121117','Thermostat housing'],['10','9A712111000','Thermostat'],['11','0PB121688','Thermostat seal'],['13','0PB121146','Guard plate'],
  ['14','PAF008126','Hexagon head bolt BM6x20'],['15','PAF008321','Sealing plug M14x1.5x15'],['16','PAF013814','Seal ring 14x18'],['17','0PB121091','Seal'],
  ['18','PAF008146','Hexagon head bolt M8x25'],['19','PAF008150','Hexagon head bolt M8x50'],['20','0PB121076','Water pipe'],['21','0PB121437','Coolant pipe seal'],
  ['22','0PB121512A','Water pipe'],['23','0PB121149','Coolant pipe seal'],['24','0PB121139','Coolant pipe seal'],['25','0PB121097D','Spring clip'],
  ['26','PAF008126','Hexagon head bolt BM6x20'],['27','0PB121397','Coolant pipe'],['28','PAF008282','O-ring 23.0x3.0'],['29','9A700828100','O-ring 31.0x3.0'],
  ['30','PAF008923','Flat round head bolt M6x14'],['31','0PB121054','Filler hose'],['33','9A700827400','O-ring 34.0x3.0'],['34','00004330393','Sealant, Doboseal 08-07, 20 ml'],
  ['38','PAF00868500','Hexagon head bolt M6x50']]};

const carrier={id:'assembly-carrier',code:'105-050',title:'Assembly carrier and coolant pipe',year:'2020 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/105-050/SUB-FRAME',
 rows:[['1','0PB121070A','Assembly carrier'],['2','0PB121228B','Seal, cylinders 1-3'],['3','0PB121327D','Seal, cylinders 4-6'],['4','0PB121327B','Seal'],
  ['5','PAF008459','Dowel sleeve 11M6x10'],['6','PAF008150','Hexagon head bolt M8x50'],['7','WHT001703','Hexagon head bolt M8x35'],['8','0PB121131G','Coolant connection'],
  ['9','0PB121097D','Spring clip'],['10','N 10124306','Hexagon socket flat head bolt M6x20'],['11','9A700828001','O-ring 29.0x4.0'],['12','0PB121959A','Coolant valve'],
  ['13','N 90687201','Spring band clamp 40x12'],['14','0PB121082','Coolant hose'],['15','0PB121371','Hose clamp 35x12'],['16','0PB121085','Water pipe'],
  ['17','9A700828100','O-ring 31.0x3.0'],['18','PAF008158','Hexagon head bolt M8x70'],['19','PAF008923','Flat round head bolt M6x14'],['20','PAF008126','Hexagon head bolt BM6x20'],
  ['21','0PB121342','Cover plate'],['22','PAF008124','Hexagon head bolt BM6x12']]};

const distributor={id:'coolant-distributor',code:'105-060',title:'Engine coolant distributor',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/105-060/WATER_COOLING',
 rows:[['1','0PB121187','Coolant distributor (complete)'],['2','PAF008273','O-ring 31.0x3.0'],['3','PAF008267','O-ring 22.0x3.0'],['4','0PB121099','Bung'],
  ['5','0PB121097','Spring clip'],['7','PAF008127','Hexagon head bolt M6x25'],['8','0PB121497','Coolant feed pipe'],['9','0PB121469','Coolant return pipe'],
  ['10','PAF008282','O-ring 23.0x3.0'],['11','9A700828100','O-ring 31.0x3.0'],['12','PAF008923','Flat round head bolt M6x14'],['13','PAF00868500','Hexagon head bolt M6x50'],
  ['14','0PB121049','Coolant hose, heat exchanger feed'],['15','0PB121052','Moulded hose, heat exchanger return'],['16','0PB121053','Coolant hose, heat exchanger return'],['17','0PB121398B','Coolant return pipe, distributor tube'],
  ['18','0PB121054','Filler hose'],['19','N 90687101','Spring band clamp 32x12'],['21','0PB121326','Hose clamp 25x12'],['22','992121129','Bracket'],
  ['23','0PB121097D','Spring clip'],['24','0PB121692','Breather line'],['27','0PB121599A','Coolant circulation pump with bracket and damping']]};

const front={id:'front-coolant-pipes',code:'105-300',title:'Coolant system, front end',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/105-300/WATER_COOLING',
 rows:[['1','992121507','Coolant feed pipe'],['2','992121034','Coolant return pipe'],['3','992121106','Coolant feed hose'],['4','992121105','Coolant return hose'],
  ['5','992121548','Coolant hose'],['6','992121098C','Spring clip 26'],['7','992121240','Bracket'],['8','992121522','Bracket'],
  ['9','992121901H','Distributor tube, left'],['10','992121902D','Distributor tube, right'],['11','992121232A','Bracket'],['12','992121235A','Bracket'],
  ['13','992121241B','Bracket'],['14','N 10717601','Hexagon collar bolt M6x32'],['15','9A700812500','Hexagon head bolt M6x16'],['16','992121797B','Cross tube'],
  ['17','992121798B','Cross tube'],['18','992121545','Coolant hose'],['19','992121546','Coolant hose'],['20','992121233','Bracket'],
  ['21','95860662320','Coolant temperature sensor'],['22','WHT002287B','O-ring 5.6x2'],['23','N 10721401','Oval head self-tapping screw 6x16'],['24','992121455B','Breather line'],
  ['25','992121456A','Breather line'],['26','992121129','Bracket'],['27','9A712132604','Spring band clamp B44x12'],['28','9A7145917','Spring band clamp B36x12']]};

const rear={id:'rear-coolant-pipes',code:'105-400',title:'Coolant system, rear end',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/105-400/WATER_COOLING',
 rows:[['1','992121568','Coolant feed pipe'],['2','992121567','Coolant return pipe'],['3','992121704','Water pipe bracket'],['4','992121129','Bracket'],
  ['5','992121641','Coolant feed hose'],['6','992121642','Coolant return hose'],['7','992121638','Breather line']]};

const heater={id:'heater-circuit',code:'105-500',title:'Coolant system, heater',year:'2019 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/105-500/WATER_COOLING',
 rows:[['1','992121050','Heater feed pipe'],['2','992121070A','Heater return pipe'],['3','992121107','Heater feed hose'],['4','992121393','Heater feed hose'],
  ['5','992121626','Heater hose'],['6','9P1317233A','Coolant shut-off valve'],['7','992121239','Bracket'],['8','PAF105921','Hexagon socket flat head bolt M4x14'],
  ['9','N 10653301','Hexagon collar bolt M6x20'],['10','992121379A','Heater return hose'],['11','992121108A','Heater return hose'],['12','9A712160110','Auxiliary coolant pump'],
  ['13','992121703A','Bracket'],['14','9A700336100','Flat round head bolt 3.5x20'],['15','PAF901686','Speed nut M6x23.4x16'],['16','N 10653301','Hexagon collar bolt M6x20'],
  ['17','0PB121275','Rubber bush'],['18','0PB121199','Sleeve'],['19','992121093B','Bracket']]};

const tank={id:'expansion-tank',code:'105-100',title:'Coolant expansion tank',year:'2022 (992-1)',
 url:'https://www.eurospares.co.uk/Porsche/992/2022_(992-1)/PartDiagrams/105-100/Coolant_expansion_tank',
 rows:[['1','992121402B','Coolant expansion tank with level gauge and bleed valve'],['2','9P1121321A','Expansion tank cap'],['3','992121637','Coolant hose'],['4','7P5121671A','Bleed valve'],
  ['5','992121521','Bleed valve bracket'],['6','PAF008573','Hexagon nut M6'],['7','00004330515','Coolant additive, 1.0 litre']]};

const [pumpS,carrierS,distributorS,frontS,rearS,heaterS,tankS]=[pump,carrier,distributor,front,rear,heater,tank].map(d=>catalogueStudy(d,P));
export const studies=[pumpS,carrierS,distributorS,frontS,rearS,heaterS,tankS];
export const views=new Map([
 ['992frontcoolant.pump',pumpS],
 ['992frontcoolant.thermostat',pumpS],
 ['992frontcoolant.jacket',carrierS],
 ['p992-coolant.distributor',distributorS],
 ['p992-coolant.feed',frontS],
 ['992frontcoolant.feed',frontS],
 ['992frontcoolant.return',frontS],
 ['p992-coolant.return',rearS],
 ['p992-coolant.heater-feed',heaterS],
 // The filler hose on the pump diagram leads up to the expansion tank.
 [`${P}coolant-pump.r31-0pb121054`,tankS],
]);
