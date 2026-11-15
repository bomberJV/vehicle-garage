import {TAU,metal,steel,dark,gold,copper,point,basis,turn,cyl,sleeve,gear,bead,part,study,y,x,z,origin} from './mechanism-shapes.js';
const src={label:'MIT · gear selection in a manual transmission',url:'https://web.mit.edu/2.972/www/reports/manual_transmission/manual_transmission.html'};
export const manual=study('manual','Gear pair and synchronizer','The two gears stay in mesh. The selected ratio carries drive when the sliding sleeve engages the gear’s dogs and connects the gear to the output shaft. This enlarged section represents one ratio in the Carrera manual transaxle.',src,[
 part('driver','Driving gear and shaft','The driving gear turns with its shaft. Its teeth carry the load into the mating gear.',[0,-.68,-.25],(r,t)=>{const c=[0,0,.43];cyl(r,c,x,-.82,.78,.14,steel);gear(r,c,x,-.14,.10,.36,.36,12,gold,TAU*2*t);}),
 part('wheel','Selected gear','This twenty-four-tooth illustrative gear turns once while its twelve-tooth mate turns twice. Its side dogs engage the selector sleeve.',[0,0,.70],(r,t)=>{const c=[0,0,1.455];gear(r,c,x,-.14,.10,.72,.72,24,steel,-TAU*t+Math.PI/24);gear(r,c,x,.11,.18,.34,.34,12,metal,-TAU*t);}),
 part('shaft','Output shaft and splined hub','Longitudinal splines keep the central hub tied to the output shaft. Torque from the sleeve reaches the axle through the final drive.',[-.55,0,0],r=>{const c=[0,0,1.455];cyl(r,c,x,-.87,.90,.14,dark);gear(r,c,x,.23,.55,.28,.28,12,steel);}),
 part('sleeve','Selector sleeve','When engaged, the sleeve bridges the hub and the dogs on the side of the chosen gear.',[.74,0,.16],r=>sleeve(r,[0,0,1.455],x,.12,.42,.35,.268,'#ab9564')),
 part('ring','Synchronizer ring','The ring matches speeds at the cone before the sleeve engages the dogs. This colored ring is visible between the hub and gear.',[.40,-.55,.40],r=>turn(r,[0,0,1.455],x,[[.15,.222],[.15,.31],[.226,.30],[.226,.24],[.15,.222]],gold)),
],'One illustrative 12-to-24 tooth pair is engaged. The small gear makes two turns for each turn of the larger one.');
const clutchSrc={label:'SKF · manual transmission clutches',url:'https://www.skf.com/binaries/pub12/Images/0901d196804e9e4b-11562-EN-Clutch-Catalaogue_tcm_12-477357.pdf'};
export const clutch=study('clutch','Dry single-plate clutch','Spring force clamps the friction disc between the flywheel and pressure plate. The disc carries torque into the splined transmission input shaft.',clutchSrc,[
 part('flywheel','Flywheel','The crankshaft drives the flywheel. Its flat face provides one friction surface for the clutch disc.',[-.72,0,0],r=>{sleeve(r,origin,x,-.44,-.24,.83,.13,steel);}),
 part('disc','Friction disc','Friction linings on two faces allow the disc to carry torque when clamped. Its splined hub engages the gearbox input shaft.',[-.25,.6,0],r=>{sleeve(r,origin,x,-.231,-.152,.75,.44,dark);sleeve(r,origin,x,-.225,-.158,.46,.13,gold);gear(r,origin,x,-.27,-.13,.22,.22,14,metal);}),
 part('pressure','Pressure plate','The pressure plate clamps the driven disc to the flywheel while the spring acts through the clutch cover.',[.49,0,0],r=>sleeve(r,origin,x,-.145,.015,.79,.37,steel)),
 part('spring','Diaphragm spring','Radial fingers transmit the release force. The diagram separates the load-carrying spring from the pressure plate.',[.75,.12,.35],r=>{sleeve(r,origin,x,.03,.07,.73,.52,steel);const b=basis(x);for(let i=0;i<16;i++){const a=i*TAU/16;r.polygon([point(origin,b,.07,.56,a-.12),point(origin,b,.07,.56,a+.12),point(origin,b,.20,.23,a+.09),point(origin,b,.20,.23,a-.09)],metal,false);}}),
]);
const cvSource={label:'GKN · constant-velocity joint families',url:'https://www.gknautomotive.com/en/aftermarket/portfolio/constant-velocity-joints/'};
export const cvJoint=study('cvjoint','Ball-type constant-velocity joint','The wheel can move on its suspension while the driveshaft continues to turn. In this representative fixed joint the cage guides balls in matching tracks in the inner race and outer housing.',cvSource,[
 part('housing','Outer housing and stub','The wheel-side housing collects torque from the balls. A sector is removed here so the balls and cage remain visible.',[0,-.78,0],r=>{turn(r,origin,y,[[-.86,0],[-.86,.14],[-.40,.14],[-.30,.50],[-.15,.60],[.27,.59],[.31,.49],[.20,.47],[-.20,.45],[-.31,.20]],steel,{start:.05,sweep:2.93,n:24});}),
 part('balls','Six drive balls','The balls transfer load between the two sets of tracks. Their centers lie in the plane that bisects the angle between the shafts.',[.2,.2,.74],r=>{for(let i=0;i<6;i++)bead(r,point(origin,basis(y),0,.390,TAU*i/6),.105,metal);}),
 part('cage','Ball cage','The six openings hold the balls around the inner race and allow each ball to project into the tracks on either side.',[.56,.46,0],r=>{
   for(const s of [-1,1])sleeve(r,origin,y,s*.125,s*.16,.435,.34,gold);
   const b=basis(y);for(let i=0;i<6;i++){const a=TAU*(i+.5)/6;r.rod(point(origin,b,-.13,.384,a),point(origin,b,.13,.384,a),.056,gold,7);}
 }),
 part('inner','Inner race and splined shaft','Grooves on the inner race support the balls. The race is splined to the shaft.',[0,.9,0],r=>{gear(r,origin,y,-.16,.16,.345,.345,6,steel,.52);cyl(r,origin,y,.11,.94,.126,metal);}),
 part('boot','Rubber boot','The convoluted rubber boot retains grease while allowing the joint to flex.',[.24,1.24,.50],r=>{
   const prof=[[.31,.53]];for(let i=0;i<5;i++){const k=1-i*.151;prof.push([.33+i*.11,.51*k],[.365+i*.11,.54*k],[.4+i*.11,.40*k]);}
   prof.push([.90,.14],[.91,.115]);turn(r,origin,y,prof,dark,{start:.05,sweep:2.93,n:24});
 }),
]);
cvJoint.viewAngle=[-.86,.70];
manual.viewAngle=[.72,.39];
const motoSource={label:'BMW Motorrad · 2023 S 1000 RR transmission and final drive',url:'https://www.bmw-motorrad.co.uk/en/models/sport/s1000rr-2023/technicaldata.html'};
export const multiClutch=study('wetclutch','Multi-plate wet clutch','Alternating friction plates and steel discs carry torque between a basket and an inner hub. Spring force compresses the stack. Opening it interrupts the path between the two rotating members.',motoSource,[
 part('basket','Outer basket','Outer tabs on the friction plates engage the slots between the basket fingers.',[-.55,0,0],r=>{
   sleeve(r,origin,x,-.15,-.09,.76,.21,steel);
   for(let i=0;i<10;i++){const b=basis(x),a=TAU*i/10;r.rod(point(origin,b,-.10,.702,a),point(origin,b,.39,.702,a),.046,steel,7);}
 }),
 part('hub','Inner hub','The inner teeth of the steel discs engage splines on the hub.',[.66,0,0],r=>gear(r,origin,x,-.08,.45,.319,.319,16,metal)),
 ...Array.from({length:6},(_,i)=>part('plate-'+i,(i%2?'Steel disc ':'Friction plate ')+(Math.floor(i/2)+1),
   i%2?'The steel disc engages the inner hub. Both faces contact neighboring friction linings.':'Outer tabs engage the basket. The friction lining transfers torque across the compressed stack.',
   [.24+i*.30,0,.1*i],r=>{const a=i*.057;
     sleeve(r,origin,x,a,a+.035,i%2?.64:.69,i%2?.298:.36,i%2?metal:gold);
     const b=basis(x);
     for(let j=0;j<8;j++)r.rod(point(origin,b,a+.016,i%2?.31:.66,j*TAU/8),point(origin,b,a+.016,i%2?.28:.74,j*TAU/8),.023,i%2?metal:gold,6);
   })),
 part('pressure','Pressure plate','The pressure plate distributes spring load across the stack. Three plate pairs are drawn here so the alternating engagement is easy to see.',[2.1,0,0],r=>sleeve(r,origin,x,.34,.45,.68,.20,steel)),
]);
export const finalChain=study('roller','Roller-chain link','The sprocket tooth bears against a roller. A row of pinned links carries tension from the gearbox sprocket to the rear wheel.',motoSource,[
 part('outer','Outer link plates','The outer plates hold two connecting pins at fixed spacing.',[0,.64,0],r=>{for(const s of [-1,1]){r.box(-.44,s*.30-.04,-.12,.44,s*.30+.04,.12,steel);for(const xx of [-.44,.44])cyl(r,[xx,s*.30,0],y,-.04,.04,.17,steel);}}),
 part('inner','Inner link plates','The inner plates carry the bushings and articulate about the adjoining pins.',[0,-.65,0],r=>{for(const s of [-1,1]){r.box(.44,s*.195-.03,-.1,1.32,s*.195+.03,.1,gold);for(const xx of [.44,1.32])cyl(r,[xx,s*.195,0],y,-.03,.03,.145,gold);}}),
 part('pins','Connecting pins','The pin-and-bushing interface lets a link pivot as it enters or leaves a sprocket.',[-.45,0,.50],r=>{for(const xx of [-.44,.44,1.32])cyl(r,[xx,0,0],y,-.36,.36,.067,metal);}),
 part('rollers','Rollers and bushings','Each roller rotates where the sprocket contacts it. Its bushing surrounds the connecting pin.',[.25,.35,.62],r=>{for(const xx of [-.44,.44,1.32]){sleeve(r,[xx,0,0],y,-.17,.17,.13,.095,steel);sleeve(r,[xx,0,0],y,-.196,.196,.09,.07,metal);}}),
]);
