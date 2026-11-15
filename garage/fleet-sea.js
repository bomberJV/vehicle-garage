import {getMarinePropulsionGroup} from './marine-propulsion.js';
import {WHITE,METAL,GLASS,sides,tint,quad,tube,ellipsoid,hull,house,deckRail,mast,helipad,propeller,nozzle} from './sea-geometry.js';

function group(id,name,description,components) {
  return {id,name,description,parts:components.map(([key,name,description,offset,draw])=>({id:id+'.'+key,name,description,offset,draw}))};
}
function vessel(info,groups) {
  groups = [...groups,getMarinePropulsionGroup(info.id)];
  return {...info,domain:'Sea',groups,draw(r){for(const g of groups)for(const p of g.parts)r.tag(p.id,()=>p.draw(r));}};
}
const ref=(label,url)=>({label,url});
const pioneering=vessel({
  id:'pioneeringspirit',name:'Pioneering Spirit',short:'Pioneering Spirit',year:2016,type:'Ships',
  detail:'Two bows approach an offshore platform on either side. A row of lifting beams on each bow picks up the topsides. Guinness lists it as the largest ship by gross tonnage, a measure of enclosed volume.',
  source:ref('Allseas · vessel and lifting systems','https://www.allseas.com/en/who-we-are/our-fleet/pioneering-spirit'),
  sources:[ref('Guinness · gross-tonnage record','https://www.guinnessworldrecords.com/world-records/736425-largest-ship-gross-tonnage'),ref('Allseas · dimensions and plan','https://www.allseas.com/sites/d10p.allseas.com/files/2024-12/Pioneering%20Spirit%20vessel%20specs.pdf')],
  specs:[['Hull length','382 m'],['Beam','124 m'],['Bow slot','122 × 59 m'],['Gross tonnage','403,342 GT']]
},[
  group('hull','Twin hull and deck','The working deck spans the two hulls aft of the open slot.',[
    ...sides.map((sign,i)=>[i?'starboard':'port',i?'Starboard bow and hull':'Port bow and hull','One side of the deep slot that receives an offshore platform.',[0,sign*.38,0],r=>hull(r,[
      [-2.5,.105,.42,.12],[-2.40,.198,.44,.035],[-1.95,.212,.44,.025],[-.88,.214,.44,.025],[1.97,.214,.44,.025],[2.46,.196,.44,.055],[2.5,.172,.44,.11]],
      {side:'#184b79',bottom:'#94534d',deck:'#687b86',center:sign*.598,chine:.95})]),
    ['crossdeck','Cross-deck','A broad deck joins the hulls behind the bow slot.',[0,0,.32],r=>{
      r.box(-.895,-.394,.12,2.492,.394,.439,'#496476');
      for(let x=-.7;x<2.48;x+=.28){for(const s of sides)r.box(x,s*.76-.014,.442,x+.052,s*.76+.014,.465,'#b96a50');}
    }]
  ]),
  group('lifting','Offshore lifting gear','Two different lifting systems work from opposite ends of the ship.',[
    ...sides.map((s,i)=>[i?'rightbeams':'leftbeams',i?'Starboard topsides beams':'Port topsides beams','Eight horizontal beams along this side slide across the bow slot.',[0,s*.42,.16],r=>{
      for(let j=0;j<8;j++){const x=-2.38+j*.191;
        r.box(x-.060,Math.min(s*.78,s*.39),.447,x+.062,Math.max(s*.78,s*.39),.53,'#637b86');
        r.box(x-.047,Math.min(s*.75,s*.27),.535,x+.047,Math.max(s*.75,s*.27),.603,'#85949b');
        r.box(x-.043,Math.min(s*.28,s*.21),.56,x+.043,Math.max(s*.28,s*.21),.62,'#d69846');
        for(const dx of [-.028,.028])tube(r,[x+dx,s*.70,.61],[x+dx,s*.29,.61],.008,'#a5b4b6',6);}
    }]),
    ['jacket','Stern lifting frames','The tall frames at the stern handle the lattice support beneath a platform.',[.48,0,.17],r=>{
      for(const s of sides){const a=[1.26,s*.57,.45],b=[2.27,s*.55,1.15],c=[2.33,s*.70,.46];
        tube(r,a,b,.055,'#c3ad69');tube(r,b,c,.052,'#bca360');tube(r,[1.25,s*.42,.47],[2.27,s*.55,1.15],.024,'#8495a0');
        for(let j=1;j<5;j++){const t=j/5;tube(r,[1.26+t,s*.57,.46+t*.70],[1.26+t+.08,s*.48,.46+t*.61],.014,METAL);}
      }
    }],
    ['crane','Lattice crane','An angled lattice boom stands on a rotating pedestal beside the work deck.',[.1,.4,.38],r=>{
      const x=.65,y=.53;tube(r,[x,y,.45],[x,y,.64],.103,'#b5c7bf',16);
      const ends=[[[x-.095,y-.06,.62],[-.03,y-.02,1.35]],[[x+.08,y-.06,.62],[.015,y-.02,1.37]],[[x+.08,y+.07,.62],[.015,y+.03,1.37]]];
      for(const [a,b] of ends)tube(r,a,b,.015,'#c9bd77',8);
      const interp=([a,b],t)=>a.map((v,j)=>v+(b[j]-v)*t);
      for(let k=0;k<7;k++)tube(r,interp(ends[k%2],k/7),interp(ends[(k+1)%2],(k+1)/7),.008,'#b9ac65',6);
      tube(r,[.00,y,1.33],[.00,y,.89],.006,'#7a8585',6);
    }]
  ]),
  group('bridge','Bridge and living quarters','The white accommodation block rises above the working deck.',[
    ['quarters','Accommodation block','Stacked decks house the crew and project teams.',[0,-.32,.20],r=>{
      for(let j=0;j<4;j++)house(r,{x0:-.85+j*.011,x1:-.22-j*.02,y:0,w:.41-j*.012,z:.44+j*.095,h:.095,rake:.01,rear:.01});
    }],
    ['wing','Navigation bridge','The bridge wings give a view along both working bows.',[-.3,0,.32],r=>{
      house(r,{x0:-.84,x1:-.25,w:.49,z:.82,h:.13,rake:.035});
      mast(r,-.34,0,.95,.22);
    }],
    ['landing','Helicopter deck','The landing deck projects clear of the upper accommodation block.',[0,.30,.6],r=>{tube(r,[-.62,.29,.82],[-.62,.38,1],.065,'#82908d');helipad(r,-.62,.41,1.00,.245);}]
  ])
]);

