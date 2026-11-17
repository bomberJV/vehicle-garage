// 2003 BMW 325Ci (E46 pre-facelift coupé) exterior shell.
//
// The shared coachwork generator builds bodies from a few width/height stations
// and flat-shaded boxes, which leaves the E46 looking nothing like the car. This
// module lofts a smooth body instead: one plan-view outline wrapped around the
// car, a measured side section at every column (rocker tuck, the convex door
// face, the crisp shoulder line and the tumblehome to the hood and belt), crowned
// hood and deck caps, and a greenhouse surface that the glass and pillars share.
//
// Frame: x forward is negative and measured from the middle of the 2725-mm
// wheelbase (axles at x = ±1.3625); y left is negative; z is up, with the stock
// tyre contact at z = .040. Profile heights reuse the stations traced from the US
// owner's-manual elevation (bmw-e46-body.js). Shapes between those stations
// (section curvature, shoulder height, lamp outlines, bumper bands) follow the
// pre-facelift reference photographs listed in bmw-references.md; they are
// estimates, not factory surface data.
import {panel,deckPanel,tint} from './exterior-coachwork.js';
import {fittedWindow} from './exterior-trim.js';
import {glazingFace} from './surface-materials.js';
import {e46BodyProfile} from './bmw-e46-body.js';
import {drawBmwQuarterWindow} from './bmw-cabin-closures.js';

const {stations,frontWindow,quarter,roof,wind,rear,door}=e46BodyProfile;
const AXLE=1.3625,ARCH=.352,AXLE_Z=.356,DOOR_SILL=.344;
const NOSE=-2.168,TAIL=2.320;
const HOOD_END=-.892,DECK_START=1.82;
const BUMPER_TOP_F=.615,BUMPER_TOP_R=.640;
const BLACK='#1d2528',SEAL='#262e31',TRIM='#343c40',CHROME='#c3cbca',LINER='#3e4547';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const lerp=(p,q,t)=>p.map((v,i)=>mix(v,q[i],t));
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const unit=v=>{const l=Math.hypot(...v)||1;return v.map(q=>q/l);};
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};

// ---- Paint shading ---------------------------------------------------------
// Colours are baked per face. A key light from above the front quarter, a sky
// term for upward faces and a narrow clear-coat highlight make the curvature read.
const KEY=unit([-.32,-.40,.86]),HALF=unit([-.10,-.62,.78]);
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex=c=>'#'+c.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
export function paintShade(paint,n,gloss=1){
  const d=Math.max(0,dot(n,KEY)),sky=.5*(1+n[2]),h=Math.max(0,dot(n,HALF));
  const f=.60+.36*d+.20*sky,spec=gloss*(.30*h**40+.10*h**8);
  return hex(rgb(paint).map(v=>v*f+(255-v*f)*spec));
}
const normalOf=(pts,hint)=>{
  let n=unit(cross(sub(pts[1],pts[0]),sub(pts[pts.length-1],pts[0])));
  if(pts.length>3){const m=unit(cross(sub(pts[2],pts[0]),sub(pts[3],pts[1])));if(Math.hypot(...m)>.5)n=m;}
  return dot(n,hint)<0?n.map(v=>-v):n;
};
const face=(r,pts,color)=>r.polygon(pts,color,false);
const painted=(r,pts,paint,hint,gloss)=>face(r,pts,paintShade(paint,normalOf(pts,hint),gloss));

// ---- Smooth interpolation -------------------------------------------------
function catmull(points,samples=24){
  // Centripetal Catmull–Rom through 2-D points; returns a dense polyline.
  const out=[];
  for(let i=0;i<points.length-1;i++){
    const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
    for(let k=0;k<samples;k++){
      const t=k/samples,t2=t*t,t3=t2*t;
      out.push(p1.map((_,j)=>.5*(2*p1[j]+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)));
    }
  }
  out.push(points.at(-1).slice());
  return out;
}
function sampleX(poly,x,j=1){
  // Interpolate column j of a polyline that is monotonic in column 0.
  if(x<=poly[0][0])return poly[0][j];
  for(let i=1;i<poly.length;i++)if(x<=poly[i][0]){const a=poly[i-1],b=poly[i];return mix(a[j],b[j],(x-a[0])/((b[0]-a[0])||1));}
  return poly.at(-1)[j];
}
const plotted=pts=>{const dense=catmull(pts,16);return x=>sampleX(dense,x);};

