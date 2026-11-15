import {lycomingEngine,continentalEngine} from './air-pistons.js';
import {cf6,cf6Fan,pearl700,pearlFan} from './air-turbofans.js';
import {skyPropeller,cubPropeller} from './air-propellers.js';
import {jumboWindshield,skyhawkWindow} from './air-window-sections.js';
import {palette,section,part,source,slab,pane,seat,display,ovalPane,rowFrame} from './section-primitives.js';

const boeingPhoto=source('Boeing · 747-400 flight deck photograph','https://secure.boeingimages.com/archive/747-400-Flight-Deck-2F3XC5STXWC.html');
const boeingCabin=source('Lufthansa · 747-400 main and upper deck seat maps','https://www.lufthansa.com/by/en/744');
const gulf=source('Gulfstream · G800 cabin layouts and photographs','https://www.gulfstream.com/en/aircraft/gulfstream-g800/');
const sky=source('Cessna · 172S instrument panel, NTSB docket','https://data.ntsb.gov/Docket/Document/docBLOB?ID=40362299&FileExtension=.PDF&FileName=Excerpts+from+Cessna+Model+172S+Manual+%28Section+7%3A+Airplane+and+Systems+Descriptions%29-Master.PDF');
const cub=source('Western Antique Aeroplane & Automobile Museum · J-5A cabin and seating','https://www.waaamuseum.org/collections/airplanes/659-piper-j-5a-cub-coupe');

function yoke(r,x,y,z){
  r.rod([x-.14,y,z-.10],[x,y,z],.025,palette.rubber,12);
  for(const side of [-1,1]){
    const elbow=[x+.016,y+side*.09,z-.025];
    r.rod([x,y,z],elbow,.019,palette.rubber,9);
    r.rod(elbow,[x+.02,y+side*.108,z+.06],.019,palette.rubber,9);
  }
}

function flightDeck(isJumbo) {
  const id=isJumbo?'jumbo-flight-deck':'g800-flight-deck', w=isJumbo?.92:.82;
  return section(id,isJumbo?'747-400 flight deck':'G800 flight deck',
    isJumbo?'On the upper deck, the captain sits on the left and the first officer on the right. The instrument panel spans both stations. A central pedestal runs between the seats.':
    'Two pilot stations sit forward of the galley. The large flight displays fill a continuous panel ahead of the seats. This open study follows the arrangement of the Symmetry Flight Deck.',
    isJumbo?boeingPhoto:source('Gulfstream · G800 flight deck','https://www.gulfstream.com/en/aircraft/gulfstream-g800/'),[
    part('floor','Floor and seat rails','Two pairs of fore-and-aft rails support the crew seats.',[0,0,-.45],r=>{
      slab(r,0,0,.04,2.00,w*2,.09,palette.floor,.16);
      for(const s of [-1,1])for(const d of [-.1,.1])r.box(-.14,s*w*.54+d-.02,.135,.74,s*w*.54+d+.02,.163,palette.frame);
    }),
    ...[-1,1].map(s=>part(s<0?'captain':'first-officer',s<0?'Captain’s seat':'First officer’s seat','An adjustable seat faces the instrument panel and the windshield.',[.22,s*.52,.25],r=>seat(r,.39,s*w*.54,.162,.46,.77,isJumbo?'#8d7765':'#756f65'))),
    part('windscreen','Windshield and posts',isJumbo?'The two main windshields meet over the center panel. Two more panes follow each cabin side. Open a main windshield to inspect its glass plies.':'Two main windshields meet in front of the pilots. Broad side windows wrap around the cabin.',[-.42,0,.59],r=>{
      for(const s of [-1,1]){
        pane(r,[[-.90,s*.02,.68],[-.73,s*w*.82,.67],[-.48,s*w*.70,1.12],[-.69,s*.02,1.17]]);
        if(isJumbo){
          pane(r,[[-.70,s*w*.84,.66],[-.23,s*w,.63],[-.10,s*w*.955,1.03],[-.455,s*w*.72,1.13]]);
          pane(r,[[-.21,s*w,.635],[.10,s*w,.66],[.173,s*w*.955,.983],[-.084,s*w*.953,1.02]]);
        }else pane(r,[[-.70,s*w*.84,.66],[-.12,s*w,.61],[.05,s*w*.92,1.01],[-.455,s*w*.72,1.13]]);
      }
    }),
    part('instruments','Main instrument panel','Displays are arranged across the glareshield, within sight of both pilots.',[-.30,0,.22],r=>{
      r.box(-.79,-w*.94,.24,-.62,w*.94,.63,palette.dark);
      const n=isJumbo?6:4;for(let i=0;i<n;i++)display(r,-.61,(-.5+(i+.5)/n)*w*1.77,.34,w*1.61/n,.24);
      slab(r,-.67,0,.635,.31,w*1.91,.05,'#4f5957');
    }),
    part('controls',isJumbo?'Control columns':'Side-stick controls',isJumbo?'Each pilot has a wheel on a control column ahead of the seat.':'The controls sit outboard of the pilot seats, leaving the space in front open.',[0,-.44,.40],r=>{
      for(const s of [-1,1]){
        if(isJumbo){r.rod([-.16,s*w*.54,.15],[-.29,s*w*.54,.53],.028,palette.dark,10);yoke(r,-.22,s*w*.54,.58);}
        else{const y=s*w*.88;r.box(.10,y-.05,.16,.48,y+.05,.39,palette.dark);r.rod([.18,y,.39],[.15,y,.54],.027,palette.rubber,12);}
      }
    }),
    part('pedestal','Center pedestal','A separate console fills the space between the seated pilots.',[.22,0,.55],r=>{
      slab(r,-.01,0,.14,1.14,.31,.22,'#546264');
      for(let i=0;i<3;i++)r.box(-.45+i*.16,-.117,.362,-.34+i*.16,.117,.38,'#2c474f');
      for(let i=0;i<(isJumbo?4:2);i++){const y=(i-(isJumbo?1.5:.5))*.045;r.rod([-.09,y,.38],[-.13,y,.51],.014,palette.frame,9);r.tubeY(-.13,y-.019,y+.019,.51,.026,palette.rubber,12);}
    })
  ]);
}

