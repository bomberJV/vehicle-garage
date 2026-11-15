// US 2014 SL550 (231.473). Axles at x = ±1.2925 m. The R231 parts plates
// identify fitted assemblies. The Mercedes engine-family drawings identify
// their connections. Concealed pipe bends and castings are illustrative.
import {pipe,barrel,ellipse,tint} from './road-primitives.js';
import {turn,TAU,x} from './mechanism-shapes.js';
import {abcParts,abcTankStudy,hydraulicPlates} from './sl550-abc.js';
import {drawM278Timing} from './sl550-power-timing.js';
import {drawCharge,drawChargeCooling,makeChargeStudies} from './sl550-charge.js';
import {drawSLPropeller,drawSLExhaust,drawSLFinal,drawSLStartStopPump,slShaftStudy,slExhaustStudy} from './sl550-driveline.js';
import {makePowerStudies} from './sl550-power-studies.js';

const mb='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/';
const training='https://w124performance.com/docs/mb/M278/M276_M278_Introduction_into_Service.pdf';
const source=(label,url)=>({label,url});
export const slPowerSources={
  dress:source('Mercedes-Benz Service · complete M278 viewed from the front',training+'#page=11'),
  timing:source('Mercedes-Benz Service · eight-cylinder chain drive, plate P05.00-2089-00',training+'#page=28'),
  block:source('Mercedes-Benz Service · M278 crankcase and crank assembly',training+'#page=20'),
  induction:source('Mercedes-Benz Service · M278 intake and charge-air flow',training+'#page=38'),
  engineCooling:source('Mercedes-Benz Service · M278 engine and turbocharger coolant circuit',training+'#page=57'),
  cooling:source('Mercedes-Benz Service · separate charge-coolant circuit',training+'#page=40'),
  fuel:source('Mercedes-Benz Service · direct injection and fuel supply',training+'#page=48'),
  ignition:source('Mercedes-Benz Service · ignition system',training+'#page=67'),
  turbo:source('Mercedes-Benz · 2014 SL550 turbocharger installation','https://www.mbpartsgiant.com/parts-list/2014-mercedes_benz-sl550/engine/turbocharger-components'),
  core:source('Mercedes-Benz Classic · SL550 intercooler and throttle body',mb+'cooling-system--intercooler'),
  ...hydraulicPlates,
  transmission:source('Mercedes-Benz Service · 7G-TRONIC PLUS section P27.10-2400-00','https://www.manualslib.de/manual/89970/Mercedes-Benz-Typenreihe-231.html?page=49'),
  shaft:source('Mercedes-Benz USA · two-piece shaft, flexible discs and center support',mb+'driveline-and-axles--drive-shaft'),
  exhaust:source('Mercedes-Benz USA · SL550 converters and front and rear mufflers','https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-6l-v8-gas/exhaust--exhaust-components'),
  diff:source('Mercedes-Benz Classic · R231 rear differential and axles',mb+'driveline-and-axles--differential'),
  brochure:source('Mercedes-Benz USA · 2014 SL-Class equipment and technical data','https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf')
};

const alloy='#949da0',casting='#686e70',rubber='#313638',intake='#404749',bronze='#897066',steel='#778589';
const sides=[-1,1];
const bearingZ=.395;
const cylinderX=(bank,i)=>-1.315+i*.107+(bank>0?.020:0);
function loft(r,rows,color){
  for(let i=1;i<rows.length;i++)for(let j=0;j<rows[i].length;j++){
    const k=(j+1)%rows[i].length;
    r.polygon([rows[i-1][j],rows[i-1][k],rows[i][k],rows[i][j]],tint(color,[.83,1,1.08,.89,.75,.77][j%6]),false);
  }
  r.polygon(rows[0],color,false);r.polygon(rows.at(-1),color,false);
}
function bankCasting(r,side,levels,color){
  // Each section in the end view spans the bank axis and its perpendicular.
  const ring=(xx)=>levels.map(([a,b])=>[xx,side*(a+b)*Math.SQRT1_2,bearingZ+(a-b)*Math.SQRT1_2]);
  loft(r,[ring(-1.39),ring(-.91)],color);
}
const bank=(r,levels,color)=>{for(const s of sides)bankCasting(r,s,levels,color);};
const castingGroup=(id,name,description,parts)=>({id,name,description,internal:true,
  parts:parts.map(([key,name,description,offset,ref])=>({id:id+'.'+key,name,description,offset,source:slPowerSources[ref]}))});
