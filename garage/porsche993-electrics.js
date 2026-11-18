// 993 Carrera fuel-vapour system, engine management and ABS wiring.
// Locations follow the sources in `electricsRefs`; the routes are fitted to
// this model's packaged systems, not measured.
import {add, part, cyl, x, y, z} from './mechanism-shapes.js';
import {chassisRefs} from './porsche993-chassis.js';

export const electricsRefs={
 canister:{label:'911uk forum · on the 993 the charcoal canister sits ahead of the left rear wheel, opposite the oil tank (part 993.201.221.03)',url:'https://911uk.com/porsche/charcoal-canister-aftermarket-options.111132/?amp=1'},
 canisterPart:{label:'ECS Tuning · Porsche activated charcoal canister 993.201.221.03, 1995–1998 911 Carrera',url:'https://www.ecstuning.com/b-genuine-porsche-parts/as-charcoal-filter/99320122103/'},
 shutoff:{label:'Rennlist · 1998 993 fault 95, shutoff valve for the activated charcoal filter',url:'https://rennlist.com/forums/993-forum/766679-cel-and-code-95-activated-charcoal-filter.html'},
 dme:{label:'FVD · locating the 993 Motronic (DME) unit: about 18 × 16 × 4 cm, under the driver\'s seat',url:'https://www.fvd.net/adbimage/118761/asset-original/fvd99310021_1.pdf'},
 seats:{label:'Rennlist · 993 shop manual: DME under the left seat; alarm/central-locking and cruise control units under the right seat',url:'https://rennlist.com/forums/993-forum/425137-electronic-boxes-under-passengers-seat-2.html'}
};
const black='#2b3033',rubber='#24282a',alloy='#a8aea6',plastic='#383e40',wire='#3a3f36',sensor='#6f7778';
const row=(key,name,description,offset,source,draw)=>({...part(key,name,description,offset,draw),source});
const sides=[[-1,'left','Left'],[1,'right','Right']];
const M=([px,py,pz],s)=>[px,py*s,pz];
function run(r,points,radius,color){for(let i=1;i<points.length;i++)r.rod(points[i-1],points[i],radius,color,4);}

// ---------------- Fuel evaporative system ---------------------------------
export const canister=[.620,-.700,.460];
const purgeValve=[1.250,-.330,.700];
// Tank vent: from the tank top, down its rear face and back under the floor.
export const ventPath=[[-.880,-.220,.606],[-.832,-.220,.560],[-.832,-.240,.300],[.400,-.240,.300],[.500,-.550,.320],[canister[0],-.660,canister[2]-.110]];
// Purge: from the canister top, inboard of the left rear wheel housing, over
// the rear damper to the shutoff valve and the front of the intake plenum.
export const purgePath=[add(canister,[0,0,.110]),[.660,-.640,.660],[.720,-.560,.680],[.850,-.520,.680],[1.100,-.520,.680],[1.200,-.420,.690],add(purgeValve,[-.020,0,0])];
const intakeEnd=[1.330,-.130,.770];
function canisterBody(r){
 cyl(r,canister,z,-.105,.095,.056,black,12);cyl(r,canister,z,.095,.110,.040,plastic,10);
 // The pressure-relief valve on its side lets fresh air in as the tank cools.
 cyl(r,add(canister,[.054,0,.040]),x,-.004,.022,.014,plastic,8);
}
function valve(r){r.box(purgeValve[0]-.022,purgeValve[1]-.018,purgeValve[2]-.020,purgeValve[0]+.022,purgeValve[1]+.018,purgeValve[2]+.020,plastic);cyl(r,purgeValve,x,.022,.034,.008,black,8);}
function purgeLines(r){
 run(r,purgePath,.005,rubber);
 run(r,[add(purgeValve,[.030,0,0]),[1.300,-.260,.730],intakeEnd],.005,rubber);
}
// ---------------- Engine management --------------------------------------
// DME on the floor under the left seat, between the seat rails.
export const dme=[.060,-.345,.436];
function dmeBox(r){
 const [cx,cy,cz]=dme;r.box(cx-.090,cy-.080,cz-.016,cx+.090,cy+.080,cz+.016,alloy);
 r.box(cx+.090,cy-.060,cz-.012,cx+.112,cy+.060,cz+.012,black);
}
const units=[.060,.345,.436];
function controlUnits(r){
 const [cx,cy,cz]=units;
 r.box(cx-.080,cy-.070,cz-.015,cx+.000,cy+.070,cz+.015,plastic);
 r.box(cx+.010,cy-.055,cz-.013,cx+.080,cy+.055,cz+.013,'#4a5052');
}
// Through the floor grommet behind the seat, along the left of the tunnel
// below the floor, up beside the transaxle and back to the engine.
export const enginePath=[add(dme,[.112,0,0]),[.200,-.300,.420],[.200,-.300,.325],[.815,-.290,.325],[.815,-.290,.600],[.955,-.290,.600],[.990,-.290,.650],[1.040,-.290,.650],[1.100,-.290,.595],[1.200,-.290,.595],[1.260,-.290,.590],[1.300,-.160,.572]];
function harness(r){
 run(r,enginePath,.010,wire);
 // Short branches along the left of the crankcase to the injectors' rail.
 run(r,[[1.260,-.290,.590],[1.280,-.240,.630]],.006,wire);
}
// ---------------- ABS wheel-speed sensors ---------------------------------
const abs=[-1.420,-.080,.435];
export const frontSensor=[-1.220,.625,.270],rearSensor=[1.185,.620,.290];
const frontLead=s=>[M(frontSensor,s),[-1.270,s*.530,.370],[-1.420,s*.330,.385],[-1.420,s<0?-.120:-.040,abs[2]]];
const rearLead=s=>[M(rearSensor,s),[1.210,s*.550,.330],[1.215,s*.480,.400],[.940,s*.370,.350],[.860,s*.250,.338],[.760,s*.020,.318],...(s<0?[[-1.250,-.020,.318],[-1.268,-.045,.334],[-1.285,-.070,.318],[-1.390,-.070,.400],[-1.410,-.070,abs[2]]]:[[-1.300,.020,.318],[-1.400,.020,.400],[-1.420,-.055,abs[2]]])];
function sensorBody(r,c,axis){cyl(r,c,axis,-.012,.022,.009,sensor,8);}

