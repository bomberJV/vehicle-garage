// 992 study pack: lighting.
// Scope: Lighting: LED headlamps and their modules, tail lamps and light strip, indicators, side markers, fog/reversing lamps, number-plate lights, interior lights.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-lighting-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
import {catalogueStudy} from './porsche992-catalog-studies.js';
export const hooks=["lights.headlamps", "lights.indicators", "lights.tail", "p992-markers.left", "p992-markers.right"];

// The standard LED headlamp of the 992.1 Carrera (no PDLS, no matrix beam).
const headlamps={id:'headlamps',code:'905-000',title:'LED headlight',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/905-000/LED_HEADLIGHT',
  rows:[
    ['1','992941029D','LED headlight, left'],
    ['1','992941030D','LED headlight, right'],
    ['2','PAF911835','Hexagon socket oval-head combi bolt M6x30 with washer'],
    ['3','992941119C','Headlight gasket, left'],
    ['3','992941120C','Headlight gasket, right'],
    ['4','992941809','End cap with seal, left'],
    ['4','992941810','End cap with seal, right'],
    ['5','PAF009301','Round-head screw 4.2x16'],
    ['6','992941046','Retaining frame, left'],
    ['6','992941046A','Retaining frame, right'],
    ['7','PAF009300','Round-head screw M3x8'],
    ['8','992903171','Headlamp fan'],
    ['9','992941544','Protective cap'],
    ['10','9P1941730','Ventilation element'],
    ['11','992919171A','LED module'],
    ['12','PAF009296','Hexagon socket flat-head bolt 4x14'],
    ['13','992941571BB','LED headlight control unit'],
  ]};

// Rear lights, the centre light strip, the additional brake light and the
// licence plate light. The spoiler-mounted brake light and its clamp (refs 14
// and 15, aero and equipment-package variants) are left out.
const rearLights={id:'rear-lights',code:'905-050',title:'Rear light, additional brake light and licence plate light',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/905-050/REAR_LIGHT',
  rows:[
    ['1','9P5945091C','Rear light, left'],
    ['2','9P5945092C','Rear light, right'],
    ['3','PAF009641','Hexagon socket head bolt M6x45'],
    ['4','PAF009578','Spacer sleeve 12.75H8x32'],
    ['5','9P1941158','Cover cap'],
    ['6','9P5945081D','Rear light, centre light strip'],
    ['7','PAF912766','Hexagon socket head locating bolt M6x11'],
    ['8','PAF008791','Hexagon socket head combi bolt M6x38'],
    ['9','992945067B','Rear light holder, left'],
    ['9','992945068B','Rear light holder, right'],
    ['10','N 10644404','Hexagon socket flat-head oval screw M6x22'],
    ['11','9P5945087B','Additional brake light, Exclusive fittings'],
    ['12','N 01508210','Hexagon collar nut M6'],
    ['13','95833318300','Bung'],
    ['16','PAB943021','LED licence plate light'],
    ['17','992945103B','Rear light reflector, left'],
    ['17','992945104B','Rear light reflector, right'],
    ['18','992945731','Rear light rubber buffer'],
  ]};

export const studies=[catalogueStudy(headlamps,'p992-lighting-'),catalogueStudy(rearLights,'p992-lighting-')];
export const views=new Map([[hooks[0],studies[0]],[hooks[2],studies[1]]]);
