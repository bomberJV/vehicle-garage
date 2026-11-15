import {part,study,cyl,sleeve,turn,x,y,z,TAU} from './mechanism-shapes.js';
import {barrel,pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';

const ref=(label,url)=>({label,url});
const hvac='https://porsche.oempartsonline.com/v-2023-porsche-911--carrera-s--3-0l-h6-gas/hvac--';
export const sources={
 induction:ref('Porsche Cars North America · 992 Carrera S powertrain, pp. 5–6','https://pnr-prd2-pub2.newsroom.porsche.com/dam/jcr%3Abedf25bc-e483-49b9-9774-8a2a2c87e980/911-Carrera-S-and-911-Carrera-4S_Technology-Workshop-press-kit.pdf.PDF#page=5'),
 filter:ref('992.1 Carrera · filter element 992 129 620','https://www.design911.com/p/air-filter-porsche-9921/'),
 coolant:ref('992.1 Carrera · front feed and return pipes','https://www.design911.co.uk/diagrams/d/50621/992121456A'),
 pump:ref('992.1 Carrera · engine coolant distributor and circulation pump','https://www.oematch.com/diagrams/d/50617/0'),
 clutch:ref('992.1 Carrera · clutch master, slave and lines, G1M seven-speed RWD','https://www.design911.co.uk/diagrams/d/50747/0/'),
 release:ref('992.1 Carrera · clutch and release bearing, plate 301-200','https://www.design911.co.uk/diagrams/d/50653/9P1141181'),
 climate:ref('2023 Carrera S · condenser pair, connector tube and receiver-drier',hvac+'a-c-accumulator-receiver-drier'),
 acLines:ref('992.1 Carrera · left-hand-drive refrigerant circuit, plate 814-700','https://www.design911.co.uk/diagrams/d/50961/0/'),
 airBox:ref('992.1 Carrera · left-hand-drive air conditioner, plate 814-000','https://www.pitp.club/diagrams/d/50950/0'),
 seat:ref('Porsche technical information 101/24 · option 4A3 cushion and backrest heating elements','https://static.nhtsa.gov/odi/tsbs/2024/MC-11009907-0001.pdf'),
 lamps:ref('992.1 Carrera · left and right PR 8F5 side markers, plate 905-040','https://parts.911uk.com/diagrams/d/51034/0')
};
const O=[0,0,0],alloy='#a6b2b1',iron='#667578',rubber='#3c4649',orange='#bb785a';
const motion=phase=>(1-Math.cos(TAU*phase))/2;

function turboBlades(r,station,radius,phase,side,hot){
 const angle=TAU*phase*side;
 const at=(rad,theta,offset)=>[station+offset,rad*Math.cos(theta+angle),rad*Math.sin(theta+angle)];
 const n=hot?11:9;
 const shade=hot?['#a18772','#b19a84','#c6b09b']:['#899c9e','#a5b7b9','#c2d0ce'];
 const stations=hot?[[.23,-.020,.001],[.46,-.013,.008],[.72,.002,.020],[.96,.018,.034]]:
   [[.17,.058,.074],[.37,.029,.061],[.67,.001,.032],[.98,-.014,-.004]];
 turn(r,[station,0,0],x,hot?[[-.035,0],[-.032,.035],[.016,.035],[.034,0]]:
  [[-.025,0],[-.020,.106],[0,.071],[.025,.044],[.053,.029],[.072,.017],[.082,0]],shade[0],{n:26});
 for(let j=0;j<n;j++){
  const a=TAU*j/n,lean=side*(hot?.43:-.73);
  const section=([k,low,high])=>{
   const theta=a+k*k*lean;
   return [at(radius*k,theta,low),at(radius*k,theta-side*(.20-.09*k),high)];
  };
  for(let i=1;i<stations.length;i++){
   const [lo,hi]=section(stations[i-1]),[lo2,hi2]=section(stations[i]);
   r.polygon([lo,lo2,hi2,hi],shade[i-1],false);
  }
 }
}
function turboStudy(side){
 const hand=side<0?'Left':'Right';
 const rec=study('p992-turbo-'+hand.toLowerCase(),hand+' turbocharger',
  'Exhaust gas spins the turbine. Its shaft turns the compressor on the other end. The left and right units rotate in opposite directions. Rotation is slowed and the cartridge is enlarged.',sources.induction,[
  part('housing','Turbine inlet and bypass seat','A cut through the hot housing exposes the wheel and a second passage closed by the wastegate.',[-.44,0,-.12],r=>{
   turn(r,[-.20,0,0],x,[[-.077,.111],[-.077,.147],[-.045,.167],[.032,.163],[.055,.116],[.055,.101]],'#937f70',{n:28,start:-1.4,sweep:TAU*.67});
   sleeve(r,[-.19,.18,0],y,-.04,.03,.062,.043,iron,16);
  }),
  part('turbine','Turbine wheel','The turbine extracts energy from exhaust flowing toward the tailpipe.',[-.25,0,.28],(r,p)=>turboBlades(r,-.19,.115,p,side,true)),
  part('bearing','Bearing housing and shaft','The turbine and compressor share their axis and speed. The center housing supports the shaft.',[0,-.36,-.08],r=>{
   cyl(r,O,x,-.225,.215,.020,alloy,20);
   turn(r,O,x,[[-.119,.031],[-.111,.070],[.09,.070],[.108,.034]],iron,{n:22,start:-1.4,sweep:TAU*.67});
  }),
  part('compressor','Compressor wheel','Ambient air enters along the shaft and leaves the rotating blades near their outer tips.',[.22,0,.28],(r,p)=>turboBlades(r,.19,.132,p,side,false)),
  part('cover','Compressor cover and inlet','The shaped cover collects the air leaving the compressor wheel. Porsche specifies a 55 mm compressor wheel for the Carrera S.',[.44,.12,0],r=>{
   turn(r,[.19,0,0],x,[[-.049,.126],[-.047,.156],[.02,.168],[.064,.123],[.103,.072],[.145,.072],[.145,.060],[.090,.061],[.058,.092]],alloy,{n:29,start:-1.4,sweep:TAU*.67});
  })
 ],'Both wheels turn together. Opening the other bank shows the opposite rotation.');
 rec.viewAngle=[1.09,.48];return rec;
}
const wastegate=study('p992-wastegate','Electric wastegate linkage',
 'The actuator moves the rod. The bellcrank turns that stroke into rotation of a flap in the turbine bypass. Opening the passage diverts part of the exhaust flow away from the turbine wheel. Stroke and linkage lengths are illustrative.',sources.induction,[
 part('motor','Electric actuator','The engine controller commands the electric actuator to position the wastegate.',[-.35,-.20,0],r=>{
  box(r,[-.245,0,0],[.155,.102,.116],iron);box(r,[-.249,.075,.016],[.087,.066,.045],rubber);cyl(r,[-.175,0,0],x,0,.028,.027,alloy);
 }),
 part('rod','Adjusting rod and eye','The pin at the rod end follows the bellcrank through its arc.',[0,-.34,0],(r,p)=>{
  const a=.27+motion(p)*.75,end=[.12+.107*Math.sin(a),0,.107*Math.cos(a)];barrel(r,[-.163,0,0],end,.012,alloy,12);sleeve(r,end,y,-.020,.020,.023,.009,iron,18);
 }),
 part('lever','Bellcrank and spindle','The outer pin and the inner flap turn around the same spindle.',[.28,0,.28],(r,p)=>{
  const a=.27+motion(p)*.75;barrel(r,[.12,0,0],[.12+.107*Math.sin(a),0,.107*Math.cos(a)],.016,iron,12);cyl(r,[.12,0,0],y,.013,.146,.013,alloy,12);
 }),
 part('flap','Bypass flap','The disc swings away from its seat as the actuator extends.',[.26,.32,0],(r,p)=>{
  const a=motion(p)*.75;const c=[.12+.060*Math.sin(a),.132,-.060*Math.cos(a)];cyl(r,c,[Math.cos(a),0,Math.sin(a)],-.006,.006,.062,'#a78c73',24);
 })
],'Watch the rod move the lever and lift the bypass flap.');

export function pleats(r,c,length,width,depth,folds=12){
 for(let i=0;i<folds*2;i++){
  const a=-length/2+length*i/(2*folds),b=a+length/(2*folds),h=i%2?depth:0;
  r.polygon([[a,-width/2,h],[a,width/2,h],[b,width/2,depth-h],[b,-width/2,depth-h]].map(p=>plus(c,p)),i%2?'#aaa98d':'#d6cdb2',false);
 }
}
const filter=study('p992-air-filter','Engine air filter',
 'The rectangular element sits inside a sealed side airbox. The peripheral seal forces inlet air through the folded media. The airbox neck feeds the compressor inlet.',sources.filter,[
 part('element','Pleated media','Folds provide a large filtration area inside a shallow panel.',[0,0,.26],r=>pleats(r,O,.46,.26,.045,22)),
 part('seal','Moulded perimeter seal','The compliant edge seals against the filter housing.',[0,.32,.06],r=>{for(const s of [-1,1]){box(r,[s*.240,0,0],[.018,.294,.036],orange);box(r,[0,s*.138,0],[.462,.017,.036],orange);}}),
 part('tray','Lower shell and outlet','The shell supports the element and connects its clean side to the inlet duct.',[0,0,-.30],r=>{
  box(r,[0,0,-.10],[.497,.303,.016],rubber);for(const s of [-1,1]){box(r,[s*.245,0,-.054],[.015,.298,.103],iron);box(r,[0,s*.147,-.054],[.483,.015,.103],rubber);}sleeve(r,[.237,0,-.064],x,0,.095,.039,.031,iron);
 })]);

const hydraulic=study('p992-clutch-master','Clutch master cylinder',
 'The pedal pushrod displaces the piston. The seal closes the supply port and fluid moves into the pressure line. The enlarged section illustrates a hydraulic master cylinder stroke.',sources.clutch,[
 part('housing','Cylinder and fluid ports','The supply connection admits fluid from the reservoir. The pressure outlet connects to the clutch line.',[0,.33,-.1],r=>{
  turn(r,O,x,[[-.24,.081],[-.24,.10],[.21,.10],[.23,.076],[.23,.024]],iron,{n:27,start:-1.4,sweep:TAU*.67});sleeve(r,[-.07,0,.09],z,0,.07,.031,.020,rubber);sleeve(r,[.22,0,0],x,0,.062,.032,.020,alloy);
 }),
 part('piston','Piston and cup seal','The seal sweeps the bore as the pedal advances.',[.30,0,0],(r,p)=>{
  const c=[-.08+.105*motion(p),0,0];cyl(r,c,x,-.054,.060,.066,alloy);sleeve(r,c,x,.044,.064,.078,.058,rubber);
 }),
 part('pushrod','Pushrod and pedal eye','The pushrod follows the pedal and loads the piston.',[-.30,-.16,0],(r,p)=>{
  const c=[-.08+.105*motion(p),0,0];cyl(r,c,x,-.22,-.054,.018,alloy);sleeve(r,[c[0]-.230,0,0],y,-.026,.026,.032,.016,iron);
 }),
 part('spring','Return spring','The spring shortens on the pressure stroke and extends when the pedal returns.',[.28,0,.25],(r,p)=>{
  const left=-.013+.105*motion(p),pts=Array.from({length:57},(_,i)=>[left+(.204-left)*i/56,.047*Math.sin(7*TAU*i/56),.047*Math.cos(7*TAU*i/56)]);pipe(r,pts,.004,alloy,6);
 })
],'Follow the pushrod, cup seal and return spring through one pedal stroke.');

const heating=study('p992-seat-element','Front seat heating element',
 'Porsche lists separate cushion and backrest elements for each 4A3 front seat. This section shows how a heating mat fits beneath the cover. The conductor path and layer thickness are illustrative.',sources.seat,[
 part('cover','Upholstery','The occupant touches the trimmed upper surface.',[0,0,.24],r=>box(r,[0,0,.025],[.40,.32,.012],'#907966')),
 part('mat','Mat carrier','A thin backing holds the heating conductor in position.',[0,-.23,.03],r=>box(r,O,[.38,.30,.006],'#9a9988')),
 part('trace','Resistance conductor','Current through the patterned conductor warms the seating surface.',[0,.23,.12],r=>{
  const pts=[];for(let i=0;i<12;i++){const xx=-.165+.03*i,sy=i%2?-1:1;pts.push([xx,-sy*.122,.007],[xx,sy*.122,.007]);}pipe(r,pts,.0028,'#bb875e',6);
 }),
 part('foam','Seat foam','The shaped foam supports the mat and the upholstery above it.',[0,0,-.26],r=>box(r,[0,0,-.043],[.41,.34,.064],'#a69a79'))
]);
const receiver=study('p992-receiver','Receiver-drier section',
 'The receiver stores liquid refrigerant and a desiccant bed takes up moisture. The cutaway separates the pressure shell, drying charge and line connections. Internal proportions are illustrative.',sources.climate,[
 part('shell','Pressure vessel','The metal vessel contains the high-pressure liquid.',[-.22,0,0],r=>turn(r,O,z,[[-.24,0],[-.24,.065],[-.215,.087],[.20,.087],[.23,.060]],alloy,{n:28,start:-1.4,sweep:TAU*.67})),
 part('charge','Desiccant cartridge','A porous enclosure holds the moisture-absorbing material.',[.24,0,.06],r=>{
  cyl(r,O,z,-.13,.045,.058,'#9d927a',21);for(let i=0;i<6;i++)sleeve(r,O,z,-.12+i*.030,-.116+i*.030,.060,.055,'#c5bca8',16);
 }),
 part('head','Head and line fittings','The head closes the vessel and seals its refrigerant connections.',[0,0,.35],r=>{
  cyl(r,O,z,.209,.24,.067,iron);for(const sign of [-1,1])sleeve(r,[0,.031*sign,.24],z,0,.046,.022,.012,alloy,15);
 })]);
const blower=study('p992-cabin-blower','Cabin blower and motor',
 'The blower wheel draws air in along its axis and throws it out toward the ducts. Its motor and housing stay fixed while the wheel turns.',sources.airBox,[
 part('wheel','Centrifugal blower wheel','The ring of curved vanes accelerates air toward the outside of the wheel.',[0,0,.31],(r,p)=>{
  sleeve(r,O,z,-.055,-.042,.18,.065,iron,27);for(let i=0;i<27;i++){
   const a=TAU*(i/27+p),pt=(rad,k,h)=>[rad*Math.cos(a+k),rad*Math.sin(a+k),h];r.polygon([pt(.141,-.14,-.04),pt(.18,0,-.04),pt(.18,0,.066),pt(.141,-.14,.066)],'#879697',false);}
 }),
 part('motor','Blower motor','The motor shaft fits into the center of the wheel.',[0,0,-.31],r=>{cyl(r,O,z,-.20,-.066,.070,iron);cyl(r,O,z,-.066,-.038,.018,alloy);}),
 part('case','Blower case and outlet','The fixed case gathers air from the wheel and guides it into the air-handling unit.',[.32,0,.06],r=>{
  turn(r,O,z,[[-.075,.188],[-.075,.205],[.080,.213],[.083,.189]],rubber,{n:29,sweep:TAU*.72});box(r,[0,.18,0],[.26,.047,.13],iron);
 })],'Watch the wheel rotate within the stationary blower case.');
const turbos=[turboStudy(-1),turboStudy(1)];
export function sectionFor(id){
 if(id.startsWith('p992-intake.filter-'))return filter;
 if(id.startsWith('p992-intake.actuator-'))return wastegate;
 if(id==='p992-clutch.master')return hydraulic;
 if(id==='p992-hvac.drier')return receiver;
 if(id==='p992-hvac.blower')return blower;
 if(id.startsWith('p992-seats.')&&!id.endsWith('.leads'))return heating;
 return null;
}
export {turbos};
