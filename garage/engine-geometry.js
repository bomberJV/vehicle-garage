import {m113Stations,m113CrankZ,m113PanRail,m113PanOutline,drawM113Group} from './g500-m113-geometry.js';
import {drawG500Gearbox} from './g500-propeller-shafts.js';
import {sharedOilKeys,drawG500EngineOilPart} from './g500-oil-circuits.js';
import {drawG500ElectronicShared} from './g500-electronic-network.js';
import {drawRoadBrakeMaster} from './road-service-systems.js';
import {drawG500BrakeHydraulics} from './g500-brake-hydraulics.js';
import {engineShapes as tools,tone} from './engine-shapes.js';
import {m54InstalledPoint,m54InstalledHeight,m54EngineX} from './bmw-m54-installation.js';
import {drawM54FuelRail,drawM54Injectors} from './bmw-m54-fuel-rail.js';
import {drawE46Gearbox} from './e46-running-gear.js';
import {m54Dress} from './bmw-m54-bay.js';
import {drawG500InductionCircuit,drawG500CoolingCircuit} from './g500-flow.js';
import {drawG500ExhaustManifold} from './g500-exhaust.js';
import {drawG500AcCompressor} from './g500-comfort-parts.js';
import {g500Ignition,g500FluidAccess} from './g500-engine-bay.js';
import {F350_ENGINE,drawE4OD} from './f350-powertrain.js';
import {drawF350EngineParts,f350Cams} from './f350-engine-bay.js';
/* Component geometry for the engine-bay explorer. This is a source-informed
   layout model, not a scanned engine, assembly tolerance or service drawing.
   Coordinate units are metres; small features are enlarged for legibility. */
