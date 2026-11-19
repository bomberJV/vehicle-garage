export const carrier993Id='993-cabrio-load-carrier';
export const skiCarrier993Id='993-cabrio-ski-carrier';
// The 996's aluminum hardtop closes the car over the folded fabric top. Its
// roof transport system rides on the raised top, or on the hardtop when fitted.
export const hardtop996Id='996-aluminum-hardtop';
export const carrier996Id='996-cabrio-roof-transport';
export function hasHardtop(build){
  return build.vehicle==='porsche996cab'&&build.parts?.includes(hardtop996Id)===true;
}
export function hasRoofCarrier(build){
  if(build.vehicle==='porsche996cab')return build.parts?.includes(carrier996Id)===true&&!hasHardtop(build);
  return build.vehicle==='porsche993cab'&&(build.parts?.includes(carrier993Id)||build.parts?.includes(skiCarrier993Id))===true;
}
export const roofReferences={
  sl550:{label:'Mercedes-Benz SL operator’s manual',url:'https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf'},
  porsche993cab:{label:'Porsche parts drawing',url:'https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=546'},
  porsche996cab:{label:'Porsche Classic · 996 Cabriolet fabric roof',url:'https://www.porsche.com/central-eastern-europe/en/_bulgaria_/accessoriesandservice/classic/models/996/996/'},
  porsche992scab:{label:'Porsche Cabriolet roof',url:'https://newsroom.porsche.com/en_US/products/new-2020-porsche-911-carreras-4s-cabriolet-18344.html'}
};
export const hasConvertibleRoof=id=>Object.hasOwn(roofReferences,id);
export function isPorscheCabriolet(id){return id==='porsche993cab'||id==='porsche992scab'||id==='porsche996cab';}
