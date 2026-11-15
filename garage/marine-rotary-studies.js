import {TAU,part,cyl,sleeve,turn,gear,steel,metal,gold,copper,dark,x,y,z} from './mechanism-shapes.js';
import {mk,bladeRow,seaRefs} from './marine-engine-studies.js';
const o=[0,0,0],cold='#789ca3',hot='#ad7556';
// The default machinery camera looks toward the negative y side; keep the rear half of the casing.
const shell=(r,profile,color)=>turn(r,o,x,profile,color,{start:4.22,sweep:Math.PI*1.10,n:24});
const shaft=(r,start,end,rad=.086)=>cyl(r,o,x,start,end,rad,metal);
const jetSource={label:'HamiltonJet · waterjet sections and parts',url:'https://propulsionhydrojet.com/wp-content/uploads/2019/03/HJ-Designers-Manual-Eng-2013-HQ-Print-1.pdf'};
function vaneStage(r,at,inner,outer,count,fixed,phase,dir=1){
  bladeRow(r,o,x,at,inner,outer,count,fixed?cold:gold,fixed?0:TAU*phase,dir*.31);
  if(fixed)sleeve(r,o,x,at-.022,at+.028,outer+.025,outer,steel,26);
  else cyl(r,o,x,at-.06,at+.055,inner+.012,hot,24);
}
export function screwBlade(r,c,rad,angle,color=gold){
  const section=(u,v)=>{const a=angle+.40*u+v*(.13+.38*Math.sin(Math.PI*u)),rr=rad*(.17+.83*u);return [c[0]+rad*(v*(.40-.20*u)-.12*u),c[1]+rr*Math.cos(a),c[2]+rr*Math.sin(a)];};
  const p=[[0,-.87],[.33,-1],[.73,-.74],[.96,-.25],[1,.18],[.91,.70],[.55,1],[.20,.94],[0,.65]],ctr=section(.53,0);
  for(let i=0;i<p.length;i++)r.polygon([ctr,section(...p[i]),section(...p[(i+1)%p.length])],color,false);
}
function jetStudy(steerable){
 const name=steerable?'Steering waterjet':'Booster waterjet';
 const parts=[
   part('intake','Hull intake and rising duct','Water enters through a bottom opening and turns toward the closely fitted impeller. The section removes a wall facing the observer.',[-.76,0,-.31],r=>{
     const stations=[[-1.18,-.47,.35,.18],[-.94,-.37,.34,.235],[-.70,-.20,.32,.28],[-.50,-.065,.31,.30],[-.29,0,.30,.30]];
     for(let j=1;j<stations.length;j++)for(let i=0;i<18;i++){const p=(s,t)=>[s[0],s[2]*Math.cos(t),s[1]+s[3]*Math.sin(t)],a=Math.PI/2+i*Math.PI/18,b=a+Math.PI/18;r.polygon([p(stations[j-1],a),p(stations[j],a),p(stations[j],b),p(stations[j-1],b)],cold,false);}
   }),
   part('shaft','Impeller shaft','The input shaft enters from forward. Its rotating hub carries the impeller.',[-.84,0,.18],r=>shaft(r,-1.16,.18,.063)),
   part('impeller','Pump impeller','The rotating blades add energy to the water. Their outer tips pass close to the stationary wear surface.',[.10,-.66,.12],(r,p)=>{vaneStage(r,-.13,.115,.287,7,false,p);turn(r,o,x,[[-.37,0],[-.30,.083],[-.09,.13],[.04,.103],[.12,.076]],gold);}),
   part('liner','Pump casing and wear surface','A close-fitting circular wall surrounds the tips. The opening here exposes the impeller and the stationary row behind it.',[0,.70,.37],r=>shell(r,[[-.32,.30],[-.32,.343],[.33,.343],[.33,.30],[-.32,.30]],steel)),
   part('stator','Straightening vanes','These vanes remain stationary. They turn the swirling discharge from the impeller back toward the jet axis.',[.15,.56,-.36],r=>vaneStage(r,.235,.082,.30,9,true,0,-1)),
   part('nozzle','Discharge nozzle','A converging passage accelerates the stream as it leaves the stern.',[.92,0,.17],r=>shell(r,[[.34,.303],[.34,.337],[.84,.222],[.84,.189],[.34,.303]],cold))
 ];
 if(steerable)parts.push(part('steering','Steering nozzle and pivots','The discharge nozzle can turn on its pivots to direct the jet sideways.',[.55,0,-.72],r=>{
   turn(r,o,x,[[.81,.228],[.83,.253],[1.08,.222],[1.08,.182],[.81,.228]],dark,{start:4.22,sweep:Math.PI*1.22});for(const s of [-1,1])cyl(r,[.845,0,s*.225],z,-.034,.034,.043,gold,12);
 }));
 return mk(steerable?'marine-steerjet':'marine-boosterjet',name,'Follow the water from the low hull intake, through the turning impeller and fixed stator, to the stern nozzle. Blade counts illustrate the pump section.',jetSource,parts,'Watch the impeller turn inside the fixed casing. The stator and discharge nozzle stay still.');
}
function turbineStudy(steam){
 const id=steam?'marine-steamturbine':'marine-gasturbine';
 const parts=[part('casing','Sectioned casing','The casing surrounds the blade rows. The side facing the observer has been removed to reveal the rotor and stationary vanes.',[0,.78,.47],
  r=>shell(r,[[-1,.35],[-1,.40],[-.47,.38],[0,.33],[.45,.42],[.96,.55],[.96,.50],[.45,.36],[0,.28],[-.47,.32],[-1,.35]],steel)),
  part('shaft','Rotor shaft and journals','The blades and discs transfer torque to the shaft. The enlarged end journals locate the rotor in its bearings.',[-.75,0,-.14],r=>{shaft(r,-1.18,1.2);for(const t of [-.91,.96])sleeve(r,o,x,t,t+.11,.134,.082,gold,18);}),
  part('fixed','Nozzle and stator rows',steam?'Fixed nozzles direct steam into the moving blades at each turbine stage.':'Fixed vanes redirect flow between rows of rotating compressor and turbine blades.',[0,0,.75],r=>{
    for(let i=0;i<6;i++){const pos=-.81+i*.305;if(!steam&&i===3)continue;const rad=steam?.25+i*.052:i<3?.355-i*.027:.30+(i-3)*.083;vaneStage(r,pos,.13,rad,14,true,0,-1);}
  })
 ];
 if(!steam)parts.push(part('compressor','Compressor rotor','The rotating front stages raise the pressure of the intake air before it enters the combustor.',[-.56,-.51,.28],(r,p)=>{for(let i=0;i<3;i++)vaneStage(r,-.69+i*.305,.145,.345-i*.027,14,false,p);}),
  part('combustor','Combustor liner','Air enters the combustion section after the compressor. Hot gas leaves toward the turbine. The liner is shown in section.',[0,-.62,.35],r=>shell(r,[[-.02,.17],[.02,.255],[.22,.272],[.31,.185],[.28,.16]],hot)));
 parts.push(part('turbine',steam?'Expanding steam stages':'Turbine wheel stages',steam?'As the steam expands, the later blade rows have more flow area. The exhaust runs to the condenser.':'Energy in the hot gas turns the turbine wheels. The power turbine drives the central waterjet through reduction gearing.',[.58,-.54,.15],(r,p)=>{
   const n=steam?6:2;for(let j=0;j<n;j++){const i=steam?j:j+4;vaneStage(r,-.69+i*.305,.136,steam?.25+i*.052:.30+(i-3)*.083,17,false,p);}
 }));
 return mk(id,steam?'Geared steam turbine section':'Azzam gas-turbine section',steam?'Steam from the boilers expands through fixed nozzles and rotating blade rows. The simplified stage train exposes how shaft power reaches the reduction gear.':'The two center propulsion lines draw power from gas turbines. This section follows air through compression, combustion and expansion. Stage counts and shaft architecture are illustrative.',steam?seaRefs.steam:seaRefs.azzam,parts,'The gold wheels turn with the rotor. Watch the stationary guide rows between them.');
}
function electricStudy(){
 return mk('marine-motor','Brushless thruster motor','An energized stator drives a central rotor. This section illustrates the working principle of Alvin’s electric thrusters. Magnet, winding and pole geometry are representative.',seaRefs.alvin,[
   part('case','Motor housing and end plate','The housing locates the stator and supports the end bearings.',[0,.67,.34],r=>shell(r,[[-.62,.31],[-.62,.38],[.46,.38],[.46,.31],[-.62,.31]],steel)),
   part('stator','Stator iron and windings','Coils sit around the stationary iron core. Their changing magnetic field exerts torque on the rotor.',[0,0,.77],r=>{
     for(let i=0;i<10;i++){const t=i*TAU/10,pt=[0,.264*Math.cos(t),.264*Math.sin(t)];turn(r,pt,x,[[-.45,.039],[-.39,.06],[.25,.06],[.31,.039]],copper,{n:10});}
   }),
   part('rotor','Rotor and shaft','The central rotor transfers torque directly into the shaft.',[-.72,-.20,.20],(r,p)=>{shaft(r,-.84,.80,.06);cyl(r,o,x,-.43,.30,.192,dark);for(let i=0;i<8;i++){const a=TAU*(i/8+p);turn(r,o,x,[[-.43,.191],[-.43,.204],[.30,.204],[.30,.191]],i%2?hot:cold,{n:3,start:a,sweep:.60});}}),
   part('bearings','Shaft bearings','The bearing races locate the rotating shaft at each end of the motor.',[.71,0,.41],r=>{for(const at of [-.56,.42])sleeve(r,o,x,at,at+.071,.117,.060,gold);}),
   part('prop','Propeller and hub','The propeller pushes water along the thruster axis. Reversing thrust gives a force in the opposite direction.',[.87,-.14,-.33],(r,p)=>{cyl(r,o,x,.72,.88,.095,steel);for(let i=0;i<3;i++)screwBlade(r,[.79,0,0],.41,TAU*(p+i/3));})
 ],'The shaft, rotor and propeller turn together while the copper windings stay fixed.');
}
function gearStudy(){
 return mk('marine-reduction','Marine reduction gear','A smaller input gear drives a larger wheel on a parallel shaft. This cutaway uses one illustrative 2:1 pair to show the speed change.',seaRefs.araho,[
   part('foot','Housing floor and supports','Machined bearing supports align the two shafts and take the gear reaction into the foundation.',[0,.51,-.53],r=>{r.box(-.61,-.68,-.48,.64,.79,-.40,steel);for(const xx of [-.43,.39])for(const yy of [-.29,.31])r.box(xx-.056,yy-.13,-.41,xx+.056,yy+.13,-.025,dark);}),
   part('pinion','Input shaft and pinion','The smaller gear turns with the engine input. One input revolution advances the larger wheel by half a turn in this example.',[-.7,-.24,.35],(r,p)=>{const c=[0,-.29,0];cyl(r,c,x,-.76,.54,.068,metal);gear(r,c,x,-.118,.118,.22,.22,12,gold,TAU*p);}),
   part('wheel','Output shaft and bull gear','The output wheel has twice as many teeth. It turns in the opposite direction at half the input speed.',[.7,.28,.34],(r,p)=>{const c=[0,.315,0];cyl(r,c,x,-.55,.81,.09,metal);gear(r,c,x,-.12,.12,.44,.44,24,steel,Math.PI/24-TAU*p/2);})
 ],'Follow a tooth on the gold pinion. The larger gear turns more slowly on the output shaft.');
}
function steamBoiler(){
 return mk('marine-boiler','Oil-fired water-tube boiler','Seawise Giant’s two boilers raised steam for the main turbine. This cutaway follows the water and flue-gas sides of a representative marine water-tube boiler.',seaRefs.steam,[
   part('setting','Furnace casing and floor','An open front and side reveal the tube banks running beside the combustion space.',[0,.79,-.16],r=>{r.box(-.65,-.58,-.48,.68,.54,-.40,dark);r.box(-.64,-.56,-.40,.63,-.50,.80,steel);r.box(.59,-.48,-.40,.65,.50,.80,steel);}),
   part('drum','Upper steam drum','Water and steam separate in the upper drum. Steam leaves through an upper connection to the next section.',[0,0,.8],r=>{turn(r,[0,0,.64],x,[[-.64,0],[-.62,.14],[-.52,.22],[.52,.22],[.62,.14],[.64,0]],metal);cyl(r,[.25,0,.64],z,.17,.32,.057,copper);}),
   part('headers','Lower water headers','The tubes meet the lower headers near the bottom of the furnace.',[-.45,0,-.50],r=>{for(const sy of [-.40,.40])cyl(r,[0,sy,-.25],x,-.57,.57,.095,steel);}),
   part('tubes','Water-tube banks','Water and steam flow inside parallel tubes while hot combustion gas passes outside them.',[.24,-.76,.17],r=>{for(let j=0;j<13;j++)for(const s of [-1,1]){const xx=-.49+j*.081;r.rod([xx,s*.40,-.22],[xx,s*.31,.30],.018,copper,7);r.rod([xx,s*.31,.30],[xx,s*.10,.59],.018,copper,7);}}),
   part('burner','Oil burner throat','The burner admits fuel and combustion air to the furnace, on the gas side of the tube walls.',[-.76,-.12,.04],r=>turn(r,[0,0,.03],x,[[-.81,.08],[-.65,.12],[-.49,.15],[-.44,.10],[-.74,.05]],dark))
 ]);
}
function shaftStudy(src){
 return mk('marine-shaft','Shaft line and stern bearing','The inboard coupling turns the shaft. A stern-tube bearing supports it where it passes through the hull, and the propeller pushes water astern.',src,[
   part('shaft','Propeller shaft','The shaft transmits torque along its length from the coupling to the hub.',[-.52,0,.43],(r,p)=>{
     shaft(r,-1.16,.94);
     const a=p*TAU,mark=[0,.086*Math.cos(a),.086*Math.sin(a)];
     cyl(r,mark,x,-.84,-.62,.007,gold,6);
   }),
   part('flange','Coupling flange','The flange forms the inboard connection to the engine or reduction gear.',[-.78,0,0],(r,p)=>{cyl(r,o,x,-1.06,-.94,.23,steel);for(let i=0;i<8;i++){const a=TAU*(i/8+p);cyl(r,[0,.169*Math.cos(a),.169*Math.sin(a)],x,-1.08,-1.05,.022,i===0?copper:gold,6);}}),
   part('bearing','Stern-tube and bearing liner','A liner carries the shaft inside a rigid tube. The facing half is cut away to show the running surface.',[0,-.64,.17],r=>{shell(r,[[-.45,.102],[-.45,.186],[.45,.186],[.45,.102],[-.45,.102]],steel);shell(r,[[-.42,.085],[-.42,.10],[.43,.10],[.43,.085]],gold);}),
   part('screw','Propeller blades and boss','The blades rotate together with the hub. This blade pattern is illustrative.',[.92,0,-.10],(r,p)=>{turn(r,o,x,[[.68,.085],[.75,.14],[.94,.13],[1.07,0]],gold);for(let i=0;i<5;i++)screwBlade(r,[.82,0,0],.55,TAU*(i/5+p),i===0?'#dbc488':gold);})
 ],'A marked propeller blade turns around the same centerline as the shaft.');
}
function battery(){
 return mk('marine-battery','Alvin battery bank','Two lead-acid banks supply Alvin’s electrical system. Each bank is rated at 120 volts. A single enlarged cell shows the alternating plates.',seaRefs.alvin,[
   part('box','Bank and cell casing','The battery pack groups cells into a single electrical source. The case is sectioned to leave the plate stack visible.',[0,.73,-.16],r=>{r.box(-.55,-.35,-.31,.55,.35,-.26,dark);r.box(-.55,.30,-.25,.55,.35,.45,dark);r.box(-.55,-.35,-.26,-.49,.35,.45,steel);}),
   ...[-1,1].map((s,i)=>part(i?'negative':'positive',i?'Negative plate group':'Positive plate group','The plates of one polarity share a terminal strap. Plates of the opposite polarity alternate across the cell.',[i?.75:-.75,0,.16],r=>{for(let n=0;n<5;n++){const xx=-.37+n*.16+i*.071;r.box(xx,-.24,-.20,xx+.032,.24,.27,i?steel:hot);r.box(xx,s*.18-.023,.26,xx+.032,s*.18+.023,.38,i?steel:hot);}r.box(-.39,s*.18-.036,.36,.38,s*.18+.036,.41,metal);})),
   part('separators','Insulating separator sheets','Porous separators keep opposite plates apart while allowing ionic conduction through the electrolyte.',[0,-.77,.22],r=>{for(let n=0;n<9;n++){const xx=-.319+n*.08;r.box(xx,-.25,-.21,xx+.011,.25,.30,'#d9cfb3');}}),
   part('cover','Cell lid and terminals','The two terminal posts connect the cell to its neighbors in the bank.',[0,0,.68],r=>{r.box(-.55,-.34,.44,.55,.34,.49,dark);for(const s of [-1,1])cyl(r,[s*.39,s*.18,0],z,.49,.60,.047,metal);})
 ]);
}
export const seaRotary={steer:jetStudy(true),booster:jetStudy(false),steam:turbineStudy(true),gas:turbineStudy(false),electric:electricStudy(),gear:gearStudy(),boiler:steamBoiler(),shaft:shaftStudy(seaRefs.oocl),battery:battery()};

