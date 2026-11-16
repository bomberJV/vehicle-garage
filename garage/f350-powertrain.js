// 1993 F-350 regular cab, long box, 2WD, single rear wheels: E4OD automatic,
// propeller shaft and second-generation Sterling 10.25 full-floating rear axle.
// Positions follow the truck's shared vehicle coordinates (metres, x rearward,
// y to the right, z up). Diameters, lengths and offsets are estimated layout
// values chosen to sit inside the existing frame and cab; they are not measured.
import {cyl,sleeve,turn,steel,metal,dark,gold,x,y} from './mechanism-shapes.js';

const unitVector=v=>{const l=Math.hypot(...v);return v.map(q=>q/l);};
// Crankshaft datum of the installed 7.5-litre V8. Its rear flange is the
// bellhousing face; the toe board of the cab floor starts just behind it.
export const F350_ENGINE=Object.freeze({center:-1.55,base:.62,length:.68});
export const F350_FLANGE=F350_ENGINE.center+F350_ENGINE.length/2;
// Rear-axle centre: the wheel centre used by the exterior wheels.
export const F350_AXLE=Object.freeze({x:1.6891,z:.445,tube:.0445,spindleEnd:.80});
export const F350_FRONT_AXLE=-1.6891;
const axis=F350_ENGINE.base;
// E4OD outline as [distance behind the flange, radius]. The bellhousing, main
// case and extension are distinct; the station lengths are estimates.
const E4OD_PROFILE=[[.02,.06],[.02,.19],[.05,.19],[.17,.155],[.21,.148],[.50,.140],[.535,.10],[.56,.068],[.74,.058],[.78,.045],[.78,0]];
export const E4OD_LENGTH=.78;
const tail=[F350_FLANGE+E4OD_LENGTH,0,axis];
const pinion=[F350_AXLE.x-.255,0,F350_AXLE.z];
export function drawE4OD(r){
 const c=[F350_FLANGE,0,axis];
 turn(r,c,x,E4OD_PROFILE,'#7d8a8e',{n:24});
 // Bellhousing bolt flange, main-case ribs and the bolted transmission pan.
 sleeve(r,c,x,.02,.032,.198,.15,metal,24);
 for(const s of [.26,.33,.40,.47])sleeve(r,c,x,s,s+.012,.149,.13,dark,20);
 r.box(F350_FLANGE+.23,-.12,axis-.205,F350_FLANGE+.49,.12,axis-.132,'#5b676b');
 for(const yy of [-.08,0,.08])r.box(F350_FLANGE+.24,yy-.006,axis-.212,F350_FLANGE+.48,yy+.006,axis-.205,dark);
 // Electrical connector on the left of the case, for the electronic shift control.
 r.box(F350_FLANGE+.30,-.165,axis-.03,F350_FLANGE+.36,-.135,axis+.02,'#2c3439');
}
export function drawE4ODConverter(r){
 const c=[F350_FLANGE,0,axis];
 turn(r,c,x,[[.035,.03],[.042,.15],[.065,.155],[.095,.15],[.105,.06],[.105,.03]],gold,{n:24});
}
export function drawF350Propshaft(r){
 const dir=unitVector(pinion.map((v,i)=>v-tail[i]));
 const start=tail.map((v,i)=>v+dir[i]*.05),end=pinion.map((v,i)=>v-dir[i]*.05);
 r.rod(start,end,.047,steel,16);
 // Slip yoke at the transmission and a universal joint at each end.
 for(const [p,d] of [[tail,1],[pinion,-1]]){
  cyl(r,p,dir,d>0?.004:-.05,d>0?.05:-.004,.035,metal,14);
  const joint=p.map((v,i)=>v+dir[i]*d*.05);
  cyl(r,joint,[0,1,0],-.045,.045,.013,gold,10);
  cyl(r,joint,[0,dir[2],-dir[0]],-.045,.045,.013,gold,10);
 }
}
// Second-generation Sterling 10.25 centre section. The pinion enters from
// the front; the bolted cover faces rearward.
export function drawSterlingCarrier(r){
 const c=[F350_AXLE.x,0,F350_AXLE.z];
 turn(r,c,x,[[-.255,0],[-.255,.052],[-.232,.052],[-.226,.062],[-.12,.074],[-.085,.118],[-.02,.150],[.06,.150],[.09,.136],[.098,.122],[.112,.122],[.112,0]],'#6f7c80',{n:28});
 for(let i=0;i<10;i++){const a=i*2*Math.PI/10;cyl(r,[c[0]+.112,c[1]+.105*Math.cos(a),c[2]+.105*Math.sin(a)],x,0,.010,.008,metal,8);}
 // Fill plug on the cover and the vent above the housing.
 cyl(r,[c[0]+.112,.06,c[2]-.04],x,0,.012,.014,dark,10);
}
const sides=[-1,1];
export function drawSterlingHousing(r){
 const {x:X,z:Z,tube,spindleEnd}=F350_AXLE;
 for(const s of sides){
  const c=[X,0,Z];
  sleeve(r,c,y,s*.12,s*.58,tube,.030,'#6a777b',20);
  // Backing-plate flange and the stationary spindle carrying the hub bearings.
  sleeve(r,c,y,s*.58,s*.595,.095,.030,metal,22);
  sleeve(r,c,y,s*.595,s*spindleEnd,.036,.024,steel,18);
  // Leaf-spring seat beneath each tube, below the frame rail.
  r.box(X-.03,s*.48-.040,Z-tube-.010,X+.03,s*.48+.040,Z-tube+.012,'#5f6a6e');
 }
}
export function drawSterlingShafts(r){
 const {x:X,z:Z}=F350_AXLE;
 for(const s of sides){
  cyl(r,[X,0,Z],y,s*.10,s*.805,.018,metal,14);
  // The flange bolts to the outer face of the hub, outside the bearings.
  sleeve(r,[X,0,Z],y,s*.805,s*.818,.068,.019,steel,22);
  for(let i=0;i<8;i++){const a=i*2*Math.PI/8;cyl(r,[X+.052*Math.cos(a),0,Z+.052*Math.sin(a)],y,s*.818,s*.826,.006,dark,8);}
 }
}
export function drawFullFloatingHubs(r){
 const {x:X,z:Z}=F350_AXLE;
 for(const s of sides){
  const c=[X,0,Z];
  sleeve(r,c,y,s*.615,s*.79,.070,.047,'#7c8a8d',24);
  sleeve(r,c,y,s*.79,s*.805,.125,.047,steel,28);
  // Inner and outer wheel bearings ride on the spindle inside the hub.
  for(const [a,b] of [[.625,.655],[.755,.785]])sleeve(r,c,y,s*a,s*b,.0455,.0365,gold,18);
 }
}
// Front Twin I-Beam: each beam carries one wheel and pivots from a bracket under
// the opposite frame rail. The beams overlap and are offset fore and aft. Spring
// and radius-arm details are not drawn; beam section and pivot positions are estimated.
const beamPath=s=>[[-s*.46,.27],[s*.60,.27],[s*.74,.38],[s*.78,.405]];
function iSection(r,xc,a,b,color){
 const d=[b[0]-a[0],b[1]-a[1]],len=Math.hypot(...d),n=[-d[1]/len,d[0]/len];
 const prism=(w,h0,h1)=>{
  const at=(p,ww,hh)=>[xc+ww,p[0]+n[0]*hh,p[1]+n[1]*hh];
  const A=[at(a,-w,h0),at(a,w,h0),at(a,w,h1),at(a,-w,h1)],B=[at(b,-w,h0),at(b,w,h0),at(b,w,h1),at(b,-w,h1)];
  for(let i=0;i<4;i++){const j=(i+1)%4;r.polygon([A[i],A[j],B[j],B[i]],color,false);}
  r.polygon(A,color,false);r.polygon(B,color,false);
 };
 prism(.026,.023,.035);prism(.026,-.035,-.023);prism(.008,-.023,.023);
}
export function drawTwinIBeams(r){
 const X=F350_FRONT_AXLE;
 for(const s of sides){
  const xc=X+s*.045,path=beamPath(s);
  for(let i=1;i<path.length;i++)iSection(r,xc,path[i-1],path[i],'#59656a');
  // Pivot bracket hanging from the opposite rail, with its bushing.
  r.box(xc-.04,-s*.48-.04,.24,xc+.04,-s*.48+.04,.345,'#4b565b');
  cyl(r,[xc,-s*.46,.27],x,-.045,.045,.03,dark,14);
  // Kingpin boss and spindle at the wheel end.
  cyl(r,[X,s*.78,.445],[0,0,1],-.085,.085,.03,'#6c787d',14);
  cyl(r,[X,s*.78,.445],y,s>0?0:-.08,s>0?.08:0,.025,steel,14);
 }
}
export function drawTwinIBeamLinkage(r){
 const X=F350_FRONT_AXLE-.12;
 // The tie rod runs below the frame rails; the arms rise to the knuckles.
 r.rod([X,-.70,.32],[X,.70,.32],.020,'#6c787d');
 for(const s of sides)r.rod([X,s*.70,.32],[F350_FRONT_AXLE-.035,s*.775,.43],.018,'#6c787d');
}
// The beam seats are shown; the spring element itself is not, because the
// repository has no source for the front spring arrangement of this truck.
export function drawTwinIBeamSpringSeats(r){
 const X=F350_FRONT_AXLE;
 for(const s of sides){
  const xc=X+s*.045;
  r.box(xc-.04,s*.48-.045,.306,xc+.04,s*.48+.045,.318,'#76818a');
  r.box(xc-.04,s*.48-.045,.333,xc+.04,s*.48+.045,.345,'#76818a');
 }
}
// Rear leaf packs sit under the frame rails, beneath the axle tubes. The
// spring-to-axle arrangement and leaf count are estimated.
export function drawF350RearLeafSprings(r){
 const X=F350_AXLE.x,top=F350_AXLE.z-F350_AXLE.tube-.012-.012;
 for(const s of sides){
  const yy=s*.48;
  for(let leaf=0;leaf<4;leaf++){
   const half=.52-leaf*.07,zc=top-.012-leaf*.013,rise=.10*(half/.52);
   r.profile([[X-half,zc+rise],[X,zc],[X+half,zc+rise],[X+half,zc+rise+.012],[X,zc+.012],[X-half,zc+rise+.012]],yy-.035,yy+.035,'#76818a');
  }
 }
}
// Frame rails rise over the rear axle so the housing passes beneath them.
export const F350_FRAME={halfWidth:.48,railHalf:.055,low:[.35,.49],high:[.57,.71],ramp:[.85,1.10],front:-2.119,rear:2.089};
export function drawF350Frame(r,color){
 const {halfWidth,railHalf,low,high,ramp,front,rear}=F350_FRAME;
 for(const s of sides){
  const y0=s*halfWidth-railHalf,y1=s*halfWidth+railHalf;
  r.box(front,y0,low[0],ramp[0],y1,low[1],color);
  r.profile([[ramp[0],low[0]],[ramp[1],high[0]],[ramp[1],high[1]],[ramp[0],low[1]]],y0,y1,color);
  r.box(ramp[1],y0,high[0],rear,y1,high[1],color);
 }
 for(const xx of [F350_FRONT_AXLE,-.25,.63])r.box(xx-.045,-.52,.35,xx+.045,.52,.46,color);
 r.box(F350_AXLE.x-.045,-.52,high[0]+.05,F350_AXLE.x+.045,.52,high[1]-.01,color);
}
