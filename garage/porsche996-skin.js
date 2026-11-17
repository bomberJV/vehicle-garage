// 1999 911 Carrera Cabriolet (996.1) body loft. Values are in metres.
//
// The side and plan outlines are digitized from Porsche's 996 Cabriolet rescue
// sheet (Porsche Classic rescue data, PDF page 36). The sheet's vector paths
// were read directly; both views share one scale, set by the 2,350 mm
// wheelbase. The overhangs are stretched 1.6 % to the published 4,430 mm
// length, the plan by 1.2 % to the 1,765 mm width and the heights by 1.5 % to the
// 1,305 mm height. Axles sit at x = ±1.175; the wheel centres are 0.324 m up.
// Section shapes between the traced lines follow photographs of US 1999
// Carrera Cabriolets (see porsche996-sources.js); they are estimates.
const bound=t=>Math.max(0,Math.min(1,t));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{const u=bound(t);return u*u*(3-2*u);};
function interpolate(rows,x,col=1){
  let i=1;
  while(i<rows.length-1 && rows[i][0]<x)i++;
  const a=rows[i-1],b=rows[i];
  return mix(a[col],b[col],bound((x-a[0])/(b[0]-a[0])));
}
export const nose996=-2.204,tail996=2.227;
// Plan outline read from the rescue sheet (path 211), half-width by station.
// The loft is checked against it by tests/garage-porsche996-body.test.mjs.
export const planOutline996=[[-2.15,.340],[-2.10,.464],[-2.05,.552],[-2.00,.616],[-1.95,.666],[-1.90,.703],[-1.80,.755],[-1.70,.789],[-1.60,.815],[-1.50,.835],[-1.40,.848],[-1.30,.855],[-1.20,.858],[-1.00,.858],[-.50,.858],[0,.858],[.50,.858],[1.00,.876],[1.20,.882],[1.40,.882],[1.50,.877],[1.60,.862],[1.70,.835],[1.80,.804],[1.90,.771],[2.00,.737],[2.05,.706],[2.10,.657],[2.15,.573],[2.20,.367]];
// Plan outline at the nose and tail: distance behind the nose tip (or ahead of
// the tail) at which the outline reaches each half-width. The sweep reaches the
// corners only; beyond them the station widths themselves follow the outline.
const front=[[0,0],[.117,.006],[.225,.024],[.321,.047],[.405,.077],[.477,.110],[.534,.142],[.584,.176],[.628,.214],[.668,.256],[.702,.303]];
const rear=[[0,0],[.142,.003],[.206,.008],[.347,.024],[.434,.036],[.520,.057],[.591,.084],[.648,.119],[.691,.157],[.721,.196],[.740,.232]];
const CAP_F=.70,CAP_R=.74,REACH=.60;
export function sweep996(x,y){
  const u=Math.abs(y);
  return x+interpolate(front,Math.min(u,CAP_F))*smooth(1-(x-nose996)/REACH)
          -interpolate(rear,Math.min(u,CAP_R))*smooth(1-(tail996-x)/REACH);
}
// [loft x, half-width, shoulder crest height, centre-line height]. Half-widths
// are fitted so that the swept flank reproduces the plan outline within 1 mm.
// The crests follow the side elevation's fender line; the centre line follows
// the lid in side elevation where it stands above the fenders (cowl, deck).
export const stations996=[
  [-2.204,.705,.590,.515],[-2.160,.729,.620,.545],[-2.100,.749,.648,.585],
  [-2.030,.763,.672,.614],[-1.950,.772,.692,.640],[-1.860,.780,.712,.668],
  [-1.760,.791,.735,.700],[-1.660,.808,.765,.735],[-1.560,.829,.802,.772],
  [-1.450,.848,.827,.808],[-1.320,.860,.846,.844],[-1.175,.863,.860,.862],
  [-1.020,.863,.869,.880],[-.860,.863,.874,.888],[-.700,.863,.873,.884],
  [-.500,.863,.872,.882],[-.250,.863,.873,.885],[0,.863,.874,.888],
  [.250,.863,.876,.890],[.500,.863,.879,.893],[.700,.867,.886,.900],
  [.900,.876,.898,.912],[1.100,.886,.912,.928],[1.280,.887,.920,.944],
  [1.450,.885,.915,.958],[1.600,.867,.902,.944],[1.750,.840,.882,.912],
  [1.880,.817,.862,.878],[2.000,.799,.842,.848],[2.070,.789,.800,.808],
  [2.120,.781,.752,.737],[2.160,.772,.702,.678],[2.195,.762,.656,.640],
  [2.227,.745,.615,.600]
];
// Lower edge of the body in side elevation: the nose and tail covers sit higher
// than the sills (rescue sheet path 65: 0.23 m at the nose, 0.19 m along the
// sills, 0.24 m behind the rear wheel and 0.31 m at the tail).
const lowerEdge=[[-2.204,.235],[-2.10,.228],[-1.95,.212],[-1.70,.190],[-1.53,.182],[-.80,.188],[0,.190],[.80,.190],[1.55,.240],[1.85,.262],[2.05,.285],[2.227,.310]];
export const cut996=x=>interpolate(lowerEdge,x);
// Setback of the bumper faces behind the nose tip (front) or the tail (rear)
// at each height, from the side elevation's centre-line profile.
const noseProfile=[[.20,.130],[.222,.110],[.232,.093],[.245,.072],[.26,.063],[.30,.055],[.355,.032],[.371,.018],[.40,.006],[.426,0],[.50,.003],[.53,.010]];
const tailProfile=[[.25,.130],[.262,.120],[.283,.098],[.30,.062],[.34,.030],[.40,.018],[.46,.012],[.50,.006],[.55,.002],[.59,.006],[.62,.018]];
// Engine-lid half-width: the side shut lines run inboard of the tail lamps to
// the louvred section (rescue plan paths 217 and 214).
const engineLid=[[1.40,.560],[1.52,.545],[1.65,.520],[1.80,.490],[2.00,.468],[2.227,.452]];
export const deckHalf996=x=>interpolate(engineLid,x);
export const setback996=(front,z)=>interpolate(front?noseProfile:tailProfile,z);
// The fixed louvres and the lifting blade of the rear lid, in plan at the centre.
export const spoiler996={front:1.735,rear:2.005};
// The lid's front edge at the centre, in loft coordinates. The plan sweep bends
// it back to x = -1.98 at the outer corners, as on the sheet.
export const bonnetStart996=-2.040;
const bonnetSides=[
  [-2.204,.330],[bonnetStart996,.355],[-2.026,.368],[-1.931,.383],[-1.785,.407],
  [-1.648,.436],[-1.450,.496],[-1.177,.589],[-1.069,.621],[-.980,.642],
  [-.902,.654],[-.746,.664]
];
export const bonnetHalfWidth996=x=>interpolate(bonnetSides,x);
// The 996 luggage lid is one smooth crown with no centre recess.
export function bonnetPressing996(){return 0;}
// Transverse crown at the front. The lid is gently crowned and meets the wings
// low at its shut line; the wings rise to round crests over the headlamps and
// then roll down outboard. Toward the cowl the crown blends into the shoulder.
export function frontCrown996(x,u,crestU,shoulder){
  const w=smooth((-.86-x)/.36);
  if(w<=0)return shoulder;
  const lidU=Math.min(bonnetHalfWidth996(x)/.90,crestU-.07);
  const atSeam=mix(.12,.62,smooth((x+2.204)/1.15));
  const peakU=mix(crestU,Math.min(crestU,lidU+.16),smooth((x+2.10)/.30));
  let f;
  if(u<=lidU){const s=u/lidU;f=atSeam*(1-(1-s)**1.6);}
  else if(u>=peakU)f=1;
  else{
    const t=bound((u-lidU)/(peakU-lidU)),m0=1.6*atSeam/lidU*(peakU-lidU);
    f=atSeam*(2*t**3-3*t*t+1)+Math.min(m0,1.6*(1-atSeam))*(t**3-2*t*t+t)+(-2*t**3+3*t*t);
  }
  return mix(shoulder,f,w);
}
// The lens is a sloping teardrop on the nose of the wing ("fried-egg" unit
// shared with the Boxster). The wing is pressed flat under it; the lens plane
// rises from (−1.95, 0.57) at its front to (−1.59, 0.80) at the rear tip.
export const lamp996={x:-1.765,y:.578,slope:.62,roll:-.40,z:.700};
export function lampPlane996(x,y){
  const {x:x0,y:y0,slope,roll,z}=lamp996;
  return z+slope*(x-x0)+roll*(Math.abs(y)-y0)+.30*(x-x0)**2;
}
export function headlampSeat996(point){
  const [x,y,z]=point,dx=x-lamp996.x,dy=Math.abs(y)-lamp996.y;
  if(Math.abs(dx)>.36||Math.abs(dy)>.30)return point;
  const plane=lampPlane996(x,y)-.004;
  // Elliptical seat, eased into the surrounding crest.
  const d=Math.hypot(dx/.205,dy/.180);
  const k=1-smooth((d-.95)/.55);
  return [x,y,mix(z,Math.min(z,plane+.012*smooth(d-.2)),k)];
}
// The lower door and sill have a flush, slightly concave rocker.
export function rocker996(x,z){
  const mask=smooth((x+.78)/.20)*smooth((.80-x)/.30);
  return mask*(.006*Math.exp(-(((z-.27)/.06)**2)));
}
// Door cut at the belt; the rear edge sweeps forward to the sill (side elevation).
export const door996=[-.640,.540];
export const sideLevels996=[.145,.18,.22,.28,.34,.44,.54,.65,.76,.83,.90,.935,.965,.985,1];
// Hanging edges traced from the side view: front edge nearly vertical, rear edge
// leaning back at the belt and curving forward to x ≈ 0.24 above the sill.
const hangingEdge=[
  [0,-.612,.240],[.145,-.612,.240],[.22,-.616,.290],[.34,-.622,.372],
  [.54,-.632,.470],[.76,-.646,.560],[.90,-.648,.598],[1,door996[0],door996[1]]
];
export function doorRibX996(x,t){
  const [a,b]=door996;
  const warp=(edge,radius,col)=>smooth(1-Math.abs(x-edge)/radius)*(interpolate(hangingEdge,t,col)-edge);
  return x+warp(a,.20,1)+warp(b,.42,2);
}
// Front and rear bumper covers of the 996.1. The front has three intakes: a
// wide centre slot and an outboard radiator inlet at each corner, both crossed
// by a horizontal bar. The rear carries the US plate recess with two rubber
// guards and a dark lower apron between the tailpipe cut-outs.
export function fascia996(r,front,paint,w,x,point,cap,flank,painted,sideHeights,outer){
  const sign=front?-1:1;
  const bands=y=>{
    const t=Math.abs(y)/w;
    if(front)return [
      .235+.030*t*t,.262+.014*t*t,.282+.006*t*t,
      .402+.004*t,.432+.010*t*t,.495+.060*smooth((t-.30)/.50),cap(y)
    ];
    return [
      .262+.026*t*t,.300+.016*t*t,.350+.010*t*t,
      .400+.008*t*t,.465+.006*t*t,.510+.006*t*t,
      .545+.004*t*t,.570+.002*t*t,cap(y)
    ];
  };
  const fractions=front?[0,.12,.24,.36,.40,.46,.53,.62,.72,.82,.90,.95,.98,1]:
                         [0,.12,.24,.30,.36,.46,.56,.66,.74,.82,.89,.94,.98,1];
  const stops=[...new Set([...fractions.map(t=>w*t),...outer.map(p=>p[1])])].sort((a,b)=>a-b);
  const ys=[...stops.slice(1).reverse().map(y=>-y),...stops];
  const vertex=(y,k,d=0)=>{
    const t=Math.abs(y)/w,row=bands(y),z=row[k],s=Math.sign(y);
    if(k===row.length-1){
      const width=Math.abs(y);
      let n=1;
      while(n<outer.length-1 && outer[n][1]<width)n++;
      const a=outer[n-1],b=outer[n],f=bound((width-a[1])/(b[1]-a[1]));
      return [mix(a[0],b[0],f),y,mix(a[2],b[2],f)];
    }
    let dy=0;
    if(t>.88){
      const sideWidth=Math.abs(flank(s,z)[1]);
      const margin=.016*smooth((cap(y)-z)/.10);
      dy-=s*Math.max(0,w-sideWidth+margin)*smooth((t-.88)/.12);
    }
    return point(y+dy,z,d);
  };
  // The painted nose rolls over into the lid in a quarter-round section.
  const brow=(y,v)=>{
    const base=vertex(y,front?5:7),end=vertex(y,front?6:8);
    const angle=v*Math.PI/2,inset=1-Math.cos(angle),height=Math.sin(angle);
    return [mix(base[0],end[0],inset),mix(base[1],end[1],v),mix(base[2],end[2],height)];
  };
  const intake=(t,k)=>front?k===3&&(t<.36||(t>=.53&&t<.90)):false;
  const darkRear=(t,k)=>!front&&k===1&&t<.89;
  const plate=(t,k)=>!front&&(k===4||k===5)&&t<.24;
  r.tag('shell.bumpers',()=>{
    for(let i=1;i<ys.length;i++){
      const a=ys[i-1],b=ys[i],t=Math.abs((a+b)/(w*2));
      const last=bands(a).length-1;
      for(let k=1;k<=last;k++){
        if(k===last){
          for(const [v,q] of [[0,.25],[.25,.5],[.5,.75],[.75,1]]){
            painted(r,[brow(a,v),brow(b,v),brow(b,q),brow(a,q)],paint,[sign,0,.6]);
          }
          continue;
        }
        const face=[vertex(a,k-1),vertex(b,k-1),vertex(b,k),vertex(a,k)];
        if(front&&k===1){r.polygon(face,'#2b3033',false);continue;}
        if(darkRear(t,k)){r.polygon(face,'#2c3134',false);continue;}
        if(plate(t,k)){
          const back=face.map(([xx,y,z])=>[xx-sign*.016,y,z]);
          r.polygon(back,'#30363a',false);
          for(const [m,n] of [[0,1],[2,3]])r.polygon([face[m],face[n],back[n],back[m]],'#3a4044',false);
          continue;
        }
        if(!intake(t,k)){painted(r,face,paint,[sign,0,.20]);continue;}
        const depth=t<.36?.050:.075;
        const back=[vertex(a,k-1,depth),vertex(b,k-1,depth),vertex(b,k,depth),vertex(a,k,depth)];
        r.polygon(back,'#15191b',false);
        r.polygon([face[0],face[1],back[1],back[0]],'#3c4245',false);
        r.polygon([face[3],face[2],back[2],back[3]],'#202528',false);
        for(const [yy,j,m] of [[a,0,3],[b,1,2]]){
          const eta=Math.abs(yy/w);
          if([.36,.53,.90].some(edge=>Math.abs(edge-eta)<.0001))r.polygon([face[j],face[m],back[m],back[j]],'#2f3437',false);
        }
        // One horizontal bar across each opening.
        const zA=mix(bands(a)[2],bands(a)[3],.52),zB=mix(bands(b)[2],bands(b)[3],.52);
        r.polygon([point(a,zA,.014),point(b,zB,.014),point(b,zB+.016,.018),point(a,zA+.016,.018)],'#2a2f31',false);
        r.polygon([point(a,zA+.016,.018),point(b,zB+.016,.018),point(b,zB+.018,.034),point(a,zA+.018,.034)],'#4a5052',false);
      }
    }
    for(const s of [-1,1]){
      const row=bands(s*w);
      const stops=[...new Set([...row,...sideHeights.filter(z=>z>row[0]&&z<row.at(-1))])].sort((a,b)=>a-b);
      const along=(heights,edge,h)=>{
        let j=1;
        while(j<heights.length-1&&heights[j]<h)j++;
        const a=edge(j-1),b=edge(j),t=bound((h-heights[j-1])/(heights[j]-heights[j-1]));
        return a.map((v,k)=>mix(v,b[k],t));
      };
      const corner=z=>along(row,k=>vertex(s*w,k),z);
      const side=z=>along(sideHeights,k=>flank(s,sideHeights[k]),z);
      for(let k=1;k<stops.length;k++){
        const a=stops[k-1],b=stops[k];
        painted(r,[corner(a),corner(b),side(b),side(a)],paint,[sign*.46,s,0]);
      }
    }
    const under=p=>[p[0]-sign*.070,p[1]*.965,p[2]+.010];
    for(let i=1;i<ys.length;i++){
      const a=vertex(ys[i-1],0),b=vertex(ys[i],0);
      r.polygon([a,b,under(b),under(a)],'#272c2e',false);
    }
    for(const s of [-1,1]){
      const lip=vertex(s*w,0),bottom=flank(s,sideHeights[0]);
      const corner=flank(s,bands(s*w)[0]);
      painted(r,[lip,corner,bottom,under(lip)],paint,[sign*.2,s,-.3]);
    }
  });
  return {point,w,x};
}
