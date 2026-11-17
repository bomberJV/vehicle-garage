import {tint} from './road-primitives.js';

const TAU=Math.PI*2;
// 17-inch Carrera wheel of the 1999 911 Carrera (7J front, 9J rear). Five
// spokes twist in the same direction from a flat hub to the rim flange, as in
// the rescue sheet's side view and the photographs of a US car.
export function alloy996(r,{x,y,z,rim,width,side,finish}){
  const beadWidth=(width>.23?9:7)*.0254,lip=y+side*(beadWidth*.5+.006);
  const point=(angle,radius,inset)=>[x+radius*Math.cos(angle),lip-side*inset,z+radius*Math.sin(angle)];
  function band(inner,outer,count,color,shade){
    const vertices=[],indices=[],colors=[];
    for(let i=0;i<=count;i++){
      vertices.push(inner(i/count),outer(i/count));
      if(shade)colors.push(tint(color,shade[0]),tint(color,shade[1]));
      if(i){const k=i*2;indices.push(k-2,k-1,k+1,k-2,k+1,k);}
    }
    r.polygon(vertices,color,false);
    const face=r.faces.at(-1);face.triangles=indices;if(shade)face.vertexColors=colors;
  }
  const circle=(radius,inset)=>u=>point(u*TAU,radius,inset);
  const ring=(ra,da,rb,db,color,shade)=>band(circle(ra*rim,da),circle(rb*rim,db),60,color,shade);
  // Barrel in the wheel-well shadow, then the polished flange.
  ring(.905,beadWidth+.010,.905,.010,'#2c3135');
  ring(.905,beadWidth+.010,1,beadWidth+.014,tint(finish,.64));
  ring(.885,.022,.93,.004,tint(finish,.80));
  ring(.93,.004,1,0,tint(finish,1.10));
  // Spoke face depth: dished from the flange to a flat hub.
  const depth=k=>.024-.020*Math.min(1,Math.max(0,(k-.40)/.52))**.9;
  const twist=k=>.36*((k-.36)/.56)**1.15;
  const halfWidth=k=>.27-.14*Math.min(1,(k-.36)/.56)**.7;
  const radii=[.36,.42,.50,.58,.66,.74,.82,.88,.905];
  for(let spoke=0;spoke<5;spoke++){
    const axis=Math.PI/2+spoke*TAU/5;
    const edge=(k,sgn,d=0)=>point(axis+twist(k)+sgn*halfWidth(k),k*rim,depth(k)+d);
    for(let i=1;i<radii.length;i++){
      const a=radii[i-1],b=radii[i];
      // The leading flank catches the light; the trailing flank is in shade.
      const quad=[edge(a,-1),edge(b,-1),edge(b,1),edge(a,1)];
      r.polygon(quad,finish,false);
      r.faces.at(-1).vertexColors=[.86,.88,1.06,1.04].map(f=>tint(finish,f));
    }
    for(const sgn of [-1,1])band(u=>edge(radii[0]+(radii.at(-1)-radii[0])*u,sgn),u=>edge(radii[0]+(radii.at(-1)-radii[0])*u,sgn,.020),8,tint(finish,sgn<0?.50:.40));
  }
  // Window floors: the dark brake and barrel beyond each opening.
  const hubR=.36*rim,capR=.034,lugR=.065;
  const hubDepth=depth(.36);
  const hub=[];
  for(let i=0;i<=40;i++)hub.push(point(i*TAU/40,hubR,hubDepth));
  band(u=>hub[Math.round(u*40)],u=>point(u*TAU,capR,hubDepth),40,finish,[.92,1.04]);
  // Five wheel bolts on the 130 mm circle, between the spoke roots.
  for(let i=0;i<5;i++){
    const a=Math.PI/2+(i+.5)*TAU/5;
    const c=[x+lugR*Math.cos(a),z+lugR*Math.sin(a)];
    const at=(rad,d,t)=>[c[0]+rad*Math.cos(t),lip-side*d,c[1]+rad*Math.sin(t)];
    band(u=>at(.0105,hubDepth-.0005,u*TAU),u=>at(.0090,hubDepth+.006,u*TAU),14,tint(finish,.52));
    r.polygon(Array.from({length:6},(_,j)=>at(.0078,hubDepth+.0045,a+j*TAU/6)),'#3f4447',false);
  }
  const disc=(rad,d,color)=>r.polygon(Array.from({length:30},(_,i)=>point(i*TAU/30,rad,d)),color,false);
  disc(capR,hubDepth-.0006,'#3d4245');disc(capR-.002,hubDepth-.0012,tint(finish,1.02));
  const crest=[[-.009,.010],[.009,.010],[.008,-.003],[0,-.012],[-.008,-.003]].map(([dx,dz])=>[x+dx,lip-side*(hubDepth-.002),z+dz]);
  r.polygon(crest,'#9d8554',false);
}
