// Mercedes service figures P09.20-2277-00, P09.40-2377-00 and P09.41-2590-00.
// MY2014 R231 intercooler plate, items 1–9. The catalog does not dimension the
// concealed castings, plate pitch or pipe bends. Those details are schematic.
import {barrel,pipe,tint} from './road-primitives.js';
import {TAU,basis,mix,part,study,sleeve,turn,x,y,z} from './mechanism-shapes.js';

const alloy='#99a3a5',rubber='#343b3b',caseColor='#485053',iron='#707a7a';
const signs=[-1,1],height=.704;
const inletX=-1.378,bodyFront=-1.335,bodyRear=-1.075;
const outletX=-1.030,throttleEnd=-.985,butterflyX=-1.007;
const feedPort=[-1.344,.097,.684],hotPort=[-1.309,.097,.719];
function section(xx,cy,cz,w,h,cut){
  return [[-w+cut,-h],[w-cut,-h],[w,-h+cut],[w,h-cut],[w-cut,h],[-w+cut,h],[-w,h-cut],[-w,-h+cut]].map(([a,b])=>[xx,cy+a,cz+b]);
}
function circular(xx,cy,cz,R){
  return Array.from({length:8},(_,i)=>{
    const a=(i-2.5)*TAU/8;return [xx,cy+R*Math.cos(a),cz+R*Math.sin(a)];
  });
}
function walls(r,rings,color){
  for(let k=1;k<rings.length;k++){
    const a=rings[k-1],b=rings[k];
    for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],tint(color,[.76,.82,.95,1.04,1.13,1.03,.93,.81][i]),false);}
  }
}
// Sweep each bent delivery pipe as a single skin so its elbows do not open
// when viewed from the side. Intermediate rings round the changes of direction.
function deliveryPipe(r,path,radius){
  const points=[path[0]];
  for(let i=1;i<path.length-1;i++){
    const a=mix(path[i],path[i-1],.30),b=mix(path[i],path[i+1],.30);
    for(const t of [0,.5,1])points.push(mix(mix(a,path[i],t),mix(path[i],b,t),t));
  }
  points.push(path.at(-1));
  const rings=points.map((center,i)=>{
    const next=points[Math.min(i+1,points.length-1)],previous=points[Math.max(0,i-1)];
    const [,u,v]=basis(next.map((p,j)=>p-previous[j]));
    return Array.from({length:12},(_,j)=>center.map((p,k)=>p+radius*(u[k]*Math.cos(TAU*j/12)+v[k]*Math.sin(TAU*j/12))));
  });
  for(let i=1;i<rings.length;i++)for(let j=0;j<12;j++){
    const k=(j+1)%12;
    r.polygon([rings[i-1][j],rings[i-1][k],rings[i][k],rings[i][j]],tint('#849093',.89+.12*Math.sin(TAU*j/12)),false);
  }
}
function boost(r){
  for(const s of signs){
    deliveryPipe(r,[[-1.273,s*.395,.540],[-1.40,s*.374,.57],[-1.495,s*.241,.635],[-1.462,s*.139,.674],[-1.412,s*.055,height],[inletX,s*.055,height]],.032);
    sleeve(r,[inletX,s*.055,height],x,-.027,.002,.036,.031,rubber,14);
    sleeve(r,[inletX,s*.055,height],x,-.014,-.010,.037,.035,alloy,14);
  }
}
function housing(r){
  for(const s of signs){
    walls(r,[circular(inletX,s*.055,height,.033),section(-1.355,s*.052,height,.049,.055,.012),section(bodyFront,s*.048,height,.048,.058,.009)],caseColor);
  }
  walls(r,[section(bodyFront,0,height,.096,.058,.009),section(bodyRear,0,height,.096,.058,.009),circular(outletX,0,height,.047)],caseColor);
  for(const xx of [bodyFront+.003,-1.256,-1.167,bodyRear-.009]){
    for(const s of signs){
      r.box(xx,s*.096-.002,height-.041,xx+.006,s*.096+.002,height+.038,iron);
    }
  }
  for(const port of [feedPort,hotPort])sleeve(r,port,y,-.004,.022,.011,.008,iron,10);
  sleeve(r,[-1.318,.087,.743],z,-.010,.014,.0065,.0032,iron,10);
}
function plates(r){
  for(let i=0;i<8;i++){
    const zz=height-.047+i*.013;
    r.box(bodyFront+.004,-.089,zz,bodyRear-.008,.089,zz+.0035,'#acb3ad');
  }
  for(const s of signs)r.box(bodyFront+.010,s*.088-.002,height-.049,bodyRear-.011,s*.088+.002,height+.05,iron);
}
function throttleBody(r){
  sleeve(r,[outletX,0,height],x,0,throttleEnd-outletX,.051,.0435,alloy,22);
  r.box(butterflyX-.021,.047,height-.025,butterflyX+.021,.080,height+.026,caseColor);
  for(const s of signs)for(const k of signs)barrel(r,[outletX,s*.043,height+k*.036],[outletX+.008,s*.043,height+k*.036],.007,iron,8);
}
function butterfly(r,t){
  const a=.12+1.29*(1-Math.cos(TAU*t))*.5;
  const vertices=Array.from({length:22},(_,i)=>{
    const az=i*TAU/22,d=.0429*Math.sin(az);
    return [butterflyX+d*Math.sin(a),.0429*Math.cos(az),height+d*Math.cos(a)];
  });
  r.polygon(vertices,'#b49761',false);
  barrel(r,[butterflyX,-.047,height],[butterflyX,.055,height],.0038,iron,9);
}
function coupling(r){
  sleeve(r,[outletX,0,height],x,-.002,0,.049,.0433,'#86694e',20);
  sleeve(r,[throttleEnd,0,height],x,0,.027,.051,.0435,rubber,20);
  sleeve(r,[throttleEnd,0,height],x,.012,.017,.052,.050,alloy,20);
}
function distributor(r){
  walls(r,[circular(throttleEnd+.027,0,height,.045),section(-.931,0,height+.016,.113,.041,.021),section(-.905,0,height+.011,.126,.038,.019)],caseColor);
  r.polygon(section(-.905,0,height+.011,.126,.038,.019),rubber,false);
  for(const s of signs){
    pipe(r,[[-.923,s*.101,.709],[-.968,s*.130,.700],[-1.101,s*.137,.675],[-1.337,s*.141,.648]],.027,caseColor,10);
    for(let i=0;i<4;i++){
      const xx=-1.315+i*.107+(s>0?.020:0),zz=.648+(xx+1.337)*.129;
      pipe(r,[[xx,s*.139,zz],[xx,s*.150,zz-.018],[xx,s*.167,zz-.029]],.019,caseColor,9);
    }
  }
}
function sensors(r){
  for(const [xx,yy,zz] of [[-1.048,.028,.738],[-.934,-.069,.754],[-.922,.066,.752]]){
    barrel(r,[xx,yy,zz-.012],[xx,yy,zz+.004],.009,iron,9);
    r.box(xx-.007,yy-.008,zz+.002,xx+.019,yy+.008,zz+.013,rubber);
  }
}
const chargeParts=[
  part('ducts','Compressor delivery pipes','Each turbo sends compressed air into its own inlet on the front of the common cooler.',[-.11,0,-.04],boost),
  part('housing','Twin-inlet cooler housing','The two round sockets open into the front end tank. Both banks share one cooler, part A 278 090 04 14.',[0,-.12,.09],housing),
  part('matrix','Heat-exchanger matrix','Compressed air passes between the coolant passages. The section shows representative layers inside the sealed cooler.',[0,.11,.09],plates),
  part('throttle','Electronic throttle housing','The circular bore carries the butterfly. The electric actuator sits on the side of the casting, A 278 141 00 25.',[.09,-.065,0],throttleBody),
  part('butterfly','Throttle butterfly and spindle','The plate pivots on a transverse spindle to change the open area of the bore.',[0,0,.11],butterfly),
  part('seal','Throttle seal, rubber coupling and clamp','The throttle mounts against an O-ring. A clamped coupling joins the outlet to the distributor.',[.080,.055,-.055],coupling),
  part('distributor','Charge-air distributor and eight runners','Past the throttle, cooled air divides into the runners for the two cylinder heads.',[.11,0,.025],distributor),
  part('sensors','Pressure and temperature sensors','B28/6 measures upstream boost. B28/7 and B17 sense pressure and temperature in the distributor.',[0,-.09,.11],sensors)
];

