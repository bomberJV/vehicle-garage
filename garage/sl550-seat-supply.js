import {part,study,turn,x} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';

export const slPumpSource={label:'Mercedes-Benz USA · pneumatic seat pump, reservoir and connectors',url:'https://mbparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/vacuum-system-hydraulic-system--vacuum-pump-and-connector'};
function housing(r){
  r.box(1.04,-.505,.551,1.168,-.435,.639,'#404648');
  r.box(1.035,-.509,.639,1.172,-.430,.648,'#555b5a');
  r.box(1.057,-.440,.576,1.085,-.418,.601,'#858985');
  for(const y of [-.481,-.455])r.rod([1.04,y,.60],[1.024,y,.60],.006,'#828d88',8);
}
function mounts(r){
  r.box(1.028,-.516,.535,1.18,-.424,.542,'#737977');
  for(const xx of [1.047,1.153])for(const yy of [-.493,-.447])
    r.rod([xx,yy,.541],[xx,yy,.553],.009,'#393d3d',8);
}
function tank(r){
  turn(r,[1.21,-.351,.592],x,[[-.110,0],[-.100,.022],[-.081,.038],[-.06,.043],[.066,.043],[.09,.035],[.107,.017],[.109,0]],'#505b5c',{n:14});
  for(const d of [-.056,.055])turn(r,[1.21,-.351,.592],x,[[d-.005,.044],[d+.005,.044]],'#777f7a',{n:12});
}
function reservoirHose(r){
  pipe(r,[[1.025,-.455,.60],[1.00,-.455,.60],[.996,-.407,.60],[1.045,-.351,.592],[1.106,-.351,.592]],.004,'#68818b',6);
}
function seatHoses(r){
  // The mounted seat valve boxes begin at (.529,+.088,.563) in seat coordinates.
  // Ends meet both boxes. The intermediate bends are diagrammatic.
  const branch=[.803,-.302,.431];
  pipe(r,[[1.025,-.481,.600],[.973,-.481,.581],[.919,-.465,.521],[.862,-.455,.431],branch],.004,'#748a92',6);
  for(const y of [-.39,.39]){
    const endY=y+.102;
    pipe(r,[branch,[.803,endY,.431],[.701,endY,.432],[.599,endY,.482],[.548,endY,.563]],.004,'#748a92',6);
  }
}
const pieces=[
  part('pump','Pneumatic pump and electrical connector','Catalog item 10 supplies the seat air circuits from the front left of the luggage compartment.',[0,-.10,.10],housing),
  part('mount','Carrier and rubber isolators','The catalog lists the pump mount and its vibration damper separately.',[0,0,-.11],mounts),
  part('reservoir','Compressed-air reservoir','The pressure tank stores air for the seat circuits. A holder locates the tank; its installed position alongside the pump is schematic.',[.10,.10,.07],tank),
  part('reservoir-hose','Reservoir line','A 231 800 25 15 64 connects the reservoir to the pneumatic assembly.',[-.11,0,.04],reservoirHose),
  part('lines','Seat supply lines','Trace the supply forward to the valve on each seat. The branching and bends illustrate the pneumatic connection.',[-.10,.12,-.02],seatHoses)
];
export const slPumpStudy=study('sl-seat-supply','Shared pneumatic seat supply','The pump and reservoir feed both multicontour seats. The Mercedes parts catalog locates the pump at the front left of the trunk. The case dimensions, reservoir location and concealed tube routing are approximate.',slPumpSource,pieces);
slPumpStudy.viewAngle=[-.62,.57];
export function drawSLPump(r){for(const p of pieces)p.draw(r);}
