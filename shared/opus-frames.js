// Rewrap the original 60 ms mono SILK frames from a compact downloadable bank.
// The online player receives ordinary Ogg clips and never needs this path.
const crcTable=Uint32Array.from({length:256},(_,i)=>{
  let value=i<<24;
  for(let bit=0;bit<8;bit++)value=value&0x80000000?(value<<1)^0x04c11db7:value<<1;
  return value>>>0;
});
function page(seq,flags,granule,lengths,payload){
  const out=new Uint8Array(27+lengths.length+payload.length),view=new DataView(out.buffer);
  out.set([79,103,103,83,0,flags]);view.setUint32(6,granule,true);
  view.setUint32(14,0x5252414e,true);view.setUint32(18,seq,true);
  out[26]=lengths.length;out.set(lengths,27);out.set(payload,27+lengths.length);
  let crc=0;
  for(const b of out)crc=((crc<<8)^crcTable[(crc>>>24)^b])>>>0;
  view.setUint32(22,crc,true);return out;
}
const head=page(0,2,0,[19],new Uint8Array([
  79,112,117,115,72,101,97,100,1,1,56,1,128,62,0,0,0,0,0
]));
const tags=page(1,0,0,[16],new Uint8Array([79,112,117,115,84,97,103,115,0,0,0,0,0,0,0,0]));
export function restoreVoiceFrames(bytes){
  if(bytes.length<7)throw Error('Incomplete voice frame record');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const granule=view.getUint32(0,true),count=view.getUint16(4,true);
  if(!count||count>16384||granule<=312||granule>count*2880||bytes.length<6+count)throw Error('Invalid voice frame record');
  let cursor=6+count,seq=2;
  const pages=[head,tags];
  for(let start=0;start<count;start+=128){
    const end=Math.min(count,start+128),lengths=new Uint8Array(end-start);
    let size=0;
    for(let k=start;k<end;k++){
      const length=bytes[6+k]+1;
      if(length>254)throw Error('Invalid voice packet length');
      lengths[k-start]=length;size+=length;
    }
    const payload=new Uint8Array(size);
    let dest=0;
    for(const length of lengths){
      const next=cursor+length-1;
      if(next>bytes.length)throw Error('Incomplete voice packet');
      payload[dest]=24;payload.set(bytes.subarray(cursor,next),dest+1);cursor=next;dest+=length;
    }
    pages.push(page(seq++,end===count?4:0,end===count?granule:end*2880,lengths,payload));
  }
  if(cursor!==bytes.length)throw Error('Unexpected trailing voice data');
  return new Blob(pages,{type:'audio/ogg; codecs=opus'});
}