seaRotary.alternator=mk('marine-alternator','Synchronous generator section','The engine drives the alternator rotor. A moving magnetic field induces an alternating voltage in the stationary windings. The cutaway illustrates a generator section, with representative winding and pole counts.',seaRefs.pion,[
 part('shaft','Input shaft and coupling','The diesel crankshaft delivers torque to the generator rotor through a flexible coupling.',[-.75,0,.05],r=>{shaft(r,-1.01,.76,.074);sleeve(r,o,x,-.91,-.70,.20,.073,dark);}),
 part('rotor','Generator rotor','The field structure revolves with the input shaft inside the fixed windings.',[.63,-.52,.14],(r,p)=>{cyl(r,o,x,-.51,.40,.186,steel);for(let i=0;i<6;i++){const a=TAU*(i/6+p);turn(r,o,x,[[-.47,.182],[-.47,.263],[.37,.263],[.37,.182]],gold,{start:a,sweep:.71,n:5});}}),
 part('stator','Stator winding groups','The fixed copper windings collect electrical energy from the rotating field.',[0,.68,.48],r=>{for(let i=0;i<12;i++){const a=TAU*(i+.5)/12,b=[0,Math.cos(a)*.305,Math.sin(a)*.305];turn(r,b,x,[[-.55,.033],[-.51,.048],[.44,.048],[.49,.032]],copper,{n:9});}}),
 part('case','Sectioned frame and feet','The casing carries the stationary core and the output terminal box. The base feet hold it in line with the drive.',[0,-.18,-.69],r=>{shell(r,[[-.62,.34],[-.62,.40],[.56,.40],[.56,.34]],cold);for(const s of [-1,1])r.box(-.58,s*.30-.065,-.44,.51,s*.30+.065,-.35,steel);r.box(-.28,-.12,.32,.15,.12,.49,dark);})
],'The gold poles rotate with the engine while the outer copper windings remain still.');

