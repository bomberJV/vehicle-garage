// 992 study pack: lubrication.
// Scope: Lubrication: oil pump, oil filter and housing, oil cooler, oil pan/sump, oil lines, oil level and pressure sensors, oil filler and dipstick.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-lubrication-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["992caseright.wall", "992caseright.deck", "992caseright.webs", "992caseleft.deck", "992caseleft.webs", "ringpack.oil", "992casebolt.shaft", "992casebolt.washer", "992casebolt.threads"];
export const studies=[];
export const views=new Map();
