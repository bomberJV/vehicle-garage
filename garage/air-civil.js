import {propBlade} from './air-propellers.js';
import {record,section,piece,sides,loft,windowedLoft,skin,framedPane,onSkin,ovalWindow,ovalOutline,wing,fin,tube,nacelle,wheelLeg,tire,surfaceBand,paint} from './air-mesh.js';

const white=paint.white, metal=paint.steel;
const lateral=(s,n=.42)=>[0,s*n,.08];
// Boeing 747-400 airport planning, figure 2.2.1. The canted winglet adds
// .0465 model units outboard of its root at the tip of the main wing.
const jumboWingletRoot = 4.89 * (64.44 / 70.67) / 2 - .0465;
// Cessna 172S POH, figure 1-1. Length 27 ft 2 in, span 36 ft 1 in.
const skyhawkHalfSpan = 3.791 * (433 / 326) / 2;
const b747=[
 [-2.50,.014,.52,.022],[-2.46,.095,.54,.104],[-2.34,.168,.57,.17,.16],
 [-2.15,.212,.59,.285,.205],[-1.94,.229,.59,.366,.220],[-1.65,.230,.59,.38,.23],
 [-1.05,.230,.59,.38,.23],[-.83,.230,.59,.32,.23],[-.56,.230,.59,.24,.23],
 [.73,.230,.59,.232,.230],[1.24,.213,.60,.218,.202],[1.58,.176,.63,.172,.160],
 [1.97,.108,.68,.115,.093],[2.28,.038,.71,.047,.036],[2.375,.008,.71,.012]
];
const gulf=[
 [-2.405,.010,.52,.012],[-2.31,.092,.54,.076],[-2.14,.163,.56,.132],
 [-1.94,.212,.58,.21],[-1.75,.218,.59,.237],[-1.47,.226,.59,.244],
 [.96,.226,.59,.244],[1.35,.205,.61,.218],[1.64,.166,.64,.16],
 [1.92,.116,.68,.105],[2.15,.058,.72,.059],[2.39,.009,.75,.012]
];
function transportWings(isJumbo) {
  return sides.map(({sign:s,id,name})=>piece(id,name+' wing',
    isJumbo?'The outer panel rises toward a short upturned winglet. Each wing carries two engine pylons.':'The swept wing tapers into a sharply curved tip. The engines sit farther aft on the fuselage.',
    lateral(s),r=>{
      const st=isJumbo?[[.15,-.75,.79,.46,.082],[.57,-.47,.79,.49,.072],[1.16,.00,.92,.54,.057],[1.95,.59,1.06,.64,.031],[jumboWingletRoot,.81,1.095,.69,.018]]:
        [[.13,-.66,.77,.47,.062],[.69,-.28,.87,.51,.05],[1.49,.26,1.03,.56,.031],[2.30,.89,1.15,.66,.015],[2.44,1.055,1.17,.74,.009],[2.50,1.14,1.20,.835,.005]];
      wing(r,st,s,isJumbo?'#b6c2c8':'#d8e1e4');
      if(isJumbo)fin(r,[[.81,.69],[.96,.864],[1.034,.865],[1.095,.69]],s*jumboWingletRoot,'#325b77',{cant:s*.22,thick:.008});
      const end=st.at(-1);
      tube(r,[end[1],s*end[0],end[3]+.01],[end[1]+.036,s*end[0],end[3]+.01],.009,s<0?'#a83f3a':'#488875',8);
    }));
}
function tailPieces(isJumbo) {
  return [
    piece('fin','Vertical tail',isJumbo?'The swept fin rises from the narrowing aft fuselage.':'The tall fin carries the horizontal stabilizer at its tip.',[.15,0,.38],r=>{
      const stations=isJumbo?[[1.06,.72],[1.39,.83],[2.13,1.395],[2.39,1.4],[2.29,.72]]:
        [[1.26,.70],[1.55,.83],[1.91,1.42],[2.22,1.44],[2.26,.72]];
      fin(r,stations,0,isJumbo?'#37617b':'#466a83',{thick:.024});
    }),
    ...sides.map(({sign:s,id,name})=>piece(id,name+' tailplane',isJumbo?'A low-mounted horizontal surface extends behind the wing.':'The tailplane joins the top of the fin, above the engine nacelles.',[.18,s*.27,.18],r=>{
      const stations=isJumbo?[[.06,1.35,2.24,.70,.029],[.72,1.89,2.32,.78,.015],[.79,1.99,2.34,.79,.011]]:
        [[.012,1.76,2.40,1.426,.024],[.7,2.20,2.47,1.43,.009]];
      wing(r,stations,s,isJumbo?'#b6c2c8':white);
    }))
  ];
}
// PPG's 747-400 glazing layout has a main windshield and two side lights
// at each station. The center-post edge follows the crown, not a stripe on
// either side of the nose. Intermediate sill vertices follow the falling
// outboard edge seen head-on on the ANA 747-400. Pairs are X and skin angle.
const jumboFlight=[
  [[-2.196,1.563],[-2.200,1.38],[-2.191,1.18],[-2.157,.985],[-2.092,.795],[-2.074,.752],[-1.950,.945],[-2.035,1.563]],
  [[-2.062,.746],[-1.941,.934],[-1.846,.950],[-1.862,.658],[-1.929,.669]],
  [[-1.851,.651],[-1.835,.941],[-1.753,.910],[-1.759,.633]]
];
const gulfFlight=[
  [[-2.146,1.551],[-2.034,.637],[-1.878,.777],[-1.929,1.551]],
  [[-2.018,.620],[-1.865,.772],[-1.694,.70],[-1.703,.340],[-1.850,.334]]
];
function flightDeck(r,stations,jumbo) {
  const shapes=jumbo?jumboFlight:gulfFlight;
  for(const {sign,name} of sides)shapes.forEach((shape,i)=>{
    r.instance(name+' '+['windshield','forward side window','aft side window'][i],()=>{
      framedPane(r,stations,sign,shape,{glass:i?'#395463':'#4d6b7a',opacity:jumbo?.65:.71,frame:jumbo?.951:.958});
      if(i===0){
        const anchor=onSkin(stations,sign,jumbo?[-2.074,.752]:shape[1],1.016);
        const arm=onSkin(stations,sign,[jumbo?-2.111:-2.064,jumbo?.964:.896],1.027);
        const tip=onSkin(stations,sign,[jumbo?-2.150:-2.083,jumbo?1.253:1.162],1.027);
        tube(r,anchor,arm,jumbo?.0018:.0028,'#333d40',6);
        tube(r,arm,tip,jumbo?.0024:.0036,'#30383b',6);
      }
    });
  });
}
function jamb(r,stations,side,shape,frame){
  const outer=shape.map(p=>onSkin(stations,side,p,1.019));
  for(let i=0;i<shape.length;i++)tube(r,outer[i],outer[(i+1)%shape.length],frame,'#78868b',7);
}
function deckDoor(r,stations,side,x,z0,z1,w){
  // Outline follows the skin's changing curvature from sill to lintel.
  const left=x-w/2,right=x+w/2,corner=.008;
  const loop=[[left+corner,z0],[right-corner,z0],[right,z0+.04],[right,z1-.04],[right-corner,z1],[left+corner,z1],[left,z1-.04],[left,z0+.04]];
  const stride=[];
  for(let j=0;j<loop.length;j++){
    const a=loop[j],b=loop[(j+1)%loop.length],n=Math.max(1,Math.ceil(Math.abs(a[1]-b[1])/.13));
    for(let k=0;k<n;k++)stride.push(a.map((v,i)=>v+(b[i]-v)*k/n));
  }
  jamb(r,stations,side,stride,.0016);
  const xh=x-.014;
  tube(r,onSkin(stations,side,[xh,.03],1.021),onSkin(stations,side,[xh+.015,.03],1.021),.0025,'#79868a',7);
}
const gulfOvals=Array.from({length:8},(_,i)=>[-1.36+i*.260,.064,.26,.25]);
const gulfOpenings=[...gulfFlight,...gulfOvals.map(v=>ovalOutline(...v))];
const lowerDoors=[-1.977,-1.272,-.30,.62,1.495],upperDoor=-1.179;
// Representative passenger cabin. Airlines can blank windows at monuments.
const jumboLower=Array.from({length:58},(_,i)=>-2.204+i*.067)
  .filter(x=>!lowerDoors.some(door=>Math.abs(x-door)<.052)).map(x=>[x,.0123,.129,.077]);
