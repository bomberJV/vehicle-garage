import {headlamp993} from './porsche993-trim.js';
import {coupeShape,porscheDeckPoint} from './porsche-coachwork.js';
import {roofPoint,roofSections} from './porsche-raised-top.js';
import {barrel,tint} from './road-primitives.js';
import {G500_FRONT} from './g500-lamps.js';

const black='#303638',rubber='#24292a',steel='#596265',bright='#aeb8b9',dark='#444c4f';
const TAU=Math.PI*2;
const offsets={headlamps:[-.32,0,.24],carrier:[0,0,.48],guard:[-.65,0,0],ladder:[.48,-.37,.06],snorkel:[0,.56,.08],aux:[-.23,0,.47],display:[-.40,0,-.10]};

export function defaultAccessoryOffset(kind){return offsets[kind];}

function linkRings(r,rings,top,side){
  const n=rings[0].length;
  for(let k=1;k<rings.length;k++)for(let j=0;j<n;j++){
    const i=(j+1)%n;
    r.polygon([rings[k-1][j],rings[k-1][i],rings[k][i],rings[k][j]],tint(side,.80+.19*(1+Math.cos(TAU*j/n))/2),false);
  }
  r.polygon(rings[0],side,false);
  r.polygon(rings.at(-1),top,false);
}

// A continuous bent tube with a miter plane at each joint. Cross sections are
// rotated along the path so curved guard corners have no gaps at the elbows.
function bentTube(r,path,radius,color){
  const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  let tangent=unit(path[1].map((v,i)=>v-path[0][i]));
  let axis=unit(cross(tangent,Math.abs(tangent[2])<.80?[0,0,1]:[0,1,0]));
  const rings=path.map((p,k)=>{
    const left=path[Math.max(0,k-1)],right=path[Math.min(path.length-1,k+1)];
    tangent=unit(right.map((v,i)=>v-left[i]));
    // Project the preceding section's lateral axis into the new joint plane.
    const second=unit(cross(tangent,axis));axis=unit(cross(second,tangent));
    return Array.from({length:12},(_,j)=>p.map((v,i)=>v+radius*(Math.cos(TAU*j/12)*axis[i]+Math.sin(TAU*j/12)*second[i])));
  });
  linkRings(r,rings,color,color);
}

