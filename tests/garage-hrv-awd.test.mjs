import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GarageRenderer} from '../garage/render.js';
import {getAssembly,getComponent} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {getRoadDrivetrain} from '../garage/road-mechanisms.js';
import {getRoadServiceAssemblies} from '../garage/road-service-systems.js';
import {VEHICLES,PARTS} from '../garage/catalog.js';
import {intersects,displaced} from '../garage/exploded-layout.js';
import {offsetAt,planTravel} from '../garage/explosion-travel.js';
import {voiceKey} from '../shared/narration-voice.js';

const awd=['transfer','propshaft','center-support','rear-coupling','rear-differential','rear-halfshafts'].map(k=>'drivetrain.'+k);
const studies={'drivetrain.transfer':'hrv-transfer','drivetrain.propshaft':'hrv-propshaft','drivetrain.center-support':'hrv-propshaft',
  'drivetrain.rear-coupling':'hrv-coupling','drivetrain.rear-differential':'diff','drivetrain.rear-halfshafts':'shaft'};
const specs='https://hondanews.com/en-US/releases/release-6f8b202ddb1c7f26ecd92774bb014b0c-2026-honda-hr-v-specifications-and-features';

function renderer(inspection={},options={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{
    build:{vehicle:'hrv',paint:'olive',finish:'silver',parts:[]},inspection:{},progress:0,partPositions:new Map(),
    reducedMotion:{matches:true},angle:0,elevation:0,pixelScale:100,project:p=>p,lights:true,faces:[],schematic:true,...options
  });
  r.draw=()=>r.buildMesh();r.setInspection(inspection);return r;
}

// Exact triangle-triangle test: two triangles intersect when an edge of one
// crosses the other. Bounding boxes reject distant pairs first.
const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function edgeCrosses(p,q,[a,b,c]){
  const e1=sub(b,a),e2=sub(c,a),d=sub(q,p),h=cross(d,e2),det=dot(e1,h);
  if(Math.abs(det)<1e-14)return false;
  const s=sub(p,a),u=dot(s,h)/det;if(u<0||u>1)return false;
  const k=cross(s,e1),v=dot(d,k)/det;if(v<0||u+v>1)return false;
  const t=dot(e2,k)/det;return t>=0&&t<=1;
}
function triangles(faces){
  const out=[];
  for(const f of faces)for(let i=0;i<f.triangles.length;i+=3){
    const tri=[0,1,2].map(j=>f.points[f.triangles[i+j]]);
    out.push({tri,min:[0,1,2].map(k=>Math.min(...tri.map(v=>v[k]))),max:[0,1,2].map(k=>Math.max(...tri.map(v=>v[k])))});
  }
  return out;
}
function meshesTouch(a,b){
  for(const s of a)for(const t of b){
    if([0,1,2].some(k=>s.max[k]<t.min[k]||t.max[k]<s.min[k]))continue;
    for(const [P,Q] of [[s.tri,t.tri],[t.tri,s.tri]])for(let i=0;i<3;i++)if(edgeCrosses(P[i],P[(i+1)%3],Q))return true;
  }
  return false;
}

test('the HR-V is the decided US EX-L AWD in its catalog, tire and accessory text',()=>{
  const v=VEHICLES.hrv;
  assert.match(v.detail,/EX-L AWD/);assert.match(v.note,/Real Time AWD/);assert.match(v.note,/moonroof/);
  assert.equal(v.tire,'EX-L: 225/55R18');
  const tires=PARTS.find(p=>p.id==='h-tires');
  assert.match(tires.fit,/225\/55R18 98H for the EX-L/);
  for(const text of [v.detail,v.note,v.tire,tires.sku,tires.fit])assert.doesNotMatch(text,/\bLX\b|Sport|not assumed/);
  const drive=getRoadDrivetrain('hrv');
  assert.match(drive.description,/EX-L has Real Time AWD/);assert.doesNotMatch(drive.description,/front-wheel-drive/);
  assert.match(getAssembly('hrv','body').description,/EX-L moonroof/);
});

test('the AWD driveline parts are listed, sourced, and open their mechanism studies',()=>{
  const drive=getAssembly('hrv','drivetrain');
  const ids=drive.parts.map(p=>p.id);
  for(const id of ['drivetrain.gearbox','drivetrain.torque-converter','drivetrain.front-differential','drivetrain.halfshafts',...awd])assert(ids.includes(id),id);
  for(const id of awd){
    const part=getComponent('hrv',id);
    assert(part.name&&part.description,id);
    assert.equal(part.source.url,specs,id);
    assert.equal(getDetail('hrv',id)?.id,studies[id],id);
  }
  for(const id of ['hrv-transfer','hrv-propshaft','hrv-coupling']){
    const study=getDetail('hrv',Object.keys(studies).find(k=>studies[k]===id));
    assert.equal(study.source.url,specs);
    assert.match(study.description,/illustrative|estimated/);
  }
  assert(getDetail('hrv','drivetrain.transfer').animated);
});

