// Enlarged component studies use metres at the same scale as the installed parts.
// The engine model uses the published 92.9 mm bore and 86 mm stroke. The
// schematic crank pin sequence shows cross-plane geometry without a firing-order overlay.
import {drawFinalCover,drawSLStartStopPump} from './sl550-driveline.js';
import {barrel,pipe,tint} from './road-primitives.js';
import {m278TimingStudy} from './sl550-power-timing.js';
import {turn,sleeve,cyl,gear,part,study,TAU,x,y,z} from './mechanism-shapes.js';

const metal='#a5adae',steel='#6c797e',dark='#3a4246',brass='#ae976c';
const pins=[0,Math.PI/2,-Math.PI/2,Math.PI];
const mainStation=i=>(i-2)*.107;
function pin(i,phase){
  const t=TAU*phase+pins[i];
  return [mainStation(i)+.0535,.043*Math.cos(t),.043*Math.sin(t)];
}
export function m278PistonPosition(i,s,phase){
  const [,py,pz]=pin(i,phase),d=[0,s*Math.SQRT1_2,Math.SQRT1_2];
  const along=py*d[1]+pz*d[2],across=py*d[2]-pz*d[1];
  const distance=along+Math.sqrt(.141**2-across**2);
  return [mainStation(i)+.0535+s*.01,d[1]*distance,d[2]*distance];
}
function crankStudy(ref){
  return study('sl-crank','Crankcase and rotating assembly','Follow one revolution of the cross-plane crank. Its four throws each serve a pair of rods. The eight pistons travel along two cylinder banks 90 degrees apart.',ref,[
    part('case','Cutaway cylinder banks','The bank sections reveal the cylinder walls and hold the bore axes in the same position throughout the cycle.',[0,0,.14],r=>{
      for(let i=0;i<4;i++)for(const s of [-1,1]){
        const d=[0,s*Math.SQRT1_2,Math.SQRT1_2];
        const center=[mainStation(i)+.0535+s*.01,0,0];
        turn(r,center,d,[[.094,.04645],[.094,.053],[.222,.053],[.222,.04645],[.094,.04645]],steel,{n:15,start:Math.PI*.46,sweep:Math.PI*1.08});
      }
    }),
    part('crank','Five main journals and four crank throws','The main journals stay on the crankshaft centerline. The offset journals carry the big ends of the connecting rods.',[.21,0,-.08],(r,phase)=>{
      for(let i=0;i<5;i++)barrel(r,[mainStation(i)-.013,0,0],[mainStation(i)+.013,0,0],.032,metal,14);
      for(let i=0;i<4;i++){
        const [px,py,pz]=pin(i,phase);
        barrel(r,[px-.025,py,pz],[px+.025,py,pz],.023,metal,13);
        for(const s of [-1,1]){
          const xx=px+s*.033;
          r.rod([xx,py,pz],[xx,-py*.69,-pz*.69],.031,steel,12);
          barrel(r,[xx-.008,-py*.63,-pz*.63],[xx+.008,-py*.63,-pz*.63],.039,steel,13);
        }
      }
    }),
    part('rods','Eight connecting rods','Each pair of rods shares a crankpin. A wrist pin at the small end joins each rod to its piston.',[0,-.20,-.025],(r,phase)=>{
      for(let i=0;i<4;i++)for(const s of [-1,1]){
        const a=pin(i,phase);a[0]+=s*.01;const b=m278PistonPosition(i,s,phase);
        r.rod(a,b,.009,'#acb2ac',8);sleeve(r,a,x,-.008,.008,.031,.023,'#9ca49e',14);
        sleeve(r,b,x,-.009,.009,.014,.009,metal,12);
      }
    }),
    part('pistons','Eight pistons and ring packs','The ring pack seals each piston against its bore. The stroke along each cylinder axis is 86 mm.',[0,.20,.16],(r,phase)=>{
      for(let i=0;i<4;i++)for(const s of [-1,1]){
        const c=m278PistonPosition(i,s,phase),axis=[0,s*Math.SQRT1_2,Math.SQRT1_2];
        turn(r,c,axis,[[-.016,.0435],[.013,.0460],[.015,.0452],[.017,.0460],[.020,.0452],[.022,.0460],[.025,.0462],[.025,0]],metal,{n:15});
        cyl(r,c,x,-.036,.036,.009,steel,10);
      }
    })
  ],'The two banks run through one crankshaft revolution. Watch a piston dwell briefly as its rod crosses top dead center.');
}
function turboStudy(ref){
  const axis=x;
  function impeller(r,c,rad,phase,color,reverse){
    turn(r,c,axis,[[-.020,.009],[-.008,.023],[.014,.016],[.035,.006]],color,{n:20});
    for(let j=0;j<10;j++){
      const a=TAU*(j/10+phase),k=reverse?-1:1;
      const p=(xx,rr,t)=>[c[0]+xx,rr*Math.cos(a+k*t),rr*Math.sin(a+k*t)];
      r.polygon([p(-.013,.015,0),p(-.014,rad,.15),p(.004,rad*.90,.34),p(.025,.019,.41)],tint(color,.82+.16*Math.sin(a)),false);
    }
  }
  return study('sl-turbo','Turbocharger cutaway','The exhaust turbine and air compressor share one shaft. The split housings expose both wheels and the wastegate bypass.',ref,[
    part('compressor','Compressor cover','The axial inlet opens into the compressor wheel. Its outlet feeds the charge duct.',[-.18,0,.06],r=>turn(r,[-.09,0,0],x,[[-.06,.030],[-.06,.039],[-.032,.041],[-.020,.066],[.007,.071],[.02,.061],[.02,.047],[-.013,.053],[-.032,.03]],metal,{n:22,start:.2,sweep:4.55})),
    part('turbine','Turbine housing','The exhaust manifold feeds the turbine through its outer housing. Spent gas leaves through the downpipe.',[.18,.03,0],r=>turn(r,[.072,0,0],x,[[-.024,.044],[-.024,.060],[-.011,.072],[.018,.073],[.032,.056],[.056,.045],[.056,.033],[.022,.033],[-.01,.046]],'#8d7467',{n:22,start:.2,sweep:4.55})),
    part('center','Bearing cartridge','The stationary center housing supports and lubricates the common shaft.',[0,0,-.12],r=>sleeve(r,[0,0,0],x,-.045,.048,.029,.009,steel,18)),
    part('rotor','Turbine wheel, shaft and compressor wheel','Both impellers rotate at the same speed. The motion is slowed for inspection.',[0,.16,.055],(r,t)=>{
      barrel(r,[-.105,0,0],[.10,0,0],.008,metal,12);
      impeller(r,[-.085,0,0],.051,t,metal,false);impeller(r,[.073,0,0],.046,t,'#99897c',true);
    }),
    part('gate','Wastegate and vacuum actuator','The diaphragm moves a rod and a lever at the bypass flap. Opening the bypass diverts exhaust around the turbine.',[.055,-.16,.04],r=>{
      cyl(r,[0,-.09,0],x,-.035,.023,.030,brass,14);
      pipe(r,[[.024,-.09,0],[.072,-.089,0],[.087,-.061,-.014]],.004,metal,6);
      barrel(r,[.087,-.066,-.014],[.087,-.055,-.014],.011,'#a08971',10);
    })
  ],'Rotate the common shaft to see the turbine and compressor turn together.');
}
function converterWheel(r,xx,side,color,sectioned=false){
  const center=[xx,0,0],radius=.093;
  const bowl=[[-.010,.052],[.003,.058],[.018,.075],[.023,radius],[.017,.111],[-.002,.130],[-.012,.141]];
  const options=sectioned?{n:21,start:.22,sweep:3.60}:{n:30};
  turn(r,center,x,bowl.map(([u,v])=>[u*side,v]),color,options);
  const count=30;
  for(let i=0;i<count;i++){
    const a=.22+TAU*i/count;
    if(sectioned&&a>3.76)continue;
    const pt=(u,rad,lead)=>[xx+u*side,rad*Math.cos(a+lead*side),rad*Math.sin(a+lead*side)];
    r.polygon([pt(-.009,.053,0),pt(.016,.079,.04),pt(.021,.098,.071),pt(.006,.123,.11),pt(-.013,.137,.125),pt(-.013,.097,.046)],tint(color,.86+.16*Math.sin(a)),false);
  }
  if(sectioned)sleeve(r,center,x,-.010,.035,.031,.018,steel,15);
}
function autoStudy(ref){
  return study('sl-seven','7G-TRONIC PLUS components','The converter bolts to the engine drive plate. The pump and planetary transmission sit behind it. The hydraulic controls and filter are below the gear train.',ref,[
    part('case','Bellhousing and main case','The broad bellhousing encloses the torque converter. The case narrows around the gear train.',[0,0,.25],r=>turn(r,[0,0,0],x,[[-.19,.163],[-.19,.177],[-.145,.18],[-.05,.146],[.03,.115],[.31,.108],[.432,.08],[.48,.055],[.48,.04],[.315,.097],[.015,.102],[-.07,.134],[-.19,.163]],steel,{n:18,start:.4,sweep:4.7})),
    part('converter','Sectioned converter housing and lockup clutch','The engine drives the outer cover. The lockup clutch inside it can transmit torque directly to the turbine hub.',[-.23,0,.035],r=>{
      const c=[-.118,0,0],section={n:22,start:.22,sweep:3.60};
      turn(r,c,x,[[-.061,.031],[-.060,.107],[-.044,.145],[-.010,.157],[.024,.153],[.048,.130],[.060,.051],[.065,.035],[.055,.034],[.044,.118],[.019,.145],[-.010,.149],[-.039,.137],[-.053,.103],[-.055,.031]],'#ae9c7e',section);
      turn(r,c,x,[[-.045,.054],[-.045,.121],[-.041,.123],[-.041,.055]],'#c2aa7f',section);
    }),
    part('impeller','Converter impeller','The engine-driven impeller moves transmission fluid outward toward the turbine.',[-.045,.12,.04],r=>converterWheel(r,-.094,1,'#b5a184')),
    part('turbine','Turbine and splined hub','Oil returning inward across the turbine drives the input shaft. The section through the wheel exposes the impeller behind it.',[-.11,-.13,.035],r=>converterWheel(r,-.141,-1,'#a7b1b4',true)),
    part('stator','Stator and one-way clutch','The stator redirects return flow from the turbine toward the impeller during torque multiplication.',[0,-.11,-.065],r=>{
      const c=[-.115,0,0];
      sleeve(r,c,x,-.011,.011,.040,.025,steel,16);
      for(let i=0;i<12;i++){
        const a=TAU*i/12,pt=(xx,rad,b)=>[c[0]+xx,rad*Math.cos(a+b),rad*Math.sin(a+b)];
        r.polygon([pt(-.009,.038,0),pt(-.007,.059,.10),pt(.008,.058,.29),pt(.009,.039,.17)],metal,false);
      }
    }),
    part('input','Input shaft and pump','The input shaft couples the turbine to the gear train. The oil pump supplies pressure for lubrication and clutch operation.',[-.09,-.15,0],r=>{
      barrel(r,[-.09,0,0],[.32,0,0],.018,metal,12);sleeve(r,[-.01,0,0],x,-.018,.014,.101,.022,alloyColor,16);
    }),
    part('gears','Planetary gearing and clutch drums','Coaxial drums and planetary gears provide the ratios. One representative gear set is exposed here. Gear teeth and clutch packs are simplified.',[.16,.15,.04],r=>{
      for(const xx of [.045,.107,.213,.292])sleeve(r,[xx,0,0],x,-.016,.015,.086,.057,steel,18);
      gear(r,[.16,0,0],x,-.014,.015,.032,.031,14,brass);
      for(let j=0;j<3;j++){const t=j*TAU/3;gear(r,[.16,.051*Math.cos(t),.051*Math.sin(t)],x,-.012,.014,.022,.022,10,metal);}
    }),
    part('controls','Electrohydraulic valve unit','Solenoids on the valve body control oil flow into the clutch and brake elements.',[0,-.18,-.11],r=>{
      r.box(.016,-.092,-.115,.341,.092,-.086,castingColor);
      for(let i=0;i<7;i++)barrel(r,[.037+i*.042,-.072,-.095],[.037+i*.042,-.027,-.095],.014,'#353e41',10);
    }),
    part('aux-pump','Electric auxiliary oil pump','During an automatic engine stop, the electric pump maintains oil supply for the transmission.',[-.03,-.12,-.10],r=>drawSLStartStopPump(r,[-.074,-.077,-.141])),
    part('pan','Filter and oil pan','The filter draws from the sump below the valve body.',[0,.04,-.23],r=>{
      r.box(.022,-.071,-.131,.258,.064,-.117,'#414747');
      r.profile([[.004,-.125],[.014,-.159],[.29,-.169],[.36,-.14],[.36,-.125]],-.108,.108,dark);
    })
  ]);
}
const alloyColor='#a8b0b0',castingColor='#858b8a';
function diffStudy(ref){
  return study('sl-final','Rear final drive','The pinion drives the crown wheel and carrier. Bevel gears inside the carrier distribute torque between the rear axles. Tooth count and casting sections are schematic.',ref,[
    part('case','Final-drive housing','The housing supports the pinion and carrier bearings and mounts to the rear suspension crossmember.',[0,0,.19],r=>turn(r,[0,0,0],y,[[-.14,.055],[-.118,.084],[-.085,.115],[.080,.122],[.109,.093],[.129,.052],[.129,.04],[.075,.108],[-.081,.103],[-.14,.044]],steel,{n:18,start:.22,sweep:4.5})),
    part('cover','Bolted rear cover','The rear cover closes the carrier housing. Separate it to see the crown wheel inside.',[.18,0,.02],r=>drawFinalCover(r,.113,0,0)),
    part('pinion','Input pinion and drive flange','The propeller shaft enters from the front. The pinion bears on the crown wheel.',[-.2,0,0],r=>{
      barrel(r,[-.236,-.068,-.017],[-.093,-.068,-.017],.022,metal,14);
      cyl(r,[-.23,-.068,-.017],x,-.016,.006,.050,dark,14);
      gear(r,[-.092,-.068,-.017],x,-.016,.022,.033,.025,12,metal);
    }),
    part('crown','Crown wheel and differential carrier','The crown wheel is bolted to the carrier and turns about the axle axis.',[.04,-.18,.04],r=>{
      gear(r,[0,-.065,0],y,-.009,.012,.104,.098,32,metal,0,.65);
      turn(r,[0,0,0],y,[[-.067,.047],[-.060,.072],[-.035,.072],[.035,.067],[.068,.040]],castingColor,{n:14,start:.20,sweep:4.4});
    }),
    part('spiders','Bevel gears and cross-pin','The side gears connect to the axle splines. The smaller bevel gears revolve with the carrier and turn on the cross-pin as wheel speeds differ.',[.075,.12,.07],r=>{
      barrel(r,[0,0,-.058],[0,0,.058],.007,metal,9);
      for(const s of [-1,1]){
        gear(r,[0,.046*s,0],[0,s,0],-.014,.014,.034,.049,14,brass);
        gear(r,[0,0,.038*s],[0,0,s],-.012,.009,.021,.034,11,metal);
      }
    }),
    part('outputs','Output flanges and bearings','One flange and bearing seat face each rear driveshaft.',[0,.185,-.04],r=>{
      for(const s of [-1,1]){sleeve(r,[0,s*.094,0],y,-.011,.011,.042,.027,metal,14);barrel(r,[0,s*.091,0],[0,s*.158,0],.023,steel,12);cyl(r,[0,s*.156,0],y,-.009,.009,.049,steel,14);}
    })
  ]);
}
function abcStudy(ref){
  return study('sl-abc-strut','ABC spring strut','Hydraulic pressure moves the upper spring seat. The steel spring and damper still respond to road inputs. The cut section shows the relationship between the hydraulic plunger and the spring.',ref,[
    part('boot','Rubber gaiter and retaining rings','A section of the protective sleeve is cut away here so the spring stays visible. Two retaining rings hold the gaiter in place.',[-.13,-.14,.03],r=>{
      const wall=[];
      for(let i=0;i<=36;i++){
        const u=i/36,folded=u<.27||u>.72;
        wall.push([-.165+.344*u,folded?(i%2?.06:.064):.061]);
      }
      turn(r,[0,0,0],z,wall,dark,{n:12,start:.35,sweep:3.1});
      for(const h of [-.165,.179])turn(r,[0,0,0],z,[[h-.003,.061],[h+.003,.061]],metal,{n:12,start:.35,sweep:3.1});
    }),
    part('mount','Upper mounting plate','This plate carries load into the body.',[0,0,.17],r=>{cyl(r,[0,0,.235],z,-.016,.018,.064,dark,16);for(let i=0;i<3;i++){const t=i*TAU/3;cyl(r,[.047*Math.cos(t),.047*Math.sin(t),.25],z,0,.013,.006,metal,6);}}),
    part('cylinder','Hydraulic cylinder and port','Fluid entering this chamber changes the position of the plunger.',[0,-.14,.06],r=>{
      turn(r,[0,0,0],z,[[.065,.029],[.065,.041],[.218,.041],[.224,.033],[.224,.023],[.065,.029]],steel,{n:18,start:.20,sweep:4.7});barrel(r,[0,-.038,.193],[0,-.061,.193],.008,brass,9);
    }),
    part('plunger','Plunger and upper spring perch','Pressure on the piston moves the perch against the spring.',[.13,.08,.09],(r,t)=>{
      const dz=.025*Math.cos(TAU*t);cyl(r,[0,0,dz],z,.038,.156,.023,metal,14);sleeve(r,[0,0,dz],z,.033,.049,.056,.016,steel,16);
    }),
    part('spring','Steel coil spring','The upper coils follow the moving perch. The lower end remains on the damper spring seat.',[-.14,.03,0],(r,t)=>{
      const dz=.025*Math.cos(TAU*t),pts=[];for(let i=0;i<=64;i++){const u=i/64,a=u*TAU*5.25;pts.push([.044*Math.cos(a),.044*Math.sin(a),-.178+u*(.211+dz)]);}pipe(r,pts,.007,dark,7);
    }),
    part('damper','Rear damper and lower seat','This section follows the rear strut. Its lower eye transfers force into the suspension.',[0,0,-.19],r=>{
      cyl(r,[0,0,0],z,-.19,-.072,.025,steel,16);cyl(r,[0,0,0],z,-.085,.051,.011,metal,12);
      cyl(r,[0,0,0],z,-.19,-.176,.057,steel,16);sleeve(r,[0,0,-.221],y,-.018,.018,.032,.015,steel,12);
    })
  ],'Move the hydraulic perch through an illustrative stroke. The lower spring seat stays fixed.');
}
export function makePowerStudies(refs){
  return {
    'sl-m278.timing':m278TimingStudy(refs.timing),
    'sl-m278.block':crankStudy(refs.block),
    'sl-air.turbos':turboStudy(refs.turbo),
    'sl-drive.auto':autoStudy(refs.transmission),
    'sl-drive.final':diffStudy(refs.diff),
    'sl-abc.struts':abcStudy(refs.abcStruts)
  };
}
