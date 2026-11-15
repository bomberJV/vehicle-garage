// Functional sections redrawn for the E46. Dimensions, air passages, winding
// pitch and electrical traces are illustrative. Coordinates here are in metres.
import {box,path,plus,alloy,iron,rubber,copper} from './road-service-geometry.js';
import {cyl,sleeve,turn,TAU,x,y,z,part,study} from './mechanism-shapes.js';

const origin=[0,0,0],fore=[-.42,0,.07],aft=[.42,0,.07],left=[0,-.40,.04],right=[0,.40,.04],up=[0,0,.44],down=[0,0,-.44];
const feature=(key,name,description,offset,draw)=>({key,name,description,offset,draw});

// Route every primitive through a local polygon transform, keeping installed
// parts and their bench cutaways geometrically identical apart from scale.
function localRenderer(r,center,scale,place){
 const transformed=Object.create(r);
 transformed.polygon=(points,...args)=>r.polygon(points.map(point=>plus(center,place(point).map(n=>n*scale))),...args);
 return transformed;
}
export function instrument(key,name,description,source,center,features,{scale=4,place=p=>p,motion='',rigid=null}={}){
 const render=(r,phase=0)=>{
  const local=localRenderer(r,center,1,place);
  for(const f of features)f.draw(local,phase,false);
 };
 const detail=study('e46-'+key,name,description,source,features.map(f=>part(f.key,f.name,f.description,f.offset,(r,phase)=>{
  f.draw(localRenderer(r,origin,scale,p=>p),phase,true);
 })),motion);
 return {draw:rigid?r=>r.rigid(rigid.name,rigid.offset,()=>render(r)):r=>render(r),detail};
}

