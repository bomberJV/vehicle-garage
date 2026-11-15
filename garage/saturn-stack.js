import {TAU,section,band,bell,fin,part,group,exhibit,tone} from './space-shapes.js';
import {paint,alloy,shadow,mission,iuReference,simReference,polar,lip,station,plate,panelBox} from './saturn-shapes.js';

const quarters=[0,1,2,3].map(i=>i*TAU/4);
const primaryRadius=.227;
const nearWhite='#dddcd0',metal='#a4aca9';
const stripe=a=>Math.floor(a/(TAU/8))%2===0?shadow:paint;
function fluting(r,lo,hi,r0,r1,count,pattern=()=>paint){
  for(let i=0;i<count;i++){
    const a=(i+.5)*TAU/count,delta=TAU*.26/count,rise=.0025,col=pattern(a);
    r.polygon([polar(a-delta,lo,r0),polar(a,lo,r0+rise),polar(a,hi,r1+rise),polar(a-delta,hi,r1)],tone(col,.88),false);
    r.polygon([polar(a,lo,r0+rise),polar(a+delta,lo,r0),polar(a+delta,hi,r1),polar(a,hi,r1+rise)],tone(col,.72),false);
  }
}
const letters={
  A:['010','101','111','101','101'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],
  I:['111','010','010','010','111'],N:['101','111','111','111','101'],S:['111','100','111','001','111'],
  T:['111','010','010','010','010'],U:['101','101','101','101','111']
};
function verticalLettering(r,a,radius,z,word,pixel,ink){
  let next=z;
  for(const letter of word){
    if(letter===' '){next-=pixel*2;continue;}
    const rows=letters[letter];rows.forEach((row,i)=>{
      for(const match of row.matchAll(/1+/g)){
        const j=match.index,start=a+(j-1.5)*pixel/radius,end=start+match[0].length*pixel/radius,h=next-i*pixel;
        r.polygon([polar(start,h,radius),polar(end,h,radius),polar(end,h-pixel,radius),polar(start,h-pixel,radius)],ink,false);
      }
    });next-=pixel*6.4;
  }
}
function flag(r,angle,z){
  const at=station(angle,primaryRadius+.0038,z),w=.082,h=.045;
  plate(r,at,0,0,w,h,'#ede9d9');
  for(let i=0;i<7;i++)plate(r,at,0,h*.46-i*h*2/13,w,h/13,'#9e504d',.00012);
  plate(r,at,-w*.25,h*.23,w*.49,h*.53,'#485b73',.00026);
}
function raisedTunnel(r,a,rr,z0,z1){
  const at=station(a,rr,z0);
  panelBox(r,at,0,(z1-z0)/2,.010,z1-z0,.005,'#aeb8b2');
  for(let j=1;j<=4;j++)plate(r,at,0,(z1-z0)*j/5,.012,.004,'#707874',.0055);
}
function cluster(r,z,height,radius,span,count){
  for(let j=0;j<count;j++){
    const a=(j-1)*Math.PI/2,xx=j?span*Math.cos(a):0,yy=j?span*Math.sin(a):0;
    bell(r,xx,yy,z,radius,height,24);
    for(const f of [.12,.28,.45,.61]){
      const rr=radius*(f<.50?1-.60*f:.70-(f-.50)*.78)+.0008;
      section(r,xx,yy,[[z+height*f,rr],[z+height*f+.002,rr]],'#a1aaa6',{steps:18});
    }
  }
}
function serviceSkin(r){
  const z0=4.22,z1=4.40,rr=.091,opening=[.94,1.91];
  section(r,0,0,[[z0,rr],[z1,rr]],alloy,{from:opening[1],to:opening[0]+TAU,steps:42});
  for(const z of [z0,z1])lip(r,z,rr,metal,.004);
  for(const a of [2.35,3.36,4.52,5.6,.31])for(let j=0;j<5;j++){
    const z=z0+.021+j*.025;section(r,0,0,[[z,.0914],[z+.020,.0914]],nearWhite,{from:a-.24,to:a+.24,steps:5});
  }
  for(const a of quarters) {
    const at=station(a+.25,rr,4.33);panelBox(r,at,0,0,.011,.012,.004,'#625c56');
  }
  // The service engine bell fitted inside the upper part of the adapter.
  bell(r,0,0,4.176,.030,.048,16);
}
export const saturn=exhibit({
  id:'saturn-v',name:'Saturn V · Apollo 15',short:'Saturn V',year:1971,domain:'Air',type:'Space',
  detail:'SA-510 left Kennedy Space Center on July 26, 1971. The lunar rover rode folded on Falcon inside the tapered adapter. Above it, Endeavour carried three astronauts and a bay of cameras for photographing the Moon from orbit.',
  source:{label:'NASA · Apollo 15 mission history',url:'https://www.nasa.gov/mission/apollo-15/'},
  sources:[mission,iuReference,simReference,{label:'National Museum of the U.S. Air Force · Endeavour photographs',url:'https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/197685/apollo-15-command-module/'}],
  specs:[['Flight vehicle','SA-510'],['Launch site','Kennedy Space Center · 39A'],['Launch stages','S-IC / S-II / S-IVB'],['Spacecraft','Endeavour · CSM-112 / Falcon · LM-10']]
},[
  group('first','S-IC first stage','Four fin fairings wrap around the engine end. Open the main shell to see the two tanks and the dry structural bay between them.',[
    part('barrel','S-IC shell and tank section','The bands across the ribbed skirts and the tall USA markings help distinguish the first stage. Open the shell for a long section through its two tanks.',[0,0,.10],r=>{
      section(r,0,0,[[.16,.218],[.23,primaryRadius],[.62,primaryRadius],[1.43,primaryRadius],[1.65,primaryRadius],[1.91,primaryRadius]],paint,{steps:64,pattern:(a,z)=>z<.62?stripe(a):paint});
      for(const [lo,hi,col] of [[.27,.55,stripe],[.94,1.045,()=>nearWhite],[1.795,1.907,()=>nearWhite]])fluting(r,lo,hi,.228,.228,80,col);
      for(const z of [.235,.62,.94,1.045,1.31,1.55,1.794,1.91])band(r,0,0,z,z+.004,.230,'#b6bcb7');
      for(const a of quarters){verticalLettering(r,a+.22,.2313,1.46,'USA',.0126,'#a54a48');flag(r,a+.22,1.71);}
      raisedTunnel(r,2.23,.23,.30,1.835);
    }),
    part('fairings','Four fin fairings','Each outboard bell sits below a tapered fairing. The exposed swept fin grows out of the fairing at its widest point.',[.38,.08,-.07],r=>{
      for(const a of quarters){
        const [x,y]=polar(a,0,.189);section(r,x,y,[[.12,.072],[.17,.077],[.23,.073],[.30,.061],[.38,.040],[.45,.005]],nearWhite,{steps:24,caps:true});
        fin(r,0,0,a,[[.238,.139],[.326,.122],[.331,.149],[.245,.357]],'#929896',.009);
        fin(r,0,0,a,[[.25,.164],[.311,.150],[.249,.306]],'#bbbeb8',.010);
      }
    }),
    part('bells','Five F-1 bell exteriors','Four outboard bells surround one central bell. Open the first-stage section to view their position below the aft skirt.',[0,0,-.47],r=>cluster(r,.012,.187,.066,.149,5))
  ]),
  group('upper','Upper stages and instrument unit','The wide S-II retains the first stage’s diameter. The conical interstage steps down to the S-IVB. A shallow, black instrument ring separates the third stage from the spacecraft.',[
    part('interstage','S-IC / S-II interstage','The striped collar surrounds the S-II engine cluster. Opening the collar shows its flanges and stringers.',[-.41,0,-.22],r=>{
      section(r,0,0,[[1.915,.227],[2.165,.227]],paint,{steps:64,pattern:stripe});fluting(r,1.927,2.154,.2275,.2275,88,stripe);
      for(const z of [1.916,2.16])lip(r,z,.229,metal,.004);
    }),
    part('second','S-II second stage','The long UNITED STATES marking follows the second-stage barrel. Open it to find the common bulkhead between the hydrogen and oxygen tanks.',[0,0,.23],r=>{
      section(r,0,0,[[2.166,.227],[2.988,.227]],paint,{steps:64});
      for(const [lo,hi] of [[2.168,2.272],[2.904,2.985]])fluting(r,lo,hi,.2276,.2276,84);
      for(const z of [2.167,2.271,2.474,2.692,2.904,2.986])band(r,0,0,z,z+.005,.229,'#c1c4bb');
      for(const a of quarters)verticalLettering(r,a+.22,.2305,2.847,'UNITED STATES',.0077,'#343c40');
      raisedTunnel(r,2.62,.23,2.196,2.971);
    }),
    part('second-bells','Five S-II engine bells','Five smaller bell mouths occupy the interstage directly below the S-II. Expand the assembly to see the cluster.',[.36,-.12,-.31],r=>cluster(r,2.024,.143,.053,.119,5)),
    part('shoulder','S-II / S-IVB interstage','This ribbed, conical section tapers to the smaller diameter of the S-IVB. It surrounds the third stage’s single bell.',[.39,0,.20],r=>{
      section(r,0,0,[[2.989,.227],[3.248,.151]],paint,{steps:64,pattern:stripe});fluting(r,2.994,3.244,.226,.152,88,stripe);
      lip(r,2.99,.228,alloy,.004);lip(r,3.248,.153,alloy,.003);
    }),
    part('third','S-IVB third stage','The third stage occupies the narrower barrel above the shoulder. Open it to inspect the two cut tanks and the one-bell aft section.',[0,0,.52],r=>{
      section(r,0,0,[[3.250,.151],[3.836,.151]],paint,{steps:48});
      for(const [lo,hi] of [[3.254,3.326],[3.731,3.833]])fluting(r,lo,hi,.1514,.1514,64);
      for(const z of [3.250,3.325,3.57,3.730])band(r,0,0,z,z+.003,.1526,metal);
      raisedTunnel(r,2.42,.1525,3.29,3.803);
    }),
    part('third-bell','Single S-IVB engine bell','One J-2 bell fits within the tapering shoulder below the narrower stage.',[-.32,.14,-.20],r=>cluster(r,3.088,.161,.069,0,1)),
    part('instrument','Instrument unit','Inside this low ring, equipment boxes lined the inner circumference. Its empty center is easiest to see in the dedicated cutaway.',[-.33,.18,.25],r=>{
      section(r,0,0,[[3.837,.151],[3.878,.151]],shadow,{steps:48});for(const z of [3.838,3.877])lip(r,z,.152,metal,.003);
      for(const a of quarters){const at=station(a+.24,.1516,3.858);plate(r,at,0,0,.018,.016,'#b8b9ad');}
    })
  ]),
  group('apollo','Apollo spacecraft','The service module sits between the adapter and the crew capsule. At launch a protective cover enclosed the command module. Select the capsule to open Endeavour’s crew compartment.',[
    part('adapter','Lunar module adapter','Four tapered panels surrounded Falcon. Open the adapter to see the shape of the enclosure.',[0,.49,-.18],r=>{
      section(r,0,0,[[3.879,.151],[3.947,.151],[4.219,.091]],paint,{steps:48});
      for(const a of quarters)r.rod(polar(a+.32,3.948,.1516),polar(a+.32,4.217,.0917),.0018,'#949e96',6);
      for(const z of [3.884,3.946])band(r,0,0,z,z+.003,.152,'#b5b9b0');
    }),
    part('service','Endeavour service module','Radiators and the covered science bay line the sides of the service module. The bell extends beneath its aft end.',[.34,.04,.12],serviceSkin),
    part('science','Scientific instrument bay cover','The curved cover closed the orbital science bay at launch. Open it to see the cameras and their film cassettes.',[-.13,.35,.04],r=>{
      section(r,0,0,[[4.22,.0913],[4.399,.0913]],metal,{from:.94,to:1.91,steps:12});
      for(const z of [4.239,4.382])section(r,0,0,[[z,.0916],[z+.004,.0916]],nearWhite,{from:.96,to:1.89,steps:10});
    }),
    part('csm','Endeavour command module','The launch cover gives the capsule its white appearance. Open the crew compartment to see the three cloth couches, instruments and stowage below.',[0,0,.35],r=>{
      section(r,0,0,[[4.40,.093],[4.407,.094],[4.458,.074],[4.515,.041],[4.539,.027]],nearWhite,{steps:40});
      lip(r,4.405,.0948,'#a8aaa0',.003);
      const hatch=station(1.36,.071,4.462);
      for(const u of [-.018,.018])r.rod(hatch(u,-.019,.011),hatch(u,.019,-.011),.0013,metal,6);
      for(const v of [-.019,.019])r.rod(hatch(-.018,v,-v*.58),hatch(.018,v,-v*.58),.0013,metal,6);
    }),
    part('tower','Launch escape tower','Four long legs and their diagonal bracing hold the narrow tower above the capsule.',[0,0,.68],r=>{
      for(const a of quarters){
        r.rod(polar(a,4.505,.051),polar(a,4.699,.026),.0037,nearWhite,6);
        for(const [za,ra,zb,rb] of [[4.53,.048,4.603,.037],[4.603,.037,4.682,.028]]){
          r.rod(polar(a,za,ra),polar(a+TAU/4,zb,rb),.0025,alloy,5);
          r.rod(polar(a,zb,rb),polar(a+TAU/4,zb,rb),.0025,nearWhite,5);
        }
      }
      section(r,0,0,[[4.69,.035],[4.839,.035],[4.882,.010],[4.934,.007],[4.958,0]],paint,{steps:20,caps:true});for(const z of [4.707,4.818])band(r,0,0,z,z+.004,.0358,metal);
    })
  ])
]);
