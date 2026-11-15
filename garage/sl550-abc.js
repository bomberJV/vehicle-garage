// R231 code 487. The Mercedes plates identify the ports, strut ends and tank
// internals. The concealed hydraulic runs are routed between those fittings.
import {barrel,pipe} from './road-primitives.js';
import {basis,point,turn,sleeve,cyl,part,study,TAU,x,y,z} from './mechanism-shapes.js';

const catalog='https://mbparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/springs-suspension-and-hydraulics--';
export const hydraulicPlates={
  valves:{label:'Mercedes-Benz USA · oil tank, filter, front and rear valve units',url:catalog+'oil-tank-and-valves-used-for-quot-abcandreg-quot-hydraulic-system'},
  abcLines:{label:'Mercedes-Benz USA · ABC lines and return-oil cooler',url:catalog+'line-arrangement-of-hydraulic-system'},
  abcStruts:{label:'Mercedes-Benz · 2014 SL550 front and rear ABC strut plates',url:'https://www.mbpartsgiant.com/parts-list/2014-mercedes_benz-sl550/suspension/struts-components'}
};
const metal='#9ea8a7',alloy='#717b7c',rubber='#353a38',tankGreen='#46544c',steel='#8e9589';
const front=-1.2925,rear=1.2925;
const tank=[-1.192,-.522,.51], suction=[-1.252,-.529,.545],tankReturn=[-1.243,-.548,.580];
const pumpIn=[-1.401,.175,.472],pumpOut=[-1.412,.186,.442];
const frontFeed=[front-.042,-.480,.339],rearFeed=[rear-.044,-.487,.329], frontReturn=[front-.045,-.492,.358], rearReturn=[rear-.046,-.503,.355];
const coolerIn=[-1.941,-.393,.489],coolerOut=[-1.940,-.393,.513];
const positiveLine=[pumpOut,[-1.511,.187,.429],[-1.540,.123,.276],[-1.536,-.348,.261],[-1.39,-.476,.305],frontFeed];
const strutIn=(axle,s)=>[axle+.014,s*.658,.566];

function tankShell(r,center,open=false){
  // Stepped moulded shell with a wide top flange, an offset filter mouth and
  // a small parallel dipstick opening, as on the R231 reservoir drawing.
  const pt=(a,b,c)=>center.map((v,i)=>v+[a,b,c][i]);
  const profile=[[-.068,-.047],[-.066,.050],[-.040,.063],[.061,.050],[.069,.014],[.048,-.055]];
  const ring=(h,scale)=>profile.map(([a,b])=>pt(a*scale,b*scale,h));
  const levels=[[0,.61],[.024,.73],[.107,1],[.116,1.05],[.121,1.05]];
  for(let i=1;i<levels.length;i++){
    const lo=ring(...levels[i-1]),hi=ring(...levels[i]);
    for(let j=0;j<lo.length;j++)if(!open||j!==3&&j!==4)r.polygon([lo[j],lo[(j+1)%lo.length],hi[(j+1)%lo.length],hi[j]],i>2?alloy:tankGreen,false);
  }
  r.polygon(ring(0,.61),tankGreen,false);
  if(!open)r.polygon(ring(.121,1.05),tankGreen,false);
  sleeve(r,pt(-.018,0,.123),z,-.002,.008,.033,.026,alloy,14);
  sleeve(r,pt(.045,.021,.124),z,0,.010,.011,.005,alloy,9);
}
function filter(r,c){
  cyl(r,c,z,.026,.117,.023,'#87927c',14);
  for(let i=0;i<12;i++){
    const t=TAU*i/12,px=c[0]+.022*Math.cos(t),py=c[1]+.022*Math.sin(t);
    barrel(r,[px,py,c[2]+.027],[px,py,c[2]+.115],.0023,alloy,5);
  }
  for(const h of [.024,.114])cyl(r,c,z,h,h+.006,.026,rubber,14);
}
function tankStudy(){
  return study('sl-abc-reservoir','Hydraulic oil reservoir and filter','Lift the filter and its retaining spring out of the large opening. The narrow opening beside it takes the dipstick.',hydraulicPlates.valves,[
    part('shell','Cutaway fluid tank','The step in the moulded tank leaves room for the filter. Suction and return hoses connect at the side.',[0,0,-.06],r=>tankShell(r,[0,0,0],true)),
    part('filter','Pleated return filter','The cylindrical element traps particles from returning hydraulic oil.',[-.045,-.025,.07],r=>filter(r,[-.018,0,0])),
    part('spring','Filter retaining spring','The spring seats the rim of the filter in the neck.',[-.026,0,.121],r=>{
      const pts=[];for(let i=0;i<=32;i++){const u=i/32,a=TAU*2.6*u;pts.push([-.018+.021*Math.cos(a),.021*Math.sin(a),.12+.011*u]);}pipe(r,pts,.0018,steel,5);
    }),
    part('cap','Filter cover','The large cover closes the filter opening.',[-.025,0,.163],r=>cyl(r,[-.018,0,0],z,.131,.140,.034,rubber,16)),
    part('dipstick','Dipstick and protective cap','The level gauge fits through the small bore beside the filter.',[.073,0,.092],r=>{
      cyl(r,[.045,.021,0],z,.020,.135,.0024,metal,7);cyl(r,[.045,.021,0],z,.133,.144,.011,rubber,10);
    })
  ]);
}

