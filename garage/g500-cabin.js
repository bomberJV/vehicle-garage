// Black-leather cabin of US G 500 WDCYR49E72X131705, RM Arizona 2023.
// The gallery establishes shapes and layout. Seat positions and upholstery dimensions are schematic.
import {tint} from './road-primitives.js';
import {drawHeaterMat,frontHeaterCenter} from './g500-seat-heaters.js';
import {drawG500WindowLift} from './g500-window-lifter.js';
import {part,study} from './mechanism-shapes.js';
import {seatHardwareRows,drawG500SeatHardware,seatTrackPlate,seatTrimPlate,seatAdjusterPlate} from './g500-seat-adjuster.js';
export const g500CabinSource={label:'RM Sotheby’s · 2002 US G500 cabin photographs, Arizona lot R0041',url:'https://rmsothebys.com/auctions/az23/lots/r0041-2002-mercedesbenz-g-500/'};
const leather='#4b4d4e',bolster='#484b4c',seam='#353738',rubber='#303437',silver='#a4a7a5',wood='#6c4532';

function bands(r,rings,color){
 r.polygon(rings[0].slice().reverse(),tint(color,.77),false);
 for(let j=1;j<rings.length;j++){
  const a=rings[j-1],b=rings[j];
  for(let i=0;i<a.length;i++){
   const k=(i+1)%a.length;
   r.polygon([a[i],a[k],b[k],b[i]],tint(color,.85+.13*j/(rings.length-1)+.10*Math.cos(i*Math.PI*2/a.length)),false);
  }
 }
 r.polygon(rings.at(-1),tint(color,1.03),false);
}
// Rounded rectangular cross-sections with a slightly crowned face. Every strip shares its edge.
function upholstery(r,levels,color){
 const arc=t=>Math.sign(t)*Math.abs(t)**.47;
 const rings=levels.map(([x,y,z,depth,width])=>Array.from({length:16},(_,i)=>{
  const a=i*Math.PI/8;return [x+depth*arc(Math.cos(a)),y+width*arc(Math.sin(a)),z];
 }));
 bands(r,rings,color);
}
function cushion(r,x,y,z,halfWidth,depth=.23){
 upholstery(r,[[x,y,z-.074,depth*.80,halfWidth*.83],[x,y,z-.053,depth*.95,halfWidth*.96],[x,y,z-.005,depth,halfWidth],[x+.008,y,z+.02,depth*.96,halfWidth*.98],[x+.013,y,z+.042,depth*.84,halfWidth*.84]],leather);
 for(const side of [-1,1]){
  const sideY=y+side*halfWidth*.80;
  upholstery(r,[[x,sideY,z-.008,depth*.83,halfWidth*.12],[x,sideY,z+.023,depth*.90,halfWidth*.15],[x+.012,sideY,z+.056,depth*.72,halfWidth*.13],[x+.02,sideY,z+.062,depth*.60,halfWidth*.07]],bolster);
 }
 for(const dx of [-.075,.059])r.rod([x+dx,y-halfWidth*.61,z+.043],[x+dx,y+halfWidth*.61,z+.043],.0025,seam,5);
}
function backrest(r,baseX,y,z,height,width){
 const lean=.146;
 upholstery(r,[[baseX,y,z,.062,width*.91],[baseX+.011,y,z+.065,.077,width],[baseX+lean*.55,y,z+height*.60,.068,width*.98],[baseX+lean*.90,y,z+height*.92,.056,width*.90],[baseX+lean,y,z+height,.044,width*.74]],leather);
 for(const side of [-1,1]){
  const cy=y+side*width*.83;
  upholstery(r,[[baseX-.030,cy,z+.026,.059,width*.15],[baseX+.021,cy,z+height*.40,.075,width*.18],[baseX+.069,cy,z+height*.75,.065,width*.155],[baseX+.107,cy,z+height*.90,.038,width*.103]],bolster);
 }
 for(const t of [.39,.71]){
  const px=baseX+lean*t-.073;
  r.rod([px,y-width*.62,z+height*t],[px,y+width*.62,z+height*t],.003,seam,6);
 }
}
function headrest(r,x,y,z,halfWidth){
 for(const side of [-1,1])r.rod([x,y+side*halfWidth*.58,z-.054],[x+.008,y+side*halfWidth*.58,z+.027],.0068,silver,8);
 upholstery(r,[[x+.006,y,z,.045,halfWidth*.75],[x+.006,y,z+.022,.060,halfWidth*.97],[x+.021,y,z+.13,.057,halfWidth],[x+.018,y,z+.172,.048,halfWidth*.92],[x+.015,y,z+.186,.036,halfWidth*.71]],leather);
}

