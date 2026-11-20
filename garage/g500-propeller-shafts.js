// Measurements are in metres. The Welte and Driveshaft Parts replacement lengths differ.
import {TAU,add,basis,turn,cyl,sleeve,unit,part,study,origin,x,metal,steel,dark} from './mechanism-shapes.js';
import {m113CrankZ,m113RearFace} from './g500-m113-geometry.js';

const classic='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
export const shaftRefs={
 intermediate:{label:'Mercedes-Benz Classic USA · G500 intermediate shaft 463 410 07 02',url:'https://classicparts.mbusa.com/oem-parts/mercedes-benz-drive-shaft-4634100702'},
 front:{label:'Mercedes-Benz Classic USA · front propeller shaft and axle shafts',url:classic+'front-drive-axle--propeller-shaft'},
 rear:{label:'Mercedes-Benz Classic USA · rear and intermediate propeller shafts',url:classic+'universals-and-rear-axle--propeller-shaft'},
 welte:{label:'Welte · W4630702, 325 mm (p. 39), axle shafts (p. 40)',url:'https://www.welte-group.com/fileadmin/content/documents/01_Gelenkwellen/Katalog_PKW_Transporter_Gelenkwellen_DE_EN_2019-03-19.pdf#page=39'},
 interface:{label:'Driveshaft Parts · replacement connection dimensions, pp. 77–78',url:'https://sklep.przeguby.pl/api/media/FileSystemMediaConfiguration?filename=Files%5C1728553716_2024-09-waly-napedowe-driveshaft.pdf#page=77'}
};
export const shaftMeasures={length:.325,endDiameter:.108,boltDiameter:.010,boltCount:6};
// VG 150 E/3W training manual, p. 4, front view. The lower outputs are on
// the vehicle's right, with the transmission input higher and inboard.
export const transferOrigin=[.095,.12,.52];
export const transferOutputX=front=>transferOrigin[0]+(front?-.21:.21);
export const axleInputX=(front,halfWheelbase)=>front?-halfWheelbase+.270:halfWheelbase-.270;
export const transferInput=[transferOrigin[0]-.205,transferOrigin[1]-.09,transferOrigin[2]+.105];
export const gearboxOutput=add(transferInput,x,-shaftMeasures.length);
export const transferMotorPlug=add(transferOrigin,[-.106,-.12,.157]);
const rubber='#394248';
const shaftDescription='Mercedes lists 463 410 07 02 between the transmission and transfer case. Welte gives this shaft a length of 325 mm. Driveshaft Parts lists a 330 mm replacement for both 07 02 and 08 02, with 108 mm ends and six 10 mm bores on each face. The model uses the 325 mm length.';

