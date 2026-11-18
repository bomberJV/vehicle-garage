// 2026 Honda HR-V outer body. The side elevation is fitted to a photograph of a
// 2025 HR-V EX-L registered at both wheel centers (2654 mm wheelbase), with the
// overhangs scaled to the 4567 mm overall length and the roof held to Honda's
// 1610 mm height. Front and rear details are measured from straight-on
// photographs of the same generation, using the body width as the scale.
import {glazingFace} from './surface-materials.js';
import {coachwork,panel,deckPanel,tint as tone} from './exterior-coachwork.js';

const BLACK='#16191b',CLAD='#1d2124',TRIM='#2a3034',CHROME='#c9cfd0',GRILLE='#0c0f11',GLOSS='#262c30',LINER='#0f1213';
const mix=(a,b,t)=>a+(b-a)*t,clamp=t=>Math.max(0,Math.min(1,t));
// Body-side section offset by height fraction (rocker 0 to shoulder 1): the rocker
// tucks in under the cladding, a long concave scoop runs across the lower doors,
// and a sharp character line sits just under the handles.
export function hrvSide(l){
 const scoop=l>.22&&l<.72?-.016*Math.sin(Math.PI*(l-.22)/.50):0;
 const crease=.007*Math.max(0,1-Math.abs(l-.80)/.06);
 return -.030*(1-Math.min(1,l/.22))**2+scoop+crease+.006*Math.sin(Math.PI*Math.min(1,l))-.030*Math.max(0,(l-.90)/.10);
}
// Daylight opening, (x,z) from the side photograph. Glass sits a little inside the
// black frame; the B-pillar and the thin pillar ahead of the quarter glass are
// black, and so is the A-pillar with the mirror sail.
const frontWindow=[[-.80,1.214],[-.37,1.560],[.22,1.590],[.235,1.212]];
const rearWindow=[[.365,1.214],[.365,1.594],[1.06,1.583],[1.12,1.226]];
const quarter=[[1.165,1.232],[1.14,1.575],[1.40,1.448],[1.54,1.246]];
export const hrvBody={
 wb:2.654,arch:.44,axleZ:.398,base:.27,hoodEnd:-.98,deckStart:2.04,
 door:[-.87,.30,1.13],belt:1.20,roofZ:1.615,roofWidth:.630,cabinWidth:.775,hoodFrac:.77,hoodCrown:.016,
 hatch:true,cladding:true,claddingLip:.062,claddingColor:'#202427',
 // The black lower bumpers wrap onto the sides ahead of and behind the arches.
 bandColor:(x,j)=>x<-1.6?(j<=2?'#202427':null):x>1.83&&j<=3?'#202427':null,customEnds:true,sideSection:(w,l)=>w+hrvSide(l),
 // A black sill strip, then gently varied paint; the brightest band is the
 // character line, with a small shadow under it.
 sideLevels:[0,.10,.22,.40,.60,.74,.79,.83,.92,1],sideTints:[1,.84,.88,.89,.93,.86,1.10,1.00,.96],
 cabinFloor:.44,cabin:{cargo:[.98,.48,.60],sillEnd:.92,rearSeat:[.48,.88,.57,.70,.86,.96]},
 backGlassOpacity:.92,backGlassColor:'#141a1e',
 windowGlass:{front:['#2c3a40',.62],privacy:['#141b1f',.88]},windshieldGlass:['#41525a',.48],
 moonroofGlass:['#151b1e',.92],moonroofFrame:BLACK,aPillarColor:TRIM,mirrorX:-.56,mirrorOut:.012,mirrorLift:.030,
 // Black A-pillar trim and the mirror sail at the front corner of the door glass.
 blackouts:[[[-.98,1.188],[-.88,1.198],[-.355,1.572],[-.27,1.592]],[[-.80,1.214],[-.50,1.214],[-.70,1.335]]],
 stations:[[-2.16,.80,.985],[-2.10,.855,1.02],[-2.02,.885,1.045],[-1.95,.900,1.08],[-1.62,.905,1.12],[-1.327,.912,1.15],[-.98,.905,1.175],[-.70,.905,1.19],
  [.30,.912,1.205],[1.00,.915,1.22],[1.30,.912,1.228],[1.70,.885,1.255],[2.04,.815,1.27],[2.2235,.80,1.17]],
 wind:[[-.98,1.185],[-.27,1.590]],
 roof:[[-.27,1.590],[-.05,1.607],[.30,1.615],[.70,1.614],[1.05,1.607],[1.35,1.595],[1.70,1.572]],rear:[[1.70,1.572],[2.04,1.275]],
 frontWindow,rearWindow,quarter,
 windowTopLine:[[-.37,1.568],[-.05,1.598],[.30,1.606],[1.05,1.598],[1.40,1.462]]
};
const B=hrvBody;
function section(x){
 const st=B.stations;let i=0;while(i<st.length-2&&x>st[i+1][0])i++;
 const [a,wa,za]=st[i],[b,wb,zb]=st[i+1],t=clamp((x-a)/(b-a));return [mix(wa,wb,t),mix(za,zb,t)];
}
// Same side section as the shared generator, so the ends meet the side panels exactly.
function sideY(x,z){
 const [w,top]=section(x),level=clamp((z-B.base)/(top-B.base));
 return w+hrvSide(level);
}
function poly(r,id,pts,c){r.tag(id,()=>r.polygon(pts,c,false));}

