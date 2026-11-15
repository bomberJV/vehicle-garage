import {bearingDrawing,bearingFit,bearingCadPage} from './g500-wheel-bearings.js';
import {brakeRefs} from './g500-rotors.js';
import {g500AxleSources} from './g500-underbody.js';
import {fluidRefs} from './g500-fluid-refs.js';
import {G500_WHEEL_MANUAL} from './g500-wheel-specs.js';

const classic='https://classicparts.mbusa.com/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const manual={label:'Mercedes-Benz · 2002 G500 wheel and tire specifications, printed pp. 359–360',url:G500_WHEEL_MANUAL};
const plate=(label,path)=>({label:'Mercedes-Benz · 2002 G500 '+label,url:classic+path});
const claim=(ids,kind,fact,need,source)=>({ids,kind,fact,need,source});
const frontRotor=['wheels.disc','brakes.front','g500-front-brake.rotor'],rearRotor=['wheels.disc','brakes.rear','g500-rear-brake.rotor'];
const bearingClaims=['inner','outer'].flatMap((kind,i)=>{
 const code=i?'32011X':'32010X',id='wheels.'+kind+'-bearing',detail='g500-'+kind+'-wheel-bearing.';
 const b=i?55:50,d=i?90:80,w=i?23:20,c=i?17.5:15.5;
 return [
  claim([id,detail+'cone',detail+'rollers',detail+'cage'],'cadDrawing','Timken X'+code+' gives a '+b+' mm bore, '+w+' mm cone width and 23 rollers. The cone shoulders, roller end sections, inclination and cage lips follow the axial drawing profiles.','Identify the maker on the original cone and measure the cage pocket widths. The section leaves those widths open.',bearingDrawing('X'+code)),
  claim([id,detail+'cup'],'cadDrawing','Timken Y'+code+' gives a '+d+' mm outside diameter and '+c+' mm axial width. The revolved outer race follows the section’s tapered bore and rounded outer shoulders.','Match the maker on the fitted cup and verify its installed axial position against the hub and knuckle.',bearingDrawing('Y'+code)),
  claim([id],'diagram','The Timken automotive application table assigns '+code+' to the '+kind+' front wheel bearing on the 2002–08 G500.','Measure the spacing between the opposed seats in this axle.',bearingFit)
 ].map((entry,index)=>index<2?{...entry,additionalSources:[bearingCadPage((index===0?'X':'Y')+code)]}:entry);
});
export default [
 ...bearingClaims,
 claim(frontRotor,'dimensioned','Brembo 09.A917.11 gives a 315 mm diameter, 30 mm ventilated disc, 83 mm height, 85 mm pilot and five wheel holes. Installed and isolated views use the same faces and mounting plane.','Measure the vane casting and friction-track inner edge. Match the retaining screw to the stamped axle serial.',brakeRefs.front),
 claim(rearRotor,'dimensioned','Brembo 08.7725.20 gives a 272 mm diameter, 16 mm solid ring, 97 mm height, 85 mm pilot and five wheel holes.','Confirm the rear axle serial and measure the hat wall, retaining screw and transition radii.',brakeRefs.rear),
 claim(frontRotor,'dimensioned','The ATE cross-reference gives five 15 mm bores on a 130 mm bolt circle. The mesh has open passages on the wheel bolt axes.','Confirm the screw pattern on the particular front axle variant.',brakeRefs.frontBores),
 claim(rearRotor,'dimensioned','ATE gives a 160 mm drum bore and five 15 mm wheel holes on a 130 mm circle. The parking drum and the perforated face are open in the model.','Measure the exact cross-section of the casting and confirm the serial-specific locating screw.',brakeRefs.rearBores),
 claim(['brakes.rear','g500-rear-brake.shoe-a','g500-rear-brake.shoe-b'],'dimensioned','Brembo specifies a 160 mm working diameter and 40 mm width for S 50 510 parking shoes. The lining wraps a narrower shoe web inside the rear disc.','Measure the webs, pivot slots, anchor ends and installed axial location of the exact shoe set.',brakeRefs.shoes),
 claim(['wheels.tire'],'dimensioned','The stock tire envelope uses the manual’s 265/60 R18 size.','Identify the fitted tire and scan its tread, loaded sidewall and bead profile.',manual),
 claim(['wheels.rim'],'dimensioned','The stock bead-seat diameter is 18 in, with a 7.5 in rim width and 43 mm offset.','Measure the wheel well, hub pad, bead flanges and spoke contours of the original casting.',manual),
 claim(['wheels.hub','steering.axle'],'diagram','The front suspension plate identifies the driven hub and a pair of tapered wheel bearings. The fitted bearing interfaces use their separate Timken sections.','Reconstruct the hub flange, knuckle, kingpin bores, journals and seat spacing from a dimensioned front axle section.',plate('front suspension','suspension--front-suspension')),
 claim(['suspension.frame'],'diagram','The frame plate identifies the main rails and crossmembers. Their geometry in the model follows the broad layout.','Obtain W463 long-wheelbase frame alignment datums, crossmember sections and mounting hole coordinates.',plate('frame','body--frame-and-components')),
 claim(['suspension.radius-arms','suspension.front-track-bar','suspension.spring','suspension.damper'],'diagram','The front linkage plate establishes which arms and bushings locate the axle and where the separate spring and damper sit.','Measure eye centers, spring and shock seats, bushing bores and the fitted spring and damper part numbers.',g500AxleSources.frontLinks),
 claim(['suspension.trailing-arms','suspension.rear-track-bar'],'diagram','The rear suspension drawing identifies the longitudinal arms, Panhard rod and frame connections.','Measure link center distances, rod bends, rubber sleeves and bracket offsets.',g500AxleSources.rearLinks),
 claim(['suspension.rear-axle'],'diagram','The rear casing supports flanged axle shafts on both sides.','Measure housing ends, axle tube sections, bearing seats and seal lands for the actual rear axle.',g500AxleSources.rear),
 claim(['steering.linkage','steering-assist.steering-box','steering-assist.shaft','steering-assist.pitman'],'diagram','The G500 steering plate locates the steering box, pitman arm and mechanical linkage.','Obtain the fitted steering-box section, pitman spline and drag-link joint centers.',fluidRefs.gear),
 claim(['steering-assist.pump','steering-assist.reservoir'],'diagram','The 463.249 workshop drawing places the reservoir on the belt-driven power-steering pump.','Identify the pump code and measure the pulley, mounting bosses and reservoir interfaces.',fluidRefs.steeringInstall),
 claim(['steering-assist.cooler','steering-assist.pressure-line','steering-assist.return-lines'],'diagram','The parts diagram identifies the pressure hose and the two return connections via the cooler.','Trace the pipes, end fittings and mounting clips for this chassis break.',fluidRefs.steering)
];
export const gaps=[
 {title:'Front wheel-end seals, slotted nuts, tab washer and kingpin bearings',need:'Match the front axle code and obtain seated section drawings, seal profiles and bearing spacing.'},
 {title:'Rear wheel-bearing cartridge and axle seal',need:'Check the rear axle serial and capture the flanged axle, bearing, spacer and seal stack.'},
 {title:'Parking-shoe anchor, return springs, retainers and cable equalizer',need:'Check the rear axle plate, spring attachment points, cable travel and mid-chassis equalizer.'},
 {title:'Front and rear service-caliper pistons, seals, guides and hardware',need:'Match castings and axle serial, then obtain piston sections, pad profiles, bridge bolts and hydraulic-port locations.'},
 {title:'ABS wheel-speed sensors, pulse rings and wheel-end routes',need:'Locate each ring and sensor on the model-year axles and trace each lead and clip to the body.'},
 {title:'ABS hydraulic modulator, tandem circuits and hard-line clips',need:'Match the hydraulic unit number and map each master-cylinder and wheel-end pipe on the US vehicle.'},
 {title:'Frame mounting datums, outriggers, bump stops and body mount stacks',need:'Obtain the long-wheelbase frame alignment drawing and sections for rubber mounts and their hardware.'},
 {title:'Springs by paint code and damper internals',need:'Verify front and rear codes and obtain free lengths, wire sections, piston and valve sections and usable stroke.'},
 {title:'Steering damper, swivel seals and steering stops',need:'Identify the early axle variant; measure ends, bushes, seal stack and full-lock clearances.'}
];
