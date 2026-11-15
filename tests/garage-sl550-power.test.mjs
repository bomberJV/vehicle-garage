import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {drawSLPower,slPowerGroups,slPowerStudies} from '../garage/sl550-power.js';
import {m278PistonPosition} from '../garage/sl550-power-studies.js';
function mesh(draw){const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});draw(r);return r.faces;}
const coordinates=(faces)=>faces.flatMap(f=>f.points);
const xBounds=(points)=>[Math.min(...points.map(p=>p[0])),Math.max(...points.map(p=>p[0]))];
test('R231 has a front V8, a common charge cooler, a rear final drive and a connected transmission tunnel',()=>{
  const faces=mesh(drawSLPower),parts=slPowerGroups.flatMap(g=>g.parts);
  assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(parts.map(p=>p.id)));
  for(const p of parts)assert.match(p.source.url,/^https:\/\//);
  const pts=id=>coordinates(faces.filter(f=>f.part===id));
  const block=xBounds(pts('sl-m278.block')),trans=xBounds(pts('sl-drive.auto')),shaft=xBounds(pts('sl-drive.shaft')),final=xBounds(pts('sl-drive.final'));
  assert(Math.abs(block[1]-trans[0])<.01);
  assert(Math.abs(trans[1]-shaft[0])<.01);
  assert(Math.abs(shaft[1]-final[0])<.01);
  assert(Math.max(...pts('sl-air.core').map(p=>Math.abs(p[1])))<.45);
  assert(final[0]>1&&final[1]>1.2925);
  const turbos=pts('sl-air.turbos');
  assert(turbos.some(p=>p[1]<-.40)&&turbos.some(p=>p[1]>.40));
  const struts=pts('sl-abc.struts');
  for(const axle of [-1.2925,1.2925])for(const side of [-1,1])assert(struts.some(p=>Math.abs(p[0]-axle)<.09&&p[1]*side>.60));
});
test('the M278 crank study sweeps an 86 millimeter stroke on each of eight cylinders',()=>{
  for(const s of [-1,1])for(let i=0;i<4;i++){
    const h=Array.from({length:720},(_,j)=>{const [,y,z]=m278PistonPosition(i,s,j/720);return Math.SQRT1_2*(s*y+z);});
    assert(Math.abs(Math.max(...h)-Math.min(...h)-.086)<1e-7);
    assert.deepEqual(m278PistonPosition(i,s,0).map(v=>v.toFixed(8)),m278PistonPosition(i,s,1).map(v=>v.toFixed(8)));
  }
});
test('the nested SL550 mechanical studies separate into their catalogued parts',()=>{
  for(const [parent,detail] of Object.entries(slPowerStudies)){
    assert(slPowerGroups.some(g=>g.parts.some(p=>p.id===parent)));
    const expected=new Set(detail.groups.flatMap(g=>g.parts.map(p=>p.id)));
    const rest=mesh(r=>detail.draw(r,0)),moved=mesh(r=>detail.draw(r,.25));
    for(const collection of [rest,moved]){
      assert.deepEqual(new Set(collection.map(f=>f.part)),expected);
      assert(collection.every(f=>f.points.every(v=>v.every(Number.isFinite))));
    }
    if(detail.animated)assert.notDeepEqual(rest.map(f=>f.points),moved.map(f=>f.points));
  }
});

test('M278 chain planes lead from the crank to both cam banks and the lower oil pump',()=>{
  const study=slPowerStudies['sl-m278.timing'];
  assert.match(study.source.url,/#page=28$/);
  const faces=mesh(r=>study.draw(r));
  const points=id=>coordinates(faces.filter(f=>f.part==='m278-timing.'+id));
  const axis=id=>xBounds(points(id)).reduce((a,b)=>(a+b)/2);
  const loops=['primary','left','right','oil'];
  assert.equal(new Set(loops.map(axis)).size,4);
  for(const id of loops)assert(points(id).length>0);
  const reaches=(id,y,z,rad)=>points(id).some(p=>Math.abs(Math.hypot(p[1]-y,p[2]-z)-rad)<.005);
  assert(reaches('primary',0,.395,.027)&&reaches('primary',0,.481,.036));
  assert(reaches('oil',0,.395,.023)&&reaches('oil',-.057,.294,.034));
  for(const [id,side] of [['left',-1],['right',1]]){
    assert(reaches(id,0,.481,.028));
    assert(reaches(id,side*.205,.711,.042)&&reaches(id,side*.288,.636,.042));
    assert.deepEqual(xBounds(points(id+'-cams')).map(v=>Math.round(v*100)),[-140,-93]);
    assert(points(id+'-cams').every(p=>p[1]*side>0));
  }
});
