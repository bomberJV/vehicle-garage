// Accessories for the 2014 US SL550 (R231), checked on 2026-11-19. Each
// listing carries the part number and source it was verified against, and
// sl550AccessoryAudit records what that source states.
// tests/garage-sl550-accessories.test.mjs pins the list to the audit.
// The factory power windblocker is already standard equipment on this car
// (roof.windblocker), so no separate draught stop is offered.
const brochure='https://www.mbusa.com/vcm/MB/DigitalAssets/pdfmb/brochures/slclass_accessories_brochure.pdf';
const stevensCreek='Mercedes-Benz of Stevens Creek';
const plate='Trunk & plate';
const reference=(label,url)=>({label,url});
function listing(id,kind,fieldKind,details){
  return {id,vehicles:['sl550'],category:'exterior',kind,fieldKind,price:null,quantity:1,
    unit:'kit',visual:'accessory',type:'product',...details};
}

export const sl550Accessories=[
  listing('sl550-rear-spoiler','Body kits & aero','slSpoiler',{
    name:'Mercedes-Benz rear spoiler attachment', sku:'231-790-01-88', seller:'MB Parts Giant', unit:'spoiler', price:2641.80,
    url:'https://mbpartsgiant.com/genuine/mercedes-benz~spoiler~2317900188',
    fit:'The seller’s fitment table lists 231-790-01-88 for the 2013–2016 SL550, the SL63 AMG and SL65 AMG of the same years, and the 2015–2016 SL400. Confirm it against the VIN with a Mercedes-Benz dealer.',
    description:'A low lip runs along the trailing edge of the trunk lid, above the center brake light, and travels with the lid while the hardtop folds. The seller does not state the finish, so the preview shows it in body color. Its profile and height are an approximation.',
    source:reference('MB Parts Giant · 231-790-01-88 fitment: 2013–2016 SL550','https://mbpartsgiant.com/genuine/mercedes-benz~spoiler~2317900188')
  }),
  listing('sl550-trunk-handle',plate,'slTrunkHandle',{
    name:'Mercedes-Benz trunk handle · polished stainless', sku:'07 BQ 675 0004', seller:stevensCreek, unit:'handle',
    url:'https://mbparts.mbusa.com/oem-parts/mercedes-benz-trunk-handle-polished-stainless-steel-q6750004',
    fit:'Listed in the 2012 Mercedes-Benz USA accessories brochure for the R231 SL-Class. The dealer sells it as Q-6-75-0004 and marks it discontinued; the satin version was 07 BQ 675 0034.',
    description:'A stainless strip clamps behind the top edge of the rear license plate and turns back into a short lip, so the lid can be closed without touching the paint. The brochure does not show how the lip sits below the rear-view camera. The preview’s profile is an approximation.',
    source:reference('Mercedes-Benz USA · SL-Class accessories brochure, pp. 7 and 15: trunk handles',brochure+'#page=7')
  }),
  listing('sl550-plate-frame',plate,'slPlateFrame',{
    name:'Mercedes-Benz license plate frame · polished stainless', sku:'07 BQ 688 0086', seller:stevensCreek, unit:'frame', price:44,
    exclusive:'sl550-plate-frame', url:'https://mbparts.mbusa.com/oem-parts/mercedes-benz-license-frame-polished-stainless-steel-q6880086',
    fit:'Listed in the 2012 Mercedes-Benz USA accessories brochure for the R231 SL-Class; the dealer sells it as Q-6-88-0086. It leaves all four registration-tag corners clear.',
    description:'A polished stainless frame surrounds the rear plate in the trunk-lid recess, with the Mercedes-Benz name on its lower bar. The bar widths are an approximation.',
    source:reference('Mercedes-Benz USA · SL-Class accessories brochure, pp. 7 and 14: license plate frames',brochure+'#page=7')
  }),
  listing('sl550-plate-frame-slim',plate,'slSlimFrame',{
    name:'Mercedes-Benz Slimline license plate frame · black pearl', sku:'07 BQ 688 0092', seller:stevensCreek, unit:'frame',
    exclusive:'sl550-plate-frame', url:'https://mbparts.mbusa.com/oem-parts/mercedes-benz-license-frame-slimline-q6880092',
    fit:'Listed in the 2012 Mercedes-Benz USA accessories brochure for the R231 SL-Class. The dealer lists it as Q-6-88-0092 and marks it discontinued. It replaces the polished frame.',
    description:'A narrow black frame without lettering edges the rear plate and leaves the tag corners clear. The bar widths are an approximation.',
    source:reference('Mercedes-Benz USA · SL-Class accessories brochure, pp. 7 and 14: license plate frames',brochure+'#page=7')
  }),
  listing('sl550-all-season-mats','Interior','slMats',{
    name:'Mercedes-Benz all-season floor mats CLASSIC · black', sku:'A231 680 14 02 9G33', seller:'Mercedes-Benz accessories', unit:'set of two', category:'interior',
    url:'https://store.mercedes-benz.no/All-season-floor-mats-CLASSIC-Set-Set-of-2/A23168014029G33',
    fit:'Mercedes-Benz lists this left-hand-drive set for the R231 SL built from 03/12 to 03/16, which covers the 2014 SL550. The 2012 US accessories brochure gave the set as A231 680 2148 9G33; ask a US dealer for the current number.',
    description:'Two black rubber mats with a raised edge cover the driver and passenger footwells and fix to the factory mushroom-head fasteners. The rib pattern is an approximation.',
    source:reference('Mercedes-Benz accessories · A23168014029G33: SL Roadster R231, 03/12–03/16, left-hand drive','https://store.mercedes-benz.no/All-season-floor-mats-CLASSIC-Set-Set-of-2/A23168014029G33')
  })
];

