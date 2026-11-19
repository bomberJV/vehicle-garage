import {g500FilterSources} from './g500-filter-geometry.js';
import {m113DataSheet} from './g500-m113-geometry.js';
import {g500FlowRefs} from './g500-flow.js';
import {m113InternalStudies,m113InternalSources} from './g500-m113-internals.js';
import {g500CatalogStudies,catalogStudySources} from './g500-catalog-studies.js';

const rod={label:'Mercedes-Benz Classic USA · A 113 030 00 20 connecting rod for 4.3 and 5.0 SOHC V8s',url:'https://classicparts.mbusa.com/oem-parts/mercedes-benz-connecting-rod-1130300020'};
const training={label:'DaimlerChrysler technical training · M112/M113 engine repair, technical data, p. 3',url:'https://4vezde.com/wp-content/uploads/2023/10/2001.03_%D0%A0%D0%B5%D0%BC%D0%BE%D0%BD%D1%82-%D0%B4%D0%B2%D0%B8%D0%B3%D0%B0%D1%82%D0%B5%D0%BB%D0%B5%D0%B9_%D0%9C112-%D0%9C113.pdf'};
const fuelPlate={label:'Mercedes-Benz Classic USA · 2002 G500 fuel-system components',url:'https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/fuel-system--fuel-system-components'};
const firing={label:'Mercedes-Benz service data · M113.962 ignition order',url:'https://charm.li/Mercedes%20Benz/2003/G%20500%20%28463.249%29%20V8-5.0L%20%28113.962%29/Repair%20and%20Diagnosis/Powertrain%20Management/Ignition%20System/Firing%20Order/Specifications/Firing%20Order/'};