const engine=[
  ['cover','Removable V8 engine cover','The narrow nose of the cover carries the three-pointed star. Lift it away to expose the central charge cooler and throttle housing.',[.03,0,.29],'dress',r=>{
    const ring=(xx,w,height)=>[[xx,-w,height-.017],[xx,w,height-.017],[xx,w,height-.006],[xx,w*.74,height],[xx,-w*.74,height],[xx,-w,height-.006]];
    loft(r,[ring(-1.503,.061,.730),ring(-1.445,.078,.755),ring(-1.29,.104,.783),ring(-1.125,.145,.807),ring(-.967,.163,.814),ring(-.901,.127,.793)],intake);
    for(let i=0;i<8;i++)r.box(-1.112+i*.014,-.096,.810+i*.00055,-1.105+i*.014,.096,.812+i*.00055,steel);
    const center=[-1.411,0,.766],u=[.027,0,.0049],v=[0,.026,0],pt=(radius,angle)=>center.map((c,i)=>c+radius*(u[i]*Math.cos(angle)+v[i]*Math.sin(angle)));
    ellipse(r,center,u,v,1,.91,'#c5c8c4',24);
    for(let j=0;j<3;j++){const a=j*TAU/3;r.polygon([pt(.19,a-.67),pt(.90,a),pt(.19,a+.67),center],'#bfc4bf',false);}
  }],
  ['block','90° V8 crankcase','Four cylinders in each bank share a longitudinal crankshaft. Open the crankcase to follow the pistons through one revolution.',[0,0,.08],'block',r=>{
    bank(r,[[.035,-.08],[.24,-.08],[.245,.08],[.048,.09]],casting);
    r.box(-1.39,-.131,.275,-.902,.131,.405,'#737a7b');
  }],
  ['sump','Oil pan','The lower pan closes the bottom of the crankcase. Its shallow forward section clears the front axle carrier.',[0,0,-.24],'block',r=>{
    r.profile([[-1.409,.307],[-1.409,.233],[-1.22,.228],[-1.17,.195],[-.96,.195],[-.91,.29],[-.91,.307]],-.149,.149,alloy);
    for(let i=0;i<6;i++)r.box(-1.16+i*.033,-.131,.19,-1.15+i*.033,.131,.204,casting);
  }],
  ['heads','Cylinder heads and cam covers','Each bank carries intake and exhaust camshafts. The upper covers follow the 90-degree bank angle.',[0,.16,.27],'block',r=>{
    bank(r,[[.243,-.108],[.332,-.108],[.352,-.078],[.352,.075],[.331,.111],[.243,.111]],alloy);
    bank(r,[[.348,-.107],[.389,-.085],[.403,-.062],[.403,.070],[.384,.107],[.349,.107]],rubber);
  }],
  ['ignition','Eight ignition coils and spark plugs','Each coil sits above its own spark plug. Left and right are named from the driver’s seat.',[-.13,0,.24],'ignition',r=>{
    for(const s of sides)for(let i=0;i<4;i++){const xx=cylinderX(s,i);
      barrel(r,[xx,s*.242,.641],[xx,s*.282,.682],.015,'#b7b4aa',7);
      r.box(xx-.017,s*.285-.019,.675,xx+.017,s*.285+.019,.708,'#303439');
    }
  }],
  ['fuel','Fuel rails and direct injectors','A high-pressure rail feeds four injectors on each bank. Each nozzle sprays into the combustion chamber.',[0,-.15,.18],'fuel',r=>{
    for(const s of sides){
      barrel(r,[-1.374,s*.173,.655],[-.938,s*.173,.655],.013,'#b4b3a5',10);
      for(let i=0;i<4;i++){const xx=cylinderX(s,i);r.rod([xx,s*.173,.655],[xx,s*.211,.604],.011,'#adb2b0',7);}
    }
  }],
  ['timing','Timing case, chains and camshafts','Open the timing case to trace the four chains and the camshafts through both cylinder heads.',[-.15,0,.03],'timing',drawM278Timing],
  ['drive','Front accessory drive','The crank pulley drives the accessory belt at the front of the engine.',[-.20,0,.04],'block',r=>{
    for(const [cy,cz,rad] of [[0,bearingZ,.075],[-.20,.418,.057],[.16,.46,.054],[.058,.605,.051],[-.10,.587,.036]]){
      barrel(r,[-1.475,cy,cz],[-1.43,cy,cz],rad,'#555a5a',15);
      barrel(r,[-1.479,cy,cz],[-1.475,cy,cz],rad*.52,'#929a98',12);
    }
    const loop=[[0,.321],[-.208,.358],[-.253,.430],[-.135,.61],[.049,.657],[.113,.635],[.213,.476],[.196,.419],[0,.321]];
    for(const xx of [-1.464,-1.443])pipe(r,loop.map(([y,z])=>[xx,y,z]),.006,rubber,5);
  }]
];
const air=[
  ['filters','Twin air cleaners and intake snorkels','Two front ducts deliver outside air to the left and right filters. Their clean outlets turn forward and down to the compressors.',[-.14,0,.26],'induction',r=>{
    for(const s of sides){
      const ring=(xx,inner,outer,top)=>[[xx,s*inner,top-.052],[xx,s*outer,top-.060],[xx,s*outer,top-.014],[xx,s*(outer-.022),top],[xx,s*(inner+.012),top],[xx,s*inner,top-.013]];
      loft(r,[ring(-1.45,.207,.336,.728),ring(-1.33,.171,.383,.767),ring(-1.06,.164,.369,.797),ring(-.948,.210,.324,.786)],intake);
      pipe(r,[[-1.91,s*.396,.615],[-1.68,s*.403,.649],[-1.44,s*.365,.676],[-1.35,s*.346,.715]],.048,rubber,10);
      pipe(r,[[-1.27,s*.203,.724],[-1.45,s*.197,.713],[-1.53,s*.256,.624],[-1.43,s*.373,.516],[-1.311,s*.374,.506]],.039,rubber,9);
    }
  }],
  ['manifolds','Exhaust manifolds','Four ports on each outer bank feed its turbine. Follow the gas path from the head to the catalytic converter.',[0,-.24,.06],'turbo',r=>{
    for(const s of sides)for(let i=0;i<4;i++){const xx=cylinderX(s,i);
      pipe(r,[[xx,s*.292,.544],[xx,s*.34,.500],[-1.13+(i-1.5)*.029,s*.36,.463],[-1.128,s*.37,.466]],.019,bronze,7);
    }
  }],
  ['turbos','Two turbochargers and wastegates','A turbine outside each bank drives a compressor through a common shaft. A vacuum actuator operates the exhaust bypass flap.',[.10,.23,.09],'turbo',r=>{
    for(const s of sides){
      turn(r,[-1.235,s*.374,.505],x,[[-.079,.038],[-.056,.06],[-.028,.070],[.003,.069],[.018,.043],[.05,.031],[.077,.052],[.095,.067],[.128,.066],[.143,.043]],alloy,{n:14});
      barrel(r,[-1.162,s*.375,.434],[-1.104,s*.375,.434],.032,'#a29b85',9);
      r.rod([-1.115,s*.374,.434],[-1.08,s*.374,.47],.005,steel,6);
    }
  }],
  ['core','Charge cooler, throttle and distributor','The two compressor outlets meet at the shared cooler. Open it to inspect the matrix, throttle butterfly, seals and eight intake runners.',[0,0,.28],'core',drawCharge],
  ['radiator','Engine radiator and cooling fan','Engine coolant carries heat from the banks and turbochargers to the front radiator. Its fan draws air through the cooling pack.',[-.22,0,.08],'engineCooling',r=>{
    r.box(-1.896,-.38,.223,-1.862,.38,.618,'#525e60');
    for(let i=0;i<16;i++)r.box(-1.898,-.38,.233+i*.024,-1.892,.38,.236+i*.024,steel);
    const c=[-1.825,0,.429];barrel(r,[-1.849,0,.429],[-1.802,0,.429],.046,intake,12);
    for(let j=0;j<7;j++){const a=j*TAU/7,p=(rr,da)=>[c[0],rr*Math.cos(a+da),c[2]+rr*Math.sin(a+da)];r.polygon([p(.042,0),p(.164,-.15),p(.178,.12),p(.155,.26),p(.04,.35)],rubber,false);}
    pipe(r,[[-1.863,.319,.555],[-1.68,.27,.565],[-1.497,.244,.512],[-1.413,.160,.482]],.022,rubber,8);
    pipe(r,[[-1.864,-.335,.247],[-1.698,-.307,.259],[-1.524,-.203,.324],[-1.42,-.138,.402]],.024,rubber,8);
  }],
  ['low-temp','Charge-coolant circuit','A second front exchanger cools the fluid. Trace both hoses through the electric pump and charge cooler, or inspect the reservoir and vent branch.',[-.31,0,-.09],'cooling',drawChargeCooling]
];
const drive=[
  ['auto','7G-TRONIC PLUS automatic','The torque converter and lockup clutch sit inside the bellhousing at the rear of the V8. The gear train follows the center tunnel.',[.14,0,-.19],'transmission',r=>{
    turn(r,[-.903,0,bearingZ],x,[[0,.165],[.038,.18],[.138,.157],[.195,.119],[.39,.105],[.595,.089],[.665,.059],[.70,.051]],alloy,{n:18});
    for(const xx of [-.714,-.49,-.39])turn(r,[xx,0,bearingZ],x,[[-.005,.105],[0,.112],[.007,.104]],casting,{n:15});
    r.profile([[-.726,.303],[-.313,.303],[-.361,.241],[-.677,.236]],-.116,.116,'#555956');
    drawSLStartStopPump(r,[-.783,-.077,.255]);
  }],
  ['shaft','Propeller shaft and center support','Two tubes carry torque between flexible discs at the gearbox and differential. Open the shaft to see the rubber-mounted center bearing.',[.12,.15,-.18],'shaft',drawSLPropeller],
  ['final','Rear differential','The bolted rear cover closes the ribbed housing. Inside, the pinion turns the crown wheel and the carrier drives the two rear axles.',[.16,0,-.21],'diff',drawSLFinal],
  ['axles','Rear driveshafts and CV joints','An inner joint and outer joint carry drive as each rear wheel moves relative to the body.',[.11,.31,-.08],'diff',r=>{
    for(const s of sides){
      barrel(r,[1.2925,s*.14,.35],[1.2925,s*.784,.335],.019,steel,9);
      for(const yy of [.172,.723])turn(r,[1.2925,s*yy,yy>.5?.336:.348],[0,s,0],[[-.024,.033],[-.01,.048],[0,.042],[.009,.048],[.019,.040],[.027,.045],[.042,.029]],rubber,{n:10});
    }
  }],
  ['exhaust','Catalysts, pipes and silencers','Follow both banks through the front muffler and out to separate rear silencers. Open the exhaust to separate the pipes and mounts.',[0,.25,-.16],'exhaust',drawSLExhaust]
];
const sections=[
  ['sl-m278','4.6-liter biturbo V8','The M278 sits longitudinally behind the radiator. Open the crankcase for the cross-plane crank and two banks of pistons.',engine],
  ['sl-air','Induction and cooling','Trace outside air through two filters and compressors to one water-cooled charge cooler. The engine and the charge cooler use separate coolant circuits.',air],
  ['sl-drive','Transmission, rear axle and exhaust','Follow the seven-speed automatic to the rear wheels, or trace a separate exhaust pipe from each bank to the rear bumper.',drive],
  ['sl-abc','Active Body Control','This build includes the optional ABC hydraulic suspension. Each strut combines a steel spring, damper and hydraulic spring support.',abcParts]
];
export const slPowerGroups=sections.map(([id,name,desc,parts])=>castingGroup(id,name,desc,parts));
export function drawSLPower(r){
  for(const [id,,,parts] of sections)for(const [key,,,,,draw] of parts)r.tag(id+'.'+key,()=>draw(r));
}
export const slPowerStudies={...makePowerStudies(slPowerSources),'sl-drive.shaft':slShaftStudy(slPowerSources.shaft),'sl-drive.exhaust':slExhaustStudy(slPowerSources.exhaust),'sl-abc.supply':abcTankStudy,...makeChargeStudies(slPowerSources)};
