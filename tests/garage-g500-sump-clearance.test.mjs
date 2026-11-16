import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift,liftOptions} from '../garage/lift-options.js';
import {FLEET} from '../garage/fleet.js';
import {getAssemblies} from '../garage/assemblies.js';
import {sectionFaces} from '../garage/section-plane.js';
import {bodyVisibility} from '../garage/body-visibility.js';
import {softwareDepthRender,gpuDepthRender} from '../garage/surface-materials.js';
import {m113CrankZ,m113PanRail} from '../garage/g500-m113-geometry.js';
import {g500HubZ} from '../garage/g500-underbody.js';
import {additionalRequestSections} from '../garage/priority-backlog.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

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

// ---------------------------------------------------------------------------
// Exact triangle-mesh proximity in world space (metres). Vertical gaps can miss
// a sloped or lateral approach, so each pair of triangles is tested for
// crossing and then measured point-to-triangle and edge-to-edge.

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const distance=(a,b)=>Math.hypot(...sub(a,b));
function closestOnTriangle(p,a,b,c){
  const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a),d1=dot(ab,ap),d2=dot(ac,ap);
  if(d1<=0&&d2<=0)return a;
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);if(d3>=0&&d4<=d3)return b;
  const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0)return lerp(a,b,d1/(d1-d3));
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);if(d6>=0&&d5<=d6)return c;
  const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0)return lerp(a,c,d2/(d2-d6));
  const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0)return lerp(b,c,(d4-d3)/((d4-d3)+(d5-d6)));
  const den=1/(va+vb+vc);
  return a.map((v,i)=>v+ab[i]*vb*den+ac[i]*vc*den);
}
function closestSegments(p1,q1,p2,q2){
  const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r),eps=1e-18;
  const clamp=v=>Math.min(1,Math.max(0,v));
  let s=0,t=0;
  if(a<=eps&&e>eps)t=clamp(f/e);
  else if(a>eps){
    const c=dot(d1,r);
    if(e<=eps)s=clamp(-c/a);
    else{
      const b=dot(d1,d2),den=a*e-b*b;
      s=den>eps?clamp((b*f-c*e)/den):0;t=(b*s+f)/e;
      if(t<0){t=0;s=clamp(-c/a);}else if(t>1){t=1;s=clamp((b-c)/a);}
    }
  }
  return [lerp(p1,q1,s),lerp(p2,q2,t)];
}
function segmentCrossesTriangle(p,q,a,b,c){
  const n=cross(sub(b,a),sub(c,a)),nn=dot(n,n);if(nn<1e-30)return false;
  const dp=dot(n,sub(p,a)),dq=dot(n,sub(q,a));
  if((dp>0&&dq>0)||(dp<0&&dq<0)||dp===dq)return false;
  const x=lerp(p,q,dp/(dp-dq));
  return [[a,b],[b,c],[c,a]].every(([u,v])=>dot(cross(sub(v,u),sub(x,u)),n)>=-1e-15*nn);
}
function triangleDistance(A,B){
  for(let i=0;i<3;i++)
    if(segmentCrossesTriangle(A[i],A[(i+1)%3],...B)||segmentCrossesTriangle(B[i],B[(i+1)%3],...A))return {d:0,crossing:true};
  let best={d:Infinity};
  const keep=(a,b)=>{const d=distance(a,b);if(d<best.d)best={d,a,b};};
  for(const p of A)keep(p,closestOnTriangle(p,...B));
  for(const p of B)keep(closestOnTriangle(p,...A),p);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)keep(...closestSegments(A[i],A[(i+1)%3],B[j],B[(j+1)%3]));
  return best;
}
function worldTriangles(faces,keep){
  const out=[];
  for(const face of faces){
    if(!keep(face))continue;
    for(let k=0;k<face.triangles.length;k+=3){
      const t=[0,1,2].map(j=>face.points[face.triangles[k+j]]);
      out.push({t,min:[0,1,2].map(i=>Math.min(...t.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...t.map(p=>p[i])))});
    }
  }
  return out;
}
function meshSeparation(A,B){
  let best={d:Infinity},crossings=0;
  for(const a of A)for(const b of B){
    if([0,1,2].some(i=>a.min[i]-b.max[i]>best.d||b.min[i]-a.max[i]>best.d))continue;
    const r=triangleDistance(a.t,b.t);
    if(r.crossing)crossings++;
    if(r.d<best.d)best=r;
  }
  return {...best,crossings};
}
const frontOnly=face=>face.points.every(p=>p[0]<0);
const panParts=['powertrain.sump','powertrain.oil-pickup','powertrain.oil-pump'];
const axleParts=['differentials.front','steering.axle','steering.linkage','suspension.front-track-bar','suspension.radius-arms',
  'differentials.front-shaft','wheels.tire','wheels.rim','wheels.hub','wheels.disc','wheels.caliper','wheels.outer-bearing'];
