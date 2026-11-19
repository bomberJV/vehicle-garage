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
export const studies=[];
export const views=new Map();
