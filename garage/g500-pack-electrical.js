// G500 study pack: electrical.
// Electrical and lighting: lamps, bulbs and sockets, switches, PARKTRONIC, horns, relays, ignition lock, instrument cluster, audio and antennas.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
//
// Every number below was read from an MB Parts Giant G500 catalog page (2002 G500 unless the
// plate says otherwise). Assemblies the register already models without a number (headlamp,
// tail lamps, fog and marker lamps, fuse boxes, starter solenoid and drive, alternator pulley,
// ignition switch, battery leads) are left out rather than duplicated.
import {metal,steel,dark,gold,copper,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const giant='https://www.mbpartsgiant.com/parts-list/';
const plate=(label,path)=>({label:'MB Parts Giant · '+label,url:giant+path});
const plates={
  headlampComponents:plate('2002 G500 headlamp components diagram','2002-mercedes_benz-g500/headlights-lighting/headlamp-components'),
  headlamps:plate('2002 G500 headlamps diagram','2002-mercedes_benz-g500/headlights-lighting/headlamps'),
  tail:plate('2002 G500 tail lamps diagram','2002-mercedes_benz-g500/headlights-lighting/tail-lamps'),
  rearFog:plate('2002 G500 rear fog lamps and reflex diagram','2002-mercedes_benz-g500/headlights-lighting/rear-fog-lamps-reflex'),
  marker:plate('2002 G500 side marker lamps diagram','2002-mercedes_benz-g500/headlights-lighting/side-marker-lamps'),
  signal:plate('2002 G500 signal lamps diagram','2002-mercedes_benz-g500/headlights-lighting/signal-lamps'),
  interior:{label:'MB Parts Giant · G500 interior lights listing (2002–2008 fitment)',url:'https://mbpartsgiant.com/oem-mercedes_benz-g500-interior_lights'},
  switches:plate('2002 G500 switches diagram','2002-mercedes_benz-g500/electrical/switches'),
  powerSeats:plate('2002 G500 power seats and door switches diagram','2002-mercedes_benz-g500/electrical/power-seats'),
  cruise:plate('2002 G500 cruise control system diagram','2002-mercedes_benz-g500/electrical/cruise-control-system'),
  parking:plate('2002 G500 parking aid diagram','2002-mercedes_benz-g500/electrical/parking-aid'),
  horn:plate('2003 G500 horn diagram','2003-mercedes_benz-g500/electrical/horn'),
  antiTheft:plate('2002 G500 anti-theft components diagram','2002-mercedes_benz-g500/electrical/anti-theft-components'),
  components:plate('2002 G500 electrical components diagram','2002-mercedes_benz-g500/electrical/electrical-components'),
  ignitionLock:{label:'MB Parts Giant · 2004 G500 instrument panel diagram (ignition lock)',url:'https://mbpartsgiant.com/oem-2004-mercedes_benz-g500-ignition_switch'},
  navigation:plate('2002 G500 navigation system diagram','2002-mercedes_benz-g500/electrical/navigation-system'),
  antenna:plate('2002 G500 antenna and radio diagram','2002-mercedes_benz-g500/electrical/antenna-radio'),
  alternator:plate('2002 G500 alternator diagram','2002-mercedes_benz-g500/charging-starting/alternator'),
  starter:plate('2002 G500 starter diagram','2002-mercedes_benz-g500/charging-starting/starter'),
  battery:plate('2003 G500 battery diagram','2003-mercedes_benz-g500/charging-starting/battery')
};
export const electricalPackSources=plates;

const plastic='#3a3f42',rubber='#26292b',grey='#8f9a9c',amber='#d08a2c',red='#a3322c',lens='#cfd8da',chrome='#c9d2d4',black='#1f2224';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
// A flat rectangular gasket in the x–z plane.
const frame=(r,c,w,h,t,color,depth=.02)=>{
  block(r,[c[0],c[1],c[2]+h/2],[w,depth,t],color);block(r,[c[0],c[1],c[2]-h/2],[w,depth,t],color);
  block(r,[c[0]-w/2,c[1],c[2]],[t,depth,h],color);block(r,[c[0]+w/2,c[1],c[2]],[t,depth,h],color);
};
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,n);};
const wire=(r,pts,rad,color)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,6);};
// A rocker switch face: bezel, cap and a small symbol bar.
const rocker=(r,c,w,h,color)=>{block(r,c,[w,.05,h],black);block(r,[c[0],c[1]+.03,c[2]],[w*.82,.02,h*.8],color);block(r,[c[0],c[1]+.045,c[2]+h*.15],[w*.3,.01,h*.08],amber);};
// A plug-in relay: square shell over a base with blade terminals.
const relay=(r,c,color)=>{block(r,[c[0],c[1],c[2]+.05],[.12,.12,.12],color);block(r,[c[0],c[1],c[2]-.025],[.13,.13,.03],black);for(const [dx,dy] of [[-.03,-.03],[.03,-.03],[-.03,.03],[.03,.03]])block(r,[c[0]+dx,c[1]+dy,c[2]-.07],[.008,.025,.06],copper);};
const bearing=(r,c,a,inner,outer,width,color=metal)=>{sleeve(r,c,a,0,width,inner+.015,inner,color,18);sleeve(r,c,a,0,width,outer,outer-.015,color,20);sleeve(r,c,a,width*.2,width*.8,outer-.015,inner+.015,dark,16);};
const src=(p,source)=>({...p,source});

