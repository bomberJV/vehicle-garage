// 463.249 US, MY 2002. Public plates establish component type and connections.
// Pipes, harness runs, folded metal, actuator gearing and winding patterns are illustrative.
import {part,study} from './mechanism-shapes.js';
import {on,drape} from './g500-cabin-routing.js';
const floorLine=(r,pts,rad,color)=>line(r,drape(pts,rad),rad,color);
import {heaterPad,frontHeaterCenter,drawHeaterMat} from './g500-seat-heaters.js';
import {g500FrontSeatStudy} from './g500-cabin.js';
import {cyl,sleeve,turn,TAU,x,y,z,O,add,box,line,port,blockShell,motor,alloy,iron,foam,black,rubber,copper,blue,
  climateTargets,coreCenter,evapCenter,drawCore,allCore,drawG500HeaterMatrix,drawG500AcCompressor,compressorPiece,fanPair,blowerPiece,allBlower,ducts} from './g500-comfort-parts.js';
export {g500HeaterPorts,drawG500HeaterMatrix,drawG500AcCompressor} from './g500-comfort-parts.js';

const manual='https://www.manualsdir.com/manuals/118401/mercedes-benz-2002-g-class-2002-g-500-g-class-2002-owners-manual.html?page=';
const dealer='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const catalog='https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/';
const ref=(label,url)=>({label,url});
export const comfortSources={
 climate:ref('2002 G-Class operator’s manual · climate controls, p. 142',manual+145),
 outlets:ref('2002 G-Class operator’s manual · air outlets, p. 140',manual+143),
 case:ref('2002 G500 parts drawing · evaporator, heater, blower and lower air duct',catalog+'a-c-heating/heater-core-control-valve'),
 ac:ref('2002 G500 parts drawing · compressor, condenser, drier and lines',catalog+'a-c-heating/air-conditioner'),
 drier:ref('Mercedes-Benz USA parts · receiver, drier and refrigerant lines',dealer+'hvac--a-c-accumulator-receiver-drier'),
 evapNrf:ref('NRF 36122 · 200 × 308 × 65 mm core for Mercedes A 209 830 03 58','https://webshop.nrf.eu/automotive/air-conditioning-products/mercedes-benz-18561.html'),
 heaterNrf:ref('NRF 54274 · 234 × 175 × 32 mm core for Mercedes A 203 830 01 61','https://www.napaautoparts.co.uk/nrf-54274-heater-matrix'),
 filterInstall:ref('MANN-FILTER · W461/W463 intake filter, installation photos 1–4','https://www.mann-filter.com/content/dam/mann-filter/pim-assets/mounting-instruction/HByT3Qxz.pdf'),
 fans:ref('2002 G500 parts catalog · left and right condenser fan motors',catalog+'a-c-heating/a-c-condenser'),
 filter:ref('MANN-FILTER · CUK 2545 dimensional drawing and 2002 G500 fitment','https://www.mann-filter.com/us-en/catalog/search-results/product.html/cuk2545_mann-filter.html'),
 frontSeat:ref('2002 G-Class operator’s manual · front seat heating, p. 52',manual+55),
 rearSeat:ref('2002 G-Class operator’s manual · rear seat heating, p. 54',manual+57),
 column:ref('Mercedes-Benz USA parts · 2002 G500 column tube and steering shaft','https://mbparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/steering--steering-column-tube-and-steering-shaft'),
 motors:ref('2002 G500 463.249 service index · column forward/back and raise/lower motors','https://charm.li/Mercedes%20Benz/2002/G%20500%20%28463.249%29%20V8-5.0L%20%28113.962%29/Repair%20and%20Diagnosis/'),
 controls:ref('2002 G-Class operator’s manual · driver’s door control and memory, p. 78',manual+81),
 power:ref('2002 G-Class operator’s manual · cabin fuse positions, pp. 297–300',manual+300)
};
const {comp,con,drier,metering,blower,filter}=climateTargets;
const right=[0,.58,.12],left=[0,-.65,.03],down=[.06,0,-.50],up=[0,.02,.62],rear=[.59,.08,.11],fore=[-.64,.02,.08];
function assembly(id,name,description,source,rows){
 return {id,name,description,source,category:'service',view:'hero',internal:true,parts:rows.map(([key,name,description,offset,source,draw])=>({id:id+'.'+key,name,description,offset,source,draw}))};
}
function cut(id,name,desc,source,rows,motion){
 const d=study('g500-'+id,name,desc,source,rows.map(([key,name,desc,offset,draw])=>part(key,name,desc,offset,draw)),motion);
 d.viewAngle=[-.72,.39];return d;
}
// MANN A (along the folded ribs), B (across them), H. The product photo
// shows the trimmed edges. The pitch and the thickness of the strips are estimated.
const filterLength=.246,filterWidth=.216,filterHeight=.032,strip=.002;
const filterParts=[
 ['media','Activated-carbon pleats','The pleats run along the 246 mm edge. Their depth packs more filtering area into the 32 mm envelope.',[0,0,.20]],
 ['sides','Longitudinal strips','The two straight strips follow the first and last pleats.',[.18,0,0]],
 ['ends','End bands','The bands hold the cut ends of the folded pack. The supplier gives overall dimensions only.',[0,.19,0]]
];
function filterPiece(r,key,c,installed=false){
 const point=([a,b,d])=>add(c,installed?[d,b,-a]:[a,b,d]);
 const bars=(center,size,color)=>box(r,point(center),installed?[size[2],size[1],size[0]]:size,color);
 const l=filterLength/2,w=filterWidth/2,h=filterHeight/2;
 if(key==='media'){
  const folds=20,span=filterWidth-strip*2;
  for(let j=0;j<2*folds;j++){
   const x0=-w+strip+span*j/(2*folds),x1=-w+strip+span*(j+1)/(2*folds),z0=(j%2?1:-1)*(h-.001);
   const face=(a,za,b,zb,color)=>r.polygon([[a,-l+strip,za],[a,l-strip,za],[b,l-strip,zb],[b,-l+strip,zb]].map(point),color,false);
   // A narrow lighter band makes the rounded fold crown visible at a shallow viewing angle.
   const step=(x1-x0)*.15,tip=z0*.70;
   if(j%2){face(x0,z0,x0+step,tip,'#a4aaa8');face(x0+step,tip,x1,-z0,'#505855');}
   else{face(x0,z0,x1-step,-tip,'#68706d');face(x1-step,-tip,x1,-z0,'#939a97');}
  }return;
 }
 for(const sign of [-1,1]){
  if(key==='sides')bars([sign*(w-strip/2),0,0],[strip,filterLength-strip*2,filterHeight],'#aaaead');
  else bars([0,sign*(l-strip/2),0],[filterWidth,strip,filterHeight],'#959b98');
 }
}
const filterView=cut('pollen-filter','CUK 2545 cabin filter','MANN specifies 246 × 216 × 32 mm for this activated-carbon replacement, cross-referenced to Mercedes A 463 830 00 18. The bonded edges are separated here to show how the folded pack is supported.',comfortSources.filter,
 filterParts.map(([key,name,desc,offset])=>[key,name,desc,offset,r=>filterPiece(r,key,O)]));
