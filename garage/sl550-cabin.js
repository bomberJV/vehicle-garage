import {trunkPlate,trunkLockStudy,drawSLTrunkLock,drawSLDeckHandle} from './sl550-access.js';
// US MY2014 SL 550. Coordinates are metres. Positive x points to the luggage compartment.
// Brochure photographs pp. 16–18 establish the appearance of this two-seat interior.
// The parts plates establish the component relationships. Hidden surfaces and routes are approximate.
import {turn,part,study} from './mechanism-shapes.js';
import {pipe,tint} from './road-primitives.js';
import {refrigerantParts,refrigerantStudies,refrigerantPlate,beltPlate} from './sl550-refrigerant.js';
import {acousticLensStudy,lensPhoto,mountedLens} from './sl550-acoustic-lens.js';
import {slWindshieldPoint} from './sl550-roof.js';
import {slInstruments,slSportWheel,slDisplay,slWheelStudy,slInstrumentStudy} from './sl550-cockpit.js';

const mb='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/';
const ref=(label,url)=>({label,url});
const brochure=ref('MBUSA · 2014 SL cockpit and options, pp. 16–18, 25','https://www.auto-brochures.com/makes/Mercedes_Benz/SL-Class/Mercedes%20Benz_US%20SL-Class_2014.pdf#page=16');
const heating=ref('Mercedes-Benz · heater and evaporator, plate 1',mb+'hvac--heater');
const sound=ref('Bang & Olufsen · BeoSound AMG SL speaker sizes and positions, p. 4','https://investor.bang-olufsen.com/static-files/8952d445-6a76-43ea-9ef1-356fd8940c8b#page=4');
const dashboard=ref('Mercedes-Benz · instrument panel and covers',mb+'body--dashboard');
const trim=ref('Mercedes-Benz · interior door trim and switch bezel',mb+'body--interior-trim-door');
const locks=ref('Mercedes-Benz · R231 door lock and electric closing aid','https://www.mercedesbenz.parts/v-2014-mercedes_benz-sl550--base--4-7l-v8-gas/front-doors--locking-system');
const trunk=ref('Mercedes-Benz · SL trunk lock, actuator and release lever',mb+'electrical--trunk');
const manual=ref('MBUSA · 2014 SL operator’s manual','https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf');
const steering=ref('Daimler · R231 column adjustment and height drive, LI46.15-P-057157','https://static.nhtsa.gov/odi/tsbs/2014/MC-10167001-9999.pdf');
const washer=ref('Mercedes-Benz · MAGIC VISION CONTROL, plate P82.35-2701-00','https://www.manualslib.de/manual/89970/Mercedes-Benz-Typenreihe-231.html?page=32');
const wiperPlate=ref('Mercedes-Benz USA · wiper arms, blades and linkage, plate 1',mb+'electrical--wipers');
const washManual=ref('MBUSA · MAGIC VISION CONTROL, operator’s manual p. 134',manual.url+'#page=136');
export const slCabinSources=[brochure,sound,lensPhoto,dashboard,heating,refrigerantPlate,beltPlate,trim,locks,trunk,manual,steering,washer,wiperPlate,washManual];
const leather='#53463f', hide='#b8a188',wood='#674331',metal='#a9aaa4',black='#27282b',rubber='#353436';
const X=[1,0,0],Z=[0,0,1],TAU=2*Math.PI;
function row(y){
 const edge=(y/.77)**2,sweep=.10*edge;
 return [[-.675,.905],[-.600,.931],[-.408,.941],[-.325,.928],[-.286,.911],[-.275,.896],[-.275,.802],[-.283,.790],[-.296,.780],[-.300,.751],[-.306,.745],[-.319,.728],[-.34,.682],[-.367,.59],[-.392,.548],[-.455,.529],[-.590,.552],[-.66,.616]].map(([x,z])=>[x+sweep,y,z-.018*edge]);
}
function fascia(r){
 const ys=Array.from({length:27},(_,i)=>-.765+i*1.53/26);
 const colors=['#433734','#55403a','#58413b','#513a35','#604941','#493833','#54403a','#443434',wood,'#bc977a','#afa08b','#cbb69b','#c5ad92','#b9a189','#a58f79','#907c68',rubber,rubber];
 for(let i=1;i<ys.length;i++){
  const a=row(ys[i-1]),b=row(ys[i]);
  for(let j=0;j<a.length;j++){
   const k=(j+1)%a.length;
   r.polygon([a[j],a[k],b[k],b[j]],colors[j],false);
  }
 }
 for(const y of [ys[0],ys.at(-1)])r.polygon(row(y),leather,false);
 const trace=(y,x,z,d=0)=>[x+.10*(y/.77)**2+d,y,z-.018*(y/.77)**2];
 // Twin seams follow the padded leading edge. A narrow bright lip carries the walnut veneer.
 for(const z of [.911,.915])pipe(r,ys.map(y=>trace(y,z===.911?-.283:-.293,z,.0006)),.0010,'#927b6c',5);
 for(let i=0;i<5;i++){
  const grain=ys.map(y=>{
   const z=.755+i*.0044+.0011*Math.sin(y*21+i)+.0010*Math.cos(y*41+i*.3);
   return trace(y,-.300+(z-.751)*.138,z,.0018);
  });
  for(let j=1;j<grain.length;j++){
   const a=grain[j-1],b=grain[j];
   r.polygon([a,b,[b[0],b[1],b[2]+.0009],[a[0],a[1],a[2]+.0009]],i%2?'#704c39':'#58392e',false);
  }
 }
 // The clock and the instrument hood stand on a padded dash, not on a level plinth.
 const glove=[[-.316,.227,.736],[-.316,.698,.736],[-.342,.694,.669],[-.372,.653,.581],[-.374,.276,.578],[-.344,.233,.668],[-.316,.227,.736]];
 pipe(r,glove.map(([x,y,z])=>trace(y,x,z,.002)),.0017,'#806e5e',5);
 const y=.455,[x,,z]=trace(y,-.321,.719,.005);
 r.box(x-.008,y-.037,z-.004,x+.002,y+.037,z+.003,'#a89d8d');
}
function dashFace(y){return -.275+.10*(y/.77)**2;}
function roundFace(r,c,dir,steps,depth,radius,color){turn(r,c,dir,[[0,0],[0,radius],[depth,radius],[depth,0]],color,{n:steps});}
function columnMount(r){
 r.box(-.428,-.451,.704,-.398,-.345,.794,'#636764');
 turn(r,[-.402,-.398,.745],[.94,0,.34],[[0,.024],[0,.040],[.151,.040],[.151,.024],[0,.024]],'#707471',{n:12});
}
function columnTube(r,t=0){
 const q=.016*(1-Math.cos(TAU*t));
 r.rod([-.294+q,-.398,.786+q*.36],[-.111+q,-.398,.852+q*.36],.021,'#979b99',12);
}
function columnDrive(r,reach){
 const anchor=reach?[-.338,-.346,.739]:[-.374,-.446,.705];
 const axis=reach?[.94,0,.34]:[.12,0,.99];
 turn(r,anchor,axis,[[-.027,0],[-.027,.018],[-.023,.022],[.026,.022],[.03,.018],[.03,.006],[.053,.006],[.053,0]],'#797d7b',{n:12});
 r.box(anchor[0]-.013,anchor[1]-.018,anchor[2]-.020,anchor[0]+.015,anchor[1]+.018,anchor[2]-.012,black);
}
function steeringColumn(r){
 columnMount(r);columnTube(r);columnDrive(r,true);columnDrive(r,false);
}
function wristrest(r){
 const stations=[[.176,.014,.547],[.184,.039,.568],[.205,.048,.580],[.225,.048,.583],[.252,.044,.577],[.269,.027,.560],[.273,.012,.548]];
 let prev;
 for(const [x,w,z] of stations){
  const edge=[[-w,.540],[-w,z-.008],[-w*.83,z-.001],[0,z+.002],[w*.83,z-.001],[w,z-.008],[w,.540]].map(([y,zz])=>[x,y,zz]);
  if(prev)for(let j=1;j<edge.length;j++)r.polygon([prev[j-1],edge[j-1],edge[j],prev[j]],j<3?'#503c36':'#634c41',false);
  prev=edge;
 }
}
function consoleShell(r){
 const stations=[[-.306,.748,.160],[-.269,.681,.158],[-.208,.588,.150],[-.169,.551,.144],[-.118,.532,.140],[-.052,.521,.137],[.06,.522,.133],[.14,.528,.131],[.271,.548,.127],[.310,.552,.129],[.64,.555,.138],[.736,.529,.130],[.763,.475,.124]];
 const section=([x,top,w])=>[[-w,.302],[-w,top-.046],[-w*.98,top-.018],[-w*.94,top-.003],[-w*.91,top],[w*.91,top],[w*.94,top-.003],[w*.98,top-.018],[w,top-.046],[w,.302]].map(([y,z])=>[x,y,z]);
 for(let i=1;i<stations.length;i++){
  const a=section(stations[i-1]),b=section(stations[i]);
  for(let j=0;j<9;j++){
   const face=[a[j],a[j+1],b[j+1],b[j]];
   r.polygon(face,j===4?(i<10?'#684334':hide):j===3||j===5?'#d7ba9c':j===2||j===6?'#b7a28b':'#c4ad92',false);
  }
 }
 for(let j=0;j<11;j++){
  const line=stations.slice(0,10).map(([x,z,w])=>[x,w*(j-5)*.161+.0013*Math.sin(x*43+j*.7),z+.0009]);
  for(let i=1;i<line.length;i++){
   const a=line[i-1],b=line[i];
   r.polygon([a,b,[b[0],b[1]+.0018,b[2]],[a[0],a[1]+.0018,a[2]]],j%2?'#7a503a':'#58392e',false);
  }
 }
 // The broad lid sits between narrow stitched shoulders at the rear of the tunnel.
 const lid=[[.286,.080,.561],[.302,.103,.576],[.325,.108,.582],[.600,.111,.584],[.625,.099,.576],[.636,.084,.558]];
 for(let i=1;i<lid.length;i++){
  const row=([x,w,z])=>[[-w,.555],[-w,z-.006],[-w+.009,z],[w-.009,z],[w,z-.006],[w,.555]].map(([y,zz])=>[x,y,zz]);
  const a=row(lid[i-1]),b=row(lid[i]);
  for(let j=0;j<5;j++)r.polygon([a[j],a[j+1],b[j+1],b[j]],j===2?'#ceb99e':'#b29c83',false);
 }
 r.box(-.103,-.080,.528,.006,.059,.532,'#b6b6b0');
 r.box(-.098,-.074,.532,.002,.054,.534,'#29272a');
 r.rod([-.054,-.022,.534],[-.070,-.022,.592],.011,'#b1b0ab',10);
 const lever=[[-.091,.599],[-.091,.608],[-.084,.620],[-.071,.625],[-.051,.623],[-.038,.613],[-.037,.605],[-.052,.594],[-.070,.589],[-.082,.591]];
 const handle=(y,size)=>lever.map(([x,z])=>[(x+.065)*size-.065,y,(z-.606)*size+.606]);
 const widths=[[-.045,.61],[-.043,.82],[-.038,.99],[-.025,1],[-.010,.95],[-.004,.80],[-.002,.63]];
 for(let i=1;i<widths.length;i++){
  const a=handle(...widths[i-1]),b=handle(...widths[i]);
  for(let j=0;j<a.length;j++){
   const k=(j+1)%a.length;
   r.polygon([a[j],a[k],b[k],b[j]],tint(i<3||j>4?'#a8a9a3':'#61504b',.86+.12*Math.sin(j*.6)),false);
  }
 }
 for(const [y,size] of [widths[0],widths.at(-1)])r.polygon(handle(y,size),'#514540',false);
 r.box(.055,-.060,.528,.166,.060,.534,'#393436');
 roundFace(r,[.111,0,.534],Z,32,.010,.034,'#a4a29c');
 roundFace(r,[.111,0,.544],Z,32,.008,.029,'#ceccc2');
 for(const s of [-1,1])r.box(.077,s*.043-.008,.534,.140,s*.043+.008,.539,'#8c8a84');
 wristrest(r);
 // The COMAND keypad follows the angle of the wood stack. Four lower rows
 // flank the audio dial; a separate bank of silver function keys runs below it.
 const panel=(u,v,d=0)=>[-.219-.40*(v-.687)+d,u,v];
 const tile=(u,v,w,h,d,c)=>r.polygon([[u,v],[u+w,v],[u+w,v+h],[u,v+h]].map(([x,z])=>panel(x,z,d)),c,false);
 const outline=[[-.139,.682],[.139,.682],[.141,.689],[.141,.790],[.132,.801],[-.132,.801],[-.141,.790],[-.141,.689]];
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length];
  r.polygon([panel(...a,-.034),panel(...b,-.034),panel(...b,.0035),panel(...a,.0035)],'#654938',false);
 }
 r.polygon(outline.map(p=>panel(...p,.004)),'#b3a394',false);
 tile(-.138,.684,.276,.116,.005,'#242427');
 tile(-.089,.786,.178,.003,.006,'#b4b3a9');
 for(let i=0;i<4;i++)for(const side of [-1,1]){
  const v=.717+i*.0155;
  for(let j=0;j<2;j++){
   const u=side*(.076+j*.031)-.013;
   tile(u,v,.026,.011,.0065,'#5a5652');
   tile(u+.007,v+.005,.012-j*.003,.0012,.0074,'#bdbab0');
  }
 }
 for(let i=0;i<8;i++)tile(-.125+i*.031,.688,.028,.013,.007,'#aaa7a1');
 const center=panel(0,.746,.008);
 roundFace(r,center,X,20,.006,.0165,'#cdcbc1');
 roundFace(r,[center[0]+.006,0,.746],X,20,.002,.012,'#444344');
}
function panel(r,side){
 const outer=side*.765,inner=side*.734;
 const pts=[[-.52,.877],[-.455,.906],[.19,.918],[.59,.922],[.822,.917],[.826,.693],[.717,.388],[.52,.343],[-.39,.349],[-.51,.438]];
 r.profile(pts,Math.min(outer,inner),Math.max(outer,inner),hide);
 const q=(x,z,h=0)=>[x,inner-side*h,z];
 r.polygon([q(-.49,.88,.0015),q(.805,.916,.0015),q(.799,.865,.0015),q(.01,.842,.0015),q(-.43,.811,.0015)],leather,false);
 r.polygon([q(-.456,.843,.004),q(-.174,.864,.004),q(.13,.848,.004),q(.117,.810,.004),q(-.41,.792,.004)],wood,false);
 r.polygon([q(-.418,.675,.008),q(-.10,.693,.010),q(.31,.690,.022),q(.520,.661,.031),q(.482,.622,.027),q(-.05,.637,.014)],leather,false);
 pipe(r,[q(-.438,.802,.007),q(-.14,.835,.007),q(.15,.806,.007)],.003,metal,5);
}
function switches(r,s){
 const y=s*.728;
 const face=(p,col)=>r.polygon(p.map(([x,z])=>[x,y,z]),col,false);
 face([[-.363,.797],[-.345,.799],[-.320,.831],[-.326,.837],[-.340,.831]],metal);
 face([[-.337,.795],[-.296,.796],[-.29,.805],[-.326,.806]],metal);
 for(let i=0;i<4;i++)face([[-.284+i*.015,.806],[-.274+i*.015,.806],[-.274+i*.015,.814],[-.284+i*.015,.814]],metal);
 pipe(r,[[-.118,y,.833],[-.083,y-s*.015,.824],[-.011,y,.843]],.007,metal,6);
}
function sill(r,s){
 r.box(-.39,s*.730-.015,.347,.666,s*.730+.015,.353,metal);
 r.box(.052,s*.730-.006,.353,.222,s*.730+.006,.355,'#d8ded3');
}
function carpets(r){
 for(const s of [-1,1]){
  const signY=v=>s*v;
  const valley=[[-.522,.527],[-.517,.408],[-.46,.30],[-.365,.254],[.44,.252],[.71,.265],[.793,.50],[.809,.69]];
  for(let i=1;i<valley.length;i++){
   const a=valley[i-1],b=valley[i];
   r.polygon([[a[0],signY(.12),a[1]],[b[0],signY(.12),b[1]],[b[0],signY(.724),b[1]],[a[0],signY(.724),a[1]]],'#746457',false);
  }
  r.box(-.355,Math.min(signY(.21),signY(.65)),.258,-.035,Math.max(signY(.21),signY(.65)),.264,'#66584d');
  r.profile([[.733,.523],[.778,.646],[.775,.779],[.867,.844],[.910,.799],[.881,.506]],Math.min(signY(.664),signY(.742)),Math.max(signY(.664),signY(.742)),hide);
 }
 r.profile([[.784,.492],[.783,.714],[.758,.776],[.772,.808],[.879,.813],[.906,.773],[.887,.518]],-.686,.686,leather);
 r.box(.753,-.084,.808,.882,.084,.815,'#58514a');
}
function vent(r,y){
 const c=[dashFace(y)+.005,y,.854],rad=.052;
 turn(r,c,X,[[0,0],[0,rad],[.009,rad],[.016,rad*.84],[.001,rad*.72],[.001,0]],metal,{n:18});
 roundFace(r,[c[0]+.002,y,.854],X,16,.001,rad*.75,black);
 for(let j=0;j<4;j++){
  const a=j*Math.PI/2, reach=rad*.79;
  r.polygon([[c[0]+.009,y+.006*Math.cos(a-.9),.854+.006*Math.sin(a-.9)],[c[0]+.014,y+reach*Math.cos(a-.11),.854+reach*Math.sin(a-.11)],[c[0]+.014,y+reach*Math.cos(a+.05),.854+reach*Math.sin(a+.05)],[c[0]+.011,y+.006*Math.cos(a+.9),.854+.006*Math.sin(a+.9)]],'#b8b8b4',false);
 }
}
function climateControls(r){
 r.profile([[-.259,.688],[-.212,.689],[-.185,.614],[-.207,.614]],-.135,.135,black);
 for(const y of [-.103,.103]){
  turn(r,[-.191,y,.648],X,[[0,0],[0,.023],[.009,.023],[.010,.016],[.011,0]],metal,{n:15});
  r.box(-.197,y-.029,.675,-.19,y+.029,.680,'#799097');
 }
 for(let i=-2;i<=2;i++)r.box(-.198,i*.024-.008,.642,-.187,i*.024+.008,.649,metal);
}
function heaterCase(r){
 // Service plate 1: case, separate rear cover, heater and evaporator cores,
 // blower wheel/motor, inlet case, filter, harness and condensate drain.
 r.profile([[-.571,.474],[-.568,.743],[-.469,.778],[-.366,.726],[-.362,.521],[-.412,.469]],-.15,.166,'#535655');
 r.box(-.548,-.143,.716,-.401,.159,.743,'#404342');
 for(const y of [-.13,-.04,.05,.14])r.box(-.565,y,.494,-.552,y+.004,.725,'#6a6c66');
}
function core(r,x,color){
 r.box(x-.011,-.124,.507,x+.011,.138,.697,color);
 for(let i=0;i<12;i++)r.box(x+.011,-.12+i*.021,.509,x+.013,-.118+i*.021,.692,tint(color,1.26));
 for(const y of [-.13,.14])r.box(x-.018,y,.503,x+.016,y+.005,.699,'#93958f');
}
function airflow(r,t=0){
 const c=[-.477,.269,.636];
 turn(r,c,Z,[[-.080,0],[-.080,.041],[-.051,.046],[-.043,.075],[-.039,.075],[-.039,0]],'#646768',{n:12});
 for(let j=0;j<16;j++){
  const a=j*TAU/16+t*TAU,b=a+.22;
  r.polygon([[c[0]+.054*Math.cos(a),c[1]+.054*Math.sin(a),.598],[c[0]+.072*Math.cos(b),c[1]+.072*Math.sin(b),.598],[c[0]+.071*Math.cos(b),c[1]+.071*Math.sin(b),.652],[c[0]+.054*Math.cos(a),c[1]+.054*Math.sin(a),.652]],'#434644',false);
 }
 r.box(-.511,.311,.668,-.402,.494,.686,'#a69f88');
}
function outlets(r){
 for(const y of [-.682,-.153,.153,.682]){
  vent(r,y);
  pipe(r,[[-.461,y*.2,.726],[-.462,y*.70,.801],[dashFace(y)-.028,y,.852]],Math.abs(y)>.5?.027:.019,'#484a48',6);
 }
}
function driver(r,c,axis,radius,grill=false){
 turn(r,c,axis,[[-radius*.46,0],[-radius*.46,radius*.34],[-radius*.27,radius*.45],[0,radius],[.004,radius],[.004,radius*.88],[-radius*.17,radius*.35],[-radius*.03,0]],'#454545',{n:14});
 if(grill)turn(r,c,axis,[[.005,radius*.89],[.005,radius],[.007,radius]],metal,{n:16});
}
function lens(r,side){
 const dashHeight=(x,y)=>{
  const stations=row(y);
  for(let j=1;j<4;j++){
   const [xa,,za]=stations[j-1],[xb,,zb]=stations[j];
   if(x<=xb)return za+(x-xa)*(zb-za)/(xb-xa);
  }
  return stations[3][2];
 };
 mountedLens(r,side,dashHeight);
}
function mids(r){
 for(const side of [-1,1]){
  const y=side*.732;
  r.instance(side<0?'driver-door':'passenger-door',()=>driver(r,[-.29,y,.532],[0,-side,0],.050,true));
  r.instance(side<0?'driver-quarter':'passenger-quarter',()=>driver(r,[.812,y*.908,.733],[0,-side,0],.050,true));
 }
}
function centers(r){
 for(const [label,x,z] of [['front-center',-.581,.936],['rear-center',.811,.815]]){
  r.instance(label+'-midrange',()=>driver(r,[x,0,z],Z,.05,true));
  r.instance(label+'-tweeter',()=>driver(r,[x+.047,.053,z],Z,.0125,true));
 }
}
function bass(r,s){
 const center=[-.623,s*.435,.422];
 driver(r,center,[.92,0,.4],.110,true);
}
function amps(r){
 for(const [key,y,w] of [['dsp',.51,.105],['icepower',.658,.029]]){
  r.instance(key,()=>{
   r.box(.914,y-w,.33,1.095,y+w,.369,'#707474');
   for(let j=0;j<5;j++){const yy=y-w+.007+j*w*.41;r.box(.92,yy,.369,1.088,yy+.005,.374,metal);}
  });
 }
}
function latch(r,s){
 const y=s*.775;
 r.box(.706,y-.014,.690,.784,y+.014,.767,'#6c6d68');
 r.profile([[.751,.733],[.779,.743],[.779,.754],[.748,.749],[.74,.734]],y-.018,y+.018,'#393c3c');
 r.box(.606,y-.018,.705,.690,y+.018,.758,'#5a5c59');
 pipe(r,[[-.084,y,.825],[.245,y,.770],[.546,y,.761],[.743,y,.723]],.004,'#616467',5);
}
function bumperSensor(r){
 pipe(r,[[2.105,-.354,.397],[2.155,-.208,.404],[2.167,.017,.405],[2.155,.229,.404],[2.107,.354,.397]],.006,'#393e3d',5);
 r.box(2.071,.269,.394,2.105,.336,.416,'#5d6362');
}

