// Axis-aligned clipping in model space. Retained vertices and their physical part IDs
// feed both drawing and picking. The plane stays put while the camera orbits.
import {faceTriangles} from './mesh-triangles.js';

const clippedGeometry=new WeakMap();

const unpack=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const pack=rgb=>'#'+rgb.map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');

function onPlane(a,b,axis,limit){
 const t=(limit-a[axis])/(b[axis]-a[axis]);
 const point=a.map((v,j)=>v+(b[j]-v)*t);point[axis]=limit;
 return point;
}
function clipRing(points,axis,limit,sign){
 const out=[];
 let a=points.at(-1),insideA=(a[axis]-limit)*sign<=0;
 for(const b of points){
  const insideB=(b[axis]-limit)*sign<=0;
  if(insideA!==insideB)out.push(onPlane(a,b,axis,limit));
  if(insideB)out.push(b);
  a=b;insideA=insideB;
 }
 return out;
}
export function sectionFaces(faces,plane){
 if(!faces.length||plane.percent>=100)return faces;
 const axis=plane.axis,sign=plane.reverse?-1:1;
 let min=Infinity,max=-Infinity;
 for(const face of faces)for(const p of face.points){min=Math.min(min,p[axis]);max=Math.max(max,p[axis]);}
 if(max<=min||!Number.isFinite(min))return faces;
 const k=Math.max(0,Math.min(1,plane.percent/100)),limit=plane.reverse?max-(max-min)*k:min+(max-min)*k;
 const out=[];
 for(const f of faces){
  let within=0;
  for(const p of f.points)if((p[axis]-limit)*sign<=0)within++;
  if(within===0)continue;
  if(within===f.points.length){out.push(f);continue;}
  let cached=clippedGeometry.get(f.points);
  if(cached?.axis!==axis || cached.limit!==limit || cached.sign!==sign || cached.colors!==f.vertexColors){
    const indices=f.triangles||faceTriangles(f.points),pieces=[];
    for(let k=0;k<indices.length;k+=3){
      const points=indices.slice(k,k+3).map(i=>f.vertexColors?[...f.points[i],...unpack(f.vertexColors[i]),...(f.clearcoatNormals?.[i]||[])]:f.points[i]);
      const clipped=clipRing(points,axis,limit,sign);
      if(clipped.length<3)continue;
      if(f.vertexColors){
        pieces.push({points:clipped.map(p=>p.slice(0,3)),vertexColors:clipped.map(p=>pack(p.slice(3,6))),
          ...(f.clearcoatNormals?{clearcoatNormals:clipped.map(p=>{const n=p.slice(6),length=Math.hypot(...n)||1;return n.map(v=>v/length);})}:{})});
      }else pieces.push({points:clipped});
    }
    cached={axis,limit,sign,colors:f.vertexColors,pieces};clippedGeometry.set(f.points,cached);
  }
  // Keep the intersected vertices stable through camera and highlight changes.
  // Colors and interaction metadata must still come from the current frame.
  for(const piece of cached.pieces)out.push({...piece,part:f.part,pickPart:f.pickPart,instance:f.instance,rigid:f.rigid,
    stroke:false,color:f.color,opacity:f.opacity,motionKey:f.motionKey,highlighted:f.highlighted});
 }
 return out;
}
