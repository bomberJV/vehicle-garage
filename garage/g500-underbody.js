// 463.249 US long wheelbase. Parts plates establish attachment topology, not measured pivot coordinates.
import {getG500BearingDetail} from './g500-wheel-bearings.js';
import {drawG500Disc,g500DiscSpecs} from './g500-rotors.js';
export {drawG500Rotor} from './g500-rotors.js';
import {G500_WHEEL_DIMENSIONS,g500StockWheel} from './g500-wheel-specs.js';
import {cyl,sleeve,turn,part,study,metal,steel,dark,x,y,z} from './mechanism-shapes.js';

const catalog='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/suspension/';
const ref=(label,page)=>({label,url:catalog+page});
export const g500AxleSources={
  front:ref('2002 G500 plate · front axle, CV joints and carrier','front-axle-carrier'),
  rear:ref('2002 G500 plate · rear axle casing and flanged shaft','axle-housing-rear'),
  frontLinks:ref('2002 G500 plate · front radius arm, track bar and spring','front-suspension-components'),
  rearLinks:ref('2002 G500 plate · rear trailing arm, track bar and spring','rear-suspension-components'),
  rotors:{label:'Brembo · W463 G500 brake-disc dimensions',url:'https://www.bremboparts.com/america/en/catalogue/mercedes-benz-g-class-w463-g-500-463-247-463-248-463-249-463-240-463-241/000010142-1'}
};
// The existing wheel convention puts the axle 40 mm above the nominal unloaded tire radius.
export const g500HubZ=G500_WHEEL_DIMENSIONS.wheelRadius+.04;
export const g500HalfWheelbase=G500_WHEEL_DIMENSIONS.wheelbase/2;
const fronts=-g500HalfWheelbase,rears=g500HalfWheelbase;
const front={'axle':fronts,dir:1};
const rear={'axle':rears,dir:-1};
const rubber='#313b3c';

export const g500SuspensionParts=[
  ['rear-axle','Rigid rear axle housing','The rear axle casing carries both wheel ends. The flanged shafts run through the tubes. The differential and propeller shaft open in Differentials & locks.',g500AxleSources.rear],
  ['radius-arms','Front radius arms','Two arms extend aft from the front axle. Each has two bushed eyes at the axle and a rubber-isolated frame end.',g500AxleSources.frontLinks],
  ['trailing-arms','Rear trailing arms','A pair of arms runs forward from the rear axle to the chassis. The two axle-end eyes restrain rotation of the axle housing.',g500AxleSources.rearLinks],
  ['front-track-bar','Front Panhard rod','A separate, bent transverse rod links the front axle to the frame and restrains lateral movement.',g500AxleSources.frontLinks],
  ['rear-track-bar','Rear Panhard rod','A transverse rod with a bushing at each end locates the rear axle sideways. The longitudinal arms locate it fore and aft.',g500AxleSources.rearLinks]
].map(([id,name,description,source])=>({id:'suspension.'+id,name,description,source}));

