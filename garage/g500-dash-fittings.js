// Instrument-panel fittings from the 2002 G500 instrument-panel diagram.
// Shapes and placement are estimated around the modeled dash, column and HVAC unit.
import {cyl,x,z} from './mechanism-shapes.js';
const giant='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/instrument-panel';
export const dashFittingsRef={label:'MB Parts Giant · 2002 G500 instrument panel diagram',url:giant};
const trim='#3d4244',dark='#24292a',grille='#2c3133';
export function drawG500DashFittings(r){
  // Glove box: the bin sits ahead of the passenger knees, in front of the blower and front SAM.
  r.tag('body.glove-box',()=>{
    r.box(-.503,.225,.962,-.452,.655,1.152,dark);
    r.box(-.452,.230,.966,-.446,.650,1.150,trim);
  });
  r.tag('body.glove-box-lock-cap',()=>cyl(r,[-.446,.440,1.120],x,0,.006,.011,'#8d9496',12));
  r.tag('body.glove-box-lamp',()=>r.box(-.495,.420,1.140,-.470,.470,1.150,'#c9c7b3'));
  // Lower covers close the dash below the column and below the glove box.
  r.tag('body.lower-cover-left',()=>r.box(-.432,-.640,.880,-.424,-.205,1.080,trim));
  r.tag('body.lower-cover-right',()=>r.box(-.452,.225,.885,-.445,.655,.955,trim));
  // Two-piece shroud around the adjustable column between the dash and the wheel.
  r.tag('body.column-cover',()=>{
    const a=[-.440,-.410,1.168],b=[-.360,-.410,1.212];
    r.rod(a,b,.048,trim,12);
  });
  // A speaker under each outer corner of the pad, behind a grille on the top.
  for(const s of [-1,1]){
    const hand=s<0?'left':'right',c=[-.620,s*.520,0];
    r.tag('body.dash-speakers',()=>r.instance(hand,()=>cyl(r,c,z,1.258,1.278,.045,dark,16)));
    r.tag('body.dash-speaker-covers',()=>r.instance(hand,()=>r.box(-.665,s<0?-.570:.470,1.3005,-.575,s<0?-.470:.570,1.3045,grille)));
  }
}
export const g500DashFittingParts=[
  ['glove-box','Glove box · 463-680-49-91','The lockable bin sits in the passenger side of the dash, ahead of the blower and the front SAM.'],
  ['glove-box-lock-cap','Glove-box lock cylinder cap · 202-689-00-30','The cap closes the lock cylinder in the glove-box lid.'],
  ['glove-box-lamp','Glove-box lamp · 210-820-00-01','A small lamp in the top of the bin lights the glove box when it opens.'],
  ['lower-cover-left','Lower dash cover, driver side · 463-680-35-08','The cover closes the dash below the steering column and carries the diagnostic socket.'],
  ['lower-cover-right','Lower dash cover, passenger side · 463-680-36-08','The cover closes the dash below the glove box.'],
  ['column-cover','Steering column cover · 463-680-14-08','The shroud encloses the adjustable column between the dash and the steering wheel.'],
  ['dash-speakers','Dash speakers · 220-820-24-02','A speaker sits under each outer corner of the instrument-panel pad.'],
  ['dash-speaker-covers','Dash speaker covers · 220-680-78-39','A grille over each speaker sits in the top of the pad.']
];
