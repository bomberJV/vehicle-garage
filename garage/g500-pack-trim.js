// G500 study pack: trim.
// Cabin air ducts, steering-wheel and column trim, lower dash covers, sill and quarter trim,
// the cargo-door trim, the front-seat adjuster trim and the fuel tank and pump fittings.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// 2003 G500 catalog diagram that lists it. Where a part came in gray and black, the name gives
// the base number and the description names the color suffixes.
//
// Parts the register already models are left out: the steering wheel, airbags and clockspring,
// the column cover 463-680-14-08, the ignition switch, the seat tracks and seat controllers,
// the fuel sender, tank pressure sensor and tank itself, the cargo net and the door handles.
// Standard screws, nuts and clips are left out. Geometry is schematic, in study-local coordinates.
import {metal,steel,dark,cyl,sleeve,turn,part,study,x,y,z} from './mechanism-shapes.js';

const giant=year=>'https://www.mbpartsgiant.com/parts-list/'+year+'-mercedes_benz-g500/';
const page=(label,path,year=2002,note='')=>({label:'MB Parts Giant · '+year+' G500 '+label+' diagram'+(note&&', '+note),url:giant(year)+path});
const unread='a later-year plate; the 2002 G500 plate could not be retrieved, so 2002 fitment of ';
const plates={
  ducts:page('ducts','body-hardware/ducts',2002,'which does not list footwell ducts 463-831-80-45 and 463-831-79-45, so their 2002 fitment is unconfirmed'),
  dashLower:page('ignition lock and lower dash','steering/ignition-lock-steering',2003,'a later-year plate; the 2002 G500 lock cylinder listing gives cylinder 210-689-00-01 2002 G500 fitment, and the 2002 G500 plate could not be retrieved, so 2002 fitment of the center covers, trim cover and ashtray cover is unconfirmed'),
  wheel:page('steering wheel','steering/steering-wheel',2003,'a later-year plate; the G500 steering column cover listing gives shroud 000-462-17-23-9B51 2002–2005 G500 fitment'),
  wheelTrim:page('steering wheel and trim','steering/steering-wheel-trim',2003,'a later-year plate; the part pages give ring 463-461-00-65, lock sensor 002-542-19-18 and horn button 463-821-01-51 2002–2003 G500 fitment'),
  column:page('steering column assembly','steering/steering-column-assembly',2003,'a later-year plate; the G500 steering column cover listing gives upper cover 203-462-07-23-9B51 2002–2003 and lower cover 203-460-01-95-9B51 2002–2005 G500 fitment'),
  pillars:page('pillar interior trim','interior-exterior-trim/interior-trim-pillars',2003,unread+'the sill covers, scuff plates, pillar trim plate and cowl side trim is unconfirmed'),
  quarters:page('quarter panel interior trim','interior-exterior-trim/interior-trim-quarter-panels',2003,unread+'the upper and lower quarter trims and the seat-belt trim is unconfirmed'),
  backDoor:page('back door interior trim','interior-exterior-trim/interior-trim-back-door',2003,unread+'the trim panel, bracket, window trims, pull handle and handle covers is unconfirmed'),
  tracks:page('seat tracks and components','body-hardware/tracks-components'),
  fuel:page('fuel supply','air-fuel-delivery/fuel-supply')
};
export const trimPackPlates=plates;

const rubber='#26292b',plastic='#3a3f42',black='#1f2324',gray='#6d7173',duct='#4b5054',felt='#4a4740',zinc='#b3b9b1',brushed='#c9cdcf';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,a,b,rad,color,n=10)=>{const d=b.map((v,i)=>v-a[i]),l=Math.hypot(...d);cyl(r,a,d,0,l,rad,color,n);};
const path=(r,pts,rad,color)=>{for(let i=1;i<pts.length;i++)tube(r,pts[i-1],pts[i],rad,color,10);};
const sides=[-1,1];
const withSource=(p,source)=>({...p,source});

