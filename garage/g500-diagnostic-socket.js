// Mating face coordinates in millimetres, looking into the vehicle socket.
import {part,study} from './mechanism-shapes.js';

export const saeSocketDrawing={label:'SAE J1962 (April 2002) · Type A, figures A1 and A2',url:'https://law.resource.org/pub/us/cfr/ibr/005/sae.j1962.2002.pdf#page=8'};
export const molexSocketDrawing={label:'Molex SD-51115-XX1X · compatible vehicle receptacle, revision B',url:'https://www.mouser.com/datasheet/2/276/2/molex_51115-1611-1185398.pdf'};
const plastic='#394348',wall='#535e62',contact='#a89a76';
const rect=(x,y,w,h)=>[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]];
const cells=[-4.3,4.3].flatMap(v=>Array.from({length:8},(_,k)=>[(k-3.5)*4,v]));
export const diagnosticMouthCenters=cells;
function face(r,map,loop,z,color){r.polygon(loop.map(p=>map(...p,z)),color,false);}
function join(r,map,a,za,b,zb,color){
  for(let i=0;i<a.length;i++){
    const j=(i+1)%a.length;
    r.polygon([map(...a[i],za),map(...a[j],za),map(...b[j],zb),map(...b[i],zb)],color,false);
  }
}
function drawCarrier(r,map){
  // The face lies in a single plane. Tile each wall around its own opening,
  // leaving a continuous Type A polarizing slot and two rows of actual recesses.
  for(const [u,v] of cells){
    const cell=rect(u,v,4,6.2),mouth=rect(u,v,2.20,3.18),throat=rect(u,v,1.30,2.12);
    join(r,map,cell,0,mouth,0,plastic);
    join(r,map,mouth,0,throat,-1.05,wall);
    join(r,map,throat,-1.05,throat,-6.5,'#232b2f');
  }
  const outer=[[-16,-7.4],[16,-7.4],[18.525,6.5],[17.8,7.4],[-17.8,7.4],[-18.525,6.5]];
  join(r,map,outer,0,outer,-11.35,wall);
  for(const s of [-1,1]){
    const p=(x,y)=>[s*x,y];
    face(r,map,[p(16,-7.4),p(18.525,6.5),p(17.8,7.4),p(16,7.4)],0,plastic);
    face(r,map,rect(s*15.1,0,1.8,2.4),0,plastic);
  }
  const slot=rect(0,0,28.4,2.4);
  join(r,map,slot,0,slot,-11.35,plastic);
  // The back is only visible through the empty cavities and the polarizing slot.
  face(r,map,outer,-11.6,'#20282d');
  const rear=outer.map(([u,v])=>[u*.94,v*.96]);
  join(r,map,outer,-11.35,rear,-20,plastic);
  for(const [u,v] of cells){
    const back=rect(u*.94,v*.96,3.76,5.952),entry=rect(u*.94,v*.96,2.75,3.85);
    join(r,map,back,-20,entry,-20,wall);join(r,map,entry,-20,entry,-18,plastic);
  }
}
function drawTerminal(r,map){
  const [u,v]=cells[11];
  const outer=rect(u,v,1.7,2.6),inner=rect(u,v,1.1,1.85);
  join(r,map,outer,-2.2,inner,-2.2,contact);join(r,map,outer,-2.2,outer,-12,contact);
  join(r,map,inner,-2.2,inner,-8.0,contact);
  // A crimp barrel is shown on the same sample lead behind the retained contact.
  const loop=rect(u,v,1.35,1.65);join(r,map,outer,-12,loop,-14.5,contact);
  join(r,map,loop,-14.5,loop,-18.2,contact);
}
function drawWire(r,map,insulated){
  const [u,v]=cells[11],unit=Math.hypot(...map(1,0,0).map((x,i)=>x-map(0,0,0)[i]));
  const p=(t)=>map(u,v,t);
  if(insulated)r.rod(p(-19.4),p(-24.5),.68*unit,'#6f5d4c',10);
  else r.rod(p(-17.6),p(-19.5),.36*unit,'#b58766',8);
}
const groups={
 carrier:['Molded contact carrier','Sixteen rectangular cavities flank the continuous Type A key slot. The mounting and rear housing contours vary with the supplier.',[0,0,-.22],drawCarrier],
 contacts:['Example female terminal','A recessed spring socket accepts a flat blade. One terminal is drawn to expose its crimp and wire. The other cavity positions remain available for inspection.',[0,.3,.06],drawTerminal],
 conductor:['Conductor at the crimp','The copper conductor enters the crimp barrel. Its local construction is illustrative.',[-.35,-.12,-.03],(r,map)=>drawWire(r,map,false)],
 insulation:['Wire insulation','The jacket covers the conductor behind the socket. This short lead illustrates the termination, with no assigned harness route.',[.38,.10,-.03],(r,map)=>drawWire(r,map,true)]
};
export function drawDiagnosticSocket(r,map){
  for(const group of Object.values(groups))group[3](r,map);
}
export function diagnosticStudy(){
  const display=(x,y,z)=>[x*.022,y*.022,(z+10)*.022];
  return study('g500-diagnostic-socket','Diagnostic socket · X11/4','This is the vehicle-side diagnostic socket. The Type A face accepts two rows of eight blades at 4 mm pitch, with 8.6 mm between rows. The back of the Mercedes housing and the installed terminal population are unverified.',saeSocketDrawing,Object.entries(groups).map(([id,[name,description,offset,draw]])=>part(id,name,description,offset,r=>draw(r,display))));
}
