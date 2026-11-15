// Keep the order of actual drag segments. In particular, "return all" undoes
// interleaved moves in reverse order, so a part can retrace a bent drag path.
import {origin} from './exploded-layout.js';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export function rememberMove(history,key,from,to){
  const previous=history.at(-1);
  if(previous?.key===key){
    const via=distance(previous.from,from)+distance(from,to);
    if(Math.abs(via-distance(previous.from,to))<1e-7){
      previous.to=to;return;
    }
  }
  history.push({key,from,to});
}
export function returningPath(positions,history,key){
  const pending=new Map([...positions].filter(([id])=>key==null||id===key));
  const moves=[];
  function leg(id,to){
    const from=pending.get(id);
    if(!from)return;
    const travel=distance(from,to);
    if(travel>1e-8)moves.push({key:id,from,to,travel});
    pending.set(id,to);
  }
  for(let i=history.length-1;i>=0;i--)leg(history[i].key,history[i].from);
  for(const id of pending.keys())leg(id,origin);
  return {moves,keys:new Set(pending.keys()),length:moves.reduce((sum,m)=>sum+m.travel,0),index:0,finished:0};
}
// The same ease is applied over total arc length; there is no pause at every
// pointer sample. Canonical parked/assembled coordinates are restored at t=1.
export function advanceReturn(path,positions,progress,apply){
  const distance=path.length*progress;
  while(path.index<path.moves.length){
    const m=path.moves[path.index], remaining=distance-path.finished;
    const t=Math.min(1,Math.max(0,remaining/m.travel));
    const requested=m.from.map((v,i)=>v+(m.to[i]-v)*t);
    const actual=apply?apply(m.key,positions.get(m.key)||origin,requested):requested;
    positions.set(m.key,actual);
    if(actual.some((v,i)=>Math.abs(v-requested[i])>1e-6))return 'blocked';
    if(t<1-1e-8)return 'running';
    path.finished+=m.travel;path.index++;
  }
  for(const key of path.keys)positions.delete(key);
  return 'done';
}
