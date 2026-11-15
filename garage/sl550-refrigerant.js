// Plate numbers follow MBUSA's 2014 R231 Hoses & Pipes illustration.
// The plate gives connections. The bends between them are fitted to this model.
import {part,study,turn,x,z} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';

export const refrigerantPlate={label:'Mercedes-Benz USA · condenser, compressor and lines, plate 1',
 url:'https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/hvac--hoses-and-pipes'};
const heaterPlate={label:'Mercedes-Benz USA · heater, evaporator, valve and drains, plate 1',
 url:'https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-6l-v8-gas/hvac--heater'};
export const beltPlate={label:'Daimler · M278 eight-cylinder belt drive, figure P13.20-2076-00',
 url:'https://w124performance.com/docs/mb/M278/M276_M278_Introduction_into_Service.pdf'};
const alloy='#a0a9aa',steel='#78878a',rubber='#343b3d',black='#454b4b';
const compressorCentre=[-1.430,-.200,.418];
const discharge=[-1.385,-.244,.468], suction=[-1.324,-.244,.469];
const hotPort=[-1.909,-.389,.420],liquidPort=[-1.909,-.389,.346];
const suctionJoin=[-1.137,-.475,.546],liquidJoin=[-1.137,-.475,.511];
const valveIn=[-.667,.088,.645],valveOut=[-.667,.088,.681];
const tube=(r,points,radius)=>pipe(r,points,radius,alloy,7);
const hose=(r,points,radius)=>pipe(r,points,radius,rubber,8);

function compressor(r) {
 // The front face meets the separate steel pulley in the engine's accessory drive.
 turn(r,compressorCentre,x,[[0,.035],[.008,.051],[.032,.057],[.112,.054],[.131,.045],[.142,.031],[.142,0]],alloy,{n:16});
 for(const a of [.5,2.1,3.6,5.3]){
  const y=-.200+.051*Math.cos(a),zz=.418+.051*Math.sin(a);
  r.rod([-1.409,y,zz],[-1.318,y,zz],.004,steel,6);
 }
 for(const p of [discharge,suction]){
  const [cx,cy,cz]=p;
  r.box(cx-.012,cy-.007,cz-.023,cx+.012,cy+.018,cz,steel);
 }
}

