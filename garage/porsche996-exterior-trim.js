// Lamps, mirrors and lid fittings of the 1999 911 Carrera Cabriolet (996.1).
// Plan and side outlines come from the 996 Cabriolet rescue sheet (Porsche
// Classic rescue data, PDF page 36); the lens layout follows photographs of a
// US 1999 car (porsche996-sources.js).
import {tint} from './road-primitives.js';

const TAU=Math.PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
const bound=t=>Math.max(0,Math.min(1,t));
function ribbon(r,a,b,color){
  const points=[...a,...b],triangles=[],n=a.length;
  for(let i=1;i<n;i++)triangles.push(i-1,i,n+i,n+i,n+i-1,i-1);
  r.polygon(points,color,false);
  r.faces.at(-1).triangles=triangles;
}
const ring=(n,point)=>Array.from({length:n+1},(_,i)=>point(TAU*i/n));
function smoothLoop(points,steps=3){
  const out=[],n=points.length;
  for(let i=0;i<n;i++)for(let j=0;j<steps;j++){
    const t=j/steps,a=points[(i+n-1)%n],b=points[i],c=points[(i+1)%n],d=points[(i+2)%n];
    out.push(b.map((v,k)=>.5*(2*v+(-a[k]+c[k])*t+(2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t)));
  }
  return out;
}

// Headlamp lens outline in plan (rescue sheet, path traced in vehicle metres):
// rear tip over the wing, the round outer edge, the front edge at the bumper and
// the inner corner on the lid seam.
const lampPlan=smoothLoop([
  [-1.582,.634],[-1.594,.681],[-1.636,.721],[-1.702,.738],[-1.780,.729],
  [-1.847,.702],[-1.904,.656],[-1.934,.612],[-1.938,.548],[-1.932,.488],
  [-1.880,.455],[-1.800,.420],[-1.755,.414],[-1.722,.458],[-1.676,.506],
  [-1.618,.566],[-1.590,.600]
],3);
const lampCentre=lampPlan.reduce((a,p)=>[a[0]+p[0]/lampPlan.length,a[1]+p[1]/lampPlan.length],[0,0]);
// One-piece lens over a large main reflector, a smaller lower lamp and the US
// amber signal across the lower front of the unit.
export function draw996Headlamp(r,car,side,skin){
  const cache=new Map();
  const surface=(x,y,lift)=>{
    const key=x.toFixed(5)+','+y.toFixed(5);
    if(!cache.has(key)){
      let u=x;
      for(let i=0;i<7;i++)u+=x-skin(car,u,side*y)[0];
      cache.set(key,skin(car,u,side*y)[2]);
    }
    return [x,side*y,cache.get(key)+lift];
  };
  const outline=(scale,lift)=>[...lampPlan,lampPlan[0]].map(([x,y])=>surface(mix(lampCentre[0],x,scale),mix(lampCentre[1],y,scale),lift));
  const rings=[[1.010,.0012],[1,.0028],[.975,.0045],[.93,.0058],[.80,.0068],[.50,.0075],[0,.0078]];
  const finish=['#2c3236','#3a4348','#8e9da4','#a9b6bc','#b3bfc4','#b8c3c7'];
  for(let i=1;i<rings.length;i++)ribbon(r,outline(...rings[i-1]),outline(...rings[i]),finish[i-1]);
  const disk=(cx,cy,rx,ry,lift,color,n=24)=>{
    const loop=ring(n,a=>surface(cx+rx*Math.cos(a),cy+ry*Math.sin(a),lift));
    r.polygon(loop.slice(0,-1),color,false);return loop;
  };
  // Main reflector (rescue sheet plan ellipse): a chrome bowl seen through the
  // clear lens, darker at its rim, with the bulb shield at the centre.
  const main=[-1.741,.618];
  const bowl=(k,lift)=>ring(28,a=>surface(main[0]+.118*k*Math.cos(a),main[1]+.092*k*Math.sin(a),lift));
  ribbon(r,bowl(1,.0080),bowl(.90,.0082),'#6d7a80');
  ribbon(r,bowl(.90,.0082),bowl(.62,.0084),'#a6b2b6');
  ribbon(r,bowl(.62,.0084),bowl(.30,.0086),'#c4cdcf');
  disk(main[0],main[1],.118*.30,.092*.30,.0088,'#d4dbdb');
  disk(main[0]-.004,main[1],.022,.018,.0092,'#7f8a8e',16);
  // Smaller lower round lamp in the inner lobe.
  const low=[-1.856,.460];
  const cup=(k,lift)=>ring(20,a=>surface(low[0]+.064*k*Math.cos(a),low[1]+.042*k*Math.sin(a),lift));
  ribbon(r,cup(1,.0080),cup(.80,.0082),'#76838a');
  ribbon(r,cup(.80,.0082),cup(.45,.0084),'#b4bfc2');
  disk(low[0],low[1],.064*.45,.042*.45,.0086,'#cdd4d5',18);
  // US amber signal: a band across the front of the lens below the reflectors.
  const amber=lampPlan.filter(([x])=>x< -1.875);
  if(amber.length>3){
    const band=(lift,k)=>amber.map(([x,y])=>surface(mix(lampCentre[0],x,k),mix(lampCentre[1],y,k),lift));
    ribbon(r,band(.0082,.95),band(.0082,.84),'#c9673f');
    ribbon(r,band(.0083,.84),band(.0083,.78),'#d98a5c');
  }
}

// Amber US side marker in the bumper return ahead of the front wheel.
// Side elevation: x −1.624..−1.462, z 0.554..0.593.
export function draw996SideMarker(r,car,side,flankAt){
  const rail=(v,out)=>Array.from({length:7},(_,i)=>{
    const t=i/6,x=mix(-1.620,-1.468,t);
    const lo=.556+.003*t,hi=.590-.010*t*t;
    const p=flankAt(x,mix(lo,hi,v));
    return [p[0],p[1]+side*out,p[2]];
  });
  ribbon(r,rail(0,.003),rail(1,.003),'#34383a');
  ribbon(r,rail(.18,.0045),rail(.82,.0045),'#c0702c');
  ribbon(r,rail(.45,.005),rail(.60,.005),'#de9b52');
}

// Tail lamp: red lower lens with a smoked upper band holding the clear reverse
// and signal sections; it wraps from the tail onto the rear quarter.
export function draw996Tail(r,lamp){
  const us=Array.from({length:45},(_,i)=>i/44);
  const band=(lo,hi,depth,color,u0=0,u1=1)=>{
    const run=us.filter(u=>u>=u0-1e-9&&u<=u1+1e-9);
    ribbon(r,run.map(u=>lamp(u,lo,depth)),run.map(u=>lamp(u,hi,depth)),color);
  };
  // Dark housing edge, red lower lens with an inner reflex band, the smoked upper
  // band and, inboard, the clear reverse section.
  band(-.06,1.05,0,'#262a2d');
  band(0,.58,.0015,'#a3252e');
  band(.10,.30,.0022,'#c5373e');
  band(.58,1,.0015,'#55585c');
  band(.64,.94,.0022,'#7c8083',.18,1);
  band(.58,.60,.0025,'#b9bebf');
  band(.62,.96,.0026,'#d8dcd8',0,.16);
}

export function draw996Mirror(r,center,side,paint){
  const [x,y,z]=center;
  // Body-colour shell with a flat outboard face and a dark rear frame.
  const profile=[[-.085,.012,.012,.006],[-.068,.050,.030,.006],[-.036,.080,.044,.004],[.006,.092,.047,0],[.044,.090,.045,0],[.064,.080,.039,.002]];
  const corner=(v,power)=>Math.sign(v)*Math.abs(v)**power;
  const vertex=([dx,ry,rz,dz],a)=>[x+dx,y+side*(ry*corner(Math.cos(a),.70)),z+dz+rz*corner(Math.sin(a),.62)];
  for(let j=1;j<profile.length;j++)for(let i=0;i<16;i++){
    const a=i*TAU/16,b=(i+1)*TAU/16;
    r.polygon([vertex(profile[j-1],a),vertex(profile[j],a),vertex(profile[j],b),vertex(profile[j-1],b)],tint(paint,.84+.24*Math.sin((a+b)/2)),false);
  }
  const end=profile.at(-1),rim=ring(24,a=>vertex(end,a));
  const pane=ring(24,a=>vertex([.065,.071,.033,.002],a));
  ribbon(r,rim,pane,'#2f3436');r.polygon(pane.slice(0,-1),'#8a9ca3',false);
}

// Rear-lid louvres: eight transverse slats bowed forward at their ends in plan
// (rescue sheet paths 218–225), with the third brake light ahead of them.
export function draw996EngineGrille(r,surface){
  const front=y=>1.752+.03*(Math.abs(y)/.455)**2,back=y=>{
    const u=Math.abs(y)/.455;return 2.040-.115*u**2.6;
  };
  const point=(x,y,h)=>{
    let param=x;
    for(let i=0;i<7;i++)param+=x-surface(param,y,0)[0];
    const q=surface(param,y,h);q[0]=x;return q;
  };
  const ys=Array.from({length:17},(_,i)=>(i/8-1)*.452);
  const lane=(t0,t1,h0,h1,color)=>ribbon(r,
    ys.map(y=>point(mix(front(y),back(y),t0),y,h0)),
    ys.map(y=>point(mix(front(y),back(y),t1),y,h1)),color);
  lane(0,1,.0025,.0025,'#1d2226');
  for(let i=0;i<8;i++){
    const t=.06+i*.12;
    lane(t,t+.035,.0085,.0060,'#5f6466');
    lane(t+.035,t+.085,.0060,.0035,'#2e3336');
  }
  r.tag('lights.tail',()=>{
    const y0=.210,ax=1.728,bx=1.790;
    const strip=(k,h,color)=>ribbon(r,
      Array.from({length:9},(_,i)=>point(mix(ax,bx,.5-k/2),(i/4-1)*y0*(1-.04*k),h)),
      Array.from({length:9},(_,i)=>point(mix(ax,bx,.5+k/2),(i/4-1)*y0*(1-.04*k),h)),color);
    strip(1,.004,'#2b3033');strip(.62,.006,'#a8343b');strip(.25,.0068,'#d65a5c');
  });
}

// Lid crest and the "911 Carrera" script on the right of the rear lid.
export function draw996Script(r,tail){
  const letters=[[.236,.026],[.218,.018],[.205,.018],[.183,.026],[.165,.022],[.146,.022],[.127,.018],[.110,.020],[.092,.020],[.074,.022],[.055,.022]];
  for(const [y,w] of letters){
    const a=tail(-y,.612,-.006),b=tail(-(y-w*.8),.612,-.006),c=tail(-(y-w*.8),.628,-.006),d=tail(-y,.628,-.006);
    r.polygon([a,b,c,d],'#b3b4ae',false);
  }
}

// Roof bows of the closed fabric top: [x, crown height, half-width at the
// side rail, side-rail height, rail sweep]. The silhouette follows the
// rescue sheet's top line; the bows and the rear window from paths 96–98.
export const roof996=[
  [.020,1.300,.632,1.226,.018],[.262,1.307,.640,1.240,.016],[.486,1.302,.645,1.234,.020],
  [.700,1.290,.656,1.205,.015],[.900,1.259,.668,1.160,.006],[1.080,1.199,.680,1.100,-.022],
  [1.270,1.118,.684,1.030,-.062],[1.488,1.032,.672,.972,-.110]
];
export function backlight996(j,u){
  const waterline=[.66,.66,.66,.66,.60,.62,.66,.68,.70][j];
  const k=Math.abs(u),w=k<=.66?k*waterline/.66:waterline+(1-waterline)*(k-.66)/.34;
  return Math.sign(u)*w;
}
