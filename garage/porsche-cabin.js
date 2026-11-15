import {raisedTop} from './porsche-raised-top.js';
import {glazingFace} from './surface-materials.js';
import {pipe, strip, tint, ellipsoid, ellipse} from './road-primitives.js';

const TAU=2*Math.PI,mix=(a,b,t)=>a+(b-a)*t;
function dashDisc(r,origin,u,v,color,n){
  r.polygon(Array.from({length:n},(_,i)=>origin.map((x,j)=>x+u[j]*Math.cos(i*TAU/n)+v[j]*Math.sin(i*TAU/n))),color,false);
}
function seat(r,x,y,modern){
  const color=modern?'#6e6154':'#aa9580',edge=modern?'#958474':'#c3ae99';
  // Contour sections form two lateral bolsters and the recessed seating surface.
  const widths=[-1,-.90,-.74,-.52,0,.52,.74,.90,1],
    bulge=[0,.027,.044,.013,.001,.013,.044,.027,0];
  const cushion=[[-.295,.092,.487],[-.243,.178,.525],[-.155,.209,.547],
    [.005,.218,.514],[.12,.201,.519],[.17,.16,.546]];
  const seatPoint=(row,i)=>[x+row[0],y+row[1]*widths[i],row[2]+bulge[i]];
  for(let j=1;j<cushion.length;j++){
    const a=cushion[j-1],b=cushion[j];
    for(let k=1;k<widths.length;k++)r.polygon([seatPoint(a,k-1),seatPoint(a,k),seatPoint(b,k),seatPoint(b,k-1)],tint(color,.87+.075*Math.cos((k-1)*Math.PI/4)),false);
    for(const i of [0,8]){const pa=seatPoint(a,i),pb=seatPoint(b,i);r.polygon([pa,pb,[pb[0],pb[1],.454],[pa[0],pa[1],.454]],tint(color,.68),false);}
  }
  const head=modern?1.075:1.033;
  const sections=[[.51,.164,.113,.15],[.571,.204,.108,.174],[.66,.216,.122,.197],
    [.78,.211,.146,.214],[.855,.194,.163,.224],[.907,.155,.179,.245],
    [.938,.101,.19,.253],[head-.056,.102,.210,.281],[head-.016,.091,.224,.28],[head,.057,.239,.267]];
  const point=(row,i,rear=false)=>{const [z,w,front,back]=row,
    pad=(z>.935?.009:.060)*Math.sin(Math.abs(widths[i])*Math.PI*.59)**3;
    return [x+(rear?back-.019*Math.abs(widths[i]):front-pad),y+w*widths[i],z];};
  for(let j=1;j<sections.length;j++)for(let k=1;k<widths.length;k++){
    const a=sections[j-1],b=sections[j];
    r.polygon([point(a,k-1),point(a,k),point(b,k),point(b,k-1)],tint(color,.96+.054*Math.cos(k*1.2)),false);
    if(k===4||k===8)r.polygon([point(a,k-4,true),point(a,k,true),point(b,k,true),point(b,k-4,true)],tint(color,.76),false);
    if(k===1 || k===8){const i=k===1?0:8;
      r.polygon([point(a,i),point(a,i,true),point(b,i,true),point(b,i)],tint(color,.76),false);
    }
  }
  const end=sections.at(-1);
  r.polygon([point(end,0),point(end,8),point(end,8,true),point(end,0,true)],color,false);
  for(const i of [3,5]){const seam=sections.slice(1,6).map(row=>{const p=point(row,i);p[0]-=.002;return p;});strip(r,seam,seam.map(([x,y,z])=>[x,y+.004,z]),edge);}
  for(const k of [2,3,4]){
    const row=sections[k],seam=[-.51,0,.51].map(t=>[x+row[2]-.006-.024*Math.abs(t),y+t*row[1],row[0]]);strip(r,seam,seam.map(([x,y,z])=>[x,y,z+.004]),tint(color,.68));
  }
  const ry=y*.93;
  ellipsoid(r,[.538,ry,.603],[.159,.186,.066],color,14,6);
  r.profile([[.56,.627],[.61,.628],[.715,.828],[.665,.83]],ry-.147,ry+.147,tint(color,.84));
}
function glass(r,car,paint){
  const modern=car.modern,[x0,x1,h,w0,w1]=car.screen,base=car.belt+.002;
  const n=16,vsteps=5;
  // Centre of the bowed glazing leads the A-pillar feet by several centimetres.
  const p=(u,v,lift=0)=>[mix(x0,x1,v)+u*u*mix(car.screenFootSweep,car.screenHeaderSweep,v)-.019*Math.sin(Math.PI*v)*(1-u*u)-lift,
    u*mix(w0,w1,v),mix(base,h,v)-u*u*mix(.012,.037,v)+(modern?0:(.083-.065*u*u)*(1-v))+lift*.5];
  const row=v=>Array.from({length:n+1},(_,i)=>p(i/n*2-1,v));
  for(let j=0;j<vsteps;j++)for(let i=0;i<n;i++){
    const u=i/n*2-1,t=(i+1)/n*2-1,v=j/vsteps,w=(j+1)/vsteps;
    glazingFace(r,[p(u,v),p(t,v),p(t,w),p(u,w)],tint('#92abb6',.96+.08*v-.025*u),.20+.04*v+.025*u*u);
  }
  // Ceramic frit and painted header sit outside the clear opening.
  for(const s of [-1,1]){
    for(let j=0;j<vsteps;j++){
      const a=j/vsteps,b=(j+1)/vsteps;
      r.polygon([p(s*.954,a,.001),p(s,a,.001),p(s,b,.001),p(s*.954,b,.001)],'#303537',false);
      const inset=(v,k)=>{const q=p(s,v);return [q[0]+.012*(1-k),q[1]+s*.022*k,q[2]+.012*k];};
      r.polygon([inset(a,0),inset(b,0),inset(b,1),inset(a,1)],tint(paint,1.11),false);
      pipe(r,[inset(a,1),inset(b,1)],.013,paint,8);
    }
  }
  for (const [a,b,c] of [[.923,1,'#303639'],[0,.048,'#303639']])strip(r,row(a).map(([x,y,z])=>[x-.002,y,z+.001]),row(b).map(([x,y,z])=>[x-.002,y,z+.001]),c);
  for(const [v,thick,mat] of [[1,.016,modern?'#404448':paint],[0,.014,'#373c3f']]){
    const front=row(v),back=front.map(([x,y,z])=>[x+thick,y,z+thick*.55]);
    strip(r,front,back,mat);
    strip(r,back,back.map(([x,y,z])=>[x+.005,y,z-thick*1.22]),'#42464a');
  }
  for(const [s,off] of [[-1,-.09],[1,-.03]]){
    const blade=[p(s*.035,.068,.009),p(s*.36,.062,.010),p(s*.73,.073,.009)];
    pipe(r,blade,.006,'#24292e',6);pipe(r,[p(s*.71+off,0,.014),blade[1]],.008,'#3c4448',6);
  }
  const center=p(0,.942);pipe(r,[center,[center[0]+.039,0,center[2]-.054]],.009,'#37383a',7);
  ellipsoid(r,[center[0]+.045,0,center[2]-.062],[.024,.096,.032],'#343a3d',16,6);
}
function compartmentEdges(){
  const apron=Array.from({length:25},(_,i)=>{
    const a=i*Math.PI/24;
    return [.42+.41*Math.sin(a)**.70,.626*Math.cos(a),.885+.017*Math.sin(a)];
  });
  return {apron,inner:apron.map(([x,y,z])=>[x+.069,y*1.041,z+.016]),
    outer:apron.map(([x,y,z])=>[x+.09+.045*(1-Math.abs(y)/.626),y*1.061,z+.022])};
}
export function drawPorscheCompartmentLid(r,paint){
  const {inner,outer}=compartmentEdges();
  strip(r,inner,outer,paint);
  strip(r,outer,outer.map(([x,y,z])=>[x+.005,y,z+.001]),tint(paint,.65));
}
function softTop(r,car,paint){
  if(!car.modern){
    // Fitted boot wraps the lowered fabric stack in a U behind the rear seats.
    const path=[];
    for(let j=0;j<=24;j++){
      const a=j/24*Math.PI;
      path.push([.422+.342*Math.sin(a)**.55,.630*Math.cos(a)]);
    }
    const row=(i,k)=>{
      const [x,y]=path[i],a=i/24*Math.PI,s=Math.sin(Math.PI*k);
      const z=.84+.130*s+.011*Math.sin(a)+.016*Math.abs(Math.cos(a));
      return [x+.218*k*Math.sin(a),y+.085*k*Math.cos(a),z];
    };
    for(let i=1;i<path.length;i++)for(let j=1;j<=6;j++)r.polygon([row(i-1,(j-1)/6),row(i,(j-1)/6),row(i,j/6),row(i-1,j/6)],tint('#3e3d40',.76+.32*Math.sin(Math.PI*j/6)),false);
    for(const k of [.09,.91])strip(r,path.map((_,i)=>row(i,k)),path.map((_,i)=>row(i,k+.035)),'#555457');
    // The cover's open ends turn down at each door jamb. The visible studs sit
    // in the sloping outer skirt (PET plate 811-30, cover and press fasteners).
    for(const i of [0,24]){
      const end=Array.from({length:7},(_,j)=>row(i,j/6));
      r.polygon(end,'#424143',false);
    }
    for(const i of [1,4,8,12,16,20,23]){
      const a=Math.PI*i/24,[x,y,z]=row(i,.873);
      const v=[Math.sin(a),Math.cos(a),.48],u=[Math.cos(a),-Math.sin(a),0];
      const stud=Array.from({length:8},(_,j)=>{
        const t=j*TAU/8;return [x+.002*Math.sin(a)+u[0]*.0045*Math.cos(t)+v[0]*.002*Math.sin(t),
          y+.002*Math.cos(a)+u[1]*.0045*Math.cos(t)+v[1]*.002*Math.sin(t),z+.0040*Math.sin(t)];
      });
      r.polygon(stud,'#807e79',false);
    }
  }else{
    // The 992 top folds into a flush body-colour compartment around a dark apron.
    const {apron,inner}=compartmentEdges();
    strip(r,apron,inner,'#393a3b');
    const first=r.faces.length;
    drawPorscheCompartmentLid(r,paint);
    for(let i=first;i<r.faces.length;i++)r.faces[i].roofServicePart='roof.compartment-lid';
  }
}
function dash(r,car){
  const modern=car.modern,x=car.cockpit[0];
  const top=car.belt-.021;
  const panels=[];
  for(let j=0;j<=18;j++){
    const u=j/9-1;
    panels.push([[x+.12*u*u,u*.654,top-.013*u*u],[x+.216-.018*u*u,u*.658,top+.008*(1-u*u)],[x+.271,u*.637,top-.028],[x+.257,u*.619,top-.125]]);
  }
  for(let i=1;i<panels.length;i++)for(let k=1;k<4;k++)r.polygon([panels[i-1][k-1],panels[i][k-1],panels[i][k],panels[i-1][k]],['#424447','#484a4c','#393b3c'][k-1],false);
  const dsx=x+.264,dsz=top+.015,dy=-.335;
  ellipsoid(r,[dsx-.056,dy,dsz],[.116,.216,.072],'#393d40',14,5);
  for(let i=-2;i<=2;i++){
    const rad=i===0?.047:.036,cy=dy+i*.079;
    // Rear-facing instruments have finite clearance from the crash pad.
    const c=[dsx+.033-.018*Math.abs(i),cy,dsz+.010-.010*Math.abs(i)];
    dashDisc(r,c,[0,rad,0],[-.006,0,rad],'#33383a',18);
    const ring=[c[0]+.002,c[1],c[2]];
    ellipse(r,ring,[0,rad,0],[-.006,0,rad],1,.91,'#abb0ae',18);
    const needle=[c[0]+.004,c[1],c[2]];r.rod(needle,[needle[0],cy-.012,c[2]+.025],.002,'#e1a87d',5);
  }
  const steering=[x+.391,-.327,.799],u=[0,.151,0],v=[.045,0,.143];
  ellipse(r,steering,u,v,1,.853,'#24272a',40);
  for(const a of [.14,Math.PI-.14,Math.PI*1.5])r.rod(steering,steering.map((p,i)=>p+.93*(u[i]*Math.cos(a)+v[i]*Math.sin(a))),modern?.014:.025,'#45474a',7);
  ellipsoid(r,steering,modern?[.032,.064,.053]:[.036,.092,.050],'#393a3c',12,5);
  r.box(-.359,-.098,.43,.38,.098,.565,'#494742');
  r.profile([[-.335,.56],[-.33,.612],[-.08,.625],[.022,.590],[.30,.575],[.33,.55]],-.091,.091,'#51504e');
  ellipsoid(r,[-.108,0,.619],[.079,.062,.038],'#323233',12,4);
  pipe(r,[[-.108,0,.624],[-.111,0,.688],[-.124,0,.703]],.010,'#9a9c98',8);
  ellipsoid(r,[-.124,0,.711],[.029,.027,.036],modern?'#343638':'#5a4c41',12,5);
  if(modern){
    r.box(dsx+.019,-.071,top-.084,dsx+.023,.190,top+.01,'#2e3639');
    r.box(dsx+.025,-.054,top-.071,dsx+.028,.176,top,'#526367');
  }else{
    for(const yy of [-.072,.030,.134])r.box(dsx+.018,yy-.036,top-.079,dsx+.02,yy+.036,top-.045,'#293033');
  }
}
function flooring(r,car){
  const carpet=car.modern?'#42423f':'#796e60',mats=car.modern?'#515048':'#958774';
  r.box(-.57,-.609,.396,.65,.609,.420,carpet);
  for(const s of [-1,1]){
    const outline=[[-.41,.13],[-.49,.18],[-.463,.507],[-.377,.56],[.177,.53],[.212,.37],[.172,.151]];
    const mat=outline.map(([x,y])=>[x,s*y,.424+.051*Math.max(0,-x-.28)]);
    r.polygon(mat,mats,false);const edge=[...mat,mat[0]];
    strip(r,edge,edge.map(([x,y,z])=>[x*.994,y*.994,z+.001]),tint(mats,.67));
    if(s<0)for(let k=0;k<8;k++){const y=-.451+k*.023;r.polygon([[-.384,y,.432],[-.274,y,.432],[-.274,y+.013,.432],[-.384,y+.013,.432]],'#514d46',false);}
    for(const y of [.13,.50])r.box(-.20,s*y-.012,.425,.233,s*y+.012,.452,'#373a3a');
  }
}
export function drawCabrioletCabin(r,car,paint){
  r.tag('cabin.windshield',()=>glass(r,car,paint));
  r.tag('cabin.top',()=>r.build?.roofPosition==='up'?raisedTop(r,car):softTop(r,car,paint));
  r.tag('cabin.seats',()=>{for(const s of [-1,1])seat(r,car.modern?.047:.013,s*(car.modern?.356:.336),car.modern);});
  r.tag('cabin.controls',()=>dash(r,car));
  r.tag('cabin.carpet',()=>flooring(r,car));
}
