import {transferOutputX,axleInputX} from './g500-propeller-shafts.js';
import {g500HalfWheelbase} from './g500-underbody.js';
import {chassisLiftWeight} from './g500-chassis-hardware.js';
import {liftChoice,normalizedLift,liftOptions} from './lift-options.js';

const clamp=n=>Math.max(0,Math.min(1,n));
const fixedG=new Set(['steering.axle','steering.linkage','suspension.rear-axle','differentials.front','differentials.rear','drivetrain.front-differential','drivetrain.rear-differential','drivetrain.halfshafts']);
function movementWeight(vehicle,id,p,instance){
 const [xx,yy,zz]=p;
 if(id.startsWith('wheels.')||id.startsWith('running.'))return 0;
 if(id.startsWith('brakes.') && /\.(?:front|rear|parking)/.test(id))return 0;
 if(vehicle==='g500'){
  // The steering box and pitman arm rise with the chassis. The far drag-link
  // stud and the tie rod follow the rigid front axle at wheel height.
  if(id==='steering.linkage'&&instance==='drag-link')return clamp((.622-yy)/(.622+.530));
  if(fixedG.has(id))return 0;
  if(id.startsWith('chassis.'))return chassisLiftWeight(id.slice(8),p);
  if(id==='suspension.radius-arms'||id==='suspension.trailing-arms')return clamp((1.425-Math.abs(xx)-.13)/(.83-.13));
  if(id==='suspension.front-track-bar'||id==='suspension.rear-track-bar')return clamp((zz-(.4276+.060))/(.609-(.4276+.060)));
  if(id==='suspension.spring')return clamp((zz-.47)/.39);
  if(id==='suspension.damper')return clamp((zz-.43)/.47);
  if(['differentials.rear-shaft','drivetrain.propshaft','differentials.front-shaft','drivetrain.front-shaft'].includes(id)){
   const front=id.endsWith('front-shaft'),axle=axleInputX(front,g500HalfWheelbase);
   return clamp((xx-axle)/(transferOutputX(front)-axle));
  }
 }else if(id==='drive.axles'||id==='drivetrain.halfshafts'){
  // The differential follows the transaxle. The outer CV joint stays at the hub.
  const [inner,outer]=[.14,vehicle==='porsche992scab'?.778:.722];
  return clamp((outer-Math.abs(yy))/(outer-inner));
 }
 return 1;
}
export function applySuspensionLift(faces,build){
 const lift=normalizedLift(build.vehicle,build.lift);
 if(!lift.mm)return faces;
 const frontOnly=Boolean(liftChoice(build.vehicle,lift.mode).frontOnly),rise=lift.mm/1000;
 // Rigid pitch about the rear axle lifts the sprung nose while leaving the rear axle station fixed.
 const rearX=1.25,rearZ=.352+.006,wheelbase=2.45,angle=frontOnly?Math.asin(rise/wheelbase):0;
 const sin=Math.sin(angle),cos=Math.cos(angle);
 return faces.map(f=>{
  const xyz=f.points.map(p=>{
   const w=movementWeight(build.vehicle,f.part||'',p,f.instance);if(!w)return p;
   if(!frontOnly)return [p[0],p[1],p[2]+rise*w];
   const dx=p[0]-rearX,dz=p[2]-rearZ;
   return [p[0]+((cos-1)*dx+sin*dz)*w,p[1],p[2]+(-sin*dx+(cos-1)*dz)*w];
  });
  return xyz.every((p,i)=>p===f.points[i])?f:{...f,points:xyz};
 });
}

export function wheelContactPlane(vehicle,faces){
 const roadTire=vehicle==='g500'||vehicle==='bmw325ci';
 if(!roadTire&&!liftOptions(vehicle).length)return 0;
 const tire=roadTire?'wheels.tire':'running.tires';
 let floor=Infinity;
 for(const face of faces){
  if(face.part!==tire)continue;
  for(const point of face.points)floor=Math.min(floor,point[2]);
 }
 return Number.isFinite(floor)?floor:0;
}
