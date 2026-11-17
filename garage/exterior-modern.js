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
export {buildHrvExterior} from './hrv-exterior.js';
