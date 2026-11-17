// Survey of every pair of installed G500 parts whose surfaces cross.
//   node tests/g500-overlap-survey.mjs           print the survey by class and system
//   node tests/g500-overlap-survey.mjs --write   rewrite tests/g500-overlap-baseline.json
//
// A crossing is not always an error: a hose ends inside its fitting, a spring
// sits in its seat, a piston is inside the block. Each pair is sorted by rule:
//
//   assembly  both parts belong to one system, or to two systems that are built
//             into one unit (the engine and its oil passages, the steering
//             column and its adjustment)
//   mount     a reviewed pair in `mounts` below: one part is carried by the other
//   terminal  a wire, hose or pipe meets the other part in places no longer than
//             60 mm: it ends there
//   through   a wire, hose or pipe runs through the other part, or through trim,
//             structure or running gear that has nothing to connect to
//   overlap   two solid parts from different systems occupy the same space
//
// `through` and `overlap` are the errors. The rules are a triage, not a proof:
// a pair can be moved by adding it to `mounts` or `errors` with a reason.
import {writeFileSync,readFileSync} from 'node:fs';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift,liftOptions} from '../garage/lift-options.js';
import {crossingPairs} from './mesh-proximity.mjs';

export const baselineFile=new URL('./g500-overlap-baseline.json',import.meta.url);
export const errorClasses=['through','overlap'];
const system=id=>id.split('.')[0];

// Wires, hoses and pipes.
const lines=new Set(['electrical.can-b','electrical.can-c','electrical.chassis-control-harness','electrical.comfort-harness','electrical.engine-harness',
  'electrical.lighting-harness','electrical.lock-circuit','electrical.main-feed','electrical.primary-power','electrical.rear-heater-circuit',
  'electrical.roof-circuit','electrical.engine-ground','cooling.heater-feed','cooling.heater-return','cooling.lower-hose','cooling.upper-hose',
  'cooling.bypass','hvac.refrigerant-lines','evap.purge-line','evap.tank-vent','evap.manifold-line','fuel.lines','transmission-fluid.left-line',
  'transmission-fluid.right-line','steering-assist.pressure-line','steering-assist.return-lines','brakes.hydraulics','roof.cable','roof.drainage']);
// Systems a line cannot end in: trim, structure and running gear.
const noPorts=new Set(['floor','body','suspension','wheels','steering']);
// Pairs of systems that are one unit.
const units=[['engine-oil','powertrain'],['column-adjustment','electrical.steering-column'],['column-adjustment','steering-assist.shaft']];
const within=(pattern,id)=>id===pattern||system(id)===pattern;
const unit=(a,b)=>units.some(([u,v])=>(within(u,a)&&within(v,b))||(within(u,b)&&within(v,a)));

