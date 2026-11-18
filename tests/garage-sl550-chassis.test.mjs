import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getAssemblies} from '../garage/assemblies.js';
import {crossingPairs} from './mesh-proximity.mjs';

const faces=GarageRenderer.assembledFaces(sanitizeBuild({vehicle:'sl550',roofPosition:'up'}));
const crossings=(keep)=>crossingPairs(faces.filter(f=>keep(f.part)));
const starts=(id,list)=>list.some(p=>id.startsWith(p));

test('the SL550 lists steering, both axles and the shared brake, fuel and electrical systems',()=>{
  const ids=new Set(getAssemblies('sl550').map(g=>g.id));
  for(const id of ['sl-steer','sl-front','sl-rear','brakes','fuel','electrical'])assert(ids.has(id),id);
  const parts=new Set(faces.map(f=>f.part));
  for(const id of ['sl-steer.rack','sl-steer.shaft','sl-front.lower-arms','sl-front.upper-arms','sl-front.knuckles','sl-front.engine',
    'sl-rear.links','sl-rear.carriers','brakes.master','brakes.abs','brakes.lines','brakes.parking',
    'fuel.tank','fuel.filler','fuel.supply','electrical.battery','electrical.starter','electrical.generator'])assert(parts.has(id),id);
  // The M278 draws its own rails, and the wheels draw their own discs and calipers.
  for(const id of ['fuel.rail','brakes.front-disc','brakes.rear-caliper'])assert(!parts.has(id),id);
});

test('the suspension links and knuckles clear the ABC struts, the wheels and the driveshafts',()=>{
  const chassis=['sl-front.','sl-rear.','sl-steer.'];
  const pairs=crossings(id=>starts(id,[...chassis,'sl-abc.struts','running.','sl-drive.axles','sl-drive.exhaust']));
  const bad=pairs.filter(p=>starts(p.a,chassis)!==starts(p.b,chassis))
    // The driveshaft passes through the rear hub bearing by design.
    .filter(p=>!(p.a==='sl-drive.axles'&&p.b==='sl-rear.carriers'));
  assert.deepEqual(bad.map(p=>p.a+' + '+p.b),[]);
});

test('the tank, filler neck, battery and alternator clear the roof drive, exhaust, rear axle and engine',()=>{
  const added=['fuel.tank','fuel.filler','electrical.battery','electrical.generator','electrical.starter'];
  const pairs=crossings(id=>added.includes(id)||starts(id,['roof.','sl-drive.','sl-m278.','sl-air.','sl-abc.','sl-rear.','seats.','audio.']));
  const bad=pairs.filter(p=>added.includes(p.a)!==added.includes(p.b));
  assert.deepEqual(bad.map(p=>p.a+' + '+p.b),[]);
});
