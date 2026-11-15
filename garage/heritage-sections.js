import {airModels} from './fleet-air.js';
import {trackedModels} from './fleet-tracked.js';
import {fighterWingProfile} from './air-jets.js';
import {blade,wing,fin,nacelle} from './air-mesh.js';
import {section,part,slab,cylinder} from './section-primitives.js';

const aircraft=new Map(airModels.map(m=>[m.id,m]));
const colorByType={f16:'#8c9aa2',f22:'#9ba7ac',f35:'#697680'};
const interpolate=(a,b,p)=>a+(b-a)*p;

function wingStudy(id,s) {
  const model=aircraft.get(id),side=s<0?'Port':'Starboard',name=model.short+' '+side.toLowerCase()+' wing';
  const outline=fighterWingProfile(id),color=colorByType[id];
  // Each visible region uses the same planform as the assembled aircraft.
  const region=(r,low,high,rows,material)=>{
    const strip=rows.map(([span,a,b,z,t])=>[span,interpolate(a,b,low),interpolate(a,b,high),z,t*.48]);
    wing(r,strip,s,material,{movable:false});
  };
  return section(id+'-'+side.toLowerCase()+'-wing',name,
    'Look down on the wing to trace its outline. The colored regions separate the leading edge, broad upper surface, trailing edge and tip in this exterior study.',model.source,[
    part('leading','Leading-edge region','The forward boundary sweeps back from the wing root.',[-.47,0,.14],r=>region(r,0,.16,outline.slice(0,-1),color)),
    part('panel','Main wing surface','This broad middle region makes the changes in chord visible.',[0,0,.34],r=>region(r,.16,.76,outline.slice(0,-1),color)),
    part('trailing','Trailing-edge region','The rear boundary returns toward the fuselage.',[.50,0,.08],r=>region(r,.76,1,outline.slice(0,-1),'#78878d')),
    part('tip','Outer wingtip','The tip closes the outer end of the planform.',[.06,s*.48,.21],r=>region(r,0,1,outline.slice(-2),color))
  ]);
}

function pairedPod(){
  const model=aircraft.get('b52');
  return section('b52-paired-pod','B-52H twin-pod exterior','Two round nacelles sit side by side under a shared pylon. Four of these pairs are visible beneath the wings.',model.source,[
    part('pylon','Pylon silhouette','The pylon rises between the two nacelles to the wing.',[.10,0,.53],r=>fin(r,[[-.28,.72],[-.06,1.16],[.79,1.23],[.52,.68]],0,'#8a989e',{thick:.09})),
    ...[-1,1].map(s=>part(s<0?'left':'right',s<0?'Left nacelle exterior':'Right nacelle exterior','From the front, the circular lip frames a dark opening. The outside casing narrows aft.',[0,s*.48,-.16],r=>nacelle(r,-.89,s*.33,.52,1.76,.32,'#8f9ba1')))
  ]);
}

function rotorStudy(id,which,count) {
  const model=aircraft.get(id),tandem=id==='ch47',label=tandem?(which==='aft'?'Aft rotor':'Forward rotor'):'Main rotor';
  const advance=tandem?(which==='aft'?-.39:.59):.38,base=[0,0,.45],radius=1.5;
  return section(id+'-'+which+'-outline',model.short+' '+label.toLowerCase(),
    tandem?'The Chinook carries two three-bladed rotors. This plan view isolates one of the two, so its three blade outlines can be compared.':
    'Seen from above, the parked rotor has '+(count===6?'six':'four')+' separate blade outlines around a common center.',model.source,[
    part('center','Rotor center','The central cap marks the point where the blades meet.',[0,0,.39],r=>cylinder(r,[0,0],.12,.37,.48,'#718180')),
    ...Array.from({length:count},(_,i)=>{
      const a=advance+i*2*Math.PI/count;
      return part('blade-'+(i+1),'Blade '+(i+1),'The plan view shows the change in width between the root and outer tip.',[.44*Math.cos(a),.44*Math.sin(a),.15],r=>blade(r,base,a,radius,id==='mh6'?.12:.15,i%2?'#4b5757':'#5c6967'));
    })
  ]);
}

