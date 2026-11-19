// 992 fit pack: engine. Installed parts drawn onto the car.
// Scope: Engine ancillaries bolted to the MA2 3.0-litre twin-turbo flat six: ignition coils, injectors, high-pressure fuel pump, oil filter and housing, oil cooler, oil filler and dipstick tube, cam/crank/knock/oil sensors, vacuum pump, engine and gearbox mounts, belt tensioner and idlers. The engine block, heads, intake, turbos, intercoolers, exhaust manifolds, spark plugs and the belt-driven units already drawn (engine.*, electrical.generator, p992-hvac.compressor) stay as they are.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-engine' or 'p992-fit-engine-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// Placement follows the drawn engine (porsche992-layout.js, E992 frame): crank
// centre x 1.628, z 0.502; crankcase |y| < 0.184, z 0.393 to 0.621; cylinder
// heads |y| 0.315 to 0.426, forward faces at x 1.417 (left bank) and 1.476
// (right bank, 59 mm aft); spark plugs lie across the heads at z 0.502. Cylinders
// 1-3 are the right bank, 4-6 the left. Where Porsche lists several identical
// units under one number (six coils, four camshaft senders), they share one part.
// No catalogue page the garage holds lists a vacuum pump, engine mount rubbers,
// belt tensioner or idler pulleys, so none are drawn.
import {barrel,pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,x,y,z} from './mechanism-shapes.js';
import {E992} from './porsche992-layout.js';

const page=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const crankcase=page('101-100','Crankcase','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/101-100/CRANKCASE');
const crankshaft=page('102-000','Crankshaft, connecting rods and flywheel','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/102-000/CRANKSHAFT');
const heads=page('103-000','Cylinder head, head gasket and valve cover','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/103-000/CYLINDER_HEAD');
const headParts=page('103-020','Cylinder head individual parts, sealing plugs and sensors','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/103-020/CYLINDER_HEAD');
const cams=page('103-100','Camshafts and camshaft adjusters','https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/103-100/Camshaft_camshaft_adjuster_unit');
const sump=page('104-050','Oil sump','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/104-050/OIL_PAN');
const filter=page('104-100','Oil filter','https://eurospares.co.uk/Porsche/992/2019/PartDiagrams/104-100/OIL_FILTER');
const injection=page('107-000','Injection system, high-pressure pump and injectors','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/107-000/INJECTION_SYSTEM');
const carrier=page('306-000','Mounting parts for engine and transmission','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/306-000/MOUNTING_PARTS_FOR_ENGINE_AND');

const black='#2b3134',plastic='#3d474a',alloy='#8e9a9b',cast='#6c7778',steel='#9aa5a6',rubber='#313a3e',shield='#a7aeac',brass='#8f7d5c';
const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(sub,name,description,source,parts)=>({id:'p992-fit-engine-'+sub,name,description,source,view:'hero',internal:true,category:'service',
  parts:parts.map(p=>({...p,id:'p992-fit-engine-'+sub+'.'+p.id}))});
const sides=[-1,1];
// Forward face of each cylinder head and the spark-plug stations of each bank.
const headFront=s=>s<0?1.417:1.476;
const plugX=s=>[0,1,2].map(n=>headFront(s)+.059+.118*n);
const C=E992.z;

