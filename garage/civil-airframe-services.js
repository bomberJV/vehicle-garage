// Civil airframe sections. Each reference supports the named variant or, where
// explicitly described, a family arrangement. Dimensions are for inspection.
import {part,study,turn,cyl,sleeve,TAU,y,z} from './mechanism-shapes.js';
import {symbol} from './civil-system-symbols.js';
const references={
 sky:{label:'Cessna 172S Nav III · §7, figure 7-7, electrical system',url:'https://system-f.gitlab.io/aircraft/manual/cessna-172s/skyhawksp_pim-20130523_section7_airplane_and_systems_descriptions.pdf#page=48'},
 jumboFuel:{label:'UK AAIB · Boeing 747-400 fuel schematic, figure 2',url:'https://assets.publishing.service.gov.uk/media/542302bfe5274a1317000bd7/Boeing_747-436__G-BNLG_06-06.pdf#page=6'},
 jumboBrake:{label:'Boeing 747-400 flight crew operations manual · landing gear, wheel brakes',url:'https://ninelima.org/poh/Boeing/747-Operations-Manual.pdf'},
 gulf:{label:'FAA · GVIII-G700/G800 draft MMEL, fuel and brake temperature monitoring',url:'https://www.faa.gov/aircraft/draft_docs/mmel/MMEL_GVIII-G700_Rev_2_Draft.pdf'},
 cubTank:{label:'Piper Aircraft · J5A/B service bulletin 65, fuel-tank construction',url:'https://www.univair.com/content/PIP_SB0065.pdf'},
 cubBrake:{label:'EAA Vintage Airplane · original J-5 expander-tube brakes',url:'https://members.eaavintage.org/wp-content/uploads/2015/01/VA-Vol-42-No-6-Nov-Dec2014.pdf'}
};
const index=new Map(),zero=[0,0,0];
function mount(vehicle,aliases,id,name,description,source,parts,angle){
  const v=study(id,name,description,source,parts);v.viewAngle=angle;
  for(const p of v.groups[0].parts)p.source=source;
  for(const key of aliases)index.set(vehicle+'/'+key,v);
}
const component=(key,name,note,offset,shape,c)=>part(key,name,note,offset,r=>symbol(r,shape,c));
function tank(r,points,depth,color){
  const lower=points.map(([a,b])=>[a,b,0]),upper=points.map(([a,b])=>[a,b,depth]);
  r.polygon(lower,color,false);r.polygon(upper,color,false);
  for(let i=0;i<points.length;i++){const j=(i+1)%points.length;r.polygon([lower[i],lower[j],upper[j],upper[i]],'#586e72',false);}
}
function mirror(points,s){return points.map(([a,b])=>[a,s*b]);}
const jumboTanks=[];
for(const [side,word] of [[-1,'Left'],[1,'Right']]){
  const half=[
    ['inner',side<0?'2':'3',[[0,.22],[.29,1.02],[.58,1.02],[.40,.22]],'#789b92'],
    ['outer',side<0?'1':'4',[[.32,1.04],[.53,1.42],[.77,1.42],[.6,1.04]],'#97aaa3'],
    ['reserve',side<0?'2':'3',[[.55,1.44],[.65,1.58],[.82,1.58],[.78,1.44]],'#ab925f']
  ];
  for(const [key,num,poly,color] of half)jumboTanks.push(part(key+word,(key==='reserve'?'Reserve tank ':'Main tank ')+num,
    key==='reserve'?'The reserve bay lies outboard of the main tanks in this wing.':'This integral wing tank stores fuel inside sealed skin and spar boundaries.',
    [key==='reserve'?.23:0,side*(key==='inner'?.34:key==='outer'?.57:.72),key==='outer'?.17:0],r=>tank(r,mirror(poly,side),.075,color)));
}
jumboTanks.push(part('center','Center wing tank','The center tank spans the wing box through the fuselage between main tanks 2 and 3.',[-.41,0,.30],r=>tank(r,[[-.07,-.2],[.40,-.2],[.40,.2],[-.07,.2]],.11,'#adbd9f')),
  part('stabilizer','Horizontal stabilizer tank','The reference aircraft has a tank in the horizontal tail. Fit varies within the 747-400 fleet.',[.50,0,.15],r=>tank(r,[[1.2,-.24],[1.46,-.48],[1.57,-.45],[1.49,0],[1.57,.45],[1.46,.48],[1.2,.24]],.048,'#8da9b0')));
