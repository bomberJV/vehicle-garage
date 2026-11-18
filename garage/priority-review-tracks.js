// New review records are independent of the existing request and vehicle records.
import {VEHICLES} from './catalog.js';
import {vehicleDomain,vehicleType} from './fleet.js';
import {vehiclePriorities,garageLink} from './priority-vehicles.js';
import {getVehicleReferences} from './reference-ledger.js';
import {vehicleAssignments} from './priority-vehicle-assignments.js';

export const detailBenchmark={
 title:'Use the G500 as the depth benchmark',
 description:'Use the same checks as the G500. Start with the exact variant and its drawings, then follow the connections through the assembled vehicle.',
 checks:[
  'Compare the outline and major dimensions with the named vehicle’s source drawings.',
  'Check component placement and access against the parts diagrams. Flag concealed connections that still need measurements.',
  'Select, move and return the parts. Check depth and clearances from several angles while the assembly opens.',
  'Record the evidence, remaining gaps and regression checks before marking a task done.'
 ]
};

// Each pair is a specific component pass and a visible acceptance check.
const work={
 sl550:['Check the AIRSCARF duct and pneumatic seat circuits against the equipment codes on a donor car.','Checked roof travel, seatback and windscreen clearances, component selection, and the closed bonnet and cockpit floor from above.'],
 g500:['Compare door-jamb, gutter and hinge sections with an early US body; check the remaining hidden cable routes.','Move each wheel and door; inspect lamp housings, glazing and axle parts for bleed-through at low angles.'],
 bmw328xi:['Check the xDrive front driveline route beside the sump and the N52 cover and Valvetronic placement against underbody and engine-bay photographs.','Open all four doors, the trunk and the moonroof; check the kidneys, headlamp strip and tail-lamp split against the NHTSA photographs.'],
 bmw325ci:['Check measured rear-vent travel, frameless door seals and the M54 saddle-tank connections against the coupé plates.','Cycle both rear vents; check seat separation, cowl coverage, rear-floor coverage and wheel faces in the stock view.'],
 f350:['Build the decided 7.5-litre V8, E4OD and Sterling 10.25 rear axle, then replace the underhood and brake placeholders for that regular-cab truck.','Inspect bed ribs, tailgate supports, rear drums and both wheel ends; confirm no placeholder is presented as a fitted part.'],
 c63:['Separate the M156 intake, accessory drive and cooling connections; match the sedan’s brake and roof options.','Orbit the bumper corners and rear glass; inspect fixed calipers and the roof opening for intersecting surfaces.'],
 hrv:['Match the CVT casing, intake, rear differential and underfloor routes to the decided US EX-L AWD.','Cycle the CVT study; check wheel faces, hatch glazing and the EX-L moonroof on the decided AWD configuration.'],
 hrvlx:['Confirm the LX trim differences against Honda’s catalog: 17-inch pewter gray wheels, 215/60R17 tires and the fixed roof.','Check the LX wheel faces and the closed roof; confirm the shared AWD driveline matches the EX-L.'],
 porsche993cab:['Check both case halves, cylinder interfaces and cooling shrouds; refine the Cabriolet top and rocker sections.','Checked the raised and lowered roofs, the views of the mounted lamps, and the clearance between the fuel filler and front fender.'],
 porsche992scab:['Check the flat-six service connections, spoiler linkage and fabric-top frame against the 992.1 Cabriolet plates.','Checked the parked spoiler, the windshield mounting and both headlamp openings. Reviewed the bonnet and rear quarters under changing light.'],
 porsche996cab:['Match the M96/01 resonance intake, coolant routes and the soft-top frame to the 1999 Cabriolet plates.','Checked the traced side and plan outlines, both headlamp seats and the wrapped tail lamps under the studio light.'],
 bmws1000rr:['Match the fairing returns, brake hoses and chain path to the 2023 RR’s selected passenger and brake equipment.','Inspect chain engagement, front twin discs and rear wheel alignment; compare the solo cowl and pillion configurations.'],
 'little-willie':['Trace visible rivets, outer wheel positions and track contours from the preserved museum prototype.','Compare public exterior views; check that track links and hull panels stay distinct during selection and separation.'],
 'sherman-e8':['Match the museum M4A2E8’s external suspension spacing, hull seams and visible stowage.','Check exterior silhouettes and track-to-wheel alignment in museum reference views; keep the review outside the vehicle.'],
 boeing747:['Check PH-BFB’s door spacing, cabin windows, CF6-80C2B1F nacelles and public service panels against KLM and Corendon references.','Inspect flight-deck and cabin glazing from above and below; check wing-root joins and all four nacelles.'],
 cessna172:['Match the early 172S windshield, cabin trim, propeller and landing-gear attachments to the 8 July 1998 handbook baseline.','Orbit the cabin and propeller; inspect windshield edges, high-wing struts and tire contact in the parked pose.'],
 piperj5:['Check the J-5A rear-seat opening, fabric seams, wing-strut mounts and tailwheel against the museum’s 1940 aircraft.','Inspect cabin glazing and strut joins from both sides; check that the fabric shell does not obscure separated cabin parts.'],
 gulfstreamg800:['Use the three-living-area cabin with crew compartment; check window reveals, floor plan and external engine attachments.','Compare oval-window spacing, cockpit glazing and aft nacelles; keep unverified cabin arrangements visibly unresolved.'],
 f16:['Refine only the public F-16C canopy, wing-root and external tail contours for the documented configuration.','Compare exterior silhouettes from several public views; inspect canopy seams and selection without adding operational systems.'],
 f22:['Trace the public museum exterior’s canopy, canted fins and tailplane contours.','Inspect exterior surface joins, canopy edges and mirrored fins against the same static-display reference.'],
 f35:['Match the public F-35A canopy shoulders, conventional wing and outer fuselage proportions.','Check the exterior from top and side reference views; keep variant differences and unknown hidden geometry unresolved.'],
 b52:['Refine the B-52H’s visible pylon profiles, paired nacelle outlines, flight-deck windows and tail.','Check all eight external nacelle openings and wing joins in public static-display views; no operational system review.'],
 uh60:['Match the UH-60M cabin-window spacing, landing-gear stance and visible rotor outline from public references.','Inspect parked rotor-to-body clearance and glazing edges; compare the external tailwheel location in side views.'],
 mh6:['Refine the MH-6M bubble canopy, external skids and parked six-blade rotor silhouette.','Check the canopy frame and skid contact from public exterior views; leave internal equipment and operational details out.'],
 ch47:['Match the CH-47F’s external ramp seam, cabin windows and unequal-height rotor pylons.','Check parked rotor and pylon silhouettes, wheel stance and visible glazing; review exterior geometry only.'],
 'saturn-v':['Verify SA-510 stage joints, exterior conduits and instrument-unit placement against Apollo 15 drawings.','Separate each stage and restore the stack; inspect joints, exterior markings and interstage occlusion at several scales.'],
 'apollo-falcon':['Resolve Apollo 15 crew-station stowage, insulation panels and visible cabin cables from mission imagery.','Open the forward hatch and cabin sections; inspect pressure-window edges, seats and stowage for overlaps.'],
 'apollo-lrv':['Match Apollo 15 seat fabric, wheel hinges and folded joints to deployment photographs.','Exercise the wheel-drive and folding studies; inspect mesh wheels, seat frames and antenna clearances in the displayed poses.'],
 'atlas-v-541':['Check the Mars 2020 fairing, cruise-stage envelope and stowed rover placement against the documented stack.','Separate the public payload stack; inspect fairing boundaries and stowed wheel clearances without inferred connector locations.'],
 'falcon-9':['Add fairing-inner surfaces and flight-specific exterior fittings for Bangabandhu-1 on booster B1046.','Inspect stage separation, fairing edges and external markings against Bangabandhu-1 launch imagery.'],
 'falcon-heavy':['Tie center core B1055, side boosters B1052 and B1053, the fairing and visible external fittings to Arabsat-6A.','Separate and restore the three cores; inspect booster joins, fairing surfaces and mission-specific markings.'],
 'crew-dragon':['Check Demo-2 Endeavour’s seat positions, window surrounds, hatch trim and visible stowage against flight imagery.','Inspect the cabin through each window and with the hatch open; check trunk and capsule separation and reset.'],
 pioneeringspirit:['Place the public machinery-space studies against a dated arrangement plan and check the split-bow structure.','Inspect the bow gap, deck structures and machinery-space isolation; confirm plan revision and model links agree.'],
 seawisegiant:['Remove launch-era fittings; check the public steam-plant and shaft layout for the enlarged 1981 hull.','Compare dated hull silhouettes, deck spacing and the single-shaft study; check long surfaces at close and distant zoom.'],
 ooclspain:['Match hatch-cover spacing, deckhouse position and the engine-room study to the builder’s arrangement for this hull.','Inspect container-deck repetition, hull openings and shaft alignment; verify that hidden machinery does not show through the shell.'],
 azzam:['Match the visible stern outlets and deck profiles; retain unverified machinery-compartment geometry as unresolved.','Inspect waterjet outlets and the yacht’s long hull surfaces; check exterior occlusion without implying measured internal clearances.'],
 octopussy:['Reconcile the original 1988 transom, three drive lines and waterjet outlets with photographs before the stern extension.','Compare the chosen original configuration from stern and side; check that later fittings are not mixed into the model.'],
 araho:['Place factory-deck machinery, shaft-generator equipment, after gantry and propeller nozzle against as-built plans.','Inspect deck-to-hull joins, gantry clearance and the shaft-generator study; verify that the visible equipment matches the plan.'],
 viking90:['Refine the engine room for twin MTU 16V2000 M96L engines and the tower supports for the open bridge.','Inspect the open bridge and tower, twin shafts, transom edges and engine-room isolation for the decided configuration.'],
 alvin:['Match the refurbished frame, five viewport fairings, science basket and thruster mounts to a documented dive configuration.','Inspect every viewport and thruster from outside and in section; check the pressure sphere and frame remain distinct.']
};
const exteriorOnly=new Set(['little-willie','sherman-e8','f16','f22','f35','b52','uh60','mh6','ch47']);
const measured=new Set(['sl550','bmw325ci','bmws1000rr','porsche993cab','porsche992scab','porsche996cab']);
const reviewedInWorkbench=new Set(['sl550','porsche993cab','porsche992scab']);
const comparisons={
 sl550:'The raised roof and bonnet follow the R231 workshop side drawing. Length, height, wheelbase and mirror span match the rounded US brochure dimensions. Transverse panel sections still need measurements.',
 porsche993cab:'The raised-roof 993 has a side-outline overlay from Porsche Classic, four published spans and the US brake-light bridge. The transverse rocker and quarter-panel sections still need measurements.',
 porsche992scab:'Compare five published dimensions and trace Porsche’s side elevation across the nose, roof and rear deck. The spoiler angle and transverse bumper sections still need independent measurements.',
 porsche996cab:'The 996 Cabriolet loft is fitted to Porsche’s rescue sheet: the plan outline within a millimetre and the side elevation’s nose, sills, arches and tail. Front and rear sections follow photographs of a US 1999 car.',
 bmws1000rr:'The standard cast-wheel motorcycle has seven side-photo landmarks and three factory dimensions. Parts diagrams identify the fitted panels. Their transverse sections still need measurements.'
};
const known=new Map(vehiclePriorities.map(v=>[v.id,v]));
export const vehicleReviewTracks=Object.entries(VEHICLES).map(([id,v])=>{
 const existing=known.get(id),domain=vehicleDomain(id),type=vehicleType(id);
 const pair=work[id]||['Establish the named variant’s component and connection map from its reference ledger.','Capture the main views, exercise the available studies and record the remaining geometry defects.'];
 const coverage=id==='g500'?'Reference baseline':measured.has(id)?'Partly reviewed':'Review pending';
 const source=getVehicleReferences(id)[0];
 const geometry=id==='g500'?'The stock model’s six exterior spans have been compared with the early US G500 dimension references.':
  id==='bmw325ci'?'Body dimensions and mirror span are compared with the pre-facelift coupé drawing and BMW’s model 0334 US filing; review the remaining seam and seal sections.':
  comparisons[id]||existing?.next||'Compare the named variant with its source outline before assigning an accuracy status.';
 const states=id==='g500'?['done','in-progress','todo']:measured.has(id)?['in-progress','in-progress','todo']:['todo','todo','todo'];
 if(reviewedInWorkbench.has(id))states[2]='done';
 const level=vehicleAssignments[id][0];
 const actions=[geometry,pair[0],pair[1]],titles=['Source and geometry comparison','Component detail pass','Render and interaction QA'];
 const links=[{label:measured.has(id)?'Compare dimensions':'Reference ledger',url:garageLink(id,measured.has(id)?{tool:'references',drawing:'dimensions'}:{tool:'references'})},existing?.links[0]||{label:'Systems',url:garageLink(id,{tool:'systems'})},{label:'Vehicle workbench',url:garageLink(id)}];
 return {id,name:v.name,year:v.year,domain,type,coverage,source,
  scope:exteriorOnly.has(id)?'Public exterior geometry only. Internal weapons, operational systems and operating procedures are outside this track.':'',
  recorded:existing?.done||'The vehicle is in the collection; its detail coverage has not been reviewed.',
  steps:actions.map((description,i)=>({id:id+'--'+['geometry','detail','qa'][i],vehicleId:id,vehicleName:v.name,year:v.year,domain,type,source,title:titles[i],description,level,workflow:states[i],reason:description,links:[links[i]],status:states[i]==='done'?'shipped':states[i]==='in-progress'?'partial':'open'}))};
});
export const vehicleReviewTasks=vehicleReviewTracks.flatMap(v=>v.steps);
const tasks=new Map(vehicleReviewTasks.map(task=>[task.id,task]));
export const reviewTask=id=>tasks.get(id)||null;
export function reviewProgress(track,workflows=track.steps.map(s=>s.workflow)){
 const done=workflows.filter(s=>s==='done').length,total=track.steps.length;
 const label=done===total?'Review complete':track.id==='g500'?'Reference baseline':track.id==='bmw325ci'||done||workflows.includes('in-progress')?'Partly reviewed':'Review pending';
 return {label,done,total};
}
