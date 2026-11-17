import {panel,deckPanel,tint} from './exterior-coachwork.js';
import {drawBmwCabin,drawBmwQuarterWindow} from './bmw-cabin-closures.js';

export const e46BodySource={label:'BMW 325Ci/330Ci Coupé owner’s manual · dimensions, p. 147',url:'https://bmw330ci.net/the330ci/2003Manual-3SeriesCoupe.pdf#page=147'};
// X is measured from the midpoint of the 2725-mm wheelbase, and Z is measured
// in the chassis frame, whose stock tyre contact is z=.040. The intermediate
// body stations are traced from the US manual profile, not factory CAD knots.
const front=[[-.657,.955],[-.391,1.114],[-.110,1.272],[.100,1.323],[.304,1.339],[.642,1.344],[.550,.965]];
const quarter=[[.585,.986],[.734,1.328],[.923,1.313],[1.081,1.272],[1.250,1.185],[1.332,1.114],[1.373,1.063],[1.337,1.011],[1.245,.996]];
const roof=[[-.185,1.254],[-.085,1.301],[.095,1.345],[.286,1.357],[.493,1.359],[.671,1.357],[.851,1.352],[1.015,1.330],[1.160,1.301]];
const wind=[[-.875,.956],roof[0]],rear=[roof.at(-1),[1.797,1.120]];
export const e46BodyProfile={
 wb:2.725,arch:.352,axleZ:.356,base:.204,hoodEnd:-.892,deckStart:1.820,
 door:[-.720,.589],doorSill:.344,belt:.961,roofWidth:.646,cabinWidth:.806,roofCrown:.050,screenSweep:.065,sideRound:.017,roofPinch:.025,
 hoodFrac:.815,rubstrip:true,paintedRub:true,rubHeight:.587,coupe:true,customEnds:true,archReturn:0,
 // Wheel-arch lip and the peak of the body character line share the measured
 // 1757-mm sheet-metal envelope. The ordinate here never includes a mirror.
 lowerHem:x=>.204+.077*Math.max(0,(-x-1.688)/.376)+.095*Math.max(0,(x-1.700)/.516),
 sideStation(x,z){
  // The rear closure seam turns forward toward the sill; the front seam
  // rounds into the rocker. Both sides of each cut use the same trace.
  const t=Math.max(0,Math.min(1,(.875-z)/.531));
  return x+.032*t*t*Math.max(0,1-Math.abs(x+.72)/.18)-.124*t*t*Math.max(0,1-Math.abs(x-.589)/.255);
 },
 sideSection:(w,h)=>w-.031*(1-h)**2-.032*Math.max(0,(h-.84)/.16),
 stations:[[-2.064,.747,.817],[-1.986,.820,.824],[-1.791,.856,.846],[-1.538,.871,.866],[-1.3625,.8785,.878],[-1.083,.870,.907],[-.892,.863,.927],[-.392,.855,.946],[.10,.853,.955],[.589,.859,.969],[1.019,.869,.977],[1.3625,.8785,.990],[1.627,.866,.990],[1.820,.863,1.053],[1.961,.844,1.020],[2.088,.806,1.002],[2.216,.762,.982]],
 hoodLanes:[0,.55,.65,.68,.706,.82,1],hoodPress:t=>t===.68?.004:0,
 wind,roof,rear,frontWindow:front,quarter,
 drawCabin:drawBmwCabin,drawQuarter:drawBmwQuarterWindow,windowSurround,drawMirror,fixedWipers,doorHandle
};
function windowSurround(r,side,at,paint){
 const fill=(a,b,color)=>r.polygon([...a.map(at),...b.slice().reverse().map(at)],color,false);
 const sweep=(row,edge,color)=>{for(let i=1;i<row.length;i++)fill([row[i-1],row[i]],[edge[i-1],edge[i]],color);};
 // The A and C pillars carry the roof. Only the two large frameless panes of
 // the front doors pull away from these fixed pillars in an exploded view.
 r.tag('body.structure',()=>{
  // Put the upper glass against the underside of the sloping A-pillar;
  // the fixed frame follows the real roof edge, including the C-pillar return.
  const from=[...front.slice(0,-1),...quarter.slice(1,7)];
  const fixed=[wind[0],[-.478,1.135],roof[0],roof[2],roof[3],roof[5],roof[6],roof[7],roof[8],[1.304,1.252],[1.457,1.202],rear[1]];
  sweep(from,fixed,tint(paint,.98));
  // The curved rear glass edge turns down and forward; the painted trailing
  // pillar lands on the quarter panel and the fixed rear window surround.
  fill([quarter[6],quarter[7]],[[1.797,1.120],[1.820,1.053]],tint(paint,.96));
  fill([quarter[7],quarter[8]],[[1.820,1.053],[1.3625,.990]],tint(paint,.95));
  fill([front.at(-1),front.at(-2)],[quarter[0],quarter[1]],'#30373b');
  const border=[...front.slice(0,-1),...quarter.slice(1),quarter[0]];
  for(let i=1;i<border.length;i++){
   const a=at(border[i-1]),b=at(border[i]);
   // Weatherstrip stays with the window aperture. The outboard bright edge
   // rounds the rear corner and turns forward into the Hofmeister kink.
   r.rod(a,b,.008,'#42494c',8);
   const bright=p=>[p[0],p[1]+side*.006,p[2]+.001];
   r.rod(bright(a),bright(b),.0038,'#a9b0ae',7);
  }
 });
}
function drawMirror(r,side,paint){
 r.tag(side<0?'body.mirror-left':'body.mirror-right',()=>{
  const inner=side*.796;
  r.polygon([[-.706,inner,.909],[-.600,inner,.921],[-.627,side*.785,.991]],'#343b3e',false);
  r.rod([-.651,side*.793,.943],[-.630,side*.876,.965],.020,'#333b40',9);
  const shape=[[-.080,-.036],[-.073,-.060],[-.019,-.066],[.056,-.056],[.080,-.035],[.080,.018],[.061,.043],[.006,.052],[-.062,.046],[-.080,.027]];
  const ring=(x,scale)=>shape.map(([y,z])=>[x,side*(.8935+y*scale),1.004+z*scale]);
  const from=ring(-.725,.68),bow=ring(-.696,1),trailing=ring(-.592,.94),seal=ring(-.587,.85);
  const band=(a,b,col)=>{for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],col,false);}};
  r.polygon(from,tint(paint,.94),false);band(from,bow,paint);band(bow,trailing,tint(paint,.96));band(trailing,seal,'#30383c');r.polygon(seal,'#8d9da0',false);
 });
}
function doorHandle(r,side,paint){
 // Sculpt the recess and arched bow into the broad stamped door face. The high
 // point of the handle stays inside the envelope of the front/rear wheel arches.
 const x=.486,z=.859,y=.851;
 const recess=Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return[x+.085*Math.cos(a),side*y,z+.023*Math.sin(a)];});
 r.polygon(recess,tint(paint,.67),false);
 const bow=[[-.074,.002,-.006],[-.052,.011,.003],[.037,.014,.004],[.060,.008,.001],[.070,.001,-.006]];
 for(let i=1;i<bow.length;i++){
  const at=p=>[x+p[0],side*(y+p[1]),z+p[2]];
  r.rod(at(bow[i-1]),at(bow[i]),.008,tint(paint,1.05),10);
 }
}
function fixedWipers(r){
 r.tag('body.structure',()=>{
  for(const [y,width] of [[-.32,.455],[.361,.406]]){
   r.rod([-.867,y-.14,.958],[-.802,y+.045,1.001],.0065,'#343b3d',8);
   r.rod([-.817,y-width*.45,.991],[-.784,y+width*.55,1.014],.006,'#343b3d',8);
  }
 });
}
export function finishE46Body(r,paint){
 r.tag('body.structure',()=>{
  for(const side of [-1,1]){
   const y=.725*side;
   r.rod([-.775,y,.244],[.672,y,.244],.026,tint(paint,.75),8);
   for(const axle of [-1.3625,1.3625])for(let i=0;i<24;i++){
    const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
    const edge=(t,lane)=>[axle+.354*Math.cos(t),side*(lane?.851:.592),.356+.354*Math.sin(t)];
    r.polygon([edge(a,0),edge(a,1),edge(b,1),edge(b,0)],'#444a4d',false);
    r.polygon([[axle,side*.592,.356],edge(a,0),edge(b,0)],'#363b3e',false);
   }
  }
  // Fixed trunk floor and inner wheel housings remain visible beneath the lid.
  const tray=[[1.440,-.555,.472],[2.164,-.515,.472],[2.164,.515,.472],[1.440,.555,.472]];
  r.polygon(tray,'#41484a',false);
  for(const side of [-1,1]){
   const field=[[1.444,.554,.472],[2.162,.514,.472],[2.162,.569,.783],[1.761,.607,.844],[1.445,.602,.725]];
   r.polygon(field.map(([x,y,z])=>[x,side*y,z]),'#4a5050',false);
  }
 });
}