const jumboUpper=Array.from({length:15},(_,i)=>-1.691+i*.0695)
  .filter(x=>Math.abs(x-upperDoor)>.043).map(x=>[x,.0123,.726,.058]);
const jumboOpenings=[...jumboFlight,...[...jumboLower,...jumboUpper].map(v=>ovalOutline(...v))];
export const jumbo=record({
 id:'boeing747',name:'Boeing 747-400',short:'747-400',year:1988,type:'Planes',
 motion:{assembly:'engines',name:'Engine fans',description:'The four inlet fans turn together in this slowed display. The nacelles and pylons stay fixed.'},
 detail:'The passenger 747-400 carries its flight deck upstairs. Follow the hump back to where it meets the main cabin, or isolate one of the four engines.',
 sources:[{label:'PPG · 747 windshield and two side windows',url:'https://www.ppg.com/en-US/aerospace/product/b747/PLP0000016238'},
 {label:'Powerhouse · 747 windscreen, object 96/154/1',url:'https://collection.powerhouse.com.au/object/149511'},
 {label:'Reinhold Möller · ANA 747-400 flight deck, front view',url:'https://commons.wikimedia.org/wiki/File:Boeing_747_Jumbo_front_cockpit_windows.jpg'}],
 source:{label:'Boeing · 747-400 airport planning drawings',url:'https://www.boeing.com/content/dam/boeing/v2/airports/acaps/747-400_Rev_F.pdf'},
 specs:[['Length','70.67 m'],['Design wingspan','64.44 m'],['Engines shown','Four GE CF6-80C2 turbofans'],['Reference date','First flight, 1988']]
},[
 section('fuselage','Fuselage and cabin','The extended upper deck sits above the continuous passenger fuselage.',[
  piece('shell','Double-deck fuselage','The upper profile tapers back into the cylindrical main deck ahead of the wing.',[0,0,.18],r=>{
    windowedLoft(r,b747,(k,i,a)=>Math.sin(a)<-.39?'#71929f':white,jumboOpenings,36);
    r.box(-2.075,-.121,.704,-1.71,.121,.717,'#56616a');
    r.box(-2.131,-.111,.733,-2.068,.111,.791,'#34434c');
    const rearWall=Array.from({length:23},(_,i)=>[-1.728,.183*Math.cos(i*Math.PI/22),.758+.175*Math.sin(i*Math.PI/22)]);
    r.polygon(rearWall,'#53595a',false);
    r.box(-2.03,-.16,.558,1.50,.16,.567,'#788289');
    for(const side of [-1,1]){
      for(const x of lowerDoors)deckDoor(r,b747,side,x,-.39,.499,.063);
      deckDoor(r,b747,side,upperDoor,.465,1.055,.057);
    }
    for(const y of [-.070,.070]){
      r.box(-1.924,y-.035,.741,-1.851,y+.035,.758,'#646768');
      r.profile([[-1.872,.755],[-1.851,.755],[-1.837,.827],[-1.857,.830]],y-.032,y+.032,'#565f60');
      r.box(-1.851,y-.021,.824,-1.836,y+.021,.846,'#5f6363');
    }
    for(const {sign:s} of sides)surfaceBand(r,b747,s,-2.32,1.98,-.12,.07,'#39637c',45);
  }),
  piece('cockpit','Flight-deck glazing','Two main windshields meet at the center post on the upper deck. On each side a forward and an aft side window follow the taper of the nose.',[-.2,0,.33],r=>flightDeck(r,b747,true)),
  piece('cabin','Passenger windows','A second, shorter row follows the upper deck. The main row continues behind the wing.',[0,0,.32],r=>{
    for(const {sign,name} of sides)for(const [deck,panes] of [['main',jumboLower],['upper',jumboUpper]]){
      panes.forEach((v,i)=>r.instance(name+' '+deck+' window '+(i+1),()=>ovalWindow(r,b747,sign,...v,true)));
    }
  })
 ]),
 section('wings','Wings','The inboard and outboard panels meet at the change in sweep.',transportWings(true)),
 section('engines','Engines and pylons','Four individual nacelles hang below the swept wings.',sides.flatMap(({sign:s,id,name})=>['inboard','outboard'].map((station,j)=>piece(id+'-'+station,name+' '+station+' engine',
  'The pylon and nacelle lift out together. The dark intake, metal lip and tapered exhaust belong to the same engine.',[-.10,s*.18,-.23],(r,phase)=>{
    const x=j?.25:-.32,y=s*(j?1.32:.75),z=j?.365:.295;
    fin(r,[[x+.18,z+.055],[x+.28,z+.26],[x+.57,z+.24],[x+.43,z+.055]],y,metal,{thick:.022});
    nacelle(r,x-.14,y,z,.54,.100,white,{fanBlades:22,phase});
  })))),
 section('tail','Tail surfaces','The horizontal tail sits below the tall vertical fin.',tailPieces(true)),
 section('gear','Landing gear','Four main bogies and a separate nose gear support the aircraft.',[
  piece('nose','Nose gear','The forward strut carries two wheels.',[-.17,0,-.18],r=>wheelLeg(r,-1.87,0,.43,1,{rad:.052})),
  ...sides.flatMap(({sign:s,id,name})=>['body','wing'].map((mount,j)=>piece(id+'-'+mount,name+' '+mount+' gear','Four wheels sit on two axles in this main bogie.',[.12,s*.17,-.22],r=>wheelLeg(r,j?.33:.65,s*(j?.41:.13),.43,2,{rad:.052}))))
 ])
]);

