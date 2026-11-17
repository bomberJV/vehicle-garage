// 2026 Honda HR-V EX-L outer body. The side elevation is fitted to a photograph of a
// 2025 HR-V EX-L registered at both wheel centers (2654 mm wheelbase), with the
// overhangs scaled to the 4567 mm overall length. Front and rear details follow
// straight-on photographs of the same generation; all detail shapes are estimated.
import {glazingFace} from './surface-materials.js';
import {coachwork,panel,deckPanel,tint as tone} from './exterior-coachwork.js';

const BLACK='#1b2124',TRIM='#2a3034',METAL='#b3babb',CHROME='#c9cfd0',GRILLE='#11171a';
const mix=(a,b,t)=>a+(b-a)*t,clamp=t=>Math.max(0,Math.min(1,t));
export const hrvBody={
 wb:2.654,arch:.44,axleZ:.398,base:.33,hoodEnd:-.98,deckStart:2.04,
 door:[-.87,.30,1.01],belt:1.125,roofZ:1.59,roofWidth:.686,cabinWidth:.806,hoodFrac:.77,hoodCrown:.012,
 hatch:true,cladding:true,claddingLip:.05,customEnds:true,cabinFloor:.44,backGlassOpacity:.86,backGlassColor:'#26313a',sideLevels:[0,.07,.34,.66,.86,1],sideTints:[.70,.90,.95,1.00,1.04],
 stations:[[-2.2235,.74,.835],[-2.10,.83,.895],[-1.90,.88,.985],[-1.60,.905,1.068],[-1.327,.912,1.10],[-.98,.905,1.126],[-.70,.905,1.128],
  [.30,.912,1.135],[1.00,.915,1.158],[1.30,.912,1.168],[1.70,.892,1.168],[2.04,.85,1.13],[2.2235,.78,1.06]],
 wind:[[-.98,1.155],[-.32,1.555]],roof:[[-.32,1.555],[-.05,1.578],[.30,1.592],[.70,1.590],[1.05,1.575],[1.35,1.552],[1.66,1.515]],rear:[[1.66,1.515],[2.04,1.21]],
 frontWindow:[[-.70,1.124],[-.36,1.512],[.24,1.548],[.25,1.132]],
 rearWindow:[[.35,1.134],[.35,1.548],[.99,1.535],[.99,1.158]],
 quarter:[[1.02,1.160],[1.02,1.525],[1.13,1.515],[1.29,1.170]]
};
const B=hrvBody;
function section(x){
 const st=B.stations;let i=0;while(i<st.length-2&&x>st[i+1][0])i++;
 const [a,wa,za]=st[i],[b,wb,zb]=st[i+1],t=clamp((x-a)/(b-a));return [mix(wa,wb,t),mix(za,zb,t)];
}
// Same side section as the shared generator, so the ends meet the side panels exactly.
function sideY(x,z){
 const [w,top]=section(x),level=clamp((z-B.base)/(top-B.base));
 return w-.032*(1-level)**2+.009*Math.sin(level*Math.PI)-.034*Math.max(0,(level-.86)/.14);
}
function poly(r,id,pts,c){r.tag(id,()=>r.polygon(pts,c,false));}

// An end of the car: a surface that bulges from the end station to the bumper face.
// u runs across the car (-1..1), v from the bottom edge to the top edge.
function endSurface(end){
 const front=end<0,x0=front?B.stations[0][0]:B.stations.at(-1)[0],top0=section(x0)[1];
 const dir=front?-1:1;
 const bulge=front?v=>.04+.03*Math.sin(Math.PI*Math.min(1,v*1.25))-.045*Math.max(0,v-.6)/.4
  :v=>.03+.02*Math.sin(Math.PI*Math.min(1,v*1.1))-.015*Math.max(0,v-.85)/.15;
 const zTop=y=>front?top0+.028*(1-(y/.73)**2):top0;
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
 return {at,on,x0,dir,top0};
}
function drawEnd(r,surface,id,paint,colorAt){
 const us=Array.from({length:25},(_,i)=>-1+i/12),vs=Array.from({length:13},(_,i)=>i/12);
 r.tag(id,()=>{for(let i=1;i<us.length;i++)for(let j=1;j<vs.length;j++){
  const a=us[i-1],b=us[i],c=vs[j-1],d=vs[j];
  r.polygon([surface.at(a,c),surface.at(b,c),surface.at(b,d),surface.at(a,d)],colorAt((c+d)/2,Math.abs((a+b)/2)),false);
 }});
}
const mirrorY=pts=>pts.map(([y,z])=>[-y,z]).reverse();
function feature(r,id,s,pts,color,lift){poly(r,id,pts.map(([y,z])=>s.on(y,z,lift)),color);}
function both(r,id,s,half,color,lift){feature(r,id,s,half,color,lift);feature(r,id,s,mirrorY(half),color,lift);}

