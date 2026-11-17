const gKitUrl='https://www.gwagenparts.com/product/mercedes-g-class-40mm-lift-kit-eibach-orc/';
const porscheUrl='https://newsroom.porsche.com/dam/jcr%3A027b3198-602a-498d-b4fc-52e6e3b5261a/2020_911_Carrera_S_and_4S_Cabriolet_US_Press_Kit.pdf.PDF#page=15';
const stock={id:'stock',name:'Factory height',description:'Body and wheel centers at the model’s standard ride height.'};
const gKit={id:'g500-orc-40',name:'Eibach / ORC springs · +40 mm',mm:40,partId:'g500-orc-40-kit',source:gKitUrl,sourceText:'View lift kit at GwagenParts',
 description:'The supplier lists this four-spring kit for the 2002–2018 W463 G500/G550. The preview raises both ends by its nominal 40 mm. Spring choice and actual height depend on axle loads and installed equipment.'};
const factoryFront={id:'992-front-axle',name:'Porsche front-axle lift · +40 mm',mm:40,frontOnly:true,source:porscheUrl,sourceText:'Porsche Carrera S Cabriolet technical guide',
 description:'Porsche documents an optional electrohydraulic lift for the 992.1 Carrera S Cabriolet. This shows its raised position at the front axle. Check the car’s equipment record for the fitted option.'};
const options={g500:[stock,gKit],porsche993cab:[stock],porsche992scab:[stock,factoryFront],porsche996cab:[stock]};
export const liftSupply={id:gKit.partId,name:'Eibach / ORC W463 40 mm spring kit',seller:'GwagenParts',sku:'Supplier EAN 2000000034065',price:null,quantity:1,unit:'kit',category:'service',type:'product',vehicles:['g500'],url:gKitUrl,description:gKit.description,fit:'Listed for the 2002–2018 G500/G550. Ask the seller to match spring rate to axle load and installed equipment.',liftMode:gKit.id};
export function liftOptions(vehicle){return Object.hasOwn(options,vehicle)?options[vehicle]:[];}
export function liftChoice(vehicle,mode){return liftOptions(vehicle).find(o=>o.id===mode)||stock;}
export function normalizedLift(vehicle,input){
 const choice=liftChoice(vehicle,input?.mode);
 return {mode:choice.id,mm:choice.mm||0};
}
export function liftCaption(vehicle,raw){return liftChoice(vehicle,raw?.mode).name;}
