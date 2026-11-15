// Profile of Elring 104.630 (Mercedes 112 142 01 80). The two mounting holes,
// port, lower tabs and raised bead follow the supplier photo. The port radius
// is the model's head-port radius; the photo has no dimensional scale.
import {turn,y} from './mechanism-shapes.js';
export const gasketPhoto={label:'Elring 104.630 · profile photographed for the 2002 G500',url:'https://www.rmeuropean.com/Products/1121420180-MFG30-V2908.aspx'};
export const gasketDrawing={label:'Mercedes-Benz USA · exhaust port gasket 112 142 01 80, item 50',url:'https://mbparts.mbusa.com/oem-parts/mercedes-benz-exhaust-manifold-gasket-1121420180'};
const outline=[[0.0,1.5522],[0.2759,1.5224],[0.5747,1.4179],[0.8621,1.2537],[1.2529,0.8806],[1.7816,0.4627],[1.9655,0.2687],[2.0345,0.0597],[1.954,-0.1343],[1.3333,-1.0],[0.977,-1.3582],[0.7816,-1.4925],[0.7586,-1.791],[0.7011,-1.9104],[0.5057,-1.8806],[0.3448,-1.6716],[-0.0805,-1.6716],[-0.1609,-1.8358],[-0.2529,-1.9701],[-0.4713,-1.9701],[-0.5517,-1.8806],[-0.5747,-1.6119],[-1.0345,-1.3284],[-1.4253,-0.9403],[-1.931,-0.3433],[-2.023,-0.194],[-2.046,0.0448],[-2.0345,0.194],[-1.9425,0.3134],[-1.1724,1.0597],[-0.8276,1.3134],[-0.4828,1.4627],[-0.2299,1.5224]];
function circle(u,v,rad,n){return Array.from({length:n},(_,i)=>[u+rad*Math.cos(2*Math.PI*i/n),v+rad*Math.sin(2*Math.PI*i/n)]);}
const rings=[outline,circle(0,0,1,32),circle(-138/87,-1/67,.176,16),circle(137/87,6/67,.16,16)];
const profile=rings.flat();
const triangles=[
[17,19,18],[22,53,23],[51,78,23],[11,59,15],[21,16,56],[16,21,17],[54,53,22],[52,51,23],
[53,52,23],[25,73,26],[41,1,0],[2,39,3],[39,38,3],[9,61,10],[9,92,63],[17,20,19],
[21,20,17],[59,58,15],[12,11,15],[14,12,15],[12,14,13],[55,21,56],[21,55,22],[55,54,22],
[24,74,25],[74,73,25],[72,27,26],[73,72,26],[72,28,27],[4,36,35],[40,1,41],[1,40,2],
[40,39,2],[62,9,63],[62,61,9],[61,60,10],[60,11,10],[11,60,59],[33,64,90],[92,64,63],
[16,57,56],[57,16,15],[58,57,15],[46,29,47],[46,45,29],[30,45,44],[45,30,29],[29,68,47],
[86,5,4],[37,36,4],[38,37,3],[37,4,3],[64,91,90],[91,64,92],[43,42,31],[43,30,44],
[30,43,31],[32,42,41],[32,41,0],[42,32,31],[75,74,24],[76,75,24],[78,77,23],[77,24,23],
[77,76,24],[34,87,35],[87,4,35],[87,86,4],[72,71,28],[71,70,28],[70,69,28],[28,69,29],
[69,68,29],[67,48,47],[68,67,47],[80,50,49],[65,80,49],[48,66,49],[66,65,49],[67,66,48],
[93,9,8],[93,92,9],[96,8,7],[96,95,8],[89,34,33],[89,33,90],[84,83,5],[5,83,6],
[83,82,6],[86,85,5],[85,84,5],[80,79,50],[50,79,51],[79,78,51],[95,94,8],[94,93,8],
[81,96,7],[6,81,7],[82,81,6],[88,87,34],[89,88,34]
];
export function drawPortSeal(r,c,side,installed=false){
 const radius=.022,thickness=.0006;
 const layer=d=>profile.map(([u,v])=>[c[0]+u*radius,c[1]+side*d,c[2]+v*radius]);
 const top=layer(0);
 // In place, the head and casting cover both mating faces, including the
 // bead and mounting bores. Draw only the edges which protrude at the sides.
 if(installed){
  for(const indices of [[4,5,6,7,8,9],[12,13,14,15,16],[17,18,19,20,21,22],[24,25,26,27,28,29]]){
   r.polygon(indices.map(i=>top[i]),'#aaa18c',false);
  }
  return;
 }
 const bottom=layer(-thickness);
 for(const [a,b,e] of triangles){r.polygon([top[a],top[b],top[e]],'#aaa18c',false);r.polygon([bottom[e],bottom[b],bottom[a]],'#79796e',false);}
 let start=0;
 for(const ring of rings){
  for(let n=0;n<ring.length;n++){const i=start+n,j=start+(n+1)%ring.length;r.polygon([top[i],top[j],bottom[j],bottom[i]],'#938d7b',false);}
  start+=ring.length;
 }
 turn(r,c,y,[[side*.0001,radius*1.04],[side*.0005,radius*1.11],[side*.0001,radius*1.17]],'#b3ab94',{n:32});
}
