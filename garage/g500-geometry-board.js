import {g500Geometry,basisLabels,geometryWorkshopLink} from './g500-geometry-register.js';
import {priorityLevels,workflowStatuses} from './priority-tracking.js';
import {inScope,savedAssignment} from './priority-filters.js';

const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const option=(id,label)=>{const n=node('option',label);n.value=id;return n;};
const link=(text,url)=>{const n=node('a',text);n.href=url;return n;};
const clean=s=>s.normalize('NFKD').replace(/\p{Mark}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const scope={vehicleIds:['g500'],categories:[{domain:'Land',type:'SUVs'}]};
const prefix='garage.priority-board.record.v1.geometry:';
const pageSize=12;
export function mountGeometryBoard({read,save,redraw}){
  const directory=document.getElementById('g500-geometry'),list=document.getElementById('geometry-rows');
  const group=document.getElementById('geometry-group'),basis=document.getElementById('geometry-basis');
  const count=document.getElementById('geometry-count'),prev=document.getElementById('geometry-prev'),next=document.getElementById('geometry-next');
  const {rows,modeled,checked,studies,coverageGaps,plates}=g500Geometry(),assignments=new Map(),terms=new Map(),groups=new Map();
  const report=document.getElementById('geometry-summary');
  report.textContent=modeled+' selectable part entries across '+studies+' opened studies. '+checked+' entries have a specific source check recorded. The board also tracks '+coverageGaps+' gaps in vehicle coverage and '+plates+' parts-catalog groups to reconcile by callout. A single model entry can represent several installed pieces.';
  for(const r of rows){
    if(!groups.has(r.group))groups.set(r.group,r.group==='catalog-index'?'Mercedes parts catalog':r.groupName);
    const saved=savedAssignment(read(prefix+r.id));
    if(Object.keys(saved).length)assignments.set(r.id,saved);
    terms.set(r.id,clean([r.id,r.title,r.groupName,basisLabels[r.kind],r.fact,r.need,r.source?.label,...r.claims.flatMap(c=>[c.source?.label,c.fact,c.need])].filter(Boolean).join(' ')));
  }
  for(const [id,name] of [...groups].sort((a,b)=>a[1].localeCompare(b[1])))group.append(option(id,name));
  for(const [id,label] of Object.entries(basisLabels))if(rows.some(r=>r.kind===id||r.claims.some(c=>c.kind===id)))basis.append(option(id,label));
  let page=0,lastFilters='';
  const localControls=[['system',group],['basis',basis]];
  function restoreLocalFilters(){
    const params=new URL(location.href).searchParams;
    for(const [key,select] of localControls){
      const id=params.get(key);select.value=[...select.options].some(o=>o.value===id)?id:'all';
    }
    page=0;
  }
  restoreLocalFilters();
  addEventListener('popstate',restoreLocalFilters);
  for(const [key,select] of localControls)select.addEventListener('change',()=>{
    const url=new URL(location.href);
    if(select.value==='all')url.searchParams.delete(key);else url.searchParams.set(key,select.value);
    history.replaceState(null,'',url);page=0;redraw();
  });
  prev.addEventListener('click',()=>{page--;redraw();});next.addEventListener('click',()=>{page++;redraw();});
  addEventListener('storage',e=>{
    if(e.key===null){assignments.clear();redraw();}
    else if(e.key.startsWith(prefix)){assignments.set(e.key.slice(prefix.length),savedAssignment(read(e.key)));redraw();}
  });
  function rowNode(r){
    const item=node('li',null,'review-task'),body=node('div',null,'review-copy'),controls=node('div',null,'tracking-controls');
    const title=node('h4',r.title),meta=node('small',r.groupName+' · '+basisLabels[r.kind]);
    body.append(meta,title);
    const nav=node('nav',null,'entry-links'),href=geometryWorkshopLink(r);
    if(href)nav.append(link(r.group==='accessories'?'See accessory options':'Select in model',href));
    if(r.claims.length){
      for(const c of r.claims){
        body.append(node('p',c.fact),node('p',c.need));
        for(const ref of [c.source,...c.additionalSources||[]])if(ref?.url)nav.append(link(ref.label,ref.url));
      }
    }else{
      if(r.need)body.append(node('p',r.need));
      if(r.related?.length){
        const count=r.related.length;
        body.append(node('p',count+' model '+(count===1?'entry links':'entries link')+' to this catalog group.'));
        for(const part of r.related.slice(0,2))nav.append(link(part.title,geometryWorkshopLink(part)));
      }
      if(r.source?.url)nav.append(link(r.source.label||'Parts reference',r.source.url));
    }
    if(nav.childElementCount)body.append(nav);
    for(const [field,label,choices] of [['level','Priority',priorityLevels],['workflow','Status',workflowStatuses]]){
      const s=node('select',null,'edit-'+field);
      s.setAttribute('aria-label',label+' for '+r.title);
      s.append(...choices.map(c=>option(c.id,c.label)));
      s.value=assignments.get(r.id)?.[field]||r[field];s.dataset.value=s.value;
      s.addEventListener('change',()=>{
        const value={...assignments.get(r.id),...savedAssignment(read(prefix+r.id)),[field]:s.value};
        if(value[field]===r[field])delete value[field];
        assignments.set(r.id,value);
        if(!save(prefix+r.id,Object.keys(value).length?value:null)){
          const status=document.getElementById('edit-message');status.textContent='This edit applies until you close the page. Browser storage is unavailable.';status.hidden=false;
        }
        redraw();
        const replacement=[...list.querySelectorAll('select')].find(n=>n.getAttribute('aria-label')===s.getAttribute('aria-label'));
        (replacement||group).focus({preventScroll:true});
      });
      controls.append(s);
    }
    item.append(body,controls);return item;
  }
  return filters=>{
    const key=JSON.stringify(filters);if(key!==lastFilters){page=0;lastFilters=key;}
    const query=filters.q,exact=rows.some(r=>r.id===query),words=clean(query).split(' ').filter(Boolean);
    const candidates=rows.filter(r=>{
      const state={...scope,level:r.level,workflow:r.workflow,...assignments.get(r.id)};
      return inScope(state,filters)&&(exact?r.id===query:words.every(w=>terms.get(r.id).includes(w)||'2002 mercedes benz g500 g class'.includes(w)));
    });
    directory.hidden=!candidates.length;
    const matched=candidates.filter(r=>(group.value==='all'||group.value===r.group)&&(basis.value==='all'||basis.value===r.kind||r.claims.some(c=>c.kind===basis.value)));
    matched.sort((a,b)=>(assignments.get(a.id)?.level||a.level).localeCompare(assignments.get(b.id)?.level||b.level));
    const pages=Math.ceil(matched.length/pageSize);page=Math.max(0,Math.min(page,pages-1));
    const first=page*pageSize,visible=matched.slice(first,first+pageSize);
    list.replaceChildren(...visible.map(rowNode));prev.disabled=page===0;next.disabled=page+1>=pages;
    count.textContent=matched.length?(first+1)+'–'+(first+visible.length)+' of '+matched.length+(matched.length===1?' entry':' entries'):'No entries match this system and source filter.';
    return candidates.length;
  };
}
