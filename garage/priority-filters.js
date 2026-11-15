import {priorityLevels,workflowStatuses} from './priority-tracking.js';
import {vehicleReviewTracks} from './priority-review-tracks.js';

export const domains=['Land','Air','Sea'];
export const typesFor=domain=>[...new Set(vehicleReviewTracks.filter(v=>domain==='all'||v.domain===domain).map(v=>v.type))];
const types=typesFor('all');
const valid=(values,value)=>values.includes(value)?value:'all';
const legacyStatus={partial:'in-progress',shipped:'done',open:'todo'};
export const filterKeys=['q','priority','status','domain','type','vehicle','hide'];
export function readFilters(params){
  const state=params.get('status'),domain=valid(domains,params.get('domain'));
  return {
    q:(params.get('q')||'').trim().slice(0,200),
    level:valid(priorityLevels.map(p=>p.id),params.get('priority')),
    workflow:valid(workflowStatuses.map(s=>s.id),Object.hasOwn(legacyStatus,state)?legacyStatus[state]:state),
    domain,type:valid(typesFor(domain),params.get('type')),vehicle:valid(vehicleReviewTracks.map(v=>v.id),params.get('vehicle')),
    hide:[...new Set(params.getAll('hide').filter(v=>[...domains,...types].includes(v)))]
  };
}
export function writeFilters(f){
  const params=new URLSearchParams();
  for(const [key,v] of [['q',f.q],['priority',f.level],['status',f.workflow],['domain',f.domain],['type',f.type],['vehicle',f.vehicle]]){
    if(v&&(key==='q'||v!=='all'))params.set(key,v);
  }
  for(const category of f.hide)params.append('hide',category);
  return params;
}
export function inScope(tracking,f){
  if(f.vehicle&&f.vehicle!=='all'&&!tracking.vehicleIds.includes(f.vehicle))return false;
  if(f.level!=='all'&&f.level!==tracking.level||f.workflow!=='all'&&f.workflow!==tracking.workflow)return false;
  if(!tracking.categories.length)return f.domain==='all'&&f.type==='all';
  return tracking.categories.some(({domain,type})=>
    (f.domain==='all'||domain===f.domain)&&(f.type==='all'||type===f.type)&&
    !f.hide.includes(domain)&&!f.hide.includes(type));
}
export function savedAssignment(raw){
  const result={};
  if(priorityLevels.some(p=>p.id===raw?.level))result.level=raw.level;
  if(workflowStatuses.some(s=>s.id===raw?.workflow))result.workflow=raw.workflow;
  return result;
}
