import {basis,point,part,study,cyl,turn,z,TAU} from './mechanism-shapes.js';
import {barrel,pipe} from './road-primitives.js';
const factory={label:'Porsche · 992 Carrera S Cabriolet, chassis and suspension',url:'https://newsroom.porsche.com/dam/jcr%3A027b3198-602a-498d-b4fc-52e6e3b5261a/2020_911_Carrera_S_and_4S_Cabriolet_US_Press_Kit.pdf'};
const rearPlate={label:'992.1 rear axle · standard 0N1 five-link wheel guidance',url:'https://d911api.datadial.net/diagrams/d/50709/0/'};
const parts=[],metal='#97a4a5',iron='#5c696a',steel='#a3afad';
const mix=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t);
const strut=(r,sites)=>{
 const [base,top]=sites,delta=top.map((v,i)=>v-base[i]),len=Math.hypot(...delta),b=basis(delta);
 barrel(r,base,mix(base,top,.59),.031,iron,7);barrel(r,mix(base,top,.59),top,.013,steel,6);
 // The installed coil is a continuous pitched strip. The enlarged damper section
 // uses a closed round wire; coiling never creates a stack of intersecting rings.
 const p=(i,edge)=>point(base,b,len*(.26+.67*i/30)+edge*.006,.044,TAU*4*i/30);
 for(let i=0;i<30;i++)r.polygon([p(i,-1),p(i,1),p(i+1,1),p(i+1,-1)],i%3?'#536165':'#6f7b7c',false);
};
for(const [s,hand] of [[-1,'left'],[1,'right']]){
 const label=s<0?'Left':'Right';
 const add=(key,name,description,offset,source,draw)=>parts.push({...part('p992-suspension.'+key+'-'+hand,label+' '+name,description,offset,draw),source});
 add('front-strut','front spring strut','The front wheel carrier locates the lower end of this MacPherson strut. Its upper mount sits in the body tower.',[0,s*.27,.32],factory,r=>strut(r,[[-1.20,s*.706,.359],[-1.15,s*.555,.771]]));
 add('front-arms','front wishbone and trailing link','Two links locate the lower joint while the strut controls the top of the wheel carrier.',[-.20,s*.33,-.14],factory,r=>{
  const hub=[-1.20,s*.729,.296];barrel(r,hub,[-1.14,s*.376,.285],.020,metal,5);barrel(r,[-1.17,s*.594,.292],[-.924,s*.415,.304],.018,metal,5);
 });
 // The rear coil-over stands on the wheel carrier ahead of and above the
 // drive shaft, inboard of the two upper links' outer joints.
 add('rear-damper','rear spring and damper','The coil carries load through its seats while the shock controls wheel motion. Five separate links guide the rear wheel.',[0,s*.28,.28],rearPlate,r=>strut(r,[[1.20,s*.60,.452],[1.27,s*.556,.812]]));
 // Five separate links from the hub carrier to the rear subframe. Mount
 // coordinates and cross sections illustrate the linkage topology.
 for(const [key,name,inner,outer] of [
  ['upper-front','rear upper forward link',[1.010,.430,.487],[1.226,.709,.443]],
  ['upper-rear','rear upper rearward link',[1.476,.50,.525],[1.285,.701,.444]],
  ['lower','rear lower transverse link',[1.266,.367,.239],[1.264,.731,.262]],
  ['longitudinal','rear longitudinal link',[.932,.452,.290],[1.216,.714,.278]],
  ['toe','rear toe link',[1.477,.442,.336],[1.33,.70,.29]]
 ])add(key,name,'This independent link guides the wheel carrier at the rear axle. Compare its body-side pivot with the four other links.',[0,s*.26,key.startsWith('upper')?.24:-.19],rearPlate,r=>{
  const mirror=([x,y,z])=>[x,y*s,z];barrel(r,mirror(inner),mirror(outer),key==='lower'?.020:.014,metal,5);
 });
}
export const suspensionGroup={id:'p992-suspension',name:'Front struts and five-link rear axle',description:'The front wheels steer on MacPherson struts. Five links on each side guide the standard rear axle. The hard points and spring winding are schematic.',view:'hero',category:'service',internal:true,source:factory,parts};
export const damperSection=study('p992-damper','Spring and damper section',
 'Wheel travel moves the piston rod into the oil-filled damper, while the spring shortens between its two seats. The section shows the relationship between the parts. Valve passages and spring rates are illustrative.',factory,[
 part('tube','Damper body','The lower tube and spring seat move with the wheel.',[-.26,0,-.18],r=>{
  turn(r,[0,0,0],z,[[-.28,.039],[-.27,.058],[.067,.058],[.079,.046],[.079,.030]],iron,{n:27,sweep:TAU*.65});cyl(r,[0,0,0],z,-.120,-.108,.109,iron,25);
 }),
 part('rod','Piston and rod','The piston travels within the oil-filled tube.',[.23,0,0],(r,p)=>{
  const h=.038-.085*(1-Math.cos(TAU*p))/2;cyl(r,[0,0,h],z,-.047,-.036,.037,steel);cyl(r,[0,0,h],z,-.036,.235,.017,steel);
 }),
 part('coil','Compression spring','When the two seats approach, the distance between adjacent coils closes.',[0,.31,.08],(r,p)=>{
  const h=.271-.085*(1-Math.cos(TAU*p))/2;const pts=Array.from({length:91},(_,i)=>[-.078*Math.cos(5*TAU*i/90),.078*Math.sin(5*TAU*i/90),-.102+(h+.102)*i/90]);pipe(r,pts,.008,iron,7);
 }),
 part('mount','Upper seat and mount','The upper spring seat and rod attachment stay together.',[0,0,.32],(r,p)=>{const h=.271-.085*(1-Math.cos(TAU*p))/2;cyl(r,[0,0,h],z,0,.012,.109,iron);cyl(r,[0,0,h],z,.012,.036,.066,'#404848');})
],'Watch the spring and piston move through one compression and rebound cycle.');
