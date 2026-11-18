// The installed 993 flat-six (M64/05) at its real cylinder pitch, behind the
// rear axle, with the transaxle ahead of it. See garage/porsche-boxer-layout.js.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {normalizedLift} from '../garage/lift-options.js';
import {boxerFrame,cylinderX,flangeX,m64,CLASSIC_SCALE} from '../garage/porsche-boxer-layout.js';
import {porscheShape} from '../garage/porsche-coachwork.js';

const vehicle='porsche993cab';
const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[],paint:'olive',finish:'silver',lift:normalizedLift(vehicle,{})},
  inspection:{},isolate:false,progress:0,lights:true,schematic:true,partPositions:new Map()});
r.buildMesh();
const faces=r.faces,points=id=>faces.filter(f=>f.part===id).flatMap(f=>f.points);
const range=(pts,k)=>[Math.min(...pts.map(p=>p[k])),Math.max(...pts.map(p=>p[k]))];
const car=porscheShape(false),frame=boxerFrame(car,false);

test('the M64 bore and stroke give the published 3.6-litre displacement',()=>{
  const cc=6*Math.PI/4*m64.bore**2*m64.stroke*1e6;
  assert(Math.abs(cc-3600)<5,`${cc.toFixed(0)} cm³`);
  assert.equal(m64.pitch,.118);assert.equal(m64.bankOffset,.059);
  assert(m64.source.url.startsWith('https://')&&m64.pitchSource.url.startsWith('https://'));
});

test('the six cylinders sit 118 mm apart in each bank, the banks 59 mm apart',()=>{
  // Each cooling fin is a flat ring at one height across the barrel: its
  // centre is the cylinder axis.
  const centres={'-1':new Set(),'1':new Set()};
  for(const f of faces)if(f.part==='engine.cylinders'&&f.points.length===10&&f.points.every(p=>Math.abs(p[1]-f.points[0][1])<1e-9)){
    const x=f.points.reduce((a,p)=>a+p[0],0)/10;centres[Math.sign(f.points[0][1])].add(Math.round(x*1e4)/1e4);
  }
  const left=[...centres['-1']].sort((a,b)=>a-b),right=[...centres['1']].sort((a,b)=>a-b);
  assert.equal(left.length,3);assert.equal(right.length,3);
  for(const bank of [left,right])for(let i=1;i<3;i++)assert(Math.abs(bank[i]-bank[i-1]-m64.pitch)<5e-4,`pitch ${bank[i]-bank[i-1]}`);
  for(let i=0;i<3;i++)assert(Math.abs(right[i]-left[i]-m64.bankOffset)<5e-4,`offset ${right[i]-left[i]}`);
  for(let n=0;n<3;n++)assert(Math.abs(left[n]-cylinderX(frame.cx,frame.f,n,-1))<5e-4);
  // A 100 mm bore with a wall, and fins that do not run into the next barrel.
  const fin=faces.find(f=>f.part==='engine.cylinders'&&f.points.length===10),c=fin.points.reduce((a,p)=>a.map((v,k)=>v+p[k]/10),[0,0,0]);
  const finRadius=Math.hypot(fin.points[0][0]-c[0],fin.points[0][2]-c[2]);
  assert(finRadius*2<m64.pitch&&finRadius>m64.bore/2,`fin diameter ${finRadius*2}`);
});

test('the engine sits behind the rear axle and the final drive, with the flywheel between',()=>{
  const axle=car.rear,diff=range(points('drivetrain.rear-differential'),0),clutch=range(points('drivetrain.clutch'),0);
  const flange=flangeX(frame.cx,frame.f);
  assert(Math.abs(clutch[1]-flange)<1e-8);
  assert(flange-axle>.12&&flange-axle<.20,`flywheel ${((flange-axle)*1000).toFixed(0)} mm behind the axle`);
  for(const id of ['engine.case','engine.crankshaft','engine.cylinders','engine.heads']){
    const [lo]=range(points(id),0);
    assert(lo>diff[1]&&lo>=flange,`${id} starts at ${lo.toFixed(3)}, the final drive ends at ${diff[1].toFixed(3)}`);
  }
  // The crankcase is about 0.39 m long at the rebuilt scale (0.59 m before).
  const [a,b]=range(points('engine.case'),0);
  assert(Math.abs(b-a-1.06*.55625*CLASSIC_SCALE)<1e-6);
  // The engine stays forward of the rear bumper.
  assert(Math.max(...['engine.case','engine.cooling','engine.intake'].map(id=>range(points(id),0)[1]))<car.stations.at(-1)[0]-.35);
});