const jumboCabin=section('jumbo-cabin','747-400 passenger decks',
  'Two short seating sections show the difference in cross-section. The main deck has two aisles. Upstairs, a single aisle separates the seats. Row counts are shortened for this view.',boeingCabin,[
  part('main-floor','Main cabin floor','A broad level deck carries the two aisles and the seat tracks.',[0,0,-.44],r=>slab(r,0,0,.05,2.38,2.65,.075,'#646e79')),
  ...[['port','Port seat block',[-1.18,-.99,-.80]],['center','Center seat block',[-.29,-.095,.095,.29]],['starboard','Starboard seat block',[.80,.99,1.18]]].map(([id,label,positions],i)=>
    part(id,label,'This main-deck economy section has three seats, four seats, then three seats across the two aisles.',[.10,(i-1)*.50,.13],r=>{
      for(const x of [-.78,-.25,.28,.81])for(const y of positions)seat(r,x,y,.125,.18,.40,'#57728b');
    })),
  part('upper-floor','Upper deck floor','The upstairs floor spans the narrower upper fuselage.',[0,0,.66],r=>slab(r,-.07,0,.83,2.03,1.48,.065,'#989993')),
  ...[-1,1].map(s=>part(s<0?'upper-port':'upper-starboard',s<0?'Upper port seats':'Upper starboard seats','Pairs of wider seats face forward on either side of the upper aisle.',[.12,s*.56,.87],r=>{
    for(const x of [-.55,.08,.71])for(const y of [.30,.56])seat(r,x,s*y,.897,.225,.43,'#8e7d69');
  })),
  part('frames','Cutaway cabin frames','Two transverse outlines show how the double-deck section narrows toward its roof.',[.39,0,.72],r=>{
    for(const x of [-1.12,1.09])rowFrame(r,x,1.35,1.48,.12);
  })
]);