const poses=liftOptions('g500').map(o=>o.id);
const stockScene=()=>scene();
function posed(mode,inspection={}){
  const renderer=scene(inspection);
  renderer.build={...renderer.build,lift:normalizedLift('g500',{mode})};
  renderer.buildMesh();
  return renderer;
}
const mm=n=>Math.round(n*10000)/10;
const backlog=additionalRequestSections.flatMap(s=>s.items).find(item=>item.id==='g500-sump-diff-clearance');

test('the assembled G500 depicts exactly two front-axle poses: stock height and the 40 mm spring kit',()=>{
  // No articulation or wheel travel is drawn for the G500: it is not a FLEET
  // exhibit, none of its assemblies is animated and the lift is a fixed offset.
  assert.deepEqual(poses,['stock','g500-orc-40']);
  assert(!Object.hasOwn(FLEET,'g500'));
  const renderer=stockScene();
  for(const assembly of getAssemblies('g500')){
    assert(!assembly.animated,assembly.id);
    assert.equal(renderer.getMechanism({assembly:assembly.id}),null,assembly.id);
  }
  assert.equal(renderer.getMechanism({}),null);
  const points=(r,id)=>r.faces.filter(f=>f.part===id).map(f=>f.points);
  const pan=points(renderer,'powertrain.sump'),axle=points(renderer,'differentials.front');
  renderer.mechanismPhase=.37;renderer.meshCache=null;renderer.assembledMesh=null;renderer.buildMesh();
  assert.deepEqual(points(renderer,'powertrain.sump'),pan,'the installed pan must not depend on a motion phase');
  assert.deepEqual(points(renderer,'differentials.front'),axle,'the installed axle must not depend on a motion phase');
  // The kit raises the sprung pan as a whole and leaves the rigid axle at wheel height.
  const lifted=posed('g500-orc-40');
  assert.deepEqual(points(lifted,'differentials.front'),axle);
  const raised=points(lifted,'powertrain.sump');
  pan.forEach((face,i)=>face.forEach((p,j)=>{
    assert.equal(raised[i][j][0],p[0]);assert.equal(raised[i][j][1],p[1]);assert(Math.abs(raised[i][j][2]-p[2]-.040)<1e-12);
  }));
});

