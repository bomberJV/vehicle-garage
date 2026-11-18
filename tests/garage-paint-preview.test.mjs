import test from 'node:test';
import assert from 'node:assert/strict';
import {PROBES, paintModel} from '../garage/paint-preview.js';

const hex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// The kinds of colour the drawings derive from the paint: the paint, a shade, a mix towards
// white, a fixed trim colour and a translucent paint.
const looks = [
  p => p,
  p => hex(rgb(p).map(v => v * .66)),
  p => hex(rgb(p).map(v => v + (255 - v) * .3)),
  () => '#2b2f31',
  p => p + '80',
];
const build = paint => looks.map((look, i) => ({points: [[i, 0, 0], [i, 1, 0], [i, 1, 1]], part: 'body.panel' + i, color: look(paint),
  vertexColors: i === 1 ? [look(paint), '#ffffff', look(paint)] : undefined}));

test('a picker preview recolours the probe builds as the drawings would', () => {
  const low = build(PROBES[0]), recolour = paintModel(low, build(PROBES[1]));
  for (const paint of ['#c5222c', '#f2c629', '#1b3a6b', '#ffffff', '#000000']) {
    const preview = recolour(paint), exact = build(paint);
    preview.forEach((face, i) => {
      const off = rgb(face.color).map((v, c) => Math.abs(v - rgb(exact[i].color)[c]));
      assert.ok(Math.max(...off) <= 2, `${paint} surface ${i}: ${face.color} vs ${exact[i].color}`);
      assert.equal(face.color.length, exact[i].color.length);
      // The geometry is the probe build's, not drawn again.
      assert.equal(face.points, low[i].points);
    });
    assert.equal(preview[3], low[3], 'a surface that does not follow the paint is reused as it is');
    assert.equal(preview[1].vertexColors[1], '#ffffff');
  }
});

test('builds that do not line up surface for surface fall back to a full rebuild', () => {
  const low = build(PROBES[0]), high = build(PROBES[1]);
  assert.equal(paintModel(low, high.slice(1)), null);
  assert.equal(paintModel(low, high.map((f, i) => i === 2 ? {...f, part: 'other'} : f)), null);
  assert.equal(paintModel(low, high.map((f, i) => i === 0 ? {...f, color: 'rgb(1,2,3)'} : f)), null);
});
