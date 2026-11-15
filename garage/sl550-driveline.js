// Mercedes R231 parts plates 23–29 (propeller shaft) and 1–16 (exhaust).
// Routing is fitted to the car's assembled hard points; pipe bends and can shapes are approximate.
import {barrel,pipe,tint} from './road-primitives.js';
import {part,study,sleeve,turn,TAU,x} from './mechanism-shapes.js';

const metal='#899295',rubber='#393b3a',bronze='#948578',shaftColor='#787976';
const sides=[-1,1];
const discCenters=[[-.186,.395],[1.060,.376]];
function coupling(r,index,t=0){
  const [xx,zz]=discCenters[index];
  const ctr=[xx,0,zz];
  sleeve(r,ctr,x,-.016,.016,.057,.027,rubber,18);
  for(let i=0;i<6;i++){
    const angle=TAU*(i/6+t);
    const cy=.043*Math.cos(angle),cz=zz+.043*Math.sin(angle);
    barrel(r,[xx-.017,cy,cz],[xx+.017,cy,cz],.009,'#aaa593',8);
    const dir=i%2===0?1:-1;
    barrel(r,[xx+dir*.017,cy,cz],[xx+dir*.020,cy,cz],.008,'#b3b6b3',6);
  }
}
function frontShaft(r,t=0){
  barrel(r,[-.172,0,.395],[.466,0,.395],.032,shaftColor,12);
  for (const xx of [-.152,.401])sleeve(r,[xx,0,.395],x,-.003,.003,.034,.031,'#89908e',12);
  // Three ears link alternating sleeves in the six-position flex disc to the tube.
  flange(r,-.163,.395,t);
}
function flange(r,xx,zz,t){
  for(let j=0;j<3;j++){
    const a=TAU*(j/3+t);
    r.rod([xx,0,zz],[xx,.043*Math.cos(a),zz+.043*Math.sin(a)],.010,'#626b6e',6);
  }
}
function rearShaft(r,t=0){
  barrel(r,[.457,0,.395],[.522,0,.395],.022,metal,10);
  barrel(r,[.516,0,.395],[1.047,0,.376],.029,shaftColor,12);
  for(let i=0;i<4;i++)sleeve(r,[.522+i*.010,0,.395],x,-.003,.003,.034,.029,rubber,11);
  flange(r,1.039,.377,t);
}
function centerSupport(r){
  const center=[.473,0,.395];
  sleeve(r,center,x,-.012,.012,.037,.023,metal,14);
  sleeve(r,center,x,-.014,.014,.050,.037,rubber,16);
  sleeve(r,center,x,-.013,.013,.055,.050,'#798284',16);
  // The stamped carrier cradles the isolator and terminates in two mounting feet.
  for(const side of sides){
    const path=[[.473,side*.044,.366],[.473,side*.061,.371],[.473,side*.075,.411],[.473,side*.090,.414]];
    pipe(r,path,.006,metal,7);
    r.box(.453,side*.094-.014,.409,.492,side*.094+.014,.418,metal);
    barrel(r,[.473,side*.097,.405],[.473,side*.097,.409],.007,'#52585a',6);
  }
}
const rotatingShaft=[
  part('front','Front propeller shaft','The front tube takes drive from the gearbox flange to the center bearing.',[-.11,.03,.065],frontShaft),
  part('rear','Rear propeller shaft','The rear tube slopes down to meet the differential input. A short sleeve joins the two shaft sections.',[.11,.03,.065],rearShaft),
  part('gear-disc','Transmission flexible disc','Steel sleeves carry the bolts through the rubber coupling at the transmission.',[-.12,-.075,0],(r,t)=>coupling(r,0,t)),
  part('axle-disc','Differential flexible disc','The rear coupling connects the second shaft to the differential input flange.',[.12,-.075,0],(r,t)=>coupling(r,1,t)),
  part('bearing','Center support and isolator','An annular bearing surrounds the center journal. The rubber isolator and its two mounting feet stay fixed to the tunnel.',[0,-.11,-.07],centerSupport)
];
export function drawSLPropeller(r){for(const p of rotatingShaft)p.draw(r,0);}
export function slShaftStudy(ref){
  return study('sl-shaft','Two-piece propeller shaft','Follow the two shaft sections between the flexible discs. Each end transmits torque while the center bearing supports the rotating journal.',ref,rotatingShaft,'Watch the two disc bolt patterns turn together. The center bearing carrier stays fixed.');
}

