// 992 fit pack: interior. Installed parts drawn onto the car.
// Scope: Interior: dashboard carrier and trim, instrument cluster, PCM display, airbags (driver, passenger, side, head), seat belts with retractors, buckles and height adjusters, sun visors, interior mirror, glovebox, centre-console parts, cupholder, rollover-protection cassettes behind the seats, roll bar covers. cabin.seats, cabin.controls and p992-seats.* already exist.
//
// Contract (see garage/p992-fits.js and tests/garage-p992-fits.test.mjs):
// - groups: installed groups. Each group id is 'p992-fit-interior' or 'p992-fit-interior-<sub>';
//   each group becomes one assembly, and each part one installed, clickable mesh part.
// - Every part is one real component with its own Porsche number. Its name ends
//   ' · <Porsche number>', and its source is the catalogue page whose rows list that
//   number (tests/p992-catalogue-rows.mjs prints every row the garage holds).
// - lines: part ids that are wires, hoses or pipes (see tests/p992-overlap-survey.mjs).
// - mounts: reviewed [a, b, reason] pairs where one part is carried by the other.
//
// Parts come from the catalogue pages the garage holds: airbags (812-050), front
// belts (812-000), the airbag control unit (901-060), the dashboard, its carrier and
// trims (809-000, 809-100, 809-200), the console (809-300, 809-350), the mirror
// cover (809-700), the column switch trims (903-100, the copy that also serves the
// electric 2C7 column drawn here), the manual steering-wheel accessories (403-290),
// the front seat frames, trims and switches (817-000, 817-100, 817-500) and the
// rear rollover-protection trims (807-300). No held page lists the instrument
// cluster, the sun visors, the glovebox, the cupholder, the side and head airbags
// or the rollover cassettes themselves, so those are left out. The dashboard
// moulding, interior mirror, gear knob and carpets are already drawn by cabin.* and
// floor.*; the PCM display page (911-007) is a Turbo S copy and is not used.
// Optional heated-wheel, carbon-cover and drive-mode-switch rows are left out
// because the car's options do not show them.
//
// Positions follow the drawn cabin (garage/porsche-cabin.js): dash at
// x -0.695 with its top at z 0.845, steering wheel centre [-0.304,-0.327,0.799],
// front seats at x 0.047, y ±0.356.
import {pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {cyl,sleeve,y} from './mechanism-shapes.js';

const es=(path,code,title)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url:'https://www.eurospares.co.uk/Porsche/992/'+path});
const airbagSrc=es('2019_(992-1)/PartDiagrams/812-050/Airbag','812-050','Airbags');
const wheelSrc=es('2022_(992-1)/PartDiagrams/403-290/Accessories_steering_wheel','403-290','Accessories steering wheel, manual gearbox');
const switchSrc=es('2021_(992-1_Turbo_S)/PartDiagrams/903-100/Steering_column_switch','903-100','Steering column switch');
const backrestSrc=es('2022_(992-1)/PartDiagrams/817-000/backrest_frame','817-000','Front seat backrest frame');
const seatSrc=es('2020_(992-1)/PartDiagrams/817-100/SEAT_FRAME','817-100','Front seat frame');
const raw=(code,title,url)=>({label:`Eurospares · Porsche 992.1 catalogue diagram ${code}, ${title}`,url});
const beltSrc=raw('812-000','Three-point seat belts, front','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/812-000/THREE-POINT_SEAT_BELT');
const acuSrc=es('2020_(992-1)/PartDiagrams/901-060/AIR_BAG_CONTROL_MODULE','901-060','Airbag control unit and crash sensors');
const rearTrimSrc=es('2020_(992-1)/PartDiagrams/807-300/TRIMS','807-300','Rear trims, Cabriolet');
const dashSrc=es('2020_(992-1)/PartDiagrams/809-000/DASH_PANEL_TRIM','809-000','Dashboard, upper part with fasteners');
const dashTrimSrc=es('2020_(992-1)/PartDiagrams/809-100/ACCESSORIES','809-100','Dashboard trim accessories');
const carrierSrc=es('2020_(992-1)/PartDiagrams/809-200/DASHBOARD_BRACKET','809-200','Dashboard bracket');
const consoleSrc=es('2020_(992-1)/PartDiagrams/809-300/CENTER_CONSOLE','809-300','Centre console trim and accessories');
const armrestSrc=raw('809-350','Centre console armrest','https://eurospares.co.uk/Porsche/992-1/2020/PartDiagrams/809-350/CENTER_CONSOLE');
const mirrorSrc=es('2020_(992-1)/PartDiagrams/809-700/Interior_mirror_Cover','809-700','Interior mirror and cover');
const seatElecSrc=es('2019_(992-1)/PartDiagrams/817-500/ELECTRICS','817-500','Front seat electrics');