// Cabin air ducts: defrost, side vents, footwell and rear ducts fed from the air distributor.
const ducts=study('g500-cabin-ducts','Cabin air ducts',
  'The air distributor on the heater box splits the flow. Defroster ducts run up to the windshield and door glass, side ducts feed the dash vents, and floor, footwell and rear ducts run down and back to the footwells and rear seat.',plates.ducts,[
  part('distributor','Air distributor · 463-830-03-43','The distributor on the outlet of the heater box that feeds the ducts.',[0,0,.1],r=>{block(r,[0,0,.1],[.35,.22,.18],duct);}),
  part('defrost','Windshield defroster duct, right / left · 463-830-02-55 / 463-830-05-55','The ducts that carry air up to the windshield outlets.',[0,-.2,.5],r=>{for(const s of sides){block(r,[s*.3,-.05,.42],[.45,.12,.04],duct);block(r,[s*.12,-.02,.28],[.08,.08,.25],duct);}}),
  part('glass-defrost','Door-glass defroster duct · 463-831-77-45','The duct that carries air to the side-window defroster outlets, the same part on both sides.',[0,.35,.55],r=>{for(const s of sides)path(r,[[s*.5,-.05,.42],[s*.75,-.05,.45],[s*.85,.05,.47]],.03,duct);}),
  part('defrost-connector','Defroster duct connector, right / left · 463-831-02-57 / 463-831-01-57','The connector between each defroster duct and its outlet.',[0,-.45,.35],r=>{for(const s of sides)sleeve(r,[s*.55,-.05,.44],y,-.06,.06,.035,.025,black,12);}),
  part('adapter','Side vent adapter · 463-831-20-60-64','The adapter between a side duct and its dash vent, the same part on both sides.',[0,.45,.25],r=>{for(const s of sides)block(r,[s*.9,0,.25],[.06,.1,.08],black);}),
  part('vent-insert','Side vent insert · 163-689-00-79','The insert in each side dash vent.',[0,.55,.35],r=>{for(const s of sides)block(r,[s*.96,0,.25],[.02,.09,.07],gray);}),
  part('vent-nozzle','Side vent nozzle · 163-689-00-11','The adjustable nozzle in each side dash vent.',[0,.6,.15],r=>{for(const s of sides)cyl(r,[s*.99,0,.25],x,0,.03*s,.035,dark,14);}),
  part('outer-ducts','Outer duct, right / left · 463-831-70-45 / 463-831-73-45','The ducts from the distributor out to the side vents.',[0,-.35,.15],r=>{for(const s of sides)path(r,[[s*.18,0,.15],[s*.5,0,.2],[s*.87,0,.25]],.04,duct);}),
  part('inner-ducts','Inner duct, right / left · 463-831-68-45 / 463-831-67-45','The ducts from the distributor to the inner dash vents.',[0,.3,.0],r=>{for(const s of sides)path(r,[[s*.1,.05,.18],[s*.22,.08,.26]],.035,duct);}),
  part('center-duct','Center duct · 463-831-76-45','The duct to the center dash vents.',[0,-.1,.35],r=>block(r,[0,.05,.26],[.18,.1,.08],duct)),
  part('lower-ducts','Lower duct, right / left · 463-831-66-45 / 463-831-97-45','The ducts from the bottom of the distributor down toward the footwells.',[0,-.3,-.3],r=>{for(const s of sides)path(r,[[s*.12,0,0],[s*.25,0,-.2],[s*.35,.05,-.32]],.04,duct);}),
  part('footwell','Footwell duct, right / left · 463-831-80-45 / 463-831-79-45','The footwell outlets at the end of the lower ducts. The ignition lock and lower dash diagram lists them.',[0,.4,-.45],r=>{for(const s of sides)block(r,[s*.4,.08,-.36],[.14,.1,.04],duct);}),
  part('floor-duct','Floor duct · 463-831-74-45','The duct along the tunnel that feeds the rear footwells.',[.35,0,-.4],r=>block(r,[.35,0,-.3],[.5,.12,.05],duct)),
  part('connector','Duct connector · 463-831-75-45','The connector between the floor duct and the rear duct.',[.5,.25,-.3],r=>sleeve(r,[.62,0,-.3],x,-.03,.03,.06,.045,black,14)),
  part('extension','Duct extension · 463-831-15-60','The extension listed with the side and floor ducts, the same part on both sides.',[.5,-.3,-.35],r=>{for(const s of sides)block(r,[.75,s*.15,-.3],[.12,.06,.04],duct);}),
  part('rear-duct','Rear duct · 463-831-69-45','The duct under the front seats to the rear footwell outlets.',[.7,0,-.45],r=>block(r,[.95,0,-.3],[.5,.1,.04],duct)),
  part('vent-grille','Vent grille · 210-830-14-54','The grille listed at the end of the duct run. The suffix gives its color.',[.85,.3,-.2],r=>{block(r,[1.22,0,-.27],[.02,.14,.08],black);for(let i=-2;i<=2;i++)block(r,[1.23,i*.025,-.27],[.01,.006,.07],gray);})
]);
ducts.viewAngle=[-.5,.4];

