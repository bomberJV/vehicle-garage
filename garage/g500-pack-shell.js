// G500 study pack: shell.
// The body-in-white behind the outer skin: pillars, rockers and their reinforcements, the cowl,
// the front and rear wheelhouses, the rear body panels, the roof structure, the fuel-door
// hardware and the brackets bolted to the ladder frame.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// 2003 G500 catalog diagram that lists it.
//
// Parts the register already models are left out: the outer quarter panels, fenders, fuel door
// and pocket, door strikers, the ladder frame, body mounts, the frame brackets already numbered
// and the mufflers, tank and transfer case themselves. Standard screws, nuts, clips and washers
// are left out. Geometry is schematic, in study-local coordinates.
import {metal,steel,dark,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const giant=year=>'https://www.mbpartsgiant.com/parts-list/'+year+'-mercedes_benz-g500/';
const page=(label,path,year=2002,note='')=>({label:'MB Parts Giant · '+year+' G500 '+label+' diagram'+(note&&', '+note),url:giant(year)+path});
const unread='a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment of ';
const plates={
  side:page('center pillar and rocker','body-hardware/center-pillar-rocker',2003,unread+'the pillars, connectors, rockers and floor-side reinforcements is unconfirmed'),
  cowl:page('cowl','body-hardware/cowl',2003,unread+'the cowl rail, reinforcements and insulation is unconfirmed'),
  cowlTrim:page('cowl exterior trim','interior-exterior-trim/exterior-trim-cowl',2003,unread+'side moldings 463-690-08-62 and 463-690-09-62 and their bases is unconfirmed'),
  fenderInner:page('fender inner components','body-hardware/inner-components-fender',2003,unread+'the wheelhouses, side panels, seal, heat shield and covers is unconfirmed'),
  rearBody:page('rear body','body-hardware/rear-body'),
  quarterInner:page('quarter panel inner structure','body-hardware/inner-structure-quarter-panel'),
  fuelDoor:page('fuel door','body-hardware/fuel-door'),
  roof:page('roof and components','body-hardware/roof-components',2003,unread+'the roof panels, sunroof frame and brackets, bow, reinforcement and stiffeners is unconfirmed'),
  frame:page('frame and components','body-hardware/frame-components',2002,'which does not list engine under cover 463-520-05-42, so its 2002 fitment is unconfirmed'),
  splash:page('splash shields','body-hardware/splash-shields',2003,unread+'under cover brackets 463-524-00-10 and 463-524-01-10-64 is unconfirmed')
};
export const shellPackPlates=plates;

const panel='#8f9ea3',inner='#7b8a8f',primer='#9c9a8f',rubber='#26292b',plastic='#3a3f42',black='#1f2324',felt='#4a4740',zinc='#b3b9b1';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,n);};
const sides=[-1,1];
// A pressed hat-section member along x: web plus two flanges.
const hat=(r,c,len,w,h,color)=>{block(r,[c[0],c[1],c[2]+h/2],[len,w,.012],color);for(const s of sides)block(r,[c[0],c[1]+s*w/2,c[2]],[len,.012,h],color);};
// The same member standing upright (along z).
const post=(r,c,len,w,d,color)=>{block(r,[c[0],c[1],c[2]],[w,.012,len],color);for(const s of sides)block(r,[c[0]+s*w/2,c[1]+d/2,c[2]],[.012,d,len],color);};
const withSource=(p,source)=>({...p,source});

