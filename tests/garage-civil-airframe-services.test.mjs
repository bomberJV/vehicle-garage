import assert from 'node:assert/strict';
import test from 'node:test';
import {FLEET} from '../garage/fleet.js';
import {getDetail} from '../garage/detail-catalog.js';
import {GarageRenderer} from '../garage/render.js';
import {planSeparation,intersects} from '../garage/exploded-layout.js';
const routes=[
 ['boeing747',['wings.port'],'jumbo-fuel-bays',8],['boeing747',['gear.port-body'],'jumbo-wheel-brake',5],
 ['gulfstreamg800',['wings.port'],'g800-fuel-supply',8],['gulfstreamg800',['gear.port'],'g800-wheel-brake',5],
 ['piperj5',['wings.starboard'],'cub-tank',4],['piperj5',['gear.port'],'cub-expander-brake',4],
 ['cessna172',['cabin.shell','skyhawk_cabin.panel'],'skyhawk-dc',6]
];
for(const [vehicle,path,expected,count] of routes){
  test(vehicle+' opens '+expected+' through mounted parts with finite, separate meshes',()=>{
    let owner=FLEET[vehicle],view;
    for(const id of path){assert(owner.componentIndex.has(id));view=getDetail(vehicle,id);assert(view);owner=view;}
    assert.equal(view.id,expected);assert.equal(view.componentIndex.size,count);
    const renderer=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
    view.draw(renderer);
    assert.deepEqual(new Set(renderer.faces.map(f=>f.part)),new Set(view.componentIndex.keys()));
    for(const face of renderer.faces)for(const point of face.points)assert(point.every(Number.isFinite));
    const plan=planSeparation(renderer.faces,f=>({key:f.part,movable:true,offset:view.componentIndex.get(f.part).offset}));
    const groups=[...plan.groups.values()];
    for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)assert(!intersects(groups[i].parked,groups[j].parked));
    for(const p of view.componentIndex.values())assert.match(p.source.url,/^https:/);
  });
}
test('systems retain the documented variant and brakes are mounted only on the main gear',()=>{
  assert.equal(getDetail('piperj5','gear.tailwheel'),null);
  assert.equal(getDetail('boeing747','gear.nose'),null);assert.equal(getDetail('gulfstreamg800','gear.nose'),null);
  assert.equal(getDetail('gulfstreamg800','wings.port').componentIndex.size,8);
  assert.equal(getDetail('boeing747','jumbo_flight_deck.instruments').id,'jumbo-ac');
  assert.equal(getDetail('cessna172','gear.port').id,'sky-brake');assert.equal(getDetail('cessna172','wings.port').id,'sky-fuel');
  assert.match(getDetail('piperj5','wings.starboard').description,/5-1384/);
});