// ---- Side elevation lines ---------------------------------------------------
const topLine=plotted(stations.map(([x,,z])=>[x,z]));
const widthLine=plotted(stations.map(([x,w])=>[x,w]));
// The character line runs from the top of the headlamp along the fender and doors
// to the top of the tail lamp, just above the door handle.
const shoulderGap=plotted([[-2.20,.012],[-2.064,.016],[-1.80,.024],[-1.36,.033],[-.90,.058],[-.40,.066],[.10,.068],[.60,.070],[1.00,.066],[1.36,.062],[1.627,.060],[1.82,.110],[1.961,.080],[2.088,.058],[2.216,.040],[2.32,.034]]);
const topInset=plotted([[-2.20,.040],[-1.36,.043],[-.95,.046],[-.75,.062],[.60,.071],[1.36,.068],[1.627,.064],[1.82,.048],[2.32,.044]]);
// Behind the rear wheels the bumper's lower edge sits level at about 25 cm
// and rises toward the tailpipes, as on the car.
const lowerHem=x=>x>1.700?.252+.040*clamp((x-1.700)/.516,0,1):.204+.077*Math.max(0,(-x-1.688)/.376);
const archTop=x=>{let z=-1;for(const a of [-AXLE,AXLE]){const t=Math.abs(x-a);if(t<ARCH)z=Math.max(z,AXLE_Z+Math.sqrt(ARCH*ARCH-t*t));}return z;};
// The centre-line profile of the nose and tail: bumper faces stand furthest out
// at mid height; the lamp band and the lid face sit back above them.
const noseProfile=plotted([[.26,.060],[.28,.050],[.32,.018],[.40,.004],[.50,0],[.56,.004],[.60,.018],[.615,.030],[.63,.052],[.70,.060],[.78,.080],[.81,.096]].map(([z,d])=>[z,d]));
const tailProfile=plotted([[.28,.040],[.30,.030],[.34,.010],[.42,.002],[.50,0],[.58,.006],[.62,.022],[.64,.040],[.66,.055],[.80,.062],[.92,.078],[.97,.096],[1.0,.12]].map(([z,d])=>[z,d]));

// ---- Plan outline ----------------------------------------------------------
// Front centre → front corner → body side (traced stations) → rear corner → rear
// centre, at the widest level of the body.
const OUTLINE=(()=>{
  const front=[[NOSE,0],[-2.160,.32],[-2.146,.52],[-2.116,.655],[-2.064,.747],[-1.986,.820],[-1.791,.856]];
  const side=stations.filter(([x])=>x>-1.7&&x<2.0).map(([x,w])=>[x,w]);
  const back=[[2.088,.806],[2.216,.762],[2.272,.705],[2.300,.600],[2.314,.40],[TAIL,0]];
  const dense=catmull([...front,...side,...back],28);
  // Running length for arc-length sampling at the ends.
  let s=0;return dense.map((p,i)=>{if(i)s+=Math.hypot(p[0]-dense[i-1][0],p[1]-dense[i-1][1]);return [...p,s];});
})();
const FRONT_JOIN=-1.70,REAR_JOIN=1.96;
function outlineAt(param){
  // param = running length along OUTLINE. Returns point and unit outward normal (plan).
  let i=1;while(i<OUTLINE.length-1&&OUTLINE[i][2]<param)i++;
  const a=OUTLINE[i-1],b=OUTLINE[i],t=clamp((param-a[2])/((b[2]-a[2])||1),0,1);
  const p=[mix(a[0],b[0],t),mix(a[1],b[1],t)],d=unit([b[0]-a[0],b[1]-a[1],0]);
  return {x:p[0],y:p[1],n:[-d[1],d[0]]};
}
const lengthAtX=x=>{for(let i=1;i<OUTLINE.length;i++)if(OUTLINE[i][0]>=x&&OUTLINE[i-1][0]<x){const a=OUTLINE[i-1],b=OUTLINE[i];return mix(a[2],b[2],(x-a[0])/(b[0]-a[0]));}return null;};

// ---- Section ---------------------------------------------------------------
// Inward offset from the widest outline at height z for a column whose bottom,
// shoulder and top heights are zb, zs, zt and whose top tucks in by inset.
function tuck(z,zb,zs,zt,inset){
  if(z<=zs){
    const roll=.11,belly=.60;
    if(z<zb+roll)return .050*(1-(z-zb)/roll)**2.2+.008;
    return z<belly?.008*((belly-z)/(belly-zb-roll))**2:.006*((z-belly)/Math.max(.05,zs-belly))**2;
  }
  // Above the shoulder the body leans in to the hood edge or the belt. The step in
  // slope at zs is what reads as the E46 character line.
  return .010+(inset-.010)*((z-zs)/Math.max(.01,zt-zs))**1.25;
}

