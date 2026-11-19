// 992 fit pack: rear-axle. Installed parts drawn onto the car.
// Scope: Rear axle: rear axle carrier/subframe, rear anti-roll bar with links, wheel carriers, bearings and hubs, brake dust shields, wheel-speed sensors, rear ride-height sensor, gearbox mounts. The five links and dampers already exist (p992-suspension.*).
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-rear-axle' or 'p992-fit-rear-axle-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// Hard points follow the existing schematic five-link axle (porsche992-suspension.js):
// each link's inner end is carried by the cross member or a side part, and its
// outer end by the wheel carrier. Wheel centres sit at x 1.25, y ±0.778, z 0.358,
// where the drawn half-shafts, discs and calipers already are. Where the catalogue
// gives one number for both sides (hub, wheel-speed sensor, anti-roll bar mount,
// clamp and link, air guide plate), the left-hand unit is fitted.
import {barrel,pipe,ellipsoid} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';

const page=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const crossPage=page('501-005','Rear axle cross member','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/501-005/REAR_AXLE');
const linkPage=page('501-010','Rear axle wishbones, axle guides and track rod (standard rear axle)','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/501-010/REAR_AXLE');
const hubPage=page('501-000','Rear wheel carrier and wheel hub','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/501-000/REAR_AXLE');
const barPage=page('501-025','Rear anti-roll bar without PDCC','https://eurospares.co.uk/Porsche/992-1/2019/PartDiagrams/501-025/STABILIZER');
const brakePage=page('603-005','Rear axle disc brakes, red calipers','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/603-005/DISC_BRAKES');
const linePage=page('604-020','Brake lines, centre underbody rear','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/604-020/BRAKE_LINE');
const mountPage=page('306-000','Mounting parts for engine and transmission','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/306-000/MOUNTING_PARTS_FOR_ENGINE_AND');

const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(id,name,description,source,parts)=>({id,name,description,source,view:'hero',internal:true,category:'service',parts:parts.map(p=>({...p,id:id+'.'+p.id}))});
const cast='#8e999b',steel='#5d676a',black='#2e3436',rubber='#26292b',plastic='#3b4346',zinc='#9aa3a0';
const sides=[[-1,'left','Left'],[1,'right','Right']];
const m=(s,[a,b,c])=>[a,s*b,c];
// Stations along the y axis for a part on side s, ordered for turn().
const span=(s,a,b)=>[Math.min(s*a,s*b),Math.max(s*a,s*b)];
const hub=[1.25,0,.358];

