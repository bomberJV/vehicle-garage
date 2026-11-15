import {findInVehicle} from '../garage/inspection-search.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {paintChoice,normalizeHex,sanitizePalette} from '../garage/paint-colors.js';
import {availableParts,accounting,togglePart,exportText,importBuild,sanitizeBuild,selectWheelDesign} from '../garage/model.js';
import {wheelOptions} from '../garage/wheel-designs.js';
import {accessoriesFor} from '../garage/accessory-catalog.js';

test('paint presets and hex colors survive import, save and text export',()=>{
  assert.equal(paintChoice('yellow').hex,'#f2c629');
  assert.equal(normalizeHex('aBc'),'#aabbcc');
  assert.equal(normalizeHex('#1320011'),null);
  assert.equal(sanitizeBuild({paint:'garbage'}).paint,'olive');
  const color=sanitizeBuild({paint:'#A252B3'});
  assert.equal(importBuild(JSON.stringify(color)).paint,'#a252b3');
  assert.match(exportText(color),/#a252b3/i);
  assert.deepEqual(sanitizePalette([{hex:'#1a2',name:'one'},{hex:'#11AA22',name:' Moss '},{hex:'x'}]),[{hex:'#11aa22',name:'Moss'}]);
});

test('a wheel selected in either entry point follows the car, quote, saved build and shopping list',()=>{
  for(const id of ['g500','porsche993cab','porsche992scab','c63','hrv','bmw325ci','f350','bmws1000rr']){
    const alternative=wheelOptions(id)[1];
    const stock=sanitizeBuild({vehicle:id});
    const chosen=selectWheelDesign(stock,alternative.id),line=accounting(chosen).lines[0];
    assert.equal(chosen.vehicle,id);assert.equal(line.designId,alternative.id);assert.equal(line.amount,null);
    assert.equal(togglePart(stock,line.id).wheelDesign,alternative.id);
    const quoted=importBuild(JSON.stringify({...chosen,quotes:{[line.id]:452.67}}));
    assert.equal(quoted.wheelDesign,alternative.id);assert.equal(accounting(quoted).total,452.67);
    assert.ok(exportText(quoted).includes(alternative.buy.url));
    if(alternative.buyRear)assert.ok(exportText(quoted).includes(alternative.buyRear.url));
    const restored=togglePart(quoted,line.id);
    assert.equal(restored.wheelDesign,'stock');assert.equal(accounting(restored).lines.length,0);assert.deepEqual(restored.quotes,{});
  }
  assert.equal(sanitizeBuild({vehicle:'g500',wheelDesign:'foreign-wheel'}).wheelDesign,'stock');
});
test('rack swaps remove only the old rack and its quote',()=>{
  const [first,second]=accessoriesFor('g500').filter(option=>option.exclusive==='g-roof');
  const other=availableParts('g500').find(p=>p.category==='service');
  let b=togglePart({vehicle:'g500'},first.id);
  b=togglePart(b,other.id);b.quotes[first.id]=776;
  b=togglePart(b,second.id);assert.ok(b.parts.includes(second.id));assert.ok(b.parts.includes(other.id));
  assert.ok(!b.parts.includes(first.id));assert.ok(!Object.hasOwn(b.quotes,first.id));
});

test('crankcase nicknames open the same part on both 911s',()=>{
  for(const vehicle of ['porsche993cab','porsche992scab']){
    for(const query of ['crankcase','crackcase','crank case'])assert.equal(findInVehicle(vehicle,query,1)[0].part,'engine.case');
  }
});
