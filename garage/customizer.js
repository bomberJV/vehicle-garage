import {PAINTS,FINISHES} from './catalog.js';
import {paintChoice,normalizeHex,sanitizePalette} from './paint-colors.js';
import {wheelOptions,wheelDesign} from './wheel-designs.js';
import {liftOptions,liftChoice,normalizedLift} from './lift-options.js';
import {drawWheelSample} from './wheel-preview.js';
import {accessoriesFor} from './accessory-catalog.js';

const $=id=>document.getElementById(id);
function element(tag,text){
  const item=document.createElement(tag);
  if(text)item.textContent=text;
  return item;
}
function action(name,handler,pressed){
  const item=element('button',name);
  item.type='button';
  if(pressed!==undefined)item.setAttribute('aria-pressed',String(pressed));
  item.addEventListener('click',handler);
  return item;
}
function link(label,url){
  const a=element('a',label+' ↗');
  a.href=url;a.target='_blank';a.rel='noopener noreferrer';
  return a;
}
function swatches(target,options,selected,onChoice){
  const buttons=options.map(option=>{
    const b=action('',()=>onChoice(option.id),option.id===selected);
    b.className='swatch';b.style.setProperty('--swatch',option.hex);
    b.title=option.name;b.setAttribute('aria-label',option.name);
    return b;
  });
  $(target).replaceChildren(...buttons);
}

