// 992 study pack: front-axle.
// Scope: Front axle: struts and PASM dampers, springs, wishbones, wheel carriers, front subframe/cross member, anti-roll bar, front-axle lift if catalogued.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-front-axle-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// Rows follow the rear-wheel-drive Carrera with the 7-speed manual. Four-wheel-drive-only
// rows and the special-edition (PE0W) variants are left out. Where the catalogue gives a
// standard (1BH) and a sports-suspension (1BV) part, both are listed and named as such.
import {catalogueStudy} from './porsche992-catalog-studies.js';
import {TAU,cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';
export const hooks=["p992-suspension.front-arms-left", "p992-suspension.front-arms-right", "p992-damper.tube", "p992-damper.rod", "p992-damper.coil", "p992-damper.mount"];

const P='p992-front-axle-';
const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;
const steel='#7f8c90',iron='#5c696a',rubber='#26292b',alloy='#9aa5a8',spring='#3f5a63';
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const bar=(r,c,a,b,rad,color)=>{const p=plus(c,a),d=b.map((v,i)=>v-a[i]);cyl(r,p,d,0,Math.hypot(...d),rad,color,10);};
const box=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);

// Representative shapes for the big suspension parts.
const crossMember=(r,c)=>{bar(r,c,[-.12,0,-.03],[.12,0,-.03],.014,steel);for(const s of [-1,1]){bar(r,c,[s*.12,0,-.03],[s*.09,0,.05],.012,steel);box(r,plus(c,[s*.12,0,-.03]),[.03,.04,.03],iron);}};
const wishbone=(r,c)=>{bar(r,c,[-.11,-.03,0],[.1,.0,0],.011,alloy);bar(r,c,[-.11,.04,0],[.1,0,0],.011,alloy);for(const p of [[-.11,-.03,0],[-.11,.04,0]])sleeve(r,plus(c,p),y,-.012,.012,.02,.009,rubber,12);turn(r,plus(c,[.1,0,0]),z,[[-.01,0],[-.01,.018],[.02,.012],[.02,0]],steel,{n:12});};
const link=(r,c)=>{bar(r,c,[-.12,0,0],[.12,0,.02],.012,alloy);for(const s of [-1,1])sleeve(r,plus(c,[s*.12,0,s>0?.02:0]),y,-.014,.014,.024,.01,rubber,12);};
const damper=(r,c)=>{cyl(r,plus(c,[0,0,-.1]),z,0,.12,.022,iron,14);cyl(r,plus(c,[0,0,.02]),z,0,.08,.008,steel,10);sleeve(r,plus(c,[0,0,-.03]),z,0,.008,.045,.022,iron,18);box(r,plus(c,[0,0,-.105]),[.04,.03,.02],iron);};
const coil=(r,c)=>{const n=60,pt=i=>plus(c,[.045*Math.cos(5*TAU*i/n),.045*Math.sin(5*TAU*i/n),-.09+.18*i/n]);for(let i=1;i<=n;i++){const a=pt(i-1),d=pt(i).map((v,k)=>v-a[k]);cyl(r,a,d,0,Math.hypot(...d),.007,spring,6);}};
const stabilizer=(r,c)=>{bar(r,c,[-.11,.05,0],[.11,.05,0],.01,steel);for(const s of [-1,1])bar(r,c,[s*.11,.05,0],[s*.13,-.06,-.02],.01,steel);};
const hub=(r,c)=>{cyl(r,c,y,-.012,.012,.055,alloy,24);cyl(r,c,y,.012,.05,.022,alloy,16);for(let i=0;i<5;i++){const a=TAU*i/5;cyl(r,plus(c,[Math.cos(a)*.04,-.012,Math.sin(a)*.04]),y,-.01,0,.007,steel,8);}};
const carrier=(r,c)=>{box(r,c,[.05,.04,.16],alloy);sleeve(r,plus(c,[0,0,0]),y,-.03,.03,.04,.022,alloy,18);box(r,plus(c,[.04,0,-.07]),[.06,.03,.025],alloy);};
const pump=(r,c)=>{box(r,c,[.12,.07,.07],iron);cyl(r,plus(c,[.06,0,0]),x,0,.06,.025,'#41555c',14);};

