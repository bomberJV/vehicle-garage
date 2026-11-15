import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {getAssembly} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {groups} from '../garage/s1000rr-additions.js';

const bike='bmws1000rr';
const model=()=>Object.assign(Object.create(GarageRenderer.prototype),{
  build:sanitizeBuild({vehicle:bike}),faces:[],partPositions:new Map(),inspection:{},schematic:true
});
const points=(faces,id)=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
const limits=(pts,k)=>pts.reduce(([lo,hi],p)=>[Math.min(lo,p[k]),Math.max(hi,p[k])],[Infinity,-Infinity]);
const get=id=>getDetail(bike,id);

test('the K67 fluid, intake, timing and exhaust systems exist in the assembled bike and retain the same coordinates on the bench',()=>{
  const r=model();r.buildMesh();const whole=r.faces;
  for(const g of groups){
    assert(getAssembly(bike,g.id));
    r.inspection={assembly:g.id};r.isolate=true;r.buildMesh();
    for(const p of g.parts){
      const installed=points(whole,p.id);
      assert(installed.length>0,p.id);assert.deepEqual(points(r.faces,p.id),installed,p.id);
      assert.match(p.source.url,/^https:/);
    }
  }
  for(const [group,old,parts] of [['engine','engine.airbox',['intake.airbox']],['engine','engine.cooling',['cooling.radiator']],['drive','drive.exhaust',groups.find(g=>g.id==='exhaust').parts.map(p=>p.id)]]){
    assert.equal(points(whole,old).length,0);
    r.inspection={assembly:group,part:old,onlyPart:true};r.buildMesh();
    assert.deepEqual(points(r.faces,old),parts.flatMap(id=>points(whole,id)));
  }
  r.inspection={};r.isolate=false;r.buildMesh();
  assert.equal(r.faces.length,whole.length);
  for(const p of ['brakes.master','brakes.abs','brakes.lines'])assert(points(whole,p).length>0,p);
});

test('mounted K67 dimensions locate the mirrors, wheels, lower oil cooler and road lamps',()=>{
  const r=model();r.buildMesh();
  const centers=['front','rear'].map(axle=>{
    const vertices=r.faces.filter(f=>f.part==='running.tires'&&f.instance===axle).flatMap(f=>f.points);
    const [lo,hi]=limits(vertices,0);return (lo+hi)*.5;
  });
  const [left,right]=limits(points(r.faces,'cabin.controls'),1);
  assert.equal(Math.round(1000*(right-left)),846);assert.equal(Math.round(1000*(centers[1]-centers[0])),1457);
  const cooler=points(r.faces,'cooling.oil-cooler'),water=points(r.faces,'cooling.radiator');
  assert(limits(cooler,2)[1]<limits(water,2)[0]);assert(limits(cooler,1)[1]<limits(water,1)[1]);
  const all=limits(r.faces.flatMap(f=>f.points),0);assert.equal(Math.round(1000*(all[1]-all[0])),2073);
  const tails=points(r.faces,'body.tail-carrier').filter(p=>p[0]>.94&&p[2]>.84);
  assert(tails.some(p=>p[1]<-.12)&&tails.some(p=>p[1]>.12));
});

test('K67 study links lead through installed hardware to moving parts and the pump seal section',()=>{
  const links=[
    ['engine.airbox','k67-air-tray.throttles','k67-throttles'],
    ['engine.cooling','k67-radiator-pack.fan','k67-radiator-fan'],
    ['cooling.pump','k67-combined-pump.seal','k67-pump-seal'],
    ['engine.head','k67-timing.intake','k67-shiftcam'],
    ['drive.exhaust','k67-exhaust.flaps','k67-exhaust-flap']
  ];
  for(const [root,child,id] of links){
    const parent=get(root);assert(parent.componentIndex.has(child));assert.equal(get(child).id,id);
    for(const detail of [parent,get(child)]){
      const r=model();detail.draw(r,.11);
      const tags=new Set(r.faces.map(f=>f.part));assert.deepEqual(tags,new Set(detail.componentIndex.keys()));
      assert(r.faces.every(f=>f.points.every(p=>p.every(Number.isFinite))));
      if(detail.animated){
        const first=r.faces.map(f=>f.points);r.faces=[];detail.draw(r,.41);
        assert.notDeepEqual(r.faces.map(f=>f.points),first);
      }
    }
  }
});

test('the production K67 tank, rider pocket and tail follow the Racing Red side photograph',()=>{
  const r=model();r.buildMesh();
  // Native 1200 × 800 studio photograph. Use the front axle as origin and
  // set scale once from the front/rear axle horizontal pixel separation.
  const scale=1.457/(1013-194);
  const world=(u,v)=>[-.728+(1013-u)*scale,.300+(596-v)*scale];
  const landmarks=[
    ['body.tank',606,193,.015],['body.tank',720,205,.020],['body.tank',532,235,.020],
    ['body.seat',443,297,.016],['body.seat',323,273,.020],['body.seat',137,186,.016],
    ['engine.case',609,487,.033],['chassis.swingarm',194,580,.045]
  ];
  for(const [id,u,v,tolerance] of landmarks){
    const [x,z]=world(u,v),vertices=points(r.faces,id);
    const nearest=Math.min(...vertices.map(p=>Math.hypot(p[0]-x,p[2]-z)));
    assert(nearest<tolerance,id+' @ '+u+', '+v+' off '+nearest.toFixed(3)+' m');
  }
});

test('standard cast wheels retain five shared roots and ten open branches',()=>{
  const r=model();r.buildMesh();
  for(const [name,x,z] of [['front',-.728,.300],['rear',.729,.315]]){
    const vertices=r.faces.filter(f=>f.part==='running.rims'&&f.instance===name).flatMap(f=>f.points);
    const contacts=(radius,tolerance)=>{
      const angles=new Set();
      for(const [xx,,zz] of vertices){
        if(Math.abs(Math.hypot(xx-x,zz-z)-radius)<tolerance){
          angles.add(Math.round(Math.atan2(zz-z,xx-x)*10000));
        }
      }
      return angles.size;
    };
    // Two side edges per cast arm, visible from both sides of one physical wheel.
    assert.equal(contacts(.2159*.43,.00003),10,name+' roots');
    assert.equal(contacts(.2159*.76,.00003),20,name+' split arms');
  }
});
