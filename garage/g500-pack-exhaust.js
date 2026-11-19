// G500 study pack: exhaust.
// Exhaust, emissions and fuel lines: manifolds, converters, oxygen sensors, mufflers, hangers, heat shields, EVAP and fuel lines.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
//
// The register already models the manifolds, converter pipes, front and main mufflers,
// tailpipe, oxygen sensors, charcoal canister, purge valve, vent shutoff valve and tank
// pressure sensor as single parts. Their catalog numbers are left out here so that no
// part is modeled twice. This pack adds the separately numbered shields, mounts and
// emission-control parts that sit around them.
import {metal,steel,dark,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const exhaustPlate={label:'MB Parts Giant · 2002 G500 exhaust system diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/emission-control-exhaust/exhaust-system'};
const exhaustPlate2004={label:'MB Parts Giant · 2004 G500 exhaust system diagram, a later-year plate kept only for comparison: it shows converter bracket 463-492-63-41 where the 2002 G500 plate and the hanger listing give 463-492-35-41',url:'https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-g500/emission-control-exhaust/exhaust-system'};
const hangerList={label:'MB Parts Giant · G500 exhaust hangers and brackets, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-exhaust_hanger'};
const shieldList={label:'MB Parts Giant · G500 exhaust heat shields, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-exhaust_heat_shield'};
const emissionPlate={label:'MB Parts Giant · 2002 G500 emission components diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/emission-control-exhaust/emission-components'};
const emissionPlate2008={label:'MB Parts Giant · 2008 G500 emission components diagram (5.0L), a later-year plate cited for its 5.0L notes and for showing the shut-off valve gasket on both sides; the 2002 G500 plate lists the same part numbers',url:'https://www.mbpartsgiant.com/parts-list/2008-mercedes_benz-g500/emission-control-exhaust/emission-components'};
const airPumpList={label:'MB Parts Giant · G500 A.I.R. pump 000-140-37-85, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-air_injection_pump'};
const shutOffList={label:'MB Parts Giant · G500 shut-off valves, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-shut_off_valve'};
const switchoverList={label:'MB Parts Giant · G500 switchover and shut-off solenoids, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-egr_vacuum_solenoid'};
const checkValveList={label:'MB Parts Giant · G500 check valve 002-140-84-60, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-diverter_valve'};
const egrTubeList={label:'MB Parts Giant · G500 EGR pipe 112-140-01-08, 2002–2008 G500 fitment',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-egr_tube'};
const e500AirPlate={label:'MB Parts Giant · 2004 E500 A.I.R. system diagram (M113 5.0)',url:'https://www.mbpartsgiant.com/parts-list/2004-mercedes_benz-e500/emission-control-exhaust/a-i-r-system'};
export const exhaustPackSources={exhaustPlate,exhaustPlate2004,hangerList,shieldList,emissionPlate,emissionPlate2008,airPumpList,shutOffList,switchoverList,checkValveList,egrTubeList,e500AirPlate};

const src=(p,source)=>({...p,source});
const shield='#8a8a80',iron='#5f554d',rubber='#26292b',plastic='#3a3f42',zinc='#a3a69c';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);if(l>1e-6)cyl(r,a,d,0,l,rad,color,n);};
const run=(r,pts,rad,color,n=10)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,n);};
// A formed shield arching over a pipe that runs along x. The rolled edges hang down on each side.
function trough(r,c,length,rad,color){
  const h=length/2;
  turn(r,c,x,[[-h,rad],[-h+.02,rad+.012],[h-.02,rad+.012],[h,rad]],color,{n:10,start:Math.PI*1.1,sweep:Math.PI*.8});
  for(const t of [-h*.5,0,h*.5])turn(r,[c[0]+t,c[1],c[2]],x,[[-.008,rad+.012],[0,rad+.02],[.008,rad+.012]],color,{n:10,start:Math.PI*1.1,sweep:Math.PI*.8});
}
// A flat pressed plate with two stiffening ribs and down-turned edges.
function plate(r,c,w,d,color){
  block(r,c,[w,d,.012],color);
  for(const s of [-1,1])block(r,[c[0],c[1]+s*d*.22,c[2]-.012],[w*.86,.018,.012],color);
  for(const s of [-1,1])block(r,[c[0]+s*(w/2-.006),c[1],c[2]-.025],[.012,d,.05],color);
}

