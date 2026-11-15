import {tint} from './road-primitives.js';

const TAU=Math.PI*2;
// Porsche Cars N.A. bulletin 4/97-4440 (August 1998), p. 5 (Cup Design '93).
// A continuous cast face joins the five paddles, the hub and the outer flange.
export function alloy993(r,{x,y,z,rim,width,side,finish}){
  const beadWidth=(width>.225?9:7)*.0254, lip=y+side*(beadWidth*.5+.0065);
  const point=(angle,radius,inset)=>[x+radius*Math.cos(angle),lip-side*inset,z+radius*Math.sin(angle)];
  function band(inner,outer,count,color){
    const vertices=[],indices=[];
    for(let i=0;i<=count;i++){
      vertices.push(inner(i/count),outer(i/count));
      if(i){const k=i*2;indices.push(k-2,k-1,k+1,k-2,k+1,k);}
    }
    r.polygon(vertices,color,false);r.faces.at(-1).triangles=indices;
  }
  const circle=(radius,inset)=>u=>point(u*TAU,radius,inset);
  const ring=(ra,da,rb,db,color)=>band(circle(ra*rim,da),circle(rb*rim,db),60,color);
  ring(.911,beadWidth+.009,.911,.008,'#4b5359');
  ring(.911,beadWidth+.009,1,beadWidth+.013,tint(finish,.67));
  ring(.90,.015,.937,.001,tint(finish,.83));
  ring(.937,.001,1,0,tint(finish,1.09));
  // The inner contour traces one kidney-shaped opening. Its polar counterpart
  // on the sector perimeter joins the neighbouring sector without overlapping.
  const section=[[-.31,.53],[-.40,.62],[-.418,.74],[-.398,.816],[-.316,.865],[-.17,.887],[0,.892],[.18,.876],[.33,.836],[.402,.778],[.40,.69],[.33,.60],[.21,.513],[.086,.472],[-.047,.47],[-.204,.489]];
  const boundary=[[-.628,.395],[-.615,.47],[-.628,.69],[-.628,.913],[-.47,.931],[-.23,.931],[0,.931],[.23,.931],[.47,.931],[.628,.913],[.628,.69],[.628,.47],[.628,.395],[.25,.395],[0,.395],[-.25,.395]];
  const skinDepth=k=>.027-.024*Math.sin(Math.PI*Math.max(0,Math.min(1,(k-.33)/.65))*.80);
  for(let spoke=0;spoke<5;spoke++){
    const axis=spoke*TAU/5+Math.PI/2,at=(row,i,d=0)=>{const [a,k]=row[i%row.length];return point(axis+a,k*rim,skinDepth(k)+d);};
    const outline=i=>at(section,i),outer=i=>at(boundary,i),wall=i=>at(section,i,.016);
    for(let i=0;i<section.length;i++){
      const face=[outline(i),outline(i+1),outer(i+1),outer(i)];
      r.polygon(face,finish,false);r.faces.at(-1).vertexColors=[.83,.84,1.04,1.04].map(f=>tint(finish,f));
    }
    band(u=>outline(Math.round(u*section.length)),u=>wall(Math.round(u*section.length)),section.length,tint(finish,.56));
  }
  // Five recesses on the 130 mm bolt circle. Each pocket is a genuine hole
  // through the hub surface with a conical seat and a hexagonal wheel nut.
  const capR=.0355,hubR=.395*rim,lugR=.065;
  const circleAt=(a,cr,radius,inset,theta)=>[x+cr*Math.cos(a)+radius*Math.cos(theta),lip-side*inset,z+cr*Math.sin(a)+radius*Math.sin(theta)];
  const hubDepth=skinDepth(.395);
  for(let i=0;i<5;i++){
    const a=Math.PI/2+(i+.5)*TAU/5;
    const perimeter=[];
    for(let j=0;j<=6;j++)perimeter.push(point(a-.62832+j*1.25664/6,hubR,hubDepth));
    for(let j=6;j>=0;j--)perimeter.push(point(a-.62832+j*1.25664/6,capR,hubDepth));
    // Connect every sector corner to the facing point on the circular pocket.
    const theta=p=>Math.atan2(p[2]-z-lugR*Math.sin(a),p[0]-x-lugR*Math.cos(a));
    const rimOfLug=i=>circleAt(a,lugR,.0102,hubDepth+.0006,theta(perimeter[i%perimeter.length]));
    band(u=>perimeter[Math.round(u*perimeter.length)%perimeter.length],u=>rimOfLug(Math.round(u*perimeter.length)),perimeter.length,finish);
    band(u=>circleAt(a,lugR,.0102,hubDepth,TAU*u),u=>circleAt(a,lugR,.0088,hubDepth+.006,TAU*u),14,tint(finish,.54));
    const nut=Array.from({length:6},(_,j)=>circleAt(a,lugR,.0078,hubDepth+.0048,a+j*TAU/6));
    r.polygon(nut,'#44494c',false);
  }
  const disc=(rad,depth,color)=>r.polygon(Array.from({length:30},(_,i)=>point(i*TAU/30,rad,depth)),color,false);
  disc(capR,hubDepth,'#424749');disc(capR-.0018,hubDepth-.0008,tint(finish,1.01));
  const crest=[[-.009,.010],[.009,.010],[.008,-.003],[0,-.012],[-.008,-.003]].map(([dx,dz])=>[x+dx,lip-side*(hubDepth-.0015),z+dz]);
  r.polygon(crest,'#9d8554',false);
}
