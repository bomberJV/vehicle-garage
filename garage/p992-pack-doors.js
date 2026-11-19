// 992 study pack: doors.
// Scope: Doors, windows and mirrors: door shells, locks and latches, handles, window regulators and motors, door glass and seals (Cabriolet), exterior mirrors, door panels.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-doors-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["door-porsche992scab-front-left.skin", "door-porsche992scab-front-left.frame", "door-porsche992scab-front-left.glass", "door-porsche992scab-front-left.seals", "door-porsche992scab-front-left.impact", "door-porsche992scab-front-left.outer-handle", "door-porsche992scab-front-left.check", "door-porsche992scab-front-left.barrier", "door-porsche992scab-front-left.inner-handle", "door-porsche992scab-front-left.speaker", "door-latch.plate", "door-latch.fork", "door-latch.pawl", "door-latch.striker", "door-latch.release", "door-latch.lock", "door-hinge.pillar", "door-hinge.door", "door-hinge.pin", "regulator-porsche992scab.glass", "regulator-porsche992scab.motor", "regulator-porsche992scab.track", "regulator-porsche992scab.carriage", "laminate.outer", "laminate.interlayer", "laminate.inner", "door-porsche992scab-front-right.skin", "door-porsche992scab-front-right.frame", "door-porsche992scab-front-right.glass", "door-porsche992scab-front-right.seals", "door-porsche992scab-front-right.impact", "door-porsche992scab-front-right.outer-handle", "door-porsche992scab-front-right.check", "door-porsche992scab-front-right.barrier", "door-porsche992scab-front-right.inner-handle", "door-porsche992scab-front-right.speaker"];
export const studies=[];
export const views=new Map();
