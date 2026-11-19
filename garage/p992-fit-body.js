// 992 fit pack: body. Installed parts drawn onto the car.
// Scope: Body structure and closures: front and rear bumper crash beams, deformation elements, bumper brackets and guides, luggage-compartment lid lock, striker and gas struts, engine-lid lock and struts, towing-eye inserts, underbody panels, wheel-arch liners, engine-lid grille. The outer shell (shell.*), spoiler and roof already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-body' or 'p992-fit-body-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
