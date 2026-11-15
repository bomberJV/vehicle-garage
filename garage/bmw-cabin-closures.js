// US 2003 E46 325Ci coupé. Sources establish architecture; dimensions are reconstructed.
import {part,study,cyl,sleeve,TAU} from './mechanism-shapes.js';
import {fittedWindow} from './exterior-trim.js';
import {tint,ellipsoid,ellipse} from './road-primitives.js';

const plate='https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/vehicle_trim/door_window_lifting_mechanism.html';
const brochure='https://xr793.com/wp-content/uploads/2022/07/2003-BMW-3-Series-Coupe-CN.pdf';
export const bmwCabinSources={
 vent:{label:'BMW ETK · 2003 M54 coupé rear vent glass and electric drive, plate 51_3687',url:plate},
 manual:{label:'BMW · 2003 coupé owner’s manual, electric tilt-out windows, p. 40',url:'https://bmw330ci.net/the330ci/2003Manual-3SeriesCoupe.pdf#page=40'},
 cabin:{label:'BMW · 2003 North American coupé brochure, cabin photograph, p. 5',url:brochure+'#page=5'}
};
const leather='#44474a',bolster='#3b3f43',stitch='#686c6e',plastic='#2e3337',black='#252b30',silver='#a9afb0',trim='#737d81';
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const norm=a=>Math.hypot(...a);
const unit=a=>a.map(v=>v/norm(a));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((v,q,i)=>v+q*b[i],0);
const line=(r,p,rad,color)=>{for(let i=1;i<p.length;i++)r.rod(p[i-1],p[i],rad,color,8);};
const Z=[0,0,1],Y=[0,1,0];

