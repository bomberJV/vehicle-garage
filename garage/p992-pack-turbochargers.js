// 992 study pack: turbochargers.
// Scope: Turbochargers: the two turbos, wastegate actuators, turbo oil and coolant lines, turbo heat shields and mounting hardware.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-turbochargers-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {metal,steel,dark,cyl,sleeve,x,y,z} from './mechanism-shapes.js';
export const hooks=["p992-turbo-left.housing", "p992-turbo-left.turbine", "p992-turbo-left.bearing", "p992-turbo-left.compressor", "p992-turbo-left.cover", "p992-turbo-right.housing", "p992-turbo-right.turbine", "p992-turbo-right.bearing", "p992-turbo-right.compressor", "p992-turbo-right.cover", "p992-wastegate.motor", "p992-wastegate.rod", "p992-wastegate.lever", "p992-wastegate.flap"];

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const cast='#8d8a84',hot='#6f6a63',rubber='#26292b';

// Representative shapes for the parts the default kinds draw as plain boxes.
// A turbocharger: turbine scroll, centre housing and compressor scroll on one axis.
const turbo=(r,c)=>{
  sleeve(r,plus(c,[-.07,0,0]),x,0,.05,.06,.02,hot,20);
  cyl(r,plus(c,[-.02,0,0]),x,0,.04,.028,steel,14);
  sleeve(r,plus(c,[.02,0,0]),x,0,.05,.065,.026,metal,20);
  cyl(r,plus(c,[-.045,0,.05]),z,0,.04,.015,cast,10);
};
// Rigid pipe or line with a bend at each end.
const pipe=color=>(r,c)=>{
  const pts=[[-.1,0,-.03],[-.07,0,.03],[.07,0,.03],[.1,0,-.03]].map(p=>plus(c,p));
  for(let i=1;i<pts.length;i++){const a=pts[i-1],d=pts[i].map((v,k)=>v-a[k]);cyl(r,a,d.map(v=>v/Math.hypot(...d)),0,Math.hypot(...d),.009,color,10);}
};
// Exhaust manifold: three runners into one collector.
const manifold=(r,c)=>{
  for(const dx of [-.06,0,.06])cyl(r,plus(c,[dx,0,-.06]),z,0,.05,.014,hot,10);
  cyl(r,plus(c,[-.08,0,-.01]),x,0,.16,.018,hot,12);
  cyl(r,plus(c,[.08,0,-.01]),z,0,.06,.02,hot,12);
};
const clamp=(r,c)=>sleeve(r,c,y,-.006,.006,.035,.03,steel,20);
const tee=(r,c)=>{cyl(r,plus(c,[-.05,0,0]),x,0,.1,.012,rubber,10);cyl(r,c,z,0,.05,.012,rubber,10);};
const jet=(r,c)=>{cyl(r,plus(c,[0,0,-.02]),z,0,.03,.006,metal,8);cyl(r,plus(c,[0,0,.01]),z,0,.01,.01,dark,6);};