// An end of the car: a surface that bulges from the end station to the bumper face.
// u runs across the car (-1..1), v from the bottom edge to the top edge.
function endSurface(end){
 const front=end<0,x0=front?B.stations[0][0]:B.stations.at(-1)[0],top0=section(x0)[1];
 const dir=front?-1:1;
 // Front: nearly vertical, rounding back into the bonnet edge. Rear: the bumper
 // stands proud below the hatch.
 const bulge=front?v=>.095+.018*Math.sin(Math.PI*Math.min(1,v*1.2))-.075*Math.max(0,v-.75)/.25
  :v=>.035+.015*Math.sin(Math.PI*Math.min(1,v*1.6))-.03*Math.max(0,v-.45)/.55;
 // Plan shape across the end: the front is flat in the middle and turns back hard
 // at the corners; the rear stays as it was.
 const plan=front?u=>Math.sqrt(1-Math.abs(u)**4):u=>1-Math.abs(u)**3;
 const hoodHalf=section(x0)[0]*B.hoodFrac;
 const zTop=y=>front?top0+(Math.abs(y)<hoodHalf?.016+B.hoodCrown*(1-(y/hoodHalf)**2):.016*clamp((section(x0)[0]-.034-Math.abs(y))/(section(x0)[0]-.034-hoodHalf))):top0;
 const at=(u,v,lift=0)=>{
  const yEdgeLow=sideY(x0,B.base+.01),zt=zTop(Math.abs(u)*yEdgeLow),z=mix(B.base,zt,v),yEdge=sideY(x0,Math.min(z,top0));
  const y=u*yEdge,x=x0+dir*(bulge(v)*plan(u)+lift);
  return [x,y,z];
 };
 // Place a (y,z) outline on the surface, lifted outward by `lift`.
 const on=(y,z,lift=.006)=>{
  const yEdge=sideY(x0,Math.min(z,top0)),u=Math.max(-1,Math.min(1,y/yEdge));
  const zt=zTop(Math.abs(y)),v=clamp((z-B.base)/(zt-B.base));
  return at(u,v,lift);
 };
 const vAt=(z,y=0)=>clamp((z-B.base)/(zTop(Math.abs(y))-B.base));
 return {at,on,x0,dir,top0,vAt};
}
// colorAt(z, |y|) returns a color, or null to leave the cell open (the hatch).
function drawEnd(r,s,id,colorAt,vs){
 const us=[-1,-.97,-.92,-.84,-.75,-.62,-.50,-.36,-.22,-.08,.08,.22,.36,.50,.62,.75,.84,.92,.97,1];
 const rows=vs??Array.from({length:15},(_,i)=>i/14);
 r.tag(id,()=>{for(let i=1;i<us.length;i++)for(let j=1;j<rows.length;j++){
  const a=us[i-1],b=us[i],c=rows[j-1],d=rows[j],p=[s.at(a,c),s.at(b,c),s.at(b,d),s.at(a,d)];
  const z=(p[0][2]+p[2][2])/2,y=Math.max(...p.map(q=>Math.abs(q[1])));
  const color=colorAt(z,y,(a+b)/2);if(color)r.polygon(p,color,false);
 }});
}
const mirrorY=pts=>pts.map(([y,z])=>[-y,z]).reverse();
function feature(r,id,s,pts,color,lift){poly(r,id,pts.map(([y,z])=>s.on(y,z,lift)),color);}
function both(r,id,s,half,color,lift){feature(r,id,s,half,color,lift);feature(r,id,s,mirrorY(half),color,lift);}

