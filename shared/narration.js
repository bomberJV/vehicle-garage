import {restoreVoiceFrames} from './opus-frames.js';
import {garageControlHelp,localNarrator,phraseIndex,recordedRanges,spokenText} from './narration-voice.js';

const script=document.querySelector('script[data-narration]');
const directory=new URL('listening/',import.meta.url);
const collection=script?.dataset.narration || 'site';
const targets='h1,h2,h3,h4,h5,h6,p,li,figcaption,blockquote,tr,dl,caption,#mechanism-controls,#section-tools,#hover-detail,#system-description,#motion-note,#exhibit-description,.metric,.mini-stat,.scope-note,.case-readout,.control-label,.canvas-tip,.chapter-takeaway,.footer-note,.open-question,span.note';
const hidden='[hidden],[aria-hidden="true"],[inert],script,style,noscript,svg,canvas,[data-listening]';
const ignored='nav,[role="navigation"],[role="tablist"],.sr-only,.visually-hidden,.kicker,.eyebrow,.mono,.status,.part-sku,.part-price,.inspection-legend,.inspection-path,.budget-caption,.choice-caption';
const controls=new WeakMap();
const namedHeadings=new WeakSet();
const media=new Audio();
media.hidden=true;media.dataset.listening='player';media.preload='none';
document.body.append(media);
let active=null,session=0,fetcher=null,mediaUrl='',indexPromise=null,utterance=null;
const wholeFiles=new Map();

function nodeText(node) {
  if(!node)return '';
  if(node.nodeType===Node.TEXT_NODE)return node.nodeValue;
  if(node.nodeType!==Node.ELEMENT_NODE || node.matches(hidden+',button,input,select,textarea'))return '';
  if(node.tagName==='BR')return ' ';
  return Array.from(node.childNodes,child=>(child.nodeType===Node.ELEMENT_NODE && child.previousSibling?.nodeType===Node.ELEMENT_NODE?' ':'')+nodeText(child)).join('');
}
const clean=value=>value.replace(/\s+/g,' ').trim();
function phrases(target) {
  if(target.matches('.request-list > li')){
    return ['h4','.request-copy > p','.status'].map(s=>clean(nodeText(target.querySelector(s)))).filter(Boolean);
  }
  if(target.matches('.vehicle-copy > p')&&target.firstElementChild?.tagName==='B'){
    return Array.from(target.childNodes,n=>clean(nodeText(n))).filter(Boolean);
  }
  if(Object.hasOwn(garageControlHelp,target.id))return [garageControlHelp[target.id]];
  if(target.matches('.fitment'))return Array.from(target.childNodes,node=>clean(nodeText(node))).filter(Boolean);
  if(target.id==='hover-detail'){
    const title=target.parentElement.querySelector('#hover-name');
    return [title,target].filter(Boolean).map(el=>clean(nodeText(el))).filter(Boolean);
  }
  if(target.tagName==='TR')return [...target.cells].map(cell=>clean(nodeText(cell))).filter(Boolean);
  if(target.tagName==='DL')return Array.from(target.querySelectorAll('dt,dd'),e=>clean(nodeText(e))).filter(Boolean);
  if(target.id==='workbench'){
    const selectors=['#vehicle-title','#inspection-title','#component-name','#component-description','#component-location','#component-quantity','#assembly-description','#system-description','#motion-note'];
    return [...new Set(selectors.flatMap(s=>{const el=target.querySelector(s);return el?.getClientRects().length?[clean(nodeText(el))]:[];}))].filter(Boolean);
  }
  if(target.matches('a') && target.querySelector('p,h2,h3,h4')){
    return Array.from(target.querySelectorAll('h2,h3,h4,p'),el=>clean(nodeText(el))).filter(Boolean);
  }
  return [clean(nodeText(target))].filter(Boolean);
}

