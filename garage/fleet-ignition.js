// Plug locations follow cylinder centers in each fleet engine mesh. Position names
// refer to the vehicle so a user can distinguish plugs without guessing bank numbers.
import {add,unit} from './mechanism-shapes.js';
import {barrel} from './road-primitives.js';

const for993={label:'Porsche PET · 993 Carrera ignition, illustration 901-02',url:'https://porschecarshistory.com/wp-content/old/manuals/E/E_993_KATALOG.pdf'};
const for992={label:'Genuine Porsche · 992 Carrera S spark plugs',url:'https://www.ecstuning.com/b-genuine-porsche-parts/spark-plugs-set-of-6/0pb905612kt2/'};
const for996={label:'Porsche PET · 996 (1999) M96/01 engine plates',url:'https://eurospares.co.uk/Porsche/996/996_(1999)/PartDiagrams/101-005/CRANKCASE'};
const forRR={label:'NGK · motorcycle application catalog, BMW K67',url:'https://www.ngkntk.com/fileadmin/general_content_all_countries/catalogues/2023/ngkntk_catalogue_2wheel_en_2020-2021.pdf'};

function boxerLocations(modern,type996=false){
  const entries=[];
  for(const side of [-1,1])for(let station=0;station<3;station++){
    const bank=side<0?'left':'right',position=['forward','middle','rear'][station];
    for(const level of modern?[0]:[1,-1]){
      const vertical=level>0?'upper':'lower';
      const key=['plug',bank,position,...(modern?[]:[vertical])].join('-');
      const name=(modern?'Spark plug':(level>0?'Upper':'Lower')+' spark plug')+' · '+bank+' '+position;
      const description=type996?'One plug fires each cylinder of the M96/01. Each plug sits under its own coil on the outboard side of the head.':modern?'One plug fires each cylinder in the 992.1 Carrera S. The six plugs enter the two opposed heads from the sides of the engine.':'The 993 Carrera uses two plugs in each cylinder. This '+vertical+' plug shares a combustion chamber with the other plug at this station.';
      entries.push({key,name,description,source:type996?for996:modern?for992:for993,
        origin:[-.1845+station*.178+side*.0445,side*(modern?.361:.355),level*.036],
        axis:unit([0,side,level*.84]),length:modern?.106:.116,
        offset:[(station-1)*.14,side*(.32+station*.025),level*.28+(modern?.17:0)]});
    }
  }
  return entries;
}
const bike=['left outer','left inner','right inner','right outer'].map((position,i)=>({
  key:'plug-'+position.replace(' ','-'),name:'Spark plug · '+position,
  description:'One plug sits over each bore in the four-cylinder head. Its axis follows the forward lean of the cylinder bank.',
  source:forRR,origin:[-.301,(i-1.5)*.081,.695],axis:unit([-.52,0,.85]),length:.095,
  offset:[-.15,(i-1.5)*.12,.26+(i%2)*.05]
}));
const locations={porsche993cab:boxerLocations(false),porsche992scab:boxerLocations(true),porsche996cab:boxerLocations(true,true),bmws1000rr:bike};
export function ignitionEntries(id){
  return locations[id].map(p=>[p.key,p.name,p.description,p.offset,p.source]);
}
export function isFleetPlug(id,part){
  return !!locations[id]?.some(p=>part==='engine.'+p.key);
}
export function drawFleetIgnition(r,id,center=[0,0,0],f=1){
  // f scales the plug stations along the crankshaft (porsche-boxer-layout.js).
  for(const p of locations[id]){
    const seat=add(center,[p.origin[0]*f,p.origin[1],p.origin[2]]),point=t=>add(seat,p.axis,p.length*t),diameter=p.length*.11;
    r.tag('engine.'+p.key,()=>{
      barrel(r,point(0),point(.32),diameter*.76,'#92999b',7);
      barrel(r,point(.32),point(.46),diameter*1.03,'#c0c8c5',6);
      barrel(r,point(.46),point(.84),diameter*.70,'#e4e5d7',8);
      for(const collar of [.59,.69,.79])barrel(r,point(collar),point(collar+.025),diameter*.79,'#eeeede',8);
      barrel(r,point(.84),point(1),diameter*.40,'#9da8a8',6);
    });
  }
}