function assembly(id,name,description,source,rows){
 return {id,name,description,source,category:'service',internal:true,view:'hero',viewAngle:[.76,-.35],parts:rows.map(p=>({...p,id:id+'.'+p.id,category:'service'}))};
}
const perSide=(key,name,description,offset,source,draw)=>sides.map(([s,hand,label])=>row(`${key}-${hand}`,`${label} ${name}`,description,M(offset,s),source,r=>draw(r,s)));

const evapRows=[
 row('canister','Activated charcoal canister','The canister ahead of the left rear wheel stores fuel vapour from the tank. A side valve lets fresh air in as the tank cools.',[0,-.16,0],electricsRefs.canister,canisterBody),
 row('vent','Tank vent line','The vent line carries vapour from the tank in the front compartment back under the floor to the canister.',[0,-.10,-.10],electricsRefs.canisterPart,r=>run(r,ventPath,.005,rubber)),
 row('shutoff-valve','Purge shutoff valve','The DME opens this valve so engine vacuum draws the stored vapour out of the canister.',[0,-.10,.12],electricsRefs.shutoff,valve),
 row('purge','Purge lines','The purge line runs from the canister to the shutoff valve and on to the front of the intake plenum.',[0,-.12,.10],electricsRefs.shutoff,purgeLines)
];
const electricsRows=[
 row('dme','Motronic engine control unit (DME)','The aluminium DME box sits on the floor under the driver\'s seat. It runs injection, ignition, the VarioRam flaps and the vapour purge.',[0,-.12,.14],electricsRefs.dme,dmeBox),
 row('control-units','Alarm and central-locking control units','The units under the passenger seat run the alarm, the central locking and the cruise control.',[0,.12,.14],electricsRefs.seats,controlUnits),
 row('engine-harness','Engine wiring harness','The harness leaves the DME through the floor, runs under the cabin beside the tunnel and climbs past the transaxle to the engine.',[0,-.14,.10],electricsRefs.dme,harness),
 ...perSide('abs-sensor-front','front wheel-speed sensor','The sensor reads a toothed ring behind the hub for the ABS control unit.',[0,.20,0],chassisRefs.frontCarrier,(r,s)=>sensorBody(r,M(frontSensor,s),y)),
 ...perSide('abs-sensor-rear','rear wheel-speed sensor','The sensor on the rear carrier reads the toothed ring on the drive-shaft joint.',[0,.20,0],chassisRefs.rearAxle,(r,s)=>sensorBody(r,M(rearSensor,s),y)),
 ...perSide('abs-lead-front','front ABS sensor lead','The lead runs from the front wheel housing to the ABS unit beside the battery.',[0,.12,.06],chassisRefs.frontCarrier,(r,s)=>run(r,frontLead(s),.004,wire)),
 ...perSide('abs-lead-rear','rear ABS sensor lead','The lead follows the brake line under the floor from the rear wheel to the ABS unit in the front compartment.',[0,.12,-.06],chassisRefs.rearAxle,(r,s)=>run(r,rearLead(s),.004,wire))
];
export const electricsGroups=[
 assembly('993-evap','Fuel vapour control','Vapour from the tank collects in a charcoal canister ahead of the left rear wheel. When the DME opens the shutoff valve, the engine draws it in through the intake. Routes are approximate.',electricsRefs.canister,evapRows),
 assembly('993-electrics','Engine management and ABS wiring','The Motronic DME under the driver\'s seat is wired to the engine through a harness under the floor. Four wheel-speed sensors report to the ABS unit in the front compartment.',electricsRefs.dme,electricsRows)
];