// Ignition, valve timing and engine sensors.
const ignition=group('ignition','Ignition, camshaft control and engine sensors',
 'Six pencil coils fire the plugs across the two cylinder heads. Solenoids and senders at the forward ends of the heads control and read the four camshafts. Knock and crankshaft sensors report to the engine control unit.',heads,[
 part('coils','Ignition coils, one per cylinder · 0PB905093F','Each coil sits on the outer end of its spark plug and steps 12 volts up to the firing voltage. Porsche lists the same coil for all six cylinders.',[0,0,-.20],heads,r=>{
  for(const s of sides)for(const px of plugX(s)){
   cyl(r,[px,s*.468,C],y,0,s*.012,.012,rubber,8);
   box(r,[px,s*.490,C-.012],[.026,.020,.024],black);
   box(r,[px+.016,s*.490,C-.012],[.008,.012,.014],plastic);
  }
 }),
 part('cam-solenoids','Camshaft adjuster solenoids · 0PB109259C','Four magnets on the forward end faces of the heads drive the central valves of the inlet and exhaust camshaft adjusters. The upper one on each head serves the inlet camshaft.',[-.24,0,0],cams,r=>{
  for(const s of sides)for(const h of [.053,-.057]){
   const c=[headFront(s),s*.355,C+h];
   cyl(r,c,x,-.030,0,.021,black,12);box(r,plus(c,[-.020,s*.026,0]),[.016,.014,.018],plastic);
  }
 }),
 part('cam-senders','Camshaft impulse senders · PAC907601','A Hall sender beside each camshaft adjuster reads the position of its camshaft. The four senders share one Porsche number.',[-.24,0,.10],headParts,r=>{
  for(const s of sides)for(const yy of [.330,.385]){
   const c=[headFront(s),s*yy,C];cyl(r,c,x,-.024,0,.009,black,8);box(r,plus(c,[-.026,0,0]),[.010,.016,.012],plastic);
  }
 }),
 part('valve-lift','Valve-lift switching actuators · 0PB109625','One actuator on top of each head switches the inlet valves between the short and long cam profiles of VarioCam Plus.',[0,0,.22],headParts,r=>{
  for(const s of sides){const c=[s<0?1.535:1.594,s*.405,.597];cyl(r,c,z,0,.030,.016,black,10);box(r,plus(c,[0,0,.036]),[.024,.020,.012],plastic);}
 }),
 part('knock','Knock sensors · 0PB905377C','A piezo sensor bolted to each side of the crankcase, below the cylinders, hears detonation so the control unit can retard the ignition on that bank.',[0,0,-.18],crankcase,r=>{
  for(const s of sides){const c=[s<0?1.535:1.594,s*.184,.420];cyl(r,c,y,0,s*.014,.016,black,10);box(r,plus(c,[0,s*.020,-.006]),[.014,.010,.012],plastic);}
 }),
 part('crank-sensor','Crankshaft speed sensor · 992906401A','This inductive sender reads the trigger wheel at the flywheel end of the crankshaft for engine speed and position.',[-.10,0,-.22],crankshaft,r=>{
  const c=[1.452,.080,.393];cyl(r,c,z,-.026,0,.010,black,8);box(r,plus(c,[0,0,-.032]),[.022,.016,.012],plastic);
 })
]);