export function createCustomizer({current,palette,savePalette,style,accessory}){
  const feedback=message=>{$('color-feedback').textContent=message;};
  function paint(value,options){style('paint',value,options);syncPaint();}
  function syncPaint(){
    const chosen=paintChoice(current().paint);
    $('custom-color').value=chosen.hex;$('hex-color').value=chosen.hex.toUpperCase();
    $('hex-color').removeAttribute('aria-invalid');$('paint-label').textContent=chosen.name;
    for(const [i,b] of Array.from($('paint-picker').children).entries())b.setAttribute('aria-pressed',String(chosen.id===PAINTS[i].id));
    for(const b of $('saved-colors').querySelectorAll('[data-hex]'))b.setAttribute('aria-pressed',String(chosen.hex===b.dataset.hex));
  }
  function applyHex(){
    const value=normalizeHex($('hex-color').value);
    if(!value){$('hex-color').setAttribute('aria-invalid','true');feedback('Enter three or six hex digits, for example #F2C629.');return false;}
    if(paintChoice(current().paint).hex!==value)paint(value);else syncPaint();
    feedback('');return true;
  }
  $('apply-hex').addEventListener('click',applyHex);
  $('hex-color').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applyHex();}});
  // Dragging across the picker sends an input event for every pointer move, and each repaint
  // rebuilds the vehicle. Only the latest colour is drawn, once per frame, so a slow rebuild
  // drops the colours passed over instead of queueing them; the build is saved when the
  // picker settles.
  let pickedColor=null,pickFrame=0,pickSave=0;
  const commitPick=()=>{clearTimeout(pickSave);pickSave=0;if(pickFrame){cancelAnimationFrame(pickFrame);pickFrame=0;}
    const value=pickedColor;pickedColor=null;paint(value??$('custom-color').value);};
  $('custom-color').addEventListener('input',event=>{
    pickedColor=event.target.value;feedback('');
    if(!pickFrame)pickFrame=requestAnimationFrame(()=>{pickFrame=0;if(pickedColor!==null){const value=pickedColor;pickedColor=null;paint(value,{save:false});}});
    clearTimeout(pickSave);pickSave=setTimeout(()=>{pickSave=0;if(!pickFrame)paint($('custom-color').value);},600);
  });
  $('custom-color').addEventListener('change',commitPick);
  function store(){
    if(!applyHex())return;
    const chosen=paintChoice(current().paint),name=$('color-name').value.trim()||chosen.hex.toUpperCase();
    savePalette(sanitizePalette([...palette(),{hex:chosen.hex,name}]));
    $('color-name').value='';renderPalette();feedback(name+' saved.');
  }
  $('save-color').addEventListener('click',store);
  $('color-name').addEventListener('keydown',event=>{if(event.key==='Enter')store();});
  function renderPalette(){
    const entries=palette().map(({hex,name})=>{
      const chip=element('span');chip.className='palette-chip';
      const select=action(name,()=>{paint(hex);feedback('');},paintChoice(current().paint).hex===hex);
      select.dataset.hex=hex;select.title=name+' '+hex.toUpperCase();select.style.setProperty('--swatch',hex);
      const remove=action('×',()=>{savePalette(palette().filter(color=>color.hex!==hex));renderPalette();feedback(name+' removed.');});
      remove.setAttribute('aria-label','Remove saved color '+name);
      chip.append(select,remove);return chip;
    });
    $('saved-colors').replaceChildren(...entries);
  }
  function renderWheels(){
    const b=current(),options=wheelOptions(b.vehicle),chosen=wheelDesign(b.vehicle,b.wheelDesign);
    const finish=FINISHES.find(option=>option.id===b.finish)||FINISHES[0];
    const cards=options.map(wheel=>{
      const control=action('',()=>{
        style('wheelDesign',wheel.id);renderWheels();
        $('wheel-design-picker').querySelector('[data-design="'+wheel.id+'"]')?.focus({preventScroll:true});
      },wheel.id===chosen?.id);
      const canvas=element('canvas');canvas.width=120;canvas.height=120;canvas.setAttribute('aria-hidden','true');
      drawWheelSample(canvas,b.vehicle,wheel.id,finish.hex);
      control.dataset.design=wheel.id;control.append(canvas,element('span',wheel.name));
      return control;
    });
    $('wheel-design-picker').replaceChildren(...cards);
    const info=$('wheel-info');info.replaceChildren();
    if(chosen){
      const size=chosen.frontDiameter===chosen.rearDiameter?chosen.frontDiameter+' in':chosen.frontDiameter+' in front / '+chosen.rearDiameter+' in rear';
      info.append(element('strong',size+(chosen.partNumber?' · '+chosen.partNumber:'')),element('p',chosen.description),element('p',chosen.fitment));
      const links=element('div');links.className='reference-links';
      if(chosen.buy)links.append(link(chosen.buyRear?'Find front wheel':'Find wheels',chosen.buy.url));
      if(chosen.buyRear)links.append(link('Find rear wheel',chosen.buyRear.url));
      if(chosen.source)links.append(link('Wheel reference',chosen.source.url));info.append(links);
    }else info.append(element('p','The factory wheel is shown on this model.'));
    swatches('finish-picker',FINISHES,b.finish,id=>{
      style('finish',id);renderWheels();
      $('finish-picker').querySelector('[aria-pressed=true]')?.focus({preventScroll:true});
    });
    $('finish-label').textContent=finish.name;
  }
  function renderLift(){
    const build=current(),options=liftOptions(build.vehicle),panel=$('lift-controls');
    panel.hidden=options.length<2;
    if(panel.hidden)return;
    const lift=normalizedLift(build.vehicle,build.lift),choice=liftChoice(build.vehicle,lift.mode),select=$('lift-mode');
    if(select.dataset.vehicle!==build.vehicle){
      select.replaceChildren(...options.map(option=>{
        const item=element('option',option.name);item.value=option.id;return item;
      }));
      select.dataset.vehicle=build.vehicle;
    }
    select.value=lift.mode;
    $('lift-label').textContent=lift.mm?(choice.frontOnly?'Front +':'+')+lift.mm+' mm':'Standard';
    $('lift-description').textContent=choice.description;
    const reference=$('lift-reference');reference.hidden=!choice.source;
    if(choice.source){reference.href=choice.source;reference.textContent=choice.sourceText+' ↗';}
    else reference.removeAttribute('href');
  }
  $('lift-mode').addEventListener('change',event=>{
    style('lift',normalizedLift(current().vehicle,{mode:event.target.value}));renderLift();
  });
  const sections=[['equipment','Accessories'],['paint','Paint'],['wheels','Wheels']];
  let currentVehicle,renderedEquipment,section='paint',kind='';
  const filter=$('equipment-filter');
  const categoryLabels={'Raised intakes':'Snorkels and raised intakes','Display lighting':'Police-style display lights'};
  const slug=text=>text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
  function showSection(id,sync=true){
    section=sections.some(([key])=>key===id)?id:'equipment';
    for(const [key] of sections){
      $('custom-'+key).hidden=key!==section;
      $('custom-sections').querySelector('[data-section="'+key+'"]').setAttribute('aria-pressed',String(key===section));
    }
    if(sync){
      const url=new URL(location.href);url.searchParams.set('section',section);
      if(section==='equipment'&&kind)url.searchParams.set('equipment',slug(kind));else url.searchParams.delete('equipment');
      history.replaceState(null,'',url);
    }
  }
  for(const [id,title] of sections){
    const b=action(title,()=>showSection(id));b.dataset.section=id;b.setAttribute('aria-controls','custom-'+id);$('custom-sections').append(b);
  }
  filter.addEventListener('change',()=>{kind=filter.value;showSection('equipment');renderAccessories();});
  function renderAccessories(){
    const build=current();
    const options=accessoriesFor(build.vehicle),kinds=[...new Set(options.map(o=>o.kind))];
    if(currentVehicle!==build.vehicle){
      const url=new URL(location.href),requested=url.searchParams.get('section');
      kind=kinds.find(k=>slug(k)===url.searchParams.get('equipment'))||'';
      if(!kind&&url.searchParams.has('equipment')){
        url.searchParams.delete('equipment');history.replaceState(null,'',url);
      }
      const defaultSection=['g500','porsche993cab','porsche992scab','porsche996cab','bmw328xi','sl550'].includes(build.vehicle)?'equipment':'paint';
      showSection(requested||defaultSection,false);currentVehicle=build.vehicle;
    }
    if(!kinds.includes(kind))kind='';
    const equipmentKey=build.vehicle+'|'+kind;
    const updateToggle=(button,option)=>{
      const selected=build.parts.includes(option.id),verb=selected?'Remove':'Add';
      button.textContent=verb;
      button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',verb+' '+option.name);
    };
    if(renderedEquipment===equipmentKey){
      for(const button of $('accessory-picker').querySelectorAll('[data-accessory]')){
        updateToggle(button,options.find(option=>option.id===button.dataset.accessory));
      }
      return;
    }
    renderedEquipment=equipmentKey;
    filter.replaceChildren(...['',...kinds].map(k=>{
      const opt=element('option',categoryLabels[k]||k||'All accessories');opt.value=k;return opt;
    }));
    filter.value=kind;$('equipment-filter-label').hidden=kinds.length<2;
    const items=options.filter(option=>!kind||option.kind===kind).map(option=>{
      const row=element('article');row.className='accessory-option';
      const heading=element('div');heading.className='accessory-heading';const title=element('h5',option.name);
      const toggle=action('',()=>accessory(option.id));
      toggle.dataset.accessory=option.id;updateToggle(toggle,option);
      heading.append(title,toggle);
      const details=element('details'),summary=element('summary','Fitment and sources'),links=element('div');
      links.className='reference-links';
      if(option.url&&option.seller)links.append(link(option.seller,option.url));
      if(option.componentOffer)links.append(link(option.componentOffer.label,option.componentOffer.url));
      if(option.source)links.append(link(option.source.label,option.source.url));
      details.append(summary,element('p',option.fit),links);
      const kindLabel=categoryLabels[option.kind]||option.kind;
      row.append(element('small',option.mockup?'Design mock-up · '+kindLabel:kindLabel),heading,element('p',option.description),details);return row;
    });
    $('accessory-picker').replaceChildren(...items.length?items:[element('p','No accessories are catalogued for this vehicle.')]);
  }
  return {render(){
    swatches('paint-picker',PAINTS,current().paint,id=>{paint(id);feedback('');});
    $('color-name').value='';feedback('');renderPalette();syncPaint();renderWheels();renderLift();renderAccessories();
  },renderWheels,renderLift,renderAccessories};
}
