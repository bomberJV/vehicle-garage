import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {measureStockMesh} from '../garage/factory-dimensions.js';
import {exteriorProfiles,registeredProfilePoint,upperOutlineGap} from '../garage/exterior-profiles.js';

test('side references align both axles and keep the skyline above them in either facing direction',()=>{
  for(const [model,profile] of Object.entries(exteriorProfiles)){
    const faces=GarageRenderer.assembledFaces({vehicle:model,parts:[],roofPosition:'up',paint:'silver'});
    const {wheels}=measureStockMesh(model,faces);
    for(const axle of ['front','rear']){
      const expected=wheels[axle]||wheels[axle+'-left'];
      const located=registeredProfilePoint(profile[axle],profile,wheels);
      for(const dim of [0,2])assert(Math.abs(located[dim]-expected[dim])<1e-10,model+' '+axle);
    }
    const [x,y]=profile.front;
    const top=registeredProfilePoint([x,y-100],profile,wheels);
    assert(top[2]>(wheels.front||wheels['front-left'])[2],model);
  }
});

test('raised-roof side profiles keep the measured fit to their registered factory drawings',()=>{
  for(const [id,limit,maximum] of [['sl550',10,40],['porsche993cab',12,30],['porsche992scab',20,38],['porsche996cab',10,30]]){
    const f=GarageRenderer.assembledFaces({vehicle:id,parts:[],roofPosition:'up',paint:'silver'});
    const {wheels}=measureStockMesh(id,f),profile=exteriorProfiles[id];
    const gap=upperOutlineGap(profile,wheels,f);
    assert.equal(gap.count,profile.curves[0].length);
    assert(gap.maximum<=maximum,id+' maximum upper-profile gap '+gap.maximum+' mm');
    assert(gap.median<=limit,id+' median upper-profile gap '+gap.median+' mm');
  }
});

test('an indexed draw batch cannot bridge an empty stretch of the measured profile',()=>{
  const profile={front:[0,0],rear:[4,0],curves:[[[.5,-1],[2,-1],[3.5,-1]]]};
  const wheels={front:[0,0,0],rear:[4,0,0]};
  const cap={points:[[0,0,1],[1,0,1],[.5,1,1],[3,0,1],[4,0,1],[3.5,1,1]],triangles:[0,1,2,3,4,5]};
  assert.deepEqual(upperOutlineGap(profile,wheels,[cap]),{count:2,median:0,maximum:0});
});
