import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {spaceModels} from '../garage/fleet-space.js';

function mesh(model) {
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null});
  model.draw(r);
  return r.faces;
}
const models=Object.fromEntries(spaceModels.map(m=>[m.id,m]));

test('all space exhibit parts have complete, finite geometry, individual explodes and display names',()=>{
  assert.equal(spaceModels.length,7);
  for(const model of spaceModels){
    const faces=mesh(model);
    const declared=model.groups.flatMap(g=>g.parts);
    assert.ok(faces.length>=200 && faces.length<11500,model.id+' face count '+faces.length);
    assert.equal(new Set(declared.map(p=>p.id)).size,declared.length);
    assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(declared.map(p=>p.id)),model.id);
    for(const p of declared)assert.ok(p.name && p.description && p.offset.length===3 && p.offset.every(Number.isFinite) && Math.hypot(...p.offset)>0);
    for(const f of faces){
      assert.match(f.color,/^#[0-9a-f]{6}$/i);
      assert.ok(f.points.length>=3 && f.points.flat().every(v=>Number.isFinite(v)&&Math.abs(v)<5.3),model.id);
    }
  }
});

test('Apollo exhibits distinguish the launch vehicle, rover-carrying lander and separately drivable vehicle',()=>{
  assert.equal(models['saturn-v'].year,1971);
  assert.equal(models['apollo-falcon'].type,'Space');
  assert.equal(models['apollo-lrv'].type,'Rovers');
  assert.equal(models['apollo-lrv'].domain,'Land');
  assert.equal(models['apollo-falcon'].groups.find(g=>g.id==='legs').parts.length,4);
  assert.equal(models['apollo-lrv'].groups.find(g=>g.id==='wheels').parts.length,4);
  assert.equal(models['apollo-lrv'].groups.find(g=>g.id==='crew').parts.filter(p=>p.name.endsWith(' seat')).length,2);
  assert.match(models['saturn-v'].detail,/folded/);
});

test('Atlas 541 and Falcon Heavy retain separate side bodies, nozzle clusters and fairing halves',()=>{
  assert.equal(models['atlas-v-541'].groups.find(g=>g.id==='boosters').parts.length,4);
  for(const id of ['atlas-v-541','falcon-9','falcon-heavy']){
    const faces=mesh(models[id]);
    for(const [tag,sign] of [['upper.left',1],['upper.right',-1]]){
      const verts=faces.filter(f=>f.part===tag).flatMap(f=>f.points);
      assert.ok(verts.length>100 && verts.every(p=>p[1]*sign>=-1e-7),id+' '+tag);
    }
  }
  const faces=mesh(models['falcon-heavy']);
  for(const tag of ['core','port','starboard']){
    const fins=faces.filter(f=>f.part===tag+'.fins');
    const n=faces.filter(f=>f.part===tag+'.bells');
    assert.ok(fins.length && n.length);
    const centers=n.filter(f=>f.points.every(p=>Math.abs(p[2]-.011)<1e-7)).length;
    assert.equal(centers,8*14);
  }
});

test('space stack aspect ratios read differently from the capsule and lunar vehicles',()=>{
  for(const [id,minRatio,maxRatio] of [['saturn-v',7,12],['atlas-v-541',8,14],['falcon-9',12,15],['falcon-heavy',5,7],['crew-dragon',1.45,2.30],['apollo-falcon',.65,1],['apollo-lrv',.52,.85]]){
    const pts=mesh(models[id]).flatMap(f=>f.points);
    const span=i=>Math.max(...pts.map(p=>p[i]))-Math.min(...pts.map(p=>p[i]));
    const ratio=span(2)/Math.max(span(0),span(1));
    assert.ok(ratio>=minRatio&&ratio<=maxRatio,id+' '+ratio);
  }
});
