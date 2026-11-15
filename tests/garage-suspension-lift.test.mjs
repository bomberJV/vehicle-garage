import test from 'node:test';
import assert from 'node:assert/strict';
import {liftOptions,liftSupply,normalizedLift} from '../garage/lift-options.js';
import {GarageRenderer} from '../garage/render.js';
import {accounting,availableParts,exportText,importBuild,sanitizeBuild,togglePart} from '../garage/model.js';

const vehicles=['g500','porsche993cab','porsche992scab'];
const fieldKinds=['guard','ladder','snorkel','aux','display'];
const near=(a,b,epsilon=1e-9)=>assert.ok(Math.abs(a-b)<epsilon,a+' vs '+b);
function render(build,inspection={}){
  const viewport=Object.assign(Object.create(GarageRenderer.prototype),{
    build,inspection,lights:true,progress:0,schematic:true,partPositions:new Map()
  });
  viewport.buildMesh();
  return viewport;
}
function points(faces,id){
  const part=faces.filter(face=>face.part===id).flatMap(face=>face.points);
  assert.ok(part.length,id+' has installed geometry');
  return part;
}
function grounded(viewport,vehicle,baseline){
  const parts=vehicle==='g500'?['wheels.tire','wheels.rim','wheels.caliper','wheels.disc','steering.axle','differentials.front','differentials.rear']:['running.tires','running.rims','brakes.front-disc','brakes.rear-disc','brakes.front-caliper','brakes.rear-caliper'];
  for(const part of parts)assert.deepEqual(points(viewport.faces,part),points(baseline,part),part);
  const floor=Math.min(...points(baseline,parts[0]).map(p=>p[2]));
  near(viewport.meshCache.groundZ,floor);
}
function assertRigidRise(before,after,id,rise){
  const base=points(before,id),moved=points(after,id);
  assert.equal(moved.length,base.length);
  for(let i=0;i<base.length;i++){
    near(moved[i][0],base[i][0]);near(moved[i][1],base[i][1]);near(moved[i][2]-base[i][2],rise);
  }
}
test('lift setup and height survive storage and imports; only sourced G500 springs produce a supplier line',()=>{
  for(const vehicle of vehicles){
    const base=sanitizeBuild({vehicle});
    assert.deepEqual(base.lift,{mode:'stock',mm:0});
    for(const choice of liftOptions(vehicle).slice(1)){
      const expected=40;
      const build=sanitizeBuild({...base,roofPosition:'up',lift:{mode:choice.id,mm:58}});
      const persisted=JSON.parse(JSON.stringify({build,byVehicle:{[vehicle]:build},saved:[build]}));
      for(const b of [persisted.build,persisted.byVehicle[vehicle],persisted.saved[0],importBuild(JSON.stringify(build))]){
        assert.deepEqual(sanitizeBuild(b),build);assert.equal(b.lift.mm,expected);
      }
      assert.match(exportText(build),new RegExp(expected+' mm'));
      if(vehicle==='g500'){
        const row=availableParts(vehicle).find(part=>part.id===liftSupply.id);
        assert.deepEqual(togglePart(base,row.id),build);
        assert.deepEqual(sanitizeBuild({...base,lift:undefined,parts:[row.id]}).lift,build.lift);
        assert.deepEqual(accounting(build).unknown,[row.id]);assert.ok(exportText(build).includes(row.url));
        const quote=importBuild(JSON.stringify({...build,quotes:{[row.id]:1125}}));
        assert.equal(accounting(quote).total,1125);assert.deepEqual(togglePart(quote,row.id),base);
        assert.deepEqual(sanitizeBuild({...quote,lift:{mode:'stock'}}),base);
      }else{
        assert.equal(build.roofPosition,'up');assert.equal(accounting(build).lines.length,0);
      }
    }
  }
  assert.deepEqual(liftOptions('constructor'),[]);
  assert.equal(sanitizeBuild({vehicle:'hrv',lift:{mode:'g500-orc-40',mm:90}}).lift,undefined);
  assert.deepEqual(liftOptions('porsche993cab').map(o=>o.id),['stock']);
  assert.deepEqual(liftOptions('porsche992scab').map(o=>o.id),['stock','992-front-axle']);
  for(const [vehicle,mode] of [['porsche993cab','993-height-study'],['porsche992scab','992-height-study']]){
    const legacy={version:1,vehicle,parts:[],lift:{mode,mm:67}};
    assert.deepEqual(sanitizeBuild(legacy).lift,{mode:'stock',mm:0});
    assert.deepEqual(importBuild(JSON.stringify(legacy)).lift,{mode:'stock',mm:0});
  }
  assert.equal(normalizedLift('porsche993cab',{mode:'992-front-axle'}).mm,0);
});
test('the G500 spring kit raises its body and equipment while the axles and wheel ends stay grounded',()=>{
  const vehicle='g500',parts=fieldKinds.map(k=>vehicle+'-field-'+k);
  const stock=sanitizeBuild({vehicle,parts}),r=render(stock),baseline=r.faces;
  r.build=sanitizeBuild({...stock,lift:{mode:'g500-orc-40'}});r.buildMesh();
  grounded(r,vehicle,baseline);
  const body=['body.hood','body.spare','lighting.headlamp','suspension.frame','differentials.center'];
  for(const tag of [...body,...fieldKinds.map(k=>'accessories.'+k)])assertRigidRise(baseline,r.faces,tag,.04);
  for(const tag of ['suspension.spring','suspension.damper','differentials.front-shaft','differentials.rear-shaft']){
    const base=points(baseline,tag),deltas=points(r.faces,tag).map((p,i)=>p[2]-base[i][2]);
    near(Math.min(...deltas),0,.0006);near(Math.max(...deltas),.04,.0006);
  }
  r.build=stock;r.buildMesh();
  assert.deepEqual(points(r.faces,body[0]),points(baseline,body[0]));
});
test('the optional 992.1 factory lift pitches the rigid body about the rear axle; opening a study keeps bench coordinates',()=>{
  const stock=sanitizeBuild({vehicle:'porsche992scab',roofPosition:'up',parts:['992-aero-kit']});
  const r=render(stock),baseline=r.faces;
  r.build=sanitizeBuild({...stock,lift:{mode:'992-front-axle'}});r.buildMesh();
  grounded(r,stock.vehicle,baseline);
  // Compare every attached bumper and fender vertex to the same rigid rotation around the rear axle.
  const angle=Math.asin(.04/2.45);
  for(const tag of ['shell.fenders','roof.fabric','shell.bumpers']){
    const ground=points(baseline,tag),now=points(r.faces,tag);
    for(let i=0;i<ground.length;i++){
      const [x,y,z]=ground[i],dx=x-1.25,dz=z-.358;
      near(now[i][0],1.25+Math.cos(angle)*dx+Math.sin(angle)*dz);
      near(now[i][1],y);near(now[i][2],.358-Math.sin(angle)*dx+Math.cos(angle)*dz);
    }
  }
  const detailView={id:'suspension-bench',groups:[],draw(renderer){renderer.tag('sample.shell',()=>renderer.box(0,0,0,1,1,1,'#505050'));}};
  r.inspection={detailView};r.buildMesh();
  const raisedBench=points(r.meshCache.faces,'sample.shell');
  r.build=stock;r.buildMesh();assert.deepEqual(points(r.meshCache.faces,'sample.shell'),raisedBench);
});
