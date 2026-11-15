// Project a narrow panel joint onto the actual triangulated coachwork. The
// analytic loft and straight mesh facets diverge between their stations.
import {faceTriangles} from './mesh-triangles.js';

const cars=new WeakMap(), bias=.0012;
function makeSurface(faces){
  const bins=new Map();
  for(const f of faces){
    if((!f.paintNormal&&!f.vertexColors)||f.part==='shell.spoiler')continue;
    const idx=faceTriangles(f.points);
    for(let i=0;i<idx.length;i+=3){
      const tri=idx.slice(i,i+3).map(j=>f.points[j]);
      const range=tri.map(v=>v[0]);
      for(let b=Math.floor(Math.min(...range)*12);b<=Math.floor(Math.max(...range)*12);b++){
        if(!bins.has(b))bins.set(b,[]);bins.get(b).push(tri);
      }
    }
  }
  return bins;
}
function project(bins,p,side){
  const u=0,v=side?2:1,d=side?1:2,sign=side||1;
  let nearest=-Infinity;
  for(const [a,b,c] of bins.get(Math.floor(p[0]*12))||[]){
    const bu=b[u]-a[u],bv=b[v]-a[v],cu=c[u]-a[u],cv=c[v]-a[v],det=bu*cv-bv*cu;
    if(Math.abs(det)<1e-12)continue;
    const du=p[u]-a[u],dv=p[v]-a[v],w=(du*cv-dv*cu)/det,t=(bu*dv-bv*du)/det;
    if(w<-.00001||t<-.00001||w+t>1.00001)continue;
    nearest=Math.max(nearest,sign*(a[d]+w*(b[d]-a[d])+t*(c[d]-a[d])));
  }
  const result=[...p];result[d]=(Number.isFinite(nearest)?nearest*sign:p[d])+sign*bias;return result;
}
export function panelSeam(r,car,key,path,width,side,color){
  if(!r.faces)return;
  let stored=cars.get(car);
  if(!stored){stored={surface:makeSurface(r.faces),strips:new Map()};cars.set(car,stored);}
  let mesh=stored.strips.get(key);
  if(!mesh){
    const v=side?2:1,spine=[path[0]];
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[v]-a[v])/.032));
      for(let j=1;j<=n;j++)spine.push(a.map((value,k)=>value+(b[k]-value)*j/n));
    }
    const left=[],right=[];
    for(let i=0;i<spine.length;i++){
      const p=spine[i],a=spine[Math.max(0,i-1)],b=spine[Math.min(spine.length-1,i+1)];
      const dx=b[0]-a[0],dv=b[v]-a[v],scale=width*.5/Math.hypot(dx,dv);
      for(const [sign,edge] of [[-1,left],[1,right]]){
        const q=[...p];q[0]-=sign*dv*scale;q[v]+=sign*dx*scale;edge.push(project(stored.surface,q,side));
      }
    }
    // Each short station pair has its own two triangles. A single fan across a
    // curved door outline would fill the door instead of just the shut line.
    const n=left.length,indices=[];
    for(let i=1;i<n;i++){const a=i-1,b=i,c=2*n-1-i,d=2*n-i;indices.push(a,b,c,a,c,d);}
    let vertices=[...left,...right.reverse()];
    if(!side){
      // A small rolled edge gives the dark joint a visible face when the eye
      // looks along the deck. A planar decal vanishes at that grazing angle.
      const center=spine.map(p=>{const q=project(stored.surface,p,0);q[2]+=car.modern?.0065:.0020;return q;});
      vertices.push(...center);indices.length=0;
      for(let i=1;i<n;i++){
        const a=i-1,b=i,c=2*n-1-i,d=2*n-i,m=2*n+i-1,q=m+1;
        indices.push(a,b,q,a,q,m,m,q,c,m,c,d);
      }
    }
    mesh={vertices,indices};stored.strips.set(key,mesh);
  }
  r.polygon(mesh.vertices,color,false);
  const face=r.faces.at(-1);face.triangles=mesh.indices;face.panelJoint=side?'door':'deck';
}
