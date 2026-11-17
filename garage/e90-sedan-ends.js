// Nose and tail fittings for the 2008 US 328xi sedan (E90 pre-LCI): swept
// headlamps with two round reflectors and the amber strip along their upper outer
// edge, taller kidneys, the US bumpers with round fog lamps and plate bracket, and
// L-shaped two-piece tail lamps across the quarters and the lid.
//
// Placed on the lofted skin (e90-sedan-shell.js) by arc length and height, as
// for the E46 (e46-coupe-ends.js). Outlines follow the photographs listed in
// bmw-references.md; they are estimates, not factory drawings.
import {panel,deckPanel} from './exterior-coachwork.js';
import {glazingFace} from './surface-materials.js';
import {skinAt90 as skinAt,sAtFrontY90 as sAtFrontY,sAtTailY90 as sAtTailY,sAtX90 as sAtX,paintShade90 as paintShade,e90SkinPoint} from './e90-sedan-shell.js';

const NOSE=-2.170,TAIL=2.356,BODY_HALF=.9085,T=Math.PI*2,BLACK='#161d20',DARK='#232b2e',CHROME='#c8cfcd',HOUSING='#596165';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const atSide=(r,s,fn)=>r.instance(s<0?'Driver side':'Passenger side',fn);
const poly=(r,pts,color)=>r.polygon(pts,color,false);
const fan=(r,center,ring,color)=>{for(let i=0;i<ring.length;i++)poly(r,[center,ring[i],ring[(i+1)%ring.length]],color);};
function band(r,a,b,color){for(let i=0;i<a.length;i++){const j=(i+1)%a.length;poly(r,[a[i],a[j],b[j],b[i]],typeof color==='function'?color(i):color);}}

// An outline given as (y, z) pairs on the nose (or tail) is converted to arc
// length so that points beyond the corner wrap onto the side.
const frontS=y=>y>.890?sAtX(-1.80)+(y-.890):sAtFrontY(y);
const tailS=y=>y>.79?sAtX(2.25)-(y-.790):sAtTailY(y);
// Fittings stand a few millimetres proud of the faceted skin rather than cutting it,
// so a lift of 0 is the visible face of the paint around them.
const BASE=.009;
const onNose=(side,lift)=>([y,z])=>skinAt(frontS(y),z,side,lift+BASE);
const onTail=(side,lift)=>([y,z])=>skinAt(tailS(y),z,side,lift+BASE);
function densify(points,step=.012,closed=true){
  const out=[],n=points.length;
  for(let i=0;i<(closed?n:n-1);i++){
    const a=points[i],b=points[(i+1)%n],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
    for(let j=0;j<k;j++)out.push([mix(a[0],b[0],j/k),mix(a[1],b[1],j/k)]);
  }
  if(!closed)out.push(points.at(-1));
  return out;
}
const centroid=pts=>pts[0].map((_,k)=>pts.reduce((s,p)=>s+p[k],0)/pts.length);
// Fill a closed (y,z) outline seated on the skin, as a fan from its centre.
function patch(r,outline,map,color,opacity){
  const ring=densify(outline).map(map),c=map(centroid(outline));
  for(let i=0;i<ring.length;i++){
    const pts=[c,ring[i],ring[(i+1)%ring.length]];
    if(opacity!=null)glazingFace(r,pts,color,opacity);else poly(r,pts,color);
  }
  return ring;
}
const circle=(cy,cz,rad,n=24)=>Array.from({length:n},(_,i)=>[cy+rad*Math.cos(i/n*T),cz+rad*Math.sin(i/n*T)]);

