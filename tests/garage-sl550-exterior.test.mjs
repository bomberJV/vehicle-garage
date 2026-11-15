import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {drawSLDeck,drawSLExterior,slExteriorGroup} from '../garage/sl550-exterior.js';

function render(draw) {
  const renderer=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  draw(renderer);
  return renderer.faces;
}
const paint='#a6a8a9';
const mesh=render(r=>drawSLExterior(r,paint));
const extent=(faces,axis)=>{
  const values=faces.flatMap(f=>f.points.map(p=>p[axis]));
  const low=Math.min(...values),high=Math.max(...values);
  return {low,high,span:high-low,center:(low+high)/2};
};
function close(actual,expected,tolerance=.00001) {
  assert.ok(Math.abs(actual-expected)<=tolerance,actual+' differs from '+expected);
}

test('R231 US exterior fits the drawing and the four staggered 19-inch wheel stations',()=>{
  const parts=slExteriorGroup.flatMap(g=>g.parts);
  assert.deepEqual(new Set(mesh.map(f=>f.part)),new Set(parts.map(p=>p.id)));
  assert.ok(parts.every(p=>p.source.url.startsWith('https://')));
  close(extent(mesh,0).span,181.6*.0254,.0005);
  close(extent(mesh,1).span,82.6*.0254,.0006);
  const axle=[];
  for(const end of ['front','rear']){
    for(const side of ['left','right']){
      const tires=mesh.filter(f=>f.part==='running.tires'&&f.instance===end+'-'+side);
      const diameter=.4826+2*(end==='front'?.255*.35:.285*.30);
      close(extent(tires,1).span,end==='front'?.255:.285);
      close(extent(tires,2).low,0);
      close(extent(tires,2).high,diameter);
      if(side==='left')axle.push(extent(tires,0).center);
    }
  }
  close(axle[1]-axle[0],2.585);
});

// Sample the actual painted surfaces a user sees from the front or back.
function sampleSurface(axis,u,v,fromLow,partFilter){
  const [i,j]=[0,1,2].filter(k=>k!==axis);
  let depth=fromLow?Infinity:-Infinity,part;
  for(const face of mesh) {
    if(partFilter&&face.part!==partFilter)continue;
    const tris=faceTriangles(face.points);
    for(let k=0;k<tris.length;k+=3) {
      const [a,b,c]=tris.slice(k,k+3).map(n=>face.points[n]);
      const dx=b[i]-a[i],dy=b[j]-a[j],ex=c[i]-a[i],ey=c[j]-a[j],det=dx*ey-dy*ex;
      if(Math.abs(det)<1e-9)continue;
      const s=((u-a[i])*ey-(v-a[j])*ex)/det,t=(dx*(v-a[j])-dy*(u-a[i]))/det;
      if(Math.min(s,t,1-s-t)<-1e-9)continue;
      const q=a[axis]+s*(b[axis]-a[axis])+t*(c[axis]-a[axis]);
      if(fromLow?q<depth:q>depth){depth=q;part=face.part;}
    }
  }
  return {depth,part};
}
const visiblePartAt=(y,z,front)=>sampleSurface(0,y,z,front).part;

test('the bonnet domes, rising shoulder and indented lower flanks are formed in the panel skins',()=>{
  const hood=y=>sampleSurface(2,-1.55,y,false,'shell.hood').depth;
  for(const side of [-1,1]){
    assert(hood(side*.27)>hood(0)+.027);
    assert(hood(side*.27)>hood(side*.49)+.029);
  }
  const side=z=>sampleSurface(1,.10,z,false,'shell.right-door').depth;
  assert(side(.77)>side(.60)+.030);
  assert(side(.42)>side(.54)+.021);
  const bumper=sampleSurface(0,.14,.53,false,'shell.fascia').depth;
  const lid=sampleSurface(0,.14,.92,false,'shell.trunklid').depth;
  assert(bumper-lid>.063&&bumper-lid<.14,'rear deck tucks ahead of the bumper crown');
});
test('both projectors and both rear lamps are visible ahead of their painted body panels',()=>{
  for(const s of [-1,1]){
    for(const [y,z] of [[.65,.62],[.72,.68]])assert.equal(visiblePartAt(s*y,z,true),'lights.headlamps');
    for(const [y,z] of [[.55,.66],[.7,.72]])assert.equal(visiblePartAt(s*y,z,false),'lights.tail');
  }
});

