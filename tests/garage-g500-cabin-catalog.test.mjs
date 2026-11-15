import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {drawCore,climateTargets} from '../garage/g500-comfort-parts.js';

const build={vehicle:'g500',parts:[],paint:'olive',finish:'silver'};
function scene(inspection={}){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build,inspection,schematic:true,lights:true,progress:0,partPositions:new Map()});
 r.buildMesh();return r;
}
function points(faces,id){return faces.filter(f=>!id||f.part===id).flatMap(f=>f.points);}
function extents(ps){return [0,1,2].map(i=>Math.max(...ps.map(p=>p[i]))-Math.min(...ps.map(p=>p[i])));}
function close(actual,expected){actual.forEach((value,i)=>assert(Math.abs(value-expected[i])<1e-9,actual+' vs '+expected));}
function vertices(ps){return new Set(ps.map(p=>p.map(v=>Math.round(v*1e8)).join(',')));}
function piece(id,options={}){return scene({detailView:getDetail('g500',id),...options}).meshCache.faces;}
const installed=scene().meshCache.faces;

test('the cabin filter fits the MANN envelope in both views and stands on edge in the cowl',()=>{
 const world=points(installed,'hvac.filter'),local=points(piece('hvac.filter'));
 close(extents(world),[.032,.246,.216]);close(extents(local),[.216,.246,.032]);
 const c=climateTargets.filter;
 assert.deepEqual(vertices(world),vertices(local.map(([a,b,d])=>[d+c[0],b+c[1],-a+c[2]])));
});
test('supplier fin-core dimensions transfer to both the engine-bay units and their enlarged sections',()=>{
 for(const [type,size] of [['evaporator',[.065,.308,.200]],['heater',[.032,.234,.175]]]){
  const id='hvac.'+(type==='heater'?'heater-core':type),r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  drawCore(r,type,'tubes');close(extents(points(r.faces)),size);
  const world=new Set(points(installed,id).map(p=>JSON.stringify(p)));
  assert(points(r.faces).every(p=>world.has(JSON.stringify(p))),id);
  const view=getDetail('g500',id);close(extents(points(piece(id),view.id+'.tubes')),size.map(n=>4.8*n));
 }
});
test('seat internals share the installed mesh, preserve the selected side and keep the two heater poses',()=>{
 const id='body.front-seats',detail=getDetail('g500',id);
 for(const [instance,cy,hand] of [['front-left',-.418,'driver'],['front-right',.418,'passenger']]){
  const full=installed.filter(f=>f.part===id&&f.instance===instance);
  const isolated=piece(id,{studySeat:hand});
  const names=new Set(isolated.map(f=>f.part));assert.deepEqual(names,new Set(detail.componentIndex.keys()));
  const hardware=isolated.filter(f=>!f.part.includes('.heat-'));
  assert.deepEqual(vertices(points(full)),vertices(points(hardware).map(([x,y,z])=>[x,y+cy,z])));
  for(const [key,tag] of [['heat-cushion','cushion'],['heat-back','back']]){
   const local=points(isolated,'g500-front-seat.'+key);
   const inCar=points(installed,'seat-heating.'+instance+'-'+tag);
   assert.equal(local.length,inCar.length);inCar.forEach((p,i)=>close(p,[local[i][0],local[i][1]+cy,local[i][2]]));
   const layers=piece('g500-front-seat.'+key),carrier=extents(points(layers,layers.find(f=>f.part.endsWith('.carrier')).part));
   assert.equal(carrier[2]>.5,tag==='back');
  }
 }
});
test('all four window lifts keep a fixed bent guide as the glass and carriage travel together',()=>{
 for(const location of ['front-left','front-right','rear-left','rear-right']){
  const id='door-g500-'+location+'.regulator',detail=getDetail('g500',id);
  const get=t=>{const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});detail.draw(r,t);return r.faces;};
  const low=get(0),high=get(.5),part=name=>detail.id+'.'+name;
  for(const name of ['track','sheath','motor'])assert.deepEqual(points(low,part(name)),points(high,part(name)));
  for(const name of ['carriage','glass']){
   const a=points(low,part(name)),b=points(high,part(name));assert(a.length);
   assert(Math.abs(b[0][2]-a[0][2]-.45)<1e-9);
  }
 }
});
