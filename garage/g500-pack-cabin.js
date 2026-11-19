// G500 study pack: cabin.
// Cabin: seats and seat mechanisms, heated seats, headliner, visors, pillar trims, carpets, consoles, interior trim.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
//
// Geometry is schematic, in study-local units of roughly ±1: x across the car (driver side
// negative), y fore and aft (forward negative), z up. None of it is measured.
// Parts the register already models are left out: the rear seat-back assemblies, cushion
// covers, back pads and head restraints; the rear seat heaters (seat-heating.rear-*); the
// seat-heater switch and module; the sill finishers (floor.sills); the inner door release
// (door-*.inner-handle); the front seat adjusters (g500-front-seat.tracks) and the
// interior mirror (body.rearview-mirror).
import {metal,steel,dark,cyl,sleeve,part,study,x,y,z} from './mechanism-shapes.js';

const plastic='#3a3f42',trim='#5b5f60',foam='#8a7f6c',cloth='#4b4f55',rubber='#26292b',webbing='#2f3438';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,n);};
// A flat rectangular frame in the x-y plane.
const rect=(r,c,w,d,t,color)=>{
  block(r,[c[0],c[1]-d/2,c[2]],[w,t,t],color);block(r,[c[0],c[1]+d/2,c[2]],[w,t,t],color);
  block(r,[c[0]-w/2,c[1],c[2]],[t,d,t],color);block(r,[c[0]+w/2,c[1],c[2]],[t,d,t],color);};
// A coil spring along an axis, drawn as a row of thin rings.
const coil=(r,c,a,length,rad,turns,color)=>{for(let i=0;i<turns;i++)sleeve(r,c,a,length*i/turns,length*i/turns+length*.5/turns,rad,rad*.72,color,12);};
const sides=[-1,1];
const withSource=(p,source)=>({...p,source});

