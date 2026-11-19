// Genuine BMW accessories for the 2008 328xi sedan (E90 pre-LCI, xDrive, N52).
// Each row's fitment was checked on 2026-11-19 against the page in its source;
// e90AccessoryAudit records what that page states. The four roof setups share
// one base support system and replace each other. Previews:
// e90-accessory-geometry.js. Test: tests/garage-e90-accessories.test.mjs.
const vehicle='bmw328xi';
const roof='Roof racks';
const rackSku='82 71 0 403 104';
const rackUrl='https://www.bmwpartsdeal.com/parts/bmw-accessories_base_support_system-82710403104.html';
const leebmannRack='https://www.leebmann24.com/fi/en/product/bmw-roof-rack-10000291';
const ref=(label,url)=>({label,url});
function listing(id,fieldKind,kind,details){
  return {id,vehicles:[vehicle],category:'exterior',kind,fieldKind,price:null,quantity:1,
    unit:'kit',visual:'accessory',type:'product',...details};
}
const rackFit='BMW Parts Deal lists base support system 82 71 0 403 104 for the 2007–2008 328xi sedan (E90). It mounts on the threaded bushes in the roof. Leebmann24 gives a maximum roof load of 75 kg.';

export const e90FieldOptions=[
  listing('b90-roof-rack','e90RoofRack',roof,{
    name:'BMW base support system, E90 sedan', sku:rackSku, seller:'BMW Parts Deal', unit:'pair of crossbars',
    exclusive:'b90-roof', url:rackUrl, fit:rackFit,
    description:'Two lockable anodised-aluminium crossbars on steel feet in plastic housings. It carries every BMW roof attachment, including the ski holder, bicycle holder and roof boxes. The bar positions and foot shapes in the preview are an approximation.',
    source:ref('BMW Parts Deal · 82 71 0 403 104 fitment: 2007–2008 328xi sedan (E90)',rackUrl)
  }),
  listing('b90-ski-holder','e90SkiRack',roof,{
    name:'BMW ski and snowboard holder on the base support system', sku:rackSku+' + 82 72 2 326 527', seller:'Leebmann24', unit:'holder and crossbars',
    exclusive:'b90-roof', url:'https://leebmann24.com/fi/en/product/bmw-ski-and-snowboard-holder-10000279',
    fit:'Leebmann24 lists the extendable holder for the E90 and for use only on BMW roof racks; here it sits on the E90 base support system. It takes up to five pairs of skis or four snowboards. Keep the total within the 75 kg roof load.',
    description:'A lockable clamp on each crossbar slides out to the side for loading. The support is 62 cm wide. Two pairs of skis and a snowboard are shown. The clamp section is an approximation.',
    source:ref('Leebmann24 · 82 72 2 326 527: capacity, 62 cm width, E90 compatibility','https://leebmann24.com/fi/en/product/bmw-ski-and-snowboard-holder-10000279')
  }),
  listing('b90-bike-holder','e90BikeRack',roof,{
    name:'BMW bicycle holder on the base support system', sku:rackSku+' + 82 72 2 472 964', seller:'Leebmann24', unit:'holder and crossbars',
    exclusive:'b90-roof', url:'https://leebmann24.com/ch/en/product/bmw-bicycle-roof-rack-10000280',
    fit:'Leebmann24 lists this lockable holder for the E90 and for all BMW roof rack systems. It carries one bicycle up to 20 kg; up to four fit, depending on rack width and roof load.',
    description:'A wheel channel spans both crossbars, an arm grips the down tube and straps hold both wheels. A generic bicycle is drawn to show how it rides; it is not part of the holder. The holder’s proportions are an approximation.',
    source:ref('Leebmann24 · 82 72 2 472 964: 20 kg bicycle, frame tubes, E90 compatibility','https://leebmann24.com/ch/en/product/bmw-bicycle-roof-rack-10000280')
  }),
  listing('b90-roof-box','e90RoofBox',roof,{
    name:'BMW roof box 320 on the base support system', sku:rackSku+' + 82 73 2 420 634', seller:'Leebmann24', unit:'box and crossbars',
    exclusive:'b90-roof', url:'https://leebmann24.com/fr/en/product/bmw-roof-box-320-black-320-l-10000276',
    fit:'Leebmann24 lists the 320-litre box for the E90 and for all BMW roof rack systems. It carries up to 50 kg, within the car’s 75 kg roof load, and takes skis up to 180 cm.',
    description:'A glossy black lid over titanium-silver sides, about 1,910 × 640 × 400 mm. It opens from either side and locks at three points on each. The box’s nose and tail curves are an approximation.',
    source:ref('BMW UK shop · 82 73 2 420 634: 1,910 × 640 × 400 mm, 50 kg, opens both sides','https://shop.bmw.co.uk/9144/genuine-roof-box-320-litres-black-abs-plastic-up-to-50kg-82-73-2-420-634')
  }),
  listing('b90-rear-spoiler','e90Spoiler','Body kits & aero',{
    name:'BMW rear lid spoiler, primed', sku:'51 71 0 396 344', seller:'BMW Parts Deal', unit:'spoiler',
    url:'https://www.bmwpartsdeal.com/parts/bmw-primed_rear_spoiler-51710396344.html',
    fit:'BMW Parts Deal lists 51 71 0 396 344 for the 2007–2008 328xi sedan (E90). It is primed for painting in the body colour and bonded to the lid, so a body shop should fit it.',
    description:'A low lip along the trailing edge of the trunk lid. Leebmann24 says it was tested in the BMW wind tunnel and improves downforce. The section is drawn from photographs and is an approximation.',
    source:ref('BMW Parts Deal · 51 71 0 396 344 fitment: 2007–2008 328xi sedan (E90)','https://www.bmwpartsdeal.com/parts/bmw-primed_rear_spoiler-51710396344.html')
  }),
  listing('b90-rubber-mats','e90FloorMats','Interior',{
    name:'BMW all-weather floor mats, front', sku:'51 47 0 427 557', seller:'BMW Parts Deal', unit:'pair', category:'interior',
    url:'https://www.bmwpartsdeal.com/parts/bmw-kit_floor_mats_rubber_front-51470427557.html',
    fit:'BMW Parts Deal lists this front pair for the all-wheel-drive xi and xDrive models, including the 2007–2008 328xi sedan. It is now supplied as 51 47 2 311 000.',
    description:'Black rubber mats for both front footwells with a raised rim. In use they replace the carpet mats; the preview lays them over the carpet. The outline and ribs are an approximation.',
    source:ref('BMW Parts Deal · 51 47 0 427 557 fitment: 2007–2008 328xi sedan (E90)','https://www.bmwpartsdeal.com/parts/bmw-kit_floor_mats_rubber_front-51470427557.html')
  })
];

