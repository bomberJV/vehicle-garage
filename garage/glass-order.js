// A BSP splits crossing transparent triangles. The order is exact at each
// covered pixel and can be traversed from any orthographic camera direction.
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const axisNormals=[[1,0,0],[0,1,0],[0,0,1]];
function surfacePlane(points){
  const a=points[0],b=points[1],c=points[2];
  const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]);
  const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
  const len=Math.hypot(...n);if(len<1e-14)return null;
  const normal=n.map(v=>v/len);return {normal,d:dot(normal,a)};
}
function partition(items,normal,d,epsilon){
  const low=[],high=[],on=[];
  for(const item of items){
    const points=item.points,dist=points.map(p=>dot(normal,p)-d);
    const pos=dist.some(v=>v>epsilon),neg=dist.some(v=>v< -epsilon);
    if(!pos){(neg?low:on).push(item);continue;}
    if(!neg){high.push(item);continue;}
    const before=[],after=[];
    for(let j=0;j<points.length;j++){
      const k=(j+1)%points.length,a=points[j],b=points[k],u=dist[j],v=dist[k];
      if(u<=epsilon)before.push(a);if(u>=-epsilon)after.push(a);
      if((u>epsilon&&v< -epsilon)||(u< -epsilon&&v>epsilon)){
        const t=u/(u-v),intersection=a.map((n,i)=>n+(b[i]-n)*t);
        before.push(intersection);after.push(intersection);
      }
    }
    low.push({...item,points:before});high.push({...item,points:after});
  }
  return {low,high,on};
}

function build(items,epsilon){
  if(!items.length)return null;
  if(items.length===1)return {on:items};
  // Glazing generally consists of distributed panels. First partition along a
  // long dimension to keep thousands of small windows out of each other's BSPs.
  if(items.length>16){
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(const f of items)for(const p of f.points)for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}
    const axes=[0,1,2].sort((a,b)=>(max[b]-min[b])-(max[a]-min[a]));
    for(const k of axes){
      if(max[k]-min[k]<epsilon*8)continue;
      const d=(max[k]+min[k])*.5,normal=axisNormals[k];let l=0,h=0;
      for(const f of items){
        let lo=true,hi=true;
        for(const p of f.points){if(p[k]>d+epsilon)lo=false;if(p[k]<d-epsilon)hi=false;}
        if(lo)l++;if(hi)h++;
      }
      if(Math.min(l,h)<items.length*.18 || l+h<items.length*.76)continue;
      const {low,high,on}=partition(items,normal,d,epsilon);
      return {normal,on,low:build(low,epsilon),high:build(high,epsilon)};
    }
  }
  const seed=items[items.length>>1],plane=seed.plane;
  const {low,high,on}=partition(items,plane.normal,plane.d,epsilon);
  return {normal:plane.normal,on,low:build(low,epsilon),high:build(high,epsilon)};
}

export function glassOrder(faces,indices,direction,state){
  const geometry=faces.map(face=>face.points);
  let tree=state.glassTree;
  if(!tree || geometry.length!==tree.geometry.length || geometry.some((p,i)=>p!==tree.geometry[i])){
    const items=[];let extent=1;
    faces.forEach((f,i)=>{
      const triangles=indices[i];
      for(let j=0;j<triangles.length;j+=3){
        const points=[f.points[triangles[j]],f.points[triangles[j+1]],f.points[triangles[j+2]]];
        const plane=surfacePlane(points);if(!plane)continue;
        for(const p of points)extent=Math.max(extent,Math.abs(p[0]),Math.abs(p[1]),Math.abs(p[2]));
        items.push({points,face:i,plane});
      }
    });
    tree={geometry,root:build(items,extent*1e-9)};state.glassTree=tree;
  }
  const ordered=[];
  function visit(node){
    if(!node)return;
    const forward=!node.normal||dot(node.normal,direction)>=0;
    visit(forward?node.low:node.high);
    for(const poly of node.on)ordered.push(poly);
    visit(forward?node.high:node.low);
  }
  visit(tree.root);return ordered;
}
