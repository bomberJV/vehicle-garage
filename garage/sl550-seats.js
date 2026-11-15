import {slPumpSource,slPumpStudy,drawSLPump} from './sl550-seat-supply.js';
import {part,study,tint} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';
import {backTrim,cushionTrim,headTrim,rearPanel,scarfOutlet,seatFrame,integralBelt} from './sl550-seat-trim.js';

const manual='https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf';
const plate='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-6l-v8-gas/body--passenger-seat-components';
const tracks='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/electrical--power-seats';
const sources={
  layers:{label:'R231 · seat back and seat cushion, diagrams 1 and 2',url:plate},
  scarf:{label:'2014 SL manual · AIRSCARF, p. 118',url:manual+'#page=120'},
  massage:{label:'2014 SL manual · massage and driving dynamics, pp. 320–321',url:manual+'#page=323'},
  motors:{label:'2014 SL550 · power seat tracks and components',url:tracks}
};
const housing='#44494a',metal='#898c86',air='#758d96';
const box=(r,a,b,color)=>r.box(...a,...b,color);
const polygon=(r,p,c)=>r.polygon(p,c,false);
const rod=(r,a,b,radius,c,n=6)=>r.rod(a,b,radius,c,n);
const cycle=t=>(1-Math.cos(2*Math.PI*t))/2;
const xBack=z=>.516+(z-.62)*.30;
function loopSkin(r,rows,color){
  for(let i=1;i<rows.length;i++)for(let j=0;j<rows[0].length;j++){
    const k=(j+1)%rows[i].length;
    polygon(r,[rows[i-1][j],rows[i-1][k],rows[i][k],rows[i][j]],tint(color,1-.09*(j%2)));
  }
}
function fan(r,xc,yc,zc,rad,phase,axis,color,high){
  const p=(d,ru,a)=>axis==='x'?[xc+d,yc+ru*Math.cos(a),zc+ru*Math.sin(a)]:[xc+ru*Math.cos(a),yc+ru*Math.sin(a),zc+d];
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4+phase*2*Math.PI;
    polygon(r,[p(0,rad*.26,a),p(0,rad*.90,a+.52),p(.0025,rad*.85,a+.82),p(.0025,rad*.27,a+.32)],tint(color,.84+.16*(i%3)/2));
  }
  const sides=high?20:10;
  const circle=(d,ru)=>Array.from({length:sides},(_,i)=>p(d,ru,i*2*Math.PI/sides));
  loopSkin(r,[circle(-.002,rad*.94),circle(-.002,rad*1.10),circle(.009,rad*1.10),circle(.009,rad*.94)],housing);
  polygon(r,circle(.001,rad*.25),metal);
}
function scarfBlower(r,t=0,high=false){
  const z=.881;
  fan(r,.624,0,z,.044,t,'x','#7b8584',high);
  const shell=Array.from({length:13},(_,i)=>{
    const a=i*2*Math.PI/12,rad=.048+.004*i/12;
    return [.636,rad*Math.cos(a),z+rad*Math.sin(a)];
  });
  loopSkin(r,[shell,shell.map(([x,y,z])=>[x+.009,y,z])],housing);
  polygon(r,shell.map(([x,y,z])=>[x+.009,y,z]),housing);
}
function scarfDuct(r){
  const row=(z,x,y,hw,hd)=>[[x-hd,y-hw,z],[x+hd,y-hw,z],[x+hd,y+hw,z],[x-hd,y+hw,z]];
  loopSkin(r,[row(.894,.627,-.044,.012,.012),row(.930,.621,-.033,.019,.012),
    row(.969,.619,-.008,.023,.012),row(1.020,.617,0,.03,.013),row(1.058,.596,0,.057,.015),
    [[.565,-.072,1.047],[.565,-.072,1.080],[.565,.072,1.080],[.565,.072,1.047]]],housing);
}
function scarfElement(r,level=0){
  const color=['#a29c86','#ae9479','#b38d65','#bc885c'][level]||'#a29c86';
  for(let i=-3;i<=3;i++)box(r,[.608,i*.0055-.0008,.949],[.632,i*.0055+.0008,.966],color);
  box(r,[.608,-.023,.948],[.632,.023,.951],'#715e50');
}
function scarfWiring(r){
  pipe(r,[[.625,.035,.881],[.616,.065,.844],[.580,.087,.705],[.541,.084,.577]],.0028,'#514e47',5);
  box(r,[.533,.077,.566],[.549,.093,.581],'#9c9a86');
}
function chamber(r,z,y,halfWidth,height,depth){
  // A shallow, welded-edge pillow. Its seam stays on the carrier as the middle inflates.
  const rings=[[1,0],[.75,.72],[.34,1.0]],x=xBack(z);
  const rows=rings.map(([radius,puff])=>Array.from({length:12},(_,i)=>{
    const a=i*Math.PI/6,c=Math.cos(a),s=Math.sin(a);
    return [x-depth*puff+.3*height*radius*s,y+halfWidth*radius*Math.sign(c)*Math.abs(c)**.55,z+height*radius*Math.sign(s)*Math.abs(s)**.60];
  }));
  loopSkin(r,rows,'#85918a');polygon(r,rows[2],'#a0aba2');polygon(r,rows[0],'#606b67');
}
function massageInsert(r,t,mode='slow-gentle'){
  const fast=mode.startsWith('fast'),vigorous=mode.endsWith('vigorous');
  // The six transverse envelopes follow item 7. Travel illustrates the pressure
  // wave; Mercedes does not publish the control-valve timing in the parts plate.
  for(let i=0;i<6;i++){
    const z=.618+i*.046,signal=mode==='off'?0:Math.max(0,Math.cos(2*Math.PI*(t*(fast?2:1)-i/6)));
    chamber(r,z,0,.071,.017,.003+signal*(vigorous?.016:.009));
  }
}
function lumbar(r){
  for(const z of [.662,.742])for(const s of [-1,1]){
    // Item 8 stacks behind the massage insert. A separate air feed serves this pad.
    const p=[xBack(z)+.022,.052*s,z];
    polygon(r,[[-.039,-.030],[.039,-.030],[.046,.017],[.018,.038],[-.038,.027]].map(([y,h])=>[p[0]+h*.28,p[1]+y,p[2]+h]),'#81929b');
  }
}
function bolsterCells(r){
  for(const side of [-1,1]){
    const rows=[[.637,.147,.012],[.685,.162,.031],[.778,.163,.038],[.837,.151,.021]];
    loopSkin(r,rows.map(([z,w,hw])=>Array.from({length:8},(_,i)=>[xBack(z)-.013+.012*Math.cos(i*Math.PI/4),side*(w+hw*Math.sin(i*Math.PI/4)),z])),'#788b93');
  }
}
function distribution(r){
  box(r,[.529,.088,.563],[.568,.143,.598],housing);
  for(let i=0;i<3;i++){
    const y=.100+i*.012;
    pipe(r,[[.545,y,.598],[.555,y,.621],[.564,.078+i*.009,.668],[.583,.078+i*.009,.732+i*.02]],.0026,air,5);
  }
}
function ventilation(r,t,level,high=false){
  const shade=['#5c6566','#657578','#698083','#718e93'][level]||'#5c6566';
  fan(r,.605,-.057,.800,.030,t,'x',shade,high);
  fan(r,.602,.057,.800,.030,t,'x',shade,high);
}
function ventLayer(r){
  // Open spacer fabric retained around the two backrest fans. Showing the
  // coarse yarn directions makes the fan positions readable at this scale.
  const point=(u,v)=>[.556+.045*v,.1*u,.67+.192*v];
  for(let j=-4;j<=4;j++){
    const u=j/4;
    polygon(r,[point(u-.014,0),point(u+.014,0),point(u+.014,1),point(u-.014,1)],'#74857f');
  }
  for(let j=0;j<7;j++){
    const t=j/6;
    polygon(r,[point(-1,t),point(1,t),point(1,t+.013),point(-1,t+.013)],'#6c817a');
  }
  for(let j=-4;j<=4;j++){
    const y=j*.031;
    polygon(r,[[.11,y-.002,.494],[.11,y+.002,.494],[.413,y+.002,.488],[.413,y-.002,.488]],'#758880');
  }
  for(let j=0;j<10;j++){
    const x=.11+j*.033,z=.494-(x-.11)*.02;
    polygon(r,[[x,-.125,z],[x+.002,-.125,z],[x+.002,.125,z],[x,.125,z]],'#677a74');
  }
}
function backHeat(r,level=0){
  const warm=['#ad8e62','#b79062','#c49360','#cd9860'][level]||'#ad8e62';
  for(const s of [-1,1]){
    const z0=.583,z1=.933;
    polygon(r,[[xBack(z0)-.02,.09*s,z0],[xBack(z0)-.02,.133*s,z0],[xBack(z1)-.013,.14*s,z1],[xBack(z1)-.013,.098*s,z1]],warm);
  }
  for(const s of [-1,1]){
    const points=Array.from({length:18},(_,j)=>{
      const z=.600+j*.018;return [xBack(z)-.022,(j%2?.121:.104)*s,z];
    });
    pipe(r,points,.0012,'#8d7561',3);
  }
  for(const z of [.65,.89])polygon(r,[[xBack(z)-.018,-.105,z],[xBack(z)-.018,.105,z],[xBack(z)-.014,.105,z+.018],[xBack(z)-.014,-.105,z+.018]],warm);
}
function baseHeat(r,level=0){
  const c=['#ac9778','#bc9972','#c99b68','#d39d63'][level]||'#ac9778';
  polygon(r,[[.078,-.157,.511],[.078,.157,.511],[.410,.166,.509],[.457,.115,.502],[.457,-.115,.502],[.410,-.166,.509]],c);
  // Conductor pattern shown schematically on the service mat.
  const path=[];
  for(let i=0;i<8;i++){
    const x=.105+i*.041,side=i%2===0?1:-1,z=.513-(x-.078)*.006;
    path.push([x,-side*.118,z],[x,side*.118,z]);
  }
  pipe(r,path,.0015,'#8d7561',4);
}
function heatLeads(r){
  pipe(r,[[.345,.15,.508],[.371,.174,.48],[.417,.15,.403],[.395,.085,.386]],.003,'#574f44',5);
  box(r,[.38,.078,.376],[.403,.096,.394],'#929487');
}
function rails(r){
  for(const s of [-1,1]){
    const y=s*.166;
    box(r,[.025,y-.013,.335],[.53,y+.013,.351],metal);
    box(r,[.025,y-.015,.351],[.53,y-.009,.37],housing);
    box(r,[.025,y+.009,.351],[.53,y+.015,.37],housing);
    for(const x of [.048,.51])rod(r,[x,y,.326],[x,y,.348],.010,'#69706a',6);
  }
}
function carriage(r,t=0){
  const travel=.043*cycle(t);
  for(const side of [-1,1]){
    const y=side*.166;
    box(r,[.066+travel,y-.007,.351],[.458+travel,y+.007,.376],housing);
    for(const x of [.101,.416])rod(r,[x+travel,y,.370],[x+.032+travel,y,.419],.011,metal,6);
  }
  rod(r,[.338+travel,-.163,.390],[.338+travel,.163,.390],.010,housing,8);
}
function railDrive(r){
  rod(r,[.307,-.060,.384],[.307,.01,.384],.021,metal,8);
  box(r,[.282,.009,.363],[.330,.044,.397],housing);
  for(const s of [-1,1])rod(r,[.307,s*.033,.384],[.307,s*.166,.36],.004,'#6b6e6b',6);
}
function seatModule(r){
  box(r,[.14,-.105,.36],[.247,.013,.38],housing);
  for(let i=0;i<3;i++)box(r,[.146+i*.030,-.11,.369],[.161+i*.030,-.10,.386],i===1?'#96896f':'#686b64');
}

