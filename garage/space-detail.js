import {TAU,radial,section,loops,part,group,exhibit} from './space-shapes.js';
import {lmInterior,lmHandbook,dskyFace} from './lm-cabin.js';
import {glazingFace} from './surface-materials.js';
import {getLrvDrive,lrvWheelDrive,rotateLrvWheel} from './lrv-drive.js';
import {getPerseveranceMobility} from './perseverance-mobility.js';

const gray='#808a87',steel='#a5aca4',white='#e3e4d9',black='#323b41',gold='#c5a66c';
const source=(label,url)=>({label,url});
const dskySource=source('NASA · Apollo display and keyboard design','https://ntrs.nasa.gov/api/citations/19750004273/downloads/19750004273.pdf');
const hatchSource=source('NASA · Apollo lunar module crew accommodations','https://www.nasa.gov/wp-content/uploads/2023/03/apollo-lunar-lander-technical-brief-ochmo.pdf');
const roverSource=source('NASA · Apollo 15 Mission Report, appendix A','https://ntrs.nasa.gov/citations/19720021182');
const dragonSource=source('NASA · The Demo-2 crew boards Endeavour','https://blogs.nasa.gov/commercialcrew/2020/05/30/all-aboard-astronauts-ingress-crew-dragon/');
const marsSource=source('NASA/JPL · Mars 2020 expanded spacecraft illustration','https://science.nasa.gov/resource/mars-2020-expanded-spacecraft-illustration/');
function makeDetail(id,name,description,reference,groupId,pieces,extra={}){
  const d=exhibit({id,name,description,source:reference,...extra},[group(groupId,name,description,pieces)]);
  d.componentIndex=new Map(d.groups[0].parts.map(p=>[p.id,p]));
  return d;
}
// Transform from LM station coordinates to a view through the open starboard
// wall. The commander must appear at the viewer's left when looking forward.
function forwardView(r){
  const proxy=Object.create(r);
  proxy.polygon=(points,color,stroke)=>r.polygon(points.map(([x,y,z])=>[-2*x,2*y,2*(z-1.754)]),color,stroke);
  return proxy;
}
const cabin=makeDetail('lm-interior','Falcon crew compartment','Look forward over the standing floor. The commander’s instruments lie on the left and the pilot’s controls on the right. Above the forward hatch, the crew shared one display and keyboard.',lmHandbook,'lm-room',
  lmInterior.parts.map(p=>part(p.id,p.name,p.description,[-p.offset[0]*1.6,p.offset[1]*1.6,p.offset[2]*1.6],r=>p.draw(forwardView(r)))),{viewAngle:[-1.10,.32]});
