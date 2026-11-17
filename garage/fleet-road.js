import {refs as porsche993Refs} from './porsche993-sources.js';
import {stopLampSource} from './porsche993-stop-lamp.js';
import {fanCatalog} from './porsche-fan.js';
import {engineSectionFace} from './porsche-crankshaft.js';
import {porscheCaseSources} from './porsche-crankcase.js';
import {drawPorscheSpoilerMotion} from './porsche-coachwork.js';
import {drawPorsche} from './fleet-porsche.js';
import {ignitionEntries} from './fleet-ignition.js';
import {drawBike} from './fleet-bike.js';
import {k67ExteriorRefs} from './k67-fairings.js';
import {refs996} from './porsche996-sources.js';

const source=(label,url)=>({label,url});
function group(id,name,description,entries,internal=false){
  return {id,name,description,internal,parts:entries.map(([key,name,description,offset,source])=>({id:id+'.'+key,name,description,offset,...(source?{source}:{})}))};
}
const spoilerMotion={assembly:'shell',name:'Rear spoiler',description:'Watch the spoiler rise from its recess, tilt and settle back into the rear bodywork.'};
const motionFor=modern=>({...spoilerMotion,parts:['shell.spoiler','shell.spoiler-drive'],
  drawMoving:(r,paint,finish,phase)=>drawPorscheSpoilerMotion(r,modern,paint||(modern==='996'?'#c3c7c6':modern?'#a84b3f':'#47778a'),phase)});
