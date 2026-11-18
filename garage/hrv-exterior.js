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
 bandColor:(x,j)=>Math.abs(x)>1.83&&j<=3?'#202427':null,customEnds:true,sideSection:(w,l)=>w+hrvSide(l),
 // A black sill strip, then gently varied paint; the brightest band is the
 // character line, with a small shadow under it.
 sideLevels:[0,.10,.22,.40,.60,.74,.79,.83,.92,1],sideTints:[1,.84,.88,.89,.93,.86,1.10,1.00,.96],
 cabinFloor:.44,cabin:{cargo:[.98,.48,.60],sillEnd:.92,rearSeat:[.48,.88,.57,.70,.86,.96]},
 backGlassOpacity:.92,backGlassColor:'#141a1e',
 windowGlass:{front:['#2c3a40',.62],privacy:['#141b1f',.88]},windshieldGlass:['#41525a',.48],
 moonroofGlass:['#151b1e',.92],moonroofFrame:BLACK,aPillarColor:TRIM,mirrorX:-.56,mirrorOut:.012,mirrorLift:.030,
 // Black A-pillar trim and the mirror sail at the front corner of the door glass.
 blackouts:[[[-.98,1.188],[-.88,1.198],[-.355,1.572],[-.27,1.592]],[[-.80,1.214],[-.50,1.214],[-.70,1.335]]],
 stations:[[-2.2235,.855,1.005],[-2.17,.885,1.035],[-2.08,.900,1.06],[-1.95,.905,1.09],[-1.62,.905,1.12],[-1.327,.912,1.15],[-.98,.905,1.175],[-.70,.905,1.19],
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
 const bulge=front?v=>.035+.025*Math.sin(Math.PI*Math.min(1,v*1.2))-.05*Math.max(0,v-.7)/.3
  :v=>.035+.015*Math.sin(Math.PI*Math.min(1,v*1.6))-.03*Math.max(0,v-.45)/.55;
 const zTop=y=>front?top0+.03*(1-(y/.80)**2):top0;
 const at=(u,v,lift=0)=>{
  const yEdgeLow=sideY(x0,B.base+.01),zt=zTop(Math.abs(u)*yEdgeLow),z=mix(B.base,zt,v),yEdge=sideY(x0,Math.min(z,top0));
  const y=u*yEdge,x=x0+dir*(bulge(v)*(1-Math.abs(u)**3)+lift);
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
 // Painted upper fascia; the whole lower bumper is black below 0.56 m.
 drawEnd(r,s,'body.structure',(z,y,u)=>z<.56?CLAD:tone(paint,.80+.25*clamp((z-.56)/.45)-.06*Math.abs(u)**4));
 // Grille: one wide octagonal opening between the lamps, with stacked gloss-black
 // bars linked by short diagonals, all inside a dark field.
 const grille=[[-.38,.885],[.38,.885],[.47,.85],[.505,.80],[.47,.735],[.40,.70],[-.40,.70],[-.47,.735],[-.505,.80],[-.47,.85]];
 feature(r,'body.structure',s,grille,GRILLE,.008);
 r.tag('body.structure',()=>{
  const half=z=>z>.85?mix(.47,.38,(z-.85)/.035):z>.80?mix(.505,.47,(z-.80)/.05):z>.735?mix(.47,.505,(z-.735)/.065):mix(.40,.47,(z-.70)/.035);
  const bars=[.862,.828,.794,.760,.727];
  for(const z of bars){const w=half(z)-.02;r.polygon([s.on(-w,z-.006,.012),s.on(w,z-.006,.012),s.on(w,z+.006,.012),s.on(-w,z+.006,.012)],GLOSS,false);}
  for(let k=0;k<bars.length-1;k++){
   const z0=bars[k+1]+.006,z1=bars[k]-.006,w=Math.min(half(z0),half(z1))-.04;
   for(let y=-w+(k%2?.06:0);y<=w;y+=.12){
    r.polygon([s.on(y-.012,z0,.011),s.on(y+.012,z0,.011),s.on(y+.042,z1,.011),s.on(y+.018,z1,.011)],GLOSS,false);
   }
  }
 });
 // Honda emblem on the painted panel between the lamps.
 r.tag('body.structure',()=>{
  const c=(y,z,l=.016)=>s.on(y,z,l),z0=.935;
  for(const y of [-.03,.03])r.polygon([c(y-.006,z0),c(y+.006,z0),c(y+.006+(y<0?.004:-.004),z0+.036),c(y-.006+(y<0?.004:-.004),z0+.036)],CHROME,false);
  r.polygon([c(-.026,z0+.014),c(.026,z0+.014),c(.026,z0+.022),c(-.026,z0+.022)],CHROME,false);
  r.polygon([c(-.045,z0+.038),c(.045,z0+.038),c(.042,z0+.044),c(-.042,z0+.044)],CHROME,false);
 });
 // Lower bumper: corner pockets, the wide lower intake and a silver accent sweep.
 both(r,'body.structure',s,[[.64,.74],[.76,.74],[.80,.70],[.80,.53],[.70,.52],[.64,.56]],BLACK,.007);
 feature(r,'body.structure',s,[[-.62,.44],[.62,.44],[.60,.565],[-.60,.565]],BLACK,.007);
 r.tag('body.structure',()=>{for(let j=0;j<3;j++)for(let i=-11;i<=11;i++){
  const y=i*.05+(j%2?.025:0),z=.465+j*.034;if(Math.abs(y)>.56)continue;
  const c=[[y-.02,z],[y,z+.013],[y+.02,z],[y,z-.013]];r.polygon(c.map(([yy,zz])=>s.on(yy,zz,.010)),'#2a3236',false);
 }});
 for(const sg of [-1,1]){
  const arc=[[.56,.505],[.66,.495],[.76,.50],[.80,.52],[.80,.535],[.76,.515],[.66,.51],[.56,.52]];
  feature(r,'body.structure',s,sg<0?mirrorY(arc):arc,'#a4acaf',.010);
 }
 // License plate on the bumper below the grille.
 feature(r,'body.structure',s,[[-.155,.555],[.155,.555],[.155,.695],[-.155,.695]],'#20272a',.016);
 // Headlamps: wedge-shaped lenses, thin at the grille and tall at the corner,
 // with an LED line along the top edge and a dark projector body inside.
 for(const sgn of [-1,1]){
  const m=pts=>sgn<0?mirrorY(pts):pts;
  const lens=[[.45,.946],[.58,.930],[.70,.917],[.84,.912],[.85,1.008],[.70,1.000],[.58,.988],[.47,.976]];
  feature(r,'lighting.headlamp',s,m(lens),'#434d52',.008);
  // Chrome reflector bowls and a dark projector body under the clear cover.
  feature(r,'lighting.headlamp',s,m([[.49,.955],[.60,.943],[.60,.975],[.50,.968]]),'#c4ccd0',.010);
  feature(r,'lighting.headlamp',s,m([[.62,.930],[.74,.920],[.83,.917],[.83,.985],[.74,.990],[.62,.980]]),'#262e32',.010);
  feature(r,'lighting.headlamp',s,m([[.66,.938],[.76,.931],[.76,.972],[.66,.976]]),'#b8c1c5',.011);
  feature(r,'lighting.headlamp',s,m([[.47,.968],[.70,.990],[.85,.998],[.85,1.006],[.70,.999],[.47,.976]]),r.lights?'#f3f8f4':'#c9d4d6',.012);
  r.tag('lighting.headlamp',()=>glazingFace(r,m(lens).map(([y,z])=>s.on(y,z,.016)),'#c3d2d8',.18));
 }
 // The lamps wrap back along each front fender, tapering to an amber marker.
 r.tag('lighting.headlamp',()=>{for(const side of [-1,1]){
  const xs=[-2.2235,-2.16,-2.08,-2.00,-1.92,-1.85];
  for(let i=1;i<xs.length;i++){
   const p=(x,k,dy)=>{const t=(x-xs[0])/(xs.at(-1)-xs[0]),lo=mix(.915,.975,t),hi=mix(1.010,.995,t),z=mix(lo,hi,k);return [x,side*(sideY(x,z)+dy),z];};
   r.polygon([p(xs[i-1],0,.010),p(xs[i],0,.010),p(xs[i],1,.010),p(xs[i-1],1,.010)],i<3?'#262e32':'#434d52',false);
   r.polygon([p(xs[i-1],.82,.013),p(xs[i],.82,.013),p(xs[i],.95,.013),p(xs[i-1],.95,.013)],r.lights?'#f3f8f4':'#c9d4d6',false);
  }
 }});
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const p=(x,z)=>[x,side*(sideY(x,z)+.014),z];
  r.polygon([p(-1.93,.972),p(-1.85,.978),p(-1.85,.993),p(-1.93,.996)],'#c58b45',false);
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
