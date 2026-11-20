// Zoom slider for touch screens. A phone has no mouse wheel and no plus or minus keys, so the
// view gets a slider at the canvas's right edge, like the homepage globe's. It follows every
// other change to the zoom (wheel, keys, camera views, saved steps) as well as setting it.
export const ZOOM_MIN = .6;
export const ZOOM_MAX = 2.2;

export const clampZoom = value => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(value) || 1));
export const zoomLabel = value => `${clampZoom(value).toFixed(1)}×`;

export function bindZoomSlider(renderer, input, output) {
  if (!renderer || !input) return null;
  input.min = String(ZOOM_MIN);
  input.max = String(ZOOM_MAX);
  let zoom = clampZoom(renderer.zoom);
  const show = () => {
    input.value = String(zoom);
    if (output) output.textContent = zoomLabel(zoom);
  };
  // The renderer and app set renderer.zoom directly in many places, so watch the property itself.
  Object.defineProperty(renderer, 'zoom', {
    configurable: true,
    enumerable: true,
    get: () => zoom,
    set: value => { zoom = Number(value); show(); },
  });
  input.addEventListener('input', () => {
    renderer.focusPan = null;
    renderer.zoom = clampZoom(input.value);
    // Same draw path as the mouse wheel: the fast orbit frame while sliding, a full frame after.
    if (typeof renderer.beginInteraction === 'function') {
      renderer.beginInteraction(); renderer.requestDraw(); renderer.endInteraction(180);
    } else renderer.draw();
  });
  show();
  return { show };
}
