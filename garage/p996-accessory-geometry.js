// Fitted previews of the 1999 911 Carrera Cabriolet (996.1) accessories. Each
// item, its part number and what the preview approximates are recorded in
// p996-accessory-audit.js. Coordinates are metres: x rearward, z up.
import {coupeShape,porscheDeckPoint} from './porsche-coachwork.js';
import {roofSections,roofPoint} from './porsche-raised-top.js';
import {backlight996} from './porsche996-exterior-trim.js';
import {draw992HoodSide} from './porsche992-exterior-trim.js';
import {glazingFace} from './surface-materials.js';
import {hardtop996Id} from './porsche-roof-state.js';
import {barrel,tint,strip} from './road-primitives.js';

const car=coupeShape[2];
const black='#303638',rubber='#24292a',dark='#444c4f',chrome='#d4dbdd',TAU=Math.PI*2;
const us=[-1,-.82,-.68,-.5,0,.5,.68,.82,1];
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

export const p996AccessoryOffsets={hardtop:[0,0,.40],roofTransport:[0,0,.62],aerokit:[0,0,.26]};

// The shell stands just proud of the raised fabric outline, so the carrier
// feet land on whichever roof is closed.
const shellLift=.004;
const rows=roofSections(car);
function shellPoint(row,u,lift){const p=roofPoint(row,u);return [p[0],p[1],p[2]+lift];}

// Aluminum hardtop 996 563 911 00 with its electrically heated rear window.
// The fabric top stays folded under its compartment lid; the door and quarter
// glass are raised against the hardtop's side seals.
function hardtop(r,paint){
  const at=(row,u)=>shellPoint(row,u,shellLift);
  const pane=(j,u)=>at(rows[j],backlight996(j,u));
  for(let j=1;j<rows.length;j++)for(let i=1;i<us.length;i++){
    const a=us[i-1],b=us[i],mid=(a+b)/2;
    const panel=[pane(j-1,a),pane(j-1,b),pane(j,b),pane(j,a)];
    if(j>=5&&j<=7&&Math.abs(mid)<.68)glazingFace(r,panel,'#7d949c',.32);
    else r.polygon(panel,tint(paint,.80+.20*(1-mid*mid)+.04*Math.cos(j*.74)),false);
  }
  // Heating elements run across the glass between the two bonded edges.
  const across=us.filter(u=>Math.abs(u)<=.62);
  for(let k=1;k<8;k++){
    const f=4+3*k/8,j=Math.floor(f),t=f-j;
    const line=across.map(u=>{const p=mix(pane(j,u),pane(j+1,u),t);return [p[0],p[1],p[2]+.0015];});
    strip(r,line,line.map(([x,y,z])=>[x+.004,y,z-.0012]),'#5a3d33');
  }
  for(const s of [-1,1]){
    const edge=[4,5,6,7].map(j=>pane(j,s*.68));
    strip(r,edge,[4,5,6,7].map(j=>pane(j,s*.715)),black);
  }
  // Header seal on the windshield frame and the rear edge seated on the deck.
  const header=us.map(u=>at(rows[0],u));
  strip(r,header,header.map(([x,y,z])=>[x+.012,y,z-.010]),rubber);
  const hem=us.map(u=>at(rows.at(-1),u));
  const seat=hem.map(([x,y])=>{const p=porscheDeckPoint(car,x,y);return [x,y,p[2]+.003];});
  strip(r,hem,seat,tint(paint,.72));
  strip(r,seat,seat.map(([x,y,z])=>[x+.010,y,z+.002]),rubber);
  // Side glass and the painted sails behind the quarter lights, along the
  // same glass line as the raised fabric top.
  const sail='#414345',sails=new Set([sail,...Array.from({length:12},(_,i)=>tint(sail,1-.027*i))]);
  for(const s of [-1,1]){
    const first=r.faces.length;
    draw992HoodSide(r,car,s,rows,at,glazingFace);
    for(let i=first;i<r.faces.length;i++){
      const face=r.faces[i];delete face.roofServicePart;
      if(sails.has(face.color))face.color=tint(paint,.86);
    }
  }
}

