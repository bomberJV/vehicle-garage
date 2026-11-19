// The depth renderer's vertex shader.
//
// Screen-space draws (gpuDepthRender, glass, the shell overlay) send clip-space positions and
// finished colours: `view` is the identity, `shade.w` is 0 and `clip` is zero. The orbit path
// (gpuWorldRender) keeps world-space triangles on the GPU and sends only the camera as `view`, the
// unit eye vector and the section plane. Its paint lighting runs here, the same formulas as
// studioPaintReflection (studio-finish.js) and the clear-coat in surfaceShading
// (surface-materials.js), chosen per vertex by `shade.w`:
//   0 the colour as given, 1 clear coat, 2 studio paint, 3 studio alloy;
// `shade.xyz` is the surface normal. `cut` is positive past the section plane; the fragment
// shader discards there.
export const depthVertexShader = `
uniform mat4 view;
uniform vec3 eye;
uniform vec4 clip;
attribute vec3 position;
attribute vec4 color;
attribute vec4 shade;
varying mediump vec4 tint;
varying mediump float cut;
float band(float x, float center, float width) { float t = (x - center) / width; return exp(-t * t); }
vec3 clearCoat(vec3 base, vec3 n) {
  float facing = clamp(dot(n, eye), 0.0, 1.0);
  float altitude = 2.0 * facing * n.z - eye.z;
  float softbox = band(altitude, 0.42, 0.23);
  float sky = max(0.0, altitude);
  float light = (0.06 + 0.40 * pow(1.0 - facing, 4.0)) * (0.16 * sky + 0.84 * softbox);
  return base + (vec3(239.0, 243.0, 247.0) / 255.0 - base) * light;
}
vec3 studioPaint(vec3 base, vec3 n, float alloy) {
  float d = dot(n, eye);
  float facing = abs(d), side = d < 0.0 ? -1.0 : 1.0;
  vec3 r = 2.0 * facing * n * side - eye;
  float ceiling = clamp((r.z + 0.06) / 0.47, 0.0, 1.0);
  float strip = band(r.z, 0.17 + 0.06 * r.x, 0.24) * (0.73 + 0.27 * abs(r.y));
  float floorLight = clamp((-r.z - 0.24) / 0.67, 0.0, 1.0);
  float darkWall = band(r.z, -0.17, 0.24);
  float grazing = pow(1.0 - clamp(facing, 0.0, 1.0), 4.0);
  float illumination = 0.87 + 0.14 * ceiling - 0.17 * darkWall + 0.07 * floorLight + 0.06 * strip;
  float reflected = 0.025 + 0.10 * ceiling + 0.19 * strip + 0.18 * grazing;
  float amount = clamp(reflected * alloy, 0.0, 0.76);
  vec3 sky = vec3(218.0, 230.0, 241.0) / 255.0, ground = vec3(175.0, 159.0, 144.0) / 255.0;
  vec3 environment = sky + (ground - sky) * floorLight;
  return clamp(base * illumination * (1.0 - amount) + environment * amount, 0.0, 1.0);
}
void main() {
  gl_Position = view * vec4(position, 1.0);
  cut = dot(clip.xyz, position) + clip.w;
  vec3 rgb = color.rgb;
  if (shade.w > 0.5) {
    vec3 n = normalize(shade.xyz);
    rgb = shade.w < 1.5 ? clearCoat(rgb, n) : studioPaint(rgb, n, shade.w > 2.5 ? 1.33 : 1.0);
  }
  tint = vec4(rgb, color.a);
}`;
