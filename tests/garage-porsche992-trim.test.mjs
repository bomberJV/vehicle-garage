import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';

const faces=GarageRenderer.assembledFaces({vehicle:'porsche992scab',roofPosition:'up',parts:[]});
const parts=id=>faces.filter(f=>f.part===id);
const range=(points,axis)=>[Math.min(...points.map(p=>p[axis])),Math.max(...points.map(p=>p[axis]))];
const near=(value,wanted,tolerance)=>assert(Math.abs(value-wanted)<tolerance,`${value} differs from ${wanted}`);

test('992 standard LED optics and the two central stop lights follow the factory plan drawing',()=>{
  const headlights=parts('lights.headlamps');
  // Sheet p86, scaled from the two axle centres. These limits include the leading lens lip.
  for(const side of [-1,1]){
    const lamp=headlights.filter(f=>f.points.every(p=>side*p[1]>0));
    const points=lamp.flatMap(f=>f.points),[nose,tail]=range(points,0);
    near(nose,-1.923,.008);near(tail,-1.528,.008);
    const sides=points.map(([x,y,z])=>[x,side*y,z]);
    const [inner,outer]=range(sides,1);near(inner,.558,.008);near(outer,.825,.008);
    assert.equal(lamp.filter(f=>f.color==='#d4d9d2').length,4);
    // Both projected edges of the lens were read separately from p86 side elevation.
    // A lamp with the right plan outline can still sit almost flat on the bonnet.
    const [low,high]=range(points,2);near(low,.594,.013);near(high,.839,.014);
    assert(high-low>.22);
  }
  const centreLights=parts('lights.tail').filter(f=>f.color==='#de6264');
  assert.equal(centreLights.length,2);
  for(const lamp of centreLights){
    const [front,rear]=range(lamp.points,0);near(front,1.706,.003);near(rear,1.961,.003);
    assert(lamp.points.every(p=>Math.abs(p[1])<.03));
  }
  const rearGuide=parts('lights.tail').filter(f=>f.color==='#df5558');
  assert.equal(rearGuide.length,2);
  for(const half of rearGuide){
    assert(half.points.some(p=>Math.abs(p[1])<1e-9));
    near(Math.min(...half.points.map(p=>p[0])),1.665,.004);
  }
});

test('the 992 Carrera S5 has five independent lug positions at each staggered wheel',()=>{
  for(const instance of ['front-left','front-right','rear-left','rear-right']){
    const rim=parts('running.rims').filter(f=>f.instance===instance);
    const [min,max]=range(rim.flatMap(f=>f.points),0),axle=(min+max)/2;
    const [bottom,top]=range(rim.flatMap(f=>f.points),2),hub=(top+bottom)/2;
    near(max-min,instance.startsWith('front')?.508:.5334,.0002);
    const heads=rim.filter(f=>f.color==='#4f5558'&&f.points.length===6);
    assert.equal(heads.length,5);
    for(const head of heads){
      const x=head.points.reduce((s,p)=>s+p[0],0)/6,z=head.points.reduce((s,p)=>s+p[2],0)/6;
      near(Math.hypot(x-axle,z-hub),.065,.0002);
    }
  }
});

test('each closed 992 side window meets the cloth sail at the photographed quarter-window tip',()=>{
  const panes=parts('cabin.windshield').filter(f=>f.roofServicePart&&f.opacity);
  for(const s of [-1,1]){
    const side=panes.filter(f=>f.points.every(p=>s*p[1]>0));
    near(Math.max(...side.flatMap(f=>f.points.map(p=>p[0]))),.983,.005);
    assert(side.some(f=>f.points.filter(p=>Math.abs(p[0]-.598)<.001).length===2));
  }
  const glass=parts('roof.rear-window').filter(f=>f.opacity).flatMap(f=>f.points);
  assert(glass.some(p=>p[0]>1.285&&p[2]>1.1));
});
