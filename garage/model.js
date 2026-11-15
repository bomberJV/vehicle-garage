import {VEHICLES,FINISHES,PARTS} from './catalog.js';
import {paintChoice} from './paint-colors.js';
import {liftOptions,liftSupply,normalizedLift,liftCaption} from './lift-options.js';
import {wheelSupplyRows} from './wheel-supplies.js';
import {slOptions,slComfortSummary} from './sl550-controls.js';
import {hasConvertibleRoof,hasRoofCarrier} from './porsche-roof-state.js';
import {wheelDesign} from './wheel-designs.js';

export const DEFAULT_BUILD={version:1,vehicle:'g500',paint:'olive',finish:'silver',wheelDesign:'stock',parts:[],quotes:{},budget:5000,labor:0,paintAllowance:0,notes:''};
export function availableParts(vehicle){return [...PARTS.filter(p=>p.vehicles.includes(vehicle)),...wheelSupplyRows(vehicle),...(vehicle==='g500'?[liftSupply]:[])];}
export function money(value){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);}
export function sanitizeBuild(raw={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};
 const legacyBmw=raw.vehicle==='bmw328i';
 const vehicle=legacyBmw?'bmw325ci':Object.hasOwn(VEHICLES,raw.vehicle)?raw.vehicle:'g500';
 const allowed=new Map(availableParts(vehicle).map(part=>[part.id,part]));
 const exclusive=new Set(),parts=[];
 let importedDesign,importedLift;
 for(const id of !legacyBmw&&Array.isArray(raw.parts)?new Set(raw.parts):[]){
   const part=allowed.get(id);
   if(!part)continue;
   if(part.liftMode){importedLift??=part.liftMode;continue;}
   if(part.designId){importedDesign??=part.designId;continue;}
   if(part.exclusive && exclusive.has(part.exclusive))continue;
   if(part.exclusive)exclusive.add(part.exclusive);
   parts.push(id);
 }
 const lift=normalizedLift(vehicle,raw.lift??{mode:importedLift});
 if(lift.mode===liftSupply.liftMode)parts.push(liftSupply.id);
 const design=wheelDesign(vehicle,legacyBmw?'stock':raw.wheelDesign??importedDesign)?.id||'stock';
 const wheel=wheelSupplyRows(vehicle).find(part=>part.designId===design);
 if(wheel)parts.push(wheel.id);
 const amount=v=>Number.isFinite(Number(v))?Math.min(1000000,Math.max(0,Math.round(Number(v)*100)/100)):0;
 const quotes={};if(raw.quotes&&typeof raw.quotes==='object'&&!Array.isArray(raw.quotes))for(const id of parts){if(allowed.get(id)?.mockup)continue;const val=raw.quotes[id];if(val!==null&&val!==''&&val!==undefined&&Number.isFinite(Number(val))&&Number(val)>=0)quotes[id]=amount(val);}
 return {version:1,vehicle,...(vehicle==='sl550'?slOptions(raw):{}),...(vehicle==='bmw325ci'?{bmwVentPosition:raw.bmwVentPosition==='open'?'open':'closed'}:{}),...(liftOptions(vehicle).length?{lift}:{}),paint:paintChoice(raw.paint).id,wheelDesign:design,finish:FINISHES.some(p=>p.id===raw.finish)?raw.finish:'silver',parts,quotes,budget:raw.budget==null?5000:amount(raw.budget),labor:legacyBmw?0:amount(raw.labor),paintAllowance:legacyBmw?0:amount(raw.paintAllowance),notes:typeof raw.notes==='string'?raw.notes.slice(0,3000):'',...(hasConvertibleRoof(vehicle)?{roofPosition:raw.roofPosition==='up'||hasRoofCarrier({vehicle,parts})?'up':'down'}:{})};
}
export function selectWheelDesign(raw,designId){
  return sanitizeBuild({...raw,wheelDesign:designId});
}
export function togglePart(raw,id){
  const build=sanitizeBuild(raw);
  const available=new Map(availableParts(build.vehicle).map(part=>[part.id,part]));
  const part=available.get(id);
  if(!part)return build;
  if(part.liftMode)return sanitizeBuild({...build,lift:{mode:build.lift?.mode===part.liftMode?'stock':part.liftMode}});
  if(part.designId)return selectWheelDesign(build,build.wheelDesign===part.designId?'stock':part.designId);
  if(build.parts.includes(id))build.parts=build.parts.filter(x=>x!==id);
  else{
    if(part.exclusive)build.parts=build.parts.filter(x=>available.get(x)?.exclusive!==part.exclusive);
    build.parts.push(id);
  }
  return sanitizeBuild(build);
}
export function accounting(raw){const build=sanitizeBuild(raw);let sourced=0,quoted=0;const unknown=[];const available=new Map(availableParts(build.vehicle).map(part=>[part.id,part]));const lines=build.parts.filter(id=>!available.get(id).mockup).map(id=>{const part=available.get(id);const manual=Object.hasOwn(build.quotes,id);const amount=manual?build.quotes[id]:part.price===null?null:Math.round(part.price*part.quantity*100)/100;if(amount===null)unknown.push(id);else if(manual)quoted+=amount;else sourced+=amount;return {...part,amount,manual};});const subtotal=Math.round((sourced+quoted)*100)/100;const total=Math.round((subtotal+build.labor+build.paintAllowance)*100)/100;return {lines,sourced:Math.round(sourced*100)/100,quoted:Math.round(quoted*100)/100,unknown,subtotal,total,remaining:Math.round((build.budget-total)*100)/100,complete:unknown.length===0};}
export function presetBuild(vehicle,index){
 const presets={g500:[['black','silver',['g-filter','charger']],['olive','bronze',['g-rack','g-tires','g-filter']]],f350:[['cream','silver',['f-restoration','charger']],['blue','bronze',['f-bed','f-tires','charger']]],c63:[['silver','silver',['c-filter','charger']],['burgundy','bronze',['c-filter','c-tires','wax']]],hrv:[['silver','silver',['h-mats']],['blue','black',['h-mats','h-tray','wax']]],bmw325ci:[['black','silver',['b46-filter','charger']],['silver','silver',['b46-filter','b46-tires','wax']]]};
 let b=sanitizeBuild({...DEFAULT_BUILD,vehicle});const p=presets[b.vehicle]?.[index];if(p){[b.paint,b.finish,b.parts]=p;}return sanitizeBuild(b);
}
export function importBuild(text){if(typeof text!=='string'||text.length>100000)throw Error('This build file is too large.');const raw=JSON.parse(text);if(!raw||raw.version!==1||(!Object.hasOwn(VEHICLES,raw.vehicle)&&raw.vehicle!=='bmw328i')||!Array.isArray(raw.parts))throw Error('Choose a Garage build JSON file.');return sanitizeBuild(raw);}
export function exportText(raw){
  const build=sanitizeBuild(raw),totals=accounting(build),vehicle=VEHICLES[build.vehicle];
  const paint=paintChoice(build.paint),paintLabel=paint.id.startsWith('#')?paint.hex.toUpperCase():paint.name+' ('+paint.hex+')';
  const finish=FINISHES.find(option=>option.id===build.finish);
  const lines=totals.lines.map(part=>{
    const price=part.amount===null?'QUOTE NEEDED':money(part.amount)+(part.manual?' (manual quote)':' (catalog snapshot)');
    return [part.name+' — '+price,part.url,part.rearUrl?'Rear wheel: '+part.rearUrl:null,'Fitment: '+part.fit].filter(Boolean).join('\n');
  });
  return [
    'THE GARAGE / '+vehicle.year+' '+vehicle.name,'Paint concept: '+paintLabel,
    ...(build.vehicle==='bmw325ci'?['Rear quarter windows: '+(build.bmwVentPosition==='open'?'vented':'closed')]:[]),
    ...(build.vehicle==='sl550'?['Driver seat: '+slComfortSummary(build,'driver'),'Passenger seat: '+slComfortSummary(build,'passenger'),'MAGIC SKY CONTROL: '+build.slGlass,'Wind deflector: '+(build.slWindstop?'selected':'stowed')]:[]),
    ...(hasConvertibleRoof(build.vehicle)?['Convertible top: '+(build.roofPosition==='up'?'up':'down')]:[]),
    'Wheel design: '+(wheelDesign(build.vehicle,build.wheelDesign)?.name||'Factory wheels'),'Wheel finish concept: '+finish.name,'',
    ...(liftOptions(build.vehicle).length?['Suspension: '+liftCaption(build.vehicle,build.lift)]:[]),
    ...lines,'','Known parts: '+money(totals.subtotal),'Labor allowance: '+money(build.labor),'Paint/wrap allowance: '+money(build.paintAllowance),
    'Known plan amount: '+money(totals.total)+'; '+totals.unknown.length+' item(s) still need quotes.','Budget: '+money(build.budget),
    'Tax, shipping, fitting, oil and other unlisted items are not included unless added to allowances. No live inventory or VIN fitment verification.',
    '',build.notes
  ].join('\n');
}
