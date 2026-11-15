import {TAU,metal,steel,dark,gold,copper,add,point,basis,turn,cyl,sleeve,gear,part,study,y,origin} from './mechanism-shapes.js';
export const differentialSource={label:'MIT · differential gear motion',url:'https://web.mit.edu/2.972/OldFiles/www/reports/differential/differential.html'};
const c=[0,0,.90],L=.58,axis=basis(y);
export function differentialState(t){
  const carrier=TAU*t;
  // Both outputs complete one revolution per cycle. Relative speeds diverge then converge.
  const variation=.58*Math.sin(TAU*t);
  return {carrier,left:carrier-variation,right:carrier+variation,spider:variation*12/8};
}
function carrierFrame(r,t){
  const {carrier}=differentialState(t);
  for(const s of [-1,1]){
    sleeve(r,c,y,s*.55,s*.595,.55,.482,steel);
    sleeve(r,c,y,s*.55,s*.64,.205,.15,steel);
    for(const offset of [0,Math.PI])r.rod(point(c,axis,s*.575,.184,carrier+offset),point(c,axis,s*.575,.516,carrier+offset),.046,steel,9);
  }
  for(const phase of [0,Math.PI]){
    const a=carrier+phase,start=point(c,axis,-.56,.50,a),end=point(c,axis,.56,.50,a);
    r.rod(start,end,.055,steel,10);
  }
}
function sideOutput(r,s,t){
  const {left,right}=differentialState(t),a=s<0?left:right;
  gear(r,c,y,s*.49,s*.22,.455,.255,12,s<0?'#9fa95d':'#86aec2',a);
  cyl(r,c,y,s*.39,s*1.22,.135,s<0?'#a8b772':'#7ca4b4');
  const marker=point(c,axis,s*1.22,.085,a);
  r.rod(add(marker,y,-.012),add(marker,y,.012),.028,gold,8);
}
function spiderAxis(t){const {carrier}=differentialState(t);return [Math.cos(carrier),0,-Math.sin(carrier)];}
const components=[
 part('ring','Final-drive gear','The toothed wheel turns the carrier. This section shows a longitudinal axle-style ring gear. A transverse transaxle generally drives its carrier with parallel-axis reduction gears.',[0,-1.0,.13],(r,t)=>{
   const a=differentialState(t).carrier;
   gear(r,c,y,-.72,-.64,.83,.785,32,metal,a,.76);
   sleeve(r,c,y,-.73,-.636,.255,.152,steel);
   for(let i=0;i<8;i++){
     const theta=a+i*TAU/8;
     r.rod(point(c,axis,-.675,.234,theta),point(c,axis,-.675,.64,theta),.058,steel,7);
     cyl(r,point(c,axis,-.68,.55,theta),y,-.066,-.035,.035,gold,6);
   }
 }),
 part('carrier','Rotating carrier','The cross pin is carried around the axle axis with the final-drive gear. The open frame exposes the differential gears.',[0,0,.95],carrierFrame),
 part('pin','Spider cross pin','The pin turns with the carrier. The spider gears can also turn about the pin’s own axis.',[-.76,0,.34],(r,t)=>cyl(r,c,spiderAxis(t),-.54,.54,.06,gold)),
 ...[-1,1].map((s,i)=>part('spider-'+i,(i?'Upper':'Opposed')+' spider gear','The pinion orbits the axle with the carrier and spins about the cross pin whenever the two outputs differ in speed.',[s*.70,0,s*.5],(r,t)=>{
   gear(r,c,spiderAxis(t),s*.45,s*.23,.29,.158,8,copper,differentialState(t).spider+Math.PI/8);
 })),
 part('left','Left side gear and output','Splines couple the side gear to its shaft. Its speed can fall below the carrier speed when that wheel follows the inside path.',[0,-.93,-.40],(r,t)=>sideOutput(r,-1,t)),
 part('right','Right side gear and output','The two equal-size side gears turn at speeds whose average equals carrier speed. The colored end marks help compare them.',[0,1.03,-.38],(r,t)=>sideOutput(r,1,t)),
];
export const diff=study('diff','Differential gearset','The final-drive gear turns the carrier. Two spider gears ride on its cross pin and mesh with the side gears on the axle shafts. When the wheels take different paths, the spiders turn on the pin and let one axle advance by the amount the other falls behind. The cutaway shows the common open gearing.',differentialSource,components,
'Follow the two colored outputs through a left then a right bend. Their speeds coincide as the paths straighten. The copper spider gears orbit with the frame and spin about the gold pin as the paths diverge.');
diff.viewAngle=[-.98,.50];
// A transverse transaxle uses a parallel-axis final reduction. Keep that input geometry distinct.
const reduction=part('ring','Final reduction wheel','A gear on the parallel reduction shaft drives this wheel, which is connected to the differential carrier.',[0,-1,.13],(r,t)=>{
  const a=differentialState(t).carrier;
  gear(r,c,y,-.72,-.64,.83,.83,32,metal,a,.75);
  for(let i=0;i<6;i++)r.rod(point(c,axis,-.677,.194,a+i*TAU/6),point(c,axis,-.677,.65,a+i*TAU/6),.065,steel,10);
  sleeve(r,c,y,-.724,-.635,.256,.15,metal);
});
const transverse=study('diff','Transaxle differential','A final reduction gear turns the carrier between the front wheels. The spider and side gears share drive between the half-shafts while allowing the wheels to turn at different speeds.',differentialSource,[reduction,...components.slice(1)],diff.motionDescription);
export const transaxleDiff={...transverse,id:'transaxle-diff',viewAngle:diff.viewAngle};
