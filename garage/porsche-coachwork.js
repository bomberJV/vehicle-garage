// Outer skin in metres. X increases from the nose to the engine. Station widths
// exclude the mirrors. Wheelbase/width/overall length anchor the loft. The panel
// sweeps, crowns and upholstery follow photographs rather than tooling drawings.
import {fixedStopLamp,washerNozzle,classicBodyTrim,classicDeckScript,classicMirror,frontSignals993,rearOptics993,classicSignalPocket,headlamp993,headlampSeat993,cowlInlet993} from './porsche993-trim.js';
import {faceTriangles} from './mesh-triangles.js';
import {headlampSeat992,rocker992,stations992,sideLevels992,spoiler992,sweep992,bonnetStart,bonnetHalfWidth,bonnetPressing,frontCrown992,door992,doorRibX,fascia992} from './porsche992-skin.js';
import {classicStations,classicSpoiler,classicGrilleSpan,sweepClassicBody,classicBonnetStart,classicBonnetWidth,classicBonnetRib,classicDoor,classicDoorHem,classicDoorRib,classicSillHeight,classicLowerBands,classicBumperInset,classicBonnetValley,drawClassicCornerVents} from './porsche993-body-profile.js';
import {draw992Headlamp,draw992RunningLamp,draw992Tail,draw992Nameplate,draw992Mirror,draw992EngineGrille} from './porsche992-exterior-trim.js';
import {panelSeam} from './porsche-panel-seams.js';
import {spoilerPoint,drawSpoilerDrive} from './porsche-spoilers.js';
import {pipe, ellipse, ellipsoid, strip, tint} from './road-primitives.js';

const TAU=Math.PI*2, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const rgb=color=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
const hex=color=>'#'+color.map(a=>Math.round(clamp(a,0,255)).toString(16).padStart(2,'0')).join('');
export const coupeShape=[
  {modern:false,width:1.735,front:-1.16,rear:1.112,frontRadius:.316,rearRadius:.314,
    screen:[-.613,-.155,1.260,.700,.577],screenFootSweep:.240,screenHeaderSweep:.065, cockpit:[-.62,.725],door:classicDoor,belt:.840,
    stations:classicStations},
  {modern:true,width:1.852,front:-1.2,rear:1.25,frontRadius:.333,rearRadius:.352,
    screen:[-.869,-.238,1.248,.755,.647],screenFootSweep:.281,screenHeaderSweep:.113,cockpit:[-.695,.84],door:door992,belt:.866,
    stations:stations992}
];

// Rows through the classic flank and over its shoulder. The 993 panels are
// continuous compound curves, so a coarse row pitch reads as flat facets.
const classicFlankLevels=[classicDoorHem,.35,.42,.49,.56,.63,.70,.755,.81,.87,.915,.96,1];
const classicShoulderRows=[.9,.8,.7,.6,.5,.4,.3,.2,.1,0];
function station(car,x){
  const rows=car.stations;let i=1;
  while(i<rows.length-1 && rows[i][0]<x)i++;
  const a=rows[i-1],b=rows[i],prev=rows[Math.max(0,i-2)],next=rows[Math.min(rows.length-1,i+1)];
  const span=b[0]-a[0],t=clamp((x-a[0])/span),t2=t*t,t3=t2*t;
  return [1,2,3].map(j=>{
    const slope=(p,c,n)=>{const d0=(c[j]-p[j])/(c[0]-p[0]),d1=(n[j]-c[j])/(n[0]-c[0]);return d0*d1>0?2/(1/d0+1/d1):0;};
    const s0=i===1?(b[j]-a[j])/span:slope(prev,a,b),s1=i===rows.length-1?(b[j]-a[j])/span:slope(a,b,next);
    return (2*t3-3*t2+1)*a[j]+(t3-2*t2+t)*span*s0+(-2*t3+3*t2)*b[j]+(t3-t2)*span*s1;
  });
}
// The bumper, glazing, lid and light edges all use the same front and rear plan sweep.
function swept(car,[x,y,z]){
  return [car.modern?sweep992(x,y):sweepClassicBody(car,x,y,z),y,z];
}
function archRadius(car,r){return r+(car.modern?.029:.055);}