function drawSupply(r){
  tankShell(r,tank);
  cyl(r,[tank[0]-.018,tank[1],tank[2]],z,.131,.14,.034,rubber,13);
  cyl(r,[tank[0]+.045,tank[1]+.021,tank[2]],z,.133,.144,.011,rubber,8);
  // The A/C compressor occupies the opposing, negative-Y accessory position.
  turn(r,[-1.465,.16,.46],x,[[0,.047],[.017,.05],[.026,.045],[.035,.051],[.083,.047],[.087,0]],alloy,{n:12});
  pipe(r,[suction,[-1.345,-.539,.448],[-1.527,-.474,.338],[-1.556,-.190,.303],[-1.556,.116,.317],[-1.509,.188,.435],pumpIn],.013,rubber,7);
}
function accumulator(r,center,axis){
  turn(r,center,axis,[[0,.009],[.012,.012],[.018,.033],[.032,.047],[.055,.054],[.067,.055],[.069,.057],[.073,.057],[.075,.054],[.094,.05],[.111,.034],[.118,0]],'#59605a',{n:12});
}
function drawValves(r){
  for(const axle of [front,rear]){
    r.box(axle-.053,-.521,.304,axle+.047,-.473,.378,alloy);
    for(const xx of [-.024,.021])barrel(r,[axle+xx,-.475,.333],[axle+xx,-.448,.333],.016,rubber,8);
    for(const s of [-1,1]){
      const yy=s*.633;
      pipe(r,[[axle+s*.016,-.505,.346],[axle+s*.056,-.537,.316],[axle+.106,yy,.336],[axle+.090,yy,.487],[axle+.049,s*.663,.546],strutIn(axle,s)],.006,steel,7);
    }
  }
  cyl(r,[front+.009,-.511,.378],z,0,.012,.011,metal,6);
  r.box(front+.001,-.517,.390,front+.017,-.505,.405,rubber);
}
function drawCooler(r){
  // A221 500 42 00 has a narrow, finned horizontal core; both ports leave one end.
  const x0=-1.949,x1=-1.933,y0=-.350,y1=.365;
  for(const h of [.482,.510])r.box(x0,y0,h,x1,y1,h+.009,'#4c5653');
  for(let i=0;i<52;i++){const yy=y0+.008+i*.0136;r.polygon([[x0,yy,.491],[x0,yy+.006,.491],[x0,yy+.009,.510],[x0,yy+.003,.510]],steel,false);}
  pipe(r,[[x0+.008,y1,.486],[x0+.008,y1+.019,.488],[x0+.008,y1+.021,.510],[x0+.008,y1,.514]],.0045,alloy,7);
  for(const [h,port] of [[.487,coolerIn],[.514,coolerOut]])pipe(r,[[x0+.008,y0,h],[x0+.009,-.368,h],port],.006,alloy,7);
  r.box(-1.947,-.399,.48,-1.934,-.388,.521,alloy);
}
function boot(r,center,dir,start,end,rearAxle){
  const profile=[[start,.034],[start+.009,.046]];
  for(let i=0;i<22;i++){
    const u=i/21,h=start+.012+(end-start-.025)*u;
    const corrugated=u<.55||rearAxle&&u>.75;
    profile.push([h,corrugated?(i%2?.047:.051):.048]);
  }
  profile.push([end-.006,.046],[end,.038]);
  for(let i=1;i<profile.length;i++){
    const [lo,hi]=profile.slice(i-1,i+1);
    const color=hi[1]>lo[1]?'#555c58':hi[1]<lo[1]?'#353b38':'#464e49';
    turn(r,center,dir,[lo,hi],color,{n:12});
  }
}
function drawStruts(r){
  for(const axle of [front,rear])for(const s of [-1,1]){
    const low=[axle,s*.703,.282],high=[axle+.025,s*.616,.744];
    const frame=basis(high.map((v,i)=>v-low[i]));
    const p=(h,rad=0,t=0)=>point(low,frame,h,rad,t);
    const dir=frame[0],rearAxle=axle===rear;
    barrel(r,p(.055),p(.438),.027,alloy,10);
    boot(r,low,dir,.067,rearAxle?.390:.307,rearAxle);
    turn(r,low,dir,[[.421,.031],[.425,.054],[.441,.054],[.446,.063],[.450,.063],[.454,.043]],alloy,{n:12});
    for(let i=0;i<3;i++)barrel(r,p(.451,.041,i*TAU/3),p(.470,.041,i*TAU/3),.0048,metal,6);
    if(rearAxle)sleeve(r,p(.034),y,-.020,.020,.026,.012,alloy,12);
    else for(const sign of [-1,1]){
      const offset=p(.064);offset[1]+=sign*.023;
      const eye=p(.019);eye[1]+=sign*.023;
      barrel(r,eye,offset,.011,alloy,7);sleeve(r,eye,y,-.006,.006,.016,.008,alloy,10);
    }
    barrel(r,p(.291),strutIn(axle,s),.010,metal,7);
  }
}
export const abcParts=[
  ['supply','Hydraulic oil tank, filter and pump','The engine-driven pump takes fluid from the tank. Open the tank to see its filter, spring and separate dipstick.',[-.16,-.17,.18],'valves',drawSupply],
  ['valves','Front and rear axle valve blocks','Each block meters oil to the left and right struts. The pressure sensor sits at the front block.',[.12,-.22,.16],'valves',drawValves],
  ['feed','Pressure supply pipes','The pump supplies the front block. A second pressure line follows the floor to the rear axle.',[0,-.15,-.08],'abcLines',r=>{
    pipe(r,positiveLine,.0076,steel,7);
    pipe(r,[[front+.024,-.501,.326],[-.94,-.456,.294],[-.70,-.423,.224],[.72,-.422,.222],[1.08,-.456,.277],rearFeed],.0075,steel,7);
  }],
  ['front-cell','Front pressure accumulator','This pressure vessel feeds the front axle valve unit during rapid changes in spring load.',[-.08,-.19,.15],'valves',r=>accumulator(r,[front,-.500,.378],z)],
  ['rear-cell','Rear pressure accumulator','The rear accumulator connects to its own valve block through a short neck.',[.08,-.19,.11],'valves',r=>accumulator(r,[rear+.047,-.497,.351],x)],
  ['cooler','ABC return-oil cooler','This slim finned cooler crosses the front of the cooling pack. Both hose connections sit at the same end.',[-.16,0,.04],'abcLines',drawCooler],
  ['return','Return hoses and cooler connections','Return oil from the axle blocks travels through the front cooler and back into the filter tank. The hidden bends are approximate.',[0,-.19,.05],'abcLines',r=>{
    pipe(r,[rearReturn,[1.04,-.49,.277],[.72,-.451,.220],[-.70,-.454,.223],[-.94,-.485,.297],[front+.029,-.515,.351]],.0066,alloy,7);
    pipe(r,[frontReturn,[-1.42,-.52,.358],[-1.72,-.488,.385],[-1.93,-.449,.430],coolerIn],.009,rubber,7);
    pipe(r,[coolerOut,[-1.919,-.422,.548],[-1.714,-.471,.545],[-1.477,-.558,.535],tankReturn],.009,rubber,7);
  }],
  ['struts','Four ABC spring struts','Protective bellows cover the springs. Forked lower ends attach the front struts, and eye bushings attach the rear pair. Open the strut to see the hydraulic spring perch move.',[0,.30,.18],'abcStruts',drawStruts]
];
export const abcTankStudy=tankStudy();
