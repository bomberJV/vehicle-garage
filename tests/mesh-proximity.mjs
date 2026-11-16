// Exact triangle-mesh proximity in world space (metres), shared by the installed
// clearance tests. Each pair of triangles is tested for crossing and then
// measured point-to-triangle and edge-to-edge.
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const distance=(a,b)=>Math.hypot(...sub(a,b));
function closestOnTriangle(p,a,b,c){
  const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a),d1=dot(ab,ap),d2=dot(ac,ap);
  if(d1<=0&&d2<=0)return a;
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);if(d3>=0&&d4<=d3)return b;
  const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0)return lerp(a,b,d1/(d1-d3));
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);if(d6>=0&&d5<=d6)return c;
  const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0)return lerp(a,c,d2/(d2-d6));
  const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0)return lerp(b,c,(d4-d3)/((d4-d3)+(d5-d6)));
  const den=1/(va+vb+vc);
  return a.map((v,i)=>v+ab[i]*vb*den+ac[i]*vc*den);
}
function closestSegments(p1,q1,p2,q2){
  const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r),eps=1e-18;
  const clamp=v=>Math.min(1,Math.max(0,v));
  let s=0,t=0;
  if(a<=eps&&e>eps)t=clamp(f/e);
  else if(a>eps){
    const c=dot(d1,r);
    if(e<=eps)s=clamp(-c/a);
    else{
      const b=dot(d1,d2),den=a*e-b*b;
      s=den>eps?clamp((b*f-c*e)/den):0;t=(b*s+f)/e;
      if(t<0){t=0;s=clamp(-c/a);}else if(t>1){t=1;s=clamp((b-c)/a);}
    }
  }
  return [lerp(p1,q1,s),lerp(p2,q2,t)];
}
// Where the segment p-q passes through triangle abc, or null.
function piercing(p,q,a,b,c){
  const n=cross(sub(b,a),sub(c,a)),nn=dot(n,n);if(nn<1e-30)return null;
  const dp=dot(n,sub(p,a)),dq=dot(n,sub(q,a));
  if((dp>0&&dq>0)||(dp<0&&dq<0)||dp===dq)return null;
  const x=lerp(p,q,dp/(dp-dq));
  return [[a,b],[b,c],[c,a]].every(([u,v])=>dot(cross(sub(v,u),sub(x,u)),n)>=-1e-15*nn)?x:null;
}
function triangleDistance(A,B){
  for(let i=0;i<3;i++){
    const at=piercing(A[i],A[(i+1)%3],...B)||piercing(B[i],B[(i+1)%3],...A);
    if(at)return {d:0,crossing:true,at};
  }
  let best={d:Infinity};
  const keep=(a,b)=>{const d=distance(a,b);if(d<best.d)best={d,a,b};};
  for(const p of A)keep(p,closestOnTriangle(p,...B));
  for(const p of B)keep(closestOnTriangle(p,...A),p);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)keep(...closestSegments(A[i],A[(i+1)%3],B[j],B[(j+1)%3]));
  return best;
}
export function worldTriangles(faces,keep){
  const out=[];
  for(const face of faces){
    if(!keep(face))continue;
    for(let k=0;k<face.triangles.length;k+=3){
      const t=[0,1,2].map(j=>face.points[face.triangles[k+j]]);
      out.push({t,min:[0,1,2].map(i=>Math.min(...t.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...t.map(p=>p[i])))});
    }
  }
  return out;
}
// The smallest distance between two meshes, the number of triangle pairs that
// cross, and a point on each crossing.
export function meshSeparation(A,B){
  let best={d:Infinity};const crossings=[];
  for(const a of A)for(const b of B){
    if([0,1,2].some(i=>a.min[i]-b.max[i]>best.d||b.min[i]-a.max[i]>best.d))continue;
    const r=triangleDistance(a.t,b.t);
    if(r.crossing)crossings.push(r.at);
    if(r.d<best.d)best=r;
  }
  return {...best,crossings:crossings.length,crossingPoints:crossings};
}
export const mm=n=>Math.round(n*10000)/10;
