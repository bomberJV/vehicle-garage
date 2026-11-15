import {tint} from './road-primitives.js';

const TAU=Math.PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
function ribbon(r,a,b,color){
  const points=[...a,...b],triangles=[],n=a.length;
  for(let i=1;i<n;i++)triangles.push(i-1,i,n+i,n+i,n+i-1,i-1);
  r.polygon(points,color,false);
  r.faces.at(-1).triangles=triangles;
}
const ring=(n,point)=>Array.from({length:n+1},(_,i)=>point(TAU*i/n));

// Plan perimeter digitized from Porsche's 911 Cabriolet rescue sheet (2019 onward).
// Pixel positions refer to a 4x crop of PDF coordinates x=65..145, y=250..304.
const lampTrace=[[114,132],[123,110],[142,85],[167,64],[194,51],[219,46],[242,48],[262,56],[274,69],[278,84],[274,101],[262,120],[242,136],[218,147],[195,154],[169,157],[146,156],[127,151],[117,143]];
function lampContour(){
  const path=[],n=lampTrace.length;
  for(let i=0;i<n;i++)for(let j=0;j<2;j++){
    const t=j/2,a=lampTrace[(i+n-1)%n],b=lampTrace[i],c=lampTrace[(i+1)%n],d=lampTrace[(i+2)%n];
    const [x,y]=b.map((v,k)=>.5*(2*v+(-a[k]+c[k])*t+(2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t));
    path.push([(65+x/4-168.4)/103.424-1.2,(346.8-250-y/4)/103.424]);
  }
  return [...path,path[0]];
}
const outline=lampContour(),cx=-1.735,cy=.686;
// Model the standard Bi-eLight housing in Porsche Service Information 9_46_20.
// The four small optics and the lower reflector differ from the optional matrix module.
export function draw992Headlamp(r,car,side,skin){
  const cache=new Map();
  function surface(x,y,dome){
    const key=x+','+y;
    if(!cache.has(key)){
      // The plan is in vehicle coordinates. Invert the swept fender's parameter x.
      let u=x;
      for(let i=0;i<7;i++)u+=x-skin(car,u,side*y)[0];
      cache.set(key,skin(car,u,side*y)[2]);
    }
    return [x,side*y,cache.get(key)+dome];
  }
  const contour=(scale,lift)=>outline.map(([x,y])=>surface(mix(cx,x,scale),mix(cy,y,scale),lift));
  const rings=[[1.009,.005],[1,.007],[.975,.0088],[.945,.0095],[.88,.0105],[.62,.014],[.33,.016],[0,.017]];
  const finishes=['#343b40','#20262b','#a3b2bd','#4f606b','#303e48','#445560','#52626d'];
  for(let i=1;i<rings.length;i++)ribbon(r,contour(...rings[i-1]),contour(...rings[i]),finishes[i-1]);
  const optic=(u,v,h)=>surface(cx+.155*v+.024*u,cy+.105*u+.034*v,h);
  const reflector=ring(26,a=>optic(.55*Math.cos(a),-.51+.19*Math.sin(a),.020));
  r.polygon(reflector.slice(0,-1),'#758691',false);
  for(let i=-4;i<=4;i++){
    const u=i*.098,rad=Math.sqrt(1-(u/.55)**2)*.135;
    r.polygon([optic(u-.009,-.51-rad,.0206),optic(u+.009,-.51-rad,.0206),optic(u+.009,-.51+rad,.0206),optic(u-.009,-.51+rad,.0206)],'#a2afb5',false);
  }
  const bezel=(rx,ry,lift)=>ring(28,a=>optic(rx*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.77,.22+ry*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.85,lift));
  ribbon(r,bezel(.465,.337,.0205),bezel(.404,.28,.022),'#7b8990');
  ribbon(r,bezel(.397,.274,.0223),bezel(.350,.235,.023),'#bac3c4');
  r.polygon(bezel(.347,.233,.0233).slice(0,-1),'#253948',false);
  const glint=Array.from({length:15},(_,i)=>{const a=.19+.95*Math.PI*i/14;return optic(.311*Math.cos(a),.226+.197*Math.sin(a),.0239);});
  ribbon(r,glint,glint.map(([x,y,z])=>[x-.0023,y,z]),'#607480');
  for(const u of [-.45,.45])for(const v of [-.12,.54]){
    const eye=(k,h)=>ring(14,a=>optic(u+.105*k*Math.cos(a),v+.113*k*Math.sin(a),h));
    ribbon(r,eye(1,.024),eye(.77,.025),'#a4adae');
    r.polygon(eye(.75,.0255).slice(0,-1),'#d4d9d2',false);
  }
}

// The narrow signal/position lens sits in a black recess along the upper
// edge of the outboard grille, with a clear outer cover and a silver guide.
export function draw992RunningLamp(r,s,nose){
  const n=16;
  const edge=(v,t,depth)=>{
    const w=Math.sin(Math.PI*t)**.42;
    const y=s*nose.w*mix(.504,.951,t);
    const height=.460+.023*t*t+.008*t;
    return nose.point(y,height+v*w,depth);
  };
  for(const [a,b,depth,color] of [[-.014,.012,-.002,'#252d31'],[-.007,.006,-.0035,'#74828a'],[-.002,.004,-.0045,'#c5d1d1']]){
    const line=h=>Array.from({length:n+1},(_,i)=>edge(h,i/n,depth));
    ribbon(r,line(a),line(b),color);
  }
}

// The centre guide stays thin while the separate left/right lamp housings deepen at the corners.
export function draw992Tail(r,point){
  const stations=[0,.18,.36,.52,.60,.67,.72,.77,.81,.84,.86,.88,.90,.92,.94,.96,.98,1];
  const row=(fn,depth=0)=>stations.map(t=>point(t,fn(t),depth));
  const ease=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a)));
  const housing=t=>-1.55-.16*ease(.38,.65,t)+.96*ease(.84,1,t);
  ribbon(r,row(housing,.003),row(()=>1.10,.003),'#292d33');
  ribbon(r,row(housing,-.0005),row(()=>.12,-.0005),'#34363d');
  ribbon(r,row(t=>.13+.56*ease(.81,1,t),-.001),row(()=>.785,-.001),'#9d2939');
  ribbon(r,row(t=>.775+.09*ease(.86,1,t),-.0018),row(()=>.985,-.0018),'#df5558');
  const intervals=[.655,.680,.703,.727,.751,.775,.800,.825,.841,.853];
  for(let i=1;i<intervals.length;i++){
    const a=intervals[i-1],b=intervals[i];
    r.polygon([point(a,-.58,-.002),point(b-.002,-.52,-.002),point(b-.002,-.26,-.002),point(a,-.31,-.002)],'#70777c',false);
  }
}

