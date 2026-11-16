// Section coordinates use each vehicle's floor height and extent in the shared road model.
import {section,part,slab,source} from './section-primitives.js';

const profiles={
 g500:{front:-.85,rear:1.28,width:.75,height:.64,tunnel:.16,rise:.16,rows:2,description:'The high, nearly rectangular W463 floor places a footwell on either side of the central tunnel. The section runs from the toe boards to the rear seat.',ref:source('Mercedes-Benz · G500 floor mats','https://mbparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/instrument-panel-center-console-linings--floor-mats')},
 bmw325ci:{front:-.90,rear:1.22,width:.72,height:.35,tunnel:.15,rise:.24,rows:2,description:'The E46 coupe has deep front footwells beside a high transmission tunnel. The front floor covering follows the change of height ahead of the rear seats.',ref:source('BMW ETK via RealOEM · 2003 325Ci floor covering','https://www.realoem.com/bmw/enUS/showparts?diagId=91_0221&id=BN33-USA-03-2003-E46-BMW-325Ci')},
 f350:{front:-1.17,rear:.12,width:.80,height:.59,tunnel:.30,rise:.26,rows:1,description:'This regular cab has one seating row and a wide, short floor. Ford offered different tunnel heights. This estimated contour rises over the E4OD automatic.',ref:source('LMC Truck · regular-cab carpet and floor hump variants','https://www.lmctruck.com/interior%2Fcarpet-insulation%2Ffd-1980-96-molded-carpet')},
 c63:{front:-.94,rear:1.26,width:.75,height:.35,tunnel:.17,rise:.23,rows:2,description:'The W204 sedan floor rises over the longitudinal driveline. Two front seat mounts sit between the tunnel and the sill on each side.',ref:source('Mercedes-Benz · W204 floor and seat crossmember','https://classicparts.mbusa.com/v-2013-mercedes-benz-c63-amg--base--6-3l-v8-gas/body--floor')},
 hrv:{front:-.92,rear:1.47,width:.77,height:.48,tunnel:.15,rise:.083,rows:2,description:'The HR-V parts diagram lists the fitted floor carpet, separate mats, holders and grommets. The back of each front footwell runs under a seat.',ref:source('Honda parts diagram · 2026 HR-V floor carpet and mat holders','https://www.hondapartsnow.com/parts-list/2026-honda-hr_v--5_door_lx_awd-cvt/interior_bumper/floor_mat.html')},
 porsche993cab:{front:-.96,rear:.96,width:.70,height:.400,seatWidth:.336,carpet:'#796e60',mat:'#958774',tunnel:.12,rise:.14,rows:2,description:'The short 993 footwells flank a narrow tunnel. Behind the front buckets, separate carpet pieces follow the raised rear seat wells and the lower back wall.',ref:source('Porsche Classic · 993 parts catalogue, group 807','https://assets-v2.porsche.com/us/-/media/Project/PCOM/SharedSite/PorscheClassic/Original-Parts-Catalogue/PDF-EN-US/KAT517_USA_911_98_KATALOG')},
 porsche992scab:{front:-1.02,rear:1.09,width:.77,height:.400,seatWidth:.356,carpet:'#42423f',mat:'#515048',tunnel:.20,rise:.19,rows:2,description:'The 992.1 Cabriolet has a wide center console above the tunnel and short rear footwells. The Cabriolet trim diagram identifies the floor lining and shaped foam pieces.',ref:source('Porsche parts diagram 807-110 · 992.1 Cabriolet','https://www.pitp.club/diagrams/d/50852/0')},
};

function surface(p,u,v,extra){
 const x=p.front+u*(p.rear-p.front),y=v*p.width;
 const crest=Math.max(0,1-(Math.abs(y)/p.tunnel)**3);
 const kick=Math.max(0,1-u/.18),step=p.rows===2?Math.max(0,(u-.82)/.18):0;
 const sill=Math.max(0,(Math.abs(v)-.90)/.1),end=1-.15*kick-.055*step;
 return [x,y*end,p.height+p.rise*crest+.13*kick*kick+.095*step*step+.044*sill*sill+extra];
}
function clothFacet(r,points,color){
 const a=points[0],u=points[1].map((v,i)=>v-a[i]),v=points[2].map((n,i)=>n-a[i]);
 const nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];
 const l=Math.hypot(nx,ny,nz)||1,light=.83+.21*Math.abs(nz/l)+.11*ny/l-.06*nx/l;
 const tone='#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(color.slice(i,i+2),16)*light)).toString(16).padStart(2,'0')).join('');
 r.polygon(points,tone,false);
}
const carpetColor='#505251',tealMetal='#687a7e',edge='#757570';

