// MY23 K67, Racing Red launch right elevation (1200 × 800). Front and rear
// axle centres are 819 px apart horizontally. The nose faces right.
// https://2wheelshero.com/cdn/shop/collections/S1000RR_2023_1200x1200.png?v=1679872683
// Depth and return surfaces follow the oblique launch photographs and the
// 46_2490/2491/2503 exploded plates. Those views do not dimension the surfaces.
import {barrel,ellipse,pipe,tint} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';
import {part,study} from './mechanism-shapes.js';

const fiche='https://shop.maxbmw.com/fiche/DiagramsRight.aspx?vid=63032&diagram=';
const ref=(label,id)=>({label:'BMW K67 · '+label+', plate '+id,url:fiche+id});
export const k67ExteriorRefs={
  fairing:ref('side trim','46_2491'),
  winglets:ref('winglet bracket','46_2490'),
  screen:ref('windscreen','46_2153'),
  front:ref('generation II LED headlamp','63_2076'),
  fender:ref('front fender','46_2135')
};

const scale=1.457/819;
const point=(u,v,width,side)=>[-.728+(1013-u)*scale,side*width,.30+(596-v)*scale];
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

function join(r,a,b,color){
  for(let i=1;i<a.length;i++)r.polygon([a[i-1],b[i-1],b[i],a[i]],color,false);
}

// Each station is [image x, top y, bottom y, top half-width, bottom
// half-width]. A convex shoulder is rolled into the outer panel; the small
// return on the back edge keeps the silhouette closed when a panel is moved.
function foldedPanel(r,stations,side,paint,bulge=.011){
  const sections=stations.map(([u,top,bottom,wTop,wBottom])=>{
    const a=point(u,top,wTop,side),b=point(u,bottom,wBottom,side);
    return [0,.28,.74,1].map(t=>{
      const p=lerp(a,b,t);p[1]+=side*bulge*Math.sin(Math.PI*t);return p;
    });
  });
  const shading=[1.04,1.10,.93,.72];
  for(let i=1;i<sections.length;i++){
    const a=sections[i-1],b=sections[i];
    for(let j=1;j<a.length;j++){
      const tintA=tint(paint,shading[j-1]),tintB=tint(paint,shading[j]);
      r.polygon([a[j-1],b[j-1],b[j],a[j]],tintA,false);
      if(r.faces?.length)r.faces.at(-1).vertexColors=[tintA,tintA,tintB,tintB];
    }
  }
  const back=p=>[p[0],p[1]-.009*side,p[2]];
  for(const edge of [sections.map(s=>s[0]),sections.map(s=>s.at(-1)),sections[0],sections.at(-1)]){
    join(r,edge,edge.map(back),tint(paint,.53));
  }
}

// The painted brow and the lower lip share the aperture edges with the lamp
// and centre duct. A ray through either aperture reaches the recessed hardware.
const lampUpper=[[1061,355,.049],[1052,340,.080],[1038,327,.121],[1016,316,.169],[988,313,.202],[970,316,.222]];
const lampLower=[[1059,367,.048],[1047,368,.080],[1029,367,.121],[1009,360,.169],[989,342,.202],[970,323,.222]];
const frontLine=(coords,side)=>coords.map(([u,v,w])=>point(u,v,w,side));

