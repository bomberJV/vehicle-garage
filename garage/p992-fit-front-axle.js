// 992 fit pack: front-axle. Installed parts drawn onto the car.
// Scope: Front axle: front axle carrier/subframe, anti-roll bar with bushes and drop links, wheel carriers, wheel bearings and hubs, brake dust shields, wheel-speed sensors, ride-height sensor, strut-tower brace if standard. The struts, wishbones and steering already exist (p992-suspension.*, p992-steering.*).
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-front-axle' or 'p992-fit-front-axle-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// Hard points come from the installed suspension (porsche992-suspension.js): wheel
// centre x -1.20, z .339; wishbone inner pivots [-1.14, ±.376, .285]; trailing-link
// pivots [-.924, ±.415, .304]; strut base [-1.20, ±.706, .359] and top [-1.15, ±.555, .771].
// The cross member stays below the coolant pipes (z ≥ .226) and centre brake lines (z .30)
// that run along the floor, and above the underbody (z ≈ .15).
// Porsche lists one number for both sides of the wheel bearing, hub, wheel-speed sensor,
// anti-roll bar bearing bracket and clamp, so each is fitted once, on the left.
import {barrel,pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,sleeve,turn,unit,TAU} from './mechanism-shapes.js';

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;
const cat=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const crossPlate=cat('401-000','Front cross member, wishbone and trailing arm',es('2020_(992-1)','401-000','CROSS_MEMBER'));
const carrierPlate=cat('401-005','Front wheel carrier and wheel hub',es('2020_(992-1)','401-005','WHEEL_CARRIER'));
const strutPlate=cat('402-000','Front suspension struts and coil springs',es('2019_(992-1)','402-000','SUSPENSION'));
const barPlate=cat('402-020','Front anti-roll bar and coupling rods',es('2020_(992-1)','402-020','STABILIZER'));
const brakePlate=cat('602-020','Front disc brakes, red calipers, with caliper adapter',es('2023_(992-1)','602-020','Disc_brake_17_Front_axle_red_black'));

const casting='#8f9a9b',carrierAlloy='#9aa3a2',springSteel='#454e50',steel='#6b7577',rubber='#2b3133',plastic='#30383a',shieldGrey='#6d7576',sensorBlack='#262c2e';
const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const sides=[[-1,'left'],[1,'right']];
const Side=s=>s<0?'Left':'Right';
const out=s=>[0,s*.30,0];
const AX=-1.20,AZ=.339;
// Along the wheel axis on side s: d is the distance outboard from the centre line.
const axle=s=>[0,s,0];
const at=(xx,s,d,zz)=>[xx,s*d,zz];
// Strut axis from the installed spring strut.
const strutBase=s=>[-1.20,s*.706,.359],strutTop=s=>[-1.15,s*.555,.771];
const strutDir=s=>unit(strutTop(s).map((v,i)=>v-strutBase(s)[i]));
// A flat strap of rectangular section between two points.
function strap(r,a,b,width,thick,color){
 const d=unit(b.map((v,i)=>v-a[i])),side=unit([d[1],-d[0],0]),up=[side[1]*d[2]-side[2]*d[1],side[2]*d[0]-side[0]*d[2],side[0]*d[1]-side[1]*d[0]];
 const c=(p,u,v)=>p.map((q,i)=>q+side[i]*u*width/2+up[i]*v*thick/2);
 const ring=p=>[c(p,-1,-1),c(p,1,-1),c(p,1,1),c(p,-1,1)];
 const A=ring(a),B=ring(b);
 for(let i=0;i<4;i++)r.polygon([A[i],A[(i+1)%4],B[(i+1)%4],B[i]],color,false);
 r.polygon(A,color,false);r.polygon(B,color,false);
}
// Angle range of the dust shield, measured from rearward (+x) towards up: the
// caliper sector behind the axle is left open.
const shieldStart=s=>s<0?TAU*5/8:TAU/8;

