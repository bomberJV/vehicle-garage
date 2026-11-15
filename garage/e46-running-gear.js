// BMW USA BN33 M54 coupe. Parts plates constrain connectivity and handedness.
// Apart from the wheel datum, rotor dimensions and bearing diameters, coordinates approximate the installed layout.
import {E46_WHEEL_DIMENSIONS as wheels,e46Style43} from './e46-wheel-specs.js';
import {TAU,add,mix,basis,point,cyl,sleeve,turn,metal,steel,dark,part,study,x,y,z} from './mechanism-shapes.js';

const catalog='https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/';
const plate=(label,path)=>({label:'BMW 325Ci M54 coupe · '+label,url:catalog+path+'.html'});
export const e46Sources={
 front:plate('front axle support and wishbone','front_rear_axle/front_axle_support_wishbone'),
 strut:plate('front spring strut and damper','front_rear_axle/front_spring_strut_shock_absorber'),
 rear:plate('rear trailing arm and upper and lower wishbones','front_rear_axle/rear_axle_support_wheel_suspension'),
 carrier:plate('rear axle carrier and mounts','front_rear_axle/rear_axle_carrier'),
 propshaft:plate('flex disc, shaft spline and center bearing','steering_drive_shaft/drive_shaft_center_bearing_universal_joint'),
 diff:plate('rear final-drive casing','front_rear_axle/final_drive_gasket_set'),
 shafts:plate('rear output shafts','front_rear_axle/output_shaft'),
 rack:plate('power steering rack','steering_drive_shaft/power_steering'),
 brake:plate('brake discs and service parts','scopes_of_service_and_repair_work/service_brakes'),
 rotor:{label:'Brembo · E46 325Ci front and rear rotor dimensions',url:'https://www.bremboparts.com/europe/en/catalogue/bmw-3-coupe-e46-325-ci/000015449-1'},
 photo:{label:'ECS Tuning · E46 rear spring and upper pad, photograph on page 15',url:'https://assets.ecstuning.com/edoc/BMW_E46_Lowering_Springs_Struts.pdf#page=15'}
};
export const e46HubZ=wheels.wheelRadius+.04;
const axle=wheels.wheelbase/2,front=-axle,rear=axle,rubber='#323a40',cast='#737e80',iron='#505c60';
const corner=(rear,s)=>(rear?'rear-':'front-')+(s<0?'left':'right');
const mount=rear=>(rear?wheels.trackRear:wheels.trackFront)/2+e46Style43.offset;
export const e46Rotors=[{radius:.150,thickness:.022,height:.052,centering:.079},{radius:.147,thickness:.019,height:.059,centering:.075}];
export function e46RotorSite(isRear,s){
 const d=e46Rotors[Number(isRear)];
 return [isRear?rear:front,s*(mount(isRear)-d.height+d.thickness/2),e46HubZ];
}
function withEach(r,isRear,work){for(const s of [-1,1])r.instance(corner(isRear,s),()=>work(s));}
function bend(r,points,radius,color,n=8){for(let i=1;i<points.length;i++)r.rod(points[i-1],points[i],radius,color,n);}
function eye(r,c,axis,radius,width){sleeve(r,c,axis,-width/2,width/2,radius,radius*.79,cast,12);sleeve(r,c,axis,-width*.51,width*.51,radius*.79,radius*.29,rubber,12);sleeve(r,c,axis,-width*.55,width*.55,radius*.29,radius*.19,metal,12);}
function leaf(r,a,b,widthA,widthB,thick,col){
 // A tapered, flattened casting between two joints in the horizontal plane.
 const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);
 const corners=[[a,widthA],[b,widthB],[b,-widthB],[a,-widthA]].map(([p,w])=>[p[0]-dy*w/d,p[1]+dx*w/d,p[2]]);
 const lo=corners.map(q=>[q[0],q[1],q[2]-thick*.5]),hi=corners.map(q=>[q[0],q[1],q[2]+thick*.5]);
 r.polygon(lo,col,false);r.polygon(hi,col,false);
 for(let i=0;i<4;i++){const j=(i+1)%4;r.polygon([lo[i],lo[j],hi[j],hi[i]],col,false);}
}
function coil(r,a,b,radius,barrel=false){
 const axis=b.map((v,i)=>v-a[i]),len=Math.hypot(...axis),basisA=basis(axis);
 const at=t=>point(a,basisA,t*len,radius*(barrel?.69+.31*Math.sin(Math.PI*t):.89+.11*Math.sin(Math.PI*t)),t*TAU*4.6);
 let old=at(0);for(let i=1;i<=48;i++){const next=at(i/48);r.rod(old,next,.009,'#697477',6);old=next;}
}
function frames(r){
 const cross=[[-1.36,-.40,.292],[-1.31,-.25,.225],[-1.31,.25,.225],[-1.36,.40,.292]];
 bend(r,cross,.049,iron);
 for(const s of [-1,1]){
  bend(r,[[front-.13,s*.36,.285],[front,s*.40,.299],[front+.12,s*.35,.294]],.046,iron);
  for(const dx of [-.125,.12])cyl(r,[front+dx,s*.35,.290],z,-.022,.026,.038,cast,10);
 }
 // The rear final drive occupies the open middle of a four-bushed perimeter carrier.
 for(const s of [-1,1]){
  const v=[[rear-.245,s*.42,.341],[rear-.25,s*.27,.307],[rear-.22,s*.18,.27]];
  bend(r,v,.042,iron);bend(r,[[rear-.25,s*.42,.345],[rear-.02,s*.365,.35],[rear+.21,s*.39,.372]],.041,iron);
  for(const [dx,w,h] of [[-.245,.42,.345],[.21,.39,.372]])eye(r,[rear+dx,s*w,h],z,.053,.076);
 }
 for(const [dx,w,h] of [[-.22,.18,.27],[.20,.39,.37]])r.rod([rear+dx,-w,h],[rear+dx,w,h],.040,iron,10);
}
function frontWishbone(r,s){
 const inner=[front+.01,s*.323,.254],outer=[front,s*.675,.230],tail=[front+.315,s*.392,.252],elbow=[front+.078,s*.492,.238];
 leaf(r,inner,outer,.031,.038,.027,cast);leaf(r,outer,tail,.032,.020,.032,cast);leaf(r,inner,tail,.031,.017,.028,cast);
 leaf(r,elbow,[front+.115,s*.380,.249],.013,.014,.022,cast);
 for(const c of [inner,outer]){cyl(r,c,z,-.017,.015,.035,cast,12);turn(r,c,z,[[.010,.027],[.032,.022],[.042,.014],[.052,.009]],rubber,{n:12});}
 eye(r,tail,x,.041,.053);
 for(const edge of [-1,1]){const foot=add(tail,[edge*.036,-s*.053,.011]);leaf(r,tail,foot,.018,.015,.016,cast);cyl(r,foot,z,.01,.02,.011,metal,6);}
}
function rearArm(r,s,key){
 const c=[rear,s*.686,e46HubZ],pivot=[rear-.465,s*.57,.31];
 if(key==='trailing'){
  leaf(r,pivot,[rear-.16,s*.67,.31],.038,.039,.049,cast);leaf(r,[rear-.16,s*.67,.31],c,.039,.072,.066,cast);
  sleeve(r,c,y,-.035,.035,.088,.044,cast,18);eye(r,pivot,y,.045,.065);
  r.rod(c,[rear+.010,s*.675,.40],.027,cast,10);r.rod(c,[rear+.055,s*.68,.245],.032,cast,10);
  return;
 }
 if(key==='upper'){
  const inner=[rear-.003,s*.19,.36],seat=[rear-.022,s*.496,.360],outer=[rear+.010,s*.675,.40];
  leaf(r,inner,seat,.030,.093,.040,cast);leaf(r,seat,outer,.093,.030,.040,cast);
  sleeve(r,seat,z,.020,.028,.084,.026,iron,18);eye(r,inner,x,.030,.065);
  return;
 }
 const inner=[rear+.085,s*.172,.249],outer=[rear+.055,s*.68,.245];
 leaf(r,inner,outer,.023,.021,.026,iron);eye(r,inner,x,.024,.05);eye(r,outer,x,.024,.045);
}
const frontStrut=s=>[[front,s*.668,.311],[front+.044,s*.548,.831]];
const rearShock=s=>[[rear+.075,s*.659,.247],[rear+.104,s*.602,.795]];
function damper(r,s,isRear){
 const [a,b]=isRear?rearShock(s):frontStrut(s),mid=mix(a,b,.56),axis=b.map((v,i)=>v-a[i]);
 r.rod(a,mid,isRear?.027:.037,iron,12);r.rod(mid,b,.014,metal,10);
 const dust=mix(a,b,.73);r.rod(mid,dust,.025,rubber,10);sleeve(r,b,axis,-.02,0,isRear?.041:.066,.012,dark,14);
 if(isRear)eye(r,a,y,.030,.044);
 else {const seat=mix(a,b,.40);sleeve(r,seat,axis,-.008,0,.094,.036,iron,18);}
}
function spring(r,s,isRear){
 if(isRear){const a=[rear-.022,s*.496,.387],b=[rear-.016,s*.488,.640];coil(r,a,b,.077,true);for(const c of [a,b])sleeve(r,c,z,-.006,.006,.059,.025,rubber,16);}
 else {const [a,b]=frontStrut(s);coil(r,mix(a,b,.40),mix(a,b,.951),.085);}
}
function upright(r,s){
 const c=[front,s*.696,e46HubZ];
 sleeve(r,c,y,-.029,.030,.065,.032,cast,16);
 const a=[front,s*.675,.265],strut=frontStrut(s)[0];r.rod(a,c,.034,cast,12);r.rod(c,add(strut,[0,0,.092]),.034,cast,12);
 r.rod(c,[front-.102,s*.665,.337],.023,cast,10);
}
function rack(r){
 const a=[front-.105,0,.315];cyl(r,a,y,-.30,.30,.031,cast,16);
 for(const s of [-1,1]){
  r.rod([a[0],s*.292,a[2]],[a[0],s*.443,a[2]],.017,metal,10);
  const bellows=[];for(let i=0;i<=8;i++)bellows.push([s*(.30+i*.016),i%2?.028:.020]);turn(r,a,y,bellows,rubber,{n:10});
  r.rod([a[0],s*.421,a[2]],[front-.102,s*.665,.337],.014,steel,10);
 }
}
export const e46SuspensionParts=[
 ['wishbones','Front lower wishbones','The outer ball joint locates the steering knuckle. The inner joint attaches to the axle carrier. A separate rubber mount carries the rear pin.',e46Sources.front],
 ['trailing-arms','Rear trailing arms and wheel carriers','Each rear carrier is part of a trailing arm. Its forward rubber bushing pivots in a bracket on the body.',e46Sources.rear],
 ['upper-arms','Rear upper wishbones and spring seats','The dished upper arm supports the barrel spring between the rear wheel and the differential. The separate shock mounts farther outboard.',e46Sources.rear],
 ['lower-arms','Rear lower wishbones','The narrow lower arm links the axle carrier to the bottom of the trailing arm. An eccentric fastener at the wheel end sets camber.',e46Sources.rear]
].map(([id,name,description,source])=>({id:'suspension.'+id,name,description,source}));
export function drawE46Suspension(r){
 r.tag('suspension.frame',()=>r.instance('carriers',()=>frames(r)));r.tag('steering.linkage',()=>r.instance('steering-rack',()=>rack(r)));
 r.tag('steering.axle',()=>withEach(r,false,s=>upright(r,s)));
 r.tag('suspension.wishbones',()=>withEach(r,false,s=>frontWishbone(r,s)));
 for(const [id,key] of [['trailing-arms','trailing'],['upper-arms','upper'],['lower-arms','lower']])
  r.tag('suspension.'+id,()=>withEach(r,true,s=>rearArm(r,s,key)));
 for(const [id,draw] of [['spring',spring],['damper',damper]])
  r.tag('suspension.'+id,()=>{for(const isRear of [false,true])withEach(r,isRear,s=>draw(r,s,isRear));});
}

