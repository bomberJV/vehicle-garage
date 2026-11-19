import {g500FieldOptions} from './g500-field-options.js';
import {carrier993Id,skiCarrier993Id} from './porsche-roof-state.js';
import {e90FieldOptions} from './e90-accessory-options.js';
// The IDs g-rack and f-bed also occur in older saved builds and presets.
const roof = 'Roof racks';
const aero = 'Body kits & aero';
const bed = 'Truck bed';
const runner = 'Dometic / Front Runner';
const dometic = 'https://www.dometic.com/en-us/product/mercedes-g-class-roof-rack-gelandewagen-';
const rackDrawing = 'https://documents.dometic.com/files/';
const techartDrawing = 'https://www.techart.de/fileadmin/mediapoint/6b6d8f2a844669b49e8197fb041bf6f.pdf';
const reference = (label,url) => ({label,url});

function listing(id, vehicle, kind, details) {
  return {id, vehicles:[vehicle], category:'exterior', kind, price:null, quantity:1,
    unit:'kit', visual:'accessory', type:'product', ...details};
}

export const G500_RACK = listing('g-rack','g500',roof,{
  name:'Front Runner Slimline II · full length', sku:'KRGW004L', seller:runner, price:2299,
  unit:'rack kit', visual:'rack', exclusive:'g-roof', url:dometic+'full-cargo-rack-front-runner-slimline-ii',
  fit:'2002 W463 G500 with factory rain gutters. The standard-height kit restricts the tilt/vent position of the sunroof.',
  description:'A 2,166 × 1,475 mm slatted tray spans eight gutter legs. A two-piece deflector sits beneath the leading edge.',
  source:reference('Front Runner · full rack mounting drawing, p. 2',rackDrawing+'900000479-mercedes-benz-g-class-roof-rack-gelandewagen-full-cargo-rack-front-runner-slimline-ii-fitting.pdf#page=2')
});

export const FORD_BED = listing('f-bed','f350',bed,{
  name:'Bed protection · supplier search', sku:'Match your bed configuration', seller:'RealTruck',
  url:'https://realtruck.com/v/ford/f350/', type:'supplier search', unit:'project', visual:'bedmat', exclusive:'f-bed-floor',
  fit:'Select 1993 F-350 and match the actual box length and wheel housings.',
  description:'Generic bed insert for comparing finishes or recording a supplier quote.',
  source:reference('RealTruck · F-350 accessories by configuration','https://realtruck.com/v/ford/f350/')
});

const tequipment993='https://porschecarshistory.com/wp-content/old/brochures3/32/2001%20993%20Tequipment.pdf';
const classicCatalog='https://www.stuttcars.com/wp-content/uploads/2021/04/Classic-Accessories-1950-1998.pdf';
const classicPartner='https://www.porsche.com/usa/accessoriesandservice/classic/classic-partner/';
const carrier993=listing(carrier993Id,'porsche993cab',roof,{
  name:'Porsche Tequipment Cabriolet load carrier', sku:'993 801 055 01', seller:'Porsche Classic Partner',
  type:'supplier search', fieldKind:'carrier', unit:'base carrier set', exclusive:'993-roof',
  url:'https://www.porsche.com/usa/accessoriesandservice/classic/classic-partner/',
  fit:'The 993 Tequipment brochure lists 993 801 055 01 for the 911 Cabriolet (055 00 is the Coupé, 055 02 the Targa) and limits the load to 35 kg on the Cabriolet. It is long discontinued; ask a Classic Partner or look for a used set.',
  description:'A lockable base carrier for Porsche touring attachments such as the ski holder (000 044 000 04) and bicycle carrier (000 044 000 48). The brochure photographs only the Coupé version, so the crossbar feet on the raised top are an approximation. The preview keeps the top up while the carrier is fitted.',
  source:reference('Porsche 993 Tequipment brochure, Touring, p. 15: load carrier part numbers and limits','https://porschecarshistory.com/wp-content/old/brochures3/32/2001%20993%20Tequipment.pdf#page=8')
});

