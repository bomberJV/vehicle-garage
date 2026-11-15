import {part,study,turn,sleeve,cyl,tint} from './mechanism-shapes.js';
import {lampOutline,lampWall,lampRefs,ribbedLens,raisedWingLens,tailCover} from './g500-lamps.js';
import {drawH4,h4Components,h4SupplierDrawing,h4FilamentDrawing,drawH3,h3Components,h3SupplierDrawing} from './g500-halogen-bulbs.js';
import {glazingFace} from './surface-materials.js';

const metal='#adb8b9',black='#353d40',seal='#535853',brass='#bb9d64';
const ay=[0,1,0],origin=[0,0,.40];
const map=(u,v,d)=>[u,d,.40+v];
const shifted=d=>(u,v,s)=>map(u,v,s+d);
const specs={
  fog:{name:'Front fog lamp',w:.96,h:.43,tint:'clear',bulb:'H3',source:lampRefs.fog,summary:'The removable trim frames a fluted glass lens. Behind it, a silvered reflector gathers light from the H3 halogen bulb. A spring clip holds the lamp base and its lead exits the rear.'},
  amber:{name:'Amber front side marker',w:.84,h:.38,tint:'amber',bulb:'T4W',source:lampRefs.marker,summary:'A small bayonet bulb illuminates the amber side lens. The socket clips into the housing behind the lens and a rubber cover shields the connection.'},
  red:{name:'Red rear side marker',w:.84,h:.38,tint:'red',bulb:'T4W',source:lampRefs.marker,summary:'The rear marker has a red lens and its own small bayonet bulb. Two screws retain the housing and a dust cover protects the rear of the socket.'},
  repeat:{name:'Side turn repeater',w:.85,h:.32,tint:'clear',bulb:'WY5W',source:lampRefs.repeater,summary:'An amber wedge bulb pushes into a pull-out socket behind the clear lens. A seal follows the mounting edge where the repeater meets the wing.'},
  rearFog:{name:'Left rear fog lamp',w:.88,h:.43,tint:'red',bulb:'P21W',source:lampRefs.manual,summary:'A bright single-filament bulb shines through the red left bumper lens. Two screws hold the lens to the housing.'},
  reverse:{name:'Right backup lamp',w:.88,h:.43,tint:'clear',bulb:'P21W',source:lampRefs.manual,summary:'The right bumper lamp illuminates the road behind the G500 in reverse. A clear lens covers a single P21W bulb in a bayonet socket.'},
  wing:{name:'Front wing turn signal',w:.92,h:.54,tint:'clear',bulb:'PY21W',source:lampRefs.manual,summary:'The lens stands above the front wing, making the signal visible from several directions. An amber PY21W bulb sits in a bayonet socket below the raised cover.'},
};
function outlinePiece(r,w,h,from,to,color,inner=.89){
  const outer=lampOutline(w,h,h*.15),hole=lampOutline(w*inner,h*inner,h*.12);
  lampWall(r,map,outer,from,outer,to,color);lampWall(r,map,outer,to,hole,to,tint(color,1.1));
  lampWall(r,map,hole,to,hole,from,tint(color,.8));lampWall(r,map,hole,from,outer,from,color);
}
function housing(r,s){
  const front=lampOutline(s.w,s.h,s.h*.15),back=lampOutline(s.w*.61,s.h*.72,s.h*.25);
  lampWall(r,map,front,.0,back,-.160,black);lampWall(r,map,front,.0,front,.027,'#4c5657');
  const bore=lampOutline(.24,.19,.084);
  lampWall(r,map,back,-.16,bore,-.16,'#3c4546');
  sleeve(r,map(0,0,-.16),ay,-.026,.015,.10,.073,black,24);
}
function bowl(r,s){
  // A stepped oval-to-rectangular return leaves a real opening around the bulb.
  const socket=lampOutline(.177,.142,.07),rim=lampOutline(s.w*.92,s.h*.9,s.h*.17);
  const rings=Array.from({length:6},(_,j)=>socket.map(([u,v],i)=>[u+(rim[i][0]-u)*j/5,v+(rim[i][1]-v)*j/5]));
  for(let j=1;j<rings.length;j++)for(let i=0;i<rim.length;i++){
    const k=(i+1)%rim.length,a=-.132+.167*((j-1)/5)**1.75,b=-.132+.167*(j/5)**1.75;
    r.polygon([map(...rings[j-1][i],a),map(...rings[j-1][k],a),map(...rings[j][k],b),map(...rings[j][i],b)],tint(metal,.61+.41*(.5+rim[i][1]/s.h)+.12*((i+j)%2)),false);
  }
}
const bulbs={
  R5W:{name:'R5W tail bulb',base:'Bayonet base',power:'5 W'},
  H3:{name:'H3 halogen bulb',base:'Keyed flange & lead',power:'55 W'},
  T4W:{name:'T4W marker bulb',base:'Bayonet base',power:'4 W'},
  WY5W:{name:'WY5W amber repeater bulb',base:'Wedge base',power:'5 W',wedge:true,amber:true},
  P21W:{name:'P21W signal bulb',base:'Bayonet base',power:'21 W'},
  PY21W:{name:'PY21W amber signal bulb',base:'Indexed bayonet base',power:'21 W',amber:true},
};
function glass(r,q,size=1,cutaway=false){
  const profile=q.wedge?[[.004,.053],[.044,.060],[.098,.058],[.123,.046],[.14,.01],[.143,0]]:[[.004,.053],[.024,.059],[.060,.09],[.104,.106],[.147,.093],[.178,.063],[.191,.025],[.193,0]];
  const p=(j,i)=>map(size*profile[j][1]*Math.cos(i*Math.PI/10),size*profile[j][1]*Math.sin(i*Math.PI/10),size*profile[j][0]-.10*size);
  const count=cutaway?15:20;
  for(let j=1;j<profile.length;j++)for(let i=0;i<count;i++){
    const a=[p(j-1,i),p(j-1,i+1),p(j,i+1),p(j,i)];
    glazingFace(r,profile[j][1]?a:a.slice(0,3),q.amber?'#dfa04f':'#afc3c6',q.amber?.48:.29);
  }
}
function base(r,q,size=1){
  const at=(u,v,d)=>map(u*size,v*size,(d-.10)*size);
  if(q.wedge){
    r.box(...at(-.040,-.014,-.072),...at(.040,.014,.011),'#9aaca8');
    for(const s of [-1,1])r.rod(at(s*.024,.014,-.068),at(s*.024,.014,.011),size*.004,brass,6);
  }else{
    turn(r,at(0,0,0),ay,[[-.098,0],[-.095,.035],[-.082,.052],[.005,.052],[.005,0]].map(([d,b])=>[d*size,b*size]),metal);
    const secondAngle=q.amber?150:180;
    for(const angle of [0,secondAngle]){
      const a=angle*Math.PI/180; r.rod(at(.050*Math.cos(a),.050*Math.sin(a),-.055),at(.062*Math.cos(a),.062*Math.sin(a),-.055),size*.006,metal,8);
    }
    cyl(r,at(0,0,0),ay,-.106*size,-.098*size,.021*size,brass);
  }
}
function filament(r,q,size=1){
  const s=size,at=(u,v,d)=>map(u*s,v*s,(d-.10)*s);
  for(const side of [-1,1]) r.rod(at(side*.015,0,.002),at(side*.030,0,.092),.0025*s,metal,6);
  let p=at(-.030,0,.092);
  for(let i=1;i<=50;i++){
    const a=i/50*12*Math.PI,next=at(-.030+.060*i/50,.003*Math.sin(a),.092+.003*(Math.cos(a)-1));
    r.rod(p,next,.0015*s,'#776d55',5);p=next;
  }
}
function bulbStudy(type){
  if(type==='H3'){
    const mount=(u,v,d)=>map(u*.012,v*.012,(d-6)*.012);
    const sections=[
      ['glass','Quartz envelope','The sealed glass reaches 11.5 mm in diameter.',[.51,.04,.24]],
      ['filament','Transverse filament and supports','The centre of the transverse 55 W filament lies 18 mm ahead of the seating plane.',[0,.31,.26]],
      ['base','PK22s flange and flying lead','The rigid bulb body is 42 mm long. An insulated lead exits the base. Its bend here illustrates how the lead clears the reflector.',[-.34,-.28,-.13]]
    ];
    return study('g500-bulb-h3','H3 fog-lamp bulb','The front fog lamps use an H3. OSRAM’s 64151 drawing gives the rigid outline and base type. The replacement bulb’s wire bend is schematic.',h3SupplierDrawing,sections.map(([id,name,desc,offset])=>part(id,name,desc,offset,r=>drawH3(r,mount,id))));
  }
  const q=bulbs[type],size=3;
  const s=study('g500-bulb-'+type.toLowerCase(),q.name,`The ${q.power} bulb is drawn in section so the filament and its supports can be seen inside the glass.`,lampRefs.manual,[
    part('glass','Glass envelope',q.amber?'Amber glass gives the light its signal color.':'The glass envelope surrounds the filament.',[.60,0,.13],r=>glass(r,q,size,true)),
    part('filament','Filament and support wires','Two conductors support the coil and deliver current to it.',[0,.32,.27],r=>filament(r,q,size)),
    part('base',q.base,'The base locates the bulb in the socket and makes its electrical connection.',[-.45,-.35,0],r=>base(r,q,size)),
  ]);s.viewAngle=[-.7,.23];return s;
}
function wingLens(r,s){
  raisedWingLens(r,shifted(.042),s.w,s.h,.195);
}
function wedgeRepeaterLens(r,s){
  // The fitted lens has a tapered forward end and a broader, radiused rear.
  const loop=lampOutline(s.w*.91,s.h*.74,s.h*.29);
  const plan=loop.map(([u,v])=>[u,v*(.73+.27*(u/(s.w*.91)+.5))+u*.065]);
  const shoulder=plan.map(([u,v])=>[u*.91,v*.83]);
  lampWall(r,map,plan,.033,plan,.055,'#868f8b');
  for(let i=0;i<plan.length;i++){
    const j=(i+1)%plan.length;
    glazingFace(r,[map(...plan[i],.055),map(...plan[j],.055),map(...shoulder[j],.091),map(...shoulder[i],.091)],'#b4c5bd',.42);
  }
  glazingFace(r,shoulder.map(([u,v])=>map(u,v,.091)),'#c3d2cc',.36);
  for(let k=-5;k<=5;k++){
    const u=k*s.w*.066,h=s.h*(.155+.035*k/5),v=u*.065;
    glazingFace(r,[map(u-.003,v-h,.091),map(u-.003,v+h,.091),map(u+.002,v+h,.093),map(u+.002,v-h,.093)],'#dae5d8',.39);
  }
}
function opticalStudy(kind){
  const s=specs[kind],q=bulbs[s.bulb],fog=kind==='fog',marker=['amber','red'].includes(kind);
  const pieces=[
    part('housing',fog?'Fog lamp housing':'Lamp housing','The shell supports the lens and provides the opening for the bulb at the rear.',[0,-.30,-.14],r=>housing(r,s)),
    part('lens',kind==='wing'?'Raised lens':'Optical lens',kind==='wing'?'The molded cover wraps over the signal bulb.':'Ribs on the lens break up the view of the bulb. The outer shoulder meets the housing.',[0,.60,.26],r=>kind==='wing'?wingLens(r,s):kind==='repeat'?wedgeRepeaterLens(r,s):ribbedLens(r,shifted(.054),s.w*.94,s.h*.93,.040,s.tint,16,marker?.32:.12,s.tint==='clear' ? .28 : .80)),
    part('socket',q.wedge?'Wedge-bulb socket':'Bulb holder',q.wedge?'The glass wedge plugs into two contacts in the pull-out socket.':'The bulb locates in the holder at the rear of the unit.',[.52,-.56,-.19],r=>{
      sleeve(r,origin,ay,-.256,-.133,.084,.058,black);for(const side of [-1,1])r.box(...map(side*.034-.008,-.006,-.287),...map(side*.034+.008,.006,-.241),brass);
    }),
    part('bulb',q.name,`${q.power}, 12 V. Open the bulb to see its glass envelope, filament and base.`,[.72,-.09,.40],r=>{
      if(fog){for(const key of h3Components)drawH3(r,(u,v,d)=>map(u*.007,v*.007,-.138+d*.007),key);}
      else {glass(r,q);base(r,q);filament(r,q);}
    }),
    ...(kind==='repeat'?[]:[part('screws','Securing screws','A pair of fasteners retains the lens or its mounting panel.',[-.60,.21,-.37],r=>{
      for(const sign of [-1,1]){
        const u=sign*s.w*.426,v=fog?-.01:0;
        cyl(r,map(u,v,0),ay,-.088,.064,.012,metal,10);cyl(r,map(u,v,0),ay,.063,.075,.023,metal,12);
        r.rod(map(u-.012,v,.076),map(u+.012,v,.076),.0035,black,5);
      }
    })]),
  ];
  // The push-in side repeater is retained by a spring catch, unlike the screwed lamp units.
  if(kind==='repeat'){
    pieces.push(part('catch','Housing spring catch','A spring tongue locates the repeater behind the opening in the wing.',[-.43,.17,-.37],r=>{
      for(const sign of [-1,1]){const u=sign*.33;const p=[[u,.006],[u+sign*.048,-.058],[u+sign*.065,-.064],[u+sign*.046,.012]];
        for(let j=1;j<p.length;j++)r.rod(map(p[j-1][0],.015,p[j-1][1]),map(p[j][0],.015,p[j][1]),.010,black,6);}
    }));
  }
  if(fog){
    pieces.push(part('trim','Bumper trim panel','The separate dark trim surrounds the glass face and seats against the bumper.',[-.08,.35,.53],r=>outlinePiece(r,s.w*1.12,s.h*1.19,.005,.063,black,.84)),
      part('reflector','Reflector','The shaped reflective surface surrounds the bulb and opens toward the lens.',[0,.18,-.39],r=>bowl(r,s)),
      part('clip','Bulb retaining spring','A formed wire spring bears on the metal base of the H3 lamp.',[-.47,-.27,.17],r=>{
        const path=[[-.083,.045],[-.118,.048],[-.116,-.05],[-.077,-.086],[.066,-.086],[.114,-.042],[.109,.053],[.073,.065]];
        for(let i=1;i<path.length;i++)r.rod(map(...path[i-1],-.12),map(...path[i],-.12),.007,metal,8);
      }));
  }
  if(marker)pieces.push(part('boot','Dust cover','The flexible cover fits over the rear connection and the socket catch.',[-.33,-.58,.20],r=>turn(r,map(0,0,0),ay,[[-.339,.030],[-.336,.053],[-.281,.058],[-.252,.102],[-.215,.109],[-.211,.094],[-.246,.089],[-.280,.044],[-.335,.030]],seal)));
  if(kind==='repeat')pieces.push(part('seal','Lamp-to-wing seal','The perimeter seal lies between the repeater flange and the sheet metal.',[0,-.41,.43],r=>outlinePiece(r,s.w*1.01,s.h*1.025,-.014,0,seal,.93)));
  const result=study('g500-optic-'+kind,s.name,s.summary,s.source,pieces);
  result.viewAngle=[-.48,.21];return result;
}
function ringGlass(r){
  const mapRadius=(i,j)=>{
    const t=i*Math.PI/20,rad=.40*j/6;
    return map(rad*Math.cos(t),rad*Math.sin(t),.066+.044*(1-(rad/.4)**2));
  };
  for(let j=1;j<=6;j++)for(let i=0;i<40;i++){
    const quad=[mapRadius(i,j-1),mapRadius(i,j),mapRadius(i+1,j),mapRadius(i+1,j-1)];
    glazingFace(r,j===1?quad.slice(0,3):quad,'#9eafb0',.29);
  }
  for(let i=-7;i<=7;i++){
    const u=i*.050,half=Math.sqrt(.39**2-u**2),pt=k=>map(u,k,.068+.044*(1-(u*u+k*k)/.16));
    for(let k=0;k<8;k++)r.rod(pt(half*(k/4-1)),pt(half*((k+1)/4-1)),.0024,'#a1b3b6',5);
  }
}
const h4Descriptions={
  envelope:['Quartz envelope and dark tip','The OSRAM drawing gives a 17 mm envelope diameter and an 82 mm overall bulb length. The coated tip blocks direct forward light.',[.49,.18,.39]],
  low:['Low-beam filament','The 55 W low-beam coil begins 28.5 mm forward of the three-lug seating plane. Its nominal length is 5.5 mm on the UN H4 drawing.',[-.37,.35,.39]],
  high:['High-beam filament','The 60 W driving-beam coil sits closer to the flange. Its nominal length is 4.5 mm.',[.04,-.14,.51]],
  shield:['Low-beam shield','The curved metal shield lies beneath the forward filament. Its lip and the filament’s position control which part of the reflector receives light.',[-.51,-.12,-.32]],
  flange:['Keyed P43t flange','The three seating lugs define the reference plane for the filaments. The pressed-metal contours between the drawing datums are approximate.',[.45,-.47,.10]],
  contacts:['Three blade contacts','Two upright side blades flank a transverse blade. One terminal serves as the shared return.',[.12,-.60,-.34]]
};
function h4Study(){
  const pieces=h4Components.map(key=>{
    const [name,description,offset]=h4Descriptions[key];
    return part(key,name,description,offset,r=>drawH4(r,(u,v,d)=>map(u*.013,v*.013,(d-8)*.013),key));
  });
  const view=study('g500-h4-halogen','H4 two-filament bulb','The 2002 manual specifies an H4. This section follows the OSRAM 64193 replacement drawing and UN filament dimensions. The supplier of the original bulb, the wire routing and the exact shield stamping are unconfirmed.',h4SupplierDrawing,pieces);
  view.groups[0].parts.forEach(p=>{p.source=/\.(low|high|shield)$/.test(p.id)?h4FilamentDrawing:h4SupplierDrawing;});
  view.viewAngle=[-.53,.22];return view;
}
function roundHeadlamp(){
  const reflector=[[-.226,.093],[-.219,.118],[-.191,.202],[-.132,.296],[-.042,.364],[.046,.402],[.06,.415]];
  const pieces=[
    part('trim','Headlamp trim panel','The painted rectangular panel fits around the circular lamp. The rubber edge follows the trim.',[-.12,.55,.47],r=>{
      const w=.53,h=.49,inner=.427;
      for(let i=0;i<64;i++){
        const pt=(j,outer)=>{const t=j*Math.PI/32,c=Math.cos(t),s=Math.sin(t),l=outer?Math.min(w/(Math.abs(c)||1e-8),h/(Math.abs(s)||1e-8)):inner;return map(c*l,s*l,.069);};
        r.polygon([pt(i,true),pt(i+1,true),pt(i+1,false),pt(i,false)],'#7c8a88',false);
      }
      sleeve(r,origin,ay,.042,.070,.430,.408,black,48);
    }),
    part('glass','Fluted headlamp lens','The circular glass face closes the optical unit. The lens and reflector form the headlamp insert.',[0,.88,.05],ringGlass),
    part('reflector','Reflector bowl','The silvered bowl surrounds the H4 opening. Its shape is represented schematically.',[.34,.26,-.27],r=>turn(r,origin,ay,reflector,'#bdc8c6',{n:48})),
    part('h4','H4 high/low-beam bulb','The OSRAM H4 replacement drawing locates the cap, quartz envelope and three contacts. Open the bulb to inspect the shield and both filaments.',[.68,-.07,.31],r=>{
      for(const key of h4Components)drawH4(r,(u,v,d)=>map(u*.0046,v*.0046,-.246+d*.0046),key);
    }),
    part('parking','Parking / standing lamp bulb','The 4 W T4W parking bulb uses its own smaller socket in the headlamp unit.',[-.51,.10,-.33],r=>{
      const lamp=map(-.16,-.119,-.119);
      turn(r,lamp,ay,[[-.074,0],[-.074,.032],[-.019,.032],[.003,.038],[.031,.046],[.065,.038],[.077,0]],'#9aa9a4');
    }),
    part('retainer','Retaining ring and mounting tabs','A thin ring captures the rim of the optical insert. Three formed tabs sit outside the lens.',[-.64,.17,.41],r=>{
      sleeve(r,origin,ay,.044,.060,.426,.403,metal,48);
      for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6]){
        const q=(rad,off,d)=>map(rad*Math.cos(a)-off*Math.sin(a),rad*Math.sin(a)+off*Math.cos(a),d);
        r.polygon([q(.421,-.026,.052),q(.462,-.026,.052),q(.470,.022,.052),q(.421,.025,.052)],metal,false);
      }
    }),
    part('boot','Rear protection cover','The flexible boot fits over the back of the lamp around the main connector.',[-.34,-.68,.33],r=>turn(r,origin,ay,[[-.307,.076],[-.306,.118],[-.282,.121],[-.26,.151],[-.209,.149],[-.203,.133],[-.246,.135],[-.277,.10],[-.280,.076]],seal)),
    part('spring','H4 retaining spring','The spring bears on the H4 flange to hold it against its seat.',[-.53,-.22,-.06],r=>{
      const pts=[[-.10,.058],[-.132,.049],[-.123,-.068],[-.075,-.102],[.081,-.102],[.123,-.059],[.123,.063],[.095,.070]];
      for(let i=1;i<pts.length;i++)r.rod(map(...pts[i-1],-.270),map(...pts[i],-.270),.006,metal,6);
    }),
    part('plug','Three-terminal connector','Three blade terminals connect the common return and the high- and low-beam circuits.',[.48,-.57,-.10],r=>{
      const a=lampOutline(.15,.12,.014);lampWall(r,map,a,-.406,a,-.324,black);
      r.polygon(a.map(v=>map(...v,-.406)),black,false);
      for(const [u,v] of [[0,.026],[-.036,-.016],[.036,-.016]])sleeve(r,map(u,v,-.325),ay,-.030,.002,.016,.009,brass,8);
    }),
  ];
  const result=study('g500-round-headlamp','Round headlamp assembly','The round insert sits behind a painted trim panel. The headlamp carries an H4 high/low bulb and a separate small parking bulb. The lens and reflector are separated here to show the light path.',lampRefs.head,pieces);
  result.viewAngle=[-.65,.18];return result;
}
function combinationStudy(left){
  const direction=left?-1:1;
  const pieces=[
    part('housing','Three-chamber housing','Partitions separate the turn, stop and tail light paths.',[0,-.36,-.09],r=>{
      const s={w:1.02,h:.47};housing(r,s);
      for(const u of [-.16,.23])r.box(...map(u*direction-.01,-.175,-.105),...map(u*direction+.01,.175,.034),black);
    }),
    part('lens','Red and clear lens','The clear outer chamber passes amber turn-signal light. Red glazing covers the tail and brake bulbs.',[0,.65,.27],r=>{
      tailCover(r,(u,v,d)=>map(direction*u,v,.042+d),1.02,.43);
    }),
  ];
  for(const [u,key,type] of [[-.299,'stop','P21W'],[.037,'tail','R5W'],[.347,'turn','PY21W']]){
    pieces.push(part(key,bulbs[type].name,`${bulbs[type].power}, 12 V. Open to inspect the filament and base.`,[u*direction*1.50,-.43,.41],r=>{
      const t={polygon:(vs,c,s)=>r.polygon(vs.map(([x,y,z])=>[x+u*direction,y,z]),c,s),rod:(a,b,rad,col,n)=>r.rod([a[0]+u*direction,a[1],a[2]],[b[0]+u*direction,b[1],b[2]],rad,col,n),get faces(){return r.faces;}};
      glass(t,bulbs[type]);base(t,bulbs[type]);filament(t,bulbs[type]);
    }));
  }
  const result=study('g500-tail-'+(left?'left':'right'),(left?'Left':'Right')+' rear combination lamp','Three bulbs light the fixed corner cluster above the bumper. The amber signal bulb shines through the outer clear chamber.',lampRefs.tail,pieces);
  result.viewAngle=[-.54,.21];return result;
}
function washerStudy(){
  const parts=[
    part('body','Nozzle body','The compact molded body passes through the trim below the headlamp.',[0,0,.48],r=>{
      const a=lampOutline(.58,.29,.081),b=lampOutline(.43,.18,.058);lampWall(r,map,a,.020,b,.117,'#596462');r.polygon(b.map(v=>map(...v,.117)),'#73807d',false);
      sleeve(r,origin,ay,-.33,.02,.12,.077,black,28);
    }),
    part('jet','Outlet and jet','A small metal outlet aims fluid toward the headlamp glass.',[.38,.26,.13],r=>{
      r.rod(map(0,0,.084),map(0,.102,.165),.038,metal,18);r.rod(map(0,.102,.165),map(0,.105,.170),.020,black,16);
    }),
    part('seal','Trim seal','The flange sits against the trim at the nozzle opening.',[-.29,.24,-.19],r=>outlinePiece(r,.62,.32,-.022,.011,seal,.76)),
    part('hose','Feed hose and connection','A hose from the washer valve feeds each nozzle.',[.18,-.51,-.07],r=>{
      sleeve(r,origin,ay,-.53,-.34,.082,.051,black);r.rod(map(0,0,-.53),map(.08,-.10,-.72),.068,black,18);
    })
  ];
  const view=study('g500-washer-nozzle','Headlamp washer nozzle','The left and right nozzles sit below the headlamps. A valve divides the feed from the headlamp washer pump.',lampRefs.washer,parts);
  view.viewAngle=[-.66,.22];return view;
}
export function getG500LampDetail(vehicle,id){
  if(vehicle!=='g500'||typeof id!=='string')return null;
  if(['lighting.headlamp','lighting.housing','lighting.reflector'].includes(id))return roundHeadlamp();
  if(id==='body.rear-lights' || id==='lighting.tail-left' || id==='lighting.tail-right')return combinationStudy(id!=='lighting.tail-right');
  const tail=/^g500-tail-(?:left|right)\.(stop|turn|tail)$/.exec(id);
  if(tail)return bulbStudy({stop:'P21W',turn:'PY21W',tail:'R5W'}[tail[1]]);
  if(['g500-round-headlamp.h4','lighting.h4-left','lighting.h4-right'].includes(id))return h4Study();
  if(id==='lighting.washer')return washerStudy();
  if(id==='lighting.parking-left'||id==='lighting.parking-right'||id==='g500-round-headlamp.parking')return bulbStudy('T4W');
  const match=/^g500-optic-(\w+)\.bulb$/.exec(id);
  if(match&&specs[match[1]])return bulbStudy(specs[match[1]].bulb);
  const named={'body.fog-lamps':'fog','lighting.rear-fog':'rearFog','lighting.reverse':'reverse','lighting.indicator':'wing'};
  const kind=named[id]||(/^lighting\.fog-(left|right)$/.test(id)?'fog':/^lighting\.front-marker-(left|right)$/.test(id)?'amber':/^lighting\.rear-marker-(left|right)$/.test(id)?'red':/^lighting\.repeater-(left|right)$/.test(id)?'repeat':null);
  return kind?opticalStudy(kind):null;
}