test('no pan, pickup or pump triangle crosses or touches any front-axle part at either depicted pose',()=>{
  const measured={};
  for(const mode of poses){
    const {faces}=posed(mode);
    for(const source of panParts){
      const A=worldTriangles(faces,f=>f.part===source);
      assert(A.length,source);
      for(const target of axleParts){
        const B=worldTriangles(faces,f=>f.part===target&&(!target.startsWith('wheels.')||frontOnly(f)));
        assert(B.length,target);
        const s=meshSeparation(A,B);
        assert.equal(s.crossings,0,`${mode}: ${source} crosses ${target}`);
        assert(s.d>.001,`${mode}: ${source} is ${mm(s.d)} mm from ${target}`);
        measured[[mode,source,target].join(' ')]=s;
      }
    }
  }
  const at=(mode,target)=>measured[[mode,'powertrain.sump',target].join(' ')];
  // Stock: the closest differential point is the top of the hydraulic lock
  // cylinder on the left axle tube, directly beneath the forward bowl floor.
  const stock=at('stock','differentials.front');
  assert.equal(mm(stock.d),12.4);
  assert(Math.abs(stock.b[2]-(g500HubZ+.064+.053))<1e-9,'stock contact is on the lock-cylinder crown');
  assert(Math.abs(stock.a[2]-(m113CrankZ-.123))<1e-9,'stock contact is on the forward bowl floor');
  assert(Math.abs(stock.a[0]-stock.b[0])<1e-9&&Math.abs(stock.a[1]-stock.b[1])<1e-9,'the stock minimum is vertical');
  // Spring kit: the vertical actuator gap is 52.4 mm, but the true minimum is
  // the carrier housing beside the bowl floor.
  const kit=at('g500-orc-40','differentials.front');
  assert.equal(mm(kit.d),47.2);
  // The faceted housing crown has a 176 mm profile radius about the axle line.
  assert(Math.abs(kit.b[0]+1.425)<.15&&Math.abs(Math.hypot(kit.b[1]-.1905,kit.b[2]-g500HubZ)-.176)<.005,'kit contact is on the carrier housing crown');
  for(const n of [mm(stock.d),mm(stock.d+.040),mm(kit.d)])assert(backlog.description.includes(n.toFixed(1)+' mm'),'backlog states '+n);
  // The bent front Panhard rod passes closer to the pan than any differential surface.
  assert.equal(mm(at('stock','suspension.front-track-bar').d),6.6);
  assert.equal(mm(at('g500-orc-40','suspension.front-track-bar').d),26.7);
});

test('every installed owner of the pan and front differential keeps the same exact separation',()=>{
  const owners=[[{},'powertrain.sump','differentials.front'],[{assembly:'engine-oil'},'engine-oil.sump','differentials.front'],
    [{assembly:'drivetrain'},'powertrain.sump','drivetrain.front-differential'],[{assembly:'powertrain'},'powertrain.sump','differentials.front'],
    [{assembly:'differentials'},'powertrain.sump','differentials.front'],[{assembly:'suspension'},'powertrain.sump','differentials.front']];
  for(const mode of poses){
    const reference=[];
    for(const [inspection,pan,axle] of owners){
      const {faces}=posed(mode,inspection);
      const s=meshSeparation(worldTriangles(faces,f=>f.part===pan),worldTriangles(faces,f=>f.part===axle));
      assert.equal(s.crossings,0,`${mode} ${inspection.assembly||'vehicle'}`);
      reference.push(s.d);
    }
    for(const d of reference)assert(Math.abs(d-reference[0])<1e-12,`${mode}: owners disagree`);
  }
});

