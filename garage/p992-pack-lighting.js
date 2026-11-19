// 992 study pack: lighting.
// Scope: Lighting: LED headlamps and their modules, tail lamps and light strip, indicators, side markers, fog/reversing lamps, number-plate lights, interior lights.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-lighting-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["lights.headlamps", "lights.indicators", "lights.tail", "p992-markers.left", "p992-markers.right"];
export const studies=[];
export const views=new Map();
