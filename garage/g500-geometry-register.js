import {getAssemblies} from './assemblies.js';
import {installedPartId} from './installed-part.js';
import {getDetail} from './detail-catalog.js';
import {FIELD_ACCESSORIES} from './accessory-catalog.js';
import {catalogGaps,catalogPlates} from './g500-catalog-gaps.js';
import body,{gaps as bodyGaps} from './g500-evidence-body.js';
import engine,{gaps as engineGaps} from './g500-evidence-engine.js';
import drive,{gaps as driveGaps} from './g500-evidence-drive.js';
import chassis,{gaps as chassisGaps} from './g500-evidence-chassis.js';
import cabin,{gaps as cabinGaps} from './g500-evidence-cabin.js';
import electrical,{gaps as electricalGaps} from './g500-evidence-electrical.js';

export const basisLabels={
  cadDrawing:'Manufacturer CAD drawing',dimensioned:'Published dimensions',diagram:'Factory or supplier diagram',scan:'Measured scan',cad:'Manufacturer CAD',
  measured:'Measured part',estimate:'Estimated shape',missing:'Open vehicle coverage',plate:'Catalog group review'
};
import installedChecks from './g500-evidence-installed.js';
const sources=[...body,...engine,...drive,...chassis,...cabin,...electrical,...installedChecks];
const byPart=new Map();
for(const claim of sources){
  for(const id of claim.ids){
    if(!byPart.has(id))byPart.set(id,[]);
    byPart.get(id).push(claim);
  }
}
const groupNeeds={
  wheels:'Check the fitted wheel specification, hub offsets and mating sections against a wheel-end drawing.',
  lighting:'Measure the housing, lens, mounting tabs and connector against the exact US-market lamp.',
  powertrain:'Match the M113.962 part number and check its cross-sections and mating faces against a drawing or measured part.',
  differentials:'Identify the axle variant and obtain dimensioned sections of its housing, gears and lock interfaces.',
  accessories:'Confirm the fitted accessory SKU and measure the brackets and clearances on an early W463.',
  roof:'Check the cassette, drive and attachment locations on an early long-wheelbase G500.',
  brakes:'Confirm the axle variant and measure the friction hardware and mounting interfaces.',
  fuel:'Check the tank-side mounting and line interfaces against this vehicle’s fuel-system variant.',
  electrical:'Identify the connector and equipment variant and check its housing, pin positions and installation.',
  exhaust:'Trace both banks under the vehicle and measure the bends, flanges and hanger positions.',
  intake:'Check the air-path section, mounting points and joints against the matching intake assembly.',
  cooling:'Measure the mating faces, mounting positions and coolant-line runs in the installed vehicle.',
  hvac:'Check the HVAC case sections, line interfaces and mounts for the US left-hand-drive vehicle.',
  'seat-heating':'Verify pad outlines, wire exits and attachment points for the installed seat trim.',
  'column-adjustment':'Check the reach and tilt mechanisms against a section of the fitted steering column.',
  'steering-assist':'Confirm the steering gear variant, port geometry and installed hydraulic lines.',
  'engine-oil':'Check the part profile and oil passages against a section of the M113.962 installation.',
  'transmission-fluid':'Check the cooler and valve-body interfaces for the fitted automatic transmission.',
  evap:'Trace the US fuel-vapor lines and measure the canister, valves and bracket mounts.',
  drivetrain:'Match the transmission or transfer-case variant and measure its mounting and driveline interfaces.',
  floor:'Check the floor contour, trim thickness and seat anchorage against the early US cabin.',
  steering:'Measure the steering pivots, linkage and wheel-end interfaces on the fitted axle.',
  suspension:'Check the frame datums, brackets, spring and damper mounts against a matching chassis drawing.',
  body:'Obtain a matched panel section or scan and check the flange, curvature and attachment points.'
};
// Name the missing measurement for repeated hardware in the nested studies.
const missingMeasurements=[
  [/\b(harness|loom|wiring|lead wire|ground strap)\b/i,'Trace the installed route, branch lengths, clips and connector ends on the matched vehicle.'],
  [/\b(hose|pipe|tube|line)\b/i,'Check the installed centerline, bend radii, bore, end fittings and clip positions.'],
  [/\b(seal|gasket|o-ring|weatherstrip)\b/i,'Measure the seal section and mating groove, including how the seal seats when assembled.'],
  [/\b(shaft|crankshaft|camshaft|spindle)\b/i,'Obtain an axial section showing the journals, shoulders, drive interfaces and installed end positions.'],
  [/\b(bolt|screw|stud|nut|washer|retainer|clip|rivet)\b/i,'Identify the fastener on the matching plate and check its size, head or clip profile and mounting position.'],
  [/\b(bearing|bush|bushing|race)\b/i,'Identify the installed item and check its bore, outside profile, width and seating surfaces.'],
  [/\b(gear|pinion|sprocket|pulley)\b/i,'Measure the bore, tooth or groove geometry, axial position and mating drive.'],
  [/\b(foam|carpet|upholstery|headlining|headliner)\b/i,'Measure the trim perimeter, thickness, attachment features and underlying contour on the fitted interior.'],
  [/\b(spring|coil spring)\b/i,'Check the spring section, free and installed lengths, winding and ends against the fitted variant.'],
  [/\b(hinge|hinges)\b/i,'Measure the pivot axis, pin and leaf sections, attachment holes and opening range.'],
  [/\b(connector|socket|plug housing)\b/i,'Match the connector code and check keying, terminal pitch, cavity depths and retention features.'],
  [/\b(pump|motor|actuator)\b/i,'Identify the fitted unit and obtain a drawing of its moving elements, housing, mounting and connections.'],
  [/\b(lens|reflector)\b/i,'Check a section of the correct lamp for curvature, thickness and locating tabs.']
];
function missingFor(part,group){
  return missingMeasurements.find(([pattern])=>pattern.test(part.name))?.[1]||groupNeeds[group];
}
const estimateFact='The shape is an estimate. The part reference identifies the assembly or provides context.';
const gapsByGroup=[
 ['configuration','Vehicle identification and equipment',[
   'Match the vehicle data card to the market, production date, axle codes, upholstery and option codes.',
   'Reconcile the vehicle-specific Mercedes parts list against the modeled inventory, including clips, seals and fasteners.'
 ]],
 ['body','Body panels & glazing',bodyGaps],['powertrain','Engine bay',engineGaps],
 ['drivetrain','Drivetrain & exhaust',driveGaps],['suspension','Chassis & wheel ends',chassisGaps],
 ['floor','Cabin, closures & climate',cabinGaps],['electrical','Electrical & lighting',electricalGaps],
 ['catalog','Other catalog systems',catalogGaps],
 ['accessories','Optional equipment',[
   'Check the selected roof rack’s feet, clamps and gutter contact against a dimensioned mounting drawing.',
   'Check aftermarket rim barrel sections, offsets and caliper clearance for each previewed wheel.',
   'Verify the selected lift kit’s part numbers, installed heights and suspension clearances.'
 ]]
];
const optionalIds=FIELD_ACCESSORIES.filter(a=>a.vehicles.includes('g500')).map(a=>a.id);
let cached;
export function g500Geometry(){
  if(cached)return cached;
  const parts=new Map(),studies=new Set(),rows=[],pending=[];
  const add=(p,group,path,reference)=>{
    if(parts.has(p.id))return;
    const claims=byPart.get(p.id)||[],source=p.source||reference;
    const row={id:p.id,title:p.name,group:group.id,groupName:group.name,path,claims,source,
      kind:claims[0]?.kind||'estimate',fact:claims[0]?.fact||estimateFact,
      need:claims[0]?.need||missingFor(p,group.id),level:group.id==='accessories'?'P3':claims.length?'P1':'P2',workflow:'todo'};
    parts.set(p.id,row);rows.push(row);pending.push({p,group,path});
  };
  // Register installed parts first, so their links take the shortest path.
  for(const group of getAssemblies('g500',optionalIds))for(const p of group.parts)add(p,group,[],group.source);
  for(let i=0;i<pending.length;i++){
    const {p,group,path}=pending[i],study=getDetail('g500',p.id);
    if(!study||studies.has(study.id))continue;
    studies.add(study.id);
    for(const child of study.componentIndex.values())add(child,group,[...path,p.id],study.source||group.source);
  }
  const modeled=rows.length;
  for(const [group,groupName,gaps] of gapsByGroup){
    for(const gap of gaps){
      const title=typeof gap==='string'?gap:gap.title;
      const slug=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
      const id='gap.'+group+'.'+slug;
      rows.push({id,title,group,groupName,kind:'missing',claims:[],fact:'',need:typeof gap==='string'?'':gap.need,source:gap.source,
        level:group==='accessories'?'P3':'P1',workflow:'todo'});
    }
  }
  const coverageGaps=rows.length-modeled;
  const linkedGroups=new Map();
  const sourcePath=url=>url?.split(/[?#]/)[0].replace(/\/$/,'');
  for(const row of parts.values()){
    const urls=new Set([row.source?.url,...row.claims.map(c=>c.source.url)].map(sourcePath).filter(Boolean));
    for(const url of urls){
      if(!linkedGroups.has(url))linkedGroups.set(url,[]);
      linkedGroups.get(url).push(row);
    }
  }
  for(const plate of catalogPlates){
    const id='plate.'+new URL(plate.source.url).pathname.split('/').filter(Boolean).at(-1);
    rows.push({id,title:plate.title,group:'catalog-index',groupName:'Mercedes parts catalog · '+plate.family,
      kind:'plate',claims:[],source:plate.source,related:linkedGroups.get(sourcePath(plate.source.url))||[],fact:'',level:'P2',workflow:'todo',
      need:'Match each numbered callout to a modeled component or record what is missing. Check equipment and production-code applicability.'});
  }
  return cached={parts,rows,modeled,coverageGaps,plates:catalogPlates.length,studies:studies.size,checked:[...parts.values()].filter(p=>p.claims.length).length};
}
export function geometryBoardLink(id){
  const url=new URLSearchParams({vehicle:'g500'});if(id)url.set('q',id);
  return './priorities.html?'+url+'#g500-geometry';
}
export function geometryWorkshopLink(row){
  if(row.kind==='missing'||row.kind==='plate')return null;
  const params=new URLSearchParams({vehicle:'g500'});
  if(row.group==='accessories')params.set('tool','customize');
  else{
    // A selection in the assembled vehicle must preserve the surrounding geometry.
    if(row.path.length||installedPartId('g500',row.id)!==row.id)params.set('assembly',row.group);
    for(const parent of row.path)params.append('open',parent);
    params.set('part',row.id);
  }
  return './index.html?'+params+'#workbench';
}
