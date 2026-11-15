import {section,part,source} from './section-primitives.js';

const tau=2*Math.PI;
const metal=source('McCauley · fixed-pitch aluminum propellers','https://mccauley.txtav.com/-/media/mccauley/files/manuals/mpc26.pdf');
const birch=source('Sensenich · W70DK laminated birch propeller','https://www.sensenich.com/shop/aircraft/wood/w70dk/');
const point=(x,radial,chord,angle,z)=>[x,radial*Math.cos(angle)-chord*Math.sin(angle),z+radial*Math.sin(angle)+chord*Math.cos(angle)];

function shade(color,value){
  return '#'+[1,3,5].map(i=>Math.round(parseInt(color.slice(i,i+2),16)*value).toString(16).padStart(2,'0')).join('');
}
function turned(r,profile,z,color){
  for(let i=0;i<32;i++){
    const a=tau*i/32,b=tau*(i+1)/32;
    for(let j=1;j<profile.length;j++){
      const [x1,r1]=profile[j-1],[x2,r2]=profile[j];
      r.polygon([point(x1,r1,0,a,z),point(x2,r2,0,a,z),point(x2,r2,0,b,z),point(x1,r1,0,b,z)],shade(color,.84+.13*Math.sin((a+b)/2)),false);
    }
  }
}
function bolts(r,x,phase,z){
  for(let j=0;j<6;j++){
    const a=(j/6+phase)*tau;
    const center=point(x,.125,0,a,z);
    const metal=j===0?'#bda676':'#adb3ae';
    r.rod(center,[x+.048,center[1],center[2]],.018,metal,6);
    r.discX(x,center[1],center[2],.018,metal,6);
  }
}

// Both props have two integral blades. Twist varies from thick root to tip.
// The section strip wraps around the leading edge and closes at the trailing edge.
export function propBlade(r,x,z,radius,angle,wood=false){
  const stations=wood?[[.068,.118,.18,.063],[.20,.154,.27,.058],[.42,.158,.28,.045],[.64,.139,.23,.032],[.84,.109,.185,.022],[.96,.063,.15,.012],[1,.006,.135,.004]]:
    [[.065,.11,.165,.060],[.22,.13,.27,.053],[.46,.143,.239,.035],[.67,.133,.197,.024],[.86,.102,.16,.016],[.972,.066,.127,.010],[1,.043,.117,.006]];
  const chords=[-.51,-.33,.03,.28,.50,.28,.015,-.36],camber=[0,.65,1,.72,0,-.25,-.42,-.34];
  const colors=wood?['#735135','#936740','#aa7847','#bc884f','#73533c','#8d6340','#9f7348','#947048']:
    ['#3e4b51','#55616a','#64717a','#74818a','#4b565b','#4c5960','#49575d','#434e54'];
  const station=(s,i)=>{
    const [span,chord,pitch,thickness]=s,offset=chords[i%8]*chord;
    const axial=offset*Math.sin(pitch*Math.PI)+camber[i%8]*thickness;
    return point(x+radius*axial,radius*span,radius*offset*Math.cos(pitch*Math.PI),angle,z);
  };
  for(let j=1;j<stations.length;j++)for(let k=0;k<8;k++){
    const a=stations[j-1],b=stations[j];
    const fill=wood&&k===0&&j>=3?'#967541':!wood&&j===stations.length-1?'#d0cdb8':colors[k];
    r.polygon([station(a,k),station(b,k),station(b,k+1),station(a,k+1)],fill,false);
  }
  r.polygon(chords.map((_,i)=>station(stations.at(-1),i)),wood?'#a58053':'#c7c7b0',false);
}