function frontEnd(r,paint){
 const s=endSurface(-1),paintAt=v=>tone(paint,.80+.22*Math.sin(v*Math.PI*.9));
 drawEnd(r,s,'body.structure',paint,(v)=>v<.08?BLACK:paintAt(v));
 // Wide octagonal grille with a dark, interlocking mesh.
 const grille=[[-.36,.80],[.36,.80],[.465,.70],[.37,.575],[-.37,.575],[-.465,.70]];
 feature(r,'body.structure',s,grille,GRILLE,.008);
 feature(r,'body.structure',s,[[-.37,.80],[.37,.80],[.36,.792],[-.36,.792]],TRIM,.010);
 r.tag('body.structure',()=>{
  const rows=6,cols=13;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const y=-.42+i*.07+(j%2)*.035,z=.598+j*.034;
   const half=.465-.105*Math.abs(z-.70)/.10;if(Math.abs(y)+.03>half)continue;
   const cell=[[y-.03,z],[y-.012,z+.014],[y+.012,z+.014],[y+.03,z],[y+.012,z-.014],[y-.012,z-.014]];
   r.polygon(cell.map(([yy,zz])=>s.on(yy,zz,.012)),'#2b3539',false);
   r.polygon(cell.map(([yy,zz])=>s.on(mix(y,yy,.62),mix(z,zz,.62),.013)),GRILLE,false);
  }
 });
 // Honda emblem on the body-colored nose above the grille.
 r.tag('body.structure',()=>{
  const c=(y,z,l=.014)=>s.on(y,z,l);
  r.polygon([c(-.05,.825),c(.05,.825),c(.05,.868),c(-.05,.868)],'#3a4448',false);
  for(const y of [-.034,.034])r.polygon([c(y-.006,.83,.017),c(y+.006,.83,.017),c(y+.006+(y<0?.004:-.004),.863,.017),c(y-.006+(y<0?.004:-.004),.863,.017)],CHROME,false);
  r.polygon([c(-.03,.843,.017),c(.03,.843,.017),c(.03,.851,.017),c(-.03,.851,.017)],CHROME,false);
 });
 // Lower intake across the bumper and the C-shaped corner pockets.
 feature(r,'body.structure',s,[[-.52,.37],[.52,.37],[.50,.47],[-.50,.47]],BLACK,.006);
 r.tag('body.structure',()=>{for(let i=0;i<3;i++){const z=.385+i*.03;r.polygon([s.on(-.48,z,.009),s.on(.48,z,.009),s.on(.48,z+.008,.009),s.on(-.48,z+.008,.009)],'#3a4448',false);}});
 both(r,'body.structure',s,[[.555,.72],[.69,.735],[.735,.70],[.735,.40],[.66,.36],[.555,.38],[.615,.43],[.625,.67]],BLACK,.007);
 // License plate recess.
 feature(r,'body.structure',s,[[-.155,.475],[.155,.475],[.155,.56],[-.155,.56]],tone(paint,.62),.004);
 // Headlamps: thin LED units at the top corners, under the bonnet's leading edge.
 for(const sgn of [-1,1]){
  const half=[[.42,.833],[.60,.842],[.735,.852],[.735,.885],[.60,.880],[.43,.862]];
  const pts=sgn<0?mirrorY(half):half;
  feature(r,'lighting.headlamp',s,pts,'#2f3b40',.008);
  const led=[[.44,.849],[.60,.858],[.73,.868],[.73,.876],[.60,.868],[.44,.857]];
  feature(r,'lighting.headlamp',s,sgn<0?mirrorY(led):led,r.lights?'#f1f6f2':'#b9c6c8',.010);
  feature(r,'lighting.indicator',s,sgn<0?mirrorY([[.66,.846],[.73,.851],[.73,.858],[.66,.854]]):[[.66,.846],[.73,.851],[.73,.858],[.66,.854]],'#c08a45',.011);
  r.tag('lighting.headlamp',()=>glazingFace(r,(sgn<0?mirrorY(half):half).map(([y,z])=>s.on(y,z,.016)),'#c3d2d8',.22));
 }
 // The lamps wrap back along the top of each front fender.
 r.tag('lighting.headlamp',()=>{for(const side of [-1,1]){
  const xs=[-2.2235,-2.16,-2.08,-2.00,-1.93,-1.87];
  for(let i=1;i<xs.length;i++){
   const p=(x,k,dy)=>{const top=section(x)[1],t=(x-xs[0])/(xs.at(-1)-xs[0]),h=.045*(1-t)**1.2,z=top-.006-h*k;return [x,side*(sideY(x,z)+dy),z];};
   r.polygon([p(xs[i-1],0,.004),p(xs[i],0,.004),p(xs[i],1,.004),p(xs[i-1],1,.004)],'#2f3b40',false);
   r.polygon([p(xs[i-1],.25,.006),p(xs[i],.25,.006),p(xs[i],.55,.006),p(xs[i-1],.55,.006)],r.lights?'#f1f6f2':'#b9c6c8',false);
  }
 }});
}

