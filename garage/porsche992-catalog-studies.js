// Studies built from the 992.1 catalogue diagrams in porsche992-catalog-data.js.
// Every catalogue row is one selectable part, laid out on an exploded grid in
// diagram order. Its shape is drawn from its kind (bolt, seal, hose, bracket,
// sensor, housing and so on); sizes and shapes are representative, while the
// names, part numbers and grouping follow the cited diagram.
import {TAU,metal,steel,dark,gold,turn,cyl,sleeve,bead,part,study,x,y,z} from './mechanism-shapes.js';
import {p992Diagrams} from './porsche992-catalog-data.js';

const rubber='#26292b',plastic='#3a3f42',alloy='#9aa5a8',paint='#8a8f90',fabric='#3f4142',copperish='#b9875a';
const block=(r,c,s,color)=>r.box(c[0]-s[0]/2,c[1]-s[1]/2,c[2]-s[2]/2,c[0]+s[0]/2,c[1]+s[1]/2,c[2]+s[2]/2,color);
const tube=(r,pts,rad,color)=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],d=pts[i].map((v,k)=>v-a[k]);cyl(r,a,d,0,Math.hypot(...d),rad,color,10);}};
const plus=(a,b)=>a.map((v,i)=>v+b[i]);

const kinds=[
  [/grease|hydraulic oil|sealant|fluid/i,'tube'],
  [/chain/i,'chain'],
  [/spark plug/i,'plug'],
  [/coil/i,'coil'],
  [/o-ring|seal ring|gasket|seal\b|seals|shaft oil seal|rosette/i,'ring'],
  [/hose|line\b|cable|wire|wiring|feed|breather|tie\b/i,'hose'],
  [/sensor|switch|sender|valve\b|control valve|throttle control|choke/i,'sensor'],
  [/nut\b|nut m/i,'nut'],
  [/bolt|screw|stud|pin\b|pin d|pin m|rivet|insert|bush m|dowel|sleeve m/i,'bolt'],
  [/bracket|console|support|holder|retainer|brace|rail|plate|abutment|catch|clip|clamp|striker|guide\b|hook|lever/i,'bracket'],
  [/plug|bung|cap\b|cap,|caps|buffer|shackle|centring|reducing/i,'cap'],
  [/camshaft\b|camshaft,|shaft|flange|rod\b/i,'shaft'],
  [/adjuster|tensioner|tappet|bearing|sleeve|washer|snap ring/i,'round'],
  [/fan\b/i,'fan'],
  [/cylinder with|hydraulic cylinder|cover hydraulic/i,'ram'],
  [/covering|headliner|trim|cover|panel|flap|wing|spoiler|insert|shield|guide plate|air guide/i,'panel'],
  [/radiator|heat exchanger|cooler/i,'core'],
  [/frame/i,'frame'],
  [/head|crankcase|housing|unit|module|motor|pump/i,'housing'],
];
// A part is classed by its head noun: anything after "with" describes what
// comes with it.
const kindOf=name=>{const head=name.split(/,? with /i)[0];return (kinds.find(([re])=>re.test(head))||[,'box'])[1];};

