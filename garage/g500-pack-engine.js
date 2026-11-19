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
  ignition:{label:'MB Parts Giant · 2002 G500 ignition system diagram',url:mbpg+'2002-mercedes_benz-g500/electrical/ignition-system'},
  injection:{label:'MB Parts Giant · 2004 G500 fuel injection diagram, a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed for fuel rail 113-070-04-95 and injector 113-078-02-49-64',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/fuel-injection'},
  throttle:{label:'MB Parts Giant · 2004 G500 throttle body diagram, a later-year plate; the 2002 G500 air intake plate lists actuator 113-141-01-25, air cleaner 112-090-11-01 and filter 273-094-04-04-95, but not gasket 305-997-03-45, whose 2002 fitment is unconfirmed',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/throttle-body'},
  manifold:{label:'MB Parts Giant · 2004 G500 intake manifold diagram, a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed for gasket 113-141-09-80',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/intake-manifold'},
  intake:{label:'MB Parts Giant · 2002 G500 air intake diagram',url:mbpg+'2002-mercedes_benz-g500/air-fuel-delivery/air-intake'},
  intake06:{label:'MB Parts Giant · 2006 G500 air intake diagram, a later-year plate; the 2002 G500 air intake plate does not list housing 112-140-02-18, so its 2002 fitment is unconfirmed',url:'https://mbpartsgiant.com/parts-list/2006-mercedes_benz-g500/air-fuel-delivery/air-intake'},
  air:{label:'MB Parts Giant · 2004 G500 A.I.R. system diagram, a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment is unconfirmed',url:mbpg+'2004-mercedes_benz-g500/emission-control-exhaust/a-i-r-system'},
  e500Air:{label:'MB Parts Giant · 2004 E500 A.I.R. system diagram (M113 5.0)',url:mbpg+'2004-mercedes_benz-e500/emission-control-exhaust/a-i-r-system'},
  sensors:{label:'MB Parts Giant · 2004 G500 powertrain control diagram, a later-year plate; the 2002 G500 senders plate lists temperature sensor 000-905-61-02, and 2002 fitment of the crankshaft, camshaft and knock sensors is unconfirmed',url:mbpg+'2004-mercedes_benz-g500/air-fuel-delivery/powertrain-control-air'},
  senders:{label:'MB Parts Giant · 2002 G500 senders diagram',url:mbpg+'2002-mercedes_benz-g500/electrical/senders'},
  belts:{label:'MB Parts Giant · 2007 G500 belts and pulleys diagram, a later-year plate; the 2002 G500 plate lists the same tensioner, idler and cap but belt 011-997-97-92 and no idler bolt, so belt 014-997-71-92 and bolt 112-990-01-12 are unconfirmed for 2002',url:'https://mbpartsgiant.com/parts-list/2007-mercedes_benz-g500/belts-cooling/belts-pulleys-cooling'},
  belts04:{label:'MB Parts Giant · 2004 G500 belts and pulleys diagram, a later-year plate; the 2002 G500 plate lists the same tensioner, idler and cap but belt 011-997-97-92, so belt 014-997-71-92 is unconfirmed for 2002',url:'https://mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/belts-cooling/belts-pulleys-cooling'},
  ecsEmissions04:{label:'ECS Tuning · 2004 G500 5.0 emissions parts, page 2',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Engine/Emissions/2'},
  ecsEmissions06:{label:'ECS Tuning · 2006 G500 5.0 (113.962) emissions parts, page 2',url:'https://www.ecstuning.com/Mercedes_Benz-2006-G500-463.249-Base-Sport_Utility-V8_5.0L_113.962/Engine/Emissions/2'},
  ecsPopular04:{label:'ECS Tuning · 2004 G500 5.0 popular engine parts, page 4',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Engine/4'},
  ecsMechanical03:{label:'ECS Tuning · 2003 G500 5.0 engine mechanical parts, page 6',url:'https://www.ecstuning.com/Mercedes_Benz-2003-G500-463.249-Base-Sport_Utility-V8_5.0L/Engine/Mechanical/6'},
  e500Intake:{label:'MB Parts Giant · 2004 E500 air intake diagram (M113 5.0)',url:mbpg+'2004-mercedes_benz-e500/air-fuel-delivery/air-intake'},
  // Round 2 sources.
  ignition06:{label:'MB Parts Giant · 2006 G500 ignition system diagram, a later-year plate; the 2002 G500 ignition plate lists no spark plug, so 2002 fitment of plug 003-159-94-03-90 is unconfirmed',url:mbpg+'2006-mercedes_benz-g500/electrical/ignition-system'},
  head02:{label:'MB Parts Giant · 2002 G500 cylinder head and valves diagram',url:mbpg+'2002-mercedes_benz-g500/engine/cylinder-head-valves'},
  head04:{label:'MB Parts Giant · 2004 G500 cylinder head and valves diagram, a later-year plate kept for comparison; the 2002 G500 plate lists the same heads, head gaskets, valve cover gaskets and front cover',url:mbpg+'2004-mercedes_benz-g500/engine/cylinder-head-valves'},
  cover02:{label:'MB Parts Giant · 2002 G500 engine appearance cover diagram',url:mbpg+'2002-mercedes_benz-g500/engine/engine-appearance-cover'},
  engineParts02:{label:'MB Parts Giant · 2002 G500 engine parts diagram',url:mbpg+'2002-mercedes_benz-g500/engine/engine-parts'},
  engineParts08:{label:'MB Parts Giant · 2008 G500 engine parts diagram, a later-year plate; the 2002 G500 cylinder head plate lists front cover 112-010-07-33, and 2002 fitment of intake manifold 113-140-07-01 is unconfirmed',url:mbpg+'2008-mercedes_benz-g500/air-fuel-delivery/intake-manifold'},
  mounting02:{label:'MB Parts Giant · 2002 G500 engine and transmission mounting diagram',url:mbpg+'2002-mercedes_benz-g500/engine/engine-trans-mounting'},
  oilCooler:{label:'MB Parts Giant · G500 engine oil cooler 112-188-04-01, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-engine_oil_cooler'},
  ecsEngine04p8:{label:'ECS Tuning · 2004 G500 5.0 popular engine parts, page 8',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Engine/8'},
  ecsEngine04p11:{label:'ECS Tuning · 2004 G500 5.0 popular engine parts, page 11',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Engine/11'},
  ecsEngine04p20:{label:'ECS Tuning · 2004 G500 5.0 popular engine parts, page 20',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Engine/20'},
  ecsEngine03p14:{label:'ECS Tuning · 2003 G500 5.0 popular engine parts, page 14',url:'https://www.ecstuning.com/Mercedes_Benz-2003-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/Engine/14'},
  ecsPopular04p5:{label:'ECS Tuning · 2004 G500 5.0 popular parts, page 5',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/5'},
  ecsPopular04p13:{label:'ECS Tuning · 2004 G500 5.0 popular parts, page 13',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/13'},
  ecsPopular04p14:{label:'ECS Tuning · 2004 G500 5.0 popular parts, page 14',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/14'},
  ecsPopular04p26:{label:'ECS Tuning · 2004 G500 5.0 popular parts, page 26',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/26'},
  ecsPopular04p55:{label:'ECS Tuning · 2004 G500 5.0 popular parts, page 55',url:'https://www.ecstuning.com/Mercedes_Benz-2004-G500-463.249-Base-Sport_Utility-V8_5.0L/Popular/55'},
  ecsEmissions05p5:{label:'ECS Tuning · 2005 G500 5.0 emissions parts, page 5',url:'https://www.ecstuning.com/Mercedes_Benz-2005-G500-463.249-Base-Sport_Utility-V8_5.0L/Engine/Emissions/5'},
  ecsR500Head:{label:'ECS Tuning · 2007 R500 5.0 (113.971) cylinder head parts, page 2',url:'https://www.ecstuning.com/Mercedes_Benz-2007-R500-251.175-Base-Wagon-V8_5.0L_113.971/Engine/Mechanical/Cylinder_Head/2'}
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
  }),plates.ignition)),
  src(part('spark-plugs','Spark plugs · 003-159-94-03-90','Sixteen plugs, two per cylinder, threaded into the heads under the lead boots. The 2006 G500 ignition diagram lists this plug for the 5.0L.',[0,0,-.5],r=>{
    for(let c=0;c<8;c++)for(const k of [0,1]){const p=plug(c,k);cyl(r,[p[0],p[1],-.02],z,-.1,0,.012,steel,6);cyl(r,[p[0],p[1],-.02],z,0,.03,.02,metal,6);cyl(r,[p[0],p[1],.01],z,0,.07,.013,'#e8e4da',6);}
  }),plates.ignition06),
  src(part('coil-screws','Ignition coil screws · 001-990-72-12-64','The screw that holds each coil to the valve cover, one per coil. ECS Tuning lists it as a genuine part for the G500.',[0,0,.75],r=>{
    for(let c=0;c<8;c++){const t=coilTop(c);cyl(r,[t[0]+.09,t[1],t[2]-.06],z,0,.08,.01,steel,8);cyl(r,[t[0]+.09,t[1],t[2]+.02],z,0,.015,.02,steel,8);}
  }),plates.ecsEngine04p8)
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
  src(part('vent-hose','Breather vent hose · 112-018-04-82','The fourth hose in the M113 breather set. ECS Tuning lists it for the G500 from the left cover to the connector. The E500 air-intake diagram calls it the vent hose.',[-.35,0,.5],r=>hose(r,[[.2,0,.25],[-.2,0,.35],[-.6,.1,.35]],.025,hoseBlack,10)),plates.ecsPopular04),
  src(part('hose-connector','Breather hose connector · 117-990-15-78','The fitting where the cover hoses join before the line runs forward. ECS Tuning lists it as a genuine part for the G500.',[.3,0,.35],r=>{cyl(r,[.2,0,.25],y,-.06,.06,.03,dark,12);cyl(r,[.2,0,.25],z,0,.07,.022,dark,10);}),plates.ecsEngine03p14),
  src(part('part-load-connector','Part-load ventilation connector · 112-018-02-09','The air distribution connector for part-load crankcase ventilation. ECS Tuning lists it as genuine for the same M113 5.0 in the R500.',[-.6,.25,.15],r=>{cyl(r,[-.6,.1,.35],x,-.05,.05,.028,plastic,12);cyl(r,[-.6,.1,.35],[0,1,1],0,.08,.018,plastic,10);}),plates.ecsR500Head)
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
  src(part('idler-bolt','Idler pulley bolt · 112-990-01-12','The shoulder bolt the idler pulley turns on.',[-.4,-.6,.6],r=>{const c=P.idler.c;cyl(r,[c[0],-.1,c[1]],y,0,.2,.015,steel,10);cyl(r,[c[0],-.12,c[1]],y,0,.02,.03,steel,6);}),plates.belts),
  src(part('belt-early','Poly-V belt, early chassis · 011-997-97-92','The belt ECS Tuning lists as genuine for G500 chassis up to 137111. Later chassis use 014-997-71-92.',[0,-.8,-.35],r=>{for(const k of beltPath)sleeve(r,[P[k].c[0],-.04,P[k].c[1]],y,.01,.07,P[k].rad+.03,P[k].rad+.012,'#2b2f31',16);}),plates.ecsPopular04p26)
]);
beltDrive.viewAngle=[-.2,.15];

// ===========================================================================
// Round 2.
// Cylinder heads, gaskets and covers. A V with the left bank at −y and the right at +y, front at −x.
const headBox=(r,s,color)=>{
  const c=[0,s*.45,.12];
  for(let i=0;i<4;i++)block(r,[-.54+i*.36,c[1],c[2]],[.34,.3,.22],color);
  for(let i=0;i<4;i++)cyl(r,[-.54+i*.36,c[1]+s*.16,c[2]-.02],[0,s,0],0,.05,.05,tint2(color),10);
};
const tint2=c=>c==='#8f9a9c'?'#7d888a':'#6f7a7c';
const headGasket=(r,s)=>{
  r.box(-.74,s*.45-.16,-.02,.74,s*.45+.16,0,'#9a8f6e');
  for(let i=0;i<4;i++)ring(r,[-.54+i*.36,s*.45,-.025],z,.13,.11,.03,'#5d5a50',16);
};
const vcGasket=(r,s)=>{
  for(const yy of [-.15,.15])r.box(-.76,s*.45+yy-.012,.38,.76,s*.45+yy+.012,.4,rubber);
  for(const xx of [-.76,.76])r.box(xx-.012,s*.45-.15,.38,xx+.012,s*.45+.15,.4,rubber);
};
const liftBracket=(r,s,xx)=>{block(r,[xx,s*.6,.4],[.12,.03,.14],steel);sleeve(r,[xx,s*.6,.45],y,-.02,.02,.04,.02,steel,12);};
const heads=study('g500-cylinder-heads','M113 cylinder heads, gaskets and covers','Each bank has an aluminum head on a multilayer gasket. A gasket seals each valve cover to its head, a front cover closes the head ends, and a plastic cover sits over the top of the engine.',plates.head02,[
  src(part('left-head','Cylinder head, left · 113-010-20-20','The left-bank head with its three valves per cylinder and two spark plug bores per cylinder.',[0,-.55,.1],r=>headBox(r,-1,grey)),plates.head02),
  src(part('right-head','Cylinder head, right · 113-010-21-20','The right-bank head, a mirror of the left.',[0,.55,.1],r=>headBox(r,1,'#8f9a9c')),plates.head02),
  src(part('left-head-gasket','Cylinder head gasket, left · 113-016-04-20','The gasket between the left head and the block. It supersedes 113-016-02-20.',[0,-.4,-.4],r=>headGasket(r,-1)),plates.head02),
  src(part('right-head-gasket','Cylinder head gasket, right · 113-016-05-20','The gasket between the right head and the block. It supersedes 113-016-03-20.',[0,.4,-.4],r=>headGasket(r,1)),plates.head02),
  src(part('left-cover-gasket','Valve cover gasket, left · 113-016-02-21','The G500 cylinder-head diagram lists this gasket for the left cover. The engine-parts diagram lists 112-016-02-21 in the same place.',[0,-.5,.55],r=>vcGasket(r,-1)),plates.head02),
  src(part('right-cover-gasket','Valve cover gasket, right · 113-016-03-21','The right-cover gasket on the cylinder-head diagram. The engine-parts diagram lists 112-016-03-21 in the same place.',[0,.5,.55],r=>vcGasket(r,1)),plates.head02),
  src(part('front-cover','Front cover · 112-010-07-33','The cover the G500 cylinder-head diagram lists at the front of the engine. The 2008 G500 engine-parts diagram lists it as the timing cover.',[-.6,0,.25],r=>{block(r,[-.82,0,0],[.04,1.0,.5],grey);block(r,[-.82,0,-.32],[.04,.4,.18],grey);}),plates.head02),
  src(part('engine-cover','Engine cover · 113-010-13-67','The plastic appearance cover over the top of the engine. It supersedes 113-010-03-67.',[0,0,.7],r=>{block(r,[0,0,.62],[1.2,.5,.04],'#2c3134');block(r,[-.15,0,.66],[.4,.2,.03],'#4b5256');}),plates.cover02),
  src(part('guide-pin','Timing chain guide rail pins · 112-052-01-74','The pins that hold the timing chain guide rails to the engine. ECS Tuning lists them as genuine for the G500.',[-.75,0,.6],r=>{for(const s of [-1,1])cyl(r,[-.84,s*.25,.18],x,-.08,0,.015,steel,10);}),plates.ecsEngine04p11),
  src(part('lift-bracket-right','Engine lift bracket, right · 112-223-03-41','The lifting eye bolted to the passenger-side head.',[.25,.35,.55],r=>liftBracket(r,1,.6)),plates.mounting02),
  src(part('lift-bracket-left','Engine lift bracket, left · 112-223-04-41','The lifting eye bolted to the driver-side head.',[-.25,-.35,.55],r=>liftBracket(r,-1,-.6)),plates.mounting02)
]);
heads.viewAngle=[-.6,.45];

// Crankshaft, rods and pistons, front at −x, the crank axis along x.
const crankX=[-.48,-.16,.16,.48];
const crankZ=-.35;
const pinPos=(i,k)=>[crankX[i]+(k?.04:-.04),(i%2?-.1:.1),crankZ+(i<2?.1:-.1)];
const bore=(i,k)=>{const s=k?1:-1;return [crankX[i]+(k?.04:-.04),s*.38,.25];};
const crank=study('g500-m113-crank-pistons','M113 crankshaft, rods and pistons by number','The forged crankshaft has four crankpins, each shared by two connecting rods side by side. Each rod carries an aluminum piston and ring pack, and the damper bolt holds the front pulley on the crank nose.',plates.head02,[
  src(part('crankshaft','Crankshaft · 113-030-05-01','The four-throw crankshaft in five main bearings. The catalog notes the replacement 113-030-11-01.',[0,0,-.4],r=>{
    cyl(r,[-.85,0,crankZ],x,0,1.7,.05,steel,14);
    for(let i=0;i<4;i++){const p=pinPos(i,0);block(r,[crankX[i],p[1]/2,(crankZ+p[2])/2],[.14,.12,.24],steel);cyl(r,[crankX[i]-.07,p[1],p[2]],x,0,.14,.045,metal,12);}
  }),plates.head02),
  src(part('rods','Connecting rods · 113-030-00-20','Eight forged rods, two on each crankpin, one per bank.',[0,0,.1],r=>{
    for(let i=0;i<4;i++)for(const k of [0,1]){const a=pinPos(i,k),b=bore(i,k);tube(r,a,b,.022,'#8b979b',8);sleeve(r,a,x,-.02,.02,.06,.045,'#8b979b',12);}
  }),plates.head02),
  src(part('rod-bolts','Connecting rod bolts · 112-038-00-71','Two bolts clamp each rod cap. ECS Tuning lists them for the G500 and says to replace them with the rod bearings.',[0,0,-.8],r=>{
    for(let i=0;i<4;i++)for(const k of [0,1]){const a=pinPos(i,k);for(const d of [-1,1])cyl(r,[a[0],a[1]+d*.06,a[2]-.08],z,0,.1,.01,steel,8);}
  }),plates.ecsEngine04p11),
  src(part('pistons','Pistons · 113-030-28-17','Eight pistons, one in each bore. The catalog says this number replaces 113-030-31-17 and 113-030-03-17.',[0,0,.5],r=>{
    for(let i=0;i<4;i++)for(const k of [0,1]){const b=bore(i,k);cyl(r,[b[0],b[1],b[2]],z,0,.14,.09,'#c4c9c4',14);}
  }),plates.head02),
  src(part('rings','Piston ring sets · 113-030-00-24','The compression and oil-control rings for each piston.',[0,0,.8],r=>{
    for(let i=0;i<4;i++)for(const k of [0,1]){const b=bore(i,k);for(const h of [.1,.075,.045])ring(r,[b[0],b[1],b[2]+h],z,.095,.088,.008,'#4f5558',12);}
  }),plates.head02),
  src(part('damper-bolt','Vibration damper bolt · 006-990-70-04','The center bolt that holds the damper and pulley on the crank nose. ECS Tuning lists it as genuine and says to replace it whenever the damper comes off.',[-.45,0,0],r=>{cyl(r,[-.95,0,crankZ],x,0,.14,.025,steel,10);cyl(r,[-1,0,crankZ],x,0,.05,.05,steel,6);}),plates.ecsPopular04p13)
]);
crank.viewAngle=[-.55,.3];

// Oil filter housing on the front of the engine with its exchanger, the pump below and the drain plug.
const oil=study('g500-oil-filter-housing','Oil filter housing, cooler and pump by number','The cast housing at the front of the M113 holds the filter cartridge under a screw-on cover. The oil-to-coolant exchanger bolts to it, sealed by rings, and the chain-driven pump feeds it from the sump.',plates.engineParts02,[
  src(part('housing','Oil filter housing · 112-184-01-02-65','The housing that carries the filter cartridge, mounted on the front of the timing cover. It supersedes 112-184-01-02 and 112-184-01-02-64.',[0,0,.15],r=>{sleeve(r,[-.3,0,-.3],z,0,.7,.24,.2,grey,24);block(r,[-.3,.3,-.1],[.36,.24,.36],grey);}),plates.engineParts02),
  src(part('cover','Oil filter cover · 112-180-07-10-64','The screw-on cap that closes the top of the housing. The catalog calls it the oil filter, with the other name cover.',[0,0,.45],r=>{cyl(r,[-.3,0,.4],z,0,.12,.25,dark,24);cyl(r,[-.3,0,.52],z,0,.06,.09,dark,6);}),plates.engineParts02),
  src(part('element','Oil filter element · 000-180-26-09-90','The paper cartridge that sits inside the housing.',[0,-.5,.4],r=>sleeve(r,[-.3,0,-.24],z,0,.58,.17,.07,'#d9cfa8',22)),plates.engineParts02),
  src(part('oil-cooler','Engine oil cooler · 112-188-04-01','The oil-to-coolant exchanger bolted to the side of the filter housing. It supersedes 112-188-03-01.',[0,.45,0],r=>{for(let i=0;i<8;i++)block(r,[-.3,.6,-.28+i*.08],[.5,.24,.055],i%2?'#9aa6a8':'#7e8a8c');}),plates.engineParts02),
  src(part('cooler-seal','Seal ring, housing to cooler · 112-184-02-61','The ring that seals the filter housing to the oil cooler. ECS Tuning lists it as a genuine G500 part, one required.',[0,.3,.4],r=>ring(r,[-.38,.45,-.05],y,.08,.06,.015,rubber,18)),plates.ecsEngine04p11),
  src(part('cooler-seal-early','Seal ring, housing to cooler, early engines · 112-184-03-61','The housing-to-cooler ring ECS Tuning lists for the G500 up to engine number 113.962 30 000200.',[.3,.35,.35],r=>ring(r,[-.2,.45,-.05],y,.06,.045,.015,'#3b3020',16)),plates.ecsMechanical03),
  src(part('cover-seal','Seal ring, housing to timing cover · 112-184-00-61','The ring that seals the filter housing to the timing cover. ECS Tuning lists it as genuine for the G500 up to engine number 113.962 30 000200.',[-.35,0,-.3],r=>ring(r,[-.3,-.26,-.15],y,.08,.06,.015,rubber,18)),plates.ecsMechanical03),
  src(part('oil-pump','Oil pump · 113-180-01-01','The chain-driven gear pump at the bottom of the block that pressurizes the oil system.',[.35,0,-.3],r=>{block(r,[.45,0,-.35],[.5,.36,.24],'#6f7a7c');cyl(r,[.3,-.18,-.35],y,-.06,0,.13,dark,18);cyl(r,[.6,0,-.47],z,-.25,0,.06,'#6f7a7c',12);}),plates.head02),
  src(part('drain-plug','Oil drain plug · 111-997-03-30','The 14 mm plug in the lower oil pan. ECS Tuning lists it for the G500, sold without its sealing washer.',[.4,0,-.35],r=>{cyl(r,[.85,0,-.6],z,0,.08,.035,steel,12);cyl(r,[.85,0,-.64],z,0,.04,.06,steel,6);}),plates.ecsPopular04)
]);
oil.viewAngle=[-.6,.35];

// Intake manifold, throttle actuator and vacuum fittings. Front at −x.
const intakeManifold=study('g500-manifold-throttle','Intake manifold, throttle actuator and vacuum fittings','The electronic throttle actuator feeds the two-path intake manifold, which sits on a gasket over each bank. Small molded connectors join the vacuum lines on top.',plates.engineParts08,[
  src(part('manifold','Intake manifold · 113-140-07-01','The magnesium two-path manifold with its runners over both banks. The 2004 and 2008 G500 intake-manifold diagrams list it.',[0,0,.4],r=>{
    block(r,[0,0,.3],[1.2,.36,.16],'#6d7477');for(const s of [-1,1])for(let i=0;i<4;i++)hose(r,[[-.54+i*.36,s*.12,.25],[-.54+i*.36,s*.3,.15],[-.54+i*.36,s*.38,0]],.04,'#6d7477',10);
  }),plates.engineParts08),
  src(part('gasket-no-egr','Intake manifold gasket, without EGR · 113-141-13-80','The runner gasket ECS Tuning lists as genuine for G500s without EGR, two per engine. Cars with EGR use 113-141-09-80.',[0,0,-.4],r=>{for(const s of [-1,1])r.box(-.72,s*.38-.06,-.04,.72,s*.38+.06,-.03,'#8a8368');}),plates.ecsPopular04p55),
  src(part('throttle-actuator','Throttle actuator · 113-141-01-25','The electronic throttle body at the front of the manifold. ECS Tuning gives its fitment from engine number 30 205218.',[-.55,0,.2],r=>{sleeve(r,[-.75,0,.3],x,0,.12,.1,.075,grey,20);block(r,[-.7,.15,.3],[.12,.1,.16],plastic);}),plates.throttle),
  src(part('vacuum-elbow','Vacuum hose elbow · 117-078-07-81','A molded 90-degree connector in the engine vacuum lines. ECS Tuning lists it under G500 emissions parts.',[.4,.35,.5],r=>hose(r,[[.3,.1,.42],[.3,.1,.5],[.38,.1,.5]],.012,rubber,8)),plates.ecsEmissions05p5),
  src(part('vacuum-reducer','Vacuum hose reducer · 117-078-06-81','A connector that joins a 3 mm vacuum line to a 7 mm line. ECS Tuning lists it under G500 emissions parts.',[.45,-.35,.5],r=>{cyl(r,[.3,-.1,.45],x,0,.04,.012,rubber,8);cyl(r,[.34,-.1,.45],x,0,.04,.02,rubber,10);}),plates.ecsEmissions05p5)
]);
intakeManifold.viewAngle=[-.6,.4];

// Air cleaner assembly and its elements.
const cleaner=study('g500-air-cleaner-parts','Air cleaner assembly and elements','The twin-element air cleaner of the G500 5.0L, as the air-intake diagram numbers it.',plates.throttle,[
  src(part('assembly','Air cleaner assembly · 112-090-11-01','The housing that holds both filter elements and feeds the air-mass meter.',[0,0,.35],r=>{for(const s of [-1,1])block(r,[0,s*.3,.1],[.7,.42,.26],plastic);block(r,[.45,0,.1],[.2,.2,.16],plastic);}),plates.throttle),
  src(part('elements','Air filter elements · 273-094-04-04-95','The two paper elements, one per side of the cleaner.',[0,0,-.35],r=>{for(const s of [-1,1]){block(r,[0,s*.3,.06],[.6,.34,.1],'#d6cb9c');for(let i=0;i<8;i++)block(r,[-.26+i*.075,s*.3,.12],[.02,.34,.02],'#bfb486');}}),plates.throttle)
]);
cleaner.viewAngle=[-.55,.4];

// Engine control module and its bracket.
const ecm=study('g500-ecm-mounting','Engine control module and bracket','The ME-SFI engine controller is held in a small bracket. The G500 ignition diagram numbers both.',plates.ignition,[
  src(part('ecm','Engine control module · 113-153-19-91','The ME-SFI controller the G500 ignition and powertrain-control diagrams list.',[0,0,.35],r=>{block(r,[0,0,.1],[.7,.5,.12],grey);for(let i=0;i<3;i++)block(r,[-.2+i*.2,.27,.1],[.16,.06,.08],dark);}),plates.ignition),
  src(part('bracket','Engine control module bracket · 170-545-12-40','The bracket that holds the controller in place.',[0,0,-.35],r=>{r.box(-.4,-.3,-.06,.4,.3,-.03,steel);for(const s of [-1,1])r.box(s*.4-.02,-.3,-.06,s*.4+.02,.3,.08,steel);}),plates.ignition)
]);
ecm.viewAngle=[-.5,.45];

const round2=[heads,crank,oil,intakeManifold,cleaner,ecm];

export const studies=[ignition,manifold,intake,sensors,breather,beltDrive,...round2];
export const views=new Map([
  ['powertrain.coils',ignition],
  ['powertrain.fuel-rail',manifold],['powertrain.injectors',manifold],
  ['powertrain.intake-duct',intake],['intake.intake-duct',intake],['powertrain.maf',intake],['intake.maf',intake],
  ['powertrain.block',sensors],
  ['g500-valve-covers.left',breather],
  ['powertrain.belt',beltDrive],['powertrain.tensioner',beltDrive],
  ['powertrain.head',heads],['powertrain.head-gasket',heads],
  ['g500-m113-bearings.main-shells',crank],['g500-m113-bearings.rod-shells',crank],
  ['g500-oil-cartridge.housing',oil],['engine-oil.oil-pump',oil],
  ['g500-throttle.drive',intakeManifold],['g500-variable-intake.actuator',intakeManifold],
  ['g500-air-cleaner.lid',cleaner],
  ['g500-electronics-ecu.tray',ecm]
]);

const idsOf=(s,keys)=>keys.map(k=>s.id+'.'+k);
const bySource=s=>{const m=new Map();for(const p of s.groups[0].parts){const src=p.source||s.source;if(!m.has(src))m.set(src,[]);m.get(src).push(p.id);}return m;};
const facts=new Map([
  [plates.ignition,['The 2002 G500 ignition diagram lists coil 000-158-78-03 and four cable sets, 112-150-01-18-64 to 112-150-04-18-64, with the coil and cylinder each set serves.','Confirm the lead routing, coil mounting positions and connector shapes on the engine. The lead lengths are not published.']],
  [plates.injection,['The 2004 G500 fuel injection diagram lists fuel rail 113-070-04-95 and injector 113-078-02-49-64 for the G500.','Measure the rail branch spacing, crossover position, pressure-regulator mounting and injector seat heights.']],
  [plates.manifold,['The 2004 G500 intake manifold diagram lists manifold gasket 113-141-09-80.','The gasket outline and the runner port shapes are not measured.']],
  [plates.throttle,['The 2004 G500 throttle-body diagram lists gasket 305-997-03-45. The 2004 E500 air-intake diagram calls the same number the actuator seal.','Measure the seal section and the actuator flange.']],
  [plates.ecsEmissions06,['ECS Tuning lists genuine Mercedes valve 002-540-18-97 for the 2006 G500 as a vacuum solenoid (EGR changeover) valve, mounted on the intake manifold, two required.','Confirm which vacuum circuits each valve switches and their mounting positions on a G500 manifold. This is a retailer fitment listing, not a factory diagram.']],
  [plates.intake,['The 2002 G500 air intake diagram lists both scoops, both intake pipes and their connectors, the center and rear pipes, seal, bracket, cleaner clip, drain hoses, connectors and valves, the air-mass meter 113-094-00-48, its bracket and housing gaskets No. 1 and No. 2.','Measure the pipe and scoop sections, the bend radii and the body mounting points. The pipe routing is schematic.']],
  [plates.intake06,['The 2006 G500 air intake diagram adds housing 112-140-02-18 next to the air-mass meter.','Confirm the housing shape and which gaskets sit on each end.']],
  [plates.air,['The 2004 G500 A.I.R. system diagram lists the air pump, its insulator and inner and outer brackets, the left and right shut-off valves and gasket, the hose, hose connector and hose joint, the changeover valve and insulator, the check valve and pressure sensor 005-153-50-28. The 2004 E500 diagram for the same M113 lists the same numbers.','Measure the pump position, hose routing and valve bosses on the heads. The role of pressure sensor 005-153-50-28 is not stated on the diagram.']],
  [plates.sensors,['The 2004 G500 powertrain-control diagram lists camshaft sensor 004-153-69-28, temperature sensor 000-905-61-02, crankshaft sensor 003-153-28-28 and knock sensor 003-153-86-28-64 for the G500.','Locate each sensor boss and connector on the engine. The diagram calls 000-905-61-02 a coolant temperature sensor while its image is labeled as an intake-air temperature sensor; confirm which it is.']],
  [plates.senders,['The 2002 G500 senders diagram lists oil level sensor 275-905-00-00 for the G500 and G55 AMG.','Measure the sensor length and its position in the oil pan.']],
  [plates.ecsMechanical03,['ECS Tuning lists oil level sender O-ring 023-997-43-48 (Victor Reinz) for the 2003 G500 5.0.','Confirm the genuine Mercedes number in the factory catalog. This is a retailer listing of an aftermarket seal under the OE number.']],
  [plates.ecsEmissions04,['ECS Tuning lists genuine Mercedes crankcase breather hoses 112-018-01-82 (left cover to intake boot) and 112-018-02-82 (left cover to connector) for the 2004 G500 5.0.','Confirm the hoses in the factory crankcase-ventilation diagram and measure their routing. This is a retailer fitment listing.']],
  [plates.ecsPopular04,['ECS Tuning lists genuine Mercedes breather hoses 112-018-03-82 (right cover to connector) and 112-018-04-82 (left cover to connector) for the 2004 G500 5.0.','ECS gives the same position for 112-018-02-82 and 112-018-04-82. Confirm each hose position in the factory diagram.']],
  [plates.belts,['The 2007 G500 belts and pulleys diagram lists belt 014-997-71-92, tensioner 112-200-09-70, idler pulley 000-202-09-19, idler cap 001-988-57-35 and idler bolt 112-990-01-12 for the 5.0L. The 2004 G500 diagram lists the same belt, tensioner, idler and cap.','The pulley centers are schematic. Measure each pulley diameter and position, and confirm the belt path.']]
]);
// Round-2 sources added to the round-1 studies.
facts.set(plates.ignition06,['The 2006 G500 ignition diagram lists spark plug 003-159-94-03-90 for the 5.0L, with the same coil, cable sets, ECM and sensors as 2004. ECS Tuning also lists 003-159-94-03-90 as a genuine plug for the 2004 G500.','Confirm the plug for 2002–2005 cars by VIN. The plug positions are schematic.']);
facts.set(plates.ecsEngine04p8,['ECS Tuning lists genuine Mercedes ignition coil screw 001-990-72-12-64 for the 2004 G500 5.0, one per coil.','This is a retailer fitment listing. Confirm the screw in the factory ignition diagram and measure its length.']);
facts.set(plates.ecsEngine03p14,['ECS Tuning lists genuine Mercedes breather hose connector 117-990-15-78 for the 2003 G500 5.0. It connects the crankcase breather hoses.','Confirm its position in the factory crankcase-ventilation diagram. This is a retailer fitment listing.']);
facts.set(plates.ecsR500Head,['ECS Tuning lists genuine Mercedes air distribution hose connector 112-018-02-09 for part-load crankcase ventilation on the 2007 R500 with the M113.971 5.0.','Same-engine source only: confirm the G500 number by VIN and locate the connector on the G500 breather layout.']);
facts.set(plates.ecsPopular04p14,['ECS Tuning lists genuine Mercedes coolant pump pulley 112-202-01-10 for the 2004 G500 5.0, without new hardware.','Measure the pulley diameter and offset. This is a retailer fitment listing.']);
facts.set(plates.ecsPopular04p26,['ECS Tuning lists genuine Mercedes poly-V belt 011-997-97-92 for the 2004 G500 up to chassis 137111, and 014-997-71-92 from chassis 137112.','Confirm the chassis split and the belt length in the factory catalog. ECS gives two different lengths for 011-997-97-92 on different pages.']);
export const claims=studies.filter(s=>!round2.includes(s)).flatMap(s=>[...bySource(s)].map(([source,ids])=>{const [fact,need]=facts.get(source);return {ids,kind:'diagram',fact,need,source};}));
const round2Facts=new Map([
  [plates.head02,['The 2002 G500 cylinder head and valves diagram lists, with G500 notes, cylinder heads 113-010-20-20 (left) and 113-010-21-20 (right), head gaskets 113-016-04-20 and 113-016-05-20, valve cover gaskets 113-016-02-21 and 113-016-03-21, front cover 112-010-07-33, piston rings 113-030-00-24, piston 113-030-28-17, connecting rod 113-030-00-20, crankshaft 113-030-05-01 (replaced by 113-030-11-01) and oil pump 113-180-01-01. The 2004 page lists the same rows.','The drawings are schematic. Measure head and gasket outlines, crank throws, rod length, piston crown shape and pump position. The diagram does not say how 113-016-02-21 differs from 112-016-02-21, which the engine-parts diagram lists for the same cover.']],
  [plates.cover02,['The 2002 G500 engine appearance cover diagram lists front cover 113-010-13-67 for the 5.0L. The G500 listing says it replaces 113-010-03-67.','Measure the cover outline and its mounting points.']],
  [plates.ecsEngine04p11,['ECS Tuning lists for the 2004 G500 5.0 the genuine timing chain guide rail pin 112-052-01-74, the oil cooler seal ring 112-184-02-61 and connecting rod bolt 112-038-00-71 (two per rod). Another ECS G500 page lists 112-184-02-61 as genuine.','Retailer fitment listings. Confirm each number in the factory catalog. The rod bolt listing is an aftermarket bolt sold under the OE number.']],
  [plates.mounting02,['The 2002 G500 engine and transmission mounting diagram lists lift brackets 112-223-03-41 (passenger side) and 112-223-04-41 (driver side) for the 5.0L.','Locate the brackets on each head and measure them.']],
  [plates.ecsPopular04p13,['ECS Tuning lists genuine Mercedes harmonic balancer securing bolt 006-990-70-04 for the 2004 G500 5.0 and says it must be replaced when the balancer is removed.','Retailer fitment listing. Confirm the bolt in the factory crankshaft diagram.']],
  [plates.engineParts02,['The 2002 G500 engine parts diagram lists oil filter housing 112-184-01-02-65, oil filter 112-180-07-10-64, filter element 000-180-26-09-90 and oil cooler 112-188-04-01 for the 5.0L. The G500 listing for 112-180-07-10-64 gives its other name as cover.','Measure the housing, cover and exchanger, and locate the oil and coolant ports.']],
  [plates.ecsMechanical03,['ECS Tuning lists for the 2003 G500 5.0 seal ring 112-184-03-61 (filter housing to oil cooler) and genuine seal ring 112-184-00-61 (filter housing to timing cover), both up to engine number 113.962 30 000200.','Confirm which rings apply after that engine number. These are retailer listings.']],
  [plates.ecsPopular04,['ECS Tuning lists oil drain plug 111-997-03-30 (14 mm, Febi) for the 2004 G500 5.0.','This is an aftermarket plug sold under the OE number. Confirm the genuine number in the factory oil-pan diagram.']],
  [plates.engineParts08,['The 2008 G500 engine parts diagram lists intake manifold 113-140-07-01 for the 5.0L, as does the 2004 G500 intake-manifold diagram. It also lists 112-010-07-33 as the timing cover.','Measure the manifold body and runner paths. The runner layout is schematic.']],
  [plates.ecsPopular04p55,['ECS Tuning lists genuine Mercedes intake manifold gasket 113-141-13-80 for the 2004 G500, two required, for cars without EGR.','Confirm which G500 builds have no EGR. This is a retailer fitment listing.']],
  [plates.throttle,['The 2004 G500 throttle body diagram lists actuator 113-141-01-25, air cleaner assembly 112-090-11-01 and filter 273-094-04-04-95 for the 5.0L. ECS Tuning gives the actuator fitment from engine number 30 205218, except 30 229091.','Measure the actuator flange, the cleaner housing and the element size. Earlier engines may use a different actuator.']],
  [plates.ecsEmissions05p5,['ECS Tuning lists vacuum hose connectors 117-078-07-81 (90-degree elbow) and 117-078-06-81 (3 mm to 7 mm) for the 2005 G500 5.0 under emissions parts.','These are aftermarket fittings sold under OE numbers. Confirm the genuine numbers and where each sits in the G500 vacuum lines.']],
  [plates.ignition,['The 2002 G500 ignition diagram lists ECM 113-153-19-91 for the G500 and ECM bracket 170-545-12-40. The 2006 G500 diagram lists both for the 5.0L.','Locate the controller and bracket in the G500 and measure them.']]
]);
for(const s of round2)claims.push(...[...bySource(s)].map(([source,ids])=>{const [fact,need]=round2Facts.get(source);return {ids,kind:'diagram',fact,need,source};}));
claims.push({ids:idsOf(heads,['left-head','right-head','left-head-gasket','right-head-gasket','left-cover-gasket','right-cover-gasket','front-cover']),kind:'diagram',fact:'The 2004 G500 cylinder head and valves diagram lists the same heads, head gaskets, valve cover gaskets and front cover with G500 notes.',need:'Measure the parts; the drawing is schematic.',source:plates.head04});
claims.push({ids:idsOf(oil,['oil-cooler']),kind:'diagram',fact:'The G500 oil cooler listing gives 112-188-04-01 for the 2002–2008 G500 5.0L, replacing 112-188-03-01.',need:'Measure the exchanger and its port positions.',source:plates.oilCooler});
// Same-engine corroboration for the secondary air parts and the breather vent hose.
claims.push({ids:idsOf(breather,['vent-hose']),kind:'diagram',fact:'The 2004 E500 air-intake diagram lists vent hose 112-018-04-82 for the M113 5.0.',need:'Confirm the G500 number by VIN; the E500 air cleaner differs from the G500 twin cleaner.',source:plates.e500Intake});
claims.push({ids:idsOf(beltDrive,['belt','tensioner','idler','idler-cap']),kind:'diagram',fact:'The 2004 G500 belts and pulleys diagram lists belt 014-997-71-92, tensioner 112-200-09-70, idler 000-202-09-19 and cap 001-988-57-35.',need:'Confirm the belt length and pulley positions.',source:plates.belts04});
