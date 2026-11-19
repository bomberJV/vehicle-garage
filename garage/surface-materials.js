import {faceTriangles} from './mesh-triangles.js';
import {hasStudioFinish,studioPaintReflection,studioSurfaceFinish,planeNormal} from './studio-finish.js';
import {glassOrder} from './glass-order.js';
import {blueprintInk,studioTheme} from './studio-theme.js';
import {clipFaces} from './section-plane.js';
import {shellTarget,bindShellTextures} from './shell-depth.js';

// Mark a pane independently of its parent assembly. Trim and rubber remain opaque.
export function glazingFace(r, points, color, opacity = .27) {
  r.polygon(points, color, false);
  const surface = r.faces?.at(-1);
  if (surface) surface.opacity = opacity;
}

const palette=new Map(),studioLight=[239,243,247];
function rgbOf(hex){
  let rgb=palette.get(hex);
  if(!rgb){const n=parseInt(hex.slice(1),16);rgb=[n>>16,(n>>8)&255,n&255];palette.set(hex,rgb);}
  return rgb;
}

// The view-dependent colours of a frame: the eye vector, each face's colour and each painted
// vertex's clear-coat reflection. Shared by the full and the orbit (gpuWorldRender) paths.
function surfaceShading(renderer,project) {
  // The orthographic eye vector is constant across the scene. A painted
  // shoulder reflects more of the overhead studio light as the camera orbits.
  const z0=project([0,0,0]).depth;
  const eye=[[1,0,0],[0,1,0],[0,0,1]].map(p=>project(p).depth-z0);
  const length=Math.hypot(...eye)||1,view=eye.map(v=>v/length),coats=new WeakMap();
  const studio=hasStudioFinish(renderer.build?.vehicle);
  const reflected=(base,n)=>{
    if(!n)return base;
    const cached=coats.get(n);
    if(cached&&cached.base===base)return cached.color;
    if(studio){
      const color=studioPaintReflection(base,n,view);
      coats.set(n,{base,color});return color;
    }
    let light=cached?.strength;
    if(light===undefined){
      const facing=Math.max(0,n[0]*view[0]+n[1]*view[1]+n[2]*view[2]);
      const altitude=2*facing*n[2]-view[2];
      const softbox=Math.exp(-(((altitude-.42)/.23)**2));
      const sky=Math.max(0,altitude);
      light=(.06+.40*(1-facing)**4)*(.16*sky+.84*softbox);
    }
    const color=base.map((v,i)=>v+(studioLight[i]-v)*light);
    coats.set(n,{base,color,strength:light});
    return color;
  };
  const rgbFor=face=>{
    const color=rgbOf(face.color);
    if(face.highlighted)return color;
    if(!renderer.blueprint)return studio&&!face.ghostShell?studioSurfaceFinish(face,color,view):color;
    return blueprintInk((.21*color[0]+.72*color[1]+.07*color[2])/255);
  };
  return {eye,rgbFor,reflected};
}

function splitSurfaces(renderer,project,width,height) {
  const opaque=[],panes=[],paneIndices=[],shell=[];
  let min=Infinity,max=-Infinity;
  const faces=renderer.hitFaces||renderer.faces;
  const {eye,rgbFor,reflected}=surfaceShading(renderer,project);
  for(const face of faces){
    const opacity=face.opacity??1;
    if(opacity<=0)continue;
    const points=face.projected || face.points.map(project);
    let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity,near=-Infinity,far=Infinity;
    for(const p of points){
      left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y);
      far=Math.min(far,p.depth);near=Math.max(near,p.depth);
    }
    // Offscreen parts otherwise consume depth precision even though the GPU
    // ultimately clips them. This matters on a magnified or exploded model.
    if(right<0||left>width||bottom<0||top>height)continue;
    const indices=face.triangles || faceTriangles(face.points);
    if(!indices.length)continue;
    min=Math.min(min,far);max=Math.max(max,near);
    if(face.ghostShell){shell.push({ps:points,rgb:rgbFor(face),opacity,indices});continue;}
    if(opacity<1){panes.push(face);paneIndices.push(indices);continue;}
    const gradient=face.vertexColors && !renderer.blueprint && !face.highlighted ?
      face.vertexColors.map((hex,i)=>reflected(rgbOf(hex),face.clearcoatNormals?.[i])):null;
    opaque.push({ps:points,rgb:rgbFor(face),gradient,opacity,indices,face});
  }
  const glass=[];
  if(panes.length){
    // Depth is a linear function of position under this orthographic projection.
    const colors=panes.map(rgbFor);
    for(const item of glassOrder(panes,paneIndices,eye,renderer)){
      const face=panes[item.face];
      glass.push({ps:item.points.map(project),rgb:colors[item.face],gradient:null,opacity:face.opacity,
        indices:faceTriangles(item.points)});
    }
  }
  const mid=Number.isFinite(min)?(min+max)*.5:0;
  return {opaque,glass,shell,mid,range:Math.max((max-min)*.501,1e-7)};
}