function frontMask(r,s,paint){
  const rail=coords=>frontLine(coords,s);
  const upper=rail(lampUpper),lower=rail(lampLower);
  const bridge=rail([[1059,350,.038],[1051,331,.066],[1038,316,.100],[1017,306,.147],[991,306,.189],[963,310,.217]]);
  const breast=rail([[1035,296,.045],[1020,281,.072],[1000,265,.110],[982,257,.143],[969,257,.180],[955,250,.204]]);
  const collar=rail([[980,220,.063],[964,208,.083],[951,201,.103],[943,199,.125],[935,196,.146],[935,212,.168]]);
  const shoulder=rail([[945,174,.090],[937,170,.101],[929,167,.110],[919,166,.119],[909,167,.127],[902,174,.135]]);
  join(r,upper,bridge,tint(paint,.90));join(r,bridge,breast,tint(paint,1.02));
  join(r,breast,collar,tint(paint,1.07));join(r,collar,shoulder,tint(paint,.99));
  // The nose is deeply cleft. The dark channel widens below the base of the
  // screen and tapers to a narrow throat between the inner tips of the lamps.
  // The folded side wall under the leading edge of each mirror support
  // widens near the lens. The lower rail ties it into the upper side trim.
  const railBack=rail([[970,323,.222],[942,311,.210],[949,270,.191],[921,222,.156],[902,174,.135]]);
  const outside=[upper.at(-1),bridge.at(-1),breast.at(-1),collar.at(-1),shoulder.at(-1)];
  join(r,railBack,outside,tint(paint,.79));
  // The thin transverse return joins the upper fairing to the screened
  // instrument well and closes the raised shoulders at the mirror mounts.
  const returnEdge=shoulder.map(([x,y,z])=>[x+.019,y*.92,z-.016]);
  join(r,shoulder,returnEdge,'#33383c');
  const inner=[bridge[0],breast[0],collar[0],shoulder[0]];
  const spine=rail([[1061,361,.020],[1037,298,.029],[982,223,.038],[944,184,.047]]);
  join(r,inner,spine,'#282c30');
  const gutter=spine.map(([x,y,z])=>[x+.016,y*.72,z-.005]);
  join(r,spine,gutter,'#171d21');
  join(r,gutter,gutter.map(([x,,z])=>[x+.005,0,z-.002]),'#242a2d');
  const crest=rail([[1078,378,.034],[1076,378,.087],[1064,379,.130],[1045,379,.172],[1014,365,.206],[978,345,.228]]);
  const underside=rail([[1062,392,.028],[1059,393,.083],[1048,399,.126],[1025,409,.166],[1000,409,.199],[969,403,.225]]);
  join(r,lower,crest,tint(paint,.94));join(r,crest,underside,tint(paint,.72));
  for(const [a,b] of [[crest[0],underside[0]],[bridge[0],upper[0]]]){
    r.polygon([a,[a[0],0,a[2]],[b[0],0,b[2]],b],tint(paint,.82),false);
  }
}

function headlight(r,side){
  const sample=(segment,t,h,depth=0)=>{
    const top=lerp(upper[segment],upper[segment+1],t),bottom=lerp(lower[segment],lower[segment+1],t);
    const p=lerp(bottom,top,h);p[0]+=depth;return p;
  };
  const upper=frontLine(lampUpper,side),lower=frontLine(lampLower,side);
  const top=upper,bottom=lower;
  const inset=p=>[p[0]+.006,p[1],p[2]];
  join(r,top,top.map(inset),'#202629');
  join(r,bottom,bottom.map(inset),'#1b2025');
  join(r,top.map(inset),bottom.map(inset),'#252f35');
  // The single recessed projector sits within a dark, swept reflector.
  // The white signature turns up from the bottom edge at the outer end.
  const origin=sample(2,.53,.53,.0043);
  const u=[.0075,side*.011,0],v=[.002,0,.012];
  ellipse(r,origin,u,v,1,.79,'#77858b',14);
  const light=[origin[0]-.0008,origin[1],origin[2]];
  ellipse(r,light,u,v,.77,0,'#5d6970',14);
  ellipse(r,[light[0]-.0008,light[1],light[2]+.002],u,v,.39,0,'#8b989c',12);
  pipe(r,[sample(0,.25,.22,.002),sample(1,.42,.13,.002),sample(2,.65,.12,.002),sample(3,.05,.23,.002),sample(3,.82,.81,.002)],.0026,'#e3e8e1',6);
  for(let i=1;i<top.length;i++)glazingFace(r,[bottom[i-1],bottom[i],top[i],top[i-1]],'#9eb7c4',.14);
}

