// 992 fit pack: front-axle. Installed parts drawn onto the car.
// Scope: Front axle: front axle carrier/subframe, anti-roll bar with bushes and drop links, wheel carriers, wheel bearings and hubs, brake dust shields, wheel-speed sensors, ride-height sensor, strut-tower brace if standard. The struts, wishbones and steering already exist (p992-suspension.*, p992-steering.*).
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-front-axle' or 'p992-fit-front-axle-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