// ---- Columns ---------------------------------------------------------------
// A column runs from the lower edge (sill hem, bumper lip or wheel arch) up to the
// top edge (hood shut line, belt or deck edge). Ends blend toward the nose and
// tail profiles; door columns bend into the slanted door seams.
const seamShift=(x,z)=>{
  const t=clamp((.875-z)/.531,0,1);
  return .032*t*t*Math.max(0,1-Math.abs(x-door[0])/.18)-.124*t*t*Math.max(0,1-Math.abs(x-door[1])/.255);
};
function makeColumns(){
  const cols=[];
  const total=OUTLINE.at(-1)[2],sF=lengthAtX(FRONT_JOIN),sR=lengthAtX(REAR_JOIN);
  for(let i=0;i<=46;i++)cols.push({s:sF*i/46,end:'front'});
  const xs=new Set();
  for(let x=FRONT_JOIN;x<REAR_JOIN;x+=.024)xs.add(+x.toFixed(5));
  for(const a of [-AXLE,AXLE])for(let i=0;i<=40;i++)xs.add(+(a+ARCH*Math.cos(i/40*Math.PI)).toFixed(5));
  for(const e of door)for(const d of [-.0025,.0025])xs.add(+(e+d).toFixed(5));
  for(const x of [HOOD_END,DECK_START,-1.715,1.7145,-1.70,1.72])xs.add(x);
  for(const x of [...xs].filter(x=>x>FRONT_JOIN&&x<REAR_JOIN).sort((a,b)=>a-b))cols.push({s:lengthAtX(x),x});
  for(let i=0;i<=46;i++)cols.push({s:sR+(total-sR)*i/46,end:'rear'});
  cols.sort((a,b)=>a.s-b.s);
  const out=[];
  for(const c of cols){
    if(out.length&&Math.abs(out.at(-1).s-c.s)<1e-5)continue;
    const o=outlineAt(c.s),x=c.x??o.x;
    // How far into the nose or tail this column sits (0 on the body side).
    const toNose=clamp((FRONT_JOIN-o.x)/(FRONT_JOIN-NOSE),0,1),toTail=clamp((o.x-REAR_JOIN)/(TAIL-REAR_JOIN),0,1);
    const e=Math.max(toNose,toTail);
    const front=o.x<0;
    let zb=lowerHem(o.x),zt,zs,inset;
    if(e>0){
      // Nose: bumper lip to the hood's leading edge. Tail: bumper base to the lid edge.
      // Start from the side values at this station so the ends join the body
      // sides without a step, then blend to the nose and tail centre values.
      const xs=front?Math.max(o.x,-2.064):Math.min(o.x,2.216);
      zt=front?mix(topLine(xs),.822,smooth(e)):mix(topLine(xs),.975,smooth(e)**2);
      zs=zt-mix(shoulderGap(xs),.012,smooth(e));
      zb=mix(lowerHem(xs),front?.281:.299,e);
      inset=mix(topInset(xs),.026,smooth(e));
    }else{
      zt=topLine(o.x);zs=zt-shoulderGap(o.x);inset=topInset(o.x);
    }
    const bottom=Math.max(zb,archTop(o.x));
    out.push({...c,x,px:o.x,py:o.y,n:o.n,e,front,zb,bottom,zs,zt,inset});
  }
  return out;
}
function columnPoint(c,z,side){
  // Point on the body skin of column c at height z.
  const t=tuck(z,c.zb,c.zs,c.zt,c.inset)*(1-.65*c.e);
  const recess=c.front?noseProfile(z):tailProfile(z);
  const along=c.e>0?recess*smooth(c.e)**1.4:0;
  const x=c.px-c.n[0]*t+(c.front?along:-along)+(c.e?0:seamShift(c.px,z));
  const y=c.py-c.n[1]*t;
  return [x,side*Math.max(0,y),z];
}

// Rows: lower body from the column's bottom edge to the shoulder, then the strip
// above the shoulder to the top edge. Absolute bands keep the rub strip, the
// door bottom and the bumper top on straight horizontal rows.
const LOWER=[0,.025,.06,.11,.17,.24,.32,.40,.48,.56,.64,.72,.80,.88,.94,.985,1];
const UPPER=[.18,.40,.62,.82,1];
function rowsFor(c){
  const zs=[];
  for(const h of LOWER)zs.push(mix(c.bottom,c.zs,h));
  for(const h of UPPER)zs.push(mix(c.zs,c.zt,h));
  for(const z of [DOOR_SILL,BUMPER_TOP_F,BUMPER_TOP_R,.575,.600])if(z>c.bottom+.004&&z<c.zs-.004)zs.push(z);
  return [...new Set(zs.map(z=>+z.toFixed(5)))].sort((a,b)=>a-b);
}

// ---- Which panel a skin facet belongs to -------------------------------------
function ownerOf(c,z,side){
  const x=c.px,word=side<0?'left':'right';
  if(c.end==='front'||(x<-1.70)){
    if(z<BUMPER_TOP_F)return 'front-bumper';
    return c.end==='front'&&c.e>.18?'nose':'fender-'+word;
  }
  if(c.end==='rear'||x>1.72){
    if(z<BUMPER_TOP_R)return 'rear-bumper';
    if(c.end==='rear'&&Math.abs(c.py)<.585)return 'lid';
    return 'quarter-'+word;
  }
  if(x>door[0]&&x<door[1])return z<DOOR_SILL?'sill':'door-'+word;
  return x<=door[0]?'fender-'+word:'quarter-'+word;
}
const MOUNTS={
  'fender-left':['front-fender-left',[0,0,0],'body.structure'],'fender-right':['front-fender-right',[0,0,0],'body.structure'],
  'door-left':['front-door-left',[-.12,-.58,.035],'body.door'],'door-right':['front-door-right',[-.12,.58,.035],'body.front-right'],
  'quarter-left':['rear-quarter-left',[0,0,0],'body.structure'],'quarter-right':['rear-quarter-right',[0,0,0],'body.structure'],
  'front-bumper':['front-bumper',null,'body.front-bumper'],'rear-bumper':['rear-bumper',null,'body.rear-bumper'],
  lid:['trunk-lid',null,'body.deck'],hood:['bonnet',null,'body.hood']
};
const BUMPER_OFFSET={'front-bumper':[-.51,0,-.10],'rear-bumper':[.51,0,-.10]};
// Draw the facets collected for each panel inside that panel's own mount.
function emitBuckets(r,buckets){
  for(const [key,draws] of buckets){
    if(!draws.length)continue;
    const run=()=>draws.forEach(f=>f());
    if(key==='nose'||key==='sill'||key==='structure'){r.tag('body.structure',run);continue;}
    const [name,offset,id]=MOUNTS[key];
    if(key==='lid')deckPanel(r,false,run);
    else if(key==='hood')panel(r,'bonnet',[0,0,.71],'body.hood',run);
    else panel(r,name,offset??BUMPER_OFFSET[key],id,run);
  }
}

