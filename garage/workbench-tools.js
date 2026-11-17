import {systemsFor} from './system-index.js';
import {getVehicleReferences} from './reference-ledger.js';
import {hasBuildPlan} from './fleet.js';

const $=id=>document.getElementById(id);
const tabs=['inspect','systems','customize','references'];
const shortcuts={
  sl550:[['Inside the headlamp','lights','lights.headlamps',true],['Massage air supply','seats','seats.supply',true],['Inside the V8','sl-m278','sl-m278.block',true]],
  g500:[
    ['Engine block','powertrain','powertrain.block'],
    ['Left exhaust outlet','exhaust','exhaust.tailpipe'],
    ['Seat heater','seat-heating','seat-heating.front-left-cushion'],
    ['Column reach motor','column-adjustment','column-adjustment.reach-motor'],
    ['Front differential','differentials','differentials.front'],
    ['Center differential','differentials','differentials.center'],
    ['Rear differential','differentials','differentials.rear'],
    ['Front fog lamp','lighting','lighting.fog-left'],
    ['Side marker','lighting','lighting.front-marker-left'],
    ['Rear fog lamp','lighting','lighting.rear-fog']
  ],
  bmw325ci:[['Left rear vent window','body','body.quarter-left'],['DISA intake flap','powertrain','powertrain.disa'],['Rear differential','drivetrain','drivetrain.rear-differential']],
  porsche993cab:[['Open crankcase','engine','engine.case',true]],
  porsche992scab:[['Open crankcase','engine','engine.case',true]],
  porsche996cab:[['Open crankcase','engine','engine.case',true]]
};
const g500StudyRoutes={
  'Mercedes-Benz USA · G-Class electrical training':['electrical','electrical.can-c','Inspect the drivetrain data bus'],
  'Mercedes-Benz USA · control module locations':['electrical','electrical.ecu','Open the engine controller'],
  'Mercedes-Benz · M113.962 exhaust layout':['exhaust','exhaust.main-muffler','Open the main muffler'],
  '2002 G500 · heater and ventilation unit':['hvac','hvac.blower','Open the blower'],
  '2002 G500 · seat heater elements':['seat-heating','seat-heating.front-left-cushion','Open the cushion heater'],
  '2002 G-Class manual · steering wheel adjustment':['column-adjustment','column-adjustment.reach-motor','Open the reach motor'],
  'Mercedes-Benz · long-wheelbase G 500 body elevations':['body','body.tailgate','Inspect the cargo door'],
  '2002 US manual · cargo-door handle':['body','body.tailgate','Inspect the door hardware'],
  'Mercedes-Benz · five-spoke alloy wheel':['wheels','wheels.rim','Inspect the wheel'],
  '2002 G500 · air cleaner and intake ducts':['powertrain','powertrain.airbox','Inspect the air cleaner'],
  '2002 G500 · front suspension':['suspension','suspension.radius-arms','Inspect the front radius arms'],
  '2002 G500 · rear suspension':['suspension','suspension.trailing-arms','Inspect the rear trailing arms'],
  'Mercedes-Benz · battery installation':['electrical','electrical.battery','Inspect the cabin battery'],
  '2002 G500 · fuel tank, pump and filter':['fuel','fuel.delivery','Inspect the pump and filter'],
  '2002 G500 · sliding roof and shade':['roof','roof.cassette','Inspect the roof cassette'],
  'Mercedes-Benz · VG150E center differential':['differentials','differentials.center','Inspect the center differential']
};
const bmwStudyRoutes={
  'BMW · 2003 coupé dimension drawing':['body','body.quarter-left','Inspect the rear vent window'],
  'BMW · Style 43 alloy wheel':['wheels','wheels.rim','Inspect the alloy wheel'],
  'BMW · M54 resonance intake':['powertrain','powertrain.disa','Inspect the DISA flap'],
  'BMW · E46 coupé window mechanism':['body','body.quarter-left','Open the rear window mechanism'],
  'BMW · propeller shaft and center bearing':['drivetrain','drivetrain.center-support','Open the center bearing'],
  'BMW · saddle tank and delivery units':['fuel','fuel.tank','Open the saddle tank']
};
function sourceCard(kind,label,url,scope){
  const card=document.createElement('article'),tag=document.createElement('small'),a=document.createElement('a'),p=document.createElement('p');
  card.className='reference-card';tag.textContent=kind;
  a.textContent=label+' ↗';a.href=url;a.target='_blank';a.rel='noopener noreferrer';
  card.append(tag,a);if(scope){p.textContent=scope;card.append(p);}return card;
}
export function createWorkbenchTools({vehicle,whole,context,open,select}){
  let active='inspect',listedVehicle;
  function renderSystems(){
    const id=vehicle();
    if(listedVehicle===id)return;
    listedVehicle=id;
    const {notes,assemblies,featured,remaining}=systemsFor(id);
    $('systems-intro').textContent=notes;
    const directory=$('system-directory');directory.replaceChildren();
    function section(label,items,fold=false){
      if(!items.length)return;
      const wrapper=document.createElement(fold?'details':'section'),title=document.createElement(fold?'summary':'h4'),list=document.createElement('div');
      title.textContent=label;wrapper.className='system-list';list.className='system-routes';
      for(const item of items){
        const b=document.createElement('button'),name=document.createElement('span'),hint=document.createElement('small');
        b.type='button';name.textContent=item.name;hint.textContent=item.group||item.count+' components';
        b.append(name,hint);b.addEventListener('click',()=>{show('inspect');open(item.assembly,item.part,item.path);$('inspection-title').focus({preventScroll:true});$('inspect-tab').closest('.inspector').scrollTop=0;});list.append(b);
      }
      wrapper.append(title,list);directory.append(wrapper);
    }
    section('Assemblies',assemblies);
    section('Component studies',featured);
    section('More component studies ('+remaining.length+')',remaining,true);
  }
  function show(tab,focus=false){
    if(tab==='customize'&&!hasBuildPlan(vehicle()))tab='inspect';
    if(tab==='customize'&&active!==tab)whole();
    active=tab;
    const url=new URL(location.href);
    if(tab==='inspect')url.searchParams.delete('tool');else url.searchParams.set('tool',tab);
    if(url.href!==location.href)history.replaceState(null,'',url);
    for(const key of tabs){
      const b=$(key+'-tab');b.hidden=key==='customize'&&!hasBuildPlan(vehicle());
      b.tabIndex=key===tab?0:-1;b.setAttribute('aria-selected',String(key===tab));
      $(key+'-panel').hidden=key!==tab;
    }
    if(tab==='systems')renderSystems();
    if(tab==='references'){
      const selected=context(),seen=new Set();
      const references=[selected?.source,...(selected?.sources||[])].filter(source=>{
        if(!source?.url||seen.has(source.url))return false;
        seen.add(source.url);return true;
      });
      $('reference-context').replaceChildren(...references.map((source,index)=>
        sourceCard(index?'Related drawing':'Current selection',source.label||'Component reference',source.url,index?'':selected.name)
      ));
    }
    if(focus)$(tab+'-tab').focus({preventScroll:true});
  }
  for(const tab of tabs){
    const b=$(tab+'-tab');b.addEventListener('click',()=>show(tab,true));
    b.addEventListener('keydown',event=>{
      const visible=tabs.filter(key=>!$(key+'-tab').hidden),index=visible.indexOf(tab);
      const target={ArrowRight:visible[(index+1)%visible.length],ArrowLeft:visible[(index+visible.length-1)%visible.length],Home:visible[0],End:visible.at(-1)}[event.key];
      if(target){event.preventDefault();show(target,true);}
    });
  }
  function render(){
    const id=vehicle();
    const cards=getVehicleReferences(id).map(r=>{
      const card=sourceCard(r.kind,r.label,r.url,r.scope);
      const target=r.study||(id==='g500'?g500StudyRoutes:id==='bmw325ci'?bmwStudyRoutes:{})[r.label];
      if(target){
        const [assembly,part,label]=target,b=document.createElement('button');
        b.type='button';b.className='drawing-link';b.textContent=label;
        b.addEventListener('click',()=>{show('inspect');open(assembly,part);$('inspection-title').focus({preventScroll:true});$('inspect-tab').closest('.inspector').scrollTop=0;});
        card.append(b);
      }
      return card;
    });
    $('vehicle-references').replaceChildren(...cards);
    const actions=(shortcuts[id]||[]).map(([label,assembly,part,openDetail])=>{
      const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>openDetail?open(assembly,part):select(part));return b;
    });
    $('component-shortcuts').replaceChildren(...actions);
    show(active);
  }
  return {render,show};
}