// All points on the parked blades use the same fitted surface as the windshield.
// v measures up the glass and u runs across it. Small normal offsets are in metres.
const leftWiper={pivot:-.835,from:-.715,to:.105,base:.098,slope:-.043};
const rightWiper={pivot:-.06,from:.094,to:.925,base:.060,slope:.047};
function onGlass(v,u,offset=0){
 const [x,y,z]=slWindshieldPoint(v,u);
 return [x-.47*offset,y,z+.882*offset];
}
function bladePoint(w,t,delta=0,rise=0){
 const u=w.from+(w.to-w.from)*t,v=w.base+w.slope*t+.013*Math.sin(Math.PI*t)+delta;
 return onGlass(v,u,rise);
}
function wiperBlade(r,w){
 const profile=[[-.0020,.002],[.0020,.002],[.0027,.007],[.009,.010],[.006,.015],[-.006,.014],[-.009,.010],[-.0027,.007]];
 let previous;
 for(let i=0;i<=14;i++){
  const t=i/14,cap=i===0||i===14?.62:1;
  const section=profile.map(([v,h])=>bladePoint(w,t,v*cap,h*cap));
  if(previous)for(let j=0;j<section.length;j++){
   const k=(j+1)%section.length;
   r.polygon([previous[j],section[j],section[k],previous[k]],j===3?'#4c5051':j===4?'#34393c':'#22272a',false);
  }
  if(i===0||i===14)r.polygon(section,'#2c3135',false);
  previous=section;
 }
}
function wiperArm(r,w){
 const tip=bladePoint(w,.49,0,.016),stud=pivotBase(w);
 roundFace(r,stud,wiperAxis,10,.007,.015,'#373c3e');
 // The folded hinge and its nut are down in the cowl. The blade clip rises above the lip only at the far end of the stamped arm.
 const lift=w===leftWiper?.061:.055;
 const path=[onGlass(-.050+lift,w.pivot,.009),onGlass(-.045+lift,w.pivot+.073,.006),onGlass(-.014+lift*.65,w.pivot+.185,.005),onGlass(.015+lift*.65,w.pivot+.284,.007),tip];
 const widths=[.016,.015,.010,.008,.007];
 const sections=path.map(([x,y,z],i)=>[[-widths[i],-.003],[widths[i],-.003],[widths[i]*.82,.005],[-widths[i]*.82,.005]].map(([xx,zz])=>[x+xx,y,z+xx*.51+zz]));
 for(let i=1;i<sections.length;i++)for(let j=0;j<4;j++){
  const k=(j+1)%4;r.polygon([sections[i-1][j],sections[i][j],sections[i][k],sections[i-1][k]],j===2?'#515658':'#34383a',false);
 }
 if(w===rightWiper){
  const pivot2=pivotBase(w,.071);
  roundFace(r,pivot2,wiperAxis,9,.008,.012,'#373c3e');
  pipe(r,[pivot2,onGlass(.012,w.pivot+.15,.005),path[2]],.004,'#4e5455',6);
 }
 r.rod(tip,bladePoint(w,.49,0,.013),.006,'#4b5052',7);
}
// Plate 1 shows three shaft bosses on the carrier, two drive rods, the
// central geared motor and a separate retainer. Centers follow the installed
// arm roots. Concealed rod lengths and stamped sections are reconstructed.
const wiperAxis=[-.46,0,.888];
const pivotBase=(w,shift=0)=>onGlass(w===leftWiper?.007:.001,w.pivot+shift,.004);
const downAxis=(p,d)=>p.map((n,i)=>n-wiperAxis[i]*d);
const wiperSpindles=[pivotBase(leftWiper),pivotBase(rightWiper),pivotBase(rightWiper,.071)];
const gearCenter=[-.720,-.315,.857];
function wiperMotor(r){
 turn(r,gearCenter,wiperAxis,[[-.027,0],[-.027,.042],[-.021,.049],[-.004,.049],[0,.044],[0,0]],'#777e80',{n:12});
 turn(r,[-.704,-.340,.838],[.17,-.98,.09],[[0,0],[0,.027],[.063,.027],[.070,.021],[.070,0]],'#596166',{n:10});
 r.box(-.716,-.403,.818,-.691,-.380,.835,'#383f43');
}
function wiperCarrier(r){
 const mounts=wiperSpindles.map(p=>downAxis(p,.034));
 const left=mounts[0],right=mounts[1],guide=mounts[2];
 const center=[gearCenter[0]+.030,gearCenter[1],gearCenter[2]-.012];
 for(const p of [left,right,guide]){
  turn(r,p,wiperAxis,[[-.010,.010],[-.010,.017],[.008,.017],[.015,.012],[.015,.009],[-.010,.010]],'#788185',{n:8});
 }
 pipe(r,[left,[center[0]+.002,left[1]+.061,center[2]+.003],center,[right[0]+.008,right[1]-.054,right[2]-.012],right,guide],.010,'#a4abaa',7);
 for(const [pivot,side] of [[left,-1],[guide,1]]){
  const [x,y,z]=pivot;
  const ear=[x+.022,y+side*.024,z-.009];r.rod(pivot,ear,.010,'#999f9e',7);
  turn(r,ear,[0,0,1],[[-.003,.004],[-.003,.012],[.003,.012],[.003,.004],[-.003,.004]],'#5d6364',{n:9});
 }
}
function wiperRods(r){
 const [left,right]=wiperSpindles.map(p=>downAxis(p,.045));
 const pinL=[left[0]-.027,left[1]+.020,left[2]],pinR=[right[0]-.030,right[1]+.015,right[2]];
 const eccentric=[gearCenter[0]-.024,gearCenter[1]-.012,gearCenter[2]+.005];
 for(const [a,b] of [[gearCenter,eccentric],[left,pinL],[right,pinR]])r.rod(a,b,.006,'#707879',8);
 pipe(r,[pinL,[pinL[0]+.010,pinL[1]+.056,pinL[2]-.004],eccentric],.0048,'#a8afaf',7);
 pipe(r,[eccentric,[pinR[0]-.010,pinR[1]-.047,pinR[2]-.004],pinR],.0048,'#a8afaf',7);
 for(const p of [pinL,pinR,eccentric])turn(r,p,wiperAxis,[[-.003,.006],[-.002,.009],[.004,.009],[.006,.005]],'#586063',{n:8});
}
function wiperShafts(r){
 for(const p of wiperSpindles){
  turn(r,p,wiperAxis,[[-.050,0],[-.050,.007],[-.017,.007],[-.015,.011],[-.008,.011],[-.005,.008],[0,.008],[0,0]],'#828a8c',{n:9});
 }
}
const wiperDriveParts=[
 part('motor','Wiper motor and reduction housing','The geared motor turns a short crank at the center of the unit.',[-.05,0,-.07],wiperMotor),
 part('carrier','Linkage carrier and mounting ears','The fixed carrier locates the bearings for the driver’s spindle and the two passenger-side pivots.',[.09,0,.02],wiperCarrier),
 part('rods','Drive rods and ball joints','The crank transfers motion to two drive rods. Each rod meets a short lever at a spindle.',[-.05,0,.06],wiperRods),
 part('shafts','Drive spindles and guide pivot','The arm collars fit over the shafts at the windshield base. The passenger arm uses a second pivot.',[0,0,.09],wiperShafts)
];
const wiperDriveStudy=study('slwiperdrive','Windshield wiper drive','Open the motor, mounting carrier, drive rods and three shafts beneath the plenum. The Mercedes parts plate identifies the assembly. Hidden dimensions are approximate.',wiperPlate,wiperDriveParts);
function wiperLinkage(r){
 for(const p of wiperDriveParts)p.draw(r);
}
function rearMirror(r){
 const mount=onGlass(.902,0,-.008);
 pipe(r,[mount,[.046,0,1.246],[.071,0,1.215],[.091,0,1.202]],.010,'#45494b',7);
 const edge=[[-.111,-.021],[-.106,-.029],[.093,-.030],[.11,-.021],[.113,.015],[.104,.026],[-.097,.027],[-.112,.017]];
 const shell=(y,z,d)=>[.095+y*.074+z*.13+d,y,1.200+z];
 const back=edge.map(([y,z])=>shell(y*.91,z*.88,-.021)),front=edge.map(([y,z])=>shell(y,z,.003));
 r.polygon(back,black,false);r.polygon(front,black,false);
 for(let i=0;i<edge.length;i++){const j=(i+1)%edge.length;r.polygon([back[i],front[i],front[j],back[j]],'#423e3b',false);}
 r.polygon(edge.map(([y,z])=>shell(y*.947,z*.833,.0042)),'#8b9c9f',false);
 for(let i=0;i<3;i++)r.box(.085,-.021+i*.014,1.168,.094,-.013+i*.014,1.172,'#5f6261');
}
function ambientStrips(r){
 for(const s of [-1,1]){
  pipe(r,[[-.421,s*.728,.793],[-.16,s*.728,.812],[.13,s*.728,.801]],.0021,'#c18a63',6);
  pipe(r,[[-.173,s*.147,.504],[.07,s*.133,.503],[.25,s*.125,.527]],.0021,'#bb8a6e',6);
 }
}