// Separate raised letters on the dark shelf beneath the continuous light guide.
// Width and placement follow the factory Cabriolet rear elevation; stroke widths are fitted.
const rearLetters=[
  [[[0,0],[0,1],[.81,1],[1,.85],[1,.62],[.83,.5],[0,.5]]],
  [[[.17,0],[0,.16],[0,.82],[.18,1],[.83,1],[1,.84],[1,.16],[.83,0],[.17,0]]],
  [[[0,0],[0,1],[.80,1],[1,.85],[1,.63],[.85,.49],[0,.49]],[[.61,.49],[1,0]]],
  [[[1,1],[.16,1],[0,.83],[0,.65],[.16,.51],[.84,.51],[1,.35],[1,.15],[.85,0],[0,0]]],
  [[[1,1],[.17,1],[0,.83],[0,.17],[.17,0],[1,0]]],
  [[[0,0],[0,1]],[[1,0],[1,1]],[[0,.51],[1,.51]]],
  [[[1,1],[0,1],[0,0],[1,0]],[[0,.51],[.87,.51]]]
];
export function draw992Nameplate(r,tail){
  const points=[],indices=[];
  for(let letter=0;letter<rearLetters.length;letter++){
    const from=.208-letter*.063;
    for(const path of rearLetters[letter])for(let i=1;i<path.length;i++){
      const [a,b]=[path[i-1],path[i]].map(([u,v])=>[from-u*.038,.708+v*.0155]);
      const dy=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dy,dz);
      const normal=[-dz/length*.00145,dy/length*.00145];
      const vertex=([y,z],s)=>tail(y+s*normal[0],z+s*normal[1],-.0114);
      const start=points.length;
      points.push(vertex(a,-1),vertex(b,-1),vertex(b,1),vertex(a,1));
      indices.push(start,start+1,start+2,start,start+2,start+3);
    }
  }
  r.polygon(points,'#a6a7a1',false);r.faces.at(-1).triangles=indices;
}

