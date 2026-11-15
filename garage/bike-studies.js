import {TAU,part,study,turn,cyl,sleeve,steel,metal,dark,gold,y,z} from './mechanism-shapes.js';
import {bikeChainState,drawSprocket,drawLinks} from './bike-chain.js';
import {k67FairingStudy} from './k67-fairings.js';

const driveSource={label:'BMW Motorrad · 2023 US S 1000 RR rider’s manual',url:'https://manuals.bmw-motorrad.com/manuals/BA-Extern/IN/BA-INTERNET-COM/PDF/S_0E63_RM_0423_07.pdf'};
const chainSource={label:'RK Japan · sealed roller chain cutaway',url:'https://www.maxmcparts.eu/uploads/pics/Katalog-PDF/Kaeder-kaedehjul-remme-ruller/RK-JT-kaedekit-2014-W.pdf'};
const carrierSource={label:'BMW Motorrad · K67 rear-wheel judder damper',url:'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200259-9999.pdf'};
const seatSource={label:'BMW Motorrad · S 1000 RR rider’s seat mounting',url:'https://manuals.bmw-motorrad.com/manuals/BA-Extern/IN/BA-INTERNET-COM/PDF/S_0E63_RM_0423_07.pdf#page=80'};
const frame=(s,ang)=>Object.assign(s,{viewAngle:ang});
const center=[0,0,0];
const transmission=frame(study('k67-final','Chain and sprockets','The 2023 US RR turns a 46-tooth rear sprocket with a 17-tooth gearbox sprocket. The 525 chain has 122 links. Follow the two runs around the wheel, then open the chain or the rear sprocket.',driveSource,[
  part('input','17-tooth gearbox sprocket','The transmission output shaft drives the smaller sprocket. A tooth enters the space between two rollers as the chain wraps around it.',[-.50,-.22,.25],(r,t)=>drawSprocket(r,'front',bikeChainState(t))),
  part('chain','Sealed 525 chain','The pins join alternating inner and outer links. The rollers turn against the sprocket teeth. Open a pair of links to see which surfaces move.',[0,-.45,.45],(r,t)=>drawLinks(r,bikeChainState(t))),
  part('rear','46-tooth rear sprocket','The rear sprocket bolts to a carrier. Open it to see how the carrier engages the wheel through rubber dampers.',[.56,.24,-.22],(r,t)=>drawSprocket(r,'rear',bikeChainState(t)))
],'One turn of the wheel takes 46 links past a fixed point. In the same time the gearbox sprocket turns 46/17 revolutions.'),[-.23,.24]);

function plate(r,left,right,at,bore,outer,color){
  // Two bored ends joined by tangent strips. Each respective half ring faces outward.
  for(const [cx,direction] of [[left,-1],[right,1]]){
    turn(r,[cx,at,0],y,[[-.028,bore],[-.028,outer],[.028,outer],[.028,bore],[-.028,bore]],color,{n:24});
    const edge=cx+direction*(-outer*.14);
    for(const side of [-1,1]){
      const end=cx+direction*(-outer*1.20),p=[[edge,side*outer*.97],[end,side*outer*.7],[end,0],[cx-direction*(outer*.93),0]];
      r.profile(p,at-.027,at+.027,color);
    }
  }
  const a=left+outer*1.13,b=right-outer*1.13;
  r.profile([[a,.70*outer],[b,.70*outer],[b,-.70*outer],[a,-.70*outer]],at-.026,at+.026,color);
}
const links=frame(study('k67-links','Two sealed chain links','One outer link overlaps the adjacent inner link at their shared pin. The inner plates carry the bush. The outer plates carry the pin. The roller turns around the bush under the sprocket tooth.',chainSource,[
  part('outer','Riveted outer plates','The outer plates fix the spacing of two pins. Their ends sit outside the sealing rings.',[0,-.62,.24],r=>{for(const s of [-1,1])plate(r,-.80,0,s*.349,.060,.154,steel);}),
  part('inner','Bushed inner plates','The ends of the bushes fit tightly into the inner plates. The two plates move together as the chain bends.',[.54,.54,.23],r=>{for(const s of [-1,1])plate(r,0,.80,s*.232,.091,.154,gold);}),
  part('pins','Riveted pins','Each pin passes through the neighboring link’s bush. Its enlarged ends secure it to the outer plates.',[-.60,0,-.31],r=>{for(const xx of [-.80,0]){cyl(r,[xx,0,0],y,-.39,.39,.058,metal);for(const s of [-1,1])cyl(r,[xx,0,0],y,s*.377,s*.395,.076,metal);}}),
  part('bush','Hollow bushes','Each bush fits around its pin. The lubricated pin-to-bush interface lets the chain articulate.',[.22,.72,-.18],r=>{for(const xx of [0,.80])sleeve(r,[xx,0,0],y,-.270,.270,.089,.061,metal);}),
  part('roller','Free rollers','The roller turns on the outside of its bush as a tooth loads and unloads it.',[.27,-.44,-.60],r=>{for(const xx of [0,.80])sleeve(r,[xx,0,0],y,-.195,.195,.132,.091,steel);}),
  part('seals','Grease seals','A seal sits between each inner and outer plate. It retains grease at the pin and bush. The ring profile shown is representative.',[0,.25,.67],r=>{for(const s of [-1,1])turn(r,[0,s*.293,0],y,[[-.023,.066],[-.022,.091],[0,.104],[.022,.091],[.023,.066],[0,.054],[-.023,.066]],dark);})
]),[-.43,.39]);