mount('boeing747',['wings.port','wings.starboard'],'jumbo-fuel-bays','747-400 fuel tank arrangement','The four main tanks, two reserve tanks and center tank follow the 747-400 plan drawing. It depicts a horizontal stabilizer tank on the reference configuration. Bay outlines are simplified.',references.jumboFuel,jumboTanks,[1.53,1.01]);
function brakePack(gulf){
  const color='#454b4c',steel='#9aa7a7',articles=[];
  const brake=(id,name,note,offset,draw)=>articles.push(part(id,name,note,offset,draw));
  brake('torque','Stationary torque tube','The tube supports the stationary plates and takes brake torque into the landing-gear axle.',[0,-.58,0],r=>{
    sleeve(r,zero,y,-.23,.24,.14,.092,steel,28);
    for(let i=0;i<8;i++){const a=i*TAU/8;r.rod([.14*Math.cos(a),-.16,.14*Math.sin(a)],[.14*Math.cos(a),.20,.14*Math.sin(a)],.012,'#718389',6);}
  });
  brake('rotors','Wheel-driven carbon rotors','Drive keys at the rim engage the outer edges of these plates, making them turn with the wheel.',[.40,.08,.19],r=>{
    for(const station of [-.115,-.04,.035,.11]){
      sleeve(r,[0,station,0],y,-.014,.014,.294,.155,color,28);
      for(let i=0;i<8;i++){const a=i*TAU/8;r.rod([.29*Math.cos(a),station-.013,.29*Math.sin(a)],[.29*Math.cos(a),station+.013,.29*Math.sin(a)],.015,'#656962',5);}
    }
  });
  brake('stators','Axle-keyed carbon stators','The stationary plates alternate with the rotors. Braking pressure brings their faces together.',[-.40,.06,-.12],r=>{
    for(const station of [-.0775,-.0025,.0725])sleeve(r,[0,station,0],y,-.012,.012,.28,.145,'#726e62',28);
  });
  brake('pistons','Piston housing and pressure plate','Hydraulic pistons press the plate against the stack. The friction surfaces convert motion into heat.',[0,.58,.15],r=>{
    sleeve(r,[0,.18,0],y,-.015,.027,.294,.15,steel,28);
    for(let i=0;i<6;i++){const a=i*TAU/6;cyl(r,[.222*Math.cos(a),.21,.222*Math.sin(a)],y,0,.067,.036,'#87918d',12);}
  });
  if(gulf)articles.push(part('temperature','Brake temperature probe','The FAA family equipment list identifies brake temperature monitoring and carbon-brake cooling. The probe shape and location here are illustrative.',[0,0,.49],r=>{
    cyl(r,[.235,.18,.16],y,-.045,.08,.017,'#b4a77d',12);
    r.rod([.235,.255,.16],[.31,.28,.21],.008,'#4e5a5b',7);
  }));
  else articles.push(part('wheelSpeed','Wheel-speed signal pickup','The antiskid system monitors wheel speed and modulates brake pressure when a wheel decelerates toward a skid. Pickup geometry is representative.',[0,0,.49],r=>{
    cyl(r,[0,-.24,0],y,-.068,.06,.06,'#879a9c',18);
    cyl(r,[0,-.31,0],y,-.025,0,.032,'#acada2',12);
    r.rod([0,-.31,0],[.075,-.33,.075],.010,'#5f6d6f',7);
  }));
  return articles;
}
mount('boeing747',['gear.port-body','gear.port-wing','gear.starboard-body','gear.starboard-wing'],'jumbo-wheel-brake','747-400 main-wheel carbon brake','One multiple-disc brake sits at each main wheel. The rotors and stators below show how one stack works. Plate count, piston count and housing dimensions are illustrative.',references.jumboBrake,brakePack(false),[-.94,.35]);
mount('gulfstreamg800',['gear.port','gear.starboard'],'g800-wheel-brake','G800 main-wheel carbon brake','The GVIII family equipment list identifies carbon braking and brake temperature monitoring. This representative carbon stack shows wheel-side and axle-side parts. The manufacturer’s plate count and piston layout are unverified.',{...references.gulf,url:references.gulf.url+'#page=88'},brakePack(true),[-.94,.35]);
const gulfFeed=[];
for(const [side,word] of [[-1,'Left'],[1,'Right']]){
  const key=word.toLowerCase(),s=side;
  gulfFeed.push(part(key+'tank',word+' wing fuel tank','This volume represents the wing supply for this side of the aircraft.',[0,s*.62,.16],r=>tank(r,mirror([[-.62,.30],[-.16,.94],[.23,.99],[-.22,.30]],side),.11,'#7b9b90')));
  for(const [type,pos] of [['Main',-.4],['Alternate',.12]])gulfFeed.push(component(key+type,word+' '+type.toLowerCase()+' boost pump','One of the four boost pumps listed for the G700/G800. The two pumps shown on this side are separately identified.',[pos,s*.29,.34],'pump',[pos,s*.32,-.16]));
}
gulfFeed.push(component('crossflow','Fuel crossflow valve','The crossflow valve links the supply paths on the two sides.',[-.46,0,.08],'selector',[.38,-.24,-.13]),
  component('intertank','Fuel intertank valve','This separate valve provides a connection between the aircraft’s fuel tanks.',[.45,0,.08],'selector',[.38,.24,-.13]));
