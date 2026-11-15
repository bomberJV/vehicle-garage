import {tint,strip} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';

const TAU=2*Math.PI;
// US 993, PET 905-10. The stop lamp is a fixed bridge with a visible gap to
// the grille, which is carried by the separately retracting spoiler behind it.
export function fixedStopLamp(r,car,paint,deck){
  r.tag('lights.high-stop',()=>{
    const stations=[-1,-.96,-.90,-.83,-.72,-.5,-.25,0,.25,.5,.72,.83,.90,.96,1];
    const section=u=>{
      const a=Math.abs(u),y=.557*u,x=1.316-.070*a*a;
      const base=deck(car,x,y)[2],end=Math.min(1,Math.max(0,(a-.81)/.19));
      const crown=base+.067-.035*end**1.45-.004*a*a,foot=base+.0008;
      // The moulded end feet descend from the slim transverse light housing.
      const lower=crown-.029-(crown-.029-foot)*end;
      return [[x-.029,y,lower],[x-.031,y,crown-.010],[x-.021,y,crown],[x+.022,y,crown-.002],[x+.031,y,crown-.008],[x+.033,y,crown-.024],[x+.021,y,lower],[x-.029,y,lower]];
    };
    const contours=stations.map(section);
    for(let i=1;i<contours.length;i++)for(let j=0;j<7;j++){
      const a=contours[i-1],b=contours[i],mid=(stations[i-1]+stations[i])/2;
      const col=j===4&&Math.abs(mid)<.93?'#9b292f':tint(paint,[.68,.86,1.10,.96,.81,.67,.59][j]);
      r.polygon([a[j],b[j],b[j+1],a[j+1]],col,false);
    }
    for(const end of [contours[0],contours.at(-1)])r.polygon(end.slice(0,-1),tint(paint,.79),false);
  });
}

// Two black headlamp cleaning nozzles appear just forward of the glass on
// US cars with the washer system (PET 904-20). Sample the fender slope at each foot.
export function washerNozzle(r,car,side,deck){
  const ring=(rx,ry,lift)=>Array.from({length:11},(_,i)=>{
    const a=TAU*i/10,p=deck(car,-2.028+rx*Math.cos(a),side*(.624+ry*Math.sin(a)));
    return [p[0],p[1],p[2]+lift];
  });
  const base=ring(.016,.012,.0009),rim=ring(.014,.010,.0095),tip=ring(.006,.006,.015);
  strip(r,base,rim,'#343738');strip(r,rim,tip,'#535657');r.polygon(tip.slice(0,-1),'#343738',false);
}

// The 993 cabriolet's door glass rises against the sewn side of the hood.
// Behind the rear edge of this glass there is a solid cloth sail on each side.
export function hoodSide993(r,car,side,rows,point,fabric){
  const edge=rows.map(row=>point(row,side));
  const sill=x=>[x,side*(.624+.014*Math.max(0,x)),car.belt+.011+.012*Math.max(0,x)];
  const foot=[car.screen[0]+car.screenFootSweep,side*car.screen[3],car.belt+.008];
  const jamb=sill(car.door[1]+.010);
  const sidepoints=[foot,sill(edge[1][0]),sill(edge[2][0]),jamb];
  for(let i=1;i<=3;i++){
    glazingFace(r,[sidepoints[i-1],edge[i-1],edge[i],sidepoints[i]],'#8ca2ab',.21);
    r.faces.at(-1).roofServicePart='cabin.windshield';
  }
  for(let i=3;i<rows.length-1;i++){
    const a=i===3?jamb:sill(edge[i][0]);
    r.polygon([a,edge[i],edge[i+1],sill(edge[i+1][0])],tint(fabric,.80+.054*(i-3)),false);
  }
  const seal=[jamb,edge[3]],weather=seal.map(([x,y,z])=>[x+.010,y+side*.0008,z]);
  strip(r,seal,weather,'#343637');
  strip(r,edge,edge.map(([x,y,z])=>[x,y-side*.009,z+.004]),'#434345');
}

// The sewn flexible back window has pinched upper corners and broad rounded
// shoulders. Remap the two window boundary stations without changing roof widths.
export function backlightU993(row,u){
  const limits=[.68,.68,.68,.68,.56,.746,.756,.635,.68],b=limits[row],v=Math.abs(u);
  return Math.sign(u)*(v<=.68?v*b/.68:b+(v-.68)*(1-b)/.32);
}

