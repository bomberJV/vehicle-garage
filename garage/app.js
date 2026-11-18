import {basisLabels,g500Geometry,geometryBoardLink} from './g500-geometry-register.js';
import {enableFactoryElevations} from './factory-elevations.js';
import {dimensionStudies} from './factory-dimensions.js';
import {bindSLControls} from './sl550-controls.js';
import {hasConvertibleRoof,hasRoofCarrier,isPorscheCabriolet,roofReferences} from './porsche-roof-state.js';
import {COMPACT_SPREAD,spreadPercent,bindSpreadControls} from './compact-explosion.js';
import {createWorkbenchTools} from './workbench-tools.js';
import {createCustomizer} from './customizer.js';
import {paintChoice,sanitizePalette} from './paint-colors.js';
import {selectWheelDesign} from './model.js';
import {findInVehicle} from './inspection-search.js';
import {doorForGlazing} from './door-detail.js';
import {getDetail} from './detail-catalog.js';
import {installedPartId} from './installed-part.js';
import {seeThroughCars} from './body-visibility.js';
import {DOMAINS,modelFilters,vehicleFamilies} from './collection-filter.js';
import {FLEET,vehicleDomain,vehicleType,hasBuildPlan} from './fleet.js';
import {VEHICLES,FINISHES,CATEGORIES,CHECKED} from './catalog.js';
import {DEFAULT_BUILD,sanitizeBuild,availableParts,accounting,togglePart,presetBuild,importBuild,money,exportText} from './model.js';
import {GarageRenderer} from './render.js';
import {getAssemblies,getAssembly,getComponent} from './assemblies.js';
const $=id=>document.getElementById(id),KEY='brandon-garage-v1';let build=sanitizeBuild(DEFAULT_BUILD),byVehicle={},saved=[],palette=[],category='all',search='';
function status(message){$('status').textContent=message;}
try{
  const stored=localStorage.getItem(KEY),raw=JSON.parse(stored||'null');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
    build=sanitizeBuild(raw.build);palette=sanitizePalette(raw.palette);
    if(raw.byVehicle?.bmw328i&&!raw.byVehicle?.bmw325ci)
      byVehicle.bmw325ci=sanitizeBuild({...raw.byVehicle.bmw328i,vehicle:'bmw328i'});
    for(const key of Object.keys(VEHICLES)){
      if(raw.byVehicle?.[key])byVehicle[key]=sanitizeBuild({...raw.byVehicle[key],vehicle:key});
    }
    if(Array.isArray(raw.saved))saved=raw.saved.slice(0,4).map(sanitizeBuild);
    if(JSON.stringify({build,byVehicle,saved,palette})!==stored)persist();
  }
}catch{status('A saved build could not be loaded. Starting with a clean workbench.');}
function persist(){byVehicle[build.vehicle]=build;try{localStorage.setItem(KEY,JSON.stringify({build,byVehicle,saved,palette}));}catch{$('storage-note').textContent='Browser saving is unavailable. Export your build JSON to keep it.';}}
const renderer=new GarageRenderer($('vehicle-canvas'));
let inspection={vehicle:null,assembly:null,part:null,expanded:false};
const detailTrail=[];
function el(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function button(text,handler,className){const b=el('button',className,text);b.type='button';b.addEventListener('click',handler);return b;}
function external(text,url){const a=el('a','',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function defaultForVehicle(vehicle){
  const paint={sl550:'silver',porsche993cab:'silver',porsche996cab:'silver',porsche992scab:'burgundy',bmws1000rr:'#c5222c'}[vehicle]||DEFAULT_BUILD.paint;
  return {...DEFAULT_BUILD,vehicle,paint,finish:vehicle==='bmws1000rr'?'black':DEFAULT_BUILD.finish};
}
function initialBuild(vehicle){
  return sanitizeBuild(byVehicle[vehicle]||defaultForVehicle(vehicle));
}
const initialRoute=new URL(location.href).searchParams;
let separation=spreadPercent(initialRoute.get('spread'));
const linkedVehicle=initialRoute.get('vehicle');
if(Object.hasOwn(VEHICLES,linkedVehicle))build=initialBuild(linkedVehicle);

const modelIds=Object.keys(VEHICLES);
let domainFilter=linkedVehicle?vehicleDomain(build.vehicle):'All';
let typeFilter='All';
const lastChoice=new Map(),lastVariant=new Map();
let bodyPrefs={};
try{bodyPrefs=JSON.parse(localStorage.getItem(KEY+'-body')||'{}')||{};}catch{}

function chooseVehicle(id){
  if(!Object.hasOwn(VEHICLES,id))return;
  byVehicle[build.vehicle]=build;
  build=initialBuild(id);
  category='all';search='';$('search').value='';
  const url=new URL(location.href);url.searchParams.set('vehicle',id);history.replaceState(null,'',url);
  lastChoice.set(domainFilter+'/'+typeFilter,id);
  persist();render();
}
function changeFilter(domain,type){
  domainFilter=domain;typeFilter=type;
  const {models}=modelFilters(modelIds,domain,type);
  if(models.includes(build.vehicle)){renderVehicles();return;}
  chooseVehicle(lastChoice.get(domain+'/'+type)||models[0]);
}
function renderVehicles(){
  const domains=$('domain-picker');
  if(!domains.children.length){
    for(const key of DOMAINS){
      const b=button(key,()=>changeFilter(key,'All'));
      b.dataset.domain=key;domains.append(b);
    }
  }
  for(const b of domains.children)b.setAttribute('aria-pressed',String(b.dataset.domain===domainFilter));
  let {types,models}=modelFilters(modelIds,domainFilter,typeFilter);
  if(!models.includes(build.vehicle)){
    // A saved/imported build or a link can point outside the current filter.
    domainFilter=vehicleDomain(build.vehicle);typeFilter='All';return renderVehicles();
  }
  $('type-picker').replaceChildren(...types.map(t=>new Option(t,t,false,t===typeFilter)));
  $('collection-count').textContent=models.length+(models.length===1?' vehicle':' vehicles');
  const choices=$('vehicle-picker'),focusId=document.activeElement?.dataset.family;
  const families=vehicleFamilies(models);
  const current=families.find(group=>group.variants.some(v=>v.id===build.vehicle));
  lastVariant.set(current.id,build.vehicle);
  choices.replaceChildren();
  for(const family of families){
    const members=family.variants;
    const id=lastVariant.get(family.id)||members[0].id,v=VEHICLES[id];
    const b=button('',()=>chooseVehicle(id),'vehicle-choice');
    b.dataset.family=family.id;b.dataset.vehicle=id;b.setAttribute('aria-pressed',String(family===current));
    const title=family.name||FLEET[id]?.short||v.name;
    if(members.length>1)b.append(el('span','',[...new Set(members.map(item=>VEHICLES[item.id].year))].join(' · ')));
    else if(!title.startsWith(String(v.year)))b.append(el('span','',String(v.year)));
    b.append(el('strong','',title));choices.append(b);
  }
  $('variant-controls').hidden=current.variants.length<2;
  $('variant-picker').replaceChildren(...current.variants.map(v=>new Option(v.trim||VEHICLES[v.id].name,v.id,false,v.id===build.vehicle)));
  if(focusId)choices.querySelector('[data-family="'+focusId+'"]')?.focus({preventScroll:true});
}
$('variant-picker').addEventListener('change',e=>chooseVehicle(e.target.value));
$('type-picker').addEventListener('change',e=>changeFilter(domainFilter,e.target.value));
function syncView(view){
  for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(view===button.dataset.view));
}
const customizer=createCustomizer({
  current:()=>build,palette:()=>palette,savePalette:next=>{palette=next;persist();},
  style(key,value,{save=true}={}){
    const modeChanged=key==='lift'&&build.lift?.mode!==value.mode;
    build=key==='wheelDesign'?selectWheelDesign(build,value):key==='lift'?sanitizeBuild({...build,lift:value}):{...build,[key]:value};
    // An unsaved paint change is a picker preview: the renderer recolours instead of rebuilding.
    renderer.paintPreview=!save&&key==='paint';
    if(save)persist();renderer.setBuild(build);
    if(key==='wheelDesign'||modeChanged){renderSheet();renderCatalog();}
  },
  accessory(id){
    build=togglePart(build,id);persist();renderRoofControls();renderer.setBuild(build);renderInspector();renderSheet();renderCatalog();
    customizer.renderAccessories();
    document.querySelector('[data-accessory="'+id+'"]')?.focus({preventScroll:true});
  }
});
const workbenchTools=createWorkbenchTools({
  vehicle:()=>build.vehicle,context:()=>selectedComponent()||currentAssembly(),
  whole(){if(inspection.assembly||inspection.detailView||inspection.onlyPart)closeInspection();},
  select(id){selectComponent(id);},
  open(assembly,part,path=[]){
    if(!part){selectAssembly(assembly);return;}
    openStudy({assembly,part,path});
  }
});
const renderSLControls=bindSLControls(()=>build,options=>{
  build=sanitizeBuild({...build,...options});persist();renderer.setBuild(build);renderAppearance();renderSheet();renderSaved();
},(assembly,part,side)=>{workbenchTools.show('inspect');selectAssembly(assembly);openComponent(part,side);});
function renderRoofControls(){
  const hasRoof=hasConvertibleRoof(build.vehicle);
  $('convertible-top').hidden=!hasRoof;
  if(hasRoof){
    const ref=roofReferences[build.vehicle];
    $('roof-reference').href=ref.url;$('roof-reference').textContent=ref.label+' ↗';
    const down=$('roof-down');
    down.disabled=Boolean(hasRoofCarrier(build));
    down.title=down.disabled?'Remove the load carrier to lower the top.':'';
    for(const pos of ['down','up'])$('roof-'+pos).setAttribute('aria-pressed',String(build.roofPosition===pos));
  }
}
function renderAppearance(){
  renderSLControls();
  $('bmw-quarter-vents').hidden=build.vehicle!=='bmw325ci';
  if(build.vehicle==='bmw325ci')for(const pos of ['closed','open'])$('bmw-vent-'+pos).setAttribute('aria-pressed',String(build.bmwVentPosition===pos));
  renderRoofControls();
  if(hasBuildPlan(build.vehicle))customizer.render();
}
for(const pos of ['up','down'])$('roof-'+pos).addEventListener('click',()=>{
  if(!hasConvertibleRoof(build.vehicle))return;
  build=sanitizeBuild({...build,roofPosition:pos});persist();renderer.setBuild(build);renderAppearance();renderSheet();renderSaved();
});
for(const pos of ['closed','open'])$('bmw-vent-'+pos).addEventListener('click',()=>{
  if(build.vehicle!=='bmw325ci')return;
  build=sanitizeBuild({...build,bmwVentPosition:pos});persist();renderer.setBuild(build);renderAppearance();
});
function renderInfo(){
  const v=VEHICLES[build.vehicle], exhibit=FLEET[build.vehicle], planning=hasBuildPlan(build.vehicle);
  $('vehicle-year').textContent=[v.year,vehicleDomain(build.vehicle),vehicleType(build.vehicle)].join(' / ');
  $('vehicle-title').textContent=v.name;workbenchTools.render();
  $('vehicle-canvas').setAttribute('aria-label',v.name+' schematic. Click a part to bring it into view, double-click to open it, and drag to move it. Escape clears the selection. Drag the background or use arrow keys to rotate. The inspector has equivalent keyboard controls.');
  $('section-tools').hidden=!allowSection();
  const facts=$('exhibit-facts');facts.hidden=!exhibit;
  if(exhibit){
    $('exhibit-description').textContent=exhibit.detail;
    $('exhibit-reference').href=exhibit.source.url;$('exhibit-reference').textContent=exhibit.source.label+' ↗';
    const references=$('extra-references');references.replaceChildren();
    for(const ref of exhibit.sources||[])if(ref.url && ref.url!==exhibit.source.url)references.append(external(ref.label+' ↗',ref.url));
    const specs=$('exhibit-specifications');specs.replaceChildren();
    for(const [label,value] of exhibit.specs){const row=el('div');row.append(el('dt','',label),el('dd','',value));specs.append(row);}
  }
  document.querySelector('.appearance-section').hidden=!planning;
  document.querySelector('.build-plan-panel').hidden=!planning;
  $('parts-section').hidden=!planning;
  $('saved-section').hidden=!planning && !saved.length;
  $('component-suppliers').hidden=!planning || Boolean(inspection.detailView);
  document.querySelector('.inspection-legend span:last-child').hidden=Boolean(exhibit);
  document.querySelector('.vehicle-facts').hidden=Boolean(exhibit);
  document.querySelector('.presets').hidden=!v.presets?.length;
  const study=dimensionStudies[build.vehicle];
  $('factory-drawing-open').hidden=$('factory-drawing-intro').hidden=!study;
  if(study)$('factory-intro-text').textContent=study.description;
  $('g500-drawing-register').hidden=build.vehicle!=='g500';
  const photos=$('photo-reference');photos.hidden=!v.photoReference;
  if(v.photoReference){photos.href=v.photoReference.url;photos.title=v.photoReference.label;}
  if(exhibit)return;
  $('vehicle-detail').textContent=v.detail;$('tire-size').textContent=v.tire;$('vehicle-note').textContent=v.note;$('spec-source').href=v.source;
  $('presets').replaceChildren();
  v.presets.forEach((name,index)=>$('presets').append(button(name,()=>{build=presetBuild(build.vehicle,index);persist();render();status(name+' loaded.');})));
}
function renderCatalog(){const tabs=$('categories');tabs.replaceChildren();for(const c of CATEGORIES){const b=button(c.name,()=>{category=c.id;renderCatalog();});b.setAttribute('aria-pressed',String(c.id===category));tabs.append(b);}const parts=availableParts(build.vehicle).filter(p=>!p.mockup&&(category==='all'||p.category===category)&&`${p.name} ${p.seller} ${p.sku}`.toLowerCase().includes(search.toLowerCase()));const target=$('parts-grid');target.replaceChildren();$('no-results').hidden=parts.length!==0;for(const p of parts){const selected=build.parts.includes(p.id),card=el('article','part-card'+(selected?' is-selected':''));const meta=el('div','part-meta');meta.append(el('span','',p.seller),el('span','',p.type));const icons={wheels:'◉',service:'+',exterior:'⌑',care:'✦'};card.append(meta,el('div','part-mark',icons[p.category]),el('h3','',p.name),el('p','part-sku',p.sku),el('p','part-description',p.description));const fit=el('p','fitment');fit.append(el('b','','Check fitment'),document.createTextNode(p.fit));if(p.fitmentUrl){fit.append(document.createTextNode(' '),external('Fitment listing ↗',p.fitmentUrl));}card.append(fit);const price=el('div','part-price',p.price===null?'Get a quote':money(p.price*p.quantity));price.append(el('small','',p.price===null?'Not yet included in a priced total':`${p.quantity>1?`${p.quantity} × ${money(p.price)} per ${p.unit}`:`1 ${p.unit}`} · snapshot ${CHECKED}`));card.append(price);const actions=el('div','part-buttons');const add=button(selected?'Added ✓':'Add to build +',()=>{build=togglePart(build,p.id);persist();renderRoofControls();renderInspector();renderSheet();renderCatalog();customizer.renderWheels();customizer.renderLift();customizer.renderAccessories();renderer.setBuild(build);status(selected?'Removed from the build.':`${p.name} added${p.price===null?' — a quote is still needed':''}.`);},selected?'active':'');add.setAttribute('aria-pressed',String(selected));actions.append(add,external(p.type==='product'?'View product ↗':p.type==='vehicle results'?'See vehicle results ↗':p.type==='service quote'?'Find a specialist ↗':'Open supplier ↗',p.url));card.append(actions);target.append(card);}}
function renderTotals(){const a=accounting(build);$('total').textContent=money(a.total);$('sourced-cost').textContent=money(a.sourced);$('quoted-cost').textContent=money(a.quoted);$('budget-bar').style.width=`${build.budget?Math.min(100,a.total/build.budget*100):a.total?100:0}%`;$('budget-bar').style.background=typeof pageTheme!=='undefined'?pageTheme.convert(a.remaining<0?'#a36543':'#58763b'):(a.remaining<0?'#a36543':'#58763b');$('budget-caption').textContent=a.remaining>=0?`${money(a.remaining)} left before unpriced items`:`${money(-a.remaining)} over budget before unpriced items`;$('unknown-count').textContent=a.unknown.length?`${a.unknown.length} selected ${a.unknown.length===1?'item still needs':'items still need'} a quote. This total is incomplete.`:'All selected part lines have a price. Allow for the extras below.';}
function renderSheet(){const a=accounting(build);$('budget').value=build.budget;$('labor').value=build.labor;$('paint-allowance').value=build.paintAllowance;$('notes').value=build.notes;renderTotals();const target=$('selected-parts');target.replaceChildren();if(!a.lines.length)target.append(el('p','empty-plan','The build sheet is empty. Inspect an assembly or choose a part below.'));for(const p of a.lines){const row=el('div','selected-row'),heading=el('div','selected-row-heading'),remove=button('×',()=>{build=togglePart(build,p.id);persist();renderRoofControls();renderInspector();renderSheet();renderCatalog();customizer.renderWheels();customizer.renderLift();customizer.renderAccessories();renderer.setBuild(build);},'remove-part');remove.setAttribute('aria-label',`Remove ${p.name}`);heading.append(el('strong','',p.name),remove);row.append(heading,el('span','line-price',p.amount===null?'QUOTE NEEDED':money(p.amount)+(p.manual?' · your quote':' · catalog snapshot')),external(p.seller+' ↗',p.url));const label=el('label','quote-entry','Your complete line / set quote (USD)'),input=el('input');input.type='number';input.min='0';input.max='1000000';input.step='.01';input.placeholder=p.amount===null?'Enter full quote':'Optional full-line override';input.value=Object.hasOwn(build.quotes,p.id)?build.quotes[p.id]:'';input.setAttribute('aria-label',`Complete line or set quote for ${p.name} in USD`);input.addEventListener('input',()=>{if(input.value==='')delete build.quotes[p.id];else if(input.validity.valid)build.quotes[p.id]=Number(input.value);else return;build=sanitizeBuild(build);persist();renderTotals();const line=accounting(build).lines.find(x=>x.id===p.id);row.querySelector('.line-price').textContent=line.amount===null?'QUOTE NEEDED':money(line.amount)+(line.manual?' · your quote':' · catalog snapshot');});label.append(input);row.append(label);target.append(row);}}
function renderSaved(){const target=$('saved-builds');target.replaceChildren();$('saved-count').textContent=`${saved.length} / 4 BUILD SLOTS`;$('saved-empty').hidden=saved.length>0;saved.forEach((b,index)=>{const v=VEHICLES[b.vehicle],a=accounting(b),paint=paintChoice(b.paint),finish=FINISHES.find(p=>p.id===b.finish),card=el('article','saved-card'),art=el('div','saved-paint');art.style.setProperty('--swatch',paint.hex);art.style.setProperty('--wheel',finish.hex);card.append(art,el('h3','',`${v.year} ${v.short}`),el('p','',`${paint.name} / ${finish.name}\n${a.lines.length} part lines`),el('strong','',money(a.total)),el('p','',a.unknown.length?`Known amount · ${a.unknown.length} unpriced`:'Known amount · extras may remain'));const actions=el('div','saved-actions');actions.append(button('Load build',()=>{byVehicle[build.vehicle]=build;build=sanitizeBuild(b);category='all';search='';$('search').value='';persist();render();$('workbench').scrollIntoView({behavior:'smooth'});status('Saved build loaded.');}),button('Remove',()=>{saved.splice(index,1);persist();renderSaved();}));card.append(actions);target.append(card);});}
function alignInspection(){
  if(innerWidth>850)return;
  const view=$('vehicle-canvas').getBoundingClientRect();
  if(view.top<innerHeight && view.bottom>0)return;
  $('workbench').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
function cleanInspection(){
  return {vehicle:build.vehicle,assembly:null,part:null,expanded:false,onlyPart:false,system:null,instance:null,detailView:null,detailPart:null};
}
function pushInspection(extra={}){
  renderer.setInspection({...inspection,separation,...extra});
}
function selectedId(){return inspection.detailView?inspection.detailPart:inspection.part;}
function findPart(id){
  if(!id)return null;
  return inspection.detailView?inspection.detailView.componentIndex.get(id):getComponent(build.vehicle,id,build.parts);
}
function selectedComponent(){return findPart(selectedId());}
function currentAssembly(){return inspection.detailView||getAssembly(build.vehicle,inspection.assembly,build.parts);}
function nextDetail(id){
  const detail=getDetail(build.vehicle,id);
  return detail && detail.id!==inspection.detailView?.id && !detailTrail.some(step=>step.state.detailView?.id===detail.id)?detail:null;
}
function showHover(hit){
  const p=findPart(hit?.part),a=hit?.assembly&&!inspection.detailView?getAssembly(build.vehicle,hit.assembly,build.parts):null;
  const fallback=selectedComponent();
  $('hover-name').textContent=p?.name||a?.name||fallback?.name||(currentAssembly()?'Select a component':'Point to a part on the model.');
  $('hover-detail').textContent=p?.description||a?.description||fallback?.description||(currentAssembly()?'Double-click a component to inspect it on its own.':'You can also choose an assembly from the list.');
  for(const b of $('component-list').querySelectorAll('[data-part]'))b.classList.toggle('is-hovered',Boolean(hit?.part&&b.dataset.part===hit.part));
}
function allowSection(){
  return vehicleType(build.vehicle)!=='Tanks'
    && (vehicleDomain(build.vehicle)!=='Air'||['boeing747','cessna172','piperj5','gulfstreamg800'].includes(build.vehicle)||vehicleType(build.vehicle)==='Space');
}
function applySection(){
  const percent=Number($('section-depth').value);
  $('section-percent').textContent=percent+'%';
  renderer.sectionPlane=allowSection()&&percent<100?{axis:Number($('section-axis').value),percent,reverse:$('section-reverse').getAttribute('aria-pressed')==='true'}:null;
  // Sliding the plane draws on the renderer's fast path, once per display frame; the full frame
  // follows when the slider settles.
  renderer.beginInteraction();renderer.requestDraw();renderer.endInteraction(220);
}
function clearSection(close=false){
  $('section-depth').value='100';$('section-percent').textContent='100%';
  $('section-reverse').setAttribute('aria-pressed','false');renderer.sectionPlane=null;
  if(close)$('section-tools').open=false;
}
$('section-depth').addEventListener('input',applySection);
$('section-depth').addEventListener('change',()=>renderer.settleInteraction());
$('section-axis').addEventListener('change',applySection);
$('section-reverse').addEventListener('click',()=>{
  const b=$('section-reverse');b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));applySection();
});
$('fit-porsche-engine').addEventListener('click',()=>{
  if(inspection.assembly!=='engine'||inspection.detailView||!isPorscheCabriolet(build.vehicle))return;
  renderer.beginFocus({direction:'fade'});
  renderer.isolate=true;renderer.keepAssemblyFrame=false;renderer.zoom=1;
  inspection.frameEngine=true;inspection.part=null;inspection.instance=null;inspection.onlyPart=false;
  renderInspector();
});
$('porsche-engine-cutaway').addEventListener('click',()=>{
  inspection.engineCutaway=!inspection.engineCutaway;
  pushInspection();updateInspectionControls();renderer.draw();
});
$('section-reset').addEventListener('click',()=>{clearSection();renderer.draw();});
function clearComponentSearch(){
  $('schematic-query').value='';
  $('schematic-results').replaceChildren();
  $('schematic-results').hidden=true;
}
function openStudy(result){
  clearComponentSearch();
  selectAssembly(result.assembly);
  inspection.onlyPart=false;
  if(inspection.system)selectSystem(null);
  for(const id of result.path)openComponent(id);
  if(nextDetail(result.part))openComponent(result.part);
  else{
    selectComponent(result.part);
    $('component-name').setAttribute('tabindex','-1');
    $('component-name').focus({preventScroll:true});
    if(innerWidth<=850)$('component-list').querySelector('[data-part="'+result.part+'"]')?.scrollIntoView({block:'nearest'});
  }
}
$('schematic-query').addEventListener('input',()=>{
  const q=$('schematic-query').value.trim(),box=$('schematic-results');
  box.replaceChildren();box.hidden=!q;
  if(!q)return;
  const found=findInVehicle(build.vehicle,q);
  if(!found.length){box.append(el('p','','No matching components.'));return;}
  for(const result of found){
    const nested=result.path.length>0;
    const b=button('',()=>{
      if(nested){openStudy(result);return;}
      clearComponentSearch();
      if(inspection.detailView||inspection.onlyPart||inspection.assembly&&inspection.assembly!==result.assembly)closeInspection();
      selectComponent(result.part);
      $('selection-label').focus({preventScroll:true});
    },'schematic-result');
    b.append(el('strong','',nested?'Open '+result.title:result.title),el('small','',result.label));box.append(b);
  }
});
$('schematic-query').addEventListener('keydown',event=>{
  if(event.key==='Escape'){clearComponentSearch();return;}
  if(event.key==='ArrowDown'){$('schematic-results').querySelector('button')?.focus();event.preventDefault();}
});
function stopMotion(){if(renderer.mechanismPlaying)renderer.setMechanismPlaying(false);}
function selectAssembly(id,frameEngine=false){
  const a=getAssembly(build.vehicle,id,build.parts);
  if(!a||inspection.assembly===id&&!inspection.detailView)return;
  stopMotion();
  if(frameEngine){
    [renderer.angle,renderer.elevation]=build.vehicle==='porsche993cab'?[1.03,.37]:[.84,.46];
    renderer.zoom=1;syncView(null);
  }else renderer.beginFocus({direction:'fade'});
  detailTrail.length=0;renderer.keepAssemblyFrame=!frameEngine;
  inspection={...cleanInspection(),assembly:id,expanded:false,frameEngine};
  renderer.spin=false;$('spin').setAttribute('aria-pressed','false');renderer.isolate=Boolean(a.internal||id==='drivetrain');
  renderInspector();
  if(id==='engine'||id==='powertrain'){renderer.focusSelection(id);updatePositionControls();}
  alignInspection();
}
function selectSystem(id){
  inspection.clearanceNote='';inspection.system=id;inspection.part=null;inspection.instance=null;inspection.onlyPart=false;inspection.expanded=Boolean(id);renderer.isolate=Boolean(id);
  renderInspector();alignInspection();
}
function selectComponent(id,instance=null,focusCamera=true){
  if(!inspection.detailView&&!inspection.assembly)id=installedPartId(build.vehicle,id);
  const p=findPart(id);
  if(!p)return;
  if(inspection.onlyPart&&id!==selectedId()&&detailTrail.at(-1)?.leaf)restoreStep(detailTrail.length-1);
  // A search result or connection can lead outside an explicitly isolated assembly.
  // Restore its surroundings without switching the selected sidebar assembly.
  if(!inspection.detailView&&renderer.isolate&&inspection.assembly&&!id.startsWith(inspection.assembly+'.')){
    renderer.isolate=false;inspection.system=null;inspection.expanded=false;inspection.onlyPart=false;
  }
  const fromConnection=Boolean(document.activeElement?.closest('#component-connections'));
  if(inspection.detailView)inspection.detailPart=id;
  else inspection.part=id;
  inspection.instance=instance;
  renderer.selectedHit={part:id,instance,assembly:inspection.detailView?.id||id.split('.')[0]};
  pushInspection();
  if(focusCamera&&!renderer.focusSelection(id,instance))renderer.focusSelection(null);
  renderComponentDetail();
  showHover({part:id,assembly:inspection.assembly});
  syncInspectionUrl();
  if(fromConnection)$('component-list').querySelector('[data-part="'+id+'"]')?.focus({preventScroll:true});
  if(!document.activeElement?.closest('#assembly-detail,#vehicle-canvas'))alignInspection();
}
function deselectPart(){
  if(!selectedId())return;
  if(inspection.onlyPart&&detailTrail.at(-1)?.leaf)restoreStep(detailTrail.length-1);
  inspection.part=null;inspection.detailPart=null;inspection.instance=null;
  renderer.selectedHit=null;renderer.hoverHit=null;renderer.hoverPointer=null;renderer.lastTap=null;
  pushInspection();renderer.focusSelection(null);renderComponentDetail();showHover(null);syncInspectionUrl();
}
function rememberView(){
  return {state:{...inspection},isolate:renderer.isolate,positions:new Map(renderer.partPositions),moves:[...(renderer.moveHistory||[])],
    focused:renderer.selectionFocus&&{id:renderer.selectionFocus.id,instance:renderer.selectionFocus.instance},
    camera:[renderer.angle,renderer.elevation,renderer.zoom],overview:renderer.keepAssemblyFrame,
    section:{axis:$('section-axis').value,percent:$('section-depth').value,
      reverse:$('section-reverse').getAttribute('aria-pressed'),open:$('section-tools').open}};
}
function restoreSection(section){
  if(!section)return;
  $('section-axis').value=section.axis;$('section-depth').value=section.percent;
  $('section-percent').textContent=section.percent+'%';$('section-tools').open=section.open;
  $('section-reverse').setAttribute('aria-pressed',section.reverse);
  renderer.sectionPlane=allowSection()&&Number(section.percent)<100?
    {axis:Number(section.axis),percent:Number(section.percent),reverse:section.reverse==='true'}:null;
}
function openComponent(id,instance=inspection.instance){
  if(!id||(inspection.onlyPart&&id===selectedId()&&instance===inspection.instance))return;
  selectComponent(id,instance,false);
  const detail=nextDetail(id);
  stopMotion();
  const step=rememberView();step.leaf=!detail;step.opened={part:id,instance};detailTrail.push(step);
  renderer.beginFocus({direction:'in',part:id,instance});
  if(detail){
    const previousSeat=inspection.studySeat;
    inspection={...cleanInspection(),detailView:detail};
    if(build.vehicle==='g500'&&detail.id==='g500-front-seat')inspection.studySeat=instance==='front-right'?'passenger':'driver';
    if(build.vehicle==='sl550'&&(detail.id.startsWith('sl-seat')||detail.id==='sl-passenger-seat')){
      const occupant={'seats.passenger':'passenger','seats.driver':'driver'}[id];
      inspection.studySeat=occupant||(['passenger','driver'].includes(instance)?instance:previousSeat)||'driver';
    }
    renderer.isolate=false;renderer.spin=false;$('spin').setAttribute('aria-pressed','false');
  }else{inspection.onlyPart=true;inspection.expanded=false;}
  renderInspector();alignInspection();
  if(detail){
    $('inspection-title').focus({preventScroll:true});
    if(innerWidth<=850)document.querySelector('.inspector').scrollTop=0;
  }
}
function restoreStep(index){
  const step=detailTrail[index];
  if(!step)return;
  stopMotion();renderer.beginFocus({direction:'out',...step.opened});
  detailTrail.length=index;inspection={...step.state};renderer.isolate=step.isolate;
  restoreSection(step.section);renderer.keepAssemblyFrame=step.overview;
  [renderer.angle,renderer.elevation,renderer.zoom]=step.camera;
  syncView(null);renderInspector();
  renderer.partPositions=new Map(step.positions);renderer.moveHistory=[...step.moves];renderer.draw();if(step.focused)renderer.focusSelection(step.focused.id,step.focused.instance);updateInspectionControls();alignInspection();
  (selectedId()?$('deselect-part'):$('inspection-title')).focus({preventScroll:true});
}
function closeInspection(){
  const root=detailTrail[0];
  const previous=inspection.assembly||root?.state.assembly;
  stopMotion();renderer.beginFocus(root?{direction:'out',...root.opened}:{direction:'fade'});
  if(root){restoreSection(root.section);[renderer.angle,renderer.elevation,renderer.zoom]=root.camera;syncView(null);}
  detailTrail.length=0;inspection=cleanInspection();renderer.selectedHit=null;renderer.isolate=false;renderer.keepAssemblyFrame=true;
  renderInspector();
  if(root&&!root.state.assembly){
    renderer.partPositions=new Map(root.positions);renderer.moveHistory=[...root.moves];renderer.draw();updatePositionControls();
  }
  $('assembly-picker').querySelector('[data-assembly="'+previous+'"]')?.focus({preventScroll:true});
}
function ensureClearExtraction(){
  if(!inspection.expanded || (!inspection.onlyPart&&renderer.canExpand()&&!renderer.hasBlockedTransit()))return;
  inspection.expanded=false;
  inspection.clearanceNote=inspection.onlyPart?'':renderer.isolate||inspection.detailView?
    'Select a component to inspect its moving parts.':'Isolate this assembly to give its parts room to separate.';
  pushInspection();
}
function updatePositionControls(){
  const selected=renderer.selectedMoveKey(),moved=renderer.partPositions;
  const p=selectedComponent();
  const focused=Boolean(renderer.selectionFocus);
  $('return-view').hidden=!focused;
  $('selection-tools').hidden=!p&&!moved?.size&&!focused;
  const label=p?.name||'No part selected';
  if($('selection-label').textContent!==label)$('selection-label').textContent=label;
  $('deselect-part').disabled=!p;
  $('position-controls').hidden=!p;
  const busy=Boolean(renderer.returnMotion||renderer.motion);
  for(const button of $('position-controls').querySelectorAll('[data-move]'))button.disabled=!selected||busy;
  $('reset-selected-position').disabled=!selected||!moved?.has(selected)||busy;
  $('reset-positions').disabled=!moved?.size||busy;
}
function updateInspectionControls(){
  const detail=inspection.detailView, p=selectedComponent(),a=currentAssembly(),canOpen=p&&nextDetail(p.id);
  $('assembly-detail').hidden=!a&&!p;
  $('assembly-summary').hidden=!a;
  $('component-list').hidden=!a;
  $('close-inspection').hidden=!a&&!detailTrail.length;
  $('see-through-body').hidden=!seeThroughCars.has(build.vehicle)||Boolean(detail||inspection.onlyPart||(a&&renderer.isolate));
  $('see-through-body').setAttribute('aria-pressed',String(Boolean(renderer.seeThroughBody)));
  const scopeAllowsCut=isPorscheCabriolet(build.vehicle)&&!inspection.onlyPart&&(inspection.assembly==='engine'&&!detail||['993case','992case'].includes(detail?.id));
  $('engine-cutaway-control').hidden=!scopeAllowsCut;
  $('fit-porsche-engine').hidden=!(inspection.assembly==='engine'&&!detail&&isPorscheCabriolet(build.vehicle));
  $('porsche-engine-cutaway').setAttribute('aria-pressed',String(Boolean(inspection.engineCutaway)));
  $('porsche-engine-cutaway').textContent=inspection.engineCutaway?'Show complete engine':'Show engine cutaway';
  const expand=$('expand-assembly');
  const available=a && !inspection.onlyPart && renderer.inspection?.assembly===inspection.assembly &&
    renderer.inspection?.detailView?.id===inspection.detailView?.id && renderer.canExpand();
  const obstructed=available&&!inspection.expanded&&renderer.hasBlockedTransit();
  expand.disabled=!available||obstructed;
  expand.hidden=!available||obstructed;
  $('expand-assembly').textContent=inspection.expanded?'Reassemble':'Expand assembly';
  $('expand-assembly').setAttribute('aria-pressed',String(inspection.expanded));
  displaySpread(available&&!obstructed,separation);
  $('isolate-assembly').hidden=!a||Boolean(detail);
  $('isolate-assembly').setAttribute('aria-pressed',String(renderer.isolate));
  $('isolate-assembly').textContent=renderer.isolate?'Show vehicle context':'Isolate assembly';
  $('open-part').hidden=!canOpen;
  if(canOpen)$('open-part').textContent='Open '+canOpen.name;
  $('isolate-part').hidden=!p;
  $('isolate-part').textContent=inspection.onlyPart?'Back to context':'Isolate this part';
  $('isolate-part').setAttribute('aria-pressed',String(Boolean(inspection.onlyPart)));
  const note=inspection.clearanceNote||(obstructed?(renderer.isolate||detail?
    'Choose an individual component to open it.':'Isolate this assembly to give its parts room to separate.'):'');
  $('clearance-note').textContent=note;
  $('clearance-note').hidden=!note;
  updatePositionControls();
  const motion=renderer.getMechanism(inspection);
  $('mechanism-controls').hidden=!motion;
  $('motion-phase').value=String(Math.round((renderer.mechanismPhase||0)*100));
  $('play-mechanism').textContent=renderer.mechanismPlaying?'Pause motion':'Play motion';
  $('play-mechanism').setAttribute('aria-pressed',String(Boolean(renderer.mechanismPlaying)));
  $('motion-note').textContent=motion?.description||'';
  $('component-suppliers').hidden=(!a&&!p)||!hasBuildPlan(build.vehicle)||Boolean(detail);
}
function renderGeometryRecord(id){
  const panel=$('component-geometry');
  const row=build.vehicle==='g500'&&id?g500Geometry().parts.get(id):null;
  panel.replaceChildren();panel.hidden=!row;
  if(!row)return;
  panel.append(el('strong','',basisLabels[row.kind]));
  for(const claim of row.claims){
    panel.append(el('p','',claim.fact));
    for(const ref of [claim.source,...claim.additionalSources||[]])panel.append(external(ref.label+' ↗',ref.url));
  }
  const task=el('a','','View drawing gaps and priority');task.href=geometryBoardLink(row.id);panel.append(task);
}
function renderComponentDetail(){
  const a=currentAssembly(),p=selectedComponent();
  renderGeometryRecord(p?.id||detailTrail.at(-1)?.opened?.part);
  $('component-name').textContent=p?.name||a?.name||'';
  $('component-description').textContent=p?.description||'Select a component on the model or in the list.';
  $('component-location').textContent=p?.location||'';$('component-location').hidden=!p?.location;
  $('component-quantity').textContent=p?.quantity?(p.id.startsWith('powertrain.')?p.quantity+' in this engine':'Quantity · '+p.quantity):'';$('component-quantity').hidden=!p?.quantity;
  const source=p?.source||a?.source;
  $('component-source').hidden=!source;
  if(source){$('component-source').textContent=(source.label||'Parts reference')+' ↗';$('component-source').href=source.url;}
  const links=$('component-connections');links.replaceChildren();
  for(const targetId of p?.connectsTo||[]){
    const other=findPart(targetId);
    if(!other)continue;
    const relation=p.connections?.find(c=>c.id===targetId)?.kind;
    links.append(button(other.name+(relation?' · '+relation:''),()=>selectComponent(targetId)));
  }
  $('connections-heading').hidden=!links.childElementCount;
  const list=$('component-list');
  list.querySelector('.inline-part-detail')?.remove();
  for(const b of list.querySelectorAll('[data-part]')){
    const selected=b.dataset.part===selectedId();
    b.setAttribute('aria-pressed',String(selected));
    if(selected && p && matchMedia('(max-width:540px)').matches){
      const row=el('div','inline-part-detail'),detail=nextDetail(p.id);
      row.append(el('p','',p.description));
      const action=button(detail?'Inspect '+detail.name:inspection.onlyPart?'Back to context':'Inspect this part',
        ()=>detail?openComponent(p.id):$('isolate-part').click());
      row.append(action);
      if(build.vehicle==='g500'){const ref=el('a','inline-geometry','Drawings and open checks');ref.href=geometryBoardLink(p.id);row.append(ref);}
      b.after(row);
    }
  }
  updateInspectionControls();
}
function renderComponentList(assembly){
  const list=$('component-list');list.replaceChildren();
  const sections=inspection.detailView?assembly.groups:[{parts:assembly.parts.filter(p=>!inspection.system||p.parentId===inspection.system)}];
  for(const section of sections){
    if(sections.length>1)list.append(el('h5','component-family',section.name));
    for(const p of section.parts){
      const b=button(p.name,()=>selectComponent(p.id));b.dataset.part=p.id;
      const child=nextDetail(p.id);
      if(child){b.dataset.opens='true';b.setAttribute('aria-description','Double-click to open '+child.name);}
      b.title=child?'Double-click to open '+child.name:p.name;
      b.addEventListener('dblclick',()=>openComponent(p.id));
      const preview=()=>{if(!inspection.onlyPart)showHover({assembly:inspection.assembly,part:p.id});};
      const leave=()=>showHover(null);
      b.addEventListener('pointerenter',preview);b.addEventListener('pointerleave',leave);
      b.addEventListener('focus',preview);b.addEventListener('blur',leave);
      list.append(b);
    }
  }
}
function syncInspectionUrl(){
  const url=new URL(location.href);
  const assembly=detailTrail[0]?.state.assembly||inspection.assembly;
  if(detailTrail.length)url.searchParams.set('vehicle',build.vehicle);
  if(assembly){url.searchParams.set('vehicle',build.vehicle);url.searchParams.set('assembly',assembly);}
  else url.searchParams.delete('assembly');
  url.searchParams.delete('open');url.searchParams.delete('openAt');
  const hasHandedStep=detailTrail.some(step=>step.opened?.instance);
  for(const {state,opened} of detailTrail){
    const id=state.detailView?state.detailPart:state.part;
    if(id){url.searchParams.append('open',id);if(hasHandedStep)url.searchParams.append('openAt',opened?.instance||'');}
  }
  const selected=selectedId();
  if(selected){url.searchParams.set('vehicle',build.vehicle);url.searchParams.set('part',selected);}
  else url.searchParams.delete('part');
  if(selected&&inspection.instance)url.searchParams.set('at',inspection.instance);else url.searchParams.delete('at');
  const cycle=Math.round(100*(renderer.mechanismPhase||0));
  if(cycle&&renderer.getMechanism(inspection)&&!renderer.mechanismPlaying)url.searchParams.set('cycle',String(cycle));
  else url.searchParams.delete('cycle');
  if(inspection.expanded && assembly && separation!==COMPACT_SPREAD)url.searchParams.set('spread',String(separation));
  else url.searchParams.delete('spread');
  if(inspection.expanded && assembly)url.searchParams.set('explode','1');
  else url.searchParams.delete('explode');
  if(url.href!==location.href)history.replaceState(null,'',url);
}
function renderInspector(){
  const focus=document.activeElement;
  if(inspection.assembly==='accessories'&&!getComponent(build.vehicle,inspection.part,build.parts)){
    if(!getAssembly(build.vehicle,'accessories',build.parts)){detailTrail.length=0;renderer.isolate=false;inspection=cleanInspection();}
    else if(inspection.part){detailTrail.length=0;inspection.part=null;inspection.onlyPart=false;inspection.instance=null;}
  }
  if(inspection.vehicle!==build.vehicle){detailTrail.length=0;renderer.isolate=false;inspection=cleanInspection();}
  const detail=inspection.detailView,a=currentAssembly(),target=$('assembly-picker');
  target.replaceChildren();target.hidden=Boolean(detail);
  if(!detail)for(const group of getAssemblies(build.vehicle,build.parts)){
    const b=button(group.name,()=>selectAssembly(group.id));
    b.dataset.assembly=group.id;b.setAttribute('aria-pressed',String(group.id===inspection.assembly));
    const preview=()=>{if(!inspection.assembly)showHover({assembly:group.id});};
    const leave=()=>showHover(null);
    b.addEventListener('pointerenter',preview);b.addEventListener('pointerleave',leave);
    b.addEventListener('focus',preview);b.addEventListener('blur',leave);target.append(b);
  }
  $('lights').hidden=Boolean(FLEET[build.vehicle]||detail);
  const path=$('inspection-path');path.replaceChildren();path.hidden=!detail;
  if(detail){
    const root=button(VEHICLES[build.vehicle].short,closeInspection);path.append(root);
    detailTrail.forEach((step,index)=>{
      const parent=step.state.detailView||getAssembly(build.vehicle,step.state.assembly,build.parts);
      if(parent)path.append(button(parent.name,()=>restoreStep(index)));
    });
    path.append(el('span','',detail.name));
  }
  $('component-shortcuts').hidden=Boolean(a);
  $('view-label').hidden=!detail;$('view-label').textContent=detail?.name||'';
  renderer.selectedHit=selectedId()?{part:selectedId(),instance:inspection.instance,assembly:inspection.assembly||selectedId().split('.')[0]}:null;
  $('close-inspection').textContent=detailTrail.length?'← Back one level':'Whole vehicle';
  $('inspection-title').textContent=a?.name||'Whole vehicle';
  const systems=$('engine-systems');systems.replaceChildren();$('engine-navigation').hidden=!a?.systems?.length;
  if(a){
    $('assembly-description').textContent=a.description;
    if(a.systems?.length){
      const all=button('Whole engine bay · '+a.parts.length+' components',()=>selectSystem(null));
      all.dataset.system='all';all.setAttribute('aria-pressed',String(!inspection.system));systems.append(all);
      for(const system of a.systems){
        const b=button(system.name,()=>selectSystem(system.id));b.dataset.system=system.id;
        b.setAttribute('aria-pressed',String(inspection.system===system.id));systems.append(b);
      }
      $('system-description').textContent=a.systems.find(x=>x.id===inspection.system)?.description||'Choose a system to see its components and trace their connections.';
    }
    renderComponentList(a);
  }else $('component-list').replaceChildren();
  renderComponentDetail();
  showHover(null);pushInspection();ensureClearExtraction();updateInspectionControls();syncInspectionUrl();
  for(const key of ['assembly','system'])if(focus?.dataset?.[key])$('workbench').querySelector('[data-'+key+'="'+focus.dataset[key]+'"]')?.focus({preventScroll:true});
}
renderer.onInspect=showHover;
function pick(hit,focusCamera=true){
  if(!hit?.part)return;
  workbenchTools.show('inspect');selectComponent(hit.part,hit.instance||null,focusCamera);
}
renderer.onSelect=hit=>pick(hit);
renderer.onDragSelect=hit=>pick(hit,false);
renderer.onDeselect=deselectPart;
$('return-view').addEventListener('click',()=>{renderer.focusSelection(null);updatePositionControls();$('vehicle-canvas').focus({preventScroll:true});});
$('see-through-body').addEventListener('click',()=>{
  const show=!renderer.seeThroughBody;bodyPrefs[build.vehicle]=show;
  try{localStorage.setItem(KEY+'-body',JSON.stringify(bodyPrefs));}catch{}
  renderer.seeThroughBody=show;renderer.draw();updateInspectionControls();
});
$('deselect-part').addEventListener('click',()=>{
  deselectPart();$('vehicle-canvas').focus({preventScroll:true});
});
$('workbench').addEventListener('keydown',event=>{
  if(event.key!=='Escape'||event.target.closest('input,select,textarea,dialog')||!selectedId())return;
  event.preventDefault();deselectPart();$('vehicle-canvas').focus({preventScroll:true});
});
renderer.onOpenPart=hit=>{
  if(!hit?.part)return;workbenchTools.show('inspect');
  const part=inspection.detailView?hit.part:doorForGlazing(hit.part,hit.instance);
  openComponent(part,hit.instance||null);
};
$('close-inspection').addEventListener('click',()=>detailTrail.length?restoreStep(detailTrail.length-1):closeInspection());
$('open-part').addEventListener('click',()=>openComponent(selectedId()));
function setExpanded(expanded){
  if(expanded && (!renderer.canExpand()||inspection.onlyPart))return;
  inspection.clearanceNote='';
  if(expanded&&renderer.hasBlockedTransit()){
    inspection.clearanceNote=renderer.isolate||inspection.detailView?'Open a component to inspect its moving parts.':
      'Isolate this assembly to give its parts room to separate.';
  }else{
    inspection.expanded=expanded;pushInspection();ensureClearExtraction();
  }
  updateInspectionControls();syncInspectionUrl();
}
$('expand-assembly').addEventListener('click',()=>setExpanded(!inspection.expanded));
function changeSeparation(value){
  const setting=spreadPercent(value);
  if(inspection.onlyPart||!renderer.canExpand()||(!inspection.expanded&&renderer.hasBlockedTransit()))return;
  separation=setting;
  if(!inspection.expanded)setExpanded(true);
  else{pushInspection();updateInspectionControls();syncInspectionUrl();}
}
const displaySpread=bindSpreadControls($('explode-setting'),$('explode-distance'),$('explode-value'),changeSeparation);
$('isolate-assembly').addEventListener('click',()=>{
  // Preserve the open assembly if the surrounding vehicle would obstruct it.
  renderer.isolate=!renderer.isolate;inspection.clearanceNote='';pushInspection();
  if(inspection.expanded&&renderer.hasBlockedTransit()){
    renderer.isolate=!renderer.isolate;
    inspection.clearanceNote='Reassemble before changing the surrounding context.';
    pushInspection();
  }
  renderComponentDetail();
});
$('isolate-part').addEventListener('click',()=>{
  if(inspection.onlyPart && detailTrail.at(-1)?.leaf){restoreStep(detailTrail.length-1);return;}
  const part=selectedId();if(!part)return;
  if(!inspection.onlyPart){
    const step=rememberView();step.leaf=true;step.opened={part,instance:inspection.instance};detailTrail.push(step);
    renderer.beginFocus({direction:'in',...step.opened});
  }else renderer.beginFocus({direction:'out',part,instance:inspection.instance});
  inspection.onlyPart=!inspection.onlyPart;renderInspector();alignInspection();
});
renderer.onPositionsChange=updatePositionControls;
renderer.onMechanismPause=updateInspectionControls;
renderer.onReturnBlocked=()=>{inspection.clearanceNote='Another moved part is in the return path. Restore all positions to retrace your moves.';updateInspectionControls();};
$('reset-selected-position').addEventListener('click',()=>{
  const key=renderer.selectedMoveKey();if(key)renderer.resetPartPositions(key);
});
$('reset-positions').addEventListener('click',()=>renderer.resetPartPositions());
for(const b of $('position-controls').querySelectorAll('[data-move]'))b.addEventListener('click',()=>{
  const [x,y]=b.dataset.move.split(',').map(Number);renderer.moveSelected(x*18,y*18);
});
renderer.onMechanismPhase=phase=>{$('motion-phase').value=String(Math.round(phase*100));};
$('motion-phase').addEventListener('input',()=>{
  renderer.setMechanismPhase(Number($('motion-phase').value)/100);
  updateInspectionControls();syncInspectionUrl();
});
$('play-mechanism').addEventListener('click',()=>{
  renderer.setMechanismPlaying(!renderer.mechanismPlaying);updateInspectionControls();syncInspectionUrl();
});
$('component-suppliers').addEventListener('click',()=>{category=selectedComponent()?.category||getAssembly(build.vehicle,inspection.assembly,build.parts)?.category||'all';search='';$('search').value='';renderCatalog();$('parts-section').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});});
function render(){
  const changedVehicle=renderer.build?.vehicle!==build.vehicle;
  renderer.seeThroughBody=seeThroughCars.has(build.vehicle)&&bodyPrefs[build.vehicle]===true;
  if(changedVehicle){
    renderer.slRoofMotion=null;renderer.slRoofFraction=null;
    clearSection(true);clearComponentSearch();renderer.setMechanismPlaying(false);
    renderer.spin=false;$('spin').setAttribute('aria-pressed','false');
    renderer.build=build;renderer.inspection={};renderer.isolate=false;renderer.setView('hero');syncView('hero');
  }
  const url=new URL(location.href);
  if(url.searchParams.has('vehicle')&&url.searchParams.get('vehicle')!==build.vehicle){
    url.searchParams.set('vehicle',build.vehicle);history.replaceState(null,'',url);
  }
  renderer.build=build;renderInspector();renderVehicles();renderInfo();renderAppearance();
  renderSheet();renderCatalog();renderSaved();renderer.setBuild(build);
}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
for(const [id,key]of [['budget','budget'],['labor','labor'],['paint-allowance','paintAllowance']]){const field=$(id);field.addEventListener('input',()=>{const value=Number(field.value);if(!Number.isFinite(value)||value<0||value>1000000)return;build=sanitizeBuild({...build,[key]:value});persist();renderTotals();});field.addEventListener('change',()=>{build=sanitizeBuild({...build,[key]:Number(field.value)});field.value=build[key];persist();renderTotals();});}$('notes').addEventListener('input',()=>{build.notes=$('notes').value.slice(0,3000);persist();});$('search').addEventListener('input',()=>{search=$('search').value;renderCatalog();});
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{const focused=currentAssembly();renderer.setView(b.dataset.view,focused?.viewAngle?focused:inspection.detailView);updatePositionControls();document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});for(const [id,key]of [['spin','spin'],['blueprint','blueprint'],['lights','lights']])$(id).addEventListener('click',()=>{renderer[key]=!renderer[key];$(id).setAttribute('aria-pressed',String(renderer[key]));renderer.draw();});
$('reset').addEventListener('click',()=>{build=sanitizeBuild(defaultForVehicle(build.vehicle));persist();render();status('Workbench reset. Saved builds are still in your garage.');});$('save-build').addEventListener('click',()=>{if(saved.length>=4){status('All four slots are occupied. Remove one saved build before saving another.');return;}saved.push(sanitizeBuild(build));persist();renderSaved();status('Build saved to your garage.');});$('export-list').addEventListener('click',()=>{download(`${build.vehicle}-shopping-list.txt`,exportText(build),'text/plain');status('Shopping list downloaded with supplier links.');});$('export-build').addEventListener('click',()=>{download(`${build.vehicle}-garage-build.json`,JSON.stringify(build,null,2),'application/json');status('Build JSON downloaded.');});$('import-build').addEventListener('click',()=>$('import-file').click());$('import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Choose a build file smaller than 100 KB.');const next=importBuild(await file.text());byVehicle[build.vehicle]=build;build=next;category='all';search='';$('search').value='';persist();render();status('Build imported. Only recognized parts for this vehicle were kept.');}catch(error){status(error instanceof SyntaxError?'That file is not valid JSON. Your build was kept.':error.message);}e.target.value='';});$('save-image').addEventListener('click',()=>{const a=document.createElement('a');a.href=renderer.snapshot();a.download=`${build.vehicle}-concept.png`;document.body.append(a);a.click();a.remove();status('Concept image downloaded.');});
render();
const linkedAssembly=getAssembly(build.vehicle,initialRoute.get('assembly'),build.parts);
if(linkedVehicle===build.vehicle){
  if(linkedAssembly)selectAssembly(linkedAssembly.id,linkedAssembly.id==='engine'&&isPorscheCabriolet(build.vehicle));
  const instance=value=>value&&/^[\w.:-]{1,80}$/.test(value)?value:null;
  const handed=initialRoute.getAll('openAt');
  for(const [index,partId] of initialRoute.getAll('open').slice(0,8).entries()){
    if(!findPart(partId))break;
    openComponent(partId,instance(handed[index]));
    if(inspection.onlyPart)break;
  }
  const linkedPart=initialRoute.get('part');
  if(findPart(linkedPart))selectComponent(linkedPart,instance(initialRoute.get('at')));
}
if(linkedAssembly && linkedVehicle===build.vehicle && initialRoute.get('explode')==='1' && !inspection.expanded)setExpanded(true);
const linkedCycle=initialRoute.get('cycle');
if(linkedVehicle===build.vehicle && linkedCycle!==null && /^\d{1,3}$/.test(linkedCycle) && Number(linkedCycle)<=100 && renderer.getMechanism(inspection)){
  renderer.setMechanismPhase(Number(linkedCycle)/100);updateInspectionControls();syncInspectionUrl();
}

