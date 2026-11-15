import {part,study,cyl,y,z} from './mechanism-shapes.js';
import {strip} from './road-primitives.js';

const catalog='https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=654';
export const stopLampSource={label:'Porsche PET · additional brake light, plate 905-10',url:catalog};
export function stopLampStudy(){
  const span=Array.from({length:25},(_,i)=>(i-12)/12);
  const point=(u,dx,dz)=>[.030*(1-u*u)+dx,u*.53,.26-.015*u*u+dz];
  return study('993highstop','High-mounted stop lamp','Porsche lists a curved lamp, 24 bulbs and two mounting screws for option M602. The section opens the housing so the row of bulbs is visible.',stopLampSource,[
    part('housing','Lamp housing','Two retaining points locate the curved housing on the brake-light bridge.',[-.13,0,.10],r=>{
      const row=(x,z)=>span.map(u=>point(u,x,z));
      strip(r,row(-.015,-.015),row(-.015,.015),'#5a5c5d');
      strip(r,row(-.015,.015),row(.012,.015),'#54585a');
      strip(r,row(-.015,-.015),row(.012,-.015),'#555a5c');
    }),
    part('lens','Red outer lens','The red lens spans the row of bulbs.',[.16,0,.09],r=>{
      const row=(x,z)=>span.map(u=>point(u,x,z));
      const start=r.faces.length;
      strip(r,row(.013,-.013),row(.013,.013),'#ae393c');
      for(let i=start;i<r.faces.length;i++)r.faces[i].opacity=.46;
    }),
    part('bulbs','24 incandescent bulbs','The catalog specifies 12 V, 1.4 W bulbs. Their spacing and socket shapes are approximate.',[0,0,.18],r=>{
      for(let i=0;i<24;i++){
        const c=point((i-11.5)/12,0,0);
        r.instance('bulb-'+(i+1),()=>{cyl(r,c,y,-.005,.005,.007,'#d9ccaa',10);cyl(r,[c[0]-.008,c[1],c[2]],y,-.005,.005,.006,'#90908a',8);});
      }
    }),
    part('mounts','Retainers and mounting screws','The catalog lists two retainers and two 3.5 × 20 mm oval-head screws.',[0,0,-.14],r=>{
      for(const s of [-1,1]){
        const c=point(.63*s,-.010,-.012);
        r.box(c[0]-.010,c[1]-.010,c[2]-.003,c[0]+.010,c[1]+.010,c[2]+.002,'#7e8383');
        cyl(r,c,z,-.021,0,.00175,'#777c7d',8);cyl(r,c,z,-.023,-.020,.0035,'#939696',10);
      }
    })
  ]);
}
