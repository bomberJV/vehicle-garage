import {transferOrigin,transferOutputX,axleInputX,drawG500AxleShaft,drawG500TransferInputFlange,shaftRefs} from './g500-propeller-shafts.js';
import {g500HalfWheelbase,g500HubZ} from './g500-underbody.js';
// Original teaching meshes. OEM exploded plates establish the stack order and actuator type.
// Colors, sectional openings and separation distances are for inspection.
import {TAU,metal,steel,dark,gold,copper,basis,point,turn,cyl,sleeve,gear,add,part,study,x,y,z} from './mechanism-shapes.js';

const catalog='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const locks='https://mbmanuals.com/pdf/mb463g500-differential-locks.pdf#page=';
const transfer='https://mbmanuals.com/pdf/mb463g500-vg150-transfer-case.pdf#page=';
const ref=(label,url)=>({label,url});
const sources={
  front:ref('Mercedes-Benz Classic USA · front axle differential plate',catalog+'front-drive-axle--differential'),
  rear:ref('Mercedes-Benz Classic USA · rear axle differential plate',catalog+'universals-and-rear-axle--differential'),
  center:ref('Mercedes-Benz · VG150E center differential, p. 16',transfer+'16'),
  transfer:ref('Mercedes-Benz · VG150E exploded view, p. 5',transfer+'5'),
  shafts:ref('Mercedes-Benz · propeller shaft layout, p. 5','https://fourbyfourclub.com/Manuals/W463249Axels.pdf#page=5'),
  hydraulic:ref('Mercedes-Benz · axle shift cylinder, pp. 16–18',locks+'16'),
  vacuum:ref('Mercedes-Benz · transfer-case lock, pp. 20–22',locks+'20'),
  sleeve:ref('Mercedes-Benz · sliding sleeve and springs, p. 22',locks+'22')
};
const withSource=(row,source)=>({...row,source});
const center=[0,0,.84];
const left=[-.9,-.25,0],right=[.9,.25,0],up=[0,.12,.95];
const colors={front:'#7eada7',rear:'#bac579',rubber:'#47494a',teeth:'#a1b0b4'};
const clamp=n=>Math.max(0,Math.min(1,n));
function smooth(n){const v=clamp(n);return v*v*(3-2*v);}
export function g500LockState(phase){
  const carrier=phase*TAU;
  const engagement=smooth((phase-.34)/.12)*(1-smooth((phase-.72)/.12));
  const active=phase<.34?phase/.34:phase>.84?(phase-.84)/.16:0;
  const difference=(phase>.84?-.19:.48)*Math.sin(Math.PI*active)**2;
  return {engagement,carrier,first:carrier-difference,second:carrier+difference,spin:difference*1.5};
}
const orientation=(angle,second=false)=>[0,Math.cos(angle+(second?Math.PI/2:0)),Math.sin(angle+(second?Math.PI/2:0))];
function endGear(r,c,axis,direction,angle,color){
  gear(r,c,axis,direction*.335,direction*.16,.303,.148,12,color,angle,.34);
  sleeve(r,c,axis,direction*.336,direction*.485,.15,.095,color,16);
}
function radialBearing(r,c,axis,start,end){
  const b=basis(axis),sign=Math.sign(end-start);
  turn(r,c,axis,[[start,.152],[start,.192],[end,.232],[end,.152],[start,.152]],steel,{n:20});
  // Keep the outer cup sectioned so the tapered rollers can be picked out.
  turn(r,c,axis,[[start,.235],[start,.265],[end,.31],[end,.279],[start,.235]],dark,{n:14,start:.65,sweep:Math.PI*1.18});
  for(let i=0;i<12;i++){
    const a=TAU*i/12,c1=point(c,b,start+.013*sign,.215,a),c2=point(c,b,end-.013*sign,.252,a);
    r.rod(c1,c2,.023,metal,7);
  }
}
function helicalRim(r,c,axis,start,end,rad,ang){
  const b=basis(axis),pitch=TAU/24;
  sleeve(r,c,axis,start,end,rad-.038,rad-.077,steel,28);
  for(let i=0;i<24;i++){
    const angle=i*pitch+ang;
    const edge=(station,shift)=>[[-.42,rad-.038],[-.20,rad],[.18,rad],[.41,rad-.038]].map(([t,rr])=>point(c,b,station,rr,angle+shift+pitch*t));
    const a=edge(start,0),e=edge(end,pitch*.62);
    for(let k=0;k<3;k++)r.polygon([a[k],a[k+1],e[k+1],e[k]],k===1?metal:steel,false);
    r.polygon(a,steel,false);r.polygon(e,steel,false);
  }
}
function bridge(r,c,axis,phase,rad,station){
  const b=basis(axis);
  for(const t of [phase,phase+Math.PI]){
    r.rod(point(c,b,-station,rad,t),point(c,b,station,rad,t),.038,steel,8);
    for(const s of [-1,1])r.rod(point(c,b,s*station,.16,t),point(c,b,s*station,rad,t),.040,steel,8);
  }
}
function splinedSleeve(r,c,axis,start,end,radius,angle=0){
  gear(r,c,axis,start,end,radius,radius,18,metal,angle,.71);
}
function outputFlange(r,c,axis,s,angle){
  const b=basis(axis);
  sleeve(r,c,axis,s*.344,s*.85,.085,.045,steel,18);
  sleeve(r,c,axis,s*.78,s*.825,.154,.08,dark,18);
  for(let i=0;i<4;i++){
    const p=point(c,b,s*.829,.118,angle+i*TAU/4);
    cyl(r,p,axis,-.006,.006,.018,metal,6);
  }
}
function axleMechanism(which){
  const front=which==='front',name=front?'Front':'Rear',inputDir=front?1:-1;
  const desc=front?'The front propeller shaft enters from behind the axle. The crown wheel drives the carrier between the steerable wheel ends.':'The rear propeller shaft approaches the axle from the front. Its pinion turns the crown wheel and carrier between the rear wheels.';
  const rows=[
    part('crown','Crown wheel', 'The pinion drives the teeth around the carrier. The 2002 US catalog lists the 4.38 '+which+' gearset as '+(front?'461-330-03-39, callout 13.':'904-350-00-39, callout 18.'),[0,-.85,.12],(r,t)=>{
      const angle=g500LockState(t).carrier;
      gear(r,center,y,-.52,-.44,.61,.57,35,metal,angle,.73);
      for(let i=0;i<6;i++)cyl(r,point(center,basis(y),-.436,.474,angle+i*TAU/6),y,-.014,.016,.026,gold,6);
    }),
    part('pinion','Drive pinion and flange','The propeller shaft bolts to the flange. The pinion teeth turn the crown wheel through a right angle.',[inputDir*.9,0,.08],(r,t)=>{
      const sign=inputDir,p=[0,-.43,center[2]-.075],angle=-sign*g500LockState(t).carrier*35/8;
      gear(r,p,x,sign*.55,sign*.43,.166,.13,8,copper,angle);
      cyl(r,p,x,sign*.55,sign*.93,.07,dark,16);sleeve(r,p,x,sign*.88,sign*.93,.15,.056,steel,18);
    }),
    part('carrier','Differential carrier','The crown wheel bolts to the carrier. The catalog shows the loaded '+which+' carrier at '+(front?'callout 7 (463-330-07-23).':'callout 11 (901-350-00-23).'),up,(r,t)=>{
      bridge(r,center,y,g500LockState(t).carrier,.385,.365);
      turn(r,center,y,[[-.451,.405],[-.451,.492],[-.433,.492],[-.387,.398],[-.387,.349],[-.451,.405]],steel,{n:28});
      for(const sign of [-1,1])sleeve(r,center,y,sign*.365,sign*.42,.404,.295,steel,24);
    }),
    part('pin','Pinion cross-shaft','The shaft passes through the differential pinions. It revolves with the carrier.',[-.5,-.1,.56],(r,t)=>{
      const a=g500LockState(t).carrier;
      cyl(r,center,[Math.cos(a),0,-Math.sin(a)],-.376,.376,.042,gold,12);
    }),
    ...[-1,1].map((s,i)=>part('spider-'+(i+1),'Differential pinion '+(i+1),'This small bevel gear turns on the cross-shaft when the two wheel speeds differ.',[s*.58,.03,s*.34],(r,t)=>{
      const a=g500LockState(t);
      gear(r,center,[Math.cos(a.carrier),0,-Math.sin(a.carrier)],s*.305,s*.156,.199,.102,8,copper,a.spin+Math.PI/8,.28);
    })),
    ...[-1,1].map((s,i)=>part(i?'right':'left',(i?'Right':'Left')+' side gear','The splined bore drives the axle shaft. The colored mark shows its rotation relative to the other side.',[0,s*.86,-.33],(r,t)=>{
      const state=g500LockState(t),angle=i?state.second:state.first,col=i?colors.front:colors.rear;
      endGear(r,center,y,s,angle,col);
      cyl(r,center,y,s*.402,s*.88,.074,col,12);
      const marker=point(center,basis(y),s*.878,.046,angle);
      cyl(r,marker,y,-.009,.009,.013,gold,6);
    })),
    ...[-1,1].map((s,i)=>part('bearing-'+(i+1),(i?'Right':'Left')+' carrier bearing','Tapered rollers support the differential carrier in the axle housing.',[s*.22,s*.65,.48],r=>radialBearing(r,center,y,s*.505,s*.61))),
    withSource(part('lock',name+' differential lock','The axle-mounted cylinder pushes a shift tube. Open the lock to follow its lever, thrust ring and toothed sleeve.',[.12,.93,.28],(r,t)=>{
      const u=g500LockState(t).engagement*.12;
      sleeve(r,center,y,.65-u,.85-u,.119,.083,dark,18);
      splinedSleeve(r,center,y,.57-u,.65-u,.147);
      cyl(r,[0,0,center[2]+.175],y,.60,.85,.063,copper,12);
      r.rod([0,.72-u,center[2]+.172],[0,.72-u,center[2]+.107],.022,steel,7);
    }),sources.hydraulic)
  ];
  const model=study('g500-'+which+'-diff',name+' axle differential',desc+' Open the lock to see how unequal wheel speeds become one.',sources[which],rows,
    'The two axle shafts first turn at different speeds. Once the sleeve engages, they revolve together. The sleeve releases at the end of the cycle.');
  model.viewAngle=[front?-1.32:-1.90,.54];return model;
}

