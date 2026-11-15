import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {drawSLExterior} from '../garage/sl550-exterior.js';
import {getDetail} from '../garage/detail-catalog.js';

test('the SL550 rear light bands stay visible around the whole corner',()=>{
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  drawSLExterior(r,'#999999');
  // Cast toward the installed car from rearward through side-on, including the
  // former boundary between the two rear-lamp patches. Compare actual meshes.
  const triangles=r.faces.filter(f=>f.points.some(([x])=>x>1.65)).flatMap(f=>{
    const indices=faceTriangles(f.points),ts=[];
    for(let i=0;i<indices.length;i+=3)ts.push({part:f.part,vertices:indices.slice(i,i+3).map(j=>f.points[j])});
    return ts;
  });
  for(const side of [-1,1])for(const [angle,z] of [[39,.677],[47,.703],[54,.739],[61,.757],[66,.775],[72,.807],[76,.838]]){
    const theta=angle*Math.PI/180,dx=Math.cos(theta),dy=side*Math.sin(theta);
    let part=null,nearest=0;
    for(const tri of triangles){
      // Intersect the triangle with the horizontal ray’s height, then with
      // the requested angle in plan. Ignore triangles entirely above/below.
      const hits=[];
      for(let i=0;i<3;i++){
        const a=tri.vertices[i],b=tri.vertices[(i+1)%3];
        if((a[2]>z)===(b[2]>z))continue;
        const t=(z-a[2])/(b[2]-a[2]);
        hits.push([a[0]+(b[0]-a[0])*t-1.55,a[1]+(b[1]-a[1])*t]);
      }
      if(hits.length!==2)continue;
      const [[ax,ay],[bx,by]]=hits;
      const da=ax*dy-ay*dx,db=bx*dy-by*dx;
      if(da*db>0||Math.abs(da-db)<1e-12)continue;
      const t=da/(da-db),distance=(ax+(bx-ax)*t)*dx+(ay+(by-ay)*t)*dy;
      if(distance>nearest){nearest=distance;part=tri.part;}
    }
    assert.equal(part,'lights.tail','side '+side+' at '+angle+' degrees');
  }
});
test('the headlamp study exposes the five fitted optical layers behind the transparent cover',()=>{
  const detail=getDetail('sl550','lights.headlamps');
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  detail.draw(r);
  const layers=new Map(detail.groups[0].parts.map(p=>[p.id,r.faces.filter(f=>f.part===p.id)]));
  assert.equal(layers.size,5);
  for(const faces of layers.values())assert(faces.length>0);
  assert(layers.get('sl-headlamp.cover').every(f=>f.opacity>0&&f.opacity<.4));
  for(const id of ['optics','marker','guide'])assert(layers.get('sl-headlamp.'+id).every(f=>(f.opacity??1)===1));
});