const part=(id,name,description,offset,source,draw)=>({id,name,description,offset,source,draw});
const group=(id,name,description,source,parts)=>({id,name,description,source,view:'hero',internal:true,category:'service',parts:parts.map(p=>({...p,id:id+'.'+p.id}))});
const sides=[[-1,'left'],[1,'right']];
const title=s=>s<0?'Left':'Right';

const black='#25282a',plastic='#2f3335',trim='#3a3d3f',steel='#6c7476',silver='#8b9294',fabric='#4a4c4a';
const add=(...v)=>v.reduce((a,b)=>a.map((q,i)=>q+b[i]));
const mul=(v,k)=>v.map(q=>q*k);
const unit=v=>mul(v,1/Math.hypot(...v));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

// A rounded-rectangle pad of half-sizes a (along e1) and b (along e2), extruded
// along n from d0 to d1. p sets the squareness of the outline.
function pad(r,c,e1,e2,n,a,b,d0,d1,col,sidesN=16,p=.45){
 const ring=d=>Array.from({length:sidesN},(_,i)=>{
  const t=i*2*Math.PI/sidesN,co=Math.cos(t),si=Math.sin(t);
  return add(c,mul(e1,a*Math.sign(co)*Math.abs(co)**p),mul(e2,b*Math.sign(si)*Math.abs(si)**p),mul(n,d));
 });
 const back=ring(d0),front=ring(d1);
 r.polygon(back,col,false);r.polygon(front,col,false);
 for(let i=0;i<sidesN;i++){const j=(i+1)%sidesN;r.polygon([back[i],back[j],front[j],front[i]],col,false);}
}
// Part of a tube wall around an axis: angles a0..a1 measured from e1 towards e2.
function shell(r,c,axis,e1,e2,rad,s0,s1,a0,a1,col,n=8){
 const q=(s,t)=>add(c,mul(axis,s),mul(e1,rad*Math.cos(t)),mul(e2,rad*Math.sin(t)));
 for(let i=0;i<n;i++){
  const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n;
  r.polygon([q(s0,t0),q(s0,t1),q(s1,t1),q(s1,t0)],col,false);
 }
}

