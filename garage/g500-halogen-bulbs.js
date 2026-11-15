// Millimetres from the seating plane of the three P43t lugs. The map argument
// places this same definition in the headlamp, the vehicle, or a magnified study.
import {glazingFace} from './surface-materials.js';
import {tint} from './mechanism-shapes.js';

export const h4SupplierDrawing={label:'OSRAM 64193 H4 · dimensional drawing, 82 × 17 mm',url:'https://www.osram.com/appsj/pdc/pdf.do?cid=GPS01_1057023&lid=EN&mpid=ZMP_61180&vid=PP_EUROPE_EAST_eCat#page=3'};
export const h4FilamentDrawing={label:'UN Regulation 37 · H4 sheets 1–5, cap and filament datums',url:'https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/r037r5e.pdf#page=33'};
export const h4Components=['envelope','low','high','shield','flange','contacts'];
const metal='#adb7b4',brass='#a99572';
const full=2*Math.PI;
function surface(r,map,profile,segments,color,glass=false){
  const pt=([d,rad],a)=>map(rad*Math.cos(a),rad*Math.sin(a),d);
  for(let i=0;i<segments;i++){
    const a=i*full/segments,b=(i+1)*full/segments;
    for(let j=1;j<profile.length;j++){
      const prev=profile[j-1],curr=profile[j];
      const points=[pt(prev,a),pt(prev,b),pt(curr,b),pt(curr,a)];
      const face=curr[1]===0?points.slice(0,3):prev[1]===0?[points[0],points[2],points[3]]:points;
      if(glass)glazingFace(r,face,color,.22);
      else r.polygon(face,tint(color,.92+.08*Math.sin(a)),false);
    }
  }
}
function plate(r,map,corners,da,db,color){
  const bottom=corners.map(([u,v])=>map(u,v,da)),top=corners.map(([u,v])=>map(u,v,db));
  r.polygon(bottom,color,false);r.polygon(top,color,false);
  for(let n=0;n<4;n++){const m=(n+1)%4;r.polygon([top[n],top[m],bottom[m],bottom[n]],tint(color,.86),false);}
}
export function drawH4(r,map,component,coarse=false){
  const n=coarse?10:30;
  switch(component){
    case 'envelope':
      surface(r,map,[[8,5.1],[12,7.6],[16,8.5],[40,8.5],[46,8],[49,6.8]],n,'#c3d2d0',true);
      surface(r,map,[[49,6.8],[51,4.1],[53,1.1],[53,0]],n,'#68706e');
      break;
    case 'flange':
      surface(r,map,[[-11,12.2],[-10.5,13.2],[-1.5,13.2],[-1.2,19],[0,19],[0,13.7],[3,12.4],[6,11],[9,7.7],[11,7.4]],n,metal);
      for(const deg of [90,230,310]){
        const angle=deg*Math.PI/180,pt=(rad,side)=>[rad*Math.cos(angle)-side*Math.sin(angle),rad*Math.sin(angle)+side*Math.cos(angle)];
        const width=deg===90?3.9:2.8;
        plate(r,map,[pt(18,-width),pt(22,-width),pt(22,width),pt(18,width)],-1,0,metal);
      }
      break;
    case 'contacts':
      surface(r,map,[[-17,0],[-17,10.3],[-16,11.8],[-11,12.1]],n,'#4b5554');
      for(const [u,v,vertical] of [[0,7.4,false],[-8.1,-1.4,true],[8.1,-1.4,true]]){
        const a=vertical?.4:3.15,b=vertical?3.15:.4;
        plate(r,map,[[u-a,v-b],[u+a,v-b],[u+a,v+b],[u-a,v+b]],-29,-16.9,brass);
      }
      break;
    case 'low':
    case 'high': {
      // UN R37 H4/2 e, H4/4 lR + lC. Support shape and coil winding are illustrative.
      const low=component==='low',start=low?28.5:22.3,length=low?5.5:4.5,v=low?0:-.8;
      const sample=map(0,0,0),unit=Math.hypot(...map(1,0,0).map((x,i)=>x-sample[i]));
      const helix=t=>map(.48*Math.cos(t*full*7),v+.48*Math.sin(t*full*7),start+length*t);
      const rod=(p,q,w,col)=>r.rod(p,q,w*unit,col,coarse?4:6);
      for(const [wire,t] of [[-1,0],[1,1]])rod(map(low?3:-3,wire*1.8,10),helix(t),.23,metal);
      if(coarse)rod(map(0,v,start),map(0,v,start+length),.45,'#baaa81');
      else for(let i=1;i<=56;i++)rod(helix((i-1)/56),helix(i/56),.13,'#b5a37f');
      break;
    }
    case 'shield': {
      const k=coarse?5:18;
      for(let i=0;i<k;i++){
        const pt=(idx,d)=>{const t=Math.PI*(1+idx/k);return map(3.9*Math.cos(t),-1.2+3.9*Math.sin(t),d);};
        r.polygon([pt(i,27.4),pt(i+1,27.4),pt(i+1,36),pt(i,36)],'#aeb5ac',false);
        r.polygon([pt(i,36),pt(i+1,36),map(0,-1.2,36)],'#bcc3bb',false);
      }break;
    }
  }
}