export function drawG500Frame(r){
 // The G500 frame plate shows the boxed rails climbing over the axles and a low midsection.
 const railTop=[[-1.96,.648],[-1.73,.693],[-1.44,.695],[-1.15,.641],[-.74,.523],
   [-.52,.499],[.46,.501],[.77,.550],[1.13,.674],[1.42,.701],[1.75,.704],[2.02,.670]];
 const profile=[...railTop,...railTop.slice().reverse().map(([xx,zz])=>[xx,zz-.099])];
 for(const side of [-1,1]){
   const railY=side*.495;
   r.profile(profile,railY-.04,railY+.04,dark);
   for(const axle of [fronts,rears]){
     const spring=[axle,side*.48,.860];
     // The frame-mounted spring cup and shock tower stay with the sprung body.
     cyl(r,spring,z,-.007,.006,.091,steel,16);
     for(const edge of [-1,1])r.rod([axle+edge*.10,railY,.677],[axle+edge*.064,side*.48,.866],.013,steel,8);
     const eye=[axle+.06,side*.62,.895];
     for(const edge of [-1,1])r.rod([axle+edge*.085,railY,.671],eye,.012,dark,8);
     sleeve(r,eye,y,-.021,.021,.033,.012,steel,12);
     const toFrame=axle===fronts?1:-1,xx=axle+toFrame*.83;
     r.box(xx-.027,side*.52-.043,.420,xx+.027,side*.52+.043,.512,dark);
   }
 }
 for(const [station,height] of [[-1.91,.60],[-.87,.503],[.22,.449],[1.87,.641]])
   r.rod([station,-.49,height],[station,.49,height],.040,dark,12);
}
function beam(r,axle,isFront){
  for(const s of [-1,1]){
    r.rod([axle,s*.065,g500HubZ],[axle,s*.70,g500HubZ],.055,steel,12);
    cyl(r,[axle,s*.48,g500HubZ+.054],z,-.007,.005,.095,dark,16);
    if(isFront){
      // The spherical joint casing nests in the steering knuckle at each front tube end.
      turn(r,[axle,s*.68,g500HubZ],y,[[-.071,.046],[-.043,.077],[0,.083],[.043,.077],[.071,.046]],metal,{n:14});
    }else{
      sleeve(r,[axle,s*.70,g500HubZ],y,-.018,.018,.089,.030,dark,14);
    }
  }
}
function axleLinks(r,{axle,dir}){
  for(const s of [-1,1])r.instance((dir===1?'front':'rear')+'-'+(s<0?'left':'right'),()=>{
    const side=s*.53,spindle=axle+dir*.83;
    const station=(along,height)=>[axle+dir*along,side,height];
    const far=station(-.109,g500HubZ-.058),near=station(.101,g500HubZ-.035);
    r.rod(far,near,.030,dark,10);
    r.rod(near,station(.28,.393),.035,dark,10);
    r.rod(station(.28,.393),[spindle,side,.443],.025,steel,10);
    for(const mount of [far,near]){
      sleeve(r,mount,y,-.037,.037,.052,.032,dark,14);
      sleeve(r,mount,y,-.039,.039,.033,.012,rubber,12);
      cyl(r,mount,y,-.043,.043,.011,metal,10);
    }
    // The stud at the frame end passes through two opposing rubber cushions.
    const at=[spindle,side,.443];
    for(const end of [-1,1]){
      sleeve(r,at,x,end*.014,end*.041,.044,.013,rubber,12);
      cyl(r,at,x,end*.040,end*.046,.044,metal,12);
    }
    cyl(r,at,x,-.064,.064,.012,metal,10);
  });
}
function trackBar(r,{axle,dir}){
  const station=axle-dir*.117;
  const a=[station,dir*.627,g500HubZ+.060],b=[station,-dir*.495,.609];
  const shape=dir===1?[a,[station,.33,.525],[station,-.24,.525],b]:[a,b];
  for(let i=1;i<shape.length;i++)r.rod(shape[i-1],shape[i],.021,steel,12);
  for(const eye of [a,b]){
    sleeve(r,eye,x,-.025,.025,.036,.022,dark,14);
    sleeve(r,eye,x,-.027,.027,.022,.009,rubber,12);
  }
}
export function drawG500AxleLocation(r){
  r.tag('steering.axle',()=>beam(r,fronts,true));
  r.tag('suspension.rear-axle',()=>beam(r,rears,false));
  r.tag('suspension.radius-arms',()=>axleLinks(r,front));
  r.tag('suspension.trailing-arms',()=>axleLinks(r,rear));
  r.tag('suspension.front-track-bar',()=>trackBar(r,front));
  r.tag('suspension.rear-track-bar',()=>trackBar(r,rear));
}
export function g500RotorCenter(rear,side){
 const {trackFront,trackRear}=G500_WHEEL_DIMENSIONS;
 const wheelMount=(rear?trackRear:trackFront)/2+g500StockWheel.offset;
 // Catalog height is from the wheel mounting plane to the inner friction face.
 const {height,thickness}=g500DiscSpecs[rear?'rear':'front'];
 return [(rear?1:-1)*g500HalfWheelbase,side*(wheelMount-height+thickness/2),g500HubZ];
}
export function drawG500InstalledRotor(r,rear,side){
 drawG500Disc(r,g500RotorCenter(rear,side),rear,side);
}

