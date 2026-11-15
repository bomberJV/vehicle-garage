// Exterior studies of two preserved vehicles in The Tank Museum collection.
const museum = 'The Tank Museum';
const olive = '#76816a', shade = '#5b6656', steel = '#666961', dark = '#393e39';
const component = (group, key, name, description, offset) => ({id:group+'.'+key, name, description, offset});
const outlineGroup = (id,name,description,parts) => ({id,name,description,parts});
const leftRight = (group, title) => [-1,1].map((side, i) => component(group,i?'right':'left',
  (i?'Right ':'Left ')+title,'Continuous track and visible running gear along this side of the vehicle.',[0,side*.48,0]));

function loft(r, lower, upper, z0, z1, color) {
  r.polygon(lower.map(([x,y])=>[x,y,z0]),shade);
  r.polygon(upper.map(([x,y])=>[x,y,z1]),color);
  upper.forEach(([x,y],i)=>{
    const j=(i+1)%upper.length;
    r.polygon([[...lower[i],z0],[...lower[j],z0],[...upper[j],z1],[x,y,z1]],i%2?shade:color);
  });
}

function track(r, side, old) {
  const yc=side*(old?.84:.83), y0=yc-.16, y1=yc+.16;
  const path=old?[[-1.86,.40],[-1.91,.61],[-1.64,.85],[1.53,.85],[1.88,.61],[1.87,.36],[1.52,.13],[-1.52,.13]]
    :[[-1.90,.63],[-1.63,.89],[1.59,.85],[1.86,.66],[1.83,.47],[1.38,.14],[-1.38,.14],[-1.78,.41]];
  const inner=path.map(([x,z])=>[x*.96,.5+(z-.5)*.73]);
  for(let i=0;i<path.length;i++) {
    const j=(i+1)%path.length, a=path[i], b=path[j], lift=(p,y)=>[p[0],y,p[1]];
    for(const y of [y0,y1])r.polygon([lift(a,y),lift(b,y),lift(inner[j],y),lift(inner[i],y)],steel);
    r.polygon([lift(a,y0),lift(a,y1),lift(b,y1),lift(b,y0)],dark);
    const steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.12);
    for(let k=0;k<steps;k++){
      const t=(k+.5)/steps,x=a[0]+t*(b[0]-a[0]),z=a[1]+t*(b[1]-a[1]);
      r.rod([x,y0-.007,z],[x,y1+.007,z],.014,'#74776c',5);
    }
  }
  const wheels=old?Array.from({length:12},(_,i)=>[-1.45+i*.26,.34,.16]):
    [[-1.56,.62,.21],[-1.16,.36,.21],[-.76,.36,.21],[-.19,.36,.21],[.21,.36,.21],[.78,.36,.21],[1.18,.36,.21],[1.57,.62,.20]];
  for(const [x,z,radius] of wheels){
    r.tubeY(x,y0+.015,y1-.015,z,radius,dark,24);
    const y=yc+side*.15;
    r.ringY(x,y,z,radius,radius*.73,'#50574e',24);
    r.ringY(x,y+side*.005,z,radius*.72,0,olive,20);
    r.ringY(x,y+side*.010,z,radius*.24,0,steel,12);
  }
  if(!old)for(const x of [-.96,.01,.98]){
    const y=yc+side*.165;
    r.rod([x-.18,y,.37],[x,y,.58],.043,shade,8);
    r.rod([x+.18,y,.37],[x,y,.58],.043,shade,8);
  }
}

function squarish(x0,x1,w,cut) {return [[x0,-w+cut],[x0+cut,-w],[x1-cut,-w],[x1,-w+cut],[x1,w-cut],[x1-cut,w],[x0+cut,w],[x0,w-cut]];}

function sherman(r){
  for(const side of [-1,1])r.tag('tracks.'+(side===1?'right':'left'),()=>track(r,side,false));
  r.tag('hull.lower',()=>loft(r,squarish(-1.70,1.58,.64,.14),squarish(-1.85,1.64,.70,.12),.30,.82,shade));
  r.tag('hull.upper',()=>{
    loft(r,squarish(-1.83,1.81,.86,.15),squarish(-1.35,1.68,.68,.09),.78,1.29,olive);
    for(const s of [-1,1])r.box(-1.86,s*.91-.095,.85,1.79,s*.91+.095,.88,olive);
  });
  r.tag('hull.deck',()=>{
    for(let i=0;i<12;i++)r.box(.64+i*.072,-.44,1.293,.67+i*.072,.44,1.31,shade);
    for(const y of [-.34,.34])r.box(-1.20,y-.16,1.296,-.86,y+.16,1.33,shade);
  });
  r.tag('outline.turret',()=>{
    const ring=(sx,sy,z,shift)=>Array.from({length:18},(_,i)=>[shift+sx*Math.cos(i*2*Math.PI/18),sy*Math.sin(i*2*Math.PI/18),z]);
    const bands=[ring(.65,.53,1.30,-.17),ring(.85,.60,1.54,-.12),ring(.75,.47,1.79,-.10)];
    for(let n=0;n<2;n++)for(let i=0;i<18;i++){const j=(i+1)%18;r.polygon([bands[n][i],bands[n][j],bands[n+1][j],bands[n+1][i]],i%5===1?shade:olive);}
    r.polygon(bands[2],olive);r.rod([-.78,0,1.54],[-2.63,0,1.55],.061,shade,16);
    r.box(-2.67,-.083,1.475,-2.48,.083,1.63,shade);
  });
  r.tag('outline.cupola',()=>{
    for(const [x,y,rad] of [[-.07,.20,.21],[.13,-.25,.15]]){
      const top=Array.from({length:18},(_,i)=>[x+rad*Math.cos(i*Math.PI/9),y+rad*Math.sin(i*Math.PI/9),1.885]);
      r.rod([x,y,1.79],[x,y,1.885],rad,shade,18);r.polygon(top,olive);
    }
  });
}

