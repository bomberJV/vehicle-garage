// 992 fit pack: climate. Installed parts drawn onto the car.
// Scope: Climate and fluids: coolant expansion tank and cap, radiator fans, cabin air filter, air-distribution ducts and vents, HVAC flap motors, AC pressure and temperature sensors, brake-fluid reservoir if separate from brakes.master, front-compartment fluid fillers. p992-hvac.* and p992-coolant.* already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-climate' or 'p992-fit-climate-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// Positions follow the parts already drawn: the corner radiators (engine.cooling)
// and condensers (p992-hvac) in the front bumper, the heater lines (p992-coolant)
// rising at the toe board, the climate unit behind the dash, and the coolant
// distributor on the right of the engine. The brake-fluid reservoir is part of
// brakes.master, so it is not fitted again here.
import {pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,x,y,z} from './mechanism-shapes.js';

const page=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const tankSrc=page('105-100','Coolant expansion tank','https://www.eurospares.co.uk/Porsche/992/2022_(992-1)/PartDiagrams/105-100/Coolant_expansion_tank');
const radSrc=page('105-200','Front radiators and fans','https://www.eurospares.co.uk/Porsche/992/2019/PartDiagrams/105-200/RADIATOR');
const frontSrc=page('105-300','Coolant system, front end','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/105-300/WATER_COOLING');
const heaterSrc=page('105-500','Coolant system, heater','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/105-500/WATER_COOLING');
const unitSrc=page('814-001','Air conditioner unit: cabin filter, expansion valve and sensors','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/814-001/AIR_CONDITIONER');
const ductSrc=page('814-100','Dashboard air ducts and footwell vents','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/814-100/AIR_CONDITIONER');
const condSrc=page('814-300','A/C condenser and air guide housing','https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/814-300/AIR_CONDTIONER_CONDENSER');
const drierSrc=page('814-701','Receiver-drier, line brackets and A/C pressure sensor','https://eurospares.co.uk/Porsche/992-1/2019/PartDiagrams/814-701/AIR_CONDITIONER');

const black='#25292b',plastic='#3e474a',rubber='#30383c',metal='#8f9a9c',tankWhite='#c4c2b4',ductGrey='#2f3537',filterMedia='#d6cfb6';
const left=[0,-.30,.06],right=[0,.30,.06],up=[0,0,.30],down=[0,0,-.25],fore=[-.30,0,.06],aft=[.30,0,.08];
const side=s=>s<0?left:right;
const sides=[[-1,'left','Left'],[1,'right','Right']];
const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(sub,name,description,source,parts)=>({id:'p992-fit-climate-'+sub,name,description,source,view:'hero',internal:true,category:'service',
  parts:parts.map(p=>({...p,id:'p992-fit-climate-'+sub+'.'+p.id}))});
const hose=(r,pts,rad,col)=>pipe(r,pts,rad,col,6);

// ---------------------------------------------------------------- coolant
// Expansion tank on the right of the engine compartment, under the engine lid,
// above the right turbocharger and the A/C lines and ahead of the right airbox.
const tank=[1.555,.45,.845],neck=[1.50,.45,.90];
// Bleed valve on its bracket at the front face of the tank, where the radiator
// breather line arrives from the front.
const bleed=[1.437,.49,.83];
// Coolant distributor top (p992-coolant.distributor box, top face z 0.69).
const distributorTop=[1.40,.41,.69];
// Front corner radiators (engine.cooling): x -1.870..-1.800, |y| 0.494..0.726, z 0.32..0.512.
const fanCentre=s=>[-1.789,s*.61,.415];
const ventTop=s=>[-1.835,s*.53,.513];
const breatherJoin=s=>[-1.62,s*.34,.43];
// Heater lines (p992-coolant.heater-feed) rise vertically at the toe board:
// the supply at y 0.26, the return at y -0.13, both at x -0.836.
const supplyRiser=[-.836,.26,.63],returnRiser=[-.836,-.13,.66];

