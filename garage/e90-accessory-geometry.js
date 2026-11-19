// Fitted previews of the BMW accessories offered for the 2008 328xi sedan (E90
// pre-LCI). Catalog rows and sources: e90-accessory-options.js.
//
// Every piece is seated on the shell model: the roof-rack feet stand on the roof
// skin beside the drip strips (e90RoofHeight, e90RoofHalf), the spoiler is bonded
// to the lid cap (e90DeckHeight) and the mats lie on the cabin floor
// (cabinFloorTop). BMW publishes no drawings for these parts, so crossbar
// positions, foot shapes and section sizes are illustrative. Published sizes
// used here: the 320-litre box is about 1,910 x 640 x 400 mm and the ski holder's
// support is 62 cm wide.
import {e90RoofHeight,e90RoofHalf,e90DeckHeight,paintShade90} from './e90-sedan-shell.js';
import {cabinFloorTop} from './floor-trim.js';
import {barrel,tint} from './road-primitives.js';

const TAU=Math.PI*2;
const alloy='#a9b1b4',slot='#2a2f31',black='#1f2426',rubber='#26292b',grey='#5d6467',bright='#c3cacc';
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};

// Crossbars over the four threaded roof bushes, which sit under flaps in the
// drip mouldings. Their positions here are estimated, not measured.
export const E90_BAR_X=[.10,.84];
export const E90_BAR_Z=1.515;
const BAR_HALF=.585,FOOT_LEN=.035;
const barTop=E90_BAR_Z+.013;

// A prism of the (y,z) outline extruded between x0 and x1. zAt(x,k) may lift
// individual outline points so a bottom edge follows the roof.
function prismX(r,outline,x0,x1,color,zAt=null){
  const at=(x,k)=>[x,outline[k][0],zAt?.(x,k)??outline[k][1]];
  const n=outline.length;
  r.polygon(outline.map((_,k)=>at(x0,k)),tint(color,.86),false);
  r.polygon(outline.map((_,k)=>at(x1,k)).reverse(),tint(color,.92),false);
  for(let k=0;k<n;k++){
    const j=(k+1)%n,dy=outline[j][0]-outline[k][0],dz=outline[j][1]-outline[k][1];
    const up=Math.abs(dz)<1e-9?1:Math.abs(dy)/Math.hypot(dy,dz);
    r.polygon([at(x0,k),at(x1,k),at(x1,j),at(x0,j)],tint(color,.74+.36*up),false);
  }
}
// A flat disc in the x–z plane facing outward along y.
function discY(r,x,y,z,radius,color,n=14){
  r.polygon(Array.from({length:n},(_,i)=>[x+radius*Math.cos(i*TAU/n),y,z+radius*Math.sin(i*TAU/n)]),color,false);
}

