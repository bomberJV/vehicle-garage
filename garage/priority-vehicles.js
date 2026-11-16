// Each row describes one actual variant and links to a reachable part in the
// shipped collection. The first external source is shared with References.
import {VEHICLES} from './catalog.js';
import {vehicleDomain,vehicleType} from './fleet.js';
import {getVehicleReferences} from './reference-ledger.js';

export function garageLink(vehicle,query={}){
  return './index.html?'+new URLSearchParams({vehicle,...query})+'#workbench';
}
const notes={
  sl550:['seats.airscarf','AIRSCARF neck-level heater','Trace the neck heater through the seatback, run the massage cycle or fold the hardtop. The side drawing in Factory dimensions shows how the closed roof and hood fit the Mercedes outline.','Check concealed hose lengths, seat cross-sections and roof linkage clearances against a measured US car.'],
  g500:['differentials.center','Center differential','The stock comparison covers six exterior dimensions. The G500 parts register also records the bearing profiles, brake sections, engine and cabin filters, and the source for each checked feature.','Use the G500 parts register for outstanding work on each system, including door-jamb and gutter sections, hinge offsets and hidden lines.'],
  f350:['brakes.rear-drum','Rear drum brake','The regular-cab long-box truck has a ribbed bed, rear drums and an open tailgate study.','Replace the placeholder engine and axle with the decided 7.5-litre V8, E4OD, Twin I-Beam front and Sterling 10.25 rear, then add their accessory drives and brake plumbing.'],
  c63:['brakes.front-caliper','Front brake caliper','The 2014 W204 sedan has separate brake, fuel and electrical assemblies beneath the facelift body.','Compare the sedan’s bumper corners, rear glass and roof opening with a car carrying the same factory options.'],
  hrv:['drivetrain.gearbox','CVT transmission','Follow the belt between the variable-width pulleys in the US-market HR-V.','Match the transmission casing, rear driveline and underfloor route to the decided US EX-L AWD.'],
  bmw325ci:['body.quarter-left','Rear vent window','The US 325Ci has a dimensioned body and mirror span, five-spoke Style 43 wheels, a working rear vent window and an M54 intake-flap study. The service assemblies now include exhaust, cooling, cabin heat, seat heaters and body electronics.','Check the vent linkage travel and door-seal sections on an early US coupé. The model depicts the M54 version.'],
  porsche993cab:['engine.case','3.6-litre split crankcase','The air-cooled Carrera has separate barrels and case halves, a dry-sump circuit and heated-air ducts from the exhaust exchangers. The fuel filler now sits beneath the fender. Compare the bonnet, lamp surrounds and folded top from either side, or overlay the Porsche Classic drawing with the top raised.','Measure transverse sections through the narrow rear quarters and the folded roof stack.'],
  porsche992scab:['shell.spoiler-drive','Adaptive rear spoiler drive','Inspect the spoiler drive beneath the rear deck, the flush rear reflectors and the angled headlamp faces. Factory dimensions shows the Cabriolet drawing and five published measurements.','Match the deployed blade angle and fabric-top folds to an identified 992.1 Carrera S Cabriolet.'],
  bmws1000rr:['drive.chain','Chain and sprockets','Inspect the RR’s ram-air duct, four throttles, ShiftCam intake shaft and combined oil and coolant pump. Factory dimensions marks seven bodywork landmarks from the Racing Red studio photograph.','Check the fairing contours and exact brake-hose routing on a bike with the same passenger and brake equipment.'],
  'little-willie':['tracks.left','Left track profile','The preserved prototype has a box-shaped hull and long exposed tracks.','Compare the visible rivet lines and outer track profile against additional museum views.'],
  'sherman-e8':['tracks.left','Left track profile','The exterior follows the M4A2E8 in the Tank Museum collection.','Record the external wheel spacing and hull stowage against more views of that particular museum vehicle.'],
  boeing747:['fuselage.cockpit','Upper-deck windshield','The passenger 747-400 has a raised flight deck, four nacelles and separately mounted glazing.','Match every cabin window, door and the CF6-80C2B1F nacelles to KLM PH-BFB, the decided passenger 747-406.'],
  cessna172:['propeller.hub','Propeller hub','The 172S study separates the two-blade propeller and the high-wing cabin glazing.','Match the windshield curvature and cabin trim to the decided early 172S: serials 172S8001 and on, without the Nav III panel.'],
  piperj5:['cabin.glazing','Cabin glazing','The J-5A Cub Cruiser has its own cabin glazing, wing struts and tailwheel.','Measure the rear-seat opening and fabric-covered fuselage against the Western Antique Aeroplane & Automobile Museum’s 1940 J-5A.'],
  gulfstreamg800:['fuselage.windows','Cabin window section','The G800 study follows the side profile, oval windows and aft-mounted engines.','Verify the window reveals and floor plan against the decided three-living-area cabin with a dedicated crew compartment.'],
  f16:['wings.port','Port wing exterior','The F-16C exterior study shows the bubble canopy and single vertical tail.','Match canopy and wing-root silhouettes across more photographs of the same F-16C configuration.'],
  f22:['wings.port','Port wing exterior','The F-22A study follows the public museum exterior and paired canted fins.','Check the side profile of the canopy and the outer contours of the tailplanes against additional museum views.'],
  f35:['wings.port','Port wing exterior','The F-35A model depicts the conventional-takeoff variant.','Check the canopy shoulders and upper fuselage proportions against further public F-35A photographs.'],
  b52:['pods.port-inner','Paired nacelle exterior','The B-52H carries four paired nacelles under its swept wing.','Compare the outline of the pylons, upper-deck windows and tail with the referenced static-display aircraft.'],
  uh60:['main.hub','Main rotor exterior','The UH-60M study shows the four-blade rotor, wheel stance and raised tail.','Refine the cabin side-window spacing and tailwheel position from public exterior views of the M variant.'],
  mh6:['main.hub','Main rotor exterior','The MH-6M has a distinctive bubble canopy, skids and a six-blade main rotor.','Check the canopy framing and external skid proportions against the same documented example.'],
  ch47:['forward.hub','Forward rotor exterior','The CH-47F’s forward and aft rotors sit on pylons of different heights.','Refine the ramp seam, cabin windows and pylon outlines against matching public F-model views.'],
  'saturn-v':['upper.second','S-II stage','This is SA-510, the launch vehicle that carried Apollo 15. The stages and instrument unit open individually.','Verify visible stage joints, exterior conduits and their placement on the Apollo 15 stack.'],
  'apollo-falcon':['interior.ecs','Lunar module cabin air','Falcon’s crew stations, forward hatch and environmental equipment open from the cabin.','Resolve which cabin cables, insulation panels and stowage items were installed for Apollo 15.'],
  'apollo-lrv':['wheels.wheel1','Lunar rover wheel drive','The Apollo 15 rover has an electric drive at each of its four mesh wheels.','Compare the fabric seats, hinges and folded arrangement against Apollo 15 deployment photographs.'],
  'atlas-v-541':['upper.payload','Mars 2020 payload stack','The 541 carries the Mars 2020 payload above its core and four solid boosters.','Check the fairing-to-cruise-stage clearances and rover wheel placement in the stowed flight configuration.'],
  'falcon-9':['upper.air','Upper-stage environmental study','The Block 5 exhibit separates the core, upper stage and public payload-envelope study.','Assign fairing-interior details and connector locations from the decided Bangabandhu-1 flight on booster B1046.'],
  'falcon-heavy':['upper.air','Payload environmental study','The center core and two side boosters can be inspected separately.','Tie the fairing, exterior markings and booster finishes to the decided Arabsat-6A mission of April 2019.'],
  'crew-dragon':['crewdeck.air','Crew cabin air','The Demo-2 study pairs Endeavour’s crew cabin with its unpressurized trunk.','Confirm seat spacing and visible cabin trim against imagery from the 2020 flight.'],
  pioneeringspirit:['propulsion.room','Power generation and propulsion','The split bow and machinery studies follow Allseas’ heavy-lift vessel.','Check the positions of individual machinery spaces against the date and revision of the arrangement plan.'],
  seawisegiant:['propulsion.main-turbine','Main steam turbine','The enlarged tanker has a steam plant and single shaft in this study.','Keep only fittings from the decided enlarged hull, using dated photographs and plans from 1981 onward.'],
  ooclspain:['propulsion.main-engine','Main engine','The 2023 container ship pairs a low-speed main engine with its propeller shaft.','Check hatch-cover spacing and engine-room position against the builder’s arrangement for this hull.'],
  azzam:['propulsion.jet-0','Waterjet unit','The yacht’s machinery study traces diesel and turbine power to waterjets.','Check the exterior jet outlets against stern photographs. Exact internal compartment geometry remains unverified.'],
  octopussy:['propulsion.diesel-center','Center diesel','The study follows the original high-speed 1988 yacht and its three drive lines.','Reconcile the original transom and waterjet outlets with photographs taken before the stern extension.'],
  araho:['propulsion.pto','Shaft-generator drive','The trawler’s side-elevation drawing places the deckhouse, after gantry and propeller nozzle.','Locate specific factory-deck machinery and shaft-generator equipment against the as-built vessel.'],
  viking90:['propulsion.port-engine','Port diesel','The open-bridge Viking 90 has twin diesels and an optional tower.','Add engine-room service clearances for the decided twin MTU 16V2000 M96L engines and the open bridge with tower.'],
  alvin:['crew.ports','Pressure-sphere viewports','The refurbished research submersible has five viewports and separate thruster studies.','Verify the current external frame, science-basket fit and viewport fairings against one documented dive.']
};

const additionalEvidence={
  bmw325ci:['BMW of North America · model 0334 filing','BMW · M54 resonance intake','BMW · E46 coupé window mechanism'],
  g500:['Mercedes-Benz · VG150E center differential','Mercedes-Benz · long-wheelbase G 500 body elevations','Mercedes-Benz · front fog lamps','Mercedes-Benz · side marker lamps','Mercedes-Benz · side turn repeater'],
  porsche993cab:['Porsche Classic · 993 Cabriolet outline'],
  porsche992scab:['Porsche · 992 Cabriolet outline']
};

export const vehiclePriorities=Object.entries(notes).map(([id,[part,study,done,next]])=>{
  const v=VEHICLES[id],references=getVehicleReferences(id),source=references[0];
  const evidence=references.slice(1).filter(row=>additionalEvidence[id]?.includes(row.label));
  return {id,name:v.name,year:v.year,domain:vehicleDomain(id),type:vehicleType(id),status:'partial',study,done,next,source,evidence,
    links:[{label:study,url:garageLink(id,{assembly:part.split('.')[0],open:part})},
      {label:'Systems',url:garageLink(id,{tool:'systems'})},{label:'All references',url:garageLink(id,{tool:'references'})}]};
});
