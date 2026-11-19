// Fitted previews for the SL550 accessories in sl550-accessories.js. Every
// piece is placed from the car's own trunk lid, plate recess or footwell.
// Lid-mounted pieces pass through slDeckPoint, so they travel with the
// reverse-opening lid while the hardtop folds.
import {slDeckCameraMount,slDeckCrown} from './sl550-exterior.js';
import {slDeckPoint} from './sl550-roof.js';
import {drawLettering,letteringWidth} from './badge-lettering.js';
import {tint} from './road-primitives.js';

const polished='#d5dadc',pearl='#1f2427',rubber='#202325';
const tail=2.32214;
export const sl550AccessoryOffsets={slSpoiler:[.20,0,.14],slTrunkHandle:[.26,0,.08],slPlateFrame:[.30,0,0],slSlimFrame:[.30,0,0],slMats:[0,0,.24]};

const roofFraction=r=>r.slRoofFraction??(r.build?.roofPosition==='up'?0:1);
const smooth=t=>{const k=Math.max(0,Math.min(1,t));return k*k*(3-2*k);};

// The US plate is drawn as a flat quad between four points of the recessed
// lid face (sl550-exterior.js, rearDeck). Frame and handle points lie in that
// same plane, `d` metres behind it along +x.
const plateEdge={half:.151,low:.655,high:.803};
const plateCorners=(()=>{
  const {half,low,high}=plateEdge;
  return [[-half,low],[half,low],[-half,high],[half,high]].map(([y,z])=>slDeckCameraMount(y,z)[0]);
})();
export function slPlatePlane(y,z,d=0){
  const {half,low,high}=plateEdge,u=(y+half)/(2*half),v=(z-low)/(high-low),[a,b,c,e]=plateCorners;
  return [(1-u)*(1-v)*a+u*(1-v)*b+(1-u)*v*c+u*v*e+d,y,z];
}
export const slPlateFrameFront=.0145;

// A closed slab between two (d,z) outlines in the plate plane, extruded across y.
function slab(r,place,outline,y0,y1,color){
  const a=outline.map(([d,z])=>place(y0,z,d)),b=outline.map(([d,z])=>place(y1,z,d));
  r.polygon(a,tint(color,.80),false);r.polygon([...b].reverse(),tint(color,.80),false);
  for(let i=0;i<outline.length;i++){
    const j=(i+1)%outline.length;
    r.polygon([a[i],a[j],b[j],b[i]],tint(color,.86+.14*Math.sin(i*1.7)**2),false);
  }
}

// A rectangular frame: outer and inner edges given as [half-width, bottom, top].
// The front face is bevelled so polished stainless catches the light.
function frameRing(r,place,outer,inner,back,front,color){
  const corners=([h,z0,z1])=>[[-h,z0],[h,z0],[h,z1],[-h,z1]];
  const bevel=.0025,o=corners(outer),i=corners(inner);
  const oi=corners([outer[0]-bevel,outer[1]+bevel,outer[2]-bevel]),ii=corners([inner[0]+bevel,inner[1]-bevel,inner[2]+bevel]);
  const lip=front-.0015;
  for(let k=0;k<4;k++){
    const n=(k+1)%4,q=(ring,d)=>[place(...ring[k],d),place(...ring[n],d)];
    const [o0,o1]=q(o,lip),[a0,a1]=q(oi,front),[b0,b1]=q(ii,front),[i0,i1]=q(i,lip);
    r.polygon([a0,a1,b1,b0],color,false);
    r.polygon([o0,o1,a1,a0],tint(color,.90),false);r.polygon([b0,b1,i1,i0],tint(color,.84),false);
    const [ob0,ob1]=q(o,back),[ib0,ib1]=q(i,back);
    r.polygon([ob0,ob1,o1,o0],tint(color,.76),false);r.polygon([ib0,ib1,i1,i0],tint(color,.70),false);
    r.polygon([ob0,ob1,ib1,ib0],tint(color,.60),false);
  }
}

// Mercedes-Benz frame 07 BQ 688 0086: polished bars with the name on the lower one.
function plateFrame(r){
  const t=roofFraction(r),place=(y,z,d)=>slDeckPoint(slPlatePlane(y,z,d),t);
  frameRing(r,place,[.1585,.645,.8105],[.1460,.6650,.7985],.0085,slPlateFrameFront,polished);
  const text='Mercedes-Benz',h=.0105,start=-letteringWidth(text,h)/2;
  drawLettering(r,text,h,(u,v)=>place(start+u,.6500+v,slPlateFrameFront+.0006),{radius:.0006,color:'#30363a'});
}

// Slimline frame 07 BQ 688 0092: a narrow black-pearl edge, no lettering.
function slimFrame(r){
  const t=roofFraction(r),place=(y,z,d)=>slDeckPoint(slPlatePlane(y,z,d),t);
  frameRing(r,place,[.1555,.6505,.8075],[.1465,.6590,.8000],.0085,.0125,pearl);
}

// Trunk handle 07 BQ 675 0004: clamped behind the top of the plate, it turns
// back into a short grip below the camera housing (lowest point z .817).
function trunkHandle(r){
  const t=roofFraction(r),place=(y,z,d)=>slDeckPoint(slPlatePlane(y,z,d),t),w=.135;
  slab(r,place,[[.0064,.7990],[.0078,.7990],[.0078,.8115],[.0064,.8135]],-w,w,polished);
  slab(r,place,[[.0064,.8135],[.0078,.8115],[.0222,.8115],[.0240,.8135]],-w,w,polished);
  slab(r,place,[[.0222,.8115],[.0222,.8060],[.0240,.8060],[.0240,.8135]],-w+.004,w-.004,polished);
}