function assembly(id,name,description,entries){
 return {id,name,description,parts:entries.map(([key,label,detail,offset,source,draw])=>({id:id+'.'+key,name:label,description:detail,offset,source,draw}))};
}
const both=draw=>r=>{for(const side of [-1,1])r.instance(side<0?'left':'right',()=>draw(r,side));};
export const slCabinGroups=[
 assembly('cabin','Cockpit and interior trim','Look across the wood fascia from the driver’s gauges to the center display. The tunnel carries the selector, COMAND controller and roof switch.',[
  ['dash','Leather dash and Burl Walnut fascia','The instrument panel wraps around the center screen, four outlets and the passenger airbag cover.',[-.15,0,.20],dashboard,fascia],
  ['instruments','Instrument cluster and dashboard clock','Two recessed analog dials flank the driver information display. A smaller hooded clock sits above the center stack.',[.12,-.08,.33],brochure,slInstruments],
  ['wheel','Multifunction sport wheel and shift paddles','The leather three-spoke wheel carries thumb controls and a pair of silver paddles.',[.24,-.13,.23],brochure,slSportWheel],
  ['column','Power tilt and telescoping steering column','One electric drive changes reach and another changes the height of the wheel. Open the column to see the sliding shaft inside its support.',[-.08,-.17,.12],steering,steeringColumn],
  ['display','COMAND display with SPLITVIEW','The seven-inch center display sits between the two inner vents. Optional SPLITVIEW presents a separate program to the passenger.',[.16,0,.22],brochure,slDisplay],
  ['console','Transmission selector and COMAND controller','A short shift selector sits ahead of the rotary COMAND control and the roof switch. Climate keys have their own panel above the wood tunnel.',[.08,0,.28],brochure,consoleShell],
  ['carpet','Floor carpet, mats and rear bulkhead trim','The mats lie on either side of the raised tunnel, ahead of the seat tracks. A trimmed bulkhead closes the cabin behind the seats.',[0,0,.16],brochure,carpets],
  ['doors','Leather door trim and armrests','A separate pocket, upper garnish, handle surround and seat-switch bezel fit to each inner door panel.',[0,.34,.11],trim,both(panel)],
  ['switches','Door release and seat memory switches','The seat-shaped switches sit in the upper trim. The memory controls recall stored seat positions.',[.09,-.20,.18],trim,both(switches)],
  ['sills','Illuminated door sill plates','An illuminated insert sits in each brushed sill plate below the door.',[.05,0,-.17],brochure,both(sill)]
 ]),
 assembly('visibility','Wipers, mirror and interior lighting','The washer sends fluid through each arm and along the blade. Open either blade to follow the fluid to the active wiping edge.',[
  ['arms','Wiper arms and pivot caps','The motor drives two arms at the base of the glass. A second pivot guides the passenger-side arm.',[-.08,0,.10],wiperPlate,r=>{r.instance('left',()=>wiperArm(r,leftWiper));r.instance('right',()=>wiperArm(r,rightWiper));}],
  ['left-blade','Driver’s heated washer blade','The driver’s blade carries washer fluid directly to the windshield and wipes the wetted edge clean.',[-.07,-.04,.14],washManual,r=>wiperBlade(r,leftWiper)],
  ['right-blade','Passenger’s heated washer blade','The blade contains a feed along each edge. Only the side facing the direction of travel receives fluid.',[-.07,.07,.14],washer,r=>wiperBlade(r,rightWiper)],
  ['linkage','Cowl-mounted motor and linkage','One motor and a system of links drive the two parked arms. The hidden linkage path is schematic.',[-.13,0,-.09],wiperPlate,wiperLinkage],
  ['mirror','Auto-dimming interior rearview mirror','A light sensor controls the anti-glare mirror. Three buttons underneath operate the integrated garage-door opener.',[.12,0,-.07],manual,rearMirror],
  ['ambient','Door and console ambient lighting','LEDs illuminate optical guides beneath the door and console trim. This model shows the warm setting.',[0,.12,.07],brochure,ambientStrips]
 ]),
 assembly('climate','Dual-zone air conditioning','Follow the refrigerant from the belt-driven compressor through the front condenser to the evaporator behind the dash. The blower sends conditioned air to the cabin. The connections follow the parts plates, and the pipe bends are approximate.',[
  ['case','Heater case and service cover','Mercedes catalog 231 830 00 03 locates the heater case, rear cover and two heat exchangers.',[-.12,0,-.17],heating,heaterCase],
  ['evaporator','A/C evaporator core','Refrigerant passing through the evaporator removes heat from the incoming air.',[-.13,-.12,.13],heating,r=>core(r,-.522,'#95a2a1')],
  ['heater','Cabin heater core','The heater core passes engine-coolant heat to the cabin airflow. Its inlet and outlet meet the heater pipes.',[.15,-.12,.08],heating,r=>{
   core(r,-.431,'#968777');for(const y of [-.099,.094])pipe(r,[[-.432,y,.684],[-.458,y,.721],[-.605,y,.730]],.008,metal,7);
  }],
  ['blower','Blower motor and cabin filter','The drum impeller draws air through the filter. Open the blower to see its vanes turn.',[0,.27,.10],heating,airflow],
  ['outlets','Four turbine vents and supply ducts','Two circular vents bracket the center display. The outer pair serves the side windows and occupants.',[.12,0,.20],manual,outlets],
  ['controls','Left and right climate controls','The US panel has a temperature control at each end, with defrost, cooling and ZONE functions in between.',[.20,0,.08],manual,climateControls],
  ...refrigerantParts
 ]),
 assembly('audio','Bang & Olufsen BeoSound','Twelve drivers receive 900 watts from two amplifiers. The FrontBass woofers load the forward body rails. Each dashboard lens spreads treble across the cabin.',[
  ['lenses','Two illuminated Acoustic Lens tweeters','A lit lens at each dash corner spreads sound from a 19 mm tweeter. Open one to see the dome and reflector.',[0,0,.23],sound,both(lens)],
  ['bass','Two 220 mm FrontBass woofers','A body-mounted woofer sits at the front of each footwell and uses a hollow structural member as its acoustic chamber.',[-.16,.12,-.07],sound,both(bass)],
  ['mids','Door and rear-side midrange drivers','Each door and each rear side carries a 100 mm midrange, for four drivers in the side trim.',[0,.29,.12],sound,mids],
  ['centers','Front and rear center channels','Each center position combines a 100 mm midrange with a 25 mm tweeter.',[0,0,.22],sound,centers],
  ['amplifiers','DSP and ICEpower amplifiers','The eight-channel DSP amplifier and four-channel ICEpower amplifier supply twelve channels. Enclosure position and shape are schematic.',[.15,.23,.10],sound,amps]
 ]),
 assembly('access','Door and trunk access','Soft-close hardware draws each door into the striker. At the rear, HANDS-FREE ACCESS recognizes a foot gesture when a valid key is in range.',[
  ['closing','Soft-close door locks and release cables','The powered closing aid assists the final pull into the striker. An internal cable links each cabin release to the latch.',[0,.21,.10],locks,both(latch)],
  ['trunk','Trunk lock and swivel-frame striker','The electric lock grips the striker on the swivel frame. Open it to see the jaw, mechanical release cable and closing switches.',[.22,0,.11],trunkPlate,drawSLTrunkLock],
  ['handle','Trunk release handle and camera opening','The rubber release pad sits beside the rearview camera above the license plate. Both travel with the lid.',[.14,.06,.10],trunkPlate,drawSLDeckHandle],
  ['gesture','HANDS-FREE ACCESS rear sensor','With an authorized KEYLESS-GO key nearby, moving a foot beneath the rear bumper can open or close the trunk. The sensor route is approximate.',[.18,0,-.10],manual,bumperSensor]
 ])
];
export function drawSLCabin(r,roofFraction=0){
 for(const group of slCabinGroups)for(const p of group.parts)r.tag(p.id,()=>p.draw(r,group.id==='access'?roofFraction:undefined));
}

