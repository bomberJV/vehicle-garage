// Face depth is measured outboard from the spoke plane. All spokes are solids
// with an outer face and side walls. The vent spaces between spokes are empty.
import {tint} from './exterior-coachwork.js';
import {style43Face} from './e46-wheels.js';

export function roadWheelSpokes(r,{vehicle,x,y,z,side,rim,finish}){
 if(vehicle==='bmw325ci')return style43Face(r,{x,y,z,side,rim,finish});
 const honda=vehicle==='hrv',amg=vehicle==='c63';
 const skin=honda?tint(finish,.68):finish;
 const vertex=(angle,radius,depth)=>[x+Math.cos(angle)*radius,y+side*depth,z+Math.sin(angle)*radius];
 function blade(angle,stations){
  for(let i=1;i<stations.length;i++){
   const [lo,hi]=stations.slice(i-1,i+1);
   const p=(section,edge,back=false)=>vertex(angle+section[1]+edge*section[2],section[0]*rim,section[3]-(back?.020:0));
   r.polygon([p(lo,-1),p(hi,-1),p(hi,0),p(lo,0)],tint(skin,1.05),false);
   r.polygon([p(lo,0),p(hi,0),p(hi,1),p(lo,1)],tint(skin,.94),false);
   for(const edge of [-1,1])r.polygon([p(lo,edge),p(hi,edge),p(hi,edge,true),p(lo,edge,true)],tint(skin,.59),false);
   r.polygon([p(lo,-1,true),p(lo,1,true),p(hi,1,true),p(hi,-1,true)],tint(skin,.61),false);
  }
 }
 for(let i=0;i<5;i++){
  const a=i/5*Math.PI*2+Math.PI*.5;
  if(amg){
   // The W204 factory 18-inch face has five pairs with narrow parallel arms.
   for(const branch of [-1,1])blade(a,[[.245,branch*.125,.087,-.008],[.48,branch*.140,.062,.003],[.92,branch*.122,.043,.013]]);
  }else{
   // LX-pattern 17-inch wheels: an asymmetric, thick cast branch and thinner
   // neighbour form alternating broad and narrow openings around the rim.
   blade(a,[[.24,-.18,.19,-.004],[.43,-.13,.13,.003],[.72,-.060,.076,.013],[.92,.012,.120,.015]]);
   blade(a,[[.24,.18,.16,-.004],[.52,.205,.069,.004],[.78,.224,.055,.009],[.92,.263,.070,.015]]);

  }
 }
 const capR=rim*(amg?.259:.304),pad=y+side*.000;
 r.ringY(x,pad,z,capR,0,tint(skin,.91),32);
 for(let i=0;i<5;i++){
  const a=(i+.5)/5*Math.PI*2+Math.PI/2,xx=x+Math.cos(a)*capR*.748,zz=z+Math.sin(a)*capR*.748;
  r.ringY(xx,pad+side*.004,zz,.0086,0,'#323b3f',12);
  r.ringY(xx,pad+side*.007,zz,.0058,0,'#9ca6a7',6);
 }
 r.ringY(x,pad+side*.009,z,capR*.402,0,amg?'#a4aeb3':'#41494a',24);
}