export const gulfstream=record({
 id:'gulfstreamg800',name:'Gulfstream G800',short:'G800',year:2025,type:'Planes',
 motion:{assembly:'engines',name:'Engine fans',description:'The two inlet fans turn in their housings. Open a nacelle to follow the shafts back through its core.'},
 detail:'The G800’s oval cabin windows sit in a line ahead of its two rear-mounted engines. Its horizontal tail rides above both.',
 sources:[{label:'Gulfstream · G800 exterior photograph and side profile',url:'https://assets.gulfstream.aero/downloads/g800.pdf'}],
 source:{label:'Gulfstream · G800 dimensions and exterior',url:'https://www.gulfstream.com/en/aircraft/gulfstream-g800'},
 specs:[['Length','99 ft 9 in'],['Wingspan','103 ft'],['Cabin windows','16 panoramic ovals'],['Powerplants','Two Rolls-Royce Pearl 700']]
},[
 section('fuselage','Cabin and fuselage','A long cabin runs between the tapered nose and the aft engine mounts.',[
  piece('shell','Fuselage','The body tapers upward behind the cabin.',[0,0,.18],r=>{windowedLoft(r,gulf,white,gulfOpenings,32);
    r.box(-1.96,-.15,.490,.83,.15,.503,'#596970');
    r.box(-1.996,-.118,.539,-1.91,.118,.633,'#384851');
    r.box(-1.625,-.153,.503,-1.608,.153,.762,'#5a6064');
    for(const y of [-.079,.079]){
      r.profile([[-1.798,.578],[-1.774,.574],[-1.75,.69],[-1.779,.70]],y-.042,y+.042,'#6c655e');
      r.box(-1.778,y-.026,.691,-1.75,y+.026,.719,'#746d63');
    }
    for(const x of [-1.36,-.812,-.264,.284])for(const y of [-.11,.11])r.box(x,y-.031,.51,x+.024,y+.031,.65,'#87785f');
    for(const {sign:s} of sides)surfaceBand(r,gulf,s,-2.23,1.87,-.29,.085,'#376382');}),
  piece('cockpit','Flight deck','Sloping cockpit glazing wraps around the forward fuselage.',[-.22,0,.27],r=>flightDeck(r,gulf,false)),
  piece('windows','Oval cabin windows','Eight ovals on either side give the cabin its familiar Gulfstream profile.',[0,0,.29],r=>{for(const {sign,name} of sides)gulfOvals.forEach((v,i)=>r.instance(name+' panoramic window '+(i+1),()=>ovalWindow(r,gulf,sign,...v,true)));})
 ]),
 section('wings','Swept wings','Curved, upswept tips extend the wings beyond the fuselage length.',transportWings(false)),
 section('engines','Aft engine pods','Each engine meets the aft fuselage on a short horizontal pylon.',sides.map(({sign:s,id,name})=>piece(id,name+' nacelle','The outer cowl and its attachment pylon form one visible silhouette.',[0,s*.32,.12],(r,phase)=>{
  wing(r,[[.15,.65,1.39,.66,.018],[.39,.79,1.38,.69,.016]],s,metal);
  nacelle(r,.64,s*.418,.70,.885,.134,white,{fanBlades:22,phase});
 }))),
 section('tail','T-tail','The tailplane spans the top of the fin.',tailPieces(false)),
 section('gear','Landing gear','The two main legs carry wheel pairs.',[
  piece('nose','Nose gear','The nose wheels sit below the flight deck.',[-.16,0,-.18],r=>wheelLeg(r,-1.59,0,.45,1,{rad:.072})),
  ...sides.map(({sign:s,id,name})=>piece(id,name+' main gear','A pair of closely spaced wheels sits below the wing root.',[0,s*.22,-.16],r=>wheelLeg(r,.48,s*.42,.475,1,{rad:.094})))
 ])
]);