// Roof transport system 996 801 055 00: two locking crossbars. The front
// feet clamp at the A-pillar tops, the rear feet beside the quarter windows.
function roofTransport(r){
  const lift=r.build?.parts?.includes(hardtop996Id)?shellLift:0;
  for(const row of [rows[1],rows[5]]){
    const x=row[0]+.004,barZ=row[1]+.058;
    const w=roofPoint(row,1)[1];
    r.box(x-.019,-w-.050,barZ-.012,x+.019,w+.050,barZ+.012,dark);
    r.box(x-.014,-w-.049,barZ+.012,x+.014,w+.049,barZ+.015,rubber);
    for(const side of [-1,1]){
      const [footX,,footZ]=shellPoint(row,side,lift);
      const y1=w-.012,y2=w+.026;
      r.box(footX-.040,side*w-.012,footZ,footX+.040,side*w+.010,footZ+.014,rubber);
      r.profile([[footX-.036,footZ+.010],[footX+.037,footZ+.010],
        [x+.031,barZ+.010],[x-.031,barZ+.010]],Math.min(side*y1,side*y2),Math.max(side*y1,side*y2),black);
      // Lockable end cap.
      r.box(x-.024,side*(w+.044)-.009,barZ-.015,x+.024,side*(w+.044)+.009,barZ+.014,black);
    }
  }
}

// Aerokit Carrera 000 044 801 90: the front section's integral spoiler, drawn
// as a deeper lip under the standard bumper, and the fixed rear wing with its
// high-level third brake light.
const lipPlan=[[0,-2.116,.235],[.20,-2.099,.238],[.30,-2.085,.240],[.40,-2.055,.246],
  [.50,-2.013,.251],[.60,-1.959,.258]];
function loft(r,rings,colors){
  for(let i=1;i<rings.length;i++)for(let j=0;j<rings[i].length;j++){
    const k=(j+1)%rings[i].length;
    r.polygon([rings[i-1][j],rings[i][j],rings[i][k],rings[i-1][k]],colors[j%colors.length],false);
  }
  r.polygon(rings[0],colors.at(-1),false);r.polygon(rings.at(-1),colors.at(-1),false);
}
function aerokit(r,paint){
  const plan=[...lipPlan.slice(1).reverse().map(([y,x,z])=>[-y,x,z]),...lipPlan];
  const rings=plan.map(([y,x,z])=>{
    const taper=1-.45*(Math.abs(y)/.6)**2;
    return [[x+.030,y,z+.002],[x-.020*taper,y,z-.012*taper],[x-.016*taper,y,z-.030*taper],[x+.034,y,z-.006]];
  });
  loft(r,rings,[tint(paint,.92),tint(paint,.78),'#2b3033',tint(paint,.70)]);
  // Fixed wing on two body-colour supports over the rear lid.
  const span=.50,front=1.885,rear=2.070,z0=.962;
  const section=[[front,z0],[front+.040,z0+.012],[rear-.030,z0+.006],[rear,z0+.016],[rear+.004,z0+.004],[rear-.040,z0-.010],[front+.020,z0-.012]];
  r.profile(section,-span,span,tint(paint,.94));
  for(const s of [-1,1])r.profile(section,s*span-.002,s*span+.002,tint(paint,.70));
  for(const y of [-.30,.30]){
    const xa=1.930,xb=2.025,da=porscheDeckPoint(car,xa,y)[2],db=porscheDeckPoint(car,xb,y)[2];
    r.profile([[xa,da-.004],[xb,db-.004],[xb-.012,z0-.008],[xa+.022,z0-.010]],y-.018,y+.018,tint(paint,.84));
  }
  // Brake light in the trailing edge of the wing.
  r.box(rear-.026,-.18,z0+.010,rear-.004,.18,z0+.018,'#b3262b');
  r.box(rear-.024,-.17,z0+.018,rear-.006,.17,z0+.0195,'#d9474b');
}

