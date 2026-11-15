import * as g500 from './g500-additions.js';
import * as bmw325ci from './e46-additions.js';
import * as bmws1000rr from './s1000rr-additions.js';
import * as porsche992scab from './porsche992-additions.js';
import * as porsche993cab from './porsche993-additions.js';
import {getG500ComfortAssemblies,getG500ComfortDetail,drawG500Comfort} from './g500-comfort.js';
import {g500ExhaustGroup,drawG500Exhaust,getG500ExhaustDetail} from './g500-exhaust.js';
import {g500FlowGroups,drawG500InductionCircuit,drawG500CoolingCircuit} from './g500-flow.js';
import {getG500FlowDetail} from './g500-flow-studies.js';
import {getG500ServiceAssemblies,getG500ServiceDetail,drawG500ServiceAssembly} from './g500-service-systems.js';
import {getRoadServiceAssemblies,getRoadServiceDetail,drawRoadServiceAssembly} from './road-service-systems.js';

// Keep the renderer, assembly menu and deep links on the same installed groups.
const comfortGroups=getG500ComfortAssemblies('g500');
const g500Services=[...getG500ServiceAssemblies('g500'),g500ExhaustGroup,...g500FlowGroups,...comfortGroups];
const additions=new Map(Object.entries({g500,bmw325ci,bmws1000rr,porsche993cab,porsche992scab}));
const installed=new Map();
for(const [vehicle,module] of additions){
 const base=vehicle==='g500'?g500Services:getRoadServiceAssemblies(vehicle);
 installed.set(vehicle,[...base,...module.groups]);
}
export function vehicleServiceAssemblies(vehicle){
 return installed.get(vehicle)||getRoadServiceAssemblies(vehicle);
}
export function addedServiceGroups(vehicle){
 return additions.get(vehicle)?.groups||[];
}
export function vehicleServiceDetail(vehicle,part){
 const extra=additions.get(vehicle)?.detailFor(part);
 if(extra)return extra;
 return vehicle==='g500'?(getG500ComfortDetail(vehicle,part)||getG500FlowDetail(vehicle,part)||getG500ExhaustDetail(part)||getG500ServiceDetail(vehicle,part)):getRoadServiceDetail(vehicle,part);
}
export function drawVehicleService(r,vehicle,group,paint,engineOwnsM54Rail=false){
 const extra=additions.get(vehicle);
 if(extra?.groups.some(g=>g.id===group)){
  extra.drawGroup(r,group,paint);
  return;
 }
 if(vehicle==='g500'){
  if(group==='intake'){if(r.inspection?.assembly!=='powertrain')drawG500InductionCircuit(r);}
  else if(group==='cooling')drawG500CoolingCircuit(r);
  else if(group==='exhaust')drawG500Exhaust(r);
  else if(comfortGroups.some(g=>g.id===group))drawG500Comfort(r,vehicle,group);
  else drawG500ServiceAssembly(r,vehicle,group,paint);
 }
 else drawRoadServiceAssembly(r,vehicle,group,engineOwnsM54Rail);
}