function rings(r,rows,color){
 r.polygon(rows[0].slice().reverse(),tint(color,.72),false);
 for(let j=1;j<rows.length;j++)for(let i=0;i<rows[j].length;i++){
  const k=(i+1)%rows[j].length;
  r.polygon([rows[j-1][i],rows[j-1][k],rows[j][k],rows[j][i]],tint(color,.85+.12*j/(rows.length-1)+.07*Math.cos(i*TAU/rows[j].length)),false);
 }
 r.polygon(rows.at(-1),tint(color,1.05),false);
}
function pad(r,levels,color){
 const rounded=v=>Math.sign(v)*Math.abs(v)**.43;
 rings(r,levels.map(([x,y,z,l,w])=>Array.from({length:16},(_,i)=>{const a=i*TAU/16;return[x+l*rounded(Math.cos(a)),y+w*rounded(Math.sin(a)),z];})),color);
}
function seatRails(r,cy){
 for(const s of [-1,1]){
  const yy=cy+s*.155;
  r.box(-.34,yy-.014,.378,.265,yy+.014,.399,trim);
  r.box(-.24,yy-.011,.399,.219,yy+.011,.417,silver);
  for(const xx of [-.31,.235])cyl(r,[xx,yy,.390],Z,0,.014,.011,silver,6);
 }
}
function frontSeat(r,cy){
 seatRails(r,cy);
 pad(r,[[-.040,cy,.419,.223,.199],[-.045,cy,.454,.245,.228],[-.039,cy,.523,.241,.225],[-.042,cy,.543,.225,.204]],leather);
 // The cushion has two side bolsters and a separately contoured centre pad.
 for(const s of [-1,1])pad(r,[[-.038,cy+s*.184,.514,.210,.040],[-.045,cy+s*.189,.559,.196,.045],[-.037,cy+s*.183,.585,.153,.031]],bolster);
 pad(r,[[-.069,cy,.542,.170,.149],[-.068,cy,.560,.164,.143]],leather);
 // Tapered back with side wings, not a rectangular slab.
 pad(r,[[.163,cy,.538,.063,.215],[.190,cy,.636,.072,.225],[.231,cy,.873,.067,.224],[.268,cy,1.032,.059,.202],[.286,cy,1.084,.046,.154]],leather);
 for(const s of [-1,1])pad(r,[[.113,cy+s*.173,.592,.050,.045],[.148,cy+s*.191,.750,.067,.047],[.201,cy+s*.187,.956,.060,.040],[.234,cy+s*.158,1.031,.041,.029]],bolster);
 for(const z0 of [.697,.848,.990]){
  const xx=.163+(z0-.538)*.22-.071;
  line(r,[[xx,cy-.145,z0],[xx-.006,cy,z0-.005],[xx,cy+.145,z0]],.0019,stitch);
 }
 for(const s of [-1,1])r.rod([.292,cy+s*.066,1.072],[.306,cy+s*.066,1.135],.006,silver,9);
 pad(r,[[.308,cy,1.115,.048,.120],[.317,cy,1.144,.059,.135],[.329,cy,1.236,.053,.127],[.329,cy,1.253,.039,.100]],leather);
 // Coupe seat-back release and inboard buckle; the backrest folds for rear access.
 r.box(.267,cy+Math.sign(cy)*.207,1.011,.316,cy+Math.sign(cy)*.207+.011,1.032,plastic);
 const iy=cy-Math.sign(cy)*.251;r.rod([.18,iy,.428],[.18,iy,.572],.012,black,8);r.box(.151,iy-.018,.563,.194,iy+.018,.609,black);
 r.box(.151,iy-.019,.607,.194,iy+.019,.614,'#99504b');
}
function rearSeats(r){
 // The seat pan is shallow above the tank/service covers; the old deep
 // upholstery block incorrectly extended down through that compartment.
 pad(r,[[.918,0,.554,.220,.611],[.927,0,.559,.241,.628],[.923,0,.562,.232,.608]],leather);
 for(const s of [-1,1]){
  const cy=s*.346;
  pad(r,[[.920,cy,.565,.211,.252],[.928,cy,.588,.193,.231]],leather);
  pad(r,[[1.108,cy,.568,.053,.272],[1.152,cy,.758,.066,.270],[1.216,cy,1.021,.054,.246],[1.227,cy,1.052,.039,.215]],leather);
  for(const z0 of [.730,.898])line(r,[[1.105+(z0-.568)*.24,cy-.184,z0],[1.100+(z0-.568)*.24,cy+.184,z0]],.002,stitch);
  for(const q of [-1,1])r.rod([1.227,cy+q*.052,1.044],[1.239,cy+q*.052,1.090],.0055,silver,8);
  pad(r,[[1.245,cy,1.075,.039,.104],[1.253,cy,1.100,.051,.119],[1.262,cy,1.192,.043,.105]],leather);
 }
 pad(r,[[1.105,0,.633,.068,.083],[1.172,0,.880,.055,.090],[1.205,0,1.019,.037,.086]],bolster);
}
function dial(r,c,rad){
 r.discX(c[0],c[1],c[2],rad,silver,30);r.discX(c[0]+.001,c[1],c[2],rad*.93,black,30);
 for(let i=0;i<=10;i++){
  const a=.48+i*4.40/10,p=d=>[c[0]+.003,c[1]+Math.sin(a)*rad*d,c[2]+Math.cos(a)*rad*d];r.rod(p(.79),p(.90),.0016,'#c1c7c4',5);
 }
 r.rod([c[0]+.005,c[1],c[2]],[c[0]+.005,c[1]-.019,c[2]+rad*.54],.0022,'#b56551',6);
}
function dashboard(r){
 const sections=[];
 for(let i=0;i<=20;i++){
  const yy=-.715+i*.0715,u=yy/.715;
  sections.push([[-.795+.047*u*u,yy,.898],[-.645+.025*u*u,yy,1.027-.018*u*u],[-.484+.029*u*u,yy,1.010-.018*u*u],[-.444+.035*u*u,yy,.904],[-.503,yy,.799]]);
 }
 for(let i=1;i<sections.length;i++)for(let j=1;j<5;j++)r.polygon([sections[i-1][j-1],sections[i][j-1],sections[i][j],sections[i-1][j]],j===1?'#41474b':j===2?'#3b4247':plastic,false);
 // Double binnacle: a large speedometer/tachometer and smaller outer gauges.
 r.profile([[-.645,.967],[-.630,1.057],[-.546,1.090],[-.441,1.067],[-.419,.961]],-.614,-.155,black);
 r.box(-.416,-.585,.979,-.412,-.180,1.052,black);
 dial(r,[-.410,-.470,1.013],.047);dial(r,[-.410,-.320,1.013],.047);
 dial(r,[-.410,-.558,1.012],.026);dial(r,[-.410,-.229,1.012],.026);
 r.box(-.407,-.435,.967,-.403,-.342,.979,'#8f7651');
 // Vents are raised frames with individual louvres; continuous trim crosses the dash.
 for(const [yy,w] of [[-.657,.066],[-.075,.066],[.075,.066],[.655,.066]]){
  r.box(-.439,yy-w,.944,-.428,yy+w,.991,black);
  for(let j=0;j<4;j++)r.box(-.425,yy-w+.008,.949+j*.010,-.422,yy+w-.008,.952+j*.010,trim);
 }
 r.box(-.444,.168,.927,-.432,.655,.949,'#6a7478');
 r.profile([[-.451,.810],[-.448,.906],[-.432,.918],[-.406,.902],[-.411,.814]],.177,.645,'#3d4448');
 r.rod([-.408,.347,.876],[-.408,.450,.876],.006,trim,8);
 // Centre stack inclines toward the tunnel. Two distinct radio / climate faces.
 r.profile([[-.458,.963],[-.430,.963],[-.380,.704],[-.414,.704]],-.151,.151,plastic);
 for(const [z0,h] of [[.866,.054],[.780,.056]]){
  const xx=-.407-(z0-.780)*.20;r.box(xx,-.124,z0,xx+.008,.124,z0+h,black);
  r.box(xx+.009,-.069,z0+.019,xx+.012,.068,z0+.035,'#806f4b');
  for(const side of [-1,1])r.discX(xx+.014,side*.098,z0+h*.51,.013,trim,15);
 }
 const c=[-.257,-.374,.964],point=a=>[c[0]-.047*Math.sin(a),c[1]+.178*Math.cos(a),c[2]+.163*Math.sin(a)];
 for(let i=0;i<40;i++)r.rod(point(i*TAU/40),point((i+1)*TAU/40),.014,black,8);
 for(const a of [.10,Math.PI-.10,Math.PI*1.48,Math.PI*1.52])r.rod(c,point(a),.017,plastic,8);
 ellipsoid(r,c,[.026,.070,.050],plastic,16,6);
 r.discX(c[0]+.028,c[1],c[2],.014,silver,18);
 r.rod([-.464,-.374,.849],c,.032,plastic,12);
 for(const y0 of [-.467,-.289])r.rod([-.393,y0,.945],[-.331,y0+Math.sign(y0+.37)*.017,.952],.005,black,8);
}
function console(r){
 pad(r,[[-.005,0,.374,.423,.113],[-.013,0,.499,.421,.118],[-.029,0,.546,.409,.108]],plastic);
 r.profile([[-.411,.548],[-.390,.573],[-.128,.576],[-.097,.542]],-.106,.106,'#6f797c');
 pad(r,[[-.258,0,.567,.071,.054],[-.254,0,.593,.047,.038],[-.250,0,.626,.024,.021]],black);
 r.rod([-.250,0,.620],[-.238,0,.631],.010,silver,8);ellipsoid(r,[-.237,0,.650],[.023,.023,.034],black,16,6);
 // Four individual side-window switches flank the selector.
 for(const side of [-1,1])for(const xx of [-.329,-.190])r.box(xx-.024,side*.080-.013,.576,xx+.024,side*.080+.013,.588,black);
 r.rod([-.010,-.073,.557],[.183,-.073,.607],.017,black,10);
 for(const xx of [.071,.188]){cyl(r,[xx,.037,.552],Z,0,.007,.040,black,24);sleeve(r,[xx,.037,.559],Z,-.002,.004,.041,.033,trim,24);}
 pad(r,[[.301,0,.558,.133,.095],[.308,0,.633,.145,.104],[.309,0,.659,.137,.097]],leather);
}
function shelfAndSills(r){
 // The floor is formed around the gearbox and propeller shaft, not a slab
 // through the driveline. Each strip has a separate underside surface.
 const stations=[[-.80,.225,.696,.360],[-.43,.200,.636,.360],[.03,.120,.505,.360],[.280,.106,.495,.360],[.405,.095,.568,.550],[1.12,.090,.568,.550],[1.37,.090,.568,.550]];
 const row=([xx,w,h,floor],lower=0)=>[[-.70,floor],[-w,floor],[-w,Math.max(floor,h-.040)],[-w*.60,h],[w*.60,h],[w,Math.max(floor,h-.040)],[w,floor],[.70,floor]].map(([yy,zz])=>[xx,yy,zz-lower]);
 for(let i=1;i<stations.length;i++)for(let j=1;j<8;j++){
  const a=row(stations[i-1]),b=row(stations[i]),c=row(stations[i-1],.017),d=row(stations[i],.017);
  r.polygon([a[j-1],b[j-1],b[j],a[j]],'#383c3e',false);
  r.polygon([c[j],d[j],d[j-1],c[j-1]],'#41494b',false);
 }
 for(const s of [-1,1]){
  r.rod([-.765,s*.731,.383],[.648,s*.731,.383],.023,plastic,10);
  r.box(-.642,s*.722-.019,.395,.419,s*.722+.019,.402,silver);
  r.profile([[.695,.594],[.711,.942],[1.388,.966],[1.385,.624]],s*.699-.008,s*.699+.008,plastic);
  r.rod([.784,s*.683,.763],[1.076,s*.683,.782],.025,leather,9);
  r.rod([.686,s*.681,1.171],[.767,s*.571,.652],.013,'#46494b',8);
 }
 r.profile([[1.244,1.020],[1.740,1.008],[1.800,.990],[1.253,.987]],-.650,.650,'#41464a');
 for(const s of [-1,1]){
  const c=[1.450,s*.386,1.017];ellipse(r,c,[.098,0,0],[0,.075,0],1,.78,black,28);
  for(let i=0;i<6;i++)r.rod([c[0]-.063+i*.025,c[1]-.041,c[2]+.002],[c[0]-.063+i*.025,c[1]+.041,c[2]+.002],.0015,trim,5);
 }
}
function doorTrim(r,side){
 const y=side*.707;
 r.profile([[-.705,.411],[-.704,.867],[-.613,.899],[.538,.921],[.592,.869],[.572,.424]],y-.009,y+.009,plastic);
 r.profile([[-.624,.804],[-.610,.862],[.511,.885],[.529,.828]],y-side*.012,y-side*.020,'#50585c');
 line(r,[[-.611,y-side*.024,.845],[-.338,y-side*.027,.842],[.493,y-side*.023,.866]],.009,trim);
 r.profile([[-.304,.708],[-.196,.728],[-.048,.822],[.030,.828],[-.116,.685],[-.302,.678]],y-side*.037,y-side*.015,leather);
 line(r,[[-.224,y-side*.055,.700],[.335,y-side*.055,.736],[.446,y-side*.040,.758]],.024,leather);
 line(r,[[-.524,y-side*.028,.831],[-.451,y-side*.028,.833]],.008,silver);
 r.profile([[-.614,.450],[-.590,.524],[.466,.533],[.515,.475],[.474,.435]],y-side*.046,y-side*.014,black);
 cyl(r,[-.566,y-side*.027,.615],Y,-.004,.004,.062,black,24);
 for(let i=-3;i<=3;i++)r.rod([-.566+i*.014,y-side*.035,.579],[-.566+i*.014,y-side*.035,.651],.0018,trim,5);
}
function cowlReturn(r){
 // The crash pad returns all the way to the bowed windscreen foot. Without
 // this narrow surface the engine-bay wiring is visible through the glass.
 const front=u=>[-.875-.04225*(1-u*u),u*.806,.952-.027*(1-u*u)];
 const rear=u=>[-.795+.047*u*u,u*.715,.899];
 for(let i=0;i<20;i++){
  const a=i/10-1,b=(i+1)/10-1;
  r.polygon([front(a),front(b),rear(b),rear(a)],'#353c40',false);
  const low=p=>[p[0],p[1],p[2]-.012];
  r.polygon([low(front(a)),low(rear(a)),low(rear(b)),low(front(b))],'#30373b',false);
 }
}
export const bmwCabinParts=[
 ['front-seats','Coupé front seats','Contoured cushions, reclining seatbacks, separate head restraints, rails and outboard rear-access releases.'],
 ['rear-bench','Split rear bench','Two shaped outer seating positions, a centre section and separate rear head restraints.'],
 ['dashboard','Driver’s cockpit','The E46 instrument binnacle, raked three-spoke wheel, centre vents, radio and climate controls.'],
 ['console','Centre console and window switches','Four window switches flank the selector; the handbrake, cupholders and armrest occupy the tunnel. Transmission-specific trim is illustrative.'],
 ['cabin-trim','Cabin floor, sills and rear shelf','Side trim carries the rear armrests. The parcel shelf and speakers sit beneath the rear screen.'],
 ['quarter-left','Left electric rear vent window','The coupé quarter pane pivots outward at the rear. Open its electric drive and attachment hardware.'],
 ['quarter-right','Right electric rear vent window','The right-hand motor and attachment mirror the left. This is a hinged vent pane, not a vertically lowered convertible window.']
].map(([id,name,description])=>({id:'body.'+id,name,description,source:id.startsWith('quarter')?bmwCabinSources.vent:bmwCabinSources.cabin,category:'exterior'}));
export function drawBmwCabin(r){
 // The inspection route takes the seats through the vacated door apertures.
 r.tag('body.front-seats',()=>{for(const s of [-1,1])r.rigid('front-seat-'+(s<0?'left':'right'),[0,s*.55,.04],()=>r.instance(s<0?'front-left':'front-right',()=>frontSeat(r,s*.362)));});
 r.rigid('rear-seat-bench',[.10,0,.35],()=>r.tag('body.rear-bench',()=>rearSeats(r)));
 r.rigid('dashboard',[.05,0,.40],()=>r.tag('body.dashboard',()=>dashboard(r)));
 r.rigid('centre-console',[.12,0,.32],()=>r.tag('body.console',()=>{
  const fitted=Object.create(r);fitted.polygon=(points,...args)=>r.polygon(points.map(([x,y,z])=>{
   const t=Math.max(0,Math.min(1,(.12-x)/.55)),height=z+.105*t*t*(3-2*t);
   const rearStep=.495+.073*Math.max(0,Math.min(1,(x-.280)/.125));
   return[x,y,x>.280?Math.max(height,rearStep+.006):height];
  }),...args);console(fitted);
 }));
 r.rigid('cabin-lining',[0,0,-.20],()=>r.tag('body.cabin-trim',()=>shelfAndSills(r)));
 r.tag('body.structure',()=>cowlReturn(r));
 for(const s of [-1,1])r.rigid('front-door-'+(s<0?'left':'right'),[-.12,s*.58,.035],()=>r.tag(s<0?'body.door':'body.front-right',()=>doorTrim(r,s)));
}

