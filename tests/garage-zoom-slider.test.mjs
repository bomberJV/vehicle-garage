import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bindZoomSlider,clampZoom,zoomLabel,ZOOM_MIN,ZOOM_MAX} from '../garage/zoom-slider.js';

function fakeInput(){
  const listeners={};
  return {value:'',min:'',max:'',addEventListener:(type,fn)=>{listeners[type]=fn;},fire:type=>listeners[type]()};
}
function fakeRenderer(){
  const calls=[];
  return {zoom:1,focusPan:{x:1},calls,beginInteraction:()=>calls.push('begin'),requestDraw:()=>calls.push('draw'),endInteraction:ms=>calls.push(`end:${ms}`)};
}

test('the slider covers the same zoom range as the wheel and keys',()=>{
  assert.equal(ZOOM_MIN,.6);assert.equal(ZOOM_MAX,2.2);
  assert.equal(clampZoom(5),2.2);assert.equal(clampZoom(.1),.6);assert.equal(clampZoom('x'),1);
  assert.equal(zoomLabel(1.449),'1.4×');
});

test('moving the slider zooms the view on the wheel draw path',()=>{
  const r=fakeRenderer(),input=fakeInput(),output={textContent:''};
  bindZoomSlider(r,input,output);
  assert.equal(input.value,'1');assert.equal(output.textContent,'1.0×');
  input.value='1.8';input.fire('input');
  assert.equal(r.zoom,1.8);assert.equal(r.focusPan,null);assert.equal(output.textContent,'1.8×');
  assert.deepEqual(r.calls,['begin','draw','end:180']);
});

test('the slider follows zoom changes made elsewhere',()=>{
  const r=fakeRenderer(),input=fakeInput(),output={textContent:''};
  bindZoomSlider(r,input,output);
  r.zoom=2.1;assert.equal(input.value,'2.1');assert.equal(output.textContent,'2.1×');
  r.zoom=1;assert.equal(input.value,'1');assert.equal(output.textContent,'1.0×');
});

test('the workbench page carries the slider beside the canvas',()=>{
  const html=readFileSync(new URL('../garage/index.html',import.meta.url),'utf8');
  assert.match(html,/<div class="canvas-frame"><canvas id="vehicle-canvas"[^]*?<\/canvas><div class="zoom-slider">[^]*?id="zoom-range"[^]*?id="zoom-readout"/);
  const app=readFileSync(new URL('../garage/app.js',import.meta.url),'utf8');
  assert.match(app,/bindZoomSlider\(renderer,\$\('zoom-range'\),\$\('zoom-readout'\)\)/);
});
