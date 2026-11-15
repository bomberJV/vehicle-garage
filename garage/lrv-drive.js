import {TAU,part,tone} from './space-shapes.js';
import {study} from './saturn-shapes.js';

const report={label:'NASA · Apollo 15 Mission Report, Appendix A',url:'https://ntrs.nasa.gov/citations/19720021182'};
const cutaway={label:'NASA · Lunar rover traction drive, figure 21',url:'https://ntrs.nasa.gov/api/citations/20220018746/downloads/TP-20220018746.pdf'};
const alloy='#b7bcb2',caseColor='#676e6c',steel='#858d8e',copper='#b57950',gold='#d3aa69',ink='#394146';
const polar=(a,y,radius)=>[radius*Math.cos(a),y,1+radius*Math.sin(a)];

export function rotateLrvWheel(r,phase){
  const proxy=Object.create(r),a=TAU*phase,c=Math.cos(a),s=Math.sin(a);
  proxy.polygon=(points,color,stroke)=>r.polygon(points.map(([x,y,z])=>[x*c-(z-1)*s,y,1+x*s+(z-1)*c]),color,stroke);
  return proxy;
}
function barrel(r,y0,y1,rad,color,open=false){
  const steps=36,start=open ? 1.74 : 0,end=open ? 5.54 : TAU;
  for(let i=0;i<steps;i++){
    const a=start+(end-start)*i/steps,b=start+(end-start)*(i+1)/steps;
    r.polygon([polar(a,y0,rad),polar(b,y0,rad),polar(b,y1,rad),polar(a,y1,rad)],tone(color,.90+.10*Math.sin(a)),false);
  }
}
function rim(r,y,outer,inner,color,open=false){
  const start=open ? 1.74 : 0,end=open ? 5.54 : TAU;
  for(let i=0;i<36;i++){
    const a=start+(end-start)*i/36,b=start+(end-start)*(i+1)/36;
    r.polygon([polar(a,y,outer),polar(b,y,outer),polar(b,y,inner),polar(a,y,inner)],color,false);
  }
}
function bolts(r,y,rad,count=8,size=.023){
  for(let i=0;i<count;i++){
    const [x,,z]=polar(i*TAU/count,y,rad);
    r.tubeY(x,y-.014,y+.014,z,size,ink,6);
    r.ringY(x,y+.015,z,size,.006,alloy,6);
  }
}
export function lrvWheelDrive(r){
  barrel(r,-.70,-.22,.24,caseColor);rim(r,-.70,.24,.064,steel);
  barrel(r,-.83,-.69,.19,steel);rim(r,-.83,.19,0,alloy);
  for(const x of [-.12,.12]){
    r.rod([x,-.58,1.14],[x*1.78,-.68,1.31],.043,caseColor,8);
    r.rod([x,-.58,.86],[x*1.78,-.68,.69],.043,caseColor,8);
  }
  bolts(r,-.697,.201,8,.016);
}
function tractionCase(r){
  for(const [lo,hi,rad] of [[-.88,-.57,.43],[-.56,.09,.48],[.10,.65,.55]]){
    barrel(r,lo,hi,rad,caseColor,true);rim(r,lo,rad,rad-.055,alloy,true);rim(r,hi,rad,rad-.055,alloy,true);
  }
  for(const a of [1.74,5.54])r.rod(polar(a,-.86,.434),polar(a,.65,.548),.014,alloy,6);
  for(const a of [1.0,2.13,3.48,4.47])r.rod(polar(a,-.40,.46),polar(a,-.52,.70),.065,steel,10);
}
const traction=study('lrv-traction','Lunar rover traction drive','Each wheel had its own electric motor, harmonic drive and brake. The cutaway shows the wheel-side coupling and the components inside the drive housing.',report,[
  part('case','Drive housing and suspension fittings','The suspension carried the drive through fittings on its stationary casing.',[-.66,0,-.27],tractionCase),
  part('brake','Wheel brake','A brake assembly shared the traction-drive housing with the motor and gears.',[0,-.94,-.23],r=>{
    barrel(r,-.84,-.69,.28,ink);rim(r,-.845,.28,.075,steel);
    r.box(-.33,-.816,.84,-.20,-.69,1.17,steel);
    r.rod([-.30,-.76,1.08],[-.44,-.85,1.26],.025,alloy,10);
  }),
  part('motor','Direct-current traction motor','The series-wound, quarter-horsepower motor turned much faster than the wheel.',[.28,-.58,.54],r=>{
    barrel(r,-.59,-.02,.309,steel,true);rim(r,-.58,.31,.23,alloy,true);
    for(let i=0;i<12;i++)r.rod(polar(i*TAU/12,-.50,.21),polar(i*TAU/12,-.09,.21),.034,copper,7);
    r.tubeY(0,-.68,.095,1,.074,alloy,16);
  }),
  part('reduction','Harmonic reduction gear','A wave generator flexed a thin toothed member into a rigid ring at two opposite points. The nominal reduction was 80 to 1.',[-.16,.36,.65],r=>{
    for(const [y,radius] of [[.055,.27],[.10,.32],[.33,.36],[.39,.40]]){
      barrel(r,y,y+.053,radius,gold);rim(r,y+.053,radius,.106,alloy);
    }
    for(let i=0;i<22;i++)r.rod(polar(i*TAU/22,.22,.34),polar(i*TAU/22,.37,.362),.014,steel,6);
  }),
  part('output','Freewheeling bearing and wheel coupling','The wheel-side hardware included a bearing and a decoupler. The wheel attached outside this end of the assembly.',[.09,.92,-.12],r=>{
    barrel(r,.48,.69,.34,steel);rim(r,.694,.34,.13,alloy);bolts(r,.691,.275);
    barrel(r,.49,.80,.13,caseColor);rim(r,.802,.13,.073,alloy);
  })
],[1.06,.27]);

