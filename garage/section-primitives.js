// Normalized exhibit coordinates: forward is -X, starboard +Y and up +Z.
import {glazingFace} from './surface-materials.js';

export const palette = {frame:'#b8c5c6', dark:'#33434c', rubber:'#414951', fabric:'#617d85', wood:'#a27e59', light:'#e0ded2', glass:'#80acbc', floor:'#64747a'};
export const source = (label,url)=>({label,url});
export const part = (key,name,description,offset,draw)=>({key,name,description,offset,draw});

export function section(id,name,description,reference,pieces) {
  const groupId=id.replaceAll('-','_');
  const parts=pieces.map(({key,name,description,offset})=>({id:groupId+'.'+key,name,description,offset,source:reference}));
  return {id,name,description,source:reference,groups:[{id:groupId,name,description,parts}],componentIndex:new Map(parts.map(p=>[p.id,p])),
    draw(r,phase=0){pieces.forEach((piece,i)=>r.tag(parts[i].id,()=>piece.draw(r,phase)));}};
}

// Rounded horizontal slabs give seats, table leaves and tread blocks a visible edge.
export function slab(r,x,y,z,length,width,height,color,radius=.06) {
  const hx=length/2,hy=width/2,c=Math.min(radius,hx*.9,hy*.9),loop=[];
  for(const [sx,sy,a] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,3*Math.PI/2]]){
    for(let j=0;j<4;j++){
      const t=a+j*Math.PI/6;
      loop.push([x+sx*(hx-c)+c*Math.cos(t),y+sy*(hy-c)+c*Math.sin(t)]);
    }
  }
  const top=loop.map(([a,b])=>[a,b,z+height]),bot=loop.map(([a,b])=>[a,b,z]);
  r.polygon(top,color,false);r.polygon([...bot].reverse(),'#556267',false);
  for(let i=0;i<loop.length;i++){const k=(i+1)%loop.length;r.polygon([bot[i],bot[k],top[k],top[i]],color,false);}
}

export function pane(r,points,color=palette.glass) {
  glazingFace(r,points,color,.40);
  for(let i=0;i<points.length;i++)r.rod(points[i],points[(i+1)%points.length],.013,palette.frame,7);
}

export function seat(r,x,y,z,w=.39,h=.53,color=palette.fabric,reverse=false) {
  const aft=reverse?-1:1,depth=w*.89,rear=x+aft*depth*.39;
  r.rod([x,y,z],[x,y,z+h*.18],w*.125,'#717d80',10);
  // Cushion and back have separate tapered, rolled edges. A row is still
  // light enough to render inside the full two-deck cabin.
  const padded=(dimensions)=>{
    const rings=dimensions.map(([cx,cz,l,b])=>{
      const corner=Math.min(b*.22,l*.33);
      return [[-l+corner,-b],[-l,-b+corner],[-l,b-corner],[-l+corner,b],[l-corner,b],[l,b-corner],[l,-b+corner],[l-corner,-b]]
        .map(([dx,dy])=>[cx+dx,y+dy,cz]);
    });
    for(let j=1;j<rings.length;j++)for(let i=0;i<8;i++){
      const k=(i+1)%8;r.polygon([rings[j-1][i],rings[j-1][k],rings[j][k],rings[j][i]],color,false);
    }
    r.polygon(rings[0],color,false);r.polygon([...rings.at(-1)].reverse(),color,false);
  };
  padded([[x,z+h*.16,depth*.44,w*.42],[x,z+h*.23,depth*.50,w*.49],[x,z+h*.32,depth*.43,w*.44]]);
  padded([[rear,z+h*.29,w*.083,w*.42],[rear+aft*w*.04,z+h*.59,w*.094,w*.47],
    [rear+aft*w*.10,z+h*.85,w*.090,w*.42],[rear+aft*w*.13,z+h*.97,w*.070,w*.32]]);
  // Wider crew and business seats carry a separate head cushion and armrests.
  if(w>.32){
    slab(r,rear+aft*w*.11,y,z+h*.91,w*.19,w*.57,h*.11,color,.043);
    for(const s of [-1,1])slab(r,x+w*.01,y+s*w*.49,z+h*.46,depth*.65,w*.115,h*.066,color,.026);
  }
}

export function display(r,x,y,z,width,height){
  r.box(x-.03,y-width/2,z,x+.03,y+width/2,z+height,'#37444b');
  r.box(x+.033,y-width*.43,z+.025,x+.038,y+width*.43,z+height-.025,'#597a80');
  r.box(x+.039,y-width*.36,z+height*.53,x+.040,y+width*.19,z+height*.55,'#a7cab6');
}

export function ovalPane(r,x,y,z,rx,rz,color=palette.glass) {
  const loop=Array.from({length:24},(_,i)=>{const a=Math.PI*i/12;return [x+rx*Math.cos(a),y,z+rz*Math.sin(a)];});
  pane(r,loop,color);
}

export function cylinder(r,center,radius,bottom,top,color,n=32) {
  const [x,y]=center;
  r.rod([x,y,bottom],[x,y,top],radius,color,n);
  const ring=z=>Array.from({length:n},(_,i)=>[x+radius*Math.cos(i/n*2*Math.PI),y+radius*Math.sin(i/n*2*Math.PI),z]);
  r.polygon(ring(top),color,false);r.polygon(ring(bottom).reverse(),color,false);
}

export function rowFrame(r,x,width,height,floor=0) {
  const path=Array.from({length:15},(_,i)=>{
    const a=i/14*Math.PI;return [x, -width*Math.cos(a),floor+height*Math.sin(a)];
  });
  for(let i=1;i<path.length;i++)r.rod(path[i-1],path[i],.021,palette.frame,8);
}
