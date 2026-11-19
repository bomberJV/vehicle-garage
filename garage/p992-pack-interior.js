// 992 study pack: interior.
// Scope: Interior: dashboard, centre console, instrument cluster, infotainment, airbags, seat belts, seat electrics and heating, carpets and trim, sun visors, interior mirror.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-interior-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["cabin.controls", "p992-seats.leads", "p992-seat-element.cover", "p992-seat-element.mat", "p992-seat-element.trace", "p992-seat-element.foam", "seat_track.anchor", "seat_track.slider", "seat_track.brackets", "carpet_edge.pile", "carpet_edge.backing", "carpet_edge.pad", "carpet_edge.binding"];
import {catalogueStudy} from './porsche992-catalog-studies.js';

// Airbags, read from the Eurospares copy of catalogue diagram 812-050. Coupe-only
// rows (seat side airbags for PK8C/PQ1K, head airbags and their nuts) are left
// out; the knee airbag is the USA and California assembly kit (PB0T).
const airbag={id:'airbags',code:'812-050',title:'Airbags',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/812-050/Airbag',
  rows:[
    ['1','992880201S TRP','Airbag unit for steering wheel, black'],
    ['3','N 91073301','Hexagon socket flat head bolt M6x12'],
    ['4','992880204B','Passenger airbag unit'],
    ['5','N 91093502','Hexagon socket oval head bolt M6x30, self-locking'],
    ['6','992880841','Knee airbag unit, USA'],
    ['7','N 91188301','Hexagon socket head bolt M6x20, knee airbag'],
  ]};

// Wave 2. Every table below is read from the Eurospares copy of the catalogue
// page in its url. The car is a US (left-hand drive) Carrera S Cabriolet with
// the 7-speed manual and heated front seats (4A3), so rows marked coupe, Targa,
// PDK (G1F/G1G), right-hand drive or other markets are left out, and where a
// ref lists colour or trim variants only one black version is kept.

// Front three-point belts, 812-000. The belts are the USA Cabriolet (K8K) pair;
// the page also lists a 4QR pair, 992857705E/706E. Refs 10-15 are K8K-only.
const frontBelts={id:'front-seat-belts',code:'812-000',title:'Three-point seat belts, front',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/812-000/THREE-POINT_SEAT_BELT',
  rows:[
    ['1','992857705G','Three-point seat belt, driver side, Cabriolet, USA'],
    ['1','992857706G','Three-point seat belt, right, Cabriolet, USA'],
    ['2','992857755B','Belt buckle, left'],
    ['2','992857756B','Belt buckle, right'],
    ['3','N 98923701','Polygon socket bolt 7/16-20UNFx13 for the buckle'],
    ['4','N 98926102','Polygon socket bolt 7/16-20x32 for the belt'],
    ['5','N 91096701','Oval hexagon socket head bolt M6x16'],
    ['6','9A700775500','Cheese head screw 12x14x18'],
    ['7','PAF008626','Bushing'],
    ['9','99951603201','Hexagon nut M6 with weld stud M6x13'],
    ['10','992857273','Belt mounting, left'],
    ['10','992857274','Belt mounting, right'],
    ['11','PAF002424','Hexagon socket head bolt M8x30'],
    ['12','PAF008876','Hexagon socket head bolt M8x35, combi'],
    ['13','992858813','Belt relay lever, left'],
    ['13','992858814','Belt relay lever, right'],
    ['14','N 10629602','Hexagon head bolt with shoulder M10x35'],
    ['15','992857781','Belt guide, left'],
    ['15','992857782','Belt guide, right'],
    ['16','992857037','Cap'],
  ]};

// Rear three-point belts, 812-005: the USA Targa and Cabriolet (K5T, K8K) pair.
const rearBelts={id:'rear-seat-belts',code:'812-005',title:'Three-point seat belts, rear',year:'2019 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2019/PartDiagrams/812-005/THREE-POINT_SEAT_BELT',
  rows:[
    ['1','992857805C','Rear three-point seat belt, left, Cabriolet, USA'],
    ['1','992857806C','Rear three-point seat belt, right, Cabriolet, USA'],
    ['2','992857753','Rear belt buckle, left'],
    ['2','992857754','Rear belt buckle, right'],
    ['3','N 91026201','Shouldered hexagon nut M10'],
    ['4','N 98926102','Polygon socket bolt 7/16-20x32'],
    ['5','N 98925801','Polygon socket bolt 7/16-20UNFx42'],
  ]};

