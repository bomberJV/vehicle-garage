// Published dimensions of the 1998 911 Carrera Cabriolet (993, US), with
// their sources. tests/garage-p993-factory-dimensions.test.mjs checks the
// model against them.
export const factoryDimensions={
 length:{mm:4260,source:'us'},width:{mm:1735,source:'us'},height:{mm:1315,source:'us'},
 wheelbase:{mm:2272,source:'us'},trackFront:{mm:1405,source:'spec'},trackRear:{mm:1444,source:'spec'},
 tyreFront:{size:'205/55 ZR16',rim:'7J x 16 ET55',source:'tyres'},tyreRear:{size:'245/45 ZR16',rim:'9J x 16 ET70',source:'tyres'}
};
export const dimensionSources={
 us:{label:'Auto123 · 1998 Porsche 911 Carrera Cabriolet, North American specification: length 4,260, width 1,735, height 1,315, wheelbase 2,272 mm',url:'https://www.auto123.com/en/new-cars/technical-specs/porsche/911/1998/cabrio/carrera/'},
 spec:{label:'auto-data.net · 911 Cabriolet (993) Carrera 3.6: tracks 1,405/1,444 mm',url:'https://www.auto-data.net/en/porsche-911-cabriolet-993-carrera-3.6-272hp-6615'},
 specCheck:{label:'Rennlist · 993 Carrera Coupe and Cabriolet 3.6 dimensions',url:'https://rennlist.com/forums/993-forum/96556-dimensions-for-carerra-2-coupe.html'},
 tyres:{label:'Porsche Technical Information 4/4440 · 993 Carrera 1994–98: 205/55 ZR16 on 7J x 16 ET55 front, 245/45 ZR16 on 9J x 16 ET70 rear',url:'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199869-0001.pdf'}
};
// The European figures (auto-data.net, Rennlist) are 15 mm shorter and 15 mm
// lower: 4,245 and 1,300 mm. The model follows the US car, which the
// photographs and the envelope test also describe.
export const europeanFigures={length:4245,height:1300,source:'spec'};
// Tyre outside diameter from the ISO size code, in mm.
export const tyreDiameter=code=>{const [,w,a,d]=code.match(/(\d+)\/(\d+)\s*Z?R(\d+)/);return +d*25.4+2*w*a/100;};
