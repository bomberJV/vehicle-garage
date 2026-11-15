import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {drawSLRoof,slDeckPoint,slRoofGroup,slRoofStudies} from '../garage/sl550-roof.js';

function render(draw,build={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build});
  draw(r);
  return r.faces;
}
const roof=(t,build)=>render(r=>drawSLRoof(r,'#9da2a6',t),build);
const points=(mesh,part)=>mesh.filter(f=>f.part===part).flatMap(f=>f.points);
const top=(mesh,part)=>Math.max(...points(mesh,part).map(p=>p[2]));

test('the raised SL follows its specified roof height and each roof item has selectable geometry',()=>{
  const closed=roof(0);
  assert.deepEqual(new Set(closed.map(f=>f.part)),new Set(slRoofGroup.parts.map(p=>p.id)));
  assert(Math.abs(top(closed,'roof.sky-glass')-51.8*.0254)<.002);
  for(const part of slRoofGroup.parts)assert.match(part.source.url,/^https:\/\//);
});

test('the US windows lower, the deck opens first and the two rigid panels stack beneath it',()=>{
  const closed=roof(0),clear=roof(.25),fold=roof(.52),stowed=roof(1);
  const nose=[1.082,0,.983];
  assert(top(clear,'roof.door-glass')<top(closed,'roof.door-glass')-.40);
  assert(top(clear,'roof.quarter-glass')<top(closed,'roof.quarter-glass')-.40);
  assert(slDeckPoint(nose,.25)[2]>nose[2]+.6);
  assert.deepEqual(points(closed,'roof.panel'),points(clear,'roof.panel'));
  assert(top(fold,'roof.sky-glass')>top(closed,'roof.sky-glass')+.19);
  assert(top(stowed,'roof.panel')<.84);
  assert(top(stowed,'roof.rear-glass')<.71);
  assert(top(stowed,'roof.pillars')<.83);
  assert.deepEqual(slDeckPoint(nose,0),slDeckPoint(nose,1));
  for(const mesh of [closed,clear,fold,stowed]){
    assert.deepEqual(points(mesh,'roof.windshield'),points(closed,'roof.windshield'));
    for(const pane of ['roof.panel','roof.sky-glass','roof.rear-glass','roof.pillars']){
      const a=points(closed,pane),b=points(mesh,pane);
      for(let i=1;i<a.length;i++){
        const d=(v,w)=>Math.hypot(...v.map((n,j)=>n-w[j]));
        assert(Math.abs(d(a[0],a[i])-d(b[0],b[i]))<1e-9);
      }
    }
  }
});

test('MAGIC SKY CONTROL and the powered screen respect their separate operating states',()=>{
  const dark=roof(0,{slGlass:'dark',slWindstop:true}),clear=roof(0,{slGlass:'clear'});
  for(const mesh of [dark,clear])assert(mesh.filter(f=>f.part==='roof.sky-glass').every(f=>typeof f.opacity==='number'));
  assert(dark.find(f=>f.part==='roof.sky-glass').opacity>clear.find(f=>f.part==='roof.sky-glass').opacity);
  assert.deepEqual(points(dark,'roof.sky-glass'),points(clear,'roof.sky-glass'));
  const height=t=>top(roof(t,{slWindstop:true}),'roof.windblocker');
  assert.equal(height(0),height(.94));
  assert(height(1)>height(0)+.28);
  assert.equal(top(roof(1,{slWindstop:false}),'roof.windblocker'),height(0));
});

test('four roof studies let each moving component complete a full animated return',()=>{
  for(const [tag,detail] of Object.entries(slRoofStudies)){
    assert(slRoofGroup.parts.some(p=>p.id===tag));
    const renderAt=t=>render(r=>detail.draw(r,t));
    const atStart=renderAt(0),atMiddle=renderAt(.5),atEnd=renderAt(1);
    assert.deepEqual(atStart,atEnd);
    assert.notDeepEqual(atStart,atMiddle);
    assert.deepEqual(new Set(atMiddle.map(f=>f.part)),new Set(detail.groups.flatMap(g=>g.parts.map(p=>p.id))));
    assert(atMiddle.every(f=>f.points.every(p=>p.every(Number.isFinite))));
  }
});

test('the panoramic insert is inset between painted roof rails and the A-frame retains its underside when open',()=>{
  const closed=roof(0),open=roof(1);
  const rail=closed.filter(f=>f.part==='roof.panel'&&f.color==='#9da2a6'&&f.points.every(p=>p[0]>.24&&p[0]<.68));
  for(const side of [-1,1])assert(rail.some(f=>f.points.every(p=>p[1]*side>.45)));
  const header=open.filter(f=>f.part==='roof.windshield'&&f.color==='#373538');
  assert(header.length>=3);
  assert(header.every(f=>f.points.every(p=>p[2]>1.15)));
  const trim=closed.filter(f=>f.part==='roof.covering-flaps'&&f.color==='#66594c');
  assert(trim.length>10);
  const darkShelf=open.filter(f=>f.part==='roof.covering-flaps'&&f.color==='#66594c');
  assert.deepEqual(trim.map(f=>f.points),darkShelf.map(f=>f.points));
  const travel=roof(.97,{slWindstop:true});
  assert(top(travel,'roof.windblocker')>top(closed,'roof.windblocker')+.06);
  assert(top(travel,'roof.windblocker')<top(roof(1,{slWindstop:true}),'roof.windblocker')-.06);
});

test('each side window remains a rigid pane as it rolls outward into its pocket',()=>{
  for(const part of ['roof.door-glass','roof.quarter-glass']){
    const pane=(mesh,side)=>mesh.find(f=>f.part===part&&f.instance===side&&f.opacity<1).points;
    for(const side of ['left','right']){
      const a=pane(roof(0),side),b=pane(roof(1),side);
      for(let i=0;i<a.length;i++)for(let j=0;j<i;j++){
        const separation=(v,w)=>Math.hypot(...v.map((n,k)=>n-w[k]));
        assert(Math.abs(separation(a[i],a[j])-separation(b[i],b[j]))<1e-8);
      }
      assert(Math.min(...b.map(p=>Math.abs(p[1])))>.695);
    }
  }
});
