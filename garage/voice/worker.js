import * as ort from './runtime/ort.wasm.min.mjs';
import {phonemize} from './runtime/phonemizer.mjs';
import {inputTokens} from './speech.js';

ort.env.wasm.numThreads=1;
ort.env.wasm.proxy=false;
ort.env.wasm.wasmPaths=new URL('./runtime/',import.meta.url).href;
let loading;
async function resource(name){
  const response=await fetch(new URL('./runtime/'+name,import.meta.url));
  if(!response.ok)throw Error('Voice resource unavailable');
  return response;
}
async function loadVoice(){
  const [session,styles,vocabulary]=await Promise.all([
    ort.InferenceSession.create(new URL('./runtime/bruno-model.onnx',import.meta.url).href,{executionProviders:['wasm']}),
    resource('bruno-style.bin').then(r=>r.arrayBuffer()).then(b=>new Float32Array(b)),
    resource('vocabulary.json').then(r=>r.json())
  ]);
  return {session,styles,vocabulary};
}
self.onmessage=async({data:{id,text}})=>{
  try{
    const {session,styles,vocabulary}=await (loading??=loadVoice().catch(error=>{loading=null;throw error;}));
    const ids=inputTokens(await phonemize(text,'en-us'),vocabulary);
    if(ids.length<3)throw Error('No spoken words');
    const ref=Math.min(text.length,styles.length/256-1);
    const inputs={input_ids:new ort.Tensor('int64',ids,[1,ids.length]),style:new ort.Tensor('float32',styles.slice(ref*256,(ref+1)*256),[1,256]),speed:new ort.Tensor('float32',new Float32Array([.8]),[1])};
    let outputs;
    try{
      outputs=await session.run(inputs);
      const wave=outputs[session.outputNames[0]].data;
      const copy=wave.slice(0,wave.length>6000?wave.length-5000:wave.length);
      self.postMessage({id,samples:copy.buffer},[copy.buffer]);
    }finally{
      for(const tensor of [...Object.values(inputs),...Object.values(outputs||{})])tensor.dispose();
    }
  }catch(error){self.postMessage({id,error:String(error.message||error)});}
};
