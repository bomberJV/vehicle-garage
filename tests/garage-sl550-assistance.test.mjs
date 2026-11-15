import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

function sectionHits(mesh,axis,direction,u,v){
  const lateral=1-axis,hits=[];
  for(const face of mesh){
    if(face.points.every(p=>p[lateral]>u)||face.points.every(p=>p[lateral]<u)||
       face.points.every(p=>p[2]>v)||face.points.every(p=>p[2]<v))continue;
    const indices=faceTriangles(face.points);
    for(let i=0;i<indices.length;i+=3){
      const [a,b,c]=indices.slice(i,i+3).map(k=>face.points[k]);
      const by=b[lateral]-a[lateral],bz=b[2]-a[2],cy=c[lateral]-a[lateral],cz=c[2]-a[2];
      const det=by*cz-bz*cy;
      if(Math.abs(det)<1e-14)continue;
      const y=u-a[lateral],z=v-a[2],m=(y*cz-z*cy)/det,n=(by*z-bz*y)/det;
      if(m<0||n<0||m+n>1)continue;
      const depth=direction*(a[axis]+m*(b[axis]-a[axis])+n*(c[axis]-a[axis]));
      hits.push({face,depth});
    }
  }
  return hits.sort((a,b)=>b.depth-a.depth);
}
test('all ten PARKTRONIC faces sit on their illustrated carriers and can be picked separately',()=>{
  const faces=GarageRenderer.assembledFaces({vehicle:'sl550',parts:[],paint:'silver',roofPosition:'up'});
  const hardware=faces.filter(f=>f.part==='sl-assist.parking');
  assert.equal(new Set(hardware.map(f=>f.instance)).size,10);
  // P54.65-4472-31 puts the inner face in the black grille and the outer face
  // on the side ahead of the arch. Each probe must first reach its sensor;
  // the painted panel or grille behind it is tested against the same ray.
  for(const side of [-1,1]){
    const hand=side<0?'left':'right';
    const stations=[
      ['front-inner',0,-1,side*.3301,.4773,'shell.grille',.018],
      ['front-middle',0,-1,side*.6101,.4573,'shell.fascia',.005],
      ['front-outer',1,side,-1.8401,.4763,'shell.fenders',.005],
      ['rear-inner',0,1,side*.3101,.5353,'shell.fascia',.005],
      ['rear-outer',0,1,side*.7361,.5353,'shell.fascia',.006]
    ];
    for(const [name,axis,sign,u,v,part,maxGap] of stations){
      const hits=sectionHits(faces,axis,sign,u,v);
      assert.equal(hits[0].face.instance,name+'-'+hand);
      const substrate=hits.find(h=>h.face.part!== 'sl-assist.parking');
      assert.equal(substrate.face.part,part,name);
      const gap=hits[0].depth-substrate.depth;
      assert(gap>.0002&&gap<maxGap,name+' mounting gap '+gap);
      assert(hits.some(h=>h.face.instance===name+'-'+hand&&h.depth<substrate.depth-.006),name+' body behind the opening');
    }
  }
});
