import {glazingFace} from './surface-materials.js';
import {section,part,source} from './section-primitives.js';

const ppg=source('PPG · 747 windshields and side window cross sections','https://max.ppg.com/adaptivemedia/rendition?ext=.pdf&id=73cdaf5b7be3f94a64ca6239c7caaf16d6f677c7');
const museum=source('Powerhouse · 747 windscreen, object 96/154/1','https://collection.powerhouse.com.au/object/149511');
// The museum records the 1,540 × 960 mm envelope of the five-sided unit.
// The corner positions and crown depth are approximated from the installed pane.
const plyShape=[[-.77,1.055],[-.70,.47],[.52,.095],[.77,.23],[.64,1.015]];
const asFace=(depth,scale=1)=>plyShape.map(([x,z])=>[x*scale,depth+(z-.60)*scale*.27,.60+(z-.60)*scale]);
function bowedFace(r,depth,color,opacity){
  const rim=asFace(depth);
  const middle=asFace(depth+.042,.56);
  const peak=[0,depth+.060,.60];
  for(let i=0;i<rim.length;i++){
    const j=(i+1)%rim.length;
    glazingFace(r,[rim[i],rim[j],middle[j],middle[i]],color,opacity);
    glazingFace(r,[middle[i],middle[j],peak],color,opacity);
  }
}
function lamina(r,y,width,color,edge,opacity){
  const front=y+width/2,back=y-width/2;
  bowedFace(r,front,color,opacity);
  bowedFace(r,back,color,opacity);
  const a=asFace(back),b=asFace(front);
  for(let i=0;i<a.length;i++){const j=(i+1)%a.length;r.polygon([a[i],a[j],b[j],b[i]],edge,false);}
}
function hollowSeal(r) {
  const innerFront=asFace(.086),outerFront=asFace(.086,1.060),innerBack=asFace(-.086),outerBack=asFace(-.086,1.060);
  for(let i=0;i<plyShape.length;i++){
    const j=(i+1)%plyShape.length;
    for(const [face,col] of [
      [[outerFront[i],outerFront[j],innerFront[j],innerFront[i]],'#495655'],
      [[outerBack[j],outerBack[i],innerBack[i],innerBack[j]],'#384344'],
      [[outerFront[i],outerFront[j],outerBack[j],outerBack[i]],'#536063'],
      [[innerBack[i],innerBack[j],innerFront[j],innerFront[i]],'#333f42']
    ]) r.polygon(face,col,false);
  }
}
export const jumboWindshield=section('747-windshield','747 main windshield laminate',
  'A slice through the windshield shows how the glass plies share a common edge seal. Thickness and spacing are enlarged so the bonding layers and heater can be separated.',ppg,[
    part('outer','Outboard glass ply','The forward face takes the weather and surface abrasion. Its polished edge shows the thickness of the outer ply.',[0,.62,.16],r=>lamina(r,.063,.032,'#6791a4','#718f98',.32)),
    part('heater','Transparent heating layer','Heating across the pane keeps the outward-facing windshield clear of ice. The two colored edge marks identify the heater in this section.',[.05,.36,.27],r=>{
      bowedFace(r,.044,'#c8ab69',.14);const edges=asFace(.044);
      for(const [i,j] of [[0,1],[2,3]])r.rod(edges[i],edges[j],.009,'#b39353',8);
    }),
    part('bonds','Bonding interlayers','Clear bonding material adheres the glass plies and allows them to work together as a laminate.',[-.40,.20,-.38],r=>{
      lamina(r,.032,.015,'#84aabb','#75a4a9',.16);lamina(r,-.029,.015,'#84aabb','#75a4a9',.16);
    }),
    part('center','Center structural ply','The thicker central glass ply helps carry structural loads.',[0,-.20,.49],r=>lamina(r,.001,.042,'#8ba6ac','#8bafb4',.32)),
    part('inner','Inboard glass ply','The inner ply faces the flight deck and completes the glass stack.',[0,-.62,-.10],r=>lamina(r,-.058,.036,'#7797a3','#7c959e',.27)),
    part('seal','Perimeter moisture seal','The seal surrounds the exposed edge of the laminate. Its hollow opening surrounds the viewing area.',[.34,.08,.69],hollowSeal)
  ]);