const METAL='#8f9b9f',CAST='#65747c',DARK='#303c43',BLACK='#20292f',RUBBER='#273238',GOLD='#b49b68',COPPER='#b87853',OIL='#a4a671',COOL='#70a3ad';
export const ENGINE_LAYOUTS={
 g500:{layout:'v8',count:8,banks:2,cams:2,valves:3,plugs:2,length:.82,orientation:'longitudinal',wheelbase:2.85,base:.57},
 bmw325ci:{layout:'inline6',count:6,banks:1,cams:2,valves:4,plugs:1,length:.98,orientation:'longitudinal',wheelbase:2.725,base:.53},
 bmw328i:{layout:'inline6',count:6,banks:1,cams:2,valves:4,plugs:1,length:.98,orientation:'longitudinal',wheelbase:2.725,base:.53},
 c63:{layout:'v8',count:8,banks:2,cams:4,valves:4,plugs:1,length:.86,orientation:'longitudinal',wheelbase:2.76,base:.51},
 hrv:{layout:'inline4',count:4,banks:1,cams:2,valves:4,plugs:1,length:.66,orientation:'transverse',wheelbase:2.654,base:.52},
 // 4.36 in bore. The block length gives the 460's 4.90 in bore spacing; the
 // 45° cylinder axes give the 90° V. Height and fore-aft station are estimated.
 f350:{layout:'v8',count:8,banks:2,cams:1,valves:2,plugs:1,length:F350_ENGINE.length,orientation:'longitudinal',wheelbase:3.3782,base:F350_ENGINE.base,center:F350_ENGINE.center,bore:.0554,wall:.006,slope:1,pushrod:true},
};
// Every component translates rigidly; left/right instances remain an assembly.
const OFFSETS={
 'dipstick-guide':[.06,-.42,.31],'air-filters':[.04,.40,.42],'oil-fill':[.03,-.30,.63],'oil-dipstick':[-.24,.40,.51],
 block:[0,0,0],crankshaft:[0,0,-.30],'connecting-rods':[0,0,-.12],pistons:[0,0,.21],'piston-rings':[0,0,.28],'main-bearings':[0,0,-.39],
 head:[0,0,.62],'head-gasket':[0,0,.44],'valve-cover':[0,0,1.18],camshafts:[0,0,.92],valves:[0,0,.72],'timing-drive':[-.32,0,.36],'rocker-arms':[0,0,1.02],
 sump:[0,0,-.62],'oil-pump':[-.28,0,-.30],'oil-pickup':[0,0,-.45],'oil-filter':[-.20,-.42,.20],
 intake:[0,-.38,.62],airbox:[-.12,-.58,.14],maf:[-.15,-.40,.32],'intake-duct':[-.18,-.42,.38],throttle:[-.32,-.22,.52],
 'fuel-rail':[0,-.30,.78],injectors:[0,-.22,.67],coils:[0,.22,1.22],'spark-plugs':[0,.12,.84],
 'exhaust-manifold':[0,.48,.18],radiator:[-.62,0,.10],fan:[-.40,0,.12],'water-pump':[-.36,0,.12],thermostat:[-.42,-.20,.21],
 'upper-hose':[-.30,-.28,.45],'lower-hose':[-.36,.18,-.12],'coolant-reservoir':[-.15,.48,.25],
 alternator:[-.40,-.32,.12],belt:[-.48,0,.04],tensioner:[-.43,.30,.11],battery:[.16,.55,.12],'brake-reservoir':[.26,.55,.30],ecu:[.32,-.56,.25],transmission:[.54,0,-.12],
 vanos:[-.35,0,.93],disa:[.02,-.55,.67],ccv:[.06,-.36,.35],'cam-adjusters':[-.37,0,1.02],'vtc-actuators':[-.30,0,.94],'vtec-rockers':[0,0,1.01],starter:[.33,.36,-.12],'ac-compressor':[-.32,.44,-.14],'engine-mounts':[.02,.58,-.25],lifters:[0,0,.80],pushrods:[0,0,.90],distributor:[-.34,0,.98],
};
// The in-block camshaft slides out through the front of the block.
const VEHICLE_OFFSETS={f350:{camshafts:[-.62,0,.12],'timing-drive':[-.40,0,.30]}};
export function enginePartOffset(id,vehicle='g500'){
 const key=id.replace(/^powertrain\./,''),p=VEHICLE_OFFSETS[vehicle]?.[key]||OFFSETS[key]||[0,0,.35];
 return ENGINE_LAYOUTS[vehicle]?.orientation==='transverse'?[ -p[1],p[0],p[2] ]:[...p];
}
export function buildEngineBay(r,definition=null,{detail=true,fuelSystemOwnsRail=false,g500ServiceOwnsFlow=false}={}){
 if(!detail)return; // Hidden under the closed hood; avoid a proxy piercing the exterior.
 const id=r.build.vehicle,cfg=ENGINE_LAYOUTS[id];
 if(!cfg)return;
 const m54=id==='bmw325ci';
 const ford=id==='f350',front=-cfg.wheelbase/2,cx=cfg.center??front+.19,base=cfg.base,trans=cfg.orientation==='transverse',slope=cfg.slope||.65;
 // The M156 section drawing exaggerates the air boxes and stacked valve gear.
 // Fit its upper half beneath the W204 bonnet, keeping the crank/sump datum.
 const fitHeight=z=>id==='c63'&&z>base?base+(z-base)*.74:z;
 const world=m54?m54InstalledPoint:([x,y,z])=>[cx+(trans?-y:x),trans?x:y,fitHeight(base+z)],t=tools(r,world);
 const crankRise=id==='g500'?m113CrankZ-base:0;
 const rotating=id==='g500'?tools(r,([x,y,z])=>world([x,y,z+crankRise])):t;
 // Bay fixtures use vehicle coordinates. Apply the same fitted height datum
 // to their authored stations, preserving connections already in world space.
 const bayWorld=([x,y,z])=>[x,y,m54?m54InstalledHeight(x-m54EngineX,z-base):fitHeight(z)];
 const bay=tools(r,bayWorld),{box,cyl,tube,route,poly}=t;
 const tag=(name,fn)=>r.tag('powertrain.'+name,fn),L=cfg.length,rows=cfg.count/cfg.banks,step=(L-.18)/rows,xs=id==='g500'?m113Stations:Array.from({length:rows},(_,i)=>-L/2+.09+step*(i+.5));
 if(m54)m54Dress(tag,t,xs);
 const banks=cfg.banks===2?[-1,1]:[0],bore=id==='g500'?.0485:cfg.bore||.041,wall=cfg.wall||.012;
 const cylinder=(x,side,z)=>id==='g500'?[x+side*.009,side*z,z]:[x,side*(.115+z*slope),z];
 const cells=xs.flatMap((x,index)=>banks.map(side=>({x,side,index,p:cfg.banks===2?cylinder(x,side,id==='g500'?.160:.27):[x,0,.32]})));
 const bankY=s=>cfg.banks===2?s*.35:0,headZ=cfg.banks===2?.37:.40,headWidth=cfg.banks===2?.23:.28;
 tag('block',()=>{
  if(id==='g500'){
   // The lower casting meets the complete pan perimeter. Its open center
   // leaves the counterweights and the suction pipe inside the crankcase.
   for(let i=0;i<m113PanOutline.length;i++){
    const a=m113PanOutline[i],b=m113PanOutline[(i+1)%m113PanOutline.length];
    rotating.poly([[...a,m113PanRail],[...b,m113PanRail],[...b,.120],[...a,.120]],CAST);
   }
  }else{
   for(const y of [-.19,.19])box(-L/2,y-.035,-.10,L/2,y+.035,.16,CAST);box(-L/2,-.19,-.13,L/2,.19,-.09,CAST);
   for(const x of [-L/2,L/2])box(x-.018,-.22,-.08,x+.018,.22,.20,CAST);
   for(let x=-L/2+.07;x<L/2;x+=.13)for(const side of [-1,1])box(x,side*.205-.01,-.05,x+.018,side*.205+.01,.14,tone(CAST,.85));
  }
  for(const {x,side,p}of cells){const a=cfg.banks===2?cylinder(x,side,id==='g500'?.063:.10):[x,0,.10];rotating.tube(a,p,bore+wall,bore,CAST,12);}
 });
 tag('crankshaft',()=>{
  if(id==='g500'){drawM113Group(r,rotating,'crankshaft');return;}
  cyl([-L/2-.08,0,0],[L/2+.07,0,0],.024,METAL,12);
  for(let i=0;i<rows;i++){const x=xs[i],sign=i%2?1:-1;cyl([x-.035,sign*.037,0],[x+.035,sign*.037,0],.027,METAL,10);for(const xx of [x-.038,x+.038])cyl([xx,0,0],[xx,sign*.037,0],.047,CAST,10);}
 });
 tag('main-bearings',()=>{for(let i=0;i<=rows;i++)r.instance('journal-'+i,()=>{const x=id==='g500'?-.212+i*.106:-L/2+.07+i*(L-.14)/rows;rotating.tube([x-.014,0,0],[x+.014,0,0],.037,.025,GOLD,id==='g500'?10:12);rotating.box(x-.018,-.05,-.06,x+.018,.05,-.032,CAST);});});
 tag('connecting-rods',()=>{if(id==='g500'){drawM113Group(r,rotating,'connecting-rods');return;}for(const {x,side,index,p}of cells)r.instance(side+'-'+index,()=>{const pin=[x,(index%2?1:-1)*.037,0],end=p.map((q,i)=>q+(i===2?-.055:0));cyl(pin,end,.013,METAL,8);cyl([x-.018,pin[1],0],[x+.018,pin[1],0],.034,CAST,10);});});
 tag('pistons',()=>{if(id==='g500'){drawM113Group(r,rotating,'pistons');drawM113Group(r,rotating,'wrist');return;}for(const {p,side,index}of cells)r.instance(side+'-'+index,()=>{const a=p.map((q,i)=>q+(i===2?-.055:i===1?-side*.055*slope:0));cyl(a,p,bore-.002,'#b5bdba',14);cyl([p[0]-.018,p[1],p[2]-.035],[p[0]+.018,p[1],p[2]-.035],.009,GOLD,8);});});
 tag('piston-rings',()=>{if(id==='g500'){drawM113Group(r,rotating,'piston-rings');return;}for(const {p,side,index}of cells)r.instance(side+'-'+index,()=>{
   const axisLength=Math.hypot(side*slope,1);
   for(const z of [.008,.020,.035]){
     const a=[p[0],p[1]-side*z*slope,p[2]-z],b=[a[0],a[1]+side*.003*slope/axisLength,a[2]+.003/axisLength];
     tube(a,b,bore+.0008,bore-.003,'#404c52',id==='g500'?9:12);
   }
 });});
 tag('head-gasket',()=>{
  if(id==='g500'){
   for(const s of banks)for(const x of xs){const a=cylinder(x,s,.160),b=cylinder(x,s,.161);rotating.tube(a,b,bore+.0035,bore,'#5e686c',12);}
   return;
  }
  for(const s of banks){const yy=bankY(s),zz=headZ-.065;for(const x of xs){tube([x,yy,zz],[x,yy,zz+.004],.059,.042,'#5e686c',id==='g500'?9:12);}for(const y of [yy-headWidth/2,yy+headWidth/2])box(-L/2,y-.006,zz,L/2,y+.006,zz+.004,'#5e686c');}});
 tag('head',()=>{for(const s of banks){const y=bankY(s);for(const edge of [-1,1])box(-L/2,y+edge*headWidth/2-.018,headZ-.06,L/2,y+edge*headWidth/2+.018,headZ+.075,METAL);for(const x of [-L/2,L/2])box(x-.012,y-headWidth/2,headZ-.06,x+.012,y+headWidth/2,headZ+.075,METAL);for(const station of xs)for(const sy of [-1,1]){const x=station+(id==='g500'?s*.009:0);tube([x,y+sy*headWidth/2,headZ-.005],[x,y+sy*(headWidth/2+.035),headZ+.005],.030,.023,CAST,id==='g500'?8:10);}if(id==='g500'){const face=(xx,h)=>h?[[xx,y-headWidth/2+(s<0?.065:0),headZ-.060],[xx,y+headWidth/2-(s>0?.065:0),headZ-.060]]:[[xx,s*.160-.038,.161+crankRise+s*.038],[xx,s*.160+.038,.161+crankRise-s*.038]];const a=face(-.222,0),b=face(.222,0),c=face(-.222,1),d=face(.222,1);poly([a[0],b[0],d[0],c[0]],CAST);poly([a[1],b[1],d[1],c[1]],CAST);poly([...a,...c.reverse()],CAST);poly([...b,...d.reverse()],CAST);}}});
 tag('valves',()=>{for(const s of banks)for(const station of xs)for(let i=0;i<cfg.valves;i++)r.instance(s+'-'+xs.indexOf(station)+'-'+i,()=>{const x=cfg.pushrod?station+(i-.5)*.05:station,y=bankY(s)+(cfg.pushrod?0:(i-(cfg.valves-1)/2)*.037);const top=[x,y,headZ+.105],bottom=[x,y*.97,headZ-.025];cyl(bottom,top,.004,METAL,6);cyl([bottom[0],bottom[1],bottom[2]-.004],bottom,i<2?.016:.018,'#bac1bf',10);});});
 if(cfg.pushrod)drawF350EngineParts(r,tag,t,{L,xs,cells,banks,bankY,headZ,cfg,world,bay,rotating});
 else tag('camshafts',()=>{for(const s of banks)for(let cam=0;cam<cfg.cams/cfg.banks;cam++)r.instance('cam-'+s+'-'+cam,()=>{const yy=bankY(s)+(cfg.cams/cfg.banks===1?0:(cam===0?-.065:.065)),zz=headZ+.115;cyl([-L/2-.025,yy,zz],[L/2+.025,yy,zz],.014,CAST,10);for(const x of xs)for(let lobe=0;lobe<(cfg.cams/cfg.banks===1?3:2);lobe++){const dx=(lobe-((cfg.cams/cfg.banks===1?3:2)-1)/2)*.031;cyl([x+dx-.010,yy,zz],[x+dx+.010,yy+.007,zz+.010],.025,METAL,10);}});});
 if(id==='g500')tag('rocker-arms',()=>{for(const s of banks)for(const station of xs)for(let i=0;i<3;i++){
  const x=station+s*.009,y=bankY(s),yy=y+(i-1)*.040;
  const corners=[[-.017,y,headZ+.118],[.003,y,headZ+.137],[.024,yy,headZ+.117],[.022,yy,headZ+.102],[.010,yy,headZ+.105],[-.005,y,headZ+.124]];
  const side=d=>corners.map(([xx,yyy,zz])=>[x+xx,yyy+d,zz]);
  const a=side(-.006),b=side(.006);poly(a,METAL);poly(b,METAL);for(let j=0;j<a.length;j++){const k=(j+1)%a.length;poly([a[j],a[k],b[k],b[j]],METAL);}
 }});
 if(id==='hrv')tag('vtec-rockers',()=>{for(const x of xs)for(const yy of [-.065,.065]){box(x-.025,yy-.017,headZ+.125,x+.025,yy+.017,headZ+.155,METAL);cyl([x-.030,yy,headZ+.14],[x+.030,yy,headZ+.14],.005,GOLD,6);}});
 // The G500's covers are low magnesium shells over the camshafts, so the air
 // cleaner pods above them stay clear.
 if(!m54)tag('valve-cover',()=>{const top=id==='g500'?.162:id==='hrv'?.17:.19,rib=id==='g500'?.003:.006,bolt=id==='g500'?.005:.012;for(const s of banks){const y=bankY(s),half=headWidth/2+.025;box(-L/2-.025,y-half,headZ+.15,L/2+.025,y+half,headZ+top,BLACK);for(let x=-L/2+.025;x<L/2;x+=.15)for(const sy of [-1,1])cyl([x,y+sy*(half-.012),headZ+top],[x,y+sy*(half-.012),headZ+top+bolt],.008,METAL,6);for(const yy of [y-.06,y-.035,y+.035,y+.06])box(-L/2+.04,yy-.003,headZ+top,L/2-.04,yy+.003,headZ+top+rib,tone(METAL,.8));}});
 tag('timing-drive',()=>{
  const xx=-L/2-.037,crank=[xx,0,crankRise],cams=cfg.pushrod?f350Cams(xx):banks.flatMap(s=>Array.from({length:cfg.cams/cfg.banks},(_,i)=>[xx,bankY(s)+(cfg.cams/cfg.banks===1?0:(i? .065:-.065)),headZ+.115]));
  for(const p of [crank,...cams]){tube([xx-.01,p[1],p[2]],[xx+.01,p[1],p[2]],p===crank?.057:.048,p===crank?.025:.014,GOLD,14);}
  const path=[crank,...cams,[...crank]];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];route([a,b],.007,DARK,6);for(let n=1;n<9;n++){const q=a.map((v,j)=>v+(b[j]-v)*n/9);cyl([q[0]-.009,q[1],q[2]],[q[0]+.009,q[1],q[2]],.008,METAL,6);}}
 });
 const camAdjust=(name)=>tag(name,()=>{for(const s of banks)for(let cam=0;cam<cfg.cams/cfg.banks;cam++){const yy=bankY(s)+(cfg.cams/cfg.banks===1?0:(cam?.065:-.065));cyl([-L/2-.11,yy,headZ+.115],[-L/2-.05,yy,headZ+.115],.052,CAST,14);tube([-L/2-.116,yy,headZ+.115],[-L/2-.108,yy,headZ+.115],.043,.015,GOLD,12);}});
 if(id==='bmw328i')camAdjust('vanos');if(id==='c63')camAdjust('cam-adjusters');if(id==='hrv')camAdjust('vtc-actuators');
 if(id==='g500'){
  const oilOwner=r.inspection?.assembly==='engine-oil';
  if(!oilOwner)for(const key of sharedOilKeys)tag(key,()=>drawG500EngineOilPart(r,key));
  g500FluidAccess((key,fn)=>{if(key!=='oil-filter')tag(key,fn);},t);
 }else{
  if(!ford)tag('sump',()=>{box(-L/2+.06,-.17,-.31,L/2-.05,.17,-.14,CAST);box(-L/2+.04,-.21,-.15,L/2-.03,.21,-.13,METAL);for(const x of [-.2,0,.2])box(x-.008,-.15,-.315,x+.008,.15,-.30,tone(CAST,.8));});
  tag('oil-pump',()=>{cyl([-L/2-.015,0,-.085],[-L/2+.07,0,-.085],.065,CAST,12);tube([-L/2-.02,0,-.085],[-L/2-.014,0,-.085],.058,.025,METAL,12);});
  if(!ford)tag('oil-pickup',()=>{route([[-L/2+.06,0,-.10],[-.02,0,-.19],[.08,0,-.26]],.015,OIL,8);cyl([.08,0,-.28],[.08,0,-.255],.047,CAST,12);for(const yy of [-.025,0,.025])box(.045,yy-.002,-.281,.115,yy+.002,-.278,METAL);});
  if(!ford)tag('oil-filter',()=>{cyl([-.24,-.30,.10],[-.24,-.30,.29],.054,CAST,14);tube([-.24,-.30,.29],[-.24,-.30,.305],.057,.043,BLACK,12);for(let i=0;i<4;i++)box(-.28+i*.023,-.30-.047,.305,-.276+i*.023,-.30+.047,.31,BLACK);route([[-.24,-.30,.12],[-.24,-.20,.06]],.017,METAL);});
 }
 if(id!=='g500'&&!m54)tag('intake',()=>{if(cfg.banks===2){box(-L/2+.06,-.11,.51,L/2-.02,.11,.61,id==='c63'?'#a5adb0':DARK);for(const {x,side}of cells)route([[x,0,.55],[x,side*.12,.53],[x,side*.29,.40]],.031,id==='c63'?METAL:BLACK,10);}else{box(-L/2+.03,-.33,.30,L/2-.04,-.22,.43,BLACK);for(const x of xs)route([[x,-.28,.35],[x,-.19,.44],[x,-.14,.36]],.026,BLACK,10);}});
 const intakeY=cfg.banks===2?0:-.27,intakeZ=cfg.banks===2?.56:.37,throttleX=-L/2-.08;
 if(id!=='g500'&&!m54)tag('throttle',()=>{tube([throttleX-.02,intakeY,intakeZ],[throttleX+.085,intakeY,intakeZ],.062,.048,METAL,14);box(throttleX+.005,intakeY+.055,intakeZ-.035,throttleX+.085,intakeY+.10,intakeZ+.035,BLACK);cyl([throttleX+.03,intakeY-.045,intakeZ],[throttleX+.03,intakeY+.045,intakeZ],.004,GOLD,6);});
 if(m54){
  if(!fuelSystemOwnsRail){
   tag('fuel-rail',()=>drawM54FuelRail(r));
   tag('injectors',()=>drawM54Injectors(r));
  }
 }else{
 tag('fuel-rail',()=>{for(const s of banks)r.instance('bank-'+s,()=>{const yy=cfg.banks===2?s*.29:-.14;cyl([-L/2+.03,yy,.435],[L/2-.02,yy,.435],.012,METAL,10);if(ford)route([[-L/2+.03,yy,.435],[-L/2-.02,yy,.425]],.007,RUBBER,6);else route([[L/2-.02,yy,.435],[L/2+.06,yy,.35]],.007,RUBBER,6);});});
 tag('injectors',()=>{for(const {x,side,index}of cells)r.instance(side+'-'+index,()=>{const yy=cfg.banks===2?side*.29:-.14;cyl([x,yy,.43],[x,yy*.95,.355],.012,DARK,8);box(x-.012,yy-.016,.41,x+.014,yy+.016,.44,'#416454');});});
 }
 if(id==='g500')g500Ignition(r,tag,t,cells);
 else if(!ford){
 tag('coils',()=>{for(const {x,side,index}of cells)r.instance(side+'-'+index,()=>{const yy=cfg.banks===2?side*.43:0,zz=headZ+(id==='hrv'?.16:.23);box(x-.030,yy-.030,zz-.045,x+.030,yy+.030,zz+.025,BLACK);if(cfg.plugs===2){for(const shift of [-.035,.035])route([[x,yy,zz-.02],[x+shift,yy+side*.06,headZ-.015]],.004,RUBBER,6);}else cyl([x,yy,headZ+.03],[x,yy,zz-.045],.008,DARK,6);});});
 tag('spark-plugs',()=>{for(const {x,side,index}of cells)for(let p=0;p<cfg.plugs;p++)r.instance(side+'-'+index+'-'+p,()=>{const yy=cfg.banks===2?side*.41:0,dx=cfg.plugs===2?(p? .027:-.027):0;cyl([x+dx,yy,headZ-.04],[x+dx,yy,headZ+.012],.007,'#d5d8cb',8);cyl([x+dx,yy,headZ-.058],[x+dx,yy,headZ-.04],.005,GOLD,6);});});
 }
 if(id==='g500'&&!g500ServiceOwnsFlow)tag('exhaust-manifold',()=>drawG500ExhaustManifold(r));
 if(id!=='g500'&&!m54&&!ford)tag('exhaust-manifold',()=>{for(const s of (cfg.banks===2?[-1,1]:[1])){const yy=cfg.banks===2?s*.36:.20;for(const x of xs)route([[x,yy,.34],[x,yy+s*.12,.23],[L/2+.08,yy+s*.10,.10]],.023,COPPER,8);route([[L/2+.08,yy+s*.10,.10],[L/2+.34,yy+s*.1,-.04]],.038,tone(COPPER,.75),10);}});
 if(id==='bmw328i'){
  tag('disa',()=>{box(.02,-.365,.31,.18,-.31,.43,BLACK);cyl([.08,-.37,.37],[.08,-.345,.37],.035,CAST,10);});
  tag('ccv',()=>{cyl([.20,-.30,.10],[.20,-.30,.20],.045,BLACK,12);route([[.20,-.30,.20],[.27,-.20,.38],[.30,-.08,.50]],.010,RUBBER,8);route([[.20,-.30,.11],[.23,-.25,-.20]],.009,RUBBER,8);});
 }
 // External cooling/accessory components use vehicle coordinates, independent of
 // whether the engine itself runs along or across the car.
 const bayTag=(name,fn)=>tag(name,()=>fn(bay));
 // The HR-V's radiator and fan sit lower, under its lower bonnet line.
 const radX=front-.62,radY=0,radZ=base+(id==='hrv'?.16:.20),radTop=id==='hrv'?.40:.55,fanR=id==='hrv'?.20:.245;
 if(id==='g500'){
  if(!g500ServiceOwnsFlow)drawG500CoolingCircuit(r,'powertrain');
 }else{
 bayTag('radiator',({box})=>{box(radX-.045,-.59,base-.03,radX+.025,.59,base+radTop,DARK);for(let z=base+.005;z<base+radTop-.02;z+=.035)box(radX-.050,-.53,z,radX-.046,.53,z+.009,'#9ca9ad');for(const y of [-.60,.54])box(radX-.045,y,base-.04,radX+.03,y+.06,base+radTop+.01,BLACK);});
 bayTag('fan',({tube,poly,cyl})=>{const x=radX+.09,z=radZ+.07;tube([x-.012,0,z],[x+.012,0,z],fanR,fanR-.02,DARK,20);cyl([x-.018,0,z],[x+.025,0,z],.051,BLACK,12);for(let i=0;i<7;i++){const a=i*Math.PI*2/7,pt=(rad,t,xx)=>[xx,Math.cos(t)*rad,z+Math.sin(t)*rad];poly([pt(.05,a,x+.016),pt(fanR-.025,a+.19,x+.004),pt(fanR-.028,a+.38,x-.004),pt(.066,a+.48,x+.020)],'#4b565c');}});
 tag('water-pump',()=>{cyl([-L/2-.13,0,.21],[-L/2-.045,0,.21],.067,CAST,12);tube([-L/2-.14,0,.21],[-L/2-.13,0,.21],.081,.026,DARK,16);});
 tag('thermostat',()=>{box(-L/2-.11,-.14,.12,-L/2+.01,-.045,.23,CAST);cyl([-L/2-.05,-.16,.18],[-L/2-.05,-.12,.18],.030,DARK,10);});
 const hoseAnchor=([x,y,z])=>[cx+(trans?-y:x),trans?x:y,base+z];
 const upperEngine=hoseAnchor([-L/2-.04,-.12,.24]),lowerEngine=hoseAnchor([-L/2-.09,.03,.10]);
 bayTag('upper-hose',({route,tube})=>{route([[radX+.02,-.48,base+radTop-.07],[radX+.20,-.48,base+radTop-.01],[upperEngine[0]-.09,upperEngine[1]-.07,upperEngine[2]+.10],upperEngine],.025,RUBBER,8);});
 bayTag('lower-hose',({route})=>{route([[radX+.025,.47,base+.015],[radX+.17,.47,base-.015],[lowerEngine[0]-.10,lowerEngine[1]+.08,lowerEngine[2]-.10],lowerEngine],.026,RUBBER,8);});
 }
 if(id!=='g500'&&!m54)bayTag('coolant-reservoir',({box,cyl,route})=>{const x=front+.32,y=.61,z=base+.28;box(x-.09,y-.065,z,x+.09,y+.065,z+.22,'#aebdb5');box(x-.09,y-.066,z+.045,x+.09,y-.063,z+.11,COOL);cyl([x,y,z+.22],[x,y,z+.25],.036,BLACK,12);route([[x-.05,y,z+.02],[radX+.16,.48,base+.32]],.008,RUBBER,6);});
 if(id==='g500'&&!g500ServiceOwnsFlow)tag('alternator',()=>drawG500ElectronicShared(r,'alternator'));
 if(id!=='g500')tag('alternator',()=>{const x=-L/2-.01,y=-.28,z=.09;cyl([x-.10,y,z],[x+.02,y,z],.073,CAST,14);for(let i=0;i<5;i++)tube([x-.09+i*.02,y,z],[x-.085+i*.02,y,z],.075,.058,DARK,12);tube([x-.125,y,z],[x-.105,y,z],.052,.021,BLACK,12);box(x+.02,y-.04,z-.03,x+.055,y+.04,z+.03,BLACK);});
 if(id==='g500'&&!g500ServiceOwnsFlow)tag('ac-compressor',()=>drawG500AcCompressor(r));
 if(id!=='g500')tag('ac-compressor',()=>{cyl([-L/2-.07,.27,-.04],[-L/2+.07,.27,-.04],.064,CAST,12);tube([-L/2-.125,.27,-.04],[-L/2-.105,.27,-.04],.059,.020,BLACK,12);route([[-L/2+.04,.30,.01],[-L/2+.13,.38,.15]],.008,METAL,6);});
 tag('tensioner',()=>{box(-L/2-.095,.11,-.02,-L/2-.04,.20,.10,CAST);tube([-L/2-.136,.17,.09],[-L/2-.113,.17,.09],.047,.015,DARK,12);});
 tag('belt',()=>{const x=-L/2-.148,points=[[x,0,crankRise-.07],[x,-.29,.04],[x,-.28,.145],[x,0,.28],[x,.22,.12],[x,.31,-.04],[x,0,crankRise-.07]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],v=b.map((q,j)=>q-a[j]),len=Math.hypot(v[1],v[2]),n=[0,-v[2]/len*.006,v[1]/len*.006];poly([a.map((q,j)=>q+n[j]),b.map((q,j)=>q+n[j]),b.map((q,j)=>q-n[j]),a.map((q,j)=>q-n[j])],BLACK);}rotating.tube([x-.004,0,0],[x+.008,0,0],.071,.033,DARK,14);});
 if(id==='g500'&&!g500ServiceOwnsFlow)tag('starter',()=>drawG500ElectronicShared(r,'starter'));
 if(id!=='g500'&&!ford)tag('starter',()=>{cyl([L/2+.01,.21,-.08],[L/2+.19,.21,-.08],.045,CAST,12);cyl([L/2+.04,.25,-.025],[L/2+.15,.25,-.025],.022,BLACK,10);});
 tag('transmission',()=>{if(id==='g500'){drawG500Gearbox(r);return;}if(ford){drawE4OD(r);return;}if(m54){drawE46Gearbox(r);return;}const a=[L/2+.03,0,-.035],b=[L/2+.56,0,-.06];if(trans){box(L/2+.01,-.17,-.20,L/2+.36,.18,.15,CAST);for(let x=L/2+.03;x<L/2+.34;x+=.065)box(x,-.185,-.16,x+.014,.185,-.13,METAL);}else{cyl(a,[L/2+.15,0,-.035],.18,CAST,14);cyl([L/2+.15,0,-.035],b,.105,CAST,12);for(let x=L/2+.22;x<L/2+.53;x+=.08)tube([x,0,-.06],[x+.012,0,-.06],.115,.10,DARK,12);}});
 tag('engine-mounts',()=>{for(const side of [-1,1]){
  if(id==='g500'){
   // Each rubber mount stands on a bracket on the inner face of the frame rail,
   // above the front axle and its propeller shaft. A 1 mm joint line separates
   // the bracket from the rail. The arm bolts to the block wall above the pan
   // rail and stays outside the pan rim.
   cyl([.03,side*.385,.03],[.03,side*.385,.09],.046,BLACK,10);
   box(-.02,Math.min(side*.33,side*.454),.01,.08,Math.max(side*.33,side*.454),.03,METAL);
   route([[.02,side*.185,crankRise+.015],[.03,side*.385,.10]],.025,CAST,8);
   continue;
  }
  cyl([.03,side*.32,-.19],[.03,side*.32,-.10],.046,BLACK,10);box(-.02,side*.32-.055,-.21,.08,side*.32+.055,-.19,METAL);
  route([[.02,side*.20,-.05],[.03,side*.32,-.11]],.025,CAST,8);}});
 const airX=front-.16,airY=-.61,airZ=base+.22;
 if(id==='g500'){if(!g500ServiceOwnsFlow)drawG500InductionCircuit(r,'powertrain');}
 else if(ford){}
 else if(cfg.banks===2){
  tag('airbox',()=>{for(const side of [-1,1]){const y=side*.34,z=headZ+.25;box(-L/2+.03,y-.135,z,L/2+.01,y+.135,z+.12,BLACK);for(let x=-L/2+.06;x<L/2;x+=.065)box(x,y-.11,z+.12,x+.012,y+.11,z+.127,DARK);}});
  tag('maf',()=>{const xx=-L/2-.16;tube([xx-.045,0,intakeZ],[xx+.045,0,intakeZ],.052,.040,DARK,12);box(xx-.025,-.025,intakeZ+.049,xx+.025,.025,intakeZ+.074,BLACK);});
  tag('intake-duct',()=>{for(const side of [-1,1]){const y=side*.34,z=headZ+.30;route([[-L/2-.37,side*.56,z-.14],[-L/2-.15,side*.48,z-.08],[-L/2+.04,y,z]],.061,RUBBER,10);for(let n=0;n<5;n++){const xx=-L/2-.24+n*.025;tube([xx,side*.50,z-.10],[xx+.008,side*.50,z-.10],.065,.058,DARK,10);}const outlet=-L/2-.12;route([[outlet,y,z],[outlet,side*.13,z-.04],[outlet,0,intakeZ],[throttleX+.02,0,intakeZ]],.042,RUBBER,10);}});
 }else if(!m54){
  bayTag('airbox',({box})=>{box(airX-.18,airY-.12,airZ,airX+.18,airY+.12,airZ+.18,BLACK);for(let x=airX-.15;x<airX+.17;x+=.045)box(x,airY-.12,airZ+.18,x+.013,airY+.12,airZ+.192,DARK);box(airX-.20,airY-.10,airZ+.06,airX-.18,airY+.10,airZ+.11,DARK);});
  const throttlePoint=world([throttleX,intakeY,intakeZ]),mafPoint=[airX+.24,airY,airZ+.11];
  bayTag('maf',({tube,box})=>{tube([mafPoint[0]-.055,mafPoint[1],mafPoint[2]],[mafPoint[0]+.055,mafPoint[1],mafPoint[2]],.052,.041,DARK,12);box(mafPoint[0]-.025,mafPoint[1]-.025,mafPoint[2]+.048,mafPoint[0]+.025,mafPoint[1]+.025,mafPoint[2]+.075,BLACK);});
  bayTag('intake-duct',({route,tube})=>{const turn=[mafPoint[0]+.11,mafPoint[1],mafPoint[2]],bend=[throttlePoint[0]-.11,throttlePoint[1]-.12,throttlePoint[2]];route([[airX+.18,airY,airZ+.11],mafPoint,turn,bend,throttlePoint],.042,RUBBER,10);for(let i=0;i<5;i++){const x=mafPoint[0]+.065+i*.017;tube([x,airY,airZ+.11],[x+.007,airY,airZ+.11],.047,.042,DARK,10);}});
 }
 if(!ford)bayTag('battery',({box,cyl,route})=>{const g=id==='g500',x=front+.64-(g?.025:0),y=g?-.68:.64,z=base+.18+(g?.050:0);if(id==='g500'||id.startsWith('bmw')){box(x-.045,y-.045,z,x+.045,y+.045,z+.07,BLACK);box(x-.050,y-.050,z+.07,x+.050,y+.050,z+.095,'#a45045');cyl([x,y,z+.095],[x,y,z+.12],.014,GOLD,10);if(id!=='g500')route([[x,y,z+.02],[x+.12,y,z-.10],[x+.12,y*.70,z-.15]],.009,'#7a534a',8);}else{box(x-.14,y-.10,z,x+.14,y+.10,z+.19,BLACK);box(x-.15,y-.105,z+.19,x+.15,y+.105,z+.22,DARK);for(const [yy,c]of [[y-.06,'#b55c52'],[y+.06,METAL]])cyl([x+.09,yy,z+.22],[x+.09,yy,z+.245],.012,c,8);route([[x+.09,y-.06,z+.24],[x+.25,y-.06,z+.24],[x+.25,.32,z+.09]],.007,'#a05d4f',6);}});
 if(id==='g500'){if(!g500ServiceOwnsFlow)tag('brake-reservoir',()=>drawG500BrakeHydraulics(r));}
 else if(['bmw325ci','c63','hrv','f350'].includes(id))tag('brake-reservoir',()=>drawRoadBrakeMaster(r,id));
 else bayTag('brake-reservoir',({cyl,box})=>{const x=front+.78,y=-.62,z=base+.43;cyl([x-.045,y,z-.04],[x+.04,y,z-.04],.097,BLACK,16);box(x-.05,y-.055,z,x+.09,y+.055,z+.11,'#c0c9b9');cyl([x+.04,y,z+.11],[x+.04,y,z+.13],.027,BLACK,10);});
 if(id==='g500'&&!g500ServiceOwnsFlow)tag('ecu',()=>drawG500ElectronicShared(r,'ecu'));
 if(id!=='g500'&&!ford)bayTag('ecu',({box,route})=>{const x=front+.77,y=m54?-.47:.39,z=base+.45;box(x-.11,y-.075,z,x+.11,y+.075,z+.07,BLACK);for(let yy=y-.055;yy<y+.07;yy+=.021)box(x-.10,yy,z+.07,x+.10,yy+.007,z+.08,DARK);route([[x-.1,y,z+.025],[x-.18,y,z-.04],[front+.13,m54?-.20:.20,base+.43]],.012,RUBBER,6);});
}