function composite(pixels, j, rgb, alpha) {
  const under = (1 - alpha) * (pixels[j+3] / 255);
  const result = alpha + under;
  for (let c=0;c<3;c++) pixels[j+c]=(rgb[c]*alpha+pixels[j+c]*under)/result;
  pixels[j+3] = result * 255;
}

function rasterSurface(surface, width, height, pixels, depth,{skin,owners,faceIndex,shellDepth,behind,transmission}={}) {
  const {ps,rgb,opacity,indices,gradient}=surface;
  for(let k=0;k<indices.length;k+=3){
    const ia=indices[k],ib=indices[k+1],ic=indices[k+2];
    const a=ps[ia],b=ps[ib],c=ps[ic];
    const den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
    if(Math.abs(den)<.001)continue;
    const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))), x1=Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))), y1=Math.min(height-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    // A shared boundary belongs to only one triangle. Otherwise a diagonal in
    // a transparent quad receives a second coat of tint.
    const topLeft=(p,q)=>den>0?(p.y<q.y||(p.y===q.y&&p.x>q.x)):(p.y>q.y||(p.y===q.y&&p.x<q.x));
    const edges=opacity===1?null:[topLeft(b,c),topLeft(c,a),topLeft(a,b)];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++) {
      const u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/den;
      const v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/den,t=1-u-v;
      if(u< -1e-10||v< -1e-10||t< -1e-10)continue;
      if(edges&&((u<1e-10&&!edges[0])||(v<1e-10&&!edges[1])||(t<1e-10&&!edges[2])))continue;
      const z=u*a.depth+v*b.depth+t*c.depth,i=y*width+x;
      if(z<=depth[i])continue;
      const j=i*4;
      if(shellDepth && (z<=shellDepth[i])!==behind)continue;
      if(owners)owners[i]=faceIndex;
      if(skin){
        depth[i]=z;skin[j]=rgb[0];skin[j+1]=rgb[1];skin[j+2]=rgb[2];skin[j+3]=Math.round(opacity*255);continue;
      }
      if(opacity===1) {
        depth[i]=z;
        if(gradient){
          for(let ch=0;ch<3;ch++)pixels[j+ch]=u*gradient[ia][ch]+v*gradient[ib][ch]+t*gradient[ic][ch];
        }else{pixels[j]=rgb[0];pixels[j+1]=rgb[1];pixels[j+2]=rgb[2];}
        pixels[j+3]=255;
      } else {
        composite(pixels,j,rgb,opacity);
        if(transmission)transmission[i]*=1-opacity;
      }
    }
  }
}

