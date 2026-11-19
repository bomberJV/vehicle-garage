// 992 fit pack: electrics. Installed parts drawn onto the car.
// Scope: Electrics: control units (DME engine unit, gateway, front and rear body units, airbag unit, PCM computer, amplifier, PASM unit), horns, parking-sensor transducers, front radar if standard, antennas, earth straps, relay and fuse carriers beyond electrical.fuses, wiring harness runs. electrical.* (battery, starter, generator, fuses, cables) already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-electrics' or 'p992-fit-electrics-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
