import {part,study,tint} from './mechanism-shapes.js';

export const bonnetPlate={
  label:'Mercedes-Benz Classic USA · 2002 G500 hood, plate 39',
  url:'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/body--hood-and-components'
};
// P00.10-2351-50 (long G500), p.25, rasterized at 1132 × 1600. Side
// station, crown and hem elevation, then the plan's inner crease, shoulder
// and outer edge. Both plates use a 423 px wheelbase; plan center is v=1097.
// The 2002 and 2006 US catalogs both list outer panel A 463 880 07 57.
const stations=[
  [218,710,715,1059,1035,1029],[222,706.5,715,1059,1033,1026],
  [230,702,715,1059,1030,1024],[248,698.5,714,1056,1026,1019],
  [280,694.5,712,1050,1018,1010],[310,692.5,709,1045,1010,1002],
  [345,690.5,706.5,1038,1001,992],[368,689,704,1034,995,986],
  [391,688,702,1030,989,980],[397,687.5,701,1029,988,979],
  [404,688.5,701,1029,988,984]
];
const scale=2.85/423, center=1097;
// Vertical registration uses the top of the fitted US grille as the front
// mounting datum, retaining the measured rise and transverse section depths.
const xFromU=u=>-1.425+(u-310)*scale;
const zFromV=v=>1.231+(710-v)*scale;
const halfWidth=v=>(center-v)*scale;
const grilleHalf=.282;
const hemThickness=.008;

function silhouette(row){
  const [u,crown,hem,crease,shoulder,edge]=stations[row];
  const x=xFromU(u),top=zFromV(crown),bottom=zFromV(hem),fall=top-bottom;
  return [[x,0,top],[x,halfWidth(crease),top-.003],[x,halfWidth(shoulder),top-.32*fall],
    [x,halfWidth(edge),bottom]];
}
function strip(r,a,b,c,d,color){r.polygon([a,b,c,d],color,false);}
function section(r,a,b,side,col){
  for(let i=0;i<a.length-1;i++){
    const p=(q,k)=>[q[k][0],q[k][1]*side,q[k][2]];
    strip(r,p(a,i),p(b,i),p(b,i+1),p(a,i+1),col[i]);
  }
}
function skin(r,paint){
  const colors=[tint(paint,1.05),tint(paint,1.015),tint(paint,.92)];
  const lower=p=>[p[0],p[1],p[2]-hemThickness];
  for(let row=1;row<stations.length;row++)for(const side of [-1,1]){
    const a=silhouette(row-1),b=silhouette(row);
    if(stations[row][0]===391){
      // The removable grille spans this stamped opening, not a painted face.
      for(const q of [a,b])q[0]=[q[0][0],grilleHalf,q[0][2]-.002];
    }
    section(r,a,b,side,colors);
    section(r,a.map(lower),b.map(lower),side,colors.map(c=>tint(c,.70)));
    const point=(q,i)=>[q[i][0],q[i][1]*side,q[i][2]];
    const e=point(a,3),f=point(b,3);
    strip(r,e,f,lower(f),lower(e),tint(paint,.66));
    for(const [q,end] of [[a,row===1],[b,row===stations.length-1]]){
      if(end)for(let i=0;i<3;i++){
        const p=point(q,i),n=point(q,i+1);
        strip(r,p,n,lower(n),lower(p),tint(paint,.75));
      }
    }
  }
}
function centerPlane(u){
  for(let i=1;i<stations.length;i++){
    const a=stations[i-1],b=stations[i];
    if(u<=b[0])return zFromV(a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]));
  }
  return zFromV(stations.at(-1)[1]);
}
function ventSurface(r,u0,u1,y0,y1,height,color){
  const at=(u,y)=>[xFromU(u),y,centerPlane(u)-.002+height];
  strip(r,at(u0,y0),at(u1,y0),at(u1,y1),at(u0,y1),color);
}
function grille(r){
  for(const y of [-grilleHalf,grilleHalf])ventSurface(r,367.9,391.1,y-.0038,y+.0038,.003,'#69716e');
  for(const u of [368,391])ventSurface(r,u-.50,u+.50,-grilleHalf,grilleHalf,.003,'#69716e');
  for(let i=-10;i<=10;i++){
    const y=i*.026;
    ventSurface(r,368.4,390.6,y-.003,y+.003,.0035,'#596360');
    ventSurface(r,368.4,390.6,y+.003,y+.006,-.001,'#3d4646');
  }
  ventSurface(r,369,389,-.014,.014,.006,'#5d6663');
}
function ventSeal(r){
  for(const y of [-grilleHalf,grilleHalf])ventSurface(r,367.5,391.5,y-.009,y+.009,.001,'#343c39');
  for(const u of [368,391])ventSurface(r,u-1.1,u+1.1,-grilleHalf,grilleHalf,.001,'#343c39');
}
function lining(r){
  // The EPC shows a single pad with notches. Its exact cut line, texture and
  // fastener positions have no dimensional reference.
  for(let i=2;i<8;i++)for(const side of [-1,1]){
    const edge=row=>{const p=silhouette(row);return [p[0][0],side*p[2][1]*.86,p[2][2]-.026];};
    const mid=row=>{const p=silhouette(row)[0];return [p[0],0,p[2]-.029];};
    strip(r,mid(i-1),mid(i),edge(i),edge(i-1),i%2?'#555851':'#575a53');
  }
}
function braces(r){
  for(let i=2;i<stations.length;i++)for(const side of [-1,1]){
    const edge=(row,delta,height)=>{
      const p=silhouette(row)[2];return [p[0],side*(p[1]*.94+delta),p[2]-.012+height];
    };
    for(const [dy,dz,dy2,dz2] of [[-.012,0,-.006,-.01],[-.006,-.01,.007,-.01],[.007,-.01,.013,0]])
      strip(r,edge(i-1,dy,dz),edge(i,dy,dz),edge(i,dy2,dz2),edge(i-1,dy2,dz2),'#768079');
  }
}
function badge(r){
  const x=xFromU(230),z=centerPlane(230)+.001;
  r.rod([x,0,z],[x,0,z+.002],.021,'#a8b1ac',20);
  r.rod([x,0,z+.002],[x,0,z+.003],.0165,'#455663',20);
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3;
    r.polygon([[x,0,z+.0035],[x+.013*Math.cos(a),.013*Math.sin(a),z+.0035],
      [x+.003*Math.cos(a+.8),.003*Math.sin(a+.8),z+.0035]],'#c3cac4',false);
  }
}
function upperCatch(r){
  const x=xFromU(223),z=centerPlane(223)-.012;
  r.box(x-.014,-.04,z-.009,x+.027,.04,z,'#697273');
  r.rod([x+.008,0,z-.068],[x+.008,0,z-.009],.007,'#8e9999',12);
  r.rod([x+.008,0,z-.075],[x+.008,0,z-.066],.012,'#757f80',12);
}
const pieces=[
  ['skin','Stamped hood','Two creases on either side fan out toward the windshield. The rear opening receives the vent grille.',[0,0,.28],skin],
  ['lining','Hood insulation pad','The pad sits below the pressing and ends ahead of the vent. Its cut line is approximate.',[0,0,-.34],lining],
  ['braces','Hood panel braces','The catalog lists stiffeners under the hood. Their sections and mounting points are illustrative.',[0,-.28,-.15],braces],
  ['vent','Vent grille','The removable grille sits across the rear of the hood. Open slots separate its slats.',[.18,0,.22],grille],
  ['seal','Vent grille seal','The seal follows the rim of the vent opening beneath the grille.',[.26,.12,.04],ventSeal],
  ['emblem','Hood emblem','A small round badge sits on the nose between the two inner creases.',[-.28,0,.2],badge],
  ['catch','Hood latch pin','The spring-loaded upper catch meets the latch at the front of the car. Pin and bracket dimensions are schematic.',[-.32,0,-.20],upperCatch]
];
export function drawG500Bonnet(r,paint){for(const entry of pieces)entry[4](r,paint);}