// Side structure: the pillars, rocker and floor-side reinforcements that carry the door openings.
const side=study('g500-side-structure','Body side pillars',
  'Each side of the shell is a ladder of pressed pillars. The windshield and hinge pillars carry the front door. The center pillar takes the front-door lock and the rear-door hinges. Inner pressings close each pillar into a box section.',plates.side,[
  part('windshield-pillar','Windshield pillar, outer, left / right · 463-637-07-20-64 / 463-637-08-20-64','The outer pressing of the A-pillar that frames the windshield and the top of the front door.',[-.2,-.35,.45],r=>{for(const s of sides)block(r,[-.95,s*.72,.75],[.08,.04,.5],panel);}),
  part('hinge-pillar','Hinge pillar, left / right · 463-637-11-20 / 463-637-12-20','The outer hinge pillar that the front-door hinges bolt to. The catalog lists it from chassis 134621.',[-.45,-.3,.1],r=>{for(const s of sides)post(r,[-1.0,s*.72,.15],.7,.14,.05,panel);}),
  part('inner-hinge-pillar','Inner hinge pillar, left / right · 463-630-39-10 / 463-630-40-10','The inner pressing behind the hinge pillar. It closes the box section and carries the hinge backing.',[-.55,.3,.05],r=>{for(const s of sides)block(r,[-1.02,s*.62,.15],[.12,.012,.7],inner);}),
  part('upper-connector','Pillar connector · 463-637-03-81','A connecting pressing listed at the top of the pillars, used on both sides.',[-.1,.4,.5],r=>{for(const s of sides)block(r,[-.4,s*.7,.92],[.12,.06,.03],inner);}),
  part('center-pillar','Outer center pillar, left / right · 463-637-57-24 / 463-637-58-24-64','The outer B-pillar between the front and rear doors.',[.05,-.4,.2],r=>{for(const s of sides)post(r,[.1,s*.72,.35],1.1,.12,.05,panel);}),
  part('inner-center-upper','Inner center pillar, upper · 463-630-10-11','The upper inner pressing of the B-pillar, the same part on both sides.',[.15,.35,.4],r=>{for(const s of sides)block(r,[.1,s*.63,.62],[.1,.012,.55],inner);}),
  part('inner-center-lower','Inner center pillar, lower, left / right · 463-630-15-93 / 463-630-16-93','The lower inner pressing of the B-pillar down to the rocker.',[.2,.4,-.2],r=>{for(const s of sides)block(r,[.1,s*.63,.08],[.12,.012,.5],inner);}),
  part('lower-connector','Pillar connector, lower · 463-637-01-81','The connecting pressing listed where the pillars meet the rocker.',[.0,.45,-.45],r=>{for(const s of sides)block(r,[.1,s*.7,-.2],[.14,.06,.04],inner);}),
]);
side.viewAngle=[-.6,.3];

// Rocker: the closed sills and the floor-side reinforcements that tie the pillars to the floor.
const rocker=study('g500-rocker-structure','Rockers and floor reinforcements',
  'A closed rocker runs under each pair of door openings. Reinforcements fill its ends and inner face, and extensions and seat reinforcements join it to the floor pan.',plates.side,[
  part('rocker','Rocker panel, left / right · 460-637-11-35 / 460-637-12-35','The closed sill under the door openings, from the hinge pillar to the rear wheelhouse.',[0,-.45,-.4],r=>{for(const s of sides)hat(r,[0,s*.72,-.22],2.1,.12,.1,panel);}),
  part('rocker-front','Rocker front reinforcement · 463-630-04-40','The reinforcement inside the front end of the rocker, the same on both sides.',[-.5,-.5,-.55],r=>{for(const s of sides)block(r,[-.85,s*.72,-.22],[.25,.08,.08],primer);}),
  part('rocker-rear','Rocker rear reinforcement · 463-630-05-40','The reinforcement inside the rear end of the rocker.',[.5,-.5,-.55],r=>{for(const s of sides)block(r,[.85,s*.72,-.22],[.25,.08,.08],primer);}),
  part('rocker-inner','Rocker inner reinforcement · 460-637-13-35-64','The long inner reinforcement along the rocker.',[0,.5,-.6],r=>{for(const s of sides)block(r,[0,s*.65,-.24],[1.6,.012,.08],primer);}),
  part('floor-front','Floor front reinforcement · 463-610-00-10','The reinforcement listed at the front of the floor where it meets the hinge pillar.',[-.6,.1,-.6],r=>{for(const s of sides)block(r,[-.9,s*.5,-.28],[.18,.25,.02],primer);}),
  part('extension','Sill extension, left / right · 463-616-00-13 / 463-616-01-13','The extension that joins the floor pan to the rocker.',[.3,.15,-.65],r=>{for(const s of sides)block(r,[.4,s*.55,-.27],[.4,.14,.015],inner);}),
  part('seat-reinforcement','Seat reinforcement, left / right · 463-616-00-31 / 463-616-01-31','The floor reinforcement under the front seat mounts.',[-.2,.2,-.7],r=>{for(const s of sides){block(r,[-.35,s*.35,-.28],[.4,.06,.04],primer);block(r,[-.35,s*.35,-.25],[.4,.02,.02],primer);}})
]);
rocker.viewAngle=[-.6,.35];

