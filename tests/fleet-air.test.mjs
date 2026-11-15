import test from 'node:test';
import assert from 'node:assert/strict';
import {airModels} from '../garage/fleet-air.js';
import {getFleetDetail} from '../garage/fleet-detail.js';
import {GarageRenderer} from '../garage/render.js';

function mesh(model,...options) {
  const renderer=Object.create(GarageRenderer.prototype);
  renderer.faces=[];
  renderer.currentPart=null;
  model.draw(renderer,...options);
  return renderer.faces;
}
test('each aircraft exposes only finite, selectable geometry and every named part has faces',()=>{
  assert.equal(airModels.length,11);
  for(const model of airModels){
    const parts=model.groups.flatMap(g=>g.parts);
    const named=new Set(parts.map(p=>p.id));
    assert.equal(named.size,parts.length,model.id);
    assert.ok(parts.every(p=>p.offset.length===3&&p.offset.every(Number.isFinite)),model.id);
    const faces=mesh(model);
    assert.deepEqual(new Set(faces.map(f=>f.part)),named,model.id);
    assert.ok(faces.every(f=>f.points.length>=3&&f.points.every(p=>p.length===3&&p.every(Number.isFinite))),model.id);
    assert.ok(faces.every(f=>/^#[a-f\d]{6}$/i.test(f.color)),model.id);
    assert.ok(faces.length<20000,model.name+' mesh budget');
    const points=faces.flatMap(f=>f.points);
    for(const axis of [0,1,2]){
      const values=points.map(p=>p[axis]);
      assert.ok(Math.max(...values)-Math.min(...values)<5.6,model.id+' normalized bounds');
    }
  }
});
test('symmetric surfaces have matching spans, and fixed wing silhouettes preserve reference proportions',()=>{
  const expected={boeing747:64.44/70.67,gulfstreamg800:103/99.75,cessna172:36.08/27.17,piperj5:35.5/22.5,f16:32.67/49.42,f22:44.5/62.08,f35:35/51.4,b52:185/159.33};
  for(const model of airModels.filter(m=>m.type==='Planes')){
    const points=mesh(model).flatMap(f=>f.points);
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const ratio=(Math.max(...ys)-Math.min(...ys))/(Math.max(...xs)-Math.min(...xs));
    assert.ok(Math.abs(ratio-expected[model.id])<.045,model.name+' span/length = '+ratio);
    assert.ok(Math.abs(Math.max(...ys)+Math.min(...ys))<.001,model.name+' symmetry');
  }
});
test('aircraft retain their individual rotor, engine and empennage layouts',()=>{
  const group=(id,groupId)=>airModels.find(m=>m.id===id).groups.find(g=>g.id===groupId);
  for(const [aircraft,grp,count] of [['uh60','main',4],['mh6','main',6],['ch47','forward',3],['ch47','aft',3]]){
    assert.equal(group(aircraft,grp).parts.filter(p=>p.id.includes('.blade')).length,count);
  }
  assert.equal(group('boeing747','engines').parts.length,4);
  assert.equal(group('gulfstreamg800','engines').parts.length,2);
  assert.equal(group('b52','pods').parts.length,4);
  assert.equal(group('f16','outlets').parts.length,1);
  assert.equal(group('f22','outlets').parts.length,2);
  assert.equal(group('f35','outlets').parts.length,1);
  const chinook=airModels.find(m=>m.id==='ch47');
  const faces=mesh(chinook), heights=id=>faces.filter(f=>f.part.startsWith(id+'.blade')).flatMap(f=>f.points.map(p=>p[2]));
  assert.ok(Math.min(...heights('aft'))>Math.max(...heights('forward'))+.1);
});

function projectedDepth(u,v,triangle) {
  const [a,b,c]=triangle;
  const d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  if(Math.abs(d)<1e-12)return -Infinity;
  const p=((b[1]-c[1])*(u-c[0])+(c[0]-b[0])*(v-c[1]))/d;
  const q=((c[1]-a[1])*(u-c[0])+(a[0]-c[0])*(v-c[1]))/d;
  const t=1-p-q;
  return Math.min(p,q,t)<-1e-9?-Infinity:p*a[2]+q*b[2]+t*c[2];
}
function projectedFaces(faces,angle,elevation) {
  const ca=Math.cos(angle),sa=Math.sin(angle),ce=Math.cos(elevation),se=Math.sin(elevation);
  const project=([x,y,z])=>[x*ca-y*sa,-z*ce+(x*sa+y*ca)*se,(x*sa+y*ca)*ce+z*se];
  return faces.flatMap(face=>{
    const points=face.points.map(project);
    return points.slice(2).map((c,i)=>[points[0],points[i+1],c]);
  });
}
function visibleFraction(shell,unit,angle,elevation){
  const skin=projectedFaces(shell,angle,elevation);
  const glass=projectedFaces(unit,angle,elevation);
  let visibleArea=0,totalArea=0;
  for(const triangle of glass){
    const [a,b,c]=triangle, area=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));
    const [x,y,depth]=a.map((_,i)=>(a[i]+b[i]+c[i])/3);
    if(!skin.some(other=>projectedDepth(x,y,other)>depth+1e-5))visibleArea+=area;
    totalArea+=area;
  }
  return visibleArea/totalArea;
}