// 1. Headlamp seal, support and sensor.
const headlampRows=[
  src(part('seal','Headlamp seal · 463-826-00-91','The rubber ring that seals the round headlamp unit to the wing opening.',[0,.3,0],r=>sleeve(r,[0,0,0],y,0,.04,.62,.54,rubber,28)),plates.headlampComponents),
  src(part('support','Headlamp support · 463-820-10-46','The bracket behind the headlamp that carries the unit and its adjusters in the wing.',[0,.65,-.15],r=>{
    sleeve(r,[0,.25,0],y,0,.03,.5,.42,steel,24);
    for(const a of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4])block(r,[Math.cos(a)*.52,.28,Math.sin(a)*.52],[.1,.06,.1],steel);
  }),plates.headlampComponents),
  src(part('sentinel-sensor','Headlamp sentinel sensor · 463-820-07-26','A small sensor the headlamp diagram lists with the lamp unit, marked G500.',[.45,.6,.45],r=>{cyl(r,[.55,.3,.45],y,0,.1,.04,dark,12);block(r,[.55,.43,.45],[.06,.06,.05],plastic);}),plates.headlamps)
];
const headlampMount=study('g500-headlamp-mounting','Headlamp seal, support and sensor','The ring seal, support bracket and sensor that sit behind each round headlamp unit.',plates.headlampComponents,headlampRows);
headlampMount.viewAngle=[-.6,.3];

// 2. Exterior lamp seals and pads.
const lampSealRows=[
  src(part('tail-seal-left','Tail lamp seal, driver side · 463-826-01-58','The gasket between the left rear combination lamp and the body.',[-.25,.2,0],r=>frame(r,[-.5,0,0],.34,.62,.035,rubber)),plates.tail),
  src(part('tail-seal-right','Tail lamp seal, passenger side · 463-826-02-58','The gasket between the right rear combination lamp and the body.',[.25,.2,0],r=>frame(r,[.5,0,0],.34,.62,.035,rubber)),plates.tail),
  src(part('rear-fog-seal','Rear fog lamp seal · 001-826-45-80','The ring seal behind the rear fog lamp in the bumper.',[0,.25,-.35],r=>sleeve(r,[0,0,-.55],y,0,.025,.12,.09,rubber,20)),plates.rearFog),
  src(part('marker-seal','Side marker lamp seal · 463-826-00-58','The gasket under each side marker lamp.',[0,.25,.4],r=>frame(r,[0,0,.5],.2,.08,.02,rubber)),plates.marker),
  src(part('signal-pad','Signal lamp pad · 000-826-00-85','The pad between the wing-top signal lamp and the wing.',[0,.2,.75],r=>{block(r,[0,0,.8],[.22,.06,.012],rubber);block(r,[0,0,.82],[.18,.05,.03],amber);}),plates.signal)
];
const lampSeals=study('g500-lamp-seals','Exterior lamp seals and pads','The gaskets and pad the G500 lighting diagrams list between the tail, rear fog, side marker and signal lamps and the body.',plates.tail,lampSealRows);
lampSeals.viewAngle=[-.5,.25];

