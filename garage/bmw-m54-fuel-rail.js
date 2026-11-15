import {m54InstalledPoint} from './bmw-m54-installation.js';
// Installed M54 rail and injectors have one physical location in both the
// fuel-system and engine explorers. -X points toward the front bumper.
const railStart=m54InstalledPoint([-.46,-.14,.435]),railEnd=m54InstalledPoint([.47,-.14,.435]);
export const m54RailInlet=m54InstalledPoint([.55,-.14,.35]);
export function drawM54FuelRail(r){
 r.instance('bank-0',()=>{
  r.rod(railStart,railEnd,.012,'#8f9b9f',10);
  r.rod(railEnd,m54RailInlet,.007,'#273238',8);
 });
}
export function drawM54Injectors(r){
 const step=(.98-.18)/6;
 for(let i=0;i<6;i++)r.instance('0-'+i,()=>{
  const x=-.49+.09+step*(i+.5);
  r.rod(m54InstalledPoint([x,-.14,.435]),m54InstalledPoint([x,-.133,.355]),.012,'#303c43',8);
  const lo=m54InstalledPoint([x-.012,-.156,.410]),hi=m54InstalledPoint([x+.014,-.124,.440]);
  r.box(...lo,...hi,'#416454');
 });
}
