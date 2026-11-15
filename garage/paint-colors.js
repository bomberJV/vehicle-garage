import {PAINTS} from './catalog.js';

export function normalizeHex(value){
  if(typeof value!=='string')return null;
  const match=/^#?([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim());
  if(!match)return null;
  const digits=match[1].toLowerCase();
  return '#'+(digits.length===3?[...digits].map(digit=>digit+digit).join(''):digits);
}

export function paintChoice(value){
  const preset=PAINTS.find(option=>option.id===value);
  if(preset)return preset;
  const hex=normalizeHex(value);
  return hex?{id:hex,hex,name:hex.toUpperCase()}:PAINTS[0];
}

export function sanitizePalette(entries){
  const palette=new Map();
  for(const entry of Array.isArray(entries)?entries:[]){
    const hex=normalizeHex(entry?.hex);
    if(hex)palette.set(hex,{hex,name:(typeof entry.name==='string' && entry.name.trim().slice(0,48))||hex.toUpperCase()});
  }
  return [...palette.values()];
}
