import {TAU,cyl,sleeve,metal,steel,dark,gold,y} from './mechanism-shapes.js';

const pitch=.052, teethFront=17, teethRear=46, count=122;
const r=pitch*teethFront/TAU, R=pitch*teethRear/TAU;
function pathDimensions(d){
  const angle=Math.acos((r-R)/d),line=Math.sqrt(d*d-(R-r)**2);
  return {d,angle,line,length:2*line+angle*2*R+(TAU-2*angle)*r};
}
// Solve from the installed link count. Each length of chain travel has one corresponding tooth advance.
let lo=R+r,hi=count*pitch/2;
for(let i=0;i<50;i++){
  const mid=(lo+hi)/2;
  if(pathDimensions(mid).length>pitch*count)hi=mid;
  else lo=mid;
}
const {d,angle,line,length}=pathDimensions((lo+hi)/2),arc=R*2*angle;
const front=-d/2,rear=d/2;
const point=(x,rad,a)=>[x+rad*Math.cos(a),rad*Math.sin(a)];
function route(distance){
  let s=(distance%length+length)%length;
  if(s<line){
    const [xx,zz]=point(front,r,angle);
    return [xx+s*Math.sin(angle),zz-s*Math.cos(angle)];
  }
  s-=line;
  if(s<arc)return point(rear,R,angle-s/R);
  s-=arc;
  if(s<line){
    const [xx,zz]=point(rear,R,-angle);
    return [xx-s*Math.sin(angle),zz-s*Math.cos(angle)];
  }
  return point(front,r,-angle-(s-line)/r);
}
export function bikeChainState(phase){
  const travel=phase*teethRear*pitch;
  return {frontAngle:angle-travel/r,rearAngle:angle+(line-travel)/R,
    centers:Array.from({length:count},(_,i)=>route(i*pitch+travel)),front,rear,r,R,pitch};
}
function annularTeeth(renderer,center,a,teeth,radius,thick,overview){
  const depth=pitch*radius/R*.26;
  const toothDepth=Math.max(.014,depth);
  const z0=-thick/2,z1=thick/2;
  const profiles=[[0,-.28],[.24,-.06],[.36,.36],[.61,.36],[.77,-.06],[1,-.28]];
  const innerRadius=radius-toothDepth*1.9;
  const vertex=(rad,t,y)=>[center+rad*Math.cos(t),y,rad*Math.sin(t)];
  if(overview){
    // Four angular samples retain every tooth crest and valley. A whole
    // tooth flank is coplanar; its two faces need only one polygon each.
    for(let i=0;i<teeth;i++){
      const samples=[0,.34,.65,1],radii=[-.28,.36,.36,-.28];
      const arc=samples.map((u,j)=>[radius+pitch*radii[j],a+TAU*(i+u)/teeth]);
      const front=arc.map(([r,t])=>vertex(r,t,z0)),back=arc.map(([r,t])=>vertex(r,t,z1));
      const ai=arc[0][1],bi=arc.at(-1)[1];
      renderer.polygon([...front,vertex(innerRadius,bi,z0),vertex(innerRadius,ai,z0)],metal,false);
      renderer.polygon([...back,vertex(innerRadius,bi,z1),vertex(innerRadius,ai,z1)],steel,false);
      for(let j=1;j<arc.length;j++)renderer.polygon([front[j-1],front[j],back[j],back[j-1]],gold,false);
      renderer.polygon([vertex(innerRadius,ai,z0),vertex(innerRadius,bi,z0),vertex(innerRadius,bi,z1),vertex(innerRadius,ai,z1)],dark,false);
    }
    return innerRadius;
  }
  for(let i=0;i<teeth;i++)for(let j=1;j<profiles.length;j++){
    const [s0,h0]=profiles[j-1],[s1,h1]=profiles[j];
    const t0=a+TAU*(i+s0)/teeth,t1=a+TAU*(i+s1)/teeth;
    const p0=vertex(radius+pitch*h0,t0,z0),p1=vertex(radius+pitch*h1,t1,z0);
    const q0=vertex(radius+pitch*h0,t0,z1),q1=vertex(radius+pitch*h1,t1,z1);
    const in0=vertex(innerRadius,t0,z0),in1=vertex(innerRadius,t1,z0);
    const ib0=vertex(innerRadius,t0,z1),ib1=vertex(innerRadius,t1,z1);
    renderer.polygon([p0,p1,in1,in0],metal,false);
    renderer.polygon([q1,q0,ib0,ib1],steel,false);
    renderer.polygon([p0,q0,q1,p1],gold,false);
    renderer.polygon([in1,ib1,ib0,in0],dark,false);
  }
  return innerRadius;
}
function spoke(renderer,cx,a,outer){
  const p=(r,t,y)=>[cx+r*Math.cos(t),y,r*Math.sin(t)];
  const shape=[[outer*.32,a-.18],[outer*.88,a-.10],[outer,a+.13],[outer*.76,a+.12],[outer*.32,a+.27]];
  const tops=shape.map(([r,t])=>p(r,t,.020)),bottom=shape.map(([r,t])=>p(r,t,-.020));
  renderer.polygon(tops,steel,false);renderer.polygon(bottom,metal,false);
  for(let i=0;i<tops.length;i++)renderer.polygon([tops[i],bottom[i],bottom[(i+1)%tops.length],tops[(i+1)%tops.length]],steel,false);
}
export function drawSprocket(renderer,which,state,overview=false){
  const large=which==='rear',cx=large?rear:front,th=large?teethRear:teethFront,rad=large?R:r;
  const a=large?state.rearAngle:state.frontAngle;
  const inside=annularTeeth(renderer,cx,a,th,rad,.022,overview);
  if(large){
    sleeve(renderer,[cx,0,0],y,-.029,.029,rad*.40,rad*.19,steel);
    for(let i=0;i<5;i++){
      const t=a+i*TAU/5;spoke(renderer,cx,t,inside+.0007);
      cyl(renderer,[cx+rad*.32*Math.cos(t),0,rad*.32*Math.sin(t)],y,-.044,-.030,rad*.049,gold,6);
    }
  }else sleeve(renderer,[cx,0,0],y,-.011,.011,inside-.0003,.038,dark,32);
}
const plateOutline=[[-.16,-.13],[0,-.21],[.38,-.15],[.62,-.15],[1,-.21],[1.16,-.13],[1.19,0],[1.16,.13],[1,.21],[.62,.15],[.38,.15],[0,.21],[-.16,.13],[-.19,0]];
export function drawLinks(renderer,state,overview=false){
  const pts=state.centers;
  for(let i=0;i<pts.length;i++){
    const a=pts[i],b=pts[(i+1)%pts.length],dx=b[0]-a[0],dz=b[1]-a[1];
    const span=i%2?.019:.026;
    for(const side of [-1,1]){
      const ring=plateOutline.map(([u,v])=>[a[0]+u*dx-v*dz,side*span,a[1]+u*dz+v*dx]);
      renderer.polygon(ring,i%2?'#646b70':'#b09a66',false);
    }
    if(overview)continue;
    renderer.tubeY(a[0],-.016,.016,a[1],.011,steel,8);
    for(const q of [-1,1]){
      const tip=Array.from({length:7},(_,j)=>[a[0]+.006*Math.cos(TAU*j/7),q*.027,a[1]+.006*Math.sin(TAU*j/7)]);
      renderer.polygon(tip,metal,false);
    }
  }
}
// A lightweight rendering of the same teeth and links sits in the whole-bike view.
export function drawInstalledChain(renderer){
  const state=bikeChainState(0),end=renderer.faces.length;
  drawSprocket(renderer,'front',state,true);drawSprocket(renderer,'rear',state,true);drawLinks(renderer,state,true);
  const dx=.729-.032,dz=.315-.439,len=Math.hypot(dx,dz),c=dx/len,s=dz/len,scale=len/d;
  for(let j=end;j<renderer.faces.length;j++)renderer.faces[j].points=renderer.faces[j].points.map(([x,y,z])=>[
    .032+((x-front)*c-z*s)*scale,-.145+y*scale,.439+((x-front)*s+z*c)*scale
  ]);
}
