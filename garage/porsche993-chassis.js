// 993 Carrera chassis: MacPherson front axle, LSA multi-link rear axle and
// power rack-and-pinion steering. The parts and their connections follow the
// Porsche parts catalogue groups listed in `chassisRefs`; the hard points are
// fitted to this model's wheels, body and packaged systems, not measured.
import {add, mix, part, cyl, turn, x, y, z, TAU} from './mechanism-shapes.js';

export const chassisRefs={
 frontAxle:{label:'Porsche 993 parts catalogue · 401-000 cross member, track control arm',url:'https://eurospares.co.uk/Porsche/993/993_(1997)/PartDiagrams/401-000/CROSS_MEMBER_-_TRACK_CONTROL_ARM'},
 frontCarrier:{label:'Porsche 993 parts catalogue · 401-005 wheel carrier, wheel hub',url:'https://eurospares.co.uk/Porsche/993/993_(1994)/PartDiagrams/401-005/WHEEL_CARRIER_-_WHEEL_HUB'},
 strut:{label:'Design911 · 993 front suspension, shock absorber strut (402-00)',url:'https://www.design911.co.uk/porsche/993--911--rs-1994-97/porsche-front-shock-absorber-parts/'},
 shocks:{label:'Porsche Technical Information 145/15 · 993 replacement shock absorbers, coil springs and rear stabilizer links',url:'https://static.nhtsa.gov/odi/tsbs/2017/MC-10117512-9999.pdf'},
 rearAxle:{label:'Porsche 993 parts catalogue · 501-000 rear axle (wheel carrier, side panel, track control arms)',url:'https://www.eurospares.co.uk/Porsche/993/1998_(993)/PartDiagrams/501-000/REAR_AXLE'},
 rearCarrier:{label:'Porsche 993 parts catalogue · 501-001 rear axle carrier, stabilizer',url:'https://www.eurospares.co.uk/Porsche/993/1998_(993)/PartDiagrams/501-001/REAR_AXLE_CARRIER_-_STABILIZER'},
 rearHub:{label:'Porsche 993 parts catalogue · 501-005 drive shaft, rear wheel hub',url:'https://eurospares.co.uk/Porsche/993/993_(1998)/PartDiagrams/501-005/DRIVE_SHAFT_-_REAR-WHEEL_HUB'},
 upperLink:{label:'Design911 · 993 rear upper control arm, joins wheel carrier and side section',url:'https://www.design911.co.uk/parts/99333106502/'},
 steering:{label:'Porsche 993 parts catalogue · 403-000 steering gear, power steering, tie rods',url:'https://www.eurospares.co.uk/Porsche/993/1998_(993)/PartDiagrams/403-000/STEERING_GEAR_-_STEERING_PARTS'},
 steeringFluid:{label:'Porsche 993 parts catalogue · 403-001 power steering oil container and lines',url:'https://new-store.9xx-parts.com/t/parts/911/porsche-911-carrera-1994-2021/1994-1998/4-front-axle-steering/03-steering-gear/403-001-power-steering'},
 springPaint:{label:'Rennlist 993 forum · springs are black with paint marks; a black front spring with three blue dots is the standard (not M030) spring',url:'https://rennlist.com/forums/993-forum/16622-shock-part-number.html'},
 steeringPump:{label:'Porsche 993 parts catalogue · 403-004 power steering pump, container',url:'https://www.eurospares.co.uk/Porsche/993/1998_(993)/PartDiagrams/403-004/POWER_STEERING_-_POWER-STEERING_PUMP_-_CONTAINER'}
};