// ---- Base support system 82 71 0 403 104 ---------------------------------------
// Anodised aluminium bars with a slotted top; steel feet in black plastic housings
// that bolt down onto the roof bushes beside the drip strips.
function crossbar(r,x){
  const hx=.028,hz=.013,z=E90_BAR_Z;
  // A rounded aerofoil-like section extruded across the car.
  const section=[[-hx,-hz*.55],[-hx*.70,-hz],[hx*.75,-hz],[hx,-hz*.40],[hx,hz*.40],[hx*.70,hz],[-hx*.62,hz],[-hx,hz*.50]];
  const ring=y=>section.map(([dx,dz])=>[x+dx,y,z+dz]);
  const a=ring(-BAR_HALF),b=ring(BAR_HALF);
  for(let k=0;k<section.length;k++){
    const j=(k+1)%section.length,nz=section[k][1]+section[j][1];
    r.polygon([a[k],a[j],b[j],b[k]],tint(alloy,.78+.30*clamp(.5+nz/(2*hz),0,1)),false);
  }
  r.polygon(a,tint(alloy,.70),false);r.polygon(b.slice().reverse(),tint(alloy,.70),false);
  // Rubber filler in the T-slot along the top.
  r.box(x-.008,-BAR_HALF+.03,z+hz-.0005,x+.008,BAR_HALF-.03,z+hz+.0025,slot);
}
function rackFoot(r,x,side){
  const half=e90RoofHalf(x),s=side;
  // Outline in (y,z), outer bottom on the drip strip, inner bottom on the roof.
  const yOut=half+.004,yIn=half-.068;
  const outline=[[s*yIn,0],[s*yOut,0],[s*(half-.010),barTop+.010],[s*(BAR_HALF-.050),barTop+.010]];
  const roofZ=(xx,y)=>e90RoofHeight(xx,Math.min(Math.abs(y),half))+.002;
  prismX(r,outline,x-FOOT_LEN,x+FOOT_LEN,black,(xx,k)=>k<2?roofZ(xx,outline[k][0]):undefined);
  // The lockable cover on the outer face of the housing.
  const lean=(z)=>mix(yOut,half-.010,(z-roofZ(x,yOut))/(barTop+.010-roofZ(x,yOut)));
  const zLock=roofZ(x,yOut)+.050,yLock=s*(lean(zLock)+.0015);
  r.polygon([[x-.026,yLock,zLock-.022],[x+.026,yLock,zLock-.022],[x+.026,yLock,zLock+.020],[x-.026,yLock,zLock+.020]],grey,false);
  discY(r,x,yLock+s*.0006,zLock,.007,bright,12);
  discY(r,x,yLock+s*.0009,zLock,.0028,slot,8);
  // Width-adjustment cap on top, reached from above.
  r.box(x-.018,s*(BAR_HALF-.010)-.014,barTop+.010,x+.018,s*(BAR_HALF-.010)+.014,barTop+.016,grey);
}
function baseRack(r){
  for(const x of E90_BAR_X){
    crossbar(r,x);
    for(const side of [-1,1])rackFoot(r,x,side);
  }
}

// ---- Ski and snowboard holder 82 72 2 326 527 ----------------------------------
// One clamp on each bar, 62 cm wide, with a hinged upper jaw and a key lock at
// the outer end. Two pairs of skis and one snowboard are shown.
function skiHolder(r){
  baseRack(r);
  const w=.31,y0=-.02;
  for(const x of E90_BAR_X){
    r.box(x-.030,y0-w,barTop,x+.030,y0+w,barTop+.018,black);
    r.box(x-.026,y0-w+.012,barTop+.018,x+.026,y0+w-.012,barTop+.024,rubber);
    r.box(x-.032,y0-w,barTop+.064,x+.032,y0+w,barTop+.080,black);
    r.box(x-.028,y0-w+.012,barTop+.058,x+.028,y0+w-.012,barTop+.064,rubber);
    for(const y of [y0-w+.006,y0+w-.006])r.box(x-.028,y-.006,barTop+.018,x+.028,y+.006,barTop+.064,grey);
    discY(r,x,y0-w-.0005,barTop+.072,.006,bright,10);
    // Bar clamps under the crossbar.
    for(const y of [y0-w+.07,y0+w-.07])r.box(x-.034,y-.016,E90_BAR_Z-.020,x+.034,y+.016,E90_BAR_Z-.013,grey);
  }
  const front=-.42,rear=1.36,base=barTop+.024;
  const lift=u=>u>.92?((u-.92)/.08)**2*.07:0;
  const plank=(y,half,z,thick,color,topColor)=>{
    for(let k=0;k<16;k++){
      const ua=k/16,ub=(k+1)/16,a=mix(front,rear,ua),b=mix(front,rear,ub);
      r.polygon([[a,y-half,z+lift(ua)],[b,y-half,z+lift(ub)],[b,y+half,z+lift(ub)],[a,y+half,z+lift(ua)]],color,false);
      r.polygon([[a,y-half,z+thick+lift(ua)],[b,y-half,z+thick+lift(ub)],[b,y+half,z+thick+lift(ub)],[a,y+half,z+thick+lift(ua)]],topColor,false);
      for(const e of [-1,1])r.polygon([[a,y+e*half,z+lift(ua)],[b,y+e*half,z+lift(ub)],[b,y+e*half,z+thick+lift(ub)],[a,y+e*half,z+thick+lift(ua)]],tint(color,.8),false);
    }
  };
  // Each pair is clamped base to base: two planks stacked.
  for(const [y,top] of [[-.235,'#b8382e'],[-.155,'#d6dadb']]){
    plank(y,.034,base,.011,'#2c3133',top);
    plank(y,.034,base+.011,.011,top,'#2c3133');
  }
  plank(.115,.130,base,.016,'#30363a','#3f6f8f');
}

