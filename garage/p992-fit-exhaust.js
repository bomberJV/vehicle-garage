// 992 fit pack: exhaust. Installed parts drawn onto the car.
// Scope: Exhaust after the turbochargers: catalytic converters, particulate filters, silencers, oxygen sensors, exhaust-flap actuators, hangers and rubber mounts, heat shields, tailpipe trims. engine.exhaust (manifolds and pipes) already exists: add the separate components around it.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-exhaust' or 'p992-fit-exhaust-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche part number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// The US 992.1 Carrera S has no petrol particulate filter, so the converters come
// from plate 202-250 rather than 202-200. The car is drawn with the optional
// two-oval sports exhaust (engine.exhaust), so the silencer hardware and tailpipe
// trims come from plates 202-350 and 202-450. The silencer can itself and the
// down pipes belong to engine.exhaust and are not redrawn here.
//
// Positions follow engine.exhaust (garage/porsche-engine-dress.js): each turbine
// sits at x 1.742, |y| .426, z .378; its down pipe drops to z .241 and runs aft at
// |y| .43 to the transverse silencer centred at x 1.994, z .330 (|y| up to .356).
// Where a number covers both banks, Porsche lists one number and one fitted part
// is drawn, on the left bank.
import {pipe} from './road-primitives.js';
import {box} from './road-service-geometry.js';
import {cyl,sleeve,turn,basis,point,x,y,z,TAU} from './mechanism-shapes.js';
import {E992} from './porsche992-layout.js';

const base='https://www.eurospares.co.uk/Porsche/992/';
const plate=(code,title,path)=>({label:'Eurospares · Porsche 992.1 catalogue diagram '+code+', '+title,url:base+path});
const catalysts=plate('202-250','Catalytic converters, fastenings and sensors','2019_(992-1)/PartDiagrams/202-250/CATALYST');
const silencerPlate=plate('202-350','Silencer for sports exhaust system','2020_(992-1)/PartDiagrams/202-350/SILENCER');
const tailPlate=plate('202-450','Exhaust tail pipes for sports exhaust system','2019_(992-1)/PartDiagrams/202-450/TAIL_PIPE');
const flapPlate=plate('202-550','Exhaust system throttle control element, electric','2019_(992-1)/PartDiagrams/202-550/EXHAUST_SYSTEM');
const turboPlate=plate('202-000','Exhaust gas turbochargers and exhaust manifolds','2020_(992-1)/PartDiagrams/202-000/EXHAUST_GAS_TURBOCHARGER');
const headPlate=plate('103-000','Cylinder head, head gasket and valve cover','2020_(992-1)/PartDiagrams/103-000/CYLINDER_HEAD');
const sumpPlate=plate('104-050','Oil sump','2020_(992-1)/PartDiagrams/104-050/OIL_PAN');

const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(sub,name,description,source,parts)=>({id:'p992-fit-exhaust-'+sub,name,description,source,view:'hero',internal:true,category:'service',
  parts:parts.map(p=>({...p,id:'p992-fit-exhaust-'+sub+'.'+p.id}))});

const steel='#7d8380',shieldTone='#a4a8a2',bracketTone='#5d6568',dark='#2e3436',stainless='#b8bcba',sensor='#8c9294';
const sides=[[-1,'left','Left'],[1,'right','Right']];
// Pressed heat shields: a thin curved sheet about an axis, between two stations.
function arc(r,c,axis,a,b,R,start,sweep,color,n=10){
  const B=basis(axis);
  for(let i=0;i<n;i++){
    const t0=start+sweep*i/n,t1=start+sweep*(i+1)/n;
    r.polygon([point(c,B,a,R,t0),point(c,B,a,R,t1),point(c,B,b,R,t1),point(c,B,b,R,t0)],color,false);
  }
}
// Arc angles about x: 0 points to -y, PI/2 down, PI to +y, 3PI/2 up. An arc
// that starts at `start` on the left mirrors to PI-start-sweep on the right.
const mirror=(s,start,sweep)=>s<0?start:Math.PI-start-sweep;

