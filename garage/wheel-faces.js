// Geometry is traced schematically from the front elevation in the linked
// wheel plate or product photograph. Coordinates are in metres.
import {tint} from './road-primitives.js';
import {alloy993} from './porsche993-alloy.js';
const TAU=Math.PI*2;
const rings={
  edition507:[[.23,0,.087,-.007],[.49,.16,.065,.004],[.71,.19,.049,.015],[.94,.23,.038,.022]],
  // Style 44: seven flat, straight spokes that widen slightly toward the rim.
  style44:[[.29,0,.27,-.006],[.52,0,.155,.003],[.75,0,.123,.010],[.94,0,.108,.016]],
  style68:[[.24,0,.120,-.008],[.46,.096,.091,.002],[.72,.15,.075,.014],[.94,.182,.062,.022]],
  hpd:[[.27,0,.13,-.008],[.62,.03,.092,.003],[.76,.113,.063,.013],[.94,.205,.065,.019]],
  sportclassic:[[.29,0,.105,-.008],[.51,.013,.060,.000],[.71,.113,.036,.010],[.87,.20,.032,.015]],
  rsspyd:[[.28,0,.098,-.005],[.48,.026,.073,.003],[.75,.10,.038,.015],[.94,.133,.031,.022]]
};
const faceProfiles={
  edition507:{arms:5,paired:true},
  style44:{arms:7},style68:{arms:5,paired:true},hpd:{arms:5,paired:true},
  sportclassic:{arms:10,paired:true},rsspyd:{arms:10,paired:true}
};
function flatDisc(r,x,y,z,rad,count,color,phase=0){
  r.polygon(Array.from({length:count},(_,i)=>[x+rad*Math.cos(phase+i*TAU/count),y,z+rad*Math.sin(phase+i*TAU/count)]),color,false);
}
function bajaWeb(r,point,finish){
  // The web surrounds eight actual circular ports. In each of eight sectors,
  // zip the hole circumference to its enclosing cell (two arcs, two radii).
  const steps=16,outer=.918,inner=.45,center=.689,hole=.125;
  for(let i=0;i<8;i++){
    const axis=i*TAU/8+Math.PI/8;
    const port=[],back=[],cell=[];
    for(let j=0;j<steps;j++){
      const t=j*TAU/steps,c=Math.cos(t),s=Math.sin(t);
      const tangent=c*hole,radial=center+s*hole;
      const angle=axis+Math.atan2(tangent,radial),radius=Math.hypot(tangent,radial);
      port.push(point(angle,radius,.008+.009*s));
      back.push(point(angle,radius,-.001+.009*s));
      // The outer loop follows both concentric arcs and both straight sector
      // boundaries. At 45-degree intervals it passes through each exact corner.
      const scale=1/Math.max(Math.abs(c),Math.abs(s));
      const radiusAtEdge=inner+(outer-inner)*(1+s*scale)/2;
      cell.push(point(axis+c*scale*Math.PI/8,radiusAtEdge,-.010+.039*(radiusAtEdge-inner)/(outer-inner)));
    }
    for(let j=0;j<steps;j++){
      const k=(j+1)%steps;
      r.polygon([port[j],cell[j],cell[k],port[k]],tint(finish,.94+.07*Math.sin(j*TAU/steps)),false);
      r.polygon([port[j],port[k],back[k],back[j]],tint(finish,.54),false);
    }
  }
}
// A true fork shares the exact cross section between its stem and two arms.
// Joining the arms this way avoids overlapping faces at the crotch of the Y.
function forkedFace(r,point,id,finish){
  const spec=rings[id],count=faceProfiles[id].arms;
  const offset=(p,delta)=>[p[0],p[1]+delta,p[2]];
  const depth=point(0,0,-.012)[1]-point(0,0,0)[1];
  function blade(angle,sections,tone){
    const left=[],right=[];
    for(const [radius,lean,width,depth] of sections){
      left.push(point(angle+lean-width,radius,depth));
      right.push(point(angle+lean+width,radius,depth));
    }
    const front=left.concat(right.slice().reverse());
    r.polygon(front,tint(finish,tone),false);
    r.polygon(front.map(p=>offset(p,depth)),tint(finish,.59),false);
    for(const rail of [left,right])r.polygon([...rail,...rail.slice().reverse().map(p=>offset(p,depth))],tint(finish,.53),false);
  }
  for(let i=0;i<count;i++){
    const angle=Math.PI/2+i*TAU/count;
    const [base,split,middle,tip]=spec;
    blade(angle,[base,[split[0],0,split[2],split[3]]],.92);
    for(const direction of [-1,1]){
      const branchStart=[split[0],direction*split[2]/2,split[2]/2,split[3]];
      const splay=([radius,lean,width,depth])=>[radius,direction*lean,width,depth];
      blade(angle,[branchStart,splay(middle),splay(tip)],direction<0?1.04:.90);
    }
  }
}
export function drawWheelFace(r,design,{x,y,z,side,rim,finish}){
  const point=(a,ratio,depth)=>[x+rim*ratio*Math.cos(a),y+side*depth,z+rim*ratio*Math.sin(a)];
  const id=design.id;
  if(id==='baja')bajaWeb(r,point,finish);
  else if(['sportclassic','rsspyd','hpd'].includes(id))forkedFace(r,point,id,finish);
  else {
    const {arms,paired}=faceProfiles[id];
    for(let i=0;i<arms;i++){
      const angle=Math.PI/2+i*TAU/arms;
      for(const branch of paired?[-1,1]:[1]){
        const section=(station,edge,back=false)=>{
          const [rad,lean,width,depth]=station;
          const asym=id==='style68'?(branch<0?.79:1.18):1;
          const sweep=id==='style68'?.085*rad:0;
          return point(angle+sweep+branch*lean+edge*width*asym,rad,depth-(back?.012:0)+(edge===0?.003:0));
        };
        const stations=rings[id];
        for(let j=1;j<stations.length;j++){
          const a=stations[j-1],b=stations[j];
          for(const edge of [-1,1]){
            r.polygon([section(a,edge),section(b,edge),section(b,0),section(a,0)],tint(finish,edge<0?1.04:.83),false);
            r.polygon([section(a,edge),section(a,edge,true),section(b,edge,true),section(b,edge)],tint(finish,.59),false);
          }
        }
      }
    }
  }
  const hubRadius=Math.max(design.boltCircle/2000+.011,rim*(id==='baja'?.46:.29)),hubY=y+side*(id==='baja'?-.010:-.005);
  flatDisc(r,x,hubY,z,hubRadius,28,tint(finish,.92));
  for(let i=0;i<design.lugs;i++){
    const a=(i+.5)*TAU/design.lugs+Math.PI/2,bolt=design.boltCircle/2000;
    const dx=x+Math.cos(a)*bolt,dz=z+Math.sin(a)*bolt;
    flatDisc(r,dx,hubY+side*.002,dz,.0091,10,'#394044');
    flatDisc(r,dx,hubY+side*.004,dz,.0066,6,tint(finish,.9),a);
  }
  flatDisc(r,x,hubY+side*.006,z,hubRadius*(id==='baja'?.62:.47),24,tint(finish,1.1));

}
export function drawAlternativeAlloy(r,design,c){
  // The 17-inch Cup II is the Cup Design '93 of the 16-inch stock wheel.
  if(design.id==='cupii')return alloy993(r,c);
  const {x,y,z,side,rim,width,finish}=c,lip=y+side*width*.507;
  const inner=design.id==='sportclassic'?.862:.917;
  r.ringY(x,lip,z,rim,rim*inner,tint(finish,1.14),32);
  r.tubeY(x,y-side*width*.31,lip,z,rim*inner,'#4b5255',32);
  drawWheelFace(r,design,{...c,y:lip-side*.023});
}

