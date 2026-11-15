// Kitten TTS Nano 0.8 uses the text length to select its 256-value voice embedding.
export function speechChunks(text,limit=160){
  const chunks=[];
  const sentences=text.trim().split(/(?<=[.!?])\s+/u).filter(Boolean);
  for(const sentence of sentences){
    let chunk='';
    for(const word of sentence.trim().split(/\s+/)){
      if(chunk&&chunk.length+word.length+1>limit){
        chunks.push(chunk.replace(/[,;:]?$/,','));chunk='';
      }
      chunk+=(chunk?' ':'')+word;
    }
    if(chunk)chunks.push(/[.!?,:;]$/.test(chunk)?chunk:chunk+'.');
  }
  return chunks;
}
export function inputTokens(phonemes,vocabulary){
  const words=phonemes.join(' ').match(/[\p{L}\p{N}_]+|[^\p{L}\p{N}_\s]/gu)||[];
  const ids=[0];
  for(const symbol of words.join(' '))if(Object.hasOwn(vocabulary,symbol))ids.push(vocabulary[symbol]);
  ids.push(0);return BigInt64Array.from(ids,BigInt);
}
export function pcmWave(samples,rate=24000){
  const data=new ArrayBuffer(44+samples.length*2),dv=new DataView(data);
  const write=(at,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(at+i,s.charCodeAt(i));};
  write(0,'RIFF');dv.setUint32(4,data.byteLength-8,true);write(8,'WAVEfmt ');
  dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);
  write(36,'data');dv.setUint32(40,samples.length*2,true);
  for(let i=0;i<samples.length;i++)dv.setInt16(44+i*2,Math.max(-32768,Math.min(32767,Math.round(samples[i]*32767))),true);
  return new Blob([data],{type:'audio/wav'});
}
