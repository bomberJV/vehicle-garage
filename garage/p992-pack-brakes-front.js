// 992 study pack: brakes-front.
// Scope: Front brakes: calipers, discs, pads, pad wear sensors, dust shields, front brake lines and hoses.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-brakes-front-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy,catalogueShapes} from './porsche992-catalog-studies.js';
import {metal,steel,dark,cyl,sleeve,y} from './mechanism-shapes.js';

export const hooks=["service-porsche992scab-brakes-front-caliper.body", "service-porsche992scab-brakes-front-caliper.pistons", "service-porsche992scab-brakes-front-caliper.pads", "service-porsche992scab-brakes-front-caliper.seals", "service-porsche992scab-brakes-front-caliper.rotor", "service-porsche992scab-brakes-front-disc.carrier", "service-porsche992scab-brakes-front-disc.track", "brakes.lines"];

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const box=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const red='#b3262a';
// Representative shapes for the big front-brake parts.
const disc=(r,c)=>{sleeve(r,c,y,-.012,.012,.11,.045,metal,28);cyl(r,plus(c,[0,-.03,0]),y,0,.018,.048,steel,16);};
const caliper=(r,c)=>{box(r,plus(c,[0,-.02,0]),[.15,.02,.07],red);box(r,plus(c,[0,.02,0]),[.15,.02,.07],red);box(r,plus(c,[0,0,.04]),[.15,.06,.014],red);};
const pads=(r,c)=>{for(const s of [-1,1]){box(r,plus(c,[0,s*.02,0]),[.11,.006,.05],steel);box(r,plus(c,[0,s*.012,0]),[.1,.01,.045],dark);}};
const bracket=catalogueShapes.bracket;

// 602-020: the current 992.1 front brake with red (P1LS) calipers on a caliper adapter.
const frontBrake={id:'front-brake',code:'602-020',title:'Front disc brakes, red calipers, with caliper adapter',year:'2023 (992-1)',
  url:es('2023_(992-1)','602-020','Disc_brake_17_Front_axle_red_black'),
  rows:[
    ['1','992615301T','Brake disc, front left',disc],
    ['1','992615302T','Brake disc, front right',disc],
    ['2','N 10456004','Hexagon socket head bolt M6x12, self-locking'],
    ['3','9P1615311B','Cover plate, front left'],
    ['3','9P1615312B','Cover plate, front right'],
    ['4','PAF100829','Hexagon head bolt (combi) M6x16'],
    ['5','992615123AF','Brake caliper without pads, front left, red',caliper],
    ['5','992615124AF','Brake caliper without pads, front right, red',caliper],
    ['6','992698151S','Brake pad set, front axle',pads],
    ['7','9P1611315B','Adapter for the front fixed caliper',bracket],
    ['8','PAF008187','Hexagon socket flat head bolt M12x1.5x37'],
    ['9','WHT008186','Socket head bolt M12x1.5x62'],
    ['10','9P1907637B','Pad wear sender wire'],
    ['11','9P1698995','Spring repair set'],
    ['12','9P1615701A','Connecting line, left fixed caliper'],
    ['12','9P1615702','Connecting line, right fixed caliper'],
    ['13','9P1698671D','Protective caps 30 mm, set of 6'],
    ['14','8A0615273','Bleeder valves with dust cap, set'],
    ['15','211611483','Dust cap, pack of 20'],
    ['16','9P1615133A','Holder for the pad wear sender wire',bracket],
  ]};

// 602-005: the 992.1 front brake with red (P1LS) calipers bolted on M12x85 bolts, no adapter.
const frontBrakeDirect={id:'front-brake-direct',code:'602-005',title:'Front disc brakes, red calipers, bolted without adapter',year:'2019 (992-1)',
  url:es('2019_(992-1)','602-005','DISC_BRAKES'),
  rows:[
    ['1','9P1615301J','Brake disc, front left',disc],
    ['1','9P1615302J','Brake disc, front right',disc],
    ['2','N 10456004','Hexagon socket head bolt M6x12, self-locking'],
    ['3','992615311A','Cover plate, front left'],
    ['3','992615312A','Cover plate, front right'],
    ['4','N 10082913','Hexagon head bolt (combi) M6x16'],
    ['5','9P1615123T','Brake caliper without pads, front left, red',caliper],
    ['5','9P1615124T','Brake caliper without pads, front right, red',caliper],
    ['6','992698151H','Brake pad set, front axle',pads],
    ['7','9P1907637B','Pad wear sender wire'],
    ['8','9A700758500','Socket head bolt M12x1.5x85'],
    ['9','9P1698995','Spring set'],
    ['10','9P1615701','Connecting line, fixed caliper'],
    ['11','9P1698671','Protective caps, set'],
    ['11','9P1698671A','Protective caps 32 mm, set of 2'],
    ['11','9P1698671B','Protective caps 34 mm, set'],
    ['12','211611483','Dust cap, pack of 20'],
    ['13','8A0615273','Bleeder valves with dust cap, set'],
    ['14','9P1615133B','Holder for the pad wear sender wire',bracket],
  ]};

// 604-010: rigid brake lines at the front end, left-hand drive.
const frontLines={id:'front-brake-lines',code:'604-010',title:'Brake lines, front end',year:'2020 (992-1)',
  url:es('2020_(992-1)','604-010','BRAKE_LINE'),
  rows:[
    ['1','992614717','Brake line, front left'],
    ['2','992614721','Brake line, front right'],
    ['3','992614723','Brake line, front end (ref. 3)'],
    ['4','992614725','Brake line, front end (ref. 4)'],
    ['5','992614739B','Brake line, front end, left-hand drive (ref. 5)'],
    ['6','992614727B','Brake line, front end, left-hand drive (ref. 6)'],
    ['9','992815533','Double clip'],
    ['10','8K0611797G','Brake line holder bracket',bracket],
    ['11','95B611797','Clip'],
    ['13','9A761179700','Brake line bracket, 3-point holder',bracket],
    ['14','9A7611797','Brake line bracket, 4-point holder',bracket],
  ]};

const P='p992-brakes-front-';
export const studies=[frontBrake,frontBrakeDirect,frontLines].map(d=>catalogueStudy(d,P));
const [brake,direct,lines]=studies;
export const views=new Map([
  [hooks[0],brake],   // caliper body
  [hooks[5],direct],  // disc carrier: the version with the caliper bolted straight to the carrier
  [hooks[7],lines],   // brake lines
]);
