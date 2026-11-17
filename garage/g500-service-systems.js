import {cassetteSetback} from './g500-roof-datums.js';
import {drawBladeFuse,fuseSections,fuseSupplier} from './g500-blade-fuse.js';
import {drawG500FuelFilter,fuelFilterCenter,fuelPorts,g500FilterSources} from './g500-filter-geometry.js';
import {engineShapes} from './engine-shapes.js';
import {drawG500BrakeHydraulics} from './g500-brake-hydraulics.js';
import {g500ComfortElectricalRows} from './g500-comfort.js';
import {g500ElectronicNetworkRows,getG500NetworkDetail,g500ElectronicAssemblyText,g500ElectronicSources,g500ElectronicAssemblySources} from './g500-electronic-network.js';
import {drawG500Disc,drawG500ParkingShoe,drawG500BrakePad,drawG500Caliper,drawG500InstalledCaliper,brakeRefs} from './g500-rotors.js';
import {drawG500InstalledRotor,g500RotorCenter} from './g500-underbody.js';
// 2002 US G500. Local coordinates are schematic. Sources and callouts identify the physical assembly.
import {part,study,sleeve,cyl,turn,gear,metal,steel,dark,gold,copper,TAU,x,y,z} from './mechanism-shapes.js';
const epc='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const manual='https://cdn.dealereprocess.org/cdn/servicemanuals/mercedesbenz/2002-gclass.pdf#page=';
const ref=(label,url)=>({label,url});
export const g500ServiceSources={
 roof:ref('Mercedes-Benz Classic · sliding roof, frame and rails',epc+'body--sunroof'),
 roofOperation:ref('2002 G-Class operator’s manual · sliding and rear-lift commands, p. 154',manual+'157'),
 roofLayout:ref('2002 G500 · sunroof frame, sunshade and motor parts drawings','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/sunroof'),
 motor:ref('2002 G-Class operator’s manual · cargo-area roof drive, p. 346',manual+'349'),
 brake:ref('Mercedes-Benz Classic · disc pads, rotors and parking-brake shoes',epc+'brakes--disc-pads-and-brake-shoes'),
 hydraulic:ref('Mercedes-Benz Classic · brake hydraulics',epc+'brakes--brake-hydraulics'),
 fuel:ref('Mercedes-Benz Classic · tank, sender, pump and filter',epc+'fuel-system--fuel-system-components'),
 electrics:ref('Mercedes-Benz Classic · fuse and relay components',epc+'electrical--electrical-components'),
 fuseMap:ref('2002 G-Class operator’s manual · fuse-box locations, pp. 297–300',manual+'300'),
 battery:ref('2002 G-Class operator’s manual · cabin battery and remote jump terminals, p. 319',manual+'322'),
 rescue:ref('Mercedes-Benz · W463 rescue layout, battery position as of 12/2000','https://rk.mb-qr.com/en/463/')
};
const src=g500ServiceSources;
const blue='#658e99',rubber='#333e42',ivory='#c9c4ae',red='#985248';
const O=[0,0,0],up=[0,0,.68],down=[0,0,-.6],left=[0,-.68,.08],right=[0,.68,.08],fore=[-.72,0,.05],aft=[.72,0,.05];
const cPart=(id,name,description,offset,draw)=>part(id,name,description,offset,draw);
function line(r,points,radius,color){
 for(let i=1;i<points.length;i++)r.rod(points[i-1],points[i],radius,color,8);
}
function tubeBox(r,x0,y0,x1,y1,z0,z1,thickness,color){
 r.box(x0,y0,z0,x1,y0+thickness,z1,color);r.box(x0,y1-thickness,z0,x1,y1,z1,color);
 r.box(x0,y0+thickness,z0,x0+thickness,y1-thickness,z1,color);r.box(x1-thickness,y0+thickness,z0,x1,y1-thickness,z1,color);
}
function curvedPlate(r,c,axis,start,end,outer,inner,angle,span,color,n=22){
 turn(r,c,axis,[[start,inner],[start,outer],[end,outer],[end,inner],[start,inner]],color,{n,start:angle,sweep:span});
}
const u=t=>(1-Math.cos(TAU*t))/2;
function makeView(id,name,description,source,parts,motion='',viewAngle=[-.72,.49]){
 const model=study('g500-'+id,name,description,source,parts,motion);model.viewAngle=viewAngle;return model;
}
function guideBlock(r,station,side,z0=.17){
 r.box(station-.06,side*.57-.036,z0,station+.06,side*.57+.036,z0+.055,ivory);
}
const clamp01=t=>Math.max(0,Math.min(1,t));
const smooth=t=>t*t*(3-2*t);
// Travel and lift angles explain the operating sequence; they are not factory adjustment values.
export function g500RoofPose(t,mode='slide'){
 const opening=u(t);
 return mode==='tilt'?{slide:0,drop:0,angle:.085*opening}:
  {slide:.78*smooth(clamp01((opening-.12)/.88)),drop:-.038*smooth(clamp01(opening/.12)),angle:0};
}
function panelPoint(p,pose){
 const [xx,yy,zz]=p,dx=xx+.574,dz=zz-.259,c=Math.cos(pose.angle),s=Math.sin(pose.angle);
 return [-.574+dx*c-dz*s+pose.slide,yy,.259+dx*s+dz*c+pose.drop];
}
function moved(r,transform,draw){
 const local=Object.create(r);local.polygon=(points,...args)=>r.polygon(points.map(transform),...args);draw(local);
}
function roofPanel(r,pose,seal=false){
 moved(r,p=>panelPoint(p,pose),q=>{
  if(seal)tubeBox(q,-.574,-.54,.347,.54,.259,.279,.028,rubber);
  else {q.box(-.546,.05,.261,.319,.511,.284,blue);for(const s of [-1,1])q.box(-.542,s*.508-.012,.248,.315,s*.508+.012,.261,steel);}
 });
}
function dripRail(r,station,z0=.194){
 r.box(station-.037,-.535,z0,station+.037,.535,z0+.012,steel);
 for(const a of [-1,1])r.box(station+a*.032-.005,-.535,z0+.012,station+a*.032+.005,.535,z0+.037,rubber);
}
function roofGuides(r,slide=0){
 for(const side of [-1,1]){
  guideBlock(r,-.47+slide,side);guideBlock(r,.22+slide,side);
  // The support at callout 12 wraps around its rail instead of filling the track.
  const yy=side*.57,xx=.18+slide;
  r.profile([[xx-.093,.164],[xx+.091,.164],[xx+.091,.211],[xx+.057,.211],[xx+.057,.190],[xx-.055,.190],[xx-.055,.211],[xx-.093,.211]],yy-.033,yy+.033,steel);
 }
}
function supportBrackets(r,pose){
 for(const side of [-1,1]){
  const yy=side*.511,p=panelPoint([.22,yy,.248],pose),q=[.15+pose.slide,yy,.215];
  r.rod(q,p,.012,steel,8);cyl(r,p,y,-.026,.026,.019,metal,12);
 }
}
function deflectorPose(t){
 const angle=Math.atan2(.038,.172)+.55*smooth(clamp01(g500RoofPose(t).slide/.18));
 return {angle,tip:[-.46-Math.hypot(.172,.038)*Math.cos(angle),0,.181+Math.hypot(.172,.038)*Math.sin(angle)]};
}
const cassette=makeView('roof-cassette','Sliding roof · guides and drainage','The panel first lowers from its seal, then retracts into the cassette. The cutaway separates the guide shoes, support brackets, drip rail and inner sunshade. Open the rear-lift supports to inspect the other operating mode.',src.roof,[
 cPart('frame','Roof cassette frame','The frame carries both rails beneath the roof opening. Its rear section receives the open panel.',down,r=>tubeBox(r,-.70,-.64,1.19,.64,.08,.15,.047,steel)),
 ...[-1,1].map(s=>cPart(s<0?'rail-left':'rail-right',(s<0?'Left':'Right')+' guide rail','An upright channel guides the moving shoes. The catalog lists handed rails at callout 25.',[0,s*.62,.04],r=>{
  const y0=s*.57;r.box(-.62,y0-.046,.142,1.12,y0+.046,.163,metal);for(const edge of [-1,1])r.box(-.62,y0+edge*.042-.005,.163,1.12,y0+edge*.042+.005,.213,steel);
 })),
 cPart('sliders','Guide shoes and jaws','The polymer shoes run inside the handed rails. Separate support jaws wrap the channel; the catalog identifies them at callout 12.',[.12,0,.55],(r,t)=>roofGuides(r,g500RoofPose(t).slide)),
 cPart('bridge','Panel support bridge','The carrier joins the two sides beneath the panel. It lowers before travelling into the rear of the cassette.',aft,(r,t)=>{const p=g500RoofPose(t),xx=.20+p.slide;r.box(xx-.035,-.526,.222+p.drop,xx+.035,.526,.247+p.drop,steel);}),
 cPart('lifters','Rear-lift supports · open tilt view','The side brackets support the panel above its guide jaws. Open this part to see the separate rear-lift motion. Their exact cam slots are not reconstructed.',[.16,-.40,.49],(r,t)=>supportBrackets(r,g500RoofPose(t))),
 cPart('panel','Sliding roof panel · section','Half of the panel skin is removed so the support rails stay visible. The perimeter moves as a rigid panel while clearing the roof seal.',up,(r,t)=>roofPanel(r,g500RoofPose(t))),
 cPart('seal','Panel perimeter seal','The continuous seal surrounds the panel. Lowering the panel releases it before the rearward movement.',[0,.34,.67],(r,t)=>roofPanel(r,g500RoofPose(t),true)),
 cPart('drip-rail','Rear drip rail and edge seals','The transverse gutter and its two lips collect water at the back of the opening. Callouts 31–33 distinguish the rail from its seals.',[.58,0,-.31],(r,t)=>dripRail(r,.388+g500RoofPose(t).slide)),
 cPart('sunshade','Inner sunshade and slide rails','The second parts drawing shows a separate interior panel and handed upper/lower slide rails. Its cutaway is parked partly aft to expose the operating parts.',[.31,0,-.62],r=>{
  tubeBox(r,-.34,-.49,.48,.49,.049,.067,.030,ivory);r.box(-.31,.06,.050,.45,.46,.064,ivory);
  for(const side of [-1,1])for(const zz of [.046,.078])r.box(-.61,side*.50-.009,zz,1.12,side*.50+.009,zz+.011,steel);
 }),
 cPart('drains','Cassette drain tails','The second drawing shows front and rear drain hoses with separate clips. Only their connections and short tails are shown; the full routes through the body are omitted.',down,r=>{
  for(const xx of [-.65,1.14])for(const side of [-1,1]){
   line(r,[[xx,side*.615,.10],[xx,side*.666,.061],[xx+.025,side*.685,-.112]],.021,rubber);
   sleeve(r,[xx+.023,side*.684,-.097],z,-.009,.008,.028,.021,steel,12);
  }
 }),
 cPart('deflector','Front wind deflector','The cross-car blade rises at the front of the opening as the panel retracts.',fore,(r,t)=>{
  const p=deflectorPose(t).tip;r.box(p[0]-.026,-.50,p[2]-.012,p[0]+.026,.50,p[2]+.021,steel);
 }),
 cPart('deflector-levers','Wind-deflector levers','The handed levers at callout 5 pivot at fixed cassette mounts. Both arms retain their length while lifting the blade.',[-.61,-.60,.23],(r,t)=>{
  const p=deflectorPose(t).tip;
  for(const s of [-1,1]){r.rod([-.46,s*.48,.181],[p[0],s*.48,p[2]],.013,steel,8);cyl(r,[-.46,s*.48,.181],y,-.025,.025,.024,metal,12);}
 }),
 cPart('deflector-springs','Wind-deflector return springs','Callout 6 identifies separate springs beside the deflector levers. The windings here show their position without specifying the factory wire or preload.',[-.60,.56,-.13],r=>{
  for(const s of [-1,1]){
   const points=[];for(let i=0;i<=48;i++){const a=i*TAU/12;points.push([-.46+.025*Math.cos(a),s*.48-.020+i*.00085,.181+.025*Math.sin(a)]);}line(r,points,.004,gold);
   r.rod([-.46,s*.48-.020,.206],[-.41,s*.48-.020,.206],.004,gold,6);
  }
 })
],'The panel lowers from its seal before sliding aft. The wind deflector rises after the leading edge clears it. The return stroke reverses this sequence.',[-.80,.74]);
const roofTilt=makeView('roof-tilt','Sunroof · rear-lift position','The operator’s manual gives rear raising and lowering their own switch directions. In this view the front edge stays at the opening while the rear rises. Bracket motion is an illustration, not a reproduction of the factory cam slots.',src.roofOperation,[
 cPart('rails','Fixed guide rails','The side channels remain fixed to the cassette while the rear of the panel lifts.',down,r=>{for(const s of [-1,1]){r.box(-.62,s*.57-.045,.142,.48,s*.57+.045,.163,metal);r.box(-.62,s*.57-.008,.163,.48,s*.57+.008,.196,steel);}}),
 cPart('jaws','Front and rear guide shoes','The front guide locates the panel. The rear supports lift it above the sealing plane without sliding it into the storage pocket.',left,r=>roofGuides(r)),
 cPart('supports','Rear support brackets','Both sides raise together. The endpoint follows the rigid panel; the depicted link omits the unverified guide-slot profile.',right,(r,t)=>supportBrackets(r,g500RoofPose(t,'tilt'))),
 cPart('panel','Panel section','The panel rotates about its front edge. Its dimensions remain fixed throughout the movement.',up,(r,t)=>roofPanel(r,g500RoofPose(t,'tilt'))),
 cPart('seal','Panel seal','The perimeter rises with the panel and exposes the gutter below its rear edge.',[0,.43,.46],(r,t)=>roofPanel(r,g500RoofPose(t,'tilt'),true)),
 cPart('drip-rail','Rear drip rail','The cross-car gutter lies under the opening’s rear edge in the raised position.',aft,r=>dripRail(r,.388))
],'The rear edge rises and lowers while the front edge stays in place. Sliding and tilt are shown as separate operations.',[-.91,.60]);
const roofDrive=makeView('roof-drive','Cargo-area sunroof drive','An electric motor behind the cargo trim drives a flexible cable to the roof. The hex drive in the operator’s manual shares the gearbox. The internals of the sealed motor are omitted.',src.motor,[
 cPart('motor','Electric drive motor','The cylindrical motor turns the adjacent gearbox.',fore,r=>{turn(r,O,x,[[-.68,0],[-.68,.12],[-.62,.176],[-.11,.176],[-.075,.125],[-.075,0]],steel);r.box(-.52,-.16,.05,-.38,-.115,.165,rubber);}),
 cPart('gearbox','Reduction gearbox','The gearbox joins the motor to the cable drive and manual hex.',aft,r=>{cyl(r,[.08,0,.02],y,-.117,.117,.262,dark,28);r.box(-.15,-.121,-.08,.05,.121,.115,dark);}),
 cPart('hex','Manual drive hex','The hex at the access side turns the same drive when the roof is operated manually.',right,r=>{cyl(r,[.08,0,.02],y,.123,.147,.079,steel);cyl(r,[.08,0,.02],y,.147,.202,.062,gold,6);}),
 cPart('tube','Cable guide tube','The sheath holds the flexible cable as it enters the gearbox.',up,r=>{line(r,[[.11,0,.245],[.205,0,.294],[.59,0,.294]],.053,steel);}),
 cPart('cable','Flexible drive cable','The helical wire around the cable core provides the drive surface. Its routing is shortened in this detail.',[.73,-.24,.20],r=>{cyl(r,[0,0,.294],x,.485,.93,.024,dark,10);const pts=[];for(let i=0;i<=84;i++)pts.push([.58+i*.004,Math.cos(i*TAU/7)*.03,.294+Math.sin(i*TAU/7)*.03]);line(r,pts,.0065,metal);}),
 cPart('bracket','Mounting bracket','The bracket secures the drive behind the cargo-area trim.',down,r=>{r.box(-.46,-.17,-.207,.3,.13,-.174,steel);for(const xx of [-.37,.19])cyl(r,[xx,-.12,-.17],z,-.035,.015,.042,metal,6);})
]);
const frontScale=.57/.1575,rearScale=.60/.136;
const frontBrake=makeView('front-brake','Front service brake','Brembo specifies a 315 × 30 mm ventilated front disc, 83 mm high. The wheel locates on an 85 mm pilot and the five wheel bolts pass through its hat. Vane spacing and the caliper casting are approximate.',brakeRefs.front,[
 cPart('rotor','Brake disc and mounting hat','The friction faces and perforated mounting hat share the same section as the disc on the vehicle.',left,r=>drawG500Disc(r,O,false,1,frontScale)),
 cPart('caliper','Caliper bridge','The cheeks carry a pad on each side. Bridge sections cross above the outer rim of the disc.',up,r=>drawG500Caliper(r,O,false,1,frontScale)),
 ...[-1,1].map(s=>cPart(s<0?'inner-pad':'outer-pad',(s<0?'Inboard':'Outboard')+' brake pad','A steel backing plate carries the friction lining. The pad moves toward the swept ring of the disc.',[.22,s*.75,.12],(r,t)=>drawG500BrakePad(r,O,false,1,s,frontScale,1-u(t)))),
 cPart('shield','Brake dust shield','The formed shield sits inboard of the rotor, with an opening at the caliper.',[0,-.85,-.2],r=>curvedPlate(r,O,y,-.25,-.235,.594,.155,1.6,4.79,dark,32)),
 cPart('hose','Flexible brake hose','The hose connects the moving wheel end to the hydraulic circuit.',[.65,0,.24],r=>line(r,[[.23,-.161,.46],[.25,-.23,.53],[.40,-.29,.48],[.49,-.35,.37]],.022,rubber))
],'The pads approach both sides of the rotor. Travel is exaggerated to show the running clearance.');
const rearBrake=makeView('rear-brake','Rear brake · parking shoes','The 272 × 16 mm service disc and the parking-brake drum share one casting. Expand the assembly to lift the hat off the shoes. The brake cable operates the shoes independently of the service caliper.',brakeRefs.rear,[
 cPart('rotor','Rear disc and drum hat','Brembo gives the disc a height of 97 mm and an 85 mm pilot. Five holes in the mounting face line up with the wheel bolts.',right,r=>drawG500Disc(r,O,true,1,rearScale)),
 cPart('backplate','Parking-brake backing plate','The fixed plate supports the shoes and their anchors.',left,r=>sleeve(r,O,y,-.053,-.041,.39,.19,dark,32)),
 ...[-1,1].map(s=>cPart(s<0?'shoe-a':'shoe-b',(s<0?'First':'Second')+' parking-brake shoe','Brembo lists 40 mm wide shoes for a 160 mm drum. The outer friction lining lies over the narrower steel web.',[s*.6,-.12,.24],(r,t)=>drawG500ParkingShoe(r,O,1,s,rearScale,u(t)))),
 cPart('adjuster','Shoe adjuster','The crosspiece sets the resting spacing of the shoes at one end.',up,r=>{cyl(r,[0,.167,.304],x,-.082,.082,.022,metal,12);gear(r,[0,.167,.304],x,-.025,.024,.049,.049,12,gold);}),
 cPart('cable','Parking-brake cable input','Pull on the mechanical linkage spreads the shoes independently of hydraulic braking.',down,r=>line(r,[[-.092,.168,-.299],[.079,.155,-.306],[.24,.003,-.276],[.46,-.145,-.30]],.018,steel)),
 cPart('caliper','Rear service caliper','The caliper straddles the service disc. Its pads act on the outer annulus, separate from the parking shoes inside the hat.',[.4,.28,.45],r=>drawG500Caliper(r,O,true,1,rearScale)),
 ...[-1,1].map(s=>cPart(s<0?'inner-pad':'outer-pad',(s<0?'Inboard':'Outboard')+' service pad','A friction lining on a steel backing plate works against one face of the rear disc.',[.19,s*.42,.13],r=>drawG500BrakePad(r,O,true,1,s,rearScale)))
],'The parking shoes move apart inside the rotor hat. The outer service brake remains stationary.');
rearBrake.sources=[brakeRefs.rear,brakeRefs.shoes,brakeRefs.rearBores];
frontBrake.sources=[brakeRefs.front,brakeRefs.frontBores];
const master=makeView('brake-hydraulics','Brake booster and master cylinder','The booster assists pedal force at the bulkhead. The master cylinder converts that force to hydraulic pressure. Its reservoir supplies the working fluid.',src.hydraulic,[
 cPart('booster','Vacuum brake booster','The large circular shell sits between the pedal linkage and master cylinder.',aft,r=>turn(r,O,x,[[.15,.08],[.18,.34],[.22,.45],[.36,.46],[.44,.4],[.47,.12],[.47,.05]],dark)),
 cPart('rod','Pushrod','The linkage carries pedal force through the booster toward the master cylinder.',[.73,0,.15],r=>{cyl(r,O,x,.414,.75,.045,steel,14);r.box(.72,-.055,-.047,.81,.055,.047,steel);}),
 cPart('cylinder','Master cylinder and outlets','The cast body contains the hydraulic pressure chambers. Its outlet ports feed the brake circuit.',fore,r=>{turn(r,O,x,[[-.55,0],[-.55,.064],[-.45,.093],[.06,.096],[.1,.155],[.152,.154],[.152,0]],steel);for(const xx of [-.38,-.19])cyl(r,[xx,-.03,.02],y,-.116,0,.039,gold,6);}),
 cPart('reservoir','Brake-fluid reservoir','Two feed connections sit beneath the reservoir. The cap closes its filling neck.',up,r=>{r.profile([[-.47,.16],[-.48,.27],[-.40,.32],[-.035,.30],[.005,.24],[-.045,.15]],-.085,.085,ivory);cyl(r,[-.35,0,.31],z,-.01,.032,.061,rubber,16);}),
 cPart('grommets','Reservoir sealing grommets','The seals sit where the reservoir outlets enter the top of the master cylinder.',[0,.48,.25],r=>{for(const xx of [-.36,-.11])sleeve(r,[xx,0,.11],z,-.043,.045,.041,.025,rubber,16);})
]);
const tank=makeView('fuel-tank','Tank, sender and underbody shield','The tank sits behind the rear axle. Its level sender enters from above. A pair of padded straps supports the tank and a separate shield covers the underside.',src.fuel,[
 cPart('vessel','Molded fuel tank','The 2002 parts plate lists tank 463-470-08-01 at callout 1. The section exposes the sender opening above the floor of the tank.',aft,r=>{r.profile([[-.52,-.17],[-.41,-.25],[.42,-.25],[.60,-.12],[.58,.175],[.40,.21],[-.43,.18]],.03,.58,rubber);r.box(-.46,-.54,-.23,.47,.03,-.20,dark);}),
 cPart('sender','Fuel-level sender','Callout 13 is the tank sender. Its vertical body projects into the tank from the upper mounting flange.',up,r=>{cyl(r,[-.12,-.19,.1],z,-.28,.084,.068,steel,16);cyl(r,[-.12,-.19,.10],z,.084,.111,.102,ivory,18);r.box(-.165,-.213,.209,-.087,-.169,.247,rubber);}),
 cPart('sender-seal','Sender sealing ring','This ring sits between the sender flange and tank opening. The catalog lists it separately at callout 14.',[0,-.48,.38],r=>sleeve(r,[-.12,-.19,.185],z,-.016,-.004,.094,.073,rubber,20)),
 cPart('straps','Left and right tank straps','The paired longitudinal bands run under the tank, one on each side. Their ends turn up to the attachment points.',left,r=>{for(const yy of [-.34,.34]){r.box(-.45,yy-.026,-.28,.51,yy+.026,-.252,steel);for(const xx of [-.45,.49])r.box(xx,yy-.026,-.262,xx+.02,yy+.026,.141,steel);}}),
 cPart('sleeves','Left and right strap insulators','The catalog distinguishes handed strap sleeves. Each liner cushions the tank along one supporting band.',right,r=>{for(const yy of [-.34,.34])r.box(-.43,yy-.036,-.254,.49,yy+.036,-.238,ivory);}),
 cPart('shield','Lower tank shield','The formed shield sits below the tank and pump. Its brackets attach separately.',down,r=>{r.profile([[-.58,-.235],[-.47,-.337],[.49,-.337],[.61,-.232],[.598,-.222],[.481,-.315],[-.46,-.315],[-.568,-.222]],-.605,.605,steel);for(const s of [-1,1])r.box(.38,s*.55-.025,-.32,.51,s*.55+.025,-.205,dark);})
], '',[-2.31,.51]);
// Relative to the fuel-filter axis. Both scales of inspection use the same parts.
const deliveryParts=[
 cPart('pump','Electric fuel pump','The inlet and pressure outlet sit at opposite ends of the pump. Its installed outline follows the parts plate.',[-.050,0,.025],r=>{
  const c=[0,-.098,0];cyl(r,c,x,-.092,.043,.029,steel,16);
  cyl(r,c,x,-.105,-.091,.012,gold,12);cyl(r,c,x,.042,.057,.010,gold,12);
  for(const side of [-1,1])cyl(r,[0,-.098+side*.015,.009],x,.042,.051,.0036,side<0?rubber:copper,8);
 }),
 cPart('cushion','Pump insulator','The rubber sleeve cushions the pump inside the mounting clamp.',[0,.045,.025],r=>curvedPlate(r,[0,-.098,0],x,-.049,-.009,.037,.029,1.0,4.75,rubber)),
 cPart('clamp','Pump retaining clamp','The metal band wraps around the insulating sleeve.',[0,-.048,0],r=>curvedPlate(r,[0,-.098,0],x,-.035,-.018,.040,.037,1.05,4.6,steel)),
 cPart('filter','Filter and pressure regulator','MANN WK 720 replaces A 002 477 30 01. The 75 mm canister spans 160 mm over its fittings. The pump inlet and engine outlet are 8 mm across, and the tank return is 10 mm.',[0,.056,.020],r=>drawG500FuelFilter(engineShapes(r),O)),
 cPart('filter-clamp','Filter clamp and retainer','The filter clamp fits around the canister. The supporting plate sits below the pump and filter.',[0,0,-.057],r=>{
  curvedPlate(r,O,x,-.014,.014,.0395,.0365,1.05,4.6,steel);
  r.box(-.112,-.153,-.052,.124,.060,-.041,steel);
  for(const yy of [-.145,.053])r.box(-.061,yy-.006,-.045,-.021,yy+.006,.035,dark);
 })
];
const delivery=makeView('fuel-delivery','External fuel pump and filter','The external pump feeds a filter with a built-in regulator. The supplier drawing specifies the canister envelope and three fuel connections. The spare fitting on the regulator is its vent. The pump, clamp and bracket dimensions are estimates.',g500FilterSources.fuel,deliveryParts);
const filler=makeView('filler-neck','Filler neck, cap and seal','The fuel-system plate separates the cap, neck, body seal and support. The curved pipe leads from the right rear body opening down to the tank.',src.fuel,[
 cPart('neck','Filler pipe','The formed tube drops from the body opening toward the tank.',aft,r=>{line(r,[[.30,-.29,-.34],[.20,-.19,-.23],[.02,-.08,-.08],[-.12,.02,.22],[-.13,.09,.33]],.07,steel);sleeve(r,[-.13,.09,.33],z,-.015,.056,.084,.062,metal,18);}),
 cPart('cap','Filler cap and tether','The molded cap seals the top of the neck. The tether keeps the cap with the vehicle.',up,r=>{cyl(r,[-.13,.09,.386],z,0,.043,.102,rubber,20);r.box(-.185,.074,.429,-.075,.106,.455,rubber);line(r,[[-.057,.13,.405],[.075,.17,.321],[.084,.18,.202]],.007,rubber);}),
 cPart('seal','Body-opening seal','An elastomer ring fits around the neck where it passes through the body.',left,r=>sleeve(r,[-.13,.09,.31],z,-.014,.01,.111,.07,rubber,20)),
 cPart('support','Pipe support','The support steadies the pipe along its route. The parts plate lists it separately at item 9.',down,r=>{curvedPlate(r,[.004,-.08,-.069],z,-.024,.038,.094,.073,.7,4.6,dark,16);r.box(-.023,-.205,-.10,.031,-.14,-.062,steel);})
]);
function fuseBody(r,px,py,z0,color,scale=.004){
 const map=(u,v,h)=>[px+u*scale,py+v*scale,z0+(h-8.5)*scale];
 for(const key of fuseSections)if(key!=='link')drawBladeFuse(r,map,key,color);
}
const panel=makeView('fuse-panel','Fuse carrier and plug-in components','The 2002 parts plate separates the carrier, fuses, relays and puller. This cutaway shows how they fit. Fuse quantities, positions and colors are illustrative. The installed cover chart identifies individual circuits.',src.electrics,[
 cPart('tray','Fuse-panel tray','The insulating tray locates the components and keeps adjacent electrical terminals apart.',down,r=>{r.box(-.52,-.34,-.11,.52,.34,-.083,dark);tubeBox(r,-.52,-.34,.52,.34,-.083,.045,.026,dark);}),
 cPart('sockets','Fuse and relay sockets','Separate receptacles hold the plug-in components. Each blade enters its own terminal.',aft,r=>{for(let n=0;n<5;n++)for(const yy of [-.198,-.096]){const xx=-.36+n*.112;r.box(xx-.044,yy-.032,-.08,xx+.044,yy+.032,-.035,rubber);}for(const xx of [-.27,-.035])tubeBox(r,xx-.078,.045,xx+.078,.202,-.083,-.006,.012,ivory);}),
 cPart('fuses','Blade fuses','Each fuse contains a link between two blades. Open a single fuse to inspect the link.',fore,r=>{for(let i=0;i<5;i++)for(const [j,yy] of [-.198,-.096].entries())fuseBody(r,-.36+i*.112,yy,.017,[red,gold,blue,ivory][(i+j)%4]);}),
 cPart('relays','Plug-in relays','The larger plug-in modules are relays. Open one to see the coil, armature and switching contacts.',up,r=>{for(const xx of [-.27,-.035]){r.box(xx-.07,.056,.002,xx+.07,.191,.148,dark);for(const s of [-1,1])r.box(xx+s*.046-.008,.10,-.038,xx+s*.046+.008,.12,.002,gold);}}),
 cPart('puller','Fuse puller','The vehicle carries an insulated puller for gripping a fuse body.',right,r=>{for(const s of [-1,1])line(r,[[.28,s*.018,.013],[.31,s*.046,.032],[.40,s*.035,.068]],.009,ivory);r.rod([.28,-.018,.013],[.28,.018,.013],.011,ivory,8);})
],'',[-.72,.86]);
const fuseView=(u,v,h)=>[u*.037,v*.037,(h-8.5)*.037];
const fuse=makeView('blade-fuse','20 A standard blade fuse','Callout 7 in the 2002 Mercedes fuse plate lists the 20 A fuse. Restagraf cross-references its yellow 6875 replacement to N000000004206. The cutaway shows the 19.1 mm body width and two 0.64 mm zinc blades.',fuseSupplier,[
 cPart('shell','Yellow insulating shell','The head is 5.2 mm thick. The shell is cut open on one side to expose the link and the stamping.',up,r=>drawBladeFuse(r,fuseView,'shell',undefined,true)),
 ...[-1,1].map(s=>{const key=s<0?'blade-a':'blade-b';return cPart(key,(s<0?'Left':'Right')+' blade','The blade is 5.2 mm wide. The outside span of the two terminals is 14.2 mm.',[s*.52,0,-.32],r=>drawBladeFuse(r,fuseView,key));}),
 cPart('link','Fusible element','The bent link joins the two terminal stampings. The bend follows the replacement photograph. Its cross-section is approximate.',[0,-.58,.15],r=>drawBladeFuse(r,fuseView,'link'))
]);
const relay=makeView('switch-relay','Electromagnetic relay','A small current in the winding attracts the armature. The moving contact then meets the stationary contact. This representative cutaway explains the switching action, without assigning terminals to a G500 circuit.',src.electrics,[
 cPart('base','Insulating base and terminals','The base holds the conductors apart and locates the plug-in pins.',down,r=>{r.box(-.40,-.23,-.18,.40,.23,-.12,dark);for(const xx of [-.25,.16])for(const yy of [-.13,.13])r.box(xx-.012,yy-.033,-.34,xx+.012,yy+.033,-.18,metal);}),
 cPart('coil','Electromagnetic coil','A winding around the iron core produces a magnetic field when energized.',fore,r=>{cyl(r,[-.16,0,-.102],z,0,.30,.132,copper,22);for(let i=0;i<14;i++)sleeve(r,[-.16,0,-.102],z,i*.021,i*.021+.009,.136,.13,gold,18);}),
 cPart('core','Iron core','The core guides the field toward the armature.',left,r=>cyl(r,[-.16,0,-.102],z,0,.307,.059,steel,18)),
 cPart('armature','Pivoted armature and moving contact','As the coil draws the armature down, the moving contact closes against its mate.',up,(r,t)=>{const h=.28-.065*u(t);line(r,[[-.29,0,.219],[-.15,0,h],[.248,0,h+.005]],.026,steel);cyl(r,[.247,0,h],z,-.038,-.002,.038,metal,12);}),
 cPart('contact','Stationary contact','The contact post is anchored in the base.',aft,r=>{cyl(r,[.247,0,0],z,-.12,.156,.03,copper,12);cyl(r,[.247,0,0],z,.156,.177,.04,metal,14);}),
 cPart('case','Relay shell','The shell protects the winding and switching mechanism. A window is cut into this view.',right,r=>{r.box(-.405,-.229,-.121,.404,-.197,.342,dark);r.box(.382,-.197,-.121,.405,.197,.34,dark);})
],'The armature tips toward the energized coil and closes the two contacts. It returns when the coil releases.');
function installedDisc(r,rear){
 for(const s of [-1,1]){
  const pos=g500RotorCenter(rear,s);
  drawG500InstalledRotor(r,rear,s);
  drawG500InstalledCaliper(r,pos,rear,s);
 }
}
function fuseSite(r,c,orientation=0){
 const [xx,yy,zz]=c,dx=orientation?.14:.155,dy=orientation?.075:.09;
 r.box(xx-dx,yy-dy,zz-.042,xx+dx,yy+dy,zz-.005,dark);
 for(let i=0;i<5;i++)for(let j=0;j<2;j++) {
  const a=(i-2)*dx*.29,b=(j-.5)*dy*.74;
  fuseBody(r,xx+a,yy+b,zz-.006,[blue,red,'#be9f31',ivory][(i+j)%4],.001);
 }
}
function cabinBattery(r){
 // Below the rear cup holder, in front of the rear bench: not in the engine bay.
 // The well's floor sits 50 mm above the rear propeller shaft.
 const h=.050;
 r.box(.537,-.175,.487+h,.917,.175,.507+h,steel);
 for(const s of [-1,1])r.box(.537,s*.170-.008,.507+h,.917,s*.170+.008,.563+h,steel);
 r.box(.555,-.151,.508+h,.897,.151,.716+h,rubber);r.box(.548,-.157,.716+h,.904,.157,.737+h,dark);
 for(let i=0;i<6;i++)r.box(.579+i*.052,-.112,.737+h,.611+i*.052,.112,.744+h,rubber);
 for(const [xx,yy,color] of [[.603,-.106,red],[.849,.106,metal]]){
  cyl(r,[xx,yy,.744+h],z,0,.022,.017,metal,12);sleeve(r,[xx,yy,.755+h],z,-.001,.010,.024,.016,color,12);
 }
 // A short positive connection reaches the nearby fuse block; negative bonds to the body.
 line(r,[[.603,-.106,.760+h],[.553,-.106,.790],[.482,-.074,.754]],.011,red);
 line(r,[[.849,.106,.760+h],[.906,.122,.770],[.929,.221,.688]],.011,rubber);
 cyl(r,[.929,.221,.688],z,-.010,.005,.021,metal,10);
}
// Factory height is measured from the tire contact plane, z=.040 in this model.
export const g500InstalledRoofTop=2.017;
const roofRaise=.049;
function installedRoof(r,draw){moved(r,p=>[p[0]+cassetteSetback,p[1],p[2]+roofRaise],draw);}
function wireTray(r){installedRoof(r,q=>{
 tubeBox(q,-.544,-.54,1.29,.54,1.887,1.915,.025,steel);
 for(const s of [-1,1]){
  q.box(-.496,s*.51-.020,1.914,1.25,s*.51+.020,1.926,metal);
  for(const edge of [-1,1])q.box(-.496,s*.51+edge*.018-.003,1.926,1.25,s*.51+edge*.018+.003,1.938,steel);
 }
});}
const assembly=(id,name,description,source,rows,viewAngle)=>({id,name,description,source,internal:true,view:'hero',viewAngle,category:'service',parts:rows.map(([key,name,description,offset,source,draw,metadata={}])=>({id:id+'.'+key,name,description,offset,source,draw,category:'service',...metadata}))});
const groups=[
 assembly('roof','Sliding and lifting sunroof','The optional roof lowers and slides into its cassette, or raises at the rear. The motor sits behind the left cargo trim. The parts drawings distinguish the rails, guide jaws, seals, sunshade and drains. Travel and body routes are schematic.',src.roof,[
  ['panel','Sunroof panel','Open the sliding cutaway to see how the panel clears its seal and enters the rear cassette.',up,src.roof,(r,paint)=>installedRoof(r,q=>{tubeBox(q,-.485,-.493,.385,.493,1.947,1.965,.010,rubber);q.box(-.475,-.483,1.954,.375,.483,1.968,paint||blue);})],
  ['cassette','Cassette, tracks and guides','The cassette continues aft of the opening to receive the panel. Open the sliding demonstration.',down,src.roof,wireTray],
  ['lift','Rear-lift supports','Open the separate rear-lift action. Side brackets support the moving panel above its guide shoes.',[.12,-.40,.42],src.roofOperation,r=>installedRoof(r,q=>{
   for(const s of [-1,1]){
    for(const xx of [-.38,.24])q.box(xx-.030,s*.51-.021,1.925,xx+.030,s*.51+.021,1.948,ivory);
    q.rod([.19,s*.464,1.940],[.28,s*.464,1.954],.009,steel,7);cyl(q,[.28,s*.464,1.954],y,-.013,.013,.013,metal,10);
   }
  })],
  ['drainage','Drip rail and drain connections','A rear cross-car gutter catches water below the opening. Four short drain tails mark the cassette connections; body routes are not drawn.',[.36,.40,-.16],src.roofLayout,r=>installedRoof(r,q=>{
   q.box(.388,-.474,1.924,.428,.474,1.933,steel);
   for(const xx of [.388,.420])q.box(xx,-.474,1.933,xx+.008,.474,1.946,rubber);
   for(const xx of [-.518,1.252])for(const s of [-1,1])line(q,[[xx,s*.528,1.907],[xx,s*.570,1.881],[xx+.018,s*.581,1.812]],.010,rubber);
  })],
  ['sunshade','Inner sunshade and rails','The interior shade has its own upper and lower rails beneath the roof panel. Open the cassette cutaway to separate them.',[.22,0,-.53],src.roofLayout,r=>installedRoof(r,q=>{
   q.box(-.456,-.452,1.877,.354,.452,1.889,ivory);
   for(const s of [-1,1])for(const zz of [1.875,1.895])q.box(-.48,s*.469-.008,zz,1.24,s*.469+.008,zz+.007,steel);
  })],
  ['drive','Cargo-area sunroof motor','The remote motor and gearbox sit behind the cargo trim. The motor is separate from the panel guide rails.',[-.10,-.60,.02],src.motor,r=>{cyl(r,[1.77,-.789,1.114],z,-.108,.016,.053,steel,14);cyl(r,[1.77,-.789,1.167],y,-.03,.036,.075,dark,16);cyl(r,[1.77,-.789,1.167],y,.036,.048,.025,gold,6);}],
  ['cable','Roof drive cable and guide','A flexible cable transmits motion from the cargo area to the mechanism above the headliner. The route here is approximate.',[.38,.33,.17],src.motor,r=>line(r,[[1.77,-.782,1.195],[1.81,-.786,1.52],[1.77,-.77,1.841+roofRaise],[1.55,-.636,1.90+roofRaise],[1.12+cassetteSetback,-.51,1.908+roofRaise]],.014,steel)]
 ],[-.84,.64]),
 assembly('brakes','Service and parking brakes','Open a front disc assembly, the rear drum-in-hat parking brake, or the pedal-side hydraulic unit. Front and rear axle references identify different hardware.',src.brake,[
  ['front','Front disc brakes','The 315 × 30 mm front discs have a ventilation gap between the friction faces. Open a wheel end to inspect the pads.',fore,brakeRefs.front,r=>installedDisc(r,false)],
  ['rear','Rear disc and parking-brake shoes','The selected rear disc is 272 × 16 mm and solid. Parking shoes expand inside its hat. Rotor applications vary by stamped axle number.',aft,brakeRefs.rear,r=>installedDisc(r,true)],
  ['hydraulics','Booster, reservoir and master cylinder','The assisted master cylinder sits forward of the driver’s footwell.',up,src.hydraulic,drawG500BrakeHydraulics]
 ],[-1.04,.59]),
 assembly('fuel','Fuel tank and delivery','Follow fuel from the filler neck to the rear tank, external pump and replaceable filter. The underbody shield and tank straps separate in the tank view.',src.fuel,[
  ['tank','Rear fuel tank and sender','The tank lies behind the rear axle. Left and right longitudinal straps support its underside; the sender enters from above.',up,src.fuel,r=>{
   // The tank fills the space between the frame rails, behind the rear
   // differential and the track bar, under the cargo floor and ahead of the
   // last crossmember.
   r.profile([[1.61,.48],[1.655,.42],[1.915,.42],[1.945,.46],[1.945,.695],[1.61,.695]],-.445,.445,rubber);
   for(const yy of [-.36,.36]){r.box(1.635,yy-.018,.406,1.925,yy+.018,.419,steel);for(const xx of [1.623,1.913])r.box(xx,yy-.018,.414,xx+.012,yy+.018,.481,steel);}
   cyl(r,[1.80,.00,.695],z,0,.006,.055,ivory,14);
  }],
  ['shield','Fuel tank skid plate','A formed guard protects the tank and external delivery hardware from below.',[0,-.23,-.50],src.fuel,r=>{r.profile([[1.60,.40],[1.66,.303],[1.95,.303],[2.00,.40],[1.988,.41],[1.94,.319],[1.672,.319],[1.612,.41]],-.445,.445,steel);}],
  ['delivery','External fuel pump and filter','The external pump and filter sit below the tank and above its shield. Each has a separate clamp on the supporting plate.',down,src.fuel,r=>{
   moved(r,p=>p.map((v,i)=>v+fuelFilterCenter[i]),q=>{for(const item of deliveryParts)item.draw(q);});
  }],
  ['lines','Tank, pump and filter connections','Short hoses join the tank outlet to the pump and the pump to the adjacent filter. The regulator returns excess fuel to the tank. The short engine feed and tank connections show their destinations; the full underbody line and vent route are unmeasured.',[.12,-.36,-.30],src.fuel,r=>{
   cyl(r,[1.707,-.23,.421],z,-.019,.012,.020,steel,12);
   line(r,[[1.707,-.23,.408],[1.700,-.23,.384],[1.721,-.23,.378]],.011,rubber);
   const port=id=>fuelPorts[id].map((v,i)=>v+fuelFilterCenter[i]);
   line(r,[[1.883,-.23,.378],[1.939,-.23,.378],[1.945,-.159,.378],port('inlet')],.006,rubber);
   line(r,[port('feed'),[1.692,-.132,.378],[1.670,-.18,.383]],.006,rubber);
   line(r,[port('tankReturn'),[1.928,-.110,.384],[1.934,-.113,.426]],.007,rubber);
  }],
  ['filler','Fuel filler neck and cap','The right rear filler neck joins the tank. A seal sits where the neck passes through the opening.',right,src.fuel,r=>{line(r,[[1.88,.415,.66],[1.88,.415,.80],[1.80,.70,.88],[1.72,.826,.945]],.033,dark);cyl(r,[1.72,.827,.945],y,-.014,.036,.042,rubber,12);}]
 ],[-.95,.52]),
 assembly('electrical','Electrical power, controllers and networks',g500ElectronicAssemblyText,g500ElectronicSources.model,[
  ...g500ElectronicNetworkRows,
  ...g500ComfortElectricalRows,
  ['dashboard','Driver’s instrument-panel fuse carrier','The left dashboard cover carries the fuse chart and puller. The carrier stays inside the dashboard end, clear of the outer door skin.',fore,src.fuseMap,r=>fuseSite(r,[-.601,-.746,1.136],1)],
  ['footwell','Front passenger footwell fuse box','The operator’s manual shows the footwell box behind two covers. Open its carrier to follow the fuse blades into their sockets.',right,src.fuseMap,r=>fuseSite(r,[-.568,.445,.740])],
  ['tunnel','Center-tunnel fuse box','The passenger seat and tunnel cover are adjacent to this fuse box.',left,src.fuseMap,r=>fuseSite(r,[.273,.132,.676],1)],
  ['battery','Cabin battery and terminal leads','The battery lies under the cup holder in front of the rear seat, as shown by the 2002 manual and Mercedes’ post-12/2000 rescue layout. Its positive lead reaches the adjacent fuse block; its negative lead bonds to the body.',[.20,0,-.45],src.battery,cabinBattery],
  ['battery-box','Battery-box fuse block','This separate distribution block is beside the physical battery, below the rear cup holder. The short positive lead ends at its main stud. Circuit assignments and ratings are not reconstructed.',aft,src.fuseMap,r=>{
   r.box(.412,-.125,.626,.519,.125,.733,dark);
   for(const yy of [-.074,0,.074]){r.box(.432,yy-.020,.735,.500,yy+.020,.746,copper);cyl(r,[.482,yy,.745],z,-.001,.009,.010,metal,6);}
  }]
 ],[-1.04,.59])
];
const grouped=new Map(groups.map(g=>[g.id,g]));
grouped.get('electrical').sources=g500ElectronicAssemblySources;
const details=new Map([
 ['roof.panel',cassette],['roof.cassette',cassette],['roof.sunshade',cassette],['roof.drainage',cassette],['roof.lift',roofTilt],['g500-roof-cassette.lifters',roofTilt],['roof.drive',roofDrive],['roof.cable',roofDrive],['body.roof',cassette],
 ['brakes.front',frontBrake],['brakes.rear',rearBrake],['brakes.hydraulics',master],['powertrain.brake-reservoir',master],
 ['fuel.tank',tank],['fuel.shield',tank],['fuel.delivery',delivery],['fuel.lines',delivery],['fuel.filler',filler],
 ['electrical.dashboard',panel],['electrical.footwell',panel],['electrical.tunnel',panel],
 ['g500-fuse-panel.fuses',fuse],['g500-fuse-panel.relays',relay]
]);
export function getG500ServiceAssemblies(vehicle){return vehicle==='g500'?groups:[];}
export function getG500ServiceDetail(vehicle,id){return vehicle==='g500'?(getG500NetworkDetail(vehicle,id)||details.get(id)||null):null;}
export function drawG500ServiceAssembly(r,vehicle,id,paint){
 if(vehicle!=='g500')return;
 for(const p of grouped.get(id)?.parts||[]){
  const draw=()=>r.tag(p.id,()=>p.draw(r,paint));
  if(id==='roof'&&!['roof.drive','roof.cable'].includes(p.id))r.rigid('roof',[0,0,.50],draw);
  else draw();
 }
}
