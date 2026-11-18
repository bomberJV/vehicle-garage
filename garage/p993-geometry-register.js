// Parts register for the 1998 911 Carrera Cabriolet (993), hub #232.
// One row per installed part and per component of its detail studies, with
// the evidence behind its shape. The G500 equivalent is g500-geometry-register.js.
import {getAssemblies} from './assemblies.js';
import {getDetail} from './detail-catalog.js';
import {m64} from './porsche-boxer-layout.js';
import {dimensionSources} from './porsche993-dimensions.js';
import {refs} from './porsche993-sources.js';

export const basisLabels={
 diagram:'Factory or supplier diagram',dimensioned:'Published dimensions, checked by a test',
 documented:'Workshop or owner description',estimate:'Estimated shape'
};
// A source is a catalogue or factory diagram when it is a parts-catalogue
// plate, a Porsche technical information or training document.
const diagramSource=url=>/kat017|eurospares\.co\.uk\/Porsche\/993|9xx-parts\.com|design911\.co\.uk\/(diagrams|porsche\/993)|static\.nhtsa\.gov\/odi\/tsbs|club911\.net|d911api|newsroom\.porsche\.com|files\.porsche\.com/.test(url||'');
const isCatalogue=url=>/kat017|eurospares\.co\.uk\/Porsche\/993|9xx-parts\.com/.test(url||'');

// Claims backed by the 993 tests rather than by a part's own source.
export const testedClaims=[
 {ids:['engine.cylinders','engine.case','engine.crankshaft','engine.heads'],kind:'dimensioned',source:m64.pitchSource,
  fact:'Cylinder pitch 118 mm, bank offset 59 mm, bore 100 mm and stroke 76.4 mm are measured from the mesh by garage-p993-engine-layout.'},
 {ids:['drivetrain.clutch','drivetrain.gearbox','drivetrain.rear-differential','drivetrain.halfshafts','drive.gearbox','drive.axles'],kind:'dimensioned',source:m64.source,
  fact:'The final drive sits on the axle line, the flywheel 150 mm behind it and the gearbox on the crank axis (garage-p993-engine-layout).'},
 {ids:['running.tires','running.rims'],kind:'dimensioned',source:dimensionSources.tyres,
  fact:'205/55 ZR16 front and 245/45 ZR16 rear: section width and outside diameter are checked by garage-p993-factory-dimensions.'},
 {ids:['shell.fenders','shell.bumpers'],kind:'dimensioned',source:dimensionSources.spec,
  fact:'Body width 1,735 mm and overall length (4,260 mm against 4,245, recorded) are checked by garage-p993-factory-dimensions.'},
 {ids:['lights.headlamps'],kind:'diagram',source:refs.fog,fact:'The headlamp units follow the 905-00 headlamp and fog-lamp plate.'}
];
const claimsFor=new Map();
for(const c of testedClaims)for(const id of c.ids){if(!claimsFor.has(id))claimsFor.set(id,[]);claimsFor.get(id).push(c);}

let cached;
export function p993Geometry(){
 if(cached)return cached;
 const rows=new Map(),studies=new Set();
 const add=(p,group,path,study)=>{
  if(rows.has(p.id))return;
  const claims=[...(claimsFor.get(p.id)||[])];
  if(p.source?.url)claims.unshift({kind:diagramSource(p.source.url)?'diagram':'documented',source:p.source,fact:'The part cites its own source.'});
  // A component drawn from a catalogue plate study is a callout on that plate.
  else if(study&&isCatalogue(study.source?.url))claims.push({kind:'diagram',source:study.source,fact:`A callout on the plate behind the "${study.name}" study.`});
  rows.set(p.id,{id:p.id,title:p.name,group:group.id,groupName:group.name,path,claims,kind:claims[0]?.kind||'estimate',
   source:p.source||study?.source||group.source});
  const detail=getDetail('porsche993cab',p.id);
  if(!detail||studies.has(detail.id))return;
  studies.add(detail.id);
  for(const child of detail.componentIndex.values())add(child,group,[...path,p.id],detail);
 };
 for(const group of getAssemblies('porsche993cab',[]))for(const p of group.parts)add(p,group,[],null);
 const list=[...rows.values()],sourced=list.filter(r=>r.claims.length).length;
 return cached={rows:list,byId:rows,studies:studies.size,sourced,share:sourced/list.length};
}