function frontEnd(r,paint){
 const s=endSurface(-1);
 // Heights from the side photograph, widths and layout from the straight-on photo
 // (scaled at the bumper face). Painted down to 0.45 m between the corner pockets;
 // the lower bumper below that is black.
 drawEnd(r,s,'body.structure',(z,y,u)=>z<.45?CLAD:tone(paint,.82+.22*clamp((z-.45)/.52)-.06*Math.abs(u)**4));
 // Large features are drawn as narrow vertical strips between a lower and an upper
 // edge, so they follow the curved fascia instead of cutting through it.
 const edge=(pts,y)=>{let i=1;while(i<pts.length-1&&y>pts[i][0])i++;const [ya,za]=pts[i-1],[yb,zb]=pts[i];return mix(za,zb,clamp((y-ya)/(yb-ya)));};
 const band=(lower,upper,color,lift,{tag='lighting.headlamp',glass=false,mirror=true}={})=>{
  const y0=Math.max(lower[0][0],upper[0][0]),y1=Math.min(lower.at(-1)[0],upper.at(-1)[0]),n=Math.max(2,Math.ceil((y1-y0)/.03));
  for(const sgn of mirror?[-1,1]:[1])for(let i=0;i<n;i++){
   const ya=mix(y0,y1,i/n),yb=mix(y0,y1,(i+1)/n),q=(y,z)=>s.on(sgn*y,z,lift);
   const pts=[q(ya,edge(lower,ya)),q(yb,edge(lower,yb)),q(yb,edge(upper,yb)),q(ya,edge(upper,ya))];
   r.tag(tag,()=>glass?glazingFace(r,pts,'#c3d2d8',.18):r.polygon(sgn<0?pts.reverse():pts,color,false));
  }
 };
 // Grille: a wide rounded octagon set low between the lamps. Inside, three rows of
 // long hexagonal cells made by gloss-black bars that kink up and down.
 const grille=[[-.36,.818],[.36,.818],[.45,.795],[.48,.715],[.455,.635],[.37,.59],[-.37,.59],[-.455,.635],[-.48,.715],[-.45,.795]];
 const half=z=>{let best=0;for(let i=0;i<grille.length;i++){const [y0,z0]=grille[i],[y1,z1]=grille[(i+1)%grille.length];if((z-z0)*(z-z1)<=0&&z0!==z1)best=Math.max(best,Math.abs(mix(y0,y1,(z-z0)/(z1-z0))));}return best;};
 const gLow=[[-.48,.715],[-.455,.635],[-.37,.59],[.37,.59],[.455,.635],[.48,.715]],gTop=[[-.48,.715],[-.45,.795],[-.36,.818],[.36,.818],[.45,.795],[.48,.715]];
 const grow=(pts,dz)=>pts.map(([y,z])=>[y*1.035,z+dz]);
 band(grow(gLow,-.009),grow(gTop,.009),'#2b3134',.007,{tag:'body.structure',mirror:false});
 band(gLow,gTop,GRILLE,.009,{tag:'body.structure',mirror:false});
 r.tag('body.structure',()=>{
  const rows=[.792,.754,.716,.678,.640,.606];
  for(let k=0;k<rows.length;k++){
   const z=rows[k],w=half(z)-.025;if(w<=0)continue;
   // Each bar zig-zags: up over a cell, down between cells, offset row to row.
   const pts=[];for(let y=-w;y<=w+1e-6;y+=.0625){const i=Math.round((y+w)/.0625);pts.push([y,z+((i+k)%2?.010:-.010)]);}
   for(let i=1;i<pts.length;i++){const [ya,za]=pts[i-1],[yb,zb]=pts[i];
    r.polygon([s.on(ya,za-.0045,.013),s.on(yb,zb-.0045,.013),s.on(yb,zb+.0045,.013),s.on(ya,za+.0045,.013)],'#262d31',false);
    r.polygon([s.on(ya,za+.0045,.0135),s.on(yb,zb+.0045,.0135),s.on(yb,zb+.0075,.0135),s.on(ya,za+.0075,.0135)],'#4a5458',false);}
  }
 });
 // Honda emblem: chrome H inside a rounded chrome frame, on the panel above the grille.
 r.tag('body.structure',()=>{
  const c=(y,z,l=.016)=>s.on(y,z,l),z0=.848,z1=.912,w=.056,t=.006;
  for(const [a,b] of [[[-w,z0],[w,z0+t]],[[-w,z1-t],[w,z1]],[[-w,z0],[-w+t,z1]],[[w-t,z0],[w,z1]]])
   r.polygon([c(a[0],a[1]),c(b[0],a[1]),c(b[0],b[1]),c(a[0],b[1])],CHROME,false);
  for(const y of [-.024,.024]){const k=y<0?-1:1;r.polygon([c(y-.006,z0+.012),c(y+.006,z0+.012),c(y+.006+k*.005,z1-.012),c(y-.006+k*.005,z1-.012)],CHROME,false);}
  r.polygon([c(-.022,.874),c(.022,.874),c(.022,.882),c(-.022,.882)],CHROME,false);
  r.polygon([c(-.040,z1-.016),c(.040,z1-.016),c(.036,z1-.010),c(-.036,z1-.010)],CHROME,false);
 });
 // Corner pockets: tall black recesses at the bumper corners with a thin brow that
 // runs inboard toward the grille, and a silver sweep along the bottom of each.
 band([[.49,.636],[.555,.632],[.57,.53],[.61,.47],[.70,.455],[.80,.455]],[[.49,.645],[.56,.650],[.80,.665]],BLACK,.008,{tag:'body.structure'});
 band([[.585,.58],[.61,.51],[.69,.49],[.78,.49]],[[.585,.62],[.78,.640]],'#0b0d0e',.010,{tag:'body.structure'});
 band([[.60,.370],[.70,.382],[.80,.425]],[[.60,.372],[.62,.395],[.72,.425],[.80,.470]],'#b3b9bb',.012,{tag:'body.structure'});
 // Lower intake: a wide honeycomb band in a black frame, under the plate.
 feature(r,'body.structure',s,[[-.55,.30],[.55,.30],[.53,.44],[-.53,.44]],BLACK,.007);
 r.tag('body.structure',()=>{for(let j=0;j<4;j++)for(let i=-13;i<=13;i++){
  const y=i*.04+(j%2?.02:0),z=.318+j*.032;if(Math.abs(y)>.51-j*.006)continue;
  const c=[[y-.014,z],[y,z+.011],[y+.014,z],[y,z-.011]];r.polygon(c.map(([yy,zz])=>s.on(yy,zz,.010)),'#22292c',false);
 }});
 // Bonnet shut line across the nose, from one lamp tip to the other.
 feature(r,'body.structure',s,[[-.42,.946],[-.20,.940],[0,.938],[.20,.940],[.42,.946],[.42,.951],[.20,.945],[0,.943],[-.20,.945],[-.42,.951]],'#3a4144',.012);
 // License plate on the painted band below the grille.
 feature(r,'body.structure',s,[[-.165,.41],[.165,.41],[.165,.585],[-.165,.585]],'#20272a',.016);
 // Headlamps: slim, pointed at the grille end and deepest at the corner, sitting
 // right under the bonnet line. A smoked chrome housing, a dark projector at the
 // outer end and a white LED strip along the lower edge that hooks up at the tip.
 const lensLow=[[.41,.912],[.47,.887],[.58,.868],[.70,.858],[.79,.860]],lensTop=[[.41,.915],[.47,.944],[.58,.965],[.70,.979],[.79,.983]];
 band(lensLow,lensTop,'#4f585e',.008);
 band([[.46,.930],[.58,.947],[.70,.958],[.785,.962]],[[.46,.934],[.58,.962],[.70,.976],[.785,.978]],'#2b3236',.010);
 band([[.50,.895],[.62,.884],[.76,.880]],[[.50,.912],[.62,.903],[.76,.900]],'#8f999e',.010);
 band([[.42,.909],[.47,.885],[.58,.867],[.75,.859]],[[.42,.918],[.47,.894],[.58,.876],[.75,.868]],r.lights?'#f6faf7':'#dfe7e8',.012);
 band(lensLow,lensTop,null,.016,{glass:true});
 // The lamps continue back along each fender to an amber marker.
 r.tag('lighting.headlamp',()=>{for(const side of [-1,1]){
  const xs=[s.x0,-2.10,-2.03,-1.96,-1.90,-1.84];
  for(let i=1;i<xs.length;i++){
   const p=(x,k,dy)=>{const t=(x-xs[0])/(xs.at(-1)-xs[0]),lo=mix(.860,.920,t),hi=mix(.983,.975,t),z=mix(lo,hi,k);return [x,side*(sideY(x,z)+dy),z];};
   r.polygon([p(xs[i-1],0,.010),p(xs[i],0,.010),p(xs[i],1,.010),p(xs[i-1],1,.010)],i<3?'#59636a':'#4c565b',false);
   r.polygon([p(xs[i-1],.55,.012),p(xs[i],.55,.012),p(xs[i],.90,.012),p(xs[i-1],.90,.012)],i<4?'#2b3236':'#b7c0c4',false);
   if(i<4)r.polygon([p(xs[i-1],.02,.013),p(xs[i],.02,.013),p(xs[i],.12,.013),p(xs[i-1],.12,.013)],r.lights?'#f6faf7':'#dfe7e8',false);
  }
 }});
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const p=(x,z)=>[x,side*(sideY(x,z)+.014),z];
  r.polygon([p(-1.90,.930),p(-1.84,.932),p(-1.84,.970),p(-1.90,.972)],'#c58b45',false);
 }});
 // Corner pocket and silver sweep continue onto the side of the bumper.
 r.tag('body.structure',()=>{for(const side of [-1,1]){
  const p=(x,z,dy)=>[x,side*(sideY(x,z)+dy),z];
  r.polygon([p(s.x0,.425,.006),p(-2.06,.452,.006),p(-2.06,.478,.006),p(s.x0,.470,.006)],'#b3b9bb',false);
 }});
}