// The painted bumper steps down around the common lamp pocket. Heights are
// shared with its mesh so the surround follows the curvature at the outer tip.
export function classicSignalPocket(u,cap){
  const tip=Math.max(0,Math.min(1,(u-.944)/.043));
  return [.391+.007*tip,.466-.009*tip].map((h,i)=>i===1?Math.min(h,cap-.005):h);
}
export function frontSignals993(r,side,nose){
  const p=(u,z,d)=>nose.point(side*nose.w*u,z,d);
  function module(lo,hi,color,amber,tag){
    r.tag(tag,()=>{
      const count=14;
      const face=(t,v,inset=0)=>{
        const u=lo+(hi-lo)*t,[bottom,top]=classicSignalPocket(u,nose.cap(side*nose.w*u));
        const rounded=(1-Math.min(1,Math.sin(Math.PI*t)*4.5))*(amber?.006:.012);
        const z=bottom+.003+rounded+v*(top-bottom-.006-2*rounded);
        const dome=Math.sin(Math.PI*t)**.7*Math.sin(Math.PI*v);
        return p(u,z,.005-.006*dome+inset);
      };
      // Sheet-metal pocket, rear shell, compressible gasket and optical face
      // occupy separate depths. Low and high ribs follow the same curved face.
      const perimeter=Array.from({length:count+1},(_,j)=>[j/count,0])
        .concat(Array.from({length:count+1},(_,j)=>[1-j/count,1]),[[0,0]]);
      const front=perimeter.map(([t,v])=>face(t,v)),back=perimeter.map(([t,v])=>face(t,v,.031));
      strip(r,front,back,'#424343');
      const layout=[0,.09,.24,.48,.70,.89,1],base=amber?'#af642b':'#9ca39f';
      for(let j=1;j<=count;j++){
        const l=(j-1)/count,h=j/count;
        for(let k=1;k<layout.length;k++){
          const low=layout[k-1],high=layout[k],t=(l+h)*.5;
          const edge=j===1||j===count, shade=[0,.75,.88,1.04,.97,1.13,.72][k];
          r.polygon([face(l,low),face(h,low),face(h,high),face(l,high)],
            tint(edge?base:color,shade*(.91+.09*Math.sin(t*Math.PI))),false);
        }
        if(j>1&&j<count){
          const center=(l+h)*.5,w=amber?.007:.009;
          const rib=(t,v)=>face(t,v,-.0009);
          r.polygon([rib(center,.13),rib(center+w,.15),rib(center+w,.84),rib(center,.86)],amber?'#c98a47':'#a5aaa0',false);
        }
      }
    });
  }
  module(.442,.759,'#c6c8b8',false,side<0?'lights.fog-left':'lights.fog-right');
  module(.819,.984,'#d08536',true,'lights.indicators');
  r.tag('shell.bumpers',()=>{
    const profile=[[.753,.397,.001],[.761,.385,.013],[.811,.385,.013],[.820,.394,.013],[.820,.469,.013],[.809,.481,.009],[.765,.481,.009],[.753,.470,.009]];
    const base=profile.map(([u,z])=>p(u,z,.017)),front=profile.map(([u,z,d])=>p(u,z,-d));
    r.polygon(front,'#38393a',false);
    for(let i=0;i<base.length;i++){const j=(i+1)%base.length;r.polygon([base[i],base[j],front[j],front[i]],i===5?'#555554':'#2d3030',false);}
  });
}

export function rearOptics993(r,row){
  // The clear rectangles occupy the outer ends of the centre reflector; seams
  // and refractor lines distinguish the separate red combination lamp housings.
  for(let j=0;j<8;j++){
    const a=.588+j*.012,b=a+.012;
    r.polygon([row(a,.29,-.003),row(b,.29,-.003),row(b,.72,-.003),row(a,.72,-.003)],j%2?'#ddd7c6':'#cfcabc',false);
  }
  const vertical=(a,b,color)=>r.polygon([row(a,.015,-.002),row(b,.015,-.002),row(b,.992,-.002),row(a,.992,-.002)],color,false);
  vertical(.715,.719,'#5c3234');
  for(let i=0;i<16;i++){const a=.727+i*.008;vertical(a,a+.0017,'#bd4649');}
  vertical(.864,.869,'#74393d');
}

