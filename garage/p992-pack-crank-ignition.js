// 992 study pack: crank-ignition.
// Scope: Crank drive and ignition: crankshaft, connecting rods, pistons and rings, main and rod bearings, vibration damper, flywheel bolts, spark plugs and coils, ignition wiring (timing chain 103-110 and cylinder head 103-000 are done).
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-crank-ignition-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["992barecrank.mains", "992barecrank.pins", "992barecrank.webs", "992barecrank.ends", "992crankdrive.left", "992crankdrive.right", "ringpack.top", "ringpack.second", "992plainshells.left", "992plainshells.right", "992plainshells.journal", "992thrustshells.left", "992thrustshells.right", "992thrustshells.journal", "992thrustshells.thrust", "spark.terminal", "spark.insulator", "spark.resistor", "spark.glass", "spark.shell", "spark.seal", "spark.ground", "electrode.core", "electrode.jacket", "slider.piston", "slider.pin", "slider.rod", "slider.crank"];
import {catalogueStudy} from './porsche992-catalog-studies.js';

// Read from the cited Eurospares page. Ref 5 ("version being prepared") has no
// number and is skipped; ref 12 keeps the manual-gearbox flywheel and drops PDK.
const crankshaft={id:'crankshaft',code:'102-000',title:'Crankshaft, connecting rods and flywheel',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/102-000/CRANKSHAFT',
  rows:[
    ['1','0PB105021A','Crankshaft'],
    ['2','0PB105247','Shaft oil seal 52x72x9'],
    ['3','0PB105249','Shaft oil seal 85x105x11'],
    ['4','0PB105393B','Connecting rod set, 6 pieces'],
    ['6','PAF008184','Connecting rod bolt M10x1.25x51'],
    ['7','0PB105701C','Bearing shell, connecting rod'],
    ['8','0PB105591S','Main bearing shell'],
    ['9','0PB105561P','Main bearing shell, partial groove'],
    ['10','0PB105589C','Main bearing shell'],
    ['11','0PB105638','Thrust washer D=63'],
    ['12','9P1105262E','Dual-mass flywheel, manual gearbox'],
    ['13','PAF906651','Socket head bolt M10x1x29, multipoint head'],
    ['14','0PB105289D','Vibration damper pulley'],
    ['15','PAF008157','Hexagon head bolt M8x1x20'],
    ['16','992906401A','Speed sensor'],
    ['17','N 10546403','Hexagon socket head bolt M6x16'],
    ['18','0PB115289B','Oil separator'],
    ['19','PAF008126','Hexagon head bolt BM6x20'],
  ]};

export const studies=[catalogueStudy(crankshaft,'p992-crank-ignition-')];
export const views=new Map([['992barecrank.mains',studies[0]]]);