function assembly(wood){
  const z=.03, reference=wood?birch:metal, code=wood?'j5-propeller':'172s-propeller';
  const description=wood?'This Sensenich W70DK example matches the J-5A and A-75 pairing in the manufacturer’s application guide. Its carved blades and central hub share one laminated birch blank. The exact propeller on the museum aircraft is undocumented here.':
    'The 172S uses a two-blade, fixed-pitch McCauley 1A170E/JHA7660. Both blades and the center are a single aluminum forging. The colored regions let you inspect that continuous shape separately.';
  const parts=[
    ...[0,1].map(j=>part('blade-'+(j+1),j?'Second blade':'First blade',
      (wood?'Varnished birch laminations run continuously through the hub. ':'The blade is integral with the forged center. ')+
      'Follow its changing chord and twist from the thick root to the thin tip.',
      [0,j?-.38:.38,j?-.42:.42],(r,phase)=>propBlade(r,0,z,1.19,(phase+.085+j/2)*tau,wood))),
    part('hub',wood?'Laminated hub':'Integral propeller hub',wood?'The broad middle of the laminated blank carries clamping loads between the hub plates.':'The aluminum hub transfers torque from the crankshaft flange to both blades. Its pitch stays fixed while the propeller turns.',[0,.20,.69],(r,phase)=>{
      if(wood)for(let i=0;i<7;i++){
        const x=(i-3)*.022;turned(r,[[x-.011,.19],[x+.011,.19]],z,i%2?'#957347':'#bb935e');
      }else turned(r,[[-.084,.15],[-.063,.187],[.063,.187],[.08,.154]],z,'#758188');
      for(const x of [-.078,.078])r.discX(x,0,z,.171,wood?'#a27f53':'#7d898e',36);
    }),
    part('flange','Crankshaft flange','The crankshaft ends in a flange behind the propeller. Here the flange and the two blades turn together, as they do in a direct-drive installation.',[.57,0,-.15],(r,phase)=>{
      turned(r,[[.10,.175],[.146,.175],[.149,.071],[.43,.071]],z,'#7b8385');
      r.discX(.43,0,z,.071,'#8a9293',30);
      const stripe=point(.19,.072,0,phase*tau,z),tail=point(.344,.072,0,phase*tau,z);
      r.rod(stripe,tail,.010,'#d4b274',8);
    }),
    part('plate',wood?'Front crush plate':'Spinner backing plate',wood?'The broad metal plate spreads the clamp load against the end grain around the hub.':'The flared backing plate carries the outer edge of the spinner.',[-.47,0,.18],(r,phase)=>{
      const x=wood?-.11:.09,rad=wood?.155:.245;
      turned(r,[[x-.013,rad],[x+.014,rad]],z,wood?'#7b8180':'#b6c1c4');
      for(const shift of [-.013,.014])r.discX(x+shift,0,z,rad,'#929c9e',36);
    }),
    part('fasteners','Hub fasteners','The fasteners lie on a circle around the shaft. A brass-colored marker makes it easy to follow one revolution.',[-.38,-.25,-.50],(r,phase)=>bolts(r,wood?-.14:-.116,phase,z))
  ];
  if(!wood)parts.push(part('spinner','Spinner dome','The curved dome covers the hub. The rear edge has openings where the blades emerge.',[-.63,0,.69],(r,phase)=>{
    const root=(phase+.085)*tau;
    const sections=[[-.345,.006],[-.32,.071],[-.252,.14],[-.173,.20],[-.12,.23],[.093,.244]];
    for(let i=0;i<40;i++){
      const a=(i/40*tau)+root,b=a+tau/40;
      for(let j=1;j<sections.length;j++){
        if(j===sections.length-1 && Math.abs(Math.sin((i+.5)/40*tau))<.25)continue;
        const [x1,r1]=sections[j-1],[x2,r2]=sections[j];
        r.polygon([point(x1,r1,0,a,z),point(x2,r2,0,a,z),point(x2,r2,0,b,z),point(x1,r1,0,b,z)],shade(j<4?'#acb8bc':'#97a6ad',.83+.15*Math.sin((a+b)/2)),false);
      }
    }
  }));
  const study=section(code,wood?'Sensenich wooden propeller':'McCauley fixed-pitch propeller',description,reference,parts);
  study.animated=true;study.viewAngle=[-.91,.17];study.motionDescription='The crankshaft, flange, hub and both blades turn together. Follow the marked fastener. The display slows the rotation so the blade twist remains visible.';
  return study;
}
export const skyPropeller=assembly(false),cubPropeller=assembly(true);
