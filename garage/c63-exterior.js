// 2012-2014 Mercedes-Benz C63 AMG sedan (W204 facelift) outer body.
// The side elevation is read off a studio photograph registered at both wheel
// centres (2765 mm wheelbase); heights are taken at the wheel plane. Features on
// the centre plane (nose, tail, roof crown) sit farther from the camera, so the
// ends are set from Mercedes' 4707 mm length instead. The rear is measured from
// a straight-on photograph scaled by its 12-inch licence plate. The front is
// measured from a straight-on photograph whose heights are tied to the side
// photograph: z = 0.765 - (row - 125)/712 on the 1290-wide face crop, which
// puts the lamp tops, the outer intakes and the bumper's lower edge where the
// side view has them.
import {glazingFace} from './surface-materials.js';
import {starBadge} from './exterior-trim.js';
import {coachwork,panel,deckPanel,tint as tone} from './exterior-coachwork.js';

const BLACK='#16191b',GLOSS='#121517',TRIM='#2a3034',CHROME='#c9cfd0',MESH='#0c0f11',LINER='#0f1213',SMOKE='#2a1215',SILVER='#aab2b5';
const mix=(a,b,t)=>a+(b-a)*t,clamp=t=>Math.max(0,Math.min(1,t));

// Body-side section offset by height fraction (sill 0 to belt 1). The AMG side
// skirt tucks in at the bottom; the door face is gently convex; a crisp
// shoulder line runs at about 0.87 m, and above it the side rolls in to the belt.
export function c63Side(l){
 const tuck=-.026*(1-Math.min(1,l/.14))**2;
 const belly=.008*Math.sin(Math.PI*clamp((l-.14)/.68));
 const crease=.006*Math.max(0,1-Math.abs(l-.83)/.035);
 return tuck+belly+crease-.028*Math.max(0,(l-.90)/.10);
}
// The section above was drawn from a 0.27 m sill. The body now runs down to the
// real sill at 0.18 m: the same shape above 0.27 m, and below it the AMG side
// skirt, which steps back out to the door face.
const SILL=.27;
const sideAtZ=(z,top)=>{const l=(z-SILL)/(top-SILL);return l>=0?c63Side(l):-.026+.028*Math.min(1,-l/.10);};
// Daylight openings, (x,z) from the side photograph.
// C63 overhangs: about 0.89 m ahead of the front axle (the AMG nose is longer than
// the standard W204's 0.775 m) and 1.055 m behind the rear axle (shared with the W204).
// FX and RX map the original nose and tail layout onto those overhangs.
const FX=x=>x<-1.8?-1.8+(x+1.8)*.81:x,RX=x=>x>1.64?1.64+(x-1.64)*1.167:x;
// The nose in plan. At the lamps the corners are swept far back: from the
// grille's edge the face runs back at about 40 degrees to the fender, so the
// main-beam bowl (y 0.69 on the head-on photograph) sits at x -1.93 on the side
// photograph and the lamp's tail reaches the fender at x -1.73. Lower down the
// bumper is fuller, turning the corner on a 0.17 m radius. NOSE_TOP is the
// corner at lamp height as (depth behind the nose station, half-width,
// shoulder height): the shoulder runs 10 mm under the lamp's top edge, which
// dips beside the grille and arches over the main beam.
const NOSE_X=FX(-2.17);
const NOSE_TOP=[[0,.49,.698],[.01,.51,.699],[.03,.55,.708],[.06,.60,.723],[.10,.65,.747],[.145,.69,.762],[.19,.73,.769],
 [.23,.77,.770],[.275,.81,.767],[.315,.845,.762],[.35,.87,.760],[.38,.893,.763]];