// ---- Restraints -------------------------------------------------------------
// Steering wheel plane, as drawn in cabin.controls.
const wheelC=[-.304,-.327,.799],wheelU=[0,1,0],wheelV=unit([.045,0,.143]);
const wheelN=unit(cross([0,.151,0],[.045,0,.143]));  // faces the driver: rearward and slightly down
// A flat belt webbing through points, lying in the plane y = const.
function webbing(r,pts,width,col){
 for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i],d=unit(b.map((v,k)=>v-a[k])),q=mul(unit(cross(d,[0,1,0])),width/2);
  r.polygon([add(a,q),add(b,q),add(b,mul(q,-1)),add(a,mul(q,-1))],col,false);
 }
}
// Upper belt guide behind the door opening, under the edge of the top compartment.
const beltGuide=s=>[.560,s*.592,.860],beltAnchor=s=>[.150,s*.590,.474];
function belt(r,s){
 const ret=[.600,s*.590,.630];
 box(r,ret,[.060,.044,.100],'#2d3133');cyl(r,plus(ret,[0,0,-.020]),[0,1,0],-.024,.024,.034,'#3a4043',12);
 const g=beltGuide(s),anchor=beltAnchor(s);
 webbing(r,[plus(ret,[-.012,0,.050]),plus(g,[.012,0,-.018])],.046,'#1f2224');
 webbing(r,[plus(g,[-.010,0,-.012]),[.300,s*.590,.600],anchor],.046,'#1f2224');
 // Tongue resting on the webbing, and the end fitting bolted at the floor.
 box(r,[.330,s*.596,.628],[.050,.010,.030],silver);
 box(r,anchor,[.050,.012,.022],steel);
}
function buckle(r,s){
 pipe(r,[[.170,s*.195,.474],[.115,s*.155,.530],[.088,s*.140,.560]],.009,'#26292b',8);
 box(r,[.080,s*.136,.586],[.044,.026,.058],'#1c1e1f');box(r,[.064,s*.136,.606],[.012,.018,.020],'#b52a22');
}
const flap=s=>{box(r0,[.729,s*.331,.8395],[.034,.170,.005],'#2a2c2e');};
let r0;
const restraints=group('p992-fit-interior-restraints','Airbags, belts and rollover protection','The US Cabriolet carries a driver airbag in the wheel hub, a passenger airbag under the dashboard top and a knee airbag under the column, all fired by the control unit on the tunnel. The front three-point belts reel out of retractors behind the door openings, and the rollover-protection flaps sit behind the rear seats. The side and head airbags and the rollover cassettes are not on the catalogue pages held here.',airbagSrc,[
 part('driver','Driver airbag unit · 992880201S TRP','The folded bag and its inflator fill the steering-wheel hub; the cover tears open toward the driver.',[.22,0,.04],airbagSrc,r=>{
  pad(r,wheelC,wheelU,wheelV,wheelN,.066,.052,.012,.044,black,18);
  pad(r,wheelC,wheelU,wheelV,wheelN,.020,.008,.044,.047,silver,10);
 }),
 part('passenger','Passenger airbag unit · 992880204B','The passenger module sits under the right side of the dashboard top and deploys up against the windscreen and back toward the occupant.',[0,.25,.22],airbagSrc,r=>{
  const c=[-.565,.355,.776];
  box(r,c,[.150,.250,.082],steel);
  cyl(r,plus(c,[.005,0,-.005]),y,-.120,.120,.034,'#59605f',12);
  box(r,plus(c,[0,0,.046]),[.158,.262,.010],plastic);
 }),
 part('knee','Driver knee airbag unit, USA · 992880841','The US cars add a knee airbag in the lower dashboard trim under the steering column, facing the driver\'s knees.',[.16,-.10,-.14],airbagSrc,r=>{
  const c=[-.468,-.330,.585],n=unit([.94,0,.34]),e2=unit(cross(n,[0,1,0]));
  pad(r,c,[0,1,0],e2,n,.150,.045,-.035,.025,steel,16,.35);
  pad(r,c,[0,1,0],e2,n,.155,.050,.025,.032,trim,16,.35);
 }),
 part('control-unit','Airbag control unit · 992959655D','The airbag control unit sits on the tunnel under the front of the centre console, at the car\'s centre line, and fires the airbags and belt pretensioners.',[0,0,-.20],acuSrc,r=>{
  box(r,[-.280,0,.567],[.120,.080,.036],'#3d4447');
  for(const yy of [-.046,.046])box(r,[-.300,yy,.551],[.030,.012,.006],steel);
  box(r,[-.345,0,.570],[.014,.050,.022],'#1e2122');
 }),
 ...sides.flatMap(([s,hand])=>{const T=title(s),L=hand==='left';return [
  part('belt-'+hand,(L?'Driver':'Passenger')+' three-point belt with retractor, Cabriolet, USA · '+(L?'992857705G':'992857706G'),'The retractor sits low behind the door opening; the webbing rises to the upper guide and runs down beside the seat to its floor anchor.',[.10,s*.30,0],beltSrc,r=>belt(r,s)),
  part('buckle-'+hand,T+' belt buckle · '+(L?'992857755B':'992857756B'),'The buckle stands on a short stalk on the tunnel side of the seat, bolted to the seat frame so it moves with the seat.',[0,-s*.10,.14],beltSrc,r=>buckle(r,s)),
 ];}),
 part('rollover-cover','Rollover protection cover · 992867755B A10','The cover closes the trim behind the rear seat backs between the two flaps through which the rollover bars deploy.',[.18,0,.12],rearTrimSrc,r=>{box(r,[.729,0,.8395],[.034,.300,.005],'#2a2c2e');}),
 ...sides.map(([s,hand])=>part('rollover-flap-'+hand,title(s)+' rollover protection flap · '+(hand==='left'?'992868431A A10':'992868432A A10'),'The flap sits over the rollover cassette behind the rear seat back and is pushed open when the bar fires.',[.16,s*.20,.16],rearTrimSrc,r=>{r0=r;flap(s);}))
]);