// Upper and lower radii are independent. Around the occupants the sides
// flatten against the tubular or sheet-metal cabin frame and square off at
// the roof. The Skyhawk aft deck drops under its rear-facing window.
const sky=[[-1.79,.14,.65,.12,.12,.74],[-1.65,.19,.66,.145,.14,.76],[-1.15,.225,.665,.132,.17,.71],
 [-.99,.229,.666,.158,.174,.7],[-.75,.255,.668,.332,.178,.68],[-.63,.269,.672,.366,.186,.57],[-.07,.267,.672,.361,.187,.57],
 [.12,.252,.67,.322,.178,.64],[.39,.231,.663,.249,.17,.69],[.62,.18,.65,.152,.146,.78],[1.31,.095,.65,.085],[1.8,.025,.68,.048]];
const cub=[[-1.45,.126,.66,.132],[-1.32,.18,.67,.15,.137,.78],[-.87,.192,.667,.136,.169,.72],
 [-.64,.224,.670,.293,.169,.605],[-.45,.237,.671,.343,.175,.46],[-.05,.238,.67,.343,.179,.46],
 [.18,.219,.669,.305,.180,.50],[.38,.192,.665,.234,.155,.59],[.8,.123,.65,.115],[1.24,.066,.65,.065],[1.53,.025,.65,.042]];