seaRotary.azimuth=mk('marine-azimuth','Azimuth thruster leg','Pioneering Spirit can turn each fixed-pitch thruster through 360 degrees. This illustrative cutaway isolates the rotating steering leg, horizontal propeller shaft and duct.',seaRefs.azimuth,[
 part('mount','Fixed hull mounting ring','The hull carries the vertical and horizontal loads from the thruster.',[0,0,.75],r=>sleeve(r,[0,0,.60],z,-.04,.08,.38,.26,steel)),
 part('stem','Steering column and lower gearcase','The column turns in the mounting ring. The submerged housing supports the propeller shaft.',[0,-.73,.09],r=>{turn(r,o,z,[[.61,.24],[.54,.235],[.43,.16],[-.13,.113],[-.21,.15]],cold);turn(r,[0,0,-.21],x,[[-.37,0],[-.30,.116],[-.08,.154],[.17,.151],[.32,.088],[.38,.068]],steel);}),
 part('shaft','Horizontal propeller shaft','The output shaft revolves about its own axis as the steering system aims the entire thrust unit.',[-.72,0,.05],r=>cyl(r,[0,0,-.21],x,-.24,.62,.054,metal)),
 part('screw','Fixed-pitch propeller','The pitch is fixed at the hub. The propeller produces thrust along whichever direction the leg faces.',[.79,0,-.18],(r,p)=>{const c=[.44,0,-.21];cyl(r,c,x,-.11,.12,.103,gold);for(let i=0;i<4;i++)screwBlade(r,c,.42,TAU*(i/4+p));}),
 part('duct','Propeller duct','The shroud travels with the steering leg. The running gap separates it from the moving blade tips.',[.20,.70,-.31],r=>turn(r,[.44,0,-.21],x,[[-.13,.437],[-.13,.486],[.12,.484],[.16,.446],[-.13,.437]],cold,{n:34,start:4.22,sweep:TAU*.68}))
],'The propeller turns inside the stationary duct. The steering angle is held fixed for this view.');

