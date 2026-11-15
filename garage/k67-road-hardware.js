// The wheelbase fixes the scale in BMW's 2023 RR side photograph. Longitudinal
// stations are in metres; transverse sections interpolate the oblique views.
// BMW Motorrad US parts plates 36_1423/1424 distinguish the standard cast
// wheels from the forged and carbon options shown in some launch photographs.
import {barrel, ellipse, pipe, tint} from './road-primitives.js';

const TAU = 2 * Math.PI;
function bridge(r, rows, colors, closed=true) {
  for (let i = 1; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      const k = (j + 1) % rows[i].length;
      r.polygon([rows[i-1][j], rows[i][j], rows[i][k], rows[i-1][k]], colors[j], false);
    }
  }
  if(closed){
    r.polygon(rows[0], colors.at(-1), false);
    r.polygon(rows.at(-1), colors.at(-1), false);
  }
}

function upholstery(r, stations, colors) {
  // Shallow shoulders, rolled edges and an undercut base to separate seat and skin.
  const rows = stations.map(([x,w,top,base]) => {
    const depth=top-base;
    const half=[[0,top],[w*.64,top-depth*.08],[w*.91,top-depth*.26],[w,top-depth*.49],[w*.95,base+.002],[w*.66,base]];
    return [...half,...half.slice(1).reverse().map(([y,z])=>[-y,z])].map(([y,z])=>[x,y,z]);
  });
  bridge(r,rows,[...colors,colors.at(-1),...colors.slice().reverse()]);
}

export function drawK67Tank(r, paint) {
  // Top, shoulder, widest cheek, pressed knee pocket and folded lower flange.
  // The crown of the filler ring lies tangent to the nearly flat central station.
  const stations=[
    [-.377,.072,.890,.855,.795],[-.340,.117,.946,.895,.769],
    [-.278,.163,.977,.928,.759],[-.207,.190,.996,.944,.754],
    [-.102,.196,1.017,.951,.752],[-.004,.199,1.017,.948,.750],
    [.041,.195,1.006,.933,.753],[.085,.178,.978,.911,.755],
    [.128,.149,.942,.884,.762],[.158,.124,.910,.855,.767],
    [.178,.100,.871,.828,.774],[.199,.072,.834,.807,.780]
  ];
  const shades=[1.11,1.08,1.04,1.00,.93,.79,.67];
  const colors=shades.map(v=>tint(paint,v));
  const rows=stations.map(([x,w,top,shoulder,base])=>{
    const d=top-shoulder, lower=shoulder-base;
    const side=[[0,top],[w*.37,top-d*.045],[w*.67,top-d*.17],[w*.89,top-d*.48],[w,shoulder],[w*.95,shoulder-lower*.30],[w*.79,base+.019],[w*.71,base]];
    return [...side,...side.slice(1).reverse().map(([y,z])=>[-y,z])].map(([y,z])=>[x,y,z]);
  });
  bridge(r,rows,[...colors,'#373e40',...colors.slice().reverse()]);
  // The rising diagonal on each molded knee pad is visible from either side.
  // Cut it against each section of the actual outer skin. A single painted
  // polygon across the valley would pass through the convex tank shoulders.
  const seams=[.876,.931,.954,.970,.874,.834,.824,.813,.801,.817,.828,.810];
  for(const side of [-1,1]){
    const bands=rows.map((ring,i)=>{
      const edge=ring.slice(0,8);
      const yAtZ=z=>{
        for(let j=1;j<edge.length;j++){
          const a=edge[j-1],b=edge[j];
          if(z>=b[2]){
            const t=(a[2]-z)/(a[2]-b[2]);
            return a[1]+t*(b[1]-a[1]);
          }
        }
        return edge.at(-1)[1];
      };
      const top=seams[i],base=stations[i][4]+.005;
      return [0,.28,.58,.83,1].map(t=>{
        const z=top+t*(base-top);
        return [stations[i][0],side*(yAtZ(z)+.0022),z+.0001];
      });
    });
    for(let i=1;i<bands.length;i++)for(let j=1;j<bands[i].length;j++){
      r.polygon([bands[i-1][j-1],bands[i][j-1],bands[i][j],bands[i-1][j]],
        ['#393c3e','#37393b','#33373a','#303437'][j-1],false);
    }
  }
  const x=-.063,z=1.018;
  ellipse(r,[x,0,z],[.045,0,0],[0,.045,0],1,.69,'#9a9fa0',24);
  ellipse(r,[x,0,z+.0004],[.0305,0,0],[0,.0305,0],1,0,'#4f5658',20);
  r.polygon([[x-.005,-.006,z+.001],[x+.014,-.006,z+.001],[x+.014,.006,z+.001],[x-.005,.006,z+.001]],'#a3a9a8',false);
  for(let i=0;i<6;i++){
    const a=TAU*i/6,cx=x+.037*Math.cos(a),cy=.037*Math.sin(a);
    r.polygon(Array.from({length:6},(_,j)=>[cx+.0022*Math.cos(TAU*j/6),cy+.0022*Math.sin(TAU*j/6),z+.0005]),'#41494c',false);
  }
}

