import {saturn} from './saturn-stack.js';
import {TAU,shellWhite,dark,metal,tone,radial,section,band,bell,fin,part,group,exhibit} from './space-shapes.js';
import {apolloLander,apolloRover} from './space-lunar.js';

import {dragonInterior,smallMarsStack} from './space-detail.js';
import {glazingFace} from './surface-materials.js';

const quarter=[0,1,2,3].map(i=>i*TAU/4);
const source=(label,url)=>({label,url});
const rad=(angle,z,d)=>radial(0,0,z,d,angle);
const natural='#d7d4c7', orange='#c58d62';
const upperFairing=(z0,z1,root,radius)=>{
  const z=t=>z0+t*(z1-z0);
  return [[z0,root],[z(.08),radius],[z(.66),radius],[z(.79),radius*.9],[z(.9),radius*.65],[z(.97),radius*.29],[z1,0]];
};
function fairingParts(z0,z1,root,radius,description){
  return [0,1].map(i=>part(i?'right':'left',i?'Right fairing shell':'Left fairing shell',description,[0,(i?-1:1)*.5,.25],r=>{
    const stations=upperFairing(z0,z1,root,radius),from=i*Math.PI+.002,to=(i+1)*Math.PI-.002;
    section(r,0,0,stations,shellWhite,{from,to,steps:22});
    section(r,0,0,stations.map(([z,h])=>[z,Math.max(0,h-.006)]),'#a99570',{from,to,steps:22});
    for(const a of [from,to])for(let j=1;j<stations.length;j++){
      const [zA,hA]=stations[j-1],[zB,hB]=stations[j];
      const points=[rad(a,zA,hA),rad(a,zA,Math.max(0,hA-.006)),rad(a,zB,Math.max(0,hB-.006)),rad(a,zB,hB)];
      r.polygon(hB===0?points.slice(0,3):points,'#a19576',false);
    }
  }));
}
const boosterAngles=[-.66,.66,Math.PI-.66,Math.PI+.66];
const atlas=exhibit({
  id:'atlas-v-541',name:'Atlas V 541 · Mars 2020',short:'Atlas V 541',year:2020,domain:'Air',type:'Space',
  detail:'Perseverance left Earth on this Atlas V. Look for four white boosters around a copper-colored core and a fairing wide enough to enclose the Centaur upper stage.',
  source:source('United Launch Alliance · Mars 2020 launch','https://www.ulalaunch.com/about/news/2020/07/30/united-launch-alliance-atlas-v-successfully-launches-mars-2020-mission-for-nasa'),
  specs:[['Launch','July 30, 2020'],['Spacecraft','Mars 2020 · Perseverance'],['Launch height','197 ft'],['Configuration','5 m fairing / four boosters / one Centaur engine']]
},[
  group('core','Atlas core','The single copper-colored core contrasts with the white strap-on boosters.',[
    part('barrel','Common Core Booster','The long barrel has circumferential joints and a raised longitudinal equipment cover.',[0,0,.12],r=>{
      section(r,0,0,[[.16,.147],[.28,.157],[2.67,.157]],orange,{caps:true});
      for(const z of [.34,.58,1.21,1.86,2.45,2.61])band(r,0,0,z,z+.013,.158,'#b3815c');
      r.box(-.164,-.017,.33,-.152,.017,2.61,'#b29077');
    }),
    part('base','Twin nozzle openings','Two adjacent openings are visible below the dark aft skirt.',[0,0,-.32],r=>{
      section(r,0,0,[[.14,.148],[.29,.156]],'#655d52',{caps:true});
      for(const x of [-.069,.069])bell(r,x,0,.01,.071,.17);
    })
  ]),
  group('boosters','Four strap-on boosters','Four individual cylindrical boosters flank the lower core. Each cone and nozzle moves with its own casing.',boosterAngles.map((a,i)=>{
    const [x,y]=rad(a,0,.224);
    return part('booster'+(i+1),'Strap-on booster '+(i+1),'One of the four narrow white AJ-60A boosters used on the Mars 2020 flight.',[Math.cos(a)*.48,Math.sin(a)*.48,0],r=>{
      section(r,x,y,[[.26,.062],[.36,.066],[1.85,.066],[1.93,.059],[2.045,.004]],shellWhite,{caps:true,steps:20});
      for(const z of [.38,.77,1.35,1.76])band(r,x,y,z,z+.012,.067,'#b0afa5');
      bell(r,x,y,.16,.040,.11,14);
    });
  })),
  group('upper','Centaur and fairing','The fairing surrounds both the spacecraft and the upper stage. Separate the shells to see Centaur.',[
    part('adapter','White flared adapter','A flared white transition steps outward above the core.',[0,.43,-.12],r=>{
      section(r,0,0,[[2.67,.157],[2.78,.157],[2.98,.217],[3.06,.217]],natural,{caps:true});
      band(r,0,0,2.74,2.765,.158,'#7b817c');
    }),
    part('centaur','Centaur upper stage','The single-engine Centaur sits inside the broad mission fairing.',[.48,0,.12],r=>{
      bell(r,0,0,2.95,.065,.17);
      section(r,0,0,[[3.12,.08],[3.18,.117],[3.71,.117],[3.83,.064]],'#d5c38e',{caps:true});
      for(const z of [3.19,3.69])band(r,0,0,z,z+.022,.119,metal);
    }),
    part('payload','Mars 2020 spacecraft','Above Centaur, the cruise stage and aeroshell enclosed the Perseverance rover and its descent stage. Open the spacecraft to separate all five layers.',[0,0,.58],smallMarsStack),
    part('air','Payload air-conditioning inlet','Clean air enters the upper curved section of the fairing while the rocket is on the ground.',[.33,-.10,.29],r=>r.rod([.192,0,4.48],[.209,0,4.48],.020,metal,16)),
    ...fairingParts(3.06,4.94,.217,.221,'One half of the Mars 2020 payload fairing. The shells come apart along a longitudinal seam.')
  ])
]);

