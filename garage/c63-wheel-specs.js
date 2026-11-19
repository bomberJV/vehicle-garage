// MY2014 USA C63 AMG sedan (W204). Mercedes-Benz USA's C-Class sedan technical
// data lists 235/40 R 18 front and 255/35 R 18 rear tyres on the standard
// staggered 18-inch AMG wheels, and 61.8 in / 60.0 in front and rear tracks.
// Tyre radii are nominal: bead radius plus section width times aspect ratio.
const inch=.0254;
export const c63Stock18=Object.freeze({beadRadius:18*inch/2,front:{sectionWidth:.235,aspect:.40},rear:{sectionWidth:.255,aspect:.35}});
const tyreRadius=t=>c63Stock18.beadRadius+t.sectionWidth*t.aspect;
// The same table gives the C63 AMG sedan a 108.9 in (2,766 mm) wheelbase. The
// front axle stays at x -1.38, where the rebuilt front end is registered, so
// the rear axle sits 2.766 m behind it at x 1.386.
export const C63_WHEELBASE=2.766;
export const C63_AXLES=Object.freeze([-1.38,1.386]);
export const C63_WHEEL_DIMENSIONS=Object.freeze({
  axles:C63_AXLES,
  trackFront:61.8*inch, trackRear:60.0*inch,
  wheelRadius:tyreRadius(c63Stock18.front), wheelRadiusRear:tyreRadius(c63Stock18.rear),
  rimRadius:c63Stock18.beadRadius
});
export const C63_SPEC_SOURCE='https://media.mbusa.com/releases/release-885a67e029966012c86e59004d4838de-2012-mercedes-benz-c-class-sedan-technical-data';