// Cowl: the cross member and reinforcements under the windshield, the dash insulation and
// the moldings on the cowl sides.
const cowl=study('g500-cowl-structure','Cowl structure and moldings',
  'The cowl rail spans the body under the windshield. Reinforcements carry the hood hinges. Insulation lines the dash panel behind it. Moldings cover the joint on each cowl side.',plates.cowl,[
  part('rail','Cowl rail · 463-625-10-30','The cross rail across the top of the cowl, under the windshield base.',[0,0,.4],r=>hat(r,[0,0,.4],1.5,.12,.08,panel)),
  part('hinge-reinforcement','Hood hinge reinforcement · 460-620-09-16','The plate under each hood hinge mount, the same part on both sides.',[0,-.4,.3],r=>{for(const s of sides)block(r,[s*.62,-.05,.36],[.14,.12,.015],primer);}),
  part('reinforcement-plate','Cowl reinforcement plate · 460-620-21-16','A second reinforcing plate at each hinge mount.',[0,-.5,.1],r=>{for(const s of sides)block(r,[s*.62,-.05,.3],[.1,.02,.1],primer);}),
  part('dash-insulation','Dash panel insulation · 463-680-19-25','The insulation mat on the engine side of the dash panel.',[0,.4,-.1],r=>block(r,[0,.12,.05],[1.3,.025,.5],felt)),
  part('inner-insulation','Cowl inner insulation · 463-680-18-25','The insulation inside the cowl plenum.',[0,.55,.25],r=>block(r,[0,.05,.32],[1.1,.06,.04],felt)),
  withSource(part('side-molding','Cowl side molding, left / right · 463-690-08-62 / 463-690-09-62','The trim strip on each side of the cowl, between the fender and the windshield pillar.',[0,-.2,.6],r=>{for(const s of sides)block(r,[s*.78,-.05,.42],[.04,.3,.025],black);}),plates.cowlTrim),
  withSource(part('molding-base','Cowl side molding base, left / right · 463-698-21-62 / 463-698-22-62','The base strip the cowl side molding clips onto.',[0,-.1,.75],r=>{for(const s of sides)block(r,[s*.78,-.05,.4],[.05,.3,.012],rubber);}),plates.cowlTrim)
]);
cowl.viewAngle=[-.5,.35];

// Front wheelhouses inside the fenders.
const fenderInner=study('g500-front-wheelhouses','Front wheelhouses',
  'Each front wing hides a pressed wheelhouse with a side panel toward the engine bay. A seal closes it to the body, a heat shield guards the exhaust side and covers close the upper openings.',plates.fenderInner,[
  part('wheelhouse','Front wheelhouse assembly, left / right · 463-620-35-50 / 463-620-23-50','The pressed inner wheelhouse behind each front wing.',[0,-.4,0],r=>{for(const s of sides){block(r,[0,s*.55,.25],[.8,.25,.012],inner);for(const e of sides)block(r,[e*.4,s*.55,.05],[.012,.25,.4],inner);}}),
  part('seal','Wheelhouse seal · 460-637-03-98','The seal between the wheelhouse and the body, the same part on both sides.',[0,.4,.35],r=>{for(const s of sides)block(r,[-.42,s*.55,.25],[.02,.26,.03],rubber);}),
  part('side-panel','Wheelhouse side panel, left / right · 463-620-17-13 / 463-620-18-13','The side panel between the wheelhouse and the engine bay.',[0,.3,-.3],r=>{for(const s of sides)block(r,[0,s*.42,.1],[.75,.012,.3],panel);}),
  part('heat-shield','Wheelhouse heat shield · 463-626-00-38','The heat shield on the wheelhouse beside the exhaust manifold.',[.4,.45,-.2],r=>block(r,[.1,-.4,.05],[.35,.02,.2],zinc)),
  part('cover','Wheelhouse cover, left / right · 463-626-07-27 / 463-626-05-27-64','The cover over the opening in each wheelhouse.',[-.4,-.45,.3],r=>{for(const s of sides)block(r,[-.2,s*.55,.27],[.18,.12,.012],plastic);}),
  part('upper-cover','Wheelhouse upper cover · 463-620-08-07','The upper cover listed with the wheelhouses.',[.3,-.3,.45],r=>block(r,[.25,.55,.3],[.2,.1,.012],plastic))
]);
fenderInner.viewAngle=[-.6,.35];

