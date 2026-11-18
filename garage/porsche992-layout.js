// Installed layout of the US 2023 911 Carrera S Cabriolet (992.1, seven-speed
// manual). The flat-six is placed by porsche-boxer-layout.js at the real
// 118 mm cylinder spacing, the crank centre 378 mm behind the rear axle line.
//
// Engine compartment, after the 992.1 starter and alternator plate 902-050:
// - The starter is bolted to the transaxle bellhousing on the right, ahead of
//   the flywheel ring gear and above the right half-shaft.
// - The alternator and the A/C compressor are driven by the poly-V belt on
//   the rear face of the engine, behind the last cylinders: the alternator on
//   the left, the compressor on the right, both pulleys facing aft.
// - One high-pressure rail per bank feeds three direct injectors at the
//   118 mm pitch.
// Under the floor, the battery cable and fuel line run aft beneath the floor
// pan (underside z 0.352) on either side of the tunnel, then rise beside the
// transaxle.
import {boxerFrame,cylinderX} from './porsche-boxer-layout.js';
export const E992=boxerFrame({rear:1.25},true);
const bankCentre=s=>cylinderX(E992.cx,E992.f,1,s);
// Rear face of the engine, where the belt runs.
export const beltX=E992.cx+.30;
const railZ=E992.z+.13;
// Front compartment. The tank fills the space between the strut towers behind
// the front axle, above the steering rack, and stops right of the intermediate
// steering shaft. The drawn envelope holds about 55 of the 64 litres; the real
// tank also wraps the rack and the shaft. The brake master cylinder, PSM unit and battery
// sit above it, under the luggage-compartment rear trim.
export const p992Layout={
  tank:[-1.055,.10,.52],tankDims:[.41,.74,.21],pumpY:.20,
  neck:[-.955,.75,.86],neckPath:[[-.975,.66,.78],[-.975,.48,.68],[-.975,.42,.60]],
  master:[-1.04,-.36,.715],absSite:[-1.16,-.22,.665],
  // The 12 V battery sits low at the front of the compartment, ahead of the axle.
  battery:[-1.42,0,.50],
  // Fuse carrier in the left footwell side trim, below the dashboard.
  fuseSite:[-.62,-.56,.62],
  engine:[E992.cx,0,E992.z+.03],
  starter:[1.245,.255,.50],
  generator:[beltX-.10*.8,-.275,.665],generatorKind:'alternator-aft',generatorSize:.8,
  railCenters:[[bankCentre(-1),-.205,railZ],[bankCentre(1),.205,railZ]],
  injectorSpan:2*.118,
  fuelEnd:[bankCentre(-1)-.15,-.205,railZ],
  supplyPath:[[-1.055,.30,.675],[-.86,.06,.64],[-.84,0,.40],[-.80,-.10,.33],[.80,-.10,.33],[.86,-.24,.36],[1.10,-.24,.62],[1.30,-.205,.64]],
  // Brake lines leave the PSM unit over the tank. The front pair drop behind
  // the strut towers; the rear pair pass ahead of the tank and run back along
  // the centre of the floor, under the rack and the tunnel.
  brakeRoute(rear,side,mod,c){
    if(!rear)return {hard:[mod,...(side>0?[[-1.155,0,.75]]:[]),[-1.14,side*.30,.72],[-1.09,side*.52,.66],[-1.08,side*.52,.50]],hose:[[-1.08,side*.52,.50],[-1.07,side*.64,.46],[c[0]+.10,c[1],c[2]+.054]]};
    const y=side*.04;
    return {hard:[mod,[-1.274,mod[1],.64],[-1.274,y,.40],[-1.27,y,.30],[.95,y,.30],[.97,side*.42,.31],[1.06,side*.44,.33]],hose:[[1.06,side*.44,.33],[1.12,side*.62,.37],[1.22,side*.70,.445],[1.33,side*.705,.46],[1.385,side*.73,.43]]};
  },
  cablePath:[[-1.40,.06,.635],[-1.27,.12,.76],[-.86,.40,.76],[-.845,.40,.66],[-.845,.40,.33],[-.70,.32,.33],[-.60,.12,.33],[.80,.12,.33],[.90,.24,.40],[1.10,.255,.46]]
};
