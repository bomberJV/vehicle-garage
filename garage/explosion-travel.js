// Groups that begin nested may be pulled apart. A pair that begins clear must
// remain clear between keyframes, even when both groups are moving.
import {origin,displaced,intersects} from './exploded-layout.js';

const axes=[0,1,2],steps=4,epsilon=1e-7;
const phase=(o,t)=>[o[0]*t,o[1]*t,o[2]*t];
const straight=o=>[origin,phase(o,.25),phase(o,.5),phase(o,.75),o];
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

export function offsetAt(g,t){
  if(!g.path || t<=0 || t>=1)return phase(g.offset,t);
  const index=Math.min(steps-1,Math.floor(t*steps));
  return lerp(g.path[index],g.path[index+1],t*steps-index);
}

// Sweep two translating boxes in relative coordinates, where one is stationary.
function crosses(a,b,travel){
  let entry=0,exit=1;
  for(const i of axes){
    const low=b.min[i]-a.max[i]+epsilon, high=b.max[i]-a.min[i]-epsilon;
    const v=travel[i];
    if(Math.abs(v)<epsilon){if(low>=0 || high<=0)return false;continue;}
    const t1=low/v,t2=high/v;
    entry=Math.max(entry,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));
    if(entry>=exit)return false;
  }
  return true;
}
function makeTrack(g,path){
  const poses=path.map(p=>displaced(g.bounds,p));
  const union={min:[...g.bounds.min],max:[...g.bounds.max]};
  for(const b of poses)for(const i of axes){
    union.min[i]=Math.min(union.min[i],b.min[i]);union.max[i]=Math.max(union.max[i],b.max[i]);
  }
  return {g,path,poses,union};
}
function collides(track,other){
  if(!intersects(track.union,other.union))return false;
  for(let k=0;k<steps;k++){
    const a=track.path[k],b=track.path[k+1],c=other.path[k],d=other.path[k+1];
    if(crosses(track.poses[k],other.poses[k],b.map((v,i)=>v-a[i]-d[i]+c[i])))return true;
  }
  return false;
}
function alternatives(g,blocked,pad){
  const end=g.offset, paths=[
    [origin,origin,phase(end,.25),phase(end,.65),end],
    [origin,phase(end,.55),phase(end,.9),end,end],
    [origin,origin,origin,phase(end,.5),end],
    [origin,phase(end,.5),end,end,end],
  ];
  for(const axis of axes){
    for(const axis2 of axes){
      if(axis===axis2)continue;
      const a=[0,0,0],b=[0,0,0];a[axis]=end[axis];b[axis]=end[axis];b[axis2]=end[axis2];
      paths.push([origin,a,b,lerp(b,end,.5),end]);
    }
  }
  // Take a parallel route just beyond a blocking part's swept box. Test the
  // shortest excursions first to keep most components close to their mating axis.
  const candidates=[];
  for(const axis of axes){
    const levels=new Set();
    for(const other of blocked){
      levels.add(other.union.min[axis]-g.bounds.max[axis]-pad);
      levels.add(other.union.max[axis]-g.bounds.min[axis]+pad);
    }
    for(const level of levels){
      if(Math.abs(level)<epsilon)continue;
      const a=[0,0,0],b=[...end];a[axis]=level;b[axis]=level;
      candidates.push({length:Math.abs(level)+Math.abs(end[axis]-level),path:[origin,a,lerp(a,b,.5),b,end]});
    }
  }
  candidates.sort((a,b)=>a.length-b.length);
  return paths.concat(candidates.map(c=>c.path));
}

