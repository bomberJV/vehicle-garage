// LM-10 crew compartment, based on Apollo Operations Handbook figure 1-7.
import {lmAirRack} from './apollo-air.js';
import {section,loops,part,group} from './space-shapes.js';
import {glazingFace} from './surface-materials.js';

export const lmHandbook={label:'NASA · LM-10 Operations Handbook, figures 1-7 through 1-10',url:'https://apollojournals.org/alsj/LM10HandbookVol1.pdf'};
export const lmPhotos={label:'Apollo Lunar Surface Journal · Falcon closeout photographs',url:'https://www.apollojournals.org/alsj/a15/a15LMCloseOutPhotos.html'};
const steel='#aaa99b', gray='#727e7a', black='#313a3c', linen='#b3ae90', screen='#283a37', luminous='#a8cc97';
function xPlate(r,x,points,color){r.polygon(points.map(([y,z])=>[x,y,z]),color,false);}
function liner(r){
  // Keep the starboard wall and most of the aft bulkhead peeled back. The
  // instrument sill, port lining and crown bow remain joined to the floor.
  for(const s of [-1,1]){
    const face=(loop,c)=>xPlate(r,-.942,loop.map(([y,z])=>[y*s,z]),c);
    const a=[.43,2.41],b=[.444,2.611],c=[.106,2.661];
    face([[.235,1.84],[.50,1.84],[.57,1.985],[.57,2.284],[.235,2.284]],'#89958d');
    face([[.235,2.284],[.57,2.284],[.57,2.432],a,[.235,2.383]],'#a3a896');
    face([[0,2.383],[.235,2.383],a,c,[0,2.661]],'#adb4a6');
    face([a,[.57,2.432],[.53,2.64],b],'#87958a');
    face([b,[.53,2.64],[.37,2.79],c],'#adb4a9');
    face([c,[.37,2.79],[.24,2.846],[0,2.846],[0,2.661]],'#bdc0af');
    face([[0,1.806],[.50,1.806],[.50,1.837],[0,1.837]],'#888e80');
    const jamb=(y,z)=>[-.925,y*s,z];
    r.rod(jamb(.235,1.842),jamb(.235,2.373),.018,steel,9);
    r.rod(jamb(0,2.373),jamb(.235,2.373),.018,steel,9);
    for(const z of [1.89,2.05,2.19])r.rod(jamb(.495,z),[-.802,s*.607,z],.011,'#b1b1a0',6);
  }
  const ribs=[
    [[-.942,-.49,1.806],[-.942,-.555,2.431],[-.942,-.53,2.643],[-.942,-.37,2.79],[-.942,-.20,2.846]],
    [[-.59,-.632,1.771],[-.59,-.71,2.383],[-.59,-.67,2.676],[-.59,-.49,2.864],[-.59,-.22,2.974]],
    [[-.03,-.643,1.778],[-.03,-.74,2.38],[-.03,-.695,2.711],[-.03,-.515,2.914],[-.03,-.22,3.00]],
    [[.44,-.57,1.969],[.44,-.611,2.361],[.44,-.585,2.662],[.44,-.458,2.838],[.44,-.21,2.938]]
  ];
  for(let j=0;j<ribs.length-1;j++){
    for(let k=0;k<4;k++){
      // A cutout in the port upper lining leaves room for the docking window.
      if(j===1&&k===3)continue;
      r.polygon([ribs[j][k],ribs[j+1][k],ribs[j+1][k+1],ribs[j][k+1]],['#939d90','#b4b9a6','#a8af9f','#c8c7ad'][k],false);
    }
    r.rod(ribs[j][2],ribs[j+1][2],.015,'#929b8b',8);
  }
  for(const rib of ribs)loops(r,rib,.012,'#758174',false);
  // Leave a strip through the crown and a narrow aft arch in place; the rest
  // of the ceiling and the right side of the cutaway are open to the viewer.
  const forward=[[-.942,-.22,2.846],[-.59,-.18,2.98],[-.05,-.15,3.01]];
  loops(r,forward,.026,'#8e9b8f',false);
  const arch=[[.46,-.568,1.98],[.46,-.583,2.50],[.46,-.448,2.825],[.43,-.218,2.944],[.41,.045,2.975],[.40,.221,2.93]];
  loops(r,arch,.029,'#89998c',false);
  for(const [x,y] of [[-.037,-.10],[.28,-.092],[.28,.093]]){
    r.rod([x,y,2.967],[x<=0?-.23:.416,y<0?-.214:.13,x<=0?3.002:2.966],.028,'#929b8d',8);
  }
  for(const [x,y,z] of [[-.421,0,2.958],[-.060,0,2.975]]){
    r.rod([x,y,z],[x,-.179,z+.018],.020,'#919b8d',8);
  }
  // Stowage is tied to the equipment step and to a corner of the aft rack.
  for(const side of [-1,1]){
    for(const x of [.048,.482]){
      r.rod([x,side*.57,1.992],[x,side*.57,2.359],.013,'#838a7a',8);
    }
    for(const z of [2.02,2.187]){
      r.box(.060,side*.44-.14,z-.014,.485,side*.44+.14,z,'#8c9281');
      r.rod([.062,side*.57,z+.024],[.483,side*.57,z+.024],.012,steel,7);
    }
  }
  // Brackets carry the side instrument panels back to the floor rails.
  for(const side of [-1,1]){
    for(const x of [-.692,-.417])r.rod([x,side*.622,1.788],[x,side*.648,2.025],.018,'#858f85',8);
    r.rod([-.804,side*.58,2.22],[-.857,side*.492,2.248],.027,gray,8);
  }
}
function pouch(r,x,y,z){
  const ring=(dy,scale)=>[[-.112,-.046],[-.077,-.074],[.074,-.074],[.110,-.042],[.110,.041],[.074,.073],[-.075,.073],[-.112,.043]].map(([dx,dz])=>[x+dx*scale,y+dy,z+dz*scale]);
  const ribs=[ring(-.121,.75),ring(-.095,1),ring(.095,1),ring(.121,.75)];
  for(let i=0;i<3;i++)for(let j=0;j<8;j++){
    const k=(j+1)%8;r.polygon([ribs[i][j],ribs[i+1][j],ribs[i+1][k],ribs[i][k]],['#bab399','#c6bea4','#b4ae94'][i],false);
  }
  for(const loop of [ribs[0],ribs[3]]){r.polygon(loop,'#b1a98e',false);loops(r,loop,.004,'#827c68');}
  for(const dy of [-.053,.054]){
    const edges=[ring(dy-.009,1.019),ring(dy+.009,1.019)];
    for(let j=0;j<8;j++){const k=(j+1)%8;r.polygon([edges[0][j],edges[1][j],edges[1][k],edges[0][k]],'#737365',false);}
    r.box(x-.117,y+dy-.014,z-.008,x-.111,y+dy+.014,z+.012,'#aba791');
  }
}
function dial(r,x,y,z,rad) {
  r.discX(x,y,z,rad,black,22);
  r.discX(x+.0015,y,z,rad*.76,'#51615f',18);
  for(let i=0;i<7;i++){
    const a=-.3+i*.52;
    r.rod([x+.003,y+Math.cos(a)*rad*.64,z+Math.sin(a)*rad*.64],[x+.003,y+Math.cos(a)*rad*.82,z+Math.sin(a)*rad*.82],rad*.026,'#e3deca',5);
  }
  r.rod([x+.004,y,z],[x+.004,y+rad*.3,z+rad*.49],rad*.052,'#eadfc7',5);
}
const numericShapes={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgecd',7:'abc',8:'abcdefg',9:'abfgcd'};
const letterPixels={
  A:['010','101','111','101','101'], B:['110','101','110','101','110'],
  C:['011','100','100','100','011'], D:['110','101','101','101','110'],
  E:['111','100','110','100','111'], G:['011','100','101','101','011'],
  H:['101','101','111','101','101'], I:['111','010','010','010','111'],
  K:['101','101','110','101','101'], L:['100','100','100','100','111'],
  M:['101','111','111','101','101'], N:['101','111','111','111','101'],
  O:['010','101','101','101','010'], P:['110','101','110','100','100'],
  R:['110','101','110','101','101'], S:['011','100','010','001','110'],
  T:['111','010','010','010','010'], U:['101','101','101','101','111'],
  V:['101','101','101','101','010'], Y:['101','101','010','010','010']
};
function label(r,point,word,center,z,size,depth,color){
  const start=center-(word.length*4-1)*size/2;
  for(let i=0;i<word.length;i++)for(let row=0;row<5;row++){
    const pixels=letterPixels[word[i]][row];
    for(const run of pixels.matchAll(/1+/g)){
      const y=start+(i*4+run.index)*size,lo=z+(4-row)*size,hi=lo+size*.91;
      r.polygon([point(y,lo,depth),point(y+size*run[0].length,lo,depth),point(y+size*run[0].length,hi,depth),point(y,hi,depth)],color,false);
    }
  }
}
function writeDigit(r,point,y,z,height,value,depth=.014,color=luminous){
  const width=height*.51, bars={a:[0,1,1,1],b:[1,1,1,.53],c:[1,.47,1,0],d:[0,0,1,0],e:[0,.47,0,0],f:[0,1,0,.53],g:[0,.50,1,.50]};
  const thickness=Math.hypot(...point(0,height,depth).map((v,i)=>v-point(0,0,depth)[i]))*.045;
  for(const key of numericShapes[value]){
    const [u,v,s,t]=bars[key];
    r.rod(point(y+u*width,z+v*height,depth),point(y+s*width,z+t*height,depth),thickness,color,5);
  }
}
// Local display coordinates place the front face on positive X. We use scaled
// versions of the same layout on the cabin panel and in the bench cutaway.
export function dskyFace(r,tag,transform,readDirection=-1){
  const point=(y,z,depth=0)=>transform(depth,readDirection*y,z);
  const rect=(y,z,w,h,depth,c)=>r.polygon([point(y,z,depth),point(y+w,z,depth),point(y+w,z+h,depth),point(y,z+h,depth)],c,false);
  const datum=point(0,0),scale=point(0,1)[2]-datum[2];
  if(tag==='case'){
    const back=[[-.46,-.56],[.46,-.56],[.5,-.48],[.5,.49],[.43,.56],[-.43,.56],[-.5,.49],[-.5,-.48]];
    for(const depth of [-.09,0])r.polygon(back.map(([y,z])=>point(y,z,depth)),depth?gray:'#838e86',false);
    for(let i=0;i<back.length;i++){const j=(i+1)%back.length;r.polygon([point(...back[i],-.09),point(...back[j],-.09),point(...back[j]),point(...back[i])],gray,false);}
    for(const y of [-.445,.445])for(const z of [-.46,.46])r.discX(datum[0]+scale*.002,datum[1]+scale*y,datum[2]+scale*z,scale*.017,black,10);
  }
  if(tag==='registers'){
    rect(-.04,.02,.47,.445,.005,screen);
    for(let row=0;row<3;row++){
      const vals=['00000','00124','00036'][row],z=.06+row*.085;
      rect(-.019,z+.025,.028,.008,.012,luminous);
      for(let n=0;n<5;n++)writeDigit(r,point,.032+n*.075,z,.060,Number(vals[n]));
    }
    for(const [y,z,pair,field] of [[.239,.375,'00','PROG'],[.010,.290,'16','VERB'],[.239,.290,'68','NOUN']]){
      for(let i=0;i<2;i++)writeDigit(r,point,y+i*.066,z,.048,Number(pair[i]));
      label(r,point,field,y+.045,z+.056,.004,.016,luminous);
    }
  }
  if(tag==='lights'){
    rect(-.423,.019,.35,.447,.006,black);
    for(let j=0;j<7;j++)for(let i=0;i<2;i++)rect(-.402+i*.161,.037+j*.060,.143,.045,.012,j===1&&i===0?'#b99a60':'#727b70');
  }
  if(tag==='keys'){
    // Five columns of three keys sit between two shorter columns.
    const columns=[['NOUN','VERB'],[0,'−','+'],[1,4,7],[2,5,8],[3,6,9],['KEY REL','PRO','CLR'],['RSET','ENTR']];
    for(let c=0;c<columns.length;c++)for(let j=0;j<columns[c].length;j++){
      const y=-.421+c*.122,z=-.468+j*.128+(columns[c].length===2?.062:0);
      rect(y,z,.106,.108,.015,black);
      const key=columns[c][j];
      if(typeof key==='number')writeDigit(r,point,y+.044,z+.031,.045,key,.019,linen);
      else if(key==='+'||key==='−'){
        rect(y+.031,z+.050,.044,.006,.021,linen);
        if(key==='+')rect(y+.050,z+.029,.006,.046,.021,linen);
      } else {
        const words=key.split(' ');
        words.forEach((word,i)=>label(r,point,word,y+.053,z+.039+(words.length===1?0:(.5-i)*.033),.0054,.021,linen));
      }
    }
  }
}
export const windowPoints=side=>[[-.996,side*.43,2.41],[-.995,side*.444,2.611],[-.996,side*.106,2.661]];
function interiorFloor(r){
  r.box(-.805,-.643,1.754,.237,.643,1.781,'#9d9f8e');
  for(const y of [-.48,-.34,-.20,.20,.34,.48])r.box(-.685,y-.018,1.782,.158,y+.018,1.788,'#626a60');
  r.box(.236,-.61,1.76,.588,.61,1.975,'#949589');r.box(.24,-.61,1.977,.59,.61,1.999,'#b2ab93');
  for(const y of [-.55,-.32,0,.32,.55])r.box(.265,y-.013,2.00,.566,y+.013,2.006,'#686e64');
}
function station(r,side){
  const y=side*.424;
  for(const dy of [-.118,.118]){
    r.rod([-.42,y+dy,1.788],[-.49,y+dy,2.01],.011,'#646960',7);
    r.rod([-.49,y+dy,2.01],[-.43,y+dy*.76,2.085],.014,linen,7);
  }
  r.rod([-.657,y-.114,2.14],[-.657,y+.114,2.14],.017,black,8);
  r.rod([-.657,y-.114,2.14],[-.704,y-.114,2.225],.011,steel,7);
  r.rod([-.657,y+.114,2.14],[-.704,y+.114,2.225],.011,steel,7);
  r.rod([-.543,y+side*.139,1.96],[-.547,y+side*.157,2.115],.015,steel,8);
  r.rod([-.547,y+side*.157,2.115],[-.55,y+side*.141,2.175],.022,black,8);
}
function panel(r,side){
  const y=side*.461;
  r.box(-.898,y-.216,2.21,-.826,y+.216,2.388,gray);
  for(const delta of [-.124,-.006,.11])dial(r,-.824,y+delta,2.31,.042);
  r.box(-.917,y-.21,2.39,-.802,y+.21,2.401,black);
  const inside=side*.659;
  r.box(-.753,inside-.028,1.989,-.323,inside+.028,2.31,'#6c7570');
  for(let j=0;j<3;j++)for(let k=0;k<6;k++){
    const x=-.708+k*.064,z=2.041+j*.099;
    r.rod([x,inside-side*.033,z],[x+.009,inside-side*.054,z+.012],.0055,linen,6);
  }
}
// This upper-left roof bay is shared by the pane and the surrounding metal.
export const roofUV=(u,v)=>{
  const width=.84+.03*u, shoulder=2.94+.03*u, crown=3.03+.09*u;
  return [-.58+.60*u,-width*(.65-.29*v),shoulder+(crown-shoulder)*v];
};
export function overheadPane(r) {
  const pane=[[.12,.14],[.7,.14],[.7,.88],[.12,.88]].map(([u,v])=>roofUV(u,v));
  glazingFace(r,pane,'#7697a3',.43);loops(r,pane,.012,'#69766e');
}
export function dockingRim(r) {
  section(r,.12,0,[[3.023,.220],[3.192,.220],[3.192,.181],[3.023,.181]],steel,{steps:32});
}
const interiorParts=[
  part('lining','Forward bulkhead and port cabin lining','The triangular windows sit above the instrument sill. Follow the surviving strip of ceiling aft to the transfer tunnel and down to the stowage rack.',[-.10,-.47,.33],liner),
  part('floor','Standing floor and midstep','Both astronauts stood on the low forward floor. The raised step behind them led to the equipment area.',[0,0,-.41],interiorFloor),
  part('commander','Commander’s station','David Scott stood at the left window. The restraints held him against the floor as he reached his hand controls.',[-.21,-.46,.02],r=>station(r,-1)),
  part('pilot','Lunar module pilot’s station','James Irwin stood at the right window. Each astronaut had a forward view and room to work in a pressure suit.',[-.21,.46,.02],r=>station(r,1)),
  part('left-panel','Commander’s displays','Round instruments and guarded switches occupied the front and side panels within reach of the commander.',[-.41,-.44,.25],r=>panel(r,-1)),
  part('right-panel','Pilot’s displays','The pilot’s station had its own displays and a bank of side-mounted controls.',[-.41,.44,.25],r=>panel(r,1)),
  part('dsky','Computer display and keyboard','The DSKY sat below the center instrument panels, where either astronaut could read it. Open it to inspect the register display and keyboard.',[-.43,0,.31],r=>{
    const transform=(depth,y,z)=>[-.811+.22*depth,.22*y,2.491+.22*z];
    for(const tag of ['case','lights','registers','keys'])dskyFace(r,tag,transform,1);
  }),
  part('telescope','Alignment optical telescope','The eyepiece projected into the cabin between the two crew positions. Astronauts could sight stars through the optical system.',[0,0,.49],r=>{
    r.rod([-.467,0,2.735],[-.411,0,2.966],.031,steel,14);
    r.rod([-.467,0,2.735],[-.375,0,2.667],.027,black,12);
    r.box(-.525,-.055,2.86,-.40,.055,2.905,gray);
  }),
  part('stowage','Soft stowage and restraints','Closeout photographs show cloth compartments, helmet bags and tethers around the crew area. Stowage changed between launch, checkout and surface work.',[.46,.22,.10],r=>{
    for(const side of [-1,1])for(const [x,z] of [[.189,2.097],[.371,2.265]]){
      pouch(r,x,side*.44,z);
    }
  }),
  part('screens','Forward window frames','A downward-canted triangular opening at each standing station gave the crew a view of terrain close to the lander.',[-.14,0,.54],r=>{
    for(const side of [-1,1]){
      const pts=windowPoints(side).map(([x,y,z])=>[x+.044,y,z-.01]);
      loops(r,pts,.013,'#949e94');
    }
  }),
  part('ecs','Suit-circuit equipment','Behind the lunar module pilot, the suit-circuit package housed the round carbon dioxide absorbers. Open the rack to trace the fans, cooling loop and oxygen return.',[.33,.45,.10],lmAirRack),
  part('forward-hatch','Forward hatch, cabin face','The square hatch beneath the central instrument panels swung into the cabin. Beyond the opening lay the porch and ladder.',[-.46,0,-.14],r=>{
    r.box(-.985,-.213,1.859,-.974,.213,2.348,'#afb1a2');
    loops(r,[[-.973,-.213,1.86],[-.973,.213,1.86],[-.973,.213,2.35],[-.973,-.213,2.35]],.012,'#7b8579');
    r.rod([-.961,.082,2.113],[-.951,.149,2.177],.012,gray,8);
  }),
  part('docking','Overhead transfer hatch','When the vehicles were docked, the open overhead hatch connected Falcon to the command module through a short tunnel.',[.13,0,.73],r=>{
    section(r,.12,0,[[2.886,.174],[2.971,.174],[2.971,.143],[2.886,.143]],steel,{steps:26});
    section(r,.12,0,[[2.888,.139],[2.904,.139]],linen,{caps:true,steps:26});
    r.rod([.08,-.08,2.879],[.156,.066,2.879],.013,black,8);
  }),
];
export const lmInterior={
  ...group('interior','Crew compartment cutaway','Look forward from the rear of Falcon. Scott stood on the left, Irwin on the right. Their shared display and keyboard sat above the square forward hatch.',interiorParts),
  internal:true,view:'rear',source:lmHandbook,
};