export function drawK67Saddle(r, paint, withPillion) {
  const cushion=['#3e4041','#363839','#303233','#282a2b','#242729'];
  // The saddle's low front nose meets the back of the tank. BMW's 832 mm
  // seat-height datum falls on the loaded rider surface, ahead of the kick-up.
  upholstery(r,[[.171,.075,.846,.802],[.205,.107,.835,.785],[.245,.121,.832,.778],
    [.285,.132,.832,.777],[.37,.146,.843,.787],[.438,.143,.854,.811],
    [.491,.122,.874,.835],[.508,.106,.884,.851]],cushion);
  for(const side of [-1,1]){
    // The top of the red infill follows the saddle. Below the infill the
    // black valance returns to the subframe and the rear of the main spar.
    const sections=[[-.205,.157,.778,.707],[-.073,.156,.781,.686],[.029,.153,.780,.682],
      [.088,.150,.761,.700],[.136,.149,.696,.668],[.25,.141,.697,.671],
      [.37,.143,.755,.689],[.496,.122,.847,.771]];
    const rows=sections.map(([x,w,top,base])=>[[x,side*w,top],[x,side*(w+.003),base],[x,side*(w-.026),base-.012],[x,side*(w-.034),top]]);
    for(let i=1;i<rows.length;i++){
      const panel=i<=4?tint(paint,.90):'#373b3d';
      bridge(r,rows.slice(i-1,i+1),[panel,i<=4?tint(paint,.68):'#32373a','#343a3d','#363b3d']);
    }
    const sill=[[.102,.148,.773],[.202,.129,.786],[.285,.141,.777],[.37,.152,.789],
      [.492,.129,.847],[.494,.127,.777],[.363,.150,.713],[.248,.151,.696],[.123,.151,.690]];
    const center=[.285,side*.158,.750];
    for(let j=0;j<sill.length;j++){
      const point=i=>[sill[i][0],side*sill[i][1],sill[i][2]];
      r.polygon([center,point(j),point((j+1)%sill.length)],j<5?'#383d3f':'#303437',false);
    }
  }
  const rails=[
    [.451,.108,.844,.747],[.505,.129,.876,.790],[.536,.140,.921,.816],
    [.581,.141,.959,.845],[.619,.134,.978,.865],[.681,.117,.998,.895],
    [.741,.091,1.016,.926],[.801,.052,1.025,.959],[.830,.027,1.029,.980],[.849,.011,1.012,.993]
  ];
  // Each side has its own painted upper return and black inner wing. The
  // opening between those and the undertray is real at both rear quarters.
  for(const s of [-1,1]){
    const rows=rails.map(([x,w,top,base])=>[
      [x,s*w*.43,top-.001],[x,s*w*.80,top],[x,s*w,top-.010],
      [x,s*w*.99,top-(top-base)*.45],[x,s*w*.69,base+.010],[x,s*w*.57,base+.011],
      [x,s*w*.80,top-(top-base)*.45-.003],[x,s*w*.70,top-.012]
    ]);
    bridge(r,rows,[tint(paint,1.04),tint(paint,1.08),paint,tint(paint,.82),tint(paint,.62),'#333a3e','#343a3c','#383f41']);
  }
  upholstery(r,rails.map(([x,w,top,base])=>[x,w*.69,top-.012,base]),['#454a4d','#3d4244','#343a3c','#2b3133','#292d30']);
  if(withPillion){
    const start=r.faces.length;
    upholstery(r,[[.536,.086,.920,.906],[.565,.105,.953,.931],[.606,.113,.978,.959],
      [.671,.104,.997,.982],[.727,.081,1.010,.997],[.766,.057,1.017,1.008],[.783,.033,1.019,1.012]],cushion);
    for(let i=start;i<r.faces.length;i++)r.faces[i].k67Seat='pillion';
  }
}

