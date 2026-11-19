import assert from 'node:assert/strict';
import test from 'node:test';
import {depthVertexShader} from '../garage/depth-vertex.js';
import {shellFragmentShader} from '../garage/shell-depth.js';
import {sectionFaces, sectionLimit, clipFaces} from '../garage/section-plane.js';
import {studioPaintReflection} from '../garage/studio-finish.js';

// The orbit path lights paint in the vertex shader. Its formulas must stay the ones the full
// frame uses, or the paint would shift colour when the pointer lets go.
test('the shader carries the full frame\'s paint lighting constants', () => {
  for (const constant of ['0.06 + 0.40', '0.16 * sky + 0.84 * softbox', '0.42, 0.23', '(r.z + 0.06) / 0.47', '0.17 + 0.06 * r.x, 0.24',
    '0.73 + 0.27', '(-r.z - 0.24) / 0.67', '-0.17, 0.24', '0.87 + 0.14 * ceiling - 0.17 * darkWall + 0.07 * floorLight + 0.06 * strip',
    '0.025 + 0.10 * ceiling + 0.19 * strip + 0.18 * grazing', '0.0, 0.76', '218.0, 230.0, 241.0', '175.0, 159.0, 144.0', '239.0, 243.0, 247.0', '1.33'])
    assert.ok(depthVertexShader.includes(constant), constant);
  assert.match(String(studioPaintReflection), /\.87\+\.14\*ceiling-\.17\*darkWall\+\.07\*floor\+\.06\*strip/);
  assert.match(shellFragmentShader, /if \(cut > 0\.0\) discard;/);
});

// The GPU cut keeps the same side as the CPU cut: (p[axis] - limit) * sign <= 0.
test('the section limit and the CPU cut agree', () => {
  const faces = [0, 1, 2, 3, 4].map(x => ({points: [[x, 0, 0], [x + 1, 0, 0], [x + 1, 1, 0]], color: '#808080'}));
  for (const reverse of [false, true]) {
    const plane = {axis: 0, percent: 50, reverse}, cut = sectionLimit(faces, plane);
    assert.deepEqual(cut, {axis: 0, limit: 2.5, sign: reverse ? -1 : 1});
    assert.deepEqual(sectionFaces(faces, plane), clipFaces(faces, cut));
    for (const face of clipFaces(faces, cut)) for (const p of face.points)
      assert.ok((p[0] - cut.limit) * cut.sign <= 1e-9);
  }
  assert.equal(sectionLimit(faces, {axis: 0, percent: 100}), null);
});