function fan(r,s){
  const c=fanCentre(s);
  // Shroud carrier bolted behind the radiator core, with the fan ring and hub motor.
  box(r,c,[.012,.12,.15],black);
  cyl(r,plus(c,[.006,0,0]),x,0,.010,.066,plastic,16);
  cyl(r,plus(c,[.016,0,0]),x,0,.040,.034,'#3a3f42',12);
  for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
    const tip=[c[0]+.012,c[1]+.064*Math.cos(a),c[2]+.064*Math.sin(a)];
    hose(r,[plus(c,[.012,0,0]),tip],.004,black);
  }
}
function radiatorGuide(r,s){
  // Plastic frame closing the gap between the condenser and the radiator core,
  // so that air from the bumper intake passes through both cores.
  const xc=-1.882,dx=.018,yc=s*.61;
  box(r,[xc,yc,.520],[dx,.30,.008],plastic);
  box(r,[xc,yc,.310],[dx,.30,.008],plastic);
  box(r,[xc,s*.760,.415],[dx,.008,.218],plastic);
  box(r,[xc,s*.460,.415],[dx,.008,.218],plastic);
}
function tankBody(r){
  box(r,tank,[.19,.15,.11],tankWhite);
  // Level marks moulded into the outboard face.
  for(const h of [-.02,.02])box(r,[tank[0]+.03,tank[1]+.076,tank[2]+h],[.05,.002,.004],'#7d7b70');
  cyl(r,neck,z,-.002,.025,.028,tankWhite,14);
}

const coolant=group('coolant','Coolant expansion, radiator fans and bleed lines',
  'The expansion tank under the engine lid holds the reserve and sets system pressure through its cap. Breather lines carry air from the tops of the front radiators back to it. An electric fan behind the radiator pulls air through the core at low speed, and an electric auxiliary pump and shut-off valve manage the heater circuit.',tankSrc,[
  part('expansion-tank','Coolant expansion tank with level gauge and bleed valve · 992121402B','The translucent tank on the right of the engine compartment shows the coolant level and collects air bled from the circuit.',up,tankSrc,tankBody),
  part('tank-cap','Expansion tank cap · 9P1121321A','The pressure cap closes the filler neck on top of the tank, reached from under the engine lid.',up,tankSrc,r=>{
    cyl(r,neck,z,.025,.050,.036,black,16);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(r,[neck[0]+.03*Math.cos(a),neck[1]+.03*Math.sin(a),neck[2]+.040],[.010,.010,.012],black);}
  }),
  part('tank-hose','Expansion tank coolant hose · 992121637','This hose feeds coolant from the bottom of the tank down to the engine coolant distributor.',aft,tankSrc,r=>{
    hose(r,[[1.49,.40,.792],[1.45,.405,.75],[1.41,.41,.715],distributorTop],.009,rubber);
  }),
  part('bleed-valve','Bleed valve · 7P5121671A','The bleed valve on the front of the tank lets air out where the long radiator breather line arrives.',fore,tankSrc,r=>{
    cyl(r,bleed,x,-.016,.017,.010,'#4a5254',10);cyl(r,bleed,z,.008,.022,.006,black,8);
  }),
  part('bleed-bracket','Bleed valve bracket · 992121521','A small bracket holds the bleed valve against the front face of the tank.',down,tankSrc,r=>{
    box(r,[bleed[0]+.003,bleed[1],bleed[2]-.0135],[.036,.030,.004],metal);
  }),
  part('fan-left','Left radiator fan 650 W with carrier · 992959447J','The electric fan and its shroud carrier sit behind the left radiator and pull air through the core when the car is slow or stationary.',left,radSrc,r=>fan(r,-1)),
  ...sides.map(([s,hand,Hand])=>part('radiator-guide-'+hand,`Radiator air guide, ${hand} · ${s<0?'992121333':'992121334'}`,`${Hand} plastic frame between the condenser and the radiator, so the bumper intake air passes through both cores.`,side(s),radSrc,r=>radiatorGuide(r,s))),
  ...sides.map(([s,hand,Hand])=>part('breather-'+hand,`Radiator breather line, ${hand} · ${s<0?'992121465':'992121466'}`,`Thin line from the top of the ${hand} radiator that carries trapped air inboard to the front breather lines.`,side(s),radSrc,r=>{
    const v=ventTop(s);hose(r,[v,plus(v,[0,0,.017]),[-1.74,s*.45,.53],[-1.66,s*.36,.47],breatherJoin(s)],.004,rubber);
  })),
  part('breather-front','Coolant breather line · 992121455B','The front breather line joins the vent lines of the two corner radiators across the nose.',fore,frontSrc,r=>{
    hose(r,[breatherJoin(-1),[-1.60,-.25,.42],[-1.60,.25,.42],breatherJoin(1)],.004,rubber);
  }),
  part('breather-long','Coolant breather line · 992121456A','The long breather line carries air from the front radiators beneath the floor and up the right of the engine compartment to the bleed valve on the expansion tank.',down,frontSrc,r=>{
    hose(r,[breatherJoin(1),[-1.52,.345,.33],[-1.40,.345,.29],[.80,.345,.29],[.95,.43,.31],[1.13,.43,.44],[1.15,.43,.62],[1.30,.43,.72],[1.40,.48,.81],plus(bleed,[-.016,0,0])],.004,rubber);
  }),
  part('temp-sensor','Coolant temperature sensor · 95860662320','A sensor screwed into the front return pipe reports the coolant temperature leaving the radiators.',down,frontSrc,r=>{
    const c=[-1.45,-.27,.262];cyl(r,c,z,0,.028,.008,metal,8);box(r,plus(c,[0,0,.038]),[.022,.016,.016],black);
  }),
  part('shutoff-valve','Coolant shut-off valve · 9P1317233A','The electric valve in the heater supply line closes the flow to the heater matrix when no cabin heat is wanted.',fore,heaterSrc,r=>{
    box(r,supplyRiser,[.036,.036,.050],black);box(r,plus(supplyRiser,[-.030,0,.006]),[.026,.030,.030],plastic);
  }),
  part('aux-pump','Auxiliary coolant pump · 9A712160110','The electric auxiliary pump in the heater return keeps coolant moving through the heater matrix when the engine pump runs slowly.',fore,heaterSrc,r=>{
    cyl(r,returnRiser,z,-.034,.030,.024,'#41494c',12);cyl(r,returnRiser,z,.030,.040,.018,black,12);box(r,plus(returnRiser,[-.030,0,-.010]),[.020,.022,.026],black);
  })
]);

