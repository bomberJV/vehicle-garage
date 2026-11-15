// 2002 US G 500 (463.249), Operator's Manual, printed pp. 359–360.
// Wheel and tire sizes describe the unloaded nominal section, in metres.
export const G500_WHEEL_MANUAL='https://www.manualsonline.com/manuals/mfg/mercedesbenz/2002_g_500.html?p=362';

const inch=.0254;
export const g500StockWheel=Object.freeze({beadRadius:18*inch/2,beadWidth:7.5*inch,offset:.043,aspect:.60,sectionWidth:.265});
// Mercedes-Benz light-alloy wheel programme for the G-Class, p. 88.
export const g500AtikWheel=Object.freeze({beadRadius:16*inch/2,beadWidth:7.5*inch,offset:.063,aspect:.70,sectionWidth:.265});
export const G500_WHEEL_DIMENSIONS=Object.freeze({
  wheelbase:2.850, trackFront:1.515, trackRear:1.515,
  rimRadius:g500StockWheel.beadRadius, wheelRadius:g500StockWheel.beadRadius+g500StockWheel.sectionWidth*g500StockWheel.aspect
});
