import {cyl,sleeve,turn,tint,TAU} from './mechanism-shapes.js';
import {slab} from './section-primitives.js';
import {glazingFace} from './surface-materials.js';
const x=[1,0,0],y=[0,1,0],z=[0,0,1],AX=x;
export const metal='#8e9fa0',alloy='#a8b7b8',iron='#697471',rubber='#394044',fuelGold='#c8af71',copper='#aa7e56';
export const plus=(c,d)=>c.map((v,i)=>v+d[i]);
export function path(r,pts,rad,col){for(let i=1;i<pts.length;i++)r.rod(pts[i-1],pts[i],rad,col,8);}
export function box(r,c,dim,col){const a=c.map((v,i)=>v-dim[i]/2),b=c.map((v,i)=>v+dim[i]/2);r.box(...a,...b,col);}
function arc(r,c,axis,inner,outer,a,b,thick,col){turn(r,c,axis,[[-thick/2,inner],[-thick/2,outer],[thick/2,outer],[thick/2,inner],[-thick/2,inner]],col,{start:a,sweep:b-a,n:18});}
export function wheelSites(p,rear){const i=rear?1:0,sides=p.bike&&rear?[1]:[-1,1];return sides.map(s=>[p.axles[i],s*(p.track[i]-(p.bike?0:.014)),p.wheel[i]]);}
// Machined cast-iron friction rings are a dull dark grey in photographs,
// far darker than polished alloy. Bike discs stay bright stainless steel.
const rotorFace='#757a7a';
export function disc(r,c,R,vented,drilled,bike){
  const depth=R*(bike?.034:.12),inner=R*(bike?.69:.59),n=bike?30:38,face=bike?metal:rotorFace;
  if(vented){
    for(const sign of [-1,1])sleeve(r,c,y,sign*depth*.50,sign*depth*.30,R,inner,face,n);
    for(let j=0;j<24;j++){const angle=j*TAU/24;turn(r,c,y,[[-depth*.30,inner],[-depth*.30,R*.98],[depth*.30,R*.98],[depth*.30,inner]],iron,{start:angle,sweep:.046,n:1});}
  }else sleeve(r,c,y,-depth/2,depth/2,R,inner,face,n);
  if(bike){for(let j=0;j<8;j++){const a=j*TAU/8;r.rod(plus(c,[Math.cos(a)*R*.24,0,Math.sin(a)*R*.24]),plus(c,[Math.cos(a+.12)*R*.72,0,Math.sin(a+.12)*R*.72]),.006,iron,6);}}
  else sleeve(r,c,y,-depth*.6,depth*.56,inner*1.035,R*.30,iron,24);
  if(drilled)for(const side of [-1,1])for(let j=0;j<20;j++){
    const a=j*TAU/20,rad=R*(j%2?.82:.91),s=plus(c,[Math.cos(a)*rad,side*(depth/2+.00015),Math.sin(a)*rad]);
    r.ringY(s[0],s[1],s[2],R*.017,0,'#526063',6);
  }
}
export function caliper(r,c,R,n,bike=false,color='#475454'){
  const count=Math.max(1,n/2),half=R*.24,at=(u,v,w)=>plus(c,[u*R,v*R,w*R]);
  for(const side of [-1,1]){
    const y0=side*(n>1?.22:.14);
    box(r,at(.80,y0,.06),[R*.29,half*.53,R*.82],color);
    for(let j=0;j<count;j++){
      const dz=(j+.5)/count*.62-.26;r.rod(at(.78,y0,dz),at(.78,y0+side*.09,dz),R*(n>=6?.10:.125),tint(color,1.18),12);
    }
  }
  for(const h of [-.28,.36])box(r,at(.87,0,h),[R*.25,R*.53,R*.11],color);
  if(n<=1)for(const h of [-.28,.34])r.rod(at(.66,-.38,h),at(.66,.30,h),R*.045,alloy,8);
}
// The closed face is outboard; side mirrors the section for the left wheel.
export function drum(r,c,R,side=1){turn(r,c,y,[[-R*.21,R*.91],[-R*.21,R],[-R*.14,R*1.02],[R*.17,R*1.02],[R*.23,R*.88],[R*.23,R*.28],[R*.19,R*.28],[R*.19,R*.86],[-R*.21,R*.91]].map(([d,rad])=>[side*d,rad]),iron,{n:38});}
export function drumParts(r,key){const c=[0,0,.48],R=.38;
  if(key==='shell')return drum(r,c,R);
  if(key==='plate')return cyl(r,c,y,-.11,-.096,.374,'#525e5e',40);
  if(key==='shoes'){for(const a of [.18,Math.PI+.18]){arc(r,c,y,.306,.326,a,a+2.78,.079,alloy);arc(r,c,y,.326,.355,a,a+2.78,.077,'#6d6255');}return;}
  if(key==='cylinder'){cyl(r,[0,-.01,.77],x,-.09,.09,.047,metal,18);for(const s of [-1,1])cyl(r,[0,-.01,.77],x,s*.086,s*.127,.034,rubber);return;}
  if(key==='springs'){for(const dz of [-.13,.16]){let old=[-.21,0,.48+dz];for(let i=1;i<=55;i++){const t=i/55,pt=[-.21+.42*t,.015*Math.cos(t*TAU*11),.48+dz+.015*Math.sin(t*TAU*11)];r.rod(old,pt,.004,copper,5);old=pt;}}return;}
  cyl(r,[0,0,.209],x,-.10,.10,.022,metal,14);sleeve(r,[0,0,.209],x,-.031,.031,.042,.020,iron,12);
}
// An optional tunnel {y,half,top} recesses the underside, offsets relative to the tank center.
export function tankBody(r,c,shape,tunnel=null,dims=null){
  if(shape==='saddle'){
    for(const s of [-1,1])slab(r,c[0],c[1]+s*.31,c[2]-.096,.69,.49,.21,rubber,.095);
    slab(r,c[0]+.03,c[1],c[2]+.045,.57,.19,.072,'#414a47',.053);
  }else{
    const [l,w,h]=dims||(shape==='nose'?[.70,.82,.27]:shape==='midship'?[1.12,.38,.28]:shape==='bike'?[.46,.285,.184]:[.72,.93,.20]);
    const sides=shape==='bike'?[[-.5,.54,.64],[-.34,.94,.96],[.10,1,1],[.35,.60,.46],[.414,.39,.15]]:[[-.50,.77,.70],[-.40,1,.94],[.33,1,1],[.50,.80,.75]];
    const loop=([dx,fw,fh])=>{const x0=c[0]+dx*l,W=w*fw/2,H=h*fh/2,ring=[[-.85,-1],[.85,-1],[1,-.66],[1,.51],[.78,1],[-.78,1],[-1,.51],[-1,-.66]].map(([y,z])=>[x0,c[1]+y*W,c[2]+z*H]);
      if(tunnel){const a=c[1]+tunnel.y-tunnel.half,b=c[1]+tunnel.y+tunnel.half,top=c[2]+tunnel.top;ring.splice(1,0,[x0,a,c[2]-H],[x0,a,top],[x0,b,top],[x0,b,c[2]-H]);}
      return ring;};
    const rings=sides.map(loop);const n=rings[0].length;for(let j=1;j<rings.length;j++)for(let i=0;i<n;i++){const k=(i+1)%n;r.polygon([rings[j-1][i],rings[j-1][k],rings[j][k],rings[j][i]],tint(shape==='midship'?'#87918c':rubber,.84+.14*(i%3)),false);}
    for(const a of [rings[0],rings.at(-1)])r.polygon(a,'#4c5755',false);
  }
}
export function sender(r,c,size=1){
  const at=(v)=>plus(c,v.map(q=>q*size));cyl(r,c,z,.049*size,.066*size,.085*size,'#899797',20);
  box(r,at([0,0,-.011]),[.07*size,.059*size,.094*size],rubber);
  path(r,[at([0,0,-.055]),at([.041,.014,-.084]),at([.136,.014,-.119])],.004*size,metal);
  cyl(r,at([.14,.015,-.119]),y,-.023*size,.029*size,.024*size,fuelGold,12);
}
export function electricMachine(r,c,kind,size=1){
  // 'alternator-aft' is a belt-driven alternator whose pulley faces rearward,
  // on a belt plane behind the engine.
  const aft=kind==='alternator-aft',x=aft?[-1,0,0]:AX;
  const S=size,r0=kind==='starter'?.060:kind==='bike-gen'?.082:.081;
  if(kind==='bike-gen'){sleeve(r,c,y,-.028*S,.028*S,.083*S,.039*S,metal,26);for(let i=0;i<12;i++){const a=i*TAU/12,center=plus(c,[Math.cos(a)*.060*S,0,Math.sin(a)*.060*S]);cyl(r,center,y,-.031*S,.031*S,.012*S,copper,8);}return;}
  turn(r,c,x,[[-.100,.034],[-.084,r0],[-.067,r0*1.04],[.059,r0*1.04],[.080,r0],[.095,r0*.46],[.102,0]].map(([d,b])=>[d*S,b*S]),kind==='starter'?iron:metal,{n:20});
  if(kind==='starter'){cyl(r,plus(c,[0,0,.061*S]),x,-.057*S,.035*S,.029*S,rubber,16);cyl(r,c,x,.087*S,.122*S,.024*S,iron,14);}
  // A fan-axis alternator is driven through the fan hub, so its own pulley is not drawn.
  else {if(kind!=='fan-alternator')for(let j=0;j<3;j++)sleeve(r,c,x,(-.135+j*.01)*S,(-.131+j*.01)*S,.053*S,.023*S,iron,22);for(let j=0;j<12;j++){const a=j*TAU/12,at=d=>plus(c,[(aft?-d:d)*S,.085*S*Math.cos(a),.085*S*Math.sin(a)]);r.rod(at(-.04),at(.034),.005*S,'#555f5e',6);}}
}
export function battery(r,c,bike=false){const d=bike?[.125,.087,.104]:[.26,.165,.175];box(r,c,d,'#3e4948');box(r,plus(c,[0,0,d[2]*.49]),[d[0]*1.02,d[1]*1.03,d[2]*.10],'#455452');for(const s of [-1,1]){const p=plus(c,[s*d[0]*.36,-d[1]*.26,d[2]*.58]);cyl(r,p,z,0,.014,.011,metal,10);if(s===1)box(r,plus(p,[.006,-.003,.012]),[.038,.026,.019],'#a34d3c');}}
export function roofGlass(r,X,H){const length=.64,width=.95;let old;
  for(let j=0;j<=8;j++){const u=j/8,x=X+length*(u-.5),row=[];for(let i=0;i<=8;i++){const s=i/4-1;row.push([x,s*width/2,H+.018*(1-s*s)-.012*(2*u-1)**2]);}if(old)for(let i=0;i<8;i++)glazingFace(r,[old[i],old[i+1],row[i+1],row[i]],'#829a9e',.55);if(j===0||j===8)path(r,row,.009,rubber);if(old)for(const k of [0,8])r.rod(old[k],row[k],.009,rubber,8);old=row;}
}
const hoodPath=[[-.36,1.26],[.03,1.29],[.43,1.24],[.77,1.04],[.90,.90]];
export function topBows(r,k){const list=k==='header'?[hoodPath[0]]:k==='rearframe'?[hoodPath[3],hoodPath[4]]:hoodPath.slice(1,3);
  for(const [x,z] of list){const pathVerts=[];for(let i=0;i<=12;i++){const s=i/6-1;pathVerts.push([x+.019*s*s,s*.59,z-.062*s*s]);}path(r,pathVerts,k==='header'?.024:.016,alloy);}
  if(k==='rearframe')for(const s of [-1,1])r.rod([.77,s*.59,.978],[.90,s*.59,.838],.017,alloy,8);
}
export function topFabric(r){const row=([x,z],i)=>{const s=i/8-1;return [x+.019*s*s,s*.612,z+.018-.067*s*s];};for(let j=1;j<hoodPath.length;j++)for(let i=0;i<16;i++){
  if(j===3&&i>=2&&i<14)continue;
  r.polygon([row(hoodPath[j-1],i),row(hoodPath[j-1],i+1),row(hoodPath[j],i+1),row(hoodPath[j],i)],tint('#464f52',.81+.15*Math.cos((i-7)*.17)),false);
}}
export function backlight(r){const rear=([x,z],i)=>{const s=i/8-1;return [x+.019*s*s,s*.609,z+.018-.067*s*s];};for(let i=2;i<14;i++)glazingFace(r,[rear(hoodPath[2],i),rear(hoodPath[2],i+1),rear(hoodPath[3],i+1),rear(hoodPath[3],i)],'#839fa3',.38);}