// Reviewed pairs where one part is carried by, seated in or bolted to the other.
// Each entry is [part or system, part or system, reason].
export const mounts=[
  ...['electrical.cluster','electrical.dashboard','electrical.diff-lock-control','electrical.eis','electrical.upper-panel','electrical.steering-column',
    'seat-heating.front-switches'].map(id=>['body.dashboard',id,'instruments and switch panels are set into the dashboard']),
  ['body.dashboard','column-adjustment','the steering column passes through the dashboard'],
  ['body.dashboard','steering-assist.shaft','the steering shaft passes through the dashboard'],
  ['body.dashboard','hvac','the heater and air-conditioning unit sits inside the dashboard'],
  ['column-adjustment.door-switch','electrical.dashboard','the switch is set into the panel'],
  ['body.door','electrical.door-front-left','the door module is inside the door'],
  ['body.front-right','electrical.door-front-right','the door module is inside the door'],
  ['body.rear-left','electrical.door-rear-left','the door module is inside the door'],
  ['body.rear-right','electrical.door-rear-right','the door module is inside the door'],
  ['body.front-seats','electrical.seat-left','the seat module is inside the seat'],
  ['body.front-seats','electrical.seat-right','the seat module is inside the seat'],
  ['body.front-seats','seat-heating','the heating pads are inside the seats'],
  ['body.rear-bench','seat-heating','the heating pads are inside the bench'],
  ['body.structure','floor','the floor trim lies on the body floor'],
  ['body.front-seats','floor','the seat frames stand on the floor through the carpet'],
  ['body.rear-bench','floor','the bench stands on the floor through the carpet'],
  ['body.structure','lighting','the lamps are set into the body'],
  ['body.grille','lighting.housing','the headlamp housings meet the grille surround'],
  ['body.roof','roof.sunshade','the sunshade runs in the roof'],
  ['body.structure','suspension.frame','the body is bolted to the frame'],
  ...['tcm','transfer','yaw-sensor','srs-control','esm','sam-rear','tunnel','footwell','battery','battery-box','seat-left','seat-right']
    .map(id=>['electrical.'+id,'floor','the unit is fixed to the floor under the carpet']),
  ...['steering.axle','wheels.hub','wheels.inner-bearing','suspension.radius-arms','suspension.front-track-bar']
    .map(id=>['differentials.front',id,'the front axle carries it']),
  ...['suspension.rear-axle','wheels.hub','suspension.trailing-arms','suspension.rear-track-bar'].map(id=>['differentials.rear',id,'the rear axle carries it']),
  ['steering.axle','suspension.radius-arms','the radius arms bolt to the axle'],
  ['steering.axle','suspension.spring','the springs sit on the axle'],
  ['steering-assist.pitman','steering.linkage','the drag link hangs from the pitman arm'],
  ['suspension.rear-axle','wheels.hub','the hubs turn on the axle'],
  ['suspension.rear-axle','wheels.caliper','the caliper brackets are on the axle'],
  ['differentials.center','drivetrain.input-shaft','the shaft enters the transfer case'],
  ['intake.intake','powertrain.head','the manifold bolts to the heads'],
  ['exhaust.manifold-left','powertrain.head','the manifold bolts to the head'],
  ['exhaust.manifold-right','powertrain.head','the manifold bolts to the head'],
  ['cooling.thermostat','powertrain.timing-drive','the housing bolts to the front cover'],
  ['cooling.water-pump','powertrain.timing-drive','the pump bolts to the front cover'],
  ['cooling.water-pump','powertrain.belt','the belt turns the pump pulley'],
  ['steering-assist.steering-box','suspension.frame','the steering box bolts to the frame'],
  ['electrical.can-b','electrical.can-b-connectors','the bus runs through its connectors'],
  ['electrical.battery-box','electrical.primary-power','the cable starts at the prefuse inside the box'],
  ['electrical.ecu','electrical.engine-harness','the harness plugs run along the control unit'],
  ['electrical.comfort-harness','electrical.seat-right','the harness ends inside the seat module'],
  ['hvac.compressor','hvac.refrigerant-lines','the lines end at the compressor'],
  ['hvac.drier','hvac.refrigerant-lines','the lines end at the drier'],
  ['cooling.heater-pump','cooling.heater-return','the pump sits in the return hose'],
  ['steering-assist.return-lines','steering-assist.steering-box','the return line ends at the steering box'],
  ['roof.cable','roof.cassette','the cables run inside the cassette'],
  ['body.roof','roof.cable','the cables run inside the roof'],
  ['body.roof','roof.drainage','the drain tubes run inside the roof and pillars'],
  ['transmission-fluid.brackets','hvac.condenser','the transmission cooler brackets bolt to the condenser side tanks'],
  ['body.structure','fuel.filler','the filler neck passes through its sealed opening in the right rear quarter'],
  ['evap.tank-pressure','fuel.tank','the pressure sensor is set into the tank top'],
  ['body.structure','suspension.damper','each damper top mounts through the inner wheelhouse'],
  ['body.structure','steering-assist.shaft','the steering shaft passes through its grommet in the bulkhead'],
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

// The errors, split into sets that can each be worked as one job.
export const areas={
  wiring:'Cabin and body wiring',
  lines:'Hoses and pipes',
  cabin:'Dashboard and cabin packaging',
  underbody:'Body and floor against the running gear',
  chassis:'Engine bay and chassis',
};
const cabinSystems=new Set(['body','floor','electrical','hvac','column-adjustment','seat-heating','roof']);
export function area(pair){
  const {a,b}=pair,wire=id=>lines.has(id)&&system(id)==='electrical';
  if(wire(a)||wire(b))return 'wiring';
  if(pair.class==='through')return 'lines';
  if(cabinSystems.has(system(a))&&cabinSystems.has(system(b)))return 'cabin';
  return ['body','floor'].includes(system(a))||['body','floor'].includes(system(b))?'underbody':'chassis';
}

export function survey(){
  const found=new Map(),poses=liftOptions('g500').map(o=>o.id);
  for(const mode of poses){
    const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver',lift:normalizedLift('g500',{mode})},
      inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
    r.buildMesh();
    for(const pair of crossingPairs(r.faces)){
      const key=pair.a+' + '+pair.b,seen=found.get(key);
      // A pair that crosses at both heights keeps its longer span.
      if(seen){seen.poses.push(mode);seen.span=Math.max(seen.span,pair.span);seen.crossings=Math.max(seen.crossings,pair.crossings);}
      else found.set(key,{a:pair.a,b:pair.b,crossings:pair.crossings,span:pair.span,poses:[mode]});
    }
  }
  return [...found.values()].map(p=>({...p,class:classify(p)})).sort((u,v)=>u.a.localeCompare(v.a)||u.b.localeCompare(v.b));
}
export const baseline=()=>JSON.parse(readFileSync(baselineFile,'utf8'));
export const record=pairs=>Object.fromEntries(pairs.map(p=>[p.a+' + '+p.b,p.class+(p.poses.length===2?'':' · '+p.poses[0])]));

if(import.meta.url===`file://${process.argv[1]}`){
  const pairs=survey();
  if(process.argv.includes('--write')){
    writeFileSync(baselineFile,JSON.stringify(record(pairs),null,1)+'\n');
    console.log(`wrote ${pairs.length} pairs`);
  }
  const count=c=>pairs.filter(p=>p.class===c).length;
  console.log(`${pairs.length} crossing pairs: `+['assembly','mount','terminal','through','overlap'].map(c=>`${count(c)} ${c}`).join(', '));
  for(const [key,title] of Object.entries(areas)){
    const list=pairs.filter(p=>errorClasses.includes(p.class)&&area(p)===key);
    console.log(`\n${title} (${list.length})`);
    for(const p of list)console.log(`  ${p.class.padEnd(8)} ${p.a} + ${p.b}  ${p.crossings} crossings, ${Math.round(p.span*1000)} mm${p.poses.length===2?'':' · '+p.poses[0]+' only'}`);
  }
}
