import {driverControls,fittedWindow,starBadge} from './exterior-trim.js';
/* Reference-based exterior surfaces. Components are original schematic meshes,
   not manufacturer CAD. See utility-exterior-references.md for source limits. */
const shade=(hex,f)=>'#'+[0,2,4].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(1+i,3+i),16)*f))).toString(16).padStart(2,'0')).join('');

export {buildG500Exterior} from './exterior-g500.js';

export function buildFordExterior(r,paint,selected=[]){
 const black='#242c30',chrome='#b9c4c7',w=1.0,front=-2.62,rear=2.66,axles=[-1.6891,1.6891];
 const box=(...a)=>r.box(...a),poly=(...a)=>r.polygon(...a),tag=(id,fn)=>r.tag(id,fn);
 const arch=x=>{let z=.51;for(const axle of axles){const d=Math.abs(x-axle);if(d<.46)z=Math.max(z,.445+Math.sqrt(.46*.46-d*d));}return z;};
 const sections=(start,end)=>[start,...axles.flatMap(x=>[-.46,-.42,-.34,-.23,-.12,0,.12,.23,.34,.42,.46].map(d=>x+d)).filter(x=>x>start&&x<end),end].sort((a,b)=>a-b);
 function sideSkin(start,end,top,halfWidth,color,sides=[-1,1]){const xs=sections(start,end);for(let i=0;i<xs.length-1;i++)for(const side of sides){
  const x0=xs[i],x1=xs[i+1],y=side*halfWidth;
  const bands=[[.50,-.009,.76],[.61,-.005,.85],[.83,.002,.91],[1.09,.006,.98],[1.17,.002,1.04],[top,-.014,1.08]].filter(([z],i)=>i===5||z<top);
  const sheet=(x,row)=>[x,side*(halfWidth+row[1]),Math.max(arch(x),row[0])];
  for(let j=1;j<bands.length;j++){
   if(bands[j][0]<=Math.min(arch(x0),arch(x1)))continue;
   poly([sheet(x0,bands[j-1]),sheet(x1,bands[j-1]),sheet(x1,bands[j]),sheet(x0,bands[j])],shade(color,bands[j][2]*(side<0?.94:1)),false);
  }
  // Inward arch return adds a real opening with visible steel thickness.
  poly([[x0,y,arch(x0)],[x1,y,arch(x1)],[x1,y-side*.035,arch(x1)+.016],[x0,y-side*.035,arch(x0)+.016]],black,false);
 }}
 // Clip the bright lower molding where the front/rear arches cut into it.
 // Without the cut, a narrow strip of trim bridges the tire in side view.
 function wheelOpeningTrim(start,end,side,bottom,top,fromSide,color){
  const xs=new Set(sections(start,end));
  for(const axle of axles)for(const h of [bottom,top]){
   const dx=Math.sqrt(Math.max(0,.46**2-(h-.445)**2));
   for(const x of [axle-dx,axle+dx])if(x>start&&x<end)xs.add(x);
  }
  const stations=[...xs].sort((a,b)=>a-b),y=side*fromSide;
  for(let i=1;i<stations.length;i++){
   const x=stations[i-1],next=stations[i];
   if(arch((x+next)/2)>=top)continue;
   const a=Math.min(top,Math.max(bottom,arch(x))),b=Math.min(top,Math.max(bottom,arch(next)));
   poly([[x,y,a],[next,y,b],[next,y,top],[x,y,top]],color,false);
  }
 }
 tag('body.structure',()=>{
  // Distinct front wings, cab sill/doors and bed sides leave both wheel openings clear.
  sideSkin(front,-1.04,1.25,w,paint);
  sideSkin(.35,rear,1.30,w,paint);
  for(const side of [-1,1]){
   // Upper fender shoulder, slight body-line and XLT bright lower moulding.
   box(front,side<0?-w:.78,1.245,-1.04,side<0?-.78:w,1.275,shade(paint,1.07));
   for(const [a,b]of [[front,-1.04],[.36,rear]]){
    box(a,side*(w+.010)-.008,1.12,b,side*(w+.010)+.008,1.146,shade(paint,1.15));
    wheelOpeningTrim(a,b,side,.755,.825,w+.018,'#b8b9ae');
    wheelOpeningTrim(a,b,side,.745,.755,w+.021,black);
   }
   box(-1.01,side<0?-w:.87,.49,.23,side<0?-.87:w,.525,black);
   box(-1.23,side*(w+.020)-.005,1.19,-1.09,side*(w+.020)+.005,1.23,chrome);
   const doorName=side<0?'driver-door':'passenger-door';
   r.rigid(doorName,[0,side*.66,.04],()=>tag(side<0?'body.door':'body.front-right',()=>{
   sideSkin(-1.025,.219,1.24,w,paint,[side]);
   box(-1.024,side*.962-.006,.54,.218,side*.962+.006,1.235,shade(paint,.69));
   box(-.96,side*.946-.011,.65,.154,side*.946+.011,1.18,'#333c40');
   box(-.76,side*.918-.018,.977,-.14,side*.918+.018,1.033,'#4d5659');
   box(-1.014,side*(w+.01)-.009,1.12,.209,side*(w+.01)+.009,1.146,shade(paint,1.15));
   box(-1.014,side*(w+.012)-.006,.755,.209,side*(w+.012)+.006,.825,'#b8b9ae');
   box(-1.014,side*(w+.017)-.004,.745,.209,side*(w+.017)+.004,.755,black);
   // Jamb seams, handle, sash and mirrors move with each door.
   for(const x of [-.98,.20])box(x,side*(w+.016)-.004,.56,x+.009,side*(w+.016)+.004,1.24,shade(paint,.48));
   box(-.12,side*(w+.026)-.013,1.155,.07,side*(w+.026)+.013,1.19,black);
   box(-.10,side*(w+.042)-.010,1.167,.055,side*(w+.042)+.010,1.183,chrome);
   // OBS sail panel and narrow quarter-vent divider, not a modern four-door cab.
   poly([[-1.04,side*.975,1.25],[-.72,side*.89,1.89],[-.66,side*.89,1.89],[-.94,side*.975,1.25]],shade(paint,.88),false);
   poly([[.13,side*.89,1.89],[.25,side*.975,1.25],[.18,side*.975,1.25],[.06,side*.89,1.89]],paint,false);
   poly([[-.72,side*.89,1.89],[.13,side*.89,1.89],[.08,side*.89,1.83],[-.68,side*.89,1.83]],shade(paint,1.1),false);
   r.rod([-.70,side*.976,1.294],[-.546,side*.90,1.828],.009,black,7);
   r.rod([-.75,side*.895,1.912],[.15,side*.895,1.912],.013,chrome,6);
   // Traditional projection mirror with separate support tubes.
   r.rod([-.88,side*1.015,1.31],[-.74,side*1.20,1.38],.015,chrome,8);
   r.rod([-.83,side*1.015,1.52],[-.74,side*1.20,1.56],.013,chrome,8);
   box(-.81,side*1.22-.055,1.34,-.68,side*1.22+.055,1.65,chrome);
   poly([[-.674,side*1.16,1.365],[-.674,side*1.28,1.365],[-.674,side*1.28,1.625],[-.674,side*1.16,1.625]],'#7f9298',false);
   tag('body.glass',()=>{
    fittedWindow(r,[[-.95,side*.982,1.30],[-.675,side*.90,1.825],[-.554,side*.90,1.825],[-.71,side*.982,1.30]],{radius:.033});
    fittedWindow(r,[[-.685,side*.982,1.30],[-.534,side*.90,1.825],[.075,side*.90,1.825],[.18,side*.982,1.30]],{radius:.033});
   });
   }));
   // Upper bed rail is steel with a thin protective cap and visible stake pockets.
   box(.35,side<0?-w:.90,1.30,rear,side<0?-.90:w,1.345,paint);
   box(.36,side<0?-1.007:.91,1.345,rear-.015,side<0?-.91:1.007,1.356,'#3b4547');
   for(const x of [.47,1.48,2.47])box(x,side<0?-.983:.934,1.358,x+.075,side<0?-.934:.983,1.363,'#192125');
  }
  // A bench and dash are visible through the open cab.
  // The bench sits on risers above the seat tracks, clear of the transmission tunnel.
  box(-.60,-.78,.83,.026,.78,.96,'#485055');
  for(const y of [-.656,-.312,.312,.656])box(-.62,y-.03,.645,-.36,y+.03,.83,'#3a4246');
  r.profile([[-.06,.94],[.035,.94],[.136,1.216],[.066,1.236]],-.78,.78,'#434b50');
  driverControls(r,[-.647,-.458,1.127],.178,4);
  box(-.967,-.801,1.076,-.73,.801,1.19,'#465057');
  // Roof, rear cab wall and bulkhead. Glazing is an external surface, not buried.
  poly([[-.72,-.89,1.90],[.13,-.89,1.90],[.13,.89,1.90],[-.72,.89,1.90]],shade(paint,1.17),false);
  const rearOuter=[[.245,-.975,1.25],[.130,-.89,1.90],[.130,.89,1.90],[.245,.975,1.25]];
  const rearOpening=[[.242,-.74,1.34],[.159,-.75,1.81],[.159,.75,1.81],[.242,.74,1.34]];
  for(let i=0;i<4;i++)poly([rearOuter[i],rearOuter[(i+1)%4],rearOpening[(i+1)%4],rearOpening[i]],shade(paint,.78),false);
  // The cab floor underside stops either side of the transmission tunnel.
 for(const side of [-1,1])box(-.98,side<0?-.94:.36,.52,.24,side<0?-.36:.94,.57,shade(paint,.6));
  // Narrow gap between cab and bed, front bed panel, inner side skins and ribbed floor.
  box(.34,-.99,.86,.38,.99,1.31,paint);
  const bedColor=selected.some(p=>p?.visual==='bedmat')?'#242e2b':shade(paint,.80);
  box(.39,-.91,.835,rear-.05,.91,.86,bedColor);
  for(let y=-.84;y<=.85;y+=.12)box(.40,y-.012,.861,rear-.09,y+.012,.876,shade(bedColor,1.16));
  for(const side of [-1,1]){
   poly([[.39,side*.925,.87],[rear-.06,side*.925,.87],[rear-.06,side*.925,1.30],[.39,side*.925,1.30]],shade(paint,.68),false);
   // Rounded inner wheel tubs rise into the bed, with flanged top plates.
   const x=1.70;
   r.profile([[x-.46,.86],[x-.42,1.07],[x-.27,1.18],[x+.27,1.18],[x+.42,1.07],[x+.46,.86]],side<0?-.925:.63,side<0?-.63:.925,bedColor);
  }
  // Tailgate is a separate raised panel with seams, handle and a simple oval badge.
  r.rigid('tailgate',[.56,0,.065],()=>tag('body.deck',()=>{
  box(rear-.055,-.85,.84,rear,.85,1.31,paint);
  box(rear+.006,-.83,.90,rear+.012,.83,.918,shade(paint,.73));
  box(rear+.006,-.13,1.20,rear+.026,.13,1.255,black);
  poly(Array.from({length:24},(_,i)=>[rear+.03,Math.cos(i/24*Math.PI*2)*.085,1.08+Math.sin(i/24*Math.PI*2)*.033]),'#244d77',false);
  }));
  for(const side of [-1,1]){
   box(rear+.015,side*.92-.07,.76,rear+.045,side*.92+.07,1.31,black);
   box(rear+.047,side*.92-.058,.79,rear+.052,side*.92+.058,1.29,'#963f3d');
   box(rear+.054,side*.92-.052,.99,rear+.059,side*.92+.052,1.065,'#bac8c6');
  }
  // Chrome step bumper with black tread pads and central plate recess.
  box(rear-.03,-1.025,.50,rear+.16,1.025,.68,chrome);
  box(rear+.162,-.31,.515,rear+.17,.31,.655,'#303a3f');
  for(const side of [-1,1])box(rear-.025,side*.64-.24,.682,rear+.155,side*.64+.24,.691,black);
 });
 tag('body.hood',()=>{
  poly([[front,-.80,1.275],[front,.80,1.275],[-1.04,.82,1.30],[-1.04,-.82,1.30]],shade(paint,1.14),false);
  poly([[front,-.80,1.275],[front+.04,-.78,1.32],[-1.07,-.81,1.34],[-1.04,-.82,1.30]],shade(paint,.90),false);
  poly([[front,.80,1.275],[front+.04,.78,1.32],[-1.07,.81,1.34],[-1.04,.82,1.30]],shade(paint,.90),false);
  poly([[front+.04,-.78,1.32],[front+.04,.78,1.32],[-1.07,.81,1.34],[-1.07,-.81,1.34]],shade(paint,1.16),false);
  // Hood rear edge/cowl grille.
  box(-1.09,-.78,1.335,-1.02,.78,1.35,black);
  for(let y=-.72;y<.73;y+=.055)box(-1.085,y,1.352,-1.025,y+.018,1.356,'#7f8c8c');
 });
 r.rigid('windshield',[-.26,0,.23],()=>tag('body.glass',()=>{
  fittedWindow(r,[[-1.019,-.81,1.365],[-.70,-.87,1.83],[-.70,.87,1.83],[-1.019,.81,1.365]],{radius:.033});
  for(const side of [-1,1])r.rod([-1.029,side*.81,1.365],[-.71,side*.87,1.84],.011,black,8);
 }));
 r.rigid('cab-back',[0,0,0],()=>tag('body.glass',()=>{
  fittedWindow(r,[[.242,-.74,1.34],[.159,-.75,1.81],[.159,.75,1.81],[.242,.74,1.34]],{radius:.033});
  for(const y of [-.28,.28])r.rod([.259,y,1.36],[.157,y,1.79],.009,black,6);
 }));
 tag('body.structure',()=>{
  for(const y of [-.40,.32]){
   r.rod([-1.036,y-.17,1.376],[-1.01,y+.08,1.415],.010,black,8);
   r.rod([-1.01,y-.16,1.415],[-1.01,y+.13,1.415],.014,black,6);
  }
 });
 tag('lighting.headlamp',()=>{
  // OBS composite rectangular lamps, visibly separate from lower amber markers.
  for(const side of [-1,1]){
   const y=side*.75;
   box(front-.038,y-.205,.955,front-.014,y+.205,1.235,black);
   box(front-.046,y-.182,.977,front-.040,y+.182,1.215,chrome);
   box(front-.052,y-.168,.988,front-.048,y+.168,1.205,r.lights?'#dedfce':'#8b9c9f');
   for(let i=-4;i<=4;i++)r.rod([front-.055,y+i*.033,1.00],[front-.055,y+i*.033,1.19],.0025,r.lights?'#f0eedb':'#b5c2c3',5);
  }
 });
 tag('lighting.indicator',()=>{
  for(const side of [-1,1]){
   const y=side*.75;
   box(front-.046,y-.186,.852,front-.040,y+.186,.934,'#a66d2a');
   box(front-.052,y-.17,.867,front-.048,y+.17,.919,'#d1a14e');
   // Amber outer corner lens wraps around the front wing.
   box(front-.03,side<0?-1.01:.986,.86,front+.14,side<0?-.986:1.01,.99,'#bc8437');
  }
 });
 tag('body.structure',()=>{
  // Chrome perimeter, dark grille cavity, raised crossbars and central oval.
  box(front-.028,-.545,.88,front-.013,.545,1.245,chrome);
  box(front-.036,-.51,.91,front-.030,.51,1.216,black);
  for(const z of [.936,1.045,1.154])box(front-.047,-.495,z,front-.039,.495,z+.023,chrome);
  for(let y=-.44;y<=.45;y+=.11)box(front-.043,y-.008,.92,front-.037,y+.008,1.20,'#76878b');
  poly(Array.from({length:32},(_,i)=>[front-.055,Math.cos(i/32*Math.PI*2)*.105,1.062+Math.sin(i/32*Math.PI*2)*.042]),'#234f80',false);
  // Raised bumper corners and a rubber impact strip; central license plate.
  box(front-.13,-1.035,.54,front+.055,1.035,.77,chrome);
  box(front-.137,-1.02,.635,front-.132,1.02,.685,black);
  box(front-.145,-.28,.552,front-.14,.28,.718,'#354147');
  box(front-.15,-.24,.568,front-.147,.24,.70,'#c6cab8');
  box(front+.01,-1.01,.49,front+.16,1.01,.54,black);
 });
}