// 3. Interior lamps.
const interiorRows=[
  part('dome','Dome lamp · 463-820-02-01','The roof lamp that lights the cabin when a door opens.',[0,0,.35],r=>{block(r,[0,0,.3],[.5,.24,.05],grey);block(r,[0,0,.27],[.4,.18,.02],lens);}),
  part('map','Map lamp · 463-820-04-01','The front roof console with two reading lamps over the front seats.',[0,-.45,.15],r=>{block(r,[0,-.5,.25],[.6,.28,.08],grey);for(const s of [-1,1])cyl(r,[s*.17,-.5,.2],z,-.02,0,.07,lens,14);}),
  part('compartment','Compartment lamp · 124-820-15-01','A small courtesy lamp the catalog also names a dome lamp, listed for the G500.',[0,.5,-.1],r=>{block(r,[0,.5,0],[.24,.12,.05],grey);block(r,[0,.5,-.03],[.18,.08,.02],lens);})
].map(p=>src(p,plates.interior));
const interiorLamps=study('g500-interior-lamps','Interior lamps','The dome lamp, the front map-lamp console and the small compartment lamp.',plates.interior,interiorRows);
interiorLamps.viewAngle=[-.5,.55];

// 4. Dash, console and door switches.
const switchRows=[
  src(part('switch-panel','Center switch panel · 463-820-32-10','The panel in the center of the dash that carries the row of rocker switches.',[0,.3,.25],r=>{block(r,[0,-.05,.35],[.9,.06,.16],plastic);for(let i=0;i<5;i++)rocker(r,[-.32+i*.16,0,.35],.12,.1,grey);}),plates.switches),
  src(part('hazard','Hazard switch · 463-820-34-10','The hazard-flasher switch block; this number is the version with heated seats and interior protection.',[0,-.35,.45],r=>{block(r,[0,0,.6],[.2,.06,.12],black);block(r,[0,.035,.6],[.12,.02,.08],red);}),plates.switches),
  src(part('fog','Fog lamp switch · 163-820-16-10','The push switch for the front and rear fog lamps, marked G500.',[-.45,-.35,.4],r=>rocker(r,[-.45,0,.6],.12,.1,grey)),plates.switches),
  src(part('stoplamp','Stoplamp switch · 001-545-64-09','The plunger switch on the brake pedal bracket that lights the brake lamps.',[0,-.3,-.45],r=>{cyl(r,[0,0,-.55],y,-.1,.08,.04,plastic,14);cyl(r,[0,-.1,-.55],y,-.08,0,.015,metal,8);block(r,[0,.12,-.55],[.06,.06,.06],black);}),plates.switches),
  src(part('window-driver','Window switch, driver side · 463-820-22-10','The window switch block in the driver door trim.',[-.4,.2,-.15],r=>{block(r,[-.6,0,-.15],[.24,.06,.12],black);for(const s of [-1,1])rocker(r,[-.6+s*.055,.02,-.15],.05,.08,grey);}),plates.powerSeats),
  src(part('window-passenger','Window switch, passenger side · 463-820-28-10','The window switch in the passenger door trim.',[.4,.2,-.15],r=>{block(r,[.6,0,-.15],[.14,.06,.12],black);rocker(r,[.6,.02,-.15],.06,.08,grey);}),plates.powerSeats),
  src(part('seat-driver','Seat switch, driver side · 210-820-91-10','The seat-shaped adjuster switch for the driver power seat.',[-.45,.1,-.5],r=>{block(r,[-.6,0,-.5],[.06,.04,.16],grey);block(r,[-.6,0,-.4],[.18,.04,.05],grey);}),plates.powerSeats),
  src(part('seat-passenger','Seat switch, passenger side · 210-820-90-10','The seat-shaped adjuster switch for the passenger power seat.',[.45,.1,-.5],r=>{block(r,[.6,0,-.5],[.06,.04,.16],grey);block(r,[.6,0,-.4],[.18,.04,.05],grey);}),plates.powerSeats),
  src(part('cruise-engagement','Cruise-control engagement switch · 008-545-23-24','The switch the cruise-control diagram lists for the G500 system.',[.45,-.3,-.4],r=>{cyl(r,[.4,0,-.6],y,-.06,.06,.035,plastic,12);block(r,[.4,.09,-.6],[.05,.05,.05],black);}),plates.cruise)
];
const switches=study('g500-switch-set','Dash, door and pedal switches','The center switch panel, hazard and fog lamp switches, the brake-lamp and cruise switches at the pedals, and the window and seat switches in the doors.',plates.switches,switchRows);
switches.viewAngle=[-.3,.2];

