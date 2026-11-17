import {drawFrontBumperFittings,drawHeadlampWasher,drawParkingPilot,drawRearPlatePanel} from './g500-end-fittings.js';
import {radiatorGrille,moldedHeadlampPanel,wingFlare,wingIntake} from './g500-panel-shapes.js';
import {drawGutterRack} from './accessory-racks.js';
import {G500_FRONT,sideLighting,rearBumperLight,frontWingAndFog,rearCornerLamp,bumperSkin,lampRefs} from './g500-lamps.js';
import {drawH4,h4Components} from './g500-halogen-bulbs.js';
import {sleeve} from './mechanism-shapes.js';
import {reflectorBowl} from './road-lamp-optics.js';
import {glazingFace} from './surface-materials.js';
import {sideSheet,formedRoof,drawBodyMirror,wheelhouse,cargoDoor,rearJamb,g500BodyReferences} from './g500-body-closures.js';
import {roofFrontLip} from './g500-roof-datums.js';
import {drawG500Bonnet,drawG500FrontDeck,drawG500Scuttle} from './g500-bonnet.js';
import {drawG500Cabin,drawG500DoorTrim,g500CabinSource} from './g500-cabin.js';
import {fittedWindow,starBadge} from './exterior-trim.js';
/* Early W463 long-wheelbase body. Longitudinal X increases toward the rear.
   Physical panel mounts are independent of their selectable component tags. */
const dark = '#242a2c';
const bright = '#b5bec0';
const front = G500_FRONT;
const width = .887;
const axles = [-1.425, 1.425];

function tone(hex, factor) {
  const channel = i => Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*factor)).toString(16).padStart(2,'0');
  return '#' + [1,3,5].map(channel).join('');
}

function sillHeight(x) {
  const nearest = Math.min(...axles.map(axle => Math.abs(axle - x)));
  return nearest < .458 ? Math.max(.566,.427+Math.sqrt(.458**2-nearest**2)) : .566;
}

function archCuts(a,b) {
  const cuts = [a,b];
  for (const axle of axles) {
    for (let i=0;i<=30;i++) {
      const x=axle+.458*Math.cos(i*Math.PI/30);
      if (x>a && x<b) cuts.push(x);
    }
  }
  return cuts.sort((x,y)=>x-y);
}

// Sheet with an inner face, a bottom return following the actual cutout, and
// folded ends. Every strip is convex; the concave wheel arch never uses a fan.
function lowerPanel(r, a, b, side, top, paint, inner=width-.044) {
  const cuts=archCuts(a,b), outer=side*width, inside=side*inner;
  const outsideColor=tone(paint,side<0?.87:.96), insideColor=tone(paint,.61);
  for (let i=1;i<cuts.length;i++) {
    const x=cuts[i-1], next=cuts[i], z=sillHeight(x), nextZ=sillHeight(next);
    for (const [y,color] of [[outer,outsideColor],[inside,insideColor]]) {
      r.polygon([[x,y,z],[next,y,nextZ],[next,y,top],[x,y,top]],color,false);
    }
    r.polygon([[x,outer,z],[next,outer,nextZ],[next,inside,nextZ],[x,inside,z]],tone(paint,.48),false);
  }
  for (const x of [a,b]) r.polygon([[x,outer,sillHeight(x)],[x,inside,sillHeight(x)],[x,inside,top],[x,outer,top]],insideColor,false);
  r.polygon([[a,outer,top],[b,outer,top],[b,inside,top],[a,inside,top]],tone(paint,1.06),false);
}

function outlineRing(r,outer,inner,color) {
  for (let i=0;i<outer.length;i++) {
    const j=(i+1)%outer.length;
    r.polygon([outer[i],outer[j],inner[j],inner[i]],color,false);
  }
}

