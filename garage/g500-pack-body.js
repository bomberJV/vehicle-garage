// G500 study pack: body.
// Body and closures: door internals, weatherstrips and seals, hood hardware, cargo door, emblems, glass and mirrors.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
//
// Parts the register already models are left out: door glass, outside and inside handles,
// latches, hinges and hinge pins, door checks, regulators, strikers, lock actuators and knobs,
// mirror assemblies, glass and base gaskets, the hood skin, insulation, stiffeners, vent grille
// and emblem, the windshield glass and the wiper arms, blades, linkage and motor.
// Geometry is schematic, in study-local coordinates.
import {metal,steel,dark,turn,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const giant='https://www.mbpartsgiant.com/parts-list/';
const plates={
  frontDoor:{label:'MB Parts Giant · 2002 G500 front door glass and lock diagrams',url:giant+'2002-mercedes_benz-g500/body-hardware/front-door'},
  rearDoor:{label:'MB Parts Giant · 2002 G500 rear door glass and lock diagrams',url:giant+'2002-mercedes_benz-g500/body-hardware/rear-door'},
  doorGlass:{label:'MB Parts Giant · 2004 G500 front and rear door glass and hardware diagrams',url:giant+'2004-mercedes_benz-g500/body-hardware/glass-door'},
  doorShell:{label:'MB Parts Giant · 2002 G500 front and rear door and components diagrams',url:giant+'2002-mercedes_benz-g500/body-hardware/door-components'},
  backDoor:{label:'MB Parts Giant · 2002 G500 back door lock and hardware diagram',url:giant+'2002-mercedes_benz-g500/body-hardware/back-door'},
  backShell:{label:'MB Parts Giant · 2002 G500 back door and components diagram',url:giant+'2002-mercedes_benz-g500/body-hardware/back-door-components'},
  tailgateHandle:{label:'MB Parts Giant · G500 tailgate handle listing (2002–2008 fitment)',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-tailgate_handle'},
  hood:{label:'MB Parts Giant · 2004 G500 hood and components diagram',url:giant+'2004-mercedes_benz-g500/body-hardware/hood-components'},
  washer:{label:'MB Parts Giant · 2005 G500 windshield and back door wiper and washer diagrams',url:giant+'2005-mercedes_benz-g500/electrical/wiper-washer-components'},
  mirror2002:{label:'MB Parts Giant · 2002 G500 outside mirrors diagram',url:giant+'2002-mercedes_benz-g500/body-hardware/mirrors'},
  mirrorList:{label:'MB Parts Giant · G500 car mirror listing (fitment by year)',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-car_mirror'},
  mirror2004:{label:'MB Parts Giant · 2004 G500 front door outside mirrors diagram',url:giant+'2004-mercedes_benz-g500/body-hardware/outside-mirrors'},
  windshield:{label:'MB Parts Giant · 2002 G500 windshield glass diagram',url:giant+'2002-mercedes_benz-g500/body-hardware/windshield-glass'},
  reveal:{label:'MB Parts Giant · 2002 G500 windshield reveal moldings diagram',url:giant+'2002-mercedes_benz-g500/body-hardware/reveal-moldings'}
};
export const bodyPackPlates=plates;

const rubber='#26292b',plastic='#3a3f42',black='#1f2324',zinc='#b3b9b1',glassTint='#9fb7bd',amber='#c98a3a',felt='#4a4740';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,n);};
const path=(r,pts,rad,color)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,8);};
// Rectangular frame in the x-z plane: width w, height h, bar thickness t, depth d.
const frame=(r,c,w,h,t,d,color)=>{
  block(r,[c[0],c[1],c[2]+h/2],[w+t,d,t],color);block(r,[c[0],c[1],c[2]-h/2],[w+t,d,t],color);
  block(r,[c[0]-w/2,c[1],c[2]],[t,d,h],color);block(r,[c[0]+w/2,c[1],c[2]],[t,d,h],color);};
// Three-sided window run: front, top and rear legs of a door window opening.
const run=(r,c,w,h,t,color)=>{
  block(r,[c[0],c[1],c[2]+h],[w+t,.05,t],color);
  block(r,[c[0]-w/2,c[1],c[2]+h/2],[t,.05,h],color);block(r,[c[0]+w/2,c[1],c[2]+h/2],[t,.05,h],color);};