export const sl550AccessoryAudit=[
  {id:'sl550-rear-spoiler',sku:'231-790-01-88',source:'https://mbpartsgiant.com/genuine/mercedes-benz~spoiler~2317900188',
   states:'231-790-01-88, Rear Spoiler Attachment, genuine Mercedes-Benz. Fits 2013–2016 SL550 (4.7 L V8), SL63 AMG, SL65 AMG and 2015–2016 SL400. $2,641.80 (MSRP $3,700) on 2026-11-19; finish not stated.',
   approximate:'Profile and height: drawn to the trunk-lid edge; the seller gives no drawing or dimensions.'},
  {id:'sl550-trunk-handle',sku:'07 BQ 675 0004',source:brochure+'#page=7',
   states:'Brochure ACC-12-R2311 (04/12), p. 7: made of stainless steel in polished or satin finish, this handle attaches to the license plate and trunk lid. Trunk Handle (Polished Stainless Steel) 07 BQ 675 0004; satin 07 BQ 675 0034. Dealer listing Q-6-75-0004, discontinued.',
   approximate:'Profile: the brochure gives a photograph only, and does not show the camera above the plate.'},
  {id:'sl550-plate-frame',sku:'07 BQ 688 0086',source:brochure+'#page=7',
   states:'Brochure ACC-12-R2311 (04/12), pp. 7 and 14: Mercedes-Benz Frame (Polished stainless steel) 07 BQ 688 0086; frames do not block registration tags. Dealer listing Q-6-88-0086, $44.00 on 2026-11-19.',
   approximate:'Bar widths: drawn around the modelled US plate, not to a dimension.'},
  {id:'sl550-plate-frame-slim',sku:'07 BQ 688 0092',source:brochure+'#page=7',
   states:'Brochure ACC-12-R2311 (04/12), pp. 7 and 14: Slimline Frame (Black pearl coat stainless steel) 07 BQ 688 0092. Dealer listing Q-6-88-0092, discontinued.',
   approximate:'Bar widths: drawn around the modelled US plate, not to a dimension.'},
  {id:'sl550-all-season-mats',sku:'A231 680 14 02 9G33',source:'https://store.mercedes-benz.no/All-season-floor-mats-CLASSIC-Set-Set-of-2/A23168014029G33',
   states:'A23168014029G33, All-season floor mats CLASSIC, set of 2, black rubber with a raised edge, mushroom-head fasteners. SL Roadster R231 03/12–03/16 and 04/16–03/22, left-hand drive. The 2012 US brochure p. 14 lists All-Season Floor Mats (Black, set of two) A231 680 2148 9G33.',
   approximate:'Rib pattern and outline: drawn to the modelled footwell.'}
];