const turbochargers={id:'turbochargers',code:'202-000',title:'Exhaust gas turbochargers and exhaust manifolds',year:'2020 (992-1)',
  url:es('2020_(992-1)','202-000','EXHAUST_GAS_TURBOCHARGER'),
  rows:[
    ['1','0PB145701R','Exhaust gas turbocharger, cylinders 1-3',turbo],
    ['2','0PB145702R','Exhaust gas turbocharger, cylinders 4-6',turbo],
    ['3','0PB145655B','Wastegate servomotor for turbocharger'],
    ['4','PAF008300','Threaded pin M8x22'],
    ['5','PAF007634','Hexagon flange nut M8, self-locking'],
    ['6','0PB251215A','Exhaust manifold, cylinders 1-3',manifold],
    ['7','0PB251216A','Exhaust manifold, cylinders 4-6',manifold],
    ['8','0PB145039A','Turbocharger seal'],
    ['9','0PB253039','Manifold seal'],
    ['10','0PB199553','Securing plate, lower'],
    ['11','0PB199554','Securing plate, upper'],
    ['12','PAF008956','Threaded bush M8',jet],
    ['13','0PB251258','Heat shield, cylinders 1-3'],
    ['14','0PB251414','Heat shield, cylinders 4-6'],
    ['15','PAF008124','Hexagon head bolt M6x12'],
    ['16','PAF009238','Bolt with washer'],
    ['17','PAF009222','Hexagon nut M6, wastegate coupling rod'],
    ['18','0PB198501','Repair set, wastegate guard plate for servomotor'],
    ['19','0PB103781A','Turbocharger heat shield, cylinders 1-3'],
    ['20','0PB103782A','Turbocharger heat shield, cylinders 4-6'],
    ['21','WHT011297','Sealing bolt with seal ring'],
    ['22','9A713355400','Oil jet',jet],
  ]};

const coolant={id:'turbo-coolant-pipes',code:'202-100',title:'Exhaust gas turbocharger coolant pipes',year:'2020 (992-1)',
  url:es('2020_(992-1)','202-100','EXHAUST_GAS_TURBOCHARGER'),
  rows:[
    ['1','0PB121609','Coolant hose, turbocharger feed'],
    ['2','0PB121610','T-piece, turbocharger coolant return',tee],
    ['3','0PB121661','Coolant pipe, turbocharger feed, cylinders 1-3',pipe(metal)],
    ['4','0PB121662','Coolant pipe, turbocharger feed, cylinders 4-6',pipe(metal)],
    ['5','0PB121663D','Coolant pipe, turbocharger return, cylinders 1-3',pipe(metal)],
    ['6','0PB121664','Coolant pipe, turbocharger return, cylinders 4-6',pipe(metal)],
    ['7','PAF008313','Fillister head bolt M6x10'],
    ['8','PAF008288','O-ring 10.0x3.0'],
    ['9','PAF008124','Hexagon head bolt M6x12'],
    ['10','99951265809','Hose clamp B27x12x1.7',clamp],
    ['11','99951268609','Hose clamp B17x12',clamp],
  ]};

const oil={id:'turbo-oil-pipes',code:'202-150',title:'Exhaust gas turbocharger oil pipes',year:'2019 (992-1)',
  url:es('2019_(992-1)','202-150','EXHAUST_GAS_TURBOCHARGER'),
  rows:[
    ['1','0PB115223D','Turbocharger oil pressure line, cylinders 1-3',pipe(steel)],
    ['2','0PB115224E','Turbocharger oil pressure line, cylinders 4-6',pipe(steel)],
    ['3','0PB115252G','Turbocharger oil suction line, cylinders 1-3',pipe(dark)],
    ['4','0PB115218C','Turbocharger oil suction line, cylinders 4-6',pipe(dark)],
    ['5','PAF008288','O-ring 10.0x3.0'],
    ['6','PAF008276','O-ring 12.0x2.5'],
    ['7','N 90754202','Line clamp D1-8x15',clamp],
    ['8','N 10722401','Distance piece B7.5x20x20',clamp],
    ['9','0PB115261','Oil line bracket, cylinders 1-3'],
    ['10','PAF008124','Hexagon head bolt M6x12'],
    ['11','PAF008313','Fillister head bolt M6x10'],
  ]};

export const studies=[turbochargers,coolant,oil].map(d=>catalogueStudy(d,'p992-turbochargers-'));
const [turboStudy,coolantStudy,oilStudy]=studies;
export const views=new Map([
  ['p992-turbo-left.housing',turboStudy],
  ['p992-turbo-right.housing',turboStudy],
  ['p992-wastegate.motor',turboStudy],
  ['p992-turbo-left.bearing',oilStudy],
  ['p992-turbo-right.bearing',coolantStudy],
]);
