// 992 study pack: exhaust.
// Scope: Exhaust: manifolds, catalytic converters, particulate filters, silencers, tailpipes, exhaust flaps, lambda and temperature sensors, heat shields, hangers.
//
// Contract (see garage/p992-packs.js and tests/garage-p992-packs.test.mjs):
// - hooks: the existing 992 part ids this pack may open studies from. Do not change.
// - studies: every study this pack defines. Build them with catalogueStudy(diagram,'p992-exhaust-')
//   from porsche992-catalog-studies.js (or study()/part() from mechanism-shapes.js).
// - views: Map from a hook id, or a part id inside one of this pack's own studies,
//   to the study it opens.
// Every part name ends ' · <Porsche part number>' copied from the cited catalogue page,
// and every study cites that page. Never invent a part number.
//
// The exhaust hook opens an overview with one entry per catalogue diagram; each
// entry opens that diagram's study. The exhaust manifolds share diagram 202-000
// with the turbochargers, which the turbochargers pack covers.
import {catalogueStudy,catalogueShapes} from './porsche992-catalog-studies.js';
import {part,study} from './mechanism-shapes.js';

export const hooks=["engine.exhaust"];

const base='https://www.eurospares.co.uk/Porsche/992/';
const diagrams=[
  {id:'catalysts',code:'202-250',title:'Catalytic converters, fastenings and sensors',year:'2019 (992-1)',
    url:base+'2019_(992-1)/PartDiagrams/202-250/CATALYST',
    rows:[
      ['1','992254400N','Catalytic converter, left (model year 2021 on)'],
      ['2','992254450N','Catalytic converter, right (model year 2021 on)'],
      ['3','9P1253725A','Clip'],
      ['4','9A725311500','Seal'],
      ['5','992251519','Retaining bracket (catalogue lists it as right)'],
      ['6','992251519A','Retaining bracket, left'],
      ['7','PAF008145','Hexagon head bolt BM8x20'],
      ['8','0PB145325B','Heat insulation, left'],
      ['9','0PB145326B','Heat insulation, right'],
      ['10','N 10170302','Round head screw M6x10'],
      ['11','0PB906262M','Lambda probe in front of catalytic converter'],
      ['12','0PB906265D','Lambda probe behind catalytic converter'],
      ['13','992906109','Bracket for connector housing'],
    ]},
  {id:'particulate-filters',code:'202-200',title:'Catalytic converters with petrol particulate filters, fastenings and sensors',year:'2020 (992-1)',
    url:base+'2020_(992-1)/PartDiagrams/202-200/CATALYST',
    rows:[
      ['1','992254400J','Catalytic converter with petrol particulate filter, left'],
      ['2','992254450J','Catalytic converter with petrol particulate filter, right'],
      ['3','9P1253725A','Clip'],
      ['4','9A725311500','Seal'],
      ['5','992251520A','Retaining bracket, right'],
      ['6','992251519A','Retaining bracket, left'],
      ['7','PAF008145','Hexagon head bolt BM8x20'],
      ['8','0PB145325C','Heat insulation, petrol particulate filter, left'],
      ['9','0PB145326C','Heat insulation, petrol particulate filter, right'],
      ['10','N 10170302','Round head screw M6x10'],
      ['11','0PB906262M','Lambda probe in front of catalytic converter'],
      ['12','0PB906265D','Lambda probe behind catalytic converter'],
      ['13','992251169A','Control line, pressure difference sender downstream of particulate filter, left'],
      ['14','992251170A','Control line, pressure difference sender downstream of particulate filter, right'],
      ['15','992251171A','Control line, pressure difference sender upstream of particulate filter, left'],
      ['16','992251172A','Control line, pressure difference sender upstream of particulate filter, right'],
      ['17','0PB906217B','Retaining bracket for control lines, left'],
      ['18','0PB906269B','Retaining bracket for control lines, right'],
      ['19','N 10737001','Hexagon nut M6, self-locking'],
      ['20','992906088','Exhaust temperature sensor'],
      ['21','992906287D','Holder for temperature sensor, right'],
      ['21','992906303D','Holder for temperature sensor, left'],
      ['22','992906109','Bracket for connector housing'],
      ['23','PAE906051','Pressure difference sender'],
      ['24','992131191B','Moulded hose'],
      ['25','N 10769401','Spring band clamp 13.5x8.4'],
      ['26','992906407C','Bracket for lambda probe, left'],
      ['27','992906408D','Bracket for lambda probe, right'],
      ['28','N 10759101','Hexagon collared bolt M6x12'],
    ]},
  {id:'silencer',code:'202-300',title:'Silencer',year:'2021 (992-1)',
    url:base+'2021_(992-1)/PartDiagrams/202-300/Silencer',
    rows:[
      ['1','992251052A','Silencer'],
      ['2','992251571','Tensioning strap'],
      ['3','992253143A','Clamping sleeve D=70'],
      ['4','992251225C','Bracket for exhaust silencer'],
      ['5','992251414A','Heat shield'],
      ['6','PAF007634','Hexagon flange nut M8, self-locking'],
      ['7','992251377A','Console'],
      ['8','992253185','Spacer sleeve'],
      ['9','PAF108446','Threaded pin M10x50'],
      ['10','PAF108447','Threaded pin M10x90'],
      ['11','N 10737101','Hexagon collared bolt M8x22'],
      ['12','PAF911671','Hexagon head bolt with shoulder M10x75'],
      ['13','PAF106833','Hexagon collared bolt M10x115, multi-point socket head'],
      ['14','PAF102861','Hexagon collar nut M10, self-locking'],
    ]},
  {id:'sports-silencer',code:'202-350',title:'Silencer for sports exhaust system',year:'2020 (992-1)',
    url:base+'2020_(992-1)/PartDiagrams/202-350/SILENCER',
    rows:[
      ['1','992298019A','Silencer for sports exhaust system, without throttle control element'],
      ['2','992251571','Tensioning strap'],
      ['3','992253143A','Clamping sleeve D=70'],
      ['4','992251225B','Bracket for exhaust silencer'],
      ['5','992251414A','Heat shield'],
      ['6','PAF007634','Hexagon flange nut M8, self-locking'],
      ['7','992251377A','Console'],
      ['8','992253185','Spacer sleeve'],
      ['9','PAF108446','Threaded pin M10x50'],
      ['10','PAF108447','Threaded pin M10x90'],
      ['11','N 10737101','Hexagon collared bolt M8x22'],
      ['12','PAF911671','Hexagon head bolt with shoulder M10x75'],
      ['13','PAF106833','Hexagon collared bolt M10x115, multi-point socket head'],
      ['14','N 10286110','Hexagon collar nut M10, self-locking'],
    ]},
  {id:'exhaust-flap',code:'202-550',title:'Exhaust system throttle control element, electric',year:'2019 (992-1)',
    url:base+'2019_(992-1)/PartDiagrams/202-550/EXHAUST_SYSTEM',
    rows:[
      ['1','992906247A','Exhaust flap throttle control element, electric'],
      ['2','N 91096801','Hexagon socket flat head bolt M6x20'],
      ['3','992298021','Repair set: three hexagon bolts and one spring'],
    ]},
  {id:'tailpipes',code:'202-400',title:'Exhaust tail pipes',year:'2020 (992-1)',
    url:base+'2020_(992-1)/PartDiagrams/202-400/TAIL_PIPE',
    rows:[
      ['1','992251187AJ','Exhaust tail pipe, left, brushed stainless steel (comfort equipment)'],
      ['1','992251188AJ','Exhaust tail pipe, right, brushed stainless steel (comfort equipment)'],
      ['2','992251187BA','Dual exhaust tail pipe, left, brushed stainless steel (sports equipment)'],
      ['2','992251188BA','Dual exhaust tail pipe, right, brushed stainless steel (sports equipment)'],
      ['7','PAF912769','Panel screw 4.8x16'],
    ]},
  {id:'sports-tailpipes',code:'202-450',title:'Exhaust tail pipes for sports exhaust system',year:'2019 (992-1)',
    url:base+'2019_(992-1)/PartDiagrams/202-450/TAIL_PIPE',
    rows:[
      ['1','992251187BC','Sports exhaust tail pipe, left, stainless steel (from 26.08.2022)'],
      ['1','992251188BC','Sports exhaust tail pipe, right, stainless steel (from 26.08.2022)'],
      ['4','PAF912769','Panel screw 4.8x16'],
    ]},
];