const boot=(r,a,len,rad,color)=>{const p=[];for(let i=0;i<=8;i++)p.push([len*i/8,i%2?rad:rad*.75]);turn(r,a,x,[[0,0],...p,[len,0]],color,{n:12});};
const withSource=(p,source)=>({...p,source});

// Side-door lock linkage: the lock unit, its covers, the rods from the sill knob and the
// central-locking actuator to the latch, and the inside release.
const linkage=study('g500-door-lock-linkage','Side-door lock linkage',
  'Inside each side door, rods run from the sill lock knob and the central-locking actuator down to the latch. A cable runs forward from it to the inside release lever. The front-door lock sits behind the outside handle under its own covers.',plates.frontDoor,[
  part('lock','Front door lock, left / right · 463-720-03-35 / 463-720-04-35','The front door lock unit behind the outside handle, listed separately from the latch assembly. The left- and right-hand versions have their own numbers.',[.25,.35,.25],r=>{
    block(r,[.7,0,.3],[.12,.1,.14],steel);cyl(r,[.7,-.05,.3],y,-.1,0,.045,metal,16);}),
  part('lock-clip','Lock retainer clip · 463-821-01-34','The spring clip that holds the lock unit in the door shell.',[.4,.45,.35],r=>{
    block(r,[.7,.07,.3],[.16,.015,.02],zinc);block(r,[.62,.04,.3],[.015,.06,.02],zinc);block(r,[.78,.04,.3],[.015,.06,.02],zinc);}),
  part('lock-cover','Lock cover, left / right · 463-720-51-01 / 463-720-52-01','The plastic cover over the latch and lock inside the rear edge of the door.',[.45,-.2,-.1],r=>block(r,[.74,.08,.08],[.1,.03,.26],plastic)),
  part('cover-plate','Lock cover plate, left / right · 463-723-07-08 / 463-723-08-08','A second cover listed beside the lock covers, over the rod joints above the latch.',[.3,-.35,.3],r=>block(r,[.58,.1,.4],[.16,.02,.12],plastic)),
  part('knob-rod','Lock-knob rod, left / right · 463-723-01-69 / 463-723-02-69','The vertical rod from the sill lock knob down to the latch.',[.0,.25,.45],r=>{path(r,[[.6,0,.9],[.6,0,.5],[.66,0,.32]],.008,steel);cyl(r,[.6,0,.9],z,0,.04,.014,black,8);}),
  part('central-rod','Central-locking rod · 463-723-03-69','The rod from the central-locking actuator to the latch.',[-.15,.3,-.3],r=>{path(r,[[.25,0,-.05],[.5,0,.05],[.66,0,.24]],.008,steel);block(r,[.25,0,-.05],[.05,.04,.03],steel);}),
  part('rod-clip','Lock rod clip · 003-988-50-78','The plastic clip that holds a lock rod to its lever. The catalog uses the same clip on the knob rod and the central rod.',[-.1,-.35,.15],r=>{
    for(const c of [[.6,0,.5],[.5,0,.05]])sleeve(r,c,y,-.02,.02,.022,.009,'#d9d4c4',12);}),
  part('lock-cable','Door lock cable · 463-760-00-04-64','The cable from the inside release to the latch. It runs along the inner panel.',[-.2,.4,-.1],r=>{
    path(r,[[-.3,0,.35],[-.05,0,.3],[.3,0,.22],[.62,0,.2]],.007,black);cyl(r,[-.32,0,.35],x,0,.04,.012,metal,8);}),
  part('arm','Lock rod arm · 309-723-00-55','A small arm on the inside-release rod. The back-door diagram lists the same number as the inside-handle rod clip.',[.15,.4,-.4],r=>{
    block(r,[.62,.03,.17],[.08,.015,.025],steel);cyl(r,[.59,0,.17],y,0,.04,.01,metal,8);}),
  part('lever','Inside handle lever, left / right · 202-766-01-24 / 202-766-02-24','The lever behind the inside handle that pulls the lock cable.',[-.4,-.3,.2],r=>{
    block(r,[-.36,.04,.35],[.12,.025,.035],metal);cyl(r,[-.42,.02,.35],y,0,.05,.018,steel,10);}),
  part('handle-cover','Inside handle cover · 463-727-18-88','The trim cover around the inside handle and its lever. It came in gray and black.',[-.45,-.45,.4],r=>{
    block(r,[-.36,.09,.35],[.24,.02,.12],plastic);block(r,[-.36,.07,.29],[.2,.02,.02],plastic);})
]);
linkage.viewAngle=[-.6,.3];

