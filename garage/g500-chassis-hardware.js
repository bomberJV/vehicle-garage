import {cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';
import {box,path,plus,iron,metal,alloy,rubber} from './road-service-geometry.js';

// Running-gear hardware between the frame, the body and both rigid axles.
// Axle centres sit at x ∓1.425 and z .4276; +x points rearward and +y to the right.
const classic='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const ref=(label,url)=>({label,url});
const plate=(label,slug)=>ref('Mercedes-Benz Classic USA · 2002 G500 '+label,classic+slug);
export const chassisRefs={
 frame:plate('frame and body mounting','body--frame-and-components'),
 springs:plate('springs and related components','suspension--suspension-springs-and-related-components'),
 sensors:plate('wheel-speed sensors','brakes--sensors'),
 abs:plate('ABS components','brakes--abs-components'),
 linkage:plate('steering gear, linkage and damper','steering--steering-gear-and-linkage'),
 carrier:plate('front axle and steering knuckle carrier','suspension--front-axle-and-carrier'),
 bearings:plate('wheel bearings, seals and related components','driveline-and-axles--wheel-bearings-seals-and-related-components'),
 rearAxle:plate('rear axle','universals-and-rear-axle--rear-axle'),
 parking:plate('parking brake','brakes--parking-brake'),
mounts:ref('MB Parts Giant · 2002 G500 engine and transmission mount parts','https://www.mbpartsgiant.com/oem-mercedes_benz-g500-engine_mount'),
 sticker:ref('2002 US G500 factory window sticker · hydraulic steering damper','https://assets.ctfassets.net/x8mrk904j4k6/6YZIXVgSoBZ1iYZgejgX7a/3eb06156c95e3590d88f7e816470770e/2002_Mercedes-Benz_G500_Window_Sticker.pdf')
};

const FX=-1.425,RX=1.425,HZ=.4276,sides=[-1,1];
const black='#2f3537',zinc='#b3b9b1',sensorBody='#3b4446';
const side=s=>s<0?'left':'right';
// The rail-top profile of drawG500Frame; the rail is 99 mm deep.
const railProfile=[[-1.96,.648],[-1.73,.693],[-1.44,.695],[-1.15,.641],[-.74,.523],[-.52,.499],[.46,.501],[.77,.550],[1.13,.674],[1.42,.701],[1.75,.704],[2.02,.670]];
export function railTop(xx){
 for(let i=1;i<railProfile.length;i++){
  const [x0,z0]=railProfile[i-1],[x1,z1]=railProfile[i];
  if(xx<=x1)return z0+(z1-z0)*(xx-x0)/(x1-x0);
 }
 return railProfile.at(-1)[1];
}
// Range along an axis for either side of the car.
const span=(a,b,s)=>s<0?[-b,-a]:[a,b];
function ycyl(r,c,s,a,b,rad,col,n=16){const [p,q]=span(a,b,s);cyl(r,c,y,p,q,rad,col,n);}
function ysleeve(r,c,s,a,b,outer,inner,col,n=24){const [p,q]=span(a,b,s);sleeve(r,c,y,p,q,outer,inner,col,n);}
const at=(xx,s,yy,zz)=>[xx,s*yy,zz];

// Body mounts: three rubber stacks on each rail under the floor sill, and a thin
// pad on the rear crossmember ends where the rear floor sits close to the rail.
const bodyFloor=.575,mountStations=[-.30,.05,.42];
function stack(r,xx,s){
 const t=railTop(xx),c=[xx,s*.495,0],bottom=t-.099;
 cyl(r,c,z,bottom-.011,bottom,.015,zinc,6);
 cyl(r,c,z,bottom,bodyFloor-.001,.006,zinc,8);
 cyl(r,c,z,t,t+.022,.030,rubber,10);
 cyl(r,c,z,t+.022,t+.029,.034,metal,10);
 cyl(r,c,z,t+.029,bodyFloor-.006,.027,rubber,10);
 cyl(r,c,z,bodyFloor-.006,bodyFloor-.001,.033,zinc,10);
}
function rearPad(r,s){
 const xx=1.95,t=railTop(xx),c=[xx,s*.495,0];
 box(r,[xx,s*.495,t+.010],[.070,.060,.020],rubber);
 cyl(r,c,z,t+.020,.7045,.024,zinc,12);
}

// Rubber jounce buffers hang inside each coil from the frame spring cup.
function bumpStop(r,xx,s){
 const c=[xx,s*.48,.856];
 cyl(r,c,z,-.004,0,.037,metal,12);
 turn(r,c,z,[[-.004,0],[-.004,.031],[-.022,.029],[-.030,.024],[-.040,.027],[-.052,.021],[-.060,.024],[-.072,.017],[-.080,.012],[-.082,0]],rubber,{n:12});
}

// Front wheel-speed sensors run parallel to the axle in the knuckle and read a
// toothed ring on the outer joint of the axle shaft, inside the knuckle and just
// inboard of the inner wheel bearing. The angle keeps them ahead of the caliper.
const frontSensor=[FX-.051,0,HZ+.051];
function frontRing(r,s){
 const c=[FX,0,HZ];
 ysleeve(r,c,s,.700,.710,.054,.047,iron,24);
 for(let i=0;i<24;i++){
  const a=i/24*2*Math.PI,rr=.0565;
  box(r,[FX+rr*Math.cos(a),s*.705,HZ+rr*Math.sin(a)],[.0045,.010,.0045],iron);
 }
}
function frontSensorBody(r,s){
 ycyl(r,frontSensor,s,.640,.712,.0085,sensorBody,12);
 box(r,at(frontSensor[0]-.006,s,.635,frontSensor[2]+.004),[.030,.010,.020],sensorBody);
 ycyl(r,frontSensor,s,.612,.630,.011,black,12);
}
// The rear sensors stand in the top of each axle-tube end and read a ring on the shaft.
const rearSensor=[RX-.030,0,0];
const frontLead=s=>[at(frontSensor[0],s,.612,frontSensor[2]),at(-1.440,s,.603,.492),at(-1.360,s,.600,.505),at(-1.360,s,.600,.615),at(-1.300,s,.598,.640),at(-1.270,s,.549,.645),at(-1.180,s,.549,.625)];
const rearLead=s=>[at(rearSensor[0],s,.655,.540),at(rearSensor[0],s,.655,.562),at(1.420,s,.645,.585),at(1.560,s,.625,.620),at(1.600,s,.549,.655),at(1.730,s,.549,.655)];
function leadConnector(r,p){box(r,plus(p,[.012,0,0]),[.026,.010,.016],black);}

// Hydraulic steering damper behind the axle: the body is braced to the axle tube
// and the rod is clamped to the tie rod.
const damperX=-1.245,damperZ=.285;
function steeringDamper(r){
 const c=[damperX,0,damperZ];
 cyl(r,c,y,-.050,.330,.022,black,16);
 cyl(r,c,y,-.050,-.040,.024,metal,16);
 cyl(r,c,y,-.330,-.050,.008,alloy,10);
 for(const yy of [-.345,.345]){sleeve(r,[damperX,yy,damperZ],x,-.012,.012,.016,.006,iron,14);}
 path(r,[[damperX,.330,damperZ],[damperX,.345,damperZ]],.010,iron);
 // Axle bracket from the body eye to the underside of the tube.
 box(r,[-1.300,.355,.318],[.120,.014,.016],iron);
 box(r,[-1.370,.355,.352],[.040,.014,.050],iron);
 // Tie-rod clamp around the 40 mm tube at the rod eye.
 path(r,[[damperX,-.345,damperZ],[-1.290,-.345,.279]],.008,iron);
 sleeve(r,[-1.303,-.345,.276],y,-.014,.014,.027,.021,iron,16);
}

// Kingpin bearing caps above and below each knuckle, the swivel seal ring at
// the axle ball, and the stop screw that limits steering lock.
function swivel(r,s){
 const k=at(FX,s,.674,0);
 cyl(r,k,z,.503,.518,.030,iron,16);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;cyl(r,plus(k,[.022*Math.cos(a),.022*Math.sin(a),0]),z,.518,.524,.006,zinc,6);}
 cyl(r,at(FX,s,.656,0),z,.333,.350,.024,iron,16);
 ysleeve(r,[FX,0,HZ],s,.618,.632,.074,.050,rubber,24);
 const stop=at(FX+.072,s,.662,HZ+.020);
 cyl(r,stop,x,-.004,.022,.0065,zinc,6);
 cyl(r,stop,x,.010,.016,.011,zinc,6);
}
// Hub seal behind the inner bearing; tab washer, slotted nut and grease cap outboard.
function frontHubEnd(r,s){
 const c=[FX,0,HZ];
 ysleeve(r,c,s,.682,.689,.056,.043,rubber,20);
 ysleeve(r,c,s,.807,.810,.034,.018,zinc,24);
 ycyl(r,c,s,.810,.822,.029,iron,6);
 for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;box(r,[FX+.026*Math.cos(a),s*.8205,HZ+.026*Math.sin(a)],[.006,.004,.006],black);}
 ycyl(r,c,s,.822,.840,.024,metal,20);
}
// Rear: a sealed bearing cartridge sits on the flanged shaft inside the hub,
// with the shaft seal against the tube end.
function rearHubEnd(r,s){
 const c=[RX,0,HZ];
 ysleeve(r,c,s,.701,.706,.070,.050,rubber,20);
 ysleeve(r,c,s,.706,.728,.072,.050,iron,20);
 ysleeve(r,c,s,.710,.724,.0735,.069,metal,20);
}