const draws={
  bolt:(r,c)=>{cyl(r,plus(c,[0,0,-.06]),z,0,.1,.012,steel,10);turn(r,plus(c,[0,0,.04]),z,[[0,0],[0,.024],[.022,.024],[.022,0]],metal,{n:6});},
  nut:(r,c)=>sleeve(r,c,z,0,.02,.026,.012,metal,6),
  ring:(r,c)=>sleeve(r,c,y,-.005,.005,.06,.048,rubber,22),
  hose:(r,c)=>tube(r,[plus(c,[-.08,0,-.04]),plus(c,[-.02,0,.04]),plus(c,[.05,0,.03]),plus(c,[.09,0,-.05])],.012,rubber),
  sensor:(r,c)=>{cyl(r,plus(c,[0,0,-.06]),z,0,.06,.012,metal,10);block(r,plus(c,[0,0,.03]),[.05,.04,.05],dark);},
  bracket:(r,c)=>{block(r,plus(c,[0,0,-.04]),[.12,.05,.012],steel);block(r,plus(c,[.055,0,0]),[.012,.05,.09],steel);},
  cap:(r,c)=>turn(r,c,z,[[0,0],[0,.035],[.02,.035],[.03,.02],[.03,0]],plastic,{n:16}),
  shaft:(r,c)=>{cyl(r,plus(c,[-.12,0,0]),x,0,.24,.016,metal,12);for(let i=0;i<3;i++)turn(r,plus(c,[-.08+i*.08,0,0]),x,[[0,0],[0,.03],[.02,.03],[.02,0]],gold,{n:12});},
  round:(r,c)=>sleeve(r,c,y,-.02,.02,.05,.022,metal,20),
  chain:(r,c)=>{for(let i=0;i<20;i++){const a=TAU*i/20;bead(r,plus(c,[Math.cos(a)*.1,0,Math.sin(a)*.06]),.012,steel,6);}},
  plug:(r,c)=>{cyl(r,plus(c,[0,0,-.06]),z,0,.04,.008,metal,8);cyl(r,plus(c,[0,0,-.02]),z,0,.07,.013,'#e3e1da',10);},
  coil:(r,c)=>{cyl(r,plus(c,[0,0,-.07]),z,0,.11,.016,dark,12);block(r,plus(c,[0,0,.06]),[.06,.05,.03],plastic);},
  fan:(r,c)=>{sleeve(r,c,y,-.02,.02,.11,.1,plastic,24);cyl(r,c,y,-.02,.02,.03,dark,12);for(let i=0;i<7;i++){const a=TAU*i/7;block(r,plus(c,[Math.cos(a)*.06,0,Math.sin(a)*.06]),[.03,.01,.03],plastic);}},
  ram:(r,c)=>{cyl(r,plus(c,[-.11,0,0]),x,0,.14,.022,alloy,12);cyl(r,plus(c,[.03,0,0]),x,0,.09,.01,metal,10);},
  panel:(r,c)=>{for(let i=0;i<4;i++)block(r,plus(c,[-.075+i*.05,0,.006*Math.cos(i)]),[.05,.11,.008],paint);},
  core:(r,c)=>{block(r,c,[.16,.03,.12],'#5d676b');for(let i=0;i<6;i++)block(r,plus(c,[-.06+i*.024,-.018,0]),[.004,.004,.12],alloy);},
  frame:(r,c)=>{tube(r,[plus(c,[-.1,0,-.06]),plus(c,[-.1,0,.06]),plus(c,[.1,0,.06]),plus(c,[.1,0,-.06])],.008,steel);},
  housing:(r,c)=>{block(r,c,[.16,.1,.09],alloy);for(const s of [-1,1])cyl(r,plus(c,[s*.05,0,.045]),z,0,.02,.012,steel,8);},
  tube:(r,c)=>{cyl(r,plus(c,[0,0,-.05]),z,0,.08,.022,'#c7a23e',12);cyl(r,plus(c,[0,0,.03]),z,0,.02,.01,plastic,8);},
  box:(r,c)=>block(r,c,[.09,.06,.06],grey),
};
const grey='#7f898c';
// Side-handed parts lean to their own side of the grid.
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');

function build(d){
  const n=d.rows.length,cols=Math.ceil(Math.sqrt(n*1.6)),rows=Math.ceil(n/cols),seen=new Map();
  const parts=d.rows.map(([ref,mpn,name],i)=>{
    let id=`r${slug(ref)}-${slug(mpn)||'ref'}`;const k=(seen.get(id)||0)+1;seen.set(id,k);if(k>1)id+='-'+k;
    const col=i%cols,row=Math.floor(i/cols),c=[(col-(cols-1)/2)*.3,0,((rows-1)/2-row)*.26];
    const len=Math.hypot(c[0],c[2])||1,offset=[c[0]/len*.18,-.12,c[2]/len*.12];
    const kind=kindOf(name),draw=draws[kind];
    return part(id,`${name} · ${mpn}`,`Ref. ${ref} on Porsche catalogue diagram ${d.code}. The shape is representative; the part number and name are from the catalogue.`,offset,r=>draw(r,c));
  });
  const source={label:`Eurospares · Porsche ${d.year} catalogue diagram ${d.code}, ${d.title.toLowerCase()}`,url:d.url};
  for(const p of parts)p.source=source;
  const s=study(`p992-cat-${d.id}`,d.title,`Porsche catalogue diagram ${d.code} for the 992.1, laid out in diagram order: ${n} parts, each with its Porsche part number. Shapes are representative.`,source,parts);
  s.viewAngle=[-.55,.25];s.catalogue={code:d.code,year:d.year,rows:n};
  return s;
}

export const p992CatalogStudies=p992Diagrams.map(build);
const views=new Map(p992Diagrams.map((d,i)=>[d.attach,p992CatalogStudies[i]]));
export function getP992CatalogStudy(vehicle,id){
  if(vehicle!=='porsche992scab')return null;
  return views.get(id)||null;
}
