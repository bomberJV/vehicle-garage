import {TAU,part,study,turn,cyl,sleeve,gear,x,y,z,origin,metal,steel,dark,gold} from './mechanism-shapes.js';
import {barrel,ellipse,pipe} from './road-primitives.js';

const model='0E63-USA---K67-BMW-S+1000+RR+21+%280E61%2C+0E63%29';
export function plate(id,name){
  return {label:'BMW Motorrad · '+name+' · plate '+id,url:'https://www.realoem.com/bmw/enUS/showparts?diagId='+id+'&id='+model};
}
export const refs={
  air:plate('13_2161','Intake silencer'),duct:plate('13_2174','Primary air duct'),throttle:plate('13_2160','Throttle valves and bypass pipes'),
  radiator:plate('17_1439','Coolant radiator'),fan:plate('17_1444','Electric suction fan'),cooler:plate('17_1446','Oil cooler'),
  hoses:plate('17_1431','Water hoses'),bottle:plate('17_1445','Expansion tank'),pump:plate('11_7211','Oil and coolant pump with drive'),
  cams:plate('11_7209','Camshafts and timing chain'),
  shift:{label:'BMW Motorrad · how the 2023 ShiftCam moves',url:'https://support.bmw-motorrad.com/s/article/S-1000-RR-2023-BMW-Shiftcam-technology-BY9VQ?language=en_GB'},
  seal:{label:'BMW Motorrad · SIB 11 01 24, pump seal section',url:'https://static.nhtsa.gov/odi/tsbs/2024/MC-11000581-0001.pdf'}
};
const rubber='#444c4f',plastic='#556068',water='#84a7af';
const across=[-.66,-.22,.22,.66];
function petal(r,center,axis,angle,inner,outer,width,color){
  const point=(radius,t,lead)=>{
    const a=angle+t,c=radius*Math.cos(a),s=radius*Math.sin(a);
    return axis==='x'?[center[0]+lead,center[1]+c,center[2]+s]:[center[0]+c,center[1]+lead,center[2]+s];
  };
  const a=point(inner,0,0),b=point(outer,.36,-.4*width),c=point(outer,.69,.4*width),d=point(inner,.32,width);
  r.polygon([a,b,c],color,false);r.polygon([a,c,d],color,false);
}
const work=(id,name,note,source,parts,motion='')=>Object.assign(study(id,name,note,source,parts,motion),{viewAngle:[-.78,.38]});

export const throttle=work('k67-throttles','Four throttle bores','A single electric actuator turns the butterflies. At small openings, a separate bypass gallery supplies air around the plates. The four bores correspond to the four cylinders.',refs.throttle,[
  part('casting','Throttle-body bank','Each cylinder draws air through a 48 mm bore. One bore is sectioned to expose its plate.',[0,0,-.3],r=>{
    for(const [i,yy] of across.entries())turn(r,[0,yy,0],z,[[-.20,.142],[-.18,.17],[.20,.17],[.22,.145],[-.20,.142]],steel,{n:18,start:.45,sweep:i===0?TAU*.57:TAU});
  }),
  part('shaft','Throttle shaft','The shaft passes through all four bores. Each butterfly turns with it.',[0,-.48,0],r=>barrel(r,[0,-.92,0],[0,.90,0],.019,metal,12)),
  part('plates','Butterfly plates','As the plate turns edge-on to the air stream, the open area increases.',[.30,0,.22],(r,t)=>{
    const angle=.12+(1-Math.cos(TAU*t))*.655;
    for(const yy of across)ellipse(r,[0,yy,0],[.140*Math.cos(angle),0,.140*Math.sin(angle)],[0,.140,0],1,0,gold,22);
  }),
  part('actuator','Throttle actuator','An electric drive at the end of the bank turns the shaft.',[0,.48,.14],r=>{
    r.profile([[-.13,-.14],[.14,-.14],[.17,.10],[.03,.17],[-.13,.09]],.85,1.03,rubber);
    cyl(r,[.07,.97,-.11],x,-.06,.23,.066,steel,14);
  }),
  part('bypass','Bypass pipes and seals','Two molded pipes branch into the four ports, with individual seals at their connections.',[.31,0,-.20],r=>{
    for(const s of [-1,1]){
      pipe(r,[[.14,s*.66,.04],[.23,s*.66,.01],[.25,s*.22,.01],[.14,s*.22,.04]],.026,plastic);
      for(const yy of [.22,.66])sleeve(r,[.15,s*yy,.04],x,-.012,.014,.038,.025,rubber,10);
    }
  })
],'Watch all four butterflies open together.');