const merchantStations=[[-2.5,.009,.44,.24],[-2.42,.085,.445,.10],[-2.23,.21,.425,.03],[-1.93,.325,.40,.015],[-1.63,.367,.4,.012],[1.58,.37,.405,.012],[1.92,.351,.405,.029],[2.25,.295,.41,.057],[2.49,.228,.415,.102]];
// Each ship is drawn on the same 4.99-unit centerline. Scale the common
// station ordinates to the published moulded breadth of each hull.
function merchantHullStations(length, beam) {
  const beamScale = (4.99 * beam / length) / (2 * .37);
  return merchantStations.map(([x,w,t,k])=>[x,w*beamScale,t,k]);
}
function shipHouse(r,x,wide,levels,base=.406,bridgeOverhang=.076) {
  for(let j=0;j<levels;j++){
    const z=base+j*.077;
    house(r,{x0:x+j*.005,x1:x+.31-j*.006,w:wide-j*.005,z,h:.077,rake:.01,rear:.01,glass:j===levels-1});
    if(j<levels-1)for(const s of sides)for(let i=0;i<4;i++)
      r.box(x+.035+i*.06,s*(wide-j*.005)-.003,z+.028,x+.061+i*.06,s*(wide-j*.005)+.003,z+.053,GLASS);
  }
  const top=base+levels*.077;house(r,{x0:x-.035,x1:x+.24,w:wide+bridgeOverhang,z:top,h:.084,rake:-.026,rear:.012});mast(r,x+.14,0,top+.084,.175);
}
const seawise=vessel({
  id:'seawisegiant',name:'Seawise Giant',short:'Seawise Giant',year:1979,type:'Ships',
  detail:'This crude carrier reached 458.45 metres after lengthening. Guinness records it as the longest ship ever built. Its last voyage ended at the breakers in 2010.',
  source:ref('Guinness · longest ship ever','https://www.guinnessworldrecords.com/world-records/517826-longest-ship-ever'),
  specs:[['Length after enlargement','458.45 m'],['Deadweight','564,763 tonnes'],['Delivered','1979'],['Scrapped','2010']]
},[
  group('hull','Hull and steering','The long parallel midbody carries oil in successive tanks.',[
    ['shell','Tanker hull','The hull stays almost the same width through most of its length.',[0,0,-.25],r=>hull(r,merchantHullStations(458.45,68.8).map(([x,w,t,k])=>[x,w,t*.83,k+Math.max(0,x-1.67)*.28]),{side:'#333d42',bottom:'#9e5548',deck:'#a86250'})],
    ['stern','Propeller and rudder','A large propeller and a rudder sit on the centerline beneath the stern.',[.31,0,-.15],r=>{tube(r,[1.71,0,.15],[2.18,0,.105],.027,'#8e7666');propeller(r,2.19,0,.105,.096,5);r.profile([[2.27,.250],[2.41,.268],[2.39,.021],[2.32,.021]],-.016,.016,'#7c5047');}]
  ]),
  group('cargo','Oil-handling deck','A narrow catwalk follows the cargo pipework for most of the ship.',[
    ['pipes','Deck pipe runs','Longitudinal pipes join the tank deck to the midship loading manifold.',[0,-.22,.20],r=>{
      for(let i=-3;i<=3;i++){const y=i*.045;tube(r,[-1.96,y,.366],[1.59,y,.366],.012,i%2?'#c29f8e':'#b88b7b',8);}
      for(let x=-1.87;x<1.53;x+=.27)for(const s of sides){r.box(x,s*.275-.036,.337,x+.093,s*.275+.036,.365,'#88534b');}
    }],
    ['manifold','Loading manifold','Branch pipes terminate together beside the central transfer station.',[0,.27,.28],r=>{
      for(const s of sides)for(let j=0;j<5;j++){const x=-.14+j*.067;tube(r,[x,0,.377],[x,s*.34,.402],.016,'#cab2a0',8);
        tube(r,[x,s*.30,.41],[x,s*.30,.45],.018,'#727d7d',8);}
    }],
    ['catwalk','Raised catwalk','Crew can cross the tank deck above the pipe runs.',[0,0,.48],r=>{
      r.box(-2.03,-.034,.401,1.63,.034,.422,'#aeb3a8');
      for(const s of sides)deckRail(r,Array.from({length:15},(_,i)=>[-2.0+i*.255,s*.036,.422]),.041);
    }]
  ]),
  group('bridge','Aft superstructure','Crew quarters, navigation bridge and funnel share the after end.',[
    ['quarters','Bridge block','The bridge is positioned behind the long run of cargo tanks.',[.22,0,.33],r=>shipHouse(r,1.64,.25,5,.337)],
    ['funnel','Funnel','The exhaust stack rises astern of the bridge.',[.48,.12,.30],r=>{house(r,{x0:2.02,x1:2.31,w:.092,z:.346,h:.24,glass:false,body:'#b79c56',rake:.028});house(r,{x0:2.046,x1:2.267,w:.088,z:.586,h:.053,glass:false,body:'#394649'});}]
  ])
]);
const oocl=vessel({
  id:'ooclspain',name:'OOCL Spain',short:'OOCL Spain',year:2023,type:'Ships',
  detail:'The bridge stands well forward of the funnel. From above, you can see how the two structures divide the rows of container bays along a nearly 400-metre hull.',
  source:ref('OOCL · vessel particulars','https://www.oocl.com/eng/ourservices/vessels/gclass24188/Pages/ooclspain.aspx'),
  specs:[['Length overall','399.99 m'],['Moulded breadth','61.30 m'],['Container capacity','24,188 TEU'],['IMO number','9908126']]
},[
  group('hull','Hull and forecastle','A flared bow and long center section carry the container deck.',[
    ['shell','Ocean-going hull','The forward sections narrow sharply beneath the forecastle.',[0,0,-.22],r=>hull(r,merchantHullStations(399.99,61.30),{side:'#343c42',bottom:'#ac5848',deck:'#8e7463'})],
    ['bow','Forecastle fittings','The forward mast and mooring fittings occupy the short open bow.',[-.32,0,.17],r=>{mast(r,-2.26,0,.44,.24);for(const s of sides){r.box(-2.30,s*.105-.02,.434,-2.21,s*.105+.02,.46,'#777e79');tube(r,[-2.17,s*.16,.43],[-2.17,s*.16,.49],.024,METAL);}}]
  ]),
  group('cargo','Container bays','Rows of boxes stand in distinct forward, middle and aft blocks. This is an illustrative deck load.',[
    ...[[-1.99,7,'fore','Forward stacks'],[-.47,10,'mid','Midship stacks'],[1.70,4,'aft','After stacks']].map(([start,rows,key,title],zone)=>[key,title,'Individual containers occupy rows, bays and tiers. The stacks step down toward the ends.',[zone===0?-.3:zone===2?.31:0,(zone-1)*.15,.28+zone*.12],r=>{
      const palette=['#a25a40','#b97444','#59756b','#537788','#a67b5b','#748b84','#9c5340','#a59972'];
      for(let row=0;row<rows;row++)for(let col=0;col<10;col++){const x=start+row*.181,y=(col-4.5)*.06;
        const n=(zone===0&&row<=1?2+row:zone===2&&row>1?4:5)-((row+col*3)%11===2?1:0);
        for(let j=0;j<n;j++){const z=.416+j*.048;r.box(x,y-.029,z,x+.174,y+.029,z+.046,palette[(row*7+col*3+j*11+zone*3)%palette.length]);}}
    }])
  ]),
  group('bridge','Bridge and machinery casing','Separating the deckhouse and funnel frees space for more bays.',[
    ['bridge','Bridge and wings','The bridge projects outboard to give a clear sightline along the ship.',[-.23,0,.46],r=>shipHouse(r,-.775,.327,5,.406,.055)],
    ['funnel','Funnel casing','The red funnel sits above the machinery space aft.',[.32,0,.38],r=>{r.box(1.36,-.25,.412,1.61,.25,.585,'#92a399');house(r,{x0:1.38,x1:1.60,w:.16,z:.585,h:.205,glass:false,body:'#b85347',rake:.028});house(r,{x0:1.408,x1:1.553,w:.153,z:.79,h:.055,glass:false,body:'#343f42',rake:.012});}]
  ])
]);

