import {glazingFace} from './surface-materials.js';
import {palette,section,part,source,slab,pane,seat,display,cylinder} from './section-primitives.js';

const whoi=source('Woods Hole Oceanographic Institution · personnel sphere and observer positions','https://www.whoi.edu/wp-content/uploads/2019/03/JOT_Article_250024.pdf');
const oocl=source('ClassNK · container stowage and securing, transverse sections','https://iims-media-library.s3.eu-west-2.amazonaws.com/wp-content/uploads/2023/09/25162929/Guidelines-for-Container-Stowage-and-Securing-Arrangements.pdf');
const tanker=source('Ship Construction · tanker cargo compartments','https://maritimesafetyinnovationlab.org/wp-content/uploads/2023/06/Ship-Construction-7th-Edition.pdf');
const arahoSource=source('National Fisherman · aboard the Araho','https://alaskaseafoodcooperative.org/wp-content/uploads/NF_May_Araho-for-Web.pdf');
const vikingSource=source('Viking Yachts · 90 Convertible interiors and open bridge','https://www.vikingyachts.com/main/90C.asp');
const pioneeringSource=source('Allseas · Pioneering Spirit deck arrangement','https://www.allseas.com/en/who-we-are/our-fleet/pioneering-spirit');
const octoSource=source('Yacht Harbour · Octopussy waterjet arrangement','https://yachtharbour.com/yacht/octopussy-982');

const portDirections=[[0,.14],[-.66,-.11],[.66,-.11],[-1.48,.09],[1.48,.09]];
function viewport(r,angle,tilt,radius) {
  const normal=[-Math.cos(angle)*Math.cos(tilt),Math.sin(angle)*Math.cos(tilt),Math.sin(tilt)];
  const u=[Math.sin(angle),Math.cos(angle),0], v=[Math.cos(angle)*Math.sin(tilt),-Math.sin(angle)*Math.sin(tilt),Math.cos(tilt)];
  const ring=(rad,distance)=>Array.from({length:28},(_,i)=>normal.map((n,k)=>n*distance+rad*(u[k]*Math.cos(Math.PI*i/14)+v[k]*Math.sin(Math.PI*i/14))+(k===2?1.12:0)));
  const outer=ring(radius,1.02),inner=ring(radius*.77,1.028);
  for(let i=0;i<28;i++)r.polygon([outer[i],outer[(i+1)%28],inner[(i+1)%28],inner[i]],'#bcb399',false);
  glazingFace(r,inner,'#85a6af',.50);
}

