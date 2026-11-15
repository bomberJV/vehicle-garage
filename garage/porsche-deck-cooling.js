// 992.1 Carrera S. The compartment purge blowers and the two charge-air
// coolers are separate systems. Coordinates in the installed view are metres.
import {part,study,turn,z,TAU} from './mechanism-shapes.js';
import {barrel,pipe} from './road-primitives.js';

const blowerSource={label:'Porsche workshop illustration · engine-compartment blowers, pp. 16–17',url:'https://documents.goapr.com/7bc0a9f901f176042a5b513c78741a44e9ae2c40.pdf#page=16'};
const yearSource={label:'2023 Carrera S rear compartment · blower and rubber mounts',url:'https://porsche.oempartsonline.com/v-2023-porsche-911--carrera-s--3-0l-h6-gas/body--rear-compartment'};
const coolerSource={label:'Porsche · 911 Carrera S Cabriolet, engine and drivetrain, p. 11',url:'https://newsroom.porsche.com/dam/jcr%3A027b3198-602a-498d-b4fc-52e6e3b5261a/2020_911_Carrera_S_and_4S_Cabriolet_US_Press_Kit.pdf#page=11'};

function circle(r,c,radius,color,n){
  r.polygon(Array.from({length:n},(_,i)=>[c[0]+radius*Math.cos(TAU*i/n),c[1]+radius*Math.sin(TAU*i/n),c[2]]),color,false);
}
function impeller(r,c,radius,phase,segments){
  const polar=(k,a,h)=>[c[0]+radius*k*Math.cos(a),c[1]+radius*k*Math.sin(a),c[2]+radius*h];
  for(let j=0;j<9;j++){
    const a=j*TAU/9+phase*TAU;
    for(let i=0;i<segments;i++){
      const section=t=>{
        const k=.27+.69*t,theta=a+.14*t+.34*t*t;
        return [polar(k,theta,-.06*t),polar(k,theta+.34-.12*t,.07+.035*t)];
      };
      const [p,q]=section(i/segments),[v,w]=section((i+1)/segments);
      r.polygon([p,v,w,q],j===0?'#667277':i%2?'#4a585e':'#546268',false);
    }
  }
  circle(r,[c[0],c[1],c[2]+.09*radius],.31*radius,'#687379',20);
}
function outline(r,c,rad,thickness,n){
  const point=(i,k,h)=>[c[0]+rad*k*Math.cos(TAU*i/n),c[1]+rad*k*Math.sin(TAU*i/n),c[2]+h];
  for(let i=0;i<n;i++){
    r.polygon([point(i,1.04,0),point(i+1,1.04,0),point(i+1,1,0),point(i,1,0)],'#4d5558',false);
    r.polygon([point(i,1,0),point(i+1,1,0),point(i+1,1,-thickness),point(i,1,-thickness)],'#333a3c',false);
  }
}
function coolerBody(r,c,side){
  const [x,y,h]=c;
  const width=.235,half=.139;
  r.box(x-half,y-width*.5,h-.054,x+half,y+width*.5,h-.008,'#6a777d');
  for(let i=0;i<12;i++){
    const p=x-half+.009+i*.023;
    r.polygon([[p,y-width*.5,h-.006],[p+.007,y-width*.5,h-.006],[p+.007,y+width*.5,h-.006],[p,y+width*.5,h-.006]],'#a5afae',false);
  }
  for(const s of [-1,1])r.box(x+s*(half+.014)-.014,y-width*.5,h-.06,x+s*(half+.014)+.014,y+width*.5,h-.007,'#525c61');
  barrel(r,[x+half+.014,y+side*.035,h-.03],[x+half+.055,y+side*.071,h-.051],.023,'#424c50',8);
}
export function draw992DeckCooling(r){
  for(const s of [-1,1]){
    const y=s*.248,c=[1.37,y,.837],radius=.108;
    r.tag(s<0?'engine.left-blower':'engine.right-blower',()=>{
      outline(r,[c[0],y,c[2]+.017],radius,.027,18);
      impeller(r,c,radius,0,2);
      for(let i=0;i<3;i++){
        const a=(i/3+.25)*TAU;
        r.rod([c[0]+.027*Math.cos(a),y+.027*Math.sin(a),c[2]-.015],[c[0]+radius*Math.cos(a),y+radius*Math.sin(a),c[2]-.015],.004,'#343b40',4);
      }
      r.box(c[0]+.04,y+s*radius-.008,c[2]-.023,c[0]+.066,y+s*radius+.008,c[2]-.01,'#505855');
    });
    r.tag('engine.intercoolers',()=>coolerBody(r,[1.363,s*.203,.794],s));
  }
}
function blowerStudy(s){
  const side=s<0?'Left':'Right',id=s<0?'992deckfanleft':'992deckfanright',c=[0,0,0],rad=.26;
  const mounting=[[-.181,-.214],[-.181,.214],[.253,s*.042]];
  const record=study(id,side+' rear-compartment blower',
    'An electric motor drives this fan beneath the rear cover. Its blade wheel turns inside a fixed inlet ring. Two front mounts and one rear mount locate the removable unit.',
    blowerSource,[
    part('frame','Inlet ring and motor supports','The circular shroud controls clearance at the blade tips. Three arms carry the motor in the center.',[0,0,-.43],r=>{
      outline(r,[0,0,.042],rad,.077,42);
      for(let i=0;i<3;i++){
        const a=(i/3+.12)*TAU;
        barrel(r,[.066*Math.cos(a),.066*Math.sin(a),-.053],[rad*Math.cos(a),rad*Math.sin(a),-.046],.011,'#525b60',8);
      }
      for(const [x,y] of mounting){
        const a=Math.atan2(y,x);barrel(r,[.24*Math.cos(a),.24*Math.sin(a),-.039],[x,y,-.041],.017,'#495257',8);
      }
    }),
    part('impeller','Swept impeller and hub','The hub turns with the motor. Pitch along each blade changes from its root to its tip.',[0,0,.52],(r,p)=>impeller(r,c,rad,p,5)),
    part('motor','Electric motor housing','The bolted center motor turns the impeller independently of crankshaft speed.',[.45,0,-.14],r=>{
      turn(r,[0,0,-.031],z,[[-.096,0],[-.096,.054],[-.085,.072],[-.012,.072],[.007,.056],[.007,0]],'#69757a',{n:26});
      barrel(r,[0,0,-.024],[0,0,.008],.021,'#a9b1ae',12);
    }),
    part('sleeves','Three rubber mounting sleeves','The soft sleeves between each mounting point and the body isolate vibration.',[0,s*.49,-.06],r=>{
      for(const [x,y] of mounting)turn(r,[x,y,-.035],z,[[-.024,.009],[-.024,.024],[-.014,.024],[-.01,.019],[.012,.019],[.016,.024],[.025,.024],[.025,.009],[-.024,.009]],'#474a48',{n:14});
    }),
    part('plug','Connector and lead','Each blower has its own cable plug. The short lead runs from the motor to the edge of its housing.',[0,-s*.52,-.09],r=>{
      pipe(r,[[.05,0,-.089],[.11,s*.033,-.085],[.18,s*.11,-.053],[.185,s*.182,-.043]],.007,'#444b4e',7);
      const y=s*.181;r.box(.173,y-.023,-.060,.215,y+.023,-.030,'#525c62');
      for(const x of [.183,.202])r.box(x-.002,y-.014,-.031,x+.002,y+.014,-.026,'#929b97');
    })
  ],'Watch a marked blade sweep past the stationary ring, motor housing and mounts. Rotation and blade profiles are illustrative.');
  record.viewAngle=[1.02,.87];
  record.groups[0].parts.find(p=>p.id.endsWith('.sleeves')).source=yearSource;
  return record;
}
function coreSection(){
  const y0=-.185,y1=.185,rows=[-.10,0,.10],width=.48;
  const studyCore=study('992deckcore','Charge-air cooler cross-section',
    'Compressed intake air passes along flat tubes between end tanks. Outside air crosses the fins between those tubes. The metal walls conduct heat while keeping the two streams separate.',
    coolerSource,[
    part('hot','Compressor-side end tank','The inlet collects hot air from a compressor and distributes it across parallel tubes.',[-.38,0,0],r=>{
      r.box(-.30,y0,-.125,-.243,y1,.126,'#987c65');barrel(r,[-.30,0,0],[-.39,0,0],.073,'#6f675f',18);
    }),
    part('cold','Intake-side end tank','The opposite tank gathers the cooled charge air before it continues toward the intake.',[.38,0,0],r=>{
      r.box(.243,y0,-.125,.30,y1,.126,'#718d95');barrel(r,[.30,0,0],[.39,0,0],.073,'#536b75',18);
    }),
    part('tubes','Sectioned charge-air tubes','The upper tube is shown open. An amber tracer follows the compressed air along its enclosed passage.',[0,0,.37],(r,phase)=>{
      for(const h of rows){
        r.box(-.24,y0,h-.016,.24,y1,h-.011,'#9da7aa');
        for(const y of [y0,y1-.006])r.box(-.24,y,h-.011,.24,y+.006,h+.015,'#8e999c');
        if(h<.1)r.box(-.24,y0,h+.011,.24,y1,h+.016,'#b5bcbb');
      }
      for(let i=0;i<3;i++){const x=-.211+.415*((phase+i/3)%1);barrel(r,[x-.012,-.074,.101],[x+.012,-.074,.101],.006,'#efab63',8);}
    }),
    part('fins','External cooling fins','Corrugated sheet conducts heat from the tube walls into outside air. A blue tracer crosses one fin passage.',[0,-.38,-.18],(r,phase)=>{
      for(const low of [-.084,.016]){
        for(let i=0;i<18;i++){
          const x=-.24+width*i/18,xx=x+width/18;
          const a=low+(i%2?.068:0),b=low+(i%2?0:.068);
          r.polygon([[x,y0,a],[xx,y0,b],[xx,y1,b],[x,y1,a]],i%2?'#8b9799':'#b3bdba',false);
        }
      }
      for(let i=0;i<3;i++){const y=y0+.028+.314*((phase+i/3)%1);barrel(r,[.011,y-.01,.072],[.011,y+.01,.072],.005,'#75c5d7',8);}
    })
  ],'Follow the amber charge air along a cutaway tube and the blue outside air across its fins. The section enlarges the passages for visibility.');
  studyCore.viewAngle=[.76,.50];return studyCore;
}
function coolerPair(){
  const parts=[-1,1].map(s=>part(s<0?'left':'right',(s<0?'Left':'Right')+' charge-air cooler',
    'Open this cooler to see the separate paths through its tubes and fins.',[0,s*.42,.12],r=>coolerBody(r,[0,s*.16,0],s)));
  const detail=study('992deckcoolers','Rear charge-air coolers','Two air-to-air heat exchangers sit centrally above the engine, beneath the rear grille. Each takes compressed air from one turbocharger.',coolerSource,parts);
  detail.viewAngle=[.69,.73];return detail;
}
const left=blowerStudy(-1),right=blowerStudy(1),pair=coolerPair(),section=coreSection();
const details=new Map([['engine.left-blower',left],['engine.right-blower',right],['engine.intercoolers',pair],['992deckcoolers.left',section],['992deckcoolers.right',section]]);
export function getDeckCooling(partId){return details.get(partId)||null;}