function condenserCore(r){
 // Narrow air gap between the charge-cooling heat exchanger and engine radiator.
 r.box(-1.915,-.366,.251,-1.906,.366,.605,'#566264');
 for(const y of [-.377,.366])r.box(-1.915,y,.249,-1.905,y+.011,.607,alloy);
 for(let i=0;i<27;i++){
  const height=.255+i*.0131;
  r.box(-1.916,-.365,height,-1.915,.365,height+.0027,'#839090');
 }
 for(const p of [hotPort,liquidPort])r.rod([-1.910,-.370,p[2]],p,.0075,alloy,7);
}
function condenserFrame(r){
 for(const y of [-.386,.371])r.box(-1.905,y,.239,-1.900,y+.015,.618,black);
 for(const height of [.239,.607])r.box(-1.905,-.371,height,-1.900,.371,height+.011,black);
 for(const y of [-.362,.359])r.box(-1.904,y,.244,-1.901,y+.004,.612,steel);
}
function condenserSensor(r){
 const pad=[-1.909,-.389,.384];
 r.rod([-1.910,-.373,.384],pad,.008,alloy,8);
 turn(r,pad,[0,-1,0],[[0,.007],[.006,.009],[.012,.009],[.013,.006],[.026,.006]],steel,{n:6});
 r.box(-1.915,-.424,.378,-1.903,-.413,.390,black);
}
function dischargeLine(r){
 const a=[-1.505,-.347,.402],b=[-1.783,-.410,.412];
 tube(r,[discharge,[-1.385,-.244,.485],[-1.430,-.307,.476],a],.006);
 hose(r,[a,[-1.582,-.394,.388],[-1.701,-.415,.389],b],.008);
 tube(r,[b,[-1.861,-.409,.428],[-1.903,-.407,.428],hotPort],.006);
}
function suctionFront(r){
 const a=[-1.330,-.325,.482],b=[-1.289,-.469,.512];
 tube(r,[suction,[-1.324,-.248,.489],a],.009);
 hose(r,[a,[-1.384,-.393,.469],[-1.365,-.455,.479],b],.012);
 tube(r,[b,[-1.201,-.478,.540],suctionJoin],.009);
}
function liquidFront(r){
 const a=[-1.732,-.465,.341],b=[-1.588,-.477,.393];
 tube(r,[liquidPort,[-1.895,-.419,.344],[-1.820,-.446,.329],a],.0055);
 hose(r,[a,[-1.672,-.479,.346],b],.007);
 tube(r,[b,[-1.470,-.478,.469],[-1.295,-.474,.504],liquidJoin],.0055);
}
function rearLines(r){
 for(const [join,end,rad] of [[suctionJoin,valveOut,.009],[liquidJoin,valveIn,.0055]]){
  const h=end[2],d=join[2]-suctionJoin[2];
  r.box(join[0]-.01,join[1]-.012,join[2]-.011,join[0]+.01,join[1]+.012,join[2]+.011,steel);
  tube(r,[join,[-1.015,-.473,.568+d],[-.868,-.468,.617+d],[-.748,-.417,h-.028],[-.715,-.323,h],[-.707,.045,h],end],rad);
 }
}
function expansionValve(r){
 r.box(-.667,.071,.631,-.633,.106,.696,alloy);
 turn(r,[-.650,.088,.696],z,[[0,.012],[.005,.014],[.010,.011],[.012,0]],steel,{n:10});
 for(const [start,end,rad] of [[valveIn,[-.533,.102,.530],.0055],[valveOut,[-.533,.102,.673],.009]]){
  const h=start[2];
  tube(r,[[-.633,.088,h],[-.593,.088,h],[-.566,.102,end[2]],end],rad);
 }
}
function condensateDrains(r){
 for(const [name,s] of [['left',-1],['right',1]])r.instance(name,()=>{
  const y=s*.116;
  hose(r,[[-.461,y,.477],[-.466,y,.439],[-.487,s*.135,.407],[-.486,s*.147,.364]],.009);
 });
}
const condenserStudy=study('slcondenser','Condenser, frame and pressure sensor','The factory drawing numbers the core, pressure sensor and support frame separately. The sensor is supplied with the condenser assembly.',refrigerantPlate,[
 part('core','Finned core and side headers','Hot refrigerant enters the condenser through the discharge line. Heat passes to the air crossing the fin pack.',[-.057,0,0],condenserCore),
 part('sensor','High-side pressure sensor','The catalog shows sensor 211 000 02 83 on the condenser header. Its plug connects to the electrical harness.',[0,-.065,.025],condenserSensor),
 part('frame','Condenser mounting frame','The frame carries the heat exchanger by its edges in the cooling stack.',[.066,0,0],condenserFrame)
]);
export const refrigerantStudies={'climate.condenser':condenserStudy};
export const refrigerantParts=[
 ['compressor','Belt-driven refrigerant compressor','The engine drive turns the compressor. The larger suction connection returns vapor from the evaporator. The discharge connection leads forward to the condenser.',[-.08,-.10,-.07],refrigerantPlate,compressor],
 ['condenser','Condenser and pressure sensor','Open the condenser to separate its fin pack, pressure sensor and mounting frame.',[-.08,0,.09],refrigerantPlate,r=>{condenserCore(r);condenserSensor(r);condenserFrame(r);}],
 ['discharge','Compressor discharge line','Plate item 5 carries hot, high-pressure vapor from the compressor to the condenser.',[-.05,-.08,-.06],refrigerantPlate,dischargeLine],
 ['liquid','Condenser liquid line','Plate item 8 carries liquid refrigerant from the condenser to the connector for the rear pipe assembly.',[-.04,-.09,.03],refrigerantPlate,liquidFront],
 ['suction','Front suction line','Plate item 6 joins the larger low-pressure return pipe to the compressor inlet.',[0,-.06,.08],refrigerantPlate,suctionFront],
 ['rear-lines','Rear suction and liquid pipe assembly','Plate item 7 combines the liquid supply and the larger vapor return. Both terminate at the firewall expansion valve.',[.04,-.08,.07],refrigerantPlate,rearLines],
 ['expansion','Evaporator expansion valve','The valve meters refrigerant into the evaporator. The neighboring, larger passage takes vapor back to the suction line.',[-.07,.065,.055],heaterPlate,expansionValve],
 ['drains','Left and right condensate drains','Two separate hoses drain water that collects below the evaporator. The SL parts catalog lists a different hose for each side.',[.045,0,-.075],heaterPlate,condensateDrains]
];
