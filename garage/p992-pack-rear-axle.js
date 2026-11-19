// 992 study pack: rear-axle.
// Scope: Rear axle: multilink arms, toe links, rear subframe/cross member, rear dampers and springs, rear anti-roll bar, rear-axle steering if catalogued.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-rear-axle-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// The car has the standard 0N1 rear axle (no rear-axle steering), standard PASM
// (1BH, not the 1BV sports suspension) and no PDCC (1P0), so the diagrams and
// rows below follow those variants. The Cabriolet (K8K) rows are kept.
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {TAU,metal,steel,dark,cyl,sleeve,bead,x,y,z} from './mechanism-shapes.js';

export const hooks=["p992-suspension.upper-front-left", "p992-suspension.upper-front-right", "p992-suspension.upper-rear-left", "p992-suspension.upper-rear-right", "p992-suspension.lower-left", "p992-suspension.lower-right", "p992-suspension.longitudinal-left", "p992-suspension.longitudinal-right", "p992-suspension.toe-left", "p992-suspension.toe-right"];

const rubber='#26292b',alloy='#9aa5a8',paint='#5f6a6d';
const at=(c,d)=>c.map((v,i)=>v+d[i]);
// A suspension link: a forged bar with a rubber-bushed eye at each end.
const link=(len=.24,rad=.012,color=alloy)=>(r,c)=>{
  cyl(r,at(c,[-len/2,0,0]),x,0,len,rad,color,10);
  for(const s of [-1,1])sleeve(r,at(c,[s*len/2,0,0]),y,-.018,.018,.026,.012,rubber,16);
};
// A wishbone: two inner eyes joined to one outer eye.
const wishbone=(r,c)=>{
  const outer=at(c,[.11,0,0]);
  for(const s of [-1,1]){
    const inner=at(c,[-.1,0,s*.07]),d=outer.map((v,i)=>v-inner[i]);
    cyl(r,inner,d.map(v=>v/Math.hypot(...d)),0,Math.hypot(...d),.012,alloy,10);
    sleeve(r,inner,z,-.016,.016,.024,.011,rubber,16);
  }
  sleeve(r,outer,z,-.016,.016,.024,.011,rubber,16);
};
const coilSpring=(r,c)=>{for(let i=0;i<48;i++){const a=TAU*i/12;bead(r,at(c,[Math.cos(a)*.04,Math.sin(a)*.04,-.08+i*.0034]),.008,'#536165',6);}};
const damper=(r,c)=>{cyl(r,at(c,[0,0,-.1]),z,0,.12,.022,dark,14);cyl(r,at(c,[0,0,.02]),z,0,.08,.008,metal,10);sleeve(r,at(c,[0,0,-.1]),y,-.012,.012,.02,.009,rubber,14);};
const crossMember=(r,c)=>{cyl(r,at(c,[-.13,0,0]),x,0,.26,.018,steel,12);for(const s of [-1,1])r.box(c[0]+s*.13-.02,c[1]-.03,c[2]-.05,c[0]+s*.13+.02,c[1]+.03,c[2]+.05,steel);};
const antiRollBar=(r,c)=>{
  cyl(r,at(c,[-.11,0,0]),x,0,.22,.01,'#3d4446',12);
  for(const s of [-1,1])cyl(r,at(c,[s*.11,0,0]),y,0,.08,.01,'#3d4446',12);
};
const sensor=(r,c)=>{r.box(c[0]-.025,c[1]-.02,c[2]-.02,c[0]+.025,c[1]+.02,c[2]+.02,dark);cyl(r,at(c,[.025,0,0]),x,0,.08,.006,metal,8);};
const pad=(r,c)=>{for(let i=0;i<3;i++)r.box(c[0]-.07+i*.05,c[1]-.04,c[2]-.004,c[0]-.03+i*.05,c[1]+.04,c[2]+.004,paint);};

// 501-010: the five links of each standard (0N1) rear wheel. On this diagram
// the lower wishbone and the track rod are the lower transverse and toe links,
// the upper wishbone and upper axle guide are the two upper links, and the
// left and right axle guides are the longitudinal links. Repeated fasteners
// (the same number at another joint) are listed once.
const wishbones={id:'links',code:'501-010',title:'Rear axle wishbones, axle guides and track rod (standard rear axle)',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/501-010/REAR_AXLE',
  rows:[
    ['1','9P1505311','Lower wishbone, rear axle',wishbone],
    ['2','WHT008736','Eccentric bolt M12x1.5x97'],
    ['3','WHT007492','Eccentric washer 38x5'],
    ['4','PAF909664','Hexagon collar nut M12x1.5, self-locking'],
    ['5','992615396','Air guide plate'],
    ['6','9A700837900','Cable tie 8.0x337'],
    ['7','PAF008674','Hexagon flange screw M12x1.5x105'],
    ['9','9P1505397A','Upper wishbone, rear axle',wishbone],
    ['10','9A700867700','Hexagon bolt M12x1.5x80'],
    ['13','9P1505237B','Upper axle guide',link(.22)],
    ['16','992501529','Rear track rod (toe link)',link(.2,.009,steel)],
    ['21','9P1505223B','Axle guide, left',link(.26,.014)],
    ['21','9P1505224B','Axle guide, right',link(.26,.014)],
    ['22','PAF008675','Hexagon bolt M12x1.5x90, axle guide'],
    ['24','9P1615457E','Rear axle spoiler, left'],
    ['24','9P1615458E','Rear axle spoiler, right'],
    ['25','9A700738000','Panel nut ST4.8x22x18'],
  ]};