// Service views use the installed component’s scale. Sections omit one cover so
// the rotor, release pawl and moving diaphragm remain visible during playback.
const fanBench=study('slblower','Cabin blower and filter','The inlet case supports the filter above the blower. Open the housing to see the drum wheel and electric motor.',heating,[
 part('inlet','Air inlet case','The front and rear covers guide the incoming air toward the drum.',[-.13,0,.06],r=>{
  turn(r,[0,0,0],Z,[[-.042,.091],[-.042,.096],[.034,.096],[.034,.091]],'#565a57',{n:21,start:.40,sweep:Math.PI*1.36});
  r.box(-.094,-.115,-.041,-.073,-.054,.034,'#515652');
 }),
 part('filter','Pleated cabin filter','The removable filter traps dust before the blower moves air through the evaporator.',[0,.17,.09],r=>{
  r.box(-.091,-.067,.051,.091,.067,.056,'#8b877b');
  for(let i=0;i<17;i++){const x=-.088+i*.0103;r.polygon([[x,-.064,.056],[x,.064,.056],[x+.004,.064,.065],[x+.004,-.064,.065]],'#d0c8b4',false);}
 }),
 part('motor','Blower motor and spindle','The motor spindle turns the wheel. A flange secures the motor below the drum.',[0,0,-.16],r=>{
  turn(r,[0,0,0],Z,[[-.117,0],[-.117,.037],[-.093,.041],[-.045,.041],[-.045,.082],[-.041,.082],[-.041,.006],[.001,.006],[.001,0]],'#717776',{n:17});
 }),
 part('drum','Centrifugal blower wheel','Curved vanes between the hub and rim accelerate air toward the case outlet.',[.14,0,.047],(r,t)=>{
  turn(r,[0,0,0],Z,[[-.039,.009],[-.039,.076],[-.035,.076],[-.035,.009]],'#393e3e',{n:20});
  for(let j=0;j<24;j++){const a=TAU*(j/24+t),b=a+.16;
   r.polygon([[.056*Math.cos(a),.056*Math.sin(a),-.035],[.076*Math.cos(b),.076*Math.sin(b),-.035],[.076*Math.cos(b),.076*Math.sin(b),.023],[.056*Math.cos(a),.056*Math.sin(a),.023]],'#596260',false);
  }
  turn(r,[0,0,0],Z,[[.020,.069],[.020,.076],[.024,.076],[.024,.069]],'#434846',{n:20});
 })
],'Watch the drum turn inside the stationary inlet case.');
const wooferBench=study('slfrontbass','FrontBass footwell woofer','The footwell face of the body structure provides an acoustic opening for the 220 mm woofer. The moving cone and its mount are shown in section.',sound,[
 part('mount','Body opening and mounting flange','The forward structural cavity supplies the acoustic volume. This local section represents the mounting opening.',[0,0,-.12],r=>{
  turn(r,[0,0,0],Z,[[-.065,.107],[-.065,.124],[0,.124],[0,.107]],'#8a928f',{n:24,sweep:TAU*.80});
 }),
 part('basket','Woofer basket and magnet','The fixed chassis locates the magnet behind the cone.',[.14,0,-.06],r=>{
  turn(r,[0,0,0],Z,[[-.066,0],[-.066,.042],[-.046,.047],[-.036,.043],[-.036,0]],'#515755',{n:16});
  for(let i=0;i<6;i++){
   const a=TAU*i/6,ray=(t,rad,z)=>[rad*Math.cos(a+t),rad*Math.sin(a+t),z];
   r.polygon([ray(-.08,.044,-.041),ray(.08,.044,-.041),ray(.12,.106,.004),ray(-.12,.106,.004)],'#656c69',false);
  }
  turn(r,[0,0,0],Z,[[.001,.099],[.001,.110],[.005,.110],[.005,.099]],metal,{n:24});
 }),
 part('cone','Cone, flexible surround and dust cap','The surround flexes as the voice coil drives the cone. Travel is exaggerated for visibility.',[-.12,0,.10],(r,t)=>{
  const q=.004*Math.sin(TAU*t);
  turn(r,[0,0,0],Z,[[.006,.108],[.011,.101],[.007+q*.4,.096],[-.026+q,.034],[-.016+q,.026],[-.013+q,0]],'#474b49',{n:24});
 }),
 part('coil','Voice coil and former','Current in the winding produces force in the magnet gap. The former follows the cone.',[0,.13,-.02],(r,t)=>{
  const q=.004*Math.sin(TAU*t);
  turn(r,[0,0,q],Z,[[-.052,.029],[-.052,.032],[-.029,.032],[-.029,.029]],'#9d6040',{n:18});
 })
],'Follow the cone and coil through one slow cycle.');
const doorBench=study('sldoor','Door trim and powered closing aid','The door trim diagram separates the switch bezel, pocket and speaker grille. The closing aid acts on the lock behind the trailing end of the door.',locks,[
 part('carrier','Inner trim carrier','The molded panel supports the pull handle, switch bezel and lower pocket.',[0,-.16,0],r=>panel(r,-1)),
 part('controls','Seat controls and inner release handle','The seat-shaped switches sit forward of the interior release lever.',[0,.15,.14],r=>switches(r,-1)),
 part('lock','Lock and striker','The striker enters the jaw as the door approaches the body.',[.20,-.08,.07],r=>{
  r.box(.697,-.797,.689,.775,-.761,.768,'#555b57');
  pipe(r,[[.79,-.776,.712],[.768,-.776,.712],[.768,-.776,.746],[.79,-.776,.746]],.005,metal,7);
 }),
 part('aid','Electric closing aid','The electric closing aid draws the engaged door over its last travel into the seal.',[.05,-.19,-.13],r=>{
  r.box(.591,-.794,.674,.677,-.759,.734,'#545b56');
  r.rod([.675,-.778,.718],[.729,-.778,.732],.007,metal,7);
 }),
 part('cable','Interior release cable','The flexible sheathed cable carries an interior handle pull to the lock.',[-.05,.103,.17],r=>{
  pipe(r,[[-.079,-.75,.825],[.190,-.765,.79],[.51,-.776,.761],[.731,-.776,.731]],.005,'#797976',6);
 })
]);
const splitBench=study('slcomand','COMAND display and controls','The integrated seven-inch display sits under the instrument panel hood. The console controller operates the navigation and media menus. SPLITVIEW supplies the passenger with a separate viewing angle.',brochure,[
 part('display','Seven-inch center display','The active 16:9 image measures approximately 155 by 87 mm. SPLITVIEW can display passenger entertainment while the driver sees the normal interface.',[.18,0,.10],slDisplay),
 part('head','Head unit and media controls','The media keys, dial and disc slot sit below the screen. The US brochure lists a six-disc changer and an SD card reader.',[-.12,0,-.12],r=>{
  r.box(-.450,-.122,.689,-.296,.122,.784,black);
  r.box(-.296,-.110,.769,-.293,.11,.774,metal);
  for(let i=0;i<5;i++)for(const side of [-1,1]) r.box(-.297,side*.087-.016,.700+i*.012,-.292,side*.087+.016,.706+i*.012,'#525353');
  roundFace(r,[-.295,0,.735],X,12,.009,.014,metal);
 }),
 part('knob','Rotary console controller','Turn the controller to move through menus and press the top to select.',[0,.14,.08],r=>{
  r.box(.058,-.047,.514,.162,.047,.532,black);
  roundFace(r,[.111,0,.534],Z,18,.015,.031,metal);
 }),
 part('wristrest','Console handrest','The handrest behind the controller conceals the switch for the retractable roof.',[.12,0,.12],wristrest)
]);

