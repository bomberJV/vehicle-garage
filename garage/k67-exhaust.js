import {TAU,cyl,sleeve,part,study,x,y,metal,steel,dark,gold} from './mechanism-shapes.js';
import {barrel,ellipse,pipe} from './road-primitives.js';
import {plate} from './k67-workbench.js';
const manifold=plate('18_1582','Headers and front muffler'),flap=plate('18_1555','Exhaust flap controls'),rear=plate('18_1587','Rear muffler');
const bronze='#a99472',satin='#868d8c',rubber='#424a4c';
function headers(r){
  for(let i=0;i<4;i++){
    const yy=(i-1.5)*.077;
    pipe(r,[[-.337,yy,.677],[-.426,yy,.625],[-.465,yy,.528],[-.449,yy,.414],[-.384,yy,.334],[-.251,yy,.283],[-.11,yy*.80,.260]],.020,bronze,12);
    sleeve(r,[-.344,yy,.672],[1,0,.55],-.010,.003,.032,.020,steel,12);
    for(const side of [-1,1])cyl(r,[-.347,yy+side*.028,.670],x,-.007,.002,.006,metal,6);
  }
}
function chamber(r){
  // Section widths follow the oval front muffler and its tapered outlet in BMW plate 18_1582.
  const rings=[[-.135,.003,.266,.100,.048],[-.065,.016,.260,.140,.067],[.163,.04,.273,.128,.066],[.264,.086,.301,.074,.052],[.31,.123,.316,.037,.035]]
    .map(([xx,yy,zz,hw,ht])=>Array.from({length:16},(_,i)=>[xx,yy+hw*Math.cos(TAU*i/16),zz+ht*Math.sin(TAU*i/16)]));
  for(let i=1;i<rings.length;i++)for(let j=0;j<16;j++){const k=(j+1)%16;r.polygon([rings[i-1][j],rings[i][j],rings[i][k],rings[i-1][k]],j<8?satin:'#666d6c',false);}
  r.polygon(rings[0],satin,false);r.polygon(rings.at(-1),satin,false);
  for(const s of [-1,1]){const c=[.177,s*.108,.325];barrel(r,c,[.202,s*.134,.363],.014,steel,8);}
}
function rearCan(r){
  pipe(r,[[.233,.113,.274],[.295,.144,.280],[.367,.167,.317],[.453,.184,.370]],.031,satin,12);
  // BMW 18_1587, 18 51 8 564 952. The pressed stainless shell has a
  // sculpted shoulder and turned-over end cap. It is the standard silencer.
  const sections=[
    [.437,.183,.363,.034,.038],[.481,.188,.385,.059,.063],
    [.546,.196,.424,.071,.076],[.689,.202,.528,.075,.082],
    [.724,.204,.553,.072,.079],[.747,.205,.566,.068,.074],
    [.757,.205,.574,.060,.067]
  ];
  const n=24;
  const rings=sections.map(([xx,yy,zz,w,h])=>Array.from({length:n},(_,i)=>{
    const angle=TAU*i/n;
    // Normal section of the upturned can. The flatter outboard side carries
    // the shield screws, and the rear cut is oblique to the centerline.
    const c=Math.cos(angle),v=Math.sin(angle),flank=Math.sign(c)*Math.abs(c)**.78;
    return [xx-.47*h*v,yy+w*flank,zz+.883*h*v];
  }));
  const metal=['#8b8e8b','#949895','#aaaeaa','#c0c3bf','#d6d7d2','#cbcfca','#b4b9b6','#a8afab',
    '#9da4a0','#89918f','#7e8784','#747c7a','#717876','#767e7b','#7f8884','#878f8b',
    '#9da4a0','#b4b9b4','#b1b4ad','#a3a8a3','#9a9f99','#909590','#888d89','#838883'];
  r.polygon(rings[0],satin,false);
  for(let k=1;k<rings.length;k++)for(let j=0;j<n;j++){
    const i=(j+1)%n;
    r.polygon([rings[k-1][j],rings[k][j],rings[k][i],rings[k-1][i]],k===5?'#848c8a':metal[j],false);
  }
  // The recessed end and the bore remain open through the lip.
  const end=rings.at(-1),center=sections.at(-1).slice(0,3);
  const inner=end.map(q=>q.map((v,k)=>center[k]+(v-center[k])*.65));
  const throat=inner.map(([x,y,z])=>[x-.025,y,z-.015]);
  for(let j=0;j<n;j++){
    const i=(j+1)%n;
    r.polygon([end[j],end[i],inner[i],inner[j]],metal[j],false);
    r.polygon([inner[j],inner[i],throat[i],throat[j]],'#505756',false);
  }
  r.polygon(throat,'#303736',false);
  // Pressed fold at the front of the outer heat shield.
  const a=[.460,.226,.372],b=[.503,.249,.418],c=[.555,.268,.440],d=[.549,.269,.426];
  r.polygon([a,b,c,d],'#a6ada8',false);
  r.polygon([a,d,[.523,.257,.401]],'#969e99',false);
  for(const [xx,yy,zz] of [[.500,.249,.398],[.546,.266,.426]]){
    r.ringY(xx,yy,zz,.004,.0014,'#5e6764',8);
  }
}
function valves(r){
  for(const s of [-1,1]){
    const yy=s*.077;
    barrel(r,[-.428,yy-.035,.422],[-.428,yy+.035,.422],.011,bronze,8);
  }
  barrel(r,[.346,.14,.330],[.346,.172,.330],.012,steel,8);
  for(const [xx,yy,zz] of [[-.425,.13,.426],[.346,.18,.330]])cyl(r,[xx,yy,zz],y,-.003,.003,.021,steel,12);
}
function servos(r){
  for(const [xx,yy,zz] of [[-.094,.136,.568],[.152,.125,.555]]){
    r.profile([[xx-.032,zz-.022],[xx+.033,zz-.020],[xx+.036,zz+.02],[xx-.023,zz+.029]],yy-.019,yy+.017,rubber);
    cyl(r,[xx+.006,yy+.021,zz],y,-.002,.004,.017,metal,10);
  }
}
function cables(r){
  for(const delta of [-.003,.003]){
    pipe(r,[[-.088,.16+delta,.565],[-.18,.17+delta,.531],[-.320,.174+delta,.474],[-.425,.137+delta,.426]],.0025,rubber,5);
    pipe(r,[[.158,.149+delta,.555],[.22,.158+delta,.451],[.276,.172+delta,.41],[.346,.183+delta,.330]],.0025,rubber,5);
  }
}
function hanger(r){
  // On the photographed single-rider build the silencer hanger shares the
  // bright cast rearset bracket, with its rubber eye just above the silencer.
  const eye=[.389,.183,.454];
  for(const a of [[.185,.153,.464],[.316,.157,.399],[.486,.157,.506]])barrel(r,a,eye,.010,steel,8);
  sleeve(r,eye,y,-.015,.016,.020,.008,rubber,12);
  cyl(r,eye,y,-.014,.023,.007,metal,8);
}
const components=[
  ['headers','Four headers and port flanges','Each pipe starts at its own exhaust port. BMW’s plate lists four gaskets and eight retaining nuts.',[-.13,0,.08],manifold,headers],
  ['chamber','Under-engine front muffler','The four runners feed the common front muffler beneath the engine. Its outlet turns toward the rider’s right.',[.02,0,-.14],manifold,chamber],
  ['rear','Right-side rear silencer','The link pipe rises into the separate rear muffler. Its tapered outlet points rearward beside the wheel.',[.07,.16,.06],rear,rearCan],
  ['flaps','Control and interference flaps','The header crossover and the downstream flap each have a cable drive. Open the control to follow the movement of a butterfly.',[-.09,-.12,-.05],flap,valves],
  ['servos','Two flap servomotors','One actuator operates the interference-pipe flap and the other operates the exhaust control flap. Their mounts here are approximate.',[0,.16,.10],flap,servos],
  ['cables','Bowden cable pairs','The inner wires travel inside fixed outer casings between the controller and the flap pulleys. The routes here are schematic.',[.10,.09,.12],flap,cables],
  ['hanger','Silencer bracket and rubber mounting','A triangulated bracket carries the rear muffler. The mounting eye contains a rubber isolator and a metal sleeve.',[0,.14,.14],rear,hanger]
];
export const exhaust={id:'exhaust',name:'Exhaust and flap controls',description:'Trace the four headers through the front muffler to the right-hand silencer. The two remote actuators work through Bowden cables.',view:'hero',category:'service',internal:true,source:manifold,
  parts:components.map(([id,name,description,offset,source,draw])=>({id:'exhaust.'+id,name,description,offset,source,draw}))};
