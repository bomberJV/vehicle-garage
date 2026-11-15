// The 2014 US trunk-lid plate, callouts 19, 20 and 26–30. Dimensions are
// fitted to the rear panel. Hidden cable bends and pawl travel are illustrative.
import {part,study,cyl} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';
import {slDeckPoint} from './sl550-roof.js';
import {slDeckCameraMount} from './sl550-exterior.js';

export const trunkPlate={label:'Mercedes-Benz USA · trunk lid, plate 1, items 19–30',url:'https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/body--lid-and-components'};
const steel='#92999a',zinc='#a5a9a3',graphite='#414749',rubber='#292f32';
const axis=[1,0,0];
// Sections live in the plane of the rear panel. Use convex strips so that
// the slot for the striker is open on both faces, even in the software renderer.
function stamping(r,section,x0,x1,color){
 const contour=x=>section.map(([y,z])=>[x,y,z]);
 const a=contour(x0),b=contour(x1);
 r.polygon(a,color,false);r.polygon(b,color,false);
 for(let i=0;i<a.length;i++){
  const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],color,false);
 }
}
function lockHousing(r){
 const top=[[-.050,.020],[-.047,.049],[-.037,.057],[.035,.057],[.047,.045],[.047,.022]];
 stamping(r,top,-.020,.016,graphite);
 for(const s of [-1,1]){
  stamping(r,[[s*.045,.030],[s*.047,-.002],[s*.036,-.013],[s*.018,-.013],[s*.009,.002],[s*.013,.021]],-.020,.013,graphite);
  stamping(r,[[s*.041,.030],[s*.039,-.001],[s*.032,-.013],[s*.021,-.013],[s*.013,.008],[s*.016,.030]],.014,.017,steel);
  cyl(r,[.017,s*.033,.011],axis,0,.002,.004,zinc,10);
 }
 r.box(-.015,.043,.027,.014,.061,.045,graphite);
 for(const side of [-1,1])r.box(-.016,.051+side*.004,.031,-.014,.054+side*.004,.040,zinc);
}
function lockJaw(r,t=0){
 const angle=.94*Math.sin(Math.PI*t)**2;
 const point=([y,z])=>[-.016+(y+.016)*Math.cos(angle)-(z-.008)*Math.sin(angle),.008+(y+.016)*Math.sin(angle)+(z-.008)*Math.cos(angle)];
 const sectors=10;
 for(let i=0;i<sectors;i++){
  const a=-1.32+i*4.31/sectors,b=-1.32+(i+1)*4.31/sectors;
  const edge=(k,radius)=>point([radius*Math.cos(k),radius*Math.sin(k)]);
  stamping(r,[edge(a,.0065),edge(a,.014),edge(b,.014),edge(b,.0065)],-.009,.006,zinc);
 }
 cyl(r,[-.007,-.016,.008],axis,-.006,.018,.0038,steel,12);
}
function strike(r){
 // The upstanding plate has a real opening for the latch, with its two narrow
 // cheeks tied by the crosspin. Its base bolts to the swivel frame.
 stamping(r,[[-.031,-.026],[-.023,-.031],[.024,-.031],[.032,-.026],[.030,-.021],[-.031,-.021]],-.020,.015,steel);
 for(const x of [-.014,.011]){
  stamping(r,[[-.008,-.023],[.008,-.023],[.007,.002],[.003,.006],[-.003,.006],[-.007,.002]],x-.002,x+.002,zinc);
 }
 cyl(r,[0,0,0],axis,-.014,.011,.0035,zinc,10);
}
function release(r){
 const cable=[[0,.041,.045],[-.008,.085,.046],[-.014,.118,.063],[-.018,.126,.094],[-.016,.120,.127],[-.012,.096,.154],[-.006,.070,.168]];
 pipe(r,cable,.0033,rubber,8);
 for(const [a,b] of [[cable[0],cable[1]],[cable.at(-2),cable.at(-1)]])r.rod(a,a.map((v,i)=>v+(b[i]-v)*.23),.0048,steel,8);
 const c=cable.at(-1);
 cyl(r,c,axis,-.015,.016,.011,graphite,14);
 cyl(r,c,axis,.016,.019,.0084,zinc,14);
 r.box(c[0]+.019,c[1]-.0012,c[2]-.005,c[0]+.0198,c[1]+.0012,c[2]+.005,rubber);
 r.box(-.023,.055,.153,-.016,.085,.181,steel);
}
function buttons(r){
 r.box(-.105,.123,.133,-.083,.174,.144,rubber);
 r.box(-.105,.125,.130,-.086,.149,.133,'#494f50');
 r.box(-.105,.151,.130,-.086,.172,.133,'#494f50');
}
const bits=[
 part('housing','Powered trunk lock','The two cheeks of the lock guide the striker into the jaw. The electrical plug enters the side of the actuator housing.',[.040,0,.021],lockHousing),
 part('jaw','Rotary catch','The cutaway shows how a rotary jaw retains the striker. Its profile and travel are schematic.',[-.032,0,.020],lockJaw),
 part('striker','Swivel-frame striker','The deck lock closes around the crosspin on the swivel frame. The frame and lid tilt together during roof operation.',[0,0,-.047],strike),
 part('release','Lock cylinder and release cable','The mechanical key turns a separate cylinder. A sheathed cable carries the release movement to the lock. The hidden bends are estimated.',[-.028,.041,.023],release),
 part('switches','Closing and locking buttons','The separate buttons underneath the lid close the trunk or close and lock the car when a KEYLESS-GO key is present.',[-.020,.057,-.018],buttons)
];
export const trunkLockStudy=study('sltrunklock','Trunk lock and swivel-frame striker','The Mercedes parts plate shows the remote lock, its release cable, a separate bracket and the striker. Follow the jaw as it releases the crosspin.',trunkPlate,bits,'The jaw opens to release the striker and returns to the latched position.');
function placeOnLid(r,t,locate,draw){
 const start=r.faces.length;draw();
 for(const f of r.faces.slice(start))f.points=f.points.map(p=>slDeckPoint(locate(p),t));
}
export function drawSLTrunkLock(r,t){
 const [x]=slDeckCameraMount();
 placeOnLid(r,t,p=>[x-.085+p[0],p[1],.639+p[2]],()=>{for(const piece of bits)piece.draw(r,0);});
}
export function drawSLDeckHandle(r,t){
 const surface=([offset,y,z])=>{
  const point=slDeckCameraMount(y,.831+z);point[0]+=offset;return point;
 };
 placeOnLid(r,t,surface,()=>{
  // The camera sits in the center opening. The grip is recessed to its right.
  const outline=[[-.035,-.010],[-.032,-.016],[.114,-.016],[.119,-.009],[.117,.012],[.110,.016],[-.030,.016],[-.035,.011]];
  const inner=outline.map(([y,z])=>[y<0?y+.003:y-.003,z*.79]);
  for(let i=0;i<outline.length;i++){
   const j=(i+1)%outline.length,p=(x,q)=>[x,q[0],q[1]];
   r.polygon([p(.002,outline[i]),p(.002,outline[j]),p(.002,inner[j]),p(.002,inner[i])],graphite,false);
   r.polygon([p(.002,inner[i]),p(.002,inner[j]),p(-.007,inner[j]),p(-.007,inner[i])],rubber,false);
  }
  r.box(-.007,.032,-.009,.003,.109,.005,rubber);
  r.box(.003,.036,-.007,.004,.105,.002,'#464b4c');
 });
}
export function drawSLMovingAccess(r,t){
 r.tag('access.trunk',()=>drawSLTrunkLock(r,t));
 r.tag('access.handle',()=>drawSLDeckHandle(r,t));
}
