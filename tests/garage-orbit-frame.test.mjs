import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer,cameraBasis} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {VEHICLES} from '../garage/catalog.js';
import {canOrbitFast, orbitFrame} from '../garage/orbit-frame.js';

const ctx={save(){},restore(){},translate(){},scale(){},setTransform(){},clearRect(){},fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},
  createRadialGradient:()=>({addColorStop(){}})};
globalThis.window ??= {devicePixelRatio: 1};
function renderer(vehicle){
  const rect={width:520,height:400,left:0,top:0};
  const canvas={width:520,height:400,clientWidth:520,dataset:{},getBoundingClientRect:()=>rect,focus(){},setPointerCapture(){},addEventListener(){}};
  const r=Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle}),canvas,ctx,inspection:{},
    angle:-.58,elevation:.24,zoom:1,partPositions:new Map(),depthRender(){},reducedMotion:{matches:true}});
  r.setInspection({assembly:null});
  return {r,rect};
}

// The orbit path draws while the camera moves; the full frame follows. Both must place every
// point on the same pixel, or the car would jump when the pointer lets go.
test('an orbit frame frames the vehicle exactly as the full frame does', () => {
  for (const vehicle of ['g500', 'porsche993cab', 'bmws1000rr']) {
    for (const [angle, elevation, zoom, section] of [[-.58, .24, 1, null], [1.9, .7, 1.4, null], [3.4, -.2, .8, {axis: 0, percent: 46, reverse: false}]]) {
      const {r, rect} = renderer(vehicle);
      Object.assign(r, {angle, elevation, zoom, sectionPlane: section});
      r.draw();
      const full = r.project, camera = r.lastCamera;
      const v = VEHICLES[vehicle], w = rect.width, h = rect.height;
      const scale = Math.min(w / (v.length + 2.15), h / 4.3) * zoom;
      const {right, down, near} = cameraBasis(vehicle, null, angle, elevation);
      const orbit = orbitFrame(r, {w, h, rect, right, down, near, scale});
      assert.deepEqual(r.lastCamera, camera, `${vehicle} at ${angle}`);
      for (const face of r.faces.slice(0, 4000)) for (const p of face.points) {
        const a = full(p), b = orbit.project(p);
        assert.ok(Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6 && Math.abs(a.depth - b.depth) < 1e-9, `${vehicle} ${p}`);
      }
      assert.equal(r.hitFacesStale, true);
    }
  }
});

test('only an interaction on a 24-bit WebGL context takes the orbit path, and picking settles it', () => {
  const {r} = renderer('bmw325ci');
  r.draw();
  const gl = {isContextLost: () => false};
  Object.assign(r, {gl, checkedDepthContext: gl, depthBufferBits: 24});
  assert.equal(canOrbitFast(r), false);
  r.interacting = true;
  assert.equal(canOrbitFast(r), true);
  r.depthBufferBits = 16;
  assert.equal(canOrbitFast(r), false, 'a 16-bit depth buffer keeps the software path');
  r.depthBufferBits = 24;
  r.partPositions.set('wheels.front', [0, 0, .1]);
  assert.equal(canOrbitFast(r), false, 'moved parts keep the full path');
  r.partPositions.clear();
  r.hitFacesStale = true; r.gl = null;
  r.hitTest(10, 10);
  assert.equal(r.interacting, false);
  assert.equal(r.hitFacesStale, false, 'a pick draws the full frame first');
});