// ---- Dashboard ---------------------------------------------------------------
const dashboard=group('p992-fit-interior-dashboard','Dashboard carrier and trims','The steel carrier crosses the car under the dashboard top and carries the column and the passenger airbag. Trims flank the instrument binnacle and run along the passenger side, a support frame holds the central display, and a cover hides the mirror mounting at the windscreen.',carrierSrc,[
 part('carrier','Dashboard bracket (cross-car carrier) · 992857011','The cross-car carrier spans the car under the forward edge of the dashboard top, between the A-pillar brackets.',[-.20,0,.10],carrierSrc,r=>{
  pipe(r,[[-.665,-.550,.800],[-.665,.550,.800]],.022,'#5b6265',10);
  for(const s of [-1,1])box(r,[-.665,s*.556,.790],[.060,.012,.070],'#5b6265');
  for(const yy of [.28,.43])box(r,[-.648,yy,.772],[.016,.030,.040],'#5b6265');
 }),
 part('mib-support','Infotainment (MIB) support, black · 992857114B 5Q0','A black frame behind the central touchscreen holds the display in the dashboard face.',[.16,0,.06],dashSrc,r=>{
  const c=[-.4155,.060,.805];
  for(const [dy,dz,w,h] of [[0,.034,.236,.006],[0,-.034,.236,.006],[-.115,0,.006,.074],[.115,0,.006,.074]])box(r,plus(c,[0,dy,dz]),[.005,w,h],'#232628');
 }),
 ...sides.map(([s,hand])=>part('cluster-trim-'+hand,title(s)+' instrument cluster trim, black · '+(hand==='left'?'992858415B 5Q0':'992858416B 5Q0'),'The trim closes the '+(s<0?'outer':'inner')+' side of the instrument binnacle against the dashboard.',[.10,s*.12,.06],dashTrimSrc,r=>{
  box(r,[-.452,-.335+s*.208,.826],[.060,.012,.058],'#2b2e30');
 })),
 part('passenger-trim','Passenger side dashboard trim, black · 992858020B 5Q0','The trim strip runs across the passenger side of the dashboard face, above the glovebox.',[.16,.10,0],dashTrimSrc,r=>{box(r,[-.4245,.410,.780],[.005,.360,.025],'#2a2d2f');}),
 part('mirror-cover','Interior mirror cover · 992867589B','The plastic cover on the windscreen hides the mirror foot and the sensors behind it.',[.10,0,-.10],mirrorSrc,r=>{
  const t=unit([.631,0,.380]),n=unit([.380,0,-.631]),c=[-.869+.631*.930-.019*Math.sin(.930*Math.PI),0,.868+.380*.930];
  pad(r,c,[0,1,0],t,n,.042,.036,.004,.026,'#26292b',14,.4);
 })
]);

// ---- Cockpit controls --------------------------------------------------------
// Column axis from the lower universal joint to the top of the upper shaft.
const colTop=[-.337,-.327,.795],colAxis=unit([.441,0,.20]),colUp=unit(cross(colAxis,[0,1,0])).map(v=>-v);
// Console top surface (cabin.controls profile).
const consoleTop=xx=>{const pts=[[-.335,.56],[-.33,.612],[-.08,.625],[.022,.590],[.30,.575],[.33,.55]];
 for(let i=1;i<pts.length;i++)if(xx<=pts[i][0]){const [a,za]=pts[i-1],[b,zb]=pts[i];return za+(zb-za)*(xx-a)/(b-a);}return .55;};