// -------------------------------------------------------------------- A/C
// The bumper skin ahead of each condenser runs from x -2.10 at |y| 0.44 back to
// x -1.94 at |y| 0.76, where the condenser edge meets it; the guide fills the
// space between, open toward the intake and closed above, below and inboard.
const skinX=(y,h)=>-2.10+(y-.44)*.5-(h-.40)*.2+.015;
const condenserDuct=(r,s)=>{
  const back=-1.978,top=.515,bottom=.313,inner=.465,col=black;
  const edge=(h,y1)=>[[back,s*inner,h],[skinX(inner,h),s*inner,h],[skinX(y1,h),s*y1,h],[back,s*y1,h]];
  r.polygon(edge(top,.70),col,false);r.polygon(edge(bottom,.62),col,false);
  r.polygon([[back,s*inner,bottom],[skinX(inner,bottom),s*inner,bottom],[skinX(inner,top),s*inner,top],[back,s*inner,top]],col,false);
};
const pressureSite=[-1.33,.5035,.60];
const ac=group('ac','A/C air guides and sensors',
  'Air guides lead the air from the bumper intakes to the condensers. The outside temperature sensor sits in the left intake. A pressure sensor on the liquid line protects the refrigerant circuit.',condSrc,[
  ...sides.map(([s,hand,Hand])=>part('condenser-guide-'+hand,`Condenser air guide, ${hand} · ${s<0?'992815215C':'992815216C'}`,`${Hand} duct behind the bumper opening that guides the incoming air onto the condenser face.`,plus(side(s),[-.15,0,0]),condSrc,r=>condenserDuct(r,s))),
  part('outside-temp','Outside temperature sensor · 9A7820535','The small sensor clipped below the left intake duct measures the outside air for the climate control and the instrument display.',fore,condSrc,r=>{
    const c=[-1.995,-.55,.31];cyl(r,c,z,-.022,0,.007,black,8);box(r,plus(c,[0,0,-.026]),[.014,.012,.010],plastic);
  }),
  part('pressure-sensor','A/C pressure sensor · PAB959126','Screwed into the liquid line after the receiver-drier, it reports high-side pressure so the compressor and fan can be controlled.',up,drierSrc,r=>{
    cyl(r,pressureSite,z,0,.030,.010,metal,6);cyl(r,pressureSite,z,.030,.050,.012,black,10);
  })
]);