test('recessed aircraft panes have clear openings viewed from the outside',()=>{
  // Trace the glazing surface itself. A tangential ray through the metal rebate
  // is expected to meet that frame near a corner of an intentionally recessed pane.
  for(const model of airModels){
    const faces=mesh(model),shell=faces.filter(f=>f.part.endsWith('.shell'));
    const panes=faces.filter(f=>f.opacity<1);
    assert(panes.length>0,model.id+' transparent glazing');
    if(panes[0].part==='airframe.canopy')continue;
    const instances=new Set(panes.map(f=>f.instance));
    assert(!instances.has(undefined),model.id+' move a single window');
    for(const name of instances){
      const angle=name.startsWith('Port')?Math.PI:0;
      const unit=panes.filter(f=>f.instance===name);
      const fraction=visibleFraction(shell,unit,angle,.10);
      assert(fraction>.95,model.id+' '+name+' visible projected glazing area '+fraction);
    }
  }
});

test('747 six-pane flight deck, Gulfstream ovals and Skyhawk rear window keep their individual identities',()=>{
  const instances=(id,part)=>new Set(mesh(airModels.find(m=>m.id===id))
    .filter(f=>f.part===part && f.opacity<1).map(f=>f.instance));
  assert.equal(instances('boeing747','fuselage.cockpit').size,6);
  assert.equal(instances('gulfstreamg800','fuselage.windows').size,16);
  const lights=instances('cessna172','cabin.glazing');
  assert.deepEqual(lights,new Set(['Wraparound windshield','Rear windshield','Port door window','Starboard door window','Port cabin window','Starboard cabin window']));
  const faces=mesh(airModels.find(m=>m.id==='boeing747'));
  for(const side of ['Port','Starboard']){
    const windshield=faces.filter(f=>f.opacity<1&&f.instance===side+' windshield');
    const gap=Math.min(...windshield.flatMap(f=>f.points.map(point=>Math.abs(point[1]))));
    assert(gap<.012,'747 windshield approaches the nose center post');
  }
});

test('747 forward sill descends away from the post and the isolated pane matches the museum envelope',()=>{
  const model=airModels.find(m=>m.id==='boeing747');
  const glass=mesh(model).filter(f=>f.opacity<1&&f.instance==='Starboard windshield').flatMap(f=>f.points);
  const sill=(lo,hi)=>Math.min(...glass.filter(p=>p[1]>=lo&&p[1]<hi).map(p=>p[2]));
  const elevations=[[0,.018],[.025,.05],[.05,.08],[.08,.12],[.12,.16]].map(band=>sill(...band));
  assert(elevations.every((height,i)=>Number.isFinite(height)&&(!i||height<elevations[i-1])));
  const detail=getFleetDetail('boeing747','jumbo_flight_deck.windscreen');
  const outer=mesh(detail).filter(f=>f.part==='747_windshield.outer');
  const rim=outer.filter(f=>(f.opacity??1)===1);
  assert.equal(rim.length,5);
  const points=rim.flatMap(f=>f.points);
  const span=axis=>Math.max(...points.map(p=>p[axis]))-Math.min(...points.map(p=>p[axis]));
  assert(Math.abs(span(0)/span(2)-1540/960)<.001);
  const faces=outer.filter(f=>f.opacity<1);
  const normalDepth=([,y,z])=>y-(z-.60)*.27;
  const center=faces.flatMap(f=>f.points).filter(p=>p[0]===0&&p[2]===.60);
  assert(Math.max(...center.map(normalDepth))>Math.max(...points.map(normalDepth))+.04);
});