export function draw992Mirror(r,center,side,paint){
  const [x,y,z]=center;
  // The lower bowl and neck are black, with a body-colour lid and a rear-facing glass.
  const profile=[[-.090,.010,.010,.008],[-.074,.056,.033,.008],[-.039,.085,.048,.006],[.009,.097,.051,0],[.050,.094,.049,0],[.072,.082,.041,.002]];
  const corner=(v,power)=>Math.sign(v)*Math.abs(v)**power;
  const vertex=([dx,ry,rz,dz],a)=>[x+dx,y+side*(ry*corner(Math.cos(a),.79)),z+dz+rz*corner(Math.sin(a),.72)];
  for(let j=1;j<profile.length;j++)for(let i=0;i<16;i++){
    const a=i*TAU/16,b=(i+1)*TAU/16;
    const finish=i>=8?'#34393d':tint(paint,.86+.23*Math.sin((a+b)/2));
    r.polygon([vertex(profile[j-1],a),vertex(profile[j],a),vertex(profile[j],b),vertex(profile[j-1],b)],finish,false);
  }
  const end=profile.at(-1),rim=ring(24,a=>vertex(end,a));
  const pane=ring(24,a=>vertex([.073,.074,.034,.002],a));
  ribbon(r,rim,pane,'#353a3c');r.polygon(pane.slice(0,-1),'#8a9ca3',false);
}

// Manufacturer's Certificate 51/21, p. 4. The Carrera S5 has ten separate near-radial
// blades framing five narrow windows and five wide ones. Each bolt sits in a narrow window.
export function drawCarreraS5(r,{x,y,z,rim,width,side,finish}){
  const rear=rim>.26,beadWidth=(rear?11.5:8.5)*.0254;
  const lip=y+side*Math.min(width*.502,beadWidth/2+.012);
  const hub=lip-side*(rear?.044:.030);
  const p=(a,r,depth)=>[x+Math.cos(a)*r,depth,z+Math.sin(a)*r];
  const loop=(rad,depth,n=48)=>ring(n,a=>p(a,rad,depth));
  // Keep this rim's faces convex so the stock wheel thumbnail can also draw them directly.
  r.tubeY(x,y-side*(beadWidth/2),lip-side*.003,z,rim*.946,'#60686d',36);
  r.ringY(x,lip-side*.001,z,rim,rim*.974,tint(finish,1.09),40);
  r.ringY(x,lip-side*.002,z,rim*.974,rim*.941,tint(finish,.89),40);
  for(let i=0;i<5;i++){
    const axis=Math.PI/2+i*TAU/5;
    for(const s of [-1,1]){
      const stations=[[.21,.33,.223,hub],[.34,.31,.141,hub+side*.003],[.48,.267,.074,lip-side*.004],[.75,.251,.047,lip+side*.0005],[.949,.247,.034,lip-side*.002]];
      const rows=stations.map(([k,offset,half,dy])=>[-1,0,1].map(v=>p(axis+s*offset+v*half,rim*k,dy+(v===0?side*.0017:0))));
      for(let j=1;j<rows.length;j++){
        const [l,m,h]=rows[j-1],[ll,mm,hh]=rows[j];
        r.polygon([l,ll,mm,m],tint(finish,[0,.95,.99,1.04,1.06][j]),false);
        r.polygon([m,mm,hh,h],tint(finish,[0,.85,.89,.92,.91][j]),false);
        const back=v=>[v[0],v[1]-side*.013,v[2]];
        r.polygon([l,back(l),back(ll),ll],tint(finish,.61),false);
        r.polygon([h,hh,back(hh),back(h)],tint(finish,.66),false);
      }
    }
  }
  // Scallops in the casting between spokes retain five independent bores on the 130 mm PCD.
  const mount=Array.from({length:60},(_,i)=>{
    const a=TAU*i/60,t=Math.cos(5*(a-Math.PI/2));return p(a,.078+.008*t,hub+side*.0025);
  });
  r.polygon(mount,tint(finish,.92),false);
  for(let i=0;i<5;i++){
    const a=Math.PI/2+TAU*i/5,[bx,,bz]=p(a,.065,hub);
    const circle=(radius,dy,n)=>Array.from({length:n},(_,j)=>[bx+radius*Math.cos(TAU*j/n),dy,bz+radius*Math.sin(TAU*j/n)]);
    r.polygon(circle(.0155,hub+side*.003,14),tint(finish,.67),false);
    r.polygon(circle(.012,hub+side*.004,12),'#333b40',false);
    r.polygon(circle(.0077,hub+side*.0045,6),'#4f5558',false);
  }
  r.polygon(loop(.034,hub+side*.005,26).slice(0,-1),'#6e7678',false);
  r.polygon(loop(.032,hub+side*.006,26).slice(0,-1),tint(finish,.97),false);
  const crest=[[-.013,.013],[.013,.013],[.012,-.002],[.008,-.012],[0,-.018],[-.008,-.012],[-.012,-.002]];
  r.polygon(crest.map(([dx,dz])=>[x+dx,hub+side*.0066,z+dz]),'#797e7d',false);
  for(let j=0;j<2;j++){
    const bars=[[-.008,-.0005+j*.004],[-.002,-.0005+j*.004],[-.002,.001+j*.004],[-.008,.001+j*.004]];
    r.polygon(bars.map(([dx,dz])=>[x+dx,hub+side*.007,z+dz]),'#475055',false);
  }
}

