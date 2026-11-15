// The crank runs along X. Each deck looks out across Y, and the joint is vertical.
import {cyl, sleeve, turn, tint, TAU, x, y} from './mechanism-shapes.js';
import {mainStations} from './porsche-crankshaft.js';

const cast='#8e9899', machined='#c2cac6', bore='#737d81', steel='#889498';
export const bearingStations=mainStations;
const unit=(a)=>[Math.cos(a),Math.sin(a)];

// Tessellate a hole through a deck patch without an opaque disk across its mouth.
function drilledPatch(r,corners,side){
  const [a,b,c,d]=corners;
  const point=(u,v,depth)=>a.map((n,i)=>(1-v)*((1-u)*n+u*b[i])+v*((1-u)*d[i]+u*c[i])-(i===1?side*depth:0));
  const at=(j,outer,depth)=>{
    const [cs,sn]=unit(j*TAU/12+Math.PI/4);
    const scale=outer?1/Math.max(Math.abs(cs),Math.abs(sn)):1;
    return point(.50+(outer?.5:.17)*cs*scale,.54+(outer?(sn>0?.46:.54):.17)*sn*scale,depth);
  };
  for(let j=0;j<12;j++){
    r.polygon([at(j,true,0),at(j+1,true,0),at(j+1,false,0),at(j,false,0)],machined,false);
    r.polygon([at(j,false,0),at(j+1,false,0),at(j+1,false,.024),at(j,false,.024)],'#626d6d',false);
  }
}
export function headStuds(r,side){
  for(const n of [-1,0,1])for(const dx of [-.118,.118])for(const z of [-.120,.120]){
    const p=n*.32+side*.08+dx;
    r.rod([p,side*.263,z],[p,side*.487,z],.0075,'#7c827c',8);
    r.rod([p,side*.487,z],[p,side*.522,z],.0082,'#92968f',8);
  }
}
// Quad rings leave real apertures. The deck is never a solid face painted with circles.
export function deck(r,side,modern){
  const height=modern?.192:.167, reach=modern?.41:.27, innerReach=modern?.194:.219;
  for(let i=0;i<3;i++){
    const center=(i-1)*.32+side*.08, radius=modern?.133:.147;
    const ring=(j,depth,outer)=>{
      const [a,b]=unit(j*TAU/24), f=1/Math.max(Math.abs(a),Math.abs(b));
      return [center+(outer?.16*f:radius)*a,side*depth,(outer?height*f:radius)*b];
    };
    for(let j=0;j<24;j++){
      const face=[ring(j,reach,true),ring(j+1,reach,true),ring(j+1,reach,false),ring(j,reach,false)];
      if([3,8,15,20].includes(j))drilledPatch(r,face,side);
      else r.polygon(face,machined,false);
      r.polygon([ring(j,reach,false),ring(j+1,reach,false),ring(j+1,innerReach,false),ring(j,innerReach,false)],tint(bore,.80+.18*Math.sin(j*TAU/24)),false);
      if(modern)r.polygon([ring(j,innerReach,false),ring(j+1,innerReach,false),ring(j+1,innerReach+.004,true),ring(j,innerReach+.004,true)],cast,false);
    }
  }
}
export function walls(r,side,modern){
  const d=modern?.41:.27,h=modern?.192:.167,lo=-.48+side*.08,hi=.48+side*.08;
  for(const sign of [-1,1]){
    const rail=[[.009,.213],[.055,.216],[.13,.236],[d-.05,h+.014],[d,h]];
    for(let j=1;j<rail.length;j++){
      const [a,b]=rail[j-1],[c,e]=rail[j];
      r.polygon([[lo,side*a,sign*b],[hi,side*a,sign*b],[hi,side*c,sign*e],[lo,side*c,sign*e]],tint(cast,.98-.085*j),false);
    }
    for(const end of [lo,hi]){
      const rib=[[end,side*.013,sign*.205],[end,side*d,sign*h],[end,side*d,0],[end,side*.18,0],[end,side*.11,sign*.102],[end,side*.013,sign*.102]];
      r.polygon(rib,cast,false);
    }
    // A machined rim follows the split face. The section remains open inside.
    r.box(lo,.002*side-.006,sign*.21-.009,hi,.002*side+.006,sign*.21+.009,machined);
  }
  for(const station of [-.316,.02,.356]){
    for(const height of [-1,1]){
      const start=[station,side*.046,height*.218],end=[station+.033,side*(d-.027),height*(h+.012)];
      r.rod(start,end,.009,'#aab0ab',6);
    }
  }
}
export function saddles(r,side){
  for(const station of bearingStations){
    // basis(x) uses -Y as its first radial direction.
    turn(r,[station,0,0],x,[[-.022,.078],[-.022,.187],[.022,.187],[.022,.078],[-.022,.078]],cast,{start:side===1?Math.PI/2:-Math.PI/2,sweep:Math.PI,n:16});
  }
}
function bearingEnds(r,side,modern){
  // The transmission flange and pulley-end seal seats project from the end webs.
  const sweep={start:side===1?Math.PI/2:-Math.PI/2,sweep:Math.PI,n:20};
  for(const [center,outer,inner,width] of [[-.535,.181,.091,.034],[.532,modern?.126:.105,.075,.027]]){
    turn(r,[center,0,0],x,[[-width,inner],[-width,outer],[width,outer-.005],[width,inner],[-width,inner]],cast,sweep);
  }
  // Raised longitudinal gallery and its blind plug follow the crankcase side.
  const d=side*(modern?.24:.153),z=-.214;
  cyl(r,[0,d,z],x,-.45,.47,.022,'#a2a8a2',10);
  cyl(r,[.47,d,z],x,0,.012,.028,'#b8b6a4',6);
  for(const pos of [-.40,-.08,.24]){
    const lo=[pos,side*(modern?.34:.22),-.16],hi=[pos+.035,d,z];
    r.rod(lo,hi,.018,cast,7);
  }
}
export function castingWalls(r,side,modern){walls(r,side,modern);bearingEnds(r,side,modern);}
export function caseHalf(r,side,modern){castingWalls(r,side,modern);deck(r,side,modern);saddles(r,side);if(!modern)headStuds(r,side);}
// Installed inspection section. The left bank stays complete; a longitudinal
// cut on the viewer's side removes only the top of that casting. Open the
// casting component itself to see the uncut right half and every bore.
export function caseInspectionHalf(r,side,modern){
  if(side<0){caseHalf(r,side,modern);return;}
  const reach=modern?.41:.27, cut=-.105, far=.48+side*.08,near=-.48+side*.08;
  const plane=(p,i,from,to)=>p.map((n,k)=>k===i?from:n+(to[k]-n)*(from-p[i])/(to[i]-p[i]));
  const clipped=p=>{
    const out=[];
    for(let j=0;j<p.length;j++){
      const a=p[(j+p.length-1)%p.length],b=p[j],inside=b[2]<=cut;
      if((a[2]<=cut)!==inside)out.push(plane(a,2,cut,b));
      if(inside)out.push(b);
    }
    return out;
  };
  // Housing algorithms use polygon, rod and box. Clip the actual authored
  // solids in model space, retaining correct depth and component identity.
  const start=r.faces.length;caseHalf(r,side,modern);
  const geometry=r.faces.splice(start);
  for(const face of geometry){const p=clipped(face.points);if(p.length>=3)r.polygon(p,face.color,false);}
  r.polygon([[near,.005,cut],[far,.005,cut],[far,.022,cut],[near,.022,cut]],'#b5b4a2',false);
  for(const m of bearingStations)r.polygon([[m-.022,.006,cut],[m+.022,.006,cut],[m+.022,.146,cut],[m-.022,.146,cut]],'#b8b4a5',false);
  for(const end of [near,far])r.polygon([[end-.007,.02,cut],[end+.007,.02,cut],[end+.007,reach,cut],[end-.007,reach,cut]],'#b5b4a2',false);
}
export function shell(r,station,side,thrust=false,width=.047){
  const center=[station,0,0], a=width/2, start=side===1?Math.PI/2:-Math.PI/2;
  const profile=thrust?[[-a,.061],[-a,.101],[-a+.006,.101],[-a+.006,.077],[a-.006,.077],[a-.006,.101],[a,.101],[a,.061],[-a,.061]]:
    [[-a,.061],[-a,.077],[a,.077],[a,.061],[-a,.061]];
  turn(r,center,x,profile,'#ccb989',{start,sweep:Math.PI,n:18});
}
export function borePart(r,which,modern){
  const c=[0,0,0], rad=.2, extent=.15;
  if(which==='journal'){cyl(r,c,x,-.25,.25,rad,'#a5afb0',32);return;}
  if(which==='left'||which==='right'){
    turn(r,c,x,[[-extent,rad+.002],[-extent,rad+.028],[extent,rad+.028],[extent,rad+.002],[-extent,rad+.002]],'#ccbb93',{start:which==='right'?Math.PI/2:-Math.PI/2,sweep:Math.PI,n:32});return;
  }
  if(which==='thrust'){
    for(const sign of [-1,1]){
      const station=sign*(extent+.012);
      turn(r,c,x,[[station,rad+.002],[station,rad+.085],[station+.008,rad+.085],[station+.008,rad+.002],[station,rad+.002]],'#b6996b',{start:modern?Math.PI/2:0,sweep:modern?Math.PI:TAU,n:32});
    }
  }
}
export function nosePart(r,which){
  const c=[0,0,0];
  if(which==='sleeve')turn(r,c,x,[[-.155,.15],[-.155,.228],[-.02,.228],[-.02,.213],[.017,.213],[.017,.228],[.14,.228],[.14,.15],[-.155,.15]],'#b9ad90',{n:36});
  if(which==='oring')turn(r,c,x,[[-.014,.215],[-.011,.229],[.003,.234],[.013,.228],[.013,.216],[-.014,.215]],'#575c53',{n:36});
  if(which==='seal')turn(r,c,x,[[.145,.142],[.145,.214],[.19,.214],[.19,.165],[.165,.142],[.145,.142]],'#504d46',{n:36});
  if(which==='nose')cyl(r,c,x,-.26,.25,.138,'#a2acac',28);
}
export function boltPart(r,which,modern,center=[0,0,0],unitSize=1){
  const put=(start,end,radius,color,n=16)=>cyl(r,center,y,start*unitSize,end*unitSize,radius*unitSize,color,n);
  const ring=(start,end,rad,inside,color)=>sleeve(r,center,y,start*unitSize,end*unitSize,rad*unitSize,inside*unitSize,color,20);
  if(which==='shaft'){
    put(-.455,.375,.028,steel);put(.374,.466,.029,'#7e8888');
    for(let i=0;i<9;i++)put(.376+i*.010,.380+i*.010,.032,'#a2a6a1',12);
    if(modern){
      // Six external lobes, in cross section, at the head of the main bearing screw.
      const loops=[-.505,-.458].map(a=>Array.from({length:36},(_,i)=>{
        const theta=i*TAU/36,rad=unitSize*(.05+.007*Math.cos(theta*6));
        return [center[0]+rad*Math.cos(theta),center[1]+a*unitSize,center[2]+rad*Math.sin(theta)];
      }));
      r.polygon(loops[0],steel,false);for(let i=0;i<36;i++){const j=(i+1)%36;r.polygon([loops[0][i],loops[0][j],loops[1][j],loops[1][i]],'#788487',false);}
    }else put(-.51,-.455,.060,steel,6);
  }
  if(which==='washer')for(const s of modern?[-1]:[-1,1])ring(s*.449,s*.431,.068,.032,'#aeb7af');
  if(which==='oring')for(const s of [-1,1])ring(s*.43,s*.416,.044,.030,'#4b574b');
  if(which==='nut'){turn(r,center,y,[[.45*unitSize,.032*unitSize],[.45*unitSize,.064*unitSize],[.501*unitSize,.064*unitSize],[.501*unitSize,.032*unitSize],[.45*unitSize,.032*unitSize]],'#aab1a9',{n:6});}
  if(which==='threads')turn(r,center,y,[[.375*unitSize,.034*unitSize],[.375*unitSize,.105*unitSize],[.470*unitSize,.105*unitSize],[.470*unitSize,.034*unitSize],[.375*unitSize,.034*unitSize]],cast,{start:.45,sweep:1.55*Math.PI,n:24});
}
