// Timken's X32010X/X32011X and Y32010X/Y32011X metric sales drawings.
// Profiles are [axial station, radius] in millimetres, traced from the PDF paths
// against the dimensioned bore and ring width. The small end of the cone is at 0.
import {turn,study,part,metal,steel,gold,TAU,y} from './mechanism-shapes.js';
const timken='https://cad.timken.com/';
export const bearingFit={label:'Timken application catalog · G500 2002–08, inner and outer front bearings',url:'https://timkenautomotriz.com.mx/wp-content/uploads/2023/06/Cat%C3%A1logo-de-Aplicaciones-Automotrices-2023.pdf'};
export function bearingDrawing(code){
 const cone=code[0]==='X',family=cone?'cones':'cups';
 return {label:'Timken '+code+' · dimensioned axial section (PDF)',url:timken+'cadpublisher/tapered-roller-bearings---single-'+family+'---metric/'+code.toLowerCase()+'?Partid='+(cone?'115314&ViewId=59843':'115308&ViewId=59825')+'&plpver=1124&uomval=Metric&vwNm=2D%20Sales%20Drawing&rfxid=20'};
}
export const bearingCadPage=code=>{
 const family=code[0]==='X'?'cones':'cups';
 return {label:'Timken '+code+' · CAD viewer',url:timken+'item/tapered-roller-bearings---single-'+family+'/tapered-roller-bearings---single-'+family+'---metric/'+code.toLowerCase()};
};
const sections={
 inner:{code:'32010X',width:20,bore:50,diameter:80,cupWidth:15.5,
  cone:[[0,29.48],[2.01,29.48],[2.36,28.11],[16.59,31.36],[16.20,32.89],[20,32.89],[20,26.02],[19.70,25.30],[18.98,25],[.25,25],[.07,25.07],[0,25.25]],
  roller:[[.82,34.15],[2.36,28.11],[14.87,38.10],[16.59,31.36]],
  cup:[[0,33.92],[0,38.98],[.30,39.70],[1.02,40],[14.99,40],[15.35,39.85],[15.5,39.49],[15.5,38.29]],
  cage:[[-1.81,31.65],[-2.5,30.53],[-2.24,29.63],[-1.25,29.89],[-1.45,30.68],[19.25,37.01],[19.5,36.01]]},
 outer:{code:'32011X',width:23,bore:55,diameter:90,cupWidth:17.5,
  cone:[[0,33.26],[2.23,33.26],[2.61,31.72],[18.81,35.31],[18.39,37.02],[23,37.02],[23,29.02],[22.55,27.95],[21.48,27.5],[.38,27.5],[.11,27.61],[0,27.88]],
  roller:[[.94,38.50],[2.61,31.72],[16.95,42.85],[18.81,35.31]],
  cup:[[0,38.25],[0,43.48],[.45,44.55],[1.52,45],[16.74,45],[17.28,44.78],[17.5,44.24],[17.5,43.01]],
  cage:[[-1.73,35.91],[-2.5,34.68],[-2.23,33.70],[-1.13,33.97],[-1.35,34.84],[21.43,41.61],[21.7,40.52]]}
};
function roller(r,c,bearing,angle,scale,side){
 const [a,b,d,e]=bearing.roller;
 const mid=(p,q)=>p.map((v,i)=>(v+q[i])/2),radius=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])/2;
 const xyz=([s,rad])=>[c[0]+rad*Math.cos(angle)*scale,c[1]+s*side*scale,c[2]+rad*Math.sin(angle)*scale];
 const p=xyz(mid(a,b)),q=xyz(mid(d,e)),axis=q.map((v,i)=>v-p[i]),length=Math.hypot(...axis);
 const small=scale*radius(a,b),large=scale*radius(d,e);
 turn(r,p,axis,[[0,0],[0,small],[length,large],[length,0]],metal,{n:8});
}
function makeSection(r,c,side,scale,profile,color,options){
 const closed=[...profile,profile[0]].map(([station,radius])=>[side*scale*station,scale*radius]);
 turn(r,c,y,closed,color,options);
}
function cage(r,c,side,scale,b){
 // The roll-formed lips are on the sales section. Pocket widths between the
 // 23 rollers are representative, as the axial section does not dimension them.
 const [top,bend,lip,innerLip,lower,farTop,farLower]=b.cage;
 const along=(a,b,station)=>[station,a[1]+(b[1]-a[1])*(station-a[0])/(b[0]-a[0])];
 const early=.4,late=b.width-2.5;
 makeSection(r,c,side,scale,[along(top,farTop,early),top,bend,lip,innerLip,lower,along(lower,farLower,early)],gold,{n:46});
 makeSection(r,c,side,scale,[along(top,farTop,late),farTop,farLower,along(lower,farLower,late)],gold,{n:46});
 for(let i=0;i<23;i++)makeSection(r,c,side,scale,[along(top,farTop,early),along(top,farTop,late),along(lower,farLower,late),along(lower,farLower,early)],gold,{n:1,start:(i+.40)*TAU/23,sweep:.20*TAU/23});
}
export function drawG500Bearing(r,kind,c,side,scale=.001,element){
 const b=sections[kind];
 if(!element||element==='cup')makeSection(r,c,side,scale,b.cup,steel,{n:32});
 if(!element||element==='cone')makeSection(r,c,side,scale,b.cone,metal,{n:32});
 if(!element||element==='rollers')for(let i=0;i<23;i++)roller(r,c,b,i*TAU/23,scale,side);
 if(!element||element==='cage')cage(r,c,side,scale,b);
}
export const bearingRows=Object.entries(sections).map(([kind,b])=>({
 id:'wheels.'+kind+'-bearing',name:'Front '+kind+' wheel bearing',
 description:'Timken '+b.code+', '+b.bore+' mm bore × '+b.diameter+' mm outside diameter × '+b.width+' mm width. Open the bearing to separate its two races, cage and 23 tapered rollers.',
 source:bearingDrawing('X'+b.code)
}));
export function drawFrontBearingAtWheel(r,kind,x,wheelCenter,z,side){
 // The plate fixes the inner/outer order. Axial separation is schematic until a hub section is available.
 const station=kind==='inner'?-.047:-.003;
 drawG500Bearing(r,kind,[x,wheelCenter+side*station,z],side*(kind==='inner'?-1:1));
}
const studies=Object.fromEntries(Object.entries(sections).map(([kind,b])=>{
 const label='Front '+kind+' wheel bearing',id='g500-'+kind+'-wheel-bearing';
 // 0.014 scene units per millimetre. Keep every component on the same scale.
 const c=[0,-b.width*.007,0];
 const groups=[['cone','Inner race, X'+b.code,'The cone fits a '+b.bore+' mm journal. The shoulders locate the ends of the rollers.',[0,.58,0]],
  ['cup','Outer race, Y'+b.code,'The '+b.cupWidth+' mm wide cup has a tapered raceway and a '+b.diameter+' mm outside diameter.',[0,-.56,0]],
  ['rollers','23 tapered rollers','Each roller sits on an inclined axis between the cone and cup. Both the count and the roller section come from the Timken cone drawing.',[0,.22,.49]],
  ['cage','Roller cage','The formed lips retain the rollers. The spaces between the cage bars show where each roller sits.',[0,-.22,-.49]]];
 const model=study(id,label,'Timken identifies '+b.code+' at this position on the 2002 G500. The sections follow its dimensioned cone and cup drawings. The drawing leaves the cage pocket widths unspecified.',bearingDrawing('X'+b.code),groups.map(([k,n,d,offset])=>part(k,n,d,offset,r=>drawG500Bearing(r,kind,c,1,.014,k))));
 model.sources=[bearingDrawing('X'+b.code),bearingDrawing('Y'+b.code),bearingCadPage('X'+b.code),bearingCadPage('Y'+b.code),bearingFit];
 for(const p of model.groups[0].parts)p.source=bearingDrawing((p.id.endsWith('.cup')?'Y':'X')+b.code);
 return ['wheels.'+kind+'-bearing',model];
}));
export function getG500BearingDetail(id){return studies[id]??null;}
