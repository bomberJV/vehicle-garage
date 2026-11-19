// 992 study pack: cooling.
// Scope: Engine cooling: coolant pumps, thermostats, coolant pipes and hoses, expansion tank, coolant valves (radiators 105-200 are already done).
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-cooling-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["p992-coolant.distributor", "p992-coolant.feed", "p992-coolant.return", "p992-coolant.heater-feed", "992frontcoolant.inlet", "992frontcoolant.outlet", "992frontcoolant.shroud", "992frontcoolant.fan", "992frontcoolant.feed", "992frontcoolant.return", "992frontcoolant.pump", "992frontcoolant.thermostat", "992frontcoolant.jacket"];
export const studies=[];
export const views=new Map();
