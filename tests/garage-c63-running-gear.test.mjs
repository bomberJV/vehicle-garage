import assert from 'node:assert/strict';
import test from 'node:test';
import {GarageRenderer} from '../garage/render.js';
import {VEHICLES} from '../garage/catalog.js';
import {roadSystems} from '../garage/road-service-data.js';
import {wheelSites} from '../garage/road-service-geometry.js';

// Mercedes-Benz USA technical data, C63 AMG sedan: 235/40 R 18 front,
// 255/35 R 18 rear, track 61.8 in front and 60.0 in rear.
const inch=.0254,bead=18*inch/2;
const nominal={front:bead+.235*.40,rear:bead+.255*.35};
const published={front:61.8*inch,rear:60.0*inch};

function drawnTyres(){
 const faces=GarageRenderer.assembledFaces({vehicle:'c63',parts:[],roofPosition:'up',paint:'silver'});
 const out={};
 for(const end of ['front','rear'])for(const hand of ['left','right']){
  const corner=end+'-'+hand;
  // The tread tube spans the full tyre width; every point lies on the outer radius.
  const ySpan=f=>Math.max(...f.points.map(p=>p[1]))-Math.min(...f.points.map(p=>p[1]));
  const pts=faces.filter(f=>f.part==='wheels.tire'&&f.instance===corner&&ySpan(f)>.2).flatMap(f=>f.points);
  assert(pts.length>0,corner+' has no tread faces');
  const span=i=>[Math.min(...pts.map(p=>p[i])),Math.max(...pts.map(p=>p[i]))];
  const [x,y,z]=[0,1,2].map(span);
  out[corner]={centre:[(x[0]+x[1])/2,(y[0]+y[1])/2,(z[0]+z[1])/2],radius:(z[1]-z[0])/2,bottom:z[0]};
 }
 return out;
}

test('C63 stock tyres are drawn at their nominal 235/40R18 and 255/35R18 radii on the published tracks',()=>{
 const tyres=drawnTyres();
 for(const end of ['front','rear']){
  const l=tyres[end+'-left'],r=tyres[end+'-right'];
  for(const t of [l,r]){
   assert(Math.abs(t.radius-nominal[end])<=.002,`${end} tyre radius ${t.radius.toFixed(4)} m, nominal ${nominal[end].toFixed(4)} m`);
   // Both axles stand on the same ground plane the body is built over.
   assert(Math.abs(t.bottom-.04)<1e-6,`${end} tyre bottom ${t.bottom}`);
  }
  const track=r.centre[1]-l.centre[1];
  assert(Math.abs(track-published[end])<=.005,`${end} track ${track.toFixed(4)} m, published ${published[end].toFixed(4)} m`);
 }
 assert(Math.abs(VEHICLES.c63.trackFront-published.front)<1e-9);
 assert(Math.abs(VEHICLES.c63.trackRear-published.rear)<1e-9);
});

test('C63 service brake and hub sites sit on the drawn tyre centres',()=>{
 const tyres=drawnTyres(),p=roadSystems.c63;
 for(const [end,rear] of [['front',false],['rear',true]]){
  for(const site of wheelSites(p,rear)){
   const t=tyres[end+'-'+(site[1]<0?'left':'right')],[cx,cy,cz]=t.centre;
   assert(Math.abs(site[0]-cx)<1e-6,`${end} site x ${site[0]} vs tyre ${cx}`);
   assert(Math.abs(site[2]-cz)<=.0005,`${end} site height ${site[2]} vs tyre centre ${cz}`);
   // Service discs sit 14 mm inboard of the tyre centre line, as on the other road cars.
   assert(Math.abs(Math.abs(site[1])+.014-Math.abs(cy))<=.0005,`${end} site y ${site[1]} vs tyre ${cy}`);
  }
 }
});