function centerMechanism(){
  const rows=[
    part('housing','Geared differential housing','The transfer-case countershaft drives the external teeth. The cutaway leaves the internal spider and bevel gears in view.',up,(r,t)=>{
      const a=g500LockState(t).carrier;
      helicalRim(r,center,x,-.41,-.325,.435,a);
      helicalRim(r,center,x,.33,.418,.473,a);
      bridge(r,center,x,a,.38,.36);
    }),
    part('spider','Four-arm spider','The carrier turns the cross. Each of its four arms journals a bevel pinion.',[.05,0,.7],(r,t)=>{
      const a=g500LockState(t).carrier;
      for(const rotated of [false,true])cyl(r,center,orientation(a,rotated),-.345,.345,.046,gold,12);
    }),
    ...Array.from({length:4},(_,i)=>part('bevel-'+(i+1),'Spider bevel pinion '+(i+1),'This pinion orbits with the carrier. It turns on the spider arm when the front and rear outputs differ in speed.',[0,.72*Math.cos(i*TAU/4),.72*Math.sin(i*TAU/4)],(r,t)=>{
      const a=g500LockState(t),ax=orientation(a.carrier+i*TAU/4);
      gear(r,center,ax,.305,.156,.196,.101,8,copper,a.spin+Math.PI/8,.29);
    })),
    part('spherical-washers','Four spherical thrust washers','One dished washer sits behind each pinion, between the bevel gear and the carrier.',[0,-.45,.58],(r,t)=>{
      const angle=g500LockState(t).carrier;
      for(let i=0;i<4;i++)turn(r,center,orientation(angle+i*TAU/4),[[.31,.051],[.31,.103],[.299,.166],[.31,.167],[.323,.108],[.323,.051],[.31,.051]],gold,{n:16});
    }),
    ...[-1,1].flatMap((s,i)=>{
      const end=i?'Rear':'Front',col=i?colors.rear:colors.front,label=i?'rear':'front';
      return [
        part(label+'-gear',end+' output bevel gear','The inner splines carry torque to the '+label+' output shaft. Front and rear outputs may turn at different speeds with the center lock open.',[s*.81,.12,.42],(r,t)=>{
          const a=g500LockState(t);endGear(r,center,x,s,i?a.second:a.first,col);
        }),
        part(label+'-washer',end+' flat thrust washer','The flat washer bears against the back of its output bevel gear.',[s*.66,.45,.03],r=>sleeve(r,center,x,s*.346,s*.36,.298,.151,gold,24)),
        part(label+'-bearing',end+' tapered roller bearing','The bearing supports the differential housing in the transfer case.',[s*.80,-.36,.05],r=>radialBearing(r,center,x,s*.511,s*.63)),
        part(label+'-output',end+' output shaft and flange','The flange connects to the '+label+' propeller shaft.',[s*1.0,.04,-.36],(r,t)=>{
          const a=g500LockState(t);outputFlange(r,center,x,s,i?a.second:a.first);
        })
      ];
    }),
    part('shim','Rear bearing shim','Mercedes shows this adjusting shim behind the rear bearing cup.',[.75,-.18,-.43],r=>sleeve(r,center,x,.646,.659,.292,.237,copper,26)),
    withSource(part('lock','Center differential lock','The vacuum diaphragm acts around the front output. Open it to see the sleeve, spring pack and thrust ring.',[-.90,.55,.10],(r,t)=>{
      const u=g500LockState(t).engagement*.10;
      sleeve(r,center,x,-.775,-.70,.24,.192,dark,22);
      splinedSleeve(r,center,x,-.77+u,-.69+u,.177);
    }),sources.vacuum)
  ];
  const model=study('g500-center-diff','Center differential · VG150E','Inside the transfer case, four small bevel gears share drive between the front and rear output gears. A vacuum-operated lock couples the two outputs.',sources.center,rows,
    'The four pinions turn on the gold spider as the shaft speeds diverge. When the sleeve engages, front and rear flanges turn together and the pinions stop turning on their arms.');
  model.viewAngle=[-.71,.52];return model;
}
function coil(r,c,axis,start,end,radius,wire,turns=5){
  const b=basis(axis),steps=turns*8;
  let last=point(c,b,start,radius,0);
  for(let n=1;n<=steps;n++){
    const q=point(c,b,start+(end-start)*n/steps,radius,n*TAU/8);
    r.rod(last,q,wire,metal,5);last=q;
  }
}
const axleLockCenter=[0,0,.65],cylinderCenter=[0,0,.994];
function axleLock(){
  const stroke=t=>g500LockState(t).engagement*.20;
  const rows=[
    part('casting','Axle-mounted shift cylinder','The hydraulic piston runs in the upper bore. The fork reaches through the axle-tube opening below it.',up,r=>{
      turn(r,cylinderCenter,y,[[.14,.144],[.14,.205],[.83,.205],[.90,.167],[.90,.144],[.14,.144]],dark,{start:5.25,sweep:3.40,n:20});
      for(const s of [-1,1])r.box(s*.16-.037,.32,.746,s*.16+.037,.72,.818,steel);
    }),
    part('end-cover','Cylinder end cover','The end cover closes the hydraulic bore. The small bleed port meets the chamber at its upper edge.',[0,.78,.32],r=>{
      cyl(r,cylinderCenter,y,.903,.943,.199,steel,20);
      cyl(r,[0,.867,1.15],z,0,.061,.032,gold,6);
    }),
    part('piston','Hydraulic shift piston and shaft','Hydraulic pressure moves the piston along the axle tube. The shaft carries the fork toward the differential.',[.55,.42,.22],(r,t)=>{
      const s=stroke(t);cyl(r,cylinderCenter,y,.68-s,.77-s,.136,copper,20);cyl(r,cylinderCenter,y,.17-s,.70-s,.047,metal,14);
      sleeve(r,cylinderCenter,y,.720-s,.741-s,.14,.131,colors.rubber,18);
    }),
    part('springs','Shift-cylinder springs','The smaller and larger coil springs act on the shaft and fork as the mechanism moves.',[.60,-.33,.36],(r,t)=>{
      const s=stroke(t);coil(r,cylinderCenter,y,.51-s,.672-s,.077,.009,4);coil(r,cylinderCenter,y,.17,.42-s*.7,.10,.009,5);
    }),
    part('fork','Shift lever and yoke','The lever transfers piston travel to the polyamide ring on the sliding tube.',[-.62,.26,.14],(r,t)=>{
      const station=.48-stroke(t);
      sleeve(r,cylinderCenter,y,station-.028,station+.029,.092,.049,steel,14);
      for(const dir of [-1,1])r.rod([dir*.05,station,.94],[dir*.11,station,.687],.026,steel,8);
    }),
    part('ring','Polyamide thrust ring','The yoke bears on this plastic ring so the tube can rotate independently of the lever.',[.45,.43,-.25],(r,t)=>{
      const s=stroke(t);sleeve(r,axleLockCenter,y,.453-s,.507-s,.130,.102,'#d4c9a4',22);
    }),
    part('tube','Sliding shift tube','The tube carries the fork movement inward along the axle shaft to the locking sleeve.',[0,.77,-.38],(r,t)=>{
      const s=stroke(t);sleeve(r,axleLockCenter,y,-.43-s,.53-s,.103,.077,steel,22);
    }),
    part('sleeve','Toothed locking sleeve','At the inboard end of the tube the sleeve engages the drive member, tying the axle shaft to the differential carrier.',[0,-.77,-.33],(r,t)=>{
      const s=stroke(t);splinedSleeve(r,axleLockCenter,y,-.46-s,-.34-s,.161);
    }),
    part('drive','Mating drive member','The mating teeth accept the sliding sleeve once the two line up.',[0,-.89,.26],r=>{
      sleeve(r,axleLockCenter,y,-.79,-.64,.237,.165,dark,20);
      gear(r,axleLockCenter,y,-.68,-.60,.158,.158,18,gold,0,.67);
    }),
    part('shaft','Axle shaft','The shaft runs through the bore of the shift tube and sleeve.',[0,.92,.04],r=>cyl(r,axleLockCenter,y,-.88,.86,.070,dark,16)),
    part('switch','Engagement switch','This switch reports the end position of the shift mechanism.',[-.47,.42,.60],r=>{
      cyl(r,[0,.56,1.0],z,.13,.20,.046,metal,6);cyl(r,[0,.56,1.0],z,.20,.29,.037,colors.rubber,10);
    })
  ];
  const model=study('g500-axle-lock','Axle lock · hydraulic shift cylinder','At each axle a hydraulic cylinder operates a fork and a long shift tube. The tube slides along the shaft until its inboard collar engages the drive member.',sources.hydraulic,rows,
    'Watch the piston, fork, plastic ring, tube and toothed collar travel together. The collar engages the drive member, holds, then releases.');
  model.viewAngle=[-1.24,.43];return model;
}
function transferLock(){
  const c=center;
  const slide=t=>g500LockState(t).engagement*.18;
  const rows=[
    part('cover','End cover and vacuum port','The annular front cover encloses the diaphragm around the output flange.',left,r=>{
      turn(r,c,x,[[-.60,.269],[-.60,.555],[-.47,.60],[-.44,.549],[-.53,.529],[-.55,.269],[-.60,.269]],steel,{n:26,start:5.15,sweep:3.2});
      r.rod([-.49,.43,1.13],[-.60,.48,1.16],.039,gold,9);
    }),
    part('diaphragm','Annular vacuum diaphragm','Vacuum deflects the flexible diaphragm. Its inner rim acts on the shift mechanism, with the outer rim retained by the housing.',[0,-.46,.60],(r,t)=>{
      const s=slide(t);
      turn(r,c,x,[[-.42,.553],[-.435,.48],[-.41,.414],[-.39+s*.8,.31],[-.385+s,.257],[-.36+s,.257],[-.371+s*.8,.31],[-.39,.414],[-.412,.48],[-.40,.553]],colors.rubber,{n:28,start:5.10,sweep:3.50});
    }),
    part('housing','Shift-cylinder housing','The cast housing supports the diaphragm around the front output.',up,r=>{
      turn(r,c,x,[[-.445,.552],[-.445,.605],[-.29,.618],[-.205,.43],[-.205,.408],[-.302,.557],[-.445,.552]],dark,{n:22,start:5.15,sweep:3.20});
    }),
    withSource(part('sleeve','Splined sliding sleeve','Splines guide the sleeve as it slides along the shaft. Its engagement couples the driveline outputs.',[.72,-.38,.02],(r,t)=>{
      const s=slide(t);splinedSleeve(r,c,x,-.28+s,.085+s,.225);sleeve(r,c,x,-.302+s,-.261+s,.292,.16,steel,24);
    }),sources.sleeve),
    withSource(part('springs','Caged coil springs','Four springs act between the sleeve flange and the plastic thrust ring.',[-.40,.60,.05],(r,t)=>{
      const s=slide(t);
      for(let i=0;i<4;i++)coil(r,point(c,basis(x),0,.246,TAU*i/4),x,-.378+s,-.302+s,.021,.0055,4);
    }),sources.sleeve),
    withSource(part('thrust-ring','Plastic thrust ring','The annular thrust ring seats against the spring pack and spreads the shift load around the sleeve.',[-.78,-.32,.04],(r,t)=>{
      const s=slide(t);sleeve(r,c,x,-.407+s,-.381+s,.28,.21,'#cdbb88',24);
    }),sources.sleeve),
    withSource(part('seal','Sleeve O-ring','The elastomer ring fits around the sleeve shoulder.',[-.38,.35,-.52],(r,t)=>{
      const s=slide(t);sleeve(r,c,x,-.289+s,-.275+s,.299,.291,colors.rubber,24);
    }),sources.sleeve),
    part('flange','Front output flange and shaft','The diaphragm and sleeve surround this shaft, which connects to the front propeller shaft.',[-.86,.10,-.30],r=>{
      cyl(r,c,x,-.97,.47,.133,steel,20);sleeve(r,c,x,-.89,-.83,.248,.13,dark,24);
    }),
    part('mate','Mating splines','Once the sleeve spans the mating splines, the two outputs must rotate together.',right,r=>{
      gear(r,c,x,.105,.28,.157,.157,18,gold,0,.82);
    }),
    part('switch','Center-lock confirmation switch','The separate electrical switch reports the lock position.',[.49,.12,.73],r=>{
      cyl(r,[-.29,.12,1.19],z,0,.134,.059,metal,6);cyl(r,[-.29,.12,1.19],z,.134,.212,.044,colors.rubber,10);
    })
  ];
  const model=study('g500-center-lock','Center lock · vacuum diaphragm','The VG150E places the lock at its front output flange. Vacuum moves an annular diaphragm and splined sliding sleeve.',sources.vacuum,rows,
    'The diaphragm flexes at its inner rim. The thrust ring, spring pack and sleeve advance together, hold engagement and return.');
  model.viewAngle=[-.76,.50];return model;
}
const models={front:axleMechanism('front'),rear:axleMechanism('rear'),center:centerMechanism(),axleLock:axleLock(),centerLock:transferLock()};
export function getG500DiffDetail(vehicle,id){
  if(vehicle!=='g500')return null;
  switch(id){
    case 'differentials.front':case 'drivetrain.front-differential':return models.front;
    case 'differentials.center':case 'drivetrain.transfer':return models.center;
    case 'differentials.rear':case 'drivetrain.rear-differential':return models.rear;
    case 'g500-front-diff.lock':case 'g500-rear-diff.lock':return models.axleLock;
    case 'g500-center-diff.lock':return models.centerLock;
    default:return null;
  }
}
// Front is negative X. All three housings remain pickable on the assembled underbody.
const frontX=-g500HalfWheelbase,rearX=g500HalfWheelbase;
const topCenter=transferOrigin;
// Vehicle right. Approximate side-gear offset from the 989 / 608 mm
// replacement shafts for OE A4633302801 (left) and A4633302901 (right).
const frontCarrierY=(.989-.608)/2;
function installedAxle(r,front){
  const x0=front?frontX:rearX,y0=front?frontCarrierY:0,z0=g500HubZ,sign=front?1:-1,c=[x0,y0,z0];
  turn(r,c,x,[[-sign*.15,.085],[-sign*.142,.154],[-sign*.06,.176],[sign*.065,.172],[sign*.13,.116],[sign*.26,.066]],dark,{n:16});
  // Both axle plates show a removable, flanged cover with straight shoulders.
  const cover=[[-.114,-.10],[-.069,-.149],[.067,-.148],[.126,-.087],[.126,.07],[.073,.14],[-.070,.14],[-.123,.081]];
  const back=cover.map(([yy,zz])=>[x0-sign*.141,y0+yy,z0+zz]);
  const lip=cover.map(([yy,zz])=>[x0-sign*.16,y0+yy,z0+zz]);
  r.polygon(lip,steel,false);
  for(let i=0;i<cover.length;i++){const j=(i+1)%cover.length;r.polygon([back[i],back[j],lip[j],lip[i]],dark,false);}
  sleeve(r,c,x,sign*.25,sign*.27,.081,.035,steel,14);
  for(const [yy,zz] of cover)cyl(r,[x0-sign*.165,y0+yy*.91,z0+zz*.91],x,-.005,.005,.010,metal,6);
  if(front)for(const side of [-1,1]){
    r.rod([x0,y0+side*.115,z0],[x0,side*.736,z0],.028,metal,12);
    cyl(r,[x0,side*.68,z0],y,-.044,.044,.061,steel,12);
  }
  // The dedicated drivetrain view tags the rear shafts separately for direct selection.
  if(!front&&r.inspection?.assembly!=='drivetrain')drawG500RearShafts(r);
  // The hydraulic slave is on the axle tube and the sliding tube lies inside that tube.
  const slaveSide=front?-1:1;
  cyl(r,[x0,y0,z0+.064],y,slaveSide*.18,slaveSide*.36,.053,steel,12);
  const endpoints=[y0+slaveSide*.20,y0+slaveSide*.33];
  r.box(x0-.042,Math.min(...endpoints),z0+.016,x0+.042,Math.max(...endpoints),z0+.064,dark);
}
export function drawG500RearShafts(r){
 for(const s of [-1,1]){
   r.rod([rearX,s*.115,g500HubZ],[rearX,s*.736,g500HubZ],.028,metal,12);
   sleeve(r,[rearX,s*.722,g500HubZ],y,-.021,.021,.068,.025,steel,14);
 }
}
function installedTransfer(r){
  const c=topCenter;
  turn(r,c,x,[[-.159,.10],[-.14,.17],[-.045,.18],[.112,.159],[.167,.10]],steel,{n:16});
  // Upper input and lower differential bores share the case casting.
  const upper=[c[0],c[1]-.09,c[2]+.105];
  cyl(r,upper,x,-.116,.092,.105,dark,14);
  drawG500TransferInputFlange(r);
  cyl(r,[c[0]-.03,c[1]+.112,c[2]+.157],x,-.076,.056,.047,dark,14);
  cyl(r,[c[0]+.012,c[1]+.107,c[2]+.135],y,-.031,.036,.058,steel,14);
  sleeve(r,c,x,-.19,-.158,.115,.057,dark,18);
  for(const s of [-1,1])cyl(r,c,x,s*.175,s*.21,.065,metal,14);
}
function installedShaft(r,front){
  const end=[axleInputX(front,g500HalfWheelbase),front?frontCarrierY:0,g500HubZ],start=[transferOutputX(front),topCenter[1],topCenter[2]];
  drawG500AxleShaft(r,start,end);
}
const rows=[
  ['front','Front axle differential','Open the front crown wheel, pinion, side gears and hydraulic lock.',[-.32,-.36,.34],sources.front,r=>installedAxle(r,true)],
  ['center','Center differential · transfer case','The VG150E sends drive to both axles with the center differential open. Its motor selects high or low range. A separate vacuum-operated sleeve locks the differential.',[.05,0,.62],sources.center,installedTransfer],
  ['rear','Rear axle differential','Open the rear final drive, its wheel-side gears and its hydraulic lock.',[.38,.33,.27],sources.rear,r=>installedAxle(r,false)],
  ['front-shaft','Front propeller shaft','Drive runs forward from the transfer-case flange to the pinion at the back of the front axle.',[-.1,-.38,-.20],shaftRefs.front,r=>installedShaft(r,true)],
  ['rear-shaft','Rear propeller shaft','The rear output flange drives the pinion at the front of the rear axle.',[.1,.38,-.2],shaftRefs.rear,r=>installedShaft(r,false)]
];
const assembly={id:'differentials',name:'Differentials & locks',description:'The G500 uses permanent four-wheel drive. A short input shaft brings power to the two-speed VG150E. Two other shafts carry it to the front and rear axle differentials. Each axle and the center differential has a separate lock.',source:sources.transfer,view:'hero',viewAngle:[-1.05,.60],internal:true,category:'service',
  parts:rows.map(([id,name,description,offset,source,draw])=>({id:'differentials.'+id,name,description,offset,source,draw,category:'service'}))};
export function getG500Differentials(id){return id==='g500'?assembly:null;}
export function drawG500Differentials(r){for(const p of assembly.parts)r.tag(p.id,()=>p.draw(r));}
