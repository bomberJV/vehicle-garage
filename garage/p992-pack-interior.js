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
import {catalogueStudy} from './porsche992-catalog-studies.js';

// Airbags, read from the Eurospares copy of catalogue diagram 812-050. Coupe-only
// rows (seat side airbags for PK8C/PQ1K, head airbags and their nuts) are left
// out; the knee airbag is the USA and California assembly kit (PB0T).
const airbag={id:'airbags',code:'812-050',title:'Airbags',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/812-050/Airbag',
  rows:[
    ['1','992880201S TRP','Airbag unit for steering wheel, black'],
    ['3','N 91073301','Hexagon socket flat head bolt M6x12'],
    ['4','992880204B','Passenger airbag unit'],
    ['5','N 91093502','Hexagon socket oval head bolt M6x30, self-locking'],
    ['6','992880841','Knee airbag unit, USA'],
    ['7','N 91188301','Hexagon socket head bolt M6x20, knee airbag'],
  ]};

export const studies=[catalogueStudy(airbag,'p992-interior-')];
export const views=new Map([['cabin.controls',studies[0]]]);