// Cutaways inherit the selected occupant's settings. An unpowered seat can
// still run the inspector's demonstration cycle when Play motion is pressed.
const selectedControls=r=>r.build?.slComfort?.[r.inspection?.studySeat||'driver'];
function demonstratedMassage(r){
  const mode=selectedControls(r)?.massage;
  return mode&&mode!=='off'?mode:'slow-gentle';
}
const components={
  airscarf:{
    name:'AIRSCARF neck heater',source:sources.scarf,offset:[-.18,0,.23],
    description:'A backrest blower sends warmed air through a duct to the grille beneath the head restraint. The door button selects one of three heat settings.',
    motion:'The impeller turns inside the blower. The cutaway separates the heater, duct and outlet so you can trace the path to the neck.',
    parts:[
      part('blower','Backrest blower','A centrifugal impeller draws air into the round end of the seat-back blower. Its discharge turns upward into the duct.',[.17,0,0],(r,t)=>scarfBlower(r,t,true)),
      part('heater','Air-heating element','The electric element heats the passing air. The three settings change the requested heat. The fin and coil dimensions are illustrative.',[0,-.12,.05],r=>scarfElement(r,selectedControls(r)?.airscarf??2)),
      part('duct','Outlet duct','The duct rises behind the backrest padding and widens below the head restraint.',[0,.15,.015],scarfDuct),
      part('grille','Head-restraint outlet','A horizontal vane sits in the mouth of the head-restraint grille. The opening in the leather lines up with this part.',[-.14,0,.11],r=>scarfOutlet(r,selectedControls(r)?.airscarf??2)),
      part('lead','Blower electrical lead','The wiring descends into the backrest. Routing between the cataloged components is schematic.',[0,0,-.13],scarfWiring)
    ]
  },
  massage:{
    name:'Massage and active multicontour',source:sources.layers,offset:[-.24,0,.11],
    description:'Behind the leather, an air insert presses on different parts of the back. The lumbar insert and outer bolster chambers have separate jobs. COMAND offers slow or fast massage at two strengths.',
    motion:'A pressure wave travels up the backrest insert. Open the group to see the lumbar pad, side chambers, valve and distributor alongside it. The demonstration speeds up the cycle.',
    parts:[
      part('insert','Massage air insert','Plate 1, item 7 is the massage insert, A 231 800 08 78. The animation illustrates successive pressure changes. The pneumatic timing is approximate.',[-.115,0,.03],(r,t)=>massageInsert(r,t,demonstratedMassage(r))),
      part('lumbar','Four-way lumbar insert','Plate 1, item 8 supports the lower back. COMAND changes the amount of support and its vertical position.',[.09,0,.08],lumbar),
      part('bolsters','Active side support chambers','The side supports can change firmness during cornering. The owner’s manual describes two levels of driving-dynamics support.',[0,-.17,.035],bolsterCells),
      part('valve','Valve, distributor and hoses','The seat-back catalog identifies the dynamic control valve and air distributor as separate fittings. The modeled hose paths show the connection to the inserts.',[0,.16,-.07],distribution)
    ]
  },
  ventilation:{
    name:'Active seat ventilation',source:sources.layers,offset:[.14,0,.08],
    description:'Fans move cabin air through the seat padding and perforated leather. The manual gives three ventilation settings. A separate blower supplies AIRSCARF.',
    motion:'Watch the blades turn and separate the distribution layer from the fans to see where air reaches the upholstery.',
    parts:[
      part('fans','Backrest ventilation fans','The two fan locations across the upper backrest follow item 4 of the passenger-seat plate. The wheel blades are schematic.',[.12,0,0],(r,t)=>ventilation(r,t,selectedControls(r)?.vent??3,true)),
      part('layer','Permeable cushion and backrest layers','Ventilating layers distribute air across the contact surfaces. Their thickness is estimated from the assembly drawing.',[-.09,.09,-.04],ventLayer)
    ]
  },
  heating:{
    name:'Cushion and backrest heaters',source:sources.layers,offset:[-.08,0,.20],
    description:'Flexible electric mats sit under the trim. In COMAND, heating balance shifts heat between the cushion and backrest. Both mats can be separated from their harness.',
    parts:[
      part('back','Backrest heating mat','Item 6 on the backrest drawing wraps around the contact area between the upholstery and foam.',[-.09,0,.12],r=>backHeat(r,selectedControls(r)?.heat??2)),
      part('base','Cushion heating mat','Item 7 on the cushion drawing lies between the molded cushion and trim.',[0,0,.14],r=>baseHeat(r,selectedControls(r)?.heat??2)),
      part('leads','Heater supply lead','A flexible lead carries the electrical supply below the cushion. Its precise slack and connector positions vary.',[.07,.095,-.06],heatLeads)
    ]
  },
  adjustment:{
    name:'Power seat base and slide drive',source:sources.motors,offset:[0,0,-.15],
    description:'Two tracks guide the seat fore and aft. The left and right adjusters carry separate catalog numbers. Open the base to see the fixed rails, moving carriage and under-seat electronics.',
    motion:'The carriage slides along its two fixed tracks. The distance shown is a short demonstration stroke.',
    parts:[
      part('rails','Floor tracks and mounting bolts','The paired lower rails attach the seat to the cabin floor.',[0,0,-.12],rails),
      part('carriage','Sliding seat carriage','The upper slides and lift links carry the cushion above the floor tracks.',[0,0,.12],carriage),
      part('drive','Electric drive and cross shafts','The schematic motor and cross-shaft layout shows how both rails advance together. The catalog supplies the adjuster as an assembly.',[-.10,-.09,0],railDrive),
      part('module','Seat control module','The unit below the cushion receives adjustment commands and drives the seat motors.',[.08,.11,.025],seatModule)
    ]
  }
};
const trim=[
  part('cushion','Nappa cushion and thigh bolsters','The perforated center panel sits between raised thigh bolsters. Separate the cushion to reach the base heating mat.',[-.12,0,.12],cushionTrim),
  part('back','Nappa backrest and shoulder bolsters','The contoured shoulder and side wings sit over the support, massage and heating layers.',[-.14,0,.08],backTrim),
  part('rear-cover','Removable seat-back panel','Plate 1, item 20 closes the back of the seat. Move it rearward to expose the AIRSCARF blower, upper frame and electrical connections.',[.19,0,.035],rearPanel),
  part('head','Head restraint and guide posts','The upholstered head restraint has an opening at its lower front edge for the neck heater outlet.',[0,0,.16],headTrim),
  part('frame','Backrest and cushion frames','The back frame and base frame carry the upholstery and adjustable supports.',[.16,0,-.06],seatFrame)
];
const systems=Object.keys(components);
const belt=side=>part('belt','Integral belt and buckle','The shoulder webbing comes out of a guide on the outboard side of the seat. The tongue clips into the buckle next to the center console.',[0,side*.125,.08],r=>integralBelt(r,side));
const seatParts=[
  ['supply','Shared pneumatic pump and reservoir','One pump at the front left of the trunk supplies both seats. Trace the pneumatic lines forward to the two seat valves.',[.10,-.12,.12],slPumpSource],
  ['driver','Driver’s seat','Open the left seat to separate the leather cushion, contoured backrest, head restraint and frame.',[0,-.22,.08],sources.layers],
  ['passenger','Passenger’s seat','Open the right seat to inspect its upholstery, climate layers and powered base.',[0,.22,.08],sources.layers],
  ...systems.map(key=>{const c=components[key];return [key,c.name,c.description,c.offset,c.source];})
];
export const slSeatGroup={
  id:'seats',name:'Seats, AIRSCARF and massage',description:'Two Ginger Beige Nappa seats have independent neck heating, active ventilation and pneumatic back support. Select a seat or an individual system.',
  parts:seatParts.map(([id,name,description,offset,source])=>({id:'seats.'+id,name,description,offset,source}))
};
function drawSystem(r,key,controls={},t=0){
  if(key==='airscarf'){scarfBlower(r,t);scarfElement(r,controls.airscarf);scarfDuct(r);scarfOutlet(r,controls.airscarf);scarfWiring(r);}
  if(key==='massage'){massageInsert(r,t,controls.massage||'off');lumbar(r);bolsterCells(r);distribution(r);}
  if(key==='ventilation'){ventilation(r,t,controls.vent);ventLayer(r);}
  if(key==='heating'){backHeat(r,controls.heat);baseHeat(r,controls.heat);heatLeads(r);}
  if(key==='adjustment'){rails(r);carriage(r,t);railDrive(r);seatModule(r);}
}
const seatService=(side,id)=>study(id,'Power multicontour seat','The fit of the outer trim follows the US brochure’s seat photograph. The exploded catalog drawings establish the order of the padding, heating mats, air inserts, back frame and adjustable base. Internal dimensions are approximate.',sources.layers,[
  ...trim,belt(side),...systems.map(key=>{const c=components[key];return part(key,c.name,c.description,c.offset,r=>drawSystem(r,key,r.build?.slComfort?.[side<0?'driver':'passenger']));})
]);
const driverSeat=seatService(-1,'sl-seat'),passengerSeat=seatService(1,'sl-passenger-seat');
driverSeat.viewAngle=[-.91,.25];passengerSeat.viewAngle=[-.91,.25];
export const slSeatStudies={'seats.supply':slPumpStudy,'seats.driver':driverSeat,'seats.passenger':passengerSeat};
for(const key of systems){
  const c=components[key],detail=study('sl-seat-'+key,c.name,c.description,c.source,c.parts,c.motion);
  detail.viewAngle=key==='heating'?[-.88,.51]:[-1.00,.22];
  slSeatStudies['seats.'+key]=detail;slSeatStudies['sl-seat.'+key]=detail;slSeatStudies['sl-passenger-seat.'+key]=detail;
}

export function drawSLSeats(r){
  r.tag('seats.supply',()=>drawSLPump(r));
  for(const [role,y] of [['driver',-.39],['passenger',.39]]){
    const start=r.faces.length;
    const controls=r.build?.slComfort?.[role];
    r.instance(role,()=>{
      r.tag('seats.'+role,()=>{for(const p of trim)p.draw(r);integralBelt(r,Math.sign(y));});
      for(const key of systems)r.tag('seats.'+key,()=>drawSystem(r,key,controls));
    });
    // Rebuild positions per face. Mesh primitives can share vertices, so mutating
    // a coordinate in place would translate it once for each adjoining face.
    for(let i=start;i<r.faces.length;i++)r.faces[i].points=r.faces[i].points.map(([x,v,z])=>[x,v+y,z]);
  }
}