// --- Rear axle cross member, side parts and Cabriolet braces (501-005) ---
// The cast cross member runs beneath the final drive and carries the lower
// wishbones' inner bushes. Each side part runs from the axle guide's front
// pivot to the toe link and upper rear link pivots and bolts onto the end of
// the cross member. Two braces and a cross reinforcement, which the catalogue
// lists for the Cabriolet and Targa, tie the axle to the sills; their exact run
// is not on the diagram, so it is drawn to clear the underbody lines.
function sidePart(r,s){
 cyl(r,m(s,[.932,.452,.29]),z,-.022,.022,.020,cast,10);
 barrel(r,m(s,[.932,.44,.272]),m(s,[1.25,.43,.185]),.018,cast,8);
 barrel(r,m(s,[1.25,.43,.185]),m(s,[1.477,.455,.322]),.018,cast,8);
 cyl(r,m(s,[1.477,.455,.336]),z,-.022,.022,.020,cast,10);
 barrel(r,m(s,[1.477,.47,.345]),m(s,[1.476,.505,.525]),.015,cast,8);
 barrel(r,m(s,[1.035,.41,.24]),m(s,[1.035,.41,.495]),.012,cast,8);
 barrel(r,m(s,[1.035,.41,.487]),m(s,[1.01,.44,.487]),.011,cast,8);
}
function levelSensor(r,s){
 box(r,m(s,[1.20,.455,.225]),[.035,.03,.03],black);
 barrel(r,m(s,[1.20,.47,.235]),m(s,[1.215,.50,.235]),.004,steel,6);
 barrel(r,m(s,[1.215,.50,.235]),m(s,[1.252,.52,.25]),.004,zinc,6);
 box(r,m(s,[1.20,.44,.244]),[.016,.012,.012],plastic);
}
const carrier=group('p992-fit-rear-axle','Rear axle cross member and braces',
 'The rear axle carrier holds the inner ends of the five links on each side beneath the transaxle. Two braces and a cross reinforcement, listed for the Cabriolet and Targa, tie it to the sills. The ride-height sensors read wheel travel from the lower wishbones.',crossPage,[
 part('cross-member','Rear axle cross member · 992505105A','This cast cross member runs beneath the final drive and carries the inner bushes of both lower wishbones. The side parts bolt to its ends.',[0,0,-.26],crossPage,r=>{
  box(r,[1.26,0,.175],[.10,.86,.04],cast);
  for(const [s] of sides)box(r,m(s,[1.266,.367,.217]),[.06,.04,.045],cast);
 }),
 ...sides.map(([s,hand,label])=>part('side-'+hand,`${label} rear axle side part · ${s<0?'992505063A':'992505064A'}`,`The ${hand} side part carries the inner pivots of the axle guide, both upper links and the toe link. It bolts onto the end of the cross member.`,[0,s*.22,-.14],crossPage,r=>sidePart(r,s))),
 ...sides.map(([s,hand,label])=>part('brace-'+hand,`${label} rear axle brace, Cabriolet and Targa · ${s<0?'992505475H':'992505476H'}`,`Porsche lists this brace as a Panhard rod. It runs diagonally forward and outboard from the front corner of the cross member to the underside of the sill and braces the open body.`,[-.18,s*.2,-.18],crossPage,r=>{
  barrel(r,m(s,[1.20,.36,.168]),m(s,[.83,.52,.150]),.012,steel,8);
  cyl(r,m(s,[1.20,.36,.168]),z,-.008,.012,.020,steel,8);cyl(r,m(s,[.83,.52,.140]),z,-.008,.016,.020,steel,8);
 })),
 part('cross-reinforcement','Rear axle cross reinforcement, Cabriolet and Targa · 992505525A','A flat plate ties the rear ends of the two braces to the front face of the cross member under the final drive.',[-.12,0,-.24],crossPage,r=>{
  box(r,[1.158,0,.165],[.104,.76,.008],steel);
 }),
 ...sides.map(([s,hand,label])=>part('level-sensor-'+hand,`${label} ride height level sensor · ${s<0?'992616571B':'992616572B'}`,`The sensor sits on the ${hand} side part. A lever and short rod connect it to the lower wishbone, so it reports rear ride height for PASM and headlight levelling.`,[0,s*.16,-.2],crossPage,r=>levelSensor(r,s)))
]);

