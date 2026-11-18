// The studio's ground, floor grid, blueprint and drawing marks in the site's colour and mode.
// The garage canvas is left out of the site-wide canvas tint (theme.js) because paints and
// materials are real colours; only these interface colours follow the appearance menu. Each is
// designed in green, for the dark and the light mode, and moved to the chosen colour by the
// site's own colour rule. The light mode has its own designs rather than the rule's lightness
// flip, so a lit face stays lighter than a shaded one in the blueprint.
const DESIGN = {
  dark: {
    ground: ['#2f3931', '#141b16'],
    blueprint: ['#1d3a37', '#132926'],
    grid: '#7b8a7e20',
    blueprintGrid: '#5d97903b',
    // Blueprint faces run from the first colour (dark surfaces) to the second (light ones).
    ink: ['#15302d', '#549892'],
    label: '#91a58a',
    pick: '#b8cc68',
  },
  light: {
    ground: ['#f3f6f2', '#d9e1d9'],
    blueprint: ['#eaf4f2', '#cde1dd'],
    grid: '#4f625326',
    blueprintGrid: '#2f6b6340',
    ink: ['#3a766f', '#c4e3df'],
    label: '#4f6a48',
    pick: '#8ea53c',
  },
};

const site = () => (typeof pageTheme !== 'undefined' ? pageTheme : null);
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
let cached = null;

// The current palette: every colour in DESIGN for the chosen mode and colour, plus the blueprint
// ink ends as [r, g, b] arrays and a key that changes with the theme.
export function studioTheme() {
  const theme = site(), colour = theme?.colour || 'green', mode = theme?.mode === 'light' ? 'light' : 'dark';
  const key = colour + '-' + mode;
  if (cached?.key === key) return cached;
  const move = value => (theme?.convertTo ? theme.convertTo(colour, value) : value);
  const out = { key, mode };
  for (const [name, value] of Object.entries(DESIGN[mode])) out[name] = Array.isArray(value) ? value.map(move) : move(value);
  out.inkRgb = out.ink.map(rgb);
  cached = out;
  return out;
}

// A blueprint face for a surface of the given brightness (0 dark to 1 light).
export function blueprintInk(value) {
  const [a, b] = studioTheme().inkRgb;
  return a.map((v, i) => Math.round(v + (b[i] - v) * value));
}

// Calls fn whenever the colour or mode changes.
export function onStudioTheme(fn) {
  site()?.onChange(() => { cached = null; fn(); });
}
