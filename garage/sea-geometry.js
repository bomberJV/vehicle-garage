import {glazingFace} from './surface-materials.js';

// Local model coordinates: bow at negative x, keel down, beam along y.
const WHITE='#e6e8e5', METAL='#a8b2b3', GLASS='#304e5b';
export {WHITE,METAL,GLASS};
export const sides=[-1,1];
export function tint(hex,k) {
  return '#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*k))).toString(16).padStart(2,'0')).join('');
}
export function quad(r,a,b,c,d,color) { r.polygon([a,b,c],color,false);r.polygon([a,c,d],color,false); }
export function tube(r,a,b,rad,color,n=10) { r.rod(a,b,rad,color,n); }
export function ellipsoid(r,c,radii,color) {
  const n=20,layers=10;
  const vertex=(i,j)=>{const a=i*Math.PI*2/n,b=j*Math.PI/layers-Math.PI/2;
    return [c[0]+radii[0]*Math.cos(a)*Math.cos(b),c[1]+radii[1]*Math.sin(a)*Math.cos(b),c[2]+radii[2]*Math.sin(b)];};
  for(let i=0;i<n;i++)for(let j=0;j<layers;j++){
    const a=vertex(i,j),b=vertex(i+1,j),c1=vertex(i+1,j+1),d=vertex(i,j+1);
    const shade=tint(color,.77+.21*Math.sin((j+.5)*Math.PI/layers-Math.PI/2)+.08*Math.cos((i+.5)*Math.PI*2/n));
    if(j>0)r.polygon([a,b,c1],shade,false);
    if(j+1<layers)r.polygon([a,c1,d],shade,false);
  }
}
// Each section is [x, half-beam, deck height, keel height]. The successive
// knuckles describe the flared topsides, boot stripe, bilge and keel.
export function hull(r,sections,{side='#425963',bottom='#8e5149',deck='#8b8f88',center=0,chine=.84}={}) {
  const ring=([x,w,t,k])=>{const d=t-k;
    return [[-w,t],[-w*.99,k+d*.56],[-w*.98,k+d*.51],[-w*chine,k+d*.19],[-w*.48,k+d*.045],[0,k],[w*.48,k+d*.045],[w*chine,k+d*.19],[w*.98,k+d*.51],[w*.99,k+d*.56],[w,t]].map(([y,z])=>[x,y+center,z]);};
  const colors=[side,tint(side,.73),bottom,tint(bottom,.85),tint(bottom,.78),tint(bottom,.82),tint(bottom,.96),tint(bottom,1.08),tint(side,.8),tint(side,1.12)];
  const rings=sections.map(ring);
  for(let i=0;i<rings.length-1;i++){
    const a=rings[i],b=rings[i+1];
    for(let j=0;j<a.length-1;j++)quad(r,a[j],b[j],b[j+1],a[j+1],colors[j]);
    quad(r,a[0],a[10],b[10],b[0],deck);
  }
  r.polygon(rings[0].slice().reverse(),tint(side,.9),false);r.polygon(rings.at(-1),tint(side,.86),false);
}
// A cambered deckhouse includes raked front and rear screens, a flat center
// roof and chamfered corners. Glazing sits in its own band between shell rows.
export function house(r,{x0,x1,y=0,w,z,h,rake=.12,rear=.05,glass=true,body=WHITE,roof=body}) {
  const slab=(inset,t,width)=>{const a=x0+inset*rake,b=x1-inset*rear,v=w*width,c=Math.min(.11,v*.33,(b-a)*.12);
    return [[a,y-v+c],[a+c,y-v],[b-c,y-v],[b,y-v+c],[b,y+v-c],[b-c,y+v],[a+c,y+v],[a,y+v-c]].map(([x,yy])=>[x,yy,z+t*h]);};
  const rows=glass?[[0,0,1],[.37,.40,.985],[.84,.80,.955],[1,1,.94]]:[[0,0,1],[1,1,.94]];
  const rings=rows.map(v=>slab(...v));
  for(let j=1;j<rings.length;j++)for(let i=0;i<8;i++){
    const a=rings[j-1][i],b=rings[j-1][(i+1)%8],c=rings[j][(i+1)%8],d=rings[j][i];
    if(!glass||j!==2){quad(r,a,b,c,d,tint(body,i<4?.9:1));continue;}
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const count=Math.max(1,Math.round(length/.16));
    const at=(p,q,u)=>p.map((n,axis)=>n+(q[axis]-n)*u);
    const point=(u,v)=>at(at(a,b,u),at(d,c,u),v);
    // Each pane occupies a physical opening between frame strips. Adjacent
    // glass, header, sill and mullions meet edge-to-edge.
    for(let k=0;k<count;k++){
      const left=k/count,right=(k+1)/count,margin=Math.min(.0045/Math.max(.001,length),.14/count);
      const uv=(x0,x1,v0,v1)=>[point(x0,v0),point(x1,v0),point(x1,v1),point(x0,v1)];
      const frame=tint(body,i<4?.83:.95);
      for(const strip of [[left,right,0,.08],[left,right,.92,1],[left,left+margin,.08,.92],[right-margin,right,.08,.92]])
        r.polygon(uv(...strip),frame,false);
      glazingFace(r,uv(left+margin,right-margin,.08,.92),i<4?'#6c91a2':'#7b9eab',.48);
    }
  }
  // A deckhouse sitting on another deck has a raised sole. Keeping its bottom
  // cap in the deck plane made the two materials fight through the side glass.
  const soleHeight=Math.min(.003,h*.055);
  const sole=rings[0].map(([x,yy,height])=>[x,yy,height+soleHeight]);
  r.polygon(sole,tint(body,.74),false);r.polygon(rings.at(-1),roof,false);
}
export function deckRail(r,points,h=.07,color=METAL) {
  points.forEach((p,i)=>{const lifted=p.map((n,axis)=>n+(axis===2?h:0));tube(r,p,lifted,.006,color,6);
    if(i){const prev=points[i-1];tube(r,prev.map((n,axis)=>n+(axis===2?h:0)),lifted,.007,color,6);}});
}
export function mast(r,x,y,z,height,rad=.012) {
  const top=z+height;
  tube(r,[x,y,z],[x+.045,y,top],rad,METAL);
  for(const t of [.41,.75]){const a=x+t*.045,span=height*(1-t)*.60;
    tube(r,[a,y-span,z+t*height],[a,y+span,z+t*height],rad*.78,WHITE);
    tube(r,[x,y,z],[a,y+span,z+t*height],rad*.38,METAL);}
  tube(r,[x-.11,y,top-.04],[x+.21,y,top-.04],rad*1.15,WHITE);
}
export function helipad(r,x,y,z,rad) {
  const n=14;
  const circle=(radius,zz)=>Array.from({length:n},(_,i)=>[x+radius*Math.cos(i*2*Math.PI/n),y+radius*Math.sin(i*2*Math.PI/n),zz]);
  const rim=circle(rad,z+.025),base=circle(rad,z),inner=circle(rad*.84,z+.026);
  r.polygon(inner,'#387f68',false);
  for(let i=0;i<n;i++){const j=(i+1)%n;quad(r,base[i],base[j],rim[j],rim[i],METAL);quad(r,rim[i],rim[j],inner[j],inner[i],'#d5c66c');}
  for(const dy of [-.18,.18])r.box(x-rad*.4,y+rad*dy-.009,z+.027,x+rad*.4,y+rad*dy+.009,z+.032,WHITE);
  r.box(x-.009,y-rad*.18,z+.033,x+.009,y+rad*.18,z+.038,WHITE);
}
export function propeller(r,x,y,z,radius,blades=4) {
  tube(r,[x-.15,y,z],[x+.045,y,z],radius*.19,'#6d6352');
  r.discX(x+.048,y,z,radius*.21,'#c5a26c',12);
  for(let k=0;k<blades;k++){const t=k*2*Math.PI/blades;
    const p=(a,rad,dx)=>[x+dx,y+Math.cos(a)*rad,z+Math.sin(a)*rad];
    quad(r,p(t,.14*radius,.016),p(t+.59,.70*radius,.045),p(t+.24,radius,.015),p(t-.14,.4*radius,-.019),'#bda271');}
}
export function nozzle(r,x,y,z,rad,depth=.1,open=false) {
  const inner=rad*.72,n=18;
  for(let i=0;i<n;i++){const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n,p=(x0,r0,t)=>[x0,y+r0*Math.cos(t),z+r0*Math.sin(t)];
    quad(r,p(x-depth,rad,a),p(x-depth,rad,b),p(x,rad,b),p(x,rad,a),'#788489');
    quad(r,p(x,inner,a),p(x,rad,a),p(x,rad,b),p(x,inner,b),METAL);
    quad(r,p(x,inner,a),p(x,inner,b),p(x-depth*.70,inner,b),p(x-depth*.70,inner,a),'#323c43');}
  if(!open)r.discX(x-depth*.71,y,z,inner,'#1e2d35',n);
}