// The five front/rear wheel-centre-scaled roof landmarks come from the closed
// Cabriolet's two side photographs, with the rear glass checked in rear three-quarter view.
export const roof992=[
  [.015,1.291,.649,1.240,.021],[.270,1.305,.649,1.257,.019],[.505,1.302,.652,1.245,.024],
  [.740,1.288,.662,1.198,.022],[.950,1.249,.674,1.141,.012],[1.125,1.210,.691,1.093,-.025],
  [1.308,1.162,.694,1.046,-.065],[1.512,1.092,.681,.987,-.119]
];
export function backlight992(j,u){
  const waterline=[.68,.68,.68,.68,.61,.695,.733,.737,.74][j];
  const k=Math.abs(u),w=k<=.68?k*waterline/.68:waterline+(1-waterline)*(k-.68)/.32;
  return Math.sign(u)*w;
}
export function draw992HoodSide(r,car,s,rows,roofPoint,glaze){
  const hoop=rows.map(v=>roofPoint(v,s));
  const contour=x=>{
    let i=1;while(i<hoop.length-1&&hoop[i][0]<x)i++;
    return blend(hoop[i-1],hoop[i],(x-hoop[i-1][0])/(hoop[i][0]-hoop[i-1][0]));
  };
  const belt=x=>[x,s*(.717-.009*Math.max(0,x)),car.belt+.024+.013*Math.max(0,x)+.066*Math.max(0,x-.91)];
  const glass=(points)=>{glaze(r,points,'#92a3ab',.205);r.faces.at(-1).roofServicePart='cabin.windshield';};
  const foot=[car.screen[0]+car.screenFootSweep,s*car.screen[3],car.belt-.008];
  const jamb=.598,tip=.983;
  const door=[...hoop.filter(p=>p[0]<jamb),contour(jamb)];
  for(let i=1;i<door.length;i++)glass([i===1?foot:belt(door[i-1][0]),door[i-1],door[i],belt(door[i][0])]);
  const corners=[contour(jamb),contour(.688),contour(.798),contour(.895),contour(tip)];
  const pane=corners.map(p=>{
    const u=(p[0]-jamb)/(tip-jamb);
    return blend(contour(jamb),belt(tip),u**1.30).map((v,k)=>k===0?p[0]:v);
  });
  const sail='#414345';
  for(let i=1;i<corners.length;i++){
    glass(i===corners.length-1?[belt(corners[i-1][0]),pane[i-1],pane[i]]:[belt(corners[i-1][0]),pane[i-1],pane[i],belt(corners[i][0])]);
    r.polygon(i===1?[corners[i-1],corners[i],pane[i]]:[pane[i-1],corners[i-1],corners[i],pane[i]],sail,false);
  }
  const rear=[contour(tip),...hoop.filter(p=>p[0]>tip)];
  for(let i=1;i<rear.length;i++)r.polygon([belt(rear[i-1][0]),rear[i-1],rear[i],belt(rear[i][0])],tint(sail,1-.027*i),false);
  const jambEdge=[belt(jamb),contour(jamb)];
  ribbon(r,jambEdge,jambEdge.map(([x,y,z])=>[x+.007,y+s*.0006,z]),'#616666');
  r.faces.at(-1).roofServicePart='cabin.windshield';
  const welt=[...door,...pane.slice(1)];
  ribbon(r,welt,welt.map(([x,y,z])=>[x+.001,y+s*.0025,z-.006]),'#303639');
}

