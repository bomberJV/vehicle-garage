// 992 study pack: intake.
// Scope: Intake and charge air: air filters and housings, intake ducts, charge-air coolers and their fans, charge pipes, throttle body, intake distributor, crankcase ventilation.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-intake-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["engine.intake", "p992-intake.inlet-left", "p992-intake.inlet-right", "p992-air-filter.element", "p992-air-filter.seal", "p992-air-filter.tray", "992deckcore.hot", "992deckcore.cold", "992deckcore.tubes", "992deckcore.fins", "992deckfanleft.frame", "992deckfanleft.impeller", "992deckfanleft.motor", "992deckfanright.frame", "992deckfanright.impeller", "992deckfanright.motor"];

import {catalogueStudy,catalogueShapes} from './porsche992-catalog-studies.js';

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;
const panel=catalogueShapes.panel;

const airCleaner={id:'air-cleaner',code:'106-000',title:'Air cleaner, filter housings and air lines',year:'2020 (992-1)',
 url:es('2020_(992-1)','106-000','AIR_CLEANER'),
 rows:[['1','992129567C','Air filter housing, left, with air filter element'],['1','992129568C','Air filter housing, right, with air filter element'],
  ['2','992129211','Support for left air filter element'],['2','992129212','Support for right air filter element'],
  ['3','992129620G','Air filter element, left'],['3','992129620H','Air filter element, right'],
  ['5','9A700746200','Hexagon nut M6'],['6','N 90820401','Hexagon head bolt (combi) M6x16, self-locking'],['7','992129619','Gaiter'],
  ['8','992129456A','Air line, left'],['8','992129456','Air line, right'],
  ['9','PAF008434','Washer for rubber mount'],['10','PAF008475','Grommet'],['11','N 90236203','Retaining washer 10x0.6']]};

const distributor={id:'intake-distributor',code:'107-100',title:'Intake air distributor and throttle valve adapter',year:'2019 (992-1)',
 url:es('2019_(992-1)','107-100','INTAKE_AIR_DISTRIBUTOR'),
 rows:[['1','0PB129713B','Intake air distributor, cylinders 1-3'],['2','0PB129714A','Intake air distributor, cylinders 4-6'],['3','0PB128335A','Distributor tube'],
  ['4','PAA133141','Throttle valve adapter'],['5','0PB129646D','Seal'],['6','0PB129646C','Seal ring, distributor tube'],['7','9A700827900','O-ring 53.0x5.00'],
  ['8','0PB129646B','Seal, throttle valve adapter'],['9','PAF008127','Hexagon head bolt M6x25'],['10','0PB129266','Sleeve, pressure pipe'],
  ['11','0PB129077','Bracket, intake air distributor'],['12','PAF008124','Hexagon head bolt M6x12'],['13','0PB129985','Retaining bracket, throttle valve adapter'],
  ['14','0PB129089A','Bracket, throttle valve adapter'],['15','9A700813000','Hexagon head bolt M6x40'],['16','N 01508210','Hexagon collar nut M6'],
  ['17','0PB129764','Sound absorber piece'],['18','PAF008344','Hose bracket 0.8-2.0x21x6.5'],['19','PAC906051','Pressure sensor'],
  ['20','N 10721401','Oval-head self-tapping screw TP6x16'],['21','95860621300','Temperature sensor'],['22','95860653000','Grommet, temperature sensor'],
  ['23','0PB131337A','Bracket, temperature sensor']]};

const cooler={id:'charge-air-cooler',code:'107-200',title:'Charge air cooler, charge air hoses and noise generator',year:'2019 (992-1)',
 url:es('2019_(992-1)','107-200','CHARGE_AIR_COOLER'),
 rows:[['1','992145805F','Charge air cooler'],['2','992145842A','Bracket for charge air cooler'],['3','992145842B','Bracket for charge air cooler'],
  ['4','992145190A','Sleeve'],['5','N 91244501','Hexagon head bolt (combi) M6x35 with washer'],['6','992145219','Spring pin'],['7','N 90236203','Retaining washer'],
  ['8','PAF008434','Washer for rubber mount 16.1x32x0.5'],['9','PAF008475','Grommet'],['10','PAC906051E','Pressure sensor'],['11','PAC145710','Cut-off valve'],
  ['12','PAF909059A','Hexagon socket head panel bolt 5x16'],['13','9P1129659A','Air guide scoop with hose clamp, two parts',panel],
  ['14','992129453A','Charge air hose, left, with spring band clamp'],['15','992129454A','Charge air hose, right, with spring band clamp'],
  ['16','N 10244801','Bracket'],['17','992129504B','Noise generator, left'],['18','992129504A','Noise generator, right'],
  ['19','PAF911278','Hexagon head bolt (combi) 5x20'],['20','992129635A','Connection piece, noise generator'],
  ['20','9A700868100','Sealing cap, for cars without noise generator'],['21','992145861','Connection piece'],['22','992145865','Seal'],
  ['23','N 10684701','Oval hexagon socket head bolt'],['24','PAF009160','O-ring 40x2, cut-off valve'],['25','992145633','Grommet']]};

