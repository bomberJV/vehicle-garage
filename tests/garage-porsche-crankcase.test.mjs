import assert from 'node:assert/strict';
import test from 'node:test';
import {FLEET} from '../garage/fleet.js';
import {rodPin,cylinderForPin,mainStations} from '../garage/porsche-crankshaft.js';
import {getAssemblies} from '../garage/assemblies.js';
import {getDetail} from '../garage/detail-catalog.js';
import {findInVehicle} from '../garage/inspection-search.js';
import {GarageRenderer} from '../garage/render.js';
import {planSeparation,displaced,intersects} from '../garage/exploded-layout.js';

function geometry(detail,t=0,inspection={}){
  const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],inspection});
  detail.draw(r,t);
  return r.faces;
}
function boundsOf(faces){
  const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  for(const {points} of faces)for(const point of points)for(let i=0;i<3;i++){
    assert(Number.isFinite(point[i]));bounds.min[i]=Math.min(point[i],bounds.min[i]);bounds.max[i]=Math.max(point[i],bounds.max[i]);
  }
  return bounds;
}
const extract=(faces,id)=>faces.filter(f=>f.part===id).map(f=>f.points);
for(const [vehicle,prefix] of [['porsche993cab','993'],['porsche992scab','992']]){
  test(vehicle+' opens its existing engine part and every catalogued case component has a visible mesh',()=>{
    const casePart=getAssemblies(vehicle).find(g=>g.id==='engine').parts.find(p=>p.id==='engine.case');
    assert.match(casePart.name,/crankcase/i);
    const root=getDetail(vehicle,casePart.id), seen=new Set();
    assert.equal(root.id,prefix+'case');assert.equal(getDetail(vehicle,'engine.block').id,root.id);
    function walk(view){
      if(seen.has(view.id))return;
      seen.add(view.id);
      const faces=geometry(view);
      assert.deepEqual(new Set(faces.map(f=>f.part)),new Set(view.componentIndex.keys()));
      const groups=new Map();
      for(const p of view.componentIndex.values()){
        assert.match(p.source.url,/^https:/);
        const bounds=boundsOf(faces.filter(f=>f.part===p.id));
        groups.set(p.id,{key:p.id,bounds,offset:p.offset,movable:true});
        const next=getDetail(vehicle,p.id);if(next)walk(next);
      }
      const motion=planSeparation(faces,face=>groups.get(face.part)).groups;
      const targets=[...motion.values()].map(g=>displaced(g.bounds,g.offset));
      for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++)assert(!intersects(targets[i],targets[j]),view.id+' separated parts');
    }
    walk(root);assert(seen.size>7);
    const results=findInVehicle(vehicle,'bearing shell',40);
    assert(results.some(r=>r.path[0]==='engine.case'&&r.path.includes(prefix+'case.bearings')));
    const isolated=getDetail(vehicle,prefix+'case.left');
    assert.match(isolated.componentIndex.get(isolated.id+'.deck').name,prefix==='993'?/registers/:/bores/);
  });
  test(vehicle+' crankpins rotate inside the stationary split housings',()=>{
    const root=getDetail(vehicle,'engine.case'),a=geometry(root,0),b=geometry(root,.15);
    for(const p of root.componentIndex.values()){
      const id=p.id;
      if(id.endsWith('.crankshaft'))assert.notDeepEqual(extract(a,id),extract(b,id));
      else assert.deepEqual(extract(a,id),extract(b,id));
    }
    const lower=boundsOf(a.filter(f=>f.part===root.id+'.left'));
    const upper=boundsOf(a.filter(f=>f.part===root.id+'.right'));
    assert(lower.max[1]<.011&&upper.min[1]>-.011,'case must split left and right');
    const fastener=getDetail(vehicle,prefix+'case.fastener');
    const hardware=[...fastener.componentIndex.keys()].map(id=>id.split('.')[1]);
    assert.deepEqual(hardware,prefix==='993'?['shaft','washer','oring','nut']:['shaft','washer','threads']);
    assert.equal(Boolean(getDetail(vehicle,root.id+'.nose')),prefix==='993');
  });
}
test('each generation owns a distinct case, sources and fastener family',()=>{
  assert.equal(getDetail('porsche993cab','992case.fastener'),null);
  assert.equal(getDetail('porsche992scab','993case.nose'),null);
  assert.equal(getDetail('bmw325ci','993case.fastener'),null);
  assert.match(getDetail('porsche993cab','engine.case').source.url,/porsche.com.*page=34/);
  assert.match(getDetail('porsche992scab','engine.case').source.url,/porsche-engineering.*page=63/);
});


