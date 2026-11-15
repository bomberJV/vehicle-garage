// The model-specific supplier catalog is retained with each group of product links.
// Suncoast identifiers below are retailer kit codes, not Porsche part numbers.
const europa993='https://www.europaparts.com/porsche/911/1998/carrera/convertible/3-6l-h6/6-speed-manual-g50-20.html';
const suncoast992='https://www.suncoastparts.com/category/9922020SENGMA.html';

export const roadSuppliers={
  porsche993cab:[
    {
      name:'993 engine intake air filter', seller:'Europa Parts', sku:'993 110 327 01',
      type:'product', category:'service', price:null,
      description:'Replacement filter element for the engine airbox.',
      fit:'Europa Parts lists this element for the 1998 Carrera convertible with the 3.6 L flat-six and six-speed manual.',
      url:'https://www.europaparts.com/air-filter-99311032701.html', fitmentUrl:europa993,
    },
    {
      name:'993 cabin filter set', seller:'Europa Parts', sku:'MAHLE LA 15/S · 993 572 479 00',
      type:'product', category:'service', price:null,
      description:'MAHLE replacement filter set for the cabin air intake.',
      fit:'Listed in the supplier’s 1998 Carrera convertible six-speed catalog.',
      url:'https://www.europaparts.com/cabin-filter-set-99357247900-mahle.html', fitmentUrl:europa993,
    },
    {
      name:'993 small oil filter', seller:'RM European', sku:'993 107 203 05',
      type:'product', category:'service', price:null,
      description:'One MAHLE small oil filter. A complete oil service also uses a separate large filter.',
      fit:'The seller identifies the small filter for the 1998 Carrera convertible 3.6 L.',
      url:'https://www.rmeuropean.com/porsche-oil-filter-mahle-99310720305',
    },
  ],
  porsche992scab:[
    {
      name:'992.1 oil filter kit', seller:'Suncoast Porsche Parts', sku:'Suncoast PK992OFK',
      type:'product', category:'service', price:null,
      description:'Porsche filter, sealing gasket and drain plug.',
      fit:'Suncoast lists the 2020–2024 992.1 Carrera S in its fitment table.',
      url:'https://www.suncoastparts.com/product/PK992OFK.html',fitmentUrl:suncoast992,
    },
    {
      name:'992 engine air filters', seller:'Suncoast Porsche Parts', sku:'Suncoast PK992AIRFILTERS',
      type:'product', category:'service', price:null,
      description:'Replacement engine intake filters in the Carrera S maintenance catalog.',
      fit:'The dealer includes this listing in its 2020–2024 Carrera S catalog. Confirm the kit contents when ordering.',
      url:'https://www.suncoastparts.com/product/PK992AIRFILTERS.html',fitmentUrl:suncoast992,
    },
    {
      name:'992.1 cabin pollen filters', seller:'Suncoast Porsche Parts', sku:'Suncoast PK992POL',
      type:'product', category:'service', price:null,
      description:'Porsche cabin-air filter set for the heating and ventilation system.',
      fit:'The dealer lists 2020–2024 992.1 Carrera variants, including the Carrera S.',
      url:'https://www.suncoastparts.com/product/PK992POL.html',fitmentUrl:suncoast992,
    },
  ],
  bmws1000rr:[
    {
      name:'S 1000 RR engine air filter', seller:'K&N', sku:'BM-1019',
      type:'product', category:'service', price:null,
      description:'Washable replacement element for the motorcycle’s airbox.',
      fit:'K&N’s model-year lookup lists BM-1019 for the 2023 S 1000 RR, 999 cc.',
      url:'https://www.knfilters.com/bm-1019-replacement-air-filter',
      fitmentUrl:'https://www.knfilters.com/air-filters/bmw/s1000rr/999/2023',
    },
    {
      name:'S 1000 RR oil filter', seller:'K&N', sku:'KN-160',
      type:'product', category:'service', price:null,
      description:'Spin-on replacement oil filter.',
      fit:'K&N’s application list pairs KN-160 with the 2023 S 1000 RR, 999 cc.',
      url:'https://www.knfilters.com/kn-160-oil-filter',
      fitmentUrl:'https://www.knfilters.com/oil-filters/bmw/s1000rr',
    },
    {
      name:'K67 original parts diagrams', seller:'MAX BMW Motorcycles', sku:'US K67 · fiche 63032',
      type:'supplier catalog', category:'service', price:null,
      description:'Dealer diagrams for the original airbox, filter housing, wheels and bodywork.',
      fit:'The US fiche covers October 2021 through June 2024 production. Select the diagram and match the bike’s VIN and equipment.',
      url:'https://shop.maxbmw.com/fiche/DiagramsMain.aspx?vid=63032',
    },
  ],
};