function pose(faces,key,instance){
  return faces.filter(f=>f.part===key&&(!instance||f.instance===instance)).flatMap(f=>f.points.flat());
}
function samePose(a,b){
  return a.length>0&&a.length===b.length&&a.every((value,index)=>Math.abs(value-b[index])<1e-8);
}
test('both whole propellers and all six civil jet fans animate independently of their airframes',()=>{
  for(const id of ['cessna172','piperj5','boeing747','gulfstreamg800']){
    const model=airModels.find(m=>m.id===id),motion=model.motion;
    const assembled=mesh(model),phase=.137,moved=mesh(model,null,null,phase,motion.assembly);
    const movingOnly=mesh({draw:r=>motion.drawMoving(r,null,null,phase)});
    const movingIds=new Set(motion.parts);
    assert.deepEqual(new Set(movingOnly.map(f=>f.part)),movingIds,id);
    for(const part of movingIds)assert.deepEqual(pose(moved,part),pose(movingOnly,part),id+' '+part+' cached pose');
    for(const part of new Set(assembled.map(f=>f.part))){
      if(!movingIds.has(part))assert.deepEqual(pose(assembled,part),pose(moved,part),id+' '+part+' remains fixed');
      else if(part!=='propeller.hub')assert(!samePose(pose(assembled,part),pose(moved,part)),id+' '+part+' turns');
    }
  }
});
test('light aircraft cowls reach four-cylinder mechanics, integral blades and the correct hub hardware',()=>{
  for(const [id,slug,prop,wood] of [['cessna172','io360','172s_propeller',false],['piperj5','a75','j5_propeller',true]]){
    const engine=getFleetDetail(id,'engine.cowling'),hub=getFleetDetail(id,slug+'.propeller');
    assert.equal(engine.id,slug);
    assert.equal(hub,getFleetDetail(id,'propeller.blade2'));
    const initial=mesh(engine),moving=mesh(engine,.25);
    assert.equal(new Set(initial.filter(f=>f.part===slug+'.pistons').map(f=>f.instance)).size,4);
    for(const key of ['crank','rods','pistons','propeller'])assert(!samePose(pose(initial,slug+'.'+key),pose(moving,slug+'.'+key)),id+' '+key);
    assert(samePose(pose(initial,slug+'.barrels'),pose(moving,slug+'.barrels')));
    const start=mesh(hub),next=mesh(hub,.25),end=mesh(hub,1);
    for(const key of ['blade-1','blade-2','flange','fasteners']){
      const part=prop+'.'+key;
      assert(!samePose(pose(start,part),pose(next,part)),part+' turns');
      assert(samePose(pose(start,part),pose(end,part)),part+' closes one revolution');
    }
    assert.equal(start.some(f=>f.part===prop+'.spinner'),!wood);
    assert(getFleetDetail(id,'cabin.glazing'));
  }
});
test('two-spool jet models connect to individual fan blades and keep cases and combustors stationary',()=>{
  for(const [id,slug,part,hp,lp] of [['boeing747','cf6_80c2','engines.port-inboard','Fourteen','Five'],['gulfstreamg800','pearl_700','engines.starboard','Ten','Four']]){
    const engine=getFleetDetail(id,part),fan=getFleetDetail(id,slug+'.fan');
    assert(engine.animated&&fan.animated);
    assert(engine.componentIndex.get(slug+'.hp-compressor').name.startsWith(hp));
    assert(engine.componentIndex.get(slug+'.lp-turbine').name.startsWith(lp));
    const start=mesh(engine),half=mesh(engine,.5),quarter=mesh(engine,.25);
    for(const key of ['nacelle','case','burner','exhaust'])assert(samePose(pose(start,slug+'.'+key),pose(half,slug+'.'+key)),slug+' '+key);
    for(const key of ['hp-shaft','hp-compressor','hp-turbine']){
      assert(!samePose(pose(start,slug+'.'+key),pose(quarter,slug+'.'+key)));
      assert(samePose(pose(start,slug+'.'+key),pose(half,slug+'.'+key)),slug+' faster spool');
    }
    for(const key of ['fan','lp-shaft','lp-turbine'])assert(!samePose(pose(start,slug+'.'+key),pose(half,slug+'.'+key)),slug+' slower spool');
    const fanStart=mesh(fan),fanNext=mesh(fan,.25),group=fan.groups[0].id;
    const blades=new Set(fanStart.filter(f=>f.part===group+'.blades').map(f=>f.instance));
    assert.equal(blades.size,22);
    assert(!samePose(pose(fanStart,group+'.blades','Fan blade 1'),pose(fanNext,group+'.blades','Fan blade 1')));
    assert(samePose(pose(fanStart,group+'.case'),pose(fanNext,group+'.case')));
    assert(getFleetDetail(id,'fuselage.cockpit'));
  }
});
