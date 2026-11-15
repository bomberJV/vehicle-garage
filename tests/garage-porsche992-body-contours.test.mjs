import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {measureStockMesh} from '../garage/factory-dimensions.js';
import {exteriorProfiles,upperOutlineGap} from '../garage/exterior-profiles.js';
import {faceTriangles} from '../garage/mesh-triangles.js';

const stock=GarageRenderer.assembledFaces({vehicle:'porsche992scab',roofPosition:'down',parts:[]});
const shell=stock.filter(f=>['shell.fenders','shell.spoiler','shell.deck','shell.luggage','shell.bumpers'].includes(f.part));
const edges=[];
for(const face of shell){
  const indices=face.triangles||faceTriangles(face.points);
  for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++){
    edges.push([face.points[indices[i+j]],face.points[indices[i+(j+1)%3]]]);
  }
}
function section(axis,value){
  const points=[];
  for(const [a,b] of edges){
    if((a[axis]-value)*(b[axis]-value)>=0)continue;
    const t=(value-a[axis])/(b[axis]-a[axis]);
    points.push(a.map((v,k)=>v+t*(b[k]-v)));
  }
  return points;
}

test('992 bumper corners recede by the distances read from the Porsche plan outline',()=>{
  // PDF p86: original page space, not coordinates from the 3-D model.
  // Front/rear wheel centres (168.40,421.79) give 103.424 pt/m.
  // The drawing puts the centreline on y=346.8; reference each cap to its tip.
  const scale=(421.789-168.4)/2.45;
  // These slices fall between the lateral stations used to construct the loft.
  const drawing=[[332,62.75,529.50],[322,63.75,528.50],[313,65.25,527.25],
    [307,66.50,526.25],[293,73.25,521.75],[287,77.00,518.75],
    [278,83.00,512.00],[271,88.00,503.50],[267,91.00,496.75],[263,94.25,488.50]];
  let sumSq=0;
  for(const [pageY,front,rear] of drawing){
    const yy=(346.80-pageY)/scale;
    const hits=section(1,yy).map(p=>p[0]);
    const errors=[Math.min(...hits)+2.240-(front-62.25)/scale,2.279-Math.max(...hits)-(530.00-rear)/scale];
    errors.forEach(e=>{assert(Math.abs(e)<.029,'body corner at y='+yy+', error '+e);sumSq+=e*e;});
  }
  assert(Math.sqrt(sumSq/(2*drawing.length))<.015);
});

test('front fender crown follows the side elevation and the bonnet and rocker are separate physical panels',()=>{
  const scale=(421.789-168.40)/2.45;
  const front=-1.2,rear=1.25;
  for(const [pageX,pageY] of [[96,532.3],[107,529],[123,520.8],[139,517.2],[163,514.8],[187,511]]){
    const xx=front+(pageX-168.4)/scale;
    const lineAtAxle=570.075+(xx-front)/(rear-front)*.760;
    const height=.339+(lineAtAxle-pageY)/scale;
    const actual=Math.max(...section(0,xx).filter(p=>p[1]>.5).map(p=>p[2]));
    assert(Math.abs(actual-height)<.033,'shoulder at x='+xx+', error '+(actual-height));
  }
  const panel=stock.filter(f=>f.part==='shell.luggage').flatMap(f=>f.points);
  assert(Math.min(...panel.map(p=>p[0]))>-2.16);
  const doorPaint=stock.filter(f=>f.part==='shell.left-door'&&f.vertexColors).flatMap(f=>f.points);
  assert(Math.min(...doorPaint.map(p=>p[2]))>.245);
  const rearAt=h=>Math.max(...doorPaint.filter(p=>Math.abs(p[2]-h)<.055).map(p=>p[0]));
  assert(rearAt(.76)-rearAt(.26)>.25);
});

test('the battery and terminals fit under the closed luggage lid at the rescue-sheet station',()=>{
  const battery=stock.filter(f=>f.part==='electrical.battery').flatMap(f=>f.points);
  const xs=battery.map(p=>p[0]),ys=battery.map(p=>p[1]);
  // Battery symbol bounding box x=162.49..188.26, y=325.82..362.93.
  assert(Math.abs((Math.max(...xs)+Math.min(...xs))/2-(-1.132))<.015);
  assert(Math.abs((Math.max(...ys)+Math.min(...ys))/2-.023)<.02);
  const roof=new Map();
  for(const p of battery){
    const key=p[0];
    if(!roof.has(key))roof.set(key,Math.max(...section(0,key).filter(q=>Math.abs(q[1])<.16).map(q=>q[2])));
    assert(roof.get(key)-p[2]>.009);
  }
});