// Down pipe of each bank (engine.exhaust): turbine outlet, bend, aft run.
const outletA=s=>[E992.cx+.114,s*.426,E992.z-.20],outletB=s=>[E992.cx+.144,s*.43,E992.z-.26];
const catAxis=s=>[0,s*.43,.241];
const turboCentre=s=>[E992.cx+.114,s*.426,E992.z-.124];
const mixp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

const converterParts=[
  ...sides.map(([s,hand,Hand])=>part('converter-'+hand,Hand+' catalytic converter · '+(s<0?'992254400N':'992254450N'),
    'The three-way converter for cylinders '+(s<0?'4-6':'1-3')+' is welded into the down pipe under its turbocharger and cleans the exhaust before it reaches the rear silencer.',
    [0,s*.30,-.10],catalysts,r=>{
      turn(r,catAxis(s),x,[[1.776,.045],[1.792,.055],[1.866,.055],[1.882,.045]],steel,{n:16});
    })),
  ...sides.map(([s,hand,Hand])=>part('insulation-'+hand,Hand+' converter heat insulation · '+(s<0?'0PB145325B':'0PB145326B'),
    'A pressed shield wraps the outer and lower side of the converter, keeping its heat away from the wheel housing and the road.',
    [0,s*.36,.04],catalysts,r=>{
      arc(r,catAxis(s),x,1.788,1.870,.066,mirror(s,-.2*Math.PI,.75*Math.PI),.75*Math.PI,shieldTone,12);
    })),
  ...sides.map(([s,hand,Hand])=>part('bracket-'+hand,Hand+' converter retaining bracket · '+(s<0?'992251519A':'992251519'),
    'A steel strap ties the converter body back to the underside of the crankcase so the hot pipe does not hang from the turbine flange alone.',
    [0,s*.20,-.14],catalysts,r=>{
      pipe(r,[[1.842,s*.392,.288],[1.842,s*.30,.335],[1.806,s*.17,.397]],.008,bracketTone,4);
      box(r,[1.806,s*.17,.396],[.030,.030,.006],bracketTone);
    })),
  part('lambda-upstream','Lambda probe in front of the catalytic converter · 0PB906262M',
    'The wide-band oxygen sensor screws into the down pipe just below the turbine and measures the mixture the engine burns; the right bank carries the same probe.',
    [0,-.22,-.04],catalysts,r=>{
      const c=mixp(outletA(-1),outletB(-1),.4),d=[.10,-.97,-.20];
      cyl(r,c,d,.030,.050,.012,sensor,6);cyl(r,c,d,.050,.096,.0085,sensor,8);cyl(r,c,d,.096,.122,.0065,dark,8);
    }),
  part('lambda-downstream','Lambda probe behind the catalytic converter · 0PB906265D',
    'The second oxygen sensor sits in the converter outlet cone and tells the engine unit how well the converter is working; the right bank carries the same probe.',
    [.06,-.22,-.04],catalysts,r=>{
      const c=[1.874,-.43,.241],d=[0,-.97,.24];
      cyl(r,c,d,.040,.073,.011,sensor,6);cyl(r,c,d,.073,.112,.008,sensor,8);cyl(r,c,d,.112,.134,.006,dark,8);
    }),
  part('connector-bracket','Lambda probe connector bracket · 992906109',
    'The plug housings of the probe leads clip to this small bracket on the rear of the crankcase, clear of the hot pipes.',
    [0,-.12,.06],catalysts,r=>{
      box(r,[1.745,-.187,.415],[.045,.008,.035],bracketTone);box(r,[1.745,-.198,.418],[.026,.014,.020],dark);
    }),
  part('clip','Turbine outlet clamp · 9P1253725A',
    'A V-band clamp holds the down pipe flange to the turbine outlet so the converter can come off without disturbing the turbocharger.',
    [0,-.18,.04],catalysts,r=>{
      const a=outletA(-1),b=outletB(-1),c=mixp(a,b,.18),d=b.map((v,i)=>v-a[i]);
      sleeve(r,c,d,-.008,.008,.051,.043,bracketTone,16);
    })
];

