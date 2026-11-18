// Fast paint previews for the colour picker.
//
// A paint change normally rebuilds the whole vehicle: every exterior, cabin and service drawing
// runs again only to pass the new colour through the tints and shades it derives from the paint.
// While the picker is being dragged that rebuild runs dozens of times a second. Instead the
// vehicle is built once with each of two light grey probe paints. Every surface whose colour differs
// between them follows the paint; each of its channels is fitted as scale × paint + offset, which
// is exact for the shades, tones and mixes the drawings use. A preview then recolours the probe
// geometry without drawing anything. The exact build runs again when the picker settles, so a
// surface whose colour the fit cannot follow is only approximate for the length of a drag.
// Light enough that no two shades of a probe round to the same value (the 993's skin merges
// vertices of equal colour), and dark enough that the brightest shade does not clip at white.
export const PROBES = ['#808080', '#b0b0b0'];
const LOW = 0x80, SPAN = 0xb0 - LOW;
const HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

function fit(low, high) {
  if (low === high) return low;
  const a = HEX.exec(low), b = HEX.exec(high);
  if (!a || !b || (a[2] || '') !== (b[2] || '')) return undefined;
  const channels = [0, 2, 4].map(i => {
    const p = parseInt(a[1].slice(i, i + 2), 16), q = parseInt(b[1].slice(i, i + 2), 16);
    const scale = (q - p) / SPAN;
    return [scale, p - LOW * scale];
  });
  return { channels, alpha: a[2] || '' };
}

function colourOf(model, rgb) {
  if (typeof model === 'string') return model;
  return '#' + model.channels.map(([scale, offset], i) =>
    Math.max(0, Math.min(255, Math.round(scale * rgb[i] + offset))).toString(16).padStart(2, '0')).join('') + model.alpha;
}

const samePlace = (a, b) => a.points.length === b.points.length && a.part === b.part &&
  a.points[0]?.[0] === b.points[0]?.[0] && a.points[0]?.[1] === b.points[0]?.[1] && a.points[0]?.[2] === b.points[0]?.[2];

// The recolouring for two builds of the same vehicle at the two probe paints, or null when the
// builds do not line up surface for surface (the drawing depends on the paint in another way).
export function paintModel(low, high) {
  if (!low || !high || low.length !== high.length) return null;
  const surfaces = [];
  for (let i = 0; i < low.length; i++) {
    const a = low[i], b = high[i];
    if (!samePlace(a, b)) return null;
    const color = fit(a.color, b.color);
    if (color === undefined) return null;
    let vertex = null;
    if (a.vertexColors || b.vertexColors) {
      if (a.vertexColors?.length !== b.vertexColors?.length) return null;
      vertex = a.vertexColors.map((c, j) => fit(c, b.vertexColors[j]));
      if (vertex.includes(undefined)) return null;
      if (vertex.every(v => typeof v === 'string')) vertex = null;
    }
    surfaces.push(typeof color === 'string' && !vertex ? null : { color, vertex });
  }
  return hex => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    return low.map((face, i) => {
      const s = surfaces[i];
      if (!s) return face;
      const out = { ...face, color: colourOf(s.color, rgb) };
      delete out.projected;
      if (s.vertex) out.vertexColors = s.vertex.map(v => colourOf(v, rgb));
      return out;
    });
  };
}
