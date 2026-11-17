import {G500_WHEEL_MANUAL} from './g500-wheel-specs.js';
// Inch values describe bead-seat diameter. Widths/offsets in the notes refer to
// published wheels; the on-car models illustrate the visible face and sidewall.
const link=(label,url)=>({label,url});
const gManual=link('2002 Mercedes-Benz G 500 Operator’s Manual, p. 359',G500_WHEEL_MANUAL);
const cBook=link('2014 Mercedes-Benz C-Class brochure','https://cdn.dealereprocess.org/cdn/brochures/mercedesbenz/2014-cclass.pdf');
const cParts=link('Mercedes-Benz USA parts catalogue','https://classicparts.mbusa.com/v-2014-mercedes-benz-c63-amg--base--6-3l-v8-gas/tire-and-wheel--wheel');
const hParts=link('College Hills Honda wheels','https://www.collegehillshonda.com/category/2ndgen-honda-hrv-wheels.html');
const eParts=link('BMW 325Ci Style 43 parts plate','https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/wheels/bmw_light_alloy_wheel_star_spokes.html');
const p993=link('Porsche 993 summer wheel bulletin','https://members.rennlist.com/geolab/summer%20tire4440_1997_64047.pdf');
const p992=link('Porsche 992 wheel identification plates','https://static.nhtsa.gov/odi/tsbs/2023/MC-10231381-0001.pdf');
const p992Shop=link('Suncoast Porsche wheel sets','https://www.suncoastparts.com/category/9922020SCHASWHLS.html');
const gTrade=link('Mercedes-Benz G500 five-spoke wheel B6 647 0598','https://parts.mercedesbenzofmiami.com/oem-parts/mercedes-benz-wheel-alloy-7-5x18-66470598');
const fTrade=link('LMC Truck steel wheels','https://www.lmctruck.com/wheels-hubcaps/wheels/fd-1992-96-steel-wheel');
const p993Trade=link('TEILE.COM 993 wheel sets','https://www.teile.com/en/porsche-parts-shop/model-911-993/2/Wheels-brakes/601C-Wheel-rim-sets/218');
function stock(name,diameters,description,source,buy){
  const [frontDiameter,rearDiameter=frontDiameter]=diameters;
  return {id:'stock',name,frontDiameter,rearDiameter,description,fitment:'Starting wheel shown on this model.',source,buy};
}
const bikeParts=link('BMW Motorrad wheel plates for the 2023 S 1000 RR','https://www.shopbmwmotorcycles.com/v-2023-bmw-motorrad-s-1000-rr--base--s/wheels-and-tires--wheels-with-bearings');
const options={
  bmws1000rr:[stock('17-inch factory cast wheel',[17],'Five cast arms split toward the rim. The bead seats measure 3.50 inches across at the front and 6.00 inches at the rear.',link('BMW · cast rear wheel, plate 36_1424','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/36/36_1424/'),bikeParts),{
    id:'apex6',name:'Apex-6 forged set',maker:'Core Moto',partNumber:'S1KR3A6',frontDiameter:17,rearDiameter:17,
    description:'Six machined spokes run from the bearing hub to the rim. The rear wheel has a wider barrel.',
    fitment:'S 1000 RR K67. Front 3.50 × 17, rear 6.00 × 17. Uses the forged/carbon-wheel rotors and a Core Moto five-bolt sprocket. Bikes delivered on cast wheels require compatible rotors.',
    source:link('Core Moto K67 specifications and fitment','https://www.coremoto.com/Apex_6_forged_wheel_by_Core_Moto_USA_S1000RR_p/s1kr3a6.htm'),
    buy:link('Motomillion Apex-6 S 1000 RR set','https://www.motomillion.com/collections/core-moto/products/core-moto-s1kr3a6-ablu-apex-6-forged-aluminum-blue-wheel-set-for-s1000rr-k67')
  }],
  g500:[{...stock('18-inch five-spoke',[18],'Five straight grooved spokes run from a broad painted hub to the rim, with a Mercedes center cap.',gManual,gTrade),
    fitment:'2002 US G 500, front and rear. 7.5J × 18 H2, ET43. The manual specifies 265/60 R18 110V.'},{
    id:'atik',name:'Atik',maker:'Mercedes-Benz',partNumber:'A 463 401 07 02',frontDiameter:16,rearDiameter:16,lugs:5,boltCircle:130,
    description:'A deep, rounded five-arm face with more tire sidewall than the 18-inch wheel.',
    fitment:'W463 catalogue option, 7.5J × 16 ET63 with 265/70 R16. Ask the dealer to check the VIN and brake package.',
    source:link('Mercedes-Benz wheel programme, G-Class','https://nsk.mercedes-benz-clubs.com/wp-content/uploads/sites/7/2015/05/R171-Light-alloyWheelsCurrent.pdf'),
    buy:link('Mercedes-Benz genuine Atik wheel','https://www.originalteile.mercedes-benz.de/scheibenrad-fuer-g-270-cdi-g-500-g-400-cdi-und-weitere-baureihen/a4634010702')
  }],
  f350:[stock('16-inch pressed steel',[16],'A dished steel center with four short ventilation slots and eight lug nuts.',link('1993 Ford F-350 wheel parts diagram','https://www.fordpartsdeal.com/parts-list/1993-ford-f-350/suspension/wheels'),fTrade),{
    id:'baja',name:'AR172 Baja',maker:'American Racing',partNumber:'AR1726882',frontDiameter:16,rearDiameter:16,lugs:8,boltCircle:165.1,
    description:'Eight round holes in a deeply dished alloy face.',
    fitment:'16 × 8, 8 × 6.5 in, zero offset. Single-rear-wheel preview. Check axle load, hub clearance and backspacing for the truck.',
    source:link('American Racing Baja wheel specifications','https://www.americanracing.com/american-racing-baja'),
    buy:link('Summit Racing AR1726882 wheel','https://www.summitracing.com/parts/are-ar1726882')
  }],
  c63:[stock('18-inch AMG twin-spoke',[18],'Five close pairs of straight spokes on the W204 sedan.',cBook,cParts),{
    id:'edition507',name:'AMG Edition 507',maker:'Mercedes-AMG',partNumber:'A 204 401 25 00 front / A 204 401 26 00 rear',frontDiameter:19,rearDiameter:19,lugs:5,boltCircle:112,
    description:'Ten slim forged arms form five pairs, set wider apart at the rim.',
    fitment:'W204 C63 AMG. Front 8J × 19 ET45. Rear 9J × 19 ET54.',
    source:cBook,buy:link('Wheel Boys Edition 507 front wheel','https://wheel-boys.com/product/mercedes-c63-amg-19-inch-front-rim-oem-2014-2015-original-507-edition-204-wheel/'),buyRear:link('Wheel Boys Edition 507 rear wheel','https://wheel-boys.com/product/mercedes-c63-amg-19-inch-rear-rim-oem-2014-2015-original-507-edition-w204-wheel/')
  }],
  hrv:[stock('17-inch LX alloy',[17],'Alternating wide and narrow branches around five mounting holes.',link('2026 Honda HR-V trim specifications','https://automobiles.honda.com/2026/hr-v/specs-features-trim-comparison'),hParts),{
    id:'hpd',name:'17-inch HPD alloy',maker:'Honda',partNumber:'08W17-3V0-100',frontDiameter:17,rearDiameter:17,lugs:5,boltCircle:114.3,
    description:'Five Y-shaped spokes split toward the outer lip. Honda sells this version in Glint Black.',
    fitment:'17 × 7 accessory wheel for the U.S. HR-V. Sold individually.',
    source:link('Honda HPD wheel and installation sheet','https://www.collegehillshonda.com/product/08W17-3V0-100.html'),
    buy:link('Honda Automotive Parts HPD wheel','https://www.hondaautomotiveparts.com/oem-parts/honda-17-inch-glint-black-hpd-alloy-wheels-8w173v0100')
  }],
  bmw325ci:[{...stock('Star Spoke 43',[16],'Five broad cast spokes surround a recessed hub and roundel.',eParts,link('ECS Tuning · BMW Style 43 wheel','https://www.ecstuning.com/b-genuine-bmw-parts/whl7x16styl43/36111094505/')),
    maker:'BMW',partNumber:'36 11 1 094 505',fitment:'2003 U.S. 325Ci coupe. Standard 7J × 16 ET47, front and rear, with 205/55 R16 91H M+S tires.'},{
    id:'style68',name:'M Double Spoke 68',maker:'BMW',partNumber:'36 11 2 229 180 front / 36 11 2 229 135 rear',frontDiameter:17,rearDiameter:17,lugs:5,boltCircle:120,
    description:'Five pairs of swept, unequal-width arms with recessed valleys.',
    fitment:'A staggered BMW wheel listed for the 325Ci. Front 7.5J × 17 ET41 with 225/45 R17. Rear 8.5J × 17 ET50 with 245/40 R17.',
    source:link('BMW Style 68 parts diagram','https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/wheels/bmw_alloy_wheel_m_double_spoke.html'),
    buy:link('BMW Parts Center front wheel','https://www.bmwpartscenter.com/oem-parts/bmw-wheel-alloy-36112229180'),
    buyRear:link('BMW Parts Center rear wheel','https://www.bmwpartscenter.com/oem-parts/bmw-wheel-alloy-36112229135')
  }],
  porsche993cab:[{...stock('16-inch Cup Design ’93',[16],'Five cast spokes frame rounded openings around the recessed wheel nuts.',p993,p993Trade),
    partNumber:'993.362.114.00 front / 993.362.118.01 rear',
    fitment:'7J × 16 ET55 with 205/55 ZR16 tires in front. 9J × 16 ET70 with 245/45 ZR16 tires at the rear.',lugs:5,boltCircle:130
  },{
    id:'sportclassic',name:'17-inch Sport Classic',maker:'Porsche',partNumber:'993.362.124.51 front / 993.362.128.51 rear',frontDiameter:17,rearDiameter:17,lugs:5,boltCircle:130,
    description:'A fine mesh of branching spokes sits inside a stepped outer lip.',
    fitment:'Narrow-body 993 Carrera. Front 7J × 17 ET55. Rear 9J × 17 ET55.',
    source:link('Porsche 993 summer wheel bulletin, Sport Classic, p. 4','https://members.rennlist.com/geolab/Summer%20tire%204440_2003_640703us.pdf#page=4'),buy:link('TEILE.COM Sport Classic set','https://www.teile.com/en/porsche-parts-shop/model-911-993/2/Wheels-brakes/601C-Wheel-rim-sets/218/601-01-Wheel-rim-sets/17-inch-SportClassic-wheel-set-7J-x-17-ET-55-9J-x-17-ET-55/39758')
  },{
    id:'cupii',name:'17-inch Cup II',maker:'Porsche',partNumber:'993.362.124.00 front / 993.362.128.00 rear',frontDiameter:17,rearDiameter:17,lugs:5,boltCircle:130,
    description:'Five smooth, gently curved cast paddles frame large open windows.',
    fitment:'Narrow-body 993 Carrera. Front 7J × 17 ET55. Rear 9J × 17 ET55.',
    source:p993,buy:link('TEILE.COM Cup II set','https://teile.com/en/porsche-tequipment-shop/model-911-993/2/wheels-rims-and-accessories/601c-wheel-rim-sets/218/17-inch-cup-ii-wheel-set-7j-x-17-et55-9j-x-17-et55/21704')
  }],
  porsche992scab:[stock('20 / 21-inch Carrera S',[20,21],'The front and rear wheels keep the staggered size of the 992.1 Carrera S.',p992,p992Shop),{
    id:'rsspyd',name:'RS Spyder Design',maker:'Porsche',partNumber:'992.601.025.BB front / 992.601.025.G rear',frontDiameter:20,rearDiameter:21,lugs:5,boltCircle:130,
    description:'A close lattice of slender split spokes replaces the open Carrera S face.',
    fitment:'992.1 Carrera S summer set. Front 8.5J × 20. Rear 11.5J × 21. The dealer listing includes tires.',
    source:p992,buy:link('Suncoast Porsche RS Spyder package','https://www.suncoastparts.com/product/SKU992SWRSPY.html')
  }]
};
export function wheelOptions(vehicle){return Object.hasOwn(options,vehicle)?options[vehicle]:[];}
export function wheelDesign(vehicle,id){const list=wheelOptions(vehicle);return list.find(item=>item.id===id)||list[0]||null;}
