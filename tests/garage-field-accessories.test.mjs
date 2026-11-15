import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELD_ACCESSORIES} from '../garage/accessory-catalog.js';
import {getAssembly,getComponent} from '../garage/assemblies.js';
import {drawAccessories} from '../garage/accessory-geometry.js';
import {accounting,exportText,importBuild,sanitizeBuild,togglePart} from '../garage/model.js';
import {GarageRenderer} from '../garage/render.js';

const cabriolets=['porsche993cab','porsche992scab'];
const kinds=['guard','ladder','snorkel','aux','display'];
function fitted(vehicle,k=kinds){
  return sanitizeBuild({vehicle,parts:k.map(kind=>vehicle+'-field-'+kind)});
}
function render(build){
  return Object.assign(Object.create(GarageRenderer.prototype),{faces:[],inspection:{},schematic:false,lights:true,build});
}
function sample(vehicle,kind){
  const r=render(fitted(vehicle,[kind]));
  drawAccessories(r,r.build,'#758076');
  return r.faces;
}
test('the G500 keeps five independently selectable accessories',()=>{
    const vehicle='g500';
    const b=fitted(vehicle),rows=FIELD_ACCESSORIES.filter(row=>row.vehicles.includes(vehicle));
    assert.deepEqual(new Set(rows.map(p=>p.fieldKind)),new Set(kinds));
    assert.equal(rows.filter(row=>!row.mockup).length,4);
    for(const item of rows){
      const id='accessories.'+item.fieldKind;
      assert.equal(getComponent(vehicle,id),null);
      const part=getComponent(vehicle,id,b.parts);
      assert.equal(part.name,item.name);
      assert.match(part.source.url,/^https:/);
      assert.deepEqual(sample(vehicle,item.fieldKind).map(f=>f.part).filter((p,i,a)=>!i||p!==a[i-1]),[id]);
      const disabled=togglePart(b,item.id);
      assert.equal(getComponent(vehicle,id,disabled.parts),null);
      assert.deepEqual(importBuild(JSON.stringify(b)),b);
    }
    assert.equal(getAssembly(vehicle,'accessories'),null);
    assert.equal(getAssembly(vehicle,'accessories',b.parts).parts.length,5);
    const total=accounting(b);
    assert.equal(total.unknown.length,4);
    assert.deepEqual(total.lines.map(p=>p.id),rows.filter(p=>!p.mockup).map(p=>p.id));
    const concept=rows.find(row=>row.mockup);
    const injected=sanitizeBuild({...b,quotes:{[concept.id]:500}});
    assert.deepEqual(injected.quotes,{});
    assert(!exportText(injected).includes(concept.name));
});
test('retired Porsche field equipment and its quotes disappear from saved and imported builds',()=>{
  for(const vehicle of cabriolets){
    const compatible=vehicle==='porsche993cab'?'993-rs-lips':'992-aero-kit';
    const retired=kinds.map(kind=>vehicle+'-field-'+kind);
    const quotes=Object.fromEntries([compatible,...retired].map(id=>[id,75]));
    const legacy={version:1,vehicle,parts:[...retired,compatible],quotes,roofPosition:'up',paint:'silver',notes:'Weekend build'};
    const clean=sanitizeBuild(legacy);
    assert.deepEqual(clean.parts,[compatible]);
    assert.deepEqual(clean.quotes,{[compatible]:75});
    assert.equal(clean.notes,legacy.notes);assert.equal(clean.roofPosition,'up');
    assert.deepEqual(importBuild(JSON.stringify(legacy)),clean);
    assert.deepEqual(accounting(legacy).lines.map(p=>p.id),[compatible]);
    assert.equal(accounting(legacy).total,75);
    const r=render({...legacy,parts:retired});drawAccessories(r,r.build,'#758076');
    assert.equal(r.faces.length,0);
    for(const id of retired)assert.deepEqual(togglePart(clean,id),clean);
    assert.equal(getAssembly(vehicle,'accessories',retired),null);
  }
});
test('the 993 Cabriolet Tequipment carrier fits the raised top and has its own inspectable mesh',()=>{
  const id='993-cabrio-load-carrier',vehicle='porsche993cab',stock=sanitizeBuild({vehicle});
  const fitted=togglePart(stock,id);
  assert.equal(stock.roofPosition,'down');assert.equal(fitted.roofPosition,'up');
  assert.equal(sanitizeBuild({...fitted,roofPosition:'down'}).roofPosition,'up');
  assert.equal(togglePart(sanitizeBuild({vehicle:'porsche992scab'}),id).parts.length,0);
  const option=FIELD_ACCESSORIES.find(p=>p.id===id);
  assert.equal(option.sku,'993 801 055 01');assert.equal(option.kind,'Roof racks');
  assert.equal(getComponent(vehicle,'accessories.carrier',fitted.parts).name,option.name);
  assert.deepEqual(accounting(fitted).unknown,[id]);
  assert.deepEqual(importBuild(JSON.stringify(fitted)),fitted);
  const r=render(fitted);r.inspection={assembly:'accessories',part:'accessories.carrier',onlyPart:true};r.isolate=true;r.buildMesh();
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(['accessories.carrier']));
  const feet=r.faces.flatMap(f=>f.points).filter(point=>point[2]<1.25);
  assert.ok(feet.some(([x,y])=>x<.1&&y>.57) && feet.some(([x,y])=>x<.1&&y<-.57));
  assert.ok(feet.some(([x,y])=>x>.7&&y>.61) && feet.some(([x,y])=>x>.7&&y<-.61));
  const removed=togglePart(fitted,id);
  assert.equal(sanitizeBuild({...removed,roofPosition:'down'}).roofPosition,'down');
});
test('the US Litronic kit replaces both 993 lamps in the fenders and retains its US market part number on the supplier row',()=>{
  const id='993-litronic-us',vehicle='porsche993cab',build=togglePart({vehicle},id);
  const option=accounting(build).lines.find(p=>p.id===id);
  assert.equal(option.sku,'000 044 900 15');assert.match(exportText(build),/993LITRONIC/);
  assert.deepEqual(togglePart({vehicle:'porsche992scab'},id).parts,[]);
  const r=render(build);r.buildMesh();
  const lamps=r.faces.filter(f=>f.part==='accessories.headlamps');
  assert.ok(lamps.length>0);
  const lights=lamps.flatMap(f=>f.points);
  assert.ok(lights.some(p=>p[1]>.5)&&lights.some(p=>p[1]<-.5));
  assert.ok(lights.every(p=>p[0]<-1.5));
  const fittedFaces=r.faces.length;
  r.build=togglePart(build,id);r.buildMesh();
  assert(!r.faces.some(f=>f.part==='accessories.headlamps'));
  assert.ok(fittedFaces-r.faces.length<lamps.length/2,'stock lamp faces were replaced');
});
test('the complete model can independently highlight, isolate and separate installed accessory geometry',()=>{
    const vehicle='g500',r=render(fitted(vehicle));
    r.buildMesh();
    r.hoverHit={part:'accessories.ladder'};
    r.buildMesh();
    assert(r.faces.filter(f=>f.part==='accessories.ladder').every(f=>f.highlighted));
    r.inspection={assembly:'accessories',part:'accessories.ladder',expanded:true};
    r.hoverHit=null;r.isolate=true;r.buildMesh();
    assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(kinds.map(k=>'accessories.'+k)));
    assert.equal(r.activeLayout.groups.size,5);
    assert(r.faces.every(f=>f.motionKey),'movable '+vehicle);
    const stock=r.build;
    r.build=togglePart(stock,vehicle+'-field-ladder');r.buildMesh();
    assert(!r.faces.some(f=>f.part==='accessories.ladder'));
    r.build=stock;r.inspection={assembly:'accessories',part:'accessories.display',onlyPart:true};r.buildMesh();
    assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(['accessories.display']));
});
test('the G500 display lamps keep their colors across animation',()=>{
    const vehicle='g500';
    const display=sample(vehicle,'display');
    for(const phase of [.5,1]){
      const r=render(fitted(vehicle,['display']));
      drawAccessories(r,r.build,'#758076',phase);
      assert.deepEqual(r.faces,display);
      assert(display.some(f=>f.color==='#bc4b52'));
      assert(display.some(f=>f.color==='#597fc8'));
    }
});
