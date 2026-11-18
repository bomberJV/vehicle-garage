import {installedAlias} from './e46-additions.js';
// Several inspector entries describe one piece of hardware. In the assembled
// truck its mesh belongs to one system, so it casts one shadow and has one hit target.
const g500={
  'powertrain.ecu':'electrical.ecu','powertrain.starter':'electrical.starter','powertrain.alternator':'electrical.alternator',
  'powertrain.ac-compressor':'hvac.compressor',
  'powertrain.brake-reservoir':'brakes.hydraulics',
  'powertrain.exhaust-manifold':'exhaust.manifold-left',
  'cooling.heater-core':'hvac.heater-core',
  'drivetrain.transfer':'differentials.center',
  'drivetrain.front-shaft':'differentials.front-shaft',
  'drivetrain.front-differential':'differentials.front',
  'drivetrain.propshaft':'differentials.rear-shaft',
  'drivetrain.rear-differential':'differentials.rear'
};
for(const key of ['intake','airbox','maf','intake-duct','throttle','air-filters'])g500['powertrain.'+key]='intake.'+key;
for(const key of ['radiator','fan','water-pump','thermostat','upper-hose','lower-hose','coolant-reservoir'])g500['powertrain.'+key]='cooling.'+key;
for(const key of ['sump','oil-pickup','oil-pump','oil-filter'])g500['engine-oil.'+key]='powertrain.'+key;
const s1000rr={'engine.airbox':'intake.airbox','engine.cooling':'cooling.radiator','drive.exhaust':'exhaust.headers'};
const porsche={
  'drive.gearbox':'drivetrain.gearbox','drive.axles':'drivetrain.halfshafts',
  'running.brakes':'brakes.front-disc','cabin.carpet':'floor.carpet','cabin.top':'roof.fabric'
};
const gearboxes=new Set(['g500','bmw325ci','c63','hrv','hrvlx']);
export function installedPartId(vehicle,id){
  if(gearboxes.has(vehicle)&&id==='powertrain.transmission')return 'drivetrain.gearbox';
  if(vehicle==='g500')return g500[id]||id;
  if(vehicle==='bmws1000rr')return s1000rr[id]||id;
  if(vehicle==='porsche993cab'||vehicle==='porsche992scab'||vehicle==='porsche996cab')return porsche[id]||id;
  if(['bmw325ci','c63','hrv','hrvlx'].includes(vehicle)&&id==='powertrain.brake-reservoir')return 'brakes.master';
  if(vehicle==='bmw325ci'&&['powertrain.fuel-rail','powertrain.injectors'].includes(id))return 'fuel.rail';
  if(vehicle==='bmw325ci')return installedAlias(id)||id;
  return id;
}