const skyPanes=[
 [[-.99,1.57079633],[-.955,.185],[-.719,.29],[-.655,1.57079633]],
 [[-.692,.254],[-.654,1.04],[-.216,1.04],[-.20,.215],[-.635,.215]],
 [[-.170,.214],[-.179,1.02],[.054,.988],[.267,.466],[.235,.231]],
 [[.113,1.57079633],[.117,1.018],[.359,.484],[.489,.566],[.55,1.57079633]]
];
const cubPanes=[
 [[-.863,1.57079633],[-.839,.145],[-.640,.183],[-.554,1.57079633]],
 [[-.606,.146],[-.545,1.013],[-.211,1.015],[-.197,.136]],
 [[-.173,.126],[-.183,1.017],[-.018,1.035],[.138,.229],[.122,.126]],
 [[.161,.201],[.019,1.013],[.156,.96],[.358,.253],[.34,.184]]
];

// Trace each front-half perimeter from the center of an inlet. The annulus
// between the two contours is sheet metal; the inset opening has sidewalls.
function cowlingFace(r,station,color){
 const [x,width,z,upper,lower=upper,exp=1]=station;
 const power=v=>Math.sign(v)*Math.pow(Math.abs(v),exp);
 for(const sign of [-1,1]){
   const outer=Array.from({length:17},(_,i)=>{
     const a=-Math.PI/2+i*Math.PI/16, h=Math.sin(a);
     return [width*power(Math.cos(a)),(h<0?lower:upper)*power(h)];
   });
   const center=[width*.58,upper*.17];
   // Include extra vertices on the long inboard edge for a smooth inlet.
   for(let i=1;i<12;i++)outer.push([0,upper-(upper+lower)*i/12]);
   const rim=outer.map(([y,h])=>{
     const dy=y-center[0],dh=h-center[1];
     const scale=1/Math.hypot(dy/(width*.295),dh/(upper*.245));
     return [center[0]+dy*scale,center[1]+dh*scale];
   });
   const vertex=(d,[y,h])=>[x+d,sign*y,z+h];
   for(let i=0;i<rim.length;i++){
     const j=(i+1)%rim.length;
     r.polygon([vertex(0,rim[i]),vertex(0,outer[i]),vertex(0,outer[j]),vertex(0,rim[j])],color,false);
     r.polygon([vertex(0,rim[i]),vertex(0,rim[j]),vertex(.037,rim[j]),vertex(.037,rim[i])],'#52616a',false);
   }
   r.polygon(rim.map(p=>vertex(.037,p)),'#303c42',false);
 }
}