const dsky=makeDetail('lm-dsky','Apollo display and keyboard','The DSKY let the crew exchange numbers with the Apollo computer. The left bank held status indicators. The right side displayed three two-digit fields and three five-digit data registers. The numbers shown are illustrative.',dskySource,'dsky',[
  ['case','Faceplate and enclosure','The metal faceplate locates the indicator panel, display and keyboard.',[-.1,0,-.3]],
  ['lights','Annunciator lights','The rectangular status lights occupied the upper left of the unit.',[-.15,-.52,.31]],
  ['registers','Electroluminescent display','Segmented numerals made each line of the green readout. Short fields identified the displayed information.',[-.14,.52,.31]],
  ['keys','Nineteen-key keyboard','Nineteen keys let the astronauts enter numerical data and request displays.',[-.40,0,-.33]],
].map(([key,name,desc,offset])=>part(key,name,desc,offset,r=>{
  const proxy=Object.create(r);
  proxy.polygon=(points,color,stroke)=>r.polygon(points.map(([x,y,z])=>[-x,-y,z]),color,stroke);
  dskyFace(proxy,key,(depth,y,z)=>[depth*2,y*2,z*2+1.13]);
})),{viewAngle:[-1.36,.13]});
const hatch=makeDetail('lm-forward-hatch','Falcon forward hatch','The astronauts crouched below the instrument panels to pass through the square forward opening. The hatch swung inward, occupying some of the same space as the crew.',hatchSource,'lm-hatch',[
  part('jamb','Hatch sill and jamb','The square opening led directly onto the small porch above the ladder.',[-.18,0,-.10],r=>{
    for(const y of [-.67,.67])r.box(-.02,y-.055,.095,.04,y+.055,1.515,steel);
    for(const z of [.12,1.49])r.box(-.025,-.72,z-.052,.04,.72,z+.052,steel);
    for(const y of [-.687,-.39,0,.39,.687])for(const z of [.12,1.49])r.discX(-.027,y,z,.016,black,10);
  }),
  part('door','Inward-swinging hatch','The hatch swung toward the pilot’s side of the compartment. Play the motion to see the space it needed.',[.28,.52,.12],(r,phase)=>{
    const t=.5-.5*Math.cos(TAU*phase),angle=1.48*t;
    const p=(y,z,dx=0)=>[.069+dx+Math.sin(angle)*(.607-y),.609-(.609-y)*Math.cos(angle),z];
    const outline=[[-.61,.185],[-.55,.158],[.54,.158],[.609,.214],[.609,1.407],[.55,1.454],[-.55,1.454],[-.61,1.407]];
    const front=outline.map(([y,z])=>p(y,z)),back=outline.map(([y,z])=>p(y,z,.042));
    r.polygon(front,'#969d92',false);r.polygon(back,'#b6b8a7',false);
    for(let i=0;i<8;i++){const j=(i+1)%8;r.polygon([front[i],back[i],back[j],front[j]],gray,false);}
    loops(r,front,.014,'#67716b');
    r.rod(p(-.18,.78,-.024),p(-.04,.89,-.024),.025,steel,10);
  }),
  part('porch','Crew porch','The landing-gear ladder meets the outside edge of this platform.',[-.38,0,-.39],r=>{
    r.box(-.91,-.49,.01,-.05,.49,.055,gray);
    for(let i=0;i<9;i++)r.box(-.86+i*.096,-.455,.057,-.836+i*.096,.455,.063,steel);
    for(const side of [-1,1])r.rod([-.86,side*.48,.06],[-.11,side*.52,.19],.014,steel,8);
  }),
],{animated:true,viewAngle:[-1.03,.22],motionDescription:'The square hatch swings inward and returns to the sill.'});
const glazing=makeDetail('lm-glazing','Falcon forward observation window','Each triangular window had two separate panes. The commander’s window also carried sight lines that helped him judge where the lander was heading during descent.',lmHandbook,'lm-glass',[
  part('rim','Window frame','The angular frame follows the triangular opening in the forward face.',[0,0,-.28],r=>{
    const pts=[[-.03,-1.0,.23],[-.03,-.99,1.33],[-.03,1.02,1.45]];loops(r,pts,.054,gray);
  }),
  ...[['outer','Outer pane',-.087,[-.36,0,.23]],['inner','Inner pane',.045,[.32,0,.20]]].map(([id,name,x,off])=>part(id,name,id==='outer'?'A coated outer pane faced space.':'The inner pane formed the cabin-side pressure boundary.',off,r=>{
    const pts=[[x,-1.0,.23],[x,-.99,1.33],[x,1.02,1.45]];
    glazingFace(r,pts,id==='outer'?'#739cb0':'#b4cdbb',.40);loops(r,pts,.014,id==='outer'?'#748c94':'#91a396');
  })),
  part('marks','Commander’s sight markings','The lines on the commander’s window provided a visual reference against the lunar surface.',[-.42,-.20,.16],r=>{
    const x=-.093;
    r.rod([x,-.56,.55],[x,-.52,1.26],.005,'#e3ce93',6);
    for(let i=0;i<9;i++){const y=-.56+i*.005,z=.60+i*.079;r.rod([x,y-.025,z],[x,y+(i%2?.05:.095),z],.005,'#e3ce93',6);}
  })
]);
function lrvTire(r,kind){
  const p=(a,y,radius)=>[radius*Math.cos(a),y,1+radius*Math.sin(a)];
  const cross=[[-.198,.53],[-.291,.65],[-.302,.78],[-.209,.90],[0,.963],[.209,.90],[.302,.78],[.291,.65],[.198,.53]];
  const count=kind==='mesh'?68:34;
  for(let i=0;i<count;i++){
    const a=i*TAU/count,b=(i+1)*TAU/count;
    if(kind==='mesh'){
      for(let j=1;j<cross.length;j++){
        const [y0,r0]=cross[j-1],[y1,r1]=cross[j];
        const aa=a+(j%2)*.046,bb=b+(j%2)*.046;
        r.rod(p(aa,y0,r0),p(aa-.046,y1,r1),.0056,steel,4);
        r.rod(p(bb-.046,y0,r0),p(bb,y1,r1),.0056,steel,4);
      }
    }
    if(kind==='treads' && i%2===0)for(const sign of [-1,1]){
      r.polygon([p(a,sign*.209,.914),p(a+.075,sign*.209,.914),p(b+.075,0,.974),p(b,0,.974)],'#af9771',false);
    }
    if(kind==='frame')for(const sign of [-1,1]){
      if(i%2===0)r.rod(p(a,sign*.125,.716),p(a-.22,sign*.151,.493),.013,gray,6);
      r.rod(p(a,sign*.125,.716),p(b,sign*.125,.716),.014,gray,6);
    }
  }
}
const roverWheel=makeDetail('lrv-wheel','Lunar rover wheel','The woven wire tire and its inner bump-stop frame turned around an electric traction drive. Open the hub to follow the drive from the motor to the wheel.',roverSource,'lrv-wheel',[
  part('mesh','Woven wire tire','Intersecting wires form the flexible tire body.',[0,-.47,0],(r,t)=>lrvTire(rotateLrvWheel(r,t),'mesh')),
  part('treads','Chevron tread strips','V-shaped metal strips covered about half of the tire’s contact surface.',[.12,.47,.25],(r,t)=>lrvTire(rotateLrvWheel(r,t),'treads')),
  part('frame','Inner bump-stop frame','The smaller internal frame supported the tire when a large load pushed the outer mesh inward.',[0,.82,0],(r,t)=>lrvTire(rotateLrvWheel(r,t),'frame')),
  part('hub','Aluminum hub','The wheel and its hub turned together. Open the hub to inspect the drive behind it.',[0,1.12,.08],(r,t)=>{
    const wheel=rotateLrvWheel(r,t);
    wheel.tubeY(0,-.22,.22,1,.267,steel,30);
    for(const side of [-1,1]){
      // The spun hub dishes outward to the bead on each side of the wire tire.
      const stages=[[.266,.208],[.343,.146],[.445,.158],[.495,.185],[.533,.196]];
      for(let j=1;j<stages.length;j++)for(let i=0;i<40;i++){
        const [r0,y0]=stages[j-1],[r1,y1]=stages[j],a=i*TAU/40,b=(i+1)*TAU/40;
        const pos=(radius,y,angle)=>[radius*Math.cos(angle),side*y,1+radius*Math.sin(angle)];
        wheel.polygon([pos(r0,y0,a),pos(r1,y1,a),pos(r1,y1,b),pos(r0,y0,b)],j===2?gray:steel,false);
      }
    }
    for(const y of [-.226,.226])wheel.ringY(0,y,1,.267,.063,gray,22);
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      wheel.ringY(.193*Math.cos(a),.227,1+.193*Math.sin(a),.019,0,black,6);
    }
  }),
  part('drive','Inboard traction drive','The fixed housing contains the motor, brake and harmonic reduction gear.',[0,-1.14,-.19],lrvWheelDrive)
],{animated:true,viewAngle:[2.49,.19],motionDescription:'The mesh tire, treads and hub turn together. The suspension holds the inboard drive housing still.'});
const dragonParts=[
  part('air','Underfloor cabin-air equipment','Open the air system to follow recirculation, gas makeup and heat rejection. The diagram shows how the functions connect.',[0,.58,-.48],r=>{
    r.box(-.40,-.42,2.254,.27,.42,2.375,'#8d9a9a');
    for(const y of [-.26,.22])r.rod([-.38,y,2.38],[.32,y,2.38],.031,'#7d9ca1',10);
  }),
  part('structure','Seat support and cabin deck','A support frame beneath the couches lets the crew change between boarding and flight positions.',[0,0,-.36],r=>{
    r.box(-.60,-.81,2.415,.66,.81,2.445,'#cbcfc7');
    for(const x of [-.28,.48])r.rod([x,-.81,2.526],[x,.81,2.526],.037,gray,12);
  }),
  ...[-.66,-.22,.22,.66].map((y,i)=>part('seat'+(i+1),['Seat 1 · vacant','Seat 2 · Doug Hurley','Seat 3 · Bob Behnken','Seat 4 · vacant'][i],i===1?'Demo-2’s spacecraft commander occupied the left center seat.':i===2?'Behnken occupied the right center seat.':'This outer seat was empty on Demo-2.',[.15,y*.65,.42],r=>{
    const stations=[[-.49,2.56],[-.31,2.62],[-.085,2.535],[.05,2.56],[.38,2.90],[.49,2.99]];
    // The profile is slightly concave: draw strip by strip so there are no
    // fan-triangulated triangles bridging the bend between seat and back.
    const bridge=stations.map(([x,z],n)=>[x+.013,z-(n===0?.027:.033)]);
    for(let n=0;n<5;n++){
      const points=(edge,dy)=>[...edge.map(([x,z])=>[x,y+dy,z])];
      const a=stations.slice(n,n+2),b=bridge.slice(n,n+2);
      const top=[...points(a,-.175),...points(a,.175).reverse()];
      r.polygon(top,n===0?'#5b6570':'#424c5a',false);
      r.polygon([...points(b,-.175),...points(b,.175).reverse()],'#626a74',false);
      for(const s of [-1,1]){
        const raised=(dy,h)=>a.map(([x,z])=>[x,y+s*dy,z+h]);
        r.polygon([...raised(.122,.002),...raised(.150,.025).reverse()],'#555f6a',false);
        r.polygon([...raised(.150,.025),...raised(.169,.003).reverse()],'#68747e',false);
      }
      for(const side of [-.175,.175])r.polygon([...points(a,side),...points(b,side).reverse()],white,false);
    }
    const padPoint=(u,v,h)=>[.435+.71*v-.69*h,y+u,2.956+.70*v+.71*h];
    const crown=[[-.111,-.044],[-.085,-.081],[.085,-.081],[.111,-.044],[.111,.063],[.077,.087],[-.077,.087],[-.111,.063]];
    const crownBase=crown.map(([u,v])=>padPoint(u,v,.018)),crownTop=crown.map(([u,v])=>padPoint(u*.89,v*.89,.058));
    r.polygon(crownTop,'#65717d',false);
    for(let j=0;j<8;j++){
      const k=(j+1)%8;r.polygon([crownBase[j],crownBase[k],crownTop[k],crownTop[j]],'#939da4',false);
    }
    for(const x of [-.25,.32]){
      r.rod([x,y,2.453],[x+.038,y,x<0?2.544:2.778],.032,'#a0aaa8',8);
    }
    for(const s of [-1,1]){
      r.rod([.42,y+s*.102,2.918],[.073,y+s*.05,2.604],.016,'#a4a9aa',7);
      r.rod([.073,y+s*.05,2.604],[-.074,y+s*.16,2.544],.014,'#9da4a4',7);
    }
  })),
  part('displays','Three touchscreens','The three adjacent screens faced the two center crew stations. The blue graphics indicate screen positions.',[-.42,0,.35],r=>{
    for(const side of [-1,1]){
      r.rod([-.57,side*.618,2.445],[-.582,side*.618,3.016],.027,white,10);
      r.rod([-.582,side*.618,3.016],[-.550,side*.496,3.016],.027,white,10);
    }
    r.rod([-.550,-.499,3.016],[-.550,.499,3.016],.021,gray,10);
    for(const y of [-.353,0,.353]){
      const q=(x,dy,z)=>[x,y+dy,z];
      r.polygon([q(-.505,-.171,2.93),q(-.505,.171,2.93),q(-.584,.171,3.13),q(-.584,-.171,3.13)],black,false);
      r.polygon([q(-.504,-.154,2.942),q(-.504,.154,2.942),q(-.577,.154,3.115),q(-.577,-.154,3.115)],'#426078',false);
      for(const z of [2.971,3.018,3.064]){
        const xx=-.503-(z-2.94)*.398;
        r.rod(q(xx+.003,-.117,z),q(xx+.003,-.031,z),.004,'#b6c7cb',5);
      }
    }
  }),
];
export const dragonInterior={...group('crewdeck','Crew cabin cutaway','Four reclining couches share a single row. On Demo-2, Hurley and Behnken occupied the center two.',dragonParts),internal:true,view:'rear',source:dragonSource};
const dragonCabin=makeDetail('dragon-cabin','Endeavour’s four-seat cabin',dragonInterior.description,dragonSource,'dragon-room',dragonParts.map(p=>part(p.id,p.name,p.description,p.offset,r=>{
  const proxy=Object.create(r);
  proxy.polygon=(points,color,stroke)=>r.polygon(points.map(([x,y,z])=>[2*x,2*y,2*(z-2.39)]),color,stroke);
  p.draw(proxy);
})),{viewAngle:[-1.02,.50]});

