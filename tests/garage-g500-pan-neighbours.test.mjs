import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift,liftOptions} from '../garage/lift-options.js';
import {m113CrankZ,m113PanRail,m113PanOutline,m113InstalledX,m113RearFace} from '../garage/g500-m113-geometry.js';
import {additionalRequestSections} from '../garage/priority-backlog.js';
import {worldTriangles,meshSeparation,mm} from './mesh-proximity.mjs';

function posed(mode,inspection={}){
  const renderer=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'g500',parts:[],paint:'olive',finish:'silver',lift:normalizedLift('g500',{mode})},inspection,isolate:false,
    progress:0,lights:true,schematic:true,partPositions:new Map()
  });
  renderer.buildMesh();
  return renderer;
}
const poses=liftOptions('g500').map(o=>o.id);
const lift=mode=>mode==='stock'?0:.040;
const part=(faces,id)=>worldTriangles(faces,f=>f.part===id);
const points=(faces,id)=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
const backlog=additionalRequestSections.flatMap(s=>s.items).find(item=>item.id==='g500-pan-neighbour-overlaps');

// The pump, the cables, the bellhousing and the mount arms all crossed the pan
// before they were rebuilt. Each must now clear its skin at both ride heights.
const neighbours=[['powertrain.oil-pump',12.7],['powertrain.oil-pickup',11.0],['electrical.primary-power',27.7],
  ['drivetrain.gearbox',5.4],['powertrain.engine-mounts',17.8]];

test('no pump, pickup, cable, bellhousing or mount triangle crosses or touches the G500 oil pan at either depicted pose',()=>{
  assert.deepEqual(poses,['stock','g500-orc-40']);
  for(const mode of poses){
    const {faces}=posed(mode),pan=part(faces,'powertrain.sump');
    assert(pan.length,'the installed pan must be present');
    for(const [id,clearance] of neighbours){
      const other=part(faces,id);
      assert(other.length,`missing installed ${id}`);
      const s=meshSeparation(pan,other);
      assert.equal(s.crossings,0,`${mode}: ${id} crosses the pan`);
      // These parts ride with the engine or the body, so the kit leaves each gap unchanged.
      assert.equal(mm(s.d),clearance,`${mode}: ${id} is ${mm(s.d)} mm from the pan`);
    }
  }
  for(const [id,clearance] of neighbours)if(id!=='powertrain.oil-pickup')
    assert(backlog.description.includes(clearance.toFixed(1)+' mm'),`the board states ${clearance} mm for ${id}`);
});

test('the G500 oil pump hangs inside the forward bowl, below the crankshaft and above the bowl floor',()=>{
  for(const mode of poses){
    const {faces}=posed(mode),rise=lift(mode);
    const pump=points(faces,'powertrain.oil-pump'),pan=points(faces,'powertrain.sump');
    const floor=Math.min(...pan.map(p=>p[2])),rail=m113CrankZ+m113PanRail+rise;
    assert(Math.abs(Math.max(...pan.map(p=>p[2]))-rail)<1e-9);
    const x=m113PanOutline.map(p=>p[0]+m113InstalledX),y=m113PanOutline.map(p=>p[1]);
    for(const p of pump){
      assert(p[0]>Math.min(...x)&&p[0]<Math.max(...x)&&p[1]>Math.min(...y)&&p[1]<Math.max(...y),`${mode}: the pump stays inside the pan outline`);
      assert(p[2]>floor+.010,`${mode}: the pump is ${mm(p[2]-floor)} mm above the lowest pan surface`);
    }
    // The housing is below the sealing rail; only the drive reaches the crank axis.
    const low=Math.min(...pump.map(p=>p[2])),high=Math.max(...pump.map(p=>p[2]));
    assert(low<rail-.060&&high>m113CrankZ+rise&&high<m113CrankZ+rise+.030);
    for(const id of ['powertrain.crankshaft','powertrain.main-bearings','powertrain.connecting-rods','powertrain.timing-drive','powertrain.block']){
      const s=meshSeparation(part(faces,'powertrain.oil-pump'),part(faces,id));
      assert.equal(s.crossings,0,`${mode}: the pump crosses ${id}`);
      assert(s.d>.010,`${mode}: the pump is ${mm(s.d)} mm from ${id}`);
    }
    // The suction pipe meets the pump's rear face without entering it.
    const joint=meshSeparation(part(faces,'powertrain.oil-pump'),part(faces,'powertrain.oil-pickup'));
    assert.equal(joint.crossings,0);assert.equal(mm(joint.d),1);
  }
});

test('the engine-lubrication assembly owns the same pump and pickup surfaces',()=>{
  for(const mode of poses){
    const installed=posed(mode).faces,oil=posed(mode,{assembly:'engine-oil'}).faces;
    for(const key of ['oil-pump','oil-pickup','sump']){
      const shown=oil.filter(f=>f.part==='engine-oil.'+key).map(f=>f.points);
      assert(shown.length,key);
      assert.deepEqual(shown,installed.filter(f=>f.part==='powertrain.'+key).map(f=>f.points));
      assert.equal(oil.filter(f=>f.part==='powertrain.'+key).length,0);
    }
  }
});

test('the G500 bellhousing flange meets the rear face of the block without entering the block or the pan',()=>{
  assert(Math.abs(m113RearFace-(m113InstalledX+.359))<1e-12);
  for(const mode of poses){
    const {faces}=posed(mode),gearbox=points(faces,'drivetrain.gearbox');
    assert(Math.abs(Math.min(...gearbox.map(p=>p[0]))-(m113RearFace+.001))<1e-9,'the flange face stands 1 mm off the block');
    const s=meshSeparation(part(faces,'drivetrain.gearbox'),part(faces,'powertrain.block'));
    assert.equal(s.crossings,0,`${mode}: the bellhousing crosses the block`);
    assert.equal(mm(s.d),1);
  }
});

test('the G500 mount arms start on the block wall above the pan rail and the dipstick tube only meets the pan at its seat',()=>{
  for(const mode of poses){
    const {faces}=posed(mode),rail=m113CrankZ+m113PanRail+lift(mode);
    const pan=part(faces,'powertrain.sump');
    // Each arm reaches the block, so it must cross the block wall, and only above the rail.
    const arms=meshSeparation(part(faces,'powertrain.block'),part(faces,'powertrain.engine-mounts'));
    assert(arms.crossings>0,'the arms must reach the block');
    for(const p of arms.crossingPoints)assert(p[2]>rail+.001,`${mode}: a mount arm meets the block ${mm(p[2]-rail)} mm from the rail`);
    // The guide tube is seated in the upper pan just below the rail on the right side.
    const seat=meshSeparation(pan,part(faces,'powertrain.oil-dipstick'));
    assert(seat.crossings>0,'the guide tube must reach the pan');
    for(const p of seat.crossingPoints){
      assert(p[2]>rail-.016&&p[2]<=rail+1e-9,`${mode}: the tube enters ${mm(rail-p[2])} mm below the rail`);
      assert(p[1]>.180,'the tube enters on the right side');
    }
  }
});
