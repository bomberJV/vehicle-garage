// G500 study pack: engine.
// Engine accessories and sensors: ignition, fuel injection, throttle, air intake, secondary air, breathers, belt drive, engine sensors.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
import {metal,steel,dark,gold,copper,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const mbpg='https://www.mbpartsgiant.com/parts-list/';
const plates={
  ignition:{label:'MB Parts Giant · 2004 G500 ignition system diagram',url:mbpg+'2004-mercedes_benz-g500/electrical/ignition-system'},
  injection:{label:'MB Parts Giant · 2004 G500 fuel injection diagram',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/fuel-injection'},
  throttle:{label:'MB Parts Giant · 2004 G500 throttle body diagram',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/throttle-body'},
  manifold:{label:'MB Parts Giant · 2004 G500 intake manifold diagram',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/intake-manifold'},
  intake:{label:'MB Parts Giant · 2004 G500 air intake diagram',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/air-intake'},
  intake06:{label:'MB Parts Giant · 2006 G500 air intake diagram',url:'https://mbpartsgiant.com/parts-list/2006-mercedes_benz-g500/air-fuel-delivery/air-intake'},
  air:{label:'MB Parts Giant · 2004 G500 A.I.R. system diagram',url:mbpg+'2004-mercedes_benz-g500/emission-control-exhaust/a-i-r-system'},
  e500Air:{label:'MB Parts Giant · 2004 E500 A.I.R. system diagram (M113 5.0)',url:mbpg+'2004-mercedes_benz-e500/emission-control-exhaust/a-i-r-system'},
  sensors:{label:'MB Parts Giant · 2004 G500 powertrain control diagram',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/powertrain-control-air'},
  senders:{label:'MB Parts Giant · 2004 G500 senders diagram',url:mbpg+'2004-mercedes_benz-g500/electrical/senders'},
  belts:{label:'MB Parts Giant · 2007 G500 belts and pulleys diagram',url:'https://mbpartsgiant.com/parts-list/2007-mercedes_benz-g500/belts-cooling/belts-pulleys-cooling'},
  belts04:{label:'MB Parts Giant · 2004 G500 belts and pulleys diagram',url:'https://mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/belts-cooling/belts-pulleys-cooling'},
  ecsEmissions04:{label:'ECS Tuning · 2004 G500 5.0 emissions parts, page 2',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Engine/Emissions/2'},
  ecsEmissions06:{label:'ECS Tuning · 2006 G500 5.0 (113.962) emissions parts, page 2',url:'https://www.ecstuning.com/Mercedes_Benz-2006-G500-463.249-Base-Sport_Utility-V8_5.0L_113.962/Engine/Emissions/2'},
  ecsPopular04:{label:'ECS Tuning · 2004 G500 5.0 popular engine parts, page 4',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Engine/4'},
  ecsMechanical03:{label:'ECS Tuning · 2003 G500 5.0 engine mechanical parts, page 6',url:'https://www.ecstuning.com/Mercedes_Benz-2003-G500-463.249-Base-Sport_Utility-V8_5.0L/Engine/Mechanical/6'},
  e500Intake:{label:'MB Parts Giant · 2004 E500 air intake diagram (M113 5.0)',url:mbpg+'2004-mercedes_benz-e500/air-fuel-delivery/air-intake'}
};
export const enginePackSources=plates;

const plastic='#3a3f42',rubber='#26292b',grey='#8f9a9c',coilGreen='#3f5a4c',hoseBlack='#2f3335';
const src=(p,source)=>({...p,source});
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);if(l>0)cyl(r,a,d,0,l,rad,color,n);};
const hose=(r,pts,rad,color,n=10)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,n);};
const ring=(r,c,a,outer,inner,width,color,n=18)=>sleeve(r,c,a,0,width,outer,inner,color,n);

// ---------------------------------------------------------------------------
// Ignition: eight dual-output coils on the valve covers and four lead sets.
// Cylinders 1–4 sit in the right bank (+y) and 5–8 in the left bank (−y), front at −x.
const cylX=i=>-.54+(i%4)*.36,cylY=i=>i<4?.42:-.42;
const plug=(c,k)=>[cylX(c)+(k?.07:-.07),cylY(c)*1.15,-.05];
const coilTop=c=>[cylX(c),cylY(c)*.62,.42];
const leadSets=[
  ['lead-set-1','Ignition lead set · 112-150-01-18-64','The lead set the G500 catalog lists for coil A on cylinders 7 and 8 and coil B on cylinders 1 through 7.',[[6,0],[7,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1]],[0,-.2,.55]],
  ['lead-set-2','Ignition lead set · 112-150-02-18-64','The lead set listed for coil A on cylinders 3, 4 and 6 and coil B on cylinder 8.',[[2,0],[3,0],[5,0],[7,1]],[.25,.55,.3]],
  ['lead-set-3','Ignition lead set · 112-150-03-18-64','The lead set listed for coil A on cylinders 2 and 5.',[[1,0],[4,0]],[-.25,-.6,.3]],
  ['lead-set-4','Ignition lead set · 112-150-04-18-64','The single lead listed for coil A on cylinder 1.',[[0,0]],[-.45,.6,.15]]
];
const leadColors=['#5b3b38','#4a4d6a','#6a5a3a','#3d5f63'];
const ignition=study('g500-ignition','M113 ignition coils and leads','The M113 fires two spark plugs per cylinder. Eight dual-output coils sit on the valve covers and short leads carry the spark to the plugs.',plates.ignition,[
  src(part('coils','Ignition coils · 000-158-78-03','Eight dual-output coils, one over each cylinder on the valve covers. The catalog notes the replacement 000-158-78-03-64.',[0,0,.45],r=>{
    for(let c=0;c<8;c++){const t=coilTop(c);block(r,t,[.16,.12,.1],coilGreen);for(const k of [-1,1])cyl(r,[t[0]+k*.05,t[1],t[2]-.05],z,-.1,0,.022,dark,8);}
  }),plates.ignition),
  ...leadSets.map(([id,name,desc,runs,offset],i)=>src(part(id,name,desc,offset,r=>{
    for(const [c,k] of runs){const t=coilTop(c),p=plug(c,k),s=[t[0]+(k?.05:-.05),t[1],t[2]-.15];
      hose(r,[s,[s[0],(s[1]+p[1])/2,.18],[p[0],p[1],.12]],.014,leadColors[i],8);
      cyl(r,[p[0],p[1],.12],z,-.14,0,.03,rubber,10);}
  }),plates.ignition))
]);
ignition.viewAngle=[-.6,.45];

// ---------------------------------------------------------------------------
// Fuel rail, injectors and the manifold fittings around them.
const manifold=study('g500-manifold-fittings','Fuel rail, injectors and manifold fittings','The fuel rail feeds eight port injectors in the intake manifold runners. The G500 catalog also lists the throttle seal, the manifold gaskets and two vacuum switchover valves on the manifold.',plates.injection,[
  src(part('rail','Fuel rail · 113-070-04-95','One rail assembly with a branch over each bank and a crossover at the back. It holds the eight injectors against the manifold.',[0,0,.45],r=>{
    for(const s of [-1,1])cyl(r,[-.7,s*.3,.2],x,0,1.3,.035,metal,12);
    hose(r,[[.6,-.3,.2],[.68,-.15,.26],[.68,.15,.26],[.6,.3,.2]],.025,metal,10);
    cyl(r,[-.7,-.3,.2],x,-.12,0,.02,gold,10);
  }),plates.injection),
  src(part('injectors','Fuel injectors · 113-078-02-49-64','Eight port injectors, one per cylinder, clipped between the rail and the runners.',[0,0,.2],r=>{
    for(let i=0;i<8;i++){const px=-.54+(i%4)*.36,py=i<4?.3:-.3;
      cyl(r,[px,py,.17],z,-.2,0,.022,'#4d6470',10);cyl(r,[px,py,.07],z,-.03,.03,.03,dark,10);cyl(r,[px,py,-.04],z,-.06,0,.012,steel,8);}
  }),plates.injection),
  src(part('manifold-gaskets','Intake manifold gaskets · 113-141-09-80','The gaskets between the manifold runners and the two cylinder heads, one per bank.',[0,0,-.45],r=>{
    for(const s of [-1,1])for(let i=0;i<4;i++)ring(r,[-.54+i*.36,s*.32,-.15],z,.07,.05,.01,dark,14);
  }),plates.manifold),
  src(part('throttle-seal','Throttle body seal · 305-997-03-45','The seal the G500 throttle-body diagram lists where the throttle actuator meets the manifold inlet.',[-.45,0,0],r=>ring(r,[-.95,0,.1],x,.12,.095,.015,rubber,22)),plates.throttle),
  src(part('switchover-valves','Vacuum switchover valves · 002-540-18-97','Two electric vacuum valves mounted on the intake manifold. ECS Tuning lists them for the G500 as EGR changeover valves, two required.',[.2,0,.5],r=>{
    for(const s of [-1,1]){const c=[.2,s*.1,.45];block(r,c,[.1,.08,.08],plastic);for(const d of [-1,1])cyl(r,[c[0]+d*.03,c[1],c[2]+.04],z,0,.06,.01,dark,8);}
  }),plates.ecsEmissions06)
]);
manifold.viewAngle=[-.6,.4];

// ---------------------------------------------------------------------------
// Fresh-air path: wing scoops, intake pipes, the cleaner outlet and the air-mass meter.
// Front at −x, driver side −y.
const scoop=(r,s,color)=>{block(r,[-.8,s*.62,.2],[.18,.22,.34],color);block(r,[-.8,s*.62,.4],[.26,.28,.04],color);};
const intakeRows=[
  ['inlet-duct-right','Air inlet duct, passenger side · 463-520-01-04','The scoop on the passenger side that draws fresh air behind the headlamp.',[-.35,.3,.25],r=>scoop(r,1,plastic),plates.intake],
  ['inlet-duct-left','Air inlet duct, driver side · 463-094-00-11','The matching scoop on the driver side.',[-.35,-.3,.25],r=>scoop(r,-1,plastic),plates.intake],
  ['inlet-seal','Air inlet duct seals · 460-989-50-98','The seal around the top of each scoop, used on both sides.',[-.45,0,.5],r=>{for(const s of [-1,1])sleeve(r,[-.8,s*.62,.43],z,0,.02,.15,.12,rubber,16);}],
  ['pipe-right','Intake pipe, passenger side · 463-500-11-75','The molded hose from the passenger scoop back toward the air cleaner.',[0,.45,.1],r=>hose(r,[[-.75,.62,.05],[-.5,.62,0],[-.2,.5,0]],.07,hoseBlack,12),plates.intake],
  ['pipe-left','Intake pipe, driver side · 463-500-10-75','The molded hose from the driver scoop back toward the air cleaner.',[0,-.45,.1],r=>hose(r,[[-.75,-.62,.05],[-.5,-.62,0],[-.2,-.5,0]],.07,hoseBlack,12),plates.intake],
  ['pipe-connectors','Intake pipe connectors · 463-094-00-10','Couplings at the cleaner end of both intake pipes.',[.1,0,-.25],r=>{for(const s of [-1,1])sleeve(r,[-.2,s*.5,0],x,0,.08,.085,.07,dark,14);}],
  ['center-pipe','Center intake pipe · 463-520-02-04','The pipe the G500 catalog lists between the two side intakes.',[0,0,.4],r=>hose(r,[[-.12,-.35,.05],[-.12,.35,.05]],.06,plastic,12)],
  ['rear-pipe','Rear intake pipe · 463-094-03-09','The pipe from the air cleaner outlet back to the air-mass meter.',[.25,0,.35],r=>hose(r,[[.05,0,.05],[.3,0,.08]],.075,plastic,14)],
  ['pipe-seal','Intake pipe seal · 463-997-02-47','The seal the diagram lists in the intake pipe run.',[.2,0,-.35],r=>sleeve(r,[.03,0,.05],x,0,.02,.09,.075,rubber,16)],
  ['pipe-bracket','Intake pipe bracket · 463-500-21-31','The bracket that holds the intake pipe run to the body.',[.05,-.3,-.4],r=>{block(r,[-.1,-.2,-.12],[.04,.12,.18],steel);block(r,[-.1,-.2,-.03],[.12,.12,.03],steel);}],
  ['cleaner-clip','Air cleaner mounting clip · 112-094-00-41','The clip that locates the air cleaner housing.',[-.1,.3,-.4],r=>{block(r,[-.12,.25,-.12],[.06,.03,.1],steel);block(r,[-.12,.27,-.06],[.06,.06,.02],steel);}],
  ['drain-hose-left','Drain hose, driver side · 463-501-69-82','Drains water that collects in the driver scoop.',[-.35,-.25,-.4],r=>hose(r,[[-.8,-.62,.03],[-.8,-.62,-.3],[-.7,-.66,-.45]],.02,rubber,8),plates.intake],
  ['drain-hose-right','Drain hose, passenger side · 463-501-70-82','Drains water that collects in the passenger scoop.',[-.35,.25,-.4],r=>hose(r,[[-.8,.62,.03],[-.8,.62,-.3],[-.7,.66,-.45]],.02,rubber,8),plates.intake],
  ['drain-connectors','Drain hose connectors · 463-500-69-72','The connector at the top of each drain hose.',[-.55,0,-.2],r=>{for(const s of [-1,1])cyl(r,[-.8,s*.62,.03],z,-.06,0,.03,dark,10);}],
  ['drain-valves','Drain valves · 000-094-04-65','A rubber valve at the bottom of each drain hose lets water out and keeps air from being drawn in.',[-.55,0,-.55],r=>{for(const s of [-1,1])turn(r,[-.7,s*.66,-.45],z,[[0,0],[0,.03],[-.05,.02],[-.08,.005],[-.08,0]],rubber,{n:12});}],
  ['maf','Hot-film air-mass meter · 113-094-00-48','The sensor that measures intake air mass before the throttle.',[.45,0,.35],r=>{cyl(r,[.35,0,.08],x,0,.16,.06,dark,16);block(r,[.43,0,.17],[.08,.06,.06],plastic);}],
  ['maf-housing','Air-mass meter housing · 112-140-02-18','The housing the 2006 G500 diagram lists with the air-mass meter.',[.55,0,-.2],r=>sleeve(r,[.52,0,.08],x,0,.16,.085,.06,grey,18),plates.intake06],
  ['maf-bracket','Air-mass meter bracket · 112-141-04-40','The bracket that supports the meter and its housing.',[.5,-.3,-.35],r=>{block(r,[.6,-.08,-.03],[.04,.04,.18],steel);block(r,[.6,-.12,-.1],[.1,.04,.04],steel);}],
  ['housing-gasket-1','Housing gasket No. 1 · 112-159-00-80-64','The first of two housing gaskets in the meter run. The catalog notes the replacement 112-159-00-80-65.',[.35,.3,-.2],r=>ring(r,[.33,0,.08],x,.085,.06,.012,rubber,18)],
  ['housing-gasket-2','Housing gasket No. 2 · 112-159-01-80-64','The second housing gasket in the meter run.',[.7,.3,-.1],r=>ring(r,[.69,0,.08],x,.085,.06,.012,rubber,18)]
];
const intake=study('g500-intake-air','Fresh-air intake and air-mass meter','Two scoops behind the headlamps feed molded pipes to the twin air cleaner. Its outlet runs through the hot-film meter to the throttle. Drain hoses empty each scoop.',plates.intake,
  intakeRows.map(([id,name,desc,offset,draw,source])=>source?src(part(id,name,desc,offset,draw),source):part(id,name,desc,offset,draw)));
intake.viewAngle=[-.55,.35];

// ---------------------------------------------------------------------------
// Secondary air injection: electric pump, changeover and check valves, and one
// shut-off valve per head.
const pumpC=[-.55,0,.1];
const airParts=[
  src(part('pump','Secondary air pump · 000-140-37-85','The electric pump at the front of the engine that blows fresh air into the exhaust ports during a cold start.',[-.45,0,.35],r=>{
    cyl(r,pumpC,y,-.14,.14,.12,'#55636a',18);cyl(r,[pumpC[0],.14,pumpC[2]],y,0,.1,.08,dark,16);cyl(r,[pumpC[0]+.12,0,pumpC[2]],x,0,.1,.03,plastic,10);
  }),plates.air),
  src(part('pump-insulator','Air pump insulator · 112-237-00-12','The rubber mount that isolates the pump from its brackets.',[-.45,0,-.15],r=>cyl(r,[pumpC[0],0,-.04],z,-.04,0,.06,rubber,14)),plates.air),
  src(part('inner-bracket','Air pump inner bracket · 112-237-02-40','The inner bracket the pump hangs from.',[-.5,-.35,-.1],r=>{block(r,[-.55,-.12,-.12],[.22,.03,.12],steel);block(r,[-.55,-.08,-.17],[.22,.1,.03],steel);}),plates.air),
  src(part('outer-bracket','Air pump outer bracket · 112-237-01-40','The outer bracket that ties the pump mount to the engine.',[-.5,.35,-.1],r=>{block(r,[-.55,.12,-.12],[.22,.03,.12],steel);block(r,[-.55,.08,-.17],[.22,.1,.03],steel);}),plates.air),
  src(part('hose','Air pump hose · 112-238-00-82','The hose from the pump outlet back to the changeover and check valves.',[0,0,.5],r=>hose(r,[[-.43,0,.1],[-.25,0,.25],[0,0,.3]],.035,hoseBlack,12)),plates.air),
  src(part('hose-connector','Air hose connector · 116-276-09-29','The connector that joins the pump hose to the valve.',[-.1,-.2,.6],r=>sleeve(r,[-.08,0,.29],x,-.03,.03,.05,.035,dark,14)),plates.air),
  src(part('hose-joint','Air hose joint · 601-078-02-45','The T-joint that splits the air feed between the two banks.',[.1,0,.65],r=>{cyl(r,[.08,0,.3],x,-.05,.05,.04,plastic,12);cyl(r,[.08,0,.3],y,-.1,.1,.03,plastic,12);}),plates.air),
  src(part('check-valve','Secondary air check valve · 002-140-84-60','A one-way valve that stops exhaust pressure reaching the pump.',[0,.35,.55],r=>{cyl(r,[.0,0,.3],x,-.05,.05,.055,'#6b7a80',14);}),plates.air),
  src(part('changeover-valve','Secondary air changeover valve · 000-500-32-01','The electric valve that switches vacuum to open the shut-off valves when the pump runs.',[.3,.2,.6],r=>{block(r,[.25,.18,.45],[.1,.07,.08],plastic);for(const d of [-1,1])cyl(r,[.25+d*.03,.18,.49],z,0,.06,.01,dark,8);}),plates.air),
  src(part('changeover-insulator','Changeover valve insulator · 117-078-09-81','The rubber mount that holds the changeover valve.',[.3,.45,.45],r=>sleeve(r,[.25,.18,.39],z,0,.02,.06,.035,rubber,14)),plates.air),
  ...[['shutoff-right','Secondary air shut-off valve, passenger side · 002-140-36-60','The vacuum-opened valve on the right cylinder head that admits pump air to the exhaust ports.',1,[.35,.45,0]],
     ['shutoff-left','Secondary air shut-off valve, driver side · 002-140-35-60','The matching valve on the left cylinder head.',-1,[.35,-.45,0]]].map(([id,name,desc,s,offset])=>src(part(id,name,desc,offset,r=>{
    const c=[.45,s*.45,.05];cyl(r,c,z,-.08,.06,.07,'#7d8a8e',16);cyl(r,[c[0],c[1],c[2]+.06],z,0,.04,.05,dark,14);
    hose(r,[[.08,s*.1,.3],[.3,s*.3,.2],[c[0],c[1],c[2]+.1]],.025,hoseBlack,10);
  }),plates.air)),
  src(part('shutoff-gaskets','Shut-off valve gaskets · 112-238-00-80','The gasket under each shut-off valve where it bolts to the cylinder head.',[.45,0,-.45],r=>{for(const s of [-1,1])ring(r,[.45,s*.45,-.05],z,.08,.045,.012,copper,16);}),plates.air),
  src(part('pressure-sensor','Pressure sensor · 005-153-50-28','The pressure sensor the G500 A.I.R. diagram lists with the pump, hoses and valves.',[.6,0,.4],r=>{cyl(r,[.62,0,.25],z,0,.08,.03,dark,12);block(r,[.62,0,.36],[.06,.05,.05],plastic);}),plates.air)
];
const secondaryAir=study('g500-secondary-air','Secondary air injection','During a cold start an electric pump blows fresh air into the exhaust ports to heat the catalysts. A changeover valve uses vacuum to open one shut-off valve on each head.',plates.air,airParts);
secondaryAir.viewAngle=[-.6,.4];

// ---------------------------------------------------------------------------
// Engine sensors, drawn at their positions around a block outline that is not itself a part.
const sensors=study('g500-engine-sensors','M113 engine sensors','The crank, cam, knock, temperature and oil-level sensors the G500 catalog lists for the engine controller and the instrument cluster.',plates.sensors,[
  src(part('crank-sensor','Crankshaft position sensor · 003-153-28-28','Reads the flywheel teeth through the bell housing at the back of the block.',[.45,0,-.3],r=>{cyl(r,[.85,.2,-.35],[-1,0,0],0,.14,.025,dark,12);block(r,[.88,.2,-.35],[.05,.07,.06],plastic);}),plates.sensors),
  src(part('cam-sensor','Camshaft position sensor · 004-153-69-28','Reads the camshaft position at the front of the right cylinder head.',[-.45,.3,.35],r=>{cyl(r,[-.85,.35,.35],x,0,.12,.025,dark,12);block(r,[-.88,.35,.35],[.05,.07,.06],plastic);}),plates.sensors),
  src(part('knock-sensors','Knock sensors · 003-153-86-28-64','Ring-type sensors bolted into the valley between the banks to detect detonation.',[0,0,.45],r=>{for(const px of [-.3,.3])for(const s of [-1,1])ring(r,[px,s*.1,.05],z,.05,.02,.03,'#5d6b70',14);}),plates.sensors),
  src(part('temperature-sensor','Temperature sensor · 000-905-61-02','The temperature sensor the G500 powertrain-control and senders diagrams list at the front of the engine.',[-.45,-.3,.3],r=>{cyl(r,[-.75,-.12,.3],x,-.1,0,.015,metal,10);cyl(r,[-.75,-.12,.3],x,0,.05,.025,'#6a5a3a',12);block(r,[-.7,-.12,.3],[.04,.05,.05],plastic);}),plates.sensors),
  src(part('oil-level-sensor','Oil level sensor · 275-905-00-00','The sensor that reads the oil level in the sump for the cluster warning.',[0,.3,-.45],r=>{cyl(r,[.2,.15,-.62],z,0,.18,.03,dark,12);block(r,[.2,.15,-.66],[.08,.08,.04],plastic);}),plates.senders),
  src(part('oil-level-oring','Oil level sensor O-ring · 023-997-43-48','The O-ring that seals the oil level sensor in its bore.',[0,.55,-.55],r=>ring(r,[.2,.15,-.63],z,.04,.03,.01,rubber,14)),plates.ecsMechanical03)
]);
sensors.viewAngle=[-.55,.35];

// ---------------------------------------------------------------------------
// Crankcase breather hoses from the valve covers to the intake.
const breather=study('g500-crankcase-breather','Crankcase breather hoses','Molded hoses take blow-by gas from each valve cover forward to the intake so it can be burned.',plates.ecsEmissions04,[
  src(part('left-to-boot','Breather hose, left cover to intake boot · 112-018-01-82','ECS Tuning lists this genuine hose for the G500 from the left valve cover to the air intake boot.',[-.2,-.4,.35],r=>hose(r,[[.2,-.4,.2],[-.2,-.35,.3],[-.6,-.15,.35]],.022,hoseBlack,10)),plates.ecsEmissions04),
  src(part('left-to-connector','Breather hose, left cover to connector · 112-018-02-82','ECS Tuning lists this genuine hose from the left valve cover to the breather connector.',[.15,-.45,0],r=>hose(r,[[.4,-.4,.2],[.3,-.2,.25],[.2,0,.25]],.02,hoseBlack,10)),plates.ecsEmissions04),
  src(part('right-to-connector','Breather hose, right cover to connector · 112-018-03-82','ECS Tuning lists this genuine hose from the right valve cover to the breather connector.',[.15,.45,0],r=>hose(r,[[.4,.4,.2],[.3,.2,.25],[.2,0,.25]],.02,hoseBlack,10)),plates.ecsPopular04),
  src(part('vent-hose','Breather vent hose · 112-018-04-82','The fourth hose in the M113 breather set. ECS Tuning lists it for the G500 from the left cover to the connector. The E500 air-intake diagram calls it the vent hose.',[-.35,0,.5],r=>hose(r,[[.2,0,.25],[-.2,0,.35],[-.6,.1,.35]],.025,hoseBlack,10)),plates.ecsPopular04)
]);
breather.viewAngle=[-.6,.45];

// ---------------------------------------------------------------------------
// Poly-V belt drive, front view in the x–z plane.
const pulleys=[['crank',[0,-.65],.2],['water',[0,-.05],.14],['alt',[.55,.35],.11],['ps',[-.55,.3],.12],['ac',[.55,-.45],.13],['idler',[-.3,.55],.09],['tens',[.25,.6],.08]];
const P=Object.fromEntries(pulleys.map(([k,c,rad])=>[k,{c,rad}]));
const beltPath=['crank','ac','alt','tens','idler','ps','water','crank'];
const loopC=[0,0];
function belt(r){
  // Straight runs offset to the outside of each pulley, plus a thin band where the belt wraps it.
  for(let i=1;i<beltPath.length;i++){
    const A=P[beltPath[i-1]],B=P[beltPath[i]],d=[B.c[0]-A.c[0],B.c[1]-A.c[1]],l=Math.hypot(...d);
    let nrm=[-d[1]/l,d[0]/l];const mid=[(A.c[0]+B.c[0])/2-loopC[0],(A.c[1]+B.c[1])/2-loopC[1]];
    if(nrm[0]*mid[0]+nrm[1]*mid[1]<0)nrm=[-nrm[0],-nrm[1]];
    const a=[A.c[0]+nrm[0]*(A.rad+.012),A.c[1]+nrm[1]*(A.rad+.012)],b=[B.c[0]+nrm[0]*(B.rad+.012),B.c[1]+nrm[1]*(B.rad+.012)];
    tube(r,[a[0],0,a[1]],[b[0],0,b[1]],.014,'#1f2224',6);
  }
  for(const k of new Set(beltPath))sleeve(r,[P[k].c[0],-.04,P[k].c[1]],y,0,.08,P[k].rad+.024,P[k].rad,'#1f2224',20);
}
const beltDrive=study('g500-belt-drive','Poly-V belt drive','One poly-V belt runs from the crankshaft pulley around the coolant pump, alternator, power-steering pump and A/C compressor. A spring tensioner and one idler keep it on its path.',plates.belts,[
  src(part('belt','Poly-V belt · 014-997-71-92','The single ribbed belt that drives every front accessory.',[0,-.35,0],r=>belt(r)),plates.belts),
  src(part('tensioner','Belt tensioner · 112-200-09-70','A spring-loaded arm and pulley that keeps the belt tight.',[.3,-.2,.35],r=>{
    const c=P.tens.c;turn(r,[c[0],-.04,c[1]],y,[[0,.02],[0,P.tens.rad],[.08,P.tens.rad],[.08,.02],[0,.02]],steel,{n:18});
    r.box(c[0]-.02,.04,c[1]-.25,c[0]+.02,.08,c[1],grey);cyl(r,[c[0],.04,c[1]-.25],y,0,.08,.05,grey,12);
  }),plates.belts),
  src(part('idler','Idler pulley · 000-202-09-19','The smooth pulley that guides the belt between the power-steering pump and the tensioner.',[-.3,-.2,.35],r=>{const c=P.idler.c;turn(r,[c[0],-.04,c[1]],y,[[0,.02],[0,P.idler.rad],[.08,P.idler.rad],[.08,.02],[0,.02]],metal,{n:18});}),plates.belts),
  src(part('idler-cap','Idler pulley cap · 001-988-57-35','The dust cap that covers the idler bearing and bolt.',[-.35,-.45,.45],r=>{const c=P.idler.c;turn(r,[c[0],-.07,c[1]],y,[[0,0],[0,.045],[.03,.04],[.035,0]],dark,{n:14});}),plates.belts),
  src(part('idler-bolt','Idler pulley bolt · 112-990-01-12','The shoulder bolt the idler pulley turns on.',[-.4,-.6,.6],r=>{const c=P.idler.c;cyl(r,[c[0],-.1,c[1]],y,0,.2,.015,steel,10);cyl(r,[c[0],-.12,c[1]],y,0,.02,.03,steel,6);}),plates.belts)
]);
beltDrive.viewAngle=[-.2,.15];

export const studies=[ignition,manifold,intake,secondaryAir,sensors,breather,beltDrive];
export const views=new Map([
  ['powertrain.coils',ignition],
  ['powertrain.fuel-rail',manifold],['powertrain.injectors',manifold],
  ['powertrain.intake-duct',intake],['intake.intake-duct',intake],['powertrain.maf',intake],['intake.maf',intake],
  ['powertrain.head',secondaryAir],
  ['powertrain.block',sensors],
  ['g500-valve-covers.left',breather],
  ['powertrain.belt',beltDrive],['powertrain.tensioner',beltDrive]
]);

const idsOf=(s,keys)=>keys.map(k=>s.id+'.'+k);
const bySource=s=>{const m=new Map();for(const p of s.groups[0].parts){const src=p.source||s.source;if(!m.has(src))m.set(src,[]);m.get(src).push(p.id);}return m;};
const facts=new Map([
  [plates.ignition,['The 2004 G500 ignition diagram lists coil 000-158-78-03 and four cable sets, 112-150-01-18-64 to 112-150-04-18-64, with the coil and cylinder each set serves.','Confirm the lead routing, coil mounting positions and connector shapes on the engine. The lead lengths are not published.']],
  [plates.injection,['The 2004 G500 fuel injection diagram lists fuel rail 113-070-04-95 and injector 113-078-02-49-64 for the G500.','Measure the rail branch spacing, crossover position, pressure-regulator mounting and injector seat heights.']],
  [plates.manifold,['The 2004 G500 intake manifold diagram lists manifold gasket 113-141-09-80.','The gasket outline and the runner port shapes are not measured.']],
  [plates.throttle,['The 2004 G500 throttle-body diagram lists gasket 305-997-03-45. The 2004 E500 air-intake diagram calls the same number the actuator seal.','Measure the seal section and the actuator flange.']],
  [plates.ecsEmissions06,['ECS Tuning lists genuine Mercedes valve 002-540-18-97 for the 2006 G500 as a vacuum solenoid (EGR changeover) valve, mounted on the intake manifold, two required.','Confirm which vacuum circuits each valve switches and their mounting positions on a G500 manifold. This is a retailer fitment listing, not a factory diagram.']],
  [plates.intake,['The 2004 G500 air intake diagram lists both scoops, both intake pipes and their connectors, the center and rear pipes, seal, bracket, cleaner clip, drain hoses, connectors and valves, the air-mass meter 113-094-00-48, its bracket and housing gaskets No. 1 and No. 2.','Measure the pipe and scoop sections, the bend radii and the body mounting points. The pipe routing is schematic.']],
  [plates.intake06,['The 2006 G500 air intake diagram adds housing 112-140-02-18 next to the air-mass meter.','Confirm the housing shape and which gaskets sit on each end.']],
  [plates.air,['The 2004 G500 A.I.R. system diagram lists the air pump, its insulator and inner and outer brackets, the left and right shut-off valves and gasket, the hose, hose connector and hose joint, the changeover valve and insulator, the check valve and pressure sensor 005-153-50-28. The 2004 E500 diagram for the same M113 lists the same numbers.','Measure the pump position, hose routing and valve bosses on the heads. The role of pressure sensor 005-153-50-28 is not stated on the diagram.']],
  [plates.sensors,['The 2004 G500 powertrain-control diagram lists camshaft sensor 004-153-69-28, temperature sensor 000-905-61-02, crankshaft sensor 003-153-28-28 and knock sensor 003-153-86-28-64 for the G500.','Locate each sensor boss and connector on the engine. The diagram calls 000-905-61-02 a coolant temperature sensor while its image is labeled as an intake-air temperature sensor; confirm which it is.']],
  [plates.senders,['The 2004 G500 senders diagram lists oil level sensor 275-905-00-00 for the G500 and G55 AMG.','Measure the sensor length and its position in the oil pan.']],
  [plates.ecsMechanical03,['ECS Tuning lists oil level sender O-ring 023-997-43-48 (Victor Reinz) for the 2003 G500 5.0.','Confirm the genuine Mercedes number in the factory catalog. This is a retailer listing of an aftermarket seal under the OE number.']],
  [plates.ecsEmissions04,['ECS Tuning lists genuine Mercedes crankcase breather hoses 112-018-01-82 (left cover to intake boot) and 112-018-02-82 (left cover to connector) for the 2004 G500 5.0.','Confirm the hoses in the factory crankcase-ventilation diagram and measure their routing. This is a retailer fitment listing.']],
  [plates.ecsPopular04,['ECS Tuning lists genuine Mercedes breather hoses 112-018-03-82 (right cover to connector) and 112-018-04-82 (left cover to connector) for the 2004 G500 5.0.','ECS gives the same position for 112-018-02-82 and 112-018-04-82. Confirm each hose position in the factory diagram.']],
  [plates.belts,['The 2007 G500 belts and pulleys diagram lists belt 014-997-71-92, tensioner 112-200-09-70, idler pulley 000-202-09-19, idler cap 001-988-57-35 and idler bolt 112-990-01-12 for the 5.0L. The 2004 G500 diagram lists the same belt, tensioner, idler and cap.','The pulley centers are schematic. Measure each pulley diameter and position, and confirm the belt path.']]
]);
export const claims=studies.flatMap(s=>[...bySource(s)].map(([source,ids])=>{const [fact,need]=facts.get(source);return {ids,kind:'diagram',fact,need,source};}));
// Same-engine corroboration for the secondary air parts and the breather vent hose.
claims.push({ids:idsOf(secondaryAir,['pump','pump-insulator','inner-bracket','outer-bracket','shutoff-right','shutoff-left','shutoff-gaskets','hose','hose-connector','hose-joint','changeover-valve','changeover-insulator','check-valve','pressure-sensor']),kind:'diagram',
  fact:'The 2004 E500 A.I.R. diagram lists the same pump, brackets, valves, hoses and pressure sensor numbers for the M113 5.0.',need:'The E500 page supports the numbers only; G500 routing must be confirmed on the vehicle.',source:plates.e500Air});
claims.push({ids:idsOf(breather,['vent-hose']),kind:'diagram',fact:'The 2004 E500 air-intake diagram lists vent hose 112-018-04-82 for the M113 5.0.',need:'Confirm the G500 number by VIN; the E500 air cleaner differs from the G500 twin cleaner.',source:plates.e500Intake});
claims.push({ids:idsOf(beltDrive,['belt','tensioner','idler','idler-cap']),kind:'diagram',fact:'The 2004 G500 belts and pulleys diagram lists belt 014-997-71-92, tensioner 112-200-09-70, idler 000-202-09-19 and cap 001-988-57-35.',need:'Confirm the belt length and pulley positions.',source:plates.belts04});