const motor=study('lrv-motor','Brushed traction motor','Battery current passed through the field and the armature. Brushes stayed in place as the copper commutator turned beneath them. This section shows the electrical arrangement schematically.',report,[
  part('field','Series field and stationary poles','Field coils on the housing produced the stationary magnetic field.',[-.47,-.2,.44],r=>{
    barrel(r,-.48,.47,.68,caseColor,true);rim(r,.475,.68,.62,alloy,true);
    for(const a of [.82,2.26,3.81,4.68]){
      const [x,,z]=polar(a,0,.505);
      r.rod([x,-.34,z],[x,.32,z],.113,copper,12);
      r.rod(polar(a,-.38,.48),polar(a,.37,.48),.074,ink,8);
    }
  }),
  part('armature','Armature and shaft','The laminated core and copper windings rotate with the shaft.',[.06,-.78,-.25],(r,t)=>{
    const rotor=rotateLrvWheel(r,t);
    rotor.tubeY(0,-.65,.84,1,.083,alloy,18);
    barrel(rotor,-.33,.35,.30,steel);rim(rotor,.352,.30,.078,caseColor);
    for(let i=0;i<14;i++)rotor.rod(polar(i*TAU/14,-.36,.273),polar((i+.3)*TAU/14,.375,.273),.036,copper,8);
  }),
  part('commutator','Segmented commutator','The copper bars rotate past the brushes. Insulating gaps separate neighboring bars.',[.03,.70,.14],(r,t)=>{
    const rotor=rotateLrvWheel(r,t);
    barrel(rotor,.37,.64,.219,ink);
    for(let i=0;i<18;i++){
      const a=i*TAU/18+.023,b=(i+1)*TAU/18-.023;
      rotor.polygon([polar(a,.38,.232),polar(b,.38,.232),polar(b,.63,.232),polar(a,.63,.232)],i%2?copper:gold,false);
    }
  }),
  part('brushes','Stationary carbon brushes','The opposing brush contacts carried current to the rotating commutator.',[.64,.24,.32],r=>{
    for(const s of [-1,1]){
      r.rod([s*.243,.52,1],[s*.40,.52,1],.054,ink,4);
      r.rod([s*.39,.52,1],[s*.53,.57,1.17],.022,copper,8);
    }
  })
],[.62,.23],{animated:true,motionDescription:'The armature and commutator turn together between the fixed poles and brushes.'});

