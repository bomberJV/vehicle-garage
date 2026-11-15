import {glazingFace} from './surface-materials.js';

const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

// Replace each sharp corner with a short quadratic. The original edges and
// the inset edge share vertices, so the rubber and glazing cannot overlap.
function cornerFillets(corners,radius) {
  const edge=[];
  for(let i=0;i<corners.length;i++){
    const p=corners[i],previous=corners[(i+corners.length-1)%corners.length],next=corners[(i+1)%corners.length];
    const toward=q=>lerp(p,q,Math.min(.27,radius/Math.hypot(...q.map((v,j)=>v-p[j]))));
    const a=toward(previous),b=toward(next);
    for(let n=0;n<=4;n++){const t=n/4;edge.push(lerp(lerp(a,p,t),lerp(p,b,t),t));}
  }
  return edge;
}

export function fittedWindow(r,corners,{privacy=false,radius=.036,seal=.010,sideCrown=0,frameless=false}={}){
  const middle=corners[0].map((_,j)=>corners.reduce((sum,p)=>sum+p[j],0)/corners.length);
  const edge=cornerFillets(corners,radius);
  const sill=Math.min(...corners.map(p=>p[2]));
  const height=Math.max(...corners.map(p=>p[2]))-sill;
  const clear=edge.map(p=>lerp(p,middle,Math.min(.15,seal*2/Math.max(.1,height))));
  const pane=(points)=>glazingFace(r,points,privacy?'#557079':'#8daab1',privacy?.53:.29);
  const crown=p=>[p[0],p[1]+sideCrown,p[2]];
  const center=crown(middle);
  const inside=clear.map(p=>{
    const q=lerp(p,middle,.5);
    return [q[0],q[1]+sideCrown*.75,q[2]];
  });
  for(let i=0;i<edge.length;i++){
    const j=(i+1)%edge.length;
    const bareEdge=frameless&&(edge[i][2]+edge[j][2])/2>sill+height*.12;
    if(bareEdge){
      pane([edge[i],edge[j],clear[j],clear[i]]);
      const inner=p=>[p[0],p[1]-Math.sign(sideCrown)*.004,p[2]];
      r.polygon([edge[i],inner(edge[i]),inner(edge[j]),edge[j]],'#829a96',false);
    }else r.polygon([edge[i],edge[j],clear[j],clear[i]],'#2d373a',false);
    if(sideCrown){
      pane([clear[i],clear[j],inside[j],inside[i]]);
      pane([center,inside[i],inside[j]]);
    }else pane([middle,clear[i],clear[j]]);
  }
}

// All three spokes share one center and one body-up vector. Only the relief
// protrudes along the mounting normal, independent of the orbit camera.
export function starBadge(r,origin,radius,axis,facing,{backing=true}={}){
  const position=(h,v,relief=0)=>axis==='x'
    ?[origin[0]+facing*relief*radius,origin[1]+h*radius,origin[2]+v*radius]
    :[origin[0]+h*radius,origin[1]+facing*relief*radius,origin[2]+v*radius];
  const ring=(t,scale,depth)=>position(Math.cos(t)*scale,Math.sin(t)*scale,depth);
  const N=48;
  if(backing)r.polygon(Array.from({length:N},(_,i)=>ring(i/N*Math.PI*2,.99,0)),'#303638',false);
  for(let i=0;i<N;i++){
    const a=i/N*2*Math.PI,b=(i+1)/N*2*Math.PI;
    for(const [ri,ro,di,doo,col] of [[.915,.956,.025,.059,'#a7b2b2'],[.956,1,.059,.026,'#d8dcd9']]){
      r.polygon([ring(a,ri,di),ring(a,ro,doo),ring(b,ro,doo),ring(b,ri,di)],col,false);
    }
  }
  for(const [h,v] of [[0,1],[-Math.sqrt(3)/2,-.5],[Math.sqrt(3)/2,-.5]]){
    const tip=position(h*.946,v*.946,.044),ridge=position(0,0,.100);
    const left=position(-.151*v-.077*h,.151*h-.077*v,.027);
    const right=position(.151*v-.077*h,-.151*h-.077*v,.027);
    r.polygon([left,tip,ridge],'#e2e4df',false);
    r.polygon([ridge,tip,right],'#9ca7a8',false);
  }
}

// Left-hand-drive layout. A raked wheel and column sit behind the instrument
// binnacle rather than sharing the windshield plane.
export function driverControls(r,[x,y,z],radius=.164,spokes=4){
  const center=[x,y,z],point=a=>[x-.044*Math.sin(a),y+radius*Math.cos(a),z+radius*.91*Math.sin(a)];
  for(let n=0;n<28;n++)r.rod(point(n/28*Math.PI*2),point((n+1)/28*Math.PI*2),.012,'#30373a',7);
  const angles=spokes===3?[.11,Math.PI-.11,Math.PI*1.5]:[.11,Math.PI-.11,Math.PI*1.27,Math.PI*1.73];
  for(const a of angles)r.rod(center,point(a),.014,'#464e50',8);
  r.box(x-.030,y-.057,z-.035,x+.021,y+.057,z+.035,'#454c4d');
  r.rod([x-.168,y,z-.077],center,.034,'#3a4244',10);
  r.profile([[x-.256,z+.002],[x-.215,z+.088],[x-.142,z+.083],[x-.110,z+.023]],y-.162,y+.162,'#343c40');
}
