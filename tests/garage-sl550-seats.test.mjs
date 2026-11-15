import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {drawSLSeats,slSeatGroup,slSeatStudies} from '../garage/sl550-seats.js';

function mesh(draw,build={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build});
  draw(r);
  return r.faces;
}
const active={heat:3,vent:3,airscarf:3,massage:'fast-vigorous'};
const shape=faces=>faces.map(f=>[f.points,f.color]);
test('both SL seats register the same climate, pneumatic and adjustment components in the installed model and opened seat',()=>{
  const installed=mesh(drawSLSeats);
  assert.deepEqual(new Set(installed.map(f=>f.part)),new Set(slSeatGroup.parts.map(p=>p.id)));
  for(const [role,y] of [['driver',-.39],['passenger',.39]]){
    const seat=slSeatStudies['seats.'+role];
    const local=mesh(r=>seat.draw(r));
    for(const key of ['heating','ventilation','airscarf','massage','adjustment']){
      const nested=seat.id+'.'+key;
      assert.equal(slSeatStudies['seats.'+key],slSeatStudies[nested]);
      const whole=installed.filter(f=>f.part==='seats.'+key&&f.instance===role);
      const opened=local.filter(f=>f.part===nested);
      assert.equal(whole.length,opened.length,key);
      for(let i=0;i<whole.length;i++){
        assert.deepEqual(whole[i].points,opened[i].points.map(([x,v,z])=>[x,v+y,z]));
      }
    }
  }
});
test('comfort controls act on the chosen seat and keep the leather and mechanical rails intact',()=>{
  const parked=mesh(drawSLSeats),working=mesh(drawSLSeats,{slComfort:{driver:active}});
  for(const key of ['massage','ventilation','heating','airscarf']){
    const select=(faces,role)=>shape(faces.filter(f=>f.part==='seats.'+key&&f.instance===role));
    assert.notDeepEqual(select(parked,'driver'),select(working,'driver'),key);
    assert.deepEqual(select(parked,'passenger'),select(working,'passenger'),key);
  }
  const fixed=faces=>shape(faces.filter(f=>['seats.driver','seats.adjustment'].includes(f.part)));
  assert.deepEqual(fixed(parked),fixed(working));
});
test('the airflow, pneumatic massage and carriage studies animate their working parts with fixed supports',()=>{
  for(const [key,moving,fixed] of [['airscarf','blower','duct'],['ventilation','fans','layer'],['massage','insert','valve'],['adjustment','carriage','rails']]){
    const detail=slSeatStudies['seats.'+key];
    const initial=mesh(r=>detail.draw(r,0)),frame=mesh(r=>detail.draw(r,.24));
    const part=(faces,name)=>shape(faces.filter(f=>f.part===detail.id+'.'+name));
    assert(detail.animated);
    assert.notDeepEqual(part(initial,moving),part(frame,moving));
    assert.deepEqual(part(initial,fixed),part(frame,fixed));
  }
});
test('the massage cutaway plays the selected occupant’s program',()=>{
  const detail=slSeatStudies['seats.massage'];
  const build={slComfort:{driver:{massage:'fast-vigorous'},passenger:{massage:'slow-gentle'}}};
  function frame(which){
    return mesh(r=>{r.inspection={studySeat:which};detail.draw(r,.19);},build);
  }
  const driver=frame('driver'),passenger=frame('passenger');
  const insert=detail.id+'.insert';
  assert.notDeepEqual(shape(driver.filter(f=>f.part===insert)),shape(passenger.filter(f=>f.part===insert)));
  assert.deepEqual(shape(driver.filter(f=>f.part!==insert)),shape(passenger.filter(f=>f.part!==insert)));
});

test('a single front-left trunk pump and reservoir feed both seat valves',()=>{
  const f=mesh(drawSLSeats),installed=f.filter(f=>f.part==='seats.supply'),detail=slSeatStudies['seats.supply'];
  const supply=mesh(r=>detail.draw(r));
  assert.deepEqual(shape(installed),shape(supply));
  const p=supply.filter(f=>f.part==='sl-seat-supply.pump').flatMap(f=>f.points);
  assert(p.every(([x,y])=>x>1&&y<-.40));
  const runs=supply.filter(f=>f.part==='sl-seat-supply.lines').flatMap(f=>f.points);
  for(const side of [-.39,.39])assert(runs.some(([x,y,z])=>Math.hypot(x-.548,y-side-.102,z-.563)<.005));
  for(const role of ['driver','passenger']){
    const s=slSeatStudies['seats.'+role];
    assert(s.groups.every(g=>g.parts.every(p=>!p.id.endsWith('.supply'))));
  }
});
test('the removable back panel covers the AIRSCARF blower and both upper frame rails from behind',()=>{
  const view=slSeatStudies['seats.driver'];
  const faces=mesh(r=>view.draw(r));
  const cover=faces.filter(f=>f.part===view.id+'.rear-cover');
  const hardware=faces.filter(f=>[view.id+'.airscarf',view.id+'.frame'].includes(f.part));
  // Cast along +X through the blower hub, both shell edges and the upper
  // ends of the rails. The farthest surface must belong to the cover.
  function backX(list,y,z){
    let maximum=-Infinity;
    for(const f of list)for(let i=1;i<f.points.length-1;i++){
      const [a,b,c]=[f.points[0],f.points[i],f.points[i+1]];
      const dy=b[1]-a[1],dz=b[2]-a[2],ey=c[1]-a[1],ez=c[2]-a[2],cross=dy*ez-dz*ey;
      if(Math.abs(cross)<1e-11)continue;
      const s=((y-a[1])*ez-(z-a[2])*ey)/cross,t=(dy*(z-a[2])-dz*(y-a[1]))/cross;
      if(s>=-1e-8&&t>=-1e-8&&s+t<=1+1e-8)maximum=Math.max(maximum,a[0]+s*(b[0]-a[0])+t*(c[0]-a[0]));
    }
    return maximum;
  }
  for(const [y,z] of [[0,.881],[-.035,.887],[.035,.887],[-.157,.956],[.157,.956]]){
    const inside=backX(hardware,y,z),outside=backX(cover,y,z);
    assert(Number.isFinite(inside));
    assert(outside>inside+.002);
  }
});