const noseArc=()=>NOSE_TOP.map(([d,w,z])=>[NOSE_X+d,w,z]);
// The bumper's corner below the lamps: a 0.17 m radius from a face 0.715 wide.
const lowCornerW=d=>d<.17?.715+Math.sqrt(.17*.17-(.17-d)**2):mix(.885,.893,clamp((d-.17)/.21));
// Half-width at (x, z) ahead of the front wheel: the lamp-height plan above
// 0.60 m, the bumper's below 0.50 m.
function planW(x,z,w){
 const d=x-NOSE_X;if(d>=.38)return w;
 const k=clamp((z-.50)/.10),kk=k*k*(3-2*k);
 return mix(lowCornerW(Math.max(0,d)),w,kk);
}
const frontWindow=[[-.62,.945],[-.05,1.300],[.30,1.331],[.30,.968]];
const rearWindow=[[.405,.971],[.405,1.335],[.92,1.297],[.92,.987]];
const quarter=[[.985,.989],[.985,1.272],[1.20,1.165],[1.34,.997]];
export const c63Body={
 // The sill and the front apron reach down to 0.18 m, about 145 mm off the
 // ground; behind the rear wheels the bumper ends higher. The arches sit close
 // round the tyres.
 wb:2.76,arch:.368,axleZ:.367,base:.18,rearBase:.225,lowerHem:x=>x>1.74?.225:.18,hoodEnd:-.83,deckStart:1.64,
 door:[-.76,.345,1.17],doorSill:.29,belt:.945,roofZ:1.405,roofWidth:.60,cabinWidth:.795,roofCrown:.036,screenSweep:.015,sideRound:.026,sailTints:[1.05,1.01,.97,.93,.90,.87],roofPinch:.02,
 // The bonnet is split by the grille: a centre section rises to the grille's
 // top edge, and outside it the bonnet falls to the shut line over each
 // fender. At the leading edge it dips where each lamp's inner end meets the
 // grille, then arches over the lamp. See hoodShape below.
 hoodFrac:.86,hoodLanes:[0,.15,.30,.42,.52,.60,.64,.67,.70,.73,.76,.79,.82,.85,.88,.91,.94,.97,1],
 hoodHalf:x=>hoodHalfAt(x),hoodSurface:(x,t)=>hoodShape(x,t*hoodHalfAt(x)),hoodFaceTint:(pts,s)=>slopeTint(pts),
 cuts:[.004,.008,.013,.02,.028,.038,.05,.065,.08,.10,.12,.145,.17,.20,.23,.26,.29,.32,.35].map(d=>FX(-2.17)+d),
 customEnds:true,capFollowsSide:true,
 cabin:{cargo:[1.66,.40,.36],sillEnd:1.02,rearSeat:[1.18,1.49,.385,.515,1.40,1.49]},
 sideSection:(w,l,x)=>sideW(x,l),
 sideLevels:[0,.06,.12,.182,.261,.384,.525,.666,.771,.824,.850,.894,.947,1],
 sideTints:[.80,.94,.78,.88,.95,1.00,1.03,1.00,.95,.88,1.13,1.04,.97],
 windowGlass:{front:['#34424a',.58],privacy:['#29343a',.66]},windshieldGlass:['#455760',.46],
 backGlassColor:'#2e3a40',moonroofGlass:['#1c2326',.88],moonroofFrame:BLACK,
 mirrorX:-.50,mirrorOut:.03,mirrorLift:.052,
 // Black B-pillar and the thin pillar ahead of the fixed rear quarter glass.
 blackouts:[[[.30,.968],[.405,.971],[.405,1.335],[.30,1.331]],[[.92,.987],[.985,.989],[.985,1.272],[.92,1.297]]],
 // Fender top from the lamp to the A-pillar base, then the belt and the boot.
 // The body side's top: under the bonnet, the fender shoulder, 16 mm under the
 // shut line, which the side photograph shows at 0.775 m behind the lamp
 // rising to 0.875 m at the cowl; then the A-pillar base rises to the belt.
 stations:[...noseArc(),[-1.60,.900,.784],[-1.38,.906,.811],[-1.08,.896,.840],[-.90,.891,.857],[-.83,.888,.868],[-.76,.887,.925],
  [-.50,.885,.945],[.30,.887,.968],[1.00,.893,.990],[1.38,.902,1.000],[1.64,.892,.995],[RX(1.90),.878,.955],[RX(2.10),.852,.925],[RX(2.22),.80,.905]],
 wind:[[-.78,.978],[.0,1.336]],
 roof:[[.0,1.336],[.15,1.352],[.35,1.369],[.55,1.369],[.75,1.358],[.90,1.340],[1.0,1.322]],rear:[[1.0,1.322],[1.63,1.056]],
 frontWindow,rearWindow,quarter,
 windowTopLine:[[-.05,1.300],[.30,1.331],[.60,1.330],[.92,1.297],[1.20,1.165]]
};
const B=c63Body;
function section(x){
 const st=B.stations;let i=0;while(i<st.length-2&&x>st[i+1][0])i++;
 const [a,wa,za]=st[i],[b,wb,zb]=st[i+1],t=clamp((x-a)/(b-a));return [mix(wa,wb,t),mix(za,zb,t)];
}
// Same side section as the shared generator, flat between the side band levels
// like the panels, so the ends meet the side panels exactly.
function sideW(x,l){
 const [w,top]=section(x),z=B.base+l*(top-B.base);
 return planW(x,z,w)+sideAtZ(z,top);
}
function sideY(x,z){
 const top=section(x)[1],level=clamp((z-B.base)/(top-B.base)),L=B.sideLevels;
 let i=1;while(i<L.length-1&&level>L[i])i++;
 const at=l=>sideW(x,l);
 return mix(at(L[i-1]),at(L[i]),(level-L[i-1])/(L[i]-L[i-1]));
}
const sm=t=>{t=clamp(t);return t*t*(3-2*t);};
const NOSE=()=>B.stations[0][0];
// The bonnet's centre line, from the side photograph (centre-plane heights
// corrected for the camera's perspective).
const hoodCentre=[[-2.10,.773],[-2.00,.818],[-1.90,.843],[-1.80,.863],[-1.60,.893],[-1.40,.912],[-1.20,.930],[-1.00,.945],[-.83,.956]];
// Half-width of the bonnet: almost the full width at the nose, where it runs
// over the lamps, then a few centimetres inside the fender tops.
function hoodHalfAt(x){const [w]=section(x);return w-.028-(.008+.042*clamp((x-NOSE())/(B.hoodEnd-NOSE())));}
// Bonnet height at (x, y). The centre section reaches out to yc, which runs
// back from the grille's top corners (0.446) toward the cowl (0.546). At the
// nose it follows the grille's top edge; behind, it is nearly flat. Outside
// yc the bonnet runs to its edge, 16 mm above the shoulder: round the swept
// corners that edge dips beside the grille and arches over the lamps.
function hoodShape(x,y){
 y=Math.abs(y);
 const half=hoodHalfAt(x),E=section(x)[1]+.016,f=1-sm((x-NOSE())/.25);
 const Zc=edgeAt(hoodCentre,x),C=.008+.023*f,yc=.446+.10*clamp((x-NOSE())/(B.hoodEnd-NOSE()));
 if(y<=yc)return Zc-C*(y/yc)**(2+1.2*f);
 return Zc-C+(E-Zc+C)*clamp((y-yc)/(half-yc))**1.35;
}
// The same surface as the shared bonnet draws it: straight between its lanes.
function hoodZ(x,y){
 const half=hoodHalfAt(x),t=Math.min(1,Math.abs(y)/half),L=B.hoodLanes;
 let i=1;while(i<L.length-1&&t>L[i])i++;
 return mix(hoodShape(x,L[i-1]*half),hoodShape(x,L[i]*half),(t-L[i-1])/(L[i]-L[i-1]));
}
// Paint shade from a face's slope: lit from above, a little from the front
// and the right, as the shared bonnet lanes are.
function slopeTint(p){
 const a=p[2].map((v,i)=>v-p[0][i]),b=p[3].map((v,i)=>v-p[1][i]);
 let n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const l=Math.hypot(...n)||1;n=n.map(v=>v/l);if(n[2]<0)n=n.map(v=>-v);
 return .93+.26*(-.34*n[0]+.22*n[1]+.91*n[2]);
}
function poly(r,id,pts,c){r.tag(id,()=>r.polygon(pts,c,false));}