// Hatch outline, rows of (x, half-width, z) from the glass down to the bumper.
const hatchRows=[[2.04,.72,1.275],[2.13,.69,1.19],[2.19,.64,1.09],[2.222,.625,.97],[2.238,.63,.82],[2.244,.64,.655]];
const SMOKE='#241619';
function hatchAt(z){let i=1;while(i<hatchRows.length-1&&z<hatchRows[i][2])i++;const [x,y,za]=hatchRows[i-1],[xx,yy,zb]=hatchRows[i],t=clamp((za-z)/(za-zb));return [mix(x,xx,t),mix(y,yy,t)];}

function rearEnd(r,paint){
 const s=endSurface(1);
 // The bumper and the corners beside the hatch; the hatch itself is a separate panel.
 const vs=[.27,.30,.33,.36,.39,.47,.54,.61,.655,.72,.80,.88,.96,1.04,1.11,1.17].map(z=>s.vAt(z));
 drawEnd(r,s,'body.structure',(z,y)=>{
  if(z>.66&&y<hatchAt(z)[1]-.002)return null;
  return z<.33?CLAD:z<.39?'#9aa2a5':z<.61?CLAD:tone(paint,.80+.18*clamp((z-.61)/.5));
 },vs);
 both(r,'lighting.indicator',s,[[.43,.575],[.68,.575],[.68,.59],[.43,.59]],'#8d2a31',.008);
 // Single exhaust outlet under the right side of the bumper.
 r.tag('body.structure',()=>{const c=s.on(-.62,.35,.004);r.rod([c[0]-.06,c[1],c[2]],[c[0]+.012,c[1],c[2]],.037,'#b3babb',16);r.discX(c[0]+.013,c[1],c[2],.030,'#101518',16);});
 // Outer tail lamps on the corners: vertical strips, each at one plan position.
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const ys=Array.from({length:9},(_,i)=>.64+i*(.79-.64)/8);
  const lo=y=>mix(1.005,1.035,(y-.64)/.15),hi=y=>mix(1.112,1.165,(y-.64)/.15);
  for(let i=1;i<ys.length;i++){
   const col=y=>{const q=s.on(y,(lo(y)+hi(y))/2,.006);return [q[0],side*y];};
   const [xa,ya]=col(ys[i-1]),[xb,yb]=col(ys[i]);
   r.polygon([[xa,ya,lo(ys[i-1])],[xb,yb,lo(ys[i])],[xb,yb,hi(ys[i])],[xa,ya,hi(ys[i-1])]],SMOKE,false);
   r.polygon([[xa+.002,ya,lo(ys[i-1])+.013],[xb+.002,yb,lo(ys[i])+.013],[xb+.002,yb,lo(ys[i])+.031],[xa+.002,ya,lo(ys[i-1])+.031]],r.lights?'#ff5a64':'#c8323d',false);
   if(i>=ys.length-3)r.polygon([[xa+.002,ya,lo(ys[i-1])+.031],[xb+.002,yb,lo(ys[i])+.031],[xb+.002,yb,hi(ys[i])-.012],[xa+.002,ya,hi(ys[i-1])-.012]],r.lights?'#ff5a64':'#9a2c35',false);
  }
 }});
}