// ---- Body sides, nose and tail -------------------------------------------------
export const E46_COLUMNS=makeColumns();
export function skinAt(s,z,side,lift=0){
  // Skin point at arc length s along the plan outline (0 = nose centre) and height z,
  // pushed out along the surface normal by lift. Used to seat lamps and trim.
  const cols=E46_COLUMNS;let i=1;while(i<cols.length-1&&cols[i].s<s)i++;
  const a=cols[i-1],b=cols[i],t=clamp((s-a.s)/((b.s-a.s)||1),0,1);
  const at=(c,zz)=>columnPoint(c,clamp(zz,c.bottom,c.zt+.05),side);
  const p=lerp(at(a,z),at(b,z),t);
  if(!lift)return p;
  const dz=lerp(at(a,z+.004),at(b,z+.004),t),ds=lerp(at(cols[Math.max(0,i-2)],z),at(cols[Math.min(cols.length-1,i+1)],z),.5);
  let n=unit(cross(sub(dz,p),sub(ds,p)));
  const out=[a.n[0],side*a.n[1],0];if(dot(n,out)<0)n=n.map(v=>-v);
  return p.map((v,k)=>v+n[k]*lift);
}
export const sAtX=x=>lengthAtX(x);
export function sAtFrontY(y){
  // Arc length of the nose column whose outline half-width is y (front or tail).
  for(let i=1;i<OUTLINE.length;i++)if(OUTLINE[i][1]>=y&&OUTLINE[i-1][1]<y&&OUTLINE[i][0]<0){const a=OUTLINE[i-1],b=OUTLINE[i];return mix(a[2],b[2],(y-a[1])/(b[1]-a[1]));}
  return 0;
}
export function sAtTailY(y){
  for(let i=OUTLINE.length-1;i>0;i--)if(OUTLINE[i-1][1]>=y&&OUTLINE[i][1]<y&&OUTLINE[i][0]>0){const a=OUTLINE[i-1],b=OUTLINE[i];return mix(a[2],b[2],(y-a[1])/(b[1]-a[1]));}
  return OUTLINE.at(-1)[2];
}
export function e46SkinPoint(x,z,side){
  // Nearest side-column skin point at station x (used for trim that sits on the skin).
  let best=E46_COLUMNS[0];
  for(const c of E46_COLUMNS)if(!c.e&&Math.abs(c.px-x)<Math.abs(best.px-x))best=c;
  const p=columnPoint({...best,px:x,py:widthLine(x),e:0},z,side);
  return p;
}
function sideSkin(r,paint,buckets){
  const cols=E46_COLUMNS;
  for(const side of [-1,1]){
    for(let i=1;i<cols.length;i++){
      const a=cols[i-1],b=cols[i],mx=(a.px+b.px)/2;
      // The door gaps are left open; the seam face below is drawn in the gap.
      const gap=door.some(e=>a.px<e&&b.px>e);
      const rowsA=rowsFor(a),rowsB=rowsFor(b);
      // Pair rows by height so horizontal bands stay aligned across columns.
      const all=[...new Set([...rowsA,...rowsB])].sort((p,q)=>p-q);
      for(let k=1;k<all.length;k++){
        const lo=all[k-1],hi=all[k],mid=(lo+hi)/2;
        const za0=clamp(lo,a.bottom,a.zt),za1=clamp(hi,a.bottom,a.zt),zb0=clamp(lo,b.bottom,b.zt),zb1=clamp(hi,b.bottom,b.zt);
        if(za1-za0<1e-5&&zb1-zb0<1e-5)continue;
        const pts=[columnPoint(a,za0,side),columnPoint(b,zb0,side),columnPoint(b,zb1,side),columnPoint(a,za1,side)];
        const owner=ownerOf({...a,px:mx,py:(a.py+b.py)/2,e:(a.e+b.e)/2,end:a.end||b.end},mid,side);
        if(gap){
          const inner=p=>[p[0],p[1]-side*.03,p[2]];
          const key=owner==='sill'?'sill':'structure';
          push(buckets,key,()=>face(r,[pts[0],pts[3],inner(pts[3]),inner(pts[0])],SEAL));
          continue;
        }
        const hint=[a.n[0],side*a.n[1],0];
        // Shade from the smooth surface normal rather than the facet, so the narrow
        // facets where row sets of neighbouring columns interleave do not speckle.
        const A=cols[Math.max(0,i-2)],B=cols[Math.min(cols.length-1,i+1)],at=(c,z)=>columnPoint(c,clamp(z,c.bottom,c.zt),side);
        const ds=sub(at(B,mid),at(A,mid)),dz=sub(lerp(at(a,mid+.012),at(b,mid+.012),.5),lerp(at(a,mid-.012),at(b,mid-.012),.5));
        let sn=unit(cross(dz,ds));if(!(Math.hypot(...sn)>.5))sn=normalOf(pts,hint);else if(dot(sn,hint)<0)sn=sn.map(v=>-v);
        // Rub strip: a raised painted band with a dark lower lip on the doors and wings.
        const rub=mid>.575&&mid<.600&&mx>-1.69&&mx<1.70&&archTop(mx)<.60;
        const draw=rub?()=>rubStrip(r,pts,paint,side):()=>face(r,pts,paintShade(paint,sn));
        push(buckets,owner,draw);
      }
      // Bumper and lid seams: a dark shadow line where two panels meet.
      if(!a.e&&!b.e&&mx>-1.70&&mx<1.72&&a.bottom<DOOR_SILL&&mx>door[0]&&mx<door[1]){
        const lo=columnPoint(a,DOOR_SILL,side),hi=columnPoint(b,DOOR_SILL,side),off=p=>[p[0],p[1]+side*.0015,p[2]+.0035];
        push(buckets,'sill',()=>face(r,[lo,hi,off(hi),off(lo)],SEAL));
      }
      // Wheel-arch lip and the dark liner behind the opening.
      const archA=archTop(a.px)>a.zb,archB=archTop(b.px)>b.zb;
      if(archA&&archB){
        const p0=columnPoint(a,a.bottom,side),p1=columnPoint(b,b.bottom,side);
        // The flared lip stands out to the full outline width over each wheel.
        const lip=(p,c)=>[p[0],side*widthLine(c.px),p[2]+.004],liner=p=>[p[0],p[1]-side*.075,p[2]+.002];
        push(buckets,ownerOf({...a,px:mx},a.bottom+.01,side),()=>{
          face(r,[p0,p1,lip(p1,b),lip(p0,a)],paintShade(paint,[0,side*.4,-.9]));
          face(r,[p0,p1,liner(p1),liner(p0)],LINER);
        });
      }
    }
  }
}
function push(buckets,key,fn){if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(fn);}
function rubStrip(r,pts,paint,side){
  const out=p=>[p[0],p[1]+side*.006,p[2]];
  const q=pts.map(out);
  face(r,[pts[0],pts[1],q[1],q[0]],'#262d30');
  painted(r,q,paint,[0,side,0],.6);
  face(r,[pts[3],pts[2],q[2],q[3]],paintShade(paint,[0,side*.3,.95]));
}