function contoured(r,p,u0,u1,v0,v1,lift,color){
 const us=Array.from(new Set([u0,u1,...[.06,.13,.18,.34,.55,.75,.82,.90].filter(u=>u>u0&&u<u1)])).sort((a,b)=>a-b);
 const spans=[-.95,-.9,-.42,-.30,-.25,-.20,-.16,-.1,0,.1,.16,.20,.25,.30,.42,.9,.95];
 const vs=[v0,...spans.filter(v=>v>v0&&v<v1),v1];
 for(let i=1;i<us.length;i++)for(let j=1;j<vs.length;j++){
   const corners=[[us[i-1],vs[j-1]],[us[i],vs[j-1]],[us[i],vs[j]],[us[i-1],vs[j]]];
   const points=corners.map(([u,v])=>surface(p,u,v,lift));
   clothFacet(r,[points[0],points[1],points[2]],color);clothFacet(r,[points[0],points[2],points[3]],color);
 }
}
function seam(r,p,points,lift,diam,color){
 for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];
   const n=Math.ceil(Math.max(Math.abs(b[0]-a[0])*18,Math.abs(b[1]-a[1])*20));
   let last=surface(p,...a,lift);
   for(let k=1;k<=n;k++){
     const pos=surface(p,a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,lift);
     r.rod(last,pos,diam,color,6);last=pos;
   }
 }
}
function mats(r,p,s){
 const uv=[[.075,s*.37],[.078,s*.68],[.13,s*.84],[.34,s*.88],[.458,s*.79],[.47,s*.35],[.27,s*.31]];
 const center=[.27,s*.59];
 for(let i=0;i<uv.length;i++){
   const a=uv[i],b=uv[(i+1)%uv.length];
   r.polygon([surface(p,...center,.029),surface(p,...a,.029),surface(p,...b,.029)],p.mat||'#484844',false);
 }
 seam(r,p,[...uv,uv[0]],.031,.005,edge);
 if(s===-1){
   for(let i=0;i<10;i++){
     const u=.19+i*.009;
     seam(r,p,[[u,-.72],[u,-.49]],.035,.0035,'#656560');
   }
 }
}
function floorPieces(p){
 const pieces=[
   part('pan','Pressed floor pan','The steel floor changes height at the toe board, along the sill and over the central tunnel.',[0,0,-.49],r=>{
    contoured(r,p,0,1,-1,1,-.045,tealMetal);
    for(const side of [-1,1])for(const v of [.44,.56,.68])seam(r,p,[[.20,v*side],[.76,v*side]],-.040,.009,'#7d8d8e');
   }),
   part('underlay','Shaped underlay','The pad follows the floor beneath the carpet. The cut edges are enlarged to show where the layers meet.',[0,0,-.23],r=>{
    for(const s of [-1,1])contoured(r,p,.035,.97,s<0?-.965:.04,s<0?-.04:.965,-.018,'#9d947f');
   }),
   part('carpet','Fitted floor carpet','The fitted covering turns up the toe boards and follows the tunnel. Open it to see the layered edge of the material.',[0,0,.26],r=>{
    contoured(r,p,.005,.993,-.987,.987,.003,p.carpet||carpetColor);
    for(const s of [-1,1]){
     seam(r,p,[[.02,s*.985],[.33,s*.985],[.78,s*.985],[.98,s*.985]],.006,.005,edge);
     seam(r,p,[[.02,s*.35],[.15,s*.31],[.64,s*.30],[.92,s*.36]],.009,.0028,'#757772');
    }
   }),
   part('mat-left','Driver’s removable mat','The shaped toe end follows the left footwell. The contrasting heel area shows where the driver’s shoe rests.',[-.04,-.46,.20],r=>mats(r,p,-1)),
   part('mat-right','Passenger’s removable mat','The front passenger mat fits the opposite footwell and lifts independently of the fitted carpet.',[-.04,.46,.20],r=>mats(r,p,1)),
   part('sills','Sill finishers','The edge of the carpet slips beneath the finishers at the door openings.',[0,.65,.08],r=>{
    for(const s of [-1,1]){seam(r,p,[[.15,s*.978],[.90,s*.978]],.025,.018,'#555e5e');seam(r,p,[[.18,s*.961],[.88,s*.961]],.033,.004,'#98a1a1');}
   }),
   part('tracks','Front seat tracks','Two parallel runners under each front seating position connect the seat and the floor. Open the rail to see how the two channels slide.',[0,0,.62],r=>{
    const rails=p.seatWidth?[(p.seatWidth-.135)/p.width,(p.seatWidth+.135)/p.width]:[.39,.82];
    for(const s of [-1,1])for(const v of rails){
      const [x,y,z]=surface(p,.53,v*s,.025),l=(p.rear-p.front)*.22;
      r.box(x-l/2,y-.019,z,x+l/2,y+.019,z+.019,'#82918e');
      for(const k of [-1,1])r.box(x-l/2,y+k*.018-.003,z+.006,x+l/2,y+k*.018+.003,z+.029,'#566366');
    }
   })
 ];
 if(p.rows===2)pieces.push(part('rear-lining','Rear footwell edging','The rear edge of the floor covering turns upward at the seat base. The transverse seam follows the contour of the tunnel.',[.34,0,.16],r=>{
    contoured(r,p,.90,1,-.89,.89,.013,'#575a58');seam(r,p,[[.90,-.89],[.90,.89]],.017,.004,edge);
 }));
 return pieces;
}
const floors=new Map(),details=new Map();
export function getCabinFloor(vehicle){
 const p=profiles[vehicle];if(!p)return null;
 if(!floors.has(vehicle)){
  const study=section('floor','Carpets, footwells & seat tracks',p.description,p.ref,floorPieces(p));
  study.viewAngle=[-.57,.83];
  const group={...study.groups[0],viewAngle:study.viewAngle,id:'floor',internal:true,view:'hero',category:'exterior',source:p.ref,description:p.description};
  floors.set(vehicle,{group,study});
 }
 return floors.get(vehicle).group;
}
export function drawCabinFloor(r,vehicle){
 if(getCabinFloor(vehicle))floors.get(vehicle).study.draw(r);
}
function materialStudy(p){
 return section('carpet-edge','Carpet edge and backing','A section through the material shows the pile, its support and a finished edge. Layer thickness and individual tufts are enlarged for inspection.',p.ref,[
  part('pile','Carpet pile','Dense rows of fibers form the wearing surface. The enlarged section shows a small strip at the cut edge.',[0,0,.29],r=>{
   slab(r,0,0,.44,1.02,.74,.042,'#545954',.045);
   for(let row=0;row<7;row++)for(let col=0;col<18;col++){
    const x=-.46+col*.053,y=-.28+row*.085,z=.49+.012*Math.sin(row+col);
    r.rod([x-.017,y,.469],[x,y+.007,z+.035],.009,'#85847a',5);r.rod([x,y+.007,z+.035],[x+.017,y,.473],.009,'#716e65',5);
   }
  }),
  part('backing','Backing','This layer supports the pile and holds the shape of the covering.',[0,0,.11],r=>slab(r,0,0,.392,1.02,.74,.043,'#827968',.045)),
  part('pad','Underlay sample','The shaped pad sits between the fitted covering and the floor pan.',[0,0,-.22],r=>slab(r,0,0,.31,.96,.7,.079,'#a6a08e',.04)),
  part('binding','Bound edge and stitch line','Binding folds around the exposed edge. The stitching holds the binding against the face and back.',[0,-.34,.06],r=>{
    r.box(-.47,-.391,.396,.47,-.359,.478,'#6c665c');
    for(let i=0;i<22;i++){const x=-.46+i*.043;r.rod([x,-.381,.48],[x+.024,-.378,.48],.0038,'#b6ad96',6);}
  })
 ]);
}
function railStudy(p){
 const rail=section('seat-track','Sliding seat track','The fixed and moving channels nest around one another. Follow the two rails through a short length of fore-and-aft travel. The channel section is representative.',p.ref,[
  part('anchor','Floor mounting feet','Steel feet spread the load where the lower channel meets the floor.',[0,0,-.28],r=>{for(const x of [-.56,.56])slab(r,x,0,.12,.26,.38,.038,'#77878b');}),
  part('fixed','Fixed lower channel','Folded lips guide the upper rail along the floor-mounted channel.',[0,-.32,0],r=>{r.box(-.68,-.12,.16,.68,.12,.19,'#62757d');for(const s of [-1,1]){r.box(-.68,s*.102-.015,.18,.68,s*.102+.015,.29,'#8b9a99');r.box(-.68,s*.084-.023,.275,.68,s*.084+.023,.300,'#aeb8b0');}}),
  part('slider','Sliding upper rail','The upper channel carries the seat. Its flanges remain captured within the lower rails as it moves.',[0,.32,.17],(r,phase)=>{const dx=.24*Math.sin(phase*Math.PI*2);r.box(dx-.45,-.057,.224,dx+.45,.057,.362,'#909b9a');r.box(dx-.45,-.087,.202,dx+.45,.087,.226,'#9caaa7');}),
  part('brackets','Seat mounting brackets','The seat attachment points travel with the upper channel.',[0,0,.42],(r,phase)=>{const dx=.24*Math.sin(phase*Math.PI*2);for(const x of [-.32,.32])slab(r,x+dx,0,.364,.18,.25,.036,'#596c74');})
 ]);
 return {...rail,animated:true,motionDescription:'Watch the upper channel and its two brackets travel together inside the fixed lower channel.'};
}
export function getFloorDetail(vehicle,id){
 const p=profiles[vehicle];if(!p)return null;
 if(id==='cabin.carpet'&&vehicle.startsWith('porsche')){getCabinFloor(vehicle);return floors.get(vehicle).study;}
 if(!['floor.carpet','floor.mat-left','floor.mat-right','floor.tracks'].includes(id))return null;
 const key=vehicle+'/'+(id==='floor.tracks'?'rail':'lining');
 if(!details.has(key))details.set(key,id==='floor.tracks'?railStudy(p):materialStudy(p));
 return details.get(key);
}