// Plan stations traced on Porsche Classic 993 Cabriolet, rescue sheet p. 32.
// The mounting lip measures wider toward the nose than the clear inner lens.
const lensOutline=[[58.7,62],[60.4,54],[64.0,48.8],[69.0,46.0],[74.4,47.3],[78.4,51.4],[81.0,58.0],[82.0,66.7],[80.4,73.6],[77.5,78.5],[73.3,81.1],[68.1,80.1],[63.3,76.0],[60.4,70.0]];
const lipOutline=[[51.4,62.4],[54.5,53.5],[60.4,46.7],[68.0,42.5],[75.8,43.6],[82.2,49.1],[86.2,57.4],[88.5,67.6],[87.0,75.6],[83.1,81.4],[76.6,85.0],[67.1,85.1],[58.4,81.0],[53.3,74.0]];
function contourAt(outline,t){
  const n=outline.length,index=t*n,i=Math.floor(index)%n,j=index-Math.floor(index);
  const a=outline[(i+n-1)%n],b=outline[i],c=outline[(i+1)%n],d=outline[(i+2)%n];
  return b.map((v,k)=>.5*(2*v+(-a[k]+c[k])*j+(2*a[k]-5*v+4*c[k]-d[k])*j*j+(-a[k]+3*v-3*c[k]+d[k])*j*j*j));
}
const planScale=2.272/372;
const lampCenter=[-1.16+(70.6-175)*planScale,(156-63.5)*planScale];
const lampPlane=(x,y)=>.665+.87*(x-lampCenter[0])-.09*(Math.abs(y)-lampCenter[1]);
// The outer lens sits in a recessed fender stamping. The seat uses the same
// wheelbase-scaled plan as the lens so the shoulder cannot obscure its glass.
export function headlampSeat993(point){
  const [x,y,z]=point,dx=(x-lampCenter[0])/.091,dy=(Math.abs(y)-lampCenter[1])/.129,d=dx*dx+dy*dy;
  if(d>=1.88)return point;
  const t=Math.max(0,Math.min(1,(1.88-d)/.89));
  return [x,y,z+Math.min(0,lampPlane(x,y)-.008-z)*t*t*(3-2*t)];
}
export function headlamp993(r,car,s,paint,deck,litronic=false){
  const px=planScale,center=[70.6,63.5];
  // Authored vehicle deck stations precede the sweep into the bumper corners.
  // Recover the originating deck station for the traced point on the plan.
  const surface=(u,v,height,followDeck=false)=>{
    const target=-1.16+(u-175)*px,y=s*(156-v)*px;
    if(!followDeck)return [target,y,lampPlane(target,y)+height];
    let x=target;
    for(let i=0;i<6;i++)x+=target-deck(car,x,y)[0];
    const p=deck(car,x,y);return [target,y,p[2]+height];
  };
  const sample=(t,k,lift,outline=lensOutline)=>{
    const [u,v]=contourAt(outline,t);
    return surface(center[0]+k*(u-center[0]),center[1]+k*(v-center[1]),lift+.006*Math.max(0,1-k*k),outline===lipOutline);
  };
  const n=40,ring=(k,height,outline)=>Array.from({length:n+1},(_,i)=>sample(i/n,k,height,outline));
  const bright=ring(.970,.0052),bezel=ring(1.018,.0028),lip=ring(1,.001,lipOutline);
  strip(r,lip,bezel,tint(paint,.99));strip(r,bezel,bright,'#444748');
  strip(r,bright,ring(.928,.0064),'#e1e2dd');
  // The glass is a shallow dome over two optical chambers. Concentric glass
  // contours stay inside the traced opening and leave a real retaining seal.
  const outer=ring(.928,.0067),mid=ring(.61,.015),inner=ring(.22,.021);
  const rows=[outer,mid,inner];
  for(let k=1;k<rows.length;k++)for(let i=1;i<=n;i++){
    const a=rows[k-1],b=rows[k],angle=TAU*(i-.5)/n;
    r.polygon([a[i-1],a[i],b[i],b[i-1]],tint('#b7b9b5',.78+.30*Math.cos(angle-.25)+.07*k),false);
  }
  r.polygon(inner.slice(0,-1),'#c5c6c0',false);
  const optic=(u,v,rx,ry,lift)=>Array.from({length:25},(_,i)=>surface(u+rx*Math.cos(TAU*i/24),v+ry*Math.sin(TAU*i/24),lift));
  if(litronic){
    // The xenon low beam has a deep projector bowl, optical lens and bright retaining ring.
    const housing=optic(74.4,62.2,5.2,7.2,.0225),bezel=optic(74.4,62.2,4.8,6.6,.0237);
    const lens=optic(74.4,62.2,3.9,5.5,.0252),crown=optic(74.4,62.2,2.3,3.2,.027);
    strip(r,housing,bezel,'#454c50');strip(r,bezel,lens,'#c2cac9');
    strip(r,lens,crown,'#718390');r.polygon(crown.slice(0,-1),'#98a9b0',false);
    r.polygon(optic(74.9,61.4,1.0,1.6,.028).slice(0,-1),'#dae2df',false);
  }else{
    const shell=optic(74.4,62.2,4.5,6.1,.0215),rim=optic(74.4,62.2,3.8,5.3,.023),glass=optic(74.4,62.2,3.2,4.5,.0245);
    strip(r,shell,rim,'#a9aba6');strip(r,rim,glass,'#dcddd5');
    r.polygon(glass.slice(0,-1),'#7b817f',false);
    const glint=optic(74.8,61.4,1.8,2.6,.0255);r.polygon(glint.slice(0,-1),'#969d9a',false);
  }
  for(let i=0;i<13;i++){
    const v=48.8+i*2.23,spread=Math.sqrt(Math.max(0,1-((v-63.3)/17.1)**2));
    const x1=70.5-10.3*spread,x2=Math.min(70.7,70.5+10.3*spread);
    if(x2-x1<1)continue;
    const line=[surface(x1,v,.012),surface((x1+x2)*.5,v+.3,.0207),surface(x2,v+.6,.0233)];
    strip(r,line,line.map(([x,y,z])=>[x,y+s*.0015,z+.0006]),i%3?'#c9ccc6':'#e4e6de');
  }
}