function lightCabin(isCub){
  const ref=isCub?cub:sky;
  return section(isCub?'cub-cabin':'skyhawk-cabin',isCub?'J-5A three-seat cabin':'Skyhawk cabin',
    isCub?'The pilot sits alone in front. The fuselage widens behind the pilot to fit two passengers side by side on a common back seat.':
    'Two front seats face the instrument panel. Two more places fit behind them under the high wing. The early 172S instrument panel has round gauges and a center radio stack.',ref,[
    part('floor','Cabin floor','The cutaway leaves the floor and bases of the seats in view.',[0,0,-.40],r=>slab(r,0,0,.04,2.18,isCub?1.30:1.44,.09,'#717977')),
    ...(!isCub?[
      part('carpet','Fitted cabin carpet','The carpet follows the cabin floor and leaves the silver seat tracks exposed. Blue-grey trim represents one possible interior finish.',[-.12,-.25,-.29],r=>{
        const tracks=[-.49,-.212,.212,.49],edges=[-.688,...tracks,.688];
        for(let i=1;i<edges.length;i++){
          const left=edges[i-1]+.012,right=edges[i]-.012;
          slab(r,-.27,(left+right)/2,.137,1.55,right-left,.015,'#657681',.012);
        }
        slab(r,.77,0,.137,.49,1.348,.015,'#657681',.022);
        for(const y of tracks)r.box(-.84,y-.009,.127,.42,y+.009,.150,'#a2a9a3');
      })
    ]:[]),
    part('front',isCub?'Pilot’s front seat':'Front seats',isCub?'The single front seat sits on the centerline.':'The two seats slide on separate tracks.',[-.23,0,.27],r=>{
      for(const y of isCub?[0]:[-.35,.35])seat(r,-.25,y,.13,isCub?.54:.52,.71,isCub?'#64594a':'#71818a');
    }),
    part('rear','Rear seat','The rear bench accommodates two people and spans the back of the cabin.',[.47,0,.26],r=>{
      slab(r,.56,0,.27,.50,1.07,.11,isCub?'#6c5a48':'#71818a');
      r.profile([[.76,.35],[.83,.35],[.93,.88],[.84,.88]],-.54,.54,isCub?'#6c5a48':'#71818a');
      for(const y of [-.27,.27])r.rod([.48,y,.13],[.48,y,.27],.056,palette.frame,10);
    }),
    part('panel','Instrument panel',isCub?'Round instruments are clustered in front of the pilot.':'Round flight instruments sit to the pilot’s left of a vertical radio stack.',[-.49,0,.27],r=>{
      r.box(-1.03,-.54,.30,-.91,.54,.70,'#46525a');
      if(isCub){for(const [y,z] of [[-.18,.55],[0,.57],[.18,.55],[-.08,.39],[.13,.39]]){
        r.discX(-.907,y,z,.072,palette.frame,18);r.discX(-.902,y,z,.060,palette.rubber,18);r.rod([-.895,y,z],[-.895,y+.034,z+.017],.006,palette.light,6);
      }}
      else{
        for(const y of [-.44,-.295,-.15])for(const z of [.425,.578]){
          r.discX(-.906,y,z,.065,palette.frame,20);r.discX(-.903,y,z,.055,'#283d46',20);
          r.rod([-.898,y,z],[-.898,y+.021,z+.036],.005,palette.light,6);
        }
        for(const z of [.43,.505,.58])display(r,-.872,.032,z,.164,.054);
        for(const y of [.22,.365])r.discX(-.903,y,.55,.057,palette.rubber,16);
      }
    }),
    part('controls',isCub?'Center control stick':'Control wheels',isCub?'A stick rises from the floor in front of the single pilot seat.':'A control wheel in front of either seat leaves the central aisle clear.',[-.24,-.53,.27],r=>{
      if(isCub){r.rod([-.60,0,.14],[-.56,0,.50],.021,palette.frame,12);r.rod([-.56,0,.49],[-.54,0,.59],.03,palette.rubber,12);}
      else for(const y of [-.31,.31])yoke(r,-.70,y,.52);
    }),
    part('frames','Windscreen and far-side windows','The near cabin side is open so the seat arrangement and controls stay visible.',[-.13,-.40,.67],r=>{
      const w=isCub?.61:.69,roof=isCub?.96:1.05;
      for(const s of [-1,1])pane(r,[[-1.06,s*.01,.67],[-.91,s*w,.64],[-.60,s*w*.93,roof],[-.63,s*.01,roof+.04]]);
      pane(r,[[-.88,-w,.58],[.05,-w,.57],[.04,-w,roof],[-.58,-w,roof]]);
      pane(r,[[.12,-w,.57],[.82,-w*.92,.59],[.66,-w*.94,roof-.06],[.12,-w,roof]]);
    })
  ]);
}

