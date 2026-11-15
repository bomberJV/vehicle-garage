// Model-series 231 workshop introduction: P00.10-5105-00 for the raised profile,
// P77.30-2536-00 and P77.39-2325-00 for the folding sequence. Hard panels stay
// rigid in motion. Intermediate joint positions and concealed pipe routes are fitted.
import {slDeckCrown} from './sl550-exterior.js';
import {glazingFace} from './surface-materials.js';
import {barrel,pipe,tint} from './road-primitives.js';
import {part,study} from './mechanism-shapes.js';

const manual='https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf#page=109';
const training='https://www.manualslib.de/manual/89970/Mercedes-Benz-Typenreihe-231.html?page=';
const parts='https://classicparts.mbusa.com/v-2014-mercedes-benz-sl550--base--4-7l-v8-gas/';
const ref=(label,url)=>({label,url});
const refs={
  photo:ref('Mercedes-Benz USA · SL550 Sport roof and exterior trim, pp. 7 and 12','https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf#page=7'),
  shelf:ref('Mercedes-Benz USA · open luggage lid and rear shelf, pp. 12 and 19','https://ragtop.org/mbbrochures/2014/usa/2014-SL-Class.pdf#page=12'),
  outline:ref('Mercedes-Benz · SL side and plan drawings',training+'21'),
  sequence:ref('Mercedes-Benz · eight vario-roof positions',training+'27'),
  switches:ref('Mercedes-Benz · roof positions and limit switches',training+'28'),
  glass:ref('Mercedes-Benz · MAGIC SKY CONTROL glazing',training+'29'),
  manual:ref('Mercedes-Benz USA · powered wind screen and roof glass',manual),
  fittings:ref('Mercedes-Benz · 2014 hardtop parts diagram',parts+'body--top-and-components'),
  liner:ref('Mercedes-Benz · trunk-lid trim and retainers',parts+'body--interior-trim-trunk'),
  hydraulics:ref('Mercedes-Benz · roof cylinders, pump and switches',parts+'electrical--convertible-top')
};
const graphite='#292e32',rubber='#202428',nickel='#a4aaad',alloy='#6c767d';
const minmax=n=>Math.max(0,Math.min(1,n));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=(a,b,t)=>{const n=minmax((t-a)/(b-a));return n*n*(3-2*n);};
const blend=(p,q,t)=>p.map((a,i)=>mix(a,q[i],t));
function pivot([x,y,z],cx,cz,a){
  const dx=x-cx,dz=z-cz,co=Math.cos(a),si=Math.sin(a);
  return [cx+co*dx-si*dz,y,cz+si*dx+co*dz];
}
export function slDeckPoint(point,fraction=0){
  const swing=ease(.07,.31,fraction)*(1-ease(.77,.98,fraction));
  return pivot(point,2.18,.89,-1.08*swing);
}
function anchors(t){
  const lift=ease(.28,.52,t),slide=ease(.37,.75,t),lower=ease(.51,.77,t);
  return {x:1.003*slide,z:.265*lift-.761*lower,angle:.109*lift*(1-lower)-.035*lower};
}
function shellPose(p,t){
  const k=anchors(t),v=pivot(p,.49,1.30,k.angle);
  return [v[0]+k.x,v[1],v[2]+k.z];
}
function backlightPose(p,t){
  const lift=ease(.28,.52,t),lower=ease(.48,.77,t),s=ease(.28,.66,t);
  const v=pivot(p,1.115,1.145,.405*s);
  return [v[0]+.48*ease(.37,.75,t),v[1],v[2]+.25*lift-.766*lower];
}
const us=[-1,-.72,-.38,0,.38,.72,1];
// Bilinear strips across the fitted surface. Clear apertures have a single optical
// surface; each painted border shares its geometric edge with the adjacent pane.
function band(r,point,a,b,from,to,paint,opacity){
  const u=us.map(x=>mix(from,to,(x+1)*.5));
  for(let j=1;j<u.length;j++){
    const q=[point(a,u[j-1]),point(b,u[j-1]),point(b,u[j]),point(a,u[j])];
    if(opacity!==undefined)glazingFace(r,q,paint,opacity);
    else r.polygon(q,paint,false);
  }
}
function bordered(r,point,t0,t1,edge,paint,lens,alpha){
  const rows=[0,t0,(t0+t1)/2,t1,1],u=[-1,-edge,edge,1];
  for(let i=1;i<rows.length;i++)for(let j=1;j<u.length;j++){
    const glass=i>1&&i<4&&j===2;
    band(r,point,rows[i-1],rows[i],u[j-1],u[j],glass?lens:paint,glass?alpha:undefined);
  }
}
function windshield(v,u){
  const x=mix(-.686+.146*u*u,.076+.066*u*u,v),width=mix(.755,.622,v);
  return [x,u*width,mix(.925-.007*u*u,1.287-.018*u*u,v)+.022*Math.sin(Math.PI*v)];
}
export {windshield as slWindshieldPoint};
// The SL550 Sport photograph on page 7 of the US brochure distinguishes the
// painted outer frame from the black ceramic glass border. Page 25 shows the
// depth of the fixed header even with the entire hardtop stowed.
function fixedGlass(r,paint){
  const rows=[0,.081,.255,.484,.718,.896,.951,1];
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i];
    if(a===0||a>=.896)band(r,windshield,a,b,-.94,.94,a>=.951?paint:graphite);
    else band(r,windshield,a,b,-.94,.94,'#7f969c',.205);
    for(const s of [-1,1]){
      band(r,windshield,a,b,s*.94,s*.961,graphite);
      band(r,windshield,a,b,s*.961,s,paint);
    }
  }
  for(const s of [-1,1]){
    // A wraparound painted pressing, weather seal and thicker cabin garnish.
    const section=v=>{
      const [x,y,z]=windshield(v,s),root=1-ease(0,.36,v);
      return [[x,y,z],[x+.009,y+s*(.013+.014*root),z-.002],
        [x+.047+root*.033,y+s*(.016+root*.018),z-.015],
        [x+.061+root*.029,y+s*.009,z-.025],
        [x+.052,y-s*.007,z-.043],[x+.015,y-s*.034,z-.033]];
    };
    for(let i=1;i<rows.length;i++){
      const lo=section(rows[i-1]),hi=section(rows[i]);
      const colors=[tint(paint,1.06),paint,tint(paint,.83),rubber,'#474747',graphite];
      for(let j=0;j<lo.length;j++){
        const k=(j+1)%lo.length;r.polygon([lo[j],hi[j],hi[k],lo[k]],colors[j],false);
      }
      if(i===1)r.polygon(lo,graphite,false);
      if(i===rows.length-1)r.polygon(hi,paint,false);
    }
  }
  const inner=(v,u)=>{const [x,y,z]=windshield(v,u);return [x+.029,y,z-.036];};
  band(r,inner,.896,1,-.991,.991,'#373538');
  for(let j=1;j<us.length;j++){
    const u=us[j-1],w=us[j];
    r.polygon([windshield(1,u),windshield(1,w),inner(1,w),inner(1,u)],rubber,false);
    r.polygon([windshield(.896,u),windshield(.896,w),inner(.896,w),inner(.896,u)],graphite,false);
  }
}
const roofX=(v,u)=>mix(.076+.066*u*u,.856-.036*u*u,v);
function roof(v,u){
  const x=roofX(v,u),f=(x-.076)/.78;
  return [x,u*(.622+.012*Math.sin(Math.PI*v)-.018*v),
    1.287+.03397*Math.sin(Math.PI*f)-.042*Math.pow(f,3)
      +.039*ease(.54,1,f)*(1-u*u)-u*u*(.018+.016*v)];
}
const roofRows=[0,.040,.073,.19,.34,.50,.66,.81,.92,.953,1];
// The perimeter seal follows the radiused corners of the inset pane. The
// painted rail widens over the rear of the window, where it meets the C-pillar.
function glassWidth(v){
  const ends=Math.max(0,(.19-v)/.15,(v-.81)/.143);
  return .881-.042*v-.088*ends*ends;
}
function lidFrame(r,paint,t){
  const p=(v,u)=>shellPose(roof(v,u),t);
  for(let i=1;i<roofRows.length;i++){
    const a=roofRows[i-1],b=roofRows[i];
    if(a<.04||b>.953)band(r,p,a,b,-1,1,paint);
    else for(const s of [-1,1]){
      const width=(v,k)=>s*mix(glassWidth(v),1,k);
      for(const [lo,hi,color] of [[0,.13,rubber],[.13,.27,tint(paint,.90)],[.27,.77,paint],[.77,1,tint(paint,.94)]]){
        r.polygon([p(a,width(a,lo)),p(b,width(b,lo)),p(b,width(b,hi)),p(a,width(a,hi))],color,false);
      }
    }
    for(const s of [-1,1]){
      const edge=v=>{
        const q=roof(v,s),x=q[0],y=q[1],z=q[2],rear=ease(.56,.98,v);
        return [q,[x,y+s*.010,z-.009],[x,y+s*.013,z-.025-rear*.017],
          [x,y+s*.004,z-.038-rear*.018],[x,y-s*.017,z-.043-rear*.018]];
      };
      const near=edge(a),far=edge(b),colors=[paint,tint(paint,.83),rubber,'#424449'];
      for(let j=0;j<colors.length;j++)r.polygon([near[j],far[j],far[j+1],near[j+1]].map(q=>shellPose(q,t)),colors[j],false);
    }
  }
}
function skyPane(r,t,clear){
  const pane=(v,u)=>shellPose(roof(v,u*glassWidth(v)),t);
  const rows=roofRows.slice(1,-1);
  for(let i=1;i<rows.length;i++)band(r,pane,rows[i-1],rows[i],-1,1,clear?'#75949d':'#1a2731',clear?.22:.93);
}
function backlight(v,u){
  const x=mix(.856-.036*u*u,1.505-.105*u*u,v);
  return [x,u*mix(.604,.662,v),mix(roof(1,u)[2],1.034-.059*u*u,v)+(.021+.018*(1-u*u))*Math.sin(Math.PI*v)];
}
function rearPane(r,t){
  const p=(v,u)=>backlightPose(backlight(v,u),t);
  bordered(r,p,.032,.957,.897,graphite,'#73959f',.31);
  const conductor=(v,u)=>{const q=backlight(v,u);q[2]+=.00075;return backlightPose(q,t);};
  for(const v of [.23,.42,.61,.8])band(r,conductor,v,v+.0017,-.86,.86,'#687f84');
}
function pillarPoint(p,t){
  // C-pillars pivot past vertical while the glazing remains beneath the top panel.
  const co=ease(.28,.75,t);
  const top=shellPose(roof(1,1),t),swivel=-2.68*co;
  const v=pivot(p,.820,roof(1,1)[2],swivel);
  return [v[0]+top[0]-.82,v[1],v[2]+top[2]-roof(1,1)[2]];
}
function pillars(r,t,paint){
  // The outer edge of each pillar is the curved edge of the rear window.
  // A single flat cheek joining the window's two ends leaves a daylight gap.
  const stations=[0,.15,.32,.46,.60,.72,.85,.96,1];
  for(const s of [-1,1]){
    const rows=stations.map(v=>{
      const glass=backlight(v,s),window=[mix(.72,1.156,v)-.032*Math.sin(Math.PI*v),
        s*(mix(.634,.720,v)+.003*Math.sin(Math.PI*v)),mix(1.224,.958,v)+.017*Math.sin(Math.PI*v)];
      const crown=blend(glass,window,.42);crown[1]+=s*.006;crown[2]+=.003;
      const lining=[window[0],window[1]-s*.021,window[2]-.006],
        inboard=[glass[0],glass[1]-s*.020,glass[2]-.010];
      return [glass,crown,window,lining,inboard];
    });
    for(let i=1;i<rows.length;i++){
      const a=rows[i-1],b=rows[i];
      for(const [j,color] of [tint(paint,1.02),tint(paint,.94),rubber,graphite,graphite].entries()){
        const k=(j+1)%a.length;
        r.polygon([a[j],b[j],b[k],a[k]].map(q=>pillarPoint(q,t)),color,false);
      }
    }
    for(const end of [rows[0],rows.at(-1)])r.polygon(end.map(q=>pillarPoint(q,t)),graphite,false);
  }
}
function sideGlass(r,side,t,rear){
  // The top edges trace the rubber channels on the windshield, roof and
  // C-pillar. The glass rotates gently outboard into its door or quarter pocket.
  const amount=ease(0,.22,t),angle=.27*amount,co=Math.cos(angle),si=Math.sin(angle);
  const retract=([x,w,z])=>[x,side*(.736+(w-.736)*co+(z-.93)*si),.93-(w-.736)*si+(z-.93)*co-.448*amount];
  const bottomFront=[-.476,.766,.926],bottomDivide=[.68,.738,.949],bottomRear=[1.17,.718,.965];
  const frontTop=[.187,.627,1.248],topDivide=[.724,.636,1.209];
  const contour=rear?[bottomDivide,bottomRear,[1.10,.707,.999],[.911,.668,1.10],topDivide]:
    [bottomFront,bottomDivide,topDivide,[.642,.635,1.242],[.552,.635,1.261],[.398,.632,1.272],frontTop,
      [.10,.642,1.233],[-.10,.668,1.154],[-.298,.715,1.053]];
  glazingFace(r,contour.map(retract),rear?'#778c90':'#849a9d',rear?.255:.205);
  // The narrow black channel is attached to the quarter pane; there is no
  // fixed B-pillar across the side opening with both windows lowered.
  if(rear){
    const [b,q]=[bottomDivide,topDivide];
    const edge=[b,q,[q[0]+.009,q[1],q[2]],[b[0]+.010,b[1],b[2]]];
    r.polygon(edge.map(retract),rubber,false);
  }
}
function hydraulics(r,t){
  for(const s of [-1,1]){
    // Route the closed link under the inner trim of the C-pillar. Its lower
    // bellcrank is below the belt line, out of the quarter-window aperture.
    const arm=shellPose([.826,s*.601,1.206],t),base=[1.216,s*.68,.726];
    const fold=ease(.28,.72,t);
    const elbow=blend([1.183,s*.687,.966],blend(base,arm,.57),fold);
    barrel(r,base,elbow,.021,alloy,9);barrel(r,elbow,arm,.011,graphite,8);
    const lever=blend([1.247,s*.688,.975],blend(base,arm,.48),fold);
    barrel(r,[1.28,s*.666,.727],lever,.012,graphite,8);
    barrel(r,lever,arm,.012,graphite,8);
  }
  r.box(1.62,-.597,.385,1.755,-.495,.451,alloy);
  barrel(r,[1.54,-.546,.417],[1.628,-.546,.417],.039,'#3b4144',12);
  r.box(1.752,-.588,.388,1.839,-.502,.445,'#d0cdc0');
}
function deckHardware(r,t){
  const pose=p=>slDeckPoint(p,t);
  // Inset trim follows the underside of the pressed deck skin and clears
  // the stowed roof stack. Each end narrows toward its outer attachments.
  const liner=(v,u)=>pose([mix(1.075,2.226,v)-.041*u*u,
    u*(.521+.074*Math.sin(Math.PI*v)-.044*v),
    .953+.043*Math.sin(Math.PI*v)-.036*v-.033*u*u]);
  const rows=[0,.065,.20,.39,.59,.79,.93,1];
  for(let i=1;i<rows.length;i++){
    const a=rows[i-1],b=rows[i];
    band(r,liner,a,b,-1,1,i===1||i===rows.length-1?'#414548':'#313638');
  }
  for(const side of [-1,1]){
    const rail=[[1.056,side*.571,.937],[1.25,side*.598,.942],[1.665,side*.611,.946],[1.982,side*.562,.912],[2.134,side*.522,.875]];
    pipe(r,rail.map(pose),.012,'#545a5d',7);
    const hinge=pose([2.045,side*.574,.886]),mount=[2.14,side*.595,.806];
    barrel(r,mount,hinge,.014,alloy,8);
    barrel(r,pose([2.005,side*.569,.904]),hinge,.015,'#4c5357',8);
    for(const v of [.1,.44,.84]){
      const [x,y,z]=[mix(1.075,2.226,v)-.029,side*(.521+.074*Math.sin(Math.PI*v)-.044*v)*.83,.953+.043*Math.sin(Math.PI*v)-.036*v-.033*.83**2];
      barrel(r,pose([x,y,z-.004]),pose([x,y,z-.008]),.007,'#565a5d',6);
    }
  }
}
// The open-car overhead photograph on US brochure p.12 shows the broad
// tonneau insert; p.19 shows the windscreen cassette in the trimmed shelf.
function parcelShelf(r,t){
  const ribs=[-1,-.955,-.86,-.74,-.56,-.32,0,.32,.56,.74,.86,.955,1];
  const lanes=[0,.026,.18,.35,.58,.78,.932,.982,1];
  function point(v,k,edge=0){
    const x=mix(.966+.040*k*k,1.489-.130*k*k,v);
    const p=slDeckCrown(x,k*.969);
    return slDeckPoint([p[0],p[1],p[2]+.0048+.0027*Math.sin(Math.PI*v)-edge],t);
  }
  for(let j=1;j<ribs.length;j++){
    const lo=ribs[j-1],hi=ribs[j],outer=Math.min(Math.abs(lo),Math.abs(hi))>=.955;
    for(let i=1;i<lanes.length;i++){
      const a=lanes[i-1],b=lanes[i];
      const color=(i===lanes.length-1||outer)?'#373635':i===1?'#63594e':i===2?'#64594f':'#66594c';
      r.polygon([point(a,lo),point(b,lo),point(b,hi),point(a,hi)],color,false);
    }
    r.polygon([point(1,lo),point(1,hi),point(1,hi,.005),point(1,lo,.005)],rubber,false);
    r.polygon([point(0,lo),point(0,hi),point(0,hi,.012),point(0,lo,.012)],graphite,false);
  }
}
function coveringFlaps(r,t){
  // The factory end-switch chart places both folded at positions 1–3,
  // in transit at 4 and unfolded at 5–8. They travel on the swivel frame.
  const angle=mix(-2.74,0,ease(.34,.57,t));
  for(const side of [-1,1]){
    const pivotWidth=.576,z0=.954;
    const q=(x,w,h)=>slDeckPoint([x,side*(pivotWidth+w*Math.cos(angle)-h*Math.sin(angle)),z0+w*Math.sin(angle)+h*Math.cos(angle)],t);
    const points=[[1.066,.009,.004],[1.119,.122,.001],[1.143,.143,-.002],[1.312,.101,-.001],[1.341,.013,.003]];
    const panel=points.map(p=>q(...p)),back=points.map(([x,w,z])=>q(x,w,z-.009));
    r.polygon(panel,'#47494a',false);r.polygon(back,'#2e3333',false);
    for(let i=0;i<points.length;i++){
      const j=(i+1)%points.length;r.polygon([panel[i],panel[j],back[j],back[i]],graphite,false);
    }
    barrel(r,q(1.104,0,0),q(1.288,0,0),.008,alloy,7);
  }
}
function windHousing(r){
  r.box(.881,-.56,.913,.965,.56,.953,'#444a4c');
  barrel(r,[.922,.443,.928],[.922,.515,.928],.023,graphite,10);
}
function windMesh(r,amount){
  // Frame tips out of the rear trim; its base stays fixed behind the seats.
  const angle=mix(.01,1.47,amount);
  const p=(u,v)=>[.942+Math.cos(angle)*.31*v,u*(.548-.038*v),.951+Math.sin(angle)*.31*v];
  const corners=[[-1,0],[-.998,.84],[-.988,.95],[-.974,.99],[-.945,1],[.945,1],[.974,.99],[.988,.95],[.998,.84],[1,0]];
  pipe(r,corners.map(([u,v])=>p(u,v)),.010,graphite,9);
  // The textile appears as a uniform smoke tint at vehicle scale. A single
  // optical layer avoids a flashing moiré grid while orbiting the assembly.
  glazingFace(r,corners.map(([u,v])=>p(u,v)),'#3c3935',.42);
}
function latches(r,t){
  for(const s of [-1,1]){
    const a=[.154,s*.485,1.248],b=[.116,s*.485,1.255];
    r.box(a[0]-.031,a[1]-.017,a[2]-.012,a[0]+.01,a[1]+.017,a[2]+.002,graphite);
    barrel(r,shellPose(a,t),shellPose(b,t),.007,alloy,8);
  }
}
const nodes=[
 ['windshield','Windshield and header','The fixed A-pillars meet the crossmember above the glass. Two latches secure the folding roof to that crossmember.',[-.13,0,.28],refs.outline],
 ['panel','Magnesium vario-roof frame','The rigid roof panel travels behind the seats as the luggage lid opens backwards. Open the frame to run the folding sequence.',[0,0,.31],refs.sequence],
 ['sky-glass','MAGIC SKY CONTROL glass','A switch overhead changes the transparency of the laminated roof insert. The suspended-particle layer darkens when power is removed.',[0,0,.54],refs.glass],
 ['rear-glass','Heated rear window','A heated glass panel and perimeter seal follow the folding roof into the trunk.',[.20,0,.32],refs.fittings],
 ['pillars','Rear roof pillars','The painted C-pillars carry the side seals between the upper frame and rear quarters.',[.25,0,.15],refs.photo],
 ['door-glass','Frameless door windows','Both front side windows descend during the US roof-opening sequence.',[0,-.27,.14],refs.sequence],
 ['quarter-glass','Rear quarter windows','The small rear windows withdraw into the quarters before the rigid roof leaves the header.',[0,.27,.10],refs.sequence],
 ['deck-hardware','Deck-lid trim and swivel frame','A trim panel covers the underside of the lid. The swivel frame carries the deck through its reverse opening stroke.',[.20,0,.21],refs.liner],
 ['covering-flaps','Rear shelf and side flaps','The Espresso Brown shelf follows the luggage lid. Two side panels unfold as the roof enters the trunk. Position switches tell the controller when the flaps have reached either end of their travel.',[.10,0,.18],refs.shelf],
 ['header-lock','Front roof locks','The moving panel locks against the windshield crossmember. The roof controller monitors the lock position.',[-.15,0,.12],refs.hydraulics],
 ['hydraulics','Vario-roof hydraulic drive','A motor-driven pump feeds the folding mechanism through a manifold and cylinders.',[.06,0,-.23],refs.hydraulics],
 ['windblocker','Power windblocker','The motor raises a trapezoidal mesh screen behind the seats after the roof finishes opening.',[.11,0,.23],refs.manual]
];
export const slRoofGroup={id:'roof',name:'Vario-roof, glass and windblocker',description:'Follow the US hardtop folding sequence, inspect the rear window and change the tint of the overhead glass.',parts:nodes.map(([id,name,description,offset,source])=>({id:'roof.'+id,name,description,offset,source}))};
export function drawSLRoof(r,paint='#a1a6a7',openFraction=0){
  const t=minmax(openFraction);
  r.tag('roof.windshield',()=>fixedGlass(r,paint));
  r.tag('roof.panel',()=>lidFrame(r,paint,t));
  r.tag('roof.sky-glass',()=>skyPane(r,t,r.build?.slGlass==='clear'));
  r.tag('roof.rear-glass',()=>rearPane(r,t));
  r.tag('roof.pillars',()=>pillars(r,t,paint));
  r.tag('roof.header-lock',()=>latches(r,t));
  for(const rear of [false,true])r.tag(rear?'roof.quarter-glass':'roof.door-glass',()=>{
    for(const s of [-1,1])r.instance(s<0?'left':'right',()=>sideGlass(r,s,t,rear));
  });
  r.tag('roof.hydraulics',()=>hydraulics(r,t));
  r.tag('roof.deck-hardware',()=>deckHardware(r,t));
  r.tag('roof.covering-flaps',()=>{parcelShelf(r,t);coveringFlaps(r,t);});
  r.tag('roof.windblocker',()=>{windHousing(r);windMesh(r,r.build?.slWindstop?ease(.94,1,t):0);});
}

