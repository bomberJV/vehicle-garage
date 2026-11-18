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
// Ahead of the front arches the upper body sweeps in toward the nose while the
// bumper below stays wide. The profile is linear between the side band levels so
// the panels follow it exactly.
const TAPER=[[.40,0],[.60,.25],[.74,.62],[.83,.85],[.92,1],[1,1]];
export function noseTaper(x,l){
 if(!(x<-1.78))return 0;
 let i=1;while(i<TAPER.length-1&&l>TAPER[i][0])i++;
 const [la,ta]=TAPER[i-1],[lb,tb]=TAPER[i];
 return -.09*Math.min(1,(-1.78-x)/.30)*(ta+(tb-ta)*Math.max(0,Math.min(1,(l-la)/(lb-la))));
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
 bandColor:(x,j)=>x<-1.6?(j<=2?'#202427':null):x>1.83&&j<=3?'#202427':null,customEnds:true,sideSection:(w,l,x)=>w+hrvSide(l)+noseTaper(x,l),capFollowsSide:true,
 // Two creases run back from the lamp tips; the centre of the bonnet stands a little proud.
 hoodLanes:[0,.35,.70,.78,1],hoodPress:t=>t<=.70?.010:t>=.78?0:.010*(.78-t)/.08,hoodLaneTint:lo=>lo===.70?-.10:lo===.78?-.03:0,
 // A black sill strip, then gently varied paint; the brightest band is the
 // character line, with a small shadow under it.
 sideLevels:[0,.10,.22,.40,.60,.74,.79,.83,.92,1],sideTints:[1,.84,.88,.89,.93,.86,1.10,1.00,.96],
 cabinFloor:.44,cabin:{cargo:[.98,.48,.60],sillEnd:.92,rearSeat:[.48,.88,.57,.70,.86,.96]},
 backGlassOpacity:.92,backGlassColor:'#141a1e',
 windowGlass:{front:['#2c3a40',.62],privacy:['#141b1f',.88]},windshieldGlass:['#41525a',.48],
 moonroofGlass:['#151b1e',.92],moonroofFrame:BLACK,aPillarColor:TRIM,mirrorX:-.56,mirrorOut:.012,mirrorLift:.030,
 // Black A-pillar trim and the mirror sail at the front corner of the door glass.
 blackouts:[[[-.98,1.188],[-.88,1.198],[-.355,1.572],[-.27,1.592]],[[-.80,1.214],[-.50,1.214],[-.70,1.335]]],
 stations:[[-2.08,.75,1.02],[-2.00,.80,1.045],[-1.90,.85,1.085],[-1.78,.885,1.105],[-1.62,.905,1.12],[-1.327,.912,1.15],[-.98,.905,1.175],[-.70,.905,1.19],
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
// The panels are flat between the side band levels, so this is too.
function sideY(x,z){
 const [w,top]=section(x),level=clamp((z-B.base)/(top-B.base)),L=B.sideLevels;
 let i=1;while(i<L.length-1&&level>L[i])i++;
 const at=l=>w+hrvSide(l)+noseTaper(x,l);
 return mix(at(L[i-1]),at(L[i]),(level-L[i-1])/(L[i]-L[i-1]));
}
function poly(r,id,pts,c){r.tag(id,()=>r.polygon(pts,c,false));}

// An end of the car: a surface that bulges from the end station to the bumper face.
// u runs across the car (-1..1), v from the bottom edge to the top edge.
function endSurface(end){
 const front=end<0,x0=front?B.stations[0][0]:B.stations.at(-1)[0],[w0,top0]=section(x0);
 const dir=front?-1:1;
 // Front: upright from the lower lip to the lamps, then rolling back into the
 // bonnet edge; the chin tucks under. Rear: the bumper stands proud below the hatch.
 const vLip=(.392-B.base)/(top0+.03-B.base);
 const bulge=front?v=>.193*(v<vLip?.30+.70*(v/vLip)**1.5:1)*(v>.72?1-((v-.72)/.28)**2:1)
  :v=>.035+.015*Math.sin(Math.PI*Math.min(1,v*1.6))-.03*Math.max(0,v-.45)/.55;
 // Plan shape across the end: the front is nearly flat across the grille and
 // sweeps back toward the corners; the rear stays as it was.
 const plan=front?u=>1-Math.abs(u)**3.5:u=>1-Math.abs(u)**3;
 // The top edge of the front follows the bonnet's leading edge lane by lane and
 // then the fender return, so the two meet without a gap.
 const hoodHalf=w0*B.hoodFrac-.008,lanes=B.hoodLanes??[0,.55,1];
 const hoodZ=t=>top0+.016+B.hoodCrown*(1-t*t)+(B.hoodPress?.(t)??0);
 const zTop=y=>{
  if(!front)return top0;
  const t=Math.abs(y)/hoodHalf;
  if(t>=1){const edge=sideY(x0,top0);return top0+.0152*clamp((edge-Math.abs(y))/(edge-hoodHalf));}
  let i=1;while(i<lanes.length-1&&t>lanes[i])i++;
  // A hair under the bonnet edge, so the two panels meet without touching.
  return mix(hoodZ(lanes[i-1]),hoodZ(lanes[i]),(t-lanes[i-1])/(lanes[i]-lanes[i-1]))-.0008;
 };
 const at=(u,v,lift=0)=>{
  // The half-width depends on height and the top height depends on y, so settle both.
  let y=u*sideY(x0,B.base+.01),z=B.base;
  for(let k=0;k<4;k++){z=mix(B.base,zTop(y),v);y=u*sideY(x0,Math.min(z,top0));}
  return [x0+dir*(bulge(v)*plan(u)+lift),y,z];
 };
 // Place a (y,z) outline on the surface, lifted outward by `lift`.
 const on=(y,z,lift=.006)=>{
  const yEdge=sideY(x0,Math.min(z,top0)),u=Math.max(-1,Math.min(1,y/yEdge));
  const zt=zTop(Math.abs(u*yEdge)),v=clamp((z-B.base)/(zt-B.base));
  return [x0+dir*(bulge(v)*plan(u)+lift),u*yEdge,mix(B.base,zt,v)];
 };
 const vAt=(z,y=0)=>clamp((z-B.base)/(zTop(Math.abs(y))-B.base));
 return {at,on,x0,dir,top0,w0,vAt,edge:z=>sideY(x0,Math.min(z,top0))};
}
// colorAt(z, |y|) returns a color, or null to leave the cell open (the hatch).
function drawEnd(r,s,id,colorAt,vs,cols){
 const us=cols??[-1,-.97,-.92,-.84,-.75,-.62,-.50,-.36,-.22,-.08,.08,.22,.36,.50,.62,.75,.84,.92,.97,1];
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

// Front end. Positions are read off a metric grid laid over a straight-on photo
// (scaled so the grille surround is 0.90 m wide) and checked against the side
// photo: grille surround z 0.655-0.865, lamp tips at y 0.40, corner pockets from
// y 0.665 outward, painted bumper down to z 0.545.
function frontEnd(r,paint){
 const s=endSurface(-1);
 // Columns include the bonnet's lane edges so the top edge matches it exactly.
 const hoodU=(B.hoodLanes??[]).slice(1).map(t=>t*(s.w0*B.hoodFrac-.008)/s.edge(s.top0));
 const cols=(h=>[...h.map(u=>-u).reverse(),...h])([.06,.16,.26,.36,.46,.55,.76,.82,.87,.945,.97,.988,1,...hoodU].sort((a,b)=>a-b).filter((u,i,all)=>i===all.length-1||all[i+1]-u>.02));
 // Rows sit at the side band levels as well, so the corner joins the fenders
 // without cracks. Under the lip a short dark valance tucks back.
 const rows=[...[.315,.392,.42,.46,.50,.545,.60,.655,.71,.765,.82,.87,.915,.955].map(z=>s.vAt(z)),...B.sideLevels,.955,.98]
  .sort((a,b)=>a-b).filter((v,i,all)=>i===all.length-1||all[i+1]-v>.012);
 const sideTint=z=>{const l=clamp((z-B.base)/(s.top0-B.base));let j=1;while(j<B.sideLevels.length-1&&l>B.sideLevels[j])j++;return B.sideTints[j-1];};
 drawEnd(r,s,'body.structure',(z,y,u)=>{
  if(z<.315)return null;
  if(z<.392)return '#0f1112';
  if(z<.545)return CLAD;
  const k=Math.abs(u)**6;
  return tone(paint,mix(.86+.16*clamp((z-.50)/.50),sideTint(z)*(u<0?.95:1),k));
 },rows,cols);
 // Features are drawn as narrow vertical strips between a lower and an upper
 // edge, so they follow the curved fascia instead of cutting through it.
 const edge=(pts,y)=>{let i=1;while(i<pts.length-1&&y>pts[i][0])i++;const [ya,za]=pts[i-1],[yb,zb]=pts[i];return mix(za,zb,clamp((y-ya)/(yb-ya)));};
 const shift=(pts,dz)=>pts.map(([y,z])=>[y,z+dz]);
 const band=(lower,upper,color,lift,{tag='body.structure',glass=false,mirror=true,from=-9,to=9,step=.03}={})=>{
  const y0=Math.max(lower[0][0],upper[0][0],from),y1=Math.min(lower.at(-1)[0],upper.at(-1)[0],to),n=Math.max(1,Math.ceil((y1-y0)/step));
  for(const sgn of mirror?[-1,1]:[1])for(let i=0;i<n;i++){
   const ya=mix(y0,y1,i/n),yb=mix(y0,y1,(i+1)/n),q=(y,z)=>s.on(sgn*y,z,lift);
   const pts=[q(ya,edge(lower,ya)),q(yb,edge(lower,yb)),q(yb,edge(upper,yb)),q(ya,edge(upper,ya))];
   r.tag(tag,()=>glass?glazingFace(r,pts,'#c3d2d8',.16):r.polygon(sgn<0?pts.reverse():pts,color,false));
  }
 };
 const lamp={tag:'lighting.headlamp'};

 // Grille, measured on a 5x grid of the straight-on photo: a thin matte grey
 // surround around a near-black opening. Thin bars make the long cells: on each
 // side four level bars run from |y| 0.31 to 0.19; at the inner end each forks
 // up and down to the centre bars, and at the outer end it climbs to the frame.
 // The forks cross between the columns, which is what makes the diamonds there.
 const sym=h=>[...h.map(([y,z])=>[-y,z]).reverse(),...h];
 const gTop=sym([[.30,.866],[.355,.860],[.425,.810],[.445,.760]]),gLow=sym([[.30,.646],[.39,.652],[.425,.668],[.442,.700],[.445,.760]]);
 const oTop=sym([[.30,.857],[.35,.851],[.405,.805],[.415,.760]]),oLow=sym([[.30,.654],[.355,.657],[.395,.668],[.413,.700],[.415,.760]]);
 const SURROUND='#3b4043',FRAME=.016;
 band(gLow,gTop,'#0c0e0f',.008,{mirror:false,step:.02});
 band(oTop,gTop,SURROUND,FRAME,{mirror:false,from:-.415,to:.415,step:.02});
 band(gLow,oLow,SURROUND,FRAME,{mirror:false,from:-.415,to:.415,step:.02});
 band(gLow,gTop,SURROUND,FRAME,{from:.413,to:.445,step:.008});
 // The radar unit behind the centre cell.
 feature(r,'body.structure',s,[[-.042,.722],[.042,.722],[.042,.752],[-.042,.752]],'#1c2023',.010);
 r.tag('body.structure',()=>{
  const inside=(y,z)=>Math.abs(y)<.413&&z<edge(oTop,y)-.002&&z>edge(oLow,y)+.001;
  const slat=(pts,thick=.0032)=>{
   for(let i=1;i<pts.length;i++){
    const [y0,z0]=pts[i-1],[y1,z1]=pts[i],n=Math.max(1,Math.ceil(Math.abs(y1-y0)/.04));
    for(let k=0;k<n;k++){
     const ya=mix(y0,y1,k/n),za=mix(z0,z1,k/n),yb=mix(y0,y1,(k+1)/n),zb=mix(z0,z1,(k+1)/n);
     if(!inside(ya,za)||!inside(yb,zb))continue;
     // Front edge catching the light, and the bar's upper surface running back.
     r.polygon([s.on(ya,za-thick,FRAME),s.on(yb,zb-thick,FRAME),s.on(yb,zb+thick,FRAME),s.on(ya,za+thick,FRAME)],'#5a6267',false);
     r.polygon([s.on(ya,za+thick,FRAME),s.on(yb,zb+thick,FRAME),s.on(yb,zb+thick,.010),s.on(ya,za+thick,.010)],'#202528',false);
    }
   }
  };
  for(const sg of [-1,1])for(const z of [.837,.776,.715,.658]){
   slat([[sg*.31,z],[sg*.189,z]].sort((a,b)=>a[0]-b[0]));
   slat([[sg*.189,z],[sg*.092,z+.047]]);
   slat([[sg*.189,z],[sg*.076,z-.056]]);
   slat([[sg*.31,z],[sg*.40,z+.063]]);
  }
  for(const z of [.837,.776,.715,.658]){slat([[-.092,z+.047],[.092,z+.047]]);slat([[-.076,z-.056],[.076,z-.056]]);}
  slat([[-.075,.845],[.075,.845]]);
  for(const sg of [-1,1])slat([[sg*.075,.845],[sg*.10,.857]].sort((a,b)=>a[0]-b[0]));
 });
 // Honda emblem: a chrome H in a rounded chrome frame, above the grille.
 r.tag('body.structure',()=>{
  const c=(y,z,l=.016)=>s.on(y,z,l),z0=.888,z1=.952,w=.054,t=.007;
  r.polygon([c(-w+.008,z0,.014),c(w-.008,z0,.014),c(w,z0+.010,.014),c(w,z1-.010,.014),c(w-.008,z1,.014),c(-w+.008,z1,.014),c(-w,z1-.010,.014),c(-w,z0+.010,.014)],CHROME,false);
  r.polygon([c(-w+.011,z0+t,.015),c(w-.011,z0+t,.015),c(w-t,z0+.012,.015),c(w-t,z1-.012,.015),c(w-.011,z1-t,.015),c(-w+.011,z1-t,.015),c(-w+t,z1-.012,.015),c(-w+t,z0+.012,.015)],'#23292c',false);
  r.polygon([c(-.036,z0+t),c(-.022,z0+t),c(-.027,z1-t),c(-.040,z1-t)],CHROME,false);
  r.polygon([c(.022,z0+t),c(.036,z0+t),c(.040,z1-t),c(.027,z1-t)],CHROME,false);
  r.polygon([c(-.026,.914),c(.026,.914),c(.027,.926),c(-.027,.926)],CHROME,false);
 });
 // Bonnet shut line: across the nose, then along the top of each lamp.
 const lampLow=[[.40,.928],[.452,.898],[.516,.874],[.60,.880],[.70,.889]],lampTop=[[.40,.928],[.435,.966],[.50,.979],[.60,.994],[.70,1.001]];
 const shut=[[0,.976],[.30,.975],[.40,.971],[.435,.970],[.50,.983],[.60,.998],[.70,1.005]];
 band(shut,shift(shut,.004),'#1f2427',.011,{to:.655});

 // Corner pockets: a thin black brow starts beside the grille and widens outward
 // into a tall recess at the corner, which runs down into the black lower bumper.
 const browTop=[[.555,.700],[.60,.712],[.76,.716]],browLow=[[.555,.694],[.60,.686],[.665,.672]];
 const trayCorner=[[.54,.545],[.58,.552],[.61,.568],[.635,.595],[.652,.630],[.665,.672]];
 band(browLow,browTop,'#272c2f',.0105,{step:.01});
 band([[.54,.52],[.665,.52]],trayCorner,CLAD,.008,{step:.008});
 band([[.665,.52],[.76,.52]],browTop,CLAD,.008,{step:.02});
 // The recess itself is darker than the black trim around it.
 band([[.645,.48],[.79,.475]],[[.645,.585],[.655,.625],[.665,.668],[.70,.677],[.79,.688]],'#0b0d0e',.0095,{step:.008});
 // Under each pocket the painted bumper sweeps down to a point.
 const SWEEP=tone(paint,.97);
 band([[.63,.418],[.76,.437]],[[.63,.422],[.66,.443],[.76,.477]],SWEEP,.012,{step:.015});

 // Lower intake: a six-sided opening with a diamond mesh, and the lip under it.
 const iTop=sym([[.42,.535],[.53,.470]]),iLow=sym([[.47,.410],[.53,.470]]);
 band(iLow,iTop,'#0a0c0d',.008,{mirror:false});
 r.tag('body.structure',()=>{
  const inside=(y,z)=>z<edge(iTop,y)-.006&&z>edge(iLow,y)+.006&&Math.abs(y)<.52;
  for(const dir of [-1,1])for(let k=-22;k<=22;k++){
     // One mesh wire; wires 36 mm apart.
   const n=6;for(let i=0;i<n;i++){
    const za=mix(.412,.533,i/n),zb=mix(.412,.533,(i+1)/n),ya=k*.036+dir*(za-.4725)*1.2,yb=k*.036+dir*(zb-.4725)*1.2;
    if(!inside(ya,za)||!inside(yb,zb))continue;
    r.polygon([s.on(ya-.003,za,.011),s.on(ya+.003,za,.011),s.on(yb+.003,zb,.011),s.on(yb-.003,zb,.011)],'#2a3134',false);
   }
  }
 });
 band([[-.50,.388],[.50,.388]],[[-.50,.404],[.50,.404]],'#2b3134',.010,{mirror:false});
 // License plate below the grille.
 feature(r,'body.structure',s,[[-.153,.492],[.153,.492],[.153,.645],[-.153,.645]],'#20272a',.018);

 // Headlamps (5x grid of the photo): a black housing, pointed at the grille end
 // with a chin under it. Inside, a smoked chrome band carries three LED modules
 // in its upper half; a white light strip runs along the bottom over a thin
 // chrome lip and turns straight up near the outer end, at |y| 0.745.
 const DRL=r.lights?'#f8fbf8':'#e3eaeb';
 band(lampLow,lampTop,'#14181b',.008,{...lamp,to:.68});
 band(shift(lampLow,.024),shift(lampTop,-.008),'#262c30',.010,{...lamp,from:.43,to:.68});
 for(const [a,b] of [[.515,.560],[.572,.617],[.629,.674]]){
  band(shift(lampTop,-.044),shift(lampTop,-.011),'#4f595f',.011,{...lamp,from:a,to:b,step:.015});
  band(shift(lampTop,-.038),shift(lampTop,-.017),'#2c3439',.012,{...lamp,from:a+.006,to:b-.006,step:.015});
  band(shift(lampTop,-.030),shift(lampTop,-.025),'#8b969c',.013,{...lamp,from:a+.012,to:b-.012,step:.015});
 }
 band(lampLow,shift(lampLow,.006),'#636b6f',.012,{...lamp,from:.44,to:.68});
 band(shift(lampLow,.008),shift(lampLow,.020),DRL,.012,{...lamp,from:.452,to:.68});
 band(lampLow,lampTop,null,.016,{...lamp,glass:true,to:.68});
 // On each fender the lamp carries on to the upturned light strip, the amber
 // marker behind it and a rounded tail.
 const along=(pts,x)=>{let i=1;while(i<pts.length-1&&x>pts[i][0])i++;const [xa,za]=pts[i-1],[xb,zb]=pts[i];return mix(za,zb,clamp((x-xa)/(xb-xa)));};
 const lo=[[s.x0,edge(lampLow,.68)],[-2.02,.893],[-1.95,.894],[-1.915,.899],[-1.895,.912],[-1.885,.935]],hi=[[s.x0,edge(lampTop,.68)],[-2.04,1.003],[-1.95,1.009],[-1.915,1.0],[-1.895,.975],[-1.885,.935]];
 for(const side of [-1,1]){
  const p=(x,z,dy)=>[x,side*(sideY(x,z)+dy),z];
  const strip=(xa,xb,za,zb,dy,color,tag='lighting.headlamp')=>{
   const n=Math.max(1,Math.ceil((xb-xa)/.035));
   // Where a strip starts at the corner, join it to the matching strip on the front.
   if(xa===s.x0&&color){const q=z=>[s.x0-.001-dy,side*sideY(s.x0,z),z],pts=[q(za(xa)),p(xa,za(xa),dy),p(xa,zb(xa),dy),q(zb(xa))];r.tag(tag,()=>r.polygon(side<0?pts:pts.reverse(),color,false));}
   for(let i=0;i<n;i++){
    const a=mix(xa,xb,i/n),b=mix(xa,xb,(i+1)/n),pts=[p(a,za(a),dy),p(b,za(b),dy),p(b,zb(b),dy),p(a,zb(a),dy)];
    r.tag(tag,()=>color?r.polygon(side<0?pts:pts.reverse(),color,false):glazingFace(r,pts,'#c3d2d8',.16));
   }
  };
  const low=x=>along(lo,x),top=x=>along(hi,x);
  strip(s.x0,-1.885,low,top,.010,'#14181b');
  strip(s.x0,-2.03,x=>low(x)+.024,x=>top(x)-.008,.012,'#1e2326');
  strip(s.x0,-2.025,low,x=>low(x)+.006,.013,'#636b6f');
  strip(s.x0,-2.025,x=>low(x)+.008,x=>low(x)+.020,.013,DRL);
  // The strip turns straight up (in the head-on view) just behind the corner.
  r.tag('lighting.headlamp',()=>{const q=[p(-2.027,low(-2.027)+.008,.013),p(-2.013,low(-2.013)+.008,.013),p(-1.978,top(-1.978)-.010,.013),p(-1.992,top(-1.992)-.010,.013)];r.polygon(side<0?q:q.reverse(),DRL,false);});
  // Outboard of it: a chrome reflector with the amber marker in its upper part.
  strip(-1.975,-1.90,x=>low(x)+.008,x=>top(x)-.008,.012,'#7f898e');
  strip(-1.962,-1.91,x=>mix(low(x),top(x),.45),x=>top(x)-.011,.013,'#a8743f','lighting.indicator');
  strip(s.x0,-1.885,low,top,.017,null);
  // The pocket and the silver sweep wrap a short way onto the side of the bumper.
  const pTop=[[s.x0,.716],[-2.03,.714],[-2.01,.70],[-1.995,.67]],pLow=[[s.x0,.477],[-2.03,.50],[-2.01,.56],[-1.995,.62]];
  strip(s.x0,-1.995,x=>along(pLow,x),x=>along(pTop,x),.008,CLAD,'body.structure');
  strip(s.x0,-2.01,x=>along(pLow,x)+.006,x=>along(pTop,x)-.026,.0095,'#0b0d0e','body.structure');
  strip(s.x0,-2.02,x=>mix(.437,.469,(x-s.x0)/.06),()=>.477,.010,SWEEP,'body.structure');
 }
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
