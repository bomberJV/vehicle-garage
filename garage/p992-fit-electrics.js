// 992 fit pack: electrics. Installed parts drawn onto the car.
// Scope: Electrics: control units (DME engine unit, gateway, front and rear body units, airbag unit, PCM computer, amplifier, PASM unit), horns, parking-sensor transducers, front radar if standard, antennas, earth straps, relay and fuse carriers beyond electrical.fuses, wiring harness runs. electrical.* (battery, starter, generator, fuses, cables) already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-electrics' or 'p992-fit-electrics-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// The catalogue holds no rows for horns, the airbag unit, the PCM computer, the
// amplifier, parking-sensor transducers, a front radar or antennas, so none are
// drawn. Door control units belong to the doors pack.
import {pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,x,y,z} from './mechanism-shapes.js';

const diagram=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const units=diagram('901-030','Control units: engine, gateway and chassis','https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/901-030/Control_units');
const body=diagram('901-040','Control units: body (BCM) and driver assistance','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/901-040/CONTROL_UNITS');
const fuses=diagram('902-000','Fuse box and relay plate','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/902-000/FUSE_BOX_RELAY_PLATE');
const starter=diagram('902-050','Starter and alternator','https://www.eurospares.co.uk/Porsche/992/992_(2019)/PartDiagrams/902-050/STARTER');
const engineLoom=diagram('902-080','Engine wiring harness','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/902-080/HARNESS');
const looms=diagram('902-100','Wiring harnesses','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/902-100/HARNESS');
const rearLooms=diagram('902-200','Rear wiring harnesses','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/902-200/HARNESS');
const top=diagram('811-200','Convertible top frame and electrical parts','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/811-200/TOP_FRAME');

const alu='#8f989b',case_='#3b4447',plug='#22282a',bracket='#5d676a',loom='#262c2e',braid='#7d8487',copper='#9a6f55';
const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(sub,name,description,source,parts)=>({id:'p992-fit-electrics-'+sub,name,description,source,view:'hero',internal:true,category:'service',
 parts:parts.map(p=>({...p,id:'p992-fit-electrics-'+sub+'.'+p.id}))});
const left=[0,-.30,.10],right=[0,.30,.10],up=[0,0,.30],down=[0,0,-.25],fore=[-.30,0,.08],aft=[.30,0,.08];
const wire=(r,pts,rad=.007)=>pipe(r,pts,rad,loom,6);

// A sealed control unit: case, cooling ribs or lid and plug housings on one edge.
// c is the centre, d the case size, e the axis index of the plug edge, s its side.
function unit(r,c,d,color,e,s,plugs=2,lidOn=true){
 box(r,c,d,color);
 const lid=d.map((v,i)=>i===d.indexOf(Math.min(...d))?v*.25:v*.86);
 const n=d.indexOf(Math.min(...d)),lidC=c.map((v,i)=>i===n?v+d[i]*.55:v);
 if(lidOn)box(r,lidC,lid,color==alu?'#a7afb2':'#454e51');
 const along=[0,1,2].find(i=>i!==e&&i!==n);
 for(let k=0;k<plugs;k++){
  const pc=c.map((v,i)=>i===e?v+s*(d[i]/2+.012):i===along?v+(k-(plugs-1)/2)*d[i]/plugs:v);
  box(r,pc,[0,1,2].map(i=>i===e?.024:i===along?d[i]/plugs*.8:d[i]*.7),plug);
 }
}
// A flat sheet bracket with turned-down tabs.
function plate(r,c,d,n,tabs){box(r,c,d,bracket);for(const t of tabs)box(r,plus(c,t),d.map((v,i)=>i===n?v:.022),bracket);}

// ---- Control units --------------------------------------------------------
// The DME stands on the left wall of the engine compartment, ahead of the left
// airbox and outboard of the coolant pump, on its own retainer.
const dme=[1.46,-.517,.665];
// The front body control module and gateway sit under the dashboard on the
// driver's side; the chassis unit stands at the right footwell above the right
// fuse holder. The rear units stand on the bulkhead behind the rear seats.
const bcmF=[-.55,-.585,.75],gateway=[-.58,-.18,.735],chassis=[-.62,.582,.725];
const behind=.866,bcmR=[behind,-.36,.575],topUnit=[behind,.34,.575];
const fpcu=[-1.20,.30,.60],spoilerUnit=[1.66,-.517,.735];