const gCabin=section('g800-cabin','G800 cabin section',
  'This section shows the club-seating arrangement and the panoramic ovals in one living area. The G800 can have three living areas and a dedicated crew compartment or four living areas.',gulf,[
  part('floor','Cabin floor','A clear center aisle runs between the seating groups.',[0,0,-.42],r=>slab(r,0,0,.05,2.6,1.65,.10,'#ae9c85')),
  ...[-1,1].map(s=>part(s<0?'port':'starboard',s<0?'Port club seats':'Starboard club seats','A pair of facing chairs makes a small conversation area at the window.',[.10,s*.55,.18],r=>{
    seat(r,-.66,s*.48,.15,.53,.73,'#bfab8a',true);seat(r,.67,s*.48,.15,.53,.73,'#bfab8a');
  })),
  part('windows','Panoramic window section','The near wall is cut away. Three far-side oval windows show the scale of the windows beside the seats.',[0,-.52,.49],r=>{
    for(const x of [-.87,0,.87])ovalPane(r,x,-.82,.69,.29,.22);for(const x of [-1.27,1.27])rowFrame(r,x,.84,1.18,.15);
  }),
  part('lining','Cabin sidewall lining','The cut edge of the far sidewall follows the three oval window openings. A ledge runs below them at seat height.',[.10,-.47,.18],r=>{
    const panel='#d1c6b2';
    for(const cx of [-.87,0,.87]){
      const y=-.837;
      for(let i=0;i<28;i++){
        const a=i*Math.PI/14,b=(i+1)*Math.PI/14;
        const p=[cx+.30*Math.cos(a),y,.69+.226*Math.sin(a)],q=[cx+.30*Math.cos(b),y,.69+.226*Math.sin(b)];
        const boundary=t=>{const dx=.30*Math.cos(t),dz=.226*Math.sin(t),scale=Math.min(.435/Math.max(.00001,Math.abs(dx)),(dz>=0?.39:.49)/Math.max(.00001,Math.abs(dz)));
          return [cx+dx*scale,y,.69+dz*scale];};
        r.polygon([p,q,boundary(b),boundary(a)],panel,false);
      }
    }
    slab(r,0,-.78,.32,2.56,.14,.058,'#b7a88e');
  }),
  part('table','Club table','A table between the facing seats projects inward from the sidewall.',[.28,.15,.58],r=>{
    for(const s of [-1,1]){slab(r,0,s*.48,.47,.37,.52,.045,'#947352');r.rod([0,s*.68,.16],[0,s*.68,.47],.044,palette.frame,12);}
  })
]);

const jumboFlight=flightDeck(true),gulfFlight=flightDeck(false),piperInterior=lightCabin(true),cessnaInterior=lightCabin(false);
for(const study of [jumboFlight,gulfFlight,piperInterior,cessnaInterior])study.viewAngle=[.66,.36];
jumboCabin.viewAngle=[-.55,.32];gCabin.viewAngle=[.63,.43];

const mapRoutes=(ids,study)=>Object.fromEntries(ids.map(id=>[id,study]));
const propIds=['propeller.hub','propeller.blade1','propeller.blade2'];
export const civilSections={
  boeing747:{...mapRoutes(['engines.port-inboard','engines.port-outboard','engines.starboard-inboard','engines.starboard-outboard'],cf6),'cf6_80c2.fan':cf6Fan,'jumbo_flight_deck.windscreen':jumboWindshield,'fuselage.shell':jumboCabin,'fuselage.cabin':jumboCabin,'fuselage.cockpit':jumboFlight},
  cessna172:{'engine.cowling':lycomingEngine,'io360.propeller':skyPropeller,...mapRoutes(propIds,skyPropeller),'skyhawk_cabin.frames':skyhawkWindow,'cabin.shell':cessnaInterior,'cabin.glazing':cessnaInterior},
  piperj5:{'engine.cowling':continentalEngine,'a75.propeller':cubPropeller,...mapRoutes(propIds,cubPropeller),'cabin.shell':piperInterior,'cabin.glazing':piperInterior},
  gulfstreamg800:{...mapRoutes(['engines.port','engines.starboard'],pearl700),'pearl_700.fan':pearlFan,'fuselage.shell':gCabin,'fuselage.windows':gCabin,'fuselage.cockpit':gulfFlight},
};