const cycle=p=>(1-Math.cos(2*Math.PI*p))*.5;
function rearLid(r,t,paint){
  const deck=(v,u)=>slDeckPoint([mix(.994,2.164,v)+.055*u*u*(1-v),
    u*mix(.64,.679,v),1.006-.090*v-.018*u*u],t);
  for(let i=1;i<=4;i++)band(r,deck,(i-1)/4,i/4,-1,1,paint);
}
function hydraulicStudy(){
  const pkg='sl550-roof-drive';
  return study(pkg,'Vario-roof hydraulic drive','The pump and paired main cylinders turn hydraulic pressure into roof movement. The cutaway follows one representative cylinder. Its bore, stroke and pipe routes are illustrative.',refs.hydraulics,[
    part('motor','Electric pump motor','The electric motor drives the pump in the luggage compartment.',[-.18,-.04,0],r=>{barrel(r,[-.30,-.14,.05],[-.16,-.14,.05],.059,graphite,20);barrel(r,[-.163,-.14,.05],[-.145,-.14,.05],.064,alloy,20);}),
    part('pump','Pump and hydraulic block','The common hydraulic unit connects the motor, reservoir and pressure lines.',[0,0,-.13],r=>{r.box(-.149,-.202,-.017,-.02,-.081,.115,alloy);for(const s of [-1,1])barrel(r,[-.071,-.087,.054+s*.028],[-.071,-.054,.054+s*.028],.015,nickel,8);}),
    part('reservoir','Fluid reservoir','The reservoir holds fluid for the cylinders as piston position changes.',[.20,0,0],r=>{r.box(-.019,-.184,-.009,.116,-.097,.089,'#d2cbb7');barrel(r,[.084,-.137,.089],[.084,-.137,.107],.022,graphite,11);}),
    part('lines','Hydraulic lines','A pair of lines joins the cylinder ports to the hydraulic unit.',[0,.14,0],r=>{
      for(const s of [-1,1])pipe(r,[[-.071,-.054,.054+s*.028],[-.054,.04+s*.012,.01],[-.24,.091+s*.012,.01],[-.24,.132,.090+s*.02]],.006,'#393d40',6);
    }),
    part('barrel','Cylinder cutaway','A section through the steel cylinder exposes its piston and polished rod.',[0,.20,.07],r=>{
      const x0=-.265,x1=.145,y=.155,z=.12;
      const pt=(x,a,rad)=>[x,y+rad*Math.cos(a),z+rad*Math.sin(a)];
      for(let i=0;i<17;i++){
        const a=.20+i*.24,b=a+.24;
        for(const rad of [.037,.045])r.polygon([pt(x0,a,rad),pt(x1,a,rad),pt(x1,b,rad),pt(x0,b,rad)],rad>.04?alloy:'#454f58',false);
        for(const x of [x0,x1])r.polygon([pt(x,a,.037),pt(x,a,.045),pt(x,b,.045),pt(x,b,.037)],nickel,false);
      }
    }),
    part('piston','Piston, rod and eye','Fluid acting on the piston extends the rod. Reversing the flow retracts it.',[.24,0,.12],(r,p)=>{
      const x=mix(-.22,.099,cycle(p));barrel(r,[x,.155,.12],[x+.026,.155,.12],.0345,'#b9bcc0',16);
      barrel(r,[x+.024,.155,.12],[x+.42,.155,.12],.013,nickel,12);
      barrel(r,[x+.42,.141,.12],[x+.42,.169,.12],.020,alloy,10);
    })
  ],'Follow the piston through one extension and return stroke.');
}
function coating(r,z,color,alpha){
  const outline=[[-.28,-.24,z],[.27,-.24,z],[.285,-.216,z],[.285,.216,z],[.27,.24,z],[-.28,.24,z],[-.296,.214,z],[-.296,-.214,z]];
  glazingFace(r,outline,color,alpha);
}
function skyStudy(){
  return study('sl550-roof-glass','MAGIC SKY CONTROL','The overhead switch commands a controller that changes the transparency of the roof laminate. The layers are spread apart for inspection.',refs.glass,[
    part('outer','Outer glass','The top glass protects the switchable laminate.',[0,0,.17],r=>coating(r,.019,'#9fb7bd',.19)),
    part('film','Switchable layer','Applying an alternating voltage makes the suspended-particle layer transmit more light. Unpowered particles darken the panel.',[0,0,.053],(r,p)=>coating(r,0,'#243e54',.80-.65*cycle(p))),
    part('inner','Inner glass','The cabin-side glass completes the sandwich.',[0,0,-.094],r=>coating(r,-.019,'#9fb7bd',.17)),
    part('contact','Electrical contacts','Edge contacts take the controller output into the glazing.',[0,-.095,0],r=>{for(const s of [-1,1])r.box(-.272,s*.228-.002,-.01,.254,s*.228+.002,.006,'#997950');}),
    part('module','Glass control unit','The control unit supplies alternating voltage to the laminate. The illustrated housing and cable are schematic.',[.12,0,0],r=>{r.box(.316,-.066,-.035,.441,.066,.013,graphite);pipe(r,[[.317,.03,-.014],[.295,.06,-.011],[.254,.228,0]],.004,'#c77d40',7);}),
    part('switch','Overhead switch','The button in the overhead console selects dark or clear.',[-.11,0,0],r=>{r.box(-.381,-.045,-.029,-.325,.045,-.003,graphite);r.box(-.374,-.032,-.003,-.332,.032,.001,'#60676b');})
  ],'The switchable layer changes between its dark and clear states. The glass stays in place.');
}
const roofMotion=study('sl550-roof-motion','Retractable hardtop','The side windows drop and the deck opens backwards. The panel and backlight stack underneath before the deck closes. The poses follow the factory sequence. Link lengths and intermediate travel are illustrative.',refs.sequence,[
  part('header','Windshield and fixed header','The header remains fixed while the front edge of the roof lifts away.',[-.12,0,.05],(r,p,paint)=>fixedGlass(r,paint||'#9b9f9e')),
  part('frame','Panoramic roof and rails','The front panel lifts clear and follows the main links into the trunk.',[0,0,.17],(r,p,paint)=>{lidFrame(r,paint||'#9b9f9e',cycle(p));skyPane(r,cycle(p),false);}),
  part('side-glass','Frameless side windows','On the US car the door and quarter windows lower ahead of the moving roof.',[0,-.18,.05],(r,p)=>{for(const s of [-1,1])for(const rear of [true,false])sideGlass(r,s,cycle(p),rear);}),
  part('backlight','Rear glass','The backlight turns into the horizontal stack below the roof.',[.19,0,.09],(r,p)=>rearPane(r,cycle(p))),
  part('pillars','Rear pillars','The side pillars pivot into the luggage compartment.',[0,.20,.08],(r,p,paint)=>pillars(r,cycle(p),paint||'#9b9f9e')),
  part('cylinders','Cylinders and links','The arms are supported on pivots at the rear of the passenger compartment.',[0,-.17,-.10],(r,p)=>hydraulics(r,cycle(p))),
  part('flaps','Rear shelf side flaps','These covers unfold while the frame is open. They fill the spaces beside the roof stack.',[.08,-.12,.08],(r,p)=>{parcelShelf(r,cycle(p));coveringFlaps(r,cycle(p));}),
  part('liner','Deck liner and frame','The inner trim panel, retainers and swivel-frame links travel with the lid.',[0,0,-.13],(r,p)=>deckHardware(r,cycle(p))),
  part('lid','Luggage-compartment lid','The rear-hinged roof-opening motion clears the path of the folding panels. The outline in this study marks the cover.',[.24,0,.09],(r,p,paint)=>rearLid(r,cycle(p),paint||'#9b9f9e'))
],'The luggage lid opens, the roof folds beneath it, and the entire sequence reverses.');
const windStudy=study('sl550-wind-screen','Powered windblocker','The center-console switch raises a trapezoidal textile screen behind the seats when the hardtop is fully open.',refs.manual,[
  part('drive','Housing and motor','A motor beneath the rear trim moves the frame.',[0,0,-.105],r=>windHousing(r)),
  part('mesh','Frame and textile mesh','The open weave reduces drafts behind the occupants.',[0,0,.15],(r,p)=>windMesh(r,cycle(p)))
],'The mesh frame rises from the rear trim and returns to its lowered position.');
export const slRoofStudies={
  'roof.panel':roofMotion,
  'roof.sky-glass':skyStudy(),
  'roof.hydraulics':hydraulicStudy(),
  'roof.windblocker':windStudy
};