// An end of the car: a surface that bulges from the end station to the bumper.
// u runs across the car (-1..1), v from the lower edge to the top edge.
function endSurface(end){
 const front=end<0,x0=front?B.stations[0][0]:B.stations.at(-1)[0],[w0,top0]=section(x0);
 const low=front?B.base:B.rearBase;
 const dir=front?-1:1;
 // Front: the apron stands nearly upright from the splitter to the band under
 // the grille, where the nose reaches furthest forward; from there the face
 // leans back through the grille and lamps to the bonnet's leading edge.
 // Rear: the bumper stands proud under the lid.
 const bulge=front?v=>.17*(v<.36?.82+.18*Math.sin(Math.PI/2*v/.36):1)*(v>.56?1-.82*((v-.56)/.44)**1.6:1)
  :v=>.118*(v<.645?1:1-.55*((v-.645)/.355)**1.4);
 // Front: (1-|u|^4)^2, flat across the grille and meeting the nose arc with
 // zero slope at the edge. Rear: unchanged.
 const pw=front?4:3.4;
 const plan=front?u=>(1-Math.abs(u)**pw)**2:u=>1-Math.abs(u)**pw;
 const dplan=front?u=>-2*pw*Math.sign(u)*Math.abs(u)**(pw-1)*(1-Math.abs(u)**pw):u=>-pw*Math.sign(u)*Math.abs(u)**(pw-1);
 // Lift a point off the surface along its plan normal, so lamps and trim stay
 // proud of the bumper where it wraps round the corners.
 const lifted=(u,v,yEdge,x,y,z,lift)=>{const nx=dir,ny=-bulge(v)*dplan(u)/yEdge,n=Math.hypot(nx,ny);return [x+nx*lift/n,y+ny*lift/n,z];};
 const hoodHalf=front?hoodHalfAt(x0):w0*B.hoodFrac-.008;
 const zTop=y=>{
  if(!front)return top0;
  const a=Math.abs(y);
  if(a>=hoodHalf){const edge=sideY(x0,top0);return top0+.0152*clamp((edge-a)/(edge-hoodHalf));}
  return hoodZ(x0,a)-.0008;
 };
 const at=(u,v,lift=0)=>{
  let y=u*sideY(x0,low+.01),z=low;
  for(let k=0;k<4;k++){z=mix(low,zTop(y),v);y=u*sideY(x0,Math.min(z,top0));}
  return lift?lifted(u,v,sideY(x0,Math.min(z,top0)),x0+dir*bulge(v)*plan(u),y,z,lift):[x0+dir*bulge(v)*plan(u),y,z];
 };
 const on=(y,z,lift=.006)=>{
  const yEdge=sideY(x0,Math.min(z,top0)),u=Math.max(-1,Math.min(1,y/yEdge));
  const zt=zTop(Math.abs(u*yEdge)),v=clamp((z-low)/(zt-low));
  return lifted(u,v,yEdge,x0+dir*bulge(v)*plan(u),u*yEdge,mix(low,zt,v),lift);
 };
 const vAt=(z,y=0)=>clamp((z-low)/(zTop(Math.abs(y))-low));
 return {at,on,x0,dir,top0,w0,vAt,zTop,edge:z=>sideY(x0,Math.min(z,top0))};
}
function drawEnd(r,s,id,colorAt,vs,cols){
 r.tag(id,()=>{for(let i=1;i<cols.length;i++)for(let j=1;j<vs.length;j++){
  const a=cols[i-1],b=cols[i],c=vs[j-1],d=vs[j],p=[s.at(a,c),s.at(b,c),s.at(b,d),s.at(a,d)];
  const z=(p[0][2]+p[2][2])/2,y=Math.max(...p.map(q=>Math.abs(q[1])));
  const color=colorAt(z,y,(a+b)/2);if(color)r.polygon(p,color,false);
 }});
}
const symCols=h=>[...h.map(u=>-u).reverse(),...h];
// Narrow vertical strips between a lower and an upper (y,z) edge, so a feature
// follows the curved end surface instead of cutting through it.
function edgeAt(pts,y){let i=1;while(i<pts.length-1&&y>pts[i][0])i++;const [ya,za]=pts[i-1],[yb,zb]=pts[i];return mix(za,zb,clamp((y-ya)/(yb-ya)));}
function bander(r,s){
 return (lower,upper,color,lift,{tag='body.structure',glass=false,mirror=true,from=-9,to=9,step=.03}={})=>{
  const y0=Math.max(lower[0][0],upper[0][0],from),y1=Math.min(lower.at(-1)[0],upper.at(-1)[0],to),n=Math.max(1,Math.ceil((y1-y0)/step));
  // Split tall strips in height too, so they follow the bumper's curve instead
  // of cutting into it. Every column gets the same number of rows, so
  // neighbouring strips share their corners and no cracks open between them.
  let m=1;for(let i=0;i<=n;i++){const y=mix(y0,y1,i/n);m=Math.max(m,Math.ceil((edgeAt(upper,y)-edgeAt(lower,y))/.024));}
  for(const sgn of mirror?[-1,1]:[1])for(let i=0;i<n;i++){
   const ya=mix(y0,y1,i/n),yb=mix(y0,y1,(i+1)/n),q=(y,z)=>s.on(sgn*y,z,lift);
   const la=edgeAt(lower,ya),lb=edgeAt(lower,yb),ua=edgeAt(upper,ya),ub=edgeAt(upper,yb);
   for(let k=0;k<m;k++){
    const pts=[q(ya,mix(la,ua,k/m)),q(yb,mix(lb,ub,k/m)),q(yb,mix(lb,ub,(k+1)/m)),q(ya,mix(la,ua,(k+1)/m))];
    r.tag(tag,()=>glass?glazingFace(r,pts,'#c3d2d8',.16):r.polygon(sgn<0?pts.reverse():pts,color,false));
   }
  }
 };
}
const sym=h=>[...h.map(([y,z])=>[-y,z]).reverse(),...h];
const shift=(pts,dz)=>pts.map(([y,z])=>[y,z+dz]);
// A closed (y,z) ring on the surface, as a fan of strips around its centre.
function ringOn(r,s,tag,cy,cz,ry,rz,color,lift,n=20){
 r.tag(tag,()=>{const c=s.on(cy,cz,lift);for(let i=0;i<n;i++){
  const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;
  r.polygon([c,s.on(cy+Math.cos(a)*ry,cz+Math.sin(a)*rz,lift),s.on(cy+Math.cos(b)*ry,cz+Math.sin(b)*rz,lift)],color,false);
 }});
}