export function softwareDepthRender(renderer,w,h,project) {
  const width=Math.ceil(w),height=Math.ceil(h);
  if(renderer.cpuWidth!==width||renderer.cpuHeight!==height) {
    renderer.cpuWidth=width;renderer.cpuHeight=height;
    renderer.cpuPixels=new ImageData(width,height);renderer.cpuDepth=new Float64Array(width*height);
  }
  const {cpuPixels, cpuDepth}=renderer;
  cpuPixels.data.fill(0);cpuDepth.fill(-Infinity);
  const {opaque,glass,shell}=splitSurfaces(renderer,project,w,h);
  const hover=renderer.captureHover&&shell.length>0;
  const owners=hover?new Int32Array(width*height).fill(-1):null;
  for(let n=0;n<opaque.length;n++)rasterSurface(opaque[n],width,height,cpuPixels.data,cpuDepth,{owners,faceIndex:n});
  const base=hover?cpuPixels.data.slice():null;
  const transmission=hover?new Float32Array(width*height).fill(1):null;
  let shellDepth;
  if(shell.length){
    const size=width*height*4;
    if(renderer.shellPixels?.length!==size){
      renderer.shellPixels=new Uint8Array(size);renderer.shellDepth=new Float64Array(width*height);
    }
    const skin=renderer.shellPixels;skin.fill(0);
    shellDepth=renderer.shellDepth;shellDepth.set(cpuDepth);
    for(const f of shell)rasterSurface(f,width,height,cpuPixels.data,shellDepth,{skin});
    for(const f of glass)rasterSurface(f,width,height,cpuPixels.data,cpuDepth,{shellDepth,behind:true,transmission});
    for(let j=0;j<size;j+=4)if(skin[j+3]){
      const alpha=skin[j+3]/255;
      composite(cpuPixels.data,j,skin.subarray(j,j+3),alpha);
      if(transmission)transmission[j/4]*=1-alpha;
    }
  }
  for(const f of glass)rasterSurface(f,width,height,cpuPixels.data,cpuDepth,{shellDepth,behind:false,transmission});
  renderer.hoverRaster=null;
  if(hover){
    // A lens and its retaining frame can share a part. Hovering such a part
    // changes a translucent layer itself and requires the full material pass.
    const translucentParts=new Set();
    for(const face of renderer.hitFaces||renderer.faces)if(face.opacity>0&&face.opacity<1){
      translucentParts.add(face.pickPart||face.part);
    }
    renderer.hoverRaster={owners,faces:opaque.map(f=>f.face),base,transmission,translucentParts,
      source:cpuPixels.data.slice(),width,height};
  }
  if(!renderer.cpuSurface)renderer.cpuSurface=document.createElement('canvas');
  if(renderer.cpuSurface.width!==width||renderer.cpuSurface.height!==height){renderer.cpuSurface.width=width;renderer.cpuSurface.height=height;}
  renderer.cpuSurface.getContext('2d').putImageData(cpuPixels,0,0);
  renderer.ctx.drawImage(renderer.cpuSurface,0,0,w,h);renderer.canvas.dataset.renderer='software-depth';
  return true;
}

// Recolor only visible pixels of a hovered solid in a static software-rendered
// cutaway. The ownership buffer was written by the same depth test as the
// displayed image. Scale the change in the solid by the transmission of all
// nearer glass and exterior layers, preserving their tint and depth order.
export function recolorHover(renderer,hit,w,h){
  const raster=renderer.hoverRaster;
  if(!raster || (hit&&raster.translucentParts.has(hit.part)))return false;
  const {owners,faces,base,transmission,source,width,height}=raster;
  const pixels=renderer.cpuPixels.data;pixels.set(source);
  if(hit){
    const colors=faces.map(f=>{
      if(f.part!==hit.part&&f.pickPart!==hit.part)return null;
      if(hit.instance&&hit.instance!==(f.instance||f.rigid?.name))return null;
      const k=.65+.4*parseInt(f.color.slice(1,3),16)/255;
      return [184,204,104].map(v=>Math.round(v*k));
    });
    if(!colors.some(Boolean))return false;
    for(let i=0;i<owners.length;i++){
      const rgb=colors[owners[i]];
      if(!rgb)continue;
      const j=i*4;
      for(let c=0;c<3;c++)pixels[j+c]=source[j+c]+(rgb[c]-base[j+c])*transmission[i];
    }
  }
  if(renderer.cpuSurface.width!==width||renderer.cpuSurface.height!==height)return false;
  renderer.cpuSurface.getContext('2d').putImageData(renderer.cpuPixels,0,0);
  renderer.ctx.drawImage(renderer.cpuSurface,0,0,w,h);return true;
}