// Steering wheel and column trim around the airbag and column switches.
const steering=study('g500-steering-trim','Steering wheel and column trim',
  'A trim ring and horn button sit on the wheel around the airbag. A lock sensor is listed with them. Upper and lower covers and a shroud close the column behind the wheel.',plates.wheelTrim,[
  part('ring','Steering wheel trim ring · 463-461-00-65','The trim ring on the steering wheel hub.',[0,0,.3],r=>turn(r,[0,0,0],z,[[.02,.1],[.02,.13],[.035,.13],[.035,.1],[.02,.1]],brushed,{n:28})),
  part('horn-button','Horn button assembly · 463-821-01-51','The horn button on the steering wheel.',[.3,.2,.35],r=>block(r,[.12,.0,.03],[.05,.05,.02],black)),
  part('lock-sensor','Steering lock sensor · 002-542-19-18','The sensor the steering wheel and trim diagram lists as a lock sensor.',[-.3,-.25,.1],r=>{block(r,[0,-.1,-.08],[.06,.04,.04],black);cyl(r,[0,-.1,-.05],z,0,.02,.012,metal,10);}),
  withSource(part('upper-cover','Steering column cover, upper · 203-462-07-23','The upper cover over the steering column behind the wheel. The catalog lists it in 9B51 color.',[0,-.4,.25],r=>block(r,[0,0,-.18],[.12,.2,.03],plastic)),plates.column),
  withSource(part('lower-cover','Steering column cover, lower · 203-460-01-95','The lower cover under the steering column. The steering wheel diagram lists the same part.',[0,.4,-.25],r=>block(r,[0,0,-.27],[.14,.2,.06],plastic)),plates.column),
  withSource(part('shroud','Steering column shroud · 000-462-17-23','The shroud around the column, listed for the G500 and G55 AMG.',[.35,-.4,-.15],r=>sleeve(r,[0,0,-.22],x,-.15,.15,.08,.06,plastic,16)),plates.wheel)
]);
steering.viewAngle=[-.4,.3];