test('side elevation is opaque where the bumper corner joins the front fender',()=>{
  const view=Object.assign(Object.create(GarageRenderer.prototype),{faces:stock,canvas:{dataset:{}}});
  // Keep the test in model space, with transverse rays across the cover-to-wing joint.
  view.hitFaces=stock.map(f=>({...f,projected:f.points.map(([x,depth,z])=>({x,y:z,depth}))}));
  for(let i=1;i<=10;i++)for(let j=1;j<=8;j++){
    const xx=-1.77+i*.007,zz=.428+j*.008;
    const face=view.surfaceAt(xx,zz)?.face;
    assert(face&&['shell.fenders','shell.bumpers','p992-markers.right'].includes(face.part),'front side cover at '+[xx,zz]);
  }
});

test('the parked rear cover, spoiler pins and undertray close against the actual outer skin',()=>{
  const a=.95,e=.19,ca=Math.cos(a),sa=Math.sin(a),ce=Math.cos(e),se=Math.sin(e);
  const view=Object.assign(Object.create(GarageRenderer.prototype),{canvas:{dataset:{}}});
  const project=([x,y,z])=>({x:x*ca-y*sa,y:-z*ce+(x*sa+y*ca)*se,depth:(x*sa+y*ca)*ce+z*se});
  view.hitFaces=stock.map(f=>({...f,projected:f.points.map(project)}));
  // Orthographic rays through the former fixed-to-moving joint, both pin caps,
  // and the underside return nearest the right rear wheel, in model metres.
  const min=[Infinity,Infinity],max=[-Infinity,-Infinity];
  for(const f of view.hitFaces)for(const p of f.projected){
    for(const [k,val] of [p.x,p.y].entries()){min[k]=Math.min(min[k],val);max[k]=Math.max(max[k],val);}
  }
  const scale=Math.min(640*.94/(max[0]-min[0]),368*.90/(max[1]-min[1]));
  for(const [px,py,owner] of [[405,183,'shell.deck'],[435,195,'shell.spoiler'],[430,195,'shell.deck'],[457,184,'shell.spoiler'],[578,166,'shell.spoiler'],[368,287,'shell.bumpers']]){
    const xx=(px+.5-320)/scale+(min[0]+max[0])/2,yy=(py+.5-184)/scale+(min[1]+max[1])/2;
    const hit=view.surfaceAt(xx,yy);
    assert.equal(hit?.face.part,owner,'rear quarter contact at '+[xx,yy]);
    assert(hit.face.vertexColors,'paint covers the hardware and inner returns');
  }
});

test('closed Cabriolet upper envelope follows the axle-registered factory side elevation',()=>{
  const id='porsche992scab';
  const raised=GarageRenderer.assembledFaces({vehicle:id,roofPosition:'up',parts:[]});
  const wheels=measureStockMesh(id,raised).wheels;
  const {count,median,maximum}=upperOutlineGap(exteriorProfiles[id],wheels,raised);
  assert.equal(count,25);
  assert(median<=17,`median skyline error ${median} mm`);
  // The family sheet is about 30 mm taller at the crown than the Carrera S specification.
  assert(maximum<=37,`maximum skyline error ${maximum} mm`);
});

test('installed radiator and condenser hardware stays behind both front duct openings',()=>{
  const view=Object.assign(Object.create(GarageRenderer.prototype),{canvas:{dataset:{}}});
  view.hitFaces=stock.map(f=>({...f,projected:f.points.map(([x,y,z])=>({x:y,y:-z,depth:-x}))}));
  for(const side of [-1,1])for(const y of [.52,.62,.71,.73,.754])for(const z of [.325,.357,.39,.415,.437]){
    const visible=view.surfaceAt(side*y,-z)?.face;
    assert.equal(visible?.part,'shell.bumpers',`front duct at ${side*y},${z}`);
  }
});
