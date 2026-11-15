// 992.1 front engine-coolant circuit. The side-radiator module is enlarged,
// and the longitudinal pipe run is shortened so both ends fit the same view.
import {study,part,sleeve,cyl,turn,TAU,x} from './mechanism-shapes.js';
import {pipe,barrel} from './road-primitives.js';

const catalog='https://www.sunsetporscheparts.com/v-2023-porsche-911--carrera-s--3-0l-h6-gas/cooling-system--';
const page=(section,label)=>({label:'Sunset Porsche · '+label,url:catalog+section});
const radiatorSource=page('radiator-and-components','2023 Carrera S radiators and carriers');
const fanSource=page('cooling-fan','2023 Carrera S front cooling fans');
const pipesSource=page('hoses-and-lines','2023 Carrera S coolant hoses and lines');
const pumpSource=page('water-pump','2023 Carrera S water pump and thermostat');

function core(r){
  const start=-.315,end=.315,low=-.225,pitch=.044;
  for(let row=0;row<=10;row++){
    const z=low+row*pitch;
    r.box(-.535,start,z,-.472,end,z+.009,'#8a9a9e');
    if(row===10)break;
    // The exposed folded sheet really spans the gap to the next tube.
    for(let fin=0;fin<26;fin++){
      const y=start+(end-start)*fin/26,next=start+(end-start)*(fin+1)/26;
      const bottom=z+.009,top=z+pitch;
      const a=fin%2?top:bottom,b=fin%2?bottom:top;
      r.polygon([[-.527,y,a],[-.477,y,a],[-.477,next,b],[-.527,next,b]],fin%2?'#7f9095':'#acb6b6',false);
    }
  }
}
function tank(r,side){
  const y=side*.343,z=side>0?.136:-.136;
  r.box(-.548,y-.029,-.229,-.458,y+.029,.230,'#323c40');
  for(let i=0;i<7;i++){
    const h=-.204+i*.065;
    r.box(-.552,y-.029,h,-.453,y+.029,h+.009,'#58636a');
  }
  barrel(r,[-.459,y,z],[-.415,y,z],.023,'#485457',14);
}
function fanRotor(r,phase){
  const origin=[-.407,0,0];
  cyl(r,origin,x,0,.033,.047,'#505e65',20);
  for(let blade=0;blade<7;blade++){
    const angle=TAU*(blade/7+phase);
    const profiles=[[.041,-.12,.22],[.091,-.28,.10],[.15,-.43,-.02],[.19,-.48,-.10]];
    const point=([radius,lead,trail],edge)=>[origin[0]+(edge?.021:0),radius*Math.cos(angle+(edge?trail:lead)),radius*Math.sin(angle+(edge?trail:lead))];
    for(let i=1;i<profiles.length;i++)r.polygon([point(profiles[i-1],0),point(profiles[i],0),point(profiles[i],1),point(profiles[i-1],1)],i===2?'#5b696e':'#455158',false);
  }
}
function shroud(r){
  const square=(angle)=>{
    const y=Math.cos(angle),z=Math.sin(angle),scale=Math.min(.307/Math.max(Math.abs(y),1e-6),.225/Math.max(Math.abs(z),1e-6));
    return [-.454,y*scale,z*scale];
  };
  const lip=(angle)=>[-.426,.201*Math.cos(angle),.201*Math.sin(angle)];
  for(let i=0;i<40;i++){
    const a=TAU*i/40,b=TAU*(i+1)/40;
    r.polygon([square(a),square(b),lip(b),lip(a)],'#364147',false);
  }
  sleeve(r,[-.426,0,0],x,-.002,.036,.202,.195,'#454e50',32);
  for(const a of [0,TAU/3,2*TAU/3]){
    const pt=rad=>[-.438,rad*Math.cos(a),rad*Math.sin(a)];
    barrel(r,pt(.041),pt(.199),.007,'#677276',8);
  }
  cyl(r,[-.444,0,0],x,0,.025,.038,'#4a535a',18);
}