function yachtHull(r,width,bow,stern,color,bottom,shaftClearance=0) {
  const shape=[[-2.50,.018,bow,.20],[-2.43,.19,bow-.01,.13],[-2.25,.49,bow-.04,.06],[-1.95,.75,bow-.07,.025],[-1.50,.93,bow-.10,.005],[-.78,1,bow-.12,.008],[.60,1,stern,.018],[1.55,.94,stern-.012,.045],[2.12,.82,stern-.022,.08],[2.48,.72,stern-.02,.12]];
  hull(r,shape.map(([x,w,z,k])=>[x,w*width,z,k+Math.max(0,x-1.55)*shaftClearance]),{side:color,bottom,deck:'#af9272',chine:.70});
}
function outletGroup(r,count,halfBeam,z,radius) {
  for(let n=0;n<count;n++)nozzle(r,2.513,-halfBeam+n*2*halfBeam/(count-1),z,radius,.036);
}
const azzam=vessel({
  id:'azzam',name:'Azzam',short:'Azzam',year:2013,type:'Yachts',
  detail:'Lürssen built a 180.65-metre yacht capable of more than 30 knots. The long foredeck, low tiers of glazing and overhanging deck edges give its profile an unusually horizontal line.',
  source:ref('Lürssen · Azzam','https://www.lurssen.com/en/new-build/yachts/azzam/'),
  specs:[['Length overall','180.65 m'],['Speed reported by builder','Over 30 knots'],['Exterior design','Nauta Design']]
},[
  group('hull','Hull and transom','The hull is exceptionally long and narrow for its size.',[
    ['shell','White hull and foredeck','The raised bow tapers into an open stretch of teak foredeck.',[0,0,-.22],r=>{yachtHull(r,.288,.39,.27,'#f1efdf','#67777c');
      for(const s of sides)deckRail(r,[[-2.48,s*.008,.389],[-2.24,s*.137,.35],[-1.94,s*.205,.321],[-1.51,s*.256,.29],[-1.22,s*.268,.284]],.037);}],
    ['jets','Transom waterjet outlets','Four waterjets discharge through the stern.',[.38,0,-.07],r=>outletGroup(r,4,.144,.163,.043)]
  ]),
  group('decks','Terraced decks','Each upper deck steps back to leave open space at the after end.',[
    ...[[-1.37,2.35,.265,.269,.118,'main','Main-deck saloon'],[-1.13,2.00,.249,.387,.104,'upper','Upper deck'],[-.79,1.64,.223,.491,.101,'bridge','Bridge deck'],[-.43,1.22,.194,.592,.091,'sun','Sun deck']].map(([x0,x1,w,z,h,key,title],j)=>[key,title,'Raked glazing sits beneath a projecting white roof. The terrace is open aft.',[.07*j,(j%2?1:-1)*.12,.17+j*.18],r=>{
      house(r,{x0,x1,w,z,h,body:'#eeeede',rake:.115,rear:.075,roof:'#dddace'});
      house(r,{x0:x0+.064,x1:x1+.115,w:w+.008,z:z+h,h:.016,glass:false,body:'#efefe1',rake:0,rear:0});
    }])
  ]),
  group('mast','Communications mast','Radomes and antennas rise from the uppermost deck.',[
    ['mast','Signal mast','The tapered mast carries several antenna yards.',[0,0,.48],r=>mast(r,.43,0,.699,.29,.016)],
    ['radomes','Satellite domes','White radomes sit over the satellite antennas.',[.22,.20,.25],r=>{for(const s of sides){ellipsoid(r,[.34,s*.11,.756],[.067,.064,.064],WHITE);ellipsoid(r,[.85,s*.12,.747],[.052,.054,.053],WHITE);}}]
  ])
]);
const octopussy=vessel({
  id:'octopussy',name:'Heesen Octopussy',short:'Octopussy',year:1988,type:'Yachts',
  detail:'Three MTU diesels drove this aluminium planing yacht to 53.17 knots in 1988. The model follows its early white-hull appearance, before the later stern extension.',
  source:ref('Mulder Design · original yacht and refit','https://mulderdesign.nl/yacht/octopussy/'),
  specs:[['Trial speed','53.17 knots'],['Installed diesels','3 × MTU 16V396TB94'],['Rated power','3,500 hp per engine'],['Builder','Heesen']]
},[
  group('hull','Planing hull','A fine entry widens into a hard-chined planing surface aft.',[
    ['shell','Aluminium hull','The wide, shallow stern carries the machinery for three waterjets.',[0,0,-.23],r=>{yachtHull(r,.435,.58,.41,'#e7ece8','#61727a');
      for(const s of sides)deckRail(r,[[-2.41,s*.04,.577],[-2.24,s*.20,.54],[-1.94,s*.321,.51],[-1.55,s*.395,.487],[-1.17,s*.412,.473]],.073);}],
    ['jets','Triple jets','Each main engine drives a waterjet. The three outlets are grouped at the transom.',[.36,0,0],r=>outletGroup(r,3,.205,.205,.081)]
  ]),
  group('quarters','Saloon and bridge','Dark side glazing follows the low white superstructure.',[
    ['saloon','Main saloon','The long deckhouse sits aft of the open foredeck.',[0,-.24,.22],r=>house(r,{x0:-1.32,x1:1.68,w:.407,z:.415,h:.274,rake:.27,rear:.09})],
    ['bridge','Upper bridge','The raked windshield narrows toward the upper deck.',[-.20,.17,.40],r=>house(r,{x0:-.82,x1:1.18,w:.33,z:.692,h:.25,rake:.29,rear:.12})],
    ['mast','Radar arch','A white arch spans the upper deck and supports the radar scanner.',[.21,0,.50],r=>{for(const s of sides)tube(r,[.53,s*.25,.935],[.76,s*.16,1.18],.036,WHITE);tube(r,[.76,-.16,1.18],[.76,.16,1.18],.036,WHITE);mast(r,.76,0,1.18,.14);}]
  ]),
  group('aft','Aft cockpit','The open working area steps down near the stern.',[
    ['bench','Cockpit settee','A sheltered seating area runs along the afterdeck.',[.22,.18,.27],r=>{for(const s of sides){r.box(1.64,s*.29-.035,.407,2.14,s*.29+.035,.495,'#cac8b8');r.box(1.70,s*.29-.044,.497,2.16,s*.29+.044,.532,'#efede1');}}]
  ])
]);
const araho=vessel({
  id:'araho',name:'F/T Araho',short:'Araho',year:2017,type:'Fishing boats',
  detail:'Araho catches, processes and freezes groundfish off Alaska. Its forward wheelhouse leaves the afterdeck clear for hauling nets aboard through the stern.',
  source:ref('Eastern Shipbuilding · Araho','https://www.easternshipbuilding.com/what-we-do/portfolio/fishing-vessel/araho/'),
  sources:[ref('National Fisherman · vessel tour and photographs','https://alaskaseafoodcooperative.org/wp-content/uploads/NF_May_Araho-for-Web.pdf')],
  specs:[['Length','194 ft'],['Beam','49 ft'],['Type','Freezer factory trawler'],['Owner at delivery','O’Hara Corporation']]
},[
  group('hull','Hull and working deck','The vessel combines an enclosed processing deck with an open stern.',[
    ['shell','Ice-classed hull','The dark hull flares above a bulbous bow.',[0,0,-.32],r=>{
      hull(r,[[-2.47,.025,1.10,.40],[-2.31,.27,1.08,.16],[-2.02,.47,1.01,.07],[-1.55,.585,.90,.02],[-.8,.628,.82,.01],[.55,.63,.68,.015],[1.6,.60,.66,.037],[2.08,.56,.64,.20],[2.43,.52,.62,.39]],{side:'#21476b',bottom:'#984e4b',deck:'#7d8984'});
      ellipsoid(r,[-2.34,0,.24],[.20,.16,.13],'#8c4744');
    }],
    ['propeller','Propeller and nozzle','A single large propeller turns inside a protective nozzle.',[.32,0,-.18],r=>{tube(r,[1.88,0,.22],[2.32,0,.167],.043,METAL);nozzle(r,2.39,0,.167,.160);propeller(r,2.382,0,.167,.130);}]
  ]),
  group('house','Wheelhouse and factory','The elevated pilothouse overlooks the working deck.',[
    ['factory','Enclosed factory deck','The working deck sits above the fish-processing space.',[0,-.29,.18],r=>{
      house(r,{x0:-1.86,x1:.52,w:.556,z:.82,h:.197,rake:.04,glass:false,body:WHITE});
      for(const s of sides)r.box(-1.54,s*.558-.01,.862,.355,s*.558+.01,.884,'#ae4544');
    }],
    ['bridge','Aluminium wheelhouse','The wheelhouse occupies the upper forward part of the superstructure.',[-.24,0,.36],r=>{
      house(r,{x0:-1.46,x1:-.04,w:.49,z:1.017,h:.226,rake:-.065,rear:.07});
      house(r,{x0:-1.5,x1:-.03,w:.50,z:1.246,h:.042,glass:false,body:'#a74040',rake:.02});
      mast(r,-.69,0,1.288,.38,.018);
    }]
  ]),
  group('fishing','Trawl deck','The gear path leads from the open stern to the winches forward.',[
    ['gantry','Stern trawl gantry','The tall portal straddles the hauling path across the stern.',[.34,0,.31],r=>{
      for(const s of sides){tube(r,[1.58,s*.48,.64],[1.88,s*.49,1.20],.049,'#a84440');tube(r,[2.27,s*.48,.64],[1.88,s*.49,1.20],.054,'#20496e');}
      r.box(1.82,-.52,1.16,1.95,.52,1.25,'#b74f48');for(const s of sides)tube(r,[1.88,s*.28,1.16],[1.88,s*.28,1.07],.024,METAL);
    }],
    ['drums','Net-handling drums','Netting winds onto drums across the working deck.',[0,.3,.31],r=>{for(const y of [-.24,.24]){r.tubeY(.87,y-.16,y+.16,.83,.123,'#698c83',18);
      for(const s of sides)r.ringY(.87,y+s*.162,.83,.15,.04,'#596b75',18);
      for(let j=0;j<6;j++)r.tubeY(.87,y-.15+j*.052,y-.137+j*.052,.83,.128,'#87a095',16);}}],
    ['ramp','Stern hauling lane','The ramp descends between the after rails. Trawl gear comes aboard on the centerline.',[.46,0,.12],r=>{
      r.profile([[1.12,.688],[1.44,.714],[2.45,.639],[2.45,.65],[1.44,.74],[1.12,.712]],-.24,.24,'#aaa79b');
      for(const s of sides){for(let j=0;j<8;j++){const x=1.12+j*.176;r.box(x,s*.36-.04,.67,x+.072,s*.36+.04,.70,'#89938d');}deckRail(r,[[1.03,s*.59,.676],[1.61,s*.575,.668],[2.35,s*.51,.635]],.14);}
    }]
  ])
]);
const viking=vessel({
  id:'viking90',name:'Viking 90 Convertible',short:'Viking 90',year:2023,type:'Fishing boats',
  detail:'The open-bridge version of Viking’s 90-foot sportfisher has a 224-square-foot cockpit. From the optional tuna tower, anglers can spot fish well beyond the bow.',
  source:ref('Viking Yachts · Convertible specifications','https://www.vikingyachts.com/90C.asp'),
  specs:[['Length overall','90 ft'],['Beam','23 ft 2 in'],['Cockpit','224 sq ft'],['Shown','Open bridge with optional tuna tower']]
},[
  group('hull','Hull and foredeck','A flared forebody meets a low, open fishing cockpit at the stern.',[
    ['shell','Flared hull','The bow gains width rapidly above the waterline to throw spray away.',[0,0,-.27],r=>{yachtHull(r,.635,.82,.43,'#8fa6ae','#435969',.23);for(const s of sides)deckRail(r,[[-2.43,s*.058,.80],[-2.25,s*.291,.778],[-1.94,s*.46,.746],[-1.52,s*.566,.722]],.09);}],
    ['screws','Running gear','Twin shafts carry a propeller on each side of the keel.',[.32,0,-.20],r=>{for(const s of sides){tube(r,[1.43,s*.23,.175],[2.23,s*.246,.115],.028,METAL);propeller(r,2.26,s*.246,.115,.122,5);}}]
  ]),
  group('bridge','Saloon, helm and tower','A shaded open helm sits above the saloon. The tower adds a higher station.',[
    ['saloon','Deckhouse','The white deckhouse wraps around a dark band of saloon glazing.',[0,-.25,.20],r=>{house(r,{x0:-1.34,x1:.91,w:.56,z:.51,h:.47,rake:.45,rear:.052});}],
    ['helm','Open flybridge','Four slender uprights support the hardtop above the center helm.',[-.15,.24,.36],r=>{
      house(r,{x0:-.76,x1:.86,w:.46,z:.98,h:.12,rake:.12,glass:false});r.box(-.33,-.14,1.105,-.04,.14,1.25,WHITE);
      for(const x of [-.63,.73])for(const s of sides)tube(r,[x,s*.404,1.095],[x+.064,s*.39,1.47],.019,METAL);
      house(r,{x0:-.73,x1:.90,w:.48,z:1.47,h:.049,rake:.04,glass:false});}],
    ['tower','Tuna tower','Cross-braced tubing carries the elevated spotting station and its shade.',[0,0,.58],r=>{
      for(const s of sides){for(const x of [-.49,.6])tube(r,[x,s*.41,1.48],[x*.62,s*.226,1.93],.015,METAL);
        tube(r,[-.49,s*.41,1.48],[.36,s*.226,1.93],.012,METAL);}
      house(r,{x0:-.32,x1:.43,w:.254,z:1.92,h:.058,rake:.035,glass:false});
      for(const s of sides)for(const x of [-.24,.32])tube(r,[x,s*.2,1.979],[x+.025,s*.20,2.21],.012,METAL);
      house(r,{x0:-.29,x1:.41,w:.25,z:2.20,h:.034,glass:false,rake:.014});
    }]
  ]),
  group('fishing','Cockpit and outriggers','The main fishing position sits low near the transom.',[
    ['cockpit','Fighting cockpit','A chair on a central pedestal faces the transom, behind the shaded mezzanine.',[.35,0,.21],r=>{
      r.box(1.01,-.49,.438,2.31,.49,.47,'#b1936f');
      for(const s of sides){r.box(1.02,s*.49-.052,.474,2.32,s*.49+.052,.57,WHITE);r.box(.97,s*.33-.064,.479,1.19,s*.33+.064,.627,'#cfc6ae');}
      tube(r,[1.68,0,.47],[1.68,0,.63],.048,METAL);r.box(1.57,-.145,.63,1.79,.145,.685,'#e8d8ad');r.box(1.55,-.145,.688,1.58,.145,.80,'#e8d8ad');
    }],
    ['riggers','Paired outriggers','Long poles beside the deckhouse spread trolling lines to either side.',[.10,.28,.30],r=>{
      for(const s of sides){tube(r,[.37,s*.53,.80],[1.83,s*.69,2.02],.015,METAL);tube(r,[.34,s*.53,.91],[.95,s*.596,1.29],.017,METAL);tube(r,[.52,s*.55,1.13],[1.72,s*.68,1.95],.005,'#acafa6',5);}
    }]
  ])
]);

