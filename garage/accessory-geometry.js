import {drawFieldAccessory} from './field-accessory-geometry.js';
import {FIELD_ACCESSORIES} from './accessory-catalog.js';
// Original visualization meshes, in metres. Source drawings and vehicle-specific
// ordering information are attached to the corresponding accessory catalog rows.
import {coupeShape,porscheBumperPoint,porscheDeckPoint,porscheSidePoint} from './porsche-coachwork.js';
import {spoilerPoint} from './porsche-spoilers.js';
import {drawHrvCrossbars} from './accessory-racks.js';
import {tint} from './road-primitives.js';

const graphite='#42474b', black='#282d31';

// Loft short closed sections rather than triangulating a concave U-shaped lip
// as a single polygon. The front edge, underside and end caps work in all views.
function loft(r,rings,colors) {
  for(let i=1;i<rings.length;i++) {
    const a=rings[i-1], b=rings[i];
    for(let j=0;j<a.length;j++) {
      const k=(j+1)%a.length;
      r.polygon([a[j],b[j],b[k],a[k]],colors[j%colors.length],false);
    }
  }
  r.polygon(rings[0],colors.at(-1),false);
  r.polygon(rings.at(-1),colors.at(-1),false);
}

// Each row is an inner attachment and an exposed outer edge, read from the
// respective bumper's own plan view. x increases toward the vehicle's rear.
function frontLip(r,side,path,colors){
  const rings=path.map(([ix,iy,iz,ox,oy,oz,thickness])=>[
    [ix,side*iy,iz],[ox,side*oy,oz],[ox+.002,side*oy,oz-thickness],[ix,side*iy,iz-.009]
  ]);
  loft(r,rings,colors);
}
const e46=[
  [-2.173,0,.323,-2.310,0,.315,.024],[-2.177,.26,.323,-2.302,.26,.314,.024],
  [-2.175,.48,.323,-2.317,.49,.305,.034],[-2.162,.65,.324,-2.303,.70,.297,.039],
  [-2.115,.735,.323,-2.258,.774,.301,.045],[-2.047,.774,.324,-2.191,.816,.308,.037],
  [-1.936,.80,.322,-2.081,.843,.315,.030],[-1.855,.811,.322,-1.895,.844,.321,.026]
];
// Follows the underside of the C63 front apron (bottom edge at z 0.27).
const w204=[
  [-2.107,0,0.272,-2.258,0,0.266,0.030],[-2.101,0.25,0.272,-2.252,0.25,0.266,0.028],
  [-2.066,0.42,0.272,-2.226,0.454,0.266,0.032],[-2.000,0.59,0.272,-2.165,0.608,0.266,0.037],
  [-1.880,0.723,0.272,-2.040,0.767,0.266,0.042],[-1.835,0.775,0.272,-1.985,0.841,0.266,0.040],
  [-1.810,0.809,0.272,-1.930,0.871,0.266,0.030],[-1.860,0.83,0.272,-1.880,0.868,0.266,0.021]
];
const front992=[
  [-2.123,0,.208,-2.226,0,.171,.031],[-2.118,.223,.211,-2.22,.227,.170,.032],
  [-2.097,.375,.211,-2.207,.388,.164,.036],[-2.088,.460,.221,-2.209,.473,.159,.042],
  [-2.066,.586,.226,-2.19,.604,.163,.041],[-2.033,.712,.239,-2.139,.735,.176,.051],
  [-1.988,.762,.231,-2.061,.797,.182,.048],[-1.878,.807,.223,-1.913,.853,.182,.033],
  [-1.804,.820,.215,-1.816,.861,.195,.017]
];
// FVD's two-piece mouldings hug the bumper from the lower centre grille
// to the wheel arch. Reuse the actual fascia and flank, including the nose tuck.
function rsCorner(r,side,paint){
  const car=coupeShape[0], rings=[];
  for(const [y,topZ,bottomZ,projection] of [[.274,.237,.198,.004],[.317,.231,.161,.015],[.41,.223,.152,.020],[.51,.217,.147,.022],[.60,.218,.146,.023],[.674,.231,.144,.020]]){
    const point=(z,d)=>porscheBumperPoint(car,true,side*y,z,d);
    rings.push([point(topZ,-.005),point(bottomZ+.025,-projection),point(bottomZ,-projection),point(bottomZ+.003,.009)]);
  }
  for(const [x,t,drop,out] of [[-2.13,.25,.025,.018],[-2.065,.24,.027,.026],[-1.995,.23,.028,.030],
    [-1.90,.21,.029,.031],[-1.77,.19,.030,.031],[-1.63,.16,.030,.028],[-1.532,.13,.032,.025]]){
    const upper=porscheSidePoint(car,x,t,side), lower=porscheSidePoint(car,x,0,side);
    upper[1]+=side*.002;
    rings.push([upper,[lower[0],lower[1]+side*out,lower[2]+.010],
      [lower[0],lower[1]+side*out,lower[2]-drop],[lower[0],lower[1]-side*.008,lower[2]-drop+.004]]);
  }
  loft(r,rings,[tint(paint,.99),tint(paint,.79),tint(paint,.56),tint(paint,.74)]);
}