const litronic993=listing('993-litronic-us','porsche993cab','Headlights',{
  name:'Porsche Litronic xenon headlight kit', sku:'000 044 900 15', seller:'Suncoast Porsche Parts',
  fieldKind:'headlamps', url:'https://www.suncoastparts.com/product/993LITRONIC.html',
  fit:'US-spec 1994-1998 993 Carrera, including the 1998 Carrera 2 Cabriolet. Confirm US kit 000 044 900 15 and availability with the seller.',
  description:'The left and right xenon projectors replace the original headlamps in their fender openings. The kit includes both control units.',
  source:reference('Porsche Classic accessories catalogue, illustration 903-00: 000 044 900 15, USA 94–98, left and right headlamps, two control units and harnesses','https://www.stuttcars.com/wp-content/uploads/2021/04/Classic-Accessories-1950-1998.pdf#page=64')
});

// Further period Porsche Tequipment and Porsche Classic items for the 1998
// Carrera 2 Cabriolet. Each one is recorded in p993-accessory-audit.js.
const tequipment993Items=[
  listing(skiCarrier993Id,'porsche993cab',roof,{
    name:'Porsche Tequipment Cabriolet carrier with ski holder', sku:'993 801 055 01 + 000 044 000 04', seller:'Porsche Classic Partner',
    type:'supplier search', fieldKind:'skiCarrier', unit:'carrier and holder', exclusive:'993-roof', url:classicPartner,
    fit:'The Cabriolet base carrier (993 801 055 01) with the Tequipment ski holder (000 044 000 04) mounted on its crossbars. The carrier is limited to 35 kg on the Cabriolet. Both are discontinued.',
    description:'Lockable rubber-jawed clamps on each crossbar hold the skis lengthwise; two pairs are shown. As with the base carrier, the mounting on the raised top is an approximation.',
    source:reference('Porsche 993 Tequipment brochure, Touring, p. 15: ski holder and load carrier',tequipment993+'#page=8')
  }),
  listing('993-strut-brace','porsche993cab','Chassis',{
    name:'Porsche Tequipment front strut brace', sku:'964 343 042 00', seller:'Porsche Classic Partner',
    type:'supplier search', fieldKind:'strutBrace', unit:'brace', url:classicPartner,
    fit:'Listed in the 993 Tequipment brochure for the 911; the part number carries over from the 964. It bolts to the two front strut tower tops in the luggage compartment.',
    description:'A tubular brace ties the strut towers together. Porsche says it increases torsional stiffness for better handling on the track or on demanding roads. The preview’s proportions are an approximation.',
    source:reference('Porsche 993 Tequipment brochure, Engine & chassis, p. 13: front strut brace',tequipment993+'#page=7')
  }),
  listing('993-sports-tailpipes','porsche993cab','Exhaust',{
    name:'Porsche Tequipment sports tail pipes', sku:'000 044 200 01', seller:'Porsche Classic Partner',
    type:'supplier search', fieldKind:'tailpipes', unit:'set', url:classicPartner,
    fit:'The brochure lists set 000 044 200 01 for the Carrera and Carrera 4, which includes the Carrera 2 Cabriolet.',
    description:'Chrome-plated stainless tail pipes with a larger oval cross-section replace the standard outlets under each rear corner. The preview’s proportions are an approximation.',
    source:reference('Porsche 993 Tequipment brochure, Engine & chassis, p. 13: sports tail pipes',tequipment993+'#page=7')
  }),
  listing('993-wind-deflector','porsche993cab','Interior',{
    name:'Porsche Tequipment wind deflector', sku:'000 043 202 10', seller:'Porsche Classic Partner', category:'interior',
    type:'supplier search', fieldKind:'windDeflector', unit:'deflector', url:classicPartner,
    fit:'Made for the 911 Cabriolet. The brochure shows it on a 993 Cabriolet; a storage bag is 000 043 202 11.',
    description:'The folding deflector reduces turbulence for the driver and passenger and covers luggage on the rear seats. It can stay in place when the top is closed. The preview’s proportions are an approximation.',
    source:reference('Porsche 993 Tequipment brochure, Touring, p. 14: wind deflector',tequipment993+'#page=8')
  }),
  listing('993-door-entry-guards','porsche993cab','Interior',{
    name:'Porsche stainless door entry guards, Carrera', sku:'993 551 980 01', seller:'Porsche Classic Partner', category:'interior',
    type:'supplier search', fieldKind:'sillGuards', unit:'pair', url:classicPartner,
    fit:'Porsche Classic lists the Carrera set for the 911 (964 and 993), 1989–98.',
    description:'Brushed stainless plates with the Carrera script cover the door sills on both sides. The preview’s proportions are an approximation.',
    source:reference('Porsche Classic accessories catalogue, illustration 801-00: scuff plate set, Carrera logo',classicCatalog+'#page=54')
  })
];

