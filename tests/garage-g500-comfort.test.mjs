import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getAssembly} from '../garage/assemblies.js';
import {getG500ComfortAssemblies,g500HeaterPorts} from '../garage/g500-comfort.js';

function scene(inspection={},isolate=false){
 const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver'},inspection,isolate,schematic:true,lights:true,progress:0,partPositions:new Map()});
 r.buildMesh();return r;
}
const all=scene().meshCache.faces;
const pts=(fs,id)=>fs.filter(f=>f.part===id).flatMap(f=>f.points);
const range=(ps,axis)=>{const v=ps.map(p=>p[axis]);return [Math.min(...v),Math.max(...v)];};
test('each climate, heated-seat and steering adjustment part is present in the assembled G500 and in its isolated assembly',()=>{
 const groups=getG500ComfortAssemblies('g500');
 assert.deepEqual(groups.map(g=>g.id),['hvac','seat-heating','column-adjustment']);
 for(const g of groups){
  assert.equal(getAssembly('g500',g.id),g);const iso=scene({assembly:g.id},true).faces;
  assert.deepEqual(new Set(iso.map(f=>f.part)),new Set(g.parts.map(p=>p.id)));
  for(const p of g.parts){for(const target of p.connectsTo||[])assert(g.parts.some(row=>row.id===target),target);assert(pts(all,p.id).length,p.id);assert.deepEqual(pts(iso,p.id),pts(all,p.id));assert.match(p.source.url,/^https:/);}
 }
 for(const id of ['electrical.main-feed','electrical.comfort-harness'])assert(pts(all,id).length&&getDetail('g500',id));
 assert.equal(getG500ComfortAssemblies('bmw325ci').length,0);
});
test('condenser and twin fans precede the radiator; coolant and refrigerant heat exchangers use distinct installations and share only physical aliases',()=>{
 const cx=id=>{const a=range(pts(all,id),0);return (a[0]+a[1])/2;};
 for(const [tag,side] of [['hvac.fan-left',-1],['hvac.fan-right',1]]){
  assert(cx(tag)<cx('hvac.condenser'));assert(range(pts(all,tag),1).every(y=>side*y>0));
 }
 assert(cx('hvac.condenser')<cx('cooling.radiator'));assert(cx('hvac.evaporator')<cx('hvac.heater-core'));
 const core=pts(all,'hvac.heater-core');
 for(const port of g500HeaterPorts){assert(core.some(v=>Math.abs(v[0]-port[0])<.012&&Math.abs(v[1]-port[1])<.015&&Math.abs(v[2]-port[2])<.015));}
 const cooling=scene({assembly:'cooling'},true),engine=scene({assembly:'powertrain'},true);
 assert.deepEqual(pts(cooling.faces,'cooling.heater-core'),core);assert.equal(pts(cooling.meshCache.faces,'hvac.heater-core').length,0);
 assert.deepEqual(pts(engine.faces,'powertrain.ac-compressor'),pts(all,'hvac.compressor'));assert(pts(all,'hvac.compressor').length<900);
 assert.equal(pts(engine.meshCache.faces,'hvac.compressor').length,0);assert.equal(pts(all,'powertrain.ac-compressor').length,0);
});
test('electrical seat heaters follow the two front seats and outboard rear seats; the single adjustment switch is on the driver door',()=>{
 for(const row of ['front','rear'])for(const side of ['left','right']){
  const get=k=>pts(all,'seat-heating.'+[row,side,k].join('-'));
  assert(range(get('back'),2)[1]>range(get('cushion'),2)[1]+.4);
  assert(get('back').every(p=>row==='front'?p[0]<.28:p[0]>.79));
  assert(get('cushion').every(p=>side==='right'?p[1]>.25:p[1]<-.25));
  assert(getDetail('g500','seat-heating.'+[row,side,'back'].join('-')));
 }
 const sw=all.filter(f=>f.part==='column-adjustment.door-switch');assert(sw.length>0);
 assert(sw.every(f=>f.rigid?.name==='left-front'&&f.points.every(p=>p[1]<-.78)));
 for(const id of ['column-adjustment.reach-motor','column-adjustment.height-motor'])assert(pts(all,id).every(p=>p[0]<-.4&&p[0]>-.7&&p[1]<-.30));
});
test('the public nested routes render their individually selectable children, including rotating fans and pivoting flaps',()=>{
 const ids=['hvac.blower','hvac.evaporator','hvac.heater-core','hvac.compressor','hvac.condenser','hvac.fan-left','hvac.drier','hvac.flaps','seat-heating.front-left-cushion','column-adjustment.reach-motor','column-adjustment.height-motor','electrical.main-feed'];
 for(const id of ids){
  const d=getDetail('g500',id);assert(d?.componentIndex.size>=(id==='hvac.fan-left'?3:4),id);
  const s=scene({detailView:d,expanded:true,separation:100},true);
  assert.deepEqual(new Set(s.faces.map(f=>f.part)),new Set(d.componentIndex.keys()),id);assert(s.activeLayout.canExpand,id);
  if(d.animated){
   const first=s.meshCache.faces.map(f=>f.points);s.mechanismPhase=.25;s.buildMesh();assert.notDeepEqual(first,s.meshCache.faces.map(f=>f.points));
  }
 }
 assert.equal(getDetail('g500','hvac.heater-core').id,getDetail('g500','cooling.heater-core').id);
});

// Compare the front/back stack only where the faces share a footprint. The outer
// grille surround and radiator necks turn back beyond the planes of their cores.
function orderedAcrossOpening(front,back){
 const bounds=f=>Array.from({length:3},(_,i)=>[Math.min(...f.points.map(p=>p[i])),Math.max(...f.points.map(p=>p[i]))]);
 const aa=all.filter(f=>f.part===front).map(bounds),bb=all.filter(f=>f.part===back).map(bounds);
 assert(aa.length&&bb.length);let gap=Infinity;
 for(const a of aa)for(const b of bb){
  if(a[1][0]>b[1][1]||b[1][0]>a[1][1]||a[2][0]>b[2][1]||b[2][0]>a[2][1])continue;
  gap=Math.min(gap,b[0][0]-a[0][1]);
 }
 assert(Number.isFinite(gap)&&gap>.001,front+' → '+back+' clearance '+gap);
 return gap;
}
test('nothing in the cooling stack projects through the seven grille blades or an adjacent heat exchanger',()=>{
 for(const fan of ['hvac.fan-left','hvac.fan-right']){
  orderedAcrossOpening('body.grille',fan);orderedAcrossOpening(fan,'hvac.condenser');
 }
 orderedAcrossOpening('hvac.condenser','cooling.radiator');orderedAcrossOpening('cooling.radiator','cooling.fan');
});
