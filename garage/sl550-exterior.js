// US MY14 R231. Coordinates in metres, measured from the wheelbase midpoint.
// MB training figure P00.10-5105-00 and rescue-card plan/elevation locate the
// axles, quarter panels, sill, lamps and closures. The 2014 USA catalogue
// supplies the bumper treatment and Sport Wheel finish. Section crowns and
// chamfers are inferred from the photographs.
import {drawLampOptics} from './sl550-lamp-optics.js';
import {wheel,pipe,ellipse,tint} from './road-primitives.js';
import {faceTriangles} from './mesh-triangles.js';
import {slDeckPoint} from './sl550-roof.js';

const brochure={label:'MBUSA · 2014 SL-Class brochure, pp. 3, 24–27',url:'https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf#page=3'};
const drawing={label:'Mercedes-Benz · R231 body dimensions, P00.10-5105-00',url:'https://www.manualslib.de/manual/89970/Mercedes-Benz-Typenreihe-231.html?page=21'};
const card={label:'Mercedes-Benz · R231 plan and elevation',url:'https://rk.mb-qr.com/en/231/'};
const wheels={label:'MBUSA · 2014 Sport Wheel Package and wheel illustrations',url:'https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf#page=27'};
const group=(id,name,description,entries)=>({id,name,description,parts:entries.map(([key,name,description,offset,source])=>({id:id+'.'+key,name,description,offset,source}))});
export const slExteriorGroup=[
  group('shell','Bodywork','The long hood, front wings, two doors and reverse-opening trunk surround the two-seat cockpit.',[
    ['fenders','Front fenders and rear quarters','The pressed wheel lips rise above each tire. The side gills sit behind the front wheels.',[0,0,0],drawing],
    ['liners','Wheelhouse liners','The curved liners close the space between the tread and the fender lip.',[0,0,.22],drawing],
    ['hood','Hood and heat outlets','Two longitudinal ridges run down the hood. Two recessed grilles sit near the windshield.',[-.18,0,.46],brochure],
    ['left-door','Driver door and mirror','The left door carries its flush handle, mirror and lower sculpted line.',[0,-.40,.025],card],
    ['right-door','Passenger door and mirror','The right mirror and handle travel with the door skin.',[0,.40,.025],card],
    ['trunklid','Trunk lid and license-plate recess','The deck reverses its opening direction to clear the folding hardtop.',[.22,0,.34],card],
    ['fascia','Front and rear bumper covers','The two lower corner openings flank the central air intake. Two chrome outlets sit in the lower rear apron.',[0,0,-.21],brochure],
    ['grille','Grille, crossbar and radar cover','A single bright bar holds the three-pointed star at the center of the grille.',[-.32,0,.06],brochure],
    ['sills','Sill covers','The sill joins the front and rear wheel openings beneath each door.',[0,0,-.14],drawing]
  ]),
  group('lights','Exterior lighting','Compare the original R231 headlamp and horizontal running lights with the wraparound rear lamps.',[
    ['headlamps','Bi-xenon headlamp assemblies','An upright projector, a brow of LEDs and an amber US side marker share the swept housing.',[-.23,0,.18],brochure],
    ['running','LED daytime running lights','Separate strips sit across the lower outboard bumper openings.',[-.22,0,-.05],brochure],
    ['tail','LED rear lamp assemblies','Each lamp narrows toward the license-plate recess and extends forward along the rear quarter.',[.23,0,.045],card],
    ['high-stop','Center brake light','A slim red strip follows the center of the trunk lip and travels with the lid.',[.19,0,.13],card]
  ]),
  group('running','Sport wheels and brakes','The SL550 Sport Wheel Package uses staggered 19-inch AMG five-spoke wheels and larger front brakes.',[
    ['tires','Staggered summer tires','255/35 R19 front tires and 285/30 R19 rear tires mount on different rim widths.',[0,0,.38],wheels],
    ['rims','19-inch AMG five-spoke wheels','Five single spokes flare into the outboard face of the rim. The rear barrel is wider.',[0,0,.23],wheels],
    ['brakes','Brake discs and calipers','The optional package pairs enlarged front discs and painted calipers with perforated rear discs.',[0,0,-.16],wheels]
  ])
];

const TAU=2*Math.PI,front=-1.2925,rear=1.2925,nose=-2.2905,tail=2.32214;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;

