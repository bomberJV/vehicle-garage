import {speechChunks,inputTokens,pcmWave} from '../garage/voice/speech.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {garageControlHelp,localNarrator,phraseIndex,recordedRanges,spokenText,voiceKey} from '../shared/narration-voice.js';

import {FLEET} from '../garage/fleet.js';
import {getDetail} from '../garage/detail-catalog.js';
import {ignitionEntries} from '../garage/fleet-ignition.js';
import {requestSections} from '../garage/priority-requests.js';
import {vehiclePriorities} from '../garage/priority-vehicles.js';
import {priorityLevels,workflowStatuses,trackingDefaults} from '../garage/priority-tracking.js';
const listening=new URL('../shared/listening/',import.meta.url);
test('narration keeps technical pronunciation and uses a local US male voice',()=>{
  const remote={name:'Guy',lang:'en-US',localService:false};
  const female={name:'Samantha',lang:'en-US',localService:true};
  const uk={name:'Daniel',lang:'en-GB',localService:true};
  const david={name:'Microsoft David',lang:'en-US',localService:true};
  assert.equal(localNarrator([remote,female,uk]),null);
  assert.equal(localNarrator([remote,david]),david);
  assert.match(spokenText('The HR-V CVT and the G500 V8.'),/H R V C V T.*G five hundred V eight/);
});
test('a full paragraph takes priority and incomplete audio cannot play the wrong passage',()=>{
  const entries=[['wheel',[0,1,2]],['wheel hub',[1,3,4]],['brake',[0,5,6]]];
  const index=phraseIndex(entries);
  assert.deepEqual(recordedRanges('Wheel hub. Brake.',index),[[1,3,4],[0,5,6]]);
  assert.equal(recordedRanges('Wheel hub inlet',index),null);
  assert.equal(voiceKey('gear’s teeth ↗'),"gear's teeth");
  const budget=['one','thousand','two','hundred','thirty','four','point','five','dollars'];
  const numeric=phraseIndex(budget.map((word,i)=>[word,i+1]));
  assert.deepEqual(recordedRanges('$1,234.5',numeric),budget.map((_,i)=>i+1));
  assert.equal(voiceKey('65.1%'), '65.1 percent');
});
test('the complete Garage inventory is speakable and every prepared neural clip contains Opus audio',()=>{
  const values=JSON.parse(readFileSync(new URL('garage.json',listening)));
  assert.ok(Object.values(values).every(speech=>typeof speech==='string'&&speech.trim()));
  const voice=new URL('../garage/voice/',import.meta.url);
  const prepared=JSON.parse(readFileSync(new URL('recordings.json',voice)));
  for(const label of ['deselect','return part','return all','move selected part'])assert.ok(prepared[label],label);
  const buffers=new Map();
  for(const [key,[file,offset,length]] of Object.entries(prepared)){
    assert.ok(key.trim(),key);
    if(!buffers.has(file))buffers.set(file,readFileSync(new URL('recordings-'+file+'.opus',voice)));
    const data=buffers.get(file).subarray(offset,offset+length);
    assert.equal(data.length,length);assert.equal(data.toString('ascii',0,4),'OggS');assert.ok(data.subarray(0,80).includes('OpusHead'));
  }
  const model=readFileSync(new URL('runtime/bruno-model.onnx',voice));
  assert.equal(model.length,24369971);assert.equal(readFileSync(new URL('runtime/bruno-style.bin',voice)).length,400*256*4);
  assert.ok(Object.keys(values).some(key=>key.includes('center electrode')));
  assert.ok(Object.keys(values).some(key=>key.includes('pulley')));
  assert.ok(Object.keys(values).some(key=>key.includes('lunar module')));
});

