import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {VEHICLES} from '../garage/catalog.js';
import {wheelDesign} from '../garage/wheel-designs.js';

function renderer(wheelDesign='stock',inspection={}){
  return Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'bmw325ci',parts:[],paint:'silver',finish:'silver',wheelDesign},
    faces:[],lights:false,inspection,schematic:true,isolate:Boolean(inspection.onlyPart)
  });
}
function near(actual,expected,label){
  assert(Math.abs(actual-expected)<1e-7,label+': measured '+actual+', expected '+expected);
}
function spans(points,i){const vals=points.map(p=>p[i]);return [Math.min(...vals),Math.max(...vals)];}
function hasRing(points,[x,y,z],rad){
  return points.some(p=>Math.abs(p[1]-y)<1e-7&&Math.abs(Math.hypot(p[0]-x,p[2]-z)-rad)<1e-7);
}
test('325Ci code 0334 wheels match axle track, bolt circle, stock rim seats and optional staggered fitment',()=>{
  assert.equal(VEHICLES.bmw325ci.trackFront,57.5*.0254);
  assert.equal(VEHICLES.bmw325ci.trackRear,1.483);
  assert.match(wheelDesign('bmw325ci','invalid').partNumber,/36 11 1 094 505/);
  assert.match(wheelDesign('bmw325ci','invalid').buy.url,/36111094505/);
  for(const id of ['stock','style68']){
    const r=renderer(id);r.buildMesh();
    for(const [end,front] of [['front',true],['rear',false]])for(const [hand,sign] of [['left',-1],['right',1]]){
      const corner=end+'-'+hand,stock=id==='stock';
      const x=front?-1.3625:1.3625,z=.35595;
      const bore=stock?.2032:.2159;
      const width=stock?.205:front?.225:.245,aspect=stock?.55:front?.45:.40;
      const beadWidth=stock?.1778:front?.1905:.2159,et=stock?.047:front?.041:.050;
      const pad=sign*((front?1.4605:1.483)/2+.047),y=pad-sign*et;
      const cornerPart=id=>r.faces.filter(f=>f.instance===corner&&f.part===id);
      const rubber=cornerPart('wheels.tire').flatMap(f=>f.points),alloy=cornerPart('wheels.rim').flatMap(f=>f.points);
      for(const [axis,center,span] of [[0,x,2*(bore+aspect*width)],[1,y,width],[2,z,2*(bore+aspect*width)]]){
        const [lo,hi]=spans(rubber,axis);
        near((hi+lo)/2,center,'center '+corner);near(hi-lo,span,'tire span '+corner);
      }
      near(spans(alloy,1)[1]-spans(alloy,1)[0],beadWidth+.014,'schematic flange width');
      for(const sign of [-1,1])for(const data of [rubber,alloy])
        assert(hasRing(data,[x,y+sign*beadWidth/2,z],bore),corner+' bead station');
      assert(hasRing(alloy,[x,pad,z],.078),corner+' fixed mounting pad');
      if(!stock)continue;
      const heads=cornerPart('wheels.rim').filter(f=>f.color==='#70797d');
      for(let i=0;i<5;i++){
        const a=Math.PI/2+i*2*Math.PI/5;
        assert(heads.some(f=>f.points.some(p=>Math.hypot(p[0]-(x+.06*Math.cos(a)),p[2]-(z+.06*Math.sin(a)))<1e-7)),corner+' bolt circle');
      }
      near(r.meshCache.groundZ,.04,'road surface at base of the tires');
    }
  }
});
test('isolating an individual 325Ci wheel retains its mounted face geometry',()=>{
  for(const id of ['stock','style68'])for(const corner of ['front-right','rear-left']){
    const assembled=renderer(id);assembled.buildMesh();
    const wheel=renderer(id,{assembly:'wheels',part:'wheels.rim',instance:corner,onlyPart:true});wheel.buildMesh();
    assert(wheel.faces.length>100);
    assert(wheel.faces.every(f=>f.part==='wheels.rim'&&f.instance===corner));
    assert.deepEqual(wheel.faces.map(f=>f.points),assembled.faces.filter(f=>f.part==='wheels.rim'&&f.instance===corner).map(f=>f.points));
  }
});