// 5. PARKTRONIC.
const parkRows=[
  part('control-module','PARKTRONIC control module · 463-545-07-32','The control unit that drives the bumper sensors and decides the warning distance.',[0,.45,.4],r=>{block(r,[0,.3,.45],[.36,.08,.24],grey);block(r,[.2,.3,.45],[.05,.06,.12],black);}),
  part('sensor','PARKTRONIC sensor · 001-542-59-18','An ultrasonic sensor set into the rear bumper face.',[0,-.4,0],r=>{for(const dx of [-.45,-.15,.15,.45]){cyl(r,[dx,-.05,-.1],y,-.04,.06,.045,dark,14);cyl(r,[dx,.06,-.1],y,0,.05,.025,plastic,10);}}),
  part('sensor-spacer','PARKTRONIC sensor spacer · 000-545-03-51','A spacer ring that sets each sensor flush in the bumper.',[0,-.65,-.2],r=>{for(const dx of [-.45,-.15,.15,.45])sleeve(r,[dx,-.1,-.1],y,0,.015,.06,.046,plastic,14);}),
  part('repair-kit','PARKTRONIC repair kit · 463-822-01-00','The kit the catalog lists for fitting the system to the bumper.',[.5,.2,-.45],r=>{block(r,[.55,.1,-.45],[.2,.04,.1],steel);block(r,[.55,.13,-.38],[.2,.04,.02],steel);}),
  part('harness','PARKTRONIC harness · 463-540-71-13','The cable harness from the bumper sensors to the control module.',[0,.15,-.4],r=>wire(r,[[-.45,.1,-.1],[-.15,.12,-.12],[.15,.12,-.12],[.45,.1,-.1],[.45,.25,.2],[0,.3,.35]],.012,black)),
  part('buzzer','PARKTRONIC warning buzzer · 463-542-00-23','The buzzer that sounds the reversing warning inside the cabin.',[-.5,.4,.3],r=>{cyl(r,[-.5,.3,.4],z,-.04,.04,.06,black,16);block(r,[-.5,.38,.4],[.05,.05,.04],plastic);})
].map(p=>src(p,plates.parking));
const parktronic=study('g500-parktronic','PARKTRONIC reversing aid','Ultrasonic sensors in the rear bumper report to a control module. A buzzer in the cabin warns as the gap closes.',plates.parking,parkRows);
parktronic.viewAngle=[-.5,.3];

// 6. Horns, alarm and relays.
const hornCone=(r,c,color)=>{turn(r,c,y,[[0,0],[0,.13],[.03,.13],[.06,.06],[.1,.05],[.1,0]],color,{n:20});block(r,[c[0],c[1]+.13,c[2]+.1],[.04,.04,.16],steel);};
const hornRows=[
  src(part('horn-high','High-note horn · 006-542-78-20','The higher-pitched of the two horns behind the grille.',[-.3,-.3,.3],r=>hornCone(r,[-.4,-.05,.35],dark)),plates.horn),
  src(part('horn-low','Low-note horn · 006-542-90-20','The lower-pitched of the two horns behind the grille.',[.3,-.3,.3],r=>hornCone(r,[.4,-.05,.35],dark)),plates.horn),
  src(part('alarm-module','Anti-theft alarm control module · 211-820-91-26','The alarm control unit, marked G500.',[-.35,.4,.05],r=>block(r,[-.45,.3,.05],[.26,.08,.18],grey)),plates.antiTheft),
  src(part('siren','Alarm siren · 219-820-32-26','The self-powered alarm siren, marked G500.',[.35,.4,.05],r=>{block(r,[.45,.3,.05],[.16,.14,.18],black);cyl(r,[.45,.22,.05],y,-.03,0,.05,plastic,14);}),plates.antiTheft),
  src(part('relay-multi','Relay · 000-982-81-23','A plug-in relay the catalog lists for the ABS/ESP, fan, differential-lock and wiper positions.',[-.45,0,-.35],r=>relay(r,[-.45,0,-.4],grey)),plates.components),
  src(part('relay-ac','A/C relay · 000-982-80-23','The plug-in relay for the air-conditioning position.',[-.15,0,-.45],r=>relay(r,[-.15,0,-.4],grey)),plates.components),
  src(part('relay-locking','Central locking relay · 002-542-03-19','The plug-in relay for the central-locking position.',[.15,0,-.45],r=>relay(r,[.15,0,-.4],'#6c7f86')),plates.components),
];
const horns=study('g500-horns-relays','Horns, alarm and relays','The two horns behind the grille, the anti-theft siren and its control unit, three plug-in relays and a temperature sensor from the fuse and relay group.',plates.horn,hornRows);
horns.viewAngle=[-.5,.3];