// ---------------------------------------------------------------- heat shields
// Study-local plan: x runs aft, y runs to the passenger side, z up.
const shieldRows=[
  src(part('front-left','Left front heat shield · 463-682-32-71-64','Driver-side front shield from the exhaust diagram. It supersedes 463-682-32-71 and screens the floor above the left pipe ahead of the converters.',[-.1,-.35,.3],r=>{plate(r,[-.62,-.42,.18],.42,.3,shield);}),shieldList),
  src(part('front-right','Right front heat shield · 463-682-36-71-64','Passenger-side counterpart of the front shield. It supersedes 463-682-36-71.',[-.1,.35,.3],r=>{plate(r,[-.62,.42,.18],.42,.3,shield);}),shieldList),
  src(part('converter-left','Left converter heat shield · 463-680-19-20','A formed shield over the left catalytic converter pipe, listed for the driver side.',[0,-.3,.4],r=>trough(r,[-.12,-.42,0],.5,.11,shield)),shieldList),
  src(part('converter-right','Right converter heat shield · 463-680-20-20','The passenger-side converter shield. The catalog lists 463-680-20-20-64 as its replacement.',[0,.3,.4],r=>trough(r,[-.12,.42,0],.5,.11,shield)),shieldList),
  src(part('muffler','Main muffler heat shield · 463-492-01-30','A broad protective plate that sits above the transverse rear muffler.',[.15,0,.45],r=>{plate(r,[.45,0,.14],.36,.62,shield);}),shieldList),
  src(part('tailpipe','Tailpipe heat shield · 463-492-11-30','A small shield next to the single tailpipe as it turns out to the left side.',[.25,-.35,.25],r=>{plate(r,[.78,-.62,.08],.2,.16,shield);turn(r,[.78,-.62,-.02],y,[[-.08,.075],[-.07,.085],[.07,.085],[.08,.075]],shield,{n:8,start:Math.PI*.15,sweep:Math.PI*.7});}),shieldList)
];
const shields=study('g500-exhaust-heat-shields','Exhaust heat shields','The G500 exhaust diagram lists six separate heat shields: a front pair, a pair over the converters, one over the main muffler and one at the tailpipe. Their outlines are schematic.',exhaustPlate,shieldRows);
shields.viewAngle=[-.6,.45];

// ---------------------------------------------------------------- mounts
function lBracket(r,c,side,color){
  block(r,[c[0],c[1],c[2]+.09],[.06,.012,.18],color);
  block(r,[c[0],c[1]-side*.05,c[2]+.18],[.06,.1,.012],color);
  for(const dz of [.04,.13])cyl(r,[c[0],c[1]-.008,c[2]+dz],y,0,.016,.011,steel,8);
}
function damper(r,c){
  sleeve(r,c,y,-.025,.025,.032,.012,rubber,14);
  cyl(r,c,y,-.03,.03,.01,steel,8);
}
const mountRows=[
  src(part('converter-bracket','Converter pipe bracket · 463-492-35-41','The bracket that carries each converter pipe from the transmission end. The fitment list gives it for 2002–2003 and 2006–2008 G500s.',[-.2,0,.35],r=>{for(const s of [-1,1])lBracket(r,[-.6,s*.32,0],s,zinc);}),hangerList),
  src(part('stay-right','Right front muffler stay · 463-492-63-41','The passenger-side stay for the front muffler. The listing also names it a converter pipe bracket.',[0,.4,.35],r=>{block(r,[-.1,.42,.1],[.32,.04,.012],zinc);block(r,[-.25,.42,.05],[.012,.04,.1],zinc);block(r,[.05,.42,.05],[.012,.04,.1],zinc);}),hangerList),
  src(part('stay-left','Left front muffler stay · 463-490-29-40','The driver-side stay for the front muffler.',[0,-.4,.35],r=>{block(r,[-.1,-.42,.1],[.32,.04,.012],zinc);block(r,[-.25,-.42,.05],[.012,.04,.1],zinc);block(r,[.05,-.42,.05],[.012,.04,.1],zinc);}),hangerList),
  src(part('bracket-right','Right front muffler bracket · 463-490-28-40','The frame-side bracket that holds the passenger front muffler.',[.15,.5,-.15],r=>lBracket(r,[.2,.55,-.2],1,metal)),hangerList),
  src(part('bracket-left','Left front muffler bracket · 463-490-27-40','The frame-side bracket that holds the driver front muffler.',[.15,-.5,-.15],r=>lBracket(r,[.2,-.55,-.2],-1,metal)),hangerList),
  src(part('dampers','Exhaust damping inserts · 381-492-00-82-64','Rubber inserts listed for both the converter pipes and the front mufflers. They isolate the exhaust from the frame. The part replaces 381-492-00-82 and 301-492-03-82.',[0,0,-.45],r=>{for(const s of [-1,1]){damper(r,[-.6,s*.4,.12]);damper(r,[.2,s*.48,-.05]);}}),hangerList),
  src(part('tailpipe-protector','Tailpipe protector · 463-492-68-30','A guard listed beside the tailpipe in the exhaust diagram.',[.3,-.4,-.2],r=>{turn(r,[.75,-.7,-.1],y,[[-.1,.06],[-.1,.07],[.1,.07],[.1,.06]],dark,{n:12,start:Math.PI*.9,sweep:Math.PI*1.2});block(r,[.75,-.7,-.03],[.04,.16,.02],dark);}),exhaustPlate)
];
const mounts=study('g500-exhaust-mounts','Exhaust brackets and mounts','The exhaust diagram lists separate brackets and stays for the converter pipes and front mufflers, a common rubber damping insert and a tailpipe protector. The bracket shapes are schematic.',exhaustPlate,mountRows);
mounts.viewAngle=[-.55,.35];