const controlUnits=group('units','Control units',
 'The engine, gateway, body, chassis, fuel-pump, rear-spoiler and convertible-top control units of the US 992.1 Carrera S Cabriolet, each on its own retainer or bracket.',units,[
 part('dme','Engine control unit (DME) · 992907051','The DME runs injection, ignition, boost and the electric wastegates. It stands on the left wall of the engine compartment with its plugs facing forward.',left,units,r=>unit(r,dme,[.20,.028,.15],alu,0,-1,2,false)),
 part('dme-retainer','Retainer for the engine control unit · 992907645B','A pressed bracket on spacer bushes holds the DME clear of the wheel-housing wall.',left,units,r=>plate(r,[dme[0],-.533,dme[2]],[.22,.003,.17],1,[[0,.003,.087],[0,.003,-.087]])),
 part('fuel-pump-unit','Control unit for the fuel pump · 992906093C','This unit sets the speed of the in-tank pump on demand from the DME. It sits on the tank cover beside the delivery flange in the front compartment.',up,units,r=>unit(r,fpcu,[.10,.07,.028],case_,0,-1,1)),
 part('gateway','Gateway control unit · PAB907468U','The gateway joins the car\'s data buses and the diagnostic socket. It is fixed under the dashboard on the driver\'s side, to the left of the centre tunnel.',down,units,r=>unit(r,gateway,[.10,.12,.03],case_,0,1,2)),
 part('chassis-unit','Chassis control unit (PASM) · 992910376AF','The chassis unit drives the adaptive PASM dampers for the standard suspension. It stands at the side of the right footwell under the dashboard.',right,units,r=>unit(r,chassis,[.14,.03,.10],case_,0,1,2)),
 part('chassis-retainer','Retainer for the chassis control unit · 992907113A','A sheet bracket holds the chassis unit against the right footwell side wall.',right,units,r=>plate(r,[chassis[0],.6015,chassis[2]],[.16,.005,.12],1,[[0,-.004,.062]])),
 part('bcm-front','Body control module (BCM) · PAD907063','The front body control module runs lighting, locking, wipers and the on-board power supply. It stands at the side of the driver\'s footwell, above the left fuse carrier.',left,body,r=>unit(r,bcmF,[.16,.035,.11],case_,0,1,3)),
 part('bcm-front-retainer','Retainer for the body control module (left-hand drive) · 992907114B','The left-hand-drive retainer carries the front body control module on the footwell side wall.',left,body,r=>plate(r,[bcmF[0],-.6065,bcmF[2]],[.18,.005,.13],1,[[0,.004,-.067]])),
 part('bcm-rear','Rear body control module (BCM) · 992907064BT','The rear module switches the rear lights, engine-lid release and rear power supply. It stands on the bulkhead behind the left rear seat.',aft,body,r=>unit(r,bcmR,[.028,.16,.11],case_,1,1,3)),
 part('spoiler-unit','Rear spoiler adjustment control unit · PAA907483','The North American spoiler unit raises and lowers the rear spoiler with road speed. It sits on the left wall of the engine compartment behind the DME.',left,units,r=>unit(r,spoilerUnit,[.10,.028,.07],case_,0,1,1)),
 part('top-unit','Convertible top control unit · 992959255K','The top control unit sequences the top drive, the stowage lid and the rear side windows. It stands on the bulkhead behind the right rear seat.',aft,top,r=>unit(r,topUnit,[.028,.15,.10],case_,1,-1,2))
]);

