import {sectionedWheel} from './sectioned-road-wheel.js';
import {utilityWheelSpokes} from './exterior-utility.js';
import {g500StockWheel,g500AtikWheel} from './g500-wheel-specs.js';

export function drawG500WheelAndTire(r,mount){
  const id=mount.design?.id,spec=id==='atik'?g500AtikWheel:g500StockWheel;
  sectionedWheel(r,mount,spec,g500StockWheel.offset,(r,face)=>{
    utilityWheelSpokes(r,{vehicle:'g500',design:id,...face});
  });
}
