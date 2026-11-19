// 992 study pack: electrics.
// Scope: Electrical power and control: battery and its tray, starter, alternator, main cables and earth straps, fuse and relay carriers, control units (engine, gateway, body), wiring harnesses.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-electrics-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["electrical.battery", "electrical.cables", "service-porsche992scab-electrical-starter.case", "service-porsche992scab-electrical-starter.rotor", "service-porsche992scab-electrical-starter.stator", "service-porsche992scab-electrical-starter.drive", "service-porsche992scab-electrical-generator.case", "service-porsche992scab-electrical-generator.rotor", "service-porsche992scab-electrical-generator.stator", "service-porsche992scab-electrical-generator.drive", "service-porsche992scab-electrical-fuses.carrier", "service-porsche992scab-electrical-fuses.links", "service-porsche992scab-electrical-fuses.feed"];
export const studies=[];
export const views=new Map();
