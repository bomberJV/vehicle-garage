import {style43Face} from './e46-wheels.js';
// Front elevations use the same wheel-center generators as the installed parts.
import {GarageRenderer} from './render.js';
import {utilityWheelSpokes} from './exterior-utility.js';
import {roadWheelSpokes} from './exterior-alloys.js';
import {alloy992,alloy993,alloy996} from './porsche-wheels.js';
import {drawAlternativeAlloy,drawApex6} from './wheel-faces.js';
import {wheel} from './road-primitives.js';
import {wheelDesign} from './wheel-designs.js';
export function drawWheelSample(canvas,vehicle,id,finish='#b8c0bd'){
  const design=wheelDesign(vehicle,id),ctx=canvas?.getContext?.('2d');
  if(!design||!ctx)return;
  const {width,height}=canvas;
  const rim=design.frontDiameter*.0127,car={vehicle,x:0,y:0,z:0,rim,side:1,width:.25,finish};
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:'wheel'});
  if(vehicle==='bmws1000rr'){
    wheel(r,{...car,width:.120,radius:.300,moto:true,drawRim:design.id==='apex6'?drawApex6:undefined,
      tags:{rim:'sample',brake:'brake',tire:'tire'}});
    r.faces=r.faces.filter(face=>face.part==='sample');
  }else if(vehicle==='bmw325ci' && design.id==='stock'){
    r.ringY(0,.096,0,rim+.011,rim-.013,finish,48);
    style43Face(r,{...car,y:.071});
  }else if(vehicle==='g500'){
    r.ringY(0,.103,0,rim+.011,rim-.013,finish,48);
    utilityWheelSpokes(r,{...car,design:design.id,y:.077});
  }else if(design.id!=='stock')drawAlternativeAlloy(r,design,car);
  else if(vehicle==='porsche993cab'||vehicle==='porsche992scab'||vehicle==='porsche996cab'){
    ({porsche993cab:alloy993,porsche992scab:alloy992,porsche996cab:alloy996}[vehicle])(r,car);
  }else{
    r.ringY(0,.132,0,rim,rim-.019,finish,48);
    (vehicle==='f350'?utilityWheelSpokes:roadWheelSpokes)(r,{...car,y:.098});
  }
  ctx.clearRect(0,0,width,height);
  const scale=Math.min(width,height)*.45/rim,cx=width/2,cz=height/2;
  ctx.fillStyle='#1c2326';ctx.beginPath();ctx.arc(cx,cz,rim*scale*1.095,0,Math.PI*2);ctx.fill();
  const front=face=>face.points.reduce((sum,p)=>sum+p[1],0)/face.points.length;
  for(const face of r.faces.sort((a,b)=>front(a)-front(b))){
    ctx.beginPath();
    face.points.forEach(([x,,z],i)=>{const X=cx+x*scale,Y=cz-z*scale;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});
    ctx.closePath();ctx.fillStyle=face.color;ctx.fill();
  }
}
