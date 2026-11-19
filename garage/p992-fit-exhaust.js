// 992 fit pack: exhaust. Installed parts drawn onto the car.
// Scope: Exhaust after the turbochargers: catalytic converters, particulate filters, silencers, oxygen sensors, exhaust-flap actuators, hangers and rubber mounts, heat shields, tailpipe trims. engine.exhaust (manifolds and pipes) already exists: add the separate components around it.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-exhaust' or 'p992-fit-exhaust-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
