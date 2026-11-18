import {slReferences} from './sl550-sources.js';
import {addedServiceGroups} from './vehicle-service.js';
import {bodyDrawing,coupeFiling,e90Specs} from './factory-dimensions.js';
import {e90Sources} from './e90-xdrive.js';
import {g500AxleSources} from './g500-underbody.js';
import {e46Sources} from './e46-running-gear.js';
import {bmwServicePlacementSources} from './bmw-fuel-system.js';
import {getDrawingCheck} from './vehicle-drawing-checks.js';
// Each entry names the kind of evidence and the particular feature it can establish.
// A catalog drawing establishes part relationships; its perspective is not a dimensional survey.
const ref = (kind, label, url, scope) => ({kind, label, url, scope});
const parts = (label, url, scope) => ref('Parts diagram', label, url, scope);
const drawing = (label, url, scope) => ref('Engineering drawing', label, url, scope);
const plan = (label, url, scope) => ref('Arrangement plan', label, url, scope);
const photo = (label, url, scope) => ref('Photograph', label, url, scope);
const specs = (label, url, scope) => ref('Specifications', label, url, scope);
const diagram = (label, url, scope) => ref('Illustrated reference', label, url, scope);
const model = (label, url, scope) => ref('3D reference', label, url, scope);

const commonWaterjet = drawing('Kongsberg · KaMeWa S-4 waterjet arrangement', 'https://www.kongsberg.com/contentassets/a00862ffce414231881defb553ee4b56/04.waterjet-2p-31.08.20.pdf#page=2', 'Related component design. The side and end elevations on page 2 show a steering jet at the transom and the intake duct extending forward. The detail view follows this orientation. This later series supplies a geometric comparison only; the exact jet fitted to this yacht has not been established.');