filterView.viewAngle=[-.64,.67];
function receiver(r,k,c=drier,s=1){
 if(k==='shell'){turn(r,c,z,[[-.112,0],[-.112,.026],[-.105,.038],[.087,.038],[.103,.032],[.103,0]].map(([p,q])=>[p*s,q*s]),iron,{n:20});return;}
 if(k==='head'){for(const t of [-1,1])port(r,add(c,[0,t*.017*s,.108*s]),z,.009*s);return;}
 if(k==='dryer'){sleeve(r,c,z,-.065*s,.045*s,.026*s,.012*s,'#9a8c6b',20);return;}
 cyl(r,c,z,-.086*s,-.081*s,.030*s,alloy,16);
}
function valve(r,c=metering,s=1){
 box(r,c,[.032*s,.060*s,.050*s],alloy);
 for(const sx of [-1,1])for(const dz of [-1,1])port(r,add(c,[sx*.018*s,0,dz*.014*s]),x,(dz<0?.006:.010)*s);
 cyl(r,add(c,[0,.009*s,.031*s]),z,-.004*s,.007*s,.024*s,iron,15);
}
function refrigerantPipes(r){
 const cp=add(comp,[.036,0,.084]),top=add(con,[0,.406,.14]),bottom=add(con,[0,.406,-.15]);
 line(r,[add(cp,[0,.02,0]),[-1.675,.352,.70],[-1.95,.395,.72],[con[0]+.054,.436,.953],top],.009,alloy);
 line(r,[bottom,[con[0]+.042,.473,.710],[-2.003,.497,.786],add(drier,[0,.017,.108])],.0068,alloy);
 line(r,[add(drier,[0,-.017,.108]),[-1.80,.530,.955],[-1.71,.550,1.013],[-1.18,.521,1.050],[-.735,.408,1.118],add(metering,[-.018,0,-.014])],.0068,alloy);
 line(r,[add(metering,[-.018,0,.014]),[-.755,.455,1.126],[-1.16,.483,.985],[-1.52,.421,.792],add(cp,[0,-.02,0])],.012,rubber);
}
function flaps(r,c=[-.513,.082,1.172],s=1,angle=0){
 for(const hand of [-1,1]){
  const q=add(c,[0,hand*.057*s,0]);cyl(r,q,y,-.052*s,.052*s,.004*s,alloy,8);
  const end=add(q,[.048*s*Math.cos(angle),0,.048*s*Math.sin(angle)]);
  r.polygon([add(q,[0,-.049*s,0]),add(q,[0,.049*s,0]),add(end,[0,.049*s,0]),add(end,[0,-.049*s,0])],blue,false);
 }
}
function panel(r){
 const c=[-.434,0,.928];box(r,c,[.011,.235,.067],black);
 for(const s of [-1,1]){
  cyl(r,add(c,[.008,s*.033,.010]),x,0,.007,.017,iron,12);
  box(r,add(c,[.007,s*.087,0]),[.008,.032,.037],rubber);
 }
 for(let j=0;j<5;j++)box(r,add(c,[.006,(j-2)*.029,-.018]),[.008,.024,.012],'#526063');
}
const climate=assembly('hvac','Climate control and air conditioning','Outside air passes through the dust filter and radial blower. The evaporator cools and dries it. The heater core adds engine heat, and distribution flaps direct air to the glass, vents and footwells. The two heat exchangers use separate fluids.',comfortSources.climate,[
 ['filter','Cabin air filter · CUK 2545','This activated-carbon replacement for Mercedes A 463 830 00 18 measures 246 × 216 × 32 mm. Its folded medium sits in the fresh-air intake.',up,comfortSources.filter,r=>{for(const [key] of filterParts)filterPiece(r,key,filter,true);}],
 ['blower','Cabin blower and motor','An electric motor spins a centrifugal wheel inside a scroll. The outlet feeds the evaporator and heater housing.',right,comfortSources.case,allBlower],
 ['case','Heating and ventilation housing','The heater and evaporator occupy a common housing behind the dashboard. Its inlet joins the passenger-side blower.',down,comfortSources.case,r=>{
  for(const s of [-1,1])box(r,[-.554,.035+s*.170,1.080],[.191,.006,.220],black);
  box(r,[-.554,.035,.968],[.191,.346,.006],black);box(r,[-.554,.035,1.192],[.191,.346,.006],black);
  box(r,[-.600,.232,1.030],[.106,.126,.007],black);box(r,[-.600,.232,1.104],[.106,.126,.007],black);
 }],
 ['evaporator','A/C evaporator','The core cools and dries the incoming air. The NRF 36122 replacement for A 209 830 03 58 has a 200 × 308 × 65 mm core.',fore,comfortSources.evapNrf,r=>allCore(r,'evaporator')],
 ['heater-core','Engine-coolant heater core','Coolant enters this matrix through the firewall. The NRF 54274 replacement for A 203 830 01 61 has a 234 × 175 × 32 mm core.',rear,comfortSources.heaterNrf,drawG500HeaterMatrix],
 ['expansion-valve','Refrigerant expansion valve','The metering valve sits at the evaporator connection. Its small liquid passage feeds the evaporator and its larger passage carries the return gas.',up,comfortSources.ac,r=>valve(r)],
 ['compressor','A/C compressor and pulley','The engine accessory belt drives the compressor. Its discharge line runs to the condenser at the nose of the vehicle.',left,comfortSources.ac,drawG500AcCompressor],
 ['condenser','Front A/C condenser','The finned condenser sits ahead of the engine radiator and releases heat from the refrigerant.',fore,comfortSources.ac,r=>allCore(r,'condenser')],
 ...[-1,1].map(s=>['fan-'+(s<0?'left':'right'),(s<0?'Left':'Right')+' electric condenser fan','This auxiliary fan pushes air into the condenser. The engine cooling fan sits on the far side of the radiator.',s<0?left:right,comfortSources.fans,r=>fanPair(r,s<0?'left':'right')]),
 ['drier','Refrigerant receiver-drier','The receiver holds liquid refrigerant. The filter and desiccant remove debris and moisture before liquid reaches the expansion valve.',right,comfortSources.drier,r=>{receiver(r,'shell');receiver(r,'head');}],
 ['refrigerant-lines','Liquid, suction and discharge lines','Follow the high-pressure line from the compressor to the condenser, the liquid line through the drier to the valve, and the suction line back to the compressor. Hose bends are schematic.',down,comfortSources.drier,refrigerantPipes],
 ['flaps','Air-mixing flaps and actuator','The flap shaft pivots in the housing. An electric actuator moves the flap through a linkage. The cutaway shows its motion.',left,comfortSources.case,r=>{flaps(r);box(r,[-.530,.180,1.155],[.055,.022,.042],iron);r.rod([-.516,.17,1.163],[-.513,.192,1.172],.004,alloy,7);}],
 ['face-ducts','Center and side vent ducts','Separate branches deliver air to the two center outlets and to adjustable vents at the dashboard ends.',right,comfortSources.outlets,r=>ducts(r,'face')],
 ['demist','Windshield demister ducts','The upper outlets direct air along the inside of the windshield.',up,comfortSources.outlets,r=>ducts(r,'demist')],
 ['footwell','Footwell ducts','The lower outlets deliver air to the footwells on both sides.',down,comfortSources.outlets,r=>ducts(r,'floor')],
 ['panel','Climate control panel','The center panel has left and right temperature selectors, air-volume and distribution controls, automatic operation, defrost, recirculation and residual heat.',rear,comfortSources.climate,panel]
]);

