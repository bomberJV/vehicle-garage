import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {measureStockMesh,dimensionStudies} from '../garage/factory-dimensions.js';
const bmw='bmw325ci';
test('US 0334 coupe has the manual envelope and both model-specific tire-center tracks',()=>{
  const build=sanitizeBuild({vehicle:bmw});
  const faces=GarageRenderer.assembledFaces(build),study=measureStockMesh(bmw,faces);
  assert.deepEqual(study.mm,{length:4488,width:1947,height:1369,wheelbase:2725,frontTrack:1461,rearTrack:1483,bodyWidth:1757});
  for(const [id,,value] of dimensionStudies[bmw].rows)assert.equal((study.meters[id]/.0254).toFixed(1),value.toFixed(1));
  assert.equal(study.min[0],study.longitudinal.min[0],'front bumper is the nose of the complete stock model');
  assert.equal(study.max[0],study.longitudinal.max[0],'rear bumper is the tail of the complete stock model');
  const near=(a,b)=>Math.abs(a-b)<1e-6;
  for(const [part,axis,extreme] of [['body.mirror-left',1,study.min[1]],['body.mirror-right',1,study.max[1]],['body.front-bumper',0,study.longitudinal.min[0]],['body.rear-bumper',0,study.longitudinal.max[0]]]){
    assert(faces.some(f=>f.part===part&&f.points.some(p=>near(p[axis],extreme))),part);
  }
});
test('rear vent position survives BMW build round trips and stays scoped to the coupe',()=>{
  const closed=sanitizeBuild({vehicle:bmw}),open=sanitizeBuild({...closed,bmwVentPosition:'open'});
  assert.equal(closed.bmwVentPosition,'closed');assert.equal(sanitizeBuild(JSON.parse(JSON.stringify(open))).bmwVentPosition,'open');
  assert.equal(sanitizeBuild({...open,bmwVentPosition:'unknown'}).bmwVentPosition,'closed');
  assert(!Object.hasOwn(sanitizeBuild({...open,vehicle:'g500'}),'bmwVentPosition'));
});