// Lower dash: the center covers, trim cover, ashtray cover and lock cylinder.
const dashLower=study('g500-lower-dash-trim','Lower dash trim',
  'Below the instrument panel the lower dash is closed by left and right center covers and a trim cover. An ashtray cover and a lock cylinder are listed on the same diagram.',plates.dashLower,[
  part('center-covers','Center cover, left / right · 463-680-17-08 / 463-680-18-08','The covers on each side of the lower center dash. They came in black (7088) and gray (7144).',[0,-.4,0],r=>{for(const s of sides)block(r,[s*.2,0,0],[.3,.03,.25],plastic);}),
  part('trim-cover','Lower dash trim cover · 463-680-03-82','The trim cover listed with the center covers.',[0,.35,.2],r=>block(r,[0,.03,.18],[.3,.02,.06],plastic)),
  part('ashtray-cover','Ashtray cover · 463-680-08-17','The cover over the ashtray in the dash.',[.35,.35,.3],r=>block(r,[0,-.02,.32],[.16,.01,.07],black)),
  part('lock-cylinder','Lock cylinder · 210-689-00-01','The lock cylinder listed on the ignition lock and lower dash diagram.',[-.35,.3,.3],r=>{cyl(r,[-.35,0,.3],y,-.04,0,.016,brushed,14);block(r,[-.35,.002,.3],[.004,.01,.016],dark);})
]);
dashLower.viewAngle=[-.3,.2];

// Sills, scuff plates and the trim on the pillars and rear quarters.
const sills=study('g500-sill-quarter-trim','Sill, pillar and quarter trim',
  'Sill covers line the front and rear door openings with G500 scuff plates on top. Trim covers the cowl sides, the pillars and the rear quarters around the belt.',plates.pillars,[
  part('front-sill','Front sill cover, left / right · 463-686-15-36 / 463-686-16-36','The sill cover in each front door opening. It came in gray (7101) and black (9051).',[-.4,-.3,-.25],r=>{for(const s of sides)block(r,[-.4,s*.72,-.3],[.6,.08,.04],plastic);}),
  part('rear-sill','Rear sill cover, left / right · 463-686-17-36 / 463-686-18-36','The sill cover in each rear door opening, in gray (7101) or black (9051).',[.3,-.3,-.25],r=>{for(const s of sides)block(r,[.35,s*.72,-.3],[.55,.08,.04],plastic);}),
  part('front-scuff','G500 front scuff plate, left / right · 463-686-29-36 / 463-686-28-36','The G500 scuff plate on each front sill.',[-.4,-.5,-.1],r=>{for(const s of sides)block(r,[-.4,s*.74,-.275],[.5,.05,.008],brushed);}),
  part('rear-scuff','G500 rear scuff plate, left / right · 463-686-78-36 / 463-686-77-36','The G500 scuff plate on each rear sill, listed in black (9051).',[.3,-.5,-.1],r=>{for(const s of sides)block(r,[.35,s*.74,-.275],[.45,.05,.008],brushed);}),
  part('trim-plate','Pillar trim plate · 463-821-02-59','The trim plate on the pillar, the same on both sides. It came in gray (7101) and black (9051).',[0,.4,.3],r=>{for(const s of sides)block(r,[0,s*.7,.3],[.08,.02,.12],plastic);}),
  part('cowl-trim','Cowl side trim, passenger · 463-684-06-02','The trim on the passenger cowl side below the dash. It came in black (7088) and gray (7144).',[-.7,.4,0],r=>block(r,[-.85,.68,-.1],[.2,.02,.3],plastic)),
  withSource(part('upper-quarter','Upper quarter trim, left / right · 463-690-02-40 / 463-690-03-40','The upper trim on each rear quarter beside the cargo area, in gray (7095) or black (9045).',[.7,-.4,.35],r=>{for(const s of sides)block(r,[.9,s*.7,.3],[.5,.02,.25],plastic);}),plates.quarters),
  withSource(part('lower-quarter','Lower quarter trim, left / right · 463-692-34-01 / 463-692-35-01','The lower trim on each rear quarter, in gray (7095) or black (9045).',[.7,-.45,-.1],r=>{for(const s of sides)block(r,[.9,s*.7,-.05],[.5,.02,.3],plastic);}),plates.quarters),
  withSource(part('belt-trim','Seat-belt trim · 463-692-04-59','The trim where the rear seat belt passes through the quarter trim, in gray (7101) or black (9051).',[.6,.45,.45],r=>{for(const s of sides)block(r,[.7,s*.69,.45],[.08,.02,.04],black);}),plates.quarters)
]);
sills.viewAngle=[-.55,.35];

