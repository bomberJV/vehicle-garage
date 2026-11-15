import {getApolloAir} from './apollo-air.js';
import {stageEntries} from './saturn-stages.js';
import {cabinEntries} from './saturn-cabin.js';
import {scienceEntries} from './saturn-science.js';

const details=new Map();
for(const [ids,detail] of [...stageEntries,...cabinEntries,...scienceEntries]){
  for(const id of ids)details.set(id,detail);
}
export function getSaturnDetail(vehicleId,partId){
  return getApolloAir(vehicleId,partId) || (vehicleId==='saturn-v' ? details.get(partId)||null : null);
}