// Wind deflector 000 044 801 45: a folding mesh screen behind the front seats
// and a cover over the rear seats.
function windDeflector(r){
  const x=.420,zLow=.700,zTop=.980,w=.54,back=.636,frame='#1f2325',mesh='#3a3f42';
  for(const [a,b] of [[[x,-w,zLow],[x,-w,zTop]],[[x,w,zLow],[x,w,zTop]],[[x,-w,zTop],[x,w,zTop]],[[x,-w,zLow],[x,w,zLow]]])barrel(r,a,b,.009,frame,8);
  for(let i=0;i<8;i++){
    const y0=-w+.012+(2*w-.024)*i/8,y1=-w+.012+(2*w-.024)*(i+1)/8;
    r.polygon([[x,y0,zLow+.01],[x,y1,zLow+.01],[x,y1,zTop-.01],[x,y0,zTop-.01]],i%2?mesh:tint(mesh,1.08),false);
  }
  for(const [a,b] of [[[x,-w,zLow],[back,-w,zLow]],[[x,w,zLow],[back,w,zLow]],[[back,-w,zLow],[back,w,zLow]]])barrel(r,a,b,.008,frame,8);
  for(let i=0;i<6;i++){
    const a=x+.01+(back-x-.02)*i/6,b=x+.01+(back-x-.02)*(i+1)/6;
    r.polygon([[a,-w+.01,zLow+.004],[b,-w+.01,zLow+.004],[b,w-.01,zLow+.004],[a,w-.01,zLow+.004]],i%2?'#2b2f31':'#323739',false);
  }
}

// Sports tailpipes 996 111 981 00 / 982 00: chrome oval sleeves over the
// standard outlets below each rear corner of the bumper.
function tailpipes(r){
  const tip=2.092,z=.300,n=24;
  for(const s of [-1,1]){
    const y=s*.500,ring=(x,a,b)=>Array.from({length:n},(_,i)=>[x,y+a*Math.cos(i*TAU/n),z+b*Math.sin(i*TAU/n)]);
    const rings=[ring(tip-.012,.078,.052),ring(tip+.028,.086,.058),ring(tip+.044,.086,.058)];
    for(let k=1;k<rings.length;k++)for(let i=0;i<n;i++){
      const j=(i+1)%n;
      r.polygon([rings[k-1][i],rings[k-1][j],rings[k][j],rings[k][i]],tint(chrome,.80+.19*(1+Math.cos(TAU*i/n))/2),false);
    }
    r.polygon(rings[0],'#aeb6b8',false);
    r.polygon(ring(tip+.045,.072,.045),'#1d2224',false);
  }
}

// Stainless "Carrera" door entry guards 996 551 984 01 on both sills.
function sillGuards(r){
  const x0=-.585,x1=.480,z=.4685,n=14;
  for(const s of [-1,1]){
    const yIn=s*.700,yOut=s*.748;
    for(let i=0;i<n;i++){
      const a=x0+(x1-x0)*i/n,b=x0+(x1-x0)*(i+1)/n,shade=i%2?'#c4cacc':'#cfd5d7';
      r.polygon([[a,yIn,z+.002],[b,yIn,z+.002],[b,yOut,z+.002],[a,yOut,z+.002]],shade,false);
      r.polygon([[a,yIn,z],[b,yIn,z],[b,yIn,z+.002],[a,yIn,z+.002]],'#9aa1a3',false);
    }
    const m=(x0+x1)/2;
    r.polygon([[m-.10,s*.717,z+.0025],[m+.10,s*.717,z+.0025],[m+.10,s*.731,z+.0025],[m-.10,s*.731,z+.0025]],'#2d3234',false);
  }
}

export const cabrio996Draw={hardtop,roofTransport,aerokit,windDeflector,tailpipes,sillGuards};
