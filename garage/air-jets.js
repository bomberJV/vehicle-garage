import {glazingFace} from './surface-materials.js';
import {record,section,piece,sides,loft,windowedLoft,framedPane,wing,fin,nacelle,paint} from './air-mesh.js';

const references={
 f16:['U.S. Air Force · F-16C','https://www.shaw.af.mil/About-Us/Fact-Sheets/Display/Article/663884/f-16c-fighting-falcon/'],
 f22:['U.S. Air Force · F-22 Raptor','https://www.af.mil/About-Us/Fact-Sheets/Display/Article/104506/f-22-raptor/'],
 f35:['Lockheed Martin · F-35 variants','https://www.f35.com/f35/news-and-features/The-ABCs-of-F-35.html']
};
const fighters={
 f16:{name:'F-16C Fighting Falcon',short:'F-16C',year:1984,length:'49 ft 5 in',span:'32 ft 8 in',tail:'Single fin',finish:'#8b969e',
  detail:'A bubble canopy rises above the narrow nose. Look below it for the chin intake and follow the single fin down to the round engine outlet.',
  stations:[[-2.5,.012,.62,.012],[-2.27,.11,.64,.096],[-1.68,.214,.655,.145],[-1.22,.235,.64,.20],[-.68,.254,.64,.217],[.14,.29,.61,.24],[.77,.266,.606,.245],[1.45,.236,.60,.24],[1.92,.206,.60,.206],[2.26,.153,.60,.162]],
  wings:[[.17,-1.25,1.14,.66,.053],[.42,-.52,1.12,.65,.046],[1.54,.39,.947,.635,.023],[1.65,.52,.945,.635,.015]],
  tailplan:[[.15,1.10,2.32,.56,.033],[.95,1.75,2.38,.51,.016]],cockpit:[-1.77,-1.56,-1.29,-1.03,-.70],heights:[.028,.224,.268,.245,.02],width:.172},
 f22:{name:'F-22A Raptor',short:'F-22A',year:2005,length:'62 ft 1 in',span:'44 ft 6 in',tail:'Twin canted fins',finish:'#9ba6ac',
  detail:'Its wings and tailplanes make separate diamond-like outlines. Two flat exhaust outlets sit between the outward-canted fins.',
  stations:[[-2.50,.014,.60,.018],[-2.19,.155,.62,.10],[-1.72,.232,.65,.177],[-1.28,.309,.64,.202],[-.91,.429,.62,.213],[-.40,.510,.609,.223],[.45,.535,.615,.195],[1.20,.482,.608,.171],[1.86,.409,.597,.134],[2.27,.346,.584,.087]],
  wings:[[.29,-1.12,1.56,.615,.048],[.56,-.85,1.60,.618,.044],[1.63,.37,1.22,.61,.025],[1.80,.62,1.03,.605,.013]],
  tailplan:[[.27,1.03,2.31,.57,.034],[.83,1.51,2.46,.545,.026],[1.14,1.99,2.23,.53,.014]],cockpit:[-1.81,-1.60,-1.36,-1.11,-.84],heights:[.016,.167,.202,.15,.01],width:.174},
 f35:{name:'F-35A Lightning II',short:'F-35A',year:2016,length:'51.4 ft',span:'35 ft',tail:'Twin canted fins',finish:'#626e79',
  detail:'This is the conventional-takeoff A model. The short trapezoidal wings, twin fins and single round exhaust distinguish it from the F-22.',
  stations:[[-2.50,.014,.62,.016],[-2.23,.145,.64,.102],[-1.81,.246,.665,.182],[-1.31,.327,.648,.234],[-.88,.436,.62,.267],[-.41,.492,.605,.28],[.45,.475,.61,.252],[1.19,.379,.612,.236],[1.77,.28,.619,.211],[2.23,.206,.626,.162]],
  wings:[[.24,-1.03,1.21,.642,.058],[.50,-.55,1.21,.632,.048],[1.62,.35,.91,.61,.025],[1.70,.455,.875,.61,.014]],
  tailplan:[[.18,1.20,2.25,.584,.037],[.90,1.56,2.42,.554,.023],[1.08,1.77,2.26,.54,.015]],cockpit:[-1.84,-1.62,-1.33,-1.06,-.74],heights:[.018,.192,.23,.19,.015],width:.190}
};
function roundedCanopy(r,c,id){
 const is16=id==='f16',is22=id==='f22';
 const base=is16?[.785,.820,.829,.836,.831]:is22?[.775,.806,.820,.825,.821]:[.789,.831,.849,.855,.867];
 const xs=c.cockpit;
 const stations=xs.map((x,i)=>[x,c.width*[.08,.80,1,.85,.08][i],base[i],c.heights[i],.038]);
 // A continuous one-piece transparency on the F-22 and F-35. The
 // F-16C has a distinct bow separating the main and small aft sections.
 const shell=[];
 for(let i=0;i<stations.length-1;i++){
   const start=stations[Math.max(0,i-1)],a=stations[i],b=stations[i+1],end=stations[Math.min(stations.length-1,i+2)];
   const ts=[0,.20,.4,.6,.8];
   if(is16&&i===2)ts.push(.76,.79);
   for(const t of ts.sort()){
     const at=(j)=>.5*((2*a[j])+(-start[j]+b[j])*t+
       (2*start[j]-5*a[j]+4*b[j]-end[j])*t*t+(-start[j]+3*a[j]-3*b[j]+end[j])*t*t*t);
     shell.push([a[0]+(b[0]-a[0])*t,at(1),at(2),at(3)]);
   }
 }
 shell.push(stations.at(-1));
 const glass=is22?'#89795b':is16?'#637f87':'#5c6d74';
 const vertex=(st,t)=>[st[0],st[1]*Math.cos(t),st[2]+st[3]*Math.sin(t)];
 for(let k=1;k<shell.length;k++)for(let j=0;j<20;j++){
   const a=j*Math.PI/20,b=(j+1)*Math.PI/20;
   const face=[vertex(shell[k-1],a),vertex(shell[k],a),vertex(shell[k],b),vertex(shell[k-1],b)];
   const frame=j===0||j===19||(is16&&shell[k-1][0]>=xs[2]+(xs[3]-xs[2])*.76-1e-6 && shell[k][0]<=xs[2]+(xs[3]-xs[2])*.79+1e-6);
   if(frame)r.polygon(face,'#4e5b60',false);
   else{
     // Overhead sky is lighter than the tint close to the sill.
     const light=.77+.27*Math.sin((a+b)/2);
     const col='#'+[1,3,5].map(i=>Math.round(parseInt(glass.slice(i,i+2),16)*light).toString(16).padStart(2,'0')).join('');
     glazingFace(r,face,col,is22?.81:.75);
   }
 }

}
function sideInlet(r,s,isRaptor){
 const mouth=isRaptor?
   [[-1.09,.310,.723],[-.84,.504,.746],[-1.04,.517,.466],[-1.23,.348,.441]]:
   [[-.99,.299,.743],[-.77,.474,.718],[-.719,.485,.573],[-.874,.482,.422],[-1.04,.353,.472]];
 const face=mouth.map(([x,y,z])=>[x,s*y,z]);
 const back=mouth.map(([x,y,z])=>[x+.76,s*(y+.035),z-.002]);
 const center=face.reduce((v,p)=>v.map((q,j)=>q+p[j]/face.length),[0,0,0]);
 const inner=face.map(p=>p.map((v,j)=>center[j]+(v-center[j])*.85));
 for(let i=0;i<face.length;i++){
   const next=(i+1)%face.length;
   r.polygon([face[i],back[i],back[next],face[next]],isRaptor?'#929ca1':'#6f7c86',false);
   r.polygon([face[i],face[next],inner[next],inner[i]],isRaptor?'#adb6b9':'#819099',false);
 }
 r.polygon(inner,'#35424b',false);
}
function upperFuselage(r,c,id){
 const is16=id==='f16',is22=id==='f22';
 loft(r,c.stations,(k,i,a)=>k<=2?(is22?'#909ba2':'#79868f'):Math.sin(a)>.08?c.finish:(is16?'#a5b0b3':is22?'#909da3':'#798690'),0,is16?24:20);
 if(is16)return;
 if(is22){
   for(const {sign:s} of sides){
     // Continuous chine ahead of the wing root, plus the two separate shoulders over the aft fuselage.
     wing(r,[[.135,-1.99,-.10,.673,.026],[.34,-1.41,-.07,.672,.033],[.515,-.91,-.01,.653,.018]],s,'#8e9ba3',{movable:false});
     loft(r,[[-.52,.01,.760,.025],[-.08,.144,.755,.088],[.47,.194,.757,.122],[1.28,.185,.72,.106],[1.81,.168,.681,.082],[2.15,.133,.652,.053]],'#929da5',s*.225,18);
   }
 }else{
   // A single rounded center spine rides higher through the back of the F-35A.
   loft(r,[[-.81,.10,.819,.067],[-.54,.205,.823,.104],[-.12,.236,.827,.101],[.50,.221,.821,.089],[1.19,.176,.787,.088],[1.74,.146,.747,.068],[1.99,.107,.718,.043]],'#687580',0,22);
 }
}
function tailfin(r,s,id,c){
 if(id==='f16'){
   fin(r,[[.48,.77],[1.03,.90],[1.53,1.59],[1.82,1.59],[1.80,.85],[2.04,.77]],0,c.finish,{thick:.038});
   return;
 }
 const is22=id==='f22', y=s*(is22?.407:.303);
 fin(r,is22?[[.73,.72],[1.05,.79],[1.45,1.514],[1.82,1.514],[1.85,.82],[1.96,.70]]:[[.96,.75],[1.12,.86],[1.53,1.386],[1.90,1.325],[1.97,.77],[2.02,.70]],
    y,c.finish,{cant:s*(is22?.37:.31),thick:.027});
}
function outlet(r,s,id){
 if(id==='f22'){
  const y=s*.205;
  const ends=[[1.80,.185,.091],[2.28,.178,.081],[2.43,.138,.059]];
  for(let j=1;j<ends.length;j++){
   const cross=([x,w,h])=>[[x,y-w,.595-h],[x,y+w,.595-h],[x,y+w,.595+h],[x,y-w,.595+h]];
   const a=cross(ends[j-1]),b=cross(ends[j]);
   for(let i=0;i<4;i++)r.polygon([a[i],b[i],b[(i+1)%4],a[(i+1)%4]],['#424c53','#637076','#79868a','#505b60'][i],false);
   if(j===2)r.polygon(b,'#29343a',false);
  }
 }else{
  const z=id==='f16'?.60:.625;
  const radius=id==='f16'?.19:.218;
  loft(r,[[1.90,radius*1.12,z,radius*1.12],[2.13,radius*1.04,z,radius*1.04],[2.37,radius,z,radius],[2.445,radius*.91,z,radius*.91]],'#66737b',0,24);
  r.discX(2.446,0,z,radius*.82,'#293239',24);
 }
}
function fighter(id,c){
 const is16=id==='f16',is22=id==='f22';
 return record({
  id,name:c.name,short:c.short,year:c.year,type:'Planes',detail:c.detail,
  source:{label:references[id][0],url:references[id][1]},
  specs:[['Length',c.length],['Wingspan',c.span],['Tail silhouette',c.tail],['Reference date',is16?'First U.S. Air Force delivery, 1984':is22?'Entered U.S. service, 2005':'Entered U.S. service, 2016']]
 },[
  section('airframe','Airframe','Trace the outside shape from the nose to the aft fuselage.',[
   piece('shell','Fuselage',is16?'The narrow forward fuselage widens at the wing roots.':'The broad wing roots blend with the sculpted fuselage.',[0,0,.12],r=>upperFuselage(r,c,id)),
   piece('canopy','Cockpit canopy','A single raised canopy sits on the centerline ahead of the wings.',[-.14,0,.29],r=>roundedCanopy(r,c,id)),
   ...(is16?[piece('inlet','Chin intake','The oval intake lip projects below the front of the fuselage.',[-.2,0,-.20],r=>{
     loft(r,[[-1.055,.218,.387,.112],[-.97,.235,.40,.132],[-.60,.26,.425,.144],[.25,.24,.432,.122]],'#9aa6ad',0,24);
     r.polygon(Array.from({length:24},(_,i)=>[-1.056,.200*Math.cos(i*Math.PI/12),.387+.09*Math.sin(i*Math.PI/12)]),'#344048',false);
   })]:sides.map(({id:part,sign:s,name})=>piece(part+'-inlet',name+' intake lip','The intake lip sits alongside the fuselage under the cockpit shoulder.',[-.14,s*.18,-.10],r=>sideInlet(r,s,is22))))
  ]),
  section('wings','Wings','Each wing is a separate exterior assembly.',sides.map(({id,sign:s,name})=>piece(id,name+' wing','The plan view shows the leading edge, trailing edge and tip geometry.',[0,s*.35,.08],r=>wing(r,c.wings,s,c.finish)))),
  section('tail','Tail surfaces','The vertical and horizontal surfaces have separate silhouettes.',[
   ...(is16?[piece('fin','Vertical fin','The F-16 has a single centerline fin.',[.1,0,.30],r=>tailfin(r,0,id,c))]:sides.map(({id:side,sign:s,name})=>piece(side+'-fin',name+' fin','This fin leans outward from the aft fuselage.',[.1,s*.20,.31],r=>tailfin(r,s,id,c)))),
   ...sides.map(({id,sign:s,name})=>piece(id+'-tailplane',name+' tailplane','The horizontal surface sits behind the main wing.',[.23,s*.18,.04],r=>wing(r,c.tailplan,s,c.finish)))
  ]),
  section('outlets','Exhaust silhouette',is22?'Two separate rectangular outlets sit side by side.':'A circular outlet finishes the aft fuselage.',
   (is22?sides:[{id:'center',sign:0,name:'Center'}]).map(({id:side,sign:s,name})=>piece(side,name+' outlet',is22?'The aft lip is flat across the top and bottom.':'The circular opening sits at the center of the tail.',[.30,s*.10,0],r=>outlet(r,s,id))))
 ]);
}
export const fighterModels=Object.entries(fighters).map(([id,c])=>fighter(id,c));
const bomberSkin=[[-2.16,.018,.53,.024],[-2.09,.105,.55,.105],[-1.94,.15,.571,.159],[-1.73,.159,.60,.223],[-1.47,.164,.596,.232],[-1.26,.157,.586,.172],[-.8,.155,.565,.155],[.97,.144,.56,.144],[1.42,.113,.575,.115],[1.85,.059,.603,.063],[2.14,.01,.631,.018]];
const bomberPanes=[
 [[-1.926,1.551],[-1.912,.668],[-1.765,.807],[-1.790,1.552]],
 [[-1.890,.633],[-1.752,.786],[-1.614,.94],[-1.633,.491]],
 [[-1.618,.490],[-1.601,.946],[-1.507,.886],[-1.50,.535]]
];
export const stratofortress=record({
 id:'b52',name:'Boeing B-52H Stratofortress',short:'B-52H',year:1961,type:'Planes',
 detail:'Count the nacelles in pairs. This B-52H has eight engines in four pods along a wing that spans farther than the fuselage is long.',
 source:{label:'U.S. Air Force · B-52H exterior and dimensions',url:'https://www.minot.af.mil/About-Us/Fact-Sheets/Display/Article/264269/b-52h-stratofortress/'},
 specs:[['Length','159 ft 4 in'],['Wingspan','185 ft'],['Engines','Eight TF33s in four pods'],['First H-model delivery','1961']]
},[
 section('fuselage','Fuselage','The cockpit breaks the otherwise narrow outline of the upper fuselage.',[
  piece('shell','Fuselage','A blunt nose tapers up to the raised cockpit, then back into the long narrow cabin.',[0,0,.14],r=>windowedLoft(r,bomberSkin,'#818c8d',bomberPanes,32)),
  piece('glazing','Cockpit glazing','Framed windshields meet above the nose. Separate side panes continue aft along the raised cockpit.',[-.17,0,.27],r=>{
    for(const {sign,name} of sides)bomberPanes.forEach((pane,i)=>r.instance(name+' cockpit pane '+(i+1),()=>{
      framedPane(r,bomberSkin,sign,pane,{glass:'#4c6372',gasket:'#46515b',frame:.938,opacity:.74});
    }));
  })
 ]),
 section('wings','Swept wings','The high wings have long, drooping outer panels.',sides.map(({sign:s,id,name})=>piece(id,name+' wing','The outer section descends slightly toward its narrow tip.',[0,s*.39,.10],r=>
  wing(r,[[.10,-.79,.41,.666,.065],[.49,-.48,.48,.667,.054],[1.30,.08,.67,.63,.04],[2.10,.63,.90,.56,.021],[2.50,.94,1.06,.50,.012]],s,'#879298')))),
 section('pods','Paired engine pods','Each pylon carries two separately visible nacelles.',sides.flatMap(({sign:s,id,name})=>['inner','outer'].map((position,j)=>piece(id+'-'+position,name+' '+position+' pod','Two circular inlets share one pylon.',[-.12,s*.17,-.24],r=>{
  const x=j?.18:-.40,y=j?1.36:.61,z=j?.399:.41;
  fin(r,[[x-.03,z+.05],[x+.17,z+.246],[x+.40,z+.236],[x+.35,z+.05]],s*y,'#7f898a',{thick:.022});
  for(const d of [-.083,.083])nacelle(r,x-.15,s*(y+d),z,.49,.081,'#8c9799');
 })))),
 section('tail','Tail surfaces','A single fin rises over two swept tailplanes.',[
  piece('fin','Vertical tail','The H model carries the shorter fin used on the later B-52 variants.',[.14,0,.27],r=>fin(r,[[1.02,.655],[1.30,.72],[1.77,1.19],[2.07,1.2],[2.02,.65]],0,'#829094')),
  ...sides.map(({sign:s,id,name})=>piece(id,name+' tailplane','The tailplane joins the rear fuselage below the fin.',[.17,s*.24,.10],r=>wing(r,[[.025,1.14,2,.634,.033],[.71,1.73,2.10,.67,.014],[.75,1.81,2.12,.67,.010]],s,'#899397')))
 ])
]);

// The wing exhibit is a magnification of the same outline used on the airframe.
export function fighterWingProfile(id){return fighters[id].wings;}