jumboWindshield.sources=[museum];
for(const ply of jumboWindshield.groups[0].parts)ply.sources=[museum];
jumboWindshield.viewAngle=[-.54,.22];

const cessnaDoor=source('Cessna · 172S handbook, section 7, entrance doors and cabin windows','https://aceshighaviation.com/wp-content/uploads/2020/04/C172S-POH.pdf');
const hingeZ=1.17;
function doorLight(r,phase) {
  // Model the top-hinged side light. Y points outside this starboard door.
  const angle=(1-Math.cos(2*Math.PI*phase))*.50;
  const transform=([x,y,z])=>[x,.025+y*Math.cos(angle)+(hingeZ-z)*Math.sin(angle),hingeZ+y*Math.sin(angle)+(z-hingeZ)*Math.cos(angle)];
  const frame=[[-.71,0,.69],[-.52,0,hingeZ],[.60,0,hingeZ],[.63,0,.69]].map(transform);
  glazingFace(r,frame,'#80a9b6',.37);
  for(let i=0;i<4;i++)r.rod(frame[i],frame[(i+1)%4],.018,'#69777a',10);
  const tongue=[.13,.005,.665];
  r.rod(transform(tongue),transform([.23,.005,.664]),.015,'#485551',10);
}
export const skyhawkWindow=section('172s-door-window','172S cabin door and window',
  'The pilot and front passenger each have a separate door. On the starboard door shown here the framed window swings out at its lower edge. The door handle sits below the window near the aft edge.',cessnaDoor,[
  part('shell','Door shell and window surround','The metal surround connects the sloped front post and the rear post to the lower door skin.',[.03,.42,-.16],r=>{
    const panel=[[-.81,.16],[-.70,.655],[.653,.655],[.66,.17],[.56,.068],[-.69,.068]];
    r.profile(panel,.015,.055,'#c9d2d3');
    const rim=[[-.716,.024,.646],[-.532,.024,1.192],[.626,.024,1.192],[.657,.024,.646]];
    for(let j=0;j<4;j++)r.rod(rim[j],rim[(j+1)%4],.025,'#c4cbca',10);
   }),
  part('light','Opening side light','The clear side light has its own thin frame. The two hinge points carry it as it opens away from the door.',[0,.68,.45],doorLight),
  part('hinge','Window hinge knuckles','The two short groups of hinge knuckles share the same horizontal axis at the head of the window.',[-.24,.17,.52],r=>{
    for(const cx of [-.30,.36])for(let k=0;k<3;k++)r.rod([cx-.083+.057*k,.025,hingeZ],[cx-.034+.057*k,.025,hingeZ],.026,k===1?'#46545b':'#a0a7a2',12);
  }),
  part('latch','Lower window latch','The lower latch secures the closed window frame to the sill.',[.26,-.31,.18],r=>{
    r.box(.071,-.049,.620,.21,.002,.653,'#8e999a');r.rod([.132,-.065,.632],[.219,-.070,.632],.024,'#48585a',10);
  }),
  part('trim','Inner door panel','The cabin-side trim follows the lower skin. A pull projects inward below the window.',[0,-.43,-.14],r=>{
    r.profile([[-.774,.173],[-.684,.61],[.606,.61],[.612,.189],[.527,.118],[-.61,.118]],-.045,-.011,'#798791');
    r.rod([-.25,-.062,.377],[-.21,-.115,.363],.021,'#51616a',10);
    r.rod([-.21,-.115,.363],[.11,-.115,.363],.025,'#51616a',10);
    r.rod([.11,-.115,.363],[.14,-.061,.377],.021,'#51616a',10);
  }),
  part('handle','Exterior door handle','The recessed door handle is near the rear edge of the painted skin, below the window line.',[.38,.38,.06],r=>{
    r.box(.366,.052,.472,.552,.058,.543,'#586369');
    r.rod([.387,.073,.512],[.529,.073,.513],.022,'#a5b1b3',10);
  })
]);
skyhawkWindow.animated=true;
skyhawkWindow.motionDescription='Watch the lower edge swing out while the hinge line stays fixed above it.';
skyhawkWindow.viewAngle=[.53,.24];