function tankTrack(model) {
  const old=model.id==='little-willie',color=old?'#717976':'#76816a';
  const track=[[ -1.49,.40],[-1.44,.59],[-1.21,.77],[1.18,.77],[1.48,.55],[1.47,.37],[1.20,.14],[-1.18,.14]];
  const loop=(r)=>{
    const face=(p,y)=>[p[0],y,p[1]];
    const inner=track.map(([x,z])=>[x*.95,.44+(z-.44)*.75]);
    track.forEach((p,i)=>{
      const j=(i+1)%track.length,q=track[j];
      for(const y of [-.115,.115])r.polygon([face(p,y),face(q,y),face(inner[j],y),face(inner[i],y)],'#58635d',false);
      r.polygon([face(p,-.115),face(q,-.115),face(q,.115),face(p,.115)],'#4b5652',false);
      const n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.105);
      for(let k=0;k<n;k++){
        const u=(k+.5)/n,xy=p.map((v,a)=>interpolate(v,q[a],u));
        r.rod(face(xy,-.12),face(xy,.12),.009,'#88918b',6);
      }
    });
  };
  const wheels=(r,xs,radius,z)=>{
    for(const x of xs){
      r.tubeY(x,-.11,.11,z,radius,'#414d48',24);
      for(const s of [-1,1]){
        r.ringY(x,s*.112,z,radius,radius*.79,'#536059',24);
        r.ringY(x,s*.114,z,radius*.79,radius*.27,color,24);
        r.ringY(x,s*.116,z,radius*.27,0,'#58675e',16);
      }
    }
  };
  const middle=old?Array.from({length:10},(_,i)=>-1.09+i*.24):[-.92,-.63,-.14,.15,.63,.92];
  return section(model.id+'-track-profile',model.short+' track profile',
    old?'On the preserved prototype, the long side plate hides much of the running gear. The continuous track is visible around its perimeter.':
    'The six large road-wheel faces appear in three pairs. Compare their low position with the raised wheels at the two ends of the track.',model.source,[
    part('track','Track perimeter','The outer loop defines the long contact patch and the rising ends.',[0,-.46,.04],loop),
    part('ends','End wheel faces','Two raised circular faces mark the ends of the visible track run.',[.20,.30,.30],r=>wheels(r,[-1.25,1.25],.16,.49)),
    ...(old?[part('shield','Long side plate','The plate follows the upper track run and obscures many of the small wheels.',[0,.47,.37],r=>r.profile([[-1.24,.42],[-1.15,.67],[1.10,.67],[1.29,.51],[1.17,.38],[-1.12,.38]],.12,.16,color))]:
      [part('fender','Fender strip','The narrow horizontal ledge follows the track top.',[0,0,.53],r=>slab(r,0,0,.79,2.66,.31,.035,color,.023))]),
    part('wheels',old?'Lower wheel faces':'Six road-wheel faces',old?'Small circles appear along the lower edge of the side plate.':'The three gaps between pairs make the Easy Eight’s wheel spacing recognizable.',[0,.33,-.34],r=>wheels(r,middle,old?.103:.16,old?.31:.33))
  ]);
}

export const heritageSections={};
for(const id of Object.keys(colorByType)){
  heritageSections[id]=Object.fromEntries([['port',-1],['starboard',1]].map(([side,s])=>['wings.'+side,wingStudy(id,s)]));
}
const pod=pairedPod();
heritageSections.b52=Object.fromEntries(['port-inner','port-outer','starboard-inner','starboard-outer'].map(k=>['pods.'+k,pod]));
for(const [id,which,count] of [['uh60','main',4],['mh6','main',6],['ch47','forward',3],['ch47','aft',3]]){
  const rotor=rotorStudy(id,which,count);
  const pieces=['hub',...Array.from({length:count},(_,i)=>'blade'+(i+1))];
  heritageSections[id]={...heritageSections[id],...Object.fromEntries(pieces.map(k=>[which+'.'+k,rotor]))};
}
for(const model of trackedModels){
  const study=tankTrack(model);
  heritageSections[model.id]={'tracks.left':study,'tracks.right':study};
}
