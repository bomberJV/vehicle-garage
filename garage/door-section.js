import {part,study,turn,sleeve,cyl,tint} from './mechanism-shapes.js';
import {pipe} from './road-primitives.js';
import {glazingFace} from './surface-materials.js';
import {drawG500WindowLift} from './g500-window-lifter.js';
import {link} from './door-hardware.js';

const metal='#9baeb1',black='#303c42',seal='#505658',tan='#c4ac88',dark='#444e51',bronze='#b3a074';
// Draw bent sheets as rows of small convex quads so the wheel arch, body crease
// and rounded hems remain real geometry, including when viewed edge-on.
function sheet(r,point,x0,x1,z0,z1,color,{nx=12,nz=5,depth=.012,opacity=1}={}){
  const grid=(i,j,dy=0)=>{const x=x0+(x1-x0)*i/nx,h=j/nz,z=z0(x)+(z1(x)-z0(x))*h;const q=point(x,z);return [q[0],q[1]+dy,q[2]];};
  const paint=(a,c)=>opacity<1?glazingFace(r,a,c,opacity):r.polygon(a,c,false);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
    const face=[grid(i,j),grid(i+1,j),grid(i+1,j+1),grid(i,j+1)];
    paint(face,tint(color,.915+.10*j/nz+.045*Math.sin(i*Math.PI/nx)));
    if(opacity===1&&depth)r.polygon(face.map(([x,y,z])=>[x,y-depth,z]),tint(color,.76),false);
  }
  if(!depth)return;
  const edge=(a,b)=>r.polygon([a,b,[b[0],b[1]-depth,b[2]],[a[0],a[1]-depth,a[2]]],tint(color,.74),false);
  for(let i=0;i<nx;i++){edge(grid(i,0),grid(i+1,0));edge(grid(i,nz),grid(i+1,nz));}
  for(let j=0;j<nz;j++){edge(grid(0,j),grid(0,j+1));edge(grid(nx,j),grid(nx,j+1));}
}
const glassHeight=(p,x)=>{
  for(let i=1;i<p.pane.length;i++){
    const a=p.pane[i-1],b=p.pane[i];
    if(x<=b[0]&&b[0]>a[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
  }
  return p.pane.at(-1)[1];
};
function glassMesh(r,p,from,to,P,dz=0){
  const breaks=[from,...p.pane.map(q=>q[0]).filter(x=>x>from+.001&&x<to-.001),to];
  for(let i=1;i<breaks.length;i++){
    const a=breaks[i-1],b=breaks[i];if(b-a<.001)continue;
    sheet(r,(u,z)=>P(u,z+dz,.01-.085*(z-p.belt)),a,b,()=>p.belt+.001,x=>Math.max(p.belt+.003,glassHeight(p,x)),'#85aeb7',{nx:Math.max(1,Math.ceil((b-a)*14)),nz:2,depth:0,opacity:.38});
  }
}
function speaker(r,x,y,z,rad){
  const axis=[0,1,0];
  turn(r,[x,y,z],axis,[[.003,0],[.003,rad],[.025,rad],[.031,.91*rad],[.015,.71*rad],[.006,.22*rad],[.029,.13*rad],[.029,0]],'#475354',{n:30});
  for(let j=-4;j<=4;j++){
    const dz=j*rad*.19,half=Math.sqrt(rad*rad-dz*dz)*.94;
    r.rod([x-half,y+.034,z+dz],[x+half,y+.034,z+dz],.003,black,6);
  }
}
function trimStudy(p,base){
  const d=study(base+'-lining',p.name+' door trim section','A small section through the cabin-facing trim shows how its visible covering meets a firm carrier. Expand the section to lift the covering, reveal the cushion and remove a retaining clip. Trim color and material vary by interior package.',p.source,[
    part('skin','Upholstery face','The visible skin follows the shape of the insert and wraps around its edge.',[0,.48,.07],r=>{
      sheet(r,(x,z)=>[x-.5,.17+.025*Math.sin(Math.PI*x)*Math.cos(z),z],.05,.95,x=>.08+.025*x,x=>.45+.06*Math.sin(x*Math.PI),p.style==='classic'?'#7d7562':'#646d68');
    }),
    part('cushion','Cushion layer','This section shows a compliant layer beneath the padded surface.',[0,.22,.23],r=>{
      sheet(r,(x,z)=>[x-.5,.14+.025*Math.sin(x*Math.PI),z],.06,.94,()=>.092,x=>.44+.06*Math.sin(x*Math.PI),'#b89e76',{depth:.028});
    }),
    part('carrier','Molded backing','The backing holds the shape of the insert and carries the mounting points.',[0,-.31,.10],r=>{
      sheet(r,(x,z)=>[x-.5,.087+.025*Math.sin(x*Math.PI),z],.04,.96,()=>.065,x=>.46+.06*Math.sin(x*Math.PI),dark,{depth:.018});
      for(const x of [-.3,0,.3])r.box(x-.009,.022,.09,x+.009,.071,.42,black);
    }),
    part('edge','Folded edge and seam','The covering turns around the edge where the panel meets its neighbor.',[-.24,0,.28],r=>{
      pipe(r,[[-.44,.160,.092],[-.44,.19,.12],[-.43,.19,.424],[-.417,.17,.45]],.009,'#9c9788');
      for(let i=0;i<13;i++)r.rod([-.41,.18,.112+.022*i],[-.407,.18,.124+.022*i],.0025,'#c1b49f',5);
    }),
    part('clip','Panel clip and receiver','A molded clip seats in a receiver on the inner door. The enlarged section shows the clip head and resilient stem.',[.36,-.15,-.18],r=>{
      turn(r,[.31,.085,.24],[0,1,0],[[-.15,0],[-.145,.014],[-.123,.025],[-.094,.02],[-.088,.034],[-.061,.02],[-.048,.039],[-.015,.02],[-.014,.045],[0,.045],[0,0]],tan,{n:16});
      sleeve(r,[.31,0,.24],[0,1,0],-.040,-.024,.048,.024,metal,18);
    })
  ]);
  d.viewAngle=[-.53,.22];return d;
}
function carpetStudy(p,base){
  const d=study(base+'-pocket','Door pocket and carpet lining','The pocket has an open top and raised sides. This section follows the lining down the face and over the upper lip. The backing, edge binding and raised textile pile separate in the exploded view.',p.source,[
    part('bin','Molded storage pocket','Raised sidewalls hold the contents against the lower door panel.',[0,-.32,-.12],r=>{
      r.box(-.40,-.04,.04,.40,.13,.075,'#45483f');
      for(const x of [-.4,.375])r.box(x,-.04,.07,x+.025,.13,.25,'#57584b');
      r.box(-.39,.115,.07,.39,.14,.255,'#565749');
    }),
    part('textile','Tufted carpet face','Short loops form the surface of the lining. A small section of the nap is enlarged here.',[0,.38,.16],r=>{
      r.box(-.39,.143,.065,.39,.158,.245,'#6a6755');
      for(let j=0;j<5;j++)for(let i=0;i<28;i++){
        const x=-.371+i*.027+(j%2)*.006,z=.08+j*.032;
        pipe(r,[[x,.158,z],[x+.004,.172,z+.008],[x+.012,.168,z+.009],[x+.015,.158,z+.003]],.0025,i%3?'#8a8068':'#a09577',5);
      }
    }),
    part('backing','Carpet backing','The flexible backing keeps the pile together and follows the wall of the pocket.',[-.24,.19,.09],r=>r.box(-.39,.139,.064,.39,.143,.246,'#898273')),
    part('binding','Bound upper edge','The binding wraps the cut edge of the carpet where objects pass into the pocket.',[0,.14,.33],r=>{
      pipe(r,[[-.39,.145,.234],[-.38,.145,.252],[.38,.145,.252],[.39,.145,.234]],.010,'#5c5549');
      for(let i=0;i<25;i++)r.rod([-.368+i*.03,.152,.254],[-.352+i*.03,.152,.254],.0022,'#b3a286',5);
    })
  ]);d.viewAngle=[-.42,.41];return d;
}
export function doorSection(p,side){
  const {belt,length,rear}=p,base='door-'+p.vehicle+'-'+(rear?'rear':'front')+'-'+side;
  const dir=side==='right'?-1:1;
  const X=u=>dir*(u-.5)*length,P=(u,z,y=0)=>[X(u),y,z], coord=(u,z)=>[X(u),z];
  const invertOffset=([x,y,z])=>[dir*x,y,z];
  const piece=(id,label,copy,offset,fn)=>part(id,label,copy,invertOffset(offset),fn);
  const bottom=u=>{
    const hem=.018+.065*(1-u)**8+.035*u**9;
    if(rear&&p.vehicle==='g500')return hem+.435*Math.max(0,(u-.656)/.344);
    return rear?hem+.28*(Math.max(0,u-.64)/.36)**1.85:hem;
  };
  const waist=u=>belt+.018*u+.009*Math.sin(u*Math.PI);
  const sheetFace=(u,z,y)=>P(u,z,y+.024*Math.sin(Math.PI*u)-.025*Math.sin(Math.PI*z/belt));
  const perimeter=(y,off=.0)=>[...[.015,.23,.52,.77,.985].map(u=>P(u,bottom(u)+off,y)),P(.985,waist(.985)-off,y),P(.46,waist(.46)-off,y),P(.015,waist(.015)-off,y),P(.015,bottom(.015)+off,y)];
  const lo=p.pane[0][0],hi=p.pane.at(-1)[0];
  const split=p.vent?p.pane[1][0]+.015:lo;
  const coverCut=({utility:.28,pickup:.34,coupe:.26,classic:.30,modern:.31,sedan:.28,crossover:.32})[p.style];
  const ribs=(r,points,radius,color)=>pipe(r,points.map(([u,z,y])=>P(u,z,y)),radius,color,8);
  const parts=[
    piece('skin','Outer skin and folded edge','The painted skin wraps over the edge of the inner pressing. Turn the door around to see the uninterrupted outside face.',[0,-.66,.03],r=>{
      sheet(r,(u,z)=>sheetFace(u,z,-.094),.012,.987,bottom,waist,p.paint,{nx:24,nz:8});
      pipe(r,perimeter(-.075,.008),.005,tint(p.paint,.67),6);
      if(p.style==='utility'||p.style==='pickup')for(const t of [.65,.68]){
        ribs(r,[[.022,belt*t,-.114],[.37,belt*t,-.123],[.95,belt*t,-.107]],.009,black);
      }
    }),
    piece('frame',p.frameless?'Inner pressing and waist rail':'Inner pressing and window sash','The folded inner pressing forms the perimeter. Its access openings reveal the regulator in the middle.',[-.22,-.22,.13],r=>{
      const lip=(u,z)=>P(u,z,.035);
      sheet(r,lip,.014,.985,bottom,u=>bottom(u)+.045,metal);
      sheet(r,lip,.015,.985,u=>waist(u)-.056,waist,metal);
      for(const [a,b] of [[.018,.091],[.90,.98]])sheet(r,lip,a,b,u=>bottom(u)+.046,u=>waist(u)-.059,metal,{nx:3});
      for(const u of [.11,.72,.88]){const z=bottom(u)+.025;sleeve(r,P(u,z,.044),[0,1,0],-.002,.006,.011,.005,tan,12);}
      if(!p.frameless){
        const points=p.pane.map(([u,z])=>P(u,z+.014,.013-.085*(z-belt)));
        pipe(r,points,.014,p.paint,10);
      }
    }),
    piece('glass','Moving side glass','The bottom edge of the moving glass rests on the lift. Its front and rear edges follow guides as the pane descends into the shell.',[0,.06,.63],r=>glassMesh(r,p,split,hi,P)),
    piece('seals','Belt seals and glass runs','The two belt seals sweep the outside and inside surfaces of the pane at the waist. Rubber-lined channels support the side edges.',[.12,-.09,.42],r=>{
      for(const y of [-.016,.037])ribs(r,[[.015,belt+.008,y],[.48,belt+.014,y],[.98,belt+.02,y]],.009,black);
      if(!p.frameless)pipe(r,p.pane.map(([u,z])=>P(u,z,.024-.085*(z-belt))),.009,black,8);
      for(const u of [split+.018,hi-.016])ribs(r,[[u-.014,belt-.32,.011],[u,belt-.12,.017],[u,belt,.011]],.008,rubberColor,8);
    }),
    piece('impact','Door reinforcement','A structural member spans the lower door cavity from the hinge area toward the latch. Its cross-section and position are illustrative.',[0,-.27,-.15],r=>{
      link(r,coord(.12,belt*.38),coord(.88,belt*.60),.043,-.067,.018,'#829598');
      for(const [u,z] of [[.12,belt*.38],[.88,belt*.6]])r.box(X(u)-.029,-.084,z-.026,X(u)+.029,-.062,z+.026,metal);
    }),
    piece('regulator','Window lift mechanism',p.vehicle==='g500'?'The offset motor and curved guide tube raise the glass on a single carrier. Open the regulator to follow its stroke.':p.lift==='cable'?'The motor winds a cable that lifts the glass carriage. Open the mechanism to follow the rail and cable throughout one cycle.':'The motor turns a toothed sector and lifts the window on a pivoted arm. Open the regulator to follow its travel.',[.18,.47,.12],r=>{
      if(p.vehicle==='g500'){drawG500WindowLift(r,P,rear);return;}
      if(p.lift==='cable'){
        for(const u of p.rails===2?[.30,.69]:[.53]){
          link(r,coord(u-.028,.105),coord(u,belt-.045),.036,-.007,.015,metal);
          for(const z of [.124,belt-.066])cyl(r,P(u,z,.013),[0,1,0],0,.012,.022,bronze,12);
          ribs(r,[[u-.03,.114,.014],[u-.02,belt-.065,.014],[u+.019,belt-.06,.014],[u+.012,.13,.014],[.42,.28,.036]],.005,black);
          r.box(X(u)-.042,.014,belt-.095,X(u)+.042,.037,belt-.048,tan);
        }
      }else{
        link(r,coord(.17,.20),coord(.76,belt-.08),.034,.003,.014,metal);
        if(p.lift==='cross')link(r,coord(.68,.20),coord(.30,belt-.08),.031,.022,.015,'#b4bfba');
        r.box(Math.min(X(.25),X(.86)),.018,belt-.08,Math.max(X(.25),X(.86)),.046,belt-.051,black);
      }
      const motorX=p.lift==='cable'?.44:.19;
      cyl(r,P(motorX,.235,.028),[0,0,1],-.054,.061,.034,steelColor,16);
      cyl(r,P(motorX,.291,.025),[0,1,0],-.02,.025,.048,black,20);
    }),
    piece('latch','Door latch and lock','The latch on the trailing edge closes around a striker on the pillar. Open the cutaway to watch the fork and pawl work during a normal closing cycle.',[.48,.10,.08],r=>{
      const u=.946,z=belt*.71;
      r.box(X(u)-.026,-.039,z-.073,X(u)+.026,.042,z+.061,dark);
      sleeve(r,P(u,z,.044),[0,1,0],-.01,.014,.032,.016,bronze,18);
      ribs(r,[[.77,z-.037,.08],[.80,z-.06,.057],[.91,z-.01,.038]],.006,rubberColor);
    }),
    piece('outer-handle',p.style==='modern'?'Flush exterior handle':'Exterior handle','The exterior grip sits above the latch. Its shape and finish follow the door generation.',[.21,-.41,.17],r=>{
      const z=belt-.095,y=-.146;
      if(p.style==='modern'){link(r,coord(.72,z),coord(.87,z+.014),.027,y,.015,tint(p.paint,1.1));}
      else{ribs(r,[[.72,z,-.089],[.74,z+.02,y],[.844,z+.02,y],[.861,z,-.088]],.014,p.style==='utility'?black:tint(p.paint,1.11));}
    }),
    piece('hinge',p.style==='utility'?'Exposed door hinges':'Door hinges','Two hinges locate the leading edge. Open a single hinge to see the pin, bushings and interleaved knuckles.',[-.55,.04,.07],r=>{
      for(const z of [belt*.26,belt*.81]){
        link(r,coord(.01,z-.01),coord(.087,z+.021),.039,-.038,.017,p.paint);
        cyl(r,P(.019,z,-.049),[0,0,1],-.041,.043,.016,metal,14);
        cyl(r,P(.019,z,-.049),[0,0,1],.042,.046,.019,bronze,14);
      }
    }),
    piece('check','Door check strap','The check strap bridges the hinge edge and the pillar to limit outward travel. It is a separate locating component.',[-.37,-.12,-.21],r=>{
      link(r,coord(-.07,belt*.51),coord(.12,belt*.48),.022,-.022,.017,metal);cyl(r,P(-.069,belt*.51,-.016),[0,1,0],-.012,.025,.016,zincColor,12);
    }),
    piece('barrier',p.carrier?'Sealed module carrier':'Water and sound shield',p.carrier?'The regulator module carrier closes the inner opening. Its edge seal fits between the carrier and the door. The section retains the forward portion.':'Behind the trim, a sealed sheet helps direct water back into the door cavity. The forward portion is retained in this cutaway.',[-.20,.52,-.23],r=>{
      sheet(r,(u,z)=>P(u,z,.059+.004*Math.sin(28*u+11*z)),.035,coverCut+.028,u=>bottom(u)+.064,u=>waist(u)-.055,p.carrier?'#73848a':'#aea798',{nx:9,nz:7,depth:p.carrier?.013:.005});
      ribs(r,[[.042,.10,.061],[.045,belt*.65,.06],[.05,belt-.063,.061],[coverCut+.025,belt-.063,.063]],.005,black);
    }),
    piece('trim','Interior trim panel and upholstery','A section of the trim has been removed to expose the lift and latch. The finished front edge shows the insert, stitched boundary and lower pocket. Open it to see the layers and retaining clip.',[0,.75,-.11],r=>{
      sheet(r,(u,z)=>P(u,z,.091+.027*Math.sin(Math.PI*z/belt)),.026,coverCut,u=>bottom(u)+.026,u=>waist(u)-.018,p.style==='classic'?'#625f52':'#515957');
      ribs(r,[[.035,belt-.042,.105],[.19,belt-.032,.105],[coverCut,belt-.036,.102]],.012,black);
      for(let j=0;j<12;j++){const u=.048+j*.018;ribs(r,[[u,belt*.67,.122],[u+.010,belt*.668,.122]],.002,'#c5b9a2');}
      if(p.style!=='classic')sheet(r,(u,z)=>P(u,z,.156+.016*Math.sin(Math.PI*u/coverCut)),.067,coverCut,u=>bottom(u)+.048,u=>.18+.04*(u/coverCut),p.style==='classic'?'#6d6657':black,{nx:7,nz:4,depth:.014});
    }),
    piece('inner-handle','Interior release and armrest','The handle is within reach of the occupant. The cutaway retains a strip of its supporting trim.',[-.06,.42,.35],r=>{
      const z=belt*.78;
      link(r,coord(.20,z),coord(.37,z+.023),.054,.083,.049,dark);
      link(r,coord(.24,z+.008),coord(.34,z+.028),.014,.136,.012,metal);
      ribs(r,[[.17,belt*.51,.095],[.23,belt*.52,.173],[.49,belt*.56,.185],[.55,belt*.67,.098]],.020,black);
    }),
    piece('speaker','Door loudspeaker and grille','The cone sits behind a grille on the inner trim. The picture shows a representative driver and enclosure.',[-.23,.32,-.33],r=>speaker(r,X(.153),.126,belt*.31,.060))
  ];
  if(p.style==='classic')parts.push(piece('carpet','Carpet-lined lower pocket','The long map pocket sits along the lower door card. Its open top, edge binding and carpet face form a separate trim piece.',[-.22,.44,-.24],r=>{
    const x0=Math.min(X(.26),X(.83)),x1=Math.max(X(.26),X(.83));
    r.box(x0,.079,.036,x1,.164,.057,'#625b4b');
    for(const x of [x0,x1-.009])r.box(x,.08,.056,x+.009,.163,.155,'#615c51');
    sheet(r,(u,z)=>P(u,z,.166+.008*Math.sin((u-.26)*Math.PI/.57)),.26,.83,()=>.051,u=>.144+.020*Math.sin((u-.26)*Math.PI/.57),'#756f5d',{depth:.012});
    ribs(r,[[.26,.144,.166],[.38,.156,.173],[.54,.165,.174],[.72,.155,.170],[.83,.144,.166]],.006,'#9b8e76');
    for(let i=0;i<30;i++){const u=.275+i*.018;ribs(r,[[u,.07,.173],[u+.004,.075,.175]],.0018,'#9c9074');}
  }));
  if(p.vent)parts.push(piece('vent',p.style==='pickup'?'Pivoting vent pane':'Fixed quarter light',p.style==='pickup'?'The small leading pane pivots independently. Its upright divider separates it from the moving glass.':'This front pane stays in its own frame at the front of the Cabriolet door when the main glass lowers.',[-.24,-.12,.46],r=>{
    glassMesh(r,p,lo,split-.014,P);
    pipe(r,[P(lo,belt,.019),P(p.pane[1][0],p.pane[1][1],-.024),P(split,belt,.019)],.011,black);
  }));
  const title=p.name+' '+side+' '+(rear?'rear':'front')+' door';
  const d=study(base,title,p.note+' The inner trim and shield are cut back so you can see the working parts. Turn the section around to inspect the outer skin.',p.source,parts);
  d.viewAngle=[-.43,.22];
  return d;
}
const rubberColor='#393e40',steelColor='#a3b0ac',zincColor='#b7b9a3';
export {trimStudy,carpetStudy};