// ---- Front -----------------------------------------------------------------------
// Headlamp cover outline (passenger side, y > 0): the top runs under the hood's
// leading edge; the lower edge dips under the outer reflector and the cover turns
// round the corner, where the amber indicator sits.
const HEADLAMP=[[.272,.823],[.40,.829],[.55,.833],[.68,.832],[.78,.824],[.86,.806],[.905,.785],[.90,.765],[.82,.758],[.70,.748],[.56,.738],[.44,.733],[.34,.734],[.285,.742],[.272,.770]];
// The amber turn-signal strip along the upper outer edge of the US lamp.
const INDICATOR=[[.600,.831],[.70,.830],[.79,.822],[.86,.805],[.900,.786],[.880,.778],[.80,.796],[.70,.808],[.600,.813]];
const REFLECTORS=[[.555,.782,.044],[.390,.784,.046]];
function headlamp(r,side){
  const lens=onNose(side,.006),housing=onNose(side,-.004),seat=onNose(side,0);
  // Dark recess in the body and the grey housing behind the clear cover.
  patch(r,HEADLAMP,housing,HOUSING);
  band(r,densify(HEADLAMP).map(seat),densify(HEADLAMP).map(housing),'#2a3236');
  for(const [cy,cz,rad] of REFLECTORS){
    // Each reflector: a polished bowl with a dark centre and a bright rim ring.
    const rings=[1,.86,.62,.36].map(k=>circle(cy,cz,rad*k).map(onNose(side,-.004+.002*(1-k))));
    band(r,rings[0],rings[1],i=>i%6<3?'#d9dfdf':'#b7c0c1');
    band(r,rings[1],rings[2],'#9aa4a6');
    band(r,rings[2],rings[3],'#d1d7d6');
    fan(r,onNose(side,.001)([cy,cz]),rings[3],'#3a4245');
  }
  // Clear cover over the whole lamp.
  patch(r,HEADLAMP,lens,'#dfe7ea',.18);
  band(r,densify(HEADLAMP).map(lens),densify(HEADLAMP).map(seat),'#1d2427');
}
function cornerIndicator(r,side){
  patch(r,INDICATOR,onNose(side,.002),'#e08a22');
  patch(r,INDICATOR,onNose(side,.005),'#f3b356',.30);
}
// Kidneys: the chrome surrounds and black slats sit in the hood's nose and lift
// with it.
const KIDNEY=[[.034,.716],[.214,.716],[.236,.728],[.248,.790],[.240,.826],[.218,.836],[.044,.836],[.030,.826],[.026,.740]];
function kidneys(r,side){
  const outline=KIDNEY.map(([y,z])=>[y,z]),seat=onNose(side,.002),front=onNose(side,.016),inner=onNose(side,.003);
  const ring=densify(outline,.01),k=.84,c=centroid(outline);
  const innerRing=ring.map(([y,z])=>[c[0]+(y-c[0])*k,c[1]+(z-c[1])*(k+.04)]);
  band(r,ring.map(seat),ring.map(front),'#9aa3a3');
  band(r,ring.map(front),innerRing.map(front),i=>i%4<2?CHROME:'#e2e7e5');
  band(r,innerRing.map(front),innerRing.map(inner),'#7f898a');
  patch(r,innerRing,onNose(side,-.004),BLACK);
  // Vertical slats, slightly proud of the dark backing.
  for(let k2=0;k2<9;k2++){
    const y=mix(.050,.232,(k2+.5)/9);
    const zs=[.730,.824];
    const p=onNose(side,.010),q=onNose(side,.002);
    poly(r,[p([y-.0045,zs[0]]),p([y+.0045,zs[0]]),p([y+.0045,zs[1]]),p([y-.0045,zs[1]])],'#2d3538');
    poly(r,[q([y-.0045,zs[0]]),p([y-.0045,zs[0]]),p([y-.0045,zs[1]]),q([y-.0045,zs[1]])],'#3c4447');
  }
}
function roundel(r,center,normal,up,rad){
  // The BMW roundel: chrome rim, black ring, and the blue and white quarters.
  const across=[normal[1]*up[2]-normal[2]*up[1],normal[2]*up[0]-normal[0]*up[2],normal[0]*up[1]-normal[1]*up[0]];
  const at=(a,k,lift)=>center.map((v,i)=>v+(Math.cos(a)*across[i]+Math.sin(a)*up[i])*rad*k+normal[i]*lift);
  const ring=(k,lift)=>Array.from({length:32},(_,i)=>at(i/32*T,k,lift));
  band(r,ring(1,.002),ring(.92,.003),CHROME);
  band(r,ring(.92,.003),ring(.64,.003),'#15191b');
  for(let q=0;q<4;q++){
    const pts=[at(0,0,.0035)];for(let i=0;i<=8;i++)pts.push(at((q+i/8)*T/4,.64,.0035));
    poly(r,pts,q%2?'#f4f6f5':'#2f6fb4');
  }
}
function frontBumper(r,paint){
  // Trim on the bumper face may not stand ahead of the nose or wider than the body:
  // the bumper skin itself sets the 4,488-mm length and 1,757-mm body width.
  const inside=([x,y,z])=>[Math.max(x,NOSE),clamp(y,-BODY_HALF,BODY_HALF),z];
  const poly=(r,pts,color)=>r.polygon(pts.map(inside),color,false);
  const onN=(side,lift)=>q=>inside(onNose(side,lift)(q));
  for(const side of [-1,1]){
    const lift=onN;
    // The painted bumper's horizontal crease and the US front plate bracket.
    const strip=[];for(let y=0;y<=1.05;y+=.02)strip.push(y);
    for(let i=1;i<strip.length;i++){
      const a=strip[i-1],b=strip[i],k=lift(side,.001);
      poly(r,[k([a,.598]),k([b,.598]),k([b,.606]),k([a,.606])],paintShade(paint,[-.5,0,-.85]));
    }
    patch(r,[[0,.470],[.165,.470],[.172,.478],[.172,.578],[.165,.586],[0,.586]],onN(side,.004),'#1b2124');
    // Centre intake with two horizontal bars, outer openings with the fog lamps.
    const centre=[[0,.340],[.44,.344],[.47,.360],[.47,.440],[.45,.452],[0,.452]];
    patch(r,centre,onN(side,-.002),BLACK);
    band(r,densify(centre,.02).map(onN(side,.002)),densify(centre,.02).map(onN(side,-.002)),'#2a3235');
    for(const z of [.372,.410]){
      const p=onN(side,.001);
      for(let y=0;y<.45;y+=.03)poly(r,[p([y,z]),p([y+.03,z]),p([y+.03,z+.012]),p([y,z+.012])],'#3a4346');
    }
    const outer=[[.540,.350],[.760,.360],[.800,.385],[.800,.460],[.760,.475],[.540,.468],[.522,.448],[.522,.368]];
    patch(r,outer,onN(side,-.002),BLACK);
    band(r,densify(outer,.02).map(onN(side,.002)),densify(outer,.02).map(onN(side,-.002)),'#2a3235');
    // Lower lip in black.
    const lipLo=.292,lipHi=.314;
    for(let i=1;i<strip.length;i++){
      const a=strip[i-1],b=strip[i],p=onN(side,.001);
      poly(r,[p([a,lipLo]),p([b,lipLo]),p([b,lipHi]),p([a,lipHi])],'#20282b');
    }
    // Amber side marker on the bumper corner.
    const sm=e90SkinPoint(-1.975,.585,side),sx=sm[0],sz=sm[2];
    const marker=Array.from({length:16},(_,i)=>{const a=i/16*T;const p=e90SkinPoint(sx+.030*Math.cos(a),sz+.010*Math.sin(a),side);return [p[0],p[1]+side*.003,p[2]];});
    r.tag('lighting.indicator',()=>fan(r,[sx,sm[1]+side*.004,sz],marker,'#d9862a'));
  }
}
function fogLamps(r,side){
  const cy=.680,cz=.413;
  const rings=[.050,.044,.030,.012].map((rad,k)=>circle(cy,cz,rad).map(onNose(side,-.001+.0015*k)));
  band(r,rings[0],rings[1],'#4c5558');
  band(r,rings[1],rings[2],'#cfd6d6');
  band(r,rings[2],rings[3],'#e7ecec');
  fan(r,onNose(side,.004)([cy,cz]),rings[3],'#f6f8f3');
  const lens=circle(cy,cz,.044).map(onNose(side,.006));
  fan(r,onNose(side,.006)([cy,cz]),lens,'#e9eff0');
  r.faces.slice(-lens.length).forEach(f=>f.opacity=.22);
}
function repeater(r,side){
  // Amber side repeater on the wing, ahead of the door.
  const c=e90SkinPoint(-.985,.785,side);
  const ring=Array.from({length:18},(_,i)=>{const a=i/18*T;const p=e90SkinPoint(c[0]+.032*Math.cos(a),c[2]+.0085*Math.sin(a),side);return [p[0],p[1]+side*.003,p[2]];});
  fan(r,[c[0],c[1]+side*.0045,c[2]],ring,'#e2892a');
}