function icon(name) {
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 18 18');svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(svg.namespaceURI,'path');
  path.setAttribute('d',name==='stop'?'M4 4h10v10H4z':'M2 7h3l4-3v10l-4-3H2z M12 6q3 3 0 6 M14.2 3.8q5 5.2 0 10.4');
  for(const [key,val] of Object.entries({fill:name==='stop'?'currentColor':'none',stroke:'currentColor','stroke-width':'1.5','stroke-linecap':'round','stroke-linejoin':'round'}))path.setAttribute(key,val);
  svg.append(path);return svg;
}

function labelFor(target) {
  if(target.id==='workbench')return 'the current vehicle inspection';
  if(target.id==='mechanism-controls')return 'the motion controls';
  if(target.id==='section-tools')return 'the cross-section controls';
  return phrases(target).join(' ').slice(0,98)||'this text';
}
function updateButton(button,target,playing=false) {
  const name=playing?'Stop narration':'Listen to '+labelFor(target);
  button.setAttribute('aria-label',name);
  button.setAttribute('title',name);
  button.setAttribute('aria-pressed',String(playing));
  button.replaceChildren(icon(playing?'stop':'speaker'));
}
function add(target) {
  if(!(target instanceof Element)||target.closest(hidden+','+ignored))return;
  if(target.id!=='workbench'&&!target.matches(targets))return;
  if(target.closest('button,label,summary,[role="button"],[role="tab"]'))return;
  if(target.closest('tr') && target.tagName!=='TR')return;
  if(target.parentElement?.closest('p,li,figcaption,blockquote,dl,.metric,.scope-note,.case-readout,h1,h2,h3,h4,h5,h6'))return;
  const card=target.closest('a');if(card)target=card;
  let anchor=target;
  if(target.tagName==='TR')anchor=target.cells[target.cells.length-1];
  else if(target.tagName==='DL')anchor=target.querySelector('dd:last-of-type') ||target;
  else if(target.id==='workbench')anchor=target.querySelector('.inspector-heading');
  else if(target.id==='mechanism-controls')anchor=target.querySelector('.motion-row');
  else if(target.id==='section-tools')anchor=target.querySelector('.section-controls');
  else if(target.tagName==='A')anchor=target.parentElement;
  if(!anchor||!phrases(target).length)return;
  if(/^H[1-6]$/.test(target.tagName) && (!target.hasAttribute('aria-label') || namedHeadings.has(target))){
    namedHeadings.add(target);target.setAttribute('aria-label',clean(nodeText(target)));
  }
  let b=controls.get(target);
  if(b?.isConnected && (target.contains(b)||target.tagName==='A'&&target.nextElementSibling===b||target.id==='hover-detail'&&target.parentElement===b.parentElement)){
    if(active?.button!==b){const label='Listen to '+labelFor(target);b.setAttribute('aria-label',label);b.title=label;}
    return;
  }
  b=document.createElement('button');b.type='button';b.className='listen-button';
  b.dataset.listening='control';controls.set(target,b);
  if(target.id==='workbench')b.classList.add('listen-panel');
  if(target.tagName==='A'){
    const frame=document.createElement('div');frame.className='listen-card-frame';
    if(target.classList.contains('play-card-wide'))frame.classList.add('listen-card-wide');
    target.before(frame);frame.append(target,b);b.classList.add('listen-card');
  }
  else if(target.id==='hover-detail') anchor.parentElement.append(b);
  else anchor.append(b);
  updateButton(b,target);
  b.addEventListener('click',()=>{if(active?.button===b)stop();else play(b,target);});
}