if(initialRoute.get('tool')==='customize' && !linkedAssembly)workbenchTools.show('customize');
if(['systems','references'].includes(initialRoute.get('tool')))workbenchTools.show(initialRoute.get('tool'));

// The vehicle picker changes height when the catalog loads. Resolve incoming workbench links after that layout.
if(location.hash==='#workbench')requestAnimationFrame(()=>$('workbench').scrollIntoView({block:'start',behavior:'instant'}));

const openFactoryElevations=enableFactoryElevations(()=>build.vehicle);
if(initialRoute.get('drawing')==='dimensions')openFactoryElevations();
// Full screen: the workbench (view and inspector) fills the screen. The Fullscreen API is used
// where the browser has it; elsewhere (iPhone Safari) the workbench becomes a fixed overlay.
const fullWorkbench=$('workbench'),expandView=$('expand-view');
function setGarageExpanded(on){
  fullWorkbench.classList.toggle('expanded',on);document.documentElement.classList.toggle('garage-expanded',on);
  expandView.setAttribute('aria-pressed',on);expandView.textContent=on?'Exit full screen':'Full screen';
  $('vehicle-canvas').focus({preventScroll:true});
}
expandView.addEventListener('click',async()=>{
  if(!fullWorkbench.classList.contains('expanded')){
    setGarageExpanded(true);
    try{if(fullWorkbench.requestFullscreen&&!document.fullscreenElement)await fullWorkbench.requestFullscreen({navigationUI:'hide'});}catch{/* The overlay alone still fills the window. */}
  }else{
    if(document.fullscreenElement){try{await document.exitFullscreen();}catch{/* Already out. */}}
    setGarageExpanded(false);
  }
});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&fullWorkbench.classList.contains('expanded'))setGarageExpanded(false);});
