import {wheelOptions} from './wheel-designs.js';

const rows=new Map();
export function wheelSupplyRows(vehicle){
  if(!rows.has(vehicle)){
    rows.set(vehicle,wheelOptions(vehicle).filter(option=>option.id!=='stock'&&option.buy?.url).map(option=>({
      id:'rim-'+vehicle+'-'+option.id,designId:option.id,name:option.name,category:'wheels',
      vehicles:[vehicle],description:option.description,fit:option.fitment,sku:option.partNumber||option.name,
      seller:option.maker||option.buy.label,url:option.buy.url,rearUrl:option.buyRear?.url,
      fitmentUrl:option.source?.url,type:'wheel set',price:null,quantity:1,unit:'set',exclusive:'rim-set'
    })));
  }
  return rows.get(vehicle);
}
