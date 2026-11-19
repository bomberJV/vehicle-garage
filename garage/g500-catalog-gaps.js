import {catalogIndexUrl} from './g500-catalog-plates.js';
export {catalogPlates,catalogIndexUrl} from './g500-catalog-plates.js';

// Each entry identifies physical hardware that currently lacks a selectable
// component. Catalog listings support its identification, not a measured mesh.
const modelPath='/v-2002-mercedes-benz-g500--base--5-0l-v8-gas/';
const source=(label,url)=>({label,url});
const classic=(label,slug)=>source('Mercedes-Benz Classic USA · '+label,catalogIndexUrl+'/'+slug);
const mbusa=(label,slug)=>source('Mercedes-Benz USA · '+label,'https://mbparts.mbusa.com'+modelPath+slug);
const miami=(label,slug)=>source('Mercedes-Benz of Miami · '+label,'https://parts.mercedesbenzofmiami.com'+modelPath+slug);
export const catalogGaps=[
  {title:'Windshield washer reservoir, level sender and pump seal',need:'Record the reservoir shape and mount. Add the level sender (210 540 05 45), windshield pump and grommet as separate parts, and check where their connections leave the tank.',source:classic('2002 G500 washer and wiper parts','electrical--wipers')},
  {title:'Cargo tie-down rings and removable partition net',need:'Locate the tie-down rings in the load floor and the net’s upper and lower attachment points against the manual illustrations. Record the ring, mounting recess and net-end fittings on a matching interior.',source:source('Mercedes-Benz · 2002 US operator’s manual, cargo equipment','https://cdn.dealereprocess.org/cdn/servicemanuals/mercedesbenz/2002-gclass.pdf#page=177')},
  {title:'Vehicle jack, operating rod and tool-bag stowage',need:'Check the fitted jack, jack rod, retaining strap, wheel wrench and tool bag against the tools plate. Record their stowed shapes, support points and fasteners.',source:mbusa('2002 G500 tools and accessories','tools-accessories-signs-instructions--tools-and-accessories')},
  {title:'Trailer-hitch retrofit and frame attachments',need:'Check whether the donor carries the optional trailer coupling. Match the installed kit and its frame attachments to the retrofit plate before measuring the receiver, brackets or hardware.',source:source('Mercedes Parts Center · 2002 G500 trailer-hitch retrofit','https://www.mercedespartscenter.com'+modelPath+'retrofits--trailer-hitch')},
  {title:'PARKTRONIC sensors, warning buzzer and harness',need:'Confirm the equipment code before adding the parking-assist system. The US plate separates the control unit, sensor, harness and buzzer. Identify the fitted sensor retainers and where each branch clips to the bumpers.',source:classic('2002 G500 parking aid','electrical--parking-aid')},
  {title:'Secondary-air pump, isolators and check valves',need:'Separate the M113 secondary-air injection parts from the existing evaporative-emissions hardware. Match pump, rubber mounts, brackets, valves and plumbing to the engine and emissions label before measuring.',source:classic('2002 G500 air injection system','emission-control--air-injection-system')},
  {title:'Fuel-filler door return spring and bump stop',need:'The flap and pocket are modeled. Check the reinforcement, return spring and stop on the fuel-door plate and add them behind the flap.',source:classic('2002 G500 fuel door','electrical--fuel-door')},
  {title:'Front and rear overhead assist straps',need:'Check the roof-trim plate’s front and rear grab handles and supports. Locate their mounting points and recesses on the sunroof headliner, separate from the existing passenger dashboard handle.',source:classic('2002 G500 roof trim','body--interior-trim-roof')}
];