const outlines=new Map();
const fallback=[[.585,.7992,.986],[.734,.6576,1.328],[.923,.6527,1.313],[1.081,.6557,1.272],[1.250,.6990,1.185],[1.332,.7395,1.114],[1.373,.7643,1.063],[1.337,.7864,1.011],[1.245,.7924,.996]];
const outlineFor=side=>outlines.get(side)||fallback.map(([x,y,z])=>[x,side*y,z]);
export const bmwVentMaxAngle=.075;
export function bmwVentPoint(p,outline,side,opening){
 const a=outline[0],axis=unit(outline[1].map((v,i)=>v-a[i])),d=p.map((v,i)=>v-a[i]);
 const angle=side*bmwVentMaxAngle*Math.max(0,Math.min(1,opening)),c=Math.cos(angle),s=Math.sin(angle),k=cross(axis,d),along=dot(axis,d)*(1-c);
 return a.map((v,i)=>v+d[i]*c+k[i]*s+axis[i]*along);
}
function ventAttachment(outline){
 let i=0;for(let n=1;n<outline.length;n++)if(outline[n][0]>outline[i][0])i=n;
 return mix(outline[i],outline[(i+outline.length-1)%outline.length],.22);
}
export function bmwVentLinkage(outline,side,opening){
 const closed=ventAttachment(outline),tip=bmwVentPoint(closed,outline,side,opening),base=plus(closed,[.007,-side*.059,-.010]);
 const d=tip.map((v,i)=>v-base[i]),length=.081,mid=mix(base,tip,.5),perp=unit(cross(d,[0,0,1]));
 const height=Math.sqrt(Math.max(0,length*length-dot(d,d)/4));
 return {base,knee:plus(mid,perp.map(v=>v*height)),tip,length};
}
function ventSeal(r,outline,side){
 const inner=outline.map(p=>plus(p,[0,-side*.006,0]));
 line(r,[...inner,inner[0]],.0055,black);
 // The lower railing has its own rubber gasket, separate from the glass fittings.
 line(r,[inner.at(-1),inner[0]],.0075,plastic);
}
function ventGlass(r,outline,side,opening){
 const proxy=Object.create(r);proxy.polygon=(points,...args)=>r.polygon(points.map(p=>bmwVentPoint(p,outline,side,opening)),...args);
 fittedWindow(proxy,outline,{radius:.010,seal:.003,sideCrown:side*.002,frameless:true});
}
function ventHinges(r,outline,side){
 for(const t of [.12,.85]){
  const c=mix(outline[0],outline[1],t);cyl(r,c,Y,-.010,.010,.011,silver,12);
  sleeve(r,c,Y,-.012,.012,.014,.010,black,14);
 }
}
function ventMotor(r,outline,side){
 const {base}=bmwVentLinkage(outline,side,0),c=plus(base,[.013,-side*.026,-.014]);
 r.box(c[0]-.032,c[1]-.028,c[2]-.028,c[0]+.032,c[1]+.028,c[2]+.029,plastic);
 cyl(r,c,Y,-.031,.031,.029,black,18);
 for(const xx of [-.029,.029])cyl(r,plus(c,[xx,0,.022]),Y,-.034,.034,.006,silver,8);
 r.box(c[0]-.029,c[1]-side*.050-.009,c[2]-.026,c[0]-.009,c[1]-side*.050+.009,c[2]-.005,plastic);
}
function ventArms(r,outline,side,opening){
 const {base,knee,tip}=bmwVentLinkage(outline,side,opening);
 r.rod(base,knee,.0065,plastic,9);r.rod(knee,tip,.0065,silver,9);
 for(const c of [base,knee,tip])cyl(r,c,[0,0,1],-.008,.008,.009,silver,12);
}
function ventBoss(r,outline,side,opening){
 const c=bmwVentPoint(ventAttachment(outline),outline,side,opening);
 cyl(r,c,Y,-.013,.013,.016,black,16);cyl(r,c,Y,-.015,.015,.010,silver,14);
}
export function drawBmwQuarterWindow(r,side,outline){
 outlines.set(side,outline.map(p=>p.slice()));
 const opening=r.build?.bmwVentPosition==='open'?1:0,key='body.quarter-'+(side<0?'left':'right');
 r.tag('body.structure',()=>{ventSeal(r,outline,side);ventHinges(r,outline,side);});
 r.rigid('quarter-'+(side<0?'left':'right'),[.18,side*.27,.12],()=>r.tag(key,()=>{
  ventGlass(r,outline,side,opening);ventMotor(r,outline,side);ventArms(r,outline,side,opening);ventBoss(r,outline,side,opening);
 }));
}
function ventStudy(side){
 const word=side<0?'left':'right',at=()=>outlineFor(side),u=t=>(1-Math.cos(TAU*t))/2;
 const p=(id,name,description,offset,draw)=>part(id,name,description,offset,draw);
 const view=study('bmw-vent-'+word,'E46 coupé · '+word+' rear vent window','The forward fittings locate the glass. The electric drive at the rear moves an articulated arm to push the trailing edge out. The ETK plate identifies the pane, handed drive, attachment fittings, seals and caps. Travel and linkage dimensions are reconstructed.',bmwCabinSources.vent,[
  p('glass','Hinged quarter pane','The pane rotates about its sloping forward hinge line. It does not slide down into the rear quarter.',[0,side*.20,.35],(r,t)=>ventGlass(r,at(),side,u(t))),
  p('hinges','Forward glass fittings','Two fittings retain the leading edge at the B-pillar. They remain at fixed positions throughout the movement.',[-.35,0,.12],r=>ventHinges(r,at(),side)),
  p('seal','Body seal and lower railing gasket','The fixed seal follows the opening as the glass moves away from its rear edge. The lower railing gasket is a separate catalog item.',[0,-side*.24,-.20],r=>ventSeal(r,at(),side)),
  p('motor','Handed electric vent drive','BMW lists left drive 67158238743 and right drive 67158238744 at callout 12. The sealed motor internals are omitted.',[.29,-side*.28,.12],r=>ventMotor(r,at(),side)),
  p('arm','Articulated drive arm','The arm bridges the fixed drive and glass fitting. Both segments retain their length while the joint changes angle. The exact factory cam and lever profile are not reproduced.',[.29,side*.27,.04],(r,t)=>ventArms(r,at(),side,u(t))),
  p('glass-fitting','Glass drive fitting','The rear attachment travels with the pane. Its through-glass fitting transfers force from the drive arm.',[.43,side*.22,.22],(r,t)=>ventBoss(r,at(),side,u(t))),
  p('sealing-rings','Attachment sealing rings','The plate separates the O-rings at callout 13 from the drive and covering caps.',[.25,side*.34,-.18],(r,t)=>{const c=bmwVentPoint(ventAttachment(at()),at(),side,u(t));for(const s of [-1,1])sleeve(r,c,Y,s*.016,s*.020,.016,.010,'#797f7b',18);}),
  p('caps','Inner and outer covering caps','Separate caps cover the rear glass fitting at callout 14. Their offsets are enlarged in this view.',[.42,side*.36,-.03],(r,t)=>{const c=bmwVentPoint(ventAttachment(at()),at(),side,u(t));for(const s of [-1,1])cyl(r,c,Y,s*.024,s*.029,.017,plastic,16);}),
  p('connector','Two-pole motor connector','Callouts 16–18 identify the socket housing and contacts. The short lead ends at the drive; a complete door-control wiring diagram is not implied.',[.12,-side*.40,-.22],r=>{const {base}=bmwVentLinkage(at(),side,0),c=plus(base,[.004,-side*.072,-.033]);r.box(c[0]-.018,c[1]-.012,c[2]-.012,c[0]+.018,c[1]+.012,c[2]+.012,black);for(const s of [-1,1])line(r,[plus(c,[s*.005,0,0]),plus(c,[s*.005,side*.025,.012]),plus(base,[-.014,-side*.048,-.015])],.0028,s<0?'#6d665b':'#755b4c');})
 ],'The rear edge swings outward and returns to its seal. The front hinge line stays fixed; the motor and glass meet through a constant-length articulated arm.');
 view.viewAngle=side<0?[-.22,.22]:[.16,.22];return view;
}
const ventViews=new Map();
export function getBmwCabinDetail(vehicle,id){
 if(vehicle!=='bmw325ci')return null;
 const side=id==='body.quarter-left'?-1:id==='body.quarter-right'?1:0;
 if(!side)return null;
 if(!ventViews.has(side))ventViews.set(side,ventStudy(side));return ventViews.get(side);
}
