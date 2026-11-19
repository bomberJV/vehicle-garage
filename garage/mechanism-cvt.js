import {TAU,metal,steel,dark,gold,tint,turn,cyl,sleeve,part,study,y,origin} from './mechanism-shapes.js';
const source={label:'Honda · 2023 HR-V press kit, CVT pulleys and steel belt',url:'https://hondanews.com/en-US/releases/release-db2492147c55da663fd32edfea1e6a46-2023-honda-hr-v-press-kit'};
const beltSource={label:'Bosch · steel pushbelt and ring packs',url:'https://www.bosch-mobility.com/en/solutions/transmission-technology/pushbelt/'};
const spacing=2.0,z0=.82;
const initialLength=2*spacing+TAU*.57;
function loopLength(a,b){
  const theta=Math.acos((a-b)/spacing);
  return 2*Math.sqrt(spacing**2-(a-b)**2)+2*(Math.PI-theta)*a+2*theta*b;
}
export function pulleyState(phase=0){
  // Solve the open-belt length equation for the mean radius at a given radius difference.
  const difference=-.31*Math.cos(TAU*phase),theta=Math.acos(difference/spacing);
  const mean=(initialLength-2*Math.sqrt(spacing**2-difference**2)-difference*(Math.PI-2*theta))/TAU;
  const input=mean+difference/2,output=mean-difference/2;
  return {input,output,speedRatio:input/output,length:loopLength(input,output)};
}
const flank=.25,grooveHalfWidth=.09;
const beltPlane=(sign,radius)=>sign*flank*(radius-.57);
function beltPath(a,b){
  const theta=Math.acos((a-b)/spacing),c=Math.cos(theta),s=Math.sin(theta);
  const x0=-spacing/2,x1=spacing/2;
  const ya=beltPlane(-1,a),yb=beltPlane(1,b);
  const t0=[x0+a*c,z0+a*s,ya],t1=[x1+b*c,z0+b*s,yb],b0=[x0+a*c,z0-a*s,ya],b1=[x1+b*c,z0-b*s,yb];
  const straight=Math.hypot(t1[0]-t0[0],t1[1]-t0[1]);
  const arcRight=2*theta*b,total=loopLength(a,b);
  const line=(p,q,f)=>p.map((v,i)=>v+f*(q[i]-v));
  return distance=>{
    let d=((distance%total)+total)%total;
    if(d<straight)return line(t0,t1,d/straight);
    d-=straight;
    if(d<arcRight){const angle=theta-d/b;return [x1+b*Math.cos(angle),z0+b*Math.sin(angle),yb];}
    d-=arcRight;
    if(d<straight)return line(b1,b0,d/straight);
    const angle=-theta-(d-straight)/a;return [x0+a*Math.cos(angle),z0+a*Math.sin(angle),ya];
  };
}
// Advance by 80 of 88 element pitches per loop. The smooth speed profile makes both
// pulleys complete two revolutions while keeping belt and sheave surface speeds equal.
const phaseSteps=192,elementCount=88,travel=initialLength*80/elementCount;
const samples=Array.from({length:phaseSteps},(_,i)=>{
  const phase=(i+.5)/phaseSteps;
  return {...pulleyState(phase),bias:Math.cos(TAU*phase)**2-.5};
});
const average=f=>samples.reduce((sum,state)=>sum+f(state),0)/phaseSteps;
const speedBias=(2*TAU/travel-average(s=>1/s.input))/average(s=>s.bias/s.input);
const phaseTable=[[0,0,0]];
for(const state of samples){
  const distance=travel*(1+speedBias*state.bias)/phaseSteps,prior=phaseTable.at(-1);
  phaseTable.push([prior[0]+distance/state.input,prior[1]+distance/state.output,prior[2]+distance]);
}
function travelAt(phase){
  const f=Math.max(0,Math.min(1,phase))*phaseSteps,i=Math.floor(f),a=phaseTable[i],b=phaseTable[Math.min(i+1,phaseSteps)];
  return a.map((value,n)=>value+(b[n]-value)*(f-i));
}
function pulley(r,sign,phase,isMoving) {
  const state=pulleyState(phase),rad=sign<0?state.input:state.output,pos=[sign*spacing/2,0,z0];
  const rim=.85,hub=.22,side=isMoving?-sign:sign;
  const faceY=radius=>beltPlane(sign,rad)+side*(grooveHalfWidth+flank*(radius-rad));
  const v=faceY(rim),h=faceY(hub),base=side*.055;
  const profile=[[h,.13],[h,hub],[v,rim],[v+base,rim],[h+base,hub],[h+base,.13],[h,.13]];
  const near=side>0,start=.095*Math.PI,sweep=.83*Math.PI,body=isMoving?'#a9916b':'#849ba4';
  turn(r,pos,y,profile,body,{n:near?24:42,start:near?start:0,sweep:near?sweep:TAU});
  if(near){
    for(const angle of [start,start+sweep]){
      r.polygon(profile.slice(0,-1).map(([yy,rr])=>[pos[0]+rr*Math.cos(angle),yy,z0-rr*Math.sin(angle)]),isMoving?'#ddbc86':'#bdcdd0',false);
    }
  }
  const spoke=-travelAt(phase)[sign<0?0:1];
  // Painted radial marks on the unsectioned material follow the sheave surface.
  for(let i=0;i<12;i++){
    const a=spoke+TAU*i/12,angle=(-a%TAU+TAU)%TAU;
    if(near&&(angle<start+.035||angle>start+sweep-.035))continue;
    const tip=(rr,offset)=>[pos[0]+rr*Math.cos(a+offset),faceY(rr)+base+side*.002,z0+rr*Math.sin(a+offset)];
    r.polygon([tip(.44,-.014),tip(.44,.014),tip(.76,.014),tip(.76,-.014)],i%3===0?'#edcb83':'#b9c7c7',false);
  }
}
function belt(r,phase){
  const {input,output,length}=pulleyState(phase),path=beltPath(input,output),N=elementCount,step=length/N,travel=travelAt(phase)[2];
  for(let i=0;i<N;i++){
    const d=step*i+travel, a=path(d), b=path(d+step*.76);
    const dx=b[0]-a[0], dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l;
    const corners=p=>[[-.098,.021],[-.077,-.028],[.077,-.028],[.098,.021]].map(([yy,k])=>[p[0]+nx*k,p[2]+yy,p[1]+nz*k]);
    const A=corners(a),B=corners(b),color=i%8===0?gold:'#a7b7bc';
    for(let k=0;k<4;k++){const j=(k+1)%4;r.polygon([A[k],A[j],B[j],B[k]],tint(color,k===0?.76:1),false);}
    r.polygon(B,tint(color,.72),false);
  }
  for(const side of [-1,1])for(let i=0;i<N;i++){
    const a=path(step*i),b=path(step*(i+1)),w=.063*side;
    r.polygon([[a[0],a[2]+w-.008,a[1]],[a[0],a[2]+w+.008,a[1]],[b[0],b[2]+w+.008,b[1]],[b[0],b[2]+w-.008,b[1]]],dark,false);
  }
}
export const cvt=study('cvt','Continuously variable transmission','The facing halves of each pulley form a V-shaped groove. The front faces are sectioned to expose the belt where it touches the cones. Narrowing the primary groove sends the belt outward. The belt moves inward on the secondary pulley, changing the two shafts’ relative speed. The cutaway shows the variator section of the HR-V transaxle.',source,[
 part('primary-back','Primary fixed sheave','One face of the input pulley. The engine turns this shaft through the upstream coupling.',[-.3,-.9,.1],(r,t)=>pulley(r,-1,t,false)),
 part('primary-front','Primary sliding sheave','Hydraulic pressure changes the spacing of the input faces. The belt rides farther from the axis as the groove narrows.',[-.55,.92,.16],(r,t)=>pulley(r,-1,t,true)),
 part('secondary-back','Secondary fixed sheave','The output pulley passes torque toward the final reduction. A smaller running radius makes the shaft turn faster for a given belt speed.',[.37,.90,.08],(r,t)=>pulley(r,1,t,false)),
 part('secondary-front','Secondary sliding sheave','The output faces accommodate the complementary running radius and maintain clamping force on the belt.',[.5,-.95,.15],(r,t)=>pulley(r,1,t,true)),
 part('belt','Steel pushbelt','Many small steel elements contact the conical faces. The elements push against their neighbors. Two flexible stacks of steel rings guide them around the loop.',[0,0,1.25],belt),
 part('input','Input shaft','The primary pulley is driven about this axis. The two highlighted pulley faces and the belt expose the changing contact radius.',[-.5,-.4,-.64],r=>cyl(r,[-1,0,z0],y,-.58,.61,.12,metal)),
 part('output','Output shaft','The driven pulley feeds reduction gears and the front differential.',[.65,.40,-.7],r=>cyl(r,[1,0,z0],y,-.58,.61,.12,metal)),
],'Watch the primary groove narrow, the belt climb outward, and the secondary contact radius shrink. The bronze face on each shaft slides axially. The markers on both pulleys follow the passing belt.');
cvt.viewAngle=[-.25,.58];
export const pushbelt=study('pushbelt','Pushbelt element and ring packs','A short, enlarged section shows the construction that repeats around the variator. The sides of each element bear on the conical sheaves.',beltSource,[
 part('elements','Steel elements','Neighboring steel elements bear against one another on the transmitting span. The cutouts on both shoulders receive the ring packs.',[0,0,-.52],r=>{
   for(let i=0;i<6;i++){
     const xx=-.77+i*.30;
      // Tessellate the concave element as bands around the two ring seats.
     const segments=[[-.52,.52,.18,.48],[-.65,-.42,.48,.66],[-.14,.14,.48,.77],[.42,.65,.48,.66]];
     for(const [yl,yr,zl,zh] of segments)r.box(xx,yl,zl,xx+.21,yr,zh,steel);
   }
 }),
 ...[-1,1].map((s,i)=>part('rings-'+i,(i?'Right':'Left')+' ring pack','Multiple thin steel loops nest together. This short segment enlarges the layers at one shoulder of the elements.',[0,s*.64,.65],r=>{
   for(let k=0;k<5;k++)r.box(-1.0,s*.28-.105,.52+k*.018,1.12,s*.28+.105,.534+k*.018,k%2?metal:gold);
 })),
]);