const sphere=section('alvin-sphere','Inside Alvin’s personnel sphere',
  'The pilot looks through the center forward port. Observers sit to either side and can look forward together or turn to their own side port. The front and near side of the titanium shell are cut away here.',whoi,[
  part('shell','Titanium shell section','The curved shell encloses the three occupants. The exposed cut edges outline a slice of the sphere.',[.22,-.43,.22],r=>{
    const point=(a,b,rad)=>[rad*Math.cos(a)*Math.cos(b),rad*Math.sin(a)*Math.cos(b),1.12+rad*Math.sin(b)];
    const retained=(i,j)=>{
      if(j<0||j>=15)return false;
      const a=-Math.PI+((i+30)%30)*2*Math.PI/30,b=-Math.PI*.5+j*Math.PI/15;
      return b<=1.14 && (b<=-.77 || (a>=-1.74&&a<=.46));
    };
    for(let i=0;i<30;i++)for(let j=0;j<15;j++){
      const a=-Math.PI+i*2*Math.PI/30,b=-Math.PI*.5+j*Math.PI/15;
      // Retain the aft/far arc and a shallow bottom cap. The hatch has a true aperture.
      if(!retained(i,j))continue;
      const step=2*Math.PI/30, lat=Math.PI/15;
      const face=(rad)=>[point(a,b,rad),point(a+step,b,rad),point(a+step,b+lat,rad),point(a,b+lat,rad)];
      const outside=face(1.06),inside=face(.99);
      r.polygon(outside,'#a7b9bc',false);r.polygon([...inside].reverse(),'#77878a',false);
      for(const [a,b,di,dj] of [[0,1,0,-1],[1,2,1,0],[2,3,0,1],[3,0,-1,0]]){
        if(!retained(i+di,j+dj)&&j+dj>=0)r.polygon([outside[a],outside[b],inside[b],inside[a]],'#a6b7b7',false);
      }
    }
  }),
  ...portDirections.map(([a,b],i)=>part('viewport-'+(i+1),['Pilot’s forward viewport','Port forward viewport','Starboard forward viewport','Port side viewport','Starboard side viewport'][i],
    i===0?'The pilot’s front window lies between the two forward observer windows.':'A clear acrylic viewport gives the observer a direct view of the water.',[-Math.cos(a)*.56,Math.sin(a)*.56,.12],r=>viewport(r,a,b,i<3?.205:.16))),
  part('hatch','Upper access hatch','The crew enters the sphere through the round opening at the top.',[0,0,.59],r=>{
    cylinder(r,[0,0],.30,2.05,2.13,'#c3beb0');
    r.rod([-.12,0,2.13],[-.12,0,2.20],.022,palette.dark,10);r.rod([-.12,0,2.20],[.12,0,2.20],.023,palette.dark,10);r.rod([.12,0,2.20],[.12,0,2.13],.022,palette.dark,10);
  }),
  part('stations','Pilot and observer positions','The low cushions mark where the pilot and observers work with their eyes near the viewports.',[.18,.26,-.37],r=>{
    slab(r,-.10,0,.35,.65,.39,.095,'#627a86');
    for(const s of [-1,1])slab(r,.10,s*.48,.41,.73,.35,.085,'#68848c');
  }),
  part('displays','Observation displays','Camera displays supplement what the scientists see through the acrylic.',[.43,0,.40],r=>{
    for(const y of [-.49,0,.49])display(r,-.45,y,1.16,.30,.21);
  })
]);

sphere.viewAngle=[-.54,.31];

const containerSection=section('container-bay','A container hold in section',
  'Follow one bay down from the deck into the cargo hold. The vertical guides keep the corners of adjacent containers lined up. Only one transverse slice of the ship is shown.',oocl,[
  part('hull','Hold sides and bottom','The hold opens onto a floor between the two side structures.',[0,0,-.49],r=>{
    r.box(-.91,-1.38,.04,.91,1.38,.12,'#4f6971');
    for(const s of [-1,1])r.box(-.91,s*1.31-.07,.12,.91,s*1.31+.07,1.35,'#739096');
  }),
  part('guides','Vertical cell guides','Guides run down beside the container corners and leave the top of each cell open.',[.22,-.45,.22],r=>{
    for(const x of [-.81,.81])for(const y of [-1.20,-.40,.40,1.20])r.rod([x,y,.12],[x,y,1.32],.019,'#a6b5b4',7);
  }),
  ...[-1,0,1].map((c)=>part('stack-'+(c+2),['Port container stack','Center container stack','Starboard container stack'][c+1],
    'The containers in this stack occupy the same cell, one above another.',[c*.17,c*.48,.25],r=>{
      for(let i=0;i<2;i++){
        const y=c*.80,z=.14+i*.37,colors=['#866c54','#5a8185','#91725b'];
        r.box(-.78,y-.37,z,.78,y+.37,z+.34,colors[(c+i+1)%3]);
        for(let j=0;j<11;j++)r.box(-.73+j*.14,y+.372,z+.015,-.714+j*.14,y+.38,z+.32,'#657779');
        for(const q of [-.24,.24])r.rod([.789,y+q,z+.02],[.789,y+q,z+.31],.009,palette.frame,6);
      }
    })),
  part('cover','Hatch cover','A removable cover closes the top of the hold. This cutaway shows a short end of the cover so the cells remain visible.',[0,0,.60],r=>{
    r.box(.68,-1.37,1.35,.92,1.37,1.40,'#84938c');
    for(const y of [-.93,-.46,0,.46,.93])r.box(.68,y-.025,1.30,.92,y+.025,1.35,'#647877');
  })
]);