// Gaskets, wiring boots, shims and buffers around the side doors.
const fittings=study('g500-door-seal-fittings','Side-door gaskets, boots and buffers',
  'The small rubber and shim parts around each side door: gaskets under the outside handle, the wiring boot to the pillar, the hinge shims, the check seal and the striker buffer.',plates.frontDoor,[
  part('handle-gasket-front','Outside handle gasket, front · 000-766-01-97','The rubber pad under the front end of the outside handle.',[-.1,-.35,.25],r=>block(r,[.25,-.1,.4],[.07,.012,.05],rubber)),
  part('handle-gasket-rear','Outside handle gasket, rear · 000-766-00-97','The rubber pad under the rear end of the outside handle.',[.15,-.4,.3],r=>block(r,[.55,-.1,.4],[.07,.012,.05],rubber)),
  part('wire-shield','Door wiring boot · 463-821-01-97-64','The rubber boot that covers the wiring between the door and the hinge pillar. The catalog calls it a wire shield.',[-.35,.25,-.1],r=>{
    boot(r,[-.95,0,.2],.32,.035,rubber);block(r,[-.95,0,.2],[.02,.1,.08],rubber);block(r,[-.63,0,.2],[.02,.09,.07],rubber);}),
  part('hinge-shim','Door hinge shim · 460-723-01-97','A thin shim under a hinge leaf that sets the door gap.',[-.45,-.25,.35],r=>{for(const zz of [.6,-.3])block(r,[-.86,-.04,zz],[.01,.07,.12],zinc);}),
  part('check-seal','Door check seal · 460-723-01-98-64','The seal where the door check strap passes through the front face of the door.',[-.3,.35,-.4],r=>{
    sleeve(r,[-.84,0,0],x,0,.02,.05,.018,rubber,14);block(r,[-.84,0,0],[.01,.12,.06],rubber);}),
  part('striker-buffer','Striker buffer · 463-766-01-13','The rubber buffer at the striker that stops door rattle when closed.',[.4,.25,.1],r=>{block(r,[.92,0,.25],[.03,.06,.08],rubber);block(r,[.9,0,.25],[.012,.08,.1],black);})
]);
fittings.viewAngle=[-.55,.28];

