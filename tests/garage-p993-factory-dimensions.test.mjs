// The 993 Cabriolet against its published dimensions (hub #232).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {factoryDimensions as D,dimensionSources,tyreDiameter,europeanFigures} from '../garage/porsche993-dimensions.js';

const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle:'porsche993cab',roofPosition:'up',paint:'silver',parts:[]},inspection:{},isolate:false,partPositions:new Map(),schematic:true});
r.buildMesh();
const pts=re=>r.faces.filter(f=>re.test(f.part)).flatMap(f=>f.points);
const span=(P,k)=>[Math.min(...P.map(p=>p[k])),Math.max(...P.map(p=>p[k]))];
const mm=v=>Math.round(v*10000)/10;
const tyre=(sx,sy)=>{const q=pts(/^running\.tires$/).filter(p=>Math.sign(p[0])===sx&&Math.sign(p[1])===sy);return {x:span(q,0),y:span(q,1),z:span(q,2)};};
const measured=()=>{
  const all=r.faces.flatMap(f=>f.points),ground=span(pts(/^running\.tires$/),2)[0];
  const fl=tyre(-1,-1),fr=tyre(-1,1),rl=tyre(1,-1),rr=tyre(1,1),c=s=>(s[0]+s[1])/2;
  return {
    length:mm(span(all,0)[1]-span(all,0)[0]),width:mm(span(pts(/^shell\.fenders$/),1)[1]-span(pts(/^shell\.fenders$/),1)[0]),
    height:mm(span(pts(/^roof\.fabric$/),2)[1]-ground),wheelbase:mm(c(rl.x)-c(fl.x)),
    trackFront:mm(c(fr.y)-c(fl.y)),trackRear:mm(c(rr.y)-c(rl.y)),
    tyreFront:{width:mm(fr.y[1]-fr.y[0]),diameter:mm(fr.z[1]-fr.z[0])},tyreRear:{width:mm(rr.y[1]-rr.y[0]),diameter:mm(rr.z[1]-rr.z[0])}
  };
};
const m=measured();

test('every published figure has a source',()=>{
  for(const v of Object.values(D))assert(dimensionSources[v.source]?.url.startsWith('https://'));
});

test('length, width, closed-roof height, wheelbase and tracks match the US figures to the millimetre',()=>{
  for(const k of ['length','height','wheelbase','trackFront','trackRear','width'])assert(Math.abs(m[k]-D[k].mm)<=1,`${k} ${m[k]} mm, published ${D[k].mm}`);
});

test('the model is the US car, not the shorter and lower European one',()=>{
  assert(dimensionSources[europeanFigures.source]);
  for(const k of ['length','height'])assert(m[k]-europeanFigures[k]>=14,`${k} ${m[k]} mm against the European ${europeanFigures[k]}`);
});

test('the tyres are the factory 16-inch sizes: section width and outside diameter',()=>{
  for(const [k,t] of [['tyreFront',m.tyreFront],['tyreRear',m.tyreRear]]){
    const code=D[k].size,width=+code.match(/^(\d+)/)[1];
    assert(Math.abs(t.width-width)<=1,`${k} width ${t.width} mm for ${code}`);
    assert(Math.abs(t.diameter-tyreDiameter(code))<=6,`${k} diameter ${t.diameter} mm, ${code} is ${tyreDiameter(code).toFixed(1)} mm`);
  }
});
