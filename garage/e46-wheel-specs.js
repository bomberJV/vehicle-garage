// BMW MY2003 USA 325Ci M54 coupe. Wheel part plates 36_0342 and 36_0428;
// size table and dimension drawing in the 2003 US 325Ci/330Ci owner's manual.
const inch=.0254;
export const e46Style43=Object.freeze({beadRadius:16*inch/2,beadWidth:7*inch,offset:.047,sectionWidth:.205,aspect:.55});
// Sport Package Star Spoke 44, 36 11 1 094 506: 8J x 17 ET47 with 225/45 R17, front and rear.
export const e46Style44=Object.freeze({beadRadius:17*inch/2,beadWidth:8*inch,offset:.047,sectionWidth:.225,aspect:.45});
export const e46Style68Front=Object.freeze({beadRadius:17*inch/2,beadWidth:7.5*inch,offset:.041,sectionWidth:.225,aspect:.45});
export const e46Style68Rear=Object.freeze({beadRadius:17*inch/2,beadWidth:8.5*inch,offset:.050,sectionWidth:.245,aspect:.40});
// The US 0334 submission gives a 57.5 in front track; the shared coupe
// drawing gives 57.9 in. Select the M54-specific U.S. row for the front axle.
export const E46_WHEEL_DIMENSIONS=Object.freeze({
  wheelbase:2.725, trackFront:57.5*inch, trackRear:1.483,
  wheelRadius:e46Style43.beadRadius+e46Style43.sectionWidth*e46Style43.aspect,
  rimRadius:e46Style43.beadRadius
});
