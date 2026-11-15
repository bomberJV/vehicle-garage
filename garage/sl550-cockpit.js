// U.S. SL 550 with Sport Wheel Package, Espresso Brown / Ginger Beige and Burl
// Walnut. Profiles follow the photographs on pages 14–18 of the 2014 brochure.
import {TAU,tint,turn,part,study} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';

const espresso='#4b3633', leather='#59403b', silver='#c2c3be', graphite='#232428';
const xyFace=(x,y,z)=>(u,v,d=0)=>[x+d,y+u,z+v];
function face(r,map,points,color,d=0){r.polygon(points.map(([u,v])=>map(u,v,d)),color,false);}
function rect(r,map,u,v,w,h,color,d=0){
 face(r,map,[[u,v],[u+w,v],[u+w,v+h],[u,v+h]],color,d);
}
function joined(r,rear,front,color){
 for(let i=0;i<rear.length;i++){
  const k=(i+1)%rear.length;
  r.polygon([rear[i],rear[k],front[k],front[i]],color,false);
 }
}
function band(r,map,rad,inner,col,d=0,n=36){
 for(let i=0;i<n;i++){
  const q=(t,s)=>[s*Math.cos(TAU*t/n),s*Math.sin(TAU*t/n)];
  face(r,map,[q(i,rad),q(i+1,rad),q(i+1,inner),q(i,inner)],col,d);
 }
}
function dialTick(r,map,angle,inner,outer,width,color,depth){
 const sin=Math.sin(angle),cos=Math.cos(angle),mark=(len,side)=>[len*cos-side*width*sin,len*sin+side*width*cos];
 face(r,map,[mark(inner,-1),mark(outer,-1),mark(outer,1),mark(inner,1)],color,depth);
}
// Front edges of both hoods follow an arch, tapering down to the leather dash.
function cowl(r,center,width,height,sections){
 const [y,z]=center,n=24;
 const skin=(x,scale,i,inset=0)=>{
  const a=Math.PI*i/n;
  return [x,y+(width*scale-inset)*Math.cos(a),z+(height*scale-inset)*Math.sin(a)];
 };
 for(let j=1;j<sections.length;j++)for(let i=0;i<n;i++){
  const [a,sa]=sections[j-1],[b,sb]=sections[j];
  r.polygon([skin(a,sa,i),skin(a,sa,i+1),skin(b,sb,i+1),skin(b,sb,i)],tint(espresso,.79+.33*Math.sin(Math.PI*(i+.5)/n)),false);
 }
 const [x,scale]=sections.at(-1);
 for(let i=0;i<n;i++){
  r.polygon([skin(x,scale,i),skin(x,scale,i+1),skin(x+.001,scale,i+1,.005),skin(x+.001,scale,i,.005)],'#8e7466',false);
  r.polygon([skin(x+.001,scale,i,.005),skin(x+.001,scale,i+1,.005),skin(x-.042,scale,i+1,.008),skin(x-.042,scale,i,.008)],'#272326',false);
 }
}
// Short straight strokes remain legible when a user isolates and enlarges a dial.
const digitStrokes=[
 [[0,2],[1,2]],[[1,2],[1,1]],[[1,1],[1,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,1],[0,2]],[[0,1],[1,1]]
];
const digitSegments=['012345','12','01643','01623','5612','05623','056234','012','0123456','012356'];
function numeral(r,map,value,u,v,height,d){
 const digits=String(value),w=height*.42,gap=w*.38;
 for(let j=0;j<digits.length;j++)for(const seg of digitSegments[digits[j]]){
  const [[x1,y1],[x2,y2]]=digitStrokes[seg],left=u-(digits.length*w+(digits.length-1)*gap)/2+j*(w+gap);
  const x=left+x1*w,y=v+(y1-1)*height/2,xx=left+x2*w,yy=v+(y2-1)*height/2;
  const offset=height*.065;
  face(r,map,[[x-offset,y-offset],[x+offset,y+offset],[xx+offset,yy+offset],[xx-offset,yy-offset]],'#27272b',d);
 }
}
function gauge(r,center,radius,clock=false,right=false){
 const [x,y,z]=center,map=xyFace(x+.01,y,z);
 turn(r,center,[1,0,0],[[-.021,radius*.77],[-.006,radius],[.008,radius],[.011,radius*.90],[.004,radius*.84]],silver,{n:32});
 r.discX(x+.005,y,z,radius*.92,'#26272a',32);
 band(r,map,radius*.86,radius*(clock?.05:.60),clock?'#eee9e1':'#bbb9b5',-.004,32);
 if(!clock)band(r,map,radius*.61,radius*.57,'#777779',-.003,32);
 const count=clock?60:42;
 for(let i=0;i<=count;i++){
  const a=clock?TAU*i/count:Math.PI*(1.25-i/count*1.5),major=i%(clock?5:3)===0;
  dialTick(r,map,a,radius*(major?.66:.77),radius*.848,major?.00115:.00052,'#333339',-.0025);
 }
 if(!clock)for(let i=0;i<=8;i++){
  const a=Math.PI*(1.25-i/8*1.5);
  numeral(r,map,right?i:i*20,radius*.695*Math.cos(a),radius*.695*Math.sin(a),.0054,-.0018);
 }
 const angle=clock?Math.PI*1.04:right?Math.PI*1.16:Math.PI*1.26;
 dialTick(r,map,angle,-radius*.10,radius*.72,.0013,clock?graphite:'#a73635',.0007);
 if(clock)dialTick(r,map,Math.PI*.52,0,radius*.53,.0012,graphite,.001);
 r.discX(x+.012,y,z,radius*.10,clock?graphite:silver,16);
}
function clusterHood(r){
 cowl(r,[-.398,.889],.168,.122,[[-.57,.48],[-.498,.77],[-.408,.95],[-.306,1],[-.224,.985]]);
 const map=xyFace(-.237,-.398,.885);
 const back=[[-.157,-.043],[-.157,.004],[-.143,.054],[-.114,.079],[-.069,.099],[0,.109],[.074,.096],[.124,.072],[.152,.039],[.157,0],[.157,-.043]];
 face(r,map,back,'#29282a');
}
function clusterDials(r){
 for(const [i,y] of [-.480,-.316].entries())gauge(r,[-.222,y,.903],.065,false,Boolean(i));
 const m=xyFace(-.219,-.398,.908);
 face(r,m,[[-.026,-.024],[.026,-.024],[.030,.028],[-.030,.028]],'#828084');
 rect(r,m,-.024,-.018,.048,.040,'#23252a',.001);
 for(let i=0;i<3;i++)rect(r,m,-.014,.010-i*.006,.021-i*.003,.0017,'#c6c6b9',.0015);
 rect(r,m,-.029,.041,.058,.012,'#191b1f');
 for(let i=0;i<4;i++)rect(r,m,-.014+i*.008,.045,.003,.0035,i?'#9d9ea1':'#e6d7b3',.001);
}
function clock(r){
 cowl(r,[0,.958],.037,.046,[[-.595,.38],[-.563,.86],[-.530,1],[-.496,.99]]);
 gauge(r,[-.505,0,.965],.029,true);
}
export function slInstruments(r){clusterHood(r);clusterDials(r);clock(r);}

