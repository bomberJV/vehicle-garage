import {sectionedWheel} from './sectioned-road-wheel.js';
import {e46Style43,e46Style44,e46Style68Front,e46Style68Rear} from './e46-wheel-specs.js';
import {drawWheelFace} from './wheel-faces.js';
import {tint} from './road-primitives.js';

// February 2003 US 325Ci, BMW parts plate 36_0342, item 3. Five large rounded
// openings are cut into the cast face. The five mounting pockets sit on a 120 mm circle.
export function style43Face(r,{x,y,z,side,rim,finish}){
  const halfSector=Math.PI/5,root=.344,edge=(rim-.016)/rim;
  const point=(a,radius,depth)=>[x+rim*radius*Math.cos(a),y+side*depth,z+rim*radius*Math.sin(a)];
  const depth=radius=>-.007+.026*radius*radius;
  const station=(a,low,high)=>{
    const line=(radius,inset=0)=>point(a,radius,depth(radius)-inset);
    return {pad:line(root),lip:line(edge),in:line(low),out:line(high),
      padBack:line(root,.015),lipBack:line(edge,.015),inBack:line(low,.015),outBack:line(high,.015)};
  };
  const face=(pts,light)=>r.polygon(pts,tint(finish,light),false);
  for(let i=0;i<5;i++){
    const opening=Math.PI/2+(i+.5)*2*Math.PI/5;
    const rows=[station(opening-halfSector,.692,.692)];
    for(let j=0;j<=18;j++){
      const a=-Math.PI/2+Math.PI*j/18,u=Math.sin(a),curve=Math.max(0,Math.cos(a));
      const waist=.650+.042*u*u;
      rows.push(station(opening+.50*u,waist-.229*curve,waist+.220*curve));
    }
    rows.push(station(opening+halfSector,.692,.692));
    for(let j=1;j<rows.length;j++){
      const a=rows[j-1],b=rows[j];
      face([a.pad,a.in,b.in,b.pad],.97);face([a.out,a.lip,b.lip,b.out],1.03);
      face([a.padBack,b.padBack,b.inBack,a.inBack],.59);face([a.outBack,b.outBack,b.lipBack,a.lipBack],.67);
      if(j>1 && j<rows.length-1){
        face([a.in,a.inBack,b.inBack,b.in],.61);face([a.out,b.out,b.outBack,a.outBack],.77);
      }
    }
  }
  const pad=y+side*depth(root);
  r.ringY(x,pad,z,rim*root,.036,tint(finish,.94),48);
  r.ringY(x,pad+side*.0015,z,.036,.032,tint(finish,1.07),32);
  r.ringY(x,pad+side*.002,z,.032,0,'#30383d',32);
  for(let i=0;i<5;i++){
    const a=Math.PI/2+i*2*Math.PI/5,xx=x+.060*Math.cos(a),zz=z+.060*Math.sin(a);
    r.ringY(xx,pad+side*.001,zz,.012,0,'#323b3f',12);
    r.ringY(xx,pad+side*.002,zz,.008,0,'#70797d',6);
  }
  for(let quadrant=0;quadrant<4;quadrant++){
    const d=depth(root)+.0025,points=[point(0,0,d)];
    for(let k=0;k<=7;k++)points.push(point((quadrant+k/7)*Math.PI/2,.12,d));
    r.polygon(points,quadrant%2?'#d4dde0':'#4d88ad',false);
  }
}

export function drawE46WheelAndTire(r,mount){
  const id=mount.design?.id,alternative=id==='style68'||id==='style44';
  const spec=id==='style44'?e46Style44:alternative?(mount.x<0?e46Style68Front:e46Style68Rear):e46Style43;
  sectionedWheel(r,mount,spec,e46Style43.offset,(r,face)=>{
    if(alternative)drawWheelFace(r,mount.design,face);
    else style43Face(r,face);
  });
}
