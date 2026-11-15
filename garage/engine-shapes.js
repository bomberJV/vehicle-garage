export function engineShapes(r,transform=p=>p){
 const poly=(pts,c)=>r.polygon(pts.map(transform),c,false);
 const box=(x0,y0,z0,x1,y1,z1,c)=>{const p=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];for(const [ix,f]of [[0,[0,1,5,4]],[1,[3,7,6,2]],[2,[0,4,7,3]],[3,[1,2,6,5]],[4,[4,5,6,7]],[5,[0,3,2,1]]])poly(f.map(i=>p[i]),tone(c,[.85,1,.75,.76,1.12,.65][ix]));};
 const basis=(a,b)=>{const v=b.map((q,i)=>q-a[i]),l=Math.hypot(...v),n=v.map(q=>q/l),ref=Math.abs(n[2])<.8?[0,0,1]:[0,1,0];let u=[n[1]*ref[2]-n[2]*ref[1],n[2]*ref[0]-n[0]*ref[2],n[0]*ref[1]-n[1]*ref[0]],d=Math.hypot(...u);u=u.map(q=>q/d);return [u,[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]]];};
 const cyl=(a,b,radius,c,N=10,caps=true)=>{if(Math.hypot(...b.map((q,i)=>q-a[i]))<1e-8)return;const [u,v]=basis(a,b),ring=o=>Array.from({length:N},(_,i)=>o.map((q,j)=>q+radius*(Math.cos(i/N*Math.PI*2)*u[j]+Math.sin(i/N*Math.PI*2)*v[j]))),A=ring(a),B=ring(b);for(let i=0;i<N;i++)poly([A[i],B[i],B[(i+1)%N],A[(i+1)%N]],tone(c,.82+.18*Math.sin(i/N*Math.PI*2)));if(caps){poly(A,c);poly(B,c);}};
 const tube=(a,b,outer,inner,c,N=12)=>{const [u,v]=basis(a,b),ring=(o,rad)=>Array.from({length:N},(_,i)=>o.map((q,j)=>q+rad*(Math.cos(i/N*Math.PI*2)*u[j]+Math.sin(i/N*Math.PI*2)*v[j]))),A=ring(a,outer),B=ring(b,outer),C=ring(a,inner),D=ring(b,inner);for(let i=0;i<N;i++){const j=(i+1)%N;poly([A[i],B[i],B[j],A[j]],c);poly([C[i],C[j],D[j],D[i]],tone(c,.7));poly([A[i],A[j],C[j],C[i]],tone(c,1.1));poly([B[i],D[i],D[j],B[j]],c);}};
 const route=(points,rad,c,N=8)=>{for(let i=1;i<points.length;i++)cyl(points[i-1],points[i],rad,c,N);};
 return {poly,box,cyl,tube,route};
}
export function tone(c,f){return '#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(c.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');}