function wedge(r,ri,ro,a,b,y0,y1,color){
  const q=(t,rad,yy)=>[rad*Math.cos(t),yy,rad*Math.sin(t)];
  const ring=(yy)=>[q(a,ri,yy),q(a,ro,yy),q((a+b)/2,ro,yy),q(b,ro,yy),q(b,ri,yy),q((a+b)/2,ri,yy)];
  const f=ring(y0),g=ring(y1);
  r.polygon(f,color,false);r.polygon(g,color,false);
  for(let i=0;i<f.length;i++)r.polygon([f[i],f[(i+1)%f.length],g[(i+1)%f.length],g[i]],color,false);
}
const castStudy=frame(study('k67-carrier','Rear sprocket carrier and wheel hub','Chain pull reaches the rim through the sprocket carrier and rubber judder damper. The carrier and hub separate along the axle. The cutaway shows a representative pocket and lug profile.',carrierSource,[
  part('sprocket','Rear sprocket','The teeth engage the chain. A ring of fasteners transfers torque into the removable carrier.',[0,-.91,.09],r=>{
    const st=bikeChainState(0),start=r.faces.length;drawSprocket(r,'rear',st);
    for(let j=start;j<r.faces.length;j++)r.faces[j].points=r.faces[j].points.map(([x,yy,z])=>[(x-st.rear)*2.1,yy*2.1-.30,z*2.1]);
  }),
  part('carrier','Carrier and driving lugs','The plate carries the sprocket. Lugs on the back of the carrier bear on the rubber in the wheel casting.',[-.52,-.43,.10],r=>{
    sleeve(r,center,y,-.245,-.16,.37,.158,'#77858a');
    for(let i=0;i<5;i++){const a=i*TAU/5;wedge(r,.24,.46,a-.11,a+.11,-.21,.12,steel);}
  }),
  part('damper','Rubber judder damper','The blocks compress slightly under a sudden change in torque. Their two working faces cushion the transition between driving and coasting.',[.60,.34,.58],r=>{
    for(let i=0;i<5;i++){const a=i*TAU/5;
      for(const s of [-1,1])wedge(r,.236,.466,a+s*.31-.18,a+s*.31+.18,-.08,.155,'#404b4c');}
  }),
  part('hub','Wheel hub pockets','Cast ribs face the carrier lugs from the far side of the damper. The central bore aligns the wheel with the axle.',[0,.77,-.18],r=>{
    turn(r,center,y,[[.162,.142],[.162,.515],[.268,.515],[.268,.142],[.162,.142]],steel,{start:.065,sweep:TAU*.60,n:28});
    for(let i=0;i<5;i++){const a=TAU*(i+.5)/5;wedge(r,.230,.475,a-.121,a+.121,-.055,.16,steel);}
  }),
  part('bearing','Carrier bearing and spacer','The carrier bearing locates the sprocket around the axle. A sleeve spaces the bearing from its neighbor.',[0,-.41,-.64],r=>{
    sleeve(r,center,y,-.233,-.097,.155,.092,metal);sleeve(r,center,y,-.247,.259,.09,.060,gold);
    sleeve(r,center,y,-.237,-.234,.146,.103,dark);
  })
]),[-.53,.34]);