// ------------------------------------------------------------------ cabin
// The filter lies flat under the luggage-compartment rear trim (lid surface z 0.86),
// above the battery cable and the A/C liquid line and ahead of the suction line.
const filterC=[-.93,.28,.81];
const unitTop=[-.69,0,.79];
// The dash top lies at z 0.845 and its rear face at x -0.43, so the ducts run
// below the top and below the instrument binnacle to vents in that face.
const sideDuct=s=>[[-.70,s*.06,.790],[-.66,s*.20,.792],[-.56,s*.42,.785],[-.475,s*.56,.78]];
const cabin=group('cabin','Cabin air filter, climate-unit sensors and dashboard ducts',
  'Fresh air passes the filter in front of the bulkhead before the blower. Behind the dash, a flap motor and sensors regulate the climate unit, which feeds the centre and side vents and the two footwell outlets.',unitSrc,[
  part('cabin-filter','Odour and allergen filter · 9P1819631','The pleated cabin filter lies in its housing at the rear wall of the luggage compartment, upstream of the blower.',fore,unitSrc,r=>{
    box(r,filterC,[.09,.22,.03],filterMedia);for(let i=-4;i<=4;i++)box(r,[filterC[0]-.0455,filterC[1]+i*.022,filterC[2]],[.001,.003,.026],'#a9a28b');
  }),
  part('filter-cover','Filter housing cover · 992820955','The cover closes the filter housing and comes off to change the filter from the luggage compartment.',up,unitSrc,r=>{
    box(r,plus(filterC,[0,0,.021]),[.10,.236,.006],black);
  }),
  part('flap-motor','Flap adjustment motor · PAB82051101','An electric motor on the side of the air-distribution housing turns one of the flaps that blend and direct the air.',left,unitSrc,r=>{
    const c=[-.725,-.065,.71];box(r,c,[.045,.035,.050],black);cyl(r,plus(c,[0,.0175,0]),y,0,.012,.008,plastic,8);
  }),
  part('unit-temp','Temperature sensor · 97065325300','A sensor in the air-distribution housing behind the heater matrix measures the temperature of the air leaving the unit.',aft,unitSrc,r=>{
    const c=[-.695,.10,.70];cyl(r,c,x,0,.018,.005,black,8);box(r,plus(c,[.024,0,0]),[.012,.014,.014],plastic);
  }),
  part('evaporator-temp','Evaporator temperature sensor · 992820539','The probe sits in the evaporator fins so the system can keep the core from icing.',aft,unitSrc,r=>{
    const c=[-.775,.20,.655];cyl(r,c,x,0,.027,.005,metal,8);box(r,plus(c,[.033,0,0]),[.012,.016,.014],black);
  }),
  part('drain-hose','Condensate drain hose · 992820124C','Water that condenses on the evaporator drains through this hose and out beneath the car.',down,unitSrc,r=>{
    hose(r,[[-.79,.225,.630],[-.80,.225,.618],[-.82,.225,.58],[-.83,.225,.45],[-.83,.20,.38]],.007,rubber);
  }),
  part('duct-centre','Centre air duct · 992820715A','The centre duct rises from the top of the climate unit to the vents in the middle of the dashboard.',up,ductSrc,r=>{
    hose(r,[unitTop,[-.60,0,.795],[-.50,0,.79],[-.462,0,.785]],.022,ductGrey);
  }),
  ...sides.map(([s,hand,Hand])=>part('duct-'+hand,`Air duct, ${hand} side · ${s<0?'992820157':'992820158'}`,`${Hand} duct under the dashboard top that carries air from the climate unit to the ${hand} outer vent.`,side(s),ductSrc,r=>hose(r,sideDuct(s),.020,ductGrey))),
  ...sides.map(([s,hand,Hand])=>part('footwell-'+hand,`Footwell vent, ${hand} · ${s<0?'992819151':'992819152'}`,`${Hand} outlet below the climate unit that blows air into the ${hand} footwell.`,plus(side(s),down),ductSrc,r=>{
    const c=[-.64,s*.17,.60];box(r,c,[.05,.06,.035],ductGrey);for(const h of [-.008,.008])box(r,[c[0]+.0255,c[1],c[2]+h],[.002,.054,.003],black);
  })),
  part('duct-temp','Air duct temperature sensor · 95857230400','A sensor clipped into the left side duct measures the temperature of the air reaching the dashboard vents.',down,ductSrc,r=>{
    const c=[-.60,-.33,.775];cyl(r,c,z,-.030,0,.006,black,8);box(r,plus(c,[0,0,-.034]),[.014,.014,.010],plastic);
  })
]);

export const groups=[coolant,ac,cabin];
export const lines=[
  ...['tank-hose','breather-left','breather-right','breather-front','breather-long'].map(id=>'p992-fit-climate-coolant.'+id),
  ...['drain-hose','duct-centre','duct-left','duct-right'].map(id=>'p992-fit-climate-cabin.'+id),
];
export const mounts=[
  ['p992-fit-climate-cabin.evaporator-temp','p992-hvac.evaporator','the sensor probe is pushed into the evaporator fins and its connector sits on the core face'],
];
