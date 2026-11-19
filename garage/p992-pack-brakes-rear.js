// 992 study pack: brakes-rear.
// Scope: Rear brakes and the electric parking brake: calipers, discs, pads, parking brake actuator, rear brake lines.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-brakes-rear-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["service-porsche992scab-brakes-rear-caliper.body", "service-porsche992scab-brakes-rear-caliper.pistons", "service-porsche992scab-brakes-rear-caliper.pads", "service-porsche992scab-brakes-rear-caliper.seals", "service-porsche992scab-brakes-rear-caliper.rotor", "service-porsche992scab-brakes-rear-disc.carrier", "service-porsche992scab-brakes-rear-disc.track", "brakes.parking"];
export const studies=[];
export const views=new Map();
