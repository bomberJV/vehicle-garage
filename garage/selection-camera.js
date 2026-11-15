const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);

// Group selection uses the block or crankcase as the physical engine anchor.
// A direct radiator, exhaust or other component selection uses its own extent.
export function installedFocus(faces,id,instance){
  const engine=id==='engine'||id==='powertrain'||id==='sl-m278';
  const core=id==='sl-m278'?'sl-m278.block':id==='engine'?'engine.case':'powertrain.block';
  const match=f=>engine?f.part===core:f.part===id||f.pickPart===id||f.part?.startsWith(id+'.');
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const f of faces){
    if(!match(f)||(instance&&instance!==(f.instance||f.rigid?.name)))continue;
    for(const p of f.points)for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}
  }
  if(!Number.isFinite(min[0]))return engine?installedFocus(faces,id==='engine'?'engine.cylinders':'powertrain.configuration',instance):null;
  return {center:min.map((v,i)=>(v+max[i])/2),size:max.map((v,i)=>v-min[i])};
}

export function componentProjection(base,target,{right,down},scale,w,h,usable){
  if(!target)return base;
  const {center,size}=target;
  const fraction=Math.max(dot(size,right.map(Math.abs))*scale*base.ratio/w,
    dot(size,down.map(Math.abs))*scale*base.ratio/usable);
  const gain=Math.min(1.42,Math.max(1,.54/Math.max(.01,fraction)));
  return {ratio:base.ratio*gain,cx:base.cx*.20+(w/2+dot(center,right)*scale)*.80,
    cy:base.cy*.20+(h*.65+dot(center,down)*scale)*.80};
}
export function focusBlend(from,to,t){
  const v=Math.max(0,Math.min(1,t)),u=v*v*(3-2*v);
  return {ratio:from.ratio+(to.ratio-from.ratio)*u,cx:from.cx+(to.cx-from.cx)*u,cy:from.cy+(to.cy-from.cy)*u};
}