export const fan=work('k67-radiator-fan','Radiator fan','The removable fan sits behind the radiator. Its frame stays fixed while the electric motor spins the blades inside the shroud.',refs.fan,[
  part('frame','Shroud and mounting ears','The molded rim keeps the blade tips clear. The assembly fastens to the radiator at two mounting points.',[-.30,-.25,.15],r=>{
    sleeve(r,origin,x,-.085,.075,.56,.516,plastic,36);
    for(const s of [-1,1])sleeve(r,[0,s*.44,s*.39],x,-.083,.03,.080,.033,plastic,14);
  }),
  part('spider','Motor supports','Molded arms run from the center motor mount to the fixed outer frame.',[.30,0,-.23],r=>{
    for(let i=0;i<5;i++){const a=i*TAU/5;pipe(r,[[.082,.15*Math.cos(a),.15*Math.sin(a)],[.09,.31*Math.cos(a+.09),.31*Math.sin(a+.09)],[.075,.53*Math.cos(a+.19),.53*Math.sin(a+.19)]],.020,plastic,7);}
  }),
  part('motor','Motor and connector','The motor sits at the center of the shroud, with a lead running to the electrical connector.',[.39,.22,.08],r=>{
    cyl(r,origin,x,.035,.175,.145,steel,20);pipe(r,[[.16,0,0],[.16,.20,-.16],[.11,.42,-.22]],.018,rubber,8);
    r.box(.075,.405,-.259,.155,.49,-.18,rubber);
  }),
  part('rotor','Hub and fan blades','Curved blades sweep a circular path. Blade pitch and speed are illustrative.',[-.39,0,.12],(r,t)=>{
    cyl(r,origin,x,-.060,.029,.140,dark,20);
    for(let i=0;i<7;i++)petal(r,[-.018,0,0],'x',TAU*(i/7+t),.115,.49,.047,steel);
  })
],'Run the fan to see which elements stay attached to the radiator.');

export const seal=work('k67-pump-seal','The pump’s mechanical face seal','BMW’s service bulletin shows a thin liquid film between two annular faces. The spring holds the faces together as the shaft turns.',refs.seal,[
  part('shaft','Pump shaft','The shaft passes through the center of the assembled seal.',[0,.38,0],r=>cyl(r,origin,y,-.62,.62,.105,metal)),
  part('fixed','Stationary seat','One face is held in the housing. Its polished annulus meets the opposing ring.',[0,-.43,.09],r=>turn(r,origin,y,[[-.29,.13],[-.29,.34],[-.14,.34],[-.10,.248],[-.10,.134],[-.29,.13]],water)),
  part('rotating','Rotating face','The mating face turns with the shaft. The narrow annulus at the end runs against the stationary seat.',[0,.27,.29],r=>turn(r,origin,y,[[-.10,.134],[-.10,.25],[.02,.25],[.055,.21],[.055,.134],[-.10,.134]],'#bd795c')),
  part('spring','Spring and carrier','The spring maintains contact even as the faces wear.',[0,.40,-.23],r=>{
    const pts=[];for(let i=0;i<=72;i++){const t=i/72;pts.push([.172*Math.cos(TAU*4*t),.065+.27*t,.172*Math.sin(TAU*4*t)]);}
    pipe(r,pts,.016,metal,7);sleeve(r,origin,y,.328,.393,.236,.109,steel);
  })
]);
export const pump=work('k67-combined-pump','Combined oil and coolant pump','BMW supplies the pumping stages as one assembly. The sprocket and chain drive its transverse shaft. Oil transfer pipes, the pickup and the coolant seal separate on the bench.',refs.pump,[
  part('body','Pump housing and pickup','The low-mounted pickup draws oil from the sump. The main housing encloses the two pumping sections.',[0,0,-.34],r=>{
    turn(r,origin,y,[[-.37,0],[-.37,.22],[-.29,.29],[.32,.26],[.36,.19],[.36,0]],steel,{n:20,start:.32,sweep:TAU*.70});
    pipe(r,[[0,-.19,-.15],[.24,-.19,-.28],[.36,-.19,-.37]],.063,steel);
    turn(r,[.36,-.19,-.40],z,[[-.055,.17],[-.02,.19],[.06,.06]],dark,{n:14});
  }),
  part('impeller','Coolant impeller','The shaft spins the impeller. Its vanes push coolant out from the hub toward the casing.',[0,.52,.12],(r,t)=>{
    cyl(r,[0,.293,0],y,-.025,0,.199,metal,18);
    for(let i=0;i<7;i++)petal(r,[0,.30,0],'y',TAU*(t+i/7),.052,.192,.058,water);
  }),
  part('seal','Mechanical face seal','Open the seal for the two mating rings and spring shown in BMW’s sectional drawing.',[.31,.20,-.20],r=>{
    sleeve(r,origin,y,.13,.18,.121,.052,water);sleeve(r,origin,y,.18,.22,.105,.052,'#bd795c');
  }),
  part('sprocket','Drive sprocket and nut','The sprocket fits the shaft at the chain end of the pump.',[0,-.52,.12],(r,t)=>{
    gear(r,origin,y,-.49,-.45,.184,.184,18,metal,TAU*t);
    cyl(r,origin,y,-.53,-.49,.071,dark,6);
  }),
  part('transfer','Oil transfer pipes and O-rings','The larger transfer pipe ends in two round sockets. Rings seal the tube ends in the housing.',[-.39,.10,.14],r=>{
    pipe(r,[[.13,-.20,.13],[.27,-.20,.13],[.27,-.14,.35],[.22,.17,.35],[.16,.17,.22]],.043,steel);
    for(const yy of [-.20,.17])sleeve(r,[.172,yy,yy<0?.13:.22],x,-.009,.010,.054,.040,rubber,12);
  })
],'Rotate the sprocket and impeller on their common shaft.');