const tankerSection=section('tanker-bay','Oil tanker cargo section',
  'Longitudinal bulkheads form a center tank and wing tanks. Transverse bulkheads separate successive sections along the hull. This is a representative single-hull tanker section from the period.',tanker,[
  part('bottom','Hull bottom and sides','The outside shell turns up at both sides of the cargo space.',[0,0,-.41],r=>{
    r.box(-.92,-1.22,.035,.92,1.22,.12,'#8f645a');
    for(const y of [-1.19,1.19])r.box(-.92,y-.05,.12,.92,y+.05,1.04,'#966c60');
  }),
  ...[-1,1].map(s=>part(s<0?'port-bulkhead':'starboard-bulkhead',s<0?'Port longitudinal bulkhead':'Starboard longitudinal bulkhead',
    'This longitudinal wall divides a wing tank from the middle cargo compartment.',[0,s*.43,.25],r=>{
      const y=s*.58;r.box(-.89,y-.023,.12,.89,y+.023,1.04,'#a67862');
      for(const x of [-.74,-.36,.02,.40,.78])r.box(x,y-.04,.12,x+.045,y+.04,.96,'#bc977d');
    })),
  part('crosswall','Transverse bulkhead','An athwartships partition closes off the adjacent cargo tanks at one end.',[.51,0,.15],r=>r.box(.87,-1.15,.12,.94,1.15,1.02,'#98745e')),
  part('deck','Deck and longitudinal piping','A narrow deck slice shows the pipe runs above the cargo spaces.',[-.37,0,.57],r=>{
    r.box(-.94,-1.24,1.04,-.69,1.24,1.10,'#a2775c');
    for(const y of [-.20,0,.20])r.rod([-.91,y,1.16],[.88,y,1.16],.042,'#9ba6a3',12);
  })
]);

const fishFactory=section('araho-factory','Araho’s factory deck',
  'Fish from the stern working deck pass through grading and processing, then packing and freezing. The stations follow the vessel’s documented workflow. Their spacing is illustrative.',arahoSource,[
  part('floor','Enclosed factory deck','The deck supports the processing line and leaves room for the crew along it.',[0,0,-.41],r=>slab(r,0,0,.065,2.84,1.42,.083,'#79918d')),
  part('conveyor','Transfer conveyor','Conveyors move the catch between workstations.',[-.51,-.23,.22],r=>{
    r.box(-1.19,-.56,.34,.13,-.18,.40,'#586c70');
    for(let j=0;j<13;j++)r.tubeY(-1.15+j*.101,-.55,-.19,.426,.031,palette.frame,10);
    for(const x of [-1.1,-.1])r.box(x,-.52,.15,x+.04,-.23,.34,palette.frame);
  }),
  part('grader','Grading station','The grader separates incoming fish before the next stage.',[-.16,.38,.25],r=>{
    r.box(-1.04,.02,.22,-.58,.53,.68,'#9faaa4');slab(r,-.81,.27,.68,.61,.63,.045,'#c5ccbf');
    for(const y of [.14,.25,.36])r.rod([-.99,y,.75],[-.62,y,.69],.018,'#627d76',8);
  }),
  part('packing','Packing table','Packed blocks travel onward to the freezer and storage hold.',[.08,.48,.20],r=>{
    for(const x of [.04,.49])for(const y of [.06,.43])r.rod([x,y,.15],[x,y,.51],.019,palette.frame,8);
    slab(r,.27,.24,.51,.62,.50,.04,'#c6ceca');
  }),
  part('freezer','Freezing station','The freezing system preserves the catch aboard the trawler.',[.52,0,.22],r=>{
    r.box(.50,-.52,.15,1.27,-.05,.78,'#839697');
    for(let i=0;i<6;i++)r.box(.53,-.035,.22+i*.082,1.24,.003,.24+i*.082,palette.frame);
  }),
  part('hold','Frozen cargo stowage','The freezer hold stores packed product for the voyage home.',[.50,.46,-.28],r=>{
    for(let i=0;i<3;i++)for(let j=0;j<2;j++)r.box(.68+i*.19,.13,.15+j*.13,.85+i*.19,.48,.27+j*.13,'#b3aa8a');
  })
]);

