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
 hrv:{id:'honda-hrv',name:'Honda HR-V',trim:'2026 EX-L AWD · US'},
 hrvlx:{id:'honda-hrv',name:'Honda HR-V',trim:'2026 LX AWD · US'},
  sl550:{id:'mercedes-sl',name:'Mercedes-Benz SL',trim:'2014 SL550 · R231 · US'},
  porsche993cab:{id:'porsche-911',name:'Porsche 911',trim:'1998 Carrera Cabriolet · 993 · manual',order:1998},
  porsche996cab:{id:'porsche-911',name:'Porsche 911',trim:'1999 Carrera Cabriolet · 996 · manual',order:1999},
  porsche992scab:{id:'porsche-911',name:'Porsche 911',trim:'2023 Carrera S Cabriolet · 992 · manual',order:2023}
};
export function vehicleFamilies(ids){
  const groups=new Map();
  for(const id of ids){
    const family=families[id],key=family?.id||id;
    if(!groups.has(key))groups.set(key,{id:key,name:family?.name,variants:[]});
    groups.get(key).variants.push({id,trim:family?.trim});
  }
  // Variants within a family read in model-year order, whatever the fleet order.
  for(const group of groups.values())group.variants.sort((a,b)=>(families[a.id]?.order??0)-(families[b.id]?.order??0));
  return [...groups.values()];
}
