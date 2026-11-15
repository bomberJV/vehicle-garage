import {TAU,part,study,cyl,sleeve,turn,x,y,z,steel,metal,dark,gold} from './mechanism-shapes.js';
import {pipe,barrel} from './road-primitives.js';
import {exhaust,exhaustStudy,flapStudy} from './k67-exhaust.js';
import {refs,pump,seal,fan,shift,throttle} from './k67-workbench.js';

const rubber='#3d474a',alloy='#879595',filter='#ba9762';
const bores=[-.126,-.042,.042,.126];
function component(id,name,description,offset,source,draw){return {id,name,description,offset,source,draw};}
function system(id,name,description,source,parts){
  return {id,name,description,source,view:'hero',category:'service',internal:true,parts:parts.map(p=>({...p,id:id+'.'+p.id}))};
}
// Eight-sided cross-sections keep the duct hollow at the nose and carry the fairing aperture into the filter.
function intakeTube(r,stations,color,cap){
  const ring=([xx,hw,bottom,top],scale)=>[[-.68,1],[.68,1],[1,.70],[.91,.20],[.54,0],[-.54,0],[-.91,.2],[-1,.70]].map(([w,h])=>[xx,w*hw*scale,(bottom+top)/2+(h-.5)*(top-bottom)*scale]);
  const outer=stations.map(s=>ring(s,1)),inner=stations.map(s=>ring(s,.88));
  const connect=(a,b,col)=>a.forEach((v,j)=>r.polygon([v,a[(j+1)%a.length],b[(j+1)%a.length],b[j]],col,false));
  for(let i=1;i<outer.length;i++){connect(outer[i-1],outer[i],color);if(!cap)connect(inner[i-1],inner[i],rubber);}
  if(cap){r.polygon(outer[0],color,false);r.polygon(outer.at(-1),color,false);}
  else{connect(outer[0],inner[0],alloy);connect(outer.at(-1),inner.at(-1),rubber);}
}
export function drawAirbox(r){
  intakeTube(r,[[-.355,.104,.801,.861],[-.279,.172,.755,.892],[-.097,.178,.750,.900],[.018,.131,.762,.856]],rubber,true);
  for(const s of [-1,1])r.box(-.277,s*.175-.007,.808,-.109,s*.175+.007,.817,'#636a67');
}
export function drawRadiator(r){
  r.profile([[-.477,.501],[-.438,.494],[-.369,.726],[-.410,.738]],-.163,.163,'#586468');
  for(const s of [-1,1])r.profile([[-.481,.500],[-.435,.495],[-.365,.722],[-.413,.744]],s*.179,s*.163,alloy);
  for(let i=0;i<19;i++){const f=i/18,xx=-.481+.065*f,h=.509+.217*f;r.rod([xx,-.164,h],[xx,.164,h],.0023,'#9aa7a8',5);}
}
function installedFan(r){
  const c=[-.39,.012,.616];
  sleeve(r,c,x,-.010,.006,.092,.085,rubber,20);
  cyl(r,c,x,-.001,.021,.025,steel,12);
  for(let i=0;i<7;i++){
    const a=TAU*i/7,q=(rad,t,lift)=>[c[0]+lift,c[1]+rad*Math.cos(a+t),c[2]+rad*Math.sin(a+t)];
    const root=q(.020,0,0),b=q(.08,.34,-.003),d=q(.021,.28,.003);
    r.polygon([root,b,q(.082,.66,.003),d],'#657175',false);
  }
  for(const side of [-1,1])pipe(r,[[c[0]+.017,c[1],c[2]],[c[0]+.009,c[1]+side*.064,c[2]+side*.052],[c[0]+.004,c[1]+side*.082,c[2]+side*.074]],.0045,rubber,6);
}
function installedPump(r){
  const c=[-.105,0,.378];
  barrel(r,[c[0],-.080,c[2]],[c[0],.082,c[2]],.044,alloy,13);
  sleeve(r,[c[0],-.087,c[2]],y,-.005,.005,.043,.023,steel,12);
  pipe(r,[[c[0],-.027,c[2]],[c[0]+.041,-.027,c[2]-.035],[c[0]+.073,-.027,c[2]-.048]],.011,steel,8);
  turn(r,[c[0]+.073,-.027,c[2]-.057],z,[[-.008,.030],[0,.035],[.010,.014]],dark,{n:12});
}
function oilCooler(r){
  // The separate lower matrix on plate 17_1446 is wider at its top.
  const corners=[[-.445,-.149,.475],[-.445,.149,.475],[-.456,.103,.380],[-.456,-.103,.380]];
  const back=corners.map(([xx,yy,zz])=>[xx+.026,yy,zz]);
  r.polygon(corners,'#647174',false);r.polygon(back,steel,false);
  corners.forEach((p,i)=>r.polygon([p,back[i],back[(i+1)%4],corners[(i+1)%4]],alloy,false));
  for(let i=1;i<9;i++){const f=i/9,w=.103+.046*f;const xx=-.458+.011*f,zz=.38+.095*f;r.rod([xx,-w,zz],[xx,w,zz],.002,metal,5);}
  for(const s of [-1,1])pipe(r,[[-.426,s*.132,.46],[-.395,s*.152,.457],[-.32,s*.150,.402],[-.19,s*.142,.39]],.009,alloy,7);
}
const intake=system('intake','Ram air and throttle bodies','Follow air from the opening between the headlights, past the panel filter and into four throttle bores under the tank. Hose paths and casting contours are reconstructed.',refs.air,[
  component('duct','Center ram-air inlet','The mouth between the lamps narrows into the primary air duct through the steering-head area.',[-.15,0,.07],refs.duct,r=>intakeTube(r,[[-.813,.035,.699,.750],[-.745,.052,.726,.812],[-.63,.060,.792,.861],[-.479,.062,.823,.88],[-.347,.080,.814,.857]],'#475158',false)),
  component('airbox','Intake silencer','The airbox sits over the throttle bank. Open it to see the filter, its holder and the intake-length drive.',[0,.15,.19],refs.air,drawAirbox),
  component('filter','Air filter and retainer','Air passes through the folds of the replaceable element. The holder keeps the filter seated at the airbox inlet.',[-.08,-.12,.12],refs.air,r=>{
    r.box(-.293,-.132,.805,-.284,.132,.868,alloy);
    for(let j=0;j<18;j++){const yy=-.126+j*.014;r.rod([-.298,yy,.808],[-.298,yy,.866],.003,filter,5);}
  }),
  component('velocity','Variable-length intake funnels','Four flared mouths feed the throttle bank. The electric drive changes the effective length of the inlet tract.',[.11,0,.18],refs.air,r=>{
    for(const yy of bores)turn(r,[-.157,yy,.779],[.52,0,.85],[[0,.022],[.038,.024],[.060,.034],[.061,.031],[.035,.021],[0,.020]],dark,{n:12});
    cyl(r,[-.117,.153,.81],y,-.012,.025,.019,steel,12);
  }),
  component('throttles','Four throttle bodies and actuator','The four butterflies turn together on a transverse shaft. Open the bank to watch them move.',[.14,-.10,-.07],refs.throttle,r=>{
    for(const yy of bores)sleeve(r,[-.208,yy,.735],[.57,0,.82],-.030,.036,.029,.024,alloy,12);
    barrel(r,[-.208,-.172,.735],[-.208,.183,.735],.004,metal,8);
    r.box(-.227,.162,.712,-.185,.198,.751,rubber);
  })
]);
const cooling=system('cooling','Cooling and lubrication','A broad coolant radiator sits above a smaller oil cooler. The pump has separate fluid sections. Open the pump to follow its drive or inspect the mechanical face seal.',refs.pump,[
  component('radiator','Coolant radiator','Flat tubes discharge heat into the finned core ahead of the cylinder head. The end tanks connect to the hoses.',[-.17,0,.04],refs.radiator,drawRadiator),
  component('fan','Electric fan and shroud','The fan draws air through the radiator at low road speeds. Its motor sits behind the core.',[.13,0,.06],refs.fan,installedFan),
  component('hoses','Supply, return and bleed hoses','Two large hoses connect the radiator and engine. Smaller lines serve the expansion circuit. The paths here are schematic.',[0,-.14,0],refs.hoses,r=>{
    pipe(r,[[-.429,-.176,.694],[-.397,-.207,.705],[-.312,-.207,.710],[-.279,-.176,.678]],.014,rubber,9);
    pipe(r,[[-.454,.167,.515],[-.420,.185,.470],[-.307,.173,.429],[-.191,.147,.396],[-.105,.093,.378]],.014,rubber,9);
    pipe(r,[[-.406,-.17,.723],[-.38,-.20,.739],[-.343,-.204,.726]],.004,rubber,6);
  }),
  component('expansion','Expansion tank and cap','The shallow molded reservoir accepts expanding coolant. The filler neck and its cap sit above the body.',[0,-.16,.09],refs.bottle,r=>{
    r.profile([[-.38,.577],[-.313,.582],[-.244,.656],[-.248,.70],[-.319,.716],[-.368,.669]],-.202,-.183,'#a8b1a6');
    pipe(r,[[-.327,-.193,.702],[-.338,-.196,.737]],.011,'#a8b1a6',8);
    cyl(r,[-.339,-.196,.74],z,-.003,.007,.016,rubber,10);
  }),
  component('oil-cooler','Lower engine-oil cooler','The tapered oil cooler has its own pair of connections. The oil circuit carries heat here from the engine.',[-.10,.10,-.14],refs.cooler,oilCooler),
  component('pump','Chain-driven oil and coolant pump','Open the combined pump to see its sprocket, impeller, mechanical seal and oil transfer line.',[.10,.16,-.11],refs.pump,installedPump)
]);
const camX=[-.328,-.256],camZ=.727,chainY=.178;
const camDrive=system('cam-drive','Camshafts and timing drive','Look along the right end of the cylinder head to follow the timing chain around both cam sprockets. The inlet shaft has two shift segments. The exhaust shaft has a fixed profile.',refs.cams,[
  component('intake','ShiftCam intake shaft','Two segments slide along the intake shaft. Open it to see both lift profiles on each intake lobe pair.',[.08,-.13,.07],refs.shift,r=>{
    const xx=camX[1];barrel(r,[xx,-.169,camZ],[xx,.173,camZ],.010,metal,10);
    for(const yy of bores)for(const s of [-1,1]){
      const p=[xx+.004,yy+s*.017,camZ+.002];
      cyl(r,p,y,-.004,.003,.014,steel,10);cyl(r,[p[0]+.002,p[1]+.007,p[2]+.002],y,-.003,.003,.016,gold,10);
    }
  }),
  component('exhaust','Fixed exhaust camshaft','Eight exhaust lobes operate two exhaust valves per cylinder.',[-.08,.11,.09],refs.cams,r=>{
    const xx=camX[0];barrel(r,[xx,-.169,camZ],[xx,.172,camZ],.010,metal,10);
    for(const yy of bores)for(const s of [-1,1])cyl(r,[xx-.005,yy+s*.017,camZ+.002],y,-.005,.005,.016,steel,10);
  }),
  component('sprockets','Cam sprockets and reduction gear','The two upper sprockets sit on the cam axes. The chain returns around a reduction gear below the head.',[0,.14,0],refs.cams,r=>{
    for(const xx of camX)sleeve(r,[xx,chainY,camZ],y,-.005,.005,.028,.010,steel,16);
    sleeve(r,[-.189,chainY,.525],y,-.006,.006,.032,.009,steel,16);
  }),
  component('chain','Timing chain','The chain wraps the two cam wheels and the lower reduction wheel. The run is shown at the diagram’s level of detail.',[0,.17,.06],refs.cams,r=>{
    const loop=[[-.353,.725],[-.35,.746],[-.33,.757],[-.255,.757],[-.237,.749],[-.226,.731],[-.158,.53],[-.159,.514],[-.177,.497],[-.201,.497],[-.216,.510],[-.353,.725]];
    pipe(r,loop.map(([xx,zz])=>[xx,chainY,zz]),.006,dark,7);
  }),
  component('guides','Guide rails and chain tensioner','Narrow rails guide the two runs. A tensioner bears on the movable rail.',[-.09,.12,-.08],refs.cams,r=>{
    r.profile([[-.349,.707],[-.341,.712],[-.219,.522],[-.226,.516]],.165,.186,'#9e8765');
    r.profile([[-.220,.713],[-.212,.707],[-.155,.536],[-.163,.536]],.165,.186,'#9e8765');
    barrel(r,[-.163,.175,.619],[-.192,.175,.617],.011,alloy,10);
  })
]);
export const groups=[intake,cooling,camDrive,exhaust];
const legacy={'intake.airbox':'engine.airbox','cooling.radiator':'engine.cooling'};
export function drawGroup(r,id){
  const group=groups.find(g=>g.id===id);
  if(id==='exhaust'){
    const surfaces=r.faces.filter(f=>f.k67Exhaust);
    if(surfaces.length){
      if(r.inspection?.assembly!=='drive')for(const f of surfaces)f.part=f.k67Exhaust;
      return;
    }
  }
  for(const p of group?.parts||[]){
    const previous=legacy[p.id];
    if(previous){
      // The engine directory and the fluid circuit refer to the same physical component.
      // Retag its existing surface so the assembled bike has exactly one pick target.
      const installed=r.faces.filter(f=>f.part===previous);
      if(installed.length){if(r.inspection?.assembly!=='engine')for(const f of installed)f.part=p.id;continue;}
    }
    r.tag(p.id,()=>p.draw(r));
  }
}
function installedStudy(id,name,description,source,parts){
  return Object.assign(study(id,name,description,source,parts.map(p=>part(p.id.split('.')[1],p.name,p.description,p.offset,p.draw))),{viewAngle:[-.88,.39]});
}
const airStudy=installedStudy('k67-air-tray','Inside the intake silencer','The filter sits across the inlet. Four funnels in the clean-air chamber lead to the throttle bank beneath. Open the throttle bank to follow the shaft through the bores.',refs.air,intake.parts.filter(p=>p.id!=='intake.duct'));
const radiatorStudy=installedStudy('k67-radiator-pack','Front heat exchangers','The coolant radiator stands above the narrower oil cooler. The fan mounts on the engine side of the upper core. Open it to see its blades, motor and supports.',refs.radiator,cooling.parts.filter(p=>['cooling.radiator','cooling.fan','cooling.oil-cooler'].includes(p.id)));
const timingStudy=installedStudy('k67-timing','Timing chain and overhead cams','The two upper wheels align with the transverse camshafts. A reduction wheel and guides form the lower part of the drive. Open the intake shaft to inspect its shifting lobe pairs.',refs.cams,camDrive.parts);
const details=new Map([
  ['drive.exhaust',exhaustStudy],['exhaust.flaps',flapStudy],['k67-exhaust.flaps',flapStudy],
  ['engine.airbox',airStudy],['intake.airbox',airStudy],['intake.throttles',throttle],['k67-air-tray.throttles',throttle],
  ['engine.cooling',radiatorStudy],['cooling.radiator',radiatorStudy],['cooling.fan',fan],['k67-radiator-pack.fan',fan],
  ['cooling.pump',pump],['k67-combined-pump.seal',seal],['engine.head',timingStudy],['cam-drive.chain',timingStudy],
  ['cam-drive.intake',shift],['k67-timing.intake',shift]
]);
export function detailFor(partId){return details.get(partId)||null;}
