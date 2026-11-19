// 992 fit pack: climate. Installed parts drawn onto the car.
// Scope: Climate and fluids: coolant expansion tank and cap, radiator fans, cabin air filter, air-distribution ducts and vents, HVAC flap motors, AC pressure and temperature sensors, brake-fluid reservoir if separate from brakes.master, front-compartment fluid fillers. p992-hvac.* and p992-coolant.* already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-climate' or 'p992-fit-climate-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
