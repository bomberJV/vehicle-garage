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

// Front lights in the bumper intakes, the US amber side markers (equipment
// 8F5), the mirror peripheral lights and the daytime running light control
// unit. The wing-mounted turn signal repeaters (ref 1, equipment 8F2) are the
// non-US alternative to the side markers and are left out.
const frontLights={id:'front-lights',code:'905-040',title:'Turn signal repeater, side marker light, control unit for day driving light',year:'2020 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2020_(992-1)/PartDiagrams/905-040/TURN_SIGNAL_REPEATER',
  rows:[
    ['2','992945061C','Amber side marker light, left'],
    ['2','992945062C','Amber side marker light, right'],
    ['3','992949133A','Exterior mirror peripheral light, left'],
    ['3','992949134A','Exterior mirror peripheral light, right'],
    ['4','992941311C','Front light, left'],
    ['4','992941312C','Front light, right'],
    ['5','N 10473402','Oval-head screw M6x20'],
    ['6','PAA941597','Daytime running light control unit'],
  ]};

// Ambient and courtesy lighting. Light guides and the door panel light are
// tied to the ambient lighting options (QQ1, QQ2, UD1).
const interiorLights={id:'interior-lights',code:'903-040',title:'Interior light, door warning light, footwell light',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/903-040/INTERIOR_LIGHT',
  rows:[
    ['1','992947199','Fibre-optic light guide, centre console, left'],
    ['1','992947200','Fibre-optic light guide, centre console, right'],
    ['2','992947356','LED module for the fibre-optic light guide'],
    ['4','992947411','Door warning light'],
    ['5','9Y0947577B','Door panel light, exterior ambient lighting'],
    ['6','992947093','Fibre-optic light guide, rear side panel trim, left'],
    ['6','992947094','Fibre-optic light guide, rear side panel trim, right'],
    ['6','992947229','Fibre-optic light guide, rear side panel trim, ambient lighting'],
    ['7','4E0947415','Footwell light'],
    ['8','PAB947409','Luggage compartment lamp'],
    ['9','992971679A','Glovebox light wiring set, from 26.08.2022'],
  ]};

// The LED headlight with Porsche Dynamic Light System (PDLS), equipment AV2.
const pdlsHeadlamps={id:'headlamps-pdls',code:'905-010',title:'LED headlight with PDLS',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/905-010/LED_HEADLIGHT',
  rows:[
    ['1','992941077D','LED headlight with PDLS, left'],
    ['1','992941078D','LED headlight with PDLS, right'],
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
    ['11','992919172A','LED module'],
    ['12','PAF009296','Hexagon socket flat-head bolt 4x14'],
    ['13','992941572BB','LED headlight control unit'],
  ]};

// The LED matrix-beam headlight (PDLS Plus), equipment AV2.
const matrixHeadlamps={id:'headlamps-matrix',code:'905-020',title:'LED headlight with matrix beam',year:'2020 (992-1)',
  url:'https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/905-020/LED_HEADLIGHT_WITH',
  rows:[
    ['1','992941681D','LED matrix-beam headlight, left'],
    ['1','992941682D','LED matrix-beam headlight, right'],
    ['2','PAF911835','Hexagon socket oval-head combi bolt M6x30 with washer'],
    ['3','992941119C','Headlight gasket, left'],
    ['3','992941120C','Headlight gasket, right'],
    ['4','992941809','End cap with seal, left'],
    ['4','992941810','End cap with seal, right'],
    ['5','PAF009301','Round-head screw 4.2x16'],
    ['7','992903171','Headlamp fan'],
    ['8','992941544','Protective cap'],
    ['9','9P1941730','Ventilation element'],
    ['10','992941052','Second headlamp fan'],
    ['11','992941045','Retaining frame'],
    ['12','992941363','Service cover for the matrix-beam headlight'],
    ['13','PAF009295','Hexagon socket flat-head bolt 3x8'],
    ['14','992941592B','LED headlight control unit'],
  ]};

// The darkened matrix-beam headlight (equipment 8JU) up to 07.07.2020. Only
// the USA headlights (equipment B0T) are kept from ref 1; the other traffic
// variants are left out.
const darkMatrixHeadlamps={id:'headlamps-matrix-black',code:'905-030',title:'LED headlight with matrix beam, black',year:'2019 (992-1)',
  url:'https://www.eurospares.co.uk/Porsche/992/2019_(992-1)/PartDiagrams/905-030/LED_HEADLIGHT_WITH',
  rows:[
    ['1','9P5941681A','LED matrix-beam headlight, darkened, USA, left'],
    ['1','9P5941682A','LED matrix-beam headlight, darkened, USA, right'],
    ['2','PAF911835','Hexagon socket oval-head combi bolt M6x30 with washer'],
    ['3','992941119C','Headlight gasket, left'],
    ['3','992941120C','Headlight gasket, right'],
    ['4','992941809','End cap with seal, left'],
    ['4','992941810','End cap with seal, right'],
    ['5','PAF009301','Round-head screw 4.2x16'],
    ['7','992903171','Headlamp fan'],
    ['8','992941544','Protective cap'],
    ['9','9P1941730','Ventilation element'],
    ['10','992941052','Second headlamp fan'],
    ['11','992941045','Retaining frame'],
    ['12','992941363','Service cover for the matrix-beam headlight'],
    ['13','PAF009295','Hexagon socket flat-head bolt 3x8'],
    ['14','992941592B','LED headlight control unit'],
  ]};

const P='p992-lighting-';
export const studies=[headlamps,rearLights,frontLights,interiorLights,pdlsHeadlamps,matrixHeadlamps,darkMatrixHeadlamps].map(d=>catalogueStudy(d,P));
const [headStudy,rearStudy,frontStudy,interiorStudy,pdlsStudy,matrixStudy,darkStudy]=studies;
export const views=new Map([
  [hooks[0],headStudy],
  [hooks[1],frontStudy],
  [hooks[2],rearStudy],
  [hooks[3],frontStudy],
  [hooks[4],frontStudy],
  // The optional headlights open from the standard headlight, the darkened
  // matrix beam from the matrix beam, and the interior lights from the
  // licence plate light.
  [P+'headlamps.r1-992941029d',pdlsStudy],
  [P+'headlamps.r1-992941030d',matrixStudy],
  [P+'headlamps-matrix.r1-992941681d',darkStudy],
  [P+'rear-lights.r16-pab943021',interiorStudy],
]);
