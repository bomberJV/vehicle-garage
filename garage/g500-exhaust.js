import {m113Stations} from './g500-m113-geometry.js';
import {drawPortSeal,gasketPhoto,gasketDrawing} from './g500-exhaust-seal.js';
// WIS GF49.00-P-2000GB, plan view. -Y is the driver's side; X increases aft.
// The path is fitted to the illustrated chassis. Flanges, bends and shell sizes are schematic.
import {basis,point,turn,sleeve,cyl,tint,unit,add,x,y,z,part,study} from './mechanism-shapes.js';

const wisBase='https://charm.li/Mercedes%20Benz/2002/G%20500%20%28463.249%29%20V8-5.0L%20%28113.962%29/Repair%20and%20Diagnosis/';
const factory={label:'Mercedes-Benz WIS GF49.00-P-2000GB · M113.962 in the 463.249',url:wisBase+'Engine%2C%20Cooling%20and%20Exhaust/Exhaust%20System/Description%20and%20Operation/'};
const epc={label:'Mercedes-Benz Classic USA · 2002 G500 exhaust fittings',url:'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/exhaust--exhaust-components'};
const photo={label:'2002 G500 · U.S. undercarriage photograph',url:'https://bringatrailer.com/wp-content/uploads/2018/03/1520349820cf2af4d3f8707cDSC_0053.jpg'};
const outletRef={label:'March 2002 G500 road test · left-side outlet',url:'https://www.auto123.com/en/news/mercedes-benz-g500-dare-to-be-original/30886/?page=3'};
const sensors={label:'2002 G500 · oxygen sensor locations',url:wisBase+'Sensors%20and%20Switches/Sensors%20and%20Switches%20-%20Powertrain%20Management/Sensors%20and%20Switches%20-%20Computers%20and%20Control%20Systems/Oxygen%20Sensor/Locations/O2%20Sensor%20Downstream%20TWC%20%5BKAT%5D%2C%20Left/'};
const iron='#76675c',pipe='#88847b',seam='#aaa89c',can='#9a9b90',black='#384144',core='#b29c83',shield='#b9b9ac';
const cx=-2.85/2+.19;

const sides=[[-1,'left','Left'],[1,'right','Right']];
const difference=(a,b)=>a.map((v,i)=>v-b[i]);

// Rings share vertices across bends and the lip opens into a recessed bore.
function pipeRun(r,points,radius,color,n=12){
 const rings=points.map((p,i)=>{
   const dir=difference(points[Math.min(i+1,points.length-1)],points[Math.max(i-1,0)]);
   const b=basis(dir);
   return Array.from({length:n},(_,j)=>point(p,b,0,radius,2*Math.PI*j/n));
 });
 for(let i=1;i<rings.length;i++)for(let j=0;j<n;j++){
   const k=(j+1)%n;
   r.polygon([rings[i-1][j],rings[i][j],rings[i][k],rings[i-1][k]],tint(color,.85+.14*Math.sin(2*Math.PI*j/n+.85)),false);
 }
}
function lip(r,end,axis,radius){
 sleeve(r,end,axis,-.012,0,radius*1.045,radius*.88,seam,16);
 turn(r,end,axis,[[-.044,0],[-.044,radius*.88],[0,radius*.88]],black,{n:16});
}
function manifoldExit(s){return [cx+.35,s*.53,.733];}
const headPort=(station,side)=>[cx+station+side*.009,side*.50,.945];
function manifold(r,s,only){
 for(const station of m113Stations){
   const p=headPort(station,s),q=[p[0]+.045,s*.549,.905],j=[p[0]+.09,s*.546,.847];
   if(!only||only==='gaskets')drawPortSeal(r,p,s,!only);
   if(only&&only!=='casting')continue;
   // The rear face of the port flange is against the cylinder head.
   turn(r,p,y,[[0,.037],[s*.011,.037],[s*.011,.022]],iron,{n:8});
   pipeRun(r,[p,q,j],.022,iron,10);
 }
 if(only&&only!=='casting')return;
 pipeRun(r,[[cx+m113Stations[0]+s*.009+.09,s*.546,.847],[cx+.33,s*.546,.847],[cx+.354,s*.54,.796],manifoldExit(s)],.032,iron);
 cyl(r,manifoldExit(s),z,-.006,.007,.045,seam,10);
}
export function drawG500ExhaustManifold(r){for(const [s] of sides)manifold(r,s);}
const pipeY=.694,pipeZ=.457;
const catalystStations=[-.553,-.286];
const firstIn=s=>[-.71,s*pipeY,pipeZ];
const endCats=s=>[-.115,s*pipeY,pipeZ];
const frontMufflerEnd=s=>[.47,s*pipeY,pipeZ];
const mainZ=.330;
const leftIn=[.80,-.195,mainZ],rightIn=[.855,.195,mainZ];
const tailStart=[.90,-.195,mainZ],tailEnd=[.715,-.877,.359];
// Each branch drops under its trailing arm before turning in to the shell.
const branchEnds=s=>s>0?[frontMufflerEnd(s),[.63,.688,.456],[.70,.660,.400],[.76,.600,.362],[.80,.500,.356],[.852,.384,.356],rightIn]:
  [frontMufflerEnd(s),[.555,-.689,.457],[.62,-.660,.400],[.68,-.600,.362],[.74,-.480,.353],[.772,-.386,.351],leftIn];
