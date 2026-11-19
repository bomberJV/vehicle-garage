// A cutaway shows one translucent exterior surface. Real panes on either side
// of it retain their depth, including panes that cross the skin within a face.
export const shellFragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
uniform highp sampler2D skinDepth;
#else
precision mediump float;
uniform mediump sampler2D skinDepth;
#endif
varying mediump vec4 tint;
varying mediump float cut;
uniform int layerMode;
uniform sampler2D skinColor;
uniform vec2 inverseSize;
void main() {
  if (cut > 0.0) discard;
  if (layerMode == 0) { gl_FragColor = tint; return; }
  vec2 uv = gl_FragCoord.xy * inverseSize;
  vec4 skin = texture2D(skinColor, uv);
  if (layerMode == 3) { gl_FragColor = skin; return; }
  bool behind = skin.a > 0.0 && gl_FragCoord.z >= texture2D(skinDepth, uv).r;
  if ((layerMode == 1) != behind) discard;
  gl_FragColor = tint;
}`;

export function bindShellTextures(gl,target,read) {
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D,read?target.depth:null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D,read?target.color:null);
}

export function shellTarget(renderer,width,height) {
  const {gl,program}=renderer;
  if(!renderer.shellTarget || renderer.shellTarget.gl!==gl) {
    const supported=gl.getExtension?.('WEBGL_depth_texture') &&
      gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT)?.precision>=23;
    const target={gl,supported};
    if(supported) {
      target.mode=gl.getUniformLocation(program,'layerMode');
      target.inverseSize=gl.getUniformLocation(program,'inverseSize');
      gl.uniform1i(gl.getUniformLocation(program,'skinColor'),0);
      gl.uniform1i(gl.getUniformLocation(program,'skinDepth'),1);
      target.framebuffer=gl.createFramebuffer();
      target.color=gl.createTexture();target.depth=gl.createTexture();
    }
    renderer.shellTarget=target;
  }
  const target=renderer.shellTarget;
  if(!target.supported)return null;
  if(target.width!==width||target.height!==height) {
    target.width=width;target.height=height;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);
    for(const [texture,format,type,attachment] of [
      [target.color,gl.RGBA,gl.UNSIGNED_BYTE,gl.COLOR_ATTACHMENT0],
      [target.depth,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,gl.DEPTH_ATTACHMENT]
    ]) {
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,format,width,height,0,format,type,null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,attachment,gl.TEXTURE_2D,texture,0);
    }
    target.complete=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE &&
      gl.getParameter(gl.DEPTH_BITS)>=24;
    gl.bindTexture(gl.TEXTURE_2D,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.uniform2f(target.inverseSize,1/width,1/height);
  }
  return target.complete?target:null;
}
