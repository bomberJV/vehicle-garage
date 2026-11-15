import {TAU,shellWhite,metal,tone,radial,section,bell,cylinders,loops,part,group,exhibit} from './space-shapes.js';

import {lmInterior,lmHandbook,lmPhotos,windowPoints,roofUV,overheadPane,dockingRim} from './lm-cabin.js';
import {glazingFace} from './surface-materials.js';

const gold='#c39145',foil='#e4b35d',steel='#a3abae',brass='#b19b60',black='#393937';
const quarter=[0,1,2,3].map(i=>i*TAU/4);
function goldStage(r) {
  const corners=Array.from({length:8},(_,i)=>radial(0,0,0,1.21,(i+.5)*TAU/8));
  for(let i=0;i<corners.length;i++){
    const a=corners[i],b=corners[(i+1)%8],mid=[(a[0]+b[0])*.513,(a[1]+b[1])*.513,1.22];
    const points=[[a[0],a[1],.68],[b[0],b[1],.68],[b[0],b[1],1.69],[a[0],a[1],1.69]];
    for(let j=0;j<4;j++)r.polygon([points[j],points[(j+1)%4],mid],tone(i%3?gold:foil,[.96,1.08,.9,1.15][j]),false);
  }
  for(const z of [.68,1.69])r.polygon(corners.map(p=>[p[0],p[1],z]),'#aea18a',false);
}
function cabin(r) {
  // A wide forward pressure cabin meets a narrower equipment section at the rear.
  const stations=[
    [-.99,.54,1.80,2.62,2.81],[-.58,.84,1.70,2.94,3.03],
    [.02,.87,1.70,2.97,3.12],[.46,.64,1.83,2.91,3.02],[.86,.49,1.84,2.78,2.85]
  ];
  const rings=stations.map(([x,w,bottom,shoulder,top])=>[[x,-w*.72,bottom],[x,-w,bottom+.19],[x,-w,shoulder-.17],[x,-w*.65,shoulder],[x,-w*.36,top],[x,w*.36,top],[x,w*.65,shoulder],[x,w,shoulder-.17],[x,w,bottom+.19],[x,w*.72,bottom]]);
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<rings[i].length;j++){
    if(i===1&&j===3){
      for(const [u0,u1,v0,v1] of [[0,.12,0,1],[.70,1,0,1],[.12,.70,0,.14],[.12,.70,.88,1]]){
        r.polygon([roofUV(u0,v0),roofUV(u1,v0),roofUV(u1,v1),roofUV(u0,v1)],'#a9ada2',false);
      }
      continue;
    }
    if((i===1||i===2)&&j===4)continue;
    const k=(j+1)%rings[i].length;
    r.polygon([rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j]],tone(i>1?'#616365':'#9a9d95',[.82,.95,.83,1.10,1.17,1.02,.9,.96,.82,.77][j]),false);
  }
  // Cut the round docking opening into the two crown panels under the collar.
  const cx=.12,radius=.185;
  const xs=[-.58,.02,.46,...Array.from({length:21},(_,i)=>cx+radius*Math.cos(i*Math.PI/20))].sort((a,b)=>a-b);
  const topEdge=(x,right,inside)=>{
    const i=x<.02?1:2, [x0,w0,,,z0]=stations[i], [x1,w1,,,z1]=stations[i+1];
    const t=(x-x0)/(x1-x0),y=inside?Math.sqrt(Math.max(0,radius**2-(x-cx)**2)):(w0+(w1-w0)*t)*.36;
    return [x,right*y,z0+(z1-z0)*t];
  };
  for(let i=0;i<xs.length-1;i++)for(const side of [-1,1]){
    const x=xs[i],nx=xs[i+1];
    r.polygon([topEdge(x,side,false),topEdge(nx,side,false),topEdge(nx,side,true),topEdge(x,side,true)],x<.02?'#a9b0a6':'#858b88',false);
  }
  // Tile the face around the three forward openings; removing a pane or the
  // square hatch exposes the crew compartment rather than another solid face.
  for(const side of [-1,1]){
    const front=(points)=>r.polygon(points.map(([y,z])=>[-.99,side*y,z]),'#a3a69c',false);
    const a=[.43,2.41],b=[.444,2.611],c=[.106,2.661];
    const bottom=[0,1.80],chin=[.39,1.80],edge=[.54,1.99],high=[.54,2.45],corner=[.351,2.62],top=[.194,2.81];
    front([bottom,chin,[.418,1.85],[0,1.85]]);
    front([[.238,1.85],[.418,1.85],edge,high,a,[.238,2.39]]);
    front([[0,2.39],[.238,2.39],a,c,[0,2.661]]);
    front([a,high,b]);front([b,high,corner]);front([b,corner,top,c]);front([[0,2.661],c,top,[0,2.81]]);
  }
  r.polygon(rings.at(-1),'#4c5050',false);
}
const legNames=['Aft landing leg','Right landing leg','Forward leg and ladder','Left landing leg'];
// In the viewer’s rear camera, +Y projects to screen left. The handbook
// station coordinates use port-negative, so convert both geometry and motion.
function landerExhibit(fields,assemblies){
  const viewPoint=([x,y,z])=>[x,-y,z];
  return exhibit(fields,assemblies.map(g=>({...g,parts:g.parts.map(p=>({...p,
    offset:viewPoint(p.offset),draw(r,phase){
      const proxy=Object.create(r);
      proxy.polygon=(points,color,stroke)=>r.polygon(points.map(viewPoint),color,stroke);
      p.draw(proxy,phase);
    }
  }))})));
}
export const apolloLander=landerExhibit({
  id:'apollo-falcon',name:'Apollo 15 lunar module Falcon',short:'Lunar module Falcon',year:1971,domain:'Air',type:'Space',
  detail:'Falcon brought the folded rover down to Hadley–Apennine. Scott and Irwin climbed down the forward leg, then lowered the rover from a bay in the descent stage.',
  sources:[lmHandbook,lmPhotos],
  source:{label:'NASA · Apollo 15 press kit, lunar module and rover',url:'https://www.nasa.gov/wp-content/uploads/static/apollo50th/pdf/A15_PressKit.pdf'},
  specs:[['Spacecraft','Falcon · LM-10'],['Landing','July 30, 1971'],['Site','Hadley–Apennine'],['Rover stowage','Descent stage · quadrant I']]
},[
  group('base','Descent stage','The gold insulation covers an octagonal lower stage. Four widely spaced feet supported the lander.',[
    part('shell','Insulated descent stage','Faceted blankets wrap the equipment bays of the lower stage.',[0,0,.10],goldStage),
    part('bay','Rover stowage bay','The rover traveled folded against the descent stage. Its bay is marked here with a distinct foil cover.',[0,.50,.04],r=>{
      const a=TAU*3/8,b=a+.355,c=a-.355;
      const p=(angle,z)=>radial(0,0,z,1.155/Math.cos(angle-a),angle);
      const points=[p(b,.8),p(c,.8),p(c,1.55),p(b,1.55)];
      r.polygon(points,'#aa814b',false);loops(r,points,.024,'#c5bc93');
      r.rod(points[0],points[2],.010,'#c9af7c',6);
    }),
    part('bell','Descent nozzle','The broad bell is visible beneath the center of the gold stage.',[0,0,-.36],r=>bell(r,0,0,.27,.37,.45,26))
  ]),
  group('legs','Landing gear','Each footpad, strut and brace stays together when the landing gear is expanded.',quarter.map((a,i)=>
    part('leg'+(i+1),legNames[i],i===2?'The ladder runs down this forward strut from the crew porch to the footpad.':'The circular footpad connects to the descent stage by a main strut and paired diagonal braces.',[.55*Math.cos(a),.55*Math.sin(a),-.12],r=>{
      const p=(rr,side,z)=>[rr*Math.cos(a)-side*Math.sin(a),rr*Math.sin(a)+side*Math.cos(a),z];
      const [x,y]=p(2.02,0,0);
      section(r,x,y,[[.04,.17],[.055,.247],[.11,.25],[.12,.173],[.14,.095]],foil,{steps:26,caps:true});
      r.rod(p(2.02,0,.13),p(.94,0,1.61),.061,'#cfc7a6',10);
      r.rod(p(1.92,0,.26),p(1.68,0,.61),.074,gold,12);
      for(const sign of [-1,1]){
        r.rod(p(1.78,0,.46),p(1.01,sign*.53,1.13),.036,brass,8);
        r.rod(p(1.77,0,.48),p(.98,sign*.49,.79),.028,steel,8);
      }
      if(i===2){
        for(const sign of [-1,1])r.rod(p(1.97,sign*.14,.29),p(1.03,sign*.14,1.57),.016,steel,7);
        for(let n=0;n<9;n++){const t=n/8,rr=1.96-.91*t,z=.31+1.23*t;r.rod(p(rr,-.14,z),p(rr,.14,z),.015,'#c3c9c7',7);}
      }
    })
  )),
  group('cabin','Ascent stage','The asymmetric gray upper stage carried the crew back to lunar orbit.',[
    part('shell','Ascent cabin and equipment bay','A broad forward cabin narrows into the darker equipment bay at the rear.',[0,0,.39],r=>{
      cabin(r);dockingRim(r);
      for(const side of [-1,1]){
        r.box(-.15,side*.91-.08,2.12,.26,side*.91+.08,2.43,'#858b87');
        r.box(.10,side*.86-.09,2.72,.35,side*.86+.09,2.88,'#9c9d98');
      }
    }),
    part('windows','Forward and overhead windows','Two triangular windows flank the forward hatch. The small upper docking window sits above Scott’s left-hand station.',[-.34,0,.31],r=>{
      for(const side of [-1,1]){
        const pts=windowPoints(side);
        glazingFace(r,pts,'#5e8594',.42);loops(r,pts,.014,'#46534f');
      }
      overheadPane(r);
    }),
    part('hatch','Forward hatch and porch','The square hatch opens above a narrow platform aligned with the ladder.',[-.48,0,.05],r=>{
      r.box(-1.013,-.238,1.86,-.994,.238,2.39,'#797d77');
      loops(r,[[-1.017,-.24,1.86],[-1.017,.24,1.86],[-1.017,.24,2.4],[-1.017,-.24,2.4]],.018,steel);
      r.box(-1.36,-.235,1.65,-.94,.235,1.71,'#a3a596');
      for(const side of [-1,1])r.rod([-1.34,side*.23,1.7],[-.96,side*.26,1.89],.018,steel,6);
    }),
    part('aerial','Tracking antenna','A small dish stands above the cabin, offset from the docking collar.',[.38,-.22,.46],r=>{
      r.rod([-.07,-.48,2.98],[-.14,-.53,3.31],.019,steel,8);
      tiltedDish(r,[-.14,-.53,3.34],.21,'#bbb9a5',false);
    })
  ]),
  lmInterior,
]);