// 7. Ignition lock.
const lockRows=[
  part('lock-housing','Ignition lock housing · 037-545-61-32','The housing that carries the ignition lock in the steering column.',[0,.35,0],r=>{cyl(r,[0,.1,0],y,0,.3,.09,grey,18);block(r,[0,.25,-.12],[.1,.16,.06],grey);}),
  part('lock-pin','Lock housing pin · 203-462-03-74','The pin that holds the lock housing in the column.',[.3,.3,-.25],r=>cyl(r,[.15,.25,-.12],x,-.06,.06,.012,metal,8)),
  part('bezel','Ignition cylinder bezel · 208-680-04-65','The trim ring around the key slot in the dash.',[0,-.3,0],r=>sleeve(r,[0,-.05,0],y,0,.04,.13,.07,chrome,22))
].map(p=>src(p,plates.ignitionLock));
const ignitionLock=study('g500-ignition-lock','Ignition lock housing','The housing, pin and trim ring around the ignition switch. The switch itself is modeled already.',plates.ignitionLock,lockRows);
ignitionLock.viewAngle=[-.6,.3];

// 8. Navigation, audio and antennas.
const navRows=[
  src(part('display','COMAND display unit · 463-820-12-89','The display unit in the center of the dash.',[0,-.4,.4],r=>{block(r,[0,-.1,.5],[.5,.05,.28],black);block(r,[0,-.13,.5],[.42,.01,.2],'#3e6b80');}),plates.navigation),
  src(part('receiver','Navigation receiver · 220-820-15-97','The navigation receiver unit behind the dash.',[0,.4,.4],r=>{block(r,[0,.2,.5],[.46,.26,.12],grey);block(r,[.18,.34,.5],[.06,.03,.06],black);}),plates.navigation),
  src(part('receiver-upper-bracket','Receiver upper bracket · 463-545-18-47','The bracket that holds the top of the receiver.',[0,.55,.7],r=>{block(r,[0,.2,.6],[.5,.2,.015],steel);block(r,[-.25,.2,.63],[.015,.2,.05],steel);}),plates.navigation),
  src(part('receiver-lower-bracket','Receiver lower bracket · 463-545-11-47','The bracket under the receiver.',[0,.55,.15],r=>{block(r,[0,.2,.4],[.5,.2,.015],steel);block(r,[.25,.2,.37],[.015,.2,.05],steel);}),plates.navigation),
  src(part('amplifier','Amplifier · 210-820-23-89','The amplifier listed in the navigation diagram.',[-.5,.3,.2],r=>{block(r,[-.6,.2,.3],[.2,.14,.06],dark);for(let i=0;i<4;i++)block(r,[-.67+i*.045,.2,.34],[.01,.14,.03],grey);}),plates.navigation),
  src(part('roof-antenna','Roof antenna · 210-820-21-75','The antenna assembly on the roof.',[0,0,.45],r=>{turn(r,[.4,0,-.2],z,[[0,0],[0,.08],[.03,.06],[.06,.02],[.06,0]],black,{n:16});cyl(r,[.4,0,-.15],z,0,.3,.006,black,6);}),plates.antenna),
  src(part('roof-antenna-cap','Roof antenna cap · 202-827-00-31','The cap over the roof antenna base.',[.25,0,.65],r=>turn(r,[.4,0,-.1],z,[[0,0],[0,.05],[.02,.04],[.04,0]],plastic,{n:14})),plates.antenna),
  src(part('bumper-antenna','Rear bumper antenna · 463-820-23-75','The antenna assembly mounted at the rear bumper.',[0,0,-.45],r=>{cyl(r,[-.1,0,-.6],x,0,.5,.015,black,8);block(r,[-.1,0,-.6],[.06,.05,.05],plastic);}),plates.antenna),
  src(part('bumper-antenna-bracket-right','Rear bumper antenna bracket, passenger side · 463-885-18-14','The passenger-side bracket that holds the bumper antenna.',[.3,0,-.6],r=>{block(r,[.4,0,-.6],[.03,.08,.12],steel);block(r,[.4,0,-.67],[.1,.08,.02],steel);}),plates.antenna),
  src(part('bumper-antenna-bracket-left','Rear bumper antenna bracket, driver side · 463-885-17-14','The driver-side bracket that holds the bumper antenna.',[-.3,0,-.6],r=>{block(r,[-.1,0,-.6],[.03,.08,.12],steel);block(r,[-.1,0,-.67],[.1,.08,.02],steel);}),plates.antenna)
];
const navAudio=study('g500-navigation-audio','Navigation, audio and antennas','The COMAND display and receiver with its brackets, the amplifier, the roof antenna and the rear bumper antenna with its brackets.',plates.navigation,navRows);
navAudio.viewAngle=[-.5,.3];