test('six distinct rod pins provide opposing pairs, three 120-degree throws per bank, and even firing intervals',()=>{
  for(const phase of [0,.23,.5]){
    const pins=cylinderForPin.map((_,i)=>rodPin(i,phase));
    for(let i=0;i<6;i++){
      assert(pins[i][0]>mainStations[i]&&pins[i][0]<mainStations[i+1]);
      const a=pins[i],other=pins[i^1];assert(Math.hypot(a[1]+other[1],a[2]+other[2])<1e-10);
    }
  }
  // Alignment with the outward cylinder axis every 120 crankshaft degrees.
  // After 360 degrees the opposed partner is on its compression stroke.
  const start=(.29+240*Math.PI/180-Math.PI)/(2*Math.PI);
  for(const [step,cylinder] of [1,6,2,4,3,5].entries()){
    const [,side,up]=rodPin(cylinderForPin.indexOf(cylinder),start+step/3);
    assert(Math.abs(up)<1e-12);assert.equal(Math.sign(side),cylinder<=3?-1:1);
  }
});
for(const [vehicle,prefix] of [['porsche993cab','993'],['porsche992scab','992']]){
  test(vehicle+' starts with both banks assembled, offers a cutaway, and opens the same casting-supported and bare crank views',()=>{
    const car=FLEET[vehicle],r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle},faces:[],partPositions:new Map(),schematic:true,isolate:true,inspection:{assembly:'engine'}});
    car.draw(r);const whole=r.faces;
    assert(whole.length<10000);r.prepareInspection(car);
    const forwardHeads=faces=>faces.some(f=>f.part==='engine.heads'&&f.points.every(p=>p[1]>0));
    const endCaps=faces=>faces.filter(f=>f.part==='engine.cylinders'&&f.points.length===14&&f.points.every(p=>Math.abs(Math.abs(p[1])-.37)<1e-6));
    assert(r.faces.some(f=>f.part==='engine.crankshaft'));
    assert(forwardHeads(r.faces));assert.equal(endCaps(r.faces).length,6);
    r.inspection.engineCutaway=true;r.faces=whole;r.prepareInspection(car);
    assert(!forwardHeads(r.faces));assert.equal(endCaps(r.faces).length,3);
    r.inspection.part='engine.heads';r.faces=whole;r.prepareInspection(car);
    assert(r.faces.some(f=>f.part==='engine.heads'&&f.points.every(p=>p[1]>0)));
    r.inspection.part=null;r.inspection.engineCutaway=false;r.faces=whole;r.prepareInspection(car);
    assert(forwardHeads(r.faces));assert.equal(endCaps(r.faces).length,6);
    const caseView=getDetail(vehicle,'engine.case');
    const assembled=geometry(caseView),section=geometry(caseView,0,{engineCutaway:true});
    for(const side of ['left','right']){
      const id=caseView.id+'.'+side;
      assert(boundsOf(assembled.filter(f=>f.part===id)).max[2]>.2);
      if(side==='left')assert.deepEqual(extract(assembled,id),extract(section,id));
      else assert(boundsOf(section.filter(f=>f.part===id)).max[2]<-.10);
    }
    r.faces=whole;r.inspection.part='engine.crankshaft';r.inspection.onlyPart=true;r.prepareInspection(car);
    assert(r.faces.length>80&&r.faces.every(f=>f.part==='engine.crankshaft'));
    const view=getDetail(vehicle,'engine.crankshaft');
    assert.equal(getDetail(vehicle,prefix+'case.crankshaft').id,view.id);
    const bare=getDetail(vehicle,view.id+'.shaft');
    assert.deepEqual([...bare.componentIndex.keys()].map(k=>k.split('.')[1]),['mains','pins','webs','ends']);
    for(const phase of [0,.25]){
      const assembled=geometry(view,phase).filter(f=>f.part.endsWith('.shaft')).map(f=>f.points);
      assert.deepEqual(assembled,geometry(bare,phase).map(f=>f.points));
    }
  });
}

test('a Porsche engine deep link fills the canvas while the 992 front radiators remain inspectable',()=>{
  const w=800,h=460;
  const ctx={setTransform(){},clearRect(){},fillRect(){},fillText(){},createRadialGradient(){return {addColorStop(){}};}};
  globalThis.window={devicePixelRatio:1};
  try{
    for(const vehicle of ['porsche993cab','porsche992scab']){
      const canvas={width:w,height:h,clientWidth:w,getBoundingClientRect(){return {width:w,height:h};}};
      const r=Object.assign(Object.create(GarageRenderer.prototype),{build:{vehicle,parts:[]},inspection:{assembly:'engine',frameEngine:true},canvas,ctx,
        angle:vehicle==='porsche993cab'?1.03:.84,elevation:vehicle==='porsche993cab'?.37:.46,zoom:1,schematic:true,isolate:true,partPositions:new Map(),depthRender(){}});
      const widthOf=part=>{
        const x=r.hitFaces.filter(f=>f.part===part).flatMap(f=>f.projected.map(p=>p.x));
        return Math.max(...x)-Math.min(...x);
      };
      r.draw();
      const localPoints=r.hitFaces.filter(f=>f.part!=='engine.cooling'||f.points[0][0]>0).flatMap(f=>f.projected);
      const x=localPoints.map(p=>p.x),y=localPoints.map(p=>p.y),headWidth=widthOf('engine.heads');
      assert(Math.max(...x)-Math.min(...x)>w*.6||Math.max(...y)-Math.min(...y)>h*.62);
      assert(Math.abs((Math.min(...x)+Math.max(...x))/2-w/2)<1,'installed engine is centered on entry');
      // The 992's heads sit at the real 118 mm bore spacing between its wider
      // turbochargers and intercoolers, so they take a smaller share than the 993's.
      assert(headWidth>w*(vehicle==='porsche992scab'?.27:.30),'installed heads occupy a useful share of the viewport');
      if(vehicle==='porsche992scab'){
        assert(r.hitFaces.some(f=>f.part==='engine.cooling'));
        r.inspection.part='engine.cooling';r.draw();
        assert(widthOf('engine.heads')<headWidth*.8,'selecting the remote cooling system includes it in the fitted frame');
      }
    }
  }finally{delete globalThis.window;}
});