function aerofoil(r,rail,side,paint,top){
  // Sections wrap around a rounded leading edge, a convex upper surface
  // and a thin trailing edge. x runs aft, y increases toward the wing tip.
  const sections=rail.map(([x,y,z,chord,thick])=>[[0,0],[.09,.62],[.38,1],[.81,.45],[1,0],[.44,-.31],[.10,-.29],[0,0]].map(([t,h])=>[x+chord*t,side*y,z+thick*h-.013*t]));
  const shades=top?[.84,1.03,1.07,.90,.55,.60,.67]:[.80,1.03,1.08,.92,.72,.66,.72];
  for(let i=1;i<sections.length;i++)for(let j=1;j<sections[i].length;j++)r.polygon([sections[i-1][j-1],sections[i][j-1],sections[i][j],sections[i-1][j]],tint(paint,shades[j-1]),false);
  return sections;
}

function wing(r,s,paint){
  const upper=aerofoil(r,[[-.801,.133,.689,.113,.009],[-.778,.220,.681,.112,.010],[-.742,.282,.682,.109,.012],[-.724,.328,.690,.096,.010]],s,paint,true);
  const lower=aerofoil(r,[[-.773,.128,.664,.099,.008],[-.750,.220,.649,.102,.009],[-.717,.281,.647,.097,.009],[-.714,.318,.655,.088,.008]],s,'#353b40',false);
  const edge=upper.at(-1),base=lower.at(-1);
  join(r,edge,base,'#383f45');
  // The inner bracket attaches the loop to the fairing under the lens.
  join(r,upper[0],lower[0],'#343c42');
}

// Datum points sampled on the native right elevation. Each outside edge of
// the long side trim changes height independently as it passes the tank.
const sideBand=[
  [1067,373,383,.122,.144],[1045,368,391,.170,.196],[1012,353,397,.215,.236],
  [986,344,406,.233,.252],[949,353,398,.252,.271],[924,357,397,.257,.275],
  [894,361,402,.258,.278],[850,367,400,.251,.275],[816,372,400,.246,.268],
  [782,376,402,.241,.264],[738,383,411,.234,.257],[701,388,428,.225,.249],
  [678,390,438,.216,.235],[646,394,426,.211,.215],[610,398,413,.199,.205],[567,398,400,.187,.190]
];
function halfWidth(stations,u,v,bulge){
  for(let i=1;i<stations.length;i++){
    const a=stations[i-1],b=stations[i];
    if((u-a[0])*(u-b[0])>0)continue;
    const f=(u-a[0])/(b[0]-a[0]),col=j=>a[j]+f*(b[j]-a[j]);
    const h=Math.min(1,Math.max(0,(v-col(1))/(col(2)-col(1))));
    return col(3)+(col(4)-col(3))*h+Math.sin(Math.PI*h)*bulge;
  }
  return stations.at(-1)[3];
}

// The RR graphic, pinstripe and BMW roundel are laid onto the side trim,
// so changing the paint keeps their placement relative to the panel creases.
function trimGraphics(r,s){
  const badge=(u,v,extra=.0028)=>point(u,v,halfWidth(sideBand,u,v,.008)+extra,s);
  const graphic=(poly,color)=>r.polygon(poly.map(([u,v])=>badge(u,v)),color,false);
  const charcoal='#252b30';
  graphic([[910,376],[883,366],[875,367],[894,375],[870,381],[856,373],[845,374],[865,386],[880,384],[871,390],[886,389],[900,383],[909,384],[903,380]],charcoal);
  graphic([[867,375],[849,368],[842,369],[853,375],[840,380],[827,374],[818,375],[839,387],[851,385],[843,390],[855,390],[869,383],[879,383]],charcoal);
  graphic([[821,375],[790,375],[775,379],[786,384],[817,386],[838,387]],'#30343a');
  graphic([[927,389],[914,395],[881,395],[897,391]],'#c2c7c5');
  const disc=(radius,color,extra,start=0,end=Math.PI*2)=>{
    const ps=[badge(949,376,extra)];
    for(let i=0;i<=20;i++){const t=start+(end-start)*i/20;ps.push(badge(949+radius*Math.cos(t),376+radius*Math.sin(t),extra));}
    for(let i=1;i<ps.length-1;i++)r.polygon([ps[0],ps[i],ps[i+1]],color,false);
  };
  disc(14.7,'#b8bdbe',.0032);disc(13.8,'#242a2e',.0040);
  for(let i=0;i<4;i++)disc(8.8,i%2?'#e4e6dd':'#569bc3',.0048,i*Math.PI/2,(i+1)*Math.PI/2);
}

