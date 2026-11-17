// BMW MY2008 USA 328xi sedan (E90, pre-LCI). Edmunds' 328xi specification lists
// 16 × 7.0 in wheels with 205/55R16 tires, a 108.7 in wheelbase and 59.1 in /
// 59.6 in front and rear tracks. The ET34 offset is BMW's for the E90 16 × 7 rim.
const inch=.0254;
export const e90Style156=Object.freeze({beadRadius:16*inch/2,beadWidth:7*inch,offset:.034,sectionWidth:.205,aspect:.55});
export const E90_WHEEL_DIMENSIONS=Object.freeze({
  wheelbase:2.760, trackFront:59.1*inch, trackRear:59.6*inch,
  wheelRadius:e90Style156.beadRadius+e90Style156.sectionWidth*e90Style156.aspect,
  rimRadius:e90Style156.beadRadius
});
export const E90_SPEC_SOURCE='https://www.edmunds.com/bmw/3-series/2008/st-100946472/features-specs';
