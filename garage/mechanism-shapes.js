// Revolved sections in arbitrary orientations. Profiles are [axial station, radius].
export const TAU=2*Math.PI;
export const metal='#b7c6c8', steel='#778d94', dark='#41555c', gold='#ceb276', copper='#c98253';
export const add=(a,b,k=1)=>a.map((v,i)=>v+k*b[i]);
export const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const unit=a=>a.map(v=>v/Math.hypot(...a));
const colors=new Map();
export function tint(c,k){
  const n=Math.round(k*80),id=c+n;
  if(!colors.has(id))colors.set(id,'#'+[1,3,5].map(i=>Math.min(255,Math.max(0,Math.round(parseInt(c.slice(i,i+2),16)*n/80))).toString(16).padStart(2,'0')).join(''));
  return colors.get(id);
}
export function basis(dir){
  const axis=unit(dir),ref=Math.abs(axis[2])>.85?[0,1,0]:[0,0,1];
  const u=unit(cross(axis,ref)),v=cross(axis,u);
  return [axis,u,v];
}
export function point(center,b,station,radius,angle){
  return center.map((q,i)=>q+b[0][i]*station+radius*(Math.cos(angle)*b[1][i]+Math.sin(angle)*b[2][i]));
}
export function turn(r,center,axis,profile,color,{n=24,start=0,sweep=TAU}={}){
  const b=basis(axis),q=(i,j)=>point(center,b,profile[j][0],profile[j][1],start+sweep*i/n);
  for(let i=0;i<n;i++)for(let j=1;j<profile.length;j++){
    if(profile[j-1][1]+profile[j][1]<=0)continue;
    const ring=[q(i,j-1),q(i+1,j-1),q(i+1,j),q(i,j)];
    const face=profile[j][1]===0?ring.slice(0,3):profile[j-1][1]===0?[ring[0],ring[2],ring[3]]:ring;
    r.polygon(face,tint(color,.84+.15*Math.sin(start+sweep*(i+.5)/n+.9)),false);
  }
  if(sweep<TAU-.00001){
    // Triangle strips extend a cross section to its inner wall; avoid fan-filling hollow bores.
    for(const i of [0,n])for(let j=1;j<profile.length;j++){
      if(profile[j][0]===profile[j-1][0])continue;
      const a=q(i,j-1),c=q(i,j),cap=.016;
      const inner=(s,pt)=>mix(pt,add(center,b[0],s),Math.min(1,cap/Math.max(.001,Math.hypot(...pt.map((v,k)=>v-center[k]-b[0][k]*s)))));
      r.polygon([a,c,inner(profile[j][0],c),inner(profile[j-1][0],a)],tint(color,1.09),false);
    }
  }
}
export function cyl(r,c,a,start,end,radius,color,n=20){
  turn(r,c,a,[[start,0],[start,radius],[end,radius],[end,0]],color,{n});
}
export function sleeve(r,c,a,start,end,outer,inner,color,n=22){
  turn(r,c,a,[[start,inner],[start,outer],[end,outer],[end,inner],[start,inner]],color,{n});
}
export function gear(r,center,axis,back,face,outer,tipRad,teeth,color,angle=0,boreFraction=.25){
  const b=basis(axis),p=(s,rad,theta)=>point(center,b,s,rad,theta);
  turn(r,center,axis,[[back,outer*boreFraction],[back,outer*.88],[face,tipRad*.88],[face,tipRad*boreFraction],[back,outer*boreFraction]],color,{n:teeth*2});
  for(let i=0;i<teeth;i++){
    const t=TAU*i/teeth+angle,delta=TAU/teeth;
    const corners=(s,rad)=>[[-.42,.875],[-.23,1],[.18,1],[.39,.875]].map(([off,f])=>p(s,rad*f,t+delta*off));
    const a=corners(back,outer),f=corners(face,tipRad);
    r.polygon(a,tint(color,.78),false);r.polygon(f,color,false);
    for(let j=0;j<3;j++)r.polygon([a[j],a[j+1],f[j+1],f[j]],tint(color,j===1?1.19:.86),false);
  }
}
export function bead(r,c,rad,color,n=12){
  const profile=Array.from({length:9},(_,i)=>{const a=-Math.PI/2+i*Math.PI/8;return [rad*Math.sin(a),i===0||i===8?0:rad*Math.cos(a)];});
  turn(r,c,[0,0,1],profile,color,{n});
}
export const part=(id,name,description,offset,draw)=>({id,name,description,offset,draw});
export function study(id,name,description,source,parts,motionDescription=''){
  const group={id,name,description,source,parts:parts.map(({draw,...p})=>({...p,id:id+'.'+p.id}))};
  return {id,name,description,source,groups:[group],animated:!!motionDescription,motionDescription,
    draw(r,phase=0,paint){for(const p of parts)r.tag(id+'.'+p.id,()=>p.draw(r,phase,paint));}};
}
export const z=[0,0,1],y=[0,1,0],x=[1,0,0],origin=[0,0,0];
