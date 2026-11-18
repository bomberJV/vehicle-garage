import {drawFrontBumperFittings,drawHeadlampWasher,drawParkingPilot,drawRearPlatePanel} from './g500-end-fittings.js';
import {radiatorGrille,moldedHeadlampPanel,wingFlare,wingIntake} from './g500-panel-shapes.js';
import {drawGutterRack} from './accessory-racks.js';
import {G500_FRONT,sideLighting,rearBumperLight,frontWingAndFog,rearCornerLamp,bumperSkin,lampRefs} from './g500-lamps.js';
import {drawH4,h4Components} from './g500-halogen-bulbs.js';
import {sleeve} from './mechanism-shapes.js';
import {reflectorBowl} from './road-lamp-optics.js';
import {glazingFace} from './surface-materials.js';
import {sideSheet,formedRoof,drawBodyMirror,wheelhouse,cargoDoor,rearJamb,g500BodyReferences} from './g500-body-closures.js';
import {drawFrontBumperBrackets,drawRearBumperBrackets,g500BumperParts,bumperRefs} from './g500-bumpers.js';
import {g500DashFittingParts,dashFittingsRef} from './g500-dash-fittings.js';
import {roofFrontLip} from './g500-roof-datums.js';
import {drawG500Bonnet,drawG500FrontDeck,drawG500Scuttle} from './g500-bonnet.js';
import {drawG500Cabin,drawG500DoorTrim,g500CabinSource} from './g500-cabin.js';
import {fittedWindow,starBadge} from './exterior-trim.js';
import {drawLettering,letteringWidth} from './badge-lettering.js';
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
    // Handle and hinges stay with the door: the door exhibit already
    // registers them as its own parts.
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
      r.box(-.744,Math.min(side*.20,side*.83),.575,-.40,Math.max(side*.20,side*.83),.595,tone(paint,.53));
      r.box(-.749,Math.min(side*.20,side*.823),.58,-.723,Math.max(side*.20,side*.823),1.19,tone(paint,.58));
    }
    r.box(-.749,-.20,.84,-.723,.20,1.19,tone(paint,.58));
    // Behind the bulkhead the floor stays open over the transfer case and the
    // steep ends of both propeller shafts.
    // The floor plate lies directly under the floor pan, above the exhaust and its shields.
    for(const side of [-1,1])r.box(-.40,Math.min(side*.31,side*.83),.575,.55,Math.max(side*.31,side*.83),.595,tone(paint,.53));
    // Under the center rear seat the plate opens for the battery well.
    for(const side of [-1,1])r.box(.55,Math.min(side*.18,side*.83),.575,.95,Math.max(side*.18,side*.83),.595,tone(paint,.53));
    r.box(.92,-.18,.575,.95,.18,.595,tone(paint,.53));
    // The floor steps up over the rear axle to the cargo floor, which sits on
    // the frame rails. Between the arches it stays clear of the tyres, and it
    // opens beside the spring and damper towers and behind each wheel, where
    // the filler neck and tank vent rise from the tank top.
    r.profile([[.95,.575],[.95,.595],[1.03,.735],[1.03,.705]],-.60,.60,tone(paint,.53));
    const cargo=tone(paint,.53),floor=(x0,x1,y0,y1)=>r.box(x0,y0,.705,x1,y1,.735,cargo);
    floor(1.03,1.95,-.38,.38);
    for(const side of [-1,1]){
      const y=a=>side*a,lo=a=>Math.min(y(a),y(.60)),hi=a=>Math.max(y(a),y(.60));
      floor(1.03,1.25,lo(.38),hi(.38));floor(1.60,1.83,lo(.38),hi(.38));
    }
    floor(1.95,2.047,-.83,.83);
    drawG500Cabin(r);
    for(const side of [-1,1]) {
      const y=side*width;
      // The wing side runs up to the fender-top deck, so no slit opens into the bay.
      r.tag('body.fender-'+(side<0?'left':'right'),()=>{lowerPanel(r,front,-.755,side,1.239,paint);drawG500FrontDeck(r,paint,side);});
      const hand0=side<0?'left':'right';
      r.tag('body.lower-quarter-'+hand0,()=>{
        lowerPanel(r,1.130,2.083,side,1.223,paint);
        // Quarter sheet under the diagonal hem meets the arch at the sill.
        sideSheet(r,[[.835,.538],[.958,.538],[1.025,.682],[1.130,.804],[1.130,.974]],side*width,side*(width-.044),paint);
      });
      // The pillars and sills stay in place when the closures pull away.
      r.box(-.748,y-.025,.505,.977,y+.025,.530,tone(paint,.79));
      r.rod([.234,side*.844,.54],[.225,side*.833,1.906],.019,tone(paint,.70),8);
      r.rod([1.125,side*.85,.969],[1.080,side*.834,1.905],.018,tone(paint,.76),8);
      r.rod([-.754,side*.865,1.205],[-.439,side*.831,1.918],.027,paint,9);
      // Black molding along the inner edge of each windshield pillar.
      r.tag('body.pillar-molding-'+(side<0?'left':'right'),()=>r.rod([-.776,side*.842,1.208],[-.461,side*.808,1.915],.0065,dark,6));
      r.tag('body.roof-rail-'+(side<0?'left':'right'),()=>r.rod([-.439,side*.831,1.913],[1.978,side*.831,1.913],.029,paint,9));
      const quarter=[[1.130,y,1.223],[1.088,side*.838,1.911],[1.957,side*.838,1.911],[1.998,side*.848,1.815],[2.084,y,1.223]];
      const aperture=[[1.194,side*.881,1.249],[1.137,side*.844,1.841],[1.905,side*.844,1.841],[1.930,side*.851,1.805],[2.008,side*.881,1.249]];
      r.tag('body.upper-quarter-'+(side<0?'left':'right'),()=>outlineRing(r,quarter,aperture,paint));

      r.tag('body.quarter-glass',()=>fittedWindow(r,aperture.map(([x,y,z])=>[x,y-side*.009,z]),{privacy:true,radius:.039}));
      // Non-moving front wing and rear quarter own their rub strips.
      const hand=side<0?'left':'right';
      r.tag('body.rub-strips',()=>r.instance(hand,()=>{for (const [x1,x2] of [[front+.025,-.757],[1.132,2.06]]) {
        r.box(x1,side*(width+.013)-.009,.975,x2,side*(width+.013)+.009,1.025,dark);
        r.box(x1+.008,side*(width+.013)-.006,1.026,x2-.008,side*(width+.013)+.006,1.032,bright);
      }}));
      for(const axle of axles){
        const at=(axle<0?'front-':'rear-')+hand;
        r.tag(axle<0?'body.fender-liner-'+hand:'body.wheelhouses',()=>r.instance(at,()=>wheelhouse(r,axle,side)));
        r.tag('body.wheel-flares',()=>r.instance(at,()=>wingFlare(r,axle,side,width,paint)));
      }
      r.tag('body.wing-intakes',()=>r.instance(hand,()=>wingIntake(r,side,width)));
      // Chrome "V8" script on each front wing, below the rub strip and just
      // ahead of the door, as on the photographed 2002 US trucks.
      r.tag('body.v8-badges',()=>r.instance(hand,()=>{const h=.030,span=letteringWidth('V8',h),x0=-.80-span/2;
       drawLettering(r,'V8',h,(u,v)=>[side<0?x0+u:x0+span-u,side*(width+.004),.885+v],{color:'#dfe4e3'});}));
      // Running board: a stainless pressing with a ribbed outboard face, black
      // rubber treads between its raised ribs and black end caps, as on the
      // photographed 2002 US trucks. Rib count and pitch are read from photos.
      const yy=(a,b)=>[Math.min(side*a,side*b),Math.max(side*a,side*b)];
      const board=(x0,x1,a,b,z0,z1,color)=>{const [y0,y1]=yy(a,b);r.box(x0,y0,z0,x1,y1,z1,color);};
      r.tag('body.running-boards',()=>r.instance(hand,()=>{
      board(-.930,.925,.861,.963,.452,.507,'#aab3b5');
      for(let j=-1;j<=1;j++)board(-.917,.912,.912+j*.033-.012,.912+j*.033+.012,.507,.513,'#272d2e');
      for(const z of [.462,.475,.488,.500])board(-.928,.923,.963,.967,z-.0035,z+.0035,'#d6dcdd');
      for(const [x0,x1] of [[-.943,-.930],[.925,.938]])board(x0,x1,.861,.963,.450,.509,'#2b3132');
      }));
      if(side===1) {
        r.tag('body.fuel-door-pocket',()=>r.box(1.777,.889,1.055,1.96,.897,1.204,tone(paint,.56)));
        r.tag('body.fuel-door',()=>r.box(1.785,.899,1.062,1.952,.904,1.197,paint));
      }
      sideLighting(r,side);
      rearCornerLamp(r,side);
    }
    rearJamb(r,paint);
    // The cowl supports the wipers independently of the movable bonnet and glass.
    r.tag('body.cowl',()=>drawG500Scuttle(r,paint));
    outlineRing(r,windscreenFrame,windscreenAperture,paint);
    const recess=windscreenAperture.map(([x,y,z])=>[x+.018,y,z-.004]);
    outlineRing(r,windscreenAperture,recess,tone(paint,.68));
    // The steel header turns back beneath the removable front roof lip.
    r.polygon([windscreenFrame[1],windscreenFrame[2],roofFrontLip,[roofFrontLip[0],-roofFrontLip[1],roofFrontLip[2]]],paint,false);
    r.tag('body.wipers',()=>{for(const y of [-.395,.374]) r.instance(y<0?'left':'right',()=>{
      r.rod([-.768,y-.118,1.358],[-.742,y+.157,1.417],.009,dark,8);
      r.rod([-.749,y+.002,1.401],[-.734,y+.278,1.434],.011,dark,8);
    });});
    r.tag('body.front-bumper',()=>{
      bumperSkin(r,{face:front-.116,back:front+.037,width:.923,low:.480,high:.685,span:.229,center:.598,lightZ:.553,lightHeight:.092,paint:tone(paint,.8),ends:['body.front-bumper-cap-left','body.front-bumper-cap-right']});
      drawFrontBumperFittings(r);
    });
    r.tag('body.front-bumper-brackets',()=>drawFrontBumperBrackets(r,front+.037));
    r.tag('body.rear-bumper',()=>{
      bumperSkin(r,{face:2.225,back:2.039,width:.926,low:.483,high:.680,span:.147,center:.641,lightZ:.552,lightHeight:.077,paint:tone(paint,.82),
        ends:['body.rear-bumper-end-left','body.rear-bumper-end-right'],caps:['body.rear-bumper-cap-left','body.rear-bumper-cap-right']});
      r.tag('body.rear-step-pad',()=>{for(const y of [-.662,.662])r.instance(y<0?'left':'right',()=>r.box(2.057,y-.17,.681,2.211,y+.17,.693,dark));});
      for(const y of [-.662,.662])rearBumperLight(r,Math.sign(y));
    });
    drawRearBumperBrackets(r,2.039);
    r.tag('body.rear-plate-panel',()=>drawRearPlatePanel(r));

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

