import test from 'node:test';
import assert from 'node:assert/strict';
import {GarageRenderer} from '../garage/render.js';
const render=faces=>{
 const prior=globalThis.ImageData;globalThis.ImageData=class{constructor(w,h){this.data=new Uint8ClampedArray(w*h*4);}};
 let output;const instance={faces,canvas:{dataset:{}},cpuSurface:{getContext:()=>({putImageData:data=>output=data.data})},ctx:{drawImage(){}}};
 try {GarageRenderer.prototype.softwareRender.call(instance,10,10,([x,y,depth])=>({x,y,depth}));return output;}finally{globalThis.ImageData=prior;}
};
test('software depth renderer resolves overlapping panels independently of insertion order',()=>{
 const far={points:[[1,1,0],[9,1,0],[5,9,0]],color:'#ff0000'};
 const near={points:[[1,1,2],[9,1,2],[5,9,2]],color:'#00ff00'};
 const a=render([far,near]),b=render([near,far]);assert.deepEqual(a,b);assert.deepEqual([...a.slice((4*10+5)*4,(4*10+5)*4+4)],[0,255,0,255]);
});
test('software depth renderer clips out-of-frame polygons and ignores degenerate triangles',()=>{
 const pixels=render([{points:[[-100,-100,0],[100,-100,0],[0,100,0]],color:'#112233'},{points:[[1,1,10],[2,2,10],[3,3,10]],color:'#ffffff'}]);
 assert.equal(pixels.length,400);assert.deepEqual([...pixels.slice(0,4)],[17,34,51,255]);
});