// Hatch: the panel from the glass to the bumper, the inner tail lamps and the
// gloss-black garnish between them, the badges and the roof spoiler.
function hatch(r,paint){
 const rows=hatchRows;
 deckPanel(r,true,()=>{
  for(let i=1;i<rows.length;i++){
   const [x,y,z]=rows[i-1],[xx,yy,zz]=rows[i];
   r.polygon([[x,-y,z],[x,y,z],[xx,yy,zz],[xx,-yy,zz]],tone(paint,1.04-(i-1)*.045),false);
  }
  const at=(y,z,lift=.004)=>{const [x]=hatchAt(z);return [x+lift,y,z];};
  for(const sgn of [-1,1]){
   r.polygon([at(sgn*.33,1.045),at(sgn*.45,1.030),at(sgn*.62,1.005),at(sgn*.62,1.112),at(sgn*.45,1.098),at(sgn*.33,1.085)],SMOKE,false);
   r.polygon([at(sgn*.36,1.050,.006),at(sgn*.62,1.018,.006),at(sgn*.62,1.036,.006),at(sgn*.36,1.064,.006)],r.lights?'#ff5a64':'#c8323d',false);
   r.polygon([at(sgn*.50,1.080,.006),at(sgn*.62,1.085,.006),at(sgn*.62,1.096,.006),at(sgn*.50,1.090,.006)],r.lights?'#ff5a64':'#9a2c35',false);
  }
  r.polygon([at(-.33,1.045,.003),at(.33,1.045,.003),at(.33,1.085,.003),at(-.33,1.085,.003)],GLOSS,false);
  // Emblem, plate recess and the model badge.
  r.polygon([at(-.045,1.165,.006),at(.045,1.165,.006),at(.045,1.205,.006),at(-.045,1.205,.006)],CHROME,false);
  r.polygon([at(-.17,.85,.005),at(.17,.85,.005),at(.17,.965,.005),at(-.17,.965,.005)],tone(paint,.66),false);
  r.polygon([at(-.47,.905,.006),at(-.36,.905,.006),at(-.36,.92,.006),at(-.47,.92,.006)],CHROME,false);
  // Roof spoiler: it carries the roof line past the glass and ends in a black lip
  // over the high-mounted stop lamp.
  const sp=[[1.36,.60,1.600],[1.55,.60,1.594],[1.70,.59,1.580],[1.80,.56,1.560]];
  for(let i=1;i<sp.length;i++){const [x,y,z]=sp[i-1],[xx,yy,zz]=sp[i];r.polygon([[x,-y,z],[x,y,z],[xx,yy,zz],[xx,-yy,zz]],tone(paint,1.08-i*.04),false);}
  for(const sgn of [-1,1])r.polygon(sp.map(([x,y,z])=>[x,sgn*y,z]).concat([[1.80,sgn*.56,1.545],[1.36,sgn*.60,1.592]]),GLOSS,false);
  r.polygon([[1.80,-.56,1.560],[1.80,.56,1.560],[1.76,.54,1.538],[1.76,-.54,1.538]],BLACK,false);
  r.box(1.775,-.14,1.536,1.785,.14,1.542,'#a2393f');
  r.rod([2.00,-.30,1.31],[2.00,.24,1.31],.008,BLACK,8);
 });
}