// Longitudinal sections follow the low rider's pocket and the climb into the tail.
const saddleSections=[
  [-.88,.20,.11,-.003],[-.77,.27,.10,-.024],[-.54,.345,.074,-.057],[-.22,.435,.049,-.096],
  [.08,.455,.058,-.107],[.35,.44,.109,-.076],[.59,.39,.208,-.019],[.78,.32,.314,.088],[.84,.23,.328,.114]
];
function saddlePoint(i,v,lift){
  const [x,w,top,bottom]=saddleSections[i];
  const crown=top+(1-v*v)*.060;
  return [x,v*w,bottom+(crown-bottom)*lift];
}
function saddleLayer(r,lower,upper,color,edge,surface){
  const cross=12;
  const add=(a,b,c,d,paint)=>r.polygon([a,b,c,d],paint,false);
  for(let i=1;i<saddleSections.length;i++)for(let j=0;j<cross;j++){
    const v=-1+2*j/cross,w=v+2/cross;
    const a=saddlePoint(i-1,v,upper),b=saddlePoint(i,v,upper),c=saddlePoint(i,w,upper),d=saddlePoint(i-1,w,upper);
    add(a,b,c,d,surface);
    if(upper>1 && j===cross-1){
      const wrap=(station,t)=>{
        const p=saddlePoint(station,1,t);
        return [p[0],p[1]+.004,p[2]];
      };
      add(wrap(i-1,1.012),wrap(i,1.012),wrap(i,-.14),wrap(i-1,-.14),edge);
    }
    if(j===0)add(a,b,saddlePoint(i,v,lower),saddlePoint(i-1,v,lower),edge);
    if(j===cross-1)add(c,d,saddlePoint(i-1,w,lower),saddlePoint(i,w,lower),edge);
    if(i===1)add(a,d,saddlePoint(0,w,lower),saddlePoint(0,v,lower),edge);
    if(i===saddleSections.length-1)add(b,c,saddlePoint(i,w,lower),saddlePoint(i,v,lower),edge);
    add(saddlePoint(i-1,v,lower),saddlePoint(i,v,lower),saddlePoint(i,w,lower),saddlePoint(i-1,w,lower),color);
  }
}
const saddle=frame(study('k67-seat','Rider’s saddle','The saddle narrows beside the tank and rises behind the rider. A front fixing and rear screw retain the assembly. Separate the trim, cushion and pan to see the load path into the tail frame. The upholstery pattern and internal profile are illustrative.',seatSource,[
  part('cover','Upholstery cover','The shaped cover follows the upper cushion, then wraps around its sides to the base. The opening underneath leaves room for the seat fittings.',[0,0,.68],r=>saddleLayer(r,.966,1.016,'#373b3d','#494e4e','#414749')),
  part('seams','Side seams and stitching','The seams follow the change of slope between the upper panel and side panels. The spaced stitches show how two edges are joined on this representative cover.',[0,-.51,.84],r=>{
    for(const s of [-1,1])for(let i=1;i<saddleSections.length;i++){
      const a=saddlePoint(i-1,.85*s,1.027),b=saddlePoint(i,.85*s,1.027);
      const lerp=f=>a.map((v,j)=>v+(b[j]-v)*f);
      const count=Math.max(2,Math.round(Math.hypot(...b.map((v,j)=>v-a[j]))/.048));
      for(let k=0;k<count;k++)r.rod(lerp(k/count),lerp((k+.56)/count),.0046,'#a9ada8',5);
    }
  }),
  part('foam','Contoured foam cushion','The thicker rear bolster resists sliding back under acceleration. The shallow front and narrow nose leave room for the rider’s thighs.',[0,.46,.26],r=>saddleLayer(r,.181,.959,'#bd9867','#c7a979','#dbc398')),
  part('pan','Molded seat pan','The rigid pan distributes the rider’s load through its supports. Molded ribs stiffen the underside around the front mount and rear lug.',[0,0,-.54],r=>{
    saddleLayer(r,-.16,.166,dark,'#525d60','#667176');
    for(const s of [-1,1])for(let i=1;i<saddleSections.length;i++)r.rod(saddlePoint(i-1,s*.54,-.22),saddlePoint(i,s*.54,-.22),.022,dark,6);
  }),
  part('front','Front locating tongue','The rider’s seat engages the frame at the front. This tongue and receiving lip illustrate the hooked connection under the tank end.',[-.61,0,-.16],r=>{
    r.box(-.96,-.092,-.074,-.69,.092,-.04,steel);r.box(-.981,-.098,-.09,-.937,.098,-.025,steel);
  }),
  part('lug','Rear lug and retaining screw','The rear screw passes through a lug under the upholstery. The seat lifts at the rear after the attachment is released.',[.58,0,-.24],r=>{
    r.box(.59,-.117,.050,.74,.117,.077,steel);sleeve(r,[.73,0,.085],z,-.009,.009,.09,.036,steel);
    cyl(r,[.73,0,.089],z,-.083,.044,.032,metal,14);cyl(r,[.73,0,.089],z,.045,.083,.055,metal,6);
  })
]),[-.60,.60]);

export function getBikeDetail(vehicle,partId){
  if(vehicle!=='bmws1000rr')return null;
  switch(partId){
    case 'drive.chain':
    case 'drivetrain.countershaft':
    case 'drivetrain.chain':return transmission;
    case 'k67-final.chain':return links;
    case 'drivetrain.rear-sprocket':
    case 'k67-final.rear':return castStudy;
    case 'body.seat':return saddle;
    case 'body.fairing':return k67FairingStudy;
    default:return null;
  }
}