// ---------- Cross member, braces, level sensors and brake air guides ----------
const crossMember=r=>{
 for(const xx of [-1.32,-1.03,-.93])box(r,[xx,0,.197],[.05,.85,.04],casting);
 for(const s of [-1,1]){
  box(r,[-1.125,s*.40,.197],[.44,.045,.04],casting);
  // Wishbone and trailing-link pivot brackets.
  box(r,[-1.14,s*.39,.25],[.06,.05,.08],casting);
  box(r,[-.93,s*.415,.258],[.05,.05,.082],casting);
  // Steering-rack pedestals and anti-roll bar pedestals.
  box(r,[-1.03,s*.33,.2675],[.04,.04,.101],casting);
  box(r,[-1.32,s*.32,.256],[.04,.04,.078],casting);
  // Body mounting bosses at the four corners.
  for(const xx of [-1.32,-.93])cyl(r,[xx,s*.425,.197],[0,0,1],-.02,.035,.024,casting,12);
 }
};
const levelSensor=s=>r=>{
 box(r,[-1.225,s*.40,.236],[.045,.03,.038],sensorBlack);
 box(r,[-1.225,s*.4425,.25],[.008,.055,.008],steel);
 barrel(r,[-1.225,s*.468,.25],[-1.163,s*.478,.284],.004,plastic,6);
};
// The scoop rises from its front edge to the wishbone and turns air up toward the disc.
const airGuide=s=>r=>{
 const A=at(-1.275,s,.565,.255),B=at(-1.275,s,.675,.255),C=at(-1.19,s,.675,.305),D=at(-1.19,s,.565,.305);
 r.polygon([A,B,C,D],plastic,false);
 for(const d of [.565,.675])r.polygon([at(-1.275,s,d,.255),at(-1.19,s,d,.305),at(-1.19,s,d,.283)],plastic,false);
};
const lowerAirGuide=s=>r=>{r.polygon([at(-1.275,s,.57,.255),at(-1.275,s,.66,.255),at(-1.15,s,.66,.255),at(-1.15,s,.57,.255)],plastic,false);};

const axleCarrier={id:'p992-fit-front-axle',name:'Front axle cross member, braces and level sensors',
 description:'The aluminium cross member carries the inner pivots of the wishbones and trailing links, the steering rack and the anti-roll bar. Braces tie it to the body. A level sensor on each side reads wishbone travel, and plastic guides on the wishbones turn air toward the brakes.',
 source:crossPlate,view:'hero',internal:true,category:'service',parts:[
 part('cross-member','Front axle cross member · 992401309S','The aluminium subframe bolts under the front body. It carries the inner pivots of both wishbones and trailing links, the steering rack and the anti-roll bar bushes.',[0,0,-.25],crossPlate,crossMember),
 part('brace','Front brace · 992805495','This flat brace is bolted under the front of the cross member and stiffens its front body mounts.',[-.25,0,-.2],crossPlate,r=>box(r,[-1.40,0,.174],[.12,.56,.006],steel)),
 ...sides.map(([s,hand])=>part('brace-'+hand,Side(s)+' cross member brace · '+(s<0?'992407063':'992407064'),'The brace runs from the rear corner of the cross member back and outward to the body. Porsche lists M8 collar nuts for it.',[.15,s*.25,-.2],crossPlate,r=>strap(r,[-.93,s*.425,.19],[-.80,s*.53,.153],.03,.006,steel))),
 ...sides.map(([s,hand])=>part('level-sensor-'+hand,Side(s)+' ride level sensor · '+(s<0?'992616213A':'992616214A'),'The sensor sits on the cross member. Its lever and coupling rod follow the wishbone, so the car can measure front ride height for headlight range control.',[0,s*.2,-.15],crossPlate,levelSensor(s))),
 ...sides.map(([s,hand])=>part('air-guide-'+hand,Side(s)+' front axle air guide · '+(s<0?'992407811J':'992407812J'),'Two cable ties hold this plastic scoop on the wishbone. It turns air from beneath the car up toward the brake disc.',[-.15,s*.22,-.12],crossPlate,airGuide(s))),
 ...sides.map(([s,hand])=>part('lower-air-guide-'+hand,Side(s)+' lower front axle air guide · '+(s<0?'992407811E':'992407812E'),'This flat lower section is screwed to the front edge of the upper air guide and extends beneath the wishbone.',[-.1,s*.22,-.2],crossPlate,lowerAirGuide(s)))
]};

