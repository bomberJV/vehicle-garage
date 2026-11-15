export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const weightGiB=(n,b)=>n*1e9*b/8/2**30;
export function acceleration(x,y,z,{mass=1,scale=1,halo=1}={}){const r=Math.max(.04,Math.hypot(x,y,z)),k=mass/(r*(r+scale)**2)+halo/(r*r+4);return [-k*x,-k*y,-k*z];}
export function circularSpeed(r,{mass=1,scale=1,halo=1}={}){return Math.sqrt(mass*r/(r+scale)**2+halo*r*r/(r*r+4));}
export function overlap(a,b,sizeA,sizeB){const lo=Math.max(a-sizeA/2,b-sizeB/2),hi=Math.min(a+sizeA/2,b+sizeB/2);return {size:Math.max(0,hi-lo),center:(lo+hi)/2};}
export function rollDie(sides,random=crypto){const limit=Math.floor(2**32/sides)*sides;let n;do{n=random.getRandomValues(new Uint32Array(1))[0];}while(n>=limit);return n%sides+1;}
export const seeded=(seed=731)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
export function canvasSize(canvas){const ctx=canvas.getContext('2d');let w=1,h=1;const resize=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);};new ResizeObserver(resize).observe(canvas);resize();return {ctx,get w(){return w},get h(){return h}};}
export function safeLoad(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export function safeSave(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function download(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function advanceTracer(p,dt,params){let a=acceleration(p.x,p.y,p.z,params);p.vx+=a[0]*dt/2;p.vy+=a[1]*dt/2;p.vz+=a[2]*dt/2;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;a=acceleration(p.x,p.y,p.z,params);p.vx+=a[0]*dt/2;p.vy+=a[1]*dt/2;p.vz+=a[2]*dt/2;}
