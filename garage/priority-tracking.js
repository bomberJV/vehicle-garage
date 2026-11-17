import {vehiclePriorities} from './priority-vehicles.js';
import {vehicleReviewTracks,reviewTask} from './priority-review-tracks.js';
import {additionalRequestAssignments} from './priority-backlog.js';
import {vehicleAssignments} from './priority-vehicle-assignments.js';

export const priorityLevels=[
  {id:'P0',label:'P0',description:'A defect prevents reliable use of the model.'},
  {id:'P1',label:'P1',description:'A core feature or a repeatedly requested correction.'},
  {id:'P2',label:'P2',description:'A specific improvement with an identified next check.'},
  {id:'P3',label:'P3',description:'A lower-priority refinement or optional addition.'}
];
export const workflowStatuses=[
  {id:'todo',label:'To do',description:'The next task is ready to pick up.'},
  {id:'in-progress',label:'In progress',description:'Someone is working on the task.'},
  {id:'done',label:'Done',description:'The listed request has been delivered.'},
  {id:'parked',label:'Parked',description:'The next task is waiting on a named decision or source.'}
];

const all=vehiclePriorities.map(v=>v.id);
const road=['sl550','g500','f350','c63','hrv','bmw325ci','bmw328xi','porsche993cab','porsche992scab','porsche996cab','bmws1000rr'];
const passenger=road.filter(id=>id!=='bmws1000rr');
const porsches=['porsche993cab','porsche992scab'];
const civilAircraft=['boeing747','cessna172','piperj5','gulfstreamg800'];
const space=['saturn-v','apollo-falcon','apollo-lrv','atlas-v-541','falcon-9','falcon-heavy','crew-dragon'];
const maritime=['pioneeringspirit','seawisegiant','ooclspain','azzam','octopussy','araho','viking90','alvin'];
const heritage=['little-willie','sherman-e8','f16','f22','f35','b52','uh60','mh6','ch47'];

// The request workflow follows its outstanding task. The delivery notes in
// priority-requests.js independently describe what the public site exposes.
const requestAssignments={
  'occlusion-report':['P0','done',all,'Regression checks cover hidden parts under solid panels, overlapping glass and bodywork, and the hover highlight.'],
  'compact-explosion':['P1','done',all,'Compact separation and an adjustable gap are available in the workbench.'],
  'complete-boxer':['P1','done',porsches,'Both Cabriolets show both cylinder banks and an optional engine cross-section.'],
  'inspection-motion':['P1','done',all,'Part selection, opening a study and restoring the prior inspection are available.'],
  'exploded-parts':['P1','done',all,'Individual part movement and return controls are available.'],
  'surface-order':['P1','todo',all,'Repeat checks on representative glass, wheel and panel views after the occlusion correction.'],
  'references':['P1','done',all,'Each vehicle links its reference ledger to the workbench.'],
  'model-validation':['P1','todo',all,'Each vehicle has an outstanding comparison with its source material.'],
  'brush-guards':['P2','done',['g500'],'The surround follows the early US guard, including its padded uprights and folding mounts.'],
  'rear-ladders':['P3','done',['g500','porsche993cab'],'The G500 has the documented ladder. The 993 Cabriolet has its own factory roof carrier.'],
  'raised-intakes':['P2','done',['g500'],'The ORC twin intake kit is listed for the W463 G500 V8.'],
  'driving-lights':['P2','done',['g500','porsche993cab'],'The catalog identifies the G500 hood brackets and lamps and the US 993 Litronic retrofit.'],
  'police-lights':['P3','done',['g500'],'The display bar is available as a G500 design mock-up.'],
  'lift-kits':['P2','done',['g500','porsche992scab'],'The builder offers the G500 spring kit and the optional 992 front-axle lift.'],
  'put-top-up':['P1','done',porsches,'Both Cabriolets have saved top-up and top-down positions.'],
  '325ci-dimensions':['P1','done',['bmw325ci'],'Measured against the early coupé drawing and BMW’s model 0334 US filing.'],
  'g500-dimensions':['P1','done',['g500'],'All six spans are measured from the stock vehicle geometry.'],
  'g-wagen':['P1','in-progress',['g500'],'Exterior dimensions and assembly layouts have been checked. The door jamb and gutter still need sections from an early US body.'],
  'porsche-pair':['P1','in-progress',porsches,'Compare the quarter panels and soft-top shapes with measured sections of the two variants.'],
  'road-variants':['P1','done',['bmw325ci','hrv','bmws1000rr'],'The collection has the requested road models and named variants.'],
  'car-interiors':['P2','todo',passenger,'Measure door trim, wiring routes and the floor layers against the documented variants.'],
  'road-engines':['P1','todo',road,'The F-350 engine and axle are decided: 7.5-litre V8, E4OD and Sterling 10.25 rear. Other road-engine and transmission studies are available for comparison.'],
  'vehicle-paint':['P2','done',road,'The paint picker, yellow finish and saved swatches are available.'],
  'accessories':['P2','todo',road,'Compare more selected equipment and wheel combinations with their published fitment listings.'],
  'all-vehicles':['P1','done',all,'The collection and type filters each have an All option.'],
  'aviation':['P1','todo',civilAircraft,'Check glazing and engines against the decided airframes: KLM PH-BFB, the early 172S, the museum’s 1940 J-5A and the three-area G800 cabin.'],
  'space':['P1','todo',space,'Apollo 15 cabin stowage and rover deployment have mission-specific comparisons outstanding.'],
  'maritime':['P1','todo',maritime,'The remaining checks concern machinery-space layouts and the equipment fitted to particular hulls.'],
  'heritage':['P2','todo',heritage,'The remaining comparisons concern visible exterior geometry in museum and manufacturer imagery.'],
  'dark-matter':['P2','done',[],'The paper, analysis and figures are published.'],
  'medical':['P2','done',[],'All three experiments have published held-out results.'],
  'narration':['P1','done',all,'Recorded explanations are available across the collection and research pages.'],
  'portfolio-writing':['P2','done',[],'The revised introduction and attribution are published.'],
  'pantry':['P3','done',[],'The expanded pantry and recipe suggestions are available.'],
  'project-priorities':['P1','done',all,'The board lists the project requests and a separate next check for each vehicle.']
};

const vehicleById=new Map(vehiclePriorities.map(v=>[v.id,v]));
const reviewVehicles=new Map(vehicleReviewTracks.map(v=>[v.id,v]));
function defaults(level,workflow,vehicleIds,reason){
  const domains=new Set(),types=new Set(),categories=new Map();
  for(const id of vehicleIds){
    const {domain,type}=vehicleById.get(id)||reviewVehicles.get(id);
    domains.add(domain);types.add(type);
    categories.set(domain+'/'+type,{domain,type});
  }
  return {level,workflow,reason,vehicleIds:[...vehicleIds],domains:[...domains],types:[...types],categories:[...categories.values()]};
}
export function trackingDefaults(kind,id){
  if(kind==='review'){
    const task=reviewTask(id);
    return task?defaults(task.level,task.workflow,[task.vehicleId],task.reason):null;
  }
  if(kind==='request'&&Object.hasOwn(requestAssignments,id))return defaults(...requestAssignments[id]);
  if(kind==='request'&&Object.hasOwn(additionalRequestAssignments,id))return defaults(...additionalRequestAssignments[id]);
  if(kind==='vehicle'&&Object.hasOwn(vehicleAssignments,id)){
    const [level,workflow,reason]=vehicleAssignments[id];
    return defaults(level,workflow,[id],reason||vehicleById.get(id).next);
  }
  return null;
}
