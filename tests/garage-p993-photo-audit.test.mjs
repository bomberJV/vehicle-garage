// The 993 Cabriolet against side-on photographs and the rescue-sheet drawing (hub #232).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {photoReferences,photoLandmarks,photoFindings,referenceRange} from '../garage/p993-photo-audit.js';
import {classicHandle,coupeShape} from '../garage/porsche-coachwork.js';
import {classicDoor,classicSpoiler} from '../garage/porsche993-body-profile.js';

const r=Object.assign(Object.create(GarageRenderer.prototype),{faces:[],build:{vehicle:'porsche993cab',paint:'silver',parts:[]},inspection:{},isolate:false,partPositions:new Map(),schematic:true});
r.buildMesh();
const pts=re=>r.faces.filter(f=>re.test(f.part)).flatMap(f=>f.points);
const tyres=pts(/^running\.tires$/),ground=Math.min(...tyres.map(p=>p[2]));
const classic=coupeShape.find(c=>!c.modern);
const archRatio=(axle,radius)=>{
  const tyreTop=Math.max(...tyres.filter(p=>Math.abs(p[0]-axle)<.03).map(p=>p[2]));
  const lip=Math.min(...pts(/^shell\.fenders$/).filter(p=>Math.abs(p[0]-axle)<.03&&Math.abs(p[1])>.55&&p[2]>tyreTop-.05).map(p=>p[2]));
  return {ratio:(lip-ground-radius)/radius,gap:lip-tyreTop};
};
const within=(key,v)=>{const [a,b]=referenceRange(key);assert(v>=a&&v<=b,`${photoLandmarks[key].what}: model ${v.toFixed(3)}, references ${a.toFixed(3)}–${b.toFixed(3)}`);};

test('every landmark cites at least two of the linked references',()=>{
  for(const ref of Object.values(photoReferences))assert(ref.url.startsWith('https://')&&ref.label.length>30);
  for(const [k,l] of Object.entries(photoLandmarks)){
    const refs=Object.keys(l.values);
    assert(refs.length>=2&&refs.every(id=>photoReferences[id]),k);
  }
  for(const f of photoFindings)assert(f.found.length>40&&f.action.length>10,f.item);
});

test('the wheel arches stand over the tyres as photographed: higher at the front than the rear',()=>{
  const front=archRatio(classic.front,classic.frontRadius),rear=archRatio(classic.rear,classic.rearRadius);
  within('frontArch',front.ratio);within('rearArch',rear.ratio);
  assert(front.gap>rear.gap+.02,`front gap ${front.gap.toFixed(3)} m, rear ${rear.gap.toFixed(3)} m`);
});

test('belt height, door shut lines and the pull handle sit where the references put them',()=>{
  const door=pts(/^shell\.left-door$/).filter(p=>Math.abs(p[0]+.1)<.05);
  within('belt',Math.max(...door.map(p=>p[2]))-ground);
  within('doorFront',classicDoor[0]);within('doorRear',classicDoor[1]);
  within('handle',classicDoor[1]-classicHandle.back);
  // The handle is drawn on the door skin at that station.
  const hx=classicDoor[1]-classicHandle.back;
  assert(pts(/^shell\.left-door$/).some(p=>Math.abs(p[0]-hx)<.01&&Math.abs(p[2]-classicHandle.z)<.012&&p[1]<-.8));
});

test('details seen in every photograph are present: lamp order, brake-light bridge, tail band and twin outlets',()=>{
  const span=(re,k)=>{const P=pts(re);return [Math.min(...P.map(p=>p[k])),Math.max(...P.map(p=>p[k]))];};
  // Amber indicators sit outboard of the clear fog lamps in the front bumper.
  assert(span(/^lights\.indicators$/,1)[1]>span(/^lights\.fog-right$/,1)[1]+.1);
  // The fixed brake-light bridge crosses the lid ahead of the louvred grille.
  assert(span(/^lights\.high-stop$/,0)[1]<classicSpoiler.grilleFront);
  // The red tail band runs across nearly the full body width.
  const body=span(/^shell\.fenders$/,1),tail=span(/^lights\.tail$/,1);
  assert((tail[1]-tail[0])/(body[1]-body[0])>.85);
  // One oval outlet under each rear corner.
  const ex=pts(/^engine\.exhaust$/),end=Math.max(...ex.map(p=>p[0]));
  for(const s of [-1,1])assert(ex.some(p=>p[0]>end-.02&&Math.sign(p[1])===s&&Math.abs(p[1])>.45));
});
