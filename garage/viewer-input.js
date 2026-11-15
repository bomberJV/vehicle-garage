function sameTap(first,event,vehicle) {
  return first && first.vehicle===vehicle && first.type===event.pointerType &&
    event.timeStamp-first.time<=420 && Math.hypot(first.x-event.clientX,first.y-event.clientY)<=13;
}

// Recheck a stationary pointer whenever the model moves beneath it.
export function refreshPointerHover(r){
  if(!r.hoverPointer||r.drag)return;
  const {x,y}=r.hoverPointer,hit=r.hitTest(x,y);
  if(hit?.part===r.hoverHit?.part&&hit?.instance===r.hoverHit?.instance)return;
  r.hoverHit=hit;r.onInspect?.(hit);r.draw();
}

export function bindViewerInput(r) {
  const canvas=r.canvas;
  function endDrag(e) { if(r.drag?.id===e.pointerId)r.drag=null; }
  canvas.addEventListener('pointerdown',e=>{
    if(r.drag || e.button>1 || e.isPrimary===false)return;
    canvas.focus({preventScroll:true});
    const hit=r.hitTest(e.clientX,e.clientY);
    const move=Boolean(hit && !e.shiftKey && !e.altKey && e.button===0 && !r.motion && !r.returnMotion);
    r.drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,hit,move,moved:false};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerleave',()=>{
    r.hoverPointer=null;
    if(!r.drag && r.hoverHit){r.hoverHit=null;r.onInspect?.(null);r.draw();}
  });
  canvas.addEventListener('pointermove',e=>{
    const d=r.drag;
    if(!d){
      if(e.pointerType==='touch')return;
      r.hoverPointer={x:e.clientX,y:e.clientY};
      refreshPointerHover(r);
      return;
    }
    if(d.id!==e.pointerId)return;
    if(e.pointerType!=='touch')r.hoverPointer={x:e.clientX,y:e.clientY};
    if(!d.moved){
      if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<5)return;
      d.moved=true;r.lastTap=null;r.hoverHit=null;r.onInspect?.(null);
      if(d.move){
        const rect=canvas.getBoundingClientRect();
        d.anchor={x:d.startX-(rect.left||0),y:d.startY-(rect.top||0)};
        d.key=r.beginPartDrag(d.hit);
        d.move=Boolean(d.key);
      }
    }
    if(d.move){
      r.movePart(d.key,e.clientX-d.x,e.clientY-d.y);
    }else{
      r.angle+=(e.clientX-d.x)*.009;
      r.elevation=Math.max(-.92,Math.min(1.48,r.elevation-(e.clientY-d.y)*.004));
      r.focusPan=null;
      r.draw();
    }
    d.x=e.clientX;d.y=e.clientY;
  });
  canvas.addEventListener('pointerup',e=>{
    const d=r.drag;
    if(!d || d.id!==e.pointerId)return;
    r.drag=null;
    if(d.moved || e.button!==0)return;
    // Selection can change the camera. Resolve a second tap from the first hit
    // even when the object has since moved out from under that screen position.
    if(sameTap(r.lastTap,e,r.build?.vehicle)){
      const hit=r.lastTap.hit;
      r.lastTap=null;r.selectedHit=hit;r.onOpenPart?.(hit);return;
    }
    if(d.hit){
      r.lastTap={hit:d.hit,time:e.timeStamp,x:e.clientX,y:e.clientY,type:e.pointerType,vehicle:r.build?.vehicle};
      r.selectedHit=d.hit;r.onSelect?.(d.hit);
    }else{
      r.lastTap=null;r.selectedHit=null;r.onDeselect?.();
    }
  });
  canvas.addEventListener('pointercancel',endDrag);
  canvas.addEventListener('lostpointercapture',endDrag);
  canvas.addEventListener('wheel',e=>{
    if(document.activeElement!==canvas)return;e.preventDefault();
    r.focusPan=null;
    r.zoom=Math.max(.6,Math.min(2.2,r.zoom-e.deltaY*.001));r.draw();
  },{passive:false});
  canvas.addEventListener('keydown',e=>{
    const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(e.key==='Enter'){
      const hit=r.hoverHit||r.selectedHit;
      if(hit){e.preventDefault();r.onOpenPart?.(hit);}return;
    }
    if(e.shiftKey && arrows[e.key]){
      e.preventDefault();r.moveSelected(...arrows[e.key].map(n=>n*12));return;
    }
    if(!arrows[e.key] && !['+','=','-','0'].includes(e.key))return;
    e.preventDefault();
    r.focusPan=null;
    if(arrows[e.key]){
      r.angle+=arrows[e.key][0]*.15;
      r.elevation=Math.max(-.92,Math.min(1.48,r.elevation-arrows[e.key][1]*.06));
    }else if(e.key==='0'){r.setView('hero');return;}
    else r.zoom=Math.max(.6,Math.min(2.2,r.zoom+(e.key==='-'?-.1:.1)));
    r.draw();
  });
}
