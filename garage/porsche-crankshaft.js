// From flywheel to pulley the pins alternate between the two banks. Mated
// opposing cylinders get separate pins 180° apart. Each bank has 120° spacing.
import {TAU,tint} from './mechanism-shapes.js';
export const mainStations=Object.freeze(Array.from({length:7},(_,i)=>(i-3)*.16));
export const pinPhases=Object.freeze([0,180,120,300,240,60]);
// The throws interleave banks when counted from the flywheel. No pair shares
// a rod pin. Cylinder numbers start at the pulley on each bank.
export const cylinderForPin=Object.freeze([3,6,2,5,1,4]);
const angles=pinPhases.map(v=>v*Math.PI/180);
const groups=['mains','pins','webs','ends'];
const silver='#c7d0cc',forging='#657078',edge='#859097';
const cos=Math.cos,sin=Math.sin;
export function rodPin(index,phase=0){
  const angle=angles[index]+.29-phase*TAU;
  return [(index-2.5)*.16,.096*cos(angle),.096*sin(angle)];
}
function tube(r,c,start,end,radius,color,n=26){
  const rings=[start,end].map(dx=>Array.from({length:n},(_,i)=>{
    const a=TAU*i/n;return[c[0]+dx,c[1]+radius*cos(a),c[2]+radius*sin(a)];
  }));
  for(let i=0;i<n;i++){
    const j=(i+1)%n,a=TAU*(i+.5)/n;
    r.polygon([rings[0][i],rings[0][j],rings[1][j],rings[1][i]],tint(color,.64+.33*(1+sin(a+.25))/2+.16*Math.max(0,cos(a-1.05))**12),false);
  }
}
function crankWeb(r,index,hand,phase,modern){
  const a=angles[index]+.29-phase*TAU,c=cos(a),s=sin(a),center=(index-2.5)*.16+hand*.047;
  // The lighter inner cheeks bridge the adjacent journals. The heavier cheeks
  // have a broad swept counterweight opposite their rod pin. Shape, end radii
  // and drilling come from the appearance of the part, not a machining drawing.
  const heavy=index===0||index===5||(index<3?hand<0:hand>0);
  const heel=heavy?(modern?.160:.153):.071;
  const outline=[[.142,0],[.138,.025],[.122,.043],[.096,.049],[.067,.043],
    [.037,.043],[.013,.053],[-.022,.072],[-heel*.53,.083],[-heel*.82,.062],[-heel*.97,.035],
    [-heel,0],[-heel*.98,-.035],[-heel*.82,-.064],[-heel*.52,-.082],[-.022,-.071],
    [.009,-.054],[.036,-.044],[.065,-.042],[.096,-.049],[.122,-.044],[.139,-.023]];
  const stations=[[-.017,.96],[-.013,1],[.013,1],[.017,.96]];
  const loops=stations.map(([dx,k])=>outline.map(([u,v])=>[center+dx,k*(u*c-v*s),k*(u*s+v*c)]));
  r.polygon(loops[0],tint(forging,1.02),false);r.polygon(loops[3],tint(forging,1.13),false);
  for(let j=1;j<loops.length;j++)for(let i=0;i<outline.length;i++){
    const k=(i+1)%outline.length,lit=.77+.19*(((outline[i][0]*c-outline[i][1]*s)/.16+1)*.5);
    r.polygon([loops[j-1][i],loops[j-1][k],loops[j][k],loops[j][i]],tint(j===2?forging:edge,lit+(j===3?.10:0)),false);
  }
}
function oilPort(r,c,rad,phase,i){
  const a=angles[i]+.72-phase*TAU,ny=cos(a),nz=sin(a);
  const opening=Array.from({length:12},(_,j)=>{
    const b=TAU*j/12,dx=.0057*cos(b),q=.0055*sin(b),h=Math.sqrt(rad*rad-q*q)+.0003;
    return[c[0]+dx,c[1]+ny*h-nz*q,c[2]+nz*h+ny*q];
  });
  r.polygon(opening,'#424b4d',false);
}
function spindles(r,phase,modern){
  const origin=[0,0,0],n=28;
  for(const [a,b,rad] of [[-.561,-.500,.059],[-.591,-.560,.088],[-.606,-.589,.107],[.500,.537,.064],[.536,.574,.047],[.573,.612,modern?.045:.047],[.611,.655,.035]]){
    tube(r,origin,a,b,rad,silver,n);
    // Stepped shoulders expose their annular faces rather than an empty gap.
    const radius=(a<0?.047:.032);
    for(const pos of [a,b])for(let j=0;j<n;j++){
      const point=(k,h)=>[pos,h*cos(k*TAU/n),h*sin(k*TAU/n)];
      r.polygon([point(j,radius),point(j,rad),point(j+1,rad),point(j+1,radius)],'#919b9b',false);
    }
  }
  if(modern){
    // The first-generation 992 parts plate shows three distinct rows on the
    // drive end. A representative tooth spacing is used at this scale.
    for(const pos of [.556,.578,.600]){
      const ring=dx=>Array.from({length:48},(_,i)=>{
        const a=i*TAU/48-phase*TAU,r=i%2?.049:.055;
        return[pos+dx,r*cos(a),r*sin(a)];
      });
      const a=ring(-.006),b=ring(.006);
      for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],i%2?'#9da6a3':'#6e787c',false);}
    }
  }
  for(const [pos,rad] of [[-.607,.080],[.655,.023]]){
    const c=[pos,0,0],face=Array.from({length:28},(_,i)=>[pos,rad*cos(i*TAU/28),rad*sin(i*TAU/28)]);
    r.polygon(face,'#a0aaa7',false);
    if(pos<0)for(let i=0;i<9;i++){
      const a=i*TAU/9-phase*TAU,cy=.076*cos(a),cz=.076*sin(a);
      r.polygon(Array.from({length:10},(_,k)=>[c[0]-.0009,cy+.010*cos(k*TAU/10),cz+.010*sin(k*TAU/10)]),'#424c50',false);
    }
  }
}
export function crankFeature(r,which,phase,modern){
  if(which==='mains')for(const m of mainStations)tube(r,[m,0,0],-.021,.021,.059,silver,28);
  if(which==='pins')for(let i=0;i<6;i++){
    const p=rodPin(i,phase);
    tube(r,p,-.031,.031,.046,silver,28);oilPort(r,p,.046,phase,i);
  }
  if(which==='webs')for(let i=0;i<6;i++)for(const hand of [-1,1])crankWeb(r,i,hand,phase,modern);
  if(which==='ends')spindles(r,phase,modern);
}
export function drawCrank(r,phase,modern){for(const g of groups)crankFeature(r,g,phase,modern);}

