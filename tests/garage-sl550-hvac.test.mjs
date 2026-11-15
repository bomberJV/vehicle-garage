import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {drawSLCabin,slCabinStudies} from '../garage/sl550-cabin.js';

const renderer=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
const lines=new Map();
renderer.rod=function(start,end,radius,...rest){
  const key=this.currentPart;
  if(!lines.has(key))lines.set(key,[]);
  lines.get(key).push({start,end,radius});
  GarageRenderer.prototype.rod.call(this,start,end,radius,...rest);
};
drawSLCabin(renderer);
const mesh=id=>renderer.faces.filter(f=>f.part==='climate.'+id);
const endpoints=id=>lines.get('climate.'+id).flatMap(segment=>[segment.start,segment.end]);
const hasPort=(id,port)=>endpoints(id).some(p=>p.every((n,i)=>n===port[i]));

test('the four service lines form a loop between the condenser, compressor and expansion valve',()=>{
  const runs={
    discharge:[[-1.385,-.244,.468],[-1.909,-.389,.420]],
    liquid:[[-1.909,-.389,.346],[-1.137,-.475,.511]],
    suction:[[-1.324,-.244,.469],[-1.137,-.475,.546]],
    'rear-lines':[[-1.137,-.475,.511],[-1.137,-.475,.546],[-.667,.088,.645],[-.667,.088,.681]],
    expansion:[[-.533,.102,.530],[-.533,.102,.673]]
  };
  for(const [id,ports] of Object.entries(runs))for(const p of ports)assert(hasPort(id,p),id);
  assert.deepEqual(new Set(mesh('drains').map(f=>f.instance)),new Set(['left','right']));
});

test('installed condenser fits between the two coolant exchangers and uses its teardown geometry',()=>{
  // The sensor and hose connections extend beyond the shoulder of the cooling stack.
  const xs=mesh('condenser').flatMap(f=>f.points.filter(p=>Math.abs(p[1])<=.366).map(p=>p[0]));
  assert(Math.min(...xs)>-1.918);
  assert(Math.max(...xs)<-1.898);
  const view=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  slCabinStudies['climate.condenser'].draw(view);
  assert.equal(mesh('condenser').length,view.faces.length);
  assert.deepEqual(new Set(view.faces.map(f=>f.part)),new Set(['slcondenser.core','slcondenser.sensor','slcondenser.frame']));
});
