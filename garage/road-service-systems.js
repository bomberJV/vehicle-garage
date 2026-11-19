import {drawPorscheCompartmentLid} from './porsche-cabin.js';
import {paintChoice} from './paint-colors.js';
import {m54InstalledPoint} from './bmw-m54-installation.js';
import {drawM54FuelRail,drawM54Injectors,m54RailInlet} from './bmw-m54-fuel-rail.js';
import {e46RotorSite,drawE46Rotor,drawE46Caliper,drawE46ParkingShoes} from './e46-running-gear.js';
import {roadSystems} from './road-service-data.js';
import {path,box,plus,wheelSites,disc,caliper,drum,tankBody,sender,electricMachine,battery,roofGlass,topBows,topFabric,backlight,metal,alloy,iron,rubber,copper,fuelGold} from './road-service-geometry.js';
import {cyl,sleeve,turn} from './mechanism-shapes.js';
import {getServiceStudy} from './road-service-studies.js';
import {refineBmwFuelParts,drawBmwFuseCarrier} from './bmw-fuel-system.js';
import {baseVehicle} from './vehicle-variants.js';
const X=[1,0,0],Y=[0,1,0],Z=[0,0,1];
function component(id,name,description,offset,draw){return {id,name,description,offset,draw};}
function brakeMasterSite(p){return p.master||(p.bike?[-.49,.26,.90]:[p.engine[0]>0?-1.06:p.axles[0]+.62,-.36,.65]);}
export function drawRoadBrakeMaster(r,id){
 const p=roadSystems[id],m=brakeMasterSite(p);
 if(p.bike){
   // The road RR's remote cylindrical fluid cup is carried inboard of
   // the right clip-on, separate from the black radial master cylinder.
   const body=[-.411,.231,.900],cup=[-.426,.192,.929];
   cyl(r,body,Y,-.022,.022,.019,'#373c3e',12);
   cyl(r,body,X,-.032,.018,.012,'#484b4d',12);
   turn(r,cup,Z,[[0,.012],[.004,.016],[.029,.017],[.031,.016]],'#a49f87',{n:16});
   cyl(r,cup,Z,.031,.039,.019,'#363a3c',16);
   cyl(r,cup,Z,.039,.040,.015,'#4a4d4e',16);
   path(r,[plus(cup,[0,0,.002]),[-.423,.204,.908],body],.004,'#373c3e');
   path(r,[plus(cup,[.008,-.014,.009]),[-.418,.182,.914],[-.407,.212,.901]],.0027,'#777b7d');
   cyl(r,[.15,.17,.39],Z,-.036,.036,.014,metal);
   return;
 }
 cyl(r,m,X,.07,.125,.090,'#383d3c',16);
 cyl(r,m,X,-.064,.071,.026,alloy);
 box(r,plus(m,[.024,0,.043]),[.090,.057,.056],'#b6bda6');
 cyl(r,plus(m,[.02,0,.068]),Z,0,.014,.022,rubber,12);
}
// HR-V: the modulator sits behind the engine on the left. The right front line
// crosses above the exhaust at the firewall; both rear lines drop behind the
// transaxle and run under the floor along the sills. Routes are schematic.
function hrvBrakeLines(r,mod,axleSites){
 const line='#897d64';
 for(const c of axleSites(false)){
  const s=Math.sign(c[1]);
  const mid=[-1.18,s*.46,.44];
  path(r,s<0?[mod,[-1.16,-.40,.66],mid]:[mod,[-1.03,-.28,.86],[-1.03,.42,.86],[-1.03,.45,.50],mid],.0045,line);
  // The front hose passes under the spring seat to the caliper behind the axle.
  path(r,[mid,[-1.20,s*.62,.425],plus(c,[.10,0,.054])],.007,rubber);
 }
 for(const c of axleSites(true)){
  const s=Math.sign(c[1]),mid=[1.46,s*.50,.47];
  path(r,[mod,[-1.05,-.30,.62],[-1.00,-.30,.42],[-.95,s*.64,.42],[1.10,s*.64,.42],[1.10,s*.50,.425],[1.46,s*.50,.425],mid],.0045,line);
  // Behind the damper, the rear hose drops to the caliper.
  path(r,[mid,[1.45,s*.70,.47],plus(c,[.10,0,.054])],.007,rubber);
 }
}
// The truck's lines drop from the inner fender, pass under the bellhousing and
// run along the right of the frame below the crossmembers. Routes are schematic.
function fordBrakeLines(r,mod,axleSites){
 const drop=[mod[0],-.74,.56],over=[-1.12,-.74,.56],inside=[-1.12,-.40,.52],low=[-1.12,-.40,.33],cross=[-1.12,.40,.33],rearCross=[1.40,.40,.33];
 const line='#897d64';
 path(r,[mod,drop],.0045,line);
 for(const rear of [false,true])for(const c of axleSites(rear)){
  const side=Math.sign(c[1]),mid=rear?[c[0]+.13,side*.40,.52]:[c[0]+.13,side*.74,.56];
  if(!rear&&side<0)path(r,[drop,mid],.0045,line);
  else if(!rear)path(r,[drop,over,inside,low,cross,[-1.12,.40,.52],[-1.12,.74,.56],mid],.0045,line);
  else path(r,[drop,over,inside,low,cross,rearCross,...(side<0?[[1.40,-.40,.33]]:[]),[c[0]+.13,side*.40,.33],mid],.0045,line);
  path(r,rear?[mid,[c[0]+.10,side*.62,.58],[c[0]+.03,side*.74,c[2]+.14]]:[mid,[c[0]-.04,c[1]*.90,c[2]+.145],plus(c,[.10,0,.054])],.007,rubber);
 }
}
function brakes(id,p){
 const e46=id==='bmw325ci';
 const axleSites=rear=>e46?[-1,1].map(s=>e46RotorSite(rear,s)):wheelSites(p,rear);
 const m=brakeMasterSite(p);
 const mod=p.absSite||(p.bike?[.14,0,.55]:[m[0]-.10,m[1]+.12,m[2]-.09]);
 const parts=[];
 // Vehicles that draw their own discs and calipers with the wheels list only the hydraulics here.
 for(const rear of p.wheelBrakes===false?[]:[false,true]){
  const key=rear?'rear':'front',label=rear?'Rear':'Front',idx=rear?1:0,sites=axleSites(rear),R=p.radii[idx],n=p.calipers[idx];
  if(rear&&p.park==='drum'){
   parts.push(component('rear-drum','Rear brake drums','Each rear drum turns around a stationary backing plate. Open the drum to see its shoes, cylinder, adjuster and springs.',[.43,-.53,.18],r=>sites.forEach(c=>drum(r,c,R,Math.sign(c[1])||1))));continue;
  }
  const rotorNote=e46
   ? rear?'The 294 × 19 mm vented rear discs include a drum surface for the parking brake.':'The front discs measure 300 × 22 mm. A vent gap separates the two friction rings.'
   : p.bike&&!rear?'A disc sits on each side of the front wheel.':rear&&p.rearSolid?'This axle uses solid rotors.':'The friction faces rotate through the caliper with the wheel.';
  const caliperNote=n>1?`Opposed pistons press one pad against each face. This ${n}-piston arrangement is shown in section.`:n?'The piston acts on the inner pad. The caliper body travels on its guide pins to load the opposite pad.':'The axle and brake option determine the detailed casting and piston configuration.';
  const atSites=(r,draw)=>{for(const c of sites){
   const s=Math.sign(c[1]);
   if(e46||id.startsWith('porsche'))r.instance(key+'-'+(s<0?'left':'right'),()=>draw(c,s));else draw(c,s);
  }};
  parts.push(component(key+'-disc',label+(p.bike&&rear?' disc':' discs'),rotorNote,[rear?.31:-.30,rear?.51:-.54,.04],
   r=>atSites(r,(c,s)=>e46?drawE46Rotor(r,rear,s):disc(r,c,R,!p.bike&&!(rear&&p.rearSolid),p.drilled,p.bike))));
  parts.push(component(key+'-caliper',label+(n>1?' fixed caliper':n?' floating caliper':' brake caliper'),caliperNote,[rear?.46:-.49,rear?-.33:.39,.28],
   r=>atSites(r,(c,s)=>e46?drawE46Caliper(r,rear,s):caliper(r,c,R,n,p.bike,n>=4?(id==='porsche992scab'?'#a9473c':id==='porsche993cab'?'#2b2e30':'#525e5f'):'#626e70'))));
 }
 parts.push(component('master',p.bike?'Front brake master cylinder':'Master cylinder & reservoir',p.bike?'The right-hand lever acts on the front circuit. The rear pedal has a separate master cylinder.':'A fluid reservoir sits on the tandem cylinder at the driver’s side of the vehicle.',[-.40,0,.40],r=>drawRoadBrakeMaster(r,id)),component('abs',p.park==='drum'?'Rear anti-lock circuit':'ABS hydraulic unit',p.park==='drum'?'The rear anti-lock system acts on the rear axle brake circuit. The diagram omits option-specific valve plumbing.':'The hydraulic block modulates brake pressure. An electric pump and valve passages share the module.',[.03,.44,.36],r=>{box(r,mod,[.099,.066,.075],metal);cyl(r,plus(mod,[.065,0,0]),X,-.038,.046,.033,rubber,16);for(let j=0;j<(p.bike?3:4);j++)cyl(r,plus(mod,[-.03+j*.020,0,.034]),Z,0,.019,.006,copper,8);}),
 component('lines','Hard lines & flexible hoses','The fixed lines carry fluid along the chassis. A flexible section follows each moving wheel. Routes are schematic.',[.03,.14,-.40],r=>{
  if(id==='f350')return fordBrakeLines(r,mod,axleSites);
  if(baseVehicle(id)==='hrv')return hrvBrakeLines(r,mod,axleSites);
  if(p.brakeRoute){for(const rear of [false,true])for(const c of axleSites(rear)){const side=Math.sign(c[1]),run=p.brakeRoute(rear,side,mod,c);path(r,run.hard,.0045,'#897d64');path(r,run.hose,.007,rubber);}return;}
  if(p.lineVia){
   // Explicit routes for a crowded bay: hard line to the last point, then a hose to the caliper.
   for(const rear of [false,true])for(const c of axleSites(rear)){
    const side=Math.sign(c[1]),pts=p.lineVia[rear?'rear':'front'].map(([x,y,z])=>[x,typeof y==='number'?side*y:y[side<0?0:1],z]);
    path(r,[mod,...pts],.0045,'#897d64');path(r,[pts.at(-1),plus(c,[.10,0,.054])],.007,rubber);
   }
   return;
  }
  for(const rear of [false,true])for(const c of axleSites(rear)){
   const side=Math.sign(c[1]),mid=[c[0]+(rear?-.13:.13),side*(p.bike?.042:.38),c[2]+.10];
   path(r,[mod,[mod[0],side*(p.bike?.042:.38),mod[2]-.027],mid],p.bike?.003:.0045,'#897d64');path(r,[mid,[c[0]-.04,c[1]*.90,c[2]+.145],plus(c,[.10,0,.054])],p.bike?.004:.007,rubber);
  }
 }));
 if(p.park==='epb')parts.push(component('parking','Rear electric parking-brake motors','A small motor on each rear caliper applies the parking brake through its reduction drive.',[.31,.52,-.23],r=>wheelSites(p,true).forEach(c=>{const q=plus(c,[.11,-Math.sign(c[1])*.033,.015]);cyl(r,q,Y,-.024,.022,.034,rubber,14);box(r,plus(q,[.027,0,.016]),[.029,.048,.062],iron);} )));
 if(p.park==='shoes')parts.push(component('parking','Parking-brake shoes','A separate pair of small shoes bears on the internal drum surface of each rear disc hat.',[.37,.18,-.33],r=>axleSites(true).forEach(c=>{if(e46){drawE46ParkingShoes(r,Math.sign(c[1]));return;}for(const a of [.22,Math.PI+.22])turn(r,c,Y,[[-.012,.065],[-.012,.078],[.012,.078],[.012,.065]],'#6d635a',{start:a,sweep:2.68,n:18});})));
 return parts;
}
function fuel(id,p){
 const t=p.tank,b=p.bike,ford=p.tankShape==='midship',saddle=p.tankShape==='saddle',external=id==='porsche993cab';
 const unit=plus(t,[0,saddle?.28:p.pumpY||0,b?-.09:.065]);
 const neck=p.neck||(external?[-.948,-.661,.747]:b?plus(t,[-.02,0,.119]):[t[0]+(p.engine[0]>0?-.22:.43),p.neckSide*(ford?.90:.74),t[2]+.37]);
 const end=id==='bmw325ci'?m54RailInlet:p.fuelEnd||plus(p.engine,[0,0,.13]);
 const parts=[component('tank',ford?'Midship tank · one configuration':saddle?'Saddle fuel tank':'Fuel tank',p.fuel,[0,0,-.38],r=>tankBody(r,t,p.tankShape,p.tunnel,p.tankDims)),
  component('filler',b?'Filler cap & neck':'Filler neck',b?'The cap sits in the top of the tank ahead of the rider.':'The neck leads from the body-side filler opening to the tank.',[0,p.neckSide*.44,.27],r=>{const join=plus(t,[0,p.neckSide*(ford?.12:.23),.06]);if(p.neckPath)path(r,[neck,...p.neckPath],.025,rubber);else if(!b)path(r,[neck,[neck[0]-.04,neck[1]*.86,neck[2]-.13],join],.025,rubber);cyl(r,neck,b?Z:Y,-.014,.016,b?.048:.037,iron,18);}),
  component('sender',saddle?'Right-hand delivery flange & sender':'Fuel level sender',ford?'The float tracks the fuel level. The engine specification determines the pump and sender combination.':'A float arm pivots as the liquid level changes. The electrical sender reports that position.',[-.18,.07,.52],r=>sender(r,baseVehicle(id)==='hrv'?plus(unit,[0,0,-.03]):unit,b?.64:1)),
  component('supply','Fuel supply line',ford?'The chassis line runs inside the left frame rail and ends at the engine bay. The connection to the V8’s fuel rails and the return line are not drawn.':'The supply line runs from the tank assembly toward the engine. Its bends and clips are schematic.',[.12,-.33,-.15],r=>{const y=p.supplyY??(b?.08:.27);if(baseVehicle(id)==='hrv'){path(r,[unit,[unit[0],.31,unit[2]-.13],[-1.695,.31,.32],[-1.695,.27,.40],[-1.695,.27,.78],[-1.66,.33,.81],[-1.632,.33,.828],end],.009,'#736f5a');return;}if(p.supplyPath){path(r,[unit,...p.supplyPath,end],.009,'#736f5a');return;}path(r,[unit,[unit[0],y,ford?.33:unit[2]-.13],[end[0],y,b?.65:.33],end],b?.005:.009,'#736f5a');})];
 if(saddle)parts.push(component('left-sender','Left tank sender','The second float measures the level across the center tunnel.',[-.29,-.41,.27],r=>sender(r,plus(t,[-.035,-.28,.07]))));
 if(!ford){
  const q=p.pumpSite||(external?plus(t,[.25,-.12,-.14]):plus(unit,[.004,0,-.096]));
  parts.push(component('pump',external?'External delivery pump':'Tank delivery pump',external?'The 993 uses an electric delivery pump mounted separately from the tank.':'The electrically driven pump supplies fuel from the tank. The sender reports level independently of the pump motor.',[-.31,.32,.18],r=>{cyl(r,q,external?X:Z,-.071,.064,b?.030:.040,metal,17);sleeve(r,q,external?X:Z,-.034,-.016,b?.033:.044,.028,rubber,18);}));
  const count=b||baseVehicle(id)==='hrv'?4:id==='c63'?8:6,banked=id==='c63'||id.startsWith('porsche');
  // Some engines carry their own rails and injectors (the SL550's M278); the supply line ends at them.
  if(!p.engineOwnsRail)parts.push(component('rail',id==='porsche992scab'?'High-pressure rails & direct injectors':b?'Lower rail & port injectors':'Fuel rail & injectors',id==='porsche992scab'?'The rails deliver high-pressure fuel to injectors that open into the combustion chambers.':b?'This section follows the lower row of injectors at the four throttle ports.':'The rail supplies an injector for each cylinder. Each injector meters fuel at the inlet port.',[-.20,-.15,.36],r=>{if(id==='bmw325ci'){drawM54FuelRail(r);drawM54Injectors(r);return;}
   // Optional per-bank rail centres and injector spacing follow the real
   // cylinder pitch (993); otherwise the rails are spaced generically.
   const span=p.injectorSpan??.34;
   for(const bank of banked?[-1,1]:[0]){
    const center=p.railCenters?p.railCenters[bank<0?0:1]:plus(end,[0,bank*.17,0]),n=banked?count/2:count,alongY=baseVehicle(id)==='hrv'||b;
    const railPoint=t=>plus(center,alongY?[0,t,0]:[t,0,0]);r.rod(railPoint(-span/2-.02),railPoint(span/2+.02),.012,alloy,10);
    for(let j=0;j<n;j++){const u=railPoint((j/(n-1)-.5)*span),v=plus(u,[0,bank*.032,-.068]);r.rod(u,v,.011,iron,10);box(r,plus(u,[.014,0,-.025]),[.022,.019,.030],rubber);}
   }
  }));
 }
 return id==='bmw325ci'?refineBmwFuelParts(parts,p):parts;
}
function electrical(id,p){
 const e=p.engine,b=p.bike,B=p.battery,classic=id==='porsche993cab',starter=p.starter||plus(e,[.16,b?.02:.11,-.09]),gen=p.generator||(classic?plus(e,[.22,0,.18]):plus(e,[-.13,b?-.10:-.20,.04]));
 const hrv=baseVehicle(id)==='hrv',fuse=p.fuseSite?p.fuseSite:b?plus(B,[.09,.02,.03]):id.startsWith('porsche')?[.02,-.46,.49]:hrv?[-1.16,-.56,.82]:plus(B,[.08,.16,.025]);
 const cableStart=id==='bmw325ci'?plus(B,[.100,-.046,.115]):B;
 // The HR-V's starter is the engine's own, on the back of the bellhousing.
 const cableEnd=id==='bmw325ci'?m54InstalledPoint([.638,.25,-.024]):hrv?[-1.21,-.45,.60]:starter;
 return [component('battery','12 V battery',p.electric,[-.16,.14,.46],r=>battery(r,B,b)),component('starter','Starter motor & solenoid','The solenoid engages the starter drive with the engine’s ring gear. Opening the motor shows the armature and pinion.',[.28,.25,-.15],r=>electricMachine(r,starter,'starter',b?.67:1)),
 component('generator',b?'Generator stator & rotor':classic?'Fan-axis alternator':'Belt-driven alternator',b?'A stator winding and rotating field generate current at the engine. The regulator controls the charging supply.':classic?'The alternator shares the engine cooling fan axis. The pulley is driven by the engine belt.':'A belt drives a rotor inside the stator. The rectifier converts its output for the vehicle’s DC circuit.',[-.30,-.32,.20],r=>electricMachine(r,gen,b?'bike-gen':p.generatorKind||'alternator',b?.72:p.generatorSize||1)),
 component('fuses',b?'Fuses & distribution':id==='bmw325ci'?'Glove-compartment fuse carrier':'Fuse carrier',id==='bmw325ci'?'The carrier is behind the glovebox panel and its two clips, as shown on page 140 of the 2003 coupé manual. Fuse colors and assignments here are illustrative.':'Individual fuse links protect branch circuits. Fuse assignments and ratings are omitted from this layout.',[.12,.47,.32],r=>{if(id==='bmw325ci')return drawBmwFuseCarrier(r);box(r,fuse,b?[.072,.049,.034]:[.148,.091,.047],rubber);for(let j=0;j<(b?3:6);j++)for(const side of [-1,1])box(r,plus(fuse,[(j-(b?1:2.5))*.018,side*(b?.009:.019),b?.020:.031]),[.013,.013,.015],['#a9785c','#9fa976','#718ba8'][j%3]);}),
 component('cables','Positive feed & ground strap','A high-current feed connects the starter to the battery. A separate bond returns current through the engine and chassis.',[0,-.34,-.22],r=>{if(hrv){path(r,[plus(B,[.094,-.043,.116]),[B[0]+.094,-.60,.83],[-1.618,-.56,.80],[-1.612,-.56,.715],[-1.45,-.47,.712],[-1.30,-.455,.70],[-1.22,-.45,.64],cableEnd],.009,'#956451');path(r,[cableEnd,[-1.15,-.44,.63],[-1.08,-.44,.68]],.010,'#717b73');return;}if(p.cablePath){path(r,[cableStart,...p.cablePath,cableEnd],.009,'#956451');path(r,[cableEnd,plus(cableEnd,[.03,-.06,0]),plus(cableEnd,[.12,-.11,.018])],.010,'#717b73');return;}const y=b?.105:.36;path(r,[cableStart,plus(cableStart,[.07,0,-.02]),[B[0],y,B[2]-.09],[cableEnd[0],y,b?.54:.41],cableEnd],b?.005:.009,'#956451');path(r,[cableEnd,plus(cableEnd,[.03,-.06,0]),plus(cableEnd,[.12,-.11,.018])],.010,'#717b73');})];
}
function slidingRoof(p){const X0=p.roofX,H=p.roofZ;
 return [component('glass','Sliding glass lid','The moving glass sits in the opening and tilts about the front guides.',[.12,0,.39],r=>roofGlass(r,X0,H)),
 component('cassette','Cassette & guide rails','Side channels carry the sliding shoes inside the roof opening. The rear sections receive the panel when it retracts.',[-.14,-.16,-.21],r=>{const c0=X0-.345,c1=p.cassetteEnd??X0+.825,len=c1-c0;for(const s of [-1,1]){const c=[(c0+c1)/2,s*.49,H-.030-(p.cassetteDrop??0)];box(r,c,[len,.039,.023],metal);box(r,plus(c,[0,s*.019,.013]),[len,.009,.026],iron);}for(const x of [X0-.34,c1-.015])box(r,[x,0,H-.039-(p.cassetteDrop??0)],[.035,.98,.020],alloy);}),
 component('drive','Electric roof drive','The geared motor moves the sliding mechanism along the fixed channels.',[-.42,.17,.10],r=>{const c=[X0-.36,0,H-.067];cyl(r,c,Y,-.084,.018,.026,iron,16);box(r,plus(c,[.021,.039,0]),[.065,.054,.035],rubber);}),
 component('slides','Guide shoes & lifting links','The two sides support the moving lid. Raising its trailing edge gives the tilt position.',[.23,.32,.17],r=>{for(const s of [-1,1])for(const dx of [-.25,.22]){const c=[X0+dx,s*.472,H-.025];box(r,c,[.081,.026,.015],rubber);path(r,[c,plus(c,[.039,0,.023]),plus(c,[.073,0,.029])],.007,metal);}}),
 component('shade','Interior sliding shade','The shade travels below the glass on its own guides.',[-.26,-.29,.06],r=>{box(r,[X0,0,H-.061],[.62,.90,.013],'#787e76');box(r,[X0-.20,0,H-.069],[.035,.107,.012],iron);})];
}
function softTop(p){const modern=p.roofType==='modern',lidded=modern||p.roofType==='lidded',hydraulic=lidded;return [
 ...(lidded?[component('compartment-lid','Convertible-top compartment lid','The curved, body-colour lid covers the rear of the folded roof. The forward fabric panel remains visible.',[.34,0,.49],r=>drawPorscheCompartmentLid(r,paintChoice(r.build?.paint).hex,p.roofBody))]:[]),
 component('fabric','Fabric roof cover','The fabric follows the raised frame and folds when the frame retracts.',[.06,0,.60],topFabric),component('header','Front roof frame','The leading frame meets the windshield header.',[-.42,0,.22],r=>topBows(r,'header')),
 component('bows',modern?'Magnesium panel bows':'Folding transverse bows',modern?'Two panel bows support the fabric between the front frame and rear window.':'Transverse bows span the two side mechanisms and carry the fabric roof.',[.08,.39,.38],r=>topBows(r,'bows')),
 component('rear-window',modern?'Glass rear window & frame':'Flexible rear screen','The rear window occupies the sloping section behind the last roof bow.',[.35,0,.24],r=>{backlight(r);topBows(r,'rearframe');}),
 component('links','Side folding links','The linked arms guide the roof frame between the windshield and its storage well.',[.05,-.44,.14],r=>{for(const s of [-1,1]){const Y=s*.58;path(r,[[-.36,Y,1.197],[.08,Y,1.204],[.42,Y,1.173],[.60,Y,.94],[.79,Y,.77]],.012,iron);path(r,[[.18,Y,1.20],[.54,Y,.94],[.73,Y,.81]],.009,alloy);}}),
 component('drive',hydraulic?'Left and right hydraulic cylinders':'Electric drive, flexible shafts & gearboxes',modern?'A hydraulic cylinder on each side acts on its linkage. The windshield header uses a separate electric central lock.':hydraulic?'A hydraulic cylinder on each side acts on its linkage. An electric pump supplies both cylinders. Cylinder positions are estimated.':'The motor drives the two sides through flexible shafts and reduction gearboxes. PET plate 811-35 identifies the individual drive parts.',[.31,-.23,-.18],r=>{for(const s of [-1,1]){const a=[.82,s*.55,.74],b=[.62,s*.55,.90],c=[.53,s*.55,.99];if(hydraulic){r.rod(a,b,.023,iron,12);r.rod(b,c,.009,alloy,10);}else{box(r,a,[.10,.055,.079],iron);path(r,[[.80,s*.07,.71],[.83,s*.36,.72],a],.012,rubber);}}if(!hydraulic)electricMachine(r,[.82,0,.73],'starter',.48);})];}