function rearEnd(r,paint){
 const s=endSurface(1);
 // Painted upper bumper, black lower bumper and a bright skid strip.
 drawEnd(r,s,'body.structure',paint,v=>{const z=mix(B.base,s.top0,v);return z<.40?'#8e9597':z<.58?BLACK:tone(paint,.78+.2*v);});
 both(r,'lighting.indicator',s,[[.43,.552],[.66,.552],[.66,.567],[.43,.567]],'#8d2a31',.008);
 // Single exhaust outlet under the right side of the bumper.
 r.tag('body.structure',()=>{const c=s.on(.62,.40,.004);r.rod([c[0]-.06,c[1],c[2]],[c[0]+.012,c[1],c[2]],.037,METAL,16);r.discX(c[0]+.013,c[1],c[2],.030,'#101518',16);});
}

// Hatch: the panel below the glass, the boomerang tail lamps across it and the spoiler.
function hatch(r,paint){
 const rows=[[2.04,.80,1.21],[2.12,.76,1.13],[2.19,.71,1.06],[2.235,.69,.97],[2.255,.68,.90]];
 deckPanel(r,true,()=>{
  for(let i=1;i<rows.length;i++){
   const [x,y,z]=rows[i-1],[xx,yy,zz]=rows[i];
   r.polygon([[x,-y,z],[x,y,z],[xx,yy,zz],[xx,-yy,zz]],tone(paint,1.06-(i-1)*.07),false);
  }
  // Inner tail-lamp sections and the light bar line between them.
  for(const sgn of [-1,1]){
   const lamp=(y,z,lift=.004)=>{let i=1;while(i<rows.length-1&&z<rows[i][2])i++;const [x,,zA]=rows[i-1],[xx,,zB]=rows[i];const t=clamp((zA-z)/(zA-zB));return [mix(x,xx,t)+lift,sgn*y,z];};
   r.polygon([lamp(.30,1.045),lamp(.68,1.035),lamp(.70,1.13),lamp(.34,1.105)],'#4e1f26',false);
   r.polygon([lamp(.33,1.06,.006),lamp(.68,1.052,.006),lamp(.69,1.072,.006),lamp(.34,1.078,.006)],r.lights?'#e2535c':'#b73f47',false);
  }
  // Emblem, name badge and the plate recess.
  const z=(k)=>{let i=1;while(i<rows.length-1&&k<rows[i][2])i++;const [x,,zA]=rows[i-1],[xx,,zB]=rows[i];return mix(x,xx,clamp((zA-k)/(zA-zB)));};
  r.polygon([[z(1.125)+.006,-.045,1.10],[z(1.125)+.006,.045,1.10],[z(1.15)+.006,.045,1.15],[z(1.15)+.006,-.045,1.15]],CHROME,false);
  r.polygon([[z(.93)+.005,-.17,.90],[z(.93)+.005,.17,.90],[z(.98)+.005,.17,.98],[z(.98)+.005,-.17,.98]],tone(paint,.62),false);
  r.polygon([[z(.94)+.006,-.47,.935],[z(.94)+.006,-.37,.935],[z(.95)+.006,-.37,.95],[z(.95)+.006,-.47,.95]],CHROME,false);
  // Roof spoiler continuing the roof line over the glass, with the high-mounted
  // stop lamp under its trailing edge.
  const sp=[[1.52,.69,1.542],[1.64,.69,1.530],[1.72,.67,1.517],[1.765,.63,1.505]];
  for(let i=1;i<sp.length;i++){const [x,y,z]=sp[i-1],[xx,yy,zz]=sp[i];r.polygon([[x,-y,z],[x,y,z],[xx,yy,zz],[xx,-yy,zz]],tone(paint,1.10-i*.05),false);}
  for(const sgn of [-1,1])r.polygon(sp.map(([x,y,z])=>[x,sgn*y,z]).concat([[1.765,sgn*.63,1.493],[1.52,sgn*.69,1.531]]),tone(paint,.82),false);
  r.polygon([[1.765,-.63,1.505],[1.765,.63,1.505],[1.71,.61,1.493],[1.71,-.61,1.493]],BLACK,false);
  r.box(1.74,-.14,1.492,1.75,.14,1.498,'#a2393f');
  // Body-colored D-pillars frame a narrower hatch glass.
  for(const sgn of [-1,1]){
   const q=[[2.045,.56,1.214],[2.045,.80,1.214],[1.665,.70,1.517],[1.665,.50,1.517]];
   r.polygon(q.map(([x,y,z])=>[x+.006,sgn*y,z+.004]),tone(paint,.96),false);
  }
  r.rod([2.00,-.30,1.245],[2.00,.24,1.245],.008,BLACK,8);
 });
}