// Rear body: the panels around the cargo opening.
const rearBody=study('g500-rear-body-panels','Rear body panels',
  'The cargo opening is framed by the back panel below, the rear pillars at the sides and the upper rear panels above. End panels and reinforcements close the corners, and a bracket carries the cargo-door lock.',plates.rearBody,[
  part('back-panel','Back panel · 463-640-19-02','The lower back panel under the cargo opening.',[0,-.4,-.4],r=>block(r,[0,0,-.4],[1.4,.015,.3],panel)),
  part('rear-body-panel','Rear body panel · 463-640-01-71','The rear body panel listed with the back panel. It forms the floor edge of the opening.',[0,-.5,-.15],r=>hat(r,[0,.05,-.25],1.4,.1,.05,inner)),
  part('rear-pillar','Rear pillar, left / right · 463-640-07-10 / 460-640-16-10','The outer D-pillar on each side of the cargo opening.',[0,-.35,.2],r=>{for(const s of sides)post(r,[s*.7,0,.25],1.0,.1,.04,panel);}),
  part('upper-panel','Upper rear panel, left / right · 460-647-09-07 / 460-647-08-07-64','The upper panel at each top corner of the cargo opening.',[0,-.3,.55],r=>{for(const s of sides)block(r,[s*.45,0,.8],[.5,.015,.12],panel);}),
  part('end-panel','End panel, left / right · 463-640-05-71 / 463-647-08-40','The panel that closes each lower rear corner.',[0,.35,-.45],r=>{for(const s of sides)block(r,[s*.72,.08,-.38],[.012,.16,.3],inner);}),
  part('upper-reinforcement','Upper reinforcement, left / right · 460-640-04-16 / 460-647-06-16','The reinforcement behind each upper corner.',[0,.45,.5],r=>{for(const s of sides)block(r,[s*.6,.05,.72],[.2,.04,.06],primer);}),
  part('lower-reinforcement','Lower reinforcement, left / right · 463-640-02-16 / 463-640-03-16','The reinforcement behind each lower corner.',[0,.5,-.2],r=>{for(const s of sides)block(r,[s*.6,.05,-.28],[.2,.04,.06],primer);}),
  part('lock-bracket','Cargo-door lock bracket · 463-647-06-16-64','The bracket on the body that the cargo-door lock engages.',[.4,.45,.1],r=>{block(r,[.72,.05,.1],[.04,.08,.16],steel);block(r,[.7,.09,.1],[.02,.01,.1],dark);})
]);
rearBody.viewAngle=[-.4,.3];