// Sports silencer, transverse behind the engine (engine.exhaust).
const S=[E992.cx+.366,0,.330];
const can=(u,k)=>Array.from({length:18},(_,i)=>{
  const a=TAU*i/18,p=Math.cos(a),q=Math.sin(a);
  return [S[0]+k*.081*Math.sign(p)*Math.abs(p)**.68,u,S[2]+k*.083*Math.sign(q)*Math.abs(q)**.78];
});
function ovalTube(r,x0,x1,cy,cz,w,h,color,n=18){
  const ring=xx=>Array.from({length:n},(_,i)=>[xx,cy+w*Math.cos(TAU*i/n),cz+h*Math.sin(TAU*i/n)]);
  const a=ring(x0),b=ring(x1);
  for(let i=0;i<n;i++){const j=(i+1)%n;r.polygon([a[i],a[j],b[j],b[i]],color,false);}
}
const silencerParts=[
  part('heat-shield','Silencer heat shield · 992251414A',
    'A pressed sheet over the top of the transverse silencer shields the rear apron and the engine above it from the hot silencer.',
    [0,0,.16],silencerPlate,r=>{
      arc(r,S,y,-.30,.30,.104,1.25*Math.PI,.60*Math.PI,shieldTone,12);
    }),
  part('strap','Silencer tensioning strap · 992251571',
    'A steel band around the silencer can pulls it against its bracket; a second strap with the same number sits at the right end.',
    [0,-.10,-.10],silencerPlate,r=>{
      const a=can(-.214,1.06),b=can(-.186,1.06);
      for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],bracketTone,false);}
    }),
  part('bracket','Silencer bracket · 992251225B',
    'A plate on the front face of the silencer takes the straps and bolts the silencer to the console under the engine.',
    [-.10,0,-.06],silencerPlate,r=>{
      box(r,[1.908,0,.355],[.016,.16,.070],bracketTone);
    }),
  part('console','Silencer console · 992251377A',
    'The console is bolted under the rear of the crankcase and carries the silencer bracket, so the silencer moves with the engine on its mounts.',
    [-.12,0,.10],silencerPlate,r=>{
      box(r,[1.855,0,.392],[.100,.140,.012],bracketTone);
      for(const s of [-1,1])box(r,[1.855,s*.064,.380],[.090,.010,.020],bracketTone);
    }),
  part('clamping-sleeve','Clamping sleeve D=70 · 992253143A',
    'A 70 mm clamp joins the converter outlet pipe to the silencer inlet stub; the right bank uses the same sleeve.',
    [-.04,-.14,-.06],silencerPlate,r=>{
      const d=[1.909,-.40,.25],e=[1.994,-.321,.30];
      sleeve(r,mixp(d,e,.32),e.map((v,i)=>v-d[i]),-.018,.018,.050,.044,bracketTone,16);
    }),
  ...sides.map(([s,hand,Hand])=>part('tailpipe-'+hand,Hand+' sports exhaust tailpipe · '+(s<0?'992251187BC':'992251188BC'),
    'The oval stainless trim slides over the silencer outlet and sits in the opening of the rear apron.',
    [.20,s*.10,0],tailPlate,r=>{
      ovalTube(r,2.112,2.196,s*.455,.311,.074,.054,stainless,20);
    })),
  part('flap-actuator','Exhaust flap actuator · 992906247A',
    'The electric actuator on the back of the silencer turns the flaps that open the sports exhaust path when the driver selects it.',
    [.16,0,-.04],flapPlate,r=>{
      box(r,[2.098,0,.325],[.050,.090,.065],dark);
      cyl(r,[2.098,.045,.325],y,0,.018,.014,dark,10);box(r,[2.112,-.032,.348],[.018,.022,.014],'#454c4f');
    })
];