export function gpuDepthRender(renderer,w,h,dpr,project) {
  const {gl}=renderer;
  if(!gl||gl.isContextLost())return renderer.softwareRender(w,h,project);
  // WebGL 1 also runs on devices with 16-bit (or unavailable) depth buffers.
  // Sub-millimetre trim, glazing and attachment faces can collapse to the same
  // cell there and then draw in submission order. The Float64 fallback keeps
  // those layers and their highlights attached to their actual positions.
  if(renderer.checkedDepthContext!==gl){
    renderer.checkedDepthContext=gl;
    renderer.depthBufferBits=gl.getParameter?gl.getParameter(gl.DEPTH_BITS):24;
  }
  if(renderer.depthBufferBits<24)return renderer.softwareRender(w,h,project);
  renderer.hoverRaster=null;
  renderer.canvas.dataset.renderer='webgl-depth';
  const width=Math.round(w*dpr),height=Math.round(h*dpr);
  if(renderer.surface.width!==width||renderer.surface.height!==height){renderer.surface.width=width;renderer.surface.height=height;}
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.depthMask(true);gl.clearDepth(1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.useProgram(renderer.program);
  // Screen-space vertices; an orbit frame (gpuWorldRender) may have left its camera state set.
  screenState(gl,renderer);
  const {opaque,glass,shell,mid,range}=splitSurfaces(renderer,project,w,h);
  const count=surfaces=>surfaces.reduce((sum,face)=>sum+face.indices.length,0);
  const opaqueCount=count(opaque),glassCount=count(glass),shellCount=count(shell),total=opaqueCount+glassCount+shellCount;
  const target=shellCount?shellTarget(renderer,width,height):null;
  if(shellCount&&!target)return renderer.softwareRender(w,h,project);
  const capacity=total+(target?3:0);
  if(!renderer.vertices||renderer.vertices.length<capacity*7)renderer.vertices=new Float32Array(Math.ceil(capacity*7*1.08));
  const vertices=renderer.vertices;let pos=0;
  const write=surfaces=>{
    for(const {ps,rgb,opacity,indices,gradient} of surfaces){
      for(const index of indices){
        const p=ps[index],color=gradient?gradient[index]:rgb;
        vertices[pos++]=p.x/w*2-1;vertices[pos++]=1-p.y/h*2;vertices[pos++]=(mid-p.depth)/range;
        vertices[pos++]=color[0]/255;vertices[pos++]=color[1]/255;vertices[pos++]=color[2]/255;vertices[pos++]=opacity;
      }
    }
  };
  write(opaque);write(glass);write(shell);
  if(target){
    // A single screen-covering triangle applies the nearest shell once, including shared/coplanar faces.
    vertices.set([-1,-1,0,0,0,0,1, 3,-1,0,0,0,0,1, -1,3,0,0,0,0,1],pos);pos+=21;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,renderer.buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices.subarray(0,pos),gl.DYNAMIC_DRAW);
  for(const [name,size,offset] of [['position',3,0],['color',4,12]]){
    const loc=gl.getAttribLocation(renderer.program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,28,offset);
  }
  gl.disable(gl.BLEND);
  if(target){
    // Resolve the one visible exterior skin against solids into matching color/depth textures.
    // The main pass can then insert that skin between intersecting panes at each pixel.
    gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);
    bindShellTextures(gl,target,false);
    gl.uniform1i(target.mode,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.colorMask(false,false,false,false);gl.drawArrays(gl.TRIANGLES,0,opaqueCount);
    gl.colorMask(true,true,true,true);gl.drawArrays(gl.TRIANGLES,opaqueCount+glassCount,shellCount);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    bindShellTextures(gl,target,true);
  }
  gl.drawArrays(gl.TRIANGLES,0,opaqueCount);
  if(glassCount||target){
    gl.depthMask(false);gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    if(target){
      if(glassCount){
        gl.uniform1i(target.mode,1);
        gl.drawArrays(gl.TRIANGLES,opaqueCount,glassCount);
      }
      gl.disable(gl.DEPTH_TEST);gl.uniform1i(target.mode,3);
      gl.drawArrays(gl.TRIANGLES,total,3);
      gl.enable(gl.DEPTH_TEST);gl.uniform1i(target.mode,2);
    }
    if(glassCount)gl.drawArrays(gl.TRIANGLES,opaqueCount,glassCount);
    if(target)gl.uniform1i(target.mode,0);
    gl.depthMask(true);gl.disable(gl.BLEND);
  }
  renderer.ctx.drawImage(renderer.surface,0,0,w,h);return true;
}

// The orbit path (orbit-frame.js). The vehicle's world-space triangles stay in GPU buffers for as
// long as the face list is the same, with each vertex's base colour, surface normal and lighting
// kind (depth-vertex.js). A frame sends only the camera transform, the eye vector and the section
// plane; the shader lights the paint. Glass is still sorted and projected here each frame, as in
// gpuDepthRender.
const IDENTITY=new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
const FLAT=0,CLEAR_COAT=1,STUDIO_PAINT=2,STUDIO_ALLOY=3;

function worldGeometry(renderer,gl,faces){
  const studio=hasStudioFinish(renderer.build?.vehicle),blueprint=Boolean(renderer.blueprint);
  let geo=renderer.worldGeometry;
  if(geo?.faces===faces&&geo.studio===studio&&geo.blueprint===blueprint&&geo.theme===studioTheme().key)return geo;
  const opaque=[],shell=[],panes=[],paneIndices=[];let opaqueCount=0,shellCount=0;
  for(const face of faces){
    const opacity=face.opacity??1;
    if(opacity<=0)continue;
    const indices=face.triangles||faceTriangles(face.points);
    if(!indices.length)continue;
    if(face.ghostShell){shell.push({face,indices,opacity});shellCount+=indices.length;continue;}
    if(opacity<1){panes.push(face);paneIndices.push(indices);continue;}
    opaque.push({face,indices});opaqueCount+=indices.length;
  }
  const total=opaqueCount+shellCount;
  const positions=new Float32Array(total*3),colors=new Uint8Array(total*4),shades=new Float32Array(total*4);
  let v=0;
  const put=(p,rgb,alpha,n,kind)=>{
    positions[v*3]=p[0];positions[v*3+1]=p[1];positions[v*3+2]=p[2];
    colors[v*4]=rgb[0];colors[v*4+1]=rgb[1];colors[v*4+2]=rgb[2];colors[v*4+3]=Math.round(alpha*255);
    if(n){shades[v*4]=n[0];shades[v*4+1]=n[1];shades[v*4+2]=n[2];}
    shades[v*4+3]=kind;v++;
  };
  const ink=rgb=>blueprintInk((.21*rgb[0]+.72*rgb[1]+.07*rgb[2])/255);
  for(const {face,indices} of opaque){
    const base=rgbOf(face.color);
    if(face.highlighted){for(const i of indices)put(face.points[i],base,1,null,FLAT);continue;}
    if(blueprint){const rgb=ink(base);for(const i of indices)put(face.points[i],rgb,1,null,FLAT);continue;}
    if(face.vertexColors){
      // As splitSurfaces: each painted vertex reflects the studio through its clear-coat normal.
      for(const i of indices){
        const n=face.clearcoatNormals?.[i];
        put(face.points[i],rgbOf(face.vertexColors[i]),1,n,n?(studio?STUDIO_PAINT:CLEAR_COAT):FLAT);
      }
      continue;
    }
    // As studioSurfaceFinish: bright rim spokes take the studio's alloy reflection.
    if(studio&&face.part==='running.rims'&&Math.max(...base)>=122){
      const n=planeNormal(face.points);
      for(const i of indices)put(face.points[i],base,1,n,STUDIO_ALLOY);
      continue;
    }
    for(const i of indices)put(face.points[i],base,1,null,FLAT);
  }
  for(const {face,indices,opacity} of shell){
    const base=rgbOf(face.color),rgb=blueprint&&!face.highlighted?ink(base):base;
    for(const i of indices)put(face.points[i],rgb,opacity,null,FLAT);
  }
  // Each face's bounding sphere, for the depth range of the faces on screen.
  const all=[...opaque.map(o=>o.face),...shell.map(o=>o.face),...panes],spheres=new Float64Array(all.length*4);
  all.forEach((face,k)=>{
    let x0=Infinity,y0=Infinity,z0=Infinity,x1=-Infinity,y1=-Infinity,z1=-Infinity;
    for(const p of face.points){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];if(p[2]<z0)z0=p[2];if(p[2]>z1)z1=p[2];}
    spheres[k*4]=(x0+x1)/2;spheres[k*4+1]=(y0+y1)/2;spheres[k*4+2]=(z0+z1)/2;spheres[k*4+3]=Math.hypot(x1-x0,y1-y0,z1-z0)/2;
  });
  geo={faces,studio,blueprint,theme:studioTheme().key,panes,paneIndices,opaqueCount,shellCount,spheres,
    positionBuffer:geo?.positionBuffer||gl.createBuffer(),colorBuffer:geo?.colorBuffer||gl.createBuffer(),shadeBuffer:geo?.shadeBuffer||gl.createBuffer()};
  gl.bindBuffer(gl.ARRAY_BUFFER,geo.positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,positions,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,geo.colorBuffer);gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,geo.shadeBuffer);gl.bufferData(gl.ARRAY_BUFFER,shades,gl.STATIC_DRAW);
  renderer.worldGeometry=geo;return geo;
}

