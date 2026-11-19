// 992 study pack: fuel.
// Scope: Fuel system: tank and its fittings, filler, fuel pump and sender, fuel lines, high-pressure pump, injectors and rails, evaporative emission canister.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-fuel-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["fuel.filler", "fuel.supply", "service-porsche992scab-fuel-tank.shell", "service-porsche992scab-fuel-tank.neck", "service-porsche992scab-fuel-tank.mount", "service-porsche992scab-fuel-sender.flange", "service-porsche992scab-fuel-sender.arm", "service-porsche992scab-fuel-sender.float", "service-porsche992scab-fuel-pump.case", "service-porsche992scab-fuel-pump.armature", "service-porsche992scab-fuel-pump.stage", "service-porsche992scab-fuel-pump.outlet", "service-porsche992scab-fuel-rail.rail", "service-porsche992scab-fuel-rail.body", "service-porsche992scab-fuel-rail.tips", "service-porsche992scab-fuel-rail.seals"];
export const studies=[];
export const views=new Map();