const rearSeatPlate={label:'MB Parts Giant · 2002 G500 rear seat components diagram (upper and lower, left and right sections; filed under heated seats)',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/electrical/heated-seats'};
const consolePlate={label:'MB Parts Giant · console trim plate 463-683-02-30, 2002–2003 G500 center console diagram',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~trim-plate~4636830230'};
const consoleReinforcementPage={label:'MB Parts Giant · console trim plate reinforcement 463-683-04-25, 2002–2003 G500',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~trim-plate-reinforcement~4636830425'};
const ashtrayList={label:'MB Parts Giant · G500 ashtray listing with fitment per number',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-ashtray'};
const pillarList={label:'MB Parts Giant · G500 pillar trim listing with fitment per number',url:'https://mbpartsgiant.com/oem-mercedes_benz-g500-pillar_panels'};
const pillarPlate={label:'MB Parts Giant · center pillar trim 463-690-06-40, 2002–2005 G500 pillar trim diagram',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~center-pillar-trim~46369006409045'};
const seatSwitchList={label:'MB Parts Giant · G500 seat switch listing with fitment per number',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-seat_switch'};
const cargoNetPlate={label:'MB Parts Giant · cargo net 463-860-00-74, 2002–2003 G500 cargo area diagram',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~cargo-net~4638600074'};
const wheelhouseList={label:'MB Parts Giant · G500 wheelhouse listing with fitment per number',url:'https://www.mbpartsgiant.com/oem-mercedes_benz-g500-wheelhouse'};

// Rear seat base: two cushion sections that fold forward on front pivots.
const cx=s=>s*.45;
const sideName=s=>s<0?'left':'right';
const benchSide=(s,key,num,name,desc,offset,draw)=>part(key+'-'+sideName(s),name+', '+sideName(s)+' · '+num,desc,offset,r=>draw(r,s));
const baseRows=[
  ...sides.map(s=>benchSide(s,'frame',s<0?'463-920-11-22':'463-920-12-22','Rear seat frame','The steel frame that carries one rear cushion section and its fold hardware.',[s*.25,0,-.25],(r,s)=>{
    rect(r,[cx(s),0,0],.8,.6,.035,steel);for(const yy of [-.1,.1])block(r,[cx(s),yy,0],[.8,.02,.02],steel);})),
  ...sides.map(s=>benchSide(s,'pad',s<0?'463-920-09-50':'463-920-07-50','Rear seat cushion pad','The foam pad that sits on the frame under the cushion cover.',[s*.2,0,.35],(r,s)=>block(r,[cx(s),0,.11],[.78,.58,.16],foam))),
  ...sides.map(s=>benchSide(s,'under-cover',s<0?'463-924-07-37':'463-924-08-37','Rear seat under cover','The plastic panel that closes the front and underside of the cushion section.',[s*.15,-.35,-.1],(r,s)=>{
    block(r,[cx(s),-.31,-.04],[.8,.02,.1],plastic);block(r,[cx(s),-.2,-.09],[.8,.22,.01],plastic);})),
  ...sides.map(s=>benchSide(s,'handle',s<0?'463-920-07-64':'463-920-08-64','Rear cushion handle','The pull handle at the front edge of the cushion section.',[s*.1,-.45,.15],(r,s)=>{
    block(r,[cx(s),-.345,.05],[.16,.025,.025],dark);for(const d of [-1,1])block(r,[cx(s)+d*.07,-.33,.05],[.02,.03,.025],dark);})),
  ...sides.map(s=>benchSide(s,'lock',s<0?'463-920-07-72':'463-920-08-72','Rear cushion lock','The latch at the back of the cushion frame that holds the section down.',[s*.15,.4,0],(r,s)=>{
    block(r,[cx(s),.3,-.02],[.1,.05,.07],dark);block(r,[cx(s),.33,-.06],[.03,.03,.03],metal);})),
  ...sides.map(s=>benchSide(s,'inner-lever',s<0?'463-920-09-64':'463-920-10-64','Rear cushion inner lever','The inboard lever of the cushion release.',[s*-.1,.1,-.3],(r,s)=>{
    block(r,[s*.1,.05,-.04],[.02,.26,.03],steel);cyl(r,[s*.1,-.08,-.04],x,-.015,.015,.02,metal,10);})),
  part('outer-lever','Rear cushion outer lever · 463-920-11-64','The outboard lever of the cushion release; the same number serves both sections.',[0,.1,-.45],r=>{
    for(const s of sides){block(r,[s*.83,.05,-.04],[.02,.26,.03],steel);cyl(r,[s*.83,-.08,-.04],x,-.015,.015,.02,metal,10);}}),
  part('bracket','Rear cushion bracket · 463-920-02-28','A bracket listed with the right-hand cushion section.',[.5,-.2,-.35],r=>{
    block(r,[.45,-.24,-.08],[.12,.02,.08],steel);block(r,[.45,-.21,-.12],[.12,.06,.02],steel);}),
  part('bushing','Cushion pivot bushing · 463-929-02-17','Plastic bushings at the cushion fold pivots; now supplied as 463-929-02-17-64.',[0,-.55,-.2],r=>{
    for(const s of sides)for(const xx of [cx(s)-.3,cx(s)+.3])sleeve(r,[xx,-.28,-.12],x,-.02,.02,.025,.012,rubber,12);}),
  part('rod','Cushion release rod · 463-929-03-81','The link rod between the release levers of the right-hand section.',[.3,0,-.55],r=>tube(r,[.12,-.08,-.06],[.8,-.08,-.06],.008,metal,8)),
  ...sides.map(s=>benchSide(s,'spring',s<0?'463-993-00-20':'463-993-01-20','Cushion fold spring','The spring at the front pivot that helps lift the cushion section.',[s*.3,-.5,-.45],(r,s)=>coil(r,[cx(s)-.12,-.28,-.12],x,.24,.03,7,metal))),
  part('strut','Cushion strut cylinder · 463-920-06-27','A gas strut under each cushion section, one number for both sides.',[0,-.1,-.7],r=>{
    for(const s of sides){const a=[s*.62,-.22,-.26],b=[s*.62,.12,-.04],m=a.map((v,i)=>v+(b[i]-v)*.55);tube(r,a,m,.022,dark);tube(r,m,b,.009,metal,8);}}),
  part('support','Cushion pivot support · 463-920-13-24-64','The floor bracket that carries the front pivot of each cushion section.',[0,-.6,-.6],r=>{
    for(const s of sides){block(r,[cx(s),-.28,-.24],[.14,.08,.02],steel);block(r,[cx(s),-.28,-.17],[.02,.08,.12],steel);}}),
  part('pivot-pin','Cushion pivot pin · 463-991-02-01','The pin through the pivot support on each side.',[0,-.75,-.35],r=>{for(const s of sides)cyl(r,[cx(s)-.06,-.28,-.14],x,0,.12,.012,metal,10);})
].map(p=>withSource(p,rearSeatPlate));
const rearBase=study('g500-rear-seat-base','Rear seat base and fold mechanism','The rear seat base is split into left and right sections. Each has its own frame, foam pad and under cover, with a handle, levers, lock, spring, strut and pivot pieces that let the cushion fold forward.',rearSeatPlate,baseRows);
rearBase.viewAngle=[-.6,.35];

// Rear backrest: covers, hard back panels and the release and adjuster hardware.
const backRows=[
  ...sides.map(s=>benchSide(s,'cover',s<0?'463-920-18-47':'463-920-17-47','Rear backrest cover','The upholstery cover on the front of the backrest section.',[s*.2,-.3,.1],(r,s)=>block(r,[cx(s),0,.55],[.78,.1,.8],cloth))),
  ...sides.map(s=>benchSide(s,'back-panel',s<0?'463-924-09-37':'463-924-10-37','Rear backrest panel','The hard panel on the back of the backrest that faces the cargo area.',[s*.2,.4,.05],(r,s)=>block(r,[cx(s),.065,.55],[.78,.02,.8],plastic))),
  part('housing','Backrest upper housing · 463-868-00-07','A housing at the top of the backrest. Mercedes files it in the seat-belt trim group 868; the catalog row only calls it Housing.',[0,0,.35],r=>{
    for(const s of sides)block(r,[s*.74,.0,.97],[.1,.12,.06],trim);}),
  part('edge-guard','Backrest edge guard · 463-929-00-83','The edge trim along the backrest panel, riveted on.',[0,.25,.3],r=>{for(const s of sides)block(r,[cx(s),.075,.95],[.78,.03,.025],rubber);}),
  part('release-handle','Backrest release handle · 463-929-00-27','The handle on top of the left backrest section.',[-.25,-.1,.45],r=>{
    block(r,[-.2,0,1.0],[.14,.04,.02],dark);for(const d of [-1,1])block(r,[-.2+d*.06,0,.97],[.02,.04,.05],dark);}),
  part('hinge-cover','Backrest hinge cover · 463-929-06-43','The cover over the outboard hinge of the left backrest section.',[-.4,0,-.15],r=>cyl(r,[-.86,0,.18],x,-.03,.03,.06,trim,16)),
  part('cap','Backrest cap · 463-924-00-35','A trim cap on the backrest; now supplied as 463-923-00-22. Its position here is schematic.',[0,.2,.5],r=>{for(const s of sides)cyl(r,[s*.12,.08,.88],y,0,.02,.025,trim,12);}),
  part('release-lever','Backrest release lever · 463-920-02-95','The lever that unlatches each backrest section to fold it.',[0,-.15,.55],r=>{
    for(const s of sides){block(r,[s*.6,.0,.99],[.1,.03,.03],dark);block(r,[s*.66,.0,.96],[.02,.03,.05],dark);}}),
  part('lever-cover','Release lever lower cover · 463-923-02-28','The cover under each release lever.',[0,-.2,.2],r=>{for(const s of sides)block(r,[s*.62,.0,.93],[.14,.06,.02],trim);}),
  part('adjuster-left','Backrest adjuster, driver side · 463-920-00-87','The backrest adjustment mechanism listed for the driver-side section.',[-.45,.1,-.2],r=>{
    block(r,[-.82,.02,.18],[.04,.1,.14],steel);cyl(r,[-.84,.02,.18],x,-.03,0,.035,metal,12);}),
  part('adjuster-right','Backrest adjuster, passenger side · 463-920-01-87','The backrest adjustment mechanism listed for the passenger-side section.',[.45,.1,-.2],r=>{
    block(r,[.82,.02,.18],[.04,.1,.14],steel);cyl(r,[.84,.02,.18],x,0,.03,.035,metal,12);})
].map(p=>withSource(p,rearSeatPlate));
const rearBack=study('g500-rear-backrest','Rear backrest panels and release','Each rear backrest section has a front cover and a hard back panel. A release lever and handle unlatch it, with adjusters, a hinge cover, caps and edge trim listed on the same diagram.',rearSeatPlate,backRows);
rearBack.viewAngle=[-.5,.3];

// Center console pieces from the 2002–2003 diagram.
const consoleRows=[
  part('compartment','Console storage compartment · 463-680-02-79','The storage bin under the armrest lid at the rear of the console.',[0,.35,.3],r=>{
    block(r,[0,.38,.12],[.34,.4,.02],plastic);for(const s of sides)block(r,[s*.17,.38,.24],[.02,.4,.24],plastic);
    for(const yy of [.18,.58])block(r,[0,yy,.24],[.34,.02,.24],plastic);}),
  part('cup-holder','Cup holder · 463-683-12-91','The cup holder in the console.',[0,-.05,.45],r=>{for(const xx of [-.08,.08])sleeve(r,[xx,-.05,.28],z,0,.1,.065,.055,dark,16);}),
  part('tray','Console tray · 463-683-13-91','A shallow tray in the console top.',[0,-.4,.45],r=>{block(r,[0,-.35,.3],[.3,.18,.01],dark);for(const s of sides)block(r,[s*.15,-.35,.32],[.01,.18,.04],dark);}),
  part('brake-cover','Parking brake cover · 463-680-21-08','The cover around the hand-brake lever in the console.',[.35,.1,.3],r=>{
    for(const s of sides)block(r,[s*.06,.1,.33],[.06,.24,.03],plastic);block(r,[0,.23,.33],[.18,.02,.03],plastic);}),
  part('rear-cover','Console rear cover · 463-680-10-08','The panel that closes the rear end of the console.',[0,.6,0],r=>block(r,[0,.6,.18],[.38,.02,.34],plastic)),
  part('side-cover','Console side cover · 463-680-00-17','The side panels of the console.',[0,0,-.35],r=>{for(const s of sides)block(r,[s*.2,0,.16],[.02,1.1,.3],trim);}),
  part('switch-panel','Console switch panel · 463-683-01-54','The switch carrier at the front of the console.',[0,-.65,.3],r=>{
    block(r,[0,-.6,.36],[.32,.08,.06],dark);for(let i=0;i<4;i++)block(r,[-.105+i*.07,-.6,.4],[.045,.05,.02],metal);}),
  withSource(part('reinforcement','Console trim plate reinforcement · 463-683-04-25','The stiffener under the console trim plate.',[0,-.2,.15],r=>block(r,[0,-.2,.25],[.3,.5,.008],steel)),consoleReinforcementPage),
  withSource(part('ashtray','Ashtray · 463-810-02-30','The ashtray listed for the 2002–2003 G500. Its place in the console is assumed.',[0,-.9,.2],r=>{
    block(r,[0,-.8,.28],[.16,.1,.06],dark);block(r,[0,-.85,.32],[.16,.01,.03],metal);}),ashtrayList)
].map(p=>p.source?p:withSource(p,consolePlate));
const consoleParts=study('g500-console-parts','Center console pieces','The pieces the 2002–2003 diagram lists in the center console: storage compartment, cup holder, tray, parking-brake cover, end and side covers, switch panel and trim plate reinforcement, with the ashtray.',consolePlate,consoleRows);
consoleParts.viewAngle=[-.55,.4];

// Pillar trims around the door openings, with the footwell and sill pieces from the pillar diagram.
const pillarRows=[
  ...sides.map(s=>withSource(part('a-pillar-'+sideName(s),'Windshield pillar trim, '+(s<0?'driver':'passenger')+' · '+(s<0?'463-692-00-01':'463-692-01-01'),'The trim over the windshield pillar, listed for 2002–2003.',[s*.2,-.3,.2],r=>tube(r,[s*.86,-.9,.2],[s*.8,-.6,1.0],.035,trim,6)),pillarList)),
  ...sides.map(s=>withSource(part('b-pillar-'+sideName(s),'Center pillar trim, '+(s<0?'driver':'passenger')+' · '+(s<0?'463-690-01-40':'463-690-06-40'),'The trim on the center pillar between the front and rear doors, listed for 2002–2005.',[s*.25,0,0],r=>block(r,[s*.86,0,.5],[.04,.12,.9],trim)),pillarList)),
  ...sides.map(s=>withSource(part('rear-pillar-'+sideName(s),'Rear pillar trim, '+(s<0?'driver':'passenger')+' · '+(s<0?'463-694-20-25':'463-694-18-25'),'The trim on the rear body pillar beside the cargo area, listed for 2002–2005.',[s*.25,.3,0],r=>block(r,[s*.86,.85,.5],[.04,.2,.9],trim)),pillarList)),
  part('a-pillar-lower','Windshield pillar lower cover · 463-692-06-22','The lower cover at the foot of the windshield pillar.',[-.25,-.35,-.2],r=>block(r,[-.86,-.9,.02],[.04,.14,.24],plastic)),
  part('cowl-trim','Footwell side trim · 463-684-05-02','The trim panel on the side of the front footwell below the dash, called cowl trim in the catalog.',[-.2,-.5,-.4],r=>block(r,[-.82,-.72,-.2],[.03,.3,.26],plastic)),
  part('retainer-front','Sill retainer plate · 463-686-04-36','A retainer plate for the sill trim.',[-.25,-.2,-.5],r=>block(r,[-.88,-.4,-.32],[.03,.12,.04],steel)),
  part('retainer-rear','Sill retainer plate · 461-686-04-36','A second retainer plate for the sill trim, with a 461 number.',[-.25,.2,-.5],r=>block(r,[-.88,.4,-.32],[.03,.12,.04],steel))
].map(p=>p.source?p:withSource(p,pillarPlate));
const pillarTrim=study('g500-pillar-trim','Pillar trim panels','The trim panels on the windshield, center and rear pillars of both sides, with the footwell side trim, the windshield pillar lower cover and the sill retainer plates from the same diagram.',pillarList,pillarRows);
pillarTrim.viewAngle=[-.9,.25];

// Seat-adjustment switches.
const seatSwitch=(r,s)=>{
  const c=[s*.3,0,0];
  block(r,[c[0],0,0],[.3,.22,.05],plastic);
  block(r,[c[0]-.03,0,.05],[.16,.12,.04],dark);
  block(r,[c[0]+.07,0,.12],[.04,.12,.16],dark);
  block(r,[c[0]+.07,0,.22],[.04,.06,.04],dark);
};
const switchRows=[
  part('left','Seat switch, driver · 210-820-91-10','The seat-shaped switch for the driver seat; now supplied as 210-820-91-10-64.',[-.3,0,.2],r=>seatSwitch(r,-1)),
  part('right','Seat switch, passenger · 210-820-90-10-64','The seat-shaped switch for the passenger seat; it replaces 210-820-90-10.',[.3,0,.2],r=>seatSwitch(r,1))
].map(p=>withSource(p,seatSwitchList));
const switches=study('g500-seat-switches','Seat-adjustment switches','Mercedes lists a driver and a passenger seat switch for the 2002–2008 G500. Each is shaped like a seat. Elsewhere this register places the seat-shaped controls on the front doors.',seatSwitchList,switchRows);
switches.viewAngle=[-.5,.6];

// Cargo area behind the rear seat: net, its mounts and the cargo-side trim.
const cargoRows=[
  part('net','Cargo net · 463-860-00-74','The net that closes the load space behind the rear seat, listed for 2002–2003.',[0,-.2,.1],r=>{
    for(let i=0;i<=8;i++)block(r,[-.7+i*.175,0,.6],[.008,.008,.8],webbing);
    for(let j=0;j<=5;j++)block(r,[0,0,.2+j*.16],[1.4,.008,.008],webbing);}),
  part('bracket','Cargo net bracket · 124-868-09-14','The roof-side bracket that holds the top of the net.',[0,0,.35],r=>{for(const s of sides){block(r,[s*.74,0,1.06],[.08,.06,.02],steel);block(r,[s*.74,0,1.03],[.02,.06,.05],steel);}}),
  part('bushing','Cargo net bushing · 460-992-71-01','The bushing in each net bracket.',[0,-.15,.5],r=>{for(const s of sides)sleeve(r,[s*.74,0,1.01],x,-.02,.02,.018,.009,rubber,12);}),
  part('spacer','Cargo net spacer · 463-868-00-28','The spacer that sets the net mount off the body.',[0,.15,.5],r=>{for(const s of sides)cyl(r,[s*.8,0,1.01],x,-.02,.02,.022,metal,12);}),
  part('support','Cargo net support · 463-868-08-14-64','A support in the net’s mounting group. The catalog row does not say where it sits, so it is drawn as the top rail.',[0,.2,.3],r=>cyl(r,[-.7,0,1.0],x,0,1.4,.012,dark,8)),
  part('strap','Cargo net strap · 463-983-00-13','A strap from the diagram that ties the net down.',[0,-.3,-.3],r=>{for(const s of sides)block(r,[s*.6,.02,.08],[.03,.006,.24],webbing);}),
  part('tie-plate','Tie plate · 202-860-03-14','An anchor plate from the cargo-area diagram.',[0,-.1,-.5],r=>{for(const s of sides){block(r,[s*.6,.05,-.06],[.06,.08,.01],metal);sleeve(r,[s*.6,.05,-.05],z,0,.02,.02,.01,metal,10);}}),
  part('mat-bracket','Cargo mat bracket · 463-684-00-35','The bracket that holds the edge of the cargo floor mat.',[0,.45,-.35],r=>block(r,[0,.9,-.08],[.9,.03,.03],steel)),
  part('vent-grille','Rear body vent grille · 463-694-07-33','The vent grille in the rear side trim that lets cabin air out.',[-.35,.2,.2],r=>{block(r,[-.86,.6,.45],[.02,.2,.12],dark);for(let i=0;i<4;i++)block(r,[-.85,.6,.4+i*.033],[.02,.18,.008],plastic);}),
  withSource(part('wheelhouse-left','Cargo wheelhouse trim, driver · 463-680-13-42','The lining over the left rear wheelhouse in the cargo area, listed for 2002–2005.',[-.3,.3,-.25],r=>{
    block(r,[-.72,.5,0],[.22,.6,.25],trim);block(r,[-.6,.5,.13],[.02,.6,.01],trim);}),wheelhouseList),
  withSource(part('wheelhouse-right','Cargo wheelhouse trim, passenger · 463-680-28-46','The lining over the right rear wheelhouse in the cargo area, listed for 2002–2005.',[.3,.3,-.25],r=>{
    block(r,[.72,.5,0],[.22,.6,.25],trim);block(r,[.6,.5,.13],[.02,.6,.01],trim);}),wheelhouseList)
].map(p=>p.source?p:withSource(p,cargoNetPlate));
const cargo=study('g500-cargo-trim','Cargo net and cargo-area trim','The load space behind the rear seat: the cargo net with its brackets, bushings, spacer, support and strap, a tie plate, the mat bracket, the rear vent grille and the linings over the rear wheelhouses.',cargoNetPlate,cargoRows);
cargo.viewAngle=[-.4,.3];

export const studies=[rearBase,rearBack,consoleParts,pillarTrim,cargo];
export const views=new Map([
  ['body.rear-bench',rearBase],
  ['body.rear-bench-back-left',rearBack],
  ['body.center-console',consoleParts],
  ['body.belt-lower-covers',pillarTrim],
  ['body.rear-bench-back-right',cargo]
]);

const ids=(s,keep=()=>true)=>s.groups[0].parts.filter(keep).map(p=>p.id);
const from=src=>p=>(p.source||null)===src;
export const claims=[
  {ids:ids(rearBase),kind:'diagram',fact:'The 2002 G500 rear seat diagram (four views: left and right sections, upper and lower components) lists each of these numbers with its side, and the same rows appear on the 2003, 2004 and 2005 G500 pages.',need:'The diagram is unscaled. Frame outlines, pivot and lock positions, strut angle and spring size are schematic and need measuring on a car.',source:rearSeatPlate},
  {ids:ids(rearBack),kind:'diagram',fact:'The 2002 G500 rear seat diagram lists the backrest covers, back panels, housing, edge guard, handle, hinge cover, cap, release lever, lever cover and both backrest adjusters, with side and location notes.',need:'The diagram does not say exactly where the housing and caps sit or what the 868-group housing guides. All positions are schematic.',source:rearSeatPlate},
  {ids:ids(consoleParts,from(consolePlate)),kind:'diagram',fact:'The related-parts list for trim plate 463-683-02-30 (2002–2003 G500, ref 11) gives the compartment, cup holder, tray, parking brake cover, rear cover, side cover and switch panel from the same console diagram.',need:'The page gives the diagram neighbours without their reference numbers, so where each piece sits and how big it is are schematic. Check each number’s fitment against the VIN.',source:consolePlate},
  {ids:ids(consoleParts,from(consoleReinforcementPage)),kind:'diagram',fact:'Trim plate reinforcement 463-683-04-25 is ref 12 on the 2002–2003 G500 console diagram.',need:'Its outline and fixing points are not shown; the plate is drawn as a flat stiffener.',source:consoleReinforcementPage},
  {ids:ids(consoleParts,from(ashtrayList)),kind:'diagram',fact:'The G500 ashtray listing gives 463-810-02-30 (replacing 463-810-00-30) for the 2002–2003 and 2006–2008 G500.',need:'The listing does not show where the ashtray mounts; its position at the front of the console is assumed.',source:ashtrayList},
  {ids:ids(pillarTrim,from(pillarList)),kind:'diagram',fact:'The G500 pillar trim listing gives these windshield, center and rear pillar trims by side, with 2002–2003 fitment for the windshield pillars and 2002–2005 for the center and rear pillars.',need:'The listing has no drawing. Pillar trim sections and lengths are schematic; the trim colour suffix needs the car’s interior code.',source:pillarList},
  {ids:ids(pillarTrim,from(pillarPlate)),kind:'diagram',fact:'The related-parts list for center pillar trim 463-690-06-40 (2002–2005 G500, ref 3) gives the windshield pillar lower cover, the footwell (cowl) trim and the two sill retainer plates from the same pillar diagram.',need:'The page does not give sides or positions for these pieces; they are drawn on the driver side as an assumption.',source:pillarPlate},
  {ids:ids(cargo,from(cargoNetPlate)),kind:'diagram',fact:'Cargo net 463-860-00-74 is ref 20 on the 2002–2003 G500 cargo-area diagram. Its related-parts list gives the net bracket, bushing, spacer, support, strap, tie plate, mat bracket and vent grille from the same diagram.',need:'The related list has no reference numbers or positions, so the layout is schematic. Check each related number’s fitment against the VIN.',source:cargoNetPlate},
  {ids:ids(cargo,from(wheelhouseList)),kind:'diagram',fact:'The G500 wheelhouse listing gives wheelhouse trim 463-680-13-42 (driver) and 463-680-28-46 (passenger) for 2002–2005.',need:'The trim shape over each wheelhouse is schematic and needs measuring.',source:wheelhouseList}
];
