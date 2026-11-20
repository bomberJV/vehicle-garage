import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift,liftOptions} from '../garage/lift-options.js';
import {m113RearFace} from '../garage/g500-m113-geometry.js';
import {additionalRequestSections} from '../garage/priority-backlog.js';
import {worldTriangles,meshSeparation,crossedParts,mm} from './mesh-proximity.mjs';

function posed(mode){
  const renderer=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver',lift:normalizedLift('g500',{mode})},inspection:{},isolate:false,
    progress:0,lights:true,schematic:true,partPositions:new Map()
  });
  renderer.buildMesh();
  return renderer.faces;
}
const poses=liftOptions('g500').map(o=>o.id);
const meshes=new Map(poses.map(mode=>[mode,posed(mode)]));
const lift=mode=>mode==='stock'?0:.040;
// The mount set: rubber mounts, the rail brackets and both support arms.
const mountSet=new Set(['powertrain.engine-mounts','powertrain.mount-lower-brackets','powertrain.engine-support-left','powertrain.engine-support-right']);
const matches=(f,id)=>id==='powertrain.engine-mounts'?mountSet.has(f.part):f.part===id;
const part=(faces,id)=>worldTriangles(faces,f=>matches(f,id));
const backlog=additionalRequestSections.flatMap(s=>s.items).find(item=>item.id==='g500-engine-bay-overlaps');
// The crossmember behind the oil pan, without the rails it joins.
const crossmember=faces=>worldTriangles(faces,f=>f.part==='suspension.frame'&&f.points.every(p=>p[0]>-.98&&p[0]<-.90));
// The starter and charging cables ahead of the bulkhead.
const bayCables=faces=>worldTriangles(faces,f=>f.part==='electrical.primary-power'&&f.points.every(p=>p[0]<-.76));

function clearances(mode,a,list){
  for(const [id,gap] of list){
    const faces=meshes.get(mode),other=part(faces,id);
    assert(other.length,`missing installed ${id}`);
    const s=meshSeparation(a(faces),other);
    assert.equal(s.crossings,0,`${mode}: crosses ${id}`);
    assert.equal(mm(s.d),Array.isArray(gap)?gap[poses.indexOf(mode)]:gap,`${mode}: ${mm(s.d)} mm from ${id}`);
  }
}

test('the G500 gearbox clears the floor, the bulkhead, the frame and the console at either depicted pose',()=>{
  assert.deepEqual(poses,['stock','g500-orc-40']);
  const gaps=[['floor.pan',8.0],['floor.underlay',35.2],['floor.carpet',34.6],['body.structure',32.1],['suspension.frame',35.0],
    ['body.center-console',131.3],['electrical.starter',1.5],['electrical.primary-power',85.0],['evap.purge-line',125.1]];
  for(const mode of poses){
    clearances(mode,faces=>part(faces,'drivetrain.gearbox'),gaps);
    // The transmission plug is the only other part that enters the case.
    assert.deepEqual(crossedParts(meshes.get(mode),part(meshes.get(mode),'drivetrain.gearbox'),'drivetrain.gearbox'),['electrical.chassis-control-harness']);
  }
  for(const gap of [8.0,32.1,35.0])assert(backlog.description.includes(gap.toFixed(1)+' mm'),`the board states ${gap} mm`);
});

test('the floor tunnel covers the bellhousing and keeps its ordinary width behind the kick-up',()=>{
  for(const mode of poses){
    const faces=meshes.get(mode),pan=faces.filter(f=>f.part==='floor.pan').flatMap(f=>f.points),rise=lift(mode);
    // Rows of the pressing at the main case, at the end of the kick-up and under the seats.
    const half=x=>{
      const row=pan.filter(p=>Math.abs(p[0]-x)<.004),flat=Math.min(...row.map(p=>p[2]));
      assert(row.length>10&&flat>.59+rise,`${mode}: missing floor row at ${x}`);
      // The sills also rise, so only the middle of the row counts.
      return Math.max(...row.filter(p=>Math.abs(p[1])<.40&&p[2]>flat+.020).map(p=>Math.abs(p[1])));
    };
    assert(half(-.573)>.170&&half(-.573)<.200,`${mode}: the tunnel is ${mm(half(-.573))} mm to a side over the main case`);
    for(const x of [-.467,-.126])assert(half(x)<.160,`${mode}: the tunnel is ${mm(half(x))} mm to a side at ${x}`);
  }
});