const top=[-1.930,-.351,.508],bottom=[-1.930,.351,.262];
const inlet=[-1.695,.369,.275],outlet=[-1.666,.369,.309],tee=[-1.765,.373,.267];
function frontCooler(r){
  r.box(-1.947,-.344,.239,-1.922,.344,.529,'#768586');
  for(let i=0;i<19;i++)r.box(-1.949,-.343,.246+i*.015,-1.946,.343,.250+i*.015,'#546669');
  for(const s of signs)r.box(-1.945,s*.355-.011,.239,-1.914,s*.355+.011,.529,caseColor);
  for(const p of [top,bottom])sleeve(r,p,x,0,.029,.013,.009,iron,10);
}
function pump(r){
  turn(r,[-1.666,.369,.275],x,[[-.014,.018],[-.011,.031],[.014,.034],[.020,.030],[.082,.028],[.089,.022],[.089,0]],caseColor,{n:15});
  sleeve(r,inlet,x,-.005,.017,.014,.010,iron,12);
  sleeve(r,outlet,z,-.011,.009,.013,.009,iron,12);
  r.box(-1.595,.388,.268,-1.577,.411,.281,rubber);
}
function cold(r){
  pipe(r,[[-1.901,bottom[1],bottom[2]],[-1.832,.374,.266],tee,[-1.709,.369,.275],inlet],.010,rubber,9);
  pipe(r,[outlet,[-1.662,.369,.339],[-1.569,.321,.430],[-1.510,.244,.531],[-1.421,.126,.645],[feedPort[0],.133,feedPort[2]],[feedPort[0],.119,feedPort[2]]],.010,rubber,9);
}
function hot(r){
  pipe(r,[[hotPort[0],.119,hotPort[2]],[-1.337,.152,.719],[-1.446,.138,.733],[-1.561,.103,.642],[-1.693,-.012,.584],[-1.786,-.266,.553],[-1.848,-.351,.508],[-1.901,top[1],top[2]]],.010,'#505855',9);
}
function tank(r){
  const rings=[section(-1.462,.489,.60,.035,.062,.012),section(-1.439,.489,.611,.057,.085,.019),section(-1.349,.489,.616,.058,.081,.020),section(-1.324,.489,.621,.044,.062,.015)];
  walls(r,rings,'#bbbcb0');for(const ring of [rings[0],rings.at(-1)])r.polygon(ring,'#aaa99d',false);
  sleeve(r,[-1.438,.421,.662],y,-.007,.014,.006,.0035,iron,10);
  turn(r,[-1.386,.489,.699],z,[[-.008,.019],[.013,.019],[.014,.025],[.025,.025],[.027,0]],rubber,{n:14});
  pipe(r,[[-1.413,.490,.535],[-1.469,.496,.494],[-1.585,.478,.397],[-1.708,.432,.326],tee],.009,rubber,9);
}
function vent(r){
  pipe(r,[[-1.318,.087,.757],[-1.327,.097,.765],[-1.399,.140,.750],[-1.479,.188,.750],[-1.484,.337,.715],[-1.461,.397,.675],[-1.438,.406,.665],[-1.438,.414,.662]],.0045,'#515a56',8);
}
const coolerEndpoint=part('engine-cooler','Engine-mounted charge cooler','The two larger coolant fittings terminate the delivery and return hoses. The small upper connection carries the bleed line.',[.035,0,.085],housing);
const coolingParts=[
  part('exchanger','Front low-temperature cooler','Ambient air removes heat from the charge-coolant loop at the front of the cooling pack.',[-.12,0,0],frontCooler),
  part('pump','M44 electric circulation pump','The pump draws cooled liquid through its end connection and pushes it out through the side of the pump head.',[0,.10,-.04],pump),
  part('cold','Cooler outlet and pump delivery hoses','Follow the right-hand cooler connection to M44, then the pump delivery line up to the charge cooler.',[.07,.06,0],cold),
  part('hot','Warm return to the front cooler','Coolant leaving the charge cooler travels forward to the front exchanger.',[-.065,-.07,.035],hot),
  part('tank','Expansion reservoir and branch hose','The reservoir joins the low side of the circuit at a branch in the plumbing.',[.06,.085,.07],tank),
  part('vent','Small-bore vent line','The narrow bleed line connects the charge cooler to the expansion reservoir.',[0,-.07,.09],vent)
];
export function drawCharge(r){for(const p of chargeParts)p.draw(r,0);}
export function drawChargeCooling(r){for(const p of coolingParts)p.draw(r,0);}
export function makeChargeStudies(refs){
  return {
    'sl-air.core':study('sl-charge','Charge cooler, throttle and distributor','Open the common M278 cooler and follow the ductwork to the eight intake runners. The plate stack and runner profiles are schematic.',refs.core,chargeParts,'The butterfly opens and closes around its spindle.'),
    'sl-air.low-temp':study('sl-charge-cooling','Charge-coolant circuit','The front exchanger, M44 pump and charge cooler form a separate circulation loop. The fill and vent branches lead to the reservoir. Concealed hose bends and mounting locations are approximate.',refs.cooling,[...coolingParts,coolerEndpoint])
  };
}
