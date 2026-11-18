import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
import {buildG500Exterior,buildFordExterior,utilityWheelSpokes} from '../garage/exterior-utility.js';
function mesh(fn,vehicle){const r=Object.create(GarageRenderer.prototype);r.faces=[];r.currentPart=null;r.build={vehicle};r.lights=true;fn(r,'#58634d',[]);return r.faces;}
test('utility exterior modules have finite tagged panels, distinct hood and glazing',()=>{
 for(const [fn,id]of [[buildG500Exterior,'g500'],[buildFordExterior,'f350']]){
  const faces=mesh(fn,id);assert.ok(faces.length>400,id+' detailed surfaces');
  const tags=new Set(faces.map(f=>f.part));for(const tag of ['body.hood','body.door','body.glass','lighting.headlamp','lighting.indicator'])assert.ok(tags.has(tag),`${id} ${tag}`);
  for(const f of faces){assert.match(f.color,/^#[0-9a-f]{6}$/i);assert.ok(f.points.length>=3);for(const p of f.points)assert.ok(p.length===3&&p.every(Number.isFinite));}
 }
});
test('Ford regular-cab exterior has an open bed and body length matching a long-box regular cab',()=>{
 const faces=mesh(buildFordExterior,'f350'),points=faces.flatMap(f=>f.points),xs=points.map(p=>p[0]);
 const length=Math.max(...xs)-Math.min(...xs);assert.ok(length>5.3&&length<5.7,`body span ${length}`);
 // A bed should have floor/wheel-tub detail, not an opaque solid box filling its cargo volume.
 const blockers=faces.filter(f=>f.part==='body.door'&&f.points.every(p=>p[0]>.5&&p[0]<2.5&&Math.abs(p[1])<.5&&p[2]>1.0));
 assert.equal(blockers.length,0);
});

function inspectPanels(buildExterior,vehicle,expanded) {
 const r=Object.create(GarageRenderer.prototype);
 Object.assign(r,{faces:[],currentPart:null,build:{vehicle},lights:true,inspection:{assembly:'body',expanded},schematic:true});
 buildExterior(r,'#58634d',[]);
 r.applyInspection();
 return r;
}

test('each G500 closure, including glazing and hardware, has one reversible rigid transform',()=>{
 const closed=inspectPanels(buildG500Exterior,'g500',false), open=inspectPanels(buildG500Exterior,'g500',true);
 assert.equal(open.faces.length,closed.faces.length);
 const mounts=new Map();
 for (const [i,original] of closed.faces.entries()) {
  const shifted=open.faces[i], mount=original.rigid;
  assert.ok(mount,original.part+' needs a physical attachment');
  if (!mounts.has(mount.name)) mounts.set(mount.name,new Set());
  mounts.get(mount.name).add(original.part);
  const shift=open.activeLayout.entries[i].group.frameOffset;
  for (const [j,p] of original.points.entries()) {
   for(let k=0;k<3;k++) assert.ok(Math.abs(shifted.points[j][k]-p[k]-shift[k])<1e-10,mount.name);
  }
 }
 for(const name of ['left-front','right-front','left-rear','right-rear','cargo-door']){
  assert(mounts.get(name).has('body.glass'),name+' must carry its own glass');
  assert(mounts.get(name).size>=2);
 }
 assert(mounts.get('cargo-door').has('body.spare'));
 assert(mounts.get('body-shell').has('body.quarter-glass'));
 const left=closed.faces.find(f=>f.rigid.name==='left-front').rigid;
 const right=closed.faces.find(f=>f.rigid.name==='right-front').rigid;
 assert.equal(left.offset[1],-right.offset[1]);
});

test('G500 front and rear door apertures remain open and near-side glass picks the correct panel',()=>{
 const r=inspectPanels(buildG500Exterior,'g500',false);
 r.canvas={getBoundingClientRect:()=>({left:0,top:0})};
 r.project=([x,y,z])=>({x,y:z,depth:y});
 const full=r.faces;
 assert.equal(r.hitTest(-.24,1.49)?.part,'body.glass');
 assert.equal(r.hitTest(-.24,.85)?.part,'body.front-right');
 assert.equal(r.hitTest(.72,.85)?.part,'body.rear-right');
 for(const side of [-1,1]){
  r.faces=full.filter(f=>f.rigid.name==='body-shell'&&f.points.every(p=>p[1]*side>.79));
  for(const x of [-.24,.72])for(const z of [.90,1.48])assert.equal(r.hitTest(x,z),null,'solid backing across door opening');
 }
});

test('Ford moves the door, mirror and side glass together and leaves the bed behind the tailgate',()=>{
 const r=inspectPanels(buildFordExterior,'f350',false);
 const doors=r.faces.filter(f=>f.rigid?.name?.endsWith('-door'));
 assert(new Set(doors.map(f=>f.rigid.name)).size===2);
 for(const f of doors)assert.ok(f.points.every(p=>Math.sign(p[1])===Math.sign(f.rigid.offset[1])));
 assert(doors.some(f=>f.part==='body.glass'));
 assert(doors.some(f=>f.points.some(p=>Math.abs(p[1])>1.16)),'mirrors belong to the doors');
 assert(r.faces.filter(f=>f.part==='body.deck').every(f=>f.rigid?.name==='tailgate'&&f.rigid.offset[0]>.4));
});

test('G500 and single-rear-wheel Ford use separate rim designs and mounting patterns',()=>{
 for(const [vehicle,rim,count] of [['g500',.2286,5],['f350',.2032,8]]){
  const geometry=Object.create(GarageRenderer.prototype);
  geometry.faces=[];
  const caps=[];
  geometry.ringY=(...args)=>{
   const [x,,z,outer,inner,,sides]=args;
   if(sides===6&&inner===0)caps.push([x,z,outer]);
   GarageRenderer.prototype.ringY.call(geometry,...args);
  };
  utilityWheelSpokes(geometry,{vehicle,rim,side:1,x:0,y:0,z:0,finish:'#adb7b6'});
  assert.equal(caps.length,count);
  assert(caps.every(([x,z])=>Math.abs(Math.hypot(x,z)-(vehicle==='f350'?.08255:.065))<1e-8));
  geometry.canvas={getBoundingClientRect:()=>({left:0,top:0})};
  geometry.project=([x,y,z])=>({x,y:z,depth:y});
  // Sample the ventilation band or spoke tips, well away from the backing disc.
  const holes=vehicle==='f350'?4:5;
  for(let i=0;i<holes;i++){
   const angle=(i+(vehicle==='f350'?.50:.75))*2*Math.PI/holes;
   const radius=rim*(vehicle==='f350'?.71:.78);
   assert.equal(geometry.hitTest(Math.cos(angle)*radius,Math.sin(angle)*radius),null);
   const solid=angle+Math.PI/holes;
   assert(geometry.hitTest(Math.cos(solid)*radius,Math.sin(solid)*radius));
  }
 }
});

test('Ford lower molding is cut around both wheel openings',()=>{
 const bands=mesh(buildFordExterior,'f350').filter(f=>f.color==='#b8b9ae');
 for(const axle of [-1.7,1.7])for(const f of bands){
  const min=Math.min(...f.points.map(p=>p[0])),max=Math.max(...f.points.map(p=>p[0]));
  assert(!(min<axle&&max>axle),'lower molding bridges a wheel opening');
 }
});

test('early W463 grille has seven horizontal vanes, cleared headlamp wells and wraparound bumper ends',()=>{
 const r=inspectPanels(buildG500Exterior,'g500',false),level=new Set();
 for(const f of r.faces.filter(f=>f.part==='body.grille')){
  if(!f.points.some(p=>Math.abs(Math.abs(p[1])-.438)<1e-7))continue;
  const z=f.points.map(p=>p[2]);
  if(Math.abs(Math.max(...z)-Math.min(...z)-.015)<1e-7)level.add(Math.round(Math.max(...z)*1000));
 }
 assert.equal(level.size,7);
 const ray=([x,y,z])=>({x:y,y:z,depth:-x});r.project=ray;r.canvas={getBoundingClientRect:()=>({left:0,top:0})};
 assert.equal(r.hitTest(.674,1.001)?.part,'lighting.headlamp');
 const bumper=r.faces.filter(f=>f.part.startsWith('body.front-bumper')).flatMap(f=>f.points).filter(p=>p[0]<-2.114 && p[2]>.45&&p[2]<.70);
 const frontAt=y=>Math.min(...bumper.filter(p=>Math.abs(Math.abs(p[1])-y)<.004).map(p=>p[0]));
 assert.ok(frontAt(.923)-frontAt(.75)>.048,'bumper corner should sweep rearward');
 const arch=r.faces.filter(f=>f.rigid?.name==='body-shell').flatMap(f=>f.points).filter(p=>p[1]>.95&&Math.abs(p[0]+1.425)<.22);
 assert.ok(arch.some(p=>p[2]>.90),'projecting front flare needs a nearly flat crown');
});
