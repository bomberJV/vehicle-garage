// 2012-2014 Mercedes-Benz C63 AMG sedan (W204 facelift) outer body.
// The side elevation is read off a studio photograph registered at both wheel
// centres (2765 mm wheelbase); heights are taken at the wheel plane. Features on
// the centre plane (nose, tail, roof crown) sit farther from the camera, so the
// ends are set from Mercedes' 4707 mm length instead. Front and rear details are
// measured from straight-on photographs of the same car: the front on a grid
// scaled to the nose, the rear scaled by its 12-inch licence plate.
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
// Daylight openings, (x,z) from the side photograph.
// C63 overhangs: about 0.89 m ahead of the front axle (the AMG nose is longer than
// the standard W204's 0.775 m) and 1.055 m behind the rear axle (shared with the W204).
// FX and RX map the original nose and tail layout onto those overhangs.
const FX=x=>x<-1.8?-1.8+(x+1.8)*.81:x,RX=x=>x>1.64?1.64+(x-1.64)*1.167:x;
const frontWindow=[[-.62,.945],[-.05,1.300],[.30,1.331],[.30,.968]];
const rearWindow=[[.405,.971],[.405,1.335],[.92,1.297],[.92,.987]];
const quarter=[[.985,.989],[.985,1.272],[1.20,1.165],[1.34,.997]];
export const c63Body={
 wb:2.76,arch:.385,axleZ:.367,base:.27,hoodEnd:-.83,deckStart:1.64,
 door:[-.76,.345,1.17],doorSill:.335,belt:.945,roofZ:1.405,roofWidth:.60,cabinWidth:.795,roofCrown:.036,screenSweep:.015,sideRound:.014,roofPinch:.02,
 hoodFrac:.77,hoodCrown:.032,customEnds:true,capFollowsSide:true,
 cabin:{cargo:[1.66,.40,.36],sillEnd:1.02,rearSeat:[1.18,1.49,.385,.515,1.40,1.49]},
 sideSection:(w,l)=>w+c63Side(l),
 sideLevels:[0,.07,.16,.30,.46,.62,.74,.80,.83,.88,.94,1],
 sideTints:[.78,.88,.95,1.00,1.03,1.00,.95,.88,1.13,1.04,.97],
 windowGlass:{front:['#34424a',.58],privacy:['#29343a',.66]},windshieldGlass:['#455760',.46],
 backGlassColor:'#2e3a40',moonroofGlass:['#1c2326',.88],moonroofFrame:BLACK,
 mirrorX:-.50,mirrorOut:.03,mirrorLift:.052,
 // Black B-pillar and the thin pillar ahead of the fixed rear quarter glass.
 blackouts:[[[.30,.968],[.405,.971],[.405,1.335],[.30,1.331]],[[.92,.987],[.985,.989],[.985,1.272],[.92,1.297]]],
 // Fender top from the lamp to the A-pillar base, then the belt and the boot.
 stations:[[FX(-2.17),.775,.752],[FX(-2.06),.845,.785],[FX(-1.92),.88,.815],[-1.72,.895,.852],[-1.38,.906,.880],[-1.08,.896,.902],[-.83,.888,.912],
  [-.50,.885,.945],[.30,.887,.968],[1.00,.893,.990],[1.38,.902,1.000],[1.64,.892,.995],[RX(1.90),.878,.955],[RX(2.10),.852,.925],[RX(2.22),.80,.905]],
 wind:[[-.78,.955],[.0,1.336]],
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
 const at=l=>w+c63Side(l);
 return mix(at(L[i-1]),at(L[i]),(level-L[i-1])/(L[i]-L[i-1]));
}
function poly(r,id,pts,c){r.tag(id,()=>r.polygon(pts,c,false));}

