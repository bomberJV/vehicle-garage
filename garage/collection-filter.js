import {vehicleDomain,vehicleType} from './fleet.js';

export const DOMAINS=['All','Land','Air','Sea'];
const TYPE_ORDER=['SUVs','Cars','Trucks','Motorcycles','Rovers','Tanks','Planes','Helicopters','Space','Ships','Yachts','Fishing boats','Submarines'];

export function modelFilters(ids,domain='All',type='All'){
  const domainIds=ids.filter(id=>domain==='All'||vehicleDomain(id)===domain);
  const present=new Set(domainIds.map(vehicleType));
  const types=['All',...TYPE_ORDER.filter(t=>present.has(t)),...[...present].filter(t=>!TYPE_ORDER.includes(t))];
  return {types,models:domainIds.filter(id=>type==='All'||vehicleType(id)===type)};
}

// Variants keep their existing IDs for saved builds, models and deep links.
const families={
  sl550:{id:'mercedes-sl',name:'Mercedes-Benz SL',trim:'2014 SL550 · R231 · US'},
  porsche993cab:{id:'porsche-911',name:'Porsche 911',trim:'1998 Carrera Cabriolet · 993 · manual'},
  porsche992scab:{id:'porsche-911',name:'Porsche 911',trim:'2023 Carrera S Cabriolet · 992 · manual'}
};
export function vehicleFamilies(ids){
  const groups=new Map();
  for(const id of ids){
    const family=families[id],key=family?.id||id;
    if(!groups.has(key))groups.set(key,{id:key,name:family?.name,variants:[]});
    groups.get(key).variants.push({id,trim:family?.trim});
  }
  return [...groups.values()];
}
