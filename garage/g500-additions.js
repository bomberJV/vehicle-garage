import {steeringRows} from './g500-steering-gear.js';
import {oilRows,sharedOilKeys,atfRows} from './g500-oil-circuits.js';
import {evapRows} from './g500-vapor.js';
import {fluidDetail} from './g500-fluid-studies.js';
import {fluidRefs as ref} from './g500-fluid-refs.js';

function service(id,name,description,sources,rows){
 const parts=rows.map(([key,name,description,offset,source,draw])=>({id:id+'.'+key,name,description,offset,source,draw,category:'service'}));
 return {id,name,description,source:sources[0],sources,parts,category:'service',internal:true,view:'hero'};
}
export const groups=[
 service('steering-assist','Hydraulic power steering','Trace the steering wheel’s mechanical connection to the pitman arm and the separate oil circuit that assists it. The hose and shaft bends are schematic.',[ref.steering,ref.steeringInstall,ref.gear,ref.steeringType,ref.ballGear],steeringRows),
 service('engine-oil','Engine lubrication','Start at the M113 sump and follow the pickup, pump, cartridge housing and heat exchanger. Inside the V8, the bearing feeds and piston nozzles show where pressurized oil goes. Gallery paths are schematic.',[ref.oil,ref.filter,ref.jets],oilRows),
 service('transmission-fluid','Automatic transmission hydraulics and cooling','Open the five-speed automatic from below. The filter and control assembly sit above the pan. Two cooler lines reach a narrow heat exchanger in the front cooling pack. Pipe bends are approximate.',[ref.atfPan,ref.atfCooler,ref.shift],atfRows),
 service('evap','Fuel-vapor recovery','Follow vapor from the rear tank into the charcoal bed and through the purge valve to the intake. The US control system includes tank pressure monitoring and a vent shutoff. Hose routing is schematic.',[ref.evap,ref.evapCase,ref.evapRoute,ref.evapControls],evapRows)
];
const byId=new Map(groups.map(g=>[g.id,g]));
export function drawGroup(r,id){
 const group=byId.get(id);
 if(!group)return;
 for(const p of group.parts){
  const key=p.id.slice(id.length+1);
  // The ordinary vehicle and the isolated engine use the M113 hierarchy.
  // In this assembly the same four meshes become selectable oil-circuit parts.
  if(id==='engine-oil' && sharedOilKeys.has(key) && r.inspection?.assembly!=='engine-oil')continue;
  r.tag(p.id,()=>p.draw(r));
 }
}
export const detailFor=fluidDetail;