seaRotary.condenser=mk('marine-condenser','Surface condenser section','Exhaust steam reaches the outside of a bundle of cooler tubes. As it condenses, fresh water collects below the bundle. Seawater stays inside the tubes.',seaRefs.steam,[
 part('shell','Sectioned exhaust shell','The enlarged upper connection admits exhaust steam into the space around the tubes.',[0,.76,.26],r=>{shell(r,[[-.70,.35],[-.70,.40],[.70,.40],[.7,.35]],steel);sleeve(r,[0,0,.30],z,0,.24,.19,.147,cold);}),
 part('tubes','Cooling-water tube bundle','Parallel tubes conduct heat away from the condensing steam. The sea and steam circuits remain separate.',[-.79,0,.12],r=>{for(let j=-2;j<3;j++)for(let k=-2;k<3;k++){if(j*j+k*k>6)continue;cyl(r,[0,j*.093,k*.093],x,-.70,.70,.030,copper,9);}}),
 part('sheets','Tube sheets','Tube ends meet these plates, which separate the waterboxes from the steam space.',[.70,0,.20],r=>{for(const s of [-1,1])sleeve(r,o,x,s*.67,s*.72,.375,.266,metal);}),
 part('hotwell','Condensate hotwell','Fresh condensate falls into the lower collection space. The outlet returns water to the feed circuit.',[0,-.14,-.72],r=>{r.box(-.49,-.17,-.52,.49,.17,-.34,cold);cyl(r,[.30,0,-.53],z,-.13,.02,.051,copper);})
]);

