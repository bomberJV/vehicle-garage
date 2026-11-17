import {basis,point,cyl,sleeve,turn,TAU,x,y,z} from './mechanism-shapes.js';

export {cyl,sleeve,turn,TAU,x,y,z};
export const black='#364044',rubber='#30383b',alloy='#98a9a9',iron='#6c787c',foam='#aba393',copper='#aa7754',blue='#697d87';
export const O=[0,0,0],add=(a,b)=>a.map((v,i)=>v+b[i]);
export function box(r,c,size,color){const a=c.map((v,i)=>v-size[i]/2),b=c.map((v,i)=>v+size[i]/2);r.box(...a,...b,color);}
export function line(r,pts,rad,col,n=7){for(let j=1;j<pts.length;j++)r.rod(pts[j-1],pts[j],rad,col,n);}
export function port(r,c,axis,k=.018){sleeve(r,c,axis,-k*.92,k*.92,k,k*.63,alloy,10);}
export function blockShell(r,c,size,thick,color){
 for(let i=0;i<3;i++)for(const s of [-1,1]){
  const d=size.slice(),p=c.slice();d[i]=thick;p[i]+=s*(size[i]-thick)/2;
  box(r,p,d,color);
 }
}
export function motor(r,c,axis,rad,len,col=iron){
 turn(r,c,axis,[[-len*.50,0],[-len*.50,rad*.74],[-len*.42,rad], [len*.37,rad],[len*.51,rad*.80],[len*.51,0]],col,{n:14});
 cyl(r,c,axis,len*.51,len*.69,rad*.20,alloy,10);
}
// For the two cabin cores the published measurements describe the finned envelope;
// headers extend beyond it. End tubes finish flush with the top and bottom edges.
function exchanger(r,c,w,h,t,s,section,measured=false){
 if(section==='headers'){
  for(const side of [-1,1])box(r,add(c,[0,(w*.5+(measured?.0095*s:0))*side,0]),[t*1.09,.019*s,h+.009*s],iron);return;
 }
 const tubeZ=j=>measured?-(h-.004*s)/2+(h-.004*s)*j/7:h*((j+.5)/8-.5);
 if(section==='tubes'){
  for(let j=0;j<8;j++)box(r,add(c,[0,0,tubeZ(j)]),[measured?t:t*.95,w,.004*s],alloy);return;
 }
 // Two faces of a corrugated fin ribbon between each pair of flat tubes.
 const step=w/23;
 for(let j=0;j<7;j++)for(let i=0;i<23;i++){
  const yy=c[1]-w*.5+i*step,lo=c[2]+tubeZ(j)+.002*s,hi=c[2]+tubeZ(j+1)-.002*s;
  for(const [a,za,b,zb] of [[yy,lo,yy+step/2,hi],[yy+step/2,hi,yy+step,lo]])
   r.polygon([[c[0]-.44*t,a,za],[c[0]+.44*t,a,za],[c[0]+.44*t,b,zb],[c[0]-.44*t,b,zb]],j%2?'#819194':'#899799',false);
 }
}
export const g500HeaterPorts=[[-.665,-.048,1.075],[-.665,.010,1.075]];
export const coreCenter=[-.505,.028,1.080],evapCenter=[-.608,.035,1.081];
const comp=[-1.655,.294,.573],con=[-2.040,0,.856],drier=[-1.985,.506,.870]/* below the intake duct */;
const metering=[-.691,.147,1.114],blower=[-.602,.374,1.065],filter=[-.780,.190,1.200]; // The cabin filter stands right of the throttle body, behind the valve cover.
export const climateTargets={comp,con,drier,metering,blower,filter};
export function drawCore(r,type,section,c=type==='heater'?coreCenter:type==='condenser'?con:evapCenter,scale=1){
 const dim=type==='heater'?[.234,.175,.032]:type==='condenser'?[.813,.431,.017]:[.308,.200,.065];
 if(section!=='ports'){exchanger(r,c,dim[0]*scale,dim[1]*scale,dim[2]*scale,scale,section,type!=='condenser');return;}
 if(type==='heater'){
  for(const [i,s] of [-1,1].entries()){
   const portStart=add(c,[-.160*scale,(-.076+i*.058)*scale,-.005*scale]);
   const elbow=add(c,[-.067*scale,(-.076+i*.058)*scale,(i?.074:-.065)*scale]);
   line(r,[add(c,[0,s*.117*scale,(i?.074:-.065)*scale]),elbow,portStart],.007*scale,alloy);
   port(r,portStart,x,.011*scale);
  }
 }else if(type==='evaporator'){
  for(const [i,delta] of [-.017,.017].entries())line(r,[add(c,[0,.164*scale,(.032+delta)*scale]),add(c,[-.045*scale,.136*scale,(.032+delta)*scale]),add(c,[-.080*scale,.112*scale,(.033+delta)*scale])],(i?.01:.006)*scale,alloy);
 }else for(const v of [[.406,.14],[.406,-.15]])port(r,add(c,[0,v[0]*scale,v[1]*scale]),y,.012*scale);
}
const coreParts=['headers','tubes','fins','ports'];
export function drawG500HeaterMatrix(r){for(const k of coreParts)drawCore(r,'heater',k);}
export function allCore(r,type){for(const k of coreParts)drawCore(r,type,k);}
export function compressorPiece(r,key,c=comp,s=1){
 const at=(dx,dy,dz)=>add(c,[dx*s,dy*s,dz*s]);
 if(key==='case'){
  turn(r,c,x,[[-.071,0],[-.071,.057],[-.054,.068],[.046,.068],[.064,.057],[.064,0]].map(([a,b])=>[a*s,b*s]),alloy,{n:18});
  for(const d of [-.032,0,.035])sleeve(r,c,x,d*s,(d+.006)*s,.071*s,.064*s,iron,16);return;
 }
 if(key==='pulley'){
  cyl(r,c,x,-.106*s,-.075*s,.056*s,iron,20);
  for(let j=0;j<5;j++)sleeve(r,c,x,(-.103+j*.005)*s,(-.101+j*.005)*s,.061*s,.055*s,black,20);return;
 }
 if(key==='hub'){cyl(r,c,x,-.116*s,-.108*s,.044*s,iron,18);cyl(r,c,x,-.12*s,-.115*s,.012*s,alloy,6);return;}
 if(key==='mount'){for(const yy of [-1,1])for(const zz of [-1,1])sleeve(r,at(-.020,.061*yy,.050*zz),x,-.018*s,.018*s,.018*s,.008*s,alloy,10);return;}
 box(r,at(.036,0,.065),[.052*s,.068*s,.017*s],iron);
 for(const [i,q] of [[0,-.020],[1,.020]])port(r,at(.036,q,.084),z,(i?.010:.016)*s);
}
export function drawG500AcCompressor(r){
 // Because the two assemblies share this installed envelope, the higher
 // resolution pulley grooves and bored ears live in the component study.
 turn(r,comp,x,[[-.071,0],[-.071,.059],[-.051,.068],[.040,.068],[.056,.055],[.056,0]],alloy,{n:10});
 turn(r,comp,x,[[-.108,0],[-.108,.060],[-.101,.060],[-.100,.054],[-.094,.060],[-.080,.060],[-.076,.052],[-.076,0]],iron,{n:10});
 cyl(r,comp,x,-.117,-.109,.041,iron,8);
 box(r,add(comp,[.036,0,.065]),[.052,.068,.017],iron);
 for(const yy of [-.020,.020])cyl(r,add(comp,[.036,yy,.083]),z,-.009,.010,yy<0?.014:.009,alloy,6);
 for(const side of [-1,1])box(r,add(comp,[-.014,.061*side,.046]),[.033,.026,.017],alloy);
}
export function rotaryFan(r,c,axis,rad,angle=0){
 const b=basis(axis);
 for(let j=0;j<7;j++){
  const a=angle+j*TAU/7,pts=[[.25,-.21,-.05],[.58,-.13,-.04],[.95,.06,-.02],[.99,.30,.04],[.69,.27,.05],[.28,.18,.03]];
  r.polygon(pts.map(([rr,t,h])=>point(c,b,rad*h,rr*rad,a+t)),j%2?'#363e41':'#41484a',false);
 }
 cyl(r,c,axis,-rad*.07,rad*.07,.25*rad,'#41484a',16);
}
export function fanPair(r,key,section=null,c=null,s=1,angle=0){
 // The fans sit high in front of the condenser, above the transmission cooler.
 const site=c||[-2.074,key==='left'?-.208:.208,.959],rad=.185*s;
 if(section===null||section==='blade')rotaryFan(r,site,x,rad,angle);
 if(section===null||section==='motor')motor(r,add(site,[-.019*s,0,0]),x,.048*s,.034*s,'#424b4e');
 if(section===null||section==='shroud'){
  sleeve(r,site,x,-.023*s,.020*s,rad*1.051,rad*1.004,black,28);
  for(let i=0;i<3;i++){const t=i*TAU/3;r.rod(add(site,[.014*s,Math.cos(t)*.17*s,Math.sin(t)*.17*s]),add(site,[.013*s,0,0]),.0045*s,black,6);}
 }
}
export function blowerPiece(r,key,c=blower,s=1,t=0){
 const rad=.075*s;
 if(key==='wheel'){
  sleeve(r,c,z,-.026*s,-.021*s,rad,.015*s,iron,24);sleeve(r,c,z,.020*s,.025*s,rad,.068*s,iron,24);
  for(let i=0;i<28;i++){const a=TAU*(i/28+t),p=(rad,an,h)=>add(c,[rad*Math.cos(an),rad*Math.sin(an),h*s]);
   r.polygon([p(rad*.85,a,-.022),p(rad,a+.10,-.022),p(rad,a+.10,.022),p(rad*.85,a,.022)],alloy,false);}
 }else if(key==='motor')motor(r,add(c,[0,0,-.054*s]),z,.033*s,.057*s);
 else if(key==='scroll'){
  turn(r,c,z,[[-.035*s,.082*s],[-.035*s,.090*s],[.032*s,.090*s],[.032*s,.082*s]],black,{n:24,start:.37,sweep:TAU-1.07});
  box(r,add(c,[.063*s,-.051*s,-.028*s]),[.063*s,.064*s,.009*s],black);
 }else{
  box(r,add(c,[.026*s,0,-.079*s]),[.037*s,.031*s,.017*s],black);
  for(const d of [-1,1])r.rod(add(c,[.027*s,d*.007*s,-.091*s]),add(c,[.027*s,d*.007*s,-.076*s]),.003*s,copper,7);
 }
}
export function allBlower(r){for(const key of ['scroll','motor','wheel','plug'])blowerPiece(r,key);}
export function ducts(r,key){
 const root=[-.485,.03,1.105];
 const sleevePath=(pts,w,h)=>{for(let j=1;j<pts.length;j++){
  const a=pts[j-1],b=pts[j],d=b.map((x,i)=>x-a[i]),q=basis(d),face=p=>[[1,1],[-1,1],[-1,-1],[1,-1]].map(([u,v])=>p.map((x,i)=>x+q[1][i]*u*w+q[2][i]*v*h));
  const p=face(a),v=face(b);for(let k=0;k<4;k++){const n=(k+1)%4;r.polygon([p[k],p[n],v[n],v[k]],black,false);}
 }};
 for(const s of [-1,1]){
  if(key==='demist')sleevePath([root,[-.591,s*.156,1.198],[-.680,s*.364,1.283]],.046,.011);
  if(key==='face'){sleevePath([root,[-.538,s*.19,1.185],[-.504,s*.66,1.196],[-.452,s*.672,1.235]],.030,.017);sleevePath([root,[-.497,s*.096,1.185],[-.453,s*.103,1.246]],.030,.019);}
  if(key==='floor')sleevePath([root,[-.603,s*.104,1.019],[-.595,s*.235,.851],[-.570,s*.271,.824]],.030,.017);
 }
}
