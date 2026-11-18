import {driverControls,fittedWindow} from './exterior-trim.js';
import {glazingFace} from './surface-materials.js';
// Wheel centres and body stations are in metres. Each removable panel is generated
// inside one rigid transform, including the trim and glass mounted on that panel.
export const tint=(hex,factor)=>'#'+[1,3,5].map(start=>Math.min(255,Math.max(0,Math.round(parseInt(hex.slice(start,start+2),16)*factor))).toString(16).padStart(2,'0')).join('');
const SEAL='#242c30',TRIM='#343b3f',LINER='#494d49';
const fixed=[0,0,0];
const mix=(a,b,t)=>a+(b-a)*t;
const face=(r,points,color)=>r.polygon(points,color,false);
const draw=(r,id,fn)=>r.tag(id,fn);
export function panel(r,name,offset,id,fn){r.rigid(name,offset,()=>draw(r,id,fn));}
function sidePanel(r,which,side,id,fn){
 const offset=which==='front-door'?[-.12,side*.58,.035]:which==='rear-door'?[.12,side*.74,.055]:fixed;
 panel(r,which+(side<0?'-left':'-right'),offset,id,fn);
}
export function deckPanel(r,hatch,fn){
 panel(r,hatch?'hatch':'trunk-lid',hatch?[.32,0,.66]:[.20,0,.47],'body.deck',fn);
}
function section(stations,x){
 let i=0;while(i<stations.length-2&&x>stations[i+1][0])i++;
 const [a,wa,za]=stations[i],[b,wb,zb]=stations[i+1],t=Math.max(0,Math.min(1,(x-a)/(b-a)));
 return [mix(wa,wb,t),mix(za,zb,t)];
}
function sidePiece(cfg,x){
 const [front,middle,rear]=cfg.door;
 if(x>=front&&x<middle)return 'front-door';
 if(rear&&x>=middle&&x<rear)return 'rear-door';
 return 'shell';
}
function partId(piece,side){
 if(piece==='front-door')return side<0?'body.door':'body.front-right';
 if(piece==='rear-door')return side<0?'body.rear-door':'body.rear-right';
 return 'body.structure';
}
function lowerEdge(cfg,x){
 let bottom=cfg.lowerHem?cfg.lowerHem(x):cfg.base;
 for(const axle of [-cfg.wb/2,cfg.wb/2]){
  const t=Math.abs(x-axle);
  if(t<cfg.arch)bottom=Math.max(bottom,cfg.axleZ+Math.sqrt(cfg.arch*cfg.arch-t*t));
 }
 return bottom;
}
function creasePoint(cfg,side,x,z){
 const [w,top]=section(cfg.stations,x);
 const level=Math.max(0,Math.min(1,(z-cfg.base)/(top-cfg.base)));
 // Convex door face above a lower rocker tuck, with a softer waist on the Honda.
 const y=cfg.sideSection?cfg.sideSection(w,level):w-.032*(1-level)**2+.009*Math.sin(level*Math.PI)-.034*Math.max(0,(level-.86)/.14);
 return [cfg.sideStation?cfg.sideStation(x,z):x,side*y,z];
}
function trimmedX(cfg,x,towards){
 return cfg.door.some(edge=>Math.abs(edge-x)<.001)?x+towards*.004:x;
}
function skin(r,cfg,paint){
 const ends=cfg.stations.map(s=>s[0]),cuts=new Set([...ends,...cfg.door,cfg.hoodEnd,cfg.deckStart]);
 for(let x=ends[0];x<ends.at(-1);x+=.11)cuts.add(+x.toFixed(6));
 for(const ax of [-cfg.wb/2,cfg.wb/2])for(let i=0;i<=30;i++)cuts.add(+(ax+Math.cos(i*Math.PI/30)*cfg.arch).toFixed(6));
 const xs=[...cuts].sort((a,b)=>a-b);
 for(let i=1;i<xs.length;i++){
  const x0=xs[i-1],x1=xs[i];if(x1-x0<.0002)continue;
  const a=trimmedX(cfg,x0,1),b=trimmedX(cfg,x1,-1);if(a>=b)continue;
  const mid=(a+b)/2,piece=sidePiece(cfg,mid),[w,z]=section(cfg.stations,a),[ww,zz]=section(cfg.stations,b);
  const bodyA=lowerEdge(cfg,a),bodyB=lowerEdge(cfg,b);
  const bottom=piece!=='shell'&&cfg.doorSill?Math.max(bodyA,cfg.doorSill):bodyA;
  const bottomB=piece!=='shell'&&cfg.doorSill?Math.max(bodyB,cfg.doorSill):bodyB;
  for(const side of [-1,1]){
   // The fender and rear quarter are separate stationary panels on opposite
   // sides of a door opening. A combined bounds box would fill that doorway.
   const mount=piece==='shell'?(mid<cfg.door[0]?'front-fender':'rear-quarter'):piece;
   sidePanel(r,mount,side,partId(piece,side),()=>{
    const levels=cfg.sideLevels??(cfg.cladding?[0,.16,.38,.68,.86,1]:[0,.12,.38,.72,.86,1]);
    for(let j=1;j<levels.length;j++){
     const p=(x,h,t,low)=>creasePoint(cfg,side,x,Math.max(mix(cfg.base,h,t),low));
     if(mix(cfg.base,z,levels[j])<=bottom&&mix(cfg.base,zz,levels[j])<=bottomB)continue;
     const color=cfg.bandColor?.(mid,j)??(cfg.cladding&&j===1?(cfg.claddingColor??TRIM):tint(paint,(cfg.sideTints??[.68,.85,.91,1.00,1.07])[j-1]*(side<0?.95:1)));
     face(r,[p(a,z,levels[j-1],bottom),p(b,zz,levels[j-1],bottomB),p(b,zz,levels[j],bottomB),p(a,z,levels[j],bottom)],color);
    }
    if(mid>=cfg.hoodEnd&&mid<cfg.deckStart){
     const shoulder=(x,h)=>{const p=creasePoint(cfg,side,x,h);return [x,side*(cfg.cabinWidth-.006),h+.005];};
     face(r,[creasePoint(cfg,side,a,z),creasePoint(cfg,side,b,zz),shoulder(b,zz),shoulder(a,z)],tint(paint,1.085));
    }
    if(piece!=='shell'){
     // Painted hem and door card directly behind the skin become visible when
     // the door moves. They terminate at the same real wheel openings.
     const edgeA=creasePoint(cfg,side,a,bottom),edgeB=creasePoint(cfg,side,b,bottomB);
     const inner=(x,y,z)=>[x,y-side*.076,z];
     const topA=creasePoint(cfg,side,a,z),topB=creasePoint(cfg,side,b,zz);
     face(r,[inner(...edgeA),inner(...edgeB),inner(...topB),inner(...topA)],LINER);
     face(r,[topA,topB,inner(...topB),inner(...topA)],SEAL);
     face(r,[edgeA,edgeB,inner(...edgeB),inner(...edgeA)],tint(paint,.68));
     for(const [x,lo,hi] of [[x0,edgeA,topA],[x1,edgeB,topB]])
      if(cfg.door.some(edge=>Math.abs(edge-x)<.001))face(r,[lo,hi,inner(...hi),inner(...lo)],tint(paint,.74));
    }
    if(cfg.rubstrip&&mid>-1.97&&mid<1.93){
     const p=(x,h)=>{const q=creasePoint(cfg,side,x,h);q[1]+=side*.005;return q;};
     const low=cfg.rubHeight??.635,high=low+.025;
     if(bottom<low&&bottomB<low)face(r,[p(a,low),p(b,low),p(b,high),p(a,high)],cfg.paintedRub?tint(paint,.80):SEAL);
    }
   });
   if(piece!=='shell'&&cfg.doorSill){
    draw(r,'body.structure',()=>{
     const p=(x,z)=>creasePoint(cfg,side,x,z);
     const ha=bottom-.005,hb=bottomB-.005;
     face(r,[p(a,bodyA),p(b,bodyB),p(b,hb),p(a,ha)],tint(paint,.83));
     const pa=p(a,ha),pb=p(b,hb),inset=q=>[q[0],q[1]-side*.052,q[2]-.004];
     face(r,[pa,pb,inset(pb),inset(pa)],tint(paint,.93));
    });
   }
   // Fixed narrow fender returns meet the bonnet or deck lid while leaving
   // the engine bay and passenger compartment genuinely open.
   if(mid<cfg.hoodEnd||mid>=cfg.deckStart){
    const cap=(x,sw,h)=>[x,side*(sw-.034),h];
    const inset=(x,sw,h)=>[x,side*(sw*(mid<cfg.hoodEnd?cfg.hoodFrac:.78)),h+.016];
    draw(r,'body.structure',()=>face(r,[cap(a,w,z),cap(b,ww,zz),inset(b,ww,zz),inset(a,w,z)],tint(paint,1.05)));
   }
  }
  if(mid<cfg.hoodEnd||(!cfg.hatch&&mid>=cfg.deckStart)){
   const isHood=mid<cfg.hoodEnd,frac=isHood?cfg.hoodFrac:.78;
   const top=()=>{for(const s of [-1,1]){
    const lanes=isHood&&cfg.hoodLanes?cfg.hoodLanes:[0,.55,1];
    for(let k=1;k<lanes.length;k++){
     const lo=lanes[k-1],hi=lanes[k];
     const p=(x,sw,h,t)=>[x,s*(sw*frac-.008)*t,h+.016+(isHood&&cfg.hoodCrown!=null?cfg.hoodCrown:.036)*(1-t*t)+(isHood&&cfg.hoodPress?cfg.hoodPress(t):0)];
     face(r,[p(x0,...section(cfg.stations,x0),lo),p(x1,...section(cfg.stations,x1),lo),p(x1,...section(cfg.stations,x1),hi),p(x0,...section(cfg.stations,x0),hi)],tint(paint,(s<0?1.11:1.17)-.035*lo+(isHood&&cfg.hoodPress&&lo===.68?.045:0)));
    }
   }};
   if(isHood)panel(r,'bonnet',[0,0,.71],'body.hood',top);else deckPanel(r,cfg.hatch,top);
  }
 }
 // Rounded, stepped end caps behind the separately constructed lamp assemblies.
 for(const end of cfg.customEnds?[]:[0,-1]){
  const [x,w,z]=cfg.stations.at(end),direction=end===0?-1:1;
  draw(r,'body.structure',()=>{for(const s of [-1,1]){
   const arc=(f,h)=>[x-direction*(.075*f**4+.04*(1-h)),s*w*f,mix(cfg.base,z,h)];
   for(let i=0;i<6;i++){const a=i/6,b=(i+1)/6;for(const [c,d] of [[0,.26],[.26,.61],[.61,1]])face(r,[arc(a,c),arc(b,c),arc(b,d),arc(a,d)],tint(paint,.72+.13*d));}
  }for(const s of [-1,1]){
   const edge=(level)=>[x,s*w*(.965+.016*Math.sin(level*Math.PI)),mix(cfg.base,z,level)];
   const cap=(level)=>[x-direction*(.075+.04*(1-level)),s*w,mix(cfg.base,z,level)];
   for(const [lo,hi] of [[0,.26],[.26,.61],[.61,1]])face(r,[cap(lo),edge(lo),edge(hi),cap(hi)],tint(paint,.75+.16*hi));
  }});
 }
 for(const ax of [-cfg.wb/2,cfg.wb/2])for(const side of [-1,1]){
  for(let i=0;i<42;i++){
   const a=i/42*Math.PI,b=(i+1)/42*Math.PI,ring=(angle,rad)=>{const x=ax+Math.cos(angle)*rad;return[x,side*(section(cfg.stations,x)[0]+(cfg.archReturn??.003)),cfg.axleZ+Math.sin(angle)*rad];};
   const middleX=ax+Math.cos((a+b)/2)*cfg.arch,which=sidePiece(cfg,middleX);
   const mount=which==='shell'?(middleX<cfg.door[0]?'front-fender':'rear-quarter'):which;
   sidePanel(r,mount,side,partId(which,side),()=>{
    const p=ring(a,cfg.arch),q=ring(b,cfg.arch);
    face(r,[p,q,[q[0],q[1]-side*.067,q[2]],[p[0],p[1]-side*.067,p[2]]],SEAL);
    const lip=cfg.cladding?(cfg.claddingLip??.028):.009;
    face(r,[p,q,ring(b,cfg.arch+lip),ring(a,cfg.arch+lip)],cfg.cladding?(cfg.claddingColor??TRIM):tint(paint,.93));
   });
  }
 }
}
function mirror(r,cfg,side,x,z,paint){
 const width=section(cfg.stations,x)[0],yc=side*(width+.064);
 r.rod([x+.03,side*(width-.056),z-.045],[x,yc,z],.024,SEAL,10);
 const points=[[-.116,0],[-.086,.053],[.015,.074],[.116,.051],[.129,-.011],[.073,-.038],[-.073,-.035]];
 const ring=(y,k)=>points.map(([xx,zz])=>[x+xx*k,y,z+zz*k]);
 const outer=ring(yc+side*.070,.86),mid=ring(yc,1),inner=ring(yc-side*.072,.86);
 for(const [a,b] of [[inner,mid],[mid,outer]])for(let i=0;i<a.length;i++)face(r,[a[i],a[(i+1)%a.length],b[(i+1)%a.length],b[i]],tint(i>3?SEAL:paint,i<3?1.09:.78));
 face(r,outer,tint(paint,.85));face(r,inner,SEAL);
 face(r,[[x+.124,yc-side*.051,z-.012],[x+.124,yc+side*.046,z-.009],[x+.113,yc+side*.043,z+.046],[x+.113,yc-side*.047,z+.051]],'#91a5a6');
}
function cabin(r,cfg,paint){
 const {wind,roof,rear,frontWindow,rearWindow,quarter,door,base,cabinWidth,roofWidth}=cfg;
 const crown=cfg.roofCrown??.022;
 const roofHalf=x=>{
  const center=(roof[0][0]+roof.at(-1)[0])/2,span=(roof.at(-1)[0]-roof[0][0])/2;
  return roofWidth-(cfg.roofPinch||0)*Math.min(1,((x-center)/span)**2);
 };
 const v=(x,z,s)=>{
  let i=1;while(i<roof.length-1&&x>roof[i][0])i++;
  const [a,h]=roof[i-1],[b,k]=roof[i];
  const roofEdge=mix(h,k,Math.max(0,Math.min(1,(x-a)/(b-a))));
  const height=Math.max(0,Math.min(1,(z-cfg.belt)/(roofEdge-cfg.belt)));
  return [x,s*(mix(cabinWidth,roofHalf(x),height)+(cfg.sideRound||0)*Math.sin(Math.PI*height)),z];
 };
 const pair=(p,s)=>v(p[0],p[1],s);
 const line=(a,b,s,rad,color)=>r.rod(pair(a,s),pair(b,s),rad,color,8);
 for(const side of [-1,1]){
  for(const [piece,win] of [['front-door',frontWindow],['rear-door',rearWindow],['quarter',quarter]]){
   if(!win)continue;const movable=piece!=='quarter';
   sidePanel(r,piece,side,movable?partId(piece,side):'body.structure',()=>{
    const outline=win.map(p=>pair(p,side));
    if(piece==='quarter'&&cfg.drawQuarter)cfg.drawQuarter(r,side,outline);
    else draw(r,'body.glass',()=>fittedWindow(r,outline,{
     privacy:!!cfg.cladding&&piece!=='front-door',radius:cfg.coupe?.028:.046,seal:cfg.coupe?.006:.011,
     tone:cfg.windowGlass?.[piece==='front-door'?'front':'privacy'],
     sideCrown:side*(piece==='quarter'?.004:.010),frameless:cfg.coupe&&piece==='front-door'
    }));
    const color=cfg.cladding?SEAL:'#a7b0b1';
    if(cfg.windowSurround){
     if(piece==='front-door')line(win.at(-1),win[0],side,.005,TRIM);
    }else for(let i=win.length-1;i>=3;i--)line(win[i],win[(i+1)%win.length],side,.007,color);
    if(!cfg.coupe)line(win[1],win[2],side,.008,SEAL);
    if(piece==='front-door'){
     if(cfg.drawMirror)cfg.drawMirror(r,side,paint);
     else mirror(r,cfg,side,cfg.mirrorX??door[0]+.18,cfg.belt+.041,paint);
    }
    if(movable&&cfg.doorHandle){cfg.doorHandle(r,side,paint);}
    else if(movable){
     const x=(piece==='front-door'?door[1]:door[2])-.20,z=section(cfg.stations,x)[1]-.093;
     const p=creasePoint(cfg,side,x,z);p[1]+=side*.013;
     r.rod([x-.063,p[1],z],[x+.067,p[1],z],.017,SEAL,8);
     r.rod([x-.06,p[1]+side*.009,z+.001],[x+.06,p[1]+side*.009,z+.001],.014,cfg.metalHandles?'#a5adae':tint(paint,1.15),10);
    }
   });
  }
  if(cfg.windowSurround){cfg.windowSurround(r,side,(xz)=>pair(xz,side),paint);continue;}
  const surround=(quad,color)=>draw(r,'body.structure',()=>face(r,quad.map(p=>pair(p,side)),color));
  // cfg.blackouts: (x,z) outlines of black pillar appliques, laid just proud of the cabin side.
  for(const outline of cfg.blackouts||[])draw(r,'body.structure',()=>face(r,outline.map(p=>{const q=pair(p,side);q[1]+=side*.004;return q;}),TRIM));
  surround([wind[0],wind[1],frontWindow[1],frontWindow[0]],cfg.aPillarColor??tint(paint,1.1));
  const last=quarter||rearWindow,topEnd=last[2];
  for(let i=1;i<roof.length;i++){
   // cfg.windowTopLine: (x,z) points along the window frames, so the roof rail
   // stops at the real daylight opening instead of a straight chord.
   const inset=p=>{const t=(p[0]-roof[0][0])/(roof.at(-1)[0]-roof[0][0]),x=mix(frontWindow[1][0],topEnd[0],t);
    const line=cfg.windowTopLine;if(!line)return [x,mix(frontWindow[1][1],topEnd[1],t)];
    let k=1;while(k<line.length-1&&x>line[k][0])k++;const [a,h]=line[k-1],[b,g]=line[k];return [x,mix(h,g,Math.max(0,Math.min(1,(x-a)/(b-a))))];};
   surround([roof[i-1],roof[i],inset(roof[i]),inset(roof[i-1])],tint(paint,1.02));
  }
  surround([roof.at(-1),rear[1],last[3],topEnd],tint(paint,.94));
  const next=rearWindow||quarter;
  surround([frontWindow[3],frontWindow[2],next[1],next[0]],SEAL);
  if(rearWindow&&quarter)surround([rearWindow[3],rearWindow[2],quarter[1],quarter[0]],SEAL);
 }
 // Across-car glass has a dark ceramic edge and a softly crowned surface.
 // Generate that edge as a ring around the pane so neither material overlaps.
 const transverseGlass=(start,end,back=false)=>{
  const point=(u,v,lift=0)=>{
   const longitudinal=mix(start[0],end[0],v),height=mix(start[1],end[1],v);
   const half=Math.abs(pair([longitudinal,height],1)[1]),across=1-u*u;
   // Screen bows in plan. Upper edge shares the transverse roof crown;
   // cowl drops toward the center to retain the correct daylight opening.
   const atRoof=back?1-v:v;
   const sweep=(back?1:-1)*(cfg.screenSweep??.045)*across*(.65+.35*Math.sin(Math.PI*v));
   const x=longitudinal+sweep*(1-atRoof);
   const z=height+across*mix(-.027,crown,atRoof)+lift;
   return [x,u*half,z];
  };
  const us=[-1,-.968,-.84,-.67,-.46,-.23,0,.23,.46,.67,.84,.968,1],vs=[0,.035,.25,.50,.74,.965,1];
  for(let i=1;i<us.length;i++)for(let j=1;j<vs.length;j++){
   const a=us[i-1],b=us[i],c=vs[j-1],d=vs[j],edge=i===1||i===us.length-1||j===1||j===vs.length-1;
   const points=[point(a,c),point(b,c),point(b,d),point(a,d)];
   if(edge)face(r,points,SEAL);
   else glazingFace(r,points,tint(back&&cfg.backGlassColor?cfg.backGlassColor:!back&&cfg.windshieldGlass?cfg.windshieldGlass[0]:'#91aab4',.91+.1*c+.035*(1-Math.abs(a))),back&&cfg.cladding?(cfg.backGlassOpacity??.51):(!back&&cfg.windshieldGlass?cfg.windshieldGlass[1]:.28)+.07*d);
  }
  if(!back&&!cfg.fixedWipers){
   const lower=us.map(u=>point(u,0));
   for(let k=1;k<lower.length;k++){
    const inner=p=>[p[0]-.036,p[1],p[2]-.011];face(r,[lower[k-1],lower[k],inner(lower[k]),inner(lower[k-1])],TRIM);
   }
  }
  if(back){for(let i=1;i<=8;i++){
   const t=.07+i*.094;
   for(let j=2;j<us.length-1;j++)glazingFace(r,[point(us[j-1],t,.0017),point(us[j],t,.0017),point(us[j],t+.003,.0017),point(us[j-1],t+.003,.0017)],'#6a6060',.38);
  }}
 };
 panel(r,'windshield',[0,0,.24],'body.glass',()=>{transverseGlass(...wind);
  if(!cfg.fixedWipers)for(const y of [-.37,.30]){const [x,z]=wind[0];r.rod([x+.019,y-.16,z+.03],[x+.083,y+.127,z+.088],.007,SEAL,8);}
 });
 if(cfg.fixedWipers){
  const [x,z]=wind[0],half=Math.abs(pair(wind[0],1)[1]);
  const cowl=(u,edge)=>{
   const across=1-u*u;
   return edge?[x-(cfg.screenSweep??.045)*.65*across,u*half,z-.027*across]:[cfg.hoodEnd-.115*Math.max(0,across),u*half-.003*u,z-.045];
  };
  draw(r,'body.structure',()=>{
   for(let i=0;i<16;i++){const a=i/8-1,b=(i+1)/8-1;face(r,[cowl(a,1),cowl(b,1),cowl(b,0),cowl(a,0)],TRIM);}
   cfg.fixedWipers(r);
  });
 }

 const back=()=>draw(r,'body.glass',()=>transverseGlass(...rear,true));
 if(cfg.hatch)deckPanel(r,true,back);else panel(r,'backlight',[0,0,.25],'body.glass',back);
 const lidX={bmw325ci:.14,c63:.06,hrv:.08}[r.build?.vehicle];
 if(lidX!=null){
  const left=lidX-.32,right=lidX+.32,half=.475;
  const stops=[...new Set([...roof.map(p=>p[0]),left,right])].sort((a,b)=>a-b);
  const height=(x,y)=>{
   const n=Math.max(1,roof.findIndex(p=>p[0]>=x-1e-9));
   const [a,h]=roof[n-1],[b,k]=roof[n];
   return mix(h,k,(x-a)/(b-a))+crown*(1-(y/roofHalf(x))**2);
  };
  // Both the outer sheet and its headliner have a real opening. The movable
  // lid follows the same roof crown, including the steep forward E46 rake.
  for(let n=1;n<stops.length;n++){
   const a=stops[n-1],b=stops[n];
   const strip=(x,f)=>{const y=f*roofHalf(x);return [x,y,height(x,y)];};
   const rows=[-1,-half/roofHalf((a+b)/2),-.50,-.25,0,.25,.50,half/roofHalf((a+b)/2),1];
   for(let j=1;j<rows.length;j++){
    if(a>=left-1e-9&&b<=right+1e-9&&j>1&&j<rows.length-1)continue;
    const p=(x,k)=>k===1||k===rows.length-2?[x,k===1?-half:half,height(x,half)]:strip(x,rows[k]);
    const ring=[p(a,j-1),p(b,j-1),p(b,j),p(a,j)];
    draw(r,'body.structure',()=>{face(r,ring,cfg.moonroofFrame?(j>1&&j<rows.length-1&&b>left&&a<right?cfg.moonroofFrame:tint(paint,1.10)):tint(paint,1.10));face(r,ring.map(([x,y,z])=>[x,y,z-.009]),'#5c6162');});
   }
  }
  panel(r,'sliding-roof',[0,0,.55],'roof.glass',()=>{
   for(let i=0;i<8;i++)for(let j=0;j<8;j++){
    const point=(ix,iy)=>{const x=left+.64*ix/8,y=(iy/4-1)*half;return [x,y,height(x,y)];};
    glazingFace(r,[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)],cfg.moonroofGlass?.[0]??'#768d91',cfg.moonroofGlass?.[1]??.54);
   }
  });
 }
 else for(let i=1;i<roof.length;i++){
  const [a,za]=roof[i-1],[b,zb]=roof[i];
  draw(r,'body.structure',()=>{for(let j=0;j<10;j++){
   const p=(x,z,n)=>[x,(n/5-1)*roofHalf(x),z+crown*(1-(n/5-1)**2)];
   const skin=[p(a,za,j),p(b,zb,j),p(b,zb,j+1),p(a,za,j+1)];
   face(r,skin,tint(paint,1.06+.12*Math.sin((j+.5)/10*Math.PI)));
   const lining=skin.map(([x,y,z])=>[x,y*.993,z-.010]);
   face(r,lining,'#5c6162');
   if(j===0)face(r,[skin[0],skin[1],lining[1],lining[0]],TRIM);
   if(j===9)face(r,[skin[2],skin[3],lining[3],lining[2]],TRIM);
  }});
 }
 // A shallow passenger floor, seatbacks, dashboard and inner sills are visible
 // through the apertures left by the doors. No full-volume cabin block remains.
 if(cfg.drawCabin){cfg.drawCabin(r);return;}
 panel(r,'passenger-compartment',fixed,'body.structure',()=>{
  const floor=cfg.cabinFloor??base+.025,front=door[0]-.035,end=cfg.deckStart+.03;
  driverControls(r,[front+.337,-.366,cfg.belt-.064],cfg.coupe?.151:.162,cfg.coupe?3:4);
  r.box(front+.18,-.101,floor+.071,front+.94,.101,floor+.225,'#41484a');
  r.rod([front+.46,0,floor+.22],[front+.49,0,floor+.334],.012,'#7c898a',8);
  r.box(front+.465,-.023,floor+.324,front+.515,.023,floor+.358,'#484e4e');
  // cfg.cabin (optional): a vehicle with its own floor module keeps only a
  // cargo deck between the wheelhouses, ends the sills at the rear door and
  // places the rear bench at its real station.
  const cab=cfg.cabin;
  if(cab)r.box(cab.cargo[0],-cab.cargo[1],cab.cargo[2],end,cab.cargo[1],cab.cargo[2]+.04,TRIM);
  else r.box(front,-.70,floor,end,.70,floor+.048,TRIM);
  r.box(front-.03,-.71,cfg.belt-.14,front+.21,.71,cfg.belt-.035,'#404447');
  for(const s of [-1,1]){
   const sill=side=>[door[0],side*.755,floor+.068];
   const tip=sill(s);r.rod(tip,[cab?.sillEnd??end,tip[1],tip[2]],.043,tint(paint,.66),8);
   const y=s*.385,seat=door[0]+.43;
   r.box(seat-.16,y-.19,floor+.065,seat+.19,y+.19,floor+.177,LINER);
   r.profile([[seat+.115,floor+.135],[seat+.22,floor+.135],[seat+.32,cfg.belt-.065],[seat+.25,cfg.belt-.055]],y-.174,y+.174,LINER);
   r.box(seat+.23,y-.104,cfg.belt-.042,seat+.31,y+.104,cfg.belt+.081,LINER);
  }
  const [b0,b1,c0,c1,k0,k1]=cab?.rearSeat??[end-.31,end,floor+.09,floor+.22,end-.09,end];
  for(const s of [-1,1])r.box(k1-.079,s*.363-.095,cfg.belt-.037,k1-.003,s*.363+.095,cfg.belt+.079,LINER);
  r.box(b0,-.58,c0,b1,.58,c1,LINER);
  r.box(k0,-.58,c1-.01,k1,.58,cfg.belt-.046,LINER);
 });
}
export function coachwork(r,cfg,paint){skin(r,cfg,paint);cabin(r,cfg,paint);}
