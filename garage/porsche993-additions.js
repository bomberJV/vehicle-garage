// Porsche Classic Kat 017. The plates establish the assemblies and connections.
// Installed envelopes and line bends are fitted to the Cabriolet body.
import {add, part, cyl, sleeve, turn, tint, x, y, z, TAU} from './mechanism-shapes.js';
import {box} from './road-service-geometry.js';
import {get993Study} from './porsche993-system-studies.js';

import {refs} from './porsche993-sources.js';
import {boxerFrame,cylinderX} from './porsche-boxer-layout.js';
// Engine-mounted parts follow the installed flat-six frame (118 mm pitch,
// crank centre behind the rear axle).
const E=boxerFrame({rear:1.112},false),along=dx=>E.cx+E.f*dx;
// Each bank's heat-exchanger jacket runs below its head from ahead of the
// first cylinder to just behind the exhaust collector.
const jacketZ=E.z-.19,collectorX=along(.185);
const jacketEnds=s=>[cylinderX(E.cx,E.f,0,s)-.06,collectorX+.035];
const steel='#8d9a9b',black='#41494a',alloy='#a7ada1',brass='#ac916c',plastic='#394043';
// The tank, thermostat and filter sit in the body ahead of the right rear
// wheelhouse tub, clear of the wheel-well volume.
const oilCore=[-1.72,.57,.43],condCore=[-1.72,-.57,.43],thermo=[.57,.58,.31],oilTank=[.58,.70,.50],pump=[E.cx,0,E.z-.113];
// The compressor sits on the right of the engine, outboard of the spark plugs
// and in line with the crank pulley. The heater blower is on the left.
const rearBlower=[1.52,-.53,.64],compressor=[1.625,.54,.55],evap=[-.745,0,.68];
const dryer=[-.88,-.50,.462],valve=[-.78,-.219,.741];
const row=(key,name,description,offset,source,draw)=>({...part(key,name,description,offset,draw),source});
const pair=[[-1,'left','Left'],[1,'right','Right']];
function channel(r,points,radius,color){
 // Six facets suffice at the installed diameter of the hoses and tubing.
 for(let j=1;j<points.length;j++)r.rod(points[j-1],points[j],radius,color,6);
}
function oilReservoir(r){
 // Tapered lower chamber clears the wheel. The bolted round sender flange faces out.
 const outline=[[-.162,-.184],[.066,-.190],[.142,-.065],[.134,.153],[.076,.188],[-.141,.167],[-.174,.094]];
 const rim=dy=>outline.map(([a,b])=>add(oilTank,[a,dy,b]));
 const back=rim(-.045),front=rim(.045);
 r.polygon(back,black,false);r.polygon(front,'#58615a',false);
 for(let i=0;i<front.length;i++){
  const j=(i+1)%front.length;r.polygon([front[i],back[i],back[j],front[j]],tint(black,.90+.045*i),false);
 }
 cyl(r,add(oilTank,[-.08,.046,.076]),y,0,.012,.044,steel,12);
}
function oilPipe(r,k){
 // Both pipes leave the sill behind the front wheel opening, turn inboard of
 // the wheelhouse and run over it inside the luggage compartment, so they
 // never pass through the wheel well, then drop to the cooler ahead of it.
 // Over the wheelhouse the pair is stacked vertically to stay inboard.
 const b=k*.032;
 channel(r,[[.595,.561+b,.303],[.50,.62+b,.247],[.40,.673+b,.228],[-.66,.673+b,.228],[-.72,.673+b,.21],[-.76,.43+b*.3,.21],[-.86,.43+b*.3,.30],[-1.08,.43+b*.3,.40+b],[-1.38,.47+b*.3,.55+b],[-1.56,.50+b,.585],[-1.71,.54+b,.565]],.0135,'#7f898a');
 for(const xx of [-.53,.22])box(r,[xx,.673+b,.227],[.022,.032,.035],black);
}
function matrix(r,c,w,h,d){
 // Narrow gaps separate the visible fin faces. Headers terminate their top and bottom edges.
 for(const s of [-1,1])box(r,add(c,[0,0,s*(h/2-.012)]),[d,w,.024],steel);
 const a=c[0]-d/2,back=c[0]+d/2,lo=c[2]-h/2+.013,hi=c[2]+h/2-.013;
 for(let i=0;i<19;i++){
  const yy=c[1]-w*.49+i*w*.98/18;
  r.polygon([[a,yy-.0033,lo],[a,yy-.0033,hi],[a,yy+.0033,hi],[a,yy+.0033,lo]],'#83908d',false);
  r.polygon([[a,yy+.0033,lo],[a,yy+.0033,hi],[back,yy+.0033,hi],[back,yy+.0033,lo]],'#566360',false);
 }
}
function draw993Fan(r,c,rad,phase=0){
 sleeve(r,c,x,-rad*.13,rad*.13,rad*1.12,rad*1.01,plastic,22);
 cyl(r,c,x,-rad*.18,rad*.10,rad*.29,black,14);
 const polar=(rr,t,xx)=>[c[0]+xx*rad,c[1]+rad*rr*Math.cos(t),c[2]+rad*rr*Math.sin(t)];
 for(let j=0;j<7;j++){const a=j*TAU/7+TAU*phase;
  r.polygon([polar(.20,a,-.04),polar(.92,a+.14,-.12),polar(.98,a+.42,.04),polar(.56,a+.39,.12),polar(.22,a+.48,.04)],'#788582',false);
 }
}
function thermostat(r){box(r,thermo,[.093,.106,.085],alloy);cyl(r,thermo,z,-.066,-.038,.036,steel,16);}
function oilCan(r){turn(r,add(thermo,[.038,0,0]),x,[[0,.036],[.009,.040],[.105,.040],[.114,.033],[.114,0]],black,{n:15});}
function airJacket(r,s){
 const [front,back]=jacketEnds(s);
 const stations=[[front,.54],[front+.035,1],[back-.05,1],[back,.61]];
 const rings=stations.map(([a,b])=>Array.from({length:10},(_,j)=>{
  const t=TAU*j/10;return [a,s*(.335+.060*b*Math.cos(t)),jacketZ+.084*b*Math.sin(t)];
 }));
 for(let i=1;i<rings.length;i++)for(let j=0;j<10;j++){
  const k=(j+1)%10;r.polygon([rings[i-1][j],rings[i-1][k],rings[i][k],rings[i][j]],tint('#998c76',.83+.14*Math.sin(j*TAU/10)),false);
 }
 for(const a of [rings[0],rings.at(-1)])r.polygon(a,'#857f71',false);
}
const oilRows=[
 row('engine-filter','Engine-mounted oil filter','The small filter on the right-hand crankcase is the second spin-on filter in the 993 oil circuit.',[.18,.24,-.11],refs.engineFilter,r=>{
  const c=[1.30,.24,.40];box(r,add(c,[0,0,.034]),[.079,.085,.046],alloy);
  turn(r,c,z,[[-.09,0],[-.09,.027],[-.08,.036],[.016,.036],[.016,0]],black,{n:14});
 }),
 row('pump','Pressure and scavenge oil pump','Inside the case, one gear stage supplies the engine. The other removes oil collecting below the crankshaft.',[.10,-.20,-.20],refs.pump,r=>{
  for(const s of [-1,1])cyl(r,add(pump,[0,s*.024,0]),x,-.089,.077,.035,alloy,12);
  cyl(r,pump,x,-.140,-.079,.011,steel,10);
 }),
 row('tank','External oil tank and level sender','The tank stands ahead of the right rear wheel. Its sender measures the tank level. Oil from the bottom feeds the pressure pump.',[.10,.33,.17],refs.tank,oilReservoir),
 row('connections','Tank feed, return and filler neck','Two lower connections link the tank, engine and thermostat. The filler reaches up into the engine bay.',[.16,.28,.22],refs.tank,r=>{
  // Feed and scavenge lines pass under the half-shafts and the final drive,
  // then turn inboard behind the bellhousing to the pump below the case.
  channel(r,[[.55,.675,.335],[.57,.56,.302],[.62,.51,.29],[.74,.36,.25],[.86,.235,.232],[1.25,.235,.232],[1.30,.20,.27],[1.31,.06,.30],[pump[0]-.10,.03,pump[2]-.012]],.021,black);
  channel(r,[[pump[0]-.06,-.035,pump[2]-.035],[1.36,-.02,.262],[1.31,.10,.25],[1.27,.29,.235],[.86,.295,.235],[.72,.45,.285],[.612,.561,.321]],.0165,steel);
  channel(r,[[.62,.70,.653],[.66,.64,.70],[.70,.56,.71],[.85,.49,.72],[1.10,.50,.715],[1.38,.53,.70],[1.49,.545,.715]],.020,black);
  cyl(r,[1.49,.545,.72],z,-.003,.012,.029,'#c69a52',12);
 }),
 row('thermostat','External oil thermostat','The regulator diverts warm return oil to the cooler ahead of the right front wheel. Open the housing to find its regulator, springs and retaining clip.',[-.20,.31,-.18],refs.thermostat,thermostat),
 row('filter','Tank-side oil filter','This spin-on filter shares a bracket with the external thermostat.',[.22,.25,-.17],refs.thermostat,oilCan),
 row('outbound','Cooler supply pipe','One long metal pipe takes the flow forward along the right sill and over the front wheel housing.',[-.16,.32,-.13],refs.oilCooler,r=>oilPipe(r,0)),
 row('return','Cooler return pipe','The second pipe returns cooled oil to the rear circuit. The paired runs share cushioned body clamps.',[.16,.39,-.22],refs.oilCooler,r=>oilPipe(r,1)),
 row('cooler','Right-front engine oil cooler','Air crosses the fins while oil travels inside the core. The oil is on its way back to the external tank.',[-.25,.27,.15],refs.oilCooler,r=>matrix(r,oilCore,.248,.259,.045)),
 row('fan','Oil cooler fan and air guide','The electric fan moves air through the right-front cooler when road speed alone gives too little flow.',[.08,.30,.20],refs.oilCooler,r=>draw993Fan(r,add(oilCore,[.048,0,0]),.109))
];
function blower(r,c,rad){
 cyl(r,c,y,-rad*.50,rad*.5,rad,black,16);
 cyl(r,c,y,rad*.5,rad*.94,rad*.48,steel,14);
 box(r,add(c,[rad*.66,0,-rad*.40]),[rad*.9,rad,rad*.59],plastic);
}
const heatRows=[
 row('rear-blower','Rear auxiliary heater blower','The electric blower in the left side of the engine compartment sends air through the heat exchangers.',[.12,-.36,.24],refs.blower,r=>blower(r,rearBlower,.081)),
 row('supply','Heater air crossover','The blower duct drops to the heating tube. A branch feeds the pressed jacket on each cylinder bank.',[.22,0,-.18],refs.exchanger,r=>{
  // The blower duct runs aft along the left of the engine, above the plugs,
  // to a crossover behind the crankcase. A branch drops to the rear end of
  // each jacket, inboard of the exhaust outlet pipe.
  const cross=1.80;
  channel(r,[add(rearBlower,[.10,0,-.03]),[1.66,-.50,.60],[1.75,-.46,.54],[1.79,-.42,.50],[cross,-.36,.46]],.039,black);
  channel(r,[[cross,-.36,.46],[cross,.36,.46]],.036,steel);
  for(const s of [-1,1])channel(r,[[cross,s*.36,.46],[1.75,s*.27,.42],[1.69,s*.26,.33],[jacketEnds(s)[1]+.012,s*.27,.30]],.034,steel);
 }),
 ...pair.flatMap(([s,key,label])=>[
  row('exchanger-'+key,label+' exhaust heat exchanger','Three exhaust primaries pass through this bank’s air jacket. The walls of the pipes keep exhaust gas separate from the air sent to the cabin.',[.15,.31*s,-.24],refs.exchanger,r=>airJacket(r,s)),
  row('control-'+key,label+' heater control box and duct','Warm air leaves the exchanger through this control box. A longitudinal body duct carries it forward to the cabin air guides.',[-.09,s*.33,-.18],refs.heatValve,r=>{
   // The control box sits at the rear end of the sill. From there the warm-air
   // duct runs forward inside the sill box (under the door opening, below the
   // oil tank and inboard of the right-hand oil pipes), then climbs the front
   // kick panel to the heater housing (PET 813, heating ducts).
   // The duct leaves the front of the jacket, drops below the half-shaft
   // and runs forward to the box.
   const front=jacketEnds(s)[0];
   channel(r,[[front+.01,s*.335,jacketZ],[front-.05,s*.37,.215],[1.0,s*.38,.205],[.86,s*.44,.20],[.745,s*.44,.20]],.034,steel);
   cyl(r,[.70,s*.44,.20],x,-.045,.045,.040,steel,14);
   channel(r,[[.655,s*.44,.20],[.42,s*.44,.20],[.30,s*.62,.275],[-.70,s*.62,.275],[-.76,s*.60,.40],[-.78,s*.52,.56],[-.76,s*.40,.677]],.030,black);
  })
 ]),
 row('compressor','Belt-driven A/C compressor and clutch','The crankshaft belt turns the pulley at the right rear of the engine. The magnetic clutch couples it to the compressor.',[.20,.28,.20],refs.compressor,r=>{
  turn(r,compressor,x,[[-.091,0],[-.091,.045],[-.074,.059],[.053,.059],[.074,.046],[.074,0]],steel,{n:18});
  const pulleyX=along(.39),crankZ=E.z;
  cyl(r,compressor,x,.078,.145,.048,black,18);
  cyl(r,[pulleyX,0,crankZ],x,-.005,.005,.047,steel,16);
  const dy=compressor[1],dz=compressor[2]-crankZ,len=Math.hypot(dy,dz),dyN=-dz/len*.048,dzN=dy/len*.048;
  for(const sign of [-1,1]){const a=[pulleyX,dyN*sign,crankZ+dzN*sign],b=[pulleyX,dy+dyN*sign,compressor[2]+dzN*sign];
   r.polygon([add(a,[-.006,0,0]),add(b,[-.006,0,0]),add(b,[.006,0,0]),add(a,[.006,0,0])],'#393a38',false);}
 }),
 row('condenser','Left-front A/C condenser and fan','Refrigerant from the compressor sheds heat in the condenser. The left-front fan and its shroud draw air through the core.',[-.23,-.35,.18],refs.condenser,r=>{
  matrix(r,condCore,.252,.254,.039);draw993Fan(r,add(condCore,[.045,0,0]),.106);
 }),
 row('dryer','Receiver-drier','This canister sits between the condenser and the expansion valve. Its desiccant absorbs moisture from the refrigerant.',[-.12,-.26,.23],refs.frontLines,r=>{
  turn(r,dryer,z,[[-.084,0],[-.087,.026],[-.079,.032],[.074,.032],[.083,.025],[.083,0]],steel,{n:16});
  sleeve(r,dryer,z,-.024,-.010,.035,.032,black,14);
 }),
 row('lines','Refrigerant pipes and hoses','Follow the discharge hose from the compressor to the front condenser and the suction hose back from the evaporator. The bends through the body are schematic.',[0,-.31,-.17],refs.rearLines,r=>{
  const compPort=delta=>[compressor[0]-.03+delta,compressor[1],compressor[2]+.058];
  // Both refrigerant runs pass under the left sill, outboard of the warm-air
  // duct, then climb inboard of the front wheel tub to the condenser.
  // From the compressor both lines run forward, cross over the transaxle
  // behind the folded-top compartment and drop down the left side.
  channel(r,[compPort(0),add(compPort(0),[0,0,.035]),[1.48,.50,.64],[1.40,.50,.64],[1.14,.40,.665],[1.12,-.42,.665],[.89,-.45,.47],[.72,-.48,.30],[.55,-.62,.24],[.40,-.673,.228],[-.66,-.673,.228],[-.72,-.673,.21],[-.76,-.43,.21],[-.86,-.43,.30],[-1.08,-.43,.40],[-1.38,-.47,.55],[-1.56,-.50,.585],[-1.72,-.53,.55]],.009,steel);
  channel(r,[[-1.72,-.61,.33],[-1.64,-.50,.34],[-1.40,-.50,.513],[-1.15,-.50,.64],[-.95,-.50,.594],add(dryer,[0,0,.083])],.008,steel);
  // Between the brake booster and the bulkhead, up and across to the valve.
  channel(r,[add(dryer,[.014,0,.083]),[-.83,-.50,.62],[-.822,-.47,.78],[-.80,-.219,.78],valve],.008,steel);
  channel(r,[valve,[-.84,-.219,.72],[-.86,-.48,.62],[-.86,-.48,.24],[-.74,-.48,.21],[-.70,-.705,.21],[.40,-.705,.21],[.55,-.65,.24],[.72,-.515,.31],[.90,-.48,.48],[1.10,-.45,.69],[1.12,.43,.69],[1.40,.485,.66],[1.50,.52,.65],add(compPort(.028),[0,0,.035]),compPort(.028)],.013,black);
 }),
 row('evaporator','Evaporator and expansion valve','The valve meters refrigerant into the evaporator. Cabin air loses heat as it passes across the cold fins.',[-.21,.09,.28],refs.cabin,r=>{
  matrix(r,evap,.428,.146,.060);box(r,valve,[.042,.043,.049],brass);
 }),
 row('blowers','Left and right cabin blowers','Each end of the front heater housing contains a centrifugal blower. The two units feed opposite sides of the cabin.',[-.10,.31,.27],refs.cabin,r=>{
  for(const [s,key] of pair)r.instance(key,()=>blower(r,[-.733,s*.31,.68],.073));
 }),
 row('mix','Cabin temperature flaps and servomotors','Two electric servomotors set the temperature mixing flaps inside the front heater housing. The flaps meter the heated air reaching each side.',[.19,.18,.26],refs.cabin,r=>{
  for(const [s,key] of pair)r.instance(key,()=>{
   const c=[-.679,s*.186,.695];box(r,c,[.045,.084,.051],black);
   cyl(r,c,y,-.068,.064,.008,steel,10);
   r.polygon([[-.695,s*.12,.675],[-.695,s*.22,.675],[-.63,s*.22,.652],[-.63,s*.12,.652]],'#77817b',false);
  });
 }),
 row('outlets','Footwell and dashboard air guides','Separate branches direct conditioned air toward the footwells and the outlets at the sides of the dashboard.',[.16,-.16,.26],refs.cabinDucts,r=>{
  for(const [s] of pair){
   channel(r,[[-.69,s*.31,.685],[-.64,s*.41,.72],[-.571,s*.53,.728]],.030,black);
   channel(r,[[-.665,s*.34,.66],[-.598,s*.39,.57],[-.55,s*.423,.502]],.026,black);
  }
 })
];
function assembly(id,name,description,source,rows){
 return {id,name,description,source,category:'service',internal:true,view:'hero',viewAngle:[.76,-.35],parts:rows.map(p=>({...p,id:id+'.'+p.id,category:'service'}))};
}
export const groups=[
 assembly('993-lubrication','Dry-sump lubrication','Trace oil from the separate tank into the engine and back through the thermostat. The two long sill pipes connect the hot return circuit to the right-front cooler.',refs.oilCooler,oilRows),
 assembly('993-climate','Cabin heat and air conditioning','The 993 heats the cabin with air from jackets around its exhaust pipes. A separate refrigerant loop cools the incoming air at the front of the car. Pipe bends and installed dimensions are approximate.',refs.cabin,heatRows)
];
export function drawGroup(r,id){
 const group=groups.find(item=>item.id===id);
 if(!group)return;
 for(const p of group.parts)r.tag(p.id,()=>p.draw(r));
}
export function detailFor(id){return get993Study(id);}