export function drawApex6(r,{x,y,z,width,rim,finish}){
  const N=32,lip=width*.49;
  for(const s of [-1,1]){
    r.ringY(x,y+s*lip,z,rim,rim*.916,tint(finish,1.04),N);
    r.ringY(x,y+s*width*.393,z,rim*.235,rim*.073,tint(finish,.91),24);
  }
  r.tubeY(x,y-lip,y+lip,z,rim*.916,tint(finish,.6),N);
  r.tubeY(x,y-width*.393,y+width*.393,z,rim*.235,tint(finish,.79),24);
  r.tubeY(x,y-width*.393,y+width*.393,z,rim*.073,'#50565a',20);
  for(let j=0;j<6;j++){
    const angle=j*TAU/6+Math.PI/2;
    const stations=[[.22,-.05,.23,width*.33],[.46,.035,.108,width*.24],[.71,.055,.074,width*.20],[.925,.046,.090,width*.23]];
    const vertex=([radius,lean,spread,halfDepth],edge,side)=>[x+rim*radius*Math.cos(angle+lean+edge*spread),y+side*halfDepth,z+rim*radius*Math.sin(angle+lean+edge*spread)];
    for(let k=1;k<stations.length;k++){
      const a=stations[k-1],b=stations[k];
      for(const side of [-1,1]){
        for(const edge of [-1,1]){
          r.polygon([vertex(a,edge,side),vertex(b,edge,side),vertex(b,0,side*.86),vertex(a,0,side*.86)],tint(finish,edge===side?1.03:.83),false);
        }
        r.polygon([vertex(a,side,-1),vertex(a,side,1),vertex(b,side,1),vertex(b,side,-1)],tint(finish,.63),false);
      }
    }
  }
}
