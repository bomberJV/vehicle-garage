// The late 993 single-motor drive is in Porsche PET plate 811-35, pos. 24, MY 96–98:
// https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=558
// The 992 front frame, two panel bows, rear window, central latch and side cylinders:
// https://newsroom.porsche.com/en/2019/products/porsche-911-cabriolet-lightweight-roof-innovation-17230.html
// Hidden joints and the folded sections are fitted to the car. The two end positions
// illustrate its packaging; they do not define a measured folding trajectory.
import {coupeShape} from './porsche-coachwork.js';
import {roofSections,roofPoint} from './porsche-raised-top.js';
import {glazingFace} from './surface-materials.js';
import {drawPorscheCompartmentLid} from './porsche-cabin.js';
import {paintChoice} from './paint-colors.js';
import {cyl,sleeve,y,mix} from './mechanism-shapes.js';

const alloy='#888c8b',iron='#555b5c',trim='#303638',fabric='#434548';
const spans=[-.96,-.72,-.36,0,.36,.72,.96];
function crossBow(r,at,radius,color){
  const p=spans.map(at);
  for(let j=1;j<p.length;j++)r.rod(p[j-1],p[j],radius,color,7);
}
function panelBow(r,fore,aft,color){
  for(let j=1;j<spans.length;j++){
    const a=spans[j-1],b=spans[j];
    r.polygon([fore(a),fore(b),aft(b),aft(a)],color,false);
  }
}
const loweredPoint=(car,i,u)=>{
  // The hard-glass modern package folds flush. The classic flexible screen folds with the fabric.
  const q=car.modern?[[.74,.861],[.936,.825],[1.013,.786],[1.132,.735]][i]:
    [[.761,.884],[.824,.864],[.859,.839],[.918,.809]][i];
  return [q[0]+.020*(1-u*u),u*(car.modern?.589:.548),q[1]-.020*u*u];
};
function mount(car,s){return car.modern?[.755,s*.612,.763]:[.693,s*.586,.770];}
function positioned(r,id,alias,draw){r.tag(alias?'cabin.top':'roof.'+id,draw);}
function roofFrame(r,car,raised,alias){
  const rows=roofSections(car);
  const beam=(stage,u)=>{
    if(!raised)return loweredPoint(car,stage,u);
    const p=roofPoint(rows[[0,2,3,4][stage]],u);
    return [p[0]+(stage===0?.011:0),p[1],p[2]-(stage===0?.013:.019)];
  };
  positioned(r,'header',alias,()=>{
    crossBow(r,u=>beam(0,u),.010,iron);
    if(car.modern){
      const center=beam(0,0);
      r.box(center[0]+.014,-.040,center[2]-.018,center[0]+.077,.040,center[2]-.007,trim);
      panelBow(r,u=>beam(0,u),u=>{
        if(!raised){const [xx,yy,zz]=beam(0,u);return [xx+.166,yy,zz-.012];}
        const [xx,yy,zz]=roofPoint(rows[1],u);return [xx-.007,yy,zz-.016];
      },iron);
    }
  });
  positioned(r,'bows',alias,()=>{
    if(car.modern){
      // Each broad sheet directly supports the closed roof skin. Neither is a tubular bow.
      for(const i of [1,2]){
        const a=u=>{
          if(!raised){const [xx,yy,zz]=beam(i,u);return [xx-.143,yy,zz];}
          const [xx,yy,zz]=roofPoint(rows[i],u);return [xx+.009,yy,zz-.017];
        };
        const b=u=>{
          if(!raised){const [xx,yy,zz]=beam(i,u);return [xx+.140,yy,zz-.013];}
          const [xx,yy,zz]=roofPoint(rows[i+1],u);return [xx-.009,yy,zz-.017];
        };
        panelBow(r,a,b,alloy);crossBow(r,b,.005,iron);
      }
    }else for(const i of [1,2,3])crossBow(r,u=>beam(i,u),.009,iron);
  });
  if(!raised){
    positioned(r,'fabric',alias,()=>{
      // Compact folds occupy the stack under the boot/lid. The 992's topmost front
      // section remains visible at the front of its compartment when down.
      for(let i=0;i<3;i++){
        const point=(u,v)=>{
          if(car.modern){
            const fore=[.717,.812,.885][i],zz=[.875,.819,.778][i];
            return [fore+.185*v+.040*(1-u*u),u*.57,zz-.022*u*u+.006*Math.sin(v*Math.PI)];
          }
          return [.767+.035*i+.065*v+.009*(1-u*u),u*.528,.868-.025*i-.022*u*u+.010*Math.sin(v*Math.PI)];
        };
        panelBow(r,u=>point(u,0),u=>point(u,.5),fabric);
        panelBow(r,u=>point(u,.5),u=>point(u,1),'#363b3d');
      }
    });
    positioned(r,'rear-window',alias,()=>{
      const p=(u,v)=>car.modern?[.886+.324*v+.027*(1-u*u),u*.456,.698+.034*v-.010*u*u]:
        [.803+.126*v,u*.425,.789+.011*u*u-.020*Math.sin(v*Math.PI)];
      for(let j=0;j<4;j++)for(let i=1;i<spans.length;i++){
        const a=spans[i-1],b=spans[i];
        glazingFace(r,[p(a,j/4),p(b,j/4),p(b,(j+1)/4),p(a,(j+1)/4)],'#8098a1',car.modern?.34:.29);
      }
      for(const s of [-1,1])r.rod(p(s*.96,0),p(s*.96,1),.007,trim,7);
    });
  }
  if(car.modern)positioned(r,'compartment-lid',alias,()=>{
    // The drawn exterior already includes this shut lid with the roof down.
    // With the roof up, its forward rim is tucked under the fabric sail.
    if(raised)drawPorscheCompartmentLid(r,paintChoice(r.build?.paint).hex);
    for(const s of [-1,1]){
      const hinge=[.900,s*.453,.826],ear=[.825,s*.486,.885];
      r.rod(hinge,ear,.007,iron,7);sleeve(r,hinge,y,-.014,.014,.012,.005,alloy,8);
    }
  });
  // These pivots remain on the body in both poses. Roof arms meet the ends of the
  // same bows used above; moving the roof never takes the drive mounting off the car.
  for(const s of [-1,1]){
    const a=mount(car,s),head=beam(0,s*.96),first=beam(1,s*.96),second=beam(2,s*.96),rear=beam(3,s*.96);
    const elbow=raised?mix(a,rear,.50):[a[0]+.125,a[1],a[2]+.055];
    positioned(r,'links',alias,()=>{
      r.rod(a,elbow,.011,iron,8);r.rod(elbow,rear,.011,alloy,8);
      r.rod(elbow,second,.009,iron,8);r.rod(second,first,.009,iron,8);r.rod(first,head,.009,iron,8);
      for(const end of [a,elbow,rear,second,first])cyl(r,end,y,-.006,.006,.013,alloy,8);
      if(raised){
        const edge=roofPoint(rows[7],s*.68),arm=roofPoint(rows[4],s*.68);
        r.rod(rear,[arm[0],arm[1],arm[2]-.022],.008,iron,7);
        r.rod(elbow,[edge[0],edge[1],edge[2]-.018],.009,iron,7);
      }
    });
    positioned(r,'drive',alias,()=>{
      if(car.modern){
        const aft=[.890,s*.620,.705],rodEnd=mix(a,elbow,.78),guide=mix(aft,rodEnd,.60);
        r.rod(aft,guide,.016,iron,10);r.rod(guide,rodEnd,.007,alloy,8);
        for(const p of [aft,rodEnd])sleeve(r,p,y,-.009,.009,.014,.006,alloy,8);
      }else{
        // One center drive motor and two flexible shafts from model year 1996.
        // The left and right planetary transmissions are fixed at the main hinge.
        cyl(r,a,y,-.016,.016,.034,iron,12);
        const pickup=[a[0]+.019,s*.557,a[2]-.012],guide=[.794,s*.445,.711],socket=[.797,s*.097,.714];
        r.rod(socket,guide,.006,trim,7);r.rod(guide,pickup,.006,trim,7);
        if(s===-1){
          const c=[.797,0,.714];
          cyl(r,c,y,-.090,.090,.030,iron,12);
          for(const k of [-1,1])cyl(r,c,y,k*.088,k*.104,.017,alloy,10);
        }
      }
    });
  }
}
export function drawPorscheInstalledRoof(r,vehicle){
  const modern=vehicle==='porsche992scab';
  if(!modern&&vehicle!=='porsche993cab')return;
  const cabin=r.inspection?.assembly==='cabin';
  if(!cabin){
    for(const face of r.faces)if(face.part==='cabin.top')face.part=face.roofServicePart||'roof.fabric';
  }
  roofFrame(r,coupeShape[modern?1:0],r.build?.roofPosition==='up',cabin);
}
