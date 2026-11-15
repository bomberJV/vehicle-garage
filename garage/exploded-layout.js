// A motion group can include several pickable surfaces, such as a door and its glazing.
export const origin = Object.freeze([0, 0, 0]);
const axes = [0, 1, 2];
const epsilon = 1e-8;

export function emptyBounds() {
  return {min:[Infinity,Infinity,Infinity], max:[-Infinity,-Infinity,-Infinity]};
}
function include(bounds, point) {
  for(const axis of axes) {
    bounds.min[axis]=Math.min(bounds.min[axis],point[axis]);
    bounds.max[axis]=Math.max(bounds.max[axis],point[axis]);
  }
}
export function displaced(bounds, offset) {
  return {min:bounds.min.map((v,i)=>v+offset[i]),max:bounds.max.map((v,i)=>v+offset[i])};
}
export function intersects(a,b,pad=0) {
  return axes.every(i=>a.max[i]+pad>b.min[i]+epsilon && b.max[i]+pad>a.min[i]+epsilon);
}
const extent=b=>Math.max(...b.max.map((v,i)=>v-b.min[i]));
const center=b=>b.min.map((v,i)=>(v+b.max[i])*.5);
const direction=v=>{const length=Math.hypot(...v);return length>epsilon?v.map(n=>n/length):null;};

// Start at the authored exploded pose. If its actual shell overlaps another group,
// find the first clear position along the preferred travel direction. Each step clears
// at least one occupied box permanently, so the loop is bounded by the part count.
function clearAlong(bounds, offset, dir, obstacles, gap) {
  let pose=[...offset];
  for(let pass=0;pass<=obstacles.length;pass++){
    const box=displaced(bounds,pose);
    let distance=0;
    for(const obstacle of obstacles){
      if(!intersects(box,obstacle,gap))continue;
      let exit=Infinity;
      for(const i of axes){
        if(dir[i]>epsilon)exit=Math.min(exit,(obstacle.max[i]+gap-box.min[i])/dir[i]);
        if(dir[i]<-epsilon)exit=Math.min(exit,(obstacle.min[i]-gap-box.max[i])/dir[i]);
      }
      distance=Math.max(distance,exit+1e-6);
    }
    if(distance===0)break;
    pose=pose.map((v,i)=>v+dir[i]*distance);
  }
  return pose;
}

export function planSeparation(faces, classify, envelope=null) {
  const groups=new Map(), entries=[], overall=emptyBounds();
  for(const face of faces){
    const spec=classify(face);
    if(!spec)continue;
    let group=groups.get(spec.key);
    if(!group){
      group={...spec,bounds:emptyBounds(),offset:spec.offset||origin};
      groups.set(spec.key,group);
    }
    for(const p of face.points){include(group.bounds,p);include(overall,p);}
    entries.push({face,group});
  }
  if(envelope)for(const g of groups.values()){
    const b=envelope.get(g.key);
    if(b){include(g.bounds,b.min);include(g.bounds,b.max);include(overall,b.min);include(overall,b.max);}
  }
  const fixed=[], movable=[],repeated=new Map();
  for(const g of groups.values()){
    if(g.movable){
      movable.push(g);
      if(envelope && g.instance){
        const key=g.key.slice(0,-g.instance.length-1),set=repeated.get(key)||[];
        set.push(g);repeated.set(key,set);
      }
    }else fixed.push(g.bounds);
  }
  const active=emptyBounds();
  for(const g of movable){include(active,g.bounds.min);include(active,g.bounds.max);}
  const size=movable.length?extent(active):extent(overall);
  const gap=Math.max(.0009,Math.min(.030,size*.006));
  // Keep the authored extraction axis, but set the first target from the size
  // of the active assembly. Nearby solids can then push it just far enough out.
  for(const g of movable){
    const length=Math.hypot(...g.offset);
    if(!length)continue;
    const preferred=Math.min(length*.55,size*.055+gap*1.5);
    g.authoredLength=length;g.offset=g.offset.map(v=>v*preferred/length);
  }
  // A set of rotating blades shares one swept disk. Stack the separate blades
  // along its thin axis so the rotor fits on the screen through a full cycle.
  for(const set of repeated.values()){
    if(set.length<3)continue;
    const sizes=axes.map(k=>Math.max(...set.map(g=>g.bounds.max[k]-g.bounds.min[k])));
    const axis=sizes.indexOf(Math.min(...sizes));
    if(sizes[axis]*4>Math.max(...sizes))continue;
    const centers=set.map(g=>center(g.bounds));
    if(axes.some(k=>Math.max(...centers.map(c=>c[k]))-Math.min(...centers.map(c=>c[k]))>Math.max(gap,sizes[k]*.12)))continue;
    set.forEach((g,index)=>{
      const d=[...g.offset];d[axis]+=(index-(set.length-1)/2)*(sizes[axis]+gap*1.1);
      g.offset=d;
    });
  }
  // Preserve the ordering of stacked pieces when several travel along one axis.
  movable.sort((a,b)=>(a.authoredLength||0)-(b.authoredLength||0));
  const obstacles=[...fixed];
  for(const g of movable){
    const preferred=direction(g.offset);
    const radial=direction(center(g.bounds).map((v,i)=>v-center(overall)[i]));
    const dir=preferred||radial||[0,0,1];
    const desired=preferred?g.offset:dir.map(v=>v*gap*3);
    g.offset=clearAlong(g.bounds,desired,dir,obstacles,gap);
    g.parked=displaced(g.bounds,g.offset);
    obstacles.push(g.parked);
  }
  return {groups,entries,gap};
}

// Clip a drag against the swept world-space boxes. A fast pointer cannot skip a
// thin nearby part just because its next sampled position is beyond the obstacle.
export function allowedTravel(bounds,delta,obstacles,gap) {
  let fraction=1;
  for(const other of obstacles){
    if(intersects(bounds,other,gap))continue;
    let entry=-Infinity,exit=Infinity;
    for(const i of axes){
      if(Math.abs(delta[i])<epsilon){
        if(bounds.max[i]+gap<=other.min[i] || bounds.min[i]-gap>=other.max[i]){exit=-Infinity;break;}
      }else{
        const t1=(other.min[i]-gap-bounds.max[i])/delta[i];
        const t2=(other.max[i]+gap-bounds.min[i])/delta[i];
        entry=Math.max(entry,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));
      }
    }
    if(entry>=-epsilon && entry<exit && exit>0)fraction=Math.min(fraction,Math.max(0,entry-1e-5));
  }
  return delta.map(n=>n*fraction);
}

export function sampleMotion(motion,time) {
  if(!motion)return 0;
  const t=Math.max(0,Math.min(1,(time-motion.start)/motion.duration));
  const eased=t*t*(3-2*t);
  return motion.from+(motion.to-motion.from)*eased;
}
