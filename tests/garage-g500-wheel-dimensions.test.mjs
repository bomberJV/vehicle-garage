import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {wheelDesign} from '../garage/wheel-designs.js';
import {wheelContactPlane} from '../garage/lift-geometry.js';
import {VEHICLES} from '../garage/catalog.js';

function mount(design){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    faces:[],build:{vehicle:'g500',paint:'silver',finish:'silver',parts:[],wheelDesign:design},
    lights:false,inspection:{assembly:null},schematic:true
  });
  r.buildMesh();
  return r.faces;
}
function close(actual,expected,label){
  assert(Math.abs(actual-expected)<1e-7,label+' expected '+expected+', measured '+actual);
}
function extent(vertices,k){
  const all=vertices.map(p=>p[k]);
  return [Math.min(...all),Math.max(...all)];
}
function points(faces,corner,part){
  return faces.filter(f=>f.instance===corner&&f.part===part).flatMap(f=>f.points);
}
function inPlaneRing(vertices,x,y,z,radius){
  return vertices.some(p=>Math.abs(p[1]-y)<1e-7&&Math.abs(Math.hypot(p[0]-x,p[2]-z)-radius)<1e-7);
}

test('all four mounted G 500 tires, bead seats and hub mounting pads match the US manual and 16-inch wheel option',()=>{
  // Operator's manual pp. 359–360 (463.249); Atik is a separate ET63 option.
  for(const [design,rim,tire,offset,track] of [
    ['stock',.2286,.3876,.043,1.515],['atik',.2032,.3887,.063,1.475]
  ]){
    const faces=mount(design), floor=wheelContactPlane('g500',faces);
    for(const end of ['front','rear'])for(const hand of ['left','right']){
      const side=hand==='right'?1:-1,corner=end+'-'+hand;
      const x=end==='front'?-1.425:1.425,y=side*track/2,z=.4276;
      const rubber=points(faces,corner,'wheels.tire'),alloy=points(faces,corner,'wheels.rim');
      for(const [axis,center,span] of [[0,x,2*tire],[1,y,.265],[2,z,2*tire]]){
        const [lo,hi]=extent(rubber,axis);
        close((lo+hi)/2,center,corner+' installed center');
        close(hi-lo,span,corner+' nominal tire section');
      }
      close(z-floor,tire,corner+' nominal rolling radius over the viewer floor');
      // Both the tire bead and wheel seat have vertices on the actual 7.5J
      // planes. The flanges sit outside them, inside the rubber sidewalls.
      for(const sign of [-1,1])for(const vertices of [rubber,alloy]){
        assert(inPlaneRing(vertices,x,y+sign*.1905/2,z,rim),corner+' bead-seat radius and width');
      }
      const [minY,maxY]=extent(alloy,1);
      close(maxY-minY,.2045,corner+' outer modelled flange width');
      assert(inPlaneRing(alloy,x,y+side*offset,z,.078),corner+' mount on the unchanged axle pad');
      const tread=rubber.filter(p=>Math.abs(p[1]-y)>.1324);
      assert(tread.every(p=>Math.hypot(p[0]-x,p[2]-z)<tire-.03),corner+' real shoulder curvature');
    }
  }
});

test('the stock Ashtaroth face has five wide triangular windows within a continuous outer cast web',()=>{
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    faces:[], canvas:{getBoundingClientRect:()=>({left:0,top:0})},
    project:([x,y,z])=>({x,y:z,depth:y}),build:{vehicle:'g500'}
  });
  r.wheel(0,0,.3876,'#b8bec2');
  r.faces=r.faces.filter(f=>f.part==='wheels.rim');
  const hit=(angle,radius)=>r.hitTest(.2286*radius*Math.cos(angle),.4276+.2286*radius*Math.sin(angle));
  for(let i=0;i<5;i++){
    const window=(i+.75)*2*Math.PI/5;
    // Narrow tip at the hub, broad shoulder at the lip, cast aluminum
    // connecting the spoke tips outside the five cutouts.
    assert(!hit(window,.45));
    assert(hit(window+.32,.45));
    assert(!hit(window+.32,.75));
    assert(hit(window,.93));
  }
});

test('the G 500 stock build and dealer link point to the matching 18 x 7.5 ET43 five-spoke wheel',()=>{
  assert.equal(VEHICLES.g500.wheelbase,2.850);
  assert.equal(VEHICLES.g500.trackFront,1.515);
  assert.equal(VEHICLES.g500.trackRear,1.515);
  const stock=wheelDesign('g500','unknown-older-selection');
  assert.equal(stock.id,'stock');
  assert.match(stock.source.url,/2002_g_500.+362/);
  assert.match(stock.buy.url,/66470598/);
  assert.match(stock.fitment,/7.5J × 18 H2, ET43/);
});