export function installedExhaust(r){
  for(const p of exhaust.parts){
    const start=r.faces.length;p.draw(r);
    for(let i=start;i<r.faces.length;i++)r.faces[i].k67Exhaust=p.id;
  }
}
export const exhaustStudy=study('k67-exhaust','From exhaust ports to tailpipe',exhaust.description,manifold,components.map(([id,name,description,offset,source,draw])=>({...part(id,name,description,offset,draw),source})));
export const flapStudy=study('k67-exhaust-flap','Cable-operated exhaust butterfly','The servo pulls one inner cable while the other pays out. The pulley turns the valve shaft. This section shows one flap and an illustrative sweep of its mechanism.',flap,[
  part('body','Valve body','A cutaway of the exhaust passage exposes the butterfly and its shaft.',[-.27,0,-.21],r=>{
    sleeve(r,[-.18,0,0],x,-.15,-.07,.26,.226,steel,26);
    for(let j=0;j<16;j++){const a=TAU*(.25+j/26),b=a+TAU/26,p=(xx,t)=>[xx,.25*Math.cos(t),.25*Math.sin(t)];r.polygon([p(-.25,a),p(.28,a),p(.28,b),p(-.25,b)],steel,false);}
  }),
  part('plate','Butterfly and axle','The circular plate rotates on a shaft across the exhaust passage.',[.26,.13,.11],(r,t)=>{
    const a=.18+.65*(1-Math.cos(TAU*t));ellipse(r,[0,0,0],[.216*Math.sin(a),0,.216*Math.cos(a)],[0,.216,0],1,0,gold,22);
    barrel(r,[0,-.253,0],[0,.299,0],.016,metal,14);
  }),
  part('pulley','Valve pulley','Both wire ends anchor to the same pulley outside the hot exhaust passage.',[0,.34,-.06],(r,t)=>{
    const a=.18+.65*(1-Math.cos(TAU*t));cyl(r,[0,.318,0],y,-.014,.018,.098,dark,18);
    for(const s of [-1,1])cyl(r,[s*.078*Math.sin(a),.335,s*.078*Math.cos(a)],y,-.005,.008,.010,metal,8);
  }),
  part('cables','Cable housings and inner wires','The paired housings terminate at a fixed bracket. Only the inner wires wind around the pulley.',[-.18,.2,.22],r=>{
    for(const s of [-1,1]){
      pipe(r,[[-.48,.316,s*.111],[-.35,.316,s*.111],[-.17,.316,s*.095]],.018,rubber);
      barrel(r,[-.17,.316,s*.095],[0,.316,s*.095],.006,metal,8);
    }
  })
],'Turn the shaft to see the butterfly and cable pulley move together.');
