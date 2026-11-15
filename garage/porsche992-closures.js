import {cyl,sleeve,turn,part,study,x,y,z,TAU} from './mechanism-shapes.js';
import {barrel,pipe} from './road-primitives.js';
import {box,plus} from './road-service-geometry.js';
import {getDoorDetail} from './door-detail.js';

const source=(label,url)=>({label,url});
const doorSource=source('992.1 Carrera · door shell, striker and hinges','https://www.design911.co.uk/diagrams/d/50823/0/');
const lockSource=source('992.1 Carrera · door handles, lock and Bowden cable','https://d911api.datadial.net/diagrams/d/50826/0');
const windowSource=source('Porsche Aftersales · 992 window regulator and motor','https://static.nhtsa.gov/odi/tsbs/2025/MC-11015113-0001.pdf');
const steeringSource=source('992.1 Carrera · steering gear, track rods and outer joints, plate 403-000','https://www.oematch.com/diagrams/d/50687/0/');
const columnSource=source('992.1 Carrera · adjustable steering column, plate 403-300, option 2C7','https://www.design911.co.uk/diagrams/d/50705/0/');
const motorSource=source('Porsche technical information · 992 electric steering-column servo and BCM','https://static.nhtsa.gov/odi/tsbs/2021/MC-10199812-0001.pdf');
const metal='#9aa8a8',iron='#69767a',black='#3c4447';
const rod=(r,a,b,rad,col)=>barrel(r,a,b,rad,col,7);
const sides=[[-1,'left'],[1,'right']];
const pieces=[];
for(const [s,hand] of sides){
 const side=s<0?'Left':'Right',out=[0,s*.37,.04],yy=s*.786,lock=[.596,yy,.619],motor=[.010,yy,.511];
 const row=(id,name,desc,offset,source,draw)=>pieces.push({...part('p992-doors.'+id+'-'+hand,side+' '+name,desc,offset,draw),source});
 row('hinges','door hinges','Two hinges on the A-pillar carry the door. Open the hinge to separate its leaves, pin and bushings.',out,doorSource,r=>{
  for(const h of [.405,.664]){
   box(r,[-.648,yy,h],[.069,.025,.046],iron);box(r,[-.611,yy-s*.018,h],[.065,.018,.034],metal);rod(r,[-.632,yy,h-.031],[-.632,yy,h+.030],.008,metal);
  }
 });
 row('lock','latch and release cable','The door handle pulls a Bowden cable to release the latch from the body striker.',out,lockSource,r=>{
  box(r,lock,[.044,.043,.086],iron);pipe(r,[plus(lock,[0,0,.015]),[.50,yy,.657],[.33,yy-s*.012,.674],[.07,yy-s*.009,.667]],.005,black,6);
 });
 row('striker','body striker','The loop is fixed to the B-pillar, opposite the latch on the trailing edge of the door.',[.27,s*.18,.11],doorSource,r=>{
  const xx=.637;box(r,[xx,yy,.618],[.012,.046,.061],iron);pipe(r,[[xx,yy,.601],[xx-.020,yy,.601],[xx-.020,yy,.635],[xx,yy,.635]],.005,metal,6);
 });
 row('regulator','window lift and guides','The motor winds the regulator cable. Two carriers guide the frameless glass as it rises.',[0,s*.27,.28],windowSource,r=>{
  const bottom=[[-.379,yy,.354],[.230,yy,.350]],top=[[-.426,yy,.745],[.184,yy,.717]];
  for(let i=0;i<2;i++){
   rod(r,bottom[i],top[i],.011,iron);const c=top[i].map((n,j)=>(n+bottom[i][j])*.5);box(r,c,[.052,.025,.038],metal);
   rod(r,bottom[i],top[1-i],.003,metal);
  }
  box(r,motor,[.068,.023,.066],black);rod(r,motor,plus(motor,[-.044,0,-.034]),.018,iron);
 });
}
const doors={id:'p992-doors',name:'Door hinges, latches and window lifts',description:'Each frameless door has two hinges, a cable-operated latch and a dual-guide window regulator. The striker stays with the body when the latch opens.',category:'service',view:'hero',internal:true,parts:pieces,source:doorSource};
const upper=[-.337,-.327,.795],universal=[-.778,-.327,.595],input=[-.998,-.303,.358],rack=[-1.012,0,.342];
const piece=(id,name,description,offset,source,draw)=>({...part('p992-steering.'+id,name,description,offset,draw),source});
const steering={id:'p992-steering',name:'Front steering and electric column · option 2C7',description:'The column and intermediate shaft connect the wheel to the power-assisted steering rack. On a car equipped with 2C7, an electric drive also adjusts the position of the steering wheel.',category:'service',view:'hero',internal:true,source:columnSource,parts:[
 piece('column','Tilting and telescoping column','The upper shaft sits inside the jacket behind the wheel. Open the adjustment drive to see how rotary motion positions the column.',[0,-.35,.16],columnSource,r=>{
  rod(r,upper,universal,.019,metal);rod(r,[-.407,-.327,.765],[-.673,-.327,.644],.033,iron);box(r,[-.586,-.327,.689],[.052,.113,.044],black);
 }),
 piece('servo','Column adjustment drive','The 2C7 system provides electric reach and tilt. This drive illustrates the movement of the adjustment screw.',[0,-.38,0],motorSource,r=>{
  rod(r,[-.537,-.394,.685],[-.606,-.394,.685],.023,iron);box(r,[-.607,-.376,.683],[.046,.048,.047],black);
  rod(r,[-.583,-.368,.686],[-.460,-.368,.741],.008,metal);
 }),
 piece('shaft','Intermediate shaft and joints','The jointed shaft carries the driver’s rotation down to the rack input.',[0,0,-.30],columnSource,r=>{
  rod(r,universal,input,.013,metal);for(const p of [universal,input]){box(r,p,[.029,.041,.030],iron);rod(r,plus(p,[0,-.023,0]),plus(p,[0,.023,0]),.007,metal);}
 }),
 piece('rack','Front steering gear and assist drive','The rack housing carries the pinion, rack and electric assistance unit. A transverse movement changes the front wheel angles.',[-.36,0,.08],steeringSource,r=>{
  rod(r,plus(rack,[0,-.40,0]),plus(rack,[0,.40,0]),.029,metal);rod(r,[-1.048,.071,.374],[-1.048,.243,.374],.039,iron);box(r,input,[.057,.064,.055],iron);
 }),
 ...sides.map(([s,hand])=>piece('tie-'+hand,(s<0?'Left':'Right')+' track rod and outer joint','The track rod joins the rack to the steering arm at the front hub. A bellows protects the inner joint.',[0,s*.42,0],steeringSource,r=>{
  const p=plus(rack,[0,s*.37,0]),end=[-1.144,s*.740,.351];rod(r,p,end,.009,metal);
  for(let i=0;i<5;i++){const t=.028*i,a=plus(p,[-t*.355,s*t,.002*t]);rod(r,a,plus(a,[-.005,s*.014,0]),.022-i*.0015,black);}
  rod(r,plus(end,[0,0,-.010]),plus(end,[0,0,.023]),.014,iron);
 }))]};