// Section outlines are the clipped edges that lie in the cut plane. The pan is
// a single open skin, so its outline closes against the block along the rail.
function planeOutline(faces,axis,limit,part){
  const segments=[];
  for(const face of faces){
    if(face.part!==part)continue;
    const p=face.points;
    for(let i=0;i<p.length;i++){
      const a=p[i],b=p[(i+1)%p.length];
      if(a[axis]===limit&&b[axis]===limit&&distance(a,b)>0)segments.push([a,b]);
    }
  }
  return segments;
}
function components(segments){
  const key=p=>p.map(v=>v.toFixed(9)).join(','),parent=new Map(),degree=new Map();
  const find=k=>{while(parent.get(k)!==k)k=parent.get(k);return k;};
  for(const [a,b] of segments)for(const k of [key(a),key(b)]){if(!parent.has(k))parent.set(k,k);degree.set(k,(degree.get(k)||0)+1);}
  for(const [a,b] of segments)parent.set(find(key(a)),find(key(b)));
  const groups=new Map();
  for(const segment of segments){
    const root=find(key(segment[0]));
    if(!groups.has(root))groups.set(root,{segments:[],ends:[]});
    groups.get(root).segments.push(segment);
  }
  for(const [k,d] of degree)if(d%2)groups.get(find(k)).ends.push(k.split(',').map(Number));
  return [...groups.values()];
}
const crossing2=(a,b,c,d)=>{
  const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  const d1=o(c,d,a),d2=o(c,d,b),d3=o(a,b,c),d4=o(a,b,d);
  if(((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0)))return true;
  const on=(p,q,r,v)=>Math.abs(v)<1e-15&&Math.min(p[0],q[0])-1e-15<=r[0]&&r[0]<=Math.max(p[0],q[0])+1e-15&&Math.min(p[1],q[1])-1e-15<=r[1]&&r[1]<=Math.max(p[1],q[1])+1e-15;
  return on(c,d,a,d1)||on(c,d,b,d2)||on(a,b,c,d3)||on(a,b,d,d4);
};
function inside(point,segments){
  // Even-odd parity along a direction that no outline vertex shares.
  const dir=[Math.cos(.4142),Math.sin(.4142)];let hits=0;
  for(const [a,b] of segments){
    const e=[b[0]-a[0],b[1]-a[1]],w=[a[0]-point[0],a[1]-point[1]],den=dir[0]*e[1]-dir[1]*e[0];
    if(Math.abs(den)<1e-18)continue;
    const t=(w[0]*e[1]-w[1]*e[0])/den,u=(w[0]*dir[1]-w[1]*dir[0])/den;
    if(t>0&&u>=0&&u<1)hits++;
  }
  return hits%2===1;
}

test('every viewer section that cuts the pan shows it apart from each front-axle outline',()=>{
  let shared=0,actuatorCut=false;
  for(const mode of poses){
    const renderer=posed(mode),whole=renderer.faces;
    const rail=m113CrankZ+m113PanRail+(mode==='stock'?0:.040);
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    const box=new Map();
    for(const face of whole)for(const p of face.points)for(let i=0;i<3;i++){
      min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);
      if(face.part==='powertrain.sump'||axleParts.includes(face.part)){
        const b=box.get(face.part)||{min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};box.set(face.part,b);
        b.min[i]=Math.min(b.min[i],p[i]);b.max[i]=Math.max(b.max[i],p[i]);
      }
    }
    const pan=box.get('powertrain.sump');
    for(const axis of [0,1,2])for(const reverse of [false,true])for(let percent=2;percent<100;percent++){
      const k=percent/100,limit=reverse?max[axis]-(max[axis]-min[axis])*k:min[axis]+(max[axis]-min[axis])*k;
      if(limit<pan.min[axis]||limit>pan.max[axis])continue;
      renderer.sectionPlane={axis,percent,reverse};renderer.buildMesh();
      const cut=renderer.faces;
      assert.deepEqual(sectionFaces(whole,renderer.sectionPlane).length,cut.length,'the scene uses the viewer clipping');
      const [u,v]=[0,1,2].filter(i=>i!==axis),flat=p=>[p[u],p[v]];
      const sump=planeOutline(cut,axis,limit,'powertrain.sump');
      if(!sump.length)continue;
      const panLoops=components(sump),closed=[];
      for(const loop of panLoops){
        // The skin is open only along the sealing rail, where the block closes it.
        // The two cast webs are open fins on the outer skin. They stand 5 mm
        // proud, and a shallow cut stretches that offset within the plane.
        const onRail=loop.ends.every(end=>Math.abs(end[2]-rail)<1e-9);
        if(onRail&&loop.ends.length===2)loop.segments.push(loop.ends);
        if(onRail&&loop.ends.length<=2){closed.push(loop);continue;}
        const skin=panLoops.filter(l=>l!==loop).flatMap(l=>l.segments);
        for(const end of loop.ends){
          const gap=Math.min(...skin.map(([a,b])=>distance(end,closestSegments(end,end,a,b)[1])));
          assert(gap<.010,`${mode} axis ${axis} ${percent}%: a pan outline ends ${mm(gap)} mm off the skin`);
        }
      }
      assert(closed.length,`${mode} axis ${axis} ${percent}%: the pan section must close`);
      const panRegion=closed.flatMap(l=>l.segments).map(s=>s.map(flat));
      const panEdges=sump.map(s=>s.map(flat));
      for(const part of axleParts){
        const b=box.get(part);if(!b||limit<b.min[axis]||limit>b.max[axis])continue;
        const outline=planeOutline(cut,axis,limit,part);
        if(!outline.length)continue;
        shared++;
        if(part==='differentials.front'&&axis===0&&Math.abs(limit+1.425)<.03)actuatorCut=true;
        const other=outline.map(s=>s.map(flat));
        for(const [a,c] of [...panEdges,...panRegion])for(const [d,e] of other)
          assert(!crossing2(a,c,d,e),`${mode} axis ${axis} ${percent}%${reverse?' reversed':''}: pan outline crosses ${part}`);
        for(const [p] of other)assert(!inside(p,panRegion),`${mode} axis ${axis} ${percent}%: ${part} lies inside the pan outline`);
        for(const loop of components(outline))if(!loop.ends.length){
          const region=loop.segments.map(s=>s.map(flat));
          for(const [p] of panEdges)assert(!inside(p,region),`${mode} axis ${axis} ${percent}%: pan lies inside ${part}`);
        }
      }
    }
  }
  assert(shared>20,'the sections must actually cut the pan and the axle together');
  assert(actuatorCut,'a front-to-back cut must pass through the lock actuator and pan');
});

