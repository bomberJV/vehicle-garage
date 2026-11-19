// Locking hardware from the 2002 G500 front-door, rear-door and back-door
// diagrams. Placement is estimated inside the modeled door shells and jambs.
import {cyl,x,z} from './mechanism-shapes.js';
const giant='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/';
export const doorHardwareRefs={
  front:{label:'MB Parts Giant · 2002 G500 front door diagram',url:giant+'front-door'},
  back:{label:'MB Parts Giant · 2002 G500 back door diagram',url:giant+'back-door'}
};
const black='#24292a',zinc='#b3b9b1',chrome='#c3c8c7';
const span=(s,a,b)=>[Math.min(s*a,s*b),Math.max(s*a,s*b)];
// Inside each door: the central-locking actuator beside the latch and the
// sill lock knob above it. Drawn inside the door's own rigid group so both open with it.
export function drawG500DoorLocking(r,side,b,place){
  r.tag('body.door-lock-actuators',()=>r.instance(place,()=>{const [y0,y1]=span(side,.852,.872);r.box(b-.105,y0,.900,b-.055,y1,.975,black);}));
  r.tag('body.door-lock-knobs',()=>r.instance(place,()=>cyl(r,[b-.075,side*.856,0],z,1.239,1.262,.0055,chrome,8)));
}
// On the body: a striker on each B- and C-pillar where the latches close,
// and one on the rear jamb for the cargo door.
export function drawG500Strikers(r){
  for(const s of [-1,1])r.tag('body.door-striker-'+(s<0?'left':'right'),()=>{
    for(const [px,place] of [[.219,'front'],[1.119,'rear']])r.instance(place,()=>{
      const [y0,y1]=span(s,.848,.866);
      r.box(px,y0,.985,px+.012,y1,.993,zinc);
      r.box(px,y0,1.005,px+.012,y1,1.013,zinc);
    });
  });
  r.tag('body.back-door-striker',()=>{r.box(2.056,.455,.940,2.074,.505,.948,zinc);r.box(2.056,.455,.960,2.074,.505,.968,zinc);});
}
export const g500DoorHardwareParts=[
  ['door-lock-actuators','Central-locking actuators · 004-820-25-42','The same actuator sits beside the latch inside each side door and drives the lock.','front'],
  ['door-lock-knobs','Door lock knobs · 110-760-05-65','A small knob stands on the inner sill of each door and shows the lock state.','front'],
  ['door-striker-left','Door striker, left · 460-743-06-03','The latches of both left doors close over strikers on the B- and C-pillars.','front'],
  ['door-striker-right','Door striker, right · 463-723-08-03','The latches of both right doors close over strikers on the B- and C-pillars.','front'],
  ['back-door-striker','Cargo-door striker · 463-743-23-00','The cargo-door latch closes over a striker on the right of the rear jamb.','back']
];
