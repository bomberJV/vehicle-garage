// Diagram geometry is normalized for visibility. No flight mechanical drawings are implied.
import {section as study,part,source,slab} from './section-primitives.js';
import {section as shell} from './space-shapes.js';

const dragonSource=source('NASA · Crew Dragon environmental-control test module','https://www.nasa.gov/humans-in-space/eclss-put-to-the-test-for-commercial-crew-missions/');
const atlasSource=source('ULA · Atlas V User’s Guide, §6.2.2','https://www.ulalaunch.com/docs/default-source/rockets/atlasvusersguide2010.pdf');
const falconSource=source('SpaceX · Falcon User’s Guide, §5.2','https://www.spacex.com/assets/media/falcon-users-guide-2025-05-09.pdf');
const blue='#82bebf',warm='#d7a479',steel='#abb8b5',dark='#455a5d',panel='#dddcd2';
const tau=Math.PI*2;
function duct(r,points,radius,color){
  for(let i=1;i<points.length;i++)r.rod(points[i-1],points[i],radius,color,12);
}
function movingAir(r,points,phase,count,color){
  const lens=points.slice(1).map((p,i)=>Math.hypot(...p.map((v,j)=>v-points[i][j])));
  const total=lens.reduce((a,b)=>a+b,0);
  for(let i=0;i<count;i++){
    let distance=total*((phase+i/count)%1);
    let index=0;
    while(index<lens.length-1 && distance>lens[index])distance-=lens[index++];
    const p=points[index],q=points[index+1],at=t=>p.map((v,j)=>v+(q[j]-v)*t);
    r.rod(at(Math.max(0,(distance-.045)/lens[index])),at(Math.min(1,(distance+.045)/lens[index])),.025,color,8);
  }
}
function vent(r,x,y,z){
  slab(r,x,y,z,.33,.26,.028,'#a8b4b4',.038);
  for(let i=-2;i<=2;i++)r.rod([x+i*.047,y-.092,z+.040],[x+i*.047,y+.092,z+.040],.009,dark,6);
}
function rotor(r,c,rad,phase){
  const [x,y,z]=c;
  const at=(t,rise,h)=>[x+rise*Math.cos(t),y+rise*Math.sin(t),z+h];
  for(let n=0;n<7;n++){
    const a=tau*(n/7+phase);
    r.polygon([at(a,.040,0),at(a+.2,rad,-.026),at(a+.68,rad,.014),at(a+.49,.052,.035)],steel,false);
  }
  shell(r,x,y,[[z-.035,.052],[z+.028,.063],[z+.06,.040]],'#667f85',{caps:true,steps:16});
}
const dragonFlow=[[-.88,-.48,.64],[-.88,-.66,.23],[-.43,-.69,.23],[.15,-.69,.23],[.76,-.53,.25],[.85,-.31,.46],[.82,.41,.70],[.17,.49,.75],[-.58,.49,.75],[-.89,.16,.69],[-.88,-.48,.64]];
const dragon=study('dragon-air','Crew Dragon cabin air','A crew exhales carbon dioxide and adds heat and water vapor to the cabin. Follow the circulating air and the separate thermal path to the trunk radiator. The equipment layout is a functional diagram.',dragonSource,[
  part('deck','Floor and underfloor bay','SpaceX gave its ground test article a transparent floor so engineers could see the life-support equipment below. The flight capsule has an opaque floor.',[0,0,-.74],r=>{
    for(const y of [-.74,.70])slab(r,0,y,.06,2.1,.09,.08,steel,.022);
    for(const x of [-1,-.51,0,.51,1])slab(r,x,0,.063,.051,1.47,.054,steel,.012);
  }),
  part('breathing-zone','Crew breathing zone','The open upper arc traces mixing in the occupied cabin. Air movement carries exhaled gas away from the crew.',[-.1,.64,.42],(r,t)=>{
    movingAir(r,dragonFlow.slice(6,11),t,6,blue);
  }),
  part('return','Cabin return and supply outlets','Air passes through the cabin and back to the environmental-control equipment. The outlet positions and grille shapes illustrate that path.',[-.81,0,.25],r=>{
    vent(r,-.88,-.48,.63);vent(r,.83,.42,.66);duct(r,dragonFlow.slice(0,3),.049,dark);
    duct(r,dragonFlow.slice(4,7),.049,dark);
  }),
  part('fan','Circulation fan and shroud','A motor-driven fan keeps cabin air moving in microgravity. Open it to see the stationary shroud around the rotor.',[-.32,-.72,.21],(r,t)=>{
    shell(r,-.50,-.40,[[.22,.255],[.38,.255],[.38,.232],[.22,.232]],dark,{steps:26});rotor(r,[-.50,-.40,.34],.208,t);
  }),
  part('conditioning','Air treatment and humidity control','Cabin equipment limits the carbon dioxide that builds up with each breath and controls moisture. The cutaway identifies these functions. The flight cartridge design is unpublished here.',[.20,-.69,.36],r=>{
    slab(r,.05,-.30,.16,.57,.43,.27,panel);
    for(let n=0;n<9;n++)slab(r,-.16+n*.053,-.30,.44,.017,.36,.043,steel,.005);
    duct(r,[[-.27,-.42,.30],[-.19,-.42,.30]],.069,dark);
  }),
  part('makeup','Oxygen and nitrogen supply','The environmental-control system provides the cabin gas mixture. The two colors identify the gases in the ground test NASA describes.',[-.48,.65,.14],r=>{
    for(const [x,col] of [[-.48,'#a1bcbb'],[-.17,'#b2b1a5']]){
      shell(r,x,.17,[[.14,.076],[.19,.12],[.42,.12],[.49,.059]],col,{caps:true,steps:16});
      duct(r,[[x,.17,.50],[x,.17,.55],[x,-.04,.55]],.018,steel);
    }
  }),
  part('thermal','Coolant path and trunk radiator','The crew compartment transfers heat to a separate thermal circuit. Panels on the unpressurized trunk radiate heat to space.',[.07,.78,0],r=>{
    for(const x of [.19,.26,.33,.40,.47,.54,.61,.68,.75])slab(r,x,.33,.15,.052,.50,.048,'#b5c1bc',.015);
    duct(r,[[.06,-.11,.27],[.09,.09,.27],[.44,.09,.27],[.44,.37,.22]],.020,warm);
    duct(r,[[.51,.36,.22],[.51,.04,.23],[.15,.04,.23],[.15,-.12,.23]],.020,blue);
  }),
  part('flow','Airflow through the equipment','The moving marks trace circulation. Their speed is illustrative.',[.43,-.34,.71],(r,t)=>movingAir(r,dragonFlow.slice(0,7),t,9,blue))
]);
Object.assign(dragon,{animated:true,motionDescription:'Follow the turquoise marks from the cabin return, past the equipment, and back to the crew. The copper line shows where heat leaves the air.',viewAngle:[-.62,.66]});
const fan=study('dragon-fan','Cabin circulation fan','A section through a representative electric ventilation fan shows how torque reaches the blades. The motor and blade shapes are illustrative.',dragonSource,[
  part('housing','Stationary shroud','The circular housing surrounds the blade tips and guides the flow.',[0,0,-.52],r=>shell(r,0,0,[[.33,.76],[.52,.82],[.84,.82],[.84,.74],[.52,.74],[.34,.71]],dark,{steps:36})),
  part('blades','Fan rotor and blades','The swept blades rotate as a unit with the hub.',[0,0,.61],(r,t)=>rotor(r,[0,0,.74],.703,t)),
  part('motor','Electric motor','The motor turns the central shaft. Three struts attach its housing to the duct.',[.69,0,-.18],r=>{
    shell(r,0,0,[[.23,.16],[.55,.16],[.64,.12]],steel,{caps:true,steps:20});
    for(let i=0;i<3;i++){const a=i*tau/3;r.rod([.15*Math.cos(a),.15*Math.sin(a),.47],[.75*Math.cos(a),.75*Math.sin(a),.43],.025,steel,7);}
  }),
  part('shaft','Drive shaft','Torque passes from the motor to the fan hub along this shaft.',[-.60,.16,0],r=>r.rod([0,0,.51],[0,0,.77],.035,'#b89967',12))
]);
Object.assign(fan,{animated:true,motionDescription:'The hub and blades turn together inside the fixed shroud.',viewAngle:[-.48,.85]});
function fairingStudy(atlas){
  const ref=atlas?atlasSource:falconSource;
  const path=atlas?[[1.18,.10,1.94],[.82,.10,1.88],[.74,.10,1.72],[.77,.15,1.37],[.76,.23,.88],[.73,.26,.51],[.90,.26,.34]]:[[1.22,.10,1.45],[.86,.10,1.45],[.66,.12,1.61],[.47,.20,1.70],[.31,.28,1.63],[.20,.34,1.49]];
  const inner=atlas?[[.20,.81],[.48,.83],[1.50,.83],[1.86,.72],[2.15,.52],[2.38,.16]]:[[.20,.77],[.40,.85],[1.49,.85],[1.78,.76],[2.01,.57],[2.22,.22]];
  const parts=[
    part('liner','Fairing wall section','A section of the payload enclosure shows which surfaces border the conditioned space.',[-.68,.62,.08],r=>{
      shell(r,0,0,inner,'#c6bb9f',{from:.53,to:Math.PI*1.28,steps:28});
      for(const [z,rr] of inner.slice(1,-1))shell(r,0,0,[[z,rr-.012],[z+.018,rr-.012]],steel,{from:.54,to:Math.PI*1.28,steps:24});
    }),
    part('ground-duct','Ground air-conditioning duct','A duct from ground equipment supplies conditioned air while the payload is enclosed before launch.',[.95,0,.33],r=>{
      const zz=path[0][2];duct(r,[[1.65,.10,zz],[1.32,.10,zz],[1.18,.10,zz],[.84,.10,path[1][2]]],.11,dark);
      for(let n=0;n<7;n++){let x=1.16+n*.067;r.rod([x,.1,zz],[x+.016,.1,zz],.12,steel,12);}
    }),
    part('inlet',atlas?'Ogive inlet and diffuser':'Fairing air inlet',atlas?'Air enters the curved upper section. The inlet deflects the stream away from the spacecraft.':'The facility supply couples to a port in the fairing. This section shows the transition from the hose to the payload volume.',[.66,-.56,.16],r=>{
      const q=path[1];r.rod([q[0]-.12,.10,q[2]],[q[0]+.16,.10,q[2]],.14,steel,18);
      if(atlas)r.polygon([[.73,-.08,1.76],[.78,-.08,1.98],[.78,.28,1.98],[.73,.28,1.76]],'#99a7a3',false);
    }),
    part('flow','Conditioned air path',atlas?'The stream follows the enclosure and leaves through base-module vents.':'Air disperses through the space around the encapsulated payload. The traces show the direction schematically.',[.55,.48,.64],(r,t)=>movingAir(r,path,t,8,blue))
  ];
  if(atlas)parts.push(part('outlets','Base-module vent ports','Air supplied during ground processing exits through vents in the base module.',[.25,-.79,-.18],r=>vent(r,.77,.26,.31)));
  const view=study(atlas?'atlas-fairing-air':'falcon-fairing-air',atlas?'Atlas payload fairing air':'Falcon payload fairing air','On the ground, temperature and humidity matter even for an uncrewed satellite or rover. Open the fairing section to follow the conditioned air around the payload.',ref,parts);
  return Object.assign(view,{animated:true,motionDescription:'The turquoise marks trace ground-supplied air through the payload enclosure before launch.',viewAngle:[-.79,.35]});
}
const atlasAir=fairingStudy(true),falconAir=fairingStudy(false);
export function getSpaceEnvironment(vehicle,id){
  if(vehicle==='crew-dragon'){
    if(['crewdeck.air','dragon-room.air'].includes(id))return dragon;
    if(id==='dragon_air.fan')return fan;
  }
  if(vehicle==='atlas-v-541'&&id==='upper.air')return atlasAir;
  if(['falcon-9','falcon-heavy'].includes(vehicle)&&['upper.air','falcon-cover.air'].includes(id))return falconAir;
  return null;
}