test('each AWD part is tagged in the assembled HR-V, selectable on its own and highlighted when chosen',()=>{
  const whole=renderer();
  for(const id of awd)assert(whole.faces.some(f=>f.part===id),id);
  for(const id of awd){
    const only=renderer({assembly:'drivetrain',part:id,onlyPart:true});
    assert(only.faces.length>10&&only.faces.every(f=>f.part===id),id);
    const chosen=renderer({assembly:'drivetrain',part:id});
    const lit=new Set(chosen.faces.filter(f=>f.highlighted).map(f=>f.part));
    assert.deepEqual([...lit],[id]);
  }
});

test('the isolated drivetrain explodes with every AWD part parked and travelling clear',()=>{
  const context=renderer({assembly:'drivetrain'});
  // As for the existing transaxle, the tight underbody route asks for isolation first.
  assert.equal(context.hasBlockedTransit(),true);
  const r=renderer({assembly:'drivetrain',expanded:true},{isolate:true});
  assert.equal(r.hasBlockedTransit(),false);
  const groups=[...r.activeLayout.groups.values()];
  for(const id of awd)assert(groups.some(g=>g.key===id&&g.movable),id);
  for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)assert(!intersects(groups[i].parked,groups[j].parked),groups[i].key+' / '+groups[j].key);
  planTravel(r.activeLayout);
  for(let step=1;step<=24;step++){
    const boxes=groups.map(g=>displaced(g.bounds,offsetAt(g,step/24)));
    for(let i=0;i<groups.length;i++)for(let j=0;j<i;j++){
      if(intersects(groups[i].bounds,groups[j].bounds))continue;
      assert(!intersects(boxes[i],boxes[j]),groups[i].key+' crosses '+groups[j].key);
    }
  }
  for(const id of ['drivetrain.transfer','drivetrain.propshaft','drivetrain.rear-coupling']){
    const study=renderer({detailView:getDetail('hrv',id),expanded:true});
    const parts=[...study.activeLayout.groups.values()];
    assert(parts.length>=6&&parts.every(g=>g.movable),id);
    for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)assert(!intersects(parts[i].parked,parts[j].parked),id+' '+parts[i].key+' / '+parts[j].key);
  }
});

test('the AWD driveline clears the floor, fuel system, suspension, brakes, engine and body',()=>{
  const r=renderer();
  const byPart=new Map();
  for(const f of r.faces){if(!byPart.has(f.part))byPart.set(f.part,[]);byPart.get(f.part).push(f);}
  const neighbours=[...byPart.keys()].filter(id=>!id.startsWith('drivetrain.'));
  for(const required of ['floor.pan','fuel.tank','fuel.pump','fuel.sender','fuel.supply','fuel.filler','suspension.frame','suspension.spring','suspension.damper','steering.axle','brakes.lines','brakes.parking','powertrain.sump','powertrain.block','powertrain.exhaust-manifold','body.structure'])
    assert(neighbours.includes(required),required);
  // Parts of the transaxle the new hardware meets only at its own flanges or bore.
  const front=['drivetrain.gearbox','drivetrain.torque-converter','drivetrain.front-differential'];
  const mesh=new Map([...byPart].map(([id,faces])=>[id,triangles(faces)]));
  for(const id of awd)for(const other of [...neighbours,...front])assert(!meshesTouch(mesh.get(id),mesh.get(other)),id+' intersects '+other);
  // The shaft passes under the tank through its recess rather than around it.
  const box=id=>{const p=byPart.get(id).flatMap(f=>f.points);return [0,1,2].map(k=>[Math.min(...p.map(v=>v[k])),Math.max(...p.map(v=>v[k]))]);};
  const shaft=box('drivetrain.propshaft'),tank=box('fuel.tank');
  assert(shaft[0][0]<tank[0][0]&&shaft[0][1]>tank[0][1]);
  const under=byPart.get('drivetrain.propshaft').flatMap(f=>f.points).filter(p=>p[0]>tank[0][0]&&p[0]<tank[0][1]);
  assert(under.length&&Math.max(...under.map(p=>p[2]))>tank[2][0]+.05&&under.every(p=>p[2]<tank[2][1]));
  assert(box('drivetrain.rear-differential')[2][1]<box('floor.pan')[2][0]);
});

test('the EX-L moonroof is installed on this configuration',()=>{
  const roof=getRoadServiceAssemblies('hrv').find(g=>g.id==='roof');
  assert.match(roof.name,/EX-L/);
  const faces=renderer().faces;
  for(const id of ['roof.cassette','roof.drive','roof.slides','roof.shade'])assert(faces.some(f=>f.part===id),id);
});

test('every AWD name, description and motion line has an offline recording',()=>{
  const bank=JSON.parse(readFileSync(new URL('../shared/listening/garage.json',import.meta.url)));
  const drive=getAssembly('hrv','drivetrain'),lines=[drive.description,VEHICLES.hrv.detail,VEHICLES.hrv.note,VEHICLES.hrv.tire];
  for(const id of awd){
    const part=getComponent('hrv',id),study=getDetail('hrv',id);
    lines.push(part.name,part.description,study.name,study.description);
    if(study.motionDescription)lines.push(study.motionDescription);
    for(const group of study.groups)for(const p of group.parts)lines.push(p.name,p.description);
  }
  for(const line of lines)assert(bank[voiceKey(line)],line);
});