// Tail lamps wrapping onto the rear quarters: vertical strips, one plan position each.
function quarterLamps(r){
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const xs=Array.from({length:16},(_,i)=>1.90+i*(2.2235-1.90)/15);
  const t=x=>(x-xs[0])/(xs.at(-1)-xs[0]);
  const lo=x=>mix(1.095,1.035,t(x)),hi=x=>mix(1.125,1.17,t(x));
  const col=(x,dy)=>side*(sideY(x,(lo(x)+hi(x))/2)+dy);
  for(let i=1;i<xs.length;i++){
   const a=xs[i-1],b=xs[i];
   r.polygon([[a,col(a,.010),lo(a)],[b,col(b,.010),lo(b)],[b,col(b,.010),hi(b)],[a,col(a,.010),hi(a)]],SMOKE,false);
   r.polygon([[a,col(a,.013),lo(a)+.008],[b,col(b,.013),lo(b)+.008],[b,col(b,.013),lo(b)+.022],[a,col(a,.013),lo(a)+.022]],r.lights?'#ff5a64':'#c8323d',false);
  }
 }});
}

// Wheelhouse liners: a black band inside each arch and a wall at the tire's inner
// face, so the opening reads dark the way the real arches do.
function archLiners(r){
 r.tag('body.structure',()=>{
  for(const ax of [-B.wb/2,B.wb/2])for(const side of [-1,1]){
   const n=24,wall=.66,R=B.arch-.004,r0=.372;
   for(let i=0;i<n;i++){
    const a=i/n*Math.PI,b=(i+1)/n*Math.PI;
    const ring=(t,rad,y)=>[ax+Math.cos(t)*rad,side*y,B.axleZ+Math.sin(t)*rad];
    const outer=t=>sideY(ax+Math.cos(t)*R,B.axleZ+Math.sin(t)*R)-.01;
    r.polygon([ring(a,R,wall),ring(b,R,wall),ring(b,R,outer(b)),ring(a,R,outer(a))],LINER,false);
    r.polygon([ring(a,r0,wall),ring(b,r0,wall),ring(b,R,wall),ring(a,R,wall)],LINER,false);
   }
  }
 });
}