// ---- Bicycle holder 82 72 2 472 964 --------------------------------------------
// A wheel channel across both bars, a frame arm gripping the down tube and two
// wheel straps. A generic bicycle is drawn to show how it rides; the bike is not
// part of the holder.
const BIKE_Y=-.36;
function wheel(r,x,z,y){
  r.ringY(x,y-.012,z,.340,.305,rubber,36);r.ringY(x,y+.012,z,.340,.305,rubber,36);
  r.tubeY(x,y-.012,y+.012,z,.340,rubber,36);
  r.ringY(x,y,z,.305,.285,'#9aa2a5',36);
  for(let i=0;i<8;i++){const a=i*TAU/8;r.rod([x,y,z],[x+.285*Math.cos(a),y,z+.285*Math.sin(a)],.0016,'#8a9194',4);}
  barrel(r,[x,y-.035,z],[x,y+.035,z],.012,grey,10);
}
function bikeHolder(r){
  baseRack(r);
  const y=BIKE_Y,x0=-.44,x1=1.36,floor=barTop+.006,top=barTop+.034;
  // U channel: floor and two low walls, with end caps.
  r.box(x0,y-.036,barTop,x1,y+.036,floor,alloy);
  for(const e of [-1,1])r.box(x0,y+e*.036-.003,floor,x1,y+e*.036+.003,top,tint(alloy,.9));
  for(const x of [x0,x1])r.box(x-.012,y-.040,barTop-.002,x+.012,y+.040,top+.004,black);
  for(const x of E90_BAR_X)r.box(x-.040,y-.050,E90_BAR_Z-.022,x+.040,y+.050,barTop,black);
  const axle=floor+.340,front=-.06,rear=1.00;
  wheel(r,front,axle,y);wheel(r,rear,axle,y);
  // Wheel cups with ratchet straps over each tyre.
  for(const x of [front,rear]){
    for(const dx of [-.20,.20])r.box(x+dx-.05,y-.040,top,x+dx+.05,y+.040,top+.030,black);
    const ring=[];for(let i=0;i<=8;i++){const a=Math.PI*(.20+.60*i/8);ring.push([x-Math.cos(a)*.352,y,axle-Math.sin(a)*.352]);}
    for(let i=1;i<ring.length;i++)r.rod(ring[i-1],ring[i],.006,'#3a4043',6);
  }
  // A plain diamond frame, fork, bars and saddle in the wheel plane.
  const frame='#7a2c2a',bb=[.59,y,axle-.07],seat=[.742,y,axle+.427],head=[.092,y,axle+.497],crown=[.048,y,axle+.354];
  for(const [a,b] of [[bb,seat],[head,seat],[crown,bb],[bb,[rear,y,axle]],[seat,[rear,y,axle]],[crown,head]])r.rod(a,b,.016,frame,8);
  for(const e of [-1,1])r.rod(crown,[front,y+e*.040,axle],.010,frame,6);
  r.rod(head,[.02,y,axle+.535],.012,grey,8);
  r.rod([.02,y-.21,axle+.535],[.02,y+.21,axle+.535],.012,black,8);
  r.rod(seat,[.785,y,axle+.555],.012,grey,8);
  r.box(.73,y-.035,axle+.555,.90,y+.035,axle+.575,black);
  r.discX(bb[0],y-.025,bb[2],.08,'#6b7275',16);
  // Frame arm from the channel to a clamp on the down tube.
  const grip=[mix(crown[0],bb[0],.62),y,mix(crown[2],bb[2],.62)];
  r.box(.28,y-.045,top,.40,y+.045,top+.025,black);
  r.rod([.34,y+.030,top+.025],[grip[0],y+.030,grip[2]],.016,black,10);
  r.box(grip[0]-.035,y-.002,grip[2]-.030,grip[0]+.035,y+.055,grip[2]+.030,grey);
}