const coolerAir={id:'charge-air-guides',code:'107-250',title:'Charge air cooler air guides and pressure hoses',year:'2020 (992-1)',
 url:es('2020_(992-1)','107-250','CHARGE_AIR_COOLER'),
 rows:[['1','992145816','Air guide for right charge air cooler',panel],['2','992145817','Air guide for left charge air cooler',panel],
  ['3','992129509A','Air guide, left lower',panel],['4','992129510A','Air guide, right lower',panel],
  ['5','992145928C','Air guide for right charge air cooler, without drag-reducing underbody panel',panel],
  ['5','992145928B','Air guide for right charge air cooler, with drag-reducing underbody panelling',panel],
  ['6','992145927C','Air guide for left charge air cooler, without drag-reducing underbody panel',panel],
  ['6','992145927B','Air guide for left charge air cooler, with drag-reducing underbody panelling',panel],
  ['7','992145334','Air guide, right upper, with drag-reducing panelling',panel],['8','992145333','Air guide, left upper',panel],
  ['9','992145649','Air guide housing, left, metal'],['10','992145650','Air guide housing, right, metal'],
  ['11','992145737','Pressure hose, left, with hose clamp'],['12','992145738','Pressure hose, right, with hose clamp'],['13','992145727','Pressure pipe'],
  ['14','992145709','Pressure hose, left, with hose clamp'],['15','992145708','Pressure hose, right, with hose clamp'],
  ['16','992145583C','Air guide for left charge air cooler',panel],['17','992145584C','Air guide for right charge air cooler',panel],
  ['18','PAF008955','O-ring 59x2.5'],['19','992129260','Hose clamp'],['20','N 10544401','Hose clamp 60-80x12'],
  ['21','PAF909059A','Hexagon socket head panel bolt 5x16'],['21','V04015004W','Grease for charge air hose, 90 g']]};

const breather={id:'crankcase-breather',code:'107-350',title:'Crankcase housing ventilation, breather lines',year:'2024 (992-1)',
 url:es('2024_(992-1)','107-350','Crankcase_housing_ventilation_Breather_line'),
 rows:[['1','0PB115473B','Breather line to exhaust gas turbocharger'],['2','0PB115474C','Breather line to exhaust gas turbocharger'],
  ['3','PAF008288A','O-ring 10.0x3.00'],['4','PAF008124','Hexagon head bolt M6x12'],['5','PAF008126','Hexagon head bolt BM6x20'],
  ['6','0PB101209D','Breather line, left'],['7','0PB101210B','Breather line, right'],['8','9A700827200','O-ring 10.0x2.50'],['9','0PB101161B','Breather line']]};

const vacuum={id:'vacuum-system',code:'107-400',title:'Vacuum system, engine',year:'2019 (992-1)',
 url:es('2019_(992-1)','107-400','VACUUM_SYSTEM'),
 rows:[['1','7PP906283Q','Valve block, change-over valve'],['2','0PB129581J','Vacuum line'],['3','0PB129456C','Vacuum line'],['4','0PB129632D','Vacuum line'],
  ['5','0PB129263B','Vacuum reservoir with bracket'],['6','0PB129203A','Vacuum reservoir with bracket'],['7','N 90974701','Oval-head socket panel bolt 5x16']]};

const P='p992-intake-';
const [sAir,sDist,sCool,sGuide,sBreath,sVac]=[airCleaner,distributor,cooler,coolerAir,breather,vacuum].map(d=>catalogueStudy(d,P));
export const studies=[sAir,sDist,sCool,sGuide,sBreath,sVac];
export const views=new Map([
 ['engine.intake',sDist],
 ['p992-air-filter.element',sAir],
 ['p992-intake.inlet-left',sAir],
 ['p992-intake.inlet-right',sAir],
 ['992deckcore.hot',sCool],
 ['992deckcore.cold',sGuide],
 // Breather lines feed crankcase gases into the left and right intake air lines.
 [P+'air-cleaner.r8-992129456a',sBreath],
 // The vacuum reservoirs and lines sit on the intake air distributor.
 [P+'intake-distributor.r1-0pb129713b',sVac],
]);
