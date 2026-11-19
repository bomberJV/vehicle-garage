// Accessory audit for the 1999 911 Carrera Cabriolet (996.1), hub #306. Each
// row records what its source states, checked on 2026-11-19; `also` holds the
// further sources read for the same item. The Tequipment brochure is the 05/05
// edition for the 996; its Carrera items marked "up to 07/01" cover the 996.1.
// tests/garage-p996-accessories.test.mjs pins the 996's accessory list to it.
const tequipment='https://www.porsche-iberica.com/pt/porscheservice/pdf/TEQ_996_II_gb.pdf';
export const p996AccessoryAudit=[
  {id:'996-aluminum-hardtop',sku:'996 563 911 00',
   source:'https://eurospares.co.uk/Porsche/996/996_(2001)/PartDiagrams/811-016/HARDTOP_-_ACCESSORIES_-_GASKETS',
   states:'Porsche PET 996, plate 811-016 (hardtop, accessories, gaskets): pos. 1, 99656391100 (996 563 911 00), HARDTOP, marked supersession; pos. 2, rear window glass ready for installation; catches and mountings listed for MY 2004 and earlier.',
   also:[
     {url:'https://edmunds.com/porsche/911/1999/review',states:'1999 911 review: the Cabriolet top opens or closes in 20 seconds, and a removable aluminum hard top is standard.'},
     {url:'https://www.porsche.com/central-eastern-europe/en/_bulgaria_/accessoriesandservice/classic/models/996/996/',states:'Porsche Classic, 911 Carrera (996), 1998–2005: Cabriolet with a fully electric fabric roof; aluminium hardtop with electrically heated rear window.'},
     {url:'https://teile.com/pdf/teilecom_en_Hardtop-complete-incl-ceiling-color-on-request-several-pieces-in-stock-_99656391100KPL.pdf',states:'Used hardtop 99656391100, complete with headliner, suitable for the 911 (996), 1998–2005.'}
   ],
   approximate:'Shape: the shell follows the raised fabric top, with door and quarter glass raised; the hardtop itself was not measured.'},
  {id:'996-cabrio-roof-transport',sku:'996 801 055 00',
   source:tequipment,
   states:'Tequipment 911 brochure (edition 05/05), p. 30, roof transport system: base systems for Coupé, Cabriolet and Targa, attachments up to 75 kg, security caps and locks; Cabriolet (except 911 Carrera 4S/911 Turbo/911 Turbo S Cabriolet): part no. 996 801 055 00.',
   also:[
     {url:'https://www.eurospares.co.uk/Porsche/Accessories_and_Tequipment/2000_(Tequipment)/PartDiagrams/801-006/ROOF_TRANSPORT_SYSTEM',states:'Porsche PET accessories, plate 801-006: 99680105500 roof luggage rack set, Cabrio 996 (6692 7/98), discontinued; rear mountings and a B-pillar pin for the 996 Cabrio.'},
     {url:'https://rennlist.com/forums/996-forum/1340528-cabrio-rooftop-transport-system-install.html',states:'Owner install report: four small brackets on the A and C pillars; the system can be used with the soft top up, down, or with the hardtop on.'}
   ],
   approximate:'Bar and foot positions: the front feet sit at the A-pillar tops and the rear feet beside the quarter windows, registered to the roof outline; no fitting drawing was found.'},
  {id:'996-aerokit-carrera',sku:'000 044 801 90',
   source:tequipment,
   states:'Tequipment 911 brochure (edition 05/05), pp. 8–9, Aerokit Carrera (911 Carrera up to 07/01), for the Coupé or Cabriolet: the modified front section has an integral spoiler element and the fixed rear wing includes a high-level third brake light. Without side elements (front spoiler, rear spoiler): part no. 000 044 801 90.',
   also:[
     {url:'https://www.eurospares.co.uk/Porsche/Accessories_and_Tequipment/2010_(Tequipment)/PartDiagrams/850-022/AEROKIT',states:'Porsche PET accessories, plate 850-022, Aerokit Carrera, MY 1998–2001: 00004480190 small kit; bumper cover 99650598002, rear spoiler 99651290300 with brake light, harness and rear lid brackets.'}
   ],
   approximate:'Front and rear shapes: drawn as a deeper lip on the standard bumper and a fixed wing on two supports, from the brochure description; the kit\'s own bumper cover and lid were not measured.'},
  {id:'996-wind-deflector',sku:'000 044 801 45',
   source:tequipment,
   states:'Tequipment 911 brochure (edition 05/05), p. 33, wind deflector (Cabriolet): folding deflector that minimises turbulence and protects luggage stowed in the rear seat area; stows in the luggage compartment in a protective sleeve. 911 Carrera: part no. 000 044 801 45; 911 Carrera 4: 000 044 801 64.',
   approximate:'Frame and mesh layout: drawn from the brochure description, behind the front seats and over the rear seats.'},
  {id:'996-sports-tailpipes',sku:'996 111 981 00 + 996 111 982 00',
   source:tequipment,
   states:'Tequipment 911 brochure (edition 05/05), p. 17, sports tailpipes: chrome-plated tailpipes with an elliptical cross-section, suitable for all 911 Carrera models up to 07/01. Left: part no. 996 111 981 00; right: part no. 996 111 982 00.',
   approximate:'Outlet size: the larger oval is an estimate; the brochure gives no dimension.'},
  {id:'996-door-entry-guards',sku:'996 551 984 01',
   source:'https://teile.com/pdf/teilecom_en_Scuff-plate-set-Carrera-stainless-steel-L-R_99655198401.pdf',
   states:'Genuine Porsche part 99655198401 (996 551 984 01), scuff plate set "Carrera", stainless steel, left and right, new; suitable for the 911 (996), 1998–2005.',
   also:[
     {url:tequipment,states:'Tequipment 911 brochure (edition 05/05), p. 23, door-sill guards: carbon or stainless steel with a Carrera, Targa, Turbo, GT2, GT3 or Carrera 4S logo; part numbers from a Porsche Centre.'}
   ],
   approximate:'Plate length and width: drawn to the door opening and the sill.'}
];
