import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {GarageRenderer} from '../garage/render.js';
import {drawWheelSample} from '../garage/wheel-preview.js';
import {wheelOptions,wheelDesign} from '../garage/wheel-designs.js';

const vehicles=['g500','f350','c63','hrv','bmw325ci','porsche993cab','porsche992scab','bmws1000rr'];
const corners=['front-left','front-right','rear-left','rear-right'];
function renderer(vehicle){
  return Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,paint:'silver',finish:'silver',parts:[]},faces:[],lights:false,inspection:{assembly:null},schematic:true});
}
function signature(faces){return createHash('sha256').update(JSON.stringify(faces.map(f=>f.points))).digest('hex');}
function mounted(r,id){
  r.build.wheelDesign=id;r.buildMesh();
  const rims=r.faces.filter(f=>['wheels.rim','running.rims'].includes(f.part));
  const brakes=r.faces.filter(f=>['wheels.caliper','wheels.disc','running.brakes','running.discs','brakes.front-disc','brakes.rear-disc','brakes.front-caliper','brakes.rear-caliper'].includes(f.part));
  const positions=r.build.vehicle==='bmws1000rr'?['front','rear']:corners;
  assert.deepEqual([...new Set(rims.map(f=>f.instance))].sort(),positions);
  assert(rims.every(f=>f.points.every(p=>p.every(Number.isFinite))));
  const design=wheelDesign(r.build.vehicle,id);
  if(!r.build.vehicle.startsWith('porsche')&&r.build.vehicle!=='bmws1000rr'){
    for(const corner of positions){
      const ring=rims.filter(f=>f.instance===corner).flatMap(f=>f.points);
      const mid=axis=>(Math.min(...ring.map(p=>p[axis]))+Math.max(...ring.map(p=>p[axis])))/2;
      const x=mid(0),z=mid(2);
      const innerRadius=(corner.startsWith('front')?design.frontDiameter:design.rearDiameter)*.0127-.019;
      for(const face of brakes.filter(f=>f.instance===corner))for(const p of face.points){
        assert(Math.hypot(p[0]-x,p[2]-z)<innerRadius,r.build.vehicle+' '+design.id+' brake must clear barrel');
      }
    }
  }
  return {rims:positions.map(c=>signature(rims.filter(f=>f.instance===c))),brakes:signature(brakes)};
}
test('published wheel choices have manufacturer and supplier records, including each staggered wheel size',()=>{
  for(const vehicle of vehicles){
    const choices=wheelOptions(vehicle);
    assert(choices.length>=2);assert.equal(choices[0].id,'stock');assert.equal(wheelDesign(vehicle,'old-wheel'),choices[0]);
    for(const item of choices){
      assert(item.source.url.startsWith('https://')&&item.buy.url.startsWith('https://'));
      assert(item.frontDiameter>=16&&item.rearDiameter>=16);
      if(item.id!=='stock')assert(item.maker&&item.partNumber&&item.fitment);
    }
  }
  assert.deepEqual(wheelOptions('boeing747'),[]);assert.equal(wheelDesign('__proto__','constructor'),null);
});
test('selecting and reverting fitted wheels updates each pickable road wheel without moving the brakes',()=>{
  for(const vehicle of vehicles){
    const r=renderer(vehicle),defaultMesh=mounted(r,undefined);
    for(const option of wheelOptions(vehicle).slice(1)){
      const alternative=mounted(r,option.id);
      for(let i=0;i<defaultMesh.rims.length;i++)assert.notEqual(alternative.rims[i],defaultMesh.rims[i],vehicle+' '+option.id+' '+corners[i]);
      assert.equal(alternative.brakes,defaultMesh.brakes);
    }
    assert.deepEqual(mounted(r,'invalid-from-old-save'),defaultMesh);
  }
});
test('wheel cards draw front elevations from the fitted geometries',()=>{
  const pictures=vehicle=>wheelOptions(vehicle).map(option=>{
    const points=[];
    const ctx={beginPath(){},arc(){},closePath(){},fill(){},clearRect(){},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);}};
    drawWheelSample({width:150,height:120,getContext:()=>ctx},vehicle,option.id,'#b5bec1');
    assert(points.length>100);assert(points.every(p=>p.every(Number.isFinite)));
    return JSON.stringify(points);
  });
  for(const vehicle of vehicles){const result=pictures(vehicle);assert.equal(new Set(result).size,result.length);}
});
