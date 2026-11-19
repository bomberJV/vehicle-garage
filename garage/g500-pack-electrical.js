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
// Round 2 adds the third brake light, licence lamps, speakers, radio and CD changer, seat motors
// and heaters, wiper linkage parts and the back-door wiper, the fuel-level sender, switch bezels
// and a few stand-alone sensors. Where the register has only a generic part (licence lamps,
// door speakers, seat motors, rear wiper, fuel sender), the numbered parts open from it.
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
  battery:plate('2003 G500 battery diagram','2003-mercedes_benz-g500/charging-starting/battery'),
  // Round 2.
  highMount:plate('2002 G500 high mount lamps diagram','2002-mercedes_benz-g500/headlights-lighting/high-mount-lamps'),
  license:plate('2002 G500 license lamps diagram','2002-mercedes_benz-g500/headlights-lighting/license-lamps'),
  fog:plate('2002 G500 fog lamps diagram','2002-mercedes_benz-g500/headlights-lighting/fog-lamps'),
  sound:plate('2002 G500 sound system diagram','2002-mercedes_benz-g500/body-hardware/sound-system'),
  wipers:plate('2002 G500 wipers diagram','2002-mercedes_benz-g500/electrical/wipers'),
  backDoorWiper:plate('2005 G500 wiper and washer components diagram (back door)','2005-mercedes_benz-g500/electrical/wiper-washer-components'),
  rearWiperMotor:{label:'Keyes Mercedes-Benz parts · 463-906-44-00 rear wiper motor',url:'https://parts.keyesmercedes.com/oem-parts/mercedes-benz-wiper-motor-4639064400'},
  heatedSeats:plate('2002 G500 heated seats diagram','2002-mercedes_benz-g500/electrical/heated-seats'),
  senders:plate('2002 G500 senders diagram','2002-mercedes_benz-g500/electrical/senders'),
  restraints:plate('2002 G500 supplemental restraint system diagram','2002-mercedes_benz-g500/electrical/supplemental-restraint-system'),
  tirePressure:plate('2002 G500 tire pressure monitoring diagram','2002-mercedes_benz-g500/electrical/tire-pressure-monitoring'),
  console:plate('2002 G500 center console diagram','2002-mercedes_benz-g500/body-hardware/center-console'),
  instrumentPanel:plate('2002 G500 instrument panel diagram','2002-mercedes_benz-g500/body-hardware/instrument-panel')
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
  src(part('fuse-puller','Fuse puller · 000-581-06-54','The plastic tongs kept in the fuse box for pulling blade fuses.',[.45,0,-.45],r=>{for(const q of [-1,1])block(r,[.45+q*.04,0,-.4],[.025,.05,.3],'#d7c66a');block(r,[.45,0,-.25],[.11,.05,.04],'#d7c66a');}),plates.components),
];
const horns=study('g500-horns-relays','Horns, alarm and relays','The two horns behind the grille, the anti-theft siren and its control unit, three plug-in relays and the fuse puller from the fuse and relay group.',plates.horn,hornRows);
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

// Round 2 helpers.
// A round loudspeaker facing +y: basket, cone and magnet.
const speaker=(r,c,rad,color=dark)=>{
  sleeve(r,c,y,0,.02,rad,rad*.88,steel,22);
  turn(r,c,y,[[rad*.2,.12],[rad*.86,.02]],color,{n:22});
  cyl(r,[c[0],c[1]+.1,c[2]],y,0,.06,rad*.35,black,16);
};
// A slotted grille in the x–z plane.
const grille=(r,c,w,h,color=black)=>{block(r,c,[w,.02,h],color);for(let i=-2;i<=2;i++)block(r,[c[0],c[1]-.012,c[2]+i*h/6],[w*.8,.008,h*.05],grey);};
// A flat link bar between two points in the x–z plane with a boss at each end.
const link=(r,a,b,color=steel)=>{tube(r,a,b,.018,color);for(const p of [a,b])cyl(r,p,y,-.025,.025,.035,color,12);};

