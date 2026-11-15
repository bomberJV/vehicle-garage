// Explode a moving mechanism around one envelope for its complete cycle.
// Planning from the current pose made the parked offsets jump as parts turned.
import {emptyBounds} from './exploded-layout.js';
const envelopes=new WeakMap();
export function motionEnvelope(detail,renderer){
  if(envelopes.has(detail))return envelopes.get(detail);
  const sample=Object.create(renderer),byPart=new Map();
  sample.currentPart=null;sample.currentInstance=null;sample.currentRigid=null;
  for(let n=0;n<16;n++){
    sample.faces=[];detail.draw(sample,n/16);
    for(const face of sample.faces){
      const key=face.instance?face.part+':'+face.instance:face.part;
      let b=byPart.get(key);
      if(!b){b=emptyBounds();byPart.set(key,b);}
      for(const p of face.points)for(let i=0;i<3;i++){
        b.min[i]=Math.min(b.min[i],p[i]);b.max[i]=Math.max(b.max[i],p[i]);
      }
    }
  }
  // Leave room for extrema between the sampled positions.
  for(const b of byPart.values())for(let i=0;i<3;i++){
    const margin=(b.max[i]-b.min[i])*.012;
    b.min[i]-=margin;b.max[i]+=margin;
  }
  envelopes.set(detail,byPart);return byPart;
}
