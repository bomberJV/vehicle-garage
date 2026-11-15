// Originals drawn from Front Runner RRSTM10/11 and Honda AII19646-10.
import {strip} from './road-primitives.js';

const metal='#424a4c', cap='#303638', rubber='#202729', highlight='#636c6e';

export function drawGutterRack(r,selected,gutter=1.922) {
  const fitted=selected.find(p=>p?.id==='g-rack'||p?.id==='g-rack-short');
  if(!fitted)return;
  const full=fitted.id==='g-rack', length=full?2.166:1.964, slats=full?11:10;
  const rear=1.88, front=rear-length, halfWidth=.7375;
  const floor=gutter+.170+(full?.006:0), top=floor+.050;
  const slatX=n=>front+.055+n*(length-.110)/(slats-1);
  const legs=full?[0,4,7,10]:[0,5,9];
  // Attach the full tray in the existing roof rigid group, including hooks.
  for(const side of [-1,1]){
    const rail=side*(halfWidth-.018);
    r.box(front,rail-.018,floor,rear,rail+.018,top,metal);
    for(const n of legs){
      const x=slatX(n),foot=side*.848,head=side*.676;
      r.box(x-.066,foot-.012,gutter-.007,x+.066,foot+.012,gutter+.012,rubber);
      const lower=[[-.060,.850,.012],[-.041,.839,.045],[.041,.839,.045],[.060,.850,.012]];
      const upper=[[-.046,.691,.160],[-.031,.677,.171],[.031,.677,.171],[.046,.691,.160]];
      const points=row=>row.map(([dx,y,dz])=>[x+dx,side*y,gutter+dz]);
      // Folded steel leg sweeps inboard to meet the underside of its slat.
      strip(r,points(lower),points(upper),metal);
      r.box(x-.052,head-.029,floor-.008,x+.052,head+.029,floor+.008,cap);
      const p=(dy,z)=>[x,side*dy,z];
      r.rod(p(.864,gutter-.006),p(.873,gutter+.039),.009,cap,6);
      r.rod(p(.873,gutter+.039),p(.826,gutter+.070),.010,metal,6);
      r.rod(p(.863,gutter+.033),p(.877,gutter+.033),.012,highlight,6);
    }
  }
  for(let n=0;n<slats;n++){
    const x=slatX(n);
    // The paired shoulders leave each slat's upper T-slot recessed.
    r.box(x-.044,-halfWidth+.032,floor+.004,x+.044,halfWidth-.032,top-.012,metal);
    for(const sign of [-1,1]){
      const xx=x+.024*sign;
      r.box(xx-.020,-halfWidth+.032,top-.012,xx+.020,halfWidth-.032,top,metal);
    }
  }
  for(const x of [front+.014,rear-.014])r.box(x-.014,-halfWidth+.036,floor,x+.014,halfWidth-.036,top,cap);
  for(const side of [-1,1]){
    const p=(x,y,z)=>[x,side*y,z];
    r.polygon([p(front,.005,floor+.001),p(front,.67,floor+.001),p(front+.049,.67,floor-.068),p(front+.061,.005,floor-.081)],cap,false);
    r.rod(p(front+.061,.005,floor-.081),p(front+.049,.67,floor-.068),.005,metal,6);
  }
}

export function drawHrvCrossbars(r){
  // The Honda bars clamp to the roof returns. Their four feet have distinct
  // cushions and locking covers; there are no longitudinal rails in this kit.
  r.tag('body.structure',()=>{
    for(const [x,roofZ,halfWidth] of [[-.185,1.571,.704],[.826,1.576,.691]]){
      const barZ=roofZ+.095;
      for(const side of [-1,1]){
        const y0=side*(halfWidth-.071),y1=side*(halfWidth-.011);
        r.profile([[x-.091,roofZ+.003],[x-.069,roofZ+.018],[x+.060,roofZ+.019],[x+.085,roofZ+.002]],
          Math.min(y0,y1),Math.max(y0,y1),rubber);
        const p=(dx,y,z)=>[x+dx,side*y,roofZ+z];
        const inner=[p(-.075,halfWidth-.067,.010),p(-.047,halfWidth-.11,.098),p(.026,halfWidth-.11,.105),p(.070,halfWidth-.067,.015)];
        const outer=[p(-.080,halfWidth,.001),p(-.049,halfWidth+.013,.072),p(.032,halfWidth+.012,.079),p(.077,halfWidth,.006)];
        strip(r,inner,outer,cap);r.polygon(outer,metal,false);
        r.polygon([p(-.055,halfWidth+.002,.017),p(.057,halfWidth+.002,.020),p(.053,halfWidth+.006,-.031),p(-.052,halfWidth+.006,-.033)],cap,false);
        r.rod(p(0,halfWidth+.011,.045),p(0,halfWidth+.015,.045),.009,highlight,10);
      }
      const span=halfWidth-.055;
      const sections=[];
      for(let n=0;n<=8;n++){
        const t=n/4-1,y=t*span,z=barZ+.021*(1-t*t);
        sections.push([[-.041,.009],[-.030,.020],[.019,.019],[.052,.005],[.039,-.006],[-.023,-.013]].map(([dx,dz])=>[x+dx,y,z+dz]));
      }
      for(let i=1;i<sections.length;i++){
        const a=sections[i-1],b=sections[i];
        for(let k=0;k<a.length;k++){const j=(k+1)%a.length;r.polygon([a[k],b[k],b[j],a[j]],['#a8b2b4','#b6c1c1','#9ba4a6','#677378','#62696c','#859195'][k],false);}
        const seal=p=>[p[0][0]+.032,p[0][1],p[0][2]+.011];
        r.rod(seal(a),seal(b),.004,rubber,6);
      }
    }
  });
}
