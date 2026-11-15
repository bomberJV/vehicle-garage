import {h4SupplierDrawing,drawH3,h3Components} from './g500-halogen-bulbs.js';
import {glazingFace} from './surface-materials.js';
// 2002 U.S. G500. Local lamp coordinates are width, height, and outward depth.
// The manual supplies the individual parts. Their dimensions are illustrative.
export const G500_FRONT=-2.119;
export const lampRefs={
  manual:{label:'Mercedes-Benz · 2002 G-Class operator’s manual, pp. 328–341',url:'https://cdn.dealereprocess.org/cdn/servicemanuals/mercedesbenz/2002-gclass.pdf#page=331'},
  head:{label:'2002 G500 · headlamp components diagram',url:'https://parts.mercedesbenzofmiami.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/electrical--headlamp-components'},
  tail:{label:'Mercedes-Benz · 2002 G500 tail lamp diagram',url:'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/electrical--tail-lamps'},
  fog:{label:'2002 G500 · front fog lamp parts diagram',url:'https://parts.mercedesbenzofmiami.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/electrical--fog-lamps'},
  marker:{label:'2002 G500 · side marker lamp diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/headlights-lighting/side-marker-lamps'},
  repeater:{label:'2002 G500 · side repeater and seal diagram',url:'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/headlights-lighting/side-repeater-lamps'},
  washer:{label:'Mercedes-Benz · 2002 headlamp cleaning nozzles, trim and valve',url:'https://www.mbpartscenter.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/emergency-equipment-windshield-washer-system--headlamp-cleaning-system'},
  gal2002:{label:'Daimler-Benz · US G500 launch photographs, April 2002',url:'https://www.motortrend.com/how-to/129-0204-usa-mercedes-benz-g500-wagon'},
  gallery:{label:'2002 G500 · factory exterior photographs',url:'https://www.edmunds.com/mercedes-benz/g-class/2002/pictures/'},
};
export const optics={
  amber:['#f09b25','#c77b22','#f7b349','#945b21'],red:['#ad342e','#832925','#ce4840','#79231e'],
  clear:['#b8c5c4','#849a9d','#d9e1da','#75878a'],smoke:['#7d8d8c','#677977','#97a7a2','#586a6d'],
};
const groupPart=(key,name,description,source)=>({id:'lighting.'+key,name,description,source});
export const g500LampParts=['left','right'].flatMap(side=>{
  const label=side==='left'?'Left':'Right';
  return [
    groupPart('h4-'+side,label+' high and low beam bulb','The H4 has a 17 mm quartz envelope and three blade contacts. Open it to see the high-beam coil and the shield beneath the low-beam coil.',h4SupplierDrawing),
    groupPart('parking-'+side,label+' parking and standing lamp','A small T4W bulb shares the round headlamp housing with the larger H4 bulb. Its socket is offset from the main reflector opening.',lampRefs.head),
    groupPart('fog-'+side,label+' front fog lamp','Low in the front bumper, the fluted lens sits inside its own dark trim panel. Open to inspect the H3 bulb and its spring clip.',lampRefs.fog),
    groupPart('front-marker-'+side,label+' front side marker','The amber marker faces across the road just ahead of the front wheel opening. A T4W bulb lights the lens.',lampRefs.marker),
    groupPart('rear-marker-'+side,label+' rear side marker','The red marker sits between the rear wheel arch and the tail lamp. Its socket and dust cover fit behind the lens housing.',lampRefs.marker),
    groupPart('tail-'+side,label+' rear combination lamp','The outer clear chamber covers the amber turn-signal bulb. The inner red chambers carry separate brake and tail bulbs.',lampRefs.tail),
    groupPart('repeater-'+side,label+' side turn repeater','A small clear lens ahead of the front door covers an amber WY5W wedge bulb. The repeater flashes with the turn signal.',lampRefs.repeater),
  ];
}).concat([
  groupPart('washer','Headlamp washer nozzles','Each washer jet sits below its headlamp. A common pump supplies the two nozzles through a valve and separate hose branches.',lampRefs.washer),
  groupPart('rear-fog','Left rear fog lamp','The red lamp in the left side of the rear bumper carries a P21W bulb.',lampRefs.manual),
  groupPart('reverse','Right backup lamp','The clear lamp in the right side of the rear bumper carries a P21W bulb.',lampRefs.manual),
]);