// Glass runs, guides and belt weatherstrips of the front and rear side doors.
const runs=study('g500-door-glass-runs','Side-door glass runs and belt seals',
  'The window runs and guide channels hold the side glass in the door frame. Belt weatherstrips seal it at the waist. A window guide and reinforcement sit inside the door.',plates.doorGlass,[
  part('window-guide','Window guide · 461-720-04-45','The vertical rail inside the door that guides the glass as it drops. Front and rear doors share it.',[.25,.3,-.3],r=>{block(r,[.6,.02,-.1],[.025,.02,.8],steel);block(r,[.6,.04,-.1],[.035,.01,.8],steel);}),
  part('guide-insulator','Window guide insulator · 461-725-02-21','A damping block between the window guide and the inner panel.',[.4,.4,-.4],r=>block(r,[.6,.06,-.35],[.05,.03,.08],rubber)),
  part('front-run','Front door run channel · 463-725-00-56','The rubber run in the front door window frame. It covers the front, top and rear edges of the glass.',[0,-.3,.35],r=>run(r,[0,0,.45],1.3,.5,.035,rubber)),
  withSource(part('front-guide','Front door guide channel · 460-725-06-25','The channel below the belt that continues the run down into the door.',[-.35,-.25,-.35],r=>{block(r,[-.66,0,0],[.035,.05,.8],felt);}),plates.frontDoor),
  part('rear-run','Rear door run channel · 463-730-00-30','The rubber run in the rear door window frame.',[0,.35,.5],r=>run(r,[0,.12,.45],1.1,.45,.03,'#30343a')),
  withSource(part('rear-guide','Rear door guide channel · 309-673-00-31','The rear door channel below the belt. The catalog fits it to the 2002–2003 G500.',[-.4,.35,-.25],r=>block(r,[-.56,.12,0],[.03,.045,.75],felt)),plates.rearDoor),
  withSource(part('front-belt','Front door belt weatherstrip · 463-725-07-65','The weatherstrip along the top of the front door at the waist. It wipes the outer face of the glass.',[0,-.45,.05],r=>{block(r,[0,-.05,.43],[1.3,.025,.035],black);block(r,[0,-.035,.415],[1.3,.01,.02],rubber);}),plates.doorShell),
  withSource(part('rear-belt','Rear door belt weatherstrip · 463-735-07-65','The rear-door waist weatherstrip.',[0,.5,.0],r=>{block(r,[0,.07,.43],[1.1,.025,.035],black);block(r,[0,.085,.415],[1.1,.01,.02],rubber);}),plates.doorShell),
  part('reinforcement','Front window reinforcement, left / right · 463-722-13-16 / 463-722-14-16','A reinforcing plate listed with the front window regulator. It stiffens the inner panel where the regulator mounts.',[.1,.25,-.55],r=>{
    block(r,[0,.05,-.25],[.5,.012,.22],steel);block(r,[-.22,.07,-.25],[.03,.03,.22],steel);block(r,[.22,.07,-.25],[.03,.03,.22],steel);})
]);
runs.viewAngle=[-.5,.25];

// Cargo door: the inside release, lock switch, support strut and the seals and brackets around it.
const cargo=study('g500-cargo-door-fittings','Cargo door fittings',
  'The side-hinged cargo door carries an inside handle with its own rods and lock switch. A support cylinder and stop bracket limit its swing. Seals at the hinges and a weatherstrip around the opening keep the cargo area dry.',plates.backDoor,[
  withSource(part('inside-handle','Cargo door inside handle · 000-760-03-61','The inside handle on the cargo door. It came in gray and black.',[.35,-.4,.25],r=>{
    block(r,[.6,.08,.1],[.16,.03,.06],plastic);block(r,[.6,.11,.1],[.12,.02,.025],dark);}),plates.tailgateHandle),
  part('bezel','Inside handle bezel · 309-766-02-25','The trim bezel around the cargo door inside handle.',[.3,-.5,.4],r=>frame(r,[.6,.12,.1],.2,.09,.02,.015,black)),
  part('lock-switch','Cargo door lock switch · 210-821-43-51','The switch at the cargo door lock that reports the lock state to the central locking.',[.5,.3,-.25],r=>{block(r,[.74,0,-.06],[.05,.04,.06],black);cyl(r,[.74,-.02,-.02],z,0,.03,.006,metal,8);}),
  part('handle-rod','Inside-handle lock rod · 460-743-12-69','The rod from the inside handle to the cargo door lock.',[.15,.35,-.1],r=>path(r,[[.6,.04,.1],[.68,.02,.04],[.76,0,-.02]],.008,steel)),
  part('knob-rod','Cargo door lock-knob rod · 463-743-00-88','The rod from the cargo door lock knob down to the lock.',[.2,.4,.45],r=>path(r,[[.76,0,.55],[.76,0,.1],[.77,0,0]],.008,steel)),
  part('hinge-seal','Hinge seal · 461-743-00-00','The rubber seal behind each cargo door hinge leaf. The number is superseded by 464-743-00-00.',[-.4,-.3,.2],r=>{for(const zz of [.55,-.45])block(r,[-.86,-.03,zz],[.03,.015,.16],rubber);}),
  part('support-cylinder','Cargo door support cylinder · 464-980-00-00','The gas-filled support cylinder that damps the cargo door and holds it open.',[-.15,.45,-.45],r=>{
    tube(r,[-.72,.1,-.6],[-.42,.1,-.56],.025,dark,12);tube(r,[-.42,.1,-.56],[-.18,.1,-.52],.01,metal,10);}),
  part('cylinder-plate','Support cylinder plate · 463-740-00-11','The mounting plate for the body end of the support cylinder.',[-.45,.3,-.55],r=>block(r,[-.76,.1,-.6],[.03,.08,.1],steel)),
  part('ball-stud','Ball stud · 463-991-00-15','The ball stud that the door end of the support cylinder snaps onto.',[-.05,.55,-.65],r=>{cyl(r,[-.16,.1,-.52],x,0,.04,.008,steel,8);turn(r,[-.12,.1,-.52],x,[[-.018,0],[-.012,.013],[0,.018],[.012,.013],[.018,0]],metal,{n:10});}),
  part('latch-clamp','Latch clamp · 463-760-00-75','The clamp that holds the cargo door latch in place.',[.55,.15,.05],r=>{block(r,[.84,.02,0],[.03,.06,.1],zinc);block(r,[.82,.05,0],[.06,.01,.1],zinc);}),
  part('wire-shield','Cargo door wiring boot · 460-821-01-21','The rubber boot over the wiring that crosses from the body into the cargo door.',[-.5,.2,.45],r=>boot(r,[-1.0,0,.25],.25,.03,rubber)),
  part('wire-grommet','Wiring boot grommet · 317-997-02-81','The grommet where the cargo door wiring passes through the door shell.',[-.3,.15,.6],r=>sleeve(r,[-.74,0,.25],x,0,.02,.04,.015,rubber,14)),
  part('stop-bracket','Cargo door stop bracket · 460-740-06-14','The bracket that limits how far the cargo door can open.',[-.35,-.15,-.7],r=>{block(r,[-.6,.05,-.76],[.12,.08,.015],steel);block(r,[-.66,.09,-.72],[.015,.015,.08],steel);}),
  withSource(part('weatherstrip','Cargo door weatherstrip · 463-740-02-78-64','The weatherstrip around the cargo door opening. It replaces 460-740-05-78 and 463-740-02-78.',[0,-.3,0],r=>frame(r,[0,-.06,0],1.7,1.6,.035,.04,rubber)),plates.backShell)
]);
cargo.viewAngle=[-.55,.3];