const cache=new Map();
export function getRoadServiceAssemblies(vehicle){
 if(!Object.hasOwn(roadSystems,vehicle))return [];
 if(!cache.has(vehicle)){
  const p=roadSystems[vehicle],groups=[['brakes','Brakes',p.brake,brakes(vehicle,p)],['fuel','Fuel system',p.fuel,fuel(vehicle,p)],['electrical','Starting & charging',p.electric,electrical(vehicle,p)]];
  if(p.roofType)groups.push(['roof',p.roofType==='slide'?(baseVehicle(vehicle)==='hrv'?'Moonroof · EX-L':'Sliding roof'):'Cabriolet folding roof',p.roof,p.roofType==='slide'?slidingRoof(p):softTop(p)]);
  cache.set(vehicle,groups.map(([id,name,description,parts])=>({id,name,description,source:p.refs[id],parts:parts.map(c=>({...c,id:id+'.'+c.id,source:p.refs[id]})),view:'hero',category:'service',internal:true})));
 }
 return cache.get(vehicle);
}
export function drawRoadServiceAssembly(r,vehicle,id,engineOwnsM54Rail=false){
 const g=getRoadServiceAssemblies(vehicle).find(g=>g.id===id);
 // The coupe engine already owns its exact accessory and bellhousing positions.
 // Keep a single physical starter and alternator while preserving both menus.
 const shared=new Set();
 const ownsBattery=Boolean(roadSystems[vehicle]?.sharedEngine);
 if((vehicle==='bmw325ci'||baseVehicle(vehicle)==='hrv'||ownsBattery)&&id==='electrical'){
  for(const f of r.faces){
   const owner=f.part==='powertrain.starter'?'electrical.starter':f.part==='powertrain.alternator'?'electrical.generator':ownsBattery&&f.part==='powertrain.battery'?'electrical.battery':null;
   if(!owner)continue;
   if(r.inspection?.assembly==='electrical')f.part=owner;
   shared.add(owner);
  }
 }
 if(baseVehicle(vehicle)==='hrv'&&id==='fuel'){
  for(const f of r.faces){
   if(f.part!=='powertrain.fuel-rail'&&f.part!=='powertrain.injectors')continue;
   if(r.inspection?.assembly==='fuel')f.part='fuel.rail';
   shared.add('fuel.rail');
  }
 }
 for(const p of g?.parts||[]){
  if(shared.has(p.id))continue;
  if(engineOwnsM54Rail&&p.id==='fuel.rail')continue;
  r.tag(p.id,()=>p.draw(r));
 }
}
export function getRoadServiceDetail(vehicle,id){return Object.hasOwn(roadSystems,vehicle)?getServiceStudy(vehicle,roadSystems[vehicle],id):null;}