const hot=[[-.415,.343,.136],[-.263,.343,.136],[-.153,.285,-.012],[.421,.285,-.012],[.527,.176,.018]];
const cool=[[-.415,-.343,-.136],[-.263,-.343,-.136],[-.153,-.285,-.155],[.421,-.285,-.155],[.527,-.170,-.074]];
function line(r,points){
  // Colour and collars distinguish rubber elbows from the length of rigid pipe.
  pipe(r,points.slice(0,3),.019,'#37484c',12);
  barrel(r,points[2],points[3],.018,'#a6b5b9',14);
  pipe(r,points.slice(3),.019,'#37484c',12);
  for(const p of points.slice(2,4))barrel(r,[p[0]-.010,p[1],p[2]],[p[0]+.010,p[1],p[2]],.022,'#889698',12);
}
function pump(r){
  turn(r,[.622,-.129,-.074],x,[[-.06,0],[-.06,.061],[-.041,.077],[.036,.077],[.054,.054],[.054,0]],'#7f8d90',{n:22});
  pipe(r,[cool.at(-1),[.589,-.17,-.074],[.604,-.129,-.074]],.023,'#657679',12);
  pipe(r,[[.622,-.083,-.074],[.624,-.042,-.045],[.624,-.030,.018]],.025,'#657679',12);
}
function thermostat(r){
  turn(r,[.582,.143,.018],x,[[-.048,0],[-.048,.044],[-.03,.061],[.036,.061],[.054,.042],[.054,0]],'#54676b',{n:20});
  pipe(r,[hot.at(-1),[.545,.155,.018],[.576,.143,.018]],.022,'#56666b',12);
  pipe(r,[[.60,.097,.018],[.613,.073,.027],[.624,.045,.027]],.023,'#657679',12);
}
function jacket(r){
  r.box(.586,-.037,-.006,.663,.049,.050,'#8e9a9a');
  for(const y of [-.03,.04])r.box(.581,y,-.010,.668,y+.009,.054,'#69797d');
}

const components=[
  part('core','Coolant tubes and folded fins','Engine coolant flows through flat tubes. The folded sheet between them gives passing air more metal surface to cool.',[-.35,0,0],core),
  part('inlet','Inlet tank and hose neck','The inlet tank distributes hot coolant across the tubes.',[0,.29,.08],r=>tank(r,1)),
  part('outlet','Outlet tank and hose neck','Coolant leaving the tube ends collects in this tank before it returns to the engine.',[0,-.29,-.08],r=>tank(r,-1)),
  {...part('shroud','Fan shroud and motor support','The fixed shroud draws air through the radiator face. Its supports hold the motor at the centre of the opening.',[.15,0,.21],shroud),source:fanSource},
  {...part('fan','Electric radiator fan','The fan draws outside air across the tubes when road speed provides too little airflow. The 2023 parts catalog lists 400 W and 650 W assemblies. This rotor illustrates their shared function.',[.34,0,.33],fanRotor),source:fanSource},
  {...part('feed','Supply pipe and flexible elbows','A longitudinal pipe carries heated coolant forward from the engine. Flexible ends join it to the radiator and the rear circuit.',[0,.22,.25],r=>line(r,hot)),source:pipesSource},
  {...part('return','Return pipe and flexible elbows','The return pipe carries cooled liquid back toward the pump at the rear engine.',[0,-.22,-.25],r=>line(r,cool)),source:pipesSource},
  {...part('pump','Engine coolant pump','The impeller inside the pump housing circulates coolant through the engine and its cooling circuit.',[.43,-.23,-.09],pump),source:pumpSource},
  {...part('thermostat','Thermostat and housing','The thermostat meters flow through the radiator circuit as the engine warms.',[.43,.23,.15],thermostat),source:pumpSource},
  part('jacket','Engine water jacket connection','This section represents the coolant passages around the rear engine. Coolant absorbs heat here before it returns to the radiators.',[.42,0,.32],jacket)
];

export const frontCoolantStudy=study('992frontcoolant','Front radiator and engine coolant circuit',
  'A front corner radiator releases heat carried forward from the rear engine. This view enlarges one side module and shortens the supply and return pipes. Its electric fan moves air across the core while coolant flows inside the tubes.',
  radiatorSource,components,'Watch the fan turn within its fixed shroud. The motion is slowed so you can follow the swept blades.');
frontCoolantStudy.viewAngle=[1.04,.34];
