import test from 'node:test';
import assert from 'node:assert/strict';
import {getRoadDetail,getRoadDrivetrain,drawRoadDrivetrain} from '../garage/road-mechanisms.js';
import {roadModels} from '../garage/fleet-road.js';
import {GarageRenderer} from '../garage/render.js';
import {pulleyState} from '../garage/mechanism-cvt.js';
import {differentialState} from '../garage/mechanism-differential.js';
import {planetaryState} from '../garage/mechanism-planetary.js';

const models=['g500','bmw325ci','c63','hrv','f350','porsche993cab','porsche992scab','bmws1000rr'];
const close=(a,b,tolerance=1e-8)=>assert(Math.abs(a-b)<tolerance,`${a} vs ${b}`);
function mesh(draw){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],currentPart:null});
  draw(r);
  return r.faces;
}
function compareDrawToList(list,draw){
  const ids=list.map(p=>p.id),faces=mesh(draw);
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(ids));
  for(const f of faces){
    assert(f.points.length>=3);
    assert(f.points.every(p=>p.length===3&&p.every(Number.isFinite)),f.part);
  }
  for(const p of list){
    assert(p.name&&p.description,p.id);
    assert(p.offset.length===3&&p.offset.every(Number.isFinite)&&Math.hypot(...p.offset)>0,p.id);
  }
}
test('road layouts draw individual finite, tagged parts using each vehicle architecture',()=>{
  for(const id of models){
    const assembly=getRoadDrivetrain(id);
    assert.equal(assembly.id,'drivetrain');
    assert(assembly.source.url.startsWith('https://'));
    compareDrawToList(assembly.parts,r=>drawRoadDrivetrain(r,id));
  }
  const honda=getRoadDrivetrain('hrv').parts.map(p=>p.id);
  // The decided US EX-L AWD keeps the transaxle front differential and adds the rear driveline.
  for(const key of ['front-differential','transfer','propshaft','center-support','rear-coupling','rear-differential','rear-halfshafts'])assert(honda.includes('drivetrain.'+key),key);
  assert(getRoadDrivetrain('g500').parts.some(p=>p.id==='drivetrain.transfer'));
  assert(getRoadDrivetrain('bmws1000rr').parts.some(p=>p.id==='drivetrain.chain'));
  const ford=getRoadDrivetrain('f350').parts.map(p=>p.id);
  for(const id of ['gearbox','torque-converter','propshaft','rear-differential','axle-housing','axle-shafts','hubs'])assert(ford.includes('drivetrain.'+id),id);
  assert(!ford.includes('drivetrain.halfshafts'),'a full-floating axle has no CV half-shafts');
});
test('nested mechanisms declare exactly the selectable geometry they draw at sampled phases',()=>{
  const checked=new Set();
  for(const id of models){
    const work=['powertrain.spark-plugs',...getRoadDrivetrain(id).parts.map(p=>p.id)];
    const seen=new Set();
    for(const partId of work){
      const detail=getRoadDetail(id,partId);
      if(!detail||seen.has(detail.id))continue;
      seen.add(detail.id);
      const parts=detail.groups.flatMap(g=>g.parts);
      work.push(...parts.map(p=>p.id));
      if(checked.has(detail.id))continue;
      checked.add(detail.id);
      assert(detail.source.label&&detail.source.url.startsWith('https://'),detail.id);
      for(const time of (detail.animated?[0,.33,.63,1]:[0]))compareDrawToList(parts,r=>detail.draw(r,time));
    }
  }
  for(const id of ['spark','electrode','cvt','pushbelt','diff','transaxle-diff','shaft','cvjoint','manual','clutch','wetclutch','roller','planetary','launch-clutch','g500-input-shaft','g500-front-propeller','g500-rear-propeller','converter','hrv-transfer','hrv-propshaft','hrv-coupling'])assert(checked.has(id),id);
  assert.equal(getRoadDetail('f350','powertrain.spark-plugs').id,'spark');
  assert.equal(getRoadDetail('f350','drivetrain.rear-differential').id,'diff');
  assert.equal(getRoadDetail('f350','drivetrain.gearbox').id,'planetary');
  assert.equal(getRoadDetail('f16','powertrain.spark-plugs'),null);
});
test('CVT pitch radii preserve belt length and fixed sheaves hold their axial positions',()=>{
  const first=pulleyState(0),high=pulleyState(.5),bench=getRoadDetail('hrv','drivetrain.gearbox');
  assert(first.input<high.input&&first.output>high.output);
  for(let i=0;i<=120;i++){
    const {input,output,length,speedRatio}=pulleyState(i/120);
    close(length,first.length);close(input,speedRatio*output);close(input,pulleyState(i/120+.5).output);
  }
  const range=(faces,id)=>{
    const coordinates=faces.filter(f=>f.part===id).flatMap(f=>f.points.map(p=>p[1]));
    return [Math.min(...coordinates),Math.max(...coordinates)];
  };
  const lowFaces=mesh(r=>bench.draw(r,0)),highFaces=mesh(r=>bench.draw(r,.5));
  for(const which of ['primary','secondary']){
    const suffix='cvt.'+which+'-';
    for(const n of [0,1]){
      close(range(lowFaces,suffix+'back')[n],range(highFaces,suffix+'back')[n]);
      assert(Math.abs(range(lowFaces,suffix+'front')[n]-range(highFaces,suffix+'front')[n])>.1);
    }
  }
  assert(bench.viewAngle[1]>.4);
});
test('open differential speeds average to carrier speed, and the 16:32 fixed ring gives 3:1',()=>{
  let diverged=false;
  for(let i=1;i<=120;i++){
    const a=differentialState((i-1)/120),b=differentialState(i/120);
    const left=b.left-a.left,right=b.right-a.right,carrier=b.carrier-a.carrier;
    close((left+right)/2,carrier);
    if(Math.abs(left-right)>.03)diverged=true;
    close(b.spider-a.spider,(right-left)*.75);
    const p=planetaryState(i/120);
    close((p.sun-p.carrier)*16+(p.ring-p.carrier)*32,0);
    close((p.planet-p.carrier)*8+(p.sun-p.carrier)*16,0);
  }
  assert(diverged);
});

