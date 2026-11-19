// 992 study pack: turbochargers.
// Scope: Turbochargers: the two turbos, wastegate actuators, turbo oil and coolant lines, turbo heat shields and mounting hardware.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-turbochargers-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["p992-turbo-left.housing", "p992-turbo-left.turbine", "p992-turbo-left.bearing", "p992-turbo-left.compressor", "p992-turbo-left.cover", "p992-turbo-right.housing", "p992-turbo-right.turbine", "p992-turbo-right.bearing", "p992-turbo-right.compressor", "p992-turbo-right.cover", "p992-wastegate.motor", "p992-wastegate.rod", "p992-wastegate.lever", "p992-wastegate.flap"];
export const studies=[];
export const views=new Map();
