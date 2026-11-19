// 992 study pack: body.
// Scope: Body ends and underbody: front and rear bumpers and their brackets and grilles, luggage-compartment lid and lock, engine lid and grille, underbody panels and aero, rear spoiler motor and linkage (the 803-180 spoiler diagram is done), convertible-top drive cylinder.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-body-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// The car is a US (left-hand drive) 2023 Carrera S Cabriolet with the basic body
// (no Sport Design package), so Sport Design, Dakar, China plate, RHD, coupé-only
// and European warning-triangle rows are left out. Where a page splits a part by
// body style, the Cabriolet (PK8K) number is used. Colour suffixes (OK1, G2X,
// YGRV and so on) are kept as the page prints them.
export const hooks=["shell.bumpers", "shell.luggage", "shell.deck", "floor.pan", "floor.underlay", "floor.rear-lining", "992spoiler.blade", "992spoiler.output", "992spoiler.sensor", "992spoiler.closure", "992spoiler-motor.case", "992spoiler-motor.field", "992spoiler-motor.rotor", "992spoiler-pivot.bracket", "992spoiler-pivot.link", "service-porsche992scab-roof-drive.barrel", "service-porsche992scab-roof-drive.piston", "service-porsche992scab-roof-drive.seal", "service-porsche992scab-roof-drive.eyes"];
import {catalogueStudy} from './porsche992-catalog-studies.js';

const es='https://www.eurospares.co.uk/Porsche/992/';

// Front bumper, basic version (802-000), with park assist sensors.
const frontBumper={id:'front-bumper',code:'802-000',title:'Front bumper',year:'2020 (992-1)',
  url:es+'992_(2020)/PartDiagrams/802-000/BUMPER',
  rows:[
    ['1','992898010J','Front bumper cover, primed, for park assist'],
    ['2','992807499','Towing eye cover, primed'],
    ['3','992807100B','Front spoiler'],
    ['4','992807579A','Front air inlet trim'],
    ['5','992807347','Park assist ultrasound sensor bracket, left'],
    ['5','992807348','Park assist ultrasound sensor bracket, right'],
    ['6','5Q0919275C','Park assist sensor, outer, primed'],
    ['7','5Q0919275B','Park assist sensor, inner, primed'],
    ['8','5Q0919133','Park assist sensor seal ring'],
    ['9','9A700751700','Panel screw ST4.8x19-C'],
    ['10','N 91242501','Speed nut ST4.8x22x18'],
  ]};

// Front bumper fasteners (802-200).
const frontFasteners={id:'front-bumper-fasteners',code:'802-200',title:'Front bumper fasteners',year:'2019 (992-1)',
  url:es+'2019_(992-1)/PartDiagrams/802-200/BUMPER',
  rows:[
    ['1','992807139A','Front bumper centre bracket'],
    ['2','992807805','Front bumper side plate, left'],
    ['2','992807806','Front bumper side plate, right'],
    ['3','992807595C','Front bumper cover holder, left'],
    ['3','992807596C','Front bumper cover holder, right'],
    ['4','992806521C','Front turn signal bracket, left'],
    ['4','992806522C','Front turn signal bracket, right'],
    ['5','992807891','Front trim fixing'],
    ['6','N 91042301','Oval hexagon socket head bolt M6x16'],
    ['7','9A700751700','Panel screw ST4.8x19-C'],
    ['8','N 91242501','Speed nut ST4.8x22x18'],
    ['9','N 10473402','Oval-head screw M6x20'],
  ]};

// Front bumper carrier (802-400).
const frontCarrier={id:'front-bumper-carrier',code:'802-400',title:'Front bumper carrier',year:'2020 (992-1)',
  url:es+'2020_(992-1)/PartDiagrams/802-400/BUMPER_BRACKET',
  rows:[
    ['1','992807108H','Front bumper carrier, complete'],
    ['2','992807665D','Bumper carrier foam part'],
    ['3','992807113D','Pedestrian protection cross member'],
    ['4','992807265','Front bumper carrier seal'],
    ['5','N 10609207','Hexagon collar locknut M8'],
    ['6','N 10629602','Hexagon collar bolt M10x35'],
    ['7','PAF908594','Knurled rivet nut M6'],
  ]};