const cockpit=group('p992-fit-interior-cockpit','Steering-wheel controls, column trim and console','Controls the driver reaches from the seat: the multifunction steering-wheel buttons, the two-piece column shroud with the electric column-adjustment switch, the gearshift surround and the armrest lid on the console.',wheelSrc,[
 part('wheel-buttons','Multifunction steering-wheel button set, matt black · 992998537B 6N3','The left and right button panels sit on the horizontal spokes for audio, phone and instrument-cluster menus.',[.18,0,.10],wheelSrc,r=>{
  for(const a of [.14,Math.PI-.14]){
   const c=add(wheelC,mul(wheelU,.099*Math.cos(a)),mul(wheelV,.099*Math.sin(a)));
   pad(r,c,wheelU,wheelV,wheelN,.026,.022,.008,.020,'#1f2223',12,.4);
  }
 }),
 part('column-upper','Upper steering-column switch trim · 992858565 5Q0','The upper half of the column shroud covers the column between the instrument binnacle and the steering wheel.',[.06,0,.16],switchSrc,r=>{
  shell(r,colTop,colAxis,[0,1,0],colUp,.052,-.108,-.045,0,Math.PI,plastic,10);
  for(const s of [-.108,-.049])shell(r,colTop,colAxis,[0,1,0],colUp,.052,s,s+.004,0,Math.PI,trim,10);
 }),
 part('column-lower','Lower steering-column switch trim, electric adjustment · 992858566A 5Q0','The lower half of the shroud closes the column from below; the version for the electrically adjusted column carries the adjustment switch.',[.06,0,-.16],switchSrc,r=>{
  shell(r,colTop,colAxis,[0,1,0],colUp,.054,-.110,-.045,Math.PI,2*Math.PI,plastic,10);
 }),
 part('column-switch','Steering-column adjustment switch · 971953519B 1E0','The four-way switch on the lower left of the shroud drives the electric reach and tilt adjustment.',[0,-.18,-.08],switchSrc,r=>{
  const c=add(colTop,mul(colAxis,-.090),mul(colUp,-.020),[0,-.056,0]);
  box(r,c,[.040,.012,.026],'#1d1f20');box(r,plus(c,[0,-.009,0]),[.018,.008,.012],'#5d6366');
 }),
 part('shift-surround','Manual gearshift surround trim, black · 992857503B TDL','The trim frames the leather gear-lever boot in the top of the centre console.',[0,0,.16],consoleSrc,r=>{
  const P=(xx,yy,d=.003)=>[xx,yy,consoleTop(xx)+d];
  const [x0,x1,x2,x3]=[-.215,-.192,-.024,0],[y0,y1]=[.086,.066];
  for(const [a,b,c,d] of [[P(x0,-y0),P(x3,-y0),P(x3,-y1),P(x0,-y1)],[P(x0,y1),P(x3,y1),P(x3,y0),P(x0,y0)],[P(x0,-y1),P(x1,-y1),P(x1,y1),P(x0,y1)],[P(x2,-y1),P(x3,-y1),P(x3,y1),P(x2,y1)]])r.polygon([a,b,c,d],'#26292b',false);
 }),
 part('armrest','Centre armrest cover, leather · 992857098B','The padded leather lid over the storage box at the rear of the console doubles as the armrest between the seats.',[0,0,.18],armrestSrc,r=>{
  // The lid stands just above the tunnel carpet, which the cabin draws across the console top.
  r.profile([[.060,.597],[.300,.597],[.300,.625],[.270,.637],[.090,.637],[.060,.625]],-.086,.086,'#4a4038');
 })
]);

// ---- Front seats -------------------------------------------------------------
// The drawn modern seat: cushion rows [dx, half width, crown], backrest sections
// [z, half width, front dx, back dx] (porsche-cabin.js).
const seatX=.047,seatY=s=>s*.356;
const backrest=[[.51,.164,.113,.15],[.571,.204,.108,.174],[.66,.216,.122,.197],[.78,.211,.146,.214],[.855,.194,.163,.224],[.907,.155,.179,.245],[.938,.101,.19,.253]];
const cushionW=dx=>{const rows=[[-.295,.092],[-.243,.178],[-.155,.209],[.005,.218],[.12,.201],[.17,.16]];
 for(let i=1;i<rows.length;i++)if(dx<=rows[i][0]){const [a,wa]=rows[i-1],[b,wb]=rows[i];return wa+(wb-wa)*(dx-a)/(b-a);}return .16;};
const section=z=>{for(let i=1;i<backrest.length;i++)if(z<=backrest[i][0]){const a=backrest[i-1],b=backrest[i],t=(z-a[0])/(b[0]-a[0]);return a.map((v,k)=>v+(b[k]-v)*t);}return backrest.at(-1);};
// Centre of the backrest thickness at height z, |u| = lateral fraction.
const backMid=(z,u=0)=>{const [,,f,b]=section(z);return seatX+(f+b-.019*Math.abs(u))/2+.004;};
const pivot=[seatX+.14,.50];