// ---- Hood and deck caps ------------------------------------------------------
// Caps are built from ribs between matching left and right top-edge points, with a
// crown across the car. The hood carries the two power-dome creases that run from
// the windscreen corners to the outer edges of the kidneys.
function capPoint(c,u,kind){
  const top=columnPoint(c,c.zt,1),half=top[1];
  const y=u*half,crown=kind==='hood'?.052:.060;
  let crownHere=crown;
  if(kind==='hood'&&c.px<-2.0)crownHere=mix(.052,.012,smooth((-c.px-2.0)/.12));
  if(kind==='deck'&&c.px>2.17)crownHere=mix(.060,.010,smooth((c.px-2.17)/.15));
  let z=top[2]+crownHere*(1-u*u)**1.15;
  if(kind==='hood'){
    // Power dome: the centre stands slightly proud between two creases.
    const crease=mix(.42,.17,smooth((-.95-c.px)/1.05));
    z+=.007*smooth((crease-Math.abs(y))/.025+.5)*smooth((-c.px-.95)/.08+1);
  }
  return [top[0],y,z];
}
function caps(r,paint,buckets){
  const cols=E46_COLUMNS;
  const across=[-1,-.985,-.95,-.88,-.78,-.66,-.52,-.38,-.24,-.12,0,.12,.24,.38,.52,.66,.78,.88,.95,.985,1];
  for(const kind of ['hood','deck']){
    const ribs=cols.filter(c=>kind==='hood'?c.px<=HOOD_END+1e-6:c.px>=DECK_START-1e-6);
    for(let i=1;i<ribs.length;i++){
      const a=ribs[i-1],b=ribs[i];
      const halfA=columnPoint(a,a.zt,1)[1],halfB=columnPoint(b,b.zt,1)[1];
      const shut=kind==='hood'?.035:.050;
      for(let j=1;j<across.length;j++){
        const u0=across[j-1],u1=across[j],um=(u0+u1)/2;
        const pts=[capPoint(a,u0,kind),capPoint(b,u0,kind),capPoint(b,u1,kind),capPoint(a,u1,kind)];
        const halfM=(halfA+halfB)/2,inner=Math.abs(um)*halfM<halfM-shut;
        // Across the nose and tail the edge strips sit between the lamps, not on a
        // wing or quarter: they stay with the fixed nose panel or the lid.
        const owner=inner||halfM<shut*2?kind==='hood'?'hood':'lid':halfM<.45?(kind==='hood'?'nose':'lid'):kind==='hood'?(um<0?'fender-left':'fender-right'):(um<0?'quarter-left':'quarter-right');
        push(buckets,owner,()=>painted(r,pts,paint,[0,0,1]));
      }
      // Shut lines along the hood and lid edges.
      for(const sgn of [-1,1]){
        const ua=sgn*Math.max(0,(halfA-shut)/halfA),ub=sgn*Math.max(0,(halfB-shut)/halfB);
        if(halfA<shut*2)continue;
        const p=capPoint(a,ua,kind),q=capPoint(b,ub,kind),lift=v=>[v[0],v[1],v[2]+.0015];
        push(buckets,'structure',()=>face(r,[p,q,lift(q),lift(p)],SEAL));
      }
    }
  }
  // Hood rear edge drops to the cowl and the windscreen base.
  const back=cols.find(c=>Math.abs(c.px-HOOD_END)<1e-6);
  if(back){
    push(buckets,'structure',()=>{
      for(let j=1;j<across.length;j++){
        const u0=across[j-1],u1=across[j];
        const p=capPoint(back,u0,'hood'),q=capPoint(back,u1,'hood');
        const screen=u=>{const [x,z]=wind[0],half=Math.abs(p[1])/Math.max(.01,Math.abs(u0)||1);void half;return [x+.010,u*.78,z-.027*(1-u*u)];};
        face(r,[p,q,screen(u1),screen(u0)],TRIM);
      }
    });
  }
}

