// Enlarged machinery sections use the same fore/aft x axis as the vessel meshes.
import {TAU,part,study,cyl,turn,sleeve,gear,steel,metal,gold,copper,dark,x,y,z} from './mechanism-shapes.js';

export const seaRefs={
  pion:{label:'VULKAN · nine MAN engines and generator couplings',url:'https://www.vulkan.com/fileadmin/user_upload/Downloads/SharePoint_Import/Catalogues/Marine/Applications/VULKAN_Reference_Brochure_Pioneering_Spirit_en.pdf'},
  azimuth:{label:'Allseas · Pioneering Spirit propulsion particulars',url:'https://www.allseas.com/sites/d10p.allseas.com/files/2026-02/pioneering-spirit-vessel-specs-2026.pdf'},
  steam:{label:'Honourable Company of Master Mariners · Seawise Giant machinery',url:'https://www.mastermariners.uk/public/Southend_News_and_Views_August_2024.pdf'},
  oocl:{label:'Port of Hamburg · OOCL Spain main engine',url:'https://www.hafen-hamburg.de/en/all-vessels/ship-specials/oocl-spain/'},
  cross:{label:'WinGD · X92-B marine installation manual',url:'https://wingd.com/media/hnyp2vxg/mim_wingd_x92-b_20230301.pdf'},
  azzam:{label:'Lürssen · Azzam propulsion plant design',url:'https://www.stg-online.org/veranstaltungen/110_Hauptversammlung_br_das_Programm_wird_sukzessive_ergaenzt_br_/1431426909.html'},
  octo:{label:'Mulder Design · original Octopussy machinery',url:'https://mulderdesign.nl/yacht/octopussy/'},
  araho:{label:'Professional Mariner · Araho machinery particulars',url:'https://professionalmariner.com/araho-specifications/'},
  viking:{label:'Viking Yachts · Viking 90 engine room tour',url:'https://www.vikingyachts.com/valhalla/ValhallaSummer2023/ValhallaSummer2023.pdf'},
  alvin:{label:'Woods Hole · Alvin batteries and thrusters',url:'https://ndsf.whoi.edu/alvin/specifications/'},
  alvinAxes:{label:'Woods Hole · Alvin propulsion layout',url:'https://www.whoi.edu/wp-content/uploads/2019/03/JOT_Article_250024.pdf'}
};
const paint='#72948e', blue='#69919d', pale='#c8d2c7', graphite='#415157';
const both=[-1,1];
const tip=(base,axis,length)=>base.map((v,j)=>v+axis[j]*length);
function pipe(r,points,radius,color){for(let i=1;i<points.length;i++)r.rod(points[i-1],points[i],radius,color,9);}
export function bladeRow(r,c,axis,at,bore,radius,count,color,angle=0,lean=.18){
  const from=(s,theta,rad)=>axis===x?[c[0]+s,c[1]+Math.cos(theta)*rad,c[2]+Math.sin(theta)*rad]:[c[0]+Math.cos(theta)*rad,c[1]+Math.sin(theta)*rad,c[2]+s];
  for(let i=0;i<count;i++){
    const a=angle+TAU*i/count;
    const q=[from(at-.038,a-.075,bore),from(at+.045,a+.10,bore),from(at+.055,a+lean+.078,radius),from(at-.043,a+lean-.06,radius*.985)];
    r.polygon([q[0],q[1],q[2]],color,false);r.polygon([q[0],q[2],q[3]],color,false);
  }
}
function headFittings(r,base,axis,size){
  for(const dx of [-1,1])for(const dy of [-1,1]){
    const foot=[base[0]+dx*size*.53,base[1]+dy*size*.51*axis[2],base[2]-dy*size*.51*axis[1]];
    cyl(r,foot,axis,0,size*.16,size*.11,metal,6);
  }
  cyl(r,base,axis,0,size*.43,size*.17,graphite,10);
}
function crankDetail(crosshead,phase){
  const a=TAU*phase,rad=.255,length=.79;
  const pin=[0,rad*Math.sin(a),rad*Math.cos(a)];
  const slider=pin[2]+Math.sqrt(length*length-pin[1]*pin[1]);
  return {pin,slider,piston:slider+(crosshead?.50:0)};
}
const mk=(id,name,description,source,parts,motion='')=>Object.assign(study(id,name,description,source,parts,motion),{viewAngle:[-.63,.31]});
export {mk};
function cylinderStudy(conf) {
  const {key,crosshead=false,twoStroke=false,source}=conf;
  const id=key+'-unit',ref=crosshead?seaRefs.cross:source;
  const zTop=crosshead?1.747:1.247;
  const parts=[
    part('liner','Cutaway cylinder liner',twoStroke?'Near the bottom of the stroke the piston uncovers scavenge openings. Pressurized air enters the liner while exhaust leaves through the head.':'A machined sleeve forms the running surface for the piston rings. The front sector is removed so the piston stays visible.',[0,.86,.22],r=>{
      const origin=[0,0,0],lower=crosshead?1.0:.50;
      const visible=(lo,hi,initial=.15,arc=Math.PI*1.12,n=24)=>turn(r,origin,z,[[lo,.269],[lo,.30],[hi,.30],[hi,.269],[lo,.269]],blue,{start:initial,sweep:arc,n});
      if(twoStroke){visible(lower,lower+.23);for(let i=0;i<9;i++)visible(lower+.23,lower+.35,.15+i*Math.PI*1.12/9,.14,3);visible(lower+.35,zTop);}
      else visible(lower,zTop);
    }),
    part('piston','Piston and ring lands','The rings ride in grooves around the crown. Open the piston to separate the rings, crown and skirt.',[.87,0,.40],(r,p)=>{
      const c=[0,0,crankDetail(crosshead,p).piston];
      turn(r,c,z,[[-.15,.22],[-.14,.246],[.105,.248],[.11,.251],[.173,.251],[.18,0]],pale);
      for(let i=0;i<3;i++)sleeve(r,c,z,.075+i*.034,.091+i*.034,.257,.247,graphite,22);
    }),
    part('rod','Connecting rod',crosshead?'The small end carries the crosshead pin. The big end follows the orbit of the crankpin below.':'A pin through the small end joins the rod to the piston. Its large lower bearing follows the revolving crankpin.',[0,-.75,-.04],(r,p)=>{
      const {pin,slider}=crankDetail(crosshead,p);r.rod(pin,[0,0,slider],.058,steel,10);sleeve(r,pin,x,-.092,.092,.118,.065,gold,18);sleeve(r,[0,0,slider],x,-.074,.074,.093,.045,metal,18);
    }),
    part('crank','Crankshaft and crankpin','Two webs connect the offset crankpin to the shaft journals. Turning the shaft carries the lower end of the rod around a circle.',[.12,0,-.78],(r,p)=>{
      const {pin}=crankDetail(crosshead,p);cyl(r,pin,x,-.12,.12,.064,metal);
      for(const s of both){cyl(r,[0,0,0],x,s*.15,s*.46,.075,steel);r.rod([s*.13,0,0],[s*.13,pin[1],pin[2]],.087,graphite,12);}
    }),
    part('head','Cylinder head and injector',twoStroke?'Exhaust leaves through the head. The injector directs fuel into the air already compressed by the piston.':'A cylinder head closes the liner. The injector tip, valve stems and passages are shown in enlarged section.',[0,.12,.92],r=>{
      turn(r,[0,0,zTop],z,[[-.015,.27],[-.015,.31],[.09,.31],[.11,.28]],paint,{sweep:Math.PI*1.16,start:.18});
      headFittings(r,[0,0,zTop+.10],z,.31);
      const valves=crosshead?[[0,0]]:[[-.10,-.06],[.10,-.06],[-.10,.09],[.10,.09]];
      for(const [vx,vy] of valves){cyl(r,[vx,vy,zTop],z,-.05,.16,.018,metal,10);cyl(r,[vx,vy,zTop],z,-.056,-.037,crosshead?.10:.057,steel,14);}
    })
  ];
  if(crosshead)parts.push(part('crosshead','Crosshead, shoes and piston rod','The piston rod stays vertical. Crosshead shoes slide along straight guides while the lower connecting rod swings sideways.',[-.75,0,.1],(r,p)=>{
    const {slider}=crankDetail(true,p);cyl(r,[0,0,slider],z,0,.50,.058,metal);
    r.box(-.143,-.10,slider-.058,.143,.10,slider+.061,steel);
    for(const s of both){r.box(s*.154-.011,-.093,.47,s*.154+.011,.093,1.21,blue);r.box(s*.134-.013,-.082,slider-.10,s*.134+.013,.082,slider+.10,gold);}
  }));
  return mk(id,conf.name+' · one cylinder',crosshead?'The piston rod transmits load to a guided crosshead. Below it, a shorter connecting rod converts that straight travel into rotation.':twoStroke?'This two-stroke diesel admits fresh air through ports in the liner and sends exhaust out through valves in the head.':'This section follows one piston, its rod and one crank throw. The adjacent bank uses the same basic mechanism.',ref,parts,'Follow one crank revolution. The lower bearing travels in a circle while the piston stays on the cylinder axis.');
}
function pistonSection(source){
  return mk('marine-piston','Diesel piston ring pack','From the crown downward, grooves support the ring faces against the liner. This enlarged three-ring section illustrates the grooves and end gaps; the fitted ring count depends on the engine.',source,[
    part('body','Crown, lands and skirt','The lands support the rings on each side of their grooves.',[0,0,-.68],r=>{const p=[[-.56,0],[-.56,.42],[.08,.45]];for(let i=0;i<3;i++){const h=.10+i*.073;p.push([h,.45],[h+.006,.402],[h+.043,.402],[h+.049,.45]);}p.push([.33,.45],[.33,.31],[.28,.24],[.27,0]);turn(r,[0,0,0],z,p,pale,{n:36});}),
    ...['Lower ring','Middle ring','Upper ring'].map((name,i)=>part('ring-'+(i+1),name,'A narrow gap lets the ring compress into the liner. The ring can move within its groove.',[i===1?.74:0,i===0?-.78:0,i===2?.81:.16],r=>{
      const h=.11+i*.073;turn(r,[0,0,0],z,[[h,.415],[h,.458],[h+.03,.458],[h+.03,.415],[h,.415]],i===0?copper:steel,{n:32,start:.45+i*1.72,sweep:TAU-.105});
    }))
  ]);
}
function engineStudy(conf) {
  const {key,source,n,inline=false,crosshead=false}=conf;
  const count=inline?n:n/2,spacing=2.35/count,parts=[],height=crosshead?1.28:.78,bodyWidth=crosshead?.46:inline?.31:.55;
  const width=Math.min(spacing*.39,inline?.145:.16);
  parts.push(part('foundation','Bedplate and bearing saddles','Longitudinal rails carry the crankshaft main bearings and spread the engine load into its foundation.',[0,0,-.66],r=>{
    for(const s of both)r.box(-1.33,s*bodyWidth-.042,-.13,1.33,s*bodyWidth+.042,.04,graphite);
    for(let i=0;i<=count;i++){const a=-1.175+i*spacing;r.box(a-.04,-bodyWidth,.002,a+.04,bodyWidth,.092,steel);}
  }),
  part('frame',crosshead?'A-frame columns and guides':'Crankcase and cylinder banks',crosshead?'Tall transverse frames support the cylinder jacket above the crankcase. Crosshead guides lie between them.':'The cylinder banks sit on a common lower case. The open face exposes the main shaft and cylinder spacing.',[0,.76,.09],r=>{
    for(const s of both){r.box(-1.22,s*(bodyWidth-.02)-.04,.05,1.22,s*(bodyWidth-.02)+.04,.18,paint);
      for(let j=0;j<=count;j++){const xx=-1.175+j*spacing;pipe(r,[[xx,s*(bodyWidth-.02),.10],[xx,s*(bodyWidth*.50),height*.67]],.035,paint);}
      r.box(-1.23,s*bodyWidth*.52-.04,height*.62,1.23,s*bodyWidth*.52+.04,height*.69,paint);
    }
  }),
  part('crank','Main crankshaft','The aft flange couples the crankshaft to the next part of the drive. The crank throw shown in each cylinder study reveals the bearing motion.',[-.54,0,-.43],r=>{cyl(r,[0,0,.16],x,-1.34,1.39,.081,metal,18);for(let j=0;j<count;j++){const st=-1.175+(j+.5)*spacing;cyl(r,[0,0,.16],x,st-.029,st+.029,.145,graphite,12);}cyl(r,[0,0,.16],x,1.27,1.35,.206,steel);}));
  for(let j=0;j<count;j++)for(const side of inline?[0]:both){
    const xx=-1.175+(j+.5)*spacing,axis=inline?z:[0,side*.49,.872],base=[xx,side*.068,height*.48];
    const num=j+1,bank=inline?'':side<0?'port':'starboard';
    parts.push(part((bank?bank+'-':'')+'cylinder-'+num,(bank?(side<0?'Port':'Starboard')+' bank · c':'C')+'ylinder '+num,
      'The head and liner occupy this station along the crankshaft. Open it to follow the piston and connecting rod.',[0,(side||1)*(.46+.045*j),.43+.06*(j%3)],r=>{
        const length=height*.51;cyl(r,base,axis,0,length,width,paint,14);
        const head=tip(base,axis,length);cyl(r,head,axis,-.005,.045,width*1.16,pale,8);
        headFittings(r,tip(head,axis,.045),axis,width);
      }));
  }
  parts.push(part('exhaust','Exhaust receiver and turbocharger','The exhaust receiver collects gas leaving the cylinder heads. At its end the turbine turns a compressor on the same short shaft.',[-.18,.84,.65],r=>{
    const yy=bodyWidth*.87,zz=height*.85;
    cyl(r,[0,yy,zz],x,-1.12,1.08,.068,copper,14);
    for(let j=0;j<count;j++){const xx=-1.175+(j+.5)*spacing;pipe(r,[[xx,yy,zz],[xx,yy*.73,zz+.03],[xx,yy*.64,height*.99]],.022,copper);}
    for(const s of both){turn(r,[1.11,yy+s*.05,zz],y,[[-.052,.079],[-.035,.14],[.028,.14],[.05,.088]],s>0?steel:copper,{n:16});}
  }));
  const study=mk(key,conf.name,conf.note+' Select any cylinder to open the liner, piston and crank throw. The arrangement of external pipework is schematic.',source,parts);
  study.viewAngle=[-.55,.43];
  return study;
}
export const engines={
 oocl:{key:'marine-x92',name:'WinGD X92-B inline twelve',n:12,inline:true,crosshead:true,twoStroke:true,source:seaRefs.cross,note:'Twelve tall cylinders stand in one row above the crankcase. This slow-speed two-stroke drives the propeller shaft directly.'},
 pion:{key:'marine-manv20',name:'MAN 20V32/44CR generator engine',n:20,source:seaRefs.pion,note:'Ten cylinders in each bank share one crankshaft. This engine turns an alternator.'},
 pionNine:{key:'marine-manl9',name:'MAN 9L32/44CR generator engine',n:9,inline:true,source:seaRefs.pion,note:'The ninth generator engine has a single straight bank of nine cylinders. The other eight generator sets each use a V20.'},
 azzam:{key:'marine-yacht-diesel',name:'Azzam outboard diesel',n:20,source:seaRefs.azzam,note:'Each outboard drive pairs a diesel engine with a steering jet. This V-bank example illustrates the diesel mechanism; cylinder indexing and fittings are representative.'},
 octo:{key:'marine-mtu396',name:'MTU 16V396 TB94',n:16,source:seaRefs.octo,note:'Each of the original yacht’s three diesels has two banks of eight cylinders. Each engine powers a separate jet.'},
 araho:{key:'marine-emd710',name:'EMD 16-710G7',n:16,twoStroke:true,source:seaRefs.araho,note:'Eight cylinders form each bank of the trawler’s two-stroke main diesel. The output passes into the Lufkin reduction gear.'},
 viking:{key:'marine-mtu2000',name:'MTU Series 2000 V16 M96L',n:16,source:seaRefs.viking,note:'This Viking 90 option places a V16 on either side of the central walkway. One engine and its eight cylinders per bank are shown here.'}
};
export const dieselStudies=new Map(Object.values(engines).map(c=>[c.key,{engine:engineStudy(c),unit:cylinderStudy(c),piston:pistonSection(c.source)}]));
