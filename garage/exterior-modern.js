import {glazingFace} from './surface-materials.js';
import {starBadge} from './exterior-trim.js';
/* Model-year-specific outer surfaces, with original panel and lamp geometry. */
import {coachwork,panel,deckPanel,tint as tone} from './exterior-coachwork.js';
const BLACK='#20272a',METAL='#acb4b5';
function polygon(r,id,pts,c){r.tag(id,()=>r.polygon(pts,c,false));}
function box(r,id,...args){r.tag(id,()=>r.box(...args));}
function rod(r,id,...args){r.tag(id,()=>r.rod(...args));}
const mercedes={
 wb:2.76,arch:.383,axleZ:.367,base:.346,hoodEnd:-.927,deckStart:1.46,
 door:[-.906,.235,1.185],belt:1.046,roofZ:1.409,roofWidth:.652,cabinWidth:.815,roofCrown:.036,screenSweep:.068,sideRound:.016,roofPinch:.015,hoodFrac:.77,metalHandles:true,
 stations:[[-2.26,.790,.924],[-2.05,.867,.995],[-1.75,.904,1.047],[-1.38,.913,1.06],[-.927,.896,1.052],[.235,.894,1.045],[1.19,.905,1.05],[1.51,.906,1.057],[1.94,.865,1.017],[2.26,.778,.95]],
 wind:[[-.927,1.057],[-.443,1.367]],roof:[[-.443,1.367],[-.32,1.388],[-.145,1.401],[.14,1.409],[.42,1.407],[.655,1.393],[.79,1.378]],rear:[[.79,1.378],[1.46,1.05]],
 frontWindow:[[-.843,1.061],[-.387,1.35],[.181,1.378],[.18,1.061]],
 rearWindow:[[.272,1.061],[.273,1.378],[.75,1.350],[1.214,1.07]]
};
const hrv={
 wb:2.654,arch:.409,axleZ:.398,base:.414,hoodEnd:-.855,deckStart:1.91,
 door:[-.846,.265,1.298],belt:1.135,roofZ:1.59,roofWidth:.686,cabinWidth:.806,hoodFrac:.77,hatch:true,cladding:true,
 stations:[[-2.2235,.756,.999],[-2.01,.864,1.075],[-1.65,.911,1.122],[-1.327,.918,1.14],[-.855,.907,1.136],[.265,.914,1.144],[1.298,.916,1.157],[1.7,.888,1.184],[1.91,.85,1.218],[2.2235,.775,1.104]],
 wind:[[-.855,1.146],[-.318,1.558]],roof:[[-.318,1.558],[-.04,1.584],[.61,1.59],[1.088,1.558]],rear:[[1.088,1.558],[1.91,1.234]],
 frontWindow:[[-.77,1.149],[-.258,1.516],[.207,1.538],[.213,1.157]],
 rearWindow:[[.315,1.161],[.315,1.538],[.989,1.505],[1.239,1.183]],
 quarter:[[1.325,1.195],[1.065,1.493],[1.157,1.465],[1.756,1.251]]
};
function star(r,x,y,z,radius){r.tag('body.structure',()=>starBadge(r,[x,y,z],radius,'x',-1));}
// Rear lamp corners change direction across the quarter. Separate ruled strips
// give the lens a real wrap and a uniform thickness without crossing triangles.
function tailLamp(r,side,stations,levels){
 r.tag('lighting.indicator',()=>{
  for(let i=1;i<stations.length;i++){
   const [a,b]=stations.slice(i-1,i+1);
   const point=([x,y,bottom,top],h)=>[x,side*y,bottom+(top-bottom)*h];
   for(const [lo,hi,color] of levels)r.polygon([point(a,lo),point(b,lo),point(b,hi),point(a,hi)],color,false);
  }
 });
}
export function buildC63Exterior(r,paint){
 const L=2.26;
 coachwork(r,mercedes,paint);
 // The standard AMG bonnet's two raised power domes; not Edition507 vents.
 for(const s of [-1,1])panel(r,'bonnet',[0,0,.71],'body.hood',()=>{
  const stations=[[-2.095,1.012,.03],[-1.82,1.084,.095],[-1.45,1.117,.120],[-1.03,1.119,.113],[-.952,1.1,.07]];
  const slice=([x,z,width],u)=>[x,s*.31+width*u,z+.018*(1-u*u)];
  for(let i=1;i<stations.length;i++)for(let j=0;j<8;j++){
   const u=-1+j/4,v=u+.25;
   r.polygon([slice(stations[i-1],u),slice(stations[i],u),slice(stations[i],v),slice(stations[i-1],v)],tone(paint,1.155-.045*u),false);
  }
 });
 box(r,'body.structure',-L-.035,-.81,.40,-L+.10,.81,.51,BLACK);
 const nose=-L-.046;
 polygon(r,'body.structure',[[nose,-.45,.72],[nose,.45,.72],[nose,.395,.99],[nose,-.395,.99]],BLACK);
 box(r,'body.structure',nose-.008,-.43,.845,nose-.002,.43,.874,METAL);star(r,nose-.014,0,.859,.112);
 for(const s of [-1,1]){
  // Facelift headlamp lenses sweep around the flared fender. Inner bezel,
  // projectors and light bars share this bevel, rather than floating in front.
  const lampX=y=>nose+.012+.135*((y-.425)/.398)**2;
  const plane=(y,z,layer=0)=>[lampX(y)-layer,s*y,z];
  const bezel=[[.421,.786],[.535,.785],[.581,.824],[.799,.846],[.826,.878],[.811,.970],[.738,.977],[.442,.916]];
  polygon(r,'lighting.headlamp',bezel.map(([y,z])=>plane(y,z)),'#a7b3b3');
  const inner=[[.439,.804],[.532,.801],[.574,.839],[.789,.861],[.808,.882],[.795,.956],[.739,.961],[.451,.904]];
  polygon(r,'lighting.headlamp',inner.map(([y,z])=>plane(y,z,.016)),'#4b565b');
  r.tag('lighting.headlamp',()=>{for(const [y,h,rad] of [[.532,.851,.050],[.699,.898,.058]]){
   for(const [rr,depth,color] of [[rad,.028,'#b0bcbc'],[rad*.78,.032,'#566771'],[rad*.53,.035,r.lights?'#e1e9dd':'#93a4a9']]){
    const circle=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return plane(y+Math.cos(a)*rr,h+Math.sin(a)*rr,depth);});r.polygon(circle,color,false);
   }
  }});
  polygon(r,'lighting.headlamp',[[.464,.907],[.743,.958],[.793,.950],[.793,.961],[.742,.967],[.464,.916]].map(([y,z])=>plane(y,z,.026)),r.lights?'#e4ece3':'#a5b1b0');
  polygon(r,'lighting.indicator',[[.79,.865],[.807,.875],[.809,.938],[.795,.927]].map(([y,z])=>plane(y,z,.026)),'#a97941');
  // AMG three-opening lower apron, with a separate horizontal DRL in each outer inlet.
  polygon(r,'body.structure',[[nose,s*.48,.49],[nose,s*.79,.51],[nose,s*.78,.70],[nose,s*.51,.71]],'#141c21');
  box(r,'lighting.headlamp',nose-.010,s*.635-.10,.56,nose-.005,s*.635+.10,.58,r.lights?'#e9f0e8':'#798a88');
  tailLamp(r,s,[[L+.019,.385,.791,.916],[L+.022,.583,.800,.924],[L+.025,.771,.826,.937],[L-.069,.833,.861,.965],[L-.23,.880,.924,.985]],[[0,.25,'#8e3036'],[.25,.36,'#c8b8a9'],[.36,.65,'#aa343d'],[.65,.78,'#cb5559'],[.78,1,'#942b33']]);
  rod(r,'body.structure',[-1.00,s*.91,.425],[1.04,s*.91,.425],.039,BLACK,8);
  // Twin exhaust outlets on each side of the dark rear diffuser.
  for(const y of [s*.57,s*.70]){rod(r,'body.structure',[L-.04,y,.45],[L+.105,y,.45],.047,METAL,16);r.tag('body.structure',()=>r.discX(L+.11,y,.45,.035,'#12191e',16));}
 }
 polygon(r,'body.structure',[[nose,-.43,.49],[nose,.43,.49],[nose,.45,.69],[nose,-.45,.69]],'#141c21');
 for(let i=0;i<6;i++)box(r,'body.structure',nose-.003,-.39,.515+i*.026,nose-.001,.39,.521+i*.026,'#374147');
 box(r,'body.structure',L-.04,-.79,.39,L+.035,.79,.53,BLACK);
 for(const y of [-.34,-.16,0,.16,.34])box(r,'body.structure',L-.01,y-.012,.39,L+.052,y+.012,.51,'#343c42');
 // Small integrated trunk lip, license recesses, AMG side vents and fuel door.
 deckPanel(r,false,()=>{r.box(L-.15,-.67,.995,L-.067,.67,1.014,tone(paint,.94));polygon(r,'body.deck',[[L+.006,-.33,.695],[L+.006,.33,.695],[L+.015,.40,.956],[L+.015,-.40,.956]],tone(paint,.89));});
 box(r,'body.structure',nose-.02,-.19,.694,nose-.015,.19,.772,'#ccd0c1');deckPanel(r,false,()=>r.box(L+.020,-.17,.750,L+.028,.17,.849,'#ccd0c1'));
 for(const s of [-1,1])box(r,'body.structure',-1.075,s*.911-.003,.902,-.943,s*.911+.003,.926,METAL);
}
function hexGrille(r,x,cy,cz,rad){for(let i=0;i<6;i++){const a=i/6*Math.PI*2,b=(i+1)/6*Math.PI*2;polygon(r,'body.structure',[[x,cy+Math.cos(a)*rad,cz+Math.sin(a)*rad],[x,cy+Math.cos(b)*rad,cz+Math.sin(b)*rad],[x,cy+Math.cos(b)*(rad-.005),cz+Math.sin(b)*(rad-.005)],[x,cy+Math.cos(a)*(rad-.005),cz+Math.sin(a)*(rad-.005)]],'#53616a');}}
export function buildHrvExterior(r,paint){
 const L=2.2235;
 coachwork(r,hrv,paint);
 deckPanel(r,true,()=>{
  polygon(r,'body.deck',[[1.06,-.696,1.594],[1.236,-.687,1.562],[1.236,.687,1.562],[1.06,.696,1.594]],tone(paint,.91));
  box(r,'lighting.indicator',1.236,-.17,1.550,1.242,.17,1.560,'#a2393f');
  const stations=[[1.91,.769,1.234],[2.07,.665,1.161],[2.205,.586,1.105],[L+.030,.523,1.077],[L+.036,.527,.942],[L+.038,.532,.800]];
  for(let i=1;i<stations.length;i++){const [x,y,z]=stations[i-1],[xx,yy,zz]=stations[i];polygon(r,'body.deck',[[x,-y,z],[x,y,z],[xx,yy,zz],[xx,-yy,zz]],tone(paint,1.10-(i-1)*.067));}
  rod(r,'body.glass',[1.866,-.285,1.261],[1.866,.215,1.261],.009,BLACK,8);
 });
 const nose=-L-.046;
 polygon(r,'body.structure',[[nose,-.46,.69],[nose,.46,.69],[nose,.515,.77],[nose,.425,.995],[nose,-.425,.995],[nose,-.515,.77]],'#151d22');
 for(let row=0;row<4;row++)for(let col=0;col<11;col++){const yy=-.40+col*.08+(row%2)*.04,zz=.742+row*.061;if(Math.abs(yy)<.43-(zz-.74)*.18)hexGrille(r,nose-.004,yy,zz,.041);}
 // Honda emblem: four solid bars on a dark mounting patch.
 box(r,'body.structure',nose+.013,-.066,1.001,nose+.019,.066,1.045,'#343f46');
 for(const s of [-1,1])rod(r,'body.structure',[nose+.009,s*.035,1.007],[nose+.009,s*.043,1.041],.0045,METAL,8);
 rod(r,'body.structure',[nose+.006,-.035,1.022],[nose+.006,.035,1.022],.005,METAL,8);
 for(const s of [-1,1]){
  const plane=(y,z,layer=0)=>[nose+.016+.144*((y-.455)/.363)**2-layer,s*y,z];
  const lens=[[.46,.928],[.686,.955],[.803,.999],[.814,1.036],[.724,1.029],[.477,.985]];
  polygon(r,'lighting.headlamp',lens.map(([y,z])=>plane(y,z)),'#acbabb');
  const bezel=[[.477,.941],[.689,.966],[.791,1.002],[.796,1.022],[.726,1.019],[.49,.981]];
  polygon(r,'lighting.headlamp',bezel.map(([y,z])=>plane(y,z,.019)),'#485962');
  for(const y of [.505,.573,.641,.709]){
   const z=.949+(y-.5)*.154;polygon(r,'lighting.headlamp',[plane(y,z,.032),plane(y+.041,z+.006,.032),plane(y+.039,z+.033,.032),plane(y+.007,z+.028,.032)],r.lights?'#e0e9e1':'#96a9af');
  }
  polygon(r,'lighting.headlamp',[[.481,.979],[.726,1.020],[.795,1.024],[.795,1.034],[.722,1.03],[.476,.988]].map(([y,z])=>plane(y,z,.025)),r.lights?'#eef3ea':'#adbcbb');
  polygon(r,'lighting.indicator',[[.792,1.002],[.814,1.012],[.814,1.028],[.792,1.023]].map(([y,z])=>plane(y,z,.026)),'#b17e42');
  r.tag('lighting.headlamp',()=>{
    const stations=[[.464,.931,.983],[.54,.942,.998],[.648,.953,1.016],[.725,.97,1.031],[.791,.996,1.034],[.805,1.005,1.028]];
    for(let i=1;i<stations.length;i++){
      const [a,b]=stations.slice(i-1,i+1);
      glazingFace(r,[plane(a[0],a[1],.037),plane(b[0],b[1],.037),plane(b[0],b[2],.037),plane(a[0],a[2],.037)],'#b5c7cf',.18);
    }
    // Keep separate chamber divisions behind the clear cover, visible with the LEDs off.
    for(const y of [.555,.623,.691]){
      const z=.95+(y-.5)*.154;
      r.rod(plane(y,z,.033),plane(y+.004,z+.027,.033),.0025,'#6a7e86',6);
    }
  });
  // Vertical black outer bumper inserts and lower corner reflectors.
  polygon(r,'body.structure',[[nose+.018,s*.61,.62],[nose+.05,s*.79,.67],[nose+.067,s*.78,.91],[nose+.023,s*.67,.84]],BLACK);
  box(r,'lighting.indicator',L+.012,s*.73-.083,.58,L+.02,s*.73+.083,.61,'#963941');
  tailLamp(r,s,[[L+.024,.468,.974,1.081],[L+.023,.655,.985,1.082],[L+.019,.774,1.006,1.089],[L-.075,.837,1.043,1.114],[L-.207,.861,1.10,1.157],[L-.266,.868,1.143,1.169]],[[0,.29,'#783139'],[.29,.51,'#b3474c'],[.51,.72,'#462e36'],[.72,1,r.lights?'#d25960':'#a43e48']]);

 }
 box(r,'body.structure',nose,-.60,.48,nose+.03,.60,.595,BLACK);
 for(let i=0;i<3;i++)box(r,'body.structure',nose-.005,-.52,.505+i*.025,nose-.002,.52,.512+i*.025,'#4b575d');
 box(r,'body.structure',L-.01,-.79,.46,L+.05,.79,.64,BLACK);
 polygon(r,'body.structure',[[L+.012,-.76,.64],[L+.012,.76,.64],[L-.005,.71,.92],[L-.005,-.71,.92]],tone(paint,.84));
 deckPanel(r,true,()=>{r.box(L+.045,-.16,.836,L+.052,.16,.932,'#c7ccbd');r.box(L+.044,-.031,1.025,L+.05,.031,1.072,METAL);});
 // Hatch seam and concealed exhaust are deliberately different from the AMG quad tips.
 deckPanel(r,true,()=>{for(const s of [-1,1])r.rod([L+.018,s*.49,.813],[L+.018,s*.51,.954],.005,tone(paint,.5),6);});
}