// Cargo door inside: the trim panel, window trims and pull handle.
const cargoTrim=study('g500-cargo-door-trim','Cargo door trim',
  'The inside of the cargo door is covered by a trim panel on a bracket. Three trims frame the window, and a pull handle with end covers sits below it.',plates.backDoor,[
  part('trim-panel','Cargo door trim panel · 463-740-23-70','The trim panel on the inside of the cargo door, black and gray (9A84). Designo versions have their own numbers.',[0,-.3,0],r=>block(r,[0,0,-.2],[.9,.025,.7],plastic)),
  part('bracket','Trim panel bracket · 463-720-01-14','The bracket that holds the trim panel to the door.',[0,.3,-.3],r=>block(r,[0,.03,-.35],[.3,.02,.05],zinc)),
  part('window-trim-sides','Window trim, left / right · 463-747-01-71 / 463-747-02-71','The outer trims at each side of the cargo door window, in gray (7101) or black (9051).',[0,-.35,.45],r=>{for(const s of sides)block(r,[s*.4,0,.4],[.08,.025,.45],plastic);}),
  part('window-trim-center','Window trim, center · 463-747-03-71','The trim across the bottom of the cargo door window, in gray (7101) or black (9051).',[0,-.45,.25],r=>block(r,[0,0,.17],[.75,.025,.06],plastic)),
  part('pull-handle','Pull handle · 463-743-00-72','The pull handle on the cargo door trim, in gray (7101) or black (9051).',[0,.45,.15],r=>{block(r,[0,-.04,.05],[.4,.03,.04],black);for(const s of sides)block(r,[s*.18,-.02,.05],[.04,.03,.04],black);}),
  part('handle-covers','Pull handle cover, left / right · 463-743-01-30 / 463-743-02-30','The end covers at each end of the pull handle, in gray (7101) or black (9051).',[.4,.4,.25],r=>{for(const s of sides)block(r,[s*.22,-.045,.05],[.04,.02,.05],plastic);})
]);
cargoTrim.viewAngle=[-.3,.2];

// Front seat adjuster trim and fittings.
const seatTrim=study('g500-seat-adjuster-trim','Front seat adjuster trim',
  'Covers close the recline pivots on the outer, inner and rear faces of each front seat, with an adjuster knob. A spring, stop, support, bracket and strap are listed with the seat tracks.',plates.tracks,[
  part('outer-cover','Outer recline cover, left / right · 203-918-17-30 / 203-918-18-30','The cover over the recline pivot on the door side of each seat, in gray or black (9051).',[0,-.4,.2],r=>{for(const s of sides)block(r,[0,s*.3,.1],[.25,.02,.15],plastic);}),
  part('inner-cover','Inner recline cover, left / right · 203-918-01-30 / 203-918-02-30','The cover over the recline pivot on the tunnel side, in gray (7101) or black (9051).',[0,.4,.2],r=>{for(const s of sides)block(r,[0,s*.18,.1],[.2,.02,.12],plastic);}),
  part('rear-cover','Rear recline cover, left / right · 203-918-39-30 / 203-918-40-30','The cover on the back of the recline mechanism, in gray (7101) or black (9051).',[.4,0,.3],r=>{for(const s of sides)block(r,[.15,s*.24,.12],[.02,.1,.1],plastic);}),
  part('knob','Adjuster knob, right / left · 203-918-33-30 / 203-918-34-30','The knob on the seat side cover, in gray (7101) or black (9051).',[-.3,-.5,.3],r=>{for(const s of sides)cyl(r,[0,s*.32,.12],y,0,s*.03,.025,black,12);}),
  part('spring','Seat spring · 463-919-01-37','The spring listed with the seat tracks, the same on both seats.',[-.35,.3,-.2],r=>{for(let i=0;i<5;i++)sleeve(r,[-.15+i*.025,0,-.05],x,0,.012,.015,.011,metal,10);}),
  part('stop','Track stop · 203-919-01-21','The stop at the end of the seat track, the same on both seats.',[.35,-.3,-.25],r=>{for(const s of sides)block(r,[.25,s*.25,-.08],[.03,.03,.03],rubber);}),
  part('support','Seat support · 463-860-04-14','The support listed with the seat tracks.',[.2,.45,-.35],r=>block(r,[.1,0,-.1],[.06,.3,.03],steel)),
  part('bracket','Seat bracket · 000-866-02-14','The bracket listed with the seat support.',[-.15,-.45,-.35],r=>block(r,[-.1,-.2,-.1],[.06,.05,.05],steel)),
  part('strap','Seat strap · 000-866-05-71','The strap listed with the seat support and bracket.',[-.45,.0,-.45],r=>block(r,[-.2,0,-.13],[.25,.03,.006],black))
]);
seatTrim.viewAngle=[-.5,.3];