export function lampOutline(width,height,radius) {
  const w=width/2,h=height/2,c=Math.min(radius,w*.93,h*.93),path=[];
  for(const [x,y,start] of [[w-c,h-c,0],[-w+c,h-c,90],[-w+c,-h+c,180],[w-c,-h+c,270]]){
    for(let step=0;step<=3;step++){
      const a=(start+step*30)*Math.PI/180;
      path.push([x+c*Math.cos(a),y+c*Math.sin(a)]);
    }
  }
  return path;
}
export function lampWall(r,map,a,da,b,db,color){
  for(let i=0;i<a.length;i++){
    const j=(i+1)%a.length;
    r.polygon([map(...a[i],da),map(...a[j],da),map(...b[j],db),map(...b[i],db)],color,false);
  }
}
function carrier(r,map,w,h,d,curve=.14){
  const back=lampOutline(w,h,h*curve),inner=lampOutline(w*.88,h*.79,h*curve*.80);
  lampWall(r,map,back,0,back,d,'#2b3031');lampWall(r,map,back,d,inner,d,'#343b3b');
}
// Each flute has its own pair of pitched faces. The perimeter follows a molded
// shoulder, so the lenses still have a readable edge when viewed from the side.
export function ribbedLens(r,map,w,h,depth,tint,ribCount=12,radius=.12,opacity=1){
  const [base,edge,light,low]=optics[tint],outer=lampOutline(w,h,h*radius),inner=lampOutline(w*.90,h*.84,h*radius*.82);
  lampWall(r,map,outer,0,outer,depth*.59,edge);lampWall(r,map,outer,depth*.59,inner,depth,base);
  const face=(points,color,alpha)=>opacity===1?r.polygon(points,color,false):glazingFace(r,points,color,alpha);
  face(inner.map(([x,y])=>map(x,y,depth)),base,opacity);
  for(let i=1;i<=ribCount;i++){
    const x=(i/(ribCount+1)-.5)*w*.87,dx=w/(ribCount+1)*.14,y=h*(Math.abs(x)>w*.37?.30:.39);
    const a=map(x-dx,-y,depth),b=map(x-dx,y,depth),c=map(x,-y,depth*1.07),d=map(x,y,depth*1.07);
    face([a,b,d,c],light,.40);face([c,d,map(x+dx,y,depth),map(x+dx,-y,depth)],low,.34);
  }
}
const inset=(map,d)=>(u,v,z)=>map(u,v,z+d);
function fixedLamp(r,id,map,w,h,depth,tint,rounding=.14){
  r.tag('lighting.'+id,()=>{
    carrier(r,map,w,h,depth*.32,rounding);
    ribbedLens(r,inset(map,depth*.33),w*.91,h*.83,depth*.67,tint,9,rounding);
    for(const s of [-1,1])r.rod(map(s*w*.40,0,depth*.94),map(s*w*.40,0,depth*1.025),h*.044,'#706f63',6);
  });
}
function compactRepeater(r,map){
  const outline=lampOutline(.092,.037,.015).map(([u,v])=>[u,v*(.83+u*2)+u*.045]);
  const roof=outline.map(([u,v])=>[u*.89,v*.82]);
  lampWall(r,map,outline,0,outline,.004,'#4b5453');
  const bulb=lampOutline(.024,.012,.005).map(([u,v])=>map(u+.006,v,.006));
  r.polygon(bulb,'#cb9949',false);
  for(let i=0;i<outline.length;i++){
    const j=(i+1)%outline.length;
    glazingFace(r,[map(...outline[i],.004),map(...outline[j],.004),map(...roof[j],.014),map(...roof[i],.014)],'#bac9c1',.48);
  }
  glazingFace(r,roof.map(([u,v])=>map(u,v,.014)),'#cad7cb',.39);
}
export function sideLighting(r,side){
  const hand=side<0?'left':'right';
  const sideFace=(x,z)=>(u,v,d)=>[x+u,side*(.888+d),z+v];
  fixedLamp(r,'front-marker-'+hand,sideFace(G500_FRONT+.160,.925),.159,.074,.012,'amber',.33);
  fixedLamp(r,'rear-marker-'+hand,sideFace(1.972,.757),.142,.064,.010,'red',.33);
  r.tag('lighting.repeater-'+hand,()=>compactRepeater(r,sideFace(-.846,1.075)));
}
// Leave apertures through the outer bumper skin. The recessed returns become
// visible when the two optical units move away from their mounting positions.
export function bumperSkin(r,{face,back,width,low,high,span,center,lightZ,lightHeight,paint}){
  // The early W463 bumper rolls inward at the top and lower lip, and wraps back
  // toward each wheel. Keep the two lamp openings on the flat central face.
  const sign=Math.sign(back-face),height=high-low;
  const hinge=.75;
  const ys=[-width,-.894,-.843,-hinge,-center-span/2,-center+span/2,
    center-span/2,center+span/2,hinge,.843,.894,width].sort((a,b)=>a-b);
  const za=lightZ-lightHeight/2,zb=lightZ+lightHeight/2;
  const zs=[low,low+height*.11,za,zb,high-height*.13,high].sort((a,b)=>a-b);
  const wrap=y=>Math.max(0,(Math.abs(y)-hinge)/(width-hinge));
  const at=(surface,y,z)=>{
    if(surface===back)return [back,y,z];
    const t=wrap(y),u=(z-low)/height;
    const lip=u<.11?.023*(1-u/.11):u>.87?.012*(u-.87)/.13:0;
    const inward=.060*t*t+lip;
    return [face+sign*inward,y*(1-.005*t*(1-u)),z+.012*t*t*(1-u)];
  };
  const tone=(col,f)=>'#'+[1,3,5].map(i=>Math.min(255,Math.round(parseInt(col.slice(i,i+2),16)*f)).toString(16).padStart(2,'0')).join('');
  const plate=(surface,a,b,c,d,col)=>r.polygon([at(surface,a,c),at(surface,b,c),at(surface,b,d),at(surface,a,d)],col,false);
  const sideReturn=(a,b,col)=>r.polygon([at(face,...a),at(back,...a),at(back,...b),at(face,...b)],col,false);
  for(let i=1;i<ys.length;i++)for(let j=1;j<zs.length;j++){
    const a=ys[i-1],b=ys[i],c=zs[j-1],d=zs[j];
    if(c===za&&d===zb&&Math.abs(Math.abs((a+b)/2)-center)<span/2)continue;
    const shade=j===1?.78:j===zs.length-1?1.12:1-.115*wrap((a+b)/2);
    plate(face,a,b,c,d,tone(paint,shade));plate(back,a,b,c,d,tone(paint,.70));
  }
  for(const y of [-width,width])for(let j=1;j<zs.length;j++)sideReturn([y,zs[j-1]],[y,zs[j]],tone(paint,.79));
  for(const z of [low,high])for(let i=1;i<ys.length;i++)sideReturn([ys[i-1],z],[ys[i],z],tone(paint,z===high?1.15:.61));
  for(const y of [-center,center]){
    const a=y-span/2,b=y+span/2;
    sideReturn([a,za],[a,zb],tone(paint,.56));sideReturn([b,za],[b,zb],tone(paint,.56));
    sideReturn([a,za],[b,za],tone(paint,.66));sideReturn([a,zb],[b,zb],tone(paint,.66));
  }
}
function recessedShell(r,map,w,h,depth){
  const rim=lampOutline(w,h,h*.14),rear=lampOutline(w*.66,h*.71,h*.19);
  lampWall(r,map,rim,-.001,rear,-depth,'#3c4444');
  r.polygon(rear.map(([u,v])=>map(u,v,-depth)),'#454b4b',false);
}

