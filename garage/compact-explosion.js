// The slider measures the largest physical excursion of any group up to a point
// on the safe route. Timing alone is misleading when a part has to detour first.
export const COMPACT_SPREAD=18;
export function spreadPercent(value){
  if(value==null||value===''||!Number.isFinite(Number(value)))return COMPACT_SPREAD;
  return Math.min(100,Math.max(5,Math.round(Number(value))));
}
export function spreadTarget(inspection){
  return inspection?.expanded?spreadPercent(inspection.separation)/100:0;
}
function profile(layout){
  if(layout.spreadProfile)return layout.spreadProfile;
  const tracks=[];
  let span=0,excursion=0;
  for(const group of layout.groups.values()){
    if(!group.movable)continue;
    span=Math.max(span,Math.hypot(...group.offset));
    if(group.path){
      tracks.push(group.path);
      for(const point of group.path)excursion=Math.max(excursion,Math.hypot(...point));
    }
  }
  return layout.spreadProfile={tracks,span,excursion,stops:new Map()};
}
export function routePhase(layout,amount){
  if(!layout?.routesPlanned||amount<=0||amount>=1)return amount;
  const {tracks,span,excursion,stops}=profile(layout);
  if(!tracks.length||!span)return amount;
  if(stops.has(amount))return stops.get(amount);
  // Preserve even the return leg of a routed detour as the slider reaches Full.
  // The first half represents actual distance relative to the final parked pose.
  if(amount>.5 && excursion>span*(1+1e-8)){
    const midpoint=routePhase(layout,.5);
    return midpoint+(amount-.5)*2*(1-midpoint);
  }
  const limit=span*amount,limit2=limit*limit;
  // A segment stays inside a ball when both endpoints do. Find the first
  // crossing of the shared excursion limit, taking the same phase for all
  // groups so the route planner's continuous collision guarantees still hold.
  for(let j=1;j<tracks[0].length;j++){
    let u=1,crossed=false;
    for(const track of tracks){
      const b=track[j];
      if(b[0]*b[0]+b[1]*b[1]+b[2]*b[2]<=limit2)continue;
      const a=track[j-1],d=b.map((v,k)=>v-a[k]);
      const dd=d.reduce((n,v)=>n+v*v,0);
      if(dd===0)continue;
      const ad=a.reduce((n,v,k)=>n+v*d[k],0);
      const c=a.reduce((n,v)=>n+v*v,0)-limit2;
      u=Math.min(u,(-ad+Math.sqrt(Math.max(0,ad*ad-dd*c)))/dd);
      crossed=true;
    }
    if(crossed){
      const phase=(j-1+Math.max(0,u))/(tracks[0].length-1);
      if(stops.size>64)stops.clear();
      stops.set(amount,phase);return phase;
    }
  }
  return amount;
}


export function bindSpreadControls(container,slider,readout,onChange){
  const presets=[...container.querySelectorAll('[data-spread]')];
  slider.addEventListener('input',()=>onChange(spreadPercent(slider.value)));
  for(const button of presets)button.addEventListener('click',()=>onChange(spreadPercent(button.dataset.spread)));
  return (available,value)=>{
    const percent=spreadPercent(value);
    container.hidden=!available;slider.value=String(percent);
    const name=percent===COMPACT_SPREAD?'Compact':percent===100?'Full':null;
    readout.textContent=name?name+' · '+percent+'%':percent+'%';
    slider.setAttribute('aria-valuetext',name?name+', '+percent+' percent':percent+' percent');
    for(const button of presets)button.setAttribute('aria-pressed',String(Number(button.dataset.spread)===percent));
  };
}
