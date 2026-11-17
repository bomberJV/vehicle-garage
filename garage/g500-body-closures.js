import {drawLettering,letteringWidth} from './badge-lettering.js';
import {cassetteSetback,roofFrontLip} from './g500-roof-datums.js';
import {fittedWindow,starBadge} from './exterior-trim.js';

const diagram={label:'Mercedes-Benz Service · long G 500 exterior dimensions, drawing P00.10-2351-50, p. 25',url:'https://www.docdroid.net/mfdy/einfuehrung-g-2006-pdf#page=30'};
const backDoor={label:'2002 G-Class operator’s manual · tailgate and outside handle, p. 37',url:'https://www.manualsonline.com/manuals/mfg/mercedesbenz/2002_g_500.html?p=40'};
const usDimensions={label:'2002 G-Class operator’s manual · US dimensions, p. 360',url:'https://www.manualsonline.com/manuals/mfg/mercedesbenz/2002_g_500.html?p=363'};
export const g500BodyReferences={structure:usDimensions,roof:diagram,windshield:diagram,'quarter-glass':diagram,glass:diagram,tailgate:backDoor,spare:diagram,door:diagram,'front-right':diagram,'rear-left':diagram,'rear-right':diagram,hood:diagram};

const shade=(color,factor)=>'#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(color.slice(i,i+2),16)*factor)).toString(16).padStart(2,'0')).join('');
function ring(r,a,b,color){
  for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],color,false);}
}

// The convex stampings have distinct outer skin, inner pressing and folded hems.
export function sideSheet(r,contour,outerY,innerY,paint){
  const outside=contour.map(([x,z])=>[x,outerY,z]),inside=contour.map(([x,z])=>[x,innerY,z]);
  r.polygon(outside,shade(paint,outerY<0?.87:.96),false);
  r.polygon(inside,shade(paint,.62),false);
  ring(r,outside,inside,shade(paint,.79));
}

export function drawBodyMirror(r,side,paint){
  // At the two housing tips the installed car is 2007 mm wide (US manual p.360).
  // The octagonal bow follows the rectangular housing with radiused corners.
  const section=[[-.081,-.051],[-.071,-.066],[.065,-.066],[.083,-.047],[.083,.045],[.067,.065],[-.066,.065],[-.081,.05]];
  const hoop=(x,scale,cy=.9205)=>section.map(([u,v])=>[x,side*(cy+u*scale),1.365+v*scale]);
  r.rod([-.690,side*.868,1.248],[-.680,side*.918,1.296],.017,'#30383a',8);
  const front=hoop(-.751,.80),belly=hoop(-.727,1),end=hoop(-.649,.99),gasket=hoop(-.646,.91),glass=hoop(-.645,.843);
  r.polygon(front,shade(paint,.89),false);
  ring(r,front,belly,shade(paint,.96));ring(r,belly,end,shade(paint,1.02));
  ring(r,end,gasket,shade(paint,.80));ring(r,gasket,glass,'#303638');r.polygon(glass,'#91a2a3',false);
}

