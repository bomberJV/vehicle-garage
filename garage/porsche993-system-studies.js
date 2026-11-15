import {part,study,cyl,sleeve,turn,gear,x,y,z,add,TAU} from './mechanism-shapes.js';
import {box,path} from './road-service-geometry.js';
import {ellipsoid} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';
import {stopLampStudy} from './porsche993-stop-lamp.js';
import {refs} from './porsche993-sources.js';

const Al='#acb4ae',steel='#78898c',rubber='#3e484a',brown='#a68b6b',brass='#bf9b62',c=[0,0,.35];
const wave=t=>(1-Math.cos(t*TAU))*.5;
function coil(r,p,len,rad,turns){
 const pts=Array.from({length:turns*9+1},(_,i)=>{
  const t=i/(turns*9);return add(p,[rad*Math.cos(t*TAU*turns),rad*Math.sin(t*TAU*turns),t*len]);
 });
 path(r,pts,.006,steel);
}
function thermostat(){
 return study('993oilreg','External oil thermostat and filter mount','The return circuit can bypass the long front oil lines. As the regulator moves, it opens the cooler path. The cutaway follows PET 104-03. Spring travel is illustrative.',refs.thermostat,[
  part('body','Sectioned valve body','The casting holds the vertical regulator bore and the horizontal threaded filter mounting.',[-.26,.08,.22],r=>{
   turn(r,c,z,[[-.21,.093],[-.21,.125],[.19,.125],[.19,.093],[-.21,.093]],Al,{start:.54,sweep:4.35,n:26});
   cyl(r,add(c,[.117,0,.105]),x,0,.074,.035,steel,14);
  }),
  part('insert','Regulator insert','The sliding insert opens the return circuit to the front oil cooler.',[.22,0,.22],(r,t)=>{
   const p=add(c,[0,0,.055*wave(t)]);
   turn(r,p,z,[[-.067,0],[-.067,.038],[-.055,.061],[.04,.061],[.047,.041],[.071,.033],[.071,0]],brass,{n:18});
  }),
  part('small-spring','Upper compression spring','This spring bears on the upper end of the moving regulator.',[-.15,.23,.21],(r,t)=>coil(r,add(c,[0,0,.072+.055*wave(t)]),.086-.055*wave(t),.028,5)),
  part('spring','Lower compression spring','The larger spring sits between the regulator and the removable end cap.',[0,.28,-.24],(r,t)=>coil(r,add(c,[0,0,-.17]),.102+.055*wave(t),.051,6)),
  part('cap','End cap, sealing ring and circlip','The end cap closes the regulator bore. An O-ring seals the joint and the circlip retains the cap.',[.14,0,-.36],r=>{
   cyl(r,c,z,-.215,-.169,.091,steel,18);sleeve(r,c,z,-.180,-.173,.094,.085,rubber,18);
   turn(r,c,z,[[-.220,.079],[-.220,.097],[-.214,.097],[-.214,.079]],steel,{start:.15,sweep:5.8,n:22});
  })
 ],'Watch the insert move against the two springs. Travel is enlarged to make the change visible.');
}
function oilPump(){
 return study('993oilpump','Dry-sump pressure and scavenge stages','The gears in each stage carry oil around the housing. The pressure stage draws oil from the tank while the scavenge stage clears the bottom of the crankcase. The service drawing identifies the pump and connecting shaft. This section illustrates their operation.',refs.training,[
  part('case','Common pump housing','Both gear sets occupy one housing. The near wall is cut away to expose them.',[-.32,.10,.18],r=>{
   for(const side of [-1,1])turn(r,add(c,[0,side*.087,0]),x,[[-.237,.111],[-.237,.128],[.21,.128],[.21,.111]],Al,{start:.25,sweep:3.4,n:18});
  }),
  part('shaft','Connecting shaft','The drive turns the two pump stages together.',[-.42,0,0],r=>cyl(r,add(c,[0,-.087,0]),x,-.39,.24,.024,steel,14)),
  ...[['pressure','Pressure stage',-.118,.052],['scavenge','Scavenge stage',.077,.089]].map(([id,name,station,length])=>
   part(id,name,'The two gears turn in opposite directions. Oil travels in the spaces between the gear teeth and the housing.',[station<0?-.16:.23,station<0?-.25:.25,.28],(r,t)=>{
    for(const side of [-1,1])gear(r,add(c,[station,side*.087,0]),x,-length,length,.095,.095,12,side===1?steel:brass,t*TAU*side+(side===1?Math.PI/12:0));
   }))
 ],'Follow the opposing rotation of each pair of gears. Gear profiles and speeds are illustrative.');
}
function heatExchanger(){
 return study('993heaterjacket','Carrera exhaust heat exchanger','The same casting provides two physically separate flow paths. Three exhaust primaries run inside a sheet-metal jacket. The heater blower passes clean air around the hot pipes.',refs.exchanger,[
  part('jacket','Pressed steel air jacket','An open section exposes the three primary pipes within the outer air passage.',[0,-.32,.23],r=>{
   turn(r,c,x,[[-.36,.106],[-.31,.148],[.26,.148],[.345,.096]],brown,{start:.2,sweep:4.35,n:22});
  }),
  ...[-.20,0,.20].map((xx,i)=>part('primary-'+(i+1),'Exhaust primary '+(i+1),'A sealed steel tube carries exhaust gas from this head toward the collector.',[xx*1.3,0,.26+.06*i],r=>{
   const inlet=add(c,[xx,.013,.187]),mid=add(c,[xx-.045,.015-.044*i,-.023]),end=add(c,[.335,.046,-.002]);
   path(r,[inlet,mid,add(mid,[.10,0,-.021]),end],.031,'#ad8970');
   sleeve(r,inlet,z,-.013,0,.047,.028,steel,12);
  })),
  part('air','Air inlet and outlet collars','These larger openings connect the heater-air ducts to the jacket, clear of the exhaust flanges.',[.20,.28,.14],r=>{
   for(const s of [-1,1])sleeve(r,add(c,[s*.275,-.09,.086]),y,-.086,0,.067,.059,Al,17);
  }),
  part('flange','Collector and exhaust flange','The three primaries discharge through this flange toward the catalyst.',[.36,.06,0],r=>{
   sleeve(r,add(c,[.337,.046,-.002]),x,-.004,.077,.045,.035,brown,18);
   sleeve(r,add(c,[.337,.046,-.002]),x,.069,.082,.073,.035,Al,3);
  })
 ]);
}
function blower(){
 return study('993cabblower','Cabin blower and particle filter','A centrifugal wheel takes air through its center and throws it outward into the housing. Each side of the front heater has its own blower and filter.',refs.cabin,[
  part('cover','Filter cover and particle filter','The removable cover gives access to the filter ahead of the blower.',[-.28,-.20,.19],r=>{
   box(r,[-.13,-.23,.36],[.32,.015,.239],rubber);
   for(let i=0;i<14;i++)box(r,[-.278+i*.023,-.214,.36],[.011,.015,.217],'#b6b3a0');
  }),
  part('housing','Blower housing','The open section shows the scroll and its outlet into the heater box.',[.27,0,-.16],r=>{
   turn(r,c,y,[[-.105,.168],[-.105,.184],[.096,.184],[.096,.168]],rubber,{start:.1,sweep:4.7,n:22});
   box(r,[.174,0,.245],[.106,.19,.068],rubber);
  }),
  part('wheel','Centrifugal blower wheel','The radial blade cage turns on the motor shaft.',[-.16,-.33,.05],(r,t)=>{
   for(const v of [-.075,.075])sleeve(r,c,y,v-.006,v+.006,.152,.130,steel,24);
   for(let j=0;j<24;j++){const a=TAU*(j/24+t),p=(rad,t,yy)=>add(c,[rad*Math.cos(t),yy,rad*Math.sin(t)]);
    r.polygon([p(.13,a,-.075),p(.15,a+.083,-.075),p(.15,a+.083,.075),p(.13,a,.075)],'#8d9996',false);}
   cyl(r,c,y,-.009,.066,.041,Al,14);
  }),
  part('motor','Electric motor and rubber mounts','The motor stays stationary. Its shaft projects into the rotating wheel.',[.09,.31,.09],r=>{
   cyl(r,c,y,.083,.227,.082,steel,18);
   for(const s of [-1,1])cyl(r,add(c,[s*.088,0,0]),y,.091,.115,.021,rubber,10);
  })
 ],'The motor shaft drives the blower wheel. The filter and housing remain fixed.');
}
function compressor(){
 return study('993acclutch','A/C compressor magnetic clutch','The pulley runs with the engine belt. When the coil is energized it draws the armature against the pulley, coupling belt torque to the compressor shaft.',refs.compressor,[
  part('body','Compressor body and shaft','The compressor body bolts to the engine bracket.',[-.35,0,.10],r=>{
   turn(r,c,x,[[-.23,0],[-.23,.12],[-.19,.151],[.04,.151],[.073,.10],[.073,0]],Al,{n:22});cyl(r,c,x,.06,.231,.024,steel,16);
  }),
  part('coil','Stationary field coil','The annular winding creates the magnetic field that pulls the armature in.',[0,.33,.17],r=>sleeve(r,c,x,.080,.132,.115,.069,'#a57f5c',24)),
  part('pulley','Belt pulley and bearing','The pulley rotates around the compressor nose while the clutch is open.',[.21,-.28,0],(r,t)=>{
   turn(r,c,x,[[.088,.120],[.088,.15],[.103,.151],[.123,.139],[.143,.151],[.158,.151],[.158,.083],[.142,.083],[.142,.120]],steel,{n:26});
   const a=TAU*t;cyl(r,add(c,[0,.125*Math.cos(a),.125*Math.sin(a)]),x,.156,.161,.007,brass,8);
  }),
  part('armature','Armature and driven hub','The flexing plate closes the gap and transfers torque to the splined hub.',[.39,.05,.13],(r,t)=>{
   const engaged=t>.33&&t<.84,d=engaged?.163:.178;
   sleeve(r,c,x,d,d+.012,.143,.037,Al,26);
   const a=TAU*Math.max(0,Math.min(.51,t-.33));for(let i=0;i<3;i++)cyl(r,add(c,[0,.081*Math.cos(a+i*TAU/3),.081*Math.sin(a+i*TAU/3)]),x,d+.011,d+.021,.013,steel,10);
  })
 ],'The pulley turns throughout the cycle. The armature engages, turns with the pulley, then releases. The air gap is exaggerated.');
}
function fogLamp(){
 const pt=(u,v,x)=>[x,u*.30,.36+v*.106];
 return study('993foglamp','Front fog and position lamp','The clear inboard section of the bumper lamp carries an H3 fog bulb and a separate 4 W position bulb. The amber direction indicator has its own housing alongside.',refs.fog,[
  part('lens','Fluted lens','The glass covers the fog reflector and the smaller position lamp.',[-.28,0,.13],r=>{
   const cols=13;
   for(let i=0;i<cols;i++){const a=-1+i*2/cols,b=-1+(i+1)*2/cols;
    glazingFace(r,[pt(a,-1,-.095),pt(b,-1,-.095),pt(b,1,-.095),pt(a,1,-.095)],'#aac7cb',.38);
    r.rod(pt(a,-.94,-.0955),pt(a,.94,-.0955),.0015,'#c0cbcd',6);}
  }),
  part('reflector','Lamp body and reflector','A shallow reflector directs light forward through the lens.',[.31,0,.10],r=>{
   const edge=[pt(-1,-1,-.091),pt(1,-1,-.091),pt(1,1,-.091),pt(-1,1,-.091)];
   const back=edge.map((p,i)=>[.085,p[1]*.79,.36+(p[2]-.36)*.59]);
   for(let i=0;i<4;i++){const j=(i+1)%4;r.polygon([edge[i],edge[j],back[j],back[i]],i%2?steel:Al,false);}
   r.polygon(back,'#59696a',false);
  }),
  part('h3','H3 fog bulb and lead','The H3 capsule fits in the reflector. A short insulated lead connects its base.',[.18,.24,.18],r=>{
   const b=[.075,-.06,.36];cyl(r,b,x,-.032,.021,.035,Al,16);ellipsoid(r,add(b,[-.057,0,0]),[.045,.017,.017],'#c8c6b2',12,5);
   path(r,[add(b,[.02,0,0]),add(b,[.07,.02,-.032]),add(b,[.112,.060,-.046])],.006,rubber);
  }),
  part('position','Position bulb and socket','The small 12 V, 4 W bulb has its own socket at the side of the optical unit.',[.19,-.23,-.13],r=>{
   const b=[.073,.195,.357];cyl(r,b,x,-.028,.043,.023,rubber,14);ellipsoid(r,add(b,[-.038,0,0]),[.024,.014,.014],'#d0c8a8',12,5);
  })
 ]);
}
function varioram(){
 return study('993varioram','VarioRam intake distributor','At low engine speeds, six long intake paths help fill the cylinders. With more throttle and engine speed, two vacuum-driven slides uncover shorter paths. A third actuator operates the resonance flap between the banks. This section separates the mechanism from the casting.',refs.intake,[
  part('casting','Distributor casting','The center chamber distributes air to two banks. A section through the roof of the casting reveals the slide tubes.',[0,0,.34],r=>{
   for(const s of [-1,1])turn(r,[0,s*.170,.45],x,[[-.337,.063],[-.32,.079],[.32,.079],[.337,.063]],Al,{start:.04,sweep:3.5,n:18});
  }),
  ...[-1,1].map((s,i)=>part(i?'right':'left',(i?'Right':'Left')+' triple-runner slide','One linkage moves the three intake sleeves on this bank together.',[0,s*.36,.11],(r,t)=>{
   const h=.398+.085*wave(t);
   for(const xx of [-.205,0,.205]){
    sleeve(r,[xx,s*.171,h],z,-.065,.045,.045,.036,Al,16);
    const end=[xx,s*.30,.219];
    path(r,[[xx,s*.171,.34],[xx,s*.234,.325],end],.035,steel);
    sleeve(r,end,z,-.020,.014,.047,.034,rubber,12);
   }
   box(r,[0,s*.206,h+.018],[.45,.017,.019],steel);
  })),
  part('actuators','Two slide vacuum units','Vacuum moves a diaphragm in each unit. A pull rod transmits that movement to the corresponding slide linkage.',[-.29,.14,.20],(r,t)=>{
   for(const s of [-1,1]){turn(r,[-.29,s*.17,.56],z,[[-.025,.034],[-.02,.058],[.006,.063],[.034,.037],[.034,0]],steel,{n:16});
    cyl(r,[-.29,s*.17,.56],z,-.142+.085*wave(t),-.023,.008,brass,10);}
  }),
  part('resonance','Resonance flap and third vacuum unit','The flap changes the connection between the banks, giving the short intake path a second resonance setting.',[.28,.08,-.24],(r,t)=>{
   const o=[.29,0,.45],a=wave(t)*Math.PI*.48;
   sleeve(r,o,y,-.112,.105,.069,.059,Al,20);
   const p=(u,v)=>add(o,[u*Math.cos(a),u*Math.sin(a),v]);
   r.polygon(Array.from({length:18},(_,j)=>p(.057*Math.cos(j*TAU/18),.057*Math.sin(j*TAU/18))),brass,false);
   cyl(r,o,z,-.091,.085,.007,steel,10);cyl(r,[.29,0,.325],z,-.020,.025,.042,steel,14);
  }),
  part('valves','Vacuum change-over valves','The engine controller operates three solenoid valves to route vacuum to the slide units and the resonance flap actuator.',[-.27,-.20,-.19],r=>{
   for(let i=0;i<3;i++){const b=[-.24+i*.079,.03,.228];box(r,b,[.043,.035,.046],rubber);cyl(r,b,y,-.052,-.015,.012,steel,10);}
  })
 ],'Watch the three sleeves in each bank move together. Actuator motion is slowed and its travel is illustrative.');
}
function thermostatCap(){
 return study('993oilregcap','Thermostat end cap and seals','The end cap seats against the lower spring. A rubber O-ring seals it against the regulator bore. The circlip bears against a groove in the casting.',refs.thermostat,[
  part('cap','End cap','The spring seats in the hollow face of the cap.',[0,0,.24],r=>{
   turn(r,c,z,[[-.065,0],[-.065,.15],[-.048,.159],[-.028,.144],[-.017,.144],[-.014,.154],[.034,.154],[.034,.122],[-.012,.122],[-.012,0]],Al,{n:30});
  }),
  part('oring','End-cap O-ring','This elastomer ring sits in the outer groove. It seals radially against the regulator bore.',[-.20,.10,.14],r=>{
   turn(r,c,z,[[-.032,.151],[-.030,.157],[-.026,.161],[-.021,.161],[-.017,.157],[-.015,.151],[-.021,.145],[-.026,.145],[-.032,.151]],rubber,{n:32});
  }),
  part('retainer','Internal circlip','The split ring seats below the cap and retains it in the bore.',[.17,0,-.24],r=>{
   turn(r,c,z,[[-.076,.133],[-.076,.165],[-.068,.165],[-.068,.133]],steel,{start:.2,sweep:5.84,n:30});
   for(const a of [.20,6.04])sleeve(r,add(c,[.138*Math.cos(a),.138*Math.sin(a),0]),z,-.078,-.068,.018,.006,steel,12);
  })
 ]);
}
const builders=new Map([
 ['993oilreg.cap',thermostatCap],['engine.intake',varioram],['993-lubrication.thermostat',thermostat],['993-lubrication.pump',oilPump],
 ['993-climate.exchanger-left',heatExchanger],['993-climate.exchanger-right',heatExchanger],
 ['993-climate.blowers',blower],['993-climate.compressor',compressor],
 ['lights.high-stop',stopLampStudy],['lights.fog-left',fogLamp],['lights.fog-right',fogLamp]
]);
const cache=new Map();
export function get993Study(id){
 const make=builders.get(id);
 if(!make)return null;
 if(!cache.has(make))cache.set(make,make());
 return cache.get(make);
}
