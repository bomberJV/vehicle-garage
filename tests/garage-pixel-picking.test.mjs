import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {sanitizeBuild} from '../garage/model.js';
import {softwareDepthRender} from '../garage/surface-materials.js';

const width=160,height=112;
const ctx={setTransform(){},clearRect(){},fillRect(){},createRadialGradient:()=>({addColorStop(){}}),
  save(){},restore(){},translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillText(){},arc(){},fill(){},drawImage(){}};
function scene(vehicle){
  const canvas={width,height,clientWidth:width,dataset:{},getBoundingClientRect:()=>({width,height,left:0,top:0})};
  return Object.assign(Object.create(GarageRenderer.prototype),{build:sanitizeBuild({vehicle,roofPosition:'up'}),ctx,canvas,
    inspection:{},faces:[],angle:-.58,elevation:.24,zoom:1,partPositions:new Map(),depthRender(){},
    cpuWidth:width,cpuHeight:height,cpuDepth:new Float64Array(width*height),cpuPixels:{data:new Uint8ClampedArray(width*height*4)},
    cpuSurface:{height,width,getContext:()=>({putImageData(){}})}});
}
test('integer pointer coordinates hit the rendered foreground at the 992 glazing, G500 panels and Cessna tail',()=>{
  globalThis.window={devicePixelRatio:1};
  try{
    for(const vehicle of ['porsche992scab','g500','cessna172']){
      const r=scene(vehicle);r.draw();
      const original=r.hitFaces,names=[...new Set(original.map(f=>f.part))];
      // Give each physical surface a distinct RGB identifier. Treat glazing as
      // opaque in this reference pass to identify the first pane under the ray.
      const ids=new Map(names.map((part,i)=>[part,(1+i).toString(16).padStart(6,'0')]));
      r.hitFaces=original.map(f=>({...f,color:'#'+ids.get(f.part),vertexColors:null,opacity:1}));
      softwareDepthRender(r,width,height,r.project);
      r.hitFaces=original;
      let compared=0;
      for(let y=21;y<96;y+=4)for(let x=9;x<width-8;x+=3){
        const i=4*(y*width+x),data=r.cpuPixels.data;
        if(!data[i+3])continue;
        const expected=names[65536*data[i]+256*data[i+1]+data[i+2]-1];
        assert.equal(r.hitTest(x,y)?.part,expected,vehicle+' at '+x+','+y);
        compared++;
      }
      assert(compared>180,vehicle);
    }
  }finally{delete globalThis.window;}
});
test('DPR scaling, transparent-solid depth ties and outgoing focus use the displayed sample',()=>{
  const r=scene('porsche992scab');
  const rect={width:100,height:100,left:30,top:20};
  r.canvas={width:200,height:200,dataset:{renderer:'webgl-depth'},getBoundingClientRect:()=>rect};
  r.project=([x,y,depth])=>({x,y,depth});
  const surface=(part,x0,x1,depth,opacity)=>({part,opacity,points:[[x0,1,depth],[x1,1,depth],[x1,12,depth],[x0,12,depth]]});
  const a=surface('door.skin',0,20,1),thin=surface('door.seal',3.15,3.4,2);
  r.faces=[a,thin];assert.equal(r.hitTest(33,24)?.part,thin.part);
  r.canvas.dataset.renderer='software-depth';assert.equal(r.hitTest(33,24)?.part,a.part);
  const glass=surface('door.window',0,20,1,.25);r.faces=[glass,a];
  assert.equal(r.hitTest(33,24)?.part,a.part);
  r.faces=[a,{...glass,opacity:-.1}];assert.equal(r.hitTest(33,24)?.part,a.part);
  r.focusTransition={acceptsDestinationPick:false};assert.equal(r.hitTest(33,24),null);
  r.focusTransition={acceptsDestinationPick:true,hitTransform:{scale:1.3,dx:4,dy:2}};
  assert.equal(r.hitTest(39,27)?.part,a.part);
});

test('a stationary hover follows the foreground as a 992 rotates underneath the cursor',()=>{
  globalThis.window={devicePixelRatio:1};globalThis.document={hidden:false};globalThis.requestAnimationFrame=()=>{};
  try{
    const r=scene('porsche992scab');r.draw();
    const x=87,y=29,old=r.hitTest(x,y);
    assert(old);
    r.spin=true;r.last=0;r.hoverHit=old;r.hoverPointer={x,y};
    let changed=false;
    r.onInspect=()=>{changed=true;};
    for(let i=1;i<=40&&!changed;i++)r.frame(i*60);
    assert(changed,'a rotating model exposes a different part at the stationary pointer');
    assert.deepEqual(r.hoverHit,r.hitTest(x,y));
  }finally{delete globalThis.window;delete globalThis.document;delete globalThis.requestAnimationFrame;}
});
