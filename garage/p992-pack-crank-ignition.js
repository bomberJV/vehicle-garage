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
export const studies=[];
export const views=new Map();
