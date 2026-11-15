import {g500Induction} from './g500-engine-bay.js';
import {drawG500PanelFilter,drawG500FilterTray,g500FilterSeat,g500FilterSources} from './g500-filter-geometry.js';
import {engineShapes} from './engine-shapes.js';
import {study,part,cyl,sleeve,turn,x,y,z} from './mechanism-shapes.js';
import {box,plus,path,metal,alloy,iron,rubber,copper} from './road-service-geometry.js';
import {g500FlowRefs as refs,g500RadiatorCore,fitG500Intake} from './g500-flow.js';

const c=[0,0,.36],travel=t=>(1-Math.cos(t*2*Math.PI))*.5;
const front=[-.44,-.06,.10],back=[.43,.05,.10],left=[-.07,-.43,.10],right=[.08,.43,.10],up=[.07,.08,.47],down=[-.10,.03,-.41];
function openShell(r,center,axis,length,radius,color){
 turn(r,center,axis,[[-length*.5,radius*.85],[-length*.5,radius],[length*.5,radius],[length*.5,radius*.85]],color,{n:18,start:.30,sweep:Math.PI*1.32});
}
function coil(r,center,radius,z0,z1,turns){
 let last;
 for(let i=0;i<=turns*10;i++){
  const t=i/(turns*10),a=2*Math.PI*turns*t;
  const p=plus(center,[Math.cos(a)*radius,Math.sin(a)*radius,z0+(z1-z0)*t]);
  if(last)r.rod(last,p,.005,alloy,5);
  last=p;
 }
}
const thermostat=study('g500-coolant-thermostat','Thermostat valve','The cutaway shows how wax-element travel opens the radiator passage. The housing and valve move apart for inspection.',refs.pump,[
 part('housing','Outlet housing','The outlet neck joins the upper radiator hose. The exposed half of the housing shows the seat beneath it.',back,r=>{
  openShell(r,c,z,.35,.18,metal);sleeve(r,plus(c,[0,0,.165]),z,0,.025,.186,.144,iron,24);
 }),
 part('seal','Housing seal','The ring seals the thermostat housing against its mating face.',right,r=>sleeve(r,c,z,.164,.174,.173,.164,rubber,28)),
 part('seat','Fixed valve seat','Coolant can pass the annular seat when the moving valve leaves it.',front,r=>sleeve(r,c,z,.027,.039,.148,.095,alloy,26)),
 part('element','Wax element and valve disc','As the element expands, the disc lifts away from its seat.',up,(r,t)=>{
  const v=-travel(t)*.067; cyl(r,plus(c,[0,0,v]),z,.018,.027,.107,metal,24);
  cyl(r,plus(c,[0,0,v]),z,-.065,.018,.033,copper,16);
  cyl(r,plus(c,[0,0,v]),z,-.093,-.052,.011,metal,12);
 }),
 part('spring','Return spring and bridge','The bridge supports the return spring. Cooling allows the spring to return the valve to its seat.',down,(r,t)=>{
  coil(r,c,.072,-.131,.016-travel(t)*.067,4);
  box(r,plus(c,[0,0,-.144]),[.26,.025,.021],alloy);
  for(const s of [-1,1])box(r,plus(c,[s*.129,0,-.051]),[.016,.021,.195],metal);
 })
],'The wax element lifts the valve away from the fixed seat and then returns. Its travel is illustrative.');