const references = {
  g500: [
    drawing('Mercedes-Benz USA · G-Class electrical training','https://www.fourbyfourclub.com/Manuals/W463249Electrical.pdf#page=17','The early W463 diagrams identify the cabin and drivetrain network members and their connector groups.'),
    photo('Mercedes-Benz USA · control module locations','https://www.fourbyfourclub.com/Manuals/W463249ComponentLocation.pdf','The photographs place modules in the footwells, doors and console. They establish which compartment each unit occupies.'),
    drawing('Mercedes-Benz · M113.962 exhaust layout','https://charm.li/Mercedes%20Benz/2007/G%20500%20%28463.249%29%20V8-5.0L%20%28113.962%29/Repair%20and%20Diagnosis/Engine%2C%20Cooling%20and%20Exhaust/Exhaust%20System/Description%20and%20Operation/','Workshop drawing GF49.00-P-2000GB covers this engine and chassis. Follow the two banks to the transverse muffler and left-side outlet.'),
    parts('2002 G500 · heater and ventilation unit','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/a-c-heating/heater-core-control-valve','The HVAC case houses the evaporator, heater core and blower. The heater core connects to the engine coolant circuit.'),
    parts('2002 G500 · seat heater elements','https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/front-seat-components','The cushion and backrest each have a heating element beneath the upholstery.'),
    specs('2002 G-Class manual · steering wheel adjustment','https://www.manualsdir.com/manuals/118401/mercedes-benz-2002-g-class-2002-g-500-g-class-2002-owners-manual.html?page=81','The rocker on the driver’s door commands height and reach. The model shows both drives under the dash.'),
    drawing('Mercedes-Benz · long-wheelbase G 500 body elevations', bodyDrawing, 'Drawing P00.10-2351-50, printed page 25. The side and rear views locate window openings, door seams and the spare. This later W463 service drawing supplies proportions. The 2002 US manual sets the overall dimensions.'),
    photo('2002 US manual · cargo-door handle', 'https://www.manualsonline.com/manuals/mfg/mercedesbenz/2002_g_500.html?p=40', 'The rear view on printed page 37 identifies the outside handle. The model places it on the vehicle’s right, opposite the two hinges.'),
    specs('Mercedes-Benz · 2002 US wheel and tire sizes', 'https://www.manualsonline.com/manuals/mfg/mercedesbenz/2002_g_500.html?p=362', 'Printed page 359 specifies the 18-inch rim with a 7½-inch bead width, 43 mm offset and a 265/60 R18 tire.'),
    parts('Mercedes-Benz · five-spoke alloy wheel', 'https://parts.mercedesbenzofmiami.com/oem-parts/mercedes-benz-wheel-alloy-7-5x18-66470598', 'The catalog identifies the five-spoke wheel as B6 647 0598.'),
    parts('2002 G500 · air cleaner and intake ducts', 'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/air-fuel-delivery/air-intake', 'The intake plate separates the inlet hoses, air cleaner and filter elements. In the engine bay you can lift the covers and trace both branches to the meter.'),
    photo('Daimler · US G 500 launch photographs', 'https://www.motortrend.com/how-to/129-0204-usa-mercedes-benz-g500-wagon', 'Daimler’s April 2002 photographs show the early US lights, grille and optional front guard.'),
    photo('RM Sotheby’s · 2002 US G 500 photographs', 'https://rmsothebys.com/auctions/az23/lots/r0041-2002-mercedesbenz-g-500/', 'The gallery shows a 2002 US truck from several angles, including the open engine bay.'),
    diagram('Mercedes-Benz · battery installation', 'https://rk.mb-qr.com/en/463/', 'Use the battery position marked from December 2000. The 2002 US manual locates the battery in the cabin below the cup holder, ahead of the rear bench.'),
    parts('2002 G500 · fuel tank, pump and filter', 'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/fuel-system--fuel-system-components', 'The parts plate distinguishes the tank, straps, separate pump and filter, clamps and connections. The bends in the modeled hoses are approximate.'),
    parts('2002 G500 · front suspension', g500AxleSources.frontLinks.url, 'Two radius arms locate the live front axle fore and aft. A separate Panhard rod locates it laterally.'),
    parts('2002 G500 · rear suspension', g500AxleSources.rearLinks.url, 'The rear plate shows a separate pair of trailing arms and a lateral Panhard rod.'),
    parts('2002 G500 · sliding roof and shade', 'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/body-hardware/sunroof', 'The roof cassette has separate panel guides, sliding shade and drains. The operating manual describes the sliding and rear-lift positions.'),
    drawing('Mercedes-Benz · VG150E center differential', 'https://mbmanuals.com/pdf/mb463g500-vg150-transfer-case.pdf#page=16', 'Page 16 identifies the center differential inside the transfer case. Turn to page 5 for the exploded housing and shafts.'),
    parts('Mercedes-Benz · front fog lamps', 'https://parts.mercedesbenzofmiami.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/electrical--fog-lamps', 'The front bumper carries separate left and right fog-lamp assemblies. The catalog identifies the individual housings.'),
    parts('Mercedes-Benz · side marker lamps', 'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/headlights-lighting/side-marker-lamps', 'The US 2002 model has amber front and red rear side markers. The marker is distinct from the side turn repeater.'),
    parts('Mercedes-Benz · side turn repeater', 'https://www.mbpartsgiant.com/parts-list/2002-mercedes_benz-g500/headlights-lighting/side-repeater-lamps', 'The front fender repeater has its own lens assembly and seal.'),
    parts('Mercedes-Benz Classic USA · front axle differential', 'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/front-drive-axle--differential', 'The front-axle plate identifies the differential assembly, bearings and associated hardware.'),
    parts('Mercedes-Benz Classic USA · rear axle differential', 'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/universals-and-rear-axle--differential', 'The 2002 G500 rear-axle plate identifies the rear differential components independently of the front axle.'),
    drawing('Mercedes-Benz · differential lock actuation', 'https://mbmanuals.com/pdf/mb463g500-differential-locks.pdf#page=17', 'Pages 16–18 cover the axle lock. Pages 20–22 show how the center lock shifts inside the transfer case.'),
    parts('Mercedes-Benz USA · rear and side lighting', 'https://mbparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/electr-system--rear-side-lighting', 'The 2002 catalog identifies the side-marker lamp separately from the rear lamp assembly.')
  ],
  f350: [
    specs('Ford · 1993 commercial pickups and chassis', 'https://xr793.com/wp-content/uploads/2022/11/1993-Ford-Commercial-Trucks-Pickups-Chassis.pdf', 'Ford’s pickup dimensions table gives the regular cab a 133-inch wheelbase, 213.3-inch overall length and eight-foot box.'),
    specs('Diesel Hub · Sterling 10.25 applications', 'https://dieselhub.com/maintenance/sterling-axle-fluid.html', 'Cited in the configuration decision for the Sterling 10.25 under single-rear-wheel F-350s and the stronger pinion introduced in 1993. Housing and hub shapes in the model are estimated.')
  ],
  c63: [
    parts('Mercedes-Benz Classic USA · bumper assembly', 'https://classicparts.mbusa.com/v-2014-mercedes-benz-c63-amg--base--6-3l-v8-gas/body--bumper', '2014 C 63 AMG catalog. The cover, trim and fasteners are separate pieces. The catalog includes multiple body styles and equipment options.')
  ],
  hrv: [
    parts('Honda · front door panel and hinges', 'https://www.hondapartsnow.com/parts-list/2026-honda-hr_v--5_door_ex_l_awd-cvt/body_air_conditioning/front_door_panels.html', 'US 2026 EX-L AWD catalog plate showing the bare front door, upper and lower hinges, door check and attachments.')
  ],
  hrvlx: [
    parts('Honda · 2026 HR-V LX AWD front door panels', 'https://www.hondapartsnow.com/parts-list/2026-honda-hr_v--5_door_lx_awd-cvt/body_air_conditioning/front_door_panels.html', 'US 2026 LX AWD catalog plate for the bare front door, hinges and check. The panel part numbers match the EX-L body.'),
    parts('Honda · 2026 HR-V LX AWD parts categories', 'https://www.hondapartsnow.com/2026-honda-hr_v--5_door_lx_awd-cvt-parts.html', 'The LX AWD catalog lists a roof lining but no roof slide components, and includes the propeller shaft and rear differential.')
  ],
  bmw328xi: [
    specs('Edmunds · 2008 328xi sedan specifications',e90Specs,'Length, width, height, wheelbase, both tracks and the 16 × 7 in wheels with 205/55R16 tires for the US 328xi sedan.'),
    photo('NHTSA · 2006 US 325i sedan, front three-quarter','https://commons.wikimedia.org/wiki/File:2006_BMW_325i_--_NHTSA.jpg','The pre-facelift US sedan body, headlamps, kidneys, front bumper and wheels; the 328xi shares this body and its lamps.'),
    photo('NHTSA · 2006 US 325i sedan, rear three-quarter','https://commons.wikimedia.org/wiki/File:2006_BMW_325i_--_NHTSA_02.jpg','The two-piece tail lamps, lid, plate recess and rear bumper of the pre-facelift US sedan.'),
    drawing('BMW · N52 engine, ST501 technical training','https://archive.org/download/BMWTechnicalTrainingDocuments/ST501%20New%20Engine%20Technology%20%28Archive%201%29/04_N52%20Engine.pdf','Magnesium-aluminium crankcase, Valvetronic, double VANOS and the electric coolant pump of the N52.'),
    drawing(e90Sources.xdrive.label,e90Sources.xdrive.url,'How the ATC 300 transfer case clamps its multi-plate clutch and drives the front axle through gears.'),
    parts(e90Sources.brakes.label,e90Sources.brakes.url,'The ventilated discs listed for the 2008 328xi sedan.'),
  ],
  bmw325ci: [
    specs('BMW of North America · model 0334 filing',coupeFiling,'The 2003 filing lists the 325Ci separately from the SULEV and 330Ci. Row 0334 gives the front track as 57.5 inches.'),
    parts('BMW · Style 43 alloy wheel','https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/wheels/bmw_light_alloy_wheel_star_spokes.html','Plate 36_0342 identifies the five-spoke cast wheel. Inspect its 16-inch rim and five mounting holes.'),
    drawing('BMW · M54 resonance intake','https://bmwtuning.co/wp-content/uploads/2023/08/BMW-M54-Training-Doc.pdf#page=42','BMW technical training ST036, pages 41–43. The sectional drawings show how the DISA flap changes the connection between the intake passages.'),
    parts('BMW · crankcase ventilation','https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/engine/crankcase_ventilation.html','The separator connects the engine breather to the intake. Oil returns through the dipstick guide.'),
    photo('2003 US 325Ci · exterior, cabin and engine bay','https://bringatrailer.com/listing/2003-bmw-325ci-coupe-4/','Photographs of a US M54 coupé provide a reference for the engine covers, expansion tank, glazing and early bodywork.'),
    parts('BMW · rear trailing arm and wishbones',e46Sources.rear.url,'The rear hub follows a trailing arm and two transverse arms. The coil spring and shock absorber have separate mounts.'),
    parts('BMW · propeller shaft and center bearing',e46Sources.propshaft.url,'The two shaft sections meet at a splined connection. A rubber-mounted bearing carries the shaft in the tunnel.'),
    parts('BMW · saddle tank and delivery units',bmwServicePlacementSources.pump.url,'Under the rear seat, the right tank lobe houses the electric pump. A suction jet transfers fuel across the tunnel.'),
    parts('BMW · E46 coupé window mechanism', 'https://www.bmwpartsdeal.com/parts-list/2003-bmw-325ci-coupe_m54_engine_e46/vehicle_trim/door_window_lifting_mechanism.html', 'Select diagram 1 for the front regulator of the 2003 M54 325Ci coupé. Diagram 2 covers the rear opening window.')
  ],
  sl550:slReferences,
  porsche993cab: [
    drawing('Porsche Classic · 993 Cabriolet outline','https://files.porsche.com/f/332100/e5c1d1c36c/rescue-data-sheets-classic.pdf#page=32','The side and plan outlines locate the fixed windshield and its A-pillars relative to the axles. The sheet includes roof-down photographs.'),
    parts('Porsche Cars North America · Cup Design ’93','https://members.rennlist.com/geolab/summer%20tire4440_1997_64047.pdf#page=5','The wheel illustration and table identify the 16-inch front and rear castings. Page 3 pairs the tires with each wheel width and offset.'),
    parts('Porsche PET · additional brake light','https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=654','Plate 905-10 shows the light and its retainers. The facing parts list specifies 24 bulbs.'),
    photo('Mecum · 1998 Carrera Cabriolet, Kissimmee 2023','https://www.mecum.com/lots/537096/1998-porsche-911-carrera-cabriolet/','Front and rear views show the US bumper guards, the stop-light bridge, the clear reversing lenses and the fabric sail behind each door window.'),
    parts('Porsche Classic · 993 crankcase and bearings', 'https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=34', 'Plate 101-05 shows the 1998 Carrera crankcase. Plate 101-10 on PDF page 38 covers the opposite half. Turn to plate 102-00 on page 42 for crankshaft and bearings.'),
    parts('Porsche PET · 993 engine', 'https://files.porsche.com/f/332100/cfbfd366e3/kat017-e-911-98-katalog.pdf#page=77', 'Use the Carrera plates in engine group 1 for the crankcase and crankshaft. Plate 105-00 shows the belt-driven engine cooling fan.'),
    parts('Porsche PET · 993 rear spoiler', 'https://www.design911.co.uk/diagrams/d/40739/0/', 'Plate 803-15 places the spoiler drive and transmission beneath the rear lid.')
  ],
  porsche996cab: [
    drawing('Porsche Classic · 996 Cabriolet outline','https://files.porsche.com/f/332100/e5c1d1c36c/rescue-data-sheets-classic.pdf#page=36','The side and plan views were read as vector paths and registered at the 2,350 mm wheelbase. They set the body outline, windshield, door cut, wheel openings, headlamp and tail-lamp outlines and the rear-lid louvres.'),
    specs('Excellence · 1999 911 Carrera Cabriolet (996) specifications','https://www.excellence-mag.com/resources/specs/58','Length 4,430 mm, width 1,765 mm, height 1,305 mm, wheelbase 2,350 mm, tracks 1,455 / 1,500 mm and the 7J and 9J × 17 wheels with 205/50 and 255/40 tires.'),
    photo('Bring a Trailer · 1999 Carrera Cabriolet 6-speed, US car','https://bringatrailer.com/listing/1999-porsche-911-carrera-71/','Front, rear and three-quarter views show the one-piece headlamps with amber US signals, the three front intakes, the louvred rear lid with its third brake light, the US plate guards and the 17-inch Carrera wheels.'),
    parts('Porsche PET · 996 crankcase, plate 101-005','https://eurospares.co.uk/Porsche/996/996_(1999)/PartDiagrams/101-005/CRANKCASE','The M96 crankcase is split vertically, with the cylinder bores cast into each half.'),
    parts('Porsche PET · 996 rear spoiler, plate 803-007','https://eurospares.co.uk/Porsche/996/996_(2001)/PartDiagrams/803-007/REAR_SPOILER','The lifting rear spoiler has its own drive unit and electric motor beneath the louvred panel.'),
    parts('TEILE.COM · 17-inch Carrera wheel set','https://teile.com/en/porsche-tequipment-shop/model-911-964/3/Wheels-Rims-and-accessories/601C-Wheel-rim-sets/218/17-inch-Carrera-wheel-set-7J-x-17-ET55-9J-x-17-ET55/39755','The 996 Carrera wheel: 7J × 17 ET55 front and 9J × 17 ET55 rear.')
  ],
  porsche992scab: [
    drawing('Porsche · 992 Cabriolet outline','https://files.porsche.com/f/332100/cae3f3bc15/rescue-data-sheets.pdf#page=86','The side and plan views locate the headlamp rims, side markers, cowl and axle centers. The upper outline also guides the fabric roof and the rear deck. The Carrera S specification sets the model’s overall height.'),
    photo('Porsche · Carrera S Cabriolet exterior photographs','https://newsroom.porsche.com/en/2019/sport-lifestyle/porsche-911-carrera-s-cabriolet-neel-jani-formula-e-christophorus-18122.html','The headlamp close-up shows the reflector and four small optics. The front and side views show the low intake band, the turned-under nose and the pressed lower doors.'),
    diagram('Porsche · standard LED headlamp, fig. 9_46_20','https://www.manualslib.com/manual/3961352/Porsche-911-Carrera-S-2020.html?page=37','The service illustration identifies the four round daytime optics around the shared high- and low-beam module. The rescue sheet supplies the lens outline.'),
    drawing('Porsche · Carrera S5 factory wheel','https://static.nhtsa.gov/odi/tsbs/2021/MC-10199859-0001.pdf#page=4','Certificate 51/21 shows the ten blades, five mounting holes and the staggered 8.5J × 20 and 11.5J × 21 sizes.'),
    photo('Miller Motorcars · closed Cabriolet, side','https://www.millermotorcars.com/imagetag/6764/14/l/Used-2021-Porsche-911-Carrera-S.jpg','This 992.1 Carrera S photograph locates the quarter-window tip, cloth sail and rear bow relative to the axle centers.'),
    photo('Miller Motorcars · rear glass and grille','https://www.millermotorcars.com/imagetag/6764/15/l/Used-2021-Porsche-911-Carrera-S.jpg','The rear three-quarter view shows the glass opening, the fixed grille with its paired centre lights and the thin light strip above the rear lettering.'),
    diagram('Porsche Engineering · 9A2evo engine section', 'https://a.storyblok.com/f/288757/x/7d68420fca/2019-02-en-porsche-engineering-magazine-engineering-in-the-data-space.pdf#page=63', 'The left-hand illustration on page 63 shows the three-litre turbo flat-six. It distinguishes the cylinder bores and crankcase from the separate cylinder heads.'),
    parts('Porsche · 992.1 crankcase', 'https://www.design911.co.uk/diagrams/d/50603/0', 'Carrera parts plate 101-100 identifies the two housing halves and crankcase hardware.'),
    parts('Porsche · 2023 Carrera S rear compartment', 'https://porsche.oempartsonline.com/v-2023-porsche-911--carrera-s--3-0l-h6-gas/body--rear-compartment', 'The 992 rear-deck blower installation includes separate fans and rubber mounts.'),
    diagram('Porsche · Carrera S Cabriolet press drawings', 'https://newsroom.porsche.com/dam/jcr%3A027b3198-602a-498d-b4fc-52e6e3b5261a/2020_911_Carrera_S_and_4S_Cabriolet_US_Press_Kit.pdf.PDF', 'Launch documentation for the 992.1 Cabriolet. It describes variable spoiler deployment and the water-cooled twin-turbo flat-six used by this generation.')
  ],
  bmws1000rr: [
    photo('2023 RR in Racing Red · right-side studio photograph','https://www.motociclismo.es/uploads/s1/11/22/67/34/bmw-s-1000-rr-2023-25.jpeg','The base bike has five split-spoke cast wheels, a stainless silencer, black tank shoulders and an open area under the upswept tail. The photo also locates the mirror pods and foot controls.'),
    parts('BMW · cast front wheel and bearings, 36_1423','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/36/36_1423/','The five paired arms branch near the hub and meet the rim at ten positions. The front bead seats are 3.50 inches apart.'),
    parts('BMW · cast rear wheel and bearings, 36_1424','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/36/36_1424/','The standard rear casting uses the same five split roots and a wider, six-inch rim. The catalog also lists the associated spacer and bearings.'),
    parts('BMW · fuel tank cover, 46_2162','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/46/46_2162/','The forward cover and side pieces meet the tank ahead of the rider’s knees.'),
    parts('BMW · tail panel fittings, 46_2488','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/46/46_2488/','The tail surrounds the separate seat. The drawing identifies the fixings. The side and three-quarter photographs supply the outer contour.'),
    parts('BMW · rear swingarm, 33_2315','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/33/33_2315/','The rear axle blocks sit at the ends of the two arms. The assembly pivots in the frame ahead of the rear wheel.'),
    parts('BMW · rear muffler, 18_1587','https://www.bobsmotorcycles.com/microfiche/parts/s-1000-rr-21-0e61-0e63-usa/18/18_1587/','The road bike carries the standard stainless silencer, part 18 51 8 564 952, with a bracket and rubber sleeve at the hanger.'),
    parts('BMW · K67 rear torque-transfer mechanism', 'https://www.realoem.com/bmw/enUS/showparts?diagId=33_2345&id=0E61-EUR---K67-BMW-S+1000+RR+21+%280E61%2C+0E63%29', 'K67 0E61/0E63 catalog, plate 33_2345. The rear sprocket, carrier and rubber dampers are separate components. Wheel options and markets affect ordering.')
  ],
  'little-willie': [
    photo('The Tank Museum · Little Willie', 'https://tankmuseum.org/article/little-willie', 'Museum photographs record the prototype’s low hull, exposed track run and box-shaped cabin.')
  ],
  'sherman-e8': [
    photo('The Tank Museum · M4A2E8 Sherman', 'https://tankmuseum.org/tank-nuts/tank-collection/m4-sherman-fury/', 'The museum identifies its surviving vehicle as an M4A2E8. Exterior photographs show the wide tracks and paired wheels.')
  ],
  boeing747: [
    drawing('Boeing · 747-400 airport planning drawing', 'https://www.boeing.com/content/dam/boeing/v2/airports/acaps/747-400_Rev_F.pdf', 'Section 2.2.1 gives top, side and front views of the passenger 747-400. Its published length and span set the wingtip envelope in this model.')
  ],
  cessna172: [
    drawing('Cessna · Model 172S pilot’s handbook', 'https://www.norcalflight.com/pdfs/poh/POH_C172S_Nav_III.pdf', 'Figure 1-1 gives the 172S three-view and dimensions in normal ground attitude. The drawing sets the wing span relative to length. This is the Nav III handbook.')
  ],
  piperj5: [
    photo('Western Antique Aeroplane & Automobile Museum · J-5A', 'https://www.waaamuseum.org/collections/airplanes/659-piper-j-5a-cub-coupe', 'The museum’s 1940 J-5A is the reference for the three-seat cabin, wing struts and tailwheel.'),
    specs('Sensenich · W70DK propeller', 'https://www.sensenich.com/shop/aircraft/wood/w70dk/', 'Reference for the example fixed-pitch wood propeller. The installation on the museum aircraft has not been identified.')
  ],
  gulfstreamg800: [
    diagram('Gulfstream · G800 aircraft profile', 'https://assets.gulfstream.aero/downloads/g800.pdf', 'The manufacturer’s side profile shows the raked windshield, oval cabin windows, aft nacelles and high tailplane.'),
    specs('Gulfstream · G800 specifications', 'https://www.gulfstream.com/en/aircraft/gulfstream-g800/', 'Gulfstream specifies sixteen panoramic windows. The assembled model has eight on each side.')
  ],
  f16: [
    photo('US Air Force · F-16C Fighting Falcon', 'https://www.dvidshub.net/image/7882477/nellis-welcomes-f-16-static-display-honoring-aggressor-heritage', 'Exterior reference for the single-seat canopy, single fin and intake below the nose.')
  ],
  f22: [
    photo('National Museum of the US Air Force · F-22A', 'https://www.nationalmuseum.af.mil/Upcoming/Photos/igphoto/2000412724/', 'Museum exterior photograph for the canopy, diamond-shaped wing planform and two outward-canted fins.')
  ],
  f35: [
    photo('US Air Force · F-35A exterior', 'https://www.dvidshub.net/image/9577219/luke-days-f-35a-lightning-ii-display', 'Public exterior reference for the A variant’s canopy, paired fins and single exhaust.')
  ],
  b52: [
    photo('US Air Force · B-52H static display', 'https://www.dvidshub.net/image/2347350/b-52h-static-display', 'The static-display photograph records the swept wing and arrangement of the paired engine pods.')
  ],
  uh60: [
    photo('US Army · UH-60M Black Hawk', 'https://www.dvidshub.net/image/9957876/uh-60m-black-hawk', 'Exterior reference for the cabin, main wheels and raised tail boom of the M variant.')
  ],
  mh6: [
    photo('US Army · MH-6M Little Bird', 'https://www.dvidshub.net/image/7306076/multi-use-helicopter-trainer-provides-safe-and-realistic-training-aircrews', 'The Army identifies the photographed helicopter as an MH-6M. Compare the bubble-shaped cabin, skid landing gear and narrow tail boom.')
  ],
  ch47: [
    photo('Boeing · CH-47F Chinook', 'https://www.boeing.com/defense/military-rotorcraft/h-47-chinook', 'Manufacturer exterior imagery shows the forward and aft rotor pylons, their different heights and the broad rear fuselage.')
  ],
  'saturn-v': [
    model('NASA · Saturn V three-dimensional model', 'https://science.nasa.gov/3d-resources/saturn-v/', 'NASA’s downloadable visualization gives another view of the assembled launch vehicle. Use the flight-specific press kit for the Apollo 15 configuration.'),
    diagram('NASA · Apollo 15 press kit', 'https://www.nasa.gov/wp-content/uploads/static/apollo50th/pdf/A15_PressKit.pdf', 'Contemporary mission reference for the Saturn V, Endeavour, Falcon and the first lunar rover.'),
    model('Smithsonian · scan of Columbia', 'https://3d.si.edu/object/3d/d8c63e8a-4ebc-11ea-b77f-2e728ce88125', 'A scan of the Apollo 11 command module provides a related cabin reference. Apollo 15 flew a different spacecraft, Endeavour.')
  ],
  'apollo-falcon': [
    drawing('Grumman / NASA · Falcon cabin arrangement', 'https://apollojournals.org/alsj/LM10HandbookVol1.pdf', 'LM-10 Operations Handbook, figures 1-7 through 1-10. The cabin drawings locate the two crew stations, forward hatch and equipment around them.'),
    model('NASA · Apollo Lunar Module 3D model', 'https://science.nasa.gov/3d-resources/apollo-lunar-module/', 'A downloadable visualization of the lunar-module family shows the two stages and deployed landing gear. The LM-10 handbook identifies Falcon’s cabin configuration.')
  ],
  'apollo-lrv': [
    drawing('NASA · Lunar Roving Vehicle traction drive', 'https://ntrs.nasa.gov/api/citations/20220018746/downloads/TP-20220018746.pdf', 'Figure 21 shows the Apollo wheel drive. Each corner of the rover has its own electric motor and reduction gear.'),
    photo('NASA · LRV-1 beside Falcon', 'https://www.nasa.gov/image-article/apollo-15-lunar-module-rover/', 'James Irwin prepares the deployed rover beside the lunar module at Hadley–Apennine. The photograph shows the flight vehicle’s wheels, fenders and equipment stowage.')
  ],
  'atlas-v-541': [
    diagram('NASA / JPL · Mars 2020 exploded spacecraft', 'https://www.jpl.nasa.gov/images/pia24128-mars-2020-expanded-spacecraft-illustration/', 'Plate PIA24128 shows how the cruise stage, backshell, descent stage, rover and heat shield nest inside the launch fairing.'),
    model('NASA · Perseverance 3D rover', 'https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/', 'Measured from the six deployed wheel meshes in NASA’s GLB. The tread is about 0.336 m wide and 0.525 m in diameter. Each middle wheel sits 0.122 m farther out than the front and rear wheel on its side.')
  ],
  'falcon-9': [
    diagram('SpaceX · Falcon 9 exterior and stages', 'https://www.spacex.com/vehicles/falcon-9/', 'The public vehicle profile separates the two stages and fairing and shows the single first-stage core. This is the Falcon 9 family profile.')
  ],
  'falcon-heavy': [
    diagram('SpaceX · Falcon Heavy exterior and stages', 'https://www.spacex.com/vehicles/falcon-heavy/', 'The exterior profile shows the central core between two strapped-on side boosters with nose caps.')
  ],
  'crew-dragon': [
    photo('NASA · Demo-2 mission archive', 'https://www.nasa.gov/nasas-spacex-demo-2-resources-archive/', 'Flight-specific photographs identify Endeavour as flown in May 2020, with its original crew cabin and trunk.'),
    diagram('NASA · Commercial Crew spacecraft guide', 'https://www.nasa.gov/wp-content/uploads/2015/10/commercial_crew_press_kit_2.pdf', 'The Crew Dragon illustration identifies the spacecraft and trunk. Consult the Demo-2 record for the actual flight configuration.')
  ],
  pioneeringspirit: [
    specs('Allseas · Pioneering Spirit vessel specifications', 'https://www.allseas.com/sites/d10p.allseas.com/files/2026-02/pioneering-spirit-vessel-specs-2026.pdf', 'The operator gives a 382 m hull, 124 m beam and 122 × 59 m bow slot. Its photographs show the current lifting equipment.')
  ],
  seawisegiant: [
    specs('Ship Science · Seawise Giant enlargement, 1981', 'https://zousen-shiryoukan.jasnaoe.or.jp/wp/wp-content/uploads/item/funenokagaku/funenokagaku-vol34-02.pdf', 'The contemporary Japanese shipbuilding journal compares the original and enlarged hull. The model depicts the later 458.45 × 68.8 m hull.')
  ],
  ooclspain: [
    specs('Port of Hamburg · OOCL Spain powerplant', 'https://www.hafen-hamburg.de/en/all-vessels/ship-specials/oocl-spain/', 'Port of Hamburg identifies the ship’s main engine. Compare the WinGD X92-B installation schematic to the separate twelve-cylinder model.'),
    specs('OOCL · OOCL Spain vessel particulars', 'https://www.oocl.com/eng/ourservices/vessels/gclass24188/Pages/ooclspain.aspx', 'The operator gives 399.990 m overall length and 61.30 m moulded breadth. These dimensions set the hull proportions. Deck containers represent an illustrative load.')
  ],
  azzam: [
    specs('Nauta Design · Azzam principal dimensions', 'https://www.nautadesign.com/en/design/product/180-azzam.html', 'The exterior designer gives a nominal length of 180 m and a beam of 20.8 m. The model’s hull measures within 0.2% of that beam-to-length ratio.'),
    commonWaterjet,
    diagram('Nauta Design · exterior design for Azzam', 'https://www.nautadesign.com/resources/docs/nauta-yacht-design-3-2013/yd3-2013june-july-nautayachts.pdf', 'Design imagery and commentary from the exterior designer identify the long foredeck, low superstructure, sloping stern and deck overhangs.')
  ],
  octopussy: [
    commonWaterjet,
    photo('Mulder Design · Octopussy', 'https://mulderdesign.nl/yacht/octopussy/', 'The naval architect documents both the original high-speed yacht and the later stern extension. This model follows the original 1988 hull.')
  ],
  araho: [
    drawing('Skipsteknisk · ST-115 Araho side elevation', 'https://www.skipsteknisk.no/assets/docs/Araho.pdf', 'The naval architect’s line drawing locates the wheelhouse, hauling gantry, stern gear and propeller nozzle. Its 59.13 m length and 14.94 m breadth set the hull proportions.'),
    photo('Eastern Shipbuilding · Araho yard photographs', 'https://www.easternshipbuilding.com/what-we-do/portfolio/fishing-vessel/araho/', 'The builder’s photographs show the forward deckhouse, after gantry and net-handling equipment.')
  ],
  viking90: [
    plan('Viking · 90 Convertible deck plans', 'https://www.vikingyachts.com/images/models/90C/90C.pdf', 'The builder’s brochure includes the saloon, cockpit and accommodation layouts. The gallery shows the open-bridge version with an optional tower.')
  ],
  alvin: [
    diagram('Woods Hole · Alvin vehicle diagram', 'https://ndsf.whoi.edu/wp-content/uploads/sites/67/2023/09/alvin-factsheet.pdf', 'WHOI specifies three 17-inch forward viewports and two 12-inch side viewports. The model follows this count and diameter ratio. The sheet also identifies the two sampling arms.'),
    specs('National Deep Submergence Facility · Alvin', 'https://ndsf.whoi.edu/alvin/', 'The operator identifies seven thrusters and describes the refurbished 6,500 m vehicle shown here.')
  ]
};

export function getVehicleReferences(vehicleId) {
  const primary = getDrawingCheck(vehicleId);
  if (!primary) return [];
  const additional = references[vehicleId].filter(row => row.url !== primary.url);
  const rows=[{...primary,kind:primary.kind+' · '+primary.variant},...additional];
  const urls=new Set(rows.map(row=>row.url));
  for(const group of addedServiceGroups(vehicleId)){
    for(const item of [group,...group.parts]){
      const src=item.source;
      if(!src?.url||urls.has(src.url))continue;
      urls.add(src.url);
      rows.push(diagram(src.label,src.url,src.scope||item.description));
    }
  }
  return rows;
}