test('every Porsche and RR plug is installed at its cylinder, individually selectable, and opens the spark cutaway',()=>{
  const counts={porsche993cab:12,porsche992scab:6,porsche996cab:6,bmws1000rr:4};
  for(const vehicle of roadModels){
    const rows=vehicle.groups.find(group=>group.id==='engine').parts.filter(p=>p.id.startsWith('engine.plug-'));
    assert.equal(rows.length,counts[vehicle.id]);
    const faces=mesh(r=>vehicle.draw(r));
    for(const row of rows){
      const plug=faces.filter(f=>f.part===row.id);
      assert(plug.length>=35,row.id);
      assert(row.source.url.startsWith('https://'));
      assert.equal(getRoadDetail(vehicle.id,row.id).id,'spark');
      assert.equal(getRoadDetail(vehicle.id,'spark.center').id,'electrode');
      const vertices=plug.flatMap(f=>f.points),mean=axis=>vertices.reduce((sum,p)=>sum+p[axis],0)/vertices.length;
      const cx=mean(0),cy=mean(1),cz=mean(2),left=row.id.includes('left');
      assert.equal(cy<0,left,row.id);
      if(vehicle.id==='bmws1000rr'){
        const index=rows.indexOf(row);
        close(cy,(index-1.5)*.081,1e-5);
        assert(cx<-.30&&cx>-.36&&cz>.70&&cz<.78);
      }else{
        const station=['forward','middle','rear'].findIndex(s=>row.id.includes(s));
        // Use the six installed barrel cap centers as the reference so the
        // plug seat cannot drift away when an engine bank is repositioned.
        const centers=faces.filter(f=>f.part==='engine.cylinders'&&f.points.length===14&&f.points.every(p=>Math.abs(p[1]-(left?-.37:.37))<1e-6))
          .map(f=>f.points.reduce((sum,p)=>sum+p[0],0)/f.points.length).sort((a,b)=>a-b);
        assert.equal(centers.length,3);
        close(cx,centers[station],1e-5);
        assert(Math.abs(cy)>.37&&Math.abs(cy)<.46);
        if(vehicle.id==='porsche993cab')assert(row.id.endsWith('upper')?cz>.545:cz<.46);
        else close(cz,.502,1e-5);
      }
    }
  }
});
