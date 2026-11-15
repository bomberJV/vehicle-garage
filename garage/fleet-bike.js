import {drawK67CrankCover,drawK67Brakes,drawK67RearHugger,drawK67CastWheel,drawK67Frame,drawK67Footrest,drawK67Mirror,drawK67Saddle,drawK67Swingarm,drawK67Tank} from './k67-road-hardware.js';
import {installedExhaust} from './k67-exhaust.js';
import {drawAirbox,drawRadiator} from './s1000rr-additions.js';
import {wheelDesign} from './wheel-designs.js';
import {drawApex6} from './wheel-faces.js';
import {drawInstalledChain} from './bike-chain.js';
import {drawFleetIgnition} from './fleet-ignition.js';
import {drawK67Bodywork} from './k67-fairings.js';
import {pipe,barrel,wheel} from './road-primitives.js';
const TAU=2*Math.PI;
export function drawBike(r,paint='#497bae',finish='#74808a'){
  const front=-.728,rear=.729,fr=.300,rr=.315;
  const alternative=wheelDesign('bmws1000rr',r.build?.wheelDesign).id==='apex6';
  for(const back of [false,true])wheel(r,{drawBrake:drawK67Brakes,drawRim:alternative?drawApex6:drawK67CastWheel,x:back?rear:front,y:0,z:back?rr:fr,radius:back?rr:fr,width:back?.190:.120,rim:.2159,brakeRim:back?.11/.68:.16/.79,side:back?1:-1,rear:back,moto:true,finish,tags:{tire:'running.tires',rim:'running.rims',brake:'running.discs'}});
  r.tag('body.fender',()=>drawK67RearHugger(r));
  r.tag('chassis.fork',()=>{
    for(const s of [-1,1]){const y=s*.106;barrel(r,[front,y,fr],[-.588,y,.69],.024,'#bac4bf');barrel(r,[-.599,y,.659],[-.481,y,.938],.030,'#b29b66');barrel(r,[front,y,.282],[front+.042,y,.402],.039,'#72797a');}
    for(const z of [.805,.914])r.rod([-.50-(.914-z)*.4,-.137,z],[-.50-(.914-z)*.4,.137,z],.024,'#656d70');
  });
  for(const s of [-1,1]){
    r.tag('chassis.frame',()=>drawK67Frame(r,s));
    r.tag('chassis.swingarm',()=>drawK67Swingarm(r,s));
  }
  r.tag('chassis.shock',()=>{
    const a=[.281,0,.367],b=[.326,0,.626];
    barrel(r,a,b,.018,'#a1a8a6',10);
    barrel(r,[.309,0,.529],b,.031,'#80898a',12);
    barrel(r,[.298,-.004,.600],[.377,-.004,.600],.020,'#91999a',10);
    const coil=[];
    for(let i=0;i<=42;i++){
      const f=i/42,t=f*TAU*6;
      coil.push([.284+.030*f+.029*Math.cos(t),.029*Math.sin(t),.390+.159*f]);
    }
    pipe(r,coil,.006,'#763e39',5);
  });
  r.tag('drive.chain',()=>drawInstalledChain(r));
  r.tag('engine.case',()=>{
    r.profile([[-.33,.525],[-.266,.374],[-.097,.319],[.117,.35],[.195,.456],[.144,.553],[-.055,.594]],-.182,.182,'#858b89');
    for(const side of [-1,1])drawK67CrankCover(r,side);
  });
  r.tag('engine.cylinders',()=>{
    for(let i=0;i<4;i++){const y=(i-1.5)*.081;barrel(r,[-.188,y,.513],[-.307,y,.705],.042,'#a0a4a4',14);}
  });
  r.tag('engine.head',()=>{
    r.profile([[-.366,.663],[-.343,.732],[-.258,.771],[-.199,.714]],-.181,.181,'#929797');
    for(const x of [-.332,-.257])r.profile([[x-.030,.743],[x-.018,.756],[x+.022,.756],[x+.031,.742]],-.155,.155,'#566067');
  });
  drawFleetIgnition(r,'bmws1000rr');
  r.tag('engine.airbox',()=>drawAirbox(r));
  r.tag('engine.cooling',()=>drawRadiator(r));
  r.tag('drive.gearbox',()=>{barrel(r,[-.017,-.127,.454],[-.017,.127,.454],.068,'#8e9496');barrel(r,[.095,-.127,.435],[.095,.127,.435],.062,'#7b8285');});
  r.tag('drive.exhaust',()=>installedExhaust(r));
  drawK67Bodywork(r,paint);
  r.tag('body.tank',()=>drawK67Tank(r,paint));
  r.tag('body.seat',()=>drawK67Saddle(r,paint,!r.build?.parts?.includes('s1k-puig-cowl')));
  r.tag('body.tail-carrier',()=>{
    // Street equipment attaches beneath the removable tail, clear of the rear tire.
    r.profile([[.682,.920],[.773,.974],[.878,.964],[.927,.949],[.931,.932],[.893,.925],[.801,.933]],-.024,.024,'#40474c');
    r.profile([[.891,.947],[.931,.950],[.955,.894],[.950,.874],[.926,.883]],-.025,.025,'#393f40');
    r.profile([[.932,.918],[.945,.922],[1.045,.730],[1.034,.727]],-.078,.078,'#3e4546');
    for(const side of [-1,1]){
      barrel(r,[.902,side*.015,.946],[.928,side*.107,.944],.007,'#505a5e',8);
      const rim=[[.104,.939],[.109,.951],[.142,.954],[.160,.950],[.154,.937],[.122,.932]].map(([y,z])=>[.946,side*y,z]);
      const lens=rim.map(([x,y,z])=>[x+.007,side*(.132+(side*y-.132)*.92),.942+(z-.942)*.86]);
      for(let i=0;i<rim.length;i++){
        const j=(i+1)%rim.length;
        r.polygon([[.916,side*.119,.942],rim[i],rim[j]],'#41484a',false);
        r.polygon([rim[i],lens[i],lens[j],rim[j]],'#5b4543',false);
      }
      r.polygon(lens,'#a34940',false);
    }
  });
  r.tag('cabin.controls',()=>{
    for(const s of [-1,1]){
      pipe(r,[[-.49,s*.082,.919],[-.403,s*.178,.897],[-.393,s*.292,.887]],.015,'#33393c');
      r.rod([-.459,s*.180,.91],[-.443,s*.296,.91],.007,'#aab4b4');
      drawK67Mirror(r,s);
      drawK67Footrest(r,s);
    }
    r.box(-.552,-.074,.923,-.53,.074,.977,'#374754');
  });
}
