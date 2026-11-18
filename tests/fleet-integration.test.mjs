import assert from 'node:assert/strict';
import test from 'node:test';
import {FLEET,vehicleDomain,vehicleType,hasBuildPlan} from '../garage/fleet.js';
import {VEHICLES} from '../garage/catalog.js';
import {DEFAULT_BUILD,sanitizeBuild,availableParts,accounting,importBuild,togglePart} from '../garage/model.js';
import {getCabinFloor} from '../garage/floor-trim.js';
import {getRoadDrivetrain} from '../garage/road-mechanisms.js';
import {installedPartId} from '../garage/installed-part.js';
import {vehicleServiceAssemblies} from '../garage/vehicle-service.js';
import {GarageRenderer} from '../garage/render.js';

test('named vehicles keep their identity in the collection and saved state',()=>{
  const counts={};
  for(const id of Object.keys(VEHICLES)){
    const domain=vehicleDomain(id);
    counts[domain]=(counts[domain]||0)+1;
    assert.ok(vehicleType(id));
    const clean=sanitizeBuild({...DEFAULT_BUILD,vehicle:id});
    assert.equal(clean.vehicle,id);
    assert.deepEqual(importBuild(JSON.stringify(clean)),clean);
    if(!hasBuildPlan(id))assert.deepEqual(availableParts(id),[]);
  }
  assert.deepEqual(counts,{Land:15,Air:17,Sea:8});
  for(const id of ['porsche993cab','porsche992scab','bmws1000rr']){
    const item=availableParts(id).find(p=>!p.mockup&&p.price===null);assert.ok(item);assert.equal(item.price,null);
    const b=togglePart({...DEFAULT_BUILD,vehicle:id},item.id);
    assert.deepEqual(accounting(b).unknown,[item.id]);assert.deepEqual(importBuild(JSON.stringify(b)),b);
  }
});

test('every exhibit can expand, isolate and reassemble without changing the source mesh',()=>{
  for(const v of Object.values(FLEET)){
    const renderer=Object.assign(Object.create(GarageRenderer.prototype),{
      build:{...DEFAULT_BUILD,vehicle:v.id},faces:[],lights:true,inspection:{},schematic:true,
    });
    renderer.buildMesh();
    const source=renderer.meshCache.faces;
    const inputTags=new Set(source.map(f=>f.part));
    const porsche=v.id.startsWith('porsche'),bike=v.id==='bmws1000rr';
    const integrated=vehicleServiceAssemblies(v.id).flatMap(group=>{
      if(bike&&group.id==='brakes')return group.parts.filter(part=>['brakes.master','brakes.abs','brakes.lines'].includes(part.id));
      return group.parts;
    });
    if(porsche)integrated.push(...getCabinFloor(v.id).parts,...getRoadDrivetrain(v.id).parts);
    const expected=[...[...v.componentIndex.keys()].map(id=>installedPartId(v.id,id)),...integrated.map(p=>p.id)];
    assert.deepEqual(inputTags,new Set(expected),v.id);
    for(const group of v.groups){
      renderer.inspection={assembly:group.id,expanded:true,separation:100};renderer.isolate=true;renderer.buildMesh();
      const first=renderer.faces[0];assert.ok(first,v.id+'.'+group.id);
      assert.deepEqual(new Set(renderer.faces.map(f=>f.part)),new Set(group.parts.map(p=>p.id)));
      const entry=renderer.activeLayout.entries[0];
      const input=entry.face;
      const offset=entry.group.offset;
      if(installedPartId(v.id,first.part)===first.part)assert(source.some(f=>f.part===first.part && f.instance===first.instance));
      assert.deepEqual(first.points,input.points.map(p=>p.map((x,i)=>x+offset[i])),first.part);
      renderer.inspection.part=first.part;renderer.inspection.onlyPart=true;renderer.buildMesh();
      assert.ok(renderer.faces.every(f=>f.part===first.part));
    }
    renderer.isolate=false;renderer.inspection={};renderer.buildMesh();
    assert.equal(renderer.faces,source);
  }
});
