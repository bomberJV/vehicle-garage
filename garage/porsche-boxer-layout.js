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
// 992.1 Carrera S 9A2 evo: 2,981 cm³ from 91.0 mm bore and 76.4 mm stroke.
// Porsche: every current boxer shares the 118 mm cylinder spacing.
export const nineA2={bore:.091,stroke:.0764,pitch:classicPitch,bankOffset:classicPitch/2,
  source:{label:'Porsche · The new 911 Carrera, Technology Workshop Powertrain (9A2 evo: 91.0 × 76.4 mm, 2,981 cm³)',url:'https://rennlist.com/forums/attachments/992/1317917d1604346939-savagegeese-992-review-tws_992_powertrain_en.pdf'},
  pitchSource:{label:'Porsche Christophorus 394 · every member of the boxer family has 118 mm cylinder spacing',url:'https://newsroom.porsche.com/christophorus/en/2020/394/technology-boxer-engine-911-turbo.html'}};
// 993 Carrera M64/05: 3,600 cm³ from 100 mm bore and 76.4 mm stroke.
export const m64={bore:.100,stroke:.0764,pitch:classicPitch,bankOffset:classicPitch/2,
  source:{label:'kfz-tech.de · Porsche 911 engine, bore × stroke by year (1989: 100.0 × 76.4 mm, 3,600 cm³)',url:'https://kfz-tech.de/Engl/Hersteller/Porsche/Porsche911Motor.htm'},
  pitchSource:{label:'Hagerty · Mezger spaced the bores 118 mm apart',url:'https://hagerty.com/media/?p=6803'},
  // The 993 crank keeps the 964's 60 mm main journals and narrows the 55 mm
  // big-end journals from 22 to 19 mm.
  journals:{main:.060,rod:.055,rodWidth:.019},
  journalSource:{label:'Rennlist 993 forum · 964, 993 and GT3 cranks share 76.4 mm stroke and 60 mm mains; the 993 big end is 55 mm, narrowed from 22 to 19 mm wide',url:'https://rennlist.com/forums/993-forum/253360-993-crank-vs-964-vs-turbo.html'}};
const modelPitch=.178;
export const CLASSIC_SCALE=classicPitch/modelPitch;
// 993: crank centre 378 mm behind the axle line puts the flywheel face at
// x 1.262, 150 mm behind the final drive at x 1.112. The crankshaft axis sits
// 30 mm lower than the shared model height, so the fan housing clears the
// recess under the spoiler blade in the sloping engine lid.
// The 992 follows the same transaxle rule as the 993: the final drive sits on
// the axle line and the flywheel 150 mm behind it, so the crank centre is
// 378 mm behind the axle at the real pitch. The 996 keeps its model frame.
const classicSetback=.378,modernSetback=.285;

export function boxerFrame(car,modern){
  if(modern===true)return {cx:car.rear+classicSetback,f:CLASSIC_SCALE,z:.502};
  return modern?{cx:car.rear+modernSetback,f:1,z:.502}:{cx:car.rear+classicSetback,f:CLASSIC_SCALE,z:.472};
}
// Centre of cylinder `n` (0 forward) on bank `side` (-1 left, 1 right).
export const cylinderX=(cx,f,n,side)=>cx+f*(-.1845+n*.178+side*.0445);
// Forward face of the flywheel flange, from the crankshaft's local end station.
export const flangeX=(cx,f)=>cx+f*(-.0065-.607*.55625);