const sample=(rows,x)=>{
  let j=1;while(j<rows.length-1&&rows[j][0]<x)j++;
  const a=rows[j-1],b=rows[j],t=clamp((x-a[0])/(b[0]-a[0]));
  return a.slice(1).map((v,i)=>mix(v,b[i+1],t));
};
// Stations digitised against both axles. The first/last stations describe
// transverse bumper sections, whose corners curl toward the wheel openings.
const stations=[
  [nose,.813,.685,.615,.197],[-2.205,.84,.730,.68,.181],[-2.04,.872,.782,.744,.159],
  [-1.85,.899,.818,.781,.143],[-1.59,.925,.857,.817,.142],[-1.2925,.926,.891,.847,.143],
  [-.98,.912,.911,.868,.145],[-.68,.900,.926,.896,.146],[-.52,.892,.931,.907,.146],
  [-.12,.885,.935,.911,.146],[.45,.897,.943,.920,.146],[.82,.919,.959,.942,.146],
  [1.03,.931,.987,.958,.146],[1.2925,.9385,1.014,.969,.146],[1.57,.936,1.034,.955,.150],
  [1.79,.926,1.019,.926,.159],[1.98,.907,1.003,.890,.182],[2.16,.887,.979,.858,.219],
  [tail,.853,.950,.828,.272]
];
function warp(x,y){
  const u=Math.abs(y)/.90;
  return x+clamp(1-(x-nose)/.72)**2*(.150*u*u+.235*u**4)
    -clamp(1-(tail-x)/.65)**2*(.10*u*u+.24*u**4);
}
function shoulder(x){return sample(stations,x);}
// The R231 plan shows the bonnet narrowing around the inboard edge of
// each lamp, with a separately rising wing over each front wheel.
function lidWidth(x){
  if(x<-.54)return sample([[nose,.545],[-2.205,.590],[-1.95,.651],[-1.53,.713],[-1.12,.754],[-.54,.775]],x)[0];
  if(x<1.08)return .753;
  return mix(.743,.597,clamp((x-1.08)/1.25));
}
const fade=(lo,hi,x)=>{const t=clamp((x-lo)/(hi-lo));return t*t*(3-2*t);};
const bell=(distance,width)=>Math.exp(-(distance*distance)/(width*width));
function top(x,y){
  const [w,c,e]=shoulder(x),ay=Math.abs(y),u=clamp(ay/w);
  const hood=fade(-2.21,-1.90,x)*(1-fade(-.98,-.65,x));
  const domeCenter=mix(.205,.319,clamp((x+2.14)/1.42));
  // The axle-registered elevation constrains the highest part of the hood.
  // Form the ridges above the recessed sheet, under that measured envelope.
  const hoodRecess=.044*fade(-2.26,-1.90,x)*(1-fade(-.88,-.57,x))*(1-u**6);
  const powerdome=hood*(.035*bell(ay-domeCenter,.074)+.011*bell(ay-domeCenter,.16));
  const wing=bell(x-front,.51)*(.032*bell(u-.82,.105)-.021*bell(u-.625,.12));
  const haunch=bell(x-rear,.60)*(.023*bell(u-.85,.14)-.021*bell(u-.63,.145));
  const inset=fade(1.70,tail,x)*(.106-.029*u*u);
  const roll=.009*bell(u-.84,.095);
  return [warp(x,y)-inset,y,mix(c,e,u**3)-hoodRecess+powerdome+wing+haunch+roll];
}
function openingBottom(x){
  const q=shoulder(x),base=q[3];
  for(const [cx,cz,rad] of [[front,.33055,.374],[rear,.3268,.372]]){
    const d=Math.abs(x-cx);
    if(d<rad)return Math.max(base,cz+Math.sqrt(Math.max(0,rad*rad-d*d)));
  }
  return base;
}
// Section pressing derived from the exterior drawing. The upper crease
// climbs from the side outlet through the handle. The lower swage crosses
// the door independently and dies into the rear wheel opening.
function flankWidth(x,z){
  const [w,,crest,base]=shoulder(x),f=clamp((z-base)/(crest-base));
  const between=fade(front-.18,front+.38,x)*(1-fade(rear-.32,rear+.12,x));
  const character=.704+.087*clamp((x+.90)/1.55);
  const swage=.382+.084*clamp((x+.88)/1.86);
  const crown=.012*bell(z-character,.026)+.012*bell(z-character,.081);
  const hollow=.037*bell(z-(character-.101),.100)+.024*bell(z-(swage+.108),.089);
  const lowerRidge=.013*bell(z-swage,.028);
  const wheelDistance=Math.min(Math.hypot(x-front,z-.33055),Math.hypot(x-rear,z-.3268));
  const arch=.009*bell(wheelDistance-.388,.020)-.006*bell(wheelDistance-.424,.025);
  return w-.062*(1-f)**2-.024*f**3+between*(crown+lowerRidge-hollow)+arch;
}
function sidePoint(x,s,t){
  const [,,crest,base]=shoulder(x),lower=openingBottom(x),z=mix(lower,crest,t);
  const y=flankWidth(x,z),f=clamp((z-base)/(crest-base));
  const fore=(.045+.067*(1-f)**1.5)*(1-fade(nose,-1.74,x));
  const aft=.104*fade(.60,.91,z)*fade(1.75,tail,x);
  return [warp(x,s*y)+fore-aft,s*y,z];
}
// Curve the door cut through the actual panel grid from shoulder to sill.
// The station immediately on either side of the joint follows the same curve.
function doorStation(x,f){
  const low=1-f,frontEdge=-.022*bell(f-.5,.25)+.012*low;
  const rearEdge=-.25*low**1.9+.012*bell(f-.71,.15);
  return x+frontEdge*Math.max(0,1-Math.abs(x+.54)/.23)+rearEdge*Math.max(0,1-Math.abs(x-.79)/.39);
}
function adjustedStation(x,y){
  // Bow the hood's rear cut to meet the foot of the windshield.
  const u=Math.min(1,Math.abs(y)/.762);
  if(x>=-1.02&&x<=-.16)return x+.142*u*u*Math.max(0,1-Math.abs(x+.685)/.33);
  // The forward edge of the deck wraps around the back of both seats.
  if(x>=.61&&x<=1.45)return x-.116*u**3*Math.max(0,1-Math.abs(x-1.01)/.4);
  return x;
}
const atRoof=(x,y)=>top(adjustedStation(x,y),y);
export const slDeckCrown=(x,k)=>atRoof(x,lidWidth(x)*k);
function meshPaint(r,points,paint){
  const [a,b,c]=points,u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]);
  let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const len=Math.hypot(...n)||1; n=n.map(q=>q/len);
  const center=points.reduce((o,p)=>o.map((q,k)=>q+p[k]/points.length),[0,0,0]);
  if(n[1]*center[1]+Math.max(0,center[2]-.42)*n[2]<0)n=n.map(q=>-q);
  const sky=clamp((n[2]+.30)/1.25),soft=Math.exp(-(((n[2]-.29)/.25)**2));
  const color=tint(paint,.74+.37*sky+.13*soft);
  r.polygon(points,color,false);const f=r.faces?.at(-1);if(f)f.slNormal=n;
}
function finishPaint(faces){
  // Share normals only inside a physical panel. The hood gap and pressed
  // shoulder retain their highlights when a neighboring panel is removed.
  const vertices=new Map(),keys=(f,p)=>f.part+':'+p.map(v=>Math.round(v*1e5)).join(',');
  for(const f of faces){
    if(!f.slNormal)continue;
    const rgb=[1,3,5].map(i=>parseInt(f.color.slice(i,i+2),16));
    for(const p of f.points){
      const k=keys(f,p);let v=vertices.get(k);
      if(!v){v={c:[0,0,0],n:[0,0,0],count:0};vertices.set(k,v);}
      for(let j=0;j<3;j++){v.c[j]+=rgb[j];v.n[j]+=f.slNormal[j];}v.count++;
    }
  }
  for(const v of vertices.values()){
    const length=Math.hypot(...v.n)||1;v.n=v.n.map(q=>q/length);
    v.c='#'+v.c.map(q=>Math.round(q/v.count).toString(16).padStart(2,'0')).join('');
  }
  for(const f of faces)if(f.slNormal){const verts=f.points.map(p=>vertices.get(keys(f,p)));
    f.vertexColors=verts.map(v=>v.c);f.clearcoatNormals=verts.map(v=>v.n);delete f.slNormal;}
}
const xGrid=(()=>{
  const base=[...stations.map(row=>row[0]),-2.205,-.685,-.54,.79,1.01];
  for(const [x,rad] of [[front,.374],[rear,.372]]){
    for(let i=0;i<=20;i++)base.push(x+rad*Math.cos(i*Math.PI/20));
    base.push(x-rad-.002,x+rad+.002);
  }
  const uniq=[...new Set(base.map(v=>+v.toFixed(6)))].sort((a,b)=>a-b);
  return uniq.flatMap((x,j)=>j&&x-uniq[j-1]>.095?[(2*uniq[j-1]+x)/3,(uniq[j-1]+2*x)/3,x]:[x]);
})();
const dirt='#2c2d31',chrome='#cbd1d2';
function skins(r,paint,deck=false,t=0){
  for(let i=1;i<xGrid.length;i++){
    const a=xGrid[i-1],b=xGrid[i],m=(a+b)/2,hood=m>=-2.205&&m<-.685,lid=m>1.01;
    for(const s of [-1,1]){
      const sideID=m>-.54&&m<.79?'shell.'+(s<0?'left':'right')+'-door':'shell.fenders';
      const outer=(x,u)=>{
        const faceStation=adjustedStation(x,s*.90);
        if(u===1)return sidePoint(faceStation,s,1);
        return atRoof(x,s*mix(lidWidth(x),shoulder(faceStation)[0]-.019,u));
      };
      if(!deck){
        r.tag(sideID,()=>{
          for(const [u,v] of [[0,.30],[.30,.68],[.68,1]])meshPaint(r,[outer(a,u),outer(b,u),outer(b,v),outer(a,v)],paint);
          const levels=[0,.025,.061,.10,.14,.16,.215,.27,.31,.355,.395,.43,.47,.515,.565,.62,.685,.735,.785,.825,.865,.905,.951,1];
          for(let j=1;j<levels.length;j++){
            const vertex=(x,u)=>sidePoint(doorStation(mix(x,adjustedStation(x,s*.90),fade(.82,1,u)),u),s,u);
            const panel=[vertex(a,levels[j-1]),vertex(b,levels[j-1]),vertex(b,levels[j]),vertex(a,levels[j])];
            if(sideID.endsWith('-door') && levels[j]<=.14)r.tag('shell.sills',()=>meshPaint(r,panel,paint));
            else meshPaint(r,panel,paint);
          }
          const sa=sidePoint(doorStation(a,0),s,0),sb=sidePoint(doorStation(b,0),s,0);
          r.polygon([sa,sb,[sb[0],sb[1]-s*.032,sb[2]],[sa[0],sa[1]-s*.032,sa[2]]],dirt,false);
        });
      }
      if(deck!==lid||(!hood&&!lid&&m>=-2.205))continue;
      const edge=(x,k)=>{
        const p=atRoof(x,s*lidWidth(x)*k);
        return lid?slDeckPoint(p,t):p;
      };
      r.tag(lid?'shell.trunklid':hood?'shell.hood':'shell.fascia',()=>{
        // A recessed-looking hem shares the fender edge exactly. A literal
        // two-millimetre slit lets isolated background pixels through on orbit.
        const rows=hood||lid?[0,.14,.225,.275,.32,.37,.42,.47,.53,.62,.72,.83,.91,.984,1]:[0,.23,.39,.48,.67,.84,1];
        for(let k=1;k<rows.length;k++){
          const hem=(hood||lid)&&k===rows.length-1;
          meshPaint(r,[edge(a,rows[k-1]),edge(b,rows[k-1]),edge(b,rows[k]),edge(a,rows[k])],hem?tint(paint,.90):paint);
        }
      });
    }
  }
}