// 12. Third brake light, licence lamps and fog lamp seal.
const rearLampRows=[
  src(part('high-mount','Third brake light · 463-820-06-56','The high-mount stop lamp the G500 diagram lists for the rear.',[0,0,.5],r=>{block(r,[0,0,.55],[.6,.1,.08],black);block(r,[0,-.055,.55],[.54,.01,.05],red);}),plates.highMount),
  src(part('high-mount-housing','Third brake light housing · 463-820-01-09','The housing that carries the high-mount lamp.',[0,.25,.7],r=>{block(r,[0,.08,.6],[.66,.06,.12],plastic);block(r,[0,.12,.67],[.66,.02,.02],plastic);}),plates.highMount),
  src(part('high-mount-grommet','Third brake light grommet · 009-997-68-81','The grommet the lamp diagram lists with the housing, where the lamp feed passes through.',[.4,.3,.75],r=>sleeve(r,[.3,.14,.6],y,0,.03,.035,.015,rubber,14)),plates.highMount),
  src(part('high-mount-spacer','Third brake light spacer · 000-987-26-27','The spacer that sets the high-mount housing off its mounting face.',[-.4,.3,.75],r=>{for(const s of [-1,1])sleeve(r,[s*.25,.14,.6],y,0,.04,.025,.01,plastic,12);}),plates.highMount),
  src(part('licence-lamp','Licence lamp · 463-820-03-56','One of the two lamps over the rear licence plate; the same number serves both sides.',[0,0,-.1],r=>{for(const s of [-1,1]){block(r,[s*.3,0,-.05],[.22,.1,.07],black);}}),plates.license),
  src(part('licence-lens','Licence lamp lens · 003-826-54-90','The clear lens of each licence lamp.',[0,-.35,-.25],r=>{for(const s of [-1,1])block(r,[s*.3,-.06,-.09],[.18,.02,.04],lens);}),plates.license),
  src(part('fog-seal','Front fog lamp seal · 000-826-18-91','The seal the G500 fog lamp diagram lists for both front fog lamps.',[0,.2,-.65],r=>sleeve(r,[0,0,-.6],y,0,.025,.16,.12,rubber,24)),plates.fog)
];
const rearLamps=study('g500-lamp-parts-2','Third brake light, licence lamps and fog lamp seal','The high-mount stop lamp with its housing, grommet and spacer, the licence lamps and their lenses, and the front fog lamp seal.',plates.highMount,rearLampRows);
rearLamps.viewAngle=[-.5,.25];

// 13. Dash and pillar speakers.
const dashSpeakerRows=[
  part('center','Center dash speaker · 463-820-11-02','The speaker under the center of the instrument panel pad.',[0,0,.35],r=>speaker(r,[0,0,.35],.12)),
  part('center-grille','Center dash speaker grille · 463-680-75-08','The grille over the center dash speaker.',[0,-.35,.5],r=>grille(r,[0,-.05,.35],.3,.18)),
  part('pillar','Rear pillar speaker · 463-820-04-02','The speaker in each rear pillar trim; one number serves both sides.',[0,0,-.4],r=>{for(const s of [-1,1])speaker(r,[s*.45,0,-.35],.1);})
].map(p=>src(p,plates.sound));
const dashSpeakers=study('g500-dash-speakers','Dash and pillar speakers','The center speaker and grille in the instrument panel and the two rear pillar speakers.',plates.sound,dashSpeakerRows);
dashSpeakers.viewAngle=[-.4,.3];

