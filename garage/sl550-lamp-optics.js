// The inboard end of the light guide drops toward the floor of the dark bowl.
// The 2014 US brochure's SL550 front-quarter photograph (p. 3) shows one
// large projector, a fluted inboard reflector and an amber outer reflector.
import {glazingFace} from './surface-materials.js';
import {part,study} from './mechanism-shapes.js';
const ref={label:'Mercedes-Benz USA · SL550 headlamp components, Night View version',url:'https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-6l-v8-gas/electrical--headlamp-components'};
const brochure={label:'Mercedes-Benz USA · 2014 SL550 lamp photograph, p. 3',url:'https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf#page=3'};
function strip(r,p,rows,low,high,d,color){
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i];
    r.polygon([p(a,low(a),d),p(b,low(b),d),p(b,high(b),d),p(a,high(a),d)],typeof color==='function'?color(i):color,false);
  }
}
const span=(a,b,n)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
function bed(r,p){
  const tones=['#272b30','#31373b','#394044','#363b42','#303238','#464b50','#555960'];
  for(let j=0;j<tones.length;j++)
    strip(r,p,span(0,1,12),()=>j/tones.length,()=>(j+1)/tones.length,0,tones[j]);
}
function bowl(r,p){
  const point=(a,h,d)=>p(.594+.202*h*Math.cos(a),.415+.299*h*Math.sin(a),d);
  const rings=[[1,.006],[.86,.0125],[.72,.009],[.53,.015],[.23,.018],[0,.019]];
  const colors=[['#585b5b','#d4d4ce','#888d90'],['#252b31','#69757d','#444d53'],['#828c94','#c4cacc','#93999b'],['#3c454d','#71818b','#45545d'],['#333d43','#59686d','#38464d']];
  for(let i=0;i<20;i++){
    const a=Math.PI*i/10,b=Math.PI*(i+1)/10;
    for(let j=1;j<rings.length;j++){
      const [ro,da]=rings[j-1],[ri,db]=rings[j];
      const f=[point(a,ro,da),point(b,ro,da),point(b,ri,db)];
      if(ri)f.push(point(a,ri,db));
      r.polygon(f,colors[j-1][(i>9?1:i>4?2:0)],false);
    }
  }
  const rows=span(.105,.474,12);
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i],t=i/12;
    const low=.19+.13*t,high=.40+.21*t;
    r.polygon([p(a,low,.009),p(b,low+.008,.010),p(b,high,.009),p(a,high-.008,.012)],['#8c9497','#4e565a','#d1d1c7'][i%3],false);
  }
}
function guide(r,p){
  const path=[[.030,.105,.018,.011],[.042,.32,.030,.013],[.068,.52,.05,.015],[.125,.696,.073,.015],[.225,.782,.086,.014],[.385,.812,.084,.014],[.62,.832,.086,.015],[.80,.855,.081,.015],[.92,.90,.054,.013],[.973,.917,.027,.011]];
  for(let i=1;i<path.length;i++){
    const [a,av,aw,ad]=path[i-1],[b,bv,bw,bd]=path[i];
    const aa=i<4?aw*.36:0,bb=i<3?bw*.36:0;
    const prev=[p(a-aa,av+aw,ad),p(a+aa,av-aw,ad)],next=[p(b-bb,bv+bw,bd),p(b+bb,bv-bw,bd)];
    r.polygon([prev[0],next[0],next[1],prev[1]],'#b5bbb7',false);
    r.polygon([prev[1],next[1],p(b+bb,bv-bw-.02,.014),p(a+aa,av-aw-.02,.014)],'#52595a',false);
    const n=i<3?2:Math.max(2,Math.ceil((b-a)*36));
    for(let k=0;k<n;k++){
      const c=(k+.16)/n,e=(k+.54)/n;
      const tap=(t,sgn)=>p(a+(b-a)*t+sgn*(aa+(bb-aa)*t),av+(bv-av)*t-sgn*.60*(aw+(bw-aw)*t),.0164);
      r.polygon([tap(c,-1),tap(e,-1),tap(e,1),tap(c,1)],'#dee1dd',false);
    }
  }
}
function marker(r,p){
  const rows=[[.708,.036,.067],[.776,.077,.25],[.84,.159,.52],[.912,.27,.716],[.977,.458,.855]];
  for(let i=1;i<rows.length;i++){
    const [a,lo,hi]=rows[i-1],[b,l,h]=rows[i];
    for(let j=0;j<4;j++){
      const f=j/4,g=(j+1)/4;
      r.polygon([p(a,lo+(hi-lo)*f,.012),p(b,l+(h-l)*f,.012),p(b,l+(h-l)*g,.012),p(a,lo+(hi-lo)*g,.012)],[ '#913f23','#b95122','#e28c37','#f0a24b'][j],false);
    }
  }
}
function shield(r,p){
  for(let i=0;i<10;i++)for(let j=0;j<5;j++){
    const u=i/10,v=j/5;
    glazingFace(r,[p(u,v,.022),p(u+.1,v,.022),p(u+.1,v+.2,.022),p(u,v+.2,.022)],'#c4d0d9',.095);
  }
}
const elements=[
  ['housing','Dark lamp housing','The contoured shell carries the reflector and projector behind a common cover.',[.075,0,0],bed],
  ['optics','Projector and reflector','The dark projector lens sits outboard of the small faceted reflector. Their exact internal profiles are estimated.',[.025,0,.03],bowl],
  ['guide','Upper light guide','The pale guide follows the top edge of the lamp and bends down the inboard wall.',[0,0,.07],guide],
  ['marker','US amber side reflector','An amber reflector wraps around the outside corner, beside the projector.',[0,.065,0],marker],
  ['cover','Transparent outer lens','A single formed cover follows the taper into the fender.',[-.07,0,0],shield]
];
export function drawLampOptics(r,p){for(const element of elements)element[4](r,p);}
export const slHeadlampStudy=study('sl-headlamp','Bi-xenon headlamp','Compare the optical layers with the US SL550 photograph. The parts catalog distinguishes the Night View housing. Internal dimensions and the separation of the optical surfaces are illustrative.',ref,
  elements.map(([id,name,description,offset,draw])=>part(id,name,description,offset,r=>draw(r,(u,v,d)=>[.19*u*u+.056*v-d,.29*u,.026+.086*u+.151*v-.072*u*u*v]))));
slHeadlampStudy.viewAngle=[-.79,.17];
slHeadlampStudy.groups[0].source=brochure;