export function formedRoof(r,paint){
  // Plan and side profile traced from the 2850-mm wheelbase on P00.10-2351-50.
  // The US 1977-mm height is measured from the stock contact plane at z=.040.
  const topColor=shade(paint,1.065),skin='#41494a',crown=2.017,gutter=1.936;
  const x=[roofFrontLip[0],-.399,-.344,-.278,-.485+cassetteSetback,.385+cassetteSetback,.446+cassetteSetback,.475+cassetteSetback,1.846,1.875,1.90,1.992,2.026];
  const height=[1.932,1.954,1.974,1.992,crown,crown,crown,crown,crown,crown,crown,1.995,1.946];
  const half=[roofFrontLip[1],.822,.831,.836,.838,.838,.838,.838,.838,.838,.838,.833,.817];
  const ribs=[-.564,-.356,-.143,.143,.356,.564];
  const ys=new Set([-.838,-.735,-.493,.493,.735,.838]);
  for(const y of ribs)for(const offset of [-.014,-.007,.007,.014])ys.add(y+offset);
  const lanes=[...ys].sort((a,b)=>a-b);
  const base=(i,y)=>height[i]-Math.max(0,(Math.abs(y)-.493)/(.838-.493))*Math.max(0,Math.min(.037,height[i]-gutter));
  const point=(i,y)=>{
    // Press six narrow flutes into the skin; intervening shoulders meet the
    // parent sheet on exactly the same vertices even in close or wire views.
    const near=Math.min(...ribs.map(c=>Math.abs(y-c)));
    const depth=i===7||i===8?.006:0;
    return [x[i],half[i]*y/.838,base(i,y)-depth*Math.max(0,Math.min(1,(.014-near)/.007))];
  };
  const under=(i,y)=>[x[i],half[i]*y/.838,gutter-.007];
  for(let i=0;i<x.length-1;i++)for(let k=0;k<lanes.length-1;k++){
    const a=lanes[k],b=lanes[k+1];
    if(i===4&&a>=-.493&&b<=.493)continue;
    const slope=point(i+1,a)[2]-point(i+1,b)[2];
    const color=i>=6&&i<=8&&b-a<.016?shade(topColor,1+slope*18):topColor;
    r.polygon([point(i,a),point(i+1,a),point(i+1,b),point(i,b)],color,false);
    r.polygon([under(i,a),under(i,b),under(i+1,b),under(i+1,a)],skin,false);
  }
  for(const i of [0,x.length-1])for(let k=0;k<lanes.length-1;k++)
    r.polygon([point(i,lanes[k]),point(i,lanes[k+1]),under(i,lanes[k+1]),under(i,lanes[k])],shade(paint,.88),false);
  for(const sign of [-1,1]){
    for(let i=0;i<x.length-1;i++)
      r.polygon([point(i,sign*.838),point(i+1,sign*.838),under(i+1,sign*.838),under(i,sign*.838)],shade(paint,.87),false);
    const rail=[[roofFrontLip[0]-.001,sign*.802,gutter-.005],[-.366,sign*.846,gutter],[1.968,sign*.846,gutter],[2.034,sign*.816,gutter-.006]];
    for(let i=1;i<rail.length;i++)r.rod(rail[i-1],rail[i],.010,shade(paint,.80),8);
  }
}

// The inner wheelhouse closes the view through the gap above the tyre. Its
// back lies inboard of the entire 265-mm tyre section; the flare is separate.
// The inboard wall is a flange 50 mm deep that follows the arch; below it the
// axle, springs and dampers pass into the wheel opening.
export function wheelhouse(r,axle,side){
  const c=[axle,.4276],outer=.448,inner=.398,edge=.899,back=.610;
  const point=(angle,y,rad)=>[c[0]+rad*Math.cos(angle),side*y,c[1]+rad*Math.sin(angle)];
  for(let i=0;i<24;i++){
    const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
    r.polygon([point(a,edge,outer),point(b,edge,outer),point(b,back,outer),point(a,back,outer)],'#424748',false);
    r.polygon([point(a,back,inner),point(a,back,outer),point(b,back,outer),point(b,back,inner)],'#353a3a',false);
  }
}

