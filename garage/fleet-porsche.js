import {classicTailpipe,classicTailpipeEnd} from './porsche993-body-profile.js';
import {draw992DeckCooling} from './porsche-deck-cooling.js';
import {draw993CoolingFan} from './porsche-fan.js';
import {drawInstalledBoxer} from './porsche-engine-dress.js';
import {drawEngineCore} from './porsche-crankshaft.js';
import {drawFleetIgnition} from './fleet-ignition.js';
import {ellipse,barrel,wheel} from './road-primitives.js';
import {drawCoachwork,coupeShape} from './porsche-coachwork.js';
import {drawCabrioletCabin} from './porsche-cabin.js';
import {alloy993,alloy992} from './porsche-wheels.js';
import {wheelDesign} from './wheel-designs.js';
import {drawAlternativeAlloy} from './wheel-faces.js';

const TAU=2*Math.PI;
function boxer(r,car,modern){
  const cx=car.rear+.285, z=.502;
  drawFleetIgnition(r,modern?'porsche992scab':'porsche993cab',[cx,0,z]);
  drawEngineCore(r,cx,z,modern);
  for(const s of [-1,1]){
    for(let n=0;n<3;n++){
      const x=cx-.1845+n*.178+s*.0445;
      r.tag('engine.cylinders',()=>{
        barrel(r,[x,s*.12,z],[x,s*.37,z],.077,'#939a9e',14);
        if(!modern)for(let f=0;f<7;f++){
          const y=s*(.17+f*.027);
          const rim=Array.from({length:10},(_,i)=>[x+.086*Math.cos(i*TAU/10),y,z+.086*Math.sin(i*TAU/10)]);
          // Thin cooling fins remain distinct in the vehicle overview. The
          // cylinder intersects each centre, leaving the annular rim exposed.
          r.polygon(rim,'#696e72',false);
        }
      });
    }
    r.tag('drive.axles',()=>{barrel(r,[car.rear,s*.109,.345],[car.rear,s*.663,.345],.025,'#7e8281');barrel(r,[car.rear,s*.536,.345],[car.rear,s*.62,.345],.046,'#3d4449');});
    r.tag('engine.exhaust',()=>{
      const tip=modern?car.stations.at(-1)[0]-.082:classicTailpipeEnd(),y=s*(modern?.455:classicTailpipe.y);
      // The 992.1 Cabriolet is shown with the optional two-oval Sport Exhaust.
      const outletHeight=modern?.313:classicTailpipe.z;
      const outlets=[0];
      for(const delta of outlets){
        r.polygon(Array.from({length:22},(_,i)=>{const a=i*TAU/22;return [tip+.016+.004*Math.sin(a),y+delta+(modern?.069:.059)*Math.cos(a),outletHeight+(modern?.047:.038)*Math.sin(a)];}),'#202527',false);
        ellipse(r,[tip+.021,y+delta,outletHeight],[0,modern?.076:.064,0],[.004,0,modern?.051:.041],1,.86,'#a3a7a6',24);
      }
    });
  }
  r.tag('drive.gearbox',()=>{
    const a=car.rear-.49,b=cx-.28;
    barrel(r,[a,0,.395],[b-.085,0,.395],.112,'#858d91',16);barrel(r,[b-.085,0,.40],[b,0,.403],.164,'#89918f',16);
    for(let i=0;i<7;i++){const x=a+.03+i*.043;barrel(r,[x,0,.395],[x+.014,0,.395],.118,'#646c70',14);}
  });
  if(modern){
    draw992DeckCooling(r);
    r.tag('engine.cooling',()=>{
      for(const s of [-1,1]){
        r.box(car.front-.67,s*.61-.116,.32,car.front-.60,s*.61+.116,.512,'#646f76');
        for(let i=0;i<8;i++){const h=.333+i*.022;r.rod([car.front-.674,s*.61-.114,h],[car.front-.674,s*.61+.114,h],.004,'#a4b0b0',6);}
      }
    });
  }else draw993CoolingFan(r,[cx+.297,0,z+.170]);
  drawInstalledBoxer(r,cx,z,modern,car.stations.at(-1)[0]);

}
export function drawPorsche(r,modern,paint=modern?'#a84b3f':'#47778a',finish='#bdc6cb',phase=0){
  const car=coupeShape[modern?1:0];
  if(r.inspection?.assembly==='engine'&&r.isolate&&!r.inspection.detailView){boxer(r,car,modern);return;}
  const design=wheelDesign(modern?'porsche992scab':'porsche993cab',r.build?.wheelDesign);
  const alternative=design.id!=='stock';
  drawCoachwork(r,car,paint,phase);drawCabrioletCabin(r,car,paint);boxer(r,car,modern);
  for(const rear of [false,true])for(const s of [-1,1]){
    const x=rear?car.rear:car.front,radius=rear?car.rearRadius:car.frontRadius,width=modern?(rear?.305:.245):(rear?.245:.205);
    const track=modern?(rear?1.556:1.59):(rear?1.444:1.405);
    const brakeRim=modern?(rear?.2667:.254):.2032;
    const rim=alternative?(rear?design.rearDiameter:design.frontDiameter)*.0127:brakeRim;
    wheel(r,{x,y:s*track/2,z:radius+.006,radius,width,rim,brakeRim,side:s,modern,rear,finish,
      drawRim:alternative?(renderer,c)=>drawAlternativeAlloy(renderer,design,c):modern?alloy992:alloy993,tags:{tire:'running.tires',rim:'running.rims',brake:'running.brakes'}});
  }
}