// Builds the GPU copy ahead of an orbit when the browser is idle, so the first drag frame does not
// pay for it. Only for an uncut, 24-bit WebGL view: the orbit path uses that same face list.
export function prepareWorldGeometry(renderer){
  const {gl}=renderer;
  if(!gl||gl.isContextLost?.()||renderer.depthBufferBits<24||renderer.sectionPlane||!renderer.faces?.length)return;
  worldGeometry(renderer,gl,renderer.faces);
}

// Back to screen-space drawing after an orbit frame.
function screenState(gl,renderer){
  if(!renderer.viewMatrixSet)return;
  gl.uniformMatrix4fv(renderer.viewUniform,false,IDENTITY);
  gl.uniform4f(renderer.clipUniform,0,0,0,0);
  if(renderer.shadeAttribute>=0){gl.disableVertexAttribArray(renderer.shadeAttribute);gl.vertexAttrib4f(renderer.shadeAttribute,0,0,0,0);}
  renderer.viewMatrixSet=false;
}

export function gpuWorldRender(renderer,w,h,dpr,project,transform) {
  const {gl}=renderer;
  renderer.hoverRaster=null;
  renderer.canvas.dataset.renderer='webgl-depth';
  const width=Math.round(w*dpr),height=Math.round(h*dpr);
  if(renderer.surface.width!==width||renderer.surface.height!==height){renderer.surface.width=width;renderer.surface.height=height;}
  const cut=renderer.deferredSection;
  const geo=worldGeometry(renderer,gl,renderer.faces);
  const target=geo.shellCount?shellTarget(renderer,width,height):null;
  if(geo.shellCount&&!target)return renderer.softwareRender(w,h,project);
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.depthMask(true);gl.clearDepth(1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.useProgram(renderer.program);
  // Depth range of the faces on screen, from each face's bounding sphere.
  const {X,X3,Y,Y3,N}=transform,spheres=geo.spheres,reach=Math.hypot(X[0],X[1],X[2]);
  let min=Infinity,max=-Infinity;
  for(let k=0;k<spheres.length;k+=4){
    const cx=spheres[k],cy=spheres[k+1],cz=spheres[k+2],r=spheres[k+3],sr=r*reach;
    const x=X[0]*cx+X[1]*cy+X3,y=Y[0]*cx+Y[1]*cy+Y[2]*cz+Y3;
    if(x+sr<0||x-sr>w||y+sr<0||y-sr>h)continue;
    const d=N[0]*cx+N[1]*cy+N[2]*cz;
    if(d-r<min)min=d-r;if(d+r>max)max=d+r;
  }
  const mid=Number.isFinite(min)?(min+max)*.5:0,range=Math.max((max-min)*.501,1e-7);
  // Glass, cut and sorted for this view, and the shell's screen-covering triangle, in screen space.
  const {eye,rgbFor}=surfaceShading(renderer,project);
  let glassCount=0,pos=0;
  const glass=[];
  if(geo.panes.length){
    let panes=geo.panes,paneIndices=geo.paneIndices;
    if(cut){panes=clipFaces(panes,cut);paneIndices=panes.map(face=>face.triangles||faceTriangles(face.points));}
    const paneColors=panes.map(rgbFor);
    for(const item of glassOrder(panes,paneIndices,eye,renderer)){
      const face=panes[item.face];
      glass.push({ps:item.points.map(project),rgb:paneColors[item.face],opacity:face.opacity,indices:faceTriangles(item.points)});
    }
    for(const surface of glass)glassCount+=surface.indices.length;
  }
  const capacity=glassCount+(target?3:0);
  if(!renderer.vertices||renderer.vertices.length<capacity*7)renderer.vertices=new Float32Array(Math.ceil(capacity*7*1.08));
  const vertices=renderer.vertices;
  for(const {ps,rgb,opacity,indices} of glass)for(const index of indices){
    const p=ps[index];
    vertices[pos++]=p.x/w*2-1;vertices[pos++]=1-p.y/h*2;vertices[pos++]=(mid-p.depth)/range;
    vertices[pos++]=rgb[0]/255;vertices[pos++]=rgb[1]/255;vertices[pos++]=rgb[2]/255;vertices[pos++]=opacity;
  }
  if(target){vertices.set([-1,-1,0,0,0,0,1, 3,-1,0,0,0,0,1, -1,3,0,0,0,0,1],pos);pos+=21;}
  if(pos){gl.bindBuffer(gl.ARRAY_BUFFER,renderer.buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices.subarray(0,pos),gl.DYNAMIC_DRAW);}
  // World to clip space: x and y from the camera fit, z from the depth range.
  const world=new Float32Array([
    X[0]*2/w,-Y[0]*2/h,-N[0]/range,0,
    X[1]*2/w,-Y[1]*2/h,-N[1]/range,0,
    X[2]*2/w,-Y[2]*2/h,-N[2]/range,0,
    X3*2/w-1,1-Y3*2/h,mid/range,1]);
  const length=Math.hypot(...N)||1;
  const position=gl.getAttribLocation(renderer.program,'position'),tint=gl.getAttribLocation(renderer.program,'color'),shade=renderer.shadeAttribute;
  gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(tint);
  const resident=()=>{
    gl.uniformMatrix4fv(renderer.viewUniform,false,world);renderer.viewMatrixSet=true;
    gl.uniform3f(renderer.eyeUniform,N[0]/length,N[1]/length,N[2]/length);
    // The kept side is (p[axis] - limit) * sign <= 0; the shader discards where it is positive.
    if(cut){const plane=[0,0,0];plane[cut.axis]=cut.sign;gl.uniform4f(renderer.clipUniform,plane[0],plane[1],plane[2],-cut.limit*cut.sign);}
    else gl.uniform4f(renderer.clipUniform,0,0,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,geo.positionBuffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,12,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,geo.colorBuffer);gl.vertexAttribPointer(tint,4,gl.UNSIGNED_BYTE,true,4,0);
    gl.enableVertexAttribArray(shade);
    gl.bindBuffer(gl.ARRAY_BUFFER,geo.shadeBuffer);gl.vertexAttribPointer(shade,4,gl.FLOAT,false,16,0);
  };
  const screen=()=>{
    screenState(gl,renderer);
    gl.bindBuffer(gl.ARRAY_BUFFER,renderer.buffer);
    gl.vertexAttribPointer(position,3,gl.FLOAT,false,28,0);gl.vertexAttribPointer(tint,4,gl.FLOAT,false,28,12);
  };
  const {opaqueCount,shellCount}=geo;
  gl.disable(gl.BLEND);
  resident();
  if(target){
    gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);
    bindShellTextures(gl,target,false);
    gl.uniform1i(target.mode,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.colorMask(false,false,false,false);gl.drawArrays(gl.TRIANGLES,0,opaqueCount);
    gl.colorMask(true,true,true,true);gl.drawArrays(gl.TRIANGLES,opaqueCount,shellCount);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    bindShellTextures(gl,target,true);
  }
  gl.drawArrays(gl.TRIANGLES,0,opaqueCount);
  screen();
  if(glassCount||target){
    gl.depthMask(false);gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    if(target){
      if(glassCount){
        gl.uniform1i(target.mode,1);
        gl.drawArrays(gl.TRIANGLES,0,glassCount);
      }
      gl.disable(gl.DEPTH_TEST);gl.uniform1i(target.mode,3);
      gl.drawArrays(gl.TRIANGLES,glassCount,3);
      gl.enable(gl.DEPTH_TEST);gl.uniform1i(target.mode,2);
    }
    if(glassCount)gl.drawArrays(gl.TRIANGLES,0,glassCount);
    if(target)gl.uniform1i(target.mode,0);
    gl.depthMask(true);gl.disable(gl.BLEND);
  }
  renderer.ctx.drawImage(renderer.surface,0,0,w,h);return true;
}