let statusElement,statusTimeout;
function report(message) {
  if(!statusElement){
    statusElement=document.createElement('div');statusElement.className='listen-status';statusElement.dataset.listening='status';
    statusElement.setAttribute('role','status');document.body.append(statusElement);
  }
  clearTimeout(statusTimeout);statusElement.textContent=message;
  statusTimeout=setTimeout(()=>{statusElement.textContent='';},6500);
}
function stop() {
  session++;fetcher?.abort();fetcher=null;
  media.onended=media.onerror=null;
  media.pause();media.removeAttribute('src');media.load();
  if(mediaUrl){URL.revokeObjectURL(mediaUrl);mediaUrl='';}
  if(utterance){utterance.onend=utterance.onerror=null;window.speechSynthesis?.cancel();utterance=null;}
  if(active){updateButton(active.button,active.target);active=null;}
  if(statusElement)statusElement.textContent='';
}
async function loadIndex() {
  if(!indexPromise)indexPromise=fetch(new URL(collection+'.json',directory)).then(r=>{
    if(!r.ok)throw Error('Recording index unavailable');return r.json();
  }).then(rows=>phraseIndex(Object.entries(rows))).catch(err=>{indexPromise=null;throw err;});
  return indexPromise;
}
async function recording([pack,offset,length,bank=collection],signal) {
  const compact=bank==='garage-frames';
  const url=new URL(bank+'-'+pack+(compact?'.bin':'.opus'),directory);
  const restore=async data=>compact?restoreVoiceFrames(new Uint8Array(await data.arrayBuffer())):data;
  if(wholeFiles.has(url.href))return restore(wholeFiles.get(url.href).slice(offset,offset+length));
  const response=await fetch(url,{headers:{Range:'bytes='+offset+'-'+(offset+length-1)},signal});
  if(response.status!==200&&response.status!==206)throw Error('Recording unavailable');
  const data=await response.blob();
  if(response.status===206){if(data.size!==length)throw Error('Incomplete recording');return restore(data);}
  if(offset+length>data.size)throw Error('Incomplete recording');
  // Simple local HTTP servers may return the full bank in response to a range request.
  if(wholeFiles.size>=3)wholeFiles.delete(wholeFiles.keys().next().value);
  wholeFiles.set(url.href,data);return restore(data.slice(offset,offset+length));
}
async function playRecordings(lines,ticket,signal) {
  const index=await loadIndex();if(ticket!==session)return;
  const playlist=[];
  for(const line of lines){const matches=recordedRanges(line,index);if(!matches)throw Error('missing');playlist.push(...matches);}
  if(!playlist.length)throw Error('missing');
  for(const range of playlist) {
    if(ticket!==session)return;
    const blob=await recording(range,signal);if(ticket!==session)return;
    await playBlob(blob,ticket,signal);
  }
}
function playBlob(blob,ticket,signal){
  if(ticket!==session||signal.aborted)return Promise.resolve();
  if(mediaUrl)URL.revokeObjectURL(mediaUrl);
  mediaUrl=URL.createObjectURL(blob);media.src=mediaUrl;
  return new Promise((resolve,reject)=>{
    const done=error=>{signal.removeEventListener('abort',aborted);media.onended=media.onerror=null;error?reject(error):resolve();};
    const aborted=()=>done();signal.addEventListener('abort',aborted,{once:true});
    media.onended=()=>done();media.onerror=()=>done(Error('Audio playback failed'));
    media.play().catch(done);
  });
}

