// Detail measures for every road vehicle in the garage, from the live registry:
// installed mesh parts, assemblies, reachable detail studies and clickable parts.
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift} from '../garage/lift-options.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';

export function installedParts(vehicle){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'olive',finish:'silver',lift:normalizedLift(vehicle,{})},inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
  r.buildMesh();
  return [...new Set(r.faces.map(f=>f.part).filter(Boolean))];
}
export function measure(vehicle){
  const installed=installedParts(vehicle),assemblies=getAssemblies(vehicle);
  const seeds=new Set([...installed,...assemblies.flatMap(a=>a.parts.map(p=>p.id))]);
  const studies=new Map(),queue=[...seeds],seen=new Set();
  while(queue.length){
    const id=queue.shift();if(seen.has(id))continue;seen.add(id);
    const d=getDetail(vehicle,id);if(!d)continue;
    const key=d.id||id;if(studies.has(key))continue;
    studies.set(key,d);
    for(const c of d.componentIndex.keys())queue.push(c.includes('.')?c:key+'.'+c);
  }
  const nested=[...studies.values()].reduce((n,d)=>n+d.componentIndex.size,0);
  return {installed:installed.length,assemblies:assemblies.length,studies:studies.size,clickable:installed.length+nested};
}
