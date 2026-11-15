import {getAssemblies} from './assemblies.js';
import {getDetail} from './detail-catalog.js';
import {vehicleDomain,vehicleType} from './fleet.js';

// The directory resolves each study through its real parents. A link cannot
// point at a component on another variant or at a detached example.
const highlights={
 sl550:['sl-headlamp','sl550-roof-motion','sl-seat-airscarf','sl-seat-supply','slcomand','sl-rear-camera'],
 g500:['g500-ball-steering','g500-atf-control','g500-oil-exchanger','g500-carbon-bed','g500-exhaust-main','g500-seat-heater-element','g500-column-reach','g500-cabin-blower','g500-coolant-thermostat','g500-air-cleaner','g500-engine-pump','g500-roof-drive','g500-brake-hydraulics','g500-fuel-delivery','g500-fuse-panel','g500-front-diff','g500-center-diff','g500-rear-diff','g500-optic-fog'],
 hrv:['cvt','pushbelt','transaxle-diff'],
 bmw325ci:['e46-rear-silencer','e46-blower','e46-idle-valve','e46-heater-valve','e46-left-cushion','e46-general-module','regulator-bmw325ci','piston-motion-study'],
 porsche993cab:['993oilreg','993oilpump','993heaterjacket','993case','993barecrank','993spoiler-motor','993fan'],
 porsche992scab:['p992-wastegate','p992-clutch-master','p992-cabin-blower','p992-seat-element','992case','992barecrank','992spoiler-motor','992deckcoolers'],
 bmws1000rr:['k67-shiftcam','k67-combined-pump','k67-pump-seal','k67-throttles','k67-final','wetclutch'],
 f350:['service-f350-brakes-rear-drum','service-f350-fuel-sender'],
 c63:['launch-clutch','diff'],
 boeing747:['jumbo-wheel-brake','jumbo-fuel-bays','jumbo-ac','cf6-80c2-fan','747-windshield'],
 cessna172:['sky-fuel','sky-brake','skyhawk-dc','172s-propeller'],
 piperj5:['cub-expander-brake','cub-tank','cub-carb','j5-propeller'],
 gulfstreamg800:['g800-wheel-brake','g800-fuel-supply','g800-avionics','pearl-700-fan'],
 'saturn-v':['endeavour-air','apollo-power','sic','saturn-iu','saturn-sim'],
 'apollo-falcon':['lm-interior','falcon-air','lm-power','lm-glazing'],
 'apollo-lrv':['lrv-power','lrv-traction','lrv-motor','lrv-wheel'],
 'atlas-v-541':['atlas-fairing-air','mars-power','percy-rover'],
 'falcon-9':['falcon-fairing-air','falcon-payload-ground','satellite-fairing'],
 'falcon-heavy':['falcon-fairing-air','falcon-payload-ground','satellite-fairing'],
 'crew-dragon':['dragon-air','dragon-solar','dragon-cabin'],
 pioneeringspirit:['marine-room-pioneeringspirit','pioneer-bus','marine-azimuth'],
 seawisegiant:['marine-room-seawisegiant','marine-boiler','tanker-burner','marine-steamturbine','marine-fixedprop'],
 ooclspain:['marine-room-ooclspain','x92-fuel','marine-x92-unit','marine-shaft'],
 azzam:['marine-room-azzam','azzam-reverse','marine-gasturbine','marine-boosterjet'],
 octopussy:['marine-room-octopussy','octopussy-reverse','marine-mtu396'],
 araho:['marine-room-araho','araho-electric','marine-cpp'],
 viking90:['marine-room-viking90','viking-electrical','marine-mtu2000','viking-flybridge'],
 alvin:['alvin-electric','marine-battery','marine-room-alvin','alvin-sphere']
};
const directory=new Map();
const serviceOrder=['exhaust','intake','cooling','electrical','hvac','seat-heating','column-adjustment','roof','brakes','fuel','differentials','drivetrain'];
export function systemsFor(vehicle){
 if(directory.has(vehicle))return directory.get(vehicle);
 const groups=getAssemblies(vehicle);
 const assemblies=groups.map(g=>({name:g.name,assembly:g.id,description:g.description||'',count:g.parts.length}));
 assemblies.sort((a,b)=>(serviceOrder.indexOf(a.assembly)+1||99)-(serviceOrder.indexOf(b.assembly)+1||99));
 const studies=new Map();
 // Breadth-first traversal gives each study its shortest route.
 const queue=groups.flatMap(g=>g.parts.map(p=>({assembly:g.id,part:p.id,path:[]})));
 for(let i=0;i<queue.length;i++){
  const route=queue[i],d=getDetail(vehicle,route.part);
  if(!d||studies.has(d.id))continue;
  studies.set(d.id,{...route,id:d.id,name:d.name,group:groups.find(g=>g.id===route.assembly).name});
  const path=[...route.path,route.part];
  for(const p of d.componentIndex.values())queue.push({assembly:route.assembly,part:p.id,path});
 }
 const rank=highlights[vehicle]||[];
 const featured=rank.map(id=>studies.get(id)).filter(Boolean);
 const remaining=[...studies.values()].filter(d=>!rank.includes(d.id));
 const type=vehicleType(vehicle),domain=vehicleDomain(vehicle);
 const exterior=['f16','f22','f35','b52','uh60','mh6','ch47','little-willie','sherman-e8'].includes(vehicle);
 const notes=vehicle==='g500'?'Trace air, coolant and exhaust through the truck, or open the heater pads and electric column drives inside the cabin.':exterior?'Exterior studies cover the visible shapes and moving surfaces of the display vehicle.':
   domain==='Sea'?'Follow a vessel’s propulsion train or open an individual piece of machinery.':
   type==='Space'?'Launch vehicle and payload studies are listed by their own assembly.':
   'Open a complete assembly or go straight to a component drawing.';
 const data={assemblies,featured,remaining,notes};
 directory.set(vehicle,data);return data;
}
