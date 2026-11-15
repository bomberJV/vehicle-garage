import {TAU,section,part,bell,loops} from './space-shapes.js';
import {paint,shadow,alloy,primer,frame,mission,iuReference,polar,openRear,study,lip,shell,stiffeners,station,panelBox} from './saturn-shapes.js';

function tankEnd(z,r,depth,sign){
  return Array.from({length:9},(_,i)=>{const t=i*Math.PI/16;return [z+sign*depth*Math.sin(t),Math.max(.004,r*Math.cos(t))];});
}
function dome(r,z,radius,depth,sign,color,arc=openRear){
  shell(r,tankEnd(z,radius,depth,sign),color,arc);
}
function tankBarrel(r,z0,z1,radius,color,{bottom,top}={}){
  shell(r,[[z0,radius],[z1,radius]],color,openRear);
  for(const z of [z0,z1])lip(r,z,radius+.004,alloy,.027,openRear);
  if(bottom)dome(r,z0,radius,bottom,-1,color,openRear);
  if(top)dome(r,z1,radius,top,1,color,openRear);
}
function skirt(r,z0,z1,radius,color=paint){
  shell(r,[[z0,radius],[z1,radius]],color);
  stiffeners(r,radius,radius,z0+.020,z1-.020,26,openRear);
  for(const z of [z0,z1])lip(r,z,radius+.015,primer,.055,openRear);
}
function externalBells(r,count,radius,span,height,z0){
  const xy=[[0,0]];
  for(let i=0;i<count-1;i++){const a=(i+.5)*TAU/(count-1);xy.push([span*Math.cos(a),span*Math.sin(a)]);}
  for(const [x,y] of xy){
    bell(r,x,y,z0,radius,height,30);
    for(let j=0;j<6;j++){
      const f=(j+.4)/7,rr=radius*(f<=.5?1-.6*f:.70-.78*(f-.5));
      section(r,x,y,[[z0+height*f,rr+.004],[z0+height*f+.009,rr+.002]],'#899391',{steps:24});
    }
  }
}
function thrustDeck(r,rr,z){
  lip(r,z,rr,'#777f79',.13);
  for(let i=0;i<8;i++){const a=(i+.5)*TAU/8;
    r.rod(polar(a,z-.02,.30),polar(a,z+.14,rr*.93),.033,frame,7);
  }
}
const firstStage=study('sic','S-IC · first-stage cutaway','The separated tank ends are visible in the middle of this cutaway. Between them is a dry, ribbed intertank. At the base, four F-1 bells surround a fifth on the centerline.',mission,[
  part('fuel','Lower fuel tank','The lower tank carried kerosene. Both its upper dome and the lower dome of the oxygen tank fit inside the intertank.',[-.54,0,-.30],r=>tankBarrel(r,.88,1.72,.70,'#c4c8aa',{bottom:.20,top:.23})),
  part('intertank','Dry intertank section','Look through the open side to see the space between the two curved tank ends. The external stringers carried loads around the tanks.',[.68,.15,.02],r=>skirt(r,1.73,2.29,.725,'#c2b78d')),
  part('oxygen','Upper oxygen tank','This larger tank sits above the dry intertank. The wall and end domes are shown with the near side cut away.',[-.46,0,.41],r=>tankBarrel(r,2.30,3.51,.70,'#c2d1cd',{bottom:.23,top:.24})),
  part('forward','Forward skirt','The forward skirt extends above the oxygen tank dome to meet the interstage.',[.36,.34,.62],r=>skirt(r,3.52,3.86,.725)),
  part('aft','Aft skirt and support deck','The skirt surrounds the upper ends of the five bells. An open portion of the lower deck shows how the cluster occupies the full diameter.',[-.32,.25,-.48],r=>{skirt(r,.48,.87,.725);thrustDeck(r,.70,.57);}),
  part('bells','Five F-1 bell exteriors','The wide mouths of four outer bells and a center bell are visible from below. The drawing shows their outside contours.',[0,0,-.65],r=>externalBells(r,5,.21,.415,.55,0))
]);
const interstage=study('saturn-joint','Saturn interstage structure','This display section follows the ribbed wall around an open center. Comparing the inside and outside shows how a thin skin and closely spaced stiffeners form a deep barrel.',mission,[
  part('skin','Curved barrel skin','A section of the interstage wall follows the cylindrical joints above and below.',[.40,0,.18],r=>shell(r,[[.32,1],[1.30,1]],paint,openRear)),
  part('longerons','Longitudinal stringers','Long, narrow structural members stiffened the wall between its end frames.',[-.36,-.27,.26],r=>stiffeners(r,1.01,1.01,.34,1.28,28,openRear,'#9caca7')),
  part('lower','Lower frame','The ring follows the full lower circumference. The inner edge remains open.',[-.22,0,-.40],r=>lip(r,.30,1.024,primer,.12)),
  part('upper','Upper frame','A second annular frame follows the upper joint.',[0,.16,.44],r=>lip(r,1.32,1.024,alloy,.12))
],[-.33,.39]);
const sharedEnd=study('saturn-bulkhead','Shared tank bulkhead','The upper stages saved an entire tank end by sharing a domed partition. The orange cut edge marks the insulating core between two faces. The separation in this view is exaggerated.',mission,[
  part('lower','Lower face sheet','The lower face bounds the upper end of the lower tank.',[0,0,-.40],r=>dome(r,.68,1.08,.46,1,'#96a9a4')),
  part('core','Insulating core','The curved core separates the two face sheets. Its highlighted edge makes the sandwich visible in section.',[.31,0,.12],r=>{dome(r,.706,1.08,.46,1,'#c7a46b');lip(r,.708,1.083,primer,.025,openRear);}),
  part('upper','Upper face sheet','The second face follows the curve of the first and forms the lower boundary of the upper tank.',[0,0,.45],r=>dome(r,.739,1.08,.46,1,'#d1d7c8'))
],[-.40,.35]);
function upperStage(id,number,single){
  const rr=single?.67:.82;
  const count=single?1:5;
  const z=single?1.22:1.38,top=single?2.45:2.83;
  return study(id,number+(single?' · third-stage cutaway':' · second-stage cutaway'),
    single?'One J-2 occupies the open aft section. Above it, the oxygen and hydrogen tanks share a curved boundary. The forward skirt meets the separate instrument unit.'
    :'The five smaller J-2 bells sit below two tanks with one shared partition. The hydrogen tank occupies most of the length. Compare this arrangement with the dry space between the first-stage tanks.',mission,[
    part('lower','Lower oxygen tank','The oxygen tank sits below the shared bulkhead. Its lower dome curves toward the supporting structure.',[-.54,0,-.14],r=>tankBarrel(r,.90,z,rr,'#c0cfcb',{bottom:.25})),
    part('bulkhead','Common bulkhead','The curved boundary belongs to both tanks. Open it to inspect the two face sheets and their insulating core.',[.43,.26,.08],r=>{dome(r,z,rr,.27,1,'#c4b692');lip(r,z+.014,rr+.015,primer,.025,openRear);}),
    part('upper','Upper hydrogen tank','This large upper volume is bounded below by the common bulkhead and above by its own dome.',[-.52,.13,.32],r=>tankBarrel(r,z+.019,top,rr,'#c7ccad',{top:.25})),
    part('skirt','Forward skirt','The visible stiffeners run between frame rings on the forward skirt.',[.38,.18,.52],r=>skirt(r,top+.011,top+.38,rr+.025)),
    part('support','Aft support and skirt','The exposed aft skirt surrounds the supporting structure. Its open center leaves room for the upper end of the bell cluster.',[-.26,.23,-.44],r=>{skirt(r,.46,.88,rr+.025);thrustDeck(r,rr,.51);}),
    part('bells',single?'Single J-2 bell':'Five J-2 bell exteriors',single?'From below, one bell occupies the center of the S-IVB. The larger S-II stage had five.':'One J-2 bell sits in the center of the stage, flanked by four more.',[0,0,-.59],r=>externalBells(r,count,single?.29:.225,.47,.46,.015))
  ]);
}
const secondStage=upperStage('sii','S-II',false),thirdStage=upperStage('sivb','S-IVB',true);
const iu=study('saturn-iu','Instrument unit · equipment ring','This low, open ring sat between the third stage and the adapter. Look through the cut side to see the equipment attached to the inside wall. Individual box positions are representative.',iuReference,[
  part('wall','Annular shell','A shallow, hollow wall surrounded the equipment. The open center continued up to the adapter.',[.44,0,.08],r=>shell(r,[[.34,1.06],[.64,1.06]],shadow,openRear)),
  part('flanges','Joining flanges','Two annular edges join the unit to the structures above and below.',[0,-.32,.24],r=>{lip(r,.332,1.066,alloy,.046);lip(r,.648,1.066,alloy,.046);}),
  part('racks','Mounted equipment boxes','The boxes line the inside circumference. Each faces the open center, which is easiest to see from above.',[-.36,0,.25],r=>{
    for(let i=0;i<14;i++){const a=2.98+(TAU-2.98)*i/13,at=station(a,.996,.49);panelBox(r,at,0,0,.16,.185,-.103,i%3===0?'#b1aa8c':'#899492');
      for(let j=0;j<4;j++)panelBox(r,at,-.058+j*.038,0,.009,.146,-.113,'#5c696a');
    }}),
  part('looms','Cable bundles','Bundled lines follow the circumference below the box faces.',[.18,.36,-.29],r=>{for(let j=0;j<3;j++){const arc=Array.from({length:31},(_,i)=>polar(2.95+i*(TAU-2.95)/30,.385+j*.015,.916));loops(r,arc,.008,j===1?'#ae966b':'#788583',false);}})
],[-.44,.61]);
export const stageEntries=[
  [['first.barrel','first.fairings','first.bells'],firstStage],
  [['upper.interstage','upper.shoulder','sic.intertank','sic.forward','sii.skirt','sivb.skirt'],interstage],
  [['upper.second','upper.second-bells'],secondStage],
  [['upper.third','upper.third-bell'],thirdStage],
  [['sii.bulkhead','sivb.bulkhead'],sharedEnd],
  [['upper.instrument'],iu]
];