// The overview uses the same pin and main axes with smaller polygon rings. All
// journal lengths meet their cheeks. Cup-shaped bearings remain in the casting.
export function drawEngineCore(r,cx,z,modern){
  const s=.54, map=([x,y,h])=>[cx-.0065+x*.55625,y*s,z+h*s];
  const face=(pts,col)=>r.polygon(pts.map(map),col,false);
  const rings=(center,a,b,rad,segments=6)=>{
    const ring=dx=>Array.from({length:segments},(_,j)=>[center[0]+dx,center[1]+rad*cos(j*TAU/segments),center[2]+rad*sin(j*TAU/segments)]);
    return [ring(a),ring(b)];
  };
  function strip(a,b,col){for(let i=0;i<a.length;i++){const j=(i+1)%a.length;face([a[i],a[j],b[j],b[i]],tint(col,.82+.14*sin(i*TAU/a.length)),false);}}
  r.tag('engine.crankshaft',()=>{
    for(const m of mainStations){const [a,b]=rings([m,0,0],-.022,.022,.059);strip(a,b,silver);}
    for(let i=0;i<6;i++){
      const p=rodPin(i),a=angles[i]+.29,c=cos(a),v=sin(a);
      const [q,t]=rings(p,-.031,.031,.046);strip(q,t,silver);
      for(const hand of [-1,1]){
        const pos=p[0]+hand*.047;
        const loop=dx=>[[.143,0],[.10,.051],[.04,.045],[-.102,.078],[-.15,.017],[-.12,-.069],[.035,-.047],[.11,-.049]].map(([u,w])=>[pos+dx,u*c-w*v,u*v+w*c]);
        const l=loop(-.017),h=loop(.017);face(l,forging);face(h,edge);strip(l,h,forging);
      }
    }
    const [f,g]=rings([0,0,0],-.565,-.500,.073);strip(f,g,silver);face(f,edge);
    const [h,j]=rings([0,0,0],.500,.64,.045);strip(h,j,silver);face(j,edge);
  });
  r.tag('engine.case',()=>{
    const cut=r.inspection?.engineCutaway&&r.inspection.assembly==='engine'&&!r.inspection.onlyPart;
    // The two banks close symmetrically. The optional section opens only
    // the viewer-facing half and exposes the internal bearing supports.
    for(const side of [-1,1]){
      const edge=side*(modern?.34:.285);
      const far=cut&&side>0?-.127:.197;
      if(!cut||side<0){
        face([[-.53,edge,far],[.53,edge,far],[.53,0,.221],[-.53,0,.221]],'#9aa29f');
        for(const end of [-.53,.53]){
          face([[end,edge,-.185],[end,edge,far],[end,0,.221],[end,0,.094],[end,side*.08,.066],[end,side*.084,-.06],[end,0,-.093],[end,0,-.201]],'#858f91');
        }
      }
      face([[-.53,edge,-.185],[.53,edge,-.185],[.53,edge,far],[-.53,edge,far]],'#858e8d');
      face([[-.53,edge,-.185],[.53,edge,-.185],[.53,0,-.201],[-.53,0,-.201]],'#717a7c');
      for(const station of mainStations){
        const points=Array.from({length:6},(_,i)=>{const a=Math.PI+(i/5)*Math.PI;return[station,.072*cos(a),.072*sin(a)];});
        const outer=points.map(([q,y,h])=>[q,y*1.84,h*1.84]);
        if(side>0)for(let i=1;i<6;i++)face([points[i-1],points[i],outer[i],outer[i-1]],'#a0a8a3');
      }
    }
  });
}

// The optional engine section looks into a cut longitudinally through the
// drive. Selecting a removed accessory restores it; its own picker and nested
// reference remain reachable directly from the component list.
const bankItems=new Set(['engine.cylinders','engine.heads','engine.intake','engine.exhaust','engine.turbos']);
const overhead=new Set(['engine.intercoolers','engine.left-blower','engine.right-blower']);
export function engineSectionFace(face,selected){
  const id=face.part;
  if(id===selected)return true;
  if(overhead.has(id))return false;
  // The 992 front radiators are separately inspectable, metres ahead of the block.
  if(id==='engine.cooling'&&face.points[0][0]<0)return false;
  if(id.startsWith('engine.plug-right'))return false;
  return !bankItems.has(id)||face.points.some(p=>p[1]<-.001);
}