function gGuard(r){
  // 2002 US front-bumper plate, items 11–16, and owner's manual pp. 182–183.
  // The photo-scaled dimensions register the upright guard to the stock bumper.
  const bumper=G500_FRONT-.116, mountY=.437;
  const at=(dx,y,z)=>[bumper+dx,y,z];
  const section=points=>points.map(([dx,z])=>[bumper+dx,z]);
  // The one-piece tubular surround returns behind the two headlamp corners.
  // Its seam sits beneath the left pad. Both headlamp openings are bare.
  const corner=[[-.071,mountY,.820],[-.062,.720,.820],[-.045,.801,.821],
    [-.020,.853,.829],[.008,.880,.848],[.033,.889,.883],[.049,.891,.929],
    [.056,.891,1.073],[.049,.888,1.112],[.032,.876,1.144],
    [.009,.850,1.164],[-.011,.804,1.173],[-.024,.721,1.175],[-.029,mountY,1.175]];
  const wing=side=>corner.map(([dx,y,z])=>at(dx,side*y,z));
  bentTube(r,[at(-.071,-mountY,.820),...wing(1),...wing(-1).reverse()],.020,bright);
  // The lower tie bar joins the toes of the uprights below the plate carrier.
  barrel(r,at(-.085,-mountY,.488),at(-.085,mountY,.488),.017,bright,12);
  const pad=section([[-.039,1.204],[-.015,1.199],[-.001,1.182],[-.001,1.150],
    [-.025,1.135],[-.055,.837],[-.068,.686],[-.064,.561],[-.047,.511],
    [-.050,.476],[-.081,.460],[-.103,.479],[-.122,.560],[-.124,.648],
    [-.105,.830],[-.065,1.160],[-.059,1.188]]);
  const mount=section([[.021,.478],[.021,.615],[-.024,.626],[-.056,.617],
    [-.063,.597],[-.046,.573],[-.045,.538],[-.068,.512],[-.068,.492],[-.050,.476]]);
  const hingeEar=section([[-.093,.495],[-.069,.478],[-.041,.486],[-.036,.507],
    [-.042,.576],[-.037,.606],[-.049,.622],[-.071,.624],[-.090,.583]]);
  for(const side of [-1,1]){
    const y=side*mountY;
    r.profile(pad,y-.030,y+.030,black);
    r.profile(hingeEar,y-.019,y+.019,dark);
    // The bumper-mounted fork captures the guard at a lower pivot and an
    // upper quick lock. The horizontal pins bridge both cheeks of each fork.
    for(const edge of [-1,1]){
      const cheek=y+edge*.036;
      r.profile(mount,cheek-.005,cheek+.005,steel);
    }
    for(const [dx,z,radius] of [[-.054,.501,.014],[-.053,.606,.012]]){
      barrel(r,at(dx,y-.045,z),at(dx,y+.045,z),radius,bright,12);
      barrel(r,at(dx,y+side*.045,z),at(dx,y+side*.052,z),radius+.005,dark,8);
    }
    bentTube(r,[at(-.053,y+side*.052,.606),at(-.049,y+side*.055,.631),
      at(-.041,y+side*.052,.645)],.005,steel);
  }
}
function gLadder(r){
  const y=-.764;
  // Four folded steps, two rails, a top gutter shoe and a lower body foot.
  for(const sign of [-1,1]){
    const sy=y+sign*.073;
    bentTube(r,[[2.086,sy,1.926],[2.113,sy,1.946],[2.220,sy,1.944],[2.259,sy,1.921],
      [2.270,sy,1.877],[2.296,sy,1.517],[2.313,sy,1.115],[2.303,sy,1.041],[2.262,sy,1.013],[2.105,sy,1.013]],.010,black);
  }
  for(let i=0;i<4;i++){
    const z=1.080+i*.241,x=2.307-i*.011;
    r.box(x-.024,y-.081,z-.010,x+.024,y+.081,z+.008,steel);
    for(const shift of [-.014,.004])r.box(x+shift,y-.077,z+.008,x+shift+.006,y+.077,z+.012,black);
  }
  for(const [x,z] of [[2.090,1.934],[2.119,1.019]])r.box(x-.012,y-.082,z-.016,x+.012,y+.082,z+.016,dark);
}
function gSnorkel(r){
  for(const s of [-1,1]){
    const sections=[[-1.037,.890,1.091,.127,.029],[-1.026,.903,1.155,.143,.045],[-.948,.907,1.235,.100,.046],
      [-.823,.877,1.309,.061,.046],[-.789,.861,1.437,.057,.044],[-.701,.852,1.789,.057,.045],[-.659,.851,1.920,.063,.048],
      [-.653,.854,1.982,.064,.048],[-.651,.853,2.000,.057,.042]];
    const rings=sections.map(([x,y,z,rx,ry])=>Array.from({length:12},(_,j)=>[x+rx*Math.cos(j*TAU/12),s*(y+ry*Math.sin(j*TAU/12)),z]));
    linkRings(r,rings,black,'#41484b');
    // A recessed side-facing opening, with a lip and horizontal mesh bars.
    r.box(-.695,s*.900-.002,1.933,-.614,s*.900+.002,1.977,'#202829');
    for(let i=0;i<4;i++)r.box(-.692,s*.905-.0015,1.938+i*.010,-.618,s*.905+.0015,1.941+i*.010,'#60686a');
  }
}