// Front: facelift AMG grille with the large star and one chrome bar, the swept
// headlamps, and the AMG apron with a wide central intake over a black
// splitter and two outer intakes carrying the daytime running lamps.
function frontEnd(r,paint){
 const base=endSurface(-1);
 // One surface for the whole front: across the face, round the swept corner
 // and back along the fender. Features are placed by v: on the face and round
 // the corner v is the head-on y (as the head-on photograph measures it); once
 // the corner has turned to y 0.85, v carries on as distance along the skin,
 // so the lamp tails and the intakes run back along the fender in one piece.
 const YL=.85,tables=new Map();
 const table=z=>{
  const key=Math.round(z*1000);let t=tables.get(key);if(t)return t;
  const zz=key/1000,e=base.edge(zz),V=[],X=[],Y=[];
  for(let y=0;y<e;y+=.005){const p=base.on(y,zz,0);V.push(y);X.push(p[0]);Y.push(p[1]);}
  {const p=base.on(e,zz,0);V.push(e);X.push(p[0]);Y.push(p[1]);}
  const side0=V.length;let x=base.x0,y=e,v=e,past=e>=YL;
  while(x<-1.2){const x1=x+(x<-1.6?.002:.01),y1=sideY(x1,zz),d=Math.hypot(x1-x,y1-y);
   if(past)v+=d;else if(y1>=YL){past=true;v=YL+Math.hypot(x1-x,y1-y)*(y1-YL)/Math.max(1e-9,y1-y);}else v=y1;
   x=x1;y=y1;V.push(v);X.push(x);Y.push(y);}
  t={V,X,Y,side0};tables.set(key,t);return t;
 };
 const pt=(v,z)=>{
  const {V,X,Y}=table(z);let a=0,b=V.length-1;
  if(v>=V[b])return [X[b]+(v-V[b]),Y[b],z];
  while(b-a>1){const m=(a+b)>>1;if(V[m]<=v)a=m;else b=m;}
  const t=(v-V[a])/((V[b]-V[a])||1);return [mix(X[a],X[b],t),mix(Y[a],Y[b],t),z];
 };
 // v at a given x along the fender (x at or behind the nose station).
 const vAtX=(x,z)=>{const {V,X,side0}=table(z);for(let i=side0;i<X.length;i++)if(X[i]>=x){const t=(x-X[i-1])/((X[i]-X[i-1])||1);return mix(V[i-1],V[i],clamp(t));}return V.at(-1);};
 const on=(sv,z,lift=.006)=>{
  const sg=sv<0?-1:1,a=Math.abs(sv),p=pt(a,z);
  if(!lift)return [p[0],sg*p[1],p[2]];
  const lo=a<.012?pt(.012-a,z).map((c,i)=>i===1?-c:c):pt(a-.012,z),hi=pt(a+.012,z),tx=hi[0]-lo[0],ty=hi[1]-lo[1],n=Math.hypot(tx,ty)||1;
  return [p[0]-ty/n*lift,sg*(p[1]+tx/n*lift),p[2]];
 };
 const s={...base,on},band=bander(r,s);
 const cols=symCols([.05,.14,.24,.34,.44,.52,.60,.68,.75,.81,.86,.90,.935,.96,.98,.993,1]);
 const vs=[.18,.21,.238,.27,.30,.33,.36,.39,.414,.45,.48,.51,.54,.57,.60,.63,.66,.69,.72,.745].map(z=>s.vAt(z)).concat([.965,.985,1]).sort((a,b)=>a-b).filter((v,i,a)=>i===a.length-1||a[i+1]-v>.01);
 // Toward the corners the face takes on the side panels' shading at the same
 // height, so the rounded corner reads as one surface with the fender.
 const sideTone=(z,y)=>{const top=section(base.x0)[1],l=clamp((z-B.base)/(top-B.base)),L=B.sideLevels;let i=1;while(i<L.length-1&&l>L[i])i++;return B.sideTints[i-1]*(y<0?.95:1);};
 drawEnd(r,base,'body.structure',(z,y,u)=>tone(paint,mix(.84+.20*clamp((z-.22)/.50),sideTone(z,y),clamp((Math.abs(u)-.55)/.45)**1.5)),vs,cols);
 // The ledge between the top of the face and the bonnet's leading edge.
 r.tag('body.structure',()=>{for(let i=1;i<cols.length;i++){
  const a=base.at(cols[i-1],1),b=base.at(cols[i],1);
  r.polygon([a,b,[base.x0+.004,b[1],b[2]-.001],[base.x0+.004,a[1],a[2]-.001]],tone(paint,1.10),false);
 }});
 const lamp={tag:'lighting.headlamp'};
 const inset=(pts,ky,kz,zc)=>pts.map(([y,z])=>[y*ky,zc+(z-zc)*kz]);

 // Grille: wide and shallow. The top edge peaks slightly at the centre, the
 // sides slant in toward the bottom, and the bottom edge falls to a V. A
 // gloss-black frame holds a fine black mesh; one chrome bar runs out from
 // the star.
 const gTop=sym([[0,.765],[.15,.762],[.30,.755],[.40,.745],[.43,.737],[.446,.729],[.452,.716]]);
 const gLow=sym([[0,.541],[.10,.548],[.22,.558],[.34,.569],[.40,.578],[.43,.593],[.445,.653],[.452,.716]]);
 const oTop=inset(gTop,.975,.92,.652),oLow=inset(gLow,.975,.92,.652);
 band(gLow,gTop,GLOSS,.010,{mirror:false,step:.02});
 band(oLow,oTop,MESH,.012,{mirror:false,step:.02});
 r.tag('body.structure',()=>{
  // Fine diamond mesh.
  for(const dir of [-1,1])for(let k=-22;k<=22;k++){
   const n=8;for(let i=0;i<n;i++){
    const za=mix(.548,.758,i/n),zb=mix(.548,.758,(i+1)/n),ya=k*.021+dir*(za-.653)*.9,yb=k*.021+dir*(zb-.653)*.9;
    const ok=(y,z)=>Math.abs(y)<.438&&z<edgeAt(oTop,y)-.003&&z>edgeAt(oLow,y)+.003;
    if(!ok(ya,za)||!ok(yb,zb))continue;
    r.polygon([s.on(ya-.0016,za,.0135),s.on(ya+.0016,za,.0135),s.on(yb+.0016,zb,.0135),s.on(yb-.0016,zb,.0135)],'#1f2528',false);
   }
  }
 });
 // The chrome bar, with a darker lower edge, from the star ring to the frame.
 const starZ=.653,starR=.089,starK=.83;
 band([[.094,starZ+.002],[.436,starZ]],[[.094,starZ+.010],[.436,starZ+.008]],CHROME,.016,{step:.04});
 band([[.094,starZ-.003],[.436,starZ-.005]],[[.094,starZ+.002],[.436,starZ]],'#7d878b',.016,{step:.04});
 // The star: a chrome ring and a faceted three-pointed star, laid on the
 // raked face so no part sinks behind the mesh. The mesh shows through.
 r.tag('body.structure',()=>{
  const n=40,P=(a,rad,l)=>s.on(Math.cos(a)*rad,starZ+Math.sin(a)*rad*starK,l);
  for(let i=0;i<n;i++){const a=i/n*2*Math.PI,b=(i+1)/n*2*Math.PI;
   r.polygon([P(a,starR-.011,.020),P(b,starR-.011,.020),P(b,starR,.020),P(a,starR,.020)],tone(CHROME,.86+.22*Math.max(0,Math.sin((a+b)/2))),false);}
  for(let k=0;k<3;k++){const a=Math.PI/2+k*2*Math.PI/3,tip=P(a,starR-.012,.024),c=P(0,0,.026),l=P(a-Math.PI/3,starR*.11,.022),rr=P(a+Math.PI/3,starR*.11,.022);
   r.polygon([c,tip,l],tone(CHROME,1.08),false);r.polygon([c,rr,tip],tone(CHROME,.74),false);}
 });
 // Bonnet shut line along the top of the face.
 r.tag('body.structure',()=>{const e=base.edge(.75)-.01,n=28;for(let i=0;i<n;i++){
  const ya=mix(-e,e,i/n),yb=mix(-e,e,(i+1)/n),za=base.zTop(ya),zb=base.zTop(yb);
  r.polygon([s.on(ya,za-.007,.004),s.on(yb,zb-.007,.004),s.on(yb,zb-.002,.004),s.on(ya,za-.002,.004)],'#22272a',false);
 }});

 // Headlamps (facelift W204). Across the face and round the corner the outline
 // is the head-on photograph's; along the fender, the side photograph's. The
 // inner end stands just outside the grille, leaving a slanted strip of body
 // colour, and leans inward going down. The top edge runs 10 mm over the
 // shoulder, just under the bonnet's edge, so it dips beside the grille,
 // arches over the main beam and, as the lamp wraps back along the fender,
 // curves down to the tail's tip at x -1.73, z 0.765. The lower edge is nearly
 // level across the face, then climbs along the fender to the tip.
 const xOf=v=>pt(v,.68)[0],tipX=-1.73,tipZ=.765,vTip=vAtX(tipX,tipZ);
 const lowX=[[NOSE_X-.05,.585],[NOSE_X+.02,.587],[NOSE_X+.10,.598],[-1.95,.620],[-1.90,.645],[-1.85,.680],[-1.80,.715],[tipX,tipZ]];
 const lowAt=v=>v<.60?mix(.585,.590,clamp((v-.465)/.135)):Math.max(mix(.590,.600,clamp((v-.60)/.10)),edgeAt(lowX,xOf(v)));
 const ridge=v=>{const x=xOf(v),z=section(x)[1]+.010;return z-(z-tipZ)*sm((x-(tipX-.07))/.07);};
 const topAt=v=>v<.49?mix(lowAt(.465),ridge(.49),clamp((v-.465)/.025)):ridge(v);
 const ss=[.465,.47,.475,.48,.485,.49];for(let v=.50;v<vTip-.004;v+=.01)ss.push(v);ss.push(vTip);
 const lampTop=ss.map(v=>[v,Math.max(lowAt(v),topAt(v))]),lampLow=ss.map(v=>[v,lowAt(v)]);
 // Inner layers stop short of the tip, where the lamp is too thin for them.
 const fade=v=>1-clamp((v-(vTip-.18))/.15);
 const layer=(f0,f1,from,to)=>{const vs=ss.filter(v=>v>=from&&v<=to);return [vs.map(v=>[v,f0(v)]),vs.map(v=>[v,Math.max(f0(v)+.0006,f1(v))])];};
 band(lampLow,lampTop,'#15191b',.008,{...lamp,step:.015});
 // Interior below a black band along the top.
 band(...layer(v=>lowAt(v)+.009*fade(v),v=>topAt(v)-.022*fade(v),.50,vTip-.03),'#2a3236',.010,{...lamp,step:.015});
 // Two lamps: the large round main-beam bowl where the face turns the corner,
 // and a smaller projector inboard. Placed by head-on y, so they read round
 // from the front even on the swept face.
 const bowl=(y,z,rad,rings,lift)=>r.tag('lighting.headlamp',()=>{const n=32,P=(a,k)=>s.on(y+Math.cos(a)*rad*k,z+Math.sin(a)*rad*k,lift);
  for(let j=0;j<rings.length;j++){const [k1,color]=rings[j],k0=rings[j+1]?.[0]??0;
   for(let i=0;i<n;i++){const a=i/n*2*Math.PI,b=(i+1)/n*2*Math.PI,q=k0?[P(a,k0),P(b,k0),P(b,k1),P(a,k1)]:[P(a,0),P(a,k1),P(b,k1)];r.polygon(y<0?q.reverse():q,color,false);}}});
 for(const sg of [-1,1]){
  bowl(sg*.690,.664,.058,[[1,'#8d979c'],[.90,'#56616a'],[.80,'#a9b2b6'],[.56,'#cdd3d5'],[.34,'#5f6a72'],[.20,r.lights?'#eef2ec':'#a4aeb2']],.016);
  bowl(sg*.565,.648,.030,[[1,'#4a545a'],[.80,'#7f898e'],[.52,'#a8b1b5'],[.26,r.lights?'#e2e8e4':'#6d787d']],.016);
 }
 // Chrome line along the lower part, and the LED strip along the bottom
 // edge of the inner half.
 band(...layer(v=>lowAt(v)+.016*fade(v),v=>lowAt(v)+.022*fade(v),.53,vTip-.06),'#96a0a5',.012,{...lamp,step:.015});
 band(...layer(v=>lowAt(v)+.004,v=>lowAt(v)+.012,.49,.64),r.lights?'#f6faf7':'#dfe7e8',.013,{...lamp,step:.015});
 band(lampLow,lampTop,null,.019,{...lamp,glass:true,step:.015});

 // Apron. The central intake is a trapezoid, wider at the bottom, filled with
 // black honeycomb, over the black splitter. Body-colour struts slant between
 // it and the outer intakes.
 const iTop=sym([[0,.414],[.42,.414],[.436,.404],[.51,.240]]),iLow=sym([[0,.238],[.51,.238]]);
 band(iLow,iTop,'#0a0c0d',.008,{mirror:false,step:.02});
 r.tag('body.structure',()=>{
  for(let j=0;j<8;j++)for(let i=-23;i<=23;i++){
   const y=i*.0235+(j%2?.0118:0),z=.254+j*.0195,half=.51-(z-.238)*.455;if(Math.abs(y)>half-.016||z>.402)continue;
   const c=[[y-.0098,z],[y,z-.0082],[y+.0098,z],[y,z+.0082]];r.polygon(c.map(([yy,zz])=>s.on(yy,zz,.010)),'#1b2023',false);
  }
 });
 // Black splitter under the central intake, standing a little proud.
 band([[-.535,.184],[.535,.184]],[[-.535,.238],[.535,.238]],BLACK,.014,{mirror:false,step:.03});
 r.tag('body.structure',()=>{for(let i=0;i<12;i++){
  const ya=mix(-.535,.535,i/12),yb=mix(-.535,.535,(i+1)/12);
  r.polygon([s.on(ya,.238,.014),s.on(yb,.238,.014),s.on(yb,.238,.002),s.on(ya,.238,.002)],'#22272a',false);
 }});
 // Outer intakes: from the strut beside the central intake round the corner.
 // A slot along the top carries the daytime running lamp; a blade divides it
 // from the mesh below.
 const oiTop=[[.506,.392],[.93,.396]],oiLow=[[.506,.388],[.59,.250],[.86,.250],[.90,.272],[.93,.335]];
 band(oiLow,oiTop,'#0a0c0d',.008,{step:.015});
 band([[.524,.343],[.925,.347]],[[.524,.354],[.925,.358]],'#2b3134',.011,{step:.02});
 band([[.55,.362],[.80,.365]],[[.55,.377],[.80,.380]],r.lights?'#f6faf7':'#cfd8da',.012,{...lamp,step:.02});
 r.tag('body.structure',()=>{for(const sg of [-1,1])for(let j=0;j<4;j++)for(let i=0;i<16;i++){
  const y=.585+i*.0215+(j%2?.0107:0),z=.266+j*.0195;if(y>.865||y<.59-(z-.25)*.61+.018)continue;
  const c=[[y-.009,z],[y,z-.0075],[y+.009,z],[y,z+.0075]];r.polygon(c.map(([yy,zz])=>s.on(sg*yy,zz,.010)),'#1b2023',false);
 }});
 // The slot ahead of each front wheel.
 band([[1.000,.262],[1.018,.268]],[[1.008,.386],[1.026,.392]],'#0d1012',.007,{step:.02});
 // The tow-eye cover: a panel line in the paint. (The headlamp washer covers
 // sit where the bumper turns from the lamps' swept plan to its fuller one,
 // and are left out.)
 band([[.415,.402],[.478,.402]],[[.415,.452],[.478,.452]],tone(paint,.90),.0045,{mirror:false,step:.03});
 band([[.419,.406],[.474,.406]],[[.419,.448],[.474,.448]],tone(paint,.98),.005,{mirror:false,step:.03});
 // Parking sensors across the band under the grille.
 for(const y of [.25,.667])for(const sg of [-1,1])ringOn(r,s,'body.structure',sg*y,.446,.011,.011,tone(paint,.78),.007,10);
 // Amber side markers on the fenders, under the lamp tails.
 {const m0=vAtX(-1.83,.60),m1=vAtX(-1.73,.60);band([[m0,.578],[m1,.592]],[[m0,.606],[m1,.624]],'#c27a34',.006,{tag:'lighting.indicator',step:.02});}
}

