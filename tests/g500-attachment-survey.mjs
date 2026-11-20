// Survey of installed G500 parts that hang clear of the rest of the vehicle.
//   node tests/g500-attachment-survey.mjs           print the unattached groups, widest gap first
//   node tests/g500-attachment-survey.mjs --write   rewrite tests/g500-attachment-baseline.json
//
// Two parts are joined when their surfaces come within 5 mm of each other. That
// covers the 1 mm joint line the model leaves between mating faces and an
// ordinary panel gap. Wires, hoses and pipes do not carry anything, so a part
// that reaches the frame only through a line is not attached. Every group of
// parts that is not joined to the frame is listed with its members, the nearest
// solid part outside the group and the gap to it.
//
// A group is not always an error: a bracket, a clip or a hinge that the model
// does not draw leaves its part a short way from the carrier. The baseline
// records the groups that have been seen, so a part that comes loose, or a gap
// that changes, has to be reviewed.
import {writeFileSync,readFileSync} from 'node:fs';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift,liftOptions} from '../garage/lift-options.js';
import {worldTriangles,meshSeparation,mm} from './mesh-proximity.mjs';
import {lines} from './g500-overlap-survey.mjs';

export const baselineFile=new URL('./g500-attachment-baseline.json',import.meta.url);
export const reach=.005,anchor='suspension.frame';
export const poses=liftOptions('g500').map(o=>o.id);

export function installed(mode){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver',lift:normalizedLift('g500',{mode})},
    inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
  r.buildMesh();
  return r.faces;
}

// The groups of solid parts joined within `reach`, found through a uniform grid.
export function groups(faces){
  const tris=worldTriangles(faces,()=>true),owner=[];
  for(const face of faces)for(let k=0;k<face.triangles.length;k+=3)owner.push(face.part);
  const parts=new Map();
  tris.forEach((t,i)=>{const list=parts.get(owner[i]);if(list)list.push(i);else parts.set(owner[i],[i]);});
  const cell=.04,at=v=>Math.floor(v/cell),key=(x,y,z)=>(x+512)*1048576+(y+512)*1024+(z+512),grid=new Map();
  tris.forEach((t,i)=>{
    for(let x=at(t.min[0]);x<=at(t.max[0]);x++)for(let y=at(t.min[1]);y<=at(t.max[1]);y++)for(let z=at(t.min[2]);z<=at(t.max[2]);z++){
      const k=key(x,y,z),list=grid.get(k);if(list)list.push(i);else grid.set(k,[i]);
    }
  });
  const joined=new Map([...parts.keys()].map(id=>[id,new Set()]));
  tris.forEach((t,i)=>{
    const a=owner[i],seen=new Set();
    for(let x=at(t.min[0]-reach);x<=at(t.max[0]+reach);x++)for(let y=at(t.min[1]-reach);y<=at(t.max[1]+reach);y++)for(let z=at(t.min[2]-reach);z<=at(t.max[2]+reach);z++){
      for(const j of grid.get(key(x,y,z))??[]){
        const b=owner[j];
        if(j<=i||b===a||seen.has(j)||joined.get(a).has(b))continue;
        seen.add(j);
        const o=tris[j];
        if([0,1,2].some(n=>t.min[n]-o.max[n]>reach||o.min[n]-t.max[n]>reach))continue;
        const s=meshSeparation([t],[o]);
        if(s.crossings||s.d<=reach){joined.get(a).add(b);joined.get(b).add(a);}
      }
    }
  });
  const solid=[...parts.keys()].filter(id=>!lines.has(id)).sort(),group=new Map(),list=[];
  for(const id of solid){
    if(group.has(id))continue;
    const members=[id],queue=[id];group.set(id,list.length);
    while(queue.length)for(const next of joined.get(queue.pop()))if(!lines.has(next)&&!group.has(next)){group.set(next,list.length);members.push(next);queue.push(next);}
    list.push(members.sort());
  }
  const mesh=ids=>ids.flatMap(id=>parts.get(id).map(i=>tris[i]));
  const box=ids=>{const m=mesh(ids);return {min:[0,1,2].map(n=>Math.min(...m.map(t=>t.min[n]))),max:[0,1,2].map(n=>Math.max(...m.map(t=>t.max[n])))};};
  const boxes=new Map(solid.map(id=>[id,box([id])]));
  const apart=(a,b)=>Math.hypot(...[0,1,2].map(n=>Math.max(0,a.min[n]-b.max[n],b.min[n]-a.max[n])));
  // The exact gap from a group to the nearest solid part outside it.
  const nearest=members=>{
    const own=mesh(members),bounds=box(members);let best={d:Infinity,id:''};
    const others=solid.filter(id=>!members.includes(id)).map(id=>[id,apart(bounds,boxes.get(id))]).sort((u,v)=>u[1]-v[1]);
    for(const [id,d] of others){
      if(d>=best.d)break;
      const s=meshSeparation(own,mesh([id]));
      if(s.d<best.d)best={d:s.d,id};
    }
    return best;
  };
  return {list,main:group.get(anchor),nearest,lines:members=>[...new Set(members.flatMap(id=>[...joined.get(id)].filter(other=>lines.has(other))))].sort()};
}

// The installed mesh and its groups at one pose, built once.
const built=new Map();
export const posed=mode=>built.get(mode)??built.set(mode,(faces=>({faces,...groups(faces)}))(installed(mode))).get(mode);

// Every unattached group at each depicted pose.
export function survey(){
  const found=new Map();
  for(const mode of poses){
    const g=posed(mode);
    g.list.forEach((members,i)=>{
      if(i===g.main)return;
      const key=members.join(' + '),near=g.nearest(members),entry=found.get(key)??found.set(key,{members,gaps:{},lines:g.lines(members)}).get(key);
      entry.gaps[mode]=mm(near.d)+' mm from '+near.id;
    });
  }
  const widest=e=>Math.max(...Object.values(e.gaps).map(parseFloat));
  return [...found.values()].sort((a,b)=>widest(b)-widest(a)||a.members[0].localeCompare(b.members[0]));
}
export const record=found=>Object.fromEntries(found.map(e=>{
  const values=poses.map(mode=>e.gaps[mode]);
  return [e.members.join(' + '),values.every(v=>v===values[0])?values[0]:poses.filter(mode=>e.gaps[mode]).map(mode=>mode+': '+e.gaps[mode]).join(' · ')];
}));
export const baseline=()=>JSON.parse(readFileSync(baselineFile,'utf8'));

if(import.meta.url===new URL(process.argv[1],'file:').href){
  const found=survey();
  if(process.argv.includes('--write')){
    writeFileSync(baselineFile,JSON.stringify(record(found),null,1)+'\n');
    console.log(`wrote ${found.length} unattached groups`);
  }else{
    console.log(`${found.length} groups of installed G500 parts are not joined to the frame within ${reach*1000} mm`);
    for(const [key,gap] of Object.entries(record(found)))console.log(`  ${gap}\n      ${key}`);
  }
}