// Airbag control unit and crash sensors, 901-060. Refs 8 and 9 have no number.
const airbagControl={id:'airbag-control',code:'901-060',title:'Airbag control unit and crash sensors',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/901-060/AIR_BAG_CONTROL_MODULE',
  rows:[
    ['1','992959655D','Airbag control unit'],
    ['2','N 01508210','Hexagon collar nut M6'],
    ['3','992959651','Front crash sensor'],
    ['4','N 91071702','Hexagon socket flat head bolt M6x25'],
    ['5','9A795965100','Crash sensor for the front side airbag'],
    ['6','N 10737001','Self-locking hexagon nut M6'],
    ['7','PAB955557','Door pressure sensor'],
    ['10','971907651','Acceleration sensor, front and rear'],
  ]};

// Upper dashboard, 809-000: the black non-leather dashboard (-DK4).
const dash={id:'dash-trim',code:'809-000',title:'Dashboard, upper part with fasteners',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/809-000/DASH_PANEL_TRIM',
  rows:[
    ['1','992857003BCDK4','Dashboard, black'],
    ['2','N 90455902','Speed nut M5x16.6x15'],
    ['3','WHT004906','Clip'],
    ['4','9A7867190A','Clip'],
    ['5','N 90910102','Oval socket head bolt M5x18'],
    ['6','992857689','Passenger airbag bracket'],
    ['7','992857955','Chassis number bracket'],
    ['8','992857114B 5Q0','Infotainment (MIB) support, black'],
  ]};

// Dashboard trim pieces, 809-100: the left-hand-drive set.
const dashAccessories={id:'dash-accessories',code:'809-100',title:'Dashboard trim accessories',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/809-100/ACCESSORIES',
  rows:[
    ['1','992858415B 5Q0','Instrument cluster trim, left, black'],
    ['2','992858416B 5Q0','Instrument cluster trim, right, black'],
    ['3','9A700783100','Bung'],
    ['4','992858020B 5Q0','Passenger side dashboard trim, black'],
    ['5','9A7867190A','Clip'],
    ['8','N 90455902','Speed nut M5x16.6x15'],
    ['9','N 90910102','Oval socket head bolt M5x18'],
  ]};

// Dashboard bracket, 809-200 (left-hand drive).
const dashBracket={id:'dash-bracket',code:'809-200',title:'Dashboard bracket',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/809-200/DASHBOARD_BRACKET',
  rows:[
    ['1','992857011','Dashboard bracket'],
    ['2','PAB85794900','Grommet'],
    ['3','992868553','A-pillar bracket'],
    ['4','PAF008402','Locating bolt M8x45'],
    ['5','N 90761103','Self-locking hexagon collar nut M8'],
    ['6','PAF008407A','Bolt with washer M8'],
    ['7','992858683','Centre bracket'],
    ['8','PAF909218','Hexagon flange screw M8x28'],
    ['9','992827079','Adjustment part'],
  ]};

// Centre console trim, 809-300: the 7-speed manual (G1M) pieces and the
// unrestricted rows. Drinks holder, side trims and cupholder insert are PDK-only.
const consoleTrim={id:'console-trim',code:'809-300',title:'Centre console trim and accessories',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/809-300/CENTER_CONSOLE',
  rows:[
    ['1','992864040A TDL','Console trim, black'],
    ['2','PAF009078','Grommet 7x3'],
    ['3','992864298A OV3','Front console trim, high-gloss black'],
    ['5','8T0853107','Clip'],
    ['6','N 10684701','Oval hexagon socket head bolt M5x20'],
    ['8','992858192B 5Q0','Attachment piece with insert, black'],
    ['11','992857503B TDL','Manual gearshift surround trim, black'],
    ['12','992867932A OS8','911 badge, dark silver'],
  ]};

// Centre armrest, 809-350: the basic leather cover. The insert and storage bin
// (refs 4 and 5) are PDK-only and left out.
const armrest={id:'armrest',code:'809-350',title:'Centre console armrest',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/809-350/CENTER_CONSOLE',
  rows:[
    ['1','992857098B','Centre armrest cover, leather'],
    ['2','PAB867190','Clamp'],
    ['3','PAF105928','Hexagon socket flat head bolt M5x16'],
    ['6','N 10535502','Hexagon socket head bolt M6x30, combi'],
  ]};

// Interior mirror, 809-700: the auto-dimming mirror (4L6) and its clip.
const mirror={id:'interior-mirror',code:'809-700',title:'Interior mirror and cover',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/809-700/Interior_mirror_Cover',
  rows:[
    ['1','992857511A','Interior mirror, auto-dimming, black'],
    ['2','9A785794500','Mirror spring clip'],
    ['3','992857593B','Mirror foot cover, front'],
    ['4','992867589B','Mirror cover'],
    ['5','992858066','Camera trim panel'],
    ['6','9A7867190A','Clip for the cover'],
  ]};

