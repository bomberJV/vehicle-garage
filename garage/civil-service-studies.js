import {study,part} from './mechanism-shapes.js';
import {symbol} from './civil-system-symbols.js';
const ref=(label,url)=>({label,url});
const sky=ref('Cessna 172S Nav III · §7, figure 7-6 and brake-system description','https://www.norcalflight.com/pdfs/poh/POH_C172S_Nav_III.pdf');
const aaib=ref('UK AAIB · 9M-MPL, figure 3, p. 21 · 747-400 electrical system','https://assets.publishing.service.gov.uk/media/5422f72e40f0b613420005d9/Boeing_747-4H6__9M-MPL_04-14.pdf#page=7');
const cub=ref('Continental A-series operating manual · engine specifications, float carburetor','https://data.ntsb.gov/Docket/Document/docBLOB?FileExtension=.PDF&FileName=Excerpts+from+Engine+Operations+Manual-Master.PDF&ID=40382598');
const g800=ref('Gulfstream · G800 Symmetry Flight Deck','https://www.gulfstream.com/en/aircraft/gulfstream-g800/');
const command=ref('NASA · Block II handbook, electrical power, §2.6','https://apollojournals.org/afj/aoh/aoh-v1-2-06-eps.pdf');
const lm=ref('Grumman · LM-10 operations handbook, electrical power subsystem','https://apollojournals.org/alsj/LM10HandbookVol1.pdf');
const lrv=ref('NASA · Apollo 15 mission report, lunar roving vehicle','https://apollojournals.org/alsj/a15/a15mrp9.pdf#page=9');
const mars=ref('NASA/JPL · Mars 2020 power system','https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/spacecraft/power/');
const dragon=ref('SpaceX · Dragon trunk and solar array','https://www.spacex.com/vehicles/dragon');
const kamewa=ref('Kongsberg · Kamewa S-series steering and reversing unit, p. 2','https://www.kongsbergmaritime.com/contentassets/a00862ffce414231881defb553ee4b56/04.waterjet-2p-31.08.20.pdf#page=2');
const shipPower=ref('Allseas · Pioneering Spirit, installed power and twelve azimuth thrusters','https://www.allseas.com/sites/d10p.allseas.com/files/2024-12/Pioneering%20Spirit%20vessel%20specs.pdf');
const series=ref('WinGD · X92-B marine installation manual, fuel system','https://wingd.com/media/hnyp2vxg/mim_wingd_x92-b_20230301.pdf');
const araho=ref('Professional Mariner · Araho generating sets and electric bow thruster','https://professionalmariner.com/araho-specifications/');
const viking=ref('Viking Yachts · Valhalla, summer 2022, “Mechanically Speaking” (PDF p. 16)','https://www.vikingyachts.com/valhalla/ValhallaSummer2022/ValhallaSummer2022.pdf#page=16');
const burner=ref('Alfa Laval · Aalborg KBSD burner and furnace illustration','https://www.alfalaval.dk/globalassets/documents/industries/marine-and-transportation/marine/aalborg-kbsd.pdf#page=2');
const tanker=ref('Auke Visser · Knock Nevis, formerly Seawise Giant, steam machinery','https://www.aukevisser.nl/supertankers/FPSO-FSO/id674.htm');
const whoi=ref('WHOI · Alvin fact sheet, electrical power and observation equipment','https://ndsf.whoi.edu/wp-content/uploads/sites/67/2023/09/alvin-factsheet.pdf');
const sciencePower=ref('National Deep Submergence Facility · Alvin science equipment power channels','https://ndsf.whoi.edu/alvin/user-supplied-equipment/');
const falconPdf='https://www.spacex.com/assets/media/falcon-users-guide-2025-05-09.pdf';
const falconGuide=ref('SpaceX · Falcon User’s Guide v8, environmental conditions, table 5-2',falconPdf+'#page=42');
const falconEgse=ref('SpaceX · Falcon User’s Guide v8, transfer to hangar and payload EGSE, p. 80',falconPdf+'#page=91');
const index=new Map();
function diagram(vehicle,keys,id,title,description,source,rows){
  const data=rows.map(([key,name,shape,xyz,note,links])=>part(key,name,note,[xyz[0]*.13,xyz[1]*.13,xyz[2]*.13+.05],r=>symbol(r,shape,xyz)));
  const view=study(id,title,description,source,data);
  view.viewAngle=[-.21,.58];
  view.groups[0].parts.forEach((p,i)=>{p.source=rows[i][6]||source;p.connectsTo=(rows[i][5]||[]).map(key=>id+'.'+key);});
  for(const key of keys)index.set(vehicle+'/'+key,view);
}
const L=[-.72,0,0],M=[0,0,0],R=[.72,0,0];
const hi=x=>[x,.06,.55],lo=x=>[x,-.05,-.42];
diagram('cessna172',['wings.port','wings.starboard'],'sky-fuel','Skyhawk fuel supply','Follow the two wing tanks through the selector into the common reservoir. The Cessna drawing also distinguishes the electric auxiliary pump from the engine-driven pump. Positions here show the order of the principal components.',sky,[
 ['left','Left wing tank','tank',hi(-.76),'Fuel leaves the left wing through a screened outlet.',['selector']],['right','Right wing tank','tank',hi(.76),'The other wing feeds the same selector.',['selector']],
 ['selector','Fuel selector','selector',hi(0),'The selected wing supply reaches a shared reservoir.',['reservoir']],['reservoir','Reservoir tank','tank',L,'The reservoir is upstream of the auxiliary pump.',['aux']],
 ['aux','Electric auxiliary pump','pump',M,'An electric motor drives this pump. The aircraft also has an engine-driven pump.',['strainer']],['strainer','Fuel shutoff and strainer','filter',R,'The shutoff valve and strainer lie downstream of the auxiliary pump.',['mechanical']],['mechanical','Engine-driven fuel pump','pump',lo(.52),'The engine-driven unit supplies the metering equipment.',['meter']],['meter','Metering and distribution','nozzle',lo(-.28),'The fuel control meters flow to the distribution unit and injector lines.']
]);
diagram('cessna172',['gear.port','gear.starboard'],'sky-brake','Skyhawk main-wheel disc brake','Each main wheel carries a hydraulically actuated single-disc brake. The nosewheel steers and rolls without a matching brake. The view shows one side of the system.',sky,[
 ['pedal','Toe pedal and linkage','link',L,'The upper part of the rudder pedal moves a master-cylinder piston.',['cylinder']],['cylinder','Master cylinder','pump',hi(0),'Pedal force becomes hydraulic pressure directed toward the wheel.',['pads']],['pads','Caliper and linings','pads',R,'The caliper squeezes the rotating disc between its linings.',['disc']],['disc','Wheel disc','disc',lo(0),'The disc turns with the main wheel and transfers braking torque to the tire.']
]);
diagram('boeing747',['jumbo_flight_deck.instruments'],'jumbo-ac','747-400 main AC generation','The AAIB’s drawing identifies four engine-driven generators, their breakers and four main AC buses. Each numbered lane below pairs a generator with its normal bus. The model leaves out tie and standby circuits.',aaib,
 [0,1,2,3].flatMap(i=>{const x=(i-1.5)*.58;return [['idg'+i,'Engine '+(i+1)+' integrated drive generator','generator',hi(x),'The engine accessory gearbox turns this generator.',['gcb'+i]],['gcb'+i,'Generator circuit breaker '+(i+1),'breaker',[x,.05,.05],'This breaker connects the engine generator to its corresponding bus.',['bus'+i]],['bus'+i,'Main AC bus '+(i+1),'bus',lo(x),'Its generator circuit breaker connects the corresponding generator to this bus.']];}));
