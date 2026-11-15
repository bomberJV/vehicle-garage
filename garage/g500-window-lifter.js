// Layout from the W463 glass plate and photographs of the serviced assemblies.
// Normalized positions describe the shape; no factory dimensions are published.
import {part,study,cyl,y} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';
export const windowPlate={label:'2002 G500 · front and rear glass and regulator plate, callout 6',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/glass-door'};
const frontPhoto={label:'Genuine left front lifter A 463 720 13 46 · product photograph',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~window-regulator~4637201346'};
const rearPlate={label:'Genuine left rear lifter A 463 730 07 46 · service illustration',url:'https://www.mbpartsgiant.com/genuine/mercedes-benz~window-regulator~4637300746'};
const pieces=[
 ['track','Upright guide and lower bend','The guide follows the carriage up the door, then curves across the bottom toward the offset motor.',[-.37,.02,0]],
 ['sheath','Flexible cable guides','Curved sheathing leaves the drive and the lower end of the guide. The bend radii are reconstructed.',[.23,.16,-.14]],
 ['motor','Window motor and gearcase','The motor sits beside the guide at the drive housing. The catalog supplies it with the regulator.',[.25,.22,.02]],
 ['carriage','Sliding carrier and shoe','The carrier travels up the guide with the shoe at the bottom of the glass.',[-.15,.27,.16]]
];
function railU(z){return .57-.024*(z-.12)/.55;}
export function drawG500WindowPiece(r,key,P,rear,t=1){
 const bend=rear?.32:.27,high=.225+.45*t;
 const route=(points,rad,col)=>pipe(r,points.map(([u,z,d=.0])=>P(u,z,d)),rad,col,8);
 const block=(a,b,col)=>{const s=P(...a),e=P(...b);r.box(...s.map((v,i)=>Math.min(v,e[i])),...s.map((v,i)=>Math.max(v,e[i])),col);};
 if(key==='track'){
  route([[railU(.705),.705],[railU(.40),.40],[.57,.150],[.567,.121],[.558,.099],[.540,.082],[.515,.073],[.481,.074],[.427,.097],[bend+.07,.144]],.010,'#aa8263');
  for(const z of [.169,.635])block([railU(z)-.025,z-.010,-.010],[railU(z)+.028,z+.011,.0],'#899292');
 }else if(key==='sheath'){
  route([[bend+.07,.144],[bend+.025,.191],[bend+.001,.251],[bend,.322],[bend-.010,.390],[bend-.027,.480],[bend-.045,.557]],.008,'#374348');
  route([[bend-.045,.557],[bend-.060,.605],[bend-.078,.636],[bend-.098,.653]],.007,'#515c5b');
 }else if(key==='motor'){
  const gear=P(bend,.307,.015);cyl(r,gear,y,-.013,.013,.040,'#384347',14);
  r.rod(P(bend+.003,.292,.017),P(bend+.075,.220,.017),.022,'#929e9e',12);
  block([bend-.020,.316,.020],[bend+.029,.345,.037],'#485459');
 }else{
  block([railU(high)-.025,high-.032,-.011],[railU(high)+.025,high+.006,.018],'#d2cdaf');
  block([railU(high)-.062,high-.007,.008],[railU(high)+.062,high+.010,.018],'#7f8d8d');
 }
}
export function drawG500WindowLift(r,P,rear){
 for(const [key] of pieces)drawG500WindowPiece(r,key,P,rear);
}
export function g500WindowStudy(rear,side){
 const hand=side==='right'?-1:1,P=(u,z,d=0)=>[hand*(u-.5),d,z];
 const pos=t=>.5-.5*Math.cos(t*2*Math.PI);
 const desc='The powered lifter has a vertical guide, a curved lower leg and an offset motor. The glass is cut short so its carrier stays visible through one stroke. The public plates give the component layout; the travel and bend radii are approximate.';
 const source=rear?rearPlate:frontPhoto;
 const rows=pieces.map(([key,name,txt,offset])=>part(key,name,txt,offset.map((v,i)=>i===0?v*hand:v),(r,t)=>drawG500WindowPiece(r,key,P,rear,pos(t))));
 rows.push(part('glass','Lower edge of the moving pane','The shoe and the pane stay together as the motor raises the window.',[0,-.22,.28],(r,t)=>{
  const z=.235+.45*pos(t);glazingFace(r,[P(.24,z),P(.79,z),P(.79,z+.17),P(.27,z+.17)],'#90c4cb',.45);
 }));
 const d=study('g500-window-'+(rear?'rear-':'front-')+side,(rear?'Rear ':'Front ')+side+' window lifter',desc,source,rows,'Follow the glass carrier along the guide.');
 d.sources=[windowPlate];d.viewAngle=[-.43,.22];return d;
}
