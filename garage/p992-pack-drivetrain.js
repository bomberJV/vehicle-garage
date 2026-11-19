// 992 study pack: drivetrain.
// Scope: Drivetrain and clutch actuation: drive shafts and CV joints, differential, flywheel, clutch pedal box, clutch master/slave hydraulics, transmission mounts.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-drivetrain-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["shaft.bar", "shaft.inner", "shaft.boots", "cvjoint.housing", "cvjoint.balls", "cvjoint.cage", "cvjoint.inner", "cvjoint.boot", "diff.ring", "diff.carrier", "diff.pin", "diff.left", "diff.right", "clutch.flywheel", "clutch.disc", "clutch.pressure", "clutch.spring", "p992-clutch.pedal", "p992-clutch.line", "p992-clutch-master.housing", "p992-clutch-master.piston", "p992-clutch-master.pushrod", "p992-clutch-master.spring"];
import {catalogueStudy,catalogueShapes as sh} from './porsche992-catalog-studies.js';

const es=(year,code,slug)=>`https://www.eurospares.co.uk/Porsche/992/${year}/PartDiagrams/${code}/${slug}`;

// 501-100: rear drive shafts. Rows for the 7-speed manual (PG1M) only; the
// 8-speed automatic versions on the same page are left out.
const driveShaft={id:'drive-shaft',code:'501-100',title:'Drive shaft',year:'2019 (992-1)',
 url:es('2019_(992-1)','501-100','DRIVE_SHAFT'),
 rows:[['1','992501203F','Drive shaft, 7-speed manual'],['2','9P1501591','End cap',sh.cap],['3','9P1501136','Bellows',sh.ring],['4','9P1501157B','Hose clip 40x7, 7-speed manual'],['5','9P1501161C','Inner joint, 7-speed manual',sh.round],['6','N 0123751','Securing ring 30x1.5, 7-speed manual'],['7','9A740735700','Spacer',sh.round],['8','WHT008727','Socket head bolt, drive shaft'],['9','WHT007021','Self-locking hexagon nut M22x1.5 with washer'],['10','00004330508','Assembly paste, 100 g'],['11','00004330545','High-temperature grease for drive shaft bellows, 100 g'],['12','00004321008','Sealant, 20 g']]};

// 703-000: clutch master cylinder, slave cylinder and lines. Where the page
// lists two numbers under one reference without saying which applies, both
// are kept and marked as listed versions.
const clutchHydraulics={id:'clutch-hydraulics',code:'703-000',title:'Hydraulic coupling, clutch master cylinder',year:'2020 (992-1)',
 url:es('2020_(992-1)','703-000','Hydraulic_coupling_Clutch_master_cylinder'),
 rows:[['1','PAB721453','Run-on hose, first listed version'],['1','6Q1721453C','Run-on hose, second listed version'],['2','8E0611797D','Bracket'],['3','9P1721639','Clutch master cylinder',sh.ram],['4','9P1721433','Elbow fitting',sh.round],['5','992721386','Hydraulic clutch pipe, first listed version'],['5','992721387','Hydraulic clutch pipe, second listed version'],['6','992721471','Breather line, first listed version'],['6','992721472','Breather line, second listed version'],['7','9P1721379','Adapter, hydraulic clutch pipe',sh.round],['8','PAF108527','Spacer holder',sh.bracket],['9','992721455','Return line'],['10','992721483','Hydraulic clutch pipe'],['11','9P1721271','Sleeve'],['12','9P1721263A','Clutch slave cylinder',sh.ram],['13','PAF008835','Hexagon head bolt M8x30'],['14','992721477','Hydraulic clutch pipe'],['15','N 10857801','Bracket']]};

// 301-000: the complete gearbox. The 2023 Carrera S manual has Porsche Torque
// Vectoring with the mechanical rear differential lock (PGH2), so only the
// rear-drive version with differential lock is kept.
const gearbox={id:'gearbox',code:'301-000',title:'Manual gearbox, transmission fluid',year:'2021 (992-1)',
 url:es('2021_(992-1)','301-000','Manual_gearbox_Transmission_fluid'),
 rows:[['1','0C4300042','Manual gearbox, rear drive, with differential lock',sh.housing],['3','9A700846400','Hexagon head bolt'],['4','00004330472','Transmission fluid Mobilube PTX FE 75W-80, 1 litre']]};

// 306-000: transmission carrier and side member. Manual-gearbox rows only; the
// PDK carrier, side member, stop and mounting are left out.
const mounts={id:'transmission-mounts',code:'306-000',title:'Mounting parts for engine and transmission',year:'2020 (992-1)',
 url:es('2020_(992-1)','306-000','MOUNTING_PARTS_FOR_ENGINE_AND'),
 rows:[['1','992399231A','Transmission carrier, manual gearbox'],['2','992399107B','Side member, manual gearbox',sh.bracket],['5','PAF008603','Threaded pin M10x110, transmission carrier to body'],['6','PAF008660','Hexagon nut M10'],['7','PAF009267','Hexagon bolt M10x40, transmission carrier to body']]};

// 102-000 (crankshaft, conrods and flywheel): only the manual-gearbox flywheel
// and its bolt are taken here; the crank drive belongs to the crank-ignition pack.
// The page lists 9P1105262C and 9P1105262E for the manual; the later E is kept.
const flywheel={id:'flywheel',code:'102-000',title:'Dual-mass flywheel, 7-speed manual',year:'2020 (992-1)',
 url:es('2020_(992-1)','102-000','CRANKSHAFT'),
 rows:[['12','9P1105262E','Dual-mass flywheel, manual gearbox',(r,c)=>{sh.round(r,c);sh.round(r,[c[0],c[1]+.05,c[2]]);}],['13','PAF906651','Socket head bolt M10x1x29 with multipoint head']]};

const [shaft,hydraulics,box,mount,fly]=[driveShaft,clutchHydraulics,gearbox,mounts,flywheel].map(d=>catalogueStudy(d,'p992-drivetrain-'));
export const studies=[shaft,hydraulics,box,mount,fly];
export const views=new Map([
  ['shaft.bar',shaft],
  ['p992-clutch.line',hydraulics],
  ['diff.carrier',box],
  ['clutch.flywheel',fly],
  // The gearbox opens its own mounting.
  ['p992-drivetrain-gearbox.r1-0c4300042',mount],
]);
