import {sl550} from './sl550.js';
import {roadModels} from './fleet-road.js';
import {seaModels} from './fleet-sea.js';
import {airModels} from './fleet-air.js';
import {spaceModels} from './fleet-space.js';
import {trackedModels} from './fleet-tracked.js';

import {roadSuppliers} from './road-suppliers.js';

const exhibits = [...roadModels, sl550, ...trackedModels, ...airModels, ...spaceModels, ...seaModels];

export const FLEET = Object.fromEntries(exhibits.map(exhibit => {
  const groups = exhibit.groups.map(group => ({source: exhibit.source, ...group}));
  return [exhibit.id, {
    ...exhibit,
    groups,
    parts:[...(exhibit.parts||[]),...(roadSuppliers[exhibit.id]||[])],
    componentIndex: new Map(groups.flatMap(group => group.parts.map(part => [part.id, part]))),
  }];
}));

export const ROAD_TYPES = {g500:'SUVs', hrv:'SUVs', f350:'Trucks', c63:'Cars', bmw325ci:'Cars'};

export function vehicleDomain(id) { return FLEET[id]?.domain || 'Land'; }
export function vehicleType(id) { return FLEET[id]?.type || ROAD_TYPES[id]; }
export function hasBuildPlan(id) { return !FLEET[id] || Boolean(FLEET[id].parts?.length); }