function littleWillie(r){
  for(const side of [-1,1])r.tag('tracks.'+(side===1?'right':'left'),()=>{
    track(r,side,true);
    r.profile([[-1.55,.49],[-1.4,.77],[1.36,.77],[1.62,.57],[1.46,.40],[-1.39,.40]],side*.93,side*.96,shade);
  });
  r.tag('hull.plates',()=>{
    loft(r,squarish(-1.74,1.62,.71,.12),squarish(-1.53,1.50,.70,.12),.67,1.50,'#687170');
    for(const side of [-1,1])for(const x of [-1.25,-.64,.03,.69,1.28])for(const z of [.87,1.07,1.30,1.43])
      r.ringY(x,side*.716,z,.015,0,'#4a5352',8);
  });
  r.tag('hull.cab',()=>{
    loft(r,squarish(-1.49,-.87,.58,.08),squarish(-1.39,-.91,.55,.07),1.50,1.76,'#747d79');
    for(const y of [-.26,.26])r.polygon([[-1.46,y-.13,1.58],[-1.46,y+.13,1.58],[-1.42,y+.13,1.68],[-1.42,y-.13,1.68]],'#293333');
  });
  r.tag('hull.roof',()=>{
    r.box(-.65,-.49,1.506,.43,.49,1.532,'#616b68');
    for(let i=0;i<8;i++)r.box(.55+i*.092,-.46,1.506,.594+i*.092,.46,1.524,'#444d48');
  });
}

const tracks=()=>outlineGroup('tracks','Tracks','Select either continuous track to see the running gear in profile.',leftRight('tracks','track'));
export const trackedModels=[
  {id:'little-willie',name:'Little Willie',short:'Little Willie',year:1915,domain:'Land',type:'Tanks',
   detail:'The Lincoln prototype in its preserved form. The two steering wheels fitted for its early trials had already been removed by the end of the First World War.',
   source:{label:museum+' · Little Willie',url:'https://tankmuseum.org/article/little-willie'},
   specs:[['Builder','William Foster & Co.'],['Place','Lincoln, England'],['Collection','Bovington']],
   groups:[outlineGroup('hull','Hull','The tall riveted box and raised driver’s position give the prototype its distinctive silhouette.',[
     component('hull','plates','Riveted body','Flat plates form the high-sided body above the track frames.',[0,0,.28]),
     component('hull','cab','Raised front cab','Two front openings identify the cab at the nose.',[-.28,0,.46]),
     component('hull','roof','Roof panels','The flat upper surfaces behind the cab.',[.12,0,.65])
   ]),tracks()],draw:littleWillie},
  {id:'sherman-e8',name:'M4A2E8 Sherman',short:'Sherman Easy Eight',year:'1940s',domain:'Land',type:'Tanks',
   detail:'The Tank Museum’s Easy Eight appeared in the film Fury. Its six road wheels on each side sit in three pairs beneath the broad tracks.',
   source:{label:museum+' · M4A2E8 Sherman',url:'https://tankmuseum.org/tank-nuts/tank-collection/m4-sherman-fury/'},
   specs:[['Variant','M4A2E8'],['Nickname','Easy Eight'],['Collection','Bovington']],
   groups:[tracks(),outlineGroup('hull','Hull & deck','The welded upper hull slopes inward below the turret.',[
    component('hull','lower','Lower hull','The lower body sits between the tracks.',[0,0,0]),
    component('hull','upper','Upper hull and fenders','Sloping faces meet the flat deck with ledges over the tracks.',[0,0,.36]),
    component('hull','deck','Deck fittings','Hatches and deck grilles sit on the upper hull.',[.14,0,.63])
   ]),outlineGroup('outline','Turret exterior','The cast outline is rounded in contrast to the welded hull.',[
    component('outline','turret','Turret silhouette','The exterior outline above the hull.',[0,0,.32]),
    component('outline','cupola','Roof openings','Raised hatch covers interrupt the top profile.',[0,0,.60])
   ])],draw:sherman}
];
