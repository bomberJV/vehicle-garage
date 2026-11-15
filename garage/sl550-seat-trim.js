// US MY2014 SL brochure pp. 18–19, front and rear photographs of the SL550
// seat. Passenger-seat plates establish the independent trim and support layers.
import {tint} from './road-primitives.js';

const hide='#c4b297',piping='#b2a087',seam='#8a7863',skirt='#a18e76';
const card=(r,a,b,c,d,color)=>r.polygon([a,b,c,d],color,false);
const range=(n,lo=0,hi=1)=>Array.from({length:n+1},(_,i)=>lo+(hi-lo)*i/n);
const cross=[-1,-.98,-.92,-.84,-.75,-.66,-.55,-.34,0,.34,.55,.66,.75,.84,.92,.98,1];
const limit=(v,min,max)=>Math.max(min,Math.min(max,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const gaussian=(v,scale)=>Math.exp(-((v/scale)**2));
// Hermite interpolation preserves the measured stations while rounding the
// changing cross-sections at the shoulders, knee roll and head restraint.
function sample(table,u){
  const n=table.length-1,at=limit(u,0,1)*n,i=Math.min(n-1,Math.floor(at)),t=at-i;
  const a=table[i],b=table[i+1],p=table[Math.max(i-1,0)],q=table[Math.min(i+2,n)];
  return a.map((v,k)=>lerp(v,b[k],t)+.5*t*(1-t)*((1-t)*(2*v-p[k]-b[k])+t*(2*b[k]-v-q[k])));
}
const sun=[-.43,-.27,.86];
function leather(r,fn,us,vs,outward,base=hide,omit){
  // The lit front, side and top surfaces share vertices so the highlight
  // rolls over a bolster with the contour of the upholstery.
  const rows=vs.map(v=>us.map(u=>{
    const a=fn(u+.001,v),b=fn(u-.001,v),c=fn(u,v+.001),d=fn(u,v-.001);
    const e=a.map((n,i)=>n-b[i]),f=c.map((n,i)=>n-d[i]);
    const n=[e[1]*f[2]-e[2]*f[1],e[2]*f[0]-e[0]*f[2],e[0]*f[1]-e[1]*f[0]];
    const length=Math.hypot(...n)||1,light=n.reduce((s,x,k)=>s+x/length*sun[k],0)*outward;
    return {p:fn(u,v),color:tint(base,.88+.21*light)};
  }));
  for(let j=1;j<vs.length;j++)for(let i=1;i<us.length;i++){
    if(omit?.((us[i-1]+us[i])/2,(vs[j-1]+vs[j])/2))continue;
    const q=[rows[j-1][i-1],rows[j-1][i],rows[j][i],rows[j][i-1]];
    r.polygon(q.map(v=>v.p),q[0].color,false);r.faces.at(-1).vertexColors=q.map(v=>v.color);
  }
}
function strip(r,edge,values,off,width,color){
  for(let i=1;i<values.length;i++){
    const a=values[i-1],b=values[i],point=(t,w)=>edge(t,w).map((n,k)=>n+off[k]);
    card(r,point(a,-width),point(b,-width),point(b,width),point(a,width),color);
  }
}
const pad=[
  // x, half width, center height, lower-trim height, bolster rise
  [.027,.173,.495,.465,.012],[.047,.215,.540,.441,.027],[.095,.236,.556,.419,.045],
  [.182,.244,.549,.402,.056],[.293,.246,.533,.399,.065],
  [.411,.243,.525,.401,.070],[.502,.221,.521,.419,.049],[.541,.191,.526,.445,.027]
];
function cushion(u,v){
  const [x,w,z,,rise]=sample(pad,v),ab=Math.abs(u);
  const tucks=[.32,.51,.69].reduce((total,t)=>total+gaussian(v-t,.016),0);
  return [x+Math.max(0,.13-x)*.22*ab**3,w*u,
    z+rise*gaussian(ab-.78,.172)-.020*ab**7-.007*(1-ab**2)*tucks];
}
function cushionSide(side){
  return (s,v)=>{
    const p=cushion(side,v),[x,w,,bottom]=sample(pad,v);
    return [lerp(p[0],x,s),side*(w+.009*Math.sin(Math.PI*s)-.017*s**2),lerp(p[2],bottom,s)];
  };
}
export function cushionTrim(r){
  const vs=range(24);
  leather(r,cushion,cross,vs,-1);
  for(const side of [-1,1])leather(r,cushionSide(side),range(5),vs,-side,skirt);
  for(const end of [0,1]){
    const cap=(u,v)=>{const p=cushion(u,end),a=cushionSide(1)(v,end);
      return [p[0]+(end?1:-1)*.009*Math.sin(Math.PI*v)*(1-u*u),u*a[1],lerp(p[2],sample(pad,end)[3],v)];};
    leather(r,cap,cross,range(4),end?-1:1,hide);
  }
  for(let i=1;i<vs.length;i++)card(r,cushionSide(-1)(1,vs[i-1]),cushionSide(1)(1,vs[i-1]),cushionSide(1)(1,vs[i]),cushionSide(-1)(1,vs[i]),skirt);
  for(const v of [.32,.51,.69])strip(r,(u,d)=>cushion(u,v+d),range(12,-.55,.55),[0,0,.001],.0018,seam);
  for(const side of [-1,1])strip(r,(v,d)=>cushion(side*(.579+d),v),vs,[0,0,.001],.0028,piping);
  perforations(r,cushion,[0,0,.001],false);
}
const back=[
  // z, face x, rear cover x, half width, depth of side bolster
  [.505,.459,.563,.162,.026],[.558,.455,.600,.210,.051],[.649,.463,.626,.234,.080],
  [.735,.478,.639,.241,.097],[.819,.502,.656,.224,.095],[.877,.527,.661,.221,.075],
  [.939,.541,.677,.228,.065],[.983,.556,.683,.212,.052],[1.016,.578,.679,.179,.039],
  [1.036,.597,.676,.112,.021]
];
function front(u,v){
  const [z,x,,w,roll]=sample(back,v),ab=Math.abs(u);
  const inset=.044*gaussian(v-.76,.19)*gaussian(u,.39);
  const shoulder=.017*gaussian(v-.76,.23)*ab**1.7;
  return [x+inset+.014*ab**7-roll*gaussian(ab-.79,.197),u*w,z+shoulder];
}
function rear(u,v){
  const [z,,tail,w]=sample(back,v),ab=Math.abs(u);
  return [tail-.012*ab**4,u*(w-.016),z+.008*gaussian(v-.76,.23)*ab**1.7];
}
function backSide(side){
  return (u,v)=>{const p=front(side,v),q=rear(side,v);
    return [lerp(p[0],q[0],u),lerp(p[1],q[1],u)+side*.012*Math.sin(Math.PI*u),lerp(p[2],q[2],u)];};
}
export function backTrim(r){
  const vs=range(24);
  leather(r,front,cross,vs,-1);

  for(const s of [-1,1])leather(r,backSide(s),range(5),vs,-s);
  for(const end of [0,1]){
    const cap=(u,t)=>front(u,end).map((n,k)=>lerp(n,rear(u,end)[k],t)+(k===2?(end?1:-1)*.005*Math.sin(Math.PI*t):0));
    leather(r,cap,cross,range(4),end?-1:1);
  }
  // Shoulder yoke descends around the neck pad, then sweeps out to the wings.
  strip(r,(u,d)=>front(u,.830+.115*Math.abs(u/.69)**1.7+d),range(20,-.69,.69),[-.0018,0,0],.0017,seam);
  strip(r,(u,d)=>front(u,.527+.141*Math.abs(u/.70)**1.4+d),range(20,-.70,.70),[-.0018,0,0],.0015,seam);
  for(const side of [-1,1]){
    strip(r,(v,d)=>front(side*(.589+.070*Math.sin(Math.PI*v)+d),v),range(19,.06,.88),[-.0019,0,0],.003,piping);
    strip(r,(v,d)=>backSide(side)(.74+d,v),range(17,.05,.94),[0,side*.0013,0],.003,piping);
  }
  perforations(r,front,[-.0015,0,0],true);
}
// Catalog plate 1, item 20. The seat-back panel lifts clear of the
// blower and frame as one piece when the seat is opened.
export function rearPanel(r){
  leather(r,rear,cross,range(24),1,skirt);
  const inside=(u,v)=>{const p=rear(u,v);return [p[0]-.004,p[1],p[2]];};
  leather(r,inside,cross,range(12),-1,'#6c6255');
  for(const u of [-1,1])for(let i=1;i<=24;i++){
    const a=(i-1)/24,b=i/24;card(r,rear(u,a),rear(u,b),inside(u,b),inside(u,a),skirt);
  }
  for(const v of [0,1])for(let i=1;i<cross.length;i++){
    const a=cross[i-1],b=cross[i];card(r,rear(a,v),rear(b,v),inside(b,v),inside(a,v),skirt);
  }
}
function perforations(r,fn,off,backrest){
  const rows=backrest?17:13,cols=17;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const u=(i+.42*(j%2))/(cols-1)-.51,v=backrest?.17+j*.59/rows:.18+j*.55/rows;
    const p=fn(u,v).map((n,k)=>n+off[k]);const [x,y,z]=p,rad=.00085;
    if(backrest)card(r,[x,y-rad,z],[x,y,z+rad],[x,y+rad,z],[x,y,z-rad],'#91816c');
    else card(r,[x-rad,y,z],[x,y-rad,z],[x+rad,y,z],[x,y+rad,z],'#91816c');
  }
}
// The feet of the upholstered head restraint taper into the backrest yoke.
// Its central opening follows the separate duct and grille.
const head=[
 [1.003,.566,.656,.061],[1.028,.551,.671,.095],[1.046,.553,.682,.122],
 [1.081,.558,.689,.124],[1.119,.568,.692,.123],[1.163,.578,.691,.117],
 [1.194,.594,.684,.099],[1.211,.608,.671,.074],[1.216,.626,.655,.041]
];
const headXs=[-1,-.92,-.78,-.60,-.30,0,.30,.60,.78,.92,1];
function headSurface(u,v,backside=false){
  const [z,x,end,w]=sample(head,v),a=Math.abs(u);
  return [backside?end-.018*a**3:x+.028*a**3,w*u,z];
}
export function headTrim(r){
  const vs=range(16);
  leather(r,(u,v)=>headSurface(u,v),headXs,vs,-1,hide,(u,v)=>v>.25&&v<.375&&Math.abs(u)<.6);
  leather(r,(u,v)=>headSurface(u,v,true),headXs,vs,1,hide);
  for(const side of [-1,1]){
    const sideFace=(u,v)=>{const a=headSurface(side,v),b=headSurface(side,v,true);return [lerp(a[0],b[0],u),a[1]+side*.007*Math.sin(Math.PI*u),a[2]];};
    leather(r,sideFace,range(6),vs,-side);
    strip(r,(v,d)=>sideFace(.64+d,v),vs,[0,side*.0008,0],.005,piping);
  }
  for(const end of [0,1]){
    const cap=(u,t)=>headSurface(u,end).map((x,k)=>lerp(x,headSurface(u,end,true)[k],t));
    leather(r,cap,headXs,[0,1],end?-1:1);
  }
  // The stitched neck pad drops below the grille into the shoulder yoke.
  const neck=(u,v)=>[.546+.010*(1-v)+.026*u*u, u*lerp(.052,.079,v), .968+.076*v+.011*u*u*(1-v)];
  leather(r,neck,headXs,range(6),-1);
  strip(r,(u,d)=>neck(u,.025+d),range(10,-.95,.95),[-.001,0,0],.005,piping);
  for(const side of [-1,1])r.rod([.618,side*.07,.97],[.625,side*.07,1.03],.006,'#8a8881',6);
}
export function scarfOutlet(r,level=0){
  const inner=['#343939','#565043','#71604b','#85694c'][level]||'#343939';
  const point=(y,z,dx)=>[.553+(z-1.046)*.15+dx+.006*(y/.076)**2,y,z];
  card(r,point(-.073,1.046,.010),point(.073,1.046,.010),point(.073,1.081,.010),point(-.073,1.081,.010),inner);
  for(const h of [1.046,1.063,1.081])
    card(r,point(-.074,h-.0018,-.002),point(.074,h-.0018,-.002),point(.074,h+.0018,-.002),point(-.074,h+.0018,-.002),'#b5aaa0');
  for(const y of [-.074,-.036,0,.036,.074])
    card(r,point(y-.0015,1.046,0),point(y+.0015,1.046,0),point(y+.0015,1.081,0),point(y-.0015,1.081,0),'#938e82');
}
export function seatFrame(r){
  for(const s of [-1,1]){
    r.rod([.503,s*.16,.536],[.649,s*.158,.97],.012,'#626968',7);
    r.rod([.07,s*.18,.430],[.49,s*.18,.428],.009,'#5b605e',7);
  }
  for(const [x,z] of [[.512,.568],[.637,.952]])
    r.rod([x,-.16,z],[x,.16,z],.009,'#626968',7);
}

export function integralBelt(r,side=-1){
  // Brochure p.18 shows the shoulder belt emerging from its seat-mounted guide.
  // Retracted webbing follows the outboard shoulder bolster to the floor
  // anchor. The broader face of the strap remains visible from the front.
  const strap=(v,w)=>{const u=side*(.886-.162*v);const p=front(u+w,.05+v*.81);
    return [p[0]-.008-.002*Math.sin(v*Math.PI),p[1],p[2]];};
  for(let i=1;i<=24;i++){
    const a=(i-1)/24,b=i/24;
    for(const [left,right] of [[-.093,-.047],[-.047,0],[0,.047],[.047,.093]])
      card(r,strap(a,left),strap(a,right),strap(b,right),strap(b,left),'#b19d7f');
    for(const edge of [-.091,.091])card(r,strap(a,edge),strap(a,edge+.003),strap(b,edge+.003),strap(b,edge),'#9c876c');
  }
  const guide=strap(1,0),tongue=strap(.48,0),axis=side*.024;
  r.rod([guide[0],guide[1]-axis,guide[2]],[guide[0],guide[1]+axis,guide[2]],.005,'#877e6d',10);
  const [x,y,z]=tongue;
  boxBuckle(x-.002,y,z,.006,.030,.010,'#373a37');
  boxBuckle(x-.005,y,z-.019,.003,.012,.011,'#aea99e');
  boxBuckle(x-.009,y,z-.021,.001,.005,.0035,'#595853');
  const iy=-.216*side;
  r.rod([.455,iy,.493],[.394,iy,.592],.008,'#554f43',8);
  boxBuckle(.393,iy,.600,.016,.018,.021,'#4d4841');
  boxBuckle(.390,iy,.622,.012,.014,.003,'#a44836');
  function boxBuckle(x,y,z,rx,ry,rz,c){r.box(x-rx,y-ry,z-rz,x+rx,y+ry,z+rz,c);}
}
