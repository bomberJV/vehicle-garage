import {engines,dieselStudies,seaRefs,mk} from './marine-engine-studies.js';
import {seaRotary} from './marine-rotary-studies.js';
import {TAU,part,cyl,sleeve,turn,steel,metal,gold,copper,dark,x,z} from './mechanism-shapes.js';

const coldColor='#779297';
const mint='#9cae9b',walk='#a7aea4',hullGreen='#5b7776',sides=[-1,1];
const register=new Map(),routes=new Map();
const component=(id,name,description,offset,draw,detail)=>({id,name,description,offset,draw,detail});

// Coordinates here are at ship scale. Fine machined surfaces belong to the linked sections.
function dieselShape(r,center,length,width,height,config,color=mint,compact=false){
  const [cx,cy,base]=center,x0=cx-length/2,x1=cx+length/2,half=width/2;
  const stationCount=config.inline?config.n:config.n/2,pitch=length/stationCount;
  const at=(j)=>x0+(j+.5)*pitch;
  for(const side of sides){
    r.box(x0,cy+side*half*.80-half*.10,base,x1+.02*length,cy+side*half*.80+half*.10,base+.10*height,hullGreen);
    if(config.crosshead)for(let i=0;i<=stationCount;i++){
      const xx=x0+pitch*i;
      r.rod([xx,cy+side*half*.79,base+.07*height],[xx,cy+side*half*.42,base+.53*height],pitch*.125,hullGreen,6);
    }
  }
  const baseLevel=config.crosshead?.49:.34;
  if(!config.crosshead)r.profile([[x0+.02*length,base+.08*height],[x1-.01*length,base+.08*height],[x1,base+.25*height],[x1-.04*length,base+.43*height],[x0+.06*length,base+.43*height],[x0,base+.26*height]],cy-half*.79,cy+half*.79,color);
  if(compact){
    for(const s of config.inline?[0]:sides){
      const yy=cy+s*half*.47;
      r.box(x0,yy-half*.41,base+.31*height,x1,yy+half*.41,base+.71*height,color);
      for(let j=0;j<stationCount;j++){const xx=at(j);r.box(xx-pitch*.41,yy-half*.38,base+.71*height,xx+pitch*.41,yy+half*.38,base+.85*height,'#bdc8b9');}
    }
    cyl(r,[cx,cy,base+.23*height],x,.50*length,.59*length,half*.33,steel,8);
    return;
  }
  for(const side of config.inline?[0]:sides){
    const axis=config.inline?z:[0,side*.47,.883];
    const radius=Math.min(pitch*.42,half*(config.inline?.65:.40));
    for(let j=0;j<stationCount;j++){
      const xx=at(j),bottom=[xx,cy+side*half*.18,base+height*baseLevel],h=height*(.88-baseLevel);
      cyl(r,bottom,axis,0,h,radius,color,8);
      const top=bottom.map((v,i)=>v+h*axis[i]);
      cyl(r,top,axis,-.01*height,.08*height,radius*1.10,'#cad1c5',8);
      cyl(r,top,axis,.08*height,.13*height,radius*.35,steel,6);
      if(j%2===0){const yy=top[1]+(side||1)*radius*.50;
        r.rod([xx,yy,top[2]+height*.081],[xx,yy+(side||1)*half*.18,top[2]-.12*height],radius*.14,copper,6);
      }
    }
    const yy=cy+(side||1)*half*.81,zz=base+height*.70;
    cyl(r,[cx,yy,zz],x,-length*.46,length*.46,Math.min(half*.14,height*.040),copper,8);
    const tc=[x1-length*.115,yy,zz+.043*height];
    drum(r,tc,[0,1,0],Math.min(half*.63,.22*height),height*.11,steel);
  }
  if(config.crosshead){
    // A side gallery lies level with the scavenge spaces. Uprights carry the rail.
    for(const side of sides){
      const yy=cy+side*half*.85,zz=base+height*.59;
      r.box(x0,yy-half*.17,zz-.008*height,x1,yy+half*.17,zz+.020*height,steel);
      for(let i=0;i<=4;i++){const xx=x0+length*i/4;r.rod([xx,yy,zz],[xx,yy,zz+.095*height],height*.0075,metal,6);}
      r.rod([x0,yy,zz+.095*height],[x1,yy,zz+.095*height],height*.008,metal,6);
    }
  }
  cyl(r,[cx,cy,base+.23*height],x,.50*length,.59*length,Math.min(width*.22,height*.16),steel,12);
}
function drum(r,c,axis,length,rad,color){
  turn(r,c,axis,[[-length*.5,0],[-length*.5,rad*.72],[-length*.41,rad],[length*.36,rad],[length*.47,rad*.81],[length*.5,0]],color,{n:12});
}
function turbineShape(r,c,length,rad,gas){
  turn(r,c,x,[[-length*.5,0],[-length*.5,rad*.68],[-length*.39,rad],[-length*.18,rad*.77],[.025*length,rad*.70],[length*.28,rad*.90],[length*.42,rad*1.13],[length*.5,rad*.82],[length*.5,0]],gas?'#af9783':'#9baaa5',{n:14});
  for(const t of [-.36,-.18,.08,.30])sleeve(r,c,x,t*length,(t+.023)*length,rad*(t>.2?1.06:t<-.3?1.05:.84),rad*.65,metal,14);
  for(const at of [-.31,.31])r.box(c[0]+(at-.04)*length,c[1]-rad*.75,c[2]-rad*1.11,c[0]+(at+.04)*length,c[1]+rad*.75,c[2]-rad*.68,dark);
}
function smallGear(r,c,l,w){
  drum(r,c,x,l,w*.43,hullGreen);cyl(r,[c[0],c[1],c[2]+w*.34],x,-l*.43,l*.39,w*.25,steel,12);
}
function shaftRun(r,from,to,rad){
  r.rod(from,to,rad,metal,10);
  for(const t of [.16,.74]){const at=from.map((v,i)=>v+(to[i]-v)*t);cyl(r,at,x,-rad*.85,rad*.85,rad*1.8,steel,10);}
}
function axialProp(r,c,axis,rad,shroud,blades=4){
  const shape=(ax,ry,rz)=>axis==='z'?[c[0]+ry,c[1]+rz,c[2]+ax]:axis==='y'?[c[0]+ry,c[1]+ax,c[2]+rz]:[c[0]+ax,c[1]+ry,c[2]+rz];
  if(shroud){
    for(let i=0;i<14;i++){const a=TAU*i/14,b=TAU*(i+1)/14,at=(h,rr,t)=>shape(h,Math.cos(t)*rr,Math.sin(t)*rr);
      for(const [h0,rr0,h1,rr1,col] of [[-.40*rad,rad,.39*rad,rad,steel],[.39*rad,rad,.39*rad,.86*rad,metal],[.39*rad,.86*rad,-.40*rad,.84*rad,dark]])r.polygon([at(h0,rr0,a),at(h1,rr1,a),at(h1,rr1,b),at(h0,rr0,b)],col,false);
    }
  }
  const axisVector=axis==='z'?z:axis==='y'?[0,1,0]:x;
  drum(r,c,axisVector,rad*1.2,rad*.22,steel);
  for(let i=0;i<blades;i++){
    const a=TAU*i/blades,at=(u,dt,offset)=>shape(offset,rad*u*Math.cos(a+dt),rad*u*Math.sin(a+dt));
    r.polygon([at(.17,0,0),at(.64,.20,-rad*.12),at(.83,.58,-rad*.10),at(.76,.77,rad*.08),at(.32,.41,rad*.11)],gold,false);
  }
}
function room(r,spec){
  const {lo,hi,w,floor,top}=spec,span=hi-lo,h=top-floor,wall=.011;
  const center=spec.cy??0;
  const far=center-w;
  // One longitudinal wall and the forward bulkhead outline locate the deck.
  // The observer-facing side is open. The inboard generator rooms are separate.
  r.box(lo,center-w,floor,hi,center+w,floor+wall,walk);
  r.box(lo,far,floor+wall,hi,far+wall,top,'#c7d0c8');
  for(let i=0;i<7;i++){
    const xx=lo+.05*span+i*.15*span;r.box(xx-.005,far+.012,floor+h*.07,xx+.005,far+.024,top,'#8b9d98');
    r.box(xx-.004,center-w+.016,floor+wall,xx+.004,center+w-.016,floor+wall*1.16,'#798785');
  }
  for(const t of [.68,.84])r.rod([lo+.04*span,far+.030,floor+h*t],[hi-.03*span,far+.030,floor+h*t],Math.min(.012,h*.032),t>.70?copper:steel,8);
  // Center walkway with transverse non-slip slats.
  const aisle=Math.min(.052,w*.16);
  r.box(lo+.026,center-aisle,floor+.013,hi-.025,center+aisle,floor+.022,'#5e706e');
  for(let i=0;i<18;i++){const xx=lo+span*(i+1)/19;r.box(xx-.003,center-aisle,floor+.022,xx+.003,center+aisle,floor+.025,metal);}
  const ladderX=hi-span*.09;
  for(const xx of [ladderX-h*.10,ladderX+h*.10])r.rod([xx,far+.046,floor+h*.08],[xx,far+.031,top],.006,steel,7);
  for(let i=1;i<5;i++){const zz=floor+h*i/5,yy=far+.046-i*.003;r.rod([ladderX-h*.10,yy,zz],[ladderX+h*.10,yy,zz],.004,metal,7);}
}
function engine(partId,label,key,c,l,w,h,desc,color,compact=false){
  const conf=engines[key];return component(partId,label,desc,[0,c[1]<0?-.37:.38,.24],r=>dieselShape(r,c,l,w,h,conf,color,compact),dieselStudies.get(conf.key).engine);
}
function newRoom(v,name,intro,source,spec,components,specialRoomParts){
  const path=new Map(),id='marine-room-'+v;
  const inRoom=(specialRoomParts??components.filter(c=>c.room!==false)).map(c=>part(c.id,c.name,c.description,c.offset,c.draw));
  const deck=spec.structure??part('structure','Floor plates, pipe runs and access ladder','The open side reveals the machinery deck, working aisle and the pipes along the surviving bulkhead. The cutaway wall and access route are schematic.',[0,.42,-.32],r=>room(r,spec));
  const detail=mk(id,name,intro+(v==='alvin'?' The open frame shows their axes.':' The cutaway arranges the documented equipment within a representative machinery space.')+' Select a machine to open its own section.',source,[deck,...inRoom]);
  const entry=component('room',name,v==='alvin'?'Open the lower frame to see both batteries and follow their connections to the seven thrusters.':'Open the machinery compartment to see the arrangement under the deck and follow its power connections.',[0,.61,.40],deck.draw,detail);
  for(const c of components){if(c.detail){path.set('propulsion.'+c.id,c.detail);path.set(id+'.'+c.id,c.detail);}}
  path.set('propulsion.room',detail);
  register.set(v,{id:'propulsion',name:v==='alvin'?'Batteries and propulsion':'Engine room and propulsion',description:intro+' Equipment positions and pipe runs are schematic.',source,view:'hero',internal:true,
    parts:[entry,...components].map(c=>({id:'propulsion.'+c.id,name:c.name,description:c.description,offset:c.offset,draw:c.draw,source:c.source??source}))});
  routes.set(v,path);
}
const generators=(r,ctr,l,rad)=>{drum(r,ctr,x,l,rad,steel);for(const s of sides)r.box(ctr[0]-.38*l,ctr[1]+s*rad*.71-.008,ctr[2]-rad*.94,ctr[0]+.38*l,ctr[1]+s*rad*.71+.008,ctr[2]-rad*.57,dark);};
const ext=(c)=>({...c,room:false});
function electricalPanel(r,lo,hi,cy,floor,h){
  r.box(lo,cy-.021,floor,hi,cy+.021,floor+h,steel);
  for(let i=0;i<5;i++){const xx=lo+(hi-lo)*i/5;r.box(xx+.003,cy-.025,floor+.04*h,xx+(hi-lo)/5-.004,cy-.022,floor+h*.94,'#b2beb4');r.box(xx+(hi-lo)*.04,cy-.030,floor+h*.65,xx+(hi-lo)*.13,cy-.026,floor+h*.81,dark);}
}

