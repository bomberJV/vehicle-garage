// Parts of the 1993 F-350's 7.5-litre V8 that differ from the shared V8 layout:
// the in-block camshaft and pushrod valve gear, distributor ignition, the oil
// pan over the Twin I-Beam axles, cast exhaust manifolds, the fender-mounted air
// cleaner and the bay positions shared with the starting and charging study.
// Engine-local coordinates follow engine-geometry.js. All positions are estimated.
import {tone} from './engine-shapes.js';
import {electricMachine,battery} from './road-service-geometry.js';
import {roadSystems} from './road-service-data.js';

const METAL='#8f9b9f',CAST='#65747c',DARK='#303c43',BLACK='#20292f',RUBBER='#273238',GOLD='#b49b68',COPPER='#b87853',OIL='#a4a671';
const CAM_Z=.165;
export const f350Cams=xx=>[[xx,0,CAM_Z]];
// Valve stations follow the shared valve geometry: two valves in line per cylinder.
const valveX=(station,i)=>station+(i-.5)*.05;
const lobeX=(station,i,side)=>valveX(station,i)+side*.009;
export function drawF350EngineParts(r,tag,t,{L,xs,cells,banks,bankY,headZ,cfg,bay,world}){
 const {box,cyl,tube,route}=t,site=roadSystems.f350;
 tag('camshafts',()=>{
  cyl([-L/2-.025,0,CAM_Z],[L/2+.015,0,CAM_Z],.017,CAST,12);
  for(let i=0;i<=xs.length;i++){const x=-L/2+.02+i*(L-.04)/xs.length;cyl([x-.012,0,CAM_Z],[x+.012,0,CAM_Z],.029,METAL,12);}
  for(const station of xs)for(let i=0;i<cfg.valves;i++)for(const side of banks){
   const x=lobeX(station,i,side);cyl([x-.008,0,CAM_Z],[x+.008,side*.006,CAM_Z+.010],.025,METAL,10);
  }
 });
 const lifterTop=(station,i,side)=>[lobeX(station,i,side),side*.068,CAM_Z+.085];
 const rockerCup=(station,i,side)=>[valveX(station,i),bankY(side)-side*.075,headZ+.122];
 tag('lifters',()=>{for(const {x,side,index}of cells)for(let i=0;i<cfg.valves;i++)r.instance(side+'-'+index+'-'+i,()=>{
  const top=lifterTop(x,i,side);cyl([top[0],side*.040,CAM_Z+.030],top,.011,'#9aa5a8',10);
 });});
 tag('pushrods',()=>{for(const {x,side,index}of cells)for(let i=0;i<cfg.valves;i++)r.instance(side+'-'+index+'-'+i,()=>{
  cyl(lifterTop(x,i,side),rockerCup(x,i,side),.0045,METAL,6);
 });});
 tag('rocker-arms',()=>{for(const {x,side,index}of cells)for(let i=0;i<cfg.valves;i++)r.instance(side+'-'+index+'-'+i,()=>{
  const xx=valveX(x,i),y=bankY(side),cup=rockerCup(x,i,side);
  cyl(cup,[xx,y+side*.008,headZ+.118],.008,METAL,8);
  cyl([xx-.012,y-side*.035,headZ+.128],[xx+.012,y-side*.035,headZ+.128],.009,GOLD,8);
  cyl([xx,y-side*.035,headZ+.075],[xx,y-side*.035,headZ+.130],.004,DARK,6);
 });});
 // Oil pan: a shallow front floor over the crossmember and I-beams, then the deep sump.
 tag('sump',()=>{
  box(-L/2+.04,-.21,-.15,L/2-.03,.21,-.13,METAL);
  box(-L/2+.06,-.17,-.148,-.03,.17,-.14,CAST);
  box(-.03,-.17,-.31,L/2-.05,.17,-.14,CAST);
  for(const x of [.05,.15,.25])box(x-.008,-.15,-.315,x+.008,.15,-.30,tone(CAST,.8));
 });
 tag('oil-pickup',()=>{route([[-L/2+.06,0,-.10],[.00,0,-.12],[.04,0,-.20],[.08,0,-.26]],.015,OIL,8);cyl([.08,0,-.28],[.08,0,-.255],.047,CAST,12);for(const yy of [-.025,0,.025])box(.045,yy-.002,-.281,.115,yy+.002,-.278,METAL);});
 tag('oil-filter',()=>{cyl([-.20,-.29,-.07],[-.20,-.29,.09],.050,CAST,14);tube([-.20,-.29,.09],[-.20,-.29,.103],.053,.040,BLACK,12);route([[-.20,-.29,.0],[-.20,-.232,.0]],.016,METAL);});
 // Distributor ignition: one coil, a cam-driven distributor and eight plug leads.
 const dist=[-L/2+.01,0];
 tag('distributor',()=>{
  cyl([...dist,.24],[...dist,.40],.030,CAST,12);
  cyl([...dist,.40],[...dist,.48],.050,'#2f3a3f',16);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;cyl([dist[0]+.036*Math.cos(a),.036*Math.sin(a),.48],[dist[0]+.036*Math.cos(a),.036*Math.sin(a),.492],.006,BLACK,6);}
 });
 tag('coils',()=>{
  cyl([-L/2-.005,.17,.40],[-L/2-.005,.17,.488],.026,BLACK,12);
  route([[-L/2-.005,.17,.488],[-L/2+.005,.08,.50],[dist[0],.0,.492]],.004,RUBBER,6);
  // Plug leads leave the cap, pass under the valve covers and drop to each plug.
  for(const {x,side,index}of cells)r.instance(side+'-'+index,()=>{
   const k=(index*2+(side>0?1:0))%8,a=k*Math.PI/4,cap=[dist[0]+.036*Math.cos(a),.036*Math.sin(a),.492];
   route([cap,[-L/2+.03,side*.205,.515],[x,side*.205,.515],[x,side*.41,.515],[x,side*.41,.39]],.004,'#2b4e7a',6);
  });
 });
 tag('spark-plugs',()=>{for(const {x,side,index}of cells)r.instance(side+'-'+index+'-0',()=>{const yy=side*.41;cyl([x,yy,headZ-.04],[x,yy,headZ+.012],.007,'#d5d8cb',8);cyl([x,yy,headZ-.058],[x,yy,headZ-.04],.005,GOLD,6);});});
 // Cast manifolds collect each bank and turn down ahead of the cab toe board.
 tag('exhaust-manifold',()=>{for(const s of [-1,1]){
  for(const station of xs){const x=station+.035;route([[x,s*.36,.34],[x,s*.45,.26],[x,s*.47,.20]],.023,COPPER,8);}
  route([[xs[0]-.03,s*.47,.20],[L/2-.03,s*.47,.20]],.034,tone(COPPER,.85),10);
  route([[L/2-.03,s*.47,.20],[L/2-.03,s*.43,.02],[L/2-.03,s*.42,-.04]],.038,tone(COPPER,.75),10);
 }});
 // Air cleaner in the left front of the bay; the duct crosses ahead of the engine.
 const throttleInlet=world([-L/2-.10,0,.56]);
 tag('airbox',()=>{bay.box(-2.24,-.73,.84,-1.88,-.49,1.02,BLACK);for(let x=-2.21;x<-1.98;x+=.045)bay.box(x,-.73,1.02,x+.013,-.49,1.032,DARK);bay.box(-2.26,-.71,.90,-2.24,-.51,.95,DARK);});
 tag('maf',()=>{bay.tube([-1.95,-.60,1.022],[-1.95,-.60,1.115],.045,.036,DARK,12);bay.box(-1.925,-.62,1.05,-1.90,-.58,1.085,BLACK);});
 tag('intake-duct',()=>{bay.route([[-1.95,-.60,1.115],[-1.97,-.45,1.19],[-2.02,-.20,1.20],[-2.05,-.06,1.19],throttleInlet],.042,RUBBER,10);for(let n=0;n<4;n++){const yy=-.40+n*.04;bay.tube([-1.98-n*.012,yy,1.192],[-1.98-n*.012,yy+.008,1.193],.046,.040,DARK,10);}});
 // Positions shared with Starting & charging and Brakes: one physical part each.
 tag('starter',()=>electricMachine(r,site.starter,'starter'));
 tag('battery',()=>battery(r,site.battery));
 tag('ecu',()=>{bay.box(-1.24,.525,1.00,-1.02,.675,1.07,BLACK);for(let x=-1.22;x<-1.03;x+=.021)bay.box(x,.535,1.07,x+.007,.665,1.08,DARK);bay.route([[-1.13,.60,1.07],[-1.25,.56,1.17],[-1.40,.52,1.215],[-1.45,.13,1.24]],.012,RUBBER,6);});
}