const waveRadius=(a,phase)=>.612+.048*Math.cos(2*(a-TAU*phase));
const harmonic=study('lrv-harmonic','Harmonic reduction gear','The elliptical wave generator pushed a flexible gear into a circular spline on opposite sides. The flexspline had two fewer teeth, so the traveling mesh produced a much slower output. Tooth spacing is enlarged in this view.',cutaway,[
  part('rigid','Rigid circular spline','The teeth of the outer gear face inward around the entire circumference.',[0,-.64,-.12],r=>{
    barrel(r,-.12,.15,.805,caseColor);rim(r,.152,.805,.687,alloy);
    for(let i=0;i<48;i++){
      const a=i*TAU/48;
      r.polygon([polar(a-.046,.154,.693),polar(a-.029,.154,.657),polar(a+.029,.154,.657),polar(a+.046,.154,.693)],steel,false);
    }
  }),
  part('flex','Flexible toothed cup','The thin cup changes shape as the ellipse passes. The teeth meet the rigid spline near the ends of the ellipse’s long axis.',[.05,.61,.08],(r,t)=>{
    for(let i=0;i<96;i++){
      const a=i*TAU/96,b=(i+1)*TAU/96,ra=waveRadius(a,t),rb=waveRadius(b,t);
      r.polygon([polar(a,-.45,.472),polar(b,-.45,.472),polar(b,.147,rb),polar(a,.147,ra)],tone(gold,.83+.14*Math.sin(a)),false);
      r.polygon([polar(a,.159,ra),polar(b,.159,rb),polar(b,.159,rb-.042),polar(a,.159,ra-.042)],gold,false);
    }
    for(let i=0;i<46;i++){
      const a=i*TAU/46,r0=waveRadius(a,t);
      r.polygon([polar(a-.050,.161,r0-.008),polar(a-.023,.161,r0+.019),polar(a+.023,.161,r0+.019),polar(a+.050,.161,r0-.008)],'#bd965d',false);
    }
  }),
  part('wave','Wave generator and bearing','The long axis of the rotating input acts through a bearing. Watch the two points of closest contact travel around the ring.',[0,1.04,.21],(r,t)=>{
    const rotor=rotateLrvWheel(r,t),ellipse=(a,y,w,h)=>[w*Math.cos(a),y,1+h*Math.sin(a)];
    for(let i=0;i<48;i++){
      const a=i*TAU/48,b=(i+1)*TAU/48;
      rotor.polygon([ellipse(a,.165,.615,.519),ellipse(b,.165,.615,.519),ellipse(b,.165,.459,.37),ellipse(a,.165,.459,.37)],steel,false);
      if(i%2===0)rotor.rod(ellipse(a,.171,.558,.464),ellipse(a,.181,.558,.464),.021,alloy,8);
    }
    for(const s of [-1,1])rotor.rod([0,.169,1],[s*.49,.169,1],.055,steel,8);
    rotor.tubeY(0,-.30,.28,1,.088,caseColor,16);rotor.ringY(0,.282,1,.088,0,alloy,16);
  }),
],[.18,.16],{animated:true,motionDescription:'Follow the two mesh zones around the ring as the ellipse turns. The animation isolates the traveling deformation.'});

export function getLrvDrive(id){
  if(id==='lrv-wheel.drive'||id==='lrv-wheel.hub')return traction;
  if(id==='lrv-traction.motor')return motor;
  if(id==='lrv-traction.reduction')return harmonic;
  return null;
}
