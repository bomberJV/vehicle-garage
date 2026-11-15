import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift} from '../garage/lift-options.js';

function scene(inspection={},isolate=false) {
  const renderer=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver'},inspection,isolate,
    progress:0,lights:true,schematic:true,partPositions:new Map()
  });
  renderer.buildMesh();
  return renderer;
}

// Meter-space triangles viewed along Z. Keep vertical faces: the lower edge
// of a casting wall can be the closest point even when its plan area is zero.
const tolerance=1e-12;
const area=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function projectedTriangles(faces,id) {
  const triangles=[];
  for(const face of faces.filter(f=>f.part===id)) {
    for(let i=0;i<face.triangles.length;i+=3) {
      const vertices=face.triangles.slice(i,i+3).map(k=>face.points[k]);
      const xs=vertices.map(v=>v[0]),ys=vertices.map(v=>v[1]);
      triangles.push({vertices,det:area(...vertices),
        xMin:Math.min(...xs),xMax:Math.max(...xs),yMin:Math.min(...ys),yMax:Math.max(...ys)});
    }
  }
  return triangles;
}

function heightAt(triangle,p,minimum) {
  const [a,b,c]=triangle.vertices;
  if(Math.abs(triangle.det)>tolerance) {
    const weights=[area(b,c,p),area(c,a,p),area(a,b,p)].map(v=>v/triangle.det);
    if(weights.some(w=>w < -tolerance))return;
    return weights[0]*a[2]+weights[1]*b[2]+weights[2]*c[2];
  }
  // A vertical ray can hit an entire segment on a vertical face.
  const heights=[];
  for(let i=0;i<3;i++) {
    const from=triangle.vertices[i],to=triangle.vertices[(i+1)%3];
    const dx=to[0]-from[0],dy=to[1]-from[1],lengthSquared=dx*dx+dy*dy;
    if(lengthSquared<tolerance*tolerance) {
      if(Math.hypot(from[0]-p[0],from[1]-p[1])<tolerance)heights.push(from[2],to[2]);
      continue;
    }
    if(Math.abs(area(from,to,p))>tolerance*Math.sqrt(lengthSquared))continue;
    const t=((p[0]-from[0])*dx+(p[1]-from[1])*dy)/lengthSquared;
    if(t>=-tolerance&&t<=1+tolerance)heights.push(from[2]+t*(to[2]-from[2]));
  }
  if(heights.length)return minimum?Math.min(...heights):Math.max(...heights);
}

// Heights vary linearly on each mesh triangle. Their extrema therefore occur
// at a projected vertex or where two projected edges cross.
function overlapCandidates(a,b) {
  const points=[...a,...b];
  for(let i=0;i<3;i++)for(let j=0;j<3;j++) {
    const p=a[i],q=b[j],aNext=a[(i+1)%3],bNext=b[(j+1)%3];
    const ax=aNext[0]-p[0],ay=aNext[1]-p[1],bx=bNext[0]-q[0],by=bNext[1]-q[1];
    const det=ax*by-ay*bx;
    if(Math.abs(det)<tolerance)continue; // Collinear overlaps are covered by their endpoints.
    const dx=q[0]-p[0],dy=q[1]-p[1];
    const t=(dx*by-dy*bx)/det,u=(dx*ay-dy*ax)/det;
    if(t>=-tolerance&&t<=1+tolerance&&u>=-tolerance&&u<=1+tolerance)points.push([p[0]+t*ax,p[1]+t*ay]);
  }
  return points;
}

function lowestGap(upper,lower) {
  let gap=Infinity,at;
  for(const a of upper)for(const b of lower) {
    if(a.xMax<b.xMin||b.xMax<a.xMin||a.yMax<b.yMin||b.yMax<a.yMin)continue;
    for(const p of overlapCandidates(a.vertices,b.vertices)) {
      const top=heightAt(a,p,true),bottom=heightAt(b,p,false);
      if(top===undefined||bottom===undefined)continue;
      if(top-bottom<gap){gap=top-bottom;at=p.slice(0,2);}
    }
  }
  return {gap,at};
}

