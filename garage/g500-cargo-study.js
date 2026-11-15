import {g500GateParts,gateHinges,g500GatePivot,rearJamb} from './g500-body-closures.js';
import {part,study} from './mechanism-shapes.js';
import {references} from './door-profiles.js';

const paint='#78938b',jambPaint='#658078';
const swingRadians=80*Math.PI/180;

// Use lateral chassis position as bench X (driver's left stays on the left in
// the rear view) and rearward chassis position as bench depth.
function drawAtHinge(r,phase,moving,draw){
  const angle=moving?swingRadians*(1-Math.cos(2*Math.PI*phase))/2:0;
  const c=Math.cos(angle),s=Math.sin(angle),[px,py]=g500GatePivot;
  const transformed=Object.create(r);
  transformed.polygon=(points,color,stroke)=>r.polygon(points.map(([x,y,z])=>{
    const side=y-py,depth=x-px;
    return [py+side*c-depth*s,side*s+depth*c,z-.630];
  }),color,stroke);
  draw(transformed,paint);
}
const moving=(id,name,text,offset,draw)=>part(id,name,text,offset,(r,t)=>drawAtHinge(r,t,true,draw));
const fixed=(id,name,text,offset,draw)=>part(id,name,text,offset,r=>drawAtHinge(r,0,false,draw));

const components=[
  fixed('jamb','Rear body opening','The sill and the fixed rear wings frame the doorway.',[0,-.28,-.16],r=>rearJamb(r,jambPaint,false)),
  fixed('pins','Hinge pins and fixed leaves','Two pins share one vertical axis on the left jamb. The door knuckles turn between the body-side knuckles.',[-.35,-.20,.12],r=>gateHinges(r,jambPaint,false)),
  fixed('striker','Right jamb striker','The bracket and crosspin stay on the right jamb as the latch on the door moves away.',[.42,-.19,-.07],r=>{
    r.box(2.061,.518,.952,2.091,.527,1.033,'#74817d');
    for(const z of [.964,1.020])r.rod([2.078,.520,z],[2.078,.496,z],.006,'#9fa9a5',8);
    r.rod([2.078,.496,.964],[2.078,.496,1.020],.006,'#9fa9a5',8);
  }),
  moving('skin','Cargo door and window frame','The near-vertical lower skin and upper window frame turn together on the left side of the vehicle.',[0,.48,.02],g500GateParts.skin),
  moving('pressing','Inner reinforcement','Shown schematically on the cabin side. The inner frame surrounds the glass opening and supports the spare carrier.',[0,-.32,.09],r=>{
    for(const y of [-.416,.416]){
      r.box(2.056,y-.020,.682,2.079,y+.020,1.188,'#707d76');
      r.rod([2.063,y,.715],[2.063,y*.45,1.087],.018,'#818d86',8);
    }
    r.box(2.054,-.440,.67,2.078,.440,.698,'#78867f');
    r.box(2.054,-.439,1.164,2.080,.439,1.193,'#78867f');
  }),
  moving('hinge','Door-side hinge leaves','These leaves move with the door. Their knuckles remain concentric with the fixed pins.',[-.41,.12,.23],(r,p)=>gateHinges(r,p,true)),
  moving('latch','Door latch','The latch on the right edge leaves the striker as the door opens.',[.44,.12,-.15],r=>{
    r.box(2.057,.481,.964,2.097,.509,.978,'#46504e');
    r.box(2.057,.481,1.010,2.097,.509,1.025,'#46504e');
    r.box(2.057,.474,.964,2.097,.484,1.025,'#46504e');
  }),
  moving('handle','Pushbutton and outside handle','The pushbutton and handle sit on the right, opposite the hinges.',[.26,.30,.10],g500GateParts.handle),
  moving('glass','Heated rear glass and gasket','The fixed pane moves with the door. The top-mounted rear wiper stays aligned with the glass.',[0,-.10,.53],g500GateParts.glass),
  moving('wiper','Rear wiper','The wiper parks below its upper spindle. Both travel with the glass.',[-.22,.15,.38],g500GateParts.wiper),
  moving('lamp','High-mounted stop lamp','The lamp sits above the rear window.',[.22,.13,.43],g500GateParts.lamp),
  moving('carrier','Spare-wheel carrier','The mounting face sits toward the hinge side of the door.',[-.09,.49,-.13],g500GateParts.carrier),
  moving('spare','Spare and outer cover','The cover and wheel sweep around the left hinge with their carrier. Their position stays fixed relative to the skin.',[-.13,.72,.04],g500GateParts.spare)
];
export const g500CargoStudy=study('closure-g500','W463 side-hinged cargo door',
  'Follow the two left hinge pins as the door opens. The right-hand latch leaves the striker while the glass, wiper and spare remain on the door.',
  references.gGate,components,'The door opens to a schematic 80° at the midpoint of the cycle, then closes. The jamb, striker and hinge pins stay in place.');
g500CargoStudy.viewAngle=[-.44,.24];
