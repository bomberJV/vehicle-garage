import {lampOutline} from './g500-lamps.js';
const dark='#31383a';
const tint=(color,factor)=>'#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(color.slice(i,i+2),16)*factor)).toString(16).padStart(2,'0')).join('');
function join(r,a,b,color){
 for(let i=0;i<a.length;i++){
  const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],typeof color==='function'?color(i):color,false);
 }
}
function castLoop(w,h,corner,x,origin){return lampOutline(w,h,corner).map(([u,v])=>[x,origin[0]+u,origin[1]+v]);}
export function radiatorGrille(r,front,paint){
 const center=[0,.994],outer=castLoop(.959,.469,.032,front-.017,center),rolled=castLoop(.949,.459,.031,front-.041,center),opening=castLoop(.886,.374,.016,front-.046,center),rear=castLoop(.883,.374,.017,front+.019,center);
 join(r,outer,rolled,tint(paint,.92));join(r,rolled,opening,i=>tint(paint,i<8?1.09:.94));join(r,opening,rear,dark);
 // The radiator face is behind the vanes. The central emblem sits proud of
 // their leading edges, with a physical gap in each blade across its back.
 // The physical fan and condenser meshes behind the slots supply the dark backing.
 for(const y of [-.31,-.151,.151,.31])r.box(front-.017,y-.005,.804,front+.001,y+.005,1.185,'#434d4e');
 // Photographed 2002 US trucks: the seven vanes are painted body colour like
 // the surround, with dark gaps between them. Only the star is bright.
 for(let i=0;i<7;i++){
  const z=.835+i*.054,c=Math.abs(z-1.007)<.124?Math.sqrt(.124**2-(z-1.007)**2):0;
  const ranges=c?[[-.438,-c],[c,.438]]:[[-.438,.438]];
  for(const [a,b] of ranges){
   const at=(y,d,h)=>[front-d+.005*(y/.44)**2,y,z+h];
   r.polygon([at(a,.048,.012),at(b,.048,.012),at(b,.042,.018),at(a,.042,.018)],tint(paint,1.10),false);
   r.polygon([at(a,.048,.012),at(b,.048,.012),at(b,.047,-.003),at(a,.047,-.003)],tint(paint,.97),false);
   r.polygon([at(a,.047,-.003),at(b,.047,-.003),at(b,.022,-.013),at(a,.022,-.013)],tint(paint,.63),false);
   r.polygon([at(a,.042,.018),at(b,.042,.018),at(b,.018,.020),at(a,.018,.020)],tint(paint,.92),false);
  }
 }
 // The lower valance joins the grille carrier to the top of the bumper. The
 // inset horizontal slot continues the recess seen on the U.S. factory front.
 const valance=castLoop(.951,.091,.013,front-.018,[0,.726]);
 const slot=castLoop(.861,.030,.010,front-.027,[0,.731]);
 join(r,valance,slot,tint(paint,.86));r.polygon(slot,dark,false);
}
export function moldedHeadlampPanel(r,front,side,paint){
 const center=[side*.674,1.001],outer=castLoop(.405,.468,.050,front+.014,center),frontEdge=castLoop(.394,.456,.047,front-.034,center),wellEdge=castLoop(.34,.337,.064,front-.042,center);
 join(r,outer,frontEdge,i=>tint(paint,.82+.22*(i<8)));join(r,frontEdge,wellEdge,i=>tint(paint,.96+.14*(i<8)));
 const inner=wellEdge.map((p,i)=>{const u=p[1]-center[0],v=p[2]-center[1],len=Math.hypot(u,v);return [front-.035,center[0]+u/len*.157,center[1]+v/len*.157];});
 join(r,wellEdge,inner,i=>tint(paint,.79+.18*(i<8)));
 // The painted lower apron, black seal and mounting screw continue below the lens.
 const apron=castLoop(.390,.094,.014,front-.016,[side*.674,.733]);r.polygon(apron,tint(paint,.85),false);
 for(const sx of [-1,1]){
  const y=center[0]+sx*.163;
  r.rod([front-.042,y,.997],[front-.046,y,.997],.008,dark,10);
 }
}
const archProfile=[[-.469,.558],[-.458,.618],[-.410,.742],[-.348,.835],[-.287,.884],[-.236,.907],[-.154,.917],[0,.919],[.154,.917],[.236,.907],[.287,.884],[.348,.835],[.410,.742],[.458,.618],[.469,.558]];
export function wingFlare(r,axle,side,width,paint){
 const edge=(i,lane)=>{
  const [u,h]=archProfile[i],edge=Math.abs(u)/.469;
  const bore=.427+Math.sqrt(Math.max(0,.428**2-Math.min(Math.abs(u)*.908,.412)**2));
  const innerH=Math.max(.550,bore),crown=Math.max(innerH+.007,h);
  const y=[width+.001,width+.047,width+.075,width+.073,width+.042][lane];
  const z=[crown,crown-.003,crown-.012,innerH,innerH-.009][lane];
  return [axle+u+(lane<=2?0:-Math.sign(u)*.012*edge),side*y,z];
 };
 for(let i=1;i<archProfile.length;i++)for(let lane=0;lane<4;lane++){
  const lift=1-Math.abs(archProfile[i][0])/.469,shade=[1.10,.98,.85,.54][lane]+.075*lift;
  r.polygon([edge(i-1,lane),edge(i,lane),edge(i,lane+1),edge(i-1,lane+1)],tint(paint,shade),false);
 }
 for(const i of [0,archProfile.length-1])r.polygon([0,1,2,3,4].map(l=>edge(i,l)),tint(paint,.70),false);
}
export function wingIntake(r,side,width){
 // Trapezoidal louver between the leading door hinge and the wheel arch.
 const map=(u,v,d)=>[-1.04+u+v*.21,side*(width+d),1.117+v];
 const a=lampOutline(.222,.083,.008),b=lampOutline(.202,.064,.005);
 join(r,a.map(([u,v])=>map(u,v,.004)),b.map(([u,v])=>map(u,v,.008)),'#575c5b');
 r.polygon(b.map(([u,v])=>map(u,v,.005)),dark,false);
 for(const h of [-.020,0,.020])r.polygon([map(-.097,h-.002,.009),map(.097,h-.002,.009),map(.097,h+.004,.012),map(-.097,h+.004,.012)],'#535b5c',false);
}