test('the installed G500 sump clears the front differential at stock height and with its 40 mm lift',()=>{
  const renderer=scene();
  const gaps=[];
  for(const mode of ['stock','g500-orc-40']){
    renderer.build={...renderer.build,lift:normalizedLift('g500',{mode})};
    renderer.buildMesh();
    const pan=projectedTriangles(renderer.faces,'powertrain.sump');
    const differential=projectedTriangles(renderer.faces,'differentials.front');
    assert(pan.length&&differential.length,'both installed meshes must be present');
    const {gap,at}=lowestGap(pan,differential);
    assert(Number.isFinite(gap),'both surfaces must overlap in plan');
    assert(gap>1e-6,`${mode}: sump underside minus differential top is ${(gap*1000).toFixed(2)} mm at ${at}`);
    gaps.push(gap);
    for(const id of ['steering.axle','differentials.front-shaft','suspension.front-track-bar','steering.linkage']) {
      const hardware=projectedTriangles(renderer.faces,id);
      assert(hardware.length,`missing installed ${id}`);
      const clearance=lowestGap(pan,hardware);
      assert(clearance.gap>1e-6,`${mode}: sump interferes with ${id} at ${clearance.at}`);
    }
    for(const id of ['powertrain.block','powertrain.crankshaft']) {
      const component=projectedTriangles(renderer.faces,id);
      assert(component.length,`missing installed ${id}`);
      assert(lowestGap(component,differential).gap>1e-6,`${mode}: differential interferes with ${id}`);
    }
  }
  assert(Math.abs(gaps[1]-gaps[0]-.040)<1e-6,'the lifted sump gains 40 mm over its rigid axle');
});

test('the G500 carrier is on the right and the pickup screen sits inside the forward oil bowl',()=>{
  const {faces}=scene();
  const points=id=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
  const differential=points('differentials.front');
  const crownZ=Math.max(...differential.map(p=>p[2]));
  const crown=differential.filter(p=>Math.abs(p[2]-crownZ)<tolerance);
  assert(crown.length&&crown.every(p=>p[1]>0),'the carrier crown must be right of the chassis centerline');

  const pan=projectedTriangles(faces,'powertrain.sump');
  const midX=(Math.min(...pan.map(t=>t.xMin))+Math.max(...pan.map(t=>t.xMax)))/2;
  const railZ=Math.max(...points('powertrain.sump').map(p=>p[2]));
  const pickup=points('powertrain.oil-pickup');
  const screenZ=Math.min(...pickup.map(p=>p[2]));
  const screen=pickup.filter(p=>Math.abs(p[2]-screenZ)<tolerance);
  assert(screen.length&&screenZ<railZ);
  for(const p of screen) {
    assert(p[0]<midX,'the screened inlet sits toward the pulley end');
    const below=pan.map(t=>heightAt(t,p,true)).filter(Number.isFinite);
    assert(below.length&&Math.max(...below)<screenZ,'the inlet must sit above the bowl floor at every screen corner');
  }
});

test('normal, see-through and alternate inspection owners use the same G500 sump and differential surfaces',()=>{
  const points=(r,id)=>r.faces.filter(f=>f.part===id).map(f=>f.points);
  const renderer=scene();
  const pan=points(renderer,'powertrain.sump'),differential=points(renderer,'differentials.front');
  assert(pan.length&&differential.length);
  assert.equal(points(renderer,'engine-oil.sump').length,0);
  assert.equal(points(renderer,'drivetrain.front-differential').length,0);
  renderer.seeThroughBody=true;
  renderer.buildMesh();
  assert.deepEqual(points(renderer,'powertrain.sump'),pan);
  assert.deepEqual(points(renderer,'differentials.front'),differential);
  for(const isolate of [false,true]){
    const oil=scene({assembly:'engine-oil'},isolate),drive=scene({assembly:'drivetrain'},isolate);
    assert.deepEqual(points(oil,'engine-oil.sump'),pan);
    assert.equal(points(oil,'powertrain.sump').length,0);
    assert.deepEqual(points(drive,'drivetrain.front-differential'),differential);
    assert.equal(points(drive,'differentials.front').length,0);
  }
});
