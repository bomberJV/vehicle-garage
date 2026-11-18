import {spoiler992} from './porsche992-skin.js';
import {spoiler996} from './porsche996-skin.js';
import {porscheDeckPoint,coupeShape} from './porsche-coachwork.js';
import {classicSpoiler} from './porsche993-body-profile.js';
// Separate lid-mounted drive and active spoiler studies. Travel is illustrative.
// Dimensions and positions use the car's coordinate frame in both levels.
import {study,part,turn} from './mechanism-shapes.js';
import {pipe,barrel} from './road-primitives.js';

const TAU=Math.PI*2, phaseTravel=phase=>(1-Math.cos(TAU*phase))*.5;
const sources={
  classic:{label:'Porsche PET · 993 rear spoiler drive, plate 803-15',url:'https://www.design911.co.uk/diagrams/d/40739/0/'},
  type996:{label:'Porsche PET · 996 rear spoiler, plate 803-007 (drive unit and electric motor)',url:'https://eurospares.co.uk/Porsche/996/996_(2001)/PartDiagrams/803-007/REAR_SPOILER'},
  new:{label:'Porsche · Carrera S Cabriolet active aerodynamics',url:'https://newsroom.porsche.com/dam/jcr%3A027b3198-602a-498d-b4fc-52e6e3b5261a/2020_911_Carrera_S_and_4S_Cabriolet_US_Press_Kit.pdf.PDF#page=10'},
  carrier:{label:'TECHART · original 992 motor, carrier and Hall sensor, figures 35–38',url:'https://www.techart.de/fileadmin/mediapoint/6b6d8f2a844669b49e8197fb041bf6f.pdf'}
};
const variants={
  // The 993's motor, gears and lift units are screwed to the underside of the
  // engine lid, the motor on the left (owners' forum descriptions; PET 803-15).
  // `lid` approximates that underside beside the blade recess: z = z0 - slope·(x - x0).
  porsche993cab:{id:'993spoiler',modern:false,front:classicSpoiler.front,rear:classicSpoiler.rear,zc:.948,w:.54,mount:.47,base:.673,source:sources.classic,
    lid:{x0:1.38,z0:.818,slope:.30,motor:[1.44,-.40]}},
  porsche992scab:{id:'992spoiler',modern:true,shape:1,front:spoiler992.front,rear:spoiler992.rear,zc:.905,w:.715,mount:.435,base:.69,source:sources.new},
  // The 996 lid lifts its louvred section on two arms, driven like the 993's by
  // one motor and flexible shafts; the blade follows the lofted 996 lid.
  porsche996cab:{id:'996spoiler',modern:false,shape:2,front:spoiler996.front,rear:spoiler996.rear,zc:.918,w:.45,mount:.300,base:.700,source:sources.type996,
    tilt:.22,advance:.020,rise:.075}
};
const lidUnder=(g,x)=>g.lid.z0-(x-g.lid.x0)*g.lid.slope;
const model=modern=>modern==='996'?variants.porsche996cab:modern?variants.porsche992scab:variants.porsche993cab;
// The lofted lid that the blade sits in; the 993 blade uses its own analytic surface.
const skinOf=g=>g.shape===undefined?null:coupeShape[g.shape];
export function spoilerPoint(modern,p,phase){
  const g=model(modern),t=phaseTravel(phase),x=p[0]-g.front,z=p[2]-g.zc;
  const angle=t*(g.tilt??(modern?.24:.30)),advance=t*(g.advance??(modern?.035:.013)),rise=t*(g.rise??(modern?.112:.060));
  return [g.front+x*Math.cos(angle)-z*Math.sin(angle)+advance,p[1],g.zc+z*Math.cos(angle)+x*Math.sin(angle)+rise];
}
function mounting(g,s,phase,forward){
  const x=g.front+(g.rear-g.front)*(forward?.22:.74),y=s*g.mount,z=g.zc-(x-g.front)*(g.modern?.270:.29);
  // Leave the pin and its bracket beneath the skin even at the sloping rear edge.
  const skin=skinOf(g)?porscheDeckPoint(skinOf(g),x,y):[x,y,z];
  const end=spoilerPoint(g.shape===2?'996':g.modern,[skin[0],y,skin[2]-(g.modern?.031:.052)],phase);
  const bx=skin[0]-(forward?.085:.110),base=[bx,y,g.lid?lidUnder(g,bx)-.035:g.base-.035];
  return {base,end};
}
function carrier(r,g){
  if(g.lid){
    // A pad under the lid at each pivot, rather than a carrier across the engine.
    for(const s of [-1,1])for(const forward of [true,false]){
      const {base}=mounting(g,s,0,forward),top=lidUnder(g,base[0]);
      r.box(base[0]-.04,s*g.mount-.035,top-.022,base[0]+.04,s*g.mount+.035,top,'#69757b');
      for(const d of [-.025,.025])barrel(r,[base[0]+d,s*g.mount,top-.02],[base[0]+d,s*g.mount,top+.002],.008,'#a0a9aa',8);
    }
    return;
  }
  const x=g.front+(g.modern?.050:.22);
  for(const s of [-1,1]){
    r.box(x-.154,s*g.mount-.042,g.base-.032,x+.138,s*g.mount+.042,g.base,'#69757b');
    for(const d of [-.105,.075])barrel(r,[x+d,s*g.mount,g.base-.026],[x+d,s*g.mount,g.base+.003],.015,'#a0a9aa',8);
  }
  r.box(x-.032,-g.mount,g.base-.043,x+.023,g.mount,g.base-.017,'#53616a');
}
function lift(r,g,phase,s){
  for(const forward of [true,false]){
    const {base,end}=mounting(g,s,phase,forward);
    const joint=[base[0]-.014,s*(g.mount+.011),base[2]+(end[2]-base[2])*.48];
    pipe(r,[base,joint,end],forward?.012:.016,'#718089',8);
    for(const p of [base,end])barrel(r,[p[0],p[1]-.023,p[2]],[p[0],p[1]+.023,p[2]],.016,'#adb3b4',10);
  }
}
function motor(r,g){
  if(g.lid){
    const [x,y]=g.lid.motor,z=lidUnder(g,x)-.045;
    barrel(r,[x,y-.106,z],[x,y+.029,z],.036,'#85959b',16);
    r.box(x-.04,y+.023,z-.034,x+.022,y+.081,z+.034,'#5a6468');
    return;
  }
  const x=g.front+(g.modern?.070:.24),y=g.modern?.115:-.258,z=g.base-.033;
  barrel(r,[x-.03,y-.106,z],[x-.03,y+.029,z],.038,g.modern?'#454b4c':'#85959b',16);
  r.box(x-.063,y+.023,z-.036,x+.022,y+.081,z+.037,'#5a6468');
  r.box(x-.063,y-.088,z+.010,x-.038,y-.054,z+.051,'#3a474e');
}
function transmission(r,g){
  if(g.lid){
    // Flexible shafts from the motor gearbox to a reduction box at each lift
    // unit. Across the car the shaft follows the crowned lid above the intake.
    const [mx,my]=g.lid.motor,x=mx-.02,z=lidUnder(g,x),at=(y,h)=>[x,y,h];
    pipe(r,[at(my+.07,z-.03),at(-.20,z+.007),at(0,z+.022),at(.20,z+.007),at(.40,z-.03)],.009,'#393c3d',8);
    for(const s of [-1,1]){
      const b=mounting(g,s,0,true).base;
      const ys=[s*(g.mount-.075),s*(g.mount-.035)].sort((u,v)=>u-v);
      r.box(b[0]-.03,ys[0],z-.06,b[0]+.035,ys[1],z-.012,'#77858a');
    }
    return;
  }
  const x=g.front+(g.modern?.058:.228),z=g.base-.012;
  if(g.modern){
    barrel(r,[x,-g.mount,z],[x,g.mount,z],.010,'#899ba4',10);
    for(const s of [-1,1])r.box(x-.034,s*g.mount-.024,z-.012,x+.039,s*g.mount+.024,z+.035,'#505b60');
  }else{
    pipe(r,[[x+.007,-.172,z-.016],[x+.04,-.096,z-.033],[x+.066,.006,z-.035],[x+.060,.14,z-.018],[x+.038,.249,z]],.009,'#393c3d',8);
    r.box(x-.011,.244,z-.027,x+.075,.319,z+.037,'#77858a');
    barrel(r,[x+.04,-g.mount,z+.016],[x+.04,g.mount,z+.016],.011,'#748288',10);
  }
}
function feedback(r,g){
  if(g.lid){
    const [mx,my]=g.lid.motor,x=mx+.07,y=my+.04,z=lidUnder(g,x)-.02;
    r.box(x-.025,y-.014,z-.013,x+.025,y+.018,z+.018,'#333c40');
    pipe(r,[[x-.021,y,z+.016],[x-.043,y,z+.012],[x-.06,y+.03,z+.012]],.005,'#b6b6a5',5);
    return;
  }
  const x=g.front+(g.modern?.130:.30),y=g.modern?.257:.305,z=g.base+.001;
  r.box(x-.025,y-.014,z-.013,x+.025,y+.018,z+.018,'#333c40');
  if(!g.modern)pipe(r,[[x-.021,y,z+.016],[x-.043,y,z+.022],[x-.048,y,z+.042]],.005,'#b6b6a5',5);
  pipe(r,[[x+.02,y,z],[x+.05,y,z-.016],[x+.035,y-.063,z-.037]],.005,'#485359',6);
}
function closing(r,g,phase){
  const t=phaseTravel(phase),x=g.front+.034;
  for(let j=0;j<2;j++){
    const a=-g.w*.79+g.w*.79*j,b=a+g.w*.79;
    const p=(y,u)=>{
      const surface=skinOf(g)?porscheDeckPoint(skinOf(g),x,y):[x,y,g.zc];
      const low=surface[2]-.061,edge=spoilerPoint(g.shape===2?'996':g.modern,[surface[0],y,surface[2]-.021],phase);
      return [surface[0]+(edge[0]-surface[0])*u-.025*(1-u)*t,y,low+(edge[2]-low)*u];
    };
    if(g.modern){r.polygon([p(a,0),p(b,0),p(b,1),p(a,1)],'#51565a',false);}
    else for(let i=0;i<5;i++){
      const q=(y,k)=>{const v=p(y,k/5);v[0]-=(k%2)*.011;return v;};
      r.polygon([q(a,i),q(b,i),q(b,i+1),q(a,i+1)],i%2?'#4b4c4d':'#303437',false);
    }
  }
}
function spoilerStopLamp(r,g,phase){
  // The primary stop lamp sits between the intake louvers. This second lamp
  // faces rearward from the lower edge of the blade when the spoiler rises.
  const rail=(y,along,down)=>{
    const p=porscheDeckPoint(coupeShape[1],g.rear-.005+along,y);
    return spoilerPoint(true,[p[0],p[1],p[2]-down],phase);
  };
  for(let i=0;i<12;i++){
    const a=-.175+i*.35/12,b=a+.35/12;
    r.polygon([rail(a,0,.008),rail(b,0,.008),rail(b,0,.024),rail(a,0,.024)],'#30363b',false);
    r.polygon([rail(a,.0015,.011),rail(b,.0015,.011),rail(b,.0015,.021),rail(a,.0015,.021)],'#a63d44',false);
  }
}
export function drawSpoilerDrive(r,modern,phase=0){
  const g=model(modern);
  if(g.modern)r.tag('shell.spoiler',()=>spoilerStopLamp(r,g,phase));
  r.tag('shell.spoiler-drive',()=>{carrier(r,g);motor(r,g);transmission(r,g);feedback(r,g);for(const s of [-1,1])lift(r,g,phase,s);closing(r,g,phase);});
}
function blade(r,g,phase){
  if(g.modern)spoilerStopLamp(r,g,phase);
  for(let i=0;i<7;i++)for(let j=0;j<14;j++){
    const p=(a,b)=>{const u=a/7,v=b/7-1,x=g.front+(g.rear-g.front)*u,w=g.w*(.85+.15*Math.sin(Math.PI*u));
      const skin=skinOf(g)?porscheDeckPoint(skinOf(g),x,v*w):[x,v*w,g.zc-u*.159+.02*(1-v*v)];
      return spoilerPoint(g.shape===2?'996':g.modern,skin,phase);};
    const col=g.modern?'#8397a1':(i%2?'#647177':'#949e9e');
    r.polygon([p(i,j),p(i+1,j),p(i+1,j+1),p(i,j+1)],col,false);
  }
  if(!g.modern)for(let t=1;t<11;t++){
    const x=g.front+.062+t*.038*(g.rear-g.front)/.48,u=(x-g.front)/(g.rear-g.front);
    const p=y=>{
      if(skinOf(g)){const q=porscheDeckPoint(skinOf(g),x,y);return spoilerPoint('996',[q[0],q[1],q[2]+.004],phase);}
      return spoilerPoint(false,[x,y,g.zc-.159*u+.025-.016*(y/g.w)**2],phase);
    };
    pipe(r,[p(-.42),p(0),p(.42)],.007,'#323a3c',5);
  }
}
function assembly(g){
  const id=g.id,modern=g.modern;
  const detail=study(id,modern?'Adaptive rear spoiler and carrier':'Retractable grille and spoiler drive',
    modern?'The wide painted blade rises behind the fixed engine grating. The links change its height and angle. A second panel closes the leading edge as it rises.':'The grille in the rear lid moves with the spoiler. Beneath it a geared motor and flexible drive power the lift mechanism. The pleated wall opens with the moving grille.',
    g.source,[
      part('blade',modern?'Adjustable spoiler blade':'Moving grille and spoiler panel',modern?'The panel sits flush when parked. As it rises, a second brake light becomes visible beneath its trailing edge.':'The upper panel sits flush when parked. Its trailing edge rises farther than its leading edge.',[.08,0,.33],(r,p)=>blade(r,g,p)),
      part('carrier','Fixed carrier and mounting pads','The support carries the motor and lift pivots beneath the moving panel.',[0,0,-.22],r=>carrier(r,g)),
      part('motor','Electric drive motor','Open the housing study to see the energy path from the stationary field to the rotating shaft.',[0,-.27,-.07],r=>motor(r,g)),
      part('output',modern?'Drive shaft and coupling':'Flexible drive and transmission',modern?'The motor feeds the linkage through the drive unit on the carrier. The drawing simplifies the enclosed transmission.':'The flexible shaft takes rotary drive from the geared motor to the separate spoiler transmission.',[0,.24,-.06],r=>transmission(r,g)),
      part('left','Left lift linkage','The linkage connects a fixed pivot to a moving bracket under the blade. Open it to inspect the pin and bearing surfaces.',[0,-.22,.11],(r,p)=>lift(r,g,p,-1)),
      part('right','Right lift linkage','The opposite support keeps the blade aligned across the body.',[0,.22,.11],(r,p)=>lift(r,g,p,1)),
      part('sensor',modern?'Hall sensor and harness':'Position microswitch and lever',modern?'The Hall sensor and its lead mount beside the drive in the rear carrier.':'The microswitch registers a position through a mechanical lever.',[.19,.14,-.08],r=>feedback(r,g)),
      part('closure',modern?'Leading-edge closing panel':'Pleated spoiler wall',modern?'This articulated panel bridges the leading edge when the spoiler extends.':'The flexible pleated wall follows the changing opening below the grille.',[-.20,0,.12],(r,p)=>closing(r,g,p))
    ],'Follow both lift arms as the carrier stays fixed and the panel moves from flush to raised. Travel, link lengths and timing are illustrative.');
  detail.viewAngle=[1.06,.32];return detail;
}
function motorStudy(g){
  const id=g.id+'-motor',axis=[0,1,0],origin=[0,0,0];
  const spin=(r,phase)=>{
    turn(r,origin,axis,[[-.29,0],[-.29,.075],[-.255,.17],[.15,.17],[.19,.07],[.19,0]],'#73858c',{n:18});
    for(let i=0;i<8;i++){
      const a=i*TAU/8+phase*TAU,b=a+.39,pt=(t,y)=>[.171*Math.cos(t),y,.171*Math.sin(t)];
      r.polygon([pt(a,-.18),pt(b,-.2),pt(b+.35,.135),pt(a+.35,.143)],'#a27d55',false);
    }
  };
  return study(id,'Spoiler motor cutaway','The motor is drawn in section to show how a stationary magnetic field acts on a rotor and output shaft. Internal winding layout and dimensions are representative.',g.modern?sources.carrier:g.source,[
    part('case','Open motor housing','A section removed from the cylindrical shell exposes the stationary and rotating parts.',[0,-.58,0],r=>turn(r,origin,axis,[[-.32,.22],[-.32,.251],[.24,.251],[.24,.22],[-.32,.22]],'#929ca0',{start:.10,sweep:Math.PI*1.39,n:26})),
    part('field','Stationary field assembly','The field remains fixed to the housing while the rotor turns.',[.40,0,0],r=>turn(r,origin,axis,[[-.22,.183],[-.22,.218],[.17,.218],[.17,.183],[-.22,.183]],'#6d7272',{start:.31,sweep:Math.PI*1.07,n:18})),
    part('rotor','Rotor and windings','The rotor carries the rotating magnetic assembly. Its mechanical output leaves through the shaft.',[0,.42,.09],spin),
    part('shaft','Output shaft and bearing','The shaft is supported at the end of the motor and feeds the reduction or drive assembly.',[0,.69,-.12],r=>turn(r,origin,axis,[[-.36,0],[-.36,.035],[.335,.035],[.335,.061],[.378,.061],[.378,.035],[.46,.035],[.46,0]],'#a7b2b7',{n:18})),
    part('plug','Electrical connector','The motor terminals meet the body wiring at the connector.',[-.38,0,.23],r=>{r.box(-.08,-.35,.12,.08,-.27,.27,'#404747');for(const x of [-.035,.035])r.box(x-.009,-.39,.183,x+.009,-.32,.215,'#a79670');})
  ],'Watch the marked rotor turn inside the stationary field. This cutaway shows the operating principle.');
}
function pivotStudy(g){
  return study(g.id+'-pivot','Spoiler linkage pivot','The link rotates about the pin held between the two cheeks of the bracket. The geometry is enlarged to show how the joint moves.',g.source,[
    part('bracket','Fork bracket','Two lugs support the pin and leave a space for the moving link.',[0,0,-.45],r=>{r.box(-.18,-.21,-.27,.18,.21,-.22,'#758991');for(const s of [-1,1]){const y=s*.16;r.box(-.11,y-.025,-.23,.11,y+.025,0,'#89999f');turn(r,[0,y,0],[0,1,0],[[-.026,.044],[-.026,.112],[.026,.112],[.026,.044],[-.026,.044]],'#83949b',{n:18});}}),
    part('link','Link eye and arm','The moving arm pivots around the bushing. The span of the arm carries motion to the upper bracket.',[.38,0,.12],(r,p)=>{const a=.32+phaseTravel(p)*.75;turn(r,[0,0,0],[0,1,0],[[-.072,.045],[-.072,.098],[.072,.098],[.072,.045],[-.072,.045]],'#7e8f96',{n:18});barrel(r,[.083*Math.cos(a),0,.083*Math.sin(a)],[.40*Math.cos(a),0,.40*Math.sin(a)],.040,'#7e8f96',10);}),
    part('bush','Bushing','The bushing provides the bearing surface between the link eye and the pin.',[0,.48,.035],r=>turn(r,[0,0,0],[0,1,0],[[-.074,.026],[-.074,.043],[.074,.043],[.074,.026],[-.074,.026]],'#c1a784',{n:22})),
    part('pin','Pivot pin','The pin spans the bracket and locates the link.',[0,-.57,.02],r=>turn(r,[0,0,0],[0,1,0],[[-.22,0],[-.22,.042],[-.20,.042],[-.20,.025],[.20,.025],[.20,0]],'#b4bdbf',{n:20}))
  ],'The bracket holds the pin while the arm changes angle.');
}
const tables=new Map();
export function getPorscheSpoilerDetail(vehicle,partId){
  const g=variants[vehicle];if(!g)return null;
  let key;
  if(['shell.spoiler','shell.spoiler-drive'].includes(partId))key='spoiler';
  if(partId===g.id+'.motor')key='motor';
  if([g.id+'.left',g.id+'.right'].includes(partId))key='pivot';
  if(!key)return null;
  const id=g.id+'/'+key;
  if(!tables.has(id))tables.set(id,(key==='spoiler'?assembly:key==='motor'?motorStudy:pivotStudy)(g));
  return tables.get(id);
}