function pressedShell(r,stations,color){
  const N=12;
  const rings=stations.map(([xx,yy,zz,wide,high])=>Array.from({length:N},(_,i)=>{
    const a=TAU*i/N;
    // Flattened faces and pressed shoulders on the outer stampings.
    return [xx,yy+wide*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.72,zz+high*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.72];
  }));
  for(let k=1;k<rings.length;k++)for(let i=0;i<N;i++){
    const j=(i+1)%N;
    r.polygon([rings[k-1][i],rings[k-1][j],rings[k][j],rings[k][i]],tint(color,.88+.14*Math.sin(TAU*(i+.5)/N)),false);
  }
  r.polygon(rings[0],color,false);r.polygon(rings.at(-1),color,false);
}
function frontPipes(r){
  for(const s of sides)pipe(r,[[-1.092,s*.375,.505],[-1.004,s*.385,.456],[-.935,s*.369,.374]],.033,bronze,10);
}
function converters(r){
  for(const s of sides){
    turn(r,[-.906,s*.36,.355],[.73,-s*.24,-.47],[[-.036,.033],[.008,.061],[.030,.068],[.153,.068],[.18,.059],[.211,.032]],bronze,{n:12});
    pipe(r,[[-.736,s*.306,.245],[-.522,s*.229,.229],[-.26,s*.144,.215],[.17,s*.080,.195]],.029,metal,10);
  }
}
function frontMuffler(r){
  for(const s of sides){
    pipe(r,[[.169,s*.080,.195],[.272,s*.085,.184],[.341,s*.146,.180]],.031,metal,10);
    pressedShell(r,[[.315,s*.144,.181,.061,.040],[.352,s*.161,.179,.104,.057],[.535,s*.190,.181,.103,.057],[.582,s*.204,.184,.062,.041]],metal);
    // Narrow formed bands run around each half of the paired silencer.
    for(const xx of [.392,.455,.496]){
      const yy=s*(.161+(xx-.352)*.159);
      pressedShell(r,[[xx,yy,.180,.104,.058],[xx+.005,yy,.180,.104,.058]],'#7f898a');
    }
  }
  // The two inlet branches share the short bridge shown on Mercedes callout 7.
  barrel(r,[.279,-.083,.184],[.279,.083,.184],.024,metal,9);
}
function rearMuffler(r,s){
  pipe(r,[[.573,s*.204,.184],[.704,s*.250,.203],[.882,s*.336,.26],[1.21,s*.383,.29],[1.516,s*.421,.303]],.030,metal,10);
  pressedShell(r,[[1.49,s*.455,.302,.095,.074],[1.55,s*.462,.303,.156,.089],[1.89,s*.465,.303,.153,.089],[1.958,s*.470,.305,.113,.076]],'#7d8688');
  for(const xx of [1.60,1.64,1.84])pressedShell(r,[[xx,s*.463,.303,.158,.090],[xx+.007,s*.463,.303,.158,.090]],metal);
  pipe(r,[[1.95,s*.52,.301],[2.035,s*.574,.326],[2.13,s*.657,.350]],.034,metal,10);
}
function hangers(r){
  for(const s of sides)for(const [xx,yy,zz] of [[.536,.265,.193],[1.593,.608,.343],[1.898,.595,.347]]){
    pipe(r,[[xx,s*yy,zz],[xx+.012,s*(yy+.017),zz+.019],[xx+.023,s*(yy+.029),zz+.025]],.006,metal,7);
    sleeve(r,[xx+.021,s*(yy+.03),zz+.033],x,-.008,.008,.018,.007,rubber,10);
  }
}
const exhaustParts=[
  part('front','Turbo outlet pipes','One short pipe on each bank carries turbine discharge into its converter.',[-.12,0,.065],frontPipes),
  part('cats','Catalytic converters and pipes','The converter pair sits ahead of the tunnel. The downstream pipe on each side meets one inlet on the front muffler.',[-.07,0,-.09],converters),
  part('middle','Paired front muffler','Two pressed chambers and their connecting pipes are supplied as a single front muffler assembly.',[0,0,-.13],frontMuffler),
  part('left','Left rear muffler and pipe','The left branch curves outward around the rear axle to its own silencer and tailpipe.',[.08,-.13,-.035],r=>rearMuffler(r,-1)),
  part('right','Right rear muffler and pipe','The right rear silencer has a separate inlet pipe, mounts and tailpipe.',[.08,.13,-.035],r=>rearMuffler(r,1)),
  part('hangers','Hanger rods and rubber supports','Rubber supports at the front and rear silencer mounts allow the exhaust to move relative to the body.',[0,.08,.09],hangers)
];
export function drawSLExhaust(r){for(const p of exhaustParts)p.draw(r);}
export function slExhaustStudy(ref){return study('sl-exhaust','Complete dual exhaust','Trace the two turbo outlet pipes through the catalytic converters, paired front muffler and separate rear silencers.',ref,exhaustParts);}

