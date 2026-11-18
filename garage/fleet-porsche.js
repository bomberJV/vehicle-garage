import {classicTailpipe,classicTailpipeEnd} from './porsche993-body-profile.js';
import {draw992DeckCooling} from './porsche-deck-cooling.js';
import {draw993CoolingFan} from './porsche-fan.js';
import {drawInstalledBoxer} from './porsche-engine-dress.js';
import {drawEngineCore} from './porsche-crankshaft.js';
import {drawFleetIgnition} from './fleet-ignition.js';
import {boxerFrame,cylinderX,m64} from './porsche-boxer-layout.js';
import {ellipse,barrel,wheel} from './road-primitives.js';
import {drawCoachwork,porscheShape} from './porsche-coachwork.js';
import {drawCabrioletCabin} from './porsche-cabin.js';
import {alloy993,alloy992,alloy996} from './porsche-wheels.js';
import {wheelDesign} from './wheel-designs.js';
import {drawAlternativeAlloy} from './wheel-faces.js';

const TAU=2*Math.PI;
export const porscheVehicle=modern=>modern==='996'?'porsche996cab':modern?'porsche992scab':'porsche993cab';
// Running gear per car: tyre section widths, tracks, brake rim and the wheel face.
const running={
  porsche993cab:{width:[.205,.245],track:[1.405,1.444],brake:[.2032,.2032],rim:alloy993},
  porsche992scab:{width:[.245,.305],track:[1.59,1.556],brake:[.254,.2667],rim:alloy992},
  // 1999 Carrera: 205/50 ZR 17 and 255/40 ZR 17 on 7J and 9J × 17 wheels.
  porsche996cab:{width:[.205,.255],track:[1.455,1.500],brake:[.2159,.2159],rim:alloy996}
};
function boxer(r,car,modern){
  const {cx,f,z}=boxerFrame(car,modern),type996=modern==='996';
  drawFleetIgnition(r,porscheVehicle(modern),[cx,0,z],f);
  drawEngineCore(r,cx,z,modern,f,modern?null:m64.stroke);
  // The 993's 100 mm bores sit 118 mm apart, so its finned barrels are
  // smaller than the 992/996 water jackets drawn at the wider model pitch.
  const [barrelR,finR]=modern?[.077,.086]:[.054,.0575];
  for(const s of [-1,1]){
    for(let n=0;n<3;n++){
      const x=cylinderX(cx,f,n,s);
      r.tag('engine.cylinders',()=>{
        barrel(r,[x,s*.12,z],[x,s*.37,z],barrelR,'#939a9e',14);
        if(!modern)for(let k=0;k<7;k++){
          const y=s*(.17+k*.027);
          const rim=Array.from({length:10},(_,i)=>[x+finR*Math.cos(i*TAU/10),y,z+finR*Math.sin(i*TAU/10)]);
          // Thin cooling fins remain distinct in the vehicle overview. The
          // cylinder intersects each centre, leaving the annular rim exposed.
          r.polygon(rim,'#696e72',false);
        }
      });
    }
    r.tag('drive.axles',()=>{barrel(r,[car.rear,s*.109,.345],[car.rear,s*.663,.345],.025,'#7e8281');barrel(r,[car.rear,s*.536,.345],[car.rear,s*.62,.345],.046,'#3d4449');});
    r.tag('engine.exhaust',()=>{
      // The 996 has one oval tailpipe below each rear corner of the bumper.
      const tip=type996?2.092:modern?car.stations.at(-1)[0]-.100:classicTailpipeEnd(),y=s*(type996?.500:modern?.455:classicTailpipe.y);
      // The 992.1 Cabriolet is shown with the optional two-oval Sport Exhaust.
      // Its outlets sit nearly flush with the black apron, as in photographs.
      const outletHeight=type996?.300:modern?.313:classicTailpipe.z;
      const outlets=[0];
      for(const delta of outlets){
        r.polygon(Array.from({length:22},(_,i)=>{const a=i*TAU/22;return [tip+.016+.004*Math.sin(a),y+delta+(modern?.069:.059)*Math.cos(a),outletHeight+(modern?.047:.038)*Math.sin(a)];}),'#202527',false);
        ellipse(r,[tip+.021,y+delta,outletHeight],[0,modern?.076:.064,0],[.004,0,modern?.051:.041],1,.86,'#a3a7a6',24);
      }
    });
  }
  r.tag('drive.gearbox',()=>{
    const a=car.rear-.49,b=cx-.28*f;
    barrel(r,[a,0,.395],[b-.085,0,.395],.112,'#858d91',16);barrel(r,[b-.085,0,.40],[b,0,.403],.164,'#89918f',16);
    for(let i=0;i<7;i++){const x=a+.03+i*.043;barrel(r,[x,0,.395],[x+.014,0,.395],.118,'#646c70',14);}
  });
  if(modern){
    if(!type996)draw992DeckCooling(r);
    r.tag('engine.cooling',()=>{
      // The 996 radiators stand behind the outboard intakes, inside the bumper.
      const [rx,ry,rw]=type996?[car.front-.66,.545,.095]:[car.front-.67,.61,.116];
      for(const s of [-1,1]){
        r.box(rx,s*ry-rw,.32,rx+.07,s*ry+rw,.512,'#646f76');
        for(let i=0;i<8;i++){const h=.333+i*.022;r.rod([rx-.004,s*ry-rw+.002,h],[rx-.004,s*ry+rw-.002,h],.004,'#a4b0b0',6);}
      }
    });
  }else draw993CoolingFan(r,[cx+.297*f,0,z+.160],.160);
  drawInstalledBoxer(r,cx,z,modern,car.stations.at(-1)[0],f);

}
export function drawPorsche(r,modern,paint=modern==='996'?'#c3c7c6':modern?'#a84b3f':'#47778a',finish='#bdc6cb',phase=0){
  const car=porscheShape(modern),vehicle=porscheVehicle(modern),gear=running[vehicle];
  if(r.inspection?.assembly==='engine'&&r.isolate&&!r.inspection.detailView){boxer(r,car,modern);return;}
  const design=wheelDesign(vehicle,r.build?.wheelDesign);
  const alternative=design.id!=='stock';
  drawCoachwork(r,car,paint,phase);drawCabrioletCabin(r,car,paint);boxer(r,car,modern);
  for(const rear of [false,true])for(const s of [-1,1]){
    const x=rear?car.rear:car.front,radius=rear?car.rearRadius:car.frontRadius,width=gear.width[rear?1:0];
    const track=gear.track[rear?1:0];
    const brakeRim=gear.brake[rear?1:0];
    const rim=alternative?(rear?design.rearDiameter:design.frontDiameter)*.0127:brakeRim;
    wheel(r,{x,y:s*track/2,z:radius+.006,radius,width,rim,brakeRim,side:s,modern,rear,finish,
      drawRim:alternative?(renderer,c)=>drawAlternativeAlloy(renderer,design,c):gear.rim,tags:{tire:'running.tires',rim:'running.rims',brake:'running.brakes'}});
  }
}
