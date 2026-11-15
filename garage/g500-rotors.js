// Dimensions are metres. Disc origins lie halfway between the two swept faces.
import {sleeve,turn,metal,steel,dark,y,TAU} from './mechanism-shapes.js';
const catalog='https://www.bremboparts.com/europe/en/catalogue/';
export const brakeRefs={
 front:{label:'Brembo 09.A917.11 · front disc specifications',url:catalog+'disc/09-A917-11'},
 rear:{label:'Brembo 08.7725.20 · rear disc specifications',url:catalog+'disc/08-7725-20'},
 shoes:{label:'Brembo G500 application · parking shoes S 50 510',url:catalog+'mercedes-benz-g-class-w463-g-500-463-247-463-248-463-249-463-240-463-241/000010142-1'},
 rearBores:{label:'ATE 24.0116-0110.1 · bolt and parking-drum bores',url:'https://www.ic24.uk/products/9bd078-brake-disc-1-pc-24-0116-0110-1'},
 frontBores:{label:'ATE 24.0130-0217.1 · front disc hole pattern',url:'https://www.niparts.com/Fac/2419F6/ATE/24013002171.html'}
};
export const g500DiscSpecs={
 front:{radius:.1575,thickness:.030,height:.083,hatRadius:.084,hatBore:.076},
 rear:{radius:.136,thickness:.016,height:.097,hatRadius:.087,hatBore:.080}
};
export const g500BoltPattern={count:5,radius:.065,holeRadius:.0075,phase:.75*TAU/5};
const origin=[0,0,0],polar=(rad,a)=>[rad*Math.cos(a),rad*Math.sin(a)];
const pilot=.0425,flangeThickness=.005;
function place(r,c,side,scale){
 return {polygon:(p,color,stroke)=>r.polygon(p.map(([x,y,z])=>[c[0]+x*scale,c[1]+y*scale*side,c[2]+z*scale]),color,stroke)};
}
// Tile each 72° slice between its bolt bore and the surrounding hub annulus.
// The five bores and the center pilot are empty all the way through the flange.
function mountingFace(r,outer,station){
 const {count,radius,holeRadius,phase}=g500BoltPattern;
 for(let i=0;i<count;i++){
  const a=phase+i*TAU/count,h=TAU/(2*count),center=polar(radius,a),edge=[];
  for(let j=0;j<=6;j++)edge.push(polar(outer,a-h+j*h/3));
  edge.push(polar((outer+pilot)/2,a+h));
  for(let j=0;j<=6;j++)edge.push(polar(pilot,a+h-j*h/3));
  edge.push(polar((outer+pilot)/2,a-h));
  const hole=edge.map(([x,z])=>{
   const angle=Math.atan2(z-center[1],x-center[0]);
   return [center[0]+holeRadius*Math.cos(angle),center[1]+holeRadius*Math.sin(angle)];
  });
  const p=(v,s)=>[v[0],s,v[1]],upper=station,lower=station-flangeThickness;
  for(let j=0;j<edge.length;j++){
   const k=(j+1)%edge.length;
   for(const s of [upper,lower])r.polygon([p(edge[j],s),p(edge[k],s),p(hole[k],s),p(hole[j],s)],s===upper?metal:steel,false);
   r.polygon([p(hole[j],lower),p(hole[j],upper),p(hole[k],upper),p(hole[k],lower)],dark,false);
   if(j>=8&&j<14)r.polygon([p(edge[j],lower),p(edge[k],lower),p(edge[k],upper),p(edge[j],upper)],steel,false);
  }
 }
}
function frictionRing(r,rear){
 const {radius,hatRadius,hatBore,thickness}=g500DiscSpecs[rear?'rear':'front'],half=thickness/2;
 if(rear){
  // The inner diameter leaves the full 160 mm parking-brake drum open.
  turn(r,origin,y,[[-half,hatBore],[-half,radius],[half,radius],[half,hatRadius]],metal,{n:40});
  return;
 }
 const gap=.007;
 sleeve(r,origin,y,-half,-gap,radius,hatBore,metal,40);
 turn(r,origin,y,[[gap,hatBore],[gap,radius],[half,radius],[half,hatRadius]],metal,{n:40});
 // Only the ventilated construction is dimensioned. The vane pattern is illustrative.
 for(let i=0;i<24;i++){
  const a=i*TAU/24;
  const corner=[polar(.085,a-.024),polar(.153,a+.021),polar(.153,a+.046),polar(.085,a+.012)];
  for(let j=0;j<4;j++){const k=(j+1)%4,p=(n,y)=>[corner[n][0],y,corner[n][1]];
   r.polygon([p(j,-gap),p(k,-gap),p(k,gap),p(j,gap)],steel,false);}
 }
}
export function drawG500Rotor(r,c,rear,side=1,scale=1){frictionRing(place(r,c,side,scale),rear);}
export function drawG500Disc(r,c,rear,side=1,scale=1){
 const mesh=place(r,c,side,scale);
 const {thickness,height,hatRadius,hatBore}=g500DiscSpecs[rear?'rear':'front'];
 const mount=height-thickness/2;
 frictionRing(mesh,rear);
 turn(mesh,origin,y,[[thickness/2,hatRadius],[mount,hatRadius]],steel,{n:30});
 const bottom=rear?-thickness/2:.007;
 turn(mesh,origin,y,[[bottom,hatBore],[mount-flangeThickness,hatBore]],steel,{n:30});
 mountingFace(mesh,hatRadius,mount);
}
export function drawG500ParkingShoe(r,c,side,shoe,scale=1,engagement=0){
 const mesh=place(r,c,side,scale);
 const radius=.080,clearance=.0005*(1-engagement);
 const center=[-shoe*clearance,0,0],start=shoe<0?1.75:-1.39;
 // Leave radial clearance in the released position; lining width is 40 mm.
 turn(mesh,center,y,[[.018,.076],[.018,radius],[.058,radius],[.058,.076],[.018,.076]],'#46403a',{n:24,start,sweep:2.79});
 turn(mesh,center,y,[[.036,.062],[.036,.076],[.040,.076],[.040,.062],[.036,.062]],'#9b7756',{n:24,start,sweep:2.79});
}
export function drawG500Caliper(r,c,rear,side=1,scale=1){
 const mesh=place(r,c,side,scale),radius=g500DiscSpecs[rear?'rear':'front'].radius;
 // The two cheeks sit outside the pads. Only the bridge crosses the plane of the disc.
 const cheek=(lo,hi,outer,inner)=>turn(mesh,origin,y,[[lo,inner],[lo,outer],[hi,outer],[hi,inner],[lo,inner]],dark,{n:14,start:.48,sweep:rear?.79:.98});
 const clearance=rear?.017:.031,depth=rear?.034:.049;
 for(const sign of [-1,1])cheek(sign*clearance,sign*depth,radius*1.05,radius*.69);
 // Bridge ends surround an open inspection window above the rotor.
 for(const start of [.52,rear?1.14:1.30])turn(mesh,origin,y,[[-depth,radius*1.015],[-depth,radius*1.085],[depth,radius*1.085],[depth,radius*1.015],[-depth,radius*1.015]],steel,{n:5,start,sweep:.12});
}
export function drawG500BrakePad(r,c,rear,side,pad,scale=1,release=0){
 const mesh=place(r,c,side,scale);
 const {radius,thickness}=g500DiscSpecs[rear?'rear':'front'];
 const contact=thickness/2+.0003+release*(rear?.001:.004);
 const segment=(a,b,outer,inner,color)=>{
  const start=a*pad,end=b*pad;
  turn(mesh,origin,y,[[start,inner],[start,outer],[end,outer],[end,inner],[start,inner]],color,{n:13,start:.56,sweep:rear?.64:.81});
 };
 const lining=rear?.005:.006,backing=.0028;
 segment(contact,contact+lining,radius*.956,radius*.702,'#514b42');
 segment(contact+lining,contact+lining+backing,radius*.97,radius*.69,steel);
}
export function drawG500InstalledCaliper(r,c,rear,side){
 drawG500Caliper(r,c,rear,side);
 for(const pad of [-1,1])drawG500BrakePad(r,c,rear,side,pad);
 if(rear)for(const shoe of [-1,1])drawG500ParkingShoe(r,c,side,shoe);
}
