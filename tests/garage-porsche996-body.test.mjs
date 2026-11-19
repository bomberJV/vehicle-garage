import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {measureStockMesh} from '../garage/factory-dimensions.js';
import {planOutline996,sweep996,stations996} from '../garage/porsche996-skin.js';
import {coupeShape,porscheShape} from '../garage/porsche-coachwork.js';
import {FLEET} from '../garage/fleet.js';

const faces=GarageRenderer.assembledFaces({vehicle:'porsche996cab',parts:[],roofPosition:'up',paint:'silver'});
const body=faces.filter(f=>/^shell\.(fenders|bumpers|deck|luggage|left-door|right-door|spoiler)$/.test(f.part));
function widest(x,set=body){
  let m=0;
  const seg=(a,b)=>{const lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]);if(x<lo||x>hi||hi-lo<1e-9)return;m=Math.max(m,Math.abs(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])));};
  for(const {points,triangles} of set){
    if(triangles)for(let i=0;i<triangles.length;i+=3){const A=points[triangles[i]],B=points[triangles[i+1]],C=points[triangles[i+2]];seg(A,B);seg(B,C);seg(C,A);}
    else for(let i=0;i<points.length;i++)seg(points[i],points[(i+1)%points.length]);
  }
  return m;
}

test('the 1999 Carrera Cabriolet matches the published spans with the top raised',()=>{
  const {mm}=measureStockMesh('porsche996cab',faces);
  assert(Math.abs(mm.length-4430)<=10,'length '+mm.length);
  assert(Math.abs(mm.bodyWidth-1765)<=10,'body width '+mm.bodyWidth);
  assert(Math.abs(mm.height-1305)<=10,'height '+mm.height);
  assert.equal(mm.wheelbase,2350);
  assert.equal(mm.frontTrack,1455);assert.equal(mm.rearTrack,1500);
});

test('the stock 996 mesh is within 3 mm of the published length, body width, height and wheelbase',()=>{
  // auto-data.net and cararac list 4,430 x 1,765 x 1,305 mm on a 2,350 mm wheelbase.
  const {meters}=measureStockMesh('porsche996cab',faces);
  for(const [id,published] of [['length',4430],['bodyWidth',1765],['height',1305],['wheelbase',2350]]){
    assert(Math.abs(meters[id]*1000-published)<=3,id+' '+(meters[id]*1000).toFixed(1));
  }
});

test('the 996 licence plate sits in its recess instead of setting the overall length',()=>{
  const plate=faces.filter(f=>f.part==='shell.bumpers'&&f.points.every(([x,y,z])=>x>2.1&&Math.abs(y)<=.1471&&z>.41&&z<.52));
  assert(plate.length>0);
  const lid=Math.max(...faces.filter(f=>f.part==='shell.deck').flatMap(f=>f.points).map(p=>p[0]));
  assert(Math.max(...plate.flatMap(f=>f.points).map(p=>p[0]))<lid);
});

test('the lofted plan follows the rescue sheet outline from nose to tail',()=>{
  // Mirrors and door handles stand outside the sheet's body outline.
  for(const [x,w] of planOutline996){
    if(Math.abs(x+.5)<.2||Math.abs(x-.5)<.1)continue;
    const gap=Math.abs(widest(x)-w)*1000;
    assert(gap<=10,'x='+x+' gap '+gap.toFixed(1)+' mm');
  }
});

test('the plan sweep keeps every loft column ordered and leaves the axles unswept',()=>{
  for(const u of [0,.2,.4,.6,.7,.8,.88]){
    let last=-Infinity;
    for(let x=stations996[0][0];x<=stations996.at(-1)[0];x+=.01){
      const p=sweep996(x,u);assert(p>last,'fold at '+x.toFixed(2)+' / '+u);last=p;
    }
  }
  for(const axle of [-1.175,1.175])for(const u of [0,.5,.86])assert.equal(sweep996(axle,u),axle);
});

test('the 996 body keeps the water-cooled loft and its own shape registry',()=>{
  const car=porscheShape('996');
  assert.equal(car,coupeShape[2]);assert.equal(car.kit.id,'996');assert.ok(car.modern);
  assert.equal(porscheShape(true).kit.id,'992');assert.equal(porscheShape(false).kit,undefined);
  assert.equal(FLEET.porsche996cab.year,1999);
});

test('lamps sit on the body: headlamps over the wings and tail lamps wrapped onto the quarters',()=>{
  const lamps=part=>faces.filter(f=>f.part===part).flatMap(f=>f.points);
  const head=lamps('lights.headlamps');
  assert(head.every(([x,y,z])=>x>-1.96&&x<-1.56&&Math.abs(y)>.38&&Math.abs(y)<.76&&z>.54&&z<.83));
  const tail=lamps('lights.tail').filter(([x])=>x>1.6&&x<2.25);
  assert(tail.some(([x,y])=>x<1.76&&Math.abs(y)>.78),'lens reaches the quarter panel');
  assert(tail.some(([x,y])=>x>2.05&&Math.abs(y)<.5),'lens reaches the rear panel');
  // Every tail-lens point is within 15 mm outside the body at its height.
  for(const [x,y,z] of tail.filter(([,,z])=>z>.66&&z<.83)){
    assert(Math.abs(y)<=widest(x)+.015,'tail lens point clear of the body at '+x.toFixed(3));
  }
});
