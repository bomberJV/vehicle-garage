import test from 'node:test';
import assert from 'node:assert/strict';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {GarageRenderer} from '../garage/render.js';

// Walk public component routes, including the original parent views, rather than invoking a study by its internal ID.
const routes=[
 ['cessna172','sky-fuel','wings.port'],['cessna172','sky-brake','gear.port'],
 ['boeing747','jumbo-ac','fuselage.cockpit','jumbo_flight_deck.instruments'],
 ['piperj5','cub-carb','engine.cowling','a75.induction'],
 ['gulfstreamg800','g800-avionics','fuselage.cockpit','g800_flight_deck.instruments'],
 ['saturn-v','apollo-power','apollo.service','saturn-sm.body'],
 ['apollo-falcon','lm-power','interior.left-panel'],['apollo-lrv','lrv-power','crew.controls'],
 ['atlas-v-541','mars-power','upper.payload','mars.rover','percy-rover.chassis'],
 ['crew-dragon','dragon-solar','trunk.solar'],
 ['pioneeringspirit','pioneer-bus','propulsion.distribution'],
 ['ooclspain','x92-fuel','propulsion.main-engine','marine-x92.cylinder-1','marine-x92-unit.head'],
 ['araho','araho-electric','house.bridge'],
 ['azzam','azzam-reverse','hull.jets','marine-steerjet.steering'],
 ['octopussy','octopussy-reverse','propulsion.jet-0','marine-steerjet.steering'],
 ['viking90','viking-electrical','bridge.helm','viking_flybridge.console'],
 ['seawisegiant','tanker-burner','propulsion.boiler-1','marine-boiler.burner'],
 ['alvin','alvin-electric','science.cameras'],
 ['alvin','alvin-electric','propulsion.port-battery','marine-battery.cover'],
 ['falcon-9','falcon-payload-ground','upper.air','falcon_fairing_air.ground-duct'],
 ['falcon-heavy','falcon-payload-ground','upper.air','falcon_fairing_air.ground-duct']
];
function follow(vehicle,path){
 let children=getAssemblies(vehicle).flatMap(group=>group.parts),detail;
 for(const id of path){
  assert(children.some(p=>p.id===id),vehicle+' cannot select '+id);
  detail=getDetail(vehicle,id);assert(detail,vehicle+' cannot open '+id);
  children=detail.groups.flatMap(g=>g.parts);
 }
 return detail;
}
test('every civil system is reachable on the named vehicle, with live part links and finite pickable geometry',()=>{
 for(const [vehicle,expected,...path] of routes){
  const detail=follow(vehicle,path);
  assert.equal(detail.id,expected);
  assert(/^https:\/\//.test(detail.source.url));
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  detail.draw(r);
  const parts=detail.componentIndex;
  assert.deepEqual(new Set(r.faces.map(f=>f.part)),new Set(parts.keys()));
  for(const p of parts.values()){
   assert(p.description&&p.source.url.startsWith('https:'));
   for(const link of p.connectsTo||[])assert(parts.has(link),p.id+' links to '+link);
  }
  assert(r.faces.every(f=>f.points.length>=3&&f.points.every(p=>p.length===3&&p.every(Number.isFinite))));
 }
});
test('AAIB and Apollo labels match their source and ground support is scoped to the fairing',()=>{
 const ac=follow('boeing747',['fuselage.cockpit','jumbo_flight_deck.instruments']);
 assert(ac.source.url.endsWith('#page=7'));
 for(let i=0;i<4;i++){
  assert.deepEqual(ac.componentIndex.get('jumbo-ac.idg'+i).connectsTo,['jumbo-ac.gcb'+i]);
  assert.deepEqual(ac.componentIndex.get('jumbo-ac.gcb'+i).connectsTo,['jumbo-ac.bus'+i]);
 }
 const apollo=follow('saturn-v',['apollo.service','saturn-sm.body']);
 assert.match(apollo.componentIndex.get('apollo-power.water').description,/Water produced in the reaction/);
 assert.match(follow('seawisegiant',['propulsion.boiler-1','marine-boiler.burner']).description,/actual burner make and dimensions remain unverified/);
 assert.equal(getDetail('saturn-v','falcon_fairing_air.ground-duct'),null);
});