function upperDuct(r,s){
  // In profile the large area between the nose and the tank is black.
  // The upper fork and the bar controls remain visible through its top.
  foldedPanel(r,[[972,227,315,.178,.218],[959,254,320,.183,.217],[944,284,319,.177,.223],[920,299,331,.178,.230],[885,303,337,.173,.224],[845,311,348,.157,.218],[816,312,358,.147,.215],[783,325,363,.162,.206],[749,356,380,.179,.211],[717,389,391,.211,.211]],s,'#383a3d',.008);
  foldedPanel(r,[[982,321,345,.201,.229],[965,316,350,.209,.242],[940,316,355,.225,.251],[905,327,358,.228,.258],[864,341,363,.225,.253],[815,358,370,.218,.248],[766,374,379,.211,.241],[727,384,385,.216,.222]],s,'#292d30',.004);
}

function sideTrim(r,s,paint){
  foldedPanel(r,sideBand,s,paint,.008);
  trimGraphics(r,s);
  foldedPanel(r,[[963,396,407,.250,.224],[925,398,420,.264,.240],[901,399,435,.263,.232],[862,400,438,.256,.227],[826,401,442,.255,.212],[787,400,443,.253,.210],[751,403,436,.245,.211],[716,418,436,.229,.203],[695,435,439,.211,.202]],s,'#25292d',.006);
  // The second, much shorter blade leaves the engine case exposed. The
  // painted outside returns down and inwards below the radiator outlet.
  const secondary=s===1?[
    [979,405,414,.226,.221],[953,406,430,.242,.230],[923,408,453,.254,.237],[890,419,466,.249,.233],
    [858,435,482,.245,.230],[834,444,501,.235,.217],[811,452,506,.228,.219],[786,457,477,.216,.209],[759,455,466,.202,.197]
  ]:[
    [979,405,414,.226,.221],[950,407,431,.241,.229],[918,412,456,.254,.236],[879,422,464,.251,.232],
    [842,432,482,.243,.223],[809,446,488,.230,.218],[781,449,474,.215,.209],[742,447,454,.201,.198]
  ];
  foldedPanel(r,secondary,s,paint,.010);
  const insert=[[939,427],[920,434],[907,451],[884,464],[854,462],[891,441]];
  r.polygon(insert.map(([u,v])=>point(u,v,halfWidth(secondary,u,v,.010)+.0027,s)),'#d5d8d6',false);
}