// Render the installed surfaces with unique flat colors and compare every
// pixel with an independent world-space ray cast.
function rayCast(triangles,origin,direction){
  const found=[];
  for(const tri of triangles){
    const [a,b,c]=tri.t,e1=sub(b,a),e2=sub(c,a),h=cross(direction,e2),det=dot(e1,h);
    if(Math.abs(det)<1e-14)continue;
    const s=sub(origin,a),u=dot(s,h)/det;if(u<-1e-9||u>1+1e-9)continue;
    const q=cross(s,e1),v=dot(direction,q)/det;if(v<-1e-9||u+v>1+1e-9)continue;
    found.push({t:dot(e2,q)/det,part:tri.part,edge:Math.min(u,v,1-u-v)<1e-6});
  }
  if(!found.length)return null;
  // The viewer looks back along the ray: the largest parameter is nearest.
  found.sort((p,q)=>q.t-p.t);
  const best=found[0],rival=found.find(h=>h.part!==best.part);
  return {...best,ambiguous:best.edge||Boolean(rival&&best.t-rival.t<1e-6),behind:new Set(found.slice(1).map(h=>h.part))};
}
function renderView(faces,{yaw,pitch,center,size=96,span=.9}){
  const right=[Math.cos(yaw),Math.sin(yaw),0];
  const near=[-Math.sin(yaw)*Math.cos(pitch),Math.cos(yaw)*Math.cos(pitch),Math.sin(pitch)];
  const down=cross(near,right),scale=size/span;
  const project=p=>{const d=sub(p,center);return {x:size/2+dot(right,d)*scale,y:size/2+dot(down,d)*scale,depth:dot(near,p)};};
  const r={canvas:{dataset:{}},faces,ctx:{drawImage(){}},cpuWidth:size,cpuHeight:size,
    cpuPixels:{data:new Uint8ClampedArray(size*size*4)},cpuDepth:new Float64Array(size*size),cpuSurface:{width:size,height:size,getContext:()=>({putImageData(){}})}};
  softwareDepthRender(r,size,size,project);
  const pixel=(x,y)=>'#'+Array.from(r.cpuPixels.data.slice((y*size+x)*4,(y*size+x)*4+3),n=>n.toString(16).padStart(2,'0')).join('');
  // Bin the world triangles by their screen footprint, then cast one ray per pixel center.
  const cell=8,bins=Array.from({length:(size/cell)**2},()=>[]);
  for(const f of faces)for(const tri of worldTriangles([f],()=>true)){
    const q=tri.t.map(project),lo=v=>Math.max(0,Math.floor(v/cell)),hi=v=>Math.min(size/cell-1,Math.floor(v/cell));
    const x0=lo(Math.min(...q.map(p=>p.x))),x1=hi(Math.max(...q.map(p=>p.x))),y0=lo(Math.min(...q.map(p=>p.y))),y1=hi(Math.max(...q.map(p=>p.y)));
    for(let by=y0;by<=y1;by++)for(let bx=x0;bx<=x1;bx++)bins[by*size/cell+bx].push({...tri,part:f.part});
  }
  const hits=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const o=center.map((c,i)=>c+right[i]*(x+.5-size/2)/scale+down[i]*(y+.5-size/2)/scale-near[i]*10);
    hits.push(rayCast(bins[Math.floor(y/cell)*size/cell+Math.floor(x/cell)],o,near));
  }
  return {size,pixel,hit:(x,y)=>hits[y*size+x]};
}
test('the depth renderer shows the nearer of the pan and axle at every pixel, in each inspection mode',()=>{
  const ids=['powertrain.sump','powertrain.oil-pump','powertrain.block','differentials.front','steering.axle','suspension.front-track-bar'];
  const colors=new Map(ids.map((id,i)=>[id,'#'+[40+i*30,200-i*25,90+i*20].map(n=>n.toString(16).padStart(2,'0')).join('')]));
  const views=[{yaw:0,pitch:-1.2},{yaw:.6,pitch:-.35},{yaw:-1.57,pitch:-.15},{yaw:2.2,pitch:-.6},{yaw:0,pitch:-.05}];
  const center=[-1.43,0,.56];
  const modes=[['assembled',{}],['sump selected',{part:'powertrain.sump'}],['differential selected',{part:'differentials.front'}]];
  let occluded=0,checked=0;
  for(const pose of poses)for(const [label,inspection] of modes){
    const renderer=posed(pose,inspection);
    // See-through and section modes feed the same opaque pass.
    const ghost=bodyVisibility(renderer.faces,inspection.part);
    for(const id of ids){
      const before=renderer.faces.filter(f=>f.part===id),after=ghost.filter(f=>f.part===id);
      assert(before.length&&before.every((f,i)=>after[i]===f&&(f.opacity??1)===1&&!f.ghostShell),`${label}: ${id} must stay opaque`);
    }
    const scenes=[renderer.faces,sectionFaces(renderer.faces,{axis:1,percent:42,reverse:false})];
    for(const source of scenes){
      const faces=source.filter(f=>colors.has(f.part)).map(f=>({points:f.points,triangles:f.triangles||undefined,part:f.part,color:colors.get(f.part)}));
      for(const f of faces)f.triangles??=faceTriangles(f.points);
      for(const view of views){
        const {size,pixel,hit:cast}=renderView(faces,{...view,center});
        for(let y=0;y<size;y++)for(let x=0;x<size;x++){
          const hit=cast(x,y);if(!hit||hit.ambiguous)continue;
          checked++;
          assert.equal(pixel(x,y),colors.get(hit.part),`${pose} ${label} view ${views.indexOf(view)} pixel ${x},${y} should show ${hit.part}`);
          if(hit.part!=='powertrain.sump'&&hit.behind?.has('powertrain.sump'))occluded++;
        }
      }
    }
  }
  assert(checked>50000&&occluded>500,`the comparison must include pan pixels hidden by the axle (${checked}, ${occluded})`);
});

