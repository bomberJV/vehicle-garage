import {cyl,sleeve,x,y,z} from './mechanism-shapes.js';
import {box,path,plus,iron,metal,alloy,rubber} from './road-service-geometry.js';
import {slab} from './section-primitives.js';
import {fluidRefs as ref} from './g500-fluid-refs.js';

const can=[1.963,.710,.844],tankPort=[1.930,.420,.690],pressure=[1.805,.140,.683];
const canPorts={tank:plus(can,[.092,-.033,.036]),purge:plus(can,[.092,.029,.036]),air:plus(can,[.031,.052,.044])};
// The purge valve sits outboard of the left exhaust manifold.
const shut=plus(can,[.030,.053,.088]),purge=[-1.185,-.612,.940],manifold=[-.858,-.018,1.021];
export const evapRows=[
 ['tank-vent','Tank vapor connection','Vapor leaves the high side of the tank for the charcoal canister. The underbody and wheelhouse bends show the route schematically.',[.14,.11,.23],ref.evapRoute,r=>{
  cyl(r,tankPort,z,-.009,.013,.012,iron,10);
  path(r,[tankPort,[1.930,.420,.780],[1.960,.600,.810],[2.050,.660,.850],canPorts.tank],.008,rubber);
 }],
 ['canister','Activated-charcoal canister','Vapor collects on activated carbon in the canister by the right rear wheelhouse. The early G500 parts listing identifies A 463 470 00 59 through chassis 144225.',[.10,.33,.13],ref.evapCase,r=>{
  slab(r,can[0],can[1],can[2]-.041,.181,.106,.086,rubber,.022);
  slab(r,can[0],can[1],can[2]+.045,.184,.108,.006,iron,.022);
  for(const xx of [-.051,.051])box(r,plus(can,[xx,0,-.033]),[.009,.116,.013],iron);
  for(const port of [canPorts.tank,canPorts.purge])sleeve(r,port,x,-.013,.011,.009,.005,iron,10);
 }],
 ['shutoff','Canister vent shutoff valve · Y58/4','The vent admits fresh air during purge. Under leak-test control, Y58/4 closes the vent and the tank pressure sensor reports the change.',[.20,.17,.28],ref.evapControls,r=>{
  cyl(r,shut,z,-.016,.019,.018,iron,12);box(r,plus(shut,[-.016,0,.014]),[.022,.021,.014],rubber);
  path(r,[canPorts.air,plus(shut,[0,0,-.017])],.007,rubber);
  path(r,[plus(shut,[.013,0,0]),plus(shut,[.044,.012,0]),plus(shut,[.061,.010,-.042])],.008,rubber);
 }],
 ['tank-pressure','Tank pressure sensor · B4/3','The controller monitors pressure in the tank vapor space. The pressure connection and the electrical connector are shown together.',[-.13,-.22,.17],ref.evapControls,r=>{
  cyl(r,pressure,z,-.012,.007,.013,iron,10);box(r,plus(pressure,[0,0,.014]),[.031,.028,.015],rubber);
  box(r,plus(pressure,[-.023,0,.015]),[.017,.018,.012],iron);
 }],
 ['purge-line','Long vapor purge line','A separate line carries recovered vapor forward from the canister. It passes the engine-bay bulkhead and reaches the purge valve.',[0,.27,-.15],ref.evapRoute,r=>{
  // It drops behind the canister, passes under it above its bracket, then runs
  // forward outboard of the right frame rail and inboard of the rear spring and damper.
  path(r,[canPorts.purge,[2.063,.739,.860],[2.063,.739,.770],[1.930,.700,.770],[1.930,.600,.620],[1.650,.600,.570],[1.460,.622,.550],[1.368,.549,.550],[1.270,.478,.550],[1.120,.560,.548],[1.000,.580,.540],[.490,.580,.555],[-.397,.580,.550],[-.450,.465,.532],[-.70,.44,.53],[-.885,.44,.53],[-.885,.44,.80],[-.80,.44,.80],[-.762,.18,.955],[-.762,-.18,.955],[-.762,-.45,.80],[-.858,-.535,.826],plus(purge,[.033,0,0])],.0065,iron);
 }],
 ['purge-valve','Engine-bay purge valve · Y58/1','The engine controller opens the valve in pulses. Intake vacuum then draws stored vapor out of the carbon bed and into the engine.',[-.17,-.28,.20],ref.evapControls,r=>{
  cyl(r,purge,x,-.022,.024,.021,rubber,12);
  cyl(r,purge,x,-.035,-.022,.009,metal,10);cyl(r,purge,x,.024,.035,.009,metal,10);
  box(r,plus(purge,[0,0,.025]),[.023,.018,.025],rubber);
 }],
 ['manifold-line','Purge outlet to intake','The short outlet hose joins the metering valve to manifold vacuum downstream of the throttle.',[-.13,-.14,-.15],ref.evapControls,r=>{
  // The hose rises outboard of the manifold, runs back over the brake booster under
  // the bonnet, crosses behind the cylinder heads and drops to the intake below the throttle.
  path(r,[plus(purge,[-.034,0,0]),[-1.240,-.600,.960],[-1.220,-.600,1.150],[-.850,-.600,1.150],[-.850,-.550,1.124],[-.850,-.130,1.124],[-.850,-.130,1.021],manifold],.007,rubber);
 }]
];