// Fuel tank mounting, filler and pump fittings.
const fuel=study('g500-tank-pump-fittings','Fuel tank mounting, filler and pump',
  'The tank hangs from a strap on insulators with a shield below and a support at the front. The filler neck runs to the fuel door with a seal and cap. The pump assembly sits in an insulator beside the fuel filter.',plates.fuel,[
  part('strap','Fuel tank strap · 463-470-03-40','The steel strap that holds the tank up to the frame.',[0,-.4,-.35],r=>{block(r,[0,-.25,-.25],[.04,.02,.4],steel);block(r,[0,-.25,-.45],[.6,.02,.04],steel);}),
  part('insulators','Strap insulator, left / right · 463-470-02-85 / 463-470-03-85','The rubber strips between the strap and the tank.',[0,.4,-.4],r=>{for(const s of sides)block(r,[s*.25,-.22,-.42],[.15,.02,.02],rubber);}),
  part('shield','Fuel tank shield · 463-471-00-87-64','The shield under the tank.',[0,0,-.6],r=>block(r,[0,0,-.5],[.7,.5,.012],zinc)),
  part('support','Fuel tank support · 169-470-00-29','The support listed at the front of the tank. The number is superseded by 169-470-00-29-64.',[-.45,.3,-.2],r=>block(r,[-.38,0,-.3],[.04,.2,.1],steel)),
  part('filler-neck','Filler neck · 463-470-08-20','The pipe from the fuel door down to the tank.',[.4,-.2,.4],r=>path(r,[[.25,0,-.1],[.38,0,.15],[.42,0,.35]],.03,steel)),
  part('neck-seal','Filler neck seal · 123-997-35-81','The seal where the filler neck passes through the body.',[.55,.3,.45],r=>sleeve(r,[.42,0,.32],z,-.01,.01,.06,.035,rubber,16)),
  part('caps','Fuel filler cap · 221-470-06-05 / 168-470-04-05','The filler cap. The first number is listed up to chassis 1344227, the second from chassis 1344228.',[.65,0,.6],r=>{cyl(r,[.42,0,.37],z,0,.03,.045,black,18);block(r,[.42,0,.405],[.06,.012,.01],black);}),
  part('pump','Fuel pump assembly · 000-470-78-94-80','The electric fuel pump assembly.',[-.4,-.45,.25],r=>{cyl(r,[-.15,.3,.0],x,-.1,.1,.035,metal,16);cyl(r,[-.27,.3,0],x,-.02,0,.02,dark,12);}),
  part('pump-insulator','Fuel pump insulator · 463-478-00-82','The rubber sleeve that holds the pump and damps its noise.',[-.4,.45,.35],r=>sleeve(r,[-.15,.3,0],x,-.06,.06,.045,.036,rubber,16)),
  part('filter','Fuel filter · 002-477-30-01','The in-line fuel filter beside the pump. The number is superseded by 002-477-30-01-64.',[.1,.5,.3],r=>{cyl(r,[.12,.3,0],x,-.08,.08,.04,metal,16);cyl(r,[.2,.3,0],x,0,.03,.008,steel,8);})
]);
fuel.viewAngle=[-.5,.3];

