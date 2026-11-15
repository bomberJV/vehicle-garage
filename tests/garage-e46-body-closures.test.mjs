import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildBmwExterior} from '../garage/exterior-bmw.js';
import {getComponent} from '../garage/assemblies.js';

function shell(open=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],lights:false,build:{vehicle:'bmw325ci',parts:[],bmwVentPosition:open?'open':'closed'},inspection:{},schematic:true});
 buildBmwExterior(r,'#748884');
 return r;
}
function sHeight(faces,x){
 let highest=0;
 for(const f of faces)for(let i=0;i<f.points.length;i++){
  const a=f.points[i],b=f.points[(i+1)%f.points.length];
  if((a[0]<x)===(b[0]<x))continue;
  highest=Math.max(highest,a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0]));
 }
 return highest-.040;
}
test('door mirror, frameless door glass, tail lid and side vent have their own physical mounts',()=>{
 const r=shell();
 for(const side of ['left','right']){
  const mirror='body.mirror-'+side;
  assert(getComponent('bmw325ci',mirror)?.source);
  const mirrorFaces=r.faces.filter(f=>f.part===mirror);
  assert(mirrorFaces.length>20);
  assert(mirrorFaces.every(f=>f.rigid.name==='front-door-'+side));
  const quarter=r.faces.filter(f=>f.part==='body.quarter-'+side);
  assert(quarter.length&&quarter.every(f=>f.rigid.name==='quarter-'+side));
  const glass=r.faces.filter(f=>f.part==='body.glass'&&f.rigid?.name==='front-door-'+side);
  assert(glass.some(f=>f.opacity<1)&&glass.some(f=>f.color==='#829a96'));
 }
 assert(r.faces.every(f=>f.part!=='body.deck'||f.rigid.name==='trunk-lid'));
 assert(r.faces.every(f=>f.part!=='body.hood'||f.rigid.name==='bonnet'));
 assert(r.faces.every(f=>f.rigid?.name!=='windshield'||f.part==='body.glass'));
});
test('factory side profile retains the rearward sloping B pillar, rear quarter kink and high deck',()=>{
 const r=shell(),pane=r.faces.filter(f=>f.part==='body.quarter-right'&&f.opacity<1).flatMap(f=>f.points);
 const top=pane.filter(p=>p[2]>1.315),bottom=pane.filter(p=>p[2]<1.0);
 assert(top.length&&bottom.length);
 assert(Math.min(...top.map(p=>p[0]))>Math.min(...bottom.map(p=>p[0]))+.10);
 const far=Math.max(...pane.map(p=>p[0]));
 assert(far>1.31&&far<1.38);
 assert(Math.max(...bottom.map(p=>p[0]))<far-.065);
 const skin=r.faces.filter(f=>['body.structure','body.hood','body.deck','body.glass','roof.glass'].includes(f.part));
 for(const [station,height] of [[-1.36,.89],[-.90,.94],[.22,1.37],[1.74,1.10],[2.09,1.02]]){
  const actual=sHeight(skin,station);assert(Math.abs(actual-height)<.015,station+' height = '+actual);
 }
});
test('the quarter glass opens while its base seal and the door mirror remain installed',()=>{
 const closed=shell().faces,open=shell(true).faces;
 assert.equal(closed.length,open.length);const moving=new Set();
 for(let i=0;i<open.length;i++){
  const src=closed[i],dst=open[i];
  if(src.points.some((p,j)=>p.some((v,k)=>Math.abs(v-dst.points[j][k])>1e-7)))moving.add(src.part);
 }
 assert.deepEqual([...moving].sort(),['body.quarter-left','body.quarter-right']);
});