const marsParts=[
  part('heatshield','Heat shield','The shallow, dark shield covered the underside of the entry vehicle and faced forward during entry.',[0,0,-.89],r=>section(r,0,0,[[.13,.17],[.16,.59],[.27,1.02],[.40,1.27],[.447,1.23]],'#69554a',{caps:true,steps:36})),
  part('rover','Perseverance · stowed','The six wheels folded under the rover to fit within the aeroshell. Open the rover to see the mast raised and the six wheels deployed.',[0,0,-.28],r=>{
    r.box(-.52,-.41,.505,.57,.41,.78,'#c1ac80');
    for(const x of [-.48,0,.48])for(const side of [-1,1]){
      const y=side*.49;r.tubeY(x,y-.061,y+.061,.584,.147,gray,18);
      r.ringY(x,y+side*.062,.584,.147,.053,steel,18);
    }
    r.rod([-.35,-.27,.816],[.32,-.25,.857],.031,'#a1a397',8);
    r.box(.22,-.32,.831,.405,-.17,.949,white);
  }),
  part('descent','Descent stage','The descent stage was packed above the rover within the backshell. It later lowered Perseverance to the surface.',[0,0,.38],r=>{
    for(const side of [-1,1])r.box(-.64,side*.43-.072,.944,.64,side*.43+.072,1.04,gold);
    for(const x of [-.53,.53])r.box(x-.069,-.48,.952,x+.069,.48,1.048,gold);
    r.box(-.3,-.33,1.025,.32,.33,1.103,gray);
  }),
  part('backshell','Backshell','The white upper half of the aeroshell enclosed the descent stage and the rover.',[0,0,.92],r=>section(r,0,0,[[.448,1.27],[.532,1.23],[.851,1.05],[1.20,.68],[1.35,.48]],white,{steps:36})),
  part('cruise','Cruise stage','The flat circular cruise stage provided power during the trip from Earth to Mars.',[0,0,1.47],r=>{
    section(r,0,0,[[1.355,.47],[1.40,.61],[1.41,1.00],[1.45,1.00]],gold,{caps:true});
    for(let i=0;i<22;i++)section(r,0,0,[[1.453,.53],[1.456,.967]],i%3?'#304955':'#405664',{from:i*TAU/22+.016,to:(i+1)*TAU/22-.016,steps:2});
  }),
];
const marsPayload=makeDetail('mars2020-stack','Mars 2020 spacecraft stack','NASA’s expanded spacecraft illustration shows how Perseverance traveled with the descent stage inside the aeroshell. Separate the layers from the cruise stage down to the heat shield.',marsSource,'mars',marsParts);
export function smallMarsStack(r) {
  const proxy=Object.create(r);
  proxy.polygon=(pts,c,stroke)=>r.polygon(pts.map(([x,y,z])=>[x*.142,y*.142,3.86+z*.142]),c,stroke);
  for(const p of marsParts)p.draw(proxy);
}

