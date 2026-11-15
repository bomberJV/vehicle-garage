// Detail models show a normal operating cycle. Dimensions are enlarged for inspection.
import {part,study,cyl,sleeve,tint,turn} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';
import {references} from './door-profiles.js';

const steel='#96a7a9',zinc='#b9b6a0',rubber='#39464b',bronze='#bd9562',red='#9d5741';
const axisY=[0,1,0],axisZ=[0,0,1],tau=Math.PI*2;
const pos=(v,t)=>[v[0]*Math.cos(t)-v[1]*Math.sin(t),v[0]*Math.sin(t)+v[1]*Math.cos(t)];
const disc=(r,x,y,z,rad,color)=>cyl(r,[x,y,z],axisY,-.015,.015,rad,color,18);
export function link(r,a,b,width,y,depth,color){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=-dz/length*width/2,nz=dx/length*width/2;
  r.profile([[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]],y,y+depth,color);
}
function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
const interval=(t,a,b)=>smooth((t-a)/(b-a));
// The first stroke is closure. The pawl holds during dwell and releases ahead of opening.
function latchPose(t){
  const caught=interval(t,.06,.36)-interval(t,.68,.91);
  const release=interval(t,.55,.66)-interval(t,.9,.99);
  const entry=interval(t,0,.06)-interval(t,.91,1);
  return {fork:-caught*1.04,pawl:.42*release+.11*Math.sin(Math.PI*interval(t,.18,.36)),entry,release};
}
export function latchStudy(source){
  const id='door-latch',forkCenter=[0,.24],forkPoint=(p,t)=>{const [x,z]=pos(p,t);return [x+forkCenter[0],z+forkCenter[1]];};
  const d=study(id,'Door latch and striker','The striker on the body enters the latch as the door closes. The fork rotates around it, and a spring-loaded pawl holds the fork. Operating the handle releases the pawl so the door can open again. This view shows the shared rotary-latch principle.',source,[
    part('plate','Latch housing and backing plate','The back plate supports the rotor and pawl pivots. The cover is cut away to show both working faces.',[0,-.55,.04],r=>{
      r.profile([[-.43,-.17],[.28,-.17],[.40,-.05],[.40,.47],[.17,.59],[-.38,.59],[-.47,.46]],-.13,-.08,'#687c81');
      for(const [x,z] of [[-.34,-.075],[.295,-.04],[-.32,.485]]){sleeve(r,[x,-.066,z],axisY,-.01,.026,.033,.014,steel,14);}
      for(const [x,z] of [forkCenter,[.22,.09]])disc(r,x,-.045,z,.046,'#d2cdac');
    }),
    part('fork','Rotary fork','The two fork fingers cradle the striker. The lower shoulder meets the retaining pawl when the door reaches the closed position.',[-.53,0,.18],(r,t)=>{
      const a=latchPose(t).fork;
      const vertices=[[-.205,.16],[-.105,.17],[-.07,.047],[.02,.032],[.085,.13],[.193,.15],[.189,-.016],[.13,-.097],[.054,-.144],[-.067,-.123],[-.174,-.043]];
      // Triangulated to retain the open slot between both fingers.
      const pts=vertices.map(q=>forkPoint(q,a)),center=forkPoint([-.028,-.045],a);
      for(let j=0;j<pts.length;j++)r.profile([pts[j],pts[(j+1)%pts.length],center],-.04,.02,bronze);
      disc(r,0,.043,.24,.042,steel);
    }),
    part('pawl','Retaining pawl','A small pivoted lever holds the fork in its closed position.',[.49,.19,0],(r,t)=>{
      const pivot=[.22,.09],angle=latchPose(t).pawl,p=([u,v])=>{const q=pos([u,v],angle);return [pivot[0]+q[0],pivot[1]+q[1]];};
      r.profile([[-.16,.015],[-.12,.061],[.015,.048],[.08,-.045],[.04,-.111],[-.037,-.044]].map(p),-.03,.032,red);
      disc(r,pivot[0],.048,pivot[1],.029,zinc);
    }),
    part('striker','Body-mounted striker','As the door closes, the relative motion of the striker and latch turns the fork around the striker bar.',[-.12,.37,.68],(r,t)=>{
      const {entry,fork}=latchPose(t),[x,z]=forkPoint([0,.085+.51*(1-entry)],fork);
      pipe(r,[[x+.26,-.066,z],[x,-.066,z],[x,.102,z],[x+.26,.102,z]],.030,zinc,16);
      r.box(x+.225,-.11,z-.067,x+.255,.143,z+.067,steel);
    }),
    part('release','Release lever','A normal handle pull turns the release lever. The lever lifts the pawl before the striker moves away.',[.38,-.07,-.26],(r,t)=>{
      const a=latchPose(t).release*.28,x=.25+Math.sin(a)*.17,z=-.055+Math.cos(a)*.17;
      link(r,[.25,-.055],[x,z],.032,.064,.018,'#909a7b');disc(r,.25,.09,-.055,.024,steel);
    }),
    part('lock','Lock selector','The selector controls whether the outer handle can operate the release. The illustrated closing and opening cycle takes place with the door unlocked.',[.43,-.23,.36],r=>{
      r.box(.292,-.01,.23,.387,.072,.372,rubber);r.box(.311,.071,.26,.345,.102,.34,bronze);
    }),
    part('return','Return spring','The spring returns the release lever after the handle is let go.',[-.12,.21,-.28],r=>{
      const points=Array.from({length:64},(_,i)=>{const a=i/63*tau*3;return [.247+.039*Math.cos(a),.039+i*.0005,-.054+.039*Math.sin(a)];});
      pipe(r,[[.18,.04,-.089],...points,[.32,.073,-.084]],.006,steel,5);
    }),
  ],'Watch the closing stroke capture the striker. During the pause the pawl holds. The handle lever then lifts it and the striker withdraws.');
  d.viewAngle=[-.27,.2];return d;
}
export function hingeStudy(source){
  const leaf=(r,angle,sign,color)=>{
    const point=(x,y,z)=>[sign*x*Math.cos(angle)-y*Math.sin(angle),sign*x*Math.sin(angle)+y*Math.cos(angle),z];
    const loop=[[.035,.079],[.15,.133],[.327,.11],[.35,.071],[.33,-.101],[.14,-.122],[.035,-.068]];
    const sides=[-.011,.011].map(y=>loop.map(([x,z])=>point(x,y,z)));
    sides.forEach(s=>r.polygon(s,color,false));
    loop.forEach((_,i)=>r.polygon([sides[0][i],sides[0][(i+1)%loop.length],sides[1][(i+1)%loop.length],sides[1][i]],tint(color,.79),false));
    for(const z of [-.059,.061]){const center=point(.261,.016,z);cyl(r,center,[-Math.sin(angle),Math.cos(angle),0],-.003,.012,.022,zinc,6);}
    const runs=sign<0?[[-.162,-.063],[.063,.162]]:[[-.058,.058]];
    runs.forEach(([a,b])=>sleeve(r,[0,0,0],axisZ,a,b,.051,.029,color,20));
  };
  const d=study('door-hinge','Hinge leaves and pin','The body and door leaves alternate along one pin. The central knuckle turns with its leaf while the other leaf stays with the pillar. The section shows the pivot geometry.',source,[
    part('pillar','Body-side leaf','The two outer knuckles belong to the leaf attached to the pillar.',[-.50,-.10,.05],r=>leaf(r,0,-1,'#718481')),
    part('door','Door-side leaf','The center knuckle and its leaf turn together around the pin.',[.50,.20,.04],(r,t)=>leaf(r,(1-Math.cos(t*tau))*.48,1,'#9fab94')),
    part('pin','Hinge pin','The pin passes through the three knuckles on a common axis.',[.02,0,.42],r=>turn(r,[0,0,0],axisZ,[[-.184,0],[-.184,.019],[-.169,.024],[.169,.024],[.169,.045],[.184,.045],[.184,0]],zinc,{n:20})),
    part('bearing','Pivot bushings','Two thin bushings in the center knuckle separate the pin and the moving leaf. Their thickness is exaggerated in this bearing section.',[0,-.28,-.28],r=>{for(const z of [-.057,.009])sleeve(r,[0,0,0],axisZ,z,z+.048,.029,.024,bronze,18);})
  ],'Follow the central knuckle as the door-side leaf swings about the stationary pin.');
  d.viewAngle=[-.45,.39];return d;
}
export function regulatorStudy(p){
  const viaCable=p.lift==='cable',cross=p.lift==='cross',twoRails=viaCable&&p.rails===2;
  const rails=twoRails?[-.32,.32]:[0];
  const name=viaCable?(twoRails?'Twin-rail cable regulator':'Single-rail cable regulator'):cross?'Cross-arm window regulator':'Sector-arm window regulator';
  const source=p.vehicle==='f350'?references.fordLift:p.source;
  const title=p.name+' '+name.toLowerCase();
  const desc=viaCable?'A motor turns a cable drum. The carriage follows its guide rail, carrying the bottom of the glass with it.':'A motor turns a toothed sector. The end of the lifting arm slides along a channel beneath the glass as the arm turns.';
  const lift=t=>.035+.41*(.5-.5*Math.cos(t*tau));
  // Rotary arms have a fixed length; each slider follows its channel.
  const end=t=>{const dz=.145+lift(t),dx=Math.sqrt(.78**2-dz**2);return [dx,dz];};
  const pivotX=-.34;
  const glassZ=t=>viaCable?.22+lift(t):.14+end(t)[1];
  const parts=[
    part('glass','Window glass and lower shoe','The regulator carries the shoe at the bottom edge of the glass. The short pane is cut across the top so the mechanism stays in view.',[0,-.24,.50],(r,t)=>{
      const z=glassZ(t);
      glazingFace(r,[[-.43,0,z],[.42,0,z],[.37,-.018,z+.23],[-.35,-.018,z+.23]],'#90c4cb',.45);
      r.box(-.44,-.025,z-.024,.43,.019,z+.012,rubber);
    }),
    part('motor','Lift motor and gear housing','The electric motor turns a reduction gear on the regulator drive. The connector and mounting bosses stay with the housing.',[-.25,.35,-.12],r=>{
      const x=viaCable?.40:pivotX;
      turn(r,[x,.13,.24],axisZ,[[-.17,0],[-.17,.050],[-.145,.067],[.04,.067],[.052,.039],[.068,0]],steel,{n:20});
      cyl(r,[x,.12,.29],axisY,-.066,.04,.098,rubber,22);r.box(x+.039,.118,.13,x+.11,.163,.18,'#5c6662');
    })
  ];
  if(viaCable){
    parts.push(part('track',twoRails?'Front and rear guide rails':'Guide rail','A folded steel channel keeps each carrier on a straight path.',[-.54,0,.13],r=>{
      for(const x of rails){r.box(x-.027,-.066,.092,x+.027,-.056,.81,steel);r.box(x-.027,-.055,.092,x-.018,-.039,.81,zinc);}
    }),part('cable','Cable, drum and pulleys','The cable wraps the drum and changes direction at the guide pulleys. The two cable runs move in opposite directions.',[.20,.45,.15],(r,t)=>{
      for(const x of rails){
        for(const z of [.12,.78]){disc(r,x,.012,z,.029,bronze);r.rod([x,.03,z],[x+.019*Math.cos(t*tau),.03,z+.019*Math.sin(t*tau)],.003,zinc,5);}
        pipe(r,[[x-.024,.015,.12],[x-.024,.015,.78],[x+.026,.015,.78],[x+.026,.015,.12]],.005,zinc,6);
      }
      for(const x of rails)pipe(r,[[x,.02,.12],[x+.068,.06,.13],[.36,.08,.25]],.009,rubber,8);
      if(twoRails){
        pipe(r,[[rails[0]+.02,.004,.78],[-.26,-.01,.70],[.26,-.01,.20],[rails[1]-.02,.004,.12]],.006,steel,6);
        pipe(r,[[rails[1]-.02,.01,.78],[.27,.01,.70],[-.27,.01,.20],[rails[0]+.02,.01,.12]],.006,'#788683',6);
      }
      disc(r,.4,.082,.29,.065,bronze);
    }),part('carriage','Sliding glass carrier','The lift cable moves the carrier up and down the guide. Its clamp grips the lower shoe.',[.44,.16,.33],(r,t)=>{
      const h=glassZ(t);for(const x of rails){r.box(x-.064,-.054,h-.061,x+.063,-.01,h+.014,'#a1aca1');disc(r,x,.003,h-.023,.020,zinc);}
    }));
  }else{
    parts.push(part('arm',cross?'Crossed lifting arms':'Pivoted lift arm','The long steel arm turns about a fixed pivot. Its end roller can travel sideways in the straight lower channel.',[0,.31,.28],(r,t)=>{
      const [dx,dz]=end(t),right=pivotX+dx;
      link(r,[pivotX,.14],[right,.14+dz],.038,.04,.016,steel);
      if(cross){
        link(r,[right,.14],[pivotX,.14+dz],.037,.064,.016,steel);
        disc(r,pivotX+dx/2,.084,.14+dz/2,.032,zinc);
        r.box(.09,.03,.113,.49,.047,.165,steel);
      }
      for(const rollerX of cross?[pivotX,right]:[right])disc(r,rollerX,.028,dz+.14,.026,rubber);
    }),part('sector','Drive sector','The toothed edge on the drive arm receives torque from the motor pinion.',[-.41,-.25,.19],(r,t)=>{
      const [dx,h]=end(t),a=Math.atan2(h,dx),c=[pivotX,.14];
      const curve=(rad,angle)=>[c[0]+rad*Math.cos(angle),c[1]+rad*Math.sin(angle)];
      for(let i=0;i<19;i++){const u=2.1+a+i*.09,v=u+.09;
        const profile=[c,curve(.122,u),curve(.135,u+.016),curve(.135,v-.023),curve(.122,v)];
        r.profile(profile,.069,.083,bronze);
      }
    }),part('channel','Roller channel','The horizontal channel under the glass accepts sideways movement of the rollers as the arm changes angle.',[.31,-.2,-.27],(r,t)=>{const z=glassZ(t);r.box(-.45,.018,z-.03,.452,.037,z+.017,steel);}));
  }
  const d=study('regulator-'+p.vehicle,title,desc,source,parts,'The motor raises and lowers the glass through one cycle. Watch the carrier stay with the lower edge.');d.viewAngle=[-.25,.18];return d;
}