// Front bumper air guide, grilles and cooling-air flaps (802-100).
const frontAirGuide={id:'front-air-guide',code:'802-100',title:'Front bumper air guide and grilles',year:'2020 (992-1)',
  url:es+'2020_(992-1)/PartDiagrams/802-100/AIR_DUCT',
  rows:[
    ['1','992807681BGOK1','Centre grille, open'],
    ['2','992807681BDOK1','Centre grille, closed'],
    ['3','992807135A','Centre grille bracket'],
    ['4','992807683DOK1','Grille, left'],
    ['5','992807684DOK1','Grille, right'],
    ['6','992807229OK1','Cooling air control flap, left'],
    ['7','992807230OK1','Cooling air control flap, right'],
    ['8','992820535','Outside temperature sensor'],
    ['9','N 10473402','Oval-head screw M6x20'],
    ['10','PAF005217','Pop rivet 3.2x17.15'],
    ['11','992807379OK1','Air inlet trim'],
  ]};

// Rear bumper, basic version for the USA (802-501). The China plate holder is left out.
const rearBumper={id:'rear-bumper',code:'802-501',title:'Rear bumper, USA',year:'2020 (992-1)',
  url:es+'2020_(992-1)/PartDiagrams/802-501/BUMPER',
  rows:[
    ['1','992898014M','Rear bumper cover for park assist and reversing camera, primed'],
    ['2','992807442A G2X','Towing eye cover, primed'],
    ['3','992898014Q','Lower rear cover'],
    ['4','992807833 OK1','Exhaust tailpipe trim, left'],
    ['4','992807834 OK1','Exhaust tailpipe trim, right'],
    ['5','992807941 OK1','Air outlet frame, left'],
    ['5','992807942 OK1','Air outlet frame, right'],
    ['6','992807286','Lower bracket'],
    ['7','992807659K 041','Upper rear trim, black'],
    ['8','992807989A','Plate carrier support element'],
    ['9','N 91242501','Speed nut ST4.8x22x18'],
    ['10','5Q0919133 9B9','Park assist sensor seal ring, satin black'],
    ['11','95B919275','Park assist ultrasound sensor, 90 degree'],
    ['12','95891927500G2X','Park assist ultrasound sensor, centre, primed'],
    ['13','PAB919275 G2X','Park assist ultrasound sensor, rear side, primed'],
    ['14','992807801B OK1','Rear trim, left'],
    ['14','992807802B OK1','Rear trim, right'],
    ['15','992807317','Reinforcement'],
    ['17','9A700844200','Rivet nut M6'],
    ['18','9A700788200','Oval-head screw TP5x13'],
  ]};

// Rear bumper fasteners and air guides (802-700).
const rearFasteners={id:'rear-bumper-fasteners',code:'802-700',title:'Rear bumper fasteners and air guides',year:'2020 (992-1)',
  url:es+'2020_(992-1)/PartDiagrams/802-700/BUMPER',
  rows:[
    ['1','992807147','Rear bumper side cover holder, left'],
    ['1','992807148D','Rear bumper side cover holder, right'],
    ['2','992807009 OK1','Rear air guide, left'],
    ['2','992807010 OK1','Rear air guide, right'],
    ['3','992807885M','Rear bumper retainer, left'],
    ['3','992807886E','Rear bumper retainer, right'],
    ['4','9A700751700','Panel screw ST4.8x19-C'],
    ['5','PAF009011','Fillister head bolt M6x25'],
    ['6','PAF005208','Fillister head bolt M6x20'],
    ['7','9A700746200','Hexagon nut M6'],
    ['8','N 91242501','Speed nut ST4.8x22x18'],
    ['9','PAF008543','Threaded reinforcement insert 10.6x12.6'],
    ['10','992813559','Rear air guide seal, left'],
    ['10','992813560','Rear air guide seal, right'],
    ['11','992807863F','Bumper cover centre securing strip, left'],
    ['12','992807864F','Bumper cover centre securing strip, right'],
  ]};

// Rear bumper carrier and heat shields, basic version (802-800).
const rearCarrier={id:'rear-bumper-carrier',code:'802-800',title:'Rear bumper carrier and heat shields',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/802-800/BUMPER_BRACKET',
  rows:[
    ['1','992807235C','Rear bumper carrier'],
    ['2','992807603E','Rear cross member foam part'],
    ['3','992807723','Lower rear support part, left'],
    ['4','992807724','Lower rear support part, right'],
    ['5','992807526','Bow support part'],
    ['6','992825747C','Heat shield, lower centre'],
    ['7','992825729B','Heat shield, inner left'],
    ['8','992825730B','Heat shield, inner right'],
    ['9','992825753B','Heat shield, upper centre'],
    ['10','PAF008295','Hexagon head screw M8x30'],
    ['11','N 91247501','Speed nut'],
    ['12','N 90627102','Self-locking speed nut M6'],
    ['13','N 91173301','Hexagon nut with washer M6'],
  ]};