// Heat shields on the engine around the manifolds and turbines.
const bankX=s=>s<0?[1.45,1.71]:[1.50,1.71];
const shieldParts=[
  ...sides.map(([s,hand,Hand])=>part('manifold-'+hand,Hand+' exhaust manifold heat shield · '+(s<0?'0PB251414':'0PB251258'),
    'A pressed tray under the three manifold pipes of cylinders '+(s<0?'4-6':'1-3')+' keeps their heat off the rear axle links and the floor.',
    [0,s*.18,-.12],turboPlate,r=>{
      const [a,b]=bankX(s),m=(a+b)/2+.025,l=b-a-.05;
      box(r,[m,s*.390,.292],[l,.100,.004],shieldTone);
      box(r,[m,s*.442,.316],[l,.004,.052],shieldTone);
      box(r,[m,s*.338,.349],[l,.004,.118],shieldTone);
    })),
  ...sides.map(([s,hand,Hand])=>part('turbo-'+hand,Hand+' turbocharger heat shield · '+(s<0?'0PB103782A':'0PB103781A'),
    'A curved shield on the outer side of the turbine housing for cylinders '+(s<0?'4-6':'1-3')+' protects the wheel housing and the wastegate actuator.',
    [0,s*.22,0],turboPlate,r=>{
      arc(r,turboCentre(s),x,-.030,.030,.095,mirror(s,-.35*Math.PI,.60*Math.PI),.60*Math.PI,shieldTone,10);
    })),
  ...sides.map(([s,hand,Hand])=>part('head-'+hand,Hand+' cylinder head heat shield, lower part · '+(s<0?'0PB103768B':'0PB103764B'),
    'A narrow plate under the outer edge of the cylinder head for cylinders '+(s<0?'4-6':'1-3')+' sits between the head and the manifold pipes.',
    [0,s*.16,-.06],headPlate,r=>{
      const [a,b]=bankX(s);
      box(r,[(a+b)/2,s*.430,.403],[b-a,.035,.004],shieldTone);
    })),
  ...sides.map(([s,hand,Hand])=>part('sump-'+hand,Hand+' oil sump heat insulation · '+(s<0?'0PB115821A':'0PB115822A'),
    'An insulating plate on the '+hand+' side of the oil sump faces the manifold pipes and keeps their heat out of the engine oil.',
    [0,s*.14,-.08],sumpPlate,r=>{
      box(r,[1.575,s*.186,.412],[.28,.006,.036],shieldTone);
    }))
];

export const groups=[
  group('catalysts','Catalytic converters and lambda probes',
    'One three-way converter per bank is welded into the down pipe under its turbocharger, with an oxygen sensor in front of and behind it. US cars have no petrol particulate filter.',catalysts,converterParts),
  group('silencer','Sports exhaust silencer mounting, flap and tailpipes',
    'The transverse sports silencer hangs from a console under the crankcase, wears a heat shield on top, and ends in two oval stainless tailpipes. An electric actuator works the exhaust flaps.',silencerPlate,silencerParts),
  group('shields','Engine exhaust heat shields',
    'Pressed shields under the manifolds, around the turbines, below the cylinder heads and on the oil sump keep exhaust heat away from the engine, axle and body.',turboPlate,shieldParts)
];
export const lines=[];
const id=(sub,p)=>'p992-fit-exhaust-'+sub+'.'+p;
export const mounts=[
  ...['left','right'].flatMap(hand=>[
    [id('catalysts','converter-'+hand),'engine.exhaust','the converter is welded into the down pipe, which is drawn as one continuous pipe through it'],
    [id('catalysts','bracket-'+hand),'engine.case','the converter retaining bracket is bolted to the underside of the crankcase'],
    [id('shields','sump-'+hand),'engine.case','the heat insulation plate is screwed to the side wall of the oil sump'],
    [id('silencer','tailpipe-'+hand),'engine.exhaust','the tailpipe trim is clamped over the silencer outlet pipe'],
    [id('silencer','tailpipe-'+hand),'shell.bumpers','each tailpipe trim sits in its opening in the rear apron; the apron is drawn without the cut-out']
  ]),
  [id('catalysts','lambda-upstream'),'engine.exhaust','the probe is screwed into a threaded boss in the down pipe'],
  [id('catalysts','lambda-downstream'),'engine.exhaust','the probe is screwed into a boss in the converter outlet, its tip in the gas stream'],
  [id('catalysts','connector-bracket'),'engine.case','the connector bracket is bolted to the rear of the crankcase'],
  [id('silencer','console'),'engine.case','the silencer console is bolted under the rear of the crankcase'],
  [id('silencer','bracket'),'engine.exhaust','the silencer can is bolted and strapped to this bracket'],
  [id('silencer','clamping-sleeve'),'engine.exhaust','the sleeve is clamped around the joint of the converter outlet pipe and the silencer inlet'],
  [id('silencer','flap-actuator'),'engine.exhaust','the flap actuator is bolted to its bracket on the silencer can, over the flap shafts']
];