const iron='#5d6566',steel='#8f9a9b',alloy='#a9afa6',black='#30363a',rubber='#24282a',spring='#1e2123',springSheen='#2b2f32',springMark='#2f5fb0',zinc='#b8bcb0';
const row=(key,name,description,offset,source,draw)=>({...part(key,name,description,offset,draw),source});
const sides=[[-1,'left','Left'],[1,'right','Right']];
const M=([px,py,pz],s)=>[px,py*s,pz];
const rod=(r,a,b,rad,color,n=6)=>r.rod(a,b,rad,color,Math.min(n,8));
function eye(r,c,axis,rad,color){cyl(r,c,axis,-rad*.9,rad*.9,rad,color,6);}
function link(r,a,b,rad,color){rod(r,a,b,rad,color,8);eye(r,a,y,rad*1.35,rubber);eye(r,b,y,rad*1.25,iron);}
function ball(r,c,rad,color){turn(r,c,z,[[-rad,0],[-rad*.7,rad*.72],[0,rad],[rad*.7,rad*.72],[rad,0]],color,{n:6});}
// Springs are black with paint marks (chassisRefs.springPaint); the standard
// front spring carries three blue dots in a row.
function strut(r,base,top,{tube=.024,rodR=.010,coil=.046,seat=.064,coilFrom=.52,turns=4,marks=0}={}){
 // Damper tube, piston rod, a pitched coil between two seats and the top mount.
 const d=top.map((v,i)=>v-base[i]),len=Math.hypot(...d),u=d.map(v=>v/len);
 const at=t=>add(base,u,len*t);
 rod(r,base,at(.62),tube,iron,8);rod(r,at(.62),top,rodR,zinc,8);
 const a=Math.abs(u[2])>.9?x:z,v1=unit(cross(u,a)),v2=cross(u,v1);
 const lo=coilFrom,hi=.95,n=turns*9;
 // The coil is a continuous pitched strip (as in the 992 strut), one face per step.
 const p=(i,edge)=>{const t=lo+(hi-lo)*i/n+edge*.006/len,ang=TAU*turns*i/n;return add(add(at(t),v1,coil*Math.cos(ang)),v2,coil*Math.sin(ang));};
 for(let i=0;i<n;i++)r.polygon([p(i,-1),p(i,1),p(i+1,1),p(i+1,-1)],marks&&i<2*marks&&i%2?springMark:i%3?spring:springSheen,false);
 for(const t of [lo-.02,hi+.01])cyl(r,at(t),u,-.004,.004,seat,black,12);
 cyl(r,top,u,-.012,.016,seat*.82,rubber,12);
 eye(r,base,y,tube*1.15,iron);
}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>a.map(v=>v/Math.hypot(...a));