function bridge(id,title,ref,isOpen){
  return section(id,title,isOpen?'The open flybridge puts the helm on the centerline. Three teak-backed chairs sit on a raised platform behind the console, which carries four displays.':
    'The forward windows and the wing platforms set the sightlines from the bridge. Consoles and seating show the arrangement of a working bridge schematically.',ref,[
    part('floor',isOpen?'Flybridge sole':'Bridge deck','The walking surface runs past both sides of the helm.',[0,0,-.42],r=>slab(r,0,0,.045,2.18,isOpen?1.46:2.5,.11,isOpen?'#ad9c82':'#6d7f81')),
    part('windows',isOpen?'Wind deflector':'Bridge windows',isOpen?'A short screen stands ahead of the console.':'Angled glazing leaves a broad view ahead. The near side is open in this cutaway.',[-.44,0,.35],r=>{
      const w=isOpen?.72:1.22;for(let i=0;i<5;i++){const y=-w+i*2*w/5,h=isOpen?.51:.98;pane(r,[[-.99,y,.28],[-.99,y+2*w/5-.02,.28],[-.91,y+2*w/5-.02,h],[-.91,y,h]]);}
    }),
    part('console','Helm console','Displays are grouped in a low console that leaves the windows clear above.',[-.19,0,.32],r=>{
      r.profile([[-.62,.15],[-.28,.15],[-.24,.52],[-.53,.61],[-.66,.49]],-.48,.48,palette.dark);
      const n=isOpen?4:3;for(let i=0;i<n;i++)display(r,-.26,(i-(n-1)/2)*.86/n,.50,.78/n,.18);
    }),
    part('chair',isOpen?'Three helm chairs':'Watch station',isOpen?'Three chairs stand side by side on a raised platform aft of the console. Each has a teak ladder back.':'The seat places the operator above the surrounding deck.',[.46,0,.18],r=>{
      if(!isOpen){seat(r,.12,0,.16,.46,.72,'#64818c');return;}
      slab(r,.19,0,.155,.61,1.36,.07,'#a0957d');
      for(const y of [-.43,0,.43]){
        r.rod([.19,y,.225],[.19,y,.43],.032,palette.frame,12);
        slab(r,.17,y,.427,.33,.35,.061,'#caba9c');
        for(const side of [-1,1])r.rod([.30,y+side*.135,.47],[.34,y+side*.135,.77],.016,'#936e48',8);
        for(let i=0;i<3;i++){const z=.55+i*.085;slab(r,.319+i*.009,y,z,.04,.29,.036,'#ae885b',.008);}
      }
    }),
    part('outer',isOpen?'Hardtop and posts':'Bridge wings',isOpen?'Four thin supports carry the hardtop above the helm.':'Platforms extend beyond the enclosed bridge on either side.',[0,0,.67],r=>{
      if(isOpen){for(const x of [-.69,.71])for(const y of [-.63,.63])r.rod([x,y,.15],[x+.045,y,1.21],.023,palette.frame,10);slab(r,.02,0,1.21,1.89,1.53,.045,palette.light);}
      else for(const s of [-1,1]){slab(r,0,s*1.42,.10,.85,.40,.06,palette.frame);r.rod([-.38,s*1.59,.17],[-.38,s*1.59,.51],.015,palette.frame,8);r.rod([.38,s*1.59,.17],[.38,s*1.59,.51],.015,palette.frame,8);r.rod([-.38,s*1.59,.51],[.38,s*1.59,.51],.014,palette.frame,8);}
    })
  ]);
}

