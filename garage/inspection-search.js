import {getAssemblies} from './assemblies.js';
import {getDetail} from './detail-catalog.js';

const cache=new Map();
const g500PartNames={
 'hvac.compressor':'air conditioner air conditioning compressor',
 'column-adjustment.reach-motor':'steering wheel motor steering wheel adjustment reach telescope',
 'column-adjustment.height-motor':'steering wheel motor steering wheel adjustment tilt height',
 'seat-heating.front-left-cushion':'driver seat heater heated seat cushion',
 'seat-heating.front-right-cushion':'passenger seat heater heated seat cushion',
 'exhaust.tailpipe':'exhaust pipe tip outlet side exit muffler',
 'cooling.radiator':'engine coolant system radiator water cooling'
};
function words(text){
 return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[-_]/g,' ').replace(/\ba\s*\/\s*c\b/g,'air conditioning');
}
function index(vehicle){
 const entries=[];
 function visit(assembly,parts,path,parents,seen){
  for(const p of parts){
   const detail=getDetail(vehicle,p.id);
   const aliases=vehicle==='g500'&&g500PartNames[p.id];
   const name=p.name+(detail&&p.name!==detail.name?' · '+detail.name:'')+(aliases?' '+aliases:'');
   const label=parents.join(' › ');
   const entry={assembly,path,part:p.id,title:p.name,detailName:detail?.name,label,name:words(name),ancestors:words(label),description:words(p.description||'')};
   entries.push(entry);
   if(detail&&!seen.has(detail.id)&&path.length<8){
    const nextSeen=new Set(seen);nextSeen.add(detail.id);
    visit(assembly,[...detail.componentIndex.values()],[...path,p.id],[...parents,detail.name],nextSeen);
   }
  }
 }
 for(const group of getAssemblies(vehicle))visit(group.id,group.parts,[],[group.name],new Set());
 return entries;
}
export function findInVehicle(vehicle,query,limit=12){
 if(!query.trim())return [];
 if(!cache.has(vehicle))cache.set(vehicle,index(vehicle));
 const needle=words(query.trim()).replace(/\bac\b/g,'air conditioning').replace(/\b(?:diffs?|differentials)\b/g,'differential').replace(/\b(?:crackcase|crank case)\b/g,'crankcase'),tokens=needle.split(/\s+/),scored=[];
 for(const item of cache.get(vehicle)){
  let score=0;
  for(const term of tokens){
   if(item.name.includes(term))score+=6;
   else if(item.ancestors.includes(term))score+=2;
   else if(item.description.includes(term))score++;
   else{score=0;break;}
  }
  if(score)scored.push({item,score:score+(item.name.startsWith(needle)?5:0)-.03*item.path.length});
 }
 scored.sort((a,b)=>b.score-a.score);
 const results=[],located=new Set();
 for(const {item} of scored){
  // Keep handed doors and numbered cylinders independently discoverable.
  // A part reachable through two identical aliases still takes the shortest route.
  const mounting=item.path.find(id=>/door|cylinder[-.]?\d+|wheel[1-4]$|\.(seat|fan|thruster)\d+$/.test(id))||'';
  const key=item.part+'|'+item.title+'|'+mounting;
  if(located.has(key))continue;
  located.add(key);results.push(item);
  if(results.length===limit)break;
 }
 return results;
}