export function drawK67Mirror(r,side) {
  const p=(x,y,z)=>[x,side*y,z];
  // Mirror looks rearward. Lens, rounded casing, and the forward-facing LED
  // indicator meet along separate edges rather than coplanar painted ovals.
  barrel(r,p(-.614,.142,1.010),p(-.609,.169,1.031),.019,'#383f42',8);
  pipe(r,[p(-.609,.161,1.029),p(-.602,.230,1.061),p(-.595,.306,1.093),p(-.580,.342,1.116)],.013,'#383d42',8);
  const outline=[[.002,.323,1.107],[.003,.334,1.137],[.005,.373,1.163],[.001,.410,1.160],
    [-.002,.423,1.142],[-.004,.419,1.115],[-.003,.390,1.092],[-.004,.354,1.092]];
  const rim=outline.map(([dx,y,z])=>p(-.537+dx+(y-.36)*.40,y,z));
  const lens=rim.map(([x,y,z])=>[x+.0015,side*(.373+(side*y-.373)*.87),1.125+(z-1.125)*.78]);
  const nose=p(-.616,.369,1.126);
  for(let i=0;i<rim.length;i++){const j=(i+1)%rim.length;
    r.polygon([nose,rim[i],rim[j]],i<4?'#45494b':'#33383a',false);
    r.polygon([rim[i],lens[i],lens[j],rim[j]],'#292e31',false);
  }
  r.polygon(lens,'#9baaad',false);
  r.polygon([p(-.578,.343,1.113),p(-.607,.373,1.127),p(-.569,.407,1.133),p(-.567,.401,1.129),p(-.599,.371,1.124)],'#aeb8b8',false);
}

export function drawK67Frame(r,s) {
  // Tapered aluminium twin spars run from the steering head to the swingarm
  // pivot plates. The exposed rear section is an open tubular subframe.
  const rails=[[-.464,.102,.901,.84],[-.371,.153,.869,.781],[-.217,.182,.802,.706],
    [-.044,.182,.726,.604],[.111,.165,.651,.504],[.177,.151,.585,.420],[.228,.137,.544,.418]];
  const rows=rails.map(([x,w,top,base])=>[[x,s*(w-.019),top],[x,s*w,top-.009],[x,s*(w+.008),base+.024],[x,s*(w-.001),base],[x,s*(w-.028),base+.008]]);
  bridge(r,rows,['#565b5d','#424749','#343a3c','#353b3e','#353a3d']);
  const plate=[[.087,.676],[.158,.670],[.184,.586],[.213,.497],[.194,.348],[.087,.332],[.087,.408],[.064,.547]];
  r.profile(plate,s*.174-.010,s*.174+.010,'#353a3a');
  r.ringY(.129,s*.187,.425,.036,.017,'#aaaead',14);
  r.ringY(.129,s*.188,.425,.017,.010,'#5b6364',12);
  const apex=[.150,s*.128,.530],post=[.505,s*.116,.793],tip=[.663,s*.066,.913];
  pipe(r,[apex,post,tip],.012,'#353a3b',8);
  pipe(r,[[.137,s*.141,.658],[.374,s*.142,.732],tip],.012,'#373c3c',8);
  barrel(r,[.367,s*.138,.677],[.369,s*.139,.732],.010,'#3c4243',8);
  barrel(r,[.179,s*.138,.565],[.194,s*.140,.678],.011,'#3c4141',8);
}