test('the gearbox and clutch share the lowered crankshaft axis; the 996 frame is unchanged and the 992 uses the real pitch',()=>{
  const g=range(points('drivetrain.gearbox'),2);
  assert(Math.abs((g[0]+g[1])/2-frame.z)<1e-6);
  const m96=boxerFrame({rear:1.175},'996');
  assert.deepEqual([m96.cx,m96.f,m96.z],[1.175+.285,1,.502]);
  assert(Math.abs(flangeX(m96.cx,m96.f)-(1.175+.285-.0065-.607*.55625))<1e-12);
  // The 9A2 shares the 993's 118 mm bore spacing (Christophorus 394), so the
  // 992 is drawn with the 993's scale and setback at its own crank height.
  const m92=boxerFrame({rear:1.25},true);
  assert(Math.abs(m92.cx-(1.25+.378))<1e-12&&Math.abs(m92.f-118/178)<1e-12&&m92.z===.502);
});

test('the alternator is on the fan axis and the rails carry one injector per cylinder',()=>{
  const gen=range(points('electrical.generator'),2),fan=frame.z+.160;
  assert(Math.abs((gen[0]+gen[1])/2-fan)<.002);
  const rail=points('fuel.rail');
  for(const s of [-1,1]){
    const bank=rail.filter(p=>Math.sign(p[1])===s),[lo,hi]=range(bank,0);
    assert(lo<cylinderX(frame.cx,frame.f,0,s)&&hi>cylinderX(frame.cx,frame.f,2,s));
  }
});

test('the installed crank has the 993 journals: 60 mm mains, 55 × 19 mm big ends on a 38.2 mm throw',()=>{
  assert(m64.journalSource.url.startsWith('https://'));
  // Each journal is drawn as two six-point rings in planes across the crank axis.
  const byX=new Map();
  for(const p of points('engine.crankshaft')){const k=p[0].toFixed(6);byX.set(k,(byX.get(k)||[]).concat([p]));}
  const mains=[],pins=[];
  for(const [k,pts] of byX){
    const u=[...new Map(pts.map(p=>[p[1].toFixed(6)+','+p[2].toFixed(6),p])).values()];
    if(u.length!==6)continue;
    const c=[0,1,2].map(i=>u.reduce((a,p)=>a+p[i],0)/6),rad=u.map(p=>Math.hypot(p[1]-c[1],p[2]-c[2]));
    if(Math.max(...rad)-Math.min(...rad)>1e-6)continue;
    const off=Math.hypot(c[1],c[2]-frame.z);
    (off<1e-6?mains:pins).push({x:+k,r:rad[0],off});
  }
  assert(mains.some(m=>Math.abs(m.r-m64.journals.main/2)<1e-6),`main radii ${[...new Set(mains.map(m=>m.r.toFixed(4)))]}`);
  const big=pins.filter(p=>Math.abs(p.r-m64.journals.rod/2)<1e-6);
  assert.equal(big.length,12,'six big-end journals, two rings each');
  for(const p of big)assert(Math.abs(p.off-m64.stroke/2)<1e-6,`throw ${p.off}`);
  const xs=big.map(p=>p.x).sort((a,b)=>a-b);
  for(let i=0;i<12;i+=2)assert(Math.abs(xs[i+1]-xs[i]-m64.journals.rodWidth)<1e-6,`big end ${i/2+1} width ${(xs[i+1]-xs[i]).toFixed(4)}`);
});