// Tail lamps on the rear quarters: they wrap from the hatch edge around the corner.
function quarterLamps(r){
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const xs=Array.from({length:16},(_,i)=>1.86+i*(2.2235-1.86)/15);
  const t=x=>(x-xs[0])/(xs.at(-1)-xs[0]);
  const lo=x=>1.035+.03*(1-t(x))**2,hi=x=>1.14+.04*(1-t(x))**1.5;
  // Each column keeps one plan position, so the lens is a ruled vertical strip.
  const col=(x,dy)=>side*(sideY(x,(lo(x)+hi(x))/2)+dy);
  for(let i=1;i<xs.length;i++){
   const a=xs[i-1],b=xs[i];
   r.polygon([[a,col(a,.004),lo(a)],[b,col(b,.004),lo(b)],[b,col(b,.004),hi(b)],[a,col(a,.004),hi(a)]],'#5a2028',false);
   r.polygon([[a,col(a,.006),lo(a)+.012],[b,col(b,.006),lo(b)+.012],[b,col(b,.006),lo(b)+.03],[a,col(a,.006),lo(a)+.03]],r.lights?'#e2535c':'#b73f47',false);
  }
 }});
}

// Black lower door cladding, fuel door, shark-fin antenna and lower side sills.
function sideDetail(r,paint){
 for(const side of [-1,1]){
  r.tag('body.structure',()=>{
   for(const [x0,x1] of [[-.88,1.0]]){
    const n=12;for(let i=0;i<n;i++){const a=mix(x0,x1,i/n),b=mix(x0,x1,(i+1)/n);
     const p=(x,z)=>[x,side*(sideY(x,z)+.006),z];
     r.polygon([p(a,.33),p(b,.33),p(b,.375),p(a,.375)],BLACK,false);
    }
   }
   const fd=(x,z)=>[x,side*(sideY(x,z)+.003),z];
   if(side>0)r.polygon([fd(1.36,1.04),fd(1.50,1.04),fd(1.50,1.12),fd(1.36,1.12)],tone(paint,.88),false);
  });
 }
 r.tag('body.structure',()=>{
  const f=[[1.20,1.588],[1.30,1.588],[1.285,1.625],[1.24,1.632]];
  for(const y of [-.012,.012])r.polygon(f.map(([x,z])=>[x,y,z]),BLACK,false);
  r.polygon([[1.20,-.012,1.588],[1.20,.012,1.588],[1.24,.012,1.632],[1.24,-.012,1.632]],BLACK,false);
  r.polygon([[1.24,-.012,1.632],[1.24,.012,1.632],[1.285,.012,1.625],[1.285,-.012,1.625]],BLACK,false);
 });
}

export function buildHrvExterior(r,paint){
 coachwork(r,B,paint);
 frontEnd(r,paint);
 rearEnd(r,paint);
 hatch(r,paint);
 quarterLamps(r);
 sideDetail(r,paint);
 // Bonnet seam line across the nose.
 panel(r,'bonnet',[0,0,.71],'body.hood',()=>{});
}
