import {vehiclePriorities,garageLink} from './priority-vehicles.js';

const all=vehiclePriorities.map(v=>v.id);
const road=['sl550','g500','f350','c63','hrv','bmw325ci','bmw328xi','porsche993cab','porsche992scab','porsche996cab','bmws1000rr'];
const civilAircraft=['boeing747','cessna172','piperj5','gulfstreamg800'];
const heritage=['little-willie','sherman-e8','f16','f22','f35','b52','uh60','mh6','ch47'];
const otherCivil=all.filter(id=>!road.includes(id)&&!civilAircraft.includes(id)&&!heritage.includes(id));
const link=(label,url)=>({label,url});
const model=(label,id,tool='systems')=>link(label,garageLink(id,{tool}));
const part=(label,id,assembly,open)=>link(label,garageLink(id,{assembly,open}));
const assignments={};
function work(id,level,vehicleIds,title,description,reason,links,workflow='todo',status){
  assignments[id]=[level,workflow,vehicleIds,reason];
  return {id,status:status||(workflow==='done'?'shipped':workflow==='in-progress'?'partial':'open'),title,description,links};
}

// New requests get new keys. Existing delivery notes and locally saved workflow
// records retain their meaning when a later pass asks for greater depth.
export const backlogSources={
  slManual:'https://www.mbusa.com/content/dam/mb-nafta/us/owners/manuals/2014/operators/MY14_SL_Operator.pdf',
  slBrochure:'https://www.auto-brochures.com/makes/Mercedes_Benz/SL-Class/Mercedes%20Benz_US%20SL-Class_2014.pdf',
  boeing400:'https://www.boeing.com/content/dam/boeing/v2/airports/acaps/747-400_Rev_F.pdf',
  cessnaEarlyS:'https://www.northcoastair.com/documents/Cessna%20172S%20POH.pdf',
  piperMuseum:'https://www.westernnorthcarolinaairmuseum.com/1941-j-5a-piper-cub.html',
  piperOwner:'https://inspire.eaa.org/2020/08/19/just-for-the-fun-of-it/',
  gulfstream:'https://www.gulfstream.com/en/aircraft/gulfstream-g800/',
  airlineSafety:'https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_121-24E.pdf',
  gaSafety:'https://www.faasafety.gov/files/events/GL/GL09/2021/GL09109386/FAAST_Passenger_Briefing_Checklist.pdf'
};

// Proposals deliberately stay outside VEHICLES and the vehicle review list.
export const proposedVariants=[
  {id:'r231-us-2014-sl63',family:'Mercedes-Benz SL',generation:'R231',market:'US',year:2014,trim:'SL63 AMG',requestId:'evaluate-r231-sl63'}
];

