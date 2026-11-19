// 992 fit pack: wipers-lamps. Installed parts drawn onto the car.
// Scope: Wipers, washers and small lamps: wiper arms and blades, wiper motor and linkage, washer reservoir, pump, filler and nozzles, headlamp-washer parts if fitted, third brake light, number-plate lamps, rear fog and reversing lamps if separate, interior and courtesy lamps. lights.* (headlamps, indicators, tail strip) already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-wipers-lamps' or 'p992-fit-wipers-lamps-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
