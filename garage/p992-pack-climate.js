// 992 study pack: climate.
// Scope: Air conditioning and heating: A/C compressor, condensers, refrigerant lines, receiver-drier, expansion valve, evaporator, heater core, blower, air distribution box, climate control unit, cabin filter.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-climate-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["p992-hvac.compressor", "p992-hvac.discharge", "p992-hvac.condenser-left", "p992-hvac.condenser-right", "p992-hvac.bridge", "p992-hvac.metering", "p992-hvac.evaporator", "p992-hvac.suction", "p992-hvac.heater", "p992-cabin-blower.wheel", "p992-cabin-blower.motor", "p992-cabin-blower.case", "p992-receiver.shell", "p992-receiver.charge", "p992-receiver.head"];
export const studies=[];
export const views=new Map();