// A common increase in center spacing preserves the order along every axis.
// Thus two initially disjoint moving boxes stay disjoint throughout the stroke.
// A stationary frame is checked separately against each complete swept path.
function radialSeparation(layout,fixed,moving,unresolved){
  if(!unresolved)return 0;
  const center=g=>g.bounds.min.map((v,i)=>(v+g.bounds.max[i])/2);
  const centers=moving.map(center),groups=[...fixed.map(t=>t.g),...moving];
  const lo=axes.map(k=>Math.min(...groups.map(g=>g.bounds.min[k])));
  const hi=axes.map(k=>Math.max(...groups.map(g=>g.bounds.max[k])));
  const middle=lo.map((v,k)=>(v+hi[k])/2);
  const mobileMiddle=axes.map(k=>centers.reduce((s,c)=>s+c[k],0)/centers.length);
  const nearCenter=(a,b)=>a.reduce((sum,v,k)=>sum+(v-b[k])**2,0);
  const anchors=[mobileMiddle,middle,...fixed.map(t=>center(t.g)).sort((a,b)=>nearCenter(a,mobileMiddle)-nearCenter(b,mobileMiddle)).slice(0,4)];
  for(const k of axes)for(const sign of [-1,1])anchors.push(mobileMiddle.map((v,i)=>i===k?v+sign*(hi[i]-lo[i]):v));
  // Rank displacements in each axis prevent almost-concentric shells from
  // forcing the rest of a model out to an enormous, impractical radius.
  const order=axes.map(k=>moving.map((g,i)=>i).sort((a,b)=>centers[a][k]-centers[b][k]||moving[a].key.localeCompare(moving[b].key)));
  const spacing=axes.map(k=>moving.map(g=>g.bounds.max[k]-g.bounds.min[k]).sort((a,b)=>a-b)[moving.length>>1]*.28+layout.gap);
  const clearance=(a,b,relative)=>{
    let first=Infinity;
    for(const k of axes){
      if(relative[k]>epsilon)first=Math.min(first,(b.max[k]-a.min[k]+layout.gap)/relative[k]);
      if(relative[k]<-epsilon)first=Math.min(first,(a.max[k]-b.min[k]+layout.gap)/-relative[k]);
    }
    return Math.max(0,first);
  };
  const localSpan=Math.max(...moving.map(g=>Math.hypot(...g.offset)));
  const spanLimit=Math.max(localSpan*1.5,Math.max(...hi.map((v,k)=>v-lo[k]))*.80);
  let mobileEnd=null,best=null;
  for(const anchor of anchors){
    const dir=centers.map(c=>c.map((v,k)=>v-anchor[k]));
    for(const k of axes){
      const near=order[k].findIndex(i=>centers[i][k]>=anchor[k]);
      for(let rank=0;rank<order[k].length;rank++){
        dir[order[k][rank]][k]+=(rank-(near<0?moving.length:near))*spacing[k];
      }
    }
    if(mobileEnd===null){
      mobileEnd=0;
      for(let i=0;i<moving.length;i++)for(let j=0;j<i;j++){
        mobileEnd=Math.max(mobileEnd,clearance(moving[i].bounds,moving[j].bounds,dir[i].map((v,k)=>v-dir[j][k])));
      }
    }
    let kEnd=mobileEnd;
    let fixedHits=0;
    for(let i=0;i<moving.length;i++){
      const a=moving[i].bounds;
      for(const f of fixed)if(intersects(a,f.g.bounds,layout.gap))kEnd=Math.max(kEnd,clearance(a,f.g.bounds,dir[i]));
    }
    if(!Number.isFinite(kEnd))continue;
    // Keep at least the ordinary displacement of one small part when every
    // piece starts clear. Test actual parked boxes as well as the transit.
    kEnd=Math.max(.05,kEnd+1e-6);
    let offsets;
    for(let pass=0;pass<=fixed.length*2;pass++){
      offsets=dir.map(d=>phase(d,kEnd));
      let nextEnd=kEnd;
      for(let i=0;i<moving.length;i++){
        const g=moving[i],end=displaced(g.bounds,offsets[i]);
        for(const f of fixed)if(intersects(end,f.g.bounds,layout.gap*.99)){
          nextEnd=Math.max(nextEnd,clearance(g.bounds,f.g.bounds,dir[i])+1e-6);
        }
      }
      if(nextEnd===kEnd)break;
      if(!Number.isFinite(nextEnd)){offsets=null;break;}
      kEnd=nextEnd;offsets=null;
    }
    if(!offsets)continue;
    for(let i=0;i<moving.length;i++)for(const f of fixed){
      if(!intersects(moving[i].bounds,f.g.bounds) && crosses(moving[i].bounds,f.g.bounds,offsets[i]))fixedHits++;
    }
    if(fixedHits>=unresolved)continue;
    // Prefer the closer arrangement when multiple origins are equally clear.
    const span=Math.max(...offsets.map(v=>Math.hypot(...v)));
    // A partial improvement that scatters the whole exhibit can be handled by
    // isolating the assembly. A completely clear route always takes precedence.
    if(fixedHits && span>spanLimit)continue;
    if(!best || fixedHits<best.hits || (fixedHits===best.hits && span<best.span))
      best={offsets,hits:fixedHits,span};
  }
  if(!best)return unresolved;
  for(let i=0;i<moving.length;i++){
    const g=moving[i];g.offset=best.offsets[i];g.parked=displaced(g.bounds,g.offset);g.path=straight(g.offset);
  }
  return best.hits;
}

export function planTravel(layout){
  if(layout.routesPlanned)return;
  const fixed=[],moving=[];
  for(const g of layout.groups.values()){
    if(g.movable)moving.push(g);
    else fixed.push(makeTrack(g,[origin,origin,origin,origin,origin]));
  }
  const volume=g=>g.bounds.max.reduce((v,x,i)=>v*(x-g.bounds.min[i]),1);
  // Keep broad panels on their shortest route, then route small hardware around them.
  moving.sort((a,b)=>volume(b)-volume(a));
  const accepted=[...fixed];let unresolved=0;
  for(const g of moving){
    const obstacles=accepted.filter(t=>!intersects(g.bounds,t.g.bounds));
    const direct=makeTrack(g,straight(g.offset));
    let best=direct,blocked=obstacles.filter(t=>collides(direct,t)),minHits=blocked.length;
    if(blocked.length){
      for(const path of alternatives(g,blocked,layout.gap)){
        const track=makeTrack(g,path);
        let hits=0;
        for(const other of obstacles){
          if(collides(track,other) && ++hits>=minHits)break;
        }
        if(hits<minHits){best=track;minHits=hits;if(!hits)break;}
      }
    }
    unresolved+=minHits;g.path=best.path;
    accepted.push(best);
  }
  layout.blockedTransit=radialSeparation(layout,fixed,moving,unresolved)>0;
  layout.routesPlanned=true;
}
