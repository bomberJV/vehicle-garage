import assert from 'node:assert/strict';
import test from 'node:test';
import {VEHICLES} from '../garage/catalog.js';
import {FLEET} from '../garage/fleet.js';
import {getDetail} from '../garage/detail-catalog.js';
import {GarageRenderer} from '../garage/render.js';
import {getDrawingCheck} from '../garage/vehicle-drawing-checks.js';
import {getVehicleReferences} from '../garage/reference-ledger.js';

// Exercise geometry emitted by the normal vehicle/detail catalog, including the
// cases where the reference establishes an assembly rather than the full hull.
function geometry(id, detail) {
  const model=detail ? getDetail(id, detail) : FLEET[id];
  assert(model, id+' / '+detail);
  const renderer=Object.assign(Object.create(GarageRenderer.prototype),{faces:[]});
  model.draw(renderer,0);
  const points=new Map();
  for(const face of renderer.faces){
    const short=detail ? face.part.slice(model.id.length+1) : face.part;
    if(!points.has(short)) points.set(short,[]);
    points.get(short).push(...face.points);
  }
  return points;
}

const checks = {
  sl550:['seats.airscarf',['blower','heater','duct','grille','lead']],
  g500:['differentials.center',['spider','bevel-1','bevel-2','bevel-3','bevel-4','front-gear','rear-gear']],
  f350:['body.deck',['handle','latch','supports','hinge']],
  c63:['body.deck',['pressing','hinge','latch']],
  bmw328xi:['body.deck',['pressing','hinge','latch']],
  hrv:['body.door',['hinge','check','frame']],
  bmw325ci:['door-bmw325ci-front-left.regulator',['track','carriage','cable','motor']],
  porsche993cab:['engine.case',['left','right','crankshaft','bearings','nose']],
  porsche992scab:['engine.case',['left','right','crankshaft','bearings']],
  bmws1000rr:['k67-final.rear',['sprocket','carrier','damper','bearing']],
  'little-willie':[null,['hull.cab','hull.roof','tracks.left','tracks.right']],
  'sherman-e8':[null,['tracks.left','tracks.right','hull.upper']],
  boeing747:[null,['wings.port','wings.starboard','engines.port-inboard','engines.port-outboard','engines.starboard-inboard','engines.starboard-outboard']],
  cessna172:[null,['wings.port','wings.starboard','gear.port','gear.starboard','gear.nosewheel']],
  piperj5:['engine.cowling',['barrels','pistons','rods','crank']],
  gulfstreamg800:['fuselage.windows',['floor','port','starboard','windows']],
  f16:[null,['airframe.inlet','tail.fin','airframe.canopy','outlets.center']],
  f22:[null,['tail.port-fin','tail.starboard-fin','airframe.port-inlet','airframe.starboard-inlet','outlets.port','outlets.starboard']],
  f35:[null,['tail.port-fin','tail.starboard-fin','airframe.port-inlet','airframe.starboard-inlet','outlets.center']],
  b52:[null,['pods.port-inner','pods.port-outer','pods.starboard-inner','pods.starboard-outer']],
  uh60:[null,['main.blade1','main.blade2','main.blade3','main.blade4','gear.port','gear.starboard','gear.tailwheel']],
  mh6:[null,['cabin.shell','tail.boom','gear.port','gear.starboard']],
  ch47:[null,['tail.front-pylon','tail.aft-pylon','forward.blade1','forward.blade2','forward.blade3','aft.blade1','aft.blade2','aft.blade3']],
  'saturn-v':[null,['first.barrel','upper.second','upper.third','apollo.adapter','apollo.csm','apollo.tower']],
  'apollo-falcon':[null,['interior.commander','interior.pilot','interior.forward-hatch','interior.docking','cabin.windows']],
  'apollo-lrv':[null,['wheels.wheel1','wheels.wheel2','wheels.wheel3','wheels.wheel4']],
  'atlas-v-541':['mars.rover',['fl','ml','rl','fr','mr','rr']],
  'falcon-9':[null,['core.shell','core.interstage','upper.left','upper.right']],
  'falcon-heavy':[null,['core.shell','port.shell','starboard.shell','port.cap','starboard.cap','upper.left','upper.right']],
  'crew-dragon':[null,['trunk.barrel','trunk.solar','capsule.shell','capsule.nose']],
  pioneeringspirit:[null,['hull.port','hull.starboard','hull.crossdeck','bridge.quarters']],
  seawisegiant:[null,['hull.shell','cargo.catwalk','bridge.quarters','bridge.funnel']],
  ooclspain:['propulsion.main-engine',Array.from({length:12},(_,i)=>'cylinder-'+(i+1))],
  azzam:[null,['decks.main','decks.upper','decks.bridge','decks.sun']],
  octopussy:[null,['propulsion.diesel-port','propulsion.diesel-center','propulsion.diesel-starboard','propulsion.jet-0','propulsion.jet-1','propulsion.jet-2']],
  araho:[null,['house.bridge','fishing.drums','fishing.gantry','fishing.ramp','hull.propeller']],
  viking90:[null,['bridge.saloon','bridge.helm','bridge.tower','fishing.cockpit']],
  alvin:[null,['crew.ports','crew.sphere','science.basket','science.ptarm','science.starm']]
};

