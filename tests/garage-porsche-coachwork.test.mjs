import assert from 'node:assert/strict';
import test from 'node:test';
import {roadModels} from '../garage/fleet-road.js';
import {getDetail} from '../garage/detail-catalog.js';
import {GarageRenderer} from '../garage/render.js';

const cars=roadModels.slice(0,2);
function mesh(draw){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  draw(r);
  return r.faces;
}
const shape=(faces,part)=>faces.filter(f=>f.part===part).map(f=>f.points);
const avgZ=polys=>{
  const points=polys.flat();
  return points.reduce((height,point)=>height+point[2],0)/points.length;
};
test('both Cabriolet spoiler paths redraw the same moving geometry as the complete vehicle',()=>{
  for(const car of cars){
    const paint='#7798aa',finish='#bcc2c0',draw=t=>mesh(r=>car.draw(r,paint,finish,t));
    const parked=draw(0),raised=draw(.5);
    const cached=t=>mesh(r=>car.motion.drawMoving(r,paint,finish,t));
    const moving=cached(.5),returned=cached(1);
    assert.deepEqual(new Set(moving.map(f=>f.part)),new Set(car.motion.parts));
    for(const part of car.motion.parts){
      assert.deepEqual(shape(raised,part),shape(moving,part));
      assert.deepEqual(shape(parked,part),shape(returned,part));
      assert.deepEqual(parked.filter(f=>f.part===part).map(f=>f.vertexColors),returned.filter(f=>f.part===part).map(f=>f.vertexColors));
    }
    assert(avgZ(shape(raised,'shell.spoiler'))>avgZ(shape(parked,'shell.spoiler'))+.1);
    for(const part of ['shell.deck','shell.bumpers','lights.tail','shell.left-door','cabin.carpet']){
      assert.deepEqual(shape(parked,part),shape(raised,part));
    }
    const triangles=faces=>faces.reduce((n,f)=>n+(f.triangles?f.triangles.length/3:Math.max(1,f.points.length-2)),0);
    assert(triangles(moving)<triangles(parked)*.08);
    // Painted panels may be packed into shared-vertex batches; count shaded vertices.
    const shaded=parked.filter(f=>f.vertexColors?.length===f.points.length);
    assert(shaded.reduce((sum,f)=>sum+f.points.length,0)>4000);
  }
});
test('spoiler carrier opens into a motor cutaway and linkage joint in the actual inspector',()=>{
  for(const car of cars){
    const assembly=getDetail(car.id,'shell.spoiler');
    assert.equal(assembly,getDetail(car.id,'shell.spoiler')); // cached registry
    assert.equal(assembly.id,getDetail(car.id,'shell.spoiler-drive').id);
    const id=assembly.id,parts=[...assembly.componentIndex.keys()];
    for(const key of ['blade','carrier','motor','output','left','right','closure','sensor'])assert(parts.includes(id+'.'+key));
    const parked=mesh(r=>assembly.draw(r,0)),raised=mesh(r=>assembly.draw(r,.5));
    assert.deepEqual(shape(parked,id+'.carrier'),shape(raised,id+'.carrier'));
    for(const part of ['left','right','blade','closure'])assert.notDeepEqual(shape(parked,id+'.'+part),shape(raised,id+'.'+part));
    const motor=getDetail(car.id,id+'.motor'),pivot=getDetail(car.id,id+'.left');
    for(const [detail,moving,fixed] of [[motor,'rotor','case'],[pivot,'link','pin']]){
      const a=mesh(r=>detail.draw(r,0)),b=mesh(r=>detail.draw(r,.25));
      assert.deepEqual(new Set(a.map(f=>f.part)),new Set(detail.componentIndex.keys()));
      assert.notDeepEqual(shape(a,detail.id+'.'+moving),shape(b,detail.id+'.'+moving));
      assert.deepEqual(shape(a,detail.id+'.'+fixed),shape(b,detail.id+'.'+fixed));
      assert(detail.animated && detail.source.url.startsWith('https://'));
    }
    assert.equal(getDetail(car.id,id+'.right').id,pivot.id);
    assert.match(assembly.componentIndex.get(id+'.sensor').name,car.year===1998?/microswitch/:/Hall/);
  }
});