// Lubrication: the oil-conducting housing with its filter and heat exchanger
// under the crankcase, the sump sensor and shields, and the filler.
const housing=[1.700,-.060,.365];
const fillerTop=[1.645,-.255,.720],neck=[1.640,-.255,.845];
const oil=group('oil','Oil filtration, cooling and filling',
 'The oil-conducting housing under the crankcase carries the filter and the oil-to-coolant heat exchanger. A filler tube rises on the left of the engine to the cap under the rear lid.',filter,[
 part('housing','Oil-conducting housing with heat exchanger · 0PB115401G','Bolted under the crankcase, this housing routes pump oil through the filter and the oil-to-coolant heat exchanger before it reaches the bearings.',[0,0,-.24],filter,r=>{
  box(r,housing,[.150,.110,.055],cast);
  for(let i=0;i<5;i++)box(r,[1.585,-.060,.388-.010*i],[.075,.090,.006],i%2?'#7d8889':alloy);
  box(r,[1.585,-.060,.3395],[.080,.096,.005],cast);
 }),
 part('filter','Oil filter housing and cartridge · 0PB115403','The filter hangs from the oil-conducting housing and unscrews downward from under the car for service.',[0,0,-.32],filter,r=>{
  const c=[1.730,-.060,.3375];cyl(r,c,z,-.070,0,.038,'#40494c',16);cyl(r,c,z,-.082,-.070,.030,black,12);
 }),
 part('pressure-sender','Oil temperature and pressure sender · 0PB906054','Screwed into the side of the oil-conducting housing, it reports oil temperature and pressure to the control unit.',[0,-.20,-.20],filter,r=>{
  const c=[1.660,-.115,.365];cyl(r,c,y,0,-.022,.011,steel,8);box(r,plus(c,[0,-.032,0]),[.020,.016,.020],black);
 }),
 part('level-sensor','Oil level sensor · 95860616011','A thermal sensor in the floor of the sump measures the oil level; the 992 has no dipstick.',[0,0,-.26],sump,r=>{
  const c=[1.580,.080,.393];cyl(r,c,z,-.022,0,.028,black,14);box(r,plus(c,[.034,0,-.012]),[.020,.016,.014],plastic);
 }),
 ...sides.map(s=>part(s<0?'shield-left':'shield-right',`${s<0?'Left':'Right'} sump heat insulation · ${s<0?'0PB115821A':'0PB115822A'}`,'A pressed heat shield under the side of the sump keeps radiant heat from the exhaust off the oil.',[0,s*.20,-.18],sump,r=>{
  box(r,[1.620,s*.150,.388],[.320,.060,.004],shield);box(r,[1.620,s*.182,.374],[.320,.004,.030],shield);
 })),
 part('filler-tube','Oil filler tube · 0PB115301A','The rigid filler tube leaves the left of the crankcase between the cylinders and the head and rises past the intake runners.',[-.06,-.24,.10],filter,r=>{
  pipe(r,[[1.653,-.300,.572],[1.650,-.268,.640],fillerTop],.016,cast,10);
 }),
 part('filler-bracket','Bracket, oil filler tube · 0PB115641','A small bracket holds the filler tube to the top of the left cylinder head.',[0,-.30,.06],filter,r=>{
  box(r,[1.653,-.336,.601],[.030,.040,.006],steel);box(r,[1.653,-.317,.592],[.030,.006,.012],steel);
 }),
 part('filler-hose','Engine oil filler hose · 992115310A','The flexible filler hose links the tube on the engine to the filler neck under the rear lid, so the engine can move on its mounts.',[0,-.24,.16],filter,r=>{
  pipe(r,[plus(fillerTop,[0,0,-.010]),[1.643,-.255,.780],neck],.019,rubber,10);
 }),
 part('cap','Oil filler sealing cap · 9P1115423B','The cap seals the top of the filler; it is the one oil part reached through the rear lid.',[0,0,.26],filter,r=>{
  cyl(r,neck,z,0,.014,.027,black,14);box(r,plus(neck,[0,0,.019]),[.034,.008,.010],black);
 })
]);