function propellerStudy(variable){
 const name=variable?'Controllable-pitch propeller':'Fixed-pitch propeller';
 const parts=[part('boss','Propeller boss and bore','The central boss seats on the shaft and carries the blades around the propeller axis.',[-.74,0,.10],r=>turn(r,o,x,[[-.32,.083],[-.32,.14],[-.21,.207],[.20,.19],[.34,.111],[.34,.084],[-.32,.083]],gold,{n:32}))];
 const count=variable?4:5;
 for(let i=0;i<count;i++){
   const a=i*TAU/count;
   parts.push(part('blade-'+(i+1),'Blade '+(i+1),variable?'The blade foot turns about its radial axis. As the pitch increases, the leading and trailing edges take a steeper angle to the hub.':'The root, twisted working face and tip are isolated here for inspection. In a one-piece casting they are continuous with the boss.',[.18,Math.cos(a)*.82,Math.sin(a)*.82],(r,phase)=>{
     const offset=r.faces.length;
     screwBlade(r,o,.84,a, i===0?'#dbc488':gold);
     if(variable){
       const tilt=.42*Math.sin(TAU*phase),c=Math.cos(tilt),s=Math.sin(tilt);
       for(let j=offset;j<r.faces.length;j++)r.faces[j].points=r.faces[j].points.map(([ax,yy,zz])=>{
         const radial=yy*Math.cos(a)+zz*Math.sin(a);
         const tangent=-yy*Math.sin(a)+zz*Math.cos(a),out=ax*s+tangent*c;
         return [ax*c-tangent*s,radial*Math.cos(a)-out*Math.sin(a),radial*Math.sin(a)+out*Math.cos(a)];
       });
       const direction=[0,Math.cos(a),Math.sin(a)];cyl(r,o,direction,.161,.216,.083,steel,14);
     }
   }));
 }
 return mk(variable?'marine-cpp':'marine-fixedprop',name,variable?'Araho turns a 154-inch controllable-pitch propeller. Each blade can pivot in the boss. This four-blade section illustrates pitch change; the blade count and contour are representative.':'An open-water propeller has pitch and twist built into each blade. The enlarged five-blade pattern illustrates the root, working face and tip.',variable?{label:'Professional Mariner · Araho controllable-pitch running gear',url:'https://professionalmariner.com/2018-ship-of-the-year-araho/'}:seaRefs.oocl,parts,variable?'The hub is stationary in this demonstration. Watch each blade change pitch about its own radial axis.':'');
}
seaRotary.fixedProp=propellerStudy(false);
seaRotary.cpp=propellerStudy(true);

