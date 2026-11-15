import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {buildG500Exterior} from '../garage/exterior-g500.js';
import {intersects} from '../garage/exploded-layout.js';
function renderer(){
  return Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',paint:'silver',finish:'silver',parts:[]},faces:[],schematic:true,lights:true,canvas:{getBoundingClientRect:()=>({left:0,top:0})}});
}
test('the U.S. G500 exterior exposes each side marker, repeater and bumper lamp from its actual viewing direction',()=>{
  const r=renderer();buildG500Exterior(r,'#728080');
  for(const side of [-1,1]){
    const hand=side<0?'left':'right';r.project=([x,y,z])=>({x,y:z,depth:y*side});
    for(const [type,x,z] of [['front-marker',-1.959,.925],['rear-marker',1.972,.757],['repeater',-.846,1.075]]){
      assert.equal(r.hitTest(x,z)?.part,'lighting.'+type+'-'+hand);
    }
    r.project=([x,y,z])=>({x:y,y:z,depth:-x});assert.equal(r.hitTest(.598*side,.553)?.part,'lighting.fog-'+hand);
    r.project=([x,y,z])=>({x:y,y:z,depth:x});assert.equal(r.hitTest(.641*side,.552)?.part,side<0?'lighting.rear-fog':'lighting.reverse');
  }
  // Removing a front fog module exposes an actual opening through the bumper skin.
  r.faces=r.faces.filter(f=>f.part==='body.structure'&&f.points.every(p=>p[0]<-2.119+.078&&p[2]<.69));
  r.project=([x,y,z])=>({x:y,y:z,depth:-x});
  assert.equal(r.hitTest(.598,.553),null);assert.ok(r.hitTest(.598,.65));
});
test('every G500 marker and fog lamp opens a sourced component exhibit and a second-level bulb section',()=>{
  const lamps=getAssemblies('g500').find(a=>a.id==='lighting').parts.filter(p=>/fog|repeater|marker|reverse|indicator/.test(p.id));
  assert.equal(lamps.length,11);
  for(const p of lamps){
    const d=getDetail('g500',p.id);assert.ok(d?.source?.url&&p.source?.url,p.id);
    const r=renderer(); d.draw(r);
    for(const id of d.componentIndex.keys())assert.ok(r.faces.some(f=>f.part===id),id);
    assert.ok(r.faces.every(f=>f.points.every(p=>p.every(Number.isFinite))));
    const bulb=d.groups[0].parts.find(k=>k.id.endsWith('.bulb')),section=getDetail('g500',bulb.id);
    assert.equal(section.groups[0].parts.length,3);
    assert.ok(section.groups[0].parts.some(p=>p.id.endsWith('.filament')));
    assert.equal(getDetail('hrv',p.id)?.id===d.id,false);
  }
  assert.equal(getDetail('g500','body.fog-lamps').id,getDetail('g500','lighting.fog-left').id);
});
test('G500 fog components clear one another at the end of their animated separation',()=>{
  const d=getDetail('g500','lighting.fog-left'),r=renderer();
  r.inspection={assembly:'lighting',detailView:d,expanded:true};r.buildMesh();
  const groups=[...r.activeLayout.groups.values()];assert.equal(groups.length,8);
  for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){
    assert.equal(intersects(groups[i].parked,groups[j].parked),false,groups[i].key+' / '+groups[j].key);
  }
});
test('round headlamp and both upper rear clusters resolve to independent optical sections',()=>{
  for(const id of ['lighting.headlamp','lighting.housing','lighting.reflector','lighting.tail-left','lighting.tail-right','body.rear-lights']){
    const d=getDetail('g500',id),r=renderer();assert.ok(d?.source.url);d.draw(r);
    assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(d.componentIndex.keys()));
    for(const f of r.faces)assert.ok(f.points.every(p=>p.every(Number.isFinite)));
    if(id.includes('tail')||id.includes('rear-lights')){
      for(const suffix of ['turn','stop','tail'])assert.ok(getDetail('g500',d.id+'.'+suffix).groups[0].parts.length===3);
    }
  }
});

