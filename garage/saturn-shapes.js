import {TAU,section,radial,tone,exhibit,group} from './space-shapes.js';

export const paint='#e6e5da',shadow='#33393b',alloy='#b9c1bd',primer='#c69a60',frame='#899999',fabric='#657d7b';
export const mission={label:'NASA · Apollo 15 press kit, pp. 130–140',url:'https://www.nasa.gov/wp-content/uploads/static/apollo50th/pdf/A15_PressKit.pdf'};
export const capsule={label:'NASA · Block II command module interior diagrams',url:'https://www.nasa.gov/history/diagrams/apollo.html'};
export const seatReference={label:'NASA · Apollo spacecraft news reference, crew equipment',url:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/CSM_News_Reference_H_Missions.pdf'};
export const iuReference={label:'NASA · Photograph of the instrument unit during assembly',url:'https://www.nasa.gov/image-article/manufacturing-saturn-v-instrument-unit/'};
export const simReference={label:'NASA · Apollo 15 and 16 orbital science bay, figure 1',url:'https://ntrs.nasa.gov/api/citations/19730002121/downloads/19730002121.pdf'};

export const polar=(angle,z,radius)=>radial(0,0,z,radius,angle);
export const openRear={from:2.94,to:TAU+.10,steps:36};

export function study(id,name,description,source,parts,viewAngle=[-.36,.26],extra={}) {
  return exhibit({id,name,description,source,viewAngle,...extra},[group(id,name,description,parts)]);
}
export function lip(r,z,radius,color,width=.035,arc={}) {
  section(r,0,0,[[z-width*.30,radius-width],[z-width*.30,radius],[z+width*.30,radius],[z+width*.30,radius-width]],color,{steps:48,...arc});
}
export function shell(r,stations,color,options=openRear,cutColor=primer){
  section(r,0,0,stations,color,options);
  const lining=stations.map(([z,rr])=>[z,Math.max(.001,rr-.012)]);
  section(r,0,0,lining,tone(color,.90),options);
  for(const a of [options.from,options.to])for(let i=1;i<stations.length;i++){
    const [z0,r0]=stations[i-1],[z1,r1]=stations[i];
    r.polygon([polar(a,z0,r0),polar(a,z1,r1),polar(a,z1,lining[i][1]),polar(a,z0,lining[i-1][1])],cutColor,false);
  }
}
export function stiffeners(r,r0,r1,z0,z1,count=36,arc={from:0,to:TAU},material=frame){
  for(let i=0;i<count;i++){
    const a=arc.from+(arc.to-arc.from)*(i+.5)/count;
    const w=Math.min(.040,(arc.to-arc.from)/count*.21),rise=Math.min(r0,r1)*.019;
    r.polygon([polar(a-w,z0,r0),polar(a,z0,r0+rise),polar(a,z1,r1+rise),polar(a-w,z1,r1)],tone(material,1.04),false);
    r.polygon([polar(a,z0,r0+rise),polar(a+w,z0,r0),polar(a+w,z1,r1),polar(a,z1,r1+rise)],tone(material,.71),false);
  }
}
// Display panel on a tangent plane. u runs horizontally, v is its height.
export function station(a,radius,z){
  return (u,v,out=0)=>[(radius+out)*Math.cos(a)-u*Math.sin(a),(radius+out)*Math.sin(a)+u*Math.cos(a),z+v];
}
export function plate(r,at,u,v,width,height,color,depth=0){
  r.polygon([at(u-width/2,v-height/2,depth),at(u+width/2,v-height/2,depth),at(u+width/2,v+height/2,depth),at(u-width/2,v+height/2,depth)],color,false);
}
export function ellipse(r,at,u,v,wide,high,color,depth=0,steps=22){
  r.polygon(Array.from({length:steps},(_,i)=>at(u+wide*Math.cos(i*TAU/steps),v+high*Math.sin(i*TAU/steps),depth)),color,false);
}
export function panelBox(r,at,u,v,w,h,depth,color){
  const face=d=>[at(u-w/2,v-h/2,d),at(u+w/2,v-h/2,d),at(u+w/2,v+h/2,d),at(u-w/2,v+h/2,d)];
  const back=face(0),front=face(depth);
  r.polygon(front,color,false);r.polygon(back,tone(color,.75),false);
  for(let i=0;i<4;i++)r.polygon([back[i],back[(i+1)%4],front[(i+1)%4],front[i]],tone(color,[.64,.84,1.06,.73][i]),false);
}