export function drawK67Swingarm(r,s) {
  // Catwalk from the cast pivot to the axle block. Two rails leave a daylight
  // gap beneath the upper span; both converge on the rear adjuster.
  const stations=[[.091,.135,.470,.387],[.130,.148,.476,.379],[.245,.149,.457,.359],
    [.373,.148,.414,.334],[.501,.142,.378,.319],[.620,.136,.353,.293],[.773,.127,.338,.282]];
  const rows=stations.map(([x,w,top,base])=>[
    [x,s*(w-.023),top],[x,s*(w+.009),top-.004],[x,s*(w+.017),top-.017],
    [x,s*(w+.019),base+.013],[x,s*(w+.011),base],[x,s*(w-.021),base]
  ]);
  bridge(r,rows,['#494c4b','#575956','#353a39','#2c3030','#313635','#404643']);
  const brace=[[.140,.398,.360],[.243,.340,.288],[.335,.288,.233],[.397,.267,.222],[.522,.274,.242],[.686,.311,.280],[.736,.326,.286]];
  bridge(r,brace.map(([x,t,b])=>[[x,s*.120,t],[x,s*.149,t-.005],[x,s*.150,b+.004],[x,s*.126,b]]),['#494d49','#333736','#292f2d','#424643']);
  for(const [x,z,rad] of [[.129,.425,.039],[.729,.315,.026]]){
    r.ringY(x,s*.159,z,rad,rad*.52,'#9da4a0',16);
    r.ringY(x,s*.160,z,rad*.50,rad*.23,'#5c6466',10);
  }
  const heel=s*.163;
  r.profile([[.665,.334],[.744,.331],[.751,.302],[.662,.302]],heel-.0025,heel+.0025,'#767e80');
}

export function drawK67Footrest(r,s){
  const p=(x,y,z)=>[x,s*y,z];
  const posts=[p(.172,.153,.457),p(.299,.150,.463)],peg=p(.319,.198,.379);
  for(const mount of posts)barrel(r,mount,peg,.013,'#929899',7);
  barrel(r,peg,p(.319,.255,.379),.012,'#68706f',9);
  for(const y of [.211,.221,.231,.241,.251])barrel(r,p(.319,y,.379),p(.319,y+.002,.379),.014,'#a1a6a3',8);
  pipe(r,[p(.258,.193,.393),p(.214,.206,.363),p(.188,.214,.362)],.006,'#848b8b',7);
  barrel(r,p(.188,.211,.362),p(.188,.235,.362),.008,'#3e4446',8);
}

