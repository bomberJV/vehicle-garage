// Survey of every pair of installed 1998 911 Carrera Cabriolet (993) parts whose
// surfaces cross. Same rules as tests/g500-overlap-survey.mjs:
//   node tests/p993-overlap-survey.mjs           print the survey by class
//   node tests/p993-overlap-survey.mjs --write   rewrite tests/p993-overlap-baseline.json
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

export const vehicle='porsche993cab';
export const baselineFile=new URL('./p993-overlap-baseline.json',import.meta.url);
export const errorClasses=['through','overlap'];
const system=id=>id.split('.')[0];

// Wires, hoses, pipes and ducts.
export const lines=new Set(['993-steering.lines','993-climate.lines','993-climate.supply','993-lubrication.outbound','993-lubrication.return',
  '993-lubrication.connections','brakes.lines','electrical.cables','fuel.supply']);
// Systems a line cannot end in: trim, structure and running gear.
const noPorts=new Set(['floor','shell','running','cabin','roof']);
// Pairs of systems that are one unit.
const units=[['engine','993-lubrication'],['engine','fuel.rail']];
const within=(pattern,id)=>id===pattern||system(id)===pattern;
const unit=(a,b)=>units.some(([u,v])=>(within(u,a)&&within(v,b))||(within(u,b)&&within(v,a)));

// Reviewed pairs where one part is carried by, seated in or bolted to the other.
export const mounts=[
  ['lights','shell','the lamps are set into the wings, bumpers and lid'],
  ['993-climate.lines','993-climate.condenser','the refrigerant lines end at the condenser headers'],
  ['993-lubrication.connections','993-lubrication.tank','the feed and filler lines leave the tank ports'],
  ['993-lubrication.connections','993-lubrication.thermostat','the return line from the engine enters the thermostat housing'],
  ['993-lubrication.connections','993-lubrication.filter','the return line ends at the thermostat and filter block, which share one bracket'],
  ['993-lubrication.outbound','993-lubrication.thermostat','the cooler supply pipe leaves the thermostat housing'],
  ['993-lubrication.connections','shell.fenders','the filler hose passes through its grommet in the right rear inner wing'],
  ['brakes.abs','brakes.lines','the brake lines leave the ports of the ABS hydraulic unit'],
  ['brakes.lines','shell.fenders','each hard line ends at a bracket on the inner wing, where its hose passes through to the caliper'],
  ['cabin.controls','floor','the centre console is screwed to the tunnel through the carpet'],
  ['fuel.filler','shell.fenders','the filler neck passes through its sealed opening in the left front inner wing'],
  ['993-climate.exchanger-left','engine.exhaust','the three primaries of each bank run through its heat-exchanger jacket'],
  ['993-climate.exchanger-right','engine.exhaust','the three primaries of each bank run through its heat-exchanger jacket'],
  ['drivetrain.halfshafts','shell.fenders','each half-shaft passes through the opening in the inner wheel housing to its hub; the housing wall is drawn closed'],
  ['engine.exhaust','shell.bumpers','each tailpipe leaves through its opening in the rear apron; the apron is drawn without the cut-out'],
  // Chassis (round 3). The inner wheel-housing wall is drawn as a closed
  // flat disc at |y| 0.535; on the car the arms, links and struts reach the
  // wheel through the housing's open lower edge and the strut towers.
  ...['993-suspension.front-strut','993-suspension.front-arm','993-suspension.rear-strut','993-suspension.rear-lower-arm','993-suspension.rear-upper-arm','993-suspension.rear-toe-link','993-steering.tie-rod']
    .flatMap(id=>['left','right'].map(hand=>[id+'-'+hand,'shell.fenders','it reaches the wheel through the open wheel housing; the housing wall is drawn as a closed disc'])),
  ...['left','right'].flatMap(hand=>[
    ['993-suspension.front-hub-'+hand,'brakes.front-disc','the disc is bolted to the hub flange'],
    ['993-suspension.rear-hub-'+hand,'brakes.rear-disc','the disc is bolted to the hub flange'],
    ['993-suspension.rear-hub-'+hand,'brakes.parking','the parking-brake drum is the disc hat around the hub'],
    ['993-suspension.rear-hub-'+hand,'drivetrain.halfshafts','the drive shaft\'s outer joint is splined into the hub'],
    ['993-suspension.rear-carrier-'+hand,'drivetrain.halfshafts','the drive shaft passes through the wheel carrier into the hub bearing'],
    ['993-steering.tie-rod-'+hand,'993-suspension.front-carrier-'+hand,'the tie-rod ball joint is bolted into the carrier\'s steering arm']
  ]),
  ['993-steering.column','cabin.controls','the column passes through the facia below the instruments to the wheel'],
  ['993-steering.column','floor.pan','the intermediate shaft passes through its grommet in the toe board'],
  ['993-steering.column','floor.carpet','the intermediate shaft passes through its grommet in the toe board'],
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
