import {getBmwLighting} from './bmw-light-studies.js';
import {getBmwCabinDetail} from './bmw-cabin-closures.js';
import {getBmwFuelDetail} from './bmw-fuel-system.js';
import {getM54DisaDetail} from './bmw-disa-study.js';
import {getCivilAirframeService} from './civil-airframe-services.js';
import {getCivilServiceDetail} from './civil-service-studies.js';
import {getPorscheCrankcaseDetail} from './porsche-crankcase.js';
import {getG500LampDetail} from './g500-light-studies.js';
import {getBikeDetail} from './bike-studies.js';
import {getRoadDetail} from './road-mechanisms.js';
import {getSaturnDetail} from './saturn-detail.js';
import {getSpaceEnvironment} from './space-environment.js';
import {getSpaceDetail} from './space-detail.js';
import {getFleetDetail} from './fleet-detail.js';
import {getPistonDetail} from './piston-study.js';
import {getRoadConstruction} from './road-construction.js';

import {getPorscheCoolingDetail} from './porsche-cooling.js';
import {getPorscheSpoilerDetail} from './porsche-spoilers.js';
import {getMarinePropulsionDetail} from './marine-propulsion.js';
import {getDoorDetail} from './door-detail.js';
import {getFloorDetail} from './floor-trim.js';

import {getSLStudy} from './sl550-studies.js';
import {getG500M113Internals} from './g500-m113-internals.js';
const lookups=[getG500M113Internals,getSLStudy,getBmwLighting,getBmwCabinDetail,getBmwFuelDetail,
  getM54DisaDetail,
  getCivilAirframeService,getCivilServiceDetail,
  getPorscheCrankcaseDetail,getG500LampDetail,
  getPorscheCoolingDetail,getPorscheSpoilerDetail,getDoorDetail,getMarinePropulsionDetail,getFloorDetail,
  getBikeDetail,getRoadDetail,getSaturnDetail,getSpaceEnvironment,
  getSpaceDetail,getFleetDetail,getRoadConstruction,getPistonDetail
];
const cache=new Map();
export function getDetail(vehicle,part) {
  if(!vehicle||!part)return null;
  const key=vehicle+'/'+part;
  if(!cache.has(key)){
    let detail=null;
    for(const lookup of lookups){
      detail=lookup(vehicle,part);
      if(detail)break;
    }
    if(detail){
      const componentIndex=new Map(detail.groups.flatMap(group=>group.parts.map(p=>[p.id,p])));
      cache.set(key,{...detail,componentIndex});
    }else cache.set(key,null);
  }
  return cache.get(key);
}
