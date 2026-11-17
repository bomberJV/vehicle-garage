import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {measureStockMesh,dimensionStudies} from '../garage/factory-dimensions.js';
import {VEHICLES} from '../garage/catalog.js';
import {getRoadDrivetrain,getRoadDetail} from '../garage/road-mechanisms.js';
import {getEngineDefinition} from '../garage/engine-data.js';
import {buildE90Exterior} from '../garage/exterior-e90.js';
const id='bmw328xi';

test('2008 328xi sedan matches its published spans',()=>{
  const faces=GarageRenderer.assembledFaces(sanitizeBuild({vehicle:id})),study=measureStockMesh(id,faces);
  assert.deepEqual(study.mm,{length:4526,width:2013,height:1421,wheelbase:2760,frontTrack:1501,rearTrack:1514,bodyWidth:1817});
  for(const [key,,value] of dimensionStudies[id].rows)assert.equal((study.meters[key]/.0254).toFixed(1),value.toFixed(1),key);
  assert.equal(VEHICLES[id].body,'sedan');assert.match(VEHICLES[id].detail,/N52B30/);assert.match(VEHICLES[id].detail,/xDrive/);
});

test('the E90 sedan has four doors, each with its glass and inner card on one rigid mount',()=>{
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],lights:true});buildE90Exterior(r,'#58634d');
  const doors=new Map();
  for(const f of r.faces)if(f.rigid?.name?.includes('door-')){if(!doors.has(f.rigid.name))doors.set(f.rigid.name,[]);doors.get(f.rigid.name).push(f);}
  assert.deepEqual([...doors.keys()].sort(),['front-door-left','front-door-right','rear-door-left','rear-door-right']);
  const skins={'front-door-left':'body.door','front-door-right':'body.front-right','rear-door-left':'body.rear-door','rear-door-right':'body.rear-right'};
  for(const [name,group] of doors){
    assert(group.some(f=>f.part==='body.glass'&&f.opacity<1),name+' glass');
    assert(group.some(f=>f.part===skins[name]),name+' skin');
    assert(group.some(f=>f.color==='#494d49'),name+' card');
  }
  // Headlamps sit on the nose, the lid lenses carry the reverse lamps and the
  // outer tail lamps stay on the quarters.
  const part=p=>r.faces.filter(f=>f.part===p);
  assert(part('lighting.headlamp').every(f=>f.points.every(q=>q[0]<-1.75&&q[2]<.86)));
  assert(part('lighting.reverse').length>40&&part('lighting.reverse').every(f=>f.rigid?.name==='trunk-lid'));
  assert(part('lighting.tail').length>40&&part('lighting.tail').every(f=>f.rigid?.name!=='trunk-lid'));
});

test('xDrive drives the front axle through the transfer case and the N52 has Valvetronic',()=>{
  const drive=getRoadDrivetrain(id),ids=drive.parts.map(p=>p.id);
  for(const p of ['gearbox','transfer','front-shaft','front-differential','front-halfshafts','propshaft','rear-differential','halfshafts'])assert(ids.includes('drivetrain.'+p),p);
  assert.match(drive.description,/rear axle is always driven/);
  assert.equal(getRoadDetail(id,'drivetrain.transfer').id,'e90-transfer-clutch');
  const engine=getEngineDefinition(id);
  assert.equal(engine.id,'n52b30');
  for(const p of ['valvetronic','vanos'])assert(engine.components.some(c=>c.id.endsWith('.'+p)),p);
  assert.equal(engine.components.find(c=>c.id.endsWith('.water-pump')).name,'Electric coolant pump');
});