// ---------- Anti-roll bar ----------
const barPath=[[-1.268,-.615,.32],[-1.295,-.50,.32],[-1.32,-.38,.32],[-1.32,.38,.32],[-1.295,.50,.32],[-1.268,.615,.32]];
const coupling=s=>{const lo=[-1.268,s*.615,.32],hi=[-1.232,s*.672,.45];return {lo,hi};};
const rollBar={id:'p992-fit-front-axle-roll',name:'Front anti-roll bar',
 description:'The tubular bar runs across the front of the cross member. Its arms turn back to coupling rods on the spring struts, so it resists body roll by twisting when one wheel rises more than the other.',
 source:barPlate,view:'hero',internal:true,category:'service',parts:[
 part('bar','Front anti-roll bar, rear-wheel drive · 992411303BY','The bar twists in two rubber bushes on the cross member. Each end carries a coupling rod to the strut.',[-.22,0,0],barPlate,r=>{pipe(r,barPath,.013,springSteel,10);for(const s of [-1,1])cyl(r,[-1.268,0,.32],axle(s),.603,.627,.02,springSteel,10);}),
 part('bearing-bracket','Anti-roll bar bearing bracket · 992411313B','The bracket clamps the rubber bush around the bar onto its pedestal on the cross member.',[-.15,-.12,.12],barPlate,r=>{
  sleeve(r,[-1.32,0,.32],axle(-1),.30,.34,.027,.013,rubber,14);
  r.box(-1.348,-.345,.293,-1.292,-.295,.299,steel);
 }),
 part('clamp','Anti-roll bar clamp · 9P1411063A','The clamp is pressed onto the bar beside the bush and keeps the bar from sliding sideways.',[-.15,-.18,.08],barPlate,r=>sleeve(r,[-1.32,0,.32],axle(-1),.348,.362,.019,.013,steel,12)),
 ...sides.map(([s,hand])=>part('link-'+hand,Side(s)+' anti-roll bar coupling rod · '+(s<0?'9P1411317':'9P1411318'),'Ball joints at both ends connect the end of the anti-roll bar to the bracket on the spring strut.',[-.12,s*.2,.1],barPlate,r=>{
  const {lo,hi}=coupling(s);barrel(r,lo,hi,.007,steel,8);
  for(const p of [lo,hi])cyl(r,[p[0],0,p[2]],axle(s),Math.abs(p[1])-.012,Math.abs(p[1])+.012,.015,steel,10);
 }))
]};

// ---------- Wheel corners ----------
const carrier=s=>r=>{
 // Bearing bore, ball-joint lug, caliper lugs, steering arm and strut clamp.
 sleeve(r,[AX,0,AZ],axle(s),.722,.760,.062,.041,carrierAlloy,20);
 box(r,at(AX,s,.735,.285),[.045,.03,.03],carrierAlloy);
 box(r,at(-1.115,s,.738,.385),[.07,.026,.024],carrierAlloy);box(r,at(-1.12,s,.738,.285),[.08,.026,.03],carrierAlloy);
 box(r,at(-1.155,s,.738,.357),[.03,.026,.028],carrierAlloy);
 sleeve(r,strutBase(s),strutDir(s),0,.05,.043,.031,carrierAlloy,14);
};
const shield=s=>r=>turn(r,[AX,0,AZ],axle(s),[[.748,.064],[.748,.165],[.736,.165]],shieldGrey,{n:24,start:shieldStart(s),sweep:TAU*3/4});
const lineBracket=s=>r=>{
 // Up from the top caliper lug, then across above the caliper to the hose clip.
 strap(r,at(-1.105,s,.735,.395),at(-1.105,s,.735,.447),.02,.004,steel);
 strap(r,at(-1.105,s,.735,.445),at(-1.079,s,.68,.445),.016,.004,steel);
 box(r,at(-1.079,s,.68,.44),[.016,.012,.018],steel);
};
const topMount=s=>r=>{
 const t=strutTop(s),u=strutDir(s);
 cyl(r,t,u,-.006,.008,.058,steel,16);cyl(r,t,u,.008,.028,.034,rubber,14);
};
const corner={id:'p992-fit-front-axle-corner',name:'Front wheel carriers, hubs and strut mounts',
 description:'Each cast wheel carrier holds the wheel bearing and hub, the brake caliper and its dust shield. The strut clamps into the carrier, the wishbone and tie rod bolt to it, and the top of the strut sits in a bearing plate in the body tower.',
 source:carrierPlate,view:'hero',internal:true,category:'service',parts:[
 ...sides.map(([s,hand])=>part('carrier-'+hand,Side(s)+' front wheel carrier · '+(s<0?'992407245AY':'992407246AY'),'The cast carrier swivels on the wishbone ball joint and the strut. It holds the wheel bearing, the caliper lugs and the steering arm for the tie rod.',out(s),carrierPlate,carrier(s))),
 part('bearing','Left front wheel bearing · 9P1407621B','The angular ball bearing is pressed into the carrier bore and carries the hub. Porsche lists the same bearing for both sides.',[0,-.38,0],carrierPlate,r=>sleeve(r,[AX,0,AZ],axle(-1),.738,.760,.041,.022,steel,18)),
 part('hub','Left front wheel hub · 9P1407581A','The hub turns in the bearing. The brake disc and wheel are centred on its spigot and bolted to its flange.',[0,-.45,0],carrierPlate,r=>{
  cyl(r,[AX,0,AZ],axle(-1),.738,.760,.021,steel,14);cyl(r,[AX,0,AZ],axle(-1),.760,.768,.068,steel,20);sleeve(r,[AX,0,AZ],axle(-1),.768,.80,.034,.020,steel,16);
 }),
 part('speed-sensor','Left front wheel-speed sensor · 992927807','The sensor is screwed into the carrier and reads the magnetic encoder ring on the wheel bearing for ABS and PSM.',[-.12,-.2,-.1],carrierPlate,r=>{
  cyl(r,[-1.245,0,.300],axle(-1),.700,.736,.009,sensorBlack,10);box(r,at(-1.245,-1,.693,.300),[.022,.014,.03],sensorBlack);
 }),
 ...sides.map(([s,hand])=>part('shield-'+hand,Side(s)+' front brake cover plate · '+(s<0?'9P1615311B':'9P1615312B'),'The pressed dust shield is screwed to the carrier inboard of the disc. It leaves the caliper sector open.',[0,s*.22,0],brakePlate,shield(s))),
 ...sides.map(([s,hand])=>part('line-bracket-'+hand,Side(s)+' brake line bracket · '+(s<0?'992611845':'992611846'),'The bracket is screwed to the top caliper lug of the carrier and holds the brake hose where it meets the caliper.',[.12,s*.12,.12],carrierPlate,lineBracket(s))),
 ...sides.map(([s,hand])=>part('top-mount-'+hand,Side(s)+' strut bearing plate · '+(s<0?'992412321':'992412321A'),'The bearing plate is bolted into the body tower and holds the top of the spring strut.',[0,s*.08,.25],strutPlate,topMount(s)))
]};

