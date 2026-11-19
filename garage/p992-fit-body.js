// 992 fit pack: body. Installed parts drawn onto the car.
// Scope: Body structure and closures: front and rear bumper crash beams, deformation elements, bumper brackets and guides, luggage-compartment lid lock, striker and gas struts, engine-lid lock and struts, towing-eye inserts, underbody panels, wheel-arch liners, engine-lid grille. The outer shell (shell.*), spoiler and roof already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-body' or 'p992-fit-body-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// Where Porsche lists one number for a pair (the front and rear lid dampers),
// one unit is drawn, on the left. The catalogue pages hold no rows for towing-eye
// inserts or wheel-arch liners, so neither is fitted.
import {barrel,pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,sleeve,x,y,z} from './mechanism-shapes.js';
import {coupeShape,porscheDeckPoint} from './porsche-coachwork.js';

const es='Eurospares · Porsche 992.1 catalogue diagram ';
const src=(code,title,url)=>({label:es+code+', '+title,url});
const S={
  frontBumper:src('802-100','Front bumper air guide and grilles','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/802-100/AIR_DUCT'),
  frontFix:src('802-200','Front bumper fasteners','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/802-200/BUMPER'),
  frontCarrier:src('802-400','Front bumper carrier','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/802-400/BUMPER_BRACKET'),
  rearFix:src('802-700','Rear bumper fasteners and air guides','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/802-700/BUMPER'),
  rearCarrier:src('802-800','Rear bumper carrier and heat shields','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/802-800/BUMPER_BRACKET'),
  frontLid:src('803-000','Front lid and hinges','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/803-000/HOOD'),
  frontLock:src('803-050','Front lid lock','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/803-050/LOCK'),
  rearLid:src('803-130','Rear lid, lock and grille trim','https://www.eurospares.co.uk/Porsche/992/2022_(992-1)/PartDiagrams/803-130/tailgate_boot_lid'),
  underbody:src('801-700','Underbody panels','https://www.eurospares.co.uk/Porsche/992/2021_(992-1)/PartDiagrams/801-700/Underbody_trim')
};

const alu='#8a9294',steel='#5f696c',primer='#6c7372',black='#26292a',foam='#3a3e3c',plastic='#3c4245',rubber='#2f3436',body='#7b8577';
const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(id,name,description,source,parts)=>({id,name,description,source,view:'hero',internal:true,category:'service',parts:parts.map(p=>({...p,id:id+'.'+p.id}))});
const sides=[[-1,'left','Left'],[1,'right','Right']];
const pick=(s,l,r)=>s<0?l:r;

// A closed rectangular section swept along a path: width w across the path in
// plan, height h vertically.
function channel(r,pts,w,h,color){
  const ring=(p,i)=>{
    const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];
    const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w/2,ny=dx/l*w/2;
    return [[p[0]+nx,p[1]+ny,p[2]+h/2],[p[0]-nx,p[1]-ny,p[2]+h/2],[p[0]-nx,p[1]-ny,p[2]-h/2],[p[0]+nx,p[1]+ny,p[2]-h/2]];
  };
  const rings=pts.map(ring);
  for(let i=1;i<rings.length;i++)for(let k=0;k<4;k++){
    const a=rings[i-1],b=rings[i];r.polygon([a[k],a[(k+1)%4],b[(k+1)%4],b[k]],color,false);
  }
  for(const end of [rings[0],rings.at(-1)])r.polygon(end,color,false);
}
// A flat panel of thickness t through the corners; n is its unit normal.
function plate(r,corners,n,t,color){
  const off=k=>corners.map(p=>p.map((v,i)=>v+n[i]*t*k/2));
  const a=off(1),b=off(-1),m=corners.length;
  r.polygon(a,color,false);r.polygon([...b].reverse(),color,false);
  for(let i=0;i<m;i++)r.polygon([a[i],a[(i+1)%m],b[(i+1)%m],b[i]],color,false);
}
const span=(a,b,n)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
const strut=(r,a,b,body,rod)=>{const m=a.map((v,i)=>v+(b[i]-v)*.55);barrel(r,a,m,body,steel,10);r.rod(m,b,rod,'#a5acad',8);};

