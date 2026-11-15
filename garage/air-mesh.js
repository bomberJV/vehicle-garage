import {glazingFace} from './surface-materials.js';
// Original display geometry. X points aft, Y to starboard and Z upward.
const circle = Math.PI * 2;
const tintCache = new Map();
function tint(hex, light) {
  const step = Math.round(Math.max(.44,Math.min(1.24,light))*60);
  const key = hex + step;
  if (!tintCache.has(key)) {
    const rgb = [1,3,5].map(i=>Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*step/60)).toString(16).padStart(2,'0'));
    tintCache.set(key,'#'+rgb.join(''));
  }
  return tintCache.get(key);
}
const mix = (a,b,t)=>a+(b-a)*t;
export const port = {sign:-1,id:'port',name:'Port'};
export const starboard = {sign:1,id:'starboard',name:'Starboard'};
export const sides = [port,starboard];
export const paint = {white:'#d9e2e4',steel:'#a1adaf',ink:'#222e35',azure:'#47778d',glass:'#527b91',rubber:'#273039',silver:'#aab7bf',olive:'#626a54',gold:'#c29964'};

// Station fields are X, half breadth, center height, upper radius, lower radius.
function ringPoint(s,a,dy=0,inflate=1) {
  const sin=Math.sin(a);
  // The sixth field controls the section from rounded (1) to a flat-sided cabin.
  const exponent=s[5]??1;
  const contour=v=>Math.sign(v)*Math.pow(Math.abs(v)<1e-12?0:Math.abs(v),exponent);
  return [s[0],dy+s[1]*contour(Math.cos(a))*inflate,s[2]+(sin>=0?s[3]:s[4]??s[3])*contour(sin)*inflate];
}
function stationAt(stations,x) {
  let i=1;
  while(i<stations.length-1 && x>stations[i][0]) i++;
  const a=stations[i-1], b=stations[i], t=(x-a[0])/(b[0]-a[0]);
  return Array.from({length:6},(_,j)=>mix(a[j]??(j===5?1:a[3]),b[j]??(j===5?1:b[3]),t));
}
export function loft(r,stations,color,dy=0,count=24) {
  for(let k=1;k<stations.length;k++){
    const a=stations[k-1],b=stations[k];
    for(let i=0;i<count;i++){
      const t=circle*i/count,u=circle*(i+1)/count,m=(t+u)/2;
      const c=typeof color==='function'?color(k,i,m):color;
      r.polygon([ringPoint(a,t,dy),ringPoint(b,t,dy),ringPoint(b,u,dy),ringPoint(a,u,dy)],tint(c,.85+.15*Math.sin(m)+.06*Math.cos(m)),false);
    }
  }
  for(const s of [stations[0],stations.at(-1)]) if(s[1]>.001 && s[3]>.001)
    r.polygon(Array.from({length:count},(_,i)=>ringPoint(s,circle*i/count,dy)),typeof color==='string'?tint(color,.76):'#58636a',false);
}
// Clip the opaque shell in its own (length, angle) coordinates. Each convex
// window removes material on both sides of the fuselage before glass is added.
export function windowedLoft(r,stations,color,windows,count=24,closeFront=true,closeRear=true) {
  const windowsWithBounds=windows.map(vertices=>{
    const xs=vertices.map(v=>v[0]),angles=vertices.map(v=>v[1]);
    const area=vertices.reduce((sum,v,i)=>{const q=vertices[(i+1)%vertices.length];return sum+v[0]*q[1]-q[0]*v[1];},0);
    return {vertices:area<0?[...vertices].reverse():vertices,x0:Math.min(...xs),x1:Math.max(...xs),a0:Math.min(...angles),a1:Math.max(...angles)};
  });
  function cutHole(poly,vertices) {
    let inside=poly;
    const outside=[];
    for(let i=0;i<vertices.length&&inside.length>=3;i++){
      const e=vertices[i],f=vertices[(i+1)%vertices.length];
      const distance=p=>(f[0]-e[0])*(p[1]-e[1])-(f[1]-e[1])*(p[0]-e[0]);
      const inner=[],outer=[];
      for(let j=0;j<inside.length;j++){
        const p=inside[j],q=inside[(j+1)%inside.length],d=distance(p),h=distance(q);
        if(d>=0)inner.push(p);else outer.push(p);
        if((d>0&&h<0)||(h>0&&d<0)){
          const t=d/(d-h),v=p.map((c,k)=>mix(c,q[k],t));inner.push(v);outer.push(v);
        } else if(d===0)outer.push(p);
      }
      if(outer.length>=3)outside.push(outer);
      inside=inner;
    }
    return outside;
  }
  for(let k=1;k<stations.length;k++){
    const x0=stations[k-1][0],x1=stations[k][0];
    const nearby=windowsWithBounds.filter(w=>w.x0<x1&&w.x1>x0);
    for(let i=0;i<count/2;i++){
      const a=-Math.PI/2+i*circle/count,b=a+circle/count,m=(a+b)/2;
      const inBand=nearby.filter(w=>w.a0<b && w.a1>a);
      // Subdivide only bands which actually contain a pane.
      const xs=[x0,...new Set(inBand.flatMap(w=>[w.x0,w.x1]).filter(x=>x>x0&&x<x1).sort((a,b)=>a-b)),x1];
      for(let j=1;j<xs.length;j++){
        const left=xs[j-1],right=xs[j];
        let patches=[[[left,a],[right,a],[right,b],[left,b]]];
        for(const w of inBand){
          if(w.x0>=right||w.x1<=left)continue;
          patches=patches.flatMap(poly=>cutHole(poly,w.vertices));
        }
        for(const side of [-1,1]){
          const col=typeof color==='function'?color(k,i,m):color;
          const faceColor=tint(col,.85+.15*Math.sin(m)+side*.06*Math.cos(m));
          for(const patch of patches){
            const points=patch.map(([x,angle])=>{const [xx,y,z]=ringPoint(stationAt(stations,x),angle);return [xx,y*side,z];});
            r.polygon(points,faceColor,false);
          }
        }
      }
    }
  }
  for(const [s,close] of [[stations[0],closeFront],[stations.at(-1),closeRear]])if(close)r.polygon(Array.from({length:count},(_,i)=>ringPoint(s,circle*i/count)),typeof color==='string'?tint(color,.76):'#58636a',false);
}
// Window corners follow the local fuselage contour. Project both ends separately on tapered portions.
export function onSkin(stations,side,[x,a],inflate=1){
  const p=ringPoint(stationAt(stations,x),a,0,inflate);
  return [p[0],p[1]*side,p[2]];
}
export function skin(r,stations,side,outline,color,opacity=1,inflate=1.018) {
  const point=v=>onSkin(stations,side,v,inflate);
  // Clip large window panels into short surface strips. A single flat quad cuts inside a curved nose.
  const cut=(polygon,axis,edge,low)=>{
    const output=[];
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length];
      const insideA=low?a[axis]<=edge:a[axis]>=edge,insideB=low?b[axis]<=edge:b[axis]>=edge;
      if(insideA)output.push(a);
      if(insideA!==insideB){
        const t=(edge-a[axis])/(b[axis]-a[axis]);
        output.push([mix(a[0],b[0],t),mix(a[1],b[1],t)]);
      }
    }
    return output;
  };
  const draw=(poly)=>{
    const vertices=poly.map(point);
    for(let i=1;i+1<vertices.length;i++){
      const face=[vertices[0],vertices[i],vertices[i+1]];
      const col=typeof color==='function'?color(poly):color;
      if(opacity<1)glazingFace(r,face,col,opacity);else r.polygon(face,col,false);
    }
  };
  const split=(poly,axis,edges,onPiece)=>{
    let rest=poly;
    for(const edge of edges){
      const low=cut(rest,axis,edge,true);
      if(low.length>=3)onPiece(low);
      rest=cut(rest,axis,edge,false);
      if(rest.length<3)return;
    }
    onPiece(rest);
  };
  const xs=outline.map(p=>p[0]), angles=outline.map(p=>p[1]);
  const min=Math.min(...xs),max=Math.max(...xs),lo=Math.min(...angles),hi=Math.max(...angles);
  if(max-min<=.10 && hi-lo<=.23){draw(outline);return;}
  const divisions=(start,end,n)=>Array.from({length:n-1},(_,i)=>mix(start,end,(i+1)/n));
  const breaks=[...new Set([...stations.map(p=>p[0]).filter(x=>x>min&&x<max),...divisions(min,max,Math.ceil((max-min)/.10))])].sort((a,b)=>a-b);
  const arcs=divisions(lo,hi,Math.ceil((hi-lo)/.19));
  split(outline,0,breaks,strip=>split(strip,1,arcs,draw));
}
export function ovalOutline(x,width,angle,angleHeight,factor=1){
  return Array.from({length:14},(_,i)=>[x+width*factor*Math.cos(circle*i/14),angle+angleHeight*factor*Math.sin(circle*i/14)]);
}
function scaledLoop(loop,factor) {
  const center=loop.reduce((sum,p)=>[sum[0]+p[0]/loop.length,sum[1]+p[1]/loop.length],[0,0]);
  return loop.map(p=>p.map((v,i)=>mix(center[i],v,factor)));
}
// An inset glazing unit occupies a real opening. The pale reveal is visible
// obliquely between the dark seal on the outside and the transmissive glass.
export function framedPane(r,stations,side,outline,{gasket='#33464c',reveal='#80969b',glass='#526f80',opacity=.59,frame=.964,onePiece=false}={}){
  const scaled=factor=>scaledLoop(outline,factor).map((p,i)=>onePiece&&outline[i][1]>1.57078?[p[0],Math.PI/2]:p);
  const aperture=scaled(frame),inner=scaled(frame*.985);
  for(let i=0;i<outline.length;i++){
    const j=(i+1)%outline.length;
    if(onePiece&&outline[i][1]>1.57078&&outline[j][1]>1.57078)continue;
    skin(r,stations,side,[outline[i],outline[j],aperture[j],aperture[i]],gasket,1,1.011);
    r.polygon([onSkin(stations,side,aperture[i],1.011),onSkin(stations,side,aperture[j],1.011),
      onSkin(stations,side,inner[j],.993),onSkin(stations,side,inner[i],.993)],reveal,false);
  }
  const tintFor=poly=>tint(glass,.86+.27*Math.sin(poly.reduce((sum,p)=>sum+p[1],0)/poly.length));
  skin(r,stations,side,inner,tintFor,opacity,.993);
}
export function ovalWindow(r,stations,s,x,width,angle=.18,angleHeight=.16,transparent=false) {
  const loop=ovalOutline(x,width,angle,angleHeight);
  if(transparent)framedPane(r,stations,s,loop,{frame:.91,gasket:'#74868c',glass:'#3b5360',opacity:.64});
  else skin(r,stations,s,loop,'#354b55');
}
// Each station is [spanwise Y, leading X, trailing X, upper Z, section thickness].
export function wing(r,stations,s,color,{movable=true}={}) {
  const cuts=[0,.075,.28,.69,.72,.98,1],ordinates=[0,.65,1,.58,.54,.06,0];
  const point=(st,j,bottom=false)=>[mix(st[1],st[2],cuts[j]),s*st[0],st[3]+(bottom?-.38:1)*st[4]*ordinates[j]];
  for(let i=1;i<stations.length;i++){
    for(let j=1;j<cuts.length;j++){
      const a=stations[i-1],b=stations[i];
      r.polygon([point(a,j-1),point(b,j-1),point(b,j),point(a,j)],tint(color,movable&&j===4?.74:1.02-j*.012),false);
      r.polygon([point(a,j-1,true),point(a,j,true),point(b,j,true),point(b,j-1,true)],tint(color,.65+j*.018),false);
    }
  }
  for(const st of [stations[0],stations.at(-1)])for(let j=1;j<cuts.length;j++)
    r.polygon([point(st,j-1),point(st,j),point(st,j,true),point(st,j-1,true)],tint(color,.77),false);
}
export function fin(r,profile,y,color,{cant=0,thick=.035}={}) {
  const base=Math.min(...profile.map(p=>p[1]));
  const make=(s)=>profile.map(([x,z])=>[x,y+(z-base)*cant+s*thick,z]);
  const front=make(1),back=make(-1);
  r.polygon(front,tint(color,1.03),false);r.polygon(back,tint(color,.89),false);
  for(let j=0;j<front.length;j++)r.polygon([front[j],back[j],back[(j+1)%front.length],front[(j+1)%front.length]],tint(color,.78),false);
}
export function tube(r,a,b,rad,c,n=12) { r.rod(a,b,rad,c,n); }
export function nacelle(r,x,y,z,len,radius,color,{fanBlades=0,phase=0}={}) {
  const cross=(pos,rr,cz=z)=>[x+pos*len,radius*rr,cz,radius*rr];
  loft(r,[cross(0,.90),cross(.09,1),cross(.26,1.03),cross(.65,.88),cross(1,.62)],color,y,24);
  const ring=(xx,rad,ang)=>[xx,y+rad*Math.cos(ang),z+rad*Math.sin(ang)];
  if(fanBlades){
    const xx=x-.00155;
    for(let i=0;i<fanBlades;i++){
      const a=circle*(i/fanBlades+phase),tip=a+.22;
      r.polygon([ring(xx,radius*.18,a),ring(xx,radius*.745,tip),ring(xx,radius*.74,tip+.140),ring(xx,radius*.18,a+.23)],i===0?'#aea487':i%3?'#697c86':'#819099',false);
    }
    loft(r,[[xx-radius*.37,.001,z,.001],[xx-radius*.24,radius*.10,z,radius*.10],[xx,radius*.185,z,radius*.185]],'#8a969d',y,20);
  }
  for(const [xx,rad,atFront] of [[x-.0008,radius*.90,true],[x+len+.0008,radius*.62,false]]){
    for(let i=0;i<24;i++){
      const a=circle*i/24,b=circle*(i+1)/24;
      r.polygon([ring(xx,rad,a),ring(xx,rad,b),ring(xx,rad*.87,b),ring(xx,rad*.87,a)],atFront?'#aab8bc':'#657075',false);
    }
    r.polygon(Array.from({length:24},(_,i)=>ring(xx,rad*.87,circle*i/24)),'#233039',false);
  }
}
export function tire(r,x,y,z,rad,width) {
  r.tubeY(x,y-width/2,y+width/2,z,rad,paint.rubber,18);
  for(const s of [-1,1]){
    const yy=y+s*width/2;
    r.ringY(x,yy,z,rad,rad*.46,paint.rubber,18);r.ringY(x,yy,z,rad*.46,0,paint.silver,18);
  }
}
export function wheelLeg(r,x,y,z,count=1,{rad=.07,twin=true}={}) {
  tube(r,[x-.03,y,z],[x,y,rad],.023,paint.silver);
  tube(r,[x+.11,y,z-.04],[x,y,.13],.012,paint.steel);
  for(let i=0;i<count;i++){
    const xx=x+(i-(count-1)/2)*rad*2.18;
    if(count>1)tube(r,[x,y,rad],[xx,y,rad],.018,paint.steel);
    for(const s of twin?[-1,1]:[1])tire(r,xx,y+s*(twin?.034:0),rad,rad,.045);
  }
}
export function surfaceBand(r,stations,side,x0,x1,angle,thick,color,segments=25) {
  for(let i=0;i<segments;i++){
    const a=mix(x0,x1,i/segments),b=mix(x0,x1,(i+1)/segments);
    skin(r,stations,side,[[a,angle],[b,angle],[b,angle+thick],[a,angle+thick]],color);
  }
}
export function blade(r,base,angle,radius,chord,color,{vertical=false,cant=0}={}) {
  const p=(d,e,h)=>{
    const a=d*Math.cos(angle)-e*Math.sin(angle),b=d*Math.sin(angle)+e*Math.cos(angle);
    return vertical?[base[0]+a,base[1]+h*Math.cos(cant)+b*Math.sin(cant),base[2]+b*Math.cos(cant)-h*Math.sin(cant)]:[base[0]+a,base[1]+b,base[2]+h];
  };
  const stations=[[.055,-.19,.19],[.15,-.40,.48],[.85,-.49,.45],[1,-.55,.30]];
  for(let i=1;i<stations.length;i++){
    const a=stations[i-1],b=stations[i],seg=(st,upper)=>[p(st[0]*radius,st[1]*chord,upper?.010:0),p(st[0]*radius,st[2]*chord,upper?.010:0)];
    const [a0,a1]=seg(a,true),[b0,b1]=seg(b,true),[l0,l1]=seg(a,false),[m0,m1]=seg(b,false);
    r.polygon([a0,b0,b1,a1],color,false);r.polygon([l0,m0,m1,l1],tint(color,.78),false);
    r.polygon([a0,b0,m0,l0],tint(color,.70),false);r.polygon([a1,b1,m1,l1],tint(color,.76),false);
  }
}
// Aviation records and their mesh tags share a single part definition.
export function section(id,name,description,parts){return {id,name,description,parts};}
export function piece(id,name,description,offset,sketch){return {id,name,description,offset,sketch};}
export function record(meta,sections){
  const groups=sections.map(group=>({...group,parts:group.parts.map(({sketch,...p})=>({...p,id:group.id+'.'+p.id}))}));
  const drawGroup=(r,group,phase)=>{for(const p of group.parts)r.tag(group.id+'.'+p.id,()=>p.sketch(r,phase));};
  const model={...meta,domain:'Air',groups,draw(r,paint,finish,phase=0,assembly=null){
    for(const group of sections)drawGroup(r,group,!assembly||assembly===group.id?phase:0);
  }};
  if(meta.motion){
    const moving=sections.find(group=>group.id===meta.motion.assembly);
    model.motion={...meta.motion,parts:moving.parts.map(p=>moving.id+'.'+p.id),
      drawMoving:(r,paint,finish,phase=0)=>drawGroup(r,moving,phase)};
  }
  return model;
}
