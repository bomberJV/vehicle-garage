import {voiceKey,spokenText} from '../../shared/narration-voice.js';
import {speechChunks,pcmWave} from './speech.js';

const base=new URL('./',import.meta.url);
const banks=new Map();
let clips,worker,jobId=0,workerJob,chain=Promise.resolve();
const generated=new Map();
function abortError(){return new DOMException('Stopped','AbortError');}
function requireActive(signal){if(signal.aborted)throw abortError();}
function generate(text,signal){
  requireActive(signal);
  const cached=generated.get(text);
  if(cached)return Promise.resolve(cached);
  const run=async()=>{
    requireActive(signal);
    if(!worker){
      worker=new Worker(new URL('worker.js',base),{type:'module'});
      worker.onmessage=({data})=>{
        if(!workerJob||data.id!==workerJob.id)return;
        const job=workerJob;workerJob=null;
        if(data.error)job.reject(Error(data.error));else job.resolve(pcmWave(new Float32Array(data.samples)));
      };
      worker.onerror=()=>{worker?.terminate();worker=null;const job=workerJob;workerJob=null;job?.reject(Error('Voice engine unavailable'));};
    }
    return new Promise((resolve,reject)=>{
      const id=++jobId;
      const aborted=()=>{
        if(workerJob?.id!==id)return;
        worker?.terminate();worker=null;workerJob=null;reject(abortError());
      };
      const settle=callback=>value=>{signal.removeEventListener('abort',aborted);callback(value);};
      workerJob={id,resolve:settle(resolve),reject:settle(reject)};
      signal.addEventListener('abort',aborted,{once:true});worker.postMessage({id,text});
    }).then(blob=>{
      if(generated.size>=12)generated.delete(generated.keys().next().value);
      generated.set(text,blob);requireActive(signal);return blob;
    });
  };
  const next=chain.then(run,run);chain=next.catch(()=>{});return next;
}
async function clipIndex(){
  if(!clips)clips=fetch(new URL('recordings.json',base)).then(r=>r.ok?r.json():{}).catch(()=>({}));
  return clips;
}
export async function playGarageVoice(lines,signal,playBlob,onLoad){
  const recordings=await clipIndex();
  for(const line of lines){
    requireActive(signal);
    const key=voiceKey(line),range=recordings[key];
    if(range){
      const [pack,offset,length]=range,url=new URL('recordings-'+pack+'.opus',base);
      let blob=banks.get(url.href)?.slice(offset,offset+length);
      if(!blob){
        const response=await fetch(url,{headers:{Range:'bytes='+offset+'-'+(offset+length-1)},signal});
        if(response.ok){
          blob=await response.blob();
          if(response.status===200){
            if(banks.size>=2)banks.delete(banks.keys().next().value);
            banks.set(url.href,blob);blob=blob.slice(offset,offset+length);
          }
        }
      }
      if(blob?.size===length){requireActive(signal);await playBlob(new Blob([blob],{type:'audio/ogg; codecs=opus'}));continue;}
    }
    onLoad();
    for(const text of speechChunks(spokenText(line))){
      const blob=await generate(text,signal);requireActive(signal);await playBlob(blob);
    }
  }
}