const columnBench=study('slcolumn','Power steering-column adjustment','A fixed carrier supports the sliding upper tube. The column has separate electric drives for reach and height. Drive housings and travel are represented schematically.',steering,[
 part('carrier','Fixed carrier and outer sleeve','The carrier fixes the outer sleeve to the instrument-panel support.',[-.11,0,0],columnMount),
 part('shaft','Telescoping upper shaft','The upper shaft moves axially as the wheel moves toward or away from the driver.',[.14,0,.05],columnTube),
 part('reach','Fore/aft adjustment motor','The reach drive moves the upper column along its axis.',[0,.12,.04],r=>columnDrive(r,true)),
 part('height','Height adjustment motor','The second drive changes the height of the steering wheel.',[0,-.12,-.05],r=>columnDrive(r,false))
],'Follow the upper shaft through a reach-adjustment cycle.');

// An enlarged cross-section of a short run of blade, with outgoing fluid shown
// only on the leading side, as in plate P82.35-2701-00.
const washerStudy=study('slwasher','MAGIC VISION CONTROL blade','Hoses inside the arm supply a pair of channels along the blade. The control system selects the leading edge on each stroke. With the roof down it shortens the pump pulses.',washer,[
 part('adapter','Arm adapter and two feed hoses','Washer fluid enters the blade through the coupling in the wiper arm. The two passages supply opposite sides of the blade.',[.028,0,.028],r=>{
  r.box(-.011,-.022,.014,.011,.026,.026,'#505759');
  for(const s of [-1,1])pipe(r,[[s*.006,-.087,.032],[s*.006,-.06,.032],[s*.006,-.032,.023],[s*.006,-.016,.017]],.0030,'#4c5558',7);
 }),
 part('channels','Washer channels and outlets','Each side of the blade carries a fluid channel with outlets along its length. The enlarged section shows a representative set.',[-.032,0,.020],r=>{
  for(const s of [-1,1]){
   r.rod([s*.006,-.109,.012],[s*.006,.109,.012],.0039,'#57686b',9);
   for(let j=-4;j<=4;j++)r.rod([s*.006,j*.023,.012],[s*.011,j*.023,.009],.0017,'#2a393d',6);
  }
 }),
 part('lip','Rubber wiping lip and blade back','Spring support along the back holds the rubber edge against the windshield.',[0,0,-.022],r=>{
  r.profile([[-.0025,.0004],[.0025,.0004],[.003,.006],[.008,.007],[.008,.009],[-.008,.009],[-.008,.007],[-.003,.006]],-.111,.111,'#2b3034');
  r.box(-.007,-.109,.013,.007,.109,.0155,'#7f898b');
 }),
 part('heater','Blade heater','The heated washer package warms the blades and washer hoses. The heater route in this section is schematic.',[.024,0,-.021],r=>{
  pipe(r,[[-.0035,-.097,.016],[-.0035,.098,.016],[.0035,.098,.016],[.0035,-.097,.016]],.0013,'#b88158',7);
 }),
 part('wash','Active outlet bank','Water leaves the leading edge. The active row changes when the wiping direction reverses.',[-.022,0,-.011],(r,t)=>{
  const s=t%1<.5?1:-1;
  for(let j=-4;j<=4;j++)r.rod([s*.011,j*.023,.009],[s*.023,j*.023+.0008,.00065],.0012,'#71b7c6',6);
 })
],'Blue traces mark the outlets feeding the upward stroke, then the return stroke.');

export const slCabinStudies={
 'access.trunk':trunkLockStudy,
 ...refrigerantStudies,
 'visibility.linkage':wiperDriveStudy,'visibility.left-blade':washerStudy,'visibility.right-blade':washerStudy,
 'cabin.wheel':slWheelStudy(brochure),'cabin.instruments':slInstrumentStudy(brochure),'cabin.column':columnBench,
 'climate.blower':fanBench,'audio.bass':wooferBench,'audio.lenses':acousticLensStudy,'cabin.doors':doorBench,'access.closing':doorBench,'cabin.display':splitBench
};