// Front end, 802-100 / 802-200 / 802-400. The carrier lies low behind the
// bumper cover, below the condenser crossover tube, between the two corner air
// inlets; its crash boxes reach back towards the front-end section carriers.
const beamX=yy=>-2.070+.25*yy*yy,beamZ=.360;
// Inside face of the bumper cover across each corner inlet, from the drawn skin.
const bumpY=[.45,.52,.60,.68,.74],bumpX=[-2.11,-2.07,-2.03,-1.99,-1.94];
const bump=yy=>{let i=0;while(i<bumpY.length-2&&yy>bumpY[i+1])i++;const t=(yy-bumpY[i])/(bumpY[i+1]-bumpY[i]);return bumpX[i]+(bumpX[i+1]-bumpX[i])*t;};
const inlet=[.480,.670],inletZ=[.322,.438],grilleX=yy=>bump(yy)+.045;
const front=group('p992-fit-body-front','Front bumper carrier and air inlets',
 'An aluminium carrier with a foam energy absorber spans the nose behind the bumper cover. A lower cross member supports the cover for pedestrian protection, and the corner air inlets carry grilles and controllable cooling-air flaps ahead of the radiators.',S.frontCarrier,[
 part('carrier','Front bumper carrier, complete · 992807108H',
  'The extruded aluminium beam takes frontal impacts. Its two crash boxes bolt to the front-end section carriers behind it.',[-.35,0,0],S.frontCarrier,r=>{
  channel(r,span(-.45,.45,8).map(yy=>[beamX(yy),yy,beamZ]),.050,.070,alu);
  for(const s of [-1,1]){box(r,[-1.976,s*.415,beamZ],[.048,.060,.064],alu);box(r,[-1.949,s*.415,beamZ],[.006,.090,.090],alu);}
 }),
 part('foam','Front bumper carrier foam part · 992807665D',
  'A moulded foam block on the face of the carrier absorbs low-speed knocks before the beam is loaded.',[-.45,0,.05],S.frontCarrier,r=>{
  channel(r,span(-.40,.40,8).map(yy=>[beamX(yy)-.043,yy,beamZ]),.034,.060,foam);
 }),
 part('pedestrian-member','Pedestrian protection cross member · 992807113D',
  'The lower stiffener spans the bottom of the bumper cover, so a pedestrian\'s legs are struck low as well as at the carrier.',[-.40,0,-.10],S.frontCarrier,r=>{
  channel(r,span(-.42,.42,8).map(yy=>[-2.090+.30*yy*yy,yy,.255]),.060,.012,'#4a5052');
 }),
 part('centre-bracket','Front bumper centre bracket · 992807139A',
  'This bracket holds the top centre of the bumper cover below the luggage-compartment lid and stands on the carrier.',[-.30,0,.15],S.frontFix,r=>{
  box(r,[-2.095,0,.470],[.040,.160,.014],plastic);box(r,[-2.088,0,.430],[.012,.050,.066],plastic);
 }),
 ...sides.map(([s,hand,Hand])=>part('side-plate-'+hand,Hand+' front bumper side plate · '+pick(s,'992807805','992807806'),
  'The side plate supports the bumper cover where it wraps round ahead of the front wheel.',[-.10,s*.30,0],S.frontFix,r=>{
  plate(r,[[-1.86,s*.815,.300],[-1.74,s*.815,.300],[-1.74,s*.815,.470],[-1.86,s*.815,.470]],[0,s,0],.004,plastic);
 })),
 ...sides.map(([s,hand,Hand])=>part('cover-holder-'+hand,Hand+' front bumper cover holder · '+pick(s,'992807595C','992807596C'),
  'A plastic guide rail along the top of the wheel arch holds the rear edge of the bumper cover to the wing.',[0,s*.30,.10],S.frontFix,r=>{
  channel(r,[[-1.665,s*.808,.566],[-1.600,s*.812,.568],[-1.540,s*.814,.570]],.022,.018,plastic);
 })),
 ...sides.map(([s,hand,Hand])=>part('grille-'+hand,Hand+' air inlet grille · '+pick(s,'992807683DOK1','992807684DOK1'),
  'The black mesh grille fills the corner air inlet in the bumper cover, ahead of the condenser and radiator.',[-.30,s*.15,0],S.frontBumper,r=>{
  const [y0,y1]=inlet,[z0,z1]=inletZ,path=zz=>span(y0,y1,5).map(yy=>[grilleX(yy),s*yy,zz]);
  for(const zz of [z0,z1])channel(r,path(zz),.010,.010,black);
  for(const zz of span(z0,z1,4).slice(1,-1))channel(r,path(zz),.006,.004,black);
  for(const yy of span(y0,y1,6))box(r,[grilleX(yy),s*yy,(z0+z1)/2],[.008,.006,z1-z0],black);
 })),
 ...sides.map(([s,hand,Hand])=>part('air-flap-'+hand,Hand+' cooling air control flap · '+pick(s,'992807229OK1','992807230OK1'),
  'A row of motor-driven louvres behind the inlet grille closes when the engine needs little cooling, to cut drag.',[-.20,s*.20,-.05],S.frontBumper,r=>{
  const fx=yy=>grilleX(yy)+.016;
  for(const zz of [.342,.370,.398])channel(r,span(.490,.660,4).map(yy=>[fx(yy),s*yy,zz]),.012,.006,plastic);
  for(const yy of [.488,.662])box(r,[fx(yy),s*yy,.370],[.012,.006,.070],plastic);
 }))
]);

