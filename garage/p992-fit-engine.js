// 992 fit pack: engine. Installed parts drawn onto the car.
// Scope: Engine ancillaries bolted to the MA2 3.0-litre twin-turbo flat six: ignition coils, injectors, high-pressure fuel pump, oil filter and housing, oil cooler, oil filler and dipstick tube, cam/crank/knock/oil sensors, vacuum pump, engine and gearbox mounts, belt tensioner and idlers. The engine block, heads, intake, turbos, intercoolers, exhaust manifolds, spark plugs and the belt-driven units already drawn (engine.*, electrical.generator, p992-hvac.compressor) stay as they are.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-engine' or 'p992-fit-engine-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