export function draw992EngineGrille(r,surface){
  // Plan-registered front and back edges of the fixed grating on the rescue sheet.
  // At the centre they span x=1.706..1.961 m. The corners sweep forward into the lid.
  const ts=Array.from({length:7},(_,j)=>j/6);
  const point=(t,eta,h)=>{
    const y=eta*.495,u=Math.abs(eta);
    const x=mix(1.706-.035*u*u,1.961-.115*u*u,t);
    let param=x;
    for(let i=0;i<7;i++)param+=x-surface(param,y,0)[0];
    const q=surface(param,y,h);q[0]=x;return q;
  };
  const lane=(a,b,ha,hb,color)=>ribbon(r,ts.map(t=>point(t,a,ha)),ts.map(t=>point(t,b,hb)),color);
  for(let i=0;i<12;i++)lane(i/6-1,(i+1)/6-1,.005,.005,'#20262a');
  for(const s of [-1,1]){
    for(let i=0;i<9;i++){
      const eta=s*(.080+i*.0453)/.495;
      lane(eta-.014,eta-.004,.012,.020,'#363b3e');
      lane(eta-.004,eta+.014,.020,.017,'#686c6d');
    }
    r.tag('lights.tail',()=>{
      const middle=s*.024/.495;
      lane(middle-.016,middle+.016,.019,.019,'#b33f45');
      lane(middle-.006,middle+.006,.020,.020,'#de6264');
    });
  }
}

// US side markers sit in the bumper return immediately forward of the wheel opening.
export function draw992SideMarker(r,car,side,skin){
  // Upper and lower lamp edges from a 4x side-elevation crop beginning at
  // page (68,508). At the wheel opening the top extends aft of the lower tip.
  const top=[[200,144],[207,137],[219,131],[240,128],[269,125],[294,124]];
  const bottom=[[200,144],[206,144],[219,143],[238,142],[262,141],[280,140]];
  const rail=(v,protrusion)=>top.map(([tx,ty],i)=>{
    const [bx,by]=bottom[i];
    const x=-1.2+(68+mix(bx,tx,v)/4-168.4)/103.424;
    const axleLine=570.075+(x+1.2)*.760/2.450;
    const z=.339+(axleLine-508-mix(by,ty,v)/4)/103.424;
    let low=car.stations[0][0],high=car.front-.13,point;
    for(let j=0;j<15;j++){
      const mid=(low+high)/2;
      const floor=skin(car,mid,0,side)[2],crown=skin(car,mid,1,side)[2];
      point=skin(car,mid,(z-floor)/(crown-floor),side);
      if(point[0]<x)low=mid;else high=mid;
    }
    return [x,point[1]+side*protrusion,z];
  });
  ribbon(r,rail(0,.0039),rail(1,.0039),'#34383a');
  ribbon(r,rail(.16,.0052),rail(.83,.0052),'#bc702f');
  ribbon(r,rail(.56,.0056),rail(.70,.0056),'#d79a50');
}