function linkStudy(side){
 const longitudinal=side==='front',kind=longitudinal?'radius arm':'trailing arm';
 const source=longitudinal?g500AxleSources.frontLinks:g500AxleSources.rearLinks;
 const eyes=[[-.46,0,.32],[-.08,0,.37]],frame=[.99,0,.48];
 return study('g500-'+side+'-arm',longitudinal?'Front radius arm':'Rear trailing arm',
  'At the axle, two bushed eyes on the '+kind+' resist housing rotation. The opposite end passes through rubber cushions at the frame. The drawing follows the plate’s connections and uses enlarged section sizes.',source,[
  part('arm','Arm and frame-end stud','The axle end has two eyes. The tapered arm reaches the chassis through a threaded stem.',[0,0,-.30],r=>{
   for(const eye of eyes)sleeve(r,eye,y,-.091,.091,.118,.082,steel,20);
   r.rod(eyes[0],eyes[1],.039,dark,12);
   r.rod(eyes[1],[.20,0,.40],.054,steel,12);r.rod([.20,0,.40],[.83,0,.48],.041,steel,12);
   cyl(r,frame,x,-.17,.22,.023,metal,12);
  }),
  ...eyes.map((eye,i)=>part('eye-'+(i+1),'Axle eye bushing '+(i+1),'A tubular inner sleeve sits inside the rubber bushing.',[0,i===0?-.46:.46,.10],r=>{
   sleeve(r,eye,y,-.094,.094,.082,.033,rubber,20);sleeve(r,eye,y,-.099,.099,.033,.019,metal,18);
  })),
  ...[-1,1].map(s=>part(s<0?'front-cushion':'rear-cushion',s<0?'First frame cushion':'Second frame cushion','One rubber cushion sits on each side of the frame bracket.',[s*.47,0,.22],r=>{
   sleeve(r,frame,x,s*.025,s*.084,.086,.024,rubber,20);
  }))
 ]);
}
function panhardStudy(side){
 const front=side==='front',source=front?g500AxleSources.frontLinks:g500AxleSources.rearLinks;
 const path=front?[[-.83,0,.25],[-.49,0,.41],[.53,0,.41],[.84,0,.48]]:[[-.83,0,.30],[.84,0,.44]];
 const eyes=[path[0],path.at(-1)];
 return study('g500-'+side+'-panhard',(front?'Front':'Rear')+' Panhard rod',
  'One end pivots on the frame and the other on the axle. Each end contains a rubber bushing. The rod limits sideways axle travel as the suspension moves.',source,[
  part('bar','Track bar and eyes','A rigid rod connects the eye housings.',[0,0,-.30],r=>{
   for(let i=1;i<path.length;i++)r.rod(path[i-1],path[i],.046,steel,14);
   for(const eye of eyes)sleeve(r,eye,y,-.072,.072,.094,.064,dark,18);
  }),
  ...eyes.map((eye,i)=>part('bush-'+(i+1),i?'Frame-side bushing':'Axle-side bushing','The rubber between the sleeve and the eye permits small angular changes.',[0,i?.41:-.41,.17],r=>{
   sleeve(r,eye,y,-.072,.072,.064,.028,rubber,18);sleeve(r,eye,y,-.078,.078,.028,.016,metal,16);
  }))
 ]);
}
const detailViews={
 'suspension.radius-arms':linkStudy('front'),
 'suspension.trailing-arms':linkStudy('rear'),
 'suspension.front-track-bar':panhardStudy('front'),
 'suspension.rear-track-bar':panhardStudy('rear')
};
export function getG500SuspensionDetail(id){return getG500BearingDetail(id)??(Object.hasOwn(detailViews,id)?detailViews[id]:null);}