test('the complete trunk surface and center brake lamp follow the same roof pose in the cached and full render',()=>{
  const ids=new Set(['shell.trunklid','lights.high-stop']);
  const shape=faces=>faces.map(({part,points})=>({part,points}));
  const sample=t=>render(r=>drawSLDeck(r,paint,t));
  const shut=sample(0),lifted=sample(.4);
  assert.deepEqual(new Set(shut.map(f=>f.part)),ids);
  assert.deepEqual(shape(mesh.filter(f=>ids.has(f.part))),shape(shut));
  assert.deepEqual(shape(shut),shape(sample(1)));
  const fullLift=render(r=>drawSLExterior(r,paint,'#c5c8c9',.4));
  assert.deepEqual(shape(fullLift.filter(f=>ids.has(f.part))),shape(lifted));
  assert.ok(extent(lifted,2).high>extent(shut,2).high+.4);
});

test('closed hood and trunk share a continuous edge with the corresponding fenders',()=>{
  const key=point=>point.map(v=>v.toFixed(6)).join(',');
  const fenderVertices=new Set(mesh.filter(f=>f.part==='shell.fenders').flatMap(f=>f.points.map(key)));
  for(const [part,minX,maxX] of [['shell.hood',-1.55,-1.05],['shell.trunklid',1.46,1.66]]){
    for(const side of [-1,1]){
      const edges=mesh.filter(f=>f.part===part&&f.clearcoatNormals&&
        f.points.every(([x,y])=>x>minX&&x<maxX&&side*y>.55));
      const byX=new Map();
      for(const f of edges)for(const p of f.points){
        const station=p[0].toFixed(5),prior=byX.get(station);
        if(!prior||side*p[1]>side*prior[1])byX.set(station,p);
      }
      // These locations are ahead of the windshield and behind the roof well,
      // where each transverse station has a constant X.
      assert(byX.size>=4);
      for(const p of byX.values())assert(fenderVertices.has(key(p)),'open '+part+' seam at '+key(p));
    }
  }
});

test('Sport wheel has five recessed lug pockets, five open spoke windows and spaced rotor cheeks',()=>{
  const rim=mesh.filter(f=>f.part==='running.rims'&&f.instance==='front-left');
  const disc=mesh.filter(f=>f.part==='running.brakes'&&f.instance==='front-left');
  function frontAt(faces,rad,angle,tangent=0){
    const x=-1.2925+rad*Math.cos(angle)-tangent*Math.sin(angle);
    const z=.33055+rad*Math.sin(angle)+tangent*Math.cos(angle);
    let nearest=Infinity;
    for(const face of faces){
      const tris=faceTriangles(face.points);
      for(let i=0;i<tris.length;i+=3){
        const [a,b,c]=tris.slice(i,i+3).map(index=>face.points[index]);
        const den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);
        if(Math.abs(den)<1e-12)continue;
        const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den;
        const v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;
        if(u>=-1e-8&&v>=-1e-8&&u+v<=1.00000001)nearest=Math.min(nearest,u*a[1]+v*b[1]+(1-u-v)*c[1]);
      }
    }
    return nearest;
  }
  for(let i=0;i<5;i++){
    const angle=Math.PI/2+i*2*Math.PI/5;
    const pocket=frontAt(rim,.085,angle),shoulder=frontAt(rim,.085,angle,.014);
    assert.ok(pocket>shoulder+.003&&Number.isFinite(pocket),'a recessed pocket in each blade');
    assert.equal(frontAt(rim,.142,angle+Math.PI/5),Infinity,'open spoke window');
    assert.ok(Number.isFinite(frontAt(disc,.142,angle+Math.PI/5)),'brake hardware behind the window');
  }
  const track=disc.filter(f=>f.points.every(([x,,z])=>Math.hypot(x+1.2925,z-.33055)>.115));
  assert.ok(extent(track,1).span>=.034,'the front rotor has separate front and rear faces');
});

test('the curved cowl closes the bonnet seam and the dark bumper ducts keep their own finish',()=>{
  for(const y of [-.64,-.28,0,.28,.64]){
    const x=-.685+.146*(y/.776)**2;
    assert.ok(sampleSurface(2,x,y,false,'shell.liners').depth>.87,'opaque cowl at '+y);
  }
  const ducts=mesh.filter(f=>f.color==='#161a1c'&&f.part==='shell.fascia');
  assert(ducts.length>10);
  assert(ducts.every(f=>!f.clearcoatNormals&&!f.vertexColors));
});