const prefix='p992-exhaust-';
const built=diagrams.map(d=>catalogueStudy(d,prefix));
const byId=new Map(diagrams.map((d,i)=>[d.id,built[i]]));

// Overview: one entry per diagram, named after that diagram's main part and
// opening its study.
const entries=[
  ['catalysts','992254400N','Catalytic converter, left, with its fastenings and lambda probes','housing'],
  ['particulate-filters','992254400J','Catalytic converter with petrol particulate filter, left, for markets that fit one','housing'],
  ['silencer','992251052A','Silencer, with its brackets and heat shield','core'],
  ['sports-silencer','992298019A','Silencer for sports exhaust system, with its brackets and heat shield','core'],
  ['exhaust-flap','992906247A','Exhaust flap throttle control element, electric','sensor'],
  ['tailpipes','992251187BA','Dual exhaust tail pipes','shaft'],
  ['sports-tailpipes','992251187BC','Sports exhaust tail pipes','shaft'],
];
const cols=4;
const overviewParts=entries.map(([id,mpn,name,shape],i)=>{
  const d=diagrams.find(x=>x.id===id),col=i%cols,row=Math.floor(i/cols);
  const c=[(col-(cols-1)/2)*.32,0,(.5-row)*.3],len=Math.hypot(c[0],c[2])||1;
  const p=part(id,`${name} · ${mpn}`,`Opens Porsche catalogue diagram ${d.code}, ${d.title.toLowerCase()}. The shape is representative.`,[c[0]/len*.18,-.12,c[2]/len*.12],r=>catalogueShapes[shape](r,c));
  return p;
});
const overview=study(prefix+'overview','Exhaust system, 992.1 Carrera',
  'The 992.1 Carrera exhaust from the catalytic converters back, one entry per Porsche catalogue diagram. Open an entry for every numbered part on that diagram. The manifolds sit on the turbocharger diagram.',
  {label:'Eurospares · Porsche 992.1 catalogue, exhaust diagrams 202-200 to 202-550',url:diagrams[0].url},overviewParts);
overview.viewAngle=[-.55,.25];
for(const p of overview.groups[0].parts){
  const d=diagrams.find(x=>prefix+'overview.'+x.id===p.id);
  p.source={label:`Eurospares · Porsche ${d.year} catalogue diagram ${d.code}, ${d.title.toLowerCase()}`,url:d.url};
}

export const studies=[overview,...built];
export const views=new Map([
  [hooks[0],overview],
  ...diagrams.map(d=>[prefix+'overview.'+d.id,byId.get(d.id)]),
]);