// --- Rear wheel carriers, hub and brake shields (501-000, 603-005) ---
// The cast-aluminium carrier holds the wheel bearing around the half-shaft. Its
// upper ear takes the two upper links, its lower bar the wishbone, axle guide and
// toe link, and an inboard arm the damper foot. The drawn half-shaft has its outer
// bellows at y 0.68-0.73, so the carrier bore is drawn open around it and the
// hub and its flange sit outboard, against the disc.
function wheelCarrier(r,s){
 sleeve(r,hub,y,...span(s,.655,.735),.074,.064,cast,16);
 box(r,m(s,[1.255,.725,.447]),[.09,.012,.034],cast);
 barrel(r,m(s,[1.235,.660,.432]),m(s,[1.20,.612,.442]),.016,cast,8);
 barrel(r,m(s,[1.205,.716,.266]),m(s,[1.338,.70,.282]),.016,cast,8);
 barrel(r,m(s,[1.30,.703,.284]),m(s,[1.30,.648,.272]),.012,cast,8);
}
// The cover plate is an open ring behind the disc, cut away where the caliper
// and the parking-brake mechanism sit behind the hub.
function coverPlate(r,s){
 const [a,b]=span(s,.736,.740);
 turn(r,hub,y,[[a,.066],[a,.168],[b,.168],[b,.066],[a,.066]],zinc,{n:18,start:Math.PI/4,sweep:1.5*Math.PI});
}
const wheelEnd=group('p992-fit-rear-axle-wheel','Rear wheel carriers, hub and brake shields',
 'Each rear wheel runs on a hub bearing in a cast wheel carrier, which the five links and the damper locate. A cover plate shields each disc from the inboard side. The wheel-speed sensor reads the hub for ABS and PSM.',hubPage,[
 ...sides.map(([s,hand,label])=>part('carrier-'+hand,`${label} rear wheel carrier · ${s<0?'992505051BY':'992505052BY'}`,`The ${hand} carrier holds the hub bearing around the half-shaft. Its ears take the outer joints of the five links and the foot of the damper.`,[0,s*.26,0],hubPage,r=>wheelCarrier(r,s))),
 part('hub','Rear wheel hub, bolted wheels · 992501651C','The left hub turns in the carrier, takes the half-shaft splines and carries the disc and wheel on its flange. The right hub is the same part.',[0,-.36,0],hubPage,r=>{
  sleeve(r,hub,y,-.745,-.735,.062,.027,steel,14);
  sleeve(r,hub,y,-.751,-.745,.075,.027,steel,16);
 }),
 part('speed-sensor','Rear wheel-speed sensor · 992927807','The left sensor is screwed into the front of the carrier and reads the encoder ring that turns with the hub. The right sensor is the same part.',[-.14,-.2,.12],hubPage,r=>{
  const d=[Math.cos(Math.PI*5/6),0,Math.sin(Math.PI*5/6)],c=[1.25,-.69,.358];
  cyl(r,c,d,.066,.11,.009,black,8);cyl(r,c,d,.11,.124,.012,plastic,8);
 }),
 ...sides.map(([s,hand,label])=>part('cable-holder-'+hand,`${label} wheel-speed sensor cable holder · ${s<0?'992971005':'992971006'}`,`This clip on the front edge of the ${hand} carrier's upper ear guides the sensor cable up to the wheel housing.`,[-.12,s*.2,.1],hubPage,r=>{
  box(r,m(s,[1.196,.725,.432]),[.016,.018,.026],plastic);
 })),
 ...sides.map(([s,hand,label])=>part('cover-plate-'+hand,`${label} rear brake cover plate · ${s<0?'992615611E':'992615612E'}`,`The ${hand} dust shield is bolted to the carrier just inboard of the disc. It is open at the rear around the caliper and parking brake.`,[0,s*.16,0],brakePage,r=>coverPlate(r,s))),
 ...sides.map(([s,hand,label])=>part('hose-retainer-'+hand,`${label} rear brake hose retainer · ${s<0?'992611843':'992611844'}`,`The ${hand} retainer holds the joint where the underbody brake line meets the flexible hose to the caliper. It is bolted to the side part.`,[-.1,s*.18,.1],linePage,r=>{
  box(r,m(s,[1.06,.452,.29]),[.024,.012,.074],zinc);
  box(r,m(s,[1.06,.443,.33]),[.02,.026,.018],zinc);
 })),
 part('air-guide','Rear brake air guide plate · 992615396','The plate under the left lower wishbone directs cooling air towards the brake. The right plate is the same part.',[0,-.18,-.14],linkPage,r=>{
  box(r,[1.235,-.64,.235],[.09,.16,.006],plastic);
 }),
 ...sides.map(([s,hand,label])=>part('spoiler-'+hand,`${label} rear axle spoiler · ${s<0?'9P1615457E':'9P1615458E'}`,`This small deflector hangs from the sill ahead of the ${hand} rear tyre and turns the underbody airflow away from it.`,[-.16,s*.12,-.1],linkPage,r=>{
  box(r,m(s,[.94,.75,.124]),[.012,.22,.068],black);
 }))
]);

// --- Rear anti-roll bar (501-025, without PDCC) ---
// The bar runs behind the cross member under the final drive. Its arms point
// forward and outboard; each coupling link rises to a lug on the wheel carrier.
const stabilizer=group('p992-fit-rear-axle-stabilizer','Rear anti-roll bar',
 'The tubular bar is held in two rubber mounts clamped to the rear of the cross member. Coupling links join its arms to the wheel carriers, so body roll twists the bar.',barPage,[
 part('bar','Rear anti-roll bar · 992511025H','The bar runs across the car behind the cross member. Its arms turn forward to the coupling links at each wheel carrier.',[.22,0,-.24],barPage,r=>{
  pipe(r,[[1.30,-.53,.20],[1.36,-.36,.19],[1.36,.36,.19],[1.30,.53,.20]],.011,black,10);
 }),
 part('mount','Rear anti-roll bar rubber mount · 992511035B','The left rubber mount grips the bar beside the cross member. The right mount is the same part.',[.18,-.12,-.18],barPage,r=>{
  sleeve(r,[1.36,0,.19],y,-.292,-.248,.022,.0115,rubber,12);
 }),
 part('clamp','Rear anti-roll bar clamp · 9P1511418A','The left clamp holds the rubber mount against the rear face of the cross member. The right clamp is the same part.',[.24,-.12,-.12],barPage,r=>{
  turn(r,[1.36,0,.19],y,[[-.288,.022],[-.288,.026],[-.252,.026],[-.252,.022],[-.288,.022]],zinc,{n:10,start:-Math.PI/2,sweep:Math.PI});
  for(const h of [.024,-.024])box(r,[1.335,-.27,.19+h],[.06,.036,.004],zinc);
 }),
 part('link','Rear anti-roll bar coupling link · 9P1511467A','The left link joins the bar arm to the lug on the wheel carrier through a ball joint at each end. The right link is the same part.',[.1,-.24,0],barPage,r=>{
  barrel(r,[1.30,-.53,.20],[1.30,-.645,.275],.007,steel,8);
  for(const p of [[1.30,-.53,.20],[1.30,-.645,.275]])ellipsoid(r,p,[.013,.013,.013],black,8,4);
 })
]);