// An end of the car: a surface that bulges from the end station to the bumper.
// u runs across the car (-1..1), v from the lower edge to the top edge.
function endSurface(end){
 const front=end<0,x0=front?B.stations[0][0]:B.stations.at(-1)[0],[w0,top0]=section(x0);
 const F=front?.17/.19:1;
 const dir=front?-1:1;
 // Front: the bumper stands upright under the grille and rolls back into the
 // bonnet edge above the lamps. Rear: the bumper stands proud under the lid.
 const bulge=front?v=>F*.19*(v<.30?.78+.22*Math.sin(Math.PI/2*v/.30):1)*(v>.70?1-((v-.70)/.30)**2:1)
  :v=>.118*(v<.62?1:1-.55*((v-.62)/.38)**1.4);
 const pw=front?3.2:3.4,plan=u=>1-Math.abs(u)**pw,dplan=u=>-pw*Math.sign(u)*Math.abs(u)**(pw-1);
 // Lift a point off the surface along its plan normal, so lamps and trim stay
 // proud of the bumper where it wraps round the corners.
 const lifted=(u,v,yEdge,x,y,z,lift)=>{const nx=dir,ny=-bulge(v)*dplan(u)/yEdge,n=Math.hypot(nx,ny);return [x+nx*lift/n,y+ny*lift/n,z];};
 const hoodHalf=w0*B.hoodFrac-.008;
 const zTop=y=>{
  if(!front)return top0;
  const t=Math.abs(y)/hoodHalf;
  if(t>=1){const edge=sideY(x0,top0);return top0+.0152*clamp((edge-Math.abs(y))/(edge-hoodHalf));}
  // Lanes [0,.55,1] of the shared bonnet, a hair under its edge.
  const hz=t=>top0+.016+B.hoodCrown*(1-t*t);
  return (t<.55?mix(hz(0),hz(.55),t/.55):mix(hz(.55),hz(1),(t-.55)/.45))-.0008;
 };
 const at=(u,v,lift=0)=>{
  let y=u*sideY(x0,B.base+.01),z=B.base;
  for(let k=0;k<4;k++){z=mix(B.base,zTop(y),v);y=u*sideY(x0,Math.min(z,top0));}
  return lift?lifted(u,v,sideY(x0,Math.min(z,top0)),x0+dir*bulge(v)*plan(u),y,z,lift):[x0+dir*bulge(v)*plan(u),y,z];
 };
 const on=(y,z,lift=.006)=>{
  const yEdge=sideY(x0,Math.min(z,top0)),u=Math.max(-1,Math.min(1,y/yEdge));
  const zt=zTop(Math.abs(u*yEdge)),v=clamp((z-B.base)/(zt-B.base));
  return lifted(u,v,yEdge,x0+dir*bulge(v)*plan(u),u*yEdge,mix(B.base,zt,v),lift);
 };
 const vAt=(z,y=0)=>clamp((z-B.base)/(zTop(Math.abs(y))-B.base));
 return {at,on,x0,dir,top0,w0,vAt,edge:z=>sideY(x0,Math.min(z,top0))};
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
  for(const sgn of mirror?[-1,1]:[1])for(let i=0;i<n;i++){
   const ya=mix(y0,y1,i/n),yb=mix(y0,y1,(i+1)/n),q=(y,z)=>s.on(sgn*y,z,lift);
   const la=edgeAt(lower,ya),lb=edgeAt(lower,yb),ua=edgeAt(upper,ya),ub=edgeAt(upper,yb);
   // Split tall strips in height too, so they follow the bumper's curve instead of cutting into it.
   const m=Math.max(1,Math.ceil(Math.max(ua-la,ub-lb)/.024));
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

// Front: facelift AMG grille with the large star and a twin louvre, the swept
// headlamps with their LED strip, and the AMG apron with a wide central intake
// and two outer intakes carrying the daytime running lamps.
function frontEnd(r,paint){
 const base=endSurface(-1),Z=z=>.25+(z-.25)*.897,s={...base,on:(y,z,l)=>base.on(y,Z(z),l)},band=bander(r,s);
 const cols=symCols([.05,.14,.24,.34,.44,.52,.60,.68,.75,.81,.86,.90,.935,.96,.98,.993,1]);
 const vs=[.27,.30,.33,.36,.40,.44,.48,.52,.56,.60,.64,.68,.72,.76,.80].map(z=>s.vAt(Z(z))).concat([.92,.96,.985,1]).sort((a,b)=>a-b).filter((v,i,a)=>i===a.length-1||a[i+1]-v>.01);
 drawEnd(r,base,'body.structure',(z,y,u)=>tone(paint,mix(.90+.14*clamp((z-.40)/.45),.86,Math.abs(u)**5)),vs,cols);
 const lamp={tag:'lighting.headlamp'};

 // Grille: gloss-black frame around a black mesh, trapezoidal with a shallow V
 // at the bottom. One twin chrome louvre runs across into the star.
 const gTop=sym([[.30,.842],[.40,.838],[.432,.820],[.446,.785]]),gLow=sym([[0,.646],[.22,.655],[.36,.668],[.42,.686],[.442,.720],[.446,.785]]);
 const oTop=sym([[.30,.826],[.39,.822],[.418,.805],[.428,.785]]),oLow=sym([[0,.664],[.22,.672],[.35,.684],[.405,.700],[.424,.728],[.428,.785]]);
 band(gLow,gTop,GLOSS,.010,{mirror:false,step:.02});
 band(oLow,oTop,MESH,.012,{mirror:false,step:.02});
 r.tag('body.structure',()=>{
  // Diamond mesh behind the louvre.
  for(const dir of [-1,1])for(let k=-14;k<=14;k++){
   const n=5;for(let i=0;i<n;i++){
    const za=mix(.668,.826,i/n),zb=mix(.668,.826,(i+1)/n),ya=k*.032+dir*(za-.745)*.9,yb=k*.032+dir*(zb-.745)*.9;
    const ok=(y,z)=>Math.abs(y)<.42&&z<edgeAt(oTop,y)-.003&&z>edgeAt(oLow,y)+.003;
    if(!ok(ya,za)||!ok(yb,zb))continue;
    r.polygon([s.on(ya-.0025,za,.0135),s.on(ya+.0025,za,.0135),s.on(yb+.0025,zb,.0135),s.on(yb-.0025,zb,.0135)],'#2b3236',false);
   }
  }
 });
 for(const [z0,z1] of [[.748,.758],[.731,.740]])band([[.09,z0],[.425,z0-.002]],[[.09,z1],[.425,z1-.002]],CHROME,.016,{step:.04});
 r.tag('body.structure',()=>{const c=s.on(0,.744,.032);starBadge(r,c,.088,'x',-1);});
 // Bonnet shut line along the top of the grille and the lamps.
 band([[0,.858],[.44,.856],[.50,.850],[.62,.852],[.74,.856]],[[0,.862],[.44,.860],[.50,.854],[.62,.856],[.74,.860]],'#22272a',.011,{step:.04});

 // Headlamps: black housing, swept up toward the outer corner. Two projectors,
 // a chrome bezel and the LED strip along the lower edge.
 const lampLow=[[.462,.712],[.49,.668],[.60,.656],[.70,.664],[.78,.690],[.815,.716]];
 const lampTop=[[.462,.712],[.50,.800],[.56,.836],[.66,.848],[.75,.852],[.80,.842],[.815,.826]];
 band(lampLow,lampTop,'#1a1f22',.008,{...lamp,step:.02});
 band(shift(lampLow,.012),shift(lampTop,-.010),'#7e898f',.010,{...lamp,from:.50,to:.80,step:.02});
 band(shift(lampLow,.018),shift(lampTop,-.016),'#3b454b',.011,{...lamp,from:.51,to:.795,step:.02});
 for(const [y0,z,rad] of [[.560,.735,.038],[.680,.758,.052]])for(const y of [-y0,y0]){
  ringOn(r,s,'lighting.headlamp',y,z,rad,rad,'#a8b3b8',.012);
  ringOn(r,s,'lighting.headlamp',y,z,rad*.80,rad*.80,'#2a3439',.0125);
  ringOn(r,s,'lighting.headlamp',y,z,rad*.48,rad*.48,r.lights?'#eef3ee':'#8d9ca2',.013);
 }
 band(shift(lampLow,.004),shift(lampLow,.013),r.lights?'#f6faf7':'#dfe7e8',.013,{...lamp,from:.51,to:.80,step:.02});
 band(lampLow,lampTop,null,.017,{...lamp,glass:true,step:.02});

 // Apron. Central intake: a wide trapezoid with honeycomb mesh, over the black
 // splitter lip. Outer intakes: under the lamps, with a fin across and the
 // daytime running lamp strip along the top.
 const iTop=sym([[0,.476],[.30,.476],[.425,.468],[.512,.300]]),iLow=sym([[0,.288],[.40,.290],[.512,.300]]);
 band(iLow,iTop,'#0a0c0d',.008,{mirror:false,step:.02});
 r.tag('body.structure',()=>{
  for(let j=0;j<6;j++)for(let i=-15;i<=15;i++){
   const y=i*.034+(j%2?.017:0),z=.302+j*.029,half=.512-(z-.30)*.518;if(Math.abs(y)>half-.02||z>.462)continue;
   const c=[[y-.014,z],[y,z-.012],[y+.014,z],[y,z+.012]];r.polygon(c.map(([yy,zz])=>s.on(yy,zz,.010)),'#252c30',false);
  }
 });
 const oiLow=[[.505,.43],[.535,.322],[.70,.318],[.825,.340]],oiTop=[[.505,.43],[.52,.482],[.70,.488],[.825,.492]];
 band(oiLow,oiTop,'#0a0c0d',.008,{step:.012});
 band([[.53,.396],[.82,.404]],[[.53,.410],[.82,.418]],'#2b3134',.011,{step:.02});
 band([[.575,.460],[.79,.464]],[[.575,.472],[.79,.476]],r.lights?'#f6faf7':'#cfd8da',.012,{...lamp,step:.02});
 // Black splitter lip under the whole apron.
 band([[-.62,.272],[.62,.272]],[[-.62,.292],[.62,.292]],BLACK,.012,{mirror:false,step:.03});
 r.tag('body.structure',()=>{
  const p=(y,z,dx)=>{const q=s.on(y,z,.004);return [q[0]+dx,q[1],q[2]];};
  r.polygon([p(-.60,.27,0),p(.60,.27,0),p(.60,.25,.012),p(-.60,.25,.012)],BLACK,false);
 });
 // Parking sensors and the amber marker on each bumper corner.
 for(const y of [.22,.62])for(const sg of [-1,1])ringOn(r,s,'body.structure',sg*y,.556,.011,.011,tone(paint,.80),.009,10);
 // Lifted along the plan normal of the body side, which faces mostly forward at the nose.
 const sideAt=(x,z,lift,side)=>{const y=sideY(x,z),k=(sideY(x+.004,z)-sideY(x-.004,z))/.008,n=Math.hypot(k,1);return [x-k*lift/n,side*(y+lift/n),z];};
 r.tag('lighting.indicator',()=>{for(const side of [-1,1]){
  const p=(x,z)=>sideAt(x,z,.006,side);
  const q=[p(FX(-2.13),Z(.632)),p(FX(-2.04),Z(.640)),p(FX(-2.04),Z(.668)),p(FX(-2.13),Z(.662))];r.polygon(side<0?q:q.reverse(),'#c27a34',false);
 }});
 // The lamp's swept tail runs back along the fender to a point.
 r.tag('lighting.headlamp',()=>{for(const side of [-1,1]){
  const tip=-1.80,xs=[s.x0,-2.07,-2.04,-2.00,-1.96,-1.92,-1.88,-1.84,tip];
  const e=s.edge(.74),t=x=>clamp((x-s.x0)/(tip-s.x0));
  const lo=x=>mix(Z(edgeAt(lampLow,e)),.795,t(x)**1.15),hi=x=>mix(Z(edgeAt(lampTop,e)),.812,Math.sqrt(t(x)));
  for(let i=1;i<xs.length;i++){
   const p=(x,z,dy)=>sideAt(x,z,dy,side);
   // Same layers as the front of the lamp: housing, grey reflector, LED strip along the bottom.
   const layer=(l0,l1,dy,color)=>{const a=xs[i-1],b=xs[i];if(l1(a)-l0(a)<.002&&l1(b)-l0(b)<.002)return;
    const q=[p(a,l0(a),dy),p(b,l0(b),dy),p(b,Math.max(l0(b)+.0005,l1(b)),dy),p(a,Math.max(l0(a)+.0005,l1(a)),dy)];r.polygon(side<0?q:q.reverse(),color,false);};
   layer(lo,hi,.006,'#1a1f22');
   layer(x=>lo(x)+.012*(1-t(x)),x=>hi(x)-.010*(1-t(x)),.008,'#55616a');
   layer(x=>lo(x)+.003*(1-t(x)),x=>lo(x)+.010*(1-t(x)),.009,r.lights?'#f6faf7':'#dfe7e8');
  }
 }});
}

// Boot lid face between the tail lamps: its outline across the back, (half-width, z).
const lidEdge=[[.470,.705],[.520,.740],[.585,.878],[.640,.906]];
const lidHalf=z=>z<.705?0:edgeAt(lidEdge.map(([y,z])=>[z,y]),z);
function rearEnd(r,paint){
 const s=endSurface(1),band=bander(r,s);
 const cols=symCols([.05,.14,.24,.34,.44,.52,.58,.64,.70,.76,.81,.86,.90,.935,.96,.98,.993,1]);
 const vs=[.27,.30,.34,.38,.42,.455,.49,.53,.57,.61,.65,.69,.705,.74,.78,.82,.86,.89].map(z=>s.vAt(z)).concat([1]).sort((a,b)=>a-b).filter((v,i,a)=>i===a.length-1||a[i+1]-v>.01);
 const paintAt=z=>tone(paint,.82+.20*clamp((z-.45)/.5));
 const inLid=(z,y)=>z>.705&&y<lidHalf(z)-.002;
 drawEnd(r,s,'body.structure',(z,y)=>{
  if(inLid(z,y))return null;
  if(z<.30)return BLACK;
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

// The AMG power domes: two raised ridges along the bonnet.
function powerDomes(r,paint){
 panel(r,'bonnet',[0,0,.71],'body.hood',()=>{
  const xs=[FX(-2.02),FX(-1.90),-1.70,-1.45,-1.20,-1.02,-.90];
  const hood=(x,y)=>{const [w,z]=section(x),half=w*B.hoodFrac-.008,t=Math.min(1,Math.abs(y)/half);return z+.016+B.hoodCrown*(1-t*t);};
  const rise=x=>.022*clamp((x-FX(-2.02))/.18)*clamp((-.90-x)/.22);
  for(const s of [-1,1])for(let i=1;i<xs.length;i++)for(let j=0;j<6;j++){
   const u=-1+j/3,v=u+1/3,p=(x,uu)=>{const y=s*(.305+.080*uu);return [x,y,hood(x,y)+.0015+rise(x)*(1-uu*uu)];};
   r.polygon([p(xs[i-1],u),p(xs[i],u),p(xs[i],v),p(xs[i-1],v)],tone(paint,1.17-.07*u*s),false);
  }
 });
}

function archLiners(r){
 r.tag('body.structure',()=>{
  for(const ax of [-B.wb/2,B.wb/2])for(const side of [-1,1]){
   const n=24,wall=ax<0?.685:.66,R=B.arch-.004,r0=.36;
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
 powerDomes(r,paint);
 frontEnd(r,paint);
 rearEnd(r,paint);
 quarterLamps(r);
 archLiners(r);
 sideDetail(r,paint);
}
