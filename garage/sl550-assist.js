import {slBumperPoint,slDeckCameraMount} from './sl550-exterior.js';
import {slDeckPoint} from './sl550-roof.js';
import {pipe} from './road-primitives.js';
import {cyl,sleeve,part,study,basis} from './mechanism-shapes.js';

const parts={label:'Mercedes-Benz USA · 2014 SL550 parking aid, plates 1–3',url:'https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/electrical--parking-aid'};
const manual=page=>({label:'Mercedes-Benz USA · SL operator’s manual, p. '+page,url:'https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf#page='+(page+2)});
const graphite='#333a3e',lens='#475b64',contact='#919594';
const units=[
  ['parking','PARKTRONIC ultrasonic sensors','The inner front pair sits in the grille. A second pair sits below the headlamps and the outer pair faces sideways near the wheel arches. Four sensors span the rear bumper. Open any sensor to inspect its mounting.',[0,0,.16],manual(204)],
  ['forward','DISTRONIC PLUS front radar','A radar unit looks through the grille cover. It measures distance and relative speed for adaptive cruise control.',[-.18,0,.06],manual(189)],
  ['corners','Bumper radar modules','The corner sensors sit behind the bumper covers. Active Blind Spot Assist uses radar to monitor adjacent traffic.',[0,.2,.08],manual(219)],
  ['lane','Lane camera','A camera near the top of the windshield tracks the lane markings ahead.',[-.06,-.15,.12],manual(223)],
  ['night','Night View Assist PLUS cameras','The windshield camera records the infrared-lit road. A second camera in the radiator grille senses heat from pedestrians and animals.',[-.12,.14,.18],manual(215)],
  ['rearview','Rearview camera','The small lens in the trunk-lid handle looks down behind the bumper. The image appears in COMAND when reverse is selected.',[.18,0,.09],manual(210)]
];
export const slAssistGroup={id:'sl-assist',name:'Parking, radar and night vision',description:'Locate the ultrasonic sensors, grille radar and cameras. The bumper skin conceals the corner radar modules.',parts:units.map(([id,name,description,offset,source])=>({id:'sl-assist.'+id,name,description,offset,source}))};
function shell(r,at,half,color){
  r.box(...at.map((v,i)=>v-half[i]),...at.map((v,i)=>v+half[i]),color);
}
// P54.65-4472-31, US operator’s manual p. 204. Each row records the
// center and outward surface normal on the right-hand rendered body facet.
// Left-hand mountings mirror the lateral coordinate and lateral normal.
// The inner grille pair has its own molded boss between the grille vanes.
const parkingMounts=[
  ['front-inner',[-2.19703,.330,.477],[-.99033,.13330,-.03835]],
  ['front-middle',[-2.13508,.610,.457],[-.89006,.45576,-.00849]],
  ['front-outer',[-1.84000,.86491,.476],[-.33258,.94095,-.06326]],
  ['rear-inner',[2.30480,.310,.535],[.99535,.09351,-.02309]],
  ['rear-outer',[2.14548,.736,.535],[.80667,.59007,-.03317]]
];
function sensor(r,position,normal,paint,grille){
  const frame=basis(normal),start=r.faces.length,stand=grille ? .013 : .0014;
  // Draw in local coordinates with the electrical plug behind the nose. The
  // same attachment axis sets both the visible diaphragm and the buried body.
  if(grille)cyl(r,center,axis,-.009,stand-.001,.019,'#34393c',14);
  sleeve(r,center,axis,stand-.004,stand+.001,.0135,.0099,'#44494b',14);
  cyl(r,center,axis,stand-.018,stand+.0013,.0098,grille?'#515557':paint,14);
  shell(r,[-.017,0,0],[.010,.014,.013],graphite);
  shell(r,[-.029,0,-.006],[.008,.008,.010],'#45494a');
  shell(r,[-.030,0,-.020],[.006,.007,.006],'#747875');
  for(let i=start;i<r.faces.length;i++){
    r.faces[i].points=r.faces[i].points.map(p=>position.map((q,j)=>q+p.reduce((d,n,k)=>d+n*frame[k][j],0)));
  }
}
function camera(r,p,radius){
  shell(r,p,[radius*.92,radius*1.42,radius*1.18],graphite);
  cyl(r,p,[-1,0,0],radius*.9,radius*1.20,radius,lens,14);
}
// R231 parking-aid plate 2 identifies the camera with its captive lead and
// the separate sprung holder. Coordinates are local to the trunk handle.
const rearCameraPieces=[
  part('camera','Camera and lens','The lens looks rearward and down from the trunk handle. Its body sits behind the retaining bracket.',[.034,0,.015],r=>{
    shell(r,[-.008,0,.002],[.013,.015,.009],graphite);
    const axis=[.91,0,-.415];
    cyl(r,[0,0,0],axis,.001,.011,.009,'#293035',20);
    cyl(r,[0,0,0],axis,.011,.012,.0064,'#33464d',20);
  }),
  part('holder','Spring retaining bracket','The two end clips hold the camera in the trunk handle. The center opening leaves its field of view clear.',[.012,0,.045],r=>{
    for(const side of [-1,1]){
      shell(r,[-.008,side*.019,.002],[.012,.0025,.012],'#5c6264');
      shell(r,[-.019,side*.025,.005],[.003,.008,.005],graphite);
      shell(r,[-.001,0,side*.012],[.002,.020,.0025],'#555e63');
    }
  }),
  part('lead','Camera lead and plug','The sleeved lead connects the camera to the deck wiring and travels with the lid. The bends shown in the model are approximate.',[-.055,0,.018],r=>{
    pipe(r,[[-.018,0,.007],[-.037,.010,.013],[-.052,.035,.018],[-.071,.067,.021],[-.087,.077,.019]],.0028,'#4b5152',7);
    shell(r,[-.088,.082,.019],[.005,.009,.005],graphite);
    shell(r,[-.088,.084,.024],[.002,.005,.0015],'#838c90');
  })
];
export const slRearCameraStudy=study('sl-rear-camera','Trunk-handle camera','The SL550 parking-aid catalog shows the camera, its lead and the retaining bracket. Open the assembly to see how the lens projects through the handle.',parts,rearCameraPieces);
export function drawSLRearCamera(r,t){
  r.tag('sl-assist.rearview',()=>{
    const start=r.faces.length,center=slDeckCameraMount();
    for(const piece of rearCameraPieces)piece.draw(r);
    for(let i=start;i<r.faces.length;i++){
      r.faces[i].points=r.faces[i].points.map(p=>slDeckPoint(p.map((v,k)=>v+center[k]),t));
    }
  });
}
export function drawSLAssist(r,paint,t){
  r.tag('sl-assist.parking',()=>{
    for(const [location,p,n] of parkingMounts)for(const sign of [-1,1]){
      const side=sign<0?'left':'right';
      r.instance(location+'-'+side,()=>sensor(r,[p[0],sign*p[1],p[2]],[n[0],sign*n[1],n[2]],paint,location==='front-inner'));
    }
  });
  r.tag('sl-assist.forward',()=>shell(r,[-2.177,0,.554],[.030,.056,.055],graphite));
  r.tag('sl-assist.corners',()=>{
    for(const side of [-1,1]){
      shell(r,[-1.96,side*.742,.43],[.036,.05,.037],graphite);
      shell(r,[1.985,side*.771,.52],[.036,.05,.037],graphite);
    }
  });
  r.tag('sl-assist.lane',()=>camera(r,[.017,-.049,1.242],.012));
  r.tag('sl-assist.night',()=>{
    camera(r,[.018,.045,1.239],.017);
    const p=slBumperPoint(true,.24,.589);p[0]+=.022;camera(r,p,.023);
  });
  drawSLRearCamera(r,t);
}
const axis=[1,0,0],center=[0,0,0];
export const slParkingStudy=study('sl-park-sensor','PARKTRONIC bumper sensor','One ultrasonic sensor fits into a bracket behind the painted bumper. The Mercedes parts plates show the carrier, sensor and harness. Dimensions are approximate.',parts,[
  part('sensor','Ultrasonic sensor','The exposed circular face transmits and receives ultrasonic pulses.',[.05,0,0],r=>{cyl(r,center,axis,-.021,0,.010,contact);cyl(r,center,axis,-.032,-.010,.013,graphite);}),
  part('ring','Decoupling ring','A flexible ring surrounds the face at the bumper opening.',[.085,0,0],r=>sleeve(r,center,axis,-.007,.001,.0137,.0102,'#5d6264')),
  part('carrier','Bumper mounting bracket','The sensor clips into the carrier behind the opening.',[0,.05,0],r=>{sleeve(r,center,axis,-.017,-.005,.018,.014,graphite);for(const s of [-1,1])shell(r,[-.013,s*.023,0],[.004,.008,.008],graphite);}),
  part('plug','Harness plug','The electrical connector joins the sensor to the bumper wiring.',[-.068,0,0],r=>{shell(r,[-.038,0,-.002],[.014,.009,.007],graphite);r.rod([-.05,0,0],[-.079,.008,-.007],.004,'#626a68',8);})
]);