// M113 internals: each study part names its Mercedes number. Most come from
// the M113 5.0 diagram; the timing sprockets, chain and cover also carry G500 fitment pages.
const internalIds=study=>study.groups[0].parts.map(p=>p.id);
const [valves,rockers,cams,timing,bearings,oilDrive]=m113InternalStudies;
const internalClaims=[
 {ids:[...internalIds(valves),...internalIds(rockers),...internalIds(cams),...internalIds(bearings),...internalIds(oilDrive)],kind:'diagram',fact:'The M113 5.0 parts diagram lists each of these components by callout and Mercedes number. The G500 uses the same M113 5.0 engine family.',need:'Confirm each number against the G500 VIN and engine 113.962. The listing is from the E500 application of the same engine.',source:m113InternalSources.m113Plate},
 {ids:['g500-m113-timing.crank-sprocket','g500-m113-timing.intermediate','g500-m113-timing.chain'],kind:'diagram',fact:'The G500 engine timing listing gives the crankshaft sprocket, intermediate sprocket and timing chain numbers used here.',need:'Count chain links and measure sprocket tooth counts on the fitted engine.',source:m113InternalSources.g500Timing},
 {ids:['g500-m113-camshafts.sprockets','g500-m113-timing.intermediate'],kind:'diagram',fact:'The camshaft sprocket and intermediate sprocket are listed for the 2002–2008 G500.',need:'Measure sprocket diameters and offsets.',source:m113InternalSources.camGears},
 {ids:['g500-m113-timing.cover'],kind:'diagram',fact:'The 112-010-06-33 timing cover is listed for the 2002–2008 G500.',need:'Trace the cover outline and bolt pattern from the casting.',source:m113InternalSources.timingCover},
 {ids:internalIds(timing).filter(id=>!/crank-sprocket|intermediate|chain$|cover$/.test(id)),kind:'diagram',fact:'The M113 5.0 parts diagram lists the tensioner, rail, guides and front seal by number.',need:'Confirm numbers against the G500 VIN and measure the guide profiles.',source:m113InternalSources.m113Plate}
];
const [hvacModule,frontPinion,frontHousing]=g500CatalogStudies;
const catalogClaims=[
 {ids:internalIds(hvacModule),kind:'diagram',fact:'The 2004 G500 evaporator and heater diagram lists each of these components by callout and Mercedes number.',need:'Measure each part on the fitted module and confirm 2002 applicability by VIN.',source:catalogStudySources.hvacPlate},
 {ids:[...internalIds(frontPinion),...internalIds(frontHousing)],kind:'diagram',fact:'The G500 front axle diagram lists each of these components by callout and Mercedes number for the G500 and G55 AMG.',need:'Measure bearing cups, cones, seal bores and housing sections on the fitted axle.',source:catalogStudySources.frontAxlePlate}
];
export default [
 ...internalClaims,
 ...catalogClaims,
 {ids:['powertrain.block','powertrain.head-gasket'],kind:'dimensioned',fact:'The M113.962 data table gives the 97 mm nominal bore used for the eight cylinder openings.',need:'Measure the bore-end chamfers, casting exterior, deck, gasket outline and water passages.',source:m113DataSheet},
 {ids:['powertrain.crankshaft','slider.crank'],kind:'dimensioned',fact:'The 84 mm stroke sets the crankpin centers 42 mm from the main axis. These stations drive both the installed crank and the animation.',need:'Match journal widths and diameters, counterweight profiles, fillets, oil drillings and end flanges to a dimensioned crankshaft.',source:m113DataSheet},
 {ids:['powertrain.crankshaft','slider.crank'],kind:'diagram',fact:'Relative throw phasing follows the M113 firing order of 1–5–4–2–6–3–7–8.',need:'Confirm the forging clocking relative to the flywheel datum and front keyway.',source:firing},
 {ids:['powertrain.block','powertrain.crankshaft','slider.crank'],kind:'dimensioned',fact:'The model uses the M113 family’s 106 mm bore spacing and 90° bank angle. The engine-family training table illustrates these on the 4.3-litre M113.',need:'Verify the engine-to-frame datum, axial bank stagger, head and lower block contours on the 5.0-litre installation.',source:training},
 {ids:['powertrain.connecting-rods','slider.rod'],kind:'dimensioned',fact:'The model uses the training table’s 148.5 mm pin spacing for the 84 mm-stroke V8. Mercedes identifies a common connecting rod for the 4.3 and 5.0 SOHC engines.',need:'Measure the split face, bolt positions, beam and bearing bore on A 113 030 00 20.',source:training},
 {ids:['powertrain.connecting-rods','slider.rod'],kind:'diagram',fact:'Mercedes lists A 113 030 00 20 for the 4.3 and 5.0 SOHC V8 engines.',need:'Verify build-specific rod and bearing revisions.',source:rod},
 {ids:['powertrain.pistons','slider.piston'],kind:'dimensioned',fact:'The linked piston travels 84 mm along the cylinder axis. Crown clearance, skirt, ring grooves and pin dimensions are illustrative.',need:'Obtain the A 113 030 00 24 crown, skirt and wrist-pin drawing or measure a piston.',source:m113DataSheet},
 {ids:['powertrain.air-filters','intake.air-filters','g500-air-cleaner.left-filter','g500-air-cleaner.right-filter'],kind:'dimensioned',fact:'The supplier’s C 3698/3-2 drawing specifies 355 × 135 × 50 mm per filter. Both fitted elements use this envelope in the vehicle and the open cleaner.',need:'Measure the corners, perimeter section, pleat depth, fold count and contact with the original housing.',source:g500FilterSources.air},
 {ids:['powertrain.oil-filter','engine-oil.oil-filter','g500-oil-cartridge.element'],kind:'dimensioned',fact:'The HU 718/5 x cartridge uses a 64 mm outside diameter, 31 mm bore at each end and 115 mm height. The claim covers the cartridge inside the housing.',need:'Measure the stem, seal grooves, cap thread, pleats, end-cap sections and cast housing.',source:g500FilterSources.oil},
 {ids:['fuel.delivery','g500-fuel-delivery.filter'],kind:'dimensioned',fact:'WK 720 cross-references A 002 477 30 01. The model follows its 160 × Ø75 mm envelope, 8 mm inlet and outlet, and 10 mm tank return. The end housing and vent follow the drawing silhouette.',need:'Digitize tapered sections and regulator cover, and measure vent diameter, nipple stations and the mount. Pump dimensions and mounting positions are estimates.',source:g500FilterSources.fuel},
 {ids:['fuel.lines','g500-fuel-delivery.cushion','g500-fuel-delivery.clamp','g500-fuel-delivery.filter-clamp'],kind:'diagram',fact:'The fuel plate identifies the externally mounted pump, separate filter, vibration sleeve and support hardware.',need:'Measure tank-side coordinates, bracket, clamps and sleeve, and trace the full feed, return and vent paths on the vehicle.',source:fuelPlate},
 {ids:['cooling.radiator','powertrain.radiator','g500-radiator.tubes'],kind:'dimensioned',fact:'The 62599A replacement core uses the distributor’s 537 mm width, 569 mm height and 40 mm depth. These dimensions cover the core only.',need:'Confirm which radiator the vehicle carries and check the core against a manufacturer drawing. Other distributors round the thickness differently.',source:g500FlowRefs.coreSize},
 {ids:['cooling.radiator','powertrain.radiator','g500-radiator.tanks'],kind:'diagram',fact:'The factory parts plate shows the radiator, its mounts and the opposite end locations of the two hose connections.',need:'Confirm the fitted radiator (A 463 500 11 00 or variant), end-tank profiles, neck stations and support brackets on a vehicle.',source:g500FlowRefs.radiator}
];
export const gaps=[
 'Measure cylinder-head combustion chambers, port sections, head-bolt pattern, guides, seats, lash adjusters and rocker pivots on the M113.962.',
 'Verify the crank and cam timing sprockets, intermediate gear, chain path, tensioner and guides with the timing case open.',
 'Digitize engine mounts, pulley offsets, belt wrap and tensioner travel against engine and frame datums.',
 'Measure the airbox, throttle bore, runner switching linkage, breather passages, MAF and both front ducts in the installed bay.',
 'Trace the fan shroud, pump impeller and volute, thermostat, coolant lines, drain, mounting grommets and reservoir connections for the fitted radiator variant.',
 'Verify crankcase ventilation, vacuum branches, fuel-rail crossover, injector O-rings, injector seats and main fuel supply routing.',
 'Measure the oil pump gears, pickup, pressure-relief valve, pan, exchanger, galleries and piston-oiling jets against factory sections.',
 'Trace the full fuel feed, tank return, regulator vent and vapor lines; measure the tank baffles, penetrations, level sender, filler interface and heat shields.',
 'Check the pressure-regulator diaphragm, fuel pump motor and impeller, and the tank-side installation and hose clamp orientations.',
 'Measure starter and alternator housings, connectors and brackets, engine earth leads, knock-sensor branch and harness attachment points.'
];
