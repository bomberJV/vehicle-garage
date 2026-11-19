// 992 study pack: brake-hydraulics.
// Scope: Brake master cylinder, brake booster, fluid reservoir, PSM/ABS hydraulic unit and its brackets, wheel-speed sensors, brake pedal.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-brake-hydraulics-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["service-porsche992scab-brakes-master.barrel", "service-porsche992scab-brakes-master.pistons", "service-porsche992scab-brakes-master.spring", "service-porsche992scab-brakes-master.reservoir", "service-porsche992scab-brakes-abs.block", "service-porsche992scab-brakes-abs.valves", "service-porsche992scab-brakes-abs.pump", "service-porsche992scab-brakes-abs.connector"];
export const studies=[];
export const views=new Map();