// Parking brake: the lever cable meets an equalizer under the floor; two cables
// run under the rails, are clipped along the trailing arms and enter each backing plate.
const eq=[.960,-.250,.520];
const frontCable=[plus(eq,[-.012,0,0]),[.460,-.250,.520],[.430,-.250,.560],[.430,-.250,.600]];
function rearCable(s){
 const start=s<0?[.972,-.290,.520]:[.972,-.210,.520];
 const cross=s<0?[]:[[.980,.100,.520]];
 return [start,...cross,at(.990,s,.420,.460),at(1.020,s,.486,.413),at(1.100,s,.486,.398),at(1.230,s,.480,.385),at(1.300,s,.476,.325),at(1.460,s,.600,.316),at(1.490,s,.648,.334),at(1.500,s,.668,.344)];
}
function parking(r){
 box(r,eq,[.024,.110,.014],metal);
 cyl(r,eq,x,-.026,.012,.006,metal,8);
 path(r,frontCable,.0045,black);
 cyl(r,[.430,-.250,.590],z,0,.010,.012,rubber,12);
 for(const s of sides){
  const route=rearCable(s);
  path(r,route,.0040,black);
  sleeve(r,route.at(-1),y,-.006,.006,.009,.004,zinc,10);
  for(const [xx,zz] of [[1.060,.405],[1.180,.392]]){
   box(r,[xx,s*.503,zz],[.016,.040,.010],zinc);
  }
 }
}