function impeller(r,center,angle){
 cyl(r,center,x,-.018,.005,.143,iron,20);
 for(let i=0;i<7;i++){
  const a=angle+i*2*Math.PI/7,pt=(rad,ang,xx)=>plus(center,[xx,Math.cos(ang)*rad,Math.sin(ang)*rad]);
  r.polygon([pt(.032,a,.005),pt(.137,a+.47,.005),pt(.132,a+.47,.05),pt(.032,a,.05)],alloy,false);
 }
}
const coolantPump=study('g500-engine-pump','Mechanical coolant pump','The pulley, bearing shaft and impeller rotate together. The gasket seals the pump body to the engine. Mercedes lists two pump variants for this model year.',refs.pump,[
 part('pulley','Drive pulley','The front belt turns the pulley and the pump shaft.',front,r=>{cyl(r,c,x,-.27,-.202,.124,iron,22);for(const dx of [-.267,-.239,-.209])sleeve(r,c,x,dx,dx+.006,.135,.110,rubber,24);}),
 part('body','Pump housing','The open side of the casting exposes the impeller chamber. The position of the optional oil-cooler connection varies.',right,r=>{openShell(r,c,x,.30,.162,metal);cyl(r,c,x,-.188,-.131,.066,metal,18);}),
 part('shaft','Shaft and bearing','The bearing supports the shaft between the pulley and impeller.',left,r=>{cyl(r,c,x,-.256,.126,.022,alloy,16);sleeve(r,c,x,-.16,-.078,.045,.023,iron,16);}),
 part('impeller','Centrifugal impeller','The impeller draws coolant in at its center and discharges toward the rim.',back,(r,t)=>impeller(r,plus(c,[.091,0,0]),t*2*Math.PI)),
 part('gasket','Pump-to-engine gasket','This gasket sits at the engine mounting face. Its outline follows a simplified section of the housing.',up,r=>sleeve(r,c,x,.151,.157,.176,.147,'#927f64',24))
],'The impeller rotates about the pump shaft. Blade shape and speed are illustrative.');
const auxPump=study('g500-heater-pump','Electric heater circulation pump','The electric motor drives an impeller in the wet housing. The study shows the operating principle of the catalogued heater pump.',refs.heater,[
 part('motor','Electric motor','The cylindrical motor supplies rotation independently of the engine belt.',front,r=>{openShell(r,plus(c,[-.12,0,0]),x,.26,.112,rubber);cyl(r,c,x,-.253,-.098,.063,iron,16);}),
 part('connector','Electrical connector','The two supply connections are shown at the motor housing.',up,r=>{box(r,plus(c,[-.14,0,.094]),[.066,.075,.053],rubber);for(const s of [-1,1])box(r,plus(c,[-.144,s*.013,.127]),[.021,.004,.034],copper);}),
 part('housing','Coolant chamber','The side outlet leaves the impeller chamber near its circumference.',right,r=>{openShell(r,plus(c,[.095,0,0]),x,.126,.153,metal);sleeve(r,plus(c,[.097,.14,0]),y,-.015,.10,.035,.027,iron,14);}),
 part('impeller','Pump impeller','Coolant moves from the center of the impeller to the discharge side.',back,(r,t)=>impeller(r,plus(c,[.065,0,0]),t*2*Math.PI))
],'The motor turns the small impeller in the coolant chamber.');

