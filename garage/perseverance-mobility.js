import {TAU,part,tone} from './space-shapes.js';
import {study} from './saturn-shapes.js';

const nasa={label:'NASA/JPL · Perseverance rover components',url:'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/'};
const wheelPhoto={label:'NASA/JPL · Perseverance wheel and titanium spokes, March 2020',url:'https://science.nasa.gov/resource/gift-wrapped-mars-wheel/'};
const metal='#acae9f',bright='#d5d3bd',frame='#969d95',dark='#464d50',gold='#bc9e67',white='#dadbd1';
const wheelLocations=[['fl','Left front',1,'front'],['ml','Left middle',1,'middle'],['rl','Left rear',1,'rear'],['fr','Right front',-1,'front'],['mr','Right middle',-1,'middle'],['rr','Right rear',-1,'rear']];
// NASA's Perseverance GLB, Wheels_objs / aluminum_black, deployed pose.
// Dimensions are metres in the GLB. The six tread meshes have the same
// envelope. Middle wheels stand 0.122 m outboard of their corner wheels.
const wheelDiameter=.52534, wheelWidth=.33561;
const cornerTrackHalf=1.06242, middleTrackHalf=1.18449;
const treadRadius=.952, wheelScale=wheelDiameter/(2*treadRadius);
const drumHalfWidth=wheelWidth/(2*wheelScale);
const axleInset=.59*wheelScale;
const cos=Math.cos,sin=Math.sin;
const arc=(p,dx,dz,angle)=>[p[0]+dx*cos(angle)-dz*sin(angle),p[1],p[2]+dx*sin(angle)+dz*cos(angle)];
function mapped(r,fn){
  const proxy=Object.create(r);
  proxy.polygon=(points,color,stroke)=>r.polygon(points.map(fn),color,stroke);
  return proxy;
}
// Coordinates are schematic. Each arm rotates rigidly about its actual parent.
export function rockerPose(side,t){
  const lift=(1-cos(TAU*t))/2,rockAngle=side>0?-.21*lift:.028*lift;
  const bogieAngle=side>0 ? .14*lift : -.025*lift;
  const pivot=[-.19,side*.74,.83],frontKnee=arc(pivot,-.67,-.15,rockAngle);
  const joint=arc(pivot,.77,-.13,rockAngle);
  const restHubHeight=wheelDiameter/2;
  const front=arc(pivot,-1.13-pivot[0],restHubHeight-pivot[2],rockAngle);
  const restJointX=pivot[0]+.77,restJointZ=pivot[2]-.13;
  const middle=arc(joint,.055-restJointX,restHubHeight-restJointZ,bogieAngle);
  const rear=arc(joint,1.13-restJointX,restHubHeight-restJointZ,bogieAngle);
  front[1]=rear[1]=side*(cornerTrackHalf-axleInset);
  middle[1]=side*(middleTrackHalf-axleInset);
  const middleKnee=arc(joint,-.30,-.095,bogieAngle),rearKnee=arc(joint,.43,-.12,bogieAngle);
  const bodyAngle=(-.21+.028)*lift/2;
  return {pivot,frontKnee,front,joint,middleKnee,middle,rearKnee,rear,bodyAngle,rockAngle};
}
function body(r,t){
  const {pivot,bodyAngle}=rockerPose(1,t);
  return mapped(r,([x,y,z])=>{const [xx,,zz]=arc(pivot,x-pivot[0],z-pivot[2],bodyAngle);return [xx,y,zz];});
}
function segment(r,a,b,radius=.052){
  r.rod(a,b,radius,frame,10);
  for(const frac of [.07,.90]){
    const at=f=>a.map((v,i)=>v+(b[i]-v)*f);
    r.rod(at(frac),at(frac+.032),radius*1.22,bright,12);
  }
}
function hinge(r,p,radius=.105){
  const [x,y,z]=p;
  r.tubeY(x,y-.072,y+.072,z,radius,metal,16);
  for(const side of [-1,1])r.ringY(x,y+side*.074,z,radius,radius*.36,bright,16);
}
function rocker(r,p){
  segment(r,p.pivot,p.frontKnee);segment(r,p.frontKnee,p.front);
  segment(r,p.pivot,p.joint);hinge(r,p.pivot);hinge(r,p.joint,.082);
}
function bogie(r,p){
  segment(r,p.joint,p.middleKnee,.042);segment(r,p.middleKnee,p.middle,.042);
  segment(r,p.joint,p.rearKnee,.042);segment(r,p.rearKnee,p.rear,.042);
}
function crossLink(r,t){
  const center=body(r,t);
  center.tubeY(-.19,-.62,.62,1.016,.034,dark,12);
  const top=[];
  for(const side of [-1,1]){
    const p=rockerPose(side,t),shaft=arc(p.pivot,-.135,.20,p.rockAngle);
    r.rod(p.pivot,shaft,.034,dark,10);
    const joint=[shaft[0],side*.59,shaft[2]+.025];top.push(joint);
    r.rod(shaft,joint,.036,metal,10);
    r.rod(joint,[-.02,side*.18,1.035+(joint[2]-1.035)*.28],.028,metal,10);
  }
  r.rod(top[0],top[1],.022,frame,8);
}
const polar=(a,y,rad)=>[rad*cos(a),y,rad*sin(a)];
function drum(r,t){
  const n=48,phase=TAU*t;
  for(let i=0;i<n;i++){
    const a=i*TAU/n+phase,b=(i+1)*TAU/n+phase;
    r.polygon([polar(a,-drumHalfWidth,.90),polar(b,-drumHalfWidth,.90),polar(b,drumHalfWidth,.90),polar(a,drumHalfWidth,.90)],tone('#939992',.89+.13*sin((a+b)/2)),false);
    for(const s of [-1,1]){
      const y=s*drumHalfWidth;
      r.polygon([polar(a,y,.90),polar(b,y,.90),polar(b,y,.843),polar(a,y,.843)],bright,false);
      r.polygon([polar(a,y,.843),polar(b,y,.843),polar(b,y-s*.030,.842),polar(a,y-s*.030,.842)],dark,false);
    }
  }
}
function grousers(r,t){
  // Three strips per cleat give a shallow curve across the wheel tread.
  for(let i=0;i<48;i++){
    const a=i*TAU/48+TAU*t;
    const sides=[[-.33,-.031],[-.11,.002],[.11,.014],[.33,.002]];
    for(let j=1;j<sides.length;j++){
      const [v0,b0]=sides[j-1],[v1,b1]=sides[j];
      const y0=v0*drumHalfWidth/.33,y1=v1*drumHalfWidth/.33;
      r.polygon([polar(a+b0-.013,y0,.902),polar(a+b1-.013,y1,.902),polar(a+b1,y1,.952),polar(a+b0,y0,.952)],bright,false);
      r.polygon([polar(a+b0,y0,.952),polar(a+b1,y1,.952),polar(a+b1+.017,y1,.902),polar(a+b0+.017,y0,.902)],frame,false);
    }
  }
}
// The hub and the outer spoke fixings sit toward the outboard rim.
function wheelFaceY(original){return original*drumHalfWidth/.335;}
function spokes(r,t,sign){
  for(let i=0;i<6;i++){
    const a=i*TAU/6+t*TAU;
    let prev=polar(a,sign*wheelFaceY(.24),.193);
    for(let j=1;j<=7;j++){
      const f=j/7,rad=.193+.661*f,angle=a-.57*sin(f*Math.PI*.89)-.12*f;
      const next=polar(angle,sign*wheelFaceY(.24-.08*sin(f*Math.PI)),rad);
      r.rod(prev,next,.026,tone(metal,i%2?.96:1.03),7);prev=next;
    }
  }
}
function hub(r,t){
  r.tubeY(0,-.23,wheelFaceY(.248),0,.19,dark,22);
  r.ringY(0,wheelFaceY(.25),0,.19,0,metal,22);
  for(let i=0;i<6;i++){
    const [x,y,z]=polar((i/6+t)*TAU,wheelFaceY(.251),.143);
    r.ringY(x,y,z,.019,0,dark,6);
  }
}
function driveCase(r){
  for(const [lo,hi,rad,color] of [[-.32,-.12,.165,metal],[-.66,-.32,.22,frame],[-.73,-.66,.185,dark]]){
    r.tubeY(0,lo,hi,0,rad,color,24);r.ringY(0,lo-.001,0,rad,.065,bright,24);
  }
  r.rod([0,-.65,.15],[-.16,-.75,.31],.027,dark,8);
}
function steerCap(r){
  r.rod([0,-.59,-.02],[0,-.59,.57],.084,metal,12);
  r.rod([0,-.59,.50],[0,-.59,.83],.131,frame,18);
  r.rod([0,-.59,.825],[0,-.59,.872],.149,bright,18);
}
function wheelBench(r,partId,t,corner){
  // The upper housing is fixed to the leg. The wheel and drive below yaw together.
  const yaw=corner ? .31*sin(TAU*t) : 0,py=-.59;
  const local=mapped(r,([x,y,z])=>[x*cos(yaw)-(y-py)*sin(yaw),py+x*sin(yaw)+(y-py)*cos(yaw),z+1.02]);
  if(partId==='drum')drum(local,t);
  if(partId==='tread')grousers(local,t);
  if(partId==='spokes')spokes(local,t,1);
  if(partId==='output')hub(local,t);
  if(partId==='drive')driveCase(local);
  const deck=mapped(r,([x,y,z])=>[x,y,z+1.02]);
  if(partId==='steer')steerCap(deck);
  if(partId==='knuckle'){
    deck.rod([0,-.64,0],[0,-.64,.43],.086,frame,12);
    deck.rod([0,-.64,.40],[.20,-.64,.54],.073,bright,12);
  }
}
function makeWheel(corner){
  const id=corner?'percy-corner':'percy-center';
  const desc=corner?'A corner wheel turns on two axes. Its traction motor rolls the wheel around the horizontal axle. A separate steering motor turns the entire drive beneath the suspension.':'Each middle wheel has its own traction motor. Its support holds the rolling axis in line with the bogie.';
  const parts=[
    ['drum','Machined aluminum drum','Each wheel was machined from a solid piece of aluminum. Its thin hollow drum joins the ends of the spokes.',[0,.53,-.39]],
    ['tread','Forty-eight grousers','The shallow curve of each cleat runs across the tread. Perseverance has twice as many cleats as Curiosity.',[-.80,.10,.37]],
    ['spokes','Curved titanium spokes','These springy spokes connect the rigid aluminum tread drum to the driven hub.',[.75,.48,.38]],
    ['output','Rotating hub','The hub transfers rotation from the wheel drive into the titanium spokes.',[0,1.02,.08]],
    ['drive','Wheel-drive actuator','One motor drives this wheel, and five more independently drive the other wheels. The housing sits inboard of the hub.',[0,-.95,-.31]],
    corner?['steer','Steering actuator and pivot','A separate actuator above the drive yaws the whole front or rear wheel.',[.25,-.63,.83]]:['knuckle','Middle-wheel support','This fixed support attaches the drive to the bogie. The middle wheels roll on unsteered axles.',[.27,-.70,.71]]
  ];
  return study(id,corner?'Perseverance corner wheel':'Perseverance middle wheel',desc,nasa,parts.map(([key,name,note,off])=>part(key,name,note,off,(r,t)=>wheelBench(r,key,t,corner))),[.56,.24],{
    animated:true,motionDescription:corner?'The drive rolls the wheel as the separate steering joint swings it from side to side.':'The drum, spokes and hub roll together while the bogie support holds the axle.'
  });
}
const cornerWheel=makeWheel(true),centerWheel=makeWheel(false);
function rollOnVehicle(r,side,location,t){
  const pose=rockerPose(side,t),[cx,cy,cz]=pose[location],scale=wheelScale;
  // Wheel centers sit outboard of the rigid links. The inboard drive meets the leg.
  const local=mapped(r,([x,y,z])=>[cx+scale*x,cy+side*(axleInset+scale*y),cz+scale*z]);
  drum(local,t);grousers(local,t);spokes(local,t,1);hub(local,t);driveCase(local);
  if(location!=='middle')steerCap(local);
}
const deckParts=[
  part('chassis','Rover chassis and equipment deck','The rectangular warm electronics box supports the outside instruments and the mast. A gold-colored power unit projects beyond the aft deck.',[0,0,.65],(r,t)=>{
    const q=body(r,t);
    q.box(-.96,-.57,.59,.94,.57,1.012,gold);
    q.box(-1.06,-.62,1.014,1.00,.62,1.057,white);
    for(const s of [-1,1])for(let i=0;i<6;i++){
      const x=-.90+i*.30;q.box(x,s*.576-.006,.625,x+.262,s*.576+.006,.953,i%2?metal:'#c9b38a');
      q.rod([x,s*.583,.629],[x+.259,s*.583,.949],.007,bright,6);
    }
    q.box(.77,-.31,1.071,1.03,.31,1.19,dark);
    q.rod([.86,0,1.15],[1.42,0,1.42],.169,gold,16);
    // Longitudinal radiator fins follow the tilted generator axis.
    for(let i=0;i<8;i++){
      const a=i*TAU/8,fin=(x,z,rad)=>[x-.433*rad*sin(a),rad*cos(a),z+.901*rad*sin(a)];
      q.polygon([fin(.88,1.160,.15),fin(1.41,1.416,.15),fin(1.42,1.421,.29),fin(.86,1.150,.29)],i%2?metal:bright,false);
    }
    // Stowed science arm against the forward chassis.
    for(const s of [-1,1])q.rod([-1.063,s*.52,.88],[-1.17,s*.36,.68],.055,metal,12);
    q.rod([-1.15,-.36,.68],[-1.16,.33,.66],.065,white,12);
    q.rod([-1.16,.33,.66],[-1.06,.45,.78],.083,dark,12);
  }),
  part('antennas','Rover deck antennas','The hexagonal high-gain antenna points toward Earth. A cylindrical UHF antenna at the rear relays data through Mars orbiters.',[.34,.37,.89],(r,t)=>{
    const q=body(r,t);
    q.rod([.27,.38,1.062],[.30,.37,1.28],.031,frame,12);
    const hex=(radius,dx)=>Array.from({length:6},(_,i)=>{const a=i*TAU/6;return [.33+dx-.14*sin(a)*radius,.37+.218*cos(a)*radius,1.37+.173*sin(a)*radius];});
    q.polygon(hex(1,.014),dark,false);q.polygon(hex(1,-.013),gold,false);q.polygon(hex(.90,-.016),'#cdb888',false);
    for(let i=0;i<6;i++)q.rod(hex(1,-.014)[i],hex(1,-.014)[(i+1)%6],.009,metal,6);
    q.rod([.66,-.38,1.061],[.66,-.38,1.315],.097,white,20);
    q.rod([.66,-.38,1.318],[.66,-.38,1.325],.099,bright,20);
    q.rod([.63,.32,1.061],[.63,.32,1.30],.021,metal,10);
    q.rod([.63,.32,1.28],[.63,.32,1.35],.049,white,12);
  }),
  part('mast','Remote sensing mast','SuperCam looks through the large circular opening. The two Mastcam-Z cameras and the navigation cameras sit below it.',[-.48,.41,.89],(r,t)=>{
    const q=body(r,t);
    q.rod([-.65,-.32,1.05],[-.648,-.32,1.83],.065,metal,16);
    q.rod([-.65,-.32,1.06],[-.65,-.32,1.28],.095,white,16);
    q.box(-.77,-.438,1.80,-.50,-.198,2.055,white);
    q.discX(-.773,-.318,1.934,.070,dark,20);q.discX(-.775,-.318,1.934,.041,'#577184',16);
    q.box(-.79,-.535,1.68,-.59,-.108,1.80,white);
    for(const yy of [-.50,-.415,-.224,-.14])q.discX(-.794,yy,1.742,.028,dark,14);
  }),
  part('differential','Deck differential and links','The differential couples the two rockers to the body. Their average angle sets the pitch of the deck.',[.12,0,.94],crossLink),
  ...[1,-1].flatMap(s=>[
    part(s>0?'left-rocker':'right-rocker',(s>0?'Left':'Right')+' rocker','The long arm pivots at the chassis and reaches the front wheel and the rear bogie.',[-.18,s*.60,.29],(r,t)=>rocker(r,rockerPose(s,t))),
    part(s>0?'left-bogie':'right-bogie',(s>0?'Left':'Right')+' bogie','This smaller pivoting arm links the middle and rear wheels to the rocker.',[.36,s*.74,.31],(r,t)=>bogie(r,rockerPose(s,t)))
  ]),
  ...wheelLocations.map(([key,label,s,location])=>part(key,label+' wheel',location==='middle'?'Open the middle wheel to see its curved spokes and fixed-axis drive.':'Open this corner wheel to see its independent drive and steering pivot.',[location==='front'?-.51:location==='rear'?.51:0,s*.89,-.35],(r,t)=>rollOnVehicle(r,s,location,t)))
];
const rover=study('percy-rover','Perseverance surface rover','Six driven wheels support Perseverance. Follow the long rocker on either side to the front wheel. At its opposite end, a shorter arm carries the middle and rear wheels.',nasa,deckParts,[-.60,.31],{
  animated:true,motionDescription:'The left front wheel rises. Its rocker turns at the chassis while the bogie pivots between the middle and rear wheels. The deck follows the average of the two rocker angles.'
});
const linkage=study('percy-linkage','Perseverance rocker and bogie','One side of the suspension shows three wheel centers and two pivots. The lengths of the rigid arms stay constant while the wheel heights change.',nasa,[
  part('rocker','Front rocker','The rocker pivots where it meets the body and carries the front wheel at its forward end.',[-.47,-.26,.45],(r,t)=>rocker(r,rockerPose(1,t))),
  part('bogie','Rear bogie','The center and rear axles sit on opposite ends of one arm. It can rotate relative to the rocker.',[.54,.39,.45],(r,t)=>bogie(r,rockerPose(1,t))),
  ...wheelLocations.slice(0,3).map(([key,label,s,loc])=>part(key,label+' wheel',loc==='middle'?'The bogie carries this unsteered wheel.':'The outer wheel has both a drive and a steering actuator.',[loc==='front'?-.55:loc==='rear'?.55:0,.83,-.22],(r,t)=>rollOnVehicle(r,s,loc,t)))
],[-.24,.20],{animated:true,motionDescription:'Both arms pivot about fixed-length links as the three wheel centers move relative to one another.'});
const drive=study('percy-drive','Perseverance wheel drive','The torque path runs from the actuator into the hub, through the titanium spokes and into the aluminum drum. The inboard housing stays with the leg as the output turns.',wheelPhoto,[
  part('motor','Inboard drive unit','The motor sits at the inner end of the wheel. The sealed drive is shown by its outer envelope.',[0,-.92,.14],r=>driveCase(mapped(r,([x,y,z])=>[x,y,z+1]))),
  part('output','Axle and output flange','The flange and hub carry the spokes around the wheel axis.',[0,.48,.15],(r,t)=>hub(mapped(r,([x,y,z])=>[x,y,z+1]),t)),
  part('spokes','Titanium spring spokes','Curved spokes flex to take up loads between the hub and the outer drum.',[.45,.81,.26],(r,t)=>spokes(mapped(r,([x,y,z])=>[x,y,z+1]),t,1)),
  part('rim','Inner rim lip','The outer ends of the spokes meet the aluminum wheel. A narrow lip leaves the attachment plane exposed in this view.',[-.55,.12,-.34],r=>{r.ringY(0,wheelFaceY(.238),1,.90,.81,metal,48);r.tubeY(0,wheelFaceY(.222),wheelFaceY(.237),1,.90,frame,48);})
],[.55,.19],{animated:true,motionDescription:'The flange and curved spokes turn past the stationary actuator body.'});

export function getPerseveranceMobility(id){
  if(id==='mars.rover')return rover;
  if(/^percy-rover\.(?:left-rocker|right-rocker|left-bogie|right-bogie|differential)$/.test(id))return linkage;
  const match=/^percy-(?:rover|linkage)\.(fl|fr|rl|rr|ml|mr)$/.exec(id);
  if(match)return match[1].startsWith('m')?centerWheel:cornerWheel;
  if(/^percy-(?:corner|center)\.(?:drive|output|spokes)$/.test(id))return drive;
  return null;
}
