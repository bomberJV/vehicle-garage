// A frozen copy of the view the user actually saw preserves occlusion, paint,
// the current cut and dragged component locations throughout a focus change.
export function projectedBounds(faces,predicate){
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const face of faces||[]){
    if(!predicate(face))continue;
    for(const p of face.projected||[]){
      x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y);
    }
  }
  return x1>x0 && y1>y0?{x:(x0+x1)/2,y:(y0+y1)/2,width:x1-x0,height:y1-y0}:null;
}
export function focusProgress(now,start,duration){
  const t=Math.max(0,Math.min(1,(now-start)/duration));
  return t*t*(3-2*t);
}
function viewRect(width,height){return {x:width/2,y:height/2,width,height};}
function fitRect(oldView,newView){
  const scale=Math.min(1,Math.max(.025,Math.min(oldView.width/newView.width,oldView.height/newView.height)));
  return {scale,dx:oldView.x-newView.x*scale,dy:oldView.y-newView.y*scale};
}
export function transitionLayers(state,destination,width,height,now){
  const t=focusProgress(now,state.start,state.duration),view=viewRect(width,height);
  const incoming=state.direction==='in'?fitRect(state.anchor||destination||view,destination||view):{scale:1,dx:0,dy:0};
  const outgoing=state.direction==='out'?fitRect(destination||state.anchor||view,state.anchor||view):{scale:1,dx:0,dy:0};
  const mix=(target,amount)=>({scale:1+(target.scale-1)*amount,dx:target.dx*amount,dy:target.dy*amount});
  return {incoming:mix(incoming,1-t),outgoing:mix(outgoing,t),opacity:t,done:t>=1};
}
// The source and destination can represent different physical scopes. Cross-
// fading them together makes an internal component visible through an opaque
// bonnet or casting. Fade the outgoing picture to the studio background before
// revealing the new view. The same easing still positions both camera frames.
export function focusFrameLayer(layers){
  if(layers.opacity<.5)return {source:'canvas',transform:layers.outgoing,opacity:1-layers.opacity/.5};
  return {source:'destination',transform:layers.incoming,opacity:(layers.opacity-.5)/.5};
}
export function partMatch(part,instance){
  return face=>!part||(face.part===part&&(!instance||face.instance===instance||face.rigid?.name===instance||face.motionKey===instance));
}
export function freezeScene(renderer,options){
  if(renderer.reducedMotion?.matches||!renderer.hitFaces?.length||!renderer.canvas?.width)return null;
  const canvas=document.createElement('canvas');
  canvas.width=renderer.canvas.width;canvas.height=renderer.canvas.height;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.drawImage(renderer.canvas,0,0);
  const visible=projectedBounds(renderer.hitFaces,options.direction==='in'?partMatch(options.part,options.instance):()=>true);
  return {...options,canvas,anchor:visible,start:null,duration:400};
}
