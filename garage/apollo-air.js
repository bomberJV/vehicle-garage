import {TAU,part,loops} from './space-shapes.js';
import {alloy,shadow,frame,primer,study,panelBox,ellipse} from './saturn-shapes.js';

const cmSource={label:'NASA · Command module environmental control, figures 8–12',url:'https://ntrs.nasa.gov/api/citations/20160000818/downloads/20160000818.pdf'};
const lmSource={label:'NASA / Grumman · Lunar module environmental control',url:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/LM06_Environmental_Control_ppEC1-25.pdf'};
const gas='#6595a0',movingGas='#e8d897',liquid='#be896c',insulation='#c7c0a6';
const front=(u,v,y=0)=>[u,y,v];
const cabinet=(r,x,y,z,w,h,d,color)=>panelBox(r,(u,v,o)=>[x+u,y+o,z+v],0,0,w,h,d,color);
const ring=(r,x,y,z,outer,inner,color)=>r.ringY(x,y,z,outer,inner,color,32);
const circle=(r,x,y,z,rad,color)=>ellipse(r,(u,v,o)=>[x+u,y+o,z+v],0,0,rad,rad,color,0,32);

function axialShell(r,x,z,y0,y1,rad,color) {
  r.tubeY(x,y0,y1,z,rad,color,32);ring(r,x,y1,z,rad,rad*.88,alloy);
}
function fan(r,x,z,phase,lm){
  const rad=lm?.143:.169;
  cabinet(r,x,-.13,z,rad*2.64,rad*2.57,.12,'#808e8c');
  axialShell(r,x,z,-.005,.119,rad,alloy);
  circle(r,x,.024,z,rad*.89,shadow);
  for(let i=0;i<10;i++){
    const a=TAU*(i/10+phase),p=(f,t,y)=>[x+rad*f*Math.cos(a+t),y,z+rad*f*Math.sin(a+t)];
    r.polygon([p(.22,0,.074),p(.78,.27,.076),p(.84,.49,.063),p(.23,.28,.071)],i%2?'#a8b7ad':'#bdc5ad',false);
  }
  circle(r,x,.079,z,rad*.245,primer);
}
function absorber(r,x,z,lm){
  for(let i=0;i<2;i++){
    const cx=x+(i-.5)*(lm?.18:.19),rr=i&&lm?.065:.085,cy=-.024;
    if(lm){axialShell(r,cx,z,cy,cy+.165,rr,insulation);circle(r,cx,cy+.137,z,rr*.88,'#929d8f');}
    else{cabinet(r,cx,cy,z,.17,.236,.130,insulation);cabinet(r,cx,.108,z,.154,.213,.022,alloy);}
    const h=lm?rr:.107;
    for(let row=-2;row<=2;row++){
      const width=(lm?Math.sqrt(1-(row*.26)**2)*rr:.070)*.84;
      r.rod([cx-width,.142,z+h*row*.24],[cx+width,.142,z+h*row*.24],.0027,'#697872',6);
    }
    loops(r,[[cx-.033,.145,z],[cx-.033,.173,z+.016],[cx+.035,.173,z+.016],[cx+.035,.145,z]],.005,'#454d4c',false);
  }
}
function matrix(r,x,z,large=false){
  const w=large?.46:.30,h=large?.44:.29;
  cabinet(r,x,-.10,z,w+.03,h+.03,.08,'#919d97');
  for(let j=0;j<8;j++){
    const zz=z-h/2+j*h/7;
    cabinet(r,x,-.015,zz,w,.011,.145,j%2?'#aeb6a9':'#8caaae');
    if(j<7)for(let i=0;i<6;i++){
      const xx=x+(i-2.5)*w*.14;r.rod([xx,.081,zz+.008],[xx+w*.036,.081,zz+h/7-.007],.0035,'#88968f',5);
    }
  }
  for(const side of [-1,1])cabinet(r,x+side*(w/2+.024),-.018,z,.033,h+.045,.13,side===1?liquid:alloy);
}
function tube(r,points,rad,color){
  loops(r,points,rad,color,false);
  for(let i=1;i<points.length-1;i++){
    // Spherical-looking elbow collars join consecutive segments, including the inner bend.
    const [x,y,z]=points[i];r.tubeY(x,y-rad*.77,y+rad*.77,z,rad*1.09,color,10);
    r.ringY(x,y+rad*.78,z,rad*1.09,.001,color,10);
  }
}
function grille(r,x,z){
  cabinet(r,x,-.075,z,.238,.25,.12,frame);
  cabinet(r,x,.045,z,.193,.195,.009,shadow);
  for(let i=0;i<7;i++)cabinet(r,x,.059,z-.080+i*.027,.173,.007,.009,alloy);
}
function driedGas(r,x,z){
  axialShell(r,x,z,-.051,.093,.089,'#a4b3aa');circle(r,x,.092,z,.082,'#748783');
  for(let i=0;i<3;i++)ring(r,x,.094+i*.002,z,.071-i*.013,.066-i*.013,alloy);
  r.rod([x,-.025,z-.067],[x,-.022,z-.14],.013,'#7e9695',10);
}
function flowLine(points) {
  const spans=points.slice(1).map((p,i)=>Math.hypot(...p.map((v,k)=>v-points[i][k])));
  const length=spans.reduce((sum,item)=>sum+item,0);
  return t=>{
    let d=((t%1+1)%1)*length;
    for(let i=0;i<spans.length;i++){if(d<=spans[i])return points[i].map((v,k)=>v+(points[i+1][k]-v)*d/spans[i]);d-=spans[i];}
    return points[0];
  };
}
function ductMap(lm){
  // Metered diagram coordinates. The front traces can be followed across each equipment package.
  const z=lm?1.33:1.17,yl=.036;
  const route=[[-.90,yl,z],[-.67,yl,z],[-.58,yl,z+.11],[.23,yl,z+.11],[.46,yl,z],[.74,yl,z],[.86,yl,z-.13],[.86,yl,.45],[.68,yl,.34],[-.71,yl,.34],[-.90,yl,.53],[-.90,yl,z]];
  const cool=[[.88,-.01,.83],[1.06,-.01,.83],[1.106,-.01,.77],[1.106,-.01,.25],[.96,-.01,.17],[.75,-.01,.17],[.70,-.01,.22],[.70,-.01,.69]];
  const returnPoint=flowLine(route),coolPoint=flowLine(cool);
  return {route,cool,z,gasAt:t=>{const [x,y,z]=returnPoint(t);return [x,y+.038,z];},coolAt:t=>{const [x,y,z]=coolPoint(t);return [x,y+.021,z];}};
}
function passageMarkers(r,routeFn,t,color,n){
  for(let i=0;i<n;i++){
    const p=routeFn(t+i/n),q=routeFn(t+(i/n)+.006);
    r.rod(p,q,.018,color,8);
  }
}
function airLoop(lm){
  const id=lm?'falcon-air':'endeavour-air',ref=lm?lmSource:cmSource;
  const air=ductMap(lm),blower=lm?.005:-.347,filter=lm?-.396:.055,z=air.z;
  return study(id,lm?'Falcon · crew oxygen and cooling':'Endeavour · crew oxygen and cooling',
    lm?'The lunar module’s suit-circuit package sat behind the pilot, on his right. Follow the gas through the selected round absorber, suit fan, cooling and moisture-removal section, then back toward the crew. The front of the equipment rack is open.'
    :'The command module’s main environmental equipment occupied the left equipment bay. Trace gas from the crew through the compressor, absorber and suit heat exchanger. The protective enclosure is open and the plumbing is spread out to show the route.',ref,[
    part('rack','Equipment enclosure and mounts','The modules sit inside a common equipment area. Their stained-metal rails and the open front show their mounting relationship. This display separates the equipment for visibility.',[-.34,-.27,-.17],r=>{
      for(const x of [-1.056,.999])cabinet(r,x,-.185,.82,.043,1.46,.076,frame);
      for(const zz of [.17,.59,1.056,1.517])cabinet(r,-.026,-.187,zz,2.055,.055,.074,alloy);
      for(const x of [-.72,.35])r.rod([x,-.19,.21],[x+.32,-.19,1.49],.016,frame,7);
    }),
    part('crew',lm?'Crew hoses and cabin return':'Suit umbilicals and cabin return',lm?'Two astronauts connected to the suit circuit. Cabin gas could also enter the same conditioning loop through the cabin return.':'Three crew members had suit connections. A cabin return let atmosphere from the cabin enter the conditioning circuit.',[-.64,.20,.20],r=>{
      grille(r,-.90,z);const n=lm?2:3;
      for(let i=0;i<n;i++){
        const x=-.75+i*.088;
        const pts=[[x,-.11,.98],[x+.01,.016,.92],[x+.028,.055,.86],[x+.018,.08,.77]];
        tube(r,pts,.026,i%2?'#a3aaa0':'#819493');for(let j=1;j<5;j++)r.rod([x+.013,.025+(j*.009),.925-j*.025],[x+.024,.032+(j*.009),.923-j*.025],.029,'#646f69',8);
      }
    }),
    part('oxygen','Makeup oxygen connection','The astronaut consumes oxygen. A separate supply replenishes it. Scrubbing exhaled carbon dioxide alone cannot replace the oxygen the crew uses.',[-.38,-.12,-.48],r=>{
      cabinet(r,-.70,-.08,.55,.188,.142,.083,alloy);
      axialShell(r,-.70,.55,.007,.082,.050,primer);
      tube(r,[[-.70,.022,.47],[-.70,.022,.419],[-.83,.022,.39],[-.866,.022,.45]],.014,'#8cae96');
    }),
    part('blower',lm?'Suit-circuit fan package':'Suit-circuit compressor',lm?'A fan circulates the oxygen-rich gas after it has passed through the selected absorber. The fan blades are visible through the sectioned cover.':'The compressor moves gas from the return side toward the absorber. A separate fan circulates air within the cabin.',[.20,.27,.46],(r,t)=>fan(r,blower,z+.105,t,lm)),
    part('absorber',lm?'Round CO₂ absorber canisters':'Rectangular CO₂ absorber cartridges',lm?'The main housing took a lunar-module cartridge. A smaller, parallel housing accepted a backpack-size cartridge. The displayed circulation follows the primary path.':'Two rectangular filter packs fit in the absorber assembly. Lithium hydroxide captured carbon dioxide, and activated charcoal removed odors.',[-.52,.25,.44],r=>absorber(r,filter,z+.109,lm)),
    part('exchange','Suit-gas heat exchanger','Separate gas and water-glycol passages exchange heat through their walls. Cooling the breathing gas also causes some moisture to condense.',[.54,.20,.13],r=>matrix(r,.805,.75)),
    part('separator','Moisture removal','Collected water leaves the breathing-gas circuit. The gas returns toward the crew after cooling and moisture removal.',[.16,.27,-.45],r=>driedGas(r,.45,.35)),
    part('circuit','Gas ducts and airflow markers','The broad blue path traces the breathing-gas loop. Moving gold marks indicate the direction of circulation. Their spacing and speed are illustrative.',[0,.63,.06],(r,t)=>{
      tube(r,air.route,.027,gas);passageMarkers(r,air.gasAt,t,movingGas,13);
    }),
    part('coolant','Water-glycol connection','The narrow copper-colored path represents coolant circulating through the exchanger. Coolant and breathing gas remain in separate passages.',[.63,-.15,-.19],(r,t)=>{
      tube(r,air.cool,.013,liquid);passageMarkers(r,air.coolAt,t,'#ebb28f',5);
    })
  ],[-.41,.22],{animated:true,motionDescription:'Gold marks follow the breathing-gas circuit. Copper marks follow the separate coolant path through the heat exchanger. The impeller turns as gas circulates.'});
}
const cm=airLoop(false),lm=airLoop(true);
function scrubber(lunar){
  const id=lunar?'falcon-filter':'endeavour-filter',shape=lunar?'Round':'Rectangular';
  function layer(r,y,h,size,color){
    if(lunar){r.tubeY(0,y,y+h,.66,size,color,36);circle(r,0,y+h,.66,size,color);}
    else cabinet(r,0,y,.66,size*2,size*2,h,color);
  }
  return study(id,shape+' carbon dioxide cartridge','Gas passes through the exposed face of the cartridge. The mesh keeps the particles inside. The layered section distinguishes the chemical bed and the odor-removal material. Packing and layer thicknesses are illustrative.',lunar?lmSource:cmSource,[
    part('case','Cartridge casing',lunar?'A round cartridge fits the lunar-module housing.':'The command-module cartridge fits into a rectangular compartment.',[-.39,-.25,.04],r=>{
      const rad=.385;
      if(lunar){axialShell(r,0,.66,-.30,.15,rad,insulation);r.tubeY(0,-.30,.15,.66,rad-.020,'#697773',36);ring(r,0,-.30,.66,rad,rad-.020,frame);}
      else{
        for(const x of [-rad,rad])cabinet(r,x,-.30,.66,.021,rad*2,.45,insulation);
        for(const z of [.66-rad,.66+rad])cabinet(r,0,-.30,z,rad*2+.020,.021,.45,insulation);
      }
    }),
    part('bed','Lithium hydroxide bed','Lithium hydroxide chemically removes carbon dioxide from the circulating gas. The granules shown at the cut face are enlarged.',[.34,.36,.22],r=>{
      layer(r,-.195,.208,.354,'#bbb8a2');
      for(let i=-5;i<=5;i++)for(let j=-5;j<=5;j++){
        const x=i*.059+.008*Math.sin(i*j+3),z=j*.060;
        if(lunar&&Math.hypot(x,z)>.34)continue;
        ellipse(r,front,x,z+.66,.011,.009,(i+j)%2?'#d0cdb6':'#ada992',.017,6);
      }
    }),
    part('charcoal','Activated charcoal','Charcoal adsorbs odors from the circulating gas.',[-.16,-.55,-.19],r=>layer(r,-.257,.056,.354,'#51574f')),
    part('screen','Retaining screen','The retaining screen covers the bed face. Its grid spacing has been enlarged so it is visible.',[.10,.58,.20],r=>{
      for(let i=-7;i<=7;i++){
        const x=i*.049,span=lunar?Math.sqrt(.358**2-x*x):.356;
        r.rod([x,.146,.66-span],[x,.146,.66+span],.0036,alloy,6);
        r.rod([-span,.147,.66+x],[span,.147,.66+x],.0036,alloy,6);
      }
    })
  ],[-.60,.30]);
}
const cmScrubber=scrubber(false),lmScrubber=scrubber(true);
function exchanger(lunar){
  return study(lunar?'falcon-exchanger':'endeavour-exchanger','Suit-gas heat exchanger','The cutaway opens the exchanger into its core and two fluid connections. The pressure boundaries keep liquid coolant out of the breathing gas.',lunar?lmSource:cmSource,[
    part('core','Plate and passage core','A large contact area lets heat move across the metal between the two streams.',[-.37,-.15,.18],r=>matrix(r,0,.70,true)),
    part('air','Gas inlet and outlet','The blue ducts carry the circulating gas to and from the core.',[.44,.26,.20],r=>{
      for(const z of [.53,.86])tube(r,[[.28,.06,z],[.43,.06,z],[.55,.11,z+.05]],.055,gas);
    }),
    part('coolant','Liquid connections','Coolant enters and leaves by the narrower connections. These lines belong to the thermal-control circuit.',[-.43,.22,-.24],r=>{
      for(const z of [.55,.83])tube(r,[[-.285,.04,z],[-.39,.04,z],[-.49,.10,z-.04]],.022,liquid);
    })
  ],[-.52,.31]);
}
const cmExchanger=exchanger(false),lmExchanger=exchanger(true);
export function getApolloAir(vehicle,id){
  if(vehicle==='saturn-v'){
    if(id==='endeavour-cabin.ecs')return cm;
    if(id==='endeavour-air.absorber')return cmScrubber;
    if(id==='endeavour-air.exchange')return cmExchanger;
  }
  if(vehicle==='apollo-falcon'){
    if(id==='interior.ecs'||id==='lm-room.ecs')return lm;
    if(id==='falcon-air.absorber')return lmScrubber;
    if(id==='falcon-air.exchange')return lmExchanger;
  }
  return null;
}
export function cmAirRack(r){
  const x=-.889;
  r.box(x-.062,-.205,.45,x+.078,.33,.82,'#a7afa3');
  for(const [y,z] of [[-.085,.70],[.095,.70]]){r.box(x+.079,y-.076,z-.072,x+.093,y+.076,z+.072,alloy);for(let j=0;j<4;j++)r.rod([x+.095,y-.052,z-.047+j*.028],[x+.095,y+.052,z-.047+j*.028],.0032,shadow,6);}
  for(const yy of [-.15,-.04,.07])tube(r,[[x+.08,yy,.51],[x+.135,yy,.475],[x+.147,yy+.031,.397]],.014,gas);
}
export function lmAirRack(r){
  // LM coordinates: +x aft and +y starboard, immediately behind the LM pilot.
  r.box(.228,.37,2.02,.47,.544,2.36,'#939f92');
  for(const [x,z,rr] of [[.30,2.27,.069],[.425,2.27,.047]]){
    axialShell(r,x,z,.539,.579,rr,insulation);circle(r,x,.568,z,rr*.88,frame);
    r.rod([x-rr*.45,.589,z],[x+rr*.45,.589,z],.008,alloy,7);
  }
  for(const x of [.295,.388])tube(r,[[x,.558,2.09],[x,.50,2.02],[x-.045,.467,1.986],[x-.10,.45,2.015]],.018,gas);
}
