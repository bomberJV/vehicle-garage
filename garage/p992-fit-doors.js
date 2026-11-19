// 992 fit pack: doors. Installed parts drawn onto the car.
// Scope: Doors and mirrors: exterior mirrors (housing, glass, motor, cap, base), door trim panels, door speakers, outer door handles and their mechanism, door glass, door seals and window shafts, door control units. p992-doors.* (hinges, locks, strikers, regulators) and shell.left-door/right-door already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-doors' or 'p992-fit-doors-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// US car (left-hand drive): the left door is the driver's door. Mirrors are the
// standard adjustable (not power-folding) version, P6XA, with the flat left glass
// and the convex US right glass for the dimming interior mirror. The outer handles
// are the keyless-entry version. The window is drawn lowered into the door, as it
// is with the top down. The door shell's section here: outer skin |y| 0.82-0.87,
// inner trim face |y| 0.64-0.67, shoulder at z 0.87-0.92; the existing window
// regulator, lock and Bowden cable sit at |y| 0.77-0.80 inside it.
import {barrel,pipe,ellipsoid} from './road-primitives.js';
import {box} from './road-service-geometry.js';
import {cyl,y as Y,z as Z,TAU} from './mechanism-shapes.js';

const cat=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const src={
 mirror:cat('809-500','Exterior mirror','https://www.eurospares.co.uk/Porsche/992/2024_(992-1)/PartDiagrams/809-500/Exterior_mirror'),
 handles:cat('804-200','Door handles, outer','https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/804-200/Door_handles'),
 seals:cat('804-150','Door seals and mouldings, Cabriolet','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/804-150/DOOR_SEAL'),
 glass:cat('805-010','Door window glass, Cabriolet','https://www.eurospares.co.uk/Porsche/992/2021_(992-1)/PartDiagrams/805-010/Door_window'),
 panel:cat('808-900','Door panel fasteners and inner handles','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/808-900/DOOR_PANEL'),
 shell:cat('804-000','Door shell, hinges and door lock','https://www.eurospares.co.uk/Porsche/992/2023_(992-1)/PartDiagrams/804-000/Door_shell'),
 units:cat('902-150','Door control units and wiring','https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/902-150/DOORS'),
};
const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(id,name,description,source,parts)=>({id,name,description,source,view:'hero',internal:true,category:'service',parts:parts.map(p=>({...p,id:id+'.'+p.id}))});
const sides=[[-1,'left'],[1,'right']];
const P=(s,[x,y,z])=>[x,s*y,z];
const black='#2b3033',plastic='#3e4447',primed='#7b8186',rubber='#262a2c',steel='#8f9a9c',foam='#55595a',pane='#7f949b',wire='#2f3436';

// Exterior mirror. The head shares the door shell's drawn mirror profile
// (porsche992-exterior-trim.js): centre 0.505 m behind the front axle line's
// door station, 0.915 m out, z 0.967; the glass faces aft. The fitted pieces
// sit just outside that surface, scaled about the head centre.
const head=s=>[-.505,s*.915,.967];
const profile=[[-.090,.010,.010,.008],[-.074,.056,.033,.008],[-.039,.085,.048,.006],[.009,.097,.051,0],[.050,.094,.049,0],[.072,.082,.041,.002]];
const corner=(v,p)=>Math.sign(v)*Math.abs(v)**p;
const mv=(s,k,[dx,ry,rz,dz],a)=>{const [x,y,z]=head(s);return [x+dx*k,y+s*ry*k*corner(Math.cos(a),.79),z+dz*k+rz*k*corner(Math.sin(a),.72)];};
// Rings j0..j1 of the profile, angle steps i0..i1 of 16 (0-7 upper half, 8-15 lower half).
function shell(r,s,k,j0,j1,i0,i1,color){
 for(let j=j0+1;j<=j1;j++)for(let i=i0;i<i1;i++){
  const a=i*TAU/16,b=(i+1)*TAU/16;
  r.polygon([mv(s,k,profile[j-1],a),mv(s,k,profile[j],a),mv(s,k,profile[j],b),mv(s,k,profile[j-1],b)],color,false);
 }
}
// The mirror base stands on the door shoulder; its arm carries the head.
const foot=s=>[-.495,s*.745,.876];
const arm=s=>[foot(s),[-.480,s*.818,.916],[-.507,s*.885,.937]];

