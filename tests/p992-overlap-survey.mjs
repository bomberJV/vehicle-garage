// Survey of every pair of installed 2023 911 Carrera S Cabriolet (992.1) parts whose
// surfaces cross. Same rules as tests/g500-overlap-survey.mjs:
//   node tests/p992-overlap-survey.mjs           print the survey by class
//   node tests/p992-overlap-survey.mjs --write   rewrite tests/p992-overlap-baseline.json
//
//   assembly  both parts belong to one system, or to systems built as one unit
//   mount     a reviewed pair in `mounts` below: one part is carried by the other
//   terminal  a wire, hose or pipe meets the other part over no more than 60 mm
//   through   a wire, hose or pipe runs through the other part, or through trim,
//             structure or running gear that it cannot connect to
//   overlap   two solid parts from different systems occupy the same space
//
// `through` and `overlap` are the errors.
import {writeFileSync,readFileSync} from 'node:fs';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift,liftOptions} from '../garage/lift-options.js';
import {crossingPairs} from './mesh-proximity.mjs';

export const vehicle='porsche992scab';
export const baselineFile=new URL('./p992-overlap-baseline.json',import.meta.url);
export const errorClasses=['through','overlap'];
const system=id=>id.split('.')[0];

// Wires, hoses, pipes and ducts.
export const lines=new Set(['brakes.lines','electrical.cables','fuel.supply',
  'p992-coolant.feed','p992-coolant.return','p992-coolant.heater-feed',
  'p992-hvac.discharge','p992-hvac.suction','p992-hvac.bridge','p992-hvac.metering',
  'p992-clutch.line','p992-seats.leads','p992-intake.inlet-left','p992-intake.inlet-right']);
// Systems a line cannot end in: trim, structure and running gear.
const noPorts=new Set(['floor','shell','running','cabin','roof']);
// Pairs of systems that are one unit.
const units=[['engine','fuel.rail']];
const within=(pattern,id)=>id===pattern||system(id)===pattern;
const unit=(a,b)=>units.some(([u,v])=>(within(u,a)&&within(v,b))||(within(u,b)&&within(v,a)));

// Reviewed pairs where one part is carried by, seated in or bolted to the other.
export const mounts=[
  ['lights','shell','the lamps are set into the wings, bumpers and lid'],
  ['p992-markers','shell','each side marker is set into its opening in the front bumper corner'],
  ['brakes.abs','brakes.lines','the brake lines leave the ports of the PSM hydraulic unit'],
  ['brakes.lines','shell.fenders','each hard line ends at a bracket on the inner wing, where its hose passes through to the caliper'],
  ['brakes.master','p992-clutch.master','the clutch master cylinder is fed from the brake-fluid reservoir through its own hose'],
  ['fuel.supply','fuel.sender','the supply line leaves the delivery flange on top of the tank'],
  ['cabin.controls','floor','the centre console is screwed to the tunnel through the carpet'],
  ['drivetrain.halfshafts','shell.fenders','each half-shaft passes through the opening in the inner wheel housing to its hub; the housing wall is drawn closed'],
  ['engine.exhaust','shell.bumpers','each tailpipe leaves through its opening in the rear apron; the apron is drawn without the cut-out'],
  // The inner wheel-housing wall is drawn as a closed flat disc at |y| 0.535;
  // on the car the struts, links and tie rods reach the wheel through the
  // housing's open lower edge and the strut towers.
  ...['p992-suspension.front-strut','p992-suspension.front-arms','p992-suspension.rear-damper','p992-suspension.upper-front','p992-suspension.upper-rear','p992-suspension.lower','p992-suspension.longitudinal','p992-suspension.toe','p992-steering.tie']
    .flatMap(id=>['left','right'].map(hand=>[id+'-'+hand,'shell.fenders','it reaches the wheel through the open wheel housing; the housing wall is drawn as a closed disc'])),
  ['p992-steering.column','cabin.controls','the column passes through the facia below the instruments to the wheel'],
  ...['left','right'].map(hand=>['p992-intake.inlet-'+hand,'p992-intake.filter-'+hand,'the duct is clamped onto the airbox outlet']),
  ['p992-coolant.feed','engine.cooling','each radiator hose is clamped onto the inlet spigot of its corner radiator'],
  ['p992-seats.leads','cabin.seats','the heating-mat leads leave the cushion and backrest through the seat base to the connector beneath it'],
  ['roof','shell.deck','the folded top lies in its compartment behind the seats; the deck surface is drawn closed across the compartment opening'],
];
// Reviewed pairs that the rules would pass but are wrong.
export const errors=[];
const listed=(list,a,b)=>list.find(([u,v])=>(within(u,a)&&within(v,b))||(within(u,b)&&within(v,a)));

export function classify({a,b,span}){
  const wrong=listed(errors,a,b);if(wrong)return lines.has(a)||lines.has(b)?'through':'overlap';
  if(listed(mounts,a,b))return 'mount';
  if(unit(a,b))return 'assembly';
  const la=lines.has(a),lb=lines.has(b);
  if(la||lb){
    if(la&&lb)return system(a)===system(b)?'assembly':'through';
    const other=la?b:a,line=la?a:b;
    if(noPorts.has(system(other))&&system(other)!==system(line))return 'through';
    return span<=.060?'terminal':'through';
  }
  return system(a)===system(b)?'assembly':'overlap';
}

export function survey(){
  const found=new Map();let poses=[];
  try{poses=liftOptions(vehicle).map(o=>o.id);}catch{}
  if(!poses.length)poses=[undefined];
  for(const mode of poses){
    const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'olive',finish:'silver',lift:normalizedLift(vehicle,{mode})},
      inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
    r.buildMesh();
    for(const pair of crossingPairs(r.faces)){
      const key=pair.a+' + '+pair.b,seen=found.get(key);
      if(seen){seen.poses.push(mode);seen.span=Math.max(seen.span,pair.span);seen.crossings=Math.max(seen.crossings,pair.crossings);}
      else found.set(key,{a:pair.a,b:pair.b,crossings:pair.crossings,span:pair.span,poses:[mode]});
    }
  }
  survey.poses=poses;
  return [...found.values()].map(p=>({...p,class:classify(p)})).sort((u,v)=>u.a.localeCompare(v.a)||u.b.localeCompare(v.b));
}
export const baseline=()=>JSON.parse(readFileSync(baselineFile,'utf8'));
export const record=pairs=>Object.fromEntries(pairs.map(p=>[p.a+' + '+p.b,p.class]));

if(import.meta.url===`file://${process.argv[1]}`){
  const pairs=survey();
  if(process.argv.includes('--write')){
    writeFileSync(baselineFile,JSON.stringify(record(pairs),null,1)+'\n');
    console.log(`wrote ${pairs.length} pairs`);
  }
  const count=c=>pairs.filter(p=>p.class===c).length;
  console.log(`${pairs.length} crossing pairs: `+['assembly','mount','terminal','through','overlap'].map(c=>`${count(c)} ${c}`).join(', '));
  if(!process.argv.includes('--quiet'))for(const p of pairs.filter(p=>errorClasses.includes(p.class)||process.argv.includes('--all')))
    console.log(`  ${p.class.padEnd(8)} ${p.a} + ${p.b}  ${p.crossings} crossings, ${Math.round(p.span*1000)} mm`);
}
