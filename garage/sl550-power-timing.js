// Front elevation based on Mercedes-Benz plate P05.00-2089-00.
// Routing and reduction stages follow the plate. Surface contours are illustrative.
import {cyl,part,study,TAU,x} from './mechanism-shapes.js';

const crank=[0,.395], intermediate=[0,.481], pump=[-.057,.294];
const intake=side=>[side*.205,.711], exhaust=side=>[side*.288,.636];
const wheel=(center,radius)=>({center,radius});
const main=[wheel(crank,.027),wheel(intermediate,.036)];
const bank=side=>[wheel(intermediate,.028),wheel(intake(side),.042),wheel(exhaust(side),.042)];
const oil=[wheel(crank,.023),wheel(pump,.034)];

function chain(r,station,wheels){
  // The outer envelope of the pitch circles gives tangent straight runs
  // between sprockets. The inner edge follows the same support direction.
  const rings=Array.from({length:40},(_,i)=>{
    const a=TAU*i/40,ny=Math.cos(a),nz=Math.sin(a);
    const support=w=>w.center[0]*ny+w.center[1]*nz+w.radius;
    const w=wheels.reduce((best,next)=>support(next)>support(best)?next:best);
    const p=(xx,dr)=>[xx,w.center[0]+(w.radius+dr)*ny,w.center[1]+(w.radius+dr)*nz];
    return [p(station-.003,.003),p(station+.003,.003),p(station+.003,-.002),p(station-.003,-.002)];
  });
  let toPin=.002;
  for(let i=0;i<rings.length;i++){
    const a=rings[i],b=rings[(i+1)%rings.length];
    for(let j=0;j<4;j++){
      const k=(j+1)%4;
      r.polygon([a[j],b[j],b[k],a[k]],['#4f585b','#a4acac','#475053','#a1abad'][j],false);
    }
    // Pin heads on the near link plate follow a constant pitch down the
    // straight sections too; splitting only at sprocket angles looks like a belt.
    const mid=ring=>[(ring[0][1]+ring[3][1])/2,(ring[0][2]+ring[3][2])/2];
    const [ay,az]=mid(a),[by,bz]=mid(b),dy=by-ay,dz=bz-az,length=Math.hypot(dy,dz);
    while(toPin<length){
      const y=ay+dy*toPin/length,z=az+dz*toPin/length;
      r.polygon(Array.from({length:6},(_,n)=>[station-.0034,y+.0015*Math.cos(TAU*n/6),z+.0015*Math.sin(TAU*n/6)]),'#46545a',false);
      toPin+=.0085;
    }
    toPin-=length;
  }
}

function sprockets(r,station,wheels){
  for(const {center:[cy,cz],radius} of wheels){
    cyl(r,[station,cy,cz],x,-.002,.002,radius-.002,'#626c71',14);
  }
}

function camPair(r,side,phase){
  for(const [cy,cz] of [intake(side),exhaust(side)]){
    // The adjuster sits at the nose of a shaft extending through all four cylinders.
    cyl(r,[-1.389,cy,cz],x,-.013,.461,.009,'#929b9f',8);
    for(let i=0;i<4;i++)for(const lift of [-.020,.020]){
      const theta=phase*TAU+[0,2,3,1][i]*TAU/4;
      const xx=-1.315+i*.107+(side>0?.020:0)+lift;
      cyl(r,[xx,cy+.006*Math.cos(theta),cz+.006*Math.sin(theta)],x,-.005,.005,.015,'#77838b',10);
    }
  }
}

function caseFront(r,cutaway=false){
  // Each band is convex so it remains watertight under fan triangulation.
  const bands=[[.249,.063],[.294,.107],[.394,.077],[.470,.064],[.511,.123]];
  function cast(points){
    const front=points.map(([y,z])=>[-1.429,y,z]),back=points.map(([y,z])=>[-1.389,y,z]);
    r.polygon(front,'#929d9d',false);r.polygon(back,'#848e91',false);
    for(let i=0;i<front.length;i++){
      const k=(i+1)%front.length;
      r.polygon([front[i],front[k],back[k],back[i]],'#79868b',false);
    }
  }
  for(let i=1;i<bands.length;i++){
    const [a,w]=bands[i-1],[b,v]=bands[i];
    cast([[cutaway?w*.70:-w,a],[w,a],[v,b],[cutaway?v*.70:-v,b]]);
  }
  for(const s of cutaway?[1]:[-1,1]){
    const panel=points=>cast(points.map(([y,z])=>[s*y,z]));
    panel([[0,.511],[.123,.511],[.330,.602],[.186,.649],[.047,.558]]);
    panel([[.330,.602],[.339,.650],[.316,.682],[.244,.748],[.198,.757],[.163,.734],[.186,.649]]);
    for(const [cy,cz] of [[.308,.632],[.211,.738],[.049,.482]]){
      cyl(r,[-1.429,s*cy,cz],x,-.005,0,.007,'#707a80',6);
    }
  }
}

const entries=[
  part('case','Cutaway timing cover','The left side is sectioned in this view. Move the cover forward to expose the other bank.',[-.080,0,0],r=>caseFront(r,true)),
  part('primary','Primary timing chain','The crank drives the intermediate gear through the short center chain. The first reduction is 1 to 1.33.',[-.030,0,0],r=>chain(r,-1.407,main)),
  ...[-1,1].map(s=>part(s<0?'left':'right',(s<0?'Left':'Right')+' secondary chain','A separate secondary chain joins the intermediate shaft to the two cam adjusters on this bank. This stage provides a further 1 to 1.5 reduction.',[-.027,.045*s,.018],r=>chain(r,s<0?-1.398:-1.389,bank(s)))),
  part('oil','Oil pump chain','A separate chain carries crank rotation downward to the oil pump.',[-.045,0,-.045],r=>chain(r,-1.418,oil)),
  part('guides','Bank guides and tensioning rails','The guide surfaces control the long chain runs. Oil-pressure tensioners load the movable rails. The rail contours are approximate.',[-.048,0,.027],r=>{
    for(const s of [-1,1]){
      const station=s<0?-1.398:-1.389;
      const rail=(a,b,radius)=>r.rod([station,s*a[0],a[1]],[station,s*b[0],b[1]],radius,'#ac8a60',6);
      rail([.046,.575],[.159,.703],.005);
      rail([.078,.498],[.241,.586],.005);
      rail([.232,.724],[.290,.671],.004);
    }
  }),
  part('wheels','Sprockets and intermediate shaft','The primary driven sprocket and both secondary drive sprockets share an intermediate shaft.',[.013,0,0],r=>{
    sprockets(r,-1.407,main);sprockets(r,-1.398,bank(-1));sprockets(r,-1.389,bank(1));sprockets(r,-1.418,oil);
    cyl(r,[-1.4,...intermediate],x,-.017,.024,.011,'#b5bfc0',10);
  }),
  ...[-1,1].map(s=>part(s<0?'left-cams':'right-cams',(s<0?'Left':'Right')+' intake and exhaust cams','Four pairs of lobes on each shaft operate the valves. Both cams turn once for every two crank revolutions.',[0,.07*s,.04],(r,phase)=>camPair(r,s,phase)))
];

export function drawM278Timing(r){
  caseFront(r);
  for(const entry of entries)if(entry.id!=='case')entry.draw(r,0);
}
export function m278TimingStudy(ref){
  const detail=study('m278-timing','M278 timing drive','Follow the crankshaft up through the intermediate shaft and out to the two camshafts on each bank.',ref,entries,'One cycle turns all four camshafts through one revolution. The oil pump has its own chain.');
  detail.viewAngle=[-1.23,.14];
  return detail;
}
