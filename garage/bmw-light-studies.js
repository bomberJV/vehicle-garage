import {cyl,sleeve,turn,part,study,TAU} from './mechanism-shapes.js';
import {glazingFace} from './surface-materials.js';

const named=(id,name,description,source)=>({id,name,description,source});
const ref=(page,label)=>({label:'BMW 325Ci M54 parts plate · '+label,url:'https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/lighting/'+page+'.html'});
export const e46LightRefs={
 head:ref('single_components_for_headlight','halogen headlamp through 02/2003'),signal:ref('front_front_lateral_turn_indicator','front and side turn signals'),
 fog:ref('fog_lights','standard bumper fog lamp and support'),rear:ref('rear_light','side-panel and trunk-lid lamps'),
 profile:{label:'BMW · 325Ci/330Ci Coupé owner’s manual, p. 147',url:'https://bmw330ci.net/the330ci/2003Manual-3SeriesCoupe.pdf#page=147'},
 grille:{label:'BMW 2003 coupé brochure · front view',url:'https://xr793.com/wp-content/uploads/2022/07/2003-BMW-3-Series-Coupe-CN.pdf#page=2'}
};
const R=e46LightRefs;
export const bmwLightParts=[
 named('lighting.fog','Round fog lamps','Each HB4 lamp sits in its own recess below the bumper strip and outboard of the three central intake vanes.',R.fog),
 named('lighting.repeater','Fender side repeaters','A short amber repeater sits behind each front wheel opening above the side molding.',R.signal),
 named('lighting.tail','Rear quarter lamps','The amber turn signal lies above the red stop and tail sections. This lamp stays on the quarter panel when the trunk lid opens.',R.rear),
 named('lighting.reverse','Trunk-lid lamps','The inner lamps follow the lid. Each clear reversing section sits above a red lens beside the plate recess.',R.rear)
];
export const bmwEndParts=[
 named('body.kidneys','Bonnet kidney grilles','The two separate chrome-edged grilles sit in the downturned nose of the bonnet. Dark slats cross each opening.',R.grille),
 named('body.front-bumper','Front bumper cover','Three bars cross the center opening of the standard coupé bumper. A separate outboard opening carries each round fog lamp.',R.profile),
 named('body.rear-bumper','Rear bumper cover','The horizontal painted cover wraps around the rear quarters. The two exhaust tips sit together on the driver side below it.',R.profile)
];
const axis=[0,1,0],metal='#acb8b8',black='#344147',amber='#d89740';
const round=(w,h,k)=>{
 const pts=[];
 for(const [x,y,t] of [[w/2-k,h/2-k,0],[-w/2+k,h/2-k,.25],[-w/2+k,-h/2+k,.50],[w/2-k,-h/2+k,.75]])
  for(let i=0;i<5;i++){const a=TAU*(t+i/16);pts.push([x+k*Math.cos(a),y+k*Math.sin(a)]);}
 return pts;
};
function loop(r,a,b,color){
 for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],typeof color==='function'?color(i):color,false);}
}
function lens(r,outline,y,depth){
 const back=outline.map(([x,z])=>[x,y,z]),roof=outline.map(([x,z])=>[x*.981,y+depth,z*.961]);
 for(let i=0;i<back.length;i++){const k=(i+1)%back.length;glazingFace(r,[back[i],back[k],roof[k],roof[i]],'#a4b4b5',.31);}
 const crown=[0,y+depth+.007,.01];
 for(let i=0;i<roof.length;i++)glazingFace(r,[crown,roof[i],roof[(i+1)%roof.length]],'#b4c4c5',.19);
}
const out=[[-.75,.20],[-.67,.26],[-.39,.27],[.06,.26],[.49,.25],[.70,.21],[.76,.17],[.76,-.11],[.70,-.18],[.54,-.27],[.38,-.31],[.21,-.29],[.08,-.22],[.002,-.163],[-.10,-.22],[-.22,-.28],[-.38,-.30],[-.55,-.27],[-.68,-.21],[-.75,-.12]];
function headlamp(){
 const h=study('e46-halogen-headlamp','Pre-facelift halogen headlamp','The US 325Ci could be ordered with xenon lighting. This halogen unit has two H7 bulbs, a parking bulb and separate rear covers under one weather lens. The outboard corner indicator has its own housing.',R.head,[
  part('housing','Twin-reflector housing','The housing locates the two reflector axes and supports the lower mounting bracket.',[.05,-.47,-.30],r=>{
    const a=out.map(([x,z])=>[x,.055,z]),b=out.map(([x,z])=>[x*.89,-.236,z*.80]);loop(r,a,b,black);loop(r,a,a.map(([x,y,z])=>[x*.96,y,z*.92]),'#5d696b');
    for(const x of [-.375,.383])sleeve(r,[x,-.20,-.008],axis,-.09,.01,.189,.134,'#434d50',32);
  }),
  ...[[-.375,'high','Inboard high-beam reflector'],[.377,'low','Outboard low-beam reflector']].map(([x,id,name])=>part(id,name,'The bright curved bowl collects light from its own filament and opens toward the common outer lens.',[x*1.1,.29,.41],r=>{
    const profile=[[-.178,.072],[-.149,.127],[-.105,.185],[-.035,.21],[.032,.229],[.054,.235],[.063,.231]];
    turn(r,[x,0,-.011],axis,profile,'#a8b6b5',{n:48});
    for(let i=0;i<22;i++){
      const a=TAU*(.52+i*.45/22),b=a+.014,q=(t,rad,y)=>[x+rad*Math.cos(t),y,-.011+rad*Math.sin(t)];
      r.polygon([q(a,.170,-.118),q(b,.170,-.118),q(b,.227,.037),q(a,.227,.037)],i%2?'#d4d8c7':'#818b89',false);
    }
  })),
  part('weather-lens','Common outer lens','The lower edge follows the two reflector scallops. Slim upper and lower trim follow the outer cover.',[0,.65,.12],r=>lens(r,out,.060,.039)),
  part('gasket','Perimeter seal','A narrow gasket fits between the cover and the main housing.',[.55,.07,-.29],r=>{
    const a=out.map(([x,z])=>[x,.055,z]);loop(r,a,a.map(([x,y,z])=>[x*.963,y+.015,z*.94]),'#555e5b');
  }),
  part('bulbs','Two H7 headlamp bulbs','Each 12 V, 55 W H7 carries one filament. Open either bulb to see the capsule, filament, flange and terminals.',[-.51,-.27,.48],r=>{
    for(const [x,name] of [[-.375,'High beam'],[.377,'Low beam']])r.instance(name,()=>{
      const p=[x,-.186,-.011];sleeve(r,p,axis,-.061,.005,.086,.041,metal,24);
      turn(r,p,axis,[[.004,.030],[.016,.036],[.110,.034],[.137,.023],[.148,0]],'#c5ccbd',{n:24});
      for(const s of [-1,1])r.box(x+s*.032-.007,-.281,-.016,x+s*.032+.007,-.245,-.003,'#8d8b73');
    });
  }),
  part('pilot','Parking-light bulb and holder','The small parking bulb has a separate socket below the main bulb opening.',[-.39,.10,-.43],r=>{
    turn(r,[-.425,-.11,-.17],axis,[[-.114,.045],[-.039,.044],[-.023,.032],[.004,.029],[.021,.032],[.058,.030],[.074,.018],[.078,0]],'#9aa9a7',{n:20});
  }),
  part('caps','Rear dust covers','The round covers close the high- and low-beam access openings behind the two reflector bowls.',[.36,-.70,-.23],r=>{
    for(const x of [-.375,.377])r.instance(x<0?'High-beam cover':'Low-beam cover',()=>turn(r,[x,-.277,-.011],axis,[[-.090,0],[-.086,.093],[-.074,.129],[-.046,.148],[-.021,.145],[-.010,.18],[.010,.18],[.014,.152]],'#505957',{n:36}));
  }),
  part('bracket','Lower support and mounting feet','The separate bracket supports the bottom of the insert. Its end tabs carry it at the front panel.',[.36,-.15,-.49],r=>{
    r.box(-.65,-.19,-.344,.64,-.115,-.298,black);
    for(const x of [-.62,.60]){r.box(x-.048,-.115,-.337,x+.048,.01,-.308,'#596366');}
  })
 ]);h.viewAngle=[-.46,.18];return h;
}
function h7(){
 const o=[0,0,.03],q=(s,r,t)=>[r*Math.cos(t),s,.03+r*Math.sin(t)];
 const v=study('e46-h7','H7 halogen bulb','The two headlamp bulbs have the same basic H7 construction. A single coil sits at a defined height above the locating flange.',R.head,[
 part('capsule','Quartz capsule','The long, narrow glass capsule encloses the filament. The dark tip blocks direct forward light.',[.46,.29,.05],r=>{
  const p=[[-.22,.12],[-.16,.147],[.32,.146],[.40,.137],[.463,.086],[.50,.022]];
  for(let k=1;k<p.length;k++)for(let i=0;i<30;i++){
    const t=TAU*i/30,b=t+TAU/30,a=p[k-1],n=p[k],poly=[q(...a,t),q(...a,b),q(...n,b),q(...n,t)];
    if(k>=4)r.polygon(poly,'#7d8781',false);else glazingFace(r,poly,'#b4c3c0',.24);
  }
 }),
 part('filament','Tungsten coil and supports','The coiled wire bridges two supports inside the capsule.',[-.41,.07,.32],r=>{
  let prior=q(.066,.018,0);
  for(let j=1;j<=80;j++){const t=j/80,next=q(.066+.130*t,.018,TAU*8*t);r.rod(prior,next,.005,'#ac9c7c',7);prior=next;}
  r.rod(q(-.211,.062,.1),q(.066,.018,0),.010,metal,8);r.rod(q(-.211,.068,2.65),q(.196,.018,0),.010,metal,8);
 }),
 part('flange','Locating flange and cap','The stamped metal flange seats the bulb against its mounting face.',[-.40,-.17,-.27],r=>{
  turn(r,o,axis,[[-.362,.133],[-.321,.133],[-.305,.170],[-.292,.248],[-.266,.246],[-.265,.15],[-.221,.141],[-.214,.103]],metal,{n:40});r.box(-.045,-.293,.265,.045,-.266,.336,metal);
 }),
 part('terminals','Two electrical blades','The insulated base carries the two flat power contacts.',[.33,-.48,-.34],r=>{
  cyl(r,o,axis,-.418,-.363,.132,black,32);
  for(const s of [-1,1])r.box(s*.065-.021,-.571,.021,s*.065+.021,-.419,.039,'#b7a483');
 })]);v.viewAngle=[-.51,.22];return v;
}
function indicatorOutline(fender,w,h){
 if(fender)return round(w,h,h*.36);
 // A 325Ci corner sweeps back and narrows toward the wing. The section is
 // deliberately handed, with the inboard edge against the headlamp.
 return [[-.49,-.45],[-.45,-.49],[.13,-.41],[.40,-.32],[.491,-.22],[.49,.05],[.35,.23],[.07,.39],[-.31,.48],[-.46,.47],[-.50,.37]].map(([u,v])=>[u*w,v*h]);
}
function signalDepth(x,w,fender){
 const t=Math.max(0,Math.min(1,.5+x/w));
 return fender?.032*(1-4*(t-.5)**2):.095-.251*t**1.65;
}
function signal(fender){
 const s=study('e46-'+(fender?'side-repeater':'front-indicator'),fender?'Fender side repeater':'Front corner indicator',
  fender?'The small lamp sits in the fender behind the wheel arch. The bulb holder enters from the back.':'The amber corner is a separate insert that wraps from the headlamp toward the fender. Its bayonet socket enters the back of the housing.',R.signal,[
  part('lens','Amber lens','Vertical prisms are molded into the amber window.',[0,.50,.24],r=>{
   const w=fender?.76:1.01,h=fender?.24:.56;
   const outline=indicatorOutline(fender,w,h);
   const shape=outline.map(([x,z])=>[x,.058+signalDepth(x,w,fender),z]);const roof=shape.map(([x,y,z])=>[x*.97,y+.055,z*.93]);
   loop(r,shape,roof,'#be8c4d');
   const at=(x,z)=>[x*.97,.113+signalDepth(x,w,fender),z*.93];
   const stations=[...new Set(outline.map(([x])=>x))].sort((a,b)=>a-b);
   const span=x=>{
     const zs=[];for(let i=0;i<outline.length;i++){const [a,z0]=outline[i],[b,z1]=outline[(i+1)%outline.length];if(a!==b&&x>=Math.min(a,b)-1e-8&&x<=Math.max(a,b)+1e-8)zs.push(z0+(z1-z0)*(x-a)/(b-a));}
     return [Math.min(...zs),Math.max(...zs)];
   };
   for(let j=1;j<stations.length;j++){
     const x=stations[j-1],b=stations[j],aZ=span(x),bZ=span(b);
     glazingFace(r,[at(x,aZ[0]),at(b,bZ[0]),at(b,bZ[1]),at(x,aZ[1])],'#e9a850',.58);
   }
   for(let j=-5;j<=5;j++){const x=j*w*.076,[lo,hi]=span(x),a=at(x,lo+.006),b=at(x,hi-.006);r.rod(a,b,.0032,'#ce9149',6);}
  }),
  part('housing','Lamp housing','The shell follows the curve of the lens and carries the socket at the rear.',[.34,-.30,-.24],r=>{
   const w=fender?.76:1.01,h=fender?.24:.56;
   const outline=indicatorOutline(fender,w,h),a=outline.map(([x,z])=>[x,.045+signalDepth(x,w,fender),z]);
   const b=a.map(([x,y,z])=>[x*.62,y-.221,z*.76]);loop(r,a,b,'#757d76');loop(r,b,b.map(([x,y,z])=>[x*.42,y,z*.59]),'#6d746e');
  }),
  part('bulb','Signal bulb','The glass envelope sits inside the reflector and amber cover.',[-.40,.18,.29],r=>turn(r,[0,-.058,0],axis,[[-.103,.042],[-.066,.059],[-.021,.058],[.012,.068],[.068,.083],[.112,.057],[.126,0]],'#d6ca9d',{n:28})),
  part('socket','Removable bulb holder','The holder locates the bulb and connects it to the wiring.',[.18,-.64,.09],r=>{sleeve(r,[0,-.225,0],axis,-.111,.067,.106,.064,black);r.box(-.068,-.416,-.04,.067,-.335,.041,'#444d4c');})
 ]);s.viewAngle=[-.48,.22];return s;
}
function fogLamp(){
 const s=study('e46-hb4-fog','Standard bumper fog lamp','The round lens faces the road through a separate opening in the lower bumper. An HB4 bulb seats in an offset rear housing supported by a bracket and grommet.',R.fog,[
 part('lens','Circular lens','The lens closes the front of the optical insert.',[0,.57,.16],r=>{const out=Array.from({length:44},(_,i)=>[.399*Math.cos(i*TAU/44),.399*Math.sin(i*TAU/44)]);lens(r,out,.074,.04);}),
 part('reflector','Lamp and reflector','The reflector opens toward the front glass. Its narrow rear opening receives the bulb.',[-.10,.04,.42],r=>turn(r,[0,0,0],axis,[[-.238,.086],[-.199,.13],[-.091,.23],[.009,.336],[.061,.397],[.083,.412]],metal,{n:42})),
 part('support','Support and grommet','The shaped bracket carries the lamp behind the bumper grille.',[.53,-.22,-.21],r=>{
  sleeve(r,[0,-.017,0],axis,-.03,.036,.436,.398,black,40);r.box(.33,-.041,-.156,.56,.026,.084,black);sleeve(r,[.531,0,.095],axis,-.052,.041,.083,.038,'#5c6661');
 }),
 part('bulb','HB4 55 W bulb','The halogen capsule and the keyed right-angle base form a single replaceable bulb.',[-.41,-.55,.03],r=>{
  turn(r,[0,-.197,0],axis,[[-.123,0],[-.121,.079],[-.107,.083],[-.087,.084],[-.075,.109],[-.061,.109],[-.054,.051],[.016,.042],[.137,.041],[.169,.022],[.170,0]],'#a5b1a3',{n:28});r.box(-.056,-.338,-.157,.059,-.257,.009,black);
 })
 ]);s.viewAngle=[-.66,.23];return s;
}
function rearLensPoint(trunk,u,v,base){
 // The trunk side of each quarter lamp slopes outward from bottom to top.
 // Beyond it, the outer lens turns toward the front along the rear wing.
 const w=trunk?.74:1.02;
 const lo=trunk?-.14-.14*u:-.278+.081*u**3,hi=trunk?.055+.202*u:.247-.100*u**5;
 const x=w*(u-.5)+(trunk?u:1-u)*(v-.5)*.146;
 return [x,base-(trunk?.027:.368)*u**3,lo+(hi-lo)*v];
}
function rearUnit(trunk){
 const v=study('e46-'+(trunk?'lid-lamp':'quarter-lamp'),trunk?'Trunk-lid lamp':'Quarter-panel lamp',
 trunk?'The small inboard lamp moves with the trunk. Its clear upper lens passes reversing light beside the red lower section.':'The stationary outer lamp follows the cut of the rear fender. Amber glazing covers its upper turn signal. Red glazing covers the tail and brake chambers.',R.rear,[
 part('lens','Molded lens','Horizontal prism lines run across the separate color bands.',[0,.57,.24],r=>{
  const stops=[0,.15,.32,.49,.65,.79,.90,1];
  for(let j=0;j<10;j++)for(let k=1;k<stops.length;k++){
    const t=j/10,b=(j+1)/10,low=stops[k-1],hi=stops[k],p=(u,v)=>rearLensPoint(trunk,u,v,.081);
    const band=[p(low,t),p(hi,t),p(hi,b),p(low,b)];
    glazingFace(r,band,j>=6?trunk?'#b9ccc6':amber:'#ad363b',j>=6?.67:.79);
    r.rod(band[0],band[1],.0024,j>=6?'#aaa99b':'#94343b',6);
  }
 }),
 part('shell','Reflector housing','The molded partitions keep light from one chamber out of the next.',[-.42,-.16,.29],r=>{
  const stops=[0,.19,.42,.67,.84,1],perimeter=[...stops.map(u=>[u,0]),...stops.slice().reverse().map(u=>[u,1])];
  const a=perimeter.map(([u,v])=>rearLensPoint(trunk,u,v,.061));
  const b=a.map(([x,y,z])=>[x*.87,y-.195,z*.84]);
  loop(r,a,b,'#81908e');r.polygon(b,'#687978',false);
  for(let k=1;k<stops.length;k++){
   const l=rearLensPoint(trunk,stops[k-1],.59,.049),h=rearLensPoint(trunk,stops[k],.59,.049);
   const back=([x,y,z])=>[x*.87,y-.167,z*.84];
   r.polygon([l,h,back(h),back(l)],'#b7c1b7',false);
  }
 }),
 part('holder','Rear bulb carrier','The removable carrier places the bulbs behind the separate lens chambers.',[.35,-.46,-.19],r=>{
  const w=trunk?.53:.74;r.profile([[-w*.5,-.18],[w*.45,-.14],[w*.5,.15],[-w*.43,.18]],-.198,-.148,'#505b5d');
  for(const u of trunk?[.052]:[-.199,.015,.214])sleeve(r,[u,-.146,u*.22],axis,-.012,.028,.073,.042,'#949b90',20);
 }),
 part('bulbs',trunk?'Reversing bulb':'Turn, tail and brake bulbs','Each filament sits in an individual socket on the carrier.',[.45,.16,.42],r=>{
  for(const u of trunk?[.052]:[-.199,.015,.214])r.instance('Socket '+(trunk?1:[-.199,.015,.214].indexOf(u)+1),()=>turn(r,[u,-.093,u*.22],axis,[[-.057,.043],[-.015,.043],[.009,.04],[.059,.069],[.102,.059],[.127,.034],[.132,0]],'#d0c5a6',{n:18}));
 })
 ]);v.viewAngle=[-.49,.23];return v;
}
export function getBmwLighting(vehicle,id){
 if(vehicle!=='bmw325ci')return null;
 switch(id){
 case 'lighting.headlamp':return headlamp();
 case 'e46-halogen-headlamp.bulbs':return h7();
 case 'lighting.indicator':return signal(false);
 case 'lighting.repeater':return signal(true);
 case 'lighting.fog':return fogLamp();
 case 'lighting.tail':return rearUnit(false);
 case 'lighting.reverse':return rearUnit(true);
 default:return null;
 }
}