// Callouts 10 and 11 show the ribbed carrier and its detachable, angled rear cover.
export function drawSLFinal(r){
  const z=.356;
  const sections=[[1.078,.05,.05,.376],[1.13,.061,.069,.37],[1.20,.101,.095,.36],[1.27,.128,.114,z],[1.362,.125,.105,z]];
  pressedShell(r,sections.map(([xx,w,h,zz])=>[xx,0,zz,w,h]),'#757d7e');
  barrel(r,[1.2925,-.146,.35],[1.2925,.146,.35],.062,'#8d9595',14);
  for(const side of sides){
    for(let j=0;j<3;j++){
      const h=.307+j*.048;
      r.rod([1.14,side*.048,.347+j*.021],[1.31,side*(j===1?.126:.113),h],.006,'#8d9390',6);
    }
    barrel(r,[1.242,side*.094,.421],[1.242,side*.149,.421],.028,'#757d7e',10);
  }
  // The pinion flange shares the same axis as the rear flexible disc.
  sleeve(r,[1.081,0,.376],x,-.004,.014,.052,.022,'#777f7f',14);
  drawFinalCover(r,1.360,0,z);
}
export function drawFinalCover(r,xx,yy,zz){
  const outline=[[-.107,.074],[-.048,.106],[.055,.102],[.112,.067],[.125,-.026],[.078,-.090],[-.055,-.104],[-.118,-.061]];
  const boss=(side,height,depth)=>[xx+depth+.060*height,yy+side,zz+height];
  const face=outline.map(([a,b])=>boss(a,b,.013)),back=outline.map(([a,b])=>boss(a,b,.00));
  r.polygon(face,'#8a9190',false);r.polygon(back,'#717878',false);
  for(let i=0;i<outline.length;i++){
    const j=(i+1)%outline.length;
    r.polygon([back[i],back[j],face[j],face[i]],'#666e70',false);
    const [a,b]=outline[i];barrel(r,boss(.93*a,.93*b,.014),boss(.93*a,.93*b,.018),.006,'#afaf9e',6);
  }
  for(const u of [-.072,-.038,0,.038,.072])r.rod(boss(u,-.064,.014),boss(u,.066,.014),.003,'#a4aaa5',5);
}
export function drawSLStartStopPump(r,origin){
  const at=(xx,yy,zz)=>[origin[0]+xx,origin[1]+yy,origin[2]+zz];
  const c=at(0,0,0);
  turn(r,c,x,[[-.046,.021],[-.037,.031],[.015,.031],[.024,.023],[.031,.018]],'#676e6e',{n:13});
  barrel(r,at(.027,0,0),at(.045,0,0),.018,'#8f9998',10);
  r.box(...at(-.024,-.040,-.012),...at(-.007,-.025,.012),'#434b4c');
}
