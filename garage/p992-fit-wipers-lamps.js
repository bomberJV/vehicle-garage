// 992 fit pack: wipers-lamps. Installed parts drawn onto the car.
// Scope: Wipers, washers and small lamps: wiper arms and blades, wiper motor and linkage, washer reservoir, pump, filler and nozzles, headlamp-washer parts if fitted, third brake light, number-plate lamps, rear fog and reversing lamps if separate, interior and courtesy lamps. lights.* (headlamps, indicators, tail strip) already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-wipers-lamps' or 'p992-fit-wipers-lamps-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// The garage holds no catalogue page for the wipers or the washer system, so none
// of those parts can carry a number here and they are left out. Of the small lamps,
// the parts below are the ones whose rows apply to a US Carrera S Cabriolet without
// optional ambient lighting: the door warning light is the PR UD0 (no exterior
// ambient lighting) part, and the light guides and LED module tied to the ambient
// lighting options QQ1/QQ2 are not fitted. The front side markers (p992-markers) and
// the tail, indicator and headlamp units (lights.*) are already drawn.
// Where the catalogue gives one number to a lamp fitted on both sides (door warning,
// footwell and licence plate lights), the pair is one fitted part.
import {box,plus} from './road-service-geometry.js';
import {cyl} from './mechanism-shapes.js';

const rearPage='https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/905-050/REAR_LIGHT';
const rearLights={label:'Eurospares · Porsche 992.1 catalogue diagram 905-050, Rear light, additional brake light and licence plate light',url:rearPage};
const frontLights={label:'Eurospares · Porsche 992.1 catalogue diagram 905-040, Turn signal repeater, side marker light, control unit for day driving light',url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/905-040/TURN_SIGNAL_REPEATER'};
const interiorLights={label:'Eurospares · Porsche 992.1 catalogue diagram 903-040, Interior light, door warning light, footwell light',url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/903-040/INTERIOR_LIGHT'};
const gearboxSensors={label:'Eurospares · Porsche 992.1 catalogue diagram 301-120, Manual gearbox sensors',url:'https://www.eurospares.co.uk/Porsche/992/2022_(992-1)/PartDiagrams/301-120/Manual_gearbox_Sensors'};

const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(id,name,description,source,parts)=>({id,name,description,source,view:'hero',internal:true,category:'service',parts:parts.map(p=>({...p,id:id+'.'+p.id}))});
const sides=[[-1,'left','Left'],[1,'right','Right']];
const housing='#2b2f31',black='#1f2325',clear='#cfd4d1',red='#a8343b',lamp='#e9e4d2';

// A six-sided block from its eight corners: the four of one end, then the four
// of the other end in the same order.
function block(r,c,color){
  const [a,b]=[c.slice(0,4),c.slice(4)];
  r.polygon([...a].reverse(),color,false);r.polygon(b,color,false);
  for(let i=0;i<4;i++){const j=(i+1)%4;r.polygon([a[i],a[j],b[j],b[i]],color,false);}
}

// Third brake light: the LED bar under the red lens strip down the middle of the
// engine-lid grille (lights.tail draws the lens). It follows the lid slope from
// the front edge of the grating at x 1.706 to its rear edge at x 1.961.
const lensZ=x=>1.081-(x-1.706)*.353;
function brakeLight(r){
  const x0=1.712,x1=1.955,w=.034;
  const at=(x,y,dz)=>[x,y,lensZ(x)+dz];
  const section=(x,top,bottom)=>[at(x,-w,bottom),at(x,w,bottom),at(x,w,top),at(x,-w,top)];
  block(r,[...section(x0,-.0035,-.032),...section(x1,-.0035,-.032)],housing);
  // Connector at the front end, below the grating.
  box(r,[x0+.02,0,lensZ(x0+.02)-.042],[.03,.026,.016],black);
}

// Licence plate lights: two LED units in the apron above the plate, lenses
// facing down and aft onto the plate. The apron face there is at x ≈ 2.277.
function plateLights(r){
  for(const s of [-1,1]){
    const c=[2.262,s*.115,.433];
    box(r,c,[.032,.084,.026],housing);
    box(r,[2.2795,c[1],c[2]],[.004,.078,.020],clear);
  }
}

// Rear light holder: the bracket inside the wing that carries the outer end of
// the rear light on its M6 bolt and spacer sleeve.
function holder(r,s){
  const c=[1.79,s*.808,.712];
  box(r,c,[.040,.036,.044],'#3a3f42');
  box(r,plus(c,[.024,s*-.004,0]),[.008,.044,.060],'#3a3f42');
  cyl(r,c,[0,s,0],.018,.026,.009,'#6c7376',8);
}

// Rear reflector: the red reflex lens in the recessed grille of the rear apron,
// drawn just proud of the reflector carrier that shell.bumpers draws behind it.
const reflectorLens=[[-.48,2.189],[-.512,2.178],[-.545,2.165],[-.578,2.148],[-.61,2.128],[-.642,2.104],[-.675,2.073],[-.708,2.037],[-.74,1.990]];
function reflector(r,s){
  const pts=reflectorLens.map(([y,x],i)=>({x,y:s*-y,z:.383+.015*i/8}));
  const normal=i=>{
    const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];
    const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);
    let n=[dy/l,-dx/l];if(n[0]<0)n=[-n[0],-n[1]];return n;
  };
  const at=(i,h,d)=>{const p=pts[i],n=normal(i);return [p.x+n[0]*d,p.y+n[1]*d,p.z+h];};
  for(let i=1;i<pts.length;i++){
    block(r,[at(i-1,.001,.0015),at(i,.001,.0015),at(i,.013,.0015),at(i-1,.013,.0015),
      at(i-1,.001,.006),at(i,.001,.006),at(i,.013,.006),at(i-1,.013,.006)],red);
  }
}

