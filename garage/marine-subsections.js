import {glazingFace} from './surface-materials.js';
import {section,part,source,slab} from './section-primitives.js';

const acrylicReference=source('Woods Hole Oceanographic Institution · the faces of an Alvin viewport','https://www.whoi.edu/oceanus/feature/alvin-viewport/');
const polar=(x,radius,i)=>[x,radius*Math.cos(i*Math.PI/20),.92+radius*Math.sin(i*Math.PI/20)];
function annulus(r,front,back,radii,color){
  for(let i=0;i<40;i++){
    const j=i+1,o=radii[0],inside=radii[1];
    for(const [x,rr] of [[front,o],[back,inside]]){
      const outer=x===front?.86:.72;
      r.polygon([polar(x,outer,i),polar(x,outer,j),polar(x,rr,j),polar(x,rr,i)],color,false);
    }
    r.polygon([polar(front,o,i),polar(front,o,j),polar(back,inside,j),polar(back,inside,i)],'#6a797b',false);
    r.polygon([polar(front,.86,i),polar(front,.86,j),polar(back,.72,j),polar(back,.72,i)],'#829296',false);
  }
}
function acrylicStudy(forward){
  const faceRadius=forward?.65:.54,inside=faceRadius*(forward?7/17:5/12);
  return section(forward?'alvin-forward-port':'alvin-side-port',forward?'Alvin forward viewport':'Alvin side viewport',
    'The acrylic is wider on the ocean side and narrower where an observer looks through it. Water pressure presses the tapered window against its titanium seat.',acrylicReference,[
    part('shell','Titanium hull opening','The open ring shows the widening shape of the seat around the acrylic.',[.44,0,.20],r=>annulus(r,-.25,.29,[faceRadius+.008,inside+.008],'#aac0c0')),
    part('window','Acrylic window','One transparent piece extends between the wide outer face and the smaller inner face.',[-.54,0,.23],r=>{
      const front=[],back=[];
      for(let i=0;i<40;i++){
        const a=polar(-.252,faceRadius,i),b=polar(-.252,faceRadius,i+1),c=polar(.292,inside,i+1),d=polar(.292,inside,i);
        glazingFace(r,[a,b,c,d],'#8dbbc6',.35);
        front.push(a);back.push(d);
      }
      glazingFace(r,front,'#99c2cb',.25);glazingFace(r,back.reverse(),'#9ccdd1',.27);
    })
  ]);
}
const forward=acrylicStudy(true),side=acrylicStudy(false);
forward.viewAngle=[-.64,.28];side.viewAngle=[-.64,.28];

const container=section('box-structure','A freight container',
  'The corrugated sides, end doors and floor meet at a frame with eight corner fittings. This section opens one side and shows the remaining end frame behind the doors.',
  source('Standard Club · container terminology and structure','https://d3cpegos94401u.cloudfront.net/sc-mg-container-securing-2020-final.pdf'),[
  part('floor','Floor and lower rails','The floor spans the long bottom rails.',[0,0,-.42],r=>{
    slab(r,0,0,.055,2.51,1.06,.087,'#a1825f',.018);
    for(const y of [-.54,.54])r.box(-1.27,y-.018,.045,1.27,y+.018,.145,'#587577');
  }),
  part('corner-posts','Corner posts and fittings','One casting sits at the top and bottom of each corner post.',[.11,0,.46],r=>{
    for(const x of [-1.26,1.26])for(const y of [-.54,.54]){
      r.box(x-.027,y-.029,.14,x+.027,y+.029,1.19,'#789196');
      for(const z of [.07,1.16]){
        r.box(x-.048,y-.041,z,x+.048,y+.041,z+.08,'#8da2a2');
        r.box(x-.020,y-.014,z+.081,x+.020,y+.014,z+.082,'#46595b');
      }
    }
  }),
  ...[-1,1].map(s=>part(s<0?'port':'starboard',s<0?'Left side panel':'Right side panel','Shallow corrugations run vertically between the top and bottom rails.',[0,s*.50,.15],r=>{
    let prior=null;
    for(let n=0;n<21;n++){
      const x=-1.22+n*.122;
      for(const [dx,dy] of [[0,0],[.024,.016],[.063,.016],[.082,0]]){
        if(x+dx>1.222)continue;
        const next=[x+dx,s*(.53+dy)];
        if(prior)r.polygon([[...prior,.148],[...next,.148],[...next,1.16],[...prior,1.16]],dy?'#769393':'#638485',false);
        prior=next;
      }
    }
  })),
  part('roof','Roof sheet','The roof closes the upper frame.',[0,0,.68],r=>slab(r,0,0,1.18,2.46,1.055,.034,'#839b97',.017)),
  part('end','Front end wall','The fixed end wall closes the end opposite the doors.',[-.52,0,.21],r=>r.box(-1.259,-.495,.14,-1.237,.495,1.16,'#789291')),
  ...[-1,1].map(s=>part(s<0?'left-door':'right-door',s<0?'Left door':'Right door','The two leaves meet at the center of the end frame. Each has its own vertical locking bars.',[.46,s*.30,.12],r=>{
    const y=s*.255;
    r.box(1.236,y-.245,.145,1.258,y+.245,1.155,'#739091');
    for(const d of [-.12,.12])r.rod([1.27,y+d,.15],[1.27,y+d,1.14],.016,'#b7c4bc',8);
  }))
]);
container.viewAngle=[.64,.40];

export const marineSubsections={
  alvin:Object.fromEntries(Array.from({length:5},(_,i)=>['alvin_sphere.viewport-'+(i+1),i<3?forward:side])),
  ooclspain:Object.fromEntries([1,2,3].map(i=>['container_bay.stack-'+i,container]))
};
