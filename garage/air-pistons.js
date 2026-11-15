import {part,section,source} from './section-primitives.js';

const lycoming=source('Lycoming · IO-360-L2A for the Cessna 172S','https://www.lycoming.com/engines/10185');
const continental=source('NACA · Continental A-75 photographs and cylinder arrangement, 1941','https://ntrs.nasa.gov/citations/19930081748');
const circle=Math.PI*2;
const cylinders=[[-.385,-1,0],[-.218,1,Math.PI],[.215,-1,Math.PI],[.382,1,0]];
const eachCylinder=(r,fn)=>cylinders.forEach(([x,s,angle],i)=>r.instance((s<0?'Port':'Starboard')+' '+(i<2?'forward':'rear'),()=>fn(x,s,angle,i)));
const pin=(x,angle)=>[x,.131*Math.cos(angle),.131*Math.sin(angle)];
function wrist(x,sign,angle){
 const a=pin(x,angle);
 return [x,a[1]+sign*Math.sqrt(.469**2-a[2]**2),0];
}
// Remove a quadrant of each fin and barrel on the observer's side to show
// the piston stroke. Each fin has two faces, an outside edge and cut edges.
function barrel(r,x,s,y0,y1,outer,inner,color,sectioned){
 const start=sectioned?3.49:0,end=sectioned?6.99:circle,n=24;
 const p=(y,radius,a)=>[x+radius*Math.cos(a),s*y,radius*Math.sin(a)];
 for(let i=0;i<n;i++){
   const a=start+(end-start)*i/n,b=start+(end-start)*(i+1)/n;
   r.polygon([p(y0,outer,a),p(y1,outer,a),p(y1,outer,b),p(y0,outer,b)],color,false);
   for(const y of [y0,y1])r.polygon([p(y,inner,a),p(y,outer,a),p(y,outer,b),p(y,inner,b)],color,false);
   if(sectioned&&inner<.14)r.polygon([p(y0,inner,a),p(y1,inner,a),p(y1,inner,b),p(y0,inner,b)],'#666f71',false);
 }
 if(sectioned)for(const a of [start,end])r.polygon([p(y0,inner,a),p(y0,outer,a),p(y1,outer,a),p(y1,inner,a)],'#bbafa0',false);
}
function engine(cub){
 const ref=cub?continental:lycoming,slug=cub?'a75':'io360',name=cub?'Continental A-75':'Lycoming IO-360-L2A';
 const gray=cub?'#909699':'#89979a';
 const model=section(slug,name+' opposed four',cub?
   'The J-5A’s 75 hp Continental has two cylinders on each side of the crankcase. A carburetor underneath supplies the four intake pipes. The front of the crankshaft drives the propeller.':
   'Two staggered banks of finned cylinders flank the 172S crankcase. The fuel-injected Lycoming turns its propeller directly. Watch a piston pull its connecting rod and crankpin inward as the opposite piston follows.',ref,[
   part('case','Cutaway crankcase','The open upper case exposes the journals along the centerline. The ribs and webs support the crankshaft.',[0,-.45,-.28],r=>{
     const profile=[[-.87,-.061],[-.69,-.20],[.62,-.21],[.78,-.132],[.78,.027],[.64,.069],[-.68,.069],[-.87,.026]];
     r.profile(profile,-.208,-.126,gray);
     r.box(-.71,-.126,-.204,.68,.180,-.155,gray);
     for(const x of [-.57,.00,.57])r.rod([x,-.14,-.142],[x,.167,-.142],.054,'#809095',10);
   }),
   part('crank','Crankshaft and crankpins','Each connecting rod rides an offset crankpin. The main journals turn on the engine centerline.',[-.17,0,.52],(r,phase)=>{
     const stubs=[[-.75,-.451],[-.325,-.287],[-.150,.145],[.279,.314],[.447,.64]];
     for(const [a,b] of stubs)r.rod([a,0,0],[b,0,0],.067,'#6e7880',20);
     for(const [x,,a] of cylinders){
       const angle=phase*circle+a;
       r.rod(pin(x-.042,angle),pin(x+.042,angle),.047,'#99a4a6',18);
       for(const shift of [-.053,.053])r.rod([x+shift,0,0],pin(x+shift,angle),.061,'#707e86',14);
     }
   }),
   part('rods','Four connecting rods','The rods pivot at the wrist pins and follow the offset crankpins through each revolution.',[.29,.26,-.49],(r,phase)=>eachCylinder(r,(x,s,a)=>{
     const angle=phase*circle+a,base=pin(x,angle),tip=wrist(x,s,angle);
     r.rod(base,tip,.030,'#989d95',12);
     r.rod([x-.027,base[1],base[2]],[x+.027,base[1],base[2]],.064,'#8d938c',16);
   })),
   part('pistons','Four pistons and wrist pins','The pistons move across the engine. Their motion stays on the cylinder axis while the rods rock from side to side.',[.15,.52,.37],(r,phase)=>eachCylinder(r,(x,s,a)=>{
     const [,y]=wrist(x,s,phase*circle+a);
     r.tubeY(x,y-s*.056,y+s*.089,0,.121,'#a3aaa4',20);
     r.ringY(x,y+s*.089,0,.121,0,'#afb6af',20);
     for(const shift of [.048,.066])r.tubeY(x,y+s*shift,y+s*(shift+.009),0,.122,'#4a5354',20);
     r.rod([x-.124,y,0],[x+.124,y,0],.018,'#b0b4aa',12);
   })),
   part('barrels','Cylinder barrels and cooling fins','Air flows between the fins. A section through the two starboard barrels reveals the moving piston crowns.',[-.11,.48,.68],r=>eachCylinder(r,(x,s)=>{
     barrel(r,x,s,.288,.765,.145,.126,gray,s===1);
     for(let j=0;j<10;j++)barrel(r,x,s,.325+j*.044,.333+j*.044,.183+(j>5?.008:0),.145,j%2?'#8e999a':'#7e8a8d',s===1);
   })),
   part('heads','Cylinder heads and rocker covers','Each head encloses a combustion chamber, intake and exhaust valves. The outboard cover encloses the rocker arms.',[.26,-.58,.46],r=>eachCylinder(r,(x,s)=>{
     for(let j=0;j<4;j++)barrel(r,x,s,.77+j*.020,.781+j*.020,.20,.067,j%2?'#999c97':'#89918e',s===1);
     const y=s*.87;
     r.profile([[x-.155,-.079],[x-.118,-.145],[x+.115,-.145],[x+.155,-.07],[x+.149,.074],[x+.087,.135],[x-.109,.126],[x-.154,.061]],y-.023,y+.023,cub?'#7d807a':'#9ca6a7');
     const face=y+s*.023;
     const cover=cub?[[x-.105,-.052],[x-.037,-.084],[x+.089,-.072],[x+.105,.058],[x+.015,.092],[x-.099,.063]]:[[x-.109,-.053],[x-.083,-.093],[x+.085,-.093],[x+.111,-.057],[x+.107,.051],[x+.064,.084],[x-.074,.078],[x-.109,.045]];
     r.profile(cover,face+s*.001,face+s*.021,cub?'#746e62':'#7e8b8d');
     for(const dx of [-.119,.119]){const zz=cub?.006:0; r.ringY(x+dx,face+s*.002,zz,.017,0,'#535b5b',12);}
   })),
   part('induction',cub?'Carburetor and intake pipes':'Fuel distribution and induction pipes',cub?
     'The updraft carburetor feeds a common manifold below the engine. Four curved branches carry the mixture to the cylinders.':
     'The induction pipes feed intake air to the four cylinders. Small injector lines lead from the flow divider to the cylinder heads.',[0,0,-.62],r=>{
     r.box(-.21,-.16,-.38,.27,.16,-.207,cub?'#817a66':'#788482');
     if(cub){r.rod([.019,0,-.52],[.019,0,-.37],.086,'#9c8768',16);r.box(-.1,-.126,-.53,.14,.124,-.50,'#626967');}
     else r.rod([.022,0,.072],[.022,0,.164],.059,'#8c9290',16);
     eachCylinder(r,(x,s)=>{
       const bend=[x,s*.49,-.256];
       r.rod([x*.41,s*.14,-.279],bend,.039,'#979995',14);
       r.rod(bend,[x,s*.802,-.092],.039,'#979995',14);
       if(!cub){
         r.rod([.022,0,.152],[x,s*.45,.212],.009,'#b39d72',8);
         r.rod([x,s*.45,.212],[x,s*.792,.157],.009,'#b39d72',8);
       }
     });
   }),
   part('plugs','Spark plugs and leads','Two spark plugs serve each cylinder. The ceramic insulator separates the center conductor from the metal shell.',[.23,.39,-.67],r=>eachCylinder(r,(x,s)=>{
     for(const side of [-1,1]){
       const tip=[x+side*.072,s*.78,side*.191];
       r.rod([x+side*.051,s*.77,side*.122],tip,.026,'#b9bbb1',8);
       const top=[tip[0]+side*.016,s*.758,side*.243];
       r.rod(tip,top,.017,'#ddd9c7',10);
       r.rod(top,[x+.063,s*.53,side*.229],.010,'#484b47',7);
     }
   })),
   part('propeller','Propeller drive and flange','Follow the nose of the crankshaft forward. Open the flange to inspect the propeller, its hub and its fasteners.',[-.66,.02,.14],(r,phase)=>{
     r.rod([-.99,0,0],[-.72,0,0],.073,'#898e8d',24);
     r.rod([-1.025,0,0],[-.98,0,0],.159,gray,32);
     r.discX(-1.025,0,0,.159,'#8c9593',32);
     for(let i=0;i<6;i++){
       const a=(phase+i/6)*circle, y=.122*Math.cos(a),z=.122*Math.sin(a);
       const color=i===0?'#ceb879':'#6b7272';
       r.rod([-1.042,y,z],[-1.025,y,z],.014,color,8);r.discX(-1.042,y,z,.014,color,8);
     }
   })
 ]);
 model.animated=true;model.viewAngle=[-.66,.55];model.motionDescription='A marked fastener on the flange follows one crankshaft revolution. Watch the pistons reverse direction as the connecting rods swing across the centerline.';
 return model;
}
export const lycomingEngine=engine(false),continentalEngine=engine(true);