const wheelPlane=(u,v,d=0)=>[-.115-v*.34+d*.94,-.398+u,.851+v*.94+d*.34];
function wheelRim(r){
 const n=64,m=12;
 const section=(i,j)=>{
  const a=TAU*i/n,b=TAU*j/m,grip=.0175+.0045*Math.abs(Math.cos(a))**3;
  const rad=.165+grip*Math.cos(b),v=rad*Math.sin(a);
  return wheelPlane(rad*Math.cos(a),v<-.146?-.146+(v+.146)*.65:v,grip*Math.sin(b));
 };
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){
  const a=TAU*(i+.5)/n,b=TAU*(j+.5)/m,perforated=Math.abs(Math.sin(a))<.62;
  const brightness=.64+.25*Math.max(0,Math.sin(b))+.21*Math.max(0,Math.cos(b)*Math.sin(a));
  r.polygon([section(i,j),section(i+1,j),section(i+1,j+1),section(i,j+1)],tint(perforated?'#634744':'#614540',brightness),false);
 }
 // Perforations are visible on the two lateral grips in the brochure photograph.
 for(const side of [-1,1])for(let i=0;i<16;i++)for(let j=-1;j<=1;j++){
  const a=-.58+i*.075+(j===0?.026:0),rad=.165+j*.008;
  const u=side*rad*Math.cos(a),v=rad*Math.sin(a),d=.021-j*j*.002;
  face(r,wheelPlane,[[u-.0012,v],[u,v+.0013],[u+.0012,v],[u,v-.0013]],'#2e2222',d);
 }
}
function airbag(r){
 const shape=[[-.054,.055],[-.038,.061],[0,.063],[.038,.061],[.054,.055],[.064,.039],[.071,.009],[.067,-.013],[.047,-.043],[.033,-.057],[.015,-.061],[-.015,-.061],[-.033,-.057],[-.047,-.043],[-.067,-.013],[-.071,.009],[-.064,.039]];
 const rings=[[.87,-.039,graphite],[1.05,-.006,'#372a29'],[1.01,.011,espresso],[.945,.021,leather],[.87,.023,'#644b44']];
 for(let j=1;j<rings.length;j++){
  const loop=([size,depth])=>shape.map(([u,v])=>wheelPlane(u*size,v*size,depth));
  joined(r,loop(rings[j-1]),loop(rings[j]),rings[j][2]);
 }
 face(r,wheelPlane,shape.map(([u,v])=>[u*.87,v*.87]),'#5b423d',.023);
 const emblem=(u,v,d=0)=>wheelPlane(u,v+.003,.023+d);
 face(r,emblem,Array.from({length:24},(_,i)=>[.026*Math.cos(i*TAU/24),.026*Math.sin(i*TAU/24)]),'#302628',.001);
 band(r,emblem,.0245,.0223,silver,.0025,30);
 for(let i=0;i<3;i++){
  const a=Math.PI/2+i*TAU/3,point=(v,s)=>[v*Math.cos(a)-s*Math.sin(a),v*Math.sin(a)+s*Math.cos(a)];
  face(r,emblem,[[0,0],point(0,.004),point(.023,0)],'#f0e9dd',.0034);
  face(r,emblem,[[0,0],point(.023,0),point(0,-.004)],'#969590',.0035);
 }
}
function spokeControls(r){
 for(const side of [-1,1]){
  const p=(u,v,d=0)=>wheelPlane(side*u,v,d);
  face(r,p,[[.047,.054],[.099,.042],[.138,.026],[.15,.001],[.143,-.018],[.067,-.014],[.058,-.028]],silver,-.006);
  face(r,p,[[.072,.036],[.119,.025],[.135,.016],[.136,-.007],[.076,-.004]],'#332b2c',-.0025);
  for(let j=0;j<2;j++)for(let i=0;i<2;i++){
   const u=.079+i*.024,v=.001+j*.012-(i*.003);
   face(r,p,[[u,v],[u+.019,v-.003],[u+.018,v+.005],[u+.002,v+.009]],'#5b4e4a',.0006);
   rect(r,p,u+.006,v+.003,.005,.0011,'#d6d0c8',.0015);
  }
  const fork=[[.056,-.021],[.070,-.019],[.046,-.066],[.033,-.148],[.022,-.151],[.022,-.130],[.031,-.057]];
  face(r,p,fork,silver,-.004);
  face(r,p,[[.065,-.021],[.046,-.065],[.032,-.147],[.029,-.147],[.041,-.063]],'#8d8f8e',-.002);
 }
 face(r,wheelPlane,[[-.036,-.139],[.036,-.139],[.030,-.159],[-.030,-.159]],silver,-.003);
 rect(r,wheelPlane,-.022,-.150,.044,.006,'#8f8c87',-.002);
}
function paddles(r){
 for(const side of [-1,1]){
  const p=(u,v,d=0)=>wheelPlane(side*u,v,d);
  const outline=[[.081,.011],[.095,-.007],[.119,.025],[.116,.053],[.105,.066],[.098,.067]];
  joined(r,outline.map(([u,v])=>p(u,v,-.038)),outline.map(([u,v])=>p(u,v,-.033)),'#757574');
  face(r,p,outline,silver,-.033);
  rect(r,p,.100,.048,.008,.0018,graphite,-.032);
  if(side===1)rect(r,p,.103,.045,.0018,.008,graphite,-.0315);
 }
}
export function slSportWheel(r){wheelRim(r);spokeControls(r);airbag(r);paddles(r);}
export function slWheelStudy(source){
 return study('slsportwheel','Sport steering wheel','The two thumb pads sit on the upper spokes. Twin silver legs leave an opening beneath the horn and airbag cover.',source,[
  part('rim','Leather rim and perforated grips','Smooth leather covers the top and bottom. The driver grips perforated leather at the sides.',[0,0,.14],wheelRim),
  part('switches','Spokes and multifunction switches','The horizontal spokes carry the driver’s instrument and audio controls.',[.10,0,-.06],spokeControls),
  part('hub','Horn and airbag cover','A shaped leather cover carries the star and fits into the middle of the wheel.',[.17,0,.06],airbag),
  part('paddles','Transmission shift paddles','The two metal paddles sit just behind the side grips.',[-.13,0,.01],paddles)
 ]);
}
export function slInstrumentStudy(source){
 return study('slgauges','Instrument panel and clock','Open the binnacle to separate the gauges from the arched glare shield. The analog clock has its own housing at the center of the dash.',source,[
  part('hood','Leather instrument hood','The padded hood projects above the gauge faces.',[-.10,0,.14],clusterHood),
  part('cluster','Twin dial cluster and driver display','Silver scales surround the darker centers. The driver display sits between them.',[.10,0,-.02],clusterDials),
  part('clock','Dashboard clock and housing','A white dial with two hands faces the occupants from its own small hood.',[.03,.11,.08],clock)
 ]);
}
export function slDisplay(r){
 // One recessed surround ties the screen to both turbine outlets. The padded
 // top edge follows the sweep of the dash, including the ends by the nozzles.
 const border=[[-.210,.853],[-.203,.879],[-.184,.900],[-.158,.908],[-.106,.911],[.106,.911],[.158,.908],[.184,.900],[.203,.879],[.210,.853],[.202,.833],[.186,.811],[.159,.799],[-.159,.799],[-.186,.811],[-.202,.833]];
 const surface=([u,v],d)=>[-.275+.10*(u/.77)**2+d,u,v];
 const edge=border.map(q=>surface(q,.005)),inner=border.map(([u,v])=>surface([u*.985,.854+(v-.854)*.935],.006));
 joined(r,edge,inner,'#847166');
 for(let i=0;i<inner.length;i++){
  const k=(i+1)%inner.length;
  r.polygon([[ -.267,0,.855],inner[i],inner[k]],'#332e2d',false);
 }

 r.box(-.359,-.094,.794,-.266,.094,.913,'#282428');
 const map=xyFace(-.260,0,.849);
 face(r,map,[[-.085,-.050],[.085,-.050],[.085,.051],[-.085,.051]],'#121820');
 rect(r,map,-.0775,-.0435,.155,.087,'#92968a',.001);
 // An illustrative map, with adjoining blocks and a route on the fitted 7-inch panel.
 for(let i=0;i<6;i++)for(let j=0;j<4;j++){
  const u=-.075+i*.025,v=-.040+j*.019,s=(j%2)*.0025;
  face(r,map,[[u+s,v],[u+.020+s,v+.001],[u+.017,v+.016],[u,v+.015]],(i+j)%4?'#aaaa9c':'#849b78',.0013);
 }
 face(r,map,[[-.076,-.034],[-.048,-.009],[-.026,.002],[-.012,.038],[.002,.038],[-.013,-.001],[-.042,-.014],[-.069,-.036]],'#7596a6',.0016);
 for(const [a,b] of [[[-.067,.014],[-.013,.021]],[[-.013,.021],[.037,-.013]],[[.037,-.013],[.069,.006]]]){
  const [u,v]=a,[uu,vv]=b;
  face(r,map,[[u,v],[uu,vv],[uu,vv+.003],[u,v+.003]],'#dfbc75',.0019);
 }
 rect(r,map,-.076,-.041,.152,.007,'#424849',.0022);
 face(r,map,[[-.006,-.007],[0,.005],[.007,-.009],[0,-.006]],'#f8efe1',.0025);
}