const mirrors=group('p992-fit-doors-mirrors','Exterior mirrors · adjustable, P6XA',
 'Each door carries a mirror on its shoulder, ahead of the window. A cast base bolted through the door shell holds the head; the housing carries the glass and adjuster, with a painted upper trim, a lower cover cap and a puddle light underneath.',
 src.mirror,sides.flatMap(([s,hand])=>{
  const L=s<0,out=[0,s*.30,.12];
  return [
   part('base-'+hand,`Mirror base, ${hand} (${L?"driver's":'passenger'} side), adjustable · ${L?'992857411D':'992857412D'}`,
    'The cast foot is bolted down through the door shoulder and its arm reaches out to carry the mirror head; the door harness enters through it.',[0,s*.18,.06],src.mirror,r=>{
     box(r,foot(s),[.090,.045,.010],steel);cyl(r,foot(s),Z,-.045,0,.013,steel,8);pipe(r,arm(s),.015,steel,8);
    }),
   part('foot-cover-'+hand,`Mirror foot cover, ${hand}, primed · ${L?'992857577C G2X':'992857578C G2X'}`,
    'The painted cover clips over the base and its arm, giving the stalk its smooth body-colour shape.',[0,s*.22,.10],src.mirror,r=>{
     const [f]=arm(s);box(r,[f[0],f[1],f[2]+.008],[.100,.052,.008],primed);pipe(r,arm(s),.026,primed,10);
    }),
   part('housing-'+hand,`Exterior mirror housing, ${hand}, primed · ${L?'992857527F G2X':'992857528F G2X'}`,
    'The housing is the shell of the head: it carries the glass and its adjuster, and its rear rim frames the glass.',out,src.mirror,r=>shell(r,s,1.03,0,5,0,16,plastic)),
   part('trim-'+hand,`Trim for mirror housing, ${hand}, primed · ${L?'992857109C G2X':'992857110C G2X'}`,
    'The painted upper trim clips over the top and nose of the housing.',[0,s*.30,.20],src.mirror,r=>shell(r,s,1.06,0,4,0,8,primed)),
   part('lower-cap-'+hand,`Lower cover cap, ${hand}, primed, adjustable mirrors · ${L?'992857537ADG2X':'992857538ADG2X'}`,
    'The lower cover cap closes the underside of the housing and holds the puddle light.',[0,s*.30,0],src.mirror,r=>shell(r,s,1.06,0,4,8,16,'#5f666a')),
   part('glass-'+hand,L?'Mirror glass, flat, left, dimming interior mirror · 992857521':'Mirror glass, convex, right, US inscription · 992857522A',
    L?'The driver\'s glass is flat and heated; it clips to the adjuster inside the housing and faces aft.':'The passenger glass is convex and carries the US "objects in mirror are closer than they appear" inscription.',
    [.16,s*.12,.04],src.mirror,r=>{
     r.polygon(Array.from({length:20},(_,i)=>mv(s,1,[.070,.078,.037,.002],i*TAU/20)),pane,false);
    }),
   part('puddle-light-'+hand,`Peripheral light, ${hand} mirror · ${L?'992949133A':'992949134A'}`,
    'The peripheral (puddle) light sits in the lower cover cap and lights the ground beside the door when the car is unlocked.',[0,s*.20,-.12],src.mirror,r=>{
     const [x,y,z]=head(s);box(r,[x+.015,y-s*.035,z-.052],[.045,.022,.010],'#c9cdc4');
    }),
  ];
 }));

