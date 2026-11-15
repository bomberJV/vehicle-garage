// Mercedes G-Class technical introduction, M113.962 engine data (2007, p. 34).
// The cross-plane arrangement follows the 1-5-4-2-6-3-7-8 firing sequence.
// The axial stations use the M113 family's 106 mm cylinder spacing. Bearing
// widths, deck height, bank stagger and web profiles remain estimates.
import {engineShapes} from './engine-shapes.js';
import {basis,point} from './mechanism-shapes.js';
export const m113DataSheet={label:'Mercedes-Benz G-Class technical introduction · G 500, M113.962 engine data',url:'https://www.docdroid.net/file/download/mfdy/einfuehrung-g-2006.pdf'};
export const m113Stations=[-.159,-.053,.053,.159];
// Installed crank axis, fitted between the axle housing and the fixed cylinder
// heads. The moving assembly retains its measured bore, throw and rod length.
export const m113CrankZ=.680;
export const m113PanRail=-.029;
export const m113PanOutline=[[-.392,-.132],[-.350,-.191],[.301,-.191],[.359,-.145],
 [.359,.144],[.309,.192],[-.327,.192],[-.392,.116]];
const throwRadius=.042,bore=.0485,chain=[0,1,3,2],gray='#8f9b9f',iron='#637178';
const axis=side=>[0,side*Math.SQRT1_2,Math.SQRT1_2];
const along=(p,n,t)=>p.map((v,i)=>v+n[i]*t);
const rodLength=.1485; // A 113 030 00 20, shared with the 4.3-litre M113.
export function m113Pin(i,phase=0){
 const a=Math.PI*(.25+.5*chain[i])+2*Math.PI*phase;
 return [m113Stations[i],throwRadius*Math.sin(a),throwRadius*Math.cos(a)];
}
export function m113Cell(i,side,phase=0){
 const x=m113Stations[i]+side*.009,n=axis(side),big=m113Pin(i,phase);big[0]=x;
 const projection=big[1]*n[1]+big[2]*n[2];
 const distance=projection+Math.sqrt(rodLength**2-throwRadius**2+projection**2);
 const pin=along([x,0,0],n,distance);
 return {i,side,x,n,big,pin,top:along(pin,n,.032)};
}
const shaft=(t,x0,x1,y,z,r,c,n=14)=>t.cyl([x0,y,z],[x1,y,z],r,c,n);
export function drawM113Crank(t,phase=0){
 for(let j=0;j<5;j++){
  const x=m113Stations[0]-.053+j*.106;
  const length=j===0?.039:j===4?.035:.026;
  shaft(t,x-length,x+length,0,0,.028,gray);
 }
 for(let i=0;i<4;i++){
  const [cx,y,z]=m113Pin(i,phase);
  shaft(t,cx-.021,cx+.021,y,z,.024,gray);
  // Counterweight extends to the opposite side of its main journal.
  for(const s of [-1,1]){
   const cheek=cx+s*.027,ny=y/throwRadius,nz=z/throwRadius;
   const outline=[[-.072,-.018],[-.057,-.040],[-.026,-.039],[.043,-.023],[.056,-.014],[.059,.013],[.043,.023],[-.026,.039],[-.057,.040],[-.072,.018]];
   const face=xx=>outline.map(([d,b])=>[xx,d*ny-b*nz,d*nz+b*ny]);
   const a=face(cheek-.006),b=face(cheek+.006);
   t.poly(a,iron);t.poly(b,gray);
   for(let j=0;j<a.length;j++){const k=(j+1)%a.length;t.poly([a[j],a[k],b[k],b[j]],iron);}
  }
 }
}
function piston(t,cell){
 const {n,top}=cell;t.cyl(along(top,n,-.054),top,bore-.0005,'#b5bdba',14);
}
function wrist(t,{pin}){
 const [x,y,z]=pin;shaft(t,x-.025,x+.025,y,z,.009,'#b49b68',8);
}
function rod(t,{pin,big}){
 t.cyl(big,pin,.009,gray,8);
 const [x,y,z]=big; // Bronze-colored big-end bearing inside the rod eye.
 t.tube([x-.008,y,z],[x+.008,y,z],.031,.0242,iron,8);
}
function rings(t,{n,top}){
 // The installed pack is a thin two-sided strip. The ring study opens its rails.
 const b=basis(n),N=14;
 for(const depth of [.007,.013,.022]){
  const c=along(top,n,-depth);
  for(let j=0;j<N;j++){
   const angle=k=>.032+(2*Math.PI-.064)*k/N;
   const q=(k,h)=>point(c,b,h,bore-.0001,angle(k));
   t.poly([q(j,0),q(j+1,0),q(j+1,.0015),q(j,.0015)],'#515d61');
  }
 }
}
export function drawM113Group(r,t,name,phase=0,showInstances=true){
 if(name==='crankshaft'){drawM113Crank(t,phase);return;}
 for(const s of [-1,1])for(let i=0;i<4;i++){
  const cell=m113Cell(i,s,phase),draw=()=>{
   if(name==='pistons')piston(t,cell);
   else if(name==='wrist')wrist(t,cell);
   else if(name==='connecting-rods')rod(t,cell);
   else if(name==='piston-rings')rings(t,cell);
  };
  if(showInstances)r.instance(s+'-'+i,draw);else draw();
 }
}
export const m113Slider={
 id:'g500-m113-motion',name:'M113 crankshaft and pistons',source:m113DataSheet,animated:true,
 description:'Each pair of connecting rods shares one of four crankpins. The two banks meet at 90°. The cylinder spacing is 106 mm and the 42 mm crank throw gives 84 mm of piston travel. The rod profile and installed deck height are approximate.',
 motionDescription:'Watch the crankpin turn while the wrist pin travels along the cylinder axis.',
 groups:[{id:'slider',name:'Rotating assembly',parts:[
  ['piston','Eight pistons',[0,0,.09]],['rings','Piston rings',[0,.068,.061]],['pin','Wrist pins',[.043,.043,.023]],
  ['rod','Connecting rods',[0,-.069,-.015]],['crank','Crankshaft',[0,0,-.076]]
 ].map(([id,name,offset])=>({id:'slider.'+id,name,offset,description:name==='Crankshaft'?'The four offset crankpins carry the paired big ends.':'Inspect this part in the rotating assembly.'}))}],
 draw(r,phase=0){
  const t=engineShapes(r);
  for(const [key,group] of [['piston','pistons'],['rings','piston-rings'],['pin','wrist'],['rod','connecting-rods'],['crank','crankshaft']])
   r.tag('slider.'+key,()=>drawM113Group(r,t,group,phase,false));
 }
};
