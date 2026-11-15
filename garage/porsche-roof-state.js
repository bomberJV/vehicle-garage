export const carrier993Id='993-cabrio-load-carrier';
export function hasRoofCarrier(build){
  return build.vehicle==='porsche993cab'&&build.parts?.includes(carrier993Id);
}
export const roofReferences={
  sl550:{label:'Mercedes-Benz SL operator’s manual',url:'https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf'},
  porsche993cab:{label:'Porsche parts drawing',url:'https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=546'},
  porsche992scab:{label:'Porsche Cabriolet roof',url:'https://newsroom.porsche.com/en_US/products/new-2020-porsche-911-carreras-4s-cabriolet-18344.html'}
};
export const hasConvertibleRoof=id=>Object.hasOwn(roofReferences,id);
export function isPorscheCabriolet(id){return id==='porsche993cab'||id==='porsche992scab';}