// Outer door handle, centre 0.38 m behind the door station line, z 0.75, in the skin at |y| 0.866.
const handleAt=s=>[.380,s*.872,.752];
const handles=group('p992-fit-doors-handles','Outer door handles and lock cylinder · keyless entry',
 'Each door has a flush outer handle on a mounting bar inside the skin. The handle pulls the Bowden cable to the latch. On the US car only the driver\'s door has a lock cylinder, hidden under a cover at the rear end of the handle.',
 src.handles,sides.flatMap(([s,hand])=>{
  const L=s<0,H=handleAt(s);
  return [
   part('handle-'+hand,`Outer door handle, ${hand}, primed, keyless entry · ${L?'992837205J G2X':'992837206J G2X'}`,
    'The flush handle sits in its recess in the door skin; pulling it draws the Bowden cable that releases the latch.',[0,s*.25,.04],src.handles,r=>{
     ellipsoid(r,H,[.078,.014,.026],primed,12,4);
    }),
   part('bar-'+hand,`Handle mounting bar, ${hand} (${L?"driver's":'passenger'} side), keyless entry · ${L?'992837885AY':'992837886F'}`,
    'The mounting bar is bolted inside the door skin and carries the handle, its lever and the keyless-entry sensor lead.',[0,s*.16,.04],src.handles,r=>{
     box(r,[.390,s*.835,.752],[.200,.010,.040],'#5b6366');
    }),
   part('lock-cover-'+hand,L?"Cover, door lock, left (driver's side), left-hand drive · 992837973":'Cover, door lock, right (passenger side), left-hand drive · 992839160',
    L?'The cap at the rear end of the handle hides the emergency lock cylinder.':'On the passenger door the cap closes the rear end of the handle; there is no lock cylinder behind it.',[.06,s*.25,.04],src.handles,r=>{
     ellipsoid(r,[.470,H[1],H[2]],[.018,.011,.018],primed,10,4);
    }),
   ...(L?[part('lock-cylinder-left','Lock cylinder, left, coded to the vehicle · 992837217 Y',
    'The mechanical key cylinder for emergency unlocking passes through the skin behind the cover cap.',[.06,s*.18,.04],src.handles,r=>{
     cyl(r,[.470,s*.866,.752],Y,0,-s*.040,.010,steel,10);
    })]:[]),
  ];
 }));

