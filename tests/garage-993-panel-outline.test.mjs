import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

// Porsche 993 Cabriolet rescue sheet, p.32, 955 × 1350 raster. Plan crop
// origin (110,375). Measurements are taken at fixed drawing coordinates, not
// the mesh's loft stations. Wheel centers establish the longitudinal scale.
const mmPerPixel=2272/372.1;
const carX=pixel=>-1.16+(pixel-174.8)*mmPerPixel/1000;
const mesh=GarageRenderer.assembledFaces({vehicle:'porsche993cab',roofPosition:'up',paint:'silver',parts:[]});
const panels=mesh.filter(face=>face.vertexColors);
function halfWidth(x){
  let width=0;
  for(const face of panels){
    const ps=face.points;
    for(let i=0;i<ps.length;i++){
      const a=ps[i],b=ps[(i+1)%ps.length];
      if((x-a[0])*(x-b[0])>0||Math.abs(a[0]-b[0])<1e-8)continue;
      const t=(x-a[0])/(b[0]-a[0]);
      width=Math.max(width,a[1]+t*(b[1]-a[1]));
    }
  }
  return width;
}

test('the narrow Carrera traces the factory plan through the bumper corners, wings and door waist',()=>{
  const outline=[[25,55],[30,76],[40,100],[50,111],[65,118],[80,122],[105,128],
    [140,133],[175,135],[230,133],[350,129],[403,129],[468,133],[500,141],[540,142],
    [570,141],[620,133],[640,127],[665,118],[685,108],[695,102],[704,92],[711,71]];
  const errors=outline.map(([px,w])=>Math.abs(halfWidth(carX(px))*1000-w*mmPerPixel)).sort((a,b)=>a-b);
  assert(errors.at(-1)<30,'maximum plan deviation '+errors.at(-1).toFixed(1)+' mm');
  assert(errors[Math.floor(errors.length/2)]<12,'median plan deviation '+errors[Math.floor(errors.length/2)].toFixed(1)+' mm');
});

test('front bonnet and door end at their own shut lines in the assembled model',()=>{
  const stockTag=panels;
  const luggage=stockTag.filter(f=>f.part==='shell.luggage').flatMap(f=>f.points);
  const bumper=stockTag.filter(f=>f.part==='shell.bumpers').flatMap(f=>f.points);
  const door=stockTag.filter(f=>f.part==='shell.left-door').flatMap(f=>f.points);
  assert(Math.abs(Math.min(...luggage.map(p=>p[0]))-carX(41))<.045);
  assert(Math.min(...bumper.map(p=>p[0]))<Math.min(...luggage.map(p=>p[0]))-.09);
  const bottom=Math.min(...door.map(p=>p[2]));
  assert(bottom>.312&&bottom<.354,'hem in body above the separate rocker');
  const shared=stockTag.filter(f=>f.part==='shell.fenders').flatMap(f=>f.points);
  assert(shared.some(([x,y,z])=>Math.abs(x)<.55&&y<-.73&&z<.20));
});

test('the painted spoiler has a real opening beneath the grille',()=>{
  const painted=panels.filter(f=>f.part==='shell.spoiler');
  for(const x of [1.420,1.492,1.565,1.625,1.705])for(const y of [-.36,-.245,-.1,.04,.18,.31]){
    for(const face of painted){
      const ps=face.points,indices=face.triangles||faceTriangles(ps);
      for(let i=0;i<indices.length;i+=3){
        const [a,b,c]=indices.slice(i,i+3).map(k=>ps[k]);
        const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
        if(Math.abs(den)<1e-9)continue;
        const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den;
        const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;
        assert(u<0||v<0||u+v>1,'painted skin crosses grille at '+[x,y]);
      }
    }
  }
});

test('the fuel neck stays below the left wing and the oil pipes stay inside the rocker',()=>{
  function clearance(part,axes,normal,accept){
    const [u,v]=axes;
    const under=mesh.filter(f=>f.part===part).flatMap(f=>f.points).filter(accept);
    const points=[...new Map(under.map(p=>[p.join('/'),p])).values()];
    assert(points.length>0);
    let gap=Infinity;
    for(const p of points){
      let surface=-Infinity;
      for(const f of panels){
        const ps=f.points;
        if(ps.every(q=>q[u]<p[u])||ps.every(q=>q[u]>p[u])||ps.every(q=>q[v]<p[v])||ps.every(q=>q[v]>p[v]))continue;
        const tri=f.triangles||faceTriangles(ps);
        for(let i=0;i<tri.length;i+=3){
          const [a,b,c]=tri.slice(i,i+3).map(k=>ps[k]);
          const det=(b[v]-c[v])*(a[u]-c[u])+(c[u]-b[u])*(a[v]-c[v]);
          if(Math.abs(det)<1e-10)continue;
          const s=((b[v]-c[v])*(p[u]-c[u])+(c[u]-b[u])*(p[v]-c[v]))/det;
          const t=((c[v]-a[v])*(p[u]-c[u])+(a[u]-c[u])*(p[v]-c[v]))/det;
          if(s>=0&&t>=0&&s+t<=1)surface=Math.max(surface,s*a[normal]+t*b[normal]+(1-s-t)*c[normal]);
        }
      }
      gap=Math.min(gap,surface-p[normal]);
    }
    assert(gap>.006,part+' minimum clearance '+(1000*gap).toFixed(1)+' mm');
  }
  clearance('fuel.filler',[0,1],2,p=>p[1]<-.60);
  for(const id of ['993-lubrication.outbound','993-lubrication.return']){
    clearance(id,[0,2],1,p=>p[0]>-.79&&p[0]<.45&&p[1]>.6);
  }
});