// Front and rear lids, 803-000 / 803-050 / 803-130. The front lid hinges at its
// rear corners ahead of the windscreen; the rear lid at its front corners
// behind the top compartment. Lid undersides are taken from the drawn skin.
const deck=(xx,yy)=>porscheDeckPoint(coupeShape[1],xx,yy);
const lids=group('p992-fit-body-lids','Front and rear lids: hinges, struts and locks',
 'The aluminium front lid swings up on two hinges at the windscreen and is held by a gas strut; its latch sits at the nose. The rear lid hinges at its front edge, rises on a gas strut and locks at the tail.',S.frontLid,[
 ...sides.map(([s,hand,Hand])=>part('front-hinge-'+hand,Hand+' front lid hinge · '+pick(s,'992823295 Y','992823296 Y'),
  'The gooseneck hinge lets the lid rise clear of the windscreen cowl.',[.10,s*.20,.20],S.frontLid,r=>{
  pipe(r,[[-.800,s*.600,.800],[-.790,s*.600,.845],[-.830,s*.600,.868],[-.895,s*.600,.874]],.007,primer,6);
  box(r,[-.890,s*.600,.874],[.050,.024,.005],primer);cyl(r,[-.800,s*.600,.800],y,-.012,.012,.010,steel,8);
 })),
 ...sides.map(([s,hand,Hand])=>part('front-hinge-bracket-'+hand,Hand+' front lid hinge bracket · '+pick(s,'992823611','992823612'),
  'The bracket bolts to the body ahead of the windscreen and carries the hinge pivot.',[.10,s*.25,0],S.frontLid,r=>{
  box(r,[-.795,s*.600,.775],[.050,.034,.030],steel);
 })),
 part('front-damper','Front lid damper · 992823359',
  'The gas strut holds the front lid open. It runs from the inner wing behind the strut tower to the underside of the lid.',[0,-.30,.15],S.frontLid,r=>{
  strut(r,[-.900,-.665,.745],[-1.080,-.615,.842],.011,.005);
 }),
 part('front-lock-upper','Front lid lock upper part · 9P1823085',
  'The striker loop under the nose of the lid drops into the latch when the lid is shut.',[-.20,0,.20],S.frontLid,r=>{
  box(r,[-2.020,0,.548],[.034,.044,.008],steel);cyl(r,[-2.020,0,.536],y,-.012,.012,.004,steel,6);
  for(const yy of [-.012,.012])cyl(r,[-2.020,yy,.536],z,0,.010,.004,steel,6);
 }),
 part('front-latch','Front lid latch · 992823509G',
  'The electrically released latch is screwed to the lock carrier at the nose, below the striker on the lid.',[-.25,0,.05],S.frontLock,r=>{
  box(r,[-2.020,0,.508],[.050,.070,.036],black);box(r,[-2.020,.040,.500],[.030,.012,.022],plastic);
 }),
 ...sides.map(([s,hand,Hand])=>part('rear-hinge-'+hand,Hand+' rear lid hinge · '+pick(s,'992827151DYGRV','992827152EYGRV'),
  'The hinge sits at the front corner of the rear lid, behind the top compartment, so the lid opens from the tail.',[-.10,s*.20,.20],S.rearLid,r=>{
  const q=deck(1.545,s*.460);
  pipe(r,[[1.455,s*.460,.900],[1.440,s*.460,.950],[1.480,s*.460,q[2]-.022],[1.545,s*.460,q[2]-.026]],.007,primer,6);
  box(r,[1.540,s*.460,q[2]-.026],[.050,.024,.005],primer);box(r,[1.455,s*.460,.888],[.040,.030,.020],steel);
  cyl(r,[1.455,s*.460,.900],y,-.012,.012,.010,steel,8);
 })),
 part('rear-damper','Rear lid damper · 992827401B',
  'The gas strut lifts the rear lid and holds it open, from the body beside the engine to the underside of the lid.',[.10,-.30,.15],S.rearLid,r=>{
  const top=deck(1.760,-.440);strut(r,[1.560,-.525,.860],[1.760,-.440,top[2]-.024],.011,.005);
 }),
 part('rear-striker','Rear lid striker · 9P1872151',
  'The steel loop under the tail of the rear lid engages the lock below it.',[.20,0,.15],S.rearLid,r=>{
  box(r,[2.080,0,.790],[.036,.046,.008],steel);cyl(r,[2.080,0,.758],y,-.012,.012,.004,steel,6);
  for(const yy of [-.012,.012])cyl(r,[2.080,yy,.758],z,0,.028,.004,steel,6);
 }),
 part('rear-lock','Rear lid lock · 992827501B',
  'The electrically released lock sits at the tail on the centre line, below the striker on the lid.',[.25,0,.05],S.rearLid,r=>{
  box(r,[2.080,0,.722],[.050,.070,.036],black);box(r,[2.080,-.040,.714],[.030,.012,.022],plastic);
 }),
 part('rear-buffer','Adjustable rear lid stop buffer · 9P2827589',
  'A screw-in rubber buffer sets the height at which the closed rear lid rests.',[.20,-.15,.10],S.rearLid,r=>{
  const c=[2.040,-.400,.716];cyl(r,c,z,-.020,.008,.006,alu,8);cyl(r,c,z,.008,.024,.012,rubber,10);
 }),
 part('fan','Rear lid fan · 992959133A',
  'A small electric fan under the engine-lid grating draws hot air out of the engine bay.',[0,0,.15],S.rearLid,r=>{
  const c=[1.790,0,.925];sleeve(r,c,z,-.022,.022,.080,.074,plastic,16);cyl(r,c,z,-.012,.012,.030,black,12);
  for(let i=0;i<5;i++){const a=i*2*Math.PI/5;box(r,[c[0]+.050*Math.cos(a),.050*Math.sin(a),c[2]],[.040,.010,.004],plastic);}
 })
]);

