import {mountGeometryBoard} from './g500-geometry-board.js';
import {requestSections} from './priority-requests.js';
import {vehiclePriorities} from './priority-vehicles.js';
import {detailBenchmark,vehicleReviewTracks,reviewProgress} from './priority-review-tracks.js';

import {priorityLevels,workflowStatuses,trackingDefaults} from './priority-tracking.js';
import {vehicleDecisions} from './vehicle-decisions.js';
import {domains,typesFor,readFilters,writeFilters,filterKeys,inScope,savedAssignment} from './priority-filters.js';

const labels={shipped:'Shipped',partial:'Partial',open:'Open'};
const fold=value=>String(value).normalize('NFKD').replace(/\p{Mark}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const words=value=>fold(value).split(/\s+/).filter(Boolean);
export function statusValue(value){return Object.hasOwn(labels,value)?value:'all';}

export function matches(item,query,status,group=''){
  if(statusValue(status)!=='all'&&item.status!==status)return false;
  const haystack=fold([group,item.id,item.status,item.title,item.name,item.vehicleName,item.year,item.description,item.domain,item.type,item.done,item.next,
    item.source?.label,item.source?.kind,item.source?.scope,...item.links.map(l=>l.label)].filter(Boolean).join(' '));
  return words(query).every(term=>haystack.includes(term));
}

const element=(tag,className='',value='')=>{
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(value)el.textContent=value;
  return el;
};
const byId=id=>document.getElementById(id);
function anchor(label,url){
  const a=element('a','',label);
  a.href=url;
  return a;
}
function entryLinks(links,context){
  const nav=element('nav','entry-links');
  nav.setAttribute('aria-label',context+' links');
  for(const {label,url} of links)nav.append(anchor(label,url));
  return nav;
}
function createRequest(item,controls){
  const row=element('li');
  row.id='request-'+item.id;
  const body=element('div','request-copy');
  body.append(element('h4','',item.title),element('p','',item.description),entryLinks(item.links,item.title));
  row.append(body,controls);
  return row;
}

function createVehicle(item,controls){
  const wrap=element('article','vehicle-card'),card=element('details','vehicle-details');
  wrap.id='vehicle-'+item.id;
  card.open=item.id==='g500';
  const title=element('summary'),heading=element('span','vehicle-heading');
  heading.append(element('small','',String(item.year)),document.createTextNode(item.name));
  title.append(heading,element('span','vehicle-meta',item.type));
  const body=element('div','vehicle-copy'),source=element('div','source-note');
  source.append(element('span','','First reference · '+item.source.kind),anchor(item.source.label,item.source.url),element('p','',item.source.scope));
  if(item.evidence.length)source.append(entryLinks(item.evidence,item.name+' additional source'));
  body.append(source,element('p','',item.done));
  const next=element('p');
  next.append(element('b','','Next check. '),document.createTextNode(item.next));
  body.append(next,entryLinks(item.links,item.name));
  card.append(title,body);
  wrap.append(card,controls);
  return wrap;
}
// Anchor and label for an entry a decision unblocks, in kind:id form.
export function decisionTarget(ref){
  const [kind,id]=ref.split(':');
  if(kind==='request'){
    const item=requestSections.flatMap(s=>s.items).find(r=>r.id===id);
    return item&&{label:item.title,url:'#request-'+id};
  }
  if(kind==='review'){
    const task=vehicleReviewTracks.flatMap(t=>t.steps).find(s=>s.id===id);
    return task&&{label:task.vehicleName+' · '+task.title,url:'#review-'+id};
  }
  if(kind==='vehicle'){
    const v=vehiclePriorities.find(row=>row.id===id);
    return v&&{label:v.year+' '+v.name+' · register',url:'#vehicle-'+id};
  }
  return null;
}
function createDecision(item){
  const row=element('li','review-task'),copy=element('div','review-copy');
  row.id='decision-'+item.id;
  const basis=element('p');basis.append(element('b','','Why. '),document.createTextNode(item.basis));
  copy.append(element('h4','',item.title),element('p','',item.decision),basis,entryLinks(item.sources,item.title+' source'),
    entryLinks(item.unblocks.map(decisionTarget).filter(Boolean),item.title+' unblocks'));
  row.append(copy);return row;
}
function createReview(item,controls){
  const row=element('li','review-task'),copy=element('div','review-copy');
  row.id='review-'+item.id;
  copy.append(element('h4','',item.title),element('p','',item.description),entryLinks(item.links,item.vehicleName+' '+item.title));
  row.append(copy,controls);return row;
}

const filterKey='garage.priority-board.filters.v1';
const recordPrefix='garage.priority-board.record.v1.';
function read(key){
  try{return JSON.parse(localStorage.getItem(key));}catch{return null;}
}
function save(key,value){
  try{
    if(value==null)localStorage.removeItem(key);
    else localStorage.setItem(key,JSON.stringify(value));
    return true;
  }catch{return false;}
}
function option(list){
  const opt=element('option','',list.label);opt.value=list.id;
  if(list.description)opt.title=list.description;
  return opt;
}
function optionsFromNames(names){return names.map(id=>option({id,label:id}));}

export function mountPriorityBoard(){
  // Apply this backlog reset once per browser so later manual parking still works.
  const resetKey='garage.priority-board.parked-reset.2026-11-15';
  if(!read(resetKey)){
    try{
      const keys=Object.keys(localStorage).filter(key=>key.startsWith(recordPrefix));
      for(const key of keys){
        const record=read(key);
        if(record?.workflow==='parked'&&!save(key,{...record,workflow:'todo'}))throw new Error('Storage unavailable');
      }
      save(resetKey,true);
    }catch{ /* A browser without writable storage can still use the board defaults. */ }
  }
  const query=byId('priority-query'),level=byId('priority-level'),status=byId('priority-status');
  const domain=byId('environment-filter'),type=byId('type-filter'),clear=byId('clear-filter');
  const vehicle=byId('vehicle-filter');
  const hiddenChoices=new Map(),records=new Map(),groups=[];
  let filters=readFilters(new URLSearchParams());
  level.append(...priorityLevels.map(option));status.append(...workflowStatuses.map(option));
  domain.append(...optionsFromNames(domains));
  vehicle.append(...vehicleReviewTracks.map(v=>option({id:v.id,label:v.year+' '+v.name})));
  const decisions=vehicleDecisions.map(item=>({item,row:createDecision(item)}));
  byId('decision-rows')?.append(...decisions.map(d=>d.row));
  const benchmark=byId('detail-benchmark'),checks=element('ul');
  for(const line of detailBenchmark.checks)checks.append(element('li','',line));
  benchmark.append(element('h3','',detailBenchmark.title),element('p','',detailBenchmark.description),checks);
  function entry(kind,item){
    const key=kind+':'+item.id,base=trackingDefaults(kind,item.id);
    const overrides=savedAssignment(read(recordPrefix+key));
    const controls=element('div','tracking-controls'),selectors={};
    const record={item,key,base,selectors,overrides,index:records.size};
    const label=item.vehicleName?item.vehicleName+' · '+item.title:item.title||item.name;
    for(const [field,name,choices] of [['level','Priority',priorityLevels],['workflow','Status',workflowStatuses]]){
      const select=element('select','edit-'+field);
      select.setAttribute('aria-label',name+' for '+label);
      select.append(...choices.map(option));controls.append(select);selectors[field]=select;
      select.addEventListener('change',()=>{
        const current=savedAssignment(read(recordPrefix+key));
        record.overrides={...record.overrides,...current,[field]:select.value};
        for(const prop of ['level','workflow'])if(record.overrides[prop]===base[prop])delete record.overrides[prop];
        if(!save(recordPrefix+key,Object.keys(record.overrides).length?record.overrides:null)){
          byId('edit-message').textContent='This edit applies until you close the page. Browser storage is unavailable.';
          byId('edit-message').hidden=false;
        }
        redraw();
        if(record.row.hidden)status.focus({preventScroll:true});
        else select.focus({preventScroll:true});
      });
    }
    record.row=kind==='request'?createRequest(item,controls):kind==='review'?createReview(item,controls):createVehicle(item,controls);
    record.reason=element('p','parked-reason',base.reason);record.reason.hidden=true;
    record.row.querySelector(kind==='request'?'.request-copy':kind==='review'?'.review-copy':'.vehicle-copy').append(record.reason);
    records.set(key,record);
    return record;
  }
  for(const group of requestSections){
    const wrap=element('section','group'),list=element('ol','request-list');
    const rows=group.items.map(item=>entry('request',item));
    list.append(...rows.map(r=>r.row));wrap.append(element('h3','',group.name),list);
    byId('request-sections').append(wrap);groups.push({name:group.name,rows,wrap,list,kind:'request'});
  }
  for(const track of vehicleReviewTracks){
    const wrap=element('details','review-card'),list=element('ol','review-tasks'),title=element('summary');
    wrap.id='review-track-'+track.id;wrap.open=track.id==='g500';
    const heading=element('span','vehicle-heading'),coverage=element('span','review-coverage');
    heading.append(element('small','',String(track.year)),document.createTextNode(track.name));title.append(heading,coverage);
    const recorded=element('p','review-intro');recorded.append(element('b','','Recorded work. '),document.createTextNode(track.recorded));
    wrap.append(title,recorded);
    if(track.scope)wrap.append(element('p','review-scope',track.scope));
    const rows=track.steps.map(task=>entry('review',task));list.append(...rows.map(r=>r.row));wrap.append(list);
    byId('review-sections').append(wrap);groups.push({name:track.name,rows,wrap,list,kind:'review',track,coverage});
  }
  for(const name of domains){
    const wrap=element('section','group'),list=element('div','vehicle-list');
    wrap.id='domain-'+name.toLowerCase();
    const jump=anchor(name,'#'+wrap.id);byId('domain-links').append(jump);
    const rows=vehiclePriorities.filter(v=>v.domain===name).map(item=>entry('vehicle',item));
    list.append(...rows.map(r=>r.row));wrap.append(element('h3','',name),list);
    byId('vehicle-sections').append(wrap);groups.push({name,rows,wrap,list,kind:'vehicle',jump});
  }
  for(const name of domains){
    const area=element('fieldset'),legend=element('legend','',name);area.append(legend);
    for(const category of [name,...typesFor(name)]){
      const label=element('label'),box=element('input');box.type='checkbox';box.value=category;
      box.setAttribute('aria-label','Hide '+category);
      label.append(box,document.createTextNode(category===name?({Land:'All land vehicles',Air:'All aircraft & space',Sea:'All vessels'})[name]:category));
      box.addEventListener('change',()=>{
        filters.hide=[...hiddenChoices].filter(([,input])=>input.checked).map(([key])=>key);
        apply();
      });
      hiddenChoices.set(category,box);area.append(label);
    }
    byId('category-toggles').append(area);
  }
  const drawGeometry=mountGeometryBoard({read,save,redraw});
  function refreshInputs(){
    query.value=filters.q;level.value=filters.level;status.value=filters.workflow;domain.value=filters.domain;
    vehicle.value=filters.vehicle;
    const opt=option({id:'all',label:'All types'});
    type.replaceChildren(opt,...optionsFromNames(typesFor(filters.domain)));type.value=filters.type;
    for(const [category,box] of hiddenChoices)box.checked=filters.hide.includes(category);
  }
  function redraw(){
    let requests=0,vehicles=0,reviews=0;
    for(const group of groups){
      let count=0;
      for(const r of group.rows){
        const t={...r.base,...r.overrides};
        r.reason.hidden=r.base.reason===r.item.description||!(t.workflow==='todo'||t.workflow==='parked');
        r.selectors.level.value=t.level;r.selectors.workflow.value=t.workflow;
        r.selectors.level.dataset.value=t.level;r.selectors.workflow.dataset.value=t.workflow;
        const searchContext=[group.name,group.track?.recorded,group.track?.scope,group.track?.coverage,t.level,r.base.reason,workflowStatuses.find(s=>s.id===t.workflow).label,...t.domains,...t.types].join(' ');
        r.row.hidden=!(inScope(t,filters)&&matches(r.item,filters.q,'all',searchContext));
        if(!r.row.hidden)count++;
      }
      const ordered=[...group.rows].sort((a,b)=>a.selectors.level.value.localeCompare(b.selectors.level.value)||a.index-b.index);
      if(ordered.some((r,i)=>group.list.children[i]!==r.row))group.list.append(...ordered.map(r=>r.row));
      group.wrap.hidden=!count;if(group.jump)group.jump.hidden=!count;
      if(group.kind==='review'){
        reviews+=count;
        const progress=reviewProgress(group.track,group.rows.map(r=>r.selectors.workflow.value));
        group.coverage.textContent=progress.label+' · '+progress.done+'/'+progress.total+' done';
        group.wrap.dataset.coverage=progress.label;
        if(filters.vehicle===group.track.id)group.wrap.open=true;
      }else if(group.kind==='vehicle'){
        vehicles+=count;
        for(const r of group.rows)if(filters.vehicle===r.item.id)r.row.querySelector('details').open=true;
      }else requests+=count;
    }
    byId('requests').hidden=!requests;byId('vehicles').hidden=!vehicles;
    byId('reviews').hidden=!reviews;
    let shownDecisions=0;
    for(const d of decisions){
      const text=[d.item.title,d.item.decision,d.item.basis,...d.item.vehicleIds].join(' ');
      d.row.hidden=!((filters.vehicle==='all'||d.item.vehicleIds.includes(filters.vehicle))&&words(filters.q).every(term=>fold(text).includes(term)));
      if(!d.row.hidden)shownDecisions++;
    }
    if(byId('decisions'))byId('decisions').hidden=!shownDecisions;
    const geometry=drawGeometry(filters);
    byId('empty-message').hidden=Boolean(requests||vehicles||reviews||geometry);
    clear.hidden=!writeFilters(filters).size;
    byId('hidden-count').textContent=filters.hide.length?' · '+filters.hide.join(', '):'';
    byId('board-count').textContent=requests+' request'+(requests===1?'':'s')+' · '+vehicles+' vehicle'+(vehicles===1?'':'s')+' · '+reviews+' review task'+(reviews===1?'':'s')+(geometry?' · '+geometry+' G500 part '+(geometry===1?'entry':'entries'):'');
  }
  function apply(){
    redraw();
    const next=writeFilters(filters),url=new URL(location.href);
    for(const k of filterKeys)url.searchParams.delete(k);
    for(const [k,v] of next)url.searchParams.append(k,v);
    if(url.hash&&byId(url.hash.slice(1))?.closest('[hidden]'))url.hash='';
    if(url.href!==location.href)history.replaceState(null,'',url);
    save(filterKey,next.size?next.toString():null);
  }
  function revealHash(){
    const target=byId(location.hash.slice(1));
    if(!target)return;
    if(target.closest('[hidden]')){
      filters=readFilters(new URLSearchParams());refreshInputs();apply();
    }
    const detail=target.closest('.review-card')||(target.matches('.vehicle-card')&&target.querySelector('details'));
    if(detail)detail.open=true;
    target.scrollIntoView?.({block:'start',behavior:'instant'});
  }
  function loadLocation(){
    const params=new URL(location.href).searchParams;
    const stored=read(filterKey);
    const local=!filterKeys.some(k=>params.has(k))&&!location.hash&&typeof stored==='string';
    filters=readFilters(local?new URLSearchParams(stored):params);
    refreshInputs();redraw();revealHash();
  }
  function reset(){
    filters=readFilters(new URLSearchParams());refreshInputs();apply();query.focus();
  }
  byId('board-filter').addEventListener('submit',e=>{e.preventDefault();apply();});
  query.addEventListener('input',()=>{filters.q=query.value.trim();apply();});
  level.addEventListener('change',()=>{filters.level=level.value;apply();});
  status.addEventListener('change',()=>{filters.workflow=status.value;apply();});
  domain.addEventListener('change',()=>{filters.domain=domain.value;if(!typesFor(domain.value).includes(filters.type))filters.type='all';refreshInputs();apply();});
  type.addEventListener('change',()=>{filters.type=type.value;apply();});
  vehicle.addEventListener('change',()=>{filters.vehicle=vehicle.value;refreshInputs();apply();});
  clear.addEventListener('click',reset);byId('empty-clear').addEventListener('click',reset);
  addEventListener('storage',e=>{
    if(e.key!==null&&!e.key.startsWith(recordPrefix))return;
    for(const [key,r] of records)if(!e.key||recordPrefix+key===e.key)r.overrides=savedAssignment(read(recordPrefix+key));
    redraw();
  });
  for(const link of document.querySelectorAll('.section-jump a,.entry-links a,.skip-link')){
    const href=link.getAttribute('href');
    if(!href?.startsWith('#'))continue;
    link.addEventListener('click',()=>{
      const target=byId(href.slice(1));
      if(target?.closest('[hidden]')){
        filters=readFilters(new URLSearchParams());refreshInputs();apply();
      }
    });
  }
  addEventListener('popstate',loadLocation);addEventListener('hashchange',revealHash);
  loadLocation();
}
if(typeof document!=='undefined'&&document.getElementById('board-filter'))mountPriorityBoard();