export const studies=[ducts,steering,dashLower,sills,cargoTrim,seatTrim,fuel];
export const views=new Map([
  ['hvac.demist',ducts],['hvac.footwell',ducts],['hvac.face-ducts',ducts],
  ['body.steering-wheel',steering],
  ['body.lower-cover-left',dashLower],['body.lower-cover-right',dashLower],
  ['floor.sills',sills],
  ['closure-g500.pressing',cargoTrim],
  ['g500-front-seat.trim',seatTrim],
  ['g500-fuel-tank.straps',fuel],['g500-fuel-tank.sleeves',fuel],['g500-fuel-tank.shield',fuel],['g500-fuel-delivery.filter',fuel],['g500-fuel-delivery.cushion',fuel]
]);

const notes={
  'g500-cabin-ducts':{fact:'The 2002 G500 ducts diagram lists the air distributor, the defroster, side, floor, center and rear ducts, their connectors, the side vent insert and nozzle and the vent grille. The 2003 G500 ignition lock and lower dash diagram lists the two footwell ducts.',need:'Duct routing and sections are schematic. Trace them behind the dash and under the front seats.'},
  'g500-steering-trim':{fact:'The 2003 G500 steering wheel and trim diagram lists the trim ring, lock sensor and horn button. The steering column assembly diagram lists the upper and lower column covers, and the steering wheel diagram lists the shroud.',need:'Cover outlines and the sensor position are estimated. The lower cover 203-460-01-95 is superseded by 203-460-01-95-9051.'},
  'g500-lower-dash-trim':{fact:'The 2003 G500 ignition lock and lower dash diagram lists the center covers, the trim cover, the ashtray cover and the lock cylinder.',need:'The diagram does not say which lock the cylinder serves. Confirm on the truck. Cover outlines are schematic.'},
  'g500-sill-quarter-trim':{fact:'The 2003 G500 pillar interior trim diagram lists the sill covers, the G500 scuff plates, the pillar trim plate and the passenger cowl trim. The quarter panel interior trim diagram lists the upper and lower quarter trims and the seat-belt trim.',need:'Trim outlines are schematic. Confirm the color suffix of each part for a given interior.'},
  'g500-cargo-door-trim':{fact:'The 2003 G500 back door interior trim diagram lists the trim panel, its bracket, the three window trims, the pull handle and its covers.',need:'Panel outline and handle position are schematic. Designo interiors use other trim panel numbers.'},
  'g500-seat-adjuster-trim':{fact:'The 2002 G500 seat tracks and components diagram lists the outer, inner and rear recline covers, the knobs, the spring, stop, support, bracket and strap.',need:'The diagram does not say where the spring, support, bracket and strap sit on the seat. Positions are estimated.'},
  'g500-tank-pump-fittings':{fact:'The 2002 G500 fuel supply diagram lists the tank strap and insulators, the shield, the support, the filler neck and seal, the two filler caps by chassis range, the pump assembly and insulator and the fuel filter.',need:'Strap, neck and pump positions are schematic. Check which filler cap fits by chassis number.'}
};
export const claims=studies.flatMap(s=>{
  const bySource=new Map();
  for(const p of s.groups[0].parts){const src=p.source||s.source;if(!bySource.has(src))bySource.set(src,[]);bySource.get(src).push(p.id);}
  return [...bySource].map(([source,ids])=>({ids,kind:'diagram',fact:notes[s.id].fact,need:notes[s.id].need,source}));
});
