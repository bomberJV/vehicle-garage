// Factory figures are independent of the measurements taken from the generated stock mesh.
export const dimensionManual='https://www.manualsonline.com/manuals/mfg/mercedesbenz/2002_g_500.html?p=363';
export const bodyDrawing='https://www.docdroid.net/file/download/mfdy/einfuehrung-g-2006.pdf#page=30';
const g500Dimensions=[
  ['length','Length including spare',4715],['width','Width across mirrors',2007],
  ['height','Height from tire contact',1977],['wheelbase','Wheelbase',2850],
  ['frontTrack','Front track',1515],['rearTrack','Rear track',1515]
];
export const coupeManual='https://bmw330ci.net/the330ci/2003Manual-3SeriesCoupe.pdf#page=147';
export const e90Specs='https://www.edmunds.com/bmw/3-series/2008/st-100946472/features-specs';
export const e90Widths='https://www.auto-data.net/en/compare&carId1=51944&carId2=&carId3=';
export const coupeFiling='https://static.nhtsa.gov/nhtsa/downloads/MfrMail/01-022-N11B-9574.pdf#page=5';
const source=(label,url)=>({label,url});
const carreraBrochure='https://files.porsche.com/filestore/download/international/en/modelseries-911carrera992-downloads-catalogue/default/64090fb6-12a5-11ea-80c6-005056bbdc38/911-Carrera-Brochure.pdf';
export const dimensionStudies={
  sl550:{name:'2014 US SL550 · R231 · Sport Wheel Package',make:'Mercedes-Benz',short:'2014 SL550',unit:'in',
    rows:[['length','Overall length',181.6],['width','Width across mirrors',82.6],['height','Height with roof raised',51.8],['wheelbase','Wheelbase',101.8]],
    description:'Compare the raised hardtop, bumper tips and mirror span with the US model specifications.',
    note:'The comparison shows the closed Vario-roof, extended mirrors and the 19-inch Sport wheels. The US brochure rounds dimensions to a tenth of an inch.',
    sources:[source('Mercedes-Benz USA · SL550 dimensions','https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf#page=25'),source('Mercedes-Benz · R231 side elevation, drawing P00.10-5105-00','https://www.manualslib.de/manual/89970/Mercedes-Benz-Typenreihe-231.html?page=21'),source('Mercedes-Benz · R231 rescue card','https://rk.mb-qr.com/en/231/')]},
  porsche993cab:{name:'1998 US 911 Carrera Cabriolet · 993',make:'Published',short:'1998 Carrera Cabriolet',unit:'mm',
    rows:[['length','Overall length',4260],['bodyWidth','Body width without mirrors',1735],['height','Height with roof raised',1315],['wheelbase','Wheelbase',2272]],
    description:'Compare the narrow-body Carrera with the top up. The wheel centers and the widest part of the rear fenders are measured directly on the model.',
    note:'The dimensions are for the US rear-wheel-drive Cabriolet. Height is measured from the tire contact patch. The Porsche rescue sheet supplies a second reference for the windshield and wheel positions.',
    sources:[source('Excellence · 1998 Carrera Cabriolet specifications','https://www.excellence-mag.com/resources/specs/319'),source('Porsche Classic · 993 Cabriolet outline','https://files.porsche.com/f/332100/e5c1d1c36c/rescue-data-sheets-classic.pdf#page=32'),source('Photographs · US 1998 Carrera Cabriolet','https://bringatrailer.com/listing/1998-porsche-911-carrera-cabriolet-48/')]},
  porsche996cab:{name:'1999 US 911 Carrera Cabriolet · 996.1',make:'Published',short:'1999 Carrera Cabriolet',unit:'mm',
    rows:[['length','Overall length',4430],['bodyWidth','Body width without mirrors',1765],['height','Height with roof raised',1305],['wheelbase','Wheelbase',2350]],
    description:'Compare the first water-cooled Cabriolet with its top up. The wheel centers and the widest part of the rear fenders are measured directly on the model.',
    note:'The dimensions are for the rear-wheel-drive Carrera Cabriolet. Height is measured from the tire contact patch with the fabric top raised. The rescue sheet’s side and plan views were registered at the wheelbase and fitted to these spans.',
    sources:[source('Excellence · 1999 911 Carrera Cabriolet (996) specifications','https://www.excellence-mag.com/resources/specs/58'),source('Porsche Classic · 996 Cabriolet outline','https://files.porsche.com/f/332100/e5c1d1c36c/rescue-data-sheets-classic.pdf#page=36'),source('Photographs · US 1999 Carrera Cabriolet','https://bringatrailer.com/listing/1999-porsche-911-carrera-71/')]},
  porsche992scab:{name:'2023 911 Carrera S Cabriolet · 992.1',make:'Porsche',short:'2023 Carrera S Cabriolet',unit:'mm',
    rows:[['length','Overall length',4519],['bodyWidth','Body width without mirrors',1852],['width','Width across mirrors',2024],['height','Height with roof raised',1299],['wheelbase','Wheelbase',2450]],
    description:'Compare the length, both widths, closed-roof height and wheelbase with the Carrera S Cabriolet column in Porsche’s 992.1 brochure.',
    note:'The stock model uses the closed roof, extended mirrors and lowered spoiler. Body width is measured across the fenders. The wheel centerlines set the wheelbase.',
    sources:[source('Porsche · 992.1 Carrera S Cabriolet technical data',carreraBrochure),source('Porsche · 992 Cabriolet outline','https://files.porsche.com/f/332100/cae3f3bc15/rescue-data-sheets.pdf#page=86')]},
  bmws1000rr:{name:'2023 BMW S 1000 RR · K67',make:'BMW',short:'2023 S 1000 RR',unit:'mm',
    rows:[['length','Overall length',2073],['width','Width across mirrors',846],['wheelbase','Wheelbase',1457]],
    description:'Compare the motorcycle’s overall length, mirror span and wheelbase with BMW’s North American launch specifications.',
    note:'The motorcycle stands upright with the front wheel straight. The side view marks the two axle centers. The front and rear views show the mirror span.',
    sources:[source('BMW Motorrad · 2023 North American launch specifications','https://www.press.bmwgroup.com/usa/article/attachment/T0404178EN_US/571374'),source('2023 S 1000 RR · Racing Red studio profile','https://2wheelshero.com/cdn/shop/collections/S1000RR_2023_1200x1200.png?v=1679872683')]},
  g500:{name:'2002 US G 500 · W463.249',make:'Mercedes',short:'2002 G500',unit:'mm',rows:g500Dimensions,
    description:'The 2002 US manual gives six exterior dimensions. Compare them with measurements from the stock model in three views.',
    note:'Measurements use the stock wheels, closed roof and spare cover. Track is the distance between the tire centerlines on one axle.',
    sources:[source('2002 US manual · p. 360',dimensionManual),source('Later W463 body drawing · p. 25',bodyDrawing)]},
  bmw328xi:{name:'2008 US 328xi sedan · N52 · xDrive',make:'BMW',short:'2008 328xi',unit:'in',
    rows:[['length','Length across bumpers',178.2],['bodyWidth','Body width',71.5],['width','Width across mirrors',79.3],
      ['height','Height from tire contact',55.9],['wheelbase','Wheelbase',108.7],['frontTrack','Front track',59.1],['rearTrack','Rear track',59.6]],
    description:'View the stock sedan from the side, front or rear and compare its seven spans with the published 328xi figures.',
    note:'Edmunds lists the 328xi sedan’s length, width, height, wheelbase and tracks. The 2,013-mm width across the mirrors is from auto-data.net’s 328xi sedan entry. Stock 16-inch wheels and closed windows are shown.',
    sources:[source('Edmunds · 2008 328xi sedan specifications',e90Specs),source('auto-data.net · 328xi sedan (E90) dimensions',e90Widths)]},
  bmw325ci:{name:'2003 US 325Ci coupé · M54 · model 0334',make:'BMW',short:'2003 325Ci',unit:'in',
    rows:[['length','Length across bumpers',176.7],['bodyWidth','Body width',69.2],['width','Width across mirrors',76.7],
      ['height','Height from tire contact',53.9],['wheelbase','Wheelbase',107.3],['frontTrack','Front track',57.5],['rearTrack','Rear track',58.4]],
    description:'View the stock coupé from the side, front or rear and compare its seven spans with BMW’s figures.',
    note:'The US filing gives a 57.5-inch front track for this 325Ci. The shared 325Ci/330Ci manual drawing shows 57.9. The manual supplies the mirror width. Stock wheels and closed windows are shown.',
    sources:[source('BMW coupé manual · p. 147',coupeManual),source('BMW US filing · row 0334',coupeFiling)]}
};
// Read off BMW's printed side view at five stations. Calibration uses the road line
// and front/rear wheel centers. The dots indicate drawing-scale estimates.
export const coupeProfileStations=[
  [-1.36,.89],[-.90,.94],[.22,1.37],[1.74,1.10],[2.09,1.02]
];
function emptyBounds(){return {min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};}
function include(bounds,p){
  for(let k=0;k<3;k++){
    bounds.min[k]=Math.min(bounds.min[k],p[k]);
    bounds.max[k]=Math.max(bounds.max[k],p[k]);
  }
}
export function measureStockMesh(vehicle,faces){
  const cabriolet=vehicle==='porsche993cab'||vehicle==='porsche992scab'||vehicle==='porsche996cab';
  const motorcycle=vehicle==='bmws1000rr';
  const tireTag=cabriolet||motorcycle||vehicle==='sl550'?'running.tires':'wheels.tire';
  const envelope=emptyBounds(),body=emptyBounds(),bumpers=emptyBounds(),tires=new Map();
  for(const f of faces){
    let wheel;
    if(f.part===tireTag && f.instance){
      if(!tires.has(f.instance))tires.set(f.instance,emptyBounds());
      wheel=tires.get(f.instance);
    }
    const bodyPanel=cabriolet?f.part==='shell.fenders':f.part?.startsWith('body.') && !f.part.startsWith('body.mirror-');
    const bumper=f.part==='body.front-bumper'||f.part==='body.rear-bumper';
    for(const p of f.points){
      include(envelope,p);
      if(wheel)include(wheel,p);
      if(bodyPanel)include(body,p);
      if(bumper)include(bumpers,p);
    }
  }
  const wheels={};
  for(const [id,bounds] of tires)wheels[id]=bounds.min.map((lo,k)=>(lo+bounds.max[k])/2);
  const fl=wheels['front-left'],fr=wheels['front-right'],rl=wheels['rear-left'],rr=wheels['rear-right'];
  const front= motorcycle?wheels.front:fl, rear=motorcycle?wheels.rear:rl;
  if(!front||!rear||(!motorcycle&&(!fr||!rr)))throw new Error('Missing mounted tires in the dimension comparison.');
  const ground=Math.min(...[...tires.values()].map(bounds=>bounds.min[2]));
  const {min,max}=envelope;
  const meters={length:max[0]-min[0],width:max[1]-min[1],height:max[2]-ground,
    wheelbase:motorcycle?rear[0]-front[0]:(rl[0]+rr[0]-fl[0]-fr[0])/2};
  if(!motorcycle){meters.frontTrack=fr[1]-fl[1];meters.rearTrack=rr[1]-rl[1];}
  const longitudinal=['bmw325ci','bmw328xi'].includes(vehicle)?bumpers:envelope;
  if(!Number.isFinite(longitudinal.min[0]))throw new Error('Missing bumper geometry for this coupe.');
  meters.length=longitudinal.max[0]-longitudinal.min[0];
  if(cabriolet||['bmw325ci','bmw328xi'].includes(vehicle))meters.bodyWidth=body.max[1]-body.min[1];
  const mm=Object.fromEntries(Object.entries(meters).map(([id,v])=>[id,Math.round(v*1000)]));
  return {meters,mm,min,max,ground,wheels,longitudinal};
}