// ---- Rear -----------------------------------------------------------------------
// Outer lamp on the quarter: its top follows the lid line, its outer end wraps the
// corner and tapers along the side. The inner lamp on the lid carries the reverse
// light in its upper inboard part.
const OUTER_TAIL=[[.610,.985],[.720,.984],[.800,.978],[.880,.962],[.980,.938],[1.040,.915],[1.030,.890],[.940,.892],[.860,.880],[.780,.866],[.700,.860],[.610,.860]];
const OUTER_AMBER=[[.640,.952],[.760,.950],[.860,.938],[.860,.918],[.760,.926],[.640,.928]];
const INNER_TAIL=[[.400,.982],[.605,.985],[.605,.888],[.430,.888],[.400,.905]];
const REVERSE=[[.418,.974],[.600,.976],[.600,.948],[.410,.946]];
function tailOuter(r,side){
  const seat=onTail(side,0),deep=onTail(side,-.004);
  patch(r,OUTER_TAIL,deep,'#5d1414');
  band(r,densify(OUTER_TAIL).map(seat),densify(OUTER_TAIL).map(deep),'#2a1416');
  patch(r,OUTER_TAIL,onTail(side,.002),'#b8221f');
  patch(r,OUTER_AMBER,onTail(side,.003),'#e0782a');
  // Horizontal optic ribs.
  for(const z of [.880,.900,.966])for(let y=.62;y<.86;y+=.04){
    const p=onTail(side,.0035);poly(r,[p([y,z]),p([y+.036,z]),p([y+.036,z+.004]),p([y,z+.004])],'#ce3a33');
  }
}
function tailInner(r,side,reverse){
  if(reverse){patch(r,REVERSE,onTail(side,.003),'#e9ecea');return;}
  const seat=onTail(side,0),deep=onTail(side,-.004);
  patch(r,INNER_TAIL,deep,'#5d1414');
  band(r,densify(INNER_TAIL).map(seat),densify(INNER_TAIL).map(deep),'#2a1416');
  patch(r,INNER_TAIL,onTail(side,.002),'#b8221f');
}
function rearLid(r,paint){
  // Plate recess with the chrome trim bar above it, the roundel, badge and lock.
  const side=1,recess=[[-.200,.730],[.200,.730],[.212,.742],[.212,.868],[.200,.878],[-.200,.878],[-.212,.868],[-.212,.742]];
  const mapS=([y,z],lift)=>skinAt(tailS(Math.abs(y)),z,y<0?-1:1,lift+BASE+.014);
  const ring=densify(recess,.02);
  band(r,ring.map(p=>mapS(p,0)),ring.map(p=>mapS(p,-.014)),paintShade(paint,[.4,0,-1]));
  const c=mapS([0,.80],-.014);
  for(let i=0;i<ring.length;i++)poly(r,[c,mapS(ring[i],-.014),mapS(ring[(i+1)%ring.length],-.014)],paintShade(paint,[1,0,-.35]));
  // US plate, 12 × 6 in.
  const plate=[[-.1525,.654],[.1525,.654],[.1525,.806],[-.1525,.806]].map(([y,z])=>[y,z-.0]);
  const pz=.800,pts=[[-.1525,pz-.076],[.1525,pz-.076],[.1525,pz+.076],[-.1525,pz+.076]].map(p=>mapS(p,-.010));
  poly(r,pts,'#e8ebe9');
  for(const [y0,y1,z0,z1,col] of [[-.15,.15,pz+.050,pz+.064,'#2d4f8a'],[-.11,.11,pz-.020,pz+.020,'#8a2a2a']])
    poly(r,[[y0,z0],[y1,z0],[y1,z1],[y0,z1]].map(p=>mapS(p,-.009)),col);
  void plate;
  // Chrome strip across the lid between the inner lamps.
  for(let k=0;k<20;k++){
    const y0=-.390+k*.039,y1=y0+.039,p=q=>mapS(q,.004);
    poly(r,[p([y0,.884]),p([y1,.884]),p([y1,.894]),p([y0,.894])],k%2?CHROME:'#e3e8e6');
  }
  const top=skinAt(tailS(0),.930,side,.001),n=[1,0,0];
  roundel(r,top,n,[0,0,1],.036);
  // "328xi" script on the right of the lid.
  for(let k=0;k<5;k++){const y=.250+k*.026;poly(r,[[y,.912],[y+.018,.912],[y+.018,.930],[y,.930]].map(p=>mapS(p,.003)),CHROME);}
  const lock=Array.from({length:14},(_,i)=>[.250+.010*Math.cos(i/14*T),.800+.010*Math.sin(i/14*T)]);
  fan(r,mapS([.250,.800],.004),lock.map(p=>mapS(p,.003)),'#9aa3a2');
}
function rearBumper(r,paint){
  // As at the front, trim may not stand behind the tail or wider than the body.
  const inside=([x,y,z])=>[Math.min(x,TAIL),clamp(y,-BODY_HALF,BODY_HALF),z];
  const poly=(r,pts,color)=>r.polygon(pts.map(inside),color,false);
  const onT=(side,lift)=>q=>inside(onTail(side,lift)(q));
  for(const side of [-1,1]){
    const strip=[];for(let y=0;y<=1.05;y+=.02)strip.push(y);
    for(let i=1;i<strip.length;i++){
      const a=strip[i-1],b=strip[i],p=onT(side,-.003),q=onT(side,.001);
      // Dark recessed band under the lid and the lower diffuser lip.
      // Shut line under the lid, the black diffuser and the bumper crease.
      poly(r,[p([a,.692]),p([b,.692]),p([b,.704]),p([a,.704])],'#1f272a');
      const l=onT(side,.001);
      poly(r,[l([a,.312]),l([b,.312]),l([b,.372]),l([a,.372])],'#1d2528');
      const k=onT(side,.004);
      poly(r,[k([a,.534]),k([b,.534]),k([b,.546]),k([a,.546])],paintShade(paint,[.6,0,-.8]));
    }
    // Red reflectors low in the corners.
    // Red reflectors low in the corners (passive, so part of the bumper).
    patch(r,[[.58,.452],[.76,.452],[.76,.470],[.58,.470]],onT(side,.003),'#a31e1e');
  }
}