// Rear quarter: the pillars, wheelhouse and baffles inside the quarter panels.
const quarter=study('g500-rear-quarter-structure','Rear quarter inner structure',
  'Inside each rear quarter the lock pillar carries the rear-door lock, the rear wheelhouse closes the wheel opening and pillars and stiffeners frame the quarter window. On the right side the fuel-filler pocket sits in this structure, with an air baffle behind it.',plates.quarterInner,[
  part('lock-pillar','Lock pillar, left / right · 463-630-83-11 / 463-630-84-11','The C-pillar that carries the rear-door lock.',[-.4,-.35,.2],r=>{for(const s of sides)post(r,[-.45,s*.72,.3],1.0,.1,.04,panel);}),
  part('rear-pillar','Rear pillar, inner, left / right · 460-637-07-22 / 460-637-08-22','The inner rear pillar at the back of the quarter.',[.45,-.3,.25],r=>{for(const s of sides)block(r,[.5,s*.65,.4],[.1,.012,.8],inner);}),
  part('wheelhouse','Rear wheelhouse, left / right · 463-610-11-92 / 463-610-16-92','The pressed rear wheelhouse.',[0,-.45,-.35],r=>{for(const s of sides){block(r,[0,s*.6,-.05],[.8,.22,.012],inner);for(const e of sides)block(r,[e*.4,s*.6,-.25],[.012,.22,.4],inner);}}),
  part('splash-shield','Rear splash shield, left / right · 463-684-01-00 / 463-684-02-00','The shield inside the rear wheelhouse.',[0,.45,-.5],r=>{for(const s of sides)block(r,[0,s*.48,-.2],[.7,.012,.3],plastic);}),
  part('seal','Rear wheelhouse seal · 463-889-09-98','The seal at the rear wheelhouse, the same part on both sides.',[.4,.45,-.3],r=>{for(const s of sides)block(r,[.42,s*.6,-.05],[.02,.22,.03],rubber);}),
  withSource(part('stiffener','Quarter stiffener, left / right · 463-630-23-19 / 463-630-24-19','The stiffener inside the quarter panel.',[-.2,.4,.45],r=>{for(const s of sides)block(r,[0,s*.7,.35],[.7,.03,.04],primer);}),plates.fuelDoor),
  withSource(part('outer-pillar','Outer quarter pillar, left / right · 463-630-87-11 / 463-630-88-11','The outer pillar at the rear of the quarter window.',[.3,-.5,.5],r=>{for(const s of sides)post(r,[.3,s*.73,.55],.5,.08,.03,panel);}),plates.fuelDoor),
  withSource(part('outer-pillar-reinforcement','Outer pillar reinforcement, left / right · 463-637-00-24 / 463-637-01-24-64','The reinforcement behind the outer quarter pillar.',[.2,.5,.6],r=>{for(const s of sides)block(r,[.3,s*.68,.55],[.06,.03,.45],primer);}),plates.fuelDoor),
  withSource(part('inner-pillar','Inner quarter pillar, left / right · 460-637-37-24-64 / 460-637-38-24-64','The inner pillar behind the quarter window.',[-.05,.55,.3],r=>{for(const s of sides)block(r,[.15,s*.64,.5],[.08,.012,.5],inner);}),plates.fuelDoor),
  withSource(part('air-baffle','Air baffle, left / right · 460-637-07-26-64 / 460-637-08-26-64','The baffle inside the quarter, listed on the fuel-door diagram.',[-.3,-.5,-.05],r=>{for(const s of sides)block(r,[-.2,s*.68,.1],[.2,.06,.15],felt);}),plates.fuelDoor)
]);
quarter.viewAngle=[-.55,.3];

// Roof: the roof skin and the structure around the sunroof opening.
const roof=study('g500-roof-structure','Roof structure',
  'The roof skin sits on bows and stiffeners between the roof rails. With the sunroof a frame with front and rear brackets lines the opening.',plates.roof,[
  part('roof-panel','Roof panel · 460-657-02-09 (without sunroof) / 463-650-01-09 (with sunroof)','The roof skin. A different panel with the opening is used when the sunroof is fitted.',[0,0,.45],r=>{block(r,[0,0,.3],[1.8,1.3,.012],panel);block(r,[-.2,0,.31],[.6,.55,.004],dark);}),
  part('sunroof-frame','Sunroof frame · 463-650-00-65','The frame bonded under the roof skin around the sunroof opening.',[0,0,.2],r=>{block(r,[-.2,.29,.27],[.66,.04,.02],inner);block(r,[-.2,-.29,.27],[.66,.04,.02],inner);for(const e of sides)block(r,[-.2+e*.33,0,.27],[.04,.62,.02],inner);}),
  part('front-bracket','Sunroof frame front bracket · 463-652-01-31','The bracket at the front of the sunroof frame.',[-.4,0,.05],r=>block(r,[-.55,0,.25],[.04,.4,.03],primer)),
  part('rear-bracket','Sunroof frame rear bracket · 463-650-00-31','The bracket at the rear of the sunroof frame.',[.3,0,.05],r=>block(r,[.15,0,.25],[.04,.4,.03],primer)),
  part('bow','Roof bow · 463-650-01-20','The cross bow under the roof skin.',[.5,0,-.05],r=>hat(r,[.55,0,.24],.04,1.25,.04,inner)),
  part('reinforcement','Roof reinforcement · 463-637-03-44','The reinforcement at each roof corner, the same part on both sides.',[-.6,-.4,.0],r=>{for(const s of sides)block(r,[-.8,s*.6,.25],[.15,.1,.03],primer);}),
  part('stiffener','Roof stiffener, left / right · 460-721-01-37 / 460-721-02-37-64','The stiffener along each roof edge above the doors.',[0,.5,-.1],r=>{for(const s of sides)block(r,[0,s*.62,.25],[1.4,.04,.03],primer);})
]);
roof.viewAngle=[-.5,.55];

