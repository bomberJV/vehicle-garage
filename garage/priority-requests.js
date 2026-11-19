import {garageLink} from './priority-vehicles.js';
import {additionalRequestSections} from './priority-backlog.js';

const site='https://brandonfhuang.com';
const link=(label,url)=>({label,url});
const part=(label,vehicle,assembly,open)=>link(label,garageLink(vehicle,{assembly,open}));
const tool=(label,vehicle,tool)=>link(label,garageLink(vehicle,{tool}));
const work=(id,status,title,description,links)=>({id,status,title,description,links});
const equipment=(label,vehicle,category)=>link(label,garageLink(vehicle,{tool:'customize',section:'equipment',equipment:category}));
const g500Equipment=category=>[equipment('G500 equipment','g500',category)];

export const requestSections=[
  {id:'workbench',name:'Using the model',items:[
    work('occlusion-report','shipped','Stop hidden parts from showing through solid panels','Solid panels hide the hardware behind them. In the see-through view, windows and body panels are ordered at each pixel. The same layers stay in place when you hover over a part.',[
      link('Orbit the G500',garageLink('g500',{tool:'systems'})),part('Open a part from the BMW door','bmw325ci','body','body.door')]),
    work('compact-explosion','shipped','Open just a small gap between parts','Compact opens parts to 18% of their full travel. Use the separation slider for a smaller gap or to follow a part farther out.',[
      link('Try the 993 crankcase',garageLink('porsche993cab',{assembly:'engine',open:'engine.case',explode:'1'}))]),
    work('complete-boxer','shipped','See both banks of the Porsche flat-six','The assembled engine shows three cylinders on each side of the crankshaft. The cross-section control lets you cut the engine when you want to inspect its interior.',[
      link('1998 Carrera engine',garageLink('porsche993cab',{assembly:'engine'})),link('2023 Carrera S engine',garageLink('porsche992scab',{assembly:'engine'}))]),
    work('inspection-motion','shipped','Open a part without losing your place','Hover to highlight, click to select and double-click to open a part. The camera eases into the new view and fades between levels. Back restores the previous angle and part positions.',[
      part('Open an E46 door','bmw325ci','body','body.door')]),
    work('exploded-parts','shipped','Move one piece and put it back','Drag a part while assembled or exploded. Expansion now keeps related pieces closer together. Return part and Return all move the pieces smoothly back to where they started. Expand is available only when the current view has parts to separate.',[
      part('Try a front brake','g500','brakes','brakes.front')]),
    work('surface-order','partial','Keep glass, rims and panels in the right order','The road models have separate wheel faces, glass and door hardware. The drawing order and G-Wagen panel separation have dedicated checks. Very small clearances and unusual camera angles still need visual checks on individual models.',[
      part('G-Wagen wheel','g500','wheels','wheels.rim'),part('BMW window and door','bmw325ci','body','body.door')]),
    work('references','shipped','Put the evidence next to every model','Each of the 36 vehicles has a first reference, a description of what it establishes and a model-specific list of sources. Systems opens an assembly or component directly.',[
      tool('G-Wagen references','g500','references'),tool('Cessna systems','cessna172','systems')]),
    work('model-validation','open','Check the shape against measurements','The remaining work is a vehicle-by-vehicle comparison with measured sections, dated plans and photographs of the same variant. Body curvature, hidden spaces and accessory clearances still need independent measurements.',[
      link('See each vehicle’s next check','#vehicles')])
  ]},
  {id:'cars',name:'Road vehicles and build options',items:[
    work('brush-guards','shipped','Fit the 2002 G500 brush guard','The polished tube wraps around both headlamps. Two black padded uprights meet the lower tie bar and the hinged bumper mounts.',g500Equipment('brush-guards')),
    work('rear-ladders','shipped','Fit the G500 rear ladder','The four-step Front Runner ladder mounts beside the spare.',g500Equipment('ladders')),
    work('raised-intakes','shipped','Fit the G500 raised intakes','Follow the two ORC ducts from the G500 front fenders to the windshield pillars.',g500Equipment('raised-intakes')),
    work('driving-lights','shipped','Fit the available road lighting','The Eurowise brackets carry a pair of auxiliary lamps at the G500 hood corners. The 993 Cabriolet has the period US Litronic headlamp retrofit.',[...g500Equipment('auxiliary-lighting'),equipment('993 Cabriolet headlamps','porsche993cab','headlights')]),
    work('police-lights','shipped','Preview G500 display lights','The G500 builder includes a steady red-and-blue light bar labeled as a design mock-up.',g500Equipment('display-lighting')),
    work('lift-kits','shipped','Compare the G500 spring lift and 992 front-axle lift','The ORC spring kit raises the G500 at both axles. On the 2023 Carrera S Cabriolet, the optional factory system raises the front for obstacles.',[tool('G500 spring kit','g500','customize'),tool('992 front-axle lift','porsche992scab','customize')]),
    work('put-top-up','shipped','Put the Cabriolet roof up or down','Close the fabric top on either Porsche and compare its roofline and rear window. Lower it again to see the open cabin.',[
      tool('1998 Carrera Cabriolet','porsche993cab','customize'),tool('2023 Carrera S Cabriolet','porsche992scab','customize')]),
    work('325ci-dimensions','shipped','Check the US 325Ci against BMW’s drawings','The stock coupé can be measured in three views. The side view also marks five points from the roof, hood and trunk profile on page 147 of the manual.',[
      link('Compare the 325Ci',garageLink('bmw325ci',{tool:'references',drawing:'dimensions'})),part('Rear vent window','bmw325ci','body','body.quarter-left'),part('DISA intake flap','bmw325ci','powertrain','powertrain.disa')]),
    work('g500-dimensions','shipped','Measure the stock G500 against the US manual','The side, front and rear elevations use the installed model. Compare length with the spare, mirror width, roof height, wheelbase and both tracks with Mercedes’ figures.',[
      link('Compare factory dimensions',garageLink('g500',{tool:'references',drawing:'dimensions'}))]),
    work('g-wagen','partial','Finish the early G-Wagen inside and out','The cargo door now opens from the right. The five-spoke wheels, axle location, lamp assemblies, M113 intake and sliding roof have individual drawing checks. Door-jamb depths, gutter cross-sections and several concealed routes still need measurements.',[
      tool('G500 systems','g500','systems'),part('Front fog lamp','g500','lighting','lighting.fog-left'),part('Center lock','g500','differentials','differentials.center')]),
    work('porsche-pair','partial','Keep the two manual 911 Cabriolets distinct','The 1998 Carrera and 2023 Carrera S have their own bodies, glazing, roof and rear spoiler mechanisms. Each engine lets you select the crankshaft before expanding it and open the split crankcase. Both bodies still need more cross-sections, especially around the folded tops.',[
      part('1998 crankcase','porsche993cab','engine','engine.case'),part('2023 crankshaft','porsche992scab','engine','engine.crankshaft'),part('2023 spoiler drive','porsche992scab','shell','shell.spoiler-drive')]),
    work('road-variants','shipped','Use the right BMW, Honda and motorcycle','The coupe is the 2003 BMW 325Ci, alongside the US-market Honda HR-V and 2023 BMW S 1000 RR. Each has its own bodywork and component list.',[
      tool('325Ci','bmw325ci','systems'),tool('HR-V','hrv','systems'),tool('S 1000 RR','bmws1000rr','systems')]),
    work('car-interiors','partial','Follow what sits behind the door card and under the floor','Door studies include the latch, regulator and hinges. The floor separates into its structure, underlay and carpet. The collection still needs measurements for trim thickness, fastener locations and variant-specific wiring.',[
      part('325Ci door','bmw325ci','body','body.door'),part('G500 floor','g500','floor','floor.pan')]),
    work('road-engines','partial','Trace power from the engine to the wheels','Engine bays include nested studies of spark plugs, ignition and rotating parts. The HR-V opens to its CVT belt and pulleys. The 1993 F-350 still needs an identified engine option before its engine bay can be drawn to the same depth.',[
      tool('BMW engine and ignition','bmw325ci','systems'),part('Honda CVT','hrv','drivetrain','drivetrain.gearbox'),tool('Ford options','f350','references')]),
    work('vehicle-paint','shipped','Try a paint color and keep it','The finish selector includes yellow, a free color picker and saved swatches. Pick a road vehicle to see the finish on its panels.',[
      link('Paint a 911',garageLink('porsche993cab',{tool:'customize',section:'paint'}))]),
    work('accessories','partial','See wheels, racks and body kits before buying','Wheel designs, roof and cargo gear, aero parts and a motorcycle seat cowl have visual previews. Product listings and fitment notes accompany supported options. The catalog covers selected combinations and prices can change.',[
      tool('G500 racks and wheels','g500','customize'),tool('325Ci aero and wheels','bmw325ci','customize'),tool('Motorcycle accessories','bmws1000rr','customize')])
  ]},
  {id:'fleet',name:'Aircraft, spacecraft and vessels',items:[
    work('all-vehicles','shipped','Browse the whole collection','All vehicles and All types make the full collection available. Land, Air and Sea narrow it to cars, motorcycles, tanks, aircraft, helicopters, space vehicles, rovers, ships, fishing boats, yachts and submersibles.',[
      link('Open the collection','./index.html#workbench'),link('Browse the vehicle register','#vehicles')]),
    work('aviation','partial','Draw the windows and propulsion for each aircraft','The 747-400, 172S, J-5A and G800 have distinct glazing and propulsion studies. Public drawings constrain their outlines. Individual window reveals, cabin layouts and engine options still depend on the chosen airframe.',[
      part('747 flight-deck glazing','boeing747','fuselage','fuselage.cockpit'),part('172S propeller','cessna172','propeller','propeller.hub'),tool('G800 systems','gulfstreamg800','systems')]),
    work('space','partial','Open the Apollo lander and follow the crew air','Apollo 15 connects the Saturn V, the lunar module Falcon and its rover. You can open cabin environmental systems and wheel drives. Atlas V, Mars 2020 and SpaceX studies cover different vehicles and missions. Exact as-flown stowage and hidden connections remain incomplete.',[
      tool('Saturn V systems','saturn-v','systems'),part('Lunar module cabin air','apollo-falcon','interior','interior.ecs'),part('Rover wheel drive','apollo-lrv','wheels','wheels.wheel1'),tool('Atlas V systems','atlas-v-541','systems')]),
    work('maritime','partial','Trace the machinery inside the ships','Compare a tanker’s steam turbine, a container ship’s diesel and a yacht’s waterjets. The collection includes heavy lift, cargo, sportfishing, commercial fishing and a research submersible. Compartment shapes and engine options vary by vessel and refit.',[
      part('Tanker turbine','seawisegiant','propulsion','propulsion.main-turbine'),part('Azzam waterjet','azzam','propulsion','propulsion.jet-0'),tool('Araho systems','araho','systems')]),
    work('heritage','partial','Match the military exhibits to a documented exterior','The two tracked exhibits, F-16, F-22, F-35, B-52, Black Hawk, Little Bird and Chinook have museum or manufacturer references. The open checks cover visible details such as glazing, wheel spacing and exterior contours.',[
      tool('Sherman references','sherman-e8','references'),tool('F-22 references','f22','references'),tool('Chinook references','ch47','references')])
  ]},
  {id:'notebook',name:'Research, writing and listening',items:[
    work('dark-matter','shipped','Ask what galaxy rotation curves can actually tell us','The dark matter working paper reviews recent constraints and candidate mechanisms. It fits two halo profiles to 100 SPARC galaxies and compares 600 synthetic cases. The figures, measurements and analysis code can be downloaded with the paper.',[
      link('Read the paper',site+'/projects/papers/dark-matter-2026/'),link('See the synthetic experiment',site+'/projects/papers/dark-matter-2026/#recovery')]),
    work('medical','shipped','Run three medical AI experiments','The studies ask when a classifier should defer, how wide a prediction interval should be and what happens when inputs go missing. Each uses held-out predictions from a public dataset and includes the code and results.',[
      link('Open the three experiments',site+'/projects/play/medical/')]),
    work('narration','shipped','Listen beside the text','Speaker controls play the site’s explanatory passages and component descriptions. The recordings use a lower American male voice. Controls in the garage also read out the current inspection.',[
      link('Open the garage','./index.html#workbench'),link('Listen to the experiments',site+'/projects/play/medical/')]),
    work('portfolio-writing','shipped','Introduce the portfolio','The homepage introduces Brandon and his approach to exploring new ideas.',[
      link('Read the introduction',site+'/')]),
    work('project-priorities','shipped','Keep the open work visible','Change a priority or workflow status on any row. Filter by environment or vehicle type, or hide whole categories. Each vehicle links to its next check and a reference.',[
      link('See the vehicle register','#vehicles')])
  ]},
  ...additionalRequestSections
];
