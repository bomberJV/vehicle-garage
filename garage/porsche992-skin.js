// Porsche's 911 (992) Cabriolet rescue outline, page 86. Values are in metres.
// Both ends are registered to the 4,519 mm envelope; the two axle centres are
// 2,450 mm apart. The drawing gives the plan and side edges, not panel sections.
const bound=t=>Math.max(0,Math.min(1,t));
const mix=(a,b,t)=>a+(b-a)*t;
function interpolate(rows,x,col=1){
  let i=1;
  while(i<rows.length-1 && rows[i][0]<x)i++;
  const a=rows[i-1],b=rows[i];
  return mix(a[col],b[col],bound((x-a[0])/(b[0]-a[0])));
}
const perimeter=[
  // transverse station, distance behind nose, distance ahead of tail
  [0,0,0],[.10,.002,.002],[.20,.009,.009],[.30,.024,.021],[.40,.046,.041],
  [.45,.067,.055],[.50,.094,.072],[.55,.125,.092],[.60,.157,.121],
  [.65,.191,.159],[.70,.224,.210],[.75,.261,.283],[.78,.285,.336],
  [.80,.302,.379],[.83,.336,.444],[.85,.369,.486],[.87,.425,.532],
  [.89,.498,.573],[.91,.582,.611],[.93,.655,.681]
];
const smooth=t=>{const u=bound(t);return u*u*(3-2*u);};
export function sweep992(x,y){
  const u=Math.abs(y);
  return x+interpolate(perimeter,u)*smooth(1-(x+2.240)/1.12)
          -interpolate(perimeter,u,2)*smooth(1-(2.279-x)/1.08);
}
// Register the headlight bucket to both projections of the 992 Cabriolet
// rescue sheet (p. 86). The plan bounds alone flatten the headlamp when
// projected nose-on. The two side-view arcs determine pitch and lateral roll.
export function headlampSeat992(point){
  const [x,y,z]=point,dx=x+1.735,dy=Math.abs(y)-.686;
  if(x< -1.98){
    // Roll the hood and wing skins back from the front bumper's leading nose.
    // The bumper remains the datum for overall length in the dimension study.
    point=[x+.046*smooth((-1.98-x)/.26),y,z];
  }
  if(Math.abs(dy)>.30)return point;
  const socket=.7015+.688*dx-.4155*dy+.143*dx*dx+.2075*dy*dy-.134*dx*dy;
  // The wing's crest runs along the inboard edge of the lens; the lamp sits
  // on the outward-tilted face of the wing.
  let seated=z+.029*Math.exp(-(((dy+.167)/.057)**2)-(((dx+.142)/.138)**2));
  if(Math.abs(dx)<=.39&&Math.abs(dy)<=.25){
    const distance=Math.hypot(dx/.21,(dy-.32*dx)/.124);
    seated=mix(seated,socket-.004,1-smooth((distance-.94)/.60));
  }
  if(dx< -.10&&dx> -.70){
    // Ahead of the lamp the wing falls away into the bumper. Continue the lens
    // plane over the nose instead of leaving a painted lip above its lower edge.
    const ahead=smooth((-.10-dx)/.14),lateral=1-smooth((Math.abs(dy-.02)-.05)/.16);
    const cap=socket-.004,k=.014;
    const soft=-k*Math.log(Math.exp(-seated/k)+Math.exp(-cap/k));
    seated=mix(seated,Math.min(seated,soft),ahead*lateral);
  }
  if(dy>.08&&Math.abs(dx)<.45){
    // Outboard of the lens the wing rolls down to its shoulder. Extend the
    // lens plane with a convex fall instead of rising again past its rim.
    const e=.12,slope=-.4155+.415*e-.134*dx;
    const rim=.7015+.688*dx-.4155*e+.143*dx*dx+.2075*e*e-.134*dx*e;
    const cap=rim-.004+slope*(dy-e)-1.6*Math.max(0,dy-e)**2,k=.008;
    const soft=-k*Math.log(Math.exp(-seated/k)+Math.exp(-cap/k));
    const outboard=smooth((dy-.08)/.06)*(1-smooth((Math.abs(dx)-.12)/.26));
    seated=mix(seated,Math.min(seated,soft),outboard);
  }
  return [point[0],y,seated];
}

