// G500 study pack: chassis.
// Chassis, steering and brakes: springs, dampers, bushings, arms, steering linkage and box, brake lines, calipers, parking brake.
//
// Contract (see garage/g500-packs.js and tests/garage-g500-packs.test.mjs):
// - studies: every study this pack defines, built with study()/part() from mechanism-shapes.js.
// - views: Map from an existing G500 part id (installed or nested) to the study it opens.
//   Only hook ids that open no study today.
// - claims: evidence entries {ids,kind,fact,need,source} for every part in the pack's studies.
// Each part name carries its Mercedes number (xxx-xxx-xx-xx) and each part or study cites the
// catalog page that lists it.
export const studies=[];
export const views=new Map();
export const claims=[];