// ---- Greenhouse ---------------------------------------------------------------
// One surface from the belt to the roof rail, leaning in by the E46 tumblehome.
// Glass, A- and C-pillars and the roof rail are all cut from it.
const roofEdge=plotted(roof);
const roofSpan=[roof[0][0],roof.at(-1)[0]];
const roofHalf=x=>.646-.025*clamp(((x-(roofSpan[0]+roofSpan[1])/2)/((roofSpan[1]-roofSpan[0])/2))**2,0,1.6);
const beltY=x=>{const c=e46SkinPoint(x,topLine(x),1);return c[1];};
export function ghPoint(x,z,side){
  const belt=topLine(x),rail=x<roofSpan[0]?roof[0][1]:x>roofSpan[1]?roof.at(-1)[1]:roofEdge(x);
  const t=clamp((z-belt)/Math.max(.05,rail-belt),0,1);
  const bottom=beltY(clamp(x,-.95,1.85)),top=roofHalf(clamp(x,roofSpan[0],roofSpan[1]));
  const y=bottom+(top-bottom)*t**1.18+.012*Math.sin(Math.PI*t);
  return [x,side*y,z];
}
function resample(poly,n){
  const d=[0];for(let i=1;i<poly.length;i++)d.push(d.at(-1)+Math.hypot(poly[i][0]-poly[i-1][0],poly[i][1]-poly[i-1][1]));
  const out=[];for(let k=0;k<=n;k++){const s=d.at(-1)*k/n;let i=1;while(i<d.length-1&&d[i]<s)i++;out.push(lerp(poly[i-1],poly[i],clamp((s-d[i-1])/((d[i]-d[i-1])||1),0,1)));}
  return out;
}
function strip(r,from,to,side,color,steps=8,across=3){
  // Fill between two (x,z) polylines on the greenhouse surface.
  for(let i=1;i<from.length;i++)for(let k=0;k<steps;k++){
    const t0=k/steps,t1=(k+1)/steps;
    const a0=lerp(from[i-1],from[i],t0),a1=lerp(from[i-1],from[i],t1),b0=lerp(to[i-1],to[i],t0),b1=lerp(to[i-1],to[i],t1);
    for(let j=0;j<across;j++){
      const v0=j/across,v1=(j+1)/across;
      const pts=[lerp(a0,b0,v0),lerp(a1,b1,v0),lerp(a1,b1,v1),lerp(a0,b0,v1)].map(([x,z])=>ghPoint(x,z,side));
      typeof color==='function'?color(pts):face(r,pts,color);
    }
  }
}
function greenhouse(r,paint){
  for(const side of [-1,1]){
    const word=side<0?'left':'right';
    // Front door glass is frameless; the DLO trim and pillars stay with the body.
    panel(r,'front-door-'+word,[-.12,side*.58,.035],side<0?'body.door':'body.front-right',()=>{
      const outline=resample([...frontWindow.slice(0,-1),frontWindow.at(-1)],40).map(([x,z])=>{
        const p=ghPoint(x,z,side);return [p[0],p[1]+side*.002,p[2]];
      });
      r.tag('body.glass',()=>fittedWindow(r,outline,{radius:.026,seal:.006,sideCrown:side*.010,frameless:true}));
      // Inner door top: the door skin rolls over at the belt to a black waist seal.
      const belt=resample([frontWindow[0],frontWindow.at(-1)],20);
      for(let i=1;i<belt.length;i++){
        const p=ghPoint(belt[i-1][0],belt[i-1][1],side),q=ghPoint(belt[i][0],belt[i][1],side),inn=v=>[v[0],v[1]-side*.035,v[2]-.004];
        face(r,[p,q,inn(q),inn(p)],SEAL);
      }
      // Inner trim card, seen through the glass and when the door swings open.
      const card=(x,z)=>{const q=e46SkinPoint(x,z,side);return [q[0],q[1]-side*.075,q[2]];};
      const x0=door[0]+.06,x1=door[1]-.16,zs=[.42,.56,.70,.84];
      for(let i=0;i<12;i++)for(let j=1;j<zs.length;j++){
        const a=mix(x0,x1,i/12),b=mix(x0,x1,(i+1)/12);
        face(r,[card(a,zs[j-1]),card(b,zs[j-1]),card(b,zs[j]),card(a,zs[j])],'#494d49');
      }
      for(let i=0;i<8;i++){
        const a=mix(x0+.08,x1-.05,i/8),b=mix(x0+.08,x1-.05,(i+1)/8),arm=(x,z)=>{const c=card(x,z);return [c[0],c[1]-side*.05,c[2]];};
        face(r,[card(a,.70),card(b,.70),arm(b,.70),arm(a,.70)],'#3b3f3c');
      }
      e46Mirror(r,side,paint);
      e46DoorHandle(r,side,paint);
    });
    drawBmwQuarterWindow(r,side,quarter.map(([x,z])=>ghPoint(x,z,side)));
    r.tag('body.structure',()=>{
      // Pillars: A-pillar and roof rail from the DLO to the screen and roof edges,
      // the broad C-pillar down to the deck, and the black B-post between the panes.
      const dlo=[...frontWindow.slice(0,-1),...quarter.slice(1,7)];
      const outer=[wind[0],[-.478,1.135],roof[0],roof[2],roof[3],roof[5],roof[6],roof[7],roof[8],[1.304,1.252],[1.457,1.202],rear[1]];
      strip(r,dlo,outer,side,pts=>painted(r,pts,paint,[0,side,.5]),8,3);
      strip(r,[quarter[6],quarter[7]],[[1.797,1.120],[1.820,1.053]],side,pts=>painted(r,pts,paint,[0,side,.3]),10,4);
      strip(r,[quarter[7],quarter[8]],[[1.820,1.053],[1.3625,.990]],side,pts=>painted(r,pts,paint,[0,side,.3]),10,4);
      strip(r,[frontWindow.at(-1),frontWindow.at(-2)],[quarter[0],quarter[1]],side,BLACK,6,1);
      // Bright DLO surround and the black weatherstrip inside it.
      const ring=resample([...frontWindow.slice(0,-1),...quarter.slice(1)],120);
      for(let i=1;i<ring.length;i++){
        const p=ghPoint(ring[i-1][0],ring[i-1][1],side),q=ghPoint(ring[i][0],ring[i][1],side);
        const out=(v,d)=>[v[0],v[1]+side*d,v[2]+.0005];
        face(r,[out(p,.001),out(q,.001),out(q,.004),out(p,.004)],CHROME);
      }
    });
  }
}
function transverseGlass(r,start,end,back){
  // Across-car glass: screen bows forward in plan and is crowned at the roof edge.
  const half=(x,z)=>Math.abs(ghPoint(x,z,1)[1]);
  const point=(u,v,lift=0)=>{
    const x0=mix(start[0],end[0],v),z0=mix(start[1],end[1],v),h=half(x0,z0)-.004,across=1-u*u,atRoof=back?1-v:v;
    const sweep=(back?1:-1)*.065*across*(.65+.35*Math.sin(Math.PI*v));
    return [x0+sweep*(1-atRoof),u*h,z0+across*mix(-.027,.050,atRoof)+lift];
  };
  const us=[-1,-.975,-.88,-.74,-.58,-.40,-.20,0,.20,.40,.58,.74,.88,.975,1],vs=[0,.04,.18,.34,.50,.66,.82,.96,1];
  for(let i=1;i<us.length;i++)for(let j=1;j<vs.length;j++){
    const a=us[i-1],b=us[i],c=vs[j-1],d=vs[j],edge=i===1||i===us.length-1||j===1||j===vs.length-1;
    const pts=[point(a,c),point(b,c),point(b,d),point(a,d)];
    if(edge)face(r,pts,'#1b2224');
    else glazingFace(r,pts,tint('#8fa9b2',.86+.12*c+.05*(1-Math.abs(a))),back?.36:.26+.06*d);
  }
  if(back)for(let k=1;k<=8;k++){
    const t=.07+k*.094;
    for(let j=3;j<us.length-2;j++)glazingFace(r,[point(us[j-1],t,.0017),point(us[j],t,.0017),point(us[j],t+.003,.0017),point(us[j-1],t+.003,.0017)],'#6a6060',.38);
  }
  return point;
}
function roofAndGlass(r,paint){
  panel(r,'windshield',[-.20,0,.22],'body.glass',()=>transverseGlass(r,...wind,false));
  panel(r,'backlight',[0,0,.25],'body.glass',()=>transverseGlass(r,...rear,true));
  // Roof skin with a flush glass moonroof (the E46 coupé's optional slide/tilt roof).
  const lidX=.28,left=lidX-.32,right=lidX+.32,openHalf=.475;
  const height=(x,y)=>roofEdge(x)+.050*(1-(y/roofHalf(x))**2);
  const xs=[];for(let x=roof[0][0];x<=roof.at(-1)[0]+1e-9;x+=.04)xs.push(+x.toFixed(4));
  xs.push(roof.at(-1)[0],left,right);const stops=[...new Set(xs)].sort((a,b)=>a-b);
  const ys=[-1,-.96,-.86,-.74,-openHalf/.62,-.5,-.25,0,.25,.5,openHalf/.62,.74,.86,.96,1];
  r.tag('body.structure',()=>{
    for(let n=1;n<stops.length;n++){
      const a=stops[n-1],b=stops[n];
      for(let j=1;j<ys.length;j++){
        const p=(x,f)=>{const y=Math.abs(f)>=.99?f*roofHalf(x):f*.62;return [x,clamp(y,-roofHalf(x),roofHalf(x)),height(x,clamp(y,-roofHalf(x),roofHalf(x)))];};
        const mid=(ys[j-1]+ys[j])/2*.62;
        if(a>=left-1e-9&&b<=right+1e-9&&Math.abs(mid)<openHalf)continue;
        const pts=[p(a,ys[j-1]),p(b,ys[j-1]),p(b,ys[j]),p(a,ys[j])];
        painted(r,pts,paint,[0,0,1]);
        face(r,pts.map(([x,y,z])=>[x,y,z-.010]),'#5c6162');
      }
    }
    // Black seal around the roof opening.
    const ring=[];for(let k=0;k<=40;k++){const t=k/40;ring.push([mix(left,right,t),-openHalf]);}for(let k=0;k<=12;k++)ring.push([right,mix(-openHalf,openHalf,k/12)]);
    for(let k=0;k<=40;k++)ring.push([mix(right,left,k/40),openHalf]);for(let k=0;k<=12;k++)ring.push([left,mix(openHalf,-openHalf,k/12)]);
    for(let k=1;k<ring.length;k++){const [x0,y0]=ring[k-1],[x1,y1]=ring[k];const p=[x0,y0,height(x0,y0)+.0003],q=[x1,y1,height(x1,y1)+.0003];const c=[(left+right)/2,0];const inn=v=>[v[0]+(c[0]-v[0])*.025,v[1]*.975,v[2]];face(r,[p,q,inn(q),inn(p)],BLACK);}
  });
  panel(r,'sliding-roof',[0,0,.55],'roof.glass',()=>{
    for(let i=0;i<10;i++)for(let j=0;j<8;j++){
      const point=(ix,iy)=>{const x=left+.025+.59*ix/10,y=(iy/4-1)*(openHalf-.022);return [x,y,height(x,y)];};
      glazingFace(r,[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)],'#2c3a3f',.86);
    }
  });
  // The closed sunshade under the glass, in headliner fabric.
  r.tag('body.structure',()=>{
    for(let i=0;i<10;i++){
      const x0=left+.6*i/10,x1=left+.6*(i+1)/10,y=openHalf;
      face(r,[[x0,-y,height(x0,0)-.03],[x1,-y,height(x1,0)-.03],[x1,y,height(x1,0)-.03],[x0,y,height(x0,0)-.03]],'#77756e');
    }
  });
  // Black roof drip strips over the rails.
  r.tag('body.structure',()=>{
    for(const side of [-1,1])for(let x=roof[0][0];x<roof.at(-1)[0]-1e-6;x+=.04){
      const b=Math.min(roof.at(-1)[0],x+.04),y0=roofHalf(x)*side,y1=roofHalf(b)*side;
      const p=[x,y0,roofEdge(x)+.002],q=[b,y1,roofEdge(b)+.002],out=v=>[v[0],v[1]+side*.008,v[2]-.006];
      face(r,[p,q,out(q),out(p)],'#20282b');
    }
  });
}