// Hood: hinges, support cylinders, release and lower striker.
const hood=study('g500-hood-hardware','Hood hinges, release and striker',
  'The hood swings on two rear hinges and two support cylinders hold it up. A cable from a handle in the footwell releases the latch, which closes on a striker in the front panel. Rubber bumpers set its closed height.',plates.hood,[
  part('striker','Hood lower striker · 463-880-03-60','The lower striker in the front panel that the hood latch closes on. It replaces 460-880-03-60.',[0,-.35,-.25],r=>{
    block(r,[0,-.85,-.18],[.12,.05,.03],steel);for(const s of [-1,1])tube(r,[s*.03,-.85,-.16],[s*.03,-.85,-.06],.007,metal,8);tube(r,[-.03,-.85,-.06],[.03,-.85,-.06],.007,metal,8);}),
  part('striker-grommet','Hood striker grommet · 460-997-05-81','The rubber grommet around the striker opening.',[.2,-.45,-.4],r=>sleeve(r,[0,-.85,-.2],z,0,.015,.05,.03,rubber,14)),
  part('hinge','Hood hinge · 460-880-02-28','One of the two hood hinges at the rear corners. The number is used on both sides and is superseded by 464-880-11-01.',[0,.35,.3],r=>{
    for(const s of [-1,1]){block(r,[s*.75,.82,-.04],[.04,.16,.03],steel);block(r,[s*.75,.9,-.1],[.04,.03,.1],steel);cyl(r,[s*.75-.03,.9,-.04],x,0,.06,.015,metal,8);}}),
  part('hinge-shim','Hood hinge shim · 463-889-00-95','A shim under each hood hinge that sets the hood height at the rear.',[0,.5,.0],r=>{for(const s of [-1,1])block(r,[s*.75,.9,-.165],[.06,.06,.008],zinc);}),
  part('support-cylinder','Hood support cylinder · 000-980-81-64','The gas support cylinder that holds the hood open. One sits on each side.',[0,.15,-.4],r=>{
    for(const s of [-1,1]){tube(r,[s*.68,.6,-.45],[s*.68,.45,-.2],.02,dark,10);tube(r,[s*.68,.45,-.2],[s*.68,.32,0],.008,metal,8);}}),
  part('release-handle','Hood release handle · 124-880-01-20','The pull handle in the driver footwell.',[-.3,.35,-.3],r=>{block(r,[-.6,1.15,-.45],[.1,.04,.05],black);block(r,[-.6,1.12,-.5],[.06,.03,.03],black);}),
  part('release-cable','Hood release cable · 463-880-00-59','The cable from the footwell handle forward to the latch.',[-.15,0,-.55],r=>path(r,[[-.6,1.13,-.45],[-.5,.8,-.4],[-.3,0,-.3],[-.05,-.82,-.12]],.008,black)),
  part('bumper','Hood bumper · 000-988-29-11','The rubber stop that the closed hood rests on. One sits on each side.',[0,-.2,.25],r=>{for(const s of [-1,1])cyl(r,[s*.78,-.7,-.12],z,0,.06,.025,rubber,12);}),
  part('emblem-clip','Hood emblem clip · 011-988-29-78','The clip that holds the hood emblem in the skin.',[.35,-.4,.35],r=>sleeve(r,[0,-.72,.02],z,-.03,0,.018,.006,'#d9d4c4',12))
]);
hood.viewAngle=[-.7,.4];