// 14. Door speakers.
const doorSpeakerRows=[
  part('front','Front door speaker · 463-820-08-02','The loudspeaker in each front door.',[-.3,0,.3],r=>speaker(r,[-.4,0,.3],.16)),
  part('front-insulator','Front door speaker insulator · 463-827-01-31','The ring that seals the front door speaker to the door panel.',[-.3,.35,.3],r=>sleeve(r,[-.4,-.02,.3],y,0,.02,.2,.15,rubber,24)),
  part('rear','Rear door speaker · 463-820-09-02','The loudspeaker in each rear door.',[.3,0,-.3],r=>speaker(r,[.4,0,-.3],.14)),
  part('rear-insulator','Rear door speaker insulator · 463-827-02-31','The ring that seals the rear door speaker to the door panel.',[.3,.35,-.3],r=>sleeve(r,[.4,-.02,-.3],y,0,.02,.18,.13,rubber,24)),
  part('grille','Door speaker grille · 163-737-01-88','The trim grille over each front and rear door speaker, in black or gray.',[0,-.4,0],r=>{for(const [cx,cz,s] of [[-.4,.3,.4],[.4,-.3,.36]])grille(r,[cx,-.06,cz],s,s);})
].map(p=>src(p,plates.sound));
const doorSpeakers=study('g500-door-speakers','Door speakers','The front and rear door loudspeakers, their seal rings and the door grille.',plates.sound,doorSpeakerRows);
doorSpeakers.viewAngle=[-.5,.25];

// 15. Radio and CD changer.
const radioRows=[
  part('radio','Radio · 203-820-16-86','The radio head unit the G500 sound system diagram lists.',[0,-.35,.35],r=>{block(r,[0,0,.4],[.5,.3,.14],grey);block(r,[0,-.16,.4],[.5,.02,.14],black);for(const s of [-1,1])cyl(r,[s*.18,-.17,.4],y,-.03,0,.025,chrome,12);}),
  part('cd-changer','CD changer · 203-820-90-89','The CD changer that feeds the radio.',[0,.1,-.25],r=>{block(r,[0,0,-.3],[.5,.36,.14],dark);block(r,[0,-.185,-.3],[.3,.01,.03],black);}),
  part('cd-rear-bracket','CD changer rear bracket · 463-540-69-73','The bracket at the back of the CD changer.',[0,.45,-.3],r=>{block(r,[0,.2,-.3],[.56,.015,.18],steel);for(const s of [-1,1])block(r,[s*.27,.17,-.3],[.02,.06,.18],steel);}),
  part('cd-front-bracket','CD changer front bracket · 463-540-56-73','The bracket at the front of the CD changer.',[0,-.45,-.45],r=>{block(r,[0,-.2,-.38],[.56,.015,.04],steel);for(const s of [-1,1])block(r,[s*.27,-.17,-.3],[.02,.06,.18],steel);}),
  part('cd-bezel','CD changer bezel · 463-820-01-90','The trim bezel around the CD changer opening.',[0,-.7,-.3],r=>frame(r,[0,-.24,-.3],.54,.18,.03,plastic))
].map(p=>src(p,plates.sound));
const radioCd=study('g500-radio-cd-changer','Radio and CD changer','The radio head unit and the CD changer with its two brackets and bezel.',plates.sound,radioRows);
radioCd.viewAngle=[-.5,.3];

// 16. Power seat motors.
const motor=(r,c,a,color=dark)=>{cyl(r,c,a,0,.22,.05,color,16);cyl(r,c,a,.22,.26,.03,metal,12);block(r,[c[0],c[1],c[2]+.06],[.05,.05,.04],black);};
const seatMotorRows=[
  part('fore-aft','Seat fore-and-aft motor · 203-820-12-42','The motor that drives the seat along its rails.',[0,-.3,-.3],r=>motor(r,[-.15,0,-.35],x)),
  part('height','Seat height motor · 203-820-37-42','The motor that raises and lowers the seat cushion.',[-.4,0,0],r=>motor(r,[-.45,0,-.1],z)),
  part('backrest','Seat backrest motor · 203-820-38-42','The motor that reclines the backrest.',[.4,0,.3],r=>motor(r,[.35,0,.25],y))
].map(p=>src(p,plates.powerSeats));
const seatMotors=study('g500-seat-motors','Power seat motors','The three motors the G500 power seats diagram lists: fore-and-aft, height and backrest.',plates.powerSeats,seatMotorRows);
seatMotors.viewAngle=[-.6,.3];