function gateX(z){return 2.123-Math.max(0,z-1.188)*.114;}
function backSheet(r,contour,color,thickness=.042){
  const outside=contour.map(([y,z])=>[gateX(z),y,z]);
  const inside=outside.map(([x,y,z])=>[x-thickness,y,z]);
  r.polygon(outside,color,false);r.polygon(inside,shade(color,.75),false);ring(r,outside,inside,shade(color,.79));
}
export function rearJamb(r,paint,withHardware=true){
  // The fixed wings are wide: the cargo door sits in the narrow central aperture.
  const gate=.519,top=1.923;
  r.box(2.047,-.834,.573,2.123,.834,.627,shade(paint,.8));
  r.box(gateX(top)-.05,-.816,top,gateX(top),.816,1.941,shade(paint,.90));
  if(withHardware)gateHinges(r,paint,false);
  for(const s of [-1,1]){
    for(const [a,b,wa,wb] of [[.629,1.188,.872,.872],[1.188,top,.872,.818]])
      backSheet(r,[[s*gate,a],[s*wa,a],[s*wb,b],[s*gate,b]],paint);
    // Fixed end of each rub strip, outboard of the closure.
    r.box(2.124,s<0?-.853:.526,.976,2.138,s<0?-.526:.853,1.024,'#343c3e');
  }
}

// Two leaves share one permanent pivot axis. The pin and body leaf stay on the
// left jamb when the drawing is exploded; its mating leaf travels with the gate.
export const g500GatePivot=[2.146,-.52];
export function gateHinges(r,paint,door){
  const [pinX,y]=g500GatePivot;
  for(const z of [.748,1.179]){
    const x=pinX-.014;
    if(door){
      r.box(x-.004,y+.002,z-.022,x+.016,y+.066,z+.022,shade(paint,.91));
      r.rod([x+.014,y,z-.019],[x+.014,y,z+.019],.014,shade(paint,.85),10);
    }else{
      r.box(x-.004,y-.069,z-.027,x+.011,y-.003,z+.027,shade(paint,.88));
      for(const s of [-1,1])r.rod([x+.014,y,z+s*.020],[x+.014,y,z+s*.030],.014,shade(paint,.84),10);
      r.rod([x+.014,y,z-.033],[x+.014,y,z+.033],.005,'#6f7878',8);
    }
  }
}

const cargoOutside=[[-.513,1.211],[-.513,1.917],[.513,1.917],[.513,1.211]];
const cargoWindow=[[-.454,1.256],[-.454,1.797],[.454,1.797],[.454,1.256]];
const gateSurface=(contour,offset=0)=>contour.map(([y,z])=>[gateX(z)+offset,y,z]);

// Both the mounted exterior and the working bench use these same stampings,
// optics and fittings. The tags are assigned by the caller in each context.
// Star and wordmark across the stainless spare face, left to right from behind.
const spareText='Mercedes-Benz',spareTextHeight=.036,spareStar=.058,spareGap=.026;
const spareBadge={height:spareTextHeight,text:spareText,star:spareStar,gap:spareGap,
  start:-.115-(letteringWidth(spareText,spareTextHeight)+2*spareStar+spareGap)/2};
