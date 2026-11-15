// The two unscaled 2002 seat plates identify parts and their placement. The only
// measured feature here is the nominal diameter of the callout 170 anchor screw.
import {x,y,cyl,sleeve} from './mechanism-shapes.js';
import {motor,box,line,alloy,iron,black,rubber} from './g500-comfort-parts.js';

const catalog='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/';
export const seatTrackPlate={label:'2002 G500 · tracks and motors, callouts 1–11',url:catalog+'tracks-components'};
export const seatTrimPlate={label:'2002 G500 · front seat, cushions and lumbar parts, callouts 1–17',url:catalog+'front-seat-components'};
export const seatAdjusterPlate={label:'Mercedes-Benz USA · front seat adjustment, callouts 10–170',url:'https://mbparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/front-seat--seat-adjustment'};
export const seatHardwareRows=[
 ['tracks','Sliding rails and adjuster frame','The handed adjuster carries the seat shell on two fore-and-aft tracks. The lower rails stay with the floor.',[.02,0,-.45],seatTrackPlate],
 ['frame','Cushion frame and suspension','The stamped pan supports the cushion around its perimeter. The frame and the spring suspension beneath the center are separate catalog pieces.',[-.17,.16,.22],seatAdjusterPlate],
 ['back-frame','Backrest frame and recline pivots','The back frame rises from two pivots behind the cushion. Mercedes lists different frames for the left and right seats.',[.35,0,.23],seatTrimPlate],
 ['travel','Fore-and-aft motor','The travel drive moves the seat along the paired rails. Both front seats use motor A 203 820 12 42.',[-.3,.14,-.07],seatTrackPlate],
 ['height','Height motor and linkage','Motor A 203 820 37 42 drives the height adjustment. The position of its linkage is approximate.',[.04,.42,-.02],seatTrackPlate],
 ['recline','Backrest motor','Motor A 203 820 38 42 acts on the reclining back frame near its pivots.',[.3,-.24,.02],seatTrackPlate],
 ['trim','Outboard adjuster cover','A long black side cover conceals the moving frame. A separate cap sits over the outer recliner.',[0,-.43,0],seatTrackPlate],
 ['anchor','Inner anchor bracket and M10 screw','Mercedes callouts 80 and 170 identify the inner angle bracket and its anchor screw. The screw has a nominal 10 mm thread diameter, 1 mm pitch and class 10.9. The bracket shape and screw length are approximate.',[.03,.46,-.19],seatAdjusterPlate],
 ['lumbar','Pneumatic lumbar supports','The seat plate shows a center support, handed outer supports and a distributor behind the back pad. The outlines and air-cell depths are approximate.',[-.14,.21,.28],seatTrimPlate],
 ['pump','Lumbar pump and bracket','The pneumatic support uses pump A 203 800 00 78 and a separate bracket beneath the seat. Its casing and mount are schematic.',[-.24,-.23,-.16],seatTrimPlate]
];
export function drawG500SeatHardware(r,key,side,cy){
 const pt=(xx,yy,zz)=>[xx,cy+side*yy,zz];
 const shell=(profile,lo,hi,color)=>{const a=cy+side*lo,b=cy+side*hi;r.profile(profile,Math.min(a,b),Math.max(a,b),color);};
 const block=(xx,yy,zz,sizes,col)=>box(r,pt(xx,yy,zz),sizes,col);
 if(key==='tracks'){
  for(const band of [-.167,.167]){
   block(-.17,band,.622,[.437,.036,.009],iron);
   for(const edge of [-.014,.014])block(-.17,band+edge,.634,[.437,.007,.018],iron);
   block(-.165,band,.647,[.374,.023,.018],alloy);
   shell([[-.337,.651],[-.29,.652],[-.258,.700],[-.271,.709]],band-.007,band+.007,iron);
   shell([[-.04,.651],[-.010,.651],[.022,.724],[.001,.728]],band-.007,band+.007,iron);
  }return;
 }
 if(key==='frame'){
  for(const band of [-.182,.182])shell([[-.369,.697],[-.35,.724],[-.19,.734],[.029,.735],[.05,.712],[-.018,.690],[-.29,.687]],band-.009,band+.009,iron);
  for(const xx of [-.35,.024])block(xx,0,.710,[.018,.364,.018],iron);
  for(let i=0;i<5;i++){
   const xx=-.295+i*.062;
   const spring=Array.from({length:11},(_,j)=>pt(xx+(j%2?.009:-.009),-.164+j*.0328,.712-.014*Math.sin(j*Math.PI/10)));
   line(r,spring,.0026,alloy,4);
  }return;
 }
 if(key==='back-frame'){
  for(const hand of [-1,1]){
   const yo=hand*.171;
   shell([[.025,.735],[.055,.735],[.113,.995],[.181,1.302],[.153,1.321],[.082,1.009]],yo-.009,yo+.009,iron);
   sleeve(r,pt(.038,yo,.770),y,-.015,.015,.029,.012,iron,14);
  }
  r.rod(pt(.164,-.172,1.303),pt(.164,.172,1.303),.01,alloy,10);
  r.rod(pt(.065,-.169,.856),pt(.065,.169,.856),.009,iron,8);return;
 }
 if(key==='travel'||key==='height'||key==='recline'){
  const v=key==='travel'?[-.265,-.014,.661]:key==='height'?[-.143,.103,.680]:[.035,.081,.767];
  const c=pt(...v);motor(r,c,y,.017,.067,iron);
  block(v[0],v[1]+.045,v[2],[.040,.025,.034],alloy);
  if(key!=='height')r.rod(pt(v[0],v[1]+.059,v[2]),pt(v[0],.162,v[2]),.005,iron,7);
  if(key==='travel')r.rod(pt(v[0],-.151,v[2]),pt(v[0],v[1]-.034,v[2]),.004,iron,7);
  return;
 }
 if(key==='trim'){
  shell([[-.384,.685],[-.346,.718],[-.19,.732],[-.044,.729],[.055,.764],[.072,.739],[.042,.689],[-.21,.673],[-.361,.670]],.203,.211,rubber);
  shell([[.010,.746],[.029,.788],[.057,.796],[.076,.759],[.052,.730]],.212,.220,black);return;
 }
 if(key==='anchor'){
  block(.000,-.182,.658,[.051,.028,.005],iron);block(.000,-.195,.675,[.051,.005,.039],iron);
  const c=pt(.005,-.194,.676);
  cyl(r,c,y,-.014,.014,.005,alloy,12);cyl(r,pt(.005,-.211,.676),y,-.004,.004,.008,iron,12);return;
 }
 if(key==='lumbar'){
  shell([[.059,.921],[.086,.925],[.124,1.104],[.112,1.151],[.095,1.126]],-.119,.119,'#677373');
  for(const band of [-.145,.145])shell([[.057,.902],[.069,.905],[.113,1.081],[.107,1.113],[.097,1.087]],band-.016,band+.016,'#737f7e');
  block(.095,.074,1.010,[.014,.021,.018],black);return;
 }
 if(key==='pump'){
  const c=pt(-.052,-.059,.660);
  cyl(r,c,x,-.024,.022,.018,iron,12);block(-.022,-.059,.660,[.026,.042,.036],black);
  block(-.042,-.059,.639,[.069,.053,.005],iron);
 }
}
