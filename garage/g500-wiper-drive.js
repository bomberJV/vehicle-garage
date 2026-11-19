// Windshield wiper drive under the cowl, from the 2002 G500 windshield
// wiper and washer diagram. Placement follows the modeled arm bases.
import {cyl,z} from './mechanism-shapes.js';
export const wiperDriveRef={label:'MB Parts Giant · 2002 G500 windshield wiper and washer diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/electrical/wipers'};
const steel='#4a5051',dark='#2a2f30';
const pivots={left:[-.768,-.513],right:[-.768,.256]};
export function drawG500WiperDrive(r){
  for(const [hand,[x,y]] of Object.entries(pivots))
    r.tag('body.wiper-pivot-'+hand,()=>{cyl(r,[x,y,0],z,1.292,1.348,.016,steel,12);r.box(x-.030,y-.030,1.292,x+.022,y+.030,1.300,steel);});
  r.tag('body.wiper-linkage',()=>{
    // Crank from the motor to the left pivot, then the long rod across to the right pivot.
    r.rod([-.772,-.360,1.308],[-.772,-.505,1.302],.006,steel,6);
    r.rod([-.772,-.505,1.302],[-.772,.248,1.302],.006,steel,6);
  });
  r.tag('body.wiper-motor',()=>{
    cyl(r,[-.786,-.360,0],z,1.258,1.300,.034,dark,16);
    r.box(-.810,-.392,1.300,-.760,-.328,1.312,steel);
  });
}
export const g500WiperDriveParts=[
  ['wiper-pivot-left','Wiper pivot assembly, driver · 000-820-78-46','The driver-side pivot carries the left arm through the cowl.'],
  ['wiper-pivot-right','Wiper pivot assembly, passenger · 000-820-79-46','The passenger-side pivot carries the right arm through the cowl.'],
  ['wiper-linkage','Wiper linkage assembly · 463-820-09-41','A crank and a long rod under the cowl drive both pivots from the motor.'],
  ['wiper-motor','Windshield wiper motor · 463-906-43-00','The motor sits under the driver side of the cowl and turns the linkage crank.']
];