// The transmission and transfer case rest on the transfer-case crossmember
// through a rubber insulator under the case.
function transmissionMount(r,key){
 if(key==='support')box(r,[.220,-.020,.333],[.070,.110,.006],iron);
 if(key==='insulator')box(r,[.220,-.020,.354],[.050,.060,.036],rubber);
 if(key==='bracket')box(r,[.220,-.020,.391],[.060,.070,.038],metal);
}
export const chassisRows=[
 ['body-mounts','Body mount stacks','Rubber stacks join the separate body to the ladder frame. Each stack has upper and lower rubber, a steel cup and a through bolt. Thin pads carry the rear floor. Stations are placed where the floor sill clears the rail.',[0,0,.10],chassisRefs.frame,r=>{
  for(const s of sides){
   r.instance(side(s),()=>{for(const xx of mountStations)stack(r,xx,s);rearPad(r,s);});
  }
 }],
 ['bump-stops','Spring jounce buffers','A convoluted rubber buffer hangs inside each coil spring from the frame cup. It meets the axle seat before the coil binds.',[0,0,.12],chassisRefs.springs,r=>{
  for(const [xx,end] of [[FX,'front'],[RX,'rear']])for(const s of sides)r.instance(end+'-'+side(s),()=>bumpStop(r,xx,s));
 }],
 ['abs-rings','ABS pulse rings','A toothed ring turns with each wheel. The front rings are pressed on the outer joints of the axle shafts, inside the knuckles and just inboard of the wheel bearings. The rear rings are on the axle shafts inside the tube ends.',[0,.10,0],chassisRefs.abs,r=>{
  for(const s of sides){r.instance('front-'+side(s),()=>frontRing(r,s));r.instance('rear-'+side(s),()=>{const c=[RX,0,HZ];ysleeve(r,c,s,.650,.660,.055,.046,iron,20);});}
 }],
 ['abs-sensors','ABS wheel-speed sensors','Inductive sensors read the passing teeth. The front sensors sit in the steering knuckles parallel to the axle, ahead of the calipers. The rear sensors stand in the top of each axle tube end.',[0,.12,.04],chassisRefs.sensors,r=>{
  for(const s of sides){
   r.instance('front-'+side(s),()=>frontSensorBody(r,s));
   r.instance('rear-'+side(s),()=>{const p=at(rearSensor[0],s,.655,0);cyl(r,p,z,.478,.522,.0085,sensorBody,12);box(r,[p[0],p[1],.519],[.032,.020,.006],sensorBody);cyl(r,p,z,.522,.540,.011,black,12);});
  }
 }],
 ['abs-leads','ABS sensor leads','Each lead climbs from its sensor to the outer face of the frame rail. It plugs into the chassis harness at a clip there. The slack loop lets the axle move.',[0,.08,.06],chassisRefs.sensors,r=>{
  for(const s of sides){
   r.instance('front-'+side(s),()=>{const l=frontLead(s);path(r,l,.0035,black);leadConnector(r,l.at(-1));});
   r.instance('rear-'+side(s),()=>{const l=rearLead(s);path(r,l,.0035,black);leadConnector(r,l.at(-1));});
  }
 }],
 ['steering-damper','Hydraulic steering damper','The damper lies behind the front axle beside the tie rod. Its body is braced to the axle tube and its rod is clamped to the tie rod. It soaks up kickback from the wheels before it reaches the steering box.',[.10,0,-.06],chassisRefs.sticker,steeringDamper],
 ['front-swivels','Kingpin caps, swivel seals and steering stops','Each steering knuckle turns on upper and lower kingpin bearings under bolted caps. A seal ring closes the swivel joint at the end of the axle tube. A stop screw on the knuckle limits full lock.',[-.06,.10,.05],chassisRefs.carrier,r=>{
  for(const s of sides)r.instance(side(s),()=>swivel(r,s));
 }],
 ['front-hub-ends','Front hub seals, tab washers, slotted nuts and grease caps','A seal behind the inner tapered bearing keeps grease in the hub. Outboard, a tab washer locks the slotted adjusting nut, and a pressed grease cap closes the hub.',[-.04,.14,0],chassisRefs.bearings,r=>{
  for(const s of sides)r.instance(side(s),()=>frontHubEnd(r,s));
 }],
 ['rear-bearings','Rear wheel-bearing cartridges and shaft seals','Each rear hub turns on a sealed bearing cartridge carried on the flanged axle shaft. A lip seal at the tube end keeps axle oil out of the brake.',[.04,.14,0],chassisRefs.rearAxle,r=>{
  for(const s of sides)r.instance(side(s),()=>rearHubEnd(r,s));
 }],
 ['transmission-support','Transmission rear support · 463-260-16-60','A plate on top of the transfer-case crossmember carries the rear rubber mount.',[0,0,-.06],chassisRefs.mounts,r=>transmissionMount(r,'support')],
 ['transmission-insulator','Transmission rear insulator · 212-240-04-18','The rubber insulator under the transfer case takes the rear of the transmission and transfer-case assembly onto the crossmember.',[0,0,-.03],chassisRefs.mounts,r=>transmissionMount(r,'insulator')],
 ['transmission-mount-bracket','Transmission mount rear bracket · 140-242-13-40','The bracket bolts under the transfer case and sits on the insulator.',[0,0,.03],chassisRefs.mounts,r=>transmissionMount(r,'bracket')],
 ['parking-cables','Parking-brake cables and equalizer','The lever cable runs down through the floor to an equalizer that splits the pull evenly between the rear cables. Clips hold each rear cable on its trailing arm. The cable ends at the backing plate behind the rear drum.',[0,0,-.10],chassisRefs.parking,parking]
];

// Lift kits raise the sprung chassis; these parts either ride with it, stay on
// the axle or stretch between the two.
const axleParts=new Set(['abs-rings','abs-sensors','steering-damper','front-swivels','front-hub-ends','rear-bearings']);
const clamp=n=>Math.max(0,Math.min(1,n));
export function chassisLiftWeight(key,[xx,,zz]){
 if(axleParts.has(key))return 0;
 if(key==='abs-leads')return clamp((zz-(xx<0?.53:.56))/.10);
 if(key==='parking-cables'){
  if(xx<=.973)return 1;
  return clamp((RX-Math.abs(xx)-.13)/(.83-.13));
 }
 return 1;
}
