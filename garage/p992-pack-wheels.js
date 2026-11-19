// 992 study pack: wheels.
// Scope: Wheels, tyres and hubs: wheel bolts, centre caps, TPMS sensors, wheel bearings and hubs.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-wheels-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["running.rims", "tire-section.tread", "tire-section.belts", "tire-section.casing", "tire-section.liner", "tire-section.beads"];
export const studies=[];
export const views=new Map();