// The 993 aero mirror has a body-colour pedestal and an angled, flat lower
// return. The inboard chin flows into the pedestal; the outer crown is higher.
export function classicMirror(r,foot,side,paint){
  const [x,y,z]=foot;
  const xy=(dx,dy,h)=>[x+dx,y+side*dy,z+h];
  const sole=[[-.069,.004],[-.05,-.014],[.018,-.015],[.052,-.005],[.057,.011],[.026,.029],[-.042,.031],[-.068,.019],[-.069,.004]];
  const rings=[[1,0,0,.001],[.97,0,.002,.006],[.76,.007,.024,.021],[.61,.018,.058,.032],[.68,.013,.089,.039]]
    .map(([k,dx,dy,h])=>sole.map(([a,b])=>xy(dx+k*a,dy+k*b,h)));
  for(let i=1;i<rings.length;i++)strip(r,rings[i-1],rings[i],i===1?'#383b3c':tint(paint,.65+.09*i));
  const center=[x-.004,y+side*.141,z+.067];
  // Transverse silhouette, starting at the inboard lower corner. Flattened
  // underside and swept outer end are particularly visible from the nose.
  const outline=[[-.99,-.40],[-.78,-.63],[-.27,-.73],[.39,-.68],[.73,-.50],[.93,-.18],[1,.15],[.94,.47],[.71,.74],[.30,.93],[-.09,1],[-.46,.92],[-.72,.68],[-.89,.32],[-.99,-.04],[-.99,-.40]];
  const curve=(dx,k,shiftY,shiftZ)=>outline.map(([u,v])=>[center[0]+dx+.012*u,
    center[1]+side*(.105*k*u+shiftY),center[2]+.055*k*v+shiftZ]);
  const sections=[curve(-.087,.12,-.030,-.008),curve(-.078,.53,-.021,-.005),curve(-.052,.84,-.012,-.002),curve(-.012,1,0,0),
    curve(.034,1.02,.001,0),curve(.047,1,0,0),curve(.053,.98,0,0),curve(.051,.89,-.001,0)];
  for(let i=1;i<sections.length;i++)for(let j=0;j<outline.length-1;j++){
    const t=(outline[j][1]+outline[j+1][1])*.5;
    const shade=.82+.20*t+.028*i;
    r.polygon([sections[i-1][j],sections[i][j],sections[i][j+1],sections[i-1][j+1]],
      i>=6?'#353a3c':tint(paint,shade),false);
  }
  r.polygon(sections.at(-1).slice(0,-1),'#819096',false);
}