// 17. Rear seat heating.
const pad=(r,c,w,h,dir)=>{
  const s=dir==='flat'?[w,h,.015]:[w,.015,h];block(r,c,s,'#6d4b3c');
  for(let i=-2;i<=2;i++)block(r,dir==='flat'?[c[0],c[1]+i*h/6,c[2]+.01]:[c[0],c[1]-.01,c[2]+i*h/6],dir==='flat'?[w*.85,.01,.006]:[w*.85,.006,.01],copper);
};
const heatRows=[
  part('cushion-heater','Rear seat cushion heater · 463-820-09-98','The heater mat in each rear seat cushion section.',[0,-.3,-.3],r=>pad(r,[0,-.1,-.4],.7,.4,'flat')),
  part('backrest-heater','Rear seat backrest heater · 463-820-12-98','The heater mat in each rear backrest section.',[0,.3,.3],r=>pad(r,[0,.15,.2],.7,.5,'upright')),
  part('switch','Seat heater switch · 210-820-75-10','The seat heater switch the heated seats diagram lists, marked G500.',[.55,0,.5],r=>rocker(r,[.6,0,.6],.08,.12,grey))
].map(p=>src(p,plates.heatedSeats));
const rearHeat=study('g500-rear-seat-heating','Rear seat heaters and switch','The heater mats in the rear seat cushion and backrest and the seat heater switch.',plates.heatedSeats,heatRows);
rearHeat.viewAngle=[-.5,.35];

// 18. Windshield wiper linkage.
const wiperRows=[
  part('link-arm','Wiper link arm · 463-820-01-07','The short arm the linkage diagram lists beside the linkage assembly.',[0,.3,.35],r=>link(r,[-.1,0,.3],[.15,0,.3])),
  part('lower-link','Wiper lower link · 463-820-01-41','The lower link rod of the windshield wiper linkage.',[-.3,.3,0],r=>link(r,[-.6,0,0],[-.1,0,.1])),
  part('upper-link','Wiper upper link · 001-820-45-41','The upper link rod of the windshield wiper linkage.',[.3,.3,0],r=>link(r,[.1,0,.1],[.6,0,0])),
  part('arm-retainer','Wiper arm retainer kit · 463-820-18-41','The kit that holds each wiper arm on its pivot shaft.',[-.5,-.3,.4],r=>{for(const s of [-1,1]){cyl(r,[s*.6,0,.35],z,0,.04,.04,metal,14);cyl(r,[s*.6,0,.39],z,0,.02,.025,dark,10);}}),
  part('motor-plate','Wiper motor plate · 463-545-22-82','The plate the wiper motor mounts to.',[0,.45,-.35],r=>{block(r,[0,.05,-.3],[.4,.02,.25],steel);for(const s of [-1,1])cyl(r,[s*.16,.05,-.3],y,-.02,.02,.02,metal,8);}),
  part('cover','Wiper motor cover · 000-824-07-49','The cover listed with the wiper motor and plate.',[0,-.45,-.35],r=>turn(r,[0,-.05,-.3],y,[[0,0],[0,.12],[.04,.1],[.07,.04],[.08,0]],plastic,{n:18})),
  part('rain-sensor','Rain sensor · 210-820-57-10','The sensor behind the windshield that reports rain to the wiper control.',[.5,-.3,.5],r=>{block(r,[.5,0,.55],[.14,.04,.1],black);block(r,[.5,-.025,.55],[.1,.01,.07],lens);})
].map(p=>src(p,plates.wipers));
const wiperLinkage=study('g500-wiper-linkage-parts','Wiper linkage parts and rain sensor','The link arm, the lower and upper link rods, the arm retainer kit, the wiper motor plate and cover, and the rain sensor.',plates.wipers,wiperRows);
wiperLinkage.viewAngle=[-.5,.35];

