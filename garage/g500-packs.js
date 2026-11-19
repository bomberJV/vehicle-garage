// Collects the G500 study packs. Each pack lives in its own file so packs can be
// built in parallel without touching shared files.
import * as engine from './g500-pack-engine.js';
import * as cooling from './g500-pack-cooling.js';
import * as electrical from './g500-pack-electrical.js';
import * as body from './g500-pack-body.js';
import * as cabin from './g500-pack-cabin.js';
import * as chassis from './g500-pack-chassis.js';
import * as drivetrain from './g500-pack-drivetrain.js';
import * as exhaust from './g500-pack-exhaust.js';

export const g500Packs={engine,cooling,electrical,body,cabin,chassis,drivetrain,exhaust};
export const packStudies=Object.values(g500Packs).flatMap(p=>p.studies);
export const packClaims=Object.values(g500Packs).flatMap(p=>p.claims);
export function getG500PackStudy(vehicle,id){
  if(vehicle!=='g500')return null;
  for(const pack of Object.values(g500Packs)){const s=pack.views.get(id);if(s)return s;}
  return null;
}