export function buildE90Ends(outer,paint){
  // Every fitting stays inside the published length and body width; the lamps
  // that wrap the corners are trimmed to the skin's outer edge.
  const r=Object.create(outer);
  r.polygon=(points,...rest)=>outer.polygon.call(r,points.map(([x,y,z])=>[clamp(x,NOSE,TAIL),clamp(y,-BODY_HALF,BODY_HALF),z]),...rest);
  panel(r,'front-bumper',[-.52,0,-.10],'body.front-bumper',()=>frontBumper(r,paint));
  panel(r,'rear-bumper',[.52,0,-.10],'body.rear-bumper',()=>rearBumper(r,paint));
  panel(r,'bonnet',[0,0,.71],'body.hood',()=>{
    for(const s of [-1,1])atSide(r,s,()=>r.tag('body.kidneys',()=>kidneys(r,s)));
    // The roundel sits on the hood's leading slope, centred above the kidneys.
    const at=skinAt(0,.840,1,BASE+.001),out=skinAt(0,.840,1,BASE+.011);
    const normal=out.map((v,i)=>(v-at[i])/.010),up=[normal[2],0,-normal[0]];
    roundel(r,[at[0],0,at[2]],normal,up,.034);
  });
  deckPanel(r,false,()=>{
    rearLid(r,paint);
    // The inner lens rides on the lid and carries the reverse light.
    for(const s of [-1,1])atSide(r,s,()=>r.tag('lighting.reverse',()=>{tailInner(r,s,false);tailInner(r,s,true);}));
  });
  for(const s of [-1,1])atSide(r,s,()=>{
    r.tag('lighting.headlamp',()=>headlamp(r,s));
    r.tag('lighting.indicator',()=>cornerIndicator(r,s));
    r.tag('lighting.fog',()=>fogLamps(r,s));
    r.tag('lighting.repeater',()=>repeater(r,s));
    r.tag('lighting.tail',()=>tailOuter(r,s));
  });
}