// ---------------- Front axle (MacPherson strut, track control arm) ----------
export const front={
 axle:-1.16,hubY:.648,
 strutBase:[-1.150,.610,.405],strutTop:[-1.120,.470,.705],
 ball:[-1.160,.645,.205],
 pivotFront:[-1.215,.300,.215],pivotRear:[-.950,.330,.220],
 crossX:[-1.245,-1.080],crossY:.360,crossZ:[.175,.215],
 tieOuter:[-1.040,.600,.235],rackX:-1.020,rackY:.300,rackZ:.272,
 barX:-1.330,barZ:.245,barEnd:[-1.215,.470,.245],barLink:[-1.205,.470,.212]
};
function frontCarrier(r,s){
 const c=[front.axle,s*front.hubY,.322];
 // Upright from the ball joint to the strut clamp, the hub boss and the
 // rearward steering arm.
 rod(r,M(front.ball,s),[front.axle,s*.640,.290],.026,iron,10);
 rod(r,[front.axle,s*.640,.290],M(front.strutBase,s),.024,iron,10);
 cyl(r,c,y,s<0?-.012:-.030,s<0?.030:.012,.058,iron,12);
 rod(r,[front.axle,s*.636,.275],M(front.tieOuter,s),.014,iron,8);
 ball(r,M(front.ball,s),.020,steel);
}
function frontHub(r,s){
 // Double-row bearing in the carrier; the hub flange carries the disc.
 const c=[front.axle,s*front.hubY,.322];
 cyl(r,c,y,s<0?-.040:.030,s<0?-.030:.040,.072,steel,12);
 cyl(r,c,y,-.030,.030,.036,zinc,14);
}
function frontArm(r,s){
 const b=M(front.ball,s),f=M(front.pivotFront,s),k=M(front.pivotRear,s);
 link(r,f,b,.015,steel);rod(r,k,mix(f,b,.55),.014,steel,8);eye(r,k,x,.022,rubber);
}
function crossMember(r){
 const [x0,x1]=front.crossX,[z0,z1]=front.crossZ;
 r.box(x0,-front.crossY,z0,x1,front.crossY,z1,alloy);
 for(const s of [-1,1]){
  const p=M(front.pivotFront,s);r.box(p[0]-.03,s<0?p[1]-.035:p[1]-.005,z0-.012,p[0]+.03,s<0?p[1]+.005:p[1]+.035,z1+.008,alloy);
 }
}
function frontBar(r){
 // Torsion bar ahead of the axle; drop links to the track control arms.
 const pts=[[front.barX,-.40,front.barZ],[front.barX,.40,front.barZ]];
 rod(r,pts[0],pts[1],.011,black,8);
 for(const s of [-1,1]){
  rod(r,[front.barX,s*.40,front.barZ],M(front.barEnd,s),.011,black,8);
  rod(r,M(front.barEnd,s),M(front.barLink,s),.006,steel,6);
  for(const yy of [.24,-.24])cyl(r,[front.barX,yy,front.barZ],y,-.018,.018,.020,rubber,10);
 }
}
// ---------------- Rear axle (LSA multi-link) -------------------------------
export const rear={
 axle:1.112,hubY:.655,wheelZ:.3195,
 ball:[1.112,.655,.222],top:[1.112,.636,.470],
 frontCross:[.845,.885],crossY:.430,crossZ:[.262,.300],
 lowerFront:[.865,.420,.281],lowerRear:[1.268,.490,.262],
 plate:{y:.500,x:[1.020,1.275],z:[.420,.545]},
 upperFront:[1.040,.490,.500],upperRear:[1.250,.490,.505],
 toe:[[1.200,.620,.360],[1.272,.490,.360]],
 damperBase:[.985,.548,.258],damperTop:[.935,.440,.650],
 barX:.830,barZ:.285,barEnd:[.950,.500,.300],barLink:[.950,.505,.262]
};
function rearCarrier(r,s){
 const c=[rear.axle,s*rear.hubY,rear.wheelZ];
 // Cast carrier around the hub bearing, with the lower ball-joint boss, two
 // upper arms and the rearward toe arm.
 cyl(r,c,y,s<0?-.008:-.032,s<0?.032:.008,.066,iron,12);
 rod(r,M(rear.ball,s),[rear.axle,s*.640,.262],.022,iron,8);
 rod(r,[rear.axle,s*.640,.380],M(rear.top,s),.022,iron,8);
 rod(r,[rear.axle+.040,s*.630,.330],M(rear.toe[0],s),.014,iron,8);
 ball(r,M(rear.ball,s),.019,steel);
}
function rearHub(r,s){
 const c=[rear.axle,s*rear.hubY,rear.wheelZ];
 cyl(r,c,y,s<0?-.044:.034,s<0?-.034:.044,.070,steel,12);
}
function sidePanel(r,s){
 const P=rear.plate,y0=s*P.y;
 r.box(P.x[0],Math.min(y0,y0+s*.014),P.z[0],P.x[1],Math.max(y0,y0+s*.014),P.z[1],alloy);
 // Lower bracket for the rearward lower link and the toe link.
 r.box(rear.lowerRear[0]-.022,Math.min(y0,y0-s*.020),rear.lowerRear[2]-.016,rear.lowerRear[0]+.022,Math.max(y0,y0-s*.020),P.z[0],alloy);
}
function rearCross(r){
 const [x0,x1]=rear.frontCross,[z0,z1]=rear.crossZ;
 r.box(x0,-rear.crossY,z0,x1,rear.crossY,z1,alloy);
}
function lowerArm(r,s){
 const b=M(rear.ball,s);
 link(r,M(rear.lowerFront,s),b,.015,steel);link(r,M(rear.lowerRear,s),b,.014,steel);
}
function upperArm(r,s){
 const t=M(rear.top,s);
 link(r,M(rear.upperFront,s),t,.013,steel);link(r,M(rear.upperRear,s),t,.013,steel);
}
function rearBar(r){
 // Ahead of the axle, under the transaxle, with links to the lower wishbones.
 rod(r,[rear.barX,-.42,rear.barZ],[rear.barX,.42,rear.barZ],.010,black,8);
 for(const s of [-1,1]){
  rod(r,[rear.barX,s*.42,rear.barZ],M(rear.barEnd,s),.010,black,8);
  rod(r,M(rear.barEnd,s),M(rear.barLink,s),.006,steel,6);
 }
}
// ---------------- Steering ------------------------------------------------
const pinion=[front.rackX+.005,-.285,front.rackZ+.010];
// Pinion, two universal joints below the bulkhead, then the column under the
// heater housing and the instrument binnacle to the wheel hub.
export const steeringPath=[pinion,[-.990,-.300,.330],[-.920,-.330,.400],[-.820,-.335,.470],[-.700,-.315,.545],[-.450,-.322,.665],[-.285,-.328,.772]];
function rack(r){
 const [rx,ry,rz]=[front.rackX,front.rackY,front.rackZ];
 rod(r,[rx,-ry,rz],[rx,ry,rz],.026,alloy,12);
 cyl(r,pinion,z,-.040,.035,.030,alloy,12);
 for(const s of [-1,1]){
  // Bellows at each end of the rack housing.
  for(let i=0;i<4;i++){const yy=s*(ry+.010+i*.018);cyl(r,[rx,yy,rz],y,-.007,.007,i%2?.022:.030,rubber,8);}
 }
 // Mounting clamps to the cross member.
 for(const s of [-1,1])r.box(rx-.025,s*.18-.02,front.crossZ[1],rx+.025,s*.18+.02,rz-.020,alloy);
}
function tieRod(r,s){
 const inner=[front.rackX,s*(front.rackY+.085),front.rackZ],outer=M(front.tieOuter,s);
 rod(r,inner,outer,.010,steel,8);ball(r,outer,.016,steel);
}
function column(r){
 // Intermediate shaft with two universal joints, then the column in its tube.
 for(let i=1;i<steeringPath.length;i++)rod(r,steeringPath[i-1],steeringPath[i],i<4?.010:.020,i<4?steel:black,10);
 for(const p of steeringPath.slice(1,4))cyl(r,p,z,-.014,.014,.017,iron,10);
}
const pump=[1.660,-.520,.480],reservoir=[1.700,-.575,.680];
function steeringPump(r){
 // Vane pump on the left of the engine, belt-driven, with its reservoir above.
 cyl(r,pump,x,-.055,.045,.040,alloy,14);cyl(r,pump,x,.045,.060,.050,iron,12);
 cyl(r,reservoir,z,-.050,.050,.042,'#2b2f30',14);cyl(r,reservoir,z,.050,.062,.022,black,10);
}
// Pump to gear: down beside the left heat exchanger, under the half-shaft
// and the cabin floor, then up to the valve on the steering gear.
export const pressurePath=[add(pump,[-.055,.030,-.020]),[1.58,-.47,.40],[1.45,-.44,.30],[1.30,-.45,.245],[.90,-.45,.245],[.75,-.45,.262],[-.70,-.45,.262],[-.92,-.30,.270],[front.rackX+.035,-.150,front.rackZ+.012]];
function steeringLines(r){
 for(let i=1;i<pressurePath.length;i++)rod(r,pressurePath[i-1],pressurePath[i],.007,black,4);
 const ret=pressurePath.map(([a,b,c])=>[a,b+.025,c]);
 ret[0]=add(reservoir,[0,0,-.050]);ret[1]=[1.62,-.50,.45];ret[ret.length-1]=[front.rackX+.035,-.115,front.rackZ+.012];
 for(let i=1;i<ret.length;i++)rod(r,ret[i-1],ret[i],.006,'#4b5254',4);
}

