// 992 study pack: brakes-rear.
// Scope: Rear brakes and the electric parking brake: calipers, discs, pads, parking brake actuator, rear brake lines.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-brakes-rear-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["service-porsche992scab-brakes-rear-caliper.body", "service-porsche992scab-brakes-rear-caliper.pistons", "service-porsche992scab-brakes-rear-caliper.pads", "service-porsche992scab-brakes-rear-caliper.seals", "service-porsche992scab-brakes-rear-caliper.rotor", "service-porsche992scab-brakes-rear-disc.carrier", "service-porsche992scab-brakes-rear-disc.track", "brakes.parking"];
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {cyl,sleeve,metal,steel,dark,y} from './mechanism-shapes.js';

const red='#b3262a',iron='#8d9497',padFace='#3b3530';
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
// Ventilated cast-iron disc with its hat, seen face-on.
const disc=(r,c)=>{sleeve(r,c,y,-.014,.014,.11,.05,iron,32);cyl(r,plus(c,[0,-.035,0]),y,0,.035,.05,steel,20);sleeve(r,plus(c,[0,-.036,0]),y,0,.002,.02,.012,dark,12);};
// Four-piston monobloc fixed caliper, painted red: two halves bridged over the disc.
const caliperIn=color=>(r,c)=>{for(const s of [-1,1])block(r,plus(c,[0,s*.025,0]),[.14,.025,.06],color);block(r,plus(c,[0,0,.035]),[.12,.075,.014],color);};
const caliper=caliperIn(red),yellowCaliper=caliperIn('#e2b32c');
// Pad set: four pads, each a steel backing plate with friction material.
const pads=(r,c)=>{for(let i=0;i<4;i++){const o=[-.06+i*.04,0,0];block(r,plus(c,o),[.032,.006,.05],steel);block(r,plus(c,plus(o,[0,.008,0])),[.028,.01,.044],padFace);}};

// Rear disc brakes for the Carrera S: red four-piston calipers, sports equipment (PA8F with 2EB/2ET).
const rearBrakes={id:'rear-disc-brakes',code:'603-005',title:'Rear axle disc brakes, red calipers',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/603-005/DISC_BRAKES',
  rows:[
    ['1','992615601A','Brake disc, rear left',disc],
    ['1','992615602A','Brake disc, rear right',disc],
    ['2','N 10456004','Hexagon socket head bolt M6x12, self-locking, brake disc'],
    ['3','992615611E','Brake cover plate, rear left'],
    ['3','992615612E','Brake cover plate, rear right'],
    ['4','N 10082913','Hexagon head bolt (combi) M6x16, cover plate'],
    ['5','992615423Q','Brake caliper without pads, rear left',caliper],
    ['5','992615424Q','Brake caliper without pads, rear right',caliper],
    ['6','992698451H','Brake pad set, rear axle',pads],
    ['7','9P1907637A','Brake pad wear sender wire'],
    ['8','PAF007586','Socket head bolt M12x1.5x95, caliper mounting'],
    ['9','971698995','Pad retaining spring repair set'],
    ['10','971615701','Caliper connecting line'],
    ['11','9A769867100','Protective cap repair set, 32 mm, 4 pieces'],
    ['12','211611483','Bleeder dust cap, pack of 20'],
    ['13','8A0615273','Bleeder valve set with dust cap'],
  ]};

// Rigid rear brake lines from the underbody to the rear hoses.
const rearLines={id:'rear-brake-lines',code:'604-020',title:'Brake lines, centre underbody rear',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/604-020/BRAKE_LINE',
  rows:[
    ['1','992614730','Brake line, underbody left'],
    ['2','992614747B','Brake line, underbody right'],
    ['3','8K0611797G','Brake line bracket, line holder'],
    ['4','95B611797','Clip, brake line bracket'],
    ['5','992611843','Brake hose retainer, rear left'],
    ['5','992611844','Brake hose retainer, rear right'],
    ['6','PAF100829','Hexagon head bolt (combi) M6x16, hose retainer'],
    ['7','992615269','Retaining spring, brake line'],
  ]};

// The optional ceramic rear brakes (yellow calipers, PR 2EC/2EU): the alternative to the red
// iron brakes above, kept as a separate study opened from the iron rear disc.
const rearCeramic={id:'rear-disc-brakes-yellow',code:'603-010',title:'Rear axle disc brakes, yellow calipers (optional ceramic brakes)',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/603-010/DISC_BRAKES',
  rows:[
    ['1','992615601Q','Brake disc, rear left, ceramic option',disc],
    ['1','992615602Q','Brake disc, rear right, ceramic option',disc],
    ['2','N 10456004','Hexagon socket head bolt M6x12, self-locking, brake disc'],
    ['3','992615611F','Brake cover plate, rear left, use if required'],
    ['3','992615612F','Brake cover plate, rear right, use if required'],
    ['4','N 10082913','Hexagon head bolt (combi) M6x16, cover plate'],
    ['5','992615423H','Brake caliper without pads, rear left, yellow',yellowCaliper],
    ['5','992615424H','Brake caliper without pads, rear right, yellow',yellowCaliper],
    ['6','992698451K','Brake pad set, rear axle, ceramic option',pads],
    ['7','9P1907637C','Brake pad wear sender wire'],
    ['8','N 91183701','Multipoint socket head bolt M12x1.5x115, caliper mounting'],
    ['9','971698995B','Pad retaining spring (cup expander spring)'],
    ['10','971615701A','Caliper connecting line'],
    ['11','9A769867100','Protective cap repair set, 4 pieces'],
    ['12','211611483','Bleeder dust cap, pack of 20'],
    ['13','8A0615273','Bleeder valve set with dust cap'],
  ]};

const P='p992-brakes-rear-';
const brakes=catalogueStudy(rearBrakes,P),lines=catalogueStudy(rearLines,P),ceramic=catalogueStudy(rearCeramic,P);
export const studies=[brakes,lines,ceramic];
export const views=new Map([
  [hooks[0],brakes],
  [hooks[2],brakes],
  [hooks[4],brakes],
  // The caliper connecting line opens the rear brake lines it joins.
  [P+'rear-disc-brakes.r10-971615701',lines],
  // The iron rear disc opens the optional ceramic rear brake set that replaces it.
  [P+'rear-disc-brakes.r1-992615601a',ceramic],
]);