// Washer supply: reservoir, pump, check valve, hose and nozzles.
const washer=study('g500-washer-supply','Washer reservoir, pump and nozzles',
  'The washer reservoir carries a filler neck, a level sensor and an electric pump in a grommet. The pump feeds the windshield nozzles through a check valve, and the back-door nozzle through its own hose.',plates.washer,[
  part('reservoir','Washer reservoir · 463-860-07-60','The plastic washer fluid tank.',[0,0,-.3],r=>{block(r,[0,0,0],[.5,.3,.45],'#d8dcd6');block(r,[0,0,.24],[.44,.26,.03],'#cfd4ce');}),
  part('filler-neck','Washer filler neck · 463-869-02-66','The neck that carries the filler opening up from the reservoir.',[.25,0,.4],r=>tube(r,[.15,0,.23],[.25,0,.55],.04,'#cfd4ce',12)),
  part('filler-grommet','Filler neck grommet · 140-997-16-81','The grommet that seals the filler neck into the reservoir.',[.4,.1,.15],r=>sleeve(r,[.15,0,.22],z,0,.025,.06,.04,rubber,14)),
  part('cap','Washer filler cap · 140-869-01-08','The cap on the filler neck.',[.35,0,.6],r=>cyl(r,[.25,0,.55],z,0,.04,.05,'#2f6db0',14)),
  part('level-sensor','Washer level sensor · 210-540-05-45','The sensor in the reservoir wall that warns when the fluid is low.',[-.4,-.1,-.2],r=>{cyl(r,[-.25,0,-.12],x,-.08,0,.025,black,10);block(r,[-.35,0,-.12],[.04,.05,.05],black);}),
  part('pump','Washer pump · 210-869-08-21','The electric pump at the base of the reservoir. The diagram lists the same pump on both its windshield and back-door pages.',[.4,-.35,-.35],r=>{cyl(r,[.15,-.15,-.1],y,-.12,0,.035,black,12);cyl(r,[.15,-.27,-.1],y,-.03,0,.012,metal,8);}),
  part('pump-grommet','Washer pump grommet · 123-997-36-81','The grommet that seals the pump into the reservoir.',[.25,-.5,-.15],r=>sleeve(r,[.15,-.15,-.1],y,0,.02,.05,.035,rubber,14)),
  part('valve','Washer check valve · 000-860-10-62','The one-way valve in the windshield washer line that keeps it full between sprays.',[0,-.4,.35],r=>{cyl(r,[.1,-.5,.4],z,-.03,.03,.016,black,10);}),
  part('hose','Washer hose · 010-997-89-82','The washer hose from the pump to the nozzles.',[-.1,-.25,.55],r=>path(r,[[.15,-.3,-.1],[.1,-.5,.37],[.1,-.5,.43],[0,-.65,.8]],.01,black)),
  part('windshield-nozzle','Windshield washer nozzle · 230-860-03-47','A spray nozzle for the windshield. Left and right use the same number.',[0,-.5,.7],r=>{block(r,[0,-.65,.82],[.06,.04,.025],black);cyl(r,[0,-.67,.835],y,-.02,0,.006,metal,6);}),
  part('back-nozzle','Back-door washer nozzle · 000-869-30-47','The nozzle that sprays the cargo-door window.',[-.5,.5,.55],r=>{block(r,[-.75,.6,.6],[.05,.03,.03],black);cyl(r,[-.75,.62,.6],y,0,.02,.006,metal,6);})
]);
washer.viewAngle=[-.6,.3];

