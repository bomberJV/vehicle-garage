import {origin} from './exploded-layout.js';

// The camera is orthographic. Between two translation keyframes every vertex
// stays inside the rectangle enclosing those endpoint projections.
export function travelFrame(layout,{right,down},animated,manual){
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 let cached=layout.travelFrame;
 if(!cached||cached.animated!==animated||cached.right.some((v,i)=>v!==right[i]||cached.down[i]!==down[i])){
  const base=new Map();
  for(const group of layout.groups.values())base.set(group,{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity});
  const include=(rect,p)=>{
   const u=dot(p,right),v=dot(p,down);
   rect.left=Math.min(rect.left,u);rect.right=Math.max(rect.right,u);
   rect.top=Math.min(rect.top,v);rect.bottom=Math.max(rect.bottom,v);
  };
  if(animated){
   // The motion planner already sampled the complete mechanism cycle, including
   // clearance for extrema between samples. Use the same bounds during playback.
   for(const [group,rect] of base){
    const {min,max}=group.bounds;
    for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])include(rect,[x,y,z]);
   }
  }else for(const {face,group} of layout.entries)for(const point of face.points)include(base.get(group),point);
  for(const [group,rect] of base){
   let left=0,top=0,rightmost=0,bottom=0;
   for(const offset of group.path||[origin]){
    const u=dot(offset,right),v=dot(offset,down);
    left=Math.min(left,u);rightmost=Math.max(rightmost,u);top=Math.min(top,v);bottom=Math.max(bottom,v);
   }
   rect.left+=left;rect.right+=rightmost;rect.top+=top;rect.bottom+=bottom;
  }
  cached=layout.travelFrame={right,down,base,animated};
 }
 const result={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
 for(const [group,rect] of cached.base){
  const moved=manual?.get(group.key),u=moved?dot(moved,right):0,v=moved?dot(moved,down):0;
  result.left=Math.min(result.left,rect.left+u);result.right=Math.max(result.right,rect.right+u);
  result.top=Math.min(result.top,rect.top+v);result.bottom=Math.max(result.bottom,rect.bottom+v);
 }
 return result;
}
