import {cmAirRack} from './apollo-air.js';
import {TAU,section,part,loops,tone} from './space-shapes.js';
import {glazingFace} from './surface-materials.js';
import {alloy,frame,shadow,fabric,capsule,seatReference,study,lip,shell,polar,panelBox,plate,ellipse} from './saturn-shapes.js';

const shellAngle={from:-2.48,to:.37,steps:44};
const levels=[[0,1.32],[.09,1.36],[.18,1.35],[.38,1.25],[.81,1.01],[1.20,.76],[1.51,.54],[1.72,.39],[1.79,.31]];
const instrumentRef={label:'NASA · Apollo main display console',url:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/csm10_displays_%26_controls_pp83-86.pdf'};
const stationNames=['Commander’s couch','Command module pilot’s couch','Lunar module pilot’s couch'];
const people=['David Scott occupied the left couch.','Al Worden occupied the center couch. Its frame could fold away to clear the lower equipment bay.','Jim Irwin occupied the right couch.'];
const rect=(w,h)=>[[-w,-h*.82],[-w*.82,-h],[w*.82,-h],[w,-h*.82],[w,h*.82],[w*.82,h],[-w*.82,h],[-w,h*.82]];
const couchProfile=[[-.62,.71],[-.55,.71],[-.48,.66],[-.28,.56],[-.06,.39],[.12,.38],[.23,.48],[.34,.59],[.48,.57],[.59,.48]];
function couch(r,at,kind,withArms){
  const width=.209;
  if(kind==='frame'){
    for(const side of [-1,1]){
      loops(r,couchProfile.map(([y,z])=>at(side*width,y,z)),.015,alloy,false);
      r.rod(at(side*width,-.42,.58),at(side*width,.15,.33),.015,frame,8);
      if(withArms){r.rod(at(side*width,-.11,.42),at(side*(width+.012),-.09,.61),.010,alloy,8);r.rod(at(side*(width+.012),-.09,.61),at(side*(width+.012),.07,.61),.019,'#596766',10);}
    }
    for(const [y,z] of [couchProfile[0],couchProfile[3],couchProfile[6]])r.rod(at(-width,y,z),at(width,y,z),.017,alloy,8);
  }
  if(kind==='cloth'){
    const widths=[.102,.120,.174,.200,.196,.193,.179,.174,.160,.148];
    // A shallow sag makes the cloth wrap around the occupant instead of reading as a solid seat pan.
    for(let i=1;i<couchProfile.length;i++)for(let c=0;c<8;c++){
      const textile=(j,u)=>{const [y,z]=couchProfile[j];return at(u*widths[j],y,z-.026*(1-u*u));};
      const u=-1+c*.25,v=u+.25;
      r.polygon([textile(i-1,u),textile(i-1,v),textile(i,v),textile(i,u)],tone(fabric,.90+.13*c/7+(i%2)*.015),false);
    }
    for(let j=1;j<couchProfile.length;j++)for(const u of [-.78,-.48,0,.48,.78]){
      const a=couchProfile[j-1],b=couchProfile[j],sag=.026*(1-u*u);
      r.rod(at(u*widths[j-1],a[0],a[1]-sag+.002),at(u*widths[j],b[0],b[1]-sag+.002),.0019,'#81968d',5);
    }
    for(const side of [-1,1])loops(r,couchProfile.map(([y,z],j)=>at(side*widths[j],y,z+.008)),.006,'#a2aaa0',false);
  }
  if(kind==='restraints'){
    const ribbon=(p,q,w,material)=>{
      const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy);
      const corner=(pt,side)=>at(pt[0]-side*dy/len*w,pt[1]+side*dx/len*w,pt[2]);
      r.polygon([corner(p,-1),corner(p,1),corner(q,1),corner(q,-1)],material,false);
    };
    for(const side of [-1,1]){
      const shoulder=[[side*.13,-.43,.654],[side*.094,-.25,.552],[side*.038,-.017,.413]];
      for(let j=1;j<shoulder.length;j++)ribbon(shoulder[j-1],shoulder[j],.016,'#d5c5a1');
      ribbon([side*.182,.033,.425],[side*.026,-.017,.415],.022,'#a9ad96');
    }
    r.polygon([at(-.031,-.04,.42),at(.031,-.04,.42),at(.031,.005,.419),at(-.031,.005,.419)],'#c2c5b7',false);
  }
  if(kind==='feet'){
    r.polygon([at(-.173,.51,.581),at(.173,.51,.581),at(.173,.633,.48),at(-.173,.633,.48)],'#a2a7a1',false);
    for(const x of [-.085,.085])loops(r,[at(x-.056,.529,.572),at(x-.049,.57,.557),at(x+.049,.57,.557),at(x+.056,.529,.572)],.009,shadow,false);
  }
}
const seated=([-1,0,1]).map((v,i)=>part(['commander','pilot','lmp'][i],stationNames[i],people[i]+' Open the couch to separate the fabric, restraint and structure.',[v*.62,.34,(i-1)*.16],r=>{
  const at=(x,y,z)=>[v*.465+x,y,z];for(const id of ['frame','cloth','restraints','feet'])couch(r,at,id,i!==1);
}));
function enlargedCouch(isCenter){
  const at=(x,y,z)=>[x*2.10,y*2.10,(z-.29)*2.10];
  return study(isCenter?'endeavour-mid-couch':'endeavour-outer-couch',isCenter?'Center crew couch':'Outboard crew couch','The crew lay back in a cloth sling stretched over steel tubing. The raised knees and heel restraints follow the folded leg supports. NASA’s spacecraft reference identifies the fire-resistant cloth as Armalon.',seatReference,[
    part('frame',isCenter?'Steel couch frame':'Steel frame and armrests',isCenter?'The center couch had no armrests. Its folding frame provided access to equipment beneath and beyond it.':'The outboard couches carried armrests alongside their tubular frames.',[-.48,0,-.20],r=>couch(r,at,'frame',!isCenter)),
    part('cloth','Shaped Armalon cloth','The back, seat and leg sections support the crew member. Stitched edges meet the supporting frame.',[.40,0,.20],r=>couch(r,at,'cloth',!isCenter)),
    part('belts','Shoulder and lap restraints','The shoulder and lap belts meet near the waist. The metal fitting is visible where the belts cross.',[0,.45,.41],r=>couch(r,at,'restraints',!isCenter)),
    part('feet','Foot pan and heel restraints','A metal foot pan and heel restraints locate the boots at the end of the leg pan.',[.26,.48,-.32],r=>couch(r,at,'feet',!isCenter))
  ],[-.77,.65]);
}
const centerCouch=enlargedCouch(true),outerCouch=enlargedCouch(false);
function mainPanel(r,transform,partId){
  const sections=[[-.67,.63],[0,.69],[.67,.63]];
  for(let i=0;i<3;i++){
    const [x,w]=sections[i],at=(u,v,out=0)=>transform(x+u,v,out);
    if(partId==='case'){panelBox(r,at,0,0,w,.44,.029,'#5d686a');plate(r,at,0,0,w-.045,.392,'#777e79',.032);}
    if(partId==='flight'&&i===0){
      for(const u of [-.16,.13]){
        ellipse(r,at,u,.035,.103,.108,'#29383d',.04);ellipse(r,at,u,.035,.084,.088,'#566c75',.042);
        for(let j=0;j<12;j++){const a=j*TAU/12;plate(r,at,u+.07*Math.cos(a),.035+.071*Math.sin(a),.008,.012,'#cccdb7',.045);}
        r.rod(at(u-.009,.025,.047),at(u+.039,.079,.047),.006,'#ece5c7',6);
      }
    }
    if(partId==='indicators'&&i!==0){
      for(let row=0;row<2;row++)for(let col=0;col<5;col++){const u=-.25+col*.108,v=.134-row*.07;plate(r,at,u,v,.074,.044,'#424d4d',.039);plate(r,at,u,v,.054,.020,row?'#a8aea1':'#c4ae82',.042);}
      for(const u of [-.21,-.12,-.03,.06,.15,.24]){plate(r,at,u,-.036,.041,.095,'#334247',.042);plate(r,at,u,-.030,.022,.044,'#a4afa6',.045);}
    }
    if(partId==='controls'){
      for(let j=0;j<7;j++){
        const u=-.26+j*.082;ellipse(r,at,u,-.151,.014,.011,'#283438',.042,10);
        r.rod(at(u,-.15,.043),at(u+.001,-.136,.060),.005,'#c8c6b3',6);
      }
    }
  }
}
const consoleStudy=study('endeavour-console','Main display console','Three sections span the width of the crew stations. The commander’s flight displays occupy the left side. Meter faces and switch banks illustrate the arrangement on NASA’s Block II console drawing.',instrumentRef,[
  ['case','Console panels and surrounds','The pressed metal faceplates mount side by side.',[0,-.35,0]],
  ['flight','Round flight displays','Two round instruments distinguish the left part of the main console.',[-.42,.18,.16]],
  ['indicators','Meter faces and indicator panels','Rows of rectangular meters and indicators make up much of the center and right panels.',[.42,.19,.17]],
  ['controls','Lower switch banks','Small toggle controls project from the lower edge of the display panels.',[.1,.24,-.26]]
].map(([key,name,desc,offset])=>part(key,name,desc,offset,r=>mainPanel(r,(x,v,d)=>[x, d,.57+v],key))),[-.19,.21]);
const hatchOutline=rect(.65,.57),portOutline=rect(.172,.124);
function hatchAnnulus(r,at,outline,hole,material,depth){
  for(let i=0;i<outline.length;i++){
    const j=(i+1)%outline.length;
    r.polygon([at(...outline[i],depth),at(...outline[j],depth),at(...hole[j],depth),at(...hole[i],depth)],tone(material,.91+(i%3)*.034),false);
  }
}
const port=portOutline.map(([x,z])=>[x,z+.21]);
function drawHatch(r,at,piece){
  if(piece==='leaf'){
    hatchAnnulus(r,at,hatchOutline,port,'#b6b7a9',.04);
    hatchAnnulus(r,at,hatchOutline,port,'#d5cfc0',-.008);
    for(let i=0;i<8;i++){
      const j=(i+1)%8;r.polygon([at(...hatchOutline[i],-.009),at(...hatchOutline[j],-.009),at(...hatchOutline[j],.039),at(...hatchOutline[i],.039)],alloy,false);
    }
    for(const z of [-.38,-.23,-.08])r.rod(at(-.52,z,.043),at(.50,z,.043),.014,frame,7);
    loops(r,[at(.22,-.18,.054),at(.22,-.17,.108),at(.46,-.17,.108),at(.46,-.18,.054)],.015,shadow,false);
  }
  if(piece==='window'){
    const inner=portOutline.map(([x,z])=>[.86*x,.85*z+.21]);hatchAnnulus(r,at,port,inner,frame,.045);
    glazingFace(r,inner.map(([x,z])=>at(x,z,.042)),'#749aa6',.47);
  }
  if(piece==='hinges'){
    for(const z of [-.31,.22]){
      panelBox(r,at,-.633,z,.145,.133,.078,frame);
      r.rod(at(-.675,z-.107,.076),at(-.675,z+.107,.076),.032,alloy,14);
      r.rod(at(-.675,z-.116,.076),at(-.675,z+.115,.076),.018,shadow,10);
    }
  }
  if(piece==='seal')loops(r,hatchOutline.map(([x,z])=>at(x*.97,z*.975,-.025)),.014,'#4b5855');
}
const hatchStudy=study('endeavour-hatch','Unified crew hatch','The side hatch formed a single outward-opening door. Its window sat above the center couch. The cutaway separates the leaf, hinge fittings, seal and window surround.',seatReference,[
  ['leaf','Door leaf','The inner panel carries the closing handle and stiffening features.',[.1,.35,.20]],
  ['window','Window and surround','The inset glazing sits within a separate frame in the hatch.',[.24,.40,.29]],
  ['hinges','Exterior hinge fittings','A pair of fittings carries the hinged edge of the door.',[-.46,.13,.06]],
  ['seal','Perimeter seal','The continuous seal follows the closed edge of the hatch.',[.11,-.41,-.18]]
].map(([id,name,desc,offset])=>part(id,name,desc,offset,r=>drawHatch(r,(x,z,d)=>[x,d,z+.64],id))),[-.35,.25]);
function cabinGeometry(r,id){
  if(id==='shell'){
    shell(r,levels,'#c6c7b9',shellAngle);lip(r,.081,1.355,alloy,.043,shellAngle);
    for(const a of [-2.44,-2.05,-1.44,-.85,-.16,.32]){
      const points=levels.slice(2).map(([z,rr])=>polar(a,z,rr-.023));loops(r,points,.014,'#9da7a1',false);
    }
  }
  if(id==='floor'){
    section(r,0,0,[[.048,.82],[.065,1.26],[.084,1.30],[.105,1.30]],'#929c94',{caps:true,steps:52});
    for(let i=-3;i<=3;i++){const x=i*.28,len=Math.sqrt(1.03*1.03-x*x);r.rod([x,-len,.107],[x,len,.107],.009,'#a8b2aa',6);}
  }
  if(id==='beams'){
    r.rod([-.78,-.43,.52],[.78,-.43,.52],.038,alloy,14);
    for(const x of [-.70,.70]){
      r.rod([x,-.44,.50],[x,.57,.34],.026,alloy,10);
      for(const y of [-.42,.52]){r.rod([x,y,.38],[x*1.24,y*1.26,.14],.028,frame,10);r.rod([x*.99,y,.403],[x*1.12,y*1.13,.267],.041,alloy,10);}
    }
  }
  if(id==='console'){const at=(x,v,d)=>[x*.775,.635+v*.76-d*.52,.760+v*.62+d*.85];for(const k of ['case','flight','indicators','controls'])mainPanel(r,at,k);}
  if(id==='lockers'){
    for(const side of [-1,1])for(let j=0;j<3;j++){
      const x=side*(.84-.05*Math.abs(j-1)),y=-.43+.30*j;
      r.box(x-.085,y-.136,.13,x+.085,y+.136,.43,'#b9b49f');
      r.box(x-.081,y-.131,.431,x+.081,y+.131,.438,'#cfcab5');
      r.rod([x-.023,y-.056,.442],[x-.023,y+.056,.442],.008,frame,6);
    }
  }
  if(id==='tunnel'){section(r,0,0,[[1.69,.365],[1.77,.354],[1.80,.324],[1.8,.25],[1.70,.25]],alloy,{steps:36});
    for(let i=0;i<8;i++){const a=i*TAU/8;r.rod(polar(a,1.80,.277),polar(a,1.812,.302),.009,frame,6);}
  }
  if(id==='hatch'){
    const at=(u,v,d)=>[u*.47,-.995+v*.355-d*.45,.783+v*.47];
    for(const p of ['leaf','window','hinges','seal'])drawHatch(r,at,p);
  }
}
export const endeavourCabin=study('endeavour-cabin','Endeavour crew compartment','Three couches span the command module. The main display console faces the crew above their knees. The near wall is cut away to expose the floor, supporting beams and lockers.',capsule,[
  part('shell','Sectioned pressure cabin','The taper follows the outer cone toward the circular docking tunnel. The near half has been removed for the exhibit.',[-.46,-.30,.22],r=>cabinGeometry(r,'shell')),
  part('deck','Aft floor and panels','The flat panels below the couches give access to the lower interior of the cabin.',[0,0,-.52],r=>cabinGeometry(r,'floor')),
  part('beams','Couch support beams and struts','A transverse head beam connects the three couches. Struts attach their common support to the cabin structure.',[-.53,.21,-.25],r=>cabinGeometry(r,'beams')),
  ...seated,
  part('console','Main display console','The commander faced the left part of this console. Open it for a closer view of the meter faces and switch banks.',[.27,.59,.42],r=>cabinGeometry(r,'console')),
  part('ecs','Environmental control equipment','Open the left equipment bay to trace the crew’s breathing-gas circuit through the compressor, rectangular carbon dioxide absorbers and heat exchanger.',[-.64,.15,.26],cmAirRack),
  part('lockers','Side stowage lockers','Stowage occupies the space between the couch assembly and the sloping pressure wall. The small pulls and panel edges are schematic.',[.61,-.10,-.17],r=>cabinGeometry(r,'lockers')),
  part('hatch','Unified crew hatch','A window looks through the side hatch above the center couch. Open it to inspect the hinge fittings, leaf and perimeter seal.',[0,-.47,.35],r=>cabinGeometry(r,'hatch')),
  part('tunnel','Forward docking tunnel','The circular passage at the apex led to the lunar module when the two spacecraft were docked.',[0,0,.62],r=>cabinGeometry(r,'tunnel'))
],[-.76,.75]);
export const cabinEntries=[
  [['apollo.csm'],endeavourCabin],
  [['endeavour-cabin.commander','endeavour-cabin.lmp'],outerCouch],
  [['endeavour-cabin.pilot'],centerCouch],
  [['endeavour-cabin.console'],consoleStudy],
  [['endeavour-cabin.hatch'],hatchStudy]
];
