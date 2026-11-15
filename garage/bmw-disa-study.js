import {study,part,cyl,sleeve,turn,y} from './mechanism-shapes.js';
import {m54References} from './bmw-m54-bay.js';

// The teaching section is framed across the manifold opening. A longitudinal
// shaft in the removable unit links the internal flap to the external lever.
const trim='#4e585b',plastic='#30393d',edge='#6f787a',shaft='#a0a9a8';
const zAxis=[0,0,1];
const lift=t=>(1-Math.cos(2*Math.PI*t))*.5;
const angle=t=>Math.PI/2*lift(t);
const journalPoint=(x,y,z,t)=>{
 const a=angle(t);return [x*Math.cos(a)+z*Math.sin(a),y,-x*Math.sin(a)+z*Math.cos(a)];
};
function housing(r){
 const x=.39,reach=.33,h=.235,w=.038;
 // The module frame surrounds an open passage, rather than an opaque wall
 // behind the flap. The outboard mounting flange also has an open center.
 for(const sign of [-1,1]){
  r.box(sign*x-w/2,-reach,-h,sign*x+w/2,reach,h,plastic);
  r.box(-x,-reach,sign*h-w/2,x,reach,sign*h+w/2,trim);
  r.box(sign*x-w,-reach-.031,-h-.036,sign*x+w,-reach,h+.036,edge);
  r.box(-x,-reach-.031,sign*h-w,x,-reach,sign*h+w,edge);
 }
 for(const x of [-.43,.43])sleeve(r,[x,-.352,.153],y,-.016,.015,.033,.016,plastic,14);
}
function flap(r,t){
 const y0=-.288,y1=.303,h=.202,d=.012,point=(x,y,z)=>journalPoint(x,y,z,t);
 const side=(x)=>[[x,y0,-h],[x,y1,-h],[x,y1,h],[x,y0,h]].map(p=>point(...p));
 const a=side(-d),b=side(d);r.polygon(a,'#948d6c',false);r.polygon(b,'#aaa381',false);
 for(let i=0;i<4;i++)r.polygon([a[i],b[i],b[(i+1)%4],a[(i+1)%4]],'#6f6b57',false);
}
function leverPoint(t){return journalPoint(.107,-.420,.015,t);}
function diaphragmCenter(t){return [.241,-.420,.028-.073*lift(t)];}
const items=[
 part('frame','Module frame and mounting flange','The frame fits the manifold opening. Its rail at the far end supports the flap pivot.',[0,.42,.22],housing),
 part('flap','Resonance flap','Closed, the blade divides the intake passage into two groups of three runners. Open, it allows communication between both resonance tubes.',[-.46,.05,.29],flap),
 part('shaft','Flap shaft and bearing','The flap turns about this axis. The shaft transfers rotation from the outboard lever to the blade.',[0,-.55,.04],r=>{cyl(r,[0,0,0],y,-.429,.335,.023,shaft,18);sleeve(r,[0,.315,0],y,0,.022,.033,.023,edge,18);}),
 part('linkage','Operating lever and pull rod','The vacuum unit moves a rod. Its offset lever converts the short stroke into flap rotation.',[.50,-.28,.16],(r,t)=>{
  const tip=leverPoint(t),center=diaphragmCenter(t);
  r.rod([0,-.420,0],tip,.015,shaft,12);r.rod(tip,center,.008,'#aab2b0',10);
  cyl(r,tip,y,-.009,.009,.016,edge,12);
 }),
 part('capsule','Vacuum actuator shell','A vacuum chamber beside the flap houses the diaphragm and return spring. The open section exposes their movement.',[.54,.05,-.08],r=>{
  const ox=.241,oy=-.420,rad=.075;
  for(let i=0;i<13;i++){
   const a=(i/13+.25)*Math.PI,b=((i+1)/13+.25)*Math.PI;
   const pt=(u,h)=>[ox+rad*Math.cos(u),oy+rad*Math.sin(u),h];
   r.polygon([pt(a,-.11),pt(b,-.11),pt(b,.095),pt(a,.095)],plastic,false);
  }
  turn(r,[ox,oy,.096],zAxis,[[0,.072],[.014,.063],[.023,.044],[.023,0]],trim,{n:20});
 }),
 part('diaphragm','Vacuum diaphragm and return spring','Vacuum pulls against the spring to close the flap. Releasing the vacuum lets the spring open the flap.',[.27,-.30,-.41],(r,t)=>{
  const p=diaphragmCenter(t);
  cyl(r,p,zAxis,-.007,.007,.062,'#777d72',18);
  let last=null;
  for(let i=0;i<=40;i++){
   const f=i/40,a=f*4*Math.PI*2;
   const q=[p[0]+.023*Math.cos(a),p[1]+.023*Math.sin(a),p[2]+.008+f*(.09-p[2]-.008)];
   if(last)r.rod(last,q,.0025,shaft,6);last=q;
  }
 }),
 part('solenoid','Switchover solenoid and connector','The engine controller switches the vacuum supply to the actuator. BMW describes an energized solenoid for the low-speed closed position.',[.47,-.07,.46],r=>{
  r.box(.10,-.382,.167,.23,-.330,.231,plastic);r.box(.143,-.429,.183,.202,-.381,.213,trim);
  for(const x of [.16,.184])r.box(x,-.443,.193,x+.004,-.426,.203,shaft);
 })
];
// Turn the fixture about Z so the default workbench orbit faces the actuator.
const fixturePoint=([x,y,z])=>[-x,-y,z];
const oriented=items.map(item=>({...item,offset:fixturePoint(item.offset),draw(r,t){
 const start=r.faces.length;item.draw(r,t);
 for(let i=start;i<r.faces.length;i++)r.faces[i].points=r.faces[i].points.map(fixturePoint);
}}));
const view=study('m54disa','M54 resonance-flap unit','A vacuum actuator closes the resonance flap for the long intake path. When the valve vents, the spring opens the crossover. The section shows one complete close–open–close cycle.',m54References.disa,oriented,
 'Follow the actuator rod and shaft as the flap opens, then closes. Cycle position shows movement between the two operating states.');
view.viewAngle=[.29,.26];
export function getM54DisaDetail(vehicle,id){
 return vehicle==='bmw325ci'&&id==='powertrain.disa'?view:null;
}
