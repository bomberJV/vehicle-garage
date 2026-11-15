// Each year-specific preview has a stable build ID and a selectable mesh ID.
// Design mock-ups are saved with the build, outside the shopping and quote lists.
const groups={guard:'Brush guards',ladder:'Ladders',snorkel:'Raised intakes',aux:'Auxiliary lighting',display:'Display lighting'};
export function fieldOption(vehicle,fieldKind,details){
  return {vehicles:[vehicle],id:vehicle+'-field-'+fieldKind,fieldKind,kind:groups[fieldKind],
    category:'exterior',visual:'accessory',quantity:1,unit:'kit',price:null,url:null,seller:null,sku:null,
    ...details,type:details.mockup?'design mock-up':'product'};
}