export const FIELD_ACCESSORIES=[...g500FieldOptions,carrier993,litronic993,...tequipment993Items,...e90FieldOptions];
export const ACCESSORY_PARTS = [
  ...FIELD_ACCESSORIES,
  listing('g-rack-short','g500',roof,{
    name:'Front Runner Slimline II · three-quarter length', sku:'KRGW001L', seller:runner,
    exclusive:'g-roof', unit:'rack kit', url:dometic+'3-4-cargo-rack-front-runner-slimline-ii',
    fit:'Standard-height gutter kit for the early G-Class, including the 2002 G500.',
    description:'The 1,964 × 1,475 mm platform uses six gutter legs. The front roof remains visible ahead of its wind deflector.',
    source:reference('Front Runner · three-quarter rack mounting drawing, p. 2',rackDrawing+'900000477-mercedes-benz-g-class-roof-rack-gelandewagen-34-cargo-rack-front-runner-slimline-ii-fitting.pdf#page=2')
  }),
  listing('h-roof-bars','hrv',roof,{
    name:'Honda locking roof crossbars', sku:'08L02-3V0-100', seller:'College Hills Honda',
    url:'https://www.collegehillshonda.com/product/08L02-3V0-100.html',
    fit:'2023–2027 US HR-V, all trims. This EX-L has the moonroof, and the moonroof visor conflicts with this rack. This dealer offers local pickup.',
    description:'Front and rear carrier bars bridge four shaped cushions. Each outer clamp hooks the roof edge under a keyed cover.',
    source:reference('American Honda · crossbar fit and clamp section, pp. 5–7','https://www.collegehillshonda.com/instructions/hrv/2023/roofrack.pdf#page=7')
  }),
  listing('hl-roof-bars','hrvlx',roof,{
    name:'Honda locking roof crossbars', sku:'08L02-3V0-100', seller:'College Hills Honda',
    url:'https://www.collegehillshonda.com/product/08L02-3V0-100.html',
    fit:'2023–2027 US HR-V, all trims. The LX has a fixed roof, so no moonroof visor is in the way. This dealer offers local pickup.',
    description:'Front and rear carrier bars bridge four shaped cushions. Each outer clamp hooks the roof edge under a keyed cover.',
    source:reference('American Honda · crossbar fit and clamp section, pp. 5–7','https://www.collegehillshonda.com/instructions/hrv/2023/roofrack.pdf#page=7')
  }),
  listing('b46-splitter','bmw325ci',aero,{
    name:'Maxton Design E46 front splitter', sku:'BM-3-46-CE-FD1G', seller:'Maxton Design USA', unit:'splitter',
    url:'https://maxtondesignusa.net/products/front-splitter-bmw-3-e46-coupe',
    fit:'Standard pre-facelift E46 coupe bumper, including the 2003 325Ci shown. Match the bumper profile if the car has been modified.',
    description:'Gloss-black ABS lip follows the lower apron and turns back along the bumper corners.',
    source:reference('Maxton Design · E46 coupe fitment and product views','https://maxtondesign.com/products/front-splitter-compatible-with-bmw-3-e46-coupe')
  }),
  listing('c63-splitter','c63',aero,{
    name:'Maxton Design C63 AMG front splitter', sku:'ME-C-204F-AMG-FD1G', seller:'Maxton Design USA', unit:'splitter',
    url:'https://maxtondesignusa.net/products/front-splitter-mercedes-benz-amg-c63-w204-facelift',
    fit:'C63 AMG W204 facelift, 2012–2015 manufacturer application. The model shows the 2014 sedan with the standard AMG front bumper.',
    description:'A gloss-black lip sits beneath the three bumper openings and projects at the outer corners.',
    source:reference('Maxton Design · facelift C63 fitment and installed views','https://maxtondesignusa.net/products/front-splitter-mercedes-benz-amg-c63-w204-facelift')
  }),
  listing('993-rs-lips','porsche993cab',aero,{
    name:'FVD RS-style front spoiler pair', sku:'FVD505993RS', seller:'FVD Brombacher', unit:'pair',
    url:'https://www.fvd.net/en-us/shop/front-lip-spoiler-993-rs-style-narrow-body-polyurethane-2-piece-fvd505993rs~p274946',
    fit:'FVD lists this narrow-body set for the 993 C2 (1994–98) and C4 (1995–98), without naming body styles; the 1998 Carrera 2 Cabriolet is a narrow-body C2. It fits the standard bumper without modifying the bodywork.',
    description:'An aftermarket RS-style pair, left and right, in polyurethane. The two corner lips wrap back toward the front wheel arches and leave the middle of the bumper open.',
    source:reference('FVD · FVD505993RS product page: narrow body, left and right pieces, 993 C2 (94–98) and C4 (95–98)','https://www.fvd.net/en-us/shop/front-lip-spoiler-993-rs-style-narrow-body-polyurethane-2-piece-fvd505993rs~p274946')
  }),
  listing('992-spoiler-lip','porsche992scab',aero,{
    name:'TECHART Rear Spoiler I', sku:'092.100.800.009', seller:'TECHART USA', unit:'spoiler', exclusive:'992-aero',
    url:'https://shop.techart-usa.com/products/techart-rear-spoiler-i-for-992-carrera-gt3-touring',
    fit:'992.1 Carrera S Cabriolet with the factory retractable spoiler. This piece also comes with Aero Kit I.',
    description:'The lip bonds to the trailing edge of the moving blade and rises with it. Try the spoiler motion in the body assembly.',
    source:reference('TECHART · spoiler bonding surfaces, figs. 23–24',techartDrawing+'#page=23')
  }),
  listing('992-aero-kit','porsche992scab',aero,{
    name:'TECHART Aero Kit I · standard apron', sku:'092.100.100.009 / 350.009 / 500.009 / 800.009', seller:'TECHART USA', exclusive:'992-aero',
    url:'https://shop.techart-usa.com/products/aerokit-i-992-1-carrera',
    fit:'Standard Design version for the 2023 992.1 Carrera S Cabriolet. The SportDesign rear apron takes a different diffuser. TECHART requests a VIN.',
    description:'Adds the front spoiler and side panels, rocker skirts, five-fin rear diffuser and a lip on the factory active spoiler. The preview uses body color and dark trim.',
    source:reference('TECHART · Aero Kit I assembly drawings, pp. 15–23',techartDrawing+'#page=15')
  }),
  listing('s1k-puig-cowl','bmws1000rr','Seat & tail',{
    name:'Puig solo seat cowl · matte black', sku:'21569J', seller:'Bike Armory', unit:'cowl kit',
    url:'https://www.bikearmory.net/product-page/puig-rear-set-colin-bmw-s1000rr-2023',
    fit:'2023 S 1000 RR with the BMW passenger kit. The supplied bracket uses the passenger-seat mounting points.',
    description:'A matte-black shell replaces the pillion pad. This shows the closed version with the upper cap, side openings and foam pad facing the rider.',
    source:reference('Puig · S 1000 RR cowl assembly, pp. 1–5','https://www.nilmoto.com/imagenes/pdf/productos/p21569_21569.pdf')
  }),
  listing('f-deezee-bedmat','f350',bed,{
    name:'Dee Zee custom-fit long-bed mat', sku:'DZ86645', seller:'JEGS', unit:'mat', exclusive:'f-bed-floor',
    url:'https://www.jegs.com/i/dee-zee-300-86645-custom-fit-bed-mat-1975-1997-ford-f-series-pickup',
    fit:'1993 F-350 with an 8-foot pickup box. Dee Zee lists a 65 × 97¾-inch mat for the pre-1998 long bed.',
    description:'A ⅜-inch rubber mat covers the bed floor. Its sides cut inward around the two wheel housings.',
    source:reference('Dee Zee · truck bed mat application and dimensions','https://images.carid.com/dee-zee/pdf/catalog.pdf#:~:text=DZ86645')
  })
];

const choices=[G500_RACK,...ACCESSORY_PARTS,FORD_BED];
export function accessoriesFor(vehicle) {
  return choices.filter(part=>part.vehicles.includes(vehicle));
}
