// 992 study pack: rear-axle.
// Scope: Rear axle: multilink arms, toe links, rear subframe/cross member, rear dampers and springs, rear anti-roll bar, rear-axle steering if catalogued.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-rear-axle-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["p992-suspension.upper-front-left", "p992-suspension.upper-front-right", "p992-suspension.upper-rear-left", "p992-suspension.upper-rear-right", "p992-suspension.lower-left", "p992-suspension.lower-right", "p992-suspension.longitudinal-left", "p992-suspension.longitudinal-right", "p992-suspension.toe-left", "p992-suspension.toe-right"];
export const studies=[];
export const views=new Map();