function roadDoor(r,side,isFront,paint) {
  const left=side<0;
  const name=(left?'left':'right')+(isFront?'-front':'-rear');
  const id=isFront?(left?'body.door':'body.front-right'):(left?'body.rear-left':'body.rear-right');
  const a=isFront?-.747:.259, b=isFront?.217:1.117;
  const map=([x,z])=>[x,side*(width-.074*(z-1.22)),z];
  const outer=(isFront?[[a,1.18],[-.451,1.891],[b,1.891],[b,1.18]]:[[a,1.18],[a-.026,1.891],[b-.047,1.891],[b,1.18]]).map(map);
  const inner=(isFront?[[-.683,1.239],[-.423,1.843],[.165,1.843],[.154,1.239]]:[[.287,1.239],[.287,1.843],[1.003,1.843],[1.050,1.239]]).map(map);
  r.rigid(name,[isFront?-.085:.11,side*(isFront?.63:.52),isFront?.022:.09],()=>r.tag(id,()=>{
    // The rear door hem runs diagonally in front of the axle flare.
    const hem=isFront?[[a,.54],[b,.54],[b,1.18],[a,1.18]]:[[a,.54],[.821,.54],[b,.98],[b,1.18],[a,1.18]];
    sideSheet(r,hem,side*width,side*(width-.044),paint);
    outlineRing(r,outer,inner,paint);
    const insideY=point=>point.map((v,i)=>i===1?v-side*.041:v);
    outlineRing(r,outer.map(insideY),inner.map(insideY),tone(paint,.67));
    outlineRing(r,outer,outer.map(insideY),tone(paint,.74));
    outlineRing(r,inner,inner.map(insideY),tone(paint,.60));

    r.tag('body.glass',()=>fittedWindow(r,inner.map(p=>[p[0],p[1]-side*.009,p[2]]),{privacy:!isFront,radius:.041}));
    const y=side*(width+.014);
    r.box(a+.008,y-.011,.975,b-.008,y+.011,1.025,dark);
    r.box(a+.016,y-.006,1.026,b-.016,y+.006,1.032,bright);
    const handle=b-.134;
    // The pushbutton and black bow interrupt the longitudinal rub strip.
    r.box(handle-.081,y-.015,.972,handle+.092,y+.015,1.027,dark);
    r.rod([handle-.060,y+side*.023,1.017],[handle+.042,y+side*.023,1.017],.012,'#4a5051',8);
    r.rod([handle+.072,y+side*.014,.999],[handle+.072,y+side*.024,.999],.012,bright,10);
    for(const z of [.726,1.103]) {
      r.box(a-.006,y-.013,z-.023,a+.044,y+.013,z+.023,tone(paint,.9));
      r.rod([a+.009,y+side*.014,z-.027],[a+.009,y+side*.014,z+.028],.009,tone(paint,1.15),8);
    }
    drawG500DoorTrim(r,side,a,b,isFront);
    if(isFront)drawBodyMirror(r,side,paint);
  }));
}