// ---- Fuse and relay carriers, earth strap ---------------------------------
// The main fuse socket sits on the battery positive, right of the battery in
// the front compartment. The right fuse holder mirrors electrical.fuses in the
// right footwell; the relay plate is clipped beneath the left fuse carrier. The
// rear fuse holder stands on the rear bulkhead beside the rear BCM.
const mainFuse=[-1.02,.145,.69],fuseR=[-.62,.56,.62],relay=[-.62,-.575,.565],fuseRear=[behind,-.165,.575];
const power=group('power','Fuse and relay carriers and earth strap',
 'The main fuse socket on the battery positive, the right and rear fuse holders, the relay plate and the alternator earth strap.',fuses,[
 part('main-fuse-socket','Main fuse socket, lower part · 992937619B','The lower part of the main fuse socket carries the high-current fuses on the battery positive, right of the battery in the front compartment.',up,fuses,r=>{box(r,mainFuse,[.08,.06,.04],case_);for(const dy of [-.018,.018])box(r,plus(mainFuse,[.044,dy,0]),[.008,.014,.016],copper);}),
 part('main-relay-plate','Relay plate, main fuse socket · 992927203','The relay plate clips onto the main fuse socket and holds the load relays for the front compartment.',up,fuses,r=>{box(r,plus(mainFuse,[0,0,.0275]),[.08,.06,.015],'#4a5356');for(const dx of [-.02,.02])box(r,plus(mainFuse,[dx,0,.04]),[.026,.026,.012],plug);}),
 part('main-fuse-cover','Main fuse socket cover · 992937132A','The hinged cover closes over the main fuse socket and its relay plate.',up,fuses,r=>box(r,plus(mainFuse,[0,0,.0575]),[.086,.066,.008],'#2f3638')),
 part('fuse-holder-right','Fuse holder, right · 992937617','The right fuse holder sits behind the side trim of the passenger footwell, mirroring the left carrier.',right,fuses,r=>{box(r,fuseR,[.148,.091,.047],case_);for(let j=0;j<6;j++)for(const s of [-1,1])box(r,plus(fuseR,[(j-2.5)*.018,s*.019,.031]),[.013,.013,.015],['#a9785c','#9fa976','#718ba8'][j%3]);}),
 part('relay-plate','Relay plate, fuse holder · 992937503','The relay plate is clipped beneath the left fuse carrier in the driver\'s footwell.',down,fuses,r=>{box(r,relay,[.13,.05,.03],case_);for(const dx of [-.04,0,.04])box(r,plus(relay,[dx,0,-.022]),[.028,.03,.014],plug);}),
 part('fuse-holder-rear','Fuse holder, rear · 992937507','The rear fuse holder protects the rear-end circuits. It stands on the bulkhead behind the rear seats, inboard of the rear body module.',aft,fuses,r=>{box(r,fuseRear,[.03,.12,.09],case_);for(let j=0;j<5;j++)for(const s of [-1,1])box(r,plus(fuseRear,[.019,(j-2)*.02,s*.02]),[.012,.013,.014],['#a9785c','#9fa976','#718ba8'][j%3]);}),
 part('alternator-earth','Ground strap, alternator · PAA971537','A short braided strap bonds the alternator case to the engine so the charging current has a clean return.',down,starter,r=>pipe(r,[[1.835,-.335,.61],[1.815,-.37,.585],[1.80,-.395,.57]],.006,braid,6))
]);