// Central display and computer. The only model-year-2023 page found is the Turbo
// copy of 911-007 (MJ 2023 on); none of these rows is marked Turbo-only. The
// computer is the North American (ER3, satellite radio) unit built to 31.03.2024.
const pcm={id:'central-display',code:'911-007',title:'Central display and computer, from model year 2023',year:'2020 (992-1 Turbo / S)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1_Turbo_S)/PartDiagrams/911-007/display_Central_computer_D_-_MJ_2023%3E%3E',
  rows:[
    ['1','992919597T','Central display, left-hand drive'],
    ['2','N 90910102','Oval socket head bolt M5x18'],
    ['3','992035072J','Central computer, North America'],
  ]};

// Aerials, amplifiers, USB and microphone, 912-000: the US and unrestricted
// rows. Japanese toll parts, park assist, lane change assist, telephony options
// and the Connect Plus emergency loudspeaker are left out.
const aerials={id:'aerials',code:'912-000',title:'Aerials, aerial amplifiers, USB socket and microphone',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/912-000/ANTENNA',
  rows:[
    ['3','PAB035500','WLAN aerial'],
    ['4','9J1035500A','Satellite navigation (GNSS) aerial'],
    ['6','992858327','Mirror base plate'],
    ['7','9A703550400','LTE aerial in the dashboard'],
    ['9','992035595A','Aerial retainer'],
    ['10','N 90910102','Oval socket head bolt M5x18'],
    ['16','9Y0035507C','Satellite radio (SDARS) aerial, USA'],
    ['17','PAB899187','Bung'],
    ['18','992035225','Aerial amplifier, right upper'],
    ['19','971035225B','Aerial amplifier, left upper'],
    ['20','9A790724710','Keyless entry and start aerial'],
    ['21','PAB90724700','Keyless entry and start aerial, second'],
    ['22','PAB03545601','Mobile phone signal amplifier'],
    ['24','PAB907414','Garage door opener sensor lead'],
    ['28','PAD035727','USB-C socket housing'],
    ['29','992035711','Microphone'],
    ['35','992927301A','Sensor module'],
    ['36','992907231','Sticky pad'],
    ['37','992035317','Wi-Fi aerial retainer'],
    ['38','992907239C','Keyless entry aerial bracket'],
  ]};

// Front seat electrics, 817-500 (sports seat and Sports Seat Plus): the
// left-hand-drive, heated (4A3), unventilated (4D0) harnesses, the US airbag
// (4UB) right harness and the Cabriolet (K8K) backrest harnesses. Ventilation
// parts are left out.
const seatElectrics={id:'seat-electrics',code:'817-500',title:'Front seat electrics',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/817-500/ELECTRICS',
  rows:[
    ['1','992971385L','Seat wiring harness, left, heated'],
    ['2','992971386AC','Seat wiring harness, right, USA'],
    ['3','992971391AC','Backrest adjustment wiring harness, left, Cabriolet, heated'],
    ['4','992971392AC','Backrest adjustment wiring harness, right, Cabriolet, heated'],
    ['5','992959747F 1E0','Seat adjustment switch module, left, grained black'],
    ['6','992959748F 1E0','Seat adjustment switch module, right, grained black'],
    ['11','992963553C','Seat occupancy sensor'],
  ]};

// Front seat foam and covers, 817-400 (sports seat, 5A): black part leather
// covers without ventilation. The right cushion foam has no number on the page.
const seatCovers={id:'seat-covers',code:'817-400',title:'Front seat foam and covers',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/817-400/FOAM_PART',
  rows:[
    ['1','992881555 Y','Seat cushion foam, left, USA'],
    ['3','992881405AGD0A','Seat cover, left, black leather'],
    ['4','992881406AGD0A','Seat cover, right, black leather'],
  ]};

// Rear seat foam and cover, 818-400. One number serves both sides.
const rearSeat={id:'rear-seat',code:'818-400',title:'Rear seat foam and cover',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/818-400/FOAM_PART',
  rows:[
    ['1','9P1885375','Rear seat cushion foam, left and right'],
    ['2','992885405 1D0','Rear seat cover, left and right, black leatherette'],
  ]};