const range=(points,axis)=>points.reduce(([min,max],p)=>[Math.min(min,p[axis]),Math.max(max,p[axis])],[Infinity,-Infinity]);
function center(geo,part,axis){
  const [lo,hi]=range(geo.get(part),axis);
  return (lo+hi)/2;
}
function sorted(geo,names,axis){
  const values=names.map(name=>center(geo,name,axis));
  for(let i=1;i<values.length;i++)assert(values[i]>values[i-1],names.join(' / '));
}

test('every vehicle shows a specific reference, variant scope and observable comparison first',()=>{
  assert.deepEqual(Object.keys(checks).sort(),Object.keys(VEHICLES).sort());
  for(const id of Object.keys(VEHICLES)){
    const checked=getDrawingCheck(id),card=getVehicleReferences(id)[0];
    assert(checked.locator.length>12 && checked.result.length>45, id);
    assert.equal(card.url,checked.url,id);
    assert(card.kind.includes(checked.variant),id);
    assert(card.scope.includes(checked.result),id);
  }
});

for(const [id,[detail,parts]] of Object.entries(checks)){
  test(id+' emits the geometry named in its published comparison',()=>{
    const geo=geometry(id,detail);
    for(const name of parts) assert(geo.get(name)?.length>=3,id+' / '+name);
    switch(id){
      case 'f16': assert(center(geo,'airframe.inlet',2)<center(geo,'airframe.canopy',2)); break;
      case 'f22': case 'f35': sorted(geo,['tail.port-fin','tail.starboard-fin'],1); break;
      case 'b52': sorted(geo,['pods.port-outer','pods.port-inner','pods.starboard-inner','pods.starboard-outer'],1); break;
      case 'ch47': sorted(geo,['tail.front-pylon','tail.aft-pylon'],2); break;
      case 'saturn-v': sorted(geo,['first.barrel','upper.second','upper.third','apollo.adapter','apollo.csm','apollo.tower'],2); break;
      case 'falcon-heavy': assert(center(geo,'upper.left',2)>center(geo,'port.cap',2)); break;
      case 'crew-dragon': sorted(geo,['trunk.barrel','capsule.shell','capsule.nose'],2); break;
      case 'pioneeringspirit': assert(center(geo,'bridge.quarters',2)>center(geo,'hull.crossdeck',2)); break;
      case 'seawisegiant': sorted(geo,['cargo.catwalk','bridge.quarters','bridge.funnel'],0); break;
      case 'azzam': {
        sorted(geo,['decks.main','decks.upper','decks.bridge','decks.sun'],2);
        const shell=geo.get('hull.shell');
        const [bow,stern]=range(shell,0), [port,starboard]=range(shell,1);
        assert(Math.abs((starboard-port)/(stern-bow)/(20.8/180)-1)<.002);
        break;
      }
      case 'araho': sorted(geo,['house.bridge','fishing.drums','fishing.gantry'],0); break;
      case 'viking90': sorted(geo,['bridge.saloon','bridge.helm','bridge.tower'],2); break;
    }
  });
}

test('both yacht jets put the intake and pump ahead of the transom nozzle',()=>{
  for(const id of ['azzam','octopussy']){
    const geo=geometry(id,'propulsion.jet-0');
    sorted(geo,['intake','impeller','stator','nozzle'],0);
    assert(geo.has('steering'),id);
    assert(getVehicleReferences(id).some(r=>r.url.includes('kongsberg.com') && r.scope.includes('Related component design')),id);
  }
});