test('2002 front wing signals transmit light from amber sources and rear clear chambers face outboard',()=>{
  const r=renderer();buildG500Exterior(r,'#728080');
  const wing=r.faces.filter(f=>f.part==='lighting.indicator');
  assert(wing.filter(f=>f.opacity>0&&f.opacity<1).length>=80);
  assert(wing.some(f=>f.color==='#cc964d'&&!f.opacity),'amber source visible through clear cover');
  for(const side of [-1,1]){
    const name=side<0?'left':'right';
    const tail=r.faces.filter(f=>f.part==='lighting.tail-'+name);
    const clear=tail.filter(f=>f.opacity>0&&f.opacity<1);
    assert(clear.length>0);
    assert(clear.every(f=>f.points.every(([,y])=>y*side>.805)),'outside clear chamber');
    assert(tail.some(f=>f.color==='#b73535'&&f.points.every(([,y])=>y*side<.85)),'inboard red chamber');
    const pilot=r.faces.filter(f=>f.part==='lighting.parking-'+name);
    assert(pilot.length&&pilot.every(f=>f.points.every(([x,y,z])=>x>-2.179&&x< -2.15&&side*y<.674&&z<1)));
    assert.equal(getDetail('g500','lighting.parking-'+name).id,'g500-bulb-t4w');
  }
  const washer=r.faces.filter(f=>f.part==='lighting.washer');
  assert.equal(new Set(washer.map(f=>f.instance)).size,2);
  assert(getDetail('g500','lighting.washer').componentIndex.size>=4);
  const head=getDetail('g500','lighting.headlamp'),bulb=getDetail('g500',head.id+'.h4');
  assert.deepEqual([...bulb.componentIndex.keys()].map(id=>id.split('.').at(-1)).sort(),['contacts','envelope','flange','high','low','shield']);
  const lamp=renderer();bulb.draw(lamp);
  assert.deepEqual(new Set(lamp.faces.map(f=>f.part)),new Set(bulb.componentIndex.keys()));
});

test('both fitted H4 bulbs preserve the supplier length, envelope radius and three blades in the inspection model',()=>{
  const r=renderer();buildG500Exterior(r,'#728080');
  for(const hand of ['left','right']){
    const id='lighting.h4-'+hand;
    assert(getAssemblies('g500').find(g=>g.id==='lighting').parts.some(p=>p.id===id));
    const mount=r.faces.filter(f=>f.part===id),vertices=mount.flatMap(f=>f.points);
    const xs=vertices.map(p=>p[0]);assert(Math.abs(Math.max(...xs)-Math.min(...xs)-.082)<1e-8);
    const y=(hand==='left'?-1:1)*.674;
    const radius=Math.max(...mount.filter(f=>f.opacity>0).flatMap(f=>f.points).map(p=>Math.hypot(p[1]-y,p[2]-1.001)));
    assert(Math.abs(radius-.0085)<1e-8);
    const view=getDetail('g500',id),detail=renderer();view.draw(detail);
    const axial=detail.faces.flatMap(f=>f.points).map(p=>p[1]/.013);
    assert(Math.abs(Math.max(...axial)-Math.min(...axial)-82)<1e-8);
    assert.match(view.source.url,/ZMP_61180/);
  }
  const fog=getDetail('g500','g500-optic-fog.bulb');assert.match(fog.source.url,/ZMP_61217/);
  const scene=renderer();fog.draw(scene);
  const bulb=scene.faces.filter(f=>f.part.endsWith('.glass')).flatMap(f=>f.points);
  assert(Math.abs(Math.max(...bulb.map(([u,,z])=>Math.hypot(u,z-.40)/.012))-5.75)<1e-8);
});
