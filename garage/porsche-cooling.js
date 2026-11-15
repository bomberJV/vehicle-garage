import {get993Fan} from './porsche-fan.js';
import {frontCoolantStudy} from './porsche-coolant.js';
import {getDeckCooling} from './porsche-deck-cooling.js';

export function getPorscheCoolingDetail(vehicle,partId){
  if(vehicle==='porsche993cab')return get993Fan(partId);
  if(vehicle==='porsche992scab')return partId==='engine.cooling'?frontCoolantStudy:getDeckCooling(partId);
  return null;
}