test('named ignition locations, bridge detail, and touch instructions have complete recording matches',()=>{
  const garage=JSON.parse(readFileSync(new URL('garage.json',listening)));
  for(const id of ['porsche993cab','porsche992scab','bmws1000rr']){
    for(const [,title,description] of ignitionEntries(id)){
      assert.ok(garage[voiceKey(title)],title);
      assert.ok(garage[voiceKey(description)],description);
    }
  }
  for(const text of [
    'The open flybridge puts the helm on the centerline. Three teak-backed chairs sit on a raised platform behind the console, which carries four displays.',
    'Click a part to highlight it and bring it into view. Double-click to open it. Drag a part to move it or the background to rotate. Return part puts it back.',
    'Follow the exhaust from the G500’s cylinder heads, look inside a door latch, or trace a ship’s propeller shaft back to its engine. Pick a model, then click a part or find it by name.'
  ])assert.ok(garage[voiceKey(text)],text);
});

test('the narrator reads generation numbers, turbofan designations, marine names and cabin chemistry aloud',()=>{
  const cases=[
    ['911 (993) and 992.1','nine eleven (nine ninety three) and nine ninety two point one'],
    ['A 992 Carrera','A nine ninety two Carrera'],
    ['WinGD X92-B','Winterthur Gas and Diesel X ninety two B'],
    ['GE CF6-80C2 or CF6','G E C F six eighty C two or C F six'],
    ['O₂, CO₂, LiOH, H₂O and H₂','oxygen, carbon dioxide, lithium hydroxide, water and hydrogen'],
    ['S-IC, S-II, S-IVB and H₀','S one C, S two, S four B and H naught']
  ];
  for(const [source,reading] of cases)assert.equal(spokenText(source),reading);
  assert.equal(voiceKey('O₂'),voiceKey('O2'));
});

test('published recordings cover motion controls, whole vehicles and nested motion descriptions',()=>{
  const catalog=JSON.parse(readFileSync(new URL('garage.json',listening)));
  const passages=Object.values(garageControlHelp);
  for(const model of Object.values(FLEET)){
    if(model.motion)passages.push(model.motion.description);
    for(const assembly of model.groups)if(assembly.motionDescription)passages.push(assembly.motionDescription);
  }
  const latch=getDetail('g500','door-g500-front-left.latch');
  passages.push(latch.name,latch.description,latch.motionDescription);
  for(const group of latch.groups)for(const part of group.parts)passages.push(part.name,part.description);
  for(const line of passages)assert.ok(catalog[voiceKey(line)],line);
});


test('every board priority, workflow and request or vehicle reason has an offline recording',()=>{
  const bank=JSON.parse(readFileSync(new URL('garage.json',listening)));
  const phrases=[...priorityLevels,...workflowStatuses].flatMap(item=>[item.label,item.description]);
  for(const section of requestSections)for(const item of section.items)phrases.push(trackingDefaults('request',item.id).reason);
  for(const vehicle of vehiclePriorities)phrases.push(trackingDefaults('vehicle',vehicle.id).reason);
  for(const phrase of phrases)assert.ok(bank[voiceKey(phrase)],phrase);
});

test('neural chunks preserve engine numbers and every word through long descriptions',()=>{
  const passage='The 992.1 has a 3.0-litre engine. '+('The rear axle turns. '.repeat(16))+'Return part.';
  const chunks=speechChunks(passage,65);
  assert.ok(chunks.length>2);
  assert.ok(chunks.some(c=>c.includes('992.1')&&c.includes('3.0-litre')));
  assert.equal(chunks.join(' ').match(/[\p{L}\p{N}]+/gu).join(' '),passage.match(/[\p{L}\p{N}]+/gu).join(' '));
  assert.deepEqual(speechChunks('   '),[]);
  assert.deepEqual([...inputTokens(['ðə ɡɪɹ.'],{'ð':1,'ə':2,' ':3,'ɡ':4,'ɪ':5,'ɹ':6,'.':7})],[0n,1n,2n,3n,4n,5n,6n,3n,7n,0n]);
});

test('generated PCM is playable as 24 kHz mono Wave audio',async()=>{
  const wave=pcmWave(new Float32Array([-1,0,1])),bytes=Buffer.from(await wave.arrayBuffer());
  assert.equal(wave.type,'audio/wav');assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.readUInt32LE(24),24000);assert.equal(bytes.readUInt32LE(40),6);
  assert.equal(bytes.readInt16LE(46),0);assert.equal(bytes.readInt16LE(48),32767);
});