function bodyShell(r,paint) {
  r.rigid('body-shell',[0,0,0],()=>r.tag('body.structure',()=>{
    // The floor and the bulkhead open around the transmission, which sits
    // under the tunnel pressing between the footwells.
    for(const side of [-1,1]){
      r.box(-.744,Math.min(side*.20,side*.83),.545,-.40,Math.max(side*.20,side*.83),.575,tone(paint,.53));
      r.box(-.749,Math.min(side*.20,side*.823),.58,-.723,Math.max(side*.20,side*.823),1.19,tone(paint,.58));
    }
    r.box(-.40,-.83,.545,2.05,.83,.575,tone(paint,.53));
    r.box(-.749,-.20,.84,-.723,.20,1.19,tone(paint,.58));
    drawG500Cabin(r);
    for(const side of [-1,1]) {
      const y=side*width;
      lowerPanel(r,front,-.755,side,1.206,paint);
      lowerPanel(r,1.130,2.083,side,1.223,paint);
      // Quarter sheet under the diagonal hem meets the arch at the sill.
      sideSheet(r,[[.835,.538],[.958,.538],[1.025,.682],[1.130,.804],[1.130,.974]],side*width,side*(width-.044),paint);
      drawG500FrontDeck(r,paint,side);
      // The pillars and sills stay in place when the closures pull away.
      r.box(-.748,y-.025,.505,.977,y+.025,.530,tone(paint,.79));
      r.rod([.234,side*.844,.54],[.225,side*.833,1.906],.019,tone(paint,.70),8);
      r.rod([1.125,side*.85,.969],[1.080,side*.834,1.905],.018,tone(paint,.76),8);
      r.rod([-.754,side*.865,1.205],[-.439,side*.831,1.918],.027,paint,9);
      r.rod([-.439,side*.831,1.913],[1.978,side*.831,1.913],.029,paint,9);
      const quarter=[[1.130,y,1.223],[1.088,side*.838,1.911],[1.957,side*.838,1.911],[1.998,side*.848,1.815],[2.084,y,1.223]];
      const aperture=[[1.194,side*.881,1.249],[1.137,side*.844,1.841],[1.905,side*.844,1.841],[1.930,side*.851,1.805],[2.008,side*.881,1.249]];
      outlineRing(r,quarter,aperture,paint);

      r.tag('body.quarter-glass',()=>fittedWindow(r,aperture.map(([x,y,z])=>[x,y-side*.009,z]),{privacy:true,radius:.039}));
      // Non-moving front wing and rear quarter own their rub strips.
      for (const [x1,x2] of [[front+.025,-.757],[1.132,2.06]]) {
        r.box(x1,side*(width+.013)-.009,.975,x2,side*(width+.013)+.009,1.025,dark);
        r.box(x1+.008,side*(width+.013)-.006,1.026,x2-.008,side*(width+.013)+.006,1.032,bright);
      }
      for(const axle of axles){wheelhouse(r,axle,side);wingFlare(r,axle,side,width,paint);}
      wingIntake(r,side,width);
      r.box(-.943,side*.912-.051,.47,.938,side*.912+.051,.507,'#6f7778');
      for (let j=-1;j<=1;j++) r.box(-.917,side*.912+j*.035-.008,.508,.915,side*.912+j*.035+.008,.515,bright);
      if(side===1) {
        r.box(1.777,.889,1.055,1.96,.897,1.204,tone(paint,.56));
        r.box(1.785,.899,1.062,1.952,.904,1.197,paint);
      }
      sideLighting(r,side);
      rearCornerLamp(r,side);
    }
    rearJamb(r,paint);
    // The cowl supports the wipers independently of the movable bonnet and glass.
    drawG500Scuttle(r,paint);
    outlineRing(r,windscreenFrame,windscreenAperture,paint);
    const recess=windscreenAperture.map(([x,y,z])=>[x+.018,y,z-.004]);
    outlineRing(r,windscreenAperture,recess,tone(paint,.68));
    // The steel header turns back beneath the removable front roof lip.
    r.polygon([windscreenFrame[1],windscreenFrame[2],roofFrontLip,[roofFrontLip[0],-roofFrontLip[1],roofFrontLip[2]]],paint,false);
    for(const y of [-.395,.374]) {
      r.rod([-.768,y-.118,1.358],[-.742,y+.157,1.417],.009,dark,8);
      r.rod([-.749,y+.002,1.401],[-.734,y+.278,1.434],.011,dark,8);
    }
    bumperSkin(r,{face:front-.116,back:front+.037,width:.923,low:.480,high:.685,span:.229,center:.598,lightZ:.553,lightHeight:.092,paint:tone(paint,.8)});
    drawFrontBumperFittings(r);
    bumperSkin(r,{face:2.225,back:2.039,width:.926,low:.483,high:.680,span:.147,center:.641,lightZ:.552,lightHeight:.077,paint:tone(paint,.82)});
    for(const y of [-.662,.662]){
      r.box(2.057,y-.17,.681,2.211,y+.17,.693,dark);
      rearBumperLight(r,Math.sign(y));
    }
    drawRearPlatePanel(r);

  }));
}

