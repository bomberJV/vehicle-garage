// Roof-side and plan sections follow Porsche's 993 and 992 Cabriolet outlines.
// Each backlight occupies an actual opening in the fabric. Picking and depth
// use the same transparent panes that close the rear and side window openings.
import {roof992,backlight992,draw992HoodSide} from './porsche992-exterior-trim.js';
import {hoodSide993,backlightU993} from './porsche993-trim.js';
import {glazingFace} from './surface-materials.js';
import {porscheDeckPoint} from './porsche-coachwork.js';
import {tint,strip} from './road-primitives.js';

const rows993=[
  // x, centre height, half-width, height at edge, fore-aft bow
  [.035,1.309,.586,1.231,.023],[.28,1.321,.600,1.238,.012],[.47,1.300,.611,1.231,.010],
  [.78,1.257,.626,1.181,-.008],[.94,1.212,.638,1.082,-.006],[1.075,1.145,.648,1.008,-.024],
  [1.206,1.080,.655,.956,-.052],[1.273,1.047,.643,.925,-.076]
];
export function roofSections(car){
  const [,headerX,h,,w]=car.screen;
  return [[headerX,h+.007,w,h-.029,car.screenHeaderSweep],...(car.modern?roof992:rows993)];
}
export function roofPoint(row,u){
  const [x,h,w,edge,sweep]=row,t=Math.abs(u);
  return [x+sweep*t*t,u*w,h-(h-edge)*t**2.5];
}
const at=roofPoint;
function markRole(r,start,role){
  for(let i=start;i<r.faces.length;i++)r.faces[i].roofServicePart=role;
}
const us=[-1,-.82,-.68,-.5,0,.5,.68,.82,1];
export function raisedTop(r,car){
  const rows=roofSections(car),fabric=car.modern?'#4d5050':'#514f50';
  const backlight={first:5,last:7};
  const panePoint=(j,u)=>at(rows[j],car.modern?backlight992(j,u):backlightU993(j,u));
  for(let j=1;j<rows.length;j++)for(let i=1;i<us.length;i++){
    const a=us[i-1],b=us[i],mid=(a+b)/2;
    const panel=[panePoint(j-1,a),panePoint(j-1,b),panePoint(j,b),panePoint(j,a)];
    if(j>=backlight.first&&j<=backlight.last&&Math.abs(mid)<.68){
      glazingFace(r,panel,'#8098a1',car.modern?.34:.29);
      r.faces.at(-1).roofServicePart='roof.rear-window';
    }else{
      r.polygon(panel,tint(fabric,.79+.22*(1-mid*mid)+.055*Math.cos(j*.74)),false);
    }
  }
  let first=r.faces.length;
  // The dark surround follows the backlight perimeter, on the fabric side.
  for(const s of [-1,1]){
    const edge=[4,5,6,7].map(j=>panePoint(j,s*.68));
    strip(r,edge,[4,5,6,7].map(j=>panePoint(j,s*.715)),'#323638');
  }
  for(const j of [4,7]){
    const points=us.filter(u=>Math.abs(u)<=.68);
    const edge=points.map(u=>panePoint(j,u));
    const back=points.map((u,i)=>{const p=panePoint(j===4?3:8,u);return p.map((v,k)=>edge[i][k]+.055*(v-edge[i][k]));});
    strip(r,edge,back,'#313539');
  }
  markRole(r,first,'roof.rear-window');first=r.faces.length;
  // Roof latch rail meets the existing windshield header at the first station.
  const header=us.map(u=>at(rows[0],u));strip(r,header,header.map(([x,y,z])=>[x+.012,y,z-.010]),'#4a4a48');
  markRole(r,first,'roof.header');
  for(const s of [-1,1]){
    if(!car.modern){hoodSide993(r,car,s,rows,at,fabric);continue;}
    draw992HoodSide(r,car,s,rows,at,glazingFace);
  }
  // The aft portion of the raised top encloses the front strip of the deck:
  // the cabin sees its dark trimmed parcel shelf, including through the glass.
  // Fit the trim to the actual compound deck crown and stop at the rear bow.
  const rearBow=rows.at(-1),ox=car.cockpit[1]-.006;
  const point=(t,u)=>{
    const bow=at(rearBow,u),x=ox+t*(bow[0]-ox);
    const y=u*rearBow[2],p=porscheDeckPoint(car,x,y);
    return [p[0],p[1],p[2]+.004];
  };
  const upholstery=[],indices=[];
  for(let j=0;j<=8;j++)for(let i=0;i<us.length;i++){
    upholstery.push(point(j/8,us[i]));
    if(j&&i){
      const last=upholstery.length-1,left=last-1,up=last-us.length;
      indices.push(up-1,up,last,up-1,last,left);
    }
  }
  r.polygon(upholstery,'#49494a',false);
  r.faces.at(-1).triangles=indices;
  r.faces.at(-1).roofServicePart='cabin.carpet';
  const hem=us.map(u=>at(rearBow,u));
  strip(r,hem,hem.map((p,i)=>point(1,us[i])),'#434346');

}