function engineSpoiler(r,s){
  const frontPan=[[916,451,458,.196,.189],[896,463,493,.207,.185],[876,469,525,.216,.190],[859,477,560,.215,.192],[846,485,603,.211,.195],[834,492,635,.216,.185],[820,500,652,.213,.169],[793,515,635,.209,.166],[769,518,620,.200,.168],[747,525,605,.195,.171],[726,519,597,.201,.174],[705,502,604,.196,.170],[688,484,614,.197,.166]];
  foldedPanel(r,frontPan,s,'#282b2e',.011);
  const upperRail=[[688,484,614,.197,.166],[674,466,620,.190,.166],[658,455,616,.189,.166],[645,453,602,.186,.166]];
  // Narrow rim around the clutch cover: large open arc below the circular
  // cover. The return closer to the centreline sits behind the engine.
  foldedPanel(r,upperRail.map(([u,t,b,wt,wb],i)=>[u,t,t+[5,7,9,7][i],wt,wt+.004]),s,'#2c3032',.002);
  foldedPanel(r,[[834,637,678,.177,.135],[811,626,679,.188,.135],[778,621,679,.183,.139],[743,617,677,.178,.139],[712,614,654,.178,.143],[674,606,641,.178,.143],[642,598,631,.181,.142],[610,591,623,.172,.142],[580,593,612,.153,.129],[560,600,605,.142,.129]],s,'#292c2e',.004);
  // Bottom spoiler has a visible relief beneath the sloping central web.
  foldedPanel(r,[[848,676,678,.130,.120],[839,652,678,.172,.133],[824,613,675,.190,.139],[803,590,637,.211,.174],[780,580,615,.212,.181],[747,576,598,.212,.185],[719,581,603,.207,.176],[691,591,606,.196,.172],[667,606,612,.189,.170]],s,'#373a3c',.005);
  const floor=[[848,678,.120],[813,679,.135],[777,679,.139],[743,677,.139],[711,653,.143],[675,641,.143],[610,623,.142],[560,605,.129]].map(([u,v,w])=>point(u,v,w,s));
  join(r,floor,floor.map(([x,,z])=>[x,0,z-.004]),'#25282a');
}

function trimScrews(r,s){
  for(const [u,v,w] of [[854,491,.232],[727,545,.213],[679,439,.230],[817,661,.182]]){
    const p=point(u,v,w,s);ellipse(r,p,[.0036,0,0],[0,0,.0036],1,.38,'#787a78',8);
  }
}

function mudguard(r,paint){
  // Tire crown, fork recess, pointed front lip and the two deep side stays
  // are separate edges of the same moulding; the tyre remains clear below.
  const spec=[
    [1090,437,.024,1],[1075,428,.045,4],[1049,423,.062,8],[1024,419,.071,10],
    [1003,416,.075,14],[981,418,.080,13],[958,422,.079,12],[925,434,.069,11],[895,453,.039,5]
  ];
  const sections=spec.map(([u,v,width,drop])=>[-1,-.80,-.46,0,.46,.80,1].map(t=>point(u,v+drop*t*t,width*Math.abs(t),Math.sign(t))));
  for(let j=1;j<sections[0].length;j++)for(let i=1;i<sections.length;i++)r.polygon([sections[i-1][j-1],sections[i][j-1],sections[i][j],sections[i-1][j]],tint(paint,[.71,.92,1.09,1.11,.98,.78][j-1]),false);
  for(const s of [-1,1]){
    foldedPanel(r,[[1064,435,438,.062,.066],[1047,433,467,.068,.084],[1039,439,506,.076,.095],[1034,448,533,.074,.104],[1029,459,568,.078,.104],[1020,467,572,.087,.109],[1009,473,556,.092,.101],[998,474,518,.083,.097],[986,470,489,.079,.088]],s,paint,.004);
    foldedPanel(r,[[1036,474,476,.100,.101],[1030,476,513,.104,.106],[1015,476,513,.106,.107],[1014,478,510,.105,.107]],s,'#cf861f',.001);
    const mount=point(1023,535,.110,s);
    ellipse(r,mount,[.005,0,0],[0,0,.005],1,.38,'#a3aab0',10);
  }
}