function catalyst(r,c,axis,length,radius,cut=false){
 const h=length/2,shape=[[-h,.028],[-h+.012,.032],[-h+.040,radius],[-h+.055,radius*1.02],[h-.043,radius*1.02],[h-.017,.036],[h,.028]];
 turn(r,c,axis,shape,can,{n:cut?22:12,...(cut?{start:Math.PI*1.46,sweep:Math.PI*1.43}:{})});
}
function converterPipe(r,s){
 const start=manifoldExit(s);
 pipeRun(r,[start,[start[0]+.004,s*.535,.686],[-.833,s*.589,.548],firstIn(s)],.028,pipe);
 pipeRun(r,[firstIn(s),endCats(s)],.0275,pipe);
 for(const [i,station] of catalystStations.entries())catalyst(r,[station,s*pipeY,pipeZ],x,i?.195:.176,i?.068:.061);
}
function seamCan(r,c,axis,length,radius,color,n=16){
 const h=length/2;
 turn(r,c,axis,[[-h,.028],[-h,radius*.91],[-h+.008,radius],[h-.008,radius],[h,radius*.91],[h,.028]],color,{n});
 for(const t of [-h+.012,h-.012])turn(r,c,axis,[[t-.003,radius],[t-.002,radius+.003],[t+.002,radius+.003],[t+.003,radius]],seam,{n});
}
function frontMuffler(r,s){
 const start=endCats(s),end=frontMufflerEnd(s);
 pipeRun(r,[start,end],.028,pipe);
 seamCan(r,[.192,s*pipeY,pipeZ],x,.505,.086,can);
}
function ovalMuffler(r){
 // The two entries occupy opposite end plates. The outlet shares the left plate with the left inlet.
 const rows=[[-.195,.945],[-.180,1],[-.165,1],[.165,1],[.180,1],[.195,.945]],n=20;
 const ring=([yy,f])=>Array.from({length:n},(_,i)=>[.846+.129*f*Math.cos(2*Math.PI*i/n),yy,mainZ+.063*f*Math.sin(2*Math.PI*i/n)]);
 const rings=rows.map(ring);
 for(let i=1;i<rings.length;i++)for(let j=0;j<n;j++){
   const k=(j+1)%n;
   r.polygon([rings[i-1][j],rings[i][j],rings[i][k],rings[i-1][k]],tint(i===2||i===4?seam:can,.84+.15*Math.sin(2*Math.PI*j/n+.9)),false);
 }
 r.polygon(rings[0],pipe,false);r.polygon(rings.at(-1),pipe,false);
}
function tailpipe(r){
 const path=[tailStart,[.900,-.390,.335],[.884,-.557,.343],[.859,-.651,.370],[.814,-.734,.370],tailEnd];
 pipeRun(r,path,.033,pipe);
 lip(r,tailEnd,difference(tailEnd,path.at(-2)),.033);
}
const probeDimensions={label:'Bosch 16330 for 2002 G500 · M18 × 1.5 mount, 22 mm hex',url:'https://www.oreillyauto.com/detail/c/direct-fit/engine-sensors---emissions/emissions---air-management/oxygen-sensor/24932ed2a03f/bosch-direct-fit-oxygen-sensor/b02d/16330/v/a/6410/automotive-suv-2002-mercedes-benz-g500'};
function probe(r,p,s){
 const axis=unit([-.16,s*.46,.79]),frame=basis(axis);
 // The catalog's 22 mm dimension is across flats. A hexagon is specified
 // by its vertex radius by the revolved-mesh helper.
 sleeve(r,p,axis,-.004,.006,.014,.009,iron,16);
 const pitch=.0015,root=.00815,crest=.009,steps=40;
 for(let i=0;i<steps;i++){
  const strip=n=>{const a=n*Math.PI/6,h=-.001+pitch*n/12;return [point(p,frame,h,root,a),point(p,frame,h+pitch*.5,crest,a),point(p,frame,h+pitch,root,a)];};
  const a=strip(i),b=strip(i+1);
  r.polygon([a[0],b[0],b[1],a[1]],seam,false);r.polygon([a[1],b[1],b[2],a[2]],pipe,false);
 }
 cyl(r,p,axis,.006,.018,.011/Math.cos(Math.PI/6),seam,6);
 turn(r,p,axis,[[.018,.0095],[.023,.0095],[.025,.008],[.030,.008],[.032,.009],[.041,.008],[.046,.006],[.048,.004]],pipe,{n:16});
 const wire=add(p,axis,.048);
 pipeRun(r,[wire,add(wire,axis,.029),add(wire,[.032,-s*.023,.043])],.003,black,8);
}
function heatShields(r){
 for(const [s] of sides){
   const c=[-.408,s*pipeY,pipeZ+.014];
   // Overhead air gap and downturned edges keep the metal off the converter.
   for(const [a,b] of [[-.33,-.14],[-.133,.31]])turn(r,c,x,[[a,.091],[a+.012,.099],[b-.012,.099],[b,.091]],shield,{n:9,start:Math.PI*1.12,sweep:Math.PI*.76});
 }
 // The installed prop shaft passes above the main shell. Its shield is low and broad.
 const crown=(xx,yy)=>[.846+xx,yy,mainZ+.064-.024*(xx/.133)**2];
 for(const [a,b] of [[-.133,-.075],[-.075,0],[0,.075],[.075,.133]])
   r.polygon([crown(a,-.21),crown(a,.21),crown(b,.21),crown(b,-.21)],shield,false);
}
function hangers(r){
 for(const [s] of sides)for(const u of [-.68,.43]){
   const anchor=[u,s*.547,u<0?.509:.493],b=[u,s*.607,anchor[2]];
   r.rod(anchor,b,.008,seam,7);
   sleeve(r,b,x,-.012,.012,.028,.014,black,10);
   pipeRun(r,[[u,s*.611,anchor[2]-.019],[u,s*.644,pipeZ+.012],[u,s*.670,pipeZ+.015]],.007,pipe,7);
 }
}
const rows=[];
function addRow(id,name,desc,offset,source,draw){rows.push({...part('exhaust.'+id,name,desc,offset,draw),source,category:'service'});}
for(const [s,key,label] of sides){
 addRow('manifold-'+key,label+' exhaust manifold','Four exhaust ports on the '+key+' cylinder head feed the collector. The front pipe bolts to its lower flange.',[-.39,s*.31,.37],factory,r=>manifold(r,s));
 addRow('converter-'+key,label+' catalyst pipe','The pipe drops from the manifold to the outside of the '+key+' frame rail. Gas passes through two three-way catalyst monoliths in series before reaching the front muffler.',[-.14,s*.52,-.26],factory,r=>converterPipe(r,s));
 addRow('front-muffler-'+key,label+' front muffler','The cylindrical silencer follows the two converters on the '+key+' bank. Its outlet continues toward the transverse main muffler.',[.13,s*.58,-.26],factory,r=>frontMuffler(r,s));
}
addRow('main-muffler','Transverse main muffler','Both front mufflers feed this common shell ahead of the rear axle. The right branch turns in from the passenger side. The left branch and the tailpipe meet the opposite end.',[.18,0,.49],factory,r=>{for(const [s] of sides)pipeRun(r,branchEnds(s),.028,pipe);ovalMuffler(r);});
addRow('tailpipe','Left-side tailpipe','The single outlet curves back toward the left running board, just ahead of the rear wheel.',[.28,-.52,-.22],outletRef,tailpipe);
addRow('oxygen-sensors','Oxygen sensors','Each bank has a probe upstream of the monitored catalyst and a second probe downstream. The short wires indicate the connector side. Their bends and bung angles are approximate.',[-.10,0,.47],sensors,r=>{for(const [s] of sides)for(const xx of [-.674,-.430])probe(r,[xx,s*pipeY,pipeZ+.024],s);});
addRow('heat-shields','Exhaust heat shields','Formed shields stand off the hot converter pipes and main muffler. Their outlines and clearances are fitted to the illustration.',[0,0,.72],epc,heatShields);
addRow('hangers','Rubber exhaust mounts','Frame brackets and rubber pads support the exhaust while allowing the system to move. The service plate identifies separate left and right stays.',[.14,0,-.64],epc,hangers);
export const g500ExhaustGroup={id:'exhaust',name:'Exhaust system',description:'Follow each M113 bank through two catalysts and a front muffler. The branches meet in a transverse muffler before a single tailpipe exits ahead of the left rear wheel.',source:factory,view:'hero',viewAngle:[-.68,-.51],internal:true,category:'service',parts:rows};
export function drawG500Exhaust(r){
 for(const p of rows){
   if(r.inspection?.assembly==='powertrain'&&p.id.startsWith('exhaust.manifold-'))continue;
   r.tag(p.id,()=>p.draw(r));
 }
}