// TECHART figures 3–7 show a front spoiler with a slim centre grille and
// a separate painted panel following the upper edge of each outer radiator inlet.
function techartFront(r,paint){
  const car=coupeShape[1];
  for(const side of [-1,1]){
    frontLip(r,side,front992,[tint(paint,.96),graphite,'#272d32',tint(paint,.67)]);
    const lip=(y,z,depth)=>porscheBumperPoint(car,true,side*y,z,depth);
    const sections=[[.382,.439,.006],[.428,.452,.013],[.57,.461,.016],[.689,.470,.015],[.742,.467,.012],[.754,.446,.008]];
    const rings=sections.map(([y,z,height])=>[lip(y,z,.002),lip(y,z+.003,-.017),lip(y,z-height,-.019),lip(y,z-height,.001)]);
    loft(r,rings,[tint(paint,1.17),tint(paint,.98),tint(paint,.76),graphite]);
    for(let n=0;n<=8;n++){
      const y=.024+n*.041,front=porscheBumperPoint(car,true,side*y,.185,-.035);
      r.box(front[0],front[1]-.004,.169,front[0]+.021,front[1]+.004,.190,black);
    }
  }
}
function adaptiveLip(r,paint,phase){
  const rings=[];
  for(let n=0;n<=26;n++){
    const t=n/13-1,y=t*.614, taper=Math.abs(t)**4;
    // The crescent follows the trailing portion of the actual deck. TECHART
    // fig. 24 shows a taller upturn in the middle that feathers to each tip.
    const rear=2.194-.087*taper, depth=.097-.065*taper;
    const crest=.041*(1-taper)+.009;
    const section=[[rear-depth,.0015],[rear-depth*.55,.014*(1-taper)+.004],
      [rear-.003,crest],[rear+.016,crest-.013],[rear-.004,.002]];
    rings.push(section.map(([x,h])=>{
      const p=porscheDeckPoint(coupeShape[1],x,y);
      return spoilerPoint(true,[p[0],p[1],p[2]+h],phase);
    }));
  }
  r.tag('shell.spoiler',()=>loft(r,rings,[tint(paint,1.13),tint(paint,1.20),tint(paint,.97),tint(paint,.71),tint(paint,.66)]));
}
function techartSide(r,side,paint){
  const rings=[[-.825,.838,.222,.168],[-.740,.841,.238,.149],[-.44,.820,.218,.141],
    [-.05,.818,.215,.137],[.38,.842,.221,.139],[.676,.862,.238,.144],[.838,.868,.260,.154]]
    .map(([x,y,z,low],i)=>[
      [x,side*(y-.007),z],[x,side*(y+.033),z-.018],
      [x,side*(y+.046),low+.021+(i===6?.015:0)],[x,side*(y+.061),low+.012],
      [x,side*(y+.057),low],[x,side*(y-.014),low+.003]
    ]);
  loft(r,rings,[tint(paint,1.03),tint(paint,.84),graphite,'#555a5c','#292d30',black]);
}
function techartRear(r,paint) {
  const rings=[];
  for(let n=0;n<=20;n++){
    const t=n/10-1,y=.768*t,u=Math.abs(t),rear=2.206-.136*u*u;
    const h=.195+.054*u*u;
    rings.push([[rear-.16,y,h-.012],[rear-.040,y,h+.055],[rear+.037,y,h+.041],
      [rear+.043,y,h+.016],[rear-.012,y,h-.024],[rear-.165,y,h-.029]]);
  }
  loft(r,rings,[black,tint(paint,.90),tint(paint,.68),graphite,'#363b3f',black]);
  // Standard-apron diffuser. The central fin and two symmetric pairs stop
  // inboard of the exhaust outlets. The mounting brackets sit on its underside.
  for(const y of [-.436,-.23,0,.23,.436]){
    const x=2.224-.132*y*y;
    r.profile([[x-.229,.165],[x-.051,.133],[x+.022,.154],[x+.022,.202],[x-.229,.181]],y-.008,y+.008,graphite);
  }
  for(const side of [-1,1]){
    const y=side*.35;
    r.box(2.042,y-.017,.173,2.08,y+.017,.222,'#5d6262');
  }
}
// Puig 21569J, closed configuration (assembly option 2). The nearly vertical
// front pad faces the rider. Separate cap and side shells frame the side ducts.
function soloCowl(r){
  const shell='#35393e', edge='#4a4f52', inserts='#24292d';
  const stations=[
    [.508,.098,.946,.942,.972,.943], [.548,.129,.957,.962,1.014,.946],
    [.619,.134,.975,1.006,1.087,.963], [.702,.123,.990,1.021,1.114,.982],
    [.775,.102,1.003,1.038,1.120,.997], [.840,.080,1.015,1.051,1.107,1.005],
    [.905,.055,1.025,1.051,1.077,1.022], [.947,.035,1.033,1.040,1.046,1.031]
  ];
  r.tag('body.seat',()=>{
    const start=r.faces.length;
    for(const side of [-1,1]){
      const path=stations.map(([x,w,z,shoulder,ridge,base])=>[
        [x,side*w,z],[x,side*(w+.002),shoulder],[x,side*w*.49,ridge-.006],
        [x,side*w*.37,ridge-.009],[x,side*w*.45,shoulder-.011],[x,side*(w-.018),base]
      ]);
      loft(r,path,[shell,edge,shell,inserts,inserts,inserts]);
      // Sunken triangular side openings and their bottom ledges in the skirts.
      const mouth=[[.589,.133,.979],[.725,.119,1.014],[.819,.090,1.035],[.692,.123,.997]];
      const coords=mouth.map(([x,y,z])=>[x,side*(y+.002),z]);
      r.polygon(coords,inserts,false);
      r.rod(coords[0],coords[3],.0028,'#595f60',6);
    }
    const cap=stations.slice(1,-1).map(([x,w,,shoulder,ridge])=>[
      [x,-w*.53,ridge-.003],[x,-w*.27,ridge+.005],[x,0,ridge+.008],
      [x,w*.27,ridge+.005],[x,w*.53,ridge-.003],[x,0,shoulder+.001]
    ]);
    loft(r,cap,[edge,'#4f5255','#474b50','#41464a',inserts,inserts]);
    const pad=[];
    for(let i=0;i<=10;i++){
      const u=i/5-1,y=u*.102,arch=1-u*u;
      pad.push([[.521+.024*arch,y,.953],[.541+.009*arch,y,.974+.057*arch],
        [.550+.009*arch,y,.978+.057*arch],[.551+.019*arch,y,.954]]);
    }
    loft(r,pad,['#414447','#55585a',shell,inserts]);
    // The fixing plate and two clip studs occupy the former pillion-seat mount.
    for(const side of [-1,1]){
      const y=side*.066;
      r.box(.566,y-.006,.949,.69,y+.006,.956,'#636b6d');
      r.rod([.588,y,.945],[.588,y,.966],.006,'#91999a',8);
    }
    // Register the accessory's two clip studs and front pad to the K67 tail.
    // Transform only the newly generated accessory, including its brackets.
    for(const face of r.faces.slice(start)){
      face.points=face.points.map(([x,y,z])=>[.532+(x-.508)*.70,y*.90,.914+(z-.946)*1.02]);
    }
  });
}
function drawMat(r) {
  const dark='#32383a', rib='#454b4d', well=.618;
  // Fit the sourced mat to this illustration's box; the wheel housings and
  // painted bed walls stay exposed. Draw each rib only where rubber exists.
  const spans=[[.396,1.241,.826],[1.241,2.159,well],[2.159,2.590,.826]];
  r.tag('body.structure',()=>{
    for(const [a,b,w] of spans){
      r.box(a,-w,.877,b,w,.8865,dark);
      for(let i=-14;i<=14;i++){
        const y=i*.056;
        if(Math.abs(y)<w-.02)r.box(a+.003,y-.002,.8865,b-.003,y+.002,.8885,rib);
      }
    }
  });
}
export function hasActiveLip(build){
  return build.vehicle==='porsche992scab'&&build.parts?.some(id=>id==='992-aero-kit'||id==='992-spoiler-lip')===true;
}
export function drawActiveLip(r,build,paint,phase){
  if(hasActiveLip(build))adaptiveLip(r,paint,phase);
}
export function drawAccessories(r,build,paint,phase=0) {
  const ids=build.parts||[];
  for(const option of FIELD_ACCESSORIES){
    if(option.vehicles.includes(build.vehicle)&&ids.includes(option.id))drawFieldAccessory(r,build.vehicle,option.fieldKind,paint);
  }
  switch(build.vehicle) {
    case 'g500': break; // Mounted inside the G500's removable roof group.
    case 'bmws1000rr': if(ids.includes('s1k-puig-cowl'))soloCowl(r);break;
    case 'hrv':case 'hrvlx': if(ids.includes('h-roof-bars')||ids.includes('hl-roof-bars'))drawHrvCrossbars(r);break;
    case 'f350': if(ids.includes('f-deezee-bedmat'))drawMat(r);break;
    case 'bmw325ci':
    case 'c63':{
      const bmw=build.vehicle==='bmw325ci';
      if(ids.includes(bmw?'b46-splitter':'c63-splitter'))r.tag('body.structure',()=>{
        for(const s of [-1,1])frontLip(r,s,bmw?e46:w204,['#4c5154','#373b3e','#24292c','#303639']);
      });
      break;
    }
    case 'porsche993cab':
      if(ids.includes('993-rs-lips'))r.tag('shell.bumpers',()=>{
        for(const s of [-1,1])rsCorner(r,s,paint);
      });
      break;
    case 'porsche992scab':{
      const full=ids.includes('992-aero-kit');
      if(full){
        r.tag('shell.bumpers',()=>{
          techartFront(r,paint);
          techartRear(r,paint);
        });
        r.tag('shell.fenders',()=>{for(const s of [-1,1])techartSide(r,s,paint);});
      }
      drawActiveLip(r,build,paint,phase);
      break;
    }
  }
}
