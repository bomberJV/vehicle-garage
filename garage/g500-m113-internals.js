// M113 engine internals for the G500, drawn only when the matching installed
// part is opened. Each part carries its Mercedes number and the catalog page
// that lists it. The E500 page is the closest complete M113 5.0 diagram the
// catalog exposes; G500-specific pages are used where they exist.
import {TAU,metal,steel,dark,gold,copper,turn,cyl,sleeve,gear,part,study,x,y,z} from './mechanism-shapes.js';

const m113Plate={label:'MB Parts Giant · M113 5.0 engine parts, timing and lubrication diagram (2004 E500)',url:'https://mbpartsgiant.com/parts-list/2004-mercedes_benz-e500/engine/engine-parts-mounts-timing-lubrication-system'};
const camGears={label:'MB Parts Giant · G500 camshaft and intermediate sprockets, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-cam_gear'};
const g500Timing={label:'Mercedes-Benz Classic USA · G500 engine timing parts',url:'https://classicparts.mbusa.com/v-2007-mercedes-benz-g500--base--5-0l-v8-gas/engine--engine'};
const timingCover={label:'MB Parts Giant · 112-010-06-33 timing cover, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~timing-cover~1120100633'};
const rockerArm={label:'MB Parts Giant · 113-050-01-33 rocker arm',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~rocker-arms~1130500133'};
const rockerShaft={label:'MB Parts Giant · 113-050-07-31 rocker shaft',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~rocker-shaft~1130500731'};
export const m113InternalSources={m113Plate,camGears,g500Timing,timingCover,rockerArm,rockerShaft};

const src=(p,source)=>({...p,source});
const cylinders=[-.48,-.16,.16,.48];

// Valve stack along +z with its head at z0.
function valveStack(r,c,head,key){
  const at=(dz)=>[c[0],c[1],c[2]+dz];
  if(key==='valve')turn(r,at(0),z,[[0,0],[0,head],[.03,head],[.09,.03],[.92,.024],[.94,0]],steel,{n:18});
  if(key==='seat')sleeve(r,at(-.03),z,0,.05,head+.03,head-.02,copper,20);
  if(key==='guide')sleeve(r,at(.28),z,0,.30,.046,.026,gold,14);
  if(key==='seal')turn(r,at(.58),z,[[0,.026],[0,.058],[.06,.05],[.08,.032],[.08,.026],[0,.026]],dark,{n:14});
  if(key==='spring-seat')sleeve(r,at(.53),z,0,.02,.12,.06,metal,18);
  if(key==='spring')for(let i=0;i<7;i++)sleeve(r,at(.56+i*.04),z,0,.018,.105,.085,'#5e7f8a',16);
  if(key==='retainer')turn(r,at(.84),z,[[0,.03],[0,.07],[.02,.115],[.045,.115],[.045,.03],[0,.03]],metal,{n:16});
  if(key==='keeper')for(const s of [0,Math.PI])turn(r,at(.835),z,[[0,.025],[0,.04],[.055,.035],[.055,.025],[0,.025]],gold,{n:6,start:s+.15,sweep:Math.PI-.3});
}
const valveRows=[
  ['intake-valve','Intake valves · 113-053-06-01','Two intake valves per cylinder. The larger head sits on the intake side of the combustion chamber.','valve',[-.55,0,.25]],
  ['exhaust-valve','Exhaust valve · 113-050-03-27-80','One exhaust valve per cylinder, with a smaller head than the intake valves.','valve',[.55,0,.25]],
  ['seats','Valve seat rings · 113-053-04-31 intake, 113-053-04-32 exhaust','Pressed-in rings that the valve faces seal against.','seat',[0,-.45,-.35]],
  ['guides','Valve guides · 113-053-03-29','Bronze guides keep each valve stem centered in the head.','guide',[0,.45,-.05]],
  ['stem-seals','Valve stem seals · 612-050-00-58','Each seal sits on top of its guide and meters oil to the stem.','seal',[0,.45,.2]],
  ['spring-seats','Valve spring seats · 113-053-00-25','Hardened washers that spread the spring load into the head.','spring-seat',[0,-.45,.08]],
  ['springs','Valve springs · 113-053-00-20','The springs close each valve after the rocker releases it.','spring',[0,-.5,.35]],
  ['retainers','Valve spring retainers · 603-053-03-25','The retainer caps the spring and locks to the stem through the keepers.','retainer',[0,.45,.55]],
  ['keepers','Valve keepers · 102-053-02-26','Split collets that clamp the retainer to the groove at the top of the stem.','keeper',[0,.5,.8]]
];
const valves=study('g500-m113-valves','M113 valve assemblies','The M113 uses three valves per cylinder: two intake and one exhaust. Each valve closes on a pressed-in seat and is held shut by a single spring.',m113Plate,
  valveRows.map(([id,name,desc,key,offset])=>part(id,name,desc,offset,r=>{
    const sets=key==='valve'?(id==='intake-valve'?[[-.22,.135],[0,.135]]:[[.26,.115]]):[[-.22,.135],[0,.135],[.26,.115]];
    for(const [py,head] of sets)valveStack(r,[0,py,-.45],head,key);
  })));
valves.viewAngle=[-.55,.3];

// Two rocker shafts over one bank, with three rockers per cylinder.
function rocker(r,cx,cy,dir,color){
  r.box(cx-.035,Math.min(cy,cy+dir*.3),.08,cx+.035,Math.max(cy,cy+dir*.3),.15,color);
  cyl(r,[cx-.03,cy+dir*.14,.02],x,0,.06,.035,dark,10);
}
const rockerRows=[
  src(part('intake-rocker-1','Intake rocker arms No. 1 · 113-050-00-33','The first intake rocker of each cylinder, with its cam roller.',[-.1,-.55,.25],r=>{for(const c of cylinders)rocker(r,c-.06,-.18,1,metal);}),m113Plate),
  src(part('intake-rocker-2','Intake rocker arms No. 2 · 113-050-01-33','The second intake rocker of each cylinder.',[.1,-.6,.45],r=>{for(const c of cylinders)rocker(r,c+.06,-.18,1,'#a9b7ba');}),rockerArm),
  src(part('exhaust-rocker','Exhaust rocker arms · 113-050-05-34','One exhaust rocker per cylinder on the opposite shaft.',[0,.6,.4],r=>{for(const c of cylinders)rocker(r,c,.18,-1,steel);}),m113Plate),
  src(part('intake-shaft','Intake rocker shaft · 113-050-07-31','The hollow intake shaft carries the eight intake rockers of one bank and feeds them oil.',[0,-.35,-.25],r=>cyl(r,[-.72,-.18,.115],x,0,1.44,.03,gold,14)),rockerShaft),
  src(part('exhaust-shaft','Exhaust rocker shaft · 113-050-06-31','The exhaust shaft carries the four exhaust rockers of the bank.',[0,.35,-.25],r=>cyl(r,[-.72,.18,.115],x,0,1.44,.03,gold,14)),m113Plate),
  src(part('lash-adjusters','Hydraulic lash adjusters · 113-050-03-80','Oil-filled adjusters in the rocker tips take up valve clearance automatically.',[0,0,-.5],r=>{
    for(const c of cylinders){for(const dx of [-.06,.06])cyl(r,[c+dx,.12,.02],z,0,.08,.022,copper,10);cyl(r,[c,-.12,.02],z,0,.08,.022,copper,10);}
  }),m113Plate)
];
const rockers=study('g500-m113-rockers','M113 rocker gear, one bank','A single camshaft per bank drives roller rockers on two hollow shafts. The intake side has two rockers per cylinder and the exhaust side one.',m113Plate,rockerRows);
rockers.viewAngle=[-.6,.45];

// Camshafts with twelve lobes per bank and their sprockets.
function camshaft(r,cy,color){
  cyl(r,[-.8,cy,0],x,0,1.6,.04,color,14);
  for(const c of cylinders)for(const [dx,phase] of [[-.08,0],[0,.6],[.08,2.4]])
    turn(r,[c+dx-.02,cy,0],x,[[0,0],[0,.075],[.04,.075],[.04,0]],color,{n:10,start:phase,sweep:TAU*.55});
}
const camRows=[
  src(part('left','Left camshaft · 113-050-36-01','Twelve lobes drive the left bank’s two intake rockers and one exhaust rocker per cylinder.',[0,-.5,.3],r=>camshaft(r,-.3,steel)),m113Plate),
  src(part('right','Right camshaft · 113-050-37-01','The right bank camshaft, a mirror of the left.',[0,.5,.3],r=>camshaft(r,.3,'#6c8189')),m113Plate),
  src(part('sprockets','Camshaft sprockets · 112-050-02-04','One chain sprocket bolts to the nose of each camshaft.',[-.45,0,.35],r=>{for(const cy of [-.3,.3])gear(r,[-.9,cy,0],x,0,.03,.16,.16,30,dark,0,.3);}),camGears)
];
const camshafts=study('g500-m113-camshafts','M113 camshafts','The M113 has one chain-driven camshaft per bank. The sprockets share the main timing chain.',m113Plate,camRows);
camshafts.viewAngle=[-.7,.35];

// Front view of the timing drive, drawn in the x–z plane facing the camera.
const crankC=[0,0,-.6],idlerC=[0,0,.05],camL=[-.5,0,.5],camR=[.5,0,.5];
function chainRun(r,a,b,n,color){
  for(let i=0;i<n;i++){
    const t=(i+.25)/n,u=(i+.75)/n,p=[0,1,2].map(k=>a[k]+(b[k]-a[k])*t),q=[0,1,2].map(k=>a[k]+(b[k]-a[k])*u);
    r.box(Math.min(p[0],q[0])-.012,-.02,Math.min(p[2],q[2])-.012,Math.max(p[0],q[0])+.012,.02,Math.max(p[2],q[2])+.012,color);
  }
}
const coverOutline=[[-.75,.55],[-.75,.8],[.75,.8],[.75,.55],[.3,-.75],[-.3,-.75]];
const rubber='#26292b';
const timingRows=[
  src(part('crank-sprocket','Crankshaft sprocket · 155-050-00-03-64','The double sprocket on the crank nose drives the timing chain.',[0,0,-.4],r=>gear(r,crankC,y,-.03,.03,.1,.1,21,dark,0,.35)),g500Timing),
  src(part('intermediate','Intermediate sprocket · 275-050-00-05','An idler between the banks carries the chain around the crankcase.',[0,-.25,.05],r=>gear(r,idlerC,y,-.03,.03,.13,.13,26,steel,0,.35)),camGears),
  src(part('chain','Timing chain · 003-997-68-94','The double-row chain links the crank, intermediate and both camshaft sprockets.',[0,.2,0],r=>{
    chainRun(r,[-.1,0,-.6],[-.62,0,.5],12,metal);chainRun(r,[-.4,0,.62],[.4,0,.62],10,metal);
    chainRun(r,[.62,0,.5],[.1,0,-.6],12,metal);
  }),g500Timing),
  src(part('tensioner','Chain tensioner · 112-050-08-11','An oil-fed plunger presses the tensioner rail against the chain.',[.45,0,-.35],r=>cyl(r,[.72,0,-.05],[-1,-.3,.2],0,.16,.035,gold,12)),m113Plate),
  src(part('tensioner-rail','Tensioner rail · 112-052-02-16','A pivoting rail on the slack side transfers the tensioner load to the chain.',[.35,0,0],r=>chainRun(r,[.7,.04,.35],[.22,.04,-.45],6,'#4a4f52')),m113Plate),
  src(part('upper-guide','Upper chain guide · 112-052-01-16','A plastic guide between the camshaft sprockets keeps the top run from whipping.',[0,0,.35],r=>r.box(-.3,.02,.66,.3,.06,.7,'#3d4246')),m113Plate),
  src(part('lower-guide','Lower chain guide · 112-052-00-16','A fixed guide on the tight side of the chain.',[-.35,0,0],r=>chainRun(r,[-.24,.04,-.45],[-.68,.04,.35],6,'#3d4246')),m113Plate),
  src(part('cover','Timing cover · 112-010-06-33','The cast cover closes the front of the engine over the chain drive. It is drawn as its sealing flange so the drive stays visible.',[0,-.75,0],r=>{
    for(let i=0;i<coverOutline.length;i++){
      const [ax,az]=coverOutline[i],[bx,bz]=coverOutline[(i+1)%coverOutline.length],n=Math.max(2,Math.round(Math.hypot(bx-ax,bz-az)/.08));
      for(let j=0;j<n;j++){const t=j/n,u=(j+1)/n,px=ax+(bx-ax)*t,pz=az+(bz-az)*t,qx=ax+(bx-ax)*u,qz=az+(bz-az)*u;
        r.box(Math.min(px,qx)-.025,-.16,Math.min(pz,qz)-.025,Math.max(px,qx)+.025,-.12,Math.max(pz,qz)+.025,'#8f9a9c');}
    }
    sleeve(r,[0,-.16,-.6],y,0,.04,.13,.08,'#8f9a9c',18);
  }),timingCover),
  src(part('rear-seal','Timing cover rear seal · 112-997-08-45','The seal between the back of the timing cover and the cylinder heads.',[0,.5,.35],r=>{for(const s of [-1,1])r.box(s*.4-.15,.1,.74,s*.4+.15,.13,.77,rubber);}),m113Plate),
  src(part('front-seal','Front crankshaft seal · 023-997-84-47-64','The radial seal in the cover seals the crank nose.',[0,-.5,-.35],r=>sleeve(r,[0,-.2,-.6],y,0,.03,.075,.045,dark,18)),m113Plate)
];
const timing=study('g500-m113-timing','M113 timing drive','One double-row chain runs from the crankshaft over an intermediate sprocket to both camshaft sprockets. A hydraulic tensioner and three guides control it.',m113Plate,timingRows);
timing.viewAngle=[-.25,.15];

// Crankshaft bearings, seals and pulley along the crank axis.
const mains=[-.64,-.32,0,.32,.64];
const bearingRows=[
  src(part('main-shells','Main bearing shells · 112-030-00-40','Five pairs of shells carry the crankshaft in the block and main caps.',[0,0,-.45],r=>{for(const mx of mains)for(const s of [0,Math.PI])turn(r,[mx-.04,0,0],x,[[0,.085],[0,.1],[.08,.1],[.08,.085],[0,.085]],gold,{n:10,start:s+.05,sweep:Math.PI-.1});}),m113Plate),
  src(part('rod-shells','Connecting-rod bearing shells · 112-030-00-60','Eight pairs of shells, two rods side by side on each crankpin.',[0,.45,.25],r=>{for(const c of [-.48,-.16,.16,.48])for(const dx of [-.04,.04])sleeve(r,[c+dx-.035,0,.24],x,0,.07,.075,.065,copper,14);}),m113Plate),
  src(part('thrust-washers','Crankshaft thrust washers · 112-030-00-62','Half washers at the center main locate the crankshaft endwise.',[0,-.45,.2],r=>{for(const s of [-1,1])turn(r,[s*.05,0,0],x,[[0,.1],[0,.15],[.012,.15],[.012,.1],[0,.1]],gold,{n:10,start:Math.PI,sweep:Math.PI});}),m113Plate),
  src(part('pin-bushings','Wrist-pin bushings · 112-038-01-50','Bronze bushings pressed into the small end of each connecting rod.',[0,.5,.55],r=>{for(const c of [-.48,-.16,.16,.48])for(const dx of [-.04,.04])sleeve(r,[c+dx-.03,0,.6],x,0,.06,.04,.03,gold,12);}),m113Plate),
  src(part('rear-seal','Rear main seal · 112-997-02-46-65','The radial seal at the flywheel end of the crankshaft.',[.45,0,0],r=>sleeve(r,[.86,0,0],x,0,.03,.15,.09,dark,20)),m113Plate),
  src(part('seal-retainer','Rear main seal retainer · 112-011-02-08','The cover that holds the rear seal against the block.',[.65,0,.2],r=>sleeve(r,[.9,0,0],x,0,.03,.24,.15,'#8f9a9c',22)),m113Plate),
  src(part('pulley','Vibration damper · 112-030-00-00','The damper and belt pulley on the crank nose drives the poly-V belt and calms crankshaft torsional vibration.',[-.5,0,0],r=>turn(r,[-1.02,0,0],x,[[0,.06],[0,.2],[.1,.2],[.1,.16],[.12,.16],[.12,.06],[0,.06]],steel,{n:24})),m113Plate)
];
const bearings=study('g500-m113-bearings','M113 crankshaft bearings and seals','Plain bearing shells support the crankshaft and the connecting rods. Seals at each end keep the oil in.',m113Plate,bearingRows);
bearings.viewAngle=[-.55,.3];

// Oil-pump drive: a short chain from the crankshaft to the pump.
const pumpRows=[
  src(part('chain','Oil-pump drive chain · 003-997-74-94','A single-row chain drives the pump from a second sprocket on the crankshaft.',[0,.25,0],r=>{chainRun(r,[-.1,0,.3],[-.12,0,-.45],8,metal);chainRun(r,[.12,0,-.45],[.1,0,.3],8,metal);}),m113Plate),
  src(part('tensioner-arm','Oil-pump chain tensioner arm · 112-181-00-59','A pivoting arm presses on the slack side of the pump chain.',[.4,0,0],r=>chainRun(r,[.2,.04,.15],[.18,.04,-.35],5,'#4a4f52')),m113Plate),
  src(part('tensioner-spring','Tensioner spring · 112-993-02-20','The spring loads the tensioner arm against the chain.',[.55,0,-.25],r=>{for(let i=0;i<6;i++)sleeve(r,[.3+i*.025,0,-.1],x,0,.012,.03,.02,'#5e7f8a',10);}),m113Plate)
];
const oilDrive=study('g500-m113-oil-drive','M113 oil-pump drive','The oil pump at the bottom of the block is chain-driven from the crankshaft.',m113Plate,pumpRows);
oilDrive.viewAngle=[-.25,.15];

const views=new Map([
  ['powertrain.valves',valves],['powertrain.rocker-arms',rockers],['powertrain.camshafts',camshafts],
  ['powertrain.timing-drive',timing],['powertrain.main-bearings',bearings],['powertrain.oil-pump',oilDrive]
]);
export const m113InternalStudies=[...views.values()];
export function getG500M113Internals(vehicle,id){return vehicle==='g500'?views.get(id)||null:null;}