function tiltedDish(r,center,radius,color,mesh) {
  const [x,y,z]=center;
  const p=(t,rr)=>{const u=rr*Math.cos(t),v=rr*Math.sin(t),s=.31*rr*rr/radius;
    return [x+u*.58-s*.81,y+v,z+u*.81+s*.58];};
  const n=mesh?24:18;
  for(let i=0;i<n;i++) {
    const a=i*TAU/n,b=(i+1)*TAU/n;
    if(mesh){for(const k of [.28,.51,.74,1])r.rod(p(a,radius*k),p(b,radius*k),radius*.012,color,5);}
    else r.polygon([center,p(a,radius),p(b,radius)],tone(color,.81+.18*Math.cos(a)),false);
    if(i%(mesh?2:3)===0)r.rod(center,p(a,radius),radius*.014,color,5);
  }
  if(mesh)for(const a of [0,TAU/3,2*TAU/3])r.rod(p(a,radius),[x-radius*.51,y,z+radius*.37],radius*.014,color,5);
}
function roverWheel(r,x,side) {
  const y=side*1.18,z=.516,rad=.50,depth=.143;
  const tirePoint=(a,w,rr)=>[x+Math.cos(a)*rr,y+w,z+Math.sin(a)*rr];
  const n=32;
  for(const w of [-depth,0,depth])loops(r,Array.from({length:n},(_,i)=>tirePoint(i*TAU/n,w,rad*(w? .94:1))),.011,'#939b93');
  for(let i=0;i<n;i++){
    const a=i*TAU/n,b=(i+1)*TAU/n;
    for(const sign of [-1,1]){
      r.rod(tirePoint(a,sign*depth,rad*.94),tirePoint(b,0,rad),.009,'#b0b4a6',5);
      if(i%2===0){const k=.039; r.polygon([tirePoint(a,sign*depth*.89,rad*.956),tirePoint(a+k,sign*depth*.89,rad*.956),tirePoint(b+k,0,rad*1.016),tirePoint(b,0,rad*1.016)],'#a8a78d',false);}
    }
    if(i%2===0){
      r.rod(tirePoint(a,side*depth*.96,rad*.92),tirePoint(a-.21,side*depth,.15),.009,'#9fa29a',5);
      r.rod(tirePoint(a,-side*depth*.96,rad*.92),tirePoint(a+.21,-side*depth,.15),.009,'#9fa29a',5);
    }
  }
  r.tubeY(x,y-depth,y+depth,z,.15,steel,20);
  for(const sign of [-1,1])r.ringY(x,y+sign*depth,z,.149,.029,steel,20);
  const inner=side*(1.18-.19),outer=side*(1.18+.19);
  for(let i=0;i<10;i++){
    const a=.14*Math.PI+i*Math.PI*.72/10,b=.14*Math.PI+(i+1)*Math.PI*.72/10,p=(t,w)=>[x+.57*Math.cos(t),w,z+.57*Math.sin(t)];
    r.polygon([p(a,inner),p(a,outer),p(b,outer),p(b,inner)],tone('#b17d54',.9+.1*Math.sin(a)),false);
  }
}
const roverWheelCenters=[[-1.43,1],[-1.43,-1],[1.43,1],[1.43,-1]];
export const apolloRover=exhibit({
  id:'apollo-lrv',name:'Apollo 15 Lunar Roving Vehicle',short:'Lunar Roving Vehicle',year:1971,domain:'Land',type:'Rovers',
  detail:'The lunar rover folded small enough to fit on Falcon. Unfolded, it had two webbed seats, four wire-mesh wheels and a dish mounted up front.',
  source:{label:'NASA · The Apollo Lunar Roving Vehicle',url:'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html'},
  specs:[['Mission','Apollo 15 · LRV-1'],['Crew','Two side by side'],['Wheelbase','2.3 m'],['Frame length','3.1 m']]
},[
  group('frame','Frame and equipment','The rover has an open tubular chassis divided into hinged sections.',[
    part('chassis','Hinged frame and floor','A shallow floor spans the center section between the side rails.',[0,0,-.19],r=>{
      for(const side of [-1,1]){
        r.rod([-1.7,side*.75,.68],[1.67,side*.75,.68],.039,steel,8);
      }
      for(const x of [-1.44,-.65,.72,1.42])r.rod([x,-.75,.68],[x,.75,.68],.032,steel,8);
      r.box(-.78,-.72,.67,.86,.72,.71,'#c5c2b3');
      for(const x of [-.66,.70])r.box(x-.035,-.74,.71,x+.035,.74,.743,'#a29d84');
      for(const side of [-1,1])loops(r,[[-1.36,side*.26,.71],[-1.48,side*.27,.92],[-1.48,side*.59,.92],[-1.36,side*.59,.71]],.023,steel,false);
    }),
    part('front','Front equipment platform','Gold-toned blankets cover equipment boxes forward of the crew.',[-.4,0,.19],r=>{
      for(const side of [-1,1]){
        r.box(-1.57,side*.40-.23,.70,-1.06,side*.40+.23,.94,'#b79c62');
        r.box(-1.58,side*.40-.235,.94,-1.05,side*.40+.235,.975,'#cfb67a');
      }
    }),
    part('cargo','Rear sample rack','An open rack behind the seats carried sample bags and tools.',[.4,0,.24],r=>{
      for(const x of [.86,1.15,1.46,1.63])r.rod([x,-.73,.76],[x,.73,.76],.025,metal,6);
      for(const side of [-1,1])loops(r,[[.79,side*.74,.75],[.86,side*.74,1.03],[1.63,side*.74,1.03],[1.65,side*.74,.75]],.026,steel);
      r.box(1.01,-.56,.75,1.49,.01,.96,'#c4bfa8');
    })
  ]),
  group('wheels','Wheels and suspension','Wire mesh and bright chevron-shaped tread bands replace the familiar black rubber tire.',roverWheelCenters.map(([x,side],i)=>
    part('wheel'+(i+1),(x<0?'Front ':'Rear ')+(side<0?'left':'right')+' wheel','The mesh wheel, shallow fender and hub are shown together. Slender wishbones connect the wheel to the frame.',[x*.18,side*.5,.04],r=>{
      roverWheel(r,x,side);
      for(const z of [.43,.67])for(const sign of [-1,1])r.rod([x+sign*.27,side*.70,z+.023],[x,side*1.05,z],.029,'#9c9f97',7);
      r.rod([x-.19,side*.73,.77],[x,side*1.04,.49],.026,brass,7);
    })
  )),
  group('crew','Crew and communications','The two seats face the forward deck and antenna mast. The hand controller sits between them.',[
    ...[-1,1].map(s=>part(s<0?'left':'right',s<0?'Left seat':'Right seat','A tubular seat frame supports an open webbed back and a light-colored seat base.',[0,s*.38,.35],r=>{
      const y=s*.38;
      r.box(-.27,y-.26,.865,.44,y+.26,.90,'#c1baa0');
      for(const sign of [-1,1])loops(r,[[-.29,y+sign*.27,.72],[-.29,y+sign*.27,.89],[.44,y+sign*.27,.89],[.63,y+sign*.27,1.48]],.026,steel,false);
      r.rod([.63,y-.28,1.48],[.63,y+.28,1.48],.027,steel,8);
      for(let j=0;j<6;j++){const z0=.93+.089*j,xx=.45+(z0-.9)*.32;
        r.polygon([[xx,y-.25,z0],[xx,y+.25,z0],[xx+.019,y+.25,z0+.054],[xx+.019,y-.25,z0+.054]],'#b5ab85',false);}
      for(const yy of [-.18,0,.18])r.rod([.46,y+yy,.91],[.63,y+yy,1.46],.014,'#bbae8c',5);
    })),
    part('controls','Hand controller and display','The common hand controller stands between the seats with the instrument panel ahead of it.',[-.30,0,.38],r=>{
      r.box(-.65,-.20,.82,-.49,.20,1.12,'#a3a79e');
      r.box(-.487,-.17,.86,-.481,.17,1.09,'#575e5a');
      r.rod([-.16,0,.76],[-.16,0,1.12],.04,steel,8);
      r.rod([-.22,0,1.13],[-.11,0,1.13],.035,black,8);
    }),
    part('antenna','High-gain dish and mast','The open dish stands on the front deck. Its ribs remain visible against the sky.',[-.23,.25,.45],r=>{
      r.rod([-1.19,.10,.96],[-1.18,.10,2.10],.029,'#a8a28b',8);
      tiltedDish(r,[-1.18,.10,2.12],.53,'#c8b77c',true);
    }),
    part('camera','Television camera','The box-shaped TV camera sits on its own mount near the front of the rover.',[-.32,-.28,.22],r=>{
      r.rod([-1.39,-.44,.94],[-1.39,-.44,1.24],.036,steel,8);
      r.box(-1.51,-.54,1.23,-1.26,-.35,1.43,'#aaa89a');
      r.discX(-1.514,-.445,1.335,.067,'#3c4849',16);
    })
  ])
]);
