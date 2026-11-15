// References identify the variant and assembly. All meshes are independently
// drawn sections; neither catalog supplies measured manufacturing geometry.
import {study,part,sleeve,turn,x} from './mechanism-shapes.js';
import {caseHalf,caseInspectionHalf,deck,castingWalls,headStuds,saddles,bearingStations,shell,borePart,nosePart,boltPart} from './porsche-case-geometry.js';

import {crankFeature,drawCrank} from './porsche-crankshaft.js';

const pet='https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf';
const source=(label,url)=>({label,url});
export const porscheCaseSources={
  classic:source('Porsche Classic · 993 crankcase, plate 101-05',pet+'#page=34'),
  classicWeb:source('Porsche service training · 993 crankshaft photograph, p. 53','https://data.club911.net/divers/964tech/964doc.pdf#page=57'),
  classicRight:source('Porsche Classic · 993 right crankcase, plate 101-10',pet+'#page=38'),
  classicCrank:source('Porsche Classic · 993 crankshaft and bearings, plate 102-00',pet+'#page=42'),
  classicHardware:source('Porsche Classic · 993 crankcase screw, washer and O-ring, items 26–28',pet+'#page=40'),
  classicService:source('Porsche Cars North America · 993 replacement crankcase, p. 2','https://static.nhtsa.gov/odi/tsbs/2020/MC-10180465-0001.pdf#page=2'),
  modern:source('Porsche Engineering · 9A2evo, 3.0-litre turbo at left, p. 63','https://a.storyblok.com/f/288757/x/7d68420fca/2019-02-en-porsche-engineering-magazine-engineering-in-the-data-space.pdf#page=63'),
  modernHousing:source('992.1 Carrera parts drawing · crankcase, plate 101-100','https://www.design911.co.uk/diagrams/d/50603/0'),
  modernThrust:source('Sunset Porsche · 992 crankshaft thrust washer, 0PB-105-791','https://www.sunsetporscheparts.com/oem-parts/porsche-engine-crankshaft-thrust-washer-pb105791'),
  modernScrew:source('Harper Porsche · main-bearing screw with washer, PAF-008-240','https://www.harperautoparts.com/oem-parts/porsche-engine-crankshaft-main-bearing-cap-bolt-paf008240'),
  modernCrank:source('992.1 Carrera parts drawing · crankshaft, plate 102-000','https://www.design911.co.uk/uploads/images/diagrams/diagrams/992-1_2019_102-000.jpg')
};
const ref=porscheCaseSources;
function view(id,name,description,reference,pieces,motion='',sources=[]){
  const mesh=study(id,name,description,reference,pieces,motion);
  mesh.sources=sources;mesh.viewAngle=[-.70,.43];
  // The inspector uses the part/group reference in its component panel.
  for(const group of mesh.groups)for(const component of group.parts)component.source??=reference;
  return mesh;
}
function piece(id,name,description,offset,draw,reference){
  return {...part(id,name,description,offset,draw),source:reference};
}
function shaftAssembly(modern){
  const id=modern?'992case':'993case',drawing=modern?ref.modern:ref.classic;
  const parts=[];
  for(const [key,side] of [['left',-1],['right',1]]){
    const title=side<0?'Left':'Right';
    parts.push(piece(key,title+' crankcase half',modern?
      'Three cylinder bores extend out from this casting. The bearing saddles face the opposite half across the vertical joint.':
      'Three circular registers locate the separate finned cylinder barrels. The half-round main-bearing saddles face the joint.',
      [0,side*.78,.07],r=>(r.inspection?.engineCutaway?caseInspectionHalf:caseHalf)(r,side,modern),modern?ref.modernHousing:side<0?ref.classic:ref.classicRight));
  }
  parts.push(piece('crankshaft','Six-throw crankshaft','The six off-axis crankpins each carry a connecting rod. The main journals run on one axis down the center of the case.',[-.24,0,.67],(r,t)=>drawCrank(r,t,modern),modern?ref.modernCrank:ref.classicCrank));
  parts.push(piece('bearings','Main-bearing shells','Thin shells sit in the saddles around each main journal. Open the set and select a bearing station to inspect its split faces.',[0,0,-.54],r=>{
    for(const [i,station] of bearingStations.entries())for(const side of [-1,1])shell(r,station,side,!modern&&i===0);
  },modern?ref.modernCrank:ref.classicCrank));
  const hardware=modern?['shaft','washer']:['shaft','washer','oring','nut'];
  parts.push(piece('fastener',modern?'Main-bearing screw and sealing washer':'Case through-bolt, washers and nut',modern?
    'A long screw clamps the case across a main-bearing web. Open it to see the head, sealing washer and threaded seat. One fastening position is shown.':
    'The through-bolt crosses the case. A washer and O-ring seal each end, and the nut draws the joint together. One fastening position is shown.',
    [.44,.13,.41],r=>hardware.forEach(p=>boltPart(r,p,modern,[.23,0,.171],modern?.81:.61)),modern?ref.modernScrew:ref.classicHardware));
  if(!modern)parts.push(piece('nose','No. 8 bearing sleeve and seals','The pulley-end journal runs in a full-round sleeve. An O-ring seals around the sleeve, and a separate lip seal meets the rotating shaft.',[.66,0,.14],r=>{
    sleeve(r,[.573,0,0],x,-.033,.027,.074,.049,'#b4a68a',24);
    sleeve(r,[.573,0,0],x,-.003,.007,.078,.074,'#515949',24);
    sleeve(r,[.573,0,0],x,.028,.044,.074,.048,'#554e43',24);
  },ref.classicCrank));
  const result=view(id,modern?'9A2evo split crankcase':'993 split crankcase',modern?
    'The two complete castings meet along the crankshaft centerline. Each of the six rods has a separate crankpin. The optional engine cutaway exposes them in place. The section follows the 3.0-litre turbo on page 63. Contours and clearances are illustrative.':
    'The two complete halves meet along a vertical seam. Open either half to see its three barrel registers, or use the engine cutaway to look inside the installed case. Casting contours and clearances are illustrative.',
    drawing,parts,'The crank turns inside the stationary bearing shells. Separate the case halves to follow the six crankpins.',modern?[ref.modernHousing,ref.modernCrank]:[ref.classicService,ref.classicRight,ref.classicCrank,ref.classicWeb]);
  result.viewAngle=[-.39,.42];return result;
}
function casting(modern,side){
  const id=(modern?'992':'993')+(side<0?'caseleft':'caseright'),reference=modern?ref.modernHousing:side<0?ref.classic:ref.classicRight;
  const portions=[
    part('wall','Cast walls and joint flange','The flange follows the vertical joint. This section traces the continuous walls from the joint to the cylinder mounting face.',[0,0,.32],r=>castingWalls(r,side,modern)),
    part('deck',modern?'Cylinder bores and head face':'Cylinder-barrel registers',modern?
      'The bores extend into the case half. The head closes this outer face and the pistons run directly inside the machined openings.':
      'Each circular opening locates a separate cylinder barrel. The flat shoulder provides the barrel’s seating face.',
      [0,side*.46,.08],r=>deck(r,side,modern)),
    part('webs','Main-bearing webs','Each transverse web surrounds half of a main-bearing saddle. Its matching half closes around the shell when the castings meet.',[0,-side*.35,0],r=>saddles(r,side))
  ];
  if(!modern)portions.push(part('studs','Cylinder-head studs','Four studs surround each register. They project through the separate cylinder and head assembly.',[.13,side*.42,.37],r=>headStuds(r,side)));
  const result=view(id,(side<0?'Left':'Right')+' crankcase casting','The colored surfaces divide one casting into viewing sections. Move a section aside to follow the saddle from the split face to the cylinder bank.',reference,portions);
  result.viewAngle=[side<0?.57:-2.56,.36];return result;
}
function set(modern){
  const prefix=modern?'992':'993',reference=modern?ref.modernCrank:ref.classicCrank;
  const stations=bearingStations.map((station,i)=>part('main'+(i+1),('Main bearing '+(i+1))+(!modern&&i===0?' · flanged thrust shells':''),
    !modern&&i===0?'The flanges on the number-one bearing control end movement of the crankshaft.':'The two shells sit on opposite sides of the case joint, surrounding one main journal.',
    [(.14*(i-3)),(i%2?1:-1)*.36,(i-3)*.10],r=>{
      for(const side of [-1,1])shell(r,station,side,!modern&&i===0);
    }));
  if(modern)stations.push(piece('thrust','Separate crankshaft thrust washers','These two half-rings support axial loads. The loose pair is shown beside the bearing row for inspection.',[.25,0,.46],r=>{
    for(const pos of [-.035,.035])turn(r,[0,.08,.18],x,[[pos,.06],[pos,.09],[pos+.006,.09],[pos+.006,.06],[pos,.06]],'#bdab85',{start:Math.PI/2,sweep:Math.PI,n:20});
  },ref.modernThrust));
  return view(prefix+'mainset','Main-bearing stations','The axial spacing follows the sequence along the shaft. Select a position to see how its shells meet around one journal.',reference,stations);
}
function bearingStudy(modern,withThrust){
  const prefix=modern?'992':'993',reference=modern?ref.modernCrank:ref.classicCrank;
  const pieces=[
    part('left','First bearing shell','The shell seats in one machined saddle. Its curved inner face supports the journal on a film of oil.',[0,-.42,0],r=>borePart(r,'left',modern)),
    part('right','Opposing bearing shell','The opposite shell closes the plain bearing around the journal when the castings meet.',[0,.42,0],r=>borePart(r,'right',modern)),
    part('journal','Crankshaft journal','This polished surface is part of the crankshaft. Its diameter establishes the working surface of the bearing.',[-.48,0,.22],r=>borePart(r,'journal',modern))
  ];
  if(withThrust)pieces.push(part('thrust',modern?'Pair of thrust washers':'Thrust faces of the shells',modern?'The half-rings flank a bearing saddle and bear against the crankshaft’s thrust faces.':'Axial load bears on the flanges. The flanges belong to the shells and are isolated here as a viewing section.',[.47,0,.11],r=>borePart(r,'thrust',modern)));
  return view(prefix+(withThrust?'thrustshells':'plainshells'),withThrust?(modern?'Crankshaft thrust washers and journal':'No. 1 thrust bearing'):'Plain main bearing','Split the shells away from the journal to see their bearing surfaces.',reference,pieces);
}
function nose(){
  return view('993bearing8','No. 8 nose bearing','At the outer end of the 993 crank, the bearing is a complete sleeve. Oil can escape outside the sleeve or along the shaft, so two seals serve different surfaces.',ref.classicCrank,[
    part('sleeve','One-piece bearing sleeve','The full circumference supports the pulley-end journal.',[0,.42,0],r=>nosePart(r,'sleeve')),
    part('oring','Static O-ring','This ring sits in the groove around the outside of the sleeve and seals against the case.',[0,0,.40],r=>nosePart(r,'oring')),
    part('seal','Radial shaft seal','The seal body fits in the housing and its inner lip contacts the shaft.',[.47,0,0],r=>nosePart(r,'seal')),
    part('nose','Pulley-end journal','The nose of the crank runs inside the sleeve and projects through the lip seal.',[-.49,-.15,0],r=>nosePart(r,'nose'))
  ]);
}
function fastening(modern){
  const id=modern?'992casebolt':'993casebolt',reference=modern?ref.modernScrew:ref.classicHardware;
  const entries=[
    part('shaft',modern?'Main-bearing screw':'Case through-bolt',modern?'The long main-bearing screw crosses the vertical split and threads into the opposite casting.':'The unthreaded length crosses the engine. The threaded end carries the nut on the far side.',[0,-.54,.06],r=>boltPart(r,'shaft',modern)),
    part('washer',modern?'Sealing washer':'Seating washers',modern?'The washer sits directly beneath the screw head, sealing its seating face.':'A washer on either side bears against the casting and retains the O-ring.',[0,-.20,.36],r=>boltPart(r,'washer',modern))
  ];
  if(modern)entries.push(part('threads','Threaded seat in opposite half','The threaded end locates in this section of casting. The opening exposes the end of the screw.',[0,.40,.15],r=>boltPart(r,'threads',modern)));
  else entries.push(
    part('oring','Through-bolt O-rings','An O-ring at each end seals the clearance around the shank where it passes through the casting.',[0,-.12,-.37],r=>boltPart(r,'oring',false)),
    part('nut','Retaining nut','The separate nut closes the fastener on the opposite side of the 993 case. Its matching part appears on plate 101-05, item 29.',[0,.53,0],r=>boltPart(r,'nut',false))
  );
  return view(id,modern?'9A2evo case fastening':'993 through-bolt and seals','One fastening position shown along its axis. Separate the hardware to see which surfaces meet.',reference,entries);
}
function crankStudy(modern){
  const id=(modern?'992':'993')+'crankdrive',reference=modern?ref.modernCrank:ref.classicCrank;
  const assembly=view(id,'Crankshaft and main shells','The crankpins orbit the main journals. This section keeps the shaft intact so you can see why the counterweights move with the throws.',reference,[
    part('shaft','Crankshaft, webs and counterweights','Each crankpin carries a connecting rod. Its two webs connect it to the main journals on the longitudinal axis.',[0,0,.50],(r,t)=>drawCrank(r,t,modern)),
    part('left','First row of bearing shells','These shells stay in their saddles while the journals rotate.',[0,-.52,0],r=>bearingStations.forEach((s,i)=>shell(r,s,-1,!modern&&i===0))),
    part('right','Opposing row of shells','Each bearing closes around its journal at the vertical joint.',[0,.52,0],r=>bearingStations.forEach((s,i)=>shell(r,s,1,!modern&&i===0)))
  ],'Follow one crankpin through a revolution. The counterweights turn with the shaft and the shells stay still.');
  assembly.viewAngle=[-.32,.25];return assembly;
}
function shaftOnly(modern){
  const id=(modern?'992':'993')+'barecrank',reference=modern?ref.modernCrank:ref.classicCrank;
  const section=view(id,'Bare six-throw crankshaft','This crankshaft is a single forging. Select a journal or cheek to highlight its surface. Play motion to follow one crankpin around the main axis.',reference,[
    part('mains','Seven main journals','Their common axis runs from the flywheel flange to the pulley. The main-bearing shells surround these polished cylindrical lands.',[0,0,-.40],(r,t)=>crankFeature(r,'mains',t,modern)),
    part('pins','Six connecting-rod journals','Each big end runs on a separate polished crankpin. Pins for opposing cylinders face opposite directions. The three pins in one bank are spaced 120 degrees apart.',[0,.38,.18],(r,t)=>crankFeature(r,'pins',t,modern)),
    part('webs','Crank cheeks and counterweights','Each pin is joined to its main journals by two cheeks. The counterweight lobes extend away from the pins. Their exact profiles and balance drilling are illustrative.',[0,-.37,.20],(r,t)=>crankFeature(r,'webs',t,modern)),
    part('ends','Flywheel flange and pulley nose','The gearbox end carries the flywheel. The narrower, stepped nose drives the belt pulley at the opposite end.',[-.4,0,.32],(r,t)=>crankFeature(r,'ends',t,modern))
  ],'All six throws and their counterweights turn together.',modern?[ref.modern]:[ref.classicWeb]);
  section.singlePiece=true;section.viewAngle=[-.31,.22];return section;
}
const catalogs=new Map();
function catalog(modern){
  if(catalogs.has(modern))return catalogs.get(modern);
  const prefix=modern?'992':'993',root=shaftAssembly(modern),bearings=set(modern),plain=bearingStudy(modern,false);
  const crank=crankStudy(modern),shaft=shaftOnly(modern);
  const map=new Map([['engine.case',root],['engine.block',root],[root.id+'.left',casting(modern,-1)],[root.id+'.right',casting(modern,1)],
    ['engine.crankshaft',crank],[root.id+'.crankshaft',crank],[crank.id+'.shaft',shaft],[root.id+'.bearings',bearings],[root.id+'.fastener',fastening(modern)]]);
  for(let i=1;i<=7;i++)map.set(prefix+'mainset.main'+i,!modern&&i===1?bearingStudy(false,true):plain);
  if(modern)map.set('992mainset.thrust',bearingStudy(true,true));
  else map.set('993case.nose',nose());
  catalogs.set(modern,map);return map;
}
export function getPorscheCrankcaseDetail(vehicle,partId){
  if(vehicle!=='porsche993cab'&&vehicle!=='porsche992scab')return null;
  return catalog(vehicle==='porsche992scab').get(partId)||null;
}