function roofAndHood(r,paint,selected) {
  r.rigid('roof',[0,0,.50],()=>r.tag('body.roof',()=>{
    formedRoof(r,paint);
    drawGutterRack(r,selected,1.936);
  }));
  r.rigid('bonnet',[-.32,0,.42],()=>r.tag('body.hood',()=>drawG500Bonnet(r,paint)));
}

// The fixed metal frame and the moving glass share the same opening.
const windscreenFrame=[[-.793,-.864,1.264],[-.439,-.832,1.917],[-.439,.832,1.917],[-.793,.864,1.264]];
const windscreenAperture=[[-.753,-.799,1.347],[-.468,-.785,1.862],[-.468,.785,1.862],[-.753,.799,1.347]];

function endGlassAndCargoDoor(r,paint) {
  r.rigid('windshield',[0,0,.43],()=>r.tag('body.windshield',()=>{
    fittedWindow(r,windscreenAperture,{radius:.036,seal:.012});
  }));
  r.rigid('cargo-door',[.60,0,.041],()=>r.tag('body.tailgate',()=>cargoDoor(r,paint)));

}

function nose(r,paint) {
  r.rigid('nose-carrier',[0,0,0],()=>{
    r.tag('body.grille',()=>{
      radiatorGrille(r,front,paint);
      starBadge(r,[front-.057,0,1.007],.132,'x',-1);
    });
    for(const side of [-1,1]) {
      const y=side*.674;
      r.tag('lighting.housing',()=>{
        moldedHeadlampPanel(r,front,side,paint);
        sleeve(r,[front,y,1.001],[1,0,0],-.047,.039,.157,.137,'#525958',36);
        for(let i=0;i<40;i++){
          const at=(a,rad)=>[front-.051,y+rad*Math.cos(a),1.001+rad*Math.sin(a)],a=i*Math.PI/20,b=(i+1)*Math.PI/20;
          r.polygon([at(a,.137),at(a,.152),at(b,.152),at(b,.137)],tone(bright,.84+.17*Math.sin(a)),false);
        }
      });
      r.tag('lighting.reflector',()=>reflectorBowl(r,(u,v,d)=>[front-d,y+u,1.001+v],.137,-.019,.073,r.lights,false));
      r.tag('lighting.h4-'+(side<0?'left':'right'),()=>{
        const fitted=(u,v,d)=>[front+.018-d/1000,y+u/1000,1.001+v/1000];
        for(const key of h4Components)drawH4(r,fitted,key,true);
      });
      r.tag('lighting.headlamp',()=>{
        const glass=r.lights?'#d6dbce':'#91a5aa';
        const profile=(angle,radius)=>[front-.057-.016*(1-(radius/.132)**2),y+Math.cos(angle)*radius,1.001+Math.sin(angle)*radius];
        for(let j=0;j<4;j++)for(let i=0;i<36;i++){
          const a=i/36*Math.PI*2,b=(i+1)/36*Math.PI*2,lo=.132*j/4,hi=.132*(j+1)/4;
          const points=j?[profile(a,lo),profile(a,hi),profile(b,hi),profile(b,lo)]:[profile(0,0),profile(a,hi),profile(b,hi)];
          glazingFace(r,points,tone(glass,.93+.075*Math.sin(a)*(.35+j*.17)),.26);
        }
        for(let i=-5;i<=5;i++){
          const h=i*.021,half=Math.sqrt(.124**2-h**2);
          for(let n=0;n<4;n++){
            const pt=v=>{const k=half*v;return [front-.058-.016*(1-(h*h+k*k)/(.132**2)),y+h,1.001+k];};
            r.rod(pt(n*.5-1),pt((n+1)*.5-1),.00115,r.lights?'#d2d4c7':'#a6b6b5',5);
          }
        }
      });
      drawHeadlampWasher(r,side);
      drawParkingPilot(r,side);
      frontWingAndFog(r,side);
    }
  });
}

