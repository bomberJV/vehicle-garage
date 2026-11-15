import assert from 'node:assert/strict';
import test from 'node:test';
import {roadModels} from '../garage/fleet-road.js';
import {faceTriangles} from '../garage/mesh-triangles.js';
import {GarageRenderer} from '../garage/render.js';

function mesh(model,paint,finish){
  const renderer=Object.create(GarageRenderer.prototype);
  renderer.faces=[];
  model.draw(renderer,paint,finish);
  return renderer.faces;
}
function pointsFor(faces,id){return faces.filter(f=>f.part===id).flatMap(f=>f.points);}
function bounds(points){return [0,1,2].map(i=>[Math.min(...points.map(p=>p[i])),Math.max(...points.map(p=>p[i]))]);}
test('each road component is selectable, bounded, and has a rigid exploded translation',()=>{
  for(const model of roadModels){
    const faces=mesh(model), components=model.groups.flatMap(g=>g.parts);
    assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(components.map(p=>p.id)));
    assert(faces.length<10000);
    for(const face of faces){assert.match(face.color,/^#[0-9a-f]{6}$/i);for(const p of face.points)assert(p.every(Number.isFinite));}
    for(const p of components)assert.equal(p.offset.filter(Number.isFinite).length,3);
  }
});
test('both 911 manuals have roof-down cockpit openings, opposed cylinder banks and a transaxle ahead of them',()=>{
  const [classic,current]=roadModels;
  assert(classic.specs.some(([,s])=>s.includes('6-speed')));
  assert(current.specs.some(([,s])=>s.includes('7-speed')));
  for(const model of [classic,current]){
    const faces=mesh(model), cylinders=bounds(pointsFor(faces,'engine.cylinders'));
    const gearbox=bounds(pointsFor(faces,'drive.gearbox'));
    assert(cylinders[0][0]>gearbox[0][0]+.30);
    assert(cylinders[1][0]<-.35&&cylinders[1][1]>.35);
    assert(!faces.some(f=>f.part.startsWith('shell.')&&f.points.some(([x,y,z])=>x>-.20&&x<.44&&Math.abs(y)<.49&&z>.90)));
    for(const [id,sign] of [['shell.left-door',-1],['shell.right-door',1]])assert(pointsFor(faces,id).every(p=>sign*p[1]>.5));
  }
  assert.equal(pointsFor(mesh(classic),'engine.turbos').length,0);
  assert(pointsFor(mesh(current),'engine.turbos').length>100);
});
test('S 1000 RR has exactly two wheel locations, a left final drive, a right silencer, and four transverse cylinders',()=>{
  const faces=mesh(roadModels[2]);
  const wheels=pointsFor(faces,'running.rims');
  assert(wheels.every(([x])=>Math.abs(x)>.45));
  assert(wheels.some(([x])=>x<-.5)&&wheels.some(([x])=>x>.5));
  assert(pointsFor(faces,'drive.chain').every(([,y])=>y<-.10));
  assert(pointsFor(faces,'drive.exhaust').filter(([x])=>x>.53).every(([,y])=>y>0));
  const caps=faces.filter(f=>f.part==='engine.cylinders'&&f.points.length===14);
  assert.equal(caps.length,8); // two circular end caps per cylinder
});
test('paint and wheel finish reach the real geometry on all three models',()=>{
  for(const model of roadModels){
    const a=mesh(model,'#772244','#998877'),b=mesh(model,'#336699','#435669');
    assert.deepEqual(a.map(f=>f.part),b.map(f=>f.part));
    assert(a.some((f,i)=>f.part=== 'running.rims'&&f.color!==b[i].color));
    assert(a.some((f,i)=>/^(shell|body)\./.test(f.part)&&f.color!==b[i].color));
  }
});
test('near and far 911 headlamps remain visibly exposed in the opening three-quarter view',()=>{
  const angle=-.58,elevation=.24;
  const project=([x,y,z])=>[x*Math.cos(angle)-y*Math.sin(angle),-z*Math.cos(elevation)+(x*Math.sin(angle)+y*Math.cos(angle))*Math.sin(elevation),x*Math.sin(angle)+y*Math.cos(angle)+z*Math.tan(elevation)];
  for(const model of roadModels.filter(m=>m.type==='Cars')){
    const faces=mesh(model);
    for(const side of [-1,1]){
      const lens=faces.filter(f=>f.part==='lights.headlamps'&&f.points.every(p=>Math.sign(p[1])===side));
      const projected=lens.flatMap(f=>f.points.map(project));
      const [[x0,x1],[y0,y1]]=bounds(projected);
      const N=32,depth=new Float64Array(N*N).fill(-Infinity),part=new Array(N*N);
      const footprint=new Set();
      for(const face of faces.filter(f=>f.part.startsWith('shell.')||f.part.startsWith('lights.'))){
        const ps=face.points.map(project);
        if(ps.every(p=>p[0]<x0)||ps.every(p=>p[0]>x1)||ps.every(p=>p[1]<y0)||ps.every(p=>p[1]>y1))continue;
        const indices=face.triangles || faceTriangles(face.points);
        const isLens=lens.includes(face);
        for(let k=0;k<indices.length;k+=3){
          const [a,b,c]=[ps[indices[k]],ps[indices[k+1]],ps[indices[k+2]]];
          const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
          if(Math.abs(den)<1e-8)continue;
          for(let i=0;i<N*N;i++){
            const x=x0+(x1-x0)*(i%N+.5)/N,y=y0+(y1-y0)*(Math.floor(i/N)+.5)/N;
            const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den;
            const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den,w=1-u-v;
            const d=u*a[2]+v*b[2]+w*c[2];
            if(Math.min(u,v,w)<0)continue;
            if(isLens)footprint.add(i);
            if(d>depth[i]){depth[i]=d;part[i]=face.part;}
          }
        }
      }
      // A foreshortened ellipse can occupy less than a quarter of its bounding
      // box. Compare visible samples with the unoccluded physical lens footprint.
      assert(footprint.size>N*N*.16);
      const visible=[...footprint].filter(i=>part[i]==='lights.headlamps').length/footprint.size;
      assert(visible>.88,`${model.id} side ${side} visible lamp fraction ${visible}`);
    }
  }
});
