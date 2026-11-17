// Shared routing for G500 cabin wiring that lies on the fitted floor.
import {cabinFloorTop} from './floor-trim.js';

// Only the cabin side of the bulkhead counts; the toe-board edge ahead of it is left to the engine bay.
export const floorTop=(x,y)=>x<-.74?null:cabinFloorTop('g500',x,y);
// A waypoint lying on the carpet.
export const on=(x,y)=>Object.assign([x,y,+(floorTop(x,y)+.010).toFixed(4)],{floor:true});
// Cabin runs lie on the carpet: any stretch that would pass into the floor is
// carried over it. Runs well below the floor (under the body) are left alone.
export function drape(pts,rad){
 const out=[pts[0]];
 // Between two points laid on the carpet every sample follows it.
 const lift=(p,both)=>{const f=floorTop(p[0],p[1]);return f!=null&&(both||p[2]>f-.09)&&p[2]<f+rad+.006?[p[0],p[1],f+rad+.006]:p;};
 for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.015));
  const samples=[];let moved=false;
  for(let k=1;k<=n;k++){const t=k/n,q=a.map((v,j)=>v+(b[j]-v)*t),l=i===pts.length-1&&k===n?q:lift(q,a.floor&&b.floor);if(l!==q)moved=true;samples.push(l);}
  if(moved)out.push(...samples);else out.push(b);
 }
 return out;
}