// Fuel door: the hinge spring, bumper, reinforcement and the central-locking actuator.
const fuelDoor=study('g500-fuel-door-hardware','Fuel door hardware',
  'Behind the fuel door a reinforcement stiffens the flap, a spring pops it open and a rubber bumper stops it. A central-locking actuator locks it with the doors.',plates.fuelDoor,[
  part('reinforcement','Fuel door reinforcement · 124-757-05-10','The stiffening plate on the inside of the fuel door.',[0,-.3,.2],r=>block(r,[0,-.04,0],[.3,.012,.3],primer)),
  part('spring','Fuel door spring · 203-758-01-36','The spring that pushes the fuel door open when released.',[-.3,.2,.2],r=>{for(let i=0;i<5;i++)sleeve(r,[-.2,.04,-.05+i*.025],z,0,.012,.02,.014,metal,10);}),
  part('bumper','Fuel door bumper · 123-987-24-40','The rubber bumper the door closes against.',[.3,.25,.25],r=>{cyl(r,[.15,.02,.12],y,0,.03,.02,rubber,12);}),
  part('actuator','Fuel door lock actuator · 004-820-26-42','The central-locking actuator that locks the fuel door with the doors.',[.1,.4,-.3],r=>{block(r,[.1,.12,-.1],[.12,.08,.07],black);cyl(r,[.04,.12,-.1],x,-.1,0,.008,steel,8);})
]);
fuelDoor.viewAngle=[-.45,.3];

// Frame: the brackets that carry the radiator, engine shield, transfer case, mufflers and tank.
const frame=study('g500-frame-mounted-brackets','Frame-mounted brackets',
  'Brackets welded or bolted to the ladder frame carry the radiator, the front supports, the engine shield, the transfer case, the front mufflers and the fuel tank. The under cover closes the engine bay from below.',plates.frame,[
  part('radiator-bracket','Radiator bracket · 461-310-44-09','The bracket on each front frame horn that carries the radiator, the same part on both sides.',[-.5,0,.35],r=>{for(const s of sides){block(r,[-1.0,s*.42,.1],[.08,.1,.18],steel);block(r,[-1.0,s*.42,.2],[.14,.12,.012],steel);}}),
  part('front-supports','Front support, upper / lower · 463-241-03-02 / 463-241-04-02','The upper and lower front supports on the right frame rail.',[-.2,-.45,.3],r=>{block(r,[-.6,-.42,.12],[.12,.08,.03],steel);block(r,[-.6,-.42,-.02],[.12,.08,.03],steel);block(r,[-.6,-.42,.05],[.03,.08,.14],steel);}),
  part('shield-mounts','Engine shield mount bracket, left / right · 463-520-09-41 / 463-520-10-41','The brackets the engine under cover hangs from.',[-.3,.45,-.3],r=>{for(const s of sides)block(r,[-.7,s*.38,-.1],[.1,.06,.08],steel);}),
  part('under-cover','Engine under cover · 463-520-05-42','The under cover below the engine.',[-.4,0,-.55],r=>block(r,[-.7,0,-.18],[.5,.72,.012],plastic)),
  withSource(part('under-cover-brackets','Under cover bracket, left / right · 463-524-00-10 / 463-524-01-10-64','The brackets that hold the rear edge of the under cover.',[-.1,.5,-.6],r=>{for(const s of sides)block(r,[-.45,s*.32,-.15],[.06,.08,.05],steel);}),plates.splash),
  part('transfer-bracket','Transfer case mount bracket · 463-353-05-40','The bracket that carries the transfer case mount.',[.1,0,-.45],r=>{block(r,[.1,0,-.12],[.15,.5,.02],steel);for(const s of sides)block(r,[.1,s*.24,-.06],[.15,.02,.1],steel);}),
  part('transfer-supports','Transfer case support, left / right · 463-285-15-01 / 463-285-16-01','The supports between the frame and the transfer case bracket.',[.15,-.5,-.3],r=>{for(const s of sides)block(r,[.1,s*.36,-.05],[.08,.2,.04],steel);}),
  part('muffler-brackets','Muffler bracket, left / right · 463-490-03-17 / 463-490-04-17','The frame brackets for the front mufflers.',[.4,.5,-.2],r=>{for(const s of sides){block(r,[.45,s*.42,-.02],[.06,.08,.12],steel);cyl(r,[.45,s*.38,-.08],y,-.02,.02,.02,rubber,10);}}),
  part('tank-brackets','Fuel tank support bracket, right / left · 463-310-04-63 / 463-310-03-11','The brackets on the rear frame rails that carry the fuel tank.',[.5,0,.3],r=>{for(const s of sides)block(r,[.9,s*.42,.05],[.14,.08,.1],steel);})
]);
frame.viewAngle=[-.6,.4];