// Fuel door and shark-fin antenna.
function sideDetail(r,paint){
 r.tag('body.structure',()=>{
  const fd=(x,z)=>[x,sideY(x,z)+.003,z];
  r.polygon([fd(1.38,1.045),fd(1.51,1.045),fd(1.51,1.135),fd(1.38,1.135)],tone(paint,.88),false);
  const f=[[1.20,1.611],[1.30,1.608],[1.285,1.648],[1.24,1.654]];
  for(const y of [-.012,.012])r.polygon(f.map(([x,z])=>[x,y,z]),BLACK,false);
  r.polygon([[1.20,-.012,1.611],[1.20,.012,1.611],[1.24,.012,1.654],[1.24,-.012,1.654]],BLACK,false);
  r.polygon([[1.24,-.012,1.654],[1.24,.012,1.654],[1.285,.012,1.648],[1.285,-.012,1.648]],BLACK,false);
 });
}

export function buildHrvExterior(r,paint){
 coachwork(r,B,paint);
 frontEnd(r,paint);
 rearEnd(r,paint);
 hatch(r,paint);
 quarterLamps(r);
 archLiners(r);
 sideDetail(r,paint);
 // Bonnet seam line across the nose.
 panel(r,'bonnet',[0,0,.71],'body.hood',()=>{});
}
