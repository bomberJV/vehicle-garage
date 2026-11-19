// 992 study pack: front-axle.
// Scope: Front axle: struts and PASM dampers, springs, wishbones, wheel carriers, front subframe/cross member, anti-roll bar, front-axle lift if catalogued.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-front-axle-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["p992-suspension.front-arms-left", "p992-suspension.front-arms-right", "p992-damper.tube", "p992-damper.rod", "p992-damper.coil", "p992-damper.mount"];
export const studies=[];
export const views=new Map();