// The barrel and lip are common to the garage renderer. These wheel faces
// have real openings and a stepped axial section from the hub to the lip.
export function utilityWheelSpokes(r,{vehicle,x,y,z,side,rim,finish,design='stock'}) {
 const point=(angle,radius,depth)=>[x+Math.cos(angle)*radius,y+side*depth,z+Math.sin(angle)*radius];
 const band=(inner,outer,innerDepth,outerDepth,color,segments=48)=>{
  for(let i=0;i<segments;i++){
   const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
   r.polygon([point(a,inner,innerDepth),point(a,outer,outerDepth),point(b,outer,outerDepth),point(b,inner,innerDepth)],color,false);
  }
 };
 const lugs=(count,circle,depth,radius,phase=0)=>{
  for(let i=0;i<count;i++){
   const t=phase+i*Math.PI*2/count,xx=x+Math.cos(t)*circle,zz=z+Math.sin(t)*circle;
   r.ringY(xx,y+side*depth,zz,radius*1.34,0,'#414747',12);
   r.tubeY(xx,y+side*(depth+.0005),y+side*(depth+.008),zz,radius,shade(finish,.74),6);
   r.ringY(xx,y+side*(depth+.008),zz,radius,0,shade(finish,1.05),6);
  }
 };
 if(vehicle==='g500'){
  // Photographed 2002 US trucks (Bring a Trailer lot 271820 and others): a
  // broad hub, five straight spokes, each with a sunken center groove, and
  // windows open to the rim flange. Spoke width and groove depth are read
  // from photographs; the hub covers the 130 mm bolt circle.
  const stockG500Face=()=>{
   const hub=.40*rim,tip=rim-.010,dish=rad=>.004+.020*(rad/rim)**2,steps=8;
   for(let i=0;i<5;i++){
    const axis=(.75+i)*2*Math.PI/5+Math.PI/5;
    for(let k=0;k<steps;k++){
     const r0=hub*.94+(tip-hub*.94)*k/steps,r1=hub*.94+(tip-hub*.94)*(k+1)/steps;
     const half=rad=>.032-.006*(rad-hub)/(tip-hub),groove=rad=>.36*half(rad);
     const at=(rad,offset,drop)=>point(axis+offset/rad,rad,dish(rad)-drop);
     const quad=(o0,o1,d0,d1,c)=>r.polygon([at(r0,o0(r0),d0),at(r1,o0(r1),d0),at(r1,o1(r1),d1),at(r0,o1(r0),d1)],c,false);
     const hw=rad=>half(rad),gw=rad=>groove(rad),n=f=>rad=>-f(rad);
     quad(n(hw),n(gw),0,0,shade(finish,.97));
     quad(gw,hw,0,0,shade(finish,1.02));
     quad(n(gw),gw,.008,.008,shade(finish,.72));
     quad(n(gw),n(gw),0,.008,shade(finish,.66));
     quad(gw,gw,0,.008,shade(finish,.80));
     quad(n(hw),n(hw),0,.030,shade(finish,.60));
     quad(hw,hw,0,.030,shade(finish,.74));
    }
   }
   band(.041,hub,.012,dish(hub),shade(finish,.95));
   band(hub,hub,dish(hub),dish(hub)-.030,shade(finish,.64));
   band(.038,.041,.014,.012,finish);
   r.ringY(x,y+side*.014,z,.038,0,'#6a7375',36);
   starBadge(r,[x,y+side*.015,z],.036,'y',side);
   lugs(5,.065,.013,.008,.75*2*Math.PI/5);
  };
  // Atik, Mercedes-Benz wheel programme, p. 88.
  // One continuous cast web surrounds five broad, round-cornered triangular
  // windows. The outboard edge rolls into each open window.
  const atik=design==='atik',root=atik?.370:.345,edge=(rim-.018)/rim;
  const halfSector=Math.PI/5,halfWindow=atik?.494:.48,level=atik?.012:.003,rise=atik?-.010:.018;
  const station=(axis,offset,low,high)=>{
   const a=axis+offset;
   const section=(rad,recess=0)=>point(a,rad*rim,level+rise*rad*rad-recess);
   return {pad:section(root),lower:section(low),upper:section(high),lip:section(edge),
     lowerBack:section(low,.017),upperBack:section(high,.017),
     padBack:section(root,.017),lipBack:section(edge,.017)};
  };
  if(!atik){stockG500Face();return;}
  for(let i=0;i<5;i++){
   const axis=(.75+i)*2*Math.PI/5;
   const rows=[station(axis,-halfSector,.755,.755)];
   for(let j=0;j<=16;j++){
    const t=-Math.PI/2+j*Math.PI/16,u=Math.sin(t),bow=Math.max(0,Math.cos(t));
    const waist=atik?.606+.150*u*u:.626+.139*u*u;
    const low=waist-(atik?.216:.237)*bow*(1-(atik?.25:.40)*u*u);
    const high=waist+(atik?.235:.244)*bow;
    rows.push(station(axis,halfWindow*u,low,high));
   }
   rows.push(station(axis,halfSector,.755,.755));
   for(let j=1;j<rows.length;j++){
    const a=rows[j-1],b=rows[j];
    r.polygon([a.pad,a.lower,b.lower,b.pad],shade(finish,.95),false);
    r.polygon([a.upper,a.lip,b.lip,b.upper],shade(finish,1.0),false);
    r.polygon([a.padBack,b.padBack,b.lowerBack,a.lowerBack],shade(finish,.63),false);
    r.polygon([a.upperBack,b.upperBack,b.lipBack,a.lipBack],shade(finish,.67),false);
    if(j>1 && j<rows.length-1){
     r.polygon([a.lower,a.lowerBack,b.lowerBack,b.lower],shade(finish,.56),false);
     r.polygon([a.upper,b.upper,b.upperBack,a.upperBack],shade(finish,.76),false);
    }
   }
  }
  band(.041,rim*root,.010,level+rise*root*root,shade(finish,.95));
  band(.038,.041,.012,.010,finish);
  r.ringY(x,y+side*.012,z,.038,0,'#6a7375',36);
  starBadge(r,[x,y+side*.013,z],.036,'y',side);
  lugs(5,.065,.011,.008,.75*2*Math.PI/5);
 }else{
  // 16-inch SRW pressed wheel: four short slots in the dished center,
  // separate from the eight lug positions around the hub.
  band(.045,.106,-.001,-.004,shade(finish,.88));
  band(.106,rim*.66,-.004,-.022,shade(finish,.82));
  const inner=rim*.66,outer=rim*.76;
  const n=72;
  for(let i=0;i<n;i++) {
   const step=i%(n/4);
   if(step>=6&&step<12)continue;
   const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
   r.polygon([point(a,inner,-.022),point(a,outer,-.023),point(b,outer,-.023),point(b,inner,-.022)],shade(finish,.77),false);
  }
  band(outer,rim*.84,-.023,-.008,shade(finish,.94),n);
  band(rim*.84,rim-.018,-.008,.013,finish,n);
  r.tubeY(x,y+side*.003,y+side*.031,z,.047,shade(finish,.78),36);
  r.ringY(x,y+side*.032,z,.047,0,shade(finish,.96),36);
  lugs(8,.08255,.003,.009);
 }
}
