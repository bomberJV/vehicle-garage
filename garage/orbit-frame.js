// Frames drawn while the camera orbits, zooms or the section plane slides.
//
// A full frame projects every vertex of the vehicle into new screen-space objects twice (camera,
// then framing), copies every face to carry them, and writes them all to the GPU again. On a
// 100,000-face vehicle that is far more than a frame's budget, and it runs for every pointer move.
// While an interaction is under way the world-space geometry stays on the GPU instead
// (gpuWorldRender) and only the camera transform and the view-dependent colours change. The
// framing is the full frame's own, computed with plain arithmetic. Picking, part frames and the
// hover cache are not kept current, so the renderer draws one full frame when the interaction ends
// and before anything picks.
import {componentProjection} from './selection-camera.js';

// Whether this frame can be drawn on the fast path; the full path handles everything else.
export function canOrbitFast(r) {
  const gl = r.gl, state = r.inspection || {};
  return Boolean(r.interacting && gl && !gl.isContextLost?.() && r.checkedDepthContext === gl && r.depthBufferBits >= 24 &&
    r.faces?.length && !r.focusPan && !r.focusTransition && !r.partPositions?.size && !r.drag?.move && !r.motion &&
    !r.returnMotion && !r.placementFrame && !(state.detailView && r.activeLayout?.canExpand) &&
    !((state.expanded || r.motion) && r.activeLayout));
}

// The camera fit for this frame, exactly as the full path computes it, and the world-to-screen
// transform as coefficients: x = X·p + X3, y = Y·p + Y3, depth = N·p.
export function orbitFrame(r, {w, h, rect, right, down, near, scale}) {
  const state = r.inspection || {};
  r.partFrames = new Map();
  r.hitFaces = r.faces;
  r.hitFacesStale = true;
  if (!state.assembly && !state.detailView && !state.onlyPart && !state.previewGroup) {
    r.overviewFrame = {vehicle: r.build.vehicle, faces: r.cameraFrameFaces || r.faces};
  }
  const preserve = r.keepAssemblyFrame && state.assembly && !state.detailView && !state.onlyPart &&
    r.overviewFrame?.vehicle === r.build.vehicle;
  const framePart = r.dragContext ? r.dragContext.part : state.part;
  const engineFocus = state.frameEngine && r.isolate && !state.onlyPart && !state.detailView && framePart !== 'engine.cooling';
  const frameFaces = (preserve ? r.overviewFrame.faces : r.cameraFrameFaces) || r.faces;
  const [r0, r1] = right, [d0, d1, d2] = down;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const f of frameFaces) {
    if (engineFocus && f.part === 'engine.cooling' && !(f.points[0][0] > 0)) continue;
    for (const p of f.points) {
      const x = w / 2 + (r0 * p[0] + r1 * p[1]) * scale, y = h * .65 + (d0 * p[0] + d1 * p[1] + d2 * p[2]) * scale;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const top = r.canvas.clientWidth > 0 && rect.height >= 360 ? 68 : 13, bottom = 35, usable = Math.max(1, h - top - bottom);
  r.placementArea = {left: 6, right: w - 6, top: top + 2, bottom: h - bottom - 2};
  const ratio = Math.min(w * .86 / Math.max(1, maxX - minX), usable * .90 / Math.max(1, maxY - minY)) * r.zoom;
  const pinned = componentProjection({ratio, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2}, r.selectionFocus, {right, down}, scale, w, h, usable);
  r.lastCamera = pinned; r.pixelScale = scale * pinned.ratio;
  const k = scale * pinned.ratio;
  const X = [r0 * k, r1 * k, 0], X3 = (w / 2 - pinned.cx) * pinned.ratio + w / 2;
  const Y = [d0 * k, d1 * k, d2 * k], Y3 = (h * .65 - pinned.cy) * pinned.ratio + top + usable / 2;
  const N = [near[0], near[1], near[2]];
  const project = p => ({x: X[0] * p[0] + X[1] * p[1] + X3, y: Y[0] * p[0] + Y[1] * p[1] + Y[2] * p[2] + Y3, depth: N[0] * p[0] + N[1] * p[1] + N[2] * p[2]});
  return {project, transform: {X, X3, Y, Y3, N}};
}