// 19. Back-door wiper.
const rearWiperRows=[
  src(part('arm','Rear wiper arm · 463-820-02-44','The wiper arm on the back-door glass.',[0,0,.35],r=>{tube(r,[-.4,0,-.2],[.35,0,.3],.02,black);cyl(r,[-.4,0,-.2],y,-.04,.04,.05,black,14);}),plates.backDoorWiper),
  src(part('blade','Rear wiper blade · 463-820-03-45','The wiper blade on the back-door arm.',[.1,-.25,.45],r=>{block(r,[.35,-.03,.3],[.05,.03,.5],dark);}),plates.backDoorWiper),
  src(part('insert','Rear wiper blade insert · 000-824-61-27','The rubber insert in the back-door blade.',[.25,-.45,.5],r=>block(r,[.35,-.055,.3],[.015,.015,.48],rubber)),plates.wipers),
  src(part('motor','Rear wiper motor · 463-906-44-00','The motor that drives the back-door wiper.',[-.4,.3,-.4],r=>{cyl(r,[-.4,.15,-.2],y,0,.25,.08,dark,18);block(r,[-.4,.1,-.35],[.18,.12,.1],grey);}),plates.backDoorWiper)
];
const rearWiper=study('g500-rear-wiper','Back-door wiper','The arm, blade, blade insert and motor of the back-door wiper.',plates.backDoorWiper,rearWiperRows);
rearWiper.viewAngle=[-.5,.3];

// 20. Fuel-level sender.
const senderRows=[
  part('sender','Fuel-level sender · 463-542-08-17','The sending unit in the fuel tank that reports the fuel level to the cluster.',[0,0,.3],r=>{cyl(r,[0,0,.4],z,0,.05,.16,plastic,22);tube(r,[0,0,.4],[0,0,-.4],.015,metal);tube(r,[0,0,-.1],[.3,0,-.3],.01,metal);block(r,[.3,0,-.3],[.1,.06,.05],dark);}),
  part('seal','Fuel-level sender seal · 210-471-00-79','The ring seal under the sender flange in the tank opening.',[0,0,.6],r=>sleeve(r,[0,0,.37],z,0,.03,.17,.13,rubber,24))
].map(p=>src(p,plates.senders));
const fuelSender=study('g500-fuel-sender','Fuel-level sender and seal','The sending unit in the rear fuel tank and the seal under its flange.',plates.senders,senderRows);
fuelSender.viewAngle=[-.5,.35];

// 21. Switch bezels and cluster trim clip.
const bezelRows=[
  src(part('dash-switch-bezel','Dash switch bezel · 463-689-12-08','The bezel the instrument panel diagram lists around the dash switches.',[0,0,.5],r=>frame(r,[0,0,.5],.8,.16,.04,plastic)),plates.instrumentPanel),
  src(part('cluster-clip','Cluster trim clip · 210-988-05-78','The clip that holds the instrument cluster trim to the panel.',[0,.35,.4],r=>{for(const s of [-1,1])block(r,[s*.3,.05,.3],[.04,.04,.06],black);}),plates.instrumentPanel),
  src(part('window-bezels','Window switch bezels · 463-727-00-59 / 463-727-02-59','The two door-trim bezels that hold the window switches.',[-.4,0,-.3],r=>{frame(r,[-.45,0,-.25],.28,.14,.03,plastic);frame(r,[-.45,0,-.5],.16,.14,.03,plastic);}),plates.powerSeats),
  src(part('range-switch','Transfer-case switch · 463-820-21-10','The console switch the center console diagram lists for the transfer case.',[0,-.35,0],r=>{block(r,[0,0,0],[.2,.14,.1],black);block(r,[0,-.08,0],[.12,.03,.06],grey);block(r,[0,-.1,.02],[.05,.01,.015],amber);}),plates.console),
  src(part('seat-bezels','Seat switch bezels · 463-720-17-48 / 463-720-18-48','The bezels that hold the driver and passenger seat switches.',[.4,0,-.3],r=>{for(const dz of [-.25,-.5])frame(r,[.45,0,dz],.24,.12,.03,plastic);}),plates.powerSeats)
];
const bezels=study('g500-switch-bezels','Switch bezels, range switch and cluster trim clip','The dash switch bezel, the cluster trim clip, the transfer-case switch in the console, and the bezels that hold the window and seat switches.',plates.instrumentPanel,bezelRows);
bezels.viewAngle=[-.4,.25];

