// 992 fit pack: rear-axle. Installed parts drawn onto the car.
// Scope: Rear axle: rear axle carrier/subframe, rear anti-roll bar with links, wheel carriers, bearings and hubs, brake dust shields, wheel-speed sensors, rear ride-height sensor, gearbox mounts. The five links and dampers already exist (p992-suspension.*).
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-rear-axle' or 'p992-fit-rear-axle-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