// Bench drawings use their own scale. No dimensions or internal muffler baffling are available in the plate.
function substrate(r,c){
 const h=.14,rad=.134;
 cyl(r,c,x,-h,h,rad,core,22);
 // Enlarged end-face channels make the gas passages visible. Actual cell pitch is far smaller.
 for(const sign of [-1,1])for(let u=-4;u<=4;u++)for(let v=-4;v<=4;v++){
   const yy=u*.027,zz=v*.027;
   if(Math.hypot(yy,zz)>.118)continue;
   const p=[c[0]+sign*(h+.0007),c[1]+yy,c[2]+zz],q=.008;
   r.polygon([[p[0],p[1]-q,p[2]-q],[p[0],p[1]+q,p[2]-q],[p[0],p[1]+q,p[2]+q],[p[0],p[1]-q,p[2]+q]],'#625a50',false);
 }
}
function catalystDetail(key,label){
 const id='g500-exhaust-'+key+'-catalysts',p=[];
 for(const [i,xx] of [-.37,.37].entries()){
   const order=i?'Second':'First',c=[xx,0,0];
   p.push(part('shell-'+i,order+' converter shell','A section of the shell is open so the monolith and gas passage remain visible.',[0,i?.55:-.55,.46],r=>catalyst(r,c,x,.59,.174,true)));
   p.push(part('core-'+i,order+' three-way catalyst monolith','Exhaust flows through the channels in this coated block. The large openings in this drawing show their direction. Cell density and washcoat thickness are illustrative.',[0,i?.55:-.55,-.42],r=>substrate(r,c)));
 }
 p.push(part('connections','Pipe connections','The forward inlet comes from the manifold. The two shells are joined in series and discharge into the bank’s front muffler.',[-.63,0,.21],r=>{for(const [a,b] of [[-1,-.66],[-.079,.079],[.66,1]])sleeve(r,[0,0,0],x,a,b,.033,.026,pipe,16);}));
 return study(id,label+' catalyst pipe','The M113 exhaust drawing identifies two three-way monoliths in each bank. This cutaway shows their sequence. Open the shells to inspect each core.',factory,p);
}
function manifoldStudy(side){
 const label=side<0?'Left':'Right',view=study('g500-exhaust-manifold-'+label.toLowerCase(),label+' exhaust manifold','Four flanged seals sit at 106 mm centers along the head. Their port and bolt openings follow the Elring profile. The runner shapes and the scale of the seal are estimates.',gasketDrawing,[
  part('gaskets','Four port seals','Each seal has an embossed port rim, two opposed mounting holes and two tabs along its lower edge.',[0,-side*.19,.03],r=>manifold(r,side,'gaskets')),
  part('casting','Manifold and collector','Four runners join a common outlet. The cast contours and bends have not been measured.',[0,side*.19,.04],r=>manifold(r,side,'casting')),
  part('joint','Front-pipe joint','The front pipe meets the manifold outlet at its lower flange.',[.03,0,-.17],r=>{const e=manifoldExit(side);sleeve(r,e,z,-.016,-.007,.045,.023,seam,16);sleeve(r,e,z,-.048,-.016,.027,.023,pipe,12);})
 ]);
 view.sources=[gasketDrawing,gasketPhoto,factory];return view;
}
const leftManifold=manifoldStudy(-1),rightManifold=manifoldStudy(1);
function portSealStudy(side,key,label){
 const view=study('g500-'+key+'-port-seals',label+' exhaust port seals','Each port has its own 112 142 01 80 seal. Select a seal to inspect the two fastener holes, central bead and lower tabs.',gasketDrawing,
  m113Stations.map((station,i)=>part('seal-'+(i+1),'Port seal '+(i+1)+' from front','One gasket seals the joint between the head and this exhaust runner.',[(i-1.5)*.035,side*.075,i%2?.04:-.04],r=>drawPortSeal(r,headPort(station,side),side))));
 view.sources=[gasketDrawing,gasketPhoto];return view;
}
const mainStudy=study('g500-exhaust-main','Main muffler and pipe joints','The factory plan and the U.S. underbody photograph show a common muffler with two inlets and one outlet. The closed shell shows the external attachments.',photo,[
 part('shell','Seamed muffler shell','The transverse shell has two end plates. Its internal chambers are undocumented in the model references.',[0,0,.50],ovalMuffler),
 part('right-in','Right inlet','The pipe from the right front muffler enters the right end plate.',[.05,.70,-.12],r=>pipeRun(r,branchEnds(1),.028,pipe)),
 part('left-in','Left inlet','The left branch enters the forward port of the left end plate.',[-.35,-.55,.02],r=>pipeRun(r,branchEnds(-1),.028,pipe)),
 part('outlet','Outlet and tailpipe','The outlet uses the other connection on the left plate and turns outward toward the running board.',[.35,-.54,-.22],tailpipe)
]);
const probeStudy=study('g500-exhaust-sensors','Four oxygen sensor positions','Each bank has one probe before the monitored catalyst and one after it. The mounting detail uses a Bosch direct-fit replacement. Wire routes and bung angles are approximate.',sensors,
 sides.flatMap(([s,key,label])=>[-.674,-.430].map((xx,index)=>part(key+'-'+(index?'downstream':'upstream'),label+' '+(index?'downstream':'upstream')+' sensor','The threaded probe samples exhaust gas in this bank. Its cable carries the signal to the engine controller.',[index?.08:-.08,s*.09,.06],r=>probe(r,[xx,s*pipeY,pipeZ+.024],s)))));
probeStudy.sources=[sensors,probeDimensions];
const views=new Map([['exhaust.oxygen-sensors',probeStudy],['powertrain.exhaust-manifold',leftManifold],['exhaust.main-muffler',mainStudy],['exhaust.tailpipe',mainStudy]]);
for(const [side,key,label] of sides){views.set('exhaust.manifold-'+key,side<0?leftManifold:rightManifold);views.set('g500-exhaust-manifold-'+key+'.gaskets',portSealStudy(side,key,label));views.set('exhaust.converter-'+key,catalystDetail(key,label));}
export function getG500ExhaustDetail(id){return views.get(id)||null;}