// ---- Mirrors and handles ---------------------------------------------------------
// The E46 mirror: a body-colour shell on a black sail at the DLO's front corner.
// Its outer cap marks the 1947-mm span over the mirrors.
function e46Mirror(r,side,paint){
  r.tag(side<0?'body.mirror-left':'body.mirror-right',()=>{
    const base=ghPoint(-.600,.985,side);
    r.polygon([ghPoint(-.660,.960,side),ghPoint(-.545,.968,side),ghPoint(-.585,1.040,side)].map(p=>[p[0],p[1]+side*.004,p[2]]),BLACK,false);
    const arm0=[base[0],base[1]+side*.004,base[2]+.010],arm1=[-.628,side*.880,1.006];
    r.rod(arm0,arm1,.016,BLACK,10);
    // Shell sections from the glass face (rear) to the nose (front).
    const shape=[[-.082,-.032],[-.072,-.056],[-.030,-.066],[.040,-.060],[.078,-.040],[.084,.004],[.074,.036],[.030,.052],[-.040,.050],[-.078,.030]];
    const ring=(x,scale,dz=0)=>shape.map(([y,z])=>[x,side*(.8895+y*scale),1.006+dz+z*scale]);
    const glassFace=ring(-.578,.98),rim=ring(-.590,1.0),mid=ring(-.632,1.0,.002),front=ring(-.680,.86,.004),nose=ring(-.700,.58,.006);
    const band=(a,b,flip)=>{for(let i=0;i<a.length;i++){const j=(i+1)%a.length;const pts=[a[i],a[j],b[j],b[i]];painted(r,pts,paint,unit([flip,side*(shape[i][0]+shape[j][0]),shape[i][1]+shape[j][1]]));}};
    band(rim,mid,.2);band(mid,front,-.6);band(front,nose,-.9);
    r.polygon(nose,paintShade(paint,[-1,0,.2]),false);
    for(let i=0;i<rim.length;i++){const j=(i+1)%rim.length;r.polygon([glassFace[i],glassFace[j],rim[j],rim[i]],BLACK,false);}
    r.polygon(glassFace.map(p=>[p[0]+.001,p[1]*.999,p[2]]),'#8a9a9d',false);
  });
}
function e46DoorHandle(r,side,paint){
  // Body-colour pull handle in a shallow recess, just under the shoulder line.
  const x=.470,z=.860,surface=(dx,dz,lift=0)=>{const p=e46SkinPoint(x+dx,z+dz,side);return [p[0],p[1]+side*lift,p[2]];};
  const recess=Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return surface(.082*Math.cos(a),.022*Math.sin(a),-.002);});
  r.polygon(recess,tint(paint,.55),false);
  const bow=[[-.075,.002,.004],[-.052,.008,.012],[.040,.008,.014],[.064,.004,.010],[.074,.000,.004]];
  for(let i=1;i<bow.length;i++)r.rod(surface(bow[i-1][0],bow[i-1][1],bow[i-1][2]),surface(bow[i][0],bow[i][1],bow[i][2]),.0085,paintShade(paint,[0,side,.3]),10);
  const lock=surface(.098,.004,.003);r.rod(lock,[lock[0],lock[1]+side*.003,lock[2]],.009,'#9aa3a2',10);
}

export function buildE46Shell(r,paint){
  const buckets=new Map();
  sideSkin(r,paint,buckets);
  caps(r,paint,buckets);
  emitBuckets(r,buckets);
  greenhouse(r,paint);
  roofAndGlass(r,paint);
}
