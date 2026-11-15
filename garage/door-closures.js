import {part,study,sleeve,cyl,tint} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';
import {references} from './door-profiles.js';
import {g500CargoStudy} from './g500-cargo-study.js';

const closures={
  f350:{name:'F-Series drop tailgate',width:1.64,height:.50,source:references.fordGate,truck:true,
    text:'Two bottom pivots carry the gate. The center handle operates catches at both ends. A cable on each side supports the bed face when the gate lies open.'},
  hrv:{name:'HR-V liftgate',width:1.37,height:1.01,glazed:true,source:references.hondaGate,
    text:'The hatch turns on two roof hinges. The rear glass sits in a stationary opening in the hatch shell. Side stays support the open hatch and the latch meets the lower sill.'},
  c63:{name:'W204 sedan trunk lid',width:1.28,height:.53,source:references.benzLid,
    text:'The pressed outer lid and folded inner structure form a curved panel behind the fixed rear window. A central latch meets the trunk sill.'},
  bmw325ci:{name:'E46 coupe trunk lid',width:1.27,height:.57,source:references.bmwLid,
    text:'The luggage lid curves over the rear panel. Its liner covers the lower face, with the central latch standing proud of the lining.'}
};
function shellPoint(p,u,h,dy=0){
  const z=h*p.height;
  const x=u*p.width*.5*(1-(p.truck?0:.07)*h);
  // For a trunk lid the upper half folds forward over the luggage space.
  const y=p.truck?0:p.glazed?-.31*h*h:-.52*h**1.65;
  return [x,y+.028*(1-u*u)+dy,z];
}
function patch(r,p,u0,u1,h0,h1,color,dy=0,glass=false){
  const n=Math.max(2,Math.ceil((u1-u0)*8)),m=4;
  for(let i=0;i<n;i++)for(let j=0;j<m;j++){
    const x=k=>u0+(u1-u0)*k/n,h=k=>h0+(h1-h0)*k/m;
    const pts=[[x(i),h(j)],[x(i+1),h(j)],[x(i+1),h(j+1)],[x(i),h(j+1)]].map(([u,v])=>shellPoint(p,u,v,dy));
    if(glass)glazingFace(r,pts,color,.42);else r.polygon(pts,tint(color,.89+.12*j/m+.036*Math.sin(i*Math.PI/n)),false);
  }
}
const path=(r,p,coords,dy,radius,color)=>pipe(r,coords.map(([u,h])=>shellPoint(p,u,h,dy)),radius,color,8);
export function cargoSection(vehicle){
  if(vehicle==='g500')return g500CargoStudy;
  const p=closures[vehicle];if(!p)return null;
  const id='closure-'+vehicle,steel='#9caeab',paint='#718a80',black='#363f41';
  const parts=[
    part('skin','Hemmed outer panel','The painted sheet turns around the perimeter and meets the inner pressing.',[0,.55,.04],r=>{
      if(p.glazed){patch(r,p,-1,1,0,.47,paint);patch(r,p,-1,-.91,.47,.95,paint);patch(r,p,.91,1,.47,.95,paint);patch(r,p,-1,1,.95,1,paint);}
      else patch(r,p,-1,1,0,1,paint);
      if(p.truck)for(const h of [.18,.73,.81])path(r,p,[[-.92,h],[0,h],[.92,h]],.007,.007,'#a6b8b2');
    }),
    part('pressing',p.truck?'Ribbed bed face':'Inner reinforcement','Folded ribs give the large panel its stiffness. The cutaway retains the perimeter and the mounting areas.',[0,-.45,.05],r=>{
      for(const h of [.05,p.glazed?.44:.91])path(r,p,[[-.94,h],[-.52,h+.025],[.52,h+.025],[.94,h]],-.061,.018,steel);
      for(const u of [-.94,.94])path(r,p,[[u,.06],[u,p.glazed?.94:.90]],-.052,.022,steel);
      if(p.truck)for(let k=-4;k<=4;k++)path(r,p,[[k*.19,.16],[k*.19,.83]],-.055,.018,steel);
      else for(const s of [-1,1])path(r,p,[[s*.86,.10],[s*.57,.25],[s*.29,p.glazed?.40:.85]],-.059,.017,steel);
    }),
    part('hinge',p.truck?'End pivots':'Upper hinge pair',p.truck?'The hinge pins align across the bed width.':'The hinges connect the top or leading edge of the panel to the body.',[-.42,0,.37],r=>{
      const axes=[1,0,0];
      const places=p.truck?[[-.97,.085],[.97,.085]]:[[-.65,.968],[.65,.968]];
      for(const [u,h] of places){const c=shellPoint(p,u,h,-.032);cyl(r,c,axes,-.052,.052,.019,steel,16);
        path(r,p,[[u*.91,h-.021],[u,h]],-.022,.016,paint);}
    }),
    part('latch',p.truck?'Left and right catches':'Latch and striker',p.truck?'One catch at each end meets the corresponding bed pillar.':'The latch at the bottom or rear of the lid meets a striker on the sill.',[.40,-.2,-.12],r=>{
      const places=p.truck?[[-.97,.79],[.97,.79]]:[[0,.055]];
      for(const [u,h] of places){const c=shellPoint(p,u,h,-.035);
        r.box(c[0]-.033,c[1]-.036,c[2]-.037,c[0]+.033,c[1]+.034,c[2]+.038,black);
        sleeve(r,[c[0],c[1]+.038,c[2]],[0,1,0],0,.012,.024,.012,steel,16);
      }
    }),
    part('handle',p.truck?'Outside handle and rods':'Outside release',p.truck?'The central handle pulls the two linkage rods toward the middle, releasing the catches.':'The outside grip or release lies on the exterior face of the panel.',[.18,.29,.19],r=>{
      const u=0,h=p.truck?.78:.31;
      path(r,p,[[u-.085,h],[u-.08,h+.029],[u+.08,h+.029],[u+.085,h]],.028,.010,black);
      if(p.truck)for(const s of [-1,1])path(r,p,[[s*.02,h],[s*.54,h-.04],[s*.97,.79]],-.025,.005,steel);
    })
  ];
  if(p.glazed){
    parts.push(part('glass','Fixed rear glass and gasket','The window sits in the opening in the hatch, above the reinforcement and latch.',[0,-.07,.48],r=>{
      patch(r,p,-.91,.91,.47,.95,'#78989d',-.01,true);
      path(r,p,[[-.91,.47],[-.91,.95],[.91,.95],[.91,.47],[-.91,.47]],-.01,.008,black);
      for(let i=1;i<=8;i++)path(r,p,[[-.87,.47+i*.05],[0,.47+i*.05],[.87,.47+i*.05]],-.016,.0018,'#87745f');
    }));
  }
  if(p.truck||vehicle==='hrv'){
    parts.push(part('supports',p.truck?'Tailgate support cables':'Liftgate stays',p.truck?'The two flexible cables go taut when the bed face reaches its open position. They sit outside the latch linkage.':'A stay on each side supports the weight of the raised hatch.',[0,.05,-.38],r=>{
      for(const s of [-1,1]){
        const a=shellPoint(p,.91*s,p.truck?.75:.56,-.085);
        if(p.truck){pipe(r,[a,[a[0]+.028*s,-.092,.22],[a[0]+.046*s,-.158,.27],[a[0]+.077*s,-.12,.42]],.008,black,8);}
        else{const b=[a[0]+.06*s,a[1]-.10,a[2]-.31];
          r.rod(a,b,.015,black,12);r.rod(b,[b[0]+.03*s,b[1]-.047,b[2]-.15],.008,steel,12);}
      }
    }));
  }
  const d=study(id,p.name,p.text,p.source,parts);d.viewAngle=[-.49,.27];return d;
}
