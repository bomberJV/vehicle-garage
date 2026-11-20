import assert from 'node:assert/strict';
import {test} from 'node:test';
import {additionalRequestSections} from '../garage/priority-backlog.js';
import {gearboxOutput,g500AtfPan} from '../garage/g500-propeller-shafts.js';
import {worldTriangles,meshSeparation,crossedParts,mm} from './mesh-proximity.mjs';
import {survey,record,baseline,posed,poses,reach,anchor} from './g500-attachment-survey.mjs';

const rows=additionalRequestSections.flatMap(s=>s.items),row=id=>rows.find(item=>item.id===id);
const part=(faces,id)=>worldTriangles(faces,f=>f.part===id);
const fluid=key=>'transmission-fluid.'+key;
const at=(gap,mode)=>Array.isArray(gap)?gap[poses.indexOf(mode)]:gap;

// The pan, its gasket and the hydraulic unit hung 166.6 mm under the case before
// the case had a pan rail. Each joint now leaves the 1 mm line of a mating face.
test('the transmission pan, its gasket and the hydraulic unit hang on the 722.6 case at either depicted pose',()=>{
  assert.deepEqual(poses,['stock','g500-orc-40']);
  const joints=[['pan-seal',1],['conductor-plate',1],['left-line',1],['right-line',1],['pan',7],['valve-body',7.2]];
  // The front propeller shaft passes the right of the housing. Its axle end stays down when the body is lifted.
  const shaftGaps=[['drivetrain.gearbox',8.5],[fluid('pan'),[33.1,22.8]],[fluid('pan-seal'),[31.4,21.8]],[fluid('conductor-plate'),[18.8,20]],[fluid('right-line'),[25.2,38.8]]];
  for(const mode of poses){
    const {faces,list,main}=posed(mode),box=part(faces,'drivetrain.gearbox'),shaft=part(faces,'differentials.front-shaft');
    assert(box.length&&shaft.length,'the installed gearbox and front propeller shaft must be present');
    for(const [key,gap] of joints){
      const other=part(faces,fluid(key));
      assert(other.length,`missing installed ${fluid(key)}`);
      const s=meshSeparation(box,other);
      assert.equal(s.crossings,0,`${mode}: ${fluid(key)} crosses the case`);
      assert.equal(mm(s.d),gap,`${mode}: ${fluid(key)} is ${mm(s.d)} mm from the case`);
    }
    for(const [id,gap] of shaftGaps){
      const s=meshSeparation(shaft,part(faces,id));
      assert.equal(s.crossings,0,`${mode}: the front propeller shaft crosses ${id}`);
      assert.equal(mm(s.d),at(gap,mode),`${mode}: the front propeller shaft is ${mm(s.d)} mm from ${id}`);
    }
    // The transmission plug is still the only other part that enters the case.
    assert.deepEqual(crossedParts(faces,box,'drivetrain.gearbox'),['electrical.chassis-control-harness']);
    const pan=faces.filter(f=>f.part===fluid('pan')).flatMap(f=>f.points);
    assert(Math.max(...pan.map(p=>p[0]))<gearboxOutput[0],`${mode}: the pan ends ahead of the output flange`);
    assert(Math.min(...pan.map(p=>p[0]))>Math.min(...box.flatMap(t=>t.t).map(p=>p[0])),`${mode}: the pan starts behind the bellhousing flange`);
    assert(list[main].includes(anchor));
    for(const id of ['drivetrain.gearbox',...['pan','pan-seal','filter','valve-body','conductor-plate'].map(fluid)])
      assert(list[main].includes(id),`${mode}: ${id} is not joined to the rest of the vehicle`);
  }
  assert.equal(g500AtfPan[1],-.030);
  const seated=row('g500-atf-pan-seat');
  assert.equal(seated.status,'shipped');
  for(const figure of ['166.6 mm','62 mm','1.0 mm','30 mm','8.5 mm'])assert(seated.description.includes(figure),`the board states ${figure}`);
});

const found=survey(),seen=record(found),kept=baseline();

test('every group of installed G500 parts that hangs clear of the rest is in the reviewed baseline, with the same gap',()=>{
  const added=Object.keys(seen).filter(k=>!(k in kept)),gone=Object.keys(kept).filter(k=>!(k in seen));
  const moved=Object.keys(seen).filter(k=>k in kept&&kept[k]!==seen[k]).map(k=>`${k}: ${kept[k]} → ${seen[k]}`);
  const fix=' Review them, then run node tests/g500-attachment-survey.mjs --write.';
  assert.deepEqual(added,[],`${added.length} new unattached groups.`+fix);
  assert.deepEqual(gone,[],`${gone.length} groups are now attached.`+fix);
  assert.deepEqual(moved,[],`${moved.length} groups changed their gap.`+fix);
});

test('the board states the number of unattached groups and the widest gaps',()=>{
  assert.equal(reach,.005);
  assert.equal(found.length,37);
  assert.deepEqual(found.slice(0,3).map(e=>[e.members.join(' + '),seen[e.members.join(' + ')]]),[
    ['cooling.heater-pump','45.1 mm from body.fender-liner-right'],['body.gps-antenna','35.1 mm from lighting.housing'],['hvac.drier','33.7 mm from intake.intake-duct']]);
  // The compressor is within reach of the front differential at stock height and not of the engine.
  assert.equal(seen['hvac.compressor'],'g500-orc-40: 7.6 mm from differentials.front');
  // The starter seats 1.5 mm from its boss on the bellhousing and is joined to the gearbox.
  assert(!('electrical.starter' in seen));
  const open=row('g500-unattached-parts');
  assert.equal(open.status,'open');
  for(const figure of ['5 mm','37 groups','45.1 mm','35.1 mm','33.7 mm'])assert(open.description.includes(figure),`the survey row states ${figure}`);
});