export function buildG500Exterior(r,paint,selected=[]) {
  bodyShell(r,paint);
  roofAndHood(r,paint,selected);
  endGlassAndCargoDoor(r,paint);
  nose(r,paint);
  for(const side of [-1,1]) {
    roadDoor(r,side,true,paint);
    roadDoor(r,side,false,paint);
  }
}

export const G500_BODY_PARTS = [
  ['structure','Body shell & cabin','The pillars, sills and fixed rear corner panels surround five door openings. Exterior proportions follow the W463 factory drawing and the 2002 US dimensions.'],
  ['front-seats','Front seats and head restraints','Each front seat has a separate cushion, bolstered back and adjustable head restraint. This black-leather interior follows an original first-year US G500.'],
  ['rear-bench','Split rear bench','Three head restraints stand above the divided backrest. The wider bench section sits on the left.'],
  ['rearview-mirror','Interior rearview mirror','A short stalk carries the mirror at the top center of the windshield. It stays with the cabin when the glazing is lifted.'],
  ['dashboard','Dashboard and center console','The left-hand-drive cluster sits behind the four-spoke wheel. Three differential switches sit between the center vents. A separate grab handle stands off the passenger dash.'],
  ['hood','Hood','Two pairs of stamped creases run back from the badge to the windshield. Open the hood to inspect its vent grille, seal, insulation, braces and catch.'],
  ['door','Left front door','Outer and inner skins, window frame, mirror, handle and hinge leaves move together.'],
  ['front-right','Right front door','The front passenger door carries its mirror, window sash, rub strip and inner trim.'],
  ['rear-left','Left rear door','The angled lower hem clears the rear wheel flare. Both hinge leaves, the rub strip and the handle move with the door.'],
  ['rear-right','Right rear door','The rear passenger door separates from the B-pillar and wheel opening as one unit.'],
  ['glass','Door glass','The four side-door panes and cargo-door window follow their own door frames when the body is expanded.'],
  ['windshield','Windshield','The windshield and its rubber surround lift together from the steel frame. The wiper arms remain on the cowl.'],
  ['quarter-glass','Rear quarter windows','The cargo-area side windows sit in fixed apertures behind the rear passenger doors.'],
  ['roof','Roof & rain gutters','The pressed roof skin, six rear reinforcing ribs and gutters lift above the door frames.'],
  ['tailgate','Side-hinged cargo door','Two hinges on the left carry the narrow door. Its pushbutton handle is on the right. The glass, overhead wiper and spare move with the door.'],
  ['spare','Spare-wheel cover & carrier','A painted cover and bright surround enclose the spare wheel on the cargo door.'],
  ['grille','Radiator grille','Seven bright-edged vanes sit inside the painted surround. The star stands ahead of the vanes, and the lower valance meets the bumper.'],
  ['rear-lights','Rear combination lamps','The two rectangular lamp clusters are mounted at the fixed rear corners above the bumper.'],
  ['fog-lamps','Front fog lamp trim','The black rectangular surrounds frame the two clear lenses low in the front bumper. Open a lamp to see the reflector, bulb and spring clip.']
].map(([key,name,description])=>({id:'body.'+key,name,description,source:['front-seats','rear-bench','dashboard','rearview-mirror'].includes(key)?g500CabinSource:g500BodyReferences[key]||g500BodyReferences.structure,...(key==='fog-lamps'?{source:lampRefs.fog}:key==='rear-lights'?{source:lampRefs.manual}:key==='grille'?{source:{label:'Mercedes-Benz Classic · 2002 G500 grille plate',url:'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/body--grille-and-components'}}:{})}));