// Outside mirror internals.
const mirror=study('g500-mirror-internals','Outside mirror motors and lamps',
  'The adjusting motor sits behind the mirror glass in each outside mirror head. Later heads add a turn-signal lens on the outer edge and a puddle lamp underneath.',plates.mirror2002,[
  withSource(part('motor-early','Mirror motor, 2002–2003 · 463-810-01-86','The electric motor behind the glass that adjusts the mirror. The catalog lists this one for 2002–2003.',[-.35,.25,.2],r=>{
    block(r,[-.15,.05,0],[.24,.08,.2],plastic);for(const c of [[-.22,.1,.05],[-.08,.1,.05],[-.15,.1,-.06]])cyl(r,c,y,0,.03,.02,metal,10);}),plates.mirrorList),
  withSource(part('motor-late','Mirror motor, 2004–2008 · 463-810-02-86','The later mirror motor. The catalog lists it for 2004–2008.',[.35,.25,.2],r=>{
    block(r,[.15,.05,0],[.24,.08,.2],dark);for(const c of [[.08,.1,.05],[.22,.1,.05],[.15,.1,-.06]])cyl(r,c,y,0,.03,.02,metal,10);}),plates.mirrorList),
  withSource(part('signal-lens','Mirror signal lens, left / right · 203-820-13-21-64 / 203-820-14-21-64','The amber turn-signal lens on the outer edge of the mirror head.',[.45,-.3,0],r=>{
    block(r,[.5,-.02,0],[.03,.12,.24],amber);block(r,[.48,-.02,0],[.01,.1,.22],glassTint);}),plates.mirror2004),
  withSource(part('puddle-lamp','Mirror puddle lamp, left / right · 203-820-01-59 / 203-820-02-59','The lamp under the mirror head that lights the ground beside the door.',[0,-.3,-.45],r=>{
    block(r,[0,-.02,-.2],[.14,.06,.04],black);block(r,[0,-.02,-.225],[.11,.05,.01],'#e8e4cf');}),plates.mirror2004)
]);
mirror.viewAngle=[-.5,.25];

// Windshield frame and its seals.
const screen=study('g500-windshield-frame','Windshield frame and seals',
  'The windshield sits in a separate frame assembly bolted to the cowl. Seals run around the glass and along the top against the roof, and a retainer holds the upper seal. The pillar moldings clip over the frame sides.',plates.windshield,[
  part('frame-assembly','Windshield frame assembly · 463-670-06-02','The complete frame that carries the windshield.',[0,.35,0],r=>frame(r,[0,.05,0],1.6,.8,.06,.06,'#5e6a6e')),
  part('windshield-frame','Windshield frame · 463-671-07-29-64','The frame member listed separately from the assembly.',[0,.55,.1],r=>frame(r,[0,.12,0],1.5,.72,.035,.04,steel)),
  part('lower-frame','Lower windshield frame · 463-670-23-02','The lower rail of the frame along the cowl.',[0,.25,-.45],r=>block(r,[0,.05,-.45],[1.6,.08,.05],steel)),
  part('upper-frame','Upper windshield frame · 000-985-38-44-64','The part at the top of the frame, along the roof edge.',[0,.25,.45],r=>block(r,[0,.05,.45],[1.5,.05,.035],steel)),
  part('upper-seal','Windshield upper seal · 000-987-08-62','The seal along the top of the frame against the roof.',[0,-.2,.6],r=>block(r,[0,.02,.49],[1.55,.04,.025],rubber)),
  part('retainer','Upper seal retainer · 004-988-56-78','The retainer strip that holds the upper seal.',[0,-.35,.75],r=>block(r,[0,-.01,.52],[1.5,.015,.015],zinc)),
  part('seal','Windshield seal · 463-671-02-20','The rubber seal around the glass in the frame.',[0,-.4,0],r=>frame(r,[0,-.02,0],1.46,.68,.03,.03,rubber)),
  withSource(part('molding-clip','Pillar molding clip · 006-988-14-78','A clip that holds a windshield pillar molding to the frame side.',[.55,-.3,-.1],r=>{for(const s of [-1,1])block(r,[s*.82,-.02,.1],[.025,.02,.05],'#d9d4c4');}),plates.reveal)
]);
screen.viewAngle=[-.45,.2];

