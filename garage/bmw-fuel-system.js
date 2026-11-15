import {part,study,cyl,sleeve} from './mechanism-shapes.js';
import {tankBody,sender,path,box,plus,metal,alloy,iron,rubber,fuelGold} from './road-service-geometry.js';
const X=[1,0,0],Y=[0,1,0],Z=[0,0,1];
const base='https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/';
export const bmwServicePlacementSources={
 tank:{label:'BMW ETK · 2003 M54 coupé fuel tank and two straps',url:base+'fuel_system/fuel_tank_attaching_parts.html'},
 pump:{label:'BMW ETK · right delivery unit, left level sensor and suction jet pump',url:base+'fuel_system/fuel_pump_and_fuel_level_sensor.html'},
 fuses:{label:'BMW · 2003 coupé manual, glovebox fuse carrier, p. 140',url:'https://bmw330ci.net/the330ci/2003Manual-3SeriesCoupe.pdf#page=140'},
 battery:{label:'BMW ETK · luggage-compartment battery tray and holder',url:base+'vehicle_trim/battery_tray.html'}
};
function transfer(r,c){
 const at=p=>plus(c,p);
 // The suction-jet assembly transfers fuel across the saddle; it is not a second electric motor.
 path(r,[at([-.035,-.28,-.032]),at([.05,-.21,.075]),at([.05,.18,.075]),at([.004,.28,-.024])],.007,rubber);
 cyl(r,at([-.035,-.28,-.046]),X,-.047,.047,.012,iron,12);
 cyl(r,at([-.035,-.28,-.046]),X,-.056,-.044,.008,fuelGold,10);
}
function filler(r,c){
 path(r,[[1.640,.840,.805],[1.580,.700,.750],[1.40,.550,.680],[1.10,.500,.480],plus(c,[.19,.50,.06])],.024,rubber);
 sleeve(r,[1.640,.840,.805],Y,-.023,.018,.040,.025,iron,18);
}
export function refineBmwFuelParts(parts,p){
 const revised=parts.map(item=>{
  if(item.id==='filler')return {...item,name:'Right rear filler neck',description:'The neck starts at the right-quarter flap behind the rear axle, passes inboard of the wheel housing and meets the right tank lobe. The route is reconstructed.',draw:r=>filler(r,p.tank)};
  if(item.id==='pump')return {...item,name:'Right-hand in-tank delivery pump',description:'The electric pump sits in the right tank lobe below the delivery flange. A separate strainer filters the inlet.',draw:r=>{
   const q=plus(p.tank,[.004,.28,-.022]);cyl(r,q,Z,-.071,.064,.040,metal,17);sleeve(r,q,Z,-.034,-.016,.044,.028,rubber,18);
   box(r,plus(q,[0,0,-.066]),[.103,.068,.013],'#898871');
  }};
  return item;
 });
 revised.push({id:'transfer',name:'Suction jet transfer pump and hose',description:'The separate jet-pump assembly moves fuel across the saddle from the left lobe to the right delivery side. It has no separate electric motor.',offset:[.18,-.32,.18],draw:r=>transfer(r,p.tank)});
 return revised;
}
export function drawBmwFuseCarrier(r){
 r.box(-.622,.183,.813,-.593,.626,.924,rubber);
 for(let j=0;j<10;j++)for(const row of [0,1]){
  const yy=.208+j*.041,zz=.835+row*.049;
  r.box(-.593,yy-.011,zz-.012,-.577,yy+.011,zz+.012,['#977e5d','#6e8b99','#a66b57','#929c6b'][j%4]);
 }
 for(const yy of [.200,.607])cyl(r,[-.590,yy,.915],X,-.005,.013,.010,alloy,8);
}
const c=[0,0,.38];
function tankSection(r){
 const cut=Object.create(r);
 cut.polygon=(points,...args)=>{
  const result=[];
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],insideA=a[0]>=0,insideB=b[0]>=0;
   if(insideA)result.push(a);
   if(insideA!==insideB){const t=-a[0]/(b[0]-a[0]);result.push(a.map((v,k)=>v+t*(b[k]-v)));}
  }
  if(result.length>=3)r.polygon(result,...args);
 };
 tankBody(cut,c,'saddle');
}
const tankView=study('bmw-m54-saddle-tank','M54 coupé · saddle tank and transfer circuit','The propeller-shaft tunnel passes between the tank lobes. The right delivery unit contains the electric pump; the left unit measures level and connects to the suction-jet transfer assembly. The filler enters from the vehicle’s right side.',bmwServicePlacementSources.pump,[
 part('shell','Two-lobe plastic tank · section','The front half is cut away to expose the pump and transfer connections. The molded M54 tank straddles the tunnel beneath the rear seat; the M56 SULEV tank is a different system.',[0,0,-.30],tankSection),
 part('right-unit','Right delivery unit and level sender','Callout 1 is the right delivery unit. Its upper flange closes the right tank opening.',[.12,.34,.50],r=>sender(r,plus(c,[0,.28,.065]))),
 part('left-sender','Left level sender','Callout 2 is a separate left sensor, not a second electric delivery pump.',[-.18,-.34,.45],r=>sender(r,plus(c,[-.035,-.28,.070]))),
 part('pump','Electric pump and inlet strainer','The pump occupies the right lobe and supplies the delivery outlet. The removable strainer is listed separately at callout 7.',[.28,.45,-.15],r=>{const q=plus(c,[.004,.28,-.022]);cyl(r,q,Z,-.071,.064,.040,metal,18);box(r,plus(q,[0,0,-.066]),[.103,.068,.013],'#898871');}),
 part('transfer','Suction jet pump and transfer hose','Callout 3 is the jet-pump assembly. Its hose crosses the saddle, keeping transfer hardware distinct from the electric pump.',[-.27,-.35,-.18],r=>transfer(r,c)),
 part('seals','Two flange seals and locking rings','The plate lists paired rubber seals and threaded locking rings for the two service openings.',[0,0,.66],r=>{for(const [xx,yy] of [[0,.28],[-.035,-.28]]){sleeve(r,plus(c,[xx,yy,.114]),Z,-.004,.004,.090,.075,rubber,24);sleeve(r,plus(c,[xx,yy,.135]),Z,-.006,.006,.098,.086,iron,26);}}),
 part('neck','Right-side filler connection','The neck enters the right lobe. Its short section preserves the installed side; the complete body route is shown in the vehicle assembly.',[.33,.47,.18],r=>path(r,[plus(c,[.22,.48,.06]),plus(c,[.36,.61,.15]),plus(c,[.39,.68,.25])],.025,rubber)),
 part('straps','Two supporting tension straps','The tank attaching-parts plate lists two straps and their mounting hardware.',[0,0,-.46],r=>{for(const yy of [-.30,.30])r.box(-.32,yy-.025,.269,.32,yy+.025,.281,iron);})
]);
tankView.viewAngle=[-.61,.61];
export function getBmwFuelDetail(vehicle,id){return vehicle==='bmw325ci'&&id==='fuel.tank'?tankView:null;}