// Each sector connects the perimeter of a genuine open bore to the outer and inner rims.
// The hole positions, joint thickness and central opening are fitted to reference photos.
function piercedRing(r,c,axis,from,to,outer,inner,count,holeRadius,pitchRadius,receiver){
 const frame=basis(axis),half=Math.PI/count;
 const at=(s,u,v)=>c.map((q,i)=>q+frame[0][i]*s+frame[1][i]*u+frame[2][i]*v);
 for(let j=0;j<count;j++){
  const theta=TAU*j/count,hu=pitchRadius*Math.cos(theta),hv=pitchRadius*Math.sin(theta);
  const perimeter=[];
  const polar=(rad,t)=>[rad*Math.cos(t),rad*Math.sin(t)];
  for(let k=-3;k<=3;k++)perimeter.push(polar(outer,theta+k*half/3));
  perimeter.push(polar(pitchRadius,theta+half));
  for(let k=3;k>=-3;k--)perimeter.push(polar(inner,theta+k*half/3));
  perimeter.push(polar(pitchRadius,theta-half));
  const hole=perimeter.map(([u,v])=>{const length=Math.hypot(u-hu,v-hv);return [hu+holeRadius*(u-hu)/length,hv+holeRadius*(v-hv)/length];});
  for(let k=0;k<perimeter.length;k++){
   const next=(k+1)%perimeter.length,a=perimeter[k],b=perimeter[next],h=hole[k],i=hole[next];
   for(const s of (receiver?[receiver==='from'?from:to]:[from,to]))r.polygon([at(s,...a),at(s,...b),at(s,...i),at(s,...h)],metal,false);
   if(!receiver)r.polygon([at(from,...h),at(from,...i),at(to,...i),at(to,...h)],dark,false);
   if(k<6||(!receiver&&k>=8&&k<14))r.polygon([at(from,...a),at(from,...b),at(to,...b),at(to,...a)],steel,false);
  }
 }
}
// Tapped receivers share the six-bore pattern. Bore depth, machining allowance
// and the register in the case flange still need a workshop section.
export function drawG500TransferInputFlange(r){
 const c=transferInput;
 piercedRing(r,c,x,0,.019,.060,.030,6,.0044,.046,'from');
 sleeve(r,c,x,.019,.091,.041,.026,dark,20);
}
function turningView(r,phase){
 if(!phase)return r;
 const angle=phase*TAU,c=Math.cos(angle),s=Math.sin(angle),view=Object.create(r);
 view.polygon=(points,...args)=>r.polygon(points.map(([x,y,z])=>[x,c*y-s*z,s*y+c*z]),...args);
 return view;
}
const midPoint=add(gearboxOutput,x,shaftMeasures.length/2),halfLength=shaftMeasures.length/2;
function cvEnd(r,c,s){
 const outer=shaftMeasures.endDiameter/2;
 piercedRing(r,c,x,s*(halfLength-.034),s*halfLength,outer,.022,shaftMeasures.boltCount,shaftMeasures.boltDiameter/2,.046);
 sleeve(r,c,x,s*(halfLength-.041),s*(halfLength-.034),.041,.023,dark,24);
}
function boot(r,c,s){
 const steps=[[.064,.015],[.067,.021],[.072,.021],[.075,.018],[.080,.025],[.086,.027],[.090,.019],[.097,.032],[.103,.033],[.108,.024],[.114,.039],[.119,.039],[.1215,.038]];
 turn(r,c,x,steps.map(([a,b])=>[a*s,b]),rubber,{n:20});
 for(const [a,b,rad] of [[.065,.069,.022],[.115,.119,.040]])sleeve(r,c,x,s*a,s*b,rad,rad-.002,metal,20);
}
const cvParts=[
 {id:'spindle',name:'Center spindle',text:'The spindle connects the two CV joints. Its hidden spline profile still needs an original drawing.',offset:[0,0,-.13],draw:(r,c)=>cyl(r,c,x,-.077,.077,.015,steel,20)},
 ...[-1,1].flatMap(s=>{
  const key=s<0?'gearbox':'transfer',title=s<0?'Transmission':'Transfer case';
  return [
   {id:key+'-housing',name:title+' CV housing',text:'The mounting face has six through-bores. The bore circle and joint thickness are estimated.',offset:[s*.15,0,0],draw:(r,c)=>cvEnd(r,c,s)},
   {id:key+'-boot',name:title+' boot and bands',text:'The boot closes around the joint and spindle. Two bands hold the large and small ends.',offset:[s*.035,s*.12,.025],draw:(r,c)=>boot(r,c,s)}
  ];
 })
];
export function drawG500InputShaft(r){for(const p of cvParts)p.draw(r,midPoint);}
export const g500InputShaftStudy=study('g500-input-shaft','Transmission-to-transfer CV shaft',shaftDescription,shaftRefs.welte,
 cvParts.map(p=>part(p.id,p.name,p.text,p.offset,(r,t)=>p.draw(turningView(r,t),origin))),
 'Both CV housings and the spindle turn together between the transmission and transfer case.');
g500InputShaftStudy.sources=[shaftRefs.intermediate,shaftRefs.welte,shaftRefs.interface];