test('the 993 drives two belts and the 992 has separate coolant and charge-air cooling paths',()=>{
  const [classic,current]=cars;
  const snapshots=(view,t)=>mesh(r=>view.draw(r,t));
  const fan=getDetail(classic.id,'engine.cooling');
  for(const p of ['wheel','fanpulley','genpulley','fanbelt','genbelt','crank']){
    const id=fan.id+'.'+p;
    assert.notDeepEqual(shape(snapshots(fan,0),id),shape(snapshots(fan,.18),id));
  }
  for(const component of ['993fan.alternator','993fan.fanpulley'])assert(getDetail(classic.id,component)?.componentIndex.size>=5);
  assert.equal(getDetail(classic.id,'engine.left-blower'),null);
  const modern=mesh(r=>current.draw(r));
  const paths=['engine.cooling','engine.left-blower','engine.right-blower','engine.intercoolers'];
  assert.equal(new Set(paths.map(p=>getDetail(current.id,p).id)).size,4);
  for(const p of paths)assert(shape(modern,p).length>0);
  for(const p of ['left-blower','right-blower']){
    const view=getDetail(current.id,'engine.'+p);
    const a=snapshots(view,0),b=snapshots(view,.22),rotor=view.id+'.impeller';
    assert.notDeepEqual(shape(a,rotor),shape(b,rotor));
    assert.deepEqual(shape(a,view.id+'.motor'),shape(b,view.id+'.motor'));
  }
  for(const part of getDetail(current.id,'engine.intercoolers').componentIndex.keys())assert(getDetail(current.id,part)?.id==='992deckcore');
  const front=getDetail(current.id,'engine.cooling');
  assert.equal(front.componentIndex.size,10);
  assert([...front.componentIndex.values()].some(p=>p.description.includes('400 W and 650 W')));
  assert(Math.max(...shape(modern,'engine.cooling').flat().map(p=>p[0]))<0);
  assert(Math.min(...shape(modern,'engine.intercoolers').flat().map(p=>p[0]))>1);
});

test('painted Porsche door and luggage joints use continuous ribbons with a visible edge at grazing angles',()=>{
  for(const car of cars){
    const faces=mesh(r=>car.draw(r,'#f4c430','#c2c2c2'));
    const seams=faces.filter(f=>f.panelJoint&&f.triangles);
    assert.equal(seams.length,7);
    for(const face of seams){
      const door=face.panelJoint==='door',n=face.points.length/(door?2:3),index=door?2:1;
      assert(Number.isInteger(n)&&n>10);
      assert.equal(face.triangles.length,(n-1)*(door?6:12));
      for(let i=0;i<n;i++){
        const p=face.points[i],q=face.points[2*n-1-i];
        const width=Math.hypot(p[0]-q[0],p[index]-q[index]);
        if(car.year===1998)assert(width>.0053&&width<.0065,'993 shut line remains within its fitted width');
        else assert(width>.0058&&width<.0075,'992 shut line keeps its fitted width around corners');
        if(!door){
          const apex=face.points[2*n+i];
          assert(apex[2]-(p[2]+q[2])*.5>.001,'rolled edge remains above adjacent facets');
        }
      }
    }
  }
});

test('Cabriolet windshields follow the wheelbase-scaled cowl, pillar foot and header of each factory side outline',()=>{
  // Side-outline points digitized from the two Porsche Cabriolet sheets at
  // 750 pixels high. The rear axle supplies scale, independent of body length.
  const drawings=[
    {front:158.5,rear:365.5,axleY:512.5,cowl:208,foot:230,top:250,corner:256,topY:427,hubHeight:.322},
    {front:149.5,rear:375,axleY:507.5,cowl:182,foot:205,top:240,corner:249,topY:425,hubHeight:.339}
  ];
  for(const [i,car] of cars.entries()){
    const ref=drawings[i],wheelbase=i?2.45:2.272,frontX=i?-1.20:-1.16;
    const points=mesh(r=>car.draw(r)).filter(f=>f.part==='cabin.windshield'&&f.opacity).flatMap(f=>f.points);
    const center=points.filter(p=>Math.abs(p[1])<1e-8).sort((a,b)=>a[2]-b[2]);
    const sill=[...points].sort((a,b)=>a[2]-b[2])[0],header=center.at(-1);
    const sideHeader=points.filter(p=>p[1]>.56).sort((a,b)=>Math.abs(a[1]-(i?.647:.577))-Math.abs(b[1]-(i?.647:.577))||b[2]-a[2])[0];
    const relativeX=point=>(point[0]-frontX)/wheelbase,drawX=p=>(p-ref.front)/(ref.rear-ref.front);
    for(const [point,target] of [[center[0],ref.cowl],[sill,ref.foot],[header,ref.top],[sideHeader,ref.corner]]){
      assert(Math.abs(relativeX(point)-drawX(target))<.012,car.id+' windshield longitudinal anchor');
    }
    const normalizedRise=(header[2]-ref.hubHeight)/wheelbase;
    assert(Math.abs(normalizedRise-(ref.axleY-ref.topY)/(ref.rear-ref.front))<.012,car.id+' windshield header height');
  }
});