diagram('piperj5',['a75.induction'],'cub-carb','A-75 float carburetor','The Continental specifications identify a float carburetor on this engine family. The cutaway illustrates its operating principle. The installed carburetor part number on the museum aircraft is unconfirmed.',cub,[
 ['bowl','Float bowl','tank',L,'The bowl holds a small working supply of fuel.',['float']],['float','Float and inlet needle','link',hi(0),'The inlet needle follows the float as the bowl level changes.',['jet']],['jet','Fuel discharge nozzle','nozzle',M,'Fuel enters the moving airstream through the discharge nozzle.',['throat']],['throat','Venturi and throttle body','ring',R,'The venturi narrows the airflow passage before the mixture reaches the intake manifold.']
]);
diagram('gulfstreamg800',['g800_flight_deck.instruments'],'g800-avionics','G800 flight-deck interfaces','Gulfstream identifies active control sidesticks, touch-screen controls and electronically linked flight-deck displays. This component view shows the crew interfaces. Equipment bay placement is unverified.',g800,[
 ['pilot','Pilot active sidestick','link',L,'An active sidestick provides the pilot’s control input.',['other']],['other','Copilot active sidestick','link',R,'Electronic linking lets the pilots feel each other’s control inputs.',['pilot']],['touch','Touch-screen controller','screen',lo(0),'The crew uses touch screens to interact with aircraft systems.',['display']],['display','Flight display','screen',hi(0),'The flight deck presents flight, navigation and system information.']
]);
diagram('saturn-v',['saturn-sm.body'],'apollo-power','Endeavour service-module electrical power','Three fuel-cell powerplants in the service module supplied DC electrical power to the Apollo command and service modules. Open the elements to follow reactants, electricity and water.',command,[
 ['h2','Hydrogen supply','tank',hi(-.50),'Cryogenic hydrogen feeds the powerplants.',['cells']],['o2','Oxygen supply','tank',hi(.50),'The oxygen supply provides the other reactant.',['cells']],['cells','Fuel-cell powerplants','heat',M,'The three powerplants produced direct current, water and heat.',['bus','water']],['bus','DC distribution','bus',lo(-.52),'Distribution buses deliver electricity to spacecraft loads.'],['water','Product water','tank',lo(.52),'Water produced in the reaction enters the spacecraft water system.']
]);
diagram('apollo-falcon',['interior.left-panel','lm-room.left-panel'],'lm-power','Falcon electrical power','Separate ascent- and descent-stage batteries feed the lunar module. DC buses serve equipment directly. Inverters supply equipment that requires AC. The rows group equipment by function.',lm,[
 ['descent','Descent-stage batteries','battery',L,'These batteries supply the lunar module during the descent-stage portion of the mission.',['bus']],
 ['ascent','Ascent-stage batteries','battery',R,'The ascent stage carries its own source of electrical power.',['bus']],['bus','DC distribution buses','bus',M,'DC power is routed to equipment and to the inverters.',['ac']],['ac','Inverter','module',lo(0),'The inverter converts DC into AC for the instruments and equipment that use it.']
]);
diagram('apollo-lrv',['crew.controls'],'lrv-power','Lunar rover batteries and controls','Two non-rechargeable silver-zinc batteries power the Apollo 15 rover. Electrical power goes to the traction drives, steering and displays. The wheel inspection separately opens the mechanical brake.',lrv,[
 ['a','Battery 1','battery',hi(-.48),'One of the rover’s two 36-volt batteries.',['bus']],['b','Battery 2','battery',hi(.48),'The rover can draw its load from the surviving battery if one fails.',['bus']],['bus','Power distribution','bus',M,'Distribution wiring and circuit protection connect loads to the batteries.',['controls','motor']],['controls','Hand controller','link',lo(-.6),'The crew controls vehicle movement with the hand controller.'],['motor','Wheel drive motor','generator',lo(.62),'Each wheel has its own electric traction drive.']
]);
diagram('atlas-v-541',['percy-rover.chassis'],'mars-power','Perseverance electrical power','After Mars landing, the rover draws electricity from its rear-mounted generator and two rechargeable batteries. This view follows the rover’s surface power supply, separate from the Atlas launch vehicle.',mars,[
 ['generator','Radioisotope generator exterior','heat',L,'The generator converts the natural heat of radioactive decay to electricity.',['one','two','loads']],['one','Rechargeable battery 1','battery',hi(.14),'One of two lithium-ion batteries stores energy for the rover.',['loads']],['two','Rechargeable battery 2','battery',lo(.14),'The battery pair supplements generator output during peaks in demand.',['loads']],['loads','Rover electrical loads','module',R,'Loads include the mobility system, instruments and communications.']
]);
diagram('crew-dragon',['trunk.solar'],'dragon-solar','Crew Dragon trunk solar array','Dragon carries a curved band of solar panels on one side of its trunk. In sunlight the array supplies electrical power to the spacecraft. The display shows exterior modules and their electrical relationship.',dragon,[
 ['trunk','Trunk section','ring',L,'The cylindrical trunk supports the exterior solar array.',['array']],['array','Solar cells','array',M,'Cells on the sunlit side turn light into electricity.',['loads']],['loads','Spacecraft electrical loads','module',R,'Array output supplies Dragon during free flight and while it is at the station.']
]);
diagram('pioneeringspirit',['propulsion.distribution','marine-room-pioneeringspirit.distribution'],'pioneer-bus','Generator-to-thruster power path','Pioneering Spirit has diesel generator sets and twelve azimuth thrusters. This functional view traces one propulsion power path. Bus splits and machinery-room cable routes are illustrative.',shipPower,[
 ['set','Generator set','generator',L,'A diesel prime mover turns an alternator.',['board']],['board','Main switchboard','bus',hi(0),'The board distributes generated electrical power.',['drive']],['drive','Electrical drive','module',R,'Power electronics regulate the propulsion motor.',['motor']],['motor','Thruster motor','generator',lo(0),'The motor turns the propeller in the azimuth unit.']
]);
diagram('ooclspain',['marine-x92-unit.head'],'x92-fuel','X92-B common-rail fuel injection','The WinGD X92-B installation manual identifies the fuel supply unit, common rail, injection control and cylinder injection valves. This view follows one cylinder’s fuel path.',series,[
 ['pump','Fuel supply unit','pump',L,'The fuel supply unit feeds the common rail.',['rail']],['rail','Common fuel rail','rail',M,'The rail provides a common fuel supply along the engine.',['inj']],['inj','Cylinder injection valve','nozzle',R,'Fuel enters the cylinder through its injection valve.'],['control','Injection control','module',hi(0),'The electronic control system governs injection.',['inj']]
]);
diagram('araho',['house.bridge'],'araho-electric','Araho electrical generation','The trawler has a shaft generator, two auxiliary generating sets and a separate emergency generator. The electric bow thruster is one major load. Equipment is arranged here as a functional diagram.',araho,[
 ['shaft','ABB shaft generator','generator',L,'The shaft generator takes mechanical input from the main propulsion train.',['bus']],['aux','Auxiliary generator sets','generator',hi(0),'Auxiliary diesel generating sets supply the vessel’s electrical system.',['bus']],['bus','Electrical distribution','bus',M,'Distribution connects generators with working-deck and machinery loads.',['thruster']],['thruster','Electric bow thruster','generator',R,'The transverse thruster motor consumes electrical power.']
]);
for(const v of ['azzam','octopussy'])diagram(v,['marine-steerjet.steering'],v+'-reverse','Waterjet steering and reverse','This section follows Kamewa’s published steering and reversing arrangement. It illustrates the mechanism on a steerable jet. The center booster nozzle has a different role. Actuator geometry is representative of the family.',kamewa,[
 ['nozzle','Steering nozzle','ring',L,'The nozzle directs the jet at the transom.',['bucket']],['bucket','Reversing bucket','bucket',M,'Lowering the bucket redirects discharge forward to produce astern thrust.',['pivot']],['pivot','Bucket pivot','link',R,'The bucket rotates about its pivots.'],['ram','Hydraulic actuator','pump',hi(0),'The linkage moves the bucket relative to the nozzle.',['bucket']]
]);
diagram('viking90',['viking_flybridge.console','marine-room-viking90.structure'],'viking-electrical','Viking 90 onboard electrical systems','Viking locates the standard 40 kW generators aft of the main engines and the eight batteries beside the center walkway. Its OctoPlex system provides digital switching. The component arrangement here is a functional diagram.',viking,[
 ['port','Port generator set','generator',hi(-.77),'One of the yacht’s two standard generator sets.',['board']],
 ['starboard','Starboard generator set','generator',hi(.77),'Both generating sets are aft of the propulsion engines.',['board']],
 ['board','Onboard AC distribution','bus',M,'The board distributes the generating sets’ output to onboard AC loads.'],
 ['batteries','Battery boxes','battery',lo(-.69),'Viking describes eight batteries mounted in fiberglass boxes aft and outboard of the center walkway.'],
 ['switching','OctoPlex digital switching','screen',lo(.69),'The digital switching system gives the crew control over onboard circuits. Individual load assignments vary.']
]);
diagram('seawisegiant',['marine-boiler.burner'],'tanker-burner','Oil-fired marine boiler burner','Seawise Giant was a steam-powered crude carrier. This cutaway follows Alfa Laval’s published Aalborg KBSD burner as an example of marine boiler equipment. The tanker’s actual burner make and dimensions remain unverified.',burner,[
 ['oil','Oil supply connection','filter',L,'Fuel oil enters the burner assembly through its supply connection.',['atomizer']],
 ['steam','Atomizing-medium connection','pipe',hi(-.60),'The atomizing medium reaches the burner separately from the oil.',['atomizer']],
 ['atomizer','Oil atomizer','nozzle',M,'At the burner head, the oil is dispersed into droplets.',['furnace']],
 ['windbox','Combustion-air windbox','blower',hi(.64),'The windbox distributes combustion air around the burner head.',['furnace']],
 ['furnace','Boiler furnace opening','furnace',R,'The opening faces the boiler furnace. Steam from the ship’s boilers powered its turbine.',[],tanker]
]);
diagram('alvin',['science.cameras','marine-battery.cover','alvin_sphere.displays'],'alvin-electric','Alvin battery banks and science loads','Two lead-acid battery banks supply Alvin. Its external cameras and lights work in the dark, and science equipment draws from dedicated power channels. The banks are shown closed. Internal cells and installed cable routes are omitted.',whoi,[
 ['port','First enclosed battery bank','sealedBattery',hi(-.72),'Woods Hole lists a 120 V lead-acid bank. The illustration shows its outer enclosure.',['distribution']],
 ['starboard','Second enclosed battery bank','sealedBattery',hi(.72),'A second 120 V bank provides the other half of the stored energy capacity.',['distribution']],
 ['distribution','Vehicle power distribution','bus',M,'The vehicle distributes electrical energy to its equipment.',['illumination','imaging','science']],
 ['illumination','External lighting','lamp',lo(-.74),'Vehicle lighting illuminates nearby terrain for the crew and its cameras.'],
 ['imaging','Science camera','camera',lo(0),'Onboard cameras record observations during the dive.'],
 ['science','Science equipment interface','connector',lo(.74),'The operator provides six power channels for science equipment outside the personnel sphere.',[],sciencePower]
]);
for(const vehicle of ['falcon-9','falcon-heavy'])diagram(vehicle,['falcon_fairing_air.ground-duct'],'falcon-payload-ground','Falcon payload ground conditioning','SpaceX describes this service for satellites enclosed by the standard Falcon 9 or Falcon Heavy fairing. The hangar supplies conditioned air through a duct. The air supply disconnects during rollout and reconnects at the pad.',falconGuide,[
 ['hangar','Hangar air handler','blower',hi(-.72),'The integration hangar provides filtered, conditioned air while the payload is inside the fairing.',['duct']],
 ['pad','Pad air conditioning','blower',lo(-.72),'The pad supply takes over after rollout. The hangar and pad feeds represent different phases.',['duct']],
 ['duct','Ground conditioning duct','duct',M,'A removable ground duct carries the active supply to the payload enclosure.',['enclosure']],
 ['enclosure','Payload enclosure','fairing',R,'Conditioned air keeps the encapsulated spacecraft within its agreed ground environment.'],
 ['egse','Payload electrical ground support','connector',hi(.62),'Mission-specific ground equipment can reconnect to the satellite to check its electrical interfaces. This is separate from the airflow.',[],falconEgse]
]);
export function getCivilServiceDetail(vehicle,id){return index.get(vehicle+'/'+id)||null;}
