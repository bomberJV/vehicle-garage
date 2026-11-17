import {classicTailpipe,classicTailpipeEnd} from './porsche993-body-profile.js';
import {barrel,pipe,ellipsoid,tint} from './road-primitives.js';
import {faceTriangles} from './mesh-triangles.js';
const TAU=2*Math.PI;
const ALLOY='#a3a9a5',CAST='#747d7e',MAG='#b9beb3',RUBBER='#333b3c',HEAT='#9c8368';
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function sweep(r,points,radius,color,cross=9) {
  // Round each corner with a quadratic fillet. A continuous skin avoids the
  // gaps left by a chain of independent open cylinders.
  const path=[points[0]];
  for(let i=1;i<points.length-1;i++){
    const a=mix(points[i],points[i-1],.32),b=mix(points[i],points[i+1],.32);
    for(let k=0;k<=3;k++){
      const t=k/3;path.push(mix(mix(a,points[i],t),mix(points[i],b,t),t));
    }
  }
  path.push(points.at(-1));
  const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/(n||1));};
  const crossProduct=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  let previous=null,reference=[1,0,0];
  for(let i=0;i<path.length;i++){
    const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];
    const dir=unit(b.map((v,j)=>v-a[j]));
    if(i===0&&Math.abs(dir[0])>.8)reference=[0,1,0];
    const v=unit(crossProduct(dir,reference)),u=unit(crossProduct(v,dir));reference=u;
    const ring=Array.from({length:cross},(_,k)=>path[i].map((val,j)=>val+radius*(Math.cos(TAU*k/cross)*u[j]+Math.sin(TAU*k/cross)*v[j])));
    if(previous)for(let k=0;k<cross;k++){const next=(k+1)%cross;r.polygon([previous[k],previous[next],ring[next],ring[k]],tint(color,.83+.14*Math.sin(TAU*k/cross)),false);}
    previous=ring;
  }
}
function loft(r,rows,color){
  for(let j=1;j<rows.length;j++)for(let k=0;k<rows[j].length;k++){
    const n=(k+1)%rows[j].length;r.polygon([rows[j-1][k],rows[j-1][n],rows[j][n],rows[j][k]],tint(color,.80+.22*(1+Math.sin(TAU*k/rows[j].length))*.5),false);
  }
  r.polygon(rows[0],tint(color,.88),false);r.polygon(rows.at(-1),tint(color,1.06),false);
}
// Cast covers follow the rocker/cam chambers, with scallops at each end, a
// shallow crown, a perimeter lip and separate fastener seats. A solid planar
// box across the bank would hide the individual head and intake-port stations.
function cover(r,cx,side,z,modern){
  const offset=side*.0445,X=cx+offset-.0065;
  const outline=modern?
    [[-.265,-.048],[-.246,-.076],[-.190,-.081],[-.155,-.067],[-.09,-.068],[-.051,-.080],[.053,-.080],[.092,-.068],[.158,-.068],[.191,-.079],[.245,-.065],[.263,-.034],[.257,.033],[.23,.062],[.153,.074],[.074,.064],[-.13,.068],[-.228,.062],[-.262,.035]]:
    [[-.260,-.046],[-.232,-.071],[-.173,-.073],[-.137,-.057],[-.052,-.065],[.048,-.065],[.115,-.056],[.180,-.072],[.230,-.065],[.263,-.035],[.260,.033],[.231,.063],[.18,.066],[.13,.056],[.066,.062],[-.145,.060],[-.20,.069],[-.240,.058],[-.260,.032]];
  const rings=[[.353,.91],[.369,1],[.391,.996],[.408,.91],[.420,.82]].map(([y,scale])=>outline.map(([x,h])=>[X+x*scale,side*y,z+h*scale]));
  loft(r,rings,modern?'#767f80':'#989c92');
  // Flutes span the casting and expose a line of discrete bosses, rather than
  // implying that this bank is a single featureless rectangular plate.
  for(const h of [-.043,-.022,.035]){
    const ring=(x,y,height)=>[X+x,side*y,z+height+h];
    const a=[ring(-.197,.416,-.002),ring(-.196,.426,.003),ring(-.192,.415,.008)];
    const b=[ring(.202,.416,-.002),ring(.2,.426,.003),ring(.193,.415,.008)];loft(r,[a,b],modern?'#929b99':'#b2b4a7');
  }
  for(const x of [-.22,-.099,.098,.218])for(const h of [-.053,.050])barrel(r,[X+x,side*.405,z+h],[X+x,side*.414,z+h],.0093,'#b7bdb4',6);
}
function heads(r,cx,z,modern,side){
  r.tag('engine.heads',()=>{
    cover(r,cx,side,z,modern);
    if(modern){
      const shape=[[.322,-.065],[.335,-.087],[.372,-.096],[.392,-.056],[.391,.051],[.367,.095],[.329,.081],[.315,.048]];
      const center=cx-.0065+side*.0445;
      loft(r,[[-.267,.86],[-.249,1],[.249,1],[.267,.88]].map(([dx,k])=>shape.map(([y,h])=>[center+dx,side*y,z+h*k])),CAST);
      return;
    }
    for(let n=0;n<3;n++){
      const x=cx-.1845+n*.178+side*.0445;
      const cross=[[.341,-.083],[.358,-.103],[.381,-.081],[.388,-.045],[.383,.068],[.365,.099],[.349,.091],[.334,.060]];
      loft(r,[[-.075,.94],[-.061,1],[.050,1],[.074,.91]].map(([dx,k])=>cross.map(([y,h])=>[x+dx,side*y,z+h*k])),CAST);
      for(let i=0;i<4;i++){
        const X=x-.057+i*.035,edge=[[.328,-.083],[.365,-.095],[.382,-.076],[.382,.064],[.363,.091],[.328,.082]];
        loft(r,[X,X+.005].map(xx=>edge.map(([y,h])=>[xx,side*y,z+h])),'#858a80');
      }
    }
  });
}
function classicInduction(r,cx,z){
  const tag=(id,fn)=>r.tag('engine.'+id,fn);
  tag('intake',()=>{
    for(const s of [-1,1]){
      // Two cast intake banks sit above the fan duct. Individual swan-neck
      // runners descend toward their three ports, separated by rubber sleeves.
      for(let n=0;n<3;n++){
        const x=cx-.1845+n*.178+s*.0445;
        const path=[[x+.018,s*.112,z+.267],[x+.014,s*.197,z+.268],[x+.018,s*.267,z+.236],[x+.007,s*.315,z+.178],[x,s*.344,z+.110],[x,s*.346,z+.076]];
        sweep(r,path,.0325,MAG,10);
        barrel(r,[x-.002,s*.339,z+.118],[x-.002,s*.347,z+.087],.036,RUBBER,12);
        for(const h of [.093,.115])barrel(r,[x-.002,s*.343,z+h],[x-.002,s*.343,z+h+.005],.0365,'#b7b9a8',10);
      }
      const path=[[cx-.250,s*.13,z+.246],[cx-.22,s*.128,z+.273],[cx-.110,s*.124,z+.291],[cx+.113,s*.125,z+.283],[cx+.196,s*.113,z+.256]];
      sweep(r,path,.042,'#a5ada5',12);
      // Beaded crossover couplers, viewed from the pulley side.
      barrel(r,[cx+.170,s*.108,z+.263],[cx+.17,s*.076,z+.263],.037,RUBBER,12);
      barrel(r,[cx+.170,s*.102,z+.263],[cx+.17,s*.097,z+.263],.039,'#bec1b5',12);
    }
    barrel(r,[cx+.170,-.086,z+.263],[cx+.170,.086,z+.263],.041,'#b2b5ac',14);
    sweep(r,[[cx-.168,-.124,z+.278],[cx-.185,-.042,z+.31],[cx-.18,.047,z+.31],[cx-.153,.125,z+.278]],.041,'#adb4ac',12);
    sweep(r,[[cx-.195,0,z+.308],[cx-.250,0,z+.316],[cx-.28,-.095,z+.286]],.038,RUBBER,10);
  });
  tag('cooling',()=>{
    // The fan feeds a pressed shroud which widens onto both cylinder banks.
    // Its rear rim stays open and lies behind the actual impeller and belts.
    const stations=[[.288,.143,.145,.170],[.205,.148,.141,.162],[.110,.230,.116,.132],[-.035,.285,.070,.119],[-.230,.289,.053,.103]];
    const rings=stations.map(([x,width,height,center])=>Array.from({length:19},(_,i)=>{
      const a=i/18*Math.PI;return[cx+x,width*Math.cos(a),z+center+height*Math.sin(a)];
    }));
    for(let j=1;j<rings.length;j++)for(let k=0;k<18;k++)r.polygon([rings[j-1][k],rings[j][k],rings[j][k+1],rings[j-1][k+1]],tint('#535a54',.77+.40*Math.sin((k+.5)*Math.PI/18)),false);
    for(const s of [-1,1]){
      sweep(r,[[cx+.180,s*.13,z+.217],[cx+.081,s*.20,z+.202],[cx-.094,s*.252,z+.147],[cx-.205,s*.252,z+.128]],.006,'#696f64',6);
    }
    // Retaining band follows the outer circumference, behind the impeller.
    const curve=Array.from({length:21},(_,k)=>{const a=k*Math.PI/20;return[cx+.250,.148*Math.cos(a),z+.166+.146*Math.sin(a)];});
    const back=curve.map(([x,y,h])=>[x-.012,y,h]);for(let i=1;i<curve.length;i++)r.polygon([curve[i-1],curve[i],back[i],back[i-1]],'#aaa994',false);
  });
}
function modernInduction(r,cx,z,na=false){
  if(na){
    // M96/01: one resonance distributor across the engine, a resonance flap
    // between its halves and a single throttle body fed from the left airbox.
    r.tag('engine.intake',()=>{
      barrel(r,[cx-.02,-.215,z+.235],[cx-.02,.215,z+.235],.058,'#474f52',14);
      barrel(r,[cx-.02,-.012,z+.235],[cx-.02,.012,z+.235],.064,'#2f3436',14);
      barrel(r,[cx+.045,-.06,z+.235],[cx+.135,-.06,z+.235],.040,'#9aa3a3',12);
      sweep(r,[[cx+.135,-.06,z+.235],[cx+.22,-.14,z+.24],[cx+.27,-.30,z+.215]],.036,'#2e3335',10);
      r.box(cx+.215,-.47,z+.145,cx+.335,-.30,z+.285,'#3a4144');
      for(const s of [-1,1])for(let n=0;n<3;n++){
        const x=cx-.1845+n*.178+s*.0445;
        sweep(r,[[cx-.02+(x-cx)*.4,s*.14,z+.235],[x-.012,s*.24,z+.205],[x,s*.302,z+.153],[x,s*.355,z+.077]],.032,'#4a5356',8);
      }
    });
    return;
  }
  for(const s of [-1,1]){
    r.tag('engine.intake',()=>{
      for(let n=0;n<3;n++){
        const x=cx-.1845+n*.178+s*.0445;
        sweep(r,[[x-.008,s*.147,z+.15],[x-.021,s*.232,z+.181],[x,s*.302,z+.153],[x,s*.355,z+.077]],.037,'#4a5356',8);
      }
      barrel(r,[cx-.240,s*.154,z+.152],[cx+.202,s*.154,z+.152],.053,'#434d52',12);
      const p=[cx-.14,s*.139,z+.19];barrel(r,[p[0],p[1],p[2]],[p[0]+.062,p[1],p[2]],.046,'#929c9a',12);
      sweep(r,[[1.22,s*.210,.755],[cx-.300,s*.256,.727],[cx-.267,s*.163,.700],[cx-.138,s*.145,z+.19]],.030,'#3c474a',8);
    });
    r.tag('engine.turbos',()=>{
      const x=cx+.066,y=s*.426,h=z-.124;
      // A turbine and compressor share a shaft. The outside of each chamber
      // grows toward its tangential duct; distinct exhaust and charge-air
      // connections keep the coiled casings recognisable from either quarter.
      for(const [dx,rad,col] of [[-.046,.064,'#9a826e'],[.046,.072,'#a3adad']]){
        const shell=[];
        for(let j=0;j<=18;j++){
          const a=TAU*j/18,rr=rad*(.63+.22*j/18),wall=rad*(.21+.15*j/18);
          shell.push(Array.from({length:8},(_,k)=>{const b=k*TAU/8;return[x+dx+wall*Math.cos(b),y+s*(rr+wall*Math.sin(b))*Math.cos(a),h+(rr+wall*Math.sin(b))*Math.sin(a)];}));
        }
        loft(r,shell,col);
      }
      barrel(r,[x-.059,y,h],[x+.098,y,h],.031,'#778183',14);
      const p=[x+.059,y+s*.060,h+.023],q=[cx+.085,s*.455,z+.074],end=[1.548,s*.253,.745];
      sweep(r,[p,[x+.070,s*.486,h+.089],q,[cx+.064,s*.403,z+.169],end],.028,'#465155',10);
      for(const t of [.37,.50]){const a=mix(q,end,t);barrel(r,a,[a[0]-.002,a[1]-s*.004,a[2]+.007],.031,'#afb6b2',10);}
    });
  }
}
// Pressed oval cans have rolled seams and shallow end dishes. The 993's
// two side silencers and the 992's transverse rear silencer stow differently.
function silencer(r,center,length,width,height,across){
 const [cx,cy,z]=center;
 const station=(u,widthFactor)=>Array.from({length:18},(_,i)=>{
   const a=TAU*i/18,p=Math.cos(a),q=Math.sin(a);
   const side=width*Math.sign(p)*Math.abs(p)**.68*widthFactor,h=height*Math.sign(q)*Math.abs(q)**.78*widthFactor;
   return across?[cx+side,cy+u*length,z+h]:[cx+u*length,cy+side,z+h];
 });
 const profiles=[[-1,.77],[-.92,.96],[-.80,1],[.80,1],[.92,.96],[1,.77]];
 loft(r,profiles.map(([k,w])=>station(k,w)),across?'#849193':'#8c8f87');
 for(const k of [-.84,.84]){
   const a=station(k,1.019),b=station(k+.037,1.019);
   for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],'#a9aaa1',false);}
 }
}
function naExhaust(r,cx,z){
  // 996: three branches per bank meet under the engine, then a catalyst and a
  // transverse silencer in each rear corner end in one oval tailpipe.
  r.tag('engine.exhaust',()=>{
    for(const s of [-1,1]){
      const collector=[cx+.09,s*.36,z-.185];
      for(let n=0;n<3;n++){
        const x=cx-.1845+n*.178+s*.0445;
        sweep(r,[[x,s*.351,z-.063],[x+.01,s*.375,z-.120],[x+.04,s*(.37-.01*n),z-.165-.008*n],collector],.022,'#8a7565',8);
      }
      const cat=[cx+.24,s*.40,.300];
      sweep(r,[collector,[cx+.17,s*.39,z-.20],cat],.032,'#7e7f78',10);
      barrel(r,[cat[0],cat[1],cat[2]],[cat[0]+.11,cat[1]+s*.01,cat[2]],.050,'#9a9b92',12);
      const box=[2.005,s*.40,.322];
      sweep(r,[[cat[0]+.11,cat[1]+s*.01,cat[2]],[box[0]-.13,s*.36,.315],[box[0]-.06,s*.33,.320]],.030,'#7e817d',9);
      silencer(r,box,.105,.075,.078,true);
      sweep(r,[[box[0],s*.48,.315],[2.06,s*.50,.302],[2.10,s*.50,.300]],.034,'#848c89',12);
    }
  });
}
function exhaust(r,cx,z,modern,rear){
  if(modern==='996'){naExhaust(r,cx,z);return;}
  r.tag('engine.exhaust',()=>{
    for(const s of [-1,1]){
      const collector=modern?[cx+.012,s*.427,z-.133]:[cx+.185,s*.318,z-.176];
      for(let n=0;n<3;n++){
        const x=cx-.1845+n*.178+s*.0445;
        const path=modern?[[x,s*.351,z-.063],[x+.014,s*.391,z-.108],[x+.036,s*.410,z-.151-.011*n],collector]:
          [[x,s*.351,z-.063],[x-.02,s*.359,z-.123],[x-.022,s*(.351-.025*n),z-.175-.011*n],[x+.08,s*(.315-.017*n),z-.201],collector];
        sweep(r,path,modern?.024:.022,modern?'#8a7565':HEAT,8);
      }
      const end=modern?[rear-.100,s*.455,.311]:[classicTailpipeEnd(),s*classicTailpipe.y,classicTailpipe.z];
      if(modern){
        const centralX=rear-.285;
        sweep(r,[[cx+.095,s*.426,z-.134],[cx+.235,s*.45,z-.154],[centralX-.085,s*.40,.309],[centralX,s*.321,.323]],.042,'#777e7d',10);
        const fork=[centralX+.034,s*.385,.281];
        sweep(r,[[centralX,s*.32,.317],[centralX+.008,s*.367,.308],fork],.039,'#737b7a',10);
        sweep(r,[fork,[end[0]-.070,end[1],.299],[end[0]+.013,end[1],end[2]+.002]],.041,'#6c7675',12);
        const ring=(x,w,h)=>Array.from({length:18},(_,i)=>[x,end[1]+w*Math.cos(TAU*i/18),end[2]+h*Math.sin(TAU*i/18)]);
        // A short oval sleeve, the same section as the outlet, set into the apron.
        loft(r,[ring(end[0]-.030,.066,.045),ring(end[0]+.011,.069,.047)],'#858f8d');
      }else{
        const inlet=[cx+.335,s*.489,.340];
        sweep(r,[collector,[cx+.255,s*.355,.309],[cx+.286,s*.451,.321],inlet],.031,'#91816c',9);
        silencer(r,[end[0]-.186,s*.545,.325],.160,.065,.074,false);
        sweep(r,[[end[0]-.095,s*.55,.315],[end[0]-.048,end[1],.283],[end[0]+.018,end[1],end[2]]],.044,'#848c89',12);
      }

    }
    if(modern)silencer(r,[rear-.285,0,.330],.356,.081,.083,true);
  });
}
export function drawInstalledBoxer(r,cx,z,modern,rear){
  const start=r.faces.length;
  for(const side of [-1,1])heads(r,cx,z,modern,side);
  if(modern)modernInduction(r,cx,z,modern==='996');else classicInduction(r,cx,z);
  exhaust(r,cx,z,modern,rear);
  // Carry one indexed surface per material and side. Each original triangle
  // and its shade survives; the two cylinder banks still section independently.
  const surfaces=new Map();
  for(const f of r.faces.splice(start)){
    const side=f.points.every(p=>p[1]>=0)?1:f.points.every(p=>p[1]<=0)?-1:0;
    const key=[f.part,f.instance,side,f.color].join('/');
    let batch=surfaces.get(key);
    if(!batch){batch={...f,points:[],triangles:[]};surfaces.set(key,batch);r.faces.push(batch);}
    const base=batch.points.length;
    for(const i of f.triangles||faceTriangles(f.points))batch.triangles.push(base+i);
    batch.points.push(...f.points);
  }
}