export const studies=[side,rocker,cowl,fenderInner,rearBody,quarter,roof,fuelDoor,frame];
export const views=new Map([
  ['body.structure',side],['floor.pan',rocker],
  ['body.cowl',cowl],
  ['body.fender-left',fenderInner],['body.fender-right',fenderInner],
  ['body.rear-plate-panel',rearBody],['closure-g500.jamb',rearBody],
  ['body.lower-quarter-left',quarter],['body.lower-quarter-right',quarter],['body.upper-quarter-left',quarter],['body.upper-quarter-right',quarter],
  ['g500-roof-cassette.frame',roof],
  ['body.fuel-door',fuelDoor],['body.fuel-door-pocket',fuelDoor],
  ['g500-frame-brackets.stiffeners',frame]
]);

const vin='Confirm the fitted numbers by VIN.';
const notes={
  'g500-side-structure':{fact:'The 2003 G500 center pillar and rocker diagram lists these pillars and connectors with their handed numbers.',need:'Pillar sections are schematic. Measure them on a shell. The hinge pillar is listed from chassis 134621. '+vin},
  'g500-rocker-structure':{fact:'The 2003 G500 center pillar and rocker diagram lists the rocker panels, their reinforcements, the floor front reinforcement, the sill extensions and the seat reinforcements.',need:'The rocker is drawn as a hat section. Measure its closed section and the reinforcement lengths on a shell.'},
  'g500-cowl-structure':{fact:'The 2003 G500 cowl diagram lists the cowl rail, the two reinforcements and the dash and inner insulation. The cowl exterior trim diagram lists the side moldings and their bases.',need:'Rail section, plate outlines and insulation thickness are not measured.'},
  'g500-front-wheelhouses':{fact:'The 2003 G500 fender inner components diagram lists the handed wheelhouses and side panels, the shared seal, the heat shield and the covers.',need:'Wheelhouse shape is drawn as an open box. Cover and heat shield positions are estimated.'},
  'g500-rear-body-panels':{fact:'The 2002 G500 rear body diagram lists the back panel, rear body panel, rear pillars, upper and end panels, the reinforcements and the lock bracket.',need:'Panel outlines are schematic. Some left and right parts carry different number families (460 and 463); '+vin.toLowerCase()},
  'g500-rear-quarter-structure':{fact:'The 2002 G500 quarter panel inner structure diagram lists the lock pillars, inner rear pillars, wheelhouses, splash shields and seal. The fuel-door diagram lists the stiffeners, outer and inner quarter pillars, the reinforcements and the air baffles.',need:'Pillar and wheelhouse geometry is schematic. Confirm which baffle and stiffener sit around the filler pocket on the right side.'},
  'g500-roof-structure':{fact:'The 2003 G500 roof and components diagram lists the roof panel for trucks with and without the sunroof, the sunroof frame and brackets, the roof bow, the corner reinforcement and the edge stiffeners.',need:'The roof is drawn flat. Bow and frame positions are estimated. Check which roof panel a given truck has.'},
  'g500-fuel-door-hardware':{fact:'The 2002 G500 fuel door diagram lists the reinforcement, spring, bumper and actuator with the fuel door.',need:'Spring and actuator positions are schematic. The bumper number is superseded by 123-987-24-40-64.'},
  'g500-frame-mounted-brackets':{fact:'The 2002 G500 frame and components diagram lists these brackets and supports. The 2003 G500 splash shields diagram lists the engine under cover and its rear brackets.',need:'Bracket shapes and their stations along the frame are estimated. Measure them against the frame datums.'}
};
export const claims=studies.flatMap(s=>{
  const bySource=new Map();
  for(const p of s.groups[0].parts){const src=p.source||s.source;if(!bySource.has(src))bySource.set(src,[]);bySource.get(src).push(p.id);}
  return [...bySource].map(([source,ids])=>({ids,kind:'diagram',fact:notes[s.id].fact,need:notes[s.id].need,source}));
});