test('the G500 engine mounts stand on the frame rails, clear of the front axle and its propeller shaft',()=>{
  for(const mode of poses){
    const faces=meshes.get(mode),mounts=faces.filter(f=>mountSet.has(f.part)).flatMap(f=>f.points),rise=lift(mode);
    // The brackets sit within the depth of the rails and stop 1 mm short of their inner faces.
    assert(Math.abs(Math.max(...mounts.map(p=>Math.abs(p[1])))-.454)<1e-9);
    assert(Math.min(...mounts.map(p=>p[2]))>.555+rise,`${mode}: the mounts hang ${mm(.555+rise-Math.min(...mounts.map(p=>p[2])))} mm below the rail`);
    clearances(mode,f=>part(f,'powertrain.engine-mounts'),[['differentials.front',[95.0,120.3]],['differentials.front-shaft',[156.7,187.6]],
      ['suspension.frame',1.0],['electrical.primary-power',27.7],['electrical.starter',101.1]]);
    // Only the arms enter another part: they bolt to the block.
    const crossed=crossedParts(faces.filter(f=>!mountSet.has(f.part)||f.part==='powertrain.engine-mounts'),part(faces,'powertrain.engine-mounts'),'powertrain.engine-mounts');
    assert.deepEqual(crossed,['powertrain.block']);
  }
  assert(backlog.description.includes('95.0 mm'));
});

test('the second frame crossmember passes behind the oil pan without touching the driveline',()=>{
  for(const mode of poses){
    const faces=meshes.get(mode),tube=crossmember(faces);
    assert.equal(tube.length,24);
    clearances(mode,crossmember,[['drivetrain.gearbox',35.0],['differentials.front-shaft',[45.8,77.0]],['powertrain.sump',20.1],
      ['electrical.starter',12.2],['transmission-fluid.left-line',53.2],['transmission-fluid.right-line',41.0],['evap.purge-line',18.5]]);
    assert.deepEqual(crossedParts(faces,tube,'suspension.frame'),[]);
  }
});

test('the starter lies along the block ahead of the bellhousing and its cables stay out of the driveline',()=>{
  for(const mode of poses){
    const faces=meshes.get(mode),starter=faces.filter(f=>f.part==='electrical.starter').flatMap(f=>f.points);
    assert(Math.max(...starter.map(p=>p[0]))<m113RearFace,`${mode}: the starter ends ahead of the engine/transmission joint`);
    clearances(mode,f=>part(f,'electrical.starter'),[['powertrain.sump',24.3],['powertrain.block',26.8],['body.structure',127.5],['floor.pan',54.1],
      ['differentials.front-shaft',[129.5,155.4]]]);
    assert.deepEqual(crossedParts(faces,part(faces,'electrical.starter'),'electrical.starter'),['electrical.primary-power']);
    // Ahead of the bulkhead the cables meet only their three terminals.
    const cables=bayCables(faces);
    assert.equal(cables.length,192);
    assert.deepEqual(crossedParts(faces,cables,'electrical.primary-power'),['electrical.alternator','electrical.starter','powertrain.battery']);
    clearances(mode,bayCables,[['drivetrain.gearbox',85.0],['powertrain.sump',27.7],['evap.purge-line',11.5],['powertrain.fuel-rail',9.5],
      ['powertrain.head',11.3],['powertrain.oil-dipstick',13.6],['floor.carpet',16.2]]);
  }
  assert(backlog.description.includes('85.0 mm'));
});

test('the vapor purge line crosses the bulkhead above the bellhousing instead of through the gearbox',()=>{
  for(const mode of poses){
    const faces=meshes.get(mode);
    const run=worldTriangles(faces,f=>f.part==='evap.purge-line'&&f.points.every(p=>p[0]<-.40&&p[0]>-.87));
    assert.equal(run.length,84);
    assert.deepEqual(crossedParts(faces,run,'evap.purge-line'),[]);
  }
});