// ---------------------------------------------------------------- emission components
// Study-local view from above the engine: x runs aft, y to the passenger side, z up.
// The heads sit at y = ±.45. The air pump is shown at the front left and the EGR valve on top.
const pumpC=[-.7,-.35,.05];
const valveAt=s=>[-.2,s*.48,.25];
const teeAt=[-.45,0,.3];
const emissionRows=[
  src(part('air-pump','Secondary air pump · 000-140-37-85','An electric pump that blows fresh air into the exhaust ports during warm-up so the converters heat faster.',[-.25,-.25,0],r=>{
    cyl(r,pumpC,x,-.14,.08,.09,dark,16);cyl(r,pumpC,x,.08,.14,.1,plastic,16);
    cyl(r,[pumpC[0]+.12,pumpC[1],pumpC[2]+.1],z,0,.06,.025,plastic,10);
  }),airPumpList),
  src(part('air-pump-insulator','Air pump insulator · 112-237-00-12','A rubber mount between the air pump and its brackets.',[-.25,-.05,-.3],r=>sleeve(r,[pumpC[0],pumpC[1],pumpC[2]-.11],z,-.02,.02,.05,.018,rubber,14)),emissionPlate),
  src(part('air-pump-front-bracket','Air pump front bracket · 112-237-02-40','The forward bracket that carries the air pump. The G500 diagrams disagree on which bracket is inner and which is outer, so the same-engine E500 front and rear names are used.',[-.5,-.2,-.25],r=>{block(r,[pumpC[0]-.16,pumpC[1],pumpC[2]-.06],[.012,.16,.2],zinc);block(r,[pumpC[0]-.13,pumpC[1],pumpC[2]-.16],[.07,.16,.012],zinc);}),e500AirPlate),
  src(part('air-pump-rear-bracket','Air pump rear bracket · 112-237-01-40','The rear bracket that carries the air pump.',[.05,-.2,-.25],r=>{block(r,[pumpC[0]+.16,pumpC[1],pumpC[2]-.06],[.012,.16,.2],zinc);block(r,[pumpC[0]+.13,pumpC[1],pumpC[2]-.16],[.07,.16,.012],zinc);}),e500AirPlate),
  src(part('air-hose','Air pump hose · 112-238-00-82','The hose that carries air from the pump toward the two shut-off valves.',[-.3,-.1,.2],r=>run(r,[[pumpC[0]+.12,pumpC[1],pumpC[2]+.16],[pumpC[0]+.12,pumpC[1],.3],[teeAt[0]-.05,-.1,.3]],.018,rubber)),emissionPlate),
  src(part('hose-connector','Air hose connector · 116-276-09-29','A connector in the secondary air hose run.',[-.35,0,.4],r=>sleeve(r,[teeAt[0]-.06,-.1,.3],y,-.025,.025,.024,.012,plastic,12)),emissionPlate),
  src(part('hose-tee','Air hose T-joint · 601-078-02-45','The T-piece that divides the pump air between the left and right shut-off valves.',[-.15,0,.45],r=>{cyl(r,teeAt,y,-.07,.07,.022,plastic,12);cyl(r,teeAt,x,-.07,0,.022,plastic,12);}),emissionPlate),
  src(part('shutoff-right','Right air shut-off valve · 002-140-36-60','The passenger-side valve on the cylinder head. It opens to admit pump air into the exhaust ports and closes once the engine is warm.',[.05,.35,.2],r=>{const c=valveAt(1);cyl(r,c,z,0,.1,.06,metal,16);cyl(r,c,z,.1,.14,.035,dark,12);run(r,[[teeAt[0],teeAt[1]+.07,teeAt[2]],[c[0]-.06,.3,teeAt[2]],[c[0],c[1]-.06,teeAt[2]]],.016,rubber);}),shutOffList),
  src(part('shutoff-left','Left air shut-off valve · 002-140-35-60','The driver-side valve on the cylinder head, a mirror of the right valve.',[.05,-.35,.2],r=>{const c=valveAt(-1);cyl(r,c,z,0,.1,.06,metal,16);cyl(r,c,z,.1,.14,.035,dark,12);run(r,[[teeAt[0],teeAt[1]-.07,teeAt[2]],[c[0]-.06,-.3,teeAt[2]],[c[0],c[1]+.06,teeAt[2]]],.016,rubber);}),shutOffList),
  src(part('shutoff-gaskets','Air shut-off valve gaskets · 112-238-00-80','One gasket seals each shut-off valve to its cylinder head. The 2008 diagram lists it for both sides.',[.1,0,-.2],r=>{for(const s of [-1,1])sleeve(r,valveAt(s),z,-.006,0,.06,.03,'#aaa18c',16);}),emissionPlate2008),
  src(part('switchover-valve','Air switchover valve · 000-500-32-01','An electrically switched vacuum valve that operates the air shut-off valves. It replaces 002-540-14-97 and 002-540-70-97.',[-.1,.3,.45],r=>{const c=[-.55,.25,.45];cyl(r,c,z,0,.07,.03,dark,12);for(const dy of [-1,1])cyl(r,[c[0],c[1],c[2]+.035],y,dy*.03,dy*.06,.008,plastic,8);block(r,[c[0]-.04,c[1],c[2]+.035],[.02,.03,.03],plastic);}),switchoverList),
  src(part('switchover-insulator','Switchover valve insulator · 117-078-09-81','A rubber holder that isolates the switchover valve from its mounting.',[-.1,.45,.25],r=>sleeve(r,[-.55,.25,.45],z,-.012,.05,.04,.031,rubber,14)),emissionPlate),
  src(part('check-valve','Check valve · 002-140-84-60','A one-way valve that the G500 diagram lists with the secondary air parts. The listing also calls it a diverter valve. Its exact place in the lines is not confirmed.',[-.35,.2,.55],r=>{const c=[-.55,.1,.6];cyl(r,c,x,-.03,.03,.022,steel,12);for(const s of [-1,1])cyl(r,c,x,s*.03,s*.06,.008,plastic,8);}),checkValveList),
  src(part('egr-valve','EGR valve · 112-140-04-60','A valve that returns a metered amount of exhaust gas to the intake. Its fitment on a given US car should be confirmed by VIN.',[.3,0,.4],r=>{const c=[.35,0,.35];cyl(r,c,z,0,.05,.06,metal,16);turn(r,[c[0],c[1],c[2]+.05],z,[[0,.06],[.04,.05],[.06,.02],[.06,0]],metal,{n:16});cyl(r,c,z,-.04,0,.025,steel,10);}),emissionPlate),
  src(part('egr-gasket','EGR valve gasket · 112-142-02-80','The gasket under the EGR valve flange.',[.3,0,.05],r=>sleeve(r,[.35,0,.35],z,-.046,-.04,.05,.025,'#aaa18c',16)),emissionPlate),
  src(part('egr-pipe','EGR pipe · 112-140-01-08','The steel pipe that carries exhaust gas from the exhaust side to the EGR valve.',[.45,.25,.1],r=>run(r,[[.35,0,.31],[.35,0,.2],[.35,.3,.2],[.5,.42,.05],[.5,.5,-.1]],.016,steel)),egrTubeList),
  src(part('canister-bracket','Vapor canister bracket · 463-470-10-81','The bracket that holds the activated-charcoal canister. The same diagram lists the canister and purge valve, which are modeled separately.',[.35,.35,-.35],r=>{const c=[.75,.6,-.3];block(r,c,[.22,.14,.012],zinc);for(const s of [-1,1])block(r,[c[0]+s*.1,c[1],c[2]+.05],[.012,.14,.1],zinc);}),emissionPlate)
];
const emission=study('g500-emission-components','Secondary air and EGR components','The G500 emission diagram groups the secondary air pump and valves, the EGR valve and pipe and the canister bracket. Positions are schematic and seen from above the engine.',emissionPlate,emissionRows);
emission.viewAngle=[-.5,.55];