// Peripheral light: a small LED lens in the underside of the mirror housing,
// lighting the ground beside the door.
function mirrorLight(r,s){
  const c=[-.478,s*.932,.9185];
  box(r,c,[.040,.022,.010],housing);
  box(r,plus(c,[0,0,-.0055]),[.032,.015,.002],clear);
}

// Reverse light switch: screwed into the upper left of the gearbox housing,
// where the selector shaft closes it in reverse.
function reverseSwitch(r){
  const c=[1.15,0,.502],dir=[0,-.766,.643];
  cyl(r,c,dir,.140,.168,.012,'#8b9496',6);
  cyl(r,c,dir,.168,.190,.009,black,8);
}

// Door warning lights: a red lens low at the rear of each door trim panel,
// showing following traffic that the door is open.
function doorWarning(r){
  for(const s of [-1,1]){
    box(r,[.50,s*.6575,.418],[.060,.010,.020],housing);
    box(r,[.50,s*.6515,.418],[.054,.002,.015],red);
  }
}

// Footwell lights: one under each end of the dash lower edge, facing down.
function footwell(r){
  for(const [s,y] of [[-1,-.50],[1,.47]]){
    box(r,[-.455,y,.7125],[.044,.028,.014],housing);
    box(r,[-.455,y,.7045],[.036,.020,.002],lamp);
  }
}

// Luggage compartment lamp: in the rear trim of the front luggage compartment,
// ahead of the battery, lens facing forward.
function luggageLamp(r){
  box(r,[-1.274,.023,.752],[.014,.070,.032],housing);
  box(r,[-1.282,.023,.752],[.002,.060,.024],lamp);
}

const rear=group('p992-fit-wipers-lamps-rear','Rear small lamps and reversing switch',
  'The third brake light in the engine-lid grille, the licence plate lights above the plate, the rear reflectors in the apron grille, the brackets that carry the outer ends of the rear lights, and the gearbox switch that turns the reversing lights on.',rearLights,[
  part('third-brake-light','Additional brake light, Exclusive fittings · 9P5945087B','The third brake light is a slim LED bar set lengthwise into the middle of the engine-lid grille, under its red lens strip. The garage holds only the Exclusive-fittings row for this lamp.',[0,0,.22],rearLights,brakeLight),
  part('plate-lights','LED licence plate light · PAB943021','Two identical LED lamps sit in the apron above the licence plate and light it from above; both carry this number.',[.22,0,.05],rearLights,plateLights),
  ...sides.map(([s,hand,title])=>part('holder-'+hand,'Rear light holder, '+hand+' · '+(s<0?'992945067B':'992945068B'),title+' bracket inside the rear wing that carries the outer end of the rear light on its bolt and spacer sleeve.',[.10,s*.22,.10],rearLights,r=>holder(r,s))),
  ...sides.map(([s,hand,title])=>part('reflector-'+hand,'Rear light reflector, '+hand+' · '+(s<0?'992945103B':'992945104B'),title+' red reflex reflector, clipped into the recessed grille of the rear apron below the light strip.',[.18,s*.12,-.04],rearLights,r=>reflector(r,s))),
  part('reverse-switch','Reverse light switch · 958906048','Screwed into the upper left of the manual gearbox housing; it closes when reverse is selected and switches on the reversing lights in the rear light units.',[0,-.18,.16],gearboxSensors,reverseSwitch),
]);

const courtesy=group('p992-fit-wipers-lamps-courtesy','Courtesy and interior lamps',
  'The peripheral lights under the exterior mirrors, the red warning lights on the door trims, the footwell lights under the dash and the luggage compartment lamp.',interiorLights,[
  ...sides.map(([s,hand,title])=>part('mirror-light-'+hand,'Exterior mirror peripheral light, '+hand+' · '+(s<0?'992949133A':'992949134A'),title+' LED in the underside of the mirror housing that lights the ground beside the door when the car is unlocked.',[0,s*.12,-.12],frontLights,r=>mirrorLight(r,s))),
  part('door-warning','Door warning light · 992947411','A red lens low at the rear of each door trim panel warns following traffic when a door is open; both doors carry this number.',[0,0,-.18],interiorLights,doorWarning),
  part('footwell','Footwell light · 4E0947415','One lamp under each end of the dash lower edge lights the driver and passenger footwells; both carry this number.',[0,0,-.18],interiorLights,footwell),
  part('luggage-lamp','Luggage compartment lamp · PAB947409','Lights the front luggage compartment when the lid is open; it sits in the compartment rear trim, ahead of the battery.',[-.18,0,.06],interiorLights,luggageLamp),
]);

export const groups=[rear,courtesy];
export const lines=[];
export const mounts=[
  ['p992-fit-wipers-lamps-rear.third-brake-light','shell.deck','the brake light is set into the centre of the engine-lid grille'],
  ['p992-fit-wipers-lamps-rear.plate-lights','shell.bumpers','each lamp is clipped into its opening in the rear apron above the plate'],
  ...sides.map(([,hand])=>['p992-fit-wipers-lamps-rear.reflector-'+hand,'shell.bumpers','the reflector is clipped into the recessed grille of the rear apron, its lens in the grille opening']),
  ['p992-fit-wipers-lamps-rear.reverse-switch','drivetrain.gearbox','the switch is screwed into a threaded boss of the gearbox housing'],
  ...sides.map(([,hand])=>['p992-fit-wipers-lamps-courtesy.mirror-light-'+hand,'shell.'+hand+'-door','the light is clipped into the underside of the exterior mirror housing']),
  ...['left','right'].map(hand=>['p992-fit-wipers-lamps-courtesy.door-warning','shell.'+hand+'-door','each warning light is clipped into the lower edge of its door trim panel']),
];