// 9. Alternator parts. The shaft runs along x.
const altRows=[
  part('front-bearing','Alternator front bearing · 007-981-89-25','The ball bearing at the pulley end of the rotor shaft, marked G500.',[-.35,0,.3],r=>bearing(r,[-.35,0,0],x,.04,.1,.05)),
  part('rear-bearing','Alternator rear bearing · 007-981-73-25','The smaller ball bearing at the slip-ring end of the shaft, marked G500.',[.35,0,.3],r=>bearing(r,[.3,0,0],x,.03,.07,.04)),
  part('regulator','Voltage regulator · 002-154-92-06','The regulator and brush holder on the back of the alternator, marked G500.',[.55,.3,0],r=>{block(r,[.45,.12,.05],[.08,.1,.16],black);block(r,[.45,.05,.05],[.04,.05,.06],copper);}),
  part('rear-cover','Alternator rear cover · 000-154-33-04','The plastic cover over the rectifier and regulator, marked G500.',[.7,0,0],r=>turn(r,[.4,0,0],x,[[0,0],[0,.24],[.05,.24],[.09,.18],[.1,0]],plastic,{n:22})),
  part('upper-bracket','Alternator upper bracket · 126-501-00-20','The upper mounting bracket for the alternator on the engine.',[0,0,.6],r=>{block(r,[0,0,.32],[.5,.06,.04],grey);block(r,[-.22,0,.27],[.04,.06,.1],grey);}),
  part('lower-bracket','Alternator lower bracket · 112-203-01-40','The cast lower bracket that carries the alternator on the engine.',[0,0,-.6],r=>{block(r,[0,0,-.3],[.55,.16,.05],grey);for(const s of [-1,1])block(r,[s*.24,0,-.23],[.05,.16,.12],grey);})
].map(p=>src(p,plates.alternator));
const alternatorParts=study('g500-alternator-parts','Alternator bearings, regulator and brackets','The two rotor bearings, the voltage regulator and rear cover, and the two brackets that hold the alternator on the M113.',plates.alternator,altRows);
alternatorParts.viewAngle=[-.6,.3];

// 10. Starter parts. The shaft runs along x.
const starterRows=[
  part('front-bearing','Starter front bearing · 019-981-19-10','The bearing at the drive end of the starter, marked G500.',[-.45,0,.25],r=>bearing(r,[-.5,0,0],x,.03,.07,.04)),
  part('center-bearing','Starter center bearing · 000-151-53-50','The bearing between the motor and the drive gearing.',[0,0,.35],r=>bearing(r,[-.05,0,0],x,.035,.08,.04,gold)),
  part('rear-bearing','Starter rear bearing · 000-151-68-50','The bearing in the commutator end cap.',[.45,0,.25],r=>bearing(r,[.45,0,0],x,.025,.06,.035,gold)),
  part('drive-end-kit','Drive-end bearing repair package · 000-151-64-15','The repair kit for the drive-end bearing, marked G500.',[-.5,0,-.3],r=>{sleeve(r,[-.6,0,0],x,0,.05,.1,.08,steel,18);cyl(r,[-.62,0,0],x,0,.02,.11,metal,18);}),
  part('brushes','Starter brushes · 001-151-08-14','The carbon brushes that bear on the armature commutator.',[.3,.35,0],r=>{for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2])block(r,[.32,Math.cos(a)*.08,Math.sin(a)*.08],[.05,.03,.03],dark);})
].map(p=>src(p,plates.starter));
const starterParts=study('g500-starter-parts','Starter bearings and brushes','The three starter bearings, the drive-end bearing kit and the brush set.',plates.starter,starterRows);
starterParts.viewAngle=[-.6,.3];

