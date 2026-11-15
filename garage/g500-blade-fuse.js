// Restagraf 6875, compatible with Mercedes N000000004206. Coordinates in mm
// above the terminal tips. The open-sided inspection mesh reveals the link.
import {glazingFace} from './surface-materials.js';
export const fuseSupplier={label:'Restagraf 6875 · 20 A fuse drawing and Mercedes OE cross-reference',url:'https://www.restagraf.com/en/5590-standard-blade-fuse-20a.html'};
export const fuseSections=['shell','blade-a','blade-b','link'];
const zinc='#a8aeaa';
function stamping(r,map,shape,half,color){
  const a=shape.map(([u,z])=>map(u,-half,z)),b=shape.map(([u,z])=>map(u,half,z));
  r.polygon(a,color,false);r.polygon(b,color,false);
  for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],color,false);}
}
export function drawBladeFuse(r,map,key,color='#be9f31',study=false){
  if(key==='shell'){
    // Full 5.2-mm head and a stepped body. Retain a real inspection aperture
    // across the lower front so that the link and stampings stay visible.
    const stations=[[6.5,8.2,1.1],[8,9.05,1.3],[15.7,9.05,1.65],[16.7,9.55,2.6],[19.3,9.55,2.6]];
    const rings=stations.map(([h,w,t])=>[map(-w,-t,h),map(w,-t,h),map(w,t,h),map(-w,t,h)]);
    for(let j=1;j<rings.length;j++)for(let i=0;i<4;i++){
      if(study&&i===0&&j<4)continue;
      const k=(i+1)%4,p=[rings[j-1][i],rings[j-1][k],rings[j][k],rings[j][i]];
      if(study&&j<4)glazingFace(r,p,color,.48);else r.polygon(p,color,false);
    }
    // Exposed test pads interrupt the top at each end.
    const top=(u,v)=>map(u,v,19.3);
    const quad=(a,b,c,d,col)=>r.polygon([top(a,c),top(b,c),top(b,d),top(a,d)],col,false);
    quad(-9.55,9.55,-2.6,-.65,color);quad(-9.55,9.55,.65,2.6,color);
    const edges=[-9.55,-6.6,-3.75,3.75,6.6,9.55];
    for(let i=1;i<edges.length;i++)quad(edges[i-1],edges[i],-.65,.65,i===2||i===4?zinc:color);
    return;
  }
  if(key==='link'){
    const path=[[-4.50,10.4],[-3.7,10.4],[.45,14.55],[1.12,14.85],[1.83,14.62],[2.18,14.1],[2.05,13.47],[-.9,10.40],[-.97,9.75],[-.51,9.12],[.18,9.1],[3.20,12.08],[4.50,12.08]];
    const worldScale=Math.hypot(...map(1,0,0).map((v,i)=>v-map(0,0,0)[i]));
    for(let j=1;j<path.length;j++)r.rod(map(path[j-1][0],0,path[j-1][1]),map(path[j][0],0,path[j][1]),worldScale*.27,zinc,5);
    return;
  }
  const sign=key==='blade-a'?-1:1;
  const outline=[[1.9,18.4],[7.1,18.4],[7.1,.75],[6.35,0],[2.65,0],[1.9,.75]].map(([u,z])=>[u*sign,z]);
  stamping(r,map,outline,.32,zinc);
}