function seatFrame(r,s){
 const yc=seatY(s),w=.150,z=.480,xs=[seatX-.200,seatX+.130];
 const loop=[[xs[0],yc-w,z],[xs[1],yc-w,z],[xs[1],yc+w,z],[xs[0],yc+w,z],[xs[0],yc-w,z]];
 pipe(r,loop,.011,steel,8);
 // Front pan and the two height-adjustment rockers on the rails.
 r.polygon([[xs[0]+.01,yc-w+.01,z+.004],[xs[0]+.12,yc-w+.01,z+.010],[xs[0]+.12,yc+w-.01,z+.010],[xs[0]+.01,yc+w-.01,z+.004]],'#5d6466',false);
 for(const yy of [yc-w,yc+w])for(const xx of xs)box(r,[xx,yy,z-.014],[.030,.012,.016],steel);
}
function backrestFrame(r,s){
 const yc=seatY(s),zs=[.565,.62,.70,.78,.875],off=.155;
 for(const sign of [-1,1])pipe(r,zs.map(z=>[backMid(z,.8),yc+sign*off,z]),.009,steel,8);
 for(const z of [zs[0],zs.at(-1)])pipe(r,[[backMid(z,.8),yc-off,z],[backMid(z,0),yc,z],[backMid(z,.8),yc+off,z]],.009,steel,8);
 // Backrest adjustment motor at the base, on the recliner cross shaft.
 cyl(r,[backMid(.55,.5),yc-s*.045,.55],y,-.035,.035,.018,'#3c4244',12);
}
function backrestCover(r,s){
 const yc=seatY(s),us=[-1,-.74,-.37,0,.37,.74,1],rows=backrest.slice(0,6).map(([z,w,,b])=>[z,w,b]);
 rows[0]=[.53,...section(.53).filter((_,k)=>k===1||k===3)];
 const p=([z,w,b],u)=>[seatX+b-.019*Math.abs(u)+.007,yc+w*u*.95,z];
 for(let j=1;j<rows.length;j++)for(let i=1;i<us.length;i++)r.polygon([p(rows[j-1],us[i-1]),p(rows[j-1],us[i]),p(rows[j],us[i]),p(rows[j],us[i-1])],j%2?'#2c2f31':'#303335',false);
 // Rolled lower edge.
 const base=rows[0];pipe(r,[-.95,-.5,0,.5,.95].map(u=>p(base,u)),.006,'#2c2f31',6);
}
function frameTrim(r,s){
 const yc=seatY(s),dxs=[-.235,-.155,-.06,.005,.08];
 const at=(dx,d,z)=>[seatX+dx,yc+s*(cushionW(dx)+d),z];
 for(let i=1;i<dxs.length;i++){
  for(const d of [.0035,.0075])r.polygon([at(dxs[i-1],d,.440),at(dxs[i],d,.440),at(dxs[i],d,.505),at(dxs[i-1],d,.505)],d>.005?trim:plastic,false);
  r.polygon([at(dxs[i-1],.0035,.505),at(dxs[i],.0035,.505),at(dxs[i],.0075,.505),at(dxs[i-1],.0075,.505)],plastic,false);
 }
 for(const dx of [dxs[0],dxs.at(-1)])r.polygon([at(dx,.0035,.440),at(dx,.0075,.440),at(dx,.0075,.505),at(dx,.0035,.505)],plastic,false);
}
// Seat-adjustment switches on the outer side trim: a long cushion switch and a
// backrest rocker behind it.
function seatSwitches(r,s){
 const yc=seatY(s),face=dx=>yc+s*(cushionW(dx)+.0105);
 box(r,[seatX-.150,face(-.150),.470],[.075,.006,.022],'#1f2122');
 box(r,[seatX-.085,face(-.085),.474],[.018,.006,.036],'#1f2122');
 box(r,[seatX-.150,face(-.150)+s*.004,.470],[.050,.003,.008],'#4d5355');
}
function fittingCap(r,s,outer){
 const yc=seatY(s),w=cushionW(pivot[0]-seatX),face=outer?yc+s*(w+.004):yc-s*(w+.004);
 const dir=outer?s:-s;
 cyl(r,[pivot[0],face,pivot[1]],[0,dir,0],0,.010,.040,outer?trim:plastic,16);
 cyl(r,[pivot[0],face,pivot[1]],[0,dir,0],.010,.013,.018,plastic,10);
}
const out=s=>[0,s*.30,.06];
const seats=group('p992-fit-interior-seats','Front seat frames, trims and switches','Each power-adjusted front seat is built on a pressed seat frame on its rails and a backrest frame with its own adjustment motor. A hard backrest cover, side trims with the adjustment switches and recliner fitting caps close the outside.',seatSrc,sides.flatMap(([s,hand])=>{
 const T=title(s),L=hand==='left';
 return [
  part('frame-'+hand,T+' seat frame · '+(L?'992882025 Y':'992882026 Y'),'The pressed steel seat frame carries the cushion on its rails and holds the height-adjustment rockers.',[0,s*.18,-.12],seatSrc,r=>seatFrame(r,s)),
  part('backrest-frame-'+hand,T+' backrest frame with adjustment motor · '+(L?'992881511 Y':'992881512 Y'),'The tubular backrest frame pivots on the seat frame; its electric motor sets the backrest angle.',[.14,s*.18,.08],backrestSrc,r=>backrestFrame(r,s)),
  part('backrest-cover-'+hand,T+' backrest cover · '+(L?'992881971B':'992881972B'),'The hard moulded shell closes the back of the backrest, facing the rear seats.',[.22,s*.06,.04],backrestSrc,r=>backrestCover(r,s)),
  part('frame-trim-'+hand,T+' seat frame trim · '+(L?'992882523':'992882524'),'The outer side trim covers the seat frame and its adjustment mechanism below the cushion.',out(s),seatSrc,r=>frameTrim(r,s)),
  part('switches-'+hand,T+' seat adjustment switch module, grained black · '+(L?'992959747F 1E0':'992959748F 1E0'),'The switch module on the outer side trim moves the seat fore and aft, up and down, and tilts the backrest.',[-.04,s*.36,0],seatElecSrc,r=>seatSwitches(r,s)),
  part('outer-cap-'+hand,T+' outer backrest fitting cap · '+(L?'992881607':'992881608'),'The cap covers the outer backrest recliner fitting where the backrest pivots on the seat frame.',[.04,s*.32,0],seatSrc,r=>fittingCap(r,s,true)),
  part('inner-cap-'+hand,T+' inner backrest fitting cap · '+(L?'992881457':'992881458'),'The inner cap covers the recliner fitting on the tunnel side of the seat.',[.04,-s*.14,.10],seatSrc,r=>fittingCap(r,s,false)),
 ];
}));