export function heatExchanger(width,height,depth){
 const margin=.009,rail=.012;
 return [
  feature('headers','Two end tanks','The tanks distribute fluid between the narrow tubes.',left,r=>{
   for(const s of [-1,1])box(r,[0,s*(width-rail)/2,0],[depth,rail,height],iron);
  }),
  feature('tubes','Tube bank','Fluid passes through these flattened channels. Air crosses the gaps between them.',right,r=>{
   for(let j=0;j<9;j++)box(r,[0,0,(j-4)*(height-2*margin)/8],[depth*.90,width-2*rail,.0042],alloy);
  }),
  feature('fins','Folded fins','A thin folded strip carries heat between each tube and the passing air.',up,r=>{
   const across=24,span=width-2*rail;
   for(let row=0;row<8;row++){
    const base=(row-4)*(height-2*margin)/8,step=(height-2*margin)/8;
    for(let j=0;j<across;j++){
     const y0=-span/2+j*span/across,y1=y0+span/across;
     const z0=base+(j%2?step-.002:.002),z1=base+(j%2?.002:step-.002);
     r.polygon([[-depth*.4,y0,z0],[depth*.4,y0,z0],[depth*.4,y1,z1],[-depth*.4,y1,z1]],j%2?'#788789':'#a0ada9',false);
    }
   }
  }),
  feature('ports','Inlet and outlet stubs','Each tube terminates at an end-tank port.',fore,r=>{
   for(const s of [-1,1])sleeve(r,[0,s*(width/2-.006),s*(height/2-.016)],x,-depth*.5-.025,-depth*.48,.010,.007,alloy,10);
  })
 ];
}
export function muffler(length,width,height){
 function outline(station,i,segments=16){
  const a=TAU*i/segments;
  return [station,width/2*Math.cos(a),height/2*Math.sin(a)];
 }
 return [
  feature('shell','Pressed outer shell','The rolled shell encloses the silencing volume. The open section exposes the teaching model inside.',up,(r,p,cut)=>{
   for(let i=cut?4:0;i<16;i++)r.polygon([outline(-length/2,i),outline(-length/2,i+1),outline(length/2,i+1),outline(length/2,i)],i%4?'#93958a':'#7e8179',false);
  }),
  feature('caps','Stamped end plates','Two end plates carry the inlet and outlet pipes.',fore,r=>{
   for(const s of [-1,1])r.polygon(Array.from({length:16},(_,i)=>outline(s*length/2,i)),'#7d817c',false);
  }),
  feature('passages','Gas passages','These parallel passages illustrate how flow crosses a silencer. Internal routing and perforations vary by part.',aft,r=>{
   for(const s of [-1,1])sleeve(r,[0,s*width*.19,0],x,-length*.51,length*.51,Math.min(.022,height*.22),Math.min(.018,height*.18),iron,12);
  }),
  feature('partition','Chamber partition','A transverse partition illustrates acoustic chambers inside the housing.',down,r=>{
   r.polygon(Array.from({length:16},(_,i)=>outline(length*.07,i)).map(([a,b,c])=>[a,b*.91,c*.90]),'#a39c88',false);
  })
 ];
}
export function idleValve(){
 return [
  feature('body','T-shaped housing','The idle-air passages meet around a rotating shutter.',fore,(r,p,cut)=>{
   turn(r,origin,x,[[-.048,.016],[-.048,.027],[.041,.027],[.041,.016]],alloy,{n:14,sweep:cut?TAU*.71:TAU});
   sleeve(r,[.019,0,0],y,-.038,-.018,.014,.011,rubber,12);
  }),
  feature('rotor','Rotary shutter','The aperture turns across the bypass port as the engine controller adjusts idle airflow.',up,(r,phase)=>{
   turn(r,origin,x,[[-.009,.014],[-.009,.018],[.026,.018],[.026,.014]],'#997a53',{n:9,start:.9*Math.sin(Math.PI*phase)**2,sweep:TAU*.52});
   cyl(r,origin,x,-.034,.033,.004,iron,10);
  }),
  feature('coil','Electrical winding and plug','The electrical drive turns the shutter inside its bore.',left,r=>{
   for(let j=0;j<6;j++)sleeve(r,origin,x,-.045+j*.004,-.042+j*.004,.020,.009,copper,12);
   box(r,[-.047,0,.016],[.021,.023,.021],rubber);
  }),
  feature('mount','Rubber retaining sleeve','The sleeve supports the valve below the intake manifold.',down,r=>sleeve(r,origin,x,-.027,-.012,.031,.027,rubber,14))
 ];
}
export function blower(){
 return [
  feature('motor','Double-ended blower motor','A single motor spins both fan wheels on a common shaft.',up,r=>{
   cyl(r,origin,y,-.033,.033,.042,iron,14);cyl(r,origin,y,-.145,.145,.006,alloy,9);
  }),
  ...[-1,1].map(s=>feature(s<0?'left-wheel':'right-wheel',s<0?'Left blower wheel':'Right blower wheel','A ring of curved vanes throws air outwards from the hub.',s<0?left:right,(r,phase)=>{
   const a=s*.051,b=s*.129;
   sleeve(r,[0,b,0],y,-.002,.002,.059,.053,rubber,18);
   cyl(r,[0,a,0],y,-.002,.002,.056,rubber,18);
   for(let j=0;j<18;j++){
    const theta=TAU*(j/18+phase),point=(radius,angle,yy)=>[Math.cos(angle)*radius,yy,Math.sin(angle)*radius];
    r.polygon([point(.046,theta,a),point(.058,theta+.16,a),point(.058,theta+.16,b),point(.046,theta,b)],'#5b6465',false);
   }
  })),
  feature('cradle','Motor saddle','A support at the center holds the motor in the cowl housing.',down,r=>turn(r,origin,y,[[-.031,.043],[-.031,.050],[.031,.050],[.031,.043]],rubber,{n:9,start:Math.PI,sweep:Math.PI}))
 ];
}
export function seatPad(length,width){
 return [
  feature('carrier','Textile carrier','The flexible backing sits immediately beneath the seat cover.',down,r=>box(r,[0,0,-.0016],[length,width,.0022],'#a49b83')),
  feature('wire','Resistance element','Current warms a resistance element distributed across the pad. The drawn path is illustrative.',up,r=>{
   const pts=[];
   for(let j=0;j<10;j++)for(const s of (j%2?[1,-1]:[-1,1]))pts.push([(j/9-.5)*(length-.025),s*(width/2-.012),.0007]);
   path(r,pts,.0017,'#985e42');
  }),
  feature('lead','Heater tail and connector','A short flexible lead connects the element to the seat harness.',right,r=>{
   const start=[length/2-.011,-width/2+.012,.001];
   path(r,[start,[length/2+.004,-width*.36,-.006],[length/2+.017,-width*.29,-.016]],.0026,rubber);
   box(r,[length/2+.017,-width*.29,-.016],[.015,.017,.009],'#a09a79');
  })
 ];
}
export function fluidValve(){
 return [
  feature('body','Valve block','The inlet and outlet occupy the lower housing.',down,r=>{
   box(r,[0,0,-.027],[.045,.042,.035],rubber);
   for(const s of [-1,1])sleeve(r,[0,0,-.031],y,s*.02,s*.042,.012,.009,rubber,10);
  }),
  feature('plunger','Plunger and seat','The plunger moves axially to regulate flow to the heater.',right,(r,phase)=>{
   const pos=.008*Math.sin(Math.PI*phase)**2;
   cyl(r,[0,0,pos],z,-.034,.014,.005,alloy,10);cyl(r,[0,0,pos],z,-.035,-.031,.010,rubber,12);
  }),
  feature('coil','Solenoid winding','A coil around the guide acts on the plunger.',up,r=>{
   for(let j=0;j<7;j++)sleeve(r,origin,z,-.008+.004*j,-.0048+.004*j,.017,.007,copper,13);
  }),
  feature('cap','Solenoid case and socket','A cylindrical case surrounds the coil.',left,(r,p,cut)=>{
   turn(r,origin,z,[[-.011,.018],[-.011,.022],[.025,.022],[.030,.012]],iron,{n:15,sweep:cut?TAU*.62:TAU});box(r,[.020,0,.009],[.017,.017,.016],rubber);
  })
 ];
}
export function dryer(){
 return [
  feature('case','Receiver shell','The upright container holds liquid refrigerant on the high-pressure side.',down,(r,p,cut)=>turn(r,origin,z,[[-.105,.004],[-.100,.030],[.089,.030],[.095,.025]],alloy,{n:16,sweep:cut?TAU*.67:TAU})),
  feature('charge','Desiccant pack','The desiccant traps moisture inside the receiver.',left,r=>turn(r,origin,z,[[-.077,0],[-.072,.021],[.039,.021],[.045,.017]],'#a69572',{n:14})),
  feature('pickup','Pickup tube and screen','A filtered outlet carries liquid toward the expansion valve.',right,r=>{sleeve(r,[0,.012,0],z,-.082,.089,.006,.004,iron,10);cyl(r,[0,.012,0],z,-.087,-.081,.011,iron,12);}),
  feature('head','Port head','Connections in the head seal the container to the refrigerant circuit.',up,r=>{cyl(r,origin,z,.088,.100,.028,iron,15);for(const s of [-1,1])sleeve(r,[0,s*.012,0],z,.096,.112,.007,.0045,alloy,10);})
 ];
}
export function controller(plugs){
 return [
  feature('housing','Housing and mounting ears','The plastic base holds the board and fixes the module to its carrier.',down,r=>{
   box(r,[0,0,-.009],[.102,.167,.012],rubber);for(const s of [-1,1])box(r,[0,s*.087,-.007],[.040,.014,.007],iron);
  }),
  feature('board','Control board','The functional board illustrates the control and output stages. Component positions are schematic.',right,r=>{
   box(r,origin,[.090,.151,.003],'#556f59');for(let j=0;j<4;j++)box(r,[.003,(j-1.5)*.025,.004],[.020,.012,.005],rubber);
  }),
  feature('sockets','Harness sockets','Keyed plugs connect the board to the vehicle harness.',aft,r=>{
   for(let j=0;j<plugs;j++)box(r,[.050,(j-(plugs-1)/2)*(.143/plugs),.002],[.015,.120/plugs,.018],['#777e84','#b4ad91',rubber][j%3]);
  }),
  feature('lid','Case lid','The lid lifts away from the circuit board.',up,(r,p,cut)=>{if(!cut)box(r,[0,0,.011],[.099,.164,.005],'#41494d');else box(r,[0,.050,.011],[.099,.064,.005],'#41494d');})
 ];
}