const seatRows=[
 ['cushion','Cushion and leather cover','The foam cushion, A 463 910 11 50, fills the separate seat cover. The black leather and bolsters follow the photographed US car.',[-.27,0,.28],seatTrimPlate],
 ['back','Backrest pad and cover','The removable pad wraps over the metal back frame and lumbar supports. The black leather cover pulls over the pad.',[.25,0,.36],seatTrimPlate],
 ['headrest','Head restraint and posts','The two posts enter guides in the top of the backrest. The black restraint is A 463 970 20 50 in trim 9A84.',[0,0,.54],seatTrimPlate],
 ...seatHardwareRows
];
function frontSeatPiece(r,id,side,cy){
 if(id==='cushion')cushion(r,-.173,cy,.776,.246);
 else if(id==='back')backrest(r,.040,cy,.785,.583,.229);
 else if(id==='headrest')headrest(r,.179,cy,1.400,.144);
 else drawG500SeatHardware(r,id,side,cy);
}
function frontSeats(r){
 for(const side of [-1,1]){
  r.tag('body.front-seats',()=>r.instance(side<0?'front-left':'front-right',()=>{
   for(const [id] of seatRows)frontSeatPiece(r,id,side,side*.418);
  }));
 }
}
const frontHeatSource={label:'2002 G-Class operator’s manual · heated front seats',url:'https://www.manualsdir.com/manuals/118401/mercedes-benz-2002-g-class-2002-g-500-g-class-2002-owners-manual.html?page=55'};
const heaterRows=[
 ['heat-cushion','Cushion heater','The flexible element sits beneath the cushion covering. Its outline and conductor layout are approximate.',[0,.15,.29],false],
 ['heat-back','Backrest heater','The heated area follows the face of the seat back. The enlarged study shows the electrical layers.',[-.18,.20,.23],true]
];
export const g500FrontSeatStudy=study('g500-front-seat','Power front seat','The cushion lifts clear of the adjuster and its two rails. Removing the back pad reveals the separate frame and lumbar supports. The 2002 catalog gives part identities and assembly order. Rail spacing, trim contours and drive locations are reconstructed.',seatTrackPlate,
 [
  ...seatRows.map(([id,name,description,offset,source])=>({...part(id,name,description,offset,r=>frontSeatPiece(r,id,r.inspection?.studySeat==='passenger'?1:-1,0)),source})),
  ...heaterRows.map(([id,name,description,offset,back])=>({...part(id,name,description,offset,r=>drawHeaterMat(r,frontHeaterCenter(back,0),back)),source:frontHeatSource}))
 ]);
