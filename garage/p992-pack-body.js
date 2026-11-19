// 992 study pack: body.
// Scope: Body ends and underbody: front and rear bumpers and their brackets and grilles, luggage-compartment lid and lock, engine lid and grille, underbody panels and aero, rear spoiler motor and linkage (the 803-180 spoiler diagram is done), convertible-top drive cylinder.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-body-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
export const hooks=["shell.bumpers", "shell.luggage", "shell.deck", "floor.pan", "floor.underlay", "floor.rear-lining", "992spoiler.blade", "992spoiler.output", "992spoiler.sensor", "992spoiler.closure", "992spoiler-motor.case", "992spoiler-motor.field", "992spoiler-motor.rotor", "992spoiler-pivot.bracket", "992spoiler-pivot.link", "service-porsche992scab-roof-drive.barrel", "service-porsche992scab-roof-drive.piston", "service-porsche992scab-roof-drive.seal", "service-porsche992scab-roof-drive.eyes"];
export const studies=[];
export const views=new Map();