const falconRadius=.132;
function merlinCluster(r,x) {
  bell(r,x,0,.012,.026,.095,14);
  for(let i=0;i<8;i++){const [xx,yy]=radial(x,0,0,.083,i*TAU/8);bell(r,xx,yy,.011,.025,.096,14);}
}
function foldedLegs(r,x) {
  for(const a of quarter){
    fin(r,x,0,a,[[.129,.10],[.159,.15],[.158,.46],[.139,.96],[.131,1.06]],'#292d31',.039);
    for(const sign of [-1,1])r.rod(radial(x,0,.18,.15,a+sign*.10),radial(x,0,.97,.137,a+sign*.025),.003,'#65686a',5);
  }
}
function foldedFins(r,x,z) {
  for(const a of quarter){
    const loc=(side,dz)=>{const p=radial(x,0,z+dz,.143,a);return [p[0]-Math.sin(a)*side,p[1]+Math.cos(a)*side,p[2]];};
    for(const dz of [-.090,-.066,-.042,-.018,.007,.032,.058,.082])r.rod(loc(-.042,dz),loc(.042,dz),.0026,'#7f8280',5);
    for(const side of [-.042,-.021,0,.021,.042])r.rod(loc(side,-.09),loc(side,.082),.003,'#626764',5);
    r.rod(loc(-.042,.082),loc(.042,.082),.0046,'#a2a39d',6);
  }
}
function falconCore(groupId,x,isSide) {
  const shift=isSide?Math.sign(x)*.45:0;
  return group(groupId,isSide?(x<0?'Left side booster':'Right side booster'):'Center core',isSide?'A reusable side booster with a tapered cap, four folded landing legs and four stowed grid fins.':'The lower white barrel carries a black equipment cover down one side.',[
    part('shell','Booster barrel',isSide?'This white cylinder is one of the two side cores.':'The first-stage shell ends below the black upper section.',[shift,0,.04],r=>{
      section(r,x,0,[[.09,.128],[.16,falconRadius],[2.95,falconRadius]],shellWhite,{caps:true});
      band(r,x,0,.095,.20,.133,dark);
      for(const z of [.38,1.25,1.89,2.65])band(r,x,0,z,z+.009,.133,'#c2c4bd');
      r.box(x-.013,.129,.21,x+.013,.137,2.96,'#3d4041');
    }),
    part('bells','Nine nozzle bells','Eight nozzles form a ring around the center bell.',[shift,0,-.42],r=>merlinCluster(r,x)),
    part('legs','Landing legs, folded','The four long dark landing legs lie against the barrel in this launch configuration.',[shift+.26,.32,0],r=>foldedLegs(r,x)),
    part('fins','Four grid fins, stowed','The four lattice panels sit just below the cap or interstage.',[shift-.25,-.29,.28],r=>foldedFins(r,x,2.85)),
    part(isSide?'cap':'interstage',isSide?'Booster nose cone':'Composite interstage',isSide?'The tapered top distinguishes the side booster from the center core.':'The black collar joins the two stages.',[shift,0,.56],r=>{
      const stations=isSide?[[2.95,falconRadius],[3.02,.131],[3.13,.114],[3.23,.070],[3.33,0]]:[[2.95,falconRadius],[3.25,falconRadius]];
      section(r,x,0,stations,isSide?shellWhite:dark,{caps:true});band(r,x,0,2.95,2.988,.133,dark);
    })
  ]);
}
function makeFalcon(heavy) {
  const groups=[falconCore('core',0,false)];
  if(heavy)groups.push(falconCore('port',-.285,true),falconCore('starboard',.285,true));
  else groups[0].name='First stage';
  groups.push(group('upper','Second stage and payload','The upper stage keeps the booster diameter. The payload fairing steps outward above it.',[
    part('barrel','Second-stage shell','The white upper stage sits between the black interstage and the lower shoulder of the fairing.',[0,0,.32],r=>{
      section(r,0,0,[[3.25,falconRadius],[4.04,falconRadius]],shellWhite,{caps:true});
      band(r,0,0,3.27,3.29,.133,'#b8bcb7');band(r,0,0,3.94,3.955,.133,'#baaea2');
      bell(r,0,0,3.00,.115,.249,26);
    }),
    part('air','Payload conditioning inlet','A ground air supply serves the enclosed payload during processing. Open the port to see the conditioning path.',[.32,-.08,.25],r=>r.rod([.180,0,4.47],[.193,0,4.47],.015,metal,16)),
    ...fairingParts(4.04,4.97,.133,.186,'One of two white shell halves surrounding a satellite during ascent.')
  ]));
  return exhibit({
    id:heavy?'falcon-heavy':'falcon-9',name:heavy?'SpaceX Falcon Heavy':'SpaceX Falcon 9 · Block 5',short:heavy?'Falcon Heavy':'Falcon 9',year:heavy?2019:2018,domain:'Air',type:'Space',
    detail:heavy?'Two capped boosters flank a taller center core. Isolate a nozzle cluster to see the ring of eight bells around a ninth.':'The satellite version of Block 5 carries a white two-piece fairing. The black legs and folded lattice fins stay on the first stage.',
    source:source(heavy?'SpaceX · Falcon Heavy':'SpaceX · Falcon 9',heavy?'https://www.spacex.com/vehicles/falcon-heavy/':'https://www.spacex.com/vehicles/falcon-9/'),
    specs:[['Variant',heavy?'Three-core Block 5':'Block 5 · payload fairing'],['Height','70 m'],['Lower cores',heavy?'3':'1'],['Grid fins',heavy?'12 · four per core':'4']]
  },groups);
}