// ---- Roof box 320 82 73 2 420 634 -----------------------------------------------
// About 1,910 x 640 x 400 mm, with a glossy black lid over titanium-silver
// sides. It opens from both sides and clamps under the two crossbars.
const BOX={x0:-.445,x1:1.465,half:.32,height:.40};
function roofBox(r){
  baseRack(r);
  const base=barTop+.006,{x0,x1,half,height}=BOX;
  const n=28,lid='#16191b',side='#9ea3a3';
  // Plan, bottom and crown along the length (0 = nose, 1 = tail).
  const width=t=>half*(t<.30?.42+.58*Math.sin(smooth(t/.30)*Math.PI/2):t>.90?1-.10*smooth((t-.90)/.10):1);
  const floor=t=>base+(t<.22?.115*(1-t/.22)**2:0);
  const crown=t=>base+height*(t<.48?.42+.58*Math.sin(smooth(t/.48)*Math.PI/2):1-.16*smooth((t-.72)/.28));
  // Section corners as (across, up) fractions; the lid joins the sides at .45.
  const shape=[[-.82,0],[.82,0],[.97,.10],[1,.30],[1,.45],[.98,.62],[.90,.84],[.70,.97],[0,1],[-.70,.97],[-.90,.84],[-.98,.62],[-1,.45],[-1,.30],[-.97,.10]];
  const ring=t=>{const x=mix(x0,x1,t),w=width(t),zb=floor(t),zt=crown(t);return shape.map(([u,v])=>[x,u*w,mix(zb,zt,v)]);};
  const ts=Array.from({length:n+1},(_,i)=>.5-.5*Math.cos(Math.PI*i/n));
  const rings=ts.map(ring);
  for(let i=1;i<rings.length;i++)for(let k=0;k<shape.length;k++){
    const j=(k+1)%shape.length,v=(shape[k][1]+shape[j][1])/2,u=Math.abs(shape[k][0]+shape[j][0])/2;
    const color=v<.03?black:v<.45?side:lid;
    const light=v<.03?.7:v<.45?.80+.10*v:.86+.28*v*(1-.3*u);
    r.polygon([rings[i-1][k],rings[i][k],rings[i][j],rings[i-1][j]],tint(color,light),false);
  }
  r.polygon(rings[0],tint(lid,.9),false);r.polygon(rings.at(-1).slice().reverse(),tint(lid,.8),false);
  // Lock barrels on both sides (three-point locking) and the clamps under the bars.
  for(const s of [-1,1])for(const t of [.30,.52,.74]){
    const x=mix(x0,x1,t),z=mix(floor(t),crown(t),.45);
    discY(r,x,s*(width(t)+.0015),z,.009,bright,12);
  }
  for(const x of E90_BAR_X)for(const y of [-.22,.22])r.box(x-.030,y-.020,E90_BAR_Z-.022,x+.030,y+.020,E90_BAR_Z-.013,grey);
  for(const x of E90_BAR_X)for(const y of [-.22,.22])r.box(x-.035,y-.025,barTop,x+.035,y+.025,base,black);
}

// ---- Rear lid spoiler, primed, 51 71 0 396 344 ----------------------------------
// A low body-colour lip bonded along the trailing edge of the lid. Its section
// is drawn from photographs: about 10 cm deep, rising to about 2.4 cm.
const SPOILER_HALF=.53;
function lidEdge(y){
  // Trailing edge of the lid cap at offset y, found on the shell's deck surface.
  let lo=2.0,hi=2.36;
  for(let i=0;i<40;i++){const m=(lo+hi)/2;if(e90DeckHeight(m,y)==null)hi=m;else lo=m;}
  return lo-.004;
}
function spoiler(r,paint){
  const ys=Array.from({length:25},(_,i)=>-SPOILER_HALF+2*SPOILER_HALF*i/24);
  const depth=.100,rise=[[0,.0012],[.25,.0050],[.50,.0105],[.75,.0175],[.92,.0225],[1,.0240]];
  const section=y=>{
    const xe=lidEdge(y),fade=.25+.75*smooth((SPOILER_HALF-Math.abs(y))/.07);
    const deck=x=>e90DeckHeight(x,y)??e90DeckHeight(xe,y);
    const topPts=rise.map(([s,h])=>{const x=xe-depth*(1-s);return [x,y,deck(x)+h*fade+.0005];});
    const tail=[xe,y,deck(xe)+.0005];
    return {topPts,tail};
  };
  const secs=ys.map(section);
  const shade=(pts,hint)=>{
    const u=pts[1].map((v,i)=>v-pts[0][i]),w=pts[pts.length-1].map((v,i)=>v-pts[0][i]);
    let n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];const l=Math.hypot(...n)||1;n=n.map(v=>v/l);
    if(n[0]*hint[0]+n[1]*hint[1]+n[2]*hint[2]<0)n=n.map(v=>-v);
    return paintShade90(paint,n);
  };
  for(let i=1;i<secs.length;i++){
    const a=secs[i-1],b=secs[i];
    for(let k=1;k<rise.length;k++){
      const pts=[a.topPts[k-1],b.topPts[k-1],b.topPts[k],a.topPts[k]];
      r.polygon(pts,shade(pts,[0,0,1]),false);
    }
    // Trailing face down to the lid edge.
    const pts=[a.topPts.at(-1),b.topPts.at(-1),b.tail,a.tail];
    r.polygon(pts,shade(pts,[1,0,.2]),false);
  }
  // Closed ends.
  for(const s of [secs[0],secs.at(-1)])r.polygon([...s.topPts,s.tail],paintShade90(paint,[0,Math.sign(s.tail[1]),.3]),false);
}