// High-pressure fuel: one camshaft-driven pump at the rear of the right head
// feeds a line to each rail; the low-pressure line comes forward across the
// flywheel end of the crankcase.
const pump=[1.833,.345,.545];
const fuel=group('fuel','High-pressure fuel supply',
 'One high-pressure pump on the rear of the right cylinder head feeds a separate line to each fuel rail. A pressure sensor on each line closes the control loop. The low-pressure line from the tank supply reaches the pump past the front of the crankcase.',injection,[
 part('pump','High-pressure fuel pump · 0PB127025A','A camshaft lobe drives the plunger of this pump. It raises fuel from the tank supply pressure to the 200 bar or more the direct injectors need.',[.22,.18,0],injection,r=>{
  cyl(r,pump,x,0,.040,.031,alloy,14);cyl(r,pump,x,.040,.062,.024,cast,12);box(r,plus(pump,[.030,0,.030]),[.026,.022,.020],plastic);
 }),
 part('hp-line-right','High-pressure fuel line, cylinders 1-3 · 0PB127501F','A steel line runs from the pump outlet to the rear end of the right fuel rail.',[.18,.12,.10],injection,r=>{
  pipe(r,[plus(pump,[.062,0,.010]),[1.900,.300,.578],[1.845,.250,.585],[1.810,.215,.610],[1.790,.205,.632]],.004,steel,6);
 }),
 part('hp-line-left','High-pressure fuel line, cylinders 4-6 · 0PB127509H','The second line crosses behind the crankcase from the pump to the rear end of the left fuel rail.',[.20,-.12,.10],injection,r=>{
  pipe(r,[plus(pump,[.062,0,-.006]),[1.905,.290,.560],[1.880,.180,.580],[1.880,-.150,.580],[1.845,-.193,.585],[1.805,-.198,.615],[1.790,-.205,.632],[1.740,-.205,.632]],.004,steel,6);
 }),
 part('hp-sensors','Fuel pressure sensors, high-pressure lines · 992906051','One sensor on each high-pressure line measures rail pressure for the injection control. Porsche lists the same sensor for both banks.',[.20,0,.14],injection,r=>{
  for(const [c,d] of [[[1.900,.300,.578],-1],[[1.880,-.050,.580],1]]){cyl(r,c,z,d*.004,d*.026,.010,steel,8);box(r,plus(c,[0,0,d*.034]),[.018,.018,.014],black);}
 }),
 part('lp-line','Low-pressure fuel line with pressure sensor · 0PB127503B','The engine-side low-pressure line picks up fuel from the tank supply at the front of the engine and carries it past the crankcase to the high-pressure pump.',[-.10,.20,.10],injection,r=>{
  pipe(r,[[1.405,-.205,.618],[1.414,-.150,.600],[1.414,.265,.600],[1.450,.265,.575],[1.845,.265,.575],[1.848,.320,.522],plus(pump,[.015,0,-.032])],.005,steel,6);
 }),
 part('lp-sensor','Fuel pressure sensor, low-pressure side · PAB906054B','This sensor on the low-pressure line lets the control unit adjust the tank pump to what the high-pressure pump needs.',[0,.20,.14],injection,r=>{
  const c=[1.600,.265,.575];cyl(r,c,z,.004,.024,.009,steel,8);box(r,plus(c,[0,0,.030]),[.016,.016,.010],black);
 })
]);

// Drive end and gearbox carrier.
const drive=group('drive','Crankshaft damper and gearbox carrier',
 'The vibration damper pulley drives the poly-V belt in the plane of the alternator and A/C compressor pulleys behind the engine. Under the front of the manual transaxle, a carrier bolted to the body takes the gearbox side member.',carrier,[
 part('damper','Vibration damper pulley · 0PB105289D','Bolted to the rear end of the crankshaft, the damper pulley drives the poly-V belt and absorbs torsional vibration of the crankshaft.',[.30,0,0],crankshaft,r=>{
  const c=[1.862,0,C];cyl(r,c,x,0,.065,.034,cast,12);cyl(r,c,x,.065,.091,.086,cast,20);
  for(const d of [.069,.076,.083])cyl(r,c,x,d,d+.003,.088,'#59656a',20);
 }),
 part('carrier','Transmission carrier, manual gearbox · 992399231A','This cross carrier under the front end of the manual transaxle is bolted to the body and holds the gearbox side member.',[0,0,-.24],carrier,r=>{
  box(r,[.995,0,.349],[.034,.400,.026],cast);
  for(const s of sides)box(r,[.995,s*.185,.376],[.034,.030,.028],cast);
 }),
 part('side-member','Side member, manual gearbox · 992399107B','Bolted under the front of the gearbox case, the side member rests on the transmission carrier through its rubber bush.',[0,0,-.16],carrier,r=>{
  box(r,[.995,0,.383],[.044,.110,.016],alloy);cyl(r,[.995,0,.362],z,0,.013,.020,rubber,12);
 })
]);

export const groups=[ignition,oil,fuel,drive];
export const lines=['p992-fit-engine-oil.filler-tube','p992-fit-engine-oil.filler-hose','p992-fit-engine-fuel.hp-line-right','p992-fit-engine-fuel.hp-line-left','p992-fit-engine-fuel.lp-line'];
export const mounts=[
  ['p992-fit-engine-drive.side-member','drivetrain.gearbox','the side member is bolted to the underside of the gearbox case at its forward end'],
];
