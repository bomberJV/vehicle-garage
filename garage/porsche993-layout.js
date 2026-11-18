// Installed layout of the 1998 911 Carrera Cabriolet (993) front luggage
// compartment and the under-floor service runs. Positions are fitted to the
// modelled body (front bulkhead at x -0.82, floor pan underside at z 0.352,
// inner wheel tubs at |y| 0.535) so the parts and runs clear each other.
//
// Front compartment, after the Porsche Classic 993 parts catalogue groups 1-9
// (fuel tank 201, brake master cylinder and booster 604, battery 902):
// - The fuel tank stands against the bulkhead. Its envelope is sized to the
//   published 73.5 l capacity (0.52 x 0.66 x 0.25 m with chamfered sections,
//   about 70 l) and is offset to the right, leaving the left bulkhead corner
//   for the brake booster and master cylinder.
// - The battery and the ABS hydraulic unit sit ahead of the tank, the battery
//   on the left.
// - The fuse and relay panel is at the right of the bulkhead, above the tank.
// The external fuel pump hangs below the tank. Lines and the battery cable run
// under the floor pan along the tunnel, then rise to the engine compartment.
//
// Engine compartment: the flat-six is placed by porsche-boxer-layout.js. The
// fuel rails and fan-axis alternator follow that frame.
import {boxerFrame,cylinderX} from './porsche-boxer-layout.js';
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const E=boxerFrame({rear:1.112},false);
const bankCentre=s=>cylinderX(E.cx,E.f,1,s);
const railZ=E.z+.17;
export const p993Layout={
  tank:[-1.10,.07,.48],tankDims:[.52,.66,.25],
  battery:[-1.50,-.30,.53],
  master:[-.965,-.36,.66],
  absSite:[-1.48,-.08,.47],
  fuseSite:[-.90,.30,.66],
  pumpSite:[-1.16,-.10,.305],
  engine:[E.cx,0,E.z+.038],
  // The starter sits on the right of the transaxle bellhousing, ahead of the
  // flywheel ring gear and above the right half-shaft.
  starter:[1.10,.235,.50],
  // One rail per bank above the intake ports; injectors at the 118 mm pitch.
  railCenters:[[bankCentre(-1),-.17,railZ],[bankCentre(1),.17,railZ]],
  injectorSpan:2*.118,
  fuelEnd:[bankCentre(-1)-.138,-.17,railZ],
  // The alternator sits in the fan housing on the impeller's axis.
  generator:[E.cx+.297*E.f-.075,0,E.z+.160],generatorKind:'fan-alternator',generatorSize:.45,
  // Fuel: down from the tank, aft under the tunnel, up the left of the
  // bellhousing to the front of the left fuel rail.
  supplyPath:[[-1.10,.07,.62],[-1.40,.07,.62],[-1.40,-.17,.40],[-1.30,-.17,.32],[.70,-.17,.32],[.86,-.22,.45],[1.0,-.24,.60],[1.02,-.40,.62],[1.20,-.25,.64]],
  // Battery cable: aft under the tunnel on the right, up to the starter.
  cablePath:[[-1.50,-.18,.40],[-1.42,.15,.33],[.70,.15,.33],[.86,.20,.38]],
  // Brake lines: front pair runs ahead of the tank to each front wheel; rear
  // pair drops below the tank, runs under the tunnel and turns out ahead of
  // the final drive to each rear trailing arm.
  brakeRoute(rear,side,mod,c){
    if(!rear)return {hard:[mod,[-1.40,side*.30,.41],[-1.25,side*.50,.42]],hose:[[-1.25,side*.50,.42],[c[0]-.04,c[1]*.90,c[2]+.145],plus(c,[.10,0,.054])]};
    const y=side*.04;
    return {hard:[mod,[-1.40,y,.40],[-1.30,y,.315],[.74,y,.315],[.84,side*.30,.33],[.92,side*.42,.34]],hose:[[.92,side*.42,.34],[c[0]-.04,c[1]*.88,c[2]+.10],plus(c,[.10,0,.054])]};
  }
};
