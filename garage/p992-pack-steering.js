// 992 study pack: steering.
// Scope: Steering: rack and pinion, tie rods, intermediate shaft, steering column and its adjustment drive, steering wheel and column switches.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-steering-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["p992-steering.shaft", "p992-steering.rack", "p992-steering.tie-left", "p992-steering.tie-right", "p992-column-drive.housing", "p992-column-drive.screw", "p992-column-drive.slider"];
export const studies=[];
export const views=new Map();
