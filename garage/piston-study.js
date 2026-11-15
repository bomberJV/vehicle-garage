import {m113Slider} from './g500-m113-geometry.js';
// Single-cylinder slider crank. The cutaway stands upright to expose the linkage on every engine.
const source={label:'MAHLE · piston and connecting rod',url:'https://www.mahle-aftermarket.com/media/local-media-north-america/pdfs-%26-thumbnails/catalogs-and-literature/pistons-and-rings/pi-20-09.pdf'};
const ringSource={label:'MAHLE · piston ring nomenclature',url:'https://www.mahle-aftermarket.com/media/local-media-north-america/pdfs-%26-thumbnails/catalogs-and-literature/pistons-and-rings/pr-40-22.pdf'};
const PI2=Math.PI*2;
function band(r,z,ro,ri,h,color,start=.23,end=PI2-.01){
  const point=(a,radius,lift=0)=>[radius*Math.cos(a),radius*Math.sin(a),z+lift];
  const segments=42;
  for(let i=0;i<segments;i++){
    const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments;
    for(const dh of [0,h])r.polygon([point(a,ro,dh),point(b,ro,dh),point(b,ri,dh),point(a,ri,dh)],color);
    for(const radius of [ri,ro])r.polygon([point(a,radius),point(b,radius),point(b,radius,h),point(a,radius,h)],color);
  }
  for(const a of [start,end])r.polygon([point(a,ri),point(a,ro),point(a,ro,h),point(a,ri,h)],color);
}
function piece(id,name,description,offset){return {id,name,description,offset};}
const rings=[
  piece('ringpack.top','Top compression ring','Gas pressure behind this ring helps press it against the cylinder wall. The ring has a gap so it can expand.',[0,0,.5]),
  piece('ringpack.second','Second ring','The second ring scrapes excess oil and helps control gas pressure between the rings.',[0,.22,.24]),
  piece('ringpack.oil','Oil-control ring','This representative three-piece oil ring has two thin rails and an expander that pushes them outward.',[0,-.27,0]),
];
function drawRings(r,z){
  r.tag(rings[0].id,()=>band(r,z+.189,.451,.40,.034,'#b8c3c9'));
  r.tag(rings[1].id,()=>band(r,z+.098,.451,.40,.031,'#858e8d',.95,PI2+.84));
  r.tag(rings[2].id,()=>{
    for(const h of [0,.046])band(r,z+h,.451,.40,.014,'#a8b5bc',-.6,PI2-.67);
    for(let i=0;i<52;i++){const a=i*PI2/52,b=(i+1)*PI2/52;r.rod([.423*Math.cos(a),.423*Math.sin(a),z+.03+(i%2)*.011],[.423*Math.cos(b),.423*Math.sin(b),z+.03+((i+1)%2)*.011],.01,'#c5a46c',5);}
  });
}
const ringPack={id:'piston-rings-detail',name:'Piston ring pack',source:ringSource,
  description:'Two upper rings and an oil-control assembly sit in grooves near the piston crown. Open the layers to see their gaps, rails and expander.',
  groups:[{id:'ringpack',name:'Ring pack',parts:rings}],draw(r){drawRings(r,.6);}};
const movingParts=[
  piece('slider.piston','Piston and skirt','The crown faces the combustion chamber. The skirt guides the piston through the bore.',[0,0,.76]),
  piece('slider.rings','Piston ring pack','The split rings ride in separate grooves near the crown. Open this part to inspect the rails and expander.',[0,.42,.52]),
  piece('slider.pin','Wrist pin','The pin forms the pivot between the piston bosses and the small end of the connecting rod.',[0,.72,.22]),
  piece('slider.rod','Connecting rod','The small end swings about the wrist pin. The big end follows the crankpin.',[-.45,0,.12]),
  piece('slider.crank','Crank throw and crankpin','The offset crankpin sweeps a circle around the main shaft axis.',[.47,0,-.29])
];
export function sliderCrank(phase){
  const t=phase*PI2,x=.38*Math.sin(t),z=.73+.38*Math.cos(t);
  return {x,z,pin:z+Math.sqrt(1.13**2-x**2)};
}
const piston={id:'piston-motion-study',name:'Piston and crank cutaway',source,animated:true,
  description:'Follow one cylinder through a crank revolution. The crankpin moves in a circle while the piston is constrained to a straight line. This study shows one representative linkage.',
  motionDescription:'Watch the marked crankpin. It carries the big end of the rod around the shaft. The wrist pin changes angle while the piston stays centered.',
  groups:[{id:'slider',name:'Slider and crank',parts:movingParts}],
  draw(r,phase=0){
    const {x,z,pin}=sliderCrank(phase);
    r.tag('slider.piston',()=>{
      band(r,pin-.16,.425,.35,.33,'#9ba8ab',.4,PI2-.45);
      band(r,pin+.165,.426,.347,.30,'#bbc7c8',.4,PI2-.45);
      for(let i=0;i<42;i++){const a=i*PI2/42,b=(i+1)*PI2/42;r.polygon([[0,0,pin+.466],[.426*Math.cos(a),.426*Math.sin(a),pin+.466],[.426*Math.cos(b),.426*Math.sin(b),pin+.466]],'#ced2cd');}
    });
    r.tag('slider.rings',()=>{for(const d of [.19,.28,.37])band(r,pin+d,.436,.418,.02,'#657277');});
    r.tag('slider.pin',()=>{r.tubeY(0,-.38,.38,pin,.085,'#bbc3c8',26);for(const y of [-.38,.38])r.ringY(0,y,pin,.085,.04,'#d3d6c9',26);});
    r.tag('slider.rod',()=>{
      r.rod([x,0,z],[0,0,pin],.081,'#9da8a5',12);
      for(const [px,pz,rad] of [[x,z,.164],[0,pin,.11]]){r.tubeY(px,-.12,.12,pz,rad,'#7d8989',24);for(const y of [-.12,.12])r.ringY(px,y,pz,rad,rad*.65,'#b0b6b0',24);}
    });
    r.tag('slider.crank',()=>{
      r.tubeY(0,-.51,.52,.73,.105,'#717c81',26);
      for(const y of [-.20,.20])r.rod([0,y,.73],[x,y,z],.116,'#7b858a',12);
      r.tubeY(x,-.23,.23,z,.091,'#b78c58',26);r.ringY(x,.235,z,.091,0,'#d4ac73',26);
    });
  }};
export function getPistonDetail(vehicle,id){
  if(!['g500','bmw325ci','hrv','c63','porsche993cab','porsche992scab','bmws1000rr'].includes(vehicle))return null;
  if(id==='slider.rings'||id==='powertrain.piston-rings')return ringPack;
  if(vehicle==='g500'&&['powertrain.pistons','powertrain.connecting-rods','powertrain.crankshaft'].includes(id))return m113Slider;
  return ['powertrain.pistons','powertrain.connecting-rods','powertrain.crankshaft','engine.cylinders'].includes(id)?piston:null;
}