// The lower door folds inward above the raised rocker. The depression tapers
// into the front wing and rises toward the rear wheel, as in the side photograph.
export function rocker992(x,z){
  const mask=smooth((x+.82)/.27)*smooth((.87-x)/.39);
  const rise=.024*smooth((x+.58)/1.14);
  return mask*(.010*Math.exp(-(((z-.291-rise)/.068)**2))-.004*Math.exp(-(((z-.207-rise)/.038)**2)));
}
// The fender crests are tabulated in the loft's parameter space; on either
// cap their physical x differs from the centreline by the measured plan sweep.
export const stations992=[
  [-2.240,.906,.586,.497],[-2.160,.914,.634,.534],[-2.040,.920,.703,.591],
  [-1.850,.913,.765,.660],[-1.650,.923,.828,.716],[-1.420,.923,.855,.771],
  [-1.200,.923,.870,.805],[-.920,.918,.906,.862],[-.700,.886,.890,.861],
  [-.350,.879,.880,.864],[.100,.868,.901,.878],[.440,.859,.917,.893],
  [.620,.854,.929,.913],[.785,.911,.934,.938],[.990,.925,.936,1.015],
  [1.250,.926,.943,1.059],[1.470,.925,.957,1.093],[1.665,.922,.944,1.071],
  [1.900,.924,.915,.995],[2.080,.922,.876,.919],[2.200,.917,.841,.829],
  [2.279,.910,.820,.773]
];
// The fixed grating ends before the small curved spoiler panel in plan.
export const spoiler992={front:1.995,rear:2.207};
export const bonnetStart=-2.139;
const bonnetSides=[
  [-2.240,.345],[bonnetStart,.365],[-2.04,.415],[-1.85,.483],[-1.65,.543],
  [-1.42,.597],[-1.20,.632],[-.90,.686],[-.695,.713]
];
export const bonnetHalfWidth=x=>interpolate(bonnetSides,x);
export function bonnetPressing(x,y){
  // Porsche describes a pronounced recess in the lid between the headlights,
  // after the first 911. The centre sits low between two soft walls; the walls
  // read as the two character lines that run from the nose to the screen.
  const strength=smooth((x+2.10)/.30)*smooth((-1.0-x)/.40);
  const ridge=.250+.060*bound((x+2.0)/1.2);
  const floor=1-smooth((Math.abs(y)-ridge+.045)/.09);
  return -strength*.012*floor;
}
// Transverse crown of the front end, as a fraction of the crest's rise over the
// centreline. The lid stays almost flat across, so its leading edge reads as a
// straight line nose-on. Outside the lid seam the wings climb steeply to their
// crests and stand clear of the lid around each headlamp. Toward the cowl the
// profile hands back to the rounded shoulder used over the doors.
export function frontCrown992(x,u,crestU,shoulder){
  const w=smooth((-.78-x)/.40);
  if(w<=0)return shoulder;
  const lidU=Math.min(bonnetHalfWidth(x)/.92,crestU-.08);
  const atSeam=mix(.18,.42,smooth((x+2.0)/1.1));
  // The wing reaches its crest a hand's width outboard of the seam, along
  // the inboard edge of the lamp, and holds that height across its top.
  const peakU=mix(crestU,Math.min(crestU,lidU+.12),smooth((x+2.16)/.22));
  let f;
  if(u<=lidU){const s=u/lidU;f=atSeam*s*s;}
  else if(u>=peakU)f=1;
  else{
    const t=bound((u-lidU)/(peakU-lidU)),m0=2*atSeam/lidU*(peakU-lidU);
    f=atSeam*(2*t**3-3*t*t+1)+m0*(t**3-2*t*t+t)+(-2*t**3+3*t*t);
  }
  return mix(shoulder,f,w);
}
// The door cut is widest at belt height. Its curved rear edge leans back and
// then rounds forward to meet the hem above the independent rocker panel.
export const door992=[-.603,.560];
export const sideLevels992=[.145,.18,.22,.28,.34,.44,.54,.65,.76,.83,.90,.935,.965,.985,1];
const hangingEdge=[
  [0,-.652,.105],[.145,-.652,.105],[.22,-.668,.286],[.34,-.676,.382],
  [.54,-.683,.456],[.76,-.665,.532],[.90,-.650,.565],[1,door992[0],door992[1]]
];
export function doorRibX(x,t){
  const [a,b]=door992;
  const warp=(edge,radius,col)=>smooth(1-Math.abs(x-edge)/radius)*(interpolate(hangingEdge,t,col)-edge);
  return x+warp(a,.235,1)+warp(b,.48,2);
}
// Rows follow the stock 992.1 cover: one continuous black front grille surround
// behind a painted upper nose. The lower front lip and the rear apron carry a
// separate narrow painted edge. The sport-exhaust outlets use the inboard pair.
const wrapSteps=4;
export function fascia992(r,front,paint,w,x,point,cap,flank,painted,sideHeights,outer){
  const sign=front?-1:1;
  const bands=y=>{
    const t=Math.abs(y)/w;
    if(front)return [
      .163+.018*t*t,.192+.017*t*t,.229+.012*t*t,
      .265+.002*t,.426+.026*t*t,.458+.028*t*t,cap(y)
    ];
    return [
      .202+.046*t*t,.236+.034*t*t,.294+.015*t*t,
      .413+.043*t*t,.451+.044*t*t,.524+.044*t*t,
      .673+.020*t*t, .733+.010*t*t,cap(y)
    ];
  };
  const fractions=front?[0,.19,.35,.443,.476,.53,.69,.82,.90,.95,.98,1]:
                         [0,.13,.235,.282,.37,.46,.59,.69,.76,.86,.93,.97,1];
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
    if(front){
      // Rounded upper and lower outside corners of the outboard radiator ducts.
      if(t>.9 && t<.99)dy=-s*.022*(k===5?1:k===2?.58:0);
      // The outside edge has to stay inboard of the return over its full
      // height. At the toe the side panel tucks in by several centimetres.
      if(t>.90){
        const sideWidth=Math.abs(flank(s,z)[1]);
        const margin=.019*smooth((cap(y)-z)/.10);
        dy-=s*Math.max(0,w-sideWidth+margin)*smooth((t-.90)/.10);
      }
    }else if(t>.86&&t<.98)dy=-s*.032*(k===4?1:k===1?.67:0);
    return point(y+dy,z,d);
  };
  // The sheet's nose tip is on the rolled bumper, just above the black grille.
  // A quarter-round section joins the almost vertical intake wall to the
  // sloping luggage compartment. The fascia shares its last row with the hood.
  const brow=(y,v)=>{
    const base=vertex(y,5),end=vertex(y,6);
    const angle=v*Math.PI/2,inset=1-Math.cos(angle),height=Math.sin(angle);
    const t=Math.abs(y)/w;
    return [mix(base[0],end[0],inset)-.006*Math.sin(Math.PI*v)*t,
      mix(base[1],end[1],v),mix(base[2],end[2],height)];
  };
  const below=front?2:1,above=front?5:4;
  function inside(t,k){
    if(k<=below||k>above)return false;
    return front?t<.443||(t>=.476&&t<.95):t>.282&&t<.93;
  }
  r.tag('shell.bumpers',()=>{
    for(let i=1;i<ys.length;i++){
      const a=ys[i-1],b=ys[i],t=Math.abs((a+b)/(w*2));
      for(let k=1;k<bands(a).length;k++){
        if(front&&k===6){
          for(const [v,q] of [[0,.57],[.57,1]]){
            const quad=[brow(a,v),brow(b,v),brow(b,q),brow(a,q)];
            painted(r,quad,paint,[-1,0,.24]);
          }
          continue;
        }
        const face=[vertex(a,k-1),vertex(b,k-1),vertex(b,k),vertex(a,k)];
        if(!inside(t,k)){
          const dark=front?(k===1||(k>2&&k<=5&&t<.95)):(k>1&&k<=4&&t<.93);
          if(dark)r.polygon(face,k===1?'#303539':'#25292b',false);
          else painted(r,face,paint,[sign,0,.24]);
          continue;
        }
        const depth=front?mix(.058,.016,smooth((t-.64)/.25)):.063;
        const back=[vertex(a,k-1,depth),vertex(b,k-1,depth),vertex(b,k,depth),vertex(a,k,depth)];
        r.polygon(back,front?'#171b1c':'#23272a',false);
        if(k===below+1)r.polygon([face[0],face[1],back[1],back[0]],'#474c4c',false);
        if(k===above)r.polygon([face[3],face[2],back[2],back[3]],'#23282b',false);
        for(const [yy,j,m] of [[a,0,3],[b,1,2]]){
          const eta=Math.abs(yy/w);
          const edges=front?[.443,.476,.95]:[.282,.93];
          if(edges.some(edge=>Math.abs(edge-eta)<.0001))r.polygon([face[j],face[m],back[m],back[j]],'#353a3b',false);
        }
        if(!front&&t<.69)continue; // Clearance around the sport tailpipe.
        const upper=front?(t>.476?.56:.23):.52;
        const lower=front?.010:.012;
        const zA=mix(bands(a)[k-1],bands(a)[k],upper),zB=mix(bands(b)[k-1],bands(b)[k],upper);
        if(front&&t<.443&&k===4)continue;
        const a0=point(a,zA,.022),b0=point(b,zB,.022);
        r.polygon([a0,b0,point(b,zB+lower,.025),point(a,zA+lower,.025)],front?'#393f41':'#353a3c',false);
        r.polygon([point(a,zA+lower,.025),point(b,zB+lower,.025),point(b,zB+lower+.004,.041),point(a,zA+lower+.004,.041)],'#565b5c',false);
      }
    }
    for(const s of [-1,1]){
      const row=bands(s*w);
      const stops=[...new Set([...row,...sideHeights.filter(z=>z>row[0]&&z<row.at(-1))])].sort((a,b)=>a-b);
      // Sample a point on the actual straight edge of each adjacent quad.
      const along=(heights,edge,h)=>{
        let j=1;
        while(j<heights.length-1&&heights[j]<h)j++;
        const a=edge(j-1),b=edge(j),t=bound((h-heights[j-1])/(heights[j]-heights[j-1]));
        return a.map((v,k)=>mix(v,b[k],t));
      };
      const corner=z=>along(row,k=>vertex(s*w,k),z);
      const side=z=>along(sideHeights,k=>flank(s,sideHeights[k]),z);
      // The cover wraps round onto the wing in a continuous radius. At each
      // height a Hermite curve leaves the flank along its own run and arrives
      // tangent to the bumper face, instead of one straight chord that leaves
      // a crease at both edges.
      const faceIn=z=>along(row,k=>vertex(s*w*.96,k),z);
      const curve=z=>{
        const p0=side(z),p1=corner(z),prev=flank.at?flank.at(s,z,-sign*.06):null;
        if(!prev)return [p0,p1];
        const unit=v=>{const l=Math.hypot(v[0],v[1])||1;return [v[0]/l,v[1]/l];};
        const chord=unit([p1[0]-p0[0],p1[1]-p0[1]]);
        // Keep each end tangent leaning along the chord. Where the wing's low
        // tuck pulls its last point back, its own run would fold the corner.
        const lean=v=>{
          const d=v[0]*chord[0]+v[1]*chord[1];
          if(d>=.35)return v;
          const w=(.35-d)/(1.35-d);
          return unit([mix(v[0],chord[0],w),mix(v[1],chord[1],w)]);
        };
        const inner=faceIn(z);
        const t0=lean(unit([p0[0]-prev[0],p0[1]-prev[1]])),t1=lean(unit([inner[0]-p1[0],inner[1]-p1[1]]));
        const span=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
        return Array.from({length:wrapSteps+1},(_,i)=>{
          const u=i/wrapSteps,u2=u*u,u3=u2*u;
          const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
          return [0,1].map(j=>h00*p0[j]+h10*span*t0[j]+h01*p1[j]+h11*span*t1[j]).concat(mix(p0[2],p1[2],u));
        });
      };
      for(let k=1;k<stops.length;k++){
        const a=curve(stops[k-1]),b=curve(stops[k]);
        for(let i=1;i<a.length;i++)painted(r,[b[i],a[i],a[i-1],b[i-1]],paint,[sign*.46,s,0]);
      }
    }
    const under=(p)=>[p[0]-sign*.064,p[1]*.970,p[2]+.008];
    for(let i=1;i<ys.length;i++){
      const a=vertex(ys[i-1],0),b=vertex(ys[i],0);
      r.polygon([a,b,under(b),under(a)],'#292e30',false);
    }
    // The undertray turns in ahead of the wheel opening. Close its side returns
    // so the dark edge cannot emerge through the painted lower quarter.
    for(const s of [-1,1]){
      const lip=vertex(s*w,0),bottom=flank(s,sideHeights[0]);
      const corner=flank(s,bands(s*w)[0]);
      painted(r,[lip,corner,bottom,under(lip)],paint,[sign*.2,s,-.3]);
    }
  });
  return {point,w,x};
}