// 22. Occupant and tyre-pressure monitoring.
const monitorRows=[
  src(part('occupant-sensor','Passenger discriminating sensor · 463-820-08-10','The sensor the restraint diagram lists for the front passenger seat, marked G500.',[-.35,0,0],r=>{block(r,[-.4,0,0],[.4,.3,.015],'#5b6a70');wire(r,[[-.2,0,0],[-.05,0,-.1]],.01,black);block(r,[-.05,0,-.12],[.06,.04,.04],black);}),plates.restraints),
  src(part('tpms-module','Tire pressure monitor control module · 003-540-39-45','The tire pressure monitoring control unit, marked G500.',[.35,0,0],r=>{block(r,[.4,0,0],[.26,.18,.08],grey);block(r,[.55,0,0],[.04,.1,.05],black);}),plates.tirePressure)
];
const monitors=study('g500-occupant-tire-monitors','Passenger sensor and tire pressure module','The passenger discriminating sensor for the restraint system and the tire pressure monitoring control unit.',plates.restraints,monitorRows);
monitors.viewAngle=[-.5,.35];

export const studies=[headlampMount,lampSeals,interiorLamps,switches,parktronic,horns,ignitionLock,navAudio,alternatorParts,starterParts,batteryMount,
  rearLamps,dashSpeakers,doorSpeakers,radioCd,seatMotors,rearHeat,wiperLinkage,rearWiper,fuelSender,bezels,monitors];
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
  ['electrical.battery',batteryMount],
  ['body.licence-lamps',rearLamps],
  ['body.dash-speakers',dashSpeakers],
  ['door-g500-front-left.speaker',doorSpeakers],
  ['door-g500-front-right.speaker',doorSpeakers],
  ['door-g500-rear-left.speaker',doorSpeakers],
  ['door-g500-rear-right.speaker',doorSpeakers],
  ['g500-electronics-comand-electronics.cover',radioCd],
  ['g500-front-seat.travel',seatMotors],
  ['g500-front-seat.height',seatMotors],
  ['g500-front-seat.recline',seatMotors],
  ['seat-heating.rear-switches',rearHeat],
  ['body.wiper-linkage',wiperLinkage],
  ['closure-g500.wiper',rearWiper],
  ['g500-fuel-tank.sender',fuelSender],
  ['body.cluster-trim',bezels],
  ['g500-electronics-srs-control.tray',monitors],
  ['g500-fuse-panel.puller',horns]
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
  claim(batteryMount,null,'The 2003 G500 battery diagram lists the front, rear and side brackets, the terminal boot and the positive cable grommet.','The 2003 page is used for the 2002 car; confirm by VIN and measure the battery box and brackets. '+shape,plates.battery),
  // Round 2.
  claim(rearLamps,['high-mount','high-mount-housing','high-mount-grommet','high-mount-spacer'],'The 2002 G500 high mount lamps diagram lists the lamp, its housing, a grommet and a spacer.','Locate the lamp on the car and measure the housing, grommet and spacer. '+shape,plates.highMount),
  claim(rearLamps,['licence-lamp','licence-lens'],'The 2002 G500 license lamps diagram lists one lamp and one lens number for both sides.','Measure the lamps and lenses in the licence-plate recess. '+shape,plates.license),
  claim(rearLamps,['fog-seal'],'The 2002 G500 fog lamps diagram lists this seal for both front fog lamps, beside the lamps, reflectors and housings.','Measure the seal against the fog lamp and housing. '+shape,plates.fog),
  claim(dashSpeakers,null,'The 2002 G500 sound system diagram lists the instrument-panel center speaker and grille and the rear pillar speaker for both sides.','The same diagram gives 463-820-10-02 for the outer dash speakers, while the instrument panel diagram gives 220-820-24-02, which the register already uses; that pair is left out until a VIN check settles it. Measure the speakers and grille. '+shape,plates.sound),
  claim(doorSpeakers,null,'The 2002 G500 sound system diagram lists the front and rear door speakers, their insulators and the door grille in black and gray.','Confirm the audio package by VIN and measure the speakers in the door panels. '+shape,plates.sound),
  claim(radioCd,null,'The 2002 G500 sound system diagram lists the radio, the CD changer, its rear and front brackets and its bezel.','Cars with COMAND use the navigation units instead; confirm the head unit and changer location by VIN. '+shape,plates.sound),
  claim(seatMotors,null,'The 2002 G500 power seats diagram lists the fore-and-aft, height and backrest motors.','Confirm the motors per seat by VIN and measure their mounts on the seat frame. '+shape,plates.powerSeats),
  claim(rearHeat,null,'The 2002 G500 heated seats diagram shows the rear seat sections with a cushion heater and a backrest heater, and lists a G500 switch and control module beside them.','The page does not say where the switch sits; confirm whether it is the dash or rear-pillar switch by VIN. The control module 202-820-24-26 is left out because the register models the rear seat-heater controller already. '+shape,plates.heatedSeats),
  claim(wiperLinkage,null,'The 2002 G500 wipers diagram lists the link arm, lower and upper links, arm retainer kit, motor plate, cover and rain sensor with the windshield wiper linkage and motor.','Confirm the rain sensor is fitted by VIN and measure the linkage rods and plate. '+shape,plates.wipers),
  claim(rearWiper,['arm','blade','motor'],'The 2005 G500 wiper and washer diagram groups this arm, blade and motor with the back-door washer parts, and a dealer listing names 463-906-44-00 as the rear wiper motor. The 2002 wipers diagram lists the same numbers.','The 2005 page is used to place these on the back door; confirm by VIN and measure the arm and motor. '+shape,plates.backDoorWiper),
  claim(rearWiper,['insert'],'The 2002 G500 wipers diagram lists this insert beside the second wiper blade 463-820-03-45.','Confirm the insert belongs to the back-door blade. '+shape,plates.wipers),
  claim(fuelSender,null,'The 2002 G500 senders diagram lists the fuel tank sending unit and its seal.','Measure the sender float arm and the tank opening. '+shape,plates.senders),
  claim(bezels,['dash-switch-bezel','cluster-clip'],'The 2002 G500 instrument panel diagram lists the switch bezel and the cluster trim clip.','Locate the bezel on the dash and count the clips. '+shape,plates.instrumentPanel),
  claim(bezels,['window-bezels','seat-bezels'],'The 2002 G500 power seats diagram lists two window switch bezels and two seat switch bezels.','The page does not say which bezel is driver or passenger side; confirm and measure them in the door trim. '+shape,plates.powerSeats),
  claim(bezels,['range-switch'],'The 2002 G500 center console diagram lists this switch with the note Transfer Case.','Confirm what the switch selects and measure it in the console. '+shape,plates.console),
  claim(monitors,['occupant-sensor'],'The 2002 G500 restraint diagram lists the passenger discriminating sensor with a G500 note.','Confirm where the sensor sits in the passenger seat. '+shape,plates.restraints),
  claim(monitors,['tpms-module'],'The 2002 G500 tire pressure monitoring diagram lists this control module with a G500 note.','Confirm tire pressure monitoring is fitted by VIN and locate the module. '+shape,plates.tirePressure),
  claim(horns,['fuse-puller'],'The 2002 G500 electrical components diagram lists the fuse puller in the fuse and relay group.','Locate the puller in the fuse box. '+shape,plates.components)
];
