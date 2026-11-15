import {TAU,section,part,loops} from './space-shapes.js';
import {paint,alloy,primer,frame,shadow,simReference,study,lip,station,plate,ellipse,panelBox} from './saturn-shapes.js';

const forward={from:2.05,to:TAU+.99,steps:50};
const at=(u,v,d=0)=>[u,.55+d,v+1.01];
function opticalBarrel(r,point,u,v,radius,z0,z1){
  const n=28,edge=(a,z,rr)=>point(u+rr*Math.cos(a),v+rr*Math.sin(a),z);
  for(let i=0;i<n;i++){
    const a=TAU*i/n,b=TAU*(i+1)/n;
    r.polygon([edge(a,z0,radius),edge(b,z0,radius),edge(b,z1,radius*.85),edge(a,z1,radius*.85)],i%4===0?'#afbab3':'#7e908f',false);
  }
  ellipse(r,point,u,v,radius*.85,radius*.85,'#3a4c51',z1);
  ellipse(r,point,u,v,radius*.70,radius*.70,'#55747c',z1+.002);
  ellipse(r,point,u,v,radius*.46,radius*.46,'#334d57',z1+.004);
  ellipse(r,point,u-radius*.12,v+radius*.14,radius*.21,radius*.21,'#7c989b',z1+.005);
}
function drawCamera(r,piece,point=at){
  if(piece==='housing'){
    panelBox(r,point,0,0,.44,.38,.20,'#b7b7a5');
    panelBox(r,point,0,-.05,.35,.24,.25,'#9aa79d');
    for(const u of [-.20,.20])for(const z of [-.118,-.059,0,.059,.118])panelBox(r,point,u,z,.027,.013,.216,frame);
    panelBox(r,point,-.108,.13,.116,.047,.205,'#6a7776');
    for(const x of [-.186,.186])for(const v of [-.14,.13])ellipse(r,point,x,v,.011,.011,frame,.203,8);
  }
  if(piece==='lens'){
    opticalBarrel(r,point,0,-.052,.111,.251,.316);
  }
  if(piece==='cassette'){
    panelBox(r,point,.007,.239,.38,.087,.143,'#888f87');
    panelBox(r,point,0,.291,.18,.017,.115,'#c9cdc0');
    for(const u of [-.162,.162]){panelBox(r,point,u,.247,.027,.052,.153,alloy);ellipse(r,point,u,.248,.007,.008,'#536263',.155,8);}
    loops(r,[[.10,.264,.143],[.10,.294,.173],[-.10,.294,.173],[-.10,.264,.143]].map(p=>point(...p)),.009,alloy,false);
  }
  if(piece==='stellar'){
    const mount=(u,v,d)=>point(.285+d,v+.035,.089+u);
    panelBox(r,mount,0,0,.117,.107,.039,frame);opticalBarrel(r,mount,0,0,.043,.04,.077);
    panelBox(r,point,.247,.033,.067,.136,.160,'#9fa796');
  }
  if(piece==='rails'){
    for(const x of [-.25,.25]){panelBox(r,point,x,0,.032,.45,.034,primer);panelBox(r,point,x,-.20,.071,.036,.10,alloy);}
  }
}
const mapper=study('saturn-mapper','Lunar mapping camera','The mapping camera photographed the surface on film. An adjacent stellar camera recorded star fields. Worden brought the exposed mapping and panoramic camera film back to the cabin during his spacewalk.',simReference,[
  ['housing','Camera housing','A casing supported the optical assembly and film transport.',[0,-.42,.08]],
  ['lens','Terrain camera aperture','The terrain camera’s opening faced the lunar surface while Endeavour circled the Moon.',[.13,.45,-.18]],
  ['cassette','Removable film cassette','The mapping and stellar cameras recorded their images on film in the removable cassette.',[.22,.17,.41]],
  ['stellar','Stellar camera opening','The second camera looked off to the side toward the stars. Its photographs helped establish the orientation of each terrain view.',[.47,.14,.13]],
  ['rails','Mounting rails','The structural mounts locate the assembly in the bay. The fasteners are schematic.',[-.40,0,-.20]]
].map(([id,name,desc,offset])=>part(id,name,desc,offset,r=>drawCamera(r,id,(u,v,d)=>[u*2.8,d*2.8,.7+v*2.8]))),[-.44,.30]);
const instruments=study('saturn-sim','Orbital science instrument bay','Removing the cover exposed the cameras and instruments to the Moon below. Two film cassettes had to come home. During the return to Earth, Al Worden crossed the outside of the service module to collect them.',simReference,[
  part('frame','Equipment rack','Side rails and transverse supports divided the bay into mounting locations.',[-.26,-.35,-.13],r=>{
    for(const x of [-.66,.66])panelBox(r,at,x,0,.061,1.76,.067,alloy);
    for(const z of [-.86,-.46,-.13,.27,.84])panelBox(r,at,0,z,1.35,.055,.055,frame);
    for(const z of [-.69,.05,.56])r.rod(at(-.63,z-.12,-.012),at(.63,z+.12,-.012),.014,frame,7);
  }),
  part('mapping','Mapping camera and cassette','The terrain and stellar cameras shared a removable film magazine. Open the assembly to separate the magazine and optical housing.',[-.48,.25,.42],r=>{
    const mount=(u,v,d)=>at(-.30+u,.43+v,d+.075);for(const id of ['rails','housing','lens','cassette','stellar'])drawCamera(r,id,mount);
  }),
  part('altimeter','Laser altimeter','The altimeter measured the distance to the lunar surface. Those measurements gave the mapping photographs a height reference.',[-.43,.21,.06],r=>{
    panelBox(r,at,-.32,.045,.30,.19,.21,'#a3aa99');ellipse(r,at,-.37,.042,.048,.050,shadow,.214);ellipse(r,at,-.25,.042,.035,.036,'#64858c',.215);
  }),
  part('panoramic','Panoramic camera and magazine','This camera produced long strips of high-resolution film. Its magazine was the other one Worden recovered.',[.55,.25,.26],r=>{
    panelBox(r,at,.29,.24,.44,.51,.19,'#939e9a');
    for(const u of [.16,.40]){ellipse(r,at,u,.34,.082,.09,alloy,.197);ellipse(r,at,u,.34,.061,.066,frame,.2);}
    panelBox(r,at,.29,.12,.36,.084,.227,shadow);panelBox(r,at,.29,-.056,.36,.086,.17,primer);
  }),
  part('wiring','Instrument wire bundles','Harnesses ran along the rack to the science packages. The bends and clamps show how the bundles followed the bay wall.',[-.16,.38,.63],r=>{
    for(let k=0;k<3;k++){
      const x=-.567+k*.018;
      loops(r,[[x,.80],[x,.37],[x+.072,.30],[x+.072,.07],[x+.11,.03],[x+.11,-.37],[x+.22,-.46]].map(([u,v])=>at(u,v,.083+k*.004)),.0065,k===0?'#ae9a78':frame,false);
    }
    for(const v of [.66,.48,.20,-.14,-.30])panelBox(r,at,v>.32?-.55:v>0?-.48:-.44,v,.080,.016,.096,alloy);
  }),
  part('subsatellite','Particles and fields subsatellite','The small subsatellite rode in the bay, then continued collecting data in lunar orbit after it separated from Endeavour.',[-.42,.31,-.33],r=>{
    section(r,-.26,.76,[[.45,.103],[.48,.117],[.69,.117],[.72,.103]],'#8f9c8c',{steps:6,caps:true});
    for(let i=0;i<6;i++){
      const a=(i+.5)*TAU/6;const tangent=station(a,.103,.586);
      const face=(u,v,d)=>{const [x,y,z]=tangent(u,v,d);return [x-.26,y+.76,z];};
      plate(r,face,0,0,.091,.16,'#415766',.001);
      for(const v of [-.045,0,.045])plate(r,face,0,v,.088,.003,'#aeb8a5',.002);
    }
    for(const z of [.475,.682])section(r,-.26,.76,[[z,.121],[z+.018,.121]],primer,{steps:6});
  }),
  part('detectors','Spectrometer packages','The mission carried gamma-ray, mass, alpha-particle and X-ray instruments. The exhibit shows the stowed packages in the lower portion.',[.49,.22,-.36],r=>{
    for(let i=0;i<3;i++){
      const u=-.39+i*.36;panelBox(r,at,u,-.697,.285,.19,.11,'#b6b29a');
      ellipse(r,at,u,-.696,.052,.055,shadow,.114,16);
    }
  })
],[-.42,.19]);
const service=study('saturn-sm','Endeavour service module','On Apollo 15, one wedge of the service module carried an orbital laboratory. The near side of this drawing is open so the radiator panels, equipment bay and aft engine bell can be inspected separately.',simReference,[
  part('body','Service module barrel','Radial divisions inside the aluminum barrel separated equipment sectors. The open side shows the location of the science bay.',[-.4,-.27,.10],r=>{
    section(r,0,0,[[.29,.76],[1.76,.76]],alloy,forward);lip(r,.28,.78,frame,.08);lip(r,1.76,.78,frame,.08);
    for(const a of [forward.from,forward.to]){
      const p=(radius,z)=>[radius*Math.cos(a),radius*Math.sin(a),z];r.polygon([p(.18,.31),p(.75,.31),p(.75,1.73),p(.18,1.73)],'#9ca89d',false);
    }
  }),
  part('radiators','Radiator panels','Light-colored radiator surfaces lined parts of the barrel. They are easiest to see along the curved sides.',[-.47,0,.30],r=>{
    for(const a of [2.38,3.68,5.08,6.42])for(let i=0;i<7;i++){
      const z=.50+i*.153;section(r,0,0,[[z,.767],[z+.125,.767]],i%2?'#c8c9ba':paint,{from:a-.25,to:a+.25,steps:9});
    }
  }),
  part('bay','Scientific instrument module','Open this bay to locate the two cameras, laser altimeter, subsatellite and spectrometer packages.',[.12,.62,.19],r=>{
    const mount=(u,v,d)=>[u*.80,.56+d,v+1.01];
    for(const u of [-.34,0,.34])panelBox(r,mount,u,0,.03,1.14,.041,alloy);
    for(const v of [-.56,-.17,.19,.55])panelBox(r,mount,0,v,.70,.035,.03,frame);
    for(const [u,v,w,h] of [[-.17,.28,.24,.24],[.17,.19,.24,.34],[-.16,-.22,.21,.14],[.16,-.25,.24,.16]]){
      panelBox(r,mount,u,v,w,h,.092,'#a9ae9c');ellipse(r,mount,u,v,w*.25,w*.26,shadow,.096,16);
    }
  }),
  part('bell','Service engine bell exterior','The large external bell projects below the aft bulkhead. It extended into the adapter during launch.',[0,0,-.49],r=>{
    section(r,0,0,[[0,.331],[.08,.30],[.17,.224],[.28,.128],[.33,.101]],'#858c87',{steps:36});
    section(r,0,0,[[0,.33],[0,.318],[.20,.17]],'#424c4d',{steps:36});
  })
],[-.39,.34]);
export const scienceEntries=[[['apollo.service'],service],[['saturn-sm.bay','apollo.science'],instruments],[['saturn-sim.mapping'],mapper]];