// Boot lid face between the tail lamps: its outline across the back, (half-width, z).
const lidEdge=[[.470,.705],[.520,.740],[.585,.878],[.640,.906]];
const lidHalf=z=>z<.705?0:edgeAt(lidEdge.map(([y,z])=>[z,y]),z);
function rearEnd(r,paint){
 const s=endSurface(1),band=bander(r,s);
 const cols=symCols([.05,.14,.24,.34,.44,.52,.58,.64,.70,.76,.81,.86,.90,.935,.96,.98,.993,1]);
 const vs=[.225,.25,.27,.30,.34,.38,.42,.455,.49,.53,.57,.61,.65,.69,.705,.74,.78,.82,.86,.89].map(z=>s.vAt(z)).concat([1]).sort((a,b)=>a-b).filter((v,i,a)=>i===a.length-1||a[i+1]-v>.01);
 const paintAt=z=>tone(paint,.82+.20*clamp((z-.45)/.5));
 const inLid=(z,y)=>z>.705&&y<lidHalf(z)-.002;
 drawEnd(r,s,'body.structure',(z,y)=>{
  if(inLid(z,y))return null;
  if(z<.30&&y<.78)return BLACK;
  if(z<.45&&y<.74)return '#141719';
  return paintAt(z);
 },vs,cols);
 deckPanel(r,false,()=>drawEnd(r,s,'body.deck',(z,y)=>inLid(z,y)?paintAt(z):null,vs,cols));
 const lidAt=(y,z,lift)=>s.on(y,z,lift);
 deckPanel(r,false,()=>{
  // Chrome strip and licence plate recess on the lid; the star and the badges.
  const strip=[[-.43,.868],[0,.874],[.43,.868]];
  for(let i=1;i<strip.length;i++){const [y0,z0]=strip[i-1],[y1,z1]=strip[i];r.polygon([lidAt(y0,z0,.008),lidAt(y1,z1,.008),lidAt(y1,z1+.012,.008),lidAt(y0,z0+.012,.008)],CHROME,false);}
  r.polygon([lidAt(-.165,.712,.004),lidAt(.165,.712,.004),lidAt(.165,.858,.004),lidAt(-.165,.858,.004)],tone(paint,.74),false);
  starBadge(r,lidAt(0,.890,.008),.036,'x',1);
  for(const [y0,y1] of [[-.60,-.50],[.46,.58]])r.polygon([lidAt(y0,.884,.008),lidAt(y1,.884,.008),lidAt(y1,.894,.008),lidAt(y0,.894,.008)],CHROME,false);
 });
 // Lid shut line.
 r.tag('body.structure',()=>{
  const ring=[...lidEdge.map(([y,z])=>[-y,z]).reverse(),...lidEdge];
  for(let i=1;i<ring.length;i++){const [y0,z0]=ring[i-1],[y1,z1]=ring[i];
   r.polygon([s.on(y0,z0,.003),s.on(y1,z1,.003),s.on(y1,z1-.006,.003),s.on(y0,z0-.006,.003)],'#24292c',false);}
 });
 // Bumper: a crease across it, the diffuser's chrome-edged top and four fins.
 band([[-.78,.548],[.78,.548]],[[-.78,.556],[.78,.556]],tone(paint,1.12),.005,{mirror:false,step:.04});
 band([[-.70,.446],[0,.452],[.70,.446]],[[-.70,.456],[0,.462],[.70,.456]],SILVER,.008,{mirror:false,step:.04});
 for(const y of [-.30,-.13,.13,.30])band([[y-.008,.30],[y+.008,.30]],[[y-.008,.44],[y+.008,.44]],'#24292c',.020,{mirror:false,step:.016});
 // Quad exhaust: two oval outlets each side.
 r.tag('body.structure',()=>{
  for(const y of [-.605,-.475,.475,.605]){
   const tz=.302,c=s.on(y,tz,0),ry=.060,rz=.036,n=18;
   const P=(t,k,dx)=>[c[0]+dx,y+Math.cos(t)*ry*k,tz+Math.sin(t)*rz*k];
   for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;
    r.polygon([P(a,1,-.05),P(b,1,-.05),P(b,1,.018),P(a,1,.018)],CHROME,false);
    r.polygon([P(a,.86,.017),P(b,.86,.017),P(b,1,.018),P(a,1,.018)],'#e1e6e7',false);
    r.polygon([P(a,0,.005),P(b,.86,.012),P(a,.86,.012)],'#0d1113',false);}
  }
 });
 // Tail lamps on the rear face, from the lid edge to the corner: vertical strips.
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  // Tall lamp: a slanted inner edge beside the lid, a flat bottom and a rounded outer corner.
  const lo=y=>y<.52?mix(.694,.676,(y-.49)/.03):.676+.03*clamp((y-.745)/(yOut-.745))**2,hi=y=>y<.60?mix(.712,.905,(y-.49)/.11):.905-.012*(y-.60)/.19;
  const yOut=Math.max(.79,s.edge(.80)-.004),ys=Array.from({length:10},(_,i)=>.49+i*(yOut-.49)/9);
  for(let i=1;i<ys.length;i++){
   // One plan position per column, the outermost point of the face over its height.
   const col=y=>{let x=-9;for(let k=0;k<=6;k++)x=Math.max(x,s.on(y,mix(lo(y),hi(y),k/6),.006)[0]);return [x,side*y];};
   const [xa,ya]=col(ys[i-1]),[xb,yb]=col(ys[i]);
   const strip=(l0,l1,color,dx=0)=>r.polygon([[xa+dx,ya,l0(ys[i-1])],[xb+dx,yb,l0(ys[i])],[xb+dx,yb,l1(ys[i])],[xa+dx,ya,l1(ys[i-1])]],color,false);
   strip(lo,hi,SMOKE);
   strip(y=>lo(y)+.012,y=>Math.min(hi(y)-.004,lo(y)+.036),r.lights?'#ff4e56':'#c02a33',.002);
   strip(y=>Math.min(hi(y)-.010,lo(y)+.060),y=>Math.min(hi(y)-.004,hi(y)-.048),'#5b1e24',.0015);
   strip(y=>Math.max(lo(y)+.040,hi(y)-.036),y=>hi(y)-.012,r.lights?'#ff4e56':'#b0262f',.002);
  }
 }});
}

