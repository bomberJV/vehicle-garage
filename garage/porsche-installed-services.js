// The standalone fleet illustration still supports its compact road-model
// contract. The interactive workbench installs the full floor, brakes and
// driveline once, retaining the earlier assembly names when opened directly.
import {drawCabinFloor} from './floor-trim.js';
import {drawRoadDrivetrain} from './road-mechanisms.js';
import {drawRoadServiceAssembly} from './road-service-systems.js';
import {drawPorscheInstalledRoof} from './porsche-installed-roof.js';

const proxyParts=new Set(['cabin.carpet','running.brakes','drive.gearbox','drive.axles']);
const serviceAlias={
 'drivetrain.gearbox':'drive.gearbox','drivetrain.clutch':'drive.gearbox','drivetrain.rear-differential':'drive.gearbox','drivetrain.halfshafts':'drive.axles',
 'brakes.front-disc':'running.brakes','brakes.rear-disc':'running.brakes','brakes.front-caliper':'running.brakes','brakes.rear-caliper':'running.brakes'
};
export const isWorkbenchPorsche=vehicle=>vehicle==='porsche992scab'||vehicle==='porsche993cab';
export function drawPorscheInstalledServices(r,vehicle,assembly){
 // Remove the compact floor, hub brakes, transmission and shaft substitutes
 // before the full installed meshes take their places. The roof uses the
 // existing body surfaces and therefore retains their original geometry.
 r.faces=r.faces.filter(f=>!proxyParts.has(f.part));
 drawPorscheInstalledRoof(r,vehicle);
 const start=r.faces.length;
 drawCabinFloor(r,vehicle);
 drawRoadDrivetrain(r,vehicle);
 drawRoadServiceAssembly(r,vehicle,'brakes');
 if(!['drive','running','cabin'].includes(assembly))return;
 for(let i=start;i<r.faces.length;i++){
  const face=r.faces[i],id=face.part;
  const alias=assembly==='cabin'&&id.startsWith('floor.')?'cabin.carpet':serviceAlias[id];
  if(alias?.startsWith(assembly+'.'))face.part=alias;
 }
}