mount('gulfstreamg800',['wings.port','wings.starboard'],'g800-fuel-supply','G800 wing fuel and boost pumps','The FAA’s G700/G800 family list identifies left and right main and alternate boost pumps, a crossflow valve and an intertank valve. Component positions show their relationships. Physical routing and tank boundaries are illustrative.',{...references.gulf,url:references.gulf.url+'#page=70'},gulfFeed,[1.1,.78]);
function sky(){
 const c=(k,n,d,offset,shape,xyz)=>component(k,n,d,offset,shape,xyz);
 return [
 c('alternator','60-ampere alternator','The engine belt turns the alternator, the normal source for the nominal 28-volt DC system.',[-.43,0,.22],'generator',[-.65,0,.30]),
 c('battery','24-volt main battery','The main battery supplies stored energy and connects through a battery contactor.',[-.34,0,-.26],'battery',[-.65,0,-.29]),
 c('master','Master switch and contactor','The BAT and ALT halves control the main battery and alternator respectively.',[0,.32,.20],'selector',[0,0,-.03]),
 c('buses','Primary distribution buses','The primary distribution buses supply equipment through circuit protection.',[.41,.12,.15],'bus',[.68,0,.30]),
 c('standby','Standby battery','In the Nav III installation the standby battery can sustain the essential bus if the two main sources are lost.',[.32,-.14,-.32],'battery',[.02,0,-.50]),
 c('essential','Essential bus','The essential bus supplies a selected group of instruments and equipment.',[.51,.05,-.12],'bus',[.70,0,-.32])
 ];
}
mount('cessna172',['skyhawk_cabin.panel'],'skyhawk-dc','172S Nav III electrical supply','A belt-driven alternator and a main battery feed the 28-volt system. The standby battery and essential bus shown here belong to the Nav III installation in Cessna’s figure 7-7.',references.sky,sky(),[-.22,.32]);
const tankParts=[
 part('lower','Lower tank skin','The pressed lower skin forms the bottom and sides of the fuel space.',[0,0,-.47],r=>{
   r.box(-.41,-.32,-.16,.41,.32,-.145,'#a6b6b5');
   for(const s of [-1,1]){r.box(-.41,s*.315-.006,-.15,.41,s*.315+.006,.13,'#889b9f');r.box(s*.405-.006,-.31,-.15,s*.405+.006,.31,.13,'#889b9f');}
 }),
 part('top','Upper stainless-steel skin','The roof of the tank carries three transverse rows of spot welds.',[0,.15,.53],r=>r.box(-.41,-.32,.135,.41,.32,.15,'#b3c1ba')),
 part('channels','Three stiffener channels','The factory bulletin identifies three channels under the upper skin. Their ends lie near the tank side edges.',[-.40,0,.18],r=>{
   for(const pos of [-.25,0,.25]){r.box(pos-.021,-.30,.09,pos+.021,.30,.099,'#96a5a6');for(const s of [-1,1])r.box(pos+s*.02-.004,-.30,.095,pos+s*.02+.004,.30,.135,'#76898d');}
 }),
 part('welds','Spot-weld rows','These locations represent the joints between the upper skin and the channels. The spacing is illustrative.',[.45,0,.24],r=>{
   for(const pos of [-.25,0,.25])for(let i=0;i<7;i++)cyl(r,[pos,(i-3)*.08,.151],z,0,.002,.007,'#626d6e',8);
 })
];
mount('piperj5',['wings.starboard'],'cub-tank','Early J-5A wing-tank construction','Piper service bulletin 65 documents stainless-steel wing tanks on J5A/J5B serials 5-2 through 5-1384. The section shows the three upper-skin stiffeners. Tank contours and the exact serial of this exhibit are unverified.',references.cubTank,tankParts,[-.64,.47]);
mount('piperj5',['gear.port','gear.starboard'],'cub-expander-brake','J-5 original expander-tube brake','In the original J-5 brake an annular tube expands to push individual blocks against the inside of a wheel drum. Restored aircraft may carry a different brake. The block count and dimensions are illustrative.',references.cubBrake,[
 part('drum','Wheel brake drum','The drum turns with the wheel. Its inner cylindrical wall is the friction surface.',[0,.51,0],r=>turn(r,zero,y,[[-.08,.237],[-.08,.268],[.12,.268],[.12,.237],[-.08,.237]],'#97a4a4',{start:.58,sweep:TAU*.77,n:30})),
 part('tube','Expander tube','Hydraulic pressure expands the flexible tube radially beneath the brake blocks.',[0,0,.40],r=>turn(r,zero,y,[[-.049,.151],[-.052,.177],[-.038,.193],[.045,.193],[.057,.176],[.048,.151],[-.049,.151]],'#515b58',{n:32})),
 part('blocks','Individual friction blocks','The expanding tube presses these separate blocks outward into the drum.',[.44,0,.08],r=>{for(let i=0;i<12;i++)turn(r,zero,y,[[-.046,.194],[-.046,.235],[.049,.235],[.049,.194],[-.046,.194]],'#a0937b',{start:i*TAU/12+.035,sweep:TAU/12-.07,n:4});}),
 part('mount','Backing plate and axle opening','The fixed backing structure supports the brake assembly around the axle.',[0,-.49,0],r=>sleeve(r,[0,-.076,0],y,-.018,.018,.225,.072,'#7c898c',30))
],[-.76,.30]);
export function getCivilAirframeService(vehicle,id){return index.get(vehicle+'/'+id)||null;}
