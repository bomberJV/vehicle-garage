import {cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';
import {box,path,plus,metal,alloy,iron,rubber} from './road-service-geometry.js';
import {slab} from './section-primitives.js';
import {fluidRefs as ref} from './g500-fluid-refs.js';

const pump=[-1.706,-.351,.819],gear=[-1.602,-.544,.627];
const pitmanTip=[-1.516,-.527,.473],rightJoint=[-1.542,.680,.412];
const press=plus(pump,[.040,-.045,.008]),inlet=plus(gear,[.046,.027,.072]),outlet=plus(gear,[-.004,.027,.072]);
const feed=[-1.997,-.566,.577],returnEnd=[-1.997,-.566,.604],reservoirIn=plus(pump,[.045,-.067,.069]);
function hose(r,points,rad){
 path(r,points,rad,rubber);
 for(const seq of [points,[...points].reverse()]){
  const a=seq[0],b=seq[1],d=b.map((v,i)=>v-a[i]),length=Math.hypot(...d);
  const p=t=>a.map((v,i)=>v+d[i]*t/length);
  r.rod(p(.005),p(.022),rad+.003,alloy,8);
 }
}
function joint(r,c){
 cyl(r,c,z,-.011,.018,.023,iron,10);
 cyl(r,c,z,.018,.029,.022,rubber,10);
 cyl(r,c,z,.029,.044,.010,metal,6);
}
export function drawG500SteeringLinkage(r){
 const tie=[[-1.306,-.672,.397],[-1.306,.672,.397]];
 const rodWithJoints=(a,b)=>{r.rod(a,b,.015,metal,9);for(const p of [a,b])joint(r,p);};
 r.instance('drag-link',()=>rodWithJoints(pitmanTip,rightJoint));
 r.instance('tie-rod',()=>rodWithJoints(...tie));
 // The two rearward steering arms move together; the cross rod meets their ends.
 for(const [i,side] of [-1,1].entries())r.rod([-1.425,side*.674,.401],tie[i],.019,iron,8);
 r.rod([-1.425,.674,.401],rightJoint,.021,iron,8);
}
export const steeringRows=[
 ['pump','Belt-driven hydraulic pump','A pulley on the accessory drive turns the pump. The reservoir feeds its inlet and the threaded outlet feeds the pressure hose.',[-.30,-.10,.10],ref.steeringInstall,r=>{
  turn(r,pump,x,[[-.078,.018],[-.070,.053],[-.059,.058],[-.046,.031],[-.039,.052],[.042,.054],[.062,.033],[.062,0]],iron,{n:14});
  for(const side of [-1,1])cyl(r,plus(pump,[.01,.028,side*.040]),x,-.038,.065,.009,alloy,6);
  sleeve(r,press,y,-.011,.010,.014,.008,metal,8);
 }],
 ['reservoir','Steering-fluid reservoir','The reservoir mounts directly to the pump. A filler cap closes the top and the cooler return enters the side.',[.06,-.27,.32],ref.steeringInstall,r=>{
  const c=plus(pump,[.008,.002,.054]);slab(r,...c,.138,.121,.092,rubber,.026);
  slab(r,c[0],c[1],c[2]+.091,.134,.117,.009,iron,.025);
  cyl(r,plus(c,[-.025,0,.095]),z,0,.020,.030,rubber,12);cyl(r,reservoirIn,y,-.012,.015,.011,iron,10);
 }],
 ['pressure-line','High-pressure hose','A crimped hose joins the pump outlet to the control valve in the steering gear. The parts catalog lists a chassis-number break for this line.',[-.12,-.32,.10],ref.steering,r=>hose(r,[press,[-1.653,-.459,.811],[-1.608,-.493,.746],inlet],.011)],
 ['steering-box','Recirculating-ball steering box','The steering shaft turns a worm. A ball-supported rack piston acts on a sector shaft, whose splined end carries the pitman arm.',[.06,-.35,-.03],ref.gear,r=>{
  turn(r,gear,x,[[-.095,0],[-.095,.057],[-.080,.072],[.073,.072],[.092,.053],[.113,.029],[.113,0]],iron,{n:14});
  cyl(r,plus(gear,[-.010,0,-.014]),z,-.095,.044,.052,iron,12);
  for(const port of [inlet,outlet])cyl(r,port,z,-.016,.006,.014,metal,6);
 }],
 ['shaft','Lower steering shaft and joints','The lower shaft joins the cabin column to the steering-box input. Universal joints accommodate the change in angle across the bulkhead.',[.20,-.20,.19],ref.gear,r=>{
  const joints=[[-.625,-.410,1.109],[-.846,-.446,1.009],[-1.282,-.509,.733],plus(gear,[.111,0,.003])];
  path(r,joints,.013,metal);
  for(const p of joints.slice(1,3)){cyl(r,p,y,-.020,.020,.021,iron,8);cyl(r,p,z,-.020,.020,.012,alloy,8);}
 }],
 ['pitman','Pitman arm','The arm fixes to the lower end of the sector shaft. The outer end meets the drag-link ball stud.',[.13,-.10,-.30],ref.gear,r=>{
  const base=plus(gear,[-.010,0,-.101]);sleeve(r,base,z,-.011,.008,.033,.017,metal,12);
  path(r,[base,[-1.589,-.541,.505],pitmanTip],.019,iron);
 }],
 ['cooler','Steering-oil cooler loop','Return oil passes through an exposed metal loop before it reaches the reservoir. The G500 uses a separate front cooler for the automatic transmission.',[-.34,.06,-.13],ref.steering,r=>{
  path(r,[feed,[-2.016,-.502,.563],[-2.016,.469,.563],[-2.016,.488,.572],[-2.016,.488,.591],[-2.016,.471,.601],[-2.016,-.502,.601],returnEnd],.007,metal);
  for(const side of [-1,1])box(r,[-2.005,side*.369,.580],[.017,.021,.057],iron);
 }],
 ['return-lines','Steering-box and reservoir return hoses','One hose carries oil from the box to the cooler. The second runs from the other cooler port back to the reservoir.',[.05,-.28,-.16],ref.steering,r=>{
  hose(r,[outlet,[-1.650,-.566,.701],[-1.705,-.596,.630],[-1.930,-.591,.576],feed],.009);
  hose(r,[returnEnd,[-1.925,-.564,.620],[-1.852,-.510,.720],[-1.780,-.487,.862],reservoirIn],.009);
 }]
];