export const h3SupplierDrawing={label:'OSRAM 64151 H3 · PK22s base, envelope and flying lead',url:'https://www.osram.com/appsj/pdc/pdf.do?cid=GPS01_1057023&lid=EN&mpid=ZMP_61217&vid=MP_APAC_IN_eCat#page=2'};
export const h3Components=['glass','filament','base'];
export function drawH3(r,map,key,coarse=false){
  const n=coarse?10:28,origin=map(0,0,0),unit=Math.hypot(...map(1,0,0).map((x,i)=>x-origin[i]));
  const wire=(p,q,rad,col)=>r.rod(map(...p),map(...q),rad*unit,col,coarse?5:8);
  switch(key){
    case 'glass':
      surface(r,map,[[3.4,3.1],[8.7,3.7],[12,5.3],[14,5.75],[24,5.75],[26.8,5.2],[28.6,3],[30.6,1.1],[31.5,.65],[31.5,0]],n,'#bbd0cc',true);
      break;
    case 'filament': {
      // R37 H3/1–3: the light-emitting centre is 18 mm ahead of the cap datum.
      for(const side of [-1,1])wire([side*1.9,0,5],[side*2.4,0,18],.22,metal);
      const p=t=>[-2.4+4.8*t,.50*Math.cos(t*full*6),18+.50*Math.sin(t*full*6)];
      if(coarse)wire([-2.4,0,18],[2.4,0,18],.42,'#b3a079');
      else for(let i=1;i<=48;i++)wire(p((i-1)/48),p(i/48),.14,'#b3a079');
      break;
    }
    case 'base': {
      // A fresh mesh uses the supplier's rigid body length. The insulated lead
      // bends outside that 42 mm envelope and its installed route is illustrative.
      surface(r,map,[[-10.5,0],[-10.5,4.7],[-8,7.1],[-1.2,7.1],[-1.2,11],[0,11],[0,7.3],[2.3,6],[3.5,4]],n,metal);
      const pts=[[0,0,-10.5],[1.5,0,-15],[5,0,-18],[11,0,-19],[18,0,-18],[27,0,-16],[35,0,-16]];
      for(let k=1;k<pts.length;k++)wire(pts[k-1],pts[k],1.15,'#777e77');
      plate(r,map,[[34,-2],[38,-2],[38,2],[34,2]],-17.5,-14.5,metal);
      plate(r,map,[[38,-3.15],[44,-3.15],[44,3.15],[38,3.15]],-16.4,-15.6,brass);
      break;
    }
  }
}