const dragonProfile=[[2.35,1.15],[2.48,1.17],[2.78,1.16],[3.07,1.09],[3.62,.87],[4.14,.62],[4.29,.53]];
const dragonAzimuths=[1.83,3.19];
const dragonPanes=[[3.40,.080],[3.45,.158],[3.62,.145],[3.69,.139],[3.73,.078]];
function dragonSurface(angle,z,lift=0){
  const i=dragonProfile.findIndex(([height])=>height>=z);
  const [lo,lr]=dragonProfile[Math.max(i-1,0)],[hi,hr]=dragonProfile[i<0?dragonProfile.length-1:i];
  return rad(angle,z,lr+(hi===lo?0:(z-lo)/(hi-lo))*(hr-lr)+lift);
}
function paneHalfWidth(z){
  if(z<=3.40)return .080;
  if(z>=3.73)return .078;
  const i=dragonPanes.findIndex(([height])=>height>=z),[lo,lr]=dragonPanes[i-1],[hi,hr]=dragonPanes[i];
  return lr+(z-lo)/(hi-lo)*(hr-lr);
}
function dragonBounds(z){
  const w=paneHalfWidth(z);
  return [0,dragonAzimuths[0]-w,dragonAzimuths[0]+w,dragonAzimuths[1]-w,dragonAzimuths[1]+w,TAU];
}
function dragonSkin(r){
  const levels=[...new Set([...dragonProfile,...dragonPanes].map(([z])=>z))].sort((a,b)=>a-b);
  for(let i=1;i<levels.length;i++){
    const z0=levels[i-1],z1=levels[i],low=dragonBounds(z0),high=dragonBounds(z1);
    for(let band=0;band<5;band++){
      if(z0>=3.40&&z1<=3.73&&(band===1||band===3))continue;
      const count=[15,3,10,3,25][band],at=(t,z,bounds)=>dragonSurface(bounds[band]+(bounds[band+1]-bounds[band])*t,z);
      for(let j=0;j<count;j++){
        const p=j/count,q=(j+1)/count;
        r.polygon([at(p,z0,low),at(q,z0,low),at(q,z1,high),at(p,z1,high)],tone(shellWhite,.87+.1*Math.cos((low[band]+(low[band+1]-low[band])*p)-.65)),false);
      }
    }
  }
  section(r,0,0,[[4.29,.53],[4.291,.42],[4.307,.42],[4.307,.124]],'#b5b9ac',{steps:40});
  section(r,0,0,[[4.307,.124],[4.312,.124],[4.312,.105]],'#65716f',{steps:32});
  const hatch=[[2.21,2.89],[2.80,2.89],[2.86,2.99],[2.84,3.73],[2.76,3.80],[2.25,3.80],[2.17,3.73],[2.15,2.99]];
  for(let i=0;i<hatch.length;i++){
    const [a,z]=hatch[i],[b,zz]=hatch[(i+1)%hatch.length];
    for(let j=0;j<7;j++){
      const at=t=>dragonSurface(a+(b-a)*t,z+(zz-z)*t,.005);
      r.rod(at(j/7),at((j+1)/7),.007,'#707974',6);
    }
  }
}
function dragonGlazing(r){
  for(const a of dragonAzimuths){
    for(let i=1;i<dragonPanes.length;i++){
      const [z0,w0]=dragonPanes[i-1],[z1,w1]=dragonPanes[i];
      for(let j=0;j<3;j++){
        const t=-1+j*2/3,u=-1+(j+1)*2/3;
        glazingFace(r,[dragonSurface(a+w0*t,z0),dragonSurface(a+w0*u,z0),dragonSurface(a+w1*u,z1),dragonSurface(a+w1*t,z1)],'#557d8b',.46);
      }
      for(const sign of [-1,1])r.rod(dragonSurface(a+sign*w0,z0),dragonSurface(a+sign*w1,z1),.012,'#5b6663',8);
    }
    for(const [z,w] of [dragonPanes[0],dragonPanes.at(-1)]){
      for(let j=0;j<3;j++)r.rod(dragonSurface(a-w+j*2*w/3,z),dragonSurface(a-w+(j+1)*2*w/3,z),.012,'#5b6663',8);
    }
  }
  const pane=Array.from({length:32},(_,i)=>rad(i*TAU/32,4.312,.105));
  glazingFace(r,pane,'#557d8b',.46);
}
const dragon=exhibit({
  id:'crew-dragon',name:'Crew Dragon Endeavour · Demo-2',short:'Crew Dragon',year:2020,domain:'Air',type:'Space',
  detail:'Endeavour carried Bob Behnken and Doug Hurley to orbit in May 2020. The crew returned in the white capsule. The cylindrical trunk stayed attached only until the trip home.',
  source:source('NASA · SpaceX Demo-2 crew launch','https://www.nasa.gov/news-release/nasa-astronauts-launch-from-america-in-historic-test-flight-of-spacex-crew-dragon/'),
  sources:[source('SpaceX · Dragon exterior and trunk','https://www.spacex.com/vehicles/dragon'),source('Inspiration4 · Dragon cabin windows','https://inspiration4.com/faq/')],
  specs:[['Spacecraft','Endeavour'],['Launch','May 30, 2020'],['Flight','Demo-2 · International Space Station'],['Crew','Robert Behnken and Douglas Hurley']]
},[
  group('trunk','Trunk','The trunk supports the capsule. A fixed solar array wraps around one side.',[
    part('barrel','Unpressurized trunk','The cylindrical trunk remains in orbit when the capsule starts its return to Earth.',[0,0,-.34],r=>{
      section(r,0,0,[[.06,1.09],[.12,1.13],[2.21,1.13]],shellWhite,{caps:true});
      band(r,0,0,.12,.165,1.135,dark);
    }),
    part('solar','Conformal solar panels','Dark solar cells cover half the trunk’s circumference and follow the curve of the hull.',[0,.42,.06],r=>{
      for(let i=0;i<18;i++)for(let j=0;j<6;j++){
        const a=Math.PI*i/18+.005,b=Math.PI*(i+1)/18-.005,z=.20+j*.32;
        section(r,0,0,[[z,1.137],[z+.306,1.137]],(i+j)%3?'#24374b':'#344b5d',{from:a,to:b,steps:2});
      }
    }),
    part('fins','Four trunk fins','Four tapered fins project from the base of the trunk.',[.38,0,.05],r=>{
      for(const a of quarter)fin(r,0,0,a+.36,[[1.12,.11],[1.46,.11],[1.43,.27],[1.14,1.49]],shellWhite,.047);
    })
  ]),
  group('capsule','Crew capsule','The broad heat shield, tapered crew cabin and rounded nose form the returning spacecraft.',[
    part('shield','Heat shield','The dark circular heat shield covers the bottom face of the capsule.',[0,0,-.42],r=>section(r,0,0,[[2.22,.32],[2.23,.93],[2.28,1.14],[2.35,1.15]],'#3b3936',{caps:true})),
    part('shell','Crew cabin shell','Two windows flank the side hatch. Above them, a third window in the forward hatch sits under the nose cone.',[0,0,.19],dragonSkin),
    part('pods','Four side housings','Paired dark outlet recesses sit in sculpted shoulders around the lower part of the spacecraft.',[.36,0,.14],r=>{
      const skin=z=>z<=2.48?1.15+(z-2.35)*.15:z<2.78?1.17-(z-2.48)*.033:z<3.07?1.16-(z-2.78)*.241:1.09-(z-3.07)*.40;
      for(const angle of quarter){
        const a=angle+.37, stations=[[2.40,.074,.015],[2.49,.15,.094],[2.70,.194,.111],[2.92,.167,.086],[3.16,.087,.044],[3.24,.025,.01]];
        const shell=stations.map(([z,halfWidth,lift])=>[-1,-.72,0,.72,1].map(t=>rad(a+t*halfWidth,z,skin(z)+lift*(1-.70*Math.abs(t)))));
        for(let i=0;i<shell.length-1;i++)for(let j=0;j<4;j++){
          r.polygon([shell[i][j],shell[i][j+1],shell[i+1][j+1],shell[i+1][j]],tone('#b6b7af',j<2?.87:1.01),false);
        }
        for(const side of [-1,1]){
          const mouth=Array.from({length:16},(_,i)=>{const t=TAU*i/16,b=a+side*.077+.047*Math.cos(t),z=2.64+.102*Math.sin(t);
            return rad(b,z,skin(z)+.112*(1-.70*Math.abs(b-a)/.18)+.006);});
          r.polygon(mouth,'#373c40',false);
        }
      }
    }),
    part('windows','Cabin glazing','The crew could look through the two side windows during flight. Removing the nose cone reveals the smaller forward window.',[0,.36,.18],dragonGlazing),
    part('nose','Hinged nose cone','The nose opens in orbit to uncover the docking interface. Here it is shown closed for launch.',[0,0,.53],r=>{
      section(r,0,0,[[4.29,.53],[4.43,.464],[4.52,.30],[4.56,.12],[4.57,0]],shellWhite,{caps:true});
      band(r,0,0,4.28,4.297,.536,'#949e9f');
    })
  ]),
  dragonInterior,
]);

export const spaceModels=[saturn,apolloLander,apolloRover,atlas,makeFalcon(false),makeFalcon(true),dragon];