// 11. Battery mounting.
const batteryRows=[
  part('bracket-front','Battery bracket, front · 463-600-02-37','The front bracket listed in the battery diagram.',[0,-.45,0],r=>{block(r,[0,-.3,-.2],[.7,.04,.2],steel);block(r,[0,-.26,-.3],[.7,.12,.02],steel);}),
  part('bracket-rear','Battery bracket, rear · 463-600-00-37','The rear bracket listed in the battery diagram.',[0,.45,0],r=>{block(r,[0,.3,-.2],[.7,.04,.2],steel);block(r,[0,.26,-.3],[.7,.12,.02],steel);}),
  part('bracket-side','Battery bracket, side · 463-602-03-12','The side bracket listed in the battery diagram.',[.5,0,0],r=>{block(r,[.42,0,-.2],[.04,.56,.2],steel);block(r,[.38,0,-.3],[.12,.56,.02],steel);}),
  part('terminal-boot','Battery terminal boot · 001-546-08-35','The insulating boot over the positive battery terminal.',[-.2,0,.45],r=>turn(r,[-.2,0,.05],z,[[0,0],[0,.06],[.06,.05],[.1,.03],[.12,0]],red,{n:16})),
  part('cable-grommet','Positive cable grommet · 168-997-10-81','The grommet where the positive cable passes through the body.',[.2,0,.45],r=>sleeve(r,[.25,0,.15],x,0,.03,.05,.025,rubber,16))
].map(p=>src(p,plates.battery));
const batteryMount=study('g500-battery-mounting','Battery brackets, boot and grommet','The three brackets that locate the battery, the boot over its positive terminal and the grommet for the positive cable.',plates.battery,batteryRows);
batteryMount.viewAngle=[-.5,.35];

export const studies=[headlampMount,lampSeals,interiorLamps,switches,parktronic,horns,ignitionLock,navAudio,alternatorParts,starterParts,batteryMount];
export const views=new Map([
  ['g500-round-headlamp.retainer',headlampMount],
  ['g500-optic-amber.housing',lampSeals],
  ['g500-electronics-overhead-panel.cover',interiorLamps],
  ['g500-electronics-upper-panel.cover',switches],
  ['g500-electronics-sam-rear.cover',parktronic],
  ['g500-electronics-sam-front.relays',horns],
  ['g500-electronics-eis.cover',ignitionLock],
  ['body.gps-antenna',navAudio],
  ['g500-alternator-electrical.case',alternatorParts],
  ['g500-starter-electrical.case',starterParts],
  ['electrical.battery',batteryMount]
]);