export function steeringPump(){
 return [
  feature('housing','Pump housing and cam ring','The cam ring surrounds the vanes. The illustrated eccentric region shows how the pumping pockets change volume.',down,(r,p,cut)=>{
   turn(r,[0,.004,0],x,[[-.040,.034],[-.040,.046],[.030,.046],[.040,.032],[.036,.032]],iron,{n:18,sweep:cut?TAU*.66:TAU});
  }),
  feature('rotor','Rotor and sliding vanes','Slots carry vanes around the ring as the pump turns. Each vane extends to follow the surrounding profile.',up,(r,phase)=>{
   cyl(r,origin,x,-.019,.019,.020,alloy,15);
   for(let i=0;i<8;i++){
    const angle=TAU*(i/8+phase),w=.029+.005*Math.cos(angle);
    const point=(ax,rad,da)=>[ax,rad*Math.cos(angle+da),rad*Math.sin(angle+da)];
    const a=point(-.014,.019,0),b=point(.014,.019,0),c=point(.014,w,0),d=point(-.014,w,0);
    r.polygon([a,b,c,d],'#b9ae92',false);r.polygon([c,d,point(-.014,w,.065),point(.014,w,.065)],'#908986',false);
   }
  }),
  feature('drive','Drive pulley and shaft','The accessory belt turns the grooved pulley and rotor shaft.',fore,r=>{
   cyl(r,origin,x,-.065,.022,.007,alloy,10);for(let j=0;j<4;j++)sleeve(r,origin,x,-.065+j*.004,-.062+j*.004,.055,.010,rubber,14);
  }),
  feature('ports','Supply and pressure ports','One connection admits fluid from the reservoir and the smaller port carries pressurized fluid to the rack.',right,r=>{
   sleeve(r,[.018,0,0],y,-.058,-.039,.009,.006,iron,9);sleeve(r,[.011,0,0],z,.035,.056,.008,.005,alloy,9);
  })
 ];
}