// The 722.6 case as rings along the line from the crankshaft to the output flange.
// The bellhousing flange meets the rear face of the block and upper pan,
// 359 mm behind the middle of the crankshaft. A 1 mm joint line keeps the
// two mating faces from sharing a plane.
const caseFront=[m113RearFace+.007,0,m113CrankZ],caseSegments=18;
// The bell narrows to the main case ahead of the bulkhead. The case then
// tapers under the floor tunnel, and a short neck carries the output flange
// below the front of the center console.
const caseStations=[[0,.173],[.018,.177],[.10,.148],[.16,.134],[.30,.112],[.345,.095],[.368,.046],[gearboxOutput[0]-caseFront[0]-.024,.045]];
const caseRings=()=>caseStations.map(([d,rad])=>{
 const f=d/(gearboxOutput[0]-caseFront[0]);return Array.from({length:caseSegments},(_,i)=>{
  const a=TAU*i/caseSegments;return [caseFront[0]+d,caseFront[1]+(gearboxOutput[1]-caseFront[1])*f+Math.cos(a)*rad,caseFront[2]+(gearboxOutput[2]-caseFront[2])*f+Math.sin(a)*rad];
 });
});
// The oil pan bolts to a flat rail under the case. `g500AtfPan` is the middle
// of the pan rim. The front propeller shaft passes along the right of the pan
// at the same height, so the rail stands 30 mm left of the crank line; the
// engine and the shaft keep their fitted positions. The rail height keeps the
// solenoids under the lowest part of the round case. The outline, the offset
// and the height are estimates, not a measured installation.
export const g500AtfPanOutline=[[-.188,-.111],[-.152,-.139],[.132,-.139],[.185,-.094],[.177,.117],[.145,.135],[-.159,.135],[-.188,.093]];
export const g500AtfPan=[-.625,-.030,.436];
// The rail face stands 1 mm above the gasket and the housing ceiling 1 mm above
// the solenoids. The shoulder is high enough to run into the round case.
const railHeight=.007,ceilingHeight=.084,shoulderHeight=.109;
// A cooler union stands on a flat facet on either flank of the bell, ahead of
// the bulkhead. The right one sits low, above the front propeller shaft. The
// left one sits higher so its pipe clears the shoulder of the hydraulic housing.
// `at` is the middle of the facet and `axis` points out of it.
export function g500CoolerUnion(side){
 const rings=caseRings(),j=3,i=side>0?16:9,k=(i+1)%caseSegments;
 const quad=[rings[j-1][i],rings[j-1][k],rings[j][k],rings[j][i]],at=[0,1,2].map(n=>quad.reduce((sum,p)=>sum+p[n],0)/4);
 const u=add(quad[2],quad[0],-1),v=add(quad[3],quad[1],-1);
 const normal=unit([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]);
 return {at,axis:normal[1]*side>0?normal:normal.map(n=>-n)};
}

// The case alone, as the engine view shows it. Body and bell contours are
// estimated. The tail face meets the CV joint.
export function drawG500GearboxCase(r){
 const front=caseFront,rear=gearboxOutput,segments=caseSegments,rings=caseRings();
 for(let j=1;j<rings.length;j++)for(let i=0;i<segments;i++){const k=(i+1)%segments;r.polygon([rings[j-1][i],rings[j-1][k],rings[j][k],rings[j][i]],i<12?steel:dark,false);}
 sleeve(r,front,x,-.006,.008,.184,.156,metal,24);
 piercedRing(r,rear,x,-.025,0,.054,.021,6,.0044,.046,'to');
}

export function drawG500Gearbox(r){
 drawG500GearboxCase(r);
 // The hydraulic housing hangs under the main case and ends in the pan rail.
 // It is open underneath: the valve body, conductor plate and solenoids stand
 // inside it under its ceiling, and the pan and gasket close it from below.
 const ring=(scale,height)=>g500AtfPanOutline.map(([u,v])=>[g500AtfPan[0]+u*scale,g500AtfPan[1]+v*scale,g500AtfPan[2]+height]);
 const rail=ring(1,railHeight),face=ring(.96,railHeight),shoulder=ring(1,shoulderHeight);
 for(let i=0;i<rail.length;i++){
  const k=(i+1)%rail.length;
  r.polygon([rail[i],rail[k],shoulder[k],shoulder[i]],steel,false);
  r.polygon([rail[i],rail[k],face[k],face[i]],metal,false);
 }
 r.polygon(ring(1,ceilingHeight),dark,false);
 r.polygon(shoulder,steel,false);
 // The starter boss bulges from the right of the bellhousing flange to the
 // starter's mounting face. Its outline is estimated.
 const boss=[[.150,.600],[.215,.585],[.305,.600],[.312,.655],[.255,.680],[.160,.695]];
 const bell=[caseFront[0]-.006,caseFront[0]+.008];
 const bossFace=boss.map(([yy,zz])=>[bell[0],yy,zz]),bossRear=boss.map(([yy,zz])=>[bell[1],yy,zz]);
 r.polygon(bossFace,metal,false);r.polygon([...bossRear].reverse(),steel,false);
 for(let i=0;i<boss.length;i++){const k=(i+1)%boss.length;r.polygon([bossFace[i],bossFace[k],bossRear[k],bossRear[i]],steel,false);}
}

