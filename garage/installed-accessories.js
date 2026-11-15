import {FIELD_ACCESSORIES} from './accessory-catalog.js';
import {defaultAccessoryOffset} from './field-accessory-geometry.js';

export function installedAccessories(vehicle,selected){
  if(!selected?.length)return null;
  const parts=FIELD_ACCESSORIES.filter(p=>p.vehicles.includes(vehicle)&&selected.includes(p.id)).map(p=>({
    id:'accessories.'+p.fieldKind,name:p.name,description:p.description+' '+p.fit,source:p.source,
    offset:defaultAccessoryOffset(p.fieldKind),category:'exterior',location:'Fitted preview',quantity:'One selected option'
  }));
  if(!parts.length)return null;
  return {id:'accessories',name:'Installed accessories',parts,source:parts[0].source,view:'hero',category:'exterior',
    description:'Select an accessory on the vehicle to see its shape and fitment, or expand the group to move the pieces apart.'};
}