// Tail lamps wrapping onto the rear quarters: vertical strips, one plan position each.
function quarterLamps(r){
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const x1=B.stations.at(-1)[0];
  const x0=RX(1.955),xs=Array.from({length:16},(_,i)=>x0+i*(x1-x0)/15);
  const t=x=>(x-xs[0])/(xs.at(-1)-xs[0]);
  const lo=x=>mix(.835,.706,t(x)**.8),hi=x=>mix(.862,.893,Math.min(1,t(x)*2));
  const col=(x,dy)=>[x,side*(sideY(x,(lo(x)+hi(x))/2)+dy)];
  for(let i=1;i<xs.length;i++){
   const a=xs[i-1],b=xs[i];
   const strip=(l0,l1,dy,color)=>{const [xa,ya]=col(a,dy),[xb,yb]=col(b,dy);r.polygon([[xa,ya,l0(a)],[xb,yb,l0(b)],[xb,yb,l1(b)],[xa,ya,l1(a)]],color,false);};
   strip(lo,hi,.008,SMOKE);
   strip(x=>lo(x)+.010,x=>Math.min(hi(x)-.004,lo(x)+.030),.010,r.lights?'#ff4e56':'#c02a33');
   strip(x=>Math.min(hi(x)-.012,Math.max(lo(x)+.034,hi(x)-.024)),x=>hi(x)-.006,.010,r.lights?'#ff4e56':'#b0262f');
  }
 }});
}