const airCleaner=study('g500-air-cleaner','Twin-filter air cleaner','The central cleaner lifts off as one assembly. Each side pod contains a separate rectangular filter; their clean-side passages feed a single meter.',g500FilterSources.air,[
 part('lid','Cleaner lid','The detachable crown and shaped side pods lift clear of both filters.',[0,0,.15],r=>{
  const t=engineShapes(r,fitG500Intake);
  g500Induction((id,draw)=>{if(id==='airbox')draw();},t);
 }),
 ...[-1,1].map((s,i)=>part(i?'right-filter':'left-filter',i?'Right filter element':'Left filter element','The MANN C 3698/3-2 replacement pair measures 355 × 135 × 50 mm per element. The number of folds and the shape of the housing are approximate.',[0,s*.086,.046],r=>drawG500PanelFilter(engineShapes(r),g500FilterSeat(s)))),
 part('base','Lower filter trays','The molded pockets support the seals around the filter media.',[0,0,-.061],r=>{
  const t=engineShapes(r);
  for(const s of [-1,1])drawG500FilterTray(t,g500FilterSeat(s));
 })
]);
const butterfly=study('g500-throttle','Electronic throttle','The motor turns a butterfly across the circular bore. Open the section to see why a small rotation changes the exposed area.',refs.air,[
 part('bore','Throttle bore and flange','The round air passage is cast into the throttle housing.',back,r=>{openShell(r,c,x,.27,.187,metal);sleeve(r,c,x,.118,.14,.211,.162,metal,28);}),
 part('blade','Throttle plate and spindle','The spindle and circular butterfly rotate together. The open blade lies almost parallel to the air stream.',up,(r,t)=>{
  const a=.08+1.42*travel(t),n=[Math.cos(a),0,Math.sin(a)];cyl(r,c,n,-.004,.004,.161,'#a6976c',24);cyl(r,c,y,-.194,.204,.012,alloy,12);
 }),
 part('drive','Actuator housing','The electric drive and position feedback sit beside the bore. Its internal gear ratios are not measured.',left,r=>{box(r,plus(c,[0,-.218,0]),[.18,.080,.145],rubber);cyl(r,plus(c,[.028,-.222,.049]),x,-.079,.071,.060,iron,16);})
],'The throttle plate turns from nearly closed to open and back.');
const manifold=study('g500-variable-intake','Variable-length manifold section','This section follows one cylinder. Closing the shortcut sends the air around the longer runner. Opening it connects the distributor volume directly to the shorter path.',refs.manifold,[
 part('plenum','Distributor volume','Filtered air from the rear throttle enters the common plenum between the banks.',up,r=>{box(r,[0,-.156,.549],[.32,.41,.022],metal);box(r,[.153,-.156,.414],[.017,.41,.277],iron);}),
 part('runner','Curved runner and head port','The outer passage remains open in both positions. The short passage rejoins it near the cylinder-head port.',right,r=>{
  for(const offset of [-.044,.044])path(r,[[.11,-.229,.48+offset],[.11,-.18,.38+offset],[.11,-.165,.23+offset],[.11,-.058,.145+offset],[.11,.11,.179+offset],[.11,.24,.274+offset],[.11,.31,.255+offset]],.015,metal);
  for(const zz of [.294,.381])box(r,[0,.033,zz],[.28,.280,.012],alloy);
 }),
 part('flap','Short-path flap and spindle','With the flap across the shortcut, air takes the longer route. When it turns open, the plenum has a shorter connection to the port.',front,(r,t)=>{
  const a=travel(t)*Math.PI*.5,center=[0,.105,.338],pt=(l,h)=>[l,center[1]+Math.sin(a)*h,center[2]+Math.cos(a)*h];
  r.polygon([pt(-.130,-.043),pt(.130,-.043),pt(.130,.043),pt(-.130,.043)],'#b09b72',false);
  cyl(r,center,x,-.168,.169,.008,iron,12);
 }),
 part('actuator','Vacuum actuator and linkage','The vacuum capsule moves a rod and lever. A return spring restores the open-flap position when vacuum is released.',left,(r,t)=>{
  const a=travel(t)*Math.PI*.5,tip=[-.175,.105+.061*Math.sin(a),.338+.061*Math.cos(a)];
  const pivot=[-.175,.105,.338],rod=[-.175,-.105+.061*travel(t),.40];
  path(r,[pivot,tip,rod],.008,alloy);cyl(r,[-.175,-.145,.40],y,-.055,.036,.046,iron,18);
 })
],'The flap closes the short passage for the long-runner mode and opens it again. The section shows relative motion, without assigning an engine-speed threshold.');
const heatExchanger=study('g500-radiator','Radiator core and end tanks','The radiator shown uses the Nissens 62599A replacement core, nominally 537 mm wide, 569 mm high and 40 mm deep. The tanks follow the G500 parts plate. Fin pitch, tube count and mounting tabs still need measurements.',refs.coreSize,[
 part('tanks','Coolant end tanks','The cast hose necks meet opposite end tanks beside the core.',[0,.075,0],r=>{for(const s of [-1,1]){box(r,[0,s*.2885,.35],[.061,.040,.581],rubber);sleeve(r,[0,s*.284,.35+(s<0?.200:-.242)],x,.011,.045,.0185,.015,rubber,14);}}),
 part('tubes','Flat coolant tubes','The headers join the horizontal tubes to the end tanks. A sample of the tubes is shown.',[0,0,.065],r=>{
  const {height,width,depth}=g500RadiatorCore;
  for(let i=0;i<21;i++)box(r,[0,0,.35-height/2+.013+i*(height-.026)/20],[depth,width,.004],alloy);
  for(const s of [-1,1])box(r,[0,s*(width/2-.0015),.35],[depth,.003,height],metal);
 }),
 part('fins','Air-side fins','A strip of folded fin stock shows the air passages between adjacent tubes. The fold count is illustrative.',[-.070,0,0],r=>{
  for(let row=0;row<5;row++)for(let i=0;i<24;i++){
   const a=-.252+i*.021,z0=.35-.569/2+.015+row*(.569-.026)/20;
   r.polygon([[-.019,a,z0],[.019,a,z0],[.019,a+.0105,z0+.023],[-.019,a+.0105,z0+.023]],'#7c8988',false);
   r.polygon([[-.019,a+.0105,z0+.023],[.019,a+.0105,z0+.023],[.019,a+.021,z0],[-.019,a+.021,z0]],'#98a19b',false);
  }
 })
]);
const details=new Map();
for(const [keys,model] of [
 [['cooling.thermostat','powertrain.thermostat'],thermostat],
 [['cooling.water-pump','powertrain.water-pump'],coolantPump],
 [['cooling.heater-pump'],auxPump],[['cooling.radiator','powertrain.radiator'],heatExchanger],
 [['intake.airbox','intake.air-filters','powertrain.airbox','powertrain.air-filters'],airCleaner],
 [['intake.throttle','powertrain.throttle'],butterfly],[['intake.intake','powertrain.intake'],manifold]
])for(const k of keys)details.set(k,model);
export function getG500FlowDetail(vehicle,key){return vehicle==='g500'?details.get(key)||null:null;}
