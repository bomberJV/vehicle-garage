// Longitudinal frame of each installed Porsche flat-six.
//
// Every boxer part is drawn in engine-local x: an offset from the frame centre
// `cx` along the crankshaft. The 992 and 996 keep the frame they were built
// with (scale 1). The 993's air-cooled M64 is rebuilt to its real cylinder
// pitch: 118 mm between bores in one bank, the two banks offset by 59 mm so
// consecutive crank throws alternate sides. Its local x is therefore scaled by
// 118/178 about the centre, and the frame sits behind the rear axle so the
// flywheel meets the transaxle bellhousing aft of the final drive.
//
// Radial sizes (bores, fins, pipes, the fan) are not scaled: only positions
// and lengths along the crankshaft are.
export const classicPitch=.118;
// 993 Carrera M64/05: 3,600 cm³ from 100 mm bore and 76.4 mm stroke.
export const m64={bore:.100,stroke:.0764,pitch:classicPitch,bankOffset:classicPitch/2,
  source:{label:'kfz-tech.de · Porsche 911 engine, bore × stroke by year (1989: 100.0 × 76.4 mm, 3,600 cm³)',url:'https://kfz-tech.de/Engl/Hersteller/Porsche/Porsche911Motor.htm'},
  pitchSource:{label:'Hagerty · Mezger spaced the bores 118 mm apart',url:'https://hagerty.com/media/?p=6803'}};
const modelPitch=.178;
export const CLASSIC_SCALE=classicPitch/modelPitch;
// 993: crank centre 378 mm behind the axle line puts the flywheel face at
// x 1.262, 150 mm behind the final drive at x 1.112. The crankshaft axis sits
// 30 mm lower than the shared model height, so the fan housing clears the
// recess under the spoiler blade in the sloping engine lid.
const classicSetback=.378,modernSetback=.285;

export function boxerFrame(car,modern){
  return modern?{cx:car.rear+modernSetback,f:1,z:.502}:{cx:car.rear+classicSetback,f:CLASSIC_SCALE,z:.472};
}
// Centre of cylinder `n` (0 forward) on bank `side` (-1 left, 1 right).
export const cylinderX=(cx,f,n,side)=>cx+f*(-.1845+n*.178+side*.0445);
// Forward face of the flywheel flange, from the crankshaft's local end station.
export const flangeX=(cx,f)=>cx+f*(-.0065-.607*.55625);
