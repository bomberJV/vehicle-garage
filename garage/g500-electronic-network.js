import {transferMotorPlug} from './g500-propeller-shafts.js';
import {floorTop,on,drape} from './g500-cabin-routing.js';
// Original installed teaching geometry for the early US 463.249 electrical network.
// OEM location photographs establish compartments and relationships, not measured
// case dimensions or harness bends. Circuit boards below are functional sections;
// their chip positions, terminal counts and traces do not reproduce an OEM PCB.
import {drawDiagnosticSocket,diagnosticStudy,saeSocketDrawing} from './g500-diagnostic-socket.js';
import {part,study,cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';

const guide='https://www.fourbyfourclub.com/Manuals/';
const wis='https://charm.li/Mercedes%20Benz/2002/G%20500%20%28463.249%29%20V8-5.0L%20%28113.962%29/Repair%20and%20Diagnosis/';
const ref=(label,url)=>({label,url});
export const g500ElectronicSources={
 network:ref('Mercedes-Benz USA · early G-Class electrical training, 11/2001; revised 2/2003',guide+'W463249Electrical.pdf#page=17'),
 locations:ref('Mercedes-Benz USA · 463.249 component-location photographs, 2/2003',guide+'W463249ComponentLocation.pdf'),
 model:ref('Mercedes-Benz WIS · 2002 463.249 / M113.962 electrical and control-system index',wis),
 manual:ref('Mercedes-Benz · 2002 US G-Class manual, electrical controls and fuse locations','https://cdn.dealereprocess.org/cdn/servicemanuals/mercedesbenz/2002-gclass.pdf#page=300'),
 locks:ref('Mercedes-Benz WIS GF28.19-P-3000GA · transfer-case control in the 2002 model index',wis+'Transmission%20and%20Drivetrain/Transfer%20Case/Description%20and%20Operation/GF28.19-P-3000GA%20Transfer%20Case%20Control%2C%20Function/')
};
export const g500ElectronicAssemblyText='Inspect the engine, transmission, stability and transfer-case controllers alongside the two signal-acquisition modules, door and seat electronics, instruments and power supply. The redrawn network follows the early 463 CAN B and CAN C connector groups. Differential-lock and rear seat-heater controls retain their separate hardwired circuits. Locations follow factory photographs; harness bends and internal board layouts are illustrative.';
export const g500ElectronicAssemblySources=Object.values(g500ElectronicSources);
const black='#303a3e',alloy='#9ba6a5',metal='#7b8d92',gold='#b39a69',board='#456458',red='#a26050',brown='#756452',blue='#667f8b',green='#73978a';
const up=[0,0,.48],down=[0,0,-.42],left=[0,-.50,.04],right=[0,.50,.04],aft=[.50,0,.04];
const plus=(a,b)=>a.map((n,i)=>n+b[i]);
const box=(r,c,d,col)=>r.box(...c.map((n,i)=>n-d[i]/2),...c.map((n,i)=>n+d[i]/2),col);
const line=(r,pts,rad=.003,col=black)=>{const d=drape(pts,rad);for(let i=1;i<d.length;i++)r.rod(d[i-1],d[i],rad,col,6);};
function terminal(r,p,axis=z){sleeve(r,p,axis,-.003,.003,.008,.003,alloy,6);}

// All coordinates are shared model anchors, in metres. -Y is the driver's side.
const placed={
 prefuse:[.482,-.074,.754],jump:[-.810,-.680,.920],alternator:[-1.600,-.280,.690],starter:[-.965,.300,.713],
 ecu:[-.640,.710,1.075],tcm:[-.300,-.105,.729],esm:[-.290,0,.790],transfer:[.2425,0,.718],esp:[-.517,.485,.780],
 frontSam:[-.645,.565,1.065],rearSam:[.2425,-.005,.793],cluster:[-.480,-.415,1.291],eis:[-.465,-.202,1.158],
 column:[-.510,-.410,1.215],upper:[-.496,0,1.163],overhead:[-.361,0,1.904],comand:[-.509,0,1.054],
 locks:[-.469,0,1.263],abs:[-1.085,-.694,1.023],valves:[-.802,-.507,1.163],yaw:[-.130,-.060,.696],srs:[.0615,0,.702],
 rearHeat:[1.835,-.819,.911],rearRelays:[1.835,-.820,.824],canB6:[-.563,-.635,.994],canB4:[-.562,.735,.886],canB7:[-.449,.735,.836],canC:[-.120,.120,.759],
 doorFL:[-.180,-.855,.937],doorFR:[-.180,.855,.937],doorRL:[.660,-.855,1.005],doorRR:[.660,.855,1.005],
 seatL:[-.067,-.418,.665],seatR:[-.067,.418,.665],diagnostic:[-.446,-.616,.961],roofMotor:[1.770,-.789,1.125],
 maf:[-.786,-.028,1.192],throttle:[-.780,-.080,1.088],transferActuator:transferMotorPlug,transmissionPlug:[-.382,.110,.505]
};
// Units placed on the tunnel or under the seats rest on the fitted floor.
// Their planned positions predate the raised W463 tunnel, so each is lifted
// to clear the carpet under its footprint (plugs included) and no further.

const resting={tcm:[.205,.033,.145],transfer:[.225,.142+.058,.029],esm:[.148,.143+.058,.078],esp:[.211,.188+.058,.037],
 rearSam:[.246,.213+.058,.060],yaw:[.076,.058+.058,.025],srs:[.129,.102+.058,.030],canC:[.098,.040,.030],seatL:[.220,.084+.058,.025],seatR:[.220,.084+.058,.025]};
function settle(c,[w,h,t]){
 let top=-Infinity;
 for(const i of [-1,-.5,0,.5,1])for(const j of [-1,-.5,0,.5,1]){const f=floorTop(c[0]+i*w/2,c[1]+j*h/2);if(f!=null)top=Math.max(top,f);}
 return top>-Infinity&&c[2]-t/2<top+.004?[c[0],c[1],+(top+t/2+.004).toFixed(4)]:c;
}
export const g500ElectronicAnchors=Object.fromEntries(Object.entries(placed).map(([k,c])=>[k,resting[k]?settle(c,resting[k]):c]));
// The rear SAM sits on its own tray above the transfer-case module inside the console.
{const t=g500ElectronicAnchors.transfer,s=g500ElectronicAnchors.rearSam;s[2]=Math.max(s[2],+(t[2]+.029/2+.012+.030).toFixed(4));}
const A=g500ElectronicAnchors;
const modules={
 ecu:{c:A.ecu,size:[.225,.206,.035],axis:'y',metal:true,plugs:4},
 // The transmission controller stands on edge against the left wall of the console, plugs up.
 tcm:{c:A.tcm,size:[.205,.145,.033],axis:'y',plugs:2,metal:true,face:1},
 esm:{c:A.esm,size:[.148,.143,.078],plugs:2,face:1},
 transfer:{c:A.transfer,size:[.225,.142,.029],plugs:2,metal:true,face:1},
 esp:{c:A.esp,size:[.211,.188,.037],plugs:2,metal:true},
 'sam-front':{c:A.frontSam,size:[.212,.242,.046],axis:'y',plugs:5,sam:true},
 'sam-rear':{c:A.rearSam,size:[.246,.213,.060],plugs:5,sam:true,face:1},
 eis:{c:A.eis,size:[.100,.088,.055],axis:'x',plugs:2},
 'steering-column':{c:A.column,size:[.095,.087,.045],axis:'x',plugs:2},
 'upper-panel':{c:A.upper,size:[.160,.060,.029],axis:'x',plugs:2},
 'overhead-panel':{c:A.overhead,size:[.115,.230,.024],plugs:2},
 'comand-electronics':{c:A.comand,size:[.157,.110,.110],axis:'x',plugs:3,metal:true},
 'door-front-left':{c:A.doorFL,size:[.137,.218,.019],axis:'y',plugs:3,door:'left-front',side:-1},
 'door-front-right':{c:A.doorFR,size:[.137,.218,.019],axis:'y',plugs:3,door:'right-front',side:1},
 'door-rear-left':{c:A.doorRL,size:[.162,.115,.019],axis:'y',plugs:2,door:'left-rear',side:-1},
 'door-rear-right':{c:A.doorRR,size:[.162,.115,.019],axis:'y',plugs:2,door:'right-rear',side:1},
 'seat-left':{c:A.seatL,size:[.220,.084,.025],plugs:3},
 'seat-right':{c:A.seatR,size:[.220,.084,.025],plugs:3},
 'rear-seat-heat':{c:A.rearHeat,size:[.139,.110,.035],axis:'y',plugs:2},
 'srs-control':{c:A.srs,size:[.129,.102,.030],plugs:2,metal:true},
 'yaw-sensor':{c:A.yaw,size:[.076,.058,.025],plugs:1,metal:true}
};
function localPoint(m,u,v,w){return m.axis==='x'?[m.c[0]+w,m.c[1]+u,m.c[2]+v]:m.axis==='y'?[m.c[0]+u,m.c[1]+w,m.c[2]+v]:[m.c[0]+u,m.c[1]+v,m.c[2]+w];}
export const g500ElectronicPorts=Object.fromEntries(Object.entries(modules).map(([key,m])=>[key,localPoint(m,-(m.plugs-1)/2*m.size[0]*.76/m.plugs,(m.face||-1)*(m.size[1]/2+.020),0)]));
g500ElectronicPorts.cluster=[-.554,-.415,1.255];
g500ElectronicPorts['diff-lock-control']=[-.507,0,1.263];
const hubPort=c=>[c[0]-.0055,c[1],c[2]+.013];
function localBox(r,m,u,v,w,du,dv,dw,col){
 const c=localPoint(m,u,v,w),d=m.axis==='x'?[dw,du,dv]:m.axis==='y'?[du,dw,dv]:[du,dv,dw];box(r,c,d,col);
}
function controller(r,key){
 const m=modules[key],[w,h,t]=m.size;
 const draw=()=>{
  localBox(r,m,0,0,0,w,h,t,m.metal?alloy:black);
  localBox(r,m,0,0,t/2+.001,w*.94,h*.94,.004,m.metal?metal:'#394448');
  for(const u of [-w*.44,w*.44])for(const v of [-h*.42,h*.42]){
   localBox(r,m,u,v,t/2+.005,.011,.011,.004,alloy);
  }
  localBox(r,m,0,h*.13,t/2+.004,w*.40,h*.20,.002,'#b3b3a5');
  for(let i=0;i<m.plugs;i++){
   const u=(i-(m.plugs-1)/2)*w*.76/m.plugs,wide=w*.59/m.plugs;
   // Console units face their plugs toward the right-hand harness lane.
   const f=m.face||-1;
   localBox(r,m,u,f*(h/2+.009),0,wide,.022,t*.85,black);
   localBox(r,m,u,f*(h/2+.020),0,wide*.77,.003,t*.55,gold);
  }
  if(m.sam){
   // Fuse/relay sockets are visible in the training photographs. Counts below
   // communicate separate sockets without claiming a VIN-specific assignment.
   for(let i=0;i<5;i++)localBox(r,m,(i-2)*w*.15,h*.26,t/2+.012,w*.115,.022,.014,[red,blue,gold,green,blue][i]);
   for(let i=0;i<3;i++)localBox(r,m,(i-1)*w*.24,-h*.06,t/2+.025,w*.17,h*.20,.040,i===1?gold:black);
  }
 };
 if(m.door)r.rigid(m.door,[m.door.includes('front')?-.085:.11,m.side*(m.door.includes('front')?.63:.52),.04],draw);else draw();
}

// Engine and electrical views call these identical functions under their own
// alias tags. The existing engine dimensions and machine positions are retained.
export function drawG500ElectronicShared(r,key){
 if(key==='ecu'){controller(r,'ecu');return;}
 if(key==='alternator'){
  const c=[-1.655,-.28,.66];cyl(r,c,x,-.10,.02,.073,'#65747c',10);
  // The inner cylindrical wall of each small vent band is buried in the cast
  // housing. Omit that hidden wall while retaining both lips and the exterior.
  for(let i=0;i<5;i++){const a=-.09+i*.02;turn(r,c,x,[[a,.073],[a,.075],[a+.005,.075],[a+.005,.073]],black,{n:8});}
  sleeve(r,c,x,-.125,-.105,.052,.021,black,8);box(r,[-1.6175,-.28,.66],[.035,.08,.06],black);
  terminal(r,A.alternator);return;
 }
 if(key==='starter'){
  // The starter lies along the right side of the block and ends at the
  // engine/transmission joint, ahead of the bulkhead and above the crossmember.
  cyl(r,[-1.06,.26,.635],x,0,.18,.045,'#65747c',10);cyl(r,[-1.03,.30,.69],x,0,.11,.022,black,8);
  terminal(r,A.starter);return;
 }
}
function cluster(r){
 box(r,A.cluster,[.127,.356,.109],black);
 box(r,[-.548,-.415,1.255],[.022,.094,.026],black);
 r.box(-.414,-.585,1.242,-.410,-.245,1.342,black);
 for(const cy of [-.515,-.315]){
  cyl(r,[-.409,cy,1.293],x,0,.003,.039,alloy,24);cyl(r,[-.405,cy,1.293],x,0,.002,.035,black,24);
  for(let j=0;j<10;j++){const t=(j/9*1.5+.25)*Math.PI;line(r,[[-.401,cy+Math.cos(t)*.028,1.293+Math.sin(t)*.028],[-.401,cy+Math.cos(t)*.032,1.293+Math.sin(t)*.032]],.0011,alloy);}
  line(r,[[-.400,cy,1.293],[-.400,cy-.017,1.312]],.0015,red);
 }
 r.box(-.406,-.454,1.258,-.402,-.376,1.311,'#8b9183');
 for(let j=0;j<4;j++)r.box(-.401,-.449,1.263+j*.011,-.400,-.383,1.265+j*.011,'#46504c');
}
function lockPanel(r){
 box(r,A.locks,[.066,.115,.046],black);
 box(r,[-.504,0,1.263],[.016,.061,.022],black);
 for(let j=-1;j<=1;j++){
  r.box(-.432,j*.034-.013,1.248,-.428,j*.034+.013,1.278,black);
  for(const [zz,color] of [[1.274,gold],[1.251,red]])box(r,[-.426,j*.034,zz],[.003,.011,.004],color);
 }
}
function absUnit(r){
 box(r,A.abs,[.151,.113,.123],alloy);
 cyl(r,plus(A.abs,[.018,.087,-.005]),y,-.035,.024,.042,black,14);
 for(let i=0;i<6;i++){const p=plus(A.abs,[(i%3-1)*.043,(i<3?-.027:.027),.067]);cyl(r,p,z,-.005,.007,.009,gold,8);}
 box(r,plus(A.abs,[-.012,-.067,-.008]),[.100,.022,.075],black);
}
function lockValves(r){
 for(let i=-1;i<=1;i++){
  const c=plus(A.valves,[0,i*.055,0]);box(r,c,[.045,.045,.043],gold);box(r,plus(c,[.030,0,0]),[.017,.035,.035],black);
  for(const d of [-1,1])cyl(r,plus(c,[0,0,d*.023]),z,-.004,.004,.005,black,8);
 }
}
function busConnector(r,c,count=6){
 box(r,c,[.098,.026,.018],black);
 for(let i=0;i<count;i++){
  const xx=c[0]+(i-(count-1)/2)*.011;
  for(const s of [-1,1])box(r,[xx,c[1]+s*.007,c[2]+.011],[.006,.005,.005],s<0?brown:red);
 }
}
function twin(r,pts,colA=red,colB=brown){
 for(const [d,color] of [[-.007,colA],[.007,colB]])line(r,pts.map(p=>Object.assign([p[0],p[1]+d,p[2]],{floor:p.floor})),.0018,color);
}
export const g500CanBMembership={
 canB6:['eis','cluster','steering-column','door-front-left'],
 canB4:['upper-panel','overhead-panel','door-front-right','door-rear-right','seat-right','hvac.panel'],
 canB7:['sam-front','sam-rear','comand-electronics','seat-left','door-rear-left']
};
export const g500CanCMembership=['ecu','tcm','esm','transfer','esp','eis','cluster','steering-column'];
const keys={eis:'eis',cluster:'cluster','steering-column':'column','upper-panel':'upper','overhead-panel':'overhead','sam-front':'frontSam','sam-rear':'rearSam','comand-electronics':'comand','seat-left':'seatL','seat-right':'seatR','door-front-left':'doorFL','door-front-right':'doorFR','door-rear-left':'doorRL','door-rear-right':'doorRR','hvac.panel':null};
// A floor route from a kick-panel hub on side sgn to a console or seat unit.
// Units on the far side are reached around the back of the console.
function lowPath(sgn,dest){
 const near=Math.abs(dest[1])<.14||Math.sign(dest[1])===sgn;
 // Seat units are reached under the seat rails, level with the footwell carpet.
 const foot=s=>Math.abs(dest[1])>.2?[on(dest[0],s*.20)]:[];
 return near?[on(-.52,sgn*.158),on(dest[0],sgn*.158),...foot(sgn),on(dest[0],dest[1]),dest]:
  [on(-.52,sgn*.158),on(.45,sgn*.158),on(.45,-sgn*.158),on(dest[0],-sgn*.158),...foot(-sgn),on(dest[0],dest[1]),dest];
}
// Units in the console or under the front seats are wired along the floor.
const low=id=>['tcm','esm','transfer','sam-rear','srs-control','yaw-sensor','seat-left','seat-right'].includes(id);
const anchor=id=>id==='hvac.panel'?[-.447,0,.918]:(g500ElectronicPorts[id]||A[keys[id]||id]);
const targetId=id=>id.includes('.')?id:'electrical.'+id;
function bodyNetwork(r){
 twin(r,[hubPort(A.canB6),[-.61,-.54,.890],[-.61,.54,.890],hubPort(A.canB4)],black,brown);
 twin(r,[hubPort(A.canB4),[-.49,.705,.865],hubPort(A.canB7)],black,brown);
 for(const [hub,ids] of Object.entries(g500CanBMembership))for(const id of ids){
  const dest=anchor(id),base=hubPort(A[hub]);
  // Carry the overhead branch up the opaque right pillar before turning
  // across the header. A diagonal through the windscreen puts the wire in air.
  const path=id==='overhead-panel'?[base,[-.712,.813,1.335],[-.574,.810,1.620],
   [-.458,.805,1.851],[-.391,.798,1.901],[-.374,.380,1.909],dest]:
   id.startsWith('door-')?[base,[-.60,Math.sign(dest[1])*.739,.844],[dest[0],Math.sign(dest[1])*.777,.844],dest]:
   low(id)?[base,[-.50,base[1]*.71,.840],...lowPath(Math.sign(base[1]),dest)]:
   [base,[-.50,base[1]*.71,.840],[dest[0],dest[1],.840],dest];
  twin(r,path);
 }
}
function drivetrainNetwork(r){
 for(const key of g500CanCMembership){
  const dest=anchor(key),hub=hubPort(A.canC);
  // Console units are reached along the tunnel top; the rest leave under the
  // console's right edge and climb to the dashboard.
  // The pairs leave the connector's front end before dropping to the carpet.
  const out=[hub[0]-.065,hub[1],hub[2]];
  // The transmission controller's plugs face up, so its pair crosses above the selector module.
  twin(r,key==='tcm'?[hub,[hub[0],hub[1],.935],[dest[0],dest[1]+.03,.955],dest]:
   low(key)?[hub,out,on(out[0],hub[1]),on(dest[0],hub[1]),on(dest[0],dest[1]),dest]:
   [hub,out,on(out[0],hub[1]),on(out[0],.158),on(-.45,.158),[-.50,.218,.843],[dest[0],dest[1],.843],dest],green,blue);
 }
}
function primaryPower(r){
 const junction=[-.651,-.388,.742];
 // The cable rises from the prefuse beside the rear-seat battery and runs along the tunnel foot.
 line(r,[A.prefuse,on(.40,-.158),on(-.45,-.158),junction,[-.70,-.56,.88],[-.80,-.64,.955],A.jump],.009,red);
 // The starter cable leaves the jump-start terminal, crosses the back of the
 // engine bay above the bellhousing and drops to the starter on the right.
 line(r,[A.jump,[-.81,-.62,.955],[-.788,-.58,.87],[-.788,-.18,.925],[-.788,.18,.925],[-.80,.33,.83],[-.87,.33,.80],[-.93,.31,.75],A.starter],.008,red);
 // The charging cable follows the right side of the block above the pan rail,
 // passes over the engine-mount arm, drops in front of the pan and crosses
 // below the crank nose to the alternator.
 line(r,[A.starter,[-1.05,.262,.745],[-1.30,.262,.745],[-1.36,.262,.700],[-1.56,.262,.700],[-1.648,.165,.600],[-1.648,-.205,.600],A.alternator],.007,red);
}
function engineGround(r){
 const a=[-1.107,-.324,.485],b=[-1.003,-.465,.475];
 for(const d of [-.008,0,.008])line(r,[plus(a,[d,0,0]),[-1.05+d,-.392,.452],plus(b,[d,0,0])],.0035,metal);
 terminal(r,a);terminal(r,b);
}
function engineHarness(r){
 const bulk=[-.694,.598,1.125];line(r,[g500ElectronicPorts.ecu,[-.742,.685,1.125],bulk,[-.747,.337,1.147],A.maf],.0055,black);
 line(r,[bulk,[-.763,.184,1.105],A.throttle],.004,black);
 for(const s of [-1,1]){
  const start=[-.824,s*.458,1.157];line(r,[bulk,[-.74,s*.458,1.15],start,[-1.50,s*.458,1.157]],.0045,black);
  for(const xx of [-1.475,-1.315,-1.155,-.995])line(r,[[xx,s*.458,1.157],[xx,s*.429,1.166]],.0028,black);
 }
}
function lightingHarness(r){
 for(const s of [-1,1]){
  const nose=[-2.063,s*.680,1.024];line(r,[A.frontSam,[-.72,s*.688,1.157],[-1.68,s*.688,1.157],nose],.004,black);
  line(r,[nose,[-2.05,s*.65,1.169],[-2.04,s*.70,1.288]],.0028,black);
  // Rear lamp runs leave the console along the tunnel foot, follow the sill and
  // climb over the rear wheelhouse instead of passing through the wheel.
  const sp=g500ElectronicPorts['sam-rear'];
  line(r,[sp,on(sp[0],sp[1]),on(sp[0],.158),on(.45,.158),...(s<0?[on(.45,-.158)]:[]),on(.48,s*.60),[.50,s*.709,.744],[.95,s*.757,.737],[1.00,s*.757,.900],[1.88,s*.757,.900],[2.130,s*.692,.897]],.004,black);
 }
}
function lockCircuit(r){
 line(r,[g500ElectronicPorts['diff-lock-control'],[-.59,-.15,1.168],A.valves],.0035,black);
 const sp=g500ElectronicPorts['sam-rear'];
 line(r,[sp,on(sp[0],sp[1]),on(sp[0],.158),on(-.40,.158),[-.49,.15,1.00],g500ElectronicPorts['diff-lock-control']],.0035,black);
}
function roofCircuit(r){const sp=g500ElectronicPorts['sam-rear'];line(r,[sp,on(sp[0],sp[1]),on(sp[0],.158),on(.45,.158),on(.45,-.158),on(.48,-.60),[.50,-.709,.744],[.95,-.765,.751],[1.00,-.765,.910],[1.70,-.765,.950],[1.765,-.775,.960],A.roofMotor],.004,black);}
function chassisControl(r){
  // Both drivetrain leads drop through grommets in the tunnel to their plugs.
  const tp=g500ElectronicPorts.transfer,cp=g500ElectronicPorts.tcm;
  line(r,[tp,on(tp[0],tp[1]),on(.178,.113),[.082,.211,.640],A.transferActuator],.004,black);
 line(r,[cp,[cp[0],cp[1],cp[2]+.012],[-.41,cp[1],cp[2]+.012],on(-.41,-.125),[-.470,.058,.612],A.transmissionPlug],.004,black);
 const ep=g500ElectronicPorts.esp;line(r,[ep,[ep[0],ep[1]-.025,ep[2]],[-.650,ep[1]-.025,.800],[-.650,.514,.827],[-.715,.43,1.22],[-.728,.42,1.235],[-.728,-.55,1.235],[-1.02,-.756,1.139],plus(A.abs,[-.012,-.078,-.008])],.004,black);
 // The yaw-sensor lead passes under the front of the console to the sensor's plug.
 const yp=g500ElectronicPorts['yaw-sensor'];
 line(r,[g500ElectronicPorts.esp,on(-.45,.158),on(-.47,.158),on(-.47,-.13),on(yp[0],-.13),on(yp[0],yp[1]),yp],.003,black);
}
function rearHeaterCircuit(r){
 const start=g500ElectronicPorts['rear-seat-heat'];
 line(r,[A.prefuse,on(.40,-.158),on(.47,-.60),[.50,-.701,.744],[.95,-.749,.737],[1.00,-.749,.890],[1.80,-.749,.890],start],.004,black);
 // The branches cross the cargo floor inboard of the wheelhouses and run
 // forward over the kick-up to the cushion mats.
 for(const s of [-1,1])line(r,[start,[1.80,-.70,.900],[1.70,-.35,.748],...(s>0?[[1.70,.35,.748]]:[]),[1.05,s*.35,.748],[.86,s*.530,.751]],.003,black);
}
function relayBank(r){
 for(let i=0;i<3;i++){box(r,plus(A.rearRelays,[(i-1)*.043,0,0]),[.032,.034,.040],i===1?gold:black);}
 box(r,plus(A.rearRelays,[0,.008,-.024]),[.15,.034,.008],metal);
}

const rows=[];
function row(id,name,description,source,draw,connectsTo=[],location='',offset=down){
 rows.push([id,name,description,offset,source,draw,{connectsTo,location}]);
}
for(const [key,name,desc,links] of [
 ['ecu','ME-SFI engine controller · N3/10','The engine controller sits under the passenger-side dashboard with the front SAM and above the footwell electronics. Its harness reaches the air meter, throttle and ignition coils. The original engine-bay placeholder is replaced by this shared installed case.',['electrical.engine-harness','electrical.can-c','electrical.primary-power']],
 ['tcm','Electronic transmission controller · N15/3','The separate transmission controller lies beside the forward part of the center tunnel. It exchanges drivetrain information over CAN C with the engine, selector and other chassis controllers.',['electrical.esm','electrical.can-c','powertrain.transmission']],
 ['esm','Electronic selector module · N15/5','The selector electronics sit beneath the gear lever. This module reports the lever position to the drivetrain network; it is distinct from the transmission controller.',['electrical.tcm','electrical.transfer','electrical.can-c']],
 ['transfer','Transfer-case controller · N15/7','The transfer-case controller lies under the rear SAM in the center console. It receives the range request and drivetrain information and controls the electric range actuator. The differential-lock switch group is a separate circuit.',['electrical.esm','electrical.can-c','differentials.center']],
 ['esp','Stability controller · N30/4','The US electrical literature calls this the ESP module N30/4; the diagnostic legend also uses N47/5. The case sits in the right front footwell. It links steering and motion information with the hydraulic unit.',['electrical.abs-unit','electrical.yaw-sensor','electrical.can-c']],
 ['sam-front','Front signal-acquisition module · N10/1','The front SAM is under the passenger-side dashboard, beside the engine controller and blower. Its fused and switched outputs serve front electrical loads. Its case, plug carriers, fuses and relays are separately inspectable.',['electrical.can-b','electrical.dashboard','electrical.primary-power','electrical.lighting-harness']],
 ['sam-rear','Rear signal-acquisition module · N10/2','The rear SAM sits in the center console above the transfer-case controller. It combines switching, fuses and relays for rear loads; it is not located at the back of the cargo area.',['electrical.can-b','electrical.transfer','electrical.roof-circuit','electrical.rear-relays','electrical.lighting-harness','fuel.delivery']],
 ['eis','Electronic ignition switch · N73','The electronic ignition switch sits beside the steering wheel. The early network drawing connects it to the interior and drivetrain buses. The model shows its case and connectors without reproducing key authorization data.',['electrical.can-b','electrical.can-c','electrical.starter']],
 ['steering-column','Steering-column electronics · N80','The column module is below the steering wheel and communicates with both network domains in the early drawing. The physical reach and height motors are separate parts of the column adjustment mechanism.',['electrical.can-b','electrical.can-c','column-adjustment.reach-motor','column-adjustment.height-motor']],
 ['upper-panel','Upper control-panel electronics · N72/1','The upper control panel communicates on CAN B and carries cabin switches, including front seat-heating requests. Its electronics are behind the existing center fascia.',['electrical.can-b','seat-heating.front-switches']],
 ['overhead-panel','Overhead control-panel electronics · N70','The overhead panel sits near the mirror above the windshield and is an interior-bus node. The roof motor remains at the left rear of the cargo area; this panel is not a second roof drive.',['electrical.can-b','electrical.roof-circuit','roof.drive']],
 ['comand-electronics','COMAND head-unit electronics · A40/3','The head unit sits behind the existing center display. Its interior-bus connection is shown. The optional D2B audio and telephone ring requires the equipment list, so the model does not assume a particular amplifier or telephone installation.',['electrical.can-b']]
])row(key,name,desc,g500ElectronicSources.locations,r=>key==='ecu'?(r.inspection?.assembly==='powertrain'?null:drawG500ElectronicShared(r,key)):controller(r,key),links,'Factory compartment from the component-location photographs; case dimensions are illustrative.');
for(const [key,label] of [['alternator','Alternator and output stud · G2'],['starter','Starter motor and solenoid · M1']])row(key,label,key==='alternator'?'The belt-driven alternator shares one physical casing with the engine view. Its output stud joins the primary charging cable. Open the functional section to separate the rotor, stator, rectifier and pulley.':'The starter and its solenoid share one physical installation with the engine view at the engine/transmission joint. The heavy cable terminates at its supply stud.',g500ElectronicSources.network,r=>{if(r.inspection?.assembly!=='powertrain')drawG500ElectronicShared(r,key);},['electrical.primary-power','electrical.engine-ground',key==='alternator'?'powertrain.belt':'powertrain.transmission']);
for(const [key,label,num,bus] of [['door-front-left','Left front',1,'canB6'],['door-front-right','Right front',2,'canB4'],['door-rear-left','Left rear',3,'canB7'],['door-rear-right','Right rear',4,'canB4']])row(key,label+' door controller · N69/'+num,'The controller is mounted inside the door behind its trim. It connects the door’s electrical equipment to CAN B. The complete case and its plug carrier move with the same door shell.',g500ElectronicSources.locations,r=>controller(r,key),['electrical.can-b'],bus+' branch; behind the door card.',key.includes('left')?left:right);
for(const [key,label,num] of [['seat-left','Left',1],['seat-right','Right',2]])row(key,label+' seat-adjustment controller · N32/'+num,'The seat-adjustment controller is beneath the front seat. It receives interior-bus commands and switches the seat drives; the heater elements are separate components.',g500ElectronicSources.locations,r=>controller(r,key),['electrical.can-b','electrical.comfort-harness'],'Under the front seat frame.');
row('rear-seat-heat','Rear seat-heater controller · N25/6','The rear heater module is behind the left cargo trim below the audio equipment shelf. The early network drawing explicitly leaves it off CAN. Its hardwired branch connects the rear switches and heating elements.',g500ElectronicSources.network,r=>controller(r,'rear-seat-heat'),['electrical.tunnel','seat-heating.rear-switches','seat-heating.rear-left-cushion','seat-heating.rear-right-cushion'],'Left rear cargo side, separate from the rear SAM.');
row('srs-control','Restraint-system controller · N2/7','The restraint controller is fixed to the center tunnel. The model locates its housing and diagnostic connection; it does not reconstruct deployment electronics or squib wiring.',g500ElectronicSources.locations,r=>controller(r,'srs-control'),['electrical.diagnostic'],'Center tunnel near the selector.');
row('yaw-sensor','Yaw and lateral-acceleration sensor · B24/9','This sensor is secured to the tunnel behind the selector area. Its mounting orientation gives the stability controller a body-fixed reference for vehicle motion.',g500ElectronicSources.locations,r=>controller(r,'yaw-sensor'),['electrical.esp'],'Rear part of the front tunnel, below the console.');
row('cluster','Instrument cluster · A1','The two main dials flank the central information display. The rear housing and connectors sit inside the binnacle. A1 appears on both CAN B and CAN C in the early 463 drawing.',g500ElectronicSources.network,cluster,['electrical.can-b','electrical.can-c'],'Driver’s instrument binnacle.',up);
row('diff-lock-control','Differential-lock switches and controller · S76 / N30/2','The three switches have separate amber request and red engagement indicators. This hardwired lock-control group is separate from the CAN-connected transfer-case range controller.',g500ElectronicSources.manual,lockPanel,['electrical.lock-circuit','electrical.lock-valves','differentials.center','differentials.rear','differentials.front'],'Center dashboard above the head unit.',aft);
row('abs-unit','ABS/traction hydraulic unit · A7/3','The hydraulic block, electric pump and electrical connector sit along the driver’s side of the engine bay. The electrical route links it with the footwell stability controller. Brake-port routing and the valve internals remain simplified.',g500ElectronicSources.locations,absUnit,['electrical.esp','brakes.hydraulics'],'Driver-side engine compartment beside the inner wing.');
row('lock-valves','Three lock switchover solenoids · Y68 / Y68/1 / Y68/2','The three electric switchover valves sit together near the driver-side firewall. They direct vacuum for the center, rear and front differential-lock actuation. Their electrical feed comes from the separate lock circuit.',g500ElectronicSources.locations,lockValves,['electrical.diff-lock-control','electrical.lock-circuit','differentials.center','differentials.rear','differentials.front'],'Driver-side rear of the engine compartment.');
row('rear-relays','Cargo-side relay bank · N36 / K44 / K68','A separate left-rear bank contains the output-speed signal module, tailgate central-locking relay and rear-wiper relay. These are distinct from the relays above the center-console rear SAM.',g500ElectronicSources.locations,relayBank,['electrical.sam-rear','electrical.rear-seat-heat'],'Left rear cargo side, below the equipment shelf.');
row('can-b-connectors','Interior bus connector blocks · X30/6, X30/4 and X30/7','X30/6 lies under the driver’s dashboard. X30/4 and X30/7 sit in the passenger kick panel behind its protective sheet. The blocks join paired interior-bus branches; they are not electronic gateways.',g500ElectronicSources.network,r=>{for(const key of ['canB6','canB4','canB7'])busConnector(r,A[key]);},['electrical.can-b'],'Driver underdash and right kick panel.');
row('can-c-connector','Drivetrain bus connector · X63/4','The drivetrain connector lies on the right side of the center console. It joins the engine, transmission, selector, stability, transfer-case, instrument and steering-column network endpoints shown in the early training drawing.',g500ElectronicSources.network,r=>busConnector(r,A.canC,8),['electrical.can-c'],'Right side of the center console.');
row('can-b','CAN B interior-network branches','The paired branches join the three connector blocks to the body, door, seat, climate and instrument modules. Black-and-brown jumpers join the blocks; red-and-brown pairs mark the other branches. The drawing shows endpoints, not a measured harness or terminal schedule.',g500ElectronicSources.network,bodyNetwork,['electrical.can-b-connectors',...Object.values(g500CanBMembership).flat().map(targetId)]);
row('can-c','CAN C drivetrain-network branches','A separate paired network links the drivetrain controllers through X63/4. Its green-and-blue display colors distinguish it from the interior network; these display colors are not a claim about the factory harness.',g500ElectronicSources.network,drivetrainNetwork,['electrical.can-c-connector',...g500CanCMembership.map(targetId)]);
row('engine-harness','Engine-control harness endpoints','A branch from the passenger-side controller crosses the bulkhead to the existing air meter and rear throttle. Two further branches reach the eight coil connectors. Sensor and actuator destinations are drawn; the terminal schedule and full loom wrapping are omitted.',g500ElectronicSources.model,engineHarness,['electrical.ecu','intake.maf','intake.throttle','powertrain.coils']);
row('primary-power','Primary starter and charging cables','The heavy supply leaves the existing cabin prefuse connection and reaches the engine-bay jump point, starter and alternator. The existing short battery-to-prefuse lead remains a single shared connection. Routing through the body is approximate.',g500ElectronicSources.network,primaryPower,['electrical.battery','electrical.battery-box','electrical.starter','electrical.alternator','powertrain.battery']);
row('engine-ground','Engine-to-chassis ground strap','The braided strap bonds the engine to the chassis, completing the high-current return path. The cabin battery’s existing body ground is retained separately. The strap width and attachment stations are illustrative.',g500ElectronicSources.network,engineGround,['electrical.battery','electrical.starter','electrical.alternator']);
row('lighting-harness','Front and rear lighting branches','The front and rear SAM routes reach the existing headlamp, raised front-signal and tail-lamp regions. The early documentation identifies electronic lamp protection in the SAMs; the external lamps remain the original lighting assembly parts.',g500ElectronicSources.network,lightingHarness,['electrical.sam-front','electrical.sam-rear','lighting.headlamp','lighting.indicator','lighting.tail-left','lighting.tail-right']);
row('lock-circuit','Hardwired differential-lock circuit','The console feed reaches the three-button lock group and the firewall switchover-valve bank. This route is deliberately separate from CAN B and CAN C. Valve and lock-feedback wire terminals are not reconstructed.',g500ElectronicSources.model,lockCircuit,['electrical.sam-rear','electrical.diff-lock-control','electrical.lock-valves']);
row('roof-circuit','Rear SAM to sunroof-drive supply','The rear electrical supply follows the left body side to the existing sunroof motor behind the cargo trim. It ends at the same physical motor shown in the roof assembly; no second drive is drawn.',g500ElectronicSources.network,roofCircuit,['electrical.sam-rear','electrical.overhead-panel','roof.drive']);
row('chassis-control-harness','Transmission, range and stability-control connections','Separate branches connect the transmission controller to the gearbox, the range controller to the existing transfer-case motor, and the stability controller to its hydraulic unit and yaw sensor. These are dedicated control circuits, separate from the paired data buses.',g500ElectronicSources.locks,chassisControl,['electrical.tcm','electrical.transfer','electrical.esp','electrical.abs-unit','electrical.yaw-sensor','drivetrain.gearbox','differentials.center']);
row('rear-heater-circuit','Hardwired rear seat-heater supply and branches','The supply reaches the left cargo-side heater controller and returns to the two outboard rear seating positions. This controller remains outside the CAN network. The existing pads and switches keep their original geometry.',g500ElectronicSources.network,rearHeaterCircuit,['electrical.rear-seat-heat','electrical.battery-box','seat-heating.rear-left-cushion','seat-heating.rear-right-cushion']);
row('diagnostic','Diagnostic connector · X11/4','The socket beneath the driver’s dashboard has a trapezoidal face and one continuous guide slot. Open it to inspect the two rows of cavities and a sample terminal.',saeSocketDrawing,r=>drawDiagnosticSocket(r,(u,v,d)=>[A.diagnostic[0]+u/1000,A.diagnostic[1]+v/1000,A.diagnostic[2]-d/1000]),['electrical.ecu','electrical.tcm','electrical.esp','electrical.srs-control']);
export const g500ElectronicNetworkRows=rows;

function moduleStudy(key,name,sam=false){
 const id='g500-electronics-'+key;
 const parts=[
  part('tray','Case and mounting tray','The lower case supports the board and transfers mounting loads to the vehicle. Its form is a representative section.',down,r=>{box(r,[0,0,-.06],[.82,.56,.025],alloy);for(const yy of [-.272,.272])box(r,[0,yy,-.016],[.82,.016,.066],metal);}),
  part('cover','Protective cover','The removable cover closes the case above its board and connector edge.',up,r=>box(r,[0,0,.101],[.82,.56,.018],metal)),
  part('board','Circuit-board carrier','The board provides insulated support and conductive paths. The displayed traces and component positions are illustrative, not a reconstructed Mercedes circuit board.',[0,.48,.10],r=>{box(r,[0,0,-.013],[.75,.48,.009],board);for(let i=0;i<6;i++)line(r,[[-.31,-.18+i*.06,-.007],[-.15,-.18+i*.06,-.007],[-.08,-.10+i*.035,-.007],[.28,-.10+i*.035,-.007]],.002,gold);}),
  part('logic','Processing and switching functions','These representative packages distinguish low-power signal processing from power-output switching. Package positions and counts are not factory specifications.',[.48,0,.16],r=>{box(r,[-.12,.03,.010],[.12,.11,.024],black);for(const yy of [-.13,.13])box(r,[.18,yy,.010],[.09,.056,.027],black);}),
  part('connectors','Connector carrier and contacts','The insulating carrier holds the conductor terminals. Separate contact fingers enter the harness plug. Contact count and terminal assignments are intentionally schematic.',left,r=>{box(r,[0,-.273,.015],[.66,.047,.055],black);for(let i=0;i<12;i++)box(r,[(i-5.5)*.046,-.291,.014],[.014,.08,.009],gold);})
 ];
 if(sam)parts.push(part('relays','Fuse and relay sockets','Individual fuse and relay sockets separate protected supply branches from switched outputs. The study shows their construction rather than assigning a fuse rating.',[.4,.4,.2],r=>{for(const xx of [-.22,0,.22]){box(r,[xx,.07,.052],[.13,.10,.077],black);box(r,[xx,-.12,.045],[.052,.04,.061],xx===0?red:blue);}}));
 return study(id,name,'Open the case, board, functional packages and connector carrier. The factory references establish the installed controller and its network role; this section explains construction without claiming an exact internal board layout.',g500ElectronicSources.network,parts);
}
function connectorStudy(){return study('g500-network-connector','Bus connector and paired conductors','The terminal block joins matching conductors while the insulating carrier keeps the two bus lines apart. The section illustrates construction; it does not specify terminal numbers or diagnostic test points.',g500ElectronicSources.network,[
 part('carrier','Insulating carrier','The carrier locates adjacent connector sockets.',down,r=>box(r,[0,0,0],[.64,.22,.11],black)),
 part('contacts','Contact strips','Separate contact strips join matching branch conductors.',right,r=>{for(const s of [-1,1])box(r,[0,s*.060,.062],[.55,.026,.015],gold);}),
 part('plugs','Branch plugs','Each plug holds a pair of contacts and latches into the carrier.',up,r=>{for(const xx of [-.22,0,.22])box(r,[xx,0,.127],[.13,.19,.11],black);}),
 part('conductors','Two insulated conductors','The paired paths remain separate. Their colors identify the displayed network rather than an arbitrary shared power wire.',left,r=>{for(const s of [-1,1])line(r,[[-.27,s*.06,.20],[-.40,s*.06,.25],[-.63,s*.06,.25]],.015,s<0?red:brown);})
]);}
function machineStudy(type){
 const alternator=type==='alternator';
 return study('g500-'+type+'-electrical',alternator?'Alternator · rotating field and rectifier':'Starter · motor and solenoid',alternator?'A functional alternator section separates the rotating magnetic field, stationary windings, rectifier and belt pulley. Internal proportions and winding details are illustrative.':'A functional starter section separates the electric motor, solenoid and pinion drive. The installed machine is shared with the engine model; this is not a measured service section.',g500ElectronicSources.network,[
  part('case','Housing','The housing supports the rotating assembly and mounts the machine to the engine.',down,r=>sleeve(r,[0,0,0],x,-.43,.30,.22,.188,alloy,24)),
  part('rotor',alternator?'Rotor and shaft':'Armature and shaft','The shaft turns inside the supporting case. The representative copper windings show the electrical and mechanical relationship.',left,r=>{cyl(r,[0,0,0],x,-.50,.42,.033,metal,14);cyl(r,[0,0,0],x,-.31,.20,.13,alternator?metal:gold,20);}),
  part('windings',alternator?'Stator windings':'Field and brush carrier','The stationary electrical parts surround or supply the rotating assembly. The winding pattern is simplified.',up,r=>{for(let i=0;i<10;i++){const a=i*Math.PI/5;cyl(r,[0,Math.cos(a)*.165,Math.sin(a)*.165],x,-.30,.17,.020,gold,8);}}),
  part('output',alternator?'Rectifier and output connection':'Solenoid and supply contacts',alternator?'The rectifier converts the generated alternating current to a charging output. Its arrangement is representative.':'The solenoid combines the high-current contact function with the drive-engagement action. Terminal construction is simplified.',right,r=>{if(alternator){sleeve(r,[0,0,0],x,.21,.25,.18,.045,black,16);for(const s of [-1,1])cyl(r,[.29,s*.10,.08],x,-.02,.04,.018,gold,8);}else{cyl(r,[0,.25,.04],x,-.22,.18,.082,black,16);for(const xx of [-.17,.13])cyl(r,[xx,.25,.13],z,0,.05,.018,gold,8);}}),
  part('drive',alternator?'Belt pulley':'Drive pinion',alternator?'The belt pulley transfers engine rotation to the alternator shaft.':'The drive pinion engages the engine’s ring-gear region during starting. Tooth form and drive travel are schematic.',aft,r=>{sleeve(r,[0,0,0],x,-.55,-.48,alternator?.18:.105,.035,metal,20);})
 ]);
}
const connector=connectorStudy(),studies=new Map();
for(const row of rows){
 const [key,name]=row;
 studies.set('electrical.'+key,modules[key]?moduleStudy(key,name,!!modules[key].sam):connector);
}
for(const key of ['ecu','starter','alternator']){
 const d=key==='ecu'?studies.get('electrical.ecu'):machineStudy(key);studies.set('electrical.'+key,d);studies.set('powertrain.'+key,d);
}
studies.set('electrical.cluster',study('g500-instrument-electronics','Instrument cluster · dials, display and rear electronics','The two circular gauges and central display share a rear case and electrical carrier. Dial spacing follows the visible early cluster; hidden board positions are illustrative.',g500ElectronicSources.manual,[
 part('case','Rear housing and mounts','The rear housing supports the dial and display carrier inside the instrument binnacle.',down,r=>{box(r,[0,0,-.07],[.94,.35,.09],black);}),
 part('dials','Two dial carriers','Two round dial faces flank the rectangular information display.',left,r=>{for(const xx of [-.32,.32]){cyl(r,[xx,0,0],z,0,.025,.133,black,28);sleeve(r,[xx,0,0],z,.023,.032,.136,.125,alloy,28);}}),
 part('pointers','Gauge pointers','The pointers turn over their respective dial faces. Their displayed positions are illustrative.',up,r=>{for(const xx of [-.32,.32])line(r,[[xx,0,.039],[xx-.06,.08,.039]],.005,red);}),
 part('display','Central display and window','The rectangular display sits between the two main dials.',right,r=>{box(r,[0,0,.025],[.24,.23,.025],'#899180');for(let j=0;j<5;j++)box(r,[0,-.08+j*.04,.040],[.19,.006,.002],black);}),
 part('rear-board','Rear circuit carrier and plugs','The circuit carrier links the instruments to the vehicle connector. Its detailed layout and pin assignments are omitted.',[0,.60,-.15],r=>{box(r,[0,0,-.008],[.85,.27,.008],board);box(r,[0,-.17,-.011],[.27,.06,.048],black);})
]));
studies.set('electrical.diff-lock-control',study('g500-lock-switch-electronics','Lock switch group · buttons and engagement lamps','Three separate requests and three engagement indications occupy the center switch group. The section explains the switch stack; it does not prescribe lock operation or reproduce an internal circuit.',g500ElectronicSources.manual,[
 part('case','Switch carrier','The carrier locates three adjacent switches in the dashboard.',down,r=>box(r,[0,0,-.045],[.80,.30,.11],black)),
 part('buttons','Three switch caps','Each cap bears on its own contact mechanism.',up,r=>{for(const xx of [-.26,0,.26])box(r,[xx,0,.048],[.22,.25,.065],black);}),
 part('contacts','Switch contacts','The contact carrier turns each button movement into an electrical request. Contact shapes are representative.',left,r=>{for(const xx of [-.26,0,.26]){box(r,[xx,0,.003],[.18,.19,.012],board);line(r,[[xx-.05,0,.018],[xx+.05,0,.018]],.005,gold);}}),
 part('indicators','Amber and red indicators','The two colors distinguish the request indication from confirmed engagement in the operator’s manual.',right,r=>{for(const xx of [-.26,0,.26])for(const [yy,col] of [[-.084,red],[.084,gold]])box(r,[xx,yy,.095],[.072,.025,.020],col);}),
 part('plug','Rear electrical connection','A single carrier holds the switch-group harness connection. The terminal schedule is omitted.',aft,r=>box(r,[0,.18,-.04],[.37,.10,.08],black))
]));
studies.set('electrical.abs-unit',study('g500-abs-electrical','ABS hydraulic unit · block, pump and electrical interface','The installed unit separates into the hydraulic carrier, electric pump, valve-electronics interface and line fittings. The model explains their relationship without reconstructing internal brake passages or calibration.',g500ElectronicSources.locations,[
 part('block','Hydraulic carrier','The carrier supports the externally visible brake-line fittings and the pump interface.',down,r=>box(r,[0,0,0],[.55,.34,.29],alloy)),
 part('pump','Electric pump','The separate electric motor drives the pump assembly attached to the block.',right,r=>cyl(r,[0,.31,-.02],x,-.27,.27,.13,black,24)),
 part('electronics','Electrical valve interface','The electrical carrier connects the controller harness to the hydraulic unit. Internal valve windings are not exposed by the location photograph.',left,r=>box(r,[0,-.22,0],[.49,.09,.24],black)),
 part('fittings','Brake-line fittings','The threaded external fittings sit above the block. Their hole positions are schematic.',up,r=>{for(const xx of [-.16,0,.16])for(const yy of [-.09,.09]){cyl(r,[xx,yy,.18],z,-.025,.018,.027,gold,8);sleeve(r,[xx,yy,.18],z,.018,.045,.021,.008,alloy,12);}}),
 part('plug','Controller harness plug','The plug is distinct from the hydraulic fittings.',aft,r=>box(r,[.23,-.28,0],[.14,.14,.17],black))
]));
studies.set('electrical.lock-valves',study('g500-lock-valve-electrical','Lock switchover valve · coil, body and ports','A functional section separates an electromagnetic coil from the pneumatic valve body, moving core and connector. The OEM layout establishes three separate valves; internal dimensions here are illustrative.',g500ElectronicSources.locations,[
 part('body','Pneumatic valve body','Separate ports enter the valve body. They are kept distinct from its electrical connection.',down,r=>{box(r,[0,0,0],[.40,.25,.25],gold);for(const zz of [-.18,.18])sleeve(r,[0,0,zz],z,-.055,.055,.045,.022,black,16);}),
 part('coil','Electromagnetic coil','The insulated winding surrounds the magnetic core and converts electrical current to magnetic force.',left,r=>{sleeve(r,[.30,0,0],x,-.13,.13,.135,.075,black,24);for(let j=0;j<10;j++)sleeve(r,[.30,0,0],x,-.10+j*.02,-.094+j*.02,.141,.135,gold,16);}),
 part('core','Moving magnetic core','A ferromagnetic core changes the valve’s flow state. Its travel and internal profile are schematic.',right,r=>cyl(r,[.19,0,0],x,-.15,.18,.043,metal,16)),
 part('connector','Electrical plug','The electrical terminal carrier attaches to the coil assembly.',up,r=>box(r,[.30,.18,0],[.16,.12,.12],black))
]));
const loom=study('g500-electrical-loom','Harness section · conductor, insulation and plug','The section explains a physical harness connection. Conductor size, strand count, bends and terminal shape are illustrative; the linked factory diagram supplies the actual circuit identity.',g500ElectronicSources.network,[
 part('conductor','Conductive strands','A bundle of metal strands carries current while remaining flexible.',left,r=>{for(const yy of [-.015,0,.015])for(const zz of [-.015,0,.015])cyl(r,[0,yy,zz],x,-.46,.19,.006,gold,8);}),
 part('insulation','Insulating jacket','The polymer jacket separates the conductor from adjacent metal and other circuits.',up,r=>sleeve(r,[0,0,0],x,-.42,.12,.050,.033,black,24)),
 part('terminal','Crimp terminal','The terminal joins the wire to a rigid contact. Its barrel and contact surface have separate forms.',right,r=>{sleeve(r,[0,0,0],x,.13,.27,.038,.025,alloy,18);box(r,[.35,0,0],[.19,.07,.019],gold);}),
 part('plug','Connector shell and strain relief','The shell supports the contact and limits bending where the conductor enters.',down,r=>{box(r,[.31,0,0],[.30,.12,.12],black);sleeve(r,[0,0,0],x,.03,.13,.058,.045,black,18);})
]);
for(const key of ['engine-harness','primary-power','lighting-harness','lock-circuit','roof-circuit','chassis-control-harness','rear-heater-circuit','rear-relays','engine-ground'])studies.set('electrical.'+key,loom);
studies.set('electrical.rear-relays',study('g500-cargo-relay','Relay construction · coil, armature and contacts','The cargo-side bank contains separate relay and signal modules. This functional relay section explains the coil and switched contact; it does not reproduce a particular relay’s terminal layout.',g500ElectronicSources.network,[
 part('cover','Protective cover','The cover encloses the switching mechanism.',up,r=>{box(r,[0,0,.12],[.40,.32,.023],black);for(const yy of [-.15,.15])box(r,[0,yy,.015],[.40,.023,.20],black);}),
 part('coil','Electromagnetic coil','The winding surrounds an iron core. Its magnetic field attracts the armature.',left,r=>{cyl(r,[0,0,-.02],x,-.13,.13,.074,metal,16);for(let j=0;j<12;j++)sleeve(r,[0,0,-.02],x,-.12+j*.02,-.106+j*.02,.105,.079,gold,14);}),
 part('armature','Moving armature','The pivoting armature transfers magnetic force to the contact carrier. Its travel is illustrative.',right,r=>box(r,[.045,0,.09],[.30,.08,.018],metal)),
 part('contacts','Contact carrier and terminals','The fixed and moving contacts form the switched current path. Pin numbers and relay ratings are omitted.',down,r=>{box(r,[0,0,-.13],[.34,.27,.025],board);for(const xx of [-.11,.11])for(const yy of [-.08,.08])box(r,[xx,yy,-.19],[.025,.014,.12],gold);})
]));
studies.set('electrical.engine-ground',study('g500-ground-strap','Ground strap · braid, lugs and body attachment','A flexible metal braid bridges the engine and chassis. This construction section separates the braid, its end lugs and the bolted attachment. Exact attachment dimensions remain illustrative.',g500ElectronicSources.network,[
 part('braid','Flexible conductor braid','Interwoven conductors carry the return current while allowing engine movement.',left,r=>{for(let j=0;j<8;j++){const pts=[];for(let i=0;i<=20;i++)pts.push([-.4+i*.04,(j-3.5)*.012,.013*Math.sin(i*Math.PI*.6+j)]);line(r,pts,.005,metal);}}),
 part('lugs','Crimped end lugs','The end fittings spread the braid into flat bolted contact surfaces.',right,r=>{for(const s of [-1,1]){sleeve(r,[s*.43,0,0],z,-.012,.012,.075,.028,alloy,20);box(r,[s*.355,0,0],[.12,.10,.024],alloy);}}),
 part('bolt','Attachment bolt','The bolt clamps the lug against its mounting surface.',up,r=>{cyl(r,[.43,0,0],z,-.09,.055,.026,metal,12);cyl(r,[.43,0,.068],z,-.014,.014,.047,alloy,6);}),
 part('mount','Chassis contact surface','The lug bears on the mounting surface. The schematic plate represents the body or chassis attachment.',down,r=>box(r,[.43,0,-.037],[.22,.20,.022],metal))
]));
studies.set('electrical.diagnostic',diagnosticStudy());
export function getG500NetworkDetail(vehicle,id){return vehicle==='g500'?(studies.get(id)||null):null;}