// One claim per catalog page in each study.
const ids=(s,keys)=>s.groups[0].parts.filter(p=>!keys||keys.some(k=>p.id.endsWith('.'+k))).map(p=>p.id);
const claim=(s,keys,fact,need,source)=>({ids:ids(s,keys),kind:'diagram',fact,need,source});
const shape='Shapes are schematic; measure the part and its fitted position.';
export const claims=[
  claim(headlampMount,['seal','support'],'The 2002 G500 headlamp components diagram lists the headlamp seal and support for both sides beside lamp unit 463-820-00-59.','Measure the seal section, the support bracket and the adjuster positions. '+shape,plates.headlampComponents),
  claim(headlampMount,['sentinel-sensor'],'The 2002 G500 headlamps diagram lists the sentinel sensor with a G500 note.','Confirm what the sensor detects, where it mounts and its fitment by VIN. '+shape,plates.headlamps),
  claim(lampSeals,['tail-seal-left','tail-seal-right'],'The 2002 G500 tail lamps diagram lists a separate seal for the driver and passenger rear lamps.','Measure the gasket outline and section against the lamp housing. '+shape,plates.tail),
  claim(lampSeals,['rear-fog-seal'],'The 2002 G500 rear fog lamp diagram lists the lamp, lens and this seal.','Measure the seal and its seat in the bumper. '+shape,plates.rearFog),
  claim(lampSeals,['marker-seal'],'The 2002 G500 side marker diagram lists this seal for both sides.','Measure the seal outline and the marker cutout. '+shape,plates.marker),
  claim(lampSeals,['signal-pad'],'The 2002 G500 signal lamp diagram lists this pad for both wing-top signal lamps.','Measure the pad and its seat on the wing. '+shape,plates.signal),
  claim(interiorLamps,null,'The MB Parts Giant G500 interior lights listing gives the dome lamp, map lamp (2002–2005) and compartment lamp with 2002 G500 fitment.','Confirm each lamp position and trim colour by VIN, and measure the housings and lenses. '+shape,plates.interior),
  claim(switches,['switch-panel','hazard','fog','stoplamp'],'The 2002 G500 switches diagram lists the switch panel, the hazard switch variants, the fog lamp switch and the stoplamp switch.','The hazard switch number depends on heated seats, windshield heat, alarm and interior protection; confirm it by VIN. '+shape,plates.switches),
  claim(switches,['window-driver','window-passenger','seat-driver','seat-passenger'],'The 2002 G500 power seats diagram lists the driver and passenger window switches and seat switches.','Confirm the switch variants by VIN and measure the door-trim bezels they sit in. '+shape,plates.powerSeats),
  claim(switches,['cruise-engagement'],'The 2002 G500 cruise control diagram lists this engagement switch with a G500 note.','Confirm where the switch mounts and what it senses. '+shape,plates.cruise),
  claim(parktronic,null,'The 2002 G500 parking aid diagram lists the PARKTRONIC control module, sensor, sensor spacer, repair kit, harness and warning buzzer.','Confirm PARKTRONIC is fitted by VIN, count the sensors and measure their positions in the bumper. '+shape,plates.parking),
  claim(horns,['horn-high','horn-low'],'The 2003 G500 horn diagram lists a high-note and a low-note horn.','Measure both horns and their brackets behind the grille. '+shape,plates.horn),
  claim(horns,['alarm-module','siren'],'The 2002 G500 anti-theft diagram lists the alarm control module and siren with G500 notes.','Confirm the alarm option by VIN and locate the siren and module. '+shape,plates.antiTheft),
  claim(horns,['relay-multi','relay-ac','relay-locking'],'The 2002 G500 electrical components diagram lists these relays by fuse and relay position.','Map each relay to its socket in the fuse and relay boxes and confirm what the temperature sensor measures. '+shape,plates.components),
  claim(ignitionLock,null,'The 2004 G500 instrument panel diagram lists the lock housing, housing pin and cylinder bezel beside the ignition switch.','The 2004 page is used for the 2002 car; confirm the numbers by VIN and measure the column parts. '+shape,plates.ignitionLock),
  claim(navAudio,['display','receiver','receiver-upper-bracket','receiver-lower-bracket','amplifier'],'The 2002 G500 navigation diagram lists the display unit, receiver, both receiver brackets and the amplifier.','Confirm the COMAND and audio equipment by VIN and measure the units and brackets in the dash. '+shape,plates.navigation),
  claim(navAudio,['roof-antenna','roof-antenna-cap','bumper-antenna','bumper-antenna-bracket-right','bumper-antenna-bracket-left'],'The 2002 G500 antenna and radio diagram lists the roof antenna and cap and the rear bumper antenna with both brackets.','Confirm which antennas are fitted by VIN and measure their mounts. '+shape,plates.antenna),
  claim(alternatorParts,null,'The 2002 G500 alternator diagram lists both rotor bearings, the voltage regulator and the rear cover with G500 notes, and the upper and lower brackets.','Two alternator numbers are listed; confirm which is fitted by VIN and measure the bearings, regulator and brackets. '+shape,plates.alternator),
  claim(starterParts,null,'The 2002 G500 starter diagram lists the front, center and rear bearings, the drive-end bearing kit and the brushes for starter 112-151-00-01.','Measure the bearings and brush set on a dismantled starter. '+shape,plates.starter),
  claim(batteryMount,null,'The 2003 G500 battery diagram lists the front, rear and side brackets, the terminal boot and the positive cable grommet.','The 2003 page is used for the 2002 car; confirm by VIN and measure the battery box and brackets. '+shape,plates.battery)
];