const frontContour=[
  // half width, lower opening floor & crown, upper opening floor & crown
  [0,.195,.373,.435,.661],[.30,.19,.371,.439,.662],[.45,.19,.370,.451,.661],
  [.535,.194,.352,.472,.660],[.56,.200,.338,.497,.658],[.59,.214,.351,.534,.643],
  [.62,.210,.379,.535,.639],[.70,.222,.396,.551,.629],[.77,.240,.408,.568,.608],[.811,.277,.368,.578,.595]
];
function frontAt(y,z,inset=0){
  const h=clamp((z-.16)/.54),corner=(Math.abs(y)/.813)**4;
  const x=nose+.034*(1-h)+.041*h+.015*Math.sin(h*Math.PI)+.022*corner*(1-h);
  return [warp(x,y)+inset,y,z];
}
function cornerReturn(r,fore,paint){
  const x=fore?nose:tail,half=fore?.811:.854,base=fore?.195:.246;
  const levels=[0,.04,.10,.19,.31,.45,.58,.72,.84,.94,1];
  const crown=top(x,half)[2];
  for(const side of [-1,1]){
    const edge=(v,u)=>{
      const sideEdge=sidePoint(x,side,v),z=mix(base,crown,v);
      const end=fore?frontAt(half*side,z):rearAt(half*side,z);
      if(!fore&&z>.61)end[0]-=.076*fade(.60,.87,z);
      const peak=side*.011*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
      return [mix(end[0],sideEdge[0],u),mix(end[1],sideEdge[1],u)+peak,mix(end[2],sideEdge[2],u)];
    };
    for(let j=1;j<levels.length;j++)for(let k=0;k<3;k++){
      const a=levels[j-1],b=levels[j],u=k/3,v=(k+1)/3;
      meshPaint(r,[edge(a,u),edge(a,v),edge(b,v),edge(b,u)],paint);
    }
  }
}
function frontBand(r,y0,y1,lower,upper,paint,inset=0,coated=true){
  const pts=[frontAt(y0,lower(y0),inset),frontAt(y1,lower(y1),inset),frontAt(y1,upper(y1),inset),frontAt(y0,upper(y0),inset)];
  if(Math.abs(upper(y0)-lower(y0))+Math.abs(upper(y1)-lower(y1))<=.0001)return;
  if(coated)meshPaint(r,pts,paint);
  else r.polygon(pts,paint,false);
}
function grilleStar(r,x,y,z,R){
  const point=(u,v,d=0)=>[x+d,y+R*u,z+R*v];
  ellipse(r,[x+.001,y,z],[0,R,0],[0,0,R],1,0,'#22292c',48);
  ellipse(r,[x-.002,y,z],[0,R,0],[0,0,R],1,.921,'#cad1d3',48);
  for(let i=0;i<3;i++){
    const a=Math.PI/2-i*TAU/3,uy=Math.cos(a),uz=Math.sin(a);
    const p=point(.90*uy,.90*uz,-.004),left=point(-.125*uz,.125*uy,-.006),right=point(.125*uz,-.125*uy,-.006);
    r.polygon([left,p,point(0,0,-.008)],'#edf1f0',false);r.polygon([p,right,point(0,0,-.008)],'#91999c',false);
  }
}
function frontFascia(r,paint){
  const contour=y=>sample(frontContour,Math.abs(y)),edge=(y,k)=>contour(y)[k];
  const frontLow=y=>.158+.037*(Math.abs(y)/.813)**2;
  const crown=y=>top(nose,y)[2];
  const ys=[0,.12,.24,.36,.45,.50,.535,.56,.59,.62,.66,.70,.74,.77,.79,.811];
  for(const side of [-1,1]){
    for(let i=1;i<ys.length;i++){
      const a=side*ys[i-1],b=side*ys[i],m=Math.abs((a+b)/2);
      r.tag('shell.fascia',()=>{
        frontBand(r,a,b,frontLow,y=>edge(y,0),paint);
        frontBand(r,a,b,y=>edge(y,1),y=>edge(y,2),paint);
        if(m>=.535&&m<.59)frontBand(r,a,b,y=>edge(y,0),y=>edge(y,1),paint);
        if(m>=.59)frontBand(r,a,b,y=>edge(y,2),y=>edge(y,3),paint);
        frontBand(r,a,b,y=>edge(y,3),crown,paint);
        const ca=top(nose,a),cb=top(nose,b);
        meshPaint(r,[ca,cb,frontAt(b,cb[2]),frontAt(a,ca[2])],paint);
        // Front lip projects ahead of the lower intake.
        const l0=frontAt(a,frontLow(a)),l1=frontAt(b,frontLow(b));
        meshPaint(r,[l0,l1,[warp(nose,b),b,l1[2]-.009],[warp(nose,a),a,l0[2]-.009]],paint);
        if(m<.535||m>.59){
          const depth=m>.59?.048:.024;
          frontBand(r,a,b,y=>edge(y,0),y=>edge(y,1),'#161a1c',depth,false);
          for(const edgeId of [0,1]){
            const h0=edge(a,edgeId),h1=edge(b,edgeId);
            r.polygon([frontAt(a,h0),frontAt(b,h1),frontAt(b,h1,depth),frontAt(a,h0,depth)],
              edgeId===0?'#51585b':'#303436',false);
          }
          if(m>.59){
            const inside=y=>mix(edge(y,0),edge(y,1),.22);
            frontBand(r,a,b,y=>inside(y)-.004,y=>inside(y)+.004,'#525c60',.019,false);
          }
        }
        if(m<=.535){
          const frame=y=>clamp((Math.abs(y)-.365)/.17);
          // Central intake tapers inward toward the top; the triangular
          // painted buttress separates it from the shallow outboard duct.
          frontBand(r,a,b,y=>edge(y,1)-.088*frame(y)**1.4,y=>edge(y,1),paint,-.001);
          frontBand(r,a,b,y=>edge(y,0),y=>edge(y,0)+.014*(1-Math.abs(y)/.535),'#747d81',-.001,false);
        }
        if(m>.59){
          const mid=y=>mix(edge(y,0),edge(y,1),.55);
          frontBand(r,a,b,y=>mid(y)-.011,y=>mid(y)+.011,'#373d40',-.003,false);
          r.tag('lights.running',()=>frontBand(r,a,b,y=>mid(y)-.003,y=>mid(y)+.003,'#e2ebef',-.009,false));
        }
      });
      if(m<.59)r.tag('shell.grille',()=>{
        frontBand(r,a,b,y=>edge(y,2),y=>edge(y,3),'#191d20',.020,false);
        for(const [u,v] of [[.485,.553],[.553,.598]]){
          frontBand(r,a,b,y=>mix(edge(y,2),edge(y,3),u),y=>mix(edge(y,2),edge(y,3),v),u<.50?'#869094':'#d3dadd',-.004,false);
        }
      });
    }
    r.tag('shell.grille',()=>{
      const edgePoints=ys.filter(y=>y<=.59).map(y=>frontAt(side*y,edge(y,2),-.002));
      pipe(r,edgePoints,.0045,'#c3ccce',6);
      const lowerTop=y=>edge(y,1)-.088*clamp((Math.abs(y)-.365)/.17)**1.4;
      for(let j=1;j<29;j++){
        const a=side*j*.0182,b=side*Math.max(0,j*.0182-.105),c=side*Math.min(.531,j*.0182+.082);
        r.rod(frontAt(a,edge(a,0)+.018,.009),frontAt(b,lowerTop(b)-.005,.009),.00235,'#5a6369',4);
        r.rod(frontAt(a,edge(a,0)+.018,.010),frontAt(c,lowerTop(c)-.005,.010),.0016,'#424a4f',4);
      }
      // Fine diagonal grille bars lie inside the bezel and beneath its bright crossbar.
      for(let j=1;j<19;j++){
        const a=side*j*.030,b=side*(j*.030-.026);
        r.rod(frontAt(a,edge(a,2)+.009,.012),frontAt(b,edge(b,3)-.008,.012),.0017,'#343b3e',4);
      }
    });
  }
  r.tag('shell.grille',()=>grilleStar(r,frontAt(0,.548,-.018)[0],0,.548,.111));
  r.tag('shell.fascia',()=>{
    const u=[0,.32,.61,.813];for(const s of [-1,1])for(let j=1;j<u.length;j++){
      const a=s*u[j-1],b=s*u[j];
      meshPaint(r,[[warp(nose,a),a,frontLow(a)-.009],[warp(nose,b),b,frontLow(b)-.009],[warp(nose,b),b,.15],[warp(nose,a),a,.15]],paint);
    }
  });
}
function lampPoint(side,u,v){
  const q=sample([[0,.565,.468,.625,.024],[.13,.591,.480,.658,.023],[.45,.680,.510,.698,.039],[.75,.766,.555,.738,.073],[1,.838,.659,.749,.112]],u);
  const [y,low,high,sweep]=q;
  const x=warp(nose,side*y)+sweep+.133*v*v+.147*u*u-.021*Math.sin(Math.PI*v);
  return [x,side*y,mix(low,high,v)];
}
// Register the formed lens to the cheek that actually carries it. At the
// outer corner that cheek turns from a front-facing to a side-facing panel.
function lampSeat(faces,forward=true){
  const triangles=[];
  for(const f of faces){
    if(f.points.every(p=>forward?p[0]>-1.6:p[0]<1.55)||!['shell.fascia','shell.fenders','shell.hood'].includes(f.part))continue;
    const ix=faceTriangles(f.points);
    for(let i=0;i<ix.length;i+=3)triangles.push(ix.slice(i,i+3).map(j=>f.points[j]));
  }
  return nominal=>{
    const [,y,z]=nominal;let x=forward?Infinity:-Infinity;
    for(const [a,b,c] of triangles){
      const dy=b[1]-a[1],dz=b[2]-a[2],ey=c[1]-a[1],ez=c[2]-a[2],den=dy*ez-dz*ey;
      if(Math.abs(den)<1e-10)continue;
      const k=((y-a[1])*ez-(z-a[2])*ey)/den,l=(dy*(z-a[2])-dz*(y-a[1]))/den;
      if(Math.min(k,l,1-k-l)<-1e-7)continue;
      const hit=a[0]+k*(b[0]-a[0])+l*(c[0]-a[0]);x=forward?Math.min(x,hit):Math.max(x,hit);
    }
    const mounted=forward?Math.min(nominal[0],x):Math.max(nominal[0],x);
    return [mounted+(forward?-.006:.004),Math.sign(y)*(Math.abs(y)+.0018),z+.0008];
  };
}
function frontLamps(r){
  const seat=lampSeat(r.faces||[]);

  for(const s of [-1,1])r.tag('lights.headlamps',()=>{
    // Register the optical stack once to a common fitted shell. Interpolate
    // within the mounted grid when shaping the reflector, guide and lens.
    const nu=14,nv=7;
    const grid=Array.from({length:nu+1},(_,i)=>Array.from({length:nv+1},(_,j)=>seat(lampPoint(s,i/nu,j/nv))));
    const p=(u,v,d=0)=>{
      const a=clamp(u)*nu,b=clamp(v)*nv,i=Math.min(nu-1,Math.floor(a)),j=Math.min(nv-1,Math.floor(b));
      const q=grid[i][j].map((_,k)=>mix(mix(grid[i][j][k],grid[i+1][j][k],a-i),mix(grid[i][j+1][k],grid[i+1][j+1][k],a-i),b-j));
      return [q[0]-d*.89,q[1]+s*d*(.25+.42*u),q[2]+d*.24];
    };
    drawLampOptics(r,p);
    const edge=[];for(let i=0;i<=nu;i++)edge.push(p(i/nu,0,.006));
    for(let j=1;j<=nv;j++)edge.push(p(1,j/nv,.006));
    for(let i=nu-1;i>=0;i--)edge.push(p(i/nu,1,.006));
    for(let j=nv-1;j>=0;j--)edge.push(p(0,j/nv,.006));
    pipe(r,edge,.0036,'#33383a',5);
  });
}
function hoodDetails(r){
  // The rear bonnet hem overlaps the stationary cowl tray. Its short flange
  // closes the sightline between the curved hood cut and the dashboard.
  r.tag('shell.liners',()=>{
    const lip=(u,depth)=>{
      const y=.776*u,x=-.685+.146*u*u;
      return [x+depth,y,.897-.012*u*u];
    };
    for(let i=-12;i<12;i++){
      const a=i/12,b=(i+1)/12;
      r.polygon([lip(a,-.025),lip(b,-.025),lip(b,.075),lip(a,.075)],'#2e3132',false);
    }
  });
  r.tag('shell.hood',()=>{
    for(const s of [-1,1]){
      // The paired outlet apertures follow the longitudinal bonnet domes.
      // Their underlying domed sheet is curved in both axes, so the bed and
      // the two bright vanes are sampled along that same surface.
      const vent=(u,v,lift=.008)=>{
        const y=mix(.365,.624,v),frontEdge=-1.082+.108*v**1.6+.014*(1-v)**6;
        const rearEdge=-.803+.036*v-.011*v**8;
        const q=top(mix(frontEdge,rearEdge,u),s*(y+.011*u));q[2]+=lift;return q;
      };
      for(let i=0;i<8;i++)for(let j=0;j<12;j++){
        const a=i/8,b=(i+1)/8,l=j/12,h=(j+1)/12;
        const color=i===0||i===7||j===0||j===11?'#555e61':j%2?'#292f31':'#42494a';
        r.polygon([vent(a,l),vent(b,l),vent(b,h),vent(a,h)],color,false);
      }
      for(const v of [.28,.69])for(let i=0;i<8;i++){
        const a=i/8,b=(i+1)/8,extra=u=>.012+.009*Math.sin(Math.PI*u);
        r.polygon([vent(a,v,extra(a)),vent(b,v,extra(b)),vent(b,v+.055,extra(b)),vent(a,v+.055,extra(a))],chrome,false);
      }
    }
    const topBadge=top(-2.13,0);topBadge[2]+=.001;
    ellipse(r,topBadge,[.026,0,.007],[0,.024,0],1,0,'#68747b',18);
    ellipse(r,[topBadge[0],0,topBadge[2]+.0015],[.024,0,.007],[0,.023,0],1,.79,chrome,18);
  });
}
// Register thin trim against the triangles the renderer actually displays.
// The curved flanks bend enough to intersect a straight chord between stations.
function paintedFlankSampler(faces){
  const bins=new Map(),cell=x=>Math.floor(x*8);
  for(const face of faces){
    if(!['shell.fenders','shell.right-door','shell.sills'].includes(face.part)||face.points[0][1]<.69)continue;
    const indices=faceTriangles(face.points);
    for(let i=0;i<indices.length;i+=3){
      const [a,b,c]=indices.slice(i,i+3).map(k=>face.points[k]);
      const dx=b[0]-a[0],dz=b[2]-a[2],ex=c[0]-a[0],ez=c[2]-a[2],det=dx*ez-dz*ex;
      if(Math.abs(det)<1e-9)continue;
      const triangle=[a,b,c,dx,dz,ex,ez,det];
      for(let k=cell(Math.min(a[0],b[0],c[0]));k<=cell(Math.max(a[0],b[0],c[0]));k++){
        if(!bins.has(k))bins.set(k,[]);bins.get(k).push(triangle);
      }
    }
  }
  return (x,z)=>{
    let y=-Infinity;
    for(const [a,b,c,dx,dz,ex,ez,det] of bins.get(cell(x))||[]){
      const u=((x-a[0])*ez-(z-a[2])*ex)/det,v=(dx*(z-a[2])-dz*(x-a[0]))/det;
      if(Math.min(u,v,1-u-v)>=-1e-7)y=Math.max(y,a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]));
    }
    return Number.isFinite(y)?y:flankWidth(x,z);
  };
}
function sideDetails(r,paint){
  const surface=paintedFlankSampler(r.faces);
  for(const s of [-1,1]){
    const side=(x,z,proud=.002)=>[x,s*(surface(x,z)+proud),z];
    r.tag('shell.fenders',()=>{
      // The air outlet leans aft and narrows downward behind the front axle.
      const vent=(v,u,extra=0)=>{
        const z=mix(.440,.680,v),leading=mix(-.750,-.880,v),aft=mix(-.635,-.724,v);
        return side(mix(leading,aft,u),z+.010*u,.005+extra);
      };
      for(let j=1;j<=8;j++)for(let k=1;k<=3;k++){
        const a=(j-1)/8,b=j/8,u=(k-1)/3,v=k/3;
        r.polygon([vent(a,u),vent(a,v),vent(b,v),vent(b,u)],k===1?'#393e3f':'#272d2e',false);
      }
      for(const z of [.529,.611]){
        const length=.292,at=(u,h)=>side(-.888+u*length,z+.012*u+h,.007+.006*Math.sin(u*Math.PI));
        for(let i=0;i<10;i++){
          const u=i/10,v=(i+1)/10;
          r.polygon([at(u,-.004),at(v,-.004),at(v,.003),at(u,.003)],'#858c8f',false);
          r.polygon([at(u,.003),at(v,.003),at(v,.010),at(u,.010)],chrome,false);
        }
      }
    });
    r.tag('shell.sills',()=>{
      const ends=[front+.375,-.78,-.56,-.25,.12,.44,.65,.78,rear-.373];
      for(let j=1;j<ends.length;j++){
        const a=ends[j-1],b=ends[j];
        const cross=x=>{
          const arch=Math.abs(x)/.92,topZ=.246+.011*arch;
          return [side(x,topZ,.002),side(x,topZ-.013,.002),side(x,.198,.012),
            side(x,.168,.021*(1-.6*arch**2)),side(x,.146,.013)];
        };
        const q=cross(a),v=cross(b);
        for(let i=1;i<q.length;i++)meshPaint(r,[q[i-1],v[i-1],v[i],q[i]],i===1?tint(paint,.92):paint);
      }
    });
    r.tag('shell.'+(s<0?'left':'right')+'-door',()=>{
      // The raised pull bridges a shallow pocket cut into the upper crease.
      const pocket=(a,u=1)=>{
        const x=.555+.098*u*Math.cos(a),z=.797+.023*u*Math.sin(a)+.007*u*Math.cos(a);
        return side(x,z,.006);
      };
      const cavity=Array.from({length:24},(_,k)=>pocket(k*TAU/24));
      r.polygon(cavity,tint(paint,.63),false);
      const pull=[side(.467,.788,.006),side(.488,.794,.023),side(.515,.800,.033),
        side(.590,.805,.034),side(.614,.807,.023),side(.639,.804,.006)];
      pipe(r,pull,.0125,tint(paint,.89),9);
      pipe(r,pull.slice(1,-1).map(([x,y,z])=>[x,y+s*.006,z+.006]),.0048,chrome,6);
      const doorEdge=(cut,z)=>{
        const [,,crest,base]=shoulder(cut),f=clamp((z-base)/(crest-base));
        return side(doorStation(mix(cut,adjustedStation(cut,s*.9),fade(.82,1,f)),f),z,.0036);
      };
      const leading=Array.from({length:36},(_,k)=>doorEdge(-.54,mix(.897,.27,k/35)));
      const trailing=Array.from({length:36},(_,k)=>doorEdge(.79,mix(.925,.274,k/35)));
      pipe(r,[...leading,side(-.51,.25),side(-.30,.248),side(.09,.25),side(.40,.254),...trailing.reverse()],.0029,tint(paint,.45),6);
      // Mirror on the door, with foreshortened glass on its rear face.
      pipe(r,[[-.348,s*.794,.904],[-.336,s*.864,.937],[-.310,s*.897,.977]],.024,'#383c3e',8);
      const cx=-.324,cy=.93358;
      const rows=[[-.085,.063,.025],[-.062,.095,.041],[-.012,.111,.050],[.033,.108,.046],[.055,.095,.040]];
      for(let k=1;k<rows.length;k++){
        const ring=row=>Array.from({length:17},(_,j)=>[cx+row[0],s*(cy+row[1]*Math.cos(TAU*j/16)),.991+row[2]*Math.sin(TAU*j/16)]);
        const a=ring(rows[k-1]),b=ring(rows[k]);
        for(let j=1;j<a.length;j++)meshPaint(r,[a[j-1],a[j],b[j],b[j-1]],j>8?'#393d40':paint);
      }
      ellipse(r,[cx-.085,s*cy,.991],[0,.063,0],[0,0,.025],1,0,paint,16);
      ellipse(r,[cx+.056,s*cy,.991],[0,.095,0],[0,0,.040],1,.89,'#42494b',20);
      ellipse(r,[cx+.057,s*cy,.991],[0,.095,0],[0,0,.04],.89,0,'#94a3aa',20);
      pipe(r,[[cx-.076,s*(cy+.032),.985],[cx-.066,s*(cy+.080),.986],[cx-.012,s*(cy+.112),.984]],.004,'#e7e8db',6);
    });
  }
}
function rearAt(y,z,offset=0){
  // Rolled cover projects farther than the lid at the beltline and pulls in
  // underneath. x=tail occurs on the central bumper crown.
  const recess=z>.584?.044*(z-.584)/.32:.094*clamp((.53-z)/.28)**2;
  return [warp(tail,y)-recess+offset,y,z];
}
// Intersect a horizontal ray with the formed rear quarter. All rows of the
// lamp use this same circumferential coordinate, keeping the bands continuous
// as they cross the side skin, corner pressing and rear fascia.
function rearLensMount(faces){
  const origin=1.55;
  const tris=[];
  for(const f of faces){
    if(!['shell.fenders','shell.fascia'].includes(f.part)||f.points.every(p=>p[0]<1.73))continue;
    const ix=faceTriangles(f.points);
    for(let i=0;i<ix.length;i+=3){
      const tri=ix.slice(i,i+3).map(j=>f.points[j]);
      const heights=tri.map(p=>p[2]);
      tris.push({tri,lo:Math.min(...heights),hi:Math.max(...heights)});
    }
  }
  return (side,u,z,nominal)=>{
    const a=u*Math.PI/180,nx=Math.cos(a),ny=side*Math.sin(a);
    let far=0;
    for(const {tri,lo,hi} of tris){
      if(z<=lo||z>=hi)continue;
      const hit=[];
      for(let i=0;i<3;i++){
        const p=tri[i],q=tri[(i+1)%3];
        if((p[2]>z)===(q[2]>z))continue;
        const k=(z-p[2])/(q[2]-p[2]);
        hit.push([mix(p[0],q[0],k)-origin,mix(p[1],q[1],k)]);
      }
      if(hit.length!==2)continue;
      const [p,q]=hit,dx=q[0]-p[0],dy=q[1]-p[1],den=nx*dy-ny*dx;
      if(Math.abs(den)<1e-9)continue;
      const t=(p[0]*ny-p[1]*nx)/den;
      if(t>=0&&t<=1)far=Math.max(far,(p[0]*dy-p[1]*dx)/den);
    }
    const radial=Math.max(nominal,far)+.006;
    return [origin+radial*nx,radial*ny,z];
  };
}
function rearFascia(r,paint){
  const mount=rearLensMount(r.faces||[]);
  const ys=[0,.17,.35,.46,.48,.554,.68,.766,.819,.854];
  // The painted ledge below the lens meets the lid under the license plate.
  const sill=y=>sample([[0,.613],[.46,.611],[.48,.630],[.554,.634],[.68,.642],[.819,.656],[.854,.692]],y)[0];
  for(const side of [-1,1]){
    r.tag('shell.fascia',()=>{
      const hh=[.27,.31,.36,.42,.50,.56,.605,.625];
      for(let k=1;k<ys.length;k++)for(let j=1;j<hh.length;j++){
        const pt=(u,z)=>rearAt(side*u,z===.625?sill(u):z-.024*(u/.85)**2);
        meshPaint(r,[pt(ys[k-1],hh[j-1]),pt(ys[k],hh[j-1]),pt(ys[k],hh[j]),pt(ys[k-1],hh[j])],j<=2?'#383d40':paint);
      }
      const pts=[[-.104,-.028],[-.086,-.043],[.086,-.043],[.117,.028],[.089,.047],[-.089,.043]];
      const ring=f=>pts.map(([y,z])=>rearAt(side*(.628+y*f),.335+z*f,.013));
      const a=ring(1),b=ring(.84);r.polygon(b,'#222629',false);for(let j=0;j<a.length;j++){const n=(j+1)%a.length;r.polygon([a[j],a[n],b[n],b[j]],chrome,false);}
      const q=rearAt(side*.796,.502,.004);ellipse(r,q,[0,.065,0],[0,0,.008],1,0,'#9d343b',16);
    });
    r.tag('lights.tail',()=>{
      const stations=[
        [31.5,.884,.625,.638],[36,.907,.632,.683],[41,.936,.637,.735],[47,.959,.647,.783],
        [52,.961,.653,.805],[57,.955,.664,.822],[61,.943,.676,.837],[65,.934,.692,.849],
        [70,.927,.735,.858],[74,.912,.780,.868],[79,.905,.851,.865]
      ];
      const rows=[0,.065,.16,.28,.36,.47,.57,.68,.72,.83,.94,1];
      const colors=['#5b1920','#9e2732','#db4343','#8e232b','#b72b32','#e84c47','#ab3037','#701f29','#d4cbc2','#a94850','#71202c'];
      let last=null;
      for(let station=0;station<=40;station++){
        const angle=mix(31.5,79,station/40);
        const [d,lo,hi]=sample(stations,angle);
        const next=rows.map(v=>mount(side,angle,mix(lo,hi,v),d));
        if(last)for(let k=1;k<rows.length;k++)
          r.polygon([last[k-1],next[k-1],next[k],last[k]],colors[k-1],false);
        last=next;
      }
    });
  }
}
const lowerDeck=u=>sample([[0,.612],[.46,.61],[.48,.633],[.554,.692],[.68,.753],[.819,.818],[.875,.832]],u)[0];
function deckFace(y,z){
  const u=Math.abs(y),hi=top(tail,y),lo=lowerDeck(u);
  const v=clamp((z-lo)/(hi[2]-lo)),q=rearAt(y,z);
  q[0]=mix(q[0],hi[0],v);
  // Trapezoidal pressed recess with a formed sill at its lower edge and a
  // handle above the US plate. Brochure p. 9 gives its relation to the lamps.
  const socket=.255+.071*v;
  const pocket=(1-fade(socket,socket+.055,u))*fade(.605,.654,z)*(1-fade(.813,.862,z));
  q[0]-=.062*pocket;
  return q;
}
export const slDeckCameraMount=(y=0,z=.831)=>deckFace(y,z);
function rearDeck(r,paint,t,drawFixed=false){
  const pose=p=>slDeckPoint(p,t),ys=[0,.14,.20,.255,.285,.32,.355,.39,.46,.48,.52,.554,.597,.67,.68,.74,.81,.853];
  for(const s of [-1,1])for(let i=1;i<ys.length;i++){
    const a=ys[i-1],b=ys[i],isDeck=b<=.597;
    if(isDeck===drawFixed)continue;
    const p=(u,v)=>{
      const z=mix(lowerDeck(u),top(tail,s*u)[2],v),q=deckFace(s*u,z);
      return isDeck?pose(q):q;
    };
    r.tag(isDeck?'shell.trunklid':'shell.fenders',()=>{
      const levels=[0,.04,.095,.155,.32,.49,.56,.63,.7,.77,.87,1];
      for(let j=1;j<levels.length;j++)meshPaint(r,[p(a,levels[j-1]),p(b,levels[j-1]),p(b,levels[j]),p(a,levels[j])],paint);
    });
  }
  if(drawFixed)return;
  r.tag('shell.trunklid',()=>{
    const face=(y,z,offset)=>{const p=deckFace(y,z);p[0]+=offset;return pose(p);};
    const shape=(half,bottom,top,d)=>[face(-half,bottom,d),face(half,bottom,d),face(half,top,d),face(-half,top,d)];
    r.polygon(shape(.161,.650,.808,.006),'#33383c',false);
    r.polygon(shape(.151,.655,.803,.008),'#c6c9c3',false);
    const badgeZ=.876,rad=.038,ring=(f,a)=>face(rad*f*Math.cos(a),badgeZ+rad*f*Math.sin(a),.003);
    const outline=Array.from({length:30},(_,i)=>ring(1,i*TAU/30));r.polygon(outline,'#72787a',false);
    for(let j=0;j<30;j++){const a=j*TAU/30,b=(j+1)*TAU/30;r.polygon([ring(.90,a),ring(1,a),ring(1,b),ring(.90,b)],chrome,false);}
    for(let j=0;j<3;j++){const a=j*TAU/3+Math.PI/2;
      r.polygon([ring(.16,a+Math.PI/2),ring(.98,a),ring(.16,a-Math.PI/2)],'#e7e9e8',false);
    }
  });
  r.tag('lights.high-stop',()=>{
    const band=(y,z)=>{const p=deckFace(y,z);p[0]+=.0025;return pose(p);};
    for(let i=-4;i<4;i++){const a=i*.074,b=(i+1)*.074;r.polygon([band(a,.925),band(b,.925),band(b,.934),band(a,.934)],'#9b2b36',false);}
  });
}
function wheelhouse(r,x,z,radius,s){
  r.tag('shell.liners',()=>{
    const p=(phase,w)=>[x+radius*Math.cos(phase),s*w,z+radius*Math.sin(phase)];
    r.polygon([[x+.369,s*.608,.19],...Array.from({length:25},(_,j)=>p(j*Math.PI/24,.608)),[x-.369,s*.608,.19]],'#323539',false);
    for(let i=0;i<24;i++){
      const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
      r.polygon([p(a,.885),p(b,.885),p(b,.61),p(a,.61)],'#292c30',false);
    }
  });
}
function slotPanels(r,x,plane,z,r0,r1,holes){
  // Annular brake track with actual pierced holes. Shared outer edges meet
  // the neighboring sector. A small inner ring forms each opening.
  for(let i=0;i<holes;i++){
    const a=i*TAU/holes,b=(i+1)*TAU/holes,c=(a+b)/2;
    const at=(rad,angle)=>[x+rad*Math.cos(angle),plane,z+rad*Math.sin(angle)];
    const ring=[at(r0,a),at(r1,a),at(r1,c),at(r1,b),at(r0,b),at(r0,c)];
    const R=(r0+r1)/2,centre=at(R,c);
    const rim=ring.map(p=>{
      const dx=p[0]-centre[0],dz=p[2]-centre[2],length=Math.hypot(dx,dz);
      return [centre[0]+.0038*dx/length,plane,centre[2]+.0038*dz/length];
    });
    for(let j=0;j<6;j++){const n=(j+1)%6;r.polygon([ring[j],ring[n],rim[n],rim[j]],'#71797c',false);}
  }
}
function sportBrake(r,{x,y,z,width,side:s,rear}){
  const plane=y+s*width*.15,R=rear?.160:.179;
  const thickness=rear?.022:.034,inside=plane-s*thickness;
  // Give both cheeks of the disc actual openings and a visible vent gap.
  // The row spacing is illustrative; the US catalogue specifies perforated discs.
  for(const face of [inside,plane]){
    slotPanels(r,x,face,z,R*.58,R*.80,24);
    slotPanels(r,x,face,z,R*.80,R,30);
  }
  r.tubeY(x,plane,plane-s*.006,z,R,'#697076',48);
  r.tubeY(x,inside+s*.006,inside,z,R,'#535a60',48);
  for(let j=0;j<30;j++){
    const a=TAU*j/30;
    const vane=(rad,offset,d)=>[x+rad*Math.cos(a+offset),d,z+rad*Math.sin(a+offset)];
    r.polygon([vane(R*.83,0,inside+s*.006),vane(R*.97,.07,inside+s*.006),
      vane(R*.97,.07,plane-s*.006),vane(R*.83,0,plane-s*.006)],'#484c50',false);
  }
  const hat=plane+s*.010;
  r.tubeY(x,plane,hat,z,R*.58,'#747779',36);
  r.ringY(x,hat,z,R*.58,.035,'#777a7b',36);
  // Profile the caliper around the outer track. The slot between the pads
  // straddles the rotor; the bridge joins the two cheeks outside its radius.
  const angle=rear?Math.PI-.22:.13;
  const sector=(station,dist,dy)=>[x+dist*Math.cos(angle+station),dy,z+dist*Math.sin(angle+station)];
  const steps=[[-.50,.79,.97],[-.40,.72,1.052],[-.23,.69,1.09],[.02,.72,1.105],[.25,.71,1.08],[.42,.77,1.045],[.49,.86,.98]];
  const wall=(a,b,ra,rb,d,e,color)=>r.polygon([sector(a[0],ra*R,d),sector(b[0],rb*R,d),sector(b[0],rb*R,e),sector(a[0],ra*R,e)],color,false);
  const cap=(a,b,k1,k2,d,color)=>r.polygon([sector(a[0],k1(a)*R,d),sector(b[0],k1(b)*R,d),sector(b[0],k2(b)*R,d),sector(a[0],k2(a)*R,d)],color,false);
  for(let j=1;j<steps.length;j++){
    const a=steps[j-1],b=steps[j],frontFace=plane+s*(rear?.015:.019),backFace=inside-s*.014;
    for(const [tip,root,col] of [[frontFace,plane+s*.002,'#85888a'],[backFace,inside-s*.002,'#64696b']]){
      cap(a,b,p=>p[1],p=>p[2],tip,col);
      wall(a,b,a[1],b[1],tip,root,'#545b60');wall(a,b,a[2],b[2],tip,root,'#727679');
      if(j===1||j===steps.length-1){
        const end=j===1?a:b;
        r.polygon([sector(end[0],end[1]*R,tip),sector(end[0],end[2]*R,tip),sector(end[0],end[2]*R,root),sector(end[0],end[1]*R,root)],'#555c60',false);
      }
    }
    if(j===2||j===5){
      const outerFace=plane+s*(rear?.016:.020);
      cap(a,b,p=>p[1]+.050,p=>p[2]-.044,outerFace,'#666c6f');
    }
    if(a[2]>1&&b[2]>1)wall(a,b,a[2],b[2],inside-s*.002,plane+s*.002,'#62696c');
  }
}
function rim(r,{x,y,z,rim:R,width,side:s,finish}){
  const lip=y+s*width*.47,hub=lip-s*.037;
  const anglePoint=(a,rad,shift,d)=>[x+rad*Math.cos(a)-shift*Math.sin(a),d,z+rad*Math.sin(a)+shift*Math.cos(a)];
  const color=k=>tint(finish,k);
  // The painted drop centre, rolled bead and outer flange form a continuous
  // section. The pitched face catches light even in a head-on wheel view.
  const profile=[[-width*.94,.938],[-width*.79,.903],[-.071,.877],[-.034,.89],[-.010,.935],[-.002,.967],[.001,.987],[0,1]];
  const shades=[.39,.34,.41,.53,.74,.90,1.04];
  for(let j=1;j<profile.length;j++){
    const [d0,r0]=profile[j-1],[d1,r1]=profile[j];
    for(let i=0;i<48;i++){
      const a=TAU*i/48,b=TAU*(i+1)/48;
      r.polygon([anglePoint(a,r0*R,0,lip+s*d0),anglePoint(b,r0*R,0,lip+s*d0),
        anglePoint(b,r1*R,0,lip+s*d1),anglePoint(a,r1*R,0,lip+s*d1)],color(shades[j-1]),false);
    }
  }
  // US brochure p.27, bottom left: each machined blade has one long,
  // recessed tapered pocket around the lug. The rim junction is broad and flat.
  r.ringY(x,hub-s*.006,z,.063,0,color(.72),40);
  for(let i=0;i<5;i++){
    const angle=Math.PI/2+TAU*i/5;
    // radius, spoke half-width, pocket half-width, face relief above hub
    const rows=[[.034,.023,.003,0],[.048,.034,.012,.002],[.061,.033,.011,.004],[.090,.022,.008,.010],
      [.111,.020,.005,.015],[.120,.020,0,.017],[.162,.019,0,.025],[.206,.020,0,.034],[R*.98,.023,0,.036]];
    const edge=(row,k,h)=>anglePoint(angle,row[0],k,hub+s*(row[3]+h));
    for(let n=1;n<rows.length;n++){
      const a=rows[n-1],b=rows[n];
      for(const flank of [-1,1]){
        const at=(row,w,d)=>edge(row,flank*w,d);
        const face=(w0,d0,w1,d1,col)=>r.polygon([at(a,w0(a),d0),at(b,w0(b),d0),at(b,w1(b),d1),at(a,w1(a),d1)],col,false);
        face(q=>q[2],0,q=>q[1]-.0035,-.001,color(1.04));
        face(q=>q[1]-.0035,-.001,q=>q[1],-.004,color(flank===1?.83:.91));
        face(q=>q[1],-.004,q=>q[1]-.001,-.019,color(.51));
        face(q=>q[1]-.001,-.019,()=>0,-.020,color(.45));
        if(a[2]||b[2]){
          face(q=>q[2],0,q=>q[2]*.67,-.006,color(.44));
          face(q=>q[2]*.67,-.006,()=>0,-.006,color(.62));
        }
      }
    }
    const bolt=anglePoint(angle,.053,0,hub);
    r.ringY(bolt[0],hub+s*.003,bolt[2],.0095,0,'#45494b',14);
    r.tubeY(bolt[0],hub+s*.003,hub+s*.007,bolt[2],.0070,'#666c6f',6);
    r.ringY(bolt[0],hub+s*.007,bolt[2],.0070,0,'#a8acaf',6);
  }
  const cap=hub+s*.008;
  r.ringY(x,cap,z,.034,.029,'#959da4',28);
  r.ringY(x,cap,z,.029,.025,'#454e65',28);
  r.ringY(x,cap,z,.025,0,'#888d94',28);
  for(let i=0;i<3;i++){
    const a=Math.PI/2+i*TAU/3;
    for(const k of [-1,1]){
      r.polygon([anglePoint(a,-.003,k*.004,cap+s*.0008),anglePoint(a,.024,0,cap+s*.001),
        anglePoint(a,0,0,cap+s*.0035)],k>0?'#e0e2e5':'#a9afb4',false);
    }
  }
}
export function drawSLDeck(r,paint='#abb0b2',openFraction=0){
  const start=r.faces?.length||0;skins(r,paint,true,openFraction);rearDeck(r,paint,openFraction);
  if(r.faces)finishPaint(r.faces.slice(start));
}
export function drawSLExterior(r,paint='#abb0b2',finish='#c5c8c9',openFraction=0){
  const start=r.faces?.length||0;
  skins(r,paint);r.tag('shell.fascia',()=>{cornerReturn(r,true,paint);cornerReturn(r,false,paint);});frontFascia(r,paint);frontLamps(r);sideDetails(r,paint);hoodDetails(r);rearDeck(r,paint,0,true);rearFascia(r,paint);
  for(const s of [-1,1])for(const back of [false,true]){
    const z=back?.3268:.33055;
    wheelhouse(r,back?rear:front,z,back?.368:.370,s);
    wheel(r,{x:back?rear:front,y:s*(back?.802:.800),z,radius:z,width:back?.285:.255,rim:.2413,brakeRim:back?.238:.235,
      side:s,rear:back,finish,drawRim:rim,drawBrake:sportBrake,tags:{tire:'running.tires',rim:'running.rims',brake:'running.brakes'}});
  }
  if(r.faces)finishPaint(r.faces.slice(start));drawSLDeck(r,paint,openFraction);
}
export function slBumperPoint(front,y,z){return front?frontAt(y,z):rearAt(y,z);}
