import {TAU,metal,steel,dark,gold,copper,point,basis,cyl,sleeve,gear,part,study,y} from './mechanism-shapes.js';

const center=[0,0,.85],axis=basis(y),orbit=.51;
const source={label:'tec-science · planetary gear ratios',url:'https://www.tec-science.com/mechanical-power-transmission/planetary-gear/transmission-ratios-of-planetary-gears-willis-equation/'};
export function planetaryState(phase){
  const carrier=TAU*phase;
  // An illustrative 16/8/32 set. The fixed ring gives 3:1 sun-to-carrier reduction.
  return {carrier,sun:3*carrier,planet:-3*carrier,ring:0};
}
function annulus(r){
  sleeve(r,center,y,-.14,.14,.81,.704,steel,64);
  const make=(axial,angle)=>[[-.49,.707],[-.19,.651],[.19,.651],[.49,.707]].map(([delta,radius])=>point(center,axis,axial,radius,angle+delta*TAU/32));
  for(let i=0;i<32;i++){
    const a=make(-.14,TAU*i/32),b=make(.14,TAU*i/32);
    r.polygon(a,steel,false);r.polygon(b,metal,false);
    for(let j=0;j<3;j++)r.polygon([a[j],a[j+1],b[j+1],b[j]],j===1?metal:dark,false);
  }
}
export const planetary=study('planetary','Planetary reduction','Hold the outer ring still and turn the central sun gear. Three small gears walk around the ring and carry their supporting frame along at a lower speed. This section illustrates one planetary reduction in an automatic transmission. The gear counts are chosen to make the motion visible.',source,[
  part('sun','Sun gear and input shaft','The central 16-tooth gear drives all three planets.',[0,.78,.30],(r,t)=>{
    const {sun}=planetaryState(t);
    gear(r,center,y,-.12,.12,.361,.361,16,gold,sun);cyl(r,center,y,-.41,.57,.093,metal);
    r.rod(point(center,axis,.133,.10,sun),point(center,axis,.133,.271,sun),.026,gold,8);
  }),
  part('ring','Stationary ring gear','Thirty-two inward-facing teeth provide the reaction for this reduction.',[0,-.91,0],annulus),
  ...Array.from({length:3},(_,i)=>part('pinion-'+i,'Planet gear '+(i+1),'This eight-tooth pinion turns about its own pin and orbits the sun as the carrier moves.',[.68*Math.cos(TAU*i/3),.16,.68*Math.sin(TAU*i/3)],(r,t)=>{
    const {planet,carrier}=planetaryState(t),offset=TAU*i/3,loc=point(center,axis,0,orbit,carrier+offset);
    gear(r,loc,y,-.125,.125,.191,.191,8,copper,planet+offset+Math.PI/8);
    r.rod(point(loc,axis,.138,.045,planet+offset),point(loc,axis,.138,.14,planet+offset),.019,gold,7);
  })),
  part('carrier','Planet carrier and output shaft','The three planet pins share a frame. The output shaft turns with this frame once for every three turns of the sun.',[0,-.54,-.67],(r,t)=>{
    const {carrier}=planetaryState(t);
    cyl(r,center,y,-.59,-.20,.13,steel);sleeve(r,center,y,-.245,-.18,.24,.115,metal);
    for(let i=0;i<3;i++){
      const a=carrier+TAU*i/3,loc=point(center,axis,0,orbit,a);
      r.rod(point(center,axis,-.21,.17,a),point(center,axis,-.21,orbit,a),.070,steel,12);
      cyl(r,loc,y,-.245,.135,.047,metal,14);
    }
  }),
],'The gold sun makes three turns for each turn of the carrier. Follow a copper planet as it spins about its pin while its center travels around the stationary ring.');