function assembly(id,name,description,source,rows){
 return {id,name,description,source,category:'service',internal:true,view:'hero',viewAngle:[.76,-.35],parts:rows.map(p=>({...p,id:id+'.'+p.id,category:'service'}))};
}
const perSide=(key,name,description,offset,source,draw)=>sides.map(([s,hand,label])=>row(`${key}-${hand}`,`${label} ${name}`,description,M(offset,s),source,r=>draw(r,s)));

const suspensionRows=[
 row('front-cross-member','Front axle cross member','The cross member spans the front compartment floor. It carries both track control arms and the steering gear.',[0,0,-.20],chassisRefs.frontAxle,crossMember),
 ...perSide('front-strut','front spring strut','The coil spring sits on the damper. The strut clamps to the wheel carrier and its top mount sits in the body tower.',[0,.25,.20],chassisRefs.strut,(r,s)=>strut(r,M(front.strutBase,s),M(front.strutTop,s),{marks:3})),
 ...perSide('front-arm','front track control arm','Two rubber-bushed pivots on the cross member locate the ball joint at the foot of the wheel carrier.',[0,.18,-.12],chassisRefs.frontAxle,frontArm),
 ...perSide('front-carrier','front wheel carrier','The carrier holds the hub bearing. The strut sets its top, the track control arm its foot and the tie rod its steering angle.',[0,.30,0],chassisRefs.frontCarrier,frontCarrier),
 ...perSide('front-hub','front wheel hub and bearing','The double-row bearing in the carrier supports the hub flange, which carries the brake disc and wheel.',[0,.40,0],chassisRefs.frontCarrier,frontHub),
 row('front-stabilizer','Front anti-roll bar','The torsion bar crosses ahead of the axle. Its drop links twist it when one wheel rises more than the other.',[-.18,0,-.08],chassisRefs.frontAxle,frontBar),
 row('rear-cross-member','Rear axle front cross member','The light-alloy cross member ahead of the axle carries the forward lower links of both sides.',[-.18,0,-.18],chassisRefs.rearCarrier,rearCross),
 ...perSide('rear-side-panel','rear axle side panel','The side panel bolts to the body beside the wheel housing. It carries the upper links, the rear lower link and the toe link.',[0,.20,.10],chassisRefs.rearAxle,sidePanel),
 ...perSide('rear-lower-arm','rear lower wishbone','Two separate links meet at the ball joint under the wheel carrier and take the wheel load into the axle carrier.',[0,.16,-.14],chassisRefs.rearAxle,lowerArm),
 ...perSide('rear-upper-arm','rear upper wishbone','Two links join the top of the wheel carrier to the side panel and set camber as the wheel moves.',[0,.18,.14],chassisRefs.upperLink,upperArm),
 ...perSide('rear-toe-link','rear toe link','The track control arm behind the axle sets toe. Its bushes let the wheel toe in slightly under load, the LSA axle\'s self-steer.',[.12,.16,0],chassisRefs.rearAxle,(r,s)=>link(r,M(rear.toe[1],s),M(rear.toe[0],s),.011,steel)),
 ...perSide('rear-carrier','rear wheel carrier','The cast carrier holds the hub bearing and the drive shaft. Five links locate it.',[0,.30,0],chassisRefs.rearAxle,rearCarrier),
 ...perSide('rear-hub','rear wheel hub and bearing','The drive shaft turns the hub inside its bearing; the flange carries the disc and wheel.',[0,.40,0],chassisRefs.rearHub,rearHub),
 ...perSide('rear-strut','rear spring and damper','The coil-over unit runs from the lower wishbone to its mount in the body ahead of the wheel.',[-.10,.20,.16],chassisRefs.shocks,(r,s)=>strut(r,M(rear.damperBase,s),M(rear.damperTop,s),{coilFrom:.42})),
 row('rear-stabilizer','Rear anti-roll bar','The bar crosses under the transaxle ahead of the axle; short links run to the lower wishbones.',[-.16,0,-.10],chassisRefs.shocks,rearBar)
];
const steeringRows=[
 row('rack','Rack-and-pinion steering gear','The power-assisted gear sits on the front cross member. The pinion on the left turns from the steering shaft; the rack moves both tie rods.',[0,0,-.12],chassisRefs.steering,rack),
 ...perSide('tie-rod','tie rod','The tie rod links the rack to the steering arm on the wheel carrier. Its outer ball joint sets toe.',[0,.20,-.06],chassisRefs.steering,tieRod),
 row('column','Steering column and intermediate shaft','Two universal joints carry the column through the front bulkhead down to the pinion.',[0,-.18,.10],chassisRefs.steering,column),
 row('pump','Power steering pump and reservoir','The belt-driven pump on the left of the engine draws fluid from the reservoir above it.',[.10,-.18,.10],chassisRefs.steeringPump,steeringPump),
 row('lines','Power steering pressure and return lines','A pressure line and a return line run the length of the car between the pump in the engine compartment and the steering gear.',[0,-.16,-.10],chassisRefs.steeringFluid,steeringLines)
];
export const chassisGroups=[
 assembly('993-suspension','Front struts and LSA rear axle','The front wheels steer on MacPherson struts located by track control arms on a cross member. At the rear, the LSA axle guides each wheel carrier with five links mounted to light-alloy side panels and a front cross member. Hard points are fitted to the model, not measured.',chassisRefs.rearAxle,suspensionRows),
 assembly('993-steering','Power steering','Hydraulically assisted rack-and-pinion steering: the pump at the engine feeds the steering gear on the front cross member through lines along the car.',chassisRefs.steering,steeringRows)
];