for(const [id,source] of [['filter',comfortSources.filterInstall],['evaporator',comfortSources.case],['heater-core',comfortSources.case]]){
 climate.parts.find(p=>p.id==='hvac.'+id).sources=[source];
}
function heatSwitch(r,c,axis){
 box(r,c,axis==='y'?[.044,.009,.033]:[.009,.044,.033],black);
 for(const q of [-1,1]){
  const p=add(c,axis==='y'?[q*.011,-Math.sign(c[1])*.006,.004]:[.006,q*.011,.004]);
  box(r,p,axis==='y'?[.014,.004,.017]:[.004,.014,.017],iron);
 }
}
const seatRows=[];
for(const rearSeat of [false,true])for(const side of [-1,1]){
 const sideName=side<0?'left':'right',rowName=rearSeat?'Rear':'Front',prefix=(rearSeat?'rear-':'front-')+sideName;
 for(const back of [false,true]){
  const c=rearSeat?(back?[.981,side*.451,1.086]:[.756,side*.451,.828]):frontHeaterCenter(back,side*.418);
  seatRows.push([prefix+(back?'-back':'-cushion'),rowName+' '+sideName+(back?' backrest heater':' cushion heater'),
   back?'A flexible resistance element follows the front face of the backrest under the upholstery.':'A flat resistance element lies under the leather in the cushion. Open it to separate the carrier, conductor and electrical lead.',
   back?rear:up,rearSeat?comfortSources.rearSeat:comfortSources.frontSeat,r=>drawHeaterMat(r,c,back)]);
 }
}
const seatHeat=assembly('seat-heating','Heated seats','The 2002 G500 has two heating levels. Rapid heating drops to normal after about five minutes. The front switches are on the center console. Separate rear switches sit on the center pillars.',comfortSources.frontSeat,[
 ...seatRows,['front-switches','Front seat heater switches','The driver and passenger select their own level from the center-console switch panel. Two lights indicate rapid heating.',rear,comfortSources.frontSeat,r=>{for(const s of [-1,1])heatSwitch(r,[-.428,s*.117,1.154],'x');}],
 ['rear-switches','Rear pillar seat heater switches','A rocker on each center pillar controls the corresponding outer rear position.',left,comfortSources.rearSeat,r=>{for(const s of [-1,1])heatSwitch(r,[.236,s*.796,1.097],'y');}]
]);
const steeringTop=[-.311,-.410,1.228],columnBase=[-.625,-.410,1.109],axis=[.935,0,.354];
const adjustMount=[-.526,-.411,1.146];
function drive(r,key,which,c=which==='reach'?[-.511,-.464,1.096]:[-.536,-.372,1.123],s=1){
 const along=which==='reach'?axis:z,cross=which==='reach'?y:x,at=(v)=>add(c,v.map(x=>x*s));
 if(key==='motor'){motor(r,c,cross,.018*s,.060*s,iron);return;}
 if(key==='housing'){box(r,at(which==='reach'?[.01,.040,0]:[.041,0,.009]),[.037*s,.032*s,.028*s],alloy);return;}
 if(key==='output'){
  const q=at(which==='reach'?[.01,.040,0]:[.041,0,.009]);cyl(r,q,along,-.017*s,.064*s,.006*s,alloy,10);sleeve(r,q,along,.043*s,.062*s,.010*s,.006*s,iron,10);return;
 }
 box(r,at(which==='reach'?[0,-.031,.015]:[-.029,0,.014]),[.024*s,.016*s,.012*s],black);
}
const doorSwitch=[-.583,-.800,1.090];
function columnSwitch(r){
 box(r,doorSwitch,[.026,.008,.024],black);r.rod(add(doorSwitch,[.004,.005,-.005]),add(doorSwitch,[-.005,.008,.009]),.005,iron,7);
}
const column=assembly('column-adjustment','Electrically adjustable steering column','The switch on the driver’s door adjusts the steering wheel in height and reach. The steering shaft runs through the adjustable jacket. Two electric drives reposition the column. The driver can store the wheel position with the seat and mirrors.',comfortSources.controls,[
 ['shaft','Upper steering shaft','The shaft carries steering torque through the column. Nested sections allow the wheel to move toward or away from the driver.',rear,comfortSources.column,r=>{
  r.rod(columnBase,steeringTop,.012,alloy,12);sleeve(r,columnBase,axis,.090,.186,.018,.011,iron,14);sleeve(r,steeringTop,axis,-.024,0,.025,.012,alloy,14);
 }],
 ['jacket','Telescoping column jacket','The fixed outer jacket guides the inner sleeve. The upper sleeve moves with the steering wheel.',up,comfortSources.column,r=>{
  sleeve(r,columnBase,axis,0,.186,.031,.022,black,18);sleeve(r,columnBase,axis,.165,.298,.022,.017,iron,18);
 }],
 ['bracket','Column bracket and height pivot','A bracket beneath the instrument panel supports the column and provides an axis for height adjustment.',left,comfortSources.column,r=>{
  for(const s of [-1,1]){box(r,add(adjustMount,[0,s*.044,.004]),[.122,.009,.058],iron);sleeve(r,add(adjustMount,[-.047,s*.045,0]),y,-.006,.006,.015,.006,alloy,12);}
  box(r,add(adjustMount,[0,0,.037]),[.129,.10,.007],iron);
 }],
 ...['reach','height'].map(which=>[which+'-motor',which==='reach'?'Column reach motor':'Column height motor',which==='reach'?'The fore-and-aft drive moves the sliding column section along the steering axis.':'The raise-and-lower drive acts on the column support to change wheel height.',which==='reach'?left:right,comfortSources.motors,r=>{for(const k of ['motor','housing','output','plug'])drive(r,k,which);}]),
 ['door-switch','Driver’s door column switch','The small rocker beside the seat-shaped controls commands both column axes. The adjacent memory buttons recall a stored driving position.',right,comfortSources.controls,columnSwitch]
]);
export const g500ComfortElectricalRows=[
 ['main-feed','Cabin fused-power distribution','The positive battery lead connects to the nearby prefuse block. The distribution harness feeds the passenger compartment. The routes represent branches, with fuse assignments and wire colors left to the vehicle wiring diagram.',down,comfortSources.power,r=>{
  // Both branches lie on the carpet at the foot of the tunnel, inboard of the seat runners.
  // The feed rises off the prefuse stud and clears the battery box before dropping to the tunnel foot;
  // it climbs to the top of the footwell fuse box outboard of the stability controller.
  const feed=[[.482,-.074,.754],[.482,-.074,.800],[.40,.10,.800],on(.38,.158),on(.044,.158),on(-.35,.158),on(-.45,.158),[-.58,.30,.748],[-.568,.445,.748],[-.568,.445,.754]];
  floorLine(r,feed,.0085,'#7b4c44');floorLine(r,[feed[3],on(.45,-.145),on(-.40,-.145),[-.564,-.667,.837],[-.571,-.718,1.055]],.0065,rubber);
 }],
 ['comfort-harness','Cabin equipment harness','Separate branches carry power and signals to the seat connectors, ventilation unit and column drives. The drawing shows destinations and omits terminal numbers.',rear,comfortSources.power,r=>{
  // Each seat branch leaves the tunnel behind the seat runners and climbs to the seat connector.
  for(const s of [-1,1]){const base=on(.30,s*(s>0?.158:.145)),turn=on(.12,s*.36);
   floorLine(r,[base,turn,[.10,s*.43,.735],[-.037,s*.513,.764]],.0035,rubber);
   floorLine(r,[base,on(.49,s*.375),[.84,s*.53,.751]],.0035,rubber);}
  line(r,[[-.568,.445,.754],[-.640,.420,.745],[-.640,.400,.857],[-.591,.374,.992]],.005,rubber);
  line(r,[[-.571,-.718,1.055],[-.573,-.599,1.044],[-.526,-.454,1.084],[-.531,-.374,1.108]],.004,rubber);
 }]
];