// ---- All-weather floor mats, front, 51 47 0 427 557 -----------------------------
// Black rubber mats over the front footwells with a raised rim and cross ribs.
// The outline follows the carpet mats of the floor model; the shapes are estimates.
const MAT={x0:-.72,x1:-.06,yIn:.25,yOut:.63};
function floorMats(r){
  const {x0,x1,yIn,yOut}=MAT,nx=22,ny=8,lift=.005,rim=.010;
  // The toe end narrows toward the sill as on the carpet mats.
  const yo=x=>yOut-.08*smooth((x0+.10-x)/.10);
  const xs=Array.from({length:nx+1},(_,i)=>mix(x0,x1,i/nx));
  for(const s of [-1,1]){
    // cabinFloorTop steps per floor facet, so each corner takes the highest
    // floor within one cell of it and the mat never dips under a step.
    const dx=(x1-x0)/nx,dy=(yOut-yIn)/ny;
    const floor=(x,y)=>Math.max(...[-dx,0,dx].flatMap(ex=>[-dy,0,dy].map(ey=>cabinFloorTop('bmw328xi',x+ex,s*(y+ey))??-1)));
    const at=(x,j)=>{const y=mix(yIn,yo(x),j/ny);return [x,s*y,floor(x,y)+lift];};
    for(let i=1;i<xs.length;i++)for(let j=1;j<=ny;j++){
      const a=xs[i-1],b=xs[i],pts=[at(a,j-1),at(b,j-1),at(b,j),at(a,j)];
      r.polygon(s<0?pts:pts.slice().reverse(),tint(rubber,i%2?1:1.06),false);
      // Cross ribs on alternate rows of cells.
      if(i%2&&j>1&&j<ny){
        const z=Math.max(...pts.map(p=>p[2]));
        r.box(a+.008,Math.min(pts[0][1],pts[3][1]),z,a+.018,Math.max(pts[0][1],pts[3][1]),z+.004,tint(rubber,1.25));
      }
    }
    // Raised rim along the four edges.
    const wall=(p,q)=>r.polygon([p,q,[q[0],q[1],q[2]+rim],[p[0],p[1],p[2]+rim]],tint(rubber,1.15),false);
    for(let i=1;i<xs.length;i++)for(const j of [0,ny])wall(at(xs[i-1],j),at(xs[i],j));
    for(const x of [x0,x1])for(let j=1;j<=ny;j++)wall(at(x,j-1),at(x,j));
  }
}

export const e90AccessoryDraw={e90RoofRack:baseRack,e90SkiRack:skiHolder,e90BikeRack:bikeHolder,e90RoofBox:roofBox,e90Spoiler:spoiler,e90FloorMats:floorMats};
export const e90AccessoryOffsets={e90RoofRack:[0,0,.40],e90SkiRack:[0,0,.50],e90BikeRack:[0,0,.55],e90RoofBox:[0,0,.55],e90Spoiler:[.30,0,.20],e90FloorMats:[0,0,.30]};