seaRotary.bearing=mk('marine-rolling-bearing','Rolling-element shaft bearing','An enlarged radial bearing shows how the rotating shaft can transfer radial load to the motor housing. The race and cage pattern is representative.',seaRefs.alvin,[
 part('inner','Inner race','The inner ring fits around the motor shaft and rotates with it.',[-.66,0,0],r=>sleeve(r,o,x,-.14,.14,.29,.21,steel,36)),
 part('outer','Outer race','The outer ring is supported by the motor end plate. A section is removed to reveal the rolling elements.',[.64,0,0],r=>turn(r,o,x,[[-.14,.413],[-.14,.51],[.14,.51],[.14,.413],[-.14,.413]],metal,{n:30,start:1.4,sweep:Math.PI*1.47})),
 part('rolling','Rolling elements','Rolling contact between the two tracks carries the shaft load.',[0,0,.62],r=>{
   for(let j=0;j<11;j++){const a=TAU*j/11,rad=.065,profile=Array.from({length:9},(_,k)=>[rad*Math.sin(-Math.PI/2+Math.PI*k/8),k===0||k===8?0:rad*Math.cos(-Math.PI/2+Math.PI*k/8)]);turn(r,[0,.351*Math.cos(a),.351*Math.sin(a)],x,profile,metal,{n:12});}
 }),
 part('cage','Retaining cage','Thin side rings and bridges keep the rolling elements spaced around their tracks.',[0,-.65,.14],r=>{
   for(const s of [-1,1])sleeve(r,o,x,s*.062,s*.077,.378,.322,gold,28);
   for(let i=0;i<11;i++){const a=TAU*(i+.5)/11;cyl(r,[0,.352*Math.cos(a),.352*Math.sin(a)],x,-.074,.074,.022,gold,9);}
 })
]);
