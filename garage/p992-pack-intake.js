// 992 study pack: intake.
// Scope: Intake and charge air: air filters and housings, intake ducts, charge-air coolers and their fans, charge pipes, throttle body, intake distributor, crankcase ventilation.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-intake-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["engine.intake", "p992-intake.inlet-left", "p992-intake.inlet-right", "p992-air-filter.element", "p992-air-filter.seal", "p992-air-filter.tray", "992deckcore.hot", "992deckcore.cold", "992deckcore.tubes", "992deckcore.fins", "992deckfanleft.frame", "992deckfanleft.impeller", "992deckfanleft.motor", "992deckfanright.frame", "992deckfanright.impeller", "992deckfanright.motor"];
export const studies=[];
export const views=new Map();