function windshield(r){
  // Forward lower flange follows the painted centre fairing. As it rises,
  // the lip sweeps aft and is lower at its two corners than on the centreline.
  const stations=[
    [1053,321,.038,-9,8],[1035,283,.074,-10,9],[1009,246,.101,-13,11],
    [980,204,.119,-23,14],[953,169,.133,-27,19],[922,130,.141,-41,25],
    [901,103,.143,-70,40],[882,88,.129,-84,85]
  ];
  const ring=([u,v,w,sweep,drop])=>Array.from({length:13},(_,j)=>{
    const t=(j-6)/6;return point(u+sweep*t*t,v+drop*t*t,w*Math.abs(t),Math.sign(t));
  });
  const rows=stations.map(ring);
  for(let i=1;i<rows.length;i++)for(let j=1;j<rows[i].length;j++)glazingFace(r,[rows[i-1][j-1],rows[i][j-1],rows[i][j],rows[i-1][j]],'#91a5ad',.22);
  // Black mask on the bonded lower half of the screen. A U-shaped
  // border follows the sloping glazing instead of an opaque flat rectangle.
  const maskRows=rows.slice(0,5).map((row,i)=>row.map(([x,y,z],j)=>[
    x+.001, y*[.70,.72,.77,.85,.91][i], z-.0015-.005*Math.abs((j-6)/6)
  ]));
  for(let i=1;i<maskRows.length;i++)join(r,maskRows[i-1],maskRows[i],i>2?'#42474b':'#33393c');
  for(const j of [0,12])pipe(r,maskRows.map(row=>row[j]),.002,'#30373b',5);
  for(const j of [0,12])pipe(r,rows.map(row=>row[j]),.0027,'#566269',6);
  pipe(r,rows.at(-1),.0024,'#8b999f',5);
  for(const j of [1,11])for(const i of [1,3]){const p=rows[i][j];barrel(r,p,[p[0]-.002,p[1],p[2]+.003],.004,'#74818a',7);}
}

export function drawK67Bodywork(r,paint){
  r.tag('body.fairing',()=>{for(const s of [-1,1]){frontMask(r,s,paint);upperDuct(r,s);sideTrim(r,s,paint);engineSpoiler(r,s);trimScrews(r,s);}});
  r.tag('body.winglets',()=>{for(const s of [-1,1])wing(r,s,paint);});
  r.tag('body.lamps',()=>{for(const s of [-1,1])headlight(r,s);});
  r.tag('body.fender',()=>mudguard(r,paint));
  r.tag('cabin.screen',()=>windshield(r));
}


// Study the same physical panels at their installed coordinates. Each flank
// can leave the steel frame independently, consistent with the exploded plates.
const bodyParts=[
  part('nose','Center fairing and lamp surrounds','The center panel straddles the air inlet. Each painted shoulder folds back under a mirror mount.',[-.21,0,.12],(r,phase,paint='#cf322e')=>{for(const s of [-1,1])frontMask(r,s,paint);}),
  ...[-1,1].map(s=>part(s<0?'left-trim':'right-trim',s<0?'Left side trim':'Right side trim','Two painted blades surround the radiator exit. The roundel sits on the longer upper blade.',[0,s*.22,.04],(r,phase,paint='#cf322e')=>sideTrim(r,s,paint))),
  ...[-1,1].map(s=>part(s<0?'left-duct':'right-duct',s<0?'Left upper inner trim':'Right upper inner trim','This dark inner panel runs back from the headlamp towards the tank and sits behind the painted side trim.',[.04,s*.12,.14],r=>upperDuct(r,s))),
  part('spoiler','Engine spoiler','The lower panels frame the engine side covers and wrap underneath the exhaust headers.',[0,0,-.17],r=>{for(const s of [-1,1])engineSpoiler(r,s);}),
  part('fixings','Panel fasteners','The visible screw heads mark attachment points along the trim and the engine spoiler.',[.04,-.08,.13],r=>{for(const s of [-1,1])trimScrews(r,s);})
];
export const k67FairingStudy=study('k67-fairing','Nose fairing and side trim','Follow the colored panels from the lamps back to the tank. The black radiator ducts sit under their upper edge, and a separate spoiler closes the underside.',k67ExteriorRefs.fairing,bodyParts);
k67FairingStudy.viewAngle=[-.52,.16];
for(const p of k67FairingStudy.groups[0].parts){
  if(p.id.endsWith('.nose'))p.source=ref('center fairing','46_2503');
  else if(p.id.endsWith('-duct'))p.source=ref('upper side trim','46_2164');
  else if(p.id.endsWith('.spoiler'))p.source=ref('engine spoiler','46_2168');
  else p.source=k67ExteriorRefs.fairing;
}