// --- Gearbox mount (306-000, manual) ---
// The nose of the seven-speed transaxle rests on a carrier bolted beneath it.
// The side member carries it and bolts to the rear wall of the tunnel.
const gearboxMount=group('p992-fit-rear-axle-gearbox','Manual gearbox mount',
 'The front of the seven-speed transaxle is supported at the end of the tunnel. A carrier on the gearbox nose sits on a side member bolted to the body.',mountPage,[
 part('carrier','Transmission carrier, manual gearbox · 992399231A','This bracket is bolted under the nose of the gearbox case and rests on the side member.',[-.16,0,-.1],mountPage,r=>{
  box(r,[.875,0,.4275],[.04,.08,.015],cast);
 }),
 part('side-member','Gearbox side member, manual gearbox · 992399107B','The member spans beneath the gearbox nose, and its two ends bolt to the rear wall of the tunnel.',[-.22,0,-.16],mountPage,r=>{
  box(r,[.866,0,.405],[.03,.30,.03],steel);
  for(const s of [-1,1])box(r,[.8475,s*.14,.435],[.015,.03,.07],steel);
 })
]);

export const groups=[carrier,wheelEnd,stabilizer,gearboxMount];
export const lines=[];
const wheel='p992-fit-rear-axle-wheel.',axle='p992-fit-rear-axle.',bar='p992-fit-rear-axle-stabilizer.';
export const mounts=[
 ...sides.flatMap(([s,hand])=>[
  ...['upper-front','upper-rear','lower','longitudinal','toe'].map(k=>[wheel+'carrier-'+hand,'p992-suspension.'+k+'-'+hand,'the outer joint of this link is bolted into its ear on the wheel carrier']),
  [wheel+'carrier-'+hand,'p992-suspension.rear-damper-'+hand,'the damper foot is bolted to the inboard arm of the wheel carrier'],
  [axle+'cross-member','p992-suspension.lower-'+hand,'the lower wishbone inner bush is bolted into its bracket on the cross member'],
  ...['upper-front','upper-rear','longitudinal','toe'].map(k=>[axle+'side-'+hand,'p992-suspension.'+k+'-'+hand,'the inner bush of this link is bolted into its pivot on the side part']),
  [axle+'level-sensor-'+hand,'p992-suspension.lower-'+hand,'the sensor coupling rod is clipped to a ball stud on the lower wishbone'],
  [wheel+'hose-retainer-'+hand,axle+'side-'+hand,'the brake hose retainer is bolted to the side part'],
  [axle+'brace-'+hand,'shell.fenders','the front foot of the brace is bolted to the underside of the sill'],
 ]),
 [wheel+'air-guide','p992-suspension.lower-left','the air guide plate is screwed to the underside of the lower wishbone'],
 [bar+'clamp',axle+'cross-member','the clamp is bolted to the rear face of the cross member'],
 [bar+'link',wheel+'carrier-left','the coupling link ball joint is bolted to the lug on the wheel carrier'],
 [bar+'link','shell.fenders','it reaches the wheel carrier through the open wheel housing; the housing wall is drawn as a closed disc'],
 ['p992-fit-rear-axle-gearbox.carrier','drivetrain.gearbox','the carrier is bolted under the nose of the gearbox case'],
 ['p992-fit-rear-axle-gearbox.side-member','floor.pan','the ends of the side member bolt to the rear wall of the tunnel'],
];