export function drawK67CrankCover(r,s){
  // Right clutch housing and smaller forward housing sit inside the
  // fairing cutout. Raised radial casting ribs surround the cover.
  // Visible perimeter of the die-cast right casing, in side-photo pixels.
  // The individual webs are recessed between the machined bosses.
  const imagePoint=([u,v],depth)=>[-.728+(1013-u)*1.457/819,s*depth,.300+(596-v)*1.457/819];
  const perimeter=[[522,383],[555,384],[596,390],[644,411],[687,443],[713,467],[725,494],[715,535],[695,556],[667,568],[647,597],[578,604],[541,591],[524,568],[520,514],[521,463]];
  const shell=perimeter.map(q=>imagePoint(q,.180)),ridge=perimeter.map(q=>imagePoint(q,.165));
  const center=imagePoint([620,497],.193);
  for(let i=0;i<shell.length;i++){
    const j=(i+1)%shell.length;
    r.polygon([center,shell[i],shell[j]],i>6&&i<13?'#919591':'#72797a',false);
    r.polygon([ridge[i],shell[i],shell[j],ridge[j]],'#62696a',false);
  }
  for(const path of [[[626,525],[629,538],[610,580],[596,581]],[[665,551],[652,561],[648,578],[640,584]],
          [[570,532],[578,537],[575,567],[570,578]],[[685,469],[690,489],[708,506],[712,508]]]){
    r.polygon(path.map(q=>imagePoint(q,.196)),'#a4aaa5',false);
  }
  for(const anchor of [[552,443],[559,465],[570,529],[672,506],[692,533],[653,570],[583,576],[614,586]]){
    const [cx,cy,cz]=imagePoint(anchor,.198);
    r.polygon(Array.from({length:6},(_,j)=>[cx+.0052*Math.cos(j*TAU/6),cy,cz+.0052*Math.sin(j*TAU/6)]),'#51585a',false);
  }
  const x=s>0?-.008:-.072,z=s>0?.496:.479,rad=s>0?.092:.081;
  const p=(a,R,depth)=>[x+R*Math.cos(a),s*depth,z+R*Math.sin(a)];
  r.tubeY(x,s*.182,s*.201,z,rad,'#373c3e',24);
  r.ringY(x,s*.202,z,rad,rad*.81,'#4b4e4e',24);
  r.ringY(x,s*.204,z,rad*.81,0,'#393c3c',24);
  for(let i=0;i<6;i++){
    const a=i*TAU/6-.14;
    r.polygon([p(a,rad*.24,.205),p(a+.11,rad*.78,.205),p(a+.23,rad*.73,.207),p(a+.28,rad*.30,.205)],'#515453',false);
    const [xx,yy,zz]=p(a+.22,rad*.96,.204);
    r.ringY(xx,yy,zz,.0043,.0018,'#9b9e9c',7);
  }
  const aux=[x-.110,s*.181,z-.090];
  r.tubeY(aux[0],s*.164,s*.188,aux[2],.028,'#737a79',16);
  r.ringY(aux[0],s*.189,aux[2],.028,.021,'#b1b5b0',16);
  r.ringY(aux[0],s*.1885,aux[2],.021,0,'#42494a',16);
}

export function drawK67RearHugger(r){
  // The rear hugger follows the front quadrant of the rear tire. The chain
  // shield continues forward from its left edge to the swingarm pivot.
  const rows=[33,49,67,83,101].map(angle=>{
    const a=angle*Math.PI/180;
    return [-1,-.78,0,.78,1].map(t=>{
      const rad=.341-.026*t*t;
      return [.729-rad*Math.sin(a),.104*t,.315+rad*Math.cos(a)];
    });
  });
  for(let i=1;i<rows.length;i++)for(let j=1;j<5;j++){
    r.polygon([rows[i-1][j-1],rows[i][j-1],rows[i][j],rows[i-1][j]],j===1||j===4?'#363b3e':'#42474a',false);
  }
  const path=[[.246,-.155,.491],[.385,-.154,.483],[.554,-.147,.468],[.666,-.140,.437]];
  bridge(r,path.map(([x,y,z])=>[[x,y-.002,z],[x,y+.027,z+.005],[x,y+.030,z-.002],[x,y+.002,z-.013]]),['#42474a','#323639','#34383b','#363b3d']);
}