export const additionalRequestSections=[
  {id:'fit-and-detail',name:'Vehicle fit and detail corrections',items:[
    work('porsche-equipment-fit','P1',['porsche993cab','porsche992scab'],'Build out the accessory range for each 911 Cabriolet',
      'Each car offers accessories that suit it, each with a part number and a source. The 1998 Cabriolet has eight: the Tequipment roof carrier, alone or with the ski holder, the front strut brace, sports tail pipes, wind deflector, Carrera door entry guards, the US Litronic headlamp kit and RS-style front lips. The 2023 Carrera S has the TECHART rear spoiler and Aero Kit, and its factory front-axle lift.',
      'Widen the range with items made for each car. For the 1998 Cabriolet, the Tequipment bicycle carrier (000 044 000 48), locking wheel nuts (993 361 057 00) and the car cover remain. For the 2023 Carrera S, add Porsche Tequipment items for the 992. Give each item its part number, the exact model and year it fits, and a catalog source.',
      [link('993 Cabriolet touring carrier',garageLink('porsche993cab',{tool:'customize',section:'equipment',equipment:'roof-racks'})),model('2023 Carrera S equipment','porsche992scab','customize')],'todo','partial'),
    work('g500-2002-guard','P1',['g500'],'Replace the later-model brush guard on the 2002 G500',
      'The 2002 US folding guard has a polished surround, rounded headlamp returns, a low tie bar and two padded uprights. The installed view shows the bumper hinges and quick locks in the latched position.',
      'Identify the correct guard from a period reference. Match the hoop profile, crossbars, and bumper mounting points, then compare the model with front and side reference views.',
      [link('Fit the 2002 G500 guard',garageLink('g500',{tool:'customize',section:'equipment',equipment:'brush-guards'})),link('2002 G500 bumper parts diagram','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/bumper-components-front')],'todo','partial'),
    work('g500-sump-diff-clearance','P0',['g500'],'Resolve the oil sump and front differential overlap',
      'The former pan mesh intersected the front axle housing. The rebuilt two-piece pan has a deep front bowl and a shallow rear section above the right-offset differential. At stock height the closest point is the differential-lock actuator, 12.4 mm below the bowl. The 40 mm spring kit raises that gap to 52.4 mm. The closest point then moves to the carrier housing, 47.2 mm from the pan.',
      'Inspect a section through both parts in the assembled model to determine whether the meshes intersect or the renderer shows a hidden surface. Check the sump contour, engine mounts, and front axle position against 2002 G500 references. Verify clearance at ride height and through any suspension travel the viewer depicts.',
      [link('Inspect the installed oil sump',garageLink('g500',{part:'powertrain.sump'})),link('Inspect the front differential',garageLink('g500',{part:'differentials.front'}))],'todo','partial'),
    work('sl550-engine-detail','P1',['sl550'],'Detail the 2014 SL550 engine and its connections',
      'Compare the installed M278 with R231 diagrams and engine-bay photos. Trace the valve covers, intake and charge plumbing, accessory drive, coolant hoses and wiring to their mounting points. Check the same connections with the engine isolated.',
      'Use diagrams and engine-bay photos for the modeled year to reproduce the visible valve covers, intake and charge plumbing, accessory drive, hoses, and wiring. Check their routing and mounting points with the engine installed and isolated in the viewer.',
      [model('SL550 engine and systems','sl550'),model('SL550 references','sl550','references')]),
    work('g500-pan-neighbour-overlaps','P1',['g500'],'Clear the three overlaps around the G500 oil pan',
      'The oil pump, the charging cable, the gearbox bellhousing and the engine-mount arms all crossed the pan. The pump now hangs inside the forward bowl on a short chain from the crankshaft, 12.7 mm from the pan skin. The charging cable follows the block above the pan rail and passes 27.7 mm in front of the pan. The bellhousing flange meets the rear face of the block, 5.4 mm from the pan. The mount arms start on the block wall and stay 17.8 mm from the pan rim. The pump housing, its chain and each of these stations are estimated.',
      'Move or reshape each part so it clears the pan, then add exact mesh checks for the pump, the cables and the bellhousing at stock height and with the spring kit.',
      [link('Inspect the installed oil sump',garageLink('g500',{part:'powertrain.sump'})),link('Inspect the oil pump',garageLink('g500',{part:'powertrain.oil-pump'}))],'done'),
    work('g500-engine-bay-overlaps','P2',['g500'],'Clear the overlaps left around the G500 engine and gearbox',
      'The oil-pan check found three overlaps away from the pan. The engine mounts stood below the frame, and the right one crossed the front differential housing. Each mount now stands on a bracket on its frame rail, 95.0 mm above the differential at stock height. The starter lay beside the gearbox, inside the bulkhead and the floor, and its cable passed through the bellhousing. The starter now lies along the right side of the block, and its cable crosses the back of the engine bay 85.0 mm above the bellhousing. The gearbox crossed the floor pan, a frame crossmember and the body structure. Its main case is slimmer, the tunnel is wider over the bellhousing, the floor and the bulkhead open around the transmission, and the crossmember sits behind the oil pan. The gearbox now clears the floor pan by 8.0 mm, the body structure by 32.1 mm and the crossmember by 35.0 mm. The vapor purge line also passed through the gearbox and now crosses the bulkhead beside the starter cable. These shapes and stations are estimated.',
      'Measure each pair with the exact mesh checks, move or reshape the parts so they clear, then add those checks at stock height and with the spring kit.',
      [link('Inspect the engine mounts',garageLink('g500',{part:'powertrain.engine-mounts'})),link('Inspect the gearbox',garageLink('g500',{part:'drivetrain.gearbox'}))],'done'),
    work('g500-atf-pan-seat','P1',['g500'],'Seat the G500 transmission pan on its case',
      'The transmission oil pan hung 166.6 mm under the gearbox with its gasket, filter and hydraulic unit, and reached 62 mm behind the output flange. The front propeller shaft ran between the case and the pan, and both cooler unions stood in the open. The case now carries a hydraulic housing that ends in a flat pan rail. The gasket meets the rail and the solenoids meet the housing ceiling, each across a 1.0 mm joint line, and the pan ends ahead of the output flange. The rail stands 30 mm left of the crank line, which leaves 8.5 mm between the housing and the front propeller shaft. Each cooler union stands on a flank of the bell, above the shaft. The housing, its offset and the union positions are estimated.',
      'Give the case a pan rail, seat the pan, the gasket and the hydraulic unit on it clear of the front propeller shaft, then add exact mesh checks for each joint at stock height and with the spring kit.',
      [link('Inspect the transmission oil pan',garageLink('g500',{part:'transmission-fluid.pan'})),link('Inspect the gearbox',garageLink('g500',{part:'drivetrain.gearbox'}))],'done'),
    work('g500-unattached-parts','P1',['g500'],'Attach the G500 parts that hang clear of their carriers',
      'A survey joins installed parts whose surfaces come within 5 mm and leaves out wires, hoses and pipes, which carry nothing. 38 groups of parts are not joined to the frame. The widest gaps are the heater circulation pump at 45.1 mm, the GPS antenna at 35.1 mm and the receiver-drier at 33.7 mm. The alternator, the belt tensioner, the starter, the oil pump and the power-steering pump stand off the engine with no brackets. The A/C compressor sits closer to the front differential than to the engine. The rest are control units, trim covers, lamps and seat-belt fittings a few millimetres from their carriers. The survey measures gaps and does not judge them: a bracket, clip or hinge that is not drawn leaves the same gap as a misplaced part.',
      'Review each group against its parts diagram. Draw the missing bracket or move the part to its carrier, then remove the group from the survey baseline.',
      [link('Inspect the alternator',garageLink('g500',{part:'electrical.alternator'})),link('Inspect the A/C compressor',garageLink('g500',{part:'hvac.compressor'}))]),
    work('g500-installed-overlap-survey','P2',['g500'],'Check every installed G500 part for overlaps',
      'The exact mesh check now runs across every pair of installed parts at both ride heights. 587 pairs cross, and all are intended: 321 inside one system, 167 reviewed mounts and 99 places where a wire, hose or pipe ends. No errors remain. The first survey found 231; they were cleared at the wheel ends, the front cooling stack, the engine top, the frame crossmembers, the inner wheelhouses, the body floor, the fuel tank, the steering linkage, the cooler pipes, the rear exhaust, the center console, the cabin wiring, the passenger floor over the transfer case, the steering hoses, the dashboard, the heater unit, the engine-bay lines, the steering gear, the battery well and the passenger seat track. The sorting follows written rules and a reviewed list, so a pair can be on the wrong side.',
      'Run the exact mesh check across every pair of installed parts at both ride heights. Separate intended joints from errors, then list the errors by system.',
      [link('Inspect the frame',garageLink('g500',{part:'suspension.frame'})),link('Inspect the primary cables',garageLink('g500',{part:'electrical.primary-power'}))],'done'),
    work('g500-wiring-routes','P2',['g500'],'Route the G500 wiring clear of trim, seats and ducts',
      'The dashboard is now a 20 mm skin over a hollow, so the lines to the units behind it rise in the gap in front of the heater unit and reach the center-stack units from behind the fascia. The engine, lamp and differential-lock leads leave the cabin through bulkhead grommets. The transmission lead drops through the tunnel inside the console to a plug on the gearbox tail. The overhead bus branch runs inside the right windshield pillar and roof rail, clear of the door frame. The routes and grommet positions are estimated.',
      'Reroute each harness along the floor channels, the sills and the pillars, then remove its pairs from the survey baseline.',
      [link('Inspect the interior CAN lines',garageLink('g500',{part:'electrical.can-b'})),link('Inspect the comfort harness',garageLink('g500',{part:'electrical.comfort-harness'}))],'done'),
    work('g500-hose-pipe-routes','P2',['g500'],'Route the G500 hoses and pipes clear of the frame and engine',
      'The heater return tube and both refrigerant lines now share a lane outboard of the right ignition coils, above the exhaust manifold. The suction hose drops ahead of the right damper and reaches the compressor inboard of the spring. The expansion-tank vent runs forward above the spring tower; its outlet passes under the manifold and inboard of the spring. The lower radiator hose rises over the belt tensioner to the pump inlet. The purge hose to the intake runs back over the brake booster and behind the heads. The rear purge line passes outboard of the frame rail and threads between the rear spring and damper. All routes are estimated.',
      'Reroute each hose and pipe around the parts it crosses, then remove its pairs from the survey baseline.',
      [link('Inspect the refrigerant lines',garageLink('g500',{part:'hvac.refrigerant-lines'})),link('Inspect the heater return hose',garageLink('g500',{part:'cooling.heater-return'}))],'done'),
    work('g500-underbody-overlaps','P2',['g500'],'Open the G500 body and floor around the axles, shafts and wheels',
      'The passenger seat’s inner track sits 47 mm further outboard than the driver’s, clear of the floor hump over the transfer case. The expansion-tank outlet now drops between the right manifold and the inner wheelhouse. The center-tunnel fuse box stands against the passenger-side wall of the console, between the drivetrain bus connector and the rear SAM. These positions are estimated.',
      'Shape the body floor, the wheel arches and the tunnel around the running gear, then remove those pairs from the survey baseline.',
      [link('Inspect the body structure',garageLink('g500',{part:'body.structure'})),link('Inspect the transfer case',garageLink('g500',{part:'differentials.center'}))],'done'),
    work('g500-chassis-overlaps','P2',['g500'],'Clear the overlaps in the G500 engine bay and chassis',
      'The steering box sits 58 mm further forward on the outside of the left frame rail, clear of the spring and damper. Its shaft drops behind the left cylinder head, runs forward inboard of the spring and climbs over the rail to the box input. The steering reservoir sits forward and outboard on its pump, clear of the head and the oil filter. The heads’ outer skirts stop short of the front spring caps, and the expansion tank’s inner face clears the right manifold. These shapes and positions are estimated.',
      'Move or reshape each part so it clears its neighbour, then remove those pairs from the survey baseline.',
      [link('Inspect the air filters',garageLink('g500',{part:'intake.air-filters'})),link('Inspect the steering linkage',garageLink('g500',{part:'steering.linkage'}))],'done'),
    work('g500-cabin-packaging','P2',['g500'],'Separate the G500 dashboard units from the heater and the tunnel',
      'The heater unit sits in the hollow dashboard against the bulkhead, with its heater tubes and evaporator connection passing through to the engine side. COMAND, the upper control panel and the climate panel have their own openings in the center-stack fascia, and the fuse carriers clear the door and the bulkhead. The cabin battery is now a 353 × 175 × 190 mm unit in a well that passes through an opening in the body floor plate under the center rear seat, 50 mm above the rear propeller shaft. The center cushion has a thin base over it.',
      'Give each unit its own space behind the dashboard and on the tunnel, then remove those pairs from the survey baseline.',
      [link('Inspect the dashboard',garageLink('g500',{part:'body.dashboard'})),link('Inspect the heater core',garageLink('g500',{part:'hvac.heater-core'}))],'done'),
    work('s1000rr-engine-detail','P1',['bmws1000rr'],'Detail the 2023 S 1000 RR engine behind the fairings',
      'Compare both sides with parts fiches and photographs of the 2023 bike. Match the head, crankcase and side covers, intake bodies, coolant lines and header connections. Verify each connection with the fairings hidden.',
      'Use parts fiches and photos for the modeled generation to reproduce the cylinder head, crankcase and side covers, intake bodies, coolant lines, and header connections. Check both sides with the fairings hidden so the shapes and connection points are visible.',
      [model('S 1000 RR engine and systems','bmws1000rr'),model('S 1000 RR references','bmws1000rr','references')]),
    work('911-rr-shape-evidence','P1',['porsche993cab','porsche992scab','bmws1000rr'],'Record the source for unverified 911 and S 1000 RR contours',
      'For both Cabriolets and the 2023 RR, identify the contours still inferred from photographs. Link each to the exact variant drawing, CAD section or measurement when available. Start with the 911 rear quarters and folded tops, and the transverse profiles of the BMW fairings. Mark the sections that still need measurements.',
      'The existing side views leave the cross-sections of these parts unresolved.',
      [model('1998 Carrera references','porsche993cab','references'),model('2023 Carrera S references','porsche992scab','references'),model('S 1000 RR references','bmws1000rr','references')]),
    work('sl550-equipped-systems-review','P1',['sl550'],'Review the fully equipped SL550 one system at a time',
      'Use the 2014 US equipment list to map fitted options to their diagrams and installed parts. Start with the AIRSCARF blower and seatback outlets, then the massage seat pump, lines and cushions. Record which connections have been checked and which still need a source.',
      'The comfort options are present in the model. Their installed routes and connections still need an equipment-specific review.',
      [model('SL550 systems','sl550'),link('US 2014 SL manual',backlogSources.slManual),link('2014 SL equipment table',backlogSources.slBrochure+'#page=24')])
  ]},
  {id:'website-follow-up',name:'Portfolio and project publishing',items:[
    work('github-project-links','P2',[],'Link the playable projects to their GitHub source',
      'The project downloads already include source and run instructions. Select the projects for GitHub, publish the intended repositories, and link each project page to its matching repository. Verify that its instructions run from a fresh checkout.',
      'Source downloads are available on the site. The repository links are still outstanding.',
      [link('Projects','https://brandonfhuang.com/projects/#labs')]),
    work('portfolio-responsive-review','P2',[],'Check the portfolio refinements on mobile, tablet and desktop',
      'Review the homepage, the Projects page and the six original apps at 390 px, 768 px and a wide desktop size. Check the full name, headline and captions for clipping. Follow links by keyboard and verify that the interactive opening allows normal page scrolling.',
      'Check the approved design across the published pages and record any issues by page and viewport.',
      [link('Portfolio homepage','https://brandonfhuang.com/'),link('Projects','https://brandonfhuang.com/projects/')]),
    work('portfolio-public-launch','P1',[],'Prepare the portfolio for a secure public launch',
      'Review which pages, downloadable files and contact details are intended for public access. Check the proposed domain, HTTPS and visitor access, then verify the intended public pages from a signed-out browser when the launch is approved.',
      'The current portfolio uses restricted access. Public launch is a separate publishing decision.',
      [link('Portfolio homepage','https://brandonfhuang.com/')])
  ]},
  {id:'next-inspection',name:'Installed geometry and inspection',items:[
    work('installed-complete','P0',all,'Keep the full model assembled in the ordinary view',
      'Six passenger cars now keep their detailed engine geometry in the ordinary installed view. Continue the audit across other assemblies and vehicles for missing copies, disconnected pipes and floating hardware. For military exhibits, this pass covers public exterior geometry only.',
      'Detailed engines have passed interaction and rendering checks in six passenger cars. The remaining assemblies and vehicles still need verification.',
      [model('G500 installed systems','g500'),model('BMW installed systems','bmw325ci'),model('747 installed systems','boeing747')],'in-progress'),
    work('body-translucency','P1',all,'Inspect internals through a translucent body',
      'Six passenger cars have a See through body control. Solid panels are the default, and each vehicle remembers its last explicit setting. Check transparent surface ordering, part picking and the remaining vehicle types. The solid view must still conceal hidden geometry.',
      'The opacity control and rendering have been checked on six passenger cars. The other vehicle types remain under review.',
      [model('G500 context','g500'),model('325Ci context','bmw325ci')],'in-progress'),
    work('focus-installed-core','P0',all,'Focus smoothly on the component that was selected',
      'Installed part focus now moves toward the selected geometry; Return view and Escape restore the previous pose. The 992 engine opens around its rear core. Continue checks on both Porsche engines, their front cooling hardware and other vehicle types through selection, opening, separation and return.',
      'Part focus and the 992 rear-engine target have passed interaction and rendering checks. Other component paths remain under review.',
      [part('993 rear engine core','porsche993cab','engine','engine.case'),part('992 rear crankshaft','porsche992scab','engine','engine.crankshaft')],'in-progress')
  ]},
  {id:'next-systems',name:'Complete installed systems',items:[
    work('g500-full-exhaust','P1',['g500'],'Follow the G500 exhaust all the way to the outlet',
      'The early US route now includes both manifolds, four catalyst cans, two front silencers and a transverse main muffler ahead of the rear axle, ending at the left step. Sensors, shields and hangers are represented. Bend radii, internal sections and mounting clearances still need measured comparisons.',
      'The route is checked against the 463.249 workshop plan. Concealed sections and exact mounting dimensions remain illustrative.',
      [model('G500 systems','g500'),model('G500 source ledger','g500','references')],'in-progress'),
    work('g500-electrical-network','P1',['g500'],'Connect the G500 electrical equipment',
      'The electrical assembly now includes the battery and ground paths, starter, alternator, engine and transmission controllers, stability control, front and rear signal-acquisition modules, instrument cluster, and door and seat electronics. Trace the two data buses or follow the separate hardwired differential-lock and rear-seat-heater circuits.',
      'The early Mercedes training diagrams and location photographs establish the module positions and network connections. Exact harness lengths, board layouts and connector pin assignments still need vehicle-specific evidence.',
      [model('G500 electrical studies','g500'),model('G500 electrical references','g500','references')],'in-progress'),
    work('g500-cabin-climate-column','P1',['g500'],'Build the G500 heating, A/C and column mechanisms',
      'The cabin study now includes the heater matrix, evaporator, blower, filter, air flaps and ducts, plus the compressor, condenser fans, receiver-drier and refrigerant lines. Two column-adjustment drives, seat-heating pads and their controls are being checked with the installed cabin. Verify the remaining brackets, wiring and dashboard clearances.',
      'The named climate equipment is drawn. Column and seat-heat integration, wiring and exact mounting clearances remain under review.',
      [model('G500 cabin systems','g500'),model('G500 equipment references','g500','references')],'in-progress'),
    work('g500-cooling-intake','P1',['g500'],'Join the G500 cooling and intake paths',
      'The twin-filter intake, air metering, rear throttle and variable-length M113 manifold are being joined to the installed engine. Cooling work covers the radiator, hoses, pump, thermostat, bypass, expansion tank and heater loop. Check shared hose ports, duct joints and supports against their actual space under the hood.',
      'Installation and connection checks are in progress; concealed bends and exact mounting clearances remain illustrative.',
      [model('G500 intake and cooling','g500'),model('G500 engine references','g500','references')],'in-progress'),
    work('road-applicable-systems','P1',road,'Bring each road vehicle to the same system depth',
      'Apply the G500 review standard to exhaust, electrical equipment, cooling and intake on every road vehicle. Add heating, A/C and powered column mechanisms only where fitted. Keep the air-cooled 993, water-cooled 992, Honda CVT and motorcycle layouts distinct; resolve the F-350 engine first.',
      'The 325Ci, both 911 Cabriolets and the S 1000 RR have their own installed systems and component studies. Hidden line routes and mounting dimensions still need independent measurements.',
      road.map(id=>model(vehiclePriorities.find(v=>v.id===id).name,id)),'in-progress'),
    work('civil-other-system-depth','P2',otherCivil,'Trace the applicable systems in each civil exhibit',
      'For ships, yachts, fishing vessels, the submersible and civil space exhibits, map the documented propulsion, electrical supply, heat rejection and occupied-space air systems. Use the identified hull or mission configuration and show physical connections before adding deeper internals.',
      'Different vessels and spacecraft need their own installed-system evidence rather than automotive component names.',
      [model('Tanker machinery','seawisegiant'),model('Alvin systems','alvin'),model('Apollo cabin systems','apollo-falcon')])
  ]},
  {id:'next-cabins',name:'Civil aircraft cabins and safety',items:[
    work('civil-cabin-safety-coverage','P1',civilAircraft,'Inspect the whole civil aircraft cabin',
      'Give each civil aircraft a connected interior from flight deck through passenger and service areas. Expand seats and restraints, doors and windows, cabin air, lighting and documented safety equipment. Check the interior against the outer shell and explain public passenger and crew safety with the correct manufacturer and FAA sources.',
      'A complete cabin needs an identified variant and completion, plus evidence for each safety feature shown.',
      [link('FAA passenger safety guidance',backlogSources.airlineSafety),link('FAA general aviation briefing',backlogSources.gaSafety),...civilAircraft.map(id=>model(vehiclePriorities.find(v=>v.id===id).name,id))]),
    work('747400-cabin-safety','P1',['boeing747'],'Choose and build a passenger 747-400 cabin',
      'Use Boeing D6-58326-1 sections 2.4–2.7 for the two decks, cabin cross-sections, stairs, galleys and doors. Select an operator layout before fixing seat rows, lavatories or crew stations. Add restraints, exit paths, lighting and the selected operator’s oxygen and flotation equipment, checked against FAA AC 121-24E.',
      'The decided airframe is KLM PH-BFB, a passenger 747-406 preserved at the Corendon Village Hotel. Fix its seat rows, lavatories and crew stations from KLM’s layout for that aircraft.',
      [model('747-400 cabin context','boeing747'),link('Boeing 747-400 cabin and door drawings',backlogSources.boeing400),link('FAA cabin safety guidance',backlogSources.airlineSafety)]),
    work('172s-cabin-safety','P1',['cessna172'],'Match the early 172S cabin and restraint layout',
      'Use the Cessna handbook issued 8 July 1998 for the early four-place 172S. Check seats, seat rails, harness anchors, doors, baggage restraints and panel layout; follow Figure 7-8’s heater, ventilation and defrost paths. Verify fitted fire extinguisher and emergency-equipment locations against one airframe and the FAA general aviation briefing topics.',
      'The decided baseline is the 8 July 1998 handbook for serials 172S8001 and on, without the Nav III panel.',
      [model('172S cabin context','cessna172'),link('Cessna early 172S handbook, operator copy',backlogSources.cessnaEarlyS),link('FAA passenger briefing topics',backlogSources.gaSafety)]),
    work('j5a-cabin-safety','P2',['piperj5'],'Document the J-5A’s three-place cabin',
      'Model the front pilot seat and wider rear bench, fabric-covered tube structure, door opening and visible restraint mounts. Use the museum’s J-5A and EAA’s documented 1940 owner airframe as comparison evidence; record their modifications separately. Confirm the selected example’s belts, heater and emergency equipment before presenting a safety breakdown.',
      'The decided example is the Western Antique Aeroplane & Automobile Museum’s 1940 J-5A. Record its later modifications separately; it is not the two-seat J-3.',
      [model('J-5A cabin context','piperj5'),link('Museum J-5A cabin reference',backlogSources.piperMuseum),link('EAA owner airframe and modifications',backlogSources.piperOwner),link('FAA general aviation briefing',backlogSources.gaSafety)]),
    work('g800-cabin-safety','P2',['gulfstreamg800'],'Choose one G800 cabin completion',
      'Compare Gulfstream’s three living areas with a dedicated crew compartment against its four-area layout. Choose one documented completion before fixing seats, divans, galley, lavatories and baggage access; the advertised maximum of 19 seats is not a universal floor plan. Add the fitted restraints, cabin air, exits and safety-equipment locations from completion-specific evidence and FAA guidance.',
      'The decided cabin is Gulfstream’s three living areas with a dedicated crew compartment. Place its seats, galley, lavatories and safety equipment from that plan.',
      [model('G800 cabin context','gulfstreamg800'),link('Gulfstream cabin plans and specifications',backlogSources.gulfstream),link('FAA passenger safety guidance',backlogSources.airlineSafety)]),
    work('military-public-safety','P2',heritage,'Keep military reviews to public exterior and general crew safety',
      'Check museum-visible exterior contours, glazing, public entry openings, steps and access clearances. Explain general crew restraints and publicly documented exit locations at an educational level. Exclude weapon internals, mission systems and operating or emergency action sequences from the geometry and breakdown scope.',
      'These exhibit reviews cover public appearance and general occupant safety, with no operational-system expansion.',
      [model('Sherman museum references','sherman-e8','references'),model('F-16 public references','f16','references'),model('Chinook public references','ch47','references')])
  ]},
  {id:'next-variants',name:'Model families, years and trims',items:[
    work('model-variant-selector','P1',all,'Choose a model family, then its year and trim',
      'The collection now groups choices by model family and year/trim, including both 911 Cabriolets. Check the remaining market, powertrain and option combinations while preserving saved builds and existing links. The Mercedes-Benz SL family opens on the US 2014 SL550. The SL63 AMG remains under review.',
      'The family and year/trim controls have passed interface checks. Further configurations still need review, including the proposed SL63 AMG.',
      [link('Current collection','./index.html#workbench'),link('2014 US SL operator’s manual',backlogSources.slManual),link('2014 MBUSA brochure, archive copy',backlogSources.slBrochure)],'in-progress'),
    work('evaluate-r231-sl550','P2',['sl550'],'Add the US 2014 SL550 R231',
      'The equipped US roadster is in the collection with AIRSCARF, multicontour massage, the folding hardtop and the M278 engine. Its references identify the selected factory options.',
      'Model admission and equipment selection are complete. Detailed verification continues on the SL550 vehicle review.',
      [model('Open the SL550','sl550'),link('US 2014 SL manual',backlogSources.slManual),link('MBUSA equipment table',backlogSources.slBrochure+'#page=24')],'done'),
    work('evaluate-r231-sl63','P2',[],'Evaluate the US 2014 SL63 AMG R231',
      'Establish the 5.5-liter biturbo AMG V8, 530 hp, 590 lb-ft, seven-speed MCT, AMG Active Body Control and 19-inch wheels. Compare the Performance Package’s 557 hp, 664 lb-ft and limited-slip differential, optional carbon-ceramic brakes and 19-inch front/20-inch rear forged wheels. Keep its bodywork, brakes and drivetrain distinct from the SL550.',
      'Decided: the base US 2014 SL63 AMG, without the Performance Package or carbon-ceramic brakes. Build it after the SL550 review is complete.',
      [link('US 2014 SL operator’s manual',backlogSources.slManual),link('MBUSA AMG specifications and options, archive copy',backlogSources.slBrochure+'#page=24')])
  ]},
  {id:'next-copy-voice',name:'Writing and voice review',items:[
    work('copy-voice-next-pass','P1',all,'Make the explanations precise and natural to hear',
      'The site reads its explanations with Bruno, an American male neural voice. The Garage includes recordings for common passages and generates others on the device. Keep checking model names, pronunciation and pacing as new component studies are added.',
      'The workbench instructions and an uncached explanation both played in the browser. Pronunciation review continues as the collection grows.',
      [link('Garage and component explanations','./index.html#workbench'),link('Project priorities','./priorities.html#vehicles')],'in-progress')
  ]}
];

export const additionalRequestAssignments=assignments;