export const studies=[shields,mounts,emission];
export const views=new Map([
  ['exhaust.heat-shields',shields],
  ['exhaust.hangers',mounts],
  ['g500-exhaust-manifold-left.casting',emission],
  ['g500-exhaust-manifold-right.casting',emission]
]);
const ids=s=>s.groups[0].parts.map(p=>p.id);
const pick=(s,keys)=>keys.map(k=>s.id+'.'+k);
export const claims=[
  {ids:ids(shields),kind:'diagram',fact:'The 2002, 2004 and 2008 G500 exhaust system diagrams list six heat shields: front left and right, converter left and right, muffler and tailpipe. The heat shield listing gives each 2002–2008 G500 fitment.',need:'Shield outlines, fastening points and clearances to the pipes are not measured.',source:exhaustPlate},
  {ids:ids(shields),kind:'diagram',fact:'The heat shield listing names each number with its side and supersession.',need:'Confirm the current replacement numbers by VIN before ordering.',source:shieldList},
  {ids:ids(mounts),kind:'diagram',fact:'The G500 exhaust system diagram lists the converter pipe bracket, front muffler brackets and stays, the damping insert and the tailpipe protector.',need:'Bracket shapes, hole positions and the number of damping inserts per mount are not measured.',source:exhaustPlate},
  {ids:pick(mounts,['converter-bracket','stay-right','stay-left','bracket-right','bracket-left','dampers']),kind:'diagram',fact:'The G500 exhaust hanger listing gives side and year fitment for each bracket. It lists 463-492-35-41 for 2002–2003 and 2006–2008, while the 2004 diagram shows 463-492-63-41 in that position.',need:'Confirm which converter bracket a given 2002 car carries by VIN.',source:hangerList},
  {ids:ids(emission),kind:'diagram',fact:'The 2002 G500 emission components diagram lists the secondary air pump, its insulator and brackets, both shut-off valves, their gasket, the hose, connector and T-joint, the switchover valve and insulator, the check valve, the EGR valve, gasket and pipe, and the canister bracket.',need:'The 2002 rows carry no G500 note. Mounting positions, hose lengths and the EGR pipe route are not measured.',source:emissionPlate},
  {ids:ids(emission),kind:'diagram',fact:'The 2008 G500 diagram lists the same emission parts with 5.0L notes and gives the shut-off valve gasket for both sides.',need:'Confirm that each part was fitted to a 2002 US car by VIN, in particular the EGR valve.',source:emissionPlate2008},
  {ids:pick(emission,['air-pump-front-bracket','air-pump-rear-bracket']),kind:'diagram',fact:'The same-engine 2004 E500 A.I.R. diagram names 112-237-02-40 the front bracket and 112-237-01-40 the rear bracket. The G500 diagrams call them inner and outer and disagree on which is which.',need:'Confirm the G500 bracket positions on the car.',source:e500AirPlate},
  {ids:pick(emission,['air-pump','shutoff-right','shutoff-left','switchover-valve','check-valve','egr-pipe']),kind:'diagram',fact:'The G500 part listings give 2002–2008 G500 fitment for the air pump, both shut-off valves, the switchover valve, the check valve and the EGR pipe.',need:'Electrical connectors, vacuum line routing and valve mounting angles are not measured.',source:airPumpList}
];