// Door glass, lowered into the door: a plane leaning in 20 mm over its height,
// outboard of the regulator rails and inboard of the skin.
const glassAt=(s,x,z)=>[x,s*(.812-.02*(z-.42)/.40),z];
const doorParts=sides.flatMap(([s,hand])=>{
 const L=s<0,out=[0,s*.32,0],dcu=P(s,[-.25,.708,.52]);
 return [
  part('glass-'+hand,`Door window glass, ${hand}, Cabriolet · ${L?'992845019E':'992845020E'}`,
   'The frameless glass is clamped to the regulator carriers; it is drawn lowered into the door, where it rests with the top down.',[0,s*.10,.42],src.glass,r=>{
    r.polygon([[-.46,.42],[.46,.42],[.51,.47],[.51,.80],[.48,.82],[-.28,.82],[-.50,.48]].map(([x,z])=>glassAt(s,x,z)),pane,false);
   }),
  part('window-guide-'+hand,`Window guide, ${hand} · ${L?'992837391A':'992837392A'}`,
   'The guide channel is bolted inside the rear of the door and holds the glass\'s rear edge as it rises and falls.',[.10,s*.18,.10],src.seals,r=>{
    box(r,[.518,s*.801,.630],[.022,.014,.360],black);
   }),
  part('seal-'+hand,`Door seal, inner, ${hand} · ${L?'992831703K':'992831704H'}`,
   'The main door seal runs round the inner flange of the door, along the front edge, the sill and the rear edge, and closes against the body aperture.',[0,s*.22,-.06],src.seals,r=>{
    pipe(r,[[-.665,.70,.85],[-.665,.70,.30],[-.62,.70,.27],[.50,.70,.27],[.55,.70,.30],[.55,.70,.86]].map(p=>P(s,p)),.008,rubber,6);
   }),
  part('access-cover-'+hand,`Cover, door inner panel, window regulator, ${hand} · ${L?'992837915A':'992837916A'}`,
   'The cover closes the large opening in the door inner panel through which the window regulator is fitted.',[0,-s*.20,.04],src.shell,r=>{
    r.polygon([[-.42,.46],[-.36,.44],[.14,.44],[.20,.48],[.20,.78],[.14,.81],[-.36,.81],[-.42,.78]].map(([x,z])=>P(s,[x,.690,z])),'#4a4f4d',false);
   }),
  part('side-pad-'+hand,`Cushioned side protection, ${hand} · ${L?'992837841A':'992837842'}`,
   'The foam block behind the door trim, at hip height, spreads a side impact load into the occupant\'s pelvis.',[.06,-s*.20,0],src.shell,r=>{
    box(r,P(s,[.330,.716,.500]),[.240,.045,.140],foam);
   }),
  part('inner-handle-'+hand,`Inner door handle, ${hand} · ${L?'992837019B':'992837020B'}`,
   'The pull lever at the front of the door trim, above the armrest, releases the latch from inside.',[0,-s*.22,.06],src.panel,r=>{
    box(r,P(s,[-.330,.640,.730]),[.130,.006,.040],black);box(r,P(s,[-.330,.630,.730]),[.100,.012,.020],steel);
   }),
  part('control-unit-'+hand,`Door control unit, ${L?'driver':'passenger'} side · ${L?'PAD959793':'PAD959792'}`,
   'The door control unit sits on the inner panel and runs the window motor, the mirror adjuster and heating, and the lock.',[0,-s*.24,.10],src.units,r=>{
    box(r,dcu,[.100,.030,.075],'#33393b');
   }),
  part('harness-'+hand,`Inner door panel wiring harness, ${hand}, Cabriolet · ${L?'V04015118B':'V04015031B'}`,
   'The harness enters the door between the hinges and runs from the door control unit to the latch and up into the mirror base.',[0,-s*.16,.16],src.units,r=>{
    pipe(r,[[-.655,.725,.560],[-.45,.725,.550],[-.30,.712,.530]].map(p=>P(s,p)),.006,wire,6);
    pipe(r,[[-.20,.712,.530],[.10,.735,.600],[.45,.745,.612],[.585,.775,.612]].map(p=>P(s,p)),.006,wire,6);
    pipe(r,[[-.25,.712,.557],[-.40,.720,.700],[-.49,.735,.800],[-.495,.745,.845]].map(p=>P(s,p)),.005,wire,6);
   }),
 ];
});
const door=group('p992-fit-doors-panels','Door glass, seals, trim and door electronics',
 'Inside each frameless door the glass rides in a rear guide channel on the regulator. The inner panel opening is closed by a cover, with a side-impact pad and the door control unit on it. The trim carries the pull handle, and the main seal runs round the door\'s inner flange.',
 src.glass,doorParts);

export const groups=[mirrors,handles,door];
export const lines=sides.map(([,hand])=>'p992-fit-doors-panels.harness-'+hand);
export const mounts=[
 ...sides.map(([s,hand])=>['p992-fit-doors-mirrors','shell.'+hand+'-door',`the ${hand} mirror base is bolted down through the door shoulder, and the fitted housing, caps and arm enclose the shell's own drawing of the same mirror`]),
 ...sides.map(([s,hand])=>['p992-fit-doors-handles','shell.'+hand+'-door',`the ${hand} outer handle and its lock cover sit in the handle recess of the door skin${s<0?', and the lock cylinder passes through it':''}`]),
];