export function drawE46Rotor(r,isRear,s){
 const c=e46RotorSite(isRear,s),d=e46Rotors[Number(isRear)],dir=[0,s,0],t=d.thickness,hat=isRear?.0835:.086;
 // Axial stations are measured outwards from the friction band's mid-plane.
 const face=d.height-t/2,inner=hat+.005;
 for(const sign of [-1,1])sleeve(r,c,dir,sign*t*.50,sign*t*.24,d.radius,inner,metal,36);
 for(let j=0;j<24;j++){
  const a=TAU*j/24,ray=(radius,h,angle)=>[c[0]+Math.cos(angle)*radius,c[1]+s*h,c[2]+Math.sin(angle)*radius];
  r.polygon([ray(inner,-t*.24,a),ray(d.radius-.001,-t*.24,a+.038),ray(d.radius-.001,t*.24,a+.038),ray(inner,t*.24,a)],iron,false);
 }
 turn(r,c,dir,[[-t*.49,inner+.002],[-t*.49,hat-.003],[face-.006,hat-.003],[face,hat],[t*.46,hat+.001],[t*.46,inner+.002]],cast,{n:36});
 // Each sector has one open wheel-bolt bore on the 120 mm bolt circle.
 for(let j=0;j<5;j++){
  const a=Math.PI/2+TAU*j/5,rad=.060,cut=.0068,ring=[],hole=[],n=16;
  for(let i=0;i<n;i++){
   const theta=TAU*i/n,u=Math.cos(theta),v=Math.sin(theta),phi=a+Math.atan2(cut*v,rad+cut*u),rr=Math.hypot(rad+cut*u,cut*v);
   hole.push([rr,phi]);
   const limit=(q,L)=>q>1e-10?L/q:Infinity;
   const span=Math.min(limit(u,hat-rad),limit(-u,rad-d.centering/2),limit(Math.abs(v),rad*TAU/10));
   ring.push([rad+u*span,a+v*span/rad]);
  }
  const pt=([radius,angle],h)=>[c[0]+radius*Math.cos(angle),c[1]+s*h,c[2]+radius*Math.sin(angle)];
  for(let i=0;i<n;i++){
   const k=(i+1)%n;for(const h of [face,face-.005])r.polygon([pt(ring[i],h),pt(ring[k],h),pt(hole[k],h),pt(hole[i],h)],cast,false);
   r.polygon([pt(hole[i],face),pt(hole[k],face),pt(hole[k],face-.005),pt(hole[i],face-.005)],iron,false);
  }
 }
}
export function drawE46Caliper(r,isRear,s){
 const c=e46RotorSite(isRear,s),R=e46Rotors[Number(isRear)].radius;
 const at=(rad,dy,dz)=>[c[0]+rad,c[1]+s*dy,c[2]+dz],n=14;
 // Floating housing with a single inboard piston, paired guide pins and an outboard bridge.
 cyl(r,at(R*.81,0,0),[0,s,0],-.054,-.015,isRear?.025:.030,cast,n);
 for(const dy of [-.018,.018])for(const dz of [-.036,.036])
   r.rod(at(R*.72,dy,dz*.80),at(R*.92,dy,dz),.014,iron,8);
 for(const dz of [-.035,.035]){
  r.rod(at(R*.92,-.018,dz),at(R*.92,.022,dz),.014,cast,10);
  r.rod(at(R*.77,-.045,dz),at(R*.77,.006,dz),.005,metal,8);
 }
 bend(r,[at(R*.92,.022,-.035),at(R*.80,.030,-.018),at(R*.80,.030,.018),at(R*.92,.022,.035)],.012,cast,9);
}
export function drawE46ParkingShoes(r,s){
 const c=e46RotorSite(true,s),dir=[0,s,0];
 for(const a of [.13,Math.PI+.13])turn(r,c,dir,[[.002,.068],[.002,.0795],[.023,.0795],[.023,.068]],'#776c5c',{start:a,sweep:Math.PI-.26,n:15});
}
const shaftZ=.375,tailZ=.421,startX=-.115,supportX=.43,shaftCenter=[supportX,0,shaftZ];
export function drawE46Gearbox(r){
 // Only the bellhousing, case envelope and tail are shared by the gearbox options.
 turn(r,[-.671,0,.480],[.556,0,tailZ-.480],[[0,0],[0,.168],[.09,.165],[.16,.120],[.36,.109],[.47,.077],[.535,.047],[.559,.047],[.559,0]],cast,{n:16});
}
function shaftPath(r){
 const frontP=[startX+.029,0,tailZ],aft=[rear-.198,0,e46HubZ];
 const journal=add(shaftCenter,[-.046,0,0]),joint=add(shaftCenter,[.086,0,0]);
 r.rod(frontP,journal,.032,iron,14);cyl(r,shaftCenter,x,-.047,.044,.015,steel,14);
 for(const s of [-1,1]){
  const ear=add(joint,[-.049,s*.020,0]);
  r.rod(ear,add(joint,[.014,s*.020,0]),.010,cast,8);
  r.rod(add(joint,[0,0,s*.020]),add(joint,[.043,0,s*.020]),.010,cast,8);
 }
 cyl(r,joint,y,-.026,.026,.012,metal,10);cyl(r,joint,z,-.026,.026,.012,metal,10);
 r.rod(add(joint,[.038,0,0]),aft,.035,iron,14);
 for(const [p,rad] of [[frontP,.047],[journal,.038],[aft,.054]])cyl(r,p,x,-.013,.015,rad,cast,14);
}
function guibo(r,c,scale){
 const rad=.069*scale,t=.024*scale;
 sleeve(r,c,x,-t*.5,t*.5,rad,.028*scale,rubber,24);
 for(let i=0;i<6;i++){const a=TAU*i/6,pc=add(c,[0,Math.cos(a)*rad*.72,Math.sin(a)*rad*.72]);
  cyl(r,pc,x,-t*.57,t*.57,.008*scale,iron,10);cyl(r,pc,x,i%2?-t*.8:t*.56,i%2?-t*.55:t*.8,.010*scale,metal,6);}
}
function support(r,key,c,k){
 const at=off=>add(c,off,k),ring=(start,end,outer,inner,col,n)=>sleeve(r,c,x,start*k,end*k,outer*k,inner*k,col,n);
 if(key==='carrier'){
  ring(-.011,.011,.058,.049,cast,20);
  for(const s of [-1,1]){
   const foot=at([0,s*.083,-.049]);r.rod(at([0,s*.050,-.006]),foot,.007*k,cast,8);
   sleeve(r,foot,z,-.004*k,.004*k,.015*k,.005*k,cast,14);
  }
 }else if(key==='insulator')ring(-.012,.012,.049,.0275,rubber,22);
 else if(key==='bearing')ring(-.008,.008,.0275,.015,metal,24);
 else if(key==='ring')turn(r,c,x,[[-.011*k,.014*k],[-.011*k,.017*k],[-.009*k,.017*k],[-.009*k,.014*k]],iron,{n:24,start:.14,sweep:TAU-.28});
 else if(key==='studs'){
  for(const s of [-1,1]){const foot=at([0,s*.083,-.049]);cyl(r,foot,z,-.009*k,.014*k,.004*k,steel,8);cyl(r,foot,z,-.010*k,-.004*k,.008*k,metal,6);}
 }
}
const supportKeys=['carrier','insulator','bearing','ring','studs'];
const bearing=study('e46shaftbearing','Center support bearing in section','The catalog lists a 55 mm outside diameter and 30 mm bore. The outer race sits in the rubber support and the inner race turns with the shaft. Rolling elements and cage are enlarged to show the operating principle.',e46Sources.propshaft,[
 part('outer','Outer race','The support holds this outer ring stationary.',[0,0,.65],r=>sleeve(r,[0,0,0],x,-.17,.17,.60,.49,steel,32)),
 part('inner','Inner race','The inner ring turns on the shaft journal.',[-.70,0,-.12],r=>sleeve(r,[0,0,0],x,-.17,.17,.410,.327,metal,32)),
 part('balls','Rolling elements and cage','The cage spaces the balls between the two races. Ball count is illustrative.',[.66,0,0],r=>{
  for(const k of [-1,1])sleeve(r,[0,0,0],x,k*.045,k*.063,.475,.428,'#ae915c',32);
  for(let i=0;i<10;i++){const a=i*TAU/10,pc=[0,.45*Math.cos(a),.45*Math.sin(a)];turn(r,pc,x,[[-.045,0],[-.031,.033],[0,.046],[.031,.033],[.045,0]],metal,{n:10});}
 })
]);
const centerStudy=study('e46shaftmount','Propeller-shaft center support','The center bearing runs on the shaft inside a rubber-isolated carrier. The carrier bolts to the tunnel on both sides. The catalog illustrates a separate retaining ring.',e46Sources.propshaft,[
 ['carrier','Aluminum carrier','The two mounting feet attach the bearing carrier to the body.',[.12,0,-.54]],
 ['insulator','Rubber support','Rubber between the bearing and bracket lets the shaft move slightly and limits transmitted vibration.',[0,.66,.15]],
 ['bearing','Grooved ball bearing','The steel bearing supports the shaft. Open it to see the races and rolling elements.',[.80,0,.18]],
 ['ring','Retaining ring','The split retaining ring locates the assembly axially on the shaft.',[-.68,0,.25]],
 ['studs','Mounting fasteners','Two fasteners secure the carrier feet beneath the tunnel.',[0,-.33,-.74]]
].map(([key,name,desc,offset])=>part(key,name,desc,offset,r=>support(r,key,[0,0,0],9))));
export function getE46RunningDetail(key){
 if(['drivetrain.center-support','drivetrain.propshaft'].includes(key))return centerStudy;
 if(key==='e46shaftmount.bearing')return bearing;
 return null;
}
function finalDrive(r){
 const c=[rear,0,e46HubZ];
 turn(r,c,x,[[-.202,.052],[-.150,.065],[-.104,.105],[-.035,.128],[.060,.134],[.108,.117],[.115,.107]],iron,{n:16});
 cyl(r,c,x,.10,.127,.118,cast,16);
 for(const s of [-1,1])cyl(r,c,y,s*.058,s*.151,.066,iron,16);
 for(let i=0;i<8;i++){const a=i*TAU/8,pc=add(c,[.124,.096*Math.cos(a),.096*Math.sin(a)]);cyl(r,pc,x,0,.008,.009,metal,6);}
}
function halfshafts(r){
 withEach(r,true,s=>{
  const c=[rear,0,e46HubZ],end=mount(true);
  cyl(r,c,y,s*.15,s*(end-.024),.021,steel,12);
  for(const [start,direction] of [[.152,1],[end-.041,-1]]){
   const profile=[[0,.054],[.036,.055],[.044,.046]];
   for(let i=0;i<4;i++)profile.push([.050+i*.013,.047-i*.005],[.056+i*.013,.035-i*.004]);
   turn(r,c,y,profile.map(([d,r])=>[s*(start+direction*d),r]),rubber,{n:12});
  }
 });
}
const row=(id,name,description,offset,draw,source)=>({id:'drivetrain.'+id,name,description,offset,draw,source});
export const e46Drivetrain={
 id:'drivetrain',name:'Transmission & final drive',description:'The propeller shaft runs down the transmission tunnel in two sections. A bearing supports their junction. The rear final drive sends torque through a separate jointed shaft to each rear wheel. The gearbox option and final-drive ratio depend on the vehicle.',source:e46Sources.propshaft,view:'hero',internal:true,category:'service',
 parts:[
  row('gearbox','Transmission housing','The housing meets the M54 at the bellhousing. Its rear flange drives the flex disc. This outline leaves the transmission option open.',[-.21,0,.46],drawE46Gearbox,e46Sources.propshaft),
  row('propshaft','Two-piece propeller shaft','A front tube runs back to the center bearing. The rear tube continues to the differential input. Open the mounting to inspect the carrier and bearing.',[0,-.52,.14],shaftPath,e46Sources.propshaft),
  row('flex-disc','Front flex disc','Six sleeves in the rubber coupling join the gearbox flange to the shaft flange. Bolt-circle dimensions depend on the gearbox.',[-.33,.34,.24],r=>guibo(r,[startX+.015,0,tailZ],1),e46Sources.propshaft),
  row('center-support','Center bearing and bracket','The rubber-mounted center bearing supports the shaft beneath the tunnel. Open the bracket, then open the bearing itself.',[.10,.05,.61],r=>{for(const k of supportKeys)support(r,k,shaftCenter,1);},e46Sources.propshaft),
  row('rear-differential','Rear axle final drive','The nose of the differential takes the propeller-shaft input. The two side flanges drive the rear half-shafts. Its housing mounts in the rear axle carrier.',[.41,.02,.34],finalDrive,e46Sources.diff),
  row('halfshafts','Rear CV half-shafts','Each independently suspended rear wheel has an inboard joint and an outboard joint, with rubber bellows over both.',[0,.42,-.27],halfshafts,e46Sources.shafts)
 ]
};
