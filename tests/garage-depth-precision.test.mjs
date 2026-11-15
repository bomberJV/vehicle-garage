import test from 'node:test';
import assert from 'node:assert/strict';
import {softwareDepthRender,gpuDepthRender,recolorHover} from '../garage/surface-materials.js';

const size=80;
const panel=(color,y,shift=0)=>({part:color,color,points:[[-1+shift,y,1],[1+shift,y,1],[1+shift,y,-1],[-1+shift,y,-1]]});
const project=s=> ([x,y,z])=>({x:40+s*x*24,y:40-z*24,depth:s*y});
function fixture(faces,bits){
  let buffer=[],samples=0;
  const gl={LESS:513,DEPTH_BITS:3414,isContextLost:()=>false,getParameter(which){assert.equal(which,this.DEPTH_BITS);samples++;return bits;},
    viewport(){},clearColor(){},clearDepth(){},clear(){},useProgram(){},depthFunc(){},enable(){},disable(){},depthMask(){},bindBuffer(){},
    bufferData(target,data){buffer=Array.from(data);},getAttribLocation(){return 0;},enableVertexAttribArray(){},vertexAttribPointer(){},drawArrays(){},blendFuncSeparate(){}};
  const r={gl,canvas:{dataset:{}},surface:{width:size,height:size},ctx:{drawImage(){}},faces,
    cpuSurface:{width:size,height:size,getContext:()=>({putImageData(){}})},cpuWidth:size,cpuHeight:size,
    cpuPixels:{data:new Uint8ClampedArray(4*size*size)},cpuDepth:new Float64Array(size*size),
    softwareRender(w,h,projection){return softwareDepthRender(this,w,h,projection);}
  };
  return {r,buffer:()=>buffer,reads:()=>samples,pixel:(x,y)=>[...r.cpuPixels.data.slice((y*size+x)*4,(y*size+x+1)*4)]};
}
test('16-bit and depthless contexts preserve close foreground detail, through a highlight and a half-turn',()=>{
  for(const bits of [0,16]){
    const near={...panel('#00ff00',.00001),highlighted:true};
    const far={...panel('#ff0000',0),highlighted:true};
    const distant=panel('#333333',8,1000);
    for(const faces of [[far,near,distant],[near,distant,far]]){
      const f=fixture(faces,bits);
      for(const side of [1,-1]){
        f.r.blueprint=true;gpuDepthRender(f.r,size,size,1,project(side));
        assert.equal(f.r.canvas.dataset.renderer,'software-depth');assert.deepEqual(f.pixel(37,39),side===1?[0,255,0,255]:[255,0,0,255]);
      }
      assert.equal(f.reads(),1);
    }
  }
});
test('an offscreen assembly cannot consume the active 24-bit depth range or change the order of opaque triangles',()=>{
  const far=panel('#c40000',0),near=panel('#19c400',.00001),offscreen=panel('#888888',8,1000);
  for(const side of [1,-1]){
    const f=fixture([far,near,offscreen],24);gpuDepthRender(f.r,size,size,1,project(side));
    const v=f.buffer(),convert=i=>Math.round((v[i*7+2]+1)*.5*65535);
    assert.equal(f.r.canvas.dataset.renderer,'webgl-depth');
    assert.equal(v.length,12*7,'offscreen triangles should not be uploaded');
    assert(side===1?convert(0)>convert(6):convert(6)>convert(0));
    assert(Math.abs(convert(0)-convert(6))>64000);
  }
});
test('a partially visible triangle and the glass in front of it still cover the viewport edge',()=>{
  const pane={...panel('#0000ff',.10,1.9),opacity:.5};
  const backing=panel('#ff0000',0,1.9),occluder=panel('#00aa00',.2,2.60);
  const f=fixture([pane,backing,occluder],16);gpuDepthRender(f.r,size,size,1,project(1));
  assert.deepEqual(f.pixel(65,40),[128,0,128,255]);assert.deepEqual(f.pixel(79,40),[0,170,0,255]);
});

test('the nearest cutaway skin and a crossing pane composite by pixel depth through orbit and hover',()=>{
  for(const side of [1,-1]){
    const solid=panel('#00ff00',-2*side);
    const skin={...panel('#ff0000',0),ghostShell:true,opacity:.5};
    const farSkin={...panel('#ffe000',-.75*side),ghostShell:true,opacity:.5};
    const glass={...panel('#0000ff',0),opacity:.5};
    glass.points=glass.points.map(([x,y,z])=>[x,.4*x,z]);
    const bar=panel('#aa8844',.72*side);
    bar.points=bar.points.map(([x,y,z])=>[x*.1,y,z]);
    for(const faces of [[skin,farSkin,glass,solid,bar],[bar,solid,glass,farSkin,skin]]){
      const f=fixture(faces,16),proj=project(side);
      f.r.captureHover=true;gpuDepthRender(f.r,size,size,1,proj);
      const expected=[[128,64,64,255],[170,136,68,255],[64,64,128,255]];
      const xs=[30,40,50],samples=()=>xs.map(x=>f.pixel(x,39));
      const close=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<=1);
      assert(samples().every((v,i)=>close(v,expected[i])));
      const original=samples();
      assert(recolorHover(f.r,{part:solid.part},size,size));
      const hovered=samples();assert.deepEqual(hovered[1],original[1]);
      assert(recolorHover(f.r,null,size,size));assert.deepEqual(samples(),original);
      // Compare the accelerated highlight against a complete rerender with the selected color.
      const selected=faces.map(face=>face===solid?{...solid,color:'#788544',highlighted:true}:face);
      const full=fixture(selected,16);gpuDepthRender(full.r,size,size,1,proj);
      assert(hovered.every((v,i)=>close(v,full.pixel(xs[i],39))));
    }
  }
});

test('a lens and opaque trim with one part identifier redraw their shared material on hover',()=>{
  const ring=panel('#444444',-.2),lens={...panel('#5555ff',.6),part:ring.part,opacity:.5};
  const shell={...panel('#aaaabb',.1),ghostShell:true,opacity:.12};
  const f=fixture([ring,lens,shell],16);f.r.captureHover=true;
  gpuDepthRender(f.r,size,size,1,project(1));
  assert.equal(recolorHover(f.r,{part:ring.part},size,size),false);
});