// The outer propellers have two cross joints each. Distances between working flanges
// follow installed hardpoints; supplier nominal lengths do not define suspension position.
export function drawG500AxleShaft(r,start,end,only){
 // Each flange sits square on its receiver. The two cross joints take up
 // the working angle between those faces and the shaft tube.
 const flangeAxis=[Math.sign(end[0]-start[0]),0,0];
 const first=add(start,flangeAxis,.049),last=add(end,flangeAxis,-.049);
 const direction=unit(last.map((v,i)=>v-first[i]));
 const common=Math.hypot(direction[1],direction[2])>1e-8?unit([0,-direction[2],direction[1]]):[0,1,0];
 const other=[direction[1]*common[2]-direction[2]*common[1],-direction[0]*common[2],direction[0]*common[1]];
 if(!only||only==='tube')r.rod(add(first,direction,.043),add(last,direction,-.039),.030,steel,16);
 if(!only||only==='slip')sleeve(r,first,direction,.171,.271,.036,.030,dark,18);
 for(const sign of [1,-1]){
  const face=sign===1?start:end,center=sign===1?first:last;
  const key=sign===1?'transfer':'axle';
  if(!only||only===key+'-flange')piercedRing(r,face,flangeAxis,0,sign*.012,.05,.022,8,.004,.04);
  if(!only||only===key+'-yokes')for(const s of [-1,1]){
   r.rod(add(add(face,flangeAxis,sign*.012),common,s*.029),add(center,common,s*.029),.011,steel,10);
   r.rod(add(add(center,direction,sign*.043),other,s*.028),add(center,other,s*.028),.012,steel,10);
  }
  if(!only||only===key+'-cross')for(const axis of [common,other])cyl(r,center,axis,-.037,.037,.012,metal,12);
  if(!only||only===key+'-yokes')sleeve(r,center,direction,sign*.033,sign*.049,.034,.020,steel,16);
 }
}

export function g500AxleShaftStudy(front){
 const side=front?'front':'rear',length=front?.950:.990,number=front?'13 02':'11 02';
 const pieces=[
  ['tube','Shaft tube','The tube joins the two yokes.',[0,-.15,0]],
  ['slip','Sliding sleeve','The sliding section takes up changes in working length as the axle moves.',[0,.14,0]]
 ];
 for(const [end,sign] of [['transfer',-1],['axle',1]]){
  const label=end==='transfer'?'Transfer case':'Axle';
  pieces.push([end+'-flange',label+' flange','Eight holes carry the flange fasteners.',[sign*.16,0,0]],
   [end+'-yokes',label+' yokes','The flange yoke and shaft yoke support opposite trunnions.',[0,sign*.13,0]],
   [end+'-cross',label+' cross','The perpendicular journals allow the joint to articulate.',[0,0,sign*.13]]);
 }
 const other=front?'930':'970';
 const view=study('g500-'+side+'-propeller',front?'Front propeller shaft':'Rear propeller shaft',
  'Mercedes identifies this shaft as 463 410 '+number+'. The isolated shaft uses Welte’s '+Math.round(length*1000)+' mm catalog length. Driveshaft Parts lists '+other+' mm for the same OE number. Installed length follows the axle and transfer-case positions; the working length and spline travel still need measurement.',
  shaftRefs[side],pieces.map(([key,name,desc,offset])=>part(key,name,desc,offset,(r,t)=>drawG500AxleShaft(turningView(r,t),[-length/2,0,0],[length/2,0,0],key))),
  'Follow both cross joints around the shaft axis. The shaft is shown straight in this study.');
 view.sources=[shaftRefs[side],shaftRefs.welte,shaftRefs.interface];return view;
}