const diagrams=[
{id:'cross-member',code:'401-000',title:'Front cross member, wishbone and trailing arm',year:'2020 (992-1)',url:es('2020_(992-1)','401-000','CROSS_MEMBER'),
 rows:[['1','992401309S','Front axle cross member',crossMember],['2','PAF008757','Hexagon bolt M12x1.5x105'],['3','PAF008737','Threaded pin M12x1.5x75'],['4','N 90916701','Hexagon collar nut M12x1.5, self-locking'],['5','PAF008756','Hexagon flange screw M12x1.5x50'],['6','992805495','Brace'],['7','N 91253401','Hexagon collared bolt M12x1.5x75, socket head'],['8','N 10714101','Hexagon flange screw M10x25'],
  ['10','992407325H','Trailing arm, front axle',link],['11','PAF008970','Hexagon bolt M14x1.5x95'],['12','PAF912799','Hexagon nut M14x1.5'],['13','992407811J','Front axle air guide, left'],['13','992407812J','Front axle air guide, right'],['14','9A700837900','Cable tie A8.0x337'],['15','992407151G','Wishbone, front axle',wishbone],['16','9A700820900','Hexagon bolt M12x1.5x95'],['17','N 90966402','Hexagon collar nut M12x1.5, self-locking'],
  ['18','992407811E','Lower front axle air guide, left'],['18','992407812E','Lower front axle air guide, right'],['19','N 10632102','Oval-head socket screw M6x25'],['20','PAF908088','Hexagon collar nut M12x1.5, self-locking'],['21','992616213A','Ride level sensor, left'],['21','992616214A','Ride level sensor, right'],['22','N 10005306','Hexagon head bolt M6x12 with washer'],['23','992407063','Brace, left'],['23','992407064','Brace, right'],['24','N 10609203','Hexagon collar nut M8, for the braces'],['25','9A791557601','Anti-corrosion wax']]},
{id:'wheel-carrier',code:'401-005',title:'Front wheel carrier and wheel hub',year:'2020 (992-1)',url:es('2020_(992-1)','401-005','WHEEL_CARRIER'),
 rows:[['1','9P1407621B','Angular ball bearing, front wheel'],['2','992407245AY','Front wheel carrier (swivel mounting), left',carrier],['2','992407246AY','Front wheel carrier (swivel mounting), right',carrier],['3','9P1407123','Retaining bolt, rear-wheel drive'],['6','9P1407115','Spacer plate'],['7','N 10806301','Hexagon collared bolt M8x35, wheel hub plate'],['8','992927807','Wheel speed sensor, front'],['9','N 10546403','Hexagon socket head bolt M6x16, speed sensor'],
  ['10','9P1407581A','Front wheel hub',hub],['11','WHT007021','Self-locking hexagon nut M22x1.5 with washer'],['12','PAF008742','Hexagon bolt M12x1.5x70'],['13','992611845','Brake line bracket, front left'],['13','992611846','Brake line bracket, front right'],['14','PAF100829','Hexagon head bolt M6x16 with washer'],['15','PAF909664','Hexagon collar nut M12x1.5, self-locking']]},
{id:'struts',code:'402-000',title:'Front suspension struts and coil springs',year:'2019 (992-1)',url:es('2019_(992-1)','402-000','SUSPENSION'),
 rows:[['1','992413031AD','Front shock absorber (spring strut)',damper],['2','992412066','Lower spring disc'],['3','9P1411189','Lower support element'],['4','992412359A','Stop cap'],['5','992411105 504','Front coil spring, rear-wheel drive, standard suspension',coil],['5','992411105B 504','Front coil spring, rear-wheel drive, sports suspension',coil],['6','9P1412137A','Bellows'],
  ['7','992412303','Rubber bump stop, standard suspension'],['7','992412303A','Rubber bump stop, sports suspension'],['8','9P1412149','Underlay'],['9','9P1412269','Compensation ring'],['10','992412253','Upper thrust ring'],['11','992412377','Plain bearing'],['12','992412321','Strut bearing plate, left'],['12','992412321A','Strut bearing plate, right'],['13','PAF00855000','Hexagon nut M14x1.5'],['14','PAF003923','Hexagon nut M8']]},
{id:'lift-struts',code:'402-001',title:'Front suspension struts with front-axle lift',year:'2019 (992-1)',url:'https://eurospares.co.uk/Porsche/992/2019/PartDiagrams/402-001/SUSPENSION',
 rows:[['1','992413031E','Front shock absorber (spring strut) for the front-axle lift',damper],['2','9P1412103','Lower spring seat'],['3','992412359A','Stop cap'],['4','992412179','Hydraulic height adjuster, front-axle lift'],['5','992411105','Front coil spring, rear-wheel drive, standard suspension, with lift',coil],['5','992411105B','Front coil spring, rear-wheel drive, sports suspension, with lift',coil],['6','9P1412137A','Bellows'],
  ['7','992412303','Rubber bump stop, standard suspension'],['7','992412303A','Rubber bump stop, sports suspension'],['8','9P1412149','Packing'],['9','9P1412269','Shim'],['10','992412377','Shim'],['11','992412321','Concave strut support, left'],['11','992412321A','Concave strut support, right'],['12','PAF00855000','Hexagon nut M14x1.5'],['13','PAF003923','Hexagon nut M8']]},
{id:'lift-system',code:'402-003',title:'Front-axle lift system',year:'2019 (992-1)',url:'https://eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/402-003/SELF_LEVELLING_SYSTEM',
 rows:[['1','9P1412257B','Lift system pump unit',pump],['2','9A700835200','Hexagon head screw'],['3','992614167','Pump bracket'],['4','N 10722401','Spacer 7.5x20x20'],['5','992411622B','Pressure line'],['6','992411847','Distributor'],['8','95B611797','Clip bracket'],['9','992411621','Pressure line, second'],['11','992411617','Line bracket, left'],['11','992411617A','Line bracket, right'],['12','N 91018901','Plastic shouldered hexagon nut'],['13','992411337','Plate'],['14','N 91074201','Hexagon socket head bolt M5x16'],['15','N 90455902','Speed nut M5'],['16','992412179','Hydraulic height adjuster']]},
{id:'anti-roll-bar',code:'402-020',title:'Front anti-roll bar and coupling rods',year:'2020 (992-1)',url:es('2020_(992-1)','402-020','STABILIZER'),
 rows:[['1','9P1411317','Anti-roll bar coupling rod, left'],['1','9P1411318','Anti-roll bar coupling rod, right'],['2','PAF007957','Hexagon nut M10, coupling rod'],['3','992411303BY','Front anti-roll bar, complete, rear-wheel drive',stabilizer],['4','992411313B','Anti-roll bar bearing bracket'],['5','9P1411063A','Anti-roll bar clamp'],['6','PAF912679','Hexagon nut M10, anti-roll bar clamp'],['7','PAF106802','Hexagon flange screw'],['8','PAF909664','Hexagon collar nut M12x1.5, self-locking']]},
];

export const studies=diagrams.map(d=>catalogueStudy(d,P));
const [crossMemberStudy,wheelCarrier,struts,liftStruts,liftSystem,antiRollBar]=studies;
const pid=(s,ref,mpn)=>`${s.id}.r${ref}-${mpn.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
export const views=new Map([
  ['p992-suspension.front-arms-left',crossMemberStudy],
  ['p992-suspension.front-arms-right',wheelCarrier],
  ['p992-damper.tube',struts],
  ['p992-damper.coil',struts],
  ['p992-damper.mount',struts],
  ['p992-damper.rod',liftStruts],
  // The anti-roll bar's bearing brackets sit on the front cross member.
  [pid(crossMemberStudy,'1','992401309S'),antiRollBar],
  // The hydraulic adjuster on the lift strut is fed by the lift system's pump.
  [pid(liftStruts,'4','992412179'),liftSystem],
]);