function fairingLeaf(r,stations,start,stop,color){
  section(r,0,0,stations,color,{from:start,to:stop,steps:24});
  section(r,0,0,stations.map(([z,rad])=>[z,Math.max(0,rad-.042)]),'#acaa92',{from:start,to:stop,steps:24});
  for(const angle of [start,stop]){
    const cut=stations.map(([z,rad])=>radial(0,0,z,rad,angle));loops(r,cut,.012,steel,false);
  }
}
const saturnAdapter=makeDetail('sla-panels','Falcon’s launch enclosure','Four tapered panels covered the lunar module atop the S-IVB. They separated after departure from Earth orbit, giving the command module access to Falcon.',source('NASA · Apollo 15 mission commentary','https://www.nasa.gov/wp-content/uploads/2026/01/as15-pao.pdf'),'sla',[
  ...[0,1,2,3].map(i=>{const a=i*TAU/4,b=a+TAU/4,m=(a+b)/2;return part('panel'+(i+1),'Adapter panel '+(i+1),'One quarter of the tapered cover that surrounded the folded lander.',[.91*Math.cos(m),.91*Math.sin(m),.37],r=>fairingLeaf(r,[[.18,1.02],[.49,1.02],[1.71,.63]],a+.009,b-.009,white));}),
  part('ring','Lower adapter section','The lower ring remained with the third stage.',[0,0,-.35],r=>section(r,0,0,[[.06,1.02],[.165,1.02],[.165,.93],[.06,.93]],gray,{steps:44})),
  part('payload','Falcon, legs stowed','The folded lunar module occupied the space between the panels. Its landing gear extended after the module had been extracted.',[0,0,.79],r=>{
    section(r,0,0,[[.225,.63],[.71,.63]],gold,{caps:true,steps:8});
    for(let i=0;i<4;i++){
      const a=i*TAU/4,d=.664;const p=(rr,zz)=>radial(0,0,zz,rr,a);
      r.rod(p(d,.30),p(.58,.67),.032,steel,8);
      const [x,y]=p(d,.30);section(r,x,y,[[.235,.094],[.259,.101]],gold,{caps:true,steps:12});
    }
    r.box(-.39,-.38,.72,.32,.38,1.139,'#88938d');r.box(-.20,-.29,1.14,.25,.29,1.29,'#a3aaa0');
    for(const sign of [-1,1])r.polygon([[-.392,sign*.334,.882],[-.392,sign*.33,1.10],[-.392,sign*.071,1.11]],'#344652',false);
    section(r,0,0,[[1.29,.108],[1.34,.108],[1.34,.082]],steel,{steps:18});
  })
]);
const falconFairing=makeDetail('satellite-fairing','Falcon payload fairing','Two long shells surround a satellite during ascent. The cut edge follows the full length of each half, from the broad base to the nose.',source('NASA · PACE payload fairing before closure','https://science.nasa.gov/blogs/pace/2024/02/01/pace-spacecraft-encapsulated-in-payload-fairing/'),'falcon-cover',[
  ...[-1,1].map((s,i)=>part(s<0?'near':'far',i?'Left fairing half':'Right fairing half','The inside face and seam are visible when this half is moved outboard.',[0,s*.94,.33],r=>{
    const a=i===0?Math.PI:0,b=a+Math.PI;
    fairingLeaf(r,[[.20,.70],[.39,.88],[2.02,.88],[2.35,.75],[2.62,.53],[2.84,.22],[2.93,.012]],a+.003,b-.003,white);
    for(const z of [.41,1.24,1.99])section(r,0,0,[[z,.84],[z+.025,.84]],'#a9a58f',{from:a+.012,to:b-.012,steps:18});
  })),
  part('air','Payload conditioning inlet','Before launch, a ground connection supplies conditioned air to the payload fairing.',[.62,0,.27],r=>r.rod([.828,.13,1.34],[.877,.13,1.34],.063,steel,18)),
  part('rim','Base opening','The base opening is wider than the stage below it, leaving room around the payload.',[0,0,-.36],r=>section(r,0,0,[[.082,.626],[.19,.695],[.19,.653],[.082,.60]],gray,{steps:32})),
]);
export function getSpaceDetail(vehicleId,partId){
  if(vehicleId==='apollo-lrv'){const drive=getLrvDrive(partId);if(drive)return drive;}
  if(vehicleId==='atlas-v-541'){const mobility=getPerseveranceMobility(partId);if(mobility)return mobility;}
  if(vehicleId==='apollo-falcon'){
    if(['cabin.hatch','interior.forward-hatch','lm-room.forward-hatch'].includes(partId))return hatch;
    if(['cabin.windows','interior.screens','lm-room.screens'].includes(partId))return glazing;
    if(['interior.dsky','lm-room.dsky'].includes(partId))return dsky;
    if(partId==='cabin.shell')return cabin;
  }
  if(vehicleId==='apollo-lrv'&&/^wheels\.wheel[1-4]$/.test(partId))return roverWheel;
  if(vehicleId==='crew-dragon'&&partId==='capsule.shell')return dragonCabin;
  if(vehicleId==='atlas-v-541'&&['upper.payload','upper.left','upper.right'].includes(partId))return marsPayload;
  if(vehicleId==='saturn-v'&&partId==='apollo.adapter')return saturnAdapter;
  if(['falcon-9','falcon-heavy'].includes(vehicleId)&&['upper.left','upper.right'].includes(partId))return falconFairing;
  return null;
}