export const g500SpareStar={center:[spareBadge.start+spareStar,1.056],radius:spareStar};
export const g500GateParts={
  skin(r,paint){
    backSheet(r,[[-.513,.630],[.513,.630],[.513,1.211],[-.513,1.211]],paint);
    const front=gateSurface(cargoOutside),glass=gateSurface(cargoWindow),back=gateSurface(cargoOutside,-.034),lip=gateSurface(cargoWindow,-.034);
    ring(r,front,glass,paint);ring(r,back,lip,shade(paint,.77));ring(r,front,back,shade(paint,.81));ring(r,glass,lip,shade(paint,.76));
    for(const [a,b] of [[-.496,.244],[.415,.497]])r.box(2.125,a,.975,2.139,b,1.022,'#343c3e');
  },
  glass(r){fittedWindow(r,gateSurface(cargoWindow,-.006),{privacy:true,radius:.067,seal:.015});},
  handle(r){
    r.box(2.134,.241,.970,2.144,.420,1.025,'#303638');
    r.rod([2.155,.254,.988],[2.155,.357,.988],.010,'#50595a',8);
    r.rod([2.146,.395,.996],[2.157,.395,.996],.012,'#abb1ae',12);
  },
  wiper(r){
    const pos=(y,z,relief)=>[gateX(z)+relief,y,z];
    r.rod(pos(.08,1.758,.012),pos(-.040,1.707,.020),.009,'#2f3738',9);
    r.rod(pos(-.328,1.704,.026),pos(.110,1.698,.026),.010,'#333a3a',9);
  },
  lamp(r){
    const x=gateX(1.868);
    r.box(x,-.115,1.858,x+.012,.115,1.882,'#363e40');
    r.box(x+.012,-.106,1.861,x+.016,.106,1.878,'#943d3b');
  },
  carrier(r){
    r.rod([2.124,-.115,1.056],[2.194,-.115,1.056],.154,'#303638',24);
    r.rod([2.180,-.115,1.056],[2.225,-.115,1.056],.370,'#42494a',40);
  },
  spare(r,paint){
    const y=-.115,z=1.056;
    const hoop=(x,rad)=>Array.from({length:48},(_,i)=>[x,y+rad*Math.cos(i*Math.PI/24),z+rad*Math.sin(i*Math.PI/24)]);
    // The 2002 US cover: a painted side wall rolls over a rounded shoulder
    // into a polished stainless face with a bright edge ring. The star sits
    // left of a "Mercedes-Benz" wordmark across the middle (BaT lot 271820).
    const rims=[[2.196,.370],[2.206,.384],[2.230,.392],[2.380,.392],[2.405,.386],[2.420,.374],[2.428,.360],[2.431,.335]];
    const tones=['',shade(paint,.58),shade(paint,.78),shade(paint,.86),shade(paint,.82),shade(paint,.92),'#d4dadb','#eef1f1'];
    for(let k=1;k<rims.length;k++)ring(r,hoop(...rims[k-1]),hoop(...rims[k]),tones[k]);
    // The face is a shallow polished dome. Its shading follows height, as a
    // mirror does: bright sky above, a dark horizon just below the middle,
    // grey ground underneath.
    const crown=.016,dome=rho=>2.431+crown*(1-(rho/.335)**2);
    const stops=[[-1,[150,159,163]],[-.35,[120,130,135]],[-.08,[86,96,101]],[.12,[178,187,190]],[.55,[214,220,222]],[1,[198,206,209]]];
    const sky=v=>{for(let i=1;i<stops.length;i++)if(v<=stops[i][0]){const [a,ca]=stops[i-1],[b,cb]=stops[i],t=(v-a)/(b-a);
      return '#'+ca.map((c,k)=>Math.round(c+(cb[k]-c)*t).toString(16).padStart(2,'0')).join('');}return '#c6ced1';};
    const radii=[.335,.29,.24,.19,.14,.09,.04,0];
    for(let k=1;k<radii.length;k++){
      const a=hoop(dome(radii[k-1]),radii[k-1]),b=hoop(dome(radii[k]),radii[k]);
      for(let i=0;i<48;i++){const j=(i+1)%48,mid=(a[i][2]+a[j][2]+b[i][2]+b[j][2])/4;
        r.polygon([a[i],a[j],b[j],b[i]],sky((mid-z)/.335),false);}
    }
    const {height:h,text,star,gap,start}=spareBadge,on=(dy,dz,lift)=>dome(Math.hypot(dy,dz))+lift;
    starBadge(r,[on(start+star-y,0,.005),start+star,z],star,'x',1,{backing:false});
    drawLettering(r,text,h,(u,v)=>{const yy=start+2*star+gap+u,zz=z-h*.38+v;return [on(yy-y,zz-z,.0035),yy,zz];},{color:'#2f3537',radius:h*.07});
  }
};
export function cargoDoor(r,paint){
  const p=g500GateParts;
  p.skin(r,paint);gateHinges(r,paint,true);p.handle(r);p.wiper(r);
  r.tag('body.glass',()=>p.glass(r));
  r.tag('body.rear-lights',()=>p.lamp(r));
  r.tag('body.spare',()=>{p.carrier(r);p.spare(r,paint);});
}