// Rear spoiler attachment 231-790-01-88 on the lid crown ahead of the
// trailing edge. Stations run along the lid; k is the fraction of its width.
const spoilerStations=[[2.150,0],[2.200,.22],[2.245,.46],[2.285,.74],[tail,1]];
export const slSpoilerHeight=.017,slSpoilerSpan=.93;
export function slSpoilerSection(k,lift=.0012){
  const height=slSpoilerHeight*(1-.42*k**4);
  const base=spoilerStations.map(([x])=>{const p=slDeckCrown(x,k);return [p[0],p[1],p[2]+lift];});
  const top=spoilerStations.map(([,f],j)=>[base[j][0],base[j][1],base[j][2]+height*smooth(f)]);
  const end=base.at(-1),over=.004;
  return {base,top,rear:[[end[0]+over,end[1],end[2]+height],[end[0]+over,end[1],end[2]+.003]]};
}
function spoiler(r,paint){
  const t=roofFraction(r),pose=p=>slDeckPoint(p,t),n=18;
  const ks=Array.from({length:n+1},(_,i)=>-slSpoilerSpan+2*slSpoilerSpan*i/n);
  const sections=ks.map(k=>{const s=slSpoilerSection(k);return {base:s.base.map(pose),top:s.top.map(pose),rear:s.rear.map(pose)};});
  for(let i=1;i<sections.length;i++){
    const a=sections[i-1],b=sections[i];
    for(let j=1;j<a.top.length;j++){
      r.polygon([a.top[j-1],b.top[j-1],b.top[j],a.top[j]],tint(paint,1.04-.03*j),false);
      r.polygon([a.base[j-1],a.base[j],b.base[j],b.base[j-1]],tint(paint,.55),false);
    }
    const [ar0,ar1]=a.rear,[br0,br1]=b.rear;
    r.polygon([a.top.at(-1),b.top.at(-1),br0,ar0],tint(paint,1.08),false);
    r.polygon([ar0,br0,br1,ar1],tint(paint,.82),false);
    r.polygon([ar1,br1,b.base.at(-1),a.base.at(-1)],tint(paint,.62),false);
  }
  for(const s of [sections[0],sections.at(-1)]){
    for(let j=1;j<s.top.length;j++)r.polygon([s.base[j-1],s.base[j],s.top[j],s.top[j-1]],tint(paint,.78),false);
    r.polygon([s.base.at(-1),s.rear[1],s.rear[0],s.top.at(-1)],tint(paint,.74),false);
  }
}

// All-season mats A231 680 14 02 9G33 on the footwell floor (sl550-cabin.js,
// carpets): the toe-board slope, then flat over the carpet mat to x -.035.
const matPath=[[-.450,.2982],[-.405,.2765],[-.365,.2570],[-.355,.2645],[-.035,.2645]];
export const slMatBounds={inner:.215,outer:.640,thickness:.006,rim:.0055};
function mats(r){
  const {inner,outer,thickness,rim}=slMatBounds;
  for(const s of [-1,1]){
    const y0=s<0?-outer:inner,y1=s<0?-inner:outer;
    const at=(i,y,dz)=>[matPath[i][0],y,matPath[i][1]+dz];
    for(let i=1;i<matPath.length;i++){
      r.polygon([at(i-1,y0,thickness),at(i,y0,thickness),at(i,y1,thickness),at(i-1,y1,thickness)],i%2?rubber:tint(rubber,1.08),false);
      r.polygon([at(i-1,y0,.0004),at(i-1,y1,.0004),at(i,y1,.0004),at(i,y0,.0004)],tint(rubber,.7),false);
      for(const y of [y0,y1])r.polygon([at(i-1,y,.0004),at(i,y,.0004),at(i,y,thickness),at(i-1,y,thickness)],tint(rubber,.82),false);
    }
    // The raised edge runs around the flat floor section.
    const x0=-.355,x1=-.035,z=.2645+thickness,band=.012;
    const edge=(a,b,c,d)=>{
      const lo=[[a,c,z],[b,c,z],[b,d,z],[a,d,z]],hi=lo.map(([x,y,zz])=>[x,y,zz+rim]);
      r.polygon(hi,tint(rubber,1.18),false);
      for(let k=0;k<4;k++){const n=(k+1)%4;r.polygon([lo[k],lo[n],hi[n],hi[k]],tint(rubber,.9),false);}
    };
    edge(x1-band,x1,y0,y1);edge(x0,x0+band,y0,y1);
    edge(x0+band,x1-band,y0,y0+band);edge(x0+band,x1-band,y1-band,y1);
    // Transverse ribs across the heel area.
    for(let k=0;k<9;k++){
      const x=-.320+k*.031;
      r.box(x,y0+band+.012,z,x+.010,y1-band-.012,z+.0022,tint(rubber,1.12));
    }
  }
}

export const sl550AccessoryDraw={slSpoiler:spoiler,slTrunkHandle:trunkHandle,slPlateFrame:plateFrame,slSlimFrame:slimFrame,slMats:mats};