// ---- Wiring harness runs ---------------------------------------------------
const harness=group('harness','Wiring harness runs',
 'The main and sectional wiring harnesses: dashboard and passenger compartment, the front-end, lighting, bumper and fuel sections, the engine harness and the rear-axle, rear-lighting and lid sections.',looms,[
 part('dashboard','Dashboard wiring harness · PAA992003','The dashboard harness runs across under the facia from the driver\'s footwell to the passenger footwell and serves the instruments, switches and control units there.',up,looms,r=>wire(r,[[-.62,-.565,.70],[-.62,-.50,.71],[-.705,-.47,.80],[-.705,.47,.80],[-.62,.50,.71],[-.62,.567,.71]],.011)),
 part('passenger','Wiring harness, passenger compartment · PAA992001','The main cabin harness leaves the driver\'s footwell and runs back along the inside of the left sill to the bulkhead behind the rear seats.',left,looms,r=>wire(r,[[-.535,-.59,.70],[-.50,-.598,.62],[-.45,-.598,.548],[.80,-.598,.548],[.858,-.55,.56],[.858,-.44,.56]],.011)),
 part('front-end-left','Sectional wiring harness, front end, left · 992970042 Y','This section runs forward from the bulkhead along the left of the front compartment to the front end.',left,looms,r=>wire(r,[[-.705,-.585,.70],[-.80,-.50,.62],[-1.30,-.50,.62],[-1.62,-.45,.56],[-1.80,-.40,.53]])),
 part('front-end-right','Sectional wiring harness, front end, right · 992970270 Y','The right front-end section runs forward along the right of the front compartment to the front end.',right,looms,r=>wire(r,[[-.705,.582,.70],[-.80,.525,.62],[-.95,.525,.44],[-1.40,.525,.44],[-1.50,.44,.50],[-1.62,.42,.56],[-1.80,.40,.53]])),
 part('lighting-left','Sectional wiring harness, left front, lighting · 992970248 Y','The left lighting section feeds the left headlamp, running along the top of the left front compartment wall.',left,looms,r=>wire(r,[[-.62,-.53,.765],[-.80,-.50,.74],[-1.48,-.50,.74],[-1.57,-.60,.72],[-1.60,-.66,.70]])),
 part('lighting-right','Sectional wiring harness, right front, lighting · 992970242 Y','The right lighting section feeds the right headlamp along the top of the right front compartment wall.',right,looms,r=>wire(r,[[-.62,.53,.765],[-.80,.50,.75],[-1.48,.50,.75],[-1.57,.60,.72],[-1.60,.66,.70]])),
 part('bumper-left','Bumper wiring harness, left front · 992972155J','The left bumper harness runs behind the front bumper cover to the front light strip and side marker. This version is for cars without front parking sensors.',fore,looms,r=>wire(r,[[-1.80,-.40,.53],[-1.955,-.30,.505],[-1.955,-.62,.505]],.006)),
 part('bumper-right','Bumper wiring harness, right front · 992972156M','The right bumper harness runs behind the front bumper cover on the right. This version is for cars without front parking sensors.',fore,looms,r=>wire(r,[[-1.80,.40,.53],[-1.955,.30,.505],[-1.955,.62,.505]],.006)),
 part('fuel-system','Sectional wiring harness, fuel system · 992970101 Y','A short section joins the fuel-pump control unit to the pump connector on the tank delivery flange.',up,looms,r=>wire(r,[[-1.15,.33,.605],[-1.13,.34,.645],[-1.02,.34,.645],[-1.00,.34,.632]],.005)),
 part('abs-front','ABS wiring harness, front axle · 992971279','The left front wheel-speed sensor lead leaves the wheel carrier, passes the inner wheel housing and joins the front-end harness. The same number serves the right side.',left,looms,r=>wire(r,[[-1.10,-.64,.42],[-1.02,-.60,.50],[-.99,-.52,.58],[-1.00,-.50,.615]],.005)),
 part('engine','Engine wiring harness · 0PB971595S','The engine harness for the standard chassis leaves the DME, crosses over the top of the engine and drops to the right bank.',up,engineLoom,r=>wire(r,[[1.40,-.49,.735],[1.48,-.44,.80],[1.60,-.30,.815],[1.60,.30,.815],[1.64,.40,.78]],.012)),
 part('engine-bay','Sectional wiring set, engine compartment · 992970218 Y','This set carries power and signals from the rear body module through the bulkhead into the engine compartment, along the left wall to the DME.',aft,rearLooms,r=>wire(r,[[behind+.012,-.42,.56],[.95,-.48,.62],[1.25,-.48,.64],[1.28,-.49,.745],[1.36,-.50,.745]],.009)),
 part('rear-axle-left','Sectional wiring harness, rear axle, left · 992970081 Y','The left rear-axle section takes the circuits for the left rear wheel through the wheel housing.',left,rearLooms,r=>wire(r,[[.95,-.48,.62],[1.06,-.50,.56],[1.12,-.60,.545],[1.16,-.66,.53]],.006)),
 part('rear-axle-right','Sectional wiring harness, rear axle, right · 992970071 Y','The right rear-axle section takes the circuits for the right rear wheel through the wheel housing.',right,rearLooms,r=>wire(r,[[behind+.012,.42,.56],[.95,.48,.60],[1.06,.50,.56],[1.12,.60,.545],[1.16,.66,.53]],.006)),
 part('abs-rear','ABS wiring harness, rear axle · 992971286','The left rear wheel-speed sensor lead runs from the wheel carrier to the rear-axle section. The same number serves the right side.',down,rearLooms,r=>wire(r,[[1.16,-.66,.53],[1.255,-.67,.53],[1.255,-.68,.445]],.005)),
 part('rear-lighting-left','Sectional wiring harness, rear lighting, left · 992970068 Y','The left rear lighting section continues from the engine-compartment set along the left wall, above the DME, to the left tail light.',aft,rearLooms,r=>wire(r,[[1.36,-.50,.745],[1.46,-.492,.785],[1.74,-.49,.785],[1.88,-.60,.76],[1.95,-.68,.72]],.006)),
 part('rear-lighting-right','Sectional wiring harness, rear lighting, right · 992970211 Y','The right rear lighting section feeds the right tail light.',aft,rearLooms,r=>wire(r,[[1.64,.40,.78],[1.75,.52,.76],[1.88,.60,.74],[1.95,.68,.72]],.006)),
 part('lid-spoiler','Wire set, engine compartment lid and rear spoiler · 992971182C','This set runs from the spoiler control unit to the spoiler drive and the engine-lid lamps.',up,rearLooms,r=>wire(r,[[1.71,-.505,.77],[1.80,-.48,.82],[1.88,-.42,.84]],.006)),
 part('rear-bumper','Wiring set for the rear bumper · 992971174H','The rear bumper set runs across behind the rear apron to the reflectors, number-plate lamps and rear sensors.',aft,rearLooms,r=>wire(r,[[1.95,-.68,.72],[2.10,-.55,.58],[2.10,.55,.58],[1.95,.68,.72]],.006))
]);

export const groups=[controlUnits,power,harness];
export const lines=[...harness.parts.map(p=>p.id),'p992-fit-electrics-power.alternator-earth'];
export const mounts=[
 ['p992-fit-electrics-harness.abs-front','shell.fenders','the wheel-speed lead passes through a grommet in the inner wheel housing; the housing wall is drawn closed'],
 ['p992-fit-electrics-harness.rear-axle-left','shell.fenders','the rear-axle section passes through a grommet in the left inner wheel housing; the housing wall is drawn closed'],
 ['p992-fit-electrics-harness.rear-axle-right','shell.fenders','the rear-axle section passes through a grommet in the right inner wheel housing; the housing wall is drawn closed'],
];