// A lit H4 behind clear glass reads as bright silver-white, not cream.
const halogen={litBase:[150,156,158],litMax:[252,252,248],litCap:'#fbfaf2'};
function nose(r,paint) {
  r.rigid('nose-carrier',[0,0,0],()=>{
    r.tag('body.grille',()=>{
      radiatorGrille(r,front,paint);
      r.tag('body.grille-star',()=>starBadge(r,[front-.057,0,1.007],.132,'x',-1));
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
      r.tag('lighting.reflector',()=>reflectorBowl(r,(u,v,d)=>[front-d,y+u,1.001+v],.137,-.019,.073,r.lights,false,halogen));
      r.tag('lighting.h4-'+(side<0?'left':'right'),()=>{
        const fitted=(u,v,d)=>[front+.018-d/1000,y+u/1000,1.001+v/1000];
        for(const key of h4Components)drawH4(r,fitted,key,true);
      });
      r.tag('lighting.headlamp',()=>{
        // Photographed 2002 US trucks: a clear, smooth glass lens. The
        // reflector bowl and the H4 bulb read through it, lit or unlit.
        const glass=r.lights?'#eef2ee':'#c9d6da';
        const profile=(angle,radius)=>[front-.057-.016*(1-(radius/.132)**2),y+Math.cos(angle)*radius,1.001+Math.sin(angle)*radius];
        for(let j=0;j<4;j++)for(let i=0;i<36;i++){
          const a=i/36*Math.PI*2,b=(i+1)/36*Math.PI*2,lo=.132*j/4,hi=.132*(j+1)/4;
          const points=j?[profile(a,lo),profile(a,hi),profile(b,hi),profile(b,lo)]:[profile(0,0),profile(a,hi),profile(b,hi)];
          glazingFace(r,points,tone(glass,.96+.05*Math.sin(a)*(.35+j*.17)),.13);
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

const exteriorPlate=(label,slug)=>({label:'Mercedes-Benz Classic USA · 2002 G500 '+label,url:'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/'+slug});
const giantRef=(label,slug)=>({label:'MB Parts Giant · 2002 G500 '+label+' diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/'+slug});
const exteriorPlates={
  ...Object.fromEntries(g500BumperParts.map(([key,,,end])=>[key,bumperRefs[end]])),
  'licence-lamps':exteriorPlate('licence lamps','electrical--license-lamps'),
  'grille-star':giantRef('grille and components','grille-components'),
  ...Object.fromEntries(['rear-bench-back-left','rear-bench-back-right','rear-bench-cushion-left','rear-bench-cushion-right','rear-bench-pad-left','rear-bench-pad-right','rear-bench-headrests'].map(k=>[k,giantRef('rear seat components','rear-seat-components')])),
  ...Object.fromEntries(g500DashFittingParts.map(([key])=>[key,dashFittingsRef])),
  ...Object.fromEntries(['instrument-panel','cluster-trim','grab-handle'].map(k=>[k,giantRef('instrument panel','instrument-panel')])),
  ...Object.fromEntries(['center-console','console-trim-plate','shift-panel','shift-knob','console-lid'].map(k=>[k,giantRef('center console','center-console')])),
  'steering-wheel':exteriorPlate('steering wheel','steering--steering-wheel'),
  'selector-lever':exteriorPlate('gear shift control','automatic-transmission--gear-shift-control'),
  ...Object.fromEntries(['pillar-molding-left','pillar-molding-right'].map(k=>[k,giantRef('windshield reveal moldings','reveal-moldings')])),
  ...Object.fromEntries(['lower-quarter-left','lower-quarter-right','upper-quarter-left','upper-quarter-right','fuel-door','fuel-door-pocket'].map(k=>[k,giantRef('quarter panel and fuel door','fuel-door')])),
  ...Object.fromEntries(['roof-rail-left','roof-rail-right'].map(k=>[k,giantRef('roof and components','roof-components')])),
  ...Object.fromEntries(['spare-cover','spare-cap','spare-ring','spare-emblem'].map(k=>[k,giantRef('spare tire carrier and components','carrier-components-spare-tire')])),
  'rear-plate-panel':exteriorPlate('exterior trim · rear body','body--exterior-trim-rear-body'),
  'running-boards':exteriorPlate('rocker panel','body--rocker-panel'),
  'wheel-flares':exteriorPlate('exterior trim · fender','body--exterior-trim-fender'),
  'wheelhouses':exteriorPlate('splash shields','body--splash-shields'),
  'rub-strips':exteriorPlate('exterior trim · quarter panel','body--exterior-trim-quarter-panel'),
  'wing-intakes':exteriorPlate('fender and components','body--fender-and-components'),
  'v8-badges':exteriorPlate('decals and emblems','accessories--decals-and-emblems'),
  cowl:exteriorPlate('cowl','body--cowl'),
  wipers:exteriorPlate('wiper arm, blade and related components','wiper-and-washer--wiper-arm-blade-and-related-components'),
  ...Object.fromEntries(['mirror-left','mirror-right','mirror-glass-left','mirror-glass-right','mirror-gaskets'].map(k=>[k,giantRef('front door outside mirrors','outside-mirrors')])),
  ...Object.fromEntries(['fender-left','fender-right','fender-liner-left','fender-liner-right'].map(k=>[k,giantRef('fender and components','fender-components')]))
};
export const G500_BODY_PARTS = [
  ['structure','Body shell & cabin','The pillars, sills and fixed rear corner panels surround five door openings. Exterior proportions follow the W463 factory drawing and the 2002 US dimensions.'],
  ['front-seats','Front seats and head restraints','Each front seat has a separate cushion, bolstered back and adjustable head restraint. This black-leather interior follows an original first-year US G500.'],
  ['rear-bench','Rear bench seat frames','The two seat frames stand on the floor either side of the tunnel. The wider left section seats two.'],
  ['rear-bench-back-left','Rear seat back assembly, left · 463-920-50-04','The wide left backrest section folds over the left and middle places.'],
  ['rear-bench-back-right','Rear seat back assembly, right · 463-920-51-04','The right backrest section folds over the right place.'],
  ['rear-bench-cushion-left','Rear seat cushion cover, left · 463-920-35-46','The left cushion section covers the left and middle places; the middle cushion is thin over the battery well.'],
  ['rear-bench-cushion-right','Rear seat cushion cover, right · 463-920-36-46','The right cushion section covers the right place.'],
  ['rear-bench-pad-left','Rear seat back pad, left · 463-920-09-16','The upholstered backrest pads for the left and middle places.'],
  ['rear-bench-pad-right','Rear seat back pad, right · 463-920-08-16','The upholstered backrest pad for the right place.'],
  ['rear-bench-headrests','Rear head restraints · 463-970-14-50','Three head restraints stand above the divided backrest.'],
  ['rearview-mirror','Interior rearview mirror','A short stalk carries the mirror at the top center of the windshield. It stays with the cabin when the glazing is lifted.'],
  ['dashboard','Dashboard center stack and vents','The wood center stack frames COMAND and the climate panel. Three differential switches sit between the center vents.'],
  ['instrument-panel','Instrument panel · 463-680-41-87','The black padded upper panel runs the full width over the HVAC housing, the column and the control units.'],
  ['cluster-trim','Instrument cluster trim · 463-680-02-17','A binnacle hood covers the instrument cluster in front of the driver.'],
  ['grab-handle','Passenger grab handle · 463-680-03-70','The raised handle with a wood insert stands off the passenger side of the dash.'],
  ['steering-wheel','Steering wheel','The four-spoke wheel has wood sections in the rim. Its padded hub sits on the electrically adjustable column.'],
  ['center-console','Center console · 463-680-20-52','The console stands on the carpeted tunnel and houses the selector, transmission, restraint, yaw, transfer-case and rear SAM controllers.'],
  ['console-trim-plate','Console trim plate · 463-683-02-30','A wood trim plate covers the console top around the selector.'],
  ['shift-panel','Selector shift panel · 163-267-03-88','The gate plate on the console top guides the selector lever.'],
  ['selector-lever','Automatic selector lever','The chrome lever rises from the gate on the console.'],
  ['shift-knob','Selector knob · 463-278-08-20','The leather knob tops the selector lever.'],
  ['console-lid','Console armrest lid · 463-680-00-82','The leather lid closes the storage compartment and serves as the front armrest.'],
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
  ['spare','Spare wheel and tyre','The full-size spare wheel and tyre ride on the carrier hub behind the cover on the cargo door.'],
  ['grille','Radiator grille · 463-888-00-15','Seven vanes, painted like the surround, sit inside the grille opening. The star emblem stands ahead of the vanes, and the lower valance meets the bumper.'],
  ['rear-lights','Rear combination lamps','The two rectangular lamp clusters are mounted at the fixed rear corners above the bumper.'],
  ['fog-lamps','Front fog lamp trim','The black rectangular surrounds frame the two clear lenses low in the front bumper. Open a lamp to see the reflector, bulb and spring clip.'],
  ['rear-plate-panel','Rear licence-plate recess','A recessed surround in the rear body holds the US-size plate and its two lamps.'],
  ['running-boards','Running boards','Each side has a stainless pressing with a ribbed outer face, rubber treads between raised ribs and black end caps.'],
  ['wheel-flares','Wheel-arch flares','Four flares run around the wheel openings and stand out from the wing and quarter panels.'],
  ['wheelhouses','Rear wheel-arch liners','A dark liner closes each rear wheel arch between the flare and the inner body.'],
  ['fender-liner-left','Front fender liner, left · 463-884-17-22','The liner closes the left front wheel arch between the flare and the inner wing.'],
  ['fender-liner-right','Front fender liner, right · 463-884-13-22','The liner closes the right front wheel arch between the flare and the inner wing.'],
  ['fender-left','Front fender, left · 463-880-59-06','The flat-sided front wing runs from the headlamp to the door and is bolted to the body. Its top deck meets the hood.'],
  ['fender-right','Front fender, right · 463-880-64-06','The flat-sided front wing runs from the headlamp to the door and is bolted to the body. Its top deck meets the hood.'],
  ['rub-strips','Wing and quarter rub strips','Black protective strips with a bright insert run along the fixed front wings and rear quarters. Each door carries its own matching section.'],
  ['wing-intakes','Front-wing louvers','A trapezoidal louver sits on each front wing between the door hinge and the wheel arch.'],
  ['v8-badges','V8 wing scripts','A chrome V8 script sits on each front wing, below the rub strip and just ahead of the door.'],
  ['cowl','Cowl panel','The cowl panel spans the base of the windshield and carries the wipers, independent of the hood.'],
  ['wipers','Windshield wiper arms and blades','Two wiper arms park at the base of the windshield, each carrying a blade.'],
  ['mirror-left','Exterior mirror assembly, left · 463-810-39-16','The housing and arm stand on the front corner of the left door window frame.'],
  ['mirror-right','Exterior mirror assembly, right · 463-810-40-16','The housing and arm stand on the front corner of the right door window frame.'],
  ['mirror-glass-left','Mirror glass, left · 463-810-83-16','The flat glass sits in a black frame inside the housing.'],
  ['mirror-glass-right','Mirror glass, right · 463-810-82-16','The glass sits in a black frame inside the housing.'],
  ['mirror-gaskets','Mirror base gaskets · 463-811-00-96','A rubber gasket seals each mirror foot against the door skin.'],
  ['spare-cover','Spare-wheel cover · 463-890-73-08','The painted side wall rolls over a rounded shoulder around the spare tyre.'],
  ['spare-cap','Spare-cover face cap · 463-890-54-08','A shallow polished stainless dome closes the face of the cover.'],
  ['spare-ring','Spare-cover edge ring · 001-987-76-25','A bright ring trims the edge of the stainless face.'],
  ['spare-emblem','Spare-cover Mercedes-Benz emblem · 463-898-05-11','The star sits left of the Mercedes-Benz wordmark across the middle of the face.'],
  ['lower-quarter-left','Lower quarter panel, left · 463-637-23-09','The lower rear quarter runs from the diagonal door hem back over the rear wheel to the corner.'],
  ['lower-quarter-right','Lower quarter panel, right · 463-637-24-09','The lower rear quarter runs from the diagonal door hem back over the rear wheel to the corner.'],
  ['upper-quarter-left','Upper quarter panel, left · 463-637-06-03','The upper quarter frames the fixed rear side window up to the roof rail.'],
  ['upper-quarter-right','Upper quarter panel, right · 463-637-07-03','The upper quarter frames the fixed rear side window up to the roof rail.'],
  ['roof-rail-left','Roof rail, left · 463-630-27-35','The side roof rail runs from the windshield pillar to the rear corner above the doors.'],
  ['roof-rail-right','Roof rail, right · 463-630-28-35','The side roof rail runs from the windshield pillar to the rear corner above the doors.'],
  ['fuel-door','Fuel door · 463-750-01-03','The painted flap on the right rear quarter covers the filler.'],
  ['fuel-door-pocket','Fuel-filler pocket · 463-630-00-67','The recessed pocket behind the flap surrounds the filler neck.'],
  ['pillar-molding-left','Windshield pillar molding, left · 463-698-01-30','A black molding runs along the inner edge of the left windshield pillar.'],
  ['pillar-molding-right','Windshield pillar molding, right · 463-698-02-30','A black molding runs along the inner edge of the right windshield pillar.'],
  ['grille-star','Grille star emblem · 601-817-01-16','The large three-pointed star stands ahead of the grille vanes on its backing plate.'],
  ['licence-lamps','Licence-plate lamps','Two small lamps in the top edge of the plate recess light the plate.'],
  ...g500BumperParts.map(([key,name,description])=>[key,name,description]),
  ...g500DashFittingParts
].map(([key,name,description])=>({id:'body.'+key,name,description,source:['front-seats','rear-bench','dashboard','rearview-mirror'].includes(key)?g500CabinSource:g500BodyReferences[key]||g500BodyReferences.structure,...(exteriorPlates[key]?{source:exteriorPlates[key]}:{}),...(key==='fog-lamps'?{source:lampRefs.fog}:key==='rear-lights'?{source:lampRefs.manual}:key==='grille'?{source:giantRef('grille and components','grille-components')}:{})}));
