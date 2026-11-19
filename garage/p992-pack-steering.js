// 992 study pack: steering.
// Scope: Steering: rack and pinion, tie rods, intermediate shaft, steering column and its adjustment drive, steering wheel and column switches.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-steering-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// The car is a US (left-hand drive, PR L0L) Carrera S Cabriolet with the
// 7-speed manual and the electrically adjustable column (PR 2C7) that the
// garage model's column drive represents. Rows for right-hand drive, the
// steering column immobilizer (PR 0RC), the manual column and PDK shift
// paddles are left out.
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {cyl,sleeve,metal,steel,dark,x,z} from './mechanism-shapes.js';

export const hooks=["p992-steering.shaft", "p992-steering.rack", "p992-steering.tie-left", "p992-steering.tie-right", "p992-column-drive.housing", "p992-column-drive.screw", "p992-column-drive.slider"];

const at=(c,d)=>c.map((v,i)=>v+d[i]);
const alloy='#9aa5a8',rubber='#26292b';
// Rack housing with the pinion tower and bellows at each end.
const rackShape=(r,c)=>{
  cyl(r,at(c,[-.13,0,0]),x,0,.26,.022,alloy,14);
  for(const s of [-1,1])sleeve(r,at(c,[s*.15,0,0]),x,-.02,.02,.026,.012,rubber,14);
  cyl(r,at(c,[-.05,0,0]),z,0,.07,.016,steel,12);
};
// Column tube with the adjustment drive box underneath.
const columnShape=(r,c)=>{
  cyl(r,at(c,[-.13,0,0]),x,0,.24,.02,metal,14);
  cyl(r,at(c,[.11,0,0]),x,0,.03,.03,dark,14);
  r.box(c[0]-.05,c[1]-.025,c[2]-.06,c[0]+.03,c[1]+.025,c[2]-.02,dark);
};

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;

const steeringGear={id:'steering-gear',code:'403-000',title:'Steering gear',year:'2023 (992-1)',
  url:es('2023_(992-1)','403-000','Steering_gear'),
  rows:[
    ['1','992423051BB','Steering gear, left-hand drive, standard rear axle, power steering',rackShape],
    ['2','992419813','Clamp 64'],
    ['3','992423810','Track rod'],
    ['4','5B4423895','Hexagon nut M14x1.5'],
    ['5','99134719101','Steering gear bellows'],
    ['6','992419813A','Clamp 14'],
    ['7','992423811','Track rod outer joint'],
    ['8','PAF107738','Hexagon collared bolt M10x60, multi-point socket head'],
    ['9','PAF908088','Hexagon collar nut M12x1.5, self-locking'],
  ]};

const steeringColumn={id:'steering-column',code:'403-300',title:'Steering column',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/403-300/STEERING_COLUMN',
  rows:[
    ['1','992419506G','Steering column, electrically height-adjustable',columnShape],
    ['4','9A790770500','Control unit for the electrically adjustable steering column'],
    ['5','N 10406604','Oval hexagon socket head bolt M5x8, column control unit'],
    ['7','N 90798805','Shouldered hex nut M8'],
    ['8','992419753B','Intermediate steering shaft, left-hand drive, from 08.03.2019'],
    ['9','WHT004955A','Torx socket head bolt M8x30'],
    ['10','992419523A','Bellows, intermediate steering shaft, left-hand drive'],
  ]};

// Read from the Turbo S copy of 903-100: the Carrera copies of this diagram
// would not load. Only the rows for the electrically adjustable column and
// its fixings are used; the stalk switch itself has some forty option-bound
// numbers there and is left out.
const columnSwitch={id:'column-switch',code:'903-100',title:'Steering column switch',year:'2021 (992-1 Turbo / S)',
  url:es('2021_(992-1_Turbo_S)','903-100','Steering_column_switch'),
  rows:[
    ['2','992858566A 5Q0','Lower trim, steering column switch, electric axial and tilt adjustment'],
    ['3','992858565 5Q0','Upper trim, steering column switch'],
    ['4','971953519B 1E0','Switch for steering column adjustment'],
    ['5','N 10633103','Oval-head panel screw 4.8x13, column switch trim'],
    ['6','N 10485703','Hexagon socket flat head bolt M5x12'],
  ]};

const wheelAccessories={id:'wheel-accessories',code:'403-240',title:'Accessories steering wheel',year:'2019 (992-1)',
  url:es('2019_(992-1)','403-240','ACCESSORIES'),
  rows:[
    ['1','992998537B','Multifunction button set for the steering wheel'],
    ['3','992951527A','Pushbutton for steering wheel heating'],
    ['4','992971388A','Steering wheel wire set'],
    ['5','992419798C','Rear steering wheel cover, for steering wheel heating'],
    ['7','992959256D','Control unit for the multifunction steering wheel'],
    ['8','992919680E','Switch, steering wheel'],
  ]};

// The manual-gearbox (PG1M) copy of the wheel accessories. Of the cover and
// rear-cover options, the newest carbon cover and the heated rear cover are kept.
const manualWheelAccessories={id:'manual-wheel-accessories',code:'403-290',title:'Accessories steering wheel, manual gearbox',year:'2022 (992-1)',
  url:es('2022_(992-1)','403-290','Accessories_steering_wheel'),
  rows:[
    ['1','992998537B 6N3','Multifunction button set, matt black'],
    ['2','992419732E IL6','Steering wheel cover, carbon'],
    ['3','992951527A 1E0','Pushbutton for steering wheel heating'],
    ['4','992971388A','Steering wheel wire set'],
    ['5','992419798A 5Q0','Rear steering wheel cover, for steering wheel heating'],
    ['6','992959256D','Control unit for the multifunction steering wheel'],
    ['7','992919680D 6N3','Switch, steering wheel, matt black'],
  ]};

const P='p992-steering-';
export const studies=[steeringGear,steeringColumn,columnSwitch,wheelAccessories,manualWheelAccessories].map(d=>catalogueStudy(d,P));
const [gearStudy,columnStudy,switchStudy,wheelStudy,manualWheelStudy]=studies;

export const views=new Map([
  ['p992-steering.rack',gearStudy],
  ['p992-steering.tie-left',gearStudy],
  ['p992-steering.tie-right',gearStudy],
  ['p992-steering.shaft',columnStudy],
  ['p992-column-drive.housing',columnStudy],
  ['p992-column-drive.screw',columnStudy],
  ['p992-column-drive.slider',columnStudy],
  // The adjustment switch sits on the column switch; the wheel mounts on the column.
  [P+'steering-column.r4-9a790770500',switchStudy],
  [P+'steering-column.r1-992419506g',wheelStudy],
  // The manual-gearbox accessories open from the wheel's button set.
  [P+'wheel-accessories.r1-992998537b',manualWheelStudy],
]);
