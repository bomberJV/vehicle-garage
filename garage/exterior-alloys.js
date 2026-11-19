// Face depth is measured outboard from the spoke plane. All spokes are solids
// with an outer face and side walls. The vent spaces between spokes are empty.
import {tint} from './exterior-coachwork.js';
import {style43Face} from './e46-wheels.js';
import {baseVehicle} from './vehicle-variants.js';

export function roadWheelSpokes(r,{vehicle,x,y,z,side,rim,finish}){
 if(vehicle==='bmw325ci')return style43Face(r,{x,y,z,side,rim,finish});
 const honda=baseVehicle(vehicle)==='hrv',lx=vehicle==='hrvlx',amg=vehicle==='c63',e90=vehicle==='bmw328xi';
 const skin=honda?tint(finish,.96):finish;
 const vertex=(angle,radius,depth)=>[x+Math.cos(angle)*radius,y+side*depth,z+Math.sin(angle)*radius];
 function blade(angle,stations,flank=.94){
  for(let i=1;i<stations.length;i++){
   const [lo,hi]=stations.slice(i-1,i+1);
   const p=(section,edge,back=false)=>vertex(angle+section[1]+edge*section[2],section[0]*rim,section[3]-(back?.020:0));
   r.polygon([p(lo,-1),p(hi,-1),p(hi,0),p(lo,0)],tint(skin,1.05),false);
   r.polygon([p(lo,0),p(hi,0),p(hi,1),p(lo,1)],tint(skin,flank),false);
   for(const edge of [-1,1])r.polygon([p(lo,edge),p(hi,edge),p(hi,edge,true),p(lo,edge,true)],tint(skin,.59),false);
   r.polygon([p(lo,-1,true),p(lo,1,true),p(hi,1,true),p(hi,-1,true)],tint(skin,.61),false);
  }
 }
 for(let i=0;i<5;i++){
  const a=i/5*Math.PI*2+Math.PI*.5;
  if(e90){
   // Double Spoke 156: five V-shaped pairs that meet at the hub and spread to the rim.
   for(const branch of [-1,1])blade(a,[[.26,branch*.040,.055,-.008],[.52,branch*.105,.048,.004],[.93,branch*.175,.040,.014]]);
  }else if(amg){
   // The W204 C63's factory 18-inch AMG 5-spoke (A 204 401 39 02 front): five
   // solid straight spokes that flare toward the rim. Each has a machined face
   // and a titanium-grey channel down its middle, so it reads as a pair.
   const spoke=[[.245,0,.30,-.008],[.48,0,.20,.004],[.70,0,.18,.010],[.93,0,.18,.014]];
   blade(a,spoke,1.0);
   const channel=spoke.map(([rr,o,w,d])=>[rr,o,w*.52,d+.0015]);
   for(let k=1;k<channel.length;k++){
    const [lo,hi]=channel.slice(k-1,k+1),p=(c,e)=>vertex(a+c[1]+e*c[2],c[0]*rim,c[3]);
    r.polygon([p(lo,-1),p(hi,-1),p(hi,1),p(lo,1)],'#4c5358',false);
   }
  }else if(lx){
   // LX 17-inch pewter gray: a broad stem leaves the hub and forks at about
   // half the radius; the two arms flare apart and land on the rim, leaving a
   // narrow triangular window inside each Y and wide windows between them.
   blade(a,[[.24,0,.30,-.004],[.36,0,.24,.004],[.50,0,.19,.010]]);
   for(const b of [-1,1])blade(a,[[.48,b*.075,.080,.010],[.70,b*.150,.100,.013],[.93,b*.200,.118,.015]]);
  }else{
   // EX-L 18-inch wheels: five broad spokes that twist as they run out to the
   // rim. The leading half of each is machined bright, the trailing half is the
   // dark painted flank, which is what gives the face its two-tone look.
   blade(a,[[.24,0,.42,-.004],[.45,.035,.29,.006],[.70,.075,.225,.012],[.93,.115,.195,.015]],.72);

  }
 }
 const capR=rim*(amg?.259:.304),pad=y+side*.000;
 r.ringY(x,pad,z,capR,0,amg?'#646b70':tint(skin,.91),32);
 for(let i=0;i<5;i++){
  const a=(i+.5)/5*Math.PI*2+Math.PI/2,xx=x+Math.cos(a)*capR*.748,zz=z+Math.sin(a)*capR*.748;
  r.ringY(xx,pad+side*.004,zz,amg?.0115:.0086,0,'#323b3f',12);
  r.ringY(xx,pad+side*.007,zz,amg?.0075:.0058,0,'#9ca6a7',6);
 }
 r.ringY(x,pad+side*.009,z,capR*.402,0,amg?'#a4aeb3':'#41494a',24);
}
