import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {buildG500Exterior} from '../garage/exterior-g500.js';
import {exteriorProfiles,registeredProfilePoint} from '../garage/exterior-profiles.js';

function renderer(){
  return Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'g500',parts:[]},faces:[],schematic:true,inspection:{},
    canvas:{getBoundingClientRect:()=>({left:0,top:0})},project:([x,y,z])=>({x,y,depth:z})
  });
}
test('the fitted bonnet follows independent side crown and plan hem readings from the 2850 mm drawing',()=>{
  const r=renderer();buildG500Exterior(r,'#718077');
  function highest(x){
    let z=-Infinity;
    for(const f of r.faces.filter(q=>q.part==='body.hood'))for(let i=0;i<f.points.length;i++){
      const a=f.points[i],b=f.points[(i+1)%f.points.length];
      if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0])||Math.abs(a[0]-b[0])<1e-8)continue;
      z=Math.max(z,a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0]));
    }
    return z;
  }
  // Stations 240, 265, 300, 330 and 365 are withheld from skin construction.
  for(const [u,v,planEdge] of [[240,700,1021],[265,696,1014],[300,693.5,1005],[330,691.5,997],[365,690,987]]){
    const x=-1.425+(u-310)*2.85/423,z=1.231+(710-v)*2.85/423,y=(1097-planEdge)*2.85/423;
    assert(Math.abs(highest(x)-z)<.011,'side crown at '+u);
    for(const side of [-1,1]){
      assert.equal(r.hitTest(x,side*(y-.022))?.part,'body.hood','inside plan outline at '+u);
      assert.equal(r.hitTest(x,side*(y+.022))?.part,'body.structure','on the fixed wing at '+u);
    }
  }
  assert(r.faces.filter(f=>f.part==='body.hood').every(f=>f.rigid.name==='bonnet'));
  assert(r.faces.filter(f=>f.part==='body.windshield').every(f=>f.rigid.name==='windshield'));
  const w={'front-left':[-1.425,-.7575,.4276],'rear-left':[1.425,-.7575,.4276]},p=exteriorProfiles.g500;
  assert.deepEqual(registeredProfilePoint(p.front,p,w),[-1.425,0,.4276]);
  const [rx,ry,rz]=registeredProfilePoint(p.rear,p,w);
  assert(Math.hypot(rx-1.425,ry,rz-.4276)<1e-9);
});
test('isolated hood reuses its installed geometry, with a through-cut under the removable vent',()=>{
  const d=getDetail('g500','body.hood'),r=renderer();d.draw(r);
  assert.equal(getDetail('bmw325ci','body.hood'),null);
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(d.componentIndex.keys()));
  const whole=renderer();buildG500Exterior(whole,'#879993');
  const installed=whole.faces.filter(f=>f.part==='body.hood');
  assert.equal(installed.length,r.faces.length);
  for(let i=0;i<installed.length;i++){
    for(let j=0;j<installed[i].points.length;j++){
      const [x,y,z]=installed[i].points[j],q=r.faces[i].points[j];
      assert(Math.hypot(q[0]-x-1.45,q[1]-y,q[2]-z+1.19)<1e-9);
    }
  }
  const x=-1.425+(378-310)*2.85/423+1.45;
  r.faces=r.faces.filter(q=>q.part==='g500-bonnet.skin');
  assert.equal(r.hitTest(x,.12),null);
  assert.equal(r.hitTest(x,.32)?.part,'g500-bonnet.skin');
  assert.equal(r.hitTest(x-.20,.12)?.part,'g500-bonnet.skin');
});
test('the steel brow and installed roof package remain aft of the registered workshop windshield line',async()=>{
  const {measureStockMesh}=await import('../garage/factory-dimensions.js');
  const {upperOutlineGap}=await import('../garage/exterior-profiles.js');
  const {DEFAULT_BUILD}=await import('../garage/model.js');
  const stock=GarageRenderer.assembledFaces({...DEFAULT_BUILD,vehicle:'g500'}),profile=exteriorProfiles.g500;
  const {wheels}=measureStockMesh('g500',stock);
  const top=upperOutlineGap({...profile,curves:[profile.curves[1]]},wheels,stock);
  assert.equal(top.count,15);
  assert(top.maximum<42,'the cassette, wiring or roof brow entered the windshield silhouette');
  assert(top.median<15);
  const all=upperOutlineGap(profile,wheels,stock);
  assert.equal(all.count,22);
  assert(all.maximum<72,'the US grille datum leaves a documented offset at the hood');
});