// A dark seal under the gap between the bonnet and each fender, so the shut
// line reads as a line instead of showing the engine bay through it.
function bonnetSeals(r){
 r.tag('body.structure',()=>{
  // Finer steps round the nose corners, where the bonnet edge turns quickly.
  const x0=B.stations[0][0],xs=[...Array.from({length:14},(_,i)=>x0+.17*i/14),...Array.from({length:23},(_,i)=>mix(x0+.17,B.hoodEnd,i/22))];
  for(const side of [-1,1])for(let i=1;i<xs.length;i++){
   const P=(x,dy)=>{const [w,h]=section(x);return [x,side*(w*B.hoodFrac+dy),h+.010];};
   const a=xs[i-1],b=xs[i],q=[P(a,-.016),P(b,-.016),P(b,.003),P(a,.003)];
   r.polygon(side<0?q.reverse():q,'#1b1f21',false);
  }
 });
}

// The AMG power domes: two raised ridges along the bonnet.
function powerDomes(r,paint){
 panel(r,'bonnet',[0,0,.71],'body.hood',()=>{
  const xs=[FX(-2.02),FX(-1.90),-1.70,-1.45,-1.20,-1.02,-.90];
  const hood=hoodZ;
  const rise=x=>.012*clamp((x-FX(-2.02))/.30)*clamp((-.90-x)/.30);
  for(const s of [-1,1])for(let i=1;i<xs.length;i++)for(let j=0;j<6;j++){
   const u=-1+j/3,v=u+1/3,p=(x,uu)=>{const y=s*(.17+.07*uu);return [x,y,hood(x,y)+.0015+rise(x)*(1-uu*uu)];};
   const q=[p(xs[i-1],u),p(xs[i],u),p(xs[i],v),p(xs[i-1],v)];r.polygon(q,tone(paint,slopeTint(q)),false);
  }
  // The round Mercedes badge on the bonnet, just behind its leading edge.
  const bx=B.stations[0][0]+.075,n=18,P=(a,rad,l)=>{const x=bx+Math.cos(a)*rad*.9,y=Math.sin(a)*rad;return [x,y,hoodZ(x,y)+l];};
  for(let i=0;i<n;i++){const a=i/n*2*Math.PI,b=(i+1)/n*2*Math.PI;
   r.polygon([P(0,0,.004),P(a,.029,.003),P(b,.029,.003)],CHROME,false);
   r.polygon([P(0,0,.0055),P(a,.022,.0045),P(b,.022,.0045)],'#1c2430',false);}
  for(let k=0;k<3;k++){const a=Math.PI+k*2*Math.PI/3;r.polygon([P(0,0,.007),P(a-.25,.006,.006),P(a,.019,.006),P(a+.25,.006,.006)],CHROME,false);}
 });
}