export function classicBodyTrim(r,car,paint,deck,tail,skin){
  // The round fuel flap is flush with the upper left wing. Its painted center
  // is the surrounding wing itself, so the shut line follows the wing crown.
  r.tag('shell.fenders',()=>{
    const loop=(k)=>Array.from({length:45},(_,i)=>{
      const a=TAU*i/44,x=-.946+.067*k*Math.cos(a),y=-.687+.050*k*Math.sin(a);
      const p=deck(car,x,y);p[2]+=.002;return p;
    });
    strip(r,loop(.96),loop(1),tint(paint,.49));
    for(const side of [-1,1]){
      // The rolled rocker cover has a shadow joint and a body-colour return.
      const path=[[-.788,.18],[-.723,.162],[-.62,.157],[-.28,.155],[.18,.155],[.54,.157],[.666,.167],[.735,.188]];
      const row=(t,over)=>path.map(([x,fade],i)=>{
        const p=skin(car,x,t+fade-.15,side),tip=Math.sin(i*Math.PI/(path.length-1));
        p[1]+=side*over*tip;return p;
      });
      strip(r,row(.13,.004),row(.121,.009),tint(paint,.55));
      strip(r,row(.121,.009),row(.084,.020),tint(paint,1.04));
      strip(r,row(.084,.020),row(.025,.017),tint(paint,.79));
      strip(r,row(.025,.017),row(.004,.004),tint(paint,.62));
    }
  });
  r.tag('shell.bumpers',()=>{
    // Rear cover rolls over the license recess. Split the highlight at the US
    // impact guards and pick it up around each curved rear quarter.
    for(const side of [-1,1]){
      const row=(z,d)=>Array.from({length:23},(_,i)=>tail(side*(.269+.387*i/22),z+.011*(i/22)**2,d));
      strip(r,row(.424,-.0005),row(.430,-.001),tint(paint,1.12));
    }
  });
}

// Rear lid emblem, Porsche Classic PET 810-00. A continuous fitted script
// follows the slope of the fixed deck beneath the retracting grille.
export function classicDeckScript(r,car,deck){
  const letters=[
    [1.42,[[1.49,.92],[1.24,1],[.87,.95],[.51,.77],[.24,.49],[.07,.21],[.10,.055],[.33,0],[.73,.07],[1.12,.25],[1.42,.44]]],
    [.92,[[.96,.43],[.70,.52],[.43,.45],[.18,.29],[.08,.13],[.18,.04],[.38,.08],[.70,.34],[.86,.48],[.62,.12],[.66,.045],[.90,.14],[1.05,.26]]],
    [.79,[[0,.13],[.26,.37],[.39,.55],[.61,.53],[.72,.45],[.46,.29],[.26,.08],[.34,.04],[.58,.15],[.84,.31]]],
    [.79,[[0,.13],[.26,.37],[.39,.55],[.61,.53],[.72,.45],[.46,.29],[.26,.08],[.34,.04],[.58,.15],[.84,.31]]],
    [.82,[[.01,.16],[.45,.34],[.62,.48],[.52,.54],[.32,.49],[.13,.32],[.09,.17],[.14,.07],[.33,.045],[.64,.15],[.91,.34]]],
    [.79,[[0,.13],[.26,.37],[.39,.55],[.61,.53],[.72,.45],[.46,.29],[.26,.08],[.34,.04],[.58,.15],[.84,.31]]],
    [1.05,[[.96,.43],[.70,.52],[.43,.45],[.18,.29],[.08,.13],[.18,.04],[.38,.08],[.70,.34],[.86,.48],[.63,.12],[.68,.05],[.96,.15],[1.16,.27]]]
  ];
  let start=0;
  const points=[],indices=[];
  for(const [advance,stroke] of letters){
    const path=stroke.map(([u,v])=>[1.983-v*.046,.084-(start+u)*.025]);
    for(let j=0;j<path.length;j++){
      const [x,y]=path[j],prev=path[Math.max(0,j-1)],next=path[Math.min(j+1,path.length-1)];
      const dx=next[0]-prev[0],dy=next[1]-prev[1],w=.0023/Math.hypot(dx,dy);
      for(const s of [-1,1]){
        const q=deck(car,x+s*w*dy,y-s*w*dx);q[2]+=.0030;points.push(q);
      }
      if(j){
        const n=points.length;
        indices.push(n-4,n-3,n-1,n-4,n-1,n-2);
      }
    }
    start+=advance;
  }
  r.polygon(points,'#343734',false);r.faces.at(-1).triangles=indices;
}
