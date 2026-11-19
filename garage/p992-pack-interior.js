// 992 study pack: interior.
// Scope: Interior: dashboard, centre console, instrument cluster, infotainment, airbags, seat belts, seat electrics and heating, carpets and trim, sun visors, interior mirror.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-interior-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["cabin.controls", "p992-seats.leads", "p992-seat-element.cover", "p992-seat-element.mat", "p992-seat-element.trace", "p992-seat-element.foam", "seat_track.anchor", "seat_track.slider", "seat_track.brackets", "carpet_edge.pile", "carpet_edge.backing", "carpet_edge.pad", "carpet_edge.binding"];
export const studies=[];
export const views=new Map();