g500FrontSeatStudy.sources=[seatTrimPlate,seatAdjusterPlate,g500CabinSource];
g500FrontSeatStudy.viewAngle=[-.65,.30];
function rearBench(r){
 r.tag('body.rear-bench',()=>{
  // The cargo photograph shows the division to the right of the middle restraint.
  for(const [a,b] of [[-.689,.216],[.224,.689]]){
   const cy=(a+b)/2,w=(b-a)/2;
   upholstery(r,[[.752,cy,.674,.185,w*.96],[.757,cy,.752,.234,w],[.762,cy,.783,.239,w*.995]],rubber);
   upholstery(r,[[.980,cy,.792,.050,w*.97],[1.001,cy,.89,.057,w],[1.104,cy,1.317,.053,w*.99],[1.113,cy,1.365,.043,w*.955]],rubber);
  }
  for(const [cy,w] of [[-.451,.218],[0,.207],[.451,.218]]){
   cushion(r,.757,cy,.79,w,.220);
   backrest(r,.963,cy,.821,.54,w);
   headrest(r,1.104,cy,1.397,.128);
  }
 });
}
function dashboard(r){
 r.tag('body.dashboard',()=>{
  // The black upper pad wraps over the instrument binnacle. COMAND occupies the center face.
  r.profile([[-.749,1.12],[-.744,1.265],[-.672,1.30],[-.493,1.302],[-.443,1.267],[-.446,1.196],[-.508,1.116]],-.76,.76,'#424749');
  r.profile([[-.601,1.25],[-.601,1.324],[-.542,1.376],[-.444,1.367],[-.419,1.327],[-.422,1.238]],-.613,-.209,'#3c4143');
  // The installed electrical.cluster owns the gauge faces and rear housing.
  r.profile([[-.625,.826],[-.584,1.244],[-.452,1.244],[-.424,1.199],[-.453,.862],[-.513,.814]],-.144,.144,wood);
  r.box(-.433,-.102,.978,-.428,.102,1.116,rubber);
  r.box(-.427,-.083,1.008,-.424,.083,1.098,'#202d30');
  for(const cy of [-.104,0,.104]){
   r.box(-.444,cy-.028,1.242,-.438,cy+.028,1.281,rubber);
   if(cy)for(let i=0;i<3;i++)r.box(-.438,cy-.022,1.249+i*.010,-.434,cy+.022,1.252+i*.010,'#6c7373');
   // The center opening receives electrical.diff-lock-control.
  }
  // Passenger grab handle is raised off the dash and has a wood insert.
  for(const cy of [.245,.628])r.rod([-.468,cy,1.202],[-.404,cy,1.213],.022,'#606467',9);
  r.rod([-.404,.245,1.213],[-.404,.628,1.213],.025,'#555b5c',10);
  r.rod([-.383,.273,1.213],[-.383,.599,1.213],.009,wood,8);
  const center=[-.311,-.410,1.228],P=a=>[center[0]-.039*Math.sin(a),center[1]+.169*Math.cos(a),center[2]+.155*Math.sin(a)];
  for(let i=0;i<32;i++){
   const angle=i*Math.PI/16;
   r.rod(P(angle),P(angle+Math.PI/16),.014,(i>=3&&i<13)||(i>=22&&i<26)?wood:rubber,7);
  }
  for(const a of [.08,Math.PI-.08,1.25*Math.PI,1.75*Math.PI])r.rod(center,P(a),.023,rubber,9);
  upholstery(r,[[-.310,-.410,1.169,.022,.055],[-.309,-.410,1.203,.034,.084],[-.313,-.410,1.258,.034,.094],[-.319,-.410,1.282,.026,.076]],'#484e4e');
  upholstery(r,[[-.085,0,.681,.411,.124],[-.087,0,.792,.407,.127],[-.086,0,.842,.396,.113]],'#474b4d');
  r.box(-.423,-.091,.844,-.161,.094,.854,wood);
  r.box(-.359,-.027,.855,-.185,.022,.858,rubber);
  r.rod([-.292,-.013,.853],[-.267,-.013,.944],.012,silver,9);
  upholstery(r,[[-.268,-.013,.930,.025,.024],[-.26,-.013,.958,.032,.029],[-.261,-.013,.980,.026,.025]],rubber);
  upholstery(r,[[.107,0,.829,.160,.101],[.107,0,.881,.164,.103],[.107,0,.901,.15,.095]],leather);
 });
}
function rearviewMirror(r){
 r.tag('body.rearview-mirror',()=>{
  r.rod([-.464,0,1.859],[-.420,0,1.817],.012,rubber,10);
  upholstery(r,[[ -.413,0,1.773,.011,.082],[-.414,0,1.778,.016,.103],[-.417,0,1.819,.015,.106],[-.419,0,1.827,.010,.091]],rubber);
  r.polygon([[-.397,-.093,1.780],[-.397,.093,1.780],[-.401,.096,1.815],[-.401,-.096,1.815]],'#707b7c',false);
 });
}
export function drawG500Cabin(r){frontSeats(r);rearBench(r);dashboard(r);rearviewMirror(r);}
export function drawG500DoorTrim(r,side,a,b,front){
 const y=v=>side*v,low=front?.73:.92;
 drawG500WindowLift(r,(u,z,depth=0)=>[a+(b-a)*u,side*(.857+depth*.47),.545+.89*z],!front);
 const panel=[[a+.044,low],[a+.049,1.187],[b-.059,1.188],[b-.060,low+.012]];
 r.profile(panel,y(.821),y(.846),'#464a4b');
 r.profile([[a+.075,1.103],[a+.078,1.170],[b-.082,1.169],[b-.083,1.086]],y(.816),y(.820),'#595d5d');
 for(let d=a+.087;d<b-.095;d+=.045)r.rod([d,y(.815),1.102],[d+.01,y(.815),1.167],.0026,'#464a4b',6);
 r.profile([[a+.089,1.008],[a+.151,1.021],[a+.23,1.142],[a+.29,1.14],[a+.198,.989],[a+.090,.981]],y(.782),y(.819),'#4a4e50');
 r.box(a+.166,y(.802)-.006,1.027,b-.105,y(.802)+.006,1.055,'#45494a');
 if(front){
  r.profile([[a+.079,1.034],[a+.073,1.108],[a+.192,1.112],[a+.190,1.039]],y(.809),y(.816),wood);
  r.rod([a+.109,y(.805),1.05],[a+.105,y(.805),1.085],.006,rubber,7);
  r.rod([a+.109,y(.805),1.05],[a+.153,y(.805),1.05],.007,rubber,7);
 }
}