const azzam=section('azzam-saloon','Azzam’s open saloon',
  'The published main saloon measures about 29 by 18 metres. The room spans the beam without an interior support column. This architectural cutaway shows the clear span and leaves the private furnishings unspecified.',
  source('Motor Boat & Yachting · dimensions and clear span','https://www.mby.com/news/lurssen-launches-azzam-the-worlds-largest-superyacht-3643'),[
  part('sole','Clear-span floor','The floor stretches from one side of the room to the other.',[0,0,-.46],r=>slab(r,0,0,.06,2.90,1.80,.09,'#a48866')),
  ...[-1,1].map(s=>part(s<0?'port':'starboard',s<0?'Port perimeter':'Starboard perimeter','The long sides enclose the saloon. Window divisions in this cutaway are schematic.',[0,s*.47,.03],r=>{
    r.box(-1.42,s*.88-.025,.15,1.42,s*.88+.025,.29,'#d5c8a8');
    for(let i=0;i<6;i++){const x=-1.41+i*.47;pane(r,[[x,s*.88,.30],[x+.43,s*.88,.30],[x+.43,s*.88,.61],[x,s*.88,.61]]);}
  })),
  part('overhead','Overhead span','A slice of ceiling spans the room with no column in the middle of the floor.',[.18,0,.66],r=>slab(r,.99,0,.625,.82,1.82,.06,'#e4dfce')),
]);

const octoJets=section('octopussy-jets','Three waterjet outlets',
  'Look at the stern from outside. The three drives discharge water aft through separate outlets. The central outlet is on the centerline between the port and starboard units.',octoSource,[
  part('transom','Transom section','A schematic slice of the stern places the three outlets side by side.',[-.42,0,.14],r=>r.box(-.51,-1.13,.23,-.42,1.13,.93,'#d9dbd1')),
  ...[-1,0,1].map((c,i)=>part('jet-'+i,['Port outlet','Center outlet','Starboard outlet'][i],'The nozzle opens toward the stern.',[.36,c*.49,.12],r=>{
    const y=c*.70;for(let n=0;n<24;n++){const a=n*Math.PI/12,b=(n+1)*Math.PI/12;
      const p=(x,t,rad)=>[x,y+Math.cos(t)*rad,.57+Math.sin(t)*rad];
      r.polygon([p(-.42,a,.28),p(-.42,b,.28),p(.36,b,.23),p(.36,a,.23)],n<12?'#899696':'#626d70',false);
      r.polygon([p(.36,a,.23),p(.36,b,.23),p(.36,b,.17),p(.36,a,.17)],'#bcc3c0',false);
      r.polygon([p(.36,a,.17),p(.36,b,.17),p(-.39,b,.15),p(-.39,a,.15)],'#3c5156',false);
    }
  }))
]);

containerSection.viewAngle=[-.60,.53];
tankerSection.viewAngle=[-.60,.53];
fishFactory.viewAngle=[.51,.54];

const bridges={
 pioneeringspirit:bridge('pioneering-bridge','Pioneering Spirit bridge deck',pioneeringSource,false),
 viking90:bridge('viking-flybridge','Viking 90 open flybridge',vikingSource,true)
};
export const marineSections={
  pioneeringspirit:{'bridge.wing':bridges.pioneeringspirit,'bridge.quarters':bridges.pioneeringspirit},
  seawisegiant:{'hull.shell':tankerSection,'cargo.pipes':tankerSection,'cargo.manifold':tankerSection},
  ooclspain:{'hull.shell':containerSection,'cargo.fore':containerSection,'cargo.mid':containerSection,'cargo.aft':containerSection},
  azzam:{'decks.main':azzam},octopussy:{'hull.jets':octoJets},
  araho:{'house.factory':fishFactory,'hull.shell':fishFactory},viking90:{'bridge.helm':bridges.viking90,'bridge.tower':bridges.viking90},
  alvin:{'crew.sphere':sphere,'crew.ports':sphere,'crew.sail':sphere},
};
