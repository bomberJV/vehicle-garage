import assert from 'node:assert/strict';
import test from 'node:test';
import {VEHICLES} from '../garage/catalog.js';
import {getPerseveranceMobility} from '../garage/perseverance-mobility.js';
import {FLEET} from '../garage/fleet.js';
import {GarageRenderer} from '../garage/render.js';
import {getVehicleReferences} from '../garage/reference-ledger.js';

function mesh(id) {
  const renderer = Object.create(GarageRenderer.prototype);
  renderer.faces = [];
  FLEET[id].draw(renderer);
  return renderer.faces;
}

function extent(faces, axis) {
  let lo = Infinity, hi = -Infinity;
  for (const {points} of faces) for (const point of points) {
    lo = Math.min(lo, point[axis]);
    hi = Math.max(hi, point[axis]);
  }
  return hi - lo;
}

function near(actual, expected, tolerance = .001) {
  assert(Math.abs(actual - expected) < tolerance, `${actual} versus ${expected}`);
}

test('each catalog vehicle identifies a real reference and its scope', () => {
  for (const id of Object.keys(VEHICLES)) {
    const records = getVehicleReferences(id);
    assert(records.length, id);
    for (const source of records) {
      assert.equal(new URL(source.url).protocol, 'https:');
      for (const field of ['kind', 'label', 'scope']) assert(source[field].trim(), id + ' ' + field);
    }
    assert.equal(new Set(records.map(r => r.url)).size, records.length, id);
  }
  assert.deepEqual(getVehicleReferences('toString'), []);
  assert.deepEqual(getVehicleReferences('missing'), []);
});

test('civil aircraft mesh envelopes follow the manufacturer span and length in the three-views', () => {
  for (const [id, span, length] of [['boeing747', 64.44, 70.67], ['cessna172', 433, 326], ['gulfstreamg800', 103, 99.75]]) {
    const faces = mesh(id);
    near(extent(faces, 1) / extent(faces, 0), span / length, id === 'gulfstreamg800' ? .005 : .001);
  }
  const cabin = mesh('gulfstreamg800').filter(f => f.part === 'fuselage.windows');
  assert.equal(new Set(cabin.map(f => f.instance)).size, 16);
});

test('the merchant hulls use the particulars of the individual ship', () => {
  for (const [id, beam, length] of [['ooclspain', 61.30, 399.99], ['seawisegiant', 68.8, 458.45]]) {
    const faces = mesh(id).filter(f => f.part === 'hull.shell');
    near(extent(faces, 1) / extent(faces, 0), beam / length);
  }
});

test('the Ford uses the regular-cab eight-foot-box dimensions', () => {
  near(VEHICLES.f350.wheelbase, 133 * .0254);
  near(VEHICLES.f350.length, 213.3 * .0254);
});

test('Alvin forward and side viewport counts and sizes match WHOI', () => {
  const panes = mesh('alvin').filter(f => f.part === 'crew.ports' && f.points.length === 20);
  assert.equal(panes.length, 5);
  const diameters = panes.map(f => Math.hypot(...f.points[0].map((v, i) => v - f.points[10][i]))).sort((a, b) => a - b);
  near(diameters[0], diameters[1]);
  near(diameters[2], diameters[4]);
  near(diameters[0] / diameters[4], 12/17);
});

test('Perseverance wheel envelopes match the deployed wheels in the NASA GLB', () => {
  // NASA GLB Wheels_objs, aluminum_black primitive. Front/rear centers span
  // 2.260 m longitudinally. Middle rims extend 0.122 m farther out per side.
  const renderer = Object.assign(Object.create(GarageRenderer.prototype), {faces: []});
  getPerseveranceMobility('mars.rover').draw(renderer, 0);
  for (const [suffix, longitudinal, outerEdge] of [
    ['fl', -1.130, 1.23022], ['ml', .055, 1.35230], ['rl', 1.130, 1.23022],
    ['fr', -1.130, 1.23022], ['mr', .055, 1.35230], ['rr', 1.130, 1.23022],
  ]) {
    const points = renderer.faces.filter(f => f.part === 'percy-rover.' + suffix).flatMap(f => f.points);
    const foreAft = points.map(p => p[0]);
    near((Math.max(...foreAft) + Math.min(...foreAft)) / 2, longitudinal);
    near(Math.max(...points.map(p => Math.abs(p[1]))), outerEdge);
    near(Math.min(...points.map(p => p[2])), 0);
  }
  const wheel = getPerseveranceMobility('percy-rover.fl');
  renderer.faces = [];
  wheel.draw(renderer, 0);
  const tread = renderer.faces.filter(f => f.part === 'percy-corner.tread');
  near(extent(tread, 1)/extent(tread, 2), .33561/.52534);
});