const servo=study('p992-column-drive','Steering-column adjustment drive',
 'The service literature identifies an electric column servo and the front-end electronics module. This enlarged lead-screw section illustrates rotary-to-linear adjustment. The screw pitch and travel are schematic.',motorSource,[
 part('housing','Motor and gear housing','The motor turns the drive inside this housing.',[-.32,0,0],r=>{cyl(r,[-.22,0,0],x,-.067,.019,.070,iron,19);box(r,[-.158,0,0],[.09,.14,.122],black);}),
 part('screw','Lead screw','Follow the helix as the motor turns the screw.',[0,0,.28],(r,p)=>{
  cyl(r,[0,0,0],x,-.13,.223,.020,metal,16);const pts=Array.from({length:97},(_,i)=>[-.13+.353*i/96,.027*Math.cos(TAU*(12*i/96+p)),.027*Math.sin(TAU*(12*i/96+p))]);pipe(r,pts,.004,'#a7987b',6);
 }),
 part('slider','Travelling bracket','A captive nut converts screw rotation to movement along the column. The view shows a short outward stroke.',[.24,.20,0],(r,p)=>{
  const c=[-.066+.353*p/12,0,0];sleeve(r,c,x,-.030,.030,.055,.030,iron,17);box(r,plus(c,[0,.078,0]),[.058,.051,.062],metal);
 })],'One turn advances the illustrated nut along the screw. The movement repeats from its starting position.');
export const hardwareGroups=[doors,steering];
export function hardwareDetail(id){
 if(id==='p992-steering.servo'||id==='p992-steering.column')return servo;
 if(!id.startsWith('p992-doors.'))return null;
 const [mechanism,hand]=id.slice('p992-doors.'.length).split('-');
 const sub={hinges:'hinge',lock:'latch',striker:'latch',regulator:'regulator'}[mechanism];
 const main=getDoorDetail('porsche992scab','shell.'+hand+'-door');
 return sub&&main?getDoorDetail('porsche992scab',main.id+'.'+sub):null;
}
