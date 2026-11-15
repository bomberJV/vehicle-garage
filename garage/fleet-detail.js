import {civilSections} from './civil-sections.js';
import {marineSections} from './marine-sections.js';
import {marineSubsections} from './marine-subsections.js';

import {heritageSections} from './heritage-sections.js';

const vehicles=new Map(Object.entries({...civilSections,...marineSections,...heritageSections}).map(([vehicle,sections])=>[vehicle,new Map(Object.entries({...sections,...marineSubsections[vehicle]}))]));

export function getFleetDetail(vehicleId,partId) {
  return vehicles.get(vehicleId)?.get(partId) ?? null;
}