export const groups=[restraints,dashboard,cockpit,seats];
export const lines=[];
const C='p992-fit-interior-cockpit.',R='p992-fit-interior-restraints.',D='p992-fit-interior-dashboard.',S='p992-fit-interior-seats';
export const mounts=[
 [R+'driver','cabin.controls','the driver airbag unit is bolted into the steering-wheel hub and forms its centre cover'],
 [C+'wheel-buttons','cabin.controls','the button panels are clipped into the left and right steering-wheel spokes'],
 [C+'column-upper','cabin.controls','the upper shroud clips to the facia under the instrument binnacle and closes against the wheel hub'],
 [C+'column-lower','cabin.controls','the lower shroud clips to the facia below the column and closes against the wheel hub'],
 [C+'column-switch','cabin.controls','the adjustment switch is set into the lower shroud just behind the facia'],
 [C+'shift-surround','cabin.controls','the surround is clipped into the console top around the gear-lever boot'],
 ...['left','right'].map(h=>[D+'cluster-trim-'+h,'cabin.controls','the trim is clipped to the side of the instrument binnacle']),
 [D+'mirror-cover','cabin.windshield','the cover is fixed to the windscreen mounting plate and the mirror stem passes through it'],
 [R+'control-unit','floor','the control unit is bolted to the top of the tunnel; the carpet and underlay are cut out around it'],
 [R+'control-unit','cabin.controls','the control unit sits on the tunnel under the front of the centre console'],
 ...['left','right'].flatMap(h=>[[R+'buckle-'+h,S+'.frame-'+h,'the buckle stalk is bolted to the inner side of the seat frame'],[R+'buckle-'+h,'cabin.seats','the buckle stands beside the inner cushion bolster and moves with the seat'],[R+'belt-'+h,'floor.sills','the belt end fitting is bolted to the threaded anchor insert in the sill']]),
 [S,'cabin.seats','the seat and backrest frames carry the drawn upholstery, and the covers, trims and caps are clipped to the seat'],
];