// Each drilled track sector surrounds a real aperture. This leaves the spokes
// visible through the rotor even when the bike is silhouetted or exploded.
export function drawK67Brakes(r,{x,y,z,width,rear,side}){
  const outer=rear?.110:.160;
  for(const s of rear?[side]:[-1,1]){
    const plane=y+s*width*.54;
    const polar=(radius,angle,dy=0)=>[x+radius*Math.cos(angle),plane+dy,z+radius*Math.sin(angle)];
    const inner=outer*(rear?.69:.70),count=36;
    for(let i=0;i<count;i++){
      const a=i*TAU/count,b=(i+1)*TAU/count,m=(a+b)*.5,rad=outer*(.778+(i%3)*.069);
      const corners=[polar(inner,a),polar(outer,a),polar(outer,b),polar(inner,b)];
      const center=polar(rad,m),d=rear?.0025:.0032;
      const hole=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[center[0]+d*(u*Math.cos(m)-v*Math.sin(m)),plane,center[2]+d*(u*Math.sin(m)+v*Math.cos(m))]);
      for(let j=0;j<4;j++){const k=(j+1)%4;r.polygon([corners[j],corners[k],hole[k],hole[j]],'#9a9d9b',false);}
    }
    r.tubeY(x,plane-s*.0045,plane,z,outer,'#8c9190',36);
    r.ringY(x,plane-s*.004,z,.048,.020,'#52585a',20);
    const tabs=rear?5:10;
    for(let i=0;i<tabs;i++){
      const a=TAU*i/tabs,dy=-s*.004;
      r.polygon([polar(.044,a-.20,dy),polar(inner+.004,a+.028,dy),polar(inner+.004,a+.17,dy),polar(.044,a+.23,dy)],'#525658',false);
      if(!rear)r.ringY(x+(inner+.002)*Math.cos(a+.10),plane+s*.0005,z+(inner+.002)*Math.sin(a+.10),.0045,.0018,'#838886',8);
    }
    // Leading and trailing faces follow the swept track. The fastening bosses
    // sit behind the fork at the front and on the rear carrier at the back.
    const ca=rear?2.15:.38;
    const shell=[polar(outer*.76,ca-.28),polar(outer*1.035,ca-.35),polar(outer*1.12,ca-.16),
      polar(outer*1.115,ca+.13),polar(outer*1.034,ca+.33),polar(outer*.78,ca+.27)];
    const rows=[-.010,.010,.025].map((offset,i)=>shell.map(([xx,yy,zz])=>[xx+(i===2?-.003:0),yy+s*offset,zz]));
    bridge(r,rows,['#3b4042','#4a4f50','#565b5b','#414749','#373d40','#343a3b']);
  }
}

export function drawK67CastWheel(r,{x,y,z,rim,width,finish}){
  const half=width<.15?.04445:.0762; // 3.50 and 6.00 inch bead seats
  const radius=.944*rim, hub=width<.15?.042:.054;
  const p=(angle,rad,dy)=>[x+rad*Math.cos(angle),y+dy,z+rad*Math.sin(angle)];
  const count=36;
  // The recessed well, side flanges and rounded bead-seat transitions make
  // the rim visible as a deep metallic channel as it turns away from view.
  const well=.898*rim;
  r.tubeY(x,y-half*.44,y+half*.44,z,well,tint(finish,.73),count);
  for(const side of [-1,1]){
    const arc=i=>TAU*i/count;
    for(let i=0;i<count;i++){
      r.polygon([p(arc(i),well,side*half*.44),p(arc(i+1),well,side*half*.44),
        p(arc(i+1),radius,side*half),p(arc(i),radius,side*half)],tint(finish,.91),false);
    }
  }
  for(const s of [-1,1]){
    r.ringY(x,y+s*half,z,rim+.003,radius,tint(finish,.93),count);
    r.ringY(x,y+s*half*.65,z,hub,.017,tint(finish,.80),20);
  }
  r.tubeY(x,y-half*.65,y+half*.65,z,hub,tint(finish,.64),20);
  function castArm(angle,stations) {
    const rows=stations.map(([rad,lean,span,depth])=>[
      p(angle+lean-span,rad,-depth),p(angle+lean+span,rad,-depth),
      p(angle+lean+span,rad,depth),p(angle+lean-span,rad,depth)]);
    bridge(r,rows,[tint(finish,.77),tint(finish,.51),tint(finish,.95),tint(finish,.64)],false);
  }
  for(let root=0;root<5;root++){
    const a=root*TAU/5+.15;
    castArm(a,[[hub*.91,0,.39,half*.64],[rim*.43,0,.24,half*.38]]);
    for(const s of [-1,1]){
      castArm(a,[[rim*.412,s*.117,.130,half*.37],[rim*.55,s*.172,.109,half*.31],
        [rim*.76,s*.236,.078,half*.22],[radius+.0008,s*.308,.059,half*.26]]);
    }
  }
}