function lightPlane(isCub){
 const stations=isCub?cub:sky;
 const name=isCub?'Piper J-5A Cub Cruiser':'Cessna 172S Skyhawk',color=isCub?'#e9b438':white;
 const propX=isCub?-1.53:-1.87,nose=stations[0][0];
 const rootZ=isCub?1.005:1.048;
 const tailX=stations.at(-1)[0];
 const split=2, seam=stations[split][0];
 const bodyColor=(k,i,a)=>isCub?color:(Math.sin(a)<-.48?'#416480':white);
 const windows=isCub?cubPanes:skyPanes;
 const mainX=isCub?-.65:.12;
 const model=record({
  id:isCub?'piperj5':'cessna172',name,short:isCub?'J-5A Cub Cruiser':'172S Skyhawk',year:isCub?1940:1998,type:'Planes',
  motion:{assembly:'propeller',name:'Propeller rotation',description:'The two fixed-pitch blades turn together on the propeller shaft.'},
  detail:isCub?'This 1940 Cub Cruiser has a fabric-covered fuselage, a wide rear seat and a small tailwheel. The wing struts meet the fuselage just behind the main wheels.':'The Skyhawk carries its wing above the cabin. A single strut on each side runs down to the lower fuselage, leaving the side windows clear.',
  sources:isCub?[{label:'Sensenich · J-5A / Continental A-75 application',url:'https://www.aircraftspruce.com/catalog/pdf/Application_Guides_Certified_Wood_Aircraft_Propeller_Application_Guide_1471369065.pdf'}]:[{label:'FAA · Skyhawk 172S propeller configuration, type certificate 3A12',url:'https://data.tmorris.net/aviation/poh/rsv/doc/cessna-misc/C172_FAA_typecert_3A12.pdf'}],
  source:isCub?{label:'Western Antique Aeroplane & Automobile Museum · 1940 J-5A',url:'https://www.waaamuseum.org/collections/airplanes/659-piper-j-5a-cub-coupe'}:{label:'Textron Aviation · Cessna Skyhawk',url:'https://cessna.txtav.com/piston/cessna-skyhawk'},
  specs:isCub?[['Length','22 ft 6 in'],['Wingspan','35 ft 6 in'],['Museum aircraft','1940 · Continental A-75'],['Propeller shown','Sensenich W70DK · example'],['Seating','Pilot forward, two behind']]:[['Length','27 ft 2 in'],['Wingspan','36 ft 1 in'],['Engine','Lycoming IO-360-L2A'],['Propeller','McCauley 1A170E/JHA7660'],['Seating','Four']]
 },[
  section('cabin','Cabin and fuselage','The high wing spans the roof of the enclosed cabin.',[
   piece('shell','Cabin and aft fuselage',isCub?'The slim rear fuselage tapers down behind the wider passenger seat.':'The short cowling sits directly ahead of the windshield.',[0,0,.18],r=>{
    windowedLoft(r,stations.slice(split),bodyColor,windows,32,false,true);
    const seatColor=isCub?'#675c4c':'#677077',seatX=isCub?-.42:-.53;
    for(const y of isCub?[0]:[-.102,.102]){
      r.profile([[seatX-.11,.604],[seatX+.078,.604],[seatX+.088,.65],[seatX-.106,.656]],y-.069,y+.069,seatColor);
      r.profile([[seatX+.053,.649],[seatX+.087,.647],[seatX+.128,.820],[seatX+.098,.84]],y-.066,y+.066,seatColor);
      if(!isCub)r.box(seatX+.105,y-.047,.836,seatX+.138,y+.047,.872,'#657178');
    }
    const threshold=isCub?-.60:-.68;
    r.box(threshold,-.165,.487,.335,.165,.503,isCub?'#70604c':'#72777a');
    const dash=isCub?-.675:-.825;
    r.box(dash-.035,-.17,.627,dash,.17,.741,'#434d50');
    if(isCub){
      // Fabric sides meet the exposed tubular door frame along the sill.
      for(const side of [-1,1])tube(r,[.04,side*.208,.925],[.21,side*.214,.678],.0055,'#705b37',8);
    }
    const rearX=isCub?.09:.17;
    r.box(rearX-.13,-.144,.603,rearX+.026,.144,.643,seatColor);
    r.profile([[rearX,.64],[rearX+.035,.64],[rearX+.069,.795],[rearX+.036,.802]],-.145,.145,seatColor);
    for(const {sign:s} of sides)surfaceBand(r,stations,s,seam,tailX-.14,-.09,.09,isCub?'#323b39':'#587e9c');
   }),
   piece('glazing','Cabin windows',isCub?'The forward pilot and broad rear bench share a high cabin. A slim diagonal frame divides the glazing behind the door.':'A one-piece wraparound windshield meets two framed door windows. The rear-facing window follows the sloping deck behind the back seats.',[-.10,0,.30],r=>{
    for(const {sign,name} of sides)windows.forEach((outline,i)=>{
      const continuous=i===0||(!isCub&&i===3);
      const unit=i===0?'Wraparound windshield':!isCub&&i===3?'Rear windshield':name+' '+['','door window','cabin window','aft quarter window'][i];
      r.instance(unit,()=>framedPane(r,stations,sign,outline,{onePiece:continuous,glass:'#587889',gasket:isCub?'#675a41':'#536169',frame:.977,opacity:.48}));
    });
   })
  ]),
  section('wings','Wing and lift struts','Each side separates as a unit with its own strut.',sides.map(({sign:s,id,name:sideName})=>piece(id,sideName+' wing and strut',isCub?'Paired, V-shaped struts meet the wing at its forward and aft spars.':'A single diagonal strut links the lower fuselage to the underside of the wing.',lateral(s),r=>{
   const ss=isCub?[[.01,-.73,.09,rootZ,.055],[1.78,-.72,.095,rootZ+.018,.047],[2.24,-.69,.07,rootZ+.023,.037],[2.4,-.58,.007,rootZ+.027,.023],[2.46,-.39,-.13,rootZ+.028,.014]]:
   [[.015,-.83,.005,rootZ,.052],[1.15,-.83,.005,rootZ+.015,.048],[2.32,-.7,-.03,rootZ+.058,.027],[skyhawkHalfSpan,-.65,-.04,rootZ+.075,.012]];
   wing(r,ss,s,color);
   for(const x of isCub?[-.59,-.03]:[-.54])tube(r,[isCub?-.49:-.48,.2*s,.51],[x,s*1.49,rootZ+.01],.022,isCub?color:metal,10);
  }))),
  section('engine','Piston engine','Open the cowling to see the opposed cylinders and the crankshaft behind the propeller.',[
   piece('cowling','Engine cowling and cooling inlets','Two openings either side of the spinner admit cooling air to the cylinder banks.',[-.25,0,.27],r=>{
     windowedLoft(r,stations.slice(0,split+1),bodyColor,[],32,false,false);
     cowlingFace(r,stations[0],color);
     for(const {sign:s} of sides)surfaceBand(r,stations,s,nose+.07,seam,-.09,.09,isCub?'#323b39':'#587e9c');
   })
  ]),
  section('propeller','Propeller','A single propeller sits immediately ahead of the cowling.',[
   piece('hub','Propeller hub',isCub?'A front clamping plate covers the center of the laminated wooden propeller.':'The spinner fits over a two-blade McCauley propeller. Open the hub to see how the integral blades meet the crankshaft flange.',[-.25,0,0],(r,phase)=>{
     if(isCub){
       loft(r,[[propX-.031,.052,.66,.052],[propX-.012,.055,.66,.055],[nose,.064,.66,.064]],'#947754');
       for(let j=0;j<6;j++){
         const a=2*Math.PI*(j/6+phase),y=.036*Math.cos(a),z=.66+.036*Math.sin(a);
         r.rod([propX-.041,y,z],[propX-.031,y,z],.008,'#a6aba4',6);
       }
     }else loft(r,[[propX-.091,.004,.66,.004],[propX-.078,.031,.66,.031],[propX-.047,.058,.66,.058],[nose,.066,.66,.066]],metal);
   }),
   ...[0,1].map(i=>piece('blade'+(i+1),'Blade '+(i+1),isCub?'Trace the twist along the laminated wood blade. The two blades and hub are carved from one blank.':'The one-piece aluminum propeller twists from the thick blade root to a thin painted tip.',[-.2,i?.14:-.14,i?.1:-.1],(r,phase)=>{
    propBlade(r,propX,.66,isCub?.409:.432,i*Math.PI+.58+phase*2*Math.PI,isCub);
   }))
  ]),
  section('tail','Tail surfaces','A central fin rises above the pair of horizontal tailplanes.',[
   piece('fin','Fin and rudder',isCub?'The rounded rudder extends behind the curved fin.':'The swept leading edge and nearly upright trailing edge frame the rudder.',[.16,0,.24],r=>{
    fin(r,isCub?[[.87,.65],[1.04,.73],[1.18,.95],[1.33,1.047],[1.45,1.029],[1.53,.96],[1.57,.77],[1.54,.65]]:[[1.00,.65],[1.32,.77],[1.62,1.21],[1.83,1.21],[1.79,.66]],0,color);
   }),
   ...sides.map(({sign:s,id,name:sideName})=>piece(id,sideName+' tailplane','The fixed stabilizer and its trailing elevator sit on either side of the tail.',[.13,s*.21,.07],r=>wing(r,
    isCub?[[.035,.93,1.50,.666,.021],[.58,1.10,1.47,.67,.015],[.72,1.21,1.39,.67,.01]]:[[.028,1.15,1.79,.678,.029],[.75,1.44,1.79,.69,.016],[.83,1.48,1.76,.69,.01]],s,color)))
  ]),
  section('gear','Fixed landing gear',isCub?'The J-5A stands on two main wheels and a small wheel beneath the tail.':'The Skyhawk has a steerable nosewheel and two widely spaced main wheels.',[
   piece(isCub?'tailwheel':'nosewheel',isCub?'Tailwheel':'Nosewheel',isCub?'A leaf spring carries the small tailwheel below the aft fuselage.':'A single nosewheel lies below the engine cowling.',[isCub?.18:-.15,0,-.16],r=>{
    const x=isCub?1.44:-1.29,z=isCub?.38:0,rad=isCub?.074:.12;
    tube(r,[x-.13,0,isCub?.64:.53],[x,0,z+rad],isCub?.020:.026,metal);
    tire(r,x,0,z+rad,rad,.079);
   }),
   ...sides.map(({sign:s,id,name:sideName})=>piece(id,sideName+' main gear','The tire, wheel and supporting leg move together.',[0,s*.20,-.13],r=>{
    tube(r,[mainX-.10,s*.18,.51],[mainX+.05,s*.47,.16],.031,isCub?color:metal);
    if(isCub)tube(r,[mainX+.35,s*.14,.52],[mainX+.05,s*.47,.16],.020,color);
    tire(r,mainX+.05,s*.47,.15,.15,.079);
   }))
  ])
 ]);
 if(isCub){
   // Pitch the complete parked aircraft around its main wheels until the tailwheel contacts the ground.
   const mainAxle=mainX+.05;
   let pitch=.18;
   for(let iteration=0;iteration<4;iteration++){
     const dx=1.44-mainAxle, dz=.454-.15;
     pitch+=(.15+dz*Math.cos(pitch)-dx*Math.sin(pitch)-.074)/(dz*Math.sin(pitch)+dx*Math.cos(pitch));
   }
   const onWheels=sketch=>(renderer,...options)=>{
     const pitched=Object.create(renderer);
     pitched.polygon=(points,color,stroke)=>renderer.polygon(points.map(([x,y,z])=>[
       mainAxle+(x-mainAxle)*Math.cos(pitch)+(z-.15)*Math.sin(pitch),y,
       .15+(z-.15)*Math.cos(pitch)-(x-mainAxle)*Math.sin(pitch)
     ]),color,stroke);
     pitched.tag=(id,draw)=>renderer.tag(id,draw);
     pitched.instance=(id,draw)=>renderer.instance(id,draw);
     sketch(pitched,...options);
   };
   model.draw=onWheels(model.draw);
   model.motion.drawMoving=onWheels(model.motion.drawMoving);
 }
 return model;
}
export const skyhawk=lightPlane(false), cubCruiser=lightPlane(true);