// Front lid (luggage-compartment lid) with hinges and crest (803-000).
const frontLid={id:'front-lid',code:'803-000',title:'Front lid and hinges',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/803-000/HOOD',
  rows:[
    ['1','992823031AY','Front lid, primed'],
    ['2','992823295 Y','Front lid hinge, left, primed'],
    ['2','992823296 Y','Front lid hinge, right, primed'],
    ['3','992823611','Hinge bracket, left'],
    ['3','992823612','Hinge bracket, right'],
    ['4','992823359','Front lid damper'],
    ['5','9P1823085','Front lid lock upper part'],
    ['6','9P1853601','Porsche crest, front'],
    ['7','9P1853611','Porsche crest packing'],
    ['8','992823727A','Front lid seal'],
    ['9','992823745','Hinge cover, left'],
    ['9','992823746','Hinge cover, right'],
    ['10','9P1823499','Adjustable rubber buffer'],
    ['12','N 91189303','Hexagon nut M6'],
    ['13','N 91042301','Oval hexagon socket head bolt M6x16'],
    ['14','9P1823603','Front lid protective cap'],
    ['15','PAF007500','Ball pin'],
    ['16','PAF008243','Hexagon socket flat head bolt'],
  ]};

// Front lid lock (803-050).
const frontLock={id:'front-lid-lock',code:'803-050',title:'Front lid lock',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/803-050/LOCK',
  rows:[
    ['1','992823509G','Front lid latch'],
    ['2','9P1823615','Front release Bowden cable'],
    ['3','PAF108333','Hexagon nut M6'],
  ]};

// Rear (engine) lid, lock, grille and fan (803-130). The coupé-only matt black
// grille (PK8C) is left out.
const rearLid={id:'rear-lid',code:'803-130',title:'Rear lid, lock and grille trim',year:'2022 (992-1)',
  url:es+'2022_(992-1)/PartDiagrams/803-130/tailgate_boot_lid',
  rows:[
    ['1','992827025 YGRV','Rear lid, primed'],
    ['2','992827151DYGRV','Rear lid hinge, left, primed'],
    ['3','992827152EYGRV','Rear lid hinge, right, primed'],
    ['4','992827401B','Rear lid damper'],
    ['5','9P1872151','Rear lid striker'],
    ['6','992827501B','Rear lid lock'],
    ['7','992823615','Rear lid release Bowden cable'],
    ['9','992853551A G2X','Vent grille trim, primed'],
    ['10','992898070A','Ventilation grille repair set'],
    ['11','N 91042301','Oval hexagon socket head bolt M6x16'],
    ['12','PAF008243','Hexagon socket flat head bolt'],
    ['13','9P2827589','Adjustable rear stop buffer'],
    ['14','PAF108375','Hexagon head bolt, combi'],
    ['15','992959133A','Rear lid fan'],
    ['16','9P1959841','Grommet'],
    ['17','95811067300','Grommet'],
  ]};

// Underbody panels (801-700), Cabriolet (PK8K) front and rear panels.
const underbody={id:'underbody-trim',code:'801-700',title:'Underbody panels',year:'2021 (992-1)',
  url:es+'2021_(992-1)/PartDiagrams/801-700/Underbody_trim',
  rows:[
    ['1','992825523H','Front underbody panel, Cabriolet'],
    ['2','992825505','Centre underbody panel'],
    ['3','992825521A','Rear underbody panel, Cabriolet'],
    ['6','PAF008768','Plastic nut'],
    ['6','N 91242801','Hexagon nut with washer'],
    ['7','9A700769800','Panel screw 4.8x16'],
    ['8','V04015800B','Underbody adhesive tape'],
    ['9','9P1853385','Underbody panel securing clip'],
    ['10','N 91242501','Speed nut ST4.8x22x18'],
  ]};

// Front end and luggage-compartment floor (801-100). The front-end carriers use
// the Cabriolet and Targa (PK8K, PK5T) numbers.
const frontEnd={id:'front-end-floor',code:'801-100',title:'Front end and luggage-compartment floor',year:'2020 (992-1)',
  url:es+'2020_(992-1)/PartDiagrams/801-100/FRONT_END',
  rows:[
    ['1','992803201 YGRV','Luggage-compartment floor plate'],
    ['2','992802107 YGRV','Luggage-compartment filler plate'],
    ['3','992803601 YGRV','Front luggage-compartment cross panel'],
    ['4','992805079AYGRV','Floor plate cross panel'],
    ['5','992805357AYGRV','Cross panel reinforcement, left'],
    ['5','992805358AYGRV','Cross panel reinforcement, right'],
    ['6','992805597 YGRV','Upper floor plate closing element'],
    ['7','992898337 GRV','Upper longitudinal member filler plate, left'],
    ['7','992898338 GRV','Upper longitudinal member filler plate, right'],
    ['8','992806075AYGRV','Floor plate side panel frame, left'],
    ['8','992806076BYGRV','Floor plate side panel frame, right'],
    ['9','992805048 YGRV','Side member connecting piece'],
    ['10','992801371','Front floor plate insert'],
    ['11','992803203 YGRV','Luggage-compartment floor plate, front section'],
    ['12','992805733YGRV','Cooler module lower retaining plate'],
    ['13','992898101C GRV','Front-end section carrier, left, Cabriolet'],
    ['13','992898102C GRV','Front-end section carrier, right, Cabriolet'],
    ['14','PAF011210','Sticky pad'],
  ]};