// The clear turn section is outboard; the two red areas lie inboard.
// Horizontal prism bands run across both lens colors, with an amber source
// behind the clear window. Dimensions scale from the front-on rear photograph.
export function tailCover(r,map,w,h){
  const renderZone=(center,span,col)=>{
    const uv=(a,b,d)=>map(center+a,b,d);
    const poly=lampOutline(span,h,h*.13),edge=lampOutline(span*.98,h*.94,h*.12);
    lampWall(r,uv,poly,0,edge,h*.095,col==='red'?'#6e2529':'#82928f');
    const shades=col==='red'?['#86262c','#b73535','#9e282d','#742528']:['#98aaa6','#c1c9bf','#9db1a8','#8c9e95'];
    for(let j=0;j<4;j++){
      const a=h*(-.455+.228*j),b=h*(-.455+.228*(j+1)),width=span*(j===0||j===3?.944:.978);
      const surf=[uv(-width/2,a,h*.10),uv(width/2,a,h*.10),uv(width/2,b,h*.104),uv(-width/2,b,h*.104)];
      if(col==='red')r.polygon(surf,shades[j],false);else glazingFace(r,surf,shades[j],.50);
      if(j<3)r.polygon([uv(-width/2,b-h*.017,h*.106),uv(width/2,b-h*.017,h*.106),uv(width/2,b,h*.117),uv(-width/2,b,h*.117)],col==='red'?'#662026':'#697d76',false);
    }
    for(let j=-1;j<=1;j++)r.rod(uv(j*span*.28,-h*.41,h*.106),uv(j*span*.28,h*.41,h*.106),h*.005,col==='red'?'#89252c':'#99a7a0',5);
  };
  // Outer is positive across the local map for either side of the vehicle.
  const amber=lampOutline(w*.194,h*.33,h*.12);
  r.polygon(amber.map(([u,v])=>map(w*.357+u,v,h*.043)),'#bd8842',false);
  renderZone(-w*.145,w*.699,'red');renderZone(w*.352,w*.286,'clear');
}
export function rearCornerLamp(r,side){
  const hand=side<0?'left':'right',map=(u,v,d)=>[2.092+d,side*(.751+u),.799+v];
  r.tag('body.rear-lights',()=>carrier(r,map,.288,.139,.028));
  r.tag('lighting.tail-'+hand,()=>tailCover(r,inset(map,.029),.274,.118));
}
export function rearBumperLight(r,side){
  const map=(u,v,d)=>[2.226+d,side*.641+u,.552+v];
  fixedLamp(r,side<0?'rear-fog':'reverse',map,.150,.080,.014,side<0?'red':'clear');
  r.tag(side<0?'lighting.rear-fog':'lighting.reverse',()=>recessedShell(r,map,.145,.075,.055));
}
// Rectangular footprint with a rolled optical cover. The amber source remains
// below the cap, visible through the ribs from the front, top and side.
export function raisedWingLens(r,map,w,h,depth){
  const profile=[[.965,.940,.07],[.955,.922,.22],[.900,.880,.53],[.795,.723,.85],[.695,.585,1]];
  const loops=profile.map(([a,b])=>lampOutline(w*a,h*b,h*.18));
  for(let k=1;k<loops.length;k++){
    const a=loops[k-1],b=loops[k];
    for(let i=0;i<a.length;i++){
      const j=(i+1)%a.length;
      glazingFace(r,[map(...a[i],depth*profile[k-1][2]),map(...a[j],depth*profile[k-1][2]),map(...b[j],depth*profile[k][2]),map(...b[i],depth*profile[k][2])],
        ['#93a29e','#b8c3bb','#d3d9ca','#b7c0b6'][Math.floor(i/4)],.39);
    }
  }
  const top=loops.at(-1);
  glazingFace(r,top.map(([u,v])=>map(u,v,depth)),'#cdd9d3',.38);
  // Molded prism rows follow the roof and slope down its shoulders.
  for(let j=-5;j<=5;j++){
    const u=j*w*.054;
    const path=[[-.410,.57],[-.342,.85],[-.252,1],[.252,1],[.342,.85],[.410,.57]];
    for(let i=1;i<path.length;i++){
      const [a,za]=path[i-1],[b,zb]=path[i];
      glazingFace(r,[map(u-w*.005,a*h,depth*za),map(u-w*.005,b*h,depth*zb),map(u,b*h,depth*(zb+.012)),map(u,a*h,depth*(za+.012))],'#dae2dc',.44);
    }
  }
}
export function frontWingAndFog(r,side){
  const hand=side<0?'left':'right';
  const face=(u,v,d)=>[G500_FRONT-.117-d,side*.598+u,.553+v];
  r.tag('body.fog-lamps',()=>carrier(r,face,.255,.115,.013));
  r.tag('lighting.fog-'+hand,()=>{
    recessedShell(r,face,.222,.084,.082);
    const rim=lampOutline(.210,.071,.011),neck=lampOutline(.030,.024,.009);
    for(let i=0;i<rim.length;i++){
      const j=(i+1)%rim.length,shade=['#aaaead','#bac1c1','#8a9392','#6c7b7e'][Math.floor(i/4)];
      r.polygon([face(...rim[i],.008),face(...rim[j],.008),face(...neck[j],-.050),face(...neck[i],-.050)],shade,false);
    }
    const bulb=(u,v,d)=>face(u/1000,v/1000,-.050+d/1000);
    for(const key of h3Components)drawH3(r,bulb,key,true);
    ribbedLens(r,inset(face,.010),.219,.081,.014,r.lights?'clear':'smoke',12,.12,.36);
  });
  const top=(u,v,d)=>[G500_FRONT+.250+u,side*.786+v,1.240+d];
  r.tag('lighting.indicator',()=>{
    carrier(r,top,.215,.134,.010);
    const lower=lampOutline(.195,.112,.019);
    r.polygon(lower.map(([u,v])=>top(u,v,.012)),'#9da59e',false);
    const neck=lampOutline(.045,.034,.013),amber=lampOutline(.060,.048,.019);
    lampWall(r,top,neck,.013,amber,.025,'#c08a46');
    lampWall(r,top,amber,.025,neck,.038,'#dfad5b');
    r.polygon(neck.map(([u,v])=>top(u,v,.038)),'#cc964d',false);
    raisedWingLens(r,inset(top,.011),.205,.121,.051);
    for(const sign of [-1,1]){
      const m=inset(top,.003),u=sign*.094;
      r.rod(m(u,0,.011),m(u,0,.023),.0043,'#767b75',8);
      r.polygon(lampOutline(.008,.006,.002).map(([p,q])=>m(u+p,q,.0234)),'#888982',false);
    }
  });
}
