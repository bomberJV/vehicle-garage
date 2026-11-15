import assert from 'node:assert/strict';
import test from 'node:test';
import {bikeChainState} from '../garage/bike-chain.js';
import {getBikeDetail} from '../garage/bike-studies.js';
import {GarageRenderer} from '../garage/render.js';

const get=key=>getBikeDetail('bmws1000rr',key);
function geometry(s,t=0){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  s.draw(r,t);return r.faces;
}
test('the S 1000 RR has a 122-link loop and rollers line up with both sprockets throughout a turn',()=>{
  const start=bikeChainState(0),end=bikeChainState(1);
  const tau=2*Math.PI;
  assert(Math.abs((start.frontAngle-end.frontAngle)/(start.rearAngle-end.rearAngle)-46/17)<1e-12);
  assert(Math.abs((start.rearAngle-end.rearAngle)-tau)<1e-12);
  for(const t of [0,.098,.38,.68,1]){
    const st=bikeChainState(t);assert.equal(st.centers.length,122);
    const tol=1e-9;
    for(const [which,teeth,rad,angle] of [['front',17,st.r,st.frontAngle],['rear',46,st.R,st.rearAngle]]){
      const wrap=st.centers.filter(([x,z])=>Math.abs(Math.hypot(x-st[which],z)-rad)<tol);
      assert(wrap.length>5);
      for(const [x,z] of wrap){
        const mesh=(Math.atan2(z,x-st[which])-angle)/tau*teeth;
        assert(Math.abs(mesh-Math.round(mesh))<tol);
      }
    }
    st.centers.forEach((p,i)=>{
      const q=st.centers[(i+1)%122],span=Math.hypot(...p.map((n,j)=>n-q[j]));
      assert(Math.abs(span-st.pitch)<.00031);
    });
  }
});
test('the chain, rear-wheel drive and seat each lead to separate pickable parts',()=>{
 const drive=get('drive.chain'),chain=get('k67-final.chain'),carrier=get('k67-final.rear'),seat=get('body.seat');
 assert.equal(get('drivetrain.chain'),drive);assert.equal(get('drivetrain.rear-sprocket'),carrier);
 assert.equal(getBikeDetail('hrv','drive.chain'),null);
 for(const s of [drive,chain,carrier,seat]){
   assert(s.source.url.startsWith('https://'));
   const parts=s.groups.flatMap(g=>g.parts);const faces=geometry(s,.32);
   assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(parts.map(p=>p.id)));
   assert(faces.every(f=>f.points.every(v=>v.every(Number.isFinite))));
   assert(parts.every(p=>Math.hypot(...p.offset)>0));
 }
 for(const id of ['outer','inner','pins','bush','roller','seals'])assert(chain.groups[0].parts.some(p=>p.id.endsWith('.'+id)));
 for(const id of ['sprocket','carrier','damper','hub','bearing'])assert(carrier.groups[0].parts.some(p=>p.id.endsWith('.'+id)));
 for(const id of ['seams','cover','foam','pan','front','lug'])assert(seat.groups[0].parts.some(p=>p.id.endsWith('.'+id)));
});