// 501-005: the cross member the inner link pivots bolt to. Rows marked for the
// Cabriolet and Targa (PK8K, PK5T) are the ones this Cabriolet uses; the
// coupé-only versions of the braces are left out.
const crossMemberDiagram={id:'cross-member',code:'501-005',title:'Rear axle cross member',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/501-005/REAR_AXLE',
  rows:[
    ['1','992505105A','Cross member, rear axle',crossMember],
    ['2','9A700738000','Panel nut ST4.8x22x18, cross member'],
    ['3','992505063A','Side part, left'],
    ['3','992505064A','Side part, right'],
    ['4','PAF008735','Hexagon bolt M12x1.5x95, rear axle outer'],
    ['5','PAF008673','Hexagon bolt M12x1.5x110, inner'],
    ['6','WHT008655','Threaded pin M12x1.5x126'],
    ['7','N 90916701','Hexagon collar nut M12x1.5, self-locking'],
    ['9','992505475H','Panhard rod, left, Cabriolet and Targa',link(.24,.01,steel)],
    ['9','992505476H','Panhard rod, right, Cabriolet and Targa',link(.24,.01,steel)],
    ['10','WHT008676','Hexagon bolt M12x1.5x45, brace'],
    ['11','PAF909417','Socket head bolt M10x45 with multipoint head'],
    ['12','WHT008740','Bolt with washer M12x1.5x40, brace'],
    ['13','PAF008863','Bolt with washer, Cabriolet and Targa'],
    ['14','992505261A','Support'],
    ['15','PAF008654','Threaded pin M10x68.5'],
    ['16','PAF008868','Hexagon nut M10'],
    ['17','PAF008642','Hexagon bolt M10x50'],
    ['18','992505525A','Cross reinforcement, Cabriolet and Targa',pad],
    ['19','N 0195308','Hexagon collar bolt M8x25, Cabriolet and Targa'],
    ['20','N 10700901','Spreader rivet 4.5x11.5'],
    ['21','992616571B','Ride height level sensor, left',sensor],
    ['21','992616572B','Ride height level sensor, right',sensor],
    ['22','N 10005306','Hexagon head bolt M6x12 with washer'],
    ['23','PAF015082','Hexagon collar nut M6'],
  ]};

// 501-025: the rear anti-roll bar without PDCC (1P0).
const stabilizer={id:'anti-roll-bar',code:'501-025',title:'Rear anti-roll bar without PDCC',year:'2019 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2019/PartDiagrams/501-025/STABILIZER',
  rows:[
    ['1','992511025H','Stabilizer (rear anti-roll bar)',antiRollBar],
    ['2','992511035B','Mount for stabilizer'],
    ['3','9P1511418A','Clamp'],
    ['4','9A700861500','Hexagon head screw, clamp'],
    ['5','9P1511467A','Connecting link',link(.16,.007,metal)],
    ['6','WHT007957','Hexagon nut M10'],
    ['7','N 90966402','Shouldered hexagon nut M12x1.5, self-locking'],
  ]};

// 502-000: the complete rear spring strut with the standard PASM (1BH) parts;
// the 1BV sports-suspension versions are left out.
const strut={id:'spring-strut',code:'502-000',title:'Rear spring strut, complete (standard PASM)',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/502-000/SUSPENSION_STRUT_COMPLETE',
  rows:[
    ['1','992513031F','Spring cylinder (rear damper), standard PASM',damper],
    ['2','PAF008572','Circlip'],
    ['3','992512103','Spring seat'],
    ['4','992512297','Spring plate'],
    ['5','992511115','Coil spring, rear',coilSpring],
    ['6','9P1512137','Bellows'],
    ['7','992512131','Rubber stop for damper'],
    ['8','992511177','Spring plate'],
    ['9','9P1513353','Damper top mounting'],
    ['10','992512353','Insert part'],
    ['11','WHT008575','Washer, damper'],
    ['12','WHT008558','Hexagon nut M12x1, damper'],
    ['13','PAF003923','Hexagon nut M8'],
    ['14','9A700872500','Hexagon nut'],
    ['15','WHT008717','Hexagon socket head locating bolt'],
  ]};

const P='p992-rear-axle-';
export const studies=[wishbones,crossMemberDiagram,stabilizer,strut].map(d=>catalogueStudy(d,P));
const [linksStudy,crossStudy,barStudy,strutStudy]=studies;
const pid=(s,ref,mpn)=>`${s.id}.r${ref}-${mpn.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
const ownIds=new Set(studies.flatMap(s=>s.groups[0].parts.map(p=>p.id)));
const nest=(s,ref,mpn)=>{const id=pid(s,ref,mpn);if(!ownIds.has(id))throw new Error('p992 rear-axle pack: no part '+id);return id;};

export const views=new Map([
  // Every rear link opens the five-link diagram that contains it.
  ...hooks.map(h=>[h,linksStudy]),
  // The lower wishbone's inner pivots bolt to the cross member.
  [nest(linksStudy,'1','9P1505311'),crossStudy],
  // The anti-roll bar's mounts and clamps sit on the cross member.
  [nest(crossStudy,'1','992505105A'),barStudy],
  // The coil-over stands just inboard of the upper links' outer joints.
  [nest(linksStudy,'9','9P1505397A'),strutStudy],
]);