function wheelCut(car,x){
  let z=car.modern?.156:.172;
  for(const [axle,r] of [[car.front,car.frontRadius],[car.rear,car.rearRadius]]){
    // Outer wheelhouse returns vertically into the sill below the axle centre.
    const rx=archRadius(car,r),d=(x-axle)/rx;
    if(Math.abs(d)<=1)z=Math.max(z,r+.003+(r+.046)*Math.sqrt(1-d*d));
  }
  return z;
}
// Ahead of the cockpit the 992's plan sweep packs up to five loft units into
// one physical unit along the outer wing. A gentle change of slope in the
// tabulated heights then becomes a knee a couple of centimetres long, which
// reads as a crease above the front wheel. Low-pass the height over a window
// that widens with that compression, so it spans about the same real length
// everywhere and vanishes where the loft is not compressed.
function top(car,x,y){
  if(!car.modern||x>=-1.0)return seatTop(car,x,y,deckRaw(car,x,y));
  const p=deckRaw(car,x,y);
  p[2]=lowPass992(x,y,v=>deckRaw(car,v,y)[2],p[2]);
  return seatTop(car,x,y,p);
}
// Binomial five-tap filter of a height along the loft, with a reach set by how
// strongly the plan sweep compresses the loft at this lateral position.
function lowPass992(x,y,height,centre){
  if(x>=-1.0)return centre;
  const e=.004,squeeze=Math.max(.15,(sweep992(x+e,y)-sweep992(x-e,y))/(2*e));
  const span=clamp(.06*(1/squeeze-1),0,.24)*clamp((-1.0-x)/.12);
  if(span<1e-4)return centre;
  return (height(x-span)+4*height(x-span/2)+6*centre+4*height(x+span/2)+height(x+span))/16;
}
function seatTop(car,x,y,p){return car.modern?headlampSeat992(p):headlampSeat993(p);}
function deckRaw(car,x,y){
  if(!car.modern)x=classicBonnetRib(x,y);
  const [w,z,c]=station(car,x),u=Math.abs(y)/w;
  // The separate fender humps flank the shallow luggage lid. Across the tail,
  // the rear deck broadens and rounds down into the side quarters.
  const crestU=car.modern?.766:.77;
  const inner=Math.min(u/crestU,1);
  const rounded=Math.sin(inner*Math.PI/2)**3.2;
  // Toward the 993's nose the luggage lid stays nearly flat across and the
  // wings rise steeply outside its shut lines to carry the headlamps.
  const haunch=car.modern?frontCrown992(x,Math.min(u,crestU),crestU,rounded):Math.sin(inner*Math.PI/2)**(3.2+11*clamp((-1.30-x)/.62)**1.5);
  const drop=clamp((u-crestU)/(.958-crestU));
  const crown=(z-c)*haunch+(car.modern?bonnetPressing(x,y):classicBonnetValley(x,y));
  const p=swept(car,[x,y,c+crown-.076*(car.modern?drop**2.65:1-Math.cos(drop*Math.PI/2))]);
  if(car.modern&&x>1.04&&u>.73){
    // The shoulder drops continuously toward the corner lamp in side elevation.
    // Position that drop in real longitudinal distance: the plan sweep compresses
    // the last several loft stations into a short stretch of rear quarter.
    const tailX=sweep992(2.279,y),run=clamp((p[0]-1.04)/(tailX-1.04));
    const crest=.938+(.820-.938)*run**1.9;
    const blend=clamp((u-.73)/.17);
    p[2]+=(crest-z)*blend*blend*(3-2*blend);
  }
  return p;
}
// Mounting geometry for accessories shares the fitted skin's coordinate frame.
export {top as porscheDeckPoint,sideRaw as porscheSidePoint};
function shoulderZ(car,x){return top(car,x,station(car,x)[0]*.958)[2];}
function sideRaw(car,x,t,s){
  const [w,crest]=station(car,x),bottom=wheelCut(car,x);
  // The flank sits further outboard than its shoulder, where the plan sweep
  // compresses the loft harder still; filter the shoulder at that position.
  // The wheel opening keeps its sharp edge.
  const shoulder=car.modern?lowPass992(x,w,v=>shoulderZ(car,v),shoulderZ(car,x)):shoulderZ(car,x);
  // A wheel arch trims the *same* flank that continues over it. Compressing
  // the door cross-section into the top of the arch leaves unnatural bands.
  const h=mix(bottom,shoulder,t),v=clamp((h-.17)/Math.max(.1,shoulder-.17));
  const inset=(car.modern?.068:.046)*(1-v)**2+.0015*(1-Math.cos(2*Math.PI*v))+.042*clamp((v-.64)/.36)**(car.modern?4.7:2);
  // The rear and front bumper covers both tuck under at the corners.
  const start=car.stations[0][0],end=car.stations.at(-1)[0];
  const fore=clamp(1-(x-start)/.36),aft=clamp(1-(end-x)/.40);
  const toe=clamp((.42-h)/.25)**1.4;
  const waist=car.modern?.014*Math.exp(-(((v-.42)/.22)**2))*clamp((x+.81)/.23)*clamp((.77-x)/.24):0;
  const p=swept(car,[x,s*(w-inset-waist-.042*clamp((v-.75)/.25)**2*(w-1)),h]);
  // The broadest point of the 993 is the rear wheel arch lip. The transition
  // fades into the rear quarter and meets the existing crown at the shoulder.
  if(!car.modern){
    const arch=Math.max(0,1-((x-car.rear)/.40)**2);
    p[1]+=s*.0139566*arch*Math.sin(Math.PI*v);
    // The door turns in beneath its belt before the lower sill flares out.
    const doorTaper=clamp((x+.79)/.23)*clamp((.82-x)/.28);
    p[1]-=s*doorTaper*(.028*(1-v)**2+.009*Math.exp(-(((v-.41)/.18)**2)));
  }
  if(car.modern){
    // The widest station on the 992.1 Cabriolet is the lip over the rear tire.
    const arch=Math.exp(-(((x-car.rear)/.38)**2));
    const blend=clamp((shoulder-h)/.084);
    const lip=Math.exp(-(((h-.716)/.113)**2))*blend*blend*(3-2*blend);
    p[1]+=s*(.00517*arch*lip-rocker992(x,h));
  }
  p[0]+=(fore*fore*.085-aft*aft*(car.modern?.110:.137))*toe;
  p[1]-=s*(fore*fore+aft*aft)*.024*toe;
  return p;
}
export {painted as paintCoach};
function painted(r,ps,paint,sign,vertexNormals){
  const [p,a,,b]=ps,ab=a.map((v,i)=>v-p[i]),ac=b.map((v,i)=>v-p[i]);
  let n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
  n=n.map(v=>v/Math.max(1e-7,Math.hypot(...n)));
  if(sign.reduce((sum,v,i)=>sum+v*n[i],0)<0)n=n.map(v=>-v);
  r.polygon(ps,coachPaintColor(paint,n),false);
  const face=r.faces?.at(-1);
  if(face){
    face.paintNormal=n;
    if(vertexNormals){face.loftNormals=vertexNormals;face.loftPaint=paint;}
  }
}
function coachPaintColor(paint,n){
  const [nx,ny,nz]=n,sky=clamp((nz+.23)/1.2),line=Math.exp(-(((nz-.36)/.21)**2));
  const soft=Math.max(0,-.28*nx+.13*ny+.89*nz),base=rgb(paint);
  // Neutral studio sky and a low side softbox give the shoulders readable curvature.
  return hex(base.map((v,i)=>v*(.67+.34*sky+.15*soft)+line*(23+i*.9)+8*sky));
}
// Take derivatives on the underlying pressed side panel at constant height.
// The wheel opening clips this surface. Its height must not rotate the normal
// of the neighboring paint, even where a triangle terminates at the arch.
function flank992(car,x,t,side){
  const at=(v,h)=>{
    const low=wheelCut(car,v),high=top(car,v,station(car,v)[0]*.958)[2];
    return sideRaw(car,v,(h-low)/(high-low),side);
  };
  const bottom=wheelCut(car,x),shoulder=top(car,x,station(car,x)[0]*.958)[2];
  const z=Math.max(bottom,mix(.156,shoulder,t));
  const p=at(x,z),h=Math.min(z,shoulder-.001),e=.0004;
  // The cap's plan sweep packs the parameter rows tightly near each bumper.
  // Sample a finite longitudinal patch so a cutout or a narrow row cannot
  // turn the reflected band through a large angle in one triangle.
  const lo=at(x-.125,h),hi=at(x+.125,h),down=at(x,h-e),up=at(x,h+e);
  const dx=hi.map((q,i)=>q-lo[i]),dh=up.map((q,i)=>q-down[i]);
  let n=[dx[2]*dh[1]-dx[1]*dh[2],dx[0]*dh[2]-dx[2]*dh[0],dx[1]*dh[0]-dx[0]*dh[1]];
  const length=Math.hypot(...n);n=n.map(c=>side*c/length);
  return {p,n};
}
function bladeSpan(car,x){
  const front=car.modern?spoiler992.front:classicSpoiler.front,back=car.modern?spoiler992.rear:classicSpoiler.rear,t=clamp((x-front)/(back-front));
  return (car.modern?.726:.548)*(.87+.13*Math.sin(t*Math.PI));
}
const stationBreaks=new Map();
function uBreaks(car){
  if(stationBreaks.has(car))return stationBreaks.get(car);
  const xs=[...car.stations.map(s=>s[0]),...car.cockpit,...car.door,...(car.modern?[bonnetStart,spoiler992.front,spoiler992.rear]:[classicBonnetStart,classicSpoiler.front,classicSpoiler.grilleFront,classicSpoiler.grilleRear,classicSpoiler.rear])];
  for(const [axle,r] of [[car.front,car.frontRadius],[car.rear,car.rearRadius]]){
    const rad=archRadius(car,r);
    for(let j=0;j<=18;j++)xs.push(axle+rad*Math.cos(j*Math.PI/18));
    xs.push(axle-rad-.003,axle+rad+.003);
  }
  const ordered=[...new Set(xs.map(x=>Math.round(x*1e7)/1e7))].sort((a,b)=>a-b);
  const result=[ordered[0]];
  // The 992 loft is shaded per vertex. Rows no more than 55 mm apart keep
  // its reflections continuous.
  const step=.055;
  for(let i=1;i<ordered.length;i++){
    // The classic skin has no feature lines to hide facets either; it uses a
    // 75 mm pitch. The headlamp seat is pressed into the front of the wing
    // and needs a closer pitch to stay smooth around the bezel.
    const gap=ordered[i]-ordered[i-1],lamp=!car.modern&&ordered[i]>-2.0&&ordered[i-1]<-1.66;
    const pitch=car.modern?step:lamp?.03:.075;
    if(gap>pitch){const n=Math.ceil(gap/pitch);for(let k=1;k<n;k++)result.push(ordered[i-1]+gap*k/n);}
    result.push(ordered[i]);
  }
  stationBreaks.set(car,result);return result;
}
function lidWidth(car,x,w,front){
  if(front)return car.modern?bonnetHalfWidth(x):classicBonnetWidth(x);
  return w*mix(.76,.83,clamp((x-1)/(car.stations.at(-1)[0]-1)));
}
function floorAndSills(r,car,paint){
  const [first,last]=[car.stations[0][0],car.stations.at(-1)[0]];
  r.tag('shell.fenders',()=>{
    const p=[[first+.18,-.55,.176],[car.front,-.52,.149],[car.front+.36,-.67,.134],[car.rear-.35,-.67,.134],[car.rear,-.53,.15],[last-.24,-.52,.18]];
    strip(r,p,p.map(([x,y,z])=>[x,-y,z]),'#303235');
    for (const [axle,rad] of [[car.front,car.frontRadius],[car.rear,car.rearRadius]])for(const s of [-1,1]){
      const ring=[];
      for(let j=0;j<=26;j++){
        const a=j*Math.PI/26,x=axle+archRadius(car,rad)*Math.cos(a)*(car.modern?1:.999999);
        ring.push(sideRaw(car,x,0,s));
      }
      const lip=ring.map(([x,y,z])=>[x,y-s*.015,z-.004]);
      const inner=ring.map(([x,,z])=>[x,s*.535,z+.006]);
      if(car.modern)strip(r,ring,lip,'#535859');
      else{
        // Rolled painted edge of the arch above its dark inner housing. It
        // curls inwards rather than widening the narrow-body Carrera fender.
        const hem=ring.map(([x,y,z],i)=>[x-(x-axle)*.012,y-s*.004,z-.0053*Math.sin(i*Math.PI/26)]);
        strip(r,ring,hem,tint(paint,.84));strip(r,hem,lip,tint(paint,.62));
      }
      strip(r,lip,inner,'#33363b');
      for(let j=0;j<26;j++)r.polygon([[axle,s*.535,.17],inner[j],inner[j+1]],'#292d31',false);
      if(!car.modern){
        // The wheelhousing continues below axle height at both ends. This
        // lower splash shield closes the view through to the opposite rocker.
        for(const j of [0,26]){
          const sign=j===0?1:-1;
          const upper=[lip[j],inner[j]],lower=upper.map(([x,y])=>[x+sign*.006,y-s*.018,.174]);
          strip(r,upper,lower,'#383b3c');
          r.polygon([inner[j],[axle,s*.535,.17],lower[1]],'#303235',false);
        }
      }
    }
  });
}
function deckPatch(car,pos,t,s,front,moves,wing){
  const w=station(car,pos)[0],outside=lidWidth(car,pos,w,front);
  const blade=(moves||(car.modern&&!front))?Math.min(outside-.003,bladeSpan(car,pos)):outside;
  return top(car,pos,s*(wing?mix(0,blade,t):mix(blade,outside,t)));
}
function lidStrip(r,car,paint,phase,a,b,s,front,moves){
  const f=(pos,t)=>{
    const point=deckPatch(car,pos,t,s,front,moves,true);
    return moves?spoilerPoint(car.modern,point,phase):point;
  };
  r.tag(moves?'shell.spoiler':front?(b<=(car.modern?bonnetStart:classicBonnetStart)?'shell.bumpers':'shell.luggage'):'shell.deck',()=>{
    const open=moves&&!car.modern&&a>=classicSpoiler.grilleFront&&b<=classicSpoiler.grilleRear;
    const paintedPoint=(pos,t)=>open?
      spoilerPoint(false,top(car,pos,s*mix(classicGrilleSpan(pos),bladeSpan(car,pos),t)),phase):f(pos,t);
    let da=paintedPoint(a,0),db=paintedPoint(b,0);
    const steps=car.modern?lidSteps992(front):open?1:8;
    for(let j=1;j<=steps;j++){
      const na=paintedPoint(a,j/steps),nb=paintedPoint(b,j/steps);
      painted(r,[da,db,nb,na],paint,[0,0,1]);da=na;db=nb;
    }
    if(!moves)return;
    const e=f(a,1),ee=f(b,1);
    const edge=[e,ee].map(([x,y,z])=>car.modern?[x,y-s*.002,z-.003]:[x,y,z]);
    strip(r,edge,edge.map(([x,y,z])=>[x,y,z-.01]),'#383d40');
    const start=car.modern?spoiler992.front:classicSpoiler.front,end=car.modern?spoiler992.rear:classicSpoiler.rear;
    if(a===start||b===end){
      const cap=a===start?a:b,rib=Array.from({length:steps+1},(_,i)=>f(cap,i/steps));
      strip(r,rib,rib.map(([x,y,z])=>[x,y,z-.013]),tint(paint,.66));
    }
  });
}
// Rows shared by the loft and both bumper covers. The covers reuse the very
// vertices on the loft's last station so the two meshes close without a crack.
const deckRows992=[.875,.75,.62,.49,.36,.22,.11,0],lidSteps992=front=>front?8:12;
function skin(r,car,paint,phase){
  const xs=uBreaks(car),[doorA,doorB]=car.door,[cabinA,cabinB]=car.cockpit;
  const sampled=new Map();
  const flankFrame=(v,t,side)=>{
    const x=doorRibX(v,t),key=[x,t,side].join('/');
    if(!sampled.has(key))sampled.set(key,flank992(car,x,t,side));
    return sampled.get(key);
  };
  for(let i=0;i<xs.length-1;i++){
    const a=xs[i],b=xs[i+1],x=(a+b)/2,cabin=x>=cabinA&&x<cabinB,door=x>=doorA&&x<doorB;
    const front=x<cabinA,deckPart=front?'shell.luggage':'shell.deck';
    for(const s of [-1,1]){
      const sideDoor='shell.'+(s<0?'left-door':'right-door');
      const flank=(pos,u)=>car.modern?flankFrame(pos,u,s).p:sideRaw(car,classicDoorRib(car,pos,u),u,s);
      const deck=(pos,u)=>{
        const w=station(car,pos)[0],inner=cabin?w*.745:lidWidth(car,pos,w,front);
        return top(car,pos,s*mix(inner,w*.958,u));
      };
      r.tag(door?sideDoor:'shell.fenders',()=>{
        let levelBelow=0,fa=flank(a,0),fb=flank(b,0);
        for(const level of (car.modern?sideLevels992:classicFlankLevels)){
          const na=flank(a,level),nb=flank(b,level);
          const normals=car.modern?[flankFrame(a,levelBelow,s).n,flankFrame(b,levelBelow,s).n,flankFrame(b,level,s).n,flankFrame(a,level,s).n]:null;
          const panel=()=>{if(!car.modern||fa[2]!==na[2]||fb[2]!==nb[2])painted(r,[fa,fb,nb,na],paint,[0,s,0],normals);};
          if(door&&level===(car.modern?.145:classicDoorHem))r.tag('shell.fenders',panel);else panel();
          levelBelow=level;fa=na;fb=nb;
        }
        // At the shoulder the side panel turns over toward the inside of the car.
        let ta=deck(a,1),tb=deck(b,1);
        painted(r,[fa,fb,tb,ta],paint,[0,s,.5]);
        for(const t of car.modern?deckRows992:classicShoulderRows){
          const na=deck(a,t),nb=deck(b,t);painted(r,[ta,tb,nb,na],paint,[0,s*.25,1]);ta=na;tb=nb;
        }
        if(cabin){
          const la=[ta[0],ta[1]-s*.012,ta[2]-.032],lb=[tb[0],tb[1]-s*.012,tb[2]-.032];
          r.polygon([ta,tb,lb,la],'#282b2e',false);
          r.polygon([la,lb,[lb[0],lb[1]+s*.032,.40],[la[0],la[1]+s*.032,.40]],car.modern?'#42454a':'#55595b',false);
        }
      });
      if(!cabin){
        const activeBlade=!front && x>=(car.modern?spoiler992.front:classicSpoiler.front) && x<(car.modern?spoiler992.rear:classicSpoiler.rear);
        const surface=(pos,t,wing)=>deckPatch(car,pos,t,s,front,activeBlade,wing);
        lidStrip(r,car,paint,phase,a,b,s,front,activeBlade);
        if(activeBlade||(car.modern&&!front))r.tag(deckPart,()=>{
          const p=surface(a,0,false),q=surface(b,0,false),u=surface(b,1,false),v=surface(a,1,false);
          painted(r,[p,q,u,v],paint,[0,s*.3,1]);
          if(!activeBlade)return;
          const well=(x,t)=>{const p=surface(x,t,true);return [p[0],p[1],p[2]-.071];};
          const seated=[p,q].map(([x,y,z])=>car.modern?[x,y+s*.002,z-.004]:[x,y,z]);
          strip(r,seated,[well(a,1),well(b,1)],'#41464a');
          strip(r,[well(a,1),well(a,0)],[well(b,1),well(b,0)],'#33383b');
        });
      }
    }
  }
  floorAndSills(r,car,paint);
  for (const s of [-1,1]){
    const id='shell.'+(s<0?'left-door':'right-door'),a=doorA,b=doorB;
    const cheek=(x,z,out=.003)=>{
      const high=station(car,x)[1]-.076,t=clamp((z-wheelCut(car,x))/(high-wheelCut(car,x)));
      const p=sideRaw(car,x,t,s);return [p[0],p[1]+s*out,p[2]];
    };
    r.tag(id,()=>{
      const low=classicDoorHem;
      const rows=car.modern?[[a,1],[a,.9],[a,.76],[a,.54],[a,.34],[a,.22],[a,.16],[a+.03,.145],[a+.17,.145],[0,.145],[b-.16,.145],[b,.145],[b,.18],[b,.22],[b,.34],[b,.54],[b,.76],[b,.9],[b,1]]:[[a,1],[a,.9],[a,.76],[a,.54],[a,low+.05],[a,low+.012],
        [a+.025,low],[a+.14,low],[0,low],[b-.14,low],[b-.025,low],
        [b,low+.012],[b,low+.05],[b,.54],[b,.76],[b,.9],[b,1]];
      const seam=rows.map(([x,t])=>sideRaw(car,car.modern?doorRibX(x,t):classicDoorRib(car,x,t),t,s));
      panelSeam(r,car,'door'+s,seam,car.modern?.0065:.0055,s,car.modern?'#2a2d2f':tint(paint,.48));
      const hw=car.modern?.133:.116,hz=car.modern?.750:.733,hx=b-.18;
      const handle=cheek(hx,hz);
      // The 993 pull handle is a body-colour moulding over a shallow dark recess.
      ellipsoid(r,handle,[hw*.63,.014,.023],car.modern?tint(paint,.67):'#4a4d4f',12,4);
      ellipsoid(r,[hx,handle[1]+s*.012,hz+.005],[hw*.52,.013,.009],tint(paint,1.05),12,4);
      const foot=top(car,a+.108,s*station(car,a+.108)[0]*.858);
      if(car.modern){
        pipe(r,[foot,[foot[0]+.015,foot[1]+s*.073,foot[2]+.045],[foot[0]-.012,foot[1]+s*.14,foot[2]+.066]],.024,'#32383b',8);
        draw992Mirror(r,[foot[0]-.010,s*(1.012-.097),foot[2]+.096],s,paint);
      }else classicMirror(r,foot,s,paint);
      const molding=Array.from({length:7},(_,i)=>cheek(mix(a+.04,b-.05,i/6),.228,.005));
      r.tag(car.modern?id:'shell.fenders',()=>strip(r,molding,molding.map(([x,y,z])=>[x,y,z+.006]),tint(paint,.63)));
    });
    r.tag('shell.fenders',()=>{
      // Hemmed sill remains fixed while a separate door is removed.
      const hem=Array.from({length:9},(_,i)=>cheek(mix(a-.03,b+.08,i/8),.201,.004));
      strip(r,hem,hem.map(([x,y,z])=>[x,y,z-.012]),tint(paint,.73));
    });
    for(const fore of [true,false]){
      const nose=car.modern?bonnetStart:classicBonnetStart;
      const lo=fore?nose:car.cockpit[1]+.205,hi=fore?cabinA-.014:car.stations.at(-1)[0]-.061;
      r.tag(fore?'shell.luggage':'shell.deck',()=>{
        const samples=[lo,...xs.filter(x=>x>lo&&x<hi),hi];
        const edge=samples.map(x=>top(car,x,s*lidWidth(car,x,station(car,x)[0],fore)));
        panelSeam(r,car,(fore?'bonnet':'deck')+s,edge,car.modern?.0065:.0063,0,car.modern?'#2c2f31':tint(paint,.50));
      });
    }
  }
}
export function porscheBumperPoint(car,front,y,z,depth=0){
  const x=front?car.stations[0][0]:car.stations.at(-1)[0],sign=front?-1:1;
  const floorInset=front?.085:car.modern?.110:.137;
  const toe=floorInset*clamp((.42-z)/.25)**1.4;
  // The rear lens stands proud of its mounting face. Recess the fascia behind
  // each lamp so the visible lens remains inside the bumper-to-bumper envelope.
  const rearRecess=front?0:car.modern?.009*clamp((z-.47)/.14):.008*clamp((z-.470)/.014);
  if(car.modern){
    // The light shelf and lower diffuser recede from the convex bumper crown.
    const capZ=top(car,x,y)[2];
    const shelf=front?0:.022*clamp((z-.53)/.14)*clamp((capZ-z)/.030);
    const p=swept(car,[x,y,z]);p[0]-=sign*(toe+depth+shelf);return p;
  }
  const p=swept(car,[x,y,z]);
  p[0]-=sign*(classicBumperInset(front,z,y)+depth+rearRecess);return p;
}
function fascia(r,car,front,paint){
  const x=front?car.stations[0][0]:car.stations.at(-1)[0],w=station(car,x)[0]*.958,sign=front?-1:1;
  const point=(y,z,depth=0)=>porscheBumperPoint(car,front,y,z,depth);
  if(car.modern){
    const cap=y=>top(car,x,y)[2],bottom=wheelCut(car,x);
    const flank=(s,z)=>sideRaw(car,x,clamp((z-bottom)/(cap(s*w)-bottom)),s);
    // The same height a little way along the wing, for the corner's tangent.
    flank.at=(s,z,dx)=>{
      const xx=x+dx,low=wheelCut(car,xx),high=top(car,xx,s*station(car,xx)[0]*.958)[2];
      return sideRaw(car,xx,clamp((z-low)/(high-low)),s);
    };
    // Both joins reuse the polygon edges of the adjoining loft. An analytic
    // point on a curved skin can sit millimetres off a chord between vertices.
    const side=sideLevels992.map(t=>sideRaw(car,x,t,1)[2]);
    side.unshift(sideRaw(car,x,0,1)[2]);
    const inside=lidWidth(car,x,station(car,x)[0],front);
    const n=lidSteps992(front);
    const deck=front?Array.from({length:n+1},(_,i)=>i/n*inside):[...Array.from({length:n+1},(_,i)=>i/n*bladeSpan(car,x)),inside];
    for(const t of [...deckRows992].reverse().slice(1))deck.push(mix(inside,w,t));
    deck.push(w);
    const outer=deck.map(y=>top(car,x,y));
    return fascia992(r,front,paint,w,x,point,cap,flank,painted,side,outer);
  }
  const bands=y=>{
    const t=Math.abs(y/w),cap=top(car,x,y)[2];
    if(front){
      const [low,high]=classicSignalPocket(t,cap);
      return [...classicLowerBands(t).slice(0,5),low,high,mix(high,cap,.55),cap];
    }
    return [.161+.033*t*t,.232+.025*t*t,.276,.310,.335,.393,.425,.459,.470,.484,.504,cap];
  };
  const cuts=front?[0,.1,.2,.3,.4,.431,.447,.5,.6,.615,.665,.70,.709,.724,.730,.752,.818,.837,.90,.96,.977,.987,1]:[0,.18,.36,.54,.70,.83,.96,1];
  const ys=[...cuts.slice(1).reverse().map(t=>-w*t),...cuts.map(t=>w*t)];
  r.tag('shell.bumpers',()=>{
    for(let j=1;j<ys.length;j++){
      const l=ys[j-1],h=ys[j],left=bands(l),right=bands(h);
      for(let k=1;k<left.length;k++){
        const corners=[point(l,left[k-1]),point(h,right[k-1]),point(h,right[k]),point(l,left[k])];
        const u=Math.abs((l+h)/2)/w;
        if(front&&k===6&&u>.431&&u<.987){
          // Continuous die-cut pocket, including the mounting space behind the
          // US impact pad. The lens, housing and painted bumper stay independent.
          const back=corners.map(([xx,y,z])=>[xx+.044,y,z]);
          r.polygon(back,'#303233',false);
          for(const [i,n] of [[0,1],[2,3]])r.polygon([corners[i],corners[n],back[n],back[i]],i===0?tint(paint,.68):'#4c4c4b',false);
          for(const [y,m,n] of [[l,0,3],[h,1,2]])if([.431,.987].some(edge=>Math.abs(Math.abs(y)/w-edge)<.0001)){
            r.polygon([corners[m],corners[n],back[n],back[m]],tint(paint,.62),false);
          }
          continue;
        }
        if(!front||k!==4||u>.73){
          painted(r,corners,paint,[sign,0,.15]);
          continue;
        }
        const back=corners.map(([xx,y,z])=>[xx+.049,y,z]);
        r.polygon(back,'#162027',false);
        r.polygon([corners[0],corners[1],back[1],back[0]],'#515a61',false);
        r.polygon([corners[3],corners[2],back[2],back[3]],'#242c31',false);
        for(const [y,m,n] of [[l,0,3],[h,1,2]]){
          if(Math.abs(Math.abs(y)-w*.730)<.0001)r.polygon([corners[m],corners[n],back[n],back[m]],'#536069',false);
        }
        // Two horizontal bars split the mouth into three slots.
        for(const k of [.36,.68]){
          const slat=[0,1].map((i)=>corners[i].map((v,a)=>mix(v,corners[3-i][a],k)));
          strip(r,slat.map(([xx,y,z])=>[xx+.010,y,z]),slat.map(([xx,y,z])=>[xx+.018,y,z+.007]),'#7d868a');
          strip(r,slat.map(([xx,y,z])=>[xx+.018,y,z+.007]),slat.map(([xx,y,z])=>[xx+.03,y,z+.007]),'#3d4549');
        }
      }
    }
    // Connect the wrapped bumper skin to the flank at both corners.
    for(const side of [-1,1]){
      const row=bands(side*w),bottom=wheelCut(car,x),hi=row.at(-1);
      const flank=z=>sideRaw(car,x,clamp((z-bottom)/(hi-bottom)),side);
      for(let j=1;j<row.length;j++){
        const l=row[j-1],h=row[j];
        painted(r,[point(side*w,l),point(side*w,h),flank(h),flank(l)],paint,[sign*.45,side,.04]);
      }
    }
    if(front)drawClassicCornerVents(r,car,sideRaw,wheelCut,top,station);
    const row=ys.map(y=>point(y,bands(y)[0]));
    strip(r,row,row.map(([xx,y,z])=>[xx-sign*.080,y,z-.006]),tint(paint,.65));
  });
  return {point,w,x,cap:y=>top(car,x,y)[2]};
}
function exteriorLights(r,car,paint){
  const nose=fascia(r,car,true,paint),tail=fascia(r,car,false,paint),modern=car.modern;
  // Outermost crossing of a horizontal ray with the painted rear quarters.
  const cornerTris=modern&&r.faces?r.faces.filter(f=>f.paintNormal&&f.points.some(p=>p[0]>1.45&&Math.abs(p[1])>.45&&p[2]>.6&&p[2]<.9))
    .flatMap(f=>{const idx=faceTriangles(f.points),out=[];for(let i=0;i<idx.length;i+=3)out.push([f.points[idx[i]],f.points[idx[i+1]],f.points[idx[i+2]]]);return out;}):[];
  const cornerSurface=(o,d)=>{
    let best=null;
    for(const [a,b,c] of cornerTris){
      const e1=b.map((v,i)=>v-a[i]),e2=c.map((v,i)=>v-a[i]);
      const p=[d[1]*e2[2]-d[2]*e2[1],d[2]*e2[0]-d[0]*e2[2],d[0]*e2[1]-d[1]*e2[0]];
      const det=e1[0]*p[0]+e1[1]*p[1]+e1[2]*p[2];if(Math.abs(det)<1e-12)continue;
      const tv=o.map((v,i)=>v-a[i]),u=(tv[0]*p[0]+tv[1]*p[1]+tv[2]*p[2])/det;if(u<0||u>1)continue;
      const q=[tv[1]*e1[2]-tv[2]*e1[1],tv[2]*e1[0]-tv[0]*e1[2],tv[0]*e1[1]-tv[1]*e1[0]];
      const v=(d[0]*q[0]+d[1]*q[1]+d[2]*q[2])/det;if(v<0||u+v>1)continue;
      const dist=(e2[0]*q[0]+e2[1]*q[1]+e2[2]*q[2])/det;
      if(dist>0&&(!best||dist>best.dist))best={dist,point:o.map((v,i)=>v+d[i]*dist)};
    }
    return best?.point;
  };
  for(const s of [-1,1]){
    r.tag('lights.headlamps',()=>{
      if(modern)draw992Headlamp(r,car,s,top);
      else{
        if(!r.build?.parts?.includes('993-litronic-us'))headlamp993(r,car,s,paint,top);
        washerNozzle(r,car,s,top);
      }
    });
    r.tag('lights.indicators',()=>{
      if(!modern){frontSignals993(r,s,nose);return;}
      draw992RunningLamp(r,s,nose);
    });
    r.tag('lights.tail',()=>{
      const high=modern?.740:.575,h=modern?.015:.083;
      // Face curves around either rear corner until it runs parallel with the flank.
      const row=(t,upper,depth=0)=>{
        const y=t<=.84?tail.w*t/.84:mix(tail.w,station(car,tail.x-.31)[0]-.003,(t-.84)/.16);
        const lensHeight=modern?h+.012*clamp((t-.60)/.25):h;
        const z=high-lensHeight+upper*lensHeight+.013*t;
        const proud=modern?.008:.006368;
        if(t<=.84)return tail.point(s*y,z,depth-proud);
        const base=tail.point(s*tail.w,z,depth-proud),k=(t-.84)/.16;
        if(modern){
          // The lens wraps the rounded corner flush with the paint and ends in a
          // point on the flank below the haunch's shoulder. Find the actual
          // painted surface with a horizontal ray that turns from straight aft
          // to straight outboard, starting inside the corner.
          // Rays fan from one point inside the corner, level with the lamp's
          // outer end and its last aft-facing station, so their hits run in
          // order from the rear face round to the tip on the flank.
          const eased=k*k*(3-2*k),zz=z-.010*eased;
          const origin=[1.665,base[1],zz];
          const dir=[Math.cos(k*Math.PI/2),s*Math.sin(k*Math.PI/2),0];
          const hit=cornerSurface(origin,dir);
          if(hit){
            const out=proud-depth+.002;
            return [hit[0]+dir[0]*out,hit[1]+dir[1]*out,zz];
          }
        }
        const actualZ=z+(modern?.047:.055)*k;
        let xx=tail.x-.438*k;
        const flank=raw=>sideRaw(car,raw,clamp((actualZ-wheelCut(car,raw))/(top(car,raw,station(car,raw)[0]*.958)[2]-wheelCut(car,raw))),s);
        if(modern){
          // Outer point of the lamp pocket in the side elevation, ahead of the rear corner.
          const physical=mix(base[0],1.665,k);
          xx=physical;
          for(let i=0;i<7;i++)xx+=physical-flank(xx)[0];
        }
        const side=flank(xx);
        const turn=Math.sin(k*Math.PI/2);
        return [mix(base[0],side[0],turn),s*(mix(tail.w,Math.abs(side[1]),turn)+.004-depth),actualZ];
      };
      if(modern){draw992Tail(r,row);return;}
      const profile=[0,.20,.43,.60,.69,.78,.84,.86,.88,.90,.92,.94,.96,.98,1];
      for(let j=0;j<profile.length-1;j++){
        const a=profile[j],b=profile[j+1];
        for(const [l,u,color] of [[-.10,0,'#31353a'],[0,.30,modern?'#ac3441':'#ac3336'],[.30,.78,modern?'#f36b66':'#c44849'],[.78,1,modern?'#f68d81':'#d75c54'],[1,1.13,'#3f4346']]){
          r.polygon([row(a,l),row(b,l),row(b,u),row(a,u)],color,false);
        }
      }
      if(!modern)rearOptics993(r,row);
    });
  }
  if(modern)r.tag('lights.tail',()=>draw992Nameplate(r,tail.point));
  r.tag('shell.bumpers',()=>{
    const plate=tail.point(0,modern?.357:.361,-.002);
    if(!modern){
      plate[0]+=.012;
      // US impact guards flank the shorter North American license plate.
      for(const side of [-1,1]){
        const y=side*.21,base=tail.point(y,.444,-.002)[0]-.006;
        r.profile([[base-.010,plate[2]-.065],[base+.014,plate[2]-.055],[base+.02137,plate[2]+.044],[base+.014,plate[2]+.065],[base-.010,plate[2]+.065]],y-.019,y+.019,'#353a3c');
      }
    }
    r.box(plate[0]-.006,-.164,plate[2]-.063,plate[0]+.008,.164,plate[2]+.063,'#484d4d');
    r.box(plate[0]+.009,-.147,plate[2]-.049,plate[0]+.013,.147,plate[2]+.049,'#b9bcb1');
    if(modern)for(const s of [-1,1]){
      // The reflector carrier clips into the recessed rear grille. Both ends
      // need a supported return, including the one seen in side elevation.
      const band=(height,depth)=>Array.from({length:9},(_,i)=>{
        const t=i/8;
        return tail.point(s*mix(.48,.74,t),.383+.015*t+height,depth);
      });
      const low=band(0,.017),high=band(.014,.017);
      strip(r,low,high,'#a33238');
      strip(r,low,band(0,.064),'#363a3b');
      strip(r,high,band(.014,.064),'#393e3e');
      const inner=band(0,.064),upper=band(.014,.064);
      for(const i of [0,8])r.polygon([low[i],high[i],upper[i],inner[i]],'#393e3e',false);
    }
  });
  if(!modern){fixedStopLamp(r,car,paint,top);cowlInlet993(r,car,paint,top);classicBodyTrim(r,car,paint,top,tail.point,sideRaw);r.tag('shell.deck',()=>classicDeckScript(r,car,top));}
  const hoodX=car.stations[0][0]+(modern?.20:.16);
  r.tag('shell.luggage',()=>{
    const gap=Array.from({length:29},(_,i)=>{
      const side=i/14-1,x=modern?bonnetStart:classicBonnetStart;
      return top(car,x,side*lidWidth(car,x,station(car,x)[0],true));
    });
    panelSeam(r,car,'bonnet-front',gap,modern?.007:.0063,0,modern?'#2c2f31':tint(paint,.47));
    const at=(dx,y,lift)=>{const p=top(car,(modern?hoodX:classicBonnetStart+.085)+dx,y);p[2]+=lift;return p;};
    const badge=[[-.027,-.017],[-.027,.017],[.011,.015],[.038,0],[.011,-.015]].map(([dx,y])=>at(dx,y,.005));
    r.polygon(badge,'#b2945d',false);
    if(!modern){
      // Enamelled crest: a gold rim around red and black quarters.
      const q=(dx0,dx1,y0,y1,color)=>r.polygon([at(dx0,y0,.0056),at(dx0,y1,.0056),at(dx1,y1,.0056),at(dx1,y0,.0056)],color,false);
      q(-.022,-.004,-.012,0,'#9a2c27');q(-.022,-.004,0,.012,'#2b2523');
      q(-.004,.016,-.011,0,'#2b2523');q(-.004,.016,0,.011,'#9a2c27');
      r.polygon([[-.009,-.005],[-.009,.005],[.004,.005],[.004,-.005]].map(([dx,y])=>at(dx,y,.0062)),'#c9a85e',false);
    }
  });
}
function engineGrille(r,car,paint,phase){
  const modern=car.modern;
  const p=(x,y,lift)=>{const q=top(car,x,y);q[2]+=lift;return modern?q:spoilerPoint(false,q,phase);};
  r.tag(modern?'shell.deck':'shell.spoiler',()=>{
    if(modern){draw992EngineGrille(r,p);return;}
    const {grilleFront,grilleRear}=classicSpoiler;
    const stations=uBreaks(car).filter(x=>x>=grilleFront&&x<=grilleRear);
    for(let i=1;i<stations.length;i++){
      const x=stations[i-1],xx=stations[i],w=classicGrilleSpan(x),ww=classicGrilleSpan(xx);
      for(let j=0;j<4;j++){
        const t=j/2-1,u=(j+1)/2-1;
        // The grille is let into the lid: its floor and louvres sit below the
        // painted surround, which forms the silhouette in side elevation.
        r.polygon([p(x,t*w,-.016),p(x,u*w,-.016),p(xx,u*ww,-.016),p(xx,t*ww,-.016)],'#1b2124',false);
      }
    }
    for(let i=0;i<16;i++){
      const x=mix(grilleFront,grilleRear,(i+.5)/16),w=classicGrilleSpan(x)*.985;
      for(let j=0;j<4;j++){
        const a=(j/2-1)*w,b=((j+1)/2-1)*w;
        r.polygon([p(x,a,-.003),p(x,b,-.003),p(x+.010,b,-.007),p(x+.010,a,-.007)],'#4a5153',false);
        r.polygon([p(x+.010,a,-.007),p(x+.010,b,-.007),p(x+.010,b,-.015),p(x+.010,a,-.015)],'#262c2f',false);
      }
    }
  });
}
// The 992 skin is the sum of several measured corrections. Where they meet,
// centimetre ripples remain in the surface, and a sharp studio highlight turns
// each one into a visible blotch. Fair the shading normals inside each panel
// with a few Laplacian passes; the geometry, seams and fittings do not move.
function fairNormals(faces,shared,key,paint,passes=8){
  const links=new Map();
  const link=(a,b)=>{if(a===b)return;(links.get(a)||links.set(a,new Set()).get(a)).add(b);};
  for(const face of faces){
    const ids=face.points.map(p=>shared.get(face.part+key(p)));
    for(let i=0;i<ids.length;i++){link(ids[i],ids[(i+1)%ids.length]);link(ids[(i+1)%ids.length],ids[i]);}
  }
  // Neighbouring panels meet on a continuous surface across a shut line.
  // Share one normal at coincident vertices so the joint does not read as a
  // change of curvature; the moving spoiler blade keeps its own.
  const coincident=new Map();
  for(const face of faces){
    if(face.part==='shell.spoiler')continue;
    for(const p of face.points){
      const id=key(p);let group=coincident.get(id);
      if(!group)coincident.set(id,group=new Set());
      group.add(shared.get(face.part+id));
    }
  }
  const tangent=group=>group.every(a=>group.every(b=>a.normal[0]*b.normal[0]+a.normal[1]*b.normal[1]+a.normal[2]*b.normal[2]>.82));
  const joints=[...coincident.values()].filter(group=>group.size>1).map(group=>[...group]).filter(tangent);
  const items=[...links.keys()];
  for(let pass=0;pass<passes;pass++){
    const next=items.map(item=>{
      const sum=[...item.normal];
      for(const other of links.get(item))for(let j=0;j<3;j++)sum[j]+=other.normal[j];
      const length=Math.hypot(...sum)||1;
      return sum.map(v=>v/length);
    });
    items.forEach((item,i)=>{item.normal=next[i];});
    for(const group of joints){
      const sum=[0,0,0];
      for(const item of group)for(let j=0;j<3;j++)sum[j]+=item.normal[j];
      const length=Math.hypot(...sum)||1;
      for(const item of group)item.normal=sum.map(v=>v/length);
    }
  }
  for(const item of items)item.color=coachPaintColor(paint,item.normal);
}
function softenPaint(faces,paint){
  // Gouraud shading across the continuous skins preserves the subtle waist of the
  // door and shoulder. Opposing bumper/lid normals stay split at the panel seam.
  const shared=new Map(),paintedFaces=faces.filter(f=>f.paintNormal);
  const key=p=>p.map(v=>Math.round(v*10000)).join('/');
  for(const face of paintedFaces){
    const base=rgb(face.color);
    for(const [i,p] of face.points.entries()){
      const id=face.part+key(p);let item=shared.get(id);
      if(!item)shared.set(id,item={color:[0,0,0],normal:[0,0,0],count:0});
      for(let j=0;j<3;j++){item.color[j]+=base[j];item.normal[j]+=face.paintNormal[j];}
      if(face.loftNormals){item.loft=face.loftNormals[i];item.paint=face.loftPaint;}
      item.count++;
    }
  }
  for(const item of shared.values()){
    item.color=item.loft?coachPaintColor(item.paint,item.loft):hex(item.color.map(value=>value/item.count));
    const length=Math.hypot(...item.normal)||1;
    item.normal=item.loft||item.normal.map(value=>value/length);
  }
  if(paint)fairNormals(paintedFaces,shared,key,paint);
  for(const face of paintedFaces){
    const vertices=face.points.map(p=>shared.get(face.part+key(p)));
    face.vertexColors=vertices.map(item=>item.color);
    face.clearcoatNormals=vertices.map(item=>item.normal);
    delete face.paintNormal;delete face.loftNormals;delete face.loftPaint;
  }
}
function packCoachworkReturns(faces,start,modern){
  const parts=new Set(['shell.fenders','shell.bumpers']);
  if(!modern)for(const part of ['lights.indicators','lights.high-stop','lights.tail','lights.fog-left','lights.fog-right'])parts.add(part);
  const batches=new Map(),pieces=faces.splice(start);
  for(const face of pieces){
    const part=face.part;
    if(modern&&face.vertexColors&&!face.stroke&&!face.triangles&&part?.startsWith('shell.')&&part!=='shell.spoiler'){
      // One shared-vertex batch per painted panel. The dense loft then costs
      // a handful of faces against the overview budget, and every panel
      // still separates, highlights and picks as a single physical part.
      const key=['paint',part,face.instance??'',face.rigid?.name??''].join('/');
      let batch=batches.get(key);
      if(!batch){batch={...face,points:[],triangles:[],vertexColors:[],clearcoatNormals:[]};batches.set(key,batch);faces.push(batch);}
      const first=batch.points.length;
      batch.triangles.push(...faceTriangles(face.points).map(i=>i+first));
      batch.points.push(...face.points);batch.vertexColors.push(...face.vertexColors);batch.clearcoatNormals.push(...face.clearcoatNormals);
      continue;
    }
    if(face.vertexColors||face.stroke||face.triangles||!parts.has(part)){
      faces.push(face);continue;
    }
    const side=Math.sign(face.points[0][1]),end=Math.sign(face.points[0][0]);
    const key=[part,face.color,side,end].join('/');
    let batch=batches.get(key);
    if(!batch){batch={...face,points:[],triangles:[]};batches.set(key,batch);faces.push(batch);}
    const first=batch.points.length;
    batch.triangles.push(...faceTriangles(face.points).map(i=>i+first));
    batch.points.push(...face.points);
  }
}
export function drawCoachwork(r,car,paint,phase=0){
  const start=r.faces?.length||0;
  skin(r,car,paint,phase);exteriorLights(r,car,paint);engineGrille(r,car,paint,phase);drawSpoilerDrive(r,car.modern,phase);
  if(r.faces)softenPaint(r.faces.slice(start),car.modern?paint:null);
  if(r.faces)packCoachworkReturns(r.faces,start,car.modern);
  if(r.faces&&!car.modern)packClassicSkin(r.faces,start);
}
// The finely divided 993 skin is batched into one indexed mesh per panel and
// side. Vertex colours and clear-coat normals stay per vertex, so the shading
// is unchanged while the panel costs one face in the scene budget.
function packClassicSkin(faces,start){
  const batches=new Map(),pieces=faces.splice(start);
  for(const face of pieces){
    const part=face.part;
    if(!face.vertexColors||!face.clearcoatNormals||face.triangles||!part?.startsWith('shell.')||part==='shell.spoiler'){
      faces.push(face);continue;
    }
    const side=Math.sign(face.points[0][1]),end=Math.sign(face.points[0][0]);
    const key=[part,side,end].join('/');
    let batch=batches.get(key);
    if(!batch){
      batch={...face,points:[],triangles:[],vertexColors:[],clearcoatNormals:[],index:new Map()};
      batches.set(key,batch);faces.push(batch);
    }
    const local=face.points.map((p,i)=>{
      const id=p.map(v=>Math.round(v*1e5)).join('/')+face.vertexColors[i];
      let at=batch.index.get(id);
      if(at===undefined){
        at=batch.points.length;batch.index.set(id,at);
        batch.points.push(p);batch.vertexColors.push(face.vertexColors[i]);batch.clearcoatNormals.push(face.clearcoatNormals[i]);
      }
      return at;
    });
    for(const i of faceTriangles(face.points))batch.triangles.push(local[i]);
  }
  for(const batch of batches.values())delete batch.index;
}

// Whole-car motion redraws only the blade and its mechanism. All unaffected
// coachwork, upholstery, glazing and running gear reuse their parked mesh.
export function drawPorscheSpoilerMotion(r,modern,paint,phase=0){
  const car=coupeShape[modern?1:0],start=r.faces?.length||0,xs=uBreaks(car);
  const a=modern?spoiler992.front:classicSpoiler.front,b=modern?spoiler992.rear:classicSpoiler.rear;
  for(let i=1;i<xs.length;i++){
    if(xs[i-1]<a||xs[i]>b)continue;
    for(const side of [-1,1])lidStrip(r,car,paint,phase,xs[i-1],xs[i],side,false,true);
  }
  if(!modern)engineGrille(r,car,paint,phase);
  drawSpoilerDrive(r,modern,phase);
  if(r.faces)softenPaint(r.faces.slice(start),modern?paint:null);
}