// Rear end, 802-700 / 802-800. The carrier spans the tail above the silencer,
// behind the rear bumper cover.
const rearX=yy=>2.190-.25*yy*yy,rearZ=.540;
const rear=group('p992-fit-body-rear','Rear bumper carrier and fixings',
 'A steel carrier with a foam absorber spans the tail above the silencer. Supports tie it to the body below, and side holders and retainers locate the rear bumper cover; air guides lead engine-bay air to the outlets in the cover.',S.rearCarrier,[
 part('carrier','Rear bumper carrier · 992807235C',
  'The cross beam behind the rear bumper cover takes rear impacts and passes them into the body.',[.35,0,0],S.rearCarrier,r=>{
  channel(r,span(-.56,.56,8).map(yy=>[rearX(yy),yy,rearZ]),.045,.070,steel);
 }),
 part('foam','Rear cross member foam part · 992807603E',
  'Foam on the back of the carrier absorbs low-speed knocks before the beam is loaded.',[.45,0,.05],S.rearCarrier,r=>{
  channel(r,span(-.48,.48,8).map(yy=>[rearX(yy)+.039,yy,rearZ]),.030,.060,foam);
 }),
 ...sides.map(([s,hand,Hand])=>part('lower-support-'+hand,Hand+' lower rear support part · '+pick(s,'992807723','992807724'),
  'A pressed bracket ties the end of the carrier down to the body beside the tailpipe.',[.10,s*.25,-.15],S.rearCarrier,r=>{
  box(r,[2.070,s*.550,.445],[.040,.024,.160],steel);
 })),
 part('bow-support','Rear bumper bow support · 992807526',
  'The centre support stands on the carrier and holds the upper edge of the bumper cover below the tail light strip.',[.25,0,.15],S.rearCarrier,r=>{
  box(r,[2.180,0,.618],[.020,.100,.086],plastic);
 }),
 ...sides.map(([s,hand,Hand])=>part('retainer-'+hand,Hand+' rear bumper retainer · '+pick(s,'992807885M','992807886E'),
  'The retainer holds the top corner of the rear bumper cover to the rear wing, below the end of the tail light.',[.05,s*.25,.10],S.rearFix,r=>{
  channel(r,[[1.880,s*.745,.660],[1.930,s*.715,.662],[1.980,s*.675,.664]],.020,.020,plastic);
 })),
 ...sides.map(([s,hand,Hand])=>part('side-holder-'+hand,Hand+' rear bumper side cover holder · '+pick(s,'992807147','992807148D'),
  'The holder supports the side of the rear bumper cover behind the rear wheel.',[0,s*.30,0],S.rearFix,r=>{
  plate(r,[[1.680,s*.820,.300],[1.780,s*.820,.300],[1.780,s*.820,.470],[1.680,s*.820,.470]],[0,s,0],.004,plastic);
 })),
 ...sides.map(([s,hand,Hand])=>part('air-guide-'+hand,Hand+' rear air guide · '+pick(s,'992807009 OK1','992807010 OK1'),
  'The open duct leads hot engine-bay air out through the outlet in the corner of the rear bumper cover.',[.20,s*.20,0],S.rearFix,r=>{
  const [y0,y1]=[.615,.700];
  box(r,[1.955,s*(y0+y1)/2,.380],[.055,y1-y0,.004],plastic);
  for(const yy of [y0,y1])box(r,[1.955,s*yy,.440],[.055,.004,.120],plastic);
 }))
]);