const alvin=vessel({
  id:'alvin',name:'HOV Alvin',short:'Alvin',year:2022,type:'Submarines',
  detail:'A pilot and two scientists sit inside a titanium sphere. This version shows the five viewports and two sampling arms of the deep-diving Alvin certified to 6,500 metres in 2022.',
  source:ref('WHOI · Alvin at sixty','https://www.whoi.edu/press-room/news-release/alvin-60/'),
  sources:[ref('National Deep Submergence Facility · vehicle and diagrams','https://ndsf.whoi.edu/alvin/')],
  specs:[['Length','7.0 m'],['Occupants','1 pilot and 2 observers'],['Operating depth','6,500 m'],['Commissioned','1964; rebuilt several times']]
},[
  group('crew','Crew sphere and sail','The forward sphere sits inside a frame with buoyant fairings above and aft.',[
    ['sphere','Titanium personnel sphere','The sphere houses all three occupants behind the five viewing ports.',[-.56,0,.24],r=>ellipsoid(r,[-.91,0,1.05],[.70,.70,.70],'#a3afb1')],
    ['ports','Five viewports','Three ports face forward; the other two face out to port and starboard.',[-.40,0,.49],r=>{
      for(const [angle,t] of [[0,.12],[-.66,-.16],[.66,-.16],[-1.50,.09],[1.50,.09]]){
        const direction=[-Math.cos(angle)*Math.cos(t),Math.sin(angle)*Math.cos(t),Math.sin(t)];
        const u=[Math.sin(angle),Math.cos(angle),0];
        const v=[Math.cos(angle)*Math.sin(t),-Math.sin(angle)*Math.sin(t),Math.cos(t)];
        // WHOI lists a 12-inch side viewport and a 17-inch forward viewport.
        const center=[-.91,0,1.05],radius=.16*(Math.abs(angle)>1?12/17:1);
        const point=(dist,rad,i)=>center.map((q,axis)=>q+direction[axis]*dist+rad*(u[axis]*Math.cos(i*Math.PI/10)+v[axis]*Math.sin(i*Math.PI/10)));
        for(let j=0;j<20;j++)quad(r,point(.697,radius,j),point(.697,radius,j+1),point(.729,radius*.80,j+1),point(.729,radius*.80,j),'#d2c4a6');
        r.polygon(Array.from({length:20},(_,j)=>point(.730,radius*.80,j)),'#233e4e',false);
      }
    }],
    ['sail','Orange sail and hatch','The orange sail around the entry hatch is easy to spot from the surface.',[0,0,.56],r=>{
      house(r,{x0:-.93,x1:.31,w:.47,z:1.53,h:.448,rake:.20,rear:.16,glass:false,body:'#e65e37'});
      house(r,{x0:-.73,x1:.15,w:.436,z:1.979,h:.19,rake:.18,rear:.085,glass:false,body:'#ed773e'});
      tube(r,[-.16,0,2.166],[-.16,0,2.18],.145,'#d99260',24);
      for(const s of sides)tube(r,[-.61,s*.27,2.01],[-.56,s*.24,2.19],.016,METAL);
    }]
  ]),
  group('vehicle','Fairings, frame and thrusters','White fairings shape the vehicle around its foam and equipment.',[
    ['fairing','Buoyancy fairings','The white outer panels enclose the dive equipment and buoyant material around the pressure sphere.',[.20,0,.45],r=>{
      hull(r,[[-.47,.44,1.52,.60],[-.15,.68,1.62,.41],[.35,.75,1.66,.30],[1.32,.73,1.54,.28],[1.82,.67,1.43,.34],[2.11,.52,1.25,.47],[2.20,.40,1.15,.57]],{side:'#e9ebe6',bottom:'#bdc5bf',deck:'#f0eee4',chine:.75});
      for(const s of sides){r.box(.80,s*.718-.007,.99,1.32,s*.718+.007,1.044,'#6e8992');}
    }],
    ['runners','Frame and landing skids','The lower frame supports the vehicle when it settles on the seafloor.',[0,0,-.33],r=>{
      for(const s of sides){tube(r,[-1.60,s*.56,.09],[1.91,s*.56,.09],.044,'#737e83');
        for(const x of [-1.11,-.29,.69,1.47])tube(r,[x,s*.56,.09],[x+.07,s*.60,.54],.031,METAL);}
      for(const x of [-1.36,-.29,1.65])tube(r,[x,-.59,.16],[x,.59,.16],.037,'#899496');
    }],
    ['thrusters','Aft thruster supports and guards','Two stern support arms carry the outer propeller shrouds. Open the propulsion group to inspect all seven electric thrusters.',[.45,0,.05],r=>{
      for(const s of sides){tube(r,[1.64,s*.55,.77],[1.90,s*.68,.81],.053,'#607783');nozzle(r,2.22,s*.69,.81,.204,.1,true);}
    }]
  ]),
  group('science','Sampling and observation','The pilots can put specimens straight into the basket beneath the viewports.',[
    ['basket','Forward sample basket','An open metal basket ahead of the sphere holds sampling equipment and recovered material.',[-.50,0,-.18],r=>{
      r.box(-2.29,-.60,.19,-1.57,.60,.228,'#929d98');
      for(const s of sides){deckRail(r,Array.from({length:7},(_,j)=>[-2.25+j*.112,s*.59,.227]),.234);
        for(const z of [.298,.378])tube(r,[-2.25,s*.59,z],[-1.57,s*.59,z],.009,METAL,6);}
      for(const x of [-2.26,-1.58]){deckRail(r,Array.from({length:9},(_,j)=>[x,-.59+j*.1475,.227]),.234);
        for(const z of [.298,.378])tube(r,[x,-.59,z],[x,.59,z],.009,METAL,6);}
    }],
    ...sides.map((s,i)=>[i?'starm':'ptarm',i?'Starboard manipulator':'Port manipulator','An articulated arm and gripper reach around the basket to collect samples.',[-.28,s*.43,.14],r=>{
      const a=[-1.10,s*.49,.78],b=[-1.38,s*.84,.77],c=[-1.85,s*.79,.94],d=[-2.13,s*.64,.72];
      for(const [p,q] of [[a,b],[b,c],[c,d]]){tube(r,p,q,.041,'#b4b5a1');ellipsoid(r,p,[.087,.079,.077],'#9b9e94');}
      for(const dir of sides){const finger=[-2.25,s*.64+dir*.084,.64];tube(r,d,finger,.016,'#727c7f');tube(r,finger,[-2.29,s*.64+dir*.03,.58],.013,METAL);}
    }]),
    ['cameras','Cameras and lamps','Lights and cameras point toward the sample area from the forward frame.',[-.26,.1,.42],r=>{
      for(const s of sides){tube(r,[-.98,s*.51,1.24],[-1.36,s*.72,1.52],.024,METAL);r.box(-1.48,s*.72-.067,1.46,-1.30,s*.72+.067,1.57,'#3d5058');r.discX(-1.482,s*.72,1.515,.046,'#dce0c3',12);}
    }]
  ])
]);

export const seaModels=[pioneering,seawise,oocl,azzam,octopussy,araho,viking,alvin];
