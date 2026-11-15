import {record,section,piece,sides,loft,windowedLoft,framedPane,ovalOutline,onSkin,wing,fin,tube,blade,tire,paint} from './air-mesh.js';
const clay='#787c62', drab='#616954', shadow='#3c4846';
const types={
 uh60:{name:'Sikorsky UH-60M Black Hawk',short:'UH-60M Black Hawk',year:2006,color:drab,tailX:1.99,tailZ:1.32,tailSide:.115,tailRadius:.388,
  source:{label:'Sikorsky · UH-60M photographs and silhouette',url:'https://sustainability.lockheedmartin.com/content/dam/lockheed-martin/rms/documents/black-hawk/sikorsky-UH60M-brochure.pdf'},
  detail:'The Black Hawk sits on two forward main wheels and a tailwheel. Its four-blade rotor spans a broad cabin that narrows abruptly into the raised tail.',
  specs:[['Main rotor','Four blades'],['Undercarriage','Two main wheels and a tailwheel'],['First Army delivery','2006']],
  body:[[-1.725,.008,.526,.011],[-1.70,.051,.524,.066],[-1.68,.072,.527,.105],[-1.54,.226,.53,.185],[-1.34,.292,.59,.288,.234],[-1.09,.320,.624,.347,.277],[-.82,.337,.640,.347,.287],[.12,.337,.641,.344,.287],[.42,.291,.642,.279,.224],[.66,.169,.665,.158,.15],[.79,.105,.678,.098]]},
 mh6:{name:'MH-6M Little Bird',short:'MH-6M Little Bird',year:'2000s',color:'#535e59',tailX:2.05,tailZ:1.13,tailSide:-.089,tailRadius:.318,
  source:{label:'Congressional Research Service · Little Bird rotor configuration, p. 7',url:'https://sgp.fas.org/crs/weapons/RL32447.pdf'},
  detail:'The Little Bird’s almost egg-shaped cabin ends at a slender tail boom. The six blades above it and the four small tail-rotor blades identify the M configuration shown here.',
  specs:[['Main rotor','Six blades'],['Tail rotor','Four blades'],['Undercarriage','Two skids'],['Variant','M-model upgrade, 2000s']],
  body:[[-1.436,.003,.7,.004],[-1.43,.04,.701,.04],[-1.38,.18,.70,.20],[-1.21,.31,.724,.327],[-.94,.404,.74,.407],[-.67,.435,.748,.44],[-.38,.420,.747,.421],[-.10,.372,.738,.362],[.13,.288,.742,.29],[.32,.165,.752,.156],[.40,.076,.772,.08]]},
 ch47:{name:'Boeing CH-47F Chinook',short:'CH-47F Chinook',year:2024,color:'#858363',
  source:{label:'Boeing · CH-47F Block II exterior and dimensions',url:'https://www.boeing.com/defense/military-rotorcraft/h-47-chinook'},
  detail:'The Chinook has a rotor at each end of the cabin. The aft pylon stands noticeably higher than the forward one, above the upswept cargo ramp.',
  specs:[['Rotor arrangement','Two three-bladed rotors in tandem'],['Rotor diameter','60 ft each'],['First Block II delivery','2024']],
  body:[[-1.401,.005,.471,.008],[-1.39,.030,.469,.040],[-1.37,.055,.467,.082],[-1.29,.189,.460,.177],[-1.12,.238,.489,.235,.191],[-.93,.262,.53,.267,.232],[-.73,.267,.536,.271,.233],[.66,.267,.536,.271,.233],[.90,.254,.56,.248,.204],[1.16,.198,.61,.18,.139],[1.29,.10,.688,.10,.082]]}
};
// Only the visible envelope is represented. The windshields meet at the nose
// crown; lower chin lights remain separate from the pilot's front and door panes.
const rotorPanes={
 mh6:[
  ['bubble windshield',[[-1.424,1.555],[-1.417,-.75],[-1.25,-.89],[-.945,-.37],[-.986,1.304],[-1.052,1.55]]],
  ['pilot door light',[[-.930,-.39],[-.971,1.25],[-.69,1.121],[-.64,-.39]]],
  ['aft door opening',[[-.603,-.40],[-.658,1.02],[-.256,.97],[-.162,.08],[-.208,-.35]]]
 ],
 uh60:[
  ['windshield',[[-1.51,1.552],[-1.506,.32],[-1.26,.458],[-1.177,1.325],[-1.252,1.55]]],
  ['chin light',[[-1.582,.12],[-1.54,-.53],[-1.269,-.49],[-1.30,.16]]],
  ['pilot door light',[[-1.248,.212],[-1.15,1.145],[-.956,1.00],[-.956,.129]]],
  ['forward cabin light',[[-.910,.12],[-.894,.875],[-.612,.859],[-.61,.12]]],
  ['cabin door forward light',[[-.551,.12],[-.549,.854],[-.244,.854],[-.241,.12]]],
  ['cabin door aft light',[[-.196,.12],[-.196,.854],[.101,.850],[.109,.12]]]
 ],
 ch47:[
  ['windshield',[[-1.239,1.558],[-1.278,.31],[-1.100,.435],[-.968,1.356],[-1.038,1.556]]],
  ['chin light',[[-1.308,.09],[-1.287,-.53],[-1.116,-.52],[-1.124,.175]]],
  ['pilot door light',[[-1.087,.19],[-.952,1.147],[-.797,1.046],[-.799,.137]]],
  ...Array.from({length:4},(_,i)=>['circular cabin window '+(i+1),ovalOutline(-.591+i*.326,.060,.276,.231)])
 ]
};
function helicopterWindows(r,id,c){
  for(const {sign,name} of sides)for(const [label,shape] of rotorPanes[id]){
    r.instance(name+' '+label,()=>{
      framedPane(r,c.body,sign,shape,{glass:id==='mh6'?'#78969d':'#466071',gasket:'#303c3f',frame:label.startsWith('circular')?.898:.951,opacity:id==='mh6'?.62:.68});
      if(label==='windshield'){
        const contact=shape[1],inboard=shape[0];
        const at=t=>onSkin(c.body,sign,contact.map((v,i)=>v+(inboard[i]-v)*t),1.024);
        tube(r,at(.06),at(.38),.0038,'#333b3c',8);
        tube(r,at(.31),at(.72),.0045,'#30383a',8);
      }
    });
  }
}
function housing(r,x,y,z,w,length,col) {
 loft(r,[[x,.012,z,.02],[x+.07*length,w*.70,z,w*.65],[x+.22*length,w,z,w*.85],[x+.72*length,w*.94,z,w*.88],[x+length,w*.61,z,w*.60]],col,y,18);
 const rr=w*.52;
 r.polygon(Array.from({length:16},(_,i)=>[x+length+.001,y+rr*Math.cos(i*Math.PI/8),z+rr*Math.sin(i*Math.PI/8)]),'#3c4748',false);
}
function rotorGroup(id,label,base,count,radius,angle,chord){
 return section(id,label,'Select the hub or a single blade to see its shape.',[
  piece('hub','Rotor head','The central head joins the radial blades to the mast.',[0,0,.19],r=>{
   tube(r,[base[0],base[1],base[2]-.138],base,.044,paint.steel,16);
   tube(r,[base[0],base[1],base[2]-.012],[base[0],base[1],base[2]+.018],.093,shadow,16);
   for(let i=0;i<count;i++){
    const a=angle+Math.PI*2*i/count;
    tube(r,base,[base[0]+Math.cos(a)*radius*.10,base[1]+Math.sin(a)*radius*.10,base[2]],.023,paint.steel,8);
   }
  }),
  ...Array.from({length:count},(_,i)=>{
    const a=angle+i*Math.PI*2/count;
    return piece('blade'+(i+1),'Blade '+(i+1),'The blade lifts clear of the hub as a single piece.',[.20*Math.cos(a),.20*Math.sin(a),.30],r=>blade(r,base,a,radius,chord,i%2?'#4c5555':'#576362'));
  })
 ]);
}
function tailRotor(r,c,tilted) {
 const p=[c.tailX,c.tailSide,c.tailZ];
 tube(r,[p[0],0,p[2]],[p[0],p[1],p[2]],.037,paint.steel);
 for(let i=0;i<4;i++)blade(r,p,.35+i*Math.PI/2,c.tailRadius,.056,'#6d7875',{vertical:true,cant:tilted?-.349:0});
}
function aftParts(id,c) {
 if(id==='ch47')return [
   piece('front-pylon','Forward rotor pylon','The shorter forward pylon stands immediately behind the cockpit.',[-.09,0,.16],r=>loft(r,[[-1.04,.055,.777,.04],[-.97,.135,.811,.101],[-.85,.139,.828,.11],[-.61,.140,.811,.089],[-.35,.085,.786,.029]],c.color)),
   piece('aft-pylon','Aft rotor pylon','The aft pylon reaches above the forward rotor plane. The hubs remain separated in height.',[.12,0,.23],r=>{
    loft(r,[[.59,.13,.788,.049],[.75,.170,.896,.148],[.87,.154,.987,.182],[1.04,.143,1.004,.156],[1.18,.12,.931,.153],[1.28,.09,.792,.124]],c.color);
   }),
   ...sides.map(({id,sign:s,name})=>piece(id+'-cowl',name+' rear engine cowl','A cylindrical cowl projects from the rear pylon on this side.',[0,.24*s,.14],r=>housing(r,.69,s*.198,.85,.091,.49,clay)))
 ];
 const small=id==='mh6',start=small?.29:.60,end=small?2.01:1.94;
 return [
  piece('boom','Tail boom','The narrowing boom leaves the rear of the cabin and rises toward the tail.',[.20,0,.06],r=>loft(r,[
    [start,small?.12:.16,small?.78:.675,small?.107:.143],[start+.30,small?.088:.104,small?.82:.69,small?.085:.103],[end-.31,small?.05:.066,small?.984:.85,.061],[end,.039,small?1.01:.94,.040]],c.color,0,18)),
  piece('fin','Tail fin',small?'A narrow fin rises through the high-mounted horizontal tail.':'The tail pylon sweeps up to the four-blade tail rotor.',[.16,0,.22],r=>fin(r,small?[[1.78,.974],[1.93,1.29],[2.12,1.43],[2.15,1.41],[2.06,1.025],[2.13,.83],[2.05,.81]]:[[1.64,.862],[1.80,1.06],[1.95,1.43],[2.09,1.47],[2.08,1.13],[2.01,.93]],0,c.color,{thick:.029})),
  piece('tailrotor','Tail rotor','Four blades form a separate rotor on the side of the tail.',[.13,Math.sign(c.tailSide)*.23,.10],r=>tailRotor(r,c,!small)),
  ...sides.map(({id:side,sign:s,name})=>piece(side+'-stabilizer',name+' stabilizer','A short horizontal surface extends out from the tail.',[.13,s*.17,.10],r=>{
    const z=small?1.33:.944;
    wing(r,[[.008,small?1.91:1.48,small?2.10:1.91,z,.025],[small?.37:.55,small?1.95:1.59,small?2.12:1.97,z+.013,.013]],s,c.color);
    if(small)fin(r,[[1.95,z+.006],[2.00,z+.088],[2.12,z+.088],[2.12,z+.01]],s*.37,c.color,{thick:.009});
  }))
 ];
}
function undercarriage(id,c) {
 if(id==='mh6')return sides.map(({sign:s,id:part,name})=>piece(part,name+' skid','Two supports carry a long skid tube with an upturned toe.',[0,s*.23,-.15],r=>{
   const y=.44*s;
   for(const x of [-.95,-.18])tube(r,[x,s*.225,.497],[x+.11,y,.149],.025,shadow);
   tube(r,[-1.32,y,.199],[-1.19,y,.124],.023,paint.steel);
   tube(r,[-1.19,y,.124],[.24,y,.124],.023,paint.steel);
 }));
 if(id==='ch47')return sides.flatMap(({sign:s,id:part,name})=>['forward','aft'].map((pos,i)=>piece(part+'-'+pos,name+' '+pos+' gear','The wheel and short supporting strut are shown together.',[i?.12:-.12,s*.18,-.16],r=>{
   const x=i?.94:-.79;
   tube(r,[x,s*.15,.403],[x+.017,s*.24,.096],.023,shadow);
   for(const d of i?[0]:[-.025,.025])tire(r,x+.017,s*.24+d,.096,.096,.042);
 })));
 return [
  ...sides.map(({sign:s,id:part,name})=>piece(part,name+' main wheel','The main wheel stands outboard of the forward cabin.',[-.10,s*.21,-.14],r=>{
    tube(r,[-.92,s*.23,.54],[-.83,s*.40,.145],.030,shadow);
    tube(r,[-.67,s*.245,.48],[-.83,s*.40,.145],.021,shadow);tire(r,-.83,s*.4,.145,.145,.076);
  })),
  piece('tailwheel','Tailwheel','The single trailing wheel sits below the aft boom.',[.15,0,-.14],r=>{
    tube(r,[1.21,0,.714],[1.47,0,.117],.031,shadow);
    tube(r,[1.51,0,.77],[1.47,0,.117],.021,shadow);tire(r,1.47,0,.117,.117,.069);
  })
 ];
}
function helicopter(id,c){
 const chinook=id==='ch47',little=id==='mh6';
 const groups=[
  section('cabin','Cabin exterior','Select the body or glazing to separate the outside surfaces.',[
   piece('shell',chinook?'Cargo fuselage':'Cabin shell',chinook?'The deep fuselage tapers up behind the aft cargo compartment.':little?'The compact teardrop shell terminates where the slim tail boom begins.':'The wide cabin transitions into a narrow boom behind the passenger doors.',[0,0,.15],r=>{
    windowedLoft(r,c.body,(k,i,a)=>Math.sin(a)<-.55?shadow:c.color,rotorPanes[id].map(pane=>pane[1]),36);
    if(chinook)for(const {sign:s} of sides)housing(r,-.91,s*.21,.383,.084,1.92,c.color);
   }),
   piece('glazing',chinook?'Cockpit and cabin windows':'Cockpit glazing and side windows',chinook?'Round cabin windows contrast with the larger framed cockpit panes.':'Separate windshields and side lights follow the cabin. Look at the slight recess between each pane and its dark perimeter seal.',[-.10,0,.24],r=>helicopterWindows(r,id,c)),
   ...(!chinook?[piece('cowling','Upper cowling',little?'A compact fairing sits at the base of the rotor mast.':'Twin upper cowls flank the rotor mast above the cabin.',[.09,0,.19],r=>{
    if(little)housing(r,-.64,0,1.082,.165,.66,c.color);
    else for(const {sign:s} of sides)housing(r,-.57,s*.166,.981,.133,.91,c.color);
   })]:[])
  ]),
  section('tail',chinook?'Rotor pylons':'Tail assembly',chinook?'The two pylons differ in height and shape.':'The tail boom carries the fin and horizontal surfaces.',aftParts(id,c)),
  ...(chinook?[rotorGroup('forward','Forward rotor',[-.86,0,1.022],3,1.58,.59,.121),rotorGroup('aft','Aft rotor',[.959,0,1.265],3,1.58,-.39,.121)]:
   [rotorGroup('main','Main rotor',[little?-.53:-.351,0,little?1.34:1.20],little?6:4,little?1.82:2.05,.38,little?.105:.119)]),
  section('gear',little?'Landing skids':'Landing gear','These supports stay fixed to their own sides as the view expands.',undercarriage(id,c))
 ];
 return record({id,name:c.name,short:c.short,year:c.year,type:'Helicopters',detail:c.detail,specs:c.specs,source:c.source},groups);
}
export const rotorModels=Object.entries(types).map(([id,c])=>helicopter(id,c));
