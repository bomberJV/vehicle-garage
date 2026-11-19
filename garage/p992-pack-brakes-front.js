// 992 study pack: brakes-front.
// Scope: Front brakes: calipers, discs, pads, pad wear sensors, dust shields, front brake lines and hoses.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-brakes-front-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["service-porsche992scab-brakes-front-caliper.body", "service-porsche992scab-brakes-front-caliper.pistons", "service-porsche992scab-brakes-front-caliper.pads", "service-porsche992scab-brakes-front-caliper.seals", "service-porsche992scab-brakes-front-caliper.rotor", "service-porsche992scab-brakes-front-disc.carrier", "service-porsche992scab-brakes-front-disc.track", "brakes.lines"];
export const studies=[];
export const views=new Map();
