// Tessellate each authored boundary in its own best-fit plane. A fan is valid for
// convex faces; it can bridge real openings in a concave outline.
const cache=new WeakMap();
const fans=new Map();

function fan(count){
  if(!fans.has(count)){
    const indices=[];
    for(let k=2;k<count;k++)indices.push(0,k-1,k);
    fans.set(count,indices);
  }
  return fans.get(count);
}

function tessellate(points){
  if(points.length<=3)return fan(points.length);
  const normal=[0,0,0];
  const first=points[0];
  for(let k=1;k<points.length-1;k++){
    const a=points[k],b=points[k+1];
    for(let j=0;j<3;j++){
      const u=(j+1)%3,v=(j+2)%3;
      normal[j]+=(a[u]-first[u])*(b[v]-first[v])-(a[v]-first[v])*(b[u]-first[u]);
    }
  }
  let axis=0;for(let i=1;i<3;i++)if(Math.abs(normal[i])>Math.abs(normal[axis]))axis=i;
  if(!normal[axis])return [];
  const x=(axis+1)%3,y=(axis+2)%3,sign=Math.sign(normal[axis]);
  const turn=(a,b,c)=>sign*((points[b][x]-points[a][x])*(points[c][y]-points[a][y])-
    (points[b][y]-points[a][y])*(points[c][x]-points[a][x]));
  const epsilon=Math.abs(normal[axis])*1e-12;
  let concave=false;
  for(let i=0;i<points.length;i++)if(turn(i,(i+1)%points.length,(i+2)%points.length)<-epsilon){concave=true;break;}
  if(!concave)return fan(points.length);
  const ring=Array.from(points.keys()),triangles=[];
  // Skip repeated and straight vertices. Ear tests use the remaining boundary.
  while(ring.length>3){
    let clipped=false;
    for(let i=0;i<ring.length;i++){
      const a=ring[(i+ring.length-1)%ring.length],b=ring[i],c=ring[(i+1)%ring.length];
      const convex=turn(a,b,c);
      if(convex<-epsilon)continue;
      if(convex>epsilon && ring.some(j=>j!==a&&j!==b&&j!==c&&turn(a,b,j)>=-epsilon&&turn(b,c,j)>=-epsilon&&turn(c,a,j)>=-epsilon))continue;
      if(convex>epsilon)triangles.push(a,b,c);
      ring.splice(i,1);clipped=true;break;
    }
    // A zero-area remnant or self-intersecting boundary has no well-defined interior.
    if(!clipped)return triangles;
  }
  if(ring.length===3&&turn(...ring)>epsilon)triangles.push(...ring);
  return triangles;
}

export function faceTriangles(points){
  let indices=cache.get(points);
  if(!indices){indices=tessellate(points);cache.set(points,indices);}
  return indices;
}