function camLobe(r,at,width,height,angle,color){
  const stations=20;
  const point=(i,offset)=>{
    const theta=TAU*i/stations,rad=.105+height*Math.pow(Math.max(0,Math.cos(theta-angle)),3);
    return [rad*Math.cos(theta),at+offset,rad*Math.sin(theta)];
  };
  for(let i=0;i<stations;i++){
    const a=point(i,0),b=point(i+1,0),c=point(i+1,width),d=point(i,width);
    r.polygon([a,b,c,d],color,false);
    r.polygon([[0,at,0],b,a],color,false);r.polygon([[0,at+width,0],d,c],color,false);
  }
}
export const shift=work('k67-shiftcam','ShiftCam intake camshaft','Two sliding sections share the intake shaft. Each valve has two adjacent lobe profiles. A pin enters a shift gate and the rotation of the shaft moves the segment across its follower.',refs.shift,[
  part('shaft','Common intake shaft','The two lobe carriers turn with the central shaft and slide along its axis.',[0,-.42,-.18],r=>cyl(r,origin,y,-1.04,1.02,.068,metal,22)),
  ...[-1,1].map((side,i)=>part('segment-'+(i+1),'Intake cam segment '+(i+1),'This segment serves two cylinders. Its short- and high-lift profiles sit side by side.',[0,side*.36,.22],(r,t)=>{
    const axial=.036*(1-Math.cos(TAU*t)),mid=side*.47-axial;
    sleeve(r,[0,mid,0],y,-.438,.438,.093,.070,steel,20);
    for(const bank of [-1,1])for(const valve of [-1,1]){
      const p=mid+bank*.23+valve*.103,rot=TAU*t+bank*Math.PI/2+side*Math.PI/2;
      camLobe(r,p-.046,.046,.048,rot,steel);camLobe(r,p+.001,.05,.082,rot+.18,gold);
    }
    sleeve(r,[0,mid,0],y,-.050,.050,.123,.094,metal);
    const track=[];
    for(let j=0;j<=18;j++){const a=TAU*(j/18+t);track.push([.124*Math.cos(a),mid+.029*Math.cos(TAU*j/18),.124*Math.sin(a)]);}
    pipe(r,track,.007,dark,5);
  })),
  part('actuators','Two switching actuators','The actuator pins engage a groove on the rotating carrier. Each actuator serves its own segment.',[.20,.12,.35],r=>{
    for(const side of [-1,1]){const p=[0,side*.47,0];cyl(r,p,z,.128,.27,.027,metal,12);cyl(r,p,z,.27,.41,.087,dark,16);}
  })
],'Watch the paired lobe carriers shift across the shaft. Travel and speed are enlarged for inspection.');
