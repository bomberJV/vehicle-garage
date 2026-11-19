// The 993 Carrera Cabriolet's stock tyres (205/55 ZR16 front, 245/45 ZR16 rear)
// set the drawn tyre radius, and every hub height follows the drawn wheel centre.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {porscheShape} from '../garage/porsche-coachwork.js';
import {roadSystems} from '../garage/road-service-data.js';
import {rear as rearAxle} from '../garage/porsche993-chassis.js';
import {factoryDimensions as D,tyreDiameter} from '../garage/porsche993-dimensions.js';

const car=porscheShape(false);
const nominal=[D.tyreFront.size,D.tyreRear.size].map(code=>tyreDiameter(code)/2000);
const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle:'porsche993cab',roofPosition:'up',paint:'silver',parts:[]},inspection:{},isolate:false,partPositions:new Map(),schematic:true});
r.buildMesh();
const tyre=sx=>{const z=r.faces.filter(f=>f.part==='running.tires').flatMap(f=>f.points).filter(p=>Math.sign(p[0])===sx).map(p=>p[2]);return [Math.min(...z),Math.max(...z)];};
const drawn=[tyre(-1),tyre(1)];

test('the stock sizes are 205/55 ZR16 and 245/45 ZR16',()=>{
  assert.equal(D.tyreFront.size,'205/55 ZR16');assert.equal(D.tyreRear.size,'245/45 ZR16');
  assert(Math.abs(nominal[0]-.3160)<.0001&&Math.abs(nominal[1]-.31353)<.0001);
});

test('the modelled and drawn tyre outer radii are the nominal ones within 2 mm',()=>{
  for(const [i,radius] of [car.frontRadius,car.rearRadius].entries()){
    assert(Math.abs(radius-nominal[i])<=.002,`${i?'rear':'front'} radius ${radius} m, nominal ${nominal[i].toFixed(4)} m`);
    const [lo,hi]=drawn[i];
    assert(Math.abs((hi-lo)/2-nominal[i])<=.002,`${i?'rear':'front'} drawn radius ${((hi-lo)/2).toFixed(4)} m`);
  }
});

test('both tyres stand on the same contact plane, and the hub heights match the drawn wheel centres',()=>{
  assert(Math.abs(drawn[0][0]-drawn[1][0])<1e-6,'front and rear contact heights differ');
  const centres=drawn.map(([lo,hi])=>(lo+hi)/2);
  for(const i of [0,1])assert(Math.abs(roadSystems.porsche993cab.wheel[i]-centres[i])<=.0005,`road-service wheel ${i}: ${roadSystems.porsche993cab.wheel[i]} vs ${centres[i].toFixed(4)}`);
  assert(Math.abs(rearAxle.wheelZ-centres[1])<=.0005,`rear hub ${rearAxle.wheelZ} vs ${centres[1].toFixed(4)}`);
});