function archLiners(r){
 r.tag('body.structure',()=>{
  for(const ax of [-B.wb/2,B.wb/2])for(const side of [-1,1]){
   const n=24,wall=ax<0?.685:.66,R=B.arch-.004,r0=.345;
   for(let i=0;i<n;i++){
    const a=i/n*Math.PI,b=(i+1)/n*Math.PI;
    // Behind each wheel the liner stops short: the coolant tank and the boot fuse box sit there.
    if(b<=Math.PI/4+1e-9)continue;
    const ring=(t,rad,y)=>[ax+Math.cos(t)*rad,side*y,B.axleZ+Math.sin(t)*rad];
    const outer=t=>sideY(ax+Math.cos(t)*R,B.axleZ+Math.sin(t)*R)-.01;
    r.polygon([ring(a,R,wall),ring(b,R,wall),ring(b,R,outer(b)),ring(a,R,outer(a))],LINER,false);
    r.polygon([ring(a,r0,wall),ring(b,r0,wall),ring(b,R,wall),ring(a,R,wall)],LINER,false);
   }
  }
 });
}

// Wheel-arch flares. The C63's front fenders are widened: a flat lip stands
// out round each opening and a bevel runs from it back into the fender. The
// rear arches carry a slighter version.
function archFlares(r,paint){
 r.tag('body.structure',()=>{
  for(const [ax,out,wide] of [[-B.wb/2,.024,.058],[B.wb/2,.012,.050]])for(const side of [-1,1]){
   const n=30,R0=B.arch+.001,R1=R0+.020,R2=R0+wide,k=side<0?.95:1;
   const P=(t,rad,lift)=>{const x=ax+Math.cos(t)*rad,z=B.axleZ+Math.sin(t)*rad;return [x,side*(sideY(x,z)+lift),z];};
   for(let i=0;i<n;i++){
    const a=i/n*Math.PI,b=(i+1)/n*Math.PI,up=Math.sin((a+b)/2),f=t=>out*clamp(Math.sin(t)/.45)**.8,Rm=(R1+R2)/2;
    const quad=(ra,la,rb,lb,color)=>{const q=[P(b,ra,la(b)),P(a,ra,la(a)),P(a,rb,lb(a)),P(b,rb,lb(b))];r.polygon(side<0?q:q.reverse(),color,false);};
    quad(R0,()=>-.012,R0,f,tone(paint,.66*k));
    quad(R0,f,R1,f,tone(paint,(.97+.07*up)*k));
    quad(R1,f,Rm,t=>f(t)*.45,tone(paint,(.93+.16*up)*k));
    quad(Rm,t=>f(t)*.45,R2,()=>.001,tone(paint,(.90+.24*up)*k));
   }
  }
 });
}

// Fender badges, the fuel door on the right rear quarter, and the boot lip.
function sideDetail(r,paint){
 r.tag('body.structure',()=>{
  for(const side of [-1,1]){
   const p=(x,z)=>[x,side*(sideY(x,z)+.004),z];
   const q=[p(-1.12,.665),p(-.94,.668),p(-.94,.682),p(-1.12,.679)];r.polygon(side<0?q:q.reverse(),CHROME,false);
  }
  const fd=(x,z)=>[x,sideY(x,z)+.003,z];
  r.polygon([fd(1.52,.880),fd(1.68,.878),fd(1.68,.975),fd(1.52,.978)],tone(paint,.90),false);
 });
 // A small lip spoiler at the end of the boot lid.
 deckPanel(r,false,()=>{
  const x=B.stations.at(-1)[0],[w,z]=section(x),h=.58;
  for(let k=0;k<6;k++){const a=-h+k*h/3,b=a+h/3;
   r.polygon([[x-.08,a,z+.021],[x-.08,b,z+.021],[x+.005,b,z+.030],[x+.005,a,z+.030]],tone(paint,1.10),false);
   r.polygon([[x+.005,a,z+.030],[x+.005,b,z+.030],[x+.012,b,z+.012],[x+.012,a,z+.012]],tone(paint,.86),false);
  }
 });
}

export function buildC63Exterior(r,paint){
 coachwork(r,B,paint);
 archFlares(r,paint);
 bonnetSeals(r);
 powerDomes(r,paint);
 frontEnd(r,paint);
 rearEnd(r,paint);
 quarterLamps(r);
 archLiners(r);
 sideDetail(r,paint);
}