test('the GPU pass draws the pan and axle as depth-tested opaque triangles with sub-micron depth cells',()=>{
  const renderer=stockScene();
  const ids=new Set(['powertrain.sump','differentials.front','suspension.front-track-bar']);
  const width=400,height=300;
  for(const [yaw,pitch] of [[0,-1.2],[.6,-.35],[-1.57,-.15],[2.2,.5]]){
    const right=[Math.cos(yaw),Math.sin(yaw),0],near=[-Math.sin(yaw)*Math.cos(pitch),Math.cos(yaw)*Math.cos(pitch),Math.sin(pitch)];
    const down=cross(near,right),scale=60;
    const project=p=>({x:width/2+dot(right,p)*scale,y:height*.65+dot(down,p)*scale,depth:dot(near,p)});
    const draws=[];let depthWrites=true,depthTest=false,blend=false,data;
    const gl={LESS:513,DEPTH_TEST:2929,BLEND:3042,TRIANGLES:4,DEPTH_BITS:3414,isContextLost:()=>false,getParameter:()=>24,
      viewport(){},clearColor(){},clearDepth(){},clear(){},useProgram(){},depthFunc(mode){assert.equal(mode,this.LESS);},
      enable(cap){if(cap===this.DEPTH_TEST)depthTest=true;if(cap===this.BLEND)blend=true;},disable(cap){if(cap===this.DEPTH_TEST)depthTest=false;if(cap===this.BLEND)blend=false;},
      depthMask(v){depthWrites=v;},bindBuffer(){},bufferData(target,d){data=Float32Array.from(d);},getAttribLocation(){return 0;},
      enableVertexAttribArray(){},vertexAttribPointer(){},blendFuncSeparate(){},drawArrays(mode,start,count){draws.push({start,count,depthWrites,depthTest,blend});}};
    const colored=renderer.faces.map(f=>ids.has(f.part)?{...f,color:f.part==='powertrain.sump'?'#ff0000':f.part==='differentials.front'?'#00ff00':'#0000ff',vertexColors:undefined}:f);
    const r={gl,canvas:{dataset:{}},surface:{width,height},ctx:{drawImage(){}},faces:colored,program:{},buffer:{},
      softwareRender(){throw new Error('the 24-bit context should stay on the GPU');}};
    gpuDepthRender(r,width,height,1,project);
    const opaque=draws[0];
    assert(opaque&&opaque.start===0&&opaque.depthWrites&&opaque.depthTest&&!opaque.blend);
    let found=0,zMin=Infinity,zMax=-Infinity;
    for(let i=0;i<opaque.count;i++){
      const v=data.subarray(i*7,i*7+7);
      const tagged=(v[3]===1&&v[4]===0&&v[5]===0)||(v[3]===0&&v[4]===1&&v[5]===0)||(v[3]===0&&v[4]===0&&v[5]===1);
      if(tagged){found++;assert.equal(v[6],1);}
      zMin=Math.min(zMin,v[2]);zMax=Math.max(zMax,v[2]);
    }
    assert(found>1000,'the tagged surfaces must be submitted in the opaque pass');
    for(let i=opaque.count;i<data.length/7;i++){
      const v=data.subarray(i*7,i*7+7);
      assert(!((v[3]===1&&v[4]===0&&v[5]===0)||(v[3]===0&&v[4]===1&&v[5]===0)),'pan and axle must not be blended');
    }
    // Normalized depth spans [-1, 1]; a 24-bit buffer resolves 2 / 2^24 of that span.
    let near0=Infinity,far0=-Infinity;
    for(const f of renderer.faces)for(const p of f.points){const q=project(p);if(q.x<0||q.x>width||q.y<0||q.y>height)continue;near0=Math.min(near0,q.depth);far0=Math.max(far0,q.depth);}
    const cell=(far0-near0)*1.002/2**24;
    assert(zMin>=-1&&zMax<=1);
    assert(cell<1e-6,`depth cell ${cell} m`);
  }
});
