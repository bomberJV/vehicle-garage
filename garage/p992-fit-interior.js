// 992 fit pack: interior. Installed parts drawn onto the car.
// Scope: Interior: dashboard carrier and trim, instrument cluster, PCM display, airbags (driver, passenger, side, head), seat belts with retractors, buckles and height adjusters, sun visors, interior mirror, glovebox, centre-console parts, cupholder, rollover-protection cassettes behind the seats, roll bar covers. cabin.seats, cabin.controls and p992-seats.* already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-interior' or 'p992-fit-interior-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
export const groups=[];
export const lines=[];
export const mounts=[];