export const groups=[axleCarrier,rollBar,corner].map(g=>({...g,parts:g.parts.map(p=>({...p,id:g.id+'.'+p.id}))}));
export const lines=[];
const C='p992-fit-front-axle-corner.',R='p992-fit-front-axle-roll.',X='p992-fit-front-axle.';
export const mounts=[
 ...sides.flatMap(([s,hand])=>[
  [X+'cross-member','p992-suspension.front-arms-'+hand,'the wishbone and trailing-link inner bushes are bolted into the pivot brackets of the cross member'],
  [X+'level-sensor-'+hand,'p992-suspension.front-arms-'+hand,'the level sensor coupling rod is clipped to a ball stud on the wishbone'],
  [X+'air-guide-'+hand,'p992-suspension.front-arms-'+hand,'the air guide is held on the wishbone by two cable ties'],
  [R+'link-'+hand,'p992-suspension.front-strut-'+hand,'the upper ball joint of the coupling rod is bolted to the bracket on the strut tube'],
  [C+'carrier-'+hand,'p992-suspension.front-strut-'+hand,'the strut lower end is clamped in the split collar of the wheel carrier'],
  [C+'carrier-'+hand,'p992-suspension.front-arms-'+hand,'the wishbone ball joint is bolted into the lower lug of the wheel carrier'],
  [C+'carrier-'+hand,'p992-steering.tie-'+hand,'the tie-rod end ball joint is bolted into the steering arm of the wheel carrier'],
  [C+'top-mount-'+hand,'p992-suspension.front-strut-'+hand,'the strut piston rod is bolted through the bearing plate'],
 ]),
 [X+'cross-member','p992-steering.rack','the steering rack is bolted onto two pedestals of the cross member'],
 [R+'bearing-bracket',X+'cross-member','the bearing bracket is bolted onto its pedestal on the cross member'],
 [C+'carrier-left','brakes.front-caliper','the fixed caliper is bolted to the two caliper lugs of the wheel carrier through its adapter'],
 [C+'carrier-right','brakes.front-caliper','the fixed caliper is bolted to the two caliper lugs of the wheel carrier through its adapter'],
 // The inner wheel-housing wall is drawn as a closed disc at |y| .535, as for the
 // installed wishbones; on the car each arm of the bar reaches the strut through the
 // housing's open lower edge.
 [R+'bar','shell.fenders','each arm reaches the strut through the open wheel housing; the housing wall is drawn as a closed disc'],
 [C+'hub','brakes.front-disc','the brake disc is centred on the hub spigot and clamped to the hub flange by the wheel bolts'],
];