// Cabriolet carpets, 807-110 (K8K, left-hand drive): the carpet without the
// storage package and the standard pedal footrest cover. The China plate clip
// and the storage-package luggage net are left out.
const carpets={id:'carpets',code:'807-110',title:'Carpets, Cabriolet',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/807-110/FLOORING_(CARPET)',
  rows:[
    ['1','992863101N OX7','Floor carpet, black'],
    ['2','95555122702','Carpet bracket'],
    ['3','955551229021E0','Carpet cover cap, black'],
    ['5','992863007C OX7','Rear compartment carpet underlay, black'],
    ['6','992864476B','Foam block for the control units'],
    ['7','982867927 1E0','Footrest cover, black'],
    ['8','992864470B','Carpet support'],
    ['9','992864471','Carpet support, second'],
    ['11','992867127A OX7','Footwell side trim, left, with fuse box cover, black'],
    ['11','992867128A OX7','Footwell side trim, right, with fuse box cover, black'],
    ['12','992867926 1E0','Fuse box cover, black'],
  ]};

// Inner sill trims, 807-150 (left-hand drive).
const sills={id:'sill-trim',code:'807-150',title:'Inner sill trim',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/807-150/SIDE_MEMBER_TRIM',
  rows:[
    ['1','992863479','Inner sill trim support, left'],
    ['1','992863480','Inner sill trim support, right'],
    ['2','992863425','Inner sill trim, left, driver side'],
    ['3','992863426','Inner sill trim, right, passenger side'],
    ['4','992959832','Switch in the driver side sill trim'],
    ['5','992863714','Underlay mat for the passenger sill trim'],
    ['6','N 90994601','Expanding nut 4.8x10'],
    ['7','N 90819501','Oval head screw 4.8x13'],
  ]};

// Rear trims, 807-300 (Cabriolet): rear panel, rollover protection flaps and
// the top tray. The Australian cover is left out.
const rearTrim={id:'rear-trim',code:'807-300',title:'Rear trims, Cabriolet',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/807-300/TRIMS',
  rows:[
    ['1','992867403T OX7','Rear panel trim, black'],
    ['3','9A786421500','U-clip'],
    ['4','992867755B A10','Rollover protection cover, black'],
    ['5','PAF106332','Panel screw ST4.8x19'],
    ['6','992868431A A10','Rollover protection flap, left, black'],
    ['6','992868432A A10','Rollover protection flap, right, black'],
    ['7','992868851A A10','Upper flap, left, black'],
    ['7','992868852A A10','Upper flap, right, black'],
    ['8','5N0867190','Clip'],
    ['9','992867360 OD7','Soft top trim tray, black'],
    ['10','9P1871777','Soft top support element'],
  ]};

const build=d=>catalogueStudy(d,'p992-interior-');
const [airbags,front,rear,control,dashboard,dashTrims,bracket,consoleStudy,armrestStudy,mirrorStudy,display,aerialStudy,electrics,covers,rearSeatStudy,carpetStudy,sillStudy,rearTrimStudy]=
  [airbag,frontBelts,rearBelts,airbagControl,dash,dashAccessories,dashBracket,consoleTrim,armrest,mirror,pcm,aerials,seatElectrics,seatCovers,rearSeat,carpets,sills,rearTrim].map(build);
export const studies=[airbags,front,rear,control,dashboard,dashTrims,bracket,consoleStudy,armrestStudy,mirrorStudy,display,aerialStudy,electrics,covers,rearSeatStudy,carpetStudy,sillStudy,rearTrimStudy];
const id=(d,ref,mpn)=>`p992-interior-${d.id}.r${ref.toLowerCase().replace(/[^a-z0-9]/g,'')}-${mpn.toLowerCase().replace(/[^a-z0-9]/g,'')}`;
export const views=new Map([
  ['cabin.controls',airbags],
  ['seat_track.anchor',front],
  ['seat_track.brackets',rear],
  ['p992-seats.leads',electrics],
  ['p992-seat-element.cover',covers],
  ['p992-seat-element.foam',rearSeatStudy],
  ['carpet_edge.pile',carpetStudy],
  ['carpet_edge.binding',sillStudy],
  ['carpet_edge.pad',consoleStudy],
  // Nested studies, opened from parts of this pack's own studies.
  [id(airbag,'1','992880201S TRP'),control],
  [id(airbag,'4','992880204B'),dashboard],
  [id(dash,'1','992857003BCDK4'),dashTrims],
  [id(dash,'6','992857689'),bracket],
  [id(dash,'8','992857114B 5Q0'),display],
  [id(pcm,'3','992035072J'),aerialStudy],
  [id(aerials,'6','992858327'),mirrorStudy],
  [id(consoleTrim,'1','992864040A TDL'),armrestStudy],
  [id(carpets,'5','992863007C OX7'),rearTrimStudy],
]);