// What each retrieved page states (2026-11-19).
export const e90AccessoryAudit=[
  {id:'b90-roof-rack',sku:'82 71 0 403 104',source:rackUrl,
   states:'BMW Parts Deal 82710403104 Base Support System: fits 2007-2008 328xi Sedan N51/N52 (E90). Leebmann24 10000291: revised multifunctional roof rack system for the E87 and E90, mounts on the existing threaded roof bushes, maximum roof load 75 kg.',
   also:[leebmannRack],approximate:'Bar positions and foot shapes: no dimensioned drawing was found.'},
  {id:'b90-ski-holder',sku:'82 72 2 326 527',source:'https://leebmann24.com/fi/en/product/bmw-ski-and-snowboard-holder-10000279',
   states:'Leebmann24 82722326527 Ski and Snowboard Holder: laterally extendable, up to 5 pairs of skis or 4 snowboards, lockable, ski support width 62 cm, use only with BMW Group approved roof racks; 3 Series E90 listed.',
   approximate:'Clamp section.'},
  {id:'b90-bike-holder',sku:'82 72 2 472 964',source:'https://leebmann24.com/ch/en/product/bmw-bicycle-roof-rack-10000280',
   states:'Leebmann24 82722472964 Bicycle Roof Rack: one bike up to 20 kg, lockable, frames up to 100 mm, all BMW roof rack systems; 3 Series E90 listed.',
   approximate:'Channel, arm and the generic bicycle.'},
  {id:'b90-roof-box',sku:'82 73 2 420 634',source:'https://shop.bmw.co.uk/9144/genuine-roof-box-320-litres-black-abs-plastic-up-to-50kg-82-73-2-420-634',
   states:'BMW UK 82 73 2 420 634 Roof Box 320: approx. 1,910 x 640 x 400 mm, 320 litres, up to 50 kg, opens from both sides with three locks each, all BMW roof rack systems. Leebmann24 lists 3 Series E90.',
   also:['https://leebmann24.com/fr/en/product/bmw-roof-box-320-black-320-l-10000276'],approximate:'Nose and tail curves.'},
  {id:'b90-rear-spoiler',sku:'51 71 0 396 344',source:'https://www.bmwpartsdeal.com/parts/bmw-primed_rear_spoiler-51710396344.html',
   states:'BMW Parts Deal 51710396344 Primed Rear Spoiler: fits 2007-2008 328xi Sedan N51/N52 (E90). Leebmann24 10005807: primed, paintable, tested in the BMW wind tunnel, bonded with adhesive.',
   also:['https://www.leebmann24.com/at/en/product/bmw-rear-spoiler-primed-10005807'],approximate:'Section.'},
  {id:'b90-rubber-mats',sku:'51 47 0 427 557',source:'https://www.bmwpartsdeal.com/parts/bmw-kit_floor_mats_rubber_front-51470427557.html',
   states:'BMW Parts Deal 51470427557 Rubber Floor Mats Kit Front, replaced by 51472311000: fits 2007-2008 328xi Sedan N51/N52 (E90) and the other xi and xDrive models.',
   approximate:'Outline and ribs.'}
];