export const studies=[linkage,fittings,runs,cargo,hood,washer,mirror,screen];
const doors=['front-left','front-right','rear-left','rear-right'];
export const views=new Map([
  ...doors.map(d=>['door-g500-'+d+'.inner-handle',linkage]),
  ...doors.map(d=>['door-g500-'+d+'.check',fittings]),
  ...doors.map(d=>['door-g500-'+d+'.seals',runs]),
  ['closure-g500.skin',cargo],
  ['g500-bonnet.catch',hood],
  ['body.wipers',washer],
  ['body.mirror-left',mirror],['body.mirror-right',mirror],
  ['body.pillar-molding-left',screen],['body.pillar-molding-right',screen]
]);

// One claim per cited page within each study.
const notes={
  'g500-door-lock-linkage':{fact:'The 2002 G500 front-door lock and hardware diagram lists these as separate numbered parts. The lock rods, clip, cable, arm, levers and cover are the same numbers on the rear-door diagram.',need:'Placement inside the door shell is schematic. Confirm the rod and cable routing and the lock position on a stripped door.'},
  'g500-door-seal-fittings':{fact:'The 2002 G500 front- and rear-door lock and hardware diagrams list these gaskets, boot, shim, seal and buffer with the same numbers for both doors.',need:'Gasket outlines, boot length and shim thickness are not measured.'},
  'g500-door-glass-runs':{fact:'The G500 door glass, door and components diagrams list these runs, channels, belt weatherstrips, guide and reinforcement for the front and rear doors.',need:'Seal sections and run lengths are schematic. The rear guide channel is listed for 2002–2003 only. Confirm the fitted parts by VIN.'},
  'g500-cargo-door-fittings':{fact:'The 2002 G500 back-door lock and hardware diagram, the back-door components diagram and the tailgate handle listing give these numbers for the cargo door.',need:'The support cylinder, stop bracket and seal positions are estimated. Measure them on the door and the body opening.'},
  'g500-hood-hardware':{fact:'The 2004 G500 hood and components diagram lists these hinges, shims, support cylinders, release, striker and bumpers. The 2002–2008 G500 shares the lower striker.',need:'Hinge, strut and cable geometry is schematic. Confirm the 2002 numbers by VIN.'},
  'g500-washer-supply':{fact:'The 2005 G500 windshield and back-door wiper and washer diagrams list this reservoir, pump, valve, hose and nozzles.',need:'Taken from the 2005 page. Confirm the 2002 numbers by VIN. Reservoir shape, hose routing and nozzle positions are not measured.'},
  'g500-mirror-internals':{fact:'The 2002 G500 mirror diagram and the G500 mirror listing give the two adjusting motors by year. The 2004 G500 outside-mirror diagram lists the signal lenses and puddle lamps.',need:'The signal lens and puddle lamp come from the 2004 diagram. A 2002 US mirror may not have them. Confirm by VIN. Internal layout is schematic.'},
  'g500-windshield-frame':{fact:'The 2002 G500 windshield glass diagram lists the frame members, seals and retainer. The reveal moldings diagram lists the pillar molding clip.',need:'Frame sections and seal profiles are not measured.'}
};
export const claims=studies.flatMap(s=>{
  const bySource=new Map();
  for(const p of s.groups[0].parts){const src=p.source||s.source;if(!bySource.has(src))bySource.set(src,[]);bySource.get(src).push(p.id);}
  return [...bySource].map(([source,ids])=>({ids,kind:'diagram',fact:notes[s.id].fact,need:notes[s.id].need,source}));
});
