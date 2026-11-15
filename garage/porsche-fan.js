// The fan hub and the alternator shaft have separate drives in the Carrera 993.
// The two narrow belts occupy different planes on the same pair of shaft axes.
import {turn,study,part} from './mechanism-shapes.js';
import {barrel,strip} from './road-primitives.js';

const TAU=2*Math.PI,X=[1,0,0],upper=[0,0,.26],lower=[0,0,-.37];
export const fanCatalog={label:'Porsche PET · 1998 993, air cooling, plate 105-00',url:'https://www.design911.com/uploads/global/gallery/911-993_1994-1998.pdf'};
const ring=(r,center,x0,x1,outer,inner,color,n=28)=>turn(r,center,X,[[x0,inner],[x0,outer],[x1,outer],[x1,inner],[x0,inner]],color,{n});
const disc=(r,center,x0,x1,radius,color,n=26)=>turn(r,center,X,[[x0,0],[x0,radius],[x1,radius],[x1,0]],color,{n});
const polar=(c,x,r,a)=>[c[0]+x,c[1]+r*Math.cos(a),c[2]+r*Math.sin(a)];
function impeller(r,c,scale,phase,detail){
  const span=detail?5:2,across=detail?3:1;
  for(let i=0;i<12;i++){
    const base=i*TAU/12+phase*TAU;
    const blade=(q,v)=>{
      const radius=scale*(.35+.65*q),angle=base+.41*q*q+(v-.5)*(.24+.12*q);
      return polar(c,scale*(.12*(1-q)+(.20-.07*q)*(v-.5)),radius,angle);
    };
    for(let j=0;j<span;j++)for(let k=0;k<across;k++){
      const a=j/span,b=(j+1)/span,u=k/across,v=(k+1)/across;
      r.polygon([blade(a,u),blade(b,u),blade(b,v),blade(a,v)],['#8e9b9e','#a5afb0','#bac0bb'][detail?k:(i%3)],false);
    }
  }
}
function pulley(r,c,x0,rad,phase){
  turn(r,c,X,[[x0-.023,.031],[x0-.023,rad],[x0-.013,rad],[x0,rad-.014],[x0+.013,rad],[x0+.023,rad],[x0+.023,.031]],'#79858a',{n:30});
  for(let i=0;i<3;i++){
    const a=i*TAU/3+phase*TAU,p=polar(c,x0+.025,rad*.63,a);
    barrel(r,p,[p[0]+.008,p[1],p[2]],.010,'#bdc1bb',6);
  }
}
// The two straight tangent spans connect circular arcs without crossing, even
// though the driving and driven pulley diameters differ.
function makeBeltPath(x,topR,baseR){
  const alpha=Math.acos((baseR-topR)/(upper[2]-lower[2])),rows=[];
  const arc=(c,r,a,b)=>{
    for(let i=0;i<=20;i++)rows.push(polar(c,x,r,Math.PI/2+a+(b-a)*i/20));
  };
  arc(upper,topR,-alpha,alpha);arc(lower,baseR,alpha,TAU-alpha);
  rows.push(rows[0]);
  const cumulative=[0];
  for(let i=1;i<rows.length;i++)cumulative.push(cumulative[i-1]+Math.hypot(...rows[i].map((v,j)=>v-rows[i-1][j])));
  return {rows,cumulative};
}
function belt(r,x,topR,phase){
  const {rows,cumulative}=makeBeltPath(x,topR,.145),width=.015;
  const a=rows.map(([px,y,z])=>[px-width,y,z]),b=rows.map(([px,y,z])=>[px+width,y,z]);strip(r,a,b,'#3c4244');
  // A contrasting witness on each outside surface makes its travel visible.
  const total=cumulative.at(-1);
  for(let mark=0;mark<3;mark++){
    const distance=((phase+mark/3)%1)*total;
    const i=cumulative.findIndex(v=>v>distance),p=rows[i-1],q=rows[i];
    const f=(distance-cumulative[i-1])/(cumulative[i]-cumulative[i-1]);
    const v=p.map((a,j)=>a+(q[j]-a)*f);
    barrel(r,[x-width*1.1,v[1],v[2]],[x+width*1.1,v[1],v[2]],.0045,'#a29673',6);
  }
}
function assembly(){
  const view=study('993fan','Fan, alternator and belt drive','Behind the fan is the alternator. The crank pulley feeds two belts. One drives the cooling impeller on its hub bearing and the other drives the alternator shaft.',fanCatalog,[
    part('housing','Fan housing and retaining strap','The circular housing locates the assembly above the crankcase. The strap clamps around it.',[-.55,0,.20],r=>{
      ring(r,upper,-.16,.038,.398,.370,'#787f7d',36);
      turn(r,upper,X,[[-.086,.399],[-.086,.409],[-.046,.409],[-.046,.399]],'#bac1bc',{n:36});
      r.box(-.090,-.043,.646,-.041,.036,.684,'#959e99');
    }),
    part('wheel','Curved-blade cooling impeller','Air enters the face of the upright fan and travels into the shroud above the finned heads and cylinders.',[.40,0,.16],(r,t)=>{
      impeller(r,upper,.360,2*t,true);disc(r,upper,-.036,.057,.129,'#8b9291');
    }),
    part('hub','Fan hub and bearing','The bearing supports the impeller around the alternator shaft. It lets the two driven components turn independently.',[.49,0,-.15],r=>{
      ring(r,upper,-.066,.097,.089,.038,'#a1adae');ring(r,upper,.09,.114,.059,.029,'#797e78');
    }),
    part('fanpulley','Fan pulley halves and shims','The opposed pulley halves form a groove for the fan belt. The shim stack sets the spacing of the halves.',[.62,.14,.1],(r,t)=>{
      pulley(r,upper,.119,.109,2*t);ring(r,upper,.102,.105,.074,.037,'#bdc2b6');
    }),
    part('genpulley','Alternator pulley','The second pulley sits farther out on the shaft. Its own belt connects it to the crank pulley.',[.66,-.18,.06],(r,t)=>pulley(r,upper,.185,.086,3*t)),
    part('fanbelt','Fan V-belt','The inner belt follows the fan pulley and its corresponding crankshaft groove.',[0,.49,.02],(r,t)=>belt(r,.119,.109,t)),
    part('genbelt','Alternator V-belt','The next belt follows a separate path to the alternator pulley.',[.08,-.47,.02],(r,t)=>belt(r,.185,.086,t)),
    part('crank','Crank pulley and belt grooves','The lower pulley turns with the crankshaft and supplies both drives.',[0,0,-.5],(r,t)=>{
      pulley(r,lower,.119,.145,t);pulley(r,lower,.185,.145,t);disc(r,lower,.085,.215,.038,'#a7afaa');
    }),
    part('alternator','Alternator and shaft','The alternator body stays in the housing while the shaft and field rotor turn. Open it to see the stationary windings.',[-.62,.10,-.12],r=>{
      turn(r,upper,X,[[-.36,0],[-.36,.105],[-.31,.151],[-.17,.151],[-.125,.12],[-.125,0]],'#7d888b',{n:28});
      disc(r,upper,-.24,.224,.028,'#bdc3bd',18);
      for(let i=0;i<9;i++){const a=i*TAU/9,p=polar(upper,-.298,.151,a),q=polar(upper,-.201,.151,a+.05);barrel(r,p,q,.009,'#333c40',7);}
    })
  ],'Follow the witness marks along the two belts and watch the rotor and fan turn about the same axis. Motion is slowed and pulley ratios are illustrative.');
  view.viewAngle=[1.18,.22];return view;
}
function alternatorStudy(){
  const center=[0,0,0];
  const view=study('993generator','Alternator section','The belt turns the field rotor inside the stationary stator. The output passes through a rectifier to supply the car’s DC electrical system. The section illustrates the charging principle.',fanCatalog,[
    part('shell','Vented end housing','The cast frame holds the stator and supports the rotor bearings.',[-.49,0,.06],r=>turn(r,center,X,[[-.24,.222],[-.24,.248],[.22,.248],[.22,.221],[-.24,.222]],'#818e90',{start:.22,sweep:Math.PI*1.37,n:27})),
    part('stator','Stator and copper windings','The rotating field induces alternating current in these stationary windings.',[0,.49,0],r=>{
      turn(r,center,X,[[-.17,.178],[-.17,.213],[.17,.213],[.17,.178],[-.17,.178]],'#777c7f',{start:.28,sweep:Math.PI*1.28,n:26});
      for(let i=0;i<10;i++){const a=.48+i*.35;barrel(r,polar(center,-.182,.192,a),polar(center,.177,.192,a+.08),.012,'#b6845b',8);}
    }),
    part('rotor','Claw-pole rotor and shaft','Current through the rotor winding sets up the field. The alternating pole fingers sweep past the stator as the shaft rotates.',[.50,-.14,0],(r,t)=>{
      disc(r,center,-.31,.405,.029,'#afb8b5',18);disc(r,center,-.128,.14,.128,'#a17a54',24);
      for(let i=0;i<12;i++){const a=i*TAU/12+t*TAU,sign=i%2?1:-1;
        r.polygon([polar(center,sign*.16,.164,a-.21),polar(center,sign*.16,.164,a+.21),polar(center,-sign*.10,.160,a+.046)],'#919b9f',false);
      }
    }),
    part('rings','Slip rings and brushes','Brushes contact the rotating slip rings to carry field current into the rotor.',[.15,-.42,.08],r=>{
      for(const p of [-.245,-.202]){ring(r,center,p,p+.024,.056,.030,'#ac8056',22);r.box(p,-.013,.057,p+.026,.013,.11,'#393f40');}
    }),
    part('rectifier','Rectifier and heat sink','The diode bridge rectifies the stator output. The heat sink conducts heat away from the rectifier.',[-.43,0,-.28],r=>{
      turn(r,center,X,[[-.281,.075],[-.281,.195],[-.255,.195],[-.255,.075]],'#9aa2a1',{start:.26,sweep:Math.PI*1.5,n:25});
      for(let i=0;i<6;i++){const a=.52+i*.69,p=polar(center,-.29,.14,a);barrel(r,p,[p[0]-.018,p[1],p[2]],.020,'#464c4b',10);}
    })
  ],'The shaft and pole fingers rotate inside the stationary windings. The exposed section and component proportions are representative.');
  view.viewAngle=[.92,.36];return view;
}
function pulleyStudy(){
  const center=[0,0,0];
  const view=study('993fanpulley','Fan pulley and shim stack','The two pressed halves form a V-shaped groove. A packet of thin shims separates their center faces. The cutaway shows where the belt seats against the flanks.',fanCatalog,[
    part('inner','Inner pulley half','The inner half of the groove faces the engine. Its sloped surface bears on one flank of the V-belt.',[-.49,0,0],r=>turn(r,center,X,[[-.048,.047],[-.048,.104],[-.105,.222],[-.087,.226],[-.029,.108],[-.029,.047]],'#7b888b',{n:32})),
    part('outer','Outer pulley half','The outer half presents the opposing belt flank. Its central flange clamps against the shims.',[.49,0,0],r=>turn(r,center,X,[[.029,.047],[.029,.108],[.087,.226],[.105,.222],[.048,.104],[.048,.047]],'#a0acaa',{n:32})),
    part('shims','Spacing shims','Changing how the shim pack is distributed changes the pulley spacing and effective belt radius. The illustrated shim count is schematic.',[0,.48,.03],r=>{for(const axial of [-.015,0,.015])ring(r,center,axial-.004,axial+.004,.101,.048,'#b4b8aa',26);}),
    part('belt','V-belt cross section','The belt sides contact the angled metal flanks. The cut ends expose its trapezoidal section.',[0,0,.53],r=>turn(r,center,X,[[-.039,.180],[-.063,.212],[.063,.212],[.039,.180],[-.039,.180]],'#495052',{start:.63,sweep:Math.PI*.68,n:14})),
    part('fasteners','Three pulley screws','The screws secure the pulley halves and shim pack to the fan hub.',[.24,-.40,.18],r=>{
      for(let i=0;i<3;i++){const a=i*TAU/3,c=polar(center,0,.081,a);disc(r,c,-.073,.080,.009,'#909d9d',10);disc(r,c,.073,.095,.019,'#b4bfba',6);}
    })
  ]);view.viewAngle=[.90,.28];return view;
}
const main=assembly(),generator=alternatorStudy(),pulleyParts=pulleyStudy();
export function get993Fan(partId){
  if(partId==='engine.cooling')return main;
  if(partId==='993fan.alternator')return generator;
  if(partId==='993fan.fanpulley')return pulleyParts;
  return null;
}

export function draw993CoolingFan(r,center){
  const [x,y,z]=center,crank=[x,y,z-.202],radius=.137;
  r.tag('engine.cooling',()=>{
    r.discX(x-.015,y,z,radius,'#424a4c',28);
    const aperture=[],lip=[];
    for(let i=0;i<=24;i++){const a=i*TAU/24;aperture.push(polar(center,0,radius,a));lip.push(polar(center,0,radius+.008,a));}
    strip(r,aperture,lip,'#a9b3b1');impeller(r,center,radius*.98,0,false);
    r.discX(x+.012,y,z,.048,'#7e8988',18);
    for(const [depth,topR] of [[.022,.042],[.038,.033]]){
      r.discX(x+depth,y,z,topR,'#a7aeaa',18);
      r.discX(x+depth,y,crank[2],.048,'#797f80',18);
      for(const side of [-1,1]){
        const a=[x+depth,y+side*topR,z],b=[x+depth,y+side*.048,crank[2]];
        strip(r,[a,b],[a,b].map(([xx,yy,zz])=>[xx+.005,yy,zz]),'#34393a');
      }
    }
  });
}