export function drawG500FrontDeck(r,paint,side){
  // Fixed fender tops continue outboard of the tapered moving panel. No
  // broad face lies beneath the bonnet when it is moved or isolated.
  for(let i=1;i<stations.length;i++){
    const points=row=>{
      const [x,edge,z]=silhouette(row)[3];
      return [[x,side*(edge+.004),z-.007],[x,side*.887,1.239]];
    };
    const [a,b]=points(i-1),[c,d]=points(i);
    strip(r,a,c,d,b,tint(paint,1.015));
  }
  const front=silhouette(0)[3],rear=silhouette(stations.length-1)[3];
  // The fixed nose follows the bonnet's rounded forward lip across its
  // full width. The shut line remains visible without a gap into the bay.
  const nose=silhouette(0).map(([x,y,z])=>[x-.003,y,z-.010]);
  nose.push([front[0]-.003,.887,1.239]);
  const panel=nose.map(([,y])=>[-2.119,y,1.228+.011*(y/.887)]);
  section(r,panel,nose,side,[paint,paint,paint,paint]);
  strip(r,[rear[0],side*(rear[1]+.004),rear[2]-.007],[rear[0],side*.887,1.239],[-.754,side*.887,1.239],[-.754,side*.844,1.263],paint);
}
export function drawG500Scuttle(r,paint){
  const profile=silhouette(stations.length-1);
  for(const side of [-1,1]){
    const lip=profile.map(([x,y,z])=>[x+.004,y,z-.008]);
    const cowl=profile.map(([,y])=>[-.751,y,1.354-.083*(y/.84)**2]);
    section(r,lip,cowl,side,[paint,paint,paint]);
  }
}
const studyParts=pieces.map(([id,name,text,offset,draw])=>part(id,name,text,offset,r=>{
  const centered=Object.create(r);
  centered.polygon=(points,color,stroke)=>r.polygon(points.map(([x,y,z])=>[x+1.45,y,z-1.19]),color,stroke);
  draw(centered,'#879993');
}));
export const g500BonnetStudy=study('g500-bonnet','G500 hood and vent',
  'The outer panel carries the grille, seal and emblem. The 2002 catalog identifies the insulation, stiffeners and latch below. Their cross sections are approximate.',
  bonnetPlate,studyParts);
g500BonnetStudy.viewAngle=[-.55,.64];