const porscheRunning=group('running','Wheels & brakes','A wheel set separates into its tire, wheel center, and brake hardware.',[
  ['tires','Tires','The tire bead seats on the alloy rim. The wider rear tires carry the rear-engine car’s driven axle.',[0,0,.7]],
  ['rims','Alloy wheels','The spokes connect the hub to the rim. The brake rotor and caliper sit behind the wheel face.',[0,0,.32]],
  ['brakes','Rotors & calipers','The rotor turns with the hub while the fixed caliper straddles it.',[0,0,-.14]]
]);
const porscheDrive=gears=>group('drive','Manual transaxle','The gearbox sits ahead of the engine. The final drive feeds the rear half-shafts.',[
  ['gearbox',gears+'-speed manual transaxle','The clutch and bellhousing meet the flywheel. The gearbox extends forward of the rear-mounted flat-six.',[-.42,0,.1]],
  ['axles','Rear half-shafts','A constant-velocity joint at each end lets the rear wheels follow the suspension while transmitting torque.',[0,0,.23]]
],true);
function porscheGroups(modern){return [
  {...group('shell','Body panels','Separate the doors, luggage lid, rear deck and bumper covers.',[
    ['fenders',modern?'Wide-body fenders':'Narrow-body fenders','The front fenders stand above the center of the luggage lid. The rear quarter panels wrap over the driven wheels.',[0,0,0]],
    ['left-door','Left door & mirror','The door cap and mirror move with the left door skin.',[0,-.48,.025]],
    ['right-door','Right door & mirror','The opposite side stays together as one panel.',[0,.48,.025]],
    ['luggage','Front luggage lid','The sloping front lid covers the luggage compartment.',[-.15,0,.58]],
    ['spoiler',modern?'Adaptive spoiler blade':'Retractable spoiler and grille','The movable rear panel stows flush with the body. Open it to follow the lift linkage and inspect the motor.',[.16,0,.32]],
    ['spoiler-drive','Rear spoiler drive mechanism','A fixed carrier locates the electric motor and the links that support the moving panel.',[0,0,.16]],
    ['deck','Rear engine lid & grille',modern?'The narrow grille bars run fore and aft between the rear shoulders.':'The intake grille runs across the lifting rear engine lid.',[.20,0,.55]],
    ['bumpers','Bumper covers & lower openings',modern?'Broad black air openings sit low in the front fascia.':'The front and rear covers wrap into the rounded corners of the fenders.',[0,0,-.26]]
  ]),animated:true,motionDescription:spoilerMotion.description},
  group('cabin','Cabin and convertible top','The windshield frame, seats, controls and folding roof surround the cockpit.',[
    ['windshield','Windshield & frame','The fixed glass, header and A-pillars form the front edge of the open cabin.',[-.22,0,.32]],
    ['seats','Front seats & rear seats','Two front buckets sit ahead of two smaller rear seats.',[0,0,.37]],
    ['carpet','Carpet, floor mats and heel pad','The fitted carpet follows both footwells, the raised center tunnel and the rear bulkhead. The driver’s heel pad sits below the pedals.',[0,0,.22]],
    ['controls','Steering wheel & manual lever','The US layout places the steering wheel on the left and the gear lever on the center tunnel.',[-.18,-.12,.14]],
    ['top','Convertible top and rear window',modern?'The glass rear window folds with the roof and stows beneath the rear cover.':'The rear window is sewn into the fabric. The folded roof sits behind the seats.',[.28,0,.28]]
  ]),
  group('lights','Exterior lighting','Inspect the lamps independently of the bumpers and body panels.',[
    ['headlamps',modern?'Four-point headlamps':'Ellipsoidal headlamps',modern?'Four light points sit inside each inclined headlamp.':'The inclined headlamp lenses follow the slope of the front fenders.',[-.32,0,.23]],
    ...(!modern?['left','right'].map((side,i)=>['fog-'+side,(i?'Right':'Left')+' front fog lamp','The clear, fluted fog lamp sits inboard of the amber indicator. Open it to see the H3 lamp and the small position bulb.',[-.24,i?.24:-.24,.12],porsche993Refs.fog]):[]),
    ...(!modern?[['high-stop','High-mounted stop lamp','A narrow bridge carries the third brake light ahead of the moving spoiler. Open the lamp to see its row of 24 bulbs.',[.10,0,.22],stopLampSource]]:[]),
    ['indicators','Front signal lights','The signal lights are separate from the main headlamp lenses.',[-.38,0,-.05]],
    ['tail',modern?'Rear light strip':'Rear lamp & reflector band',modern?'A narrow horizontal light strip joins the two rear lamp housings.':'A red reflector band joins the wider red lamp clusters across the rear body.',[.36,0,.12]]
  ]),
  group('engine',modern?'3.0 L twin-turbo flat-six':'3.6 L air-cooled flat-six',modern?'Three cylinders on either side feed two turbochargers. The optional engine cutaway exposes the central crankshaft.':'Six finned barrels form two banks of three. The optional engine cutaway reveals the shaft between them.',[
    ['case','Split crankcase and crankshaft',modern?'Open the vertical joint of the 3.0-litre turbo to see the crankshaft, bearings and bores in each case half.':'Open the vertical joint to see the crankshaft, its bearing shells and the registers for the six separate cylinder barrels.',[0,0,-.18],modern?porscheCaseSources.modern:porscheCaseSources.classic],
    ['crankshaft','Six-throw crankshaft','Use the engine cutaway to see the six offset rod journals in place. Open the shaft to inspect its bearing lands, counterweights and ends.',[0,0,.28],modern?porscheCaseSources.modernCrank:porscheCaseSources.classicCrank],
    ['cylinders',modern?'Cylinder banks':'Finned cylinder barrels',modern?'Three cylinders face out to each side of the crankcase.':'Each of the six cylinders has cooling fins around its outside surface.',[.01,0,.02]],
    ['heads',modern?'Cylinder heads and covers':'Six cylinder heads and cam housings',modern?'One water-cooled head covers three cylinders in each bank. A separate cover closes the outboard side.':'Each finned barrel has its own head. A camshaft housing spans the three heads on each side, with separate upper and lower covers.',[0,.42,.17],modern?source('992.1 Carrera · cylinder heads and covers, plate 103-000','https://www.design911.com/diagrams/d/50607/0/'):source('Porsche Classic · individual heads, plate 103-00','https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=53')],
    ...ignitionEntries(modern?'porsche992scab':'porsche993cab'),
    ['intake',modern?'Intake runners':'VarioRam intake runners',modern?'Charge air passes through the intake runners to the cylinder heads.':'The VarioRam system changes the effective intake length. Open the distributor to see the sliding sleeves and the resonance flap between the two banks.',[0,0,.39],modern?source('Porsche · 992 Carrera S powertrain','https://newsroom.porsche.com/en_US/technology/porsche-911-carrera-type-992-powertrain-boxer-engine-16978.html'):porsche993Refs.intake],
    ['cooling',modern?'Front coolant radiators and fans':'Cooling fan, alternator and belts',modern?'The engine pump sends coolant forward to the radiators. Opening the circuit reveals the cooling fan, tubes and tanks.':'The upright axial fan and the alternator sit on the same axis. Each has its own pulley and belt from the crankshaft.',[.22,0,.40],modern?source('Sunset Porsche · 2023 Carrera S cooling fan','https://www.sunsetporscheparts.com/v-2023-porsche-911--carrera-s--3-0l-h6-gas/cooling-system--cooling-fan'):fanCatalog],
    ...(modern?[
      ['left-blower','Left rear deck blower','This electric blower ventilates the engine compartment. Its motor and impeller sit under the rear cover on rubber mounts.',[0,-.34,.28],source('Porsche · engine-compartment blowers','https://static.nhtsa.gov/odi/tsbs/2021/MC-10203093-0001.pdf')],
      ['right-blower','Right rear deck blower','A second electric blower sits across from the left unit. Open the cover to inspect the fan, wiring plug and mounts.',[0,.34,.28],source('2023 Carrera S · engine-compartment parts','https://porsche.oempartsonline.com/v-2023-porsche-911--carrera-s--3-0l-h6-gas/body--rear-compartment')],
      ['intercoolers','Left and right charge-air coolers','Above the engine, each core cools compressed intake air from a turbocharger. Ambient air takes the heat through the walls of the core.',[.15,0,.52],source('Porsche · Carrera S Cabriolet charge-air cooling','https://download.newsroom.porsche.com/dam/jcr%3A027b3198-602a-498d-b4fc-52e6e3b5261a/2020_911_Carrera_S_and_4S_Cabriolet_US_Press_Kit.pdf')]
    ]:[]),
    ['exhaust','Exhaust headers & silencers',modern?'The illustrated Carrera S has the optional Sport Exhaust with two oval outlets. Exhaust leaves each bank through its turbocharger, then passes through the rear silencer.':'Three exhaust branches on each side feed the rear exhaust system.',[.17,0,-.32],modern?source('Porsche · 992.1 Cabriolet exhaust options, p. 16','https://newsroom.porsche.com/dam/jcr%3Acea78bb0-8770-434e-be37-ca597fda76ad/PAG_991_Cabrio_Athen_PM_EN.pdf#page=16'):source('Porsche PET · 993 exhaust, plate 202-00','https://www.9xxteile.com/media/wysiwyg/pet/E_993_KATALOG.pdf')],
    ...(modern?[['turbos','Twin turbochargers','Each exhaust turbine shares a shaft with a compressor. The mirror-image units feed the two charge-air coolers above the engine.',[.2,-.31,.12],source('Porsche · Carrera S engine and drivetrain','https://download.newsroom.porsche.com/dam/jcr%3A6b08630c-aa53-442c-911c-d4c2f384c031/Presskit_2020_Porsche_911_Carrera_S_and_Carrera_4S.pdf.PDF')]]:[])
  ],true),porscheDrive(modern?7:6),porscheRunning
];}
// 1999 Carrera Cabriolet (996.1): water-cooled 3.4 L M96/01, six-speed manual.
function porsche996Groups(){return [
  {...group('shell','Body panels','Separate the doors, luggage lid, rear lid and bumper covers.',[
    ['fenders','Front wings & rear quarters','The front wings rise around the one-piece headlamp units. The rear quarters swell over the driven wheels and carry the tail lamps.',[0,0,0],refs996.outline],
    ['left-door','Left door & mirror','The frameless door carries its mirror on a short stalk at the front corner.',[0,-.48,.025]],
    ['right-door','Right door & mirror','The right door and its mirror move as one panel.',[0,.48,.025]],
    ['luggage','Front luggage lid','The wide lid runs between the wings from the bumper to the windshield.',[-.15,0,.58]],
    ['spoiler','Extending louvred spoiler','The louvred section of the rear lid lifts and tilts as a spoiler. Open it to follow the lift arms and the drive.',[.16,0,.32],refs996.spoiler],
    ['spoiler-drive','Rear spoiler drive mechanism','One electric motor drives both lift arms through flexible shafts beneath the moving panel.',[0,0,.16],refs996.spoiler],
    ['deck','Rear engine lid','The lid carries the third brake light ahead of the louvres and the 911 Carrera script.',[.20,0,.55]],
    ['bumpers','Bumper covers & intakes','Three intakes cross the front cover. The rear cover holds the US plate recess between two rubber guards.',[0,0,-.26],refs996.photos]
  ]),animated:true,motionDescription:spoilerMotion.description},
  group('cabin','Cabin and convertible top','The windshield frame, seats, controls and folding roof surround the cockpit.',[
    ['windshield','Windshield & frame','The fixed glass, header and A-pillars form the front edge of the open cabin.',[-.22,0,.32]],
    ['seats','Front seats & rear seats','Two front seats sit ahead of two small rear seats.',[0,0,.37]],
    ['carpet','Carpet, floor mats and heel pad','The fitted carpet follows both footwells, the center tunnel and the rear bulkhead.',[0,0,.22]],
    ['controls','Steering wheel & manual lever','The US layout places the steering wheel on the left and the six-speed lever on the center tunnel.',[-.18,-.12,.14]],
    ['top','Convertible top and rear window','The fabric top folds into the well behind the rear seats beneath a body-colour cover. Its rear window is flexible plastic.',[.28,0,.28],refs996.top]
  ]),
  group('lights','Exterior lighting','Inspect the lamps independently of the bumpers and body panels.',[
    ['headlamps','One-piece headlamp units','Each clear lens covers the main reflector, a smaller round lamp and the amber US signal.',[-.32,0,.23],refs996.outline],
    ['indicators','Amber side markers','A US side marker sits in each bumper return ahead of the front wheel.',[-.38,0,-.05]],
    ['tail','Tail lamps & third brake light','Each tail lamp wraps from the rear panel onto the quarter. The third brake light sits on the rear lid ahead of the louvres.',[.36,0,.12],refs996.photos]
  ]),
  group('engine','3.4 L water-cooled flat-six','The M96/01 engine is naturally aspirated. Three cylinders on either side share one water-cooled head per bank.',[
    ['case','Split crankcase and crankshaft','Open the vertical joint to see the crankshaft, bearings and the bores cast into each case half.',[0,0,-.18],refs996.crankcase],
    ['crankshaft','Six-throw crankshaft','Use the engine cutaway to see the six offset rod journals in place. Open the shaft to inspect its bearing lands, counterweights and ends.',[0,0,.28],refs996.crankshaft],
    ['cylinders','Cylinder banks','Three cylinders face out to each side of the crankcase.',[.01,0,.02]],
    ['heads','Cylinder heads and covers','One water-cooled head covers three cylinders in each bank, with four valves per cylinder and VarioCam on the intake side.',[0,.42,.17],refs996.engine],
    ...ignitionEntries('porsche996cab'),
    ['intake','Resonance intake manifold','A central distributor with a resonance flap feeds both banks from one throttle body.',[0,0,.39],refs996.engine],
    ['cooling','Front coolant radiators and fans','The engine pump sends coolant forward to a radiator behind each outer front intake.',[.22,0,.40],refs996.engine],
    ['exhaust','Exhaust headers & silencers','Three branches on each side feed a catalyst and a rear silencer that ends in one oval tailpipe.',[.17,0,-.32],refs996.photos]
  ],true),porscheDrive(6),porscheRunning
];}
const bikeGroups=[
  group('body','Fairings, tank & seat','The fairings guide air around the rider and over the cooling surfaces. The winglets project from the nose.',[
    ['fairing','Nose and side fairings','A painted brow wraps over the lamps. The side trim overlaps the dark radiator outlets, leaving the clutch cover visible on the right. The black engine spoiler closes the underside.',[0,-.33,.15],k67ExteriorRefs.fairing],
    ['winglets','Front winglets','Each winglet has an upper blade, a lower blade and a short outer wall. Look through the opening below the headlamp to see how the blades join.',[-.19,0,.20],k67ExteriorRefs.winglets],
    ['lamps','Twin LED headlamps','Two swept-back lamps sit on either side of the central ram-air inlet. A clear lens covers the recessed reflectors on each side.',[-.29,0,.02],k67ExteriorRefs.front],
    ['tail-carrier','Rear light and license-plate carrier','The bracket carries the plate and two visible lamp units beneath the tail. Brake and tail lighting share the rear indicators.',[.13,0,-.08]],
    ['fender','Front mudguard','The short curved panel sits close to the front tire and moves with the lower fork.',[-.14,0,.13],k67ExteriorRefs.fender],
    ['tank','Fuel tank','The tank rises ahead of the rider and above the engine airbox.',[0,0,.38]],
    ['seat','Saddle & tail unit','The rider sits in the lower pocket between the tank and the raised rear section.',[.20,0,.18]]
  ]),
  group('cabin','Rider controls','Low clip-ons put the brake and clutch controls on the bars. Footrests mount farther back on the frame.',[
    ['screen','Windscreen','The screen rises from the nose and curves back above the instrument cluster. The upper edge is higher in the middle than at its two corners.',[-.10,0,.20],k67ExteriorRefs.screen],
    ['controls','Bars, levers, mirrors & display','The instrument display mounts ahead of the low bars. Mirrors extend from the front fairing.',[0,0,.24]]
  ]),
  group('chassis','Frame & suspension','A twin-spar aluminum frame links the steering head and swingarm pivot. The engine contributes to the structure.',[
    ['frame','Aluminum frame spars','The frame rails pass down the sides of the inline-four from the steering head.',[0,0,.24]],
    ['fork','Upside-down fork & clamps','The larger upper tubes clamp into the steering yokes. The sliders carry the front axle.',[-.27,0,.06]],
    ['swingarm','Double-sided swingarm','The swingarm pivots behind the engine and supports the rear wheel at both axle ends.',[.20,0,.02]],
    ['shock','Rear spring & damper','A single shock and coil spring control motion of the rear suspension.',[0,.22,.12]]
  ]),
  group('engine','999 cc inline-four','The four cylinders sit across the frame. Their intake ports face rearward and four exhaust headers leave the front of the head.',[
    ['case','Crankcase','The crankshaft runs transversely. The gearbox shares the lower engine housing.',[0,0,-.2]],
    ['cylinders','Four cylinder bores','Four closely spaced cylinders lean toward the front wheel.',[0,0,.01]],
    ['head','DOHC cylinder head','Two camshafts operate four valves per cylinder. BMW ShiftCam varies the intake valve lift and timing.',[0,0,.22]],
    ...ignitionEntries('bmws1000rr'),
    ['airbox','Airbox & throttle bodies','An airbox above the engine supplies one throttle body per cylinder.',[.12,0,.35]],
    ['cooling','Coolant radiator','A broad radiator sits behind the front wheel and ahead of the engine.',[-.26,0,.06]]
  ],true),
  group('drive','Transmission & exhaust','Power passes through a six-speed gearbox and a chain to the rear wheel. The exhaust runs on the other side.',[
    ['gearbox','Six-speed gearbox','The gearbox transfers torque from the crankshaft to the final-drive sprocket.',[0,0,.15]],
    ['chain','Drive chain & sprockets','The chain follows the left side of the bike from the gearbox to the rear sprocket.',[0,-.23,0]],
    ['exhaust','Four headers, collector & silencer','The headers merge below the engine and rise to a silencer on the rider’s right.',[0,.29,-.04]]
  ],true),
  group('running','Wheels & brakes','Two small contact patches support the bike. Two rotors at the front share the forward braking load.',[
    ['tires','Front & rear tires','The front tire is narrower than the rear. Both have rounded shoulders for cornering.',[0,0,.25]],
    ['rims','Cast wheels','Both rims are 17 inches in diameter and have open spoke centers.',[0,-.28,.05]],
    ['discs','Brake rotors & calipers','Two front rotors flank the wheel. A single rotor sits on the rear wheel.',[0,.27,.01]]
  ])
];
export const roadModels=[
  {inspectionSections:{engine:engineSectionFace},id:'porsche993cab',name:'Porsche 911 Carrera Cabriolet',short:'911 Carrera Cabriolet · 993',year:1998,domain:'Land',type:'Cars',
    detail:'US Carrera Cabriolet. Its narrow rear body encloses a naturally aspirated, air-cooled flat-six and a six-speed manual.',
    source:source('Porsche · the air-cooled 993','https://newsroom.porsche.com/en/history/porsche-911-seven-generations-part-4-type-993-16486.html'),
    photoReference:source('1998 Carrera Cabriolet 6-speed photo gallery','https://bringatrailer.com/listing/1998-porsche-911-carrera-cabriolet-53/'),
    specs:[['Generation','993'],['Engine','3.6 L air-cooled flat-six'],['Induction','Naturally aspirated · VarioRam'],['Transmission','6-speed manual · rear-wheel drive'],['Wheelbase','2,272 mm']],
    parts:[{name:'993 Carrera parts catalog',url:'https://www.suncoastparts.com/993landing.html',seller:'Suncoast Porsche Parts',description:'Choose the rear-wheel-drive Carrera and Cabriolet body style. Match model year and options before ordering.'}],
    motion:motionFor(false),groups:porscheGroups(false),draw:(r,paint,finish,phase)=>drawPorsche(r,false,paint,finish,phase)},
  {inspectionSections:{engine:engineSectionFace},id:'porsche992scab',name:'Porsche 911 Carrera S Cabriolet',short:'911 Carrera S Cabriolet · 992.1',year:2023,domain:'Land',type:'Cars',
    detail:'US Carrera S Cabriolet with the optional seven-speed manual. Its wider rear shoulders, narrow light strip and staggered wheels distinguish it from the 993.',
    source:source('Porsche · Carrera S Cabriolet manual','https://newsroom.porsche.com/en_US/products/manual-transmission-2020-911-carrera-s-carrera-4s-coupe-cabriolet-19154.html'),
    photoReference:source('2023 Carrera S Cabriolet exterior photos','https://bringatrailer.com/listing/2023-porsche-911-carrera-s-cabriolet-2/'),
    specs:[['Generation','992.1'],['Engine','3.0 L twin-turbo flat-six'],['Output','443 hp · US specification'],['Transmission','7-speed manual · rear-wheel drive'],['Wheels','20 in front · 21 in rear']],
    parts:[{name:'992.1 Carrera S parts catalog',url:'https://www.suncoastparts.com/992landing.html',seller:'Suncoast Porsche Parts',description:'Select Carrera S. Check manual-transmission fitment and Cabriolet body style in the product listing.'}],
    motion:motionFor(true),groups:porscheGroups(true),draw:(r,paint,finish,phase)=>drawPorsche(r,true,paint,finish,phase)},
  {id:'bmws1000rr',name:'BMW S 1000 RR',short:'S 1000 RR',year:2023,domain:'Land',type:'Motorcycles',
    detail:'The 2023 RR pairs a transverse four-cylinder engine with a double-sided swingarm. Its front winglets, high tail and right-side exhaust are visible from the side.',
    source:source('BMW Motorrad · 2023 S 1000 RR','https://newsroom.bmwgroup.com/global/the-new-bmw-s-1000-rr/'),
    photoReference:source('2023 S 1000 RR factory photos','https://www.press.bmwgroup.com/usa/article/detail/T0404178EN_US/the-new-bmw-s-1000-rr'),
    specs:[['Generation','K67 · 2023 update'],['Engine','999 cc liquid-cooled inline-four'],['Valve gear','DOHC · 16 valves · ShiftCam'],['Transmission','6-speed · chain final drive'],['Wheels','17 in front and rear']],
    parts:[{name:'2023 S 1000 RR parts diagrams',url:'https://shop.maxbmw.com/fiche/DiagramsMain.aspx?rnd=554960&vid=63032',seller:'MAX BMW Motorcycles',description:'US K67 parts diagrams for October 2021 through June 2024 production. Check the production date and VIN when choosing an option.'}],
    groups:bikeGroups,draw:drawBike},
  {inspectionSections:{engine:engineSectionFace},id:'porsche996cab',name:'Porsche 911 Carrera Cabriolet',short:'911 Carrera Cabriolet · 996',year:1999,domain:'Land',type:'Cars',
    detail:'US Carrera Cabriolet with the six-speed manual. The first water-cooled 911 has one-piece headlamp units and a longer, wider body than the 993.',
    source:source('Porsche Classic · 911 Carrera (type 996)','https://www.porsche.com/central-eastern-europe/en/_bulgaria_/accessoriesandservice/classic/models/996/996/'),
    photoReference:source('1999 Carrera Cabriolet 6-speed photo gallery','https://bringatrailer.com/listing/1999-porsche-911-carrera-71/'),
    specs:[['Generation','996.1'],['Engine','3.4 L water-cooled flat-six'],['Induction','Naturally aspirated · M96/01'],['Transmission','6-speed manual · rear-wheel drive'],['Wheelbase','2,350 mm']],
    parts:[{name:'996 Carrera parts diagrams',url:'https://eurospares.co.uk/Porsche/996/996_(1999)/PartDiagrams/101-005/CRANKCASE',seller:'Eurospares',description:'Choose the 1999 Carrera (996) and the Cabriolet body style. Match engine code and options before ordering.'}],
    motion:motionFor('996'),groups:porsche996Groups(),draw:(r,paint,finish,phase)=>drawPorsche(r,'996',paint||undefined,finish||undefined,phase)}
];