// Luggage-compartment trim (807-000), left-hand drive. RHD, European
// warning-triangle and the strap dated up to 08.09.2022 are left out.
const luggageTrim={id:'luggage-trim',code:'807-000',title:'Luggage-compartment trim',year:'2019 (992-1)',
  url:es+'2019_(992-1)/PartDiagrams/807-000/BOOT_LINING',
  rows:[
    ['1','992863475A OK1','Lock carrier cover'],
    ['2','9A700720700','Distance piece'],
    ['3','PAF827649','Clip'],
    ['4','992821941C OK1','Wing lining, left'],
    ['5','992821942C OK1','Wing lining, right'],
    ['6','992864445A','Foam part'],
    ['7','992864714A','Foam part, second'],
    ['8','992863721D OD7','Luggage-compartment trim, USA'],
    ['9','N 10700901','Spreader rivet 4.5x11.5'],
    ['10','992863362 OD7','Luggage-compartment trim'],
    ['11','992959619 6N3','Emergency release actuating unit, USA'],
    ['12','PAB947409','Luggage-compartment lamp'],
    ['13','N 10714801','Oval hexagon socket head bolt M6x18'],
    ['14','9P1825263','Emergency operation arm, Cabriolet'],
    ['15','992012255','Screwdriver for slotted and Phillips screws'],
    ['16','992012549B OK1','Tool cover'],
    ['17','992863284A 1E0','Luggage-compartment storage net'],
    ['18','992863841 OK1','Clip, matt black'],
    ['21','992863081B OK1','Trim cover'],
    ['23','992819401A OK1','Plenum chamber cover, left-hand drive'],
    ['24','992867129A','Washer reservoir foam part, left-hand drive'],
    ['26','992863849A','Bracket'],
  ]};

const P='p992-body-';
const build=d=>catalogueStudy(d,P);
const [sFrontBumper,sFrontFasteners,sFrontCarrier,sFrontAirGuide,sRearBumper,sRearFasteners,sRearCarrier,sFrontLid,sFrontLock,sRearLid,sUnderbody,sFrontEnd,sLuggageTrim]=
  [frontBumper,frontFasteners,frontCarrier,frontAirGuide,rearBumper,rearFasteners,rearCarrier,frontLid,frontLock,rearLid,underbody,frontEnd,luggageTrim].map(build);

// The id of the part numbered `mpn` in study `s`, for nesting a sub-study.
const at=(s,mpn)=>{const p=s.groups[0].parts.find(p=>p.name.endsWith(' · '+mpn));if(!p)throw new Error(s.id+' has no '+mpn);return p.id;};

export const studies=[sFrontBumper,sFrontFasteners,sFrontCarrier,sFrontAirGuide,sRearBumper,sRearFasteners,sRearCarrier,sFrontLid,sFrontLock,sRearLid,sUnderbody,sFrontEnd,sLuggageTrim];
export const views=new Map([
  ['shell.bumpers',sFrontBumper],
  ['shell.luggage',sFrontLid],
  ['shell.deck',sRearLid],
  ['floor.pan',sFrontEnd],
  ['floor.underlay',sUnderbody],
  ['floor.rear-lining',sRearCarrier],
  // Front bumper: its cover opens the fasteners, the air inlet trim the grilles,
  // and the fasteners' centre bracket the bumper carrier behind it.
  [at(sFrontBumper,'992898010J'),sFrontFasteners],
  [at(sFrontBumper,'992807579A'),sFrontAirGuide],
  [at(sFrontFasteners,'992807139A'),sFrontCarrier],
  // Rear bumper: the carrier opens the bumper cover, the cover its fasteners.
  [at(sRearCarrier,'992807235C'),sRearBumper],
  [at(sRearBumper,'992898014M'),sRearFasteners],
  // Front lid: its lock upper part opens the latch; the floor plate opens the trim.
  [at(sFrontLid,'9P1823085'),sFrontLock],
  [at(sFrontEnd,'992803201 YGRV'),sLuggageTrim],
]);
