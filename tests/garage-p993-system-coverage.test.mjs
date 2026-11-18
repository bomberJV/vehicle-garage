// The 993 against the G500's system categories (hub #232): every category
// has its air-cooled equivalent installed, or is listed as still open.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift} from '../garage/lift-options.js';
import {chassisGroups,chassisRefs,front,rear} from '../garage/porsche993-chassis.js';
import {electricsGroups,electricsRefs,dme} from '../garage/porsche993-electrics.js';

const vehicle='porsche993cab';
const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'olive',finish:'silver',lift:normalizedLift(vehicle,{})},
  inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
r.buildMesh();
const faces=new Map();for(const f of r.faces)faces.set(f.part,(faces.get(f.part)||0)+1);
const ids=[...faces.keys()];

// Each category lists part-id prefixes that must all be installed.
export const categories={
 'engine core':['engine.case','engine.crankshaft','engine.cylinders','engine.heads','engine.plug-'],
 'induction':['engine.intake','fuel.rail'],
 'exhaust to the tailpipes':['engine.exhaust','993-climate.exchanger-'],
 'oil and cooling air':['993-lubrication.','engine.cooling'],
 'fuel':['fuel.tank','fuel.pump','fuel.supply','fuel.filler'],
 'gearbox and drive shafts':['drivetrain.gearbox','drivetrain.clutch','drivetrain.rear-differential','drivetrain.halfshafts'],
 'steering':['993-steering.rack','993-steering.tie-rod-','993-steering.column','993-steering.pump','993-steering.lines'],
 'front suspension':['993-suspension.front-cross-member','993-suspension.front-strut-','993-suspension.front-arm-','993-suspension.front-carrier-','993-suspension.front-hub-','993-suspension.front-stabilizer'],
 'rear suspension':['993-suspension.rear-cross-member','993-suspension.rear-side-panel-','993-suspension.rear-lower-arm-','993-suspension.rear-upper-arm-','993-suspension.rear-toe-link-','993-suspension.rear-carrier-','993-suspension.rear-hub-','993-suspension.rear-strut-','993-suspension.rear-stabilizer'],
 'brake hydraulics and ABS':['brakes.master','brakes.lines','brakes.abs','brakes.front-caliper','brakes.rear-caliper','brakes.parking'],
 'heating and air conditioning':['993-climate.'],
 'seats':['cabin.seats'],
 'dash and cabin':['cabin.controls','floor.'],
 'roof mechanism':['roof.drive','roof.links','roof.bows'],
 'electrical supply':['electrical.battery','electrical.generator','electrical.starter','electrical.fuses'],
 'fuel evaporative system':['993-evap.canister','993-evap.vent','993-evap.shutoff-valve','993-evap.purge'],
 'wiring harnesses and control units':['993-electrics.dme','993-electrics.control-units','993-electrics.engine-harness','993-electrics.abs-sensor-','993-electrics.abs-lead-']
};
// Still to build for the 993; the Systems row on #232 stays open until empty.
export const open=[];

test('every covered system category is installed on the 993',()=>{
  for(const [name,prefixes] of Object.entries(categories))for(const p of prefixes)
    assert(ids.some(id=>id.startsWith(p)&&faces.get(id)>0),`${name}: nothing installed for ${p}`);
});

test('no category is left open (evap and wiring were the last, in round 4)',()=>{
  assert.deepEqual(open,[]);
  for(const name of open)assert(!(name in categories));
});

test('chassis and wiring parts come in left and right pairs, each with a source',()=>{
  for(const g of [...chassisGroups,...electricsGroups])for(const p of g.parts){
    assert(p.source?.url?.startsWith('https://'),p.id);
    if(p.id.endsWith('-left'))assert(g.parts.some(q=>q.id===p.id.replace(/-left$/,'-right')),p.id);
  }
  for(const ref of [...Object.values(chassisRefs),...Object.values(electricsRefs)])assert(ref.url.startsWith('https://')&&ref.label.length>10);
});

test('the wheel ends sit on the axle lines and the struts stay inboard of the tyres',()=>{
  const box=id=>{const pts=r.faces.filter(f=>f.part===id).flatMap(f=>f.points);return [0,1,2].map(k=>[Math.min(...pts.map(p=>p[k])),Math.max(...pts.map(p=>p[k]))]);};
  for(const [axle,hub] of [[front.axle,'993-suspension.front-hub-right'],[rear.axle,'993-suspension.rear-hub-right']]){
    const b=box(hub);assert(Math.abs((b[0][0]+b[0][1])/2-axle)<.002,hub);
  }
  // The front tyre's inner face is at |y| 0.600; the coil and damper stay inside it above the rim.
  const strut=r.faces.filter(f=>f.part==='993-suspension.front-strut-right').flatMap(f=>f.points).filter(p=>p[2]>.54&&p[2]<.64);
  assert(Math.max(...strut.map(p=>p[1]))<.600);
  // Tie rods meet the rack inside the cross member's width.
  const rack=box('993-steering.rack');assert(rack[1][1]<front.crossY+.10);
});

test('the DME sits under the driver\'s (left) seat and the canister ahead of the left rear wheel',()=>{
  const seat=r.faces.filter(f=>f.part==='cabin.seats').flatMap(f=>f.points).filter(p=>p[1]<0);
  const ys=seat.map(p=>p[1]),xs=seat.map(p=>p[0]);
  assert(dme[1]>Math.min(...ys)&&dme[1]<Math.max(...ys)&&dme[0]>Math.min(...xs)&&dme[0]<Math.max(...xs));
  const can=r.faces.filter(f=>f.part==='993-evap.canister').flatMap(f=>f.points);
  assert(Math.max(...can.map(p=>p[1]))<-.6&&Math.max(...can.map(p=>p[0]))<rear.axle-.30);
});