// Eight V20 generator sets and a ninth inline set supply electric loads across the vessel.
// Only one of its distributed rooms appears in the enlarged engine-room view.
{
 const components=[],roomParts=[];
 for(const side of sides){
   for(let i=0;i<4;i++){
     const xx=-.66+i*.73,yy=side*.593;
     const entry=engine((side<0?'port':'starboard')+'-set-'+(i+1),(side<0?'Port':'Starboard')+' V20 genset '+(i+1),'pion',[xx,yy,.10],.30,.13,.19,'The MAN V20 drives an alternator through a flexible coupling. Its electrical output can serve any connected ship load.',mint,!(side===1&&i===1));
     components.push(entry);
     const gen=component((side<0?'port':'starboard')+'-alternator-'+(i+1),(side<0?'Port':'Starboard')+' alternator '+(i+1),'A short flexible coupling joins the diesel crankshaft to a generator rotor. Open the alternator to see its shaft, rotor and stationary windings.',[.21,side*.3,.23],r=>generators(r,[xx+.24,yy,.173],.135,.055),seaRotary.alternator);
     components.push(gen);
     if(side===1&&i===1)roomParts.push(entry,gen);
   }
 }
 components.push(engine('inline-set','Nine-cylinder inline genset','pionNine',[.20,.28,.11],.36,.10,.16,'A straight nine-cylinder generator engine supplements eight V20 machines.'));
 components.push(component('inline-alternator','Inline-set alternator','The inline nine also drives an alternator, bringing the total to nine generator sets.',[.2,.35,.25],r=>generators(r,[.46,.28,.145],.13,.045),seaRotary.alternator));
 const bus=component('distribution','Electrical distribution board','The generators feed a common electrical system rather than a separate engine-to-propeller shaft for each thruster.',[0,-.37,.28],r=>electricalPanel(r,-.12,.26,.49,.092,.148));
 components.push(bus);roomParts.push(bus);
 for(const side of sides)for(let i=0;i<6;i++){
   const xx=[-2.09,-1.41,-.53,.39,1.30,2.07][i],yy=side*.602;
   components.push(ext(component('thruster-'+(side<0?'p':'s')+(i+1),(side<0?'Port':'Starboard')+' azimuth thruster '+(i+1),'A fixed-pitch propeller turns inside the steering leg. The whole unit can rotate about a vertical axis to redirect thrust.',[0,side*(.30+i*.03),-.26],r=>{
     cyl(r,[xx,yy,0],z,-.068,.068,.035,dark,9);axialProp(r,[xx+.036,yy,-.061],'x',.078,true);
   },seaRotary.azimuth)));
 }
 newRoom('pioneeringspirit','Generator room bay','Eight MAN V20s and one inline nine generate power. Twelve steerable electric thrusters turn that power into thrust.',seaRefs.pion,
   {lo:-.16,hi:.40,w:.118,cy:.593,floor:.071,top:.31},components,roomParts);

}
{
 const comp=[
  ...sides.map((s,i)=>component('boiler-'+(i+1),'Mitsubishi boiler '+(i+1),'One of two oil-fired boilers supplies steam to the turbine plant.',[-.50,s*.32,.32],r=>{r.box(1.36,s*.133-.076,.104,1.58,s*.133+.076,.245,hullGreen);drum(r,[1.47,s*.133,.26],x,.19,.043,metal);},seaRotary.boiler)),
  component('main-turbine','Sumitomo–Stal-Laval steam turbine','Steam expands across the turbine stages. Its shaft connects to the reduction gear ahead of the propeller line.',[0,-.47,.27],r=>turbineShape(r,[1.72,0,.195],.32,.07,false),seaRotary.steam),
  component('condenser','Main condenser and condensate return','Exhaust steam condenses across a bank of seawater-cooled tubes. A pump sends condensate back toward the boilers.',[0,.40,-.24],r=>{drum(r,[1.71,.12,.103],x,.25,.045,steel);r.rod([1.78,.12,.115],[1.81,0,.174],.022,metal,8);for(const s of sides)r.rod([1.62,.12,.104],[1.46,s*.13,.109],.009,copper,8);},seaRotary.condenser),
  component('gear','Main reduction gear','The turbine turns much faster than the single propeller. The reduction gear couples their different speeds.',[.33,.25,.16],r=>smallGear(r,[1.925,0,.166],.102,.116),seaRotary.gear),
  ext(component('shaft','Single shaft line','Shafting runs aft from the gear to the single screw beneath the counter stern.',[.34,0,-.23],r=>shaftRun(r,[1.975,0,.157],[2.157,0,.109],.016),seaRotary.shaft))
 ];
 newRoom('seawisegiant','After steam engine room','Two Mitsubishi boilers supply the Sumitomo–Stal-Laval turbine. The reduction gear turns one propeller. Condensing the exhaust closes the steam cycle.',seaRefs.steam,{lo:1.32,hi:2.0,w:.235,floor:.067,top:.31},comp);
}
{
 const c=[
  engine('main-engine','WinGD X92-B main engine','oocl',[1.426,0,.052],.56,.178,.32,'Twelve cylinders fire along a single crankshaft. The low-speed diesel is coupled directly to the propeller shaft.'),
  component('charge','Scavenge-air receiver and coolers','The turbochargers compress incoming air. After cooling, air enters the receiver alongside the cylinder jackets.',[0,-.39,.26],r=>{drum(r,[1.43,-.103,.23],x,.49,.025,coldColor);r.box(1.21,-.140,.121,1.34,-.105,.208,metal);}),
  component('uptake','Exhaust uptake','Exhaust from the engine passes through the turbocharger turbines and rises into the red funnel casing above.',[0,.39,.43],r=>{r.rod([1.52,.09,.295],[1.49,.077,.37],.021,copper,10);r.rod([1.49,.077,.37],[1.49,.077,.407],.022,steel,10);}),
  ext(component('shaft','Direct-drive shaft and propeller','The crankshaft flange drives one shaft. There is no speed-reducing gearbox between this low-speed engine and its propeller.',[.45,-.08,-.20],r=>{shaftRun(r,[1.74,0,.126],[2.38,0,.063],.015);axialProp(r,[2.38,0,.064],'x',.076,false,5);},seaRotary.shaft))
 ];
 newRoom('ooclspain','Low-speed diesel engine room','The WinGD twelve-cylinder two-stroke sits under the after funnel. The shaft runs directly aft while the scavenge-air and exhaust systems flank the cylinder row.',seaRefs.oocl,{lo:1.095,hi:1.78,w:.18,floor:.040,top:.386},c);
}
function jetYacht(v,number,spacing){
  const c=[],azz=v==='azzam',src=azz?seaRefs.azzam:seaRefs.octo;
  for(let i=0;i<number;i++){
    const yy=(i-(number-1)/2)*spacing,port=yy<0?'port':'starboard',middle=azz&&(i===1||i===2),name=number===3?['Port','Center','Starboard'][i]:((i<2?'Port':'Starboard')+(middle?' inboard':' outboard'));
    const suffix=number===3?['port','center','starboard'][i]:port;
    if(middle)c.push(component('turbine-'+suffix,name+' gas turbine','An independent gas turbine supplies the center booster jet through reduction gearing.',[0,yy<0?-.32:.32,.38],r=>turbineShape(r,[1.48,yy,.222],.53,.039,true),seaRotary.gas));
    else c.push(engine('diesel-'+suffix,name+' diesel engine',azz?'azzam':'octo',[azz?1.49:1.02,yy,azz?.128:.10],azz?.45:.71,azz?.068:.157,azz?.126:.228,
      azz?'This outboard engine drives a reversible steering waterjet. Lürssen reports about 9.2 MW per diesel.':'One of three MTU 16V396 TB94 diesels. The three engines deliver power through separate stern waterjets.','#b1c3b6'));
    const gearX=azz?1.825:1.52;
    c.push(component('gear-'+i,name+' reduction gear','A short coupling joins the engine to the gear. Output shaft speed matches the impeller’s required range.',[.12,yy<0?-.34:.34,.18],r=>smallGear(r,[gearX,yy,azz?.166:.164],.105,azz?.076:.13),seaRotary.gear));
    c.push(ext(component('jet-'+i,name+(middle?' booster jet':' waterjet'),'The impeller draws water up through the bottom intake and accelerates it toward the transom discharge.',[.40,yy<0?-.32:.32,-.14],r=>{
      const zz=azz?.163:.205,radius=azz?.032:.068;
      shaftRun(r,[gearX+.05,yy,azz?.166:.164],[2.25,yy,zz],radius*.24);
      const p=[2.35,yy,zz];drum(r,p,x,.205,radius,steel);
      r.rod([2.15,yy,zz-radius],[2.32,yy,zz],radius*.58,coldColor,10);
      cyl(r,p,x,.087,.150,radius*.67,dark,10);
    },middle?seaRotary.booster:seaRotary.steer)));
  }
  const txt=azz?'The center pair of gas turbines supplies the booster jets. A diesel drives each outboard steerable, reversible jet. The four drives are mechanically independent.':'Three V16 diesels, each with its own waterjet, occupy the broad afterbody of the original Heesen yacht.';
  newRoom(v,azz?'Four-drive machinery room':'Triple MTU engine room',txt,src,{lo:azz?1.19:.61,hi:azz?1.93:1.63,w:azz?.193:.324,floor:azz?.116:.081,top:azz?.30:.37},c);
}
jetYacht('azzam',4,.096);jetYacht('octopussy',3,.205);
{
 const c=[
  engine('main-engine','EMD 16-710G7 main engine','araho',[.79,0,.130],.85,.39,.31,'The 16-cylinder two-stroke diesel supplies the single controllable-pitch propeller through a reduction gear.'),
  component('gear','Lufkin 7.20:1 reduction gear','At the documented 900 engine rpm the 7.20:1 gear turns the propeller shaft at 125 rpm.',[.33,-.22,.23],r=>smallGear(r,[1.40,0,.227],.20,.23),seaRotary.gear),
  component('pto','ABB shaft generator','The gearbox power takeoff drives a 1,700 kW generator. It supplies electrical loads from the operating main engine.',[.18,.47,.18],r=>{generators(r,[1.39,.267,.231],.25,.082);r.rod([1.35,.066,.268],[1.35,.211,.238],.026,steel,8);},seaRotary.alternator),
  ext(component('shaft','Controllable-pitch propeller shaft','The output drives the single screw in its nozzle. Pitch change alters the amount of water driven astern at a given shaft speed.',[.42,0,-.23],r=>shaftRun(r,[1.51,0,.220],[2.10,0,.196],.028),seaRotary.shaft))
 ];
 newRoom('araho','Main engine and shaft-generator room','The EMD diesel drives a vertically offset Lufkin gear. One output goes to the propeller, while a power takeoff turns the ABB shaft generator.',seaRefs.araho,{lo:.26,hi:1.58,w:.40,floor:.09,top:.51},c);
}
{
 const c=[];for(const s of sides){const pos=s<0?'Port':'Starboard',yy=s*.24,k=s<0?'port':'starboard';
   c.push(engine(k+'-engine',pos+' MTU V16','viking',[.295,yy,.116],.83,.25,.275,'The selected Series 2000 V16 M96L option places a sixteen-cylinder diesel beside the centerline service aisle.','#d0d7cd'));
   c.push(component(k+'-gear',pos+' marine gear','The gearbox connects this engine to its own inclined propeller shaft.',[.25,s*.36,.18],r=>smallGear(r,[.871,yy,.196],.19,.18),seaRotary.gear));
   c.push(ext(component(k+'-shaft',pos+' shaft line','A shaft carries the engine’s torque aft beneath the fishing cockpit to the propeller.',[.30,s*.37,-.23],r=>shaftRun(r,[.975,yy,.195],[1.453,s*.23,.174],.022),seaRotary.shaft)));
 }
 newRoom('viking90','Twin-diesel engine room','The available twin MTU V16 installation sits beneath the saloon. A center aisle separates the engines, which drive independent port and starboard shafts.',seaRefs.viking,{lo:-.205,hi:1.00,w:.435,floor:.087,top:.47},c);
}
{
 const c=[];
 for(const s of sides){const label=s<0?'Port':'Starboard';c.push(component(s<0?'port-battery':'starboard-battery',label+' 120-volt battery bank','Lead-acid cells supply electrical energy to the submersible’s propulsion and other onboard loads.',[0,s*.51,-.24],r=>{
   const yy=s*.35;r.box(-.08,yy-.154,.163,1.09,yy+.154,.385,dark);r.box(-.09,yy-.16,.386,1.10,yy+.16,.417,mint);
   for(let j=0;j<6;j++)r.box(-.015+j*.187,yy-.141,.418,.008+j*.187,yy+.14,.43,steel);
 },seaRotary.battery));}
 const thrusters=[['port-aft','Port fore/aft thruster',[2.04,-.65,.805],'x'],['starboard-aft','Starboard fore/aft thruster',[2.04,.65,.805],'x'],['center-aft','Center fore/aft thruster',[2.10,0,.94],'x'],['forward-cross','Forward lateral thruster',[-.37,0,.60],'y'],['aft-cross','Aft lateral thruster',[1.64,0,.89],'y'],['port-lift','Port vertical thruster',[.68,-.61,1.29],'z'],['starboard-lift','Starboard vertical thruster',[.68,.61,1.29],'z']];
 for(const [key,name,c0,axis] of thrusters)c.push(component(key,name,'A reversible electric motor turns the shrouded propeller. Its installed axis determines which way the thrust acts.',[key.includes('aft')?.40:0,c0[1]<0?-.43:.43,axis==='z'?.49:.14],r=>{
   const radial=.12,dir=axis==='x'?x:axis==='y'?[0,1,0]:z;
   if(key==='port-aft'||key==='starboard-aft'){const hubX=2.204;axialProp(r,[hubX,c0[1]<0?-.69:.69,.81],'x',.137,false,3);drum(r,c0,dir,.21,radial*.55,hullGreen);}
   else axialProp(r,c0,axis,radial,true,3);
 },seaRotary.electric));
 const drawFrame=r=>{
   for(const s of sides){
     const yy=s*.49;r.rod([-.12,yy,.135],[1.13,yy,.135],.025,steel,8);
     const o=[.64,s*.48,.49];
     for(const to of [[.68,s*.61,1.16],[1.99,s*.65,.80],[1.63,s*.24,.89]])r.rod(o,to,.016,steel,8);
     for(const xx of [-.12,1.13])r.rod([xx,yy,.135],o,.017,steel,8);
   }
   for(const to of [[-.37,0,.60],[2.10,0,.94]])r.rod([.64,0,.49],to,.018,steel,8);
   for(const xx of [-.10,.31,.72,1.1])r.rod([xx,-.49,.135],[xx,.49,.135],.024,steel,8);
 };
 newRoom('alvin','Battery and thruster frame','Two 120-volt lead-acid banks supply seven thrusters. Three act fore and aft, two act vertically and two act sideways. The side-force units are separated fore and aft.',seaRefs.alvin,{
   structure:part('structure','Battery supports and power frame','Crossmembers carry the two banks low in the vehicle. The open frame supports the thruster drives around the fairing.',[0,0,-.51],drawFrame)
 },c);

}
export function getMarinePropulsionGroup(v){return register.get(v)??null;}
export function getMarinePropulsionDetail(v,id){
  const paths=routes.get(v);if(!paths||typeof id!=='string')return null;
  if(paths.has(id))return paths.get(id);
  if(id==='marine-motor.bearings'&&v==='alvin')return seaRotary.bearing;
  if(id==='marine-shaft.screw'&&['araho','viking90','seawisegiant','ooclspain'].includes(v))return v==='araho'?seaRotary.cpp:seaRotary.fixedProp;
    for(const {engine,unit,piston} of dieselStudies.values()){
    // A cylinder is reachable only from an engine that this vessel actually carries.
    if(![...paths.values()].includes(engine))continue;
    if(id.startsWith(engine.id+'.') && /cylinder-\d+$/.test(id) && engine.groups[0].parts.some(p=>p.id===id))return unit;
    if(id===unit.id+'.piston')return piston;
  }
  const old={
   seawisegiant:{'hull.stern':seaRotary.shaft},
   araho:{'hull.propeller':seaRotary.shaft},
   viking90:{'hull.screws':seaRotary.shaft},
   azzam:{'hull.jets':seaRotary.steer},
   alvin:{'vehicle.thrusters':seaRotary.electric}
  };
  return Object.hasOwn(old[v]??{},id)?old[v][id]:null;
}
