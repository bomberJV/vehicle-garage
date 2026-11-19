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
// The nose corners in plan: a circular arc of radius 0.17 from the front
// station (where the side runs straight across) round to the fender, so the
// front face turns into the body sides without a crease.
const noseArc=()=>{
 const x0=FX(-2.17),Rc=.17,W=.885,xc=x0+Rc,yc=W-Rc;
 const zAt=x=>{const k=[[x0,.782],[FX(-2.06),.785],[FX(-1.92),.790],[-1.72,.802]];let i=0;while(i<k.length-2&&x>k[i+1][0])i++;return mix(k[i][1],k[i+1][1],clamp((x-k[i][0])/(k[i+1][0]-k[i][0])));};
 return [0,15,30,45,60,75,90].map(d=>{const t=d*Math.PI/180,x=xc-Rc*Math.cos(t);return [x,yc+Rc*Math.sin(t),zAt(x)];});
};
const frontWindow=[[-.62,.945],[-.05,1.300],[.30,1.331],[.30,.968]];
const rearWindow=[[.405,.971],[.405,1.335],[.92,1.297],[.92,.987]];
const quarter=[[.985,.989],[.985,1.272],[1.20,1.165],[1.34,.997]];
export const c63Body={
 // The sill and the front apron reach down to 0.18 m, about 145 mm off the
 // ground; behind the rear wheels the bumper ends higher. The arches sit close
 // round the tyres.
 wb:2.76,arch:.368,axleZ:.367,base:.18,rearBase:.225,lowerHem:x=>x>1.74?.225:.18,hoodEnd:-.83,deckStart:1.64,
 door:[-.76,.345,1.17],doorSill:.29,belt:.945,roofZ:1.405,roofWidth:.60,cabinWidth:.795,roofCrown:.036,screenSweep:.015,sideRound:.026,sailTints:[1.05,1.01,.97,.93,.90,.87],roofPinch:.02,
 // The bonnet's leading edge dips over the grille and rises toward the lamps;
 // just behind it the centre stands well above the fender edges, and it
 // settles again toward the cowl.
 hoodFrac:.86,hoodCrown:.032,hoodLanes:[0,.3,.55,.8,1],hoodLaneTint:lo=>-.05*lo,
 hoodCrownAt:x=>-.020+.078*clamp((x-FX(-2.17))/.36)**.9-.026*clamp((x+1.35)/.52)**1.4,customEnds:true,capFollowsSide:true,
 cabin:{cargo:[1.66,.40,.36],sillEnd:1.02,rearSeat:[1.18,1.49,.385,.515,1.40,1.49]},
 sideSection:(w,l,x)=>{const top=section(x)[1];return w+sideAtZ(B.base+l*(top-B.base),top);},
 sideLevels:[0,.06,.12,.182,.261,.384,.525,.666,.771,.824,.850,.894,.947,1],
 sideTints:[.80,.94,.78,.88,.95,1.00,1.03,1.00,.95,.88,1.13,1.04,.97],
 windowGlass:{front:['#34424a',.58],privacy:['#29343a',.66]},windshieldGlass:['#455760',.46],
 backGlassColor:'#2e3a40',moonroofGlass:['#1c2326',.88],moonroofFrame:BLACK,
 mirrorX:-.50,mirrorOut:.03,mirrorLift:.052,
 // Black B-pillar and the thin pillar ahead of the fixed rear quarter glass.
 blackouts:[[[.30,.968],[.405,.971],[.405,1.335],[.30,1.331]],[[.92,.987],[.985,.989],[.985,1.272],[.92,1.297]]],
 // Fender top from the lamp to the A-pillar base, then the belt and the boot.
 stations:[...noseArc(),[-1.72,.895,.802],[-1.38,.906,.865],[-1.08,.896,.910],[-.83,.888,.935],
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
function sideY(x,z){
 const [w,top]=section(x),level=clamp((z-B.base)/(top-B.base)),L=B.sideLevels;
 let i=1;while(i<L.length-1&&level>L[i])i++;
 const at=l=>w+sideAtZ(B.base+l*(top-B.base),top);
 return mix(at(L[i-1]),at(L[i]),(level-L[i-1])/(L[i]-L[i-1]));
}
// Bonnet surface height, lane by lane like the shared bonnet panel.
function hoodZ(x,y){
 const [w,h]=section(x),half=w*B.hoodFrac-.008,t=Math.min(1,Math.abs(y)/half),L=B.hoodLanes,zl=t=>h+.016+B.hoodCrownAt(x)*(1-t*t);
 let i=1;while(i<L.length-1&&t>L[i])i++;
 return mix(zl(L[i-1]),zl(L[i]),(t-L[i-1])/(L[i]-L[i-1]));
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
 const hoodHalf=w0*B.hoodFrac-.008;
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
 // One surface for the whole front: across the face, round the corner arc and
 // back along the fender. Features are laid out by s, the distance along the
 // skin from the centre line, so the lamps and intakes run round the corners
 // in one piece.
 const skin=(sa,z)=>{
  const e=base.edge(z);
  if(sa<=e)return base.on(sa,z,0);
  let x=base.x0,y=e,rem=sa-e;
  for(let k=0;k<400;k++){const dx=x<-1.93?.003:.012,x1=x+dx,y1=sideY(x1,z),d=Math.hypot(dx,y1-y);if(d>=rem){const t=rem/d;return [x+dx*t,mix(y,y1,t),z];}rem-=d;x=x1;y=y1;}
  return [x,y,z];
 };
 const on=(sv,z,lift=.006)=>{
  const sg=sv<0?-1:1,sa=Math.abs(sv),p=skin(sa,z);
  if(!lift)return [p[0],sg*p[1],p[2]];
  const a=skin(sa-.012,z),b=skin(sa+.012,z),tx=b[0]-a[0],ty=b[1]-a[1],n=Math.hypot(tx,ty)||1;
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
 const gTop=sym([[0,.768],[.15,.765],[.30,.759],[.40,.753],[.435,.748],[.447,.740],[.452,.725]]);
 const gLow=sym([[0,.533],[.10,.540],[.22,.550],[.34,.561],[.385,.568],[.41,.582],[.43,.62],[.445,.69],[.452,.725]]);
 const oTop=inset(gTop,.975,.92,.652),oLow=inset(gLow,.975,.92,.652);
 band(gLow,gTop,GLOSS,.010,{mirror:false,step:.02});
 band(oLow,oTop,MESH,.012,{mirror:false,step:.02});
 r.tag('body.structure',()=>{
  // Fine diamond mesh.
  for(const dir of [-1,1])for(let k=-22;k<=22;k++){
   const n=8;for(let i=0;i<n;i++){
    const za=mix(.54,.762,i/n),zb=mix(.54,.762,(i+1)/n),ya=k*.021+dir*(za-.65)*.9,yb=k*.021+dir*(zb-.65)*.9;
    const ok=(y,z)=>Math.abs(y)<.438&&z<edgeAt(oTop,y)-.003&&z>edgeAt(oLow,y)+.003;
    if(!ok(ya,za)||!ok(yb,zb))continue;
    r.polygon([s.on(ya-.0016,za,.0135),s.on(ya+.0016,za,.0135),s.on(yb+.0016,zb,.0135),s.on(yb-.0016,zb,.0135)],'#1f2528',false);
   }
  }
 });
 // The chrome bar, with a darker lower edge, from the star ring to the frame.
 const starZ=.648,starR=.091;
 band([[.094,starZ+.002],[.436,starZ]],[[.094,starZ+.010],[.436,starZ+.008]],CHROME,.016,{step:.04});
 band([[.094,starZ-.003],[.436,starZ-.005]],[[.094,starZ+.002],[.436,starZ]],'#7d878b',.016,{step:.04});
 // The star: a chrome ring and a faceted three-pointed star, laid on the
 // raked face so no part sinks behind the mesh. The mesh shows through.
 r.tag('body.structure',()=>{
  const n=40,P=(a,rad,l)=>s.on(Math.cos(a)*rad,starZ+Math.sin(a)*rad,l);
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

 // Headlamps (facelift W204), laid out along the skin. The inner end stands
 // beside the grille; the top edge rises outward under the bonnet line to its
 // highest point over the main beam, which sits where the face turns the
 // corner; from there the lamp sweeps back along the fender to a point.
 // Inside: a black housing, a chrome cell for the inner lamp, the round main
 // beam in a chrome bowl, the LED strip under the inner cell and a chrome
 // line along the lower edge.
 const lampTop=[[.463,.690],[.52,.712],[.61,.742],[.68,.765],[.72,.774],[.80,.776],[.90,.777],[.98,.781],[1.08,.789],[1.19,.796]];
 const lampLow=[[.463,.640],[.472,.566],[.61,.576],[.75,.588],[.90,.594],[.98,.606],[1.06,.645],[1.13,.710],[1.19,.790]];
 const taper=(pts,d)=>pts.map(([y,z])=>[y,z+d*clamp((1.17-y)/.12)]);
 band(lampLow,lampTop,'#15191b',.008,{...lamp,step:.02});
 band(taper(lampLow,.012),taper(lampTop,-.020),'#2c3438',.010,{...lamp,from:.482,to:1.16,step:.02});
 // Two round lamps in chrome bowls: the main beam where the face turns the
 // corner, and a smaller one inboard. Drawn as rings so they keep their shape
 // on the curved skin.
 const bowl=(y,z,rad,rings,lift)=>r.tag('lighting.headlamp',()=>{const n=30,P=(a,k)=>s.on(y+Math.cos(a)*rad*k,z+Math.sin(a)*rad*k,lift);
  for(let j=0;j<rings.length;j++){const [k1,color]=rings[j],k0=rings[j+1]?.[0]??0;
   for(let i=0;i<n;i++){const a=i/n*2*Math.PI,b=(i+1)/n*2*Math.PI,q=k0?[P(a,k0),P(b,k0),P(b,k1),P(a,k1)]:[P(a,0),P(a,k1),P(b,k1)];r.polygon(y<0?q.reverse():q,color,false);}}});
 for(const sg of [-1,1]){
  bowl(sg*.722,.683,.066,[[1,'#59636a'],[.88,'#a3adb1'],[.66,'#c9d0d2'],[.40,'#66717a'],[.26,r.lights?'#eef2ec':'#9aa5aa']],.016);
  bowl(sg*.560,.642,.040,[[1,'#4f595f'],[.84,'#8f999e'],[.60,'#b4bdc0'],[.34,'#5d686f'],[.20,r.lights?'#e2e8e4':'#8d989d']],.016);
 }
 // Chrome line along the lower edge, from the main beam to the tail.
 band(taper(lampLow,.016),taper(lampLow,.022),'#9aa4a9',.012,{...lamp,from:.80,to:1.15,step:.02});
 // LED strip under the inner cell.
 band(shift(lampLow,.005),shift(lampLow,.014),r.lights?'#f6faf7':'#dfe7e8',.013,{...lamp,from:.49,to:.66,step:.02});
 band(lampLow,lampTop,null,.019,{...lamp,glass:true,step:.02});

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
 // Headlamp washer covers and the tow-eye cover: panel lines in the paint.
 band([[.60,.512],[.71,.520]],[[.595,.566],[.715,.572]],tone(paint,.90),.0045,{step:.03});
 band([[.602,.516],[.708,.524]],[[.598,.562],[.712,.568]],tone(paint,1.0),.005,{step:.03});
 band([[.415,.402],[.478,.402]],[[.415,.452],[.478,.452]],tone(paint,.90),.0045,{mirror:false,step:.03});
 band([[.419,.406],[.474,.406]],[[.419,.448],[.474,.448]],tone(paint,.98),.005,{mirror:false,step:.03});
 // Parking sensors across the band under the grille.
 for(const y of [.25,.667])for(const sg of [-1,1])ringOn(r,s,'body.structure',sg*y,.446,.011,.011,tone(paint,.78),.007,10);
 // Amber side markers on the fenders, under the lamp tails.
 band([[1.065,.552],[1.16,.566]],[[1.065,.606],[1.16,.628]],'#c27a34',.006,{tag:'lighting.indicator',step:.02});
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
  const rise=x=>.016*clamp((x-FX(-2.02))/.30)*clamp((-.90-x)/.30);
  for(const s of [-1,1])for(let i=1;i<xs.length;i++)for(let j=0;j<6;j++){
   const u=-1+j/3,v=u+1/3,p=(x,uu)=>{const y=s*(.305+.080*uu);return [x,y,hood(x,y)+.0015+rise(x)*(1-uu*uu)];};
   r.polygon([p(xs[i-1],u),p(xs[i],u),p(xs[i],v),p(xs[i-1],v)],tone(paint,(s<0?1.09:1.15)-.03*u*s),false);
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
  for(const [ax,out,wide] of [[-B.wb/2,.024,.070],[B.wb/2,.012,.050]])for(const side of [-1,1]){
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