// Underbody panels, 801-700. Clipped to the body below the coolant and brake
// pipes: the front panel under the front axle, the centre panel under the
// floor and the rear panel ahead of the rear axle.
const flat=(r,x0,x1,w0,w1,zz,color)=>plate(r,[[x0,-w0,zz],[x1,-w1,zz],[x1,w1,zz],[x0,w0,zz]],[0,0,1],.004,color);
const ribs=(r,x0,x1,zz,color)=>{for(const yy of [-.20,0,.20])box(r,[(x0+x1)/2,yy,zz+.005],[x1-x0-.06,.012,.006],color);};
const underbody=group('p992-fit-body-underbody','Underbody panels',
 'Three plastic panels close the underside of the Cabriolet from the nose to the rear axle. They smooth the airflow and cover the coolant, brake and fuel lines.',S.underbody,[
 part('front','Front underbody panel, Cabriolet · 992825523H',
  'The front panel is screwed beneath the front axle cross member and covers it and the coolant pipes to the front radiators.',[0,0,-.25],S.underbody,r=>{flat(r,-1.65,-.86,.30,.40,.158,'#2c3134');ribs(r,-1.65,-.86,.158,'#2c3134');}),
 part('centre','Centre underbody panel · 992825505',
  'The centre panel runs under the floor and the tunnel, beneath the long coolant pipes and the brake and fuel lines.',[0,0,-.25],S.underbody,r=>{flat(r,-.80,.84,.40,.40,.220,'#303538');ribs(r,-.80,.84,.220,'#303538');}),
 part('rear','Rear underbody panel, Cabriolet · 992825521A',
  'The rear panel closes the gap between the centre panel and the rear axle, ahead of the gearbox.',[0,0,-.25],S.underbody,r=>{flat(r,.86,1.02,.40,.40,.222,'#2c3134');})
]);

export const groups=[front,lids,rear,underbody];
export const lines=[];
export const mounts=[
  ...['left','right'].map(hand=>['p992-fit-body-rear.air-guide-'+hand,'shell.bumpers','the air guide is clipped to the frame of the air outlet in the corner of the rear bumper cover']),
  ['p992-fit-body-underbody.front','shell.fenders','the panel\'s front edge is screwed to the lower edge of the front apron; the body shell draws the underside of the nose closed where the panel lies'],
];
