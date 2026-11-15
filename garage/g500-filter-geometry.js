// Supplier drawing dimensions in metres. Positions in the vehicle remain approximate.
import {basis,point} from './mechanism-shapes.js';

const catalog='https://www.mann-filter.com/mea-en/catalogue/search-results/product.html/';
export const g500FilterSources={
 air:{label:'MANN-FILTER C 3698/3-2 · dimension drawing and M113.962 fitment',url:catalog+'c3698/3-2_mann-filter.html'},
 oil:{label:'MANN-FILTER HU 718/5 x · dimension drawing and M113.962 fitment',url:'https://www.mann-filter.com/uk-en/catalogue/search-results/product.html/hu718/5x_mann-filter.html'},
 fuel:{label:'MANN-FILTER WK 720 · dimension drawing, OE numbers and M113.962 fitment',url:catalog+'wk720_mann-filter.html'}
};

// The drawing dimensions the sealing rim. The filter media is inset inside it.
// Corner radii, frame thickness, fold depth and fold count are illustrative.
export function drawG500PanelFilter(t,[cx,cy,cz]){
 const length=.355,width=.135,height=.050;
 function outline(inset,z){
  const a=length/2-inset,b=width/2-inset,r=.018-inset;
  const vertices=[];
  for(let corner=0;corner<4;corner++){
   const sx=corner===0||corner===3?1:-1,sy=corner<2?1:-1;
   for(let k=0;k<=3;k++){
    const angle=(corner+k/3)*Math.PI/2;
    vertices.push([cx+sx*(a-r)+r*Math.cos(angle),cy+sy*(b-r)+r*Math.sin(angle),cz+z]);
   }
  }
  return vertices;
 }
 const outer=outline(0,0),rim=outline(0,.013),inner=outline(.009,.013),bottom=outline(.009,0);
 const edge=(a,b,color)=>{for(let i=0;i<a.length;i++){const j=(i+1)%a.length;t.poly([a[i],a[j],b[j],b[i]],color);}};
 edge(outer,rim,'#b57a46');edge(rim,inner,'#d49456');edge(inner,bottom,'#9b6740');edge(bottom,outer,'#a47750');
 const halfL=length/2-.011,halfW=width/2-.011,n=32;
 const fold=(i,h,s)=>{
  const x=-halfL+i*halfL/n,w=halfW-Math.max(0,Math.abs(x)-(halfL-.008))*.65;
  return [cx+x,cy+s*w,cz+h];
 };
 for(let i=0;i<2*n;i++){
  const a=i%2?.004:height,b=i%2?height:.004;
  t.poly([fold(i,a,-1),fold(i,a,1),fold(i+1,b,1),fold(i+1,b,-1)],i%2?'#b9a265':'#d4bd7e');
 }
}

export const g500FilterSeat=side=>[.048,side*.257,.550];

// The open tray follows the replacement seal. Its molding and drain details
// stay approximate pending a measurement of the original cleaner housing.
export function drawG500FilterTray(t,center){
 const rows=[[-.193,.055],[-.182,.069],[-.165,.073],[.164,.073],[.183,.069],[.193,.055]];
 const at=(row,side,h)=>[center[0]+row[0],center[1]+side*(row[1]-(h<0?.008:0)),center[2]+h];
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i];
  t.poly([at(a,-1,-.030),at(b,-1,-.030),at(b,1,-.030),at(a,1,-.030)],'#41494a');
  for(const s of [-1,1])t.poly([at(a,s,-.030),at(b,s,-.030),at(b,s,.010),at(a,s,.010)],'#363d3f');
 }
 for(const a of [rows[0],rows.at(-1)])t.poly([at(a,-1,-.030),at(a,1,-.030),at(a,1,.010),at(a,-1,.010)],'#363d3f');
}

export const oilAxis=[-.008,-.016,.153];
export const oilCenter=[-.415,-.266,.378];
// Both bores are 31 mm. Closed annular end faces leave the stem opening clear.
export function drawG500OilElement(t,center,axis){
 const b=basis(axis),p=(a,r,z)=>point(center,b,z,r,a);
 for(const h of [-.0575,.0535]){
  const a=p(0,0,h),c=p(0,0,h+.004);
  t.tube(a,c,.032,.0155,'#66543c',16);
 }
 const n=30;
 for(let i=0;i<n*2;i++){
  const a=i*Math.PI/n,c=(i+1)*Math.PI/n,ra=i%2?.019:.0316,rc=i%2?.0316:.019;
  t.poly([p(a,ra,-.0535),p(c,rc,-.0535),p(c,rc,.0535),p(a,ra,.0535)],i%2?'#aa8f52':'#cbb376');
 }
}

// X runs from the engine-feed end to the regulator. F and G are 8 mm,
// E is 10 mm. The small regulator vent and axial stations follow the silhouette.
export const fuelFilterCenter=[1.826,-.132,.378];
export const fuelPorts={feed:[-.080,0,0],inlet:[.08,-.024,0],tankReturn:[.076,.022,.005],vent:[.067,.005,0]};
export function drawG500FuelFilter(t,center){
 const at=(x,y=0,z=0)=>[center[0]+x,center[1]+y,center[2]+z];
 const b=basis([1,0,0]);
 const profile=[[-.054,.009],[-.049,.026],[-.044,.0365],[.033,.0365],[.036,.0375],[.039,.0375],[.040,.0325],[.044,.027],[.044,0]];
 for(let k=1;k<profile.length;k++)for(let i=0;i<20;i++){
  const q=(j,m)=>point(center,b,profile[j][0],profile[j][1],m*Math.PI/10);
  const pts=[q(k-1,i),q(k-1,i+1),q(k,i+1),q(k,i)];
  t.poly(profile[k][1]===0?pts.slice(0,3):pts,i<10?'#a1aaab':'#8e9999');
 }
 for(const [key,start,radius] of [['feed',-.054,.004],['inlet',.039,.004],['tankReturn',.040,.005],['vent',.056,.0025]]){
  const [end,y,z]=fuelPorts[key];
  t.tube(at(start,y,z),at(end,y,z),radius,radius*.68,'#b4bebe',12);
 }
 t.cyl(at(.042,.005),at(.057,.005),.012,'#8b9694',16);
}