const hxViews=new Map();
for(const [kind,name,source] of [['heater','Coolant heater core',comfortSources.heaterNrf],['evaporator','Cabin evaporator',comfortSources.evapNrf],['condenser','Front condenser',comfortSources.ac]]){
 const scale=kind==='condenser'?1.85:4.8,fluid=kind==='heater'?'engine coolant':'refrigerant';
 hxViews.set(kind,cut(kind+'-matrix',name,'The headers distribute '+fluid+' among thin tubes. Air passes across folded fins between adjacent tubes. The number of tubes and fin folds is illustrative.',source,[
  ['headers','End headers','The headers collect and distribute fluid at the edges of the core.',left],
  ['tubes','Flat fluid passages','Fluid stays inside the tubes while air travels between them.',rear],
  ['fins','Folded heat-transfer fins','The folded metal increases the area exposed to the air.',up],
  ['ports',kind==='heater'?'Firewall coolant tubes':'Refrigerant connections',kind==='heater'?'Two joined pipes connect the core to the coolant hoses on the engine side of the bulkhead.':'The inlet and outlet connect the heat exchanger to the refrigerant circuit.',right]
 ].map(([id,name,desc,d])=>[id,name,desc,d,r=>drawCore(r,kind,id,O,scale)])));
}
const blowerView=cut('cabin-blower','Radial cabin blower','The electric motor turns the wheel. Air enters the open center and leaves through the scroll outlet. The enlarged example shows the direction of rotation conceptually.',comfortSources.case,[
 ['wheel','Centrifugal blower wheel','The drum carries many curved vanes between two end rings.',up],
 ['motor','Blower motor','The motor shaft engages the blower wheel at the hub.',down],
 ['scroll','Scroll housing and outlet','The housing collects the air leaving the wheel and directs it into the climate case.',left],
 ['plug','Motor connector','Two conductors meet the motor at the connector.',right]
].map(([key,name,desc,d])=>[key,name,desc,d,(r,t)=>blowerPiece(r,key,O,5.1,t)]),'Blower wheel rotating in its scroll.');
const fanView=cut('auxiliary-ac-fan','Electric condenser fan','Each fan sits in front of the condenser. An electric motor drives the blades and the outer shroud guides air through the core.',comfortSources.fans,[
 ['blade','Fan blades and hub','The molded blades turn together on the hub.',fore],['motor','Fan motor','The motor drives the blade hub independently of the engine-mounted cooling fan.',rear],
 ['shroud','Shroud and motor supports','The outer ring frames the blade tips while the supporting arms hold the motor on axis.',up]
].map(([k,n,d,o])=>[k,n,d,o,(r,t)=>fanPair(r,'left',k,O,3,t*TAU)]),'Condenser fan running.');
const compressor=cut('ac-compressor','A/C compressor drive and connections','The grooved pulley lines up with the accessory belt. The compressor body mounts to the engine, with a larger suction connection and a smaller discharge connection. The sealed pumping mechanism is outside this section.',comfortSources.ac,[
 ['case','Compressor case','The cast casing contains the pumping mechanism.',up],['pulley','Grooved belt pulley','The accessory belt runs in the pulley grooves.',fore],['hub','Front drive hub','The hub sits on the compressor shaft in front of the pulley.',left],['mount','Mounting ears','Cast ears locate the compressor on its engine bracket.',down],['ports','Suction and discharge ports','The larger return connection receives low-pressure gas. The smaller outlet feeds the condenser.',right]
].map(([k,n,d,o])=>[k,n,d,o,r=>compressorPiece(r,k,O,6)]));
const drierView=cut('ac-receiver','Receiver-drier in section','A sealed canister receives liquid from the condenser. Desiccant absorbs moisture while the filter retains debris. The internal cartridge geometry is representative.',comfortSources.drier,[
 ['shell','Receiver shell','The shell contains liquid refrigerant under pressure.',left],['head','Line fittings','Two fittings connect the vessel to the condenser and expansion valve.',up],
 ['dryer','Desiccant cartridge','The drying material absorbs moisture carried by the liquid.',right],['screen','Filter screen','A screen retains debris inside the vessel.',down]
].map(([k,n,d,o])=>[k,n,d,o,r=>receiver(r,k,O,5)]));
const flapView=cut('air-flaps','Air-mixing flaps and drive','A small electric actuator turns an output link. Each flap pivots on a shaft in the air case. The motion explains how flap angle changes the open passage.',comfortSources.case,[
 ['flaps','Air doors and pivot shafts','Air follows the open side of a passage as the flap turns.',up,(r,t)=>flaps(r,[0,0,.10],5,(Math.cos(t*TAU)+1)*.48)],
 ['actuator','Electric flap actuator','The compact housing mounts outside the climate case.',right,r=>{box(r,[0,.68,.08],[.21,.12,.19],iron);cyl(r,[0,.63,.08],y,-.12,-.02,.044,alloy,12);}],
 ['link','Output lever','The external lever connects the actuator to the flap shaft.',rear,r=>{line(r,[[0,.53,.10],[.12,.53,.15],[.10,.61,.08]],.016,alloy);}],
 ['housing','Air passage','The case supports the flap pivots and directs the outlet flow.',down,r=>{for(const s of [-1,1])box(r,[0,s*.60,0],[.58,.015,.38],black);box(r,[0,0,-.193],[.58,1.22,.018],black);}]
],'Air doors sweep through the passage.');
const seatViews=[false,true].map(back=>cut(back?'seat-heater-backrest':'seat-heater-element',back?'Backrest heating element':'Cushion heating element','A flexible heater lies close to the upholstery. Current through the resistance conductor warms the seat. The conductor pattern here illustrates its function. The pad’s outline, routing and connector position are schematic.',comfortSources.frontSeat,[
 ['cover','Upholstery layer','The occupant sits on the upholstery above the element.',up],['trace','Resistance conductor','Electrical current heats the conductor beneath the seat covering.',right],['carrier','Flexible backing','The insulating backing spreads and supports the element within the seat.',down],['connector','Lead and plug','The seat harness supplies the element through a short lead.',rear]
].map(([k,n,d,o])=>[k,n,d,o,r=>heaterPad(r,O,back,k,3.0)])));
const drives=new Map(['reach','height'].map(which=>[which,cut('column-'+which,which==='reach'?'Column reach drive':'Column height drive','The electric motor acts through a reduction drive to reposition the column. The sealed gearing, output geometry and travel shown are representative.',comfortSources.motors,[
 ['motor','Drive motor','The electric motor turns in either direction in response to the adjustment command.',left],['housing','Reduction housing','This housing supports the load between the motor and the adjustment linkage.',up],
 ['output','Adjustment output','The output moves the column sleeve or its height support.',rear],['plug','Motor plug','The motor connects to the vehicle harness through this plug.',right]
].map(([k,n,d,o])=>[k,n,d,o,r=>drive(r,k,which,O,8)]))]));
const cableView=cut('comfort-feed','Fused supply and branch connector','The battery feeds distribution through a fused connection. Each branch then reaches an electrical load through insulated conductors and terminals. This representative section omits fuse ratings, connector pinouts and harness colors.',comfortSources.power,[
 ['cable','Insulated supply cable','Copper strands carry current under an insulating jacket.',left,r=>{sleeve(r,O,x,-.51,.08,.065,.041,rubber,20);for(let i=0;i<6;i++){const a=i*TAU/6;cyl(r,[0,.022*Math.cos(a),.022*Math.sin(a)],x,-.38,.19,.014,copper,8);}}],
 ['lug','Crimped terminal lug','The crimp grips the conductor and the ring fits the distribution stud.',up,r=>{sleeve(r,[.13,0,0],x,-.069,.056,.047,.037,alloy,12);box(r,[.24,0,0],[.14,.083,.017],alloy);sleeve(r,[.327,0,0],z,-.009,.009,.060,.023,alloy,16);}],
 ['stud','Distribution post','A bolted terminal makes the detachable connection to the fuse block.',rear,r=>{cyl(r,[.327,0,0],z,-.087,.067,.022,copper,10);cyl(r,[.327,0,.023],z,0,.027,.039,alloy,6);}],
 ['carrier','Insulated support','The base supports the terminal hardware and keeps it clear of the vehicle body.',down,r=>box(r,[.32,0,-.10],[.25,.25,.06],black)]
]);
const studies=new Map([
 ['body.front-seats',g500FrontSeatStudy],['hvac.filter',filterView],
 ['hvac.blower',blowerView],['hvac.compressor',compressor],['powertrain.ac-compressor',compressor],['hvac.heater-core',hxViews.get('heater')],['cooling.heater-core',hxViews.get('heater')],['hvac.evaporator',hxViews.get('evaporator')],['hvac.condenser',hxViews.get('condenser')],['hvac.fan-left',fanView],['hvac.fan-right',fanView],['hvac.flaps',flapView],['hvac.drier',drierView],
 ['column-adjustment.reach-motor',drives.get('reach')],['column-adjustment.height-motor',drives.get('height')],
 ['electrical.main-feed',cableView],['electrical.comfort-harness',cableView]
]);
for(const row of seatRows)studies.set('seat-heating.'+row[0],seatViews[Number(row[0].endsWith('-back'))]);
studies.set('g500-front-seat.heat-cushion',seatViews[0]);studies.set('g500-front-seat.heat-back',seatViews[1]);
// The workbench follows these within-assembly links without losing the installed view.
function relate(group,from,...destinations){
 const item=group.parts.find(p=>p.id===group.id+'.'+from);
 item.connectsTo=destinations.map(k=>group.id+'.'+k);
}
for(const [from,...to] of [
 ['compressor','refrigerant-lines','condenser'],['condenser','fan-left','fan-right','drier'],['fan-left','condenser'],['fan-right','condenser'],
 ['drier','expansion-valve'],['expansion-valve','evaporator'],['evaporator','compressor','case'],['filter','blower'],['blower','case','evaporator'],
 ['case','evaporator','heater-core','flaps'],['heater-core','flaps'],['flaps','face-ducts','demist','footwell'],['panel','blower','flaps'],
 ['refrigerant-lines','compressor','condenser','drier','expansion-valve']
])relate(climate,from,...to);
for(const row of ['front','rear']){
 const pads=seatRows.map(p=>p[0]).filter(k=>k.startsWith(row+'-'));
 relate(seatHeat,row+'-switches',...pads);
 for(const key of pads)relate(seatHeat,key,row+'-switches',key.endsWith('back')?key.replace(/back$/,'cushion'):key.replace(/cushion$/,'back'));
}
relate(column,'door-switch','reach-motor','height-motor');relate(column,'reach-motor','jacket','shaft');relate(column,'height-motor','bracket','jacket');
relate(column,'shaft','jacket');relate(column,'bracket','height-motor');
const groups=[climate,seatHeat,column];
export function getG500ComfortAssemblies(vehicle){return vehicle==='g500'?groups:[];}
export function getG500ComfortDetail(vehicle,id){return vehicle==='g500'?(studies.get(id)||null):null;}
export function drawG500Comfort(r,vehicle,assemblyId){
 if(vehicle!=='g500')return;
 for(const g of groups){
  if(assemblyId&&assemblyId!==g.id)continue;
  for(const p of g.parts){
   if((p.id==='hvac.heater-core'&&r.inspection?.assembly==='cooling')||(p.id==='hvac.compressor'&&r.inspection?.assembly==='powertrain'))continue;
   const draw=()=>r.tag(p.id,()=>p.draw(r));
   if(p.id==='column-adjustment.door-switch')r.rigid('left-front',[-.085,-.63,.022],draw);else draw();
  }
 }
}