function sentences(text) {
  const fragments=text.match(/.{1,210}(?:[.!?;:]\s+|,\s+|\s+|$)|\S+/gu)||[text];
  return fragments.map(x=>x.trim()).filter(Boolean);
}
function playNative(voice,lines,ticket,signal) {
  const queued=lines.flatMap(line=>sentences(spokenText(line)));
  return new Promise((resolve,reject)=>{
    let startedTimer;
    const aborted=()=>{clearTimeout(startedTimer);resolve();};
    signal.addEventListener('abort',aborted,{once:true});
    function finish(error){clearTimeout(startedTimer);signal.removeEventListener('abort',aborted);utterance=null;error?reject(error):resolve();}
    function next(){
      if(ticket!==session||signal.aborted||!queued.length){finish();return;}
      utterance=new SpeechSynthesisUtterance(queued.shift());utterance.voice=voice;utterance.lang='en-US';
      utterance.rate=.94;utterance.pitch=.85;utterance.onend=()=>{clearTimeout(startedTimer);next();};utterance.onerror=()=>finish(Error('Local speaker unavailable'));
      startedTimer=setTimeout(()=>{if(!utterance)return;utterance.onend=utterance.onerror=null;window.speechSynthesis.cancel();finish(Error('Local speaker did not start'));},1800);
      utterance.onstart=()=>clearTimeout(startedTimer);
      window.speechSynthesis.speak(utterance);
    }
    next();
  });
}
async function play(button,target) {
  stop();const ticket=session;
  const lines=phrases(target);active={button,target,snapshot:lines.join('\n')};fetcher=new AbortController();const signal=fetcher.signal;
  updateButton(button,target,true);
  // Unlock this media element within the original tap, before fetching a recording on iOS.
  media.src='data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQQAAAAAAAAA';
  media.play().catch(()=>{});
  try {
    const neural=document.querySelector('meta[name="playground-narration"]')?.content!=='recorded';
    if(neural){
      try{
        const {playGarageVoice}=await import('../garage/voice/player.js');
        let announced=false;
        await playGarageVoice(lines,signal,blob=>{
          if(statusElement)statusElement.textContent='';
          return playBlob(blob,ticket,signal);
        },()=>{
          if(!announced){announced=true;report('Preparing the narrator on this device…');}
        });
        if(ticket===session)stop();
        return;
      }catch{
        if(ticket!==session)return;
        const backup=localNarrator(window.speechSynthesis?.getVoices()||[]);
        if(!backup){
          if(collection==='garage'||document.querySelector('meta[name="playground-neural-voice"]'))throw Error('voice-runtime');
          await playRecordings(lines,ticket,signal);if(ticket===session)stop();return;
        }
        report('Using the device’s US English voice.');await playNative(backup,lines,ticket,signal);
        if(ticket===session)stop();return;
      }
    }
    const voice=localNarrator(window.speechSynthesis?.getVoices()||[]);
    if(voice){try{await playNative(voice,lines,ticket,signal);if(ticket===session)stop();return;}catch{if(ticket!==session)return;}}
    await playRecordings(lines,ticket,signal);
    if(ticket===session)stop();
  } catch(err) {
    if(ticket!==session)return;stop();
    report(err.message==='voice-runtime'?'The narrator could not load. Check the connection or open the complete project download.':err.message==='missing'?'This passage needs a local US English voice on this device.':'The narration could not play. Try the speaker again.');
  }
}

function scan(root) {
  if(!(root instanceof Element)||root.matches(hidden)||root.closest('[data-listening]'))return;
  if(root.matches(targets))add(root);
  for(const el of root.querySelectorAll(targets))add(el);
  const panel=root.matches('#workbench')?root:root.querySelector('#workbench');if(panel)add(panel);
}
const pending=new Set();let queued=false;
function schedule(root) {
  if(!root || root.closest('[data-listening],svg,canvas,script,style'))return;
  pending.add(root);
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{
    queued=false;
    if(active && (!active.button.isConnected || !active.target.getClientRects().length || active.snapshot!==phrases(active.target).join('\n')))stop();
    for(const el of pending){if(el.isConnected)scan(el);}pending.clear();
  });
}
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('narration.css',import.meta.url).href;document.head.append(style);
scan(document.body);
new MutationObserver(records=>{
  for(const record of records){
    const parent=record.target.nodeType===1?record.target:record.target.parentElement;
    if(parent?.closest('#vehicle-canvas,.bf-canvas,.art-canvas'))continue;
    if(!parent||parent.closest('[data-listening],svg,canvas,script,style'))continue;
    if(record.type==='attributes'){if(!parent.hidden) schedule(parent);continue;}
    if(record.type==='characterData'){schedule(parent.closest(targets)||parent);continue;}
    for(const el of record.addedNodes){
      if(el.nodeType===1){if(!el.matches('[data-listening]'))schedule(el);}
      else if(el.nodeType===3)schedule(parent.closest(targets)||parent);
    }
    if(active && !active.button.isConnected)stop();
  }
}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
window.addEventListener('pagehide',stop);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)stop();});
