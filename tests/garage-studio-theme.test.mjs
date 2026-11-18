import test from 'node:test';
import assert from 'node:assert/strict';

// The studio's ground, grid and blueprint follow the website's colour and mode when the page has
// the site theme (pageTheme), and keep the green designs when the garage runs on its own.
test('studio colours keep the green designs without the site theme', async () => {
  const {studioTheme, blueprintInk} = await import('../garage/studio-theme.js?standalone');
  const theme = studioTheme();
  assert.equal(theme.mode, 'dark');
  assert.deepEqual(theme.ground, ['#2f3931', '#141b16']);
  assert.deepEqual(blueprintInk(0), [21, 48, 45]);
  assert.deepEqual(blueprintInk(1), [84, 152, 146]);
});

test('studio colours move with the site colour and use the light designs in light mode', async () => {
  const listeners = [];
  globalThis.pageTheme = {
    colour: 'blue', mode: 'light',
    convertTo: (colour, value) => colour + ':' + value,
    onChange: fn => listeners.push(fn),
  };
  try {
    const {studioTheme, onStudioTheme} = await import('../garage/studio-theme.js?themed');
    const light = studioTheme();
    assert.equal(light.key, 'blue-light');
    assert.equal(light.blueprint[0], 'blue:#eaf4f2');
    assert.equal(light.grid, 'blue:#4f625326');
    let redrawn = 0;
    onStudioTheme(() => redrawn++);
    globalThis.pageTheme.colour = 'red'; globalThis.pageTheme.mode = 'dark';
    listeners.forEach(fn => fn());
    assert.equal(redrawn, 1);
    assert.equal(studioTheme().ground[1], 'red:#141b16');
  } finally {
    delete globalThis.pageTheme;
  }
});