function lampOptic(r,x,y,z,radius){
  r.discX(x,y,z,radius,'#889da0',14);
  r.discX(x-.0016,y,z,radius*.80,'#bac9bd',14);
  r.discX(x-.0031,y,z,radius*.35,'#e5ebc9',12);
}
function pod(r,x,y,z,halfY,halfZ,diamond){
  const rear=x+.067,round=Math.min(halfY,halfZ)*.21;
  const shape=[[-halfY+round,-halfZ],[halfY-round,-halfZ],[halfY,-halfZ+round],[halfY,halfZ-round],
    [halfY-round,halfZ],[-halfY+round,halfZ],[-halfY,halfZ-round],[-halfY,-halfZ+round]];
  const ring=(xx,scale)=>shape.map(([a,b])=>[xx,y+a*scale,z+b*scale]);
  linkRings(r,[ring(rear,.74),ring(rear-.015,.96),ring(x,1)],'#435057',black);
  const face=x-.001;
  if(diamond){
    const d=halfY*.40;
    for(const [dy,dz] of [[0,d],[-d,0],[d,0],[0,-d]])lampOptic(r,face,y+dy,z+dz,halfY*.24);
  }else{
    for(const col of [-1,0,1])for(const row of [-1,1])lampOptic(r,face,y+col*halfY*.56,z+row*halfZ*.35,halfZ*.30);
  }
  for(const sy of [-1,1])for(const sz of [-1,1])r.discX(face-.001,y+sy*halfY*.78,z+sz*halfZ*.70,.0028,'#a6abad',6);
  for(let i=-2;i<=2;i++){
    const fy=y+i*halfY*.27;
    r.box(rear-.004,fy-.002,z-halfZ*.61,rear+.009,fy+.002,z+halfZ*.61,'#474e51');
  }
  for(const sy of [-1,1])r.box(x+.020,y+sy*(halfY+.003)-.003,z-halfZ-.014,x+.048,y+sy*(halfY+.003)+.003,z+.007,dark);
  r.box(x+.014,y-halfY-.006,z-halfZ-.017,x+.052,y+halfY+.006,z-halfZ-.010,steel);
}
function gAux(r){
  for(const s of [-1,1]){
    r.box(-.885,s*.723-.038,1.275,-.773,s*.723+.038,1.291,dark);
    r.rod([-.821,s*.723,1.290],[-.827,s*.723,1.315],.012,steel,10);
    pod(r,-.855,s*.723,1.366,.038,.038,true);
  }
}

// Display-only lenses use static colors. There is no flashing or timing mode.
function splitLens(r,x,y,z,width,height){
  const depth=.034,edge=.004;
  r.box(x,y-width,z-height,x+depth,y+width,z+height,black);
  const colors=['#bc4b52','#597fc8'];
  for(const s of [-1,1]){
    const cy=y+s*width*.49,c=colors[s>0?1:0],half=width*.457;
    r.box(x-.003,cy-half,z-height+edge,x-.0007,cy+half,z+height-edge,c);
    for(let j=-2;j<=2;j++)r.box(x-.004,cy+j*half*.36-.001,z-height+edge+.002,x-.0033,cy+j*half*.36+.001,z+height-edge-.002,tint(c,1.32));
  }
}
function gDisplay(r){
  // Low display panel on the top surface of the bumper, below the grille.
  r.box(-2.336,-.19,.676,-2.290,-.172,.784,black);
  r.box(-2.336,.172,.676,-2.290,.19,.784,black);
  splitLens(r,-2.349,0,.799,.207,.020);
}

// The crossbar feet follow the two side gutters of the raised Cabriolet top.
// The Tequipment brochure identifies the carrier. Cross-section dimensions
// here are illustrative, registered to the existing roof model.
function carrier993(r){
  const rows=roofSections(coupeShape[0]);
  for(const row of [rows[1],rows[4]]){
    const x=row[0],barZ=1.404;
    const [,w]=roofPoint(row,1);
    r.box(x-.019,-w-.054,barZ-.012,x+.019,w+.054,barZ+.012,dark);
    r.box(x-.014,-w-.053,barZ+.012,x+.014,w+.053,barZ+.015,rubber);
    for(const side of [-1,1]){
      const [footX,,footZ]=roofPoint(row,side);
      const y1=w+.004,y2=w+.031;
      r.box(footX-.039,side*w-.009,footZ-.006,footX+.039,side*w+.009,footZ+.012,rubber);
      r.profile([[footX-.036,footZ+.004],[footX+.037,footZ+.004],
        [x+.031,barZ+.010],[x-.031,barZ+.010]],Math.min(side*y1,side*y2),Math.max(side*y1,side*y2),black);
      r.box(x-.024,side*(w+.046)-.009,barZ-.015,x+.024,side*(w+.046)+.009,barZ+.014,black);
    }
  }
}

const g500Draw={guard:gGuard,ladder:gLadder,snorkel:gSnorkel,aux:gAux,display:gDisplay};
const cabrio993Draw={
  carrier:carrier993,
  headlamps(r,paint){
    for(const side of [-1,1])headlamp993(r,coupeShape[0],side,paint,porscheDeckPoint,true);
  }
};
const fieldDraw={g500:g500Draw,porsche993cab:cabrio993Draw};
export function drawFieldAccessory(r,vehicle,kind,paint){
  const draw=fieldDraw[vehicle]?.[kind];
  if(draw)r.tag('accessories.'+kind,()=>draw(r,paint));
}
